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

const fallbackBrandProducts = [
  { id: "1", name: "AstraBook Pro 14", brand: "AstraTech", category: "laptop", segment: "b2c", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: "2", name: "Nimbus Phone X", brand: "Nimbus", category: "mobile", segment: "b2c", price: 749, rating: 4.5, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: "3", name: "Pulse ANC Headphones", brand: "PulseWave", category: "audio", segment: "b2c", price: 179, rating: 4.4, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: "5", name: "Orbit Mechanical Keyboard", brand: "OrbitX", category: "accessory", segment: "b2c", price: 109, rating: 4.3, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: "7", name: "Vector Gaming Laptop", brand: "Vector", category: "laptop", segment: "b2c", price: 1299, rating: 4.8, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: "8", name: "Echo Smart Speaker", brand: "EchoSphere", category: "audio", segment: "b2c", price: 89, rating: 4.1, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" },
  { id: "101", name: "Titan Office Tower i5", brand: "Titan", category: "computer", segment: "b2c", price: 899, rating: 4.4, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: "102", name: "Vortex Gaming Rig Ryzen 7", brand: "Vortex", category: "computer", segment: "b2c", price: 1699, rating: 4.8, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: "201", name: "Epson EcoTank L3250", brand: "Epson", category: "printer", segment: "b2c", price: 15999, rating: 4.5, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80" },
  { id: "202", name: "HP LaserJet Pro MFP 4104", brand: "HP", category: "printer", segment: "b2c", price: 28999, rating: 4.7, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df89?auto=format&fit=crop&w=900&q=80" },
  { id: "203", name: "Canon PIXMA G3770 All-in-One", brand: "Canon", category: "printer", segment: "b2c", price: 18499, rating: 4.4, image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80" },
  { id: "product_1772722039220", name: "Lenovo V15 G4 (2024)", brand: "Lenovo", category: "laptop", segment: "b2c", price: 36000, listPrice: 36000, rating: 0, image: "" },
  { id: "product_1773480601001", name: "AstraStudio Creator 16", brand: "AstraTech", category: "laptop", collections: ["laptop", "creator-studio", "computer"], segment: "b2c", price: 129999, listPrice: 139999, rating: 4.8, image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80", featured: true },
  { id: "product_1773480601002", name: "OrbitX ViewPro 32 4K", brand: "OrbitX", category: "computer", collections: ["computer", "creator-studio"], segment: "b2c", price: 32999, listPrice: 37999, rating: 4.7, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80", featured: true },
  { id: "product_1773480601003", name: "PulseCast Pro USB Microphone", brand: "PulseWave", category: "audio", collections: ["audio", "creator-studio"], segment: "b2c", price: 8999, listPrice: 10999, rating: 4.6, image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80" },
  { id: "product_1773480601004", name: "Nimbus StreamCam 4K", brand: "Nimbus", category: "accessory", collections: ["accessory", "creator-studio"], segment: "b2c", price: 6999, listPrice: 8499, rating: 4.5, image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" }
];

const cartCount = document.getElementById("cartCount");
const brandIntroEyebrow = document.getElementById("brandIntroEyebrow");
const brandIntroTitle = document.getElementById("brandIntroTitle");
const brandIntroLead = document.getElementById("brandIntroLead");
const brandPrimaryAction = document.getElementById("brandPrimaryAction");
const brandSecondaryAction = document.getElementById("brandSecondaryAction");
const brandIntroStats = document.getElementById("brandIntroStats");
const brandDirectorySearch = document.getElementById("brandDirectorySearch");
const brandDirectoryMeta = document.getElementById("brandDirectoryMeta");
const brandDirectoryGrid = document.getElementById("brandDirectoryGrid");
const brandStoreShell = document.getElementById("brandStoreShell");
const brandStoreHeading = document.getElementById("brandStoreHeading");
const brandStoreLead = document.getElementById("brandStoreLead");
const brandCategoryLanes = document.getElementById("brandCategoryLanes");
const brandSearch = document.getElementById("brandSearch");
const brandCategoryFilter = document.getElementById("brandCategoryFilter");
const brandSegmentFilter = document.getElementById("brandSegmentFilter");
const brandBudgetFilter = document.getElementById("brandBudgetFilter");
const brandStoreMeta = document.getElementById("brandStoreMeta");
const brandStoreGrid = document.getElementById("brandStoreGrid");

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

let allBrandProducts = [];
let selectedBrandLabel = "";
let selectedBrandProducts = [];
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

function syncCartCount() {
  if (!cartCount) {
    return;
  }
  const total = Object.values(loadCartMap()).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(total);
}

function addToCart(productId) {
  const cartMap = loadCartMap();
  const key = String(productId || "");
  if (!key) {
    return;
  }
  cartMap[key] = Number(cartMap[key] || 0) + 1;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
  syncCartCount();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "./product-placeholder.svg";
  }
  if (raw.startsWith("/") || raw.startsWith("blob:") || raw.startsWith("data:")) {
    return raw;
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) {
    return `https://${raw}`;
  }
  return raw;
}

function normalizeCategory(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeBrandKey(value) {
  return String(value || "").trim().toLowerCase();
}

function categoryLabel(value) {
  const labels = {
    accessory: "Accessories",
    audio: "Audio",
    computer: "Computers",
    laptop: "Laptops",
    mobile: "Mobiles",
    printer: "Printers"
  };
  return labels[normalizeCategory(value)] || String(value || "Products")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (part) => part.toUpperCase());
}

function brandStoreUrl(brand) {
  return `brands.html?brand=${encodeURIComponent(String(brand || "").trim())}`;
}

function cacheCatalogProducts(products) {
  if (!Array.isArray(products) || !products.length) {
    return;
  }
  let next = {};
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    next = typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    next = {};
  }
  let changed = false;
  products.forEach((product) => {
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
      image: normalizeImageUrl(product.image || existing.image || ""),
      price: Number(product.price ?? existing.price ?? 0),
      listPrice: Number(product.listPrice ?? existing.listPrice ?? product.price ?? 0),
      rating: Number(product.rating ?? existing.rating ?? 0)
    };
    changed = true;
  });
  if (changed) {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(next));
  }
}

function loadCatalogProductsList() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Array.isArray(parsed) ? parsed : Object.values(parsed || {});
  } catch (error) {
    return [];
  }
}

function mergeProductsById(primary, secondary) {
  const merged = new Map();
  [...primary, ...secondary].forEach((product) => {
    if (!product || !product.id) {
      return;
    }
    const key = String(product.id).trim();
    const current = merged.get(key) || {};
    merged.set(key, {
      ...current,
      ...product,
      id: key,
      image: normalizeImageUrl(product.image || current.image || ""),
      price: Number(product.price ?? current.price ?? 0),
      listPrice: Number(product.listPrice ?? current.listPrice ?? product.price ?? 0),
      rating: Number(product.rating ?? current.rating ?? 0)
    });
  });
  return Array.from(merged.values());
}

function activeProducts(products) {
  return products
    .filter((product) => {
      const brand = String(product?.brand || "").trim();
      if (!brand) {
        return false;
      }
      const status = String(product?.status || "active").trim().toLowerCase();
      return !status || status === "active";
    })
    .sort((left, right) => {
      const featuredDelta = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
      if (featuredDelta) {
        return featuredDelta;
      }
      const ratingDelta = Number(right.rating || 0) - Number(left.rating || 0);
      if (ratingDelta) {
        return ratingDelta;
      }
      return Number(right.price || 0) - Number(left.price || 0);
    });
}

function getSelectedBrandKey() {
  const params = new URLSearchParams(window.location.search);
  return normalizeBrandKey(params.get("brand") || "");
}

function buildBrandDirectory(products) {
  const groups = new Map();
  products.forEach((product) => {
    const label = String(product.brand || "").trim();
    const key = normalizeBrandKey(label);
    if (!key) {
      return;
    }
    const current = groups.get(key) || {
      key,
      label,
      count: 0,
      categories: new Set(),
      minPrice: Infinity,
      maxRating: 0,
      sampleImage: "",
      heroProduct: ""
    };
    current.count += 1;
    current.categories.add(categoryLabel(product.category));
    current.minPrice = Math.min(current.minPrice, Number(product.price || 0) || Infinity);
    current.maxRating = Math.max(current.maxRating, Number(product.rating || 0));
    if (!current.sampleImage || current.sampleImage === "./product-placeholder.svg") {
      current.sampleImage = normalizeImageUrl(product.image || "");
    }
    if (!current.heroProduct || product.featured) {
      current.heroProduct = String(product.name || "").trim() || current.heroProduct;
    }
    groups.set(key, current);
  });

  return Array.from(groups.values())
    .map((item) => ({
      ...item,
      categories: Array.from(item.categories).sort((left, right) => left.localeCompare(right)),
      minPrice: Number.isFinite(item.minPrice) ? item.minPrice : 0
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function renderIntroStats(brandProducts, directory) {
  const totalCategories = new Set(allBrandProducts.map((product) => categoryLabel(product.category))).size;
  const cards = [];
  if (brandProducts.length) {
    const minPrice = Math.min(...brandProducts.map((product) => Number(product.price || 0)));
    const categories = Array.from(new Set(brandProducts.map((product) => categoryLabel(product.category))));
    cards.push({
      title: `${brandProducts.length} active picks`,
      copy: `Live ${selectedBrandLabel} products with pricing from ${money(minPrice)}.`
    });
    cards.push({
      title: `${categories.length} categories`,
      copy: `Browse ${categories.slice(0, 3).join(", ")}${categories.length > 3 ? " and more" : ""}.`
    });
    cards.push({
      title: "Fast brand navigation",
      copy: "Use the directory below to switch to another brand without losing the shopping flow."
    });
  } else {
    cards.push({
      title: `${directory.length} brands indexed`,
      copy: `We currently group products into ${totalCategories} main buying families.`
    });
    cards.push({
      title: `${allBrandProducts.length} live products`,
      copy: "Choose a brand to open a filtered storefront with direct add-to-cart actions."
    });
    cards.push({
      title: "Store-style browsing",
      copy: "Each brand page gives you its own categories, filters, and product grid."
    });
  }
  brandIntroStats.innerHTML = cards.map((card) => `
    <article>
      <strong>${escapeHtml(card.title)}</strong>
      <span>${escapeHtml(card.copy)}</span>
    </article>
  `).join("");
}

function renderDirectory() {
  const selectedBrandKey = getSelectedBrandKey();
  const query = String(brandDirectorySearch?.value || "").trim().toLowerCase();
  const directory = buildBrandDirectory(allBrandProducts);
  const filtered = directory.filter((brand) => {
    if (!query) {
      return true;
    }
    const haystack = [brand.label, brand.heroProduct, brand.categories.join(" ")].join(" ").toLowerCase();
    return haystack.includes(query);
  });

  brandDirectoryMeta.textContent = filtered.length === directory.length
    ? `${directory.length} brands • ${allBrandProducts.length} live products`
    : `Showing ${filtered.length} of ${directory.length} brands`;

  if (!filtered.length) {
    brandDirectoryGrid.innerHTML = `
      <div class="brand-empty">
        <h3>No brands matched that search</h3>
        <p>Try a broader term like laptop, audio, or a known brand name.</p>
      </div>
    `;
    return;
  }

  brandDirectoryGrid.innerHTML = filtered.map((brand) => {
    const media = normalizeImageUrl(brand.sampleImage);
    const selected = brand.key === selectedBrandKey ? " is-selected" : "";
    const initial = brand.label.charAt(0).toUpperCase();
    const mediaMarkup = media && media !== "./product-placeholder.svg"
      ? `<img src="${escapeHtml(media)}" alt="${escapeHtml(brand.label)}" loading="lazy" />`
      : `<span class="brand-directory-initials" aria-hidden="true">${escapeHtml(initial)}</span>`;

    return `
      <article class="brand-directory-card${selected}">
        <div class="brand-directory-media">
          ${mediaMarkup}
        </div>
        <div class="brand-directory-copy">
          <p class="brand-directory-kicker">${brand.count} products</p>
          <h3>${escapeHtml(brand.label)}</h3>
          <p>${escapeHtml(brand.heroProduct || `Shop ${brand.label} products across the store.`)}</p>
          <div class="brand-directory-meta">
            <span class="brand-directory-pill">From ${escapeHtml(money(brand.minPrice))}</span>
            <span class="brand-directory-pill">${escapeHtml(brand.categories.slice(0, 2).join(" • "))}</span>
          </div>
          <a class="brand-card-action" href="${brandStoreUrl(brand.label)}">Open brand store</a>
        </div>
      </article>
    `;
  }).join("");
}

function matchesBudget(product, budget) {
  const price = Number(product.price || 0);
  if (budget === "under-10000") return price < 10000;
  if (budget === "10000-50000") return price >= 10000 && price <= 50000;
  if (budget === "over-50000") return price > 50000;
  return true;
}

function getCurrentBrandProducts() {
  const selectedBrandKey = getSelectedBrandKey();
  if (!selectedBrandKey) {
    return [];
  }
  return allBrandProducts.filter((product) => normalizeBrandKey(product.brand) === selectedBrandKey);
}

function syncCategoryFilterOptions() {
  if (!brandCategoryFilter) {
    return;
  }
  const currentValue = String(brandCategoryFilter.value || "all");
  const categories = Array.from(new Set(selectedBrandProducts.map((product) => normalizeCategory(product.category)).filter(Boolean)))
    .sort((left, right) => categoryLabel(left).localeCompare(categoryLabel(right)));
  brandCategoryFilter.innerHTML = [
    '<option value="all">All categories</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(categoryLabel(category))}</option>`)
  ].join("");
  if (categories.includes(currentValue)) {
    brandCategoryFilter.value = currentValue;
  }
}

function renderCategoryLanes() {
  if (!brandCategoryLanes) {
    return;
  }
  const activeCategory = String(brandCategoryFilter?.value || "all");
  const groups = new Map();
  selectedBrandProducts.forEach((product) => {
    const key = normalizeCategory(product.category);
    const existing = groups.get(key) || { label: categoryLabel(key), count: 0 };
    existing.count += 1;
    groups.set(key, existing);
  });
  const chips = [
    `<button type="button" class="brand-category-chip${activeCategory === "all" ? " is-active" : ""}" data-brand-category="all">All products</button>`,
    ...Array.from(groups.entries())
      .sort((left, right) => right[1].count - left[1].count || left[1].label.localeCompare(right[1].label))
      .map(([key, group]) => `
        <button type="button" class="brand-category-chip${activeCategory === key ? " is-active" : ""}" data-brand-category="${escapeHtml(key)}">
          ${escapeHtml(group.label)} • ${group.count}
        </button>
      `)
  ];
  brandCategoryLanes.innerHTML = chips.join("");
}

function renderStoreIntro() {
  const categories = Array.from(new Set(selectedBrandProducts.map((product) => categoryLabel(product.category))));
  const minPrice = Math.min(...selectedBrandProducts.map((product) => Number(product.price || 0)));
  const topRated = selectedBrandProducts
    .slice()
    .sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0))[0];
  document.title = `${selectedBrandLabel} Brand Store - ElectroMart`;
  brandIntroEyebrow.textContent = "Brand Store";
  brandIntroTitle.textContent = `${selectedBrandLabel} picks, collections, and ready-to-buy products`;
  brandIntroLead.textContent = `${selectedBrandLabel} currently spans ${categories.length} categories with ${selectedBrandProducts.length} live products. Start from ${money(minPrice)} and narrow the page by category, segment, or budget.`;
  brandPrimaryAction.href = "#brandStoreHeading";
  brandPrimaryAction.textContent = "Browse this brand";
  brandSecondaryAction.href = "brands.html";
  brandSecondaryAction.textContent = "Back to all brands";
  brandStoreHeading.textContent = `${selectedBrandLabel} storefront`;
  brandStoreLead.textContent = topRated
    ? `Top rated right now: ${topRated.name} at ${money(topRated.price)}. Use the quick category lanes below to jump into the strongest part of the ${selectedBrandLabel} range.`
    : `Browse the current ${selectedBrandLabel} range below.`;
}

function renderEmptyBrandSelection(requestedBrand) {
  document.title = "ElectroMart Brands";
  brandStoreShell.hidden = true;
  brandIntroEyebrow.textContent = "Brand Store";
  brandIntroTitle.textContent = requestedBrand
    ? `We could not find ${requestedBrand} in the current catalog.`
    : "Browse brands before you browse products.";
  brandIntroLead.textContent = requestedBrand
    ? "Try another brand from the directory below. As soon as the catalog contains that brand, this page will open its dedicated store view."
    : "Choose a brand to open its storefront, compare categories, and narrow down the product range without leaving the page.";
  brandPrimaryAction.href = "#brandDirectoryHeading";
  brandPrimaryAction.textContent = "Browse all brands";
  brandSecondaryAction.href = "products.html";
  brandSecondaryAction.textContent = "Open all products";
}

function getActiveStoreFilters() {
  const filters = [];
  const query = String(brandSearch?.value || "").trim();
  const category = String(brandCategoryFilter?.value || "all");
  const segment = String(brandSegmentFilter?.value || "all");
  const budget = String(brandBudgetFilter?.value || "all");

  if (query) {
    filters.push({
      id: "search",
      label: `Search: ${query}`,
      clear: () => { brandSearch.value = ""; },
      focus: brandSearch,
      feedback: "Removed brand search filter. Focus moved to the search input."
    });
  }
  if (category !== "all") {
    const readable = categoryLabel(category);
    filters.push({
      id: "category",
      label: `Category: ${readable}`,
      clear: () => { brandCategoryFilter.value = "all"; },
      focus: brandCategoryFilter,
      feedback: "Removed brand category filter. Focus moved to the category filter."
    });
  }
  if (segment !== "all") {
    filters.push({
      id: "segment",
      label: `Segment: ${segment.toUpperCase()}`,
      clear: () => { brandSegmentFilter.value = "all"; },
      focus: brandSegmentFilter,
      feedback: "Removed brand segment filter. Focus moved to the segment filter."
    });
  }
  if (budget !== "all") {
    const label = String(brandBudgetFilter?.selectedOptions?.[0]?.textContent || budget).trim();
    filters.push({
      id: "budget",
      label: `Budget: ${label}`,
      clear: () => { brandBudgetFilter.value = "all"; },
      focus: brandBudgetFilter,
      feedback: "Removed brand budget filter. Focus moved to the budget filter."
    });
  }
  return filters;
}

function renderEmptyStore() {
  brandStoreMeta.textContent = `No ${selectedBrandLabel} products matched the current filters`;
  brandStoreGrid.innerHTML = `
    <div class="brand-empty">
      <h3>No exact ${escapeHtml(selectedBrandLabel)} matches right now</h3>
      <p>Try a broader search, reset one filter, or switch to another category lane.</p>
    </div>
  `;
}

function renderStoreGrid(products) {
  brandStoreMeta.textContent = `Showing ${products.length} of ${selectedBrandProducts.length} ${selectedBrandLabel} products`;
  if (!products.length) {
    renderEmptyStore();
    return;
  }
  brandStoreGrid.innerHTML = products.map((product) => {
    const listPrice = Number(product.listPrice || product.price || 0);
    const showListPrice = listPrice > Number(product.price || 0);
    return `
      <article class="brand-store-card">
        <div class="brand-store-card-media">
          <span class="brand-store-card-tag">${escapeHtml(categoryLabel(product.category))}</span>
          <img src="${escapeHtml(normalizeImageUrl(product.image))}" alt="${escapeHtml(product.name)}" loading="lazy" />
        </div>
        <div class="brand-store-card-copy">
          <p class="brand-store-card-kicker">${escapeHtml(product.segment === "b2b" ? "Business ready" : "Retail ready")}</p>
          <div class="brand-store-card-title-row">
            <div>
              <h3><a href="product-detail.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
              <div class="brand-store-card-meta">
                <span class="brand-store-card-pill">${escapeHtml(categoryLabel(product.category))}</span>
                <span class="brand-store-card-pill">${escapeHtml(product.segment.toUpperCase())}</span>
              </div>
            </div>
            <span class="brand-store-card-rating">${Number(product.rating || 0).toFixed(1)} star</span>
          </div>
          <p>${escapeHtml(product.description || `${selectedBrandLabel} product with dependable performance and fast delivery support.`)}</p>
          <div class="brand-store-card-price-row">
            <span class="brand-store-card-price">${escapeHtml(money(product.price))}</span>
            ${showListPrice ? `<span class="brand-store-card-list-price">${escapeHtml(money(listPrice))}</span>` : ""}
          </div>
          <div class="brand-store-card-actions">
            <button type="button" data-brand-add="${escapeHtml(product.id)}">Add to Cart</button>
            <a href="product-detail.html?id=${encodeURIComponent(product.id)}">View details</a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function applyStoreFilters() {
  const query = String(brandSearch?.value || "").trim().toLowerCase();
  const category = String(brandCategoryFilter?.value || "all");
  const segment = String(brandSegmentFilter?.value || "all");
  const budget = String(brandBudgetFilter?.value || "all");

  renderCategoryLanes();

  const filtered = selectedBrandProducts.filter((product) => {
    const haystack = [product.name, product.brand, product.description, product.category, ...(Array.isArray(product.collections) ? product.collections : []), ...(Array.isArray(product.keywords) ? product.keywords : [])]
      .join(" ")
      .toLowerCase();
    const queryMatch = !query || haystack.includes(query);
    const categoryMatch = category === "all" || normalizeCategory(product.category) === category;
    const segmentMatch = segment === "all" || String(product.segment || "").toLowerCase() === segment;
    const budgetMatch = matchesBudget(product, budget);
    return queryMatch && categoryMatch && segmentMatch && budgetMatch;
  });

  renderStoreGrid(filtered);
  filterChipController?.update();
}

function renderPageState() {
  const requestedBrand = String(new URLSearchParams(window.location.search).get("brand") || "").trim();
  selectedBrandProducts = getCurrentBrandProducts();
  selectedBrandLabel = selectedBrandProducts[0]?.brand || requestedBrand;
  renderDirectory();
  renderIntroStats(selectedBrandProducts, buildBrandDirectory(allBrandProducts));

  if (!requestedBrand || !selectedBrandProducts.length) {
    renderEmptyBrandSelection(requestedBrand);
    return;
  }

  brandStoreShell.hidden = false;
  syncCategoryFilterOptions();
  renderStoreIntro();
  applyStoreFilters();
}

async function loadBrandProducts() {
  cacheCatalogProducts(fallbackBrandProducts);
  allBrandProducts = activeProducts(mergeProductsById(loadCatalogProductsList(), fallbackBrandProducts));
  renderPageState();

  try {
    const response = await fetch(`${API_BASE_URL}/products?status=active`);
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || !Array.isArray(data.products)) {
      return;
    }
    cacheCatalogProducts(data.products);
    allBrandProducts = activeProducts(mergeProductsById(loadCatalogProductsList(), fallbackBrandProducts));
    renderPageState();
  } catch (error) {
    return;
  }
}

brandDirectorySearch?.addEventListener("input", renderDirectory);
brandSearch?.addEventListener("input", applyStoreFilters);
brandCategoryFilter?.addEventListener("change", applyStoreFilters);
brandSegmentFilter?.addEventListener("change", applyStoreFilters);
brandBudgetFilter?.addEventListener("change", applyStoreFilters);
brandCategoryLanes?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-brand-category]");
  if (!button || !brandCategoryFilter) {
    return;
  }
  brandCategoryFilter.value = String(button.getAttribute("data-brand-category") || "all");
  applyStoreFilters();
  brandCategoryFilter.focus();
});
brandStoreGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-brand-add]");
  if (!button) {
    return;
  }
  addToCart(button.getAttribute("data-brand-add"));
  filterChipController?.showFeedback?.("Added brand product to cart.");
});

syncCartCount();
filterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: ".brand-toolbar",
  getFilters: getActiveStoreFilters,
  clearAll: () => {
    brandSearch.value = "";
    brandCategoryFilter.value = "all";
    brandSegmentFilter.value = "all";
    brandBudgetFilter.value = "all";
  },
  focusAfterClearAll: brandSearch,
  clearAllFeedback: "Removed all brand filters. Focus moved to the search input.",
  onChange: applyStoreFilters,
  getResultSummary: () => String(brandStoreMeta?.textContent || "").trim()
}) || null;

loadBrandProducts();
