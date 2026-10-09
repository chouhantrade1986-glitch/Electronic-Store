const { randomUUID } = require("crypto");
const express = require("express");
const { readDb, writeDb } = require("../lib/db");
const { isSqliteOrderPaymentQueriesEnabled, writeSqliteOrderPaymentCollections } = require("../lib/sqliteOrdersPayments");
const { calculateExchangeValuation } = require("../lib/exchangeValuation");
const { requireAuth } = require("../middleware/authMiddleware");
const { createMemoryRateLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();
const QUOTE_TTL_MS = 15 * 60 * 1000;
const quoteLimiter = createMemoryRateLimiter({
  namespace: "exchange-quote",
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => String(req && req.user && req.user.id ? req.user.id : "guest"),
  message: "Too many exchange quote requests. Please try again later."
});

router.post("/quote", requireAuth, quoteLimiter, (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const targetProductId = String(body.targetProductId || "").trim();
  if (!targetProductId) {
    return res.status(400).json({ message: "targetProductId is required." });
  }

  const valuation = calculateExchangeValuation(body);
  if (!valuation.ok) {
    return res.status(400).json({ message: valuation.message });
  }

  const db = readDb();
  const product = (Array.isArray(db.products) ? db.products : []).find((entry) => String(entry.id) === targetProductId);
  if (!product || String(product.status || "active").trim().toLowerCase() !== "active") {
    return res.status(404).json({ message: "The selected purchase product is unavailable." });
  }

  const now = Date.now();
  const expiresAt = new Date(now + QUOTE_TTL_MS).toISOString();
  const discountAmount = Math.min(valuation.discountAmount, Math.max(0, Number(product.price || 0)));
  const quote = {
    id: `exq_${randomUUID()}`,
    userId: req.user.id,
    targetProductId,
    category: valuation.category,
    brand: valuation.brand,
    modelName: valuation.modelName,
    condition: {
      power: String(body.condition.power).trim().toLowerCase(),
      screen: String(body.condition.screen).trim().toLowerCase(),
      body: String(body.condition.body).trim().toLowerCase()
    },
    baseValue: valuation.baseValue,
    deduction: valuation.deduction,
    bonus: valuation.bonus,
    discountAmount,
    status: "PENDING",
    createdAt: new Date(now).toISOString(),
    expiresAt,
    usedAt: "",
    orderId: ""
  };

  db.exchangeQuotes = Array.isArray(db.exchangeQuotes) ? db.exchangeQuotes : [];
  db.exchangeQuotes = db.exchangeQuotes.filter((entry) => entry.status === "PENDING" && Date.parse(entry.expiresAt) > now);
  db.exchangeQuotes.push(quote);
  db.exchangeQuotes = db.exchangeQuotes.slice(-5000);
  if (isSqliteOrderPaymentQueriesEnabled()) {
    writeSqliteOrderPaymentCollections(db, ["exchangeQuotes"]);
  } else {
    writeDb(db);
  }

  return res.status(201).json({
    quoteId: quote.id,
    discountAmount: quote.discountAmount,
    expiresAt: quote.expiresAt
  });
});

module.exports = router;