const { acquireWriteLock, readDb, withWriteLock, writeDb } = require("./db");
const { expireStaleReservationsInMemory, resolveReservationTtlMinutes } = require("./orderReservationMaintenance");
const { dispatchOrderStatusNotification } = require("./orderNotifications");

let schedulerTimer = null;
let schedulerStartupTimer = null;
let schedulerInFlight = false;

function resolveSweepIntervalMs() {
  const ttlMinutes = resolveReservationTtlMinutes();
  const fallback = Math.min(60 * 1000, ttlMinutes * 60 * 1000);
  const parsed = Number(process.env.ORDER_RESERVATION_SWEEP_INTERVAL_MS || fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.max(15 * 1000, Math.floor(parsed));
}

async function runOrderReservationExpirySweep(trigger = "scheduler") {
  if (schedulerInFlight) {
    return null;
  }

  schedulerInFlight = true;
  let releaseLock = null;
  let result = null;
  let notificationOrderIds = [];
  try {
    releaseLock = await acquireWriteLock();
    const db = readDb();
    result = expireStaleReservationsInMemory(db, {
      at: new Date().toISOString()
    });
    if (result.changed) {
      writeDb(db);
      notificationOrderIds = Array.isArray(result.expiredOrderIds) ? result.expiredOrderIds : [];
      // eslint-disable-next-line no-console
      console.log(`[order-reservation-expiry] ${trigger}: expired ${result.expiredCount} order reservation(s).`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[order-reservation-expiry] sweep failed:", error && error.message ? error.message : error);
    return null;
  } finally {
    if (releaseLock) {
      releaseLock();
    }
    schedulerInFlight = false;
  }

  if (notificationOrderIds.length > 0) {
    await emitReservationExpiryNotifications(notificationOrderIds);
  }

  return result;
}

async function emitReservationExpiryNotifications(expiredOrderIds = []) {
  const uniqueOrderIds = [...new Set(
    (Array.isArray(expiredOrderIds) ? expiredOrderIds : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  )];

  for (const orderId of uniqueOrderIds) {
    try {
      await withWriteLock(async () => {
        const db = readDb();
        const order = Array.isArray(db.orders)
          ? db.orders.find((item) => String(item && item.id ? item.id : "") === orderId)
          : null;
        if (!order) {
          return;
        }

        await dispatchOrderStatusNotification(db, order, {
          eventKey: "cancelled",
          triggeredBy: "reservation-expiry",
          triggeredFrom: "scheduler"
        });
        writeDb(db);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[order-reservation-expiry] notification failed for order ${orderId}:`, error && error.message ? error.message : error);
    }
  }
}

function stopOrderReservationExpiryScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  if (schedulerStartupTimer) {
    clearTimeout(schedulerStartupTimer);
    schedulerStartupTimer = null;
  }
}

function startOrderReservationExpiryScheduler() {
  stopOrderReservationExpiryScheduler();
  const intervalMs = resolveSweepIntervalMs();

  schedulerTimer = setInterval(() => {
    runOrderReservationExpirySweep("interval");
  }, intervalMs);
  if (typeof schedulerTimer.unref === "function") {
    schedulerTimer.unref();
  }

  schedulerStartupTimer = setTimeout(() => {
    runOrderReservationExpirySweep("startup");
  }, 1500);
  if (typeof schedulerStartupTimer.unref === "function") {
    schedulerStartupTimer.unref();
  }

  // eslint-disable-next-line no-console
  console.log(`[order-reservation-expiry] scheduler enabled every ${Math.round(intervalMs / 1000)} second(s).`);

  return {
    stop: stopOrderReservationExpiryScheduler,
    intervalMs
  };
}

module.exports = {
  runOrderReservationExpirySweep,
  startOrderReservationExpiryScheduler,
  stopOrderReservationExpiryScheduler
};
