const { acquireWriteLock, ensureSeedData, readDb } = require("./db");
const {
  executePhoneVerificationAutomationJob,
} = require("./phoneVerificationAutomationJob");
const { getPhoneVerificationAutomationEffectiveConfig } = require("./phoneVerificationAutomationSettings");

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
    // eslint-disable-next-line no-console
    console.log("[phone-verification-automation] previous run still in progress, skipping.");
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
    // eslint-disable-next-line no-console
    console.log(`[phone-verification-automation] ${result.message}`);
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[phone-verification-automation] run failed:", error && error.message ? error.message : error);
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

  // eslint-disable-next-line no-console
  console.log(
    `[phone-verification-automation] scheduler enabled every ${config.intervalMinutes} minutes for ${config.channels.join(", ")}`
  );

  return {
    stop: stopPhoneVerificationAutomationScheduler,
    config
  };
}

module.exports = {
  getCurrentPhoneVerificationAutomationSchedulerConfig: () => currentSchedulerConfig,
  runScheduledPhoneVerificationAutomation,
  startPhoneVerificationAutomationScheduler,
  stopPhoneVerificationAutomationScheduler
};
