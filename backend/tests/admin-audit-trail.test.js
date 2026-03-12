const test = require("node:test");
const assert = require("node:assert/strict");

const {
  appendAdminAuditEntry,
  ensureAdminAuditTrailCollection,
  listAdminAuditTrail,
  summarizeAdminAuditTrail
} = require("../src/lib/adminAuditTrail");

test("appendAdminAuditEntry stores newest audit entries first", () => {
  const db = { adminAuditTrail: [] };

  appendAdminAuditEntry(db, {
    category: "catalog",
    actionKey: "product_created",
    actionLabel: "Product created",
    createdAt: "2026-03-09T08:00:00.000Z",
    summary: "Created product A."
  });
  appendAdminAuditEntry(db, {
    category: "order",
    actionKey: "order_status_updated",
    actionLabel: "Order status updated",
    createdAt: "2026-03-09T09:00:00.000Z",
    summary: "Updated order status."
  });

  const entries = ensureAdminAuditTrailCollection(db);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].category, "order");
  assert.equal(entries[1].category, "catalog");
});

test("listAdminAuditTrail filters by category and search", () => {
  const db = {
    adminAuditTrail: [
      {
        category: "refund",
        actionLabel: "Refund updated",
        summary: "Refunded order EM-1",
        actorEmail: "ops@example.com",
        createdAt: "2026-03-09T09:00:00.000Z"
      },
      {
        category: "catalog",
        actionLabel: "Product updated",
        summary: "Updated product SKU-1",
        actorEmail: "ops@example.com",
        createdAt: "2026-03-09T08:00:00.000Z"
      }
    ]
  };

  const categoryOnly = listAdminAuditTrail(db, { category: "refund" });
  assert.equal(categoryOnly.filteredCount, 1);
  assert.equal(categoryOnly.entries[0].category, "refund");

  const searchOnly = listAdminAuditTrail(db, { search: "sku-1" });
  assert.equal(searchOnly.filteredCount, 1);
  assert.equal(searchOnly.entries[0].category, "catalog");
});

test("summarizeAdminAuditTrail returns category counts and recent count", () => {
  const now = new Date().toISOString();
  const summary = summarizeAdminAuditTrail([
    { category: "admin", createdAt: now },
    { category: "order", createdAt: now },
    { category: "order", createdAt: now },
    { category: "refund", createdAt: now },
    { category: "catalog", createdAt: "2026-01-01T00:00:00.000Z" }
  ]);

  assert.equal(summary.total, 5);
  assert.equal(summary.categoryCounts.admin, 1);
  assert.equal(summary.categoryCounts.order, 2);
  assert.equal(summary.categoryCounts.refund, 1);
  assert.equal(summary.categoryCounts.catalog, 1);
  assert.equal(summary.recent24h >= 4, true);
});
