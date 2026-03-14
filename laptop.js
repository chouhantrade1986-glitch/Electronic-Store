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

const laptops = [
  {
    id: 1,
    name: "AstraBook Pro 14",
    brand: "AstraTech",
    segment: "b2c",
    purpose: "office",
    processor: "intel",
    ram: "16GB",
    storage: "512GB SSD",
    price: 999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 7,
    name: "Vector Gaming Laptop",
    brand: "Vector",
    segment: "b2c",
    purpose: "gaming",
    processor: "amd",
    ram: "32GB",
    storage: "1TB SSD",
    price: 1299,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 9,
    name: "Office Laptop Bundle (10 Units)",
    brand: "AstraTech",
    segment: "b2b",
    purpose: "office",
    processor: "intel",
    ram: "16GB",
    storage: "512GB SSD",
    moq: 10,
    price: 8690,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
  }
];

const laptopGrid = document.getElementById("laptopGrid");
const resultMeta = document.getElementById("resultMeta");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const segmentFilter = document.getElementById("segmentFilter");
const brandFilterList = document.getElementById("brandFilterList");
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
let apiLaptopProducts = [];
let filterChipController = null;

function loadCatalogMap() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/")) {
    return raw;
  }
  let normalized = raw;
  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
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
    if (host.includes("m.media-amazon.com") || host.includes("images-amazon.com")) {
      url.pathname = url.pathname.replace(/\._[^/.]+_\./, ".");
      return url.toString();
    }
    return url.toString();
  } catch (error) {
    return "";
  }
}

function normalizeLaptopCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "laptops") {
    return "laptop";
  }
  return raw;
}

function mapCatalogLaptop(item) {
  if (!item || !item.id) {
    return null;
  }
  const category = normalizeLaptopCategory(item.category);
  const status = String(item.status || "active").toLowerCase();
  if (category !== "laptop" || status !== "active") {
    return null;
  }

  return {
    id: String(item.id),
    name: item.name || `Product #${item.id}`,
    brand: item.brand || "Generic",
    segment: String(item.segment || "b2c").toLowerCase(),
    purpose: String(item.purpose || "office").toLowerCase(),
    processor: String(item.processor || "intel").toLowerCase(),
    ram: item.ram || "16GB",
    storage: item.storage || "512GB SSD",
    featured: Boolean(item.featured),
    listPrice: Number(item.listPrice || item.price || 0),
    moq: Number(item.moq || 0),
    price: Number(item.price || 0),
    rating: Number(item.rating || 0),
    image: normalizeImageUrl(item.image) || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80"
  };
}

function getMergedLaptops() {
  const map = new Map(laptops.map((item) => [String(item.id), item]));
  Object.values(loadCatalogMap()).forEach((item) => {
    const mapped = mapCatalogLaptop(item);
    if (!mapped) {
      return;
    }
    map.set(String(mapped.id), mapped);
  });
  apiLaptopProducts.forEach((item) => {
    const mapped = mapCatalogLaptop(item);
    if (!mapped) {
      return;
    }
    map.set(String(mapped.id), mapped);
  });
  return Array.from(map.values());
}

async function fetchLaptopsFromApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/products?category=laptop&status=active&segment=all`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json().catch(() => ({}));
    apiLaptopProducts = Array.isArray(payload.products) ? payload.products : [];
  } catch (error) {
    apiLaptopProducts = [];
  }
}

function getBrandFilters() {
  return brandFilterList ? Array.from(brandFilterList.querySelectorAll(".brand-filter")) : [];
}

function getSelectedBrands() {
  return getBrandFilters()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
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

function syncDynamicBrandUI(items) {
  if (!brandFilterList) {
    return;
  }
  const selectedKeys = new Set(getSelectedBrands().map((brand) => normalizeBrandKey(brand)));
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const activeSegment = String(segmentFilter?.value || "all");
  const activePurpose = String(purposeFilter?.value || "all");

  const source = items.filter((item) => {
    const text = `${item.name} ${item.brand} ${item.processor} ${item.purpose} ${item.ram} ${item.storage}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = activeSegment === "all" || item.segment === activeSegment;
    const purposeMatch = activePurpose === "all" || item.purpose === activePurpose;
    return queryMatch && segmentMatch && purposeMatch;
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

function getRibbonLabel(item) {
  if (item.featured) {
    return "Featured";
  }
  const listPrice = Number(item.listPrice || item.price || 0);
  const price = Number(item.price || 0);
  if (listPrice > price) {
    return "Deal";
  }
  if (Number(item.rating || 0) >= 4.7) {
    return "Top Rated";
  }
  return "";
}

function laptopCard(item) {
  const detailUrl = `product-detail.html?id=${item.id}`;
  const bulk = item.segment === "b2b" && item.moq ? `<p class="bulk-meta">Minimum order quantity: ${item.moq}</p>` : "";
  const ribbon = getRibbonLabel(item);

  return `
    <article class="product-card">
      ${ribbon ? `<span class="card-ribbon">${ribbon}</span>` : ""}
      <a href="${detailUrl}" aria-label="Open ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${item.name}</a></h3>
        <div class="spec-row">
          <span class="spec-chip">${item.brand}</span>
          <span class="spec-chip">${titleCase(item.processor)} CPU</span>
          <span class="spec-chip">${titleCase(item.purpose)}</span>
          <span class="spec-chip">${item.ram}</span>
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
  if (list.length === 0) {
    laptopGrid.innerHTML = "<div class='empty'>No exact laptop matches found. Try clearing one filter or broadening the search.</div>";
    return;
  }
  laptopGrid.innerHTML = list.map(laptopCard).join("");
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
  getSelectedBrands().forEach((brand) => {
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
    next.sort((a, b) => (Number(b.rating) / Number(b.price)) - (Number(a.rating) / Number(a.price)));
  }
  return next;
}

function filterLaptops() {
  const source = getMergedLaptops();
  syncDynamicBrandUI(source);

  const query = String(searchInput.value || "").trim().toLowerCase();
  const segment = String(segmentFilter.value || "all");
  const selectedBrands = getSelectedBrands();
  const purpose = String(purposeFilter.value || "all");
  const sortValue = String(sortFilter.value || "relevance");

  const filtered = source.filter((item) => {
    const text = `${item.name} ${item.brand} ${item.processor} ${item.purpose} ${item.ram} ${item.storage}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = segment === "all" || item.segment === segment;
    const brandMatch = !selectedBrands.length || selectedBrands.includes(item.brand);
    const purposeMatch = purpose === "all" || item.purpose === purpose;
    return queryMatch && segmentMatch && brandMatch && purposeMatch;
  });

  render(sortItems(filtered, sortValue));
  filterChipController?.update();
}

async function refreshLaptops() {
  await fetchLaptopsFromApi();
  filterLaptops();
}

searchInput.addEventListener("input", filterLaptops);
if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterLaptops();
  });
}
segmentFilter.addEventListener("change", filterLaptops);
brandFilterList?.addEventListener("change", (event) => {
  if (event.target.closest(".brand-filter")) {
    filterLaptops();
  }
});
purposeFilter.addEventListener("change", filterLaptops);
sortFilter.addEventListener("change", filterLaptops);

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

syncCartCount();
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
    if (purposeFilter) {
      purposeFilter.value = "all";
    }
    if (sortFilter) {
      sortFilter.value = "relevance";
    }
  },
  focusAfterClearAll: () => searchInput?.focus(),
  clearAllFeedback: "Removed all laptop filters. Focus moved to the search input.",
  onChange: filterLaptops,
  getResultSummary: () => String(resultMeta?.textContent || "").trim()
});
refreshLaptops();
