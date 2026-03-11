const TAX_RATE = 0.08;
const BASE_SHIPPING_CHARGE = 19;

const COUPONS = {
  SAVE10: {
    label: "10% off up to Rs 500",
    type: "percent",
    value: 10,
    maxDiscount: 500,
    minSubtotal: 500
  },
  FREESHIP: {
    label: "Free shipping",
    type: "shipping",
    value: BASE_SHIPPING_CHARGE,
    minSubtotal: 0
  },
  WELCOME250: {
    label: "Rs 250 off on orders above Rs 2,000",
    type: "flat",
    value: 250,
    minSubtotal: 2000
  }
};

function roundCurrency(value) {
  return Number((Number(value || 0) + Number.EPSILON).toFixed(2));
}

function normalizeCouponCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeQuantity(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.min(999, Math.floor(parsed)));
}

function normalizeStock(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.floor(parsed));
}

function isPurchasableProduct(product) {
  const status = String(product && product.status ? product.status : "active").trim().toLowerCase();
  return status === "active";
}

function evaluateCoupon(code, subtotal, shipping) {
  const normalized = normalizeCouponCode(code);
  const safeSubtotal = roundCurrency(subtotal);
  const safeShipping = roundCurrency(shipping);
  const coupon = COUPONS[normalized];

  if (!normalized) {
    return { code: "", valid: false, amount: 0, coupon: null, message: "" };
  }

  if (!coupon) {
    return {
      code: normalized,
      valid: false,
      amount: 0,
      coupon: null,
      message: "Invalid coupon code."
    };
  }

  if (safeSubtotal < Number(coupon.minSubtotal || 0)) {
    const remaining = roundCurrency(Number(coupon.minSubtotal || 0) - safeSubtotal);
    return {
      code: normalized,
      valid: false,
      amount: 0,
      coupon,
      message: `Add Rs ${remaining.toFixed(2)} more to use ${normalized}.`
    };
  }

  let amount = 0;
  if (coupon.type === "percent") {
    amount = safeSubtotal * (Number(coupon.value || 0) / 100);
    if (coupon.maxDiscount) {
      amount = Math.min(amount, Number(coupon.maxDiscount));
    }
  } else if (coupon.type === "flat") {
    amount = Number(coupon.value || 0);
  } else if (coupon.type === "shipping") {
    amount = Math.min(safeShipping, Number(coupon.value || 0));
  }

  return {
    code: normalized,
    valid: true,
    amount: roundCurrency(Math.min(safeSubtotal + safeShipping, Math.max(0, amount))),
    coupon,
    message: `${normalized} applied: ${coupon.label}`
  };
}

function buildOrderPricing(items, products, options = {}) {
  const requestedItems = Array.isArray(items) ? items : [];
  if (!requestedItems.length) {
    return {
      ok: false,
      status: 400,
      message: "Add at least one valid item before placing an order."
    };
  }

  const productMap = new Map(
    (Array.isArray(products) ? products : []).map((product) => [String(product && product.id ? product.id : ""), product])
  );
  const enrichedItems = [];

  for (const rawItem of requestedItems) {
    const productId = String(rawItem && rawItem.productId ? rawItem.productId : "").trim();
    const quantity = normalizeQuantity(rawItem && rawItem.quantity, 1);
    const product = productMap.get(productId);

    if (!product) {
      return {
        ok: false,
        status: 404,
        message: `Product ${productId || "item"} was not found.`
      };
    }

    if (!isPurchasableProduct(product)) {
      return {
        ok: false,
        status: 409,
        message: `${product.name || "This product"} is not available for purchase right now.`
      };
    }

    const minimumOrderQuantity = Math.max(0, Math.floor(Number(product.moq || 0)));
    if (String(product.segment || "").trim().toLowerCase() === "b2b" && minimumOrderQuantity > 0 && quantity < minimumOrderQuantity) {
      return {
        ok: false,
        status: 400,
        message: `Minimum order quantity for ${product.name || "this product"} is ${minimumOrderQuantity}.`
      };
    }

    const availableStock = normalizeStock(product.stock);
    if (availableStock < quantity) {
      return {
        ok: false,
        status: 409,
        message: quantity === 1
          ? `${product.name || "This product"} is out of stock.`
          : `Only ${availableStock} unit(s) of ${product.name || "this product"} are available right now.`
      };
    }

    const price = roundCurrency(product.price);
    enrichedItems.push({
      productId: String(product.id),
      sku: String(product.sku || ""),
      name: String(product.name || "Product"),
      brand: String(product.brand || ""),
      price,
      quantity,
      stockReserved: quantity,
      lineTotal: roundCurrency(price * quantity)
    });
  }

  const subtotal = roundCurrency(enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0));
  const shipping = roundCurrency(enrichedItems.length ? BASE_SHIPPING_CHARGE : 0);
  const couponResult = evaluateCoupon(options.couponCode, subtotal, shipping);

  if (normalizeCouponCode(options.couponCode) && !couponResult.valid) {
    return {
      ok: false,
      status: 400,
      message: couponResult.message || "Invalid coupon code."
    };
  }

  const nonShippingDiscount = couponResult.valid && couponResult.coupon && couponResult.coupon.type !== "shipping"
    ? couponResult.amount
    : 0;
  const taxableSubtotal = roundCurrency(Math.max(0, subtotal - nonShippingDiscount));
  const tax = roundCurrency(taxableSubtotal * TAX_RATE);
  const discount = roundCurrency(couponResult.valid ? couponResult.amount : 0);
  const total = roundCurrency(subtotal + shipping + tax - discount);

  return {
    ok: true,
    items: enrichedItems,
    subtotal,
    shipping,
    tax,
    total,
    discount,
    couponCode: couponResult.valid ? couponResult.code : "",
    taxableSubtotal,
    coupon: couponResult
  };
}

function normalizeInventoryReservation(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  return {
    deductedAt: source.deductedAt ? String(source.deductedAt) : null,
    releasedAt: source.releasedAt ? String(source.releasedAt) : null,
    releasedReason: source.releasedReason ? String(source.releasedReason) : ""
  };
}

function ensureInventoryReservation(order) {
  if (!order || typeof order !== "object") {
    return normalizeInventoryReservation({});
  }
  order.inventoryReservation = normalizeInventoryReservation(order.inventoryReservation);
  return order.inventoryReservation;
}

function reserveInventoryForOrder(db, order, options = {}) {
  const reservation = ensureInventoryReservation(order);
  if (reservation.deductedAt && !reservation.releasedAt) {
    return {
      ok: true,
      alreadyReserved: true,
      reservation
    };
  }

  const adjustments = [];
  for (const item of Array.isArray(order && order.items) ? order.items : []) {
    const product = (db.products || []).find((entry) => String(entry && entry.id ? entry.id : "") === String(item.productId || ""));
    if (!product) {
      return {
        ok: false,
        status: 404,
        message: `${item.name || "A product"} is no longer available.`
      };
    }
    const quantity = normalizeQuantity(item.quantity, 1);
    const availableStock = normalizeStock(product.stock);
    if (availableStock < quantity) {
      return {
        ok: false,
        status: 409,
        message: `Insufficient stock for ${item.name || "this product"}. Available: ${availableStock}.`
      };
    }
    adjustments.push({ product, quantity });
  }

  adjustments.forEach(({ product, quantity }) => {
    product.stock = normalizeStock(product.stock) - quantity;
  });

  order.inventoryReservation = normalizeInventoryReservation({
    deductedAt: options.at || new Date().toISOString(),
    releasedAt: null,
    releasedReason: ""
  });

  return {
    ok: true,
    alreadyReserved: false,
    reservation: order.inventoryReservation
  };
}

function releaseInventoryForOrder(db, order, options = {}) {
  const reservation = ensureInventoryReservation(order);
  if (!reservation.deductedAt || reservation.releasedAt) {
    return {
      ok: true,
      alreadyReleased: true,
      reservation
    };
  }

  for (const item of Array.isArray(order && order.items) ? order.items : []) {
    const product = (db.products || []).find((entry) => String(entry && entry.id ? entry.id : "") === String(item.productId || ""));
    if (!product) {
      continue;
    }
    product.stock = normalizeStock(product.stock) + normalizeQuantity(item.quantity, 1);
  }

  order.inventoryReservation = normalizeInventoryReservation({
    deductedAt: reservation.deductedAt,
    releasedAt: options.at || new Date().toISOString(),
    releasedReason: String(options.reason || "cancelled")
  });

  return {
    ok: true,
    alreadyReleased: false,
    reservation: order.inventoryReservation
  };
}

function reReserveInventoryForOrder(db, order, options = {}) {
  const reservation = ensureInventoryReservation(order);
  if (!reservation.releasedAt) {
    return {
      ok: true,
      alreadyReserved: true,
      reservation
    };
  }

  const adjustments = [];
  for (const item of Array.isArray(order && order.items) ? order.items : []) {
    const product = (db.products || []).find((entry) => String(entry && entry.id ? entry.id : "") === String(item.productId || ""));
    if (!product) {
      return {
        ok: false,
        status: 404,
        message: `${item.name || "A product"} is no longer available to re-open this order.`
      };
    }
    const quantity = normalizeQuantity(item.quantity, 1);
    const availableStock = normalizeStock(product.stock);
    if (availableStock < quantity) {
      return {
        ok: false,
        status: 409,
        message: `Cannot re-open order. ${item.name || "A product"} only has ${availableStock} unit(s) available now.`
      };
    }
    adjustments.push({ product, quantity });
  }

  adjustments.forEach(({ product, quantity }) => {
    product.stock = normalizeStock(product.stock) - quantity;
  });

  order.inventoryReservation = normalizeInventoryReservation({
    deductedAt: reservation.deductedAt || options.at || new Date().toISOString(),
    releasedAt: null,
    releasedReason: ""
  });

  return {
    ok: true,
    alreadyReserved: false,
    reservation: order.inventoryReservation
  };
}

module.exports = {
  BASE_SHIPPING_CHARGE,
  COUPONS,
  TAX_RATE,
  buildOrderPricing,
  ensureInventoryReservation,
  evaluateCoupon,
  normalizeCouponCode,
  normalizeInventoryReservation,
  normalizeStock,
  releaseInventoryForOrder,
  reReserveInventoryForOrder,
  reserveInventoryForOrder,
  roundCurrency
};
