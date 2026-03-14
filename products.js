const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const CATEGORY_STORAGE_KEY = "electromart_categories_v1";
const WISHLIST_STORAGE_KEY = "electromart_wishlist_v1";
const SEARCH_HISTORY_STORAGE_KEY = "electromart_search_history_v1";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const productsGrid = document.getElementById("productsGrid");
const resultMeta = document.getElementById("resultMeta");
const segmentFilter = document.getElementById("segmentFilter");
const categoryFilter = document.getElementById("categoryFilter");
const searchCatalogSelect = document.getElementById("searchCatalogSelect");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const cartCount = document.getElementById("cartCount");
const minPriceRange = document.getElementById("minPriceRange");
const maxPriceRange = document.getElementById("maxPriceRange");
const minPriceValue = document.getElementById("minPriceValue");
const maxPriceValue = document.getElementById("maxPriceValue");
const brandFilterList = document.getElementById("brandFilterList");
const sortFilter = document.getElementById("sortFilter");
const ratingChips = Array.from(document.querySelectorAll(".rating-chip"));
const deptTrigger = document.getElementById("deptTrigger");
const deptMenu = document.getElementById("deptMenu");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const activeFilterMeta = document.getElementById("activeFilterMeta");
const activeFilterChips = document.getElementById("activeFilterChips");
const filterChipFeedback = document.getElementById("filterChipFeedback");
const filterLiveStatus = document.getElementById("filterLiveStatus");
const resultsFooter = document.getElementById("resultsFooter");
const resultsWindowMeta = document.getElementById("resultsWindowMeta");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const quickViewModal = document.getElementById("quickViewModal");
const quickViewClose = document.getElementById("quickViewClose");
const quickViewImage = document.getElementById("quickViewImage");
const quickViewEyebrow = document.getElementById("quickViewEyebrow");
const quickViewTitle = document.getElementById("quickViewTitle");
const quickViewRating = document.getElementById("quickViewRating");
const quickViewPrice = document.getElementById("quickViewPrice");
const quickViewMeta = document.getElementById("quickViewMeta");
const quickViewDescription = document.getElementById("quickViewDescription");
const quickViewAddBtn = document.getElementById("quickViewAddBtn");
const quickViewWishlistBtn = document.getElementById("quickViewWishlistBtn");
const quickViewDetailsLink = document.getElementById("quickViewDetailsLink");
const searchSuggestions = document.getElementById("searchSuggestions");

let selectedMinRating = 0;
let currentQuickViewProductId = "";
let lastRenderedProducts = [];
let fullResultSet = [];
let visibleResultCount = 0;
const PRODUCTS_INITIAL_RENDER_LIMIT = 48;
const PRODUCTS_LOAD_MORE_STEP = 24;
const CORE_CATEGORY_SLUGS = ["computer", "laptop", "printer", "mobile", "audio", "accessory"];
const CATEGORY_PRIORITY_SLUGS = [...CORE_CATEGORY_SLUGS, "creator-studio"];
const fallbackProducts = [
  { id: "1", name: "AstraBook Pro 14", brand: "AstraTech", category: "laptop", segment: "b2c", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: "2", name: "Nimbus Phone X", brand: "Nimbus", category: "mobile", segment: "b2c", price: 749, rating: 4.5, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: "3", name: "Pulse ANC Headphones", brand: "PulseWave", category: "audio", segment: "b2c", price: 179, rating: 4.4, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: "7", name: "Vector Gaming Laptop", brand: "Vector", category: "laptop", segment: "b2c", price: 1299, rating: 4.8, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: "9", name: "Office Laptop Bundle (10 Units)", brand: "AstraTech", category: "laptop", segment: "b2b", price: 8690, rating: 4.7, moq: 10, image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80" },
  { id: "10", name: "Retail Smartphone Pack (25 Units)", brand: "Nimbus", category: "mobile", segment: "b2b", price: 15499, rating: 4.5, moq: 25, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80" },
  {
    id: "product_1772722039220",
    name: "Lenovo V15 G4 (2024)",
    brand: "Lenovo",
    category: "laptop",
    segment: "b2c",
    price: 36000,
    listPrice: 36000,
    rating: 0,
    moq: 0,
    image: "",
    status: "active",
    createdAt: "2026-03-05T14:47:19.204Z",
    updatedAt: "2026-03-05T14:47:19.204Z"
  },
  {
    id: "product_1773480601001",
    name: "AstraStudio Creator 16",
    brand: "AstraTech",
    segment: "b2c",
    category: "laptop",
    collections: ["laptop", "creator-studio", "computer"],
    price: 129999,
    listPrice: 139999,
    rating: 4.8,
    stock: 12,
    moq: 0,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    description: "16-inch creator laptop with a color-accurate display, fast SSD storage, and export-ready performance for video, design, and streaming workflows.",
    keywords: ["creator studio", "laptop", "video editing", "design"],
    sku: "ASTRA-CREATOR-16",
    status: "active",
    fulfillment: "fbm",
    featured: true,
    createdAt: "2026-03-14T09:10:01.000Z",
    updatedAt: "2026-03-14T09:10:01.000Z"
  },
  {
    id: "product_1773480601002",
    name: "OrbitX ViewPro 32 4K",
    brand: "OrbitX",
    segment: "b2c",
    category: "computer",
    collections: ["computer", "creator-studio"],
    price: 32999,
    listPrice: 37999,
    rating: 4.7,
    stock: 18,
    moq: 0,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    description: "32-inch 4K monitor tuned for editing timelines, grading work, and long studio sessions.",
    keywords: ["creator studio", "4k monitor", "color monitor", "editing"],
    sku: "ORBITX-VIEWPRO-32",
    status: "active",
    fulfillment: "fbm",
    featured: true,
    createdAt: "2026-03-14T09:12:00.000Z",
    updatedAt: "2026-03-14T09:12:00.000Z"
  },
  {
    id: "product_1773480601003",
    name: "PulseCast Pro USB Microphone",
    brand: "PulseWave",
    segment: "b2c",
    category: "audio",
    collections: ["audio", "creator-studio"],
    price: 8999,
    listPrice: 10999,
    rating: 4.6,
    stock: 26,
    moq: 0,
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    description: "USB creator microphone with a clean vocal profile for streaming, podcasts, and client calls.",
    keywords: ["creator studio", "microphone", "podcast", "streaming"],
    sku: "PULSECAST-PRO-USB",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:14:00.000Z",
    updatedAt: "2026-03-14T09:14:00.000Z"
  },
  {
    id: "product_1773480601004",
    name: "Nimbus StreamCam 4K",
    brand: "Nimbus",
    segment: "b2c",
    category: "accessory",
    collections: ["accessory", "creator-studio"],
    price: 6999,
    listPrice: 8499,
    rating: 4.5,
    stock: 31,
    moq: 0,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    description: "Compact 4K webcam with autofocus and sharp framing for live sessions and remote shoots.",
    keywords: ["creator studio", "webcam", "4k camera", "streaming"],
    sku: "NIMBUS-STREAMCAM-4K",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:16:00.000Z",
    updatedAt: "2026-03-14T09:16:00.000Z"
  },
  {
    id: "product_1773480601005",
    name: "VectorDock 12-in-1 Thunderbolt Hub",
    brand: "Vector",
    segment: "b2c",
    category: "accessory",
    collections: ["accessory", "creator-studio", "computer"],
    price: 11999,
    listPrice: 13999,
    rating: 4.4,
    stock: 22,
    moq: 0,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
    description: "Single-cable dock with creator-friendly ports for drives, monitors, cameras, and fast charging.",
    keywords: ["creator studio", "dock", "thunderbolt", "hub"],
    sku: "VECTORDOCK-12IN1",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:18:00.000Z",
    updatedAt: "2026-03-14T09:18:00.000Z"
  },
  {
    id: "product_1773480601006",
    name: "AstraPad Pen Display 13",
    brand: "AstraTech",
    segment: "b2c",
    category: "computer",
    collections: ["computer", "creator-studio"],
    price: 45999,
    listPrice: 49999,
    rating: 4.7,
    stock: 9,
    moq: 0,
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=900&q=80",
    description: "13-inch pen display for sketching, retouching, and precise creative control across design workflows.",
    keywords: ["creator studio", "pen display", "illustration", "design"],
    sku: "ASTRAPAD-13",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    createdAt: "2026-03-14T09:20:00.000Z",
    updatedAt: "2026-03-14T09:20:00.000Z"
  }
];
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
let searchDebounceTimer = null;
let hasRenderedFilterSummary = false;
let lastFilterAnnouncement = "";
let pendingFilterAnnouncement = "";
let filterChipFeedbackTimer = 0;

function setProductsGridBusy(isBusy) {
  if (!productsGrid) {
    return;
  }
  productsGrid.setAttribute("aria-busy", isBusy ? "true" : "false");
}

function categoryLabel(value) {
  const normalized = normalizeCategory(value);
  const knownLabels = {
    accessory: "Accessories",
    audio: "Audio",
    computer: "Computers",
    laptop: "Laptops",
    mobile: "Mobiles",
    printer: "Printers"
  };
  if (knownLabels[normalized]) {
    return knownLabels[normalized];
  }
  return String(normalized || "")
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function loadCategoryRecords() {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed.map((slug) => ({ slug: String(slug).toLowerCase(), name: categoryLabel(slug), active: true }));
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function getActiveCategorySlugs() {
  const records = loadCategoryRecords();
  const fromRecords = records
    .filter((item) => item && item.active !== false)
    .map((item) => normalizeCategory(item.slug || item.name || ""))
    .filter((slug) => slug && slug !== "all-products");

  const fromCatalog = loadCatalogProductsList()
    .flatMap((item) => normalizeCollectionValues(item.collections, item.category))
    .filter((slug) => slug && slug !== "all-products");

  const fromFallback = fallbackProducts
    .flatMap((item) => normalizeCollectionValues(item.collections, item.category))
    .filter((slug) => slug && slug !== "all-products");

  const merged = Array.from(new Set([...fromRecords, ...fromCatalog, ...fromFallback]));
  if (merged.length) {
    return merged;
  }
  return CORE_CATEGORY_SLUGS.slice();
}

function sortCategorySlugs(slugs) {
  const unique = Array.from(new Set((Array.isArray(slugs) ? slugs : []).filter(Boolean)));
  return unique.sort((left, right) => {
    const leftPriority = CATEGORY_PRIORITY_SLUGS.indexOf(left);
    const rightPriority = CATEGORY_PRIORITY_SLUGS.indexOf(right);
    if (leftPriority !== -1 || rightPriority !== -1) {
      if (leftPriority === -1) {
        return 1;
      }
      if (rightPriority === -1) {
        return -1;
      }
      return leftPriority - rightPriority;
    }
    return categoryLabel(left).localeCompare(categoryLabel(right));
  });
}

function getSearchCategorySlugs() {
  return sortCategorySlugs(getActiveCategorySlugs());
}

function syncDynamicCategoryUI() {
  const slugs = getSearchCategorySlugs();
  const topSelected = normalizeCategory(searchCatalogSelect?.value || categoryFilter?.value || "all");
  if (categoryFilter) {
    const selected = normalizeCategory(categoryFilter.value || "all");
    categoryFilter.innerHTML = [
      "<option value='all'>All Categories</option>",
      ...slugs.map((slug) => `<option value="${slug}">${categoryLabel(slug)}</option>`)
    ].join("");
    categoryFilter.value = slugs.includes(selected) ? selected : "all";
  }
  if (searchCatalogSelect) {
    searchCatalogSelect.innerHTML = [
      "<option value='all'>All Catalogue</option>",
      ...slugs.map((slug) => `<option value="${slug}">${categoryLabel(slug)}</option>`)
    ].join("");
    searchCatalogSelect.value = slugs.includes(topSelected) ? topSelected : "all";
  }
}

function syncSearchCategoryControls(nextValue) {
  const allowed = new Set(["all", ...getSearchCategorySlugs()]);
  const normalized = normalizeCategory(nextValue || "all");
  const safeValue = allowed.has(normalized) ? normalized : "all";
  if (categoryFilter) {
    categoryFilter.value = safeValue;
  }
  if (searchCatalogSelect) {
    searchCatalogSelect.value = safeValue;
  }
  return safeValue;
}

function getBrandFilters() {
  return brandFilterList ? Array.from(brandFilterList.querySelectorAll(".brand-filter")) : [];
}

function normalizeBrandKey(value) {
  return String(value || "").trim().toLowerCase();
}

function choosePreferredBrandLabel(currentValue, nextValue) {
  const current = String(currentValue || "").trim();
  const next = String(nextValue || "").trim();
  if (!current) {
    return next;
  }
  if (!next) {
    return current;
  }
  const currentHasUpper = /[A-Z]/.test(current);
  const nextHasUpper = /[A-Z]/.test(next);
  if (!currentHasUpper && nextHasUpper) {
    return next;
  }
  return current;
}

function getProductsForBrandOptions(sourceProducts) {
  const selectedCategory = categoryFilter.value;
  const selectedSegment = segmentFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const minPrice = Number(minPriceRange.value);
  const maxPrice = Number(maxPriceRange.value);
  const priceFloor = Math.min(minPrice, maxPrice);
  const priceCeil = Math.max(minPrice, maxPrice);

  return sourceProducts.filter((item) => {
    const collections = normalizeCollectionValues(item.collections, item.category);
    const queryMatch = !query || `${item.name} ${item.brand} ${item.category} ${collections.join(" ")}`.toLowerCase().includes(query);
    const categoryMatch = categoryMatchesSelection(selectedCategory, collections);
    const segmentMatch = selectedSegment === "all" || item.segment === selectedSegment;
    const priceMatch = Number(item.price || 0) >= priceFloor && Number(item.price || 0) <= priceCeil;
    const ratingMatch = Number(item.rating || 0) >= selectedMinRating;
    return queryMatch && categoryMatch && segmentMatch && priceMatch && ratingMatch;
  });
}

function syncDynamicBrandUI(sourceProducts = mergeProductsById(fallbackProducts, loadCatalogProductsList())) {
  if (!brandFilterList) {
    return;
  }

  const selectedBrands = getSelectedBrands();
  const selectedBrandKeys = new Set(selectedBrands.map((brand) => normalizeBrandKey(brand)));
  const optionMap = new Map();
  const relevantProducts = getProductsForBrandOptions(sourceProducts);
  const productsForOptions = [...relevantProducts, ...sourceProducts.filter((item) => selectedBrandKeys.has(normalizeBrandKey(item.brand)))];

  productsForOptions.forEach((item) => {
    const brand = String(item?.brand || "").trim();
    if (!brand) {
      return;
    }
    const key = normalizeBrandKey(brand);
    const existing = optionMap.get(key);
    optionMap.set(key, {
      key,
      label: choosePreferredBrandLabel(existing?.label, brand)
    });
  });

  const options = Array.from(optionMap.values()).sort((left, right) => left.label.localeCompare(right.label));
  if (!options.length) {
    brandFilterList.innerHTML = "<p class='brand-filter-empty'>No brands match the current filters.</p>";
    return;
  }

  brandFilterList.innerHTML = options
    .map((option) => {
      const checked = selectedBrandKeys.has(option.key) ? " checked" : "";
      return `<label class="check-item"><input type="checkbox" class="brand-filter" value="${escapeSuggestionHtml(option.label)}"${checked} /> ${escapeSuggestionHtml(option.label)}</label>`;
    })
    .join("");
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

function loadWishlistIds() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveWishlistIds(ids) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids.map((item) => String(item).trim()).filter(Boolean)))));
  } catch (error) {
    return;
  }
}

function isWishlisted(productId) {
  return loadWishlistIds().includes(String(productId));
}

function toggleWishlist(productId) {
  const key = String(productId).trim();
  if (!key) {
    return false;
  }
  const ids = loadWishlistIds();
  if (ids.includes(key)) {
    saveWishlistIds(ids.filter((item) => item !== key));
    return false;
  }
  saveWishlistIds([key, ...ids]);
  return true;
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

function saveCatalogMap(catalogMap) {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
  } catch (error) {
    return;
  }
}

function cacheCatalogProduct(product) {
  if (!product || !product.id) {
    return;
  }
  const key = String(product.id).trim();
  if (!key) {
    return;
  }
  const next = loadCatalogMap();
  const existing = next[key] || {};
  next[key] = {
    ...existing,
    ...product,
    id: key,
    name: product.name || existing.name || `Product #${key}`,
    price: Number(product.price ?? existing.price ?? 0),
    listPrice: Number(product.listPrice ?? existing.listPrice ?? product.price ?? 0),
    rating: Number(product.rating ?? existing.rating ?? 0),
    stock: Number(product.stock ?? existing.stock ?? 0),
    moq: Number(product.moq ?? existing.moq ?? 0),
    image: product.image || existing.image || fallbackImage(),
    images: Array.isArray(product.images) ? product.images : (Array.isArray(existing.images) ? existing.images : []),
    videos: Array.isArray(product.videos) ? product.videos : (Array.isArray(existing.videos) ? existing.videos : []),
    media: Array.isArray(product.media) ? product.media : (Array.isArray(existing.media) ? existing.media : []),
    keywords: Array.isArray(product.keywords) ? product.keywords : (Array.isArray(existing.keywords) ? existing.keywords : []),
    description: String(product.description ?? existing.description ?? "").trim(),
    sku: String(product.sku ?? existing.sku ?? "").trim(),
    status: String(product.status ?? existing.status ?? "active"),
    fulfillment: String(product.fulfillment ?? existing.fulfillment ?? "fbm"),
    featured: Boolean(product.featured ?? existing.featured ?? false)
  };
  saveCatalogMap(next);
}

function cacheCatalogProducts(productsList) {
  if (!Array.isArray(productsList) || !productsList.length) {
    return;
  }
  const next = loadCatalogMap();
  let changed = false;
  productsList.forEach((product) => {
    if (!product || !product.id) {
      return;
    }
    const key = String(product.id).trim();
    if (!key) {
      return;
    }
    const existing = next[key] || {};
    next[key] = {
      ...existing,
      ...product,
      id: key,
      name: product.name || existing.name || `Product #${key}`,
      price: Number(product.price ?? existing.price ?? 0),
      listPrice: Number(product.listPrice ?? existing.listPrice ?? product.price ?? 0),
      rating: Number(product.rating ?? existing.rating ?? 0),
      stock: Number(product.stock ?? existing.stock ?? 0),
      moq: Number(product.moq ?? existing.moq ?? 0),
      image: product.image || existing.image || fallbackImage(),
      images: Array.isArray(product.images) ? product.images : (Array.isArray(existing.images) ? existing.images : []),
      videos: Array.isArray(product.videos) ? product.videos : (Array.isArray(existing.videos) ? existing.videos : []),
      media: Array.isArray(product.media) ? product.media : (Array.isArray(existing.media) ? existing.media : []),
      keywords: Array.isArray(product.keywords) ? product.keywords : (Array.isArray(existing.keywords) ? existing.keywords : []),
      description: String(product.description ?? existing.description ?? "").trim(),
      sku: String(product.sku ?? existing.sku ?? "").trim(),
      status: String(product.status ?? existing.status ?? "active"),
      fulfillment: String(product.fulfillment ?? existing.fulfillment ?? "fbm"),
      featured: Boolean(product.featured ?? existing.featured ?? false)
    };
    changed = true;
  });
  if (changed) {
    saveCatalogMap(next);
  }
}

function syncCartCount() {
  const cartMap = loadCartMap();
  const total = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(total);
}

function addProductToCart(productId) {
  const cartMap = loadCartMap();
  const key = String(productId);
  cartMap[key] = (Number(cartMap[key]) || 0) + 1;
  saveCartMap(cartMap);
  syncCartCount();
}

function getSelectedBrands() {
  return getBrandFilters().filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function getProductShortDescription(product) {
  const raw = String(product?.description || "").trim();
  if (raw) {
    return raw.replace(/\s+/g, " ").slice(0, 160);
  }
  return `${product?.brand || "ElectroMart"} ${categoryLabel(product?.category)} range with trusted ratings, strong delivery support, and buyer-friendly pricing.`;
}

function loadSearchHistory() {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveSearchHistory(entries) {
  try {
    const unique = Array.from(new Set(entries.map((item) => String(item).trim()).filter(Boolean)));
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(unique.slice(0, 6)));
  } catch (error) {
    return;
  }
}

function rememberSearchQuery(query) {
  const value = String(query || "").trim();
  if (!value) {
    return;
  }
  saveSearchHistory([value, ...loadSearchHistory()]);
}

function syncRatingChipUI() {
  ratingChips.forEach((chip) => {
    chip.classList.toggle("active", chip.getAttribute("data-rating") === String(selectedMinRating));
  });
}

function showFilterChipFeedback(message) {
  if (!filterChipFeedback) {
    return;
  }
  window.clearTimeout(filterChipFeedbackTimer);
  if (!message) {
    filterChipFeedback.hidden = true;
    filterChipFeedback.textContent = "";
    return;
  }
  filterChipFeedback.hidden = false;
  filterChipFeedback.textContent = message;
  filterChipFeedbackTimer = window.setTimeout(() => {
    filterChipFeedback.hidden = true;
    filterChipFeedback.textContent = "";
  }, 2600);
}

function getProductStockState(product) {
  const stock = Number(product?.stock);
  if (Number.isFinite(stock)) {
    if (stock <= 0) {
      return { rank: 2, label: "Out of stock" };
    }
    if (stock <= 3) {
      return { rank: 1, label: `Low stock: ${stock} left` };
    }
    return { rank: 0, label: "In stock" };
  }
  return { rank: 0, label: "In stock" };
}

function updatePriceLabels() {
  minPriceValue.textContent = money(minPriceRange.value);
  maxPriceValue.textContent = money(maxPriceRange.value);
}

function escapeSuggestionHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeSuggestionRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightSuggestionQuery(text, query) {
  const raw = String(text || "");
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    return escapeSuggestionHtml(raw);
  }

  const matcher = new RegExp(`(${escapeSuggestionRegExp(cleanQuery)})`, "ig");
  const parts = raw.split(matcher);
  if (parts.length === 1) {
    return escapeSuggestionHtml(raw);
  }

  return parts
    .map((part, index) => (index % 2 === 1 ? `<mark>${escapeSuggestionHtml(part)}</mark>` : escapeSuggestionHtml(part)))
    .join("");
}

function renderSuggestionCard(item, query) {
  const media =
    item.type === "product" && item.image
      ? `
        <span class="suggestion-media suggestion-thumb" aria-hidden="true">
          <img src="${escapeSuggestionHtml(item.image)}" alt="" loading="lazy" />
        </span>
      `
      : `<span class="suggestion-media suggestion-icon suggestion-icon--${escapeSuggestionHtml(item.type)}" aria-hidden="true"></span>`;

  const kicker = item.kicker
    ? `<span class="suggestion-kicker">${escapeSuggestionHtml(item.kicker)}</span>`
    : "";
  const meta = item.meta
    ? `<span class="suggestion-meta">${highlightSuggestionQuery(item.meta, query)}</span>`
    : "";
  const trailingParts = [];
  if (item.priceText) {
    trailingParts.push(`<span class="suggestion-price">${escapeSuggestionHtml(item.priceText)}</span>`);
  }
  if (item.action) {
    trailingParts.push(`<span class="suggestion-action">${escapeSuggestionHtml(item.action)}</span>`);
  }
  const trailing = trailingParts.length
    ? `<span class="suggestion-trailing">${trailingParts.join("")}</span>`
    : "";

  return `
    <button class="suggestion-item suggestion-item--${escapeSuggestionHtml(item.type)}" type="button" data-suggestion-type="${escapeSuggestionHtml(item.type)}" data-suggestion-value="${escapeSuggestionHtml(item.value)}">
      ${media}
      <span class="suggestion-copy">
        ${kicker}
        <span class="suggestion-label">${highlightSuggestionQuery(item.label, query)}</span>
        ${meta}
      </span>
      ${trailing}
    </button>
  `;
}

function renderSuggestionSection(title, items, query) {
  if (!items.length) {
    return "";
  }
  return `
    <section class="suggestion-group">
      <div class="suggestion-group-head">
        <p class="suggestion-group-label">${escapeSuggestionHtml(title)}</p>
        ${title === "Recent Searches" ? '<button class="suggestion-clear" type="button" data-clear-search-history="1">Clear</button>' : ""}
      </div>
      ${items.map((item) => renderSuggestionCard(item, query)).join("")}
    </section>
  `;
}

function renderSuggestionEmptyState(query) {
  return `
    <div class="suggestion-empty">
      <strong>No direct matches yet</strong>
      <span>Press Search to explore all results for "${escapeSuggestionHtml(query)}".</span>
    </div>
  `;
}

function closeSearchSuggestions() {
  if (!searchSuggestions) {
    return;
  }
  searchSuggestions.hidden = true;
  searchSuggestions.innerHTML = "";
  searchSuggestions.setAttribute("aria-hidden", "true");
  searchInput?.setAttribute("aria-expanded", "false");
  searchInput?.removeAttribute("aria-activedescendant");
  resetSearchSuggestionNavigation();
}

function clearSearchHistory() {
  saveSearchHistory([]);
}

let activeSearchSuggestionIndex = -1;

function getSearchSuggestionButtons() {
  return searchSuggestions
    ? Array.from(searchSuggestions.querySelectorAll("[data-suggestion-type]"))
    : [];
}

function prepareSearchSuggestionAccessibility() {
  if (!searchSuggestions || !searchInput) {
    return;
  }
  searchSuggestions.setAttribute("role", "listbox");
  searchSuggestions.setAttribute("aria-hidden", searchSuggestions.hidden ? "true" : "false");
  searchInput.setAttribute("aria-controls", "searchSuggestions");
  searchInput.setAttribute("aria-expanded", searchSuggestions.hidden ? "false" : "true");
  getSearchSuggestionButtons().forEach((item, index) => {
    if (!item.id) {
      item.id = `products-search-suggestion-${index}`;
    }
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", item.classList.contains("is-active") ? "true" : "false");
  });
}

function resetSearchSuggestionNavigation() {
  activeSearchSuggestionIndex = -1;
  getSearchSuggestionButtons().forEach((item) => {
    item.classList.remove("is-active");
    item.setAttribute("aria-selected", "false");
  });
  searchInput?.removeAttribute("aria-activedescendant");
}

function setActiveSearchSuggestionIndex(nextIndex) {
  const items = getSearchSuggestionButtons();
  if (!items.length) {
    activeSearchSuggestionIndex = -1;
    return -1;
  }
  const safeIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
  activeSearchSuggestionIndex = safeIndex;
  items.forEach((item, index) => {
    const active = index === safeIndex;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", active ? "true" : "false");
  });
  searchInput?.setAttribute("aria-activedescendant", items[safeIndex].id);
  items[safeIndex].scrollIntoView({ block: "nearest" });
  return safeIndex;
}

function moveActiveSearchSuggestion(direction) {
  const items = getSearchSuggestionButtons();
  if (!items.length) {
    return false;
  }
  if (activeSearchSuggestionIndex < 0) {
    setActiveSearchSuggestionIndex(direction > 0 ? 0 : items.length - 1);
    return true;
  }
  const nextIndex = (activeSearchSuggestionIndex + direction + items.length) % items.length;
  setActiveSearchSuggestionIndex(nextIndex);
  return true;
}

function activateActiveSearchSuggestion() {
  const items = getSearchSuggestionButtons();
  if (activeSearchSuggestionIndex < 0 || !items[activeSearchSuggestionIndex]) {
    return false;
  }
  const activeItem = items[activeSearchSuggestionIndex];
  const type = activeItem.getAttribute("data-suggestion-type");
  const value = String(activeItem.getAttribute("data-suggestion-value") || "").trim();
  handleSuggestionSelection(type, value);
  return true;
}

function handleSearchSuggestionKeydown(event) {
  if (!searchSuggestions || !searchInput) {
    return;
  }
  if (event.key === "Escape") {
    if (!searchSuggestions.hidden) {
      event.preventDefault();
      closeSearchSuggestions();
    }
    return;
  }
  if (event.key === "Tab") {
    if (searchSuggestions.hidden) {
      return;
    }
    const items = getSearchSuggestionButtons();
    if (!items.length) {
      if (event.shiftKey) {
        closeSearchSuggestions();
      }
      return;
    }
    if (event.shiftKey) {
      closeSearchSuggestions();
      return;
    }
    event.preventDefault();
    const nextIndex = activeSearchSuggestionIndex >= 0 ? activeSearchSuggestionIndex : 0;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
    return;
  }
  if (searchSuggestions.hidden) {
    renderSearchSuggestions();
  }
  const items = getSearchSuggestionButtons();
  if (!items.length) {
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveActiveSearchSuggestion(1);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveActiveSearchSuggestion(-1);
    return;
  }
  if (event.key === "Enter" && activeSearchSuggestionIndex >= 0) {
    event.preventDefault();
    activateActiveSearchSuggestion();
  }
}

function handleSuggestionSelection(type, value) {
  closeSearchSuggestions();
  if (type === "product" && value) {
    window.location.href = `product-detail.html?id=${encodeURIComponent(value)}`;
    return;
  }
  if (type === "category" && value) {
    rememberSearchQuery(categoryLabel(value));
    syncSearchCategoryControls(value);
    searchInput.value = "";
    fetchProductsFromApi();
    return;
  }
  if (type === "history" && value) {
    searchInput.value = value;
    rememberSearchQuery(value);
    fetchProductsFromApi();
  }
}

function renderSearchSuggestions() {
  if (!searchSuggestions || !searchInput) {
    return;
  }
  const query = String(searchInput.value || "").trim().toLowerCase();
  if (!query) {
    const recent = loadSearchHistory();
    if (!recent.length) {
      closeSearchSuggestions();
      return;
    }
    searchSuggestions.innerHTML = renderSuggestionSection(
      "Recent Searches",
      recent.map((item) => ({
        type: "history",
        value: item,
        label: item,
        meta: "Recent search",
        kicker: "Recent",
        action: "Use"
      })),
      ""
    );
    searchSuggestions.hidden = false;
    prepareSearchSuggestionAccessibility();
    resetSearchSuggestionNavigation();
    return;
  }
  if (query.length < 2) {
    closeSearchSuggestions();
    return;
  }

  const sourceProducts = mergeProductsById(fallbackProducts, loadCatalogProductsList());
  const categoryMatches = Array.from(new Set(sourceProducts
    .map((item) => normalizeCategory(item.category))
    .filter((category) => category && categoryLabel(category).toLowerCase().includes(query))))
    .slice(0, 2)
    .map((category) => ({
      type: "category",
      value: category,
      label: categoryLabel(category),
      meta: "Browse category",
      kicker: "Category",
      action: "Browse"
    }));

  const productMatches = sourceProducts
    .filter((item) => `${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(query))
    .map((item) => {
      const stockState = getProductStockState(item);
      return {
        type: "product",
        value: String(item.id),
        label: item.name,
        meta: `${item.brand || "ElectroMart"} | ${categoryLabel(normalizeCategory(item.category))} | ${stockState.label}`,
        kicker: Number(item.rating || 0) > 0 ? `${Number(item.rating).toFixed(1)} star rated` : "Top match",
        stockRank: stockState.rank,
        priceText: money(item.price),
        action: "View",
        image: normalizeImageUrl(item.image) || fallbackImage()
      };
    })
    .sort((a, b) => a.stockRank - b.stockRank || a.label.localeCompare(b.label))
    .slice(0, 4);

  const markup = [
    renderSuggestionSection("Categories", categoryMatches, query),
    renderSuggestionSection("Top Matches", productMatches, query)
  ]
    .filter(Boolean)
    .join("");

  if (!markup) {
    searchSuggestions.innerHTML = renderSuggestionEmptyState(String(searchInput.value || "").trim());
    searchSuggestions.hidden = false;
    prepareSearchSuggestionAccessibility();
    resetSearchSuggestionNavigation();
    return;
  }

  searchSuggestions.innerHTML = markup;
  searchSuggestions.hidden = false;
  prepareSearchSuggestionAccessibility();
  resetSearchSuggestionNavigation();
}

function handleSuggestionListKeydown(event) {
  const suggestion = event.target.closest("[data-suggestion-type]");
  if (!suggestion) {
    return;
  }
  const items = getSearchSuggestionButtons();
  const currentIndex = items.indexOf(suggestion);
  if (currentIndex < 0) {
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    const nextIndex = (currentIndex + 1) % items.length;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    const nextIndex = (currentIndex - 1 + items.length) % items.length;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (event.key === "Tab") {
    if (event.shiftKey) {
      event.preventDefault();
      if (currentIndex === 0) {
        searchInput.focus();
        setActiveSearchSuggestionIndex(0);
        return;
      }
      const prevIndex = currentIndex - 1;
      setActiveSearchSuggestionIndex(prevIndex);
      items[prevIndex].focus();
      return;
    }
    if (currentIndex === items.length - 1) {
      window.setTimeout(() => closeSearchSuggestions(), 0);
      return;
    }
    event.preventDefault();
    const nextIndex = currentIndex + 1;
    setActiveSearchSuggestionIndex(nextIndex);
    items[nextIndex].focus();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeSearchSuggestions();
    searchInput.focus();
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const type = suggestion.getAttribute("data-suggestion-type");
    const value = String(suggestion.getAttribute("data-suggestion-value") || "").trim();
    handleSuggestionSelection(type, value);
  }
}

function mapSort(value) {
  if (value === "price-asc") {
    return "price_asc";
  }
  if (value === "price-desc") {
    return "price_desc";
  }
  if (value === "rating-desc") {
    return "rating_desc";
  }
  return "relevance";
}

function fallbackImage() {
  return "./product-placeholder.svg";
}

function normalizeImageUrl(value) {
  const rawValue = String(value || "").trim();
  if (rawValue.startsWith("data:image/") || rawValue.startsWith("data:video/")) {
    return rawValue;
  }
  const raw = rawValue.includes(";") || rawValue.includes("|")
    ? (rawValue.split(/[;|]/).map((item) => item.trim()).find(Boolean) || "")
    : rawValue;
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/")) {
    return raw;
  }
  if (raw.startsWith("blob:")) {
    return raw;
  }
  if (raw.startsWith("/")) {
    return raw;
  }

  const isLikelyDomainWithoutProtocol = /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw);
  let normalized = raw;
  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  } else if (!/^https?:\/\//i.test(normalized) && isLikelyDomainWithoutProtocol) {
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
    if (host.includes("m.media-amazon.com") || host.includes("images-amazon.com")) {
      url.pathname = url.pathname.replace(/\._[^/.]+_\./, ".");
      return url.toString();
    }
    return url.toString();
  } catch (error) {
    return "";
  }
}

function normalizeCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "accessories") {
    return "accessory";
  }
  if (raw === "computers") {
    return "computer";
  }
  return raw || "accessory";
}

function normalizeCollectionValues(value, fallbackCategory = "") {
  const list = Array.isArray(value)
    ? value
    : String(value || "").split(/[;|,]+/);
  const normalized = list
    .map((item) => normalizeCategory(item))
    .filter(Boolean)
    .filter((item) => item !== "all" && item !== "all-products");
  const fallback = normalizeCategory(fallbackCategory);
  if (fallback && !normalized.includes(fallback)) {
    normalized.unshift(fallback);
  }
  return [...new Set(normalized)].slice(0, 8);
}

function isLaptopFamilyToken(token) {
  const value = normalizeCategory(token);
  if (!value) {
    return false;
  }
  if (["laptop", "all-laptop", "touch-laptop", "ryzen-laptops", "renewed-laptops", "business-laptop"].includes(value)) {
    return true;
  }
  return /^(acer|asus|dell|hp|lenovo)-laptop$/.test(value);
}

function categoryMatchesSelection(selectedCategory, productCollections) {
  if (selectedCategory === "all") {
    return true;
  }
  const tokens = Array.isArray(productCollections)
    ? productCollections.map((item) => normalizeCategory(item))
    : [];
  if (tokens.includes(selectedCategory)) {
    return true;
  }

  if (selectedCategory === "all-laptop") {
    return tokens.some(isLaptopFamilyToken);
  }

  if (selectedCategory === "laptop") {
    return tokens.includes("laptop") || tokens.some(isLaptopFamilyToken);
  }

  const brandLaptopMatch = selectedCategory.match(/^([a-z0-9]+)-laptop$/);
  if (brandLaptopMatch) {
    const brandToken = brandLaptopMatch[1];
    return (tokens.includes("laptop") && tokens.includes(brandToken)) || tokens.includes(selectedCategory);
  }

  return false;
}

function mapCatalogProduct(item) {
  if (!item || !item.id) {
    return null;
  }
  const category = normalizeCategory(item.category);
  const collections = normalizeCollectionValues(item.collections, category);
  return {
    id: String(item.id),
    name: item.name || `Product #${item.id}`,
    brand: item.brand || "Generic",
    category,
    collections,
    segment: String(item.segment || "b2c").toLowerCase(),
    featured: Boolean(item.featured),
    listPrice: Number(item.listPrice || item.price || 0),
    price: Number(item.price || 0),
    rating: Number(item.rating || 0),
    stock: Number(item.stock),
    moq: Number(item.moq || 0),
    image: normalizeImageUrl(item.image) || fallbackImage()
  };
}

function loadCatalogProductsList() {
  const map = loadCatalogMap();
  return Object.values(map)
    .map(mapCatalogProduct)
    .filter((item) => item && item.name && Number(item.price || 0) > 0);
}

function mergeProductsById(...lists) {
  const merged = new Map();
  lists.flat().forEach((item) => {
    if (!item || !item.id) {
      return;
    }
    const normalized = mapCatalogProduct(item);
    if (!normalized) {
      return;
    }
    merged.set(String(normalized.id), normalized);
  });
  return Array.from(merged.values());
}

function getProductHighlights(product) {
  const category = String(product.category || "").toLowerCase();
  const rating = Number(product.rating || 0).toFixed(1);
  const highlights = [`${rating} star customer rating`];

  if (category === "laptop") {
    highlights.push("Performance laptop configuration");
    highlights.push("Fast SSD storage and all-day productivity");
  } else if (category === "mobile") {
    highlights.push("Advanced camera and display setup");
    highlights.push("Long battery backup for daily use");
  } else if (category === "audio") {
    highlights.push("Clear sound with immersive audio profile");
    highlights.push("Comfort fit for long listening sessions");
  } else {
    highlights.push("Durable electronics accessory build");
    highlights.push("Reliable performance for home and office");
  }

  if (product.segment === "b2b" && product.moq) {
    highlights.push(`Bulk ready with MOQ ${product.moq}`);
  } else {
    highlights.push("Eligible for fast dispatch");
  }

  return highlights.slice(0, 3);
}

function getRibbonLabel(product) {
  if (product.featured) {
    return "Featured";
  }
  const listPrice = Number(product.listPrice || product.price || 0);
  const price = Number(product.price || 0);
  if (listPrice > price) {
    return "Deal";
  }
  if (Number(product.rating || 0) >= 4.7) {
    return "Top Rated";
  }
  return "";
}

function renderActiveFilterMeta() {
  if (!activeFilterMeta) {
    return;
  }
  const state = getCurrentFilterState();
  const minCap = Number(minPriceRange?.min || 0);
  const maxCap = Number(maxPriceRange?.max || 0);
  const summaryBits = [];
  const chips = [];

  if (state.query) {
    const label = `Search: "${state.query}"`;
    summaryBits.push(label);
    chips.push({
      action: "search",
      value: "",
      label,
      ariaLabel: `Remove search ${state.query}`
    });
  }
  if (state.category !== "all") {
    const readableCategory = categoryLabel(state.category);
    const label = `Category: ${readableCategory}`;
    summaryBits.push(label);
    chips.push({
      action: "category",
      value: "all",
      label,
      ariaLabel: `Remove category filter ${readableCategory}`
    });
  }
  if (state.segment !== "all") {
    const label = `Segment: ${state.segment.toUpperCase()}`;
    summaryBits.push(label);
    chips.push({
      action: "segment",
      value: "all",
      label,
      ariaLabel: `Remove segment filter ${state.segment.toUpperCase()}`
    });
  }
  if (state.selectedBrands.length) {
    summaryBits.push(`Brand: ${state.selectedBrands.join(", ")}`);
    state.selectedBrands.forEach((brand) => {
      chips.push({
        action: "brand",
        value: brand,
        label: `Brand: ${brand}`,
        ariaLabel: `Remove brand filter ${brand}`
      });
    });
  }
  if (state.selectedMinRating > 0) {
    const label = `Rating: ${state.selectedMinRating}+`;
    summaryBits.push(label);
    chips.push({
      action: "rating",
      value: "0",
      label,
      ariaLabel: `Remove rating filter ${state.selectedMinRating} and above`
    });
  }
  if (state.priceFloor > minCap || state.priceCeil < maxCap) {
    const label = `Price: ${money(state.priceFloor)} - ${money(state.priceCeil)}`;
    summaryBits.push(label);
    chips.push({
      action: "price",
      value: "",
      label,
      ariaLabel: `Reset price range filter`
    });
  }

  const nextSummary = summaryBits.length ? `Filters: ${summaryBits.join(" | ")}` : "Filters: None";
  activeFilterMeta.textContent = nextSummary;

  if (activeFilterChips) {
    if (!chips.length) {
      activeFilterChips.hidden = true;
      activeFilterChips.innerHTML = "";
    } else {
      activeFilterChips.hidden = false;
      const filterChipMarkup = chips
        .map((chip) => `
          <button
            type="button"
            class="active-filter-chip"
            data-remove-filter="${escapeSuggestionHtml(chip.action)}"
            data-remove-value="${escapeSuggestionHtml(chip.value)}"
            aria-label="${escapeSuggestionHtml(chip.ariaLabel)}"
          >
            <span class="active-filter-chip-label">${escapeSuggestionHtml(chip.label)}</span>
            <span class="active-filter-chip-close" aria-hidden="true">&times;</span>
          </button>
        `)
        .join("");
      const clearAllMarkup = `
        <button
          type="button"
          class="active-filter-chip active-filter-chip--clear-all"
          data-remove-filter="clear-all"
          data-remove-value=""
          aria-label="Clear all active filters"
        >
          <span class="active-filter-chip-label">Clear all filters</span>
        </button>
      `;
      activeFilterChips.innerHTML = `${filterChipMarkup}${clearAllMarkup}`;
    }
  }

  const announcement = chips.length
    ? `Filters updated: ${chips.map((chip) => chip.label).join(", ")}.`
    : "All filters cleared. Broadest product view restored.";
  if (!hasRenderedFilterSummary) {
    hasRenderedFilterSummary = true;
    lastFilterAnnouncement = announcement;
    pendingFilterAnnouncement = "";
    if (filterLiveStatus) {
      filterLiveStatus.textContent = "";
    }
    return;
  }
  pendingFilterAnnouncement = announcement !== lastFilterAnnouncement ? announcement : "";
  lastFilterAnnouncement = announcement;
}

function flushFilterAnnouncement(resultSummary) {
  if (!filterLiveStatus || !pendingFilterAnnouncement) {
    return;
  }
  const combinedMessage = `${pendingFilterAnnouncement} ${resultSummary}`.trim();
  filterLiveStatus.textContent = "";
  window.requestAnimationFrame(() => {
    filterLiveStatus.textContent = combinedMessage;
  });
  pendingFilterAnnouncement = "";
}

function getCurrentFilterState() {
  const query = String(searchInput?.value || "").trim();
  const category = String(categoryFilter?.value || "all").trim();
  const segment = String(segmentFilter?.value || "all").trim();
  const selectedBrands = getSelectedBrands();
  const minPrice = Number(minPriceRange?.value || 0);
  const maxPrice = Number(maxPriceRange?.value || 0);
  const minCap = Number(minPriceRange?.min || 0);
  const maxCap = Number(maxPriceRange?.max || 0);
  const priceFloor = Math.min(minPrice, maxPrice);
  const priceCeil = Math.max(minPrice, maxPrice);

  return {
    query,
    category,
    segment,
    selectedBrands,
    priceFloor,
    priceCeil,
    selectedMinRating,
    hasNonDefaultFilters:
      category !== "all" ||
      segment !== "all" ||
      selectedBrands.length > 0 ||
      selectedMinRating > 0 ||
      priceFloor > minCap ||
      priceCeil < maxCap,
    hasAnyConstraints:
      Boolean(query) ||
      category !== "all" ||
      segment !== "all" ||
      selectedBrands.length > 0 ||
      selectedMinRating > 0 ||
      priceFloor > minCap ||
      priceCeil < maxCap
  };
}

function renderEmptyStateCard({ title, message, detail = "", actions = "", chips = "", variant = "default" }) {
  return `
    <section class="empty-state empty-state--${variant}">
      <div class="empty-state-copy">
        <span class="empty-state-badge">${variant === "loading" ? "Searching" : variant === "error" ? "Action needed" : "No matches"}</span>
        <h2 class="empty-state-title">${title}</h2>
        <p class="empty-state-message">${message}</p>
        ${detail ? `<p class="empty-state-detail">${detail}</p>` : ""}
      </div>
      ${actions ? `<div class="empty-state-actions">${actions}</div>` : ""}
      ${chips ? `<div class="empty-state-chips">${chips}</div>` : ""}
    </section>
  `;
}

function renderZeroResultsState() {
  const state = getCurrentFilterState();
  const appliedTags = [];
  if (state.query) {
    appliedTags.push(`Search: "${escapeSuggestionHtml(state.query)}"`);
  }
  if (state.category !== "all") {
    appliedTags.push(`Category: ${escapeSuggestionHtml(categoryLabel(state.category))}`);
  }
  if (state.segment !== "all") {
    appliedTags.push(`Segment: ${escapeSuggestionHtml(state.segment.toUpperCase())}`);
  }
  if (state.selectedBrands.length) {
    appliedTags.push(`Brand: ${escapeSuggestionHtml(state.selectedBrands.join(", "))}`);
  }
  if (state.selectedMinRating > 0) {
    appliedTags.push(`Rating: ${escapeSuggestionHtml(String(state.selectedMinRating))}+`);
  }
  if (state.hasNonDefaultFilters && (state.priceFloor > Number(minPriceRange.min || 0) || state.priceCeil < Number(maxPriceRange.max || 0))) {
    appliedTags.push(`Price: ${escapeSuggestionHtml(money(state.priceFloor))} - ${escapeSuggestionHtml(money(state.priceCeil))}`);
  }

  const actions = [
    state.query
      ? '<button type="button" class="empty-state-btn empty-state-btn--secondary" data-empty-action="clear-search">Clear search</button>'
      : "",
    state.hasNonDefaultFilters
      ? '<button type="button" class="empty-state-btn" data-empty-action="reset-filters">Reset filters</button>'
      : "",
    '<button type="button" class="empty-state-btn empty-state-btn--ghost" data-empty-action="browse-all">Browse all products</button>'
  ]
    .filter(Boolean)
    .join("");

  const categoryChips = getSearchCategorySlugs()
    .slice(0, 4)
    .map((slug) => `<a class="empty-state-chip" href="products.html?category=${encodeURIComponent(slug)}">${escapeSuggestionHtml(categoryLabel(slug))}</a>`)
    .join("");

  const detail = appliedTags.length
    ? `Try widening the search or removing a few constraints from this set.`
    : "Try a broader keyword or jump into one of the popular product families below.";

  return renderEmptyStateCard({
    title: "No products matched this search",
    message: "We could not find anything for the current search and filter combination.",
    detail,
    actions,
    chips: [
      appliedTags.length
        ? `<div class="empty-state-tags">${appliedTags.slice(0, 5).map((tag) => `<span class="empty-state-tag">${tag}</span>`).join("")}</div>`
        : "",
      categoryChips
        ? `<div class="empty-state-chip-row"><span class="empty-state-chip-label">Popular categories</span>${categoryChips}</div>`
        : ""
    ].filter(Boolean).join(""),
    variant: "zero"
  });
}

function renderErrorStateCard(message) {
  return renderEmptyStateCard({
    title: "We hit a loading issue",
    message,
    detail: "You can try again, or go back to the full catalog while the connection settles.",
    actions: [
      '<button type="button" class="empty-state-btn" data-empty-action="retry-search">Try again</button>',
      '<button type="button" class="empty-state-btn empty-state-btn--ghost" data-empty-action="browse-all">Browse all products</button>'
    ].join(""),
    variant: "error"
  });
}

function debounceFetch() {
  window.clearTimeout(searchDebounceTimer);
  searchDebounceTimer = window.setTimeout(() => {
    fetchProductsFromApi();
  }, 260);
}

function productCard(product) {
  const segment = product.segment || "b2c";
  const bulkMeta = segment === "b2b" && product.moq ? `<p class="bulk-meta">Minimum order quantity: ${product.moq}</p>` : "";
  const deliveryMeta = segment === "b2c" ? "FREE delivery by tomorrow" : "Business delivery options available";
  const image = normalizeImageUrl(product.image) || fallbackImage();
  const ribbon = getRibbonLabel(product);
  const wishlisted = isWishlisted(product.id);
  const highlights = getProductHighlights(product).map((item) => `<li>${item}</li>`).join("");
  const listPrice = Number(product.listPrice || product.price || 0);
  const price = Number(product.price || 0);
  const discountPercent = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const priceMeta = discountPercent > 0
    ? `<p class="bulk-meta">M.R.P. <s>${money(listPrice)}</s> | Save ${discountPercent}%</p>`
    : "";

  return `
    <article class="product-card">
      ${ribbon ? `<span class="card-ribbon">${ribbon}</span>` : ""}
      <a href="product-detail.html?id=${encodeURIComponent(product.id)}">
        <img src="${image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="product-detail.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
        <p class="bulk-meta">Brand: ${product.brand || "N/A"}</p>
        <span class="segment-pill">${segment}</span>
        <div class="meta">
          <span class="price">${money(price)}</span>
          <span class="rating">${Number(product.rating || 0)} &#9733;</span>
        </div>
        ${priceMeta}
        <ul class="feature-list">${highlights}</ul>
        <p class="bulk-meta">${deliveryMeta}</p>
        ${bulkMeta}
        <div class="card-actions">
          <button class="quick-view-btn" data-quick-view-id="${product.id}" type="button">Quick view</button>
          <a class="view-link" href="product-detail.html?id=${encodeURIComponent(product.id)}">View details</a>
          <button class="wishlist-btn ${wishlisted ? "active" : ""}" data-wishlist-id="${product.id}" type="button">${wishlisted ? "Wishlisted" : "Wishlist"}</button>
          <button class="add-btn" data-id="${product.id}" data-name="${product.name}" data-price="${Number(product.price || 0)}" data-image="${image}" type="button">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function syncQuickViewWishlistState(productId) {
  if (!quickViewWishlistBtn) {
    return;
  }
  const active = isWishlisted(productId);
  quickViewWishlistBtn.classList.toggle("active", active);
  quickViewWishlistBtn.textContent = active ? "Wishlisted" : "Save to Wishlist";
}

function closeQuickViewModal() {
  if (!quickViewModal) {
    return;
  }
  quickViewModal.hidden = true;
  document.body.classList.remove("quick-view-open");
}

function openQuickViewModal(productId) {
  if (!quickViewModal || !quickViewImage || !quickViewTitle || !quickViewAddBtn || !quickViewDetailsLink) {
    return;
  }
  const product = lastRenderedProducts.find((item) => String(item.id) === String(productId))
    || mergeProductsById(fallbackProducts, loadCatalogProductsList()).find((item) => String(item.id) === String(productId));
  if (!product) {
    return;
  }
  currentQuickViewProductId = String(product.id);
  quickViewImage.src = normalizeImageUrl(product.image) || fallbackImage();
  quickViewImage.alt = product.name;
  quickViewEyebrow.textContent = categoryLabel(product.category);
  quickViewTitle.textContent = product.name;
  quickViewRating.textContent = `${Number(product.rating || 0).toFixed(1)} ★ customer rating`;
  quickViewPrice.textContent = money(product.price);
  quickViewMeta.textContent = `Brand: ${product.brand || "ElectroMart"} | ${product.segment === "b2b" ? "Bulk order ready" : "Fast retail delivery"}`;
  quickViewDescription.textContent = getProductShortDescription(product);
  quickViewAddBtn.setAttribute("data-id", currentQuickViewProductId);
  quickViewDetailsLink.href = `product-detail.html?id=${encodeURIComponent(currentQuickViewProductId)}`;
  syncQuickViewWishlistState(currentQuickViewProductId);
  quickViewModal.hidden = false;
  document.body.classList.add("quick-view-open");
}

function renderProducts(list) {
  lastRenderedProducts = list.slice();
  fullResultSet = list.slice();
  setProductsGridBusy(false);

  if (!list.length) {
    visibleResultCount = 0;
    resultMeta.textContent = "Showing 0 products";
    productsGrid.innerHTML = renderZeroResultsState();
    if (resultsFooter) {
      resultsFooter.hidden = true;
    }
    if (resultsWindowMeta) {
      resultsWindowMeta.textContent = "";
    }
    flushFilterAnnouncement(resultMeta.textContent);
    return;
  }

  visibleResultCount = Math.min(list.length, Math.max(PRODUCTS_INITIAL_RENDER_LIMIT, visibleResultCount || 0));
  const visibleItems = list.slice(0, visibleResultCount);
  resultMeta.textContent = `Showing ${visibleItems.length} of ${list.length} products`;
  productsGrid.innerHTML = visibleItems.map(productCard).join("");

  if (resultsFooter && resultsWindowMeta && loadMoreBtn) {
    const hasMore = visibleItems.length < list.length;
    resultsFooter.hidden = false;
    resultsWindowMeta.textContent = hasMore
      ? `${list.length - visibleItems.length} more products available`
      : "All matching products loaded";
    loadMoreBtn.hidden = !hasMore;
    loadMoreBtn.disabled = !hasMore;
  }
  flushFilterAnnouncement(resultMeta.textContent);
}

function setLoadingState() {
  setProductsGridBusy(true);
  resultMeta.textContent = "Loading products...";
  if (resultsFooter) {
    resultsFooter.hidden = true;
  }
  if (resultsWindowMeta) {
    resultsWindowMeta.textContent = "";
  }
  productsGrid.innerHTML = renderEmptyStateCard({
    title: "Fetching products",
    message: "We are checking the latest catalog and pricing for you.",
    detail: "Results will appear here as soon as the request completes.",
    variant: "loading"
  });
}

function setErrorState(message) {
  fullResultSet = [];
  visibleResultCount = 0;
  setProductsGridBusy(false);
  resultMeta.textContent = "Showing 0 products";
  productsGrid.innerHTML = renderErrorStateCard(message);
  if (resultsFooter) {
    resultsFooter.hidden = true;
  }
  if (resultsWindowMeta) {
    resultsWindowMeta.textContent = "";
  }
  flushFilterAnnouncement(`${resultMeta.textContent}. ${message}`);
}

function applyInitialQueryFilters() {
  const params = new URLSearchParams(window.location.search);
  const querySearch = String(params.get("search") || params.get("q") || "").trim();
  const queryCategory = String(params.get("category") || "").trim().toLowerCase();
  const allowedCategories = new Set(["all", ...getSearchCategorySlugs()]);
  if (querySearch) {
    searchInput.value = querySearch;
  }
  if (allowedCategories.has(queryCategory)) {
    syncSearchCategoryControls(queryCategory);
  }
}

function resetAllFilters() {
  segmentFilter.value = "all";
  categoryFilter.value = "all";
  if (searchCatalogSelect) {
    searchCatalogSelect.value = "all";
  }
  sortFilter.value = "relevance";
  searchInput.value = "";
  minPriceRange.value = String(minPriceRange.min || 0);
  maxPriceRange.value = String(maxPriceRange.max || 16000);
  selectedMinRating = 0;
  syncRatingChipUI();
  getBrandFilters().forEach((checkbox) => {
    checkbox.checked = false;
  });
  updatePriceLabels();
  visibleResultCount = PRODUCTS_INITIAL_RENDER_LIMIT;
  fetchProductsFromApi();
}

function buildQueryParams() {
  const selectedCategory = normalizeCategory(searchCatalogSelect?.value || categoryFilter.value);
  const selectedSegment = segmentFilter.value;
  const query = searchInput.value.trim();
  const minPrice = Number(minPriceRange.value);
  const maxPrice = Number(maxPriceRange.value);
  const priceFloor = Math.min(minPrice, maxPrice);
  const priceCeil = Math.max(minPrice, maxPrice);
  const checkedBrands = getSelectedBrands();

  const params = new URLSearchParams();
  if (query) {
    params.set("search", query);
    params.set("category", selectedCategory === "all" ? "all" : selectedCategory);
    params.set("segment", "all");
    params.set("minPrice", "0");
    params.set("maxPrice", String(maxPriceRange.max || 250000));
    params.set("rating", "0");
    params.set("sort", mapSort(sortFilter.value));
    return { params, checkedBrands };
  }
  params.set("category", selectedCategory);
  params.set("segment", selectedSegment);
  params.set("minPrice", String(priceFloor));
  params.set("maxPrice", String(priceCeil));
  params.set("rating", String(selectedMinRating));
  params.set("sort", mapSort(sortFilter.value));

  if (checkedBrands.length === 1) {
    params.set("brand", checkedBrands[0]);
  }

  return { params, checkedBrands };
}

function applyClientFilters(sourceProducts) {
  const selectedCategory = categoryFilter.value;
  const selectedSegment = segmentFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  const minPrice = Number(minPriceRange.value);
  const maxPrice = Number(maxPriceRange.value);
  const priceFloor = Math.min(minPrice, maxPrice);
  const priceCeil = Math.max(minPrice, maxPrice);
  const selectedSort = mapSort(sortFilter.value);
  const checkedBrands = getSelectedBrands();

  const queryMatchOnly = (item) => {
    const collections = normalizeCollectionValues(item.collections, item.category);
    return !query || `${item.name} ${item.brand} ${item.category} ${collections.join(" ")}`.toLowerCase().includes(query);
  };

  let items = sourceProducts.filter((item) => {
    const collections = normalizeCollectionValues(item.collections, item.category);
    const queryMatch = queryMatchOnly(item);
    const categoryMatch = categoryMatchesSelection(selectedCategory, collections);
    const segmentMatch = selectedSegment === "all" || item.segment === selectedSegment;
    const priceMatch = Number(item.price || 0) >= priceFloor && Number(item.price || 0) <= priceCeil;
    const ratingMatch = Number(item.rating || 0) >= selectedMinRating;
    const brandMatch = !checkedBrands.length || checkedBrands.includes(item.brand);
    return queryMatch && categoryMatch && segmentMatch && priceMatch && ratingMatch && brandMatch;
  });

  if (selectedSort === "price_asc") {
    items = items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (selectedSort === "price_desc") {
    items = items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else if (selectedSort === "rating_desc") {
    items = items.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }

  return items;
}

function filterFallbackProducts() {
  return applyClientFilters(mergeProductsById(fallbackProducts, loadCatalogProductsList()));
}

async function fetchProductsFromApi() {
  const { params, checkedBrands } = buildQueryParams();
  const activeQuery = searchInput.value.trim();
  const fallbackSource = mergeProductsById(fallbackProducts, loadCatalogProductsList());
  visibleResultCount = PRODUCTS_INITIAL_RENDER_LIMIT;
  renderActiveFilterMeta();
  setLoadingState();
  syncDynamicCategoryUI();
  syncDynamicBrandUI(fallbackSource);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
  } catch (error) {
    renderProducts(applyClientFilters(fallbackSource));
    resultMeta.textContent = `${resultMeta.textContent} (Offline mode)`;
    return;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data || !Array.isArray(data.products)) {
    renderProducts(applyClientFilters(fallbackSource));
    resultMeta.textContent = `${resultMeta.textContent} (Offline mode)`;
    return;
  }

  cacheCatalogProducts(data.products);
  const sourceItems = mergeProductsById(data.products, loadCatalogProductsList());
  syncDynamicCategoryUI();
  syncDynamicBrandUI(sourceItems);
  let items = sourceItems;
  if (!activeQuery && checkedBrands.length > 1) {
    items = items.filter((item) => checkedBrands.includes(item.brand));
  }
  items = applyClientFilters(items);
  renderProducts(items);
  window.setTimeout(() => {
    cacheCatalogProducts(data.products);
  }, 0);
}

if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    if (!fullResultSet.length) {
      return;
    }
    visibleResultCount = Math.min(fullResultSet.length, visibleResultCount + PRODUCTS_LOAD_MORE_STEP);
    renderProducts(fullResultSet);
  });
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncSearchCategoryControls(searchCatalogSelect?.value || categoryFilter.value || "all");
  rememberSearchQuery(searchInput.value);
  fetchProductsFromApi();
});

segmentFilter.addEventListener("change", fetchProductsFromApi);
categoryFilter.addEventListener("change", () => {
  syncSearchCategoryControls(categoryFilter.value || "all");
  fetchProductsFromApi();
});
if (searchCatalogSelect) {
  searchCatalogSelect.addEventListener("change", () => {
    syncSearchCategoryControls(searchCatalogSelect.value || "all");
    fetchProductsFromApi();
  });
}
searchInput.addEventListener("input", () => {
  renderSearchSuggestions();
  debounceFetch();
});
searchInput.addEventListener("focus", renderSearchSuggestions);
searchInput.addEventListener("keydown", handleSearchSuggestionKeydown);
if (searchSuggestions) {
  searchSuggestions.addEventListener("mousedown", (event) => {
    if (event.target.closest("[data-suggestion-type], [data-clear-search-history]")) {
      event.preventDefault();
    }
  });
  searchSuggestions.addEventListener("mouseover", (event) => {
    const suggestion = event.target.closest("[data-suggestion-type]");
    if (!suggestion) {
      return;
    }
    const items = getSearchSuggestionButtons();
    const nextIndex = items.indexOf(suggestion);
    if (nextIndex >= 0) {
      setActiveSearchSuggestionIndex(nextIndex);
    }
  });
  searchSuggestions.addEventListener("focusin", (event) => {
    const suggestion = event.target.closest("[data-suggestion-type]");
    if (!suggestion) {
      return;
    }
    const items = getSearchSuggestionButtons();
    const nextIndex = items.indexOf(suggestion);
    if (nextIndex >= 0) {
      setActiveSearchSuggestionIndex(nextIndex);
    }
  });
  searchSuggestions.addEventListener("keydown", handleSuggestionListKeydown);
  searchSuggestions.addEventListener("click", (event) => {
    const clearButton = event.target.closest("[data-clear-search-history]");
    if (clearButton) {
      event.preventDefault();
      clearSearchHistory();
      if (String(searchInput.value || "").trim()) {
        renderSearchSuggestions();
      } else {
        closeSearchSuggestions();
      }
      return;
    }
    const suggestion = event.target.closest("[data-suggestion-type]");
    if (!suggestion) {
      return;
    }
    const type = suggestion.getAttribute("data-suggestion-type");
    const value = String(suggestion.getAttribute("data-suggestion-value") || "").trim();
    handleSuggestionSelection(type, value);
  });
}
sortFilter.addEventListener("change", fetchProductsFromApi);

minPriceRange.addEventListener("input", () => {
  updatePriceLabels();
  fetchProductsFromApi();
});

maxPriceRange.addEventListener("input", () => {
  updatePriceLabels();
  fetchProductsFromApi();
});

if (brandFilterList) {
  brandFilterList.addEventListener("change", (event) => {
    if (event.target.closest(".brand-filter")) {
      fetchProductsFromApi();
    }
  });
}
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", resetAllFilters);
}

  function animateFilterChipRemoval(chip, callback) {
    if (!chip || typeof callback !== "function") {
      return;
    }
    chip.classList.add("is-removing");
    window.setTimeout(callback, 140);
  }

  if (activeFilterChips) {
    activeFilterChips.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-remove-filter]");
      if (!chip) {
        return;
      }
      const action = String(chip.getAttribute("data-remove-filter") || "").trim();
      const value = String(chip.getAttribute("data-remove-value") || "").trim();
      let focusTarget = null;
      let feedbackMessage = "";
      if (action === "search") {
        searchInput.value = "";
        closeSearchSuggestions();
        focusTarget = searchInput;
        feedbackMessage = "Removed search filter. Focus moved to the search input.";
      } else if (action === "clear-all") {
        animateFilterChipRemoval(chip, () => {
          showFilterChipFeedback("Removed all filters. Focus moved to the search input.");
          resetAllFilters();
          window.requestAnimationFrame(() => searchInput?.focus());
        });
        return;
      } else if (action === "category") {
        syncSearchCategoryControls(value || "all");
        focusTarget = categoryFilter;
        feedbackMessage = "Removed category filter. Focus moved to the category filter.";
      } else if (action === "segment") {
        segmentFilter.value = value || "all";
        focusTarget = segmentFilter;
        feedbackMessage = "Removed segment filter. Focus moved to the segment filter.";
      } else if (action === "brand") {
        const targetCheckbox = getBrandFilters().find((checkbox) => checkbox.value === value);
        if (targetCheckbox) {
          targetCheckbox.checked = false;
          focusTarget = targetCheckbox;
          feedbackMessage = `Removed brand filter ${value}. Focus moved to the brand option.`;
        }
      } else if (action === "rating") {
        selectedMinRating = 0;
        syncRatingChipUI();
        focusTarget = ratingChips.find((chipItem) => chipItem.getAttribute("data-rating") === "0") || null;
        feedbackMessage = "Removed rating filter. Focus moved to the rating options.";
      } else if (action === "price") {
        minPriceRange.value = String(minPriceRange.min || 0);
        maxPriceRange.value = String(maxPriceRange.max || 16000);
        updatePriceLabels();
        focusTarget = minPriceRange;
        feedbackMessage = "Removed price filter. Focus moved to the minimum price slider.";
      } else {
        return;
      }
      animateFilterChipRemoval(chip, () => {
        showFilterChipFeedback(feedbackMessage);
        if (focusTarget && typeof focusTarget.focus === "function") {
          window.requestAnimationFrame(() => focusTarget.focus());
        }
        fetchProductsFromApi();
      });
    });
  }

if (productsGrid) {
  productsGrid.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-empty-action]");
    if (!actionButton) {
      return;
    }
    const action = String(actionButton.getAttribute("data-empty-action") || "").trim();
    if (action === "clear-search") {
      searchInput.value = "";
      closeSearchSuggestions();
      fetchProductsFromApi();
      searchInput.focus();
      return;
    }
    if (action === "reset-filters") {
      resetAllFilters();
      return;
    }
    if (action === "browse-all") {
      window.location.href = "products.html";
      return;
    }
    if (action === "retry-search") {
      fetchProductsFromApi();
    }
  });
}

document.addEventListener("click", (event) => {
  if (searchSuggestions && !searchForm.contains(event.target)) {
    closeSearchSuggestions();
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

  if (event.target.classList.contains("rating-chip")) {
    selectedMinRating = Number(event.target.getAttribute("data-rating") || 0);
    syncRatingChipUI();
    fetchProductsFromApi();
    return;
  }

  const quickViewBtn = event.target.closest("[data-quick-view-id]");
  if (quickViewBtn) {
    openQuickViewModal(String(quickViewBtn.getAttribute("data-quick-view-id") || ""));
    return;
  }

  const wishlistBtn = event.target.closest(".wishlist-btn");
  if (wishlistBtn) {
    const productId = wishlistBtn.getAttribute("data-wishlist-id");
    if (productId) {
      const active = toggleWishlist(productId);
      wishlistBtn.classList.toggle("active", active);
      wishlistBtn.textContent = active ? "Wishlisted" : "Wishlist";
    }
    return;
  }

  const addBtn = event.target.closest(".add-btn");
  if (!addBtn) {
    return;
  }

  const productId = addBtn.getAttribute("data-id");
  if (productId) {
    cacheCatalogProduct({
      id: productId,
      name: addBtn.getAttribute("data-name"),
      price: Number(addBtn.getAttribute("data-price") || 0),
      image: addBtn.getAttribute("data-image")
    });
    addProductToCart(productId);
    const oldText = addBtn.textContent;
    addBtn.textContent = "Added";
    addBtn.classList.add("added");
    window.setTimeout(() => {
      addBtn.textContent = oldText || "Add to Cart";
      addBtn.classList.remove("added");
    }, 1200);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearchSuggestions();
  }
  if (event.key === "Escape" && quickViewModal && !quickViewModal.hidden) {
    closeQuickViewModal();
  }
});

if (quickViewModal) {
  quickViewModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-quick-view]")) {
      closeQuickViewModal();
    }
  });
}

if (quickViewClose) {
  quickViewClose.addEventListener("click", closeQuickViewModal);
}

if (quickViewAddBtn) {
  quickViewAddBtn.addEventListener("click", () => {
    if (!currentQuickViewProductId) {
      return;
    }
    const product = lastRenderedProducts.find((item) => String(item.id) === currentQuickViewProductId);
    if (product) {
      cacheCatalogProduct(product);
    }
    addProductToCart(currentQuickViewProductId);
    quickViewAddBtn.textContent = "Added";
    window.setTimeout(() => {
      quickViewAddBtn.textContent = "Add to Cart";
    }, 1200);
  });
}

if (quickViewWishlistBtn) {
  quickViewWishlistBtn.addEventListener("click", () => {
    if (!currentQuickViewProductId) {
      return;
    }
    toggleWishlist(currentQuickViewProductId);
    syncQuickViewWishlistState(currentQuickViewProductId);
  });
}

syncCartCount();
syncDynamicCategoryUI();
applyInitialQueryFilters();
syncDynamicBrandUI();
updatePriceLabels();
fetchProductsFromApi();

