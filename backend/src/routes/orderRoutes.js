const express = require("express");
const { createHash, randomUUID } = require("crypto");
const { readDb, writeDb, withWriteLock } = require("../lib/db");
const { requireAuth } = require("../middleware/authMiddleware");
const { appendOrderStatusEvent, withNormalizedOrderStatusHistory } = require("../lib/orderStatus");
const { dispatchOrderStatusNotification, listOrderNotificationsForUser } = require("../lib/orderNotifications");
const {
  getSqliteLatestPaymentForOrder,
  getSqliteOrderById,
  isSqliteOrderPaymentQueriesEnabled,
  listSqliteOrders,
  writeSqliteOrderPaymentCollections
} = require("../lib/sqliteOrdersPayments");
const {
  buildOrderPricing,
  normalizeCorporateOrderDetails,
  releaseInventoryForOrder,
  reserveInventoryForOrder
} = require("../lib/orderCommerce");
const {
  finalizeOrderPaymentSources,
  reserveOrderPaymentSources,
  releaseOrderPaymentSources,
  issueGiftCardsForOrder
} = require("../lib/giftCards");
const {
  cancelOrderPayments,
  getLatestPaymentForOrder,
  isOnlinePaymentMethod
} = require("../lib/paymentLifecycle");
const {
  createRazorpayRefund,
  isRazorpayEnabled,
  mapRazorpayRefundEntity
} = require("../lib/razorpayGateway");
const { buildReservationUntil } = require("../lib/orderReservationMaintenance");
const {
  AFTER_SALES_REASON_LABELS,
  AFTER_SALES_STATUS_LABELS,
  canCustomerRequestAfterSalesForOrder,
  createAfterSalesCase,
  ensureAfterSalesCollections,
  getAfterSalesStatusesForType,
  isFinalAfterSalesStatus,
  normalizeAfterSalesCase
} = require("../lib/afterSalesCases");
const { logError, logInfo } = require("../lib/logger");

const piiEncryption = require("../middleware/piiEncryption");
const { encryptPiiValue } = piiEncryption;
const router = express.Router();

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function persistOrderRouteMutation(db, collections) {
  if (isSqliteOrderPaymentQueriesEnabled()) {
    if (collections.some((collection) => ["users", "giftCards", "giftCardRedemptions", "paymentSourceReservations", "corporateInvoices"].includes(collection))) {
      writeDb(db);
      return;
    }
    writeSqliteOrderPaymentCollections(db, collections);
    return;
  }
  writeDb(db);
}

function buildOrderRequestFingerprint({
  items,
  shippingAddress,
  paymentMethod,
  couponCode,
  deliverySlot,
  expectedSubtotal,
  exchangeQuoteIds,
  giftCardClaimCode,
  useWalletBalance,
  corporateDetails
}) {
  const payload = {
    items: items.map((item) => ({
      productId: String(item && item.productId || "").trim(),
      quantity: Number(item && item.quantity),
      ...(item && item.giftCard ? {
        giftCard: {
          recipientName: String(item.giftCard.recipientName || ""),
          recipientEmail: String(item.giftCard.recipientEmail || ""),
          senderName: String(item.giftCard.senderName || ""),
          giftMessage: String(item.giftCard.giftMessage || ""),
          templateId: String(item.giftCard.templateId || ""),
          deliveryDate: String(item.giftCard.deliveryDate || "")
        }
      } : {})
    })),
    shippingAddress: String(shippingAddress || ""),
    paymentMethod: String(paymentMethod || "cod").trim().toLowerCase(),
    couponCode: String(couponCode || "").trim().toUpperCase(),
    deliverySlot: deliverySlot || null,
    expectedSubtotal: expectedSubtotal === undefined || expectedSubtotal === null ? null : Number(expectedSubtotal),
    giftCardClaimCodeHash: String(giftCardClaimCode || "").trim()
      ? createHash("sha256").update(String(giftCardClaimCode).trim().toUpperCase()).digest("hex")
      : "",
    useWalletBalance: useWalletBalance === true,
    corporateDetails: corporateDetails || null,
    exchangeDiscount: 0,
    exchangeDetails: [],
    ...(exchangeQuoteIds.length ? { exchangeQuoteIds: [...exchangeQuoteIds].sort() } : {})
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function normalizeGiftCardPurchaseItems(items, paymentMethod) {
  const products = [];
  const normalizedItems = [];
  let containsGiftCard = false;

  for (const rawItem of items) {
    const productId = String(rawItem && rawItem.productId || "").trim();
    const giftCardMatch = productId.match(/^EM-GC-(\d{3,5})$/);
    if (!giftCardMatch) {
      if (productId.startsWith("EM-GC-") || (rawItem && rawItem.giftCard)) {
        return {
          ok: false,
          status: 400,
          message: "Gift card purchase details are invalid."
        };
      }
      normalizedItems.push(rawItem);
      continue;
    }

    containsGiftCard = true;
    const amount = Number(giftCardMatch[1]);
    const quantity = Number(rawItem.quantity);
    if (!Number.isInteger(amount) || amount < 100 || amount > 10000
      || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return {
        ok: false,
        status: 400,
        message: "Gift card amount or quantity is outside the allowed limit."
      };
    }
    if (!isOnlinePaymentMethod(paymentMethod)) {
      return {
        ok: false,
        status: 400,
        message: "Gift cards must be paid for using an online payment method."
      };
    }

    const details = rawItem.giftCard && typeof rawItem.giftCard === "object" ? rawItem.giftCard : {};
    const recipientName = String(details.recipientName || "").trim();
    const recipientEmail = String(details.recipientEmail || "").trim().toLowerCase();
    const senderName = String(details.senderName || "").trim();
    const giftMessage = String(details.giftMessage || "").trim();
    const templateId = String(details.templateId || "festival").trim();
    const deliveryDate = String(details.deliveryDate || "").trim();
    if (recipientName.length > 120 || senderName.length > 120 || giftMessage.length > 500
      || !/^[a-z0-9_-]{1,40}$/i.test(templateId)
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail) || recipientEmail.length > 254
      || (deliveryDate && (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) || Number.isNaN(Date.parse(`${deliveryDate}T00:00:00Z`))))) {
      return {
        ok: false,
        status: 400,
        message: "Gift card recipient details are invalid."
      };
    }

    products.push({
      id: productId,
      name: `ElectroMart E-Gift Card (₹${amount})`,
      price: amount,
      stock: 100000,
      status: "active",
      category: "gift-card",
      gstRate: 0.18
    });
    normalizedItems.push({
      productId,
      quantity,
      giftCard: {
        recipientName: recipientName || "Recipient",
        recipientEmail,
        senderName,
        giftMessage,
        templateId,
        deliveryDate
      }
    });
  }

  return { ok: true, products, items: normalizedItems, containsGiftCard };
}

function normalizeExchangeDetails(rawDetails = []) {
  if (!Array.isArray(rawDetails)) {
    return [];
  }

  return rawDetails
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }
      const discountAmount = Number(entry.discountAmount || entry.finalValue || 0);
      if (!Number.isFinite(discountAmount) || discountAmount <= 0) {
        return null;
      }
      return {
        targetProductId: String(entry.targetProductId || entry.productId || "").trim(),
        targetProductName: String(entry.targetProductName || entry.productName || "").trim(),
        exchangeDeviceName: String(entry.exchangeDeviceName || entry.deviceName || "").trim(),
        category: String(entry.category || "").trim(),
        brand: String(entry.brand || "").trim(),
        imei: String(entry.imei || "").trim(),
        discountAmount: Math.max(0, discountAmount),
        status: String(entry.status || "pending_pickup").trim() || "pending_pickup"
      };
    })
    .filter(Boolean);
}

function formatAfterSalesTypeLabel(type) {
  const value = String(type || "").trim().toLowerCase();
  if (!value) {
    return "Request";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildAfterSalesCaseView(caseItem) {
  const normalizedCase = normalizeAfterSalesCase(caseItem);
  const timeline = Array.isArray(normalizedCase.timeline) ? [...normalizedCase.timeline] : [];
  const latestUpdate = timeline.length
    ? [...timeline].sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())[0]
    : null;
  return {
    ...normalizedCase,
    typeLabel: formatAfterSalesTypeLabel(normalizedCase.type),
    reasonLabel: AFTER_SALES_REASON_LABELS[normalizedCase.reason] || formatAfterSalesTypeLabel(normalizedCase.reason),
    statusLabel: AFTER_SALES_STATUS_LABELS[normalizedCase.status] || formatAfterSalesTypeLabel(normalizedCase.status),
    latestUpdate,
    final: isFinalAfterSalesStatus(normalizedCase.status),
    statusOptions: getAfterSalesStatusesForType(normalizedCase.type)
  };
}

function withOrderAfterSales(db, order) {
  ensureAfterSalesCollections(db);
  const publicOrder = { ...withNormalizedOrderStatusHistory(order) };
  delete publicOrder.idempotencyKey;
  delete publicOrder.idempotencyFingerprint;
  const afterSalesCases = db.afterSalesCases
    .filter((item) => item.orderId === order.id)
    .map((item) => buildAfterSalesCaseView(item))
    .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0).getTime() - new Date(left.updatedAt || left.createdAt || 0).getTime());
  const openCase = afterSalesCases.find((item) => !item.final) || null;
  return {
    ...publicOrder,
    afterSalesCases,
    openAfterSalesCaseId: openCase ? openCase.id : "",
    canRequestAfterSales: canCustomerRequestAfterSalesForOrder(order) && !openCase
  };
}

router.post("/", requireAuth, piiEncryption, async (req, res) => {
  const {
    items = [],
    shippingAddress = "",
    paymentMethod = "cod",
    couponCode = "",
    deliverySlot = null,
    reservationUntil = "",
    expectedSubtotal,
    exchangeDiscount: rawExchangeDiscount,
    exchangeDetails: rawExchangeDetails,
    exchangeQuoteId: rawExchangeQuoteId,
    exchangeQuoteIds: rawExchangeQuoteIds,
    giftCardClaimCode = "",
    useWalletBalance = false,
    corporateDetails: rawCorporateDetails,
    idempotencyKey: bodyIdempotencyKey = ""
  } = req.body || {};
  if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ message: "Invalid order payload" });
  }

  const idempotencyKey = String(req.get("Idempotency-Key") || bodyIdempotencyKey || "").trim();
  if (idempotencyKey.length > 128) {
    return res.status(400).json({ message: "Idempotency key must be 128 characters or fewer." });
  }

  const db = readDb();
  const corporateOrder = normalizeCorporateOrderDetails(rawCorporateDetails);
  if (!corporateOrder.ok) {
    return res.status(corporateOrder.status || 400).json({ message: corporateOrder.message });
  }
  if (!Array.isArray(db.corporateInvoices)) db.corporateInvoices = [];
  if ((Number(rawExchangeDiscount || 0) > 0) || (Array.isArray(rawExchangeDetails) && rawExchangeDetails.length > 0)) {
    return res.status(400).json({
      message: "Client-supplied exchange discounts are not accepted. Provide server-issued exchange quote IDs."
    });
  }
  const rawQuoteIds = Array.isArray(rawExchangeQuoteIds)
    ? rawExchangeQuoteIds
    : [rawExchangeQuoteId || rawExchangeQuoteIds];
  const exchangeQuoteIds = rawQuoteIds.map((quoteId) => String(quoteId || "").trim()).filter(Boolean);
  if (new Set(exchangeQuoteIds).size !== exchangeQuoteIds.length) {
    return res.status(400).json({ message: "An exchange quote can only be used once per order." });
  }

  const giftCardPurchase = normalizeGiftCardPurchaseItems(items, paymentMethod);
  if (!giftCardPurchase.ok) {
    return res.status(giftCardPurchase.status || 400).json({ message: giftCardPurchase.message });
  }
  const normalizedGiftCardClaimCode = String(giftCardClaimCode || "").trim();
  const shouldUseWalletBalance = useWalletBalance === true || String(paymentMethod || "").trim().toLowerCase() === "wallet";
  if (giftCardPurchase.containsGiftCard && normalizedGiftCardClaimCode) {
    return res.status(400).json({ message: "Gift card purchases cannot be paid with another gift card." });
  }
  const orderItems = giftCardPurchase.items;
  const requestFingerprint = buildOrderRequestFingerprint({
    items: orderItems,
    shippingAddress,
    paymentMethod,
    couponCode,
    deliverySlot,
    expectedSubtotal,
    exchangeQuoteIds,
    giftCardClaimCode: normalizedGiftCardClaimCode,
    useWalletBalance: shouldUseWalletBalance,
    corporateDetails: corporateOrder.details
  });
  if (idempotencyKey) {
    const existingOrder = (Array.isArray(db.orders) ? db.orders : []).find((item) =>
      item.userId === req.user.id && item.idempotencyKey === idempotencyKey
    );
    if (existingOrder) {
      if (existingOrder.idempotencyFingerprint !== requestFingerprint) {
        return res.status(409).json({ message: "Idempotency key was already used for a different order." });
      }
      return res.status(200).json({
        ...withOrderAfterSales(db, existingOrder),
        notification: { skipped: true, reason: "idempotent-replay" },
        idempotentReplay: true
      });
    }
  }

  const pricing = buildOrderPricing(orderItems, [...db.products, ...giftCardPurchase.products], { couponCode });
  if (!pricing.ok) {
    return res.status(pricing.status || 400).json({ message: pricing.message || "Unable to create order." });
  }
  pricing.items.forEach((pricedItem, index) => {
    if (String(orderItems[index] && orderItems[index].productId || "").startsWith("EM-GC-")) {
      pricedItem.isGiftCard = true;
      pricedItem.giftCard = orderItems[index].giftCard;
    }
  });
  if (expectedSubtotal !== undefined && expectedSubtotal !== null) {
    const parsedExpectedSubtotal = Number(expectedSubtotal);
    if (!Number.isFinite(parsedExpectedSubtotal) || parsedExpectedSubtotal < 0) {
      return res.status(400).json({ message: "Expected cart subtotal must be a non-negative number." });
    }
    if (Math.abs(parsedExpectedSubtotal - pricing.subtotal) > 0.01) {
      return res.status(409).json({
        code: "CART_CHANGED",
        message: "Your cart prices have changed. Review the updated subtotal before placing your order."
      });
    }
  }

  const orderProductIds = new Set(orderItems.map((item) => String(item && item.productId || "").trim()));
  const availableQuotes = Array.isArray(db.exchangeQuotes) ? db.exchangeQuotes : [];
  const exchangeQuotes = [];
  for (const quoteId of exchangeQuoteIds) {
    const quote = availableQuotes.find((entry) => String(entry && entry.id || "") === quoteId);
    if (!quote) {
      return res.status(404).json({ message: "Exchange quote not found or expired. Request a new quote." });
    }
    if (quote.userId !== req.user.id) {
      return res.status(403).json({ message: "This exchange quote belongs to another account." });
    }
    if (quote.status !== "PENDING" || !Number.isFinite(Date.parse(quote.expiresAt)) || Date.parse(quote.expiresAt) <= Date.now()) {
      return res.status(409).json({ message: "This exchange quote is no longer available. Request a new quote." });
    }
    if (!orderProductIds.has(String(quote.targetProductId || ""))) {
      return res.status(400).json({ message: "The product linked to this exchange quote must be in the order." });
    }
    const targetLine = pricing.items.find((item) => String(item.productId) === String(quote.targetProductId));
    if (!targetLine || Number(quote.discountAmount || 0) > Number(targetLine.lineTotal || 0)) {
      return res.status(409).json({ message: "The exchange quote exceeds the current target item price. Request a new quote." });
    }
    if (exchangeQuotes.some((entry) => String(entry.targetProductId) === String(quote.targetProductId))) {
      return res.status(400).json({ message: "Only one exchange quote may be applied to each order item." });
    }
    exchangeQuotes.push(quote);
  }

  const rawExchangeImeiByQuote = req.body && req.body.exchangeImeiByQuote && typeof req.body.exchangeImeiByQuote === "object"
    ? req.body.exchangeImeiByQuote
    : {};
  if (Object.keys(rawExchangeImeiByQuote).some((quoteId) => !exchangeQuoteIds.includes(quoteId))) {
    return res.status(400).json({ message: "IMEI values may only be provided for exchange quotes in this order." });
  }
  const encryptedImeiByQuote = {};
  for (const quote of exchangeQuotes) {
    const imei = String(rawExchangeImeiByQuote[quote.id] || "").trim();
    const validImei = quote.category === "smartphones"
      ? /^\d{15}$/.test(imei)
      : /^[A-Za-z0-9]{6,18}$/.test(imei);
    if (!validImei) {
      return res.status(400).json({ message: "Enter a valid device IMEI or serial number for each exchange quote." });
    }
    try {
      encryptedImeiByQuote[quote.id] = encryptPiiValue(imei);
    } catch (error) {
      return res.status(503).json({ message: "Secure exchange identifier storage is not configured." });
    }
  }

  const createdAt = new Date().toISOString();
  const effectiveExchangeDiscount = exchangeQuotes.reduce((sum, quote) => sum + Number(quote.discountAmount || 0), 0);
  const finalOrderTotal = Math.max(0, Number(pricing.total || 0) - effectiveExchangeDiscount);
  const exchangeDetails = exchangeQuotes.map((quote) => ({
    targetProductId: String(quote.targetProductId),
    targetProductName: pricing.items.find((item) => String(item.productId) === String(quote.targetProductId))?.name || "",
    exchangeDeviceName: String(quote.modelName || "Device"),
    category: String(quote.category || ""),
    brand: String(quote.brand || ""),
    discountAmount: Number(quote.discountAmount),
    quoteId: String(quote.id),
    imeiEncrypted: encryptedImeiByQuote[quote.id],
    status: "pending_pickup"
  }));
  const effectiveReservationUntil = buildReservationUntil(paymentMethod, reservationUntil, createdAt);
  const issuedGiftCards = [];
  let encryptedShippingAddress;
  try {
    encryptedShippingAddress = encryptPiiValue(shippingAddress);
  } catch (error) {
    logError("order_shipping_address_encryption_failed", {
      message: error && error.message ? error.message : String(error)
    }, {
      requestId: req.requestId
    });
    return res.status(503).json({
      message: "Secure address storage is not configured. Please contact support."
    });
  }
  const order = {
    id: randomUUID(),
    userId: req.user.id,
    items: pricing.items,
    shippingAddress: encryptedShippingAddress,
    paymentMethod,
    couponCode: pricing.couponCode,
    discount: pricing.discount,
    deliverySlot,
    reservationUntil: effectiveReservationUntil,
    paymentStatus: "pending",
    status: "processing",
    subtotal: pricing.subtotal,
    shipping: pricing.shipping,
    tax: pricing.tax,
    total: finalOrderTotal,
    exchangeDiscount: effectiveExchangeDiscount,
    exchangeDetails: exchangeDetails.length > 0 ? exchangeDetails : null,
    ...(corporateOrder.details ? { corporateDetails: corporateOrder.details } : {}),
    ...(corporateOrder.details && corporateOrder.details.requestBulkInvoice
      ? { bulkInvoiceRequestId: randomUUID() }
      : {}),
    paymentBreakdown: {
      giftCardAmount: 0,
      walletAmount: 0,
      amountDue: finalOrderTotal,
      settlementStatus: "none"
    },
    ...(idempotencyKey ? { idempotencyKey, idempotencyFingerprint: requestFingerprint } : {}),
    createdAt
  };
  order.statusHistory = appendOrderStatusEvent(order, "processing", createdAt);

  const inventory = reserveInventoryForOrder(db, order, { at: createdAt });
  if (!inventory.ok) {
    return res.status(inventory.status || 409).json({
      message: inventory.message || "Unable to reserve inventory for this order."
    });
  }

  const paymentSources = reserveOrderPaymentSources(db, {
    orderId: order.id,
    userId: req.user.id,
    claimCode: normalizedGiftCardClaimCode,
    orderTotal: finalOrderTotal,
    useWalletBalance: shouldUseWalletBalance,
    expiresAt: effectiveReservationUntil,
    at: createdAt
  });
  if (!paymentSources.ok) {
    releaseInventoryForOrder(db, order, { reason: "payment-source-invalid", at: createdAt });
    return res.status(paymentSources.status || 400).json({ message: paymentSources.message || "Unable to apply payment sources." });
  }
  if (String(paymentMethod || "").trim().toLowerCase() === "wallet" && paymentSources.amountDue > 0) {
    releaseOrderPaymentSources(db, order.id, createdAt);
    releaseInventoryForOrder(db, order, { reason: "wallet-balance-insufficient", at: createdAt });
    return res.status(402).json({
      code: "WALLET_INSUFFICIENT",
      message: "Your ElectroMart Pay balance does not cover the remaining order amount. Choose another payment method or apply more gift card balance."
    });
  }

  order.paymentBreakdown = {
    giftCardAmount: Number(paymentSources.giftCardAmount || 0),
    walletAmount: Number(paymentSources.walletAmount || 0),
    amountDue: Number(paymentSources.amountDue || 0),
    settlementStatus: paymentSources.reservationId ? "reserved" : "none",
    ...(paymentSources.walletBalanceRemaining !== null && paymentSources.walletBalanceRemaining !== undefined
      ? { walletBalanceRemaining: Number(paymentSources.walletBalanceRemaining) }
      : {})
  };
  if (paymentSources.amountDue === 0) {
    const finalized = finalizeOrderPaymentSources(db, order.id, createdAt);
    if (!finalized.ok) {
      releaseOrderPaymentSources(db, order.id, createdAt);
      releaseInventoryForOrder(db, order, { reason: "payment-source-finalization-failed", at: createdAt });
      return res.status(finalized.status || 409).json({ message: finalized.message || "Unable to finalize checkout payment sources." });
    }
    order.paymentStatus = "paid";
    order.paymentBreakdown.settlementStatus = paymentSources.reservationId ? "captured" : "none";
    issuedGiftCards.push(...issueGiftCardsForOrder(db, order, { at: createdAt }));
  } else if (String(paymentMethod || "").trim().toLowerCase() === "cod") {
    order.paymentStatus = "authorized";
    if (paymentSources.reservationId) {
      const finalized = finalizeOrderPaymentSources(db, order.id, createdAt);
      if (!finalized.ok) {
        releaseOrderPaymentSources(db, order.id, createdAt);
        releaseInventoryForOrder(db, order, { reason: "payment-source-finalization-failed", at: createdAt });
        return res.status(finalized.status || 409).json({ message: finalized.message || "Unable to finalize checkout payment sources." });
      }
      order.paymentBreakdown.settlementStatus = "captured";
    }
  }

  exchangeQuotes.forEach((quote) => {
    quote.status = "USED";
    quote.usedAt = createdAt;
    quote.orderId = order.id;
  });
  if (order.bulkInvoiceRequestId) {
    db.corporateInvoices.push({
      id: order.bulkInvoiceRequestId,
      orderId: order.id,
      userId: req.user.id,
      companyName: corporateOrder.details.companyName,
      poNumber: corporateOrder.details.poNumber,
      gstin: corporateOrder.details.gstin,
      billingAddress: corporateOrder.details.billingAddress,
      gstinVerificationStatus: corporateOrder.details.gstinVerificationStatus,
      status: "requested",
      requestedAt: createdAt
    });
  }
  db.orders.push(order);
  const notification = order.paymentStatus !== "paid" && isOnlinePaymentMethod(paymentMethod)
    ? { skipped: true, reason: "awaiting-payment-confirmation" }
    : await dispatchOrderStatusNotification(db, order, {
      eventKey: "ordered",
      triggeredBy: "order-create",
      triggeredFrom: "checkout"
    });
  persistOrderRouteMutation(db, [
    "orders",
    ...(order.bulkInvoiceRequestId ? ["corporateInvoices"] : []),
    "products",
    "orderNotifications",
    ...(exchangeQuotes.length ? ["exchangeQuotes"] : []),
    ...(paymentSources.reservationId ? ["users", "giftCards", "giftCardRedemptions", "paymentSourceReservations"] : [])
  ]);
  logInfo("order_created", {
    orderId: order.id,
    userId: req.user.id,
    paymentMethod: String(order.paymentMethod || "").trim().toLowerCase(),
    total: Number(order.total || 0),
    notificationSkipped: notification && notification.skipped === true
  }, {
    requestId: req.requestId
  });
  return res.status(201).json({
    ...withOrderAfterSales(db, order),
    ...(issuedGiftCards.length ? { giftCards: issuedGiftCards } : {}),
    notification
  });
});

router.get("/my", requireAuth, (req, res) => {
  const db = readDb();
  const orderSource = isSqliteOrderPaymentQueriesEnabled()
    ? listSqliteOrders({ userId: req.user.id })
    : db.orders;
  const orders = orderSource
    .filter((order) => order.userId === req.user.id)
    .map((order) => withOrderAfterSales(db, order));
  return res.json({ count: orders.length, orders });
});

router.get("/notifications", requireAuth, (req, res) => {
  const db = readDb();
  const notifications = listOrderNotificationsForUser(db, req.user, Number(req.query.limit || 50));
  const counts = notifications.reduce((accumulator, item) => {
    const key = String(item.status || "queued");
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  return res.json({
    count: notifications.length,
    counts,
    notifications
  });
});

router.get("/:id", requireAuth, (req, res) => {
  const db = readDb();
  const order = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteOrderById(req.params.id)
    : db.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  return res.json(withOrderAfterSales(db, order));
});

router.post("/:id/after-sales", requireAuth, piiEncryption, async (req, res) => {
  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      ensureAfterSalesCollections(currentDb);
      const order = currentDb.orders.find((item) => item.id === req.params.id);
      if (!order) {
        throw createHttpError(404, "Order not found");
      }
      if (order.userId !== req.user.id && req.user.role !== "admin") {
        throw createHttpError(403, "Forbidden");
      }
      if (!canCustomerRequestAfterSalesForOrder(order)) {
        throw createHttpError(409, "This order is not eligible for a new return, refund, or exchange request.");
      }

      const user = currentDb.users.find((item) => item.id === order.userId) || null;
      const result = createAfterSalesCase(currentDb, order, {
        type: req.body && req.body.type,
        reason: req.body && req.body.reason,
        requestedBy: req.user.role === "admin" ? "admin" : "customer",
        customerName: user && user.name ? user.name : req.user.name || "",
        customerEmail: user && user.email ? user.email : req.user.email || "",
        customerMobile: user && user.mobile ? user.mobile : "",
        note: req.body && req.body.note ? req.body.note : "",
        refundAmount: req.body && req.body.refundAmount !== undefined ? req.body.refundAmount : order.total,
        currency: "INR"
      });

      if (!result.ok) {
        throw createHttpError(result.status || 400, result.message || "Unable to submit after-sales request.");
      }

      writeDb(currentDb);
      return {
        status: result.status || 201,
        body: {
          message: "Your after-sales request has been submitted.",
          caseItem: buildAfterSalesCaseView(result.caseItem),
          order: withOrderAfterSales(currentDb, order)
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to submit after-sales request."
    });
  }
});

router.patch("/:id/cancel", requireAuth, piiEncryption, async (req, res) => {
  const db = readDb();
  const order = db.orders.find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (order.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (order.status === "delivered") {
    return res.status(400).json({ message: "Delivered orders cannot be cancelled" });
  }
  if (order.status === "cancelled") {
    return res.json({
      message: "Order is already cancelled.",
      ...withNormalizedOrderStatusHistory(order),
      notification: { skipped: true, reason: "already-cancelled" }
    });
  }

  let refundGatewayResult = null;
  const latestPayment = isSqliteOrderPaymentQueriesEnabled()
    ? getSqliteLatestPaymentForOrder(order.id)
    : getLatestPaymentForOrder(db, order.id);
  if (latestPayment && latestPayment.provider === "razorpay" && latestPayment.status === "captured" && !isRazorpayEnabled()) {
    return res.status(503).json({ message: "Razorpay refund is not configured on this backend." });
  }
  if (latestPayment && latestPayment.provider === "razorpay" && latestPayment.status === "captured" && isRazorpayEnabled()) {
    const gatewayPaymentId = String(latestPayment && latestPayment.metadata && latestPayment.metadata.gatewayPaymentId ? latestPayment.metadata.gatewayPaymentId : "").trim();
    if (!gatewayPaymentId) {
      return res.status(409).json({ message: "Gateway payment reference missing for refund." });
    }
    try {
      const gatewayRefund = await createRazorpayRefund(gatewayPaymentId, {
        amount: latestPayment.amountCaptured || latestPayment.amount,
        notes: {
          internalOrderId: String(order.id || "").slice(0, 40),
          internalPaymentId: String(latestPayment.id || "").slice(0, 40)
        }
      });
      refundGatewayResult = mapRazorpayRefundEntity(gatewayRefund);
    } catch (error) {
      return res.status(error.status || 502).json({
        message: error.message || "Unable to initiate payment refund for this cancellation."
      });
    }
  }

  try {
    const committed = await withWriteLock(async () => {
      const currentDb = readDb();
      const currentOrder = currentDb.orders.find((item) => item.id === req.params.id);
      if (!currentOrder) {
        throw createHttpError(404, "Order not found");
      }
      if (currentOrder.userId !== req.user.id && req.user.role !== "admin") {
        throw createHttpError(403, "Forbidden");
      }
      if (currentOrder.status === "delivered") {
        throw createHttpError(400, "Delivered orders cannot be cancelled");
      }
      if (currentOrder.status === "cancelled") {
        return {
          status: 200,
          body: {
            message: "Order is already cancelled.",
            ...withOrderAfterSales(currentDb, currentOrder),
            notification: { skipped: true, reason: "already-cancelled" }
          }
        };
      }

      const currentLatestPayment = getLatestPaymentForOrder(currentDb, currentOrder.id);
      if (
        currentLatestPayment
        && currentLatestPayment.provider === "razorpay"
        && currentLatestPayment.status === "captured"
        && !refundGatewayResult
      ) {
        throw createHttpError(409, "Payment state changed during cancellation. Retry the cancellation request.");
      }

      currentOrder.status = "cancelled";
      const cancelledAt = new Date().toISOString();
      currentOrder.statusHistory = appendOrderStatusEvent(currentOrder, "cancelled", cancelledAt);
      releaseInventoryForOrder(currentDb, currentOrder, {
        reason: "customer-cancel",
        at: cancelledAt
      });
      const paymentUpdate = cancelOrderPayments(currentDb, currentOrder, {
        at: cancelledAt,
        refundGatewayResult
      });
      const notification = await dispatchOrderStatusNotification(currentDb, currentOrder, {
        eventKey: "cancelled",
        triggeredBy: "order-cancel",
        triggeredFrom: "customer"
      });
      persistOrderRouteMutation(currentDb, [
        "orders",
        "payments",
        "products",
        "orderNotifications",
        "users",
        "giftCards",
        "giftCardRedemptions",
        "paymentSourceReservations"
      ]);
      return {
        status: 200,
        body: {
          ...withOrderAfterSales(currentDb, currentOrder),
          notification,
          paymentUpdate
        }
      };
    });

    return res.status(committed.status).json(committed.body);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Unable to cancel order."
    });
  }
});

module.exports = router;
