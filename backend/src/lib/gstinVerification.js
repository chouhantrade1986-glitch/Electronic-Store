const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const GST_STATE_CODES = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Old)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh"
};

function resolveGstinConfig() {
  const provider = String(process.env.GSTIN_PROVIDER || "simulated").trim().toLowerCase();
  const apiKey = String(process.env.GSTIN_API_KEY || "").trim();
  const apiUrl = String(process.env.GSTIN_API_URL || "").trim();
  const timeoutMs = Math.max(1000, Number(process.env.GSTIN_API_TIMEOUT_MS) || 5000);
  const simulatedStatus = String(process.env.GSTIN_SIMULATED_STATUS || "verified").trim().toLowerCase();

  return {
    provider,
    apiKey,
    apiUrl,
    timeoutMs,
    simulatedStatus
  };
}

function isValidGstinFormat(value) {
  const gstin = String(value || "").trim().toUpperCase();
  return GSTIN_REGEX.test(gstin);
}

function getStateFromGstin(value) {
  const gstin = String(value || "").trim().toUpperCase();
  if (gstin.length < 2) return "";
  const code = gstin.slice(0, 2);
  return GST_STATE_CODES[code] || "Unknown State";
}

function getPanFromGstin(value) {
  const gstin = String(value || "").trim().toUpperCase();
  if (gstin.length >= 12 && isValidGstinFormat(gstin)) {
    return gstin.slice(2, 12);
  }
  return "";
}

async function verifyWithSimulated(gstin, config) {
  // If explicitly flagged with CANCELLED/INVALID suffix for test fixtures
  if (gstin.endsWith("0000") || gstin.endsWith("9999")) {
    return {
      ok: false,
      status: "invalid",
      gstin,
      message: "GSTIN is not active or has been cancelled."
    };
  }

  const state = getStateFromGstin(gstin);
  const pan = getPanFromGstin(gstin);
  const targetStatus = config.simulatedStatus === "pending"
    ? "pending_external_verification"
    : "verified";

  return {
    ok: targetStatus === "verified",
    status: targetStatus,
    gstin,
    state,
    pan,
    legalName: `ElectroMart Verified Partner (${pan})`,
    tradeName: `Partner Commerce Enterprises`,
    taxpayerType: "Regular",
    registrationDate: "2017-07-01",
    provider: "simulated"
  };
}

async function verifyWithClearTax(gstin, config) {
  if (!config.apiKey) {
    return {
      ok: false,
      status: "pending_external_verification",
      gstin,
      message: "ClearTax API key is not configured. Queued for verification.",
      provider: "cleartax"
    };
  }

  const endpoint = config.apiUrl || "https://api.cleartax.in/gst/v1/taxpayer";
  const url = `${endpoint}/${encodeURIComponent(gstin)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-cleartax-auth-token": config.apiKey,
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 404 || (data && data.status === "CANCELLED")) {
      return {
        ok: false,
        status: "invalid",
        gstin,
        message: data.message || "GSTIN is cancelled or does not exist.",
        provider: "cleartax"
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: "verification_failed",
        gstin,
        message: data.message || `ClearTax service responded with error code ${response.status}`,
        provider: "cleartax"
      };
    }

    return {
      ok: true,
      status: "verified",
      gstin,
      state: getStateFromGstin(gstin),
      pan: getPanFromGstin(gstin),
      legalName: data.legalName || data.lgnm || "",
      tradeName: data.tradeName || data.tradeNam || "",
      taxpayerType: data.taxpayerType || "Regular",
      registrationDate: data.registrationDate || "",
      provider: "cleartax"
    };
  } catch (error) {
    return {
      ok: false,
      status: "verification_failed",
      gstin,
      message: error.name === "AbortError"
        ? "ClearTax request timed out."
        : (error.message || "Unable to reach ClearTax service."),
      provider: "cleartax"
    };
  } finally {
    clearTimeout(timer);
  }
}

async function verifyWithSandbox(gstin, config) {
  if (!config.apiKey) {
    return {
      ok: false,
      status: "pending_external_verification",
      gstin,
      message: "Sandbox API key is not configured. Queued for verification.",
      provider: "sandbox"
    };
  }

  const endpoint = config.apiUrl || "https://api.sandbox.co.in/gsp/public/gstin";
  const url = `${endpoint}/${encodeURIComponent(gstin)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: config.apiKey,
        "x-api-version": "1.0",
        Accept: "application/json"
      },
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 404 || (data && data.data && data.data.status === "Cancelled")) {
      return {
        ok: false,
        status: "invalid",
        gstin,
        message: data.message || "GSTIN is cancelled or invalid.",
        provider: "sandbox"
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: "verification_failed",
        gstin,
        message: data.message || `Sandbox API responded with error code ${response.status}`,
        provider: "sandbox"
      };
    }

    const payload = data.data || data;
    return {
      ok: true,
      status: "verified",
      gstin,
      state: getStateFromGstin(gstin),
      pan: getPanFromGstin(gstin),
      legalName: payload.legal_name || payload.lgnm || "",
      tradeName: payload.trade_name || payload.tradeNam || "",
      taxpayerType: payload.taxpayer_type || "Regular",
      registrationDate: payload.registration_date || "",
      provider: "sandbox"
    };
  } catch (error) {
    return {
      ok: false,
      status: "verification_failed",
      gstin,
      message: error.name === "AbortError"
        ? "Sandbox API request timed out."
        : (error.message || "Unable to reach Sandbox GSTIN service."),
      provider: "sandbox"
    };
  } finally {
    clearTimeout(timer);
  }
}

async function verifyGstin(value, overrides = {}) {
  const gstin = String(value || "").trim().toUpperCase();

  if (!gstin) {
    return {
      ok: false,
      status: "missing_input",
      message: "GSTIN is required."
    };
  }

  if (!isValidGstinFormat(gstin)) {
    return {
      ok: false,
      status: "invalid_format",
      gstin,
      message: "Enter a valid GSTIN format (15 alphanumeric characters)."
    };
  }

  const baseConfig = resolveGstinConfig();
  const config = {
    ...baseConfig,
    ...overrides
  };

  switch (config.provider) {
    case "cleartax":
      return verifyWithClearTax(gstin, config);
    case "sandbox":
      return verifyWithSandbox(gstin, config);
    case "simulated":
    default:
      return verifyWithSimulated(gstin, config);
  }
}

module.exports = {
  GSTIN_REGEX,
  GST_STATE_CODES,
  getPanFromGstin,
  getStateFromGstin,
  isValidGstinFormat,
  resolveGstinConfig,
  verifyGstin
};
