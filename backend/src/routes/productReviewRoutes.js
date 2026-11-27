const express = require("express");
const { randomUUID } = require("crypto");
const { readDb, writeDb } = require("../lib/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });
const clean = (value, max) => String(value || "").replace(/<[^>]*>/g, "").trim().slice(0, max);
function ensure(db) {
  if (!Array.isArray(db.productReviews)) db.productReviews = [];
  if (!Array.isArray(db.productReviewVotes)) db.productReviewVotes = [];
}
function summarize(reviews) {
  const counts = [5, 4, 3, 2, 1].map(stars => reviews.filter(r => Number(r.rating) === stars).length);
  const count = reviews.length;
  return { count, average: count ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / count : 0,
    histogram: counts.map((value, i) => ({ stars: 5 - i, count: value, percentage: count ? Math.round(value * 100 / count) : 0 })) };
}
router.get("/:id/reviews", (req, res) => {
  const db = readDb(); ensure(db);
  const id = String(req.params.id);
  let reviews = db.productReviews.filter(r => String(r.productId) === id && r.status !== "hidden");
  const star = Number(req.query.stars);
  if (star >= 1 && star <= 5) reviews = reviews.filter(r => Number(r.rating) === star);
  reviews.sort(req.query.sort === "recent"
    ? (a, b) => String(b.createdAt).localeCompare(String(a.createdAt))
    : (a, b) => Number(b.helpfulCount || 0) - Number(a.helpfulCount || 0) || String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({ reviews, summary: summarize(db.productReviews.filter(r => String(r.productId) === id && r.status !== "hidden")) });
});
router.post("/:id/reviews", requireAuth, (req, res) => {
  const rating = Number(req.body && req.body.rating);
  const headline = clean(req.body && req.body.headline, 120);
  const text = clean(req.body && req.body.text, 5000);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !headline || !text) {
    return res.status(400).json({ message: "A rating, headline, and review are required." });
  }
  const db = readDb(); ensure(db);
  const productId = String(req.params.id);
  if (!db.products.some(p => String(p.id) === productId)) return res.status(404).json({ message: "Product not found." });
  const ownsPurchase = (db.orders || []).some(order => String(order.userId) === String(req.user.id)
    && ["paid", "completed", "delivered", "fulfilled"].includes(String(order.paymentStatus || order.status).toLowerCase())
    && (order.items || order.products || []).some(item => String(item.productId || item.id) === productId));
  const review = { id: randomUUID(), productId, userId: req.user.id, reviewerName: clean(req.user.name, 80) || "ElectroMart Customer",
    rating, headline, text, verifiedPurchase: ownsPurchase, helpfulCount: 0, status: "published", createdAt: new Date().toISOString() };
  db.productReviews.push(review); writeDb(db);
  return res.status(201).json({ review, summary: summarize(db.productReviews.filter(r => String(r.productId) === productId)) });
});
router.post("/:id/reviews/:reviewId/helpful", requireAuth, (req, res) => {
  const db = readDb(); ensure(db);
  const review = db.productReviews.find(r => String(r.id) === String(req.params.reviewId) && String(r.productId) === String(req.params.id));
  if (!review) return res.status(404).json({ message: "Review not found." });
  const exists = db.productReviewVotes.some(v => v.reviewId === review.id && v.userId === req.user.id);
  if (!exists) { db.productReviewVotes.push({ reviewId: review.id, userId: req.user.id }); review.helpfulCount = Number(review.helpfulCount || 0) + 1; writeDb(db); }
  return res.json({ helpfulCount: Number(review.helpfulCount || 0), voted: true });
});
module.exports = router;
