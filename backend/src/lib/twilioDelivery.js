const { randomUUID } = require("crypto");
const { Buffer } = require("buffer");

function normalizeChannel(value) {
  const key = String(value || "sms").trim().toLowerCase();
  return key === "whatsapp" ? "whatsapp" : "sms";
}

function resolveTwilioConfig(channel) {
  const normalizedChannel = normalizeChannel(channel);
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || "").trim();
  const baseFrom = normalizedChannel === "whatsapp"
    ? String(process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_SMS_FROM || "").trim()
    : String(process.env.TWILIO_SMS_FROM || "").trim();
  const from = normalizedChannel === "whatsapp" && baseFrom && !baseFrom.startsWith("whatsapp:")
    ? `whatsapp:${baseFrom}`
    : baseFrom;

  return {
    accountSid,
    authToken,
    from
  };
}

async function sendTwilioMessage(params = {}) {
  const channel = normalizeChannel(params.channel);
  const destination = String(params.destination || "").trim();
  const text = String(params.text || "").trim();
  const config = resolveTwilioConfig(channel);

  if (!config.accountSid || !config.authToken || !config.from) {
    const error = new Error(`Twilio configuration is incomplete for ${channel}.`);
    error.code = "TWILIO_CONFIG_MISSING";
    throw error;
  }
  if (!destination || !text) {
    const error = new Error("Twilio destination and message text are required.");
    error.code = "TWILIO_PAYLOAD_INVALID";
    throw error;
  }
  if (typeof fetch !== "function") {
    const error = new Error("Fetch API is unavailable in current Node runtime.");
    error.code = "FETCH_UNAVAILABLE";
    throw error;
  }

  const toValue = channel === "whatsapp" && !destination.startsWith("whatsapp:")
    ? `whatsapp:${destination}`
    : destination;
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      To: toValue,
      From: config.from,
      Body: text
    }).toString()
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    const message = responseText || `Twilio request failed with status ${response.status}`;
    const error = new Error(message);
    error.code = "TWILIO_REQUEST_FAILED";
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  return {
    delivered: true,
    status: "sent",
    provider: "twilio",
    messageId: String(data && data.sid ? data.sid : randomUUID())
  };
}

module.exports = {
  sendTwilioMessage
};
