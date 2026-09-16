/**
 * Phase 30: ElectroMart Device Trade-In & Exchange Hub Logic (exchange.js)
 */

(function () {
  "use strict";

  // Exchange Catalog Database
  const EXCHANGE_CATALOG = {
    smartphones: {
      brands: ["Apple", "Samsung", "OnePlus", "Xiaomi"],
      models: [
        { brand: "Apple", name: "Apple iPhone 14 Pro Max (128 GB)", baseValue: 24000 },
        { brand: "Apple", name: "Apple iPhone 14 Pro (128 GB)", baseValue: 21000 },
        { brand: "Apple", name: "Apple iPhone 13 (128 GB)", baseValue: 14000 },
        { brand: "Apple", name: "Apple iPhone 12 (64 GB)", baseValue: 10500 },
        { brand: "Apple", name: "Apple iPhone 11 (64 GB)", baseValue: 7500 },
        { brand: "Samsung", name: "Samsung Galaxy S23 Ultra 5G", baseValue: 22000 },
        { brand: "Samsung", name: "Samsung Galaxy S22 5G", baseValue: 13500 },
        { brand: "Samsung", name: "Samsung Galaxy Note 20", baseValue: 9000 },
        { brand: "Samsung", name: "Samsung Galaxy A54 5G", baseValue: 6500 },
        { brand: "OnePlus", name: "OnePlus 11 5G (16GB RAM)", baseValue: 15000 },
        { brand: "OnePlus", name: "OnePlus 10 Pro 5G", baseValue: 11000 },
        { brand: "OnePlus", name: "OnePlus Nord CE 3 5G", baseValue: 5500 },
        { brand: "Xiaomi", name: "Xiaomi 13 Pro 5G", baseValue: 14000 },
        { brand: "Xiaomi", name: "Redmi Note 12 Pro 5G", baseValue: 5000 }
      ]
    },
    laptops: {
      brands: ["Apple", "Dell", "HP", "Lenovo", "Asus"],
      models: [
        { brand: "Apple", name: "Apple MacBook Pro 14 M2 Pro", baseValue: 24500 },
        { brand: "Apple", name: "Apple MacBook Air 13 M1", baseValue: 18000 },
        { brand: "Apple", name: "Apple MacBook Pro 16 Intel Core i7", baseValue: 12000 },
        { brand: "Dell", name: "Dell XPS 15 OLED Core i7", baseValue: 19000 },
        { brand: "Dell", name: "Dell Inspiron 15 Core i5", baseValue: 9500 },
        { brand: "HP", name: "HP Spectre x360 2-in-1 Touch", baseValue: 18500 },
        { brand: "HP", name: "HP Pavilion 15 Gaming Core i5", baseValue: 8500 },
        { brand: "Lenovo", name: "Lenovo ThinkPad X1 Carbon Gen 9", baseValue: 19500 },
        { brand: "Lenovo", name: "Lenovo IdeaPad Slim 3 Core i3", baseValue: 7500 },
        { brand: "Asus", name: "Asus ROG Zephyrus G14 Ryzen 7", baseValue: 17000 },
        { brand: "Asus", name: "Asus ZenBook 14 OLED", baseValue: 11000 }
      ]
    },
    tablets: {
      brands: ["Apple", "Samsung"],
      models: [
        { brand: "Apple", name: "Apple iPad Pro 11-inch M1 (128 GB)", baseValue: 16000 },
        { brand: "Apple", name: "Apple iPad Air 5th Gen (64 GB)", baseValue: 12500 },
        { brand: "Apple", name: "Apple iPad 10th Gen (64 GB)", baseValue: 8000 },
        { brand: "Samsung", name: "Samsung Galaxy Tab S8 11-inch", baseValue: 13000 },
        { brand: "Samsung", name: "Samsung Galaxy Tab A8 10.5", baseValue: 4500 }
      ]
    },
    smartwatches: {
      brands: ["Apple", "Samsung"],
      models: [
        { brand: "Apple", name: "Apple Watch Series 8 GPS 45mm", baseValue: 9000 },
        { brand: "Apple", name: "Apple Watch SE GPS 44mm", baseValue: 5000 },
        { brand: "Samsung", name: "Samsung Galaxy Watch 5 Pro", baseValue: 7500 },
        { brand: "Samsung", name: "Samsung Galaxy Watch 4 Classic", baseValue: 4000 }
      ]
    },
    audio: {
      brands: ["Sony", "Bose", "Apple"],
      models: [
        { brand: "Sony", name: "Sony WH-1000XM5 Wireless ANC", baseValue: 8000 },
        { brand: "Sony", name: "Sony WH-1000XM4 Wireless ANC", baseValue: 5500 },
        { brand: "Bose", name: "Bose QuietComfort 45 Headphones", baseValue: 7000 },
        { brand: "Apple", name: "Apple AirPods Max Wireless", baseValue: 9500 },
        { brand: "Apple", name: "Apple AirPods Pro 2nd Gen", baseValue: 5500 }
      ]
    }
  };

  // State
  const state = {
    category: "smartphones",
    brand: "Apple",
    model: null,
    condition: {
      power: "yes",
      screen: "flawless",
      body: "flawless"
    },
    quote: null
  };

  // DOM Elements
  let brandSelectEl, modelSelectEl, searchInputEl, searchDropdownEl;
  let quoteCardEl, quoteCategoryEl, quoteNameEl, quoteFinalValueEl;
  let quoteBaseValueEl, quoteAdjustmentValueEl, quoteBonusValueEl, quoteTotalSavingsEl, quoteVoucherCodeEl;
  let copyQuoteBtn, applyQuoteBtn, resetCalcBtn;

  function initElements() {
    brandSelectEl = document.getElementById("exchangeBrandSelect");
    modelSelectEl = document.getElementById("exchangeModelSelect");
    searchInputEl = document.getElementById("exchangeModelSearch");
    searchDropdownEl = document.getElementById("exchangeSearchResults");

    quoteCardEl = document.getElementById("exchangeQuoteCard");
    quoteCategoryEl = document.getElementById("quoteDeviceCategory");
    quoteNameEl = document.getElementById("quoteDeviceName");
    quoteFinalValueEl = document.getElementById("quoteFinalValue");
    quoteBaseValueEl = document.getElementById("quoteBaseValue");
    quoteAdjustmentValueEl = document.getElementById("quoteAdjustmentValue");
    quoteBonusValueEl = document.getElementById("quoteBonusValue");
    quoteTotalSavingsEl = document.getElementById("quoteTotalSavings");
    quoteVoucherCodeEl = document.getElementById("quoteVoucherCode");

    copyQuoteBtn = document.getElementById("btnCopyQuoteCode");
    applyQuoteBtn = document.getElementById("btnApplyQuoteToOrder");
    resetCalcBtn = document.getElementById("btnResetCalculator");
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(val));
  }

  function getCategoryModels(category) {
    const data = EXCHANGE_CATALOG[category];
    return data ? data.models : [];
  }

  function getCategoryBrands(category) {
    const data = EXCHANGE_CATALOG[category];
    return data ? data.brands : [];
  }

  function renderCategoryPills() {
    const pills = document.querySelectorAll(".calc-cat-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const newCat = pill.dataset.category || "smartphones";
        selectCategory(newCat);
      });
    });
  }

  function selectCategory(category) {
    state.category = category;
    const brands = getCategoryBrands(category);
    state.brand = brands[0] || "";
    renderBrandChips(brands);
    populateBrandDropdown(brands);
    populateModelDropdown(category, state.brand);
    calculateAndRenderQuote();
  }

  function renderBrandChips(brands) {
    const container = document.getElementById("calcBrandChips");
    if (!container) return;
    container.innerHTML = brands
      .map(
        (brand) => `
        <button type="button" class="brand-chip-btn ${brand === state.brand ? "active" : ""}" data-brand="${brand}">
          ${brand}
        </button>
      `
      )
      .join("");

    container.querySelectorAll(".brand-chip-btn").forEach((chip) => {
      chip.addEventListener("click", () => {
        container.querySelectorAll(".brand-chip-btn").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.brand = chip.dataset.brand;
        if (brandSelectEl) brandSelectEl.value = state.brand;
        populateModelDropdown(state.category, state.brand);
        calculateAndRenderQuote();
      });
    });
  }

  function populateBrandDropdown(brands) {
    if (!brandSelectEl) return;
    brandSelectEl.innerHTML = `
      <option value="">-- Choose Brand --</option>
      ${brands.map((b) => `<option value="${b}" ${b === state.brand ? "selected" : ""}>${b}</option>`).join("")}
    `;

    brandSelectEl.onchange = (e) => {
      state.brand = e.target.value;
      const chips = document.querySelectorAll(".brand-chip-btn");
      chips.forEach((c) => c.classList.toggle("active", c.dataset.brand === state.brand));
      populateModelDropdown(state.category, state.brand);
      calculateAndRenderQuote();
    };
  }

  function populateModelDropdown(category, brand) {
    if (!modelSelectEl) return;
    const allModels = getCategoryModels(category);
    const filtered = brand ? allModels.filter((m) => m.brand === brand) : allModels;

    if (!filtered.length) {
      modelSelectEl.innerHTML = `<option value="">-- No Models Found --</option>`;
      modelSelectEl.disabled = true;
      state.model = null;
      return;
    }

    modelSelectEl.disabled = false;
    modelSelectEl.innerHTML = filtered
      .map((m) => `<option value="${m.name}">${m.name}</option>`)
      .join("");

    state.model = filtered[0] || null;
    modelSelectEl.value = state.model ? state.model.name : "";

    modelSelectEl.onchange = (e) => {
      const selectedName = e.target.value;
      state.model = filtered.find((m) => m.name === selectedName) || null;
      calculateAndRenderQuote();
    };
  }

  function setupSearch() {
    if (!searchInputEl || !searchDropdownEl) return;

    searchInputEl.addEventListener("input", (e) => {
      const query = String(e.target.value || "").trim().toLowerCase();
      if (!query) {
        searchDropdownEl.style.display = "none";
        return;
      }

      const allCategoryModels = getCategoryModels(state.category);
      const matches = allCategoryModels.filter((m) => m.name.toLowerCase().includes(query));

      if (!matches.length) {
        searchDropdownEl.innerHTML = `<div class="calc-search-item" style="color: #888;">No matching models found</div>`;
        searchDropdownEl.style.display = "block";
        return;
      }

      searchDropdownEl.innerHTML = matches
        .map((m) => `<div class="calc-search-item" data-name="${m.name}">${m.name}</div>`)
        .join("");
      searchDropdownEl.style.display = "block";

      searchDropdownEl.querySelectorAll(".calc-search-item").forEach((item) => {
        item.addEventListener("click", () => {
          const selectedName = item.dataset.name;
          const found = matches.find((m) => m.name === selectedName);
          if (found) {
            state.brand = found.brand;
            state.model = found;
            if (brandSelectEl) brandSelectEl.value = found.brand;
            populateModelDropdown(state.category, found.brand);
            if (modelSelectEl) modelSelectEl.value = found.name;
            searchInputEl.value = found.name;
            searchDropdownEl.style.display = "none";
            calculateAndRenderQuote();
          }
        });
      });
    });

    document.addEventListener("click", (e) => {
      if (!searchInputEl.contains(e.target) && !searchDropdownEl.contains(e.target)) {
        searchDropdownEl.style.display = "none";
      }
    });
  }

  function setupDiagnosticListeners() {
    document.querySelectorAll("input[name='diagPower']").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        state.condition.power = e.target.value;
        calculateAndRenderQuote();
      });
    });

    document.querySelectorAll("input[name='diagScreen']").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        state.condition.screen = e.target.value;
        calculateAndRenderQuote();
      });
    });

    document.querySelectorAll("input[name='diagBody']").forEach((radio) => {
      radio.addEventListener("change", (e) => {
        state.condition.body = e.target.value;
        calculateAndRenderQuote();
      });
    });
  }

  function generateVoucherCode() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `EM-EX-${randomNum}`;
  }

  function calculateAndRenderQuote() {
    if (!state.model) {
      const models = getCategoryModels(state.category);
      state.model = models[0] || { name: "Sample Device", baseValue: 10000 };
    }

    const base = Number(state.model.baseValue || 10000);
    let deduction = 0;

    // Power
    if (state.condition.power === "no") {
      deduction += base * 0.5;
    }

    // Screen
    if (state.condition.screen === "minor") {
      deduction += base * 0.12;
    } else if (state.condition.screen === "heavy") {
      deduction += base * 0.28;
    } else if (state.condition.screen === "cracked") {
      deduction += base * 0.45;
    }

    // Body
    if (state.condition.body === "minor") {
      deduction += base * 0.08;
    } else if (state.condition.body === "heavy") {
      deduction += base * 0.22;
    }

    // ElectroMart Exchange Bonus (₹1,000 for working devices)
    const bonus = state.condition.power === "yes" && state.condition.screen !== "cracked" ? 1000 : 0;
    const finalQuote = Math.max(500, Math.round(base - deduction + bonus));

    state.quote = {
      category: state.category,
      brand: state.brand,
      modelName: state.model.name,
      baseValue: base,
      deduction: Math.round(deduction),
      bonus: bonus,
      finalValue: finalQuote,
      voucherCode: generateVoucherCode(),
      timestamp: Date.now()
    };

    // Save active quote to storage for cross-page persistence
    try {
      localStorage.setItem("electromart_last_exchange_quote_v1", JSON.stringify(state.quote));
    } catch (e) {}

    // Update DOM
    if (quoteCategoryEl) quoteCategoryEl.textContent = state.category.toUpperCase();
    if (quoteNameEl) quoteNameEl.textContent = state.model.name;
    if (quoteFinalValueEl) quoteFinalValueEl.textContent = formatCurrency(finalQuote);
    if (quoteBaseValueEl) quoteBaseValueEl.textContent = `₹${formatCurrency(base)}`;
    if (quoteAdjustmentValueEl) quoteAdjustmentValueEl.textContent = `-₹${formatCurrency(deduction)}`;
    if (quoteBonusValueEl) quoteBonusValueEl.textContent = `+₹${formatCurrency(bonus)}`;
    if (quoteTotalSavingsEl) quoteTotalSavingsEl.textContent = `₹${formatCurrency(finalQuote)}`;
    if (quoteVoucherCodeEl) quoteVoucherCodeEl.textContent = state.quote.voucherCode;

    if (applyQuoteBtn) {
      applyQuoteBtn.href = `products.html?exchange=active&quote=${finalQuote}`;
    }
  }

  function showToast(message) {
    const stack = document.getElementById("exchangeToastStack");
    if (!stack) return;
    const toast = document.createElement("div");
    toast.className = "exchange-toast";
    toast.textContent = message;
    stack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function setupActions() {
    if (copyQuoteBtn) {
      copyQuoteBtn.addEventListener("click", () => {
        if (!state.quote) return;
        const code = state.quote.voucherCode;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).then(() => {
            showToast(`✓ Voucher Code ${code} copied to clipboard!`);
          });
        } else {
          showToast(`✓ Voucher Code: ${code}`);
        }
      });
    }

    if (resetCalcBtn) {
      resetCalcBtn.addEventListener("click", () => {
        const defaultRadioPower = document.getElementById("condPowerYes");
        const defaultRadioScreen = document.getElementById("condScreenFlawless");
        const defaultRadioBody = document.getElementById("condBodyFlawless");
        if (defaultRadioPower) defaultRadioPower.checked = true;
        if (defaultRadioScreen) defaultRadioScreen.checked = true;
        if (defaultRadioBody) defaultRadioBody.checked = true;
        state.condition.power = "yes";
        state.condition.screen = "flawless";
        state.condition.body = "flawless";
        calculateAndRenderQuote();
        showToast("Calculator reset to default settings.");
      });
    }
  }

  // Expose catalog and helper functions globally
  window.ELECTROMART_EXCHANGE_CATALOG = EXCHANGE_CATALOG;
  window.calculateExchangeValue = calculateFinalValue;

  // Initialization
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initElements();
        renderCategoryPills();
        selectCategory("smartphones");
        setupSearch();
        setupDiagnosticListeners();
        setupActions();
      });
    } else {
      initElements();
      renderCategoryPills();
      selectCategory("smartphones");
      setupSearch();
      setupDiagnosticListeners();
      setupActions();
    }
  }
})();

