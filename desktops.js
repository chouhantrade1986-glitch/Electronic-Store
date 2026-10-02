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

const fallbackDesktops = [
  { id: "101", name: "Titan Office Tower i5", brand: "Titan", segment: "b2c", processor: "intel", purpose: "office", ram: "16GB", storage: "512GB SSD", price: 899, rating: 4.4, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: "102", name: "Vortex Gaming Rig Ryzen 7", brand: "Vortex", segment: "b2c", processor: "amd", purpose: "gaming", ram: "32GB", storage: "1TB SSD", price: 1699, rating: 4.8, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "103", name: "Creator Studio Workstation", brand: "Creator", segment: "b2c", processor: "intel", purpose: "creator", ram: "32GB", storage: "2TB SSD", price: 1999, rating: 4.7, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: "104", name: "Business Desktop Bundle (5 Units)", brand: "Titan", segment: "b2b", processor: "intel", purpose: "office", ram: "16GB", storage: "512GB SSD", moq: 5, price: 4299, rating: 4.5, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
  { id: "105", name: "Retail Gaming Pack (3 Units)", brand: "Vortex", segment: "b2b", processor: "amd", purpose: "gaming", ram: "32GB", storage: "1TB SSD", moq: 3, price: 4799, rating: 4.6, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" }
];

const desktopGrid = document.getElementById("desktopGrid");
const resultMeta = document.getElementById("resultMeta");
const searchInput = document.getElementById("searchInput");
const segmentFilter = document.getElementById("segmentFilter");
const brandFilterList = document.getElementById("brandFilterList");
const processorFilter = document.getElementById("processorFilter");
const purposeFilter = document.getElementById("purposeFilter");
const sortFilter = document.getElementById("sortFilter");
const cartCount = document.getElementById("cartCount");
const deptTrigger = document.getElementById("deptTrigger");
const deptMenu = document.getElementById("deptMenu");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

let apiDesktopProducts = [];
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

function normalizeDesktopCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "desktop" || raw === "desktops") {
    return "computer";
  }
  return raw;
}

function inferDesktopProcessor(item) {
  const source = `${item.name || ""} ${(Array.isArray(item.keywords) ? item.keywords.join(" ") : "")}`.toLowerCase();
  return source.includes("ryzen") || source.includes("amd") ? "amd" : "intel";
}

function inferDesktopPurpose(item) {
  const source = `${item.name || ""} ${(Array.isArray(item.keywords) ? item.keywords.join(" ") : "")}`.toLowerCase();
  if (source.includes("gaming")) {
    return "gaming";
  }
  if (source.includes("creator") || source.includes("studio") || source.includes("workstation")) {
    return "creator";
  }
  return "office";
}

function mapCatalogDesktop(item) {
  if (!item || !item.id) {
    return null;
  }

  const rawCategory = normalizeDesktopCategory(item.category);
  const status = String(item.status || "active").toLowerCase();
  if (rawCategory !== "computer" || status !== "active") {
    return null;
  }

  // Only show RAM/Storage specs when backend actually provides them.
  // This prevents “ghost specs” (mouse/cabinet inheriting default desktop RAM/SSD).
  const hasRealRam = item.ram != null && String(item.ram).trim() !== "";
  const hasRealStorage = item.storage != null && String(item.storage).trim() !== "";

  return {
    id: String(item.id),
    name: item.name || `Product #${item.id}`,
    brand: item.brand || "Generic",
    segment: String(item.segment || "b2c").toLowerCase(),
    processor: String(item.processor || inferDesktopProcessor(item)).toLowerCase(),
    purpose: String(item.purpose || inferDesktopPurpose(item)).toLowerCase(),
    ram: hasRealRam ? String(item.ram) : "",
    storage: hasRealStorage ? String(item.storage) : "",
    listPrice: Number(item.listPrice || item.price || 0),
    moq: Number(item.moq || 0),
    featured: Boolean(item.featured),
    price: Number(item.price || 0),
    rating: Number(item.rating || 0),
    image: normalizeImageUrl(item.image) || fallbackImage()
  };
}

function getMergedDesktops() {
  const map = new Map(fallbackDesktops.map((item) => [String(item.id), item]));
  Object.values(loadCatalogMap()).forEach((item) => {
    const mapped = mapCatalogDesktop(item);
    if (mapped) {
      map.set(mapped.id, mapped);
    }
  });
  apiDesktopProducts.forEach((item) => {
    const mapped = mapCatalogDesktop(item);
    if (mapped) {
      map.set(mapped.id, mapped);
    }
  });
  return Array.from(map.values());
}

async function fetchDesktopsFromApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/products?category=computer&status=active&segment=all`);
    if (!response.ok) {
      console.warn(`API returned status ${response.status}. Using fallback data.`);
      apiDesktopProducts = [];
      return;
    }
    const payload = await response.json().catch(() => ({}));
    apiDesktopProducts = Array.isArray(payload.products) ? payload.products : [];
    console.log(`Loaded ${apiDesktopProducts.length} products from API`);
  } catch (error) {
    console.error('Failed to fetch products from API:', error?.message || error);
    apiDesktopProducts = [];
  }
}

function getSafeMergedDesktops() {
  // If API fails (e.g., backend DB locked), always show fallback items.
  const list = getMergedDesktops();
  return Array.isArray(list) && list.length ? list : fallbackDesktops;
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
  if (!cartCount) {
    // Some pages may not have cartCount element (header injection differs).
    return;
  }
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
  const activeProcessor = String(processorFilter?.value || "all");
  const activePurpose = String(purposeFilter?.value || "all");

  const source = items.filter((item) => {
    const text = `${item.name} ${item.brand || ""} ${item.processor} ${item.purpose} ${item.ram} ${item.storage}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = activeSegment === "all" || item.segment === activeSegment;
    const processorMatch = activeProcessor === "all" || item.processor === activeProcessor;
    const purposeMatch = activePurpose === "all" || item.purpose === activePurpose;
    return queryMatch && segmentMatch && processorMatch && purposeMatch;
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
  const n = Math.floor(Number(value || 0));
  return inrFormatter.format(n);
}

function brandStoreUrl(value) {
  return `brands.html?brand=${encodeURIComponent(String(value || "").trim())}`;
}

function desktopCard(item) {
  const detailUrl = `product-detail.html?id=${item.id}`;
  
  // Determine badge based on product attributes
  let badge = '';
  if (item.featured) {
    badge = '<span class="badge badge-hot">Hot</span>';
  } else if (item.segment === "b2b") {
    badge = '<span class="badge badge-new">B2B</span>';
  }
  
  // Calculate discount if listPrice exists
  let discountHtml = '';
  if (item.listPrice && item.listPrice > item.price) {
    const discountPercent = Math.round(((item.listPrice - item.price) / item.listPrice) * 100);
    discountHtml = `
      <span class="discount-badge">${discountPercent}% OFF</span>
      <span class="mrp">M.R.P.: ${money(item.listPrice)}</span>
    `;
  }
  
  const bulk = item.segment === "b2b" && item.moq ? `<p class="bulk-meta">Min. order: ${item.moq} units</p>` : "";

  return `
    <article class="product-card">
      ${badge}
      <button class="wishlist-heart" data-wishlist-id="${item.id}" data-product-name="${item.name}" aria-label="Add ${item.name} to wishlist"></button>
      <a href="${detailUrl}" class="thumb-link" aria-label="View ${item.name} details">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}" class="title-link product-title">${item.name}</a></h3>
        <div class="spec-row">
          <a class="spec-chip spec-chip-link" href="${brandStoreUrl(item.brand)}" aria-label="Browse ${item.brand} products">${item.brand}</a>
          <span class="spec-chip">${titleCase(item.processor)}</span>
          <span class="spec-chip">${titleCase(item.purpose)}</span>
          ${item.ram ? `<span class="spec-chip">${item.ram}</span>` : ``}
          ${item.storage ? `<span class="spec-chip">${item.storage}</span>` : ``}
        </div>
        <div class="meta">
          <div class="price-section">
            ${discountHtml ? discountHtml : ""}
            <span class="current-price">${money(item.price)}</span>
          </div>
          <div class="rating-section">
            ${Number(item.rating) > 0
              ? `<span class="rating" aria-label="Rating: ${Number(item.rating).toFixed(1)} out of 5 stars">${Number(item.rating).toFixed(1)}</span>`
              : `<span class="rating-empty" aria-label="Not yet reviewed">☆☆☆☆☆</span>`}
          </div>
        </div>
        ${bulk}
        <div class="card-actions">
          <a href="${detailUrl}" class="view-link" aria-label="View details for ${item.name}">View Details</a>
<button class="desktop-add-btn" data-id="${item.id}" type="button" aria-label="Add ${item.name} to cart">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function render(list) {
  // Avoid misleading "Showing 0 products" during initial paint.
  const fallbackSize = Array.isArray(fallbackDesktops) ? fallbackDesktops.length : 0;
  if (!list.length && fallbackSize > 0 && apiDesktopProducts.length === 0) {
    resultMeta.textContent = `Showing ${fallbackSize} products`;
    desktopGrid.innerHTML = list.map(desktopCard).join("") || "";
    return;
  }
  resultMeta.textContent = `Showing ${list.length} products`;
  if (!list.length) {
    desktopGrid.innerHTML = "<div class='empty'>No computer matches found. Clear filters to see all desktops.</div>";
    return;
  }
  desktopGrid.innerHTML = list.map(desktopCard).join("");
}


function getSortLabel(value) {
  const labels = {
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    rating_desc: "Top Rated",
    best_value: "Best Value"
  };
  return labels[value] || "Relevance";
}

function getActiveListingFilters() {
  const filters = [];
  const query = String(searchInput?.value || "").trim();
  const segment = String(segmentFilter?.value || "all");
  const selectedBrands = getSelectedBrands();
  const processor = String(processorFilter?.value || "all");
  const purpose = String(purposeFilter?.value || "all");
  const sortValue = String(sortFilter?.value || "relevance");

  if (query) {
    filters.push({
      id: "search",
      label: `Search: "${query}"`,
      ariaLabel: `Remove search ${query}`,
      clear: () => {
        searchInput.value = "";
      },
      focus: () => searchInput.focus(),
      feedback: `Removed search ${query}. Focus moved to the search input.`
    });
  }
  if (segment !== "all") {
    filters.push({
      id: "segment",
      label: `Segment: ${segment.toUpperCase()}`,
      ariaLabel: `Remove segment filter ${segment.toUpperCase()}`,
      clear: () => {
        segmentFilter.value = "all";
      },
      focus: () => segmentFilter.focus(),
      feedback: `Removed segment filter ${segment.toUpperCase()}. Focus moved to the segment filter.`
    });
  }
  selectedBrands.forEach((brand) => {
    filters.push({
      id: `brand-${normalizeBrandKey(brand)}`,
      label: `Brand: ${brand}`,
      ariaLabel: `Remove brand filter ${brand}`,
      clear: () => {
        const target = getBrandFilters().find((checkbox) => checkbox.value === brand);
        if (target) {
          target.checked = false;
        }
      },
      focus: () => getBrandFilters().find((checkbox) => checkbox.value === brand)?.focus(),
      feedback: `Removed brand filter ${brand}. Focus moved to the brand option.`
    });
  });
  if (processor !== "all") {
    const readableProcessor = processor.toUpperCase();
    filters.push({
      id: "processor",
      label: `Processor: ${readableProcessor}`,
      ariaLabel: `Remove processor filter ${readableProcessor}`,
      clear: () => {
        processorFilter.value = "all";
      },
      focus: () => processorFilter.focus(),
      feedback: `Removed processor filter ${readableProcessor}. Focus moved to the processor filter.`
    });
  }
  if (purpose !== "all") {
    const readablePurpose = purpose.charAt(0).toUpperCase() + purpose.slice(1);
    filters.push({
      id: "purpose",
      label: `Use Case: ${readablePurpose}`,
      ariaLabel: `Remove use case filter ${readablePurpose}`,
      clear: () => {
        purposeFilter.value = "all";
      },
      focus: () => purposeFilter.focus(),
      feedback: `Removed use case filter ${readablePurpose}. Focus moved to the use case filter.`
    });
  }
  if (sortValue !== "relevance") {
    const sortLabel = getSortLabel(sortValue);
    filters.push({
      id: "sort",
      label: `Sort: ${sortLabel}`,
      ariaLabel: `Remove sort filter ${sortLabel}`,
      clear: () => {
        sortFilter.value = "relevance";
      },
      focus: () => sortFilter.focus(),
      feedback: `Removed sort order ${sortLabel}. Focus moved to the sort control.`
    });
  }
  return filters;
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

function filterDesktops() {
  const source = getMergedDesktops();
  syncDynamicBrandUI(source);
  const query = String(searchInput.value || "").trim().toLowerCase();
  const segment = String(segmentFilter.value || "all");
  const selectedBrands = getSelectedBrands();
  const processor = String(processorFilter.value || "all");
  const purpose = String(purposeFilter.value || "all");
  const sortValue = String(sortFilter.value || "relevance");

  // Debug: helps identify why desktops filter returns 0 while products page works.
  try {
    console.log("[desktops.js] filterDesktops inputs:", {
      mergedCount: Array.isArray(source) ? source.length : 0,
      query,
      segment,
      processor,
      purpose,
      selectedBrandsCount: Array.isArray(selectedBrands) ? selectedBrands.length : 0,
      selectedBrands: Array.isArray(selectedBrands) ? selectedBrands.slice(0, 5) : [],
      sortValue
    });
  } catch (e) {}

  const filtered = source.filter((item) => {

    const text = `${item.name} ${item.brand || ""} ${item.processor} ${item.purpose} ${item.ram} ${item.storage}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = segment === "all" || item.segment === segment;
    const brandMatch = !selectedBrands.length || selectedBrands.includes(item.brand);
    const processorMatch = processor === "all" || item.processor === processor;
    const purposeMatch = purpose === "all" || item.purpose === purpose;
    return queryMatch && segmentMatch && brandMatch && processorMatch && purposeMatch;
  });

  render(sortItems(filtered, sortValue));
  filterChipController?.update();
}

searchInput.addEventListener("input", () => {
  // Simple autosuggest using local merged list (no API dependency)
  const suggestionsEl = document.getElementById("searchSuggestions");
  if (suggestionsEl) {
    const query = String(searchInput.value || "").trim().toLowerCase();
    if (!query) {
      suggestionsEl.hidden = true;
      suggestionsEl.innerHTML = "";
    } else {
      const source = getMergedDesktops();
      const top = source
        .filter((item) => String(item.name || "").toLowerCase().includes(query) || String(item.brand || "").toLowerCase().includes(query))
        .slice(0, 6)
        .map((item) => ({ id: item.id, label: item.name }));

      suggestionsEl.hidden = false;
      suggestionsEl.innerHTML = top.length
        ? top.map((s) => `<button type="button" class="suggestion-item" data-suggestion-id="${s.id}">${escapeHtml(s.label)}</button>`).join("")
        : `<div class="suggestion-empty">No suggestions</div>`;
    }
  }

  filterDesktops();
});
segmentFilter.addEventListener("change", filterDesktops);
brandFilterList?.addEventListener("change", (event) => {
  if (event.target.closest(".brand-filter")) {
    filterDesktops();
  }
});
processorFilter.addEventListener("change", filterDesktops);
purposeFilter.addEventListener("change", filterDesktops);
sortFilter.addEventListener("change", filterDesktops);


document.addEventListener("click", (event) => {
  const suggestionBtn = event.target?.closest?.(".suggestion-item");
  if (suggestionBtn) {
    const id = String(suggestionBtn.getAttribute("data-suggestion-id") || "").trim();
    if (id) {
      // Navigate to matching product; keeps UX similar to Amazon search results.
      window.location.href = `product-detail.html?id=${encodeURIComponent(id)}`;
    }
    return;
  }

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

const addBtn = event.target?.closest?.(".desktop-add-btn");
  if (!addBtn) {
    return;
  }
  const id = String(addBtn.getAttribute("data-id") || "").trim();
  if (id) {
    addToCart(id);
    // Ensure UI cart badge updates even if header DOM differs.
    try {
      syncCartCount();
    } catch (e) {}
  }
});

async function initDesktopPage() {
  syncCartCount();

  // Populate brand list immediately from merged fallback (and any cached items)
  // to avoid "Loading brands...".
  try {
    const initialSource = getMergedDesktops();
    syncDynamicBrandUI(initialSource);
  } catch (e) {
    // ignore; UI will recover on filterDesktops()
  }


  filterChipController = window.ElectroMartListingFilterChips?.init({
    mountAfter: ".result-note",
    getFilters: getActiveListingFilters,
    clearAll: () => {
      if (searchInput) {
        searchInput.value = "";
      }
      if (segmentFilter) {
        segmentFilter.value = "all";
      }
      getBrandFilters().forEach((checkbox) => {
        checkbox.checked = false;
      });
      if (processorFilter) {
        processorFilter.value = "all";
      }
      if (purposeFilter) {
        purposeFilter.value = "all";
      }
      if (sortFilter) {
        sortFilter.value = "relevance";
      }
    },
    focusAfterClearAll: () => searchInput?.focus(),
    clearAllFeedback: "Removed all computer filters. Focus moved to the search input.",
    onChange: filterDesktops,
    getResultSummary: () => String(resultMeta?.textContent || "").trim()
  });

  await fetchDesktopsFromApi();
  // Always render with fallback + whatever API returns.
  // (If backend DB is locked, fetchDesktopsFromApi() sets apiDesktopProducts = [] and fallback still renders.)
  filterDesktops();
}


initDesktopPage();

