const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const COUPON_STORAGE_KEY = "electromart_coupon_v1";
const DELIVERY_SLOT_STORAGE_KEY = "electromart_delivery_slot_v1";

function resolveRenewedTaxProfile(product) {
  const searchable = `${product.category || ""} ${product.name || ""}`.toLowerCase();
  const isDisplay = /(^|\s)(tv|television|monitor|display)(\s|$)/.test(searchable);
  return isDisplay ? { hsnCode: "85287200", gstRate: 0.28 } : { hsnCode: "84713010", gstRate: 0.18 };
}

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

function saveCatalogMap(catalogMap) {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
  } catch (error) {
    return;
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

  // Check live 751-product catalog from products-data.js
  if (typeof window !== "undefined") {
    if (window.EM_CATALOG_MAP) {
      const p = typeof window.EM_CATALOG_MAP.get === "function" 
        ? window.EM_CATALOG_MAP.get(key) 
        : window.EM_CATALOG_MAP[key];
      if (p) {
        const mapped = {
          id: String(p.id),
          name: p.name || p.title || `Product #${p.id}`,
          price: Number(p.price || 0),
          image: (Array.isArray(p.images) && p.images[0]) || p.image || fallbackCatalogImage,
          stock: p.stock !== undefined ? Number(p.stock) : 10
        };
        cached[key] = mapped;
        saveCatalogMap(cached);
        return mapped;
      }
    }

    if (Array.isArray(window.EM_CATALOG)) {
      const p = window.EM_CATALOG.find((item) => String(item.id) === key);
      if (p) {
        const mapped = {
          id: String(p.id),
          name: p.name || p.title || `Product #${p.id}`,
          price: Number(p.price || 0),
          image: (Array.isArray(p.images) && p.images[0]) || p.image || fallbackCatalogImage,
          stock: p.stock !== undefined ? Number(p.stock) : 10
        };
        cached[key] = mapped;
        saveCatalogMap(cached);
        return mapped;
      }
    }

    if (Array.isArray(window.ELECTROMART_RENEWED_CATALOG)) {
      const rp = window.ELECTROMART_RENEWED_CATALOG.find((item) => String(item.id) === key);
      if (rp) {
        const renewedTaxProfile = resolveRenewedTaxProfile(rp);
        const mapped = {
          id: String(rp.id),
          name: rp.name.includes("Certified Renewed") ? rp.name : `[Certified Renewed - Grade ${rp.renewedGrade || 'A'}] ${rp.name}`,
          price: Number(rp.renewedPrice || 0),
          image: rp.image || fallbackCatalogImage,
          stock: 10,
          isRenewed: true,
          renewedGrade: rp.renewedGrade || "A",
          gradeLabel: rp.gradeLabel || `Grade ${rp.renewedGrade || 'A'} (Excellent)`,
          batteryHealth: rp.batteryHealth || 90,
          warrantyDuration: "6 Months",
          hsnCode: renewedTaxProfile.hsnCode,
          gstRate: renewedTaxProfile.gstRate
        };
        cached[key] = mapped;
        saveCatalogMap(cached);
        return mapped;
      }
    }
  }

  return catalog.find((item) => String(item.id) === key) || null;
}

const UNSELECTED_STORAGE_KEY = "electromart_unselected_cart_v1";
const SAVED_STORAGE_KEY = "electromart_saved_for_later_v1";

function loadUnselectedMap() {
  try {
    const raw = localStorage.getItem(UNSELECTED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveUnselectedMap(unselectedMap) {
  try {
    localStorage.setItem(UNSELECTED_STORAGE_KEY, JSON.stringify(unselectedMap));
  } catch (error) {
    return;
  }
}

function loadSavedMap() {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveSavedMap(savedMap) {
  try {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedMap));
  } catch (error) {
    return;
  }
}

function getCartRows() {
  const cartMap = loadCartMap();
  const unselectedMap = loadUnselectedMap();
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
          quantity: Number(qty),
          selected: !unselectedMap[String(id)]
        };
      }

      let b2bMeta = {};
      try {
        const rawMeta = localStorage.getItem("electromart_b2b_cart_meta_v1");
        b2bMeta = rawMeta ? JSON.parse(rawMeta) : {};
      } catch (e) {
        b2bMeta = {};
      }
      const itemB2b = b2bMeta[String(id)] || (product.segment === "b2b" ? { tier: "Wholesale MOQ Ready", itcEligible: true } : null);

      return {
        id: String(product.id),
        name: product.name,
        price: Number(product.price || 0),
        image: product.image || fallbackCatalogImage,
        stock: Number(product.stock),
        quantity: Number(qty),
        category: product.category || "",
        hsnCode: product.hsnCode || (String(product.category || "").toLowerCase().includes("battery") ? "85076000" : "84713010"),
        gstRate: typeof product.gstRate === "number" ? product.gstRate : 0.18,
        segment: product.segment || (itemB2b ? "b2b" : "b2c"),
        b2bDiscountTier: product.b2bDiscountTier || (itemB2b ? itemB2b.tier : null),
        itcEligible: product.itcEligible || (itemB2b ? true : false),
        isRenewed: Boolean(product.isRenewed),
        renewedGrade: product.renewedGrade || null,
        warrantyDuration: product.warrantyDuration || (product.isRenewed ? "6 Months" : null),
        protectionPlan: typeof window !== "undefined" && typeof window.getSelectedProtection === "function" && typeof window.buildProtectionLine === "function"
          ? window.buildProtectionLine(product, window.getSelectedProtection(product.id))
          : null,
        selected: !unselectedMap[String(id)]
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

function getPricingBreakdown(rows) {
  const selectedRows = rows.filter((row) => row.selected !== false);
  const itemCount = selectedRows.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = selectedRows.reduce((sum, row) => sum + row.price * row.quantity + (row.protectionPlan ? row.protectionPlan.price * row.quantity : 0), 0);
  const primeActive = isPrimeActive();
  const shipping = itemCount > 0 ? (primeActive || subtotal >= 499 ? 0 : 19) : 0;
  const couponState = loadCouponState();
  const coupon = evaluateCoupon(couponState?.code || "", subtotal, shipping);
  const appliedCoupon = COUPONS[coupon.code] || null;
  const nonShippingDiscount = coupon.valid && appliedCoupon?.type !== "shipping" ? coupon.amount : 0;
  const discountRatio = subtotal > 0 ? Math.max(0, 1 - (nonShippingDiscount / subtotal)) : 1;

  let totalGst = 0;
  const gstBreakdownByRate = {};

  selectedRows.forEach((item) => {
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
  selectedRows.forEach((row) => {
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

function cartItemCard(row, currentLang) {
  const isSelected = row.selected !== false;
  const title = window.getLocalizedTitle ? window.getLocalizedTitle(row, currentLang) : row.name;

  // Qty options up to max(10, row.quantity)
  const maxOptions = Math.max(10, row.quantity);
  const qtyOptions = [];
  for (let i = 1; i <= maxOptions; i++) {
    qtyOptions.push(`<option value="${i}" ${i === row.quantity ? 'selected' : ''}>${i}${i === 10 && maxOptions === 10 ? '+' : ''}</option>`);
  }

  return `
    <article class="cart-item" data-id="${row.id}">
      <div class="cart-item-check-wrap">
        <input type="checkbox" class="cart-item-checkbox" data-action="toggle-select" data-id="${row.id}" ${isSelected ? 'checked' : ''} aria-label="Select item" />
      </div>
      <a class="item-thumb" href="product-detail.html?id=${encodeURIComponent(row.id)}">
        <img src="${row.image}" alt="${row.name}" loading="lazy" />
      </a>
      <div class="cart-item-details">
        <h3 class="item-title">
          <a href="product-detail.html?id=${encodeURIComponent(row.id)}">${title}</a>
        </h3>
        <p class="item-stock" data-i18n="in_stock">In Stock</p>
        <div class="amz-prime-delivery-tag">
          <strong>Prime</strong> <span>Eligible for FREE Shipping</span>
        </div>
        ${row.b2bDiscountTier ? `
        <div class="b2b-cart-badges" style="display:flex;align-items:center;gap:6px;margin:4px 0;flex-wrap:wrap;">
          <span class="b2b-tier-badge" style="background:#007600;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">✓ ${row.b2bDiscountTier}</span>
          <span class="b2b-itc-badge" style="color:#007600;font-size:12px;font-weight:600;">✓ GST ITC Eligible</span>
        </div>` : ''}
        ${(() => {
          let c = {};
          try { c = JSON.parse(localStorage.getItem("electromart_exchange_cart_v1") || "{}"); } catch (e) {}
          const ex = c[String(row.id)];
          return (ex && ex.finalValue) ? `
          <div class="cart-exchange-badge" style="display:inline-flex;align-items:center;gap:6px;background:#e7f4f5;border:1px solid #007185;padding:4px 8px;border-radius:4px;font-size:12px;color:#007185;margin:4px 0;">
            <span>🔄 <strong>Exchange Applied:</strong> ${ex.modelName || "Device"} (-${money(ex.finalValue)})</span>
            <button type="button" class="btn-remove-cart-exchange" data-action="remove-exchange" data-id="${row.id}" style="background:none;border:none;color:#c40000;cursor:pointer;font-weight:600;font-size:11px;margin-left:4px;">✕ Remove</button>
          </div>` : '';
        })()}
        ${row.isRenewed ? `
        <div class="cart-renewed-badge" style="display:inline-flex;align-items:center;gap:6px;background:#e8f7ee;border:1px solid #067d62;padding:4px 8px;border-radius:4px;font-size:12px;color:#067d62;margin:4px 0;font-weight:600;">
          <span>♻️ <strong>Certified Renewed:</strong> Grade ${row.renewedGrade || 'A'} • 6 Months Warranty</span>
        </div>` : ''}
        ${row.protectionPlan ? `
        <div class="cart-protection-badge" style="display:flex;align-items:center;gap:6px;background:#eef8f7;border:1px solid #8bc9c5;padding:5px 8px;border-radius:4px;font-size:12px;color:#00635f;margin:4px 0;font-weight:600;">
          <span>🛡️ <strong>${row.protectionPlan.name}</strong> · ${money(row.protectionPlan.price)} + 18% GST</span>
          <button type="button" data-action="remove-protection" data-id="${row.id}" style="margin-left:auto;border:0;background:none;color:#b42318;cursor:pointer;">Remove</button>
        </div>` : ''}
        <label class="cart-item-gift">
          <input type="checkbox" /> <span data-i18n="this_is_a_gift">This order contains a gift</span>
        </label>
        
        <div class="amz-item-actions-row">
          <div class="amz-qty-select-wrap">
            <span style="font-size:12px;color:#565959;margin-right:4px;" data-i18n="qty_label">Qty:</span>
            <select class="amz-qty-select" data-action="change-qty" data-id="${row.id}">
              ${qtyOptions.join("")}
            </select>
          </div>
          <span class="amz-action-divider">|</span>
          <button class="amz-action-link" data-action="remove" data-id="${row.id}" type="button" data-i18n="delete">Delete</button>
          <span class="amz-action-divider">|</span>
          <button class="amz-action-link" data-action="save-for-later" data-id="${row.id}" type="button" data-i18n="save_for_later">Save for later</button>
          <span class="amz-action-divider">|</span>
          <button class="amz-action-link" data-action="see-more" data-id="${row.id}" type="button" data-i18n="see_more_like_this">See more like this</button>
          <span class="amz-action-divider">|</span>
          <button class="amz-action-link" data-action="share" data-id="${row.id}" type="button">Share</button>
        </div>
      </div>
      <strong class="item-total">${money(row.quantity * row.price)}</strong>
    </article>
  `;
}

function renderSavedForLater() {
  const section = document.getElementById("savedForLaterSection");
  const list = document.getElementById("savedItemsList");
  if (!section || !list) return;

  const savedMap = loadSavedMap();
  const entries = Object.entries(savedMap).filter(([_, qty]) => Number(qty) > 0);

  if (entries.length === 0) {
    section.hidden = true;
    list.innerHTML = "";
    return;
  }

  section.hidden = false;
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();

  list.innerHTML = entries.map(([id, qty]) => {
    const product = getCatalogProduct(id);
    const name = product ? product.name : `Product #${id}`;
    const price = product ? product.price : 0;
    const image = product ? product.image : fallbackCatalogImage;
    const title = window.getLocalizedTitle ? window.getLocalizedTitle({ id, name }, currentLang) : name;

    return `
      <div class="amz-saved-card" data-id="${id}">
        <div class="amz-saved-thumb">
          <a href="product-detail.html?id=${encodeURIComponent(id)}">
            <img src="${image}" alt="${name}" loading="lazy" />
          </a>
        </div>
        <a class="amz-saved-title" href="product-detail.html?id=${encodeURIComponent(id)}">${title}</a>
        <div class="amz-saved-price">${money(price)}</div>
        <button class="amz-move-to-cart-btn" data-action="move-to-cart" data-id="${id}" type="button" data-i18n="move_to_cart">Move to cart</button>
        <button class="amz-saved-delete-btn" data-action="remove-saved" data-id="${id}" type="button" data-i18n="delete">Delete</button>
      </div>
    `;
  }).join("");
}

function syncHeaderCartCount() {
  const countEl = document.getElementById("cartCount") || document.querySelector(".nav-cart-count");
  const cartMap = loadCartMap();
  const total = Object.values(cartMap).reduce((sum, q) => sum + (Number(q) || 0), 0);
  if (countEl) {
    countEl.textContent = String(total);
  }
  if (typeof window.syncCartCount === "function") {
    window.syncCartCount();
  }
}

function renderCart() {
  syncHeaderCartCount();
  const rows = getCartRows();
  const breakdown = getPricingBreakdown(rows);
  const { itemCount, subtotal, shipping, tax, total, coupon } = breakdown;
  const reservation = getReservationState(rows);
  const deliverySlot = loadDeliverySlotState();

  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = window.EM_TRANSLATIONS?.[currentLang] || window.EM_TRANSLATIONS?.en || {};
  const subtotalLabel = t.cart_subtotal || "Subtotal";
  const itemsLabel = t.items || "items";
  const proceedLabel = t.proceed_to_buy || "Proceed to Buy";

  cartMetaEl.textContent = `${itemCount} ${itemsLabel}`;
  summaryItemsEl.textContent = `${subtotalLabel} (${itemCount} ${itemsLabel}):`;
  subtotalEl.textContent = money(subtotal);
  shippingEl.textContent = money(shipping);
  taxEl.textContent = money(tax);
  totalEl.textContent = money(subtotal);
  orderTotalEl.textContent = money(total);
  checkoutBtn.textContent = `${proceedLabel} (${itemCount} ${itemsLabel})`;
  checkoutBtn.disabled = itemCount === 0;

  const cartTaxLabel = document.getElementById("cartTaxLabel");
  if (cartTaxLabel) {
    const gstPrefix = t.estimated_gst || "Estimated GST";
    cartTaxLabel.textContent = `${gstPrefix} (${breakdown.gstLabelSuffix || "18%"}):`;
  }
  const subtotalLabelEl = document.getElementById("subtotalLabel");
  if (subtotalLabelEl) {
    subtotalLabelEl.textContent = t.subtotal_excl_tax || "Subtotal (Excl. Tax)";
  }

  // Update listing bottom subtotal
  const cartBottomSubtotalLabel = document.getElementById("cartBottomSubtotalLabel");
  const cartBottomSubtotalValue = document.getElementById("cartBottomSubtotalValue");
  if (cartBottomSubtotalLabel) {
    cartBottomSubtotalLabel.textContent = `${subtotalLabel} (${itemCount} ${itemsLabel}):`;
  }
  if (cartBottomSubtotalValue) {
    cartBottomSubtotalValue.textContent = money(subtotal);
  }

  // Update Deselect All / Select All Button
  const toggleSelectAllBtn = document.getElementById("toggleSelectAllBtn");
  if (toggleSelectAllBtn) {
    const unselectedMap = loadUnselectedMap();
    const hasUnselected = rows.some((r) => unselectedMap[r.id]);
    if (hasUnselected) {
      toggleSelectAllBtn.textContent = t.select_all || "Select all items";
    } else {
      toggleSelectAllBtn.textContent = t.deselect_all_items || "Deselect all items";
    }
  }

  // Update Free Delivery Qualifier Bar
  const freeDeliveryBar = document.getElementById("freeDeliveryBar");
  const fdQualifiedMsg = document.getElementById("fdQualifiedMsg");
  const fdUnqualifiedMsg = document.getElementById("fdUnqualifiedMsg");
  const fdProgressBar = document.getElementById("fdProgressBar");
  const fdProgressText = document.getElementById("fdProgressText");
  const summaryFdQualifier = document.getElementById("summaryFdQualifier");

  const FD_THRESHOLD = 499;
  if (freeDeliveryBar) {
    if (rows.length === 0) {
      freeDeliveryBar.hidden = true;
      if (summaryFdQualifier) summaryFdQualifier.hidden = true;
    } else if (isPrimeActive() || subtotal >= FD_THRESHOLD) {
      freeDeliveryBar.hidden = false;
      if (fdQualifiedMsg) {
        fdQualifiedMsg.hidden = false;
        if (isPrimeActive()) {
          fdQualifiedMsg.innerHTML = '<span class="fd-tick" aria-hidden="true">✓</span> <span><strong>Prime Delivery:</strong> Your order qualifies for <strong>FREE Fast Delivery</strong></span>';
        }
      }
      if (fdUnqualifiedMsg) fdUnqualifiedMsg.hidden = true;
      if (summaryFdQualifier) summaryFdQualifier.hidden = false;
    } else {
      freeDeliveryBar.hidden = false;
      if (fdQualifiedMsg) fdQualifiedMsg.hidden = true;
      if (fdUnqualifiedMsg) fdUnqualifiedMsg.hidden = false;
      if (summaryFdQualifier) summaryFdQualifier.hidden = true;

      const diff = FD_THRESHOLD - subtotal;
      const progressPercent = Math.min(100, Math.round((subtotal / FD_THRESHOLD) * 100));
      if (fdProgressBar) {
        fdProgressBar.style.width = `${progressPercent}%`;
      }
      if (fdProgressText) {
        const template = t.add_more_for_free_delivery || "Add items worth ₹{amount} more for FREE Delivery.";
        fdProgressText.innerHTML = template.replace("{amount}", diff.toLocaleString("en-IN"));
      }
    }
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
  const exRow = document.getElementById("exchangeDiscountRow");
  const exVal = document.getElementById("exchangeDiscountValue");
  if (exRow && exVal) {
    const showEx = Number(breakdown.exchangeDiscount || 0) > 0;
    exRow.hidden = !showEx;
    exVal.textContent = `-${money(breakdown.exchangeDiscount || 0)}`;
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
    const emptyMsg = t.cart_empty || "Your ElectroMart Cart is empty.";
    cartItemsEl.innerHTML = `
      <div class="amz-empty-cart-wrap">
        <img class="amz-empty-cart-img" src="https://m.media-amazon.com/images/G/31/cart/empty/kettle-desaturated._CB424694257_.svg" alt="Empty Cart" onerror="this.style.display='none'" />
        <div class="amz-empty-cart-content">
          <h2 data-i18n="cart_empty">${emptyMsg}</h2>
          <p style="color:#565959;font-size:14px;margin:0 0 10px;">Check your Saved for later items below or discover great deals across all categories.</p>
          <a href="todays-deals.html" class="amz-empty-deals-btn" data-i18n="todays_deals">Explore Today's Deals</a>
        </div>
      </div>
    `;
    renderSavedForLater();
    if (typeof window.applyFullPageTranslation === "function") {
      window.applyFullPageTranslation(currentLang);
    }
    return;
  }

  cartItemsEl.innerHTML = rows.map((row) => cartItemCard(row, currentLang)).join("");
  renderSavedForLater();

  if (typeof window.applyFullPageTranslation === "function") {
    window.applyFullPageTranslation(currentLang);
  }
}

window.renderCart = renderCart;
window.renderSavedForLater = renderSavedForLater;

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
    const unselectedMap = loadUnselectedMap();
    delete unselectedMap[key];
    saveUnselectedMap(unselectedMap);
  } else {
    cartMap[key] = next;
  }

  saveCartMap(cartMap);
  renderCart();
}

function setQuantity(productId, newQty) {
  const key = String(productId || "").trim();
  if (!key) return;

  const qty = parseInt(newQty, 10);
  const cartMap = loadCartMap();

  if (isNaN(qty) || qty <= 0) {
    delete cartMap[key];
    const unselectedMap = loadUnselectedMap();
    delete unselectedMap[key];
    saveUnselectedMap(unselectedMap);
  } else {
    cartMap[key] = qty;
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

  const unselectedMap = loadUnselectedMap();
  delete unselectedMap[key];
  saveUnselectedMap(unselectedMap);

  try {
    const exCart = JSON.parse(localStorage.getItem("electromart_exchange_cart_v1") || "{}");
    if (exCart[key]) {
      delete exCart[key];
      localStorage.setItem("electromart_exchange_cart_v1", JSON.stringify(exCart));
    }
  } catch (e) {}

  renderCart();
}

function saveForLater(productId) {
  const key = String(productId || "").trim();
  if (!key) return;

  const cartMap = loadCartMap();
  const qty = Number(cartMap[key] || 1);
  delete cartMap[key];
  saveCartMap(cartMap);

  const unselectedMap = loadUnselectedMap();
  delete unselectedMap[key];
  saveUnselectedMap(unselectedMap);

  const savedMap = loadSavedMap();
  savedMap[key] = (savedMap[key] || 0) + qty;
  saveSavedMap(savedMap);

  renderCart();
}

function moveToCart(productId) {
  const key = String(productId || "").trim();
  if (!key) return;

  const savedMap = loadSavedMap();
  const qty = Number(savedMap[key] || 1);
  delete savedMap[key];
  saveSavedMap(savedMap);

  const cartMap = loadCartMap();
  cartMap[key] = (cartMap[key] || 0) + qty;
  saveCartMap(cartMap);

  renderCart();
}

function removeSavedItem(productId) {
  const key = String(productId || "").trim();
  if (!key) return;

  const savedMap = loadSavedMap();
  delete savedMap[key];
  saveSavedMap(savedMap);

  renderSavedForLater();
}

// Global click delegation
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
  } else if (action === "decrease") {
    updateQuantity(productId, -1);
  } else if (action === "remove") {
    removeItem(productId);
  } else if (action === "remove-exchange") {
    try {
      const exCart = JSON.parse(localStorage.getItem("electromart_exchange_cart_v1") || "{}");
      delete exCart[productId];
      localStorage.setItem("electromart_exchange_cart_v1", JSON.stringify(exCart));
    } catch (e) {}
    renderCart();
  } else if (action === "remove-protection") {
    if (typeof window.setSelectedProtection === "function") window.setSelectedProtection(productId, null);
    renderCart();
  } else if (action === "save-for-later") {
    saveForLater(productId);
  } else if (action === "move-to-cart") {
    moveToCart(productId);
  } else if (action === "remove-saved") {
    removeSavedItem(productId);
  } else if (action === "see-more") {
    const row = getCatalogProduct(productId);
    const cat = row?.category || "all";
    window.location.href = `products.html?category=${encodeURIComponent(cat)}`;
  } else if (action === "share") {
    const shareUrl = `${window.location.origin}${window.location.pathname.replace('cart.html', '')}product-detail.html?id=${encodeURIComponent(productId)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Product link copied to clipboard!");
      }).catch(() => {});
    } else {
      prompt("Copy product link:", shareUrl);
    }
  }
});

// Change event delegation for Qty dropdown and Checkboxes
document.addEventListener("change", (event) => {
  const select = event.target.closest("select[data-action='change-qty']");
  if (select) {
    const productId = select.getAttribute("data-id");
    setQuantity(productId, select.value);
    return;
  }

  const checkbox = event.target.closest("input[data-action='toggle-select']");
  if (checkbox) {
    const productId = checkbox.getAttribute("data-id");
    const unselectedMap = loadUnselectedMap();
    if (checkbox.checked) {
      delete unselectedMap[String(productId)];
    } else {
      unselectedMap[String(productId)] = true;
    }
    saveUnselectedMap(unselectedMap);
    renderCart();
    return;
  }
});

// Deselect / Select all button
const toggleSelectAllBtn = document.getElementById("toggleSelectAllBtn");
if (toggleSelectAllBtn) {
  toggleSelectAllBtn.addEventListener("click", () => {
    const rows = getCartRows();
    const unselectedMap = loadUnselectedMap();
    const hasUnselected = rows.some((r) => unselectedMap[r.id]);

    if (hasUnselected) {
      // Select all
      rows.forEach((r) => {
        delete unselectedMap[r.id];
      });
    } else {
      // Deselect all
      rows.forEach((r) => {
        unselectedMap[r.id] = true;
      });
    }

    saveUnselectedMap(unselectedMap);
    renderCart();
  });
}

clearCartBtn.addEventListener("click", () => {
  saveCartMap({});
  saveUnselectedMap({});
  clearCouponState();
  try {
    localStorage.removeItem("electromart_exchange_cart_v1");
  } catch (e) {}
  renderCart();
});

checkoutBtn.addEventListener("click", () => {
  const rows = getCartRows().filter((r) => r.selected !== false);
  if (rows.length === 0) {
    return;
  }
  window.location.href = "checkout.html";
});

if (applyCouponBtn) {
  applyCouponBtn.addEventListener("click", () => {
    const code = normalizeCouponCode(couponInput?.value || "");
    const rows = getCartRows().filter((r) => r.selected !== false);
    const subtotal = rows.reduce((sum, row) => sum + row.price * row.quantity, 0);
    const shipping = rows.length > 0 ? (isPrimeActive() || subtotal >= 499 ? 0 : 19) : 0;
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

// Re-render cart when Prime status changes in any tab or custom event
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("storage", (e) => {
    if (e.key === "electromart_prime_status_v1") {
      renderCart();
    }
  });

  window.addEventListener("electromart_prime_updated", () => {
    renderCart();
  });
}

renderCart();
