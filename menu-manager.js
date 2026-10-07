(function initElectroMartMenuManager() {
  const MENU_STORAGE_KEY = "electromart_menu_v1";
  const DEFAULT_WEBSITE_MENU = [
    { label: "All Products", href: "products.html", visible: true },
    { label: "Today's Deals", href: "todays-deals.html", visible: true },
    { label: "Best Sellers", href: "best-sellers.html", visible: true }
  ];

  function loadMenuItems() {
    try {
      const raw = localStorage.getItem(MENU_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : DEFAULT_WEBSITE_MENU;
      const list = Array.isArray(parsed) ? parsed : DEFAULT_WEBSITE_MENU;
      const clean = list
        .map((item) => ({
          label: String(item?.label || "").trim(),
          href: String(item?.href || "").trim(),
          visible: item?.visible !== false
        }))
        .filter((item) => item.label && item.href && item.visible !== false);
      return clean.length ? clean : DEFAULT_WEBSITE_MENU.slice();
    } catch (error) {
      return DEFAULT_WEBSITE_MENU.slice();
    }
  }

  function getI18nKey(href, label) {
    const h = String(href || "").toLowerCase();
    const l = String(label || "").toLowerCase();
    if (h.includes("deals") || l.includes("deal")) return "nav_todays_deals";
    if (h.includes("bestseller") || h.includes("best-seller") || l.includes("best seller")) return "nav_best_sellers";
    if (h.includes("product") || l.includes("all product")) return "nav_all_products";
    return "";
  }

  
  function syncDrawerMenuItems() {
    const drawer = document.getElementById("deptSidebar") || document.querySelector(".dept-sidebar");
    if (!drawer) return;
    const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : null;
    const subTitleEl = drawer.querySelector('#deptSubTitle') || drawer.querySelector('.drawer-subcategory-title');
    if (subTitleEl) {
      subTitleEl.setAttribute('data-i18n', 'drawer_subcategory');
      if (dict['drawer_subcategory']) {
        subTitleEl.textContent = dict['drawer_subcategory'];
      }
    }

    const linkMap = [
      { selector: 'a[href*="best-sellers"]', key: 'best_sellers' },
      { selector: 'a[href*="todays-deals"]', key: 'todays_deals' },
      { selector: 'a[href*="filter=new"]', key: 'new_arrivals' },
      { selector: '[data-submenu="pc-components"] span:not(.dept-arrow)', key: 'components_parts' },
      { selector: '[data-submenu="laptops-desktops"] span:not(.dept-arrow)', key: 'laptops_desktops' },
      { selector: 'a[href*="search=mobile"] span:not(.dept-arrow)', key: 'mobiles_accessories' },
      { selector: 'a[href*="search=audio"] span:not(.dept-arrow)', key: 'audio_headphones' },
      { selector: 'a[href*="printer"] span:not(.dept-arrow)', key: 'printers_office' },
      { selector: 'a[href*="barebone"] span:not(.dept-arrow)', key: 'barebone_desktops' },
      { selector: 'a[href*="branded"] span:not(.dept-arrow)', key: 'branded_desktops' },
      { selector: 'a[href*="pc-builder"] span:not(.dept-arrow)', key: 'pc_builder_custom' },
      { selector: 'a[href*="creator-studio"]', key: 'creator_studio' },
      { selector: 'a[href*="search=gst"]', key: 'business_gst_invoicing' },
      { selector: 'a[href*="brands.html"]', key: 'top_brands_store' },
      { selector: 'a[href*="account.html"]', key: 'your_account' },
      { selector: 'a[href*="orders.html"]', key: 'returns_orders' },
      { selector: 'a[href*="faq.html"]', key: 'customer_service_help' },
      { selector: 'a[href*="auth.html"]:not(#sidebarGreeting a)', key: 'drawer_sign_in' },
      { selector: 'a[href*="login.html"]:not(#sidebarGreeting a)', key: 'drawer_sign_in' }
    ];

    linkMap.forEach(({ selector, key }) => {
      drawer.querySelectorAll(selector).forEach((el) => {
        el.setAttribute('data-i18n', key);
        if (dict[key]) {
          el.textContent = dict[key];
        }
      });
    });
  }

  function injectMenu(nav) {
    if (!nav) {
      return;
    }
    // If this is category-nav with existing quick links, do not wipe out curated header links
    if (nav.classList.contains("category-nav") && nav.querySelector(".category-quick-links")) {
      // Synchronize existing quick links with translations
      const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
      if (typeof window.applyFullPageTranslation === "function") {
        window.applyFullPageTranslation(currentLang);
      }
      return;
    }

    const menuItems = loadMenuItems();
    if (!menuItems.length) {
      return;
    }
    const managedContainer = nav.querySelector("[data-menu-managed-container='1']") || nav.querySelector(".legal-links") || nav;
    const managedHrefSet = new Set(menuItems.map((item) => String(item.href || "").split("#")[0].split("?")[0]));

    Array.from(managedContainer.querySelectorAll("a[data-managed-menu-item='1']")).forEach((node) => node.remove());
    Array.from(managedContainer.querySelectorAll("a[href]")).forEach((node) => {
      const href = String(node.getAttribute("href") || "").split("#")[0].split("?")[0];
      if (managedHrefSet.has(href)) {
        node.remove();
      }
    });

    const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : null;

    menuItems.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.setAttribute("data-managed-menu-item", "1");
      const i18nKey = getI18nKey(item.href, item.label);
      if (i18nKey) {
        link.setAttribute("data-i18n", i18nKey);
        link.textContent = (dict && dict[i18nKey]) ? dict[i18nKey] : item.label;
      } else {
        link.textContent = item.label;
      }
      managedContainer.appendChild(link);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectMenu(document.querySelector(".category-nav"));
      injectMenu(document.querySelector(".sub-nav"));
  syncDrawerMenuItems();
    });
    return;
  }
  injectMenu(document.querySelector(".category-nav"));
  injectMenu(document.querySelector(".sub-nav"));
})();

window.syncDrawerMenuItems = syncDrawerMenuItems;
