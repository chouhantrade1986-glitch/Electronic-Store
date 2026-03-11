const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailEnabled: true,
  smsEnabled: false,
  whatsappEnabled: false,
  smsProvider: "twilio",
  whatsappProvider: "twilio",
  orderShipped: true,
  orderDelivered: true,
  orderCancelled: true
};

function normalizeNotificationPreferences(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    emailEnabled: source.emailEnabled !== false,
    smsEnabled: source.smsEnabled === true,
    whatsappEnabled: source.whatsappEnabled === true,
    smsProvider: String(source.smsProvider || "twilio"),
    whatsappProvider: String(source.whatsappProvider || "twilio"),
    orderShipped: source.orderShipped !== false,
    orderDelivered: source.orderDelivered !== false,
    orderCancelled: source.orderCancelled !== false
  };
}

function getOrderPreferenceKey(eventKey) {
  const key = String(eventKey || "").trim().toLowerCase();
  if (key === "shipped") {
    return "orderShipped";
  }
  if (key === "delivered") {
    return "orderDelivered";
  }
  if (key === "cancelled") {
    return "orderCancelled";
  }
  return "";
}

function getChannelPreferenceKey(channel) {
  const key = String(channel || "").trim().toLowerCase();
  if (key === "email") {
    return "emailEnabled";
  }
  if (key === "sms") {
    return "smsEnabled";
  }
  if (key === "whatsapp") {
    return "whatsappEnabled";
  }
  return "";
}

function isNotificationChannelEnabledForEvent(user, channel, eventKey) {
  const preferences = normalizeNotificationPreferences(user && user.notificationPreferences);
  const channelPreferenceKey = getChannelPreferenceKey(channel);
  if (channelPreferenceKey && preferences[channelPreferenceKey] !== true) {
    return false;
  }
  const preferenceKey = getOrderPreferenceKey(eventKey);
  if (!preferenceKey) {
    return true;
  }
  return preferences[preferenceKey] !== false;
}

function isOrderEmailEnabledForEvent(user, eventKey) {
  return isNotificationChannelEnabledForEvent(user, "email", eventKey);
}

module.exports = {
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeNotificationPreferences,
  getOrderPreferenceKey,
  getChannelPreferenceKey,
  isNotificationChannelEnabledForEvent,
  isOrderEmailEnabledForEvent
};
