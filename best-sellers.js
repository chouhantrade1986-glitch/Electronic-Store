const CART_STORAGE_KEY = "electromart_cart_v1";
const CATEGORY_PRIORITY_SLUGS = ["laptop", "mobile", "audio", "accessory", "computer", "creator-studio"];

const bestSellers = [
  { id: 7, name: "Vector Gaming Laptop", brand: "Vector", category: "laptop", collections: ["laptop"], price: 1299, rating: 4.8, sold: "2.4k sold this month", soldCount: 2400, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Nimbus Phone X", brand: "Nimbus", category: "mobile", collections: ["mobile"], price: 749, rating: 4.7, sold: "3.1k sold this month", soldCount: 3100, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Pulse ANC Headphones", brand: "PulseWave", category: "audio", collections: ["audio"], price: 179, rating: 4.6, sold: "1.8k sold this month", soldCount: 1800, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: 1, name: "AstraBook Pro 14", brand: "AstraTech", category: "laptop", collections: ["laptop", "computer"], price: 999, rating: 4.6, sold: "2.0k sold this month", soldCount: 2000, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Orbit Mechanical Keyboard", brand: "OrbitX", category: "accessory", collections: ["accessory", "computer"], price: 109, rating: 4.5, sold: "1.5k sold this month", soldCount: 1500, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "Echo Smart Speaker", brand: "EchoSphere", category: "audio", collections: ["audio"], price: 89, rating: 4.4, sold: "2.7k sold this month", soldCount: 2700, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" }
];

const bestGrid = document.getElementById("bestGrid");
const resultMeta = document.getElementById("resultMeta");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const brandFilterList = document.getElementById("brandFilterList");
const sortFilter = document.getElementById("sortFilter");
const cartCount = document.getElementById("cartCount");
const deptTrigger = document.getElementById("deptTrigger");
const deptMenu = document.getElementById("deptMenu");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
let filterChipController = null;

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
  if (cartCount) {
    cartCount.textContent = String(total);
  }
}

function addToCart(id) {
  const cartMap = loadCartMap();
  const key = String(id);
  cartMap[key] = (Number(cartMap[key]) || 0) + 1;
  saveCartMap(cartMap);
  syncCartCount();
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeCategory(value) {
  const raw = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (raw === "accessories") {
    return "accessory";
  }
  if (raw === "computers") {
    return "computer";
  }
  if (raw === "mobiles") {
    return "mobile";
  }
  return raw;
}

function normalizeCollectionValues(collections, category) {
  const normalized = (Array.isArray(collections) ? collections : [])
    .map((item) => normalizeCategory(item))
    .filter(Boolean);
  const categoryValue = normalizeCategory(category);
  if (categoryValue) {
    normalized.push(categoryValue);
  }
  return Array.from(new Set(normalized));
}

function categoryLabel(value) {
  const labels = {
    accessory: "Accessories",
    audio: "Audio",
    computer: "Computers",
    "creator-studio": "Creator Studio",
    laptop: "Laptops",
    mobile: "Mobiles",
    printer: "Printers"
  };
  const normalized = normalizeCategory(value);
  if (labels[normalized]) {
    return labels[normalized];
  }
  return normalized.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function sortCategorySlugs(slugs) {
  const unique = Array.from(new Set((Array.isArray(slugs) ? slugs : []).filter(Boolean)));
  return unique.sort((left, right) => {
    const leftPriority = CATEGORY_PRIORITY_SLUGS.indexOf(left);
    const rightPriority = CATEGORY_PRIORITY_SLUGS.indexOf(right);
    if (leftPriority !== -1 || rightPriority !== -1) {
      if (leftPriority === -1) return 1;
      if (rightPriority === -1) return -1;
      return leftPriority - rightPriority;
    }
    return categoryLabel(left).localeCompare(categoryLabel(right));
  });
}

function normalizeBrandKey(value) {
  return String(value || "").trim().toLowerCase();
}

function getBrandFilters() {
  return brandFilterList ? Array.from(brandFilterList.querySelectorAll(".brand-filter")) : [];
}

function getSelectedBrands() {
  return getBrandFilters().filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
}

function getCategoryOptions() {
  return sortCategorySlugs(bestSellers.flatMap((item) => normalizeCollectionValues(item.collections, item.category)));
}

function syncDynamicCategoryUI() {
  if (!categoryFilter) {
    return;
  }
  const selected = normalizeCategory(categoryFilter.value || "all");
  const options = getCategoryOptions();
  categoryFilter.innerHTML = [
    "<option value='all'>All Categories</option>",
    ...options.map((slug) => `<option value="${escapeHtml(slug)}">${escapeHtml(categoryLabel(slug))}</option>`)
  ].join("");
  categoryFilter.value = options.includes(selected) ? selected : "all";
}

function syncDynamicBrandUI() {
  if (!brandFilterList) {
    return;
  }
  const selectedBrands = getSelectedBrands();
  const selectedKeys = new Set(selectedBrands.map((brand) => normalizeBrandKey(brand)));
  const activeCategory = normalizeCategory(categoryFilter?.value || "all");
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const source = bestSellers.filter((item) => {
    const collections = normalizeCollectionValues(item.collections, item.category);
    const categoryMatch = activeCategory === "all" || collections.includes(activeCategory);
    const queryMatch = !query || `${item.name} ${item.brand} ${collections.join(" ")}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
  const optionMap = new Map();
  [...source, ...bestSellers.filter((item) => selectedKeys.has(normalizeBrandKey(item.brand)))]
    .forEach((item) => {
      const brand = String(item.brand || "").trim();
      if (!brand) {
        return;
      }
      optionMap.set(normalizeBrandKey(brand), brand);
    });

  const options = Array.from(optionMap.values()).sort((left, right) => left.localeCompare(right));
  if (!options.length) {
    brandFilterList.innerHTML = "<p class='brand-filter-empty'>No brands match the current filters.</p>";
    return;
  }
  brandFilterList.innerHTML = options.map((brand) => {
    const checked = selectedKeys.has(normalizeBrandKey(brand)) ? " checked" : "";
    return `<label class="check-item"><input type="checkbox" class="brand-filter" value="${escapeHtml(brand)}"${checked} /> ${escapeHtml(brand)}</label>`;
  }).join("");
}

function card(item) {
  const detailUrl = `product-detail.html?id=${encodeURIComponent(item.id)}`;
  const brandUrl = `brands.html?brand=${encodeURIComponent(String(item.brand || "").trim())}`;
  return `
    <article class="product-card">
      <a href="${detailUrl}" aria-label="Open ${escapeHtml(item.name)}">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${escapeHtml(item.name)}</a></h3>
        <div class="meta">
          <span class="price">${escapeHtml(money(item.price))}</span>
          <span class="rating">${escapeHtml(String(item.rating))} &#9733;</span>
        </div>
        <p><a class="brand-line" href="${brandUrl}">by ${escapeHtml(item.brand)}</a></p>
        <span class="sold-tag">${escapeHtml(item.sold)}</span>
        <button class="add-btn" data-id="${escapeHtml(item.id)}" type="button">Add to Cart</button>
      </div>
    </article>
  `;
}

function render(list) {
  if (!resultMeta || !bestGrid) {
    return;
  }
  resultMeta.textContent = `Showing ${list.length} products`;
  if (!list.length) {
    bestGrid.innerHTML = "<div class='empty'>No exact matches found. Try clearing one filter or broadening the search.</div>";
    return;
  }
  bestGrid.innerHTML = list.map(card).join("");
}

function getSortLabel(value) {
  const labels = {
    sold_desc: "Most Sold",
    rating_desc: "Top Rated",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low"
  };
  return labels[value] || "Featured";
}

function getActiveListingFilters() {
  const filters = [];
  const query = String(searchInput?.value || "").trim();
  const category = String(categoryFilter?.value || "all");
  const sortValue = String(sortFilter?.value || "relevance");

  if (query) {
    filters.push({
      id: "search",
      label: `Search: \"${query}\"`,
      ariaLabel: `Remove search ${query}`,
      clear: () => { searchInput.value = ""; },
      focus: () => searchInput.focus(),
      feedback: `Removed search ${query}. Focus moved to the search input.`
    });
  }
  if (category !== "all") {
    const readable = categoryLabel(category);
    filters.push({
      id: "category",
      label: `Category: ${readable}`,
      ariaLabel: `Remove category filter ${readable}`,
      clear: () => { categoryFilter.value = "all"; },
      focus: () => categoryFilter.focus(),
      feedback: `Removed category filter ${readable}. Focus moved to the category filter.`
    });
  }
  getSelectedBrands().forEach((brand) => {
    filters.push({
      id: `brand-${normalizeBrandKey(brand)}`,
      label: `Brand: ${brand}`,
      ariaLabel: `Remove brand filter ${brand}`,
      clear: () => {
        const target = getBrandFilters().find((checkbox) => checkbox.value === brand);
        if (target) target.checked = false;
      },
      focus: () => getBrandFilters().find((checkbox) => checkbox.value === brand)?.focus(),
      feedback: `Removed brand filter ${brand}. Focus moved to the brand option.`
    });
  });
  if (sortValue !== "relevance") {
    const sortLabel = getSortLabel(sortValue);
    filters.push({
      id: "sort",
      label: `Sort: ${sortLabel}`,
      ariaLabel: `Remove sort filter ${sortLabel}`,
      clear: () => { sortFilter.value = "relevance"; },
      focus: () => sortFilter.focus(),
      feedback: `Removed sort order ${sortLabel}. Focus moved to the sort control.`
    });
  }
  return filters;
}

function sortBestSellers(items, sortValue) {
  const next = [...items];
  if (sortValue === "sold_desc") {
    next.sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0));
  } else if (sortValue === "rating_desc") {
    next.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  } else if (sortValue === "price_asc") {
    next.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortValue === "price_desc") {
    next.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }
  return next;
}

function applyInitialCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = normalizeCategory(params.get("category") || "");
  const allowed = new Set(["all", ...getCategoryOptions()]);
  if (requested && allowed.has(requested) && categoryFilter) {
    categoryFilter.value = requested;
  }
}

function filterBestSellers() {
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const category = normalizeCategory(categoryFilter?.value || "all");
  const sortValue = String(sortFilter?.value || "relevance");
  const selectedBrands = getSelectedBrands();

  syncDynamicCategoryUI();
  syncDynamicBrandUI();

  const filtered = bestSellers.filter((item) => {
    const collections = normalizeCollectionValues(item.collections, item.category);
    const queryMatch = !query || `${item.name} ${item.brand} ${collections.join(" ")}`.toLowerCase().includes(query);
    const categoryMatch = category === "all" || collections.includes(category);
    const brandMatch = !selectedBrands.length || selectedBrands.includes(item.brand);
    return queryMatch && categoryMatch && brandMatch;
  });

  render(sortBestSellers(filtered, sortValue));
  filterChipController?.update();
}

if (searchInput) {
  searchInput.addEventListener("input", filterBestSellers);
}
if (categoryFilter) {
  categoryFilter.addEventListener("change", filterBestSellers);
}
if (brandFilterList) {
  brandFilterList.addEventListener("change", (event) => {
    if (event.target.closest(".brand-filter")) {
      filterBestSellers();
    }
  });
}
if (sortFilter) {
  sortFilter.addEventListener("change", filterBestSellers);
}

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
syncDynamicCategoryUI();
applyInitialCategoryFromUrl();
syncDynamicBrandUI();
filterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: ".result-note",
  getFilters: getActiveListingFilters,
  clearAll: () => {
    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "all";
    getBrandFilters().forEach((checkbox) => {
      checkbox.checked = false;
    });
    if (sortFilter) sortFilter.value = "relevance";
  },
  focusAfterClearAll: () => searchInput?.focus(),
  clearAllFeedback: "Removed all listing filters. Focus moved to the search input.",
  onChange: filterBestSellers,
  getResultSummary: () => String(resultMeta?.textContent || "").trim()
});
filterBestSellers();
