const express = require("express");
const { randomUUID } = require("crypto");
const { readDb, writeDb } = require("../lib/db");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { appendAdminAuditEntry, ensureAdminAuditTrailCollection } = require("../lib/adminAuditTrail");
const {
  deleteSqliteProductById,
  deleteSqliteProductsByIds,
  findSqliteProductBySku,
  getSqliteProductById,
  insertSqliteProduct,
  isSqliteProductQueriesEnabled,
  listSqliteProducts,
  listSqliteProductsByIds,
  updateSqliteProduct,
  updateSqliteProducts
} = require("../lib/sqliteProducts");
const {
  ensureBackInStockCollections,
  createBackInStockRequest,
  dispatchBackInStockNotifications,
  unsubscribeBackInStockRequestByToken
} = require("../lib/backInStock");

const router = express.Router();

const ALLOWED_STATUS = new Set(["active", "draft", "inactive"]);
const ALLOWED_FULFILLMENT = new Set(["fba", "fbm"]);

function recordAdminAudit(db, req, entry = {}) {
  ensureAdminAuditTrailCollection(db);
  return appendAdminAuditEntry(db, {
    actorId: req && req.user && req.user.id ? req.user.id : "",
    actorEmail: req && req.user && req.user.email ? req.user.email : "",
    actorName: req && req.user && req.user.name ? req.user.name : "",
    requestId: req && req.requestId ? req.requestId : "",
    ip: String(req && req.ip ? req.ip : "").split(",")[0].trim(),
    ...entry
  });
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSku(value) {
  if (!value) {
    return `EM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  return String(value).trim().toUpperCase().replace(/\s+/g, "-");
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

function normalizeCategoryToken(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  if (raw === "accessories") {
    return "accessory";
  }
  return raw.replace(/[\s_]+/g, "-");
}

function normalizeCollectionValues(value, fallbackCategory = "") {
  const list = Array.isArray(value)
    ? value
    : String(value || "").split(/[;|,]+/);
  const normalized = list
    .map((item) => normalizeCategoryToken(item))
    .filter(Boolean)
    .filter((item) => item !== "all" && item !== "all-products");
  const fallback = normalizeCategoryToken(fallbackCategory);
  if (fallback && !normalized.includes(fallback)) {
    normalized.unshift(fallback);
  }
  return [...new Set(normalized)].slice(0, 8);
}

function productCategoryTokens(product) {
  return normalizeCollectionValues(product && product.collections, product && product.category);
}

function isLaptopFamilyToken(token) {
  const value = normalizeCategoryToken(token);
  if (!value) {
    return false;
  }
  if (["laptop", "all-laptop", "touch-laptop", "ryzen-laptops", "renewed-laptops", "business-laptop"].includes(value)) {
    return true;
  }
  return /^(acer|asus|dell|hp|lenovo)-laptop$/.test(value);
}

function categoryMatchesSelection(selectedCategory, productTokens) {
  if (selectedCategory === "all") {
    return true;
  }
  const tokens = Array.isArray(productTokens)
    ? productTokens.map((item) => normalizeCategoryToken(item))
    : [];
  if (tokens.includes(selectedCategory)) {
    return true;
  }
  if (selectedCategory === "all-laptop") {
    return tokens.some(isLaptopFamilyToken);
  }
  if (selectedCategory === "laptop") {
    return tokens.includes("laptop") || tokens.some(isLaptopFamilyToken);
  }
  const brandLaptopMatch = selectedCategory.match(/^([a-z0-9]+)-laptop$/);
  if (brandLaptopMatch) {
    const brandToken = brandLaptopMatch[1];
    return (tokens.includes("laptop") && tokens.includes(brandToken)) || tokens.includes(selectedCategory);
  }
  return false;
}

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/") || raw.startsWith("data:video/")) {
    return raw;
  }

  let normalized = raw;
  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();

    if (host.includes("drive.google.com")) {
      const fileId = url.searchParams.get("id") || url.pathname.split("/d/")[1]?.split("/")[0];
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }

    if (host.includes("dropbox.com")) {
      url.searchParams.delete("dl");
      url.searchParams.set("raw", "1");
      return url.toString();
    }

    return url.toString();
  } catch (error) {
    return "";
  }
}

function inferMediaType(src) {
  const value = String(src || "").trim().toLowerCase();
  if (!value) {
    return "";
  }
  if (value.startsWith("data:image/")) {
    return "image";
  }
  if (value.startsWith("data:video/")) {
    return "video";
  }
  if (/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(?:[?#]|$)/i.test(value)) {
    return "video";
  }
  return "image";
}

function normalizeImages(images, fallbackImage = "") {
  const fromArray = Array.isArray(images) ? images : [];
  const list = fromArray
    .map((item) => normalizeImageUrl(item))
    .filter((item) => inferMediaType(item) === "image")
    .filter(Boolean)
    .slice(0, 15);

  const primary = normalizeImageUrl(fallbackImage);
  if (primary && !list.includes(primary)) {
    list.unshift(primary);
  }
  return list.slice(0, 15);
}

function normalizeVideos(videos = []) {
  return (Array.isArray(videos) ? videos : [])
    .map((item) => normalizeImageUrl(item))
    .filter((item) => inferMediaType(item) === "video")
    .filter(Boolean)
    .slice(0, 15);
}

function normalizeMedia(media = [], images = [], videos = []) {
  const merged = [
    ...(Array.isArray(media) ? media : []),
    ...(Array.isArray(images) ? images : []),
    ...(Array.isArray(videos) ? videos : [])
  ]
    .map((item) => normalizeImageUrl(item))
    .filter(Boolean)
    .slice(0, 15);
  return [...new Set(merged)].slice(0, 15);
}

function normalizeProductPayload(payload = {}, existing = null) {
  const normalizedCategory = normalizeCategoryToken(payload.category ?? existing?.category ?? "");
  const normalizedCollections = normalizeCollectionValues(payload.collections ?? existing?.collections ?? [], normalizedCategory);
  const resolvedCategory = normalizedCategory || normalizedCollections[0] || "other";
  const existingImage = normalizeImageUrl(existing?.image);
  const payloadImage = normalizeImageUrl(payload.image);
  const resolvedPrimaryImage = inferMediaType(payloadImage) === "image"
    ? payloadImage
    : (inferMediaType(existingImage) === "image" ? existingImage : "");
  const normalizedImages = normalizeImages(payload.images ?? existing?.images ?? [], resolvedPrimaryImage);
  const normalizedVideos = normalizeVideos(payload.videos ?? existing?.videos ?? []);
  const normalizedMedia = normalizeMedia(
    payload.media ?? existing?.media ?? [],
    normalizedImages,
    normalizedVideos
  );
  const mediaImageFallback = normalizedMedia.find((item) => inferMediaType(item) === "image") || "";

  const normalized = {
    id: existing ? existing.id : randomUUID(),
    name: String(payload.name ?? existing?.name ?? "").trim(),
    brand: String(payload.brand ?? existing?.brand ?? "").trim(),
    category: resolvedCategory,
    collections: normalizedCollections,
    segment: String(payload.segment ?? existing?.segment ?? "b2c").trim(),
    price: asNumber(payload.price ?? existing?.price, 0),
    listPrice: asNumber(payload.listPrice ?? existing?.listPrice ?? payload.price ?? existing?.price, 0),
    rating: asNumber(payload.rating ?? existing?.rating, 0),
    stock: asNumber(payload.stock ?? existing?.stock, 0),
    image: normalizedImages[0] || mediaImageFallback || resolvedPrimaryImage,
    images: normalizedImages,
    videos: normalizedVideos,
    media: normalizedMedia,
    moq: asNumber(payload.moq ?? existing?.moq, 0),
    sku: normalizeSku(payload.sku ?? existing?.sku),
    status: String(payload.status ?? existing?.status ?? "active").toLowerCase(),
    fulfillment: String(payload.fulfillment ?? existing?.fulfillment ?? "fbm").toLowerCase(),
    featured: Boolean(payload.featured ?? existing?.featured ?? false),
    description: String(payload.description ?? existing?.description ?? "").trim(),
    keywords: normalizeKeywords(payload.keywords ?? existing?.keywords),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!ALLOWED_STATUS.has(normalized.status)) {
    normalized.status = "active";
  }
  if (!ALLOWED_FULFILLMENT.has(normalized.fulfillment)) {
    normalized.fulfillment = "fbm";
  }
  if (normalized.listPrice <= 0) {
    normalized.listPrice = normalized.price;
  }
  if (normalized.listPrice < normalized.price) {
    normalized.listPrice = normalized.price;
  }

  return normalized;
}

router.get("/", (req, res) => {
  const {
    search = "",
    category = "all",
    segment = "all",
    brand = "all",
    minPrice = "0",
    maxPrice = String(Number.MAX_SAFE_INTEGER),
    rating = "0",
    sort = "relevance",
    status = "active"
  } = req.query;

  const query = String(search).toLowerCase().trim();
  const normalizedCategoryFilter = normalizeCategoryToken(category);
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || Number.MAX_SAFE_INTEGER;
  const minRating = Number(rating) || 0;

  const baseProducts = isSqliteProductQueriesEnabled()
    ? listSqliteProducts({
      segment,
      brand,
      minPrice: min,
      maxPrice: max,
      status
    })
    : readDb().products;

  let products = baseProducts.filter((product) => {
    const keywords = Array.isArray(product.keywords) ? product.keywords.join(" ").toLowerCase() : "";
    const queryMatch = !query
      || String(product.name || "").toLowerCase().includes(query)
      || String(product.brand || "").toLowerCase().includes(query)
      || String(product.sku || "").toLowerCase().includes(query)
      || keywords.includes(query);
    const categoryMatch = categoryMatchesSelection(normalizedCategoryFilter, productCategoryTokens(product));
    const segmentMatch = segment === "all" || (product.segment || "b2c") === segment;
    const brandMatch = brand === "all" || product.brand === brand;
    const statusMatch = status === "all" || String(product.status || "active") === status;
    const priceMatch = asNumber(product.price) >= min && asNumber(product.price) <= max;
    const ratingMatch = Number(product.rating || 0) >= minRating;
    return queryMatch && categoryMatch && segmentMatch && brandMatch && statusMatch && priceMatch && ratingMatch;
  });

  if (sort === "price_asc") {
    products = products.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    products = products.sort((a, b) => b.price - a.price);
  } else if (sort === "rating_desc") {
    products = products.sort((a, b) => b.rating - a.rating);
  }

  return res.json({ count: products.length, products });
});

router.post("/bulk", requireAuth, requireAdmin, (req, res) => {
  const { ids = [], action = "", collections = [] } = req.body || {};
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ message: "ids array is required" });
  }

  const allowedActions = new Set([
    "set_status_active",
    "set_status_draft",
    "set_status_inactive",
    "set_fulfillment_fba",
    "set_fulfillment_fbm",
    "set_featured_true",
    "set_featured_false",
    "set_collections",
    "add_collections",
    "clear_collections",
    "delete"
  ]);
  if (!allowedActions.has(String(action))) {
    return res.status(400).json({ message: "Invalid bulk action" });
  }
  const normalizedCollectionsInput = normalizeCollectionValues(collections, "");
  if ((action === "set_collections" || action === "add_collections") && !normalizedCollectionsInput.length) {
    return res.status(400).json({ message: "collections are required for selected bulk action" });
  }

  const idSet = new Set(ids.map((id) => String(id)));
  let affected = 0;

  if (action === "delete") {
    if (isSqliteProductQueriesEnabled()) {
      affected = deleteSqliteProductsByIds([...idSet]);
    } else {
      const db = readDb();
      const originalCount = db.products.length;
      db.products = db.products.filter((product) => !idSet.has(String(product.id)));
      affected = originalCount - db.products.length;
      recordAdminAudit(db, req, {
        category: "catalog",
        actionKey: "catalog_bulk_delete",
        actionLabel: "Catalog bulk delete",
        entityType: "product_bulk",
        entityId: action,
        status: "success",
        summary: `Deleted ${affected} product(s) from catalog.`,
        targetIds: ids.map((id) => String(id)),
        details: {
          action,
          affected
        }
      });
      writeDb(db);
      return res.json({ affected, action });
    }

    const db = readDb();
    recordAdminAudit(db, req, {
      category: "catalog",
      actionKey: "catalog_bulk_delete",
      actionLabel: "Catalog bulk delete",
      entityType: "product_bulk",
      entityId: action,
      status: "success",
      summary: `Deleted ${affected} product(s) from catalog.`,
      targetIds: ids.map((id) => String(id)),
      details: {
        action,
        affected
      }
    });
    writeDb(db);
    return res.json({ affected, action });
  }

  const sourceProducts = isSqliteProductQueriesEnabled()
    ? listSqliteProductsByIds([...idSet])
    : readDb().products.filter((product) => idSet.has(String(product.id)));

  const updatedProducts = sourceProducts.map((product) => {
    affected += 1;
    const updated = { ...product, updatedAt: new Date().toISOString() };
    if (action.startsWith("set_status_")) {
      updated.status = action.replace("set_status_", "");
    } else if (action.startsWith("set_fulfillment_")) {
      updated.fulfillment = action.replace("set_fulfillment_", "");
    } else if (action === "set_featured_true") {
      updated.featured = true;
    } else if (action === "set_featured_false") {
      updated.featured = false;
    } else if (action === "set_collections") {
      updated.collections = normalizeCollectionValues(normalizedCollectionsInput, updated.category || product.category || "");
    } else if (action === "add_collections") {
      const existingCollections = normalizeCollectionValues(updated.collections || product.collections || [], updated.category || product.category || "");
      updated.collections = normalizeCollectionValues([...existingCollections, ...normalizedCollectionsInput], updated.category || product.category || "");
    } else if (action === "clear_collections") {
      updated.collections = normalizeCollectionValues([], updated.category || product.category || "");
    }
    return updated;
  });

  if (isSqliteProductQueriesEnabled()) {
    updateSqliteProducts(updatedProducts);
  } else {
    const db = readDb();
    db.products = db.products.map((product) => {
      const replacement = updatedProducts.find((item) => item.id === product.id);
      return replacement || product;
    });
    recordAdminAudit(db, req, {
      category: "catalog",
      actionKey: "catalog_bulk_update",
      actionLabel: "Catalog bulk update",
      entityType: "product_bulk",
      entityId: action,
      status: "success",
      summary: `Applied ${action} on ${affected} product(s).`,
      targetIds: ids.map((id) => String(id)),
      details: {
        action,
        affected,
        collections: normalizedCollectionsInput
      }
    });
    writeDb(db);
    return res.json({ affected, action });
  }

  const db = readDb();
  recordAdminAudit(db, req, {
    category: "catalog",
    actionKey: "catalog_bulk_update",
    actionLabel: "Catalog bulk update",
    entityType: "product_bulk",
    entityId: action,
    status: "success",
    summary: `Applied ${action} on ${affected} product(s).`,
    targetIds: ids.map((id) => String(id)),
    details: {
      action,
      affected,
      collections: normalizedCollectionsInput
    }
  });
  writeDb(db);
  return res.json({ affected, action });
});

router.post("/:id/clone", requireAuth, requireAdmin, (req, res) => {
  const source = isSqliteProductQueriesEnabled()
    ? getSqliteProductById(req.params.id)
    : readDb().products.find((item) => item.id === req.params.id);
  if (!source) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cloned = normalizeProductPayload(
    {
      ...source,
      name: `${source.name} Copy`,
      sku: undefined,
      status: "draft",
      featured: false
    },
    null
  );

  const duplicateSku = isSqliteProductQueriesEnabled()
    ? Boolean(findSqliteProductBySku(cloned.sku))
    : readDb().products.some((item) => String(item.sku || "").toUpperCase() === cloned.sku);
  if (duplicateSku) {
    cloned.sku = normalizeSku();
  }

  if (isSqliteProductQueriesEnabled()) {
    insertSqliteProduct(cloned);
  } else {
    const db = readDb();
    db.products.push(cloned);
    recordAdminAudit(db, req, {
      category: "catalog",
      actionKey: "product_cloned",
      actionLabel: "Product cloned",
      entityType: "product",
      entityId: cloned.id,
      summary: `Cloned product ${source.name} into draft copy ${cloned.name}.`,
      details: {
        sourceProductId: source.id,
        sourceSku: source.sku || "",
        clonedSku: cloned.sku || "",
        status: cloned.status
      }
    });
    writeDb(db);
    return res.status(201).json(cloned);
  }

  const db = readDb();
  recordAdminAudit(db, req, {
    category: "catalog",
    actionKey: "product_cloned",
    actionLabel: "Product cloned",
    entityType: "product",
    entityId: cloned.id,
    summary: `Cloned product ${source.name} into draft copy ${cloned.name}.`,
    details: {
      sourceProductId: source.id,
      sourceSku: source.sku || "",
      clonedSku: cloned.sku || "",
      status: cloned.status
    }
  });
  writeDb(db);
  return res.status(201).json(cloned);
});

router.get("/:id", (req, res) => {
  const product = isSqliteProductQueriesEnabled()
    ? getSqliteProductById(req.params.id)
    : readDb().products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(product);
});

router.post("/:id/back-in-stock-request", (req, res) => {
  const db = readDb();
  ensureBackInStockCollections(db);
  const product = isSqliteProductQueriesEnabled()
    ? getSqliteProductById(req.params.id)
    : db.products.find((item) => String(item.id) === String(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const currentStock = Number(product.stock || 0);
  if (currentStock > 0) {
    return res.status(409).json({ message: "Product is already in stock." });
  }

  const result = createBackInStockRequest(db, product, {
    ...req.body,
    source: "product-page"
  });
  if (!result.ok) {
    return res.status(result.status || 400).json({ message: result.message || "Unable to save request." });
  }

  writeDb(db);
  return res.status(result.duplicate ? 200 : 201).json({
    duplicate: Boolean(result.duplicate),
    message: result.duplicate
      ? "You are already subscribed for this product."
      : "Back in stock request saved. We will notify you by email.",
    request: result.request
  });
});

router.get("/back-in-stock/unsubscribe", (req, res) => {
  const db = readDb();
  ensureBackInStockCollections(db);
  const result = unsubscribeBackInStockRequestByToken(db, req.query && req.query.token ? req.query.token : "");
  if (!result.ok) {
    const message = result.message || "Unable to unsubscribe this request.";
    if (req.accepts(["json", "html"]) === "json") {
      return res.status(result.status || 400).json({ message });
    }
    return res.status(result.status || 400).type("html").send(`
      <html><body style="font-family:Arial,sans-serif;padding:24px">
        <h2>Unsubscribe Failed</h2>
        <p>${message}</p>
      </body></html>
    `);
  }
  writeDb(db);
  const message = result.already
    ? "You were already unsubscribed from this product alert."
    : "You have been unsubscribed from this product alert.";
  if (req.accepts(["json", "html"]) === "json") {
    return res.json({ message, request: result.request });
  }
  return res.type("html").send(`
    <html><body style="font-family:Arial,sans-serif;padding:24px">
      <h2>Unsubscribed Successfully</h2>
      <p>${message}</p>
    </body></html>
  `);
});

router.post("/", requireAuth, requireAdmin, (req, res) => {
  const product = normalizeProductPayload(req.body || {});
  if (!product.name || !product.brand || !product.category || !Number.isFinite(product.price) || product.price <= 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const duplicateSku = isSqliteProductQueriesEnabled()
    ? Boolean(findSqliteProductBySku(product.sku))
    : readDb().products.some((item) => String(item.sku || "").toUpperCase() === product.sku);
  if (duplicateSku) {
    return res.status(409).json({ message: "SKU already exists" });
  }

  if (isSqliteProductQueriesEnabled()) {
    insertSqliteProduct(product);
  } else {
    const db = readDb();
    db.products.push(product);
    recordAdminAudit(db, req, {
      category: "catalog",
      actionKey: "product_created",
      actionLabel: "Product created",
      entityType: "product",
      entityId: product.id,
      summary: `Created product ${product.name}.`,
      details: {
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock,
        status: product.status
      }
    });
    writeDb(db);
    return res.status(201).json(product);
  }

  const db = readDb();
  recordAdminAudit(db, req, {
    category: "catalog",
    actionKey: "product_created",
    actionLabel: "Product created",
    entityType: "product",
    entityId: product.id,
    summary: `Created product ${product.name}.`,
    details: {
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status
    }
  });
  writeDb(db);
  return res.status(201).json(product);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const existing = isSqliteProductQueriesEnabled()
    ? getSqliteProductById(req.params.id)
    : (() => {
      const db = readDb();
      return db.products.find((item) => item.id === req.params.id) || null;
    })();
  if (!existing) {
    return res.status(404).json({ message: "Product not found" });
  }

  const previousStock = Number(existing.stock || 0);
  const updated = normalizeProductPayload(req.body || {}, existing);
  if (!updated.name || !updated.brand || !updated.category || !Number.isFinite(updated.price) || updated.price <= 0) {
    return res.status(400).json({ message: "Invalid product payload" });
  }

  const duplicateSku = isSqliteProductQueriesEnabled()
    ? Boolean(findSqliteProductBySku(updated.sku, req.params.id))
    : readDb().products.some((item) => item.id !== req.params.id && String(item.sku || "").toUpperCase() === updated.sku);
  if (duplicateSku) {
    return res.status(409).json({ message: "SKU already exists" });
  }

  if (isSqliteProductQueriesEnabled()) {
    updateSqliteProduct(updated);
  } else {
    const db = readDb();
    ensureBackInStockCollections(db);
    const index = db.products.findIndex((item) => item.id === req.params.id);
    db.products[index] = updated;
    let backInStock = { matched: 0, sent: 0, queued: 0, failed: 0 };
    if (previousStock <= 0 && Number(updated.stock || 0) > 0) {
      try {
        backInStock = await dispatchBackInStockNotifications(db, updated, {
          triggeredBy: "stock-update",
          triggeredFrom: "admin-product-update"
        });
      } catch (error) {
        backInStock = { matched: 0, sent: 0, queued: 0, failed: 1, error: String(error && error.message ? error.message : "Notification dispatch failed.") };
      }
    }
    recordAdminAudit(db, req, {
      category: "catalog",
      actionKey: "product_updated",
      actionLabel: "Product updated",
      entityType: "product",
      entityId: updated.id,
      summary: `Updated product ${updated.name}.`,
      details: {
        sku: updated.sku,
        category: updated.category,
        previousStock,
        stock: updated.stock,
        previousStatus: existing.status || "",
        status: updated.status,
        backInStock
      }
    });
    writeDb(db);
    return res.json({
      ...updated,
      backInStock
    });
  }

  const db = readDb();
  ensureBackInStockCollections(db);
  let backInStock = { matched: 0, sent: 0, queued: 0, failed: 0 };
  if (previousStock <= 0 && Number(updated.stock || 0) > 0) {
    try {
      backInStock = await dispatchBackInStockNotifications(db, updated, {
        triggeredBy: "stock-update",
        triggeredFrom: "admin-product-update"
      });
    } catch (error) {
      backInStock = { matched: 0, sent: 0, queued: 0, failed: 1, error: String(error && error.message ? error.message : "Notification dispatch failed.") };
    }
  }
  recordAdminAudit(db, req, {
    category: "catalog",
    actionKey: "product_updated",
    actionLabel: "Product updated",
    entityType: "product",
    entityId: updated.id,
    summary: `Updated product ${updated.name}.`,
    details: {
      sku: updated.sku,
      category: updated.category,
      previousStock,
      stock: updated.stock,
      previousStatus: existing.status || "",
      status: updated.status,
      backInStock
    }
  });
  writeDb(db);
  return res.json({
    ...updated,
    backInStock
  });
});

router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  let deleted = 0;
  if (isSqliteProductQueriesEnabled()) {
    deleted = deleteSqliteProductById(req.params.id);
  } else {
    const db = readDb();
    const filtered = db.products.filter((item) => item.id !== req.params.id);
    if (filtered.length === db.products.length) {
      return res.status(404).json({ message: "Product not found" });
    }
    db.products = filtered;
    recordAdminAudit(db, req, {
      category: "catalog",
      actionKey: "product_deleted",
      actionLabel: "Product deleted",
      entityType: "product",
      entityId: req.params.id,
      summary: `Deleted product ${req.params.id} from catalog.`,
      details: {
        productId: req.params.id
      }
    });
    writeDb(db);
    return res.status(204).send();
  }

  if (deleted === 0) {
    return res.status(404).json({ message: "Product not found" });
  }
  const db = readDb();
  recordAdminAudit(db, req, {
    category: "catalog",
    actionKey: "product_deleted",
    actionLabel: "Product deleted",
    entityType: "product",
    entityId: req.params.id,
    summary: `Deleted product ${req.params.id} from catalog.`,
    details: {
      productId: req.params.id
    }
  });
  writeDb(db);
  return res.status(204).send();
});

module.exports = router;
