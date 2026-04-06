require("dotenv").config();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "data", "db.json");

console.log("Bootstrapping database...");
console.log("DB_PROVIDER:", process.env.DB_PROVIDER || "json");

// Create basic database structure
const initialDb = {
  users: [],
  products: [],
  orders: [],
  payments: [],
  afterSalesCases: [],
  adminAuditTrail: [],
  orderNotifications: [],
  paymentWebhookEvents: [],
  authOtpChallenges: [],
  backInStockRequests: [],
  backInStockNotifications: [],
  phoneVerificationReminders: [],
  inventorySettings: {
    defaultLowStockThreshold: 5,
    restockTarget: 10,
    categoryThresholds: {}
  },
  automationJobs: {},
  automationSettings: {},
  automationRunHistory: {}
};

try {
  fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
  console.log("Initial database structure created.");
} catch (error) {
  console.error("Error creating initial database:", error.message);
  process.exit(1);
}

// Now run ensureSeedData to populate with demo data
const { ensureSeedData } = require("./src/lib/db");
try {
  console.log("Calling ensureSeedData...");
  ensureSeedData();
  console.log("ensureSeedData completed.");
  console.log("Database bootstrap complete.");
} catch (error) {
  console.error("Error during ensureSeedData:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}