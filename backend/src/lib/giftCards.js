const crypto = require("crypto");
const { encryptPiiValue, decryptPiiValue } = require("../middleware/piiEncryption");

const CLAIM_CODE_PATTERN = /^(?:EM-GC-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}|EM-GC-(?:[A-F0-9]{6}-){3}[A-F0-9]{6})$/i;
const MAX_GIFT_CARD_AMOUNT = 10000;
const MAX_GIFT_CARD_REDEMPTION_AMOUNT = 10000;

function normalizeClaimCode(value) {
  return String(value || "").trim().toUpperCase();
}

function hashClaimCode(value) {
  return crypto.createHash("sha256").update(normalizeClaimCode(value), "utf8").digest("hex");
}

function generateGiftCardClaimCode() {
  const token = crypto.randomBytes(12).toString("hex").toUpperCase();
  return `EM-GC-${token.match(/.{6}/g).join("-")}`;
}

function ensureGiftCardCollections(db) {
  if (!Array.isArray(db.giftCards)) {
    db.giftCards = [];
  }
  if (!Array.isArray(db.giftCardRedemptions)) {
    db.giftCardRedemptions = [];
  }
  if (!Array.isArray(db.paymentSourceReservations)) {
    db.paymentSourceReservations = [];
  }
}

function cardPublicView(card) {
  return {
    id: String(card.id || ""),
    orderId: String(card.orderId || ""),
    amount: Number(card.amount || 0),
    balance: Number(card.balance || 0),
    status: String(card.status || ""),
    recipientName: String(card.recipientName || ""),
    recipientEmail: String(card.recipientEmail || ""),
    claimCode: decryptPiiValue(card.claimCodeEncrypted),
    issuedAt: String(card.issuedAt || ""),
    redeemedAt: String(card.redeemedAt || "")
  };
}

function resolvePaymentTransactionHash(payment) {
  const metadata = payment && payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {};
  return String(metadata.gatewayPaymentId || payment && payment.gatewayReference || payment && payment.id || "").trim();
}

function issueGiftCardsForOrder(db, order, options = {}) {
  ensureGiftCardCollections(db);
  if (!order || String(order.paymentStatus || "").toLowerCase() !== "paid") {
    return [];
  }

  const at = String(options.at || new Date().toISOString());
  const transactionHash = resolvePaymentTransactionHash(options.payment);
  const issued = [];
  (Array.isArray(order.items) ? order.items : []).forEach((item, itemIndex) => {
    if (!item || item.isGiftCard !== true) {
      return;
    }

    const amount = Number(item.price);
    if (!Number.isInteger(amount) || amount < 100 || amount > MAX_GIFT_CARD_AMOUNT) {
      throw new Error("Gift card order contains an invalid server-priced amount.");
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("Gift card order contains an invalid quantity.");
    }
    const giftCard = item.giftCard && typeof item.giftCard === "object" ? item.giftCard : {};

    for (let unitIndex = 0; unitIndex < quantity; unitIndex += 1) {
      const orderItemKey = `${order.id}:${itemIndex}:${unitIndex}`;
      let card = db.giftCards.find((entry) => entry.orderItemKey === orderItemKey);
      if (!card) {
        const claimCode = generateGiftCardClaimCode();
        card = {
          id: crypto.randomUUID(),
          orderId: String(order.id),
          orderItemKey,
          buyerUserId: String(order.userId),
          claimCodeHash: hashClaimCode(claimCode),
          claimCodeEncrypted: encryptPiiValue(claimCode),
          amount,
          balance: amount,
          status: "active",
          recipientName: String(giftCard.recipientName || "Recipient"),
          recipientEmail: String(giftCard.recipientEmail || ""),
          senderName: String(giftCard.senderName || ""),
          giftMessage: String(giftCard.giftMessage || ""),
          templateId: String(giftCard.templateId || "festival"),
          deliveryDate: String(giftCard.deliveryDate || ""),
          transactionHash,
          issuedAt: at,
          redeemedAt: ""
        };
        db.giftCards.push(card);
      }
      issued.push(cardPublicView(card));
    }
  });
  return issued;
}

function revokeGiftCardsForOrder(db, orderId, at = new Date().toISOString()) {
  ensureGiftCardCollections(db);
  const normalizedOrderId = String(orderId || "");
  const revoked = [];
  db.giftCards.forEach((card) => {
    if (String(card.orderId || "") !== normalizedOrderId) {
      return;
    }
    card.balance = 0;
    card.status = "revoked";
    card.revokedAt = String(at);
    revoked.push(card);
  });
  return revoked;
}

function listGiftCardsForUser(db, userId) {
  ensureGiftCardCollections(db);
  return db.giftCards
    .filter((card) => String(card.buyerUserId || "") === String(userId || ""))
    .sort((left, right) => String(right.issuedAt || "").localeCompare(String(left.issuedAt || "")))
    .map(cardPublicView);
}

function refreshGiftCardStatus(db, card, at) {
  if (card.status === "revoked" || card.revokedAt) {
    card.balance = 0;
    card.status = "revoked";
    return;
  }
  const pendingReservations = db.paymentSourceReservations.some((reservation) =>
    String(reservation.giftCardId || "") === String(card.id || "") && reservation.status === "reserved"
  );
  const balance = Number(card.balance || 0);
  if (balance > 0) {
    card.status = "active";
    card.redeemedAt = "";
  } else if (pendingReservations) {
    card.status = "reserved";
    card.redeemedAt = "";
  } else {
    card.status = "redeemed";
    card.redeemedAt = String(at || new Date().toISOString());
  }
}

function reserveOrderPaymentSources(db, {
  orderId,
  userId,
  claimCode = "",
  orderTotal,
  useWalletBalance = false,
  expiresAt = "",
  at = new Date().toISOString()
} = {}) {
  ensureGiftCardCollections(db);
  const normalizedOrderId = String(orderId || "").trim();
  const normalizedUserId = String(userId || "").trim();
  const total = Number(orderTotal);
  if (!normalizedOrderId || !normalizedUserId || !Number.isFinite(total) || total < 0) {
    return { ok: false, status: 400, message: "Order payment details are invalid." };
  }

  const existing = db.paymentSourceReservations.find((entry) => entry.orderId === normalizedOrderId);
  if (existing) {
    if (existing.status !== "reserved") {
      return { ok: false, status: 409, message: "Payment sources for this order are already closed." };
    }
    return {
      ok: true,
      alreadyReserved: true,
      giftCardAmount: Number(existing.giftCardAmount || 0),
      walletAmount: Number(existing.walletAmount || 0),
      amountDue: Number(existing.amountDue || 0),
      giftCardBalanceRemaining: existing.giftCardId
        ? Number((db.giftCards.find((entry) => entry.id === existing.giftCardId) || {}).balance || 0)
        : null,
      walletBalanceRemaining: Number((db.users.find((entry) => entry.id === normalizedUserId) || {}).walletBalance || 0)
    };
  }

  let card = null;
  let giftCardAmount = 0;
  const normalizedClaimCode = normalizeClaimCode(claimCode);
  if (normalizedClaimCode) {
    if (!CLAIM_CODE_PATTERN.test(normalizedClaimCode)) {
      return { ok: false, status: 400, message: "Enter a valid gift card claim code." };
    }
    card = db.giftCards.find((entry) => entry.claimCodeHash === hashClaimCode(normalizedClaimCode));
    if (!card || card.status !== "active" || Number(card.balance || 0) <= 0) {
      return { ok: false, status: 409, message: "This gift card is invalid, already redeemed, or has no available balance." };
    }
    giftCardAmount = Math.min(
      Number(card.balance),
      total,
      MAX_GIFT_CARD_REDEMPTION_AMOUNT
    );
  }

  let user = null;
  let walletAmount = 0;
  if (useWalletBalance) {
    user = db.users.find((entry) => String(entry.id || "") === normalizedUserId);
    if (!user) {
      return { ok: false, status: 404, message: "Account not found." };
    }
    const walletBalance = Number(user.walletBalance || 0);
    if (!Number.isFinite(walletBalance) || walletBalance < 0) {
      throw new Error("The account wallet balance is invalid.");
    }
    walletAmount = Math.min(walletBalance, Math.max(0, total - giftCardAmount));
  }

  const amountDue = Number(Math.max(0, total - giftCardAmount - walletAmount).toFixed(2));
  if (!giftCardAmount && !walletAmount) {
    return {
      ok: true,
      giftCardAmount: 0,
      walletAmount: 0,
      amountDue,
      giftCardBalanceRemaining: null,
      walletBalanceRemaining: user ? Number(user.walletBalance || 0) : null
    };
  }

  if (card) {
    card.balance = Number((Number(card.balance) - giftCardAmount).toFixed(2));
  }
  if (user && walletAmount > 0) {
    user.walletBalance = Number((Number(user.walletBalance || 0) - walletAmount).toFixed(2));
  }

  const reservation = {
    id: crypto.randomUUID(),
    orderId: normalizedOrderId,
    userId: normalizedUserId,
    giftCardId: card ? String(card.id) : "",
    giftCardAmount,
    walletAmount,
    amountDue,
    status: "reserved",
    createdAt: String(at),
    expiresAt: String(expiresAt || ""),
    settledAt: "",
    releasedAt: ""
  };
  db.paymentSourceReservations.push(reservation);
  if (card) {
    refreshGiftCardStatus(db, card, at);
  }

  return {
    ok: true,
    reservationId: reservation.id,
    giftCardAmount,
    walletAmount,
    amountDue,
    giftCardBalanceRemaining: card ? Number(card.balance || 0) : null,
    walletBalanceRemaining: user ? Number(user.walletBalance || 0) : null
  };
}

function finalizeOrderPaymentSources(db, orderId, at = new Date().toISOString()) {
  ensureGiftCardCollections(db);
  const reservation = db.paymentSourceReservations.find((entry) => entry.orderId === String(orderId || ""));
  if (!reservation || reservation.status === "captured") {
    return { ok: true, alreadyProcessed: true, reservation: reservation || null };
  }
  if (reservation.status !== "reserved") {
    return { ok: false, status: 409, message: "Reserved payment sources are no longer available." };
  }
  reservation.status = "captured";
  reservation.settledAt = String(at);
  const order = db.orders.find((entry) => String(entry.id || "") === reservation.orderId);
  if (order && order.paymentBreakdown) {
    order.paymentBreakdown.settlementStatus = "captured";
  }
  if (reservation.giftCardAmount > 0) {
    const card = db.giftCards.find((entry) => String(entry.id || "") === reservation.giftCardId);
    if (!card) {
      throw new Error("Reserved gift card was not found while finalizing payment.");
    }
    db.giftCardRedemptions.push({
      id: crypto.randomUUID(),
      reservationId: reservation.id,
      giftCardId: card.id,
      orderId: reservation.orderId,
      userId: reservation.userId,
      amount: Number(reservation.giftCardAmount),
      status: "captured",
      redeemedAt: String(at)
    });
    refreshGiftCardStatus(db, card, at);
  }

  return { ok: true, reservation };
}

function releaseOrderPaymentSources(db, orderId, at = new Date().toISOString()) {
  ensureGiftCardCollections(db);
  const reservation = db.paymentSourceReservations.find((entry) => entry.orderId === String(orderId || ""));
  if (!reservation || reservation.status !== "reserved") {
    return { ok: true, alreadyProcessed: true, reservation: reservation || null };
  }

  const card = reservation.giftCardId
    ? db.giftCards.find((entry) => String(entry.id || "") === reservation.giftCardId)
    : null;
  const user = db.users.find((entry) => String(entry.id || "") === String(reservation.userId || ""));
  if ((reservation.giftCardAmount > 0 && !card) || (reservation.walletAmount > 0 && !user)) {
    throw new Error("A reserved payment source is missing and cannot be released safely.");
  }

  if (card && !card.revokedAt && card.status !== "revoked" && reservation.giftCardAmount > 0) {
    card.balance = Number((Number(card.balance || 0) + Number(reservation.giftCardAmount)).toFixed(2));
  }
  if (user && reservation.walletAmount > 0) {
    user.walletBalance = Number((Number(user.walletBalance || 0) + Number(reservation.walletAmount)).toFixed(2));
  }
  reservation.status = "released";
  reservation.releasedAt = String(at);
  const order = db.orders.find((entry) => String(entry.id || "") === reservation.orderId);
  if (order && order.paymentBreakdown) {
    order.paymentBreakdown.settlementStatus = "released";
    order.paymentBreakdown.walletBalanceRemaining = user ? Number(user.walletBalance || 0) : 0;
  }
  if (card) {
    refreshGiftCardStatus(db, card, at);
  }
  return {
    ok: true,
    reservation,
    giftCardBalanceRemaining: card ? Number(card.balance || 0) : null,
    walletBalanceRemaining: user ? Number(user.walletBalance || 0) : null
  };
}

function refundOrderPaymentSources(db, orderId, at = new Date().toISOString()) {
  ensureGiftCardCollections(db);
  const reservation = db.paymentSourceReservations.find((entry) => entry.orderId === String(orderId || ""));
  if (!reservation || reservation.status === "refunded") {
    return { ok: true, alreadyProcessed: true, reservation: reservation || null };
  }
  if (reservation.status === "reserved") {
    return releaseOrderPaymentSources(db, orderId, at);
  }
  if (reservation.status !== "captured") {
    return { ok: false, status: 409, message: "Captured payment sources are not eligible for refund." };
  }

  const card = reservation.giftCardId
    ? db.giftCards.find((entry) => String(entry.id || "") === reservation.giftCardId)
    : null;
  const user = db.users.find((entry) => String(entry.id || "") === String(reservation.userId || ""));
  if ((reservation.giftCardAmount > 0 && !card) || (reservation.walletAmount > 0 && !user)) {
    throw new Error("A captured payment source is missing and cannot be refunded safely.");
  }

  if (card && !card.revokedAt && card.status !== "revoked" && reservation.giftCardAmount > 0) {
    card.balance = Number((Number(card.balance || 0) + Number(reservation.giftCardAmount)).toFixed(2));
  }
  if (user && reservation.walletAmount > 0) {
    user.walletBalance = Number((Number(user.walletBalance || 0) + Number(reservation.walletAmount)).toFixed(2));
  }
  reservation.status = "refunded";
  reservation.refundedAt = String(at);
  const order = db.orders.find((entry) => String(entry.id || "") === reservation.orderId);
  if (order && order.paymentBreakdown) {
    order.paymentBreakdown.settlementStatus = "refunded";
    order.paymentBreakdown.walletBalanceRemaining = user ? Number(user.walletBalance || 0) : 0;
  }
  const redemption = db.giftCardRedemptions.find((entry) => entry.reservationId === reservation.id);
  if (redemption) {
    redemption.status = "refunded";
    redemption.refundedAt = String(at);
  }
  if (card) {
    refreshGiftCardStatus(db, card, at);
  }
  return {
    ok: true,
    reservation,
    giftCardBalanceRemaining: card ? Number(card.balance || 0) : null,
    walletBalanceRemaining: user ? Number(user.walletBalance || 0) : null
  };
}

function redeemGiftCard(db, userId, rawClaimCode, at = new Date().toISOString()) {
  ensureGiftCardCollections(db);
  const claimCode = normalizeClaimCode(rawClaimCode);
  if (!CLAIM_CODE_PATTERN.test(claimCode)) {
    return { ok: false, status: 400, message: "Enter a valid gift card claim code." };
  }

  const card = db.giftCards.find((entry) => entry.claimCodeHash === hashClaimCode(claimCode));
  if (!card || card.status !== "active" || Number(card.balance || 0) <= 0) {
    return { ok: false, status: 409, message: "This gift card is invalid, already redeemed, or has no balance." };
  }

  const amount = Number(card.balance);
  if (!Number.isFinite(amount) || amount > MAX_GIFT_CARD_REDEMPTION_AMOUNT) {
    return { ok: false, status: 409, message: "This gift card exceeds the allowed redemption limit." };
  }
  const user = (Array.isArray(db.users) ? db.users : []).find((entry) => String(entry.id || "") === String(userId || ""));
  if (!user) {
    return { ok: false, status: 404, message: "Account not found." };
  }

  const currentBalance = Number(user.walletBalance || 0);
  if (!Number.isFinite(currentBalance) || currentBalance < 0) {
    throw new Error("The account wallet balance is invalid.");
  }
  const newBalance = Number((currentBalance + amount).toFixed(2));
  card.balance = 0;
  card.status = "redeemed";
  card.redeemedAt = at;
  user.walletBalance = newBalance;
  db.giftCardRedemptions.push({
    id: crypto.randomUUID(),
    giftCardId: card.id,
    userId: String(user.id),
    amount,
    status: "captured",
    redeemedAt: at
  });

  return { ok: true, amount, balance: newBalance };
}

function getWalletBalanceForUser(db, userId) {
  const user = (Array.isArray(db && db.users) ? db.users : []).find((entry) => String(entry.id || "") === String(userId || ""));
  return user ? Number(user.walletBalance || 0) : 0;
}

module.exports = {
  CLAIM_CODE_PATTERN,
  MAX_GIFT_CARD_AMOUNT,
  MAX_GIFT_CARD_REDEMPTION_AMOUNT,
  ensureGiftCardCollections,
  generateGiftCardClaimCode,
  getWalletBalanceForUser,
  reserveOrderPaymentSources,
  finalizeOrderPaymentSources,
  releaseOrderPaymentSources,
  refundOrderPaymentSources,
  revokeGiftCardsForOrder,
  issueGiftCardsForOrder,
  listGiftCardsForUser,
  redeemGiftCard
};
