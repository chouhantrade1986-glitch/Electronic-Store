(function () {
  "use strict";

  const AUTH_STORAGE_KEY = "electromart_auth_v1";
  const CART_STORAGE_KEY = "electromart_cart_v1";
  const API_BASE_URL = String(
    window.__ELECTROMART_CONFIG__ && window.__ELECTROMART_CONFIG__.apiBaseUrl || "/api"
  ).replace(/\/+$/, "");
  const FALLBACK_PURCHASE_DATES = ["2026-05-18T10:30:00.000Z", "2026-04-22T08:15:00.000Z", "2026-03-11T12:00:00.000Z", "2026-02-08T09:00:00.000Z", "2026-01-16T14:00:00.000Z", "2025-12-19T11:00:00.000Z"];

  function readSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function readCatalog(catalogSource) {
    const source = catalogSource || window.EM_CATALOG_MAP || window.EM_CATALOG || {};
    if (Array.isArray(source)) {
      return new Map(source.filter((item) => item && item.id != null).map((item) => [String(item.id), item]));
    }
    return new Map(Object.entries(source || {}).map(([id, item]) => [String(id), item]));
  }

  function normalizeCategory(value) {
    const category = String(value || "other").trim().toLowerCase();
    if (/laptop|notebook/.test(category)) return "laptop";
    if (/computer|desktop|pc/.test(category)) return "computer";
    if (/mobile|phone|tablet/.test(category)) return "mobile";
    if (/audio|headphone|speaker/.test(category)) return "audio";
    if (/printer/.test(category)) return "printer";
    if (/accessor|cable|charger|peripheral/.test(category)) return "accessories";
    return category;
  }

  function isEligibleOrder(order) {
    const status = String(order && order.status || "").trim().toLowerCase();
    const paymentStatus = String(order && order.paymentStatus || "").trim().toLowerCase();
    const paymentMethod = String(order && order.paymentMethod || "").trim().toLowerCase();
    if (["cancelled", "canceled", "refunded", "return_initiated"].includes(status)) return false;
    if (["failed", "cancelled", "canceled", "refunded", "void"].includes(paymentStatus)) return false;
    if (["pending", "created", "authorized"].includes(paymentStatus) && !["cod", "cash_on_delivery", "cash on delivery"].includes(paymentMethod)) {
      return false;
    }
    return true;
  }

  function aggregatePurchaseHistory(orders, catalogSource) {
    const catalog = readCatalog(catalogSource);
    const products = new Map();
    (Array.isArray(orders) ? orders : []).filter(isEligibleOrder).forEach((order) => {
      const orderId = String(order.id || order.orderId || "");
      const purchasedAt = String(order.createdAt || order.orderedAt || "");
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const productId = String(item.productId || item.id || "").trim();
        if (!productId) return;
        const catalogItem = catalog.get(productId) || {};
        const title = String(catalogItem.name || item.title || item.name || order.product || "ElectroMart Product");
        const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity || item.qty || 1) || 1)));
        const purchasePrice = Number(item.unitPrice ?? item.price ?? catalogItem.price ?? 0);
        const existing = products.get(productId) || {
          productId,
          title,
          image: String(catalogItem.image || item.image || ""),
          brand: String(catalogItem.brand || item.brand || ""),
          category: normalizeCategory(catalogItem.category || item.category),
          categoryLabel: String(catalogItem.category || item.category || "Other"),
          currentPrice: Number(catalogItem.price || item.price || 0),
          purchaseCount: 0,
          orderIds: new Set(),
          latestAt: "",
          lastPurchasePrice: 0
        };
        existing.purchaseCount += quantity;
        existing.orderIds.add(orderId || `${purchasedAt}-${productId}`);
        if (!existing.latestAt || new Date(purchasedAt).getTime() >= new Date(existing.latestAt).getTime()) {
          existing.latestAt = purchasedAt;
          existing.lastPurchasePrice = purchasePrice;
        }
        products.set(productId, existing);
      });
    });

    return Array.from(products.values()).map((purchase) => {
      const currentPrice = Number(purchase.currentPrice || 0);
      return {
        ...purchase,
        orderCount: purchase.orderIds.size,
        orderIds: undefined,
        currentPrice,
        priceDropped: currentPrice > 0 && purchase.lastPurchasePrice > currentPrice,
        lastOrderedAt: purchase.latestAt
      };
    }).sort((left, right) => new Date(right.lastOrderedAt || 0).getTime() - new Date(left.lastOrderedAt || 0).getTime());
  }

  function filterPurchases(purchases, options) {
    const settings = options || {};
    const query = String(settings.query || "").trim().toLowerCase();
    const category = String(settings.category || "all").toLowerCase();
    const time = String(settings.time || "all");
    const now = settings.now instanceof Date ? settings.now : new Date();
    const cutoffDays = time === "last_30_days" ? 30 : time === "past_3_months" ? 90 : 0;
    return (Array.isArray(purchases) ? purchases : []).filter((purchase) => {
      const searchText = `${purchase.title || ""} ${purchase.brand || ""} ${purchase.categoryLabel || ""}`.toLowerCase();
      if (query && !searchText.includes(query)) return false;
      if (category !== "all" && purchase.category !== category) return false;
      if (time === "2026" && new Date(purchase.lastOrderedAt).getFullYear() !== 2026) return false;
      if (cutoffDays) {
        const purchasedAt = new Date(purchase.lastOrderedAt).getTime();
        if (!Number.isFinite(purchasedAt) || purchasedAt < now.getTime() - cutoffDays * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  }

  function addPurchaseToCart(storage, productId, quantity) {
    const id = String(productId || "").trim();
    const amount = Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)));
    const catalog = readCatalog();
    if (!id || !catalog.has(id)) return false;
    try {
      const currentStorage = storage || localStorage;
      const raw = currentStorage.getItem(CART_STORAGE_KEY);
      const cart = raw ? JSON.parse(raw) : {};
      if (!cart || Array.isArray(cart) || typeof cart !== "object") return false;
      cart[id] = Math.max(0, Number(cart[id]) || 0) + amount;
      currentStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      if (storage == null) {
        const count = Object.values(cart).reduce((total, value) => total + Math.max(0, Number(value) || 0), 0);
        const countElement = document.getElementById("cartCount");
        if (countElement) countElement.textContent = String(count);
        window.dispatchEvent(new CustomEvent("electromart:cartUpdated", { detail: { cart, count } }));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function getDemoPurchases() {
    const catalog = readCatalog();
    const preferredIds = ["1", "2", "3", "4", "5", "6", "7", "8", "201", "202", "301", "401"];
    const candidates = preferredIds.map((id) => catalog.get(id)).filter(Boolean);
    const fallback = candidates.length ? candidates : Array.from(catalog.values()).slice(0, 12);
    return fallback.slice(0, 12).map((product, index) => ({
      productId: String(product.id),
      title: String(product.name || "ElectroMart Product"),
      image: String(product.image || ""),
      brand: String(product.brand || ""),
      category: normalizeCategory(product.category),
      categoryLabel: String(product.category || "Electronics"),
      currentPrice: Number(product.price || 0),
      lastPurchasePrice: Math.round(Number(product.price || 0) * (1 + ((index % 4) + 1) * 0.04)),
      purchaseCount: (index % 3) + 1,
      orderCount: (index % 3) + 1,
      lastOrderedAt: FALLBACK_PURCHASE_DATES[index % FALLBACK_PURCHASE_DATES.length],
      priceDropped: index % 2 === 0,
      sample: true
    }));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
  }

  function translate(key, values) {
    const lang = String(localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dictionary = window.EM_TRANSLATIONS && (window.EM_TRANSLATIONS[lang] || window.EM_TRANSLATIONS.en) || {};
    return String(dictionary[key] || window.EM_TRANSLATIONS?.en?.[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(values && values[name] != null ? values[name] : ""));
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function renderPurchases(purchases) {
    const grid = document.getElementById("buyAgainGrid");
    const emptyState = document.getElementById("buyAgainEmptyState");
    const meta = document.getElementById("buyAgainMeta");
    if (!grid) return;
    if (!purchases.length) {
      grid.innerHTML = "";
      if (emptyState) emptyState.hidden = false;
      if (meta) meta.textContent = translate("buy_again_results", { count: 0 });
      return;
    }
    if (emptyState) emptyState.hidden = true;
    if (meta) meta.textContent = translate("buy_again_results", { count: purchases.length });
    grid.innerHTML = purchases.map((purchase) => {
      const image = purchase.image || "images/product-placeholder.svg";
      const priceDrop = purchase.priceDropped
        ? `<span class="buy-again-price-drop">${escapeHtml(translate("buy_again_price_dropped"))}</span>`
        : "";
      return `<article class="buy-again-card" data-product-id="${escapeHtml(purchase.productId)}">
        <a class="buy-again-card-image" href="product-detail.html?id=${encodeURIComponent(purchase.productId)}"><img src="${escapeHtml(image)}" alt="${escapeHtml(purchase.title)}" loading="lazy" /></a>
        <div class="buy-again-card-body">
          <span class="buy-again-category">${escapeHtml(purchase.categoryLabel)}</span>
          <h2><a href="product-detail.html?id=${encodeURIComponent(purchase.productId)}">${escapeHtml(purchase.title)}</a></h2>
          <div class="buy-again-badges"><span>${escapeHtml(translate("buy_again_purchased_times", { count: purchase.purchaseCount }))}</span><span>${escapeHtml(translate("buy_again_last_ordered", { date: formatDate(purchase.lastOrderedAt) }))}</span>${priceDrop}</div>
          <div class="buy-again-price">${formatMoney(purchase.currentPrice)}</div>
          <label class="buy-again-quantity"><span>${escapeHtml(translate("buy_again_quantity"))}</span>
            <select data-purchase-quantity aria-label="${escapeHtml(translate("buy_again_quantity_for", { name: purchase.title }))}">${[1, 2, 3, 4, 5].map((qty) => `<option value="${qty}">${qty}</option>`).join("")}</select>
          </label>
          <div class="buy-again-actions">
            <button type="button" class="buy-again-add-btn" data-action="add" data-i18n="buy_again_add_to_cart">${escapeHtml(translate("buy_again_add_to_cart"))}</button>
            <button type="button" class="buy-again-now-btn" data-action="buy-now" data-i18n="buy_again_buy_now">${escapeHtml(translate("buy_again_buy_now"))}</button>
          </div>
        </div>
      </article>`;
    }).join("");
  }

  function init() {
    const grid = document.getElementById("buyAgainGrid");
    const search = document.getElementById("buyAgainSearch");
    const timeFilters = document.getElementById("buyAgainTimeFilters");
    const categoryFilters = document.getElementById("buyAgainCategoryFilters");
    const guestNotice = document.getElementById("buyAgainGuestNotice");
    if (!grid) return;

    let purchases = [];
    let selectedTime = "all";
    let selectedCategory = "all";
    let searchQuery = "";
    const applyFilters = () => renderPurchases(filterPurchases(purchases, { time: selectedTime, category: selectedCategory, query: searchQuery }));
    const useFallback = () => {
      purchases = getDemoPurchases();
      if (guestNotice) {
        const messageKey = session && session.token ? "buy_again_history_fallback" : "buy_again_guest_notice";
        guestNotice.setAttribute("data-i18n", messageKey);
        guestNotice.textContent = translate(messageKey);
        guestNotice.hidden = false;
      }
      applyFilters();
    };

    const session = readSession();
    if (!session || !session.token) {
      useFallback();
    } else {
      if (guestNotice) guestNotice.hidden = true;
      fetch(`${API_BASE_URL}/orders/my`, { headers: { Authorization: `Bearer ${session.token}` } })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error("Order history unavailable")))
        .then((payload) => {
          purchases = aggregatePurchaseHistory(payload && payload.orders, window.EM_CATALOG_MAP || window.EM_CATALOG);
          if (!purchases.length) {
            useFallback();
            return;
          }
          applyFilters();
        })
        .catch(useFallback);
    }

    if (search) search.addEventListener("input", () => { searchQuery = search.value; applyFilters(); });
    if (timeFilters) timeFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-time]");
      if (!button) return;
      timeFilters.querySelectorAll("[data-time]").forEach((item) => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
      selectedTime = button.dataset.time || "all";
      applyFilters();
    });
    if (categoryFilters) categoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      categoryFilters.querySelectorAll("[data-category]").forEach((item) => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
      selectedCategory = button.dataset.category || "all";
      applyFilters();
    });
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const card = button.closest("[data-product-id]");
      if (!card) return;
      const productId = card.dataset.productId;
      const qty = Number(card.querySelector("[data-purchase-quantity]")?.value || 1);
      if (!addPurchaseToCart(null, productId, qty)) return;
      button.textContent = translate("buy_again_added");
      if (button.dataset.action === "buy-now") {
        window.location.href = "checkout.html";
        return;
      }
      window.setTimeout(() => { if (button.isConnected) button.textContent = translate("buy_again_add_to_cart"); }, 1800);
    });
  }

  const target = typeof window !== "undefined" ? window : globalThis;
  target.ElectroMartBuyAgain = { aggregatePurchaseHistory, filterPurchases, addPurchaseToCart, getDemoPurchases, init };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})();
