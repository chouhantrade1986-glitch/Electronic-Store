const { appendOrderStatusEvent } = require("./orderStatus");
const { releaseInventoryForOrder } = require("./orderCommerce");
const { cancelOrderPayments, isOrderPaymentCleared, isOnlinePaymentMethod } = require("./paymentLifecycle");

const DEFAULT_ORDER_RESERVATION_TTL_MINUTES = 15;

function resolveReservationTtlMinutes() {
  const parsed = Number(process.env.ORDER_RESERVATION_TTL_MINUTES || DEFAULT_ORDER_RESERVATION_TTL_MINUTES);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_ORDER_RESERVATION_TTL_MINUTES;
  }
  return Math.max(1, Math.floor(parsed));
}

function buildReservationUntil(paymentMethod, requestedValue = "", createdAt = new Date().toISOString()) {
  if (!isOnlinePaymentMethod(paymentMethod)) {
    return "";
  }

  const requested = String(requestedValue || "").trim();
  if (requested) {
    const parsedRequested = new Date(requested);
    if (!Number.isNaN(parsedRequested.getTime()) && parsedRequested.getTime() > Date.now()) {
      return parsedRequested.toISOString();
    }
  }

  const base = new Date(createdAt);
  if (Number.isNaN(base.getTime())) {
    return "";
  }
  return new Date(base.getTime() + (resolveReservationTtlMinutes() * 60 * 1000)).toISOString();
}

function hasExpiredReservation(order, at = new Date().toISOString()) {
  const reservationUntil = String(order && order.reservationUntil ? order.reservationUntil : "").trim();
  if (!reservationUntil) {
    return false;
  }
  if (!isOnlinePaymentMethod(order && order.paymentMethod)) {
    return false;
  }
  if (String(order && order.status ? order.status : "").trim().toLowerCase() === "cancelled") {
    return false;
  }
  if (isOrderPaymentCleared(order)) {
    return false;
  }

  const expiresAt = new Date(reservationUntil).getTime();
  const compareAt = new Date(at).getTime();
  if (!Number.isFinite(expiresAt) || !Number.isFinite(compareAt)) {
    return false;
  }
  return expiresAt <= compareAt;
}

function expireStaleReservationsInMemory(db, options = {}) {
  const at = String(options.at || new Date().toISOString());
  const orders = Array.isArray(db && db.orders) ? db.orders : [];
  const expiredOrderIds = [];

  orders.forEach((order) => {
    if (!hasExpiredReservation(order, at)) {
      return;
    }

    order.status = "cancelled";
    order.statusHistory = appendOrderStatusEvent(order, "cancelled", at, {
      label: "Reservation expired - order closed"
    });
    order.reservationExpiredAt = at;

    releaseInventoryForOrder(db, order, {
      reason: "reservation-expired",
      at
    });
    cancelOrderPayments(db, order, {
      at
    });

    expiredOrderIds.push(String(order.id || ""));
  });

  return {
    changed: expiredOrderIds.length > 0,
    expiredCount: expiredOrderIds.length,
    expiredOrderIds
  };
}

module.exports = {
  buildReservationUntil,
  expireStaleReservationsInMemory,
  hasExpiredReservation,
  resolveReservationTtlMinutes
};
