const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const fallbackPrinters = [
  { id: "201", name: "Epson EcoTank L3250", brand: "Epson", segment: "b2c", type: "inkjet", useCase: "home", speed: "33 ppm", connectivity: "Wi-Fi", price: 15999, rating: 4.5, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80" },
  { id: "202", name: "HP LaserJet Pro MFP 4104", brand: "HP", segment: "b2c", type: "laser", useCase: "office", speed: "40 ppm", connectivity: "Ethernet", price: 28999, rating: 4.7, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df89?auto=format&fit=crop&w=900&q=80" },
  { id: "203", name: "Canon PIXMA G3770 All-in-One", brand: "Canon", segment: "b2c", type: "inkjet", useCase: "home", speed: "15 ppm", connectivity: "Wi-Fi", price: 18499, rating: 4.4, image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80" },
  { id: "204", name: "Brother HL-L5100DN Office Pack (5 Units)", brand: "Brother", segment: "b2b", type: "laser", useCase: "office", speed: "42 ppm", connectivity: "Ethernet", moq: 5, price: 124999, rating: 4.6, image: "https://images.unsplash.com/photo-1612810806695-30f7a8258391?auto=format&fit=crop&w=900&q=80" },
  { id: "205", name: "Zebra ZD230 Thermal Label Printer", brand: "Zebra", segment: "b2b", type: "thermal", useCase: "commercial", speed: "6 ips", connectivity: "USB", moq: 3, price: 47999, rating: 4.5, image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=900&q=80" }
];

const printerGrid = document.getElementById("printerGrid");
const resultMeta = document.getElementById("resultMeta");
const searchInput = document.getElementById("searchInput");
const segmentFilter = document.getElementById("segmentFilter");
const brandFilterList = document.getElementById("brandFilterList");
const typeFilter = document.getElementById("typeFilter");
const useFilter = document.getElementById("useFilter");
const sortFilter = document.getElementById("sortFilter");
const cartCount = document.getElementById("cartCount");
const deptTrigger = document.getElementById("deptTrigger");
const deptMenu = document.getElementById("deptMenu");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

let apiPrinterProducts = [];
let filterChipController = null;

function fallbackImage() {
  return "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80";
}

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/")) {
    return raw;
  }
  if (raw.startsWith("blob:")) {
    return raw;
  }
  let normalized = raw;
  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized) && /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(normalized)) {
    normalized = `https://${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    if (host.includes("drive.google.com")) {
      const fileId = url.searchParams.get("id") || url.pathname.split("/d/")[1]?.split("/")[0];
      if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    if (host.includes("dropbox.com")) {
      url.searchParams.delete("dl");
      url.searchParams.set("raw", "1");
      return url.toString();
    }
    return url.toString();
  } catch (error) {
    return "";
  }
}

function loadCatalogMap() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function normalizePrinterCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "printers") {
    return "printer";
  }
  return raw;
}

function inferPrinterType(item) {
  const source = `${item.name || ""} ${(Array.isArray(item.keywords) ? item.keywords.join(" ") : "")}`.toLowerCase();
  if (source.includes("thermal")) {
    return "thermal";
  }
  if (source.includes("laser")) {
    return "laser";
  }
  return "inkjet";
}

function inferPrinterUse(item) {
  const source = `${item.name || ""} ${(Array.isArray(item.keywords) ? item.keywords.join(" ") : "")}`.toLowerCase();
  if (source.includes("office") || source.includes("business")) {
    return "office";
  }
  if (source.includes("commercial") || source.includes("label")) {
    return "commercial";
  }
  return "home";
}

function mapCatalogPrinter(item) {
  if (!item || !item.id) {
    return null;
  }
  const category = normalizePrinterCategory(item.category);
  const status = String(item.status || "active").toLowerCase();
  if (category !== "printer" || status !== "active") {
    return null;
  }

  return {
    id: String(item.id),
    name: item.name || `Product #${item.id}`,
    brand: item.brand || "Generic",
    segment: String(item.segment || "b2c").toLowerCase(),
    type: String(item.type || inferPrinterType(item)).toLowerCase(),
    useCase: String(item.useCase || inferPrinterUse(item)).toLowerCase(),
    speed: String(item.speed || "20 ppm"),
    connectivity: String(item.connectivity || "Wi-Fi"),
    listPrice: Number(item.listPrice || item.price || 0),
    moq: Number(item.moq || 0),
    featured: Boolean(item.featured),
    price: Number(item.price || 0),
    rating: Number(item.rating || 0),
    image: normalizeImageUrl(item.image) || fallbackImage()
  };
}

function getMergedPrinters() {
  const map = new Map(fallbackPrinters.map((item) => [String(item.id), item]));
  Object.values(loadCatalogMap()).forEach((item) => {
    const mapped = mapCatalogPrinter(item);
    if (mapped) {
      map.set(mapped.id, mapped);
    }
  });
  apiPrinterProducts.forEach((item) => {
    const mapped = mapCatalogPrinter(item);
    if (mapped) {
      map.set(mapped.id, mapped);
    }
  });
  return Array.from(map.values());
}

async function fetchPrintersFromApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/products?category=printer&status=active&segment=all`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json().catch(() => ({}));
    apiPrinterProducts = Array.isArray(payload.products) ? payload.products : [];
  } catch (error) {
    apiPrinterProducts = [];
  }
}

function loadCartMap() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveCartMap(cartMap) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
  } catch (error) {
    return;
  }
}

function syncCartCount() {
  const total = Object.values(loadCartMap()).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(total);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeBrandKey(value) {
  return String(value || "").trim().toLowerCase();
}

function getBrandFilters() {
  return brandFilterList ? Array.from(brandFilterList.querySelectorAll(".brand-filter")) : [];
}

function getSelectedBrands() {
  return getBrandFilters()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function syncDynamicBrandUI(items) {
  if (!brandFilterList) {
    return;
  }
  const selectedKeys = new Set(getSelectedBrands().map((brand) => normalizeBrandKey(brand)));
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const activeSegment = String(segmentFilter?.value || "all");
  const activeType = String(typeFilter?.value || "all");
  const activeUse = String(useFilter?.value || "all");

  const source = items.filter((item) => {
    const text = `${item.name} ${item.brand || ""} ${item.type} ${item.useCase} ${item.speed} ${item.connectivity}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = activeSegment === "all" || item.segment === activeSegment;
    const typeMatch = activeType === "all" || item.type === activeType;
    const useMatch = activeUse === "all" || item.useCase === activeUse;
    return queryMatch && segmentMatch && typeMatch && useMatch;
  });

  const optionMap = new Map();
  [...source, ...items.filter((item) => selectedKeys.has(normalizeBrandKey(item.brand)))]
    .forEach((item) => {
      const brand = String(item.brand || "").trim();
      if (!brand) {
        return;
      }
      optionMap.set(normalizeBrandKey(brand), brand);
    });

  const brands = Array.from(optionMap.values()).sort((left, right) => left.localeCompare(right));
  if (!brands.length) {
    brandFilterList.innerHTML = "<p class='brand-filter-empty'>No brands match the current filters.</p>";
    return;
  }
  brandFilterList.innerHTML = brands.map((brand) => {
    const checked = selectedKeys.has(normalizeBrandKey(brand)) ? " checked" : "";
    return `<label class="check-item"><input type="checkbox" class="brand-filter" value="${escapeHtml(brand)}"${checked} /> ${escapeHtml(brand)}</label>`;
  }).join("");
}

function addToCart(id) {
  const cartMap = loadCartMap();
  const key = String(id);
  cartMap[key] = (Number(cartMap[key]) || 0) + 1;
  saveCartMap(cartMap);
  syncCartCount();
}

function titleCase(value) {
  const text = String(value || "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function brandStoreUrl(value) {
  return `brands.html?brand=${encodeURIComponent(String(value || "").trim())}`;
}

function printerCard(item) {
  const detailUrl = `product-detail.html?id=${item.id}`;
  const bulk = item.segment === "b2b" && item.moq ? `<p class="bulk-meta">Minimum order quantity: ${item.moq}</p>` : "";

  return `
    <article class="product-card">
      <a href="${detailUrl}" aria-label="Open ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${item.name}</a></h3>
        <div class="spec-row">
          <a class="spec-chip spec-chip-link" href="${brandStoreUrl(item.brand)}">${item.brand}</a>
          <span class="spec-chip">${titleCase(item.type)}</span>
          <span class="spec-chip">${titleCase(item.useCase)}</span>
          <span class="spec-chip">${item.speed}</span>
          <span class="spec-chip">${item.connectivity}</span>
        </div>
        <div class="meta">
          <span class="price">${money(item.price)}</span>
          <span class="rating">${Number(item.rating).toFixed(1)} Star</span>
        </div>
        ${bulk}
        <div class="card-actions">
          <a href="${detailUrl}" class="view-link">View Details</a>
          <button class="add-btn" data-id="${item.id}" type="button">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function render(list) {
  resultMeta.textContent = `Showing ${list.length} products`;
  if (!list.length) {
    printerGrid.innerHTML = "<div class='empty'>No exact printer matches found. Try clearing one filter or broadening the search.</div>";
    return;
  }
  printerGrid.innerHTML = list.map(printerCard).join("");
}

function sortItems(items, sortValue) {
  const next = [...items];
  if (sortValue === "price_asc") {
    next.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortValue === "price_desc") {
    next.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortValue === "rating_desc") {
    next.sort((a, b) => Number(b.rating) - Number(a.rating));
  } else if (sortValue === "best_value") {
    next.sort((a, b) => (Number(b.rating) / Math.max(1, Number(b.price))) - (Number(a.rating) / Math.max(1, Number(a.price))));
  }
  return next;
}

function getSortLabel(value) {
  if (value === "price_asc") {
    return "Sort: Price Low to High";
  }
  if (value === "price_desc") {
    return "Sort: Price High to Low";
  }
  if (value === "rating_desc") {
    return "Sort: Top Rated";
  }
  if (value === "best_value") {
    return "Sort: Best Value";
  }
  return "Sort: Relevance";
}

function getActivePrinterFilters() {
  const filters = [];
  const query = String(searchInput.value || "").trim();
  const segment = String(segmentFilter.value || "all");
  const selectedBrands = getSelectedBrands();
  const type = String(typeFilter.value || "all");
  const useCase = String(useFilter.value || "all");
  const sortValue = String(sortFilter.value || "relevance");

  if (query) {
    filters.push({
      id: "query",
      label: `Search: ${query}`,
      clear: () => {
        searchInput.value = "";
      },
      focus: searchInput,
      feedback: "Removed search filter. Focus moved to the search input."
    });
  }

  if (segment !== "all") {
    filters.push({
      id: "segment",
      label: `Segment: ${String(segmentFilter.selectedOptions?.[0]?.textContent || segment).trim()}`,
      clear: () => {
        segmentFilter.value = "all";
      },
      focus: segmentFilter,
      feedback: "Removed segment filter. Focus moved to the segment filter."
    });
  }

  selectedBrands.forEach((brand) => {
    filters.push({
      id: `brand-${normalizeBrandKey(brand)}`,
      label: `Brand: ${brand}`,
      clear: () => {
        const target = getBrandFilters().find((checkbox) => checkbox.value === brand);
        if (target) {
          target.checked = false;
        }
      },
      focus: () => getBrandFilters().find((checkbox) => checkbox.value === brand)?.focus(),
      feedback: "Removed brand filter. Focus moved to the brand option."
    });
  });

  if (type !== "all") {
    filters.push({
      id: "type",
      label: `Type: ${String(typeFilter.selectedOptions?.[0]?.textContent || type).trim()}`,
      clear: () => {
        typeFilter.value = "all";
      },
      focus: typeFilter,
      feedback: "Removed printer type filter. Focus moved to the type filter."
    });
  }

  if (useCase !== "all") {
    filters.push({
      id: "useCase",
      label: `Use Case: ${String(useFilter.selectedOptions?.[0]?.textContent || useCase).trim()}`,
      clear: () => {
        useFilter.value = "all";
      },
      focus: useFilter,
      feedback: "Removed printer use-case filter. Focus moved to the use-case filter."
    });
  }

  if (sortValue !== "relevance") {
    filters.push({
      id: "sort",
      label: getSortLabel(sortValue),
      clear: () => {
        sortFilter.value = "relevance";
      },
      focus: sortFilter,
      feedback: "Removed sort preference. Focus moved to the sort filter."
    });
  }

  return filters;
}

function filterPrinters() {
  const source = getMergedPrinters();
  syncDynamicBrandUI(source);
  const query = String(searchInput.value || "").trim().toLowerCase();
  const segment = String(segmentFilter.value || "all");
  const selectedBrands = getSelectedBrands();
  const type = String(typeFilter.value || "all");
  const useCase = String(useFilter.value || "all");
  const sortValue = String(sortFilter.value || "relevance");

  const filtered = source.filter((item) => {
    const text = `${item.name} ${item.brand || ""} ${item.type} ${item.useCase} ${item.speed} ${item.connectivity}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = segment === "all" || item.segment === segment;
    const brandMatch = !selectedBrands.length || selectedBrands.includes(item.brand);
    const typeMatch = type === "all" || item.type === type;
    const useMatch = useCase === "all" || item.useCase === useCase;
    return queryMatch && segmentMatch && brandMatch && typeMatch && useMatch;
  });

  render(sortItems(filtered, sortValue));
  filterChipController?.update();
}

searchInput.addEventListener("input", filterPrinters);
segmentFilter.addEventListener("change", filterPrinters);
brandFilterList?.addEventListener("change", (event) => {
  if (event.target.closest(".brand-filter")) {
    filterPrinters();
  }
});
typeFilter.addEventListener("change", filterPrinters);
useFilter.addEventListener("change", filterPrinters);
sortFilter.addEventListener("change", filterPrinters);

document.addEventListener("click", (event) => {
  if (deptTrigger && event.target === deptTrigger) {
    const next = !deptMenu.classList.contains("open");
    deptMenu.classList.toggle("open", next);
    deptTrigger.setAttribute("aria-expanded", String(next));
    return;
  }

  if (deptMenu && !deptMenu.contains(event.target) && event.target !== deptTrigger) {
    deptMenu.classList.remove("open");
    if (deptTrigger) {
      deptTrigger.setAttribute("aria-expanded", "false");
    }
  }

  if (!event.target.classList.contains("add-btn")) {
    return;
  }
  const id = String(event.target.getAttribute("data-id") || "").trim();
  if (id) {
    addToCart(id);
  }
});

async function initPrinterPage() {
  syncCartCount();
  await fetchPrintersFromApi();
  filterChipController = window.ElectroMartListingFilterChips?.init({
    mountAfter: ".result-note",
    getFilters: getActivePrinterFilters,
    clearAll: () => {
      searchInput.value = "";
      segmentFilter.value = "all";
      getBrandFilters().forEach((checkbox) => {
        checkbox.checked = false;
      });
      typeFilter.value = "all";
      useFilter.value = "all";
      sortFilter.value = "relevance";
    },
    focusAfterClearAll: searchInput,
    clearAllFeedback: "Removed all printer filters. Focus moved to the search input.",
    onChange: filterPrinters,
    getResultSummary: () => String(resultMeta?.textContent || "").trim()
  }) || null;
  filterPrinters();
}

initPrinterPage();
