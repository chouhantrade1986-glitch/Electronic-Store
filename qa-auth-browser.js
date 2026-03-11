(function attachQaAuthHelper(globalScope) {
  async function requestJson(apiBaseUrl, path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, options);
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
      return 0;
    }
    return Math.max(0, resendAvailableAt - Date.now()) + 250;
  }

  async function otpLogin(apiBaseUrl, emailOrMobile, password, channel = "email") {
    const normalizedChannel = String(channel || "email").trim().toLowerCase() === "mobile" ? "mobile" : "email";
    let otpRequest;
    try {
      otpRequest = await requestJson(apiBaseUrl, "/auth/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          purpose: "login",
          channel: normalizedChannel,
          emailOrMobile,
          password
        })
      });
    } catch (error) {
      const retryDelayMs = error.status === 429 ? getRetryDelayMs(error) : 0;
      if (!retryDelayMs) {
        throw error;
      }
      await sleep(retryDelayMs);
      otpRequest = await requestJson(apiBaseUrl, "/auth/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          purpose: "login",
          channel: normalizedChannel,
          emailOrMobile,
          password
        })
      });
    }

    const challengeId = String(otpRequest.challengeId || "").trim();
    const otpCode = String(otpRequest.otpPreview || "").trim();
    if (!challengeId || !/^\d{6}$/.test(otpCode)) {
      throw new Error("OTP login requires a simulated OTP preview. Check auth delivery mode.");
    }

    return requestJson(apiBaseUrl, "/auth/otp/verify", {
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

  globalScope.QaAuthHelper = {
    otpLogin
  };
})(window);
