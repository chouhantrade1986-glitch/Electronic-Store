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

const PAGE_QUERY_HINTS = {
  barebone_desktop: ["desktop barebone", "mini desktop", "pc kit"],
  branded_desktop: ["desktop", "business desktop", "workstation"],
  cpu_processor: ["processor", "cpu", "intel", "amd"],
  cpu_fan: ["cooler", "cpu fan", "aio"],
  motherboard: ["motherboard", "board", "chipset"],
  desktop_ram: ["ram", "memory", "ddr5"],
  graphics_card: ["graphics", "gpu", "rtx", "radeon"],
  cabinet: ["cabinet", "pc case", "tower"],
  cabinet_fan: ["fan", "cabinet fan", "airflow"],
  power_supply: ["power supply", "smps", "psu"],
  ups_batteries: ["ups", "battery", "backup power"]
};

const PAGE_CONFIG = {
  barebone_desktop: { title: "Barebone Desktop", headline: "Barebone Desktop Systems", subtitle: "Choose minimal desktop kits ready for custom assembly." },
  branded_desktop: { title: "Branded Desktop", headline: "Branded Desktop PCs", subtitle: "Reliable desktops from leading brands for office and home." },
  cpu_processor: { title: "CPU (Processor)", headline: "Desktop Processors", subtitle: "Intel and AMD processors for gaming, office and creator builds." },
  cpu_fan: { title: "CPU Fan", headline: "CPU Cooling Solutions", subtitle: "Air coolers and liquid AIO options for stable thermal performance." },
  motherboard: { title: "Motherboards", headline: "Desktop Motherboards", subtitle: "Feature-rich Intel and AMD motherboards for every build type." },
  desktop_ram: { title: "Desktop RAM", headline: "Desktop Memory Modules", subtitle: "DDR4 and DDR5 memory kits with high performance and stability." },
  graphics_card: { title: "Graphics Card", headline: "Graphics Processing Units", subtitle: "NVIDIA and AMD GPUs for gaming, streaming and creators." },
  cabinet: { title: "Cabinet", headline: "PC Cabinets", subtitle: "ATX and compact cabinets with airflow-focused design." },
  cabinet_fan: { title: "Cabinet Fan", headline: "Cabinet Cooling Fans", subtitle: "ARGB and high static-pressure fans for optimized airflow." },
  power_supply: { title: "Power Supply (SMPS)", headline: "Power Supplies", subtitle: "80+ certified PSUs for stable and efficient performance." },
  ups_batteries: { title: "UPS and Batteries", headline: "UPS and UPS Batteries", subtitle: "Power backup options for desktops and workstations." }
};

const INVENTORY = {
  barebone_desktop: [
    { id: 4101, name: "CoreLite Barebone Kit", brand: "CoreTech", segment: "b2c", price: 299, rating: 4.2, spec: "No RAM/Storage preinstalled", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
    { id: 4102, name: "Business Mini Barebone", brand: "Astra", segment: "b2b", price: 999, rating: 4.4, moq: 5, spec: "Compact chassis with PSU", image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
    { id: 4103, name: "Gaming Barebone Tower", brand: "Vector", segment: "b2c", price: 459, rating: 4.5, spec: "ATX shell, liquid-cooling ready", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" }
  ],
  branded_desktop: [
    { id: 4201, name: "Dell OptiFlex i5", brand: "Dell", segment: "b2c", price: 749, rating: 4.3, spec: "16GB RAM, 512GB SSD", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
    { id: 4202, name: "HP ProDesk Fleet", brand: "HP", segment: "b2b", price: 3399, rating: 4.5, moq: 5, spec: "Office bundle pack", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
    { id: 4203, name: "Lenovo ThinkCentre", brand: "Lenovo", segment: "b2c", price: 829, rating: 4.4, spec: "Business desktop tower", image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80" }
  ],
  cpu_processor: [
    { id: 4301, name: "Intel Core i5 14400F", brand: "Intel", segment: "b2c", price: 219, rating: 4.6, spec: "10-core desktop processor", image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=900&q=80" },
    { id: 4302, name: "AMD Ryzen 7 7800X3D", brand: "AMD", segment: "b2c", price: 399, rating: 4.8, spec: "8-core gaming CPU", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
    { id: 4303, name: "Intel Core i7 Business Pack", brand: "Intel", segment: "b2b", price: 1899, rating: 4.5, moq: 5, spec: "Bulk processor tray offer", image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" }
  ],
  cpu_fan: [
    { id: 4401, name: "Tower Air Cooler 120mm", brand: "CoolCore", segment: "b2c", price: 49, rating: 4.3, spec: "PWM fan with RGB", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
    { id: 4402, name: "240mm AIO Liquid Cooler", brand: "AquaFlow", segment: "b2c", price: 119, rating: 4.6, spec: "Dual radiator setup", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
    { id: 4403, name: "Workstation Cooling Pack", brand: "CoolCore", segment: "b2b", price: 499, rating: 4.4, moq: 10, spec: "Bulk fan cooler kits", image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" }
  ],
  motherboard: [
    { id: 4501, name: "B760 DDR5 Motherboard", brand: "MSI", segment: "b2c", price: 179, rating: 4.4, spec: "Intel LGA1700 platform", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
    { id: 4502, name: "B650 AM5 Motherboard", brand: "ASUS", segment: "b2c", price: 189, rating: 4.5, spec: "AMD AM5 platform", image: "https://images.unsplash.com/photo-1563770660941-10a6360765b5?auto=format&fit=crop&w=900&q=80" },
    { id: 4503, name: "Corporate Board Bundle", brand: "Gigabyte", segment: "b2b", price: 1299, rating: 4.3, moq: 5, spec: "Bulk motherboard procurement", image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" }
  ],
  desktop_ram: [
    { id: 4601, name: "16GB DDR5 Kit", brand: "Corsair", segment: "b2c", price: 69, rating: 4.5, spec: "5600MHz dual-channel", image: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=80" },
    { id: 4602, name: "32GB DDR5 Kit", brand: "Kingston", segment: "b2c", price: 129, rating: 4.6, spec: "6000MHz desktop memory", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
    { id: 4603, name: "Enterprise RAM Pack", brand: "Crucial", segment: "b2b", price: 999, rating: 4.4, moq: 10, spec: "Bulk memory modules", image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" }
  ],
  graphics_card: [
    { id: 4701, name: "NVIDIA RTX 4060", brand: "NVIDIA", segment: "b2c", price: 329, rating: 4.5, spec: "1080p high refresh gaming", image: "https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=900&q=80" },
    { id: 4702, name: "AMD RX 7800 XT", brand: "AMD", segment: "b2c", price: 519, rating: 4.6, spec: "1440p performance GPU", image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
    { id: 4703, name: "GPU Retail Bundle", brand: "NVIDIA", segment: "b2b", price: 3999, rating: 4.4, moq: 5, spec: "Retail bulk GPU stock", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" }
  ],
  cabinet: [
    { id: 4801, name: "ATX Airflow Cabinet", brand: "NZXT", segment: "b2c", price: 99, rating: 4.4, spec: "Tempered glass side panel", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
    { id: 4802, name: "mATX Compact Cabinet", brand: "Cooler Master", segment: "b2c", price: 79, rating: 4.2, spec: "Space saving design", image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
    { id: 4803, name: "System Integrator Cabinet Pack", brand: "Antec", segment: "b2b", price: 699, rating: 4.3, moq: 10, spec: "Bulk cabinet procurement", image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" }
  ],
  cabinet_fan: [
    { id: 4901, name: "120mm ARGB Fan", brand: "DeepCool", segment: "b2c", price: 19, rating: 4.3, spec: "PWM and ARGB", image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
    { id: 4902, name: "140mm High Airflow Fan", brand: "Noctua", segment: "b2c", price: 29, rating: 4.7, spec: "Low noise performance", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
    { id: 4903, name: "Cooling Fan Bulk Kit", brand: "Cooler Master", segment: "b2b", price: 249, rating: 4.4, moq: 20, spec: "Bulk installation kit", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" }
  ],
  power_supply: [
    { id: 5001, name: "650W 80+ Gold PSU", brand: "Corsair", segment: "b2c", price: 99, rating: 4.5, spec: "Fully modular", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
    { id: 5002, name: "850W 80+ Platinum PSU", brand: "Seasonic", segment: "b2c", price: 179, rating: 4.8, spec: "High efficiency flagship", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" },
    { id: 5003, name: "SMPS Business Pack", brand: "Cooler Master", segment: "b2b", price: 1299, rating: 4.4, moq: 10, spec: "Bulk PSU purchase", image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" }
  ],
  ups_batteries: [
    { id: 5101, name: "Line Interactive UPS 1kVA", brand: "APC", segment: "b2c", price: 139, rating: 4.4, spec: "Desktop backup UPS", image: "https://images.unsplash.com/photo-1587202372716-70f0f6adf6ec?auto=format&fit=crop&w=900&q=80" },
    { id: 5102, name: "UPS Replacement Battery", brand: "Luminous", segment: "b2c", price: 89, rating: 4.2, spec: "Compatible 12V battery", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80" },
    { id: 5103, name: "Enterprise UPS Pack", brand: "APC", segment: "b2b", price: 1599, rating: 4.5, moq: 5, spec: "UPS fleet procurement", image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80" }
  ]
};

const body = document.body;
const pageKey = body.getAttribute("data-page") || "barebone_desktop";
const pageConfig = PAGE_CONFIG[pageKey] || PAGE_CONFIG.barebone_desktop;
const pageItems = INVENTORY[pageKey] || [];

const pageTitle = document.getElementById("pageTitle");
const pageHeadline = document.getElementById("pageHeadline");
const pageSubtitle = document.getElementById("pageSubtitle");
const searchInput = document.getElementById("searchInput");
const brandFilter = document.getElementById("brandFilter");
const segmentFilter = document.getElementById("segmentFilter");
const sortFilter = document.getElementById("sortFilter");
const resultMeta = document.getElementById("resultMeta");
const itemGrid = document.getElementById("itemGrid");
const cartCount = document.getElementById("cartCount");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

let filterChipController = null;
let brandFilterList = null;

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

function ensureBrandFilterHost() {
  if (brandFilterList || !brandFilter || !brandFilter.parentElement) {
    return brandFilterList;
  }
  const host = document.createElement("div");
  host.id = "brandFilterList";
  host.className = "brand-filter-list";
  host.setAttribute("role", "group");
  host.setAttribute("aria-label", "Filter by brand");
  host.innerHTML = "<p class='brand-filter-empty'>Loading brands...</p>";
  brandFilter.replaceWith(host);
  brandFilterList = host;
  return brandFilterList;
}

function getBrandFilters() {
  const host = ensureBrandFilterHost();
  return host ? Array.from(host.querySelectorAll(".brand-filter")) : [];
}

function getSelectedBrands() {
  return getBrandFilters()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function syncDynamicBrandUI() {
  const host = ensureBrandFilterHost();
  if (!host) {
    return;
  }
  const selectedKeys = new Set(getSelectedBrands().map((brand) => normalizeBrandKey(brand)));
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const segment = String(segmentFilter?.value || "all");

  const source = pageItems.filter((item) => {
    const text = `${item.name} ${item.brand} ${item.spec}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const segmentMatch = segment === "all" || String(item.segment).toLowerCase() === segment;
    return queryMatch && segmentMatch;
  });

  const optionMap = new Map();
  [...source, ...pageItems.filter((item) => selectedKeys.has(normalizeBrandKey(item.brand)))]
    .forEach((item) => {
      const brand = String(item.brand || "").trim();
      if (!brand) {
        return;
      }
      optionMap.set(normalizeBrandKey(brand), brand);
    });

  const brands = Array.from(optionMap.values()).sort((left, right) => left.localeCompare(right));
  if (!brands.length) {
    host.innerHTML = "<p class='brand-filter-empty'>No brands match the current filters.</p>";
    return;
  }
  host.innerHTML = brands.map((brand) => {
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

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

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

function dedupeById(list) {
  const map = new Map();
  list.forEach((item) => {
    map.set(String(item.id), item);
  });
  return Array.from(map.values());
}

function mapApiProduct(item) {
  return {
    id: item.id,
    name: item.name || "Unnamed Product",
    brand: item.brand || "Generic",
    segment: item.segment || "b2c",
    price: Number(item.price || 0),
    rating: Number(item.rating || 0),
    moq: Number(item.moq || 0),
    spec: item.description || `${String(item.category || "component").toUpperCase()} • SKU ${item.sku || "N/A"}`,
    image: normalizeImageUrl(item.image) || fallbackImage()
  };
}

function mapCatalogProduct(item) {
  if (!item || !item.id) {
    return null;
  }
  return {
    id: String(item.id),
    name: item.name || "Unnamed Product",
    brand: item.brand || "Generic",
    segment: item.segment || "b2c",
    price: Number(item.price || 0),
    rating: Number(item.rating || 0),
    moq: Number(item.moq || 0),
    spec: item.description || `${String(item.category || "component").toUpperCase()} • SKU ${item.sku || "N/A"}`,
    image: normalizeImageUrl(item.image) || fallbackImage(),
    _keywords: Array.isArray(item.keywords) ? item.keywords : [],
    _category: String(item.category || "").toLowerCase()
  };
}

function productMatchesPage(item) {
  const hints = PAGE_QUERY_HINTS[pageKey] || [];
  if (!hints.length) {
    return true;
  }
  const text = `${item.name || ""} ${item.brand || ""} ${item.spec || ""} ${item._category || ""} ${(item._keywords || []).join(" ")}`.toLowerCase();
  return hints.some((hint) => text.includes(String(hint).toLowerCase()));
}

async function fetchProductsByHint(hint) {
  const params = new URLSearchParams({
    search: hint,
    segment: "all",
    category: "all",
    brand: "all",
    sort: "relevance",
    status: "all"
  });
  const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json().catch(() => null);
  if (!data || !Array.isArray(data.products)) {
    return [];
  }
  return data.products.map(mapApiProduct);
}

async function hydrateWithApiData() {
  const hints = PAGE_QUERY_HINTS[pageKey] || [];
  if (!hints.length) {
    return;
  }

  const collected = [];
  for (const hint of hints) {
    try {
      const items = await fetchProductsByHint(hint);
      collected.push(...items);
    } catch (error) {
      // fallback inventory remains active
    }
  }

  const localCatalogItems = Object.values(loadCatalogMap())
    .map(mapCatalogProduct)
    .filter(Boolean)
    .filter((item) => productMatchesPage(item));

  const merged = dedupeById([...collected, ...localCatalogItems]);
  if (merged.length > 0) {
    pageItems.splice(0, pageItems.length, ...merged);
  }
}

function cardHtml(item) {
  const bulk = item.segment === "b2b" && item.moq ? `<p class="bulk-meta">Minimum order quantity: ${item.moq}</p>` : "";
  const detailUrl = `product-detail.html?id=${encodeURIComponent(item.id)}`;
  return `
    <article class="item-card">
      <a href="${detailUrl}" aria-label="Open ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </a>
      <div class="item-content">
        <h3><a href="${detailUrl}">${item.name}</a></h3>
        <p class="spec">${item.spec}</p>
        <div class="meta">
          <span class="price">${money(item.price)}</span>
          <span class="rating">${Number(item.rating).toFixed(1)} Star</span>
        </div>
        ${bulk}
        <button class="add-btn" data-id="${item.id}" type="button">Add to Cart</button>
      </div>
    </article>
  `;
}

function render(list) {
  resultMeta.textContent = `Showing ${list.length} products`;
  if (!list.length) {
    itemGrid.innerHTML = "<div class='empty'>No exact component matches found. Try clearing one filter or broadening the search.</div>";
    return;
  }
  itemGrid.innerHTML = list.map(cardHtml).join("");
}

function sortItems(items, sortValue) {
  const next = [...items];
  if (sortValue === "price_asc") {
    next.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortValue === "price_desc") {
    next.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortValue === "rating_desc") {
    next.sort((a, b) => Number(b.rating) - Number(a.rating));
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
  return "Sort: Relevance";
}

function getActiveListingFilters() {
  const filters = [];
  const query = String(searchInput.value || "").trim();
  const segment = String(segmentFilter.value || "all");
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

  getSelectedBrands().forEach((brand) => {
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

function applyFilters() {
  const query = String(searchInput.value || "").trim().toLowerCase();
  syncDynamicBrandUI();
  const selectedBrands = getSelectedBrands();
  const segment = String(segmentFilter.value || "all");
  const sortValue = String(sortFilter.value || "relevance");

  const filtered = pageItems.filter((item) => {
    const text = `${item.name} ${item.brand} ${item.spec}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const brandMatch = !selectedBrands.length || selectedBrands.includes(item.brand);
    const segmentMatch = segment === "all" || String(item.segment).toLowerCase() === segment;
    return queryMatch && brandMatch && segmentMatch;
  });

  render(sortItems(filtered, sortValue));
  filterChipController?.update();
}

pageTitle.textContent = pageConfig.title;
pageHeadline.textContent = pageConfig.headline;
pageSubtitle.textContent = pageConfig.subtitle;

searchInput.addEventListener("input", applyFilters);
segmentFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);
ensureBrandFilterHost();
brandFilterList?.addEventListener("change", (event) => {
  if (event.target.closest(".brand-filter")) {
    applyFilters();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("add-btn")) {
    return;
  }
  const id = String(event.target.getAttribute("data-id") || "").trim();
  if (id) {
    addToCart(id);
  }
});

syncCartCount();

async function initPage() {
  await hydrateWithApiData();
  filterChipController = window.ElectroMartListingFilterChips?.init({
    mountAfter: ".panel-head",
    getFilters: getActiveListingFilters,
    clearAll: () => {
      searchInput.value = "";
      getBrandFilters().forEach((checkbox) => {
        checkbox.checked = false;
      });
      segmentFilter.value = "all";
      sortFilter.value = "relevance";
    },
    focusAfterClearAll: searchInput,
    clearAllFeedback: "Removed all component filters. Focus moved to the search input.",
    onChange: applyFilters,
    getResultSummary: () => String(resultMeta?.textContent || "").trim()
  }) || null;
  applyFilters();
}

initPage();





