const AUTH_STORAGE_KEY = "electromart_auth_v1";
const OFFLINE_ORDERS_KEY = "electromart_offline_orders_v1";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const thankYouOrderId = document.getElementById("thankYouOrderId");
const thankYouOrderDate = document.getElementById("thankYouOrderDate");
const thankYouPaymentMethod = document.getElementById("thankYouPaymentMethod");
const thankYouOrderTotal = document.getElementById("thankYouOrderTotal");
const thankYouDiscountRow = document.getElementById("thankYouDiscountRow");
const thankYouDiscount = document.getElementById("thankYouDiscount");
const thankYouCouponRow = document.getElementById("thankYouCouponRow");
const thankYouCouponCode = document.getElementById("thankYouCouponCode");
const thankYouDeliverySlotRow = document.getElementById("thankYouDeliverySlotRow");
const thankYouDeliverySlot = document.getElementById("thankYouDeliverySlot");
const thankYouReservationRow = document.getElementById("thankYouReservationRow");
const thankYouReservation = document.getElementById("thankYouReservation");
const thankYouNextStep = document.getElementById("thankYouNextStep");
const thankYouLinks = document.getElementById("thankYouLinks");
const heroParagraph = document.querySelector(".hero p:last-of-type");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

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

function normalizeOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal || items.reduce((sum, item) => sum + Number(item.quantity || 1) * Number(item.price || 0), 0));
  const shipping = Number(order.shipping || (items.length ? 19 : 0));
  const tax = Number(order.tax || subtotal * 0.08);
  const discount = Number(order.discount || Math.max(0, subtotal + shipping + tax - Number(order.total || subtotal + shipping + tax)));
  const total = Number(order.total || subtotal + shipping + tax - discount);
  const deliverySlot = order.deliverySlot && typeof order.deliverySlot === "object"
    ? {
      id: String(order.deliverySlot.id || "").trim(),
      label: String(order.deliverySlot.label || "").trim(),
      eta: String(order.deliverySlot.eta || "").trim()
    }
    : null;
  return {
    id: String(order.id || ""),
    createdAt: String(order.createdAt || "").trim() || new Date().toISOString(),
    paymentMethod: String(order.paymentMethod || "N/A"),
    shippingAddress: String(order.shippingAddress || "").trim(),
    subtotal,
    shipping,
    tax,
    discount,
    total,
    couponCode: String(order.couponCode || "").trim(),
    deliverySlot,
    reservationUntil: String(order.reservationUntil || "").trim()
  };
}

async function fetchOrderFromApi(orderId) {
  const session = readSession();
  if (!session?.token || !orderId) {
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json().catch(() => null);
    return data ? normalizeOrder(data) : null;
  } catch (error) {
    return null;
  }
}

function findOfflineOrder(orderId) {
  const match = loadOfflineOrders().find((item) => String(item.id) === String(orderId));
  return match ? normalizeOrder(match) : null;
}

function addInvoiceLink(orderId) {
  if (!thankYouLinks || !orderId) {
    return;
  }
  const invoiceLink = document.createElement("a");
  invoiceLink.href = `invoice.html?orderId=${encodeURIComponent(orderId)}`;
  invoiceLink.target = "_blank";
  invoiceLink.rel = "noopener";
  invoiceLink.textContent = "Download Invoice";
  const separator = document.createTextNode(" | ");
  thankYouLinks.insertBefore(separator, thankYouLinks.firstChild);
  thankYouLinks.insertBefore(invoiceLink, separator);
}

function renderOrder(order) {
  if (!order) {
    addInvoiceLink(getOrderIdFromUrl());
    return;
  }
  const orderDate = new Date(order.createdAt);
  if (thankYouOrderId) {
    thankYouOrderId.textContent = order.id;
  }
  if (thankYouOrderDate) {
    thankYouOrderDate.textContent = Number.isNaN(orderDate.getTime()) ? order.createdAt : orderDate.toLocaleDateString("en-IN");
  }
  if (thankYouPaymentMethod) {
    thankYouPaymentMethod.textContent = order.paymentMethod.toUpperCase();
  }
  if (thankYouOrderTotal) {
    thankYouOrderTotal.textContent = money(order.total);
  }
  if (thankYouDiscountRow && thankYouDiscount) {
    thankYouDiscountRow.hidden = Number(order.discount || 0) <= 0;
    thankYouDiscount.textContent = `-${money(order.discount || 0)}`;
  }
  if (thankYouCouponRow && thankYouCouponCode) {
    thankYouCouponRow.hidden = !order.couponCode;
    thankYouCouponCode.textContent = order.couponCode || "-";
  }
  if (thankYouDeliverySlotRow && thankYouDeliverySlot) {
    thankYouDeliverySlotRow.hidden = !order.deliverySlot?.label;
    thankYouDeliverySlot.textContent = order.deliverySlot?.label || "-";
  }
  if (thankYouReservationRow && thankYouReservation) {
    const reservationDate = order.reservationUntil ? new Date(order.reservationUntil) : null;
    const hasReservation = reservationDate && !Number.isNaN(reservationDate.getTime());
    thankYouReservationRow.hidden = !hasReservation;
    thankYouReservation.textContent = hasReservation
      ? reservationDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : "-";
  }
  if (thankYouNextStep) {
    const deliveryLine = order.deliverySlot?.eta
      ? `Selected slot: ${order.deliverySlot.label} (${order.deliverySlot.eta}).`
      : "You can choose the best delivery window for your next order during checkout.";
    thankYouNextStep.textContent = order.shippingAddress
      ? `${deliveryLine} Your shipment will be delivered to ${order.shippingAddress}. You can track every status update from the orders page.`
      : `${deliveryLine} You can track shipment updates from your orders page once processing begins.`;
  }
  if (heroParagraph && !Number.isNaN(orderDate.getTime())) {
    heroParagraph.textContent = `Your order was placed successfully on ${orderDate.toLocaleDateString("en-IN")}.`;
  }
  addInvoiceLink(order.id);
}

async function initThankYou() {
  const orderId = getOrderIdFromUrl();
  if (!orderId) {
    return;
  }
  const order = await fetchOrderFromApi(orderId) || findOfflineOrder(orderId);
  renderOrder(order);
}

initThankYou();
