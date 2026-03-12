const PROCESS_STARTED_AT_MS = Date.now();
const PROCESS_STARTED_AT = new Date(PROCESS_STARTED_AT_MS).toISOString();
const REQUEST_WINDOW_MS = 5 * 60 * 1000;

const state = {
  totalRequests: 0,
  totalErrors: 0,
  totalDurationMs: 0,
  maxDurationMs: 0,
  statusCodeCounts: new Map(),
  routeCounts: new Map(),
  recentRequestTimestamps: [],
  recentErrorTimestamps: []
};

function isLikelyIdToken(value) {
  const token = String(value || "").trim();
  if (!token) {
    return false;
  }
  if (/^\d+$/.test(token)) {
    return true;
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return true;
  }
  if (token.length >= 16 && /^[a-z0-9_-]+$/i.test(token)) {
    return true;
  }
  return false;
}

function normalizeRoutePath(value) {
  const source = String(value || "").split("?")[0].trim();
  if (!source) {
    return "/";
  }
  const normalized = source
    .split("/")
    .map((segment) => {
      const token = String(segment || "").trim();
      if (!token) {
        return "";
      }
      return isLikelyIdToken(token) ? ":id" : token;
    })
    .join("/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function purgeOldSamples(samples, nowMs) {
  const cutoff = nowMs - REQUEST_WINDOW_MS;
  while (samples.length > 0 && samples[0] < cutoff) {
    samples.shift();
  }
}

function incrementCount(map, key) {
  const normalizedKey = String(key || "").trim() || "unknown";
  map.set(normalizedKey, Number(map.get(normalizedKey) || 0) + 1);
}

function mapToObject(map, limit = 50) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .reduce((accumulator, [key, count]) => {
      accumulator[key] = count;
      return accumulator;
    }, {});
}

function countSince(samples, cutoffMs) {
  let count = 0;
  for (let index = samples.length - 1; index >= 0; index -= 1) {
    if (samples[index] < cutoffMs) {
      break;
    }
    count += 1;
  }
  return count;
}

function recordHttpRequest(payload = {}) {
  const nowMs = Date.now();
  const method = String(payload.method || "GET").trim().toUpperCase() || "GET";
  const route = normalizeRoutePath(payload.path);
  const routeKey = `${method} ${route}`;
  const statusCode = Number(payload.statusCode || 0);
  const durationMs = Math.max(0, Number(payload.durationMs || 0));

  state.totalRequests += 1;
  state.totalDurationMs += durationMs;
  state.maxDurationMs = Math.max(state.maxDurationMs, durationMs);
  incrementCount(state.routeCounts, routeKey);
  incrementCount(state.statusCodeCounts, Number.isFinite(statusCode) && statusCode > 0 ? String(statusCode) : "unknown");

  state.recentRequestTimestamps.push(nowMs);
  purgeOldSamples(state.recentRequestTimestamps, nowMs);

  if (statusCode >= 500 || statusCode === 0) {
    state.totalErrors += 1;
    state.recentErrorTimestamps.push(nowMs);
    purgeOldSamples(state.recentErrorTimestamps, nowMs);
  } else {
    purgeOldSamples(state.recentErrorTimestamps, nowMs);
  }
}

function getMetricsSnapshot() {
  const nowMs = Date.now();
  purgeOldSamples(state.recentRequestTimestamps, nowMs);
  purgeOldSamples(state.recentErrorTimestamps, nowMs);

  const requestsLastMinute = countSince(state.recentRequestTimestamps, nowMs - 60 * 1000);
  const requestsLastFiveMinutes = state.recentRequestTimestamps.length;
  const errorsLastFiveMinutes = state.recentErrorTimestamps.length;
  const avgDurationMs = state.totalRequests > 0
    ? Number((state.totalDurationMs / state.totalRequests).toFixed(2))
    : 0;
  const errorRateLastFiveMinutes = requestsLastFiveMinutes > 0
    ? Number(((errorsLastFiveMinutes / requestsLastFiveMinutes) * 100).toFixed(2))
    : 0;

  return {
    generatedAt: new Date(nowMs).toISOString(),
    process: {
      startedAt: PROCESS_STARTED_AT,
      uptimeSeconds: Math.max(0, Math.round(Number(process.uptime()) || 0)),
      pid: process.pid,
      memory: process.memoryUsage()
    },
    requests: {
      total: state.totalRequests,
      errors: state.totalErrors,
      lastMinute: requestsLastMinute,
      lastFiveMinutes: requestsLastFiveMinutes,
      perMinuteAverageLastFiveMinutes: Number((requestsLastFiveMinutes / 5).toFixed(2)),
      errorRateLastFiveMinutes,
      duration: {
        averageMs: avgDurationMs,
        maxMs: Number(state.maxDurationMs.toFixed(2))
      }
    },
    breakdown: {
      statusCodes: mapToObject(state.statusCodeCounts),
      topRoutes: mapToObject(state.routeCounts, 25)
    }
  };
}

function resetMonitoringStateForTesting() {
  state.totalRequests = 0;
  state.totalErrors = 0;
  state.totalDurationMs = 0;
  state.maxDurationMs = 0;
  state.statusCodeCounts.clear();
  state.routeCounts.clear();
  state.recentRequestTimestamps.length = 0;
  state.recentErrorTimestamps.length = 0;
}

module.exports = {
  getMetricsSnapshot,
  normalizeRoutePath,
  recordHttpRequest,
  resetMonitoringStateForTesting
};
