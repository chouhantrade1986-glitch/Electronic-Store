/**
 * Phase 31: ElectroMart Certified Renewed Electronics Hub Logic (renewed.js)
 */

(function () {
  "use strict";

  // Renewed Catalog Database (24+ High-Demand Products)
  const RENEWED_CATALOG = [
    // Smartphones
    {
      id: "renewed_iphone_14_pro",
      baseProductId: "product_1773480601001",
      name: "Apple iPhone 14 Pro (128 GB) - Space Black",
      category: "smartphones",
      brand: "Apple",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 94,
      renewedPrice: 79999,
      originalMrp: 129900,
      savingsPercent: 38,
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 384,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_galaxy_s23_ultra",
      baseProductId: "product_1773480601002",
      name: "Samsung Galaxy S23 Ultra 5G (256 GB) - Phantom Black",
      category: "smartphones",
      brand: "Samsung",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 92,
      renewedPrice: 74999,
      originalMrp: 124999,
      savingsPercent: 40,
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 295,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_iphone_13",
      baseProductId: "product_1773480601011",
      name: "Apple iPhone 13 (128 GB) - Midnight",
      category: "smartphones",
      brand: "Apple",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 88,
      renewedPrice: 42999,
      originalMrp: 69900,
      savingsPercent: 39,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 512,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_oneplus_11",
      baseProductId: "product_1773480601012",
      name: "OnePlus 11 5G (16GB RAM / 256GB Storage) - Titan Black",
      category: "smartphones",
      brand: "OnePlus",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 95,
      renewedPrice: 38999,
      originalMrp: 61999,
      savingsPercent: 37,
      image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
      rating: 4.4,
      reviewCount: 188,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_iphone_12",
      baseProductId: "product_1773480601013",
      name: "Apple iPhone 12 (64 GB) - Blue",
      category: "smartphones",
      brand: "Apple",
      renewedGrade: "C",
      gradeLabel: "Grade C (Good / Value)",
      batteryHealth: 83,
      renewedPrice: 28999,
      originalMrp: 54900,
      savingsPercent: 47,
      image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=800&q=80",
      rating: 4.3,
      reviewCount: 420,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_galaxy_a54",
      baseProductId: "product_1773480601014",
      name: "Samsung Galaxy A54 5G (128 GB) - Awesome Graphite",
      category: "smartphones",
      brand: "Samsung",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 87,
      renewedPrice: 21999,
      originalMrp: 38999,
      savingsPercent: 44,
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
      rating: 4.4,
      reviewCount: 156,
      warranty: "6 Months ElectroMart Warranty"
    },

    // Laptops
    {
      id: "renewed_macbook_air_m1",
      baseProductId: "product_1773480601021",
      name: "Apple MacBook Air 13.3\" M1 Chip (8GB RAM / 256GB SSD) - Space Gray",
      category: "laptops",
      brand: "Apple",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 93,
      renewedPrice: 54999,
      originalMrp: 99900,
      savingsPercent: 45,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 640,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_macbook_pro_14_m2",
      baseProductId: "product_1773480601022",
      name: "Apple MacBook Pro 14\" M2 Pro (16GB RAM / 512GB SSD) - Silver",
      category: "laptops",
      brand: "Apple",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 96,
      renewedPrice: 129999,
      originalMrp: 199900,
      savingsPercent: 35,
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 198,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_dell_xps_15",
      baseProductId: "product_1773480601023",
      name: "Dell XPS 15 9520 (Intel Core i7 12th Gen / 16GB / 512GB SSD / RTX 3050)",
      category: "laptops",
      brand: "Dell",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 91,
      renewedPrice: 89999,
      originalMrp: 145000,
      savingsPercent: 38,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 142,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_lenovo_thinkpad_x1",
      baseProductId: "product_1773480601024",
      name: "Lenovo ThinkPad X1 Carbon Gen 9 (Core i7 / 16GB / 512GB SSD)",
      category: "laptops",
      brand: "Lenovo",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 86,
      renewedPrice: 59999,
      originalMrp: 119990,
      savingsPercent: 50,
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 165,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_hp_spectre_x360",
      baseProductId: "product_1773480601025",
      name: "HP Spectre x360 2-in-1 Touch Laptop (Intel Core i7 / 16GB / 1TB SSD)",
      category: "laptops",
      brand: "HP",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 88,
      renewedPrice: 72999,
      originalMrp: 135000,
      savingsPercent: 46,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 98,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_asus_zenbook_14",
      baseProductId: "product_1773480601026",
      name: "ASUS ZenBook 14 OLED (Ryzen 7 / 16GB / 512GB SSD) - Ponder Blue",
      category: "laptops",
      brand: "Asus",
      renewedGrade: "C",
      gradeLabel: "Grade C (Good / Value)",
      batteryHealth: 84,
      renewedPrice: 46999,
      originalMrp: 82990,
      savingsPercent: 43,
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
      rating: 4.3,
      reviewCount: 112,
      warranty: "6 Months ElectroMart Warranty"
    },

    // Tablets & iPads
    {
      id: "renewed_ipad_pro_11",
      baseProductId: "product_1773480601031",
      name: "Apple iPad Pro 11-inch M1 (128 GB, Wi-Fi) - Space Gray",
      category: "tablets",
      brand: "Apple",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 95,
      renewedPrice: 48999,
      originalMrp: 71900,
      savingsPercent: 32,
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 310,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_ipad_air_5",
      baseProductId: "product_1773480601032",
      name: "Apple iPad Air 5th Gen M1 (64 GB, Wi-Fi) - Blue",
      category: "tablets",
      brand: "Apple",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 93,
      renewedPrice: 38999,
      originalMrp: 59900,
      savingsPercent: 35,
      image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 248,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_galaxy_tab_s8",
      baseProductId: "product_1773480601033",
      name: "Samsung Galaxy Tab S8 11.0\" (128GB, Wi-Fi + S-Pen) - Graphite",
      category: "tablets",
      brand: "Samsung",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 89,
      renewedPrice: 36999,
      originalMrp: 58999,
      savingsPercent: 37,
      image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 135,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_ipad_10th_gen",
      baseProductId: "product_1773480601034",
      name: "Apple iPad 10th Gen (64 GB, Wi-Fi) - Silver",
      category: "tablets",
      brand: "Apple",
      renewedGrade: "C",
      gradeLabel: "Grade C (Good / Value)",
      batteryHealth: 84,
      renewedPrice: 27999,
      originalMrp: 39900,
      savingsPercent: 30,
      image: "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80",
      rating: 4.4,
      reviewCount: 175,
      warranty: "6 Months ElectroMart Warranty"
    },

    // Audio & Wearables
    {
      id: "renewed_sony_wh1000xm5",
      baseProductId: "product_1773480601041",
      name: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones - Black",
      category: "audio",
      brand: "Sony",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 96,
      renewedPrice: 19999,
      originalMrp: 34990,
      savingsPercent: 43,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 420,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_bose_qc45",
      baseProductId: "product_1773480601042",
      name: "Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones",
      category: "audio",
      brand: "Bose",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 94,
      renewedPrice: 17999,
      originalMrp: 29900,
      savingsPercent: 40,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 280,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_airpods_pro_2",
      baseProductId: "product_1773480601043",
      name: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
      category: "audio",
      brand: "Apple",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 95,
      renewedPrice: 14999,
      originalMrp: 24900,
      savingsPercent: 40,
      image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 750,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_apple_watch_series_8",
      baseProductId: "product_1773480601044",
      name: "Apple Watch Series 8 GPS 45mm Aluminium Case - Midnight",
      category: "audio",
      brand: "Apple",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 88,
      renewedPrice: 24999,
      originalMrp: 48900,
      savingsPercent: 49,
      image: "https://images.unsplash.com/photo-1509741102003-ca64bfe5f099?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 312,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_galaxy_watch_5_pro",
      baseProductId: "product_1773480601045",
      name: "Samsung Galaxy Watch 5 Pro Bluetooth 45mm - Black Titanium",
      category: "audio",
      brand: "Samsung",
      renewedGrade: "A",
      gradeLabel: "Grade A (Premium / Excellent)",
      batteryHealth: 92,
      renewedPrice: 18999,
      originalMrp: 44999,
      savingsPercent: 58,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 190,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_airpods_max",
      baseProductId: "product_1773480601046",
      name: "Apple AirPods Max Wireless Over-Ear Headphones - Space Gray",
      category: "audio",
      brand: "Apple",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 87,
      renewedPrice: 34999,
      originalMrp: 59900,
      savingsPercent: 42,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 220,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_sony_wh1000xm4",
      baseProductId: "product_1773480601047",
      name: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones - Silver",
      category: "audio",
      brand: "Sony",
      renewedGrade: "C",
      gradeLabel: "Grade C (Good / Value)",
      batteryHealth: 82,
      renewedPrice: 13999,
      originalMrp: 29990,
      savingsPercent: 53,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      rating: 4.4,
      reviewCount: 510,
      warranty: "6 Months ElectroMart Warranty"
    },
    {
      id: "renewed_pixel_7_pro",
      baseProductId: "product_1773480601015",
      name: "Google Pixel 7 Pro 5G (128 GB) - Obsidian",
      category: "smartphones",
      brand: "Google",
      renewedGrade: "B",
      gradeLabel: "Grade B (Very Good)",
      batteryHealth: 89,
      renewedPrice: 32999,
      originalMrp: 69999,
      savingsPercent: 53,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 235,
      warranty: "6 Months ElectroMart Warranty"
    }
  ];

  function resolveRenewedTaxProfile(product) {
    const searchable = `${product.category || ""} ${product.name || ""}`.toLowerCase();
    const isDisplay = /(^|\s)(tv|television|monitor|display)(\s|$)/.test(searchable);
    return isDisplay ? { hsnCode: "85287200", gstRate: 0.28 } : { hsnCode: "84713010", gstRate: 0.18 };
  }

  // Expose to window & module for PDP alternative cross-linking and tests
  if (typeof window !== "undefined") {
    window.ELECTROMART_RENEWED_CATALOG = RENEWED_CATALOG;
  }
  if (typeof module !== "undefined" && module.exports) {
  module.exports = { RENEWED_CATALOG, resolveRenewedTaxProfile };
  }

  // State
  const state = {
    selectedCategory: "all",
    selectedGrade: "all",
    ecoDeviceType: "phone"
  };

  // Eco impact constants
  const ECO_DATA = {
    phone: { ewaste: "0.18 kg", carbon: "65 kg CO₂", trees: "3 Trees" },
    laptop: { ewaste: "2.20 kg", carbon: "280 kg CO₂", trees: "14 Trees" },
    tablet: { ewaste: "0.55 kg", carbon: "110 kg CO₂", trees: "5 Trees" },
    audio: { ewaste: "0.12 kg", carbon: "35 kg CO₂", trees: "2 Trees" }
  };

  function formatCurrency(val) {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(val));
  }

  function initEcoCalculator() {
    const pills = document.querySelectorAll(".eco-pill");
    const ewasteEl = document.getElementById("calcEwasteSaved");
    const carbonEl = document.getElementById("calcCarbonSaved");
    const treesEl = document.getElementById("calcTreesEquiv");

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const type = pill.dataset.type || "phone";
        state.ecoDeviceType = type;

        const data = ECO_DATA[type] || ECO_DATA.phone;
        if (ewasteEl) ewasteEl.textContent = data.ewaste;
        if (carbonEl) carbonEl.textContent = data.carbon;
        if (treesEl) treesEl.textContent = data.trees;
      });
    });
  }

  function initFilters() {
    const catBtns = document.querySelectorAll("#renewedCategoryPills .renewed-filter-btn");
    catBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        catBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedCategory = btn.dataset.category || "all";
        renderProducts();
      });
    });

    const gradeBtns = document.querySelectorAll("#renewedGradeFilterChips .grade-chip");
    gradeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        gradeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.selectedGrade = btn.dataset.grade || "all";
        renderProducts();
      });
    });
  }

  function renderProducts() {
    const grid = document.getElementById("renewedProductsGrid");
    if (!grid) return;

    const filtered = RENEWED_CATALOG.filter((item) => {
      const matchCat = state.selectedCategory === "all" || item.category === state.selectedCategory;
      const matchGrade = state.selectedGrade === "all" || item.renewedGrade === state.selectedGrade;
      return matchCat && matchGrade;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: #fff; border-radius: 8px;">
          <p style="font-size: 16px; color: #565959;">No certified renewed devices found for this selection.</p>
          <button type="button" style="background:#0f1111;color:#fff;border:none;padding:8px 18px;border-radius:20px;cursor:pointer;" onclick="window.resetRenewedFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((item) => {
      return `
        <article class="renewed-product-card" data-id="${item.id}" data-category="${item.category}" data-grade="${item.renewedGrade}">
          <div class="card-top-badges">
            <span class="product-grade-badge grade-${item.renewedGrade}">Grade ${item.renewedGrade} (${item.renewedGrade === 'A' ? 'Excellent' : item.renewedGrade === 'B' ? 'Very Good' : 'Good'})</span>
            <span class="product-battery-badge">🔋 ${item.batteryHealth}% Battery</span>
          </div>

          <div class="renewed-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
          </div>

          <h3 class="renewed-product-title" title="${item.name}">[Certified Renewed] ${item.name}</h3>

          <div class="renewed-rating-row">
            <span class="renewed-stars">★★★★★</span>
            <span class="renewed-review-count">(${item.reviewCount})</span>
          </div>

          <div class="renewed-price-stack">
            <div class="renewed-price-row">
              <span class="renewed-price-val">₹${formatCurrency(item.renewedPrice)}</span>
              <span class="renewed-mrp-val">₹${formatCurrency(item.originalMrp)}</span>
            </div>
            <span class="renewed-savings-pill">Save ₹${formatCurrency(item.originalMrp - item.renewedPrice)} (${item.savingsPercent}% off)</span>
          </div>

          <div class="renewed-trust-tags">
            <div>🛡️ <strong>6 Months</strong> Comprehensive Warranty</div>
            <div>🔄 <strong>7 Days</strong> Replacement Guarantee</div>
          </div>

          <div class="renewed-actions-row">
            <button type="button" class="btn-renewed-cart" data-action="add-renewed" data-id="${item.id}">
              Add to Cart
            </button>
            <a href="product-detail.html?id=${item.baseProductId}&renewed=true&grade=${item.renewedGrade}" class="btn-renewed-view">
              Details
            </a>
          </div>
        </article>
      `;
    }).join("");

    // Bind Add to Cart buttons
    grid.querySelectorAll('[data-action="add-renewed"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.id;
        const targetProd = RENEWED_CATALOG.find((p) => p.id === prodId);
        if (targetProd) {
          addRenewedToCart(targetProd, btn);
        }
      });
    });
  }

  function addRenewedToCart(product, btn) {
    const CART_KEY = "electromart_cart_v1";
    const CATALOG_KEY = "electromart_catalog_v1";
    let cartMap = {};
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && item.id) {
            cartMap[item.id] = (cartMap[item.id] || 0) + (item.quantity || 1);
          }
        });
      } else if (typeof parsed === "object" && parsed) {
        cartMap = parsed;
      }
    } catch (e) {
      cartMap = {};
    }

    cartMap[product.id] = (Number(cartMap[product.id]) || 0) + 1;

    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartMap));
    } catch (e) {}

    // Cache metadata in CATALOG_KEY for seamless cart/checkout/invoice sync
    try {
      const rawCat = localStorage.getItem(CATALOG_KEY);
      const catMap = rawCat ? JSON.parse(rawCat) : {};
      catMap[product.id] = {
        id: product.id,
        name: `[Certified Renewed - Grade ${product.renewedGrade}] ${product.name}`,
        price: Number(product.renewedPrice || 0),
        listPrice: Number(product.originalMrp || 0),
        image: product.image,
        stock: 10,
        isRenewed: true,
        renewedGrade: product.renewedGrade,
        gradeLabel: product.gradeLabel,
        batteryHealth: product.batteryHealth,
        warrantyDuration: "6 Months",
        hsnCode: resolveRenewedTaxProfile(product).hsnCode,
        gstRate: resolveRenewedTaxProfile(product).gstRate
      };
      localStorage.setItem(CATALOG_KEY, JSON.stringify(catMap));
    } catch (e) {}

    try {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch (e) {}

    // Visual button feedback
    const origText = btn.textContent;
    btn.textContent = "✓ Added to Cart";
    btn.style.background = "#059669";
    btn.style.color = "#ffffff";
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = "";
      btn.style.color = "";
    }, 1800);

    // Update header cart badge
    if (typeof window.updateCartBadge === "function") {
      window.updateCartBadge();
    }
  }

  if (typeof window !== "undefined") {
    window.resetRenewedFilters = function () {
      state.selectedCategory = "all";
      state.selectedGrade = "all";
      document.querySelectorAll("#renewedCategoryPills .renewed-filter-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.category === "all");
      });
      document.querySelectorAll("#renewedGradeFilterChips .grade-chip").forEach((b) => {
        b.classList.toggle("active", b.dataset.grade === "all");
      });
      renderProducts();
    };
  }

  // Lifecycle initialization
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      initEcoCalculator();
      initFilters();
      renderProducts();
    });
  }
})();
