(function () {
  "use strict";

  const SETUP_STORAGE_KEY = "electromart_smarthome_setup_v1";
  const PREFERENCES_STORAGE_KEY = "electromart_smarthome_preferences_v1";
  const ROUTINES_STORAGE_KEY = "electromart_smarthome_routines_v1";
  const CART_STORAGE_KEY = "electromart_cart_v1";
  const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
  const MAX_SETUP_ITEMS = 8;
  const SUPPORTED_ECOSYSTEMS = ["alexa", "google", "matter", "homekit"];
  const ROOM_LABEL_KEYS = {
    living: "smarthome_room_living",
    bedroom: "smarthome_room_bedroom",
    kitchen: "smarthome_room_kitchen",
    office: "smarthome_room_office"
  };
  const ROUTINES = [
    { id: "arrive", titleKey: "smarthome_routine_arrive", descKey: "smarthome_routine_arrive_desc", goal: "comfort", roles: ["light", "speaker", "plug"] },
    { id: "night", titleKey: "smarthome_routine_night", descKey: "smarthome_routine_night_desc", goal: "comfort", roles: ["light", "security"] },
    { id: "energy", titleKey: "smarthome_routine_energy", descKey: "smarthome_routine_energy_desc", goal: "energy", roles: ["plug", "climate", "light"] },
    { id: "movie", titleKey: "smarthome_routine_movie", descKey: "smarthome_routine_movie_desc", goal: "entertainment", roles: ["speaker", "tv", "light"] }
  ];
  const FALLBACK_CATALOG = [
    { id: "4", name: "4K Smart Television", brand: "Nimbus", category: "smart-home", price: 699, listPrice: 799, rating: 4.7, stock: 10, image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80", keywords: ["smart tv", "wifi", "matter"], ecosystems: ["google", "alexa", "matter"] },
    { id: "8", name: "EchoSphere Smart Speaker", brand: "EchoSphere", category: "smart-home", price: 89, listPrice: 109, rating: 4.1, stock: 18, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80", keywords: ["speaker", "smart home", "wifi"], ecosystems: ["alexa", "google"] },
    { id: "2", name: "Nimbus Home Hub", brand: "Nimbus", category: "smart-home", price: 749, listPrice: 799, rating: 4.5, stock: 12, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80", keywords: ["hub", "iot", "matter"], ecosystems: ["google", "matter", "homekit"] }
  ];

  const state = { room: "living", ecosystem: "all", goal: "comfort", budget: 25000, query: "", products: [], selected: [], activeRoutine: "" };
  const $ = (id) => document.getElementById(id);
  const text = (key, fallback) => {
    const lang = String(localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dictionaries = window.EM_TRANSLATIONS || {};
    return (dictionaries[lang] && dictionaries[lang][key]) || (dictionaries.en && dictionaries.en[key]) || fallback || key;
  };
  const clean = (value) => String(value == null ? "" : value).trim();
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(number(value));
  const signal = (product) => [product.name, product.title, product.category, product.collections, product.keywords, product.description, product.brand].flat(Infinity).join(" ").toLowerCase();
  const escapeHtml = (value) => clean(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");

  function loadJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (error) { return fallback; }
  }
  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* local storage can be unavailable */ }
  }
  function readCatalog() {
    const local = Object.values(loadJson(CATALOG_STORAGE_KEY, {}));
    const global = Array.isArray(window.EM_CATALOG) ? window.EM_CATALOG : [];
    const merged = new Map();
    [...global, ...local, ...FALLBACK_CATALOG].forEach((item) => {
      if (!item || !item.id || merged.has(String(item.id))) return;
      merged.set(String(item.id), { ...item, id: String(item.id), price: number(item.price), listPrice: number(item.listPrice, number(item.price)), stock: number(item.stock, 1), keywords: Array.isArray(item.keywords) ? item.keywords : [] });
    });
    return Array.from(merged.values()).filter((item) => String(item.status || "active").toLowerCase() !== "deleted");
  }
  function isSmartHomeEligible(product) {
    const value = signal(product);
    return /\b(smart|iot|wi[- ]?fi|matter|homekit|alexa|google home|camera|bulb|light|plug|speaker|thermostat|security|doorbell|robot vacuum|smart tv|hub)\b/i.test(value);
  }
  function ecosystemList(product) {
    const explicit = Array.isArray(product.ecosystems) ? product.ecosystems.map((item) => clean(item).toLowerCase()) : [];
    const value = signal(product);
    const inferred = [];
    if (/alexa|echo/.test(value)) inferred.push("alexa");
    if (/google|nest|android/.test(value)) inferred.push("google");
    if (/matter/.test(value)) inferred.push("matter");
    if (/homekit|apple home/.test(value)) inferred.push("homekit");
    return [...new Set([...explicit, ...inferred].filter((item) => SUPPORTED_ECOSYSTEMS.includes(item)))];
  }
  function roleOf(product) {
    const value = signal(product);
    if (/camera|security|doorbell/.test(value)) return "security";
    if (/bulb|light|lamp/.test(value)) return "light";
    if (/plug|socket|switch/.test(value)) return "plug";
    if (/speaker|soundbar|audio/.test(value)) return "speaker";
    if (/tv|television|display/.test(value)) return "tv";
    if (/thermostat|fan|air conditioner|climate/.test(value)) return "climate";
    return "hub";
  }
  function scoreProduct(product, options = {}) {
    const value = signal(product);
    let score = number(product.rating) * 3;
    if (number(product.stock, 0) > 0) score += 4;
    if (options.ecosystem !== "all" && ecosystemList(product).includes(options.ecosystem)) score += 10;
    if (options.room === "office" && /office|work|desk|camera|speaker|wifi/.test(value)) score += 5;
    if (options.room === "bedroom" && /light|speaker|security|camera/.test(value)) score += 5;
    if (options.room === "kitchen" && /plug|camera|display|speaker/.test(value)) score += 5;
    if (options.room === "living" && /tv|speaker|light|hub/.test(value)) score += 5;
    if (options.goal === "security" && /security|camera|doorbell/.test(value)) score += 9;
    if (options.goal === "energy" && /plug|light|thermostat|climate/.test(value)) score += 9;
    if (options.goal === "entertainment" && /tv|speaker|audio|display/.test(value)) score += 9;
    if (options.goal === "office" && /camera|speaker|wifi|hub/.test(value)) score += 9;
    if (options.budget > 0 && number(product.price) <= options.budget) score += 3;
    return score;
  }
  function getSmartHomeRecommendations(options = {}) {
    const candidates = readCatalog().filter(isSmartHomeEligible);
    const source = candidates.length ? candidates : readCatalog();
    return source.map((product) => ({ product, score: scoreProduct(product, { ...state, ...options }) }))
      .sort((a, b) => b.score - a.score || number(a.product.price) - number(b.product.price))
      .map((entry) => entry.product)
      .filter((product) => number(product.stock, 1) > 0)
      .slice(0, Number(options.limit || 12));
  }
  function calculateSmartHomeCompatibility(products, ecosystem) {
    const selected = Array.isArray(products) ? products.filter(Boolean) : [];
    const normalized = clean(ecosystem).toLowerCase();
    const compatible = selected.filter((product) => ecosystemList(product).includes(normalized));
    const unsupported = selected.filter((product) => !ecosystemList(product).includes(normalized));
    return { ecosystem: normalized, compatible, unsupported, compatibleCount: compatible.length, unsupportedCount: unsupported.length, compatibleAll: selected.length > 0 && unsupported.length === 0 };
  }
  function calculateEnergyEstimate(products, usageHours = 4, days = 30) {
    const selected = Array.isArray(products) ? products : [];
    const watts = selected.reduce((sum, product) => sum + number(product.wattage || product.powerWatts || product.power, 8), 0);
    const kwh = (watts * Math.max(0, number(usageHours, 4)) * Math.max(0, number(days, 30))) / 1000;
    return { watts, kwh: Math.round(kwh * 10) / 10, available: selected.length > 0 };
  }
  function saveSetup() {
    saveJson(SETUP_STORAGE_KEY, { room: state.room, ecosystem: state.ecosystem, goal: state.goal, budget: state.budget, selectedProductIds: state.selected.map((item) => String(item.id)).slice(0, MAX_SETUP_ITEMS), activeRoutine: state.activeRoutine, updatedAt: new Date().toISOString() });
  }
  function loadSetup() {
    const saved = loadJson(SETUP_STORAGE_KEY, {});
    state.room = ROOM_LABEL_KEYS[saved.room] ? saved.room : state.room;
    state.ecosystem = ["all", ...SUPPORTED_ECOSYSTEMS].includes(saved.ecosystem) ? saved.ecosystem : state.ecosystem;
    state.goal = clean(saved.goal) || state.goal;
    state.budget = Math.max(1000, number(saved.budget, state.budget));
    state.activeRoutine = clean(saved.activeRoutine);
    const ids = Array.isArray(saved.selectedProductIds) ? saved.selectedProductIds.map(String) : [];
    state.selected = state.products.filter((product) => ids.includes(String(product.id))).slice(0, MAX_SETUP_ITEMS);
  }
  function addToCart(product, quantity = 1) {
    const cart = loadJson(CART_STORAGE_KEY, {});
    const key = String(product.id);
    cart[key] = number(cart[key]) + Math.max(1, Math.floor(number(quantity, 1)));
    saveJson(CART_STORAGE_KEY, cart);
    const catalog = loadJson(CATALOG_STORAGE_KEY, {});
    catalog[key] = { ...(catalog[key] || {}), ...product, id: key, smartHomeSetup: true };
    saveJson(CATALOG_STORAGE_KEY, catalog);
    if (typeof window.syncHeaderCartCount === "function") window.syncHeaderCartCount();
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }
  function addSetupToCart() {
    state.selected.forEach((product) => addToCart(product));
    saveSetup();
    const button = $("smartHomeAddSetupBtn");
    if (button) {
      button.textContent = text("smarthome_setup_added", "Setup added to cart");
      window.setTimeout(() => { button.textContent = text("smarthome_add_setup", "Add setup to cart"); }, 1600);
    }
  }
  function productMatches(product) {
    const query = state.query.toLowerCase();
    const value = signal(product);
    const ecosystemMatch = state.ecosystem === "all" || ecosystemList(product).includes(state.ecosystem);
    const queryMatch = !query || value.includes(query);
    return ecosystemMatch && queryMatch && number(product.price) <= state.budget * 2;
  }
  function renderProducts() {
    const grid = $("smartHomeProductGrid");
    const empty = $("smartHomeEmptyState");
    if (!grid) return;
    const items = getSmartHomeRecommendations({ room: state.room, goal: state.goal, ecosystem: state.ecosystem, budget: state.budget, limit: 24 }).filter(productMatches);
    state.products = items.length ? items : state.products;
    grid.innerHTML = items.map((product) => {
      const selected = state.selected.some((item) => String(item.id) === String(product.id));
      const ecosystems = ecosystemList(product).map((item) => text(`smarthome_ecosystem_${item}`, item)).join(", ") || text("smarthome_ecosystem_flexible", "Flexible setup");
      return `<article class="smart-home-product-card"><img src="${escapeHtml(product.image || "product-placeholder.svg")}" alt="${escapeHtml(product.name)}" loading="lazy" /><div><p>${escapeHtml(product.brand || "ElectroMart")}</p><h3>${escapeHtml(product.name)}</h3></div><span class="smart-card-price">${money(product.price)}</span><p>${escapeHtml(ecosystems)} · ${escapeHtml(text("smarthome_role_" + roleOf(product), "Smart device"))}</p><div class="smart-home-card-actions"><button type="button" data-smart-add="${escapeHtml(product.id)}">${selected ? text("smarthome_selected", "Selected") : text("smarthome_select", "Select")}</button><button type="button" data-smart-check="${escapeHtml(product.id)}">${text("smarthome_check_card", "Check fit")}</button><a href="product-detail.html?id=${encodeURIComponent(product.id)}">${text("smarthome_view_product", "View")}</a></div></article>`;
    }).join("");
    if (empty) empty.hidden = items.length > 0;
    const meta = $("smartHomeResultsMeta");
    if (meta) meta.textContent = `${items.length} ${text("smarthome_results", "devices matched")}`;
    grid.querySelectorAll("[data-smart-add]").forEach((button) => button.addEventListener("click", () => toggleSelected(button.dataset.smartAdd)));
    grid.querySelectorAll("[data-smart-check]").forEach((button) => button.addEventListener("click", () => openCompatibility(button.dataset.smartCheck)));
  }
  function toggleSelected(id) {
    const product = readCatalog().find((item) => String(item.id) === String(id)) || state.products.find((item) => String(item.id) === String(id));
    if (!product) return;
    const index = state.selected.findIndex((item) => String(item.id) === String(id));
    if (index >= 0) state.selected.splice(index, 1);
    else if (state.selected.length < MAX_SETUP_ITEMS) state.selected.push(product);
    saveSetup(); renderProducts(); renderSummary(); renderStatus();
  }
  function renderSummary() {
    const total = state.selected.reduce((sum, product) => sum + number(product.price), 0);
    const saving = state.selected.reduce((sum, product) => sum + Math.max(0, number(product.listPrice) - number(product.price)), 0);
    const totalEl = $("smartHomeBundleTotal"); if (totalEl) totalEl.textContent = money(total);
    const savingsEl = $("smartHomeBundleSavings"); if (savingsEl) savingsEl.textContent = saving ? `${text("smarthome_save_label", "Save")} ${money(saving)}` : "";
    const meta = $("smartHomeBundleMeta"); if (meta) meta.textContent = `${state.selected.length} ${text("smarthome_selected_devices", "devices selected")}`;
  }
  function renderStatus() {
    const status = $("smartHomeCompatibilityStatus");
    if (!status) return;
    const result = state.ecosystem === "all" ? null : calculateSmartHomeCompatibility(state.selected, state.ecosystem);
    const energy = calculateEnergyEstimate(state.selected);
    status.textContent = result ? `${result.compatibleCount}/${state.selected.length} ${text(result.compatibleAll ? "smarthome_compatibility_compatible" : "smarthome_compatibility_incompatible", result.compatibleAll ? "selected devices fit this ecosystem" : "Review ecosystem compatibility")} · ${energy.kwh} kWh ${text("smarthome_energy_estimate", "estimated monthly usage")}` : `${energy.kwh} kWh ${text("smarthome_energy_estimate", "estimated monthly usage")}`;
  }
  function renderRoutines() {
    const grid = $("smartHomeRoutineGrid"); if (!grid) return;
    grid.innerHTML = ROUTINES.map((routine) => `<article class="smart-home-routine-card"><h3>${escapeHtml(text(routine.titleKey, routine.id))}</h3><p>${escapeHtml(text(routine.descKey, "Preview a simple device routine."))}</p><button type="button" data-smart-routine="${routine.id}">${state.activeRoutine === routine.id ? text("smarthome_routine_applied", "Applied") : text("smarthome_apply_routine", "Preview routine")}</button></article>`).join("");
    grid.querySelectorAll("[data-smart-routine]").forEach((button) => button.addEventListener("click", () => { state.activeRoutine = button.dataset.smartRoutine; saveSetup(); renderRoutines(); }));
  }
  function openCompatibility(id) {
    const product = readCatalog().find((item) => String(item.id) === String(id));
    const modal = $("smartHomeSetupModal"); if (!product || !modal) return;
    modal.dataset.productId = String(product.id);
    modal.showModal ? modal.showModal() : (modal.hidden = false);
    checkCompatibility(product);
  }
  function checkCompatibility(product) {
    const ecosystem = $("smartHomeEcosystemSelect")?.value || "google";
    const result = calculateSmartHomeCompatibility([product], ecosystem);
    const target = $("smartHomeCompatibilityResult"); if (!target) return;
    target.textContent = result.compatibleAll ? `${text("smarthome_compatibility_compatible", "Compatible with")} ${text(`smarthome_ecosystem_${ecosystem}`, ecosystem)}.` : `${text("smarthome_compatibility_incompatible", "This device needs a different ecosystem")} ${text(`smarthome_ecosystem_${ecosystem}`, ecosystem)}.`;
  }
  function bindControls() {
    document.querySelectorAll("[data-smart-room]").forEach((button) => button.addEventListener("click", () => { state.room = button.dataset.smartRoom; document.querySelectorAll("[data-smart-room]").forEach((node) => { node.classList.toggle("active", node === button); node.setAttribute("aria-selected", node === button ? "true" : "false"); }); renderProducts(); renderStatus(); }));
    document.querySelectorAll("[data-smart-ecosystem]").forEach((button) => button.addEventListener("click", () => { state.ecosystem = button.dataset.smartEcosystem; document.querySelectorAll("[data-smart-ecosystem]").forEach((node) => node.classList.toggle("active", node === button)); renderProducts(); renderStatus(); }));
    $("smartHomeSearchInput")?.addEventListener("input", (event) => { state.query = event.target.value; renderProducts(); });
    $("smartHomeGoalSelect")?.addEventListener("change", (event) => { state.goal = event.target.value; renderProducts(); });
    $("smartHomeBudgetInput")?.addEventListener("input", (event) => { state.budget = Math.max(1000, number(event.target.value, 25000)); renderProducts(); });
    $("smartHomeApplyGuideBtn")?.addEventListener("click", () => { saveJson(PREFERENCES_STORAGE_KEY, { room: state.room, goal: state.goal, budget: state.budget }); renderProducts(); });
    $("smartHomeAddSetupBtn")?.addEventListener("click", addSetupToCart);
    $("smartHomeCompatibilityCheckBtn")?.addEventListener("click", () => { const product = readCatalog().find((item) => String(item.id) === String($("smartHomeSetupModal")?.dataset.productId)); if (product) checkCompatibility(product); });
    $("smartHomeEcosystemSelect")?.addEventListener("change", () => { const product = readCatalog().find((item) => String(item.id) === String($("smartHomeSetupModal")?.dataset.productId)); if (product) checkCompatibility(product); });
  }
  function init() {
    state.products = readCatalog();
    loadSetup();
    const count = $("smartHomeDeviceCount"); if (count) count.textContent = String(state.products.filter(isSmartHomeEligible).length || state.products.length);
    bindControls(); renderProducts(); renderRoutines(); renderSummary(); renderStatus();
  }

  window.getSmartHomeRecommendations = getSmartHomeRecommendations;
  window.calculateSmartHomeCompatibility = calculateSmartHomeCompatibility;
  window.calculateEnergyEstimate = calculateEnergyEstimate;
  window.isSmartHomeEligible = isSmartHomeEligible;
  window.smartHomeInit = init;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
}());
