function resolveFrontendApiBaseUrl(env = process.env) {
  const configuredUrl = String(env.PUBLIC_API_BASE_URL || "").trim();
  if (!configuredUrl) {
    return "/api";
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch (error) {
    throw createInvalidConfigError();
  }

  if (
    !["http:", "https:"].includes(parsedUrl.protocol) ||
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.search ||
    parsedUrl.hash ||
    !/\/api\/?$/i.test(parsedUrl.pathname)
  ) {
    throw createInvalidConfigError();
  }

  return configuredUrl.replace(/\/+$/, "");
}

function createInvalidConfigError() {
  const error = new Error("PUBLIC_API_BASE_URL must be an HTTP(S) URL ending in /api without credentials, query, or fragment.");
  error.code = "FRONTEND_API_CONFIG_INVALID";
  return error;
}

function buildFrontendConfigScript(env = process.env) {
  const config = {
    apiBaseUrl: resolveFrontendApiBaseUrl(env)
  };
  return `window.__ELECTROMART_CONFIG__ = Object.freeze(${JSON.stringify(config)});`;
}

module.exports = {
  buildFrontendConfigScript,
  resolveFrontendApiBaseUrl
};
