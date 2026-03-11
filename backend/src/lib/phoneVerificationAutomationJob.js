const { ensureSeedData, readDb, writeDb } = require("./db");
const {
  buildPhoneVerificationAutomationRunRecord,
  defaultPhoneVerificationAutomationJobState,
  ensurePhoneVerificationAutomationJobState,
  ensurePhoneVerificationAutomationRunHistory,
  getPhoneVerificationAutomationSnapshot,
  listPhoneVerificationReminderCandidates,
  runPhoneVerificationReminderAutomation
} = require("./phoneVerificationAutomation");
const {
  asBoolean,
  getPhoneVerificationAutomationEffectiveConfig,
  getPhoneVerificationAutomationJobConfig,
  normalizeChannels
} = require("./phoneVerificationAutomationSettings");

function buildJobStatus(result) {
  if (!result) {
    return "idle";
  }
  if (result.status >= 500 || (result.failedCount > 0 && result.deliveredCount === 0 && result.queuedCount === 0 && result.skippedCount === 0)) {
    return "failed";
  }
  if (result.deliveredCount > 0 || result.queuedCount > 0 || result.skippedCount > 0) {
    return "completed";
  }
  return "idle";
}

async function executePhoneVerificationAutomationJob(options = {}) {
  ensureSeedData();
  const db = readDb();
  const config = getPhoneVerificationAutomationEffectiveConfig(db, options);
  const job = ensurePhoneVerificationAutomationJobState(db);
  ensurePhoneVerificationAutomationRunHistory(db);
  const preRunCandidates = listPhoneVerificationReminderCandidates(db);
  const startedAt = new Date().toISOString();

  job.lastRunAt = startedAt;
  job.lastStatus = "running";
  job.lastTriggeredBy = config.actor;
  job.lastMessage = `Phone verification automation started by ${config.actor}.`;

  if (config.dryRun) {
    const snapshot = getPhoneVerificationAutomationSnapshot(db, config.snapshotLimit);
    return {
      ok: true,
      status: 200,
      message: "Dry run completed. No reminders were sent.",
      dryRun: true,
      job: {
        ...job,
        lastStatus: "idle"
      },
      snapshot
    };
  }

  const result = await runPhoneVerificationReminderAutomation(db, {
    limit: config.limit,
    channels: config.channels,
    actor: config.actor
  });

  const finishedAt = new Date().toISOString();
  Object.assign(job, {
    ...defaultPhoneVerificationAutomationJobState(),
    lastRunAt: startedAt,
    lastFinishedAt: finishedAt,
    lastStatus: buildJobStatus(result),
    lastMessage: result.message,
    lastTriggeredBy: config.actor,
    lastSummary: {
      deliveredCount: Number(result.deliveredCount || 0),
      queuedCount: Number(result.queuedCount || 0),
      failedCount: Number(result.failedCount || 0),
      skippedCount: Number(result.skippedCount || 0),
      affectedUsers: Number(result.affectedUsers || 0)
    }
  });

  db.automationRunHistory.phoneVerificationReminder.unshift(buildPhoneVerificationAutomationRunRecord({
    startedAt,
    finishedAt,
    status: job.lastStatus,
    message: result.message,
    actor: config.actor,
    trigger: config.trigger,
    channels: config.channels,
    limit: config.limit,
    candidateCount: preRunCandidates.length,
    eligibleCount: preRunCandidates.filter((item) => item.eligibleNow).length,
    deliveredCount: Number(result.deliveredCount || 0),
    queuedCount: Number(result.queuedCount || 0),
    failedCount: Number(result.failedCount || 0),
    skippedCount: Number(result.skippedCount || 0),
    affectedUsers: Number(result.affectedUsers || 0)
  }));
  db.automationRunHistory.phoneVerificationReminder = db.automationRunHistory.phoneVerificationReminder.slice(0, 120);

  writeDb(db);
  const snapshot = getPhoneVerificationAutomationSnapshot(db, config.snapshotLimit);
  return {
    ...result,
    job,
    snapshot
  };
}

module.exports = {
  asBoolean,
  executePhoneVerificationAutomationJob,
  getPhoneVerificationAutomationJobConfig,
  normalizeChannels
};
