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
    status: "active",
    createdAt: "2026-03-05T14:47:19.204Z",
    updatedAt: "2026-03-05T14:47:19.204Z"
  }
];

const b2cProductGrid = document.getElementById("b2cProductGrid");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const b2cResultMeta = document.getElementById("b2cResultMeta");
const cartCount = document.getElementById("cartCount");
const searchForm = document.getElementById("searchForm");
const megaTrigger = document.getElementById("megaTrigger");
const megaMenu = document.getElementById("megaMenu");
const storeGrid = document.getElementById("storeGrid");
const newArrivalsGrid = document.getElementById("newArrivalsGrid");
const newArrivalsMeta = document.getElementById("newArrivalsMeta");
const topRatedGrid = document.getElementById("topRatedGrid");
const recommendedGrid = document.getElementById("recommendedGrid");
const recentlyViewedSection = document.getElementById("recentlyViewedSection");
const recentlyViewedGrid = document.getElementById("recentlyViewedGrid");
const heroTrack = document.getElementById("heroTrack");
const heroDots = document.getElementById("heroDots");
const heroPrev = document.getElementById("heroPrev");
const heroNext = document.getElementById("heroNext");
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
const languageSelect = document.getElementById("languageSelect");
const locationTrigger = document.getElementById("locationTrigger");
const deliveryLocationText = document.getElementById("deliveryLocationText");
const locationModal = document.getElementById("locationModal");
const locationCity = document.getElementById("locationCity");
const locationPostal = document.getElementById("locationPostal");
const locationCancel = document.getElementById("locationCancel");
const locationSave = document.getElementById("locationSave");
const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const LOCATION_STORAGE_KEY = "electromart_location_v1";
const LANGUAGE_STORAGE_KEY = "electromart_lang_v1";
const WISHLIST_STORAGE_KEY = "electromart_wishlist_v1";
const RECENTLY_VIEWED_STORAGE_KEY = "electromart_recently_viewed_v1";
const SEARCH_HISTORY_STORAGE_KEY = "electromart_search_history_v1";
const HOME_MAIN_LIST_LIMIT = 12;
const HOME_NEW_ARRIVALS_LIMIT = 6;
const HOME_CURATED_LIST_LIMIT = 4;
const FALLBACK_IMAGE_URL = "./product-placeholder.svg";

let cart = 0;
let currentLang = "en";
let heroSlides = [];
let currentHeroIndex = 0;
let heroAutoplayTimer = 0;
let currentQuickViewProductId = "";
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const stores = [
  { id: 1, cityKey: "stores.ny.city", addressKey: "stores.ny.address", hoursKey: "stores.ny.hours", phone: "+91 11 4100 1200" },
  { id: 2, cityKey: "stores.la.city", addressKey: "stores.la.address", hoursKey: "stores.la.hours", phone: "+91 22 4100 1300" },
  { id: 3, cityKey: "stores.chi.city", addressKey: "stores.chi.address", hoursKey: "stores.chi.hours", phone: "+91 80 4100 1400" }
];

const translations = {
  en: {
    "header.deliverTo": "Deliver to",
    "header.searchPlaceholder": "Search electronics",
    "header.searchBtn": "Search",
    "header.language": "Language",
    "location.title": "Choose your location",
    "location.subtitle": "Select a delivery location to see product availability and delivery options.",
    "location.cityLabel": "City",
    "location.postalLabel": "PIN code",
    "location.postalPlaceholder": "110001",
    "location.cancel": "Cancel",
    "location.save": "Save location",
    "nav.account": "Account",
    "nav.orders": "Orders",
    "nav.cart": "Cart",
    "category.allDepartments": "All Departments",
    "category.deals": "Today's Deals",
    "category.bestSellers": "Best Sellers",
    "category.gaming": "Gaming",
    "category.homeOffice": "Home Office",
    "category.smartHome": "Smart Home",
    "category.stores": "Stores",
    "category.customerService": "Customer Service",
    "category.giftCards": "Gift Cards",
    "mega.computers": "Computers",
    "mega.laptops": "Laptops",
    "mega.desktops": "Desktops",
    "mega.monitors": "Monitors",
    "mega.storage": "Storage",
    "mega.mobile": "Mobile",
    "mega.smartphones": "Smartphones",
    "mega.tablets": "Tablets",
    "mega.wearables": "Wearables",
    "mega.chargers": "Chargers",
    "mega.audioVideo": "Audio & Video",
    "mega.headphones": "Headphones",
    "mega.speakers": "Speakers",
    "mega.tvTheater": "TV & Home Theater",
    "mega.microphones": "Microphones",
    "mega.featuredDeal": "Featured Deal",
    "mega.productTitle": "Wireless Earbuds Pro",
    "mega.priceNow": "Now ₹79",
    "mega.seeOffer": "See offer",
    "hero.event": "Mega Electronics Sale",
    "hero.headline": "Up to 60% off on laptops, mobiles and accessories",
    "hero.shopNow": "Shop now",
    "quick.homeEntertainment": "Home Entertainment",
    "quick.homeEntertainmentDesc": "4K TVs, soundbars, and streaming gear.",
    "quick.gamingZone": "Gaming Zone",
    "quick.gamingZoneDesc": "Consoles, RGB accessories, and pro headsets.",
    "quick.workFromHome": "Work From Home",
    "quick.workFromHomeDesc": "Monitors, webcams, keyboards, and office sets.",
    "quick.mobileEssentials": "Mobile Essentials",
    "quick.mobileEssentialsDesc": "Phones, chargers, cases, and power banks.",
    "products.sectionTitle": "Product Listings",
    "products.b2cTitle": "B2C Products",
    "products.b2bTitle": "B2B Products",
    "products.showing": "Showing",
    "products.b2cListLabel": "B2C products",
    "products.b2bListLabel": "B2B products",
    "products.addToCart": "Add to Cart",
    "products.bulkMin": "Min order",
    "stores.title": "Our Stores",
    "stores.subtitle": "Visit a nearby ElectroMart location",
    "stores.visit": "Visit Store",
    "stores.ny.city": "New Delhi Flagship",
    "stores.ny.address": "Nehru Place, New Delhi, Delhi",
    "stores.ny.hours": "Open: 10 AM - 9 PM",
    "stores.la.city": "Mumbai Central",
    "stores.la.address": "Lamington Road, Mumbai, Maharashtra",
    "stores.la.hours": "Open: 10 AM - 9 PM",
    "stores.chi.city": "Bengaluru Tech Hub",
    "stores.chi.address": "SP Road, Bengaluru, Karnataka",
    "stores.chi.hours": "Open: 10 AM - 9 PM",
    "footer.backToTop": "Back to top",
    "footer.getToKnowUs": "Get to Know Us",
    "footer.about": "About",
    "footer.careers": "Careers",
    "footer.press": "Press",
    "footer.makeMoney": "Make Money with Us",
    "footer.sellProducts": "Sell Products",
    "footer.affiliate": "Become an Affiliate",
    "footer.advertise": "Advertise",
    "footer.help": "Help",
    "footer.yourAccount": "Your Account",
    "footer.shippingRates": "Shipping Rates",
    "footer.returns": "Returns",
    "footer.copyright": "© 2026 ElectroMart clone experience",
    "categoryFilter.all": "All",
    "categoryFilter.laptop": "Laptops",
    "categoryFilter.mobile": "Mobiles",
    "categoryFilter.audio": "Audio",
    "categoryFilter.accessory": "Accessories"
  },
  hi: {
    "header.deliverTo": "पहुंचाएं",
    "header.searchPlaceholder": "इलेक्ट्रॉनिक्स खोजें",
    "header.searchBtn": "खोजें",
    "header.language": "भाषा",
    "location.title": "अपना स्थान चुनें",
    "location.subtitle": "उत्पाद उपलब्धता और डिलीवरी विकल्प देखने के लिए डिलीवरी स्थान चुनें।",
    "location.cityLabel": "शहर",
    "location.postalLabel": "पिन कोड",
    "location.postalPlaceholder": "110001",
    "location.cancel": "रद्द करें",
    "location.save": "स्थान सेव करें",
    "nav.account": "अकाउंट",
    "nav.orders": "ऑर्डर",
    "nav.cart": "कार्ट",
    "category.allDepartments": "सभी विभाग",
    "category.deals": "आज के ऑफर",
    "category.bestSellers": "बेस्ट सेलर",
    "category.gaming": "गेमिंग",
    "category.homeOffice": "होम ऑफिस",
    "category.smartHome": "स्मार्ट होम",
    "category.stores": "स्टोर्स",
    "category.customerService": "कस्टमर सर्विस",
    "category.giftCards": "गिफ्ट कार्ड",
    "mega.computers": "कंप्यूटर",
    "mega.laptops": "लैपटॉप",
    "mega.desktops": "डेस्कटॉप",
    "mega.monitors": "मॉनिटर",
    "mega.storage": "स्टोरेज",
    "mega.mobile": "मोबाइल",
    "mega.smartphones": "स्मार्टफोन",
    "mega.tablets": "टैबलेट",
    "mega.wearables": "वेयरेबल",
    "mega.chargers": "चार्जर",
    "mega.audioVideo": "ऑडियो और वीडियो",
    "mega.headphones": "हेडफोन",
    "mega.speakers": "स्पीकर",
    "mega.tvTheater": "टीवी और होम थिएटर",
    "mega.microphones": "माइक्रोफोन",
    "mega.featuredDeal": "विशेष ऑफर",
    "mega.productTitle": "वायरलेस ईयरबड्स प्रो",
    "mega.priceNow": "अब ₹79",
    "mega.seeOffer": "ऑफर देखें",
    "hero.event": "मेगा इलेक्ट्रॉनिक्स सेल",
    "hero.headline": "लैपटॉप, मोबाइल और एक्सेसरी पर 60% तक की छूट",
    "hero.shopNow": "अभी खरीदें",
    "quick.homeEntertainment": "होम एंटरटेनमेंट",
    "quick.homeEntertainmentDesc": "4K टीवी, साउंडबार और स्ट्रीमिंग गियर।",
    "quick.gamingZone": "गेमिंग ज़ोन",
    "quick.gamingZoneDesc": "कंसोल, RGB एक्सेसरी और प्रो हेडसेट।",
    "quick.workFromHome": "वर्क फ्रॉम होम",
    "quick.workFromHomeDesc": "मॉनिटर, वेबकैम, कीबोर्ड और ऑफिस सेट।",
    "quick.mobileEssentials": "मोबाइल जरूरी सामान",
    "quick.mobileEssentialsDesc": "फोन, चार्जर, कवर और पावर बैंक।",
    "products.sectionTitle": "प्रोडक्ट लिस्टिंग",
    "products.b2cTitle": "B2C प्रोडक्ट",
    "products.b2bTitle": "B2B प्रोडक्ट",
    "products.showing": "दिखा रहे हैं",
    "products.b2cListLabel": "B2C प्रोडक्ट",
    "products.b2bListLabel": "B2B प्रोडक्ट",
    "products.addToCart": "कार्ट में जोड़ें",
    "products.bulkMin": "न्यूनतम ऑर्डर",
    "stores.title": "हमारे स्टोर्स",
    "stores.subtitle": "अपने पास का इलेक्ट्रोमार्ट स्टोर देखें",
    "stores.visit": "स्टोर देखें",
    "stores.ny.city": "नई दिल्ली फ्लैगशिप",
    "stores.ny.address": "नेहरू प्लेस, नई दिल्ली, दिल्ली",
    "stores.ny.hours": "खुला: सुबह 10 बजे - रात 9 बजे",
    "stores.la.city": "मुंबई सेंट्रल",
    "stores.la.address": "लैमिंगटन रोड, मुंबई, महाराष्ट्र",
    "stores.la.hours": "खुला: सुबह 10 बजे - रात 9 बजे",
    "stores.chi.city": "बेंगलुरु टेक हब",
    "stores.chi.address": "एसपी रोड, बेंगलुरु, कर्नाटक",
    "stores.chi.hours": "खुला: सुबह 10 बजे - रात 9 बजे",
    "footer.backToTop": "ऊपर जाएं",
    "footer.getToKnowUs": "हमारे बारे में जानें",
    "footer.about": "परिचय",
    "footer.careers": "करियर",
    "footer.press": "प्रेस",
    "footer.makeMoney": "हमारे साथ कमाएं",
    "footer.sellProducts": "प्रोडक्ट बेचें",
    "footer.affiliate": "एफिलिएट बनें",
    "footer.advertise": "विज्ञापन करें",
    "footer.help": "मदद",
    "footer.yourAccount": "आपका अकाउंट",
    "footer.shippingRates": "शिपिंग दरें",
    "footer.returns": "रिटर्न",
    "footer.copyright": "© 2026 इलेक्ट्रोमार्ट क्लोन अनुभव",
    "categoryFilter.all": "सभी",
    "categoryFilter.laptop": "लैपटॉप",
    "categoryFilter.mobile": "मोबाइल",
    "categoryFilter.audio": "ऑडियो",
    "categoryFilter.accessory": "एक्सेसरी"
  }
};

const languageFallbackMap = {
  ta: "hi",
  te: "hi",
  kn: "hi",
  ml: "hi",
  bn: "hi",
  mr: "hi"
};

function getLanguagePack(lang) {
  if (translations[lang]) {
    return translations[lang];
  }
  const fallbackLang = languageFallbackMap[lang];
  if (fallbackLang && translations[fallbackLang]) {
    return translations[fallbackLang];
  }
  return translations.en || {};
}

function t(key) {
  const selected = getLanguagePack(currentLang);
  const english = translations.en || {};
  return selected[key] || english[key] || key;
}

function formatLocationLabel(preference) {
  const city = String(preference.city || "").trim();
  const postal = String(preference.postal || "").trim();
  return [city, postal].filter(Boolean).join(" ").trim();
}

function loadLocationPreference() {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") {
      const city = String(parsed.city || "").trim();
      const postal = String(parsed.postal || "").trim();
      if (city) {
        return { city, postal };
      }
    }
  } catch (error) {
    return { city: "New Delhi", postal: "110001" };
  }
  return { city: "New Delhi", postal: "110001" };
}

function saveLocationPreference(preference) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    return;
  }
}

function loadLanguagePreference() {
  try {
    const value = String(localStorage.getItem(LANGUAGE_STORAGE_KEY) || "").trim().toLowerCase();
    if (!value) {
      return "en";
    }
    if (translations[value] || languageFallbackMap[value]) {
      return value;
    }
    return "en";
  } catch (error) {
    return "en";
  }
}

function saveLanguagePreference(lang) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, String(lang || "en").toLowerCase());
  } catch (error) {
    return;
  }
}

function syncLocationLabel() {
  const preference = loadLocationPreference();
  const label = formatLocationLabel(preference) || "New Delhi 110001";
  if (deliveryLocationText) {
    deliveryLocationText.textContent = label;
  }
}

function closeLocationModal() {
  if (!locationModal) {
    return;
  }
  locationModal.hidden = true;
  document.body.classList.remove("modal-open");
  if (locationTrigger) {
    locationTrigger.focus();
  }
}

function openLocationModal() {
  if (!locationModal || !locationCity || !locationPostal) {
    return;
  }
  const preference = loadLocationPreference();
  locationCity.value = preference.city || "New Delhi";
  locationPostal.value = preference.postal || "";
  locationModal.hidden = false;
  document.body.classList.add("modal-open");
  locationCity.focus();
}

function handleLocationSave() {
  if (!locationCity || !locationPostal) {
    return;
  }
  const city = locationCity.value.trim() || "New Delhi";
  const postal = locationPostal.value.replace(/[^0-9A-Za-z -]/g, "").trim();
  const preference = { city, postal };
  saveLocationPreference(preference);
  syncLocationLabel();
  closeLocationModal();
}

function initLocationPicker() {
  syncLocationLabel();

  if (!locationTrigger || !locationModal || !locationCancel || !locationSave) {
    return;
  }

  locationTrigger.addEventListener("click", openLocationModal);
  locationCancel.addEventListener("click", closeLocationModal);
  locationSave.addEventListener("click", handleLocationSave);

  locationModal.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-location-modal]")) {
      closeLocationModal();
    }
  });
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

function loadCatalogMap() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function normalizeHomeCategory(value) {
  const raw = String(value || "").toLowerCase().trim();
  if (raw === "accessories") {
    return "accessory";
  }
  return raw;
}

function mapHomeCatalogProduct(item) {
  if (!item || !item.id) {
    return null;
  }
  const status = String(item.status || "active").toLowerCase();
  if (status !== "active") {
    return null;
  }
  const normalizedPrice = Number(item.price || 0);
  if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
    return null;
  }
  return {
    id: String(item.id),
    name: String(item.name || `Product #${item.id}`).trim(),
    brand: String(item.brand || "Generic").trim(),
    segment: String(item.segment || "b2c").toLowerCase(),
    category: normalizeHomeCategory(item.category || "accessory"),
    price: normalizedPrice,
    listPrice: Number(item.listPrice || item.price || 0),
    rating: Number(item.rating || 0),
    stock: Number(item.stock),
    moq: Number(item.moq || 0),
    image: normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL,
    featured: Boolean(item.featured),
    createdAt: String(item.createdAt || "").trim(),
    updatedAt: String(item.updatedAt || "").trim()
  };
}

function loadHomeCatalogProductsList() {
  return Object.values(loadCatalogMap())
    .map(mapHomeCatalogProduct)
    .filter(Boolean);
}

function mergeHomeProducts(...lists) {
  const merged = new Map();
  lists.flat().forEach((item) => {
    const normalized = mapHomeCatalogProduct(item);
    if (!normalized) {
      return;
    }
    merged.set(String(normalized.id), normalized);
  });
  return Array.from(merged.values());
}

function getHomeProducts() {
  const localCatalogProducts = loadHomeCatalogProductsList();
  return mergeHomeProducts(products, localCatalogProducts);
}

function getReadableCategoryLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "Others";
  }
  const lower = raw.toLowerCase();
  const knownLabelMap = {
    laptop: t("categoryFilter.laptop"),
    mobile: t("categoryFilter.mobile"),
    audio: t("categoryFilter.audio"),
    accessory: t("categoryFilter.accessory")
  };
  if (knownLabelMap[lower]) {
    return knownLabelMap[lower];
  }
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function syncCategoryFilterOptions(sourceProducts) {
  if (!categoryFilter) {
    return;
  }
  const activeValue = String(categoryFilter.value || "all").trim() || "all";
  const categorySet = new Set();
  sourceProducts.forEach((item) => {
    const category = normalizeHomeCategory(item?.category);
    if (category) {
      categorySet.add(category);
    }
  });
  const categories = Array.from(categorySet).sort((a, b) => a.localeCompare(b));
  const optionsMarkup = [
    `<option id="catAll" value="all">${t("categoryFilter.all")}</option>`,
    ...categories.map((category) => `<option value="${category}">${getReadableCategoryLabel(category)}</option>`)
  ].join("");
  categoryFilter.innerHTML = optionsMarkup;
  const nextValue = categories.includes(activeValue) || activeValue === "all" ? activeValue : "all";
  categoryFilter.value = nextValue;
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
    const uniqueIds = Array.from(new Set(ids.map((item) => String(item).trim()).filter(Boolean)));
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(uniqueIds));
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

function loadRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function getProductShortDescription(product) {
  const raw = String(product?.description || "").trim();
  if (raw) {
    return raw.replace(/\s+/g, " ").slice(0, 160);
  }
  return `${product?.brand || "ElectroMart"} ${getReadableCategoryLabel(product?.category)} picks with trusted ratings, fast delivery options and buyer-friendly pricing.`;
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

function syncCartCount() {
  const cartMap = loadCartMap();
  cart = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(cart);
}

function addProductToCart(productId) {
  const cartMap = loadCartMap();
  const key = String(productId);
  cartMap[key] = (Number(cartMap[key]) || 0) + 1;
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
    return url.toString();
  } catch (error) {
    return "";
  }
}

function getRibbonLabel(product) {
  if (product.featured) {
    return "Featured";
  }
  if (Number(product.rating || 0) >= 4.7) {
    return "Top Rated";
  }
  return "";
}

function getCategoryLandingLink(category) {
  const normalized = normalizeHomeCategory(category);
  const knownPageMap = {
    laptop: "laptop.html",
    mobile: "products.html?category=mobile",
    audio: "products.html?category=audio",
    accessory: "products.html?category=accessory",
    desktops: "desktops.html",
    printers: "printer.html",
    printer: "printer.html"
  };
  return knownPageMap[normalized] || `catalogs.html?category=${encodeURIComponent(normalized || "all")}`;
}

function renderQuickGrid(sourceProducts) {
  const quickGrid = document.querySelector(".quick-grid");
  if (!quickGrid) {
    return;
  }

  const categoryMap = new Map();
  sourceProducts.forEach((item) => {
    const category = normalizeHomeCategory(item?.category);
    if (!category) {
      return;
    }
    const bucket = categoryMap.get(category) || [];
    bucket.push(item);
    categoryMap.set(category, bucket);
  });

  const entries = Array.from(categoryMap.entries())
    .map(([category, items]) => ({
      category,
      label: getReadableCategoryLabel(category),
      items: items
        .slice()
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        .slice(0, 2)
    }))
    .filter((entry) => entry.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length)
    .slice(0, 3);

  const cards = entries.map((entry) => {
    const images = entry.items.map((item) => {
      const image = normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL;
      return `<img src="${image}" alt="${item.name}" loading="lazy" />`;
    }).join("");

    return `
      <article class="home-card">
        <h2>${entry.label} Picks</h2>
        <div class="home-card-grid">${images}</div>
        <a href="${getCategoryLandingLink(entry.category)}" class="home-card-link">See more</a>
      </article>
    `;
  }).join("");

  const signInCard = `
    <article class="home-card sign-card">
      <h2>Sign in for best experience</h2>
      <p>Track orders, save addresses and get personalized recommendations.</p>
      <a href="auth.html" class="signin-btn">Sign in securely</a>
    </article>
  `;

  if (cards) {
    quickGrid.innerHTML = `${cards}${signInCard}`;
  }
}

function renderDealStrip(sourceProducts) {
  const row = document.querySelector(".deal-strip-row");
  if (!row) {
    return;
  }
  const dealProducts = sourceProducts
    .slice()
    .sort((a, b) => {
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
      if (Math.abs(ratingDiff) > 0.05) {
        return ratingDiff;
      }
      return Number(a.price || 0) - Number(b.price || 0);
    })
    .slice(0, 4);

  if (!dealProducts.length) {
    return;
  }

  row.innerHTML = dealProducts.map((item) => {
    const image = normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL;
    const dealText = Number(item.price || 0) > 0 ? `Now ${money(item.price)}` : "Limited-time offer";
    return `
      <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="deal-tile" aria-label="Open ${item.name} deal">
        <img src="${image}" alt="${item.name}" loading="lazy" />
        <p><span>Deal</span> ${dealText}</p>
      </a>
    `;
  }).join("");
}

function getHeroBackdrop(category, product) {
  const normalized = normalizeHomeCategory(category);
  const visualMap = {
    laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1800&q=80",
    mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1800&q=80",
    audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1800&q=80",
    accessory: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1800&q=80",
    printer: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1800&q=80",
    computer: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1800&q=80",
    desktops: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1800&q=80"
  };
  return visualMap[normalized] || normalizeImageUrl(product?.image) || FALLBACK_IMAGE_URL;
}

function buildHeroSlides(sourceProducts) {
  const categories = new Map();
  sourceProducts.forEach((item) => {
    if (item.segment === "b2b") {
      return;
    }
    const category = normalizeHomeCategory(item.category);
    if (!category) {
      return;
    }
    const bucket = categories.get(category) || [];
    bucket.push(item);
    categories.set(category, bucket);
  });

  const ranked = Array.from(categories.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  if (!ranked.length) {
    return [];
  }

  return ranked.map(([category, items], index) => {
    const featured = items
      .slice()
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))[0];
    const label = getReadableCategoryLabel(category);
    return {
      id: `${category}-${index}`,
      eyebrow: index === 0 ? "Today’s headline offer" : "Trending right now",
      title: `${label} deals built for fast checkout`,
      description: `${items.length} options live now. ${featured?.name || label} is leading this category with strong ratings and ready-to-ship pricing.`,
      pills: [label, featured?.brand || "ElectroMart", featured ? money(featured.price) : "Shop now"],
      actions: [
        { href: getCategoryLandingLink(category), label: `Shop ${label}`, secondary: false },
        { href: featured ? `product-detail.html?id=${encodeURIComponent(featured.id)}` : "products.html", label: "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop(category, featured)
    };
  });
}

function stopHeroAutoplay() {
  if (heroAutoplayTimer) {
    window.clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = 0;
  }
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  if (heroSlides.length <= 1 || !heroTrack) {
    return;
  }
  heroAutoplayTimer = window.setInterval(() => {
    setHeroSlide(currentHeroIndex + 1);
  }, 5000);
}

function setHeroSlide(index) {
  if (!heroSlides.length || !heroTrack) {
    return;
  }
  currentHeroIndex = (index + heroSlides.length) % heroSlides.length;
  heroTrack.style.transform = `translateX(-${currentHeroIndex * 100}%)`;
  if (heroDots) {
    Array.from(heroDots.querySelectorAll(".hero-dot")).forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentHeroIndex);
    });
  }
}

function renderHeroSection(sourceProducts) {
  if (!heroTrack || !heroDots) {
    return;
  }
  heroSlides = buildHeroSlides(sourceProducts);
  if (!heroSlides.length) {
    heroTrack.innerHTML = "";
    heroDots.innerHTML = "";
    return;
  }

  heroTrack.innerHTML = heroSlides.map((slide) => `
    <article class="hero-slide" style="background-image:url('${slide.backgroundImage}')">
      <div class="hero-content">
        <p>${slide.eyebrow}</p>
        <h1>${slide.title}</h1>
        <div class="hero-pills">
          ${slide.pills.map((pill) => `<span>${pill}</span>`).join("")}
        </div>
        <p>${slide.description}</p>
        <div class="hero-actions">
          ${slide.actions.map((action) => `<a href="${action.href}" class="hero-btn${action.secondary ? " secondary" : ""}">${action.label}</a>`).join("")}
        </div>
      </div>
    </article>
  `).join("");

  heroDots.innerHTML = heroSlides.map((slide, index) => `
    <button class="hero-dot${index === 0 ? " active" : ""}" type="button" data-hero-index="${index}" aria-label="Go to slide ${index + 1}"></button>
  `).join("");
  setHeroSlide(0);
  startHeroAutoplay();
}

function getProductRecencyScore(product) {
  const createdAtMs = Date.parse(String(product?.createdAt || "").trim());
  if (Number.isFinite(createdAtMs) && createdAtMs > 0) {
    return createdAtMs;
  }
  const updatedAtMs = Date.parse(String(product?.updatedAt || "").trim());
  if (Number.isFinite(updatedAtMs) && updatedAtMs > 0) {
    return updatedAtMs;
  }
  const idMatch = String(product?.id || "").match(/(\d{10,})$/);
  if (idMatch) {
    const fromId = Number(idMatch[1]);
    if (Number.isFinite(fromId) && fromId > 0) {
      return fromId;
    }
  }
  return 0;
}

function isCatalogManagedProduct(product) {
  const key = String(product?.id || "");
  return /^product_\d+$/i.test(key) || Boolean(String(product?.createdAt || "").trim());
}

function renderNewArrivalsWindow(sourceProducts) {
  if (!newArrivalsGrid || !newArrivalsMeta) {
    return;
  }
  const catalogManaged = sourceProducts.filter(isCatalogManagedProduct);
  const ranked = (catalogManaged.length ? catalogManaged : sourceProducts.slice())
    .sort((a, b) => {
      const recencyDiff = getProductRecencyScore(b) - getProductRecencyScore(a);
      if (Math.abs(recencyDiff) > 0) {
        return recencyDiff;
      }
      return Number(b.rating || 0) - Number(a.rating || 0);
    })
    .slice(0, HOME_NEW_ARRIVALS_LIMIT);

  if (!ranked.length) {
    newArrivalsGrid.innerHTML = "<p class='new-arrivals-empty'>No new products yet.</p>";
    newArrivalsMeta.textContent = "Showing 0 products";
    return;
  }

  newArrivalsGrid.innerHTML = ranked.map(productCard).join("");
  newArrivalsMeta.textContent = `Showing ${ranked.length} latest products`;
}

function getRecentlyViewedProducts(sourceProducts) {
  const sourceMap = new Map(sourceProducts.map((item) => [String(item.id), item]));
  return loadRecentlyViewedIds()
    .map((id) => sourceMap.get(String(id)))
    .filter((item) => item && item.segment !== "b2b")
    .slice(0, HOME_CURATED_LIST_LIMIT);
}

function getRecommendedProducts(sourceProducts) {
  const preferredCategories = new Set();
  getRecentlyViewedProducts(sourceProducts).forEach((item) => {
    const category = normalizeHomeCategory(item.category);
    if (category) {
      preferredCategories.add(category);
    }
  });

  Object.keys(loadCartMap()).forEach((id) => {
    const match = sourceProducts.find((item) => String(item.id) === String(id));
    const category = normalizeHomeCategory(match?.category);
    if (category) {
      preferredCategories.add(category);
    }
  });

  return sourceProducts
    .filter((item) => item.segment !== "b2b")
    .map((item) => {
      let score = Number(item.rating || 0);
      if (preferredCategories.has(normalizeHomeCategory(item.category))) {
        score += 3;
      }
      if (item.featured) {
        score += 1.5;
      }
      if (isWishlisted(item.id)) {
        score += 1;
      }
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || Number(a.item.price || 0) - Number(b.item.price || 0))
    .map((entry) => entry.item)
    .slice(0, HOME_CURATED_LIST_LIMIT);
}

function renderCuratedSection(targetGrid, items, emptyMessage) {
  if (!targetGrid) {
    return;
  }
  if (!items.length) {
    targetGrid.innerHTML = `<p class="new-arrivals-empty">${emptyMessage}</p>`;
    return;
  }
  targetGrid.innerHTML = items.map(productCard).join("");
}

function renderTopRatedSection(sourceProducts) {
  const topRated = sourceProducts
    .filter((item) => item.segment !== "b2b")
    .slice()
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))
    .slice(0, HOME_CURATED_LIST_LIMIT);
  renderCuratedSection(topRatedGrid, topRated, "No top rated products yet.");
}

function renderRecommendedSection(sourceProducts) {
  renderCuratedSection(recommendedGrid, getRecommendedProducts(sourceProducts), "No recommendations available yet.");
}

function renderRecentlyViewedSection(sourceProducts) {
  if (!recentlyViewedSection || !recentlyViewedGrid) {
    return;
  }
  const items = getRecentlyViewedProducts(sourceProducts);
  if (!items.length) {
    recentlyViewedSection.hidden = true;
    recentlyViewedGrid.innerHTML = "";
    return;
  }
  recentlyViewedSection.hidden = false;
  renderCuratedSection(recentlyViewedGrid, items, "No recently viewed products yet.");
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
  const product = getHomeProducts().find((item) => String(item.id) === String(productId));
  if (!product) {
    return;
  }
  currentQuickViewProductId = String(product.id);
  quickViewImage.src = normalizeImageUrl(product.image) || FALLBACK_IMAGE_URL;
  quickViewImage.alt = product.name;
  quickViewEyebrow.textContent = getReadableCategoryLabel(product.category);
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

function productCard(product) {
  const detailUrl = `product-detail.html?id=${encodeURIComponent(product.id)}`;
  const image = normalizeImageUrl(product.image) || FALLBACK_IMAGE_URL;
  const ribbon = getRibbonLabel(product);
  const listPrice = Number(product.listPrice || product.price || 0);
  const price = Number(product.price || 0);
  const discountPercent = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const bulkMeta = product.segment === "b2b" && product.moq
    ? `<p class="bulk-meta">${t("products.bulkMin")}: ${product.moq}</p>`
    : "";
  const wishlisted = isWishlisted(product.id);
  const discountMeta = discountPercent > 0
    ? `<p class="price-meta"><span class="list-price-inline">${money(listPrice)}</span><span class="discount-badge">${discountPercent}% off</span></p>`
    : "";

  return `
    <article class="product-card">
      ${ribbon ? `<span class="card-ribbon">${ribbon}</span>` : ""}
      <a href="${detailUrl}" aria-label="Open ${product.name}">
        <img src="${image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${product.name}</a></h3>
        <div class="meta">
          <span class="price-stack">
            <span class="price">${money(price)}</span>
            ${discountMeta}
          </span>
          <span class="rating">${product.rating} ★</span>
        </div>
        ${bulkMeta}
        <div class="card-actions-inline">
          <button class="add-btn" data-id="${product.id}" type="button">${t("products.addToCart")}</button>
          <button class="wishlist-btn ${wishlisted ? "active" : ""}" data-wishlist-id="${product.id}" type="button">${wishlisted ? "Wishlisted" : "Wishlist"}</button>
          <button class="quick-view-link quick-view-btn" data-quick-view-id="${product.id}" type="button">Quick view</button>
        </div>
      </div>
    </article>
  `;
}

function renderSegmentProducts(list, targetGrid, targetMeta, labelKey) {
  if (!targetGrid || !targetMeta) {
    return;
  }
  targetGrid.innerHTML = list.map(productCard).join("");
  targetMeta.textContent = `${t("products.showing")} ${list.length} ${t(labelKey)}`;
}

function storeCard(store) {
  return `
    <article class="store-card">
      <h3>${t(store.cityKey)}</h3>
      <p>${t(store.addressKey)}</p>
      <p class="store-hours">${t(store.hoursKey)}</p>
      <p>${store.phone}</p>
      <button type="button">${t("stores.visit")}</button>
    </article>
  `;
}

function renderStores() {
  storeGrid.innerHTML = stores.map(storeCard).join("");
}

function matchesSmartKeyword(product, keyword) {
  if (!keyword) {
    return true;
  }

  if (keyword.includes("under 500")) {
    return product.price < 500;
  }

  if (keyword.includes("above 1000")) {
    return product.price > 1000;
  }

  if (keyword.includes("budget")) {
    return product.price <= 700;
  }

  if (keyword.includes("premium")) {
    return product.price >= 1000;
  }

  if (keyword.includes("gaming")) {
    return product.name.toLowerCase().includes("gaming") || product.category === "laptop";
  }

  if (keyword.includes("audio")) {
    return product.category === "audio";
  }

  if (keyword.includes("mobile")) {
    return product.category === "mobile";
  }

  if (keyword.includes("laptop")) {
    return product.category === "laptop";
  }

  return product.name.toLowerCase().includes(keyword);
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

  const sourceProducts = getHomeProducts().filter((item) => item.segment !== "b2b");
  const categoryMatches = Array.from(new Set(sourceProducts
    .map((item) => normalizeHomeCategory(item.category))
    .filter((category) => category && getReadableCategoryLabel(category).toLowerCase().includes(query))))
    .slice(0, 2)
    .map((category) => ({
      type: "category",
      value: category,
      label: getReadableCategoryLabel(category),
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
        meta: `${item.brand} · ${money(item.price)} · ${stockState.label}`,
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

function applyTranslations() {
  document.documentElement.setAttribute("lang", currentLang);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    element.setAttribute("placeholder", t(key));
  });

  if (categoryFilter) {
    const currentValue = String(categoryFilter.value || "all");
    categoryFilter.innerHTML = [
      `<option value="all">${t("categoryFilter.all")}</option>`,
      `<option value="laptop">${t("categoryFilter.laptop")}</option>`,
      `<option value="mobile">${t("categoryFilter.mobile")}</option>`,
      `<option value="audio">${t("categoryFilter.audio")}</option>`,
      `<option value="accessory">${t("categoryFilter.accessory")}</option>`
    ].join("");
    categoryFilter.value = ["all", "laptop", "mobile", "audio", "accessory"].includes(currentValue) ? currentValue : "all";
  }
  renderStores();
}

function renderHomeSurface() {
  const sourceProducts = getHomeProducts();
  syncCategoryFilterOptions(sourceProducts);
  renderQuickGrid(sourceProducts);
  renderDealStrip(sourceProducts);
  renderHeroSection(sourceProducts);
  renderNewArrivalsWindow(sourceProducts);
  renderTopRatedSection(sourceProducts);
  renderRecommendedSection(sourceProducts);
  renderRecentlyViewedSection(sourceProducts);
  filterProducts();
}

function filterProducts() {
  const sourceProducts = getHomeProducts();
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const filtered = sourceProducts.filter((product) => {
    const categoryMatch = category === "all" || product.category === category;
    const queryMatch = matchesSmartKeyword(product, query);
    return categoryMatch && queryMatch;
  });

  const visibleProducts = filtered
    .filter((product) => product.segment !== "b2b")
    .slice(0, HOME_MAIN_LIST_LIMIT);
  renderSegmentProducts(visibleProducts, b2cProductGrid, b2cResultMeta, "products.b2cListLabel");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = String(searchInput.value || "").trim();
  const category = String(categoryFilter.value || "all").trim();
  rememberSearchQuery(query);
  const params = new URLSearchParams();
  if (query) {
    params.set("search", query);
  }
  if (category && category !== "all") {
    params.set("category", category);
  }
  const suffix = params.toString();
  window.location.href = suffix ? `products.html?${suffix}` : "products.html";
});

searchInput.addEventListener("input", () => {
  filterProducts();
  renderSearchSuggestions();
});
searchInput.addEventListener("focus", renderSearchSuggestions);
categoryFilter.addEventListener("change", filterProducts);
languageSelect.addEventListener("change", (event) => {
  currentLang = event.target.value;
  saveLanguagePreference(currentLang);
  applyTranslations();
  renderHomeSurface();
});

if (heroPrev) {
  heroPrev.addEventListener("click", () => {
    setHeroSlide(currentHeroIndex - 1);
    startHeroAutoplay();
  });
}

if (heroNext) {
  heroNext.addEventListener("click", () => {
    setHeroSlide(currentHeroIndex + 1);
    startHeroAutoplay();
  });
}

if (heroDots) {
  heroDots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-hero-index]");
    if (!dot) {
      return;
    }
    setHeroSlide(Number(dot.getAttribute("data-hero-index") || 0));
    startHeroAutoplay();
  });
}

if (heroTrack) {
  heroTrack.addEventListener("mouseenter", stopHeroAutoplay);
  heroTrack.addEventListener("mouseleave", startHeroAutoplay);
}

function closeMegaMenu() {
  megaMenu.classList.remove("open");
  megaTrigger.setAttribute("aria-expanded", "false");
}

megaTrigger.addEventListener("click", () => {
  const isOpen = megaMenu.classList.toggle("open");
  megaTrigger.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
  if (!megaMenu.contains(event.target) && !megaTrigger.contains(event.target)) {
    closeMegaMenu();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key && event.key !== CATALOG_STORAGE_KEY) {
    return;
  }
  renderHomeSurface();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearchSuggestions();
    if (quickViewModal && !quickViewModal.hidden) {
      closeQuickViewModal();
      return;
    }
    if (locationModal && !locationModal.hidden) {
      closeLocationModal();
      return;
    }
    closeMegaMenu();
  }
});

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
      rememberSearchQuery(getReadableCategoryLabel(value));
      window.location.href = `products.html?category=${encodeURIComponent(value)}`;
      return;
    }
    if (type === "history" && value) {
      searchInput.value = value;
      rememberSearchQuery(value);
      filterProducts();
      renderSearchSuggestions();
      return;
    }
  }

  if (searchSuggestions && !searchForm.contains(event.target)) {
    closeSearchSuggestions();
  }

  const quickViewBtn = event.target.closest("[data-quick-view-id]");
  if (quickViewBtn) {
    openQuickViewModal(String(quickViewBtn.getAttribute("data-quick-view-id") || ""));
    return;
  }

  const wishlistBtn = event.target.closest(".wishlist-btn");
  if (wishlistBtn) {
    const productId = String(wishlistBtn.getAttribute("data-wishlist-id") || "").trim();
    if (productId) {
      const active = toggleWishlist(productId);
      wishlistBtn.classList.toggle("active", active);
      wishlistBtn.textContent = active ? "Wishlisted" : "Wishlist";
      renderRecommendedSection(getHomeProducts());
    }
    return;
  }

  if (event.target.classList.contains("add-btn")) {
    const productId = String(event.target.getAttribute("data-id") || "").trim();
    if (productId) {
      addProductToCart(productId);
    }
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
    renderRecommendedSection(getHomeProducts());
  });
}

currentLang = loadLanguagePreference();
if (languageSelect) {
  languageSelect.value = currentLang;
}
applyTranslations();
initLocationPicker();
syncCartCount();
renderHomeSurface();
