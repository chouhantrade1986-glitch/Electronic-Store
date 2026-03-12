require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ensureSeedData, getDbProvider } = require("./lib/db");
const { assertRuntimeEnvPolicyConfigured } = require("./lib/envPolicy");
const { logInfo } = require("./lib/logger");
const { getMetricsSnapshot } = require("./lib/monitoring");
const { buildRuntimeHealthSnapshot } = require("./lib/runtimeHealth");
const { startOrderReservationExpiryScheduler } = require("./lib/orderReservationExpiryScheduler");
const { startPhoneVerificationAutomationScheduler } = require("./lib/phoneVerificationAutomationScheduler");
const {
  attachRequestContext,
  errorHandler,
  requestLogger
} = require("./middleware/requestContextMiddleware");
const { serializeDbMutations } = require("./middleware/writeLockMiddleware");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

assertRuntimeEnvPolicyConfigured(process.env);
ensureSeedData();

app.set("trust proxy", 1);
app.use(cors());
app.use(attachRequestContext);
app.use(requestLogger);
app.use(express.json({
  limit: "128mb",
  verify: (req, res, buffer) => {
    req.rawBody = buffer && buffer.length ? buffer.toString("utf8") : "";
  }
}));
app.use(express.urlencoded({ extended: true, limit: "128mb" }));
app.use(serializeDbMutations);

app.get("/api/health", (req, res) => {
  const snapshot = buildRuntimeHealthSnapshot();
  return res.status(snapshot.ok ? 200 : 503).json(snapshot);
});

app.get("/api/metrics", (req, res) => {
  return res.json(getMetricsSnapshot());
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
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
  startOrderReservationExpiryScheduler();
  startPhoneVerificationAutomationScheduler();
});

