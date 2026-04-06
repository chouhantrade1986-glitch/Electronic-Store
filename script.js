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
,
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
const creatorStudioSection = document.getElementById("creatorStudioSection");
const creatorStudioGrid = document.getElementById("creatorStudioGrid");
const creatorStudioMeta = document.getElementById("creatorStudioMeta");
const creatorStudioStats = document.getElementById("creatorStudioStats");
const categoryRailGrid = document.getElementById("categoryRailGrid");
const categoryRailMeta = document.getElementById("categoryRailMeta");
const homeMomentumBand = document.getElementById("homeMomentumBand");
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
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();
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
let homeApiProducts = [];
let homeProductsFetchPromise = null;
let homeCatalogRequested = false;
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
    "header.searchBenefitDeals": "Top Deals live",
    "header.searchBenefitDelivery": "Fast delivery",
    "header.searchBenefitGst": "GST invoicing available",
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
    "nav.signInPrompt": "Hello, sign in",
    "nav.returnsShort": "Returns",
    "nav.saved": "Saved",
    "nav.wishlist": "Wishlist",
    "category.allDepartments": "All Departments",
    "category.deals": "Today's Deals",
    "category.bestSellers": "Best Sellers",
    "category.gaming": "Gaming",
    "category.homeOffice": "Home Office",
    "category.smartHome": "Smart Home",
    "category.stores": "Stores",
    "category.customerService": "Customer Service",
    "category.giftCards": "Gift Cards",
    "category.more": "More",
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
    "mega.components": "Components",
    "mega.pcBuilder": "PC Builder",
    "mega.memoryCooling": "Memory & Cooling",
    "mega.powerCases": "Power & Cases",
    "mega.audioVideo": "Audio & Video",
    "mega.headphones": "Headphones",
    "mega.speakers": "Speakers",
    "mega.tvTheater": "TV & Home Theater",
    "mega.microphones": "Microphones",
    "mega.businessServices": "Business & Services",
    "mega.businessCatalogs": "Business Catalogs",
    "mega.megaStores": "Mega Stores",
    "mega.compareProducts": "Compare Products",
    "mega.ordersReturns": "Orders & Returns",
    "mega.featuredDeal": "Featured Deal",
    "mega.productTitle": "Wireless Earbuds Pro",
    "mega.priceNow": "Now ₹79",
    "mega.seeOffer": "See offer",
    "hero.event": "Mega Electronics Sale",
    "hero.headline": "Up to 60% off on laptops, mobiles and accessories",
    "hero.shopNow": "Shop now",
    "home.discoveryEyebrow": "Home discovery",
    "home.discoveryTitle": "Amazon-style shopping lanes built from your live catalogue",
    "home.discoverySubtitle": "Featured shortcuts, sign-in benefits, and creator-ready merchandising update automatically from the same product feed used across the storefront.",
    "home.exploreCatalog": "Explore full catalogue",
    "deal.eyebrow": "Live markdowns",
    "deal.title": "Deals picked from products already in stock",
    "deal.subtitle": "The lead tile highlights the strongest live discount, then the rail fans out into high-conversion deal picks.",
    "deal.shopTopDeals": "Shop top deals",
    "rail.eyebrow": "Browse by mission",
    "rail.title": "Fast category rails for laptops, creator gear, audio, and more",
    "rail.browseAll": "Browse all categories",
    "rail.metaLoading": "Loading live category highlights.",
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
    "categoryFilter.all": "All Catalogue",
    "categoryFilter.computer": "Computers",
    "categoryFilter.laptop": "Laptops",
    "categoryFilter.printer": "Printers",
    "categoryFilter.mobile": "Mobiles",
    "categoryFilter.audio": "Audio",
    "categoryFilter.accessory": "Accessories",
    "links.allProducts": "All Products",
    "links.brandStores": "Brand Stores",
    "links.creatorStudio": "Creator Studio",
    "service.dispatch": "Prime-style dispatch",
    "service.dispatchDesc": "Same-day processing on flagship and featured inventory.",
    "service.checkout": "Secure checkout",
    "service.checkoutDesc": "Encrypted payments, invoice-ready billing, and saved carts.",
    "service.returns": "Easy returns",
    "service.returnsDesc": "30-day return window with order tracking built in.",
    "service.business": "Business support",
    "service.businessDesc": "GST invoices, bulk requests, and store pickup coordination.",
    "products.eyebrow": "Best of retail",
    "products.title": "Featured products surfaced from your homepage search and filters",
    "products.viewAll": "See all products",
    "testimonials.eyebrow": "Verified buyer voices",
    "testimonials.title": "What Our Customers Say",
    "testimonials.subtitle": "Real reviews from verified buyers across gaming, home office, creator, and business orders.",
    "mega.pick": "Mega Department Pick",
    "mega.price": "Now INR 4,799"
  },
  hi: {
    "header.deliverTo": "पहुंचाएं",
    "header.searchPlaceholder": "इलेक्ट्रॉनिक्स खोजें",
    "header.searchBtn": "खोजें",
    "header.language": "भाषा",
    "header.searchBenefitDeals": "टॉप डील्स लाइव",
    "header.searchBenefitDelivery": "तेज़ डिलीवरी",
    "header.searchBenefitGst": "जीएसटी इनवॉइस उपलब्ध",
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
    "nav.signInPrompt": "हेलो, साइन इन करें",
    "nav.returnsShort": "रिटर्न",
    "nav.saved": "सेव्ड",
    "nav.wishlist": "विशलिस्ट",
    "category.allDepartments": "सभी विभाग",
    "category.deals": "आज के ऑफर",
    "category.bestSellers": "बेस्ट सेलर",
    "category.gaming": "गेमिंग",
    "category.homeOffice": "होम ऑफिस",
    "category.smartHome": "स्मार्ट होम",
    "category.stores": "स्टोर्स",
    "category.customerService": "कस्टमर सर्विस",
    "category.giftCards": "गिफ्ट कार्ड",
    "category.more": "और",
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
    "mega.components": "कंपोनेंट्स",
    "mega.pcBuilder": "पीसी बिल्डर",
    "mega.memoryCooling": "मेमोरी और कूलिंग",
    "mega.powerCases": "पावर और केसेस",
    "mega.audioVideo": "ऑडियो और वीडियो",
    "mega.headphones": "हेडफोन",
    "mega.speakers": "स्पीकर",
    "mega.tvTheater": "टीवी और होम थिएटर",
    "mega.microphones": "माइक्रोफोन",
    "mega.businessServices": "बिजनेस और सर्विसेज",
    "mega.businessCatalogs": "बिजनेस कैटलॉग",
    "mega.megaStores": "मेगा स्टोर्स",
    "mega.compareProducts": "प्रोडक्ट तुलना",
    "mega.ordersReturns": "ऑर्डर और रिटर्न",
    "mega.featuredDeal": "विशेष ऑफर",
    "mega.productTitle": "वायरलेस ईयरबड्स प्रो",
    "mega.priceNow": "अब ₹79",
    "mega.seeOffer": "ऑफर देखें",
    "hero.event": "मेगा इलेक्ट्रॉनिक्स सेल",
    "hero.headline": "लैपटॉप, मोबाइल और एक्सेसरी पर 60% तक की छूट",
    "hero.shopNow": "अभी खरीदें",
    "home.discoveryEyebrow": "होम डिस्कवरी",
    "home.discoveryTitle": "आपकी लाइव कैटलॉग से बने अमेज़न-स्टाइल शॉपिंग लेन",
    "home.discoverySubtitle": "फीचर्ड शॉर्टकट्स, साइन-इन बेनिफिट्स, और क्रिएटर-रेडी मर्चेंडाइजिंग वही प्रोडक्ट फीड इस्तेमाल करते हुए ऑटो अपडेट होते हैं।",
    "home.exploreCatalog": "पूरा कैटलॉग देखें",
    "deal.eyebrow": "लाइव मार्कडाउन",
    "deal.title": "स्टॉक में उपलब्ध प्रोडक्ट्स से चुनी गई डील्स",
    "deal.subtitle": "लीड टाइल सबसे मजबूत लाइव डिस्काउंट दिखाती है, फिर रेल हाई-कन्वर्जन डील पिक्स दिखाती है।",
    "deal.shopTopDeals": "टॉप डील्स खरीदें",
    "rail.eyebrow": "मिशन के अनुसार ब्राउज़ करें",
    "rail.title": "लैपटॉप, क्रिएटर गियर, ऑडियो और अधिक के लिए फास्ट कैटेगरी रेल",
    "rail.browseAll": "सभी कैटेगरी देखें",
    "rail.metaLoading": "लाइव कैटेगरी हाइलाइट्स लोड हो रहे हैं।",
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
    "categoryFilter.all": "सभी कैटलॉग",
    "categoryFilter.computer": "कंप्यूटर",
    "categoryFilter.laptop": "लैपटॉप",
    "categoryFilter.printer": "प्रिंटर",
    "categoryFilter.mobile": "मोबाइल",
    "categoryFilter.audio": "ऑडियो",
    "categoryFilter.accessory": "एक्सेसरी",
    "links.allProducts": "सभी प्रोडक्ट",
    "links.brandStores": "ब्रांड स्टोर्स",
    "links.creatorStudio": "क्रिएटर स्टूडियो",
    "service.dispatch": "प्राइम-स्टाइल डिस्पैच",
    "service.dispatchDesc": "फ्लैगशिप और विशेष इन्वेंटरी पर समान-दिन प्रोसेसिंग।",
    "service.checkout": "सुरक्षित चेकआउट",
    "service.checkoutDesc": "एन्क्रिप्टेड भुगतान, इनवॉयस-तैयार बिलिंग, और सेव किए गए कार्ट।",
    "service.returns": "आसान रिटर्न",
    "service.returnsDesc": "30 दिन की रिटर्न विंडो निर्मित ऑर्डर ट्रैकिंग के साथ।",
    "service.business": "बिजनेस सपोर्ट",
    "service.businessDesc": "जीएसटी इनवॉयस, बल्क अनुरोध, और स्टोर पिकअप समन्वय।",
    "products.eyebrow": "रीटेल का सर्वश्रेष्ठ",
    "products.title": "आपकी होमपेज सर्च और फिल्टर से सर्च किए गए विशेष प्रोडक्ट",
    "products.viewAll": "सभी प्रोडक्ट देखें",
    "testimonials.eyebrow": "सत्यापित खरीदार की आवाजें",
    "testimonials.title": "हमारे ग्राहक क्या कहते हैं",
    "testimonials.subtitle": "गेमिंग, होम ऑफिस, क्रिएटर और बिजनेस ऑर्डर के सत्यापित खरीदारों की असली समीक्षाएं।",
    "mega.pick": "मेगा विभाग पिक",
    "mega.price": "अब INR 4,799"
  }
};

const nativeLanguageOverrides = {
  ta: {
    "header.deliverTo": "அனுப்ப வேண்டிய இடம்",
    "header.searchPlaceholder": "மின்னணு பொருட்களை தேடுங்கள்",
    "header.searchBtn": "தேடு",
    "header.language": "மொழி",
    "header.searchBenefitDeals": "சிறந்த சலுகைகள் நேரலையில்",
    "header.searchBenefitDelivery": "விரைவு டெலிவரி",
    "header.searchBenefitGst": "GST இன்வாய்ஸ் கிடைக்கும்",
    "nav.account": "கணக்கு",
    "nav.orders": "ஆர்டர்கள்",
    "nav.cart": "கார்ட்",
    "nav.signInPrompt": "வணக்கம், உள்நுழைக",
    "nav.returnsShort": "திரும்பப்பெறுதல்",
    "nav.saved": "சேமிக்கப்பட்டவை",
    "nav.wishlist": "விருப்பப்பட்டியல்",
    "category.allDepartments": "அனைத்து பிரிவுகள்",
    "category.stores": "ஸ்டோர்கள்",
    "links.allProducts": "அனைத்து பொருட்கள்",
    "links.brandStores": "பிராண்ட் ஸ்டோர்கள்",
    "links.creatorStudio": "கிரியேட்டர் ஸ்டூடியோ",
    "mega.computers": "கம்ப்யூட்டர்கள்",
    "mega.components": "கூறுகள்",
    "mega.audioVideo": "ஆடியோ & வீடியோ",
    "mega.businessServices": "வணிகம் & சேவைகள்",
    "mega.pcBuilder": "பிசி பில்டர்",
    "mega.memoryCooling": "மெமரி & கூலிங்",
    "mega.powerCases": "பவர் & கேஸ்கள்",
    "mega.businessCatalogs": "வணிக பட்டியல்கள்",
    "mega.megaStores": "மேகா ஸ்டோர்கள்",
    "mega.compareProducts": "பொருட்களை ஒப்பிடு",
    "mega.ordersReturns": "ஆர்டர்கள் & திரும்பப்பெறுதல்",
    "home.discoveryEyebrow": "ஹோம் கண்டுபிடிப்பு",
    "home.discoveryTitle": "உங்கள் நேரடி கேடலாகில் இருந்து உருவான Amazon-ஸ்டைல் ஷாப்பிங் லேன்கள்",
    "home.discoverySubtitle": "சிறப்பு குறுக்குவழிகள், உள்நுழைவு நன்மைகள் மற்றும் கிரியேட்டர் தயாரான மெர்சண்டைசிங் தானாகப் புதுப்பிக்கப்படும்.",
    "home.exploreCatalog": "முழு கேடலாகை பார்க்கவும்",
    "deal.eyebrow": "நேரடி தள்ளுபடிகள்",
    "deal.title": "இருப்பில் உள்ள பொருட்களில் இருந்து தேர்ந்தெடுக்கப்பட்ட சலுகைகள்",
    "deal.subtitle": "முக்கிய டைல் அதிக தள்ளுபடியை காட்டும், அதன் பின் ரெயில் உயர் மாற்றச் சலுகைகளை காட்டும்.",
    "deal.shopTopDeals": "சிறந்த சலுகைகள் வாங்கவும்",
    "rail.eyebrow": "உங்கள் தேவைக்கேற்ப உலாவுங்கள்",
    "rail.title": "லேப்டாப், கிரியேட்டர் கியர், ஆடியோ மற்றும் பலவற்றிற்கான வேகமான பிரிவு வரிசைகள்",
    "rail.browseAll": "அனைத்து பிரிவுகளையும் பார்க்கவும்",
    "rail.metaLoading": "நேரடி பிரிவு ஹைலைட்கள் ஏற்றப்படுகின்றன.",
    "service.dispatch": "பிரைம்-ஸ்டைல் அனுப்பல்",
    "service.dispatchDesc": "முக்கிய மற்றும் சிறப்பு இன்வென்டரிக்கு அதே நாள் செயலாக்கம்.",
    "service.checkout": "பாதுகாப்பான செக்அவுட்",
    "service.checkoutDesc": "குறியாக்கப்பட்ட கட்டணம், இன்வாய்ஸ் தயாரான பில்லிங், மற்றும் சேமித்த கார்ட்கள்.",
    "service.returns": "எளிய திரும்பப்பெறுதல்",
    "service.returnsDesc": "30 நாள் திரும்பப்பெறும் சாளரம், உட்பொதிக்கப்பட்ட ஆர்டர் கண்காணிப்புடன்.",
    "service.business": "வணிக ஆதரவு",
    "service.businessDesc": "GST இன்வாய்ஸ், பல்க் கோரிக்கைகள் மற்றும் ஸ்டோர் பிக்-அப் ஒருங்கிணைப்பு.",
    "products.eyebrow": "சிறந்த ரீடெயில்",
    "products.title": "உங்கள் ஹோம்பேஜ் தேடல் மற்றும் ஃபில்டர்களில் இருந்து காட்சிப்படுத்தப்பட்ட தயாரிப்புகள்",
    "products.viewAll": "அனைத்து பொருட்களையும் பார்க்கவும்",
    "testimonials.eyebrow": "சரிபார்க்கப்பட்ட வாங்குபவர் குரல்கள்",
    "testimonials.title": "எங்கள் வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்",
    "testimonials.subtitle": "கேமிங், ஹோம் ஆபீஸ், கிரியேட்டர் மற்றும் வணிக ஆர்டர்களிலிருந்து உண்மையான மதிப்புரைகள்.",
    "mega.pick": "மேகா பிரிவு தேர்வு",
    "mega.price": "இப்போது INR 4,799",
    "categoryFilter.all": "அனைத்து பட்டியல்",
    "categoryFilter.computer": "கம்ப்யூட்டர்கள்",
    "categoryFilter.laptop": "லேப்டாப்கள்",
    "categoryFilter.printer": "பிரிண்டர்கள்",
    "categoryFilter.mobile": "மொபைல்கள்",
    "categoryFilter.audio": "ஆடியோ",
    "categoryFilter.accessory": "அக்சசரிகள்"
  },
  te: {
    "header.deliverTo": "డెలివరీ స్థలం",
    "header.searchPlaceholder": "ఎలక్ట్రానిక్స్ కోసం శోధించండి",
    "header.searchBtn": "శోధించు",
    "header.language": "భాష",
    "header.searchBenefitDeals": "టాప్ డీల్స్ లైవ్",
    "header.searchBenefitDelivery": "వేగవంతమైన డెలివరీ",
    "header.searchBenefitGst": "GST ఇన్వాయిస్ అందుబాటులో ఉంది",
    "nav.account": "ఖాతా",
    "nav.orders": "ఆర్డర్లు",
    "nav.cart": "కార్ట్",
    "nav.signInPrompt": "హలో, సైన్ ఇన్ చేయండి",
    "nav.returnsShort": "రిటర్న్స్",
    "nav.saved": "సేవ్ చేసినవి",
    "nav.wishlist": "విష్‌లిస్ట్",
    "category.allDepartments": "అన్ని విభాగాలు",
    "category.stores": "స్టోర్లు",
    "links.allProducts": "అన్ని ఉత్పత్తులు",
    "links.brandStores": "బ్రాండ్ స్టోర్లు",
    "links.creatorStudio": "క్రియేటర్ స్టూడియో",
    "mega.computers": "కంప్యూటర్లు",
    "mega.components": "భాగాలు",
    "mega.audioVideo": "ఆడియో & వీడియో",
    "mega.businessServices": "వ్యాపారం & సేవలు",
    "home.discoveryEyebrow": "హోమ్ డిస్కవరీ",
    "home.discoveryTitle": "మీ లైవ్ కాటలాగ్‌తో నిర్మించిన Amazon-శైలి షాపింగ్ లేన్లు",
    "home.discoverySubtitle": "ఫీచర్డ్ షార్ట్‌కట్లు మరియు సైన్-ఇన్ ప్రయోజనాలు ఆటోమేటిక్‌గా నవీకరించబడతాయి.",
    "home.exploreCatalog": "పూర్తి కాటలాగ్ చూడండి",
    "deal.eyebrow": "లైవ్ మార్క్‌డౌన్స్",
    "deal.title": "స్టాక్‌లో ఉన్న ఉత్పత్తుల నుంచి ఎంపిక చేసిన డీల్స్",
    "deal.subtitle": "లీడ్ టైల్ ఉత్తమ తగ్గింపును చూపుతుంది, తరువాత రైలు హై-కన్వర్షన్ డీల్స్ చూపుతుంది.",
    "deal.shopTopDeals": "టాప్ డీల్స్ కొనండి",
    "rail.eyebrow": "లక్ష్యానికి అనుగుణంగా బ్రౌజ్ చేయండి",
    "rail.title": "ల్యాప్‌టాప్‌లు, క్రియేటర్ గేర్, ఆడియో మరియు మరిన్ని కోసం వేగవంతమైన కేటగిరీ రైలు",
    "rail.browseAll": "అన్ని కేటగిరీలు చూడండి",
    "rail.metaLoading": "లైవ్ కేటగిరీ హైలైట్స్ లోడ్ అవుతున్నాయి.",
    "service.dispatch": "ప్రైమ్-స్టైల్ డిస్పాచ్",
    "service.checkout": "సురక్షిత చెకౌట్",
    "service.returns": "సులభమైన రిటర్న్స్",
    "service.business": "వ్యాపార సహాయం",
    "products.eyebrow": "రిటైల్‌లో బెస్ట్",
    "products.title": "మీ హోంపేజ్ శోధన మరియు ఫిల్టర్ల నుండి ఎంపికైన ఉత్పత్తులు",
    "products.viewAll": "అన్ని ఉత్పత్తులు చూడండి",
    "testimonials.eyebrow": "ధృవీకరించిన కస్టమర్ అభిప్రాయాలు",
    "testimonials.title": "మా కస్టమర్లు ఏమంటున్నారు",
    "mega.pick": "మెగా డిపార్ట్‌మెంట్ ఎంపిక",
    "mega.price": "ఇప్పుడు INR 4,799",
    "categoryFilter.all": "అన్ని కాటలాగ్",
    "categoryFilter.computer": "కంప్యూటర్లు",
    "categoryFilter.laptop": "ల్యాప్‌టాప్‌లు",
    "categoryFilter.printer": "ప్రింటర్లు",
    "categoryFilter.mobile": "మొబైల్స్",
    "categoryFilter.audio": "ఆడియో",
    "categoryFilter.accessory": "యాక్సెసరీలు"
  },
  kn: {
    "header.deliverTo": "ವಿತರಣಾ ಸ್ಥಳ",
    "header.searchPlaceholder": "ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಹುಡುಕಿ",
    "header.searchBtn": "ಹುಡುಕಿ",
    "header.language": "ಭಾಷೆ",
    "header.searchBenefitDeals": "ಟಾಪ್ ಡೀಲ್ಸ್ ಲೈವ್",
    "header.searchBenefitDelivery": "ವೇಗದ ವಿತರಣೆ",
    "header.searchBenefitGst": "GST ಇನ್ವಾಯ್ಸ್ ಲಭ್ಯ",
    "nav.account": "ಖಾತೆ",
    "nav.orders": "ಆರ್ಡರ್‌ಗಳು",
    "nav.cart": "ಕಾರ್ಟ್",
    "nav.signInPrompt": "ಹಲೋ, ಸೈನ್ ಇನ್ ಮಾಡಿ",
    "nav.returnsShort": "ರಿಟರ್ನ್ಸ್",
    "nav.saved": "ಉಳಿಸಿದವು",
    "nav.wishlist": "ವಿಷ್‌ಲಿಸ್ಟ್",
    "category.allDepartments": "ಎಲ್ಲ ವಿಭಾಗಗಳು",
    "category.stores": "ಸ್ಟೋರ್‌ಗಳು",
    "links.allProducts": "ಎಲ್ಲ ಉತ್ಪನ್ನಗಳು",
    "links.brandStores": "ಬ್ರ್ಯಾಂಡ್ ಸ್ಟೋರ್‌ಗಳು",
    "links.creatorStudio": "ಕ್ರಿಯೇಟರ್ ಸ್ಟುಡಿಯೋ",
    "mega.computers": "ಕಂಪ್ಯೂಟರ್‌ಗಳು",
    "mega.components": "ಘಟಕಗಳು",
    "mega.audioVideo": "ಆಡಿಯೋ ಮತ್ತು ವೀಡಿಯೋ",
    "mega.businessServices": "ವ್ಯಾಪಾರ ಮತ್ತು ಸೇವೆಗಳು",
    "home.discoveryEyebrow": "ಹೋಮ್ ಡಿಸ್ಕವರಿ",
    "home.discoveryTitle": "ನಿಮ್ಮ ಲೈವ್ ಕ್ಯಾಟಲಾಗ್‌ನಿಂದ ನಿರ್ಮಿಸಲಾದ Amazon-ಶೈಲಿಯ ಶಾಪಿಂಗ್ ಲೇನ್‌ಗಳು",
    "home.exploreCatalog": "ಪೂರ್ಣ ಕ್ಯಾಟಲಾಗ್ ನೋಡಿ",
    "deal.eyebrow": "ಲೈವ್ ಮಾರ್ಕ್‌ಡೌನ್‌ಗಳು",
    "deal.title": "ಸ್ಟಾಕ್‌ನಲ್ಲಿರುವ ಉತ್ಪನ್ನಗಳಿಂದ ಆಯ್ಕೆ ಮಾಡಿದ ಡೀಲ್ಸ್",
    "deal.shopTopDeals": "ಟಾಪ್ ಡೀಲ್ಸ್ ಖರೀದಿಸಿ",
    "rail.eyebrow": "ಉದ್ದೇಶದ ಆಧಾರದಲ್ಲಿ ಬ್ರೌಸ್ ಮಾಡಿ",
    "rail.title": "ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು, ಕ್ರಿಯೇಟರ್ ಗೇರ್, ಆಡಿಯೋ ಮತ್ತು ಇನ್ನಷ್ಟುಗಾಗಿ ವೇಗದ ವರ್ಗ ಸಾಲುಗಳು",
    "rail.browseAll": "ಎಲ್ಲ ವರ್ಗಗಳನ್ನು ನೋಡಿ",
    "rail.metaLoading": "ಲೈವ್ ವರ್ಗ ಹೈಲೈಟ್ಸ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ.",
    "service.dispatch": "ಪ್ರೈಮ್-ಸ್ಟೈಲ್ ಡಿಸ್ಪ್ಯಾಚ್",
    "service.checkout": "ಸುರಕ್ಷಿತ ಚೆಕ್ಔಟ್",
    "service.returns": "ಸುಲಭ ರಿಟರ್ನ್ಸ್",
    "service.business": "ವ್ಯಾಪಾರ ಬೆಂಬಲ",
    "products.eyebrow": "ರಿಟೇಲ್‌ನ ಅತ್ಯುತ್ತಮ",
    "products.title": "ನಿಮ್ಮ ಹೋಂಪೇಜ್ ಹುಡುಕಾಟ ಮತ್ತು ಫಿಲ್ಟರ್‌ನಿಂದ ಆಯ್ಕೆಯಾದ ಉತ್ಪನ್ನಗಳು",
    "products.viewAll": "ಎಲ್ಲ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ",
    "testimonials.eyebrow": "ಪರಿಶೀಲಿತ ಗ್ರಾಹಕರ ಅಭಿಪ್ರಾಯಗಳು",
    "testimonials.title": "ನಮ್ಮ ಗ್ರಾಹಕರು ಏನು ಹೇಳುತ್ತಾರೆ",
    "mega.pick": "ಮೆಗಾ ವಿಭಾಗದ ಆಯ್ಕೆ",
    "mega.price": "ಈಗ INR 4,799",
    "categoryFilter.all": "ಎಲ್ಲ ಕ್ಯಾಟಲಾಗ್",
    "categoryFilter.computer": "ಕಂಪ್ಯೂಟರ್‌ಗಳು",
    "categoryFilter.laptop": "ಲ್ಯಾಪ್‌ಟಾಪ್‌ಗಳು",
    "categoryFilter.printer": "ಪ್ರಿಂಟರ್‌ಗಳು",
    "categoryFilter.mobile": "ಮೊಬೈಲ್‌ಗಳು",
    "categoryFilter.audio": "ಆಡಿಯೋ",
    "categoryFilter.accessory": "ಆಕ್ಸೆಸರಿಗಳು"
  },
  ml: {
    "header.deliverTo": "ഡെലിവറി സ്ഥലം",
    "header.searchPlaceholder": "ഇലക്ട്രോണിക്സ് തിരയുക",
    "header.searchBtn": "തിരയുക",
    "header.language": "ഭാഷ",
    "header.searchBenefitDeals": "ടോപ്പ് ഡീലുകൾ ലൈവ്",
    "header.searchBenefitDelivery": "വേഗത്തിലുള്ള ഡെലിവറി",
    "header.searchBenefitGst": "GST ഇൻവോയ്സ് ലഭ്യമാണ്",
    "nav.account": "അക്കൗണ്ട്",
    "nav.orders": "ഓർഡറുകൾ",
    "nav.cart": "കാർട്ട്",
    "nav.signInPrompt": "ഹലോ, സൈൻ ഇൻ ചെയ്യൂ",
    "nav.returnsShort": "റിട്ടേൺസ്",
    "nav.saved": "സേവ് ചെയ്തത്",
    "nav.wishlist": "വിഷ്‌ലിസ്റ്റ്",
    "category.allDepartments": "എല്ലാ വിഭാഗങ്ങളും",
    "category.stores": "സ്റ്റോറുകൾ",
    "links.allProducts": "എല്ലാ ഉൽപ്പന്നങ്ങൾ",
    "links.brandStores": "ബ്രാൻഡ് സ്റ്റോറുകൾ",
    "links.creatorStudio": "ക്രിയേറ്റർ സ്റ്റുഡിയോ",
    "mega.computers": "കമ്പ്യൂട്ടറുകൾ",
    "mega.components": "ഘടകങ്ങൾ",
    "mega.audioVideo": "ഓഡിയോ & വീഡിയോ",
    "mega.businessServices": "ബിസിനസ് & സേവനങ്ങൾ",
    "home.discoveryEyebrow": "ഹോം ഡിസ്കവറി",
    "home.discoveryTitle": "നിങ്ങളുടെ ലൈവ് കാറ്റലോഗിൽ നിന്ന് നിർമ്മിച്ച Amazon-സ്റ്റൈൽ ഷോപ്പിംഗ് ലെയ്‌നുകൾ",
    "home.exploreCatalog": "പൂർണ്ണ കാറ്റലോഗ് കാണുക",
    "deal.eyebrow": "ലൈവ് മാർക്ക്ഡൗൺസ്",
    "deal.title": "സ്റ്റോക്കിലുള്ള ഉൽപ്പന്നങ്ങളിൽ നിന്ന് തെരഞ്ഞെടുത്ത ഡീലുകൾ",
    "deal.shopTopDeals": "ടോപ്പ് ഡീലുകൾ വാങ്ങുക",
    "rail.eyebrow": "ലക്ഷ്യം അനുസരിച്ച് ബ്രൗസ് ചെയ്യുക",
    "rail.title": "ലാപ്‌ടോപ്പുകൾ, ക്രിയേറ്റർ ഗിയർ, ഓഡിയോ എന്നിവയ്ക്കുള്ള വേഗതയുള്ള വിഭാഗ റെയിൽ",
    "rail.browseAll": "എല്ലാ വിഭാഗങ്ങളും കാണുക",
    "rail.metaLoading": "ലൈവ് വിഭാഗ ഹൈലൈറ്റുകൾ ലോഡ് ചെയ്യുന്നു.",
    "service.dispatch": "പ്രൈം-സ്റ്റൈൽ ഡിസ്പാച്ച്",
    "service.checkout": "സുരക്ഷിത ചെക്ക്ഔട്ട്",
    "service.returns": "എളുപ്പമുള്ള റിട്ടേൺസ്",
    "service.business": "ബിസിനസ് പിന്തുണ",
    "products.eyebrow": "റീട്ടെയിൽ ബെസ്റ്റ്",
    "products.title": "നിങ്ങളുടെ ഹോംപേജ് തിരച്ചിലും ഫിൽറ്ററുകളും അടിസ്ഥാനമാക്കിയുള്ള ഉൽപ്പന്നങ്ങൾ",
    "products.viewAll": "എല്ലാ ഉൽപ്പന്നങ്ങളും കാണുക",
    "testimonials.eyebrow": "സ്ഥിരീകരിച്ച ഉപഭോക്തൃ അഭിപ്രായങ്ങൾ",
    "testimonials.title": "ഞങ്ങളുടെ ഉപഭോക്താക്കൾ എന്ത് പറയുന്നു",
    "mega.pick": "മെഗാ വിഭാഗം തിരഞ്ഞെടുപ്പ്",
    "mega.price": "ഇപ്പോൾ INR 4,799",
    "categoryFilter.all": "എല്ലാ കാറ്റലോഗും",
    "categoryFilter.computer": "കമ്പ്യൂട്ടറുകൾ",
    "categoryFilter.laptop": "ലാപ്‌ടോപ്പുകൾ",
    "categoryFilter.printer": "പ്രിന്ററുകൾ",
    "categoryFilter.mobile": "മൊബൈലുകൾ",
    "categoryFilter.audio": "ഓഡിയോ",
    "categoryFilter.accessory": "ആക്സസറികൾ"
  },
  bn: {
    "header.deliverTo": "ডেলিভারি স্থান",
    "header.searchPlaceholder": "ইলেকট্রনিক্স খুঁজুন",
    "header.searchBtn": "খুঁজুন",
    "header.language": "ভাষা",
    "header.searchBenefitDeals": "টপ ডিলস লাইভ",
    "header.searchBenefitDelivery": "দ্রুত ডেলিভারি",
    "header.searchBenefitGst": "GST ইনভয়েস উপলব্ধ",
    "nav.account": "অ্যাকাউন্ট",
    "nav.orders": "অর্ডার",
    "nav.cart": "কার্ট",
    "nav.signInPrompt": "হ্যালো, সাইন ইন করুন",
    "nav.returnsShort": "রিটার্নস",
    "nav.saved": "সেভড",
    "nav.wishlist": "উইশলিস্ট",
    "category.allDepartments": "সব বিভাগ",
    "category.stores": "স্টোরস",
    "links.allProducts": "সব পণ্য",
    "links.brandStores": "ব্র্যান্ড স্টোরস",
    "links.creatorStudio": "ক্রিয়েটর স্টুডিও",
    "mega.computers": "কম্পিউটার",
    "mega.components": "কম্পোনেন্টস",
    "mega.audioVideo": "অডিও ও ভিডিও",
    "mega.businessServices": "ব্যবসা ও সেবা",
    "home.discoveryEyebrow": "হোম ডিসকভারি",
    "home.discoveryTitle": "আপনার লাইভ ক্যাটালগ থেকে তৈরি Amazon-স্টাইল শপিং লেন",
    "home.exploreCatalog": "পুরো ক্যাটালগ দেখুন",
    "deal.eyebrow": "লাইভ মার্কডাউন",
    "deal.title": "স্টকে থাকা পণ্য থেকে বাছাই করা ডিলস",
    "deal.shopTopDeals": "টপ ডিলস কিনুন",
    "rail.eyebrow": "প্রয়োজন অনুযায়ী ব্রাউজ করুন",
    "rail.title": "ল্যাপটপ, ক্রিয়েটর গিয়ার, অডিও ও আরও কিছুর জন্য দ্রুত ক্যাটাগরি রেল",
    "rail.browseAll": "সব ক্যাটাগরি দেখুন",
    "rail.metaLoading": "লাইভ ক্যাটাগরি হাইলাইট লোড হচ্ছে।",
    "service.dispatch": "প্রাইম-স্টাইল ডিসপ্যাচ",
    "service.checkout": "সুরক্ষিত চেকআউট",
    "service.returns": "সহজ রিটার্ন",
    "service.business": "ব্যবসায়িক সহায়তা",
    "products.eyebrow": "রিটেইলের সেরা",
    "products.title": "আপনার হোমপেজ সার্চ এবং ফিল্টার থেকে বাছাই করা পণ্য",
    "products.viewAll": "সব পণ্য দেখুন",
    "testimonials.eyebrow": "যাচাইকৃত ক্রেতার মতামত",
    "testimonials.title": "আমাদের গ্রাহকরা কী বলছেন",
    "mega.pick": "মেগা বিভাগের পছন্দ",
    "mega.price": "এখন INR 4,799",
    "categoryFilter.all": "সব ক্যাটালগ",
    "categoryFilter.computer": "কম্পিউটার",
    "categoryFilter.laptop": "ল্যাপটপ",
    "categoryFilter.printer": "প্রিন্টার",
    "categoryFilter.mobile": "মোবাইল",
    "categoryFilter.audio": "অডিও",
    "categoryFilter.accessory": "অ্যাকসেসরিজ"
  },
  mr: {
    "header.deliverTo": "डिलिव्हरी स्थान",
    "header.searchPlaceholder": "इलेक्ट्रॉनिक्स शोधा",
    "header.searchBtn": "शोधा",
    "header.language": "भाषा",
    "header.searchBenefitDeals": "टॉप डील्स लाइव्ह",
    "header.searchBenefitDelivery": "जलद डिलिव्हरी",
    "header.searchBenefitGst": "GST इनव्हॉइस उपलब्ध",
    "nav.account": "खाते",
    "nav.orders": "ऑर्डर्स",
    "nav.cart": "कार्ट",
    "nav.signInPrompt": "हॅलो, साइन इन करा",
    "nav.returnsShort": "रिटर्न्स",
    "nav.saved": "सेव्ह केलेले",
    "nav.wishlist": "विशलिस्ट",
    "category.allDepartments": "सर्व विभाग",
    "category.stores": "स्टोअर्स",
    "links.allProducts": "सर्व प्रॉडक्ट्स",
    "links.brandStores": "ब्रँड स्टोअर्स",
    "links.creatorStudio": "क्रिएटर स्टुडिओ",
    "mega.computers": "कॉम्प्युटर्स",
    "mega.components": "घटक",
    "mega.audioVideo": "ऑडिओ आणि व्हिडिओ",
    "mega.businessServices": "बिझनेस आणि सेवा",
    "home.discoveryEyebrow": "होम डिस्कव्हरी",
    "home.discoveryTitle": "तुमच्या लाइव्ह कॅटलॉगवर आधारित Amazon-शैलीतील शॉपिंग लेन्स",
    "home.exploreCatalog": "पूर्ण कॅटलॉग पहा",
    "deal.eyebrow": "लाइव्ह मार्कडाउन",
    "deal.title": "स्टॉकमधील प्रॉडक्ट्समधून निवडलेल्या डील्स",
    "deal.shopTopDeals": "टॉप डील्स खरेदी करा",
    "rail.eyebrow": "गरजेनुसार ब्राउझ करा",
    "rail.title": "लॅपटॉप, क्रिएटर गिअर, ऑडिओ आणि अधिकसाठी वेगवान कॅटेगरी रेल",
    "rail.browseAll": "सर्व कॅटेगरी पहा",
    "rail.metaLoading": "लाइव्ह कॅटेगरी हायलाइट्स लोड होत आहेत.",
    "service.dispatch": "प्राइम-स्टाइल डिस्पॅच",
    "service.checkout": "सुरक्षित चेकआउट",
    "service.returns": "सोपे रिटर्न्स",
    "service.business": "बिझनेस सपोर्ट",
    "products.eyebrow": "रिटेलमधील सर्वोत्तम",
    "products.title": "तुमच्या होमपेज शोध आणि फिल्टरवर आधारित निवडलेली उत्पादने",
    "products.viewAll": "सर्व प्रॉडक्ट्स पहा",
    "testimonials.eyebrow": "सत्यापित ग्राहकांचे मत",
    "testimonials.title": "आमचे ग्राहक काय म्हणतात",
    "mega.pick": "मेगा विभाग निवड",
    "mega.price": "आता INR 4,799",
    "categoryFilter.all": "संपूर्ण कॅटलॉग",
    "categoryFilter.computer": "कॉम्प्युटर्स",
    "categoryFilter.laptop": "लॅपटॉप्स",
    "categoryFilter.printer": "प्रिंटर्स",
    "categoryFilter.mobile": "मोबाइल्स",
    "categoryFilter.audio": "ऑडिओ",
    "categoryFilter.accessory": "अॅक्सेसरीज"
  }
};

Object.keys(nativeLanguageOverrides).forEach((lang) => {
  translations[lang] = {
    ...translations.en,
    ...nativeLanguageOverrides[lang]
  };
});

const languageFallbackMap = {
  ta: "en",
  te: "en",
  kn: "en",
  ml: "en",
  bn: "en",
  mr: "en"
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

function saveCatalogMap(catalogMap) {
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
  } catch (error) {
    return;
  }
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
      featured: Boolean(product.featured ?? existing.featured ?? false),
      collections: Array.isArray(product.collections) ? product.collections : (Array.isArray(existing.collections) ? existing.collections : []),
      createdAt: String(product.createdAt ?? existing.createdAt ?? "").trim(),
      updatedAt: String(product.updatedAt ?? existing.updatedAt ?? "").trim()
    };
    changed = true;
  });
  if (changed) {
    saveCatalogMap(next);
  }
}

function normalizeHomeCategory(value) {
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

function buildHomeCategorySignalText(product) {
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

function inferHomeCategory(product) {
  const fallbackCategory = normalizeHomeCategory(product?.category || "");
  const signal = buildHomeCategorySignalText(product);

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
  return "accessory";
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
  const category = inferHomeCategory(item);
  return {
    id: String(item.id),
    name: String(item.name || `Product #${item.id}`).trim(),
    brand: String(item.brand || "Generic").trim(),
    segment: String(item.segment || "b2c").toLowerCase(),
    category,
    rawCategory: normalizeHomeCategory(item.category || category || "accessory"),
    collections: Array.isArray(item.collections) ? item.collections.slice(0, 8) : [],
    price: normalizedPrice,
    listPrice: Number(item.listPrice || item.price || 0),
    rating: Number(item.rating || 0),
    stock: Number(item.stock),
    moq: Number(item.moq || 0),
    image: normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL,
    featured: Boolean(item.featured),
    description: String(item.description || "").trim(),
    keywords: Array.isArray(item.keywords) ? item.keywords : [],
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
  return mergeHomeProducts(products, localCatalogProducts, homeApiProducts);
}

async function fetchHomeProductsFromApi() {
  if (homeCatalogRequested && !homeProductsFetchPromise) {
    return homeApiProducts;
  }
  if (homeProductsFetchPromise) {
    return homeProductsFetchPromise;
  }

  homeCatalogRequested = true;
  homeProductsFetchPromise = (async () => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/products?status=active`);
    } catch (error) {
      return homeApiProducts;
    }

    const data = await response.json().catch(() => null);
    if (!response.ok || !data || !Array.isArray(data.products)) {
      return homeApiProducts;
    }

    cacheCatalogProducts(data.products);
    homeApiProducts = mergeHomeProducts(data.products);
    renderHomeSurface();
    return homeApiProducts;
  })();

  try {
    return await homeProductsFetchPromise;
  } finally {
    homeProductsFetchPromise = null;
  }
}

function getReadableCategoryLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "Others";
  }
  const lower = raw.toLowerCase();
  const knownLabelMap = {
    computer: t("categoryFilter.computer"),
    laptop: t("categoryFilter.laptop"),
    printer: t("categoryFilter.printer"),
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
    computer: "desktops.html",
    desktops: "desktops.html",
    "creator-studio": "creator-studio.html",
    printers: "printer.html",
    printer: "printer.html"
  };
  return knownPageMap[normalized] || `products.html?category=${encodeURIComponent(normalized || "all")}`;
}

function countProductsWithDiscount(items) {
  return items.filter((item) => Number(item.listPrice || item.price || 0) > Number(item.price || 0)).length;
}

function getStartingPrice(items) {
  const prices = items
    .map((item) => Number(item.price || 0))
    .filter((price) => Number.isFinite(price) && price > 0);
  if (!prices.length) {
    return 0;
  }
  return Math.min(...prices);
}

function getHighestRating(items) {
  const ratings = items
    .map((item) => Number(item.rating || 0))
    .filter((rating) => Number.isFinite(rating) && rating > 0);
  if (!ratings.length) {
    return 0;
  }
  return Math.max(...ratings);
}

function getHomeRatingBadge(items) {
  const rating = getHighestRating(items);
  if (rating <= 0) {
    return "New in";
  }
  return `${rating.toFixed(1)} star`;
}

function getUniqueCollectionCount(items) {
  const tokens = new Set();
  items.forEach((item) => {
    [item?.category, ...(Array.isArray(item?.collections) ? item.collections : [])]
      .map((value) => normalizeHomeCategory(value))
      .filter(Boolean)
      .forEach((token) => tokens.add(token));
  });
  return tokens.size;
}

function truncateHomeCardLabel(value, maxLength = 34) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function renderHomeCardMiniTiles(items) {
  return items.map((item) => {
    const image = normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL;
    return `
      <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="home-mini-tile" aria-label="Open ${escapeSuggestionHtml(item.name)}">
        <img src="${image}" alt="${escapeSuggestionHtml(item.name)}" loading="lazy" />
        <span class="home-mini-label">${escapeSuggestionHtml(truncateHomeCardLabel(item.name, 30))}</span>
        <small class="home-mini-price">From ${money(item.price)}</small>
      </a>
    `;
  }).join("");
}

function getHomeCategoryVisual(item, category) {
  return getHeroBackdrop(category, item);
}

function renderCategoryRail(sourceProducts) {
  if (!categoryRailGrid || !categoryRailMeta) {
    return;
  }

  const retailProducts = sourceProducts.filter((item) => item.segment !== "b2b");
  const categories = new Map();
  retailProducts.forEach((item) => {
    const category = normalizeHomeCategory(item?.category);
    if (!category) {
      return;
    }
    const bucket = categories.get(category) || [];
    bucket.push(item);
    categories.set(category, bucket);
  });

  const categoryPriority = {
    laptop: 7,
    computer: 6,
    "creator-studio": 5,
    printer: 4,
    mobile: 3,
    audio: 2,
    accessory: 1
  };

  const entries = Array.from(categories.entries())
    .map(([category, items]) => {
      const rankedItems = items
        .slice()
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Number(b.rating || 0) - Number(a.rating || 0));
      return {
        category,
        label: getReadableCategoryLabel(category),
        count: items.length,
        startingPrice: getStartingPrice(items),
        featured: rankedItems[0],
        highestRating: getHomeRatingBadge(items)
      };
    })
    .sort((a, b) => {
      const priorityDiff = (categoryPriority[b.category] || 0) - (categoryPriority[a.category] || 0);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return b.count - a.count;
    });

  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  if (creatorItems.length) {
    entries.push({
      category: "creator-studio",
      label: "Creator Studio",
      count: creatorItems.length,
      startingPrice: getStartingPrice(creatorItems),
      featured: creatorItems[0],
      highestRating: getHomeRatingBadge(creatorItems)
    });
  }

  entries.sort((a, b) => {
    const priorityDiff = (categoryPriority[b.category] || 0) - (categoryPriority[a.category] || 0);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return b.count - a.count;
  });

  const visibleEntries = entries.slice(0, 6);
  if (!visibleEntries.length) {
    categoryRailGrid.innerHTML = "";
    categoryRailMeta.textContent = "No category highlights available right now.";
    return;
  }

  categoryRailMeta.textContent = `${visibleEntries.length} featured shopping paths live now - strongest picks from ${money(getStartingPrice(retailProducts))}.`;
  categoryRailGrid.innerHTML = visibleEntries.map((entry) => {
    const image = getHomeCategoryVisual(entry.featured, entry.category);
    const href = getCategoryLandingLink(entry.category);
    return `
      <a href="${href}" class="category-rail-card" aria-label="Shop ${escapeSuggestionHtml(entry.label)}">
        <span class="category-rail-card__media" style="background-image:url('${image}')"></span>
        <span class="category-rail-card__top">
          <span class="category-rail-card__kicker">Featured lane</span>
          <span class="category-rail-card__lane">${entry.count} live now</span>
        </span>
        <strong>${escapeSuggestionHtml(entry.label)}</strong>
        <small>From ${money(entry.startingPrice)} - ${escapeSuggestionHtml(entry.highestRating)} confidence</small>
        <span class="category-rail-card__meta">
          <span>From ${money(entry.startingPrice)}</span>
          <span>${escapeSuggestionHtml(entry.highestRating)}</span>
        </span>
        <span class="category-rail-card__cta">Shop ${escapeSuggestionHtml(entry.label)}</span>
      </a>
    `;
  }).join("");
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
      liveCount: items.length,
      startingPrice: getStartingPrice(items),
      highestRating: getHighestRating(items),
      items: items
        .slice()
        .sort((a, b) => {
          const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
          if (featuredDiff !== 0) {
            return featuredDiff;
          }
          return Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0);
        })
        .slice(0, 4)
    }))
    .filter((entry) => entry.items.length > 0)
    .sort((a, b) => {
      const categoryPriority = {
        laptop: 6,
        computer: 5,
        mobile: 4,
        audio: 3,
        accessory: 2,
        printer: 1
      };
      const priorityDiff = (categoryPriority[b.category] || 0) - (categoryPriority[a.category] || 0);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return b.liveCount - a.liveCount;
    });

  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  const creatorCard = creatorItems.length ? `
      <article class="home-card creator-card">
        <div class="home-card__top">
          <p class="home-card-kicker">Fresh collection</p>
          <span class="home-card-lane">${creatorItems.length} live now</span>
        </div>
        <h2>Creator Studio</h2>
        <p class="home-card-meta">${creatorItems.length} creator-ready picks - From ${money(getStartingPrice(creatorItems))}</p>
        <div class="home-card-badges">
          <span class="home-card-badge">${getUniqueCollectionCount(creatorItems)} merch lanes</span>
          <span class="home-card-badge">${getHomeRatingBadge(creatorItems)} top rated</span>
        </div>
        <div class="home-card-grid">${renderHomeCardMiniTiles(creatorItems.slice(0, 4))}</div>
        <div class="home-card-footer">
          <span class="home-card-proof">Editing, streaming, and design-ready</span>
          <a href="creator-studio.html" class="home-card-action">Build your setup</a>
        </div>
      </article>
    ` : "";

  const visibleEntries = entries.slice(0, creatorCard ? 2 : 3);

  const cards = visibleEntries.map((entry) => {
    return `
      <article class="home-card">
        <div class="home-card__top">
          <p class="home-card-kicker">Shop lane</p>
          <span class="home-card-lane">${entry.liveCount} live now</span>
        </div>
        <h2>${entry.label} Picks</h2>
        <p class="home-card-meta">From ${money(entry.startingPrice)} - ${getHomeRatingBadge(entry.items)} confidence</p>
        <div class="home-card-badges">
          <span class="home-card-badge">${entry.liveCount} active picks</span>
          <span class="home-card-badge">From ${money(entry.startingPrice)}</span>
        </div>
        <div class="home-card-grid">${renderHomeCardMiniTiles(entry.items)}</div>
        <div class="home-card-footer">
          <span class="home-card-proof">${getHomeRatingBadge(entry.items)} top rated</span>
          <a href="${getCategoryLandingLink(entry.category)}" class="home-card-action">See more</a>
        </div>
      </article>
    `;
  }).join("");

  const signInCard = `
    <article class="home-card sign-card">
      <div class="home-card__top">
        <p class="home-card-kicker">Account benefits</p>
        <span class="home-card-lane">Fast checkout</span>
      </div>
      <h2>Sign in for best experience</h2>
      <p>Track orders, save creator picks, and keep your recent shopping synced across every page.</p>
      <div class="home-card-badges">
        <span class="home-card-badge">Wishlist sync</span>
        <span class="home-card-badge">Faster reorder</span>
      </div>
      <ul class="home-card-list">
        <li>Track every order in one place</li>
        <li>Save creator and deal picks for later</li>
        <li>Get faster repeat checkout</li>
      </ul>
      <div class="home-card-footer">
        <span class="home-card-proof">Secure sign-in and saved shopping state</span>
        <a href="auth.html" class="signin-btn">Sign in securely</a>
      </div>
    </article>
  `;

  if (cards || creatorCard) {
    quickGrid.innerHTML = `${cards}${creatorCard}${signInCard}`;
  }
}

function renderDealStrip(sourceProducts) {
  const row = document.querySelector(".deal-strip-row");
  if (!row) {
    return;
  }
  const dealProducts = sourceProducts
    .filter((item) => item.segment !== "b2b")
    .slice()
    .sort((a, b) => {
      const aDiscount = Math.max(0, Number(a.listPrice || a.price || 0) - Number(a.price || 0));
      const bDiscount = Math.max(0, Number(b.listPrice || b.price || 0) - Number(b.price || 0));
      const savingsDiff = bDiscount - aDiscount;
      if (Math.abs(savingsDiff) > 0) {
        return savingsDiff;
      }
      const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDiff !== 0) {
        return featuredDiff;
      }
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

  row.innerHTML = dealProducts.map((item, index) => {
    const image = normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL;
    const listPrice = Number(item.listPrice || item.price || 0);
    const livePrice = Number(item.price || 0);
    const savings = Math.max(0, listPrice - livePrice);
    const discountPercent = listPrice > livePrice ? Math.round(((listPrice - livePrice) / listPrice) * 100) : 0;
    const badge = discountPercent > 0 ? `${discountPercent}% off` : "Top pick";
    const kicker = item.featured ? "Featured deal" : getReadableCategoryLabel(item.category);
    const priceMeta = savings > 0
      ? `Was ${money(listPrice)} - Save ${money(savings)}`
      : `${Number(item.rating || 0).toFixed(1)} star rated - ${item.brand || "ElectroMart"}`;
    const deliveryMeta = item.featured
      ? "Fast delivery eligible on featured stock"
      : `${item.brand || "ElectroMart"} deal now live`;
    const cardClass = index === 0 ? "deal-tile deal-tile--featured" : "deal-tile";
    return `
      <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="${cardClass}" aria-label="Open ${item.name} deal">
        <img src="${image}" alt="${item.name}" loading="lazy" />
        <span class="deal-copy">
          <span class="deal-topline">
            <small class="deal-kicker">${kicker}</small>
            <small class="deal-lane">${item.featured ? "Fast checkout" : `${item.brand || "ElectroMart"} pick`}</small>
          </span>
          <h3>${item.name}</h3>
          <p class="deal-price-line"><span>${badge}</span> Now ${money(livePrice)}</p>
          <span class="deal-meta-row">
            <small class="deal-price-meta">${priceMeta}</small>
            <small class="deal-delivery-note">${deliveryMeta}</small>
          </span>
          <span class="deal-tile__cta">${index === 0 ? "Shop featured deal" : "Open deal"}</span>
        </span>
      </a>
    `;
  }).join("");
}

function getHeroBackdrop(category, product) {
  const normalized = normalizeHomeCategory(category);
  const visualMap = {
    "creator-studio": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80",
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
  const slides = [];
  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  if (creatorItems.length) {
    const featuredCreator = creatorItems[0];
    slides.push({
      id: "creator-studio-launch",
      eyebrow: "Just launched",
      title: "Creator Studio setups built for editing, streaming, and sharper desks",
      description: `${creatorItems.length} creator-ready products are live now across ${getUniqueCollectionCount(creatorItems)} shopping paths. ${featuredCreator?.name || "Creator Studio"} leads the collection with premium-ready confidence.`,
      pills: ["Creator Studio", `From ${money(getStartingPrice(creatorItems))}`, `${getHomeRatingBadge(creatorItems)} top rated`],
      stats: [
        { label: "Live picks", value: `${creatorItems.length}` },
        { label: "Starting at", value: money(getStartingPrice(creatorItems)) },
        { label: "Top rating", value: getHomeRatingBadge(creatorItems) }
      ],
      actions: [
        { href: "creator-studio.html", label: "Explore Creator Studio", secondary: false },
        { href: featuredCreator ? `product-detail.html?id=${encodeURIComponent(featuredCreator.id)}` : "products.html?search=creator", label: "View featured creator pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop("creator-studio", featuredCreator)
    });
  }

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
    .slice(0, creatorItems.length ? 2 : 3);

  if (!ranked.length && !slides.length) {
    return [];
  }

  ranked.forEach(([category, items], index) => {
    const featured = items
      .slice()
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))[0];
    const label = getReadableCategoryLabel(category);
    slides.push({
      id: `${category}-${index}`,
      eyebrow: index === 0 && !creatorItems.length ? "Today’s headline offer" : "Trending right now",
      title: `${label} deals built for fast checkout`,
      description: `${items.length} options live now. ${featured?.name || label} is leading this category with strong ratings and ready-to-ship pricing.`,
      pills: [label, featured?.brand || "ElectroMart", `From ${money(getStartingPrice(items))}`],
      stats: [
        { label: "Live now", value: `${items.length}` },
        { label: "Starting at", value: money(getStartingPrice(items)) },
        { label: "Top rating", value: getHomeRatingBadge(items) }
      ],
      actions: [
        { href: getCategoryLandingLink(category), label: `Shop ${label}`, secondary: false },
        { href: featured ? `product-detail.html?id=${encodeURIComponent(featured.id)}` : "products.html", label: "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop(category, featured)
    });
  });
  return slides.slice(0, 3);
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
        <div class="hero-stats">
          ${Array.isArray(slide.stats) ? slide.stats.map((stat) => `
            <div class="hero-stat">
              <strong>${stat.value}</strong>
              <span>${stat.label}</span>
            </div>
          `).join("") : ""}
        </div>
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
function hasHomeCollection(product, collectionToken) {
  const target = normalizeHomeCategory(collectionToken);
  if (!target) {
    return false;
  }
  const tokens = [product?.category, product?.rawCategory, ...(Array.isArray(product?.collections) ? product.collections : [])]
    .map((item) => normalizeHomeCategory(item))
    .filter(Boolean);
  return tokens.includes(target);
}

function getHomeCollectionProducts(sourceProducts, collectionToken) {
  return sourceProducts
    .filter((item) => item.segment !== "b2b")
    .filter((item) => hasHomeCollection(item, collectionToken))
    .slice()
    .sort((a, b) => {
      const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDiff !== 0) {
        return featuredDiff;
      }
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
      if (Math.abs(ratingDiff) > 0) {
        return ratingDiff;
      }
      return getProductRecencyScore(b) - getProductRecencyScore(a);
    });
}

function renderCreatorStudioSection(sourceProducts) {
  if (!creatorStudioSection || !creatorStudioGrid || !creatorStudioMeta) {
    return;
  }
  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  const items = creatorItems.slice(0, HOME_CURATED_LIST_LIMIT);
  if (!items.length) {
    creatorStudioSection.hidden = true;
    creatorStudioGrid.innerHTML = "";
    creatorStudioMeta.textContent = "";
    if (creatorStudioStats) {
      creatorStudioStats.innerHTML = "";
    }
    return;
  }
  creatorStudioSection.hidden = false;
  creatorStudioGrid.innerHTML = items.map(productCard).join("");
  creatorStudioMeta.textContent = `${creatorItems.length} creator-ready products live now - From ${money(getStartingPrice(creatorItems))} across audio, display, and workflow picks.`;
  if (creatorStudioStats) {
    creatorStudioStats.innerHTML = [
      `${creatorItems.length} live now`,
      `From ${money(getStartingPrice(creatorItems))}`,
      `${getHomeRatingBadge(creatorItems)} top rating`
    ].map((value) => `<span class="collection-spotlight-stat">${value}</span>`).join("");
  }
}

function renderHomeMomentumBand(sourceProducts) {
  if (!homeMomentumBand) {
    return;
  }
  const retailProducts = sourceProducts.filter((item) => item.segment !== "b2b");
  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  const discountedProducts = countProductsWithDiscount(retailProducts);
  const topRatedProducts = retailProducts.filter((item) => Number(item.rating || 0) >= 4.5).length;
  const categoryCount = getUniqueCollectionCount(retailProducts);

  homeMomentumBand.innerHTML = `
    <article class="momentum-card momentum-card--primary">
      <p class="momentum-card__eyebrow">Blue Tag shopping event</p>
      <strong>Shop the strongest live buying paths before the best inventory moves.</strong>
      <span>${retailProducts.length} live products across ${categoryCount} active shopping lanes, tuned for faster discovery from hero to checkout.</span>
      <div class="momentum-card__chips">
        <span>${retailProducts.length} live now</span>
        <span>${discountedProducts} markdowns</span>
        <span>${topRatedProducts} high-rated picks</span>
      </div>
      <div class="momentum-card__actions">
        <a href="todays-deals.html" class="momentum-card__cta">Shop Top Deals</a>
        <a href="products.html" class="momentum-card__link">Browse all products</a>
      </div>
    </article>
    <article class="momentum-card">
      <p class="momentum-card__eyebrow">Creator Studio</p>
      <strong>${creatorItems.length ? `${creatorItems.length} setup-ready creator picks` : "Creator-ready gear spotlight"}</strong>
      <span>${creatorItems.length ? `Start from ${money(getStartingPrice(creatorItems))} across streaming, editing, and desk-upgrade essentials.` : "Fresh creator gear gets highlighted here as soon as it goes live."}</span>
      <div class="momentum-card__actions">
        <a href="creator-studio.html" class="momentum-card__link">Explore Creator Studio</a>
      </div>
    </article>
    <article class="momentum-card">
      <p class="momentum-card__eyebrow">High-confidence shopping</p>
      <strong>${topRatedProducts} products rated 4.5 stars and above</strong>
      <span>${discountedProducts} discounted offers are live now, with top-rated picks surfaced first across our featured rails.</span>
      <div class="momentum-card__actions">
        <a href="best-sellers.html" class="momentum-card__link">See trusted best sellers</a>
      </div>
    </article>
  `;
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

function badgeEngine(product) {
  const badges = [];
  
  // Sponsored badge (rotate every 30s)
  if (Math.random() < 0.3) {
    badges.push({ type: 'sponsored', label: 'SPONSORED', color: '#ff9900' });
  }
  
  // Prime badge (featured/high rating)
  if (product.featured || product.rating >= 4.7) {
    badges.push({ type: 'prime', label: 'PRIME', color: '#00A8E1' });
  }
  
  // Lightning Deal (discount > 25%)
  const discount = ((product.listPrice - product.price) / product.listPrice * 100);
  if (discount > 25) {
    badges.push({ type: 'deal', label: `${Math.round(discount)}% OFF`, color: '#FF5A1F' });
  }
  
  // Low Stock urgency
  const stockState = getProductStockState(product);
  if (stockState.rank === 1) {
    badges.push({ type: 'stock', label: stockState.label, color: '#CC0000' });
  }
  
  // Best Seller (top rating + sales simulation)
  if (product.rating >= 4.8 && Math.random() < 0.4) {
    badges.push({ type: 'bestseller', label: 'Bestseller', color: '#146EB4' });
  }
  
  return badges.map(badge => 
    `<span class="amazon-badge amazon-${badge.type}" style="--badge-color: ${badge.color}">
      ${badge.label}
    </span>`
  ).join('');
}

function productCard(product) {
  const detailUrl = `product-detail.html?id=${encodeURIComponent(product.id)}`;
  const image = normalizeImageUrl(product.image) || FALLBACK_IMAGE_URL;
  const ribbon = getRibbonLabel(product);
  const badgesHtml = badgeEngine(product);
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
  const ratingReviews = product.rating ? 
    `<span class="rating">${product.rating.toFixed(1)} ★</span>
     <span class="review-count">(2.5K)</span>` : '';

  return `
    <article class="product-card" data-product-id="${product.id}">
      ${ribbon ? `<span class="card-ribbon">${ribbon}</span>` : ""}
      <div class="amazon-badges">${badgesHtml}</div>
      <a href="${detailUrl}" aria-label="Open ${product.name}">
        <div class="image-zoom-container">
          <img src="${image}" alt="${product.name}" loading="lazy" />
        </div>
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${product.name}</a></h3>
        <div class="meta">
          <span class="price-stack">
            <span class="price">${money(price)}</span>
            ${discountMeta}
          </span>
          <div class="rating-reviews">
            ${ratingReviews}
          </div>
        </div>
        ${bulkMeta}
        <div class="card-actions-inline">
          <button class="add-btn" data-id="${product.id}" type="button">${t("products.addToCart")}</button>
          <button class="wishlist-btn ${wishlisted ? "active" : ""}" data-wishlist-id="${product.id}" type="button">${wishlisted ? "♥" : "♡"}</button>
          <button class="quick-view-link quick-view-btn" data-quick-view-id="${product.id}" type="button">Quick view</button>
        </div>
      </div>
    </article>
  `;
}

function renderSegmentProducts(list, targetGrid, targetMeta, labelKey) {
  if (!targetGrid) {
    return;
  }
  targetGrid.innerHTML = list.map(productCard).join("");
  if (targetMeta) {
    targetMeta.textContent = "";
    targetMeta.hidden = true;
  }
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
      item.id = `search-suggestion-${index}`;
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
  handleSearchSuggestionSelection(type, value);
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

function buildProductsSearchUrl(query = "", category = "all") {
  const params = new URLSearchParams();
  const cleanQuery = String(query || "").trim();
  const cleanCategory = String(category || "all").trim().toLowerCase();
  if (cleanQuery) {
    params.set("search", cleanQuery);
  }
  if (cleanCategory && cleanCategory !== "all") {
    params.set("category", cleanCategory);
  }
  const suffix = params.toString();
  return suffix ? `products.html?${suffix}` : "products.html";
}

function handleSearchSuggestionSelection(type, value) {
  closeSearchSuggestions();
  if (type === "product" && value) {
    window.location.href = `product-detail.html?id=${encodeURIComponent(value)}`;
    return;
  }
  if (type === "category" && value) {
    rememberSearchQuery(getReadableCategoryLabel(value));
    window.location.href = buildProductsSearchUrl("", value);
    return;
  }
  if (type === "history" && value) {
    searchInput.value = value;
    rememberSearchQuery(value);
    window.location.href = buildProductsSearchUrl(value, categoryFilter.value || "all");
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

  const sourceProducts = getHomeProducts().filter((item) => item.segment !== "b2b");
  const categoryMatches = Array.from(new Set(sourceProducts
    .map((item) => normalizeHomeCategory(item.category))
    .filter((category) => category && getReadableCategoryLabel(category).toLowerCase().includes(query))))
    .slice(0, 2)
    .map((category) => ({
      type: "category",
      value: category,
      label: getReadableCategoryLabel(category),
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
        meta: `${item.brand} | ${getReadableCategoryLabel(normalizeHomeCategory(item.category))} | ${stockState.label}`,
        kicker: Number(item.rating || 0) > 0 ? `${Number(item.rating).toFixed(1)} star rated` : "Top match",
        stockRank: stockState.rank,
        priceText: money(item.price),
        action: "View",
        image: normalizeImageUrl(item.image || "")
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
    handleSearchSuggestionSelection(type, value);
  }
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
      `<option value="computer">${t("categoryFilter.computer")}</option>`,
      `<option value="laptop">${t("categoryFilter.laptop")}</option>`,
      `<option value="printer">${t("categoryFilter.printer")}</option>`,
      `<option value="mobile">${t("categoryFilter.mobile")}</option>`,
      `<option value="audio">${t("categoryFilter.audio")}</option>`,
      `<option value="accessory">${t("categoryFilter.accessory")}</option>`
    ].join("");
    categoryFilter.value = ["all", "computer", "laptop", "printer", "mobile", "audio", "accessory"].includes(currentValue) ? currentValue : "all";
  }
  renderStores();
}

function renderHomeSurface() {
  const sourceProducts = getHomeProducts();
  syncCategoryFilterOptions(sourceProducts);
  renderQuickGrid(sourceProducts);
  renderCategoryRail(sourceProducts);
  renderDealStrip(sourceProducts);
  renderHeroSection(sourceProducts);
  renderHomeMomentumBand(sourceProducts);
  renderNewArrivalsWindow(sourceProducts);
  renderCreatorStudioSection(sourceProducts);
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
  window.location.href = buildProductsSearchUrl(query, category);
});

searchInput.addEventListener("input", () => {
  filterProducts();
  renderSearchSuggestions();
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
    handleSearchSuggestionSelection(type, value);
  });
}
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
  if (!megaMenu || !megaTrigger) {
    return;
  }
  megaMenu.classList.remove("open");
  megaTrigger.setAttribute("aria-expanded", "false");
}



if (megaTrigger && megaMenu) {
  megaTrigger.addEventListener("click", () => {
    const isOpen = megaMenu.classList.toggle("open");
    megaTrigger.setAttribute("aria-expanded", String(isOpen));
  });
}

document.addEventListener("click", (event) => {
  if (megaMenu && megaTrigger && !megaMenu.contains(event.target) && !megaTrigger.contains(event.target)) {
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
  if (searchSuggestions && searchForm && !searchForm.contains(event.target)) {
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

  if (event.target && event.target.classList && event.target.classList.contains("add-btn")) {
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
void fetchHomeProductsFromApi();

// =============== INTERACTIVE HERO CAROUSEL ===============

class HeroCarousel {
  constructor() {
    this.container = document.querySelector('.hero-carousel');
    if (!this.container) return;

    this.slides = document.querySelectorAll('.carousel-slide');
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');
    this.dots = document.querySelectorAll('.dot');
    this.progressBar = document.querySelector('.progress-bar');

    this.currentSlide = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds
    this.isPaused = false;
    this.touchStartX = 0;
    this.touchEndX = 0;

    if (this.totalSlides === 0 || this.dots.length === 0) {
      return;
    }

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startAutoPlay();
    this.updateProgressBar();
  }

  setupEventListeners() {
    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });

    // Touch/swipe support
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
    this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());

    // Pause on focus (accessibility)
    this.container.addEventListener('focusin', () => this.pauseAutoPlay());
    this.container.addEventListener('focusout', () => this.resumeAutoPlay());
  }

  goToSlide(index) {
    if (index === this.currentSlide) return;

    const currentSlideEl = this.slides[this.currentSlide];
    const currentDotEl = this.dots[this.currentSlide];
    const nextSlideEl = this.slides[index];
    const nextDotEl = this.dots[index];
    if (!nextSlideEl || !nextDotEl) return;

    // Remove active class from current slide
    if (currentSlideEl) {
      currentSlideEl.classList.remove('active');
    }
    if (currentDotEl) {
      currentDotEl.classList.remove('active');
    }

    // Update current slide
    this.currentSlide = index;

    // Add active class to new slide
    nextSlideEl.classList.add('active');
    nextDotEl.classList.add('active');

    // Reset progress bar
    this.updateProgressBar();
  }

  nextSlide() {
    if (this.totalSlides <= 0) return;
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    if (this.totalSlides <= 0) return;
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.autoPlayDelay);
  }

  pauseAutoPlay() {
    this.isPaused = true;
  }

  resumeAutoPlay() {
    this.isPaused = false;
  }

  updateProgressBar() {
    if (!this.progressBar) return;

    // Reset progress bar
    this.progressBar.style.width = '0%';

    // Animate progress bar
    let startTime = null;
    const duration = this.autoPlayDelay;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      this.progressBar.style.width = `${progress * 100}%`;

      if (progress < 1 && !this.isPaused) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.prevSlide();
      }
    }
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HeroCarousel();
});

// Add smooth scrolling for carousel buttons
document.querySelectorAll('.hero-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Add click ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${e.offsetX}px`;
    ripple.style.top = `${e.offsetY}px`;
    btn.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// =============== CUSTOMER TESTIMONIALS INTERACTIVITY ===============

class TestimonialsManager {
  constructor() {
    this.testimonials = document.querySelectorAll('.testimonial-card');
    this.currentIndex = 0;
    this.autoRotateInterval = null;
    this.autoRotateDelay = 8000; // 8 seconds
    this.isPaused = false;

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupHoverEffects();
    this.startAutoRotate();
  }

  setupIntersectionObserver() {
    // Animate testimonials when they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }, { threshold: 0.1 });

    this.testimonials.forEach(testimonial => {
      testimonial.style.opacity = '0';
      testimonial.style.transform = 'translateY(30px)';
      testimonial.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(testimonial);
    });
  }

  setupHoverEffects() {
    this.testimonials.forEach(testimonial => {
      testimonial.addEventListener('mouseenter', () => {
        this.pauseAutoRotate();
      });

      testimonial.addEventListener('mouseleave', () => {
        this.resumeAutoRotate();
      });
    });
  }

  startAutoRotate() {
    this.autoRotateInterval = setInterval(() => {
      if (!this.isPaused && this.testimonials.length > 0) {
        this.rotateTestimonials();
      }
    }, this.autoRotateDelay);
  }

  pauseAutoRotate() {
    this.isPaused = true;
  }

  resumeAutoRotate() {
    this.isPaused = false;
  }

  rotateTestimonials() {
    // Simple rotation effect - could be enhanced with more complex animations
    this.testimonials.forEach((testimonial, index) => {
      if (index === this.currentIndex) {
        testimonial.style.transform = 'scale(1.02)';
        testimonial.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
      } else {
        testimonial.style.transform = 'scale(1)';
        testimonial.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
      }
    });

    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }
}

// Initialize testimonials when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TestimonialsManager();
});

// Trust badges counter animation
function animateCounters() {
  const counters = document.querySelectorAll('.badge-content strong');

  counters.forEach(counter => {
    const target = parseFloat(counter.textContent.replace(/[^\d.]/g, ''));
    if (isNaN(target)) return;

    let current = 0;
    const increment = target / 50; // 50 animation steps
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      // Format based on content type
      if (counter.textContent.includes('+')) {
        counter.textContent = Math.floor(current).toLocaleString() + '+';
      } else if (counter.textContent.includes('%')) {
        counter.textContent = current.toFixed(1) + '%';
      } else if (counter.textContent.includes('/')) {
        counter.textContent = current.toFixed(1) + '/5';
      } else {
        counter.textContent = current.toFixed(1);
      }
    }, 30);
  });
}

// Animate counters when testimonials section comes into view
const testimonialsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      testimonialsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
  const testimonialsSection = document.querySelector('.customer-testimonials');
  if (testimonialsSection) {
    testimonialsObserver.observe(testimonialsSection);
  }
});

// Trending Products Manager
class TrendingProductsManager {
  constructor() {
    this.carousel = document.querySelector('.trending-carousel');
    this.grid = document.querySelector('.trending-grid');
    this.prevBtn = document.querySelector('.carousel-nav.prev');
    this.nextBtn = document.querySelector('.carousel-nav.next');
    this.currentPosition = 0;
    this.cardWidth = 300; // Approximate card width + gap
    this.visibleCards = 4;
    this.maxPosition = 0;

    this.init();
  }

  init() {
    if (!this.carousel) return;

    this.updateMaxPosition();
    this.bindEvents();
    this.animateStats();
    this.setupRecommendationTags();
    this.setupWishlistButtons();
    this.setupQuickAddButtons();

    // Auto-scroll every 5 seconds
    setInterval(() => this.autoScroll(), 5000);
  }

  updateMaxPosition() {
    const cards = this.grid.children.length;
    this.maxPosition = Math.max(0, cards - this.visibleCards);
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => this.scroll(-1));
    this.nextBtn?.addEventListener('click', () => this.scroll(1));

    // Touch/swipe support
    let startX = 0;
    let isDragging = false;

    this.grid.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    this.grid.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diff = startX - currentX;

      if (Math.abs(diff) > 50) {
        e.preventDefault();
        this.scroll(diff > 0 ? 1 : -1);
        isDragging = false;
      }
    });

    this.grid.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Update on window resize
    window.addEventListener('resize', () => {
      this.updateMaxPosition();
      this.updateButtonStates();
    });
  }

  scroll(direction) {
    this.currentPosition = Math.max(0, Math.min(this.maxPosition, this.currentPosition + direction));
    this.updateCarousel();
    this.updateButtonStates();
  }

  autoScroll() {
    if (this.currentPosition >= this.maxPosition) {
      this.currentPosition = 0;
    } else {
      this.currentPosition++;
    }
    this.updateCarousel();
    this.updateButtonStates();
  }

  updateCarousel() {
    const translateX = -this.currentPosition * this.cardWidth;
    this.grid.style.transform = `translateX(${translateX}px)`;
  }

  updateButtonStates() {
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentPosition === 0;
      this.prevBtn.style.opacity = this.currentPosition === 0 ? '0.5' : '1';
    }

    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentPosition >= this.maxPosition;
      this.nextBtn.style.opacity = this.currentPosition >= this.maxPosition ? '0.5' : '1';
    }
  }

  animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(number => {
      const target = parseInt(number.getAttribute('data-target'));
      let current = 0;
      const increment = target / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        number.textContent = Math.floor(current).toLocaleString();
      }, 50);
    });
  }

  setupRecommendationTags() {
    const tags = document.querySelectorAll('.recommendation-tags .tag');

    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        // Remove active class from all tags
        tags.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tag
        tag.classList.add('active');

        // Here you would typically filter products based on the tag
        // For now, we'll just show a visual feedback
        this.filterProducts(tag.textContent.toLowerCase());
      });
    });
  }

  filterProducts(category) {
    // Simulate filtering - in a real app, this would fetch/filter products
    const cards = document.querySelectorAll('.trending-card');

    cards.forEach((card, index) => {
      if (Math.random() > 0.5) { // Random filter simulation
        card.style.opacity = '0.3';
        card.style.transform = 'scale(0.95)';
      } else {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }
    });

    // Reset after 2 seconds
    setTimeout(() => {
      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      });
    }, 2000);
  }

  setupWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');

    wishlistBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.getAttribute('data-product-id');
        this.toggleWishlist(btn, productId);
      });
    });
  }

  toggleWishlist(button, productId) {
    const isActive = button.classList.contains('active');

    if (isActive) {
      button.classList.remove('active');
      button.textContent = '♡';
      this.showNotification('Removed from wishlist', 'info');
    } else {
      button.classList.add('active');
      button.textContent = '♥';
      this.showNotification('Added to wishlist!', 'success');
    }

    // Here you would typically save to localStorage or send to server
    this.updateWishlistStorage(productId, !isActive);
  }

  updateWishlistStorage(productId, isAdding) {
    let wishlist = JSON.parse(localStorage.getItem('electroMart_wishlist') || '[]');

    if (isAdding) {
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
      }
    } else {
      wishlist = wishlist.filter(id => id !== productId);
    }

    localStorage.setItem('electroMart_wishlist', JSON.stringify(wishlist));
  }

  setupQuickAddButtons() {
    const addBtns = document.querySelectorAll('.quick-add-btn');

    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.getAttribute('data-product-id');
        this.addToCart(btn, productId);
      });
    });
  }

  addToCart(button, productId) {
    // Disable button temporarily
    button.disabled = true;
    button.textContent = 'Adding...';

    // Simulate API call
    setTimeout(() => {
      button.disabled = false;
      button.textContent = '✓ Added!';
      this.showNotification('Added to cart successfully!', 'success');

      // Update cart count
      this.updateCartCount();

      setTimeout(() => {
        button.textContent = 'Add to Cart';
      }, 2000);
    }, 1000);

    // Here you would typically send to cart API
    this.updateCartStorage(productId);
  }

  updateCartStorage(productId) {
    let cart = JSON.parse(localStorage.getItem('electroMart_cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('electroMart_cart', JSON.stringify(cart));
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('electroMart_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Update cart badge if it exists
    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize trending products when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TrendingProductsManager();
});

// Notification styles (add to CSS if needed)
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1a73e8;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    font-weight: 500;
  }

  .notification.show {
    transform: translateX(0);
  }

  .notification-success {
    background: #00d4aa;
  }

  .notification-error {
    background: #ff4757;
  }

  .notification-info {
    background: #1a73e8;
  }
`;

// Add notification styles to head
const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);

/* Newsletter Signup Manager */
class NewsletterManager {
  constructor() {
    this.form = document.getElementById('newsletterForm');
    this.emailInput = document.getElementById('newsletterEmail');
    this.submitButton = this.form?.querySelector('.signup-button');
    this.buttonText = this.submitButton?.querySelector('.button-text');
    this.buttonLoading = this.submitButton?.querySelector('.button-loading');

    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.setupFormValidation();
    this.animateSubscriberCount();
  }

  setupFormValidation() {
    this.emailInput?.addEventListener('input', () => {
      this.validateEmail();
    });

    this.emailInput?.addEventListener('blur', () => {
      this.validateEmail();
    });
  }

  validateEmail() {
    const email = this.emailInput.value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    this.emailInput.classList.toggle('invalid', email && !isValid);
    this.emailInput.classList.toggle('valid', email && isValid);

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateEmail()) {
      this.showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Show loading state
    this.setLoadingState(true);

    try {
      // Simulate API call
      await this.submitNewsletter();

      // Success
      this.showNotification('Welcome! Check your email for a 10% discount code.', 'success');
      this.form.reset();
      this.updateSubscriberCount();

    } catch (error) {
      this.showNotification('Something went wrong. Please try again.', 'error');
    } finally {
      this.setLoadingState(false);
    }
  }

  setLoadingState(isLoading) {
    this.submitButton.disabled = isLoading;

    if (isLoading) {
      this.buttonText.style.display = 'none';
      this.buttonLoading.style.display = 'inline';
    } else {
      this.buttonText.style.display = 'inline';
      this.buttonLoading.style.display = 'none';
    }
  }

  async submitNewsletter() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const formData = new FormData(this.form);
    const data = {
      email: formData.get('email'),
      offers: formData.get('offers') === 'on',
      updates: formData.get('updates') === 'on',
      timestamp: new Date().toISOString()
    };

    // Store in localStorage (in real app, this would be an API call)
    const subscribers = JSON.parse(localStorage.getItem('electroMart_newsletter') || '[]');
    subscribers.push(data);
    localStorage.setItem('electroMart_newsletter', JSON.stringify(subscribers));

    // Here you would typically send to your newsletter service
    console.log('Newsletter subscription:', data);
  }

  updateSubscriberCount() {
    const countElement = document.querySelector('.count-number');
    if (countElement) {
      const currentCount = parseInt(countElement.textContent.replace(/[^\d]/g, ''));
      const newCount = currentCount + 1;
      countElement.textContent = newCount.toLocaleString() + '+';
    }
  }

  animateSubscriberCount() {
    const countElement = document.querySelector('.count-number');
    if (!countElement) return;

    const target = parseInt(countElement.textContent.replace(/[^\d]/g, ''));
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      countElement.textContent = Math.floor(current).toLocaleString() + '+';
    }, 50);
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${this.getNotificationIcon(type)}</span>
      <span class="notification-text">${message}</span>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }
}

// Initialize newsletter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NewsletterManager();
});

// Enhanced notification styles
const enhancedNotificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1a73e8;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 400px;
  }

  .notification.show {
    transform: translateX(0);
  }

  .notification-success {
    background: #00d4aa;
  }

  .notification-error {
    background: #ff4757;
  }

  .notification-info {
    background: #1a73e8;
  }

  .notification-icon {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .notification-text {
    flex: 1;
    line-height: 1.4;
  }

  .form-group input.invalid {
    border-color: #ff4757;
    box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
  }

  .form-group input.valid {
    border-color: #00d4aa;
    box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.1);
  }
`;

// Add enhanced notification styles
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = enhancedNotificationStyles;
document.head.appendChild(enhancedStyle);

/* Interactive Elements Manager */
class InteractiveElementsManager {
  constructor() {
    this.fabMain = document.getElementById('fabMain');
    this.fabMenu = document.getElementById('fabMenu');
    this.progressBar = document.getElementById('progressBar');
    this.liveChatWidget = document.getElementById('liveChatWidget');
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.chatSend = document.querySelector('.chat-send');
    this.chatClose = document.querySelector('.chat-close');

    this.init();
  }

  init() {
    this.setupFloatingActionButton();
    this.setupScrollProgress();
    this.setupLiveChat();
    this.updateBadges();
  }

  setupFloatingActionButton() {
    this.fabMain?.addEventListener('click', () => {
      this.toggleFabMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.fabMain?.contains(e.target) && !this.fabMenu?.contains(e.target)) {
        this.closeFabMenu();
      }
    });

    // Handle FAB menu item clicks
    this.fabMenu?.addEventListener('click', (e) => {
      const fabItem = e.target.closest('.fab-item');
      if (fabItem) {
        const action = fabItem.dataset.action;
        this.handleFabAction(action);
      }
    });
  }

  toggleFabMenu() {
    const isActive = this.fabMenu?.classList.contains('active');
    if (isActive) {
      this.closeFabMenu();
    } else {
      this.openFabMenu();
    }
  }

  openFabMenu() {
    this.fabMain?.classList.add('active');
    this.fabMenu?.classList.add('active');
  }

  closeFabMenu() {
    this.fabMain?.classList.remove('active');
    this.fabMenu?.classList.remove('active');
  }

  handleFabAction(action) {
    switch (action) {
      case 'cart':
        this.scrollToSection('cart.html');
        break;
      case 'wishlist':
        this.showWishlistModal();
        break;
      case 'compare':
        this.showCompareModal();
        break;
      case 'chat':
        this.toggleLiveChat();
        break;
      case 'top':
        this.scrollToTop();
        break;
    }
    this.closeFabMenu();
  }

  scrollToSection(url) {
    window.location.href = url;
  }

  showWishlistModal() {
    const wishlist = JSON.parse(localStorage.getItem('electroMart_wishlist') || '[]');
    if (wishlist.length === 0) {
      this.showNotification('Your wishlist is empty', 'info');
      return;
    }
    // In a real app, this would open a wishlist modal
    this.showNotification(`You have ${wishlist.length} items in your wishlist`, 'info');
  }

  showCompareModal() {
    const compare = JSON.parse(localStorage.getItem('electroMart_compare') || '[]');
    if (compare.length === 0) {
      this.showNotification('Add products to compare', 'info');
      return;
    }
    // In a real app, this would open a comparison modal
    this.showNotification(`Comparing ${compare.length} products`, 'info');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setupScrollProgress() {
    window.addEventListener('scroll', () => {
      this.updateScrollProgress();
    });
    this.updateScrollProgress(); // Initial call
  }

  updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    this.progressBar.style.width = Math.min(scrollPercent, 100) + '%';
  }

  setupLiveChat() {
    this.chatSend?.addEventListener('click', () => this.sendMessage());
    this.chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    this.chatClose?.addEventListener('click', () => this.closeLiveChat());
  }

  toggleLiveChat() {
    if (this.liveChatWidget.classList.contains('show')) {
      this.closeLiveChat();
    } else {
      this.openLiveChat();
    }
  }

  openLiveChat() {
    this.liveChatWidget.classList.add('show');
    this.chatInput?.focus();
  }

  closeLiveChat() {
    this.liveChatWidget.classList.remove('show');
  }

  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.addMessage(message, 'sent');
    this.chatInput.value = '';

    // Simulate bot response
    setTimeout(() => {
      const responses = [
        "Thanks for your message! How can I help you with your order?",
        "I'd be happy to assist you with that. Could you provide more details?",
        "That's a great question! Let me check that for you.",
        "I understand. Let me connect you with our specialist.",
        "Perfect! Is there anything else I can help you with today?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      this.addMessage(randomResponse, 'received');
    }, 1000 + Math.random() * 2000);
  }

  addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
      <p>${text}</p>
      <span class="message-time">Just now</span>
    `;
    this.chatMessages.appendChild(messageDiv);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  updateBadges() {
    // Update cart count
    const cart = JSON.parse(localStorage.getItem('electroMart_cart') || '[]');
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cart-count');
    if (cartBadge) {
      cartBadge.textContent = cartCount;
      cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }

    // Update wishlist count
    const wishlist = JSON.parse(localStorage.getItem('electroMart_wishlist') || '[]');
    const wishlistBadge = document.querySelector('.wishlist-count');
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlist.length;
      wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }

    // Update compare count
    const compare = JSON.parse(localStorage.getItem('electroMart_compare') || '[]');
    const compareBadge = document.querySelector('.compare-count');
    if (compareBadge) {
      compareBadge.textContent = compare.length;
      compareBadge.style.display = compare.length > 0 ? 'flex' : 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${this.getNotificationIcon(type)}</span>
      <span class="notification-text">${message}</span>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }
}

// Initialize interactive elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new InteractiveElementsManager();
  new SeasonalPromotionsManager();
});

// Seasonal promotions countdown timer
class SeasonalPromotionsManager {
  constructor() {
    this.countdownElements = document.querySelectorAll('.seasonal-promotions .countdown');
    this.init();
  }

  init() {
    if (!this.countdownElements.length) return;
    this.updateCountdowns();
    setInterval(() => this.updateCountdowns(), 1000);
  }

  updateCountdowns() {
    const now = new Date();

    this.countdownElements.forEach((countdown) => {
      const deadline = new Date(countdown.getAttribute('data-deadline'));
      const diff = deadline - now;

      if (diff <= 0) {
        countdown.innerHTML = '<span class="countdown-item">Offer ended</span>';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const timeStrings = {
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      };

      countdown.querySelector('.days').textContent = timeStrings.days;
      countdown.querySelector('.hours').textContent = timeStrings.hours;
      countdown.querySelector('.minutes').textContent = timeStrings.minutes;
      countdown.querySelector('.seconds').textContent = timeStrings.seconds;
    });
  }
}
