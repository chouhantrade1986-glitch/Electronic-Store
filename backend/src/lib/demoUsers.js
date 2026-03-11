const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const { normalizePhone } = require("./phoneVerification");
const { normalizeNotificationPreferences } = require("./notificationPreferences");
const { normalizePhoneVerificationState } = require("./phoneVerification");

const SEEDED_DEMO_USER_BLOCK_MESSAGE = "This seeded demo account is disabled. Set ALLOW_SEEDED_DEMO_USERS=true and rerun the demo-user migration to re-enable it.";

const SEEDED_DEMO_PROFILES = [
  {
    key: "admin",
    name: "Admin User",
    email: "admin@electromart.com",
    mobile: "9999999999",
    password: "Admin@123",
    role: "admin",
    address: "HQ, Delhi"
  },
  {
    key: "customer",
    name: "Demo Customer",
    email: "customer@electromart.com",
    mobile: "8888888888",
    password: "Customer@123",
    role: "customer",
    address: "Jaipur, Rajasthan"
  }
];

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function findSeededDemoProfile(user) {
  if (!user || typeof user !== "object") {
    return null;
  }
  const email = normalizeEmail(user.email);
  const mobile = normalizePhone(user.mobile);
  const role = String(user.role || "").trim().toLowerCase();
  const explicitKey = String(user.seededDemoProfileKey || "").trim().toLowerCase();

  return SEEDED_DEMO_PROFILES.find((profile) => {
    if (explicitKey && explicitKey === profile.key) {
      return true;
    }
    return profile.role === role
      && normalizeEmail(profile.email) === email
      && normalizePhone(profile.mobile) === mobile;
  }) || null;
}

function isSeededDemoUserBlocked(user) {
  return Boolean(user && user.seededDemoUser === true && user.demoAccessDisabled === true);
}

function normalizeSeededDemoMetadata(user = {}) {
  const nextUser = user && typeof user === "object" ? { ...user } : {};
  const profile = findSeededDemoProfile(nextUser);
  if (!profile) {
    return nextUser;
  }

  return {
    ...nextUser,
    seededDemoUser: true,
    seededDemoProfileKey: profile.key,
    demoAccessDisabled: nextUser.demoAccessDisabled === true,
    demoAccessUpdatedAt: nextUser.demoAccessUpdatedAt ? String(nextUser.demoAccessUpdatedAt) : null
  };
}

function createSeededDemoUsers() {
  return SEEDED_DEMO_PROFILES.map((profile) => ({
    id: randomUUID(),
    name: profile.name,
    email: profile.email,
    mobile: profile.mobile,
    passwordHash: bcrypt.hashSync(profile.password, 10),
    role: profile.role,
    address: profile.address,
    notificationPreferences: normalizeNotificationPreferences({}),
    phoneVerification: normalizePhoneVerificationState({}),
    seededDemoUser: true,
    seededDemoProfileKey: profile.key,
    demoAccessDisabled: false,
    demoAccessUpdatedAt: new Date().toISOString()
  }));
}

function applySeededDemoUserAccessPolicy(db, options = {}) {
  const allowAccess = options.allowAccess === true;
  const users = Array.isArray(db && db.users) ? db.users : [];
  const changedUsers = [];
  let matchedCount = 0;
  let changedCount = 0;
  let enabledCount = 0;
  let disabledCount = 0;

  const nextUsers = users.map((user) => {
    const normalized = normalizeSeededDemoMetadata(user);
    const profile = findSeededDemoProfile(normalized);
    if (!profile && normalized.seededDemoUser !== true) {
      return normalized;
    }

    matchedCount += 1;
    const nextUser = {
      ...normalized,
      seededDemoUser: true,
      seededDemoProfileKey: profile ? profile.key : String(normalized.seededDemoProfileKey || "").trim().toLowerCase(),
      demoAccessDisabled: !allowAccess,
      demoAccessUpdatedAt: new Date().toISOString()
    };

    if (nextUser.demoAccessDisabled) {
      disabledCount += 1;
    } else {
      enabledCount += 1;
    }

    const before = JSON.stringify({
      seededDemoUser: normalized.seededDemoUser === true,
      seededDemoProfileKey: String(normalized.seededDemoProfileKey || ""),
      demoAccessDisabled: normalized.demoAccessDisabled === true
    });
    const after = JSON.stringify({
      seededDemoUser: nextUser.seededDemoUser === true,
      seededDemoProfileKey: String(nextUser.seededDemoProfileKey || ""),
      demoAccessDisabled: nextUser.demoAccessDisabled === true
    });

    if (before !== after) {
      changedCount += 1;
      changedUsers.push({
        id: String(nextUser.id || ""),
        email: String(nextUser.email || ""),
        role: String(nextUser.role || ""),
        seededDemoProfileKey: String(nextUser.seededDemoProfileKey || ""),
        demoAccessDisabled: nextUser.demoAccessDisabled === true
      });
    }

    return nextUser;
  });

  if (db && Array.isArray(db.users)) {
    db.users = nextUsers;
  }

  return {
    allowAccess,
    matchedCount,
    changedCount,
    enabledCount,
    disabledCount,
    changedUsers
  };
}

function purgeSeededDemoUserData(db) {
  const users = Array.isArray(db && db.users) ? db.users : [];
  const matchedUsers = users.filter((user) => findSeededDemoProfile(user) || user.seededDemoUser === true);
  const userIds = new Set(matchedUsers.map((user) => String(user.id || "")).filter(Boolean));
  const emails = new Set(matchedUsers.map((user) => normalizeEmail(user.email)).filter(Boolean));
  const mobiles = new Set(matchedUsers.map((user) => normalizePhone(user.mobile)).filter(Boolean));
  const orderIds = new Set((Array.isArray(db.orders) ? db.orders : [])
    .filter((order) => userIds.has(String(order && order.userId ? order.userId : "")))
    .map((order) => String(order.id || ""))
    .filter(Boolean));
  const paymentIds = new Set((Array.isArray(db.payments) ? db.payments : [])
    .filter((payment) => userIds.has(String(payment && payment.userId ? payment.userId : "")) || orderIds.has(String(payment && payment.orderId ? payment.orderId : "")))
    .map((payment) => String(payment.id || ""))
    .filter(Boolean));

  const before = {
    users: Array.isArray(db.users) ? db.users.length : 0,
    orders: Array.isArray(db.orders) ? db.orders.length : 0,
    payments: Array.isArray(db.payments) ? db.payments.length : 0,
    orderNotifications: Array.isArray(db.orderNotifications) ? db.orderNotifications.length : 0,
    backInStockRequests: Array.isArray(db.backInStockRequests) ? db.backInStockRequests.length : 0,
    backInStockNotifications: Array.isArray(db.backInStockNotifications) ? db.backInStockNotifications.length : 0,
    phoneVerificationReminders: Array.isArray(db.phoneVerificationReminders) ? db.phoneVerificationReminders.length : 0,
    authOtpChallenges: Array.isArray(db.authOtpChallenges) ? db.authOtpChallenges.length : 0,
    paymentWebhookEvents: Array.isArray(db.paymentWebhookEvents) ? db.paymentWebhookEvents.length : 0
  };

  db.users = users.filter((user) => !userIds.has(String(user && user.id ? user.id : "")));
  if (Array.isArray(db.orders)) {
    db.orders = db.orders.filter((order) => !userIds.has(String(order && order.userId ? order.userId : "")));
  }
  if (Array.isArray(db.payments)) {
    db.payments = db.payments.filter((payment) => {
      const paymentUserId = String(payment && payment.userId ? payment.userId : "");
      const paymentOrderId = String(payment && payment.orderId ? payment.orderId : "");
      return !userIds.has(paymentUserId) && !orderIds.has(paymentOrderId);
    });
  }
  if (Array.isArray(db.orderNotifications)) {
    db.orderNotifications = db.orderNotifications.filter((item) => {
      const itemUserId = String(item && item.userId ? item.userId : "");
      const itemOrderId = String(item && item.orderId ? item.orderId : "");
      const itemEmail = normalizeEmail(item && item.email ? item.email : "");
      return !userIds.has(itemUserId) && !orderIds.has(itemOrderId) && !emails.has(itemEmail);
    });
  }
  if (Array.isArray(db.backInStockRequests)) {
    db.backInStockRequests = db.backInStockRequests.filter((item) => !emails.has(normalizeEmail(item && item.email ? item.email : "")));
  }
  if (Array.isArray(db.backInStockNotifications)) {
    db.backInStockNotifications = db.backInStockNotifications.filter((item) => !emails.has(normalizeEmail(item && item.email ? item.email : "")));
  }
  if (Array.isArray(db.phoneVerificationReminders)) {
    db.phoneVerificationReminders = db.phoneVerificationReminders.filter((item) => {
      const itemUserId = String(item && item.userId ? item.userId : "");
      const itemEmail = normalizeEmail(item && item.email ? item.email : "");
      const itemDestination = String(item && item.destination ? item.destination : "").trim();
      return !userIds.has(itemUserId)
        && !emails.has(itemEmail)
        && !emails.has(normalizeEmail(itemDestination))
        && !mobiles.has(normalizePhone(itemDestination));
    });
  }
  if (Array.isArray(db.authOtpChallenges)) {
    db.authOtpChallenges = db.authOtpChallenges.filter((item) => {
      const itemUserId = String(item && item.userId ? item.userId : "");
      const destination = String(item && item.destination ? item.destination : "").trim();
      const identifier = String(item && item.identifier ? item.identifier : "").trim();
      const pendingUserEmail = normalizeEmail(item && item.pendingUser && item.pendingUser.email ? item.pendingUser.email : "");
      const pendingUserMobile = normalizePhone(item && item.pendingUser && item.pendingUser.mobile ? item.pendingUser.mobile : "");
      return !userIds.has(itemUserId)
        && !emails.has(normalizeEmail(destination))
        && !mobiles.has(normalizePhone(destination))
        && !emails.has(normalizeEmail(identifier))
        && !mobiles.has(normalizePhone(identifier))
        && !emails.has(pendingUserEmail)
        && !mobiles.has(pendingUserMobile);
    });
  }
  if (Array.isArray(db.paymentWebhookEvents)) {
    db.paymentWebhookEvents = db.paymentWebhookEvents.filter((item) => {
      const eventJson = JSON.stringify(item || {});
      return ![...orderIds].some((orderId) => orderId && eventJson.includes(orderId))
        && ![...paymentIds].some((paymentId) => paymentId && eventJson.includes(paymentId));
    });
  }

  return {
    matchedUserCount: matchedUsers.length,
    removedUsers: before.users - (Array.isArray(db.users) ? db.users.length : 0),
    removedOrders: before.orders - (Array.isArray(db.orders) ? db.orders.length : 0),
    removedPayments: before.payments - (Array.isArray(db.payments) ? db.payments.length : 0),
    removedOrderNotifications: before.orderNotifications - (Array.isArray(db.orderNotifications) ? db.orderNotifications.length : 0),
    removedBackInStockRequests: before.backInStockRequests - (Array.isArray(db.backInStockRequests) ? db.backInStockRequests.length : 0),
    removedBackInStockNotifications: before.backInStockNotifications - (Array.isArray(db.backInStockNotifications) ? db.backInStockNotifications.length : 0),
    removedPhoneVerificationReminders: before.phoneVerificationReminders - (Array.isArray(db.phoneVerificationReminders) ? db.phoneVerificationReminders.length : 0),
    removedAuthOtpChallenges: before.authOtpChallenges - (Array.isArray(db.authOtpChallenges) ? db.authOtpChallenges.length : 0),
    removedPaymentWebhookEvents: before.paymentWebhookEvents - (Array.isArray(db.paymentWebhookEvents) ? db.paymentWebhookEvents.length : 0),
    affectedUserIds: [...userIds]
  };
}

module.exports = {
  SEEDED_DEMO_USER_BLOCK_MESSAGE,
  SEEDED_DEMO_PROFILES,
  applySeededDemoUserAccessPolicy,
  createSeededDemoUsers,
  findSeededDemoProfile,
  isSeededDemoUserBlocked,
  normalizeSeededDemoMetadata,
  purgeSeededDemoUserData
};
