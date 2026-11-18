require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { buildCorsOptions } = require("./lib/corsPolicy");
const { ensureSeedData, getDbProvider } = require("./lib/db");
const { assertRuntimeEnvPolicyConfigured } = require("./lib/envPolicy");
const { buildFrontendConfigScript } = require("./lib/frontendConfig");
const { logInfo } = require("./lib/logger");
const { getMetricsSnapshot } = require("./lib/monitoring");
const { buildRuntimeHealthSnapshot } = require("./lib/runtimeHealth");
const { registerIncidentHooks } = require("./lib/alertingPolicy");
const { startOrderReservationExpiryScheduler } = require("./lib/orderReservationExpiryScheduler");
const { startPhoneVerificationAutomationScheduler } = require("./lib/phoneVerificationAutomationScheduler");
const {
  attachRequestContext,
  errorHandler,
  requestLogger
} = require("./middleware/requestContextMiddleware");
const { serializeDbMutations } = require("./middleware/writeLockMiddleware");
const piiEncryption = require("./middleware/piiEncryption");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const giftCardRoutes = require("./routes/giftCardRoutes");
const corporateRoutes = require("./routes/corporateRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

assertRuntimeEnvPolicyConfigured(process.env);
const frontendConfigScript = buildFrontendConfigScript(process.env);
ensureSeedData();

app.set("trust proxy", 1);
app.use(cors(buildCorsOptions(process.env)));
app.use(attachRequestContext);
app.use(requestLogger);
app.use(express.json({
  limit: "128mb",
  verify: (req, res, buffer) => {
    req.rawBody = buffer && buffer.length ? buffer.toString("utf8") : "";
  }
}));
app.use(express.urlencoded({ extended: true, limit: "128mb" }));
app.use(piiEncryption);
app.use(serializeDbMutations);

app.get("/api/health", (req, res) => {
  const snapshot = buildRuntimeHealthSnapshot();
  return res.status(snapshot.ok ? 200 : 503).json(snapshot);
});

app.get("/api/config.js", (_req, res) => {
  return res
    .type("application/javascript")
    .set("Cache-Control", "no-store")
    .send(frontendConfigScript);
});

app.get("/api/metrics", (req, res) => {
  return res.json(getMetricsSnapshot());
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/exchange", exchangeRoutes);
app.use("/api/gift-cards", giftCardRoutes);
app.use("/api/corporate", corporateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

app.listen(PORT, () => {
  logInfo("backend_server_started", {
    port: Number(PORT),
    storageProvider: getDbProvider()
  }, {
    requestId: "startup"
  });
  registerIncidentHooks({
    service: "electromart-backend",
    env: process.env,
    onIncident: (payload) => {
      logInfo("backend_process_incident", payload, { requestId: "startup" });
    }
  });
  startOrderReservationExpiryScheduler();
  startPhoneVerificationAutomationScheduler();
});
