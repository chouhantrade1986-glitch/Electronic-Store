const express = require("express");
const { randomUUID } = require("crypto");
const { readDb, writeDb } = require("../lib/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router({ mergeParams: true });
const clean = (value, max) => String(value || "").replace(/<[^>]*>/g, "").trim().slice(0, max);
function ensure(db) {
  if (!Array.isArray(db.productQuestions)) db.productQuestions = [];
  if (!Array.isArray(db.productAnswers)) db.productAnswers = [];
  if (!Array.isArray(db.productQuestionVotes)) db.productQuestionVotes = [];
}
function questionDto(db, item) {
  const votes = db.productQuestionVotes.filter(v => String(v.questionId) === String(item.id));
  return {
    id: String(item.id), question: String(item.question || ""), askerName: String(item.askerName || "ElectroMart Customer"),
    createdAt: String(item.createdAt || ""), helpfulCount: votes.filter(v => v.helpful !== false).length,
    unhelpfulCount: votes.filter(v => v.helpful === false).length,
    answers: db.productAnswers.filter(a => String(a.questionId) === String(item.id) && a.status !== "hidden")
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
      .map(a => ({ id: String(a.id), answer: String(a.answer || ""), answererName: String(a.answererName || "ElectroMart Customer"), createdAt: String(a.createdAt || "") }))
  };
}
function validProduct(db, id) { return Array.isArray(db.products) && db.products.some(p => String(p.id) === String(id)); }

router.get("/:id/questions", (req, res) => {
  const db = readDb(); ensure(db);
  if (!validProduct(db, req.params.id)) return res.status(404).json({ message: "Product not found." });
  const query = clean(req.query.q, 120).toLocaleLowerCase();
  const questions = db.productQuestions.filter(q => String(q.productId) === String(req.params.id) && q.status !== "hidden")
    .filter(q => !query || String(q.question || "").toLocaleLowerCase().includes(query))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(item => questionDto(db, item));
  return res.json({ questions });
});

router.post("/:id/questions", requireAuth, (req, res) => {
  const question = clean(req.body && req.body.question, 1200);
  if (question.length < 8) return res.status(400).json({ message: "Enter a question with at least 8 characters." });
  const db = readDb(); ensure(db);
  if (!validProduct(db, req.params.id)) return res.status(404).json({ message: "Product not found." });
  const record = { id: randomUUID(), productId: String(req.params.id), userId: req.user.id,
    askerName: clean(req.user.name, 80) || "ElectroMart Customer", question, status: "published", createdAt: new Date().toISOString() };
  db.productQuestions.push(record); writeDb(db);
  return res.status(201).json({ question: questionDto(db, record) });
});

router.post("/:id/questions/:qid/answers", requireAuth, (req, res) => {
  const answer = clean(req.body && req.body.answer, 2000);
  if (answer.length < 2) return res.status(400).json({ message: "Enter an answer." });
  const db = readDb(); ensure(db);
  const question = db.productQuestions.find(q => String(q.id) === String(req.params.qid) && String(q.productId) === String(req.params.id) && q.status !== "hidden");
  if (!question) return res.status(404).json({ message: "Question not found." });
  const record = { id: randomUUID(), productId: String(req.params.id), questionId: question.id, userId: req.user.id,
    answererName: clean(req.user.name, 80) || "ElectroMart Customer", answer, status: "published", createdAt: new Date().toISOString() };
  db.productAnswers.push(record); writeDb(db);
  return res.status(201).json({ answer: { id: record.id, answer: record.answer, answererName: record.answererName, createdAt: record.createdAt } });
});

router.post("/:id/questions/:qid/helpful", requireAuth, (req, res) => {
  const db = readDb(); ensure(db);
  const question = db.productQuestions.find(q => String(q.id) === String(req.params.qid) && String(q.productId) === String(req.params.id) && q.status !== "hidden");
  if (!question) return res.status(404).json({ message: "Question not found." });
  const helpful = !(req.body && req.body.helpful === false);
  let vote = db.productQuestionVotes.find(v => String(v.questionId) === String(question.id) && String(v.userId) === String(req.user.id));
  if (!vote) { vote = { id: randomUUID(), questionId: question.id, userId: req.user.id, helpful }; db.productQuestionVotes.push(vote); }
  else if (vote.helpful !== helpful) vote.helpful = helpful;
  writeDb(db);
  const result = questionDto(db, question);
  return res.json({ helpfulCount: result.helpfulCount, unhelpfulCount: result.unhelpfulCount, helpful: vote.helpful });
});

module.exports = router;
