const test = require("node:test");
const assert = require("node:assert/strict");
const previous = Object.fromEntries(["DB_PROVIDER", "JWT_SECRET", "PII_ENCRYPTION_KEY"].map(k => [k, process.env[k]]));
process.env.DB_PROVIDER = "json";
process.env.JWT_SECRET = "product-review-test-secret-2026";
process.env.PII_ENCRYPTION_KEY = "product-review-test-pii-secret-2026";
const db = require("../src/lib/db");
const originalRead = db.readDb, originalWrite = db.writeDb;
const { encryptPiiFields, decryptPiiFields } = require("../src/middleware/piiEncryption");
let fixture;
db.readDb = () => decryptPiiFields(structuredClone(fixture));
db.writeDb = value => { fixture = encryptPiiFields(structuredClone(value)); };
const express = require("express");
const { once } = require("node:events");
const { signToken } = require("../src/lib/auth");
const pii = require("../src/middleware/piiEncryption");
const { serializeDbMutations } = require("../src/middleware/writeLockMiddleware");
const routes = require("../src/routes/productReviewRoutes");
const app = express(); app.use(express.json()); app.use(pii); app.use(serializeDbMutations); app.use("/api/products", routes);
let server, base;
function reset() {
  fixture = { users: [{ id: "reviewer", name: "Review Customer", email: "reviewer@example.test", role: "customer", sessionVersion: 1 }],
    products: [{ id: "p-1" }], orders: [{ userId: "reviewer", status: "delivered", items: [{ productId: "p-1" }] }], productReviews: [], productReviewVotes: [] };
}
const token = signToken({ id: "reviewer", sessionVersion: 1 });
async function call(url, opts = {}) { return fetch(base + url, { ...opts, headers: { ...(opts.body ? { "Content-Type": "application/json" } : {}), ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}), ...opts.headers }, body: opts.body ? JSON.stringify(opts.body) : undefined }); }
test.before(async () => { reset(); server = app.listen(0, "127.0.0.1"); await once(server, "listening"); base = `http://127.0.0.1:${server.address().port}/api/products`; });
test.after(async () => { await new Promise(resolve => server.close(resolve)); db.readDb = originalRead; db.writeDb = originalWrite; for (const [k,v] of Object.entries(previous)) v === undefined ? delete process.env[k] : process.env[k] = v; });
test("review API derives verified purchase, encrypts reviewer identity, summarizes ratings, and deduplicates helpful votes", async () => {
  reset();
  assert.equal((await call("/p-1/reviews", { method: "POST", body: { rating: 5, headline: "Great", text: "Works well" } })).status, 401);
  let response = await call("/p-1/reviews", { method: "POST", token, body: { rating: 5, headline: "Great", text: "Works well", verifiedPurchase: false } });
  assert.equal(response.status, 201);
  let data = await response.json(); assert.equal(data.review.verifiedPurchase, true); assert.equal(data.review.reviewerName, "Review Customer");
  assert.match(fixture.productReviews[0].reviewerName, /^v1:/);
  response = await call("/p-1/reviews"); data = await response.json();
  assert.equal(data.summary.count, 1); assert.equal(data.summary.histogram[0].percentage, 100);
  const id = data.reviews[0].id;
  response = await call(`/p-1/reviews/${id}/helpful`, { method: "POST", token }); assert.equal((await response.json()).helpfulCount, 1);
  response = await call(`/p-1/reviews/${id}/helpful`, { method: "POST", token }); assert.equal((await response.json()).helpfulCount, 1);
});
