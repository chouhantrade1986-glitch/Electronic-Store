const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");

const sqliteStore = require("../src/lib/sqliteStore");
const {
  deleteSqliteProductById,
  findSqliteProductBySku,
  getSqliteProductById,
  insertSqliteProduct,
  listSqliteProducts,
  listSqliteProductsByIds,
  updateSqliteProduct
} = require("../src/lib/sqliteProducts");

function withTempEnv(fileName) {
  const previousProvider = process.env.DB_PROVIDER;
  const previousSqlitePath = process.env.SQLITE_DB_PATH;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "electromart-sqlite-products-"));
  const sqlitePath = path.join(tempDir, fileName);

  process.env.DB_PROVIDER = "sqlite";
  process.env.SQLITE_DB_PATH = sqlitePath;
  sqliteStore.closeSqliteDb();

  return () => {
    sqliteStore.closeSqliteDb();
    if (typeof previousProvider === "string") {
      process.env.DB_PROVIDER = previousProvider;
    } else {
      delete process.env.DB_PROVIDER;
    }
    if (typeof previousSqlitePath === "string") {
      process.env.SQLITE_DB_PATH = previousSqlitePath;
    } else {
      delete process.env.SQLITE_DB_PATH;
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
  };
}

test("sqliteProducts list/get/find uses direct product table queries", () => {
  const restore = withTempEnv("products-query.sqlite");
  try {
    sqliteStore.writeSqliteSnapshot({
      products: [
        { id: "p1", sku: "EM-P1", name: "Laptop Pro", brand: "Acme", category: "laptop", status: "active", segment: "b2c", price: 999, stock: 12, rating: 4.8 },
        { id: "p2", sku: "EM-P2", name: "Office Mouse", brand: "Acme", category: "accessory", status: "draft", segment: "b2b", price: 49, stock: 30, rating: 4.2 }
      ]
    });

    const activeProducts = listSqliteProducts({ status: "active", segment: "all", brand: "all", minPrice: 0, maxPrice: Number.MAX_SAFE_INTEGER });
    const exactProduct = getSqliteProductById("p1");
    const byIds = listSqliteProductsByIds(["p2", "p1"]);
    const bySku = findSqliteProductBySku("em-p2");

    assert.equal(activeProducts.length, 1);
    assert.equal(activeProducts[0].id, "p1");
    assert.equal(exactProduct.name, "Laptop Pro");
    assert.equal(byIds.length, 2);
    assert.equal(bySku.id, "p2");
  } finally {
    restore();
  }
});

test("sqliteProducts insert/update/delete persists product mutations", () => {
  const restore = withTempEnv("products-mutate.sqlite");
  try {
    sqliteStore.writeSqliteSnapshot({
      products: [{ id: "p1", sku: "EM-P1", name: "Laptop Pro", brand: "Acme", category: "laptop", status: "active", segment: "b2c", price: 999, stock: 12 }]
    });

    insertSqliteProduct({ id: "p2", sku: "EM-P2", name: "Keyboard", brand: "Acme", category: "accessory", status: "active", segment: "b2c", price: 79, stock: 5, updatedAt: "2026-03-09T00:00:00.000Z" });
    const updatedChanges = updateSqliteProduct({ id: "p2", sku: "EM-P2", name: "Keyboard Plus", brand: "Acme", category: "accessory", status: "inactive", segment: "b2c", price: 89, stock: 7, updatedAt: "2026-03-09T01:00:00.000Z" });
    const deleteChanges = deleteSqliteProductById("p1");
    const remaining = listSqliteProducts({});

    assert.equal(updatedChanges, 1);
    assert.equal(deleteChanges, 1);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].name, "Keyboard Plus");
    assert.equal(remaining[0].status, "inactive");
  } finally {
    restore();
  }
});
