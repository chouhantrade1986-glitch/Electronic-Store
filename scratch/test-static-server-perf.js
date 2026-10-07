const assert = require("assert");
const http = require("http");
const zlib = require("zlib");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SERVER = path.join(ROOT, "qa-static-server.js");

function startServer(port, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [SERVER, String(port)], {
      cwd: ROOT,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill();
        reject(new Error(`server on ${port} did not start in time`));
      }
    }, 8000);
    child.stdout.on("data", (chunk) => {
      if (!settled && /listening/i.test(String(chunk))) {
        settled = true;
        clearTimeout(timer);
        resolve(child);
      }
    });
    child.stderr.on("data", () => {});
    child.on("exit", (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`server on ${port} exited early with code ${code}`));
      }
    });
  });
}

function request(port, reqPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: "127.0.0.1", port, path: reqPath, headers }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks)
      }));
    });
    req.on("error", reject);
  });
}

(async function run() {
  console.log("================================================================================");
  console.log("=== Static Server Performance Test Suite (compression + caching) ===");
  console.log("================================================================================\n");

  const PORT = 5599;
  const server = await startServer(PORT);
  try {
    // 1. gzip compression on the largest text asset
    console.log("1. Testing gzip compression on translations.js...");
    const gz = await request(PORT, "/translations.js", { "accept-encoding": "gzip" });
    assert.strictEqual(gz.status, 200, "translations.js must return 200");
    assert.strictEqual(gz.headers["content-encoding"], "gzip", "response must be gzip-encoded when client accepts gzip");
    const rawSize = 1880 * 1024; // ~1.88 MB monolith
    assert.ok(gz.body.length < rawSize * 0.5, `compressed body should be well under half the raw size, got ${gz.body.length}`);
    const decoded = zlib.gunzipSync(gz.body).toString("utf8");
    assert.ok(decoded.includes("EM_TRANSLATIONS"), "decompressed payload must be the real translations.js source");
    console.log(`  ✓ gzip OK: ${(gz.body.length / 1024).toFixed(0)} KB transferred (from ~1.88 MB)`);

    // 2. brotli compression preferred when offered
    console.log("\n2. Testing brotli compression...");
    const br = await request(PORT, "/translations.js", { "accept-encoding": "br, gzip" });
    assert.strictEqual(br.headers["content-encoding"], "br", "response must prefer brotli when client offers it");
    const brDecoded = zlib.brotliDecompressSync(br.body).toString("utf8");
    assert.ok(brDecoded.includes("EM_TRANSLATIONS"), "brotli payload must decode to the real source");
    console.log(`  ✓ brotli OK: ${(br.body.length / 1024).toFixed(0)} KB transferred`);

    // 3. Cache revalidation: ETag + no-cache, and 304 on If-None-Match
    console.log("\n3. Testing cache headers + 304 revalidation...");
    const first = await request(PORT, "/index.html", {});
    assert.strictEqual(first.status, 200);
    const etag = first.headers["etag"];
    assert.ok(etag, "response must include an ETag for revalidation");
    const cc = String(first.headers["cache-control"] || "");
    assert.ok(/no-cache|max-age|must-revalidate/i.test(cc), `cache-control must allow caching/revalidation, got "${cc}"`);
    assert.ok(!/no-store/i.test(cc), "cache-control must NOT be no-store (that forces full re-download every navigation)");
    const second = await request(PORT, "/index.html", { "if-none-match": etag });
    assert.strictEqual(second.status, 304, "a matching If-None-Match must return 304 (no body re-transfer)");
    console.log(`  ✓ ETag/304 OK: cache-control="${cc}"`);

    // 4. Uncompressed identity still served when client sends no accept-encoding
    console.log("\n4. Testing identity fallback...");
    const identity = await request(PORT, "/index.html", { "accept-encoding": "identity" });
    assert.ok(!identity.headers["content-encoding"], "identity request must not be compressed");
    assert.ok(identity.body.length > 0, "identity body must be present");
    console.log("  ✓ identity fallback OK");
  } finally {
    server.kill();
  }

  // 5. QA_NO_CACHE=1 preserves the old no-store behaviour for deterministic QA
  console.log("\n5. Testing QA_NO_CACHE=1 preserves no-store...");
  const qaPort = 5598;
  const qaServer = await startServer(qaPort, { QA_NO_CACHE: "1" });
  try {
    const res = await request(qaPort, "/index.html", {});
    assert.ok(/no-store/i.test(String(res.headers["cache-control"] || "")), "QA_NO_CACHE=1 must keep Cache-Control: no-store");
    console.log("  ✓ QA_NO_CACHE=1 keeps no-store OK");
  } finally {
    qaServer.kill();
  }

  console.log("\n================================================================================");
  console.log("=== ALL STATIC SERVER PERFORMANCE TESTS PASSED (100%) ===");
  console.log("================================================================================");
})().catch((err) => {
  console.error("\n✗ FAILURE:", err && err.message ? err.message : err);
  process.exit(1);
});
