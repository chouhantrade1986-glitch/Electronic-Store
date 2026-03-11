const AUTH_STORAGE_KEY = "electromart_auth_v1";
const PROFILE_STORAGE_KEY = "electromart_profile_v1";
const OFFLINE_ORDERS_KEY = "electromart_offline_orders_v1";
const INVOICE_LOG_KEY = "electromart_invoice_log_v1";
const DEFAULT_PAYMENT_DUE_DAYS = 7;
const UPI_CONFIG = {
  upiId: "electromart.pay@okicici",
  payeeName: "ElectroMart Retail Pvt. Ltd."
};
const SELLER_INFO = {
  legalName: "ElectroMart Retail Pvt. Ltd.",
  address: "Okhla Industrial Area Phase II, New Delhi, Delhi - 110020",
  gstin: "07ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  state: "Delhi"
};
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const invoiceCard = document.getElementById("invoiceCard");
const invoiceMessage = document.getElementById("invoiceMessage");
const printBtn = document.getElementById("printBtn");
const duplicateBtn = document.getElementById("duplicateBtn");
const copyLabel = document.getElementById("copyLabel");
const invoiceNo = document.getElementById("invoiceNo");
const orderIdValue = document.getElementById("orderIdValue");
const invoiceDate = document.getElementById("invoiceDate");
const supplyDate = document.getElementById("supplyDate");
const dueDate = document.getElementById("dueDate");
const paymentMethod = document.getElementById("paymentMethod");
const sellerName = document.getElementById("sellerName");
const sellerAddress = document.getElementById("sellerAddress");
const sellerGstin = document.getElementById("sellerGstin");
const sellerPan = document.getElementById("sellerPan");
const sellerState = document.getElementById("sellerState");
const billName = document.getElementById("billName");
const billAddress = document.getElementById("billAddress");
const billEmail = document.getElementById("billEmail");
const billMobile = document.getElementById("billMobile");
const buyerGstin = document.getElementById("buyerGstin");
const shipAddress = document.getElementById("shipAddress");
const placeOfSupply = document.getElementById("placeOfSupply");
const deliverySlotValue = document.getElementById("deliverySlotValue");
const deliveryEtaValue = document.getElementById("deliveryEtaValue");
const reservationLine = document.getElementById("reservationLine");
const reservationValue = document.getElementById("reservationValue");
const trackingRefValue = document.getElementById("trackingRefValue");
const invoiceDeliveryTimeline = document.getElementById("invoiceDeliveryTimeline");
const invoiceItems = document.getElementById("invoiceItems");
const subtotalValue = document.getElementById("subtotalValue");
const discountRow = document.getElementById("discountRow");
const discountValue = document.getElementById("discountValue");
const couponRow = document.getElementById("couponRow");
const couponCodeValue = document.getElementById("couponCodeValue");
const gstRateValue = document.getElementById("gstRateValue");
const cgstValue = document.getElementById("cgstValue");
const sgstValue = document.getElementById("sgstValue");
const igstValue = document.getElementById("igstValue");
const shippingValue = document.getElementById("shippingValue");
const taxValue = document.getElementById("taxValue");
const totalValue = document.getElementById("totalValue");
const amountWords = document.getElementById("amountWords");
const paymentTermsLine = document.getElementById("paymentTermsLine");
const upiBlock = document.querySelector(".upi-block");
const upiQrImage = document.getElementById("upiQrImage");
const upiIdValue = document.getElementById("upiIdValue");
const upiPayeeName = document.getElementById("upiPayeeName");
const upiAmountValue = document.getElementById("upiAmountValue");
const upiPayLink = document.getElementById("upiPayLink");
const signSellerName = document.getElementById("signSellerName");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
const SHIPPING_ONLY_COUPONS = new Set(["FREESHIP"]);
const STATUS_HISTORY_LABELS = {
  ordered: "Order placed",
  processing: "Preparing for dispatch",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function readProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getOrderIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("orderId") || "").trim();
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

function loadInvoiceLog() {
  try {
    const raw = localStorage.getItem(INVOICE_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveInvoiceLog(log) {
  try {
    localStorage.setItem(INVOICE_LOG_KEY, JSON.stringify(log));
  } catch (error) {
    return;
  }
}

function upsertInvoiceLog(order, paymentOnDate) {
  if (!order || !order.id) {
    return;
  }
  const key = String(order.id);
  const log = loadInvoiceLog();
  const existing = log[key] || {};
  log[key] = {
    orderId: key,
    invoiceNo: `INV-${key.slice(0, 8).toUpperCase()}`,
    issuedAt: existing.issuedAt || order.createdAt || new Date().toISOString(),
    paymentReceivedAt: paymentOnDate || existing.paymentReceivedAt || "",
    updatedAt: new Date().toISOString()
  };
  saveInvoiceLog(log);
}

function addDays(isoString, days) {
  const base = new Date(isoString);
  if (Number.isNaN(base.getTime())) {
    return new Date();
  }
  base.setDate(base.getDate() + Number(days || 0));
  return base;
}

function extractState(addressText) {
  const text = String(addressText || "").toLowerCase();
  if (!text) {
    return "N/A";
  }
  const states = [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa",
    "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala",
    "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland",
    "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura",
    "uttar pradesh", "uttarakhand", "west bengal", "delhi"
  ];
  const found = states.find((state) => text.includes(state));
  if (!found) {
    return "N/A";
  }
  return found
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeHistoryKey(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  if (raw === "placed" || raw === "order_placed") {
    return "ordered";
  }
  if (raw === "packed") {
    return "processing";
  }
  return ["ordered", "processing", "shipped", "delivered", "cancelled"].includes(raw) ? raw : "";
}

function buildStatusHistoryEntry(key, createdAt, overrides = {}) {
  const normalizedKey = normalizeHistoryKey(key);
  if (!normalizedKey) {
    return null;
  }
  return {
    key: normalizedKey,
    status: normalizedKey === "ordered" ? "processing" : normalizedKey,
    label: String(overrides.label || STATUS_HISTORY_LABELS[normalizedKey] || normalizedKey),
    createdAt: String(createdAt || "").trim() || new Date().toISOString(),
    inferred: Boolean(overrides.inferred)
  };
}

function normalizeStatusHistory(list, createdAt, currentStatus) {
  const status = normalizeHistoryKey(currentStatus) || "processing";
  const orderedAt = String(createdAt || "").trim() || new Date().toISOString();
  const history = (Array.isArray(list) ? list : [])
    .map((entry) => buildStatusHistoryEntry(entry && (entry.key || entry.status), entry && entry.createdAt ? entry.createdAt : orderedAt, {
      label: entry && entry.label ? entry.label : "",
      inferred: entry && entry.inferred
    }))
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const byKey = new Map();
  history.forEach((entry) => {
    const previous = byKey.get(entry.key);
    if (!previous || (previous.inferred && !entry.inferred)) {
      byKey.set(entry.key, entry);
    }
  });

  if (!byKey.has("ordered")) {
    byKey.set("ordered", buildStatusHistoryEntry("ordered", orderedAt));
  }
  if (!byKey.has("processing")) {
    byKey.set("processing", buildStatusHistoryEntry("processing", orderedAt, {
      inferred: history.length === 0 || status !== "processing"
    }));
  }
  if (["shipped", "delivered", "cancelled"].includes(status) && !byKey.has(status)) {
    byKey.set(status, buildStatusHistoryEntry(status, orderedAt, { inferred: true }));
  }

  return Array.from(byKey.values())
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function getStatusEvent(order, key) {
  const normalizedKey = normalizeHistoryKey(key);
  if (!normalizedKey || !Array.isArray(order && order.statusHistory)) {
    return null;
  }
  const matches = order.statusHistory.filter((entry) => entry.key === normalizedKey);
  return matches.length ? matches[matches.length - 1] : null;
}

function normalizeOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal || items.reduce((sum, item) => {
    return sum + Number(item.quantity || 1) * Number(item.price || 0);
  }, 0));
  const shipping = Number(order.shipping || (items.length ? 19 : 0));
  const tax = Number(order.tax || subtotal * 0.08);
  const couponCode = String(order.couponCode || "").trim().toUpperCase();
  const discount = Number(order.discount || Math.max(0, subtotal + shipping + tax - Number(order.total || subtotal + shipping + tax)));
  const total = Number(order.total || subtotal + shipping + tax - discount);

  return {
    id: String(order.id || ""),
    createdAt: order.createdAt || new Date().toISOString(),
    paymentMethod: String(order.paymentMethod || "N/A"),
    paymentStatus: String(order.paymentStatus || "pending"),
    status: String(order.status || "processing"),
    shippingAddress: String(order.shippingAddress || "N/A"),
    deliverySlot: order.deliverySlot && typeof order.deliverySlot === "object"
      ? {
        id: String(order.deliverySlot.id || "").trim(),
        label: String(order.deliverySlot.label || "").trim(),
        eta: String(order.deliverySlot.eta || "").trim()
      }
      : null,
    reservationUntil: String(order.reservationUntil || "").trim(),
    statusHistory: normalizeStatusHistory(order.statusHistory, order.createdAt, order.status),
    items: items.map((item) => ({
      name: item.name || "Item",
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      lineTotal: Number(item.lineTotal || Number(item.quantity || 1) * Number(item.price || 0)),
      hsnSac: String(item.hsnSac || "8471")
    })),
    subtotal,
    shipping,
    tax,
    discount,
    couponCode,
    total
  };
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Pending";
  }
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function buildDeliveryTimeline(order) {
  const reservationDate = order.reservationUntil ? new Date(order.reservationUntil) : null;
  const hasReservation = reservationDate && !Number.isNaN(reservationDate.getTime());
  const orderedEvent = getStatusEvent(order, "ordered");
  const processingEvent = getStatusEvent(order, "processing");
  const shippedEvent = getStatusEvent(order, "shipped");
  const deliveredEvent = getStatusEvent(order, "delivered");
  const cancelledEvent = getStatusEvent(order, "cancelled");
  const isDelivered = Boolean(deliveredEvent);
  const isShipped = Boolean(shippedEvent) || isDelivered;
  const isProcessing = Boolean(processingEvent) || isShipped;
  const slotLabel = order.deliverySlot?.label || "Standard delivery";
  const etaLabel = order.deliverySlot?.eta || (isDelivered ? "Delivered" : "Expected in 2-4 business days");

  const milestones = [
    {
      title: "Slot confirmed",
      detail: slotLabel,
      meta: orderedEvent ? formatDateTime(orderedEvent.createdAt) : formatDateTime(order.createdAt),
      state: "done"
    }
  ];

  if (hasReservation) {
    milestones.push({
      title: "Stock reserved",
      detail: `Reserved until ${formatDateTime(reservationDate)}`,
      meta: "Reservation lock active",
      state: isDelivered || isShipped || isProcessing ? "done" : "current"
    });
  }

  milestones.push({
    title: "Warehouse prep",
    detail: isShipped ? "Packed and handed to courier" : "Inventory verification and packing in progress",
    meta: isShipped
      ? formatDateTime(shippedEvent ? shippedEvent.createdAt : order.createdAt)
      : isProcessing
        ? formatDateTime(processingEvent ? processingEvent.createdAt : order.createdAt)
        : cancelledEvent
          ? `Cancelled ${formatDateTime(cancelledEvent.createdAt)}`
          : "Current stage",
    state: isShipped ? "done" : isProcessing ? "current" : "upcoming"
  });

  milestones.push({
    title: "Delivery window",
    detail: `${slotLabel}${order.deliverySlot?.eta ? ` | ${order.deliverySlot.eta}` : ""}`,
    meta: isDelivered
      ? formatDateTime(deliveredEvent.createdAt)
      : cancelledEvent
        ? `Cancelled ${formatDateTime(cancelledEvent.createdAt)}`
        : etaLabel,
    state: isDelivered ? "done" : "upcoming"
  });

  return milestones;
}

async function fetchOrderFromApi(orderId) {
  const session = readSession();
  if (!session || !session.token || !orderId) {
    return null;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
  } catch (error) {
    return null;
  }

  if (!response.ok) {
    return null;
  }
  const data = await response.json().catch(() => null);
  return data ? normalizeOrder(data) : null;
}

function findOfflineOrder(orderId) {
  const order = loadOfflineOrders().find((item) => String(item.id) === orderId);
  return order ? normalizeOrder(order) : null;
}

function buildUpiUri(amount, invoiceNumber) {
  const params = new URLSearchParams({
    pa: UPI_CONFIG.upiId,
    pn: UPI_CONFIG.payeeName,
    am: Number(amount || 0).toFixed(2),
    cu: "INR",
    tn: `Invoice ${invoiceNumber}`
  });
  return `upi://pay?${params.toString()}`;
}

function numberToWordsUnder1000(num) {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const n = Number(num || 0);
  if (n < 20) {
    return ones[n];
  }
  if (n < 100) {
    return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`.trim();
  }
  return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${numberToWordsUnder1000(n % 100)}` : ""}`.trim();
}

function numberToWordsIndian(value) {
  const n = Math.floor(Number(value || 0));
  if (!n) {
    return "Zero";
  }
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;
  const parts = [];
  if (crore) {
    parts.push(`${numberToWordsUnder1000(crore)} Crore`);
  }
  if (lakh) {
    parts.push(`${numberToWordsUnder1000(lakh)} Lakh`);
  }
  if (thousand) {
    parts.push(`${numberToWordsUnder1000(thousand)} Thousand`);
  }
  if (hundred) {
    parts.push(numberToWordsUnder1000(hundred));
  }
  return parts.join(" ").trim();
}

function formatAmountInWords(amount) {
  const value = Number(amount || 0);
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  const rupeeWords = numberToWordsIndian(rupees);
  if (!paise) {
    return `Rupees ${rupeeWords} Only`;
  }
  return `Rupees ${rupeeWords} and ${numberToWordsUnder1000(paise)} Paise Only`;
}

function render(order) {
  const profile = readProfile() || {};
  const session = readSession() || {};
  const buyerAddress = String(profile.address || order.shippingAddress || "N/A");
  const buyerState = extractState(order.shippingAddress || profile.address || "");
  const sameState = String(buyerState).toLowerCase() === String(SELLER_INFO.state).toLowerCase();
  const shippingCoupon = SHIPPING_ONLY_COUPONS.has(String(order.couponCode || "").toUpperCase());
  const taxableValue = Math.max(0, Number(order.subtotal || 0) - (shippingCoupon ? 0 : Number(order.discount || 0)));
  const gstAmount = Number(order.tax || 0);
  const effectiveRate = taxableValue > 0 ? (gstAmount / taxableValue) * 100 : 0;
  const invoiceDateValue = new Date(order.createdAt);
  const due = addDays(order.createdAt, DEFAULT_PAYMENT_DUE_DAYS);
  const buyerGstinValue = String(profile.gstin || session.gstin || "URP").trim() || "URP";
  const paymentStatus = String(order.paymentStatus || "").toLowerCase();
  const settled = ["paid", "authorized", "captured", "refund_pending", "refunded"].includes(paymentStatus);
  const paymentOpen = paymentStatus === "pending" || paymentStatus === "failed";

  invoiceNo.textContent = `INV-${String(order.id).slice(0, 8).toUpperCase()}`;
  orderIdValue.textContent = order.id;
  invoiceDate.textContent = invoiceDateValue.toLocaleDateString("en-IN");
  supplyDate.textContent = invoiceDateValue.toLocaleDateString("en-IN");
  dueDate.textContent = due.toLocaleDateString("en-IN");
  paymentMethod.textContent = order.paymentMethod.toUpperCase();

  sellerName.textContent = SELLER_INFO.legalName;
  sellerAddress.textContent = SELLER_INFO.address;
  sellerGstin.textContent = SELLER_INFO.gstin;
  sellerPan.textContent = SELLER_INFO.pan;
  sellerState.textContent = SELLER_INFO.state;
  signSellerName.textContent = SELLER_INFO.legalName;

  billName.textContent = profile.fullName || session.name || "Customer";
  billAddress.textContent = buyerAddress;
  billEmail.textContent = profile.email || session.email || "N/A";
  billMobile.textContent = profile.phone || session.mobile || "N/A";
  buyerGstin.textContent = buyerGstinValue;
  shipAddress.textContent = order.shippingAddress || buyerAddress;
  placeOfSupply.textContent = buyerState;
  if (deliverySlotValue) {
    deliverySlotValue.textContent = order.deliverySlot?.label || "Standard delivery";
  }
  if (deliveryEtaValue) {
    deliveryEtaValue.textContent = order.deliverySlot?.eta || "Expected in 2-4 business days";
  }
  if (trackingRefValue) {
    trackingRefValue.textContent = `TRK-${String(order.id).slice(0, 8).toUpperCase()}`;
  }
  if (reservationLine && reservationValue) {
    const reservationDate = order.reservationUntil ? new Date(order.reservationUntil) : null;
    const hasReservation = reservationDate && !Number.isNaN(reservationDate.getTime());
    reservationLine.hidden = !hasReservation;
    reservationValue.textContent = hasReservation ? formatDateTime(reservationDate) : "-";
  }
  if (invoiceDeliveryTimeline) {
    invoiceDeliveryTimeline.innerHTML = buildDeliveryTimeline(order).map((item) => `
      <div class="delivery-timeline-item ${item.state}">
        <span class="dot"></span>
        <div class="delivery-timeline-copy">
          <strong>${item.title}</strong>
          <small>${item.detail}</small>
          <small>${item.meta}</small>
        </div>
      </div>
    `).join("");
  }

  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;
  const gstRateLabel = `${effectiveRate.toFixed(2)}%`;

  invoiceItems.innerHTML = order.items.map((item, index) => {
    const itemTaxable = Number(item.lineTotal || 0);
    const itemTax = taxableValue > 0 ? (itemTaxable / taxableValue) * gstAmount : 0;
    const cgstAmt = sameState ? itemTax / 2 : 0;
    const sgstAmt = sameState ? itemTax / 2 : 0;
    const igstAmt = sameState ? 0 : itemTax;
    totalCgst += cgstAmt;
    totalSgst += sgstAmt;
    totalIgst += igstAmt;
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.hsnSac}</td>
        <td>${item.quantity}</td>
        <td>${money(item.price)}</td>
        <td>${money(itemTaxable)}</td>
        <td>${sameState ? (effectiveRate / 2).toFixed(2) : "0.00"}%</td>
        <td>${money(cgstAmt)}</td>
        <td>${sameState ? (effectiveRate / 2).toFixed(2) : "0.00"}%</td>
        <td>${money(sgstAmt)}</td>
        <td>${sameState ? "0.00" : effectiveRate.toFixed(2)}%</td>
        <td>${money(igstAmt)}</td>
        <td>${money(itemTaxable + itemTax)}</td>
      </tr>
    `;
  }).join("");

  subtotalValue.textContent = money(taxableValue);
  if (discountRow && discountValue) {
    discountRow.hidden = Number(order.discount || 0) <= 0;
    discountValue.textContent = `-${money(order.discount || 0)}`;
  }
  if (couponRow && couponCodeValue) {
    couponRow.hidden = !order.couponCode;
    couponCodeValue.textContent = order.couponCode || "-";
  }
  gstRateValue.textContent = gstRateLabel;
  cgstValue.textContent = money(totalCgst);
  sgstValue.textContent = money(totalSgst);
  igstValue.textContent = money(totalIgst);
  shippingValue.textContent = money(order.shipping);
  taxValue.textContent = money(gstAmount);
  totalValue.textContent = money(order.total);
  amountWords.textContent = formatAmountInWords(order.total);
  if (paymentStatus === "refunded") {
    paymentTermsLine.textContent = "Payment was refunded to the original payment method after cancellation.";
  } else if (paymentStatus === "refund_pending") {
    paymentTermsLine.textContent = "Refund initiated. Settlement will follow your payment provider timeline.";
  } else if (paymentStatus === "failed") {
    paymentTermsLine.textContent = "Payment failed. No amount was captured for this order.";
  } else if (paymentStatus === "cancelled") {
    paymentTermsLine.textContent = "Payment request closed because the order was cancelled before collection.";
  } else if (settled) {
    paymentTermsLine.textContent = "Payment settled successfully for this order.";
  } else {
    paymentTermsLine.textContent = `Payment due by ${due.toLocaleDateString("en-IN")} (Net ${DEFAULT_PAYMENT_DUE_DAYS} days).`;
  }

  upsertInvoiceLog(order, settled ? order.createdAt : "");

  if (upiBlock) {
    upiBlock.hidden = !paymentOpen || String(order.status || "").toLowerCase() === "cancelled";
  }
  if (paymentOpen && upiQrImage && upiPayLink) {
    const upiUri = buildUpiUri(order.total, invoiceNo.textContent);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(upiUri)}`;
    upiQrImage.src = qrUrl;
    upiIdValue.textContent = UPI_CONFIG.upiId;
    upiPayeeName.textContent = UPI_CONFIG.payeeName;
    upiAmountValue.textContent = money(order.total);
    upiPayLink.href = upiUri;
  }

  invoiceCard.hidden = false;
  if (copyLabel) {
    copyLabel.textContent = "Original for Recipient";
  }
  invoiceCard.classList.remove("duplicate-copy");
  invoiceCard.classList.toggle("same-state-tax", sameState);
  invoiceCard.classList.toggle("inter-state-tax", !sameState);
  invoiceCard.classList.toggle("payment-open", paymentOpen);
  invoiceCard.classList.toggle("payment-settled", settled);
  if (duplicateBtn) {
    duplicateBtn.textContent = "Switch to Duplicate Copy";
  }
  invoiceMessage.textContent = "";
}

async function initInvoice() {
  const orderId = getOrderIdFromUrl();
  if (!orderId) {
    invoiceMessage.textContent = "Missing order ID.";
    return;
  }

  const order = await fetchOrderFromApi(orderId) || findOfflineOrder(orderId);
  if (!order) {
    invoiceMessage.textContent = "Invoice not found for this order.";
    return;
  }

  render(order);
}

printBtn.addEventListener("click", () => window.print());
if (duplicateBtn) {
  duplicateBtn.addEventListener("click", () => {
    const isDuplicate = invoiceCard.classList.toggle("duplicate-copy");
    if (copyLabel) {
      copyLabel.textContent = isDuplicate ? "Duplicate for Supplier" : "Original for Recipient";
    }
    duplicateBtn.textContent = isDuplicate ? "Switch to Original Copy" : "Switch to Duplicate Copy";
  });
}
initInvoice();
