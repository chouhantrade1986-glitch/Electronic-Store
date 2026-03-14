const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const catalogMeta = document.getElementById("catalogMeta");
const catalogGrid = document.getElementById("catalogGrid");
const catalogSearchInput = document.getElementById("catalogSearchInput");
const catalogSortSelect = document.getElementById("catalogSortSelect");
const catalogHideSmall = document.getElementById("catalogHideSmall");
let catalogRows = [];
let catalogProductCount = 0;
let catalogModeLabel = "";
let filterChipController = null;

function normalizeCategoryToken(value) {
  let raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "other";
  }
  raw = raw
    .replace(/&/g, " and ")
    .replace(/[()]/g, " ")
    .replace(/[^\w\s-]+/g, " ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!raw || raw.length <= 1) {
    return "other";
  }
  const aliasMap = {
    accessories: "accessory",
    laptops: "laptop",
    mobiles: "mobile",
    printers: "printer",
    computers: "computer"
  };
  return aliasMap[raw] || raw;
}

function normalizeCategory(value) {
  return normalizeCategoryToken(value);
}

function splitCategoryTokens(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return ["other"];
  }
  const parts = raw.split(/[;|,]+/).map((item) => item.trim()).filter(Boolean);
  return parts.length ? parts : ["other"];
}

function productCategoryTokens(item) {
  const fromCollections = Array.isArray(item && item.collections) ? item.collections : [];
  const rawList = fromCollections.length ? fromCollections : splitCategoryTokens(item && item.category);
  return rawList
    .map((token) => normalizeCategory(token))
    .filter(Boolean);
}

function categoryLabel(slug) {
  const words = String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => {
      const upperTokens = new Set(["hp", "dell", "asus", "acer", "lenovo", "usb", "ssd", "hdd", "tv"]);
      if (upperTokens.has(part)) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    });
  if (!words.length) {
    return "Other";
  }
  return words.join(" ");
}

function loadLocalCatalogProducts() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.values(parsed || {});
  } catch (error) {
    return [];
  }
}

async function fetchApiProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products?status=all&segment=all&category=all`);
    if (!response.ok) {
      return [];
    }
    const payload = await response.json().catch(() => ({}));
    return Array.isArray(payload.products) ? payload.products : [];
  } catch (error) {
    return [];
  }
}

function mergeById(primary, secondary) {
  const map = new Map();
  (Array.isArray(primary) ? primary : []).forEach((item) => {
    if (item && item.id) {
      map.set(String(item.id), item);
    }
  });
  (Array.isArray(secondary) ? secondary : []).forEach((item) => {
    if (item && item.id && !map.has(String(item.id))) {
      map.set(String(item.id), item);
    }
  });
  return Array.from(map.values());
}

function computeCatalogRows(products) {
  const counts = new Map();
  products.forEach((item) => {
    const status = String(item.status || "active").trim().toLowerCase();
    if (status === "deleted" || status === "archived") {
      return;
    }
    productCategoryTokens(item).forEach((slug) => {
      counts.set(slug, (counts.get(slug) || 0) + 1);
    });
  });

  return Array.from(counts.entries()).map(([slug, count]) => ({ slug, label: categoryLabel(slug), count }));
}

function applyCatalogView() {
  const query = String(catalogSearchInput?.value || "").trim().toLowerCase();
  const sortBy = String(catalogSortSelect?.value || "count_desc");
  const hideSmall = Boolean(catalogHideSmall?.checked);
  let rows = catalogRows.slice();

  if (query) {
    rows = rows.filter((item) => item.label.toLowerCase().includes(query) || item.slug.includes(query));
  }
  if (hideSmall) {
    rows = rows.filter((item) => Number(item.count || 0) > 1);
  }

  rows.sort((a, b) => {
    if (sortBy === "count_asc") {
      return a.count - b.count || a.label.localeCompare(b.label);
    }
    if (sortBy === "name_asc") {
      return a.label.localeCompare(b.label);
    }
    if (sortBy === "name_desc") {
      return b.label.localeCompare(a.label);
    }
    return b.count - a.count || a.label.localeCompare(b.label);
  });

  catalogMeta.textContent = `${rows.length} catalogs • ${catalogProductCount} products${catalogModeLabel ? ` • ${catalogModeLabel}` : ""}`;

  if (!rows.length) {
    catalogGrid.innerHTML = "<p>No exact catalogs found. Try clearing one filter or broadening the search.</p>";
    filterChipController?.update();
    return;
  }

  catalogGrid.innerHTML = rows.map((item) => `
    <article class="catalog-card">
      <h3>${item.label}</h3>
      <p>${item.count} product(s)</p>
      <a href="products.html?category=${encodeURIComponent(item.slug)}">Open Catalog</a>
    </article>
  `).join("");
  filterChipController?.update();
}

function getSortLabel(value) {
  const labels = {
    count_desc: "Most Products",
    count_asc: "Fewest Products",
    name_asc: "Name A-Z",
    name_desc: "Name Z-A"
  };
  return labels[value] || "Most Products";
}

function getActiveCatalogFilters() {
  const filters = [];
  const query = String(catalogSearchInput?.value || "").trim();
  const sortValue = String(catalogSortSelect?.value || "count_desc");
  const hideSmall = Boolean(catalogHideSmall?.checked);

  if (query) {
    filters.push({
      id: "search",
      label: `Search: ${query}`,
      clear: () => {
        catalogSearchInput.value = "";
      },
      focus: catalogSearchInput,
      feedback: "Removed catalog search filter. Focus moved to the search input."
    });
  }

  if (sortValue !== "count_desc") {
    filters.push({
      id: "sort",
      label: `Sort: ${getSortLabel(sortValue)}`,
      clear: () => {
        catalogSortSelect.value = "count_desc";
      },
      focus: catalogSortSelect,
      feedback: "Removed catalog sort preference. Focus moved to the sort control."
    });
  }

  if (hideSmall) {
    filters.push({
      id: "hide-small",
      label: "Hide 1-product catalogs",
      clear: () => {
        catalogHideSmall.checked = false;
      },
      focus: catalogHideSmall,
      feedback: "Removed small-catalog filter. Focus moved to the catalog toggle."
    });
  }

  return filters;
}

async function initCatalogsPage() {
  const local = loadLocalCatalogProducts();
  const api = await fetchApiProducts();
  const merged = mergeById(api, local);
  catalogRows = computeCatalogRows(merged);
  catalogProductCount = merged.length;
  catalogModeLabel = api.length ? "server + local" : "local mode";
  filterChipController = window.ElectroMartListingFilterChips?.init({
    mountAfter: ".catalog-controls",
    getFilters: getActiveCatalogFilters,
    clearAll: () => {
      if (catalogSearchInput) {
        catalogSearchInput.value = "";
      }
      if (catalogSortSelect) {
        catalogSortSelect.value = "count_desc";
      }
      if (catalogHideSmall) {
        catalogHideSmall.checked = false;
      }
    },
    focusAfterClearAll: catalogSearchInput,
    clearAllFeedback: "Removed all catalog filters. Focus moved to the search input.",
    onChange: applyCatalogView,
    getResultSummary: () => String(catalogMeta?.textContent || "").trim()
  }) || null;
  applyCatalogView();

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener("input", applyCatalogView);
  }
  if (catalogSortSelect) {
    catalogSortSelect.addEventListener("change", applyCatalogView);
  }
  if (catalogHideSmall) {
    catalogHideSmall.addEventListener("change", applyCatalogView);
  }
}

initCatalogsPage();
