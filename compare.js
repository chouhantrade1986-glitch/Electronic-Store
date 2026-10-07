/**
 * ElectroMart — Authentic Amazon India-Style Product Comparison Hub (Phase 19)
 * Full 4-way spec comparison matrix, dynamic difference highlighter,
 * 1-click cart sync, modal product picker, and 751-product catalog integration.
 */

(function () {
  "use strict";

  const COMPARE_STORAGE_KEY = "electromart_compare_v1";
  const CART_STORAGE_KEY = "electromart_cart_v1";
  const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
  const MAX_COMPARE_ITEMS = 4;

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  function formatPrice(val) {
    const num = Number(val || 0);
    return inrFormatter.format(num);
  }

  // Fallback high-fidelity products with specs
  const fallbackCompareProducts = [
    {
      id: "1",
      name: "AstraBook Pro 14",
      brand: "AstraTech",
      category: "laptop",
      price: 79920,
      listPrice: 99771,
      rating: 4.6,
      reviewCount: 480,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
      stock: 18,
      specs: {
        processor: "Intel Core i7-13700H (14 Cores, 20 Threads)",
        ram: "16GB LPDDR5 4800MHz",
        storage: "512GB PCIe 4.0 NVMe SSD",
        display: "14-inch 2.8K OLED (2880 x 1800) 90Hz",
        battery: "70Wh Li-Ion (Up to 12 Hours)",
        warranty: "1 Year ElectroMart Onsite Warranty",
        replacement: "7 Days Replacement Guarantee",
        cod: "Eligible for Pay on Delivery",
        gstRate: "18% Statutory GST"
      }
    },
    {
      id: "7",
      name: "Vector Gaming Laptop",
      brand: "Vector",
      category: "laptop",
      price: 104990,
      listPrice: 129990,
      rating: 4.8,
      reviewCount: 620,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
      stock: 12,
      specs: {
        processor: "AMD Ryzen 7 7840HS (8 Cores, 16 Threads)",
        ram: "16GB DDR5 5600MHz Dual-Channel",
        storage: "1TB PCIe Gen4 High-Speed SSD",
        display: "15.6-inch FHD (1920 x 1080) 165Hz IPS",
        battery: "80Wh Super-Rapid Charge (Up to 8 Hours)",
        warranty: "2 Years Extended Brand Warranty",
        replacement: "7 Days Replacement Guarantee",
        cod: "Eligible for Pay on Delivery",
        gstRate: "18% Statutory GST"
      }
    },
    {
      id: "2",
      name: "Nimbus Phone X",
      brand: "Nimbus",
      category: "mobile",
      price: 59990,
      listPrice: 69990,
      rating: 4.5,
      reviewCount: 340,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      stock: 25,
      specs: {
        processor: "Snapdragon 8 Gen 2 (4nm Architecture)",
        ram: "8GB LPDDR5X Ultra RAM",
        storage: "256GB UFS 4.0 Storage",
        display: "6.7-inch Dynamic AMOLED 120Hz HDR10+",
        battery: "5000 mAh with 67W Turbo Charge",
        warranty: "1 Year Brand Manufacturer Warranty",
        replacement: "7 Days Replacement Guarantee",
        cod: "Eligible for Pay on Delivery",
        gstRate: "18% Statutory GST"
      }
    },
    {
      id: "3",
      name: "Pulse ANC Headphones",
      brand: "PulseWave",
      category: "audio",
      price: 14490,
      listPrice: 19990,
      rating: 4.4,
      reviewCount: 210,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      stock: 30,
      specs: {
        processor: "Dual-Core Audio DSP with ANC Engine",
        ram: "Integrated 24-bit Hi-Res DAC",
        storage: "N/A",
        display: "Smart Multi-color Status LED",
        battery: "40 Hours Playback (Fast Fuel: 10m = 4h)",
        warranty: "1 Year Official Warranty",
        replacement: "7 Days Replacement Guarantee",
        cod: "Eligible for Pay on Delivery",
        gstRate: "18% Statutory GST"
      }
    }
  ];

  let compareList = [];
  let allProductsPool = [];
  let modalSelectedCategory = "all";

  // 1. Storage & State Management
  function getCompareList() {
    // Check URL query parameters first (e.g. ?ids=1,7,2)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlIds = urlParams.get("ids");
      if (urlIds) {
        const parsed = urlIds.split(",").map(s => s.trim()).filter(Boolean).slice(0, MAX_COMPARE_ITEMS);
        if (parsed.length > 0) {
          saveCompareList(parsed);
          return parsed;
        }
      }
    } catch (_) {}

    try {
      const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE_ITEMS) : [];
    } catch (_) {
      return [];
    }
  }

  function saveCompareList(list) {
    try {
      const safe = Array.isArray(list) ? list.slice(0, MAX_COMPARE_ITEMS) : [];
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(safe));
    } catch (_) {}
  }

  function loadCatalogMap() {
    try {
      const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return typeof parsed === "object" && parsed ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  // 2. Resolve Product by ID with rich specs
  function resolveProduct(productId) {
    const key = String(productId || "").trim();
    if (!key) return null;

    // A. Check fallback catalog first for rich specs
    const fromFallback = fallbackCompareProducts.find(p => String(p.id) === key);
    if (fromFallback) return fromFallback;

    // B. Check in-memory pool
    const fromPool = allProductsPool.find(p => String(p.id) === key);
    if (fromPool) return enrichProductSpecs(fromPool);

    // C. Check window.EM_CATALOG / EM_CATALOG_MAP
    if (typeof window !== "undefined") {
      if (window.EM_CATALOG_MAP) {
        const em = typeof window.EM_CATALOG_MAP.get === "function" 
          ? window.EM_CATALOG_MAP.get(key) 
          : window.EM_CATALOG_MAP[key];
        if (em) return enrichProductSpecs(em);
      }
      if (Array.isArray(window.EM_CATALOG)) {
        const em = window.EM_CATALOG.find(p => String(p.id) === key);
        if (em) return enrichProductSpecs(em);
      }
    }

    // D. Check localStorage cached catalog
    const localMap = loadCatalogMap();
    if (localMap[key]) {
      return enrichProductSpecs(localMap[key]);
    }

    return null;
  }

  function enrichProductSpecs(p) {
    const category = String(p.category || "electronics").toLowerCase();
    const brand = p.brand || "ElectroMart Certified";
    const specs = p.specs || {};

    // Generate intelligent default specs if missing
    return {
      id: String(p.id),
      name: p.name || p.title || `Product #${p.id}`,
      brand,
      category,
      price: Number(p.price || 0),
      listPrice: Number(p.listPrice || p.price * 1.25 || 0),
      rating: Number(p.rating || 4.5),
      reviewCount: Number(p.reviewCount || 120),
      image: (Array.isArray(p.images) && p.images[0]) || p.image || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300",
      stock: p.stock !== undefined ? Number(p.stock) : 10,
      specs: {
        processor: specs.processor || (category.includes("laptop") ? "High-Speed Multi-Core Processor" : (category.includes("mobile") ? "Octa-Core High-Efficiency Processor" : "Advanced Digital Processing")),
        ram: specs.ram || (category.includes("laptop") ? "16GB High-Speed RAM" : (category.includes("mobile") ? "8GB RAM" : "High-Performance Buffer")),
        storage: specs.storage || (category.includes("laptop") ? "512GB NVMe SSD" : (category.includes("mobile") ? "128GB Internal Storage" : "N/A")),
        display: specs.display || (category.includes("laptop") ? "Anti-Glare HD Display" : (category.includes("mobile") ? "FHD+ Gorilla Glass Display" : "Smart LED Indicator")),
        battery: specs.battery || (category.includes("battery") ? "Grade-A Lithium-Ion Cells" : "Long-Lasting High Capacity"),
        warranty: specs.warranty || "1 Year ElectroMart Warranty",
        replacement: specs.replacement || "7 Days Replacement Guarantee",
        cod: specs.cod || "Eligible for Pay on Delivery",
        gstRate: specs.gstRate || (p.gstRate ? `${Math.round(p.gstRate * 100)}% GST Eligible` : "18% Statutory GST")
      }
    };
  }

  // 3. Build Full Products Pool for Picker Modal
  async function initProductsPool() {
    allProductsPool = [...fallbackCompareProducts];

    // Merge window.EM_CATALOG if present
    if (typeof window !== "undefined" && Array.isArray(window.EM_CATALOG)) {
      window.EM_CATALOG.forEach(item => {
        if (!allProductsPool.some(p => String(p.id) === String(item.id))) {
          allProductsPool.push(enrichProductSpecs(item));
        }
      });
    }

    // Try fetching live catalog from API
    try {
      const resp = await fetch("http://localhost:4000/api/products?status=active");
      if (resp.ok) {
        const data = await resp.json();
        const apiList = Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
        apiList.forEach(item => {
          if (!allProductsPool.some(p => String(p.id) === String(item.id))) {
            allProductsPool.push(enrichProductSpecs(item));
          }
        });
      }
    } catch (_) {}
  }

  // 4. Render Main Comparison View
  function renderComparison() {
    compareList = getCompareList();

    const emptyState = document.getElementById("emptyCompareState");
    const matrixWrapper = document.getElementById("comparisonTableWrapper");
    const countBadge = document.getElementById("comparedItemsCountBadge");
    const diffToggle = document.getElementById("highlightDiffToggle");

    if (!emptyState || !matrixWrapper) return;

    if (compareList.length === 0) {
      emptyState.style.display = "block";
      matrixWrapper.style.display = "none";
      if (diffToggle) diffToggle.disabled = true;
      if (countBadge) countBadge.textContent = "0 / 4 Items";
      return;
    }

    emptyState.style.display = "none";
    matrixWrapper.style.display = "block";
    if (diffToggle) diffToggle.disabled = false;
    if (countBadge) countBadge.textContent = `${compareList.length} / 4 Items`;

    const products = compareList.map(resolveProduct).filter(Boolean);
    if (products.length === 0) {
      emptyState.style.display = "block";
      matrixWrapper.style.display = "none";
      return;
    }

    renderTableHeader(products);
    renderTableBody(products);
    applyDifferentialHighlighting();

    // Trigger universal translation bus if available
    if (typeof window !== "undefined" && typeof window.applyFullPageTranslation === "function") {
      const currentLang = localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en";
      window.applyFullPageTranslation(currentLang);
    }
  }

  // 5. Render Header Cards (Up to 4 slots)
  function renderTableHeader(products) {
    const headerRow = document.getElementById("productHeaderRow");
    if (!headerRow) return;

    // Retain only the sticky feature header column
    while (headerRow.children.length > 1) {
      headerRow.removeChild(headerRow.lastChild);
    }

    // Render active product columns
    products.forEach(product => {
      const th = document.createElement("th");
      th.className = "product-compare-slot-col";
      th.dataset.productId = product.id;

      const discountPct = product.listPrice > product.price 
        ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100) 
        : 18;

      th.innerHTML = `
        <div class="amz-compare-card">
          <button type="button" class="amz-compare-remove-btn" data-remove-id="${product.id}" title="Remove from compare" aria-label="Remove ${product.name}">&times;</button>
          
          <div class="amz-compare-badge ${product.rating >= 4.6 ? 'choice' : ''}">
            ${product.rating >= 4.6 ? "ElectroMart's Choice" : "Popular Item"}
          </div>

          <div class="amz-compare-img-wrap">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300'" />
          </div>

          <a href="product-detail.html?id=${product.id}" class="amz-compare-title" title="${product.name}">${product.name}</a>

          <div class="amz-compare-rating">
            <span class="amz-stars-gold">★★★★${product.rating >= 4.5 ? '★' : '☆'}</span>
            <span class="amz-rating-num">${product.rating.toFixed(1)}</span>
            <span class="amz-rating-count">(${product.reviewCount})</span>
          </div>

          <div class="amz-compare-price-stack">
            <div class="amz-price-row">
              <span class="amz-discount-pct">-${discountPct}%</span>
              <span class="amz-current-price">${formatPrice(product.price)}</span>
            </div>
            <div class="amz-mrp-row">
              M.R.P.: <span class="amz-mrp-strike">${formatPrice(product.listPrice)}</span>
            </div>
          </div>

          <div class="amz-delivery-tag">
            ✓ FREE Delivery by Tomorrow
          </div>

          <div class="amz-compare-cta-stack">
            <button type="button" class="amz-btn-add-cart" data-cart-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}>
              ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button type="button" class="amz-btn-buy-now" data-buy-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}>
              Buy Now
            </button>
          </div>
        </div>
      `;
      headerRow.appendChild(th);
    });

    // If fewer than 4 items, render "+ Add a product" slot card
    if (products.length < MAX_COMPARE_ITEMS) {
      const thSlot = document.createElement("th");
      thSlot.className = "product-compare-slot-col";
      thSlot.innerHTML = `
        <div class="amz-compare-add-slot" id="addCompareSlotBtn" role="button" tabindex="0">
          <div class="add-slot-circle">+</div>
          <div class="add-slot-title" data-i18n="compare_add_slot">Add a product to compare</div>
          <div class="add-slot-subtitle" data-i18n="compare_add_slot_desc">Select from our 751 electronics catalog</div>
        </div>
      `;
      headerRow.appendChild(thSlot);
    }
  }

  // 6. Render Categorized Spec Rows
  function renderTableBody(products) {
    const tbody = document.getElementById("comparisonBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const hasEmptySlot = products.length < MAX_COMPARE_ITEMS;

    const sections = [
      {
        titleKey: "compare_sec_overview",
        defaultTitle: "Overview & Pricing",
        rows: [
          {
            labelKey: "compare_spec_customer_rating",
            defaultLabel: "Customer Rating",
            getVal: p => `⭐ ${p.rating.toFixed(1)} out of 5 (${p.reviewCount} reviews)`
          },
          {
            labelKey: "compare_spec_current_price",
            defaultLabel: "Deal Price",
            getVal: p => `<strong>${formatPrice(p.price)}</strong> (Inclusive of all taxes)`
          },
          {
            labelKey: "compare_spec_mrp",
            defaultLabel: "M.R.P.",
            getVal: p => `<span style="text-decoration: line-through;">${formatPrice(p.listPrice)}</span>`
          },
          {
            labelKey: "compare_spec_savings",
            defaultLabel: "You Save",
            getVal: p => {
              const diff = Math.max(0, p.listPrice - p.price);
              const pct = p.listPrice > 0 ? Math.round((diff / p.listPrice) * 100) : 0;
              return `<span style="color: #007600; font-weight: 600;">${formatPrice(diff)} (${pct}%)</span>`;
            }
          },
          {
            labelKey: "compare_spec_availability",
            defaultLabel: "Availability",
            getVal: p => p.stock > 0 
              ? `<span style="color: #007600; font-weight: 600;">✓ In Stock (${p.stock} units)</span>` 
              : `<span style="color: #cc0c39; font-weight: 600;">✗ Currently Unavailable</span>`
          },
          {
            labelKey: "compare_spec_delivery",
            defaultLabel: "Delivery Window",
            getVal: () => "Standard Delivery: Tomorrow, 11 AM - 4 PM"
          },
          {
            labelKey: "compare_spec_gst_rate",
            defaultLabel: "Applicable GST",
            getVal: p => p.specs.gstRate
          }
        ]
      },
      {
        titleKey: "compare_sec_technical",
        defaultTitle: "Technical Specifications",
        rows: [
          {
            labelKey: "compare_spec_brand",
            defaultLabel: "Brand",
            getVal: p => p.brand
          },
          {
            labelKey: "compare_spec_category",
            defaultLabel: "Category",
            getVal: p => p.category.toUpperCase()
          },
          {
            labelKey: "compare_spec_processor",
            defaultLabel: "Processor / CPU",
            getVal: p => p.specs.processor
          },
          {
            labelKey: "compare_spec_ram",
            defaultLabel: "RAM / Memory",
            getVal: p => p.specs.ram
          },
          {
            labelKey: "compare_spec_storage",
            defaultLabel: "Storage Capacity",
            getVal: p => p.specs.storage
          },
          {
            labelKey: "compare_spec_display",
            defaultLabel: "Display / Screen",
            getVal: p => p.specs.display
          },
          {
            labelKey: "compare_spec_battery",
            defaultLabel: "Battery & Power",
            getVal: p => p.specs.battery
          }
        ]
      },
      {
        titleKey: "compare_sec_warranty",
        defaultTitle: "Warranty & Trust Assurances",
        rows: [
          {
            labelKey: "compare_spec_warranty",
            defaultLabel: "Warranty Period",
            getVal: p => p.specs.warranty
          },
          {
            labelKey: "compare_spec_replacement",
            defaultLabel: "Return / Replacement",
            getVal: p => p.specs.replacement
          },
          {
            labelKey: "compare_spec_cod",
            defaultLabel: "Pay on Delivery",
            getVal: p => p.specs.cod
          }
        ]
      }
    ];

    sections.forEach(sec => {
      // Section header row
      const secTr = document.createElement("tr");
      secTr.className = "spec-section-header-row";
      secTr.innerHTML = `
        <th colspan="${products.length + (hasEmptySlot ? 2 : 1)}" data-i18n="${sec.titleKey}">
          ${sec.defaultTitle}
        </th>
      `;
      tbody.appendChild(secTr);

      // Section rows
      sec.rows.forEach(rowDef => {
        const tr = document.createElement("tr");
        tr.className = "spec-data-row";

        // Sticky Feature Label
        const tdLabel = document.createElement("td");
        tdLabel.className = "feature-name-cell";
        tdLabel.setAttribute("data-i18n", rowDef.labelKey);
        tdLabel.textContent = rowDef.defaultLabel;
        tr.appendChild(tdLabel);

        // Product values
        const values = [];
        products.forEach(p => {
          const tdVal = document.createElement("td");
          tdVal.className = "spec-val-cell";
          const valHtml = rowDef.getVal(p);
          tdVal.innerHTML = valHtml;
          tr.appendChild(tdVal);
          values.push(tdVal.textContent.trim());
        });

        // If fewer than 4 items, add empty td for layout alignment
        if (hasEmptySlot) {
          const tdEmpty = document.createElement("td");
          tdEmpty.className = "spec-val-cell empty-slot-cell";
          tdEmpty.innerHTML = '<span style="color: #a2a6a6;">—</span>';
          tr.appendChild(tdEmpty);
        }

        // Determine if values differ
        const allSame = values.every(v => v === values[0]);
        tr.dataset.hasDiff = allSame ? "false" : "true";

        tbody.appendChild(tr);
      });
    });
  }

  // 7. Differential Highlighting Logic
  function applyDifferentialHighlighting() {
    const diffToggle = document.getElementById("highlightDiffToggle");
    const isChecked = diffToggle ? diffToggle.checked : false;

    const dataRows = document.querySelectorAll("tr.spec-data-row");
    dataRows.forEach(row => {
      if (isChecked && row.dataset.hasDiff === "true") {
        row.classList.add("diff-highlight");
      } else {
        row.classList.remove("diff-highlight");
      }
    });
  }

  // 8. 1-Click Add to Cart & Buy Now
  function handleAddToCart(productId, buttonEl) {
    try {
      const cartMap = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
      cartMap[productId] = (cartMap[productId] || 0) + 1;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));

      // Header cart count sync
      const cartCountEl = document.getElementById("cartCount");
      if (cartCountEl) {
        const total = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
        cartCountEl.textContent = String(total);
      }

      // Visual feedback
      if (buttonEl) {
        buttonEl.classList.add("added");
        buttonEl.textContent = "✓ Added to Cart";
        setTimeout(() => {
          buttonEl.classList.remove("added");
          buttonEl.textContent = "Add to Cart";
        }, 1800);
      }

      showToast("Product added to cart!");
    } catch (_) {}
  }

  function handleBuyNow(productId) {
    try {
      const cartMap = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
      cartMap[productId] = (cartMap[productId] || 0) + 1;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
      window.location.href = "checkout.html";
    } catch (_) {
      window.location.href = "checkout.html";
    }
  }

  // 9. Remove and Clear Handlers
  function handleRemoveProduct(productId) {
    compareList = compareList.filter(id => String(id) !== String(productId));
    saveCompareList(compareList);
    renderComparison();
    showToast("Product removed from comparison");
  }

  function handleClearAll() {
    compareList = [];
    saveCompareList([]);
    renderComparison();
    showToast("Comparison cleared");
  }

  // 10. Add Product Picker Modal
  function openAddProductModal() {
    const modal = document.getElementById("addProductModal");
    if (!modal) return;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    const searchInput = document.getElementById("compareModalSearchInput");
    if (searchInput) {
      searchInput.value = "";
      setTimeout(() => searchInput.focus(), 100);
    }
    modalSelectedCategory = "all";
    updateModalCategoryPills();
    renderModalProductResults("");
  }

  function closeAddProductModal() {
    const modal = document.getElementById("addProductModal");
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  function updateModalCategoryPills() {
    document.querySelectorAll(".modal-cat-pill").forEach(pill => {
      if (pill.dataset.cat === modalSelectedCategory) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  function renderModalProductResults(query = "") {
    const listEl = document.getElementById("modalProductsResultsList");
    const emptyEl = document.getElementById("modalEmptyResults");
    if (!listEl) return;

    listEl.innerHTML = "";
    const cleanQuery = query.toLowerCase().trim();

    const filtered = allProductsPool.filter(p => {
      const matchesCat = modalSelectedCategory === "all" || p.category.toLowerCase().includes(modalSelectedCategory);
      const matchesQuery = !cleanQuery || p.name.toLowerCase().includes(cleanQuery) || p.brand.toLowerCase().includes(cleanQuery);
      return matchesCat && matchesQuery;
    });

    if (filtered.length === 0) {
      if (emptyEl) emptyEl.style.display = "block";
      return;
    }
    if (emptyEl) emptyEl.style.display = "none";

    filtered.slice(0, 24).forEach(product => {
      const isAlreadyAdded = compareList.includes(String(product.id));
      const itemEl = document.createElement("div");
      itemEl.className = "modal-product-item";
      itemEl.innerHTML = `
        <img class="modal-product-thumb" src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300'" />
        <div class="modal-product-info">
          <div class="modal-product-name" title="${product.name}">${product.name}</div>
          <div class="modal-product-price">${formatPrice(product.price)}</div>
        </div>
        <button type="button" class="modal-add-btn" data-modal-add-id="${product.id}" ${isAlreadyAdded ? 'disabled' : ''}>
          ${isAlreadyAdded ? 'Added' : '+ Add'}
        </button>
      `;
      listEl.appendChild(itemEl);
    });
  }

  function addProductToCompare(productId) {
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      showToast("Maximum 4 products can be compared at once.");
      return;
    }
    const key = String(productId);
    if (!compareList.includes(key)) {
      compareList.push(key);
      saveCompareList(compareList);
      renderComparison();
      closeAddProductModal();
      showToast("Product added to comparison!");
    }
  }

  // 11. Presets Handler
  function loadPreset(presetName) {
    if (presetName === "laptops") {
      compareList = ["1", "7"];
    } else if (presetName === "audio") {
      compareList = ["3", "product_1773480601003"];
    } else if (presetName === "mobiles") {
      compareList = ["2", "product_c5367fc4-ca38-9435-27dc-8d383b5faa59"];
    } else if (presetName === "components") {
      compareList = ["product_faadad46-7286-8744-5d9a-1263da26d23c", "1"];
    }
    saveCompareList(compareList);
    renderComparison();
    showToast("Comparison loaded!");
  }

  // 12. Share Comparison Link
  function shareComparison() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("ids", compareList.join(","));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url.toString()).then(() => {
          showToast("Comparison link copied to clipboard!");
        });
      } else {
        prompt("Copy this comparison link:", url.toString());
      }
    } catch (_) {}
  }

  // 13. Toast Notification
  function showToast(message) {
    const existing = document.querySelector(".amz-compare-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "amz-compare-toast";
    toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  // 14. Event Delegation and Initialization
  function bindEvents() {
    // Difference toggle switch
    const diffToggle = document.getElementById("highlightDiffToggle");
    if (diffToggle) {
      diffToggle.addEventListener("change", applyDifferentialHighlighting);
    }

    // Clear All button
    const clearBtn = document.getElementById("clearAllCompareBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", handleClearAll);
    }

    // Share button
    const shareBtn = document.getElementById("shareCompareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", shareComparison);
    }

    // Open Modal button
    const openModalBtn = document.getElementById("openAddProductModalBtn");
    if (openModalBtn) {
      openModalBtn.addEventListener("click", openAddProductModal);
    }

    // Close Modal button
    const closeModalBtn = document.getElementById("closeAddProductModalBtn");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeAddProductModal);
    }

    // Modal backdrop click
    const modal = document.getElementById("addProductModal");
    if (modal) {
      modal.addEventListener("click", e => {
        if (e.target === modal) closeAddProductModal();
      });
    }

    // Escape key closes modal
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeAddProductModal();
    });

    // Modal search input
    const searchInput = document.getElementById("compareModalSearchInput");
    const clearSearchBtn = document.getElementById("clearModalSearchBtn");
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        const val = e.target.value;
        if (clearSearchBtn) clearSearchBtn.style.display = val ? "block" : "none";
        renderModalProductResults(val);
      });
    }

    if (clearSearchBtn && searchInput) {
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        renderModalProductResults("");
        searchInput.focus();
      });
    }

    // Modal category pills
    const catPills = document.getElementById("modalCatPills");
    if (catPills) {
      catPills.addEventListener("click", e => {
        const btn = e.target.closest(".modal-cat-pill");
        if (btn) {
          modalSelectedCategory = btn.dataset.cat || "all";
          updateModalCategoryPills();
          renderModalProductResults(searchInput ? searchInput.value : "");
        }
      });
    }

    // Delegated clicks for table and modal
    document.addEventListener("click", e => {
      // Add Product Slot click
      if (e.target.closest("#addCompareSlotBtn")) {
        openAddProductModal();
        return;
      }

      // Remove product click
      const removeBtn = e.target.closest(".amz-compare-remove-btn");
      if (removeBtn) {
        handleRemoveProduct(removeBtn.dataset.removeId);
        return;
      }

      // Add to cart click
      const addCartBtn = e.target.closest(".amz-btn-add-cart");
      if (addCartBtn) {
        handleAddToCart(addCartBtn.dataset.cartId, addCartBtn);
        return;
      }

      // Buy Now click
      const buyNowBtn = e.target.closest(".amz-btn-buy-now");
      if (buyNowBtn) {
        handleBuyNow(buyNowBtn.dataset.buyId);
        return;
      }

      // Modal Add button
      const modalAddBtn = e.target.closest(".modal-add-btn");
      if (modalAddBtn) {
        addProductToCompare(modalAddBtn.dataset.modalAddId);
        return;
      }

      // Preset cards click
      const presetCard = e.target.closest(".compare-preset-card");
      if (presetCard) {
        loadPreset(presetCard.dataset.preset);
        return;
      }
    });
  }

  // Initialize on DOM Ready
  async function init() {
    await initProductsPool();
    bindEvents();
    renderComparison();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
