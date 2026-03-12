const { acquireWriteLock, ensureSeedData, readDb } = require("./db");
const {
  executePhoneVerificationAutomationJob,
} = require("./phoneVerificationAutomationJob");
const { getPhoneVerificationAutomationEffectiveConfig } = require("./phoneVerificationAutomationSettings");
const { logError, logInfo } = require("./logger");

let schedulerTimer = null;
let schedulerStartupTimer = null;
let schedulerInFlight = false;
let currentSchedulerConfig = null;

function resolveSchedulerConfig(overrides = {}) {
  ensureSeedData();
  const db = readDb();
  return getPhoneVerificationAutomationEffectiveConfig(db, overrides);
}

async function runScheduledPhoneVerificationAutomation(config, trigger = "scheduler") {
  if (schedulerInFlight) {
    logInfo("phone_verification_automation_skipped", {
      reason: "in-flight",
      trigger
    });
    return null;
  }

  schedulerInFlight = true;
  let releaseLock = null;
  try {
    releaseLock = await acquireWriteLock();
    const result = await executePhoneVerificationAutomationJob({
      ...config,
      actor: "scheduler",
      trigger
    });
    logInfo("phone_verification_automation_run", {
      trigger,
      message: String(result && result.message ? result.message : ""),
      deliveredCount: Number(result && result.summary ? result.summary.deliveredCount : 0),
      failedCount: Number(result && result.summary ? result.summary.failedCount : 0),
      queuedCount: Number(result && result.summary ? result.summary.queuedCount : 0),
      skippedCount: Number(result && result.summary ? result.summary.skippedCount : 0)
    });
    return result;
  } catch (error) {
    logError("phone_verification_automation_run_failed", {
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
}

function stopPhoneVerificationAutomationScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  if (schedulerStartupTimer) {
    clearTimeout(schedulerStartupTimer);
    schedulerStartupTimer = null;
  }
  currentSchedulerConfig = null;
}

function startPhoneVerificationAutomationScheduler(overrides = {}) {
  stopPhoneVerificationAutomationScheduler();
  const config = resolveSchedulerConfig(overrides);
  currentSchedulerConfig = config;
  if (!config.enabled) {
    return null;
  }

  schedulerTimer = setInterval(() => {
    runScheduledPhoneVerificationAutomation(config, "interval");
  }, config.intervalMs);

  if (typeof schedulerTimer.unref === "function") {
    schedulerTimer.unref();
  }

  if (config.runOnStart) {
    schedulerStartupTimer = setTimeout(() => {
      runScheduledPhoneVerificationAutomation(config, "startup");
    }, 1500);
    if (typeof schedulerStartupTimer.unref === "function") {
      schedulerStartupTimer.unref();
    }
  }

  logInfo("phone_verification_automation_scheduler_enabled", {
    intervalMinutes: Number(config.intervalMinutes || 0),
    channels: Array.isArray(config.channels) ? config.channels : [],
    runOnStart: config.runOnStart === true
  });

  return {
    stop: stopPhoneVerificationAutomationScheduler,
    config
  };
}

module.exports = {
  getCurrentPhoneVerificationAutomationSchedulerConfig: () => currentSchedulerConfig,
  getPhoneVerificationAutomationSchedulerStatus: () => {
    const enabled = Boolean(currentSchedulerConfig && currentSchedulerConfig.enabled);
    const active = Boolean(schedulerTimer || schedulerStartupTimer);
    return {
      healthy: enabled ? active : true,
      enabled,
      active,
      inFlight: schedulerInFlight === true,
      intervalMs: Number(currentSchedulerConfig && currentSchedulerConfig.intervalMs ? currentSchedulerConfig.intervalMs : 0),
      channels: Array.isArray(currentSchedulerConfig && currentSchedulerConfig.channels)
        ? [...currentSchedulerConfig.channels]
        : []
    };
  },
  runScheduledPhoneVerificationAutomation,
  startPhoneVerificationAutomationScheduler,
  stopPhoneVerificationAutomationScheduler
};
