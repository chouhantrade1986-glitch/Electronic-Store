const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const COUPON_STORAGE_KEY = "electromart_coupon_v1";
const DELIVERY_SLOT_STORAGE_KEY = "electromart_delivery_slot_v1";

const catalog = [
  { id: 1, name: "AstraBook Pro 14", price: 999, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Nimbus Phone X", price: 749, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Pulse ANC Headphones", price: 179, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "4K Smart Television", price: 699, image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Orbit Mechanical Keyboard", price: 109, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "ZenPad Tablet 11", price: 529, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80" },
  { id: 7, name: "Vector Gaming Laptop", price: 1299, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "Echo Smart Speaker", price: 89, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" },
  { id: 9, name: "Office Laptop Bundle (10 Units)", price: 8690, image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80" },
  { id: 10, name: "Retail Smartphone Pack (25 Units)", price: 15499, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80" },
  { id: 11, name: "Corporate Headset Case (50 Units)", price: 5399, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80" },
  { id: 12, name: "Accessory Mix Carton (100 Units)", price: 4299, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=80" },
  { id: 201, name: "Epson EcoTank L3250", price: 15999, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80" },
  { id: 202, name: "HP LaserJet Pro MFP 4104", price: 28999, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df89?auto=format&fit=crop&w=900&q=80" },
  { id: 203, name: "Canon PIXMA G3770 All-in-One", price: 18499, image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80" },
  { id: 204, name: "Brother HL-L5100DN Office Pack (5 Units)", price: 124999, image: "https://images.unsplash.com/photo-1612810806695-30f7a8258391?auto=format&fit=crop&w=900&q=80" },
  { id: 205, name: "Zebra ZD230 Thermal Label Printer", price: 47999, image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=900&q=80" },
  { id: 101, name: "Titan Office Tower i5", price: 899, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: 102, name: "Vortex Gaming Rig Ryzen 7", price: 1699, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: 103, name: "Creator Studio Workstation", price: 1999, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: 104, name: "Business Desktop Bundle (5 Units)", price: 4299, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
  { id: 105, name: "Retail Gaming Pack (3 Units)", price: 4799, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: 4101, name: "CoreLite Barebone Kit", price: 299, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: 4102, name: "Business Mini Barebone", price: 999, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: 4103, name: "Gaming Barebone Tower", price: 459, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: 4201, name: "Dell OptiFlex i5", price: 749, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
  { id: 4202, name: "HP ProDesk Fleet", price: 3399, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: 4203, name: "Lenovo ThinkCentre", price: 829, image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80" },
  { id: 4301, name: "Intel Core i5 14400F", price: 219, image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=900&q=80" },
  { id: 4302, name: "AMD Ryzen 7 7800X3D", price: 399, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: 4303, name: "Intel Core i7 Business Pack", price: 1899, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" },
  { id: 4401, name: "Tower Air Cooler 120mm", price: 49, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: 4402, name: "240mm AIO Liquid Cooler", price: 119, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: 4403, name: "Workstation Cooling Pack", price: 499, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: 4501, name: "B760 DDR5 Motherboard", price: 179, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: 4502, name: "B650 AM5 Motherboard", price: 189, image: "https://images.unsplash.com/photo-1563770660941-10a6360765b5?auto=format&fit=crop&w=900&q=80" },
  { id: 4503, name: "Corporate Board Bundle", price: 1299, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: 4601, name: "16GB DDR5 Kit", price: 69, image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=80" },
  { id: 4602, name: "32GB DDR5 Kit", price: 129, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: 4603, name: "Enterprise RAM Pack", price: 999, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" },
  { id: 4701, name: "NVIDIA RTX 4060", price: 329, image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=900&q=80" },
  { id: 4702, name: "AMD RX 7800 XT", price: 519, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: 4703, name: "GPU Retail Bundle", price: 3999, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: 4801, name: "ATX Airflow Cabinet", price: 99, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: 4802, name: "mATX Compact Cabinet", price: 79, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: 4803, name: "System Integrator Cabinet Pack", price: 699, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" },
  { id: 4901, name: "120mm ARGB Fan", price: 19, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: 4902, name: "140mm High Airflow Fan", price: 29, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: 4903, name: "Cooling Fan Bulk Kit", price: 249, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: 5001, name: "650W 80+ Gold PSU", price: 99, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: 5002, name: "850W 80+ Platinum PSU", price: 179, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
  { id: 5003, name: "SMPS Business Pack", price: 1299, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: 5101, name: "Line Interactive UPS 1kVA", price: 139, image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
  { id: 5102, name: "UPS Replacement Battery", price: 89, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
  { id: 5103, name: "Enterprise UPS Pack", price: 1599, image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" }
];

const fallbackCatalogImage = "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80";
const cartItemsEl = document.getElementById("cartItems");
const cartMetaEl = document.getElementById("cartMeta");
const subtotalEl = document.getElementById("subtotalValue");
const shippingEl = document.getElementById("shippingValue");
const taxEl = document.getElementById("taxValue");
const totalEl = document.getElementById("totalValue");
const orderTotalEl = document.getElementById("orderTotalValue");
const summaryItemsEl = document.getElementById("summaryItems");
const clearCartBtn = document.getElementById("clearCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponMessage = document.getElementById("couponMessage");
const removeCouponBtn = document.getElementById("removeCouponBtn");
const discountRow = document.getElementById("discountRow");
const discountValue = document.getElementById("discountValue");
const cartDeliveryEstimate = document.getElementById("cartDeliveryEstimate");
const cartReservationMessage = document.getElementById("cartReservationMessage");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
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

function getCatalogProduct(productId) {
  const key = String(productId || "").trim();
  if (!key) {
    return null;
  }

  const cached = loadCatalogMap();
  if (cached[key]) {
    return cached[key];
  }

  return catalog.find((item) => String(item.id) === key) || null;
}

function getCartRows() {
  const cartMap = loadCartMap();
  return Object.entries(cartMap)
    .map(([id, qty]) => {
      if (Number(qty) <= 0) {
        return null;
      }

      const product = getCatalogProduct(id);
      if (!product) {
        return {
          id: String(id),
          name: `Product #${id}`,
          price: 0,
          image: fallbackCatalogImage,
          quantity: Number(qty)
        };
      }

      return {
        id: String(product.id),
        name: product.name,
        price: Number(product.price || 0),
        image: product.image || fallbackCatalogImage,
        stock: Number(product.stock),
        quantity: Number(qty)
      };
    })
    .filter(Boolean);
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

function getPricingBreakdown(rows) {
  const itemCount = rows.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = rows.reduce((sum, row) => sum + row.price * row.quantity, 0);
  const shipping = itemCount > 0 ? 19 : 0;
  const couponState = loadCouponState();
  const coupon = evaluateCoupon(couponState?.code || "", subtotal, shipping);
  const appliedCoupon = COUPONS[coupon.code] || null;
  const taxableSubtotal = Math.max(0, subtotal - (coupon.valid && appliedCoupon?.type !== "shipping" ? coupon.amount : 0));
  const tax = taxableSubtotal * 0.08;
  const total = subtotal + shipping + tax - coupon.amount;
  return { itemCount, subtotal, shipping, tax, total, coupon };
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

function loadDeliverySlotState() {
  try {
    const raw = localStorage.getItem(DELIVERY_SLOT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function cartItemCard(row) {
  return `
    <article class="cart-item">
      <a href="product-detail.html?id=${encodeURIComponent(row.id)}">
        <img src="${row.image}" alt="${row.name}" loading="lazy" />
      </a>
      <div>
        <h3 class="item-title"><a href="product-detail.html?id=${encodeURIComponent(row.id)}">${row.name}</a></h3>
        <p class="item-stock">In Stock</p>
        <p class="item-price">${money(row.price)} each</p>
        <div class="qty-controls">
          <button class="qty-btn" data-action="decrease" data-id="${row.id}" type="button">-</button>
          <strong>${row.quantity}</strong>
          <button class="qty-btn" data-action="increase" data-id="${row.id}" type="button">+</button>
          <button class="remove-btn" data-action="remove" data-id="${row.id}" type="button">Remove</button>
        </div>
      </div>
      <strong class="item-total">${money(row.quantity * row.price)}</strong>
    </article>
  `;
}

function renderCart() {
  const rows = getCartRows();
  const breakdown = getPricingBreakdown(rows);
  const { itemCount, subtotal, shipping, tax, total, coupon } = breakdown;
  const reservation = getReservationState(rows);
  const deliverySlot = loadDeliverySlotState();

  cartMetaEl.textContent = `${itemCount} items`;
  summaryItemsEl.textContent = `Subtotal (${itemCount} items):`;
  subtotalEl.textContent = money(subtotal);
  shippingEl.textContent = money(shipping);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(total);
  orderTotalEl.textContent = money(total);
  checkoutBtn.disabled = rows.length === 0;

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
  if (cartDeliveryEstimate) {
    cartDeliveryEstimate.textContent = deliverySlot?.label
      ? `Selected slot: ${deliverySlot.label}`
      : "Choose a slot at checkout for the earliest available delivery window.";
  }
  if (cartReservationMessage) {
    if (reservation.hasOutOfStock) {
      cartReservationMessage.textContent = "One or more items in your cart are currently out of stock. Update quantities before checkout.";
    } else if (reservation.hasLowStock) {
      cartReservationMessage.textContent = `Low stock items are only reserved until ${reservation.reservationUntil.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`;
    } else {
      cartReservationMessage.textContent = "Stock is available for the items currently in your cart.";
    }
  }

  if (rows.length === 0) {
    cartItemsEl.innerHTML = "<div class='empty-message'>Your cart is empty. Add items from the store.</div>";
    return;
  }

  cartItemsEl.innerHTML = rows.map(cartItemCard).join("");
}

function updateQuantity(productId, change) {
  const key = String(productId || "").trim();
  if (!key) {
    return;
  }

  const cartMap = loadCartMap();
  const current = Number(cartMap[key] || 0);
  const next = current + change;

  if (next <= 0) {
    delete cartMap[key];
  } else {
    cartMap[key] = next;
  }

  saveCartMap(cartMap);
  renderCart();
}

function removeItem(productId) {
  const key = String(productId || "").trim();
  if (!key) {
    return;
  }

  const cartMap = loadCartMap();
  delete cartMap[key];
  saveCartMap(cartMap);
  renderCart();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.getAttribute("data-action");
  const productId = String(button.getAttribute("data-id") || "").trim();
  if (!productId) {
    return;
  }

  if (action === "increase") {
    updateQuantity(productId, 1);
  }

  if (action === "decrease") {
    updateQuantity(productId, -1);
  }

  if (action === "remove") {
    removeItem(productId);
  }
});

clearCartBtn.addEventListener("click", () => {
  saveCartMap({});
  clearCouponState();
  renderCart();
});

checkoutBtn.addEventListener("click", () => {
  const rows = getCartRows();
  if (rows.length === 0) {
    return;
  }
  window.location.href = "checkout.html";
});

if (applyCouponBtn) {
  applyCouponBtn.addEventListener("click", () => {
    const code = normalizeCouponCode(couponInput?.value || "");
    const rows = getCartRows();
    const subtotal = rows.reduce((sum, row) => sum + row.price * row.quantity, 0);
    const shipping = rows.length > 0 ? 19 : 0;
    const coupon = evaluateCoupon(code, subtotal, shipping);
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
    renderCart();
  });
}

if (removeCouponBtn) {
  removeCouponBtn.addEventListener("click", () => {
    clearCouponState();
    renderCart();
  });
}

renderCart();
