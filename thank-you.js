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
const thankYouCustomerEmail = document.getElementById("thankYouCustomerEmail");
const thankYouDeliverySlotPreview = document.getElementById("thankYouDeliverySlotPreview");
const thankYouShipAddress = document.getElementById("thankYouShipAddress");
const thankYouInvoiceBtn = document.getElementById("thankYouInvoiceBtn");
const thankYouTrackBtn = document.getElementById("thankYouTrackBtn");
const thankYouOrdersBtn = document.getElementById("thankYouOrdersBtn");
const thankYouItemsContainer = document.getElementById("thankYouItemsContainer");
const thankYouRecsGrid = document.getElementById("thankYouRecsGrid");
const heroParagraph = document.querySelector(".hero p:last-of-type");
const fallbackCatalogImage = "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80";

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
  const tax = Number(typeof order.tax === "number" ? order.tax : (order.tax || Math.round(subtotal * 0.18 * 100) / 100));
  const discount = Number(order.discount || Math.max(0, subtotal + shipping + tax - Number(order.total || subtotal + shipping + tax)));
  const total = Number(order.total || subtotal + shipping + tax - discount);
  const deliverySlot = order.deliverySlot && typeof order.deliverySlot === "object"
    ? {
      id: String(order.deliverySlot.id || "").trim(),
      label: String(order.deliverySlot.label || "").trim(),
      eta: String(order.deliverySlot.eta || "").trim()
    }
    : null;

  const catalog = window.EM_CATALOG && Array.isArray(window.EM_CATALOG) ? window.EM_CATALOG : [];

  return {
    id: String(order.id || ""),
    createdAt: String(order.createdAt || "").trim() || new Date().toISOString(),
    paymentMethod: String(order.paymentMethod || "N/A"),
    shippingAddress: String(order.shippingAddress || "").trim(),
    customerEmail: String(order.customerEmail || order.email || "").trim(),
    subtotal,
    shipping,
    tax,
    discount,
    total,
    couponCode: String(order.couponCode || "").trim(),
    deliverySlot,
    reservationUntil: String(order.reservationUntil || "").trim(),
    items: items.map((item) => {
      const match = catalog.find((p) => String(p.id) === String(item.productId || item.id));
      return {
        id: item.productId || item.id || (match ? match.id : ""),
        name: item.name || (match ? match.title : "Electronic Product"),
        price: Number(item.price || (match ? match.price : 0)),
        quantity: Number(item.quantity || 1),
        image: item.image || (match ? match.image : fallbackCatalogImage),
        lineTotal: Number(item.lineTotal || (Number(item.price || (match ? match.price : 0)) * Number(item.quantity || 1)))
      };
    })
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

function renderRecommendations() {
  if (!thankYouRecsGrid) {
    return;
  }
  const catalog = window.EM_CATALOG && Array.isArray(window.EM_CATALOG) ? window.EM_CATALOG : [];
  const recs = catalog.slice(0, 4);
  if (recs.length === 0) {
    thankYouRecsGrid.parentElement.hidden = true;
    return;
  }

  thankYouRecsGrid.innerHTML = recs.map((prod) => `
    <article class="amz-rec-card">
      <img class="amz-rec-img" src="${prod.image}" alt="${prod.title}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackCatalogImage}';" />
      <a class="amz-rec-title" href="product-detail.html?id=${encodeURIComponent(prod.id)}">${prod.title}</a>
      <div class="amz-rec-price">${money(prod.price)}</div>
      <a class="amz-rec-btn" href="product-detail.html?id=${encodeURIComponent(prod.id)}">View Details</a>
    </article>
  `).join("");
}

function renderOrder(order) {
  const session = readSession();
  if (!order) {
    const fallbackId = getOrderIdFromUrl() || `EM-${Math.floor(1000000 + Math.random() * 9000000)}`;
    if (thankYouOrderId) {
      thankYouOrderId.textContent = fallbackId;
    }
    if (thankYouInvoiceBtn) {
      thankYouInvoiceBtn.href = `invoice.html?orderId=${encodeURIComponent(fallbackId)}`;
    }
    if (thankYouTrackBtn) {
      thankYouTrackBtn.href = `tracking.html?orderId=${encodeURIComponent(fallbackId)}`;
    }
    if (thankYouCustomerEmail) {
      thankYouCustomerEmail.textContent = session?.email || "customer@electromart.com";
    }
    if (thankYouShipAddress) {
      thankYouShipAddress.textContent = "Flat 402, Royal Palms, Connaught Place, New Delhi 110001";
    }
    addInvoiceLink(fallbackId);
    renderRecommendations();
    return;
  }

  const orderDate = new Date(order.createdAt);
  const formattedDate = Number.isNaN(orderDate.getTime()) ? order.createdAt : orderDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  if (thankYouOrderId) {
    thankYouOrderId.textContent = order.id;
  }
  if (thankYouOrderDate) {
    thankYouOrderDate.textContent = formattedDate;
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

  if (thankYouCustomerEmail) {
    thankYouCustomerEmail.textContent = order.customerEmail || session?.email || "customer@electromart.com";
  }

  if (thankYouShipAddress) {
    thankYouShipAddress.textContent = order.shippingAddress || "Flat 402, Royal Palms, Connaught Place, New Delhi 110001";
  }

  if (thankYouDeliverySlotPreview) {
    if (order.deliverySlot?.label) {
      thankYouDeliverySlotPreview.textContent = `Guaranteed delivery: ${order.deliverySlot.label}${order.deliverySlot.eta ? ` (${order.deliverySlot.eta})` : ""}`;
    } else {
      thankYouDeliverySlotPreview.textContent = "Guaranteed delivery by Tomorrow, 9 PM";
    }
  }

  if (thankYouInvoiceBtn) {
    thankYouInvoiceBtn.href = `invoice.html?orderId=${encodeURIComponent(order.id)}`;
  }
  if (thankYouTrackBtn) {
    thankYouTrackBtn.href = `tracking.html?orderId=${encodeURIComponent(order.id)}`;
  }
  if (thankYouOrdersBtn) {
    thankYouOrdersBtn.href = "orders.html";
  }

  if (thankYouItemsContainer) {
    if (Array.isArray(order.items) && order.items.length > 0) {
      thankYouItemsContainer.innerHTML = order.items.map((item) => `
        <article class="amz-thankyou-item">
          <img class="amz-thankyou-item-thumb" src="${item.image || fallbackCatalogImage}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackCatalogImage}';" />
          <div class="amz-thankyou-item-info">
            <a class="amz-thankyou-item-title" href="product-detail.html?id=${encodeURIComponent(item.id)}">${item.name}</a>
            <div class="amz-thankyou-item-meta">
              <span class="amz-thankyou-item-qty">Qty: ${item.quantity}</span>
              <span>|</span>
              <span>${money(item.price)}</span>
            </div>
          </div>
          <div class="amz-thankyou-item-price">${money(item.lineTotal)}</div>
        </article>
      `).join("");
    } else {
      thankYouItemsContainer.innerHTML = `<p style="color: #565959; font-size: 0.9rem;">Order placed successfully. Visit <a href="orders.html" style="color: #007185;">Your Orders</a> to view shipment updates.</p>`;
    }
  }

  if (thankYouNextStep) {
    const deliveryLine = order.deliverySlot?.eta
      ? `Selected slot: ${order.deliverySlot.label} (${order.deliverySlot.eta}).`
      : "Standard delivery window selected.";
    thankYouNextStep.textContent = order.shippingAddress
      ? `${deliveryLine} Your shipment will be delivered to ${order.shippingAddress}. You can track status updates from the orders page.`
      : `${deliveryLine} You can track shipment updates from your orders page once processing begins.`;
  }
  if (heroParagraph && !Number.isNaN(orderDate.getTime())) {
    heroParagraph.textContent = `Your order was placed successfully on ${formattedDate}.`;
  }

  addInvoiceLink(order.id);
  renderRecommendations();
}

async function initThankYou() {
  const orderId = getOrderIdFromUrl();
  if (!orderId) {
    renderOrder(null);
    return;
  }
  const order = await fetchOrderFromApi(orderId) || findOfflineOrder(orderId);
  renderOrder(order);
}

initThankYou();
