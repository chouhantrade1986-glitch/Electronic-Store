require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
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
const { globalRateLimiter } = require("./middleware/rateLimitingMiddleware");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const accountLockoutRoutes = require("./routes/accountLockoutRoutes");
const { apiKeyAuthMiddleware, createApiKeyRateLimiter } = require("./middleware/apiKeyAuthMiddleware");

const app = express();
const PORT = process.env.PORT || 4000;

// Security: Validate environment policy
assertRuntimeEnvPolicyConfigured(process.env);
ensureSeedData();

// Security: Trust proxy for proper IP logging
app.set("trust proxy", 1);

// Security: Helmet middleware - sets various HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Security: CORS configuration - restrict to known origins in production
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Security: Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Input validation failed",
      errors: errors.array().map(err => ({
        param: err.param,
        msg: err.msg
      }))
    });
  }
  next();
};

// Security: Request context and logging
app.use(attachRequestContext);
app.use(requestLogger);

// Security: Global rate limiting
app.use(globalRateLimiter);

// Security: Set request body size limits
app.use(express.json({
  limit: "10mb", // Reduced from 128mb for better security
  verify: (req, res, buffer) => {
    req.rawBody = buffer && buffer.length ? buffer.toString("utf8") : "";
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: "10mb" // Reduced from 128mb for better security
}));

// Security: Serialize database mutations
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

// API Key Management routes (admin endpoints)
app.use("/api/admin/api-keys", apiKeyRoutes);

// Account Lockout Management routes (admin endpoints)
app.use("/api/admin/account-lockouts", accountLockoutRoutes);

// Example protected route using API Key authentication
app.get(
  "/api/integrations/status",
  apiKeyAuthMiddleware,
  createApiKeyRateLimiter({ windowMs: 60000, maxRequests: 100 }),
  (req, res) => {
    return res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      authenticatedWith: {
        keyName: req.apiKey.name,
        keyId: req.apiKey.id
      }
    });
  }
);

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

