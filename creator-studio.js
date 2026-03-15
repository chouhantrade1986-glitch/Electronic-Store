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

const creatorStudioFallbackProducts = [
  {
    "id": "product_1773480601001",
    "name": "AstraStudio Creator 16",
    "brand": "AstraTech",
    "segment": "b2c",
    "category": "laptop",
    "collections": ["laptop", "creator-studio", "computer"],
    "price": 129999,
    "listPrice": 139999,
    "rating": 4.8,
    "stock": 12,
    "moq": 0,
    "image": "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    "description": "16-inch creator laptop with a color-accurate display, fast SSD storage, and export-ready performance for video, design, and streaming workflows.",
    "keywords": ["creator studio", "laptop", "video editing", "design"],
    "sku": "ASTRA-CREATOR-16",
    "status": "active",
    "fulfillment": "fbm",
    "featured": true,
    "createdAt": "2026-03-14T09:10:01.000Z",
    "updatedAt": "2026-03-14T09:10:01.000Z"
  },
  {
    "id": "product_1773480601002",
    "name": "OrbitX ViewPro 32 4K",
    "brand": "OrbitX",
    "segment": "b2c",
    "category": "computer",
    "collections": ["computer", "creator-studio"],
    "price": 32999,
    "listPrice": 37999,
    "rating": 4.7,
    "stock": 18,
    "moq": 0,
    "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    "description": "32-inch 4K monitor tuned for editing timelines, grading work, and long studio sessions.",
    "keywords": ["creator studio", "4k monitor", "color monitor", "editing"],
    "sku": "ORBITX-VIEWPRO-32",
    "status": "active",
    "fulfillment": "fbm",
    "featured": true,
    "createdAt": "2026-03-14T09:12:00.000Z",
    "updatedAt": "2026-03-14T09:12:00.000Z"
  },
  {
    "id": "product_1773480601003",
    "name": "PulseCast Pro USB Microphone",
    "brand": "PulseWave",
    "segment": "b2c",
    "category": "audio",
    "collections": ["audio", "creator-studio"],
    "price": 8999,
    "listPrice": 10999,
    "rating": 4.6,
    "stock": 26,
    "moq": 0,
    "image": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    "description": "USB creator microphone with a clean vocal profile for streaming, podcasts, and client calls.",
    "keywords": ["creator studio", "microphone", "podcast", "streaming"],
    "sku": "PULSECAST-PRO-USB",
    "status": "active",
    "fulfillment": "fbm",
    "featured": false,
    "createdAt": "2026-03-14T09:14:00.000Z",
    "updatedAt": "2026-03-14T09:14:00.000Z"
  },
  {
    "id": "product_1773480601004",
    "name": "Nimbus StreamCam 4K",
    "brand": "Nimbus",
    "segment": "b2c",
    "category": "accessory",
    "collections": ["accessory", "creator-studio"],
    "price": 6999,
    "listPrice": 8499,
    "rating": 4.5,
    "stock": 31,
    "moq": 0,
    "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    "description": "Compact 4K webcam with autofocus and sharp framing for live sessions and remote shoots.",
    "keywords": ["creator studio", "webcam", "4k camera", "streaming"],
    "sku": "NIMBUS-STREAMCAM-4K",
    "status": "active",
    "fulfillment": "fbm",
    "featured": false,
    "createdAt": "2026-03-14T09:16:00.000Z",
    "updatedAt": "2026-03-14T09:16:00.000Z"
  },
  {
    "id": "product_1773480601005",
    "name": "VectorDock 12-in-1 Thunderbolt Hub",
    "brand": "Vector",
    "segment": "b2c",
    "category": "accessory",
    "collections": ["accessory", "creator-studio", "computer"],
    "price": 11999,
    "listPrice": 13999,
    "rating": 4.4,
    "stock": 22,
    "moq": 0,
    "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
    "description": "Single-cable dock with creator-friendly ports for drives, monitors, cameras, and fast charging.",
    "keywords": ["creator studio", "dock", "thunderbolt", "hub"],
    "sku": "VECTORDOCK-12IN1",
    "status": "active",
    "fulfillment": "fbm",
    "featured": false,
    "createdAt": "2026-03-14T09:18:00.000Z",
    "updatedAt": "2026-03-14T09:18:00.000Z"
  },
  {
    "id": "product_1773480601006",
    "name": "AstraPad Pen Display 13",
    "brand": "AstraTech",
    "segment": "b2c",
    "category": "computer",
    "collections": ["computer", "creator-studio"],
    "price": 45999,
    "listPrice": 49999,
    "rating": 4.7,
    "stock": 9,
    "moq": 0,
    "image": "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=900&q=80",
    "description": "13-inch pen display for sketching, retouching, and precise creative control across design workflows.",
    "keywords": ["creator studio", "pen display", "illustration", "design"],
    "sku": "ASTRAPAD-13",
    "status": "active",
    "fulfillment": "fbm",
    "featured": false,
    "createdAt": "2026-03-14T09:20:00.000Z",
    "updatedAt": "2026-03-14T09:20:00.000Z"
  }
];

const cartCount = document.getElementById("cartCount");
const studioSearch = document.getElementById("studioSearch");
const studioBrandFilterList = document.getElementById("studioBrandFilterList");
const studioTypeFilter = document.getElementById("studioTypeFilter");
const studioBudgetFilter = document.getElementById("studioBudgetFilter");
const studioMeta = document.getElementById("studioMeta");
const studioGrid = document.getElementById("studioGrid");
const studioBundleGrid = document.getElementById("studioBundleGrid");
const studioBundleMeta = document.getElementById("studioBundleMeta");
let creatorStudioProducts = [];
let filterChipController = null;

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

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
  const key = String(productId);
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

function normalizeCollectionValues(collections, category) {
  const values = Array.isArray(collections) ? collections : [];
  const normalized = values.map((item) => normalizeCategory(item)).filter(Boolean);
  const categoryValue = normalizeCategory(category);
  if (categoryValue) {
    normalized.push(categoryValue);
  }
  return Array.from(new Set(normalized));
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
      image: normalizeImageUrl(product.image || existing.image || "")
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
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return Object.values(parsed || {});
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
    const key = String(product.id);
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

function creatorCollectionProducts(sourceProducts) {
  return mergeProductsById(creatorStudioFallbackProducts, sourceProducts)
    .filter((product) => normalizeCollectionValues(product.collections, product.category).includes("creator-studio"))
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

function inferStudioType(product) {
  const name = String(product?.name || "").toLowerCase();
  const category = normalizeCategory(product?.category || "");
  if (category === "laptop") {
    return "workstation";
  }
  if (name.includes("monitor") || name.includes("display")) {
    return "display";
  }
  if (category === "audio") {
    return "audio";
  }
  if (name.includes("cam") || name.includes("camera") || name.includes("webcam")) {
    return "capture";
  }
  return "workflow";
}

function studioTypeLabel(value) {
  const labels = {
    workstation: "Workstation",
    display: "Display",
    audio: "Audio",
    capture: "Capture",
    workflow: "Workflow"
  };
  return labels[value] || "Creator Tool";
}

function normalizeBrandKey(value) {
  return String(value || "").trim().toLowerCase();
}

function getBrandFilters() {
  return studioBrandFilterList ? Array.from(studioBrandFilterList.querySelectorAll(".studio-brand-filter")) : [];
}

function getSelectedBrands() {
  return getBrandFilters()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function syncDynamicBrandUI() {
  if (!studioBrandFilterList) {
    return;
  }
  const selectedKeys = new Set(getSelectedBrands().map((brand) => normalizeBrandKey(brand)));
  const query = String(studioSearch?.value || "").trim().toLowerCase();
  const type = String(studioTypeFilter?.value || "all");
  const budget = String(studioBudgetFilter?.value || "all");

  const source = creatorStudioProducts.filter((product) => {
    const haystack = [product.name, product.brand, product.description, ...(Array.isArray(product.keywords) ? product.keywords : []), ...(Array.isArray(product.collections) ? product.collections : [])].join(" ").toLowerCase();
    const queryMatch = !query || haystack.includes(query);
    const typeMatch = type === "all" || inferStudioType(product) === type;
    const budgetMatch = matchesBudget(product, budget);
    return queryMatch && typeMatch && budgetMatch;
  });

  const optionMap = new Map();
  [...source, ...creatorStudioProducts.filter((product) => selectedKeys.has(normalizeBrandKey(product.brand)))]
    .forEach((product) => {
      const brand = String(product.brand || "").trim();
      if (!brand) {
        return;
      }
      optionMap.set(normalizeBrandKey(brand), brand);
    });

  const brands = Array.from(optionMap.values()).sort((left, right) => left.localeCompare(right));
  if (!brands.length) {
    studioBrandFilterList.innerHTML = "<p class='studio-filter-empty'>No brands match the current filters.</p>";
    return;
  }
  studioBrandFilterList.innerHTML = brands.map((brand) => {
    const checked = selectedKeys.has(normalizeBrandKey(brand)) ? " checked" : "";
    return `<label class="check-item"><input type="checkbox" class="studio-brand-filter" value="${escapeHtml(brand)}"${checked} /> ${escapeHtml(brand)}</label>`;
  }).join("");
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
  return labels[normalizeCategory(value)] || "Products";
}

function featuredCreatorByType(type) {
  return creatorStudioProducts
    .filter((product) => inferStudioType(product) === type)
    .slice()
    .sort((left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)) || Number(right.rating || 0) - Number(left.rating || 0))[0] || null;
}

function buildStudioBundles() {
  const workstation = featuredCreatorByType("workstation");
  const display = featuredCreatorByType("display");
  const audio = featuredCreatorByType("audio");
  const capture = featuredCreatorByType("capture");
  const workflow = featuredCreatorByType("workflow");

  return [
    {
      id: "editing-suite",
      kicker: "Editing suite",
      title: "Color-first editing desk",
      description: "Start with a creator laptop, then add a calibrated display and workflow dock for exports, drives, and second-screen timelines.",
      items: [workstation, display, workflow].filter(Boolean),
      cta: workstation ? `product-detail.html?id=${encodeURIComponent(workstation.id)}` : "creator-studio.html"
    },
    {
      id: "streaming-suite",
      kicker: "Streaming suite",
      title: "Mic and camera first setup",
      description: "Focus on voice clarity and framing first, then add a dock or display later once your stream or call workflow is stable.",
      items: [audio, capture, workflow].filter(Boolean),
      cta: audio ? `product-detail.html?id=${encodeURIComponent(audio.id)}` : "creator-studio.html"
    },
    {
      id: "desk-upgrade",
      kicker: "Desk upgrade",
      title: "Upgrade the setup you already own",
      description: "Best for creators who already have a laptop and just need stronger ports, a sharper display, or cleaner accessory flow.",
      items: [workflow, display, audio].filter(Boolean),
      cta: workflow ? `product-detail.html?id=${encodeURIComponent(workflow.id)}` : "creator-studio.html"
    }
  ].filter((bundle) => bundle.items.length > 0);
}

function renderStudioBundles() {
  if (!studioBundleGrid || !studioBundleMeta) {
    return;
  }
  const bundles = buildStudioBundles();
  if (!bundles.length) {
    studioBundleMeta.textContent = "No starter bundles available right now.";
    studioBundleGrid.innerHTML = "";
    return;
  }

  studioBundleMeta.textContent = `${bundles.length} ready-made setup paths based on the current Creator Studio catalog.`;
  studioBundleGrid.innerHTML = bundles.map((bundle) => {
    const total = bundle.items.reduce((sum, item) => sum + Number(item?.price || 0), 0);
    const media = normalizeImageUrl(bundle.items[0]?.image);
    return `
      <article class="studio-bundle-card">
        <div class="studio-bundle-media" style="background-image:url('${escapeHtml(media)}')"></div>
        <div class="studio-bundle-copy">
          <p class="studio-bundle-kicker">${escapeHtml(bundle.kicker)}</p>
          <h3>${escapeHtml(bundle.title)}</h3>
          <div class="studio-bundle-meta">
            <span class="studio-bundle-pill">${bundle.items.length} picks</span>
            <span class="studio-bundle-pill">From ${money(total)}</span>
          </div>
          <p>${escapeHtml(bundle.description)}</p>
          <ul class="studio-bundle-list">
            ${bundle.items.map((item) => `<li>${escapeHtml(item.name)} - ${money(item.price)}</li>`).join("")}
          </ul>
          <a href="${bundle.cta}" class="studio-bundle-link">Open starting pick</a>
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

function getActiveStudioFilters() {
  const filters = [];
  const query = String(studioSearch?.value || "").trim();
  const selectedBrands = getSelectedBrands();
  const type = String(studioTypeFilter?.value || "all");
  const budget = String(studioBudgetFilter?.value || "all");

  if (query) {
    filters.push({
      id: "search",
      label: `Search: ${query}`,
      clear: () => { studioSearch.value = ""; },
      focus: studioSearch,
      feedback: "Removed creator search filter. Focus moved to the search input."
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
      feedback: "Removed creator brand filter. Focus moved to the brand option."
    });
  });
  if (type !== "all") {
    filters.push({
      id: "type",
      label: `Type: ${studioTypeLabel(type)}`,
      clear: () => { studioTypeFilter.value = "all"; },
      focus: studioTypeFilter,
      feedback: "Removed creator type filter. Focus moved to the type filter."
    });
  }
  if (budget !== "all") {
    const budgetLabel = String(studioBudgetFilter?.selectedOptions?.[0]?.textContent || budget).trim();
    filters.push({
      id: "budget",
      label: `Budget: ${budgetLabel}`,
      clear: () => { studioBudgetFilter.value = "all"; },
      focus: studioBudgetFilter,
      feedback: "Removed creator budget filter. Focus moved to the budget filter."
    });
  }
  return filters;
}

function renderEmptyState() {
  studioMeta.textContent = "No creator picks matched the current filters";
  studioGrid.innerHTML = `
    <div class="studio-empty">
      <h3>No matching creator tools right now</h3>
      <p>Try clearing one filter or search with a broader term like laptop, monitor, or mic.</p>
      <p><a href="products.html?search=creator">Open all creator search results</a></p>
    </div>
  `;
}

function productCard(product) {
  const type = inferStudioType(product);
  const listPrice = Number(product.listPrice || product.price || 0);
  const showListPrice = listPrice > Number(product.price || 0);
  const badge = product.featured ? '<span class="studio-card-badge">Creator pick</span>' : "";
  return `
    <article class="studio-card">
      <div class="studio-card-media">
        ${badge}
        <span class="studio-card-type">${escapeHtml(studioTypeLabel(type))}</span>
        <img src="${escapeHtml(normalizeImageUrl(product.image))}" alt="${escapeHtml(product.name)}" loading="lazy" />
      </div>
      <div class="studio-card-body">
        <div class="studio-card-title-row">
          <div>
            <h3><a href="product-detail.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
            <div class="studio-card-meta">
              <a class="studio-card-brand-link" href="brands.html?brand=${encodeURIComponent(String(product.brand || "ElectroMart").trim())}">${escapeHtml(product.brand || "ElectroMart")}</a>
              <span>${escapeHtml(categoryLabel(product.category))}</span>
            </div>
          </div>
          <span class="studio-card-rating">${Number(product.rating || 0).toFixed(1)} ?</span>
        </div>
        <p class="studio-card-description">${escapeHtml(product.description || "Creator-focused hardware for faster editing, streaming, and studio workflows.")}</p>
        <div class="studio-card-price-row">
          <span class="studio-card-price">${escapeHtml(money(product.price))}</span>
          ${showListPrice ? `<span class="studio-card-list-price">${escapeHtml(money(listPrice))}</span>` : ""}
        </div>
        <div class="studio-card-actions">
          <button type="button" data-add-to-cart="${escapeHtml(product.id)}">Add to Cart</button>
          <a href="product-detail.html?id=${encodeURIComponent(product.id)}">View details</a>
        </div>
      </div>
    </article>
  `;
}

function setGridBusy(isBusy) {
  if (studioGrid) studioGrid.setAttribute("aria-busy", isBusy ? "true" : "false");
}

function applyFilters() {
  const query = String(studioSearch?.value || "").trim().toLowerCase();
  syncDynamicBrandUI();
  const selectedBrands = getSelectedBrands();
  const type = String(studioTypeFilter?.value || "all");
  const budget = String(studioBudgetFilter?.value || "all");
  const filtered = creatorStudioProducts.filter((product) => {
    const haystack = [product.name, product.brand, product.description, ...(Array.isArray(product.keywords) ? product.keywords : []), ...(Array.isArray(product.collections) ? product.collections : [])].join(" ").toLowerCase();
    return (!query || haystack.includes(query))
      && (!selectedBrands.length || selectedBrands.includes(product.brand))
      && (type === "all" || inferStudioType(product) === type)
      && matchesBudget(product, budget);
  });

  if (!filtered.length) {
    renderEmptyState();
  } else {
    studioMeta.textContent = `Showing ${filtered.length} of ${creatorStudioProducts.length} creator products`;
    studioGrid.innerHTML = filtered.map(productCard).join("");
  }
  filterChipController?.update();
}

async function loadCreatorStudioProducts() {
  setGridBusy(true);
  cacheCatalogProducts(creatorStudioFallbackProducts);
  creatorStudioProducts = creatorCollectionProducts(loadCatalogProductsList());
  renderStudioBundles();
  applyFilters();
  try {
    const response = await fetch(`${API_BASE_URL}/products?status=active`);
    const data = await response.json().catch(() => null);
    if (response.ok && data && Array.isArray(data.products)) {
      cacheCatalogProducts(data.products);
      creatorStudioProducts = creatorCollectionProducts(loadCatalogProductsList());
      renderStudioBundles();
      applyFilters();
    }
  } catch (error) {
    return;
  } finally {
    setGridBusy(false);
  }
}

studioGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;
  addToCart(button.getAttribute("data-add-to-cart"));
  filterChipController?.showFeedback?.("Added creator product to cart.");
});

studioSearch?.addEventListener("input", applyFilters);
studioBrandFilterList?.addEventListener("change", (event) => {
  if (event.target.closest(".studio-brand-filter")) {
    applyFilters();
  }
});
studioTypeFilter?.addEventListener("change", applyFilters);
studioBudgetFilter?.addEventListener("change", applyFilters);
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-studio-shortcut]");
  if (!trigger) {
    return;
  }
  const shortcut = String(trigger.getAttribute("data-studio-shortcut") || "");
  studioSearch.value = "";
  getBrandFilters().forEach((checkbox) => {
    checkbox.checked = false;
  });
  if (shortcut === "editing") {
    studioTypeFilter.value = "workstation";
    studioBudgetFilter.value = "over-50000";
  } else if (shortcut === "streaming") {
    studioTypeFilter.value = "audio";
    studioBudgetFilter.value = "under-10000";
  } else if (shortcut === "workflow") {
    studioTypeFilter.value = "workflow";
    studioBudgetFilter.value = "10000-50000";
  }
  applyFilters();
  studioSearch?.focus();
});

syncCartCount();
filterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: ".studio-toolbar",
  getFilters: getActiveStudioFilters,
  clearAll: () => {
    studioSearch.value = "";
    getBrandFilters().forEach((checkbox) => {
      checkbox.checked = false;
    });
    studioTypeFilter.value = "all";
    studioBudgetFilter.value = "all";
  },
  focusAfterClearAll: studioSearch,
  clearAllFeedback: "Removed all creator filters. Focus moved to the search input.",
  onChange: applyFilters,
  getResultSummary: () => String(studioMeta?.textContent || "").trim()
}) || null;

loadCreatorStudioProducts();
