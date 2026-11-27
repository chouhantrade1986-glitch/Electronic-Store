const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const reviewRoute = read("backend/src/routes/productReviewRoutes.js");
const questionRoute = read("backend/src/routes/productQuestionRoutes.js");
const detail = read("product-detail.js");
const client = read("reviews.js");
const login = read("login.js");
const register = read("register.js");
const authState = read("auth-state.js");
const schema = read("backend/src/lib/sqliteStore.js");
const pii = read("backend/src/middleware/piiEncryption.js");
const html = read("product-detail.html");
assert(reviewRoute.includes("function reviewDto") && reviewRoute.includes("reviews.map(reviewDto)"));
for (const privateField of ["userId", "status"]) assert(!reviewRoute.slice(reviewRoute.indexOf("function reviewDto"), reviewRoute.indexOf("router.get")).includes(`${privateField}:`));
assert(questionRoute.includes('router.get("/:id/questions"') && questionRoute.includes('router.post("/:id/questions"'));
assert(questionRoute.includes("/:qid/answers") && questionRoute.includes("/:qid/helpful"));
assert(client.includes("submitQuestion") && client.includes("submitAnswer") && client.includes("questionHelpful"));
assert(detail.includes("summary.histogram") && detail.includes("activeReviewStarFilter, sort: activeReviewSort"));
assert(detail.includes("review_sort_highest") || html.includes('value="highest"'));
assert(detail.includes("submitQuestion(product.id") && !detail.includes('localStorage.setItem(QA_STORAGE_KEY'));
assert(authState.includes("createElectroMartSessionFromAuthResponse") && authState.includes("payload.token"));
assert(login.includes("/api/auth/otp/request") && login.includes("/api/auth/otp/verify") && !login.includes("em_token_"));
assert(register.includes("/api/auth/otp/request") && register.includes("/api/auth/otp/verify") && !register.includes("em_token_"));
for (const collection of ["productQuestions", "productAnswers", "productQuestionVotes"]) assert(schema.includes(`${collection}:`));
for (const field of ["askerName", "answererName"]) assert(pii.includes(`\"${field}\"`));
const translations = read("translations.js");
for (const lang of ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr", "ur", "pa", "gu"]) assert(translations.includes(`${lang}: [`), `Missing Phase 51 translations for ${lang}`);
assert(html.includes('value="highest"') && html.includes('value="lowest"'));
const storage = new Map();
const authWindow = { dispatchEvent() {}, location: { href: "" } };
vm.runInNewContext(authState, {
  window: authWindow,
  document: { querySelectorAll: () => [], querySelector: () => null },
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
  Event: function Event() {}, CustomEvent: function CustomEvent() {}
});
storage.set("electromart_auth_v1", JSON.stringify({ authenticated: true, token: "em_token_legacy", user: { name: "Legacy Customer" } }));
assert.equal(authWindow.ElectroMartAuth.getToken(), "");
assert.equal(JSON.parse(storage.get("electromart_auth_v1")).authMode, "local-preview");
const session = authWindow.ElectroMartAuth.createSession({ token: "signed.jwt.value", user: { id: "u-1", name: "A Customer", email: "customer@example.test", role: "customer" } }, "customer@example.test");
authWindow.ElectroMartAuth.persistSession(session);
assert.equal(JSON.parse(storage.get("electromart_auth_v1")).token, "signed.jwt.value");
console.log("PASS: Phase 51 review privacy, server ratings/Q&A, auth persistence, SQLite, and i18n contract");
