/**
 * ElectroMart Universal i18n Bus & DOM Observer
 * Central reactive synchronizer for full-theme Amazon India parity.
 */

(function () {
  function applyGlobalThemeTranslation() {
    const lang = localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi";
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang]) ? window.EM_TRANSLATIONS[lang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

    // 1. All elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict && dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // 2. All placeholders with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict && dict[key] !== undefined) {
        el.placeholder = dict[key];
      }
    });

    // 3. All titles with data-i18n-title
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (dict && dict[key] !== undefined) {
        el.title = dict[key];
      }
    });

    // 4. Trigger active page re-renderers
    if (typeof window.renderProductDetailPage === "function" && (window.currentLoadedProduct || window.activeRenderedProduct)) {
      window.renderProductDetailPage(window.currentLoadedProduct || window.activeRenderedProduct);
    }
    if (typeof window.renderProductsList === "function" && window.allLoadedProducts) {
      window.renderProductsList(window.allLoadedProducts);
    }
    if (typeof window.renderHomepageProducts === "function") {
      window.renderHomepageProducts(lang);
    } else if (typeof window.renderProducts === "function") {
      window.renderProducts(lang);
    }
    if (typeof window.renderTodaysDeals === "function") {
      window.renderTodaysDeals(lang);
    }
    if (typeof window.renderBestSellers === "function") {
      window.renderBestSellers(lang);
    }
    if (typeof window.renderCart === "function") {
      window.renderCart();
    }
  }

  // Cross-tab and live dispatch synchronization
  window.applyGlobalThemeTranslation = applyGlobalThemeTranslation;

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", applyGlobalThemeTranslation);
  } else {
    applyGlobalThemeTranslation();
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "electromart_lang_v1" || e.key === "electromart_lang") {
      applyGlobalThemeTranslation();
    }
  });

  window.addEventListener("languageChanged", () => {
    applyGlobalThemeTranslation();
  });
})();
