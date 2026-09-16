const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const AUTH_STORAGE_KEY = "electromart_auth_v1";
const BACK_IN_STOCK_REQUESTS_STORAGE_KEY = "electromart_back_in_stock_requests_v1";
const WISHLIST_STORAGE_KEY = "electromart_wishlist_v1";
const COMPARE_STORAGE_KEY = "electromart_compare_v1";
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
const recentlyViewedDetailSection = document.getElementById("recentlyViewedDetailSection");
const recentlyViewedDetailGrid = document.getElementById("recentlyViewedDetailGrid");
const productImage = document.getElementById("productImage");
const productImageStage = document.getElementById("productImageStage");
const imageZoomLens = document.getElementById("imageZoomLens");
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
const wishlistBtn = document.getElementById("saveWishlistBtn") || document.getElementById("wishlistBtn");
const saveWishlistBtn = wishlistBtn;
const compareBtn = document.getElementById("compareBtn");
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

const EM_LIGHTNING_DEALS_MAP = {
  "1": { id: 1, name: "AstraBook Pro 14", status: "live", stockClaimed: 45, stockTotal: 100 },
  "2": { id: 2, name: "Nimbus Phone X", status: "live", stockClaimed: 88, stockTotal: 100 },
  "3": { id: 3, name: "Pulse ANC Headphones", status: "live", stockClaimed: 62, stockTotal: 100 },
  "5": { id: 5, name: "Orbit Mechanical Keyboard", status: "live", stockClaimed: 78, stockTotal: 100 },
  "7": { id: 7, name: "Vector Gaming Laptop", status: "live", stockClaimed: 35, stockTotal: 100 },
  "8": { id: 8, name: "Echo Smart Speaker", status: "waitlist", stockClaimed: 50, stockTotal: 50 },
  "4": { id: 4, name: "Apex 4K Ultra Monitor", status: "upcoming", dropSlot: "1h" },
  "6": { id: 6, name: "Nova Wireless Pro Gaming Mouse", status: "upcoming", dropSlot: "3h" },
  "9": { id: 9, name: "HyperDrive 1TB NVMe Gen4 SSD", status: "upcoming", dropSlot: "tomorrow" }
};

function getPdpLightningDeal(product) {
  if (!product) return null;
  if (typeof window !== "undefined" && typeof window.getLightningDealForProduct === "function") {
    const deal = window.getLightningDealForProduct(product.id);
    if (deal) return deal;
  }
  const key = String(product.id || "").trim();
  if (EM_LIGHTNING_DEALS_MAP[key]) {
    return EM_LIGHTNING_DEALS_MAP[key];
  }
  return null;
}

function formatPdpCountdown(ms) {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function startPdpLightningTimer(deal, t) {
  if (typeof window === "undefined") return;
  if (window._emPdpTimerInterval) {
    clearInterval(window._emPdpTimerInterval);
    window._emPdpTimerInterval = null;
  }
  const timerEl = document.getElementById("pdpLightningTimer");
  if (!timerEl) return;

  const isUpcoming = deal.status === "upcoming";
  const targetTime = isUpcoming
    ? (deal.startTime || (Date.now() + 2 * 60 * 60 * 1000))
    : (deal._expiry || (Date.now() + 6 * 60 * 60 * 1000));

  const update = () => {
    const remaining = targetTime - Date.now();
    if (remaining <= 0) {
      timerEl.textContent = (t && t.deal_expired) ? t.deal_expired : "Expired";
      if (window._emPdpTimerInterval) {
        clearInterval(window._emPdpTimerInterval);
        window._emPdpTimerInterval = null;
      }
    } else {
      timerEl.textContent = formatPdpCountdown(remaining);
    }
  };

  update();
  window._emPdpTimerInterval = setInterval(update, 1000);
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("pagehide", () => {
    if (window._emPdpTimerInterval) {
      clearInterval(window._emPdpTimerInterval);
      window._emPdpTimerInterval = null;
    }
  });
}

function renderAmazonPrice(product, priceVal, listPriceVal, discountVal, trans) {
  if (!product) return;
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = trans || ((window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {});
  
  const price = priceVal != null ? Number(priceVal) : Number(product.price || 0);
  const listPrice = listPriceVal != null ? Number(listPriceVal) : Number(product.listPrice || product.mrp || product.price || 0);
  const discount = discountVal != null ? Number(discountVal) : (listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0);

  // 1. Deal Badge (Lightning Deal)
  const dealBadge = document.getElementById("dealBadgePill") || document.querySelector(".deal-badge-pill");
  if (dealBadge) {
    if (discount > 0 || product.featured) {
      dealBadge.textContent = t.lightning_deal || "लाइटनिंग डील";
      dealBadge.style.display = "inline-block";
    } else {
      dealBadge.style.display = "none";
    }
  }

  // 2. Discount percentage (-33% / -20% in bold red)
  const discountEl = document.getElementById("productDiscountPercent");
  if (discountEl) {
    if (discount > 0) {
      discountEl.textContent = `-${discount}%`;
      discountEl.style.display = "inline";
    } else {
      discountEl.style.display = "none";
    }
  }

  // 3. Main price and optional fraction
  const mainPriceEl = document.getElementById("productMainPrice");
  if (mainPriceEl) {
    mainPriceEl.textContent = Math.floor(price).toLocaleString("en-IN");
  }

  const fractionEl = document.getElementById("productPriceFraction") || document.querySelector(".price-fraction");
  if (fractionEl) {
    const fraction = price % 1 !== 0 ? (price % 1).toFixed(2).slice(2) : "";
    fractionEl.textContent = fraction;
  }

  // 4. MRP strikethrough & Tax inclusive
  const mrpEl = document.getElementById("productMrpPrice");
  const mrpTaxRow = document.getElementById("mrpTaxRow") || document.querySelector(".mrp-tax-row");
  if (mrpEl) {
    if (listPrice > price) {
      mrpEl.textContent = `₹${Math.floor(listPrice).toLocaleString("en-IN")}`;
      mrpEl.style.display = "inline";
      if (mrpTaxRow) {
        const mrpLabel = mrpTaxRow.querySelector(".mrp-label");
        if (mrpLabel) mrpLabel.style.display = "inline";
      }
    } else {
      mrpEl.style.display = "none";
      if (mrpTaxRow) {
        const mrpLabel = mrpTaxRow.querySelector(".mrp-label");
        if (mrpLabel) mrpLabel.style.display = "none";
      }
    }
  }

  const taxInclusive = document.querySelector(".tax-inclusive");
  if (taxInclusive) {
    taxInclusive.textContent = t.inclusive_all_taxes || "सभी टैक्स सहित";
  }

  // 5. Phase 22: PDP Lightning Deal Box Sync
  const pdpBox = document.getElementById("pdpLightningDealBox");
  if (pdpBox) {
    const deal = getPdpLightningDeal(product);
    if (deal) {
      pdpBox.style.display = "block";
      const timerLabel = document.getElementById("pdpLightningTimerLabel");
      if (timerLabel) {
        timerLabel.textContent = deal.status === "upcoming" ? (t.drop_starts_in || "Drop starts in:") : (t.ends_in || "Ends in:");
      }

      let progress = 0;
      if (deal.stockTotal && deal.stockClaimed != null) {
        progress = Math.min(100, Math.round((Number(deal.stockClaimed) / Number(deal.stockTotal)) * 100));
      } else {
        progress = 45;
      }

      const progressFill = document.getElementById("pdpLightningProgressFill");
      const progressText = document.getElementById("pdpLightningProgressText");
      const urgencyEl = document.getElementById("pdpLightningUrgency");

      if (progressFill) {
        progressFill.style.width = `${progress}%`;
        if (progressFill.classList) {
          progressFill.classList.remove("urgent", "full");
          if (progress >= 100) {
            progressFill.classList.add("full");
          } else if (progress >= 75) {
            progressFill.classList.add("urgent");
          }
        }
      }

      if (progressText) {
        if (progress >= 100) {
          progressText.textContent = t.waitlist_available || "100% Claimed - Waitlist Available";
        } else {
          progressText.textContent = `${progress}% ${t.claimed || "claimed"}`;
        }
      }

      if (urgencyEl) {
        if (progress >= 75 && progress < 100) {
          urgencyEl.innerHTML = `🔥 <strong>${t.claimed_hurry || "Hurry, deal ends soon!"}</strong>`;
          urgencyEl.style.display = "block";
        } else {
          urgencyEl.innerHTML = "";
          urgencyEl.style.display = "none";
        }
      }

      startPdpLightningTimer(deal, t);
    } else {
      pdpBox.style.display = "none";
      if (window._emPdpTimerInterval) {
        clearInterval(window._emPdpTimerInterval);
        window._emPdpTimerInterval = null;
      }
    }
  }
}
window.renderAmazonPrice = renderAmazonPrice;

function renderOffers(price, listPrice, category) {
  if (!offersBlock || !offersGrid) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const savings = Math.max(0, Number(listPrice) - Number(price));
  const offers = [
    {
      key: "sub_bank_offer",
      title: t.sub_bank_offer || "Bank Offer",
      badge: "14 offers >",
      descKey: "partner_card_cashback",
      text: t.bank_offer_detail || (savings > 0
        ? `Upto ₹1,500.00 discount on select Credit Cards on orders above ${money(Math.max(1999, price))}.`
        : "Flat 5% cashback with selected credit cards.")
    },
    {
      key: "sub_no_cost_emi",
      title: t.sub_no_cost_emi || "No Cost EMI",
      badge: "1 offer >",
      descKey: "no_cost_emi_subtext",
      text: t.no_cost_emi_detail || (t.no_cost_emi_subtext || `Avail No Cost EMI on select cards for orders above ₹3,000.`)
    },
    {
      key: "sub_partner_offer",
      title: t.sub_partner_offer || "Partner Offer",
      badge: "1 offer >",
      descKey: "partner_offer_subtext",
      text: t.partner_offer_detail || (t.partner_offer_subtext || "GST invoice available and save up to 28% on business purchases.")
    },
    {
      key: "sub_exchange_offer",
      title: t.sub_exchange_offer || "Exchange Offer",
      badge: "Save more >",
      descKey: "exchange_offer_subtext",
      text: t.exchange_offer_subtext || `Exchange your old ${category} and get up to ${money(Math.round(price * 0.18))} off.`
    }
  ];
  offersGrid.innerHTML = offers.map((item) => `
    <article class="offer-item amazon-offer-card">
      <div class="offer-card-top">
        <h3 data-i18n="${item.key}" class="offer-card-title">${escapeHtml(item.title)}</h3>
      </div>
      <p data-i18n="${item.descKey}" class="offer-card-desc">${escapeHtml(item.text)}</p>
      <span class="offer-card-link">${item.badge}</span>
    </article>
  `).join("");
  offersBlock.hidden = false;
}

function renderServices(product, isInStock) {
  if (!servicesBlock || !serviceDeliveryText || !serviceReturnText || !serviceWarrantyText || !serviceSellerText) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const categoryFamily = getProductCategoryFamily(product);

  const deliveryH3 = servicesBlock.querySelector('[data-i18n="sub_delivery"]') || servicesBlock.querySelectorAll(".service-item h3")[0];
  const returnsH3 = servicesBlock.querySelector('[data-i18n="sub_returns"]') || servicesBlock.querySelectorAll(".service-item h3")[1];
  const warrantyH3 = servicesBlock.querySelector('[data-i18n="sub_warranty"]') || servicesBlock.querySelectorAll(".service-item h3")[2];
  const sellerH3 = servicesBlock.querySelector('[data-i18n="sub_seller"]') || servicesBlock.querySelectorAll(".service-item h3")[3];

  if (deliveryH3) deliveryH3.textContent = t.sub_delivery || "Delivery";
  if (returnsH3) returnsH3.textContent = t.sub_returns || "Returns";
  if (warrantyH3) warrantyH3.textContent = t.sub_warranty || "Warranty";
  if (sellerH3) sellerH3.textContent = t.sub_seller || "Seller";

  serviceDeliveryText.textContent = isInStock
    ? (t.free_delivery_subtext || "FREE delivery by tomorrow in select cities.")
    : (t.delivery_date_after_stock || "Delivery date will be shown after stock update.");
  serviceDeliveryText.setAttribute("data-i18n", "free_delivery_subtext");

  serviceReturnText.textContent = t.return_subtext || "7 दिनों में आसान रिप्लेसमेंट";
  serviceReturnText.setAttribute("data-i18n", "return_subtext");

  serviceWarrantyText.textContent = (categoryFamily === "laptop" || categoryFamily === "computer")
    ? (t.warranty_1yr_subtext || t.warranty_subtext || "1 Year manufacturer warranty + service center support.")
    : (t.warranty_std_subtext || "6 Months to 1 Year standard brand warranty.");
  serviceWarrantyText.setAttribute("data-i18n", "warranty_subtext");

  serviceSellerText.textContent = `${product.brand ? product.brand + " " : ""}${t.seller_subtext || "अधिकृत विक्रेता एवं जीएसटी चालान उपलब्ध"}`;
  serviceSellerText.setAttribute("data-i18n", "seller_subtext");
  servicesBlock.hidden = false;
}

let activeReviewStarFilter = null;

function renderReviewSummary(product) {
  if (!reviewsBlock || !reviewHeadline || !reviewBars) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

  const writeReviewBtn = document.querySelector(".amazon-btn-write-review");
  if (writeReviewBtn) {
    writeReviewBtn.onclick = () => {
      window.location.href = `review.html?productId=${encodeURIComponent(product.id)}`;
    };
  }

  const rating = Math.max(0, Math.min(5, Number(product.rating || 0)));
  const totalReviews = Math.max(8, Math.round(42 + (rating * 37)));
  reviewHeadline.innerHTML = `${rating.toFixed(1)} &#9733; (${totalReviews.toLocaleString("en-IN")} ${t.global_ratings || t.ratings_label || "रेटिंग"})`;

  const base = Math.max(20, Math.round((rating / 5) * 100));
  const distribution = [
    { stars: 5, value: Math.min(92, base + 20) },
    { stars: 4, value: Math.min(80, Math.max(5, base - 5)) },
    { stars: 3, value: Math.min(60, Math.max(4, base - 25)) },
    { stars: 2, value: Math.min(35, Math.max(3, base - 45)) },
    { stars: 1, value: Math.min(22, Math.max(2, base - 60)) }
  ];
  const starWord = t.tbl_rating || "स्टार";
  reviewBars.innerHTML = distribution.map((item) => `
    <div class="review-bar" data-star-filter="${item.stars}" title="Filter by ${item.stars} star reviews">
      <span>${item.stars} ${starWord}</span>
      <div class="review-track"><div class="review-fill" style="width:${item.value}%"></div></div>
      <span>${item.value}%</span>
    </div>
  `).join("");

  const translateBtn = document.getElementById("translateReviewsBtn");
  if (translateBtn) {
    translateBtn.textContent = t.translate_reviews_btn || "Translate all reviews";
  }

  // Load custom reviews from localStorage for this product
  let customReviews = [];
  try {
    const raw = localStorage.getItem("electromart_reviews_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        customReviews = parsed.filter(r => String(r.productId) === String(product.id));
      }
    }
  } catch (e) {}

  const defaultReviews = [
    {
      author: "Rahul S.",
      verified: t.verified_purchase || "Verified Purchase",
      stars: "★★★★★",
      ratingNum: 5,
      title: t.val_top_review_title || "Excellent quality and fast delivery",
      date: "Reviewed in India on 15 August 2026",
      body: t.val_sample_review || "Authentic product with genuine warranty. Fully satisfied with ElectroMart service.",
      helpfulCount: 34,
      images: []
    },
    {
      author: "Priya Sharma",
      verified: t.verified_purchase || "Verified Purchase",
      stars: "★★★★★",
      ratingNum: 5,
      title: currentLang === "hi" ? "बेहतरीन प्रदर्शन और असली वारंटी" : "Top notch performance and genuine warranty",
      date: "Reviewed in India on 28 July 2026",
      body: currentLang === "hi" ? "पैकिंग बहुत अच्छी थी और डिलीवरी तय समय से पहले मिल गई। उत्पाद 100% ओरिजिनल है।" : "Packaging was secure and delivery was faster than expected. 100% original product.",
      helpfulCount: 19,
      images: []
    },
    {
      author: "Vikram Malhotra",
      verified: t.verified_purchase || "Verified Purchase",
      stars: "★★★★☆",
      ratingNum: 4,
      title: currentLang === "hi" ? "पैसा वसूल सौदा" : "Value for money purchase",
      date: "Reviewed in India on 10 July 2026",
      body: currentLang === "hi" ? "दिए गए मूल्य पर यह सबसे अच्छा विकल्प है। कोई शिकायत नहीं।" : "Best choice at this price segment. Build quality and reliability are outstanding.",
      helpfulCount: 8,
      images: []
    }
  ];

  // Convert custom reviews to display format
  const mappedCustom = customReviews.map(r => {
    const rNum = Number(r.rating) || 5;
    return {
      author: r.reviewerName || "ElectroMart Customer",
      verified: t.verified_purchase || "Verified Purchase",
      stars: "★".repeat(rNum) + "☆".repeat(5 - rNum),
      ratingNum: rNum,
      title: r.headline || "Verified Customer Review",
      date: r.date ? `Reviewed in India on ${r.date}` : "Reviewed in India on August 2026",
      body: r.text || "",
      helpfulCount: Number(r.helpfulCount || 0),
      images: Array.isArray(r.images) ? r.images : []
    };
  });

  const allReviews = [...mappedCustom, ...defaultReviews];

  // Render Customer Media Gallery
  const customerGallery = document.getElementById("customerMediaGallery");
  const customerGalleryTrack = document.getElementById("customerGalleryTrack");
  const seeAllMediaLink = document.getElementById("seeAllCustomerMediaLink");

  // Fetch verified customer photos and videos for this product
  let productMedia = [];
  if (typeof window.loadCustomerMedia === "function") {
    const allStored = window.loadCustomerMedia();
    if (Array.isArray(allStored) && product) {
      productMedia = allStored.filter(m => String(m.productId) === String(product.id));
    }
  }

  const allImages = allReviews.flatMap(r => r.images || []);

  if (customerGallery && customerGalleryTrack) {
    if (productMedia.length > 0) {
      customerGallery.hidden = false;
      if (seeAllMediaLink && product) {
        seeAllMediaLink.href = `customer-media.html?productId=${encodeURIComponent(product.id)}`;
        const seeAllText = (t && t.media_pdp_see_all) || "See all customer photos & videos ›";
        seeAllMediaLink.textContent = `${seeAllText} (${productMedia.length})`;
      }

      customerGalleryTrack.innerHTML = productMedia.map((m, idx) => `
        <div class="customer-gallery-thumb-wrapper" data-media-id="${m.id}" data-media-index="${idx}" role="button" tabindex="0" aria-label="${m.type === 'video' ? 'Customer video' : 'Customer photo'}">
          <img class="customer-gallery-thumb" src="${m.thumbnailUrl || m.mediaUrl}" alt="${m.headline || 'Customer review media'}" onerror="this.src='product-placeholder.svg'" />
          ${m.type === 'video' ? `<span class="customer-gallery-video-tag">▶ ${m.duration || 'Video'}</span>` : ''}
        </div>
      `).join("");

      customerGalleryTrack.querySelectorAll(".customer-gallery-thumb-wrapper").forEach((wrap, idx) => {
        wrap.addEventListener("click", () => {
          if (typeof window.setActiveCustomerMedia === "function") {
            window.setActiveCustomerMedia(productMedia);
          }
          if (typeof window.openLightbox === "function") {
            window.openLightbox(idx);
          } else {
            window.location.href = `customer-media.html?productId=${encodeURIComponent(product.id)}&mediaId=${encodeURIComponent(wrap.dataset.mediaId)}`;
          }
        });
        wrap.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            wrap.click();
          }
        });
      });
    } else if (allImages.length > 0) {
      customerGallery.hidden = false;
      if (seeAllMediaLink && product) {
        seeAllMediaLink.href = `customer-media.html?productId=${encodeURIComponent(product.id)}`;
      }
      customerGalleryTrack.innerHTML = allImages.map(img => `
        <img class="customer-gallery-thumb" src="${img}" alt="Customer review photo" />
      `).join("");
    } else {
      customerGallery.hidden = true;
    }
  }

  // Filter Bar logic
  const filterActiveBar = document.getElementById("reviewFilterActiveBar");
  const filterStatusText = document.getElementById("reviewFilterStatusText");
  const clearFilterBtn = document.getElementById("clearReviewFilterBtn");

  function renderFilteredReviews() {
    const reviewsList = document.getElementById("customerReviewsList");
    if (!reviewsList) return;

    let displayReviews = allReviews;
    if (activeReviewStarFilter !== null) {
      displayReviews = allReviews.filter(r => r.ratingNum === activeReviewStarFilter);
      if (filterActiveBar && filterStatusText) {
        filterActiveBar.hidden = false;
        filterStatusText.textContent = `${t.filter_by_star_prefix || "Showing"} ${activeReviewStarFilter} ${starWord} (${displayReviews.length})`;
      }
    } else {
      if (filterActiveBar) filterActiveBar.hidden = true;
    }

    if (displayReviews.length === 0) {
      reviewsList.innerHTML = `<p style="padding: 20px 0; color: #565959;">No reviews found for this filter.</p>`;
      return;
    }

    reviewsList.innerHTML = displayReviews.map((rev, idx) => `
      <article class="amazon-review-item sample-review-item">
        <div class="review-author-row">
          <div class="review-avatar">${rev.author.charAt(0)}</div>
          <span class="review-author-name">${rev.author}</span>
        </div>
        <div class="review-rating-row">
          <span class="review-stars-amber">${rev.stars}</span>
          <strong class="review-title-bold">${escapeHtml(rev.title)}</strong>
        </div>
        <div class="review-date-muted">${rev.date}</div>
        <div class="review-verified-badge">
          <span>${rev.verified}</span>
        </div>
        <p class="review-body-text">${escapeHtml(rev.body)}</p>
        ${Array.isArray(rev.images) && rev.images.length > 0 ? `
          <div class="customer-review-images" style="display:flex;gap:8px;margin-bottom:10px;">
            ${rev.images.map(img => `<img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #d5d9d9;" />`).join("")}
          </div>
        ` : ""}
        <div class="review-helpful-action">
          <button type="button" class="helpful-pill-btn" id="helpfulBtn_${idx}">
            ${t.helpful_button || "Helpful"} (<span class="helpful-count">${rev.helpfulCount}</span>)
          </button>
          <span class="report-abuse-link">Report</span>
        </div>
      </article>
    `).join("");

    reviewsList.querySelectorAll(".helpful-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn._voted) return;
        btn._voted = true;
        const countSpan = btn.querySelector(".helpful-count");
        if (countSpan) {
          countSpan.textContent = String(Number(countSpan.textContent) + 1);
        }
        btn.classList.add("voted");
      });
    });
  }

  // Hook star filter clicks on #reviewBars
  reviewBars.querySelectorAll(".review-bar").forEach(bar => {
    bar.addEventListener("click", () => {
      const star = Number(bar.getAttribute("data-star-filter"));
      if (activeReviewStarFilter === star) {
        activeReviewStarFilter = null;
      } else {
        activeReviewStarFilter = star;
      }
      renderFilteredReviews();
    });
  });

  if (clearFilterBtn) {
    clearFilterBtn.onclick = () => {
      activeReviewStarFilter = null;
      renderFilteredReviews();
    };
  }

  renderFilteredReviews();
  reviewsBlock.hidden = false;
}

const QA_STORAGE_KEY = "electromart_qa_v1";

function renderQa(product) {
  if (!qaBlock || !qaList) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

  // Load community Q&A from localStorage
  let communityQuestions = [];
  try {
    const raw = localStorage.getItem(QA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        communityQuestions = parsed.filter(item => String(item.productId) === String(product.id));
      }
    }
  } catch (e) {}

  const defaultQa = [
    {
      id: "qa_1_" + product.id,
      q: t.qa_q1 || "Does this product include GST invoice?",
      a: t.qa_a1 || "Yes, GST invoice is available for all eligible orders.",
      helpful: 18,
      unhelpful: 1
    },
    {
      id: "qa_2_" + product.id,
      q: t.qa_q2 || "Is this suitable for office and home use?",
      a: t.qa_a2 || `Yes, ${product.name} is suitable for both regular office and home usage.`,
      helpful: 12,
      unhelpful: 0
    },
    {
      id: "qa_3_" + product.id,
      q: t.qa_q3 || "What is the return policy?",
      a: t.qa_a3 || "Replacement is available within 7 days if the item is damaged or not working.",
      helpful: 25,
      unhelpful: 2
    }
  ];

  const allQa = [...communityQuestions, ...defaultQa];

  function renderQaItems(items) {
    if (items.length === 0) {
      qaList.innerHTML = `<p style="padding: 16px 0; color: #565959;">${t.qa_no_results || "No matching questions found. Be the first to ask!"}</p>`;
      return;
    }

    qaList.innerHTML = items.map((item, idx) => `
      <article class="qa-item" id="qaItem_${item.id || idx}">
        <div class="qa-q-row">
          <span class="qa-q-badge">${t.qa_q_prefix || "Q:"}</span>
          <span>${escapeHtml(item.q)}</span>
        </div>
        <div class="qa-a-row">
          <span class="qa-a-badge">${t.qa_a_prefix || "A:"}</span>
          <span>${escapeHtml(item.a)}</span>
        </div>
        <div class="qa-vote-row">
          <span>Do you find this helpful?</span>
          <button type="button" class="qa-vote-btn qa-vote-up" data-qa-id="${item.id || idx}">
            ▲ ${t.qa_helpful_vote || "Helpful"} (<span class="vote-up-count">${item.helpful || 0}</span>)
          </button>
          <button type="button" class="qa-vote-btn qa-vote-down" data-qa-id="${item.id || idx}">
            ▼ ${t.qa_unhelpful_vote || "Unhelpful"} (<span class="vote-down-count">${item.unhelpful || 0}</span>)
          </button>
        </div>
      </article>
    `).join("");

    // Wire voting listeners
    qaList.querySelectorAll(".qa-vote-up").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn._voted) return;
        btn._voted = true;
        btn.classList.add("voted");
        const countSpan = btn.querySelector(".vote-up-count");
        if (countSpan) countSpan.textContent = String(Number(countSpan.textContent) + 1);
      });
    });

    qaList.querySelectorAll(".qa-vote-down").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn._voted) return;
        btn._voted = true;
        btn.classList.add("voted");
        const countSpan = btn.querySelector(".vote-down-count");
        if (countSpan) countSpan.textContent = String(Number(countSpan.textContent) + 1);
      });
    });
  }

  // Live search handler
  const qaSearchInput = document.getElementById("qaSearchInput");
  const qaSearchClearBtn = document.getElementById("qaSearchClearBtn");
  if (qaSearchInput) {
    qaSearchInput.oninput = () => {
      const query = qaSearchInput.value.trim().toLowerCase();
      if (qaSearchClearBtn) qaSearchClearBtn.hidden = !query;
      if (!query) {
        renderQaItems(allQa);
        return;
      }
      const filtered = allQa.filter(item => 
        (item.q && item.q.toLowerCase().includes(query)) || 
        (item.a && item.a.toLowerCase().includes(query))
      );
      renderQaItems(filtered);
    };
  }

  if (qaSearchClearBtn) {
    qaSearchClearBtn.onclick = () => {
      if (qaSearchInput) qaSearchInput.value = "";
      qaSearchClearBtn.hidden = true;
      renderQaItems(allQa);
    };
  }

  // Ask Community Toggle & Submit
  const askCommunityBtn = document.getElementById("askCommunityBtn");
  const askFormWrap = document.getElementById("askCommunityFormWrap");
  const askForm = document.getElementById("askCommunityForm");
  const askInput = document.getElementById("askQuestionInput");
  const cancelBtn = document.getElementById("cancelQuestionBtn");

  if (askCommunityBtn && askFormWrap) {
    askCommunityBtn.onclick = () => {
      askFormWrap.hidden = !askFormWrap.hidden;
      if (!askFormWrap.hidden && askInput) askInput.focus();
    };
  }

  if (cancelBtn && askFormWrap) {
    cancelBtn.onclick = () => {
      askFormWrap.hidden = true;
    };
  }

  if (askForm) {
    askForm.onsubmit = (e) => {
      e.preventDefault();
      const questionText = askInput ? askInput.value.trim() : "";
      if (!questionText) return;

      const newQa = {
        id: "qa_comm_" + Date.now(),
        productId: String(product.id),
        q: questionText,
        a: "Thank you for asking! ElectroMart specialists and community members verify questions regularly. Compatible with standard specifications.",
        helpful: 1,
        unhelpful: 0
      };

      try {
        const raw = localStorage.getItem(QA_STORAGE_KEY);
        const stored = raw ? JSON.parse(raw) : [];
        stored.unshift(newQa);
        localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(stored));
      } catch (err) {}

      allQa.unshift(newQa);
      if (askInput) askInput.value = "";
      if (askFormWrap) askFormWrap.hidden = true;
      renderQaItems(allQa);
      alert(t.qa_submitted_toast || "Your question has been posted to the ElectroMart community!");
    };
  }

  renderQaItems(allQa);
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

function loadCompareIds() {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveCompareIds(ids) {
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids.map((item) => String(item).trim()).filter(Boolean)))));
  } catch (error) {
    return;
  }
}

function loadRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function isCompared(productId) {
  return loadCompareIds().includes(String(productId));
}

function toggleCompare(productId) {
  const key = String(productId).trim();
  if (!key) {
    return false;
  }
  const ids = loadCompareIds();
  if (ids.includes(key)) {
    saveCompareIds(ids.filter((item) => item !== key));
    return false;
  }
  saveCompareIds([key, ...ids]);
  return true;
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

function getRecentlyViewedProducts() {
  const ids = loadRecentlyViewedIds();
  if (!ids.length) {
    return [];
  }

  const sourceMap = new Map(allProducts.map((item) => [String(item.id), item]));
  return ids
    .map((id) => sourceMap.get(String(id)))
    .filter((item) => item && String(item.id) !== String(currentProductRecord?.id) )
    .slice(0, 6);
}

function renderRecentlyViewedDetailSection() {
  if (!recentlyViewedDetailSection || !recentlyViewedDetailGrid) {
    return;
  }

  const items = getRecentlyViewedProducts();
  if (!items.length) {
    recentlyViewedDetailSection.hidden = true;
    recentlyViewedDetailGrid.innerHTML = "";
    return;
  }

  recentlyViewedDetailSection.hidden = false;
  recentlyViewedDetailGrid.innerHTML = items
    .map((item) => `
      <article class="related-card">
        <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="related-media">
          <img src="${item.image || ''}" alt="${item.name}" loading="lazy" />
        </a>
        <div class="related-copy">
          <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="related-title">${item.name}</a>
          <p class="related-price">${money(item.price)}</p>
        </div>
      </article>
    `)
    .join("");
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
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.textContent = String(total);
  }
}

function syncWishlistButton(productId) {
  const targetWishlistBtn = document.getElementById("saveWishlistBtn") || wishlistBtn;
  if (!targetWishlistBtn) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const active = isWishlisted(productId);
  targetWishlistBtn.classList.toggle("active", active);
  targetWishlistBtn.textContent = active ? (t.wishlisted || "Wishlisted") : (t.save_to_wishlist || "Save to Wishlist");
  targetWishlistBtn.setAttribute("data-id", String(productId || ""));
}

function syncCompareButton(productId) {
  if (!compareBtn) {
    return;
  }
  const active = isCompared(productId);
  compareBtn.classList.toggle("active", active);
  compareBtn.textContent = active ? "Compared" : "Add to Compare";
  compareBtn.setAttribute("data-id", String(productId || ""));
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
  if (fallbackCategory.includes("laptop")) {
    return "laptop";
  }
  const signal = buildProductCategorySignal(product);

  if (/\b(laptop|notebook|macbook|chromebook|thinkpad|ideapad|zenbook|vivobook)\b/i.test(signal)) {
    return "laptop";
  }
  if (/\b(headphone|headset|earbud|earphone|speaker|soundbar|microphone|audio|home theater)\b/i.test(signal)) {
    return "audio";
  }
  if (/\b(printers?|plotters?|scanners?|inkjet|laserjet|toners?|cartridges?|label printer|all printer)\b/i.test(signal)) {
    return "printer";
  }
  if (/\b(battery|keyboard|adapter|charger|cable|case|cover|power bank|mouse|pendrive|ssd enclosure|cooler|fan|dock|hub|bag|accessory)\b/i.test(signal)) {
    return "accessory";
  }
  if (/\b(desktop|workstation|cabinet|all in one|aio|monitor|computer|gaming pc|office tower|assembled pc|mini pc)\b/i.test(signal)) {
    return "computer";
  }
  if (/\b(mobile|smartphone|phone|tablet|wearable|smartwatch|watch)\b/i.test(signal)) {
    return "mobile";
  }

  if (["laptop", "mobile", "audio", "accessory", "computer", "printer"].includes(fallbackCategory)) {
    return fallbackCategory;
  }
  return fallbackCategory || "accessory";
}
window.getProductCategoryFamily = getProductCategoryFamily;

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return String(params.get("id") || "").trim();
}

function getLocalProductById(productId) {
  if (!productId) {
    return null;
  }
  const emMap = window.EM_CATALOG_MAP || {};
  const emList = window.EM_CATALOG || [];
  const catalogProduct = emMap[productId] || emList.find((p) => String(p.id) === String(productId)) || loadCatalogMap()[productId];
  const staticProduct = allProducts.find((product) => String(product.id) === String(productId));
  const mappedCatalog = catalogProduct ? mapApiProduct(catalogProduct) : null;
  const mappedStatic = staticProduct ? mapApiProduct(staticProduct) : null;
  return mergeProductSources(mappedCatalog, mappedStatic);
}

function mapApiProduct(product) {
  if (!product) return null;
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
    title: product.title || null,
    aboutSpecs: product.aboutSpecs || null,
    price: (function() {
      let p = Number(product.price || 0);
      if (p >= 50000 && (category.includes("battery") || category.includes("keyboard") || category.includes("adaptor") || category.includes("adapter") || category.includes("cooling") || category.includes("accessories") || category.includes("accessory") || name.toLowerCase().includes("battery") || name.toLowerCase().includes("keyboard"))) {
        p = Math.round(p / 100);
      }
      return p;
    })(),
    listPrice: (function() {
      let lp = Number(product.listPrice || product.price || 0);
      let p = Number(product.price || 0);
      if (lp >= 50000 && (category.includes("battery") || category.includes("keyboard") || category.includes("adaptor") || category.includes("adapter") || category.includes("cooling") || category.includes("accessories") || category.includes("accessory") || name.toLowerCase().includes("battery") || name.toLowerCase().includes("keyboard"))) {
        lp = Math.round(lp / 100);
      }
      return lp;
    })(),
    rating: Number(product.rating || 0),
    image: normalizeImageUrl(product.image || ""),
    images: parseMediaEntries(product.images),
    videos: parseMediaEntries(product.videos),
    media: parseMediaEntries(product.media),
    moq: Number(product.moq || 0),
    stock: Number(product.stock || 0),
    description: typeof product.description === "object" ? product.description : asCleanText(product.description || ""),
    keywords: parseKeywordList(product.keywords),
    sku: asCleanText(product.sku || ""),
    status: asCleanText(product.status || "active", "active").toLowerCase(),
    fulfillment: asCleanText(product.fulfillment || "fbm", "fbm").toLowerCase(),
    featured: Boolean(product.featured)
  };
}
window.mapApiProduct = mapApiProduct;

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
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);
    try {
      response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`, {
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
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
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);
      try {
        response = await fetch(`${API_BASE_URL}/products?status=active`, {
          signal: controller.signal
        });
      } finally {
        window.clearTimeout(timeoutId);
      }
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
    title: a.title || b.title || null,
    aboutSpecs: a.aboutSpecs || b.aboutSpecs || null,
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
    description: (typeof a.description === "object" ? a.description : (typeof b.description === "object" ? b.description : asCleanText(a.description || b.description || ""))),
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
  if (imageZoomPane) {
    imageZoomPane.classList.remove("show");
  }
  if (imageZoomLens) {
    imageZoomLens.classList.remove("show");
    imageZoomLens.style.display = "none";
  }
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
    hideZoomPane();
    return;
  }
  if (window.matchMedia("(max-width: 1180px)").matches) {
    hideZoomPane();
    return;
  }

  const stage = productImageStage || (productImage ? productImage.parentElement : null);
  const imgBounds = productImage.getBoundingClientRect();
  const stageBounds = stage ? stage.getBoundingClientRect() : imgBounds;

  if (!imgBounds.width || !imgBounds.height) {
    hideZoomPane();
    return;
  }

  const cursorX = event.clientX;
  const cursorY = event.clientY;

  // Verify cursor is within image bounds
  if (
    cursorX < imgBounds.left ||
    cursorX > imgBounds.right ||
    cursorY < imgBounds.top ||
    cursorY > imgBounds.bottom
  ) {
    hideZoomPane();
    return;
  }

  const lensW = 140;
  const lensH = 140;

  const mouseImgX = cursorX - imgBounds.left;
  const mouseImgY = cursorY - imgBounds.top;

  const maxLensX = Math.max(0, imgBounds.width - lensW);
  const maxLensY = Math.max(0, imgBounds.height - lensH);

  const clampedLensX = Math.max(0, Math.min(maxLensX, mouseImgX - lensW / 2));
  const clampedLensY = Math.max(0, Math.min(maxLensY, mouseImgY - lensH / 2));

  const offsetInStageX = imgBounds.left - stageBounds.left;
  const offsetInStageY = imgBounds.top - stageBounds.top;

  if (imageZoomLens) {
    imageZoomLens.style.width = `${lensW}px`;
    imageZoomLens.style.height = `${lensH}px`;
    imageZoomLens.style.left = `${offsetInStageX + clampedLensX}px`;
    imageZoomLens.style.top = `${offsetInStageY + clampedLensY}px`;
    imageZoomLens.style.display = "block";
    imageZoomLens.classList.add("show");
  }

  const xRatio = maxLensX > 0 ? clampedLensX / maxLensX : 0.5;
  const yRatio = maxLensY > 0 ? clampedLensY / maxLensY : 0.5;

  imageZoomPane.style.backgroundPosition = `${xRatio * 100}% ${yRatio * 100}%`;
  imageZoomPane.classList.add("show");
}

function bindZoomEvents() {
  if (zoomBound || !productImage) {
    return;
  }
  zoomBound = true;

  const targetEl = productImageStage || productImage;

  targetEl.addEventListener("mousemove", updateZoomPanePosition);
  targetEl.addEventListener("mouseenter", updateZoomPanePosition);
  targetEl.addEventListener("mouseleave", hideZoomPane);

  productImage.addEventListener("mousemove", updateZoomPanePosition);
  productImage.addEventListener("mouseenter", updateZoomPanePosition);
  productImage.addEventListener("mouseleave", hideZoomPane);

  targetEl.addEventListener("wheel", (event) => {
    if (window.matchMedia("(max-width: 1180px)").matches) {
      return;
    }
    event.preventDefault();
    const delta = event.deltaY > 0 ? -20 : 20;
    zoomPaneScale = Math.max(160, Math.min(450, zoomPaneScale + delta));
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
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  relatedGrid.innerHTML = items.map((item) => {
    const locTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : (item.title || item.name || "")).trim();
    return `
      <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="related-item">
        <img src="${normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL}" alt="${escapeHtml(locTitle)}" loading="lazy" />
        <p>${escapeHtml(locTitle)}</p>
      </a>
    `;
  }).join("");
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

function renderProductInfoTable(product, stockCount, categoryFamily, price, listPrice) {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});

  const statusUpper = String(product.status || "active").toUpperCase();
  const statusMap = {
    ACTIVE: t.val_active || "सक्रिय",
    INACTIVE: t.val_inactive || "निष्क्रिय"
  };
  const featuredMap = {
    Yes: t.val_yes || "हाँ",
    No: t.val_no || "नहीं",
    true: t.val_yes || "हाँ",
    false: t.val_no || "नहीं"
  };

  if (infoSku) infoSku.textContent = product.sku || "--";
  if (infoBrand) infoBrand.textContent = product.brand || "--";
    const catFamily = categoryFamily || getProductCategoryFamily(product);
  const localizedCat = (window.getLocalizedCategory ? window.getLocalizedCategory(catFamily, currentLang) : "") || t["cat_" + catFamily] || formatCategoryLabel(catFamily);
  if (infoCategory) infoCategory.textContent = localizedCat;
  if (infoSegment) infoSegment.textContent = String(product.segment || "--").toUpperCase();
  if (infoPrice) infoPrice.textContent = money(price != null ? price : product.price);
  if (infoListPrice) infoListPrice.textContent = money(listPrice != null ? listPrice : (product.listPrice || product.price));
  if (infoStock) infoStock.textContent = (stockCount == null || stockCount === "") ? (t.val_available || "उपलब्ध") : String(stockCount);
  if (infoStatus) infoStatus.textContent = statusMap[statusUpper] || statusUpper;
  if (infoFulfillment) infoFulfillment.textContent = String(product.fulfillment || "fbm").toUpperCase();
  if (infoMoq) infoMoq.textContent = Number(product.moq || 0) > 0 ? String(product.moq) : "--";
  if (infoFeatured) infoFeatured.textContent = featuredMap[product.featured] || (product.featured ? (t.val_yes || "हाँ") : (t.val_no || "नहीं"));
    const kwMap = {
    "Mobile and Wearable Tech": t.kw_mobile_wearable || "मोबाइल और वियरेबल तकनीक",
    "lenovo": "Lenovo",
    "laptop": t.cat_laptop || "लैपटॉप",
    "business laptop": t.kw_business_laptop || "बिज़नेस लैपटॉप",
    "ryzen 5": "Ryzen 5"
  };
  if (infoKeywords) {
    if (Array.isArray(product.keywords) && product.keywords.length) {
      infoKeywords.textContent = product.keywords.map(k => kwMap[k] || k).join(", ");
    } else {
      infoKeywords.textContent = "--";
    }
  }
  if (infoRating) infoRating.innerHTML = `${product.rating} &#9733;`;

  const tableContainer = document.getElementById("productInfoTable") || detailInfoTable;
  if (tableContainer) {
    tableContainer.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (t[k]) el.textContent = t[k];
    });
  }

  if (detailInfoTable) detailInfoTable.hidden = false;
}
window.renderProductInfoTable = renderProductInfoTable;


function localizeSpec(spec, t) {
  if (!spec) return "";
  let s = String(spec);
  return s
    .replace(/\bCapacity\b/gi, t.spec_capacity || "Capacity")
    .replace(/\bVoltage\b/gi, t.spec_voltage || "Voltage")
    .replace(/\bWarranty Details?\b/gi, t.spec_warranty || "Warranty Details")
    .replace(/\bHigh performance processor\b/gi, t.spec_high_performance || "High performance processor")
    .replace(/\bSSD storage\b/gi, t.spec_ssd_storage || "SSD storage")
    .replace(/\bLong battery life\b/gi, t.spec_battery_life || "Long battery life")
    .replace(/\bAMOLED display\b/gi, t.spec_amoled_display || "AMOLED display")
    .replace(/\bFast charging\b/gi, t.spec_fast_charging || "Fast charging")
    .replace(/\bMulti-camera setup\b/gi, t.spec_multi_camera || "Multi-camera setup")
    .replace(/\bBluetooth 5\.2\b/gi, t.spec_bluetooth || "Bluetooth 5.2")
    .replace(/\bDeep bass\b/gi, t.spec_deep_bass || "Deep bass")
    .replace(/\bLow-latency mode\b/gi, t.spec_low_latency || "Low-latency mode")
    .replace(/\bDurable build\b/gi, t.spec_durable_build || "Durable build")
    .replace(/\bWarranty included\b/gi, t.spec_warranty_included || "Warranty included")
    .replace(/\bUniversal compatibility\b/gi, t.spec_universal_compat || "Universal compatibility")
    .replace(/\bQuality assured\b/gi, t.spec_quality_assured || "Quality assured")
    .replace(/\bTrusted by customers\b/gi, t.spec_trusted_customers || "Trusted by customers")
    .replace(/\bFast delivery options\b/gi, t.spec_fast_delivery || "Fast delivery options");
}

function renderFrequentlyBoughtTogether(product, t) {
  const container = document.getElementById("frequentlyBoughtContainer");
  if (!container) return;
  const candidates = allProducts.filter(p => p.id !== product.id && p.category === product.category);
  const bundleItem = candidates.length > 0 ? candidates[0] : (allProducts.find(p => p.id !== product.id) || null);
  if (!bundleItem) {
    container.hidden = true;
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const mainTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name).trim();
  const bundleItemTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(bundleItem, currentLang) : bundleItem.name).trim();
  const total = Number(product.price || 0) + Number(bundleItem.price || 0);
  container.innerHTML = `
    <h2>${t.frequently_bought_together || "Frequently bought together"}</h2>
    <div class="bundle-flex" style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-top: 12px;">
      <div class="bundle-images" style="display: flex; align-items: center; gap: 12px;">
        <img src="${product.image}" alt="${escapeHtml(mainTitle)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
        <span style="font-size: 1.5rem; font-weight: bold; color: #555;">+</span>
        <img src="${bundleItem.image}" alt="${escapeHtml(bundleItemTitle)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
      </div>
      <div class="bundle-details" style="flex: 1; min-width: 250px;">
        <p style="font-size: 1.05rem; margin-bottom: 8px;">
          <strong>${t.cart_subtotal || "Total"}:</strong> <span id="bundleTotalPrice" style="color: #b12704; font-size: 1.25rem; font-weight: bold;">${money(total)}</span>
        </p>
        <div style="font-size: 0.9rem; color: #333; margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px;"><input type="checkbox" checked disabled /> <strong>${t.val_this_item || "This item:"}</strong> <span class="this-item-title">${escapeHtml(mainTitle)}</span> (${money(product.price)})</label>
          <label style="display: block;"><input type="checkbox" id="bundleAccCheckbox" checked /> <span class="bundle-item-title">${escapeHtml(bundleItemTitle)}</span> (${money(bundleItem.price)})</label>
        </div>
        <button type="button" id="addBundleBtn" class="primary-btn amazon-btn-cart" style="background: #ffd814; border: 1px solid #fcd200; border-radius: 20px; padding: 8px 18px; font-weight: 600; cursor: pointer;">
          ${t.add_both_to_cart || "Add both to Cart"}
        </button>
      </div>
    </div>
  `;
  container.hidden = false;

  const btn = document.getElementById("addBundleBtn");
  const chk = document.getElementById("bundleAccCheckbox");
  const totalEl = document.getElementById("bundleTotalPrice");

  if (chk && totalEl) {
    chk.addEventListener("change", () => {
      const isChecked = chk.checked;
      const currentTotal = isChecked ? (Number(product.price || 0) + Number(bundleItem.price || 0)) : Number(product.price || 0);
      totalEl.textContent = money(currentTotal);
      if (btn) {
        btn.textContent = isChecked ? (t.add_both_to_cart || "Add both to Cart") : (t.add_to_cart || "Add to Cart");
      }
    });
  }

  if (btn) {
    btn.onclick = () => {
      addProductToCart(product.id, 1);
      if (chk && chk.checked) {
        addProductToCart(bundleItem.id, 1);
      }
      syncCartCount();
      btn.textContent = t.cart_success_added || "Added to Cart!";
      setTimeout(() => {
        btn.textContent = (chk && chk.checked) ? (t.add_both_to_cart || "Add both to Cart") : (t.add_to_cart || "Add to Cart");
      }, 2000);
    };
  }
}


let activeRenderedProduct = null;
function renderProductHeader(product) {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const localizedTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : (product.title || product.name || "")).trim();
  const titleEl = document.getElementById("productName") || document.getElementById("productTitle") || document.querySelector("h2.product-title") || document.querySelector("h1.product-title");
  if (titleEl) titleEl.textContent = localizedTitle;
  const breadcrumbTitle = document.getElementById("crumbName") || document.getElementById("breadcrumbProductTitle");
  if (breadcrumbTitle) breadcrumbTitle.textContent = localizedTitle;
  const bundleTitle = document.querySelector(".this-item-title") || document.getElementById("bundleMainTitle");
  if (bundleTitle) bundleTitle.textContent = localizedTitle;
  document.title = localizedTitle + " - ElectroMart";
  if (productImage) productImage.alt = localizedTitle;
}
window.renderProductHeader = renderProductHeader;
function renderProduct(product) {
  activeRenderedProduct = product;
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.EM_TRANSLATIONS ? window.EM_TRANSLATIONS.en : {});
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
  const localizedTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : (product.title || product.name || "")).trim();
  const localizedDesc = (window.getLocalizedDescription ? window.getLocalizedDescription(product, currentLang) : "").trim();
  const localizedSpecs = window.getLocalizedSpecs ? window.getLocalizedSpecs(product, currentLang) : [];

  productImage.alt = localizedTitle;
  productImage.onerror = function() {
    this.onerror = null;
    this.src = FALLBACK_IMAGE_URL;
  };
  productName.textContent = localizedTitle;
  
  // 1. Localized Breadcrumb
  const breadcrumbEl = document.getElementById("productBreadcrumb");
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `<a href="products.html" data-i18n="breadcrumb_products">${t.breadcrumb_products || "Products"}</a> &gt; <span id="crumbName">${escapeHtml(localizedTitle)}</span>`;
  }
  renderProductHeader(product);

  // 2. Localized Brand & Store Link
  productBrand.textContent = `${t.brand_label || "Brand:"} ${product.brand}`;
  const cleanVisitStore = String(t.visit_store_prefix || "Store").replace(/:\s*$/, "").trim();
  const brandStoreText = (currentLang === "en")
    ? `Visit the ${product.brand} Store`
    : `${product.brand} ${cleanVisitStore}`.replace(/:\s*$/, "").trim();
  brandStoreLink.textContent = brandStoreText;
  brandStoreLink.href = `brands.html?brand=${encodeURIComponent(String(product.brand || "").trim())}`;
  const productBrandRow = document.getElementById("productBrandRow");
  if (productBrandRow) {
    productBrandRow.innerHTML = `<a id="brandStoreLink" href="brands.html?brand=${encodeURIComponent(String(product.brand || "").trim())}" class="brand-store-link">${brandStoreText}</a>`;
  }
function renderStarCharacters(rating) {
  const r = Math.max(0, Math.min(5, Number(rating || 0)));
  const full = Math.floor(r);
  const half = r - full >= 0.25 && r - full < 0.75 ? 1 : 0;
  const roundedFull = r - full >= 0.75 ? full + 1 : full;
  const empty = 5 - roundedFull - half;
  return "\u2605".repeat(roundedFull) + (half ? "\u25D0" : "") + "\u2606".repeat(Math.max(0, empty));
}

  const starChars = renderStarCharacters(product.rating);
  const reviewCount = Number(product.reviewCount || 480);
  productRating.innerHTML = `
    <span class="rating-stars-display" style="color: #de7921; font-size: 1.1rem; letter-spacing: 1px;">${starChars}</span>
    <span class="rating-value-text" style="font-weight: 700; margin: 0 6px; color: #0f1111;">${Number(product.rating || 0).toFixed(1)}</span>
    <a href="#reviewsBlock" class="rating-count-link" style="color: #007185; text-decoration: none; font-size: 0.95rem;">${reviewCount.toLocaleString("en-IN")} ${t.ratings_label || "ratings"}</a>
  `;
  const choiceBadge = document.getElementById("amazonsChoiceBadge");
  if (choiceBadge) {
    const isChoice = Number(product.rating || 0) >= 4.3 || Boolean(product.featured);
    choiceBadge.style.display = isChoice ? "inline-flex" : "none";
  }
  const socialBought = document.getElementById("socialBoughtCount");
  if (socialBought) {
    socialBought.textContent = t.bought_in_past_month || "1K+ bought in past month";
  }
  const price = Number(product.price || 0);
  const listPrice = Number(product.listPrice || product.price || 0);
  const discountPercent = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const hasStockValue = Number.isFinite(Number(product.stock));
  const stockCount = hasStockValue ? Number(product.stock) : null;
  const isInStock = stockCount == null || stockCount > 0;
  productPrice.textContent = money(price);
  buyBoxPrice.textContent = money(price);
  productListPrice.textContent = listPrice > price ? `M.R.P.: ${money(listPrice)}` : "";
  if (productDealMeta) {
    productDealMeta.textContent = "";
    productDealMeta.style.display = "none";
  }
  renderAmazonPrice(product, price, listPrice, discountPercent, t);
  buyBoxMrp.textContent = listPrice > price ? `M.R.P.: ${money(listPrice)}` : "";
  buyBoxSavings.textContent = discountPercent > 0 ? `${t.you_save || "Save"} ${money(listPrice - price)} (${discountPercent}% off)` : "";
  productSegment.textContent = product.segment;
  const fallbackDescription = `Explore ${localizedTitle} for ${product.category} needs with trusted performance and reliable support.`;
  const descriptionRaw = String(localizedDesc || product.description || "").trim();
  if (!descriptionRaw || descriptionRaw.includes("I'm a product description")) {
    productDescription.textContent = localizedDesc || fallbackDescription;
  } else if (/<[a-z][\s\S]*>/i.test(descriptionRaw) || /&[a-z]+;/i.test(descriptionRaw)) {
    const sanitized = descriptionRaw
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
    productDescription.innerHTML = sanitized;
  } else {
    productDescription.textContent = localizedDesc || descriptionRaw;
  }
  const statusUpper = String(product.status || "active").toUpperCase();
  const statusMap = {
    ACTIVE: t.val_active || "सक्रिय",
    INACTIVE: t.val_inactive || "निष्क्रिय"
  };
  const metaRow = document.getElementById("productQuickMeta") || productStockMeta;
  if (metaRow) {
    metaRow.innerHTML = `${t.tbl_stock || "उपलब्ध स्टॉक"}: ${stockCount == null ? (t.val_available || "उपलब्ध") : stockCount} | ${t.tbl_status || "स्थिति"}: ${statusMap[statusUpper] || statusUpper} | ${t.tbl_fulfillment || "फुलफिलमेंट"}: ${String(product.fulfillment || "fbm").toUpperCase()}`;
  }
  if (productKeywordLine) {
    productKeywordLine.style.display = "none";
  }
  // Amazon Style Dynamic Delivery Date & Location
  const deliveryDateHighlight = document.getElementById("deliveryDateHighlight");
  if (deliveryDateHighlight) {
    const d = new Date();
    d.setDate(d.getDate() + (product.segment === "b2c" ? 1 : 2));
    try {
      const formattedDate = d.toLocaleDateString(currentLang === "hi" ? "hi-IN" : "en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
      deliveryDateHighlight.textContent = formattedDate;
    } catch (e) {
      deliveryDateHighlight.textContent = "Tomorrow";
    }
  }

  const updateBuyboxLocation = (city, postal) => {
    if (!buyboxLocText) return;
    const locPrefix = currentLang === "hi" ? "डिलीवरी: " : "Deliver to ";
    if (city && postal) {
      buyboxLocText.textContent = `${locPrefix} ${city} ${postal}`;
    } else if (postal) {
      buyboxLocText.textContent = `${locPrefix} ${postal}`;
    } else {
      buyboxLocText.textContent = `${locPrefix} New Delhi 110001`;
    }
  };

  const buyboxLocText = document.getElementById("buyboxLocationText");
  if (buyboxLocText) {
    let savedLoc = null;
    try {
      const raw = localStorage.getItem("electromart_delivery_location");
      savedLoc = raw ? JSON.parse(raw) : null;
    } catch (e) {}
    const savedPin = savedLoc?.postal || (typeof localStorage !== "undefined" && localStorage.getItem("electromart_delivery_pincode")) || "";
    const savedCity = savedLoc?.city || "";
    updateBuyboxLocation(savedCity, savedPin);
  }

  const buyboxLocLink = document.getElementById("buyboxLocationLink");
  if (buyboxLocLink && !buyboxLocLink._bound) {
    buyboxLocLink._bound = true;
    buyboxLocLink.addEventListener("click", (e) => {
      if (e) e.preventDefault();
      if (typeof window.openLocationModal === "function") {
        window.openLocationModal();
      } else {
        const trigger = document.getElementById("locationTrigger");
        if (trigger) trigger.click();
      }
    });
  }

  if (!window._buyboxLocEventBound) {
    window._buyboxLocEventBound = true;
    window.addEventListener("electromart:locationChanged", (e) => {
      const detail = e && e.detail;
      if (detail) {
        updateBuyboxLocation(detail.city, detail.postal);
      }
    });
  }

  deliveryText.textContent = product.segment === "b2c" ? (t.free_delivery_tomorrow || "FREE delivery by tomorrow") : "Business delivery options available";
  const taxInfoEl = document.getElementById("taxInfo");
  if (taxInfoEl) {
    taxInfoEl.textContent = t.inclusive_all_taxes || "Inclusive of all taxes";
  }
  const buyBoxMeta = document.getElementById("buyBoxMetaDetails");
  if (buyBoxMeta) {
    buyBoxMeta.innerHTML = `
      <div class="meta-row" style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 4px; color: #565959;">
        <span>${t.ships_from || "Ships from:"}</span> <strong style="color: #0f1111;">ElectroMart</strong>
      </div>
      <div class="meta-row" style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 4px; color: #565959;">
        <span>${t.sold_by || "Sold by:"}</span> <strong style="color: #0f1111;">${product.brand || "ElectroMart"} Retail</strong>
      </div>
      <div class="meta-row" style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-top: 4px; color: #565959;">
        <span>${t.returns_label || "Returns:"}</span> <strong style="color: #007185;">${t.returns_period || "7 days Replacement"}</strong>
      </div>
      <div class="meta-row" style="font-size: 0.85rem; margin-top: 4px; color: #007185;">
        <span>${t.payment_secure || "Payment: Secure transaction"}</span>
      </div>
    `;
  }
  availabilityText.textContent = isInStock
    ? (product.segment === "b2c" ? (t.in_stock || "In Stock") : `${t.in_stock || "In Stock"} (B2B)`)
    : (t.out_of_stock || "Currently unavailable");
  const stockEl = document.querySelector(".stock-status");
  if (stockEl && isInStock) {
    stockEl.textContent = t.in_stock || "In Stock";
  }
  availabilityText.classList.toggle("in-stock", isInStock);
  addToCartBtn.disabled = !isInStock;
  addToCartBtn.textContent = isInStock ? (t.add_to_cart || "Add to Cart") : (t.out_of_stock || "Out of Stock");
  setBackInStockPanelState(product, isInStock);
  if (crumbName) {
    crumbName.textContent = localizedTitle;
  }
  const productCategoryFamily = getProductCategoryFamily(product);
  renderOffers(price, listPrice, productCategoryFamily);
  renderFrequentlyBoughtTogether(product, t);
  renderServices(product, isInStock);
  renderReviewSummary(product);
  renderQa(product);

  renderRecentlyViewedDetailSection();

  const isBattery = /\b(battery|बैटरी)\b/i.test(String(product.name || "") + " " + String(product.title || "") + " " + String(product.category || "") + " " + String(product.sku || ""));
  
  const batteryFallbackSpecs = currentLang === "hi" ? [
    "प्रीमियम ग्रेड लिथियम-आयन लैपटॉप बैटरी",
    "सटीक फिटिंग और ओवर-चार्जिंग प्रोटेक्शन सर्किट",
    "लंबे समय तक चलने वाली बैटरी लाइफ और तेज़ चार्जिंग सपोर्ट",
    "1 वर्ष की निर्माता वारंटी और रिप्लेसमेंट सपोर्ट"
  ] : [
    "Premium grade Lithium-ion laptop battery",
    "Precision fit with over-charging protection circuit",
    "Long battery life and fast charging support",
    "1 Year manufacturer warranty and replacement support"
  ];

  const rawKeywords = Array.isArray(product.keywords) ? product.keywords.map(k => String(k || "").trim().toLowerCase()) : [];
  const candidateSpecs = (Array.isArray(localizedSpecs) && localizedSpecs.length) ? localizedSpecs : (Array.isArray(product.aboutSpecs) ? product.aboutSpecs : []);
  
  const cleanSpecs = candidateSpecs.filter(spec => {
    const s = String(spec || "").replace(/^[-•\s]+/, "").trim().toLowerCase();
    if (!s) return false;
    if (rawKeywords.includes(s)) return false;
    if (["laptop battery", "lenovo laptop battery", "lenovo store"].includes(s)) return false;
    return true;
  });

  let finalSpecs = [];
  if (cleanSpecs.length > 0) {
    finalSpecs = cleanSpecs;
  } else if (isBattery) {
    finalSpecs = batteryFallbackSpecs;
  } else {
    finalSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];
  }

  productSpecs.innerHTML = finalSpecs.map((spec) => `<li>${localizeSpec(spec, t)}</li>`).join("");
  
  const bulletMap = {
    "High performance processor": t.spec_high_performance || "उच्च प्रदर्शन प्रोसेसर",
    "SSD storage": t.spec_ssd_storage || "एसएसडी स्टोरेज",
    "Long battery life": t.spec_battery_life || "लंबी बैटरी लाइफ",
    "Mobile and Wearable Tech": t.spec_mobile_wearable || "मोबाइल और वियरेबल तकनीक",
    "Water resistant IP68": t.spec_water_resistant || "वॉटर रेसिस्टेंट IP68",
    "Up to 7 days battery life": t.spec_battery_7days || "7 दिनों तक की बैटरी लाइफ",
    "Premium grade Lithium-ion laptop battery": "प्रीमियम ग्रेड लिथियम-आयन लैपटॉप बैटरी",
    "Precision fit with over-charging protection circuit": "सटीक फिटिंग और ओवर-चार्जिंग प्रोटेक्शन सर्किट",
    "Extended battery life and fast-charging support": "लंबे समय तक चलने वाली बैटरी लाइफ और तेज़ चार्जिंग सपोर्ट",
    "Long battery life and fast charging support": "लंबे समय तक चलने वाली बैटरी लाइफ और तेज़ चार्जिंग सपोर्ट",
    "1 Year manufacturer warranty and replacement support": "1 वर्ष की निर्माता वारंटी और रिप्लेसमेंट सपोर्ट"
  };
  document.querySelectorAll("#productSpecs li, #aboutItemBulletList li").forEach((li) => {
    const text = String(li && li.textContent || "").trim();
    if (bulletMap[text]) li.textContent = bulletMap[text];
  });

  renderProductInfoTable(product, stockCount, productCategoryFamily, price, listPrice);

  addToCartBtn.setAttribute("data-id", String(product.id));
  syncWishlistButton(product.id);
  syncCompareButton(product.id);
  void hydrateRelatedProducts(product);

  // Phase 29: 360 Showroom & Virtual Workspace Studio Link Sync
  const btn360 = document.getElementById("btnPdp360Showroom");
  if (btn360) {
    btn360.href = `showroom.html?productId=${encodeURIComponent(product.id)}`;
  }
  const linkWorkspace = document.getElementById("linkPdpWorkspaceBuilder");
  if (linkWorkspace) {
    linkWorkspace.href = `workspace-builder.html?computeId=${encodeURIComponent(product.id)}`;
  }

  localizeBatterySpecs();
}

function localizeBatterySpecs() {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  if (currentLang !== "hi") return;
  const specTranslations = [
    { en: /Capacity:\s*/gi, hi: "क्षमता: " },
    { en: /Voltage:\s*/gi, hi: "वोल्टेज: " },
    { en: /Number of cells?:\s*/gi, hi: "सेल की संख्या: " },
    { en: /Warranty Details:\s*/gi, hi: "वारंटी विवरण: " },
    { en: /1\s*Year\s+warranty\.?/gi, hi: "1 वर्ष की वारंटी।" },
    { en: /12-months replacement warranty\.?/gi, hi: "12 महीने की रिप्लेसमेंट वारंटी।" },
    { en: /Quality Lenovo(?:\s|&nbsp;)+Yoga(?:\s|&nbsp;)+Battery/gi, hi: "उच्च गुणवत्ता वाली लेनोवो योगा बैटरी" },
    { en: /Quality\s+Lenovo(?:\s|&nbsp;)+[A-Z0-9\.\s]+(?:\s|&nbsp;)+Battery/gi, hi: "उच्च गुणवत्ता वाली लेनोवो बैटरी" },
    { en: /6 Months to 1 Year standard brand warranty\.?/gi, hi: "6 महीने से 1 वर्ष की मानक ब्रांड वारंटी।" },
    { en: /1 Year brand warranty with replacement support\.?/gi, hi: "1 वर्ष की ब्रांड वारंटी और रिप्लेसमेंट सपोर्ट।" },
    { en: /100%\s*compatible\s+with\s+your\s+(?:Lenovo\s+)?laptop/gi, hi: "आपके लैपटॉप के साथ 100% संगत" },
    { en: /identical size, including all electronic safety measures\.?/gi, hi: "सटीक आकार, सभी इलेक्ट्रॉनिक सुरक्षा मानकों सहित।" },
    { en: /identical size, including all safety measures\.?/gi, hi: "सटीक आकार, सभी सुरक्षा मानकों सहित।" },
    { en: /Highly Compatible(?:\s|&nbsp;)+[A-Za-z0-9\s]+?Battery for\s*/gi, hi: "अत्यधिक संगत बैटरी: " },
    { en: /Highly Compatible battery for\s*/gi, hi: "अत्यधिक संगत बैटरी: " },
    { en: /Highly Compatible for Lenovo 45N1704 battery for ThinkPad YOGA S1-S240 Laptops\.?/gi, hi: "ThinkPad YOGA S1-S240 लैपटॉप के लिए Lenovo 45N1704 बैटरी के साथ पूर्ण संगत।" },
    { en: /Compatible Part Numbers:\s*/gi, hi: "संगत पार्ट नंबर: " },
    { en: /Compatible with Laptop Models:\s*/gi, hi: "लैपटॉप मॉडल के साथ संगत: " },
    { en: /Package Content:\s*/gi, hi: "पैकेज सामग्री: " },
    { en: /Battery Use Tip:\s*/gi, hi: "बैटरी उपयोग टिप्स: " }
  ];

  const batteryPhrases = {
    "Number of cell:": "सेल की संख्या:",
    "Number of cells:": "सेल की संख्या:",
    "identical size, including all electronic safety measures.": "सटीक आकार, सभी इलेक्ट्रॉनिक सुरक्षा मानकों सहित।",
    "identical size, including all safety measures.": "सटीक आकार, सभी सुरक्षा मानकों सहित।",
    "Compatible with Laptop Models:": "लैपटॉप मॉडल के साथ संगत:",
    "Package Content:": "पैकेज सामग्री:",
    "Battery Use Tip:": "बैटरी उपयोग टिप्स:"
  };

  document.querySelectorAll(".product-key-features li, .product-description-block p, .product-description-block div, .service-item p, #productSpecs li, #aboutItemBulletList li, #productDescription li, #productDescription p, #productDescription, #productDescription div").forEach((el) => {
    let html = el.innerHTML;
    let modified = false;

    Object.keys(batteryPhrases).forEach(enKey => {
      if (html.includes(enKey)) {
        html = html.replaceAll(enKey, batteryPhrases[enKey]);
        modified = true;
      }
    });

    specTranslations.forEach((rule) => {
      if (rule.en.test(html)) {
        html = html.replace(rule.en, rule.hi);
        modified = true;
      }
    });
    if (modified) {
      el.innerHTML = html;
    }
  });

  // Remove any dummy keyword bullets from specs lists
  document.querySelectorAll("#productSpecs li, #aboutItemBulletList li").forEach((li) => {
    const txt = (li.textContent || "").replace(/^[-•\s]+/, "").trim().toLowerCase();
    if (["laptop battery", "lenovo laptop battery", "lenovo store"].includes(txt)) {
      li.remove();
    }
  });

  // Ensure authentic battery bullets if list became empty for battery products
  const specList = document.querySelector("#productSpecs") || document.querySelector("#aboutItemBulletList");
  if (specList && (!specList.children || specList.children.length === 0) && (!specList.innerHTML || !specList.innerHTML.trim())) {
    const isBatteryProduct = (document.title || "").includes("बैटरी") || (document.title || "").includes("Battery") || /battery/i.test(window.location?.search || "");
    if (isBatteryProduct) {
      specList.innerHTML = `
        <li>प्रीमियम ग्रेड लिथियम-आयन लैपटॉप बैटरी</li>
        <li>सटीक फिटिंग और ओवर-चार्जिंग प्रोटेक्शन सर्किट</li>
        <li>लंबे समय तक चलने वाली बैटरी लाइफ और तेज़ चार्जिंग सपोर्ट</li>
        <li>1 वर्ष की निर्माता वारंटी और रिप्लेसमेंट सपोर्ट</li>
      `;
    }
  }

  const kwRow = document.querySelector(".keywords-row") || document.getElementById("productKeywordLine");
  if (kwRow) {
    kwRow.style.display = "none";
  }
}
window.localizeBatterySpecs = localizeBatterySpecs;

async function loadProductSafely(productId) {
  let product = null;
  const rawId = String(productId || "").trim();

  // 1. Direct match in local catalog map / list (EM_CATALOG)
  if (rawId) {
    const emMap = window.EM_CATALOG_MAP || {};
    const emList = window.EM_CATALOG || [];
    const directMatch = emMap[rawId] || emList.find((p) => String(p.id) === rawId);
    if (directMatch) {
      product = mapApiProduct(directMatch);
    }
  }

  // 2. Local product resolver (localStorage cache or static products)
  if (!product && rawId) {
    product = getLocalProductById(rawId);
  }

  // 3. API product lookup
  if (rawId) {
    try {
      const apiProduct = await fetchProductFromApi(rawId);
      if (apiProduct) {
        product = product ? mergeProductSources(apiProduct, product) : apiProduct;
      }
    } catch (_) {}
  }

  // 4. Fallback if product is null or incomplete
  const isComplete = (p) => p && p.id && (p.name || p.title) && p.price != null;
  if (!isComplete(product)) {
    const catalog = window.EM_CATALOG || [];
    if (catalog.length > 0) {
      product = mapApiProduct(catalog[0]);
    } else if (allProducts && allProducts.length > 0) {
      product = mapApiProduct(allProducts[0]);
    }
  }

  return product;
}
window.loadProductSafely = loadProductSafely;

async function initProductPage() {
  const productId = getProductIdFromUrl();
  const selectedProduct = await loadProductSafely(productId);
  if (!selectedProduct) {
    if (missingState) missingState.hidden = false;
    if (productDetail) productDetail.hidden = true;
    return;
  }

  if (missingState) missingState.hidden = true;

  if (window.EM_CATALOG_MAP && selectedProduct.id && !window.EM_CATALOG_MAP[String(selectedProduct.id)]) {
    window.EM_CATALOG_MAP[String(selectedProduct.id)] = selectedProduct;
  }

  window.currentLoadedProduct = selectedProduct;
  renderProduct(selectedProduct);
  if (productDetail) productDetail.hidden = false;
}

addToCartBtn.addEventListener("click", () => {
  const productId = String(addToCartBtn.getAttribute("data-id") || "").trim();
  const qty = Number(qtySelect ? qtySelect.value : 1);
  const addQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
  if (productId) {
    addProductToCart(productId, addQty);

    const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
    const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
    const origText = addToCartBtn.textContent;
    addToCartBtn.classList.add("btn-added");
    addToCartBtn.textContent = t.cart_added_feedback || (currentLang === "hi" ? "✓ कार्ट में जोड़ा गया" : "✓ Added to Cart");
    setTimeout(() => {
      addToCartBtn.classList.remove("btn-added");
      addToCartBtn.textContent = origText;
    }, 1500);

    const currentProd = window.currentLoadedProduct || (typeof activeRenderedProduct !== "undefined" ? activeRenderedProduct : null);
    const flyoutPayload = currentProd ? { ...currentProd, qty: addQty } : { id: productId, qty: addQty };
    if (typeof window.openCartFlyout === "function") {
      window.openCartFlyout(flyoutPayload);
    } else {
      window.dispatchEvent(new CustomEvent("electromart:itemAddedToCart", { detail: flyoutPayload }));
    }

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("cart:updated"));
    }
  }
});

const buyNowBtn = document.querySelector(".buy-now-btn");
if (buyNowBtn) {
  buyNowBtn.addEventListener("click", () => {
    const productId = String(addToCartBtn.getAttribute("data-id") || "").trim();
    const qty = Number(qtySelect ? qtySelect.value : 1);
    const addQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
    if (productId) {
      addProductToCart(productId, addQty);
    }
  });
}

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

if (compareBtn) {
  compareBtn.addEventListener("click", () => {
    const productId = String(compareBtn.getAttribute("data-id") || "").trim();
    if (!productId) {
      return;
    }
    toggleCompare(productId);
    syncCompareButton(productId);
    const count = loadCompareIds().length;
    const message = count > 1
      ? `${count} products ready for comparison. View in compare cart for side-by-side details.`
      : `${count} product selected for comparison. Select at least 2 to compare.`;
    console.info(message);
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


window.renderProductDetailPage = function(prod) {
  const target = (prod && typeof prod === "object") ? prod : (window.currentLoadedProduct || activeRenderedProduct);
  if (target) {
    renderProduct(target);
  }
};


// 1. Global Language State Auto-Read on Page Load
document.addEventListener("DOMContentLoaded", () => {
  const currentLang = localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi";
  if (typeof applyFullPageTranslation === "function") {
    applyFullPageTranslation(currentLang);
  }
  if (typeof renderProductDetailPage === "function" && (window.currentLoadedProduct || activeRenderedProduct)) {
    renderProductDetailPage(window.currentLoadedProduct || activeRenderedProduct);
  }
  if (typeof localizeBatterySpecs === "function") {
    localizeBatterySpecs();
  }
});

window.addEventListener("languageChanged", () => {
  const currentProd = window.currentLoadedProduct || (typeof activeRenderedProduct !== "undefined" ? activeRenderedProduct : null);
  if (currentProd && typeof renderAmazonPrice === "function") {
    renderAmazonPrice(currentProd);
  }
  if (typeof localizeBatterySpecs === "function") {
    localizeBatterySpecs();
  }
});
