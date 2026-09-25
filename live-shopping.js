(function () {
  "use strict";

  const CART_KEY = "electromart_cart_v1";
  const CHAT_KEY = "electromart_live_chat_v1";
  const SESSION_KEY = "electromart_live_session_v1";
  const MAX_CHAT_MESSAGES = 40;
  let dealIntervalId = null;

  const fallbackProducts = [
    { id: "product_1773480601004", name: "Nimbus StreamCam 4K", price: 6999, image: "product-placeholder.svg", category: "accessory", stock: 31 },
    { id: "product_1773480601003", name: "PulseCast Pro USB Microphone", price: 8999, image: "product-placeholder.svg", category: "audio", stock: 26 },
    { id: "product_1773480601005", name: "VectorDock 12-in-1 Thunderbolt Hub", price: 11999, image: "product-placeholder.svg", category: "accessory", stock: 22 },
    { id: "product_1773480601002", name: "OrbitX ViewPro 32 4K", price: 32999, image: "product-placeholder.svg", category: "computer", stock: 18 }
  ];

  function t(key, fallback) {
    const lang = String(localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    return window.EM_TRANSLATIONS?.[lang]?.[key] || window.EM_TRANSLATIONS?.en?.[key] || fallback || key;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage is optional */ }
  }

  function catalog() {
    const source = Array.isArray(window.EM_CATALOG) && window.EM_CATALOG.length ? window.EM_CATALOG : fallbackProducts;
    return source.filter((item) => item && item.id && Number(item.stock ?? 1) > 0).map((item) => ({
      ...item,
      id: String(item.id),
      name: item.name || item.title || "ElectroMart product",
      price: Number(item.price || 0),
      image: item.image || (Array.isArray(item.images) ? item.images[0] : "") || "product-placeholder.svg"
    }));
  }

  function addProductToCart(productId, quantity = 1) {
    const cart = readJson(CART_KEY, {});
    const key = String(productId);
    cart[key] = Number(cart[key] || 0) + Math.max(1, Number(quantity) || 1);
    writeJson(CART_KEY, cart);
    const count = Object.values(cart).reduce((total, value) => total + Number(value || 0), 0);
    document.querySelectorAll("#cartCount").forEach((element) => { element.textContent = String(count); });
    return cart;
  }

  function renderShelf() {
    const shelf = document.getElementById("liveProductShelf");
    if (!shelf) return;
    const items = catalog().slice(0, 4);
    if (!items.length) {
      shelf.innerHTML = `<p>${escapeHtml(t("live_no_streams", "No live products are available right now."))}</p>`;
      return;
    }
    shelf.innerHTML = items.map((item) => `
      <article class="live-product-card">
        <a href="product-detail.html?id=${encodeURIComponent(item.id)}"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" onerror="this.src='product-placeholder.svg'" /></a>
        <a class="live-product-title" href="product-detail.html?id=${encodeURIComponent(item.id)}">${escapeHtml(item.name)}</a>
        <p class="live-product-price">₹${item.price.toLocaleString("en-IN")}</p>
        <button type="button" data-live-add="${escapeHtml(item.id)}">${escapeHtml(t("live_add_to_cart", "Add to cart"))}</button>
      </article>
    `).join("");
    shelf.querySelectorAll("[data-live-add]").forEach((button) => {
      button.addEventListener("click", () => {
        addProductToCart(button.dataset.liveAdd);
        button.textContent = "✓ Added";
      });
    });
  }

  function renderChat() {
    const log = document.getElementById("liveStreamChat");
    if (!log) return;
    const messages = readJson(CHAT_KEY, [
      { name: "Riya", badge: "Host", text: "Welcome to the creator desk demo! Ask me about compatibility." },
      { name: "Aman", badge: "Verified Buyer", text: "Does the camera work with a laptop over USB?" }
    ]);
    log.innerHTML = messages.slice(-MAX_CHAT_MESSAGES).map((message) => `
      <div class="live-chat-message"><strong>${escapeHtml(message.name)}</strong><span class="chat-badge">${escapeHtml(message.badge)}</span><p>${escapeHtml(message.text)}</p></div>
    `).join("");
    log.scrollTop = log.scrollHeight;
  }

  function startDealTimer() {
    const timer = document.getElementById("liveDealTimer");
    if (!timer) return;
    let remaining = Number(readJson(SESSION_KEY, { remainingSeconds: 900 }).remainingSeconds || 900);
    const tick = () => {
      remaining = Math.max(0, remaining - 1);
      writeJson(SESSION_KEY, { id: "creator-desk-demo", remainingSeconds: remaining, updatedAt: new Date().toISOString() });
      timer.textContent = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
      if (!remaining) window.clearInterval(dealIntervalId);
    };
    tick();
    dealIntervalId = window.setInterval(tick, 1000);
  }

  function bindInteractions() {
    const form = document.getElementById("liveChatForm");
    const input = document.getElementById("liveQuestionInput");
    if (form && input) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        const messages = readJson(CHAT_KEY, []);
        messages.push({ name: "You", badge: "Verified Buyer", text, createdAt: new Date().toISOString() });
        writeJson(CHAT_KEY, messages.slice(-MAX_CHAT_MESSAGES));
        input.value = "";
        renderChat();
      });
    }
    document.getElementById("liveAddAllBtn")?.addEventListener("click", () => {
      catalog().slice(0, 4).forEach((item) => addProductToCart(item.id));
    });
    document.getElementById("copyLiveCouponBtn")?.addEventListener("click", async () => {
      const code = document.getElementById("liveCouponCode")?.textContent || "LIVE1000";
      try { await navigator.clipboard.writeText(code); } catch (error) { /* clipboard permissions are optional */ }
    });
  }

  function init() {
    if (!document.getElementById("liveShoppingHub")) return;
    renderShelf();
    renderChat();
    bindInteractions();
    startDealTimer();
    window.addEventListener("beforeunload", () => {
      if (dealIntervalId) window.clearInterval(dealIntervalId);
    }, { once: true });
  }

  window.ElectroMartLiveShopping = { addProductToCart, renderShelf, renderChat };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
