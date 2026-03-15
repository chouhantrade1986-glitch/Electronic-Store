(function initElectroMartMenuManager() {
  const MENU_STORAGE_KEY = "electromart_menu_v1";
  const DEFAULT_WEBSITE_MENU = [
    { label: "Terms", href: "terms-and-conditions.html" },
    { label: "Shipping", href: "shipping-policy.html" },
    { label: "Refund", href: "refund-policy.html" },
    { label: "Accessibility", href: "accessibility-statement.html" },
    { label: "FAQ", href: "faq.html" },
    { label: "Review", href: "review.html" }
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

  function injectMenu(nav) {
    if (!nav) {
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

    menuItems.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      link.setAttribute("data-managed-menu-item", "1");
      managedContainer.appendChild(link);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectMenu(document.querySelector(".category-nav"));
      injectMenu(document.querySelector(".sub-nav"));
    });
    return;
  }
  injectMenu(document.querySelector(".category-nav"));
  injectMenu(document.querySelector(".sub-nav"));
})();
