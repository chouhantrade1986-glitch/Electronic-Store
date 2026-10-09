const DEFAULT_PATHS = ["/health", "/metrics"];
const ALLOWED_PATHS = new Set(DEFAULT_PATHS);
const MAX_REQUESTS = 1000;
const MAX_CONCURRENCY = 50;

function parsePositiveInteger(value, fallback, name, max) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new Error(`${name} must be an integer between 1 and ${max}.`);
  }
  return parsed;
}

function isLocalHostname(hostname) {
  const normalized = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost"
    || normalized === "::1"
    || normalized === "127.0.0.1"
    || normalized.endsWith(".localhost");
}

function resolveLoadTestConfig(options = {}) {
  const baseUrl = String(options.baseUrl || "http://127.0.0.1:4000/api").trim().replace(/\/+$/, "");
  let parsedUrl;
  try {
    parsedUrl = new URL(baseUrl);
  } catch (_error) {
    throw new Error("baseUrl must be an absolute HTTP or HTTPS URL.");
  }

  if (!new Set(["http:", "https:"]).has(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
    throw new Error("baseUrl must be an absolute HTTP or HTTPS URL without embedded credentials.");
  }
  if (!isLocalHostname(parsedUrl.hostname) && options.allowRemote !== true) {
    throw new Error("Remote load targets require explicit --allow-remote opt-in.");
  }

  const paths = Array.isArray(options.paths) ? options.paths : DEFAULT_PATHS;
  if (paths.length === 0 || paths.some((item) => !ALLOWED_PATHS.has(String(item)))) {
    throw new Error("paths must contain only read-only /health and /metrics endpoints.");
  }

  return {
    baseUrl,
    paths: [...paths],
    requests: parsePositiveInteger(options.requests, 100, "requests", MAX_REQUESTS),
    concurrency: parsePositiveInteger(options.concurrency, 10, "concurrency", MAX_CONCURRENCY),
    timeoutMs: parsePositiveInteger(options.timeoutMs, 5000, "timeoutMs", 60000),
    allowRemote: options.allowRemote === true
  };
}

function percentile(sortedValues, percentileValue) {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = Math.max(0, Math.ceil((percentileValue / 100) * sortedValues.length) - 1);
  return Number(sortedValues[index].toFixed(2));
}

async function runLoadTest(options = {}) {
  const config = resolveLoadTestConfig(options);
  const fetchFn = options.fetch || global.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Fetch API is unavailable for load testing.");
  }

  const latencies = [];
  const statusCodes = {};
  const errors = [];
  const startedAt = new Date().toISOString();
  const startedAtMs = Date.now();
  let nextRequestIndex = 0;
  let succeeded = 0;
  let failed = 0;

  async function worker() {
    while (true) {
      const requestIndex = nextRequestIndex;
      nextRequestIndex += 1;
      if (requestIndex >= config.requests) {
        return;
      }

      const endpoint = config.paths[requestIndex % config.paths.length];
      const controller = new AbortController();
      const requestStartedAt = Date.now();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
      try {
        const response = await fetchFn(`${config.baseUrl}${endpoint}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal
        });
        const statusCode = Number(response && response.status) || 0;
        latencies.push(Math.max(0, Date.now() - requestStartedAt));
        statusCodes[String(statusCode)] = Number(statusCodes[String(statusCode)] || 0) + 1;
        if (response && response.ok === true) {
          succeeded += 1;
        } else {
          failed += 1;
          if (errors.length < 20) {
            errors.push({ path: endpoint, statusCode, message: "HTTP response was not successful." });
          }
        }
      } catch (error) {
        failed += 1;
        latencies.push(Math.max(0, Date.now() - requestStartedAt));
        statusCodes.networkError = Number(statusCodes.networkError || 0) + 1;
        if (errors.length < 20) {
          errors.push({
            path: endpoint,
            statusCode: null,
            message: String(error && error.message ? error.message : error)
          });
        }
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  const workerCount = Math.min(config.requests, config.concurrency);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const elapsedMs = Math.max(1, Date.now() - startedAtMs);
  const sortedLatencies = [...latencies].sort((left, right) => left - right);
  return {
    passed: failed === 0,
    target: config.baseUrl,
    startedAt,
    finishedAt: new Date().toISOString(),
    config: {
      requests: config.requests,
      concurrency: config.concurrency,
      timeoutMs: config.timeoutMs,
      paths: config.paths
    },
    requests: {
      total: config.requests,
      succeeded,
      failed,
      statusCodes
    },
    latency: {
      minMs: sortedLatencies.length ? Number(sortedLatencies[0].toFixed(2)) : 0,
      averageMs: sortedLatencies.length
        ? Number((sortedLatencies.reduce((sum, value) => sum + value, 0) / sortedLatencies.length).toFixed(2))
        : 0,
      p50Ms: percentile(sortedLatencies, 50),
      p95Ms: percentile(sortedLatencies, 95),
      maxMs: sortedLatencies.length ? Number(sortedLatencies[sortedLatencies.length - 1].toFixed(2)) : 0
    },
    throughput: {
      elapsedMs,
      requestsPerSecond: Number((config.requests / (elapsedMs / 1000)).toFixed(2))
    },
    errors
  };
}

module.exports = {
  resolveLoadTestConfig,
  runLoadTest
};