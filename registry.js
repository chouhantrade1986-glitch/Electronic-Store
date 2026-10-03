/**
 * ElectroMart — Celebrations & Gift Registry Engine (registry.js)
 * Phase 27: Multi-List Registry & Celebrations Suite
 * Pure ElectroMart Branding: 0 Visible Forbidden Brand Text.
 */

(function () {
  "use strict";

  // Storage Keys
  const REGISTRIES_STORAGE_KEY = "electromart_registries_v1";
  const CART_STORAGE_KEY = "electromart_cart_v1";
  const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
  const WISHLIST_STORAGE_KEY = "electromart_wishlist_v1";
  const FALLBACK_IMAGE_URL = "./product-placeholder.svg";

  // Currency Formatter
  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  function money(val) {
    return inrFormatter.format(Number(val || 0));
  }

  // Reliable Fallback Products
  const fallbackProducts = [
    { id: "1", name: "AstraBook Pro 14", brand: "AstraTech", category: "laptop", price: 64999, originalPrice: 79999, discount: 19, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
    { id: "2", name: "Nimbus Phone X", brand: "Nimbus", category: "mobile", price: 42999, originalPrice: 49999, discount: 14, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
    { id: "3", name: "Pulse ANC Headphones", brand: "PulseWave", category: "audio", price: 7999, originalPrice: 12999, discount: 38, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
    { id: "7", name: "Vector Gaming Laptop", brand: "Vector", category: "laptop", price: 89999, originalPrice: 109999, discount: 18, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
    { id: "201", name: "Epson EcoTank L3250 Wi-Fi All-in-One Printer", brand: "Epson", category: "printer", price: 14999, originalPrice: 17999, discount: 17, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80" }
  ];

  // DOM Elements
  const activeRegistryTitle = document.getElementById("activeRegistryTitle");
  const activeRegistryCatBadge = document.getElementById("activeRegistryCatBadge");
  const activeRegistryPrivacyBadge = document.getElementById("activeRegistryPrivacyBadge");
  const regPrivacyText = document.getElementById("regPrivacyText");
  const activeRegistryHostInfo = document.getElementById("activeRegistryHostInfo");
  const activeRegistryDateInfo = document.getElementById("activeRegistryDateInfo");
  const activeRegistryAddressInfo = document.getElementById("activeRegistryAddressInfo");
  const registrySelectDropdown = document.getElementById("registrySelectDropdown");
  const newRegistryTopBtn = document.getElementById("newRegistryTopBtn");
  const registryCountdownTimer = document.getElementById("registryCountdownTimer");
  const countdownEventName = document.getElementById("countdownEventName");
  const statFulfillmentPercent = document.getElementById("statFulfillmentPercent");
  const registryProgressFill = document.getElementById("registryProgressFill");
  const statTotalItems = document.getElementById("statTotalItems");
  const statFulfilledItems = document.getElementById("statFulfilledItems");
  const statRemainingItems = document.getElementById("statRemainingItems");
  const registryShareLinkInput = document.getElementById("registryShareLinkInput");
  const copyRegistryShareBtn = document.getElementById("copyRegistryShareBtn");
  const shareWhatsappBtn = document.getElementById("shareWhatsappBtn");
  const openCatalogModalBtn = document.getElementById("openCatalogModalBtn");
  const registryItemsGrid = document.getElementById("registryItemsGrid");
  const registryItemsFilterSelect = document.getElementById("registryItemsFilterSelect");
  const openCreateRegistryBtn = document.getElementById("openCreateRegistryBtn");
  const createRegistryModal = document.getElementById("createRegistryModal");
  const closeCreateRegModalBtn = document.getElementById("closeCreateRegModalBtn");
  const cancelCreateRegBtn = document.getElementById("cancelCreateRegBtn");
  const createRegistryForm = document.getElementById("createRegistryForm");
  const regCategorySelect = document.getElementById("regCategorySelect");
  const catalogPickerModal = document.getElementById("catalogPickerModal");
  const closeCatalogModalBtn = document.getElementById("closeCatalogModalBtn");
  const catalogSearchInput = document.getElementById("catalogSearchInput");
  const catalogCategoryPills = document.getElementById("catalogCategoryPills");
  const catalogResultsList = document.getElementById("catalogResultsList");
  const amzToast = document.getElementById("amzToast");

  // State Management
  let activeRegistryId = "";
  let countdownInterval = null;
  let currentCatalogCategory = "all";
  let toastTimeout = null;

  // Language & Translation Helper
  function getCurrentLang() {
    return (
      localStorage.getItem("electromart_lang_v1") ||
      localStorage.getItem("electromart_lang") ||
      "en"
    ).toLowerCase();
  }

  function t(key, fallback) {
    const lang = getCurrentLang();
    if (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang] && window.EM_TRANSLATIONS[lang][key]) {
      return window.EM_TRANSLATIONS[lang][key];
    }
    if (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en && window.EM_TRANSLATIONS.en[key]) {
      return window.EM_TRANSLATIONS.en[key];
    }
    return fallback || "";
  }

  // Toast Notification
  function showToast(msg) {
    if (!amzToast) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    amzToast.textContent = msg;
    amzToast.style.display = "block";
    toastTimeout = setTimeout(() => {
      amzToast.style.display = "none";
    }, 3500);
  }

  // Product Catalog Lookup
  function getProductById(id) {
    const strId = String(id || "").trim();
    if (!strId) return null;

    if (window.EM_CATALOG_MAP && window.EM_CATALOG_MAP[strId]) {
      return window.EM_CATALOG_MAP[strId];
    }
    if (Array.isArray(window.EM_CATALOG)) {
      const found = window.EM_CATALOG.find((p) => String(p.id) === strId);
      if (found) return found;
    }
    try {
      const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed[strId]) return parsed[strId];
    } catch {
      /* ignore */
    }
    return fallbackProducts.find((p) => String(p.id) === strId) || null;
  }

  function getAllProducts() {
    if (Array.isArray(window.EM_CATALOG) && window.EM_CATALOG.length > 0) {
      return window.EM_CATALOG;
    }
    if (window.EM_CATALOG_MAP && Object.keys(window.EM_CATALOG_MAP).length > 0) {
      return Object.values(window.EM_CATALOG_MAP);
    }
    return fallbackProducts;
  }

  // Registries Storage & Seed Data
  function getFutureDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split("T")[0];
  }

  function loadRegistries() {
    try {
      const raw = localStorage.getItem(REGISTRIES_STORAGE_KEY);
      let parsed = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        parsed = [
          {
            id: "EM-REG-101",
            title: "Vikram's 25th Tech Birthday & Gaming Setup",
            category: "birthday",
            date: getFutureDate(28),
            host: "Vikram Sharma",
            address: "Bengaluru, Karnataka - 560001",
            privacy: "public",
            items: [
              { productId: "1", priority: "high", wanted: 1, purchased: 1, notes: "AstraBook Pro 14 for developer workspace" },
              { productId: "3", priority: "high", wanted: 1, purchased: 0, notes: "Pulse ANC Headphones for music & noise isolation" },
              { productId: "7", priority: "medium", wanted: 1, purchased: 0, notes: "Vector Gaming Laptop for high-frame rates" },
              { productId: "201", priority: "low", wanted: 1, purchased: 0, notes: "Epson EcoTank Wireless Printer for home office" }
            ]
          },
          {
            id: "EM-REG-102",
            title: "Priya & Rahul Wedding & Smart Home Electronics",
            category: "wedding",
            date: getFutureDate(60),
            host: "Priya Nair & Rahul Verma",
            address: "Mumbai, Maharashtra - 400001",
            privacy: "shareable",
            items: [
              { productId: "2", priority: "high", wanted: 1, purchased: 1, notes: "Nimbus Phone X for mobile photography" },
              { productId: "3", priority: "medium", wanted: 2, purchased: 1, notes: "Pulse ANC Headphones for travel" }
            ]
          }
        ];
        saveRegistries(parsed);
      }
      return parsed;
    } catch {
      return [];
    }
  }

  function saveRegistries(list) {
    try {
      localStorage.setItem(REGISTRIES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }

  function getActiveRegistry() {
    const registries = loadRegistries();
    return registries.find((r) => r.id === activeRegistryId) || registries[0] || null;
  }

  // Countdown Timer Engine (with safe clearInterval to prevent memory leaks)
  function stopCountdownTimer() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  function startCountdownTimer(targetDateStr) {
    stopCountdownTimer();
    if (!registryCountdownTimer) return;

    function update() {
      const now = new Date().getTime();
      const target = new Date(targetDateStr + "T23:59:59").getTime();
      const diff = target - now;

      if (isNaN(diff)) {
        registryCountdownTimer.textContent = "Celebration Date Active";
        return;
      }

      if (diff <= 0) {
        registryCountdownTimer.textContent = t("reg_countdown_today", "Today is the big celebration day! 🎉");
        stopCountdownTimer();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const daysLabel = t("reg_countdown_days_left", "days left until celebration");
      registryCountdownTimer.textContent = `🎉 ${days}d ${hours}h ${mins}m ${secs}s (${daysLabel})`;
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  // Render Dropdown Switcher
  function renderRegistryDropdown(registries, currentId) {
    if (!registrySelectDropdown) return;
    registrySelectDropdown.innerHTML = "";
    registries.forEach((reg) => {
      const opt = document.createElement("option");
      opt.value = reg.id;
      opt.textContent = `${reg.category === "birthday" ? "🎂" : reg.category === "wedding" ? "💍" : "💻"} ${reg.title}`;
      if (reg.id === currentId) {
        opt.selected = true;
      }
      registrySelectDropdown.appendChild(opt);
    });
  }

  // Render Dashboard
  function renderActiveRegistry() {
    const reg = getActiveRegistry();
    if (!reg) return;

    activeRegistryId = reg.id;
    const registries = loadRegistries();
    renderRegistryDropdown(registries, reg.id);

    // Top Header
    if (activeRegistryTitle) activeRegistryTitle.textContent = reg.title;
    if (countdownEventName) countdownEventName.textContent = reg.title;

    if (activeRegistryCatBadge) {
      const icon = reg.category === "birthday" ? "🎂 Birthday" : reg.category === "wedding" ? "💍 Wedding" : "💻 Tech Setup";
      activeRegistryCatBadge.textContent = icon;
    }

    if (activeRegistryPrivacyBadge && regPrivacyText) {
      activeRegistryPrivacyBadge.className = `amz-privacy-badge ${reg.privacy}`;
      const icon = reg.privacy === "public" ? "🔓" : reg.privacy === "shareable" ? "🔗" : "🔒";
      activeRegistryPrivacyBadge.querySelector(".privacy-icon").textContent = icon;
      regPrivacyText.textContent = reg.privacy.charAt(0).toUpperCase() + reg.privacy.slice(1);
    }

    if (activeRegistryHostInfo) activeRegistryHostInfo.textContent = `Host: ${reg.host}`;
    if (activeRegistryDateInfo) activeRegistryDateInfo.textContent = `Event Date: ${reg.date}`;
    if (activeRegistryAddressInfo) activeRegistryAddressInfo.textContent = `Delivery to: ${reg.address}`;

    // Share Link
    if (registryShareLinkInput) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?regId=${reg.id}`;
      registryShareLinkInput.value = shareUrl;
    }

    // Start Live Countdown
    startCountdownTimer(reg.date);

    // Render Stats & Progress
    updateProgressAndStats(reg);

    // Render Items
    renderRegistryItems(reg);
  }

  function updateProgressAndStats(reg) {
    const items = reg.items || [];
    const totalCount = items.length;
    const fulfilledCount = items.filter((item) => Number(item.purchased || 0) >= Number(item.wanted || 1)).length;
    const remainingCount = Math.max(0, totalCount - fulfilledCount);
    const percent = totalCount > 0 ? Math.round((fulfilledCount / totalCount) * 100) : 0;

    if (statTotalItems) statTotalItems.textContent = String(totalCount);
    if (statFulfilledItems) statFulfilledItems.textContent = String(fulfilledCount);
    if (statRemainingItems) statRemainingItems.textContent = String(remainingCount);
    if (statFulfillmentPercent) statFulfillmentPercent.textContent = `${percent}% Fulfilled`;
    if (registryProgressFill) {
      registryProgressFill.style.width = `${percent}%`;
      const track = registryProgressFill.parentElement;
      if (track) track.setAttribute("aria-valuenow", String(percent));
    }
  }

  function renderRegistryItems(reg) {
    if (!registryItemsGrid) return;
    registryItemsGrid.innerHTML = "";

    const filterVal = registryItemsFilterSelect ? registryItemsFilterSelect.value : "all";
    let items = reg.items || [];

    if (filterVal === "unfulfilled") {
      items = items.filter((it) => Number(it.purchased || 0) < Number(it.wanted || 1));
    } else if (filterVal === "fulfilled") {
      items = items.filter((it) => Number(it.purchased || 0) >= Number(it.wanted || 1));
    } else if (filterVal === "high_priority") {
      items = items.filter((it) => it.priority === "high");
    }

    if (items.length === 0) {
      registryItemsGrid.innerHTML = `
        <div style="padding: 36px 20px; text-align: center; color: #565959; background: #f7fafa; border-radius: 8px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🎁</div>
          <h4 style="font-size: 16px; margin: 0 0 6px 0; color: #0f1111;">No items found in this view</h4>
          <p style="font-size: 13px; margin: 0 0 16px 0;">Add electronics from our catalog to build your celebration gift registry.</p>
          <button type="button" class="amz-btn-add-catalog" onclick="document.getElementById('openCatalogModalBtn').click();">+ Add Products from Catalog</button>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const product = getProductById(item.productId);
      if (!product) return;

      const isFulfilled = Number(item.purchased || 0) >= Number(item.wanted || 1);
      const card = document.createElement("article");
      card.className = "amz-reg-item-card";
      card.setAttribute("data-product-id", product.id);

      const priorityClass = item.priority === "high" ? "high" : item.priority === "low" ? "low" : "medium";
      const priorityLabel = item.priority === "high" ? t("wishlist_priority_high", "High") : item.priority === "low" ? t("wishlist_priority_low", "Low") : t("wishlist_priority_medium", "Medium");

      card.innerHTML = `
        <img src="${product.image || FALLBACK_IMAGE_URL}" alt="${product.name}" class="reg-item-thumb" onerror="this.src='${FALLBACK_IMAGE_URL}'" />
        <div class="reg-item-details">
          <a href="product-detail.html?id=${product.id}" class="reg-item-title">${product.name}</a>
          <div class="reg-item-price-stack">
            <span class="reg-item-price">${money(product.price)}</span>
            ${product.originalPrice ? `<span class="reg-item-mrp">${money(product.originalPrice)}</span>` : ""}
            ${product.discount ? `<span class="reg-item-discount">-${product.discount}%</span>` : ""}
          </div>
          <div class="reg-item-meta-row">
            <span><strong>${t("reg_wanted_qty", "Wanted:")}</strong> ${item.wanted || 1}</span>
            <span><strong>${t("reg_purchased_qty", "Purchased:")}</strong> ${item.purchased || 0}</span>
            <span class="priority-pill ${priorityClass}">Priority: ${priorityLabel}</span>
            ${item.notes ? `<span class="reg-item-note">"${item.notes}"</span>` : ""}
          </div>
        </div>
        <div class="reg-item-actions">
          ${
            isFulfilled
              ? `<button type="button" class="btn-gift-item fulfilled" disabled>${t("reg_gifted_badge", "✓ Gifted / Fulfilled")}</button>`
              : `<button type="button" class="btn-gift-item" data-gift-id="${product.id}">${t("reg_btn_gift_item", "Gift This Item")}</button>`
          }
          <button type="button" class="btn-remove-registry-item" data-remove-id="${product.id}">Remove from registry</button>
        </div>
      `;
      registryItemsGrid.appendChild(card);
    });
  }

  // Gifting Action
  function giftItem(productId) {
    const reg = getActiveRegistry();
    if (!reg) return;

    const item = reg.items.find((it) => String(it.productId) === String(productId));
    if (!item) return;

    // Increment purchased count
    item.purchased = Number(item.purchased || 0) + 1;
    const registries = loadRegistries();
    const targetIdx = registries.findIndex((r) => r.id === reg.id);
    if (targetIdx !== -1) {
      registries[targetIdx] = reg;
      saveRegistries(registries);
    }

    // Add to cart with celebration gift tag
    try {
      const rawCart = localStorage.getItem(CART_STORAGE_KEY);
      const cartMap = rawCart ? JSON.parse(rawCart) : {};
      cartMap[String(productId)] = (Number(cartMap[String(productId)] || 0)) + 1;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));

      // Sync header cart count
      const headerCartCount = document.getElementById("cartCount");
      if (headerCartCount) {
        const total = Object.values(cartMap).reduce((a, b) => a + Number(b || 0), 0);
        headerCartCount.textContent = String(total);
      }
    } catch {
      /* ignore */
    }

    renderActiveRegistry();
    showToast(t("reg_gift_success", "Thank you for gifting! Item added to your cart with celebration gift tag."));
  }

  // Remove Item from Registry
  function removeRegistryItem(productId) {
    const reg = getActiveRegistry();
    if (!reg) return;

    reg.items = reg.items.filter((it) => String(it.productId) !== String(productId));
    const registries = loadRegistries();
    const targetIdx = registries.findIndex((r) => r.id === reg.id);
    if (targetIdx !== -1) {
      registries[targetIdx] = reg;
      saveRegistries(registries);
    }

    renderActiveRegistry();
    showToast("Item removed from your registry.");
  }

  // Catalog Picker Modal
  function renderCatalogModalItems(filterCategory, query) {
    if (!catalogResultsList) return;
    catalogResultsList.innerHTML = "";

    let products = getAllProducts();
    const q = (query || "").toLowerCase().trim();

    if (filterCategory && filterCategory !== "all") {
      products = products.filter((p) => String(p.category || "").toLowerCase() === filterCategory.toLowerCase());
    }

    if (q) {
      products = products.filter((p) =>
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.brand || "").toLowerCase().includes(q) ||
        String(p.category || "").toLowerCase().includes(q)
      );
    }

    const reg = getActiveRegistry();
    const existingIds = new Set((reg ? reg.items : []).map((it) => String(it.productId)));

    products.slice(0, 30).forEach((product) => {
      const alreadyIn = existingIds.has(String(product.id));
      const card = document.createElement("div");
      card.className = "catalog-picker-card";
      card.innerHTML = `
        <img src="${product.image || FALLBACK_IMAGE_URL}" alt="${product.name}" class="catalog-picker-thumb" onerror="this.src='${FALLBACK_IMAGE_URL}'" />
        <div class="catalog-picker-info">
          <h4 class="catalog-picker-name" title="${product.name}">${product.name}</h4>
          <p class="catalog-picker-price">${money(product.price)}</p>
        </div>
        <button type="button" class="btn-add-picker-item" data-picker-add="${product.id}" ${alreadyIn ? "disabled" : ""}>
          ${alreadyIn ? "✓ In Registry" : t("reg_btn_add_to_reg", "+ Add to Registry")}
        </button>
      `;
      catalogResultsList.appendChild(card);
    });
  }

  function addItemFromCatalog(productId) {
    const reg = getActiveRegistry();
    if (!reg) return;

    if (!reg.items.some((it) => String(it.productId) === String(productId))) {
      reg.items.push({
        productId: String(productId),
        priority: "medium",
        wanted: 1,
        purchased: 0,
        notes: ""
      });

      const registries = loadRegistries();
      const targetIdx = registries.findIndex((r) => r.id === reg.id);
      if (targetIdx !== -1) {
        registries[targetIdx] = reg;
        saveRegistries(registries);
      }

      renderActiveRegistry();
      renderCatalogModalItems(currentCatalogCategory, catalogSearchInput ? catalogSearchInput.value : "");
      showToast(t("reg_added_success", "Item added to your celebration registry!"));
    }
  }

  // Event Listeners Initialization
  function initListeners() {
    // Switch Registry Dropdown
    if (registrySelectDropdown) {
      registrySelectDropdown.addEventListener("change", (e) => {
        activeRegistryId = e.target.value;
        renderActiveRegistry();
      });
    }

    // New Registry Top Button
    if (newRegistryTopBtn && createRegistryModal) {
      newRegistryTopBtn.addEventListener("click", () => {
        createRegistryModal.showModal();
      });
    }

    // Filter Items Select
    if (registryItemsFilterSelect) {
      registryItemsFilterSelect.addEventListener("change", () => {
        const reg = getActiveRegistry();
        if (reg) renderRegistryItems(reg);
      });
    }

    // Grid Actions: Gift or Remove
    if (registryItemsGrid) {
      registryItemsGrid.addEventListener("click", (e) => {
        const giftBtn = e.target.closest("[data-gift-id]");
        if (giftBtn) {
          const id = giftBtn.getAttribute("data-gift-id");
          giftItem(id);
          return;
        }

        const removeBtn = e.target.closest("[data-remove-id]");
        if (removeBtn) {
          const id = removeBtn.getAttribute("data-remove-id");
          removeRegistryItem(id);
          return;
        }
      });
    }

    // Copy Share Link
    if (copyRegistryShareBtn && registryShareLinkInput) {
      copyRegistryShareBtn.addEventListener("click", () => {
        registryShareLinkInput.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(registryShareLinkInput.value).then(() => {
            showToast(t("reg_link_copied", "Registry share link copied to clipboard!"));
          }).catch(() => {
            document.execCommand("copy");
            showToast(t("reg_link_copied", "Registry share link copied to clipboard!"));
          });
        } else {
          document.execCommand("copy");
          showToast(t("reg_link_copied", "Registry share link copied to clipboard!"));
        }
      });
    }

    // WhatsApp Share
    if (shareWhatsappBtn && registryShareLinkInput) {
      shareWhatsappBtn.addEventListener("click", () => {
        const reg = getActiveRegistry();
        const msg = encodeURIComponent(`Check out my celebration gift registry: ${reg ? reg.title : "ElectroMart Registry"}\n${registryShareLinkInput.value}`);
        window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
      });
    }

    // Open Catalog Modal
    if (openCatalogModalBtn && catalogPickerModal) {
      openCatalogModalBtn.addEventListener("click", () => {
        currentCatalogCategory = "all";
        if (catalogCategoryPills) {
          catalogCategoryPills.querySelectorAll(".cat-pill").forEach((p) => p.classList.remove("active"));
          const first = catalogCategoryPills.querySelector('[data-cat="all"]');
          if (first) first.classList.add("active");
        }
        if (catalogSearchInput) catalogSearchInput.value = "";
        renderCatalogModalItems("all", "");
        catalogPickerModal.showModal();
      });
    }

    if (closeCatalogModalBtn && catalogPickerModal) {
      closeCatalogModalBtn.addEventListener("click", () => {
        catalogPickerModal.close();
      });
    }

    // Catalog Picker Category Pills
    if (catalogCategoryPills) {
      catalogCategoryPills.addEventListener("click", (e) => {
        const pill = e.target.closest(".cat-pill");
        if (!pill) return;
        catalogCategoryPills.querySelectorAll(".cat-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        currentCatalogCategory = pill.getAttribute("data-cat") || "all";
        renderCatalogModalItems(currentCatalogCategory, catalogSearchInput ? catalogSearchInput.value : "");
      });
    }

    // Catalog Picker Search Input
    if (catalogSearchInput) {
      catalogSearchInput.addEventListener("input", (e) => {
        renderCatalogModalItems(currentCatalogCategory, e.target.value);
      });
    }

    // Catalog Results Add Button
    if (catalogResultsList) {
      catalogResultsList.addEventListener("click", (e) => {
        const addBtn = e.target.closest("[data-picker-add]");
        if (!addBtn || addBtn.disabled) return;
        const id = addBtn.getAttribute("data-picker-add");
        addItemFromCatalog(id);
      });
    }

    // Open Create Modal from Hero or Category Cards
    if (openCreateRegistryBtn && createRegistryModal) {
      openCreateRegistryBtn.addEventListener("click", () => {
        createRegistryModal.showModal();
      });
    }

    document.querySelectorAll(".amz-btn-card-create").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-category");
        if (regCategorySelect) regCategorySelect.value = cat;
        if (createRegistryModal) createRegistryModal.showModal();
      });
    });

    if (closeCreateRegModalBtn && createRegistryModal) {
      closeCreateRegModalBtn.addEventListener("click", () => {
        createRegistryModal.close();
      });
    }

    if (cancelCreateRegBtn && createRegistryModal) {
      cancelCreateRegBtn.addEventListener("click", () => {
        createRegistryModal.close();
      });
    }

    // Create Registry Form Submission
    if (createRegistryForm) {
      createRegistryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("regTitleInput").value.trim();
        const category = document.getElementById("regCategorySelect").value;
        const date = document.getElementById("regDateInput").value;
        const host = document.getElementById("regHostInput").value.trim();
        const address = document.getElementById("regAddressInput").value.trim();
        const privacyRadio = document.querySelector('input[name="regPrivacy"]:checked');
        const privacy = privacyRadio ? privacyRadio.value : "public";

        if (!title || !date || !host || !address) return;

        const newReg = {
          id: `EM-REG-${Date.now().toString().slice(-6)}`,
          title,
          category,
          date,
          host,
          address,
          privacy,
          items: []
        };

        const registries = loadRegistries();
        registries.unshift(newReg);
        saveRegistries(registries);

        activeRegistryId = newReg.id;
        if (createRegistryModal) createRegistryModal.close();
        createRegistryForm.reset();

        renderActiveRegistry();
        showToast("Celebration registry created successfully! Now add products from the catalog.");
      });
    }

    // Escape Key Modal Dismissal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (createRegistryModal && createRegistryModal.open) createRegistryModal.close();
        if (catalogPickerModal && catalogPickerModal.open) catalogPickerModal.close();
      }
    });

    // Close Modals on Backdrop Click
    [createRegistryModal, catalogPickerModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener("click", (e) => {
          const rect = modal.getBoundingClientRect();
          const isInDialog = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
          );
          if (!isInDialog) modal.close();
        });
      }
    });

    // Clean up timers on page unload (Prevent memory leaks)
    window.addEventListener("beforeunload", () => {
      stopCountdownTimer();
    });
    window.addEventListener("unload", () => {
      stopCountdownTimer();
    });
  }

  // Window Exports for Testing and Modals
  if (typeof window !== "undefined") {
    window.giftItem = giftItem;
    window.removeRegistryItem = removeRegistryItem;
    window.loadRegistries = loadRegistries;
    window.saveRegistries = saveRegistries;
  }

  // URL Parameter Handler (e.g. ?regId=EM-REG-102)
  function parseUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const regId = params.get("regId");
      if (regId) {
        const registries = loadRegistries();
        if (registries.some((r) => r.id === regId)) {
          activeRegistryId = regId;
        }
      }
    } catch {
      /* ignore */
    }
  }

  // Init
  function init() {
    parseUrlParams();
    renderActiveRegistry();
    initListeners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
