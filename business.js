/**
 * ElectroMart Business (B2B Bulk Purchase & GSTIN Portal) - Core Controller
 * Handles 15-digit GSTIN Validation, Bulk Quantity Discount Tiers, RFQ Submissions & Cart Sync
 * Strictly ElectroMart Business Branding (100% Brand Safe)
 */

(function () {
  "use strict";

  // Statutory Indian GST State Code Mapping (01 to 38)
  const GST_STATE_MAP = {
    "01": "Jammu & Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "26": "Dadra & Nagar Haveli and Daman & Diu",
    "27": "Maharashtra",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman & Nicobar Islands",
    "36": "Telangana",
    "37": "Andhra Pradesh",
    "38": "Ladakh"
  };

  // Statutory 15-character Indian GSTIN Regex
  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  // Fallback B2B Products if catalog is loading
  const FALLBACK_B2B_PRODUCTS = [
    {
      id: "b2b-101",
      name: "Commercial Office Laptop 15.6 (Core i5 / 16GB RAM / 512GB SSD)",
      brand: "AstraTech",
      category: "laptop",
      price: 44990,
      listPrice: 58990,
      moq: 5,
      segment: "b2b",
      gstRate: 0.18,
      image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "b2b-102",
      name: "Enterprise Tower Desktop PC (Core i7 / 32GB RAM / 1TB NVMe)",
      brand: "Titan",
      category: "computer",
      price: 52990,
      listPrice: 68990,
      moq: 5,
      segment: "b2b",
      gstRate: 0.18,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "b2b-103",
      name: "Commercial Multi-Function Laser Network Printer",
      brand: "Brother",
      category: "printer",
      price: 26490,
      listPrice: 34990,
      moq: 5,
      segment: "b2b",
      gstRate: 0.18,
      image: "https://images.unsplash.com/photo-1612810806695-30f7a8258391?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "b2b-104",
      name: "Corporate Online Line-Interactive UPS 1500VA",
      brand: "APC",
      category: "accessory",
      price: 13990,
      listPrice: 18990,
      moq: 5,
      segment: "b2b",
      gstRate: 0.18,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "b2b-105",
      name: "Enterprise Wireless Ergonomic Keyboard & Mouse Pack (10 Sets)",
      brand: "Logitech",
      category: "accessory",
      price: 18990,
      listPrice: 24990,
      moq: 5,
      segment: "b2b",
      gstRate: 0.18,
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "b2b-106",
      name: "27-Inch QHD IPS Commercial Display with USB-C Hub",
      brand: "Dell",
      category: "computer",
      price: 24990,
      listPrice: 32990,
      moq: 5,
      segment: "b2b",
      gstRate: 0.18,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // ==========================================
  // 1. TIER DISCOUNT LOGIC
  // ==========================================
  function getTierDiscountRate(qty) {
    const q = Number(qty || 0);
    if (q >= 25) return 0.15; // 15% discount for 25+
    if (q >= 10) return 0.10; // 10% discount for 10-24
    if (q >= 5) return 0.05;  // 5% discount for 5-9
    return 0.00;
  }

  function getTierLabel(qty) {
    const q = Number(qty || 0);
    if (q >= 25) return "15% Tier Discount";
    if (q >= 10) return "10% Tier Discount";
    if (q >= 5) return "5% Tier Discount";
    return "Standard Wholesale";
  }

  // ==========================================
  // 2. GSTIN VERIFICATION CONTROLLER
  // ==========================================
  function initGstinVerification() {
    const gstinInput = document.getElementById("b2bGstinInput");
    const verifyBtn = document.getElementById("b2bVerifyGstinBtn");
    const statusBox = document.getElementById("b2bGstinStatus");
    const companyInput = document.getElementById("b2bCompanyName");
    const typePills = document.querySelectorAll(".b2b-type-pill");

    let selectedType = "Private Ltd / Corporate";

    // Restore saved profile
    try {
      const saved = JSON.parse(localStorage.getItem("electromart_business_profile_v1") || "null");
      if (saved && saved.gstin) {
        if (gstinInput) gstinInput.value = saved.gstin;
        if (companyInput && saved.companyName) companyInput.value = saved.companyName;
        if (statusBox) {
          statusBox.className = "b2b-gstin-status-box active success";
          statusBox.innerHTML = `
            <div><strong>✓ Verified Business:</strong> ${saved.companyName || "Registered Enterprise"} (PAN: ${saved.pan || "Verified"})</div>
            <span class="b2b-state-chip">${saved.state || "India"}</span>
          `;
        }
      }
    } catch (e) {
      console.warn("Could not load business profile", e);
    }

    // Type pills selection
    typePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        typePills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        selectedType = pill.getAttribute("data-type") || pill.textContent.trim();
      });
    });

    // Real-time client-side GSTIN input validation
    if (gstinInput) {
      gstinInput.addEventListener("input", () => {
        const val = (gstinInput.value || "").trim().toUpperCase();
        gstinInput.value = val;

        if (val.length === 15) {
          if (GSTIN_REGEX.test(val)) {
            const stateCode = val.substring(0, 2);
            const stateName = GST_STATE_MAP[stateCode];
            if (stateName) {
              gstinInput.classList.add("valid");
              gstinInput.classList.remove("invalid");
              showStatus(`<div><strong>✓ Valid Format:</strong> Registered in ${stateName} (State Code: ${stateCode})</div><span class="b2b-state-chip">Ready to Verify</span>`, true);
            } else {
              gstinInput.classList.add("invalid");
              gstinInput.classList.remove("valid");
              showStatus(`Invalid State Code (${stateCode}). Indian state code must be between 01 and 38.`, false);
            }
          } else {
            gstinInput.classList.add("invalid");
            gstinInput.classList.remove("valid");
            showStatus("Invalid GSTIN structure. Ensure standard 15-character GSTIN pattern (e.g., 07AAAAA0000A1Z5).", false);
          }
        } else if (val.length > 0) {
          gstinInput.classList.remove("valid");
          gstinInput.classList.remove("invalid");
        }
      });
    }

    if (verifyBtn && gstinInput) {
      verifyBtn.addEventListener("click", () => {
        const rawGstin = (gstinInput.value || "").trim().toUpperCase();
        const companyName = companyInput ? (companyInput.value || "").trim() : "";

        if (!rawGstin) {
          showStatus("Please enter your 15-digit GSTIN.", false);
          gstinInput.focus();
          return;
        }

        if (!GSTIN_REGEX.test(rawGstin)) {
          showStatus("Invalid GSTIN format. Example format: 07AAAAA0000A1Z5 (15 characters).", false);
          gstinInput.classList.add("invalid");
          gstinInput.classList.remove("valid");
          return;
        }

        const stateCode = rawGstin.substring(0, 2);
        const stateName = GST_STATE_MAP[stateCode];
        if (!stateName) {
          showStatus(`Invalid State Code (${stateCode}). State code must be between 01 and 38.`, false);
          gstinInput.classList.add("invalid");
          gstinInput.classList.remove("valid");
          return;
        }

        const pan = rawGstin.substring(2, 12);

        gstinInput.classList.remove("invalid");
        gstinInput.classList.add("valid");

        const profile = {
          gstin: rawGstin,
          companyName: companyName || "Enterprise Client",
          businessType: selectedType,
          state: stateName,
          stateCode: stateCode,
          pan: pan,
          verified: true,
          verifiedAt: new Date().toISOString()
        };

        localStorage.setItem("electromart_business_profile_v1", JSON.stringify(profile));

        showStatus(
          `<div><strong>✓ GSTIN Verified:</strong> ${profile.companyName} (PAN: ${pan})</div><span class="b2b-state-chip">${stateName}</span>`,
          true
        );

        showToast("Business Profile & GSTIN Verified Successfully!");
      });
    }

    function showStatus(html, isSuccess) {
      if (!statusBox) return;
      statusBox.className = `b2b-gstin-status-box active ${isSuccess ? "success" : "error"}`;
      statusBox.innerHTML = html;
    }
  }

  // ==========================================
  // 3. BULK SAVINGS CALCULATOR
  // ==========================================
  function initBulkCalculator() {
    const productSelect = document.getElementById("calcProductSelect");
    const qtyInput = document.getElementById("calcQtyInput");
    const minusBtn = document.getElementById("calcMinusBtn");
    const plusBtn = document.getElementById("calcPlusBtn");

    const basePriceEl = document.getElementById("calcBasePrice");
    const retailTotalEl = document.getElementById("calcRetailTotal");
    const discountAmountEl = document.getElementById("calcDiscountAmount");
    const discountedTotalEl = document.getElementById("calcDiscountedTotal");
    const itcSavingsEl = document.getElementById("calcItcSavings");
    const netCostEl = document.getElementById("calcNetCost");
    const totalSavingsEl = document.getElementById("calcTotalSavings");
    const tierBadgeEl = document.getElementById("calcTierBadge");

    if (!productSelect || !qtyInput) return;

    // Populate products
    const b2bList = getB2bCatalog();
    productSelect.innerHTML = "";
    b2bList.forEach((prod) => {
      const opt = document.createElement("option");
      opt.value = prod.id;
      opt.textContent = `${prod.name} (₹${prod.price.toLocaleString("en-IN")})`;
      opt.setAttribute("data-price", prod.price);
      opt.setAttribute("data-gstrate", prod.gstRate || 0.18);
      opt.setAttribute("data-moq", prod.moq || 5);
      productSelect.appendChild(opt);
    });

    function recalculate() {
      const selectedOpt = productSelect.options[productSelect.selectedIndex];
      if (!selectedOpt) return;

      const unitPrice = Number(selectedOpt.getAttribute("data-price") || 1000);
      const gstRate = Number(selectedOpt.getAttribute("data-gstrate") || 0.18);
      const minMoq = Number(selectedOpt.getAttribute("data-moq") || 5);

      let qty = parseInt(qtyInput.value, 10);
      if (isNaN(qty) || qty < minMoq) {
        qty = minMoq;
        qtyInput.value = qty;
      }

      const tierDiscountRate = getTierDiscountRate(qty);
      const retailTotal = unitPrice * qty;
      const discountAmount = Math.round(retailTotal * tierDiscountRate);
      const discountedSubtotal = retailTotal - discountAmount;
      const itcSavings = Math.round(discountedSubtotal * gstRate);
      const netEffectiveCost = discountedSubtotal; // Total paid is subtotal, but ITC of 18%/28% is reclaimable in GST returns
      const totalBusinessBenefit = discountAmount + itcSavings;

      if (basePriceEl) basePriceEl.textContent = `₹${unitPrice.toLocaleString("en-IN")}`;
      if (retailTotalEl) retailTotalEl.textContent = `₹${retailTotal.toLocaleString("en-IN")}`;
      if (discountAmountEl) discountAmountEl.textContent = `- ₹${discountAmount.toLocaleString("en-IN")} (${tierDiscountRate * 100}%)`;
      if (discountedTotalEl) discountedTotalEl.textContent = `₹${discountedSubtotal.toLocaleString("en-IN")}`;
      if (itcSavingsEl) itcSavingsEl.textContent = `₹${itcSavings.toLocaleString("en-IN")} (${gstRate * 100}% ITC)`;
      if (netCostEl) netCostEl.textContent = `₹${discountedSubtotal.toLocaleString("en-IN")}`;
      if (totalSavingsEl) totalSavingsEl.textContent = `₹${totalBusinessBenefit.toLocaleString("en-IN")}`;
      if (tierBadgeEl) tierBadgeEl.textContent = getTierLabel(qty);
    }

    productSelect.addEventListener("change", recalculate);
    qtyInput.addEventListener("input", recalculate);
    qtyInput.addEventListener("change", recalculate);

    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        const selectedOpt = productSelect.options[productSelect.selectedIndex];
        const minMoq = selectedOpt ? Number(selectedOpt.getAttribute("data-moq") || 5) : 5;
        let val = parseInt(qtyInput.value, 10) || minMoq;
        if (val > minMoq) {
          qtyInput.value = val - 1;
          recalculate();
        }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        let val = parseInt(qtyInput.value, 10) || 5;
        qtyInput.value = val + 1;
        recalculate();
      });
    }

    const calcAddToCartBtn = document.getElementById("calcAddToCartBtn");
    if (calcAddToCartBtn) {
      calcAddToCartBtn.addEventListener("click", () => {
        const prodId = productSelect.value;
        const qty = parseInt(qtyInput.value, 10) || 5;
        addBulkItemToCart(prodId, qty);
      });
    }

    recalculate();
  }

  // ==========================================
  // 4. B2B PRODUCTS CATALOG & ADD TO CART
  // ==========================================
  function getB2bCatalog() {
    if (window.EM_CATALOG && Array.isArray(window.EM_CATALOG) && window.EM_CATALOG.length > 0) {
      const b2bItems = window.EM_CATALOG.filter(
        (p) => String(p.segment || "").toLowerCase() === "b2b" || (p.moq && p.moq >= 2)
      );
      if (b2bItems.length >= 4) {
        return b2bItems;
      }
    }
    return FALLBACK_B2B_PRODUCTS;
  }

  function renderB2bProducts() {
    const grid = document.getElementById("b2bProductsGrid");
    if (!grid) return;

    const catalog = getB2bCatalog();
    grid.innerHTML = "";

    catalog.forEach((prod) => {
      const card = document.createElement("article");
      card.className = "b2b-product-card";
      const moq = prod.moq || 5;
      const listPrice = prod.listPrice || Math.round(prod.price * 1.25);
      const tier5Price = Math.round(prod.price * 0.95);

      card.innerHTML = `
        <span class="b2b-product-moq-badge">MOQ: ${moq} Units</span>
        <div class="b2b-product-img-wrap">
          <img src="${prod.image}" alt="${prod.name}" class="b2b-product-img" loading="lazy" onerror="this.src='product-placeholder.svg'" />
        </div>
        <h3 class="b2b-product-title">${prod.name}</h3>
        <div class="b2b-product-pricing">
          <span class="b2b-retail-price">M.R.P.: ₹${listPrice.toLocaleString("en-IN")}</span>
          <span class="b2b-wholesale-price">₹${prod.price.toLocaleString("en-IN")} <small style="font-size:12px;color:#565959;font-weight:400;">/ unit</small></span>
          <span style="font-size:12px;color:#cc0c39;font-weight:700;">From ₹${tier5Price.toLocaleString("en-IN")} at 5+ units</span>
          <span class="b2b-itc-tag">✓ GST Input Tax Credit Eligible</span>
        </div>
        <button type="button" class="b2b-btn-primary add-bulk-cart-btn" data-product-id="${prod.id}" data-moq="${moq}">
          Add MOQ (${moq} Units) to Cart
        </button>
      `;

      grid.appendChild(card);
    });

    // Bind Add to Cart buttons
    grid.querySelectorAll(".add-bulk-cart-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prodId = btn.getAttribute("data-product-id");
        const moq = parseInt(btn.getAttribute("data-moq"), 10) || 5;
        addBulkItemToCart(prodId, moq);
      });
    });
  }

  function addBulkItemToCart(productId, quantity) {
    const catalog = getB2bCatalog();
    const product = catalog.find((p) => String(p.id) === String(productId)) || FALLBACK_B2B_PRODUCTS[0];
    const qty = Math.max(product.moq || 5, Number(quantity || 5));
    const tierRate = getTierDiscountRate(qty);
    const unitPrice = Math.round(product.price * (1 - tierRate));

    // 1. Sync with electromart_cart_v1 map { [productId]: qty }
    let cartMap = {};
    try {
      const raw = localStorage.getItem("electromart_cart_v1");
      const parsed = raw ? JSON.parse(raw) : {};
      cartMap = typeof parsed === "object" && !Array.isArray(parsed) && parsed ? parsed : {};
    } catch (e) {
      cartMap = {};
    }

    const currentQty = Number(cartMap[String(product.id)] || 0);
    const updatedQty = currentQty + qty;
    cartMap[String(product.id)] = updatedQty;
    localStorage.setItem("electromart_cart_v1", JSON.stringify(cartMap));

    // 2. Sync with electromart_catalog_v1 map so cart.js getCatalogProduct works seamlessly
    let catalogMap = {};
    try {
      const rawCat = localStorage.getItem("electromart_catalog_v1");
      const parsedCat = rawCat ? JSON.parse(rawCat) : {};
      catalogMap = typeof parsedCat === "object" && !Array.isArray(parsedCat) && parsedCat ? parsedCat : {};
    } catch (e) {
      catalogMap = {};
    }

    catalogMap[String(product.id)] = {
      id: String(product.id),
      name: product.name,
      price: unitPrice,
      originalPrice: product.price,
      image: product.image,
      stock: 100,
      segment: "b2b",
      moq: product.moq || 5,
      gstRate: product.gstRate || 0.18,
      category: product.category || "Commercial"
    };
    localStorage.setItem("electromart_catalog_v1", JSON.stringify(catalogMap));

    // 3. Sync with electromart_b2b_cart_meta_v1 map
    let b2bMeta = {};
    try {
      const rawMeta = localStorage.getItem("electromart_b2b_cart_meta_v1");
      const parsedMeta = rawMeta ? JSON.parse(rawMeta) : {};
      b2bMeta = typeof parsedMeta === "object" && !Array.isArray(parsedMeta) && parsedMeta ? parsedMeta : {};
    } catch (e) {
      b2bMeta = {};
    }

    b2bMeta[String(product.id)] = {
      tier: getTierLabel(updatedQty),
      unitPrice: unitPrice,
      originalPrice: product.price,
      itcEligible: true,
      moq: product.moq || 5
    };
    localStorage.setItem("electromart_b2b_cart_meta_v1", JSON.stringify(b2bMeta));

    // 4. Sync header cart badge
    if (typeof window.syncHeaderCartCount === "function") {
      window.syncHeaderCartCount();
    } else {
      const badge = document.getElementById("cartCount");
      if (badge) {
        const totalItems = Object.values(cartMap).reduce((sum, q) => sum + (Number(q) || 0), 0);
        badge.textContent = totalItems;
      }
    }

    // 5. Dispatch cart updated event
    try {
      window.dispatchEvent(new Event("storage"));
      document.dispatchEvent(new CustomEvent("cart:updated", { detail: { productId, qty: updatedQty } }));
    } catch (e) {
      // Ignored
    }

    showToast(`Added ${qty} units of ${product.name} to Cart with ${getTierLabel(updatedQty)}!`);
  }

  // ==========================================
  // 5. RFQ (REQUEST FOR QUOTE) CONTROLLER
  // ==========================================
  function initRfqModal() {
    const openBtn = document.getElementById("openRfqModalBtn");
    const overlay = document.getElementById("rfqModalOverlay");
    const closeBtn = document.getElementById("closeRfqModalBtn");
    const rfqForm = document.getElementById("rfqForm");

    if (!overlay) return;

    function openModal() {
      overlay.classList.add("open");
      // Auto-focus first field
      const firstInput = document.getElementById("rfqProductSelect");
      if (firstInput) firstInput.focus();
    }

    function closeModal() {
      overlay.classList.remove("open");
    }

    if (openBtn) {
      openBtn.addEventListener("click", openModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    // Close on overlay backdrop click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) {
        closeModal();
      }
    });

    // Handle RFQ Form submission
    if (rfqForm) {
      rfqForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const hardware = document.getElementById("rfqProductSelect").value;
        const qty = parseInt(document.getElementById("rfqQtyInput").value, 10);
        const company = (document.getElementById("rfqCompanyName").value || "").trim();
        const gstin = (document.getElementById("rfqGstinInput").value || "").trim();
        const email = (document.getElementById("rfqEmailInput").value || "").trim();
        const phone = (document.getElementById("rfqPhoneInput").value || "").trim();
        const city = (document.getElementById("rfqCityInput").value || "").trim();

        if (!company || !email || !phone || isNaN(qty) || qty < 5) {
          alert("Please fill in all required fields (Minimum 5 units).");
          return;
        }

        const rfqId = `EM-RFQ-${Math.floor(100000 + Math.random() * 900000)}`;
        const rfqRecord = {
          rfqId: rfqId,
          hardware: hardware,
          quantity: qty,
          company: company,
          gstin: gstin,
          email: email,
          phone: phone,
          city: city,
          status: "Under Review",
          submittedAt: new Date().toISOString()
        };

        // Persist RFQ list
        try {
          const existing = JSON.parse(localStorage.getItem("electromart_rfq_requests_v1") || "[]");
          existing.unshift(rfqRecord);
          localStorage.setItem("electromart_rfq_requests_v1", JSON.stringify(existing));
        } catch (err) {
          console.warn("Could not persist RFQ record", err);
        }

        closeModal();
        rfqForm.reset();
        showToast(`Quote Request Generated! Tracking ID: ${rfqId}`);
      });
    }
  }

  // ==========================================
  // 6. TOAST FEEDBACK NOTIFIER
  // ==========================================
  function showToast(message) {
    let toast = document.getElementById("b2bToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "b2bToast";
      toast.className = "b2b-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("active");
    setTimeout(() => {
      toast.classList.remove("active");
    }, 4500);
  }

  // ==========================================
  // INITIALIZATION ON DOM READY
  // ==========================================
  function initB2bPortal() {
    initGstinVerification();
    initBulkCalculator();
    renderB2bProducts();
    initRfqModal();

    // Re-render when language bus triggers
    document.addEventListener("electromart-lang-changed", () => {
      renderB2bProducts();
    });
  }

  // Expose API on window for testing and external integrations
  if (typeof window !== "undefined") {
    window.ElectroMartBusiness = {
      GST_STATE_MAP,
      GSTIN_REGEX,
      getTierDiscountRate,
      getTierLabel,
      getB2bCatalog,
      addBulkItemToCart,
      initB2bPortal
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initB2bPortal);
  } else {
    initB2bPortal();
  }
})();
