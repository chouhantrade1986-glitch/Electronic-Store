/**
 * ElectroMart — Dedicated Coupons & Promo Deals Hub
 * Phase 47: Amazon Coupons Hub Style Ticket Cards & Clipping Engine
 */

(function () {
  "use strict";

  const CLIPPED_STORAGE_KEY = "electromart_clipped_coupons_v1";

  const COUPONS_DATA = [
    {
      code: "SAVE10",
      headline: "10% OFF",
      typeBadge: "Percentage Discount",
      title: "10% Instant Discount",
      description: "Get 10% instant discount up to ₹500 on all electronics orders above ₹500.",
      category: "all",
      minSpend: 500,
      maxDiscount: 500,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html"
    },
    {
      code: "FREESHIP",
      headline: "FREE SHIPPING",
      typeBadge: "Shipping Offer",
      title: "Zero Delivery Fee",
      description: "Enjoy completely free standard doorstep delivery on your order with no minimum spend.",
      category: "all",
      minSpend: 0,
      maxDiscount: 19,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html"
    },
    {
      code: "WELCOME250",
      headline: "₹250 FLAT OFF",
      typeBadge: "Flat Discount",
      title: "₹250 Savings Voucher",
      description: "Save flat ₹250 on electronics purchases of ₹2,000 or more.",
      category: "all",
      minSpend: 2000,
      maxDiscount: 250,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html"
    },
    {
      code: "ELECTRO500",
      headline: "₹500 FLAT OFF",
      typeBadge: "Mega Deal",
      title: "₹500 Big Electronics Savings",
      description: "Flat ₹500 discount when you purchase electronics worth ₹5,000 or more.",
      category: "all",
      minSpend: 5000,
      maxDiscount: 500,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html"
    },
    {
      code: "AUDIO15",
      headline: "15% OFF",
      typeBadge: "Audio Exclusive",
      title: "15% Off Audio Gear",
      description: "Save 15% up to ₹750 on premium wireless headphones, true wireless earbuds, and party speakers.",
      category: "audio",
      minSpend: 1500,
      maxDiscount: 750,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html?category=Audio"
    },
    {
      code: "LAPTOP1000",
      headline: "₹1,000 OFF",
      typeBadge: "Computing Special",
      title: "₹1,000 Off Laptops & PCs",
      description: "Flat ₹1,000 discount on flagship laptops, desktops, and creator workstations above ₹25,000.",
      category: "laptops",
      minSpend: 25000,
      maxDiscount: 1000,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html?category=Laptops"
    },
    {
      code: "TECH100",
      headline: "₹100 OFF",
      typeBadge: "Accessories Offer",
      title: "₹100 Off Peripherals",
      description: "Save ₹100 on fast chargers, GaN adapters, cables, and gaming peripherals above ₹999.",
      category: "accessories",
      minSpend: 999,
      maxDiscount: 100,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html?category=Accessories"
    },
    {
      code: "PRIMEEXTRA",
      headline: "₹300 BONUS",
      typeBadge: "Rewards Special",
      title: "Extra ₹300 Cart Bonus",
      description: "Additional ₹300 cart discount automatically applied on orders above ₹3,500.",
      category: "all",
      minSpend: 3500,
      maxDiscount: 300,
      expiry: "31 Dec 2026",
      eligibleUrl: "products.html"
    }
  ];

  let currentCategory = "all";
  let searchQuery = "";
  let toastTimer = null;

  // Local Storage helpers for clipped coupons
  function getClippedCoupons() {
    try {
      const raw = localStorage.getItem(CLIPPED_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveClippedCoupons(codes) {
    try {
      localStorage.setItem(CLIPPED_STORAGE_KEY, JSON.stringify(codes));
    } catch (e) {
      // ignore
    }
  }

  function isCouponClipped(code) {
    const list = getClippedCoupons();
    return list.includes(String(code).toUpperCase());
  }

  function toggleCouponClip(code) {
    const normalized = String(code).toUpperCase();
    const list = getClippedCoupons();
    const index = list.indexOf(normalized);
    let clippedNow = false;

    if (index >= 0) {
      list.splice(index, 1);
      clippedNow = false;
      showToast(`Coupon ${normalized} unclipped.`);
    } else {
      list.push(normalized);
      clippedNow = true;
      showToast(`✓ Coupon ${normalized} clipped! It will auto-apply at checkout.`);
    }

    saveClippedCoupons(list);
    updateClippedSummary();
    renderCoupons();
    return clippedNow;
  }

  function clearAllClippedCoupons() {
    saveClippedCoupons([]);
    updateClippedSummary();
    renderCoupons();
    showToast("All clipped coupons cleared.");
  }

  function copyCouponCode(code) {
    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Code "${code}" copied to clipboard!`);
      }).catch(() => {
        showToast(`Coupon code: ${code}`);
      });
    } else {
      showToast(`Coupon code: ${code}`);
    }
  }

  function showToast(message) {
    const toast = document.getElementById("couponToast");
    const msgEl = document.getElementById("couponToastMsg");
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  function updateClippedSummary() {
    const banner = document.getElementById("clippedSummaryBanner");
    const textEl = document.getElementById("clippedSummaryText");
    const statEl = document.getElementById("clippedCouponsStat");
    const clipped = getClippedCoupons();

    if (statEl) {
      statEl.textContent = String(clipped.length);
    }

    if (!banner || !textEl) return;

    if (clipped.length > 0) {
      banner.hidden = false;
      textEl.textContent = `You have ${clipped.length} coupon${clipped.length > 1 ? "s" : ""} clipped (${clipped.join(", ")}). Ready to auto-apply at checkout!`;
    } else {
      banner.hidden = true;
    }
  }

  function filterCoupons() {
    return COUPONS_DATA.filter((coupon) => {
      const matchCategory = currentCategory === "all" || coupon.category === currentCategory || coupon.category === "all";
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        coupon.code.toLowerCase().includes(q) ||
        coupon.title.toLowerCase().includes(q) ||
        coupon.description.toLowerCase().includes(q) ||
        coupon.headline.toLowerCase().includes(q)
      );
      return matchCategory && matchSearch;
    });
  }

  function renderCoupons() {
    const grid = document.getElementById("couponsGrid");
    const emptyState = document.getElementById("couponsEmptyState");
    if (!grid) return;

    const filtered = filterCoupons();

    if (filtered.length === 0) {
      grid.innerHTML = "";
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    grid.innerHTML = filtered.map((c) => {
      const clipped = isCouponClipped(c.code);
      return `
        <article class="coupon-ticket" data-code="${c.code}" id="couponCard-${c.code}">
          <div class="coupon-ticket-header">
            <span class="coupon-category-tag">${escapeHtml(c.category.toUpperCase())}</span>
            <div class="coupon-discount-headline">
              <span>${escapeHtml(c.headline)}</span>
              <span class="coupon-type-badge">${escapeHtml(c.typeBadge)}</span>
            </div>
            <h3 class="coupon-title">${escapeHtml(c.title)}</h3>
            <p class="coupon-description">${escapeHtml(c.description)}</p>
          </div>

          <div class="coupon-tear-line"></div>

          <div class="coupon-ticket-footer">
            <div class="coupon-meta-row">
              <span class="coupon-code-pill" title="Click to copy code" data-action="copy" data-code="${c.code}">
                ${c.code} &#128203;
              </span>
              <span>Min spend: ₹${c.minSpend.toLocaleString("en-IN")}</span>
            </div>

            <div class="coupon-action-row">
              <button
                type="button"
                class="btn-clip-coupon ${clipped ? "clipped" : ""}"
                data-action="clip"
                data-code="${c.code}"
                aria-pressed="${clipped}"
              >
                ${clipped ? "Clipped &#10003;" : "Clip Coupon"}
              </button>
              <button
                type="button"
                class="btn-terms-link"
                data-action="terms"
                data-code="${c.code}"
              >
                Terms
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function openTermsModal(code) {
    const modal = document.getElementById("couponTermsModal");
    const codeEl = document.getElementById("termsCouponCode");
    const descEl = document.getElementById("termsCouponDesc");
    const coupon = COUPONS_DATA.find((c) => c.code === code);
    if (!modal || !coupon) return;

    if (codeEl) codeEl.textContent = coupon.code;
    if (descEl) descEl.textContent = `${coupon.title} — Min spend ₹${coupon.minSpend.toLocaleString("en-IN")}, Expiry ${coupon.expiry}`;

    modal.hidden = false;
  }

  function closeTermsModal() {
    const modal = document.getElementById("couponTermsModal");
    if (modal) modal.hidden = true;
  }

  function setupEventListeners() {
    // Category pills filter
    const pillsRow = document.getElementById("categoryPillsRow");
    if (pillsRow) {
      pillsRow.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-pill");
        if (!btn) return;
        pillsRow.querySelectorAll(".category-pill").forEach((p) => {
          p.classList.remove("active");
          p.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        currentCategory = btn.dataset.category || "all";
        renderCoupons();
      });
    }

    // Live search input
    const searchInput = document.getElementById("couponsSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderCoupons();
      });
    }

    // Grid delegated clicks (clip, copy, terms)
    const grid = document.getElementById("couponsGrid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const clipBtn = e.target.closest("[data-action='clip']");
        if (clipBtn) {
          const code = clipBtn.dataset.code;
          if (code) toggleCouponClip(code);
          return;
        }

        const copyBtn = e.target.closest("[data-action='copy']");
        if (copyBtn) {
          const code = copyBtn.dataset.code;
          if (code) copyCouponCode(code);
          return;
        }

        const termsBtn = e.target.closest("[data-action='terms']");
        if (termsBtn) {
          const code = termsBtn.dataset.code;
          if (code) openTermsModal(code);
          return;
        }
      });
    }

    // Clear all clipped coupons
    const clearBtn = document.getElementById("btnClearAllClipped");
    if (clearBtn) {
      clearBtn.addEventListener("click", clearAllClippedCoupons);
    }

    // Terms modal close button & backdrop dismissal
    const closeTermsBtn = document.getElementById("btnCloseTermsModal");
    if (closeTermsBtn) {
      closeTermsBtn.addEventListener("click", closeTermsModal);
    }

    const modalBackdrop = document.getElementById("couponTermsModal");
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", (e) => {
        if (e.target === modalBackdrop) closeTermsModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeTermsModal();
    });
  }

  function init() {
    updateClippedSummary();
    renderCoupons();
    setupEventListeners();
  }

  // Export for testing and external access
  const target = typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this);
  if (target) {
    target.ElectroMartCoupons = {
      COUPONS_DATA,
      getClippedCoupons,
      saveClippedCoupons,
      isCouponClipped,
      toggleCouponClip,
      clearAllClippedCoupons,
      filterCoupons,
      init
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
