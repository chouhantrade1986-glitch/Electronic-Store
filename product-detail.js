const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const AUTH_STORAGE_KEY = "electromart_auth_v1";
const BACK_IN_STOCK_REQUESTS_STORAGE_KEY = "electromart_back_in_stock_requests_v1";
const WISHLIST_STORAGE_KEY = "electromart_wishlist_v1";
const RECENTLY_VIEWED_STORAGE_KEY = "electromart_recently_viewed_v1";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const products = [
  { id: 1, name: "AstraBook Pro 14", brand: "AstraTech", segment: "b2c", category: "laptop", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Nimbus Phone X", brand: "Nimbus", segment: "b2c", category: "mobile", price: 749, rating: 4.5, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Pulse ANC Headphones", brand: "PulseWave", segment: "b2c", category: "audio", price: 179, rating: 4.4, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "4K Smart Television", brand: "Nimbus", segment: "b2c", category: "accessory", price: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Orbit Mechanical Keyboard", brand: "OrbitX", segment: "b2c", category: "accessory", price: 109, rating: 4.3, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "ZenPad Tablet 11", brand: "ZenPad", segment: "b2c", category: "mobile", price: 529, rating: 4.2, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80" },
  { id: 7, name: "Vector Gaming Laptop", brand: "Vector", segment: "b2c", category: "laptop", price: 1299, rating: 4.8, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "Echo Smart Speaker", brand: "EchoSphere", segment: "b2c", category: "audio", price: 89, rating: 4.1, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" },
  { id: 9, name: "Office Laptop Bundle (10 Units)", brand: "AstraTech", segment: "b2b", category: "laptop", price: 8690, rating: 4.7, moq: 10, image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80" },
  { id: 10, name: "Retail Smartphone Pack (25 Units)", brand: "Nimbus", segment: "b2b", category: "mobile", price: 15499, rating: 4.5, moq: 25, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80" },
  { id: 11, name: "Corporate Headset Case (50 Units)", brand: "PulseWave", segment: "b2b", category: "audio", price: 5399, rating: 4.4, moq: 50, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80" },
  { id: 12, name: "Accessory Mix Carton (100 Units)", brand: "OrbitX", segment: "b2b", category: "accessory", price: 4299, rating: 4.3, moq: 100, image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=80" },
  {
    id: "product_1772722039220",
    name: "Lenovo V15 G4 (2024)",
    brand: "Lenovo",
    segment: "b2c",
    category: "laptop",
    price: 36000,
    listPrice: 36000,
    rating: 0,
    moq: 0,
    image: "",
    description: "AMD Ryzen 5 7520U, 8GB RAM, 512GB SSD, AMD Radeon Graphics, DOS, 15.6-inch FHD, Arctic Grey, 1.57 kg",
    keywords: ["lenovo", "laptop", "business laptop", "ryzen 5"],
    sku: "LENOVO-V15-G4-2024",
    status: "active",
    fulfillment: "fbm",
    featured: false,
    stock: 1,
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

const desktopProducts = [
  { id: 101, name: "Titan Office Tower i5", brand: "Titan", segment: "b2c", category: "computer", price: 899, rating: 4.4, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80" },
  { id: 102, name: "Vortex Gaming Rig Ryzen 7", brand: "Vortex", segment: "b2c", category: "computer", price: 1699, rating: 4.8, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80" },
  { id: 103, name: "Creator Studio Workstation", brand: "Creator", segment: "b2c", category: "computer", price: 1999, rating: 4.7, image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=900&q=80" },
  { id: 104, name: "Business Desktop Bundle (5 Units)", brand: "Titan", segment: "b2b", category: "computer", price: 4299, rating: 4.5, moq: 5, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
  { id: 105, name: "Retail Gaming Pack (3 Units)", brand: "Vortex", segment: "b2b", category: "computer", price: 4799, rating: 4.6, moq: 3, image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&q=80" }
];

const printerProducts = [
  { id: 201, name: "Epson EcoTank L3250", brand: "Epson", segment: "b2c", category: "printer", price: 15999, rating: 4.5, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80" },
  { id: 202, name: "HP LaserJet Pro MFP 4104", brand: "HP", segment: "b2c", category: "printer", price: 28999, rating: 4.7, image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df89?auto=format&fit=crop&w=900&q=80" },
  { id: 203, name: "Canon PIXMA G3770 All-in-One", brand: "Canon", segment: "b2c", category: "printer", price: 18499, rating: 4.4, image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80" },
  { id: 204, name: "Brother HL-L5100DN Office Pack (5 Units)", brand: "Brother", segment: "b2b", category: "printer", price: 124999, rating: 4.6, moq: 5, image: "https://images.unsplash.com/photo-1612810806695-30f7a8258391?auto=format&fit=crop&w=900&q=80" },
  { id: 205, name: "Zebra ZD230 Thermal Label Printer", brand: "Zebra", segment: "b2b", category: "printer", price: 47999, rating: 4.5, moq: 3, image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=900&q=80" }
];

const allProducts = [...products, ...desktopProducts, ...printerProducts];

const specMap = {
  laptop: ["High performance processor", "SSD storage", "Long battery life"],
  mobile: ["AMOLED display", "Fast charging", "Multi-camera setup"],
  audio: ["Bluetooth 5.2", "Deep bass", "Low-latency mode"],
  accessory: ["Durable build", "Warranty included", "Universal compatibility"],
  computer: ["Tower form factor", "Upgradeable components", "Business and gaming ready"],
  printer: ["High-yield print output", "USB and wireless connectivity", "Suitable for home and office"]
};

const productDetail = document.getElementById("productDetail");
const missingState = document.getElementById("missingState");
const productImage = document.getElementById("productImage");
const productVideo = document.getElementById("productVideo");
const mediaThumbRail = document.getElementById("mediaThumbRail");
const imageZoomPane = document.getElementById("imageZoomPane");
const fullscreenViewer = document.getElementById("fullscreenViewer");
const fullscreenCloseBtn = document.getElementById("fullscreenCloseBtn");
const fullscreenImage = document.getElementById("fullscreenImage");
const fullscreenVideo = document.getElementById("fullscreenVideo");
const fullscreenThumbs = document.getElementById("fullscreenThumbs");
const fullscreenTitle = document.getElementById("fullscreenTitle");
const fsTabVideos = document.getElementById("fsTabVideos");
const fsTabImages = document.getElementById("fsTabImages");
const fsZoomInBtn = document.getElementById("fsZoomInBtn");
const fsZoomOutBtn = document.getElementById("fsZoomOutBtn");
const fsThumbUpBtn = document.getElementById("fsThumbUpBtn");
const fsThumbDownBtn = document.getElementById("fsThumbDownBtn");
const productName = document.getElementById("productName");
const productBrand = document.getElementById("productBrand");
const productRating = document.getElementById("productRating");
const productPrice = document.getElementById("productPrice");
const productListPrice = document.getElementById("productListPrice");
const productDealMeta = document.getElementById("productDealMeta");
const productSegment = document.getElementById("productSegment");
const productStockMeta = document.getElementById("productStockMeta");
const productKeywordLine = document.getElementById("productKeywordLine");
const productDescription = document.getElementById("productDescription");
const productSpecs = document.getElementById("productSpecs");
const addToCartBtn = document.getElementById("addToCartBtn");
const wishlistBtn = document.getElementById("wishlistBtn");
const cartCount = document.getElementById("cartCount");
const crumbName = document.getElementById("crumbName");
const brandStoreLink = document.getElementById("brandStoreLink");
const buyBoxPrice = document.getElementById("buyBoxPrice");
const buyBoxMrp = document.getElementById("buyBoxMrp");
const buyBoxSavings = document.getElementById("buyBoxSavings");
const deliveryText = document.getElementById("deliveryText");
const availabilityText = document.getElementById("availabilityText");
const qtySelect = document.getElementById("qtySelect");
const backInStockPanel = document.getElementById("backInStockPanel");
const backInStockForm = document.getElementById("backInStockForm");
const backInStockEmailInput = document.getElementById("backInStockEmailInput");
const backInStockNameInput = document.getElementById("backInStockNameInput");
const backInStockQtyInput = document.getElementById("backInStockQtyInput");
const backInStockSubmitBtn = document.getElementById("backInStockSubmitBtn");
const backInStockMessage = document.getElementById("backInStockMessage");
const relatedBlock = document.getElementById("relatedBlock");
const relatedGrid = document.getElementById("relatedGrid");
const offersBlock = document.getElementById("offersBlock");
const offersGrid = document.getElementById("offersGrid");
const servicesBlock = document.getElementById("servicesBlock");
const serviceDeliveryText = document.getElementById("serviceDeliveryText");
const serviceReturnText = document.getElementById("serviceReturnText");
const serviceWarrantyText = document.getElementById("serviceWarrantyText");
const serviceSellerText = document.getElementById("serviceSellerText");
const reviewsBlock = document.getElementById("reviewsBlock");
const reviewHeadline = document.getElementById("reviewHeadline");
const reviewBars = document.getElementById("reviewBars");
const qaBlock = document.getElementById("qaBlock");
const qaList = document.getElementById("qaList");
const detailInfoTable = document.getElementById("detailInfoTable");
const infoSku = document.getElementById("infoSku");
const infoBrand = document.getElementById("infoBrand");
const infoCategory = document.getElementById("infoCategory");
const infoSegment = document.getElementById("infoSegment");
const infoPrice = document.getElementById("infoPrice");
const infoListPrice = document.getElementById("infoListPrice");
const infoStock = document.getElementById("infoStock");
const infoStatus = document.getElementById("infoStatus");
const infoFulfillment = document.getElementById("infoFulfillment");
const infoMoq = document.getElementById("infoMoq");
const infoFeatured = document.getElementById("infoFeatured");
const infoKeywords = document.getElementById("infoKeywords");
const infoRating = document.getElementById("infoRating");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
let zoomSourceImage = "";
let zoomBound = false;
let zoomPaneScale = 220;
let currentMediaItems = [];
let currentMediaIndex = 0;
let pinchScale = 1;
let pinchStartDistance = 0;
let pinchStartScale = 1;
let fsMediaFilter = "images";
let fsZoomScale = 1;
let failedMediaIndexes = new Set();
let currentProductRecord = null;
let apiCatalogProducts = [];
let catalogProductsFetchPromise = null;
const FALLBACK_IMAGE_URL = "./product-placeholder.svg";
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderOffers(price, listPrice, category) {
  if (!offersBlock || !offersGrid) {
    return;
  }
  const savings = Math.max(0, Number(listPrice) - Number(price));
  const offers = [
    {
      title: "Bank Offer",
      text: savings > 0
        ? `Extra 5% cashback with partner cards on orders above ${money(Math.max(1999, price))}.`
        : "Flat 5% cashback with selected credit cards."
    },
    {
      title: "No Cost EMI",
      text: `EMI starts from ${money(Math.max(299, Math.round(price / 24)))} per month.`
    },
    {
      title: "Exchange Offer",
      text: `Exchange your old ${category} and get up to ${money(Math.round(price * 0.18))} off.`
    },
    {
      title: "Partner Offer",
      text: "GST invoice available and business purchase support."
    }
  ];
  offersGrid.innerHTML = offers.map((item) => `
    <article class="offer-item">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
  offersBlock.hidden = false;
}

function renderServices(product, isInStock) {
  if (!servicesBlock || !serviceDeliveryText || !serviceReturnText || !serviceWarrantyText || !serviceSellerText) {
    return;
  }
  const categoryFamily = getProductCategoryFamily(product);
  serviceDeliveryText.textContent = isInStock
    ? "FREE delivery by tomorrow in select cities."
    : "Delivery date will be shown after stock update.";
  serviceReturnText.textContent = "7-day replacement, no-questions-asked for defective items.";
  serviceWarrantyText.textContent = categoryFamily === "laptop" || categoryFamily === "computer"
    ? "1 Year manufacturer warranty + service center support."
    : "6 Months to 1 Year standard brand warranty.";
  serviceSellerText.textContent = `${product.brand} Authorized Seller | GST invoice available.`;
  servicesBlock.hidden = false;
}

function renderReviewSummary(product) {
  if (!reviewsBlock || !reviewHeadline || !reviewBars) {
    return;
  }
  const rating = Math.max(0, Math.min(5, Number(product.rating || 0)));
  const totalReviews = Math.max(8, Math.round(42 + (rating * 37)));
  reviewHeadline.innerHTML = `${rating.toFixed(1)} &#9733; from ${totalReviews.toLocaleString("en-IN")} ratings`;

  const base = Math.max(20, Math.round((rating / 5) * 100));
  const distribution = [
    { stars: "5 star", value: Math.min(92, base + 20) },
    { stars: "4 star", value: Math.min(80, Math.max(5, base - 5)) },
    { stars: "3 star", value: Math.min(60, Math.max(4, base - 25)) },
    { stars: "2 star", value: Math.min(35, Math.max(3, base - 45)) },
    { stars: "1 star", value: Math.min(22, Math.max(2, base - 60)) }
  ];
  reviewBars.innerHTML = distribution.map((item) => `
    <div class="review-bar">
      <span>${item.stars}</span>
      <div class="review-track"><div class="review-fill" style="width:${item.value}%"></div></div>
      <span>${item.value}%</span>
    </div>
  `).join("");
  reviewsBlock.hidden = false;
}

function renderQa(product) {
  if (!qaBlock || !qaList) {
    return;
  }
  const qa = [
    {
      q: "Does this product include GST invoice?",
      a: "Yes, GST invoice is available for all eligible orders."
    },
    {
      q: "Is this suitable for office and home use?",
      a: `Yes, ${product.name} is suitable for both regular office and home usage.`
    },
    {
      q: "What is the return policy?",
      a: "Replacement is available within 7 days if the item is damaged or not working."
    }
  ];
  qaList.innerHTML = qa.map((item) => `
    <article class="qa-item">
      <h3>Q: ${escapeHtml(item.q)}</h3>
      <p>A: ${escapeHtml(item.a)}</p>
    </article>
  `).join("");
  qaBlock.hidden = false;
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

function saveRecentlyViewed(productId) {
  const key = String(productId).trim();
  if (!key) {
    return;
  }
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const ids = Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
    const next = [key, ...ids.filter((item) => item !== key)].slice(0, 12);
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    return;
  }
}

function readAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function loadBackInStockRequestsLocal() {
  try {
    const raw = localStorage.getItem(BACK_IN_STOCK_REQUESTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveBackInStockRequestsLocal(list) {
  try {
    localStorage.setItem(BACK_IN_STOCK_REQUESTS_STORAGE_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  } catch (error) {
    return;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim().toLowerCase());
}

function setBackInStockMessage(text, isError = false) {
  if (!backInStockMessage) {
    return;
  }
  backInStockMessage.textContent = String(text || "");
  backInStockMessage.classList.toggle("error", Boolean(isError));
}

function cacheBackInStockRequestOffline(product, payload, source = "product-page-offline") {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) {
    return;
  }
  const list = loadBackInStockRequestsLocal();
  const duplicate = list.find((item) => {
    return String(item.productId || "") === String(product.id || "")
      && String(item.email || "").trim().toLowerCase() === email
      && String(item.status || "open") === "open";
  });
  if (duplicate) {
    duplicate.quantityDesired = Math.max(Number(duplicate.quantityDesired || 1), Number(payload.quantityDesired || 1));
    duplicate.name = duplicate.name || String(payload.name || "").trim();
    duplicate.updatedAt = new Date().toISOString();
    saveBackInStockRequestsLocal(list);
    return;
  }

  list.push({
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId: String(product.id || ""),
    email,
    name: String(payload.name || "").trim(),
    quantityDesired: Math.max(1, Number(payload.quantityDesired || 1)),
    status: "open",
    source,
    offline: true,
    product: {
      id: String(product.id || ""),
      name: String(product.name || "Unknown Product"),
      brand: String(product.brand || "Generic"),
      sku: String(product.sku || ""),
      stock: Number(product.stock || 0)
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notifiedAt: null
  });
  saveBackInStockRequestsLocal(list);
}

function setBackInStockPanelState(product, isInStock) {
  if (!backInStockPanel) {
    return;
  }

  if (isInStock) {
    backInStockPanel.hidden = true;
    setBackInStockMessage("");
    return;
  }

  const auth = readAuthSession();
  if (backInStockEmailInput && !String(backInStockEmailInput.value || "").trim()) {
    backInStockEmailInput.value = String((auth && auth.user && auth.user.email) || "").trim();
  }
  if (backInStockNameInput && !String(backInStockNameInput.value || "").trim()) {
    backInStockNameInput.value = String((auth && auth.user && auth.user.name) || "").trim();
  }
  if (backInStockQtyInput) {
    backInStockQtyInput.value = String(Math.max(1, Number(backInStockQtyInput.value || 1)));
  }
  backInStockPanel.hidden = false;
}

async function submitBackInStockRequest(product) {
  if (!product || !product.id) {
    setBackInStockMessage("Product not found for request.", true);
    return;
  }
  const email = String(backInStockEmailInput ? backInStockEmailInput.value : "").trim().toLowerCase();
  const name = String(backInStockNameInput ? backInStockNameInput.value : "").trim();
  const quantityDesired = Math.max(1, Math.min(999, Math.floor(Number(backInStockQtyInput ? backInStockQtyInput.value : 1) || 1)));
  if (!isValidEmail(email)) {
    setBackInStockMessage("Please enter a valid email address.", true);
    return;
  }

  const payload = {
    email,
    name,
    quantityDesired,
    source: "product-page"
  };

  if (backInStockSubmitBtn) {
    backInStockSubmitBtn.disabled = true;
  }
  setBackInStockMessage("Saving your request...");

  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(String(product.id))}/back-in-stock-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save request.");
    }
    cacheBackInStockRequestOffline(product, payload, "product-page");
    setBackInStockMessage(String(data.message || "Request saved. We will notify you."));
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    const isOffline = /failed to fetch|network|backend|unable to connect/i.test(message.toLowerCase());
    if (isOffline) {
      cacheBackInStockRequestOffline(product, payload, "product-page-offline");
      setBackInStockMessage("Backend offline. Request saved locally; admin can sync and notify later.");
      return;
    }
    setBackInStockMessage(message || "Unable to save request.", true);
  } finally {
    if (backInStockSubmitBtn) {
      backInStockSubmitBtn.disabled = false;
    }
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
    image: product.image || existing.image || FALLBACK_IMAGE_URL,
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
      image: product.image || existing.image || FALLBACK_IMAGE_URL,
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

function syncWishlistButton(productId) {
  if (!wishlistBtn) {
    return;
  }
  const active = isWishlisted(productId);
  wishlistBtn.classList.toggle("active", active);
  wishlistBtn.textContent = active ? "Wishlisted" : "Save to Wishlist";
  wishlistBtn.setAttribute("data-id", String(productId || ""));
}

function addProductToCart(productId, quantity = 1) {
  const cartMap = loadCartMap();
  const key = String(productId);
  cartMap[key] = (Number(cartMap[key]) || 0) + Number(quantity || 1);
  saveCartMap(cartMap);
  syncCartCount();
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
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
  if (raw.startsWith("data:image/") || raw.startsWith("data:video/")) {
    return raw;
  }
  if (raw.startsWith("blob:")) {
    return raw;
  }

  // Keep site-root relative URLs as-is and let browser resolve against current origin.
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
    // Filename-only media without configured base should remain relative.
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

function inferMediaType(src) {
  const value = String(src || "").trim().toLowerCase();
  if (!value) {
    return "";
  }
  if (value.startsWith("data:image/")) {
    return "image";
  }
  if (value.startsWith("data:video/")) {
    return "video";
  }
  if (/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(?:[?#]|$)/i.test(value)) {
    return "video";
  }
  return "image";
}

function parseMediaEntries(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        const raw = String(item || "").trim();
        if (!raw) {
          return [];
        }
        if (raw.startsWith("data:image/") || raw.startsWith("data:video/")) {
          return [raw];
        }
        return raw.split(/[;|]/);
      })
      .map((item) => item.trim())
      .filter(Boolean);
  }
  const raw = String(value || "").trim();
  if (!raw) {
    return [];
  }
  if (raw.startsWith("data:image/") || raw.startsWith("data:video/")) {
    return [raw];
  }
  return raw.split(/[;|]/).map((item) => item.trim()).filter(Boolean);
}

function asCleanText(value, fallback = "") {
  const cleaned = String(value == null ? "" : value).trim();
  return cleaned || fallback;
}

function parseKeywordList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => asCleanText(item)).filter(Boolean);
  }
  return asCleanText(value)
    .split(/[;,|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatCategoryLabel(value) {
  return asCleanText(value, "Accessory")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildProductCategorySignal(product) {
  const parts = [];
  const append = (value) => {
    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }
    const text = String(value || "").trim().toLowerCase();
    if (text) {
      parts.push(text);
    }
  };
  append(product?.category);
  append(product?.collections);
  append(product?.keywords);
  append(product?.name);
  append(product?.brand);
  return parts.join(" ").replace(/[^a-z0-9]+/g, " ");
}

function getProductCategoryFamily(product) {
  const fallbackCategory = asCleanText(product?.category, "accessory").toLowerCase();
  const signal = buildProductCategorySignal(product);

  if (/(printer|plotter|scanner|ink|toner|cartridge|label printer|all printer)/.test(signal)) {
    return "printer";
  }
  if (/(headphone|headset|earbud|earphone|speaker|soundbar|microphone|audio|home theater)/.test(signal)) {
    return "audio";
  }
  if (/(battery|keyboard|adapter|charger|cable|case|cover|power bank|mouse|pendrive|ssd enclosure|cooler|fan|dock|hub|bag|accessory)/.test(signal)) {
    return "accessory";
  }
  if (/(desktop|workstation|cabinet|all in one|aio|monitor|computer|gaming pc|office tower|assembled pc|mini pc)/.test(signal)) {
    return "computer";
  }
  if (/(mobile|smartphone|phone|tablet|wearable|smartwatch|watch)/.test(signal)) {
    return "mobile";
  }
  if (/(laptop|notebook|macbook|chromebook)/.test(signal)) {
    return "laptop";
  }

  if (["laptop", "mobile", "audio", "accessory", "computer", "printer"].includes(fallbackCategory)) {
    return fallbackCategory;
  }
  return fallbackCategory || "accessory";
}

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("id") || "").trim();
}

function getLocalProductById(productId) {
  if (!productId) {
    return null;
  }
  const catalogProduct = loadCatalogMap()[productId];
  const staticProduct = allProducts.find((product) => String(product.id) === productId);
  const mappedCatalog = catalogProduct ? mapApiProduct(catalogProduct) : null;
  const mappedStatic = staticProduct ? mapApiProduct(staticProduct) : null;
  return mergeProductSources(mappedCatalog, mappedStatic);
}

function mapApiProduct(product) {
  const id = asCleanText(product.id);
  const name = asCleanText(product.name, id ? `Product #${id}` : "Unknown Product");
  const brand = asCleanText(product.brand, "Generic");
  const category = asCleanText(product.category, "accessory").toLowerCase();
  const segment = asCleanText(product.segment, "b2c").toLowerCase();
  return {
    id,
    name,
    brand,
    segment,
    category,
    price: Number(product.price || 0),
    listPrice: Number(product.listPrice || product.price || 0),
    rating: Number(product.rating || 0),
    image: normalizeImageUrl(product.image || ""),
    images: parseMediaEntries(product.images),
    videos: parseMediaEntries(product.videos),
    media: parseMediaEntries(product.media),
    moq: Number(product.moq || 0),
    stock: Number(product.stock || 0),
    description: asCleanText(product.description || ""),
    keywords: parseKeywordList(product.keywords),
    sku: asCleanText(product.sku || ""),
    status: asCleanText(product.status || "active", "active").toLowerCase(),
    fulfillment: asCleanText(product.fulfillment || "fbm", "fbm").toLowerCase(),
    featured: Boolean(product.featured)
  };
}

function mergeProductListsById(...lists) {
  const merged = new Map();
  lists.flat().forEach((item) => {
    if (!item || !item.id) {
      return;
    }
    const normalized = mapApiProduct(item);
    const key = String(normalized.id);
    const existing = merged.get(key);
    merged.set(key, existing ? mergeProductSources(normalized, existing) : normalized);
  });
  return Array.from(merged.values());
}

async function fetchProductFromApi(productId) {
  if (!productId) {
    return null;
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`);
  } catch (error) {
    return null;
  }
  if (!response.ok) {
    return null;
  }
  const data = await response.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return null;
  }
  return mapApiProduct(data);
}

async function fetchCatalogProductsFromApi() {
  if (apiCatalogProducts.length) {
    return apiCatalogProducts;
  }
  if (catalogProductsFetchPromise) {
    return catalogProductsFetchPromise;
  }

  catalogProductsFetchPromise = (async () => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/products?status=active`);
    } catch (error) {
      return apiCatalogProducts;
    }
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || !Array.isArray(data.products)) {
      return apiCatalogProducts;
    }
    apiCatalogProducts = data.products
      .map(mapApiProduct)
      .filter((item) => item && item.id);
    cacheCatalogProducts(apiCatalogProducts);
    return apiCatalogProducts;
  })();

  try {
    return await catalogProductsFetchPromise;
  } finally {
    catalogProductsFetchPromise = null;
  }
}

function extractRawMedia(product) {
  const list = [
    ...parseMediaEntries(product && product.media),
    ...parseMediaEntries(product && product.images),
    ...parseMediaEntries(product && product.videos),
    ...parseMediaEntries(product && product.image)
  ]
    .map((item) => normalizeImageUrl(item))
    .filter(Boolean);
  return [...new Set(list)];
}

function mergeProductSources(primary, secondary) {
  if (!primary && !secondary) {
    return null;
  }
  const a = primary || {};
  const b = secondary || {};
  const pickNumber = (first, second, fallback = 0) => {
    const one = Number(first);
    if (Number.isFinite(one)) {
      return one;
    }
    const two = Number(second);
    if (Number.isFinite(two)) {
      return two;
    }
    return fallback;
  };
  const mediaA = extractRawMedia(a);
  const mediaB = extractRawMedia(b);
  const mergedMedia = mediaA.length ? mediaA : mediaB;
  const imageA = normalizeImageUrl(a.image || "");
  const imageB = normalizeImageUrl(b.image || "");
  const mergedImage = imageA || imageB || "";

  return {
    id: asCleanText(a.id || b.id),
    name: asCleanText(a.name || b.name, "Unknown Product"),
    brand: asCleanText(a.brand || b.brand, "Generic"),
    segment: asCleanText(a.segment || b.segment, "b2c").toLowerCase(),
    category: asCleanText(a.category || b.category, "accessory").toLowerCase(),
    price: pickNumber(a.price, b.price, 0),
    listPrice: pickNumber(a.listPrice, b.listPrice, pickNumber(a.price, b.price, 0)),
    rating: pickNumber(a.rating, b.rating, 0),
    image: mergedImage,
    images: mergedMedia.filter((item) => inferMediaType(item) === "image"),
    videos: mergedMedia.filter((item) => inferMediaType(item) === "video"),
    media: mergedMedia,
    moq: pickNumber(a.moq, b.moq, 0),
    stock: pickNumber(a.stock, b.stock, 0),
    description: asCleanText(a.description || b.description || ""),
    keywords: Array.isArray(a.keywords) && a.keywords.length ? a.keywords : (Array.isArray(b.keywords) ? b.keywords : []),
    sku: asCleanText(a.sku || b.sku || ""),
    status: asCleanText(a.status || b.status || "active", "active").toLowerCase(),
    fulfillment: asCleanText(a.fulfillment || b.fulfillment || "fbm", "fbm").toLowerCase(),
    featured: Boolean((a.featured ?? b.featured) || false)
  };
}

function buildProductMedia(product) {
  const flattened = [
    ...parseMediaEntries(product.media),
    ...parseMediaEntries(product.images),
    ...parseMediaEntries(product.videos),
    ...parseMediaEntries(product.image || "")
  ];

  const merged = flattened
    .map((item) => normalizeImageUrl(item))
    .filter(Boolean);
  const unique = [...new Set(merged)];
  return unique.length ? unique : [FALLBACK_IMAGE_URL];
}

function findMediaIndexBySource(src, indexHint = null) {
  if (Number.isInteger(indexHint) && indexHint >= 0 && indexHint < currentMediaItems.length) {
    return indexHint;
  }
  const normalized = normalizeImageUrl(src);
  return Math.max(0, currentMediaItems.findIndex((item) => normalizeImageUrl(item) === normalized));
}

function nextRenderableMediaIndex(fromIndex) {
  if (!currentMediaItems.length) {
    return -1;
  }
  for (let offset = 1; offset <= currentMediaItems.length; offset += 1) {
    const idx = (fromIndex + offset) % currentMediaItems.length;
    if (!failedMediaIndexes.has(idx)) {
      return idx;
    }
  }
  return -1;
}

function setMainMedia(src, indexHint = null) {
  const mediaUrl = normalizeImageUrl(src);
  if (!mediaUrl) {
    return;
  }
  const mediaIndex = findMediaIndexBySource(src, indexHint);
  currentMediaIndex = mediaIndex;
  if (inferMediaType(mediaUrl) === "video") {
    productImage.hidden = true;
    productVideo.hidden = false;
    productVideo.onerror = () => {
      failedMediaIndexes.add(mediaIndex);
      productVideo.hidden = true;
      productVideo.removeAttribute("src");
      const nextIndex = nextRenderableMediaIndex(mediaIndex);
      if (nextIndex >= 0) {
        setMainMedia(currentMediaItems[nextIndex], nextIndex);
        return;
      }
      productImage.hidden = false;
      productImage.src = FALLBACK_IMAGE_URL;
      setZoomSource(FALLBACK_IMAGE_URL);
    };
    productVideo.src = mediaUrl;
    productVideo.muted = true;
    productVideo.preload = "metadata";
    productVideo.onloadeddata = () => {
      productVideo.play().catch(() => {});
    };
    setZoomSource("");
    hideZoomPane();
    return;
  }
  productVideo.hidden = true;
  productVideo.removeAttribute("src");
  productImage.hidden = false;
  productImage.onerror = () => {
    failedMediaIndexes.add(mediaIndex);
    const nextIndex = nextRenderableMediaIndex(mediaIndex);
    if (nextIndex >= 0) {
      setMainMedia(currentMediaItems[nextIndex], nextIndex);
      return;
    }
    productImage.src = FALLBACK_IMAGE_URL;
    setZoomSource(FALLBACK_IMAGE_URL);
  };
  productImage.src = mediaUrl;
  setZoomSource(mediaUrl);
}

function renderMediaThumbs(mediaItems) {
  if (!mediaThumbRail) {
    return;
  }
  mediaThumbRail.innerHTML = mediaItems.map((item, index) => {
    const type = inferMediaType(item);
    const preview = type === "video"
      ? `<video src="${item}" muted playsinline preload="metadata"></video>`
      : `<img class="thumb-media" src="${item}" alt="Media ${index + 1}" loading="lazy" />`;
    return `<button type="button" class="thumb${index === 0 ? " active" : ""}" data-media-index="${index}" aria-label="Media ${index + 1}">${preview}</button>`;
  }).join("");

  const buttons = Array.from(mediaThumbRail.querySelectorAll("button.thumb"));
  const thumbImages = Array.from(mediaThumbRail.querySelectorAll("img.thumb-media"));
  thumbImages.forEach((img) => {
    img.addEventListener("error", () => {
      if (img.src !== FALLBACK_IMAGE_URL) {
        img.src = FALLBACK_IMAGE_URL;
      } else {
        const hasAnotherFallback = thumbImages.some((other) => other !== img && other.src === FALLBACK_IMAGE_URL && other.closest("button.thumb")?.style.display !== "none");
        if (hasAnotherFallback) {
          const btn = img.closest("button.thumb");
          if (btn) {
            btn.style.display = "none";
          }
          return;
        }
        const btn = img.closest("button.thumb");
        if (btn) {
          btn.style.display = "none";
        }
      }
    });
  });
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.getAttribute("data-media-index") || 0);
      buttons.forEach((node) => node.classList.remove("active"));
      button.classList.add("active");
      currentMediaIndex = idx;
      setMainMedia(mediaItems[idx] || mediaItems[0], idx);
    });
  });
}

function hideZoomPane() {
  if (!imageZoomPane) {
    return;
  }
  imageZoomPane.classList.remove("show");
}

function setZoomSource(src) {
  if (!imageZoomPane) {
    return;
  }
  const normalized = normalizeImageUrl(src);
  zoomSourceImage = normalized;
  imageZoomPane.style.backgroundImage = normalized ? `url("${normalized}")` : "";
}

function updateZoomPanePosition(event) {
  if (!imageZoomPane || !productImage || productImage.hidden || !zoomSourceImage) {
    return;
  }
  const bounds = productImage.getBoundingClientRect();
  if (!bounds.width || !bounds.height) {
    return;
  }
  const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
  const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
  imageZoomPane.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
  imageZoomPane.classList.add("show");
}

function bindZoomEvents() {
  if (zoomBound || !productImage) {
    return;
  }
  zoomBound = true;
  productImage.addEventListener("mousemove", updateZoomPanePosition);
  productImage.addEventListener("mouseenter", updateZoomPanePosition);
  productImage.addEventListener("mouseleave", hideZoomPane);
  productImage.addEventListener("wheel", (event) => {
    if (window.matchMedia("(max-width: 1180px)").matches) {
      return;
    }
    event.preventDefault();
    const delta = event.deltaY > 0 ? -20 : 20;
    zoomPaneScale = Math.max(140, Math.min(420, zoomPaneScale + delta));
    if (imageZoomPane) {
      imageZoomPane.style.backgroundSize = `${zoomPaneScale}%`;
    }
    updateZoomPanePosition(event);
  }, { passive: false });

  productImage.addEventListener("touchstart", (event) => {
    if (event.touches.length === 2) {
      pinchStartDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      pinchStartScale = pinchScale;
    }
  }, { passive: true });
  productImage.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 2) {
      return;
    }
    event.preventDefault();
    const distance = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY
    );
    if (!pinchStartDistance) {
      pinchStartDistance = distance;
      pinchStartScale = pinchScale;
      return;
    }
    pinchScale = Math.max(1, Math.min(4, pinchStartScale * (distance / pinchStartDistance)));
    productImage.style.transform = `scale(${pinchScale})`;
  }, { passive: false });
  productImage.addEventListener("touchend", () => {
    if (pinchScale < 1.01) {
      pinchScale = 1;
      productImage.style.transform = "scale(1)";
    }
    pinchStartDistance = 0;
  }, { passive: true });

  window.addEventListener("scroll", hideZoomPane, { passive: true });
  window.addEventListener("resize", hideZoomPane, { passive: true });
}

function renderFullscreenThumbs() {
  if (!fullscreenThumbs) {
    return;
  }
  const filtered = currentMediaItems
    .map((item, index) => ({ item, index, type: inferMediaType(item) }))
    .filter((entry) => fsMediaFilter === "videos" ? entry.type === "video" : entry.type === "image");
  const fallback = filtered.length ? filtered : currentMediaItems.map((item, index) => ({ item, index, type: inferMediaType(item) }));

  fullscreenThumbs.innerHTML = fallback.map((entry) => {
    const { item, index, type } = entry;
    const preview = type === "video"
      ? `<video src="${item}" muted playsinline preload="metadata"></video>`
      : `<img class="fullscreen-thumb-media" src="${item}" alt="Fullscreen media ${index + 1}" loading="lazy" />`;
    return `<button type="button" class="fullscreen-thumb${index === currentMediaIndex ? " active" : ""}" data-fs-index="${index}">${preview}</button>`;
  }).join("");

  Array.from(fullscreenThumbs.querySelectorAll("img.fullscreen-thumb-media")).forEach((img) => {
    img.addEventListener("error", () => {
      if (img.src !== FALLBACK_IMAGE_URL) {
        img.src = FALLBACK_IMAGE_URL;
      } else {
        const siblings = Array.from(fullscreenThumbs.querySelectorAll("img.fullscreen-thumb-media"));
        const hasAnotherFallback = siblings.some((other) => other !== img && other.src === FALLBACK_IMAGE_URL && other.closest("button.fullscreen-thumb")?.style.display !== "none");
        if (hasAnotherFallback) {
          const btn = img.closest("button.fullscreen-thumb");
          if (btn) {
            btn.style.display = "none";
          }
          return;
        }
        const btn = img.closest("button.fullscreen-thumb");
        if (btn) {
          btn.style.display = "none";
        }
      }
    });
  });

  Array.from(fullscreenThumbs.querySelectorAll("button.fullscreen-thumb")).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-fs-index") || 0);
      showFullscreenMedia(index);
    });
  });

  const activeThumb = fullscreenThumbs.querySelector("button.fullscreen-thumb.active");
  if (activeThumb) {
    activeThumb.scrollIntoView({ block: "nearest" });
  }
  updateThumbNavButtons();
}

function scrollFullscreenThumbs(direction) {
  if (!fullscreenThumbs) {
    return;
  }
  const delta = direction === "up"
    ? -Math.max(100, Math.floor(fullscreenThumbs.clientHeight * 0.55))
    : Math.max(100, Math.floor(fullscreenThumbs.clientHeight * 0.55));
  fullscreenThumbs.scrollBy({ top: delta, behavior: "smooth" });
  window.setTimeout(updateThumbNavButtons, 160);
}

function updateThumbNavButtons() {
  if (!fullscreenThumbs) {
    return;
  }
  const maxScroll = Math.max(0, fullscreenThumbs.scrollHeight - fullscreenThumbs.clientHeight);
  const top = Math.max(0, Math.floor(fullscreenThumbs.scrollTop));
  if (fsThumbUpBtn) {
    fsThumbUpBtn.disabled = top <= 0;
  }
  if (fsThumbDownBtn) {
    fsThumbDownBtn.disabled = top >= maxScroll - 1;
  }
}

function updateFullscreenTabState() {
  if (fsTabImages) {
    fsTabImages.classList.toggle("active", fsMediaFilter === "images");
  }
  if (fsTabVideos) {
    fsTabVideos.classList.toggle("active", fsMediaFilter === "videos");
  }
}

function applyFullscreenZoom() {
  const scale = Math.max(1, Math.min(4, fsZoomScale));
  fsZoomScale = scale;
  if (!fullscreenImage.hidden) {
    fullscreenImage.style.transform = `scale(${scale})`;
  }
  if (!fullscreenVideo.hidden) {
    fullscreenVideo.style.transform = `scale(${scale})`;
  }
  if (fsZoomOutBtn) {
    fsZoomOutBtn.disabled = scale <= 1.001;
  }
}

function showFullscreenMedia(index) {
  if (!currentMediaItems.length) {
    return;
  }
  currentMediaIndex = Math.max(0, Math.min(currentMediaItems.length - 1, index));
  const mediaUrl = normalizeImageUrl(currentMediaItems[currentMediaIndex]);
  if (inferMediaType(mediaUrl) === "video") {
    fullscreenImage.hidden = true;
    fullscreenVideo.hidden = false;
    fullscreenVideo.src = mediaUrl;
    fullscreenVideo.muted = true;
    fullscreenVideo.preload = "metadata";
    fullscreenVideo.style.width = "auto";
    fullscreenVideo.style.height = "auto";
    fullscreenVideo.style.maxWidth = "100%";
    fullscreenVideo.style.maxHeight = "100%";
    fullscreenVideo.style.objectFit = "contain";
    fullscreenVideo.onloadeddata = () => {
      fullscreenVideo.play().catch(() => {});
    };
    fullscreenVideo.onerror = () => {
      const firstImage = currentMediaItems.findIndex((item) => inferMediaType(item) === "image");
      if (firstImage >= 0) {
        fsMediaFilter = "images";
        updateFullscreenTabState();
        showFullscreenMedia(firstImage);
      } else {
        fullscreenVideo.hidden = true;
        fullscreenVideo.removeAttribute("src");
        fullscreenImage.hidden = false;
        fullscreenImage.src = FALLBACK_IMAGE_URL;
      }
    };
    fsZoomScale = 1;
    if (fsZoomInBtn) {
      fsZoomInBtn.disabled = true;
    }
  } else {
    fullscreenVideo.hidden = true;
    fullscreenVideo.removeAttribute("src");
    fullscreenImage.hidden = false;
    fullscreenImage.src = mediaUrl;
    fullscreenImage.style.width = "auto";
    fullscreenImage.style.height = "auto";
    fullscreenImage.style.maxWidth = "100%";
    fullscreenImage.style.maxHeight = "100%";
    fullscreenImage.style.objectFit = "contain";
    if (fsZoomInBtn) {
      fsZoomInBtn.disabled = false;
    }
    fullscreenImage.onerror = () => {
      fullscreenImage.src = FALLBACK_IMAGE_URL;
    };
  }
  applyFullscreenZoom();
  renderFullscreenThumbs();
}

function openFullscreenViewer(startIndex = 0) {
  if (!fullscreenViewer || !currentMediaItems.length) {
    return;
  }
  pinchScale = 1;
  if (productImage) {
    productImage.style.transform = "scale(1)";
  }
  fullscreenViewer.hidden = false;
  document.body.style.overflow = "hidden";
  if (fullscreenTitle) {
    fullscreenTitle.textContent = productName ? String(productName.textContent || "").trim() : "";
  }
  const startType = inferMediaType(currentMediaItems[Math.max(0, Math.min(currentMediaItems.length - 1, startIndex))] || "");
  fsMediaFilter = startType === "video" ? "videos" : "images";
  updateFullscreenTabState();
  fsZoomScale = 1;
  showFullscreenMedia(startIndex);
}

function closeFullscreenViewer() {
  if (!fullscreenViewer) {
    return;
  }
  fullscreenViewer.hidden = true;
  fullscreenVideo.pause();
  fullscreenVideo.removeAttribute("src");
  fsZoomScale = 1;
  if (fullscreenImage) {
    fullscreenImage.style.transform = "scale(1)";
  }
  if (fullscreenVideo) {
    fullscreenVideo.style.transform = "scale(1)";
  }
  document.body.style.overflow = "";
}

function renderRelatedProducts(items) {
  if (!relatedBlock || !relatedGrid) {
    return;
  }
  if (!Array.isArray(items) || !items.length) {
    relatedGrid.innerHTML = "";
    relatedBlock.hidden = true;
    return;
  }
  relatedGrid.innerHTML = items.map((item) => `
    <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="related-item">
      <img src="${normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL}" alt="${item.name}" loading="lazy" />
      <p>${item.name}</p>
    </a>
  `).join("");
  relatedBlock.hidden = false;
}

function buildRelatedProducts(product, candidates) {
  const selectedFamily = getProductCategoryFamily(product);
  const selectedPrice = Number(product.price || 0);
  return mergeProductListsById(candidates)
    .filter((item) => item.id !== product.id && String(item.status || "active").toLowerCase() === "active")
    .map((item) => {
      let score = Number(item.rating || 0);
      if (item.brand === product.brand) {
        score += 8;
      }
      if (getProductCategoryFamily(item) === selectedFamily) {
        score += 6;
      }
      if (item.segment === product.segment) {
        score += 2;
      }
      if (item.featured) {
        score += 1.5;
      }
      if (Number(item.stock || 0) > 0) {
        score += 1;
      }
      if (selectedPrice > 0) {
        const priceDeltaRatio = Math.abs(Number(item.price || 0) - selectedPrice) / selectedPrice;
        score += Math.max(0, 2 - priceDeltaRatio);
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || Number(a.item.price || 0) - Number(b.item.price || 0))
    .map((entry) => entry.item)
    .slice(0, 4);
}

async function hydrateRelatedProducts(product) {
  const localCandidates = mergeProductListsById(Object.values(loadCatalogMap()), allProducts);
  renderRelatedProducts(buildRelatedProducts(product, localCandidates));

  const remoteCandidates = await fetchCatalogProductsFromApi();
  if (!remoteCandidates.length) {
    return;
  }
  renderRelatedProducts(buildRelatedProducts(product, mergeProductListsById(remoteCandidates, localCandidates)));
}

function renderProduct(product) {
  currentProductRecord = product;
  cacheCatalogProduct(product);
  saveRecentlyViewed(product.id);
  const mediaItems = buildProductMedia(product);
  failedMediaIndexes = new Set();
  currentMediaItems = mediaItems.slice();
  currentMediaIndex = 0;
  zoomPaneScale = 220;
  if (imageZoomPane) {
    imageZoomPane.style.backgroundSize = `${zoomPaneScale}%`;
  }
  renderMediaThumbs(mediaItems);
  setMainMedia(mediaItems[0], 0);
  productImage.alt = product.name;
  productName.textContent = product.name;
  productBrand.textContent = `Brand: ${product.brand}`;
  brandStoreLink.textContent = `${product.brand}`;
  productRating.innerHTML = `${product.rating} &#9733;`;
  const price = Number(product.price || 0);
  const listPrice = Number(product.listPrice || product.price || 0);
  const discountPercent = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const hasStockValue = Number.isFinite(Number(product.stock));
  const stockCount = hasStockValue ? Number(product.stock) : null;
  const isInStock = stockCount == null || stockCount > 0;
  productPrice.textContent = money(price);
  buyBoxPrice.textContent = money(price);
  productListPrice.textContent = listPrice > price ? `M.R.P.: ${money(listPrice)}` : "";
  productDealMeta.textContent = discountPercent > 0 ? `You save ${money(listPrice - price)} (${discountPercent}% off)` : "Everyday low price";
  buyBoxMrp.textContent = listPrice > price ? `M.R.P.: ${money(listPrice)}` : "";
  buyBoxSavings.textContent = discountPercent > 0 ? `Save ${money(listPrice - price)} (${discountPercent}% off)` : "";
  productSegment.textContent = product.segment;
  const fallbackDescription = `Explore ${product.name} for ${product.category} needs with trusted performance and reliable support.`;
  const descriptionRaw = String(product.description || "").trim();
  if (!descriptionRaw) {
    productDescription.textContent = fallbackDescription;
  } else if (/<[a-z][\s\S]*>/i.test(descriptionRaw) || /&[a-z]+;/i.test(descriptionRaw)) {
    const sanitized = descriptionRaw
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
    productDescription.innerHTML = sanitized;
  } else {
    productDescription.textContent = descriptionRaw;
  }
  productStockMeta.textContent = `Stock: ${stockCount == null ? "Available" : stockCount} | Status: ${String(product.status || "active").toUpperCase()} | Fulfillment: ${String(product.fulfillment || "fbm").toUpperCase()}`;
  productKeywordLine.textContent = Array.isArray(product.keywords) && product.keywords.length
    ? `Keywords: ${product.keywords.join(", ")}`
    : "";
  deliveryText.textContent = product.segment === "b2c" ? "FREE delivery by tomorrow" : "Business delivery options available";
  availabilityText.textContent = isInStock
    ? (product.segment === "b2c" ? "In Stock" : "In Stock for business orders")
    : "Currently unavailable";
  availabilityText.classList.toggle("in-stock", isInStock);
  addToCartBtn.disabled = !isInStock;
  addToCartBtn.textContent = isInStock ? "Add to Cart" : "Out of Stock";
  setBackInStockPanelState(product, isInStock);
  crumbName.textContent = product.name;
  const productCategoryFamily = getProductCategoryFamily(product);
  renderOffers(price, listPrice, productCategoryFamily);
  renderServices(product, isInStock);
  renderReviewSummary(product);
  renderQa(product);

  const defaultSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];
  const keywordSpecs = Array.isArray(product.keywords) ? product.keywords.slice(0, 6) : [];
  const specs = keywordSpecs.length ? keywordSpecs : defaultSpecs;
  productSpecs.innerHTML = specs.map((spec) => `<li>${spec}</li>`).join("");

  infoSku.textContent = product.sku || "--";
  infoBrand.textContent = product.brand;
  infoCategory.textContent = formatCategoryLabel(productCategoryFamily);
  infoSegment.textContent = product.segment.toUpperCase();
  infoPrice.textContent = money(price);
  infoListPrice.textContent = money(listPrice);
  infoStock.textContent = stockCount == null ? "Available" : String(stockCount);
  infoStatus.textContent = String(product.status || "active").toUpperCase();
  infoFulfillment.textContent = String(product.fulfillment || "fbm").toUpperCase();
  infoMoq.textContent = Number(product.moq || 0) > 0 ? String(product.moq) : "--";
  infoFeatured.textContent = product.featured ? "Yes" : "No";
  infoKeywords.textContent = Array.isArray(product.keywords) && product.keywords.length ? product.keywords.join(", ") : "--";
  infoRating.innerHTML = `${product.rating} &#9733;`;
  detailInfoTable.hidden = false;

  addToCartBtn.setAttribute("data-id", String(product.id));
  syncWishlistButton(product.id);
  void hydrateRelatedProducts(product);
}

async function initProductPage() {
  const productId = getProductIdFromUrl();
  if (!productId) {
    missingState.hidden = false;
    return;
  }

  const localProduct = getLocalProductById(productId);
  const apiProduct = await fetchProductFromApi(productId);
  const selectedProduct = mergeProductSources(apiProduct, localProduct);
  if (!selectedProduct) {
    missingState.hidden = false;
    return;
  }

  renderProduct(selectedProduct);
  productDetail.hidden = false;
}

addToCartBtn.addEventListener("click", () => {
  const productId = String(addToCartBtn.getAttribute("data-id") || "").trim();
  const qty = Number(qtySelect.value);
  if (productId) {
    addProductToCart(productId, Number.isFinite(qty) && qty > 0 ? qty : 1);
  }
});

if (wishlistBtn) {
  wishlistBtn.addEventListener("click", () => {
    const productId = String(wishlistBtn.getAttribute("data-id") || "").trim();
    if (!productId) {
      return;
    }
    toggleWishlist(productId);
    syncWishlistButton(productId);
  });
}

if (backInStockForm) {
  backInStockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitBackInStockRequest(currentProductRecord);
  });
}

if (fullscreenCloseBtn) {
  fullscreenCloseBtn.addEventListener("click", closeFullscreenViewer);
}
if (fsTabImages) {
  fsTabImages.addEventListener("click", () => {
    fsMediaFilter = "images";
    updateFullscreenTabState();
    renderFullscreenThumbs();
    const firstImage = currentMediaItems.findIndex((item) => inferMediaType(item) === "image");
    if (firstImage >= 0) {
      showFullscreenMedia(firstImage);
    }
  });
}
if (fsTabVideos) {
  fsTabVideos.addEventListener("click", () => {
    fsMediaFilter = "videos";
    updateFullscreenTabState();
    renderFullscreenThumbs();
    const firstVideo = currentMediaItems.findIndex((item) => inferMediaType(item) === "video");
    if (firstVideo >= 0) {
      showFullscreenMedia(firstVideo);
    }
  });
}
if (fsZoomInBtn) {
  fsZoomInBtn.addEventListener("click", () => {
    if (fullscreenImage.hidden) {
      return;
    }
    fsZoomScale = Math.min(4, fsZoomScale + 0.25);
    applyFullscreenZoom();
  });
}
if (fsZoomOutBtn) {
  fsZoomOutBtn.addEventListener("click", () => {
    if (fullscreenImage.hidden) {
      return;
    }
    fsZoomScale = Math.max(1, fsZoomScale - 0.25);
    applyFullscreenZoom();
  });
}
if (fsThumbUpBtn) {
  fsThumbUpBtn.addEventListener("click", () => {
    scrollFullscreenThumbs("up");
  });
}
if (fsThumbDownBtn) {
  fsThumbDownBtn.addEventListener("click", () => {
    scrollFullscreenThumbs("down");
  });
}
if (fullscreenThumbs) {
  fullscreenThumbs.addEventListener("scroll", updateThumbNavButtons, { passive: true });
}
if (productImage) {
  productImage.addEventListener("click", (event) => {
    if (event.button !== 0) {
      return;
    }
    openFullscreenViewer(currentMediaIndex);
  });
}
if (productVideo) {
  productVideo.addEventListener("click", (event) => {
    if (event.button !== 0) {
      return;
    }
    openFullscreenViewer(currentMediaIndex);
  });
}
if (fullscreenViewer) {
  fullscreenViewer.addEventListener("click", (event) => {
    if (event.target === fullscreenViewer) {
      closeFullscreenViewer();
    }
  });
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFullscreenViewer();
  }
});

closeFullscreenViewer();
syncCartCount();
bindZoomEvents();
initProductPage();
