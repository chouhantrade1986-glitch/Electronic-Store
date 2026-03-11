const fs = require("fs");
const path = require("path");
const { getSqliteDb, getSqliteDbPath, closeSqliteDb } = require("../lib/sqliteStore");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const DATA_DIR = path.join(__dirname, "..", "data");
const JSON_PATH = path.join(DATA_DIR, "db.json");
const PLACEHOLDER_IMAGE = "./product-placeholder.svg";
const WIX_HOST_TOKEN = "static.wixstatic.com";
const WIX_FILE_TOKEN = "~mv2";

function nowStamp() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function isWixMediaValue(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return false;
  }
  return raw.includes(WIX_HOST_TOKEN) || raw.includes(WIX_FILE_TOKEN);
}

function isVideoValue(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return false;
  }
  if (raw.startsWith("data:video/")) {
    return true;
  }
  const clean = raw.split("?")[0].split("#")[0];
  return /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(clean);
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const raw = String(value || "").trim();
  if (!raw) {
    return [];
  }
  if (raw.includes(";") || raw.includes("|") || raw.includes(",")) {
    return raw
      .split(/[;|,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [raw];
}

function dedupe(values) {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    const key = String(value || "").trim();
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(key);
  });
  return result;
}

function sanitizeProductMedia(product) {
  if (!product || typeof product !== "object") {
    return { changed: false, removedCount: 0, next: product };
  }

  const next = { ...product };
  let removedCount = 0;

  const rawImage = String(product.image || "").trim();
  const rawImages = toList(product.images);
  const rawVideos = toList(product.videos);
  const rawMedia = toList(product.media);

  const removeWix = (value) => {
    if (isWixMediaValue(value)) {
      removedCount += 1;
      return false;
    }
    return true;
  };

  const cleanImages = dedupe(rawImages.filter(removeWix));
  const cleanVideos = dedupe(rawVideos.filter(removeWix));
  const cleanMedia = dedupe(rawMedia.filter(removeWix));

  const imageIsWix = isWixMediaValue(rawImage);
  if (imageIsWix) {
    removedCount += 1;
  }

  const imageCandidates = dedupe([
    ...cleanImages.filter((value) => !isVideoValue(value)),
    ...cleanMedia.filter((value) => !isVideoValue(value)),
    ...cleanVideos.filter((value) => !isVideoValue(value))
  ]);
  const nextImage = !imageIsWix && rawImage
    ? rawImage
    : (imageCandidates[0] || PLACEHOLDER_IMAGE);

  const originalImageList = JSON.stringify(rawImages);
  const originalVideoList = JSON.stringify(rawVideos);
  const originalMediaList = JSON.stringify(rawMedia);

  next.image = nextImage;
  next.images = cleanImages;
  next.videos = cleanVideos;
  next.media = cleanMedia;

  const changed = imageIsWix
    || nextImage !== rawImage
    || JSON.stringify(cleanImages) !== originalImageList
    || JSON.stringify(cleanVideos) !== originalVideoList
    || JSON.stringify(cleanMedia) !== originalMediaList;

  return { changed, removedCount, next };
}

function sanitizeProductList(products) {
  const source = Array.isArray(products) ? products : [];
  let productsChanged = 0;
  let urlsRemoved = 0;
  const nextProducts = source.map((item) => {
    const result = sanitizeProductMedia(item);
    if (result.changed) {
      productsChanged += 1;
    }
    urlsRemoved += result.removedCount;
    return result.next;
  });

  return {
    changed: productsChanged > 0,
    productsChanged,
    urlsRemoved,
    nextProducts
  };
}

function backupJsonSnapshot(filePath) {
  const stamp = nowStamp();
  const backupPath = `${filePath}.wix-cleanup-${stamp}.bak`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function sanitizeJsonSnapshot({ apply }) {
  if (!fs.existsSync(JSON_PATH)) {
    return {
      source: "json",
      found: false,
      applied: false,
      productsChanged: 0,
      urlsRemoved: 0
    };
  }

  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const snapshot = JSON.parse(raw);
  const result = sanitizeProductList(snapshot.products);

  if (apply && result.changed) {
    const backupPath = backupJsonSnapshot(JSON_PATH);
    snapshot.products = result.nextProducts;
    fs.writeFileSync(JSON_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    return {
      source: "json",
      found: true,
      applied: true,
      backupPath: path.relative(PROJECT_ROOT, backupPath),
      productsChanged: result.productsChanged,
      urlsRemoved: result.urlsRemoved
    };
  }

  return {
    source: "json",
    found: true,
    applied: false,
    productsChanged: result.productsChanged,
    urlsRemoved: result.urlsRemoved
  };
}

function sanitizeSqliteProducts({ apply }) {
  const dbPath = getSqliteDbPath();
  if (!fs.existsSync(dbPath)) {
    return {
      source: "sqlite",
      found: false,
      applied: false,
      productsChanged: 0,
      urlsRemoved: 0
    };
  }

  const db = getSqliteDb();
  const rows = db.prepare("SELECT id, json FROM products ORDER BY ordinal ASC").all();
  if (!rows.length) {
    return {
      source: "sqlite",
      found: true,
      applied: false,
      dbPath: path.relative(PROJECT_ROOT, dbPath),
      productsChanged: 0,
      urlsRemoved: 0
    };
  }

  let productsChanged = 0;
  let urlsRemoved = 0;
  const updates = [];

  rows.forEach((row) => {
    const parsed = JSON.parse(String(row.json || "{}"));
    const result = sanitizeProductMedia(parsed);
    if (!result.changed) {
      return;
    }
    productsChanged += 1;
    urlsRemoved += result.removedCount;
    updates.push({
      id: String(row.id || result.next.id || ""),
      json: JSON.stringify(result.next)
    });
  });

  if (apply && updates.length) {
    db.exec("BEGIN IMMEDIATE TRANSACTION");
    try {
      const statement = db.prepare("UPDATE products SET json = ? WHERE id = ?");
      updates.forEach((item) => {
        statement.run(item.json, item.id);
      });
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return {
    source: "sqlite",
    found: true,
    applied: Boolean(apply && updates.length),
    dbPath: path.relative(PROJECT_ROOT, dbPath),
    productsChanged,
    urlsRemoved
  };
}

function parseArgs(argv) {
  const flags = new Set((Array.isArray(argv) ? argv : []).map((item) => String(item || "").trim()));
  const apply = !flags.has("--dry-run");
  return { apply };
}

function run() {
  const options = parseArgs(process.argv.slice(2));
  const jsonResult = sanitizeJsonSnapshot(options);
  const sqliteResult = sanitizeSqliteProducts(options);

  const summary = {
    mode: options.apply ? "apply" : "dry-run",
    results: [jsonResult, sqliteResult]
  };

  console.log(JSON.stringify(summary, null, 2));
}

try {
  run();
} finally {
  closeSqliteDb();
}

