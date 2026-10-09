function stableStringify(value) {
  if (value === null || value === undefined) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  if (typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

function buildCartFingerprint(cartState = {}) {
  const normalizedRows = (Array.isArray(cartState.rows) ? cartState.rows : []).map((row) => ({
    id: String(row && row.id ? row.id : ""),
    quantity: Number(row && Number.isFinite(Number(row.quantity)) ? Number(row.quantity) : 0),
    price: Number(row && Number.isFinite(Number(row.price)) ? Number(row.price) : 0),
    name: String(row && row.name ? row.name : ""),
    protectionPlan: row && row.protectionPlan ? {
      name: String(row.protectionPlan.name || ""),
      price: Number(row.protectionPlan.price || 0)
    } : null
  })).sort((a, b) => a.id.localeCompare(b.id));

  const normalizedExchangeDetails = (Array.isArray(cartState.exchangeDetails) ? cartState.exchangeDetails : []).map((entry) => ({
    targetProductId: String(entry && entry.targetProductId ? entry.targetProductId : ""),
    discountAmount: Number(entry && Number.isFinite(Number(entry.discountAmount)) ? Number(entry.discountAmount) : 0),
    status: String(entry && entry.status ? entry.status : "")
  })).sort((a, b) => a.targetProductId.localeCompare(b.targetProductId));

  const payload = {
    rows: normalizedRows,
    paymentMethod: String(cartState.paymentMethod || ""),
    couponCode: String(cartState.couponCode || ""),
    exchangeDiscount: Number(Number.isFinite(Number(cartState.exchangeDiscount)) ? Number(cartState.exchangeDiscount) : 0),
    exchangeDetails: normalizedExchangeDetails,
    deliverySlot: cartState.deliverySlot && typeof cartState.deliverySlot === "object" ? {
      id: String(cartState.deliverySlot.id || ""),
      eta: String(cartState.deliverySlot.eta || "")
    } : null,
    orderSource: String(cartState.orderSource || "")
  };

  return stableStringify(payload);
}

module.exports = { buildCartFingerprint };