/* Phase 32: ElectroMart Protect / ElectroMart Care shared logic. */
(function () {
  "use strict";

  const SELECTION_KEY = "electromart_protection_selection_v1";
  const CLAIMS_KEY = "electromart_protection_claims_v1";
  const PLAN_CATALOG = [
    {
      id: "extended_warranty_1y",
      name: "ElectroMart Protect 1-Year Extended Hardware Warranty",
      shortName: "1-Year Extended Hardware Warranty",
      price: 899,
      sacCode: "998714",
      gstRate: 0.18,
      eligibleFamilies: ["laptop", "mobile", "audio"],
      coverage: "Hardware faults, parts and labour for one additional year"
    },
    {
      id: "complete_damage_1y",
      name: "ElectroMart Care 1-Year Complete Damage Protection",
      shortName: "1-Year Complete Damage Protection",
      price: 2499,
      sacCode: "998714",
      gstRate: 0.18,
      eligibleFamilies: ["laptop", "mobile", "audio"],
      coverage: "Screen damage and liquid damage repair for one year"
    }
  ];

  function normalizeFamily(product) {
    const value = `${product && product.category || ""} ${product && product.name || ""}`.toLowerCase();
    if (/laptop|notebook|macbook/.test(value)) return "laptop";
    if (/phone|mobile|iphone|galaxy|pixel|oneplus/.test(value)) return "mobile";
    if (/audio|headphone|earphone|speaker|watch|airpod/.test(value)) return "audio";
    return "";
  }

  function getProtectionPlan(planId) {
    return PLAN_CATALOG.find((plan) => plan.id === String(planId || "")) || null;
  }

  function isProtectionEligible(product) {
    return Boolean(product && normalizeFamily(product));
  }

  function loadSelections() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SELECTION_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveSelections(value) {
    localStorage.setItem(SELECTION_KEY, JSON.stringify(value && typeof value === "object" ? value : {}));
  }

  function getSelectedProtection(productId) {
    const selection = loadSelections()[String(productId || "")];
    return getProtectionPlan(selection);
  }

  function setSelectedProtection(productId, planId) {
    const selections = loadSelections();
    const key = String(productId || "");
    if (!key || !getProtectionPlan(planId)) {
      delete selections[key];
    } else {
      selections[key] = String(planId);
    }
    saveSelections(selections);
    window.dispatchEvent(new CustomEvent("protection:updated", { detail: { productId: key, planId: selections[key] || null } }));
  }

  function buildProtectionLine(product, plan) {
    if (!product || !plan) return null;
    return {
      id: `protection:${plan.id}:${product.id}`,
      parentProductId: String(product.id),
      name: `ElectroMart Protect - ${plan.shortName}`,
      price: Number(plan.price),
      quantity: 1,
      category: "protection-service",
      sacCode: plan.sacCode,
      gstRate: plan.gstRate,
      isProtectionPlan: true,
      protectionPlan: { ...plan, parentProductId: String(product.id) }
    };
  }

  function loadClaims() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CLAIMS_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function generateClaimId() {
    const claims = loadClaims();
    let claimId;
    do {
      claimId = `EM-CLM-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
    } while (claims.some((claim) => claim.id === claimId));
    return claimId;
  }

  function saveClaim(claim) {
    const claims = loadClaims();
    claims.unshift(claim);
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims.slice(0, 100)));
    return claim;
  }

  function findProtectedOrder(orderId) {
    try {
      const orders = JSON.parse(localStorage.getItem("electromart_offline_orders_v1") || "[]");
      if (!Array.isArray(orders)) return null;
      return orders.find((order) => String(order && order.id || "") === String(orderId || "") && Array.isArray(order.items) && order.items.some((item) => item && item.protectionPlan)) || null;
    } catch (error) {
      return null;
    }
  }

  function renderWarrantyHub() {
    const planGrid = document.getElementById("protectionPlanCatalog");
    if (planGrid) {
      planGrid.innerHTML = PLAN_CATALOG.map((plan) => `
        <article class="protection-plan-card" data-plan-id="${plan.id}">
          <span class="protection-plan-kicker">ElectroMart ${plan.id.startsWith("complete") ? "Care" : "Protect"}</span>
          <h2>${plan.shortName}</h2>
          <p>${plan.coverage}</p>
          <strong>₹${plan.price.toLocaleString("en-IN")} + 18% GST</strong>
          <span>SAC ${plan.sacCode}</span>
        </article>
      `).join("");
    }

    const form = document.getElementById("claimWizardForm");
    const result = document.getElementById("claimResult");
    if (!form || !result) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const orderId = String(document.getElementById("claimOrderId").value || "").trim();
      const device = String(document.getElementById("claimDevice").value || "").trim();
      const issue = String(document.getElementById("claimIssue").value || "").trim();
      if (!orderId || !device || !issue) return;
      const protectedOrder = findProtectedOrder(orderId);
      if (!protectedOrder) {
        result.hidden = false;
        result.textContent = "Order verification failed: no active protection plan was found.";
        return;
      }
      const claim = saveClaim({ id: generateClaimId(), orderId, device, issue, status: "submitted", createdAt: new Date().toISOString() });
      result.hidden = false;
      result.textContent = `Claim submitted: ${claim.id}`;
      form.reset();
    });
  }

  window.ELECTROMART_PROTECTION_PLANS = PLAN_CATALOG;
  window.getProtectionPlan = getProtectionPlan;
  window.isProtectionEligible = isProtectionEligible;
  window.getSelectedProtection = getSelectedProtection;
  window.setSelectedProtection = setSelectedProtection;
  window.buildProtectionLine = buildProtectionLine;
  window.generateProtectionClaimId = generateClaimId;
  window.loadProtectionClaims = loadClaims;
  window.findProtectedOrder = findProtectedOrder;
  window.renderWarrantyHub = renderWarrantyHub;

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", renderWarrantyHub);
  }
})();
