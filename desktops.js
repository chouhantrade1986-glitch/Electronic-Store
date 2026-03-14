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
  const category = normalizeDesktopCategory(item.category);
  const status = String(item.status || "active").toLowerCase();
  if (category !== "computer" || status !== "active") {
    return null;
  }

  return {
    id: String(item.id),
    name: item.name || `Product #${item.id}`,
    brand: item.brand || "Generic",
    segment: String(item.segment || "b2c").toLowerCase(),
    processor: String(item.processor || inferDesktopProcessor(item)).toLowerCase(),
    purpose: String(item.purpose || inferDesktopPurpose(item)).toLowerCase(),
    ram: item.ram || "16GB",
    storage: item.storage || "512GB SSD",
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
      return;
    }
    const payload = await response.json().catch(() => ({}));
    apiDesktopProducts = Array.isArray(payload.products) ? payload.products : [];
  } catch (error) {
    apiDesktopProducts = [];
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

function desktopCard(item) {
  const detailUrl = `product-detail.html?id=${item.id}`;
  const bulk = item.segment === "b2b" && item.moq ? `<p class="bulk-meta">Minimum order quantity: ${item.moq}</p>` : "";

  return `
    <article class="product-card">
      <a href="${detailUrl}" class="thumb-link" aria-label="Open ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}" class="title-link">${item.name}</a></h3>
        <div class="spec-row">
          <span class="spec-chip">${titleCase(item.processor)} CPU</span>
          <span class="spec-chip">${titleCase(item.purpose)}</span>
          <span class="spec-chip">${item.ram}</span>
          <span class="spec-chip">${item.storage}</span>
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
    desktopGrid.innerHTML = "<div class='empty'>No computers match your filters.</div>";
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
  const query = String(searchInput.value || "").trim().toLowerCase();
  const segment = String(segmentFilter.value || "all");
  const processor = String(processorFilter.value || "all");
  const purpose = String(purposeFilter.value || "all");
  const sortValue = String(sortFilter.value || "relevance");

  const filtered = source.filter((item) => {
    const text = `${item.name} ${item.brand || ""} ${item.processor} ${item.purpose} ${item.ram} ${item.storage}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = segment === "all" || item.segment === segment;
    const processorMatch = processor === "all" || item.processor === processor;
    const purposeMatch = purpose === "all" || item.purpose === purpose;
    return queryMatch && segmentMatch && processorMatch && purposeMatch;
  });

  render(sortItems(filtered, sortValue));
  filterChipController?.update();
}

searchInput.addEventListener("input", filterDesktops);
segmentFilter.addEventListener("change", filterDesktops);
processorFilter.addEventListener("change", filterDesktops);
purposeFilter.addEventListener("change", filterDesktops);
sortFilter.addEventListener("change", filterDesktops);

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

async function initDesktopPage() {
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
  filterDesktops();
}

initDesktopPage();
