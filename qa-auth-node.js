async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(error) {
  const resendAvailableAt = error && error.payload && error.payload.resendAvailableAt
    ? new Date(error.payload.resendAvailableAt).getTime()
    : NaN;
  if (!Number.isFinite(resendAvailableAt)) {
    return 750;
  }
  return Math.max(0, resendAvailableAt - Date.now()) + 250;
}

async function requestOtpWithRetry({ baseUrl, payload, maxAttempts = 4 }) {
  const totalAttempts = Math.max(1, Number(maxAttempts) || 1);
  let lastError = null;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    try {
      return await requestJson(`${baseUrl}/auth/otp/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      lastError = error;
      if (error.status !== 429 || attempt >= totalAttempts) {
        throw error;
      }
      await sleep(getRetryDelayMs(error));
    }
  }

  throw lastError || new Error("OTP request failed without a captured error.");
}

async function otpLogin({ apiBaseUrl, emailOrMobile, password, channel = "email" }) {
  const baseUrl = String(apiBaseUrl || "").trim().replace(/\/+$/, "");
  const normalizedChannel = String(channel || "email").trim().toLowerCase() === "mobile" ? "mobile" : "email";
  const otpRequest = await requestOtpWithRetry({
    baseUrl,
    payload: {
      purpose: "login",
      channel: normalizedChannel,
      emailOrMobile,
      password
    }
  });

  const challengeId = String(otpRequest.challengeId || "").trim();
  const otpCode = String(otpRequest.otpPreview || "").trim();
  if (!challengeId || !/^\d{6}$/.test(otpCode)) {
    throw new Error("OTP login requires a simulated OTP preview. Check auth delivery mode.");
  }

  return requestJson(`${baseUrl}/auth/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      purpose: "login",
      challengeId,
      code: otpCode,
      emailOrMobile,
      password
    })
  });
}

module.exports = {
  otpLogin,
  requestJson
};
