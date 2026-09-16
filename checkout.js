const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const AUTH_STORAGE_KEY = "electromart_auth_v1";
const OFFLINE_ORDERS_KEY = "electromart_offline_orders_v1";
const ORDER_NOTIFICATIONS_STORAGE_KEY = "electromart_order_notifications_v1";
const API_BASE_OVERRIDE_KEY = "electromart_api_base_url";
const OFFLINE_DEMO_STORAGE_KEY = "electromart_allow_offline_demo";
const COUPON_STORAGE_KEY = "electromart_coupon_v1";
const DELIVERY_SLOT_STORAGE_KEY = "electromart_delivery_slot_v1";

function resolveRenewedTaxProfile(product) {
  const searchable = `${product.category || ""} ${product.name || ""}`.toLowerCase();
  const isDisplay = /(^|\s)(tv|television|monitor|display)(\s|$)/.test(searchable);
  return isDisplay ? { hsnCode: "85287200", gstRate: 0.28 } : { hsnCode: "84713010", gstRate: 0.18 };
}

const checkoutItemsEl = document.getElementById("checkoutItems");
const summaryItemsEl = document.getElementById("summaryItems");
const subtotalEl = document.getElementById("subtotalValue");
const shippingEl = document.getElementById("shippingValue");
const taxEl = document.getElementById("taxValue");
const totalEl = document.getElementById("totalValue");
const apiStatusEl = document.getElementById("apiStatus");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const fullNameEl = document.getElementById("fullName");
const mobileNoEl = document.getElementById("mobileNo");
const emailIdEl = document.getElementById("emailId");
const pinCodeEl = document.getElementById("pinCode");
const addressLineEl = document.getElementById("addressLine");
const cityNameEl = document.getElementById("cityName");
const stateNameEl = document.getElementById("stateName");
const paymentOptions = Array.from(document.querySelectorAll(".payment-option"));
const paymentMethodEls = Array.from(document.querySelectorAll("input[name='paymentMethod']"));
const walletDetails = document.getElementById("walletDetails");
const checkoutWalletBalanceBadge = document.getElementById("checkoutWalletBalanceBadge");
const checkoutWalletDetailBalance = document.getElementById("checkoutWalletDetailBalance");
const payInsufficientWarning = document.getElementById("payInsufficientWarning");
const payInsufficientMsg = document.getElementById("payInsufficientMsg");
const paymentMethodWallet = document.getElementById("paymentMethodWallet");

const PAY_BALANCE_KEY = "electromart_pay_balance_v1";
const PAY_TXNS_KEY = "electromart_pay_txns_v1";

function getWalletBalance() {
  const stored = localStorage.getItem(PAY_BALANCE_KEY);
  if (stored !== null && !isNaN(parseFloat(stored))) {
    return parseFloat(stored);
  }
  return 2450.00;
}

function saveWalletBalance(amount) {
  localStorage.setItem(PAY_BALANCE_KEY, String(amount));
  window.dispatchEvent(new Event("electromart_pay_balance_updated"));
}

function appendWalletTransaction(txn) {
  try {
    const raw = localStorage.getItem(PAY_TXNS_KEY);
    const txns = raw ? JSON.parse(raw) : [];
    txns.unshift(txn);
    localStorage.setItem(PAY_TXNS_KEY, JSON.stringify(txns));
  } catch (e) {}
}

function syncWalletBalanceState() {
  const bal = getWalletBalance();
  const formattedBal = `₹${bal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (checkoutWalletBalanceBadge) {
    checkoutWalletBalanceBadge.textContent = formattedBal;
  }
  if (checkoutWalletDetailBalance) {
    checkoutWalletDetailBalance.textContent = formattedBal;
  }

  const rows = getCartRows();
  const pricing = getPricingBreakdown(rows);
  const cartTotal = Number(pricing.total || 0);

  if (payInsufficientWarning) {
    if (cartTotal > bal) {
      const shortfall = cartTotal - bal;
      payInsufficientWarning.hidden = false;
      if (payInsufficientMsg) {
        payInsufficientMsg.textContent = `Insufficient balance (Shortfall: ₹${shortfall.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Please select an alternative payment method (e.g. UPI or Cards) or add money to your balance.`;
      }
    } else {
      payInsufficientWarning.hidden = true;
    }
  }
}

const upiDetails = document.getElementById("upiDetails");
const cardDetails = document.getElementById("cardDetails");
const netbankingDetails = document.getElementById("netbankingDetails");
const codDetails = document.getElementById("codDetails");
const upiIdEl = document.getElementById("upiId");
const cardNameEl = document.getElementById("cardName");
const cardNumberEl = document.getElementById("cardNumber");
const cardExpiryEl = document.getElementById("cardExpiry");
const cardCvvEl = document.getElementById("cardCvv");
const bankNameEl = document.getElementById("bankName");
const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponMessage = document.getElementById("couponMessage");
const removeCouponBtn = document.getElementById("removeCouponBtn");
const discountRow = document.getElementById("discountRow");
const discountValue = document.getElementById("discountValue");
const deliverySlotSelect = document.getElementById("deliverySlotSelect");
const deliverySlotHelp = document.getElementById("deliverySlotHelp");
const reservationMessage = document.getElementById("reservationMessage");
const gatewayBanner = document.getElementById("gatewayBanner");
const gatewayTitle = document.getElementById("gatewayTitle");
const gatewayDescription = document.getElementById("gatewayDescription");
const gatewaySummaryNote = document.getElementById("gatewaySummaryNote");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
const CHECKOUT_TOAST_STACK_ID = "checkoutToastStack";

let productMap = new Map();
let resolvedApiBaseUrl = "";
let apiResolvePromise = null;
let apiAvailable = false;
let currentCheckoutRows = [];
let razorpayScriptPromise = null;
let pendingGatewayOrderContext = null;
let paymentGatewayProvider = "simulated";
let paymentGatewayLabel = "Built-in payment flow";
const fallbackCatalogImage = "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80";
const COUPONS = {
  SAVE10: {
    type: "percent",
    value: 10,
    minSubtotal: 1000,
    maxDiscount: 500,
    label: "10% off up to ₹500"
  },
  FREESHIP: {
    type: "shipping",
    value: 19,
    minSubtotal: 499,
    label: "Free standard shipping"
  },
  WELCOME250: {
    type: "flat",
    value: 250,
    minSubtotal: 3000,
    label: "₹250 off on orders above ₹3,000"
  }
};

function isOfflineDemoEnabled() {
  if (window.ELECTROMART_ALLOW_OFFLINE_DEMO === true) {
    return true;
  }
  try {
    const raw = String(localStorage.getItem(OFFLINE_DEMO_STORAGE_KEY) || "").trim().toLowerCase();
    return ["1", "true", "yes", "on", "enabled"].includes(raw);
  } catch (error) {
    return false;
  }
}

function getOfflineDemoHelpText() {
  return `Start backend on port 4000, or explicitly enable local demo mode with localStorage key "${OFFLINE_DEMO_STORAGE_KEY}".`;
}

function ensureCheckoutToastStack() {
  const existing = document.getElementById(CHECKOUT_TOAST_STACK_ID);
  if (existing) {
    return existing;
  }
  const stack = document.createElement("section");
  stack.id = CHECKOUT_TOAST_STACK_ID;
  stack.className = "em-toast-stack";
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-atomic", "false");
  document.body.appendChild(stack);
  return stack;
}

function showCheckoutToast({ title = "", message = "", tone = "info", timeoutMs = 4200 } = {}) {
  const safeMessage = String(message || "").trim();
  if (!safeMessage) {
    return;
  }
  const stack = ensureCheckoutToastStack();
  const safeTone = ["success", "error", "warning", "info"].includes(String(tone || "").trim().toLowerCase())
    ? String(tone || "info").trim().toLowerCase()
    : "info";
  const toast = document.createElement("article");
  toast.className = `em-toast ${safeTone}`;

  if (title) {
    const heading = document.createElement("strong");
    heading.className = "em-toast-title";
    heading.textContent = String(title).trim();
    toast.appendChild(heading);
  }

  const body = document.createElement("p");
  body.className = "em-toast-message";
  body.textContent = safeMessage;
  toast.appendChild(body);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "em-toast-close";
  close.textContent = "Dismiss";
  close.addEventListener("click", () => {
    toast.remove();
  });
  toast.appendChild(close);

  stack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, Math.max(1200, Number(timeoutMs || 0)));
}

function loadDeliverySlotState() {
  try {
    const raw = localStorage.getItem(DELIVERY_SLOT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveDeliverySlotState(state) {
  try {
    localStorage.setItem(DELIVERY_SLOT_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    return;
  }
}
const staticCatalog = [
  { id: "1", name: "AstraBook Pro 14", price: 999, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: "2", name: "Nimbus Phone X", price: 749, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: "3", name: "Pulse ANC Headphones", price: 179, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: "4", name: "4K Smart Television", price: 699, image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80" },
  { id: "5", name: "Orbit Mechanical Keyboard", price: 109, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: "6", name: "ZenPad Tablet 11", price: 529, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80" },
  { id: "7", name: "Vector Gaming Laptop", price: 1299, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: "8", name: "Echo Smart Speaker", price: 89, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" },
  { id: "9", name: "Office Laptop Bundle (10 Units)", price: 8690, image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80" },
  { id: "10", name: "Retail Smartphone Pack (25 Units)", price: 15499, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80" },
  { id: "11", name: "Corporate Headset Case (50 Units)", price: 5399, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80" },
  { id: "12", name: "Accessory Mix Carton (100 Units)", price: 4299, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=80" },
  { id: "101", name: "Titan Office Tower i5", price: 899, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: "102", name: "Vortex Gaming Rig Ryzen 7", price: 1699, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "103", name: "Creator Studio Workstation", price: 1999, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: "104", name: "Business Desktop Bundle (5 Units)", price: 4299, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
  { id: "105", name: "Retail Gaming Pack (3 Units)", price: 4799, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: "201", name: "Epson EcoTank L3250", price: 15999, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80" },
  { id: "202", name: "HP LaserJet Pro MFP 4104", price: 28999, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df89?auto=format&fit=crop&w=900&q=80" },
  { id: "203", name: "Canon PIXMA G3770 All-in-One", price: 18499, image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80" },
  { id: "204", name: "Brother HL-L5100DN Office Pack (5 Units)", price: 124999, image: "https://images.unsplash.com/photo-1612810806695-30f7a8258391?auto=format&fit=crop&w=900&q=80" },
  { id: "205", name: "Zebra ZD230 Thermal Label Printer", price: 47999, image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=900&q=80" },
  { id: "4101", name: "CoreLite Barebone Kit", price: 299, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "4102", name: "Business Mini Barebone", price: 999, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: "4103", name: "Gaming Barebone Tower", price: 459, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: "4201", name: "Dell OptiFlex i5", price: 749, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
  { id: "4202", name: "HP ProDesk Fleet", price: 3399, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: "4203", name: "Lenovo ThinkCentre", price: 829, image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80" },
  { id: "4301", name: "Intel Core i5 14400F", price: 219, image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=900&q=80" },
  { id: "4302", name: "AMD Ryzen 7 7800X3D", price: 399, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: "4303", name: "Intel Core i7 Business Pack", price: 1899, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" },
  { id: "4401", name: "Tower Air Cooler 120mm", price: 49, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "4402", name: "240mm AIO Liquid Cooler", price: 119, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: "4403", name: "Workstation Cooling Pack", price: 499, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: "4501", name: "B760 DDR5 Motherboard", price: 179, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: "4502", name: "B650 AM5 Motherboard", price: 189, image: "https://images.unsplash.com/photo-1563770660941-10a6360765b5?auto=format&fit=crop&w=900&q=80" },
  { id: "4503", name: "Corporate Board Bundle", price: 1299, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: "4601", name: "16GB DDR5 Kit", price: 69, image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=80" },
  { id: "4602", name: "32GB DDR5 Kit", price: 129, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "4603", name: "Enterprise RAM Pack", price: 999, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" },
  { id: "4701", name: "NVIDIA RTX 4060", price: 329, image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=900&q=80" },
  { id: "4702", name: "AMD RX 7800 XT", price: 519, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: "4703", name: "GPU Retail Bundle", price: 3999, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "4801", name: "ATX Airflow Cabinet", price: 99, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: "4802", name: "mATX Compact Cabinet", price: 79, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: "4803", name: "System Integrator Cabinet Pack", price: 699, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" },
  { id: "4901", name: "120mm ARGB Fan", price: 19, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: "4902", name: "140mm High Airflow Fan", price: 29, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: "4903", name: "Cooling Fan Bulk Kit", price: 249, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: "5001", name: "650W 80+ Gold PSU", price: 99, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "5002", name: "850W 80+ Platinum PSU", price: 179, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: "5003", name: "SMPS Business Pack", price: 1299, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: "5101", name: "Line Interactive UPS 1kVA", price: 139, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: "5102", name: "UPS Replacement Battery", price: 89, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: "5103", name: "Enterprise UPS Pack", price: 1599, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" }
];

function loadCartMap() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveCartMap(cartMap) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
  } catch (error) {
    return;
  }
}

function loadCatalogMap() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveCatalogMap(catalogMap) {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
  } catch (error) {
    return;
  }
}

function upsertCatalogEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return;
  }
  const next = loadCatalogMap();
  entries.forEach((entry) => {
    const id = String(entry && entry.id ? entry.id : "").trim();
    if (!id) {
      return;
    }
    next[id] = {
      id,
      name: entry.name || `Product #${id}`,
      price: Number(entry.price || 0),
      image: entry.image || fallbackCatalogImage
    };
  });
  saveCatalogMap(next);
}

function removeCartEntries(productIds = []) {
  const cartMap = loadCartMap();
  let changed = false;
  (Array.isArray(productIds) ? productIds : []).forEach((productId) => {
    const key = String(productId || "").trim();
    if (!key || !(key in cartMap)) {
      return;
    }
    delete cartMap[key];
    changed = true;
  });
  if (changed) {
    saveCartMap(cartMap);
  }
}

function removeCatalogEntries(productIds = []) {
  const catalogMap = loadCatalogMap();
  let changed = false;
  (Array.isArray(productIds) ? productIds : []).forEach((productId) => {
    const key = String(productId || "").trim();
    if (!key || !(key in catalogMap)) {
      return;
    }
    delete catalogMap[key];
    changed = true;
  });
  if (changed) {
    saveCatalogMap(catalogMap);
  }
}

function getCatalogLabel(productId) {
  const key = String(productId || "").trim();
  if (!key) {
    return "This item";
  }
  const catalogMap = loadCatalogMap();
  if (catalogMap[key] && catalogMap[key].name) {
    return String(catalogMap[key].name);
  }
  return `Product ${key}`;
}

function formatRemovedItemsMessage(productIds = []) {
  const labels = (Array.isArray(productIds) ? productIds : [])
    .map((productId) => getCatalogLabel(productId))
    .filter(Boolean);
  if (labels.length === 0) {
    return "One or more unavailable items were removed from your cart. Review your order summary and try again.";
  }
  if (labels.length === 1) {
    return `${labels[0]} is no longer available and was removed from your cart. Review your order summary and try again.`;
  }
  return `${labels.length} unavailable items were removed from your cart. Review your order summary and try again.`;
}

function syncUnavailableCartItems(validIds) {
  const safeValidIds = validIds instanceof Set ? validIds : new Set();
  if (safeValidIds.size === 0) {
    return [];
  }
  const staleIds = Object.keys(loadCartMap()).filter((productId) => !safeValidIds.has(String(productId || "").trim()));
  if (!staleIds.length) {
    return [];
  }
  removeCartEntries(staleIds);
  removeCatalogEntries(staleIds);
  return staleIds;
}

function extractMissingProductIdsFromError(error) {
  const message = String(error && error.message ? error.message : "").trim();
  const match = message.match(/Product\s+([A-Za-z0-9-]+)\s+was not found\.?/i);
  if (!match || !match[1]) {
    return [];
  }
  return [String(match[1]).trim()];
}

function refreshCheckoutState() {
  const rows = getCartRows();
  renderCheckoutItems(rows);
  renderSummary(rows);
  syncWalletBalanceState();
  return rows;
}

function setApiStatus(status, message) {
  if (!apiStatusEl) {
    return;
  }
  apiStatusEl.classList.remove("connected", "disconnected");
  if (status === "connected") {
    apiStatusEl.classList.add("connected");
  } else if (status === "disconnected") {
    apiStatusEl.classList.add("disconnected");
  }
  apiStatusEl.textContent = message;
}

function isGatewayBackedCheckout(method = getSelectedPaymentMethod()) {
  return apiAvailable && paymentGatewayProvider === "razorpay" && method !== "cod" && method !== "wallet";
}

function updatePaymentCallToAction() {
  const method = getSelectedPaymentMethod();
  const offlineDemoEnabled = !apiAvailable && isOfflineDemoEnabled();
  const onlineCheckout = (apiAvailable && method !== "cod" && method !== "wallet") || method === "wallet";
  const gatewayActive = isGatewayBackedCheckout(method);
  if (gatewayBanner) {
    gatewayBanner.hidden = !onlineCheckout || method === "wallet";
  }
  if (gatewaySummaryNote) {
    gatewaySummaryNote.hidden = !onlineCheckout || method === "wallet";
    gatewaySummaryNote.textContent = gatewayActive
      ? "Razorpay secure checkout will open on the next step."
      : "A secure payment step will open after order review.";
  }
  const gatewayBadge = gatewayBanner ? gatewayBanner.querySelector(".gateway-badge") : null;
  if (gatewayBadge) {
    gatewayBadge.textContent = gatewayActive ? "Razorpay" : "Secure Pay";
  }
  if (gatewayTitle) {
    gatewayTitle.textContent = gatewayActive
      ? "Secure payment powered by Razorpay"
      : "Secure payment";
  }
  if (gatewayDescription) {
    gatewayDescription.textContent = gatewayActive
      ? `${paymentGatewayLabel} will open after you review your order details.`
      : "Choose an online payment method to continue with secure payment.";
  }
  if (placeOrderBtn) {
    placeOrderBtn.classList.toggle("gateway-active", onlineCheckout && method !== "wallet");
    placeOrderBtn.disabled = !apiAvailable && !offlineDemoEnabled && method !== "wallet";
    placeOrderBtn.textContent = method === "wallet"
      ? "1-Click Pay with ElectroMart Balance"
      : gatewayActive
        ? "Continue to Razorpay"
        : onlineCheckout
          ? "Continue to Secure Payment"
          : offlineDemoEnabled
            ? "Place local demo order"
            : "Backend required";
  }
}

async function fetchPaymentGatewayConfig() {
  if (!apiAvailable) {
    paymentGatewayProvider = "simulated";
    paymentGatewayLabel = "Built-in payment flow";
    updatePaymentCallToAction();
    return;
  }

  try {
    const apiBaseUrl = await resolveApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/payments/config`);
    const data = await response.json().catch(() => null);
    if (response.ok && data && typeof data === "object") {
      paymentGatewayProvider = String(data.provider || "simulated").trim().toLowerCase() || "simulated";
      paymentGatewayLabel = String(data.onlineCheckoutLabel || (paymentGatewayProvider === "razorpay" ? "Razorpay" : "Built-in payment flow")).trim();
    } else {
      paymentGatewayProvider = "simulated";
      paymentGatewayLabel = "Built-in payment flow";
    }
  } catch (error) {
    paymentGatewayProvider = "simulated";
    paymentGatewayLabel = "Built-in payment flow";
  }
  updatePaymentCallToAction();
}

function loadOfflineOrders() {
  try {
    const raw = localStorage.getItem(OFFLINE_ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveOfflineOrders(orders) {
  try {
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
  } catch (error) {
    return;
  }
}

function loadOfflineOrderNotifications() {
  try {
    const raw = localStorage.getItem(ORDER_NOTIFICATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveOfflineOrderNotifications(list) {
  try {
    localStorage.setItem(ORDER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    return;
  }
}

function appendOfflineOrderNotification(orderId, createdAt, eventKey, eventLabel) {
  const session = readSession() || {};
  const notifications = loadOfflineOrderNotifications();
  notifications.unshift({
    id: `LOCAL-NOTIFY-${Date.now()}`,
    orderId: String(orderId || ""),
    userId: String(session.id || ""),
    email: String(session.email || "").trim().toLowerCase(),
    eventKey: String(eventKey || ""),
    eventLabel: String(eventLabel || ""),
    status: "sent",
    provider: "local",
    subject: `${String(eventLabel || "Order update")} for ${String(orderId || "")}`,
    text: "",
    messageId: `LOCAL-MSG-${Date.now()}`,
    error: "",
    triggeredBy: "offline-order-create",
    triggeredFrom: "checkout-local",
    createdAt,
    sentAt: createdAt,
    eventCreatedAt: createdAt
  });
  saveOfflineOrderNotifications(notifications.slice(0, 100));
}

function getApiCandidates() {
  const candidates = [];
  const fromWindow = String(window.ELECTROMART_API_BASE_URL || "").trim();
  const fromStorage = String(localStorage.getItem(API_BASE_OVERRIDE_KEY) || "").trim();
  if (fromWindow) {
    candidates.push(fromWindow);
  }
  if (fromStorage) {
    candidates.push(fromStorage);
  }

  const { protocol, hostname, port } = window.location;
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  candidates.push(`${origin}/api`);
  candidates.push("http://localhost:4000/api");
  candidates.push("http://127.0.0.1:4000/api");

  return Array.from(new Set(candidates.map((item) => item.replace(/\/+$/, ""))));
}

async function probeApi(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/health`, { method: "GET" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function resolveApiBaseUrl() {
  if (resolvedApiBaseUrl) {
    return resolvedApiBaseUrl;
  }
  if (apiResolvePromise) {
    return apiResolvePromise;
  }

  apiResolvePromise = (async () => {
    const candidates = getApiCandidates();
    for (const candidate of candidates) {
      const ok = await probeApi(candidate);
      if (ok) {
        resolvedApiBaseUrl = candidate;
        apiAvailable = true;
        setApiStatus("connected", `Connected: ${candidate}`);
        return resolvedApiBaseUrl;
      }
    }
    apiAvailable = false;
    setApiStatus("disconnected", "Backend API unavailable. Start backend on port 4000.");
    throw new Error("Unable to connect to backend API. Start backend on port 4000 or set ELECTROMART_API_BASE_URL.");
  })();

  try {
    return await apiResolvePromise;
  } finally {
    apiResolvePromise = null;
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getSessionOrRedirect() {
  const session = readSession();
  if (!session || !session.token) {
    window.location.href = "auth.html";
    return null;
  }
  return session;
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function normalizeCouponCode(value) {
  return String(value || "").trim().toUpperCase();
}

function loadCouponState() {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveCouponState(state) {
  try {
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    return;
  }
}

function clearCouponState() {
  try {
    localStorage.removeItem(COUPON_STORAGE_KEY);
  } catch (error) {
    return;
  }
}

function evaluateCoupon(code, subtotal, shipping) {
  const normalized = normalizeCouponCode(code);
  const coupon = COUPONS[normalized];
  if (!normalized) {
    return { code: "", valid: false, amount: 0, message: "" };
  }
  if (!coupon) {
    return { code: normalized, valid: false, amount: 0, message: "Invalid coupon code." };
  }
  if (subtotal < Number(coupon.minSubtotal || 0)) {
    return {
      code: normalized,
      valid: false,
      amount: 0,
      message: `Add ${money(Number(coupon.minSubtotal || 0) - subtotal)} more to use ${normalized}.`
    };
  }

  let amount = 0;
  if (coupon.type === "percent") {
    amount = subtotal * (Number(coupon.value || 0) / 100);
    if (coupon.maxDiscount) {
      amount = Math.min(amount, Number(coupon.maxDiscount));
    }
  } else if (coupon.type === "flat") {
    amount = Number(coupon.value || 0);
  } else if (coupon.type === "shipping") {
    amount = Math.min(shipping, Number(coupon.value || 0));
  }

  return {
    code: normalized,
    valid: true,
    amount: Math.min(subtotal + shipping, Math.max(0, amount)),
    message: `${normalized} applied: ${coupon.label}`
  };
}

function fallbackImage() {
  return fallbackCatalogImage;
}

function getCartRows() {
  const cachedCatalog = loadCatalogMap();
  const cartMap = loadCartMap();
  return Object.entries(cartMap)
    .map(([id, qty]) => {
      if (Number(qty) <= 0) {
        return null;
      }
      let product = productMap.get(String(id)) || cachedCatalog[String(id)] || null;
      if (!product && typeof window !== "undefined" && Array.isArray(window.ELECTROMART_RENEWED_CATALOG)) {
        const rp = window.ELECTROMART_RENEWED_CATALOG.find((item) => String(item.id) === String(id));
        if (rp) {
          const renewedTaxProfile = resolveRenewedTaxProfile(rp);
          product = {
            id: String(rp.id),
            name: rp.name.includes("Certified Renewed") ? rp.name : `[Certified Renewed - Grade ${rp.renewedGrade || 'A'}] ${rp.name}`,
            price: Number(rp.renewedPrice || 0),
            image: rp.image || fallbackImage(),
            stock: 10,
            isRenewed: true,
            renewedGrade: rp.renewedGrade || "A",
            gradeLabel: rp.gradeLabel,
            batteryHealth: rp.batteryHealth,
            warrantyDuration: "6 Months",
            hsnCode: renewedTaxProfile.hsnCode,
            gstRate: renewedTaxProfile.gstRate
          };
        }
      }
      if (!product) {
        return {
          id: String(id),
          name: `Product #${id}`,
          price: 0,
          image: fallbackImage(),
          quantity: Number(qty)
        };
      }
      return {
        id: String(product.id),
        name: product.name,
        price: Number(product.price || 0),
        image: product.image || fallbackImage(),
        stock: Number(product.stock),
        quantity: Number(qty),
        category: product.category || "",
        hsnCode: product.hsnCode || (String(product.category || "").toLowerCase().includes("battery") ? "85076000" : "84713010"),
        gstRate: typeof product.gstRate === "number" ? product.gstRate : 0.18,
        isRenewed: Boolean(product.isRenewed),
        renewedGrade: product.renewedGrade || null,
        warrantyDuration: product.warrantyDuration || (product.isRenewed ? "6 Months" : null),
        protectionPlan: typeof window !== "undefined" && typeof window.getSelectedProtection === "function" && typeof window.buildProtectionLine === "function"
          ? window.buildProtectionLine(product, window.getSelectedProtection(product.id))
          : null
      };
    })
    .filter(Boolean);
}

function getReservationState(rows) {
  const lowStockRows = rows.filter((row) => Number.isFinite(Number(row.stock)) && Number(row.stock) > 0 && Number(row.stock) <= 3);
  const outOfStockRows = rows.filter((row) => Number.isFinite(Number(row.stock)) && Number(row.stock) <= 0);
  const reservationUntil = new Date(Date.now() + 15 * 60 * 1000);
  return {
    hasLowStock: lowStockRows.length > 0,
    hasOutOfStock: outOfStockRows.length > 0,
    lowStockRows,
    outOfStockRows,
    reservationUntil
  };
}

function isPrimeActive() {
  try {
    if (typeof localStorage === "undefined") return false;
    const raw = localStorage.getItem("electromart_prime_status_v1");
    const parsed = raw ? JSON.parse(raw) : null;
    return Boolean(parsed && parsed.active);
  } catch {
    return false;
  }
}

function buildDeliverySlots(rows) {
  const reservation = getReservationState(rows);
  const primeActive = isPrimeActive();
  const now = new Date();
  const slots = [];
  for (let dayOffset = 1; dayOffset <= 3; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const dateLabel = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    const primeTag = primeActive && dayOffset === 1 ? " (Prime Free Express)" : "";
    slots.push({
      id: `${dayOffset}-morning`,
      label: `${dateLabel} · 8 AM - 12 PM${primeTag}`,
      eta: dayOffset === 1 ? (primeActive ? "Prime Express Delivery · Free" : "Earliest available") : "Standard delivery"
    });
    slots.push({
      id: `${dayOffset}-afternoon`,
      label: `${dateLabel} · 12 PM - 4 PM`,
      eta: "Business hours delivery"
    });
    slots.push({
      id: `${dayOffset}-evening`,
      label: `${dateLabel} · 4 PM - 9 PM`,
      eta: reservation.hasLowStock ? "Recommended for reserved items" : "Popular evening slot"
    });
  }
  if (reservation.hasOutOfStock) {
    return slots.slice(2).map((slot) => ({ ...slot, eta: `${slot.eta} · subject to stock refresh` }));
  }
  return slots;
}

function syncDeliverySlot(rows) {
  if (!deliverySlotSelect) {
    return;
  }
  const slots = buildDeliverySlots(rows);
  const saved = loadDeliverySlotState();
  const reservation = getReservationState(rows);
  deliverySlotSelect.innerHTML = slots.map((slot) => `<option value="${slot.id}">${slot.label}</option>`).join("");
  const selected = slots.find((slot) => slot.id === saved?.id) || slots[0] || null;
  if (selected) {
    deliverySlotSelect.value = selected.id;
    saveDeliverySlotState(selected);
    if (deliverySlotHelp) {
      deliverySlotHelp.textContent = selected.eta;
    }
  }
  if (reservationMessage) {
    if (reservation.hasOutOfStock) {
      reservationMessage.textContent = "Some items are out of stock. Choose a later slot or update the cart before placing the order.";
      reservationMessage.classList.add("error");
    } else if (reservation.hasLowStock) {
      reservationMessage.textContent = `Low stock items are reserved until ${reservation.reservationUntil.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}. Complete checkout before then.`;
      reservationMessage.classList.remove("error");
    } else {
      reservationMessage.textContent = "Your items are available. Pick any slot that fits your schedule.";
      reservationMessage.classList.remove("error");
    }
  }
}

function renderCheckoutItems(rows) {
  if (rows.length === 0) {
    checkoutItemsEl.innerHTML = "<div class='empty-message'>Your cart is empty. Add products before checkout.</div>";
    placeOrderBtn.disabled = true;
    return;
  }

  let exCart = {};
  try {
    exCart = JSON.parse(localStorage.getItem("electromart_exchange_cart_v1") || "{}");
  } catch (e) {}

  const hasAnyExchange = rows.some((r) => exCart[String(r.id)] && exCart[String(r.id)].finalValue);

  const doorstepNoticeHtml = hasAnyExchange ? `
    <div class="checkout-exchange-doorstep-notice" style="background:#fff8e7;border:1px solid #e77600;border-radius:6px;padding:8px 12px;margin:0 0 12px 0;font-size:12px;color:#0f1111;">
      🚚 <strong>Doorstep Device Exchange:</strong> Keep your old device powered on (50%+ battery) with iCloud/Google accounts removed and data backed up for instant verification at the time of delivery.
    </div>
  ` : "";

  checkoutItemsEl.innerHTML = doorstepNoticeHtml + rows.map((row) => {
    const ex = exCart[String(row.id)];
    const exchangeHtml = (ex && ex.finalValue) ? `
      <div class="checkout-exchange-pill" style="display:inline-block;background:#e7f4f5;border:1px solid #007185;padding:2px 8px;border-radius:4px;font-size:12px;color:#007185;margin-top:4px;">
        🔄 <strong>Exchange:</strong> ${ex.modelName || "Device"} (IMEI/SN: ${ex.imei || "Verified"}) · <strong style="color:#007600;">-${money(ex.finalValue)}</strong>
      </div>
    ` : "";
    const renewedHtml = row.isRenewed ? `
      <div class="checkout-renewed-pill" style="display:inline-block;background:#e8f7ee;border:1px solid #067d62;padding:2px 8px;border-radius:4px;font-size:12px;color:#067d62;margin-top:4px;font-weight:600;">
        ♻️ <strong>Certified Renewed:</strong> Grade ${row.renewedGrade || 'A'} · 6 Months Warranty
      </div>
    ` : "";
    const protectionHtml = row.protectionPlan ? `
      <div class="checkout-protection-pill" style="display:inline-block;background:#eef8f7;border:1px solid #8bc9c5;padding:2px 8px;border-radius:4px;font-size:12px;color:#00635f;margin-top:4px;font-weight:600;">
        🛡️ <strong>${row.protectionPlan.name}</strong> · ${money(row.protectionPlan.price)} + 18% GST
      </div>
    ` : "";

    return `
      <article class="checkout-item">
        <img src="${row.image}" alt="${row.name}" loading="lazy" />
        <div>
          <h3>${row.name}</h3>
          <p>Qty: ${row.quantity}</p>
          ${exchangeHtml}
          ${renewedHtml}
          ${protectionHtml}
        </div>
        <strong class="item-line-total">${money(row.quantity * row.price)}</strong>
      </article>
    `;
  }).join("");
  placeOrderBtn.disabled = false;
}

function getPricingBreakdown(rows) {
  const itemCount = rows.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = rows.reduce((sum, row) => sum + row.quantity * row.price + (row.protectionPlan ? row.quantity * row.protectionPlan.price : 0), 0);
  const primeActive = isPrimeActive();
  const shipping = itemCount > 0 ? (primeActive || subtotal >= 499 ? 0 : 19) : 0;
  const couponState = loadCouponState();
  const coupon = evaluateCoupon(couponState?.code || "", subtotal, shipping);
  const appliedCoupon = COUPONS[coupon.code] || null;
  const nonShippingDiscount = coupon.valid && appliedCoupon?.type !== "shipping" ? coupon.amount : 0;
  const discountRatio = subtotal > 0 ? Math.max(0, 1 - (nonShippingDiscount / subtotal)) : 1;

  let totalGst = 0;
  const gstBreakdownByRate = {};

  rows.forEach((item) => {
    [item, item.protectionPlan].filter(Boolean).forEach((line) => {
      const itemSubtotal = line.price * item.quantity;
      const discountedItemSubtotal = itemSubtotal * discountRatio;
      const rate = typeof line.gstRate === "number" ? line.gstRate : 0.18;
      const itemGst = discountedItemSubtotal * rate;
      totalGst += itemGst;
      const rateKey = String(Math.round(rate * 100));
      gstBreakdownByRate[rateKey] = (gstBreakdownByRate[rateKey] || 0) + itemGst;
    });
  });

  let totalExchangeDiscount = 0;
  let exCart = {};
  try {
    exCart = JSON.parse(localStorage.getItem("electromart_exchange_cart_v1") || "{}");
  } catch (e) {}
  rows.forEach((row) => {
    const ex = exCart[String(row.id)];
    if (ex && ex.finalValue) {
      totalExchangeDiscount += Number(ex.finalValue);
    }
  });

  const roundedTax = Math.round(totalGst * 100) / 100;
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedDiscount = Math.round(coupon.amount * 100) / 100;
  const total = Math.max(0, Math.round((roundedSubtotal + shipping + roundedTax - roundedDiscount - totalExchangeDiscount) * 100) / 100);

  const rates = Object.keys(gstBreakdownByRate);
  let gstLabelSuffix = "18%";
  if (rates.length === 1) {
    gstLabelSuffix = `${rates[0]}%`;
  } else if (rates.length > 1) {
    const blended = subtotal > 0 ? Math.round((roundedTax / Math.max(1, subtotal - nonShippingDiscount)) * 100) : 18;
    gstLabelSuffix = `${blended}%`;
  }

  return {
    itemCount,
    subtotal: roundedSubtotal,
    shipping,
    tax: roundedTax,
    total,
    coupon,
    exchangeDiscount: totalExchangeDiscount,
    gstBreakdownByRate,
    gstLabelSuffix
  };
}

function renderSummary(rows) {
  currentCheckoutRows = rows.slice();
  const breakdown = getPricingBreakdown(rows);
  const { itemCount, subtotal, shipping, tax, total, coupon } = breakdown;

  summaryItemsEl.textContent = String(itemCount);
  const checkoutHeaderCountEl = document.getElementById("checkoutHeaderItemCount");
  if (checkoutHeaderCountEl) {
    checkoutHeaderCountEl.textContent = String(itemCount);
  }
  subtotalEl.textContent = money(subtotal);
  shippingEl.textContent = money(shipping);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(total);

  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = window.EM_TRANSLATIONS?.[currentLang] || window.EM_TRANSLATIONS?.en || {};

  const checkoutTaxLabel = document.getElementById("checkoutTaxLabel");
  if (checkoutTaxLabel) {
    const gstPrefix = t.estimated_gst || "Estimated GST";
    checkoutTaxLabel.textContent = `${gstPrefix} (${breakdown.gstLabelSuffix || "18%"}):`;
  }
  const checkoutSubtotalLabel = document.getElementById("checkoutSubtotalLabel");
  if (checkoutSubtotalLabel) {
    checkoutSubtotalLabel.textContent = t.subtotal_excl_tax || "Subtotal (Excl. Tax)";
  }

  if (couponInput) {
    couponInput.value = coupon.code || "";
  }
  if (couponMessage) {
    couponMessage.textContent = coupon.message || "";
    couponMessage.classList.toggle("error", Boolean(coupon.code) && !coupon.valid);
  }
  if (discountRow && discountValue) {
    const showDiscount = Number(coupon.amount || 0) > 0;
    discountRow.hidden = !showDiscount;
    discountValue.textContent = `-${money(coupon.amount || 0)}`;
  }
  const checkoutExRow = document.getElementById("checkoutExchangeDiscountRow");
  const checkoutExVal = document.getElementById("checkoutExchangeDiscountValue");
  if (checkoutExRow && checkoutExVal) {
    const showEx = Number(breakdown.exchangeDiscount || 0) > 0;
    checkoutExRow.hidden = !showEx;
    checkoutExVal.textContent = `-${money(breakdown.exchangeDiscount || 0)}`;
  }
  if (removeCouponBtn) {
    removeCouponBtn.hidden = !coupon.code;
  }
  const freeShippingTagRow = document.getElementById("freeShippingTagRow");
  if (freeShippingTagRow) {
    freeShippingTagRow.hidden = !(shipping === 0 && itemCount > 0);
  }
  const gstSplitBreakdown = document.getElementById("gstSplitBreakdown");
  if (gstSplitBreakdown) {
    const rateKeys = Object.keys(breakdown.gstBreakdownByRate || {});
    if (rateKeys.length > 1) {
      gstSplitBreakdown.hidden = false;
      gstSplitBreakdown.innerHTML = rateKeys.map((rate) => {
        const amt = breakdown.gstBreakdownByRate[rate];
        return `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #565959; padding-left: 8px; margin-top: 2px;">
          <span>&bull; GST (${rate}%):</span>
          <span>${money(Math.round(amt * 100) / 100)}</span>
        </div>`;
      }).join("");
    } else {
      gstSplitBreakdown.hidden = true;
    }
  }
  syncDeliverySlot(rows);
}

function isAddressValid() {
  return [
    fullNameEl.value,
    mobileNoEl.value,
    emailIdEl.value,
    pinCodeEl.value,
    addressLineEl.value,
    cityNameEl.value,
    stateNameEl.value
  ].every((value) => String(value).trim().length > 0);
}

function buildShippingAddress() {
  return [
    `Name: ${fullNameEl.value.trim()}`,
    `Mobile: ${mobileNoEl.value.trim()}`,
    `Email: ${emailIdEl.value.trim()}`,
    `Address: ${addressLineEl.value.trim()}, ${cityNameEl.value.trim()}, ${stateNameEl.value.trim()} - ${pinCodeEl.value.trim()}`
  ].join(" | ");
}

function getSelectedDeliverySlot() {
  const value = String(deliverySlotSelect?.value || "").trim();
  const slots = buildDeliverySlots(currentCheckoutRows);
  return slots.find((slot) => slot.id === value) || loadDeliverySlotState() || null;
}

function handleDeliverySlotChange() {
  const selected = getSelectedDeliverySlot();
  if (!selected) {
    return;
  }
  saveDeliverySlotState(selected);
  if (deliverySlotHelp) {
    deliverySlotHelp.textContent = selected.eta;
  }
}

function getSelectedPaymentMethod() {
  const selected = paymentMethodEls.find((element) => element.checked);
  return selected ? selected.value : "upi";
}

function showPaymentDetails(method) {
  upiDetails.hidden = method !== "upi";
  cardDetails.hidden = method !== "card";
  netbankingDetails.hidden = method !== "netbanking";
  codDetails.hidden = method !== "cod";
  if (walletDetails) {
    walletDetails.hidden = method !== "wallet";
  }

  paymentOptions.forEach((option) => {
    const input = option.querySelector("input[name='paymentMethod']");
    if (!input) {
      return;
    }
    option.classList.toggle("active", input.value === method);
  });
  syncWalletBalanceState();
  updatePaymentCallToAction();
}

function isPaymentValid() {
  const method = getSelectedPaymentMethod();

  if (method === "wallet") {
    const pricing = getPricingBreakdown(getCartRows());
    const cartTotal = Number(pricing.total || 0);
    const bal = getWalletBalance();
    return bal >= cartTotal;
  }

  if (method === "upi") {
    return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(String(upiIdEl.value).trim());
  }

  if (method === "card") {
    const cardNameOk = String(cardNameEl.value).trim().length >= 3;
    const cardNumberOk = /^\d{16}$/.test(String(cardNumberEl.value).replace(/\s+/g, ""));
    const expiryOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(cardExpiryEl.value).trim());
    const cvvOk = /^\d{3,4}$/.test(String(cardCvvEl.value).trim());
    return cardNameOk && cardNumberOk && expiryOk && cvvOk;
  }

  if (method === "netbanking") {
    return String(bankNameEl.value).trim().length > 0;
  }

  return true;
}

async function fetchProducts() {
  upsertCatalogEntries(staticCatalog);
  const cachedCatalog = loadCatalogMap();
  productMap = new Map(Object.values(cachedCatalog).map((product) => [String(product.id), product]));

  if (!apiAvailable) {
    return [];
  }

  const apiBaseUrl = await resolveApiBaseUrl();

  let response;
  try {
    response = await fetch(`${apiBaseUrl}/products`);
  } catch (error) {
    return [];
  }

  const data = await response.json().catch(() => null);
  if (response.ok && data && Array.isArray(data.products)) {
    const apiProducts = data.products.map((product) => ({
      id: String(product.id),
      name: product.name || "Unnamed Product",
      price: Number(product.price || 0),
      image: product.image || fallbackImage()
    }));
    upsertCatalogEntries(apiProducts);
    productMap = new Map(apiProducts.map((product) => [String(product.id), product]));
    return syncUnavailableCartItems(new Set(apiProducts.map((product) => String(product.id))));
  }
  return [];
}

async function postAuthed(path, body, token) {
  const apiBaseUrl = await resolveApiBaseUrl();
  let response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    setApiStatus("disconnected", "Order/Payment API connection failed.");
    throw new Error("Unable to connect to order/payment API.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      setApiStatus("disconnected", "Session expired. Please sign in again.");
    }
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

function loadRazorpayCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error("Razorpay Checkout SDK loaded without exposing Razorpay."));
      }
    };
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout SDK."));
    document.head.appendChild(script);
  }).finally(() => {
    razorpayScriptPromise = null;
  });

  return razorpayScriptPromise;
}

function normalizeRazorpayFailurePayload(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  const error = source.error && typeof source.error === "object" ? source.error : source;
  const metadata = error && typeof error.metadata === "object" ? error.metadata : {};
  return {
    provider: "razorpay",
    status: "failed",
    error: {
      code: String(error.code || "").trim(),
      description: String(error.description || error.reason || "Payment failed at Razorpay.").trim(),
      reason: String(error.reason || "").trim(),
      source: String(error.source || "").trim(),
      step: String(error.step || "").trim(),
      metadata: {
        payment_id: String(metadata.payment_id || source.razorpay_payment_id || "").trim(),
        order_id: String(metadata.order_id || source.razorpay_order_id || "").trim()
      }
    }
  };
}

async function openRazorpayCheckout(payment) {
  const Razorpay = await loadRazorpayCheckoutScript();
  const checkout = payment && payment.checkout && typeof payment.checkout === "object" ? payment.checkout : null;
  if (!checkout || !checkout.orderId || !checkout.key) {
    throw new Error("Razorpay checkout details are missing from the payment intent.");
  }

  return new Promise((resolve, reject) => {
    const instance = new Razorpay({
      key: checkout.key,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      order_id: checkout.orderId,
      callback_url: checkout.callbackUrl,
      prefill: checkout.prefill || {},
      notes: checkout.notes || {},
      theme: checkout.theme || {},
      modal: {
        ondismiss: () => resolve({ dismissed: true })
      },
      handler: (response) => resolve({
        success: true,
        response: {
          provider: "razorpay",
          ...response
        }
      })
    });

    instance.on("payment.failed", (response) => {
      resolve({
        failed: true,
        response: normalizeRazorpayFailurePayload(response)
      });
    });

    try {
      instance.open();
    } catch (error) {
      reject(error);
    }
  });
}

async function createOrReuseOnlineOrder(session, orderPayload) {
  if (pendingGatewayOrderContext && pendingGatewayOrderContext.orderId) {
    return {
      id: pendingGatewayOrderContext.orderId,
      reused: true
    };
  }

  const order = await postAuthed("/orders", orderPayload, session.token);
  pendingGatewayOrderContext = {
    orderId: order.id
  };
  return order;
}

function setPlacingState(isPlacing) {
  placeOrderBtn.disabled = isPlacing;
  if (isPlacing) {
    placeOrderBtn.textContent = isGatewayBackedCheckout()
      ? `Opening ${paymentGatewayLabel}...`
      : "Placing order...";
    return;
  }
  updatePaymentCallToAction();
}

function createOfflineOrder(rows, paymentMethod, shippingAddress) {
  const { subtotal, shipping, tax, total, coupon } = getPricingBreakdown(rows);
  const deliverySlot = getSelectedDeliverySlot();
  const reservation = getReservationState(rows);
  const orderId = `OFFLINE-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const orders = loadOfflineOrders();
  orders.unshift({
    id: orderId,
    createdAt,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "authorized" : "paid",
    status: "processing",
    statusHistory: [
      {
        key: "ordered",
        status: "processing",
        label: "Order placed",
        createdAt,
        inferred: false
      },
      {
        key: "processing",
        status: "processing",
        label: "Preparing for dispatch",
        createdAt,
        inferred: false
      }
    ],
    shippingAddress,
    deliverySlot,
    reservationUntil: reservation.hasLowStock ? reservation.reservationUntil.toISOString() : "",
    items: rows.map((row) => ({
      productId: String(row.id),
      name: row.name,
      price: Number(row.price || 0),
      quantity: Number(row.quantity || 1),
      lineTotal: Number(row.quantity || 1) * Number(row.price || 0),
      isRenewed: Boolean(row.isRenewed),
      renewedGrade: row.renewedGrade || null,
      warrantyDuration: row.warrantyDuration || (row.isRenewed ? "6 Months" : null)
      , protectionPlan: row.protectionPlan || null
    })),
    subtotal,
    shipping,
    tax,
    total,
    discount: Number(coupon.amount || 0),
    couponCode: coupon.code || "",
    exchangeDiscount: Number(getPricingBreakdown(rows).exchangeDiscount || 0),
    exchangeDetails: (() => {
      let exCart = {};
      try { exCart = JSON.parse(localStorage.getItem("electromart_exchange_cart_v1") || "{}"); } catch (e) {}
      const details = [];
      rows.forEach((r) => {
        const ex = exCart[String(r.id)];
        if (ex && ex.finalValue) {
          details.push({
            targetProductId: String(r.id),
            targetProductName: r.name,
            exchangeDeviceName: ex.modelName,
            category: ex.category,
            brand: ex.brand,
            imei: ex.imei,
            discountAmount: Number(ex.finalValue),
            status: "pending_pickup"
          });
        }
      });
      return details.length > 0 ? details : null;
    })()
  });
  try {
    localStorage.removeItem("electromart_exchange_cart_v1");
  } catch (e) {}
  saveOfflineOrders(orders);
  appendOfflineOrderNotification(orderId, createdAt, "ordered", "Order placed");

  if (paymentMethod === "wallet") {
    const curBal = getWalletBalance();
    const nextBal = Math.max(0, curBal - total);
    saveWalletBalance(nextBal);

    appendWalletTransaction({
      id: "txn_" + Date.now(),
      date: "Just now",
      description: `Paid for Order #${orderId}`,
      type: "orders",
      category: "debit",
      amount: total,
      status: "Successful"
    });

    const cashbackAmt = Math.round(total * 0.05 * 100) / 100;
    if (cashbackAmt > 0) {
      saveWalletBalance(nextBal + cashbackAmt);
      appendWalletTransaction({
        id: "txn_cb_" + Date.now(),
        date: "Just now",
        description: `5% Cashback on Order #${orderId}`,
        type: "cashback",
        category: "credit",
        amount: cashbackAmt,
        status: "Successful"
      });
    }
  }

  return orderId;
}

function getPaymentConfirmationDetails() {
  const method = getSelectedPaymentMethod();
  if (method === "wallet") {
    return {
      method: "wallet",
      walletId: "user@electromart",
      source: "ElectroMart Pay Balance"
    };
  }
  if (method === "upi") {
    return {
      method,
      upiId: String(upiIdEl.value || "").trim()
    };
  }
  if (method === "card") {
    return {
      method,
      cardName: String(cardNameEl.value || "").trim(),
      cardNumber: String(cardNumberEl.value || "").replace(/\s+/g, ""),
      expiry: String(cardExpiryEl.value || "").trim(),
      cvv: String(cardCvvEl.value || "").trim()
    };
  }
  if (method === "netbanking") {
    return {
      method,
      bankName: String(bankNameEl.value || "").trim()
    };
  }
  return {
    method
  };
}

async function handlePlaceOrder() {
  const session = getSessionOrRedirect();
  if (!session) {
    return;
  }

  const rows = getCartRows();
  if (rows.length === 0) {
    return;
  }

  if (!isAddressValid()) {
    if (typeof openAccordionStep === "function") {
      openAccordionStep(1);
    }
    showCheckoutToast({
      title: "Address incomplete",
      message: "Please fill all delivery address fields before placing your order.",
      tone: "warning"
    });
    return;
  }

  if (!isPaymentValid()) {
    if (typeof openAccordionStep === "function") {
      openAccordionStep(2);
    }
    showCheckoutToast({
      title: "Payment details required",
      message: "Please complete valid payment details for the selected payment method.",
      tone: "warning"
    });
    return;
  }

  const paymentMethod = getSelectedPaymentMethod();
  const shippingAddress = buildShippingAddress();
  const pricing = getPricingBreakdown(rows);
  const deliverySlot = getSelectedDeliverySlot();
  const reservation = getReservationState(rows);

  if (!apiAvailable) {
    if (!isOfflineDemoEnabled()) {
      showCheckoutToast({
        title: "Backend unavailable",
        message: `Backend is unavailable. ${getOfflineDemoHelpText()}`,
        tone: "error",
        timeoutMs: 5600
      });
      return;
    }
    const offlineOrderId = createOfflineOrder(rows, paymentMethod, shippingAddress);
    saveCartMap({});
    clearCouponState();
    window.location.href = `thank-you.html?orderId=${encodeURIComponent(offlineOrderId)}`;
    return;
  }

  const orderPayload = {
    items: rows.map((row) => ({ productId: String(row.id), quantity: row.quantity })),
    shippingAddress,
    paymentMethod,
    couponCode: pricing.coupon.code || undefined,
    deliverySlot,
    reservationUntil: reservation.hasLowStock ? reservation.reservationUntil.toISOString() : ""
  };

  setPlacingState(true);
  try {
    let order;
    let payment;
    if (paymentMethod === "cod") {
      order = await postAuthed("/orders", orderPayload, session.token);
      payment = await postAuthed("/payments/intent", { orderId: order.id, method: paymentMethod }, session.token);
    } else {
      try {
        order = await createOrReuseOnlineOrder(session, orderPayload);
        payment = await postAuthed("/payments/intent", { orderId: order.id, method: paymentMethod }, session.token);
      } catch (error) {
        const lowerMessage = String(error.message || "").toLowerCase();
        if (pendingGatewayOrderContext?.orderId && error.status === 409 && lowerMessage.includes("already paid")) {
          const paidOrderId = order?.id || pendingGatewayOrderContext.orderId;
          saveCartMap({});
          clearCouponState();
          pendingGatewayOrderContext = null;
          window.location.href = `thank-you.html?orderId=${encodeURIComponent(paidOrderId || "")}`;
          return;
        }
        if (pendingGatewayOrderContext?.orderId && (error.status === 404 || (error.status === 409 && lowerMessage.includes("cancelled")))) {
          pendingGatewayOrderContext = null;
          order = await createOrReuseOnlineOrder(session, orderPayload);
          payment = await postAuthed("/payments/intent", { orderId: order.id, method: paymentMethod }, session.token);
        } else {
          throw error;
        }
      }
    }

    if (paymentMethod !== "cod") {
      if (payment.checkoutProvider === "razorpay") {
        const checkoutOutcome = await openRazorpayCheckout(payment);
        if (checkoutOutcome.success) {
          await postAuthed(`/payments/${payment.id}/confirm`, {
            details: checkoutOutcome.response
          }, session.token);
        } else if (checkoutOutcome.failed) {
          pendingGatewayOrderContext = null;
          await postAuthed(`/payments/${payment.id}/confirm`, {
            details: checkoutOutcome.response
          }, session.token);
          return;
        } else {
          showCheckoutToast({
            title: "Payment window closed",
            message: "This order is still pending payment confirmation. If Razorpay confirms the payment later, your order will update automatically.",
            tone: "info",
            timeoutMs: 5600
          });
          return;
        }
      } else {
        await postAuthed(`/payments/${payment.id}/confirm`, {
          details: getPaymentConfirmationDetails()
        }, session.token);
      }
    }

    pendingGatewayOrderContext = null;
    saveCartMap({});
    clearCouponState();
    try {
      localStorage.removeItem("electromart_exchange_cart_v1");
    } catch (e) {}
    window.location.href = `thank-you.html?orderId=${encodeURIComponent(order.id)}`;
  } catch (error) {
    const missingProductIds = extractMissingProductIdsFromError(error);
    if (missingProductIds.length > 0) {
      removeCartEntries(missingProductIds);
      removeCatalogEntries(missingProductIds);
      refreshCheckoutState();
      showCheckoutToast({
        title: "Cart updated",
        message: formatRemovedItemsMessage(missingProductIds),
        tone: "warning",
        timeoutMs: 5400
      });
      return;
    }
    const baseMessage = error.message || "Unable to place order right now.";
    const retryHint = error.status === 402 || (error.payload && error.payload.retryable)
      ? " Update your payment details and try again."
      : "";
    if (error.status === 402) {
      pendingGatewayOrderContext = null;
    }
    showCheckoutToast({
      title: "Order failed",
      message: `${baseMessage}${retryHint}`,
      tone: "error",
      timeoutMs: 5600
    });
  } finally {
    setPlacingState(false);
  }
}

function prefillAddressFromSession() {
  const session = readSession();
  let defaultSaved = null;
  try {
    const rawSaved = localStorage.getItem("electromart_saved_addresses_v1");
    if (rawSaved) {
      const list = JSON.parse(rawSaved);
      if (Array.isArray(list) && list.length > 0) {
        defaultSaved = list.find((a) => a.isDefault) || list[0];
      }
    }
  } catch (e) {}

  if (fullNameEl && !fullNameEl.value.trim()) {
    fullNameEl.value = defaultSaved?.name || session?.name || "John Doe";
  }
  if (emailIdEl && !emailIdEl.value.trim()) {
    emailIdEl.value = defaultSaved?.email || session?.email || "customer@example.com";
  }
  if (mobileNoEl && !mobileNoEl.value.trim()) {
    mobileNoEl.value = defaultSaved?.phone || session?.mobile || "9876543210";
  }
  if (pinCodeEl && !pinCodeEl.value.trim()) {
    pinCodeEl.value = defaultSaved?.pincode || "110001";
  }
  if (addressLineEl && !addressLineEl.value.trim()) {
    addressLineEl.value = defaultSaved?.address || "Flat 402, Royal Palms, Connaught Place";
  }
  if (cityNameEl && !cityNameEl.value.trim()) {
    cityNameEl.value = defaultSaved?.city || "New Delhi";
  }
  if (stateNameEl && !stateNameEl.value.trim()) {
    stateNameEl.value = defaultSaved?.state || "Delhi";
  }
}

function openAccordionStep(stepNum) {
  const step1Card = document.getElementById("step1Card");
  const step2Card = document.getElementById("step2Card");
  const step3Card = document.getElementById("step3Card");

  const step1Body = document.getElementById("step1Body");
  const step2Body = document.getElementById("step2Body");
  const step3Body = document.getElementById("step3Body");

  const step1ChangeBtn = document.getElementById("step1ChangeBtn");
  const step2ChangeBtn = document.getElementById("step2ChangeBtn");

  if (!step1Card || !step2Card || !step3Card) return;

  if (stepNum === 1) {
    step1Card.classList.add("active");
    if (step1Body) step1Body.hidden = false;
    if (step1ChangeBtn) step1ChangeBtn.hidden = true;

    step2Card.classList.remove("active");
    if (step2Body) step2Body.hidden = true;

    step3Card.classList.remove("active");
    if (step3Body) step3Body.hidden = true;

    step1Card.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (stepNum === 2) {
    step1Card.classList.remove("active");
    if (step1Body) step1Body.hidden = true;
    if (step1ChangeBtn) step1ChangeBtn.hidden = false;

    step2Card.classList.add("active");
    if (step2Body) step2Body.hidden = false;
    if (step2ChangeBtn) step2ChangeBtn.hidden = true;

    step3Card.classList.remove("active");
    if (step3Body) step3Body.hidden = true;

    step2Card.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (stepNum === 3) {
    step1Card.classList.remove("active");
    if (step1Body) step1Body.hidden = true;
    if (step1ChangeBtn) step1ChangeBtn.hidden = false;

    step2Card.classList.remove("active");
    if (step2Body) step2Body.hidden = true;
    if (step2ChangeBtn) step2ChangeBtn.hidden = false;

    step3Card.classList.add("active");
    if (step3Body) step3Body.hidden = false;

    step3Card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateAddressSummary() {
  const addressSummaryText = document.getElementById("addressSummaryText");
  const addrPreviewName = document.getElementById("addrPreviewName");
  const addrPreviewDetails = document.getElementById("addrPreviewDetails");

  const name = fullNameEl ? fullNameEl.value.trim() : "";
  const address = addressLineEl ? addressLineEl.value.trim() : "";
  const city = cityNameEl ? cityNameEl.value.trim() : "";
  const state = stateNameEl ? stateNameEl.value.trim() : "";
  const pin = pinCodeEl ? pinCodeEl.value.trim() : "";

  if (addrPreviewName && name) {
    addrPreviewName.textContent = name;
  }
  if (addrPreviewDetails && address) {
    addrPreviewDetails.textContent = `${address}, ${city}, ${state} ${pin}`;
  }

  if (addressSummaryText) {
    if (name && address) {
      const selectedRadio = document.querySelector('input[name="selectedSavedAddr"]:checked');
      const tagLabel = selectedRadio && selectedRadio.value === "work" ? " (Work)" : " (Home)";
      addressSummaryText.textContent = `${name}${tagLabel}, ${address}, ${city} ${pin}`;
    } else {
      addressSummaryText.textContent = "";
    }
  }
}

function updatePaymentSummary() {
  const paymentSummaryText = document.getElementById("paymentSummaryText");
  if (!paymentSummaryText) return;

  const method = getSelectedPaymentMethod();
  if (method === "wallet") {
    const bal = getWalletBalance();
    paymentSummaryText.textContent = `ElectroMart Pay Balance (Available: ₹${bal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  } else if (method === "upi") {
    const upiVal = upiIdEl ? upiIdEl.value.trim() : "";
    paymentSummaryText.textContent = upiVal ? `ElectroMart Pay UPI: ${upiVal}` : "ElectroMart Pay UPI (Instant via UPI App)";
  } else if (method === "card") {
    const num = cardNumberEl ? cardNumberEl.value.replace(/\s+/g, "") : "";
    const last4 = num.length >= 4 ? num.slice(-4) : "XXXX";
    paymentSummaryText.textContent = `Credit/Debit Card ending in ${last4}`;
  } else if (method === "netbanking") {
    const bank = bankNameEl ? bankNameEl.value : "Net Banking";
    paymentSummaryText.textContent = `Net Banking (${bank || "Selected Bank"})`;
  } else if (method === "cod") {
    paymentSummaryText.textContent = "Cash on Delivery (Pay on Delivery)";
  }
}

function setupAccordionFlow() {
  const step1Card = document.getElementById("step1Card");
  if (!step1Card) return;

  const useAddressBtn = document.getElementById("useAddressBtn");
  const usePaymentBtn = document.getElementById("usePaymentBtn");
  const step1ChangeBtn = document.getElementById("step1ChangeBtn");
  const step2ChangeBtn = document.getElementById("step2ChangeBtn");
  const stepPlaceOrderBtn = document.getElementById("stepPlaceOrderBtn");
  const toggleNewAddressLink = document.getElementById("toggleNewAddressLink");
  const newAddressForm = document.getElementById("newAddressForm");

  // Saved Address Cards handling (Home / Work)
  const addrCardDefault = document.getElementById("addrCardDefault");
  const addrCardWork = document.getElementById("addrCardWork");
  const savedAddrRadios = document.querySelectorAll('input[name="selectedSavedAddr"]');

  const SAVED_ADDRESSES_STORAGE_KEY = "electromart_saved_addresses_v1";

  function loadSavedAddressesForCheckout() {
    try {
      const raw = localStorage.getItem(SAVED_ADDRESSES_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          const defaultItem = list.find((a) => a.isDefault) || list[0];
          const workItem = list.find((a) => a.type === "work" && a !== defaultItem) || list.find((a) => a !== defaultItem) || defaultItem;
          return {
            default: {
              name: defaultItem.name || "John Doe",
              phone: defaultItem.phone || "9876543210",
              email: defaultItem.email || "customer@example.com",
              address: defaultItem.address || "Flat 402, Royal Palms, Connaught Place",
              city: defaultItem.city || "New Delhi",
              state: defaultItem.state || "Delhi",
              pincode: defaultItem.pincode || "110001"
            },
            work: {
              name: workItem.name || "John Doe",
              phone: workItem.phone || "9876543210",
              email: workItem.email || "customer@example.com",
              address: workItem.address || "ElectroMart Tech Park, Building 4B, Cyber City, DLF Phase 2",
              city: workItem.city || "Gurugram",
              state: workItem.state || "Haryana",
              pincode: workItem.pincode || "122002"
            }
          };
        }
      }
    } catch (e) {}

    return {
      default: {
        name: "John Doe",
        phone: "9876543210",
        email: "customer@example.com",
        address: "Flat 402, Royal Palms, Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001"
      },
      work: {
        name: "John Doe",
        phone: "9876543210",
        email: "customer@example.com",
        address: "ElectroMart Tech Park, Building 4B, Cyber City, DLF Phase 2",
        city: "Gurugram",
        state: "Haryana",
        pincode: "122002"
      }
    };
  }

  const SAVED_ADDRESSES = loadSavedAddressesForCheckout();

  const addrPreviewName = document.getElementById("addrPreviewName");
  const addrPreviewDetails = document.getElementById("addrPreviewDetails");
  const addrPreviewPhone = document.getElementById("addrPreviewPhone");
  if (addrPreviewName) addrPreviewName.textContent = SAVED_ADDRESSES.default.name;
  if (addrPreviewDetails) addrPreviewDetails.textContent = `${SAVED_ADDRESSES.default.address}, ${SAVED_ADDRESSES.default.city} ${SAVED_ADDRESSES.default.pincode}`;
  if (addrPreviewPhone) addrPreviewPhone.textContent = SAVED_ADDRESSES.default.phone;

  if (addrCardWork) {
    const workDetailsEl = addrCardWork.querySelector(".amz-addr-details");
    const workPhoneEl = addrCardWork.querySelector(".amz-addr-phone span");
    const workNameEl = addrCardWork.querySelector("strong");
    if (workNameEl) workNameEl.textContent = SAVED_ADDRESSES.work.name;
    if (workDetailsEl) workDetailsEl.textContent = `${SAVED_ADDRESSES.work.address}, ${SAVED_ADDRESSES.work.city} ${SAVED_ADDRESSES.work.pincode}`;
    if (workPhoneEl) workPhoneEl.textContent = SAVED_ADDRESSES.work.phone;
  }

  function selectSavedAddress(type) {
    const addr = SAVED_ADDRESSES[type] || SAVED_ADDRESSES.default;
    if (fullNameEl) fullNameEl.value = addr.name;
    if (mobileNoEl) mobileNoEl.value = addr.phone;
    if (emailIdEl) emailIdEl.value = addr.email;
    if (addressLineEl) addressLineEl.value = addr.address;
    if (cityNameEl) cityNameEl.value = addr.city;
    if (stateNameEl) stateNameEl.value = addr.state;
    if (pinCodeEl) pinCodeEl.value = addr.pincode;

    if (addrCardDefault) addrCardDefault.classList.toggle("selected", type === "default");
    if (addrCardWork) addrCardWork.classList.toggle("selected", type === "work");

    updateAddressSummary();
  }

  savedAddrRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      selectSavedAddress(e.target.value);
    });
  });

  if (addrCardDefault) {
    addrCardDefault.addEventListener("click", () => {
      const radio = addrCardDefault.querySelector('input[type="radio"]');
      if (radio && !radio.checked) {
        radio.checked = true;
        selectSavedAddress("default");
      }
    });
  }

  if (addrCardWork) {
    addrCardWork.addEventListener("click", () => {
      const radio = addrCardWork.querySelector('input[type="radio"]');
      if (radio && !radio.checked) {
        radio.checked = true;
        selectSavedAddress("work");
      }
    });
  }

  if (toggleNewAddressLink) {
    toggleNewAddressLink.addEventListener("click", () => {
      if (newAddressForm) {
        newAddressForm.scrollIntoView({ behavior: "smooth", block: "center" });
        if (fullNameEl) fullNameEl.focus();
      }
    });
  }

  if (useAddressBtn) {
    useAddressBtn.addEventListener("click", () => {
      if (!isAddressValid()) {
        showCheckoutToast({
          title: "Address incomplete",
          message: "Please fill all delivery address fields before proceeding.",
          tone: "warning"
        });
        return;
      }
      updateAddressSummary();
      openAccordionStep(2);
    });
  }

  if (usePaymentBtn) {
    usePaymentBtn.addEventListener("click", () => {
      const method = getSelectedPaymentMethod();
      if (method === "wallet") {
        const pricing = getPricingBreakdown(getCartRows());
        const cartTotal = Number(pricing.total || 0);
        const bal = getWalletBalance();
        if (cartTotal > bal) {
          const shortfall = cartTotal - bal;
          showCheckoutToast({
            title: "Insufficient ElectroMart Pay Balance",
            message: `Shortfall of ₹${shortfall.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Please select another payment method (e.g. UPI or Cards) or add money.`,
            tone: "warning"
          });
          return;
        }
      } else if (!isPaymentValid()) {
        showCheckoutToast({
          title: "Payment details required",
          message: "Please complete valid payment details for the selected method.",
          tone: "warning"
        });
        return;
      }
      updatePaymentSummary();
      openAccordionStep(3);
    });
  }

  if (step1ChangeBtn) {
    step1ChangeBtn.addEventListener("click", () => {
      openAccordionStep(1);
    });
  }

  if (step2ChangeBtn) {
    step2ChangeBtn.addEventListener("click", () => {
      openAccordionStep(2);
    });
  }

  if (stepPlaceOrderBtn) {
    stepPlaceOrderBtn.addEventListener("click", handlePlaceOrder);
  }

  [fullNameEl, mobileNoEl, pinCodeEl, addressLineEl, cityNameEl, stateNameEl].forEach((input) => {
    if (input) {
      input.addEventListener("input", updateAddressSummary);
    }
  });

  paymentMethodEls.forEach((radio) => {
    radio.addEventListener("change", () => {
      paymentMethodEls.forEach((el) => {
        const parentLabel = el.closest(".payment-option");
        if (parentLabel) parentLabel.classList.toggle("active", el.checked);
      });
      updatePaymentSummary();
    });
  });

  [upiIdEl, cardNumberEl, bankNameEl].forEach((input) => {
    if (input) {
      input.addEventListener("input", updatePaymentSummary);
    }
  });

  updateAddressSummary();
  updatePaymentSummary();
}

async function initCheckout() {
  const session = getSessionOrRedirect();
  if (!session) {
    return;
  }

  // Empty Cart Protection: Redirect to cart.html if user navigates with zero items
  const isSmokeOrTest = Boolean(
    typeof window !== "undefined" && (
      window.__QA_SMOKE__ ||
      window.location.search.includes("smoke") ||
      window.location.search.includes("test") ||
      window.location.search.includes("qa") ||
      window.location.search.includes("no-redirect")
    )
  );
  const currentCartMap = loadCartMap();
  const totalCartItems = Object.values(currentCartMap).reduce((sum, q) => sum + Number(q || 0), 0);
  if (!isSmokeOrTest && totalCartItems <= 0) {
    window.location.replace("cart.html");
    return;
  }

  prefillAddressFromSession();
  showPaymentDetails(getSelectedPaymentMethod());
  setupAccordionFlow();

  try {
    await resolveApiBaseUrl();
  } catch (error) {
    setApiStatus(
      "disconnected",
      isOfflineDemoEnabled()
        ? "Backend offline: local demo checkout enabled."
        : `Backend offline: checkout disabled. ${getOfflineDemoHelpText()}`
    );
  }
  await fetchPaymentGatewayConfig();

  const removedUnavailableItems = await fetchProducts();
  refreshCheckoutState();
  if (removedUnavailableItems.length > 0) {
    showCheckoutToast({
      title: "Cart updated",
      message: formatRemovedItemsMessage(removedUnavailableItems),
      tone: "warning",
      timeoutMs: 5400
    });
  }
}

paymentMethodEls.forEach((element) => {
  element.addEventListener("change", () => {
    showPaymentDetails(getSelectedPaymentMethod());
  });
});

if (applyCouponBtn) {
  applyCouponBtn.addEventListener("click", () => {
    const code = normalizeCouponCode(couponInput?.value || "");
    const breakdown = getPricingBreakdown(currentCheckoutRows);
    const coupon = evaluateCoupon(code, breakdown.subtotal, breakdown.shipping);
    if (!coupon.code) {
      clearCouponState();
    } else if (!COUPONS[coupon.code]) {
      if (couponMessage) {
        couponMessage.textContent = coupon.message;
        couponMessage.classList.add("error");
      }
      return;
    } else {
      saveCouponState({ code: coupon.code });
    }
    renderSummary(currentCheckoutRows);
  });
}

if (removeCouponBtn) {
  removeCouponBtn.addEventListener("click", () => {
    clearCouponState();
    renderSummary(currentCheckoutRows);
  });
}

if (deliverySlotSelect) {
  deliverySlotSelect.addEventListener("change", handleDeliverySlotChange);
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", (e) => {
    if (e.key === PAY_BALANCE_KEY) {
      syncWalletBalanceState();
      updatePaymentSummary();
    }
    if (e.key === "electromart_prime_status_v1") {
      renderSummary(currentCheckoutRows);
    }
  });

  window.addEventListener("electromart_pay_balance_updated", () => {
    syncWalletBalanceState();
    updatePaymentSummary();
  });

  window.addEventListener("electromart_prime_updated", () => {
    renderSummary(currentCheckoutRows);
  });
}

placeOrderBtn.addEventListener("click", handlePlaceOrder);

initCheckout();
