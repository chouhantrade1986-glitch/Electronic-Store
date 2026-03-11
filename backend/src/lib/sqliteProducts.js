const { getSqliteDb, isSqliteProviderEnabled } = require("./sqliteStore");

function isSqliteProductQueriesEnabled() {
  return isSqliteProviderEnabled();
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseProductRow(row) {
  if (!row || !row.json) {
    return null;
  }
  return JSON.parse(String(row.json || "{}"));
}

function productValues(product) {
  const item = product && typeof product === "object" ? product : {};
  return [
    String(item.sku || "").toUpperCase(),
    String(item.name || ""),
    String(item.brand || ""),
    String(item.category || "").toLowerCase(),
    String(item.status || "").toLowerCase(),
    String(item.segment || "").toLowerCase(),
    asNumber(item.price, 0),
    asNumber(item.stock, 0),
    String(item.updatedAt || ""),
    JSON.stringify(item)
  ];
}

function nextProductOrdinal(db) {
  const row = db.prepare("SELECT COALESCE(MAX(ordinal), -1) + 1 AS nextOrdinal FROM products").get();
  return Math.max(0, Number(row && row.nextOrdinal ? row.nextOrdinal : 0));
}

function listSqliteProducts(filters = {}) {
  const db = getSqliteDb();
  let sql = "SELECT json FROM products WHERE 1=1";
  const params = [];

  const status = String(filters.status || "all").trim().toLowerCase();
  if (status && status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }

  const segment = String(filters.segment || "all").trim().toLowerCase();
  if (segment && segment !== "all") {
    sql += " AND segment = ?";
    params.push(segment);
  }

  const brand = String(filters.brand || "all").trim();
  if (brand && brand !== "all") {
    sql += " AND lower(brand) = ?";
    params.push(brand.toLowerCase());
  }

  const minPrice = Number(filters.minPrice);
  if (Number.isFinite(minPrice) && minPrice > 0) {
    sql += " AND price >= ?";
    params.push(minPrice);
  }

  const maxPrice = Number(filters.maxPrice);
  if (Number.isFinite(maxPrice) && maxPrice < Number.MAX_SAFE_INTEGER) {
    sql += " AND price <= ?";
    params.push(maxPrice);
  }

  sql += " ORDER BY ordinal ASC";
  return db.prepare(sql).all(...params).map(parseProductRow).filter(Boolean);
}

function getSqliteProductById(productId) {
  const db = getSqliteDb();
  const row = db.prepare("SELECT json FROM products WHERE id = ? LIMIT 1").get(String(productId || ""));
  return parseProductRow(row);
}

function listSqliteProductsByIds(ids = []) {
  const normalizedIds = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id)).filter(Boolean))];
  if (!normalizedIds.length) {
    return [];
  }
  const db = getSqliteDb();
  const placeholders = normalizedIds.map(() => "?").join(", ");
  const rows = db.prepare(`SELECT json FROM products WHERE id IN (${placeholders}) ORDER BY ordinal ASC`).all(...normalizedIds);
  return rows.map(parseProductRow).filter(Boolean);
}

function findSqliteProductBySku(sku, excludeId = "") {
  const normalizedSku = String(sku || "").trim().toUpperCase();
  if (!normalizedSku) {
    return null;
  }
  const db = getSqliteDb();
  const excluded = String(excludeId || "").trim();
  const row = excluded
    ? db.prepare("SELECT json FROM products WHERE sku = ? AND id != ? LIMIT 1").get(normalizedSku, excluded)
    : db.prepare("SELECT json FROM products WHERE sku = ? LIMIT 1").get(normalizedSku);
  return parseProductRow(row);
}

function insertSqliteProduct(product) {
  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    const ordinal = nextProductOrdinal(db);
    db.prepare(
      "INSERT INTO products (id, ordinal, sku, name, brand, category, status, segment, price, stock, updated_at, json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(String(product.id || ""), ordinal, ...productValues(product));
    db.exec("COMMIT");
    return product;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function updateSqliteProduct(product) {
  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    const result = db.prepare(
      "UPDATE products SET sku = ?, name = ?, brand = ?, category = ?, status = ?, segment = ?, price = ?, stock = ?, updated_at = ?, json = ? WHERE id = ?"
    ).run(...productValues(product), String(product.id || ""));
    db.exec("COMMIT");
    return Number(result && result.changes ? result.changes : 0);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function updateSqliteProducts(products = []) {
  const items = Array.isArray(products) ? products : [];
  if (!items.length) {
    return 0;
  }
  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    const statement = db.prepare(
      "UPDATE products SET sku = ?, name = ?, brand = ?, category = ?, status = ?, segment = ?, price = ?, stock = ?, updated_at = ?, json = ? WHERE id = ?"
    );
    let affected = 0;
    items.forEach((product) => {
      const result = statement.run(...productValues(product), String(product.id || ""));
      affected += Number(result && result.changes ? result.changes : 0);
    });
    db.exec("COMMIT");
    return affected;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function deleteSqliteProductById(productId) {
  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    const result = db.prepare("DELETE FROM products WHERE id = ?").run(String(productId || ""));
    db.exec("COMMIT");
    return Number(result && result.changes ? result.changes : 0);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function deleteSqliteProductsByIds(ids = []) {
  const normalizedIds = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id)).filter(Boolean))];
  if (!normalizedIds.length) {
    return 0;
  }
  const db = getSqliteDb();
  db.exec("BEGIN IMMEDIATE TRANSACTION");
  try {
    const placeholders = normalizedIds.map(() => "?").join(", ");
    const result = db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...normalizedIds);
    db.exec("COMMIT");
    return Number(result && result.changes ? result.changes : 0);
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

module.exports = {
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
};
