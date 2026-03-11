const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const AUTH_STORAGE_KEY = "electromart_auth_v1";
const OFFLINE_ORDERS_KEY = "electromart_offline_orders_v1";
const ORDER_NOTIFICATIONS_STORAGE_KEY = "electromart_order_notifications_v1";
const API_BASE_OVERRIDE_KEY = "electromart_api_base_url";
const OFFLINE_DEMO_STORAGE_KEY = "electromart_allow_offline_demo";
const COUPON_STORAGE_KEY = "electromart_coupon_v1";
const DELIVERY_SLOT_STORAGE_KEY = "electromart_delivery_slot_v1";

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
  return apiAvailable && paymentGatewayProvider === "razorpay" && method !== "cod";
}

function updatePaymentCallToAction() {
  const method = getSelectedPaymentMethod();
  const offlineDemoEnabled = !apiAvailable && isOfflineDemoEnabled();
  const onlineCheckout = apiAvailable && method !== "cod";
  const gatewayActive = isGatewayBackedCheckout(method);
  if (gatewayBanner) {
    gatewayBanner.hidden = !onlineCheckout;
  }
  if (gatewaySummaryNote) {
    gatewaySummaryNote.hidden = !onlineCheckout;
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
    placeOrderBtn.classList.toggle("gateway-active", onlineCheckout);
    placeOrderBtn.disabled = !apiAvailable && !offlineDemoEnabled;
    placeOrderBtn.textContent = gatewayActive
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
      const product = productMap.get(String(id)) || cachedCatalog[String(id)] || null;
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
        quantity: Number(qty)
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

function buildDeliverySlots(rows) {
  const reservation = getReservationState(rows);
  const now = new Date();
  const slots = [];
  for (let dayOffset = 1; dayOffset <= 3; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const dateLabel = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    slots.push({
      id: `${dayOffset}-morning`,
      label: `${dateLabel} · 8 AM - 12 PM`,
      eta: dayOffset === 1 ? "Earliest available" : "Standard delivery"
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

  checkoutItemsEl.innerHTML = rows.map((row) => `
    <article class="checkout-item">
      <img src="${row.image}" alt="${row.name}" loading="lazy" />
      <div>
        <h3>${row.name}</h3>
        <p>Qty: ${row.quantity}</p>
      </div>
      <strong class="item-line-total">${money(row.quantity * row.price)}</strong>
    </article>
  `).join("");
  placeOrderBtn.disabled = false;
}

function getPricingBreakdown(rows) {
  const itemCount = rows.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = rows.reduce((sum, row) => sum + row.quantity * row.price, 0);
  const shipping = itemCount > 0 ? 19 : 0;
  const couponState = loadCouponState();
  const coupon = evaluateCoupon(couponState?.code || "", subtotal, shipping);
  const appliedCoupon = COUPONS[coupon.code] || null;
  const taxableSubtotal = Math.max(0, subtotal - (coupon.valid && appliedCoupon?.type !== "shipping" ? coupon.amount : 0));
  const tax = taxableSubtotal * 0.08;
  const total = subtotal + shipping + tax - coupon.amount;
  return { itemCount, subtotal, shipping, tax, total, coupon };
}

function renderSummary(rows) {
  currentCheckoutRows = rows.slice();
  const { itemCount, subtotal, shipping, tax, total, coupon } = getPricingBreakdown(rows);

  summaryItemsEl.textContent = String(itemCount);
  subtotalEl.textContent = money(subtotal);
  shippingEl.textContent = money(shipping);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(total);
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
  if (removeCouponBtn) {
    removeCouponBtn.hidden = !coupon.code;
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

  paymentOptions.forEach((option) => {
    const input = option.querySelector("input[name='paymentMethod']");
    if (!input) {
      return;
    }
    option.classList.toggle("active", input.value === method);
  });
  updatePaymentCallToAction();
}

function isPaymentValid() {
  const method = getSelectedPaymentMethod();

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
      lineTotal: Number(row.quantity || 1) * Number(row.price || 0)
    })),
    subtotal,
    shipping,
    tax,
    total,
    discount: Number(coupon.amount || 0),
    couponCode: coupon.code || ""
  });
  saveOfflineOrders(orders);
  appendOfflineOrderNotification(orderId, createdAt, "ordered", "Order placed");
  return orderId;
}

function getPaymentConfirmationDetails() {
  const method = getSelectedPaymentMethod();
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
    showCheckoutToast({
      title: "Address incomplete",
      message: "Please fill all delivery address fields before placing your order.",
      tone: "warning"
    });
    return;
  }

  if (!isPaymentValid()) {
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
  if (!session) {
    return;
  }
  if (!fullNameEl.value.trim()) {
    fullNameEl.value = session.name || "";
  }
  if (!emailIdEl.value.trim()) {
    emailIdEl.value = session.email || "";
  }
  if (!mobileNoEl.value.trim()) {
    mobileNoEl.value = session.mobile || "";
  }
}

async function initCheckout() {
  const session = getSessionOrRedirect();
  if (!session) {
    return;
  }

  prefillAddressFromSession();
  showPaymentDetails(getSelectedPaymentMethod());

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

placeOrderBtn.addEventListener("click", handlePlaceOrder);

initCheckout();
