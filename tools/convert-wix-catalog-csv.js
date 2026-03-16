const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const options = {
    input: "",
    output: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = String(argv[index] || "").trim();
    if (!token) {
      continue;
    }
    if (token === "--input" && argv[index + 1]) {
      options.input = String(argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (token.startsWith("--input=")) {
      options.input = token.slice("--input=".length).trim();
      continue;
    }
    if (token === "--output" && argv[index + 1]) {
      options.output = String(argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (token.startsWith("--output=")) {
      options.output = token.slice("--output=".length).trim();
    }
  }

  return options;
}

function detectCsvDelimiter(text) {
  const sampleLine = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0) || "";
  const commaCount = (sampleLine.match(/,/g) || []).length;
  const semicolonCount = (sampleLine.match(/;/g) || []).length;
  const tabCount = (sampleLine.match(/\t/g) || []).length;
  if (semicolonCount > commaCount && semicolonCount >= tabCount) {
    return ";";
  }
  if (tabCount > commaCount && tabCount > semicolonCount) {
    return "\t";
  }
  return ",";
}

function parseCsvText(csvText) {
  const delimiter = detectCsvDelimiter(csvText);
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      current.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      current.push(field);
      if (current.some((value) => String(value).trim() !== "")) {
        rows.push(current);
      }
      current = [];
      field = "";
      continue;
    }

    field += char;
  }

  current.push(field);
  if (current.some((value) => String(value).trim() !== "")) {
    rows.push(current);
  }

  return rows;
}

function canonicalCsvHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "");
}

function buildHeaderMap(headerRow) {
  const map = new Map();
  (headerRow || []).forEach((header, index) => {
    map.set(canonicalCsvHeader(header), index);
  });
  return map;
}

function csvValueFromRow(row, headerMap, ...candidates) {
  for (const candidate of candidates) {
    const idx = headerMap.get(canonicalCsvHeader(candidate));
    if (typeof idx === "number" && idx >= 0 && idx < row.length) {
      return String(row[idx] || "").trim();
    }
  }
  return "";
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, digits) => String.fromCharCode(Number(digits) || 32))
    .replace(/â€“|â€”/g, "-")
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€�/g, "\"")
    .replace(/Â/g, "");
}

function stripHtml(value) {
  return decodeHtmlEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(value, maxLength) {
  const text = String(value || "").trim();
  if (!maxLength || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim();
}

function parseCsvNumber(value, fallback = Number.NaN) {
  const normalized = String(value || "")
    .trim()
    .replace(/[, ]+/g, "")
    .replace(/[^\d.-]/g, "");
  if (!normalized) {
    return fallback;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseInventoryToStock(value) {
  const raw = String(value || "").trim();
  const numeric = parseCsvNumber(raw, Number.NaN);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.round(numeric));
  }
  const normalized = raw.toLowerCase();
  if (!normalized) {
    return 0;
  }
  if (normalized.includes("instock") || normalized.includes("in stock") || normalized.includes("available")) {
    return 10;
  }
  if (normalized.includes("low")) {
    return 3;
  }
  return 0;
}

function splitMultiValue(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return [];
  }
  const separator = raw.includes("|")
    ? "|"
    : (raw.includes(";") ? ";" : (raw.includes(",") ? "," : ""));
  if (!separator) {
    return [raw];
  }
  return raw
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSegment(value) {
  const normalized = stripHtml(value).toLowerCase();
  return normalized === "b2b" ? "b2b" : "b2c";
}

function normalizeCategory(value) {
  const raw = stripHtml(value).toLowerCase();
  const normalized = raw
    .replace(/&/g, " and ")
    .replace(/[’'`]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "";
}

function inferCategory({ categoryRaw, collectionParts, name }) {
  const direct = normalizeCategory(categoryRaw);
  if (direct) {
    return direct;
  }
  const source = [...collectionParts, name]
    .join(" ")
    .toLowerCase();
  if (/printer|laserjet|pixma|epson|canon/.test(source)) {
    return "printer";
  }
  if (/mobile|phone|iphone|android/.test(source)) {
    return "mobile";
  }
  if (/audio|speaker|earbud|headphone|headset|sound/.test(source)) {
    return "audio";
  }
  if (/keyboard|mouse|adapter|cable|charger|bag|accessor|dock/.test(source)) {
    return "accessory";
  }
  if (/desktop|computer|cpu|gpu|ram|motherboard|smps|cabinet/.test(source)) {
    return "computer";
  }
  return "laptop";
}

const BRAND_HINTS = [
  "HP", "Dell", "Lenovo", "Asus", "Acer", "Apple", "Canon", "Epson", "Brother",
  "Samsung", "Logitech", "Lapcare", "Sony", "Toshiba", "Intel", "AMD", "Nvidia"
];

function inferBrand({ brandRaw, name, collectionParts }) {
  const direct = clip(stripHtml(brandRaw), 120);
  if (direct) {
    return direct;
  }
  const source = `${name} ${collectionParts.join(" ")}`.toLowerCase();
  for (const hint of BRAND_HINTS) {
    if (source.includes(hint.toLowerCase())) {
      return hint;
    }
  }
  return "Generic";
}

function extractAdditionalInfoPairs(row, headerMap) {
  const pairs = [];
  for (let infoIndex = 1; infoIndex <= 6; infoIndex += 1) {
    const title = clip(stripHtml(csvValueFromRow(row, headerMap, `additionalInfoTitle${infoIndex}`)), 90);
    const body = clip(stripHtml(csvValueFromRow(row, headerMap, `additionalInfoDescription${infoIndex}`)), 650);
    if (title || body) {
      pairs.push({ title, body });
    }
  }
  return pairs;
}

function pickCompatibilityInfo({ pairs, name, sku }) {
  const normalizedPairs = Array.isArray(pairs) ? pairs : [];
  const findByPattern = (pattern) => normalizedPairs.find((pair) => pattern.test(`${pair.title} ${pair.body}`.toLowerCase()));

  const batteryPair = findByPattern(/part number|battery part|compatible battery|battery model|part no/);
  const laptopPair = findByPattern(/laptop model|compatible laptop|supported model|compatib|series|thinkpad|ideapad|aspire|macbook/);

  const batteryDesc = clip(
    (batteryPair && batteryPair.body) || (sku ? `Battery part number / SKU: ${sku}` : "Please match battery part number before purchase."),
    900
  );

  const laptopDesc = clip(
    (laptopPair && laptopPair.body) || (name ? `Model family reference: ${name}` : "Please verify laptop model compatibility before purchase."),
    900
  );

  return {
    title1: "Compatible Battery Part Numbers",
    description1: batteryDesc,
    title2: "Compatible Laptop Models",
    description2: laptopDesc
  };
}

function buildListingDescription({ baseDescription, compatibility }) {
  const intro = clip(stripHtml(baseDescription), 1700);
  const pieces = [
    intro,
    compatibility && compatibility.description1 ? `Compatible Battery Part Numbers: ${compatibility.description1}` : "",
    compatibility && compatibility.description2 ? `Compatible Laptop Models: ${compatibility.description2}` : "",
    "Please match part number and laptop model before purchase."
  ].filter(Boolean);
  return clip(Array.from(new Set(pieces)).join(" | "), 2200);
}

function normalizeWixMediaToken(value) {
  const raw = clip(stripHtml(value), 1200);
  if (!raw) {
    return "";
  }
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/") || /^data:/i.test(raw) || /^blob:/i.test(raw)) {
    return raw;
  }

  const wixMatch = raw.match(/([A-Za-z0-9._-]+~mv2\.(?:jpg|jpeg|png|webp|gif|bmp|svg|avif))/i);
  if (wixMatch) {
    return `https://static.wixstatic.com/media/${wixMatch[1]}`;
  }

  if (/^wix:image:\/\//i.test(raw)) {
    const tail = raw.split("/").pop() || "";
    const cleanTail = tail.split("#")[0].split("?")[0].trim();
    if (cleanTail) {
      return `https://static.wixstatic.com/media/${cleanTail}`;
    }
  }

  if (/^[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|gif|bmp|svg|avif)$/i.test(raw)) {
    return `https://static.wixstatic.com/media/${raw}`;
  }

  if (/^[A-Za-z0-9_-]{20,}$/.test(raw)) {
    return `https://static.wixstatic.com/media/${raw}`;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) {
    return `https://${raw}`;
  }

  return raw;
}

function deriveListPrice(price, discountMode, discountValue) {
  const mode = String(discountMode || "").trim().toLowerCase();
  const discount = parseCsvNumber(discountValue, 0);
  if (!(Number.isFinite(price) && price > 0)) {
    return 0;
  }
  if (!(Number.isFinite(discount) && discount > 0)) {
    return price;
  }
  if (mode === "amount") {
    return price + discount;
  }
  if (mode === "percentage" || mode === "percent") {
    const ratio = 1 - (discount / 100);
    if (ratio > 0 && ratio < 1) {
      return price / ratio;
    }
  }
  return price;
}

function csvEscape(value) {
  const text = String(value == null ? "" : value);
  if (!/[",\r\n]/.test(text)) {
    return text;
  }
  return `"${text.replace(/"/g, "\"\"")}"`;
}

function toCsv(rows) {
  return `${rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n")}\n`;
}

function convertFile(inputPath, outputPath) {
  const source = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsvText(source);
  if (!rows.length) {
    throw new Error("Input CSV is empty.");
  }

  const headerMap = buildHeaderMap(rows[0]);
  const outHeader = [
    "id",
    "sku",
    "name",
    "brand",
    "category",
    "collection",
    "segment",
    "price",
    "listPrice",
    "stock",
    "rating",
    "status",
    "fulfillment",
    "featured",
    "description",
    "additionalInfoTitle1",
    "additionalInfoDescription1",
    "additionalInfoTitle2",
    "additionalInfoDescription2",
    "keywords",
    "image",
    "images",
    "videos",
    "media"
  ];
  const outRows = [outHeader];

  const skuCounts = new Map();
  let totalRows = 0;
  let productRows = 0;
  let skippedVariantRows = 0;
  let skippedInvalidRows = 0;
  let missingBrandFilled = 0;
  let categoryInferred = 0;
  let htmlDescriptionCleaned = 0;
  let skuAdjusted = 0;
  let inputImageEntries = 0;
  let outputImageEntries = 0;

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row || !row.some((value) => String(value || "").trim() !== "")) {
      continue;
    }
    totalRows += 1;

    const fieldType = csvValueFromRow(row, headerMap, "fieldType", "rowType").toLowerCase();
    if (fieldType && fieldType !== "product") {
      skippedVariantRows += 1;
      continue;
    }
    productRows += 1;

    const id = clip(stripHtml(csvValueFromRow(row, headerMap, "id", "handleId", "productId")), 120) || `product_${Date.now()}_${index}`;
    const name = clip(stripHtml(csvValueFromRow(row, headerMap, "name", "product", "productName", "title")), 220);
    if (!name) {
      skippedInvalidRows += 1;
      continue;
    }

    const collectionParts = splitMultiValue(csvValueFromRow(row, headerMap, "collection"))
      .map((item) => normalizeCategory(item) || clip(stripHtml(item), 80))
      .filter(Boolean);

    const categoryRaw = csvValueFromRow(
      row,
      headerMap,
      "category",
      "productCategory",
      "product_type",
      "productType",
      "type",
      "department",
      "google_product_category",
      "googleProductCategory"
    );
    const category = inferCategory({ categoryRaw, collectionParts, name });
    if (!normalizeCategory(categoryRaw)) {
      categoryInferred += 1;
    }

    const brandRaw = csvValueFromRow(row, headerMap, "brand");
    const brand = inferBrand({ brandRaw, name, collectionParts });
    if (!clip(stripHtml(brandRaw), 120)) {
      missingBrandFilled += 1;
    }

    const price = parseCsvNumber(csvValueFromRow(row, headerMap, "price", "sellingPrice"), Number.NaN);
    if (!(Number.isFinite(price) && price > 0)) {
      skippedInvalidRows += 1;
      continue;
    }

    const listPriceRaw = parseCsvNumber(csvValueFromRow(row, headerMap, "listPrice", "list_price", "mrp", "originalPrice"), Number.NaN);
    const derivedList = deriveListPrice(
      price,
      csvValueFromRow(row, headerMap, "discountMode"),
      csvValueFromRow(row, headerMap, "discountValue")
    );
    const listPrice = Number.isFinite(listPriceRaw) && listPriceRaw > 0
      ? Math.max(listPriceRaw, price)
      : Math.max(derivedList, price);

    const inventoryValue = csvValueFromRow(row, headerMap, "inventory", "stock", "quantity");
    const stock = parseInventoryToStock(inventoryValue);
    const rating = Math.max(0, parseCsvNumber(csvValueFromRow(row, headerMap, "rating"), 0));
    const segment = normalizeSegment(csvValueFromRow(row, headerMap, "segment"));
    const visible = csvValueFromRow(row, headerMap, "visible").toLowerCase();
    const status = visible === "false" || visible === "0" ? "inactive" : "active";
    const fulfillment = "fbm";
    const ribbon = csvValueFromRow(row, headerMap, "ribbon").toLowerCase();
    const featured = ribbon.includes("new") || ribbon.includes("best") ? "true" : "false";

    const rawDescription = csvValueFromRow(row, headerMap, "description");
    const description = clip(stripHtml(rawDescription), 2200);
    if (description !== String(rawDescription || "").trim()) {
      htmlDescriptionCleaned += 1;
    }

    const additionalInfoPairs = extractAdditionalInfoPairs(row, headerMap);
    const compatibilityInfo = pickCompatibilityInfo({
      pairs: additionalInfoPairs,
      name,
      sku: csvValueFromRow(row, headerMap, "sku")
    });
    const mergedDescription = buildListingDescription({
      baseDescription: description,
      compatibility: compatibilityInfo
    });

    const mediaSource = csvValueFromRow(row, headerMap, "productImageUrl", "image", "product_image_url", "media");
    const mediaEntriesRaw = splitMultiValue(mediaSource);
    inputImageEntries += mediaEntriesRaw.length;

    const mediaEntries = mediaEntriesRaw
      .map((entry) => normalizeWixMediaToken(entry))
      .filter(Boolean)
      .slice(0, 15);
    outputImageEntries += mediaEntries.length;

    const image = mediaEntries[0] || "./product-placeholder.svg";
    const images = mediaEntries.join("|");
    const media = mediaEntries.join("|");
    const videos = "";

    let sku = clip(stripHtml(csvValueFromRow(row, headerMap, "sku")), 120);
    if (!sku) {
      sku = `SKU-${id}`;
    }
    const skuKey = sku.toUpperCase();
    const seen = Number(skuCounts.get(skuKey) || 0) + 1;
    skuCounts.set(skuKey, seen);
    if (seen > 1) {
      sku = `${sku}-${seen}`;
      skuAdjusted += 1;
    }

    const keywordPool = [
      ...collectionParts,
      brand,
      category,
      segment
    ]
      .map((entry) => clip(stripHtml(entry), 80))
      .filter(Boolean);
    const keywords = Array.from(new Set(keywordPool)).slice(0, 12).join("|");
    const collection = collectionParts.join("|");

    outRows.push([
      id,
      sku,
      name,
      brand,
      category,
      collection,
      segment,
      String(Math.round(price * 100) / 100),
      String(Math.round(listPrice * 100) / 100),
      String(stock),
      String(Math.round(rating * 10) / 10),
      status,
      fulfillment,
      featured,
      mergedDescription,
      compatibilityInfo.title1,
      compatibilityInfo.description1,
      compatibilityInfo.title2,
      compatibilityInfo.description2,
      keywords,
      image,
      images,
      videos,
      media
    ]);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, toCsv(outRows), "utf8");

  return {
    input: inputPath,
    output: outputPath,
    totalRows,
    productRows,
    convertedRows: outRows.length - 1,
    skippedVariantRows,
    skippedInvalidRows,
    missingBrandFilled,
    categoryInferred,
    htmlDescriptionCleaned,
    skuAdjusted,
    inputImageEntries,
    outputImageEntries
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.input) {
    console.error("Usage: node tools/convert-wix-catalog-csv.js --input \"C:\\path\\catalog_products.csv\" [--output \"C:\\path\\clean.csv\"]");
    process.exit(1);
  }

  const inputPath = path.resolve(options.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const outputPath = options.output
    ? path.resolve(options.output)
    : path.join(path.dirname(inputPath), `${path.basename(inputPath, path.extname(inputPath))}_clean_import.csv`);

  const result = convertFile(inputPath, outputPath);
  console.log(JSON.stringify(result, null, 2));
}

main();
