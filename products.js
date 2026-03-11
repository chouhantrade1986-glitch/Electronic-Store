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
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const cartCount = document.getElementById("cartCount");
const minPriceRange = document.getElementById("minPriceRange");
const maxPriceRange = document.getElementById("maxPriceRange");
const minPriceValue = document.getElementById("minPriceValue");
const maxPriceValue = document.getElementById("maxPriceValue");
const brandFilters = Array.from(document.querySelectorAll(".brand-filter"));
const sortFilter = document.getElementById("sortFilter");
const ratingChips = Array.from(document.querySelectorAll(".rating-chip"));
const deptTrigger = document.getElementById("deptTrigger");
const deptMenu = document.getElementById("deptMenu");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const activeFilterMeta = document.getElementById("activeFilterMeta");
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
  }
];
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
let searchDebounceTimer = null;

function categoryLabel(value) {
  return String(value || "")
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

  const merged = Array.from(new Set([...fromRecords, ...fromCatalog]));
  if (merged.length) {
    return merged;
  }
  return ["laptop", "mobile", "audio", "accessory"];
}

function syncDynamicCategoryUI() {
  const slugs = getActiveCategorySlugs();
  if (categoryFilter) {
    const selected = normalizeCategory(categoryFilter.value || "all");
    categoryFilter.innerHTML = [
      "<option value='all'>All Categories</option>",
      ...slugs.map((slug) => `<option value="${slug}">${categoryLabel(slug)}</option>`)
    ].join("");
    categoryFilter.value = slugs.includes(selected) ? selected : "all";
  }

  if (deptMenu) {
    Array.from(deptMenu.querySelectorAll("a")).forEach((node) => {
      const href = String(node.getAttribute("href") || "");
      if (node.getAttribute("data-auto-category") === "1" || href.includes("products.html?category=")) {
        node.remove();
      }
    });
    slugs.forEach((slug) => {
      const link = document.createElement("a");
      link.href = `products.html?category=${encodeURIComponent(slug)}`;
      link.textContent = categoryLabel(slug);
      link.setAttribute("data-auto-category", "1");
      deptMenu.append(link);
    });
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
  return brandFilters.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
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

function closeSearchSuggestions() {
  if (!searchSuggestions) {
    return;
  }
  searchSuggestions.hidden = true;
  searchSuggestions.innerHTML = "";
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
    searchSuggestions.innerHTML = recent.map((item) => `
      <button class="suggestion-item" type="button" data-suggestion-type="history" data-suggestion-value="${item}">
        <span class="suggestion-label">${item}</span>
        <span class="suggestion-meta">Recent search</span>
      </button>
    `).join("");
    searchSuggestions.hidden = false;
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
      meta: "Browse category"
    }));

  const productMatches = sourceProducts
    .filter((item) => `${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(query))
    .map((item) => {
      const stockState = getProductStockState(item);
      return {
        type: "product",
        value: String(item.id),
        label: item.name,
        meta: `${item.brand || "ElectroMart"} · ${money(item.price)} · ${stockState.label}`,
        stockRank: stockState.rank
      };
    })
    .sort((a, b) => a.stockRank - b.stockRank || a.label.localeCompare(b.label))
    .slice(0, 4);

  const items = [...categoryMatches, ...productMatches].slice(0, 6);
  if (!items.length) {
    closeSearchSuggestions();
    return;
  }

  searchSuggestions.innerHTML = items.map((item) => `
    <button class="suggestion-item" type="button" data-suggestion-type="${item.type}" data-suggestion-value="${item.value}">
      <span class="suggestion-label">${item.label}</span>
      <span class="suggestion-meta">${item.meta}</span>
    </button>
  `).join("");
  searchSuggestions.hidden = false;
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
  const bits = [];
  const query = String(searchInput.value || "").trim();
  const category = String(categoryFilter.value || "all");
  const segment = String(segmentFilter.value || "all");
  const selectedBrands = getSelectedBrands();
  const minPrice = Number(minPriceRange.value);
  const maxPrice = Number(maxPriceRange.value);
  const priceFloor = Math.min(minPrice, maxPrice);
  const priceCeil = Math.max(minPrice, maxPrice);

  if (query) {
    bits.push(`Search: "${query}"`);
  }
  if (category !== "all") {
    bits.push(`Category: ${category}`);
  }
  if (segment !== "all") {
    bits.push(`Segment: ${segment.toUpperCase()}`);
  }
  if (selectedBrands.length) {
    bits.push(`Brand: ${selectedBrands.join(", ")}`);
  }
  if (selectedMinRating > 0) {
    bits.push(`Rating: ${selectedMinRating}+`);
  }
  if (priceFloor > 0 || priceCeil < Number(maxPriceRange.max)) {
    bits.push(`Price: ${money(priceFloor)} - ${money(priceCeil)}`);
  }

  activeFilterMeta.textContent = bits.length ? `Filters: ${bits.join(" | ")}` : "Filters: None";
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
  resultMeta.textContent = `Showing ${list.length} products`;

  if (!list.length) {
    productsGrid.innerHTML = "<div class='empty-state'>No products match your filters.</div>";
    return;
  }

  productsGrid.innerHTML = list.map(productCard).join("");
}

function setLoadingState() {
  resultMeta.textContent = "Loading products...";
  productsGrid.innerHTML = "<div class='empty-state'>Fetching products from server...</div>";
}

function setErrorState(message) {
  resultMeta.textContent = "Showing 0 products";
  productsGrid.innerHTML = `<div class='empty-state'>${message}</div>`;
}

function applyInitialQueryFilters() {
  const params = new URLSearchParams(window.location.search);
  const querySearch = String(params.get("search") || params.get("q") || "").trim();
  const queryCategory = String(params.get("category") || "").trim().toLowerCase();
  const allowedCategories = new Set(["all", ...getActiveCategorySlugs()]);
  if (querySearch) {
    searchInput.value = querySearch;
  }
  if (allowedCategories.has(queryCategory)) {
    categoryFilter.value = queryCategory;
  }
}

function resetAllFilters() {
  segmentFilter.value = "all";
  categoryFilter.value = "all";
  sortFilter.value = "relevance";
  searchInput.value = "";
  minPriceRange.value = String(minPriceRange.min || 0);
  maxPriceRange.value = String(maxPriceRange.max || 16000);
  selectedMinRating = 0;
  ratingChips.forEach((chip) => {
    chip.classList.toggle("active", chip.getAttribute("data-rating") === "0");
  });
  brandFilters.forEach((checkbox) => {
    checkbox.checked = false;
  });
  updatePriceLabels();
  fetchProductsFromApi();
}

function buildQueryParams() {
  const selectedCategory = categoryFilter.value;
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
    // Keep search broad so users can always find products even when sidebar filters are restrictive.
    params.set("category", "all");
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

  if (query && !items.length) {
    // Rescue mode: when query exists and active filters hide everything, show query matches.
    items = sourceProducts.filter((item) => queryMatchOnly(item));
  }

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
  renderActiveFilterMeta();
  setLoadingState();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
  } catch (error) {
    renderProducts(filterFallbackProducts());
    resultMeta.textContent = `${resultMeta.textContent} (Offline mode)`;
    return;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data || !Array.isArray(data.products)) {
    renderProducts(filterFallbackProducts());
    resultMeta.textContent = `${resultMeta.textContent} (Offline mode)`;
    return;
  }

  let items = mergeProductsById(data.products, loadCatalogProductsList());
  if (!activeQuery && checkedBrands.length > 1) {
    items = items.filter((item) => checkedBrands.includes(item.brand));
  }
  items = applyClientFilters(items);
  items.forEach(cacheCatalogProduct);

  renderProducts(items);
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  rememberSearchQuery(searchInput.value);
  fetchProductsFromApi();
});

segmentFilter.addEventListener("change", fetchProductsFromApi);
categoryFilter.addEventListener("change", fetchProductsFromApi);
searchInput.addEventListener("input", () => {
  renderSearchSuggestions();
  debounceFetch();
});
searchInput.addEventListener("focus", renderSearchSuggestions);
sortFilter.addEventListener("change", fetchProductsFromApi);

minPriceRange.addEventListener("input", () => {
  updatePriceLabels();
  fetchProductsFromApi();
});

maxPriceRange.addEventListener("input", () => {
  updatePriceLabels();
  fetchProductsFromApi();
});

brandFilters.forEach((checkbox) => {
  checkbox.addEventListener("change", fetchProductsFromApi);
});
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", resetAllFilters);
}

document.addEventListener("click", (event) => {
  const suggestion = event.target.closest("[data-suggestion-type]");
  if (suggestion) {
    const type = suggestion.getAttribute("data-suggestion-type");
    const value = String(suggestion.getAttribute("data-suggestion-value") || "").trim();
    closeSearchSuggestions();
    if (type === "product" && value) {
      window.location.href = `product-detail.html?id=${encodeURIComponent(value)}`;
      return;
    }
    if (type === "category" && value) {
      rememberSearchQuery(categoryLabel(value));
      categoryFilter.value = value;
      searchInput.value = "";
      fetchProductsFromApi();
      return;
    }
    if (type === "history" && value) {
      searchInput.value = value;
      rememberSearchQuery(value);
      closeSearchSuggestions();
      fetchProductsFromApi();
      return;
    }
  }

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
    ratingChips.forEach((chip) => chip.classList.remove("active"));
    event.target.classList.add("active");
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
updatePriceLabels();
fetchProductsFromApi();
