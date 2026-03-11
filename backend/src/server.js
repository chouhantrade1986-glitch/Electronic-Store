require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ensureSeedData, getDbProvider } = require("./lib/db");
const { assertJwtSecretConfigured } = require("./lib/auth");
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

assertJwtSecretConfigured();
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
  return res.json({ ok: true, service: "electromart-backend", storageProvider: getDbProvider() });
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
  // eslint-disable-next-line no-console
  console.log(`ElectroMart backend running on port ${PORT}`);
  startOrderReservationExpiryScheduler();
  startPhoneVerificationAutomationScheduler();
});

