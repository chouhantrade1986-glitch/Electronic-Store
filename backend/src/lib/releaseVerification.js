function asPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function resolveReleaseVerificationConfig(env = process.env, overrides = {}) {
  const apiBaseUrl = String(
    overrides.apiBaseUrl
    || env.RELEASE_VERIFY_API_BASE_URL
    || env.PUBLIC_API_BASE_URL
    || "http://127.0.0.1:4000/api"
  ).trim().replace(/\/+$/, "");

  return {
    apiBaseUrl,
    maxAttempts: asPositiveInteger(
      overrides.maxAttempts !== undefined ? overrides.maxAttempts : env.RELEASE_VERIFY_MAX_ATTEMPTS,
      5
    ),
    retryMs: asPositiveInteger(
      overrides.retryMs !== undefined ? overrides.retryMs : env.RELEASE_VERIFY_RETRY_MS,
      5000
    ),
    requestTimeoutMs: asPositiveInteger(
      overrides.requestTimeoutMs !== undefined ? overrides.requestTimeoutMs : env.RELEASE_VERIFY_REQUEST_TIMEOUT_MS,
      5000
    )
  };
}

function buildCheck(name, passed, details = {}) {
  return {
    name,
    passed: passed === true,
    details: details && typeof details === "object" ? details : {}
  };
}

function evaluateReleaseVerification(healthSnapshot = {}, metricsSnapshot = {}) {
  const checks = [];

  checks.push(buildCheck("health-ok", healthSnapshot && healthSnapshot.ok === true, {
    status: String(healthSnapshot && healthSnapshot.status ? healthSnapshot.status : "")
  }));

  const datastoreHealthy = Boolean(
    healthSnapshot
    && healthSnapshot.dependencies
    && healthSnapshot.dependencies.datastore
    && healthSnapshot.dependencies.datastore.healthy === true
  );
  checks.push(buildCheck("health-datastore", datastoreHealthy, {
    provider: String(
      healthSnapshot
      && healthSnapshot.dependencies
      && healthSnapshot.dependencies.datastore
      && healthSnapshot.dependencies.datastore.provider
        ? healthSnapshot.dependencies.datastore.provider
        : ""
    )
  }));

  const authHealthy = Boolean(
    healthSnapshot
    && healthSnapshot.dependencies
    && healthSnapshot.dependencies.auth
    && healthSnapshot.dependencies.auth.healthy === true
  );
  checks.push(buildCheck("health-auth", authHealthy));

  const schedulerHealthy = Boolean(
    healthSnapshot
    && healthSnapshot.dependencies
    && healthSnapshot.dependencies.schedulers
    && healthSnapshot.dependencies.schedulers.orderReservation
    && healthSnapshot.dependencies.schedulers.orderReservation.healthy === true
  );
  checks.push(buildCheck("health-order-reservation-scheduler", schedulerHealthy));

  const processStartedAt = String(
    metricsSnapshot
    && metricsSnapshot.process
    && metricsSnapshot.process.startedAt
      ? metricsSnapshot.process.startedAt
      : ""
  ).trim();
  checks.push(buildCheck("metrics-process-started", Boolean(processStartedAt), {
    startedAt: processStartedAt
  }));

  const requestTotal = Number(
    metricsSnapshot
    && metricsSnapshot.requests
    && metricsSnapshot.requests.total !== undefined
      ? metricsSnapshot.requests.total
      : NaN
  );
  checks.push(buildCheck("metrics-request-total", Number.isFinite(requestTotal) && requestTotal >= 0, {
    total: Number.isFinite(requestTotal) ? requestTotal : null
  }));

  const generatedAt = String(metricsSnapshot && metricsSnapshot.generatedAt ? metricsSnapshot.generatedAt : "").trim();
  checks.push(buildCheck("metrics-generated-at", Boolean(generatedAt), {
    generatedAt
  }));

  return {
    passed: checks.every((item) => item.passed),
    checks
  };
}

async function requestJson(url, dependencies, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await dependencies.fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const text = await response.text();
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      payload = { raw: text };
    }

    if (!response.ok) {
      const requestError = new Error(`Request failed with status ${response.status} for ${url}`);
      requestError.status = response.status;
      requestError.payload = payload;
      throw requestError;
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyReleaseHealth(config, options = {}) {
  const dependencies = {
    fetch: options.fetch || global.fetch,
    wait: options.wait || ((delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs)))
  };

  if (typeof dependencies.fetch !== "function") {
    throw new Error("Fetch API is unavailable for release verification.");
  }

  let lastError = null;
  let lastReport = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
    try {
      const [healthSnapshot, metricsSnapshot] = await Promise.all([
        requestJson(`${config.apiBaseUrl}/health`, dependencies, config.requestTimeoutMs),
        requestJson(`${config.apiBaseUrl}/metrics`, dependencies, config.requestTimeoutMs)
      ]);
      const evaluation = evaluateReleaseVerification(healthSnapshot, metricsSnapshot);
      lastReport = {
        passed: evaluation.passed,
        attempts: attempt,
        apiBaseUrl: config.apiBaseUrl,
        healthSnapshot,
        metricsSnapshot,
        checks: evaluation.checks
      };

      if (evaluation.passed) {
        return lastReport;
      }

      lastError = new Error("Release verification checks failed.");
    } catch (error) {
      lastError = error;
    }

    if (attempt < config.maxAttempts) {
      await dependencies.wait(config.retryMs);
    }
  }

  return {
    passed: false,
    attempts: config.maxAttempts,
    apiBaseUrl: config.apiBaseUrl,
    checks: lastReport && Array.isArray(lastReport.checks) ? lastReport.checks : [],
    healthSnapshot: lastReport ? lastReport.healthSnapshot : null,
    metricsSnapshot: lastReport ? lastReport.metricsSnapshot : null,
    error: lastError ? {
      message: String(lastError.message || "Release verification failed."),
      status: lastError.status || null
    } : {
      message: "Release verification failed.",
      status: null
    }
  };
}

module.exports = {
  evaluateReleaseVerification,
  resolveReleaseVerificationConfig,
  verifyReleaseHealth
};
