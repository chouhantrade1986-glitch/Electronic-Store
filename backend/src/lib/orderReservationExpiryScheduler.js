const { acquireWriteLock, readDb, withWriteLock, writeDb } = require("./db");
const { expireStaleReservationsInMemory, resolveReservationTtlMinutes } = require("./orderReservationMaintenance");
const { dispatchOrderStatusNotification } = require("./orderNotifications");
const { logError, logInfo } = require("./logger");

let schedulerTimer = null;
let schedulerStartupTimer = null;
let schedulerInFlight = false;
let currentIntervalMs = 0;

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
      logInfo("order_reservation_expiry_sweep", {
        trigger,
        expiredCount: Number(result.expiredCount || 0),
        changed: true
      });
    }
  } catch (error) {
    logError("order_reservation_expiry_sweep_failed", {
      trigger,
      message: error && error.message ? error.message : String(error)
    });
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
      logError("order_reservation_expiry_notification_failed", {
        orderId,
        message: error && error.message ? error.message : String(error)
      });
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
  currentIntervalMs = 0;
}

function startOrderReservationExpiryScheduler() {
  stopOrderReservationExpiryScheduler();
  const intervalMs = resolveSweepIntervalMs();
  currentIntervalMs = intervalMs;

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

  logInfo("order_reservation_expiry_scheduler_enabled", {
    intervalMs,
    intervalSeconds: Math.round(intervalMs / 1000)
  });

  return {
    stop: stopOrderReservationExpiryScheduler,
    intervalMs
  };
}

function getOrderReservationExpirySchedulerStatus() {
  return {
    healthy: Boolean(schedulerTimer || schedulerStartupTimer),
    enabled: Boolean(schedulerTimer || schedulerStartupTimer),
    inFlight: schedulerInFlight === true,
    intervalMs: Number(currentIntervalMs || 0)
  };
}

module.exports = {
  getOrderReservationExpirySchedulerStatus,
  runOrderReservationExpirySweep,
  startOrderReservationExpiryScheduler,
  stopOrderReservationExpiryScheduler
};
