const express = require("express");
const { readDb, writeDb, withWriteLock } = require("../lib/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { createMemoryRateLimiter } = require("../middleware/rateLimitMiddleware");
const {
  getWalletBalanceForUser,
  listGiftCardsForUser,
  redeemGiftCard
} = require("../lib/giftCards");
const { logError } = require("../lib/logger");

const router = express.Router();
const redemptionLimiter = createMemoryRateLimiter({
  namespace: "gift-card-redemption",
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Too many gift card redemption attempts. Please wait before trying again."
});

router.get("/my", requireAuth, (req, res) => {
  const db = readDb();
  return res.json({ giftCards: listGiftCardsForUser(db, req.user.id) });
});

router.get("/balance", requireAuth, (req, res) => {
  const db = readDb();
  return res.json({ balance: getWalletBalanceForUser(db, req.user.id) });
});

router.post("/redeem", requireAuth, redemptionLimiter, async (req, res) => {
  const claimCode = String(req.body && req.body.claimCode || "");
  try {
    const result = await withWriteLock(async () => {
      const db = readDb();
      const redemption = redeemGiftCard(db, req.user.id, claimCode);
      if (!redemption.ok) {
        return redemption;
      }
      writeDb(db);
      return redemption;
    });

    if (!result.ok) {
      return res.status(result.status || 400).json({ message: result.message || "Unable to redeem gift card." });
    }
    return res.json({ amount: result.amount, balance: result.balance });
  } catch (error) {
    logError("gift_card_redemption_failed", {
      userId: req.user.id,
      message: error && error.message ? error.message : String(error)
    }, { requestId: req.requestId });
    return res.status(500).json({ message: "Gift card redemption could not be completed. Please try again." });
  }
});

module.exports = router;
