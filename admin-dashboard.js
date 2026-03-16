const AUTH_STORAGE_KEY = "electromart_auth_v1";
const LOCAL_USERS_KEY = "electromart_local_users_v1";
const OFFLINE_ORDERS_KEY = "electromart_offline_orders_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const INVOICE_LOG_KEY = "electromart_invoice_log_v1";
const CATEGORY_STORAGE_KEY = "electromart_categories_v1";
const MENU_STORAGE_KEY = "electromart_menu_v1";
const BACK_IN_STOCK_REQUESTS_STORAGE_KEY = "electromart_back_in_stock_requests_v1";
const INVENTORY_SETTINGS_STORAGE_KEY = "electromart_inventory_settings_v1";
const ADMIN_TOAST_STACK_ID = "adminToastStack";
const API_BASE_URL = (() => {
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:4000/api";
  }
  const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  return `${origin}/api`;
})();

const adminMessage = document.getElementById("adminMessage");
const refreshBtn = document.getElementById("refreshBtn");
const backendStatusBadge = document.getElementById("backendStatusBadge");
const usersMeta = document.getElementById("usersMeta");
const ordersMeta = document.getElementById("ordersMeta");
const salesMeta = document.getElementById("salesMeta");
const afterSalesMeta = document.getElementById("afterSalesMeta");
const afterSalesSummaryCards = document.getElementById("afterSalesSummaryCards");
const afterSalesSearchInput = document.getElementById("afterSalesSearchInput");
const afterSalesTypeFilter = document.getElementById("afterSalesTypeFilter");
const afterSalesStatusFilter = document.getElementById("afterSalesStatusFilter");
const afterSalesTableBody = document.getElementById("afterSalesTableBody");
const afterSalesOrderIdInput = document.getElementById("afterSalesOrderIdInput");
const afterSalesTypeInput = document.getElementById("afterSalesTypeInput");
const afterSalesReasonInput = document.getElementById("afterSalesReasonInput");
const afterSalesRequestedByInput = document.getElementById("afterSalesRequestedByInput");
const afterSalesRefundAmountInput = document.getElementById("afterSalesRefundAmountInput");
const afterSalesNoteInput = document.getElementById("afterSalesNoteInput");
const createAfterSalesCaseBtn = document.getElementById("createAfterSalesCaseBtn");
const catalogMeta = document.getElementById("catalogMeta");
const catalogHealth = document.getElementById("catalogHealth");
const inventoryThresholdInput = document.getElementById("inventoryThresholdInput");
const inventoryRestockInput = document.getElementById("inventoryRestockInput");
const inventoryRefreshBtn = document.getElementById("inventoryRefreshBtn");
const inventoryShowLowBtn = document.getElementById("inventoryShowLowBtn");
const inventoryShowOutBtn = document.getElementById("inventoryShowOutBtn");
const inventoryShowAllBtn = document.getElementById("inventoryShowAllBtn");
const inventoryRestockSelectedBtn = document.getElementById("inventoryRestockSelectedBtn");
const inventoryRestockVisibleBtn = document.getElementById("inventoryRestockVisibleBtn");
const inventorySummary = document.getElementById("inventorySummary");
const inventoryAlertList = document.getElementById("inventoryAlertList");
const inventoryThresholdMeta = document.getElementById("inventoryThresholdMeta");
const inventoryThresholdMessage = document.getElementById("inventoryThresholdMessage");
const saveInventorySettingsBtn = document.getElementById("saveInventorySettingsBtn");
const resetInventorySettingsBtn = document.getElementById("resetInventorySettingsBtn");
const inventoryThresholdList = document.getElementById("inventoryThresholdList");
const backInStockMeta = document.getElementById("backInStockMeta");
const backInStockSearchInput = document.getElementById("backInStockSearchInput");
const backInStockStatusFilter = document.getElementById("backInStockStatusFilter");
const backInStockRefreshBtn = document.getElementById("backInStockRefreshBtn");
const backInStockDemandList = document.getElementById("backInStockDemandList");
const backInStockTableBody = document.getElementById("backInStockTableBody");
const usersTableBody = document.getElementById("usersTableBody");
const ordersTableBody = document.getElementById("ordersTableBody");
const salesTableBody = document.getElementById("salesTableBody");
const catalogTableBody = document.getElementById("catalogTableBody");
const userSearch = document.getElementById("userSearch");
const userRoleFilter = document.getElementById("userRoleFilter");
const userPhoneVerificationFilter = document.getElementById("userPhoneVerificationFilter");
const orderSearchAdmin = document.getElementById("orderSearchAdmin");
const orderStatusFilterAdmin = document.getElementById("orderStatusFilterAdmin");
const catalogSearch = document.getElementById("catalogSearch");
const catalogCategoryFilter = document.getElementById("catalogCategoryFilter");
const catalogSegmentFilter = document.getElementById("catalogSegmentFilter");
const catalogBulkAction = document.getElementById("catalogBulkAction");
const catalogBulkCollectionsInput = document.getElementById("catalogBulkCollectionsInput");
const applyCatalogBulkBtn = document.getElementById("applyCatalogBulkBtn");
const clearCatalogSelectionBtn = document.getElementById("clearCatalogSelectionBtn");
const exportCatalogBtn = document.getElementById("exportCatalogBtn");
const downloadCleanCatalogCsvBtn = document.getElementById("downloadCleanCatalogCsvBtn");
const importCatalogBtn = document.getElementById("importCatalogBtn");
const importCatalogFileInput = document.getElementById("importCatalogFileInput");
const normalizeMediaBtn = document.getElementById("normalizeMediaBtn");
const importCatalogPreviewMeta = document.getElementById("importCatalogPreviewMeta");
const importCatalogPreviewWrap = document.getElementById("importCatalogPreviewWrap");
const importCatalogPreviewHead = document.getElementById("importCatalogPreviewHead");
const importCatalogPreviewBody = document.getElementById("importCatalogPreviewBody");
const selectAllCatalogProducts = document.getElementById("selectAllCatalogProducts");
const productForm = document.getElementById("productForm");
const productIdInput = document.getElementById("productIdInput");
const productSkuInput = document.getElementById("productSkuInput");
const productNameInput = document.getElementById("productNameInput");
const productBrandInput = document.getElementById("productBrandInput");
const productCategoryInput = document.getElementById("productCategoryInput");
const productCollectionsInput = document.getElementById("productCollectionsInput");
const productCollectionOptionList = document.getElementById("productCollectionOptionList");
const productCollectionCustomInput = document.getElementById("productCollectionCustomInput");
const addProductCollectionCustomBtn = document.getElementById("addProductCollectionCustomBtn");
const productCollectionsSelectionMeta = document.getElementById("productCollectionsSelectionMeta");
const productSegmentInput = document.getElementById("productSegmentInput");
const productPriceInput = document.getElementById("productPriceInput");
const productListPriceInput = document.getElementById("productListPriceInput");
const productStockInput = document.getElementById("productStockInput");
const productRatingInput = document.getElementById("productRatingInput");
const productMoqInput = document.getElementById("productMoqInput");
const productStatusInput = document.getElementById("productStatusInput");
const productFulfillmentInput = document.getElementById("productFulfillmentInput");
const productKeywordsInput = document.getElementById("productKeywordsInput");
const productDescriptionInput = document.getElementById("productDescriptionInput");
const productDefinitionInput = document.getElementById("productDefinitionInput");
const addProductDefinitionBtn = document.getElementById("addProductDefinitionBtn");
const productImageInput = document.getElementById("productImageInput");
const productGalleryFields = document.getElementById("productGalleryFields");
const productImageFileInput = document.getElementById("productImageFileInput");
const productImagePreview = document.getElementById("productImagePreview");
const productVideoPreview = document.getElementById("productVideoPreview");
const productImageHelp = document.getElementById("productImageHelp");
const productMediaUploadProgressWrap = document.getElementById("productMediaUploadProgressWrap");
const productMediaUploadProgress = document.getElementById("productMediaUploadProgress");
const productMediaUploadProgressText = document.getElementById("productMediaUploadProgressText");
const retryDriveUploadBtn = document.getElementById("retryDriveUploadBtn");
const mediaStudioGrid = document.getElementById("mediaStudioGrid");
const photoStudioEditor = document.getElementById("photoStudioEditor");
const photoStudioCanvas = document.getElementById("photoStudioCanvas");
const photoStudioHint = document.getElementById("photoStudioHint");
const studioCropSquareBtn = document.getElementById("studioCropSquareBtn");
const studioCrop43Btn = document.getElementById("studioCrop43Btn");
const studioCrop169Btn = document.getElementById("studioCrop169Btn");
const studioCustomCropToggleBtn = document.getElementById("studioCustomCropToggleBtn");
const studioApplyCustomCropBtn = document.getElementById("studioApplyCustomCropBtn");
const studioExtendBtn = document.getElementById("studioExtendBtn");
const studioRotateLeftBtn = document.getElementById("studioRotateLeftBtn");
const studioRotateRightBtn = document.getElementById("studioRotateRightBtn");
const studioFlipHorizontalBtn = document.getElementById("studioFlipHorizontalBtn");
const studioFlipVerticalBtn = document.getElementById("studioFlipVerticalBtn");
const studioBrightnessInput = document.getElementById("studioBrightnessInput");
const studioContrastInput = document.getElementById("studioContrastInput");
const studioSaturationInput = document.getElementById("studioSaturationInput");
const studioBlurInput = document.getElementById("studioBlurInput");
const studioApplySharpenBtn = document.getElementById("studioApplySharpenBtn");
const studioApplyVignetteBtn = document.getElementById("studioApplyVignetteBtn");
const studioFilterPreset = document.getElementById("studioFilterPreset");
const studioEraserToggleBtn = document.getElementById("studioEraserToggleBtn");
const studioEraserSizeInput = document.getElementById("studioEraserSizeInput");
const studioTextInput = document.getElementById("studioTextInput");
const studioAddTextBtn = document.getElementById("studioAddTextBtn");
const studioAddDecorativeBtn = document.getElementById("studioAddDecorativeBtn");
const studioAddStickerBtn = document.getElementById("studioAddStickerBtn");
const studioOverlayColorInput = document.getElementById("studioOverlayColorInput");
const studioOverlayOpacityInput = document.getElementById("studioOverlayOpacityInput");
const studioApplyOverlayBtn = document.getElementById("studioApplyOverlayBtn");
const studioBackgroundInput = document.getElementById("studioBackgroundInput");
const studioApplyBackgroundBtn = document.getElementById("studioApplyBackgroundBtn");
const studioBorderColorInput = document.getElementById("studioBorderColorInput");
const studioBorderSizeInput = document.getElementById("studioBorderSizeInput");
const studioApplyBorderBtn = document.getElementById("studioApplyBorderBtn");
const studioUndoBtn = document.getElementById("studioUndoBtn");
const studioRedoBtn = document.getElementById("studioRedoBtn");
const studioDownloadBtn = document.getElementById("studioDownloadBtn");
const studioResetBtn = document.getElementById("studioResetBtn");
const studioSaveBtn = document.getElementById("studioSaveBtn");
const productFeaturedInput = document.getElementById("productFeaturedInput");
const saveProductBtn = document.getElementById("saveProductBtn");
const cancelProductEditBtn = document.getElementById("cancelProductEditBtn");
const productFormMessage = document.getElementById("productFormMessage");
const newCategoryInput = document.getElementById("newCategoryInput");
const newCategoryDescriptionInput = document.getElementById("newCategoryDescriptionInput");
const newCategoryImageInput = document.getElementById("newCategoryImageInput");
const newCategoryActiveInput = document.getElementById("newCategoryActiveInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const cancelCategoryEditBtn = document.getElementById("cancelCategoryEditBtn");
const categorySearchInput = document.getElementById("categorySearchInput");
const categoryStatusFilter = document.getElementById("categoryStatusFilter");
const categorySortInput = document.getElementById("categorySortInput");
const categoryRefreshBtn = document.getElementById("categoryRefreshBtn");
const categoryExportBtn = document.getElementById("categoryExportBtn");
const categoryImportBtn = document.getElementById("categoryImportBtn");
const categoryImportInput = document.getElementById("categoryImportInput");
const categorySummary = document.getElementById("categorySummary");
const categoryManagerMessage = document.getElementById("categoryManagerMessage");
const categoryManagerList = document.getElementById("categoryManagerList");
const sourcingMeta = document.getElementById("sourcingMeta");
const sourcingTypeFilter = document.getElementById("sourcingTypeFilter");
const sourcingSearchInput = document.getElementById("sourcingSearchInput");
const sourcingRefreshBtn = document.getElementById("sourcingRefreshBtn");
const sourcingQuickAllBtn = document.getElementById("sourcingQuickAllBtn");
const sourcingQuickPodBtn = document.getElementById("sourcingQuickPodBtn");
const sourcingQuickDropBtn = document.getElementById("sourcingQuickDropBtn");
const sourcingList = document.getElementById("sourcingList");
const menuLabelInput = document.getElementById("menuLabelInput");
const menuHrefInput = document.getElementById("menuHrefInput");
const menuEditIndexInput = document.getElementById("menuEditIndexInput");
const menuVisibleInput = document.getElementById("menuVisibleInput");
const menuAddBtn = document.getElementById("menuAddBtn");
const menuCancelEditBtn = document.getElementById("menuCancelEditBtn");
const menuClearBtn = document.getElementById("menuClearBtn");
const menuResetBtn = document.getElementById("menuResetBtn");
const menuManagerMessage = document.getElementById("menuManagerMessage");
const menuTableBody = document.getElementById("menuTableBody");

const statUsers = document.getElementById("statUsers");
const statProducts = document.getElementById("statProducts");
const statOrders = document.getElementById("statOrders");
const statPayments = document.getElementById("statPayments");
const statRevenue = document.getElementById("statRevenue");
const sellerWorkbenchCards = document.getElementById("sellerWorkbenchCards");
const sellerServiceHub = document.getElementById("sellerServiceHub");
const sellerQueueMeta = document.getElementById("sellerQueueMeta");
const sellerActionQueue = document.getElementById("sellerActionQueue");
const kpiAov = document.getElementById("kpiAov");
const kpiPaidOrders = document.getElementById("kpiPaidOrders");
const kpiCancellationRate = document.getElementById("kpiCancellationRate");
const kpiOrdersToday = document.getElementById("kpiOrdersToday");
const revenue7dTotal = document.getElementById("revenue7dTotal");
const revenueBars = document.getElementById("revenueBars");
const statusBreakdownList = document.getElementById("statusBreakdownList");
const paymentBreakdownList = document.getElementById("paymentBreakdownList");
const topProductsList = document.getElementById("topProductsList");
const invoiceMeta = document.getElementById("invoiceMeta");
const invoiceTableBody = document.getElementById("invoiceTableBody");
const orderNotificationsMeta = document.getElementById("orderNotificationsMeta");
const orderNotificationChannelStats = document.getElementById("orderNotificationChannelStats");
const orderNotificationChannelFilter = document.getElementById("orderNotificationChannelFilter");
const orderNotificationStatusFilter = document.getElementById("orderNotificationStatusFilter");
const orderNotificationsTableBody = document.getElementById("orderNotificationsTableBody");
const adminAuditMeta = document.getElementById("adminAuditMeta");
const adminAuditStats = document.getElementById("adminAuditStats");
const adminAuditSearchInput = document.getElementById("adminAuditSearchInput");
const adminAuditCategoryFilter = document.getElementById("adminAuditCategoryFilter");
const refreshAdminAuditBtn = document.getElementById("refreshAdminAuditBtn");
const adminAuditTableBody = document.getElementById("adminAuditTableBody");
const phoneVerificationAutomationMeta = document.getElementById("phoneVerificationAutomationMeta");
const phoneVerificationAutomationSummary = document.getElementById("phoneVerificationAutomationSummary");
const phoneVerificationAutomationSettingsMeta = document.getElementById("phoneVerificationAutomationSettingsMeta");
const phoneVerificationAutomationHistoryMeta = document.getElementById("phoneVerificationAutomationHistoryMeta");
const phoneVerificationAutomationHistoryStats = document.getElementById("phoneVerificationAutomationHistoryStats");
const phoneVerificationAutomationHistoryChart = document.getElementById("phoneVerificationAutomationHistoryChart");
const phoneVerificationAutomationHistoryTableBody = document.getElementById("phoneVerificationAutomationHistoryTableBody");
const phoneVerificationReminderChannelStats = document.getElementById("phoneVerificationReminderChannelStats");
const runPhoneVerificationAutomationBtn = document.getElementById("runPhoneVerificationAutomationBtn");
const phoneVerificationAutomationEnabledInput = document.getElementById("phoneVerificationAutomationEnabledInput");
const phoneVerificationAutomationRunOnStartInput = document.getElementById("phoneVerificationAutomationRunOnStartInput");
const phoneVerificationAutomationIntervalInput = document.getElementById("phoneVerificationAutomationIntervalInput");
const phoneVerificationAutomationLimitInput = document.getElementById("phoneVerificationAutomationLimitInput");
const phoneVerificationAutomationSmsChannelInput = document.getElementById("phoneVerificationAutomationSmsChannelInput");
const phoneVerificationAutomationEmailChannelInput = document.getElementById("phoneVerificationAutomationEmailChannelInput");
const savePhoneVerificationAutomationSettingsBtn = document.getElementById("savePhoneVerificationAutomationSettingsBtn");
const resetPhoneVerificationAutomationSettingsBtn = document.getElementById("resetPhoneVerificationAutomationSettingsBtn");
const phoneVerificationReminderChannelFilter = document.getElementById("phoneVerificationReminderChannelFilter");
const phoneVerificationReminderStatusFilter = document.getElementById("phoneVerificationReminderStatusFilter");
const phoneVerificationReminderTableBody = document.getElementById("phoneVerificationReminderTableBody");
const adminHeadSection = document.querySelector(".admin-head");
const adminQuickActionsSection = document.querySelector(".admin-quick-actions");

let allUsers = [];
let allOrders = [];
let allAfterSalesCases = [];
let currentAfterSalesSummary = {};
let allCatalogProducts = [];
let visibleCatalogProducts = [];
let catalogInventoryValue = 0;
let catalogStockFilterMode = "all";
let currentInventorySettings = {
  defaultLowStockThreshold: 5,
  restockTarget: 10,
  categoryThresholds: {}
};
let selectedCatalogProductIds = new Set();
let allBackInStockRequests = [];
let visibleBackInStockRequests = [];
let backInStockDemandByProduct = [];
let allOrderNotifications = [];
let allAdminAuditEntries = [];
let allPhoneVerificationReminders = [];
let currentPhoneVerificationAutomationHistory = [];
let currentPhoneVerificationAutomationHistorySummary = {};
let currentOrderNotificationFilters = {
  channel: "all",
  status: "all"
};
let currentAdminAuditFilters = {
  category: "all",
  search: ""
};
let currentPhoneVerificationAutomationSettings = {};
let currentPhoneVerificationAutomationSummary = {};
let currentPhoneVerificationAutomationJob = {};
let currentPhoneVerificationReminderFilters = {
  channel: "all",
  status: "all"
};
let uploadedProductMediaDataUrls = [];
let pendingDriveRetryUploads = [];
let pendingDriveRetryCategory = "";
let isBackendOnline = false;
let activeStudioIndex = -1;
let studioOriginalImageDataUrl = "";
let studioCurrentImageDataUrl = "";
let studioEraserEnabled = false;
let studioHistory = [];
let studioHistoryIndex = -1;
let catalogRenderToken = 0;
let studioCustomCropMode = false;
let studioCropSelection = null;
let studioCropPointerStart = null;
let studioPointerDown = false;
let editingCategorySlug = "";
let sourcingAddInProgress = new Set();
let lastAdminToastKey = "";
let lastAdminToastAt = 0;
let adminOrderFilterChipController = null;
let adminCatalogFilterChipController = null;
let adminAfterSalesFilterChipController = null;
let adminUserFilterChipController = null;
let adminAuditFilterChipController = null;
let selectedProductCollections = new Set();
const MAX_PRODUCT_IMAGES = 15;
const MAX_UPLOAD_IMAGE_MB = 15;
const MAX_UPLOAD_VIDEO_MB = 50;
const MAX_UPLOAD_BATCH_MB = 90;
const MAX_IMPORT_CSV_MB = 30;
const MAX_IMPORT_CSV_BYTES = MAX_IMPORT_CSV_MB * 1024 * 1024;
const CSV_PREVIEW_MAX_CHARS = 96;
const VIDEO_FILE_EXTENSIONS = new Set(["mp4", "webm", "ogg", "mov", "m4v", "avi", "mkv"]);
const IMAGE_FILE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp"]);
const DEFAULT_CATEGORIES = ["laptop", "mobile", "audio", "accessory", "computer", "printer"];
const DEFAULT_COLLECTION_OPTIONS = [
  "all-products",
  "best-sellers",
  "todays-deals",
  "mega-store",
  "creator-studio",
  "laptop",
  "mobile",
  "audio",
  "accessory",
  "computer",
  "printer",
  "gaming",
  "home-office"
];
const DEFAULT_WEBSITE_MENU = [
    { label: "Terms", href: "terms-and-conditions.html" },
  { label: "Shipping", href: "shipping-policy.html" },
  { label: "Refund", href: "refund-policy.html" },
  { label: "Accessibility", href: "accessibility-statement.html" },
  { label: "FAQ", href: "faq.html" },
  { label: "Review", href: "review.html" }
];
const ADMIN_VIEW_CONFIG = {
  dashboard: {
    label: "Dashboard",
    selectors: ["#summary", ".seller-service-grid", "#analytics", "#invoices", "#orderNotifications", "#adminAuditTrail", "#users", "#phoneVerificationAutomation", "#sales", "#afterSales", "#catalog", "#menuManager", "#orders"]
  },
  overview: {
    label: "Overview",
    selectors: ["#summary", ".seller-service-grid"]
  },
  analytics: {
    label: "Analytics",
    selectors: ["#analytics"]
  },
  orders: {
    label: "Orders",
    selectors: ["#orders"]
  },
  sales: {
    label: "Sales",
    selectors: ["#sales"]
  },
  notifications: {
    label: "Notifications",
    selectors: ["#orderNotifications"]
  },
  "after-sales": {
    label: "Returns and Refunds",
    selectors: ["#afterSales"]
  },
  users: {
    label: "Users",
    selectors: ["#users"]
  },
  audit: {
    label: "Audit Trail",
    selectors: ["#adminAuditTrail"]
  },
  listing: {
    label: "Listing",
    selectors: ["#catalog"]
  },
  "phone-verification": {
    label: "Phone Verification",
    selectors: ["#phoneVerificationAutomation"]
  },
  menu: {
    label: "Menu Manager",
    selectors: ["#menuManager"]
  }
};
const ADMIN_VIEW_ALIASES = {
  catalog: "listing",
  products: "listing",
  "after-sales": "after-sales",
  aftersales: "after-sales",
  notifications: "notifications",
  users: "users",
  orders: "orders",
  sales: "sales",
  listing: "listing",
  overview: "overview",
  analytics: "analytics",
  audit: "audit",
  menu: "menu",
  dashboard: "dashboard",
  "phone-verification": "phone-verification",
  phoneverification: "phone-verification"
};
const ADMIN_PAGE_BY_VIEW = {
  dashboard: "admin-dashboard.html",
  overview: "admin-overview.html",
  analytics: "admin-analytics.html",
  orders: "admin-orders.html",
  sales: "admin-sales.html",
  notifications: "admin-notifications.html",
  "after-sales": "admin-after-sales.html",
  users: "admin-users.html",
  audit: "admin-audit.html",
  listing: "admin-listing.html",
  "phone-verification": "admin-phone-verification.html",
  menu: "admin-menu-manager.html"
};
const SOURCING_TEMPLATE_PRODUCTS = [
  {
    id: "pod-phone-case-matte",
    sourceType: "print-on-demand",
    sku: "POD-CASE-MATTE-01",
    name: "Custom Matte Phone Case",
    brand: "PrintWave Studio",
    category: "mobile",
    segment: "b2c",
    price: 799,
    listPrice: 1499,
    stock: 40,
    rating: 4.4,
    moq: 1,
    status: "active",
    fulfillment: "fbm",
    featured: false,
    supplier: "PrintWave India",
    leadTimeDays: 3,
    description: "Personalized matte finish case with full-wrap UV print and scratch-resistant coating.",
    keywords: ["print on demand", "phone case", "custom gift", "mobile accessory"],
    collections: ["mobile", "accessory"],
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pod-laptop-sleeve",
    sourceType: "print-on-demand",
    sku: "POD-SLEEVE-15-02",
    name: "Printed 15-inch Laptop Sleeve",
    brand: "InkThread POD",
    category: "laptop",
    segment: "b2c",
    price: 1299,
    listPrice: 2299,
    stock: 28,
    rating: 4.3,
    moq: 1,
    status: "active",
    fulfillment: "fbm",
    featured: false,
    supplier: "InkThread Fulfillment",
    leadTimeDays: 4,
    description: "Shock-absorbing neoprene sleeve with custom front print and zipper protection.",
    keywords: ["print on demand", "laptop sleeve", "custom laptop cover"],
    collections: ["laptop", "accessory"],
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pod-desk-mat",
    sourceType: "print-on-demand",
    sku: "POD-DESKMAT-XL-03",
    name: "XL Custom Desk Mat",
    brand: "PrintWave Studio",
    category: "computer",
    segment: "b2c",
    price: 999,
    listPrice: 1899,
    stock: 55,
    rating: 4.6,
    moq: 1,
    status: "active",
    fulfillment: "fbm",
    featured: false,
    supplier: "PrintWave India",
    leadTimeDays: 2,
    description: "Extended anti-slip desk mat with vivid edge-to-edge sublimation print.",
    keywords: ["print on demand", "desk mat", "gaming desk"],
    collections: ["computer", "gaming", "accessory"],
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pod-wireless-charger-skin",
    sourceType: "print-on-demand",
    sku: "POD-SKIN-WCH-04",
    name: "Wireless Charger Skin Pack",
    brand: "SkinForge",
    category: "accessory",
    segment: "b2c",
    price: 499,
    listPrice: 999,
    stock: 60,
    rating: 4.1,
    moq: 1,
    status: "active",
    fulfillment: "fbm",
    featured: false,
    supplier: "SkinForge Print Hub",
    leadTimeDays: 3,
    description: "Durable custom vinyl skins for Qi wireless chargers, bubble-free application.",
    keywords: ["print on demand", "wireless charger", "skin"],
    collections: ["mobile", "accessory"],
    image: "https://images.unsplash.com/photo-1615525137689-198778541afc?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "drop-usb-c-hub-9in1",
    sourceType: "dropshipping",
    sku: "DROP-HUB-9IN1-11",
    name: "USB-C 9-in-1 Multiport Hub",
    brand: "TechLink",
    category: "accessory",
    segment: "b2c",
    price: 2399,
    listPrice: 3999,
    stock: 22,
    rating: 4.2,
    moq: 1,
    status: "active",
    fulfillment: "fba",
    featured: false,
    supplier: "Shenzhen TechLink",
    leadTimeDays: 7,
    description: "HDMI, PD charging, SD card and ethernet support for work-from-home setups.",
    keywords: ["dropshipping", "usb c hub", "multiport adapter"],
    collections: ["laptop", "accessory", "computer"],
    image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e6?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "drop-ergonomic-stand",
    sourceType: "dropshipping",
    sku: "DROP-STAND-ALU-12",
    name: "Foldable Aluminum Laptop Stand",
    brand: "DeskCore",
    category: "laptop",
    segment: "b2c",
    price: 1499,
    listPrice: 2799,
    stock: 35,
    rating: 4.5,
    moq: 1,
    status: "active",
    fulfillment: "fba",
    featured: false,
    supplier: "DeskCore Supply",
    leadTimeDays: 6,
    description: "Ventilated ergonomic stand with adjustable angle and anti-slip silicone pads.",
    keywords: ["dropshipping", "laptop stand", "ergonomic"],
    collections: ["laptop", "home-office", "accessory"],
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "drop-webcam-fhd",
    sourceType: "dropshipping",
    sku: "DROP-WEBCAM-FHD-13",
    name: "1080p USB Webcam with Mic",
    brand: "VisionPro",
    category: "computer",
    segment: "b2c",
    price: 1899,
    listPrice: 3299,
    stock: 26,
    rating: 4.0,
    moq: 1,
    status: "active",
    fulfillment: "fba",
    featured: false,
    supplier: "VisionPro Global",
    leadTimeDays: 8,
    description: "Plug-and-play webcam with dual noise-reduction microphones and privacy shutter.",
    keywords: ["dropshipping", "webcam", "work from home"],
    collections: ["computer", "accessory", "home-office"],
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "drop-bluetooth-speaker-mini",
    sourceType: "dropshipping",
    sku: "DROP-SPK-MINI-14",
    name: "Mini Portable Bluetooth Speaker",
    brand: "SoundNest",
    category: "audio",
    segment: "b2c",
    price: 1399,
    listPrice: 2499,
    stock: 30,
    rating: 4.3,
    moq: 1,
    status: "active",
    fulfillment: "fba",
    featured: false,
    supplier: "SoundNest Labs",
    leadTimeDays: 5,
    description: "Compact IPX5 speaker with deep bass profile and up to 12 hours playback.",
    keywords: ["dropshipping", "bluetooth speaker", "audio"],
    collections: ["audio", "smart-home"],
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1200&q=80"
  }
];
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

function readSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function loadJsonStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallbackValue;
    return parsed == null ? fallbackValue : parsed;
  } catch (error) {
    return fallbackValue;
  }
}

function scheduleUiTask(callback) {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(callback);
    return;
  }
  window.setTimeout(callback, 0);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildOfflineAnalytics(orders) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalOrders = safeOrders.length;
  const paidOrders = safeOrders.filter((order) => ["paid", "authorized"].includes(String(order.paymentStatus || ""))).length;
  const cancelledOrders = safeOrders.filter((order) => String(order.status || "") === "cancelled").length;
  const revenue = safeOrders.reduce((sum, order) => {
    if (!["paid", "authorized"].includes(String(order.paymentStatus || ""))) {
      return sum;
    }
    return sum + Number(order.total || 0);
  }, 0);
  const averageOrderValue = totalOrders ? revenue / totalOrders : 0;
  const cancellationRate = totalOrders ? (cancelledOrders / totalOrders) * 100 : 0;
  const today = todayIsoDate();
  const ordersToday = safeOrders.filter((order) => String(order.createdAt || "").slice(0, 10) === today).length;

  const ordersByStatus = {};
  const paymentsByMethod = {};
  safeOrders.forEach((order) => {
    const status = String(order.status || "processing");
    const method = String(order.paymentMethod || "unknown");
    ordersByStatus[status] = Number(ordersByStatus[status] || 0) + 1;
    paymentsByMethod[method] = Number(paymentsByMethod[method] || 0) + 1;
  });

  const revenueLast7Days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    const dayOrders = safeOrders.filter((order) => String(order.createdAt || "").slice(0, 10) === dateKey);
    const dayRevenue = dayOrders.reduce((sum, order) => {
      if (!["paid", "authorized"].includes(String(order.paymentStatus || ""))) {
        return sum;
      }
      return sum + Number(order.total || 0);
    }, 0);
    revenueLast7Days.push({ date: dateKey, revenue: dayRevenue, orders: dayOrders.length });
  }

  return {
    kpis: {
      averageOrderValue,
      paidOrders,
      cancellationRate,
      ordersToday,
      revenueLast7Days: revenueLast7Days.reduce((sum, slot) => sum + Number(slot.revenue || 0), 0)
    },
    revenueLast7Days,
    ordersByStatus,
    paymentsByMethod,
    topProducts: []
  };
}

function localCatalogProductsFromStorage() {
  const catalogMap = loadJsonStorage(CATALOG_STORAGE_KEY, {});
  return Object.values(catalogMap).map((item) => ({
    id: item.id,
    sku: item.sku || "",
    name: item.name || "Unnamed Product",
    brand: item.brand || "Generic",
    category: item.category || "accessory",
    segment: item.segment || "b2c",
    price: Number(item.price || 0),
    listPrice: Number(item.listPrice || item.price || 0),
    stock: Number(item.stock || 0),
    rating: Number(item.rating || 0),
    moq: Number(item.moq || 0),
    status: item.status || "active",
    fulfillment: item.fulfillment || "fbm",
    featured: Boolean(item.featured),
    description: String(item.description || ""),
    keywords: Array.isArray(item.keywords) ? item.keywords : [],
    collections: normalizeCollectionValues(item.collections, item.category),
    image: String(item.image || "")
  }));
}

function mergeCatalogProducts(serverProducts = [], localProducts = []) {
  const merged = Array.isArray(serverProducts) ? [...serverProducts] : [];
  const serverIds = new Set(merged.map((product) => String(product.id || "")));
  const serverSkus = new Set(merged.map((product) => String(product.sku || "").trim().toUpperCase()).filter(Boolean));

  (Array.isArray(localProducts) ? localProducts : []).forEach((product) => {
    const id = String(product.id || "");
    const sku = String(product.sku || "").trim().toUpperCase();
    if ((id && serverIds.has(id)) || (sku && serverSkus.has(sku))) {
      return;
    }
    merged.push(product);
  });

  return merged;
}

function getOfflineDashboardPayload() {
  const session = readSession() || {};
  const localUsers = loadJsonStorage(LOCAL_USERS_KEY, []);
  const users = (Array.isArray(localUsers) ? localUsers : []).map((user) => {
    const matchesSession = Boolean(
      (session.id && String(user.id || "") === String(session.id))
      || (session.email && String(user.email || "").toLowerCase() === String(session.email).toLowerCase())
      || (session.mobile && String(user.mobile || "") === String(session.mobile))
    );
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role || "customer",
      phoneVerification: normalizeUserPhoneVerification(
        matchesSession && session.phoneVerification ? session.phoneVerification : user.phoneVerification,
        matchesSession && session.mobile ? session.mobile : user.mobile
      )
    };
  });

  if (!users.find((user) => String(user.id) === String(session.id))) {
    users.unshift({
      id: session.id || "local_admin",
      name: session.name || "ElectroMart Admin",
      email: session.email || "admin@electromart.com",
      mobile: session.mobile || "9999999999",
      role: session.role || "admin",
      phoneVerification: normalizeUserPhoneVerification(session.phoneVerification, session.mobile)
    });
  }

  const catalogProducts = localCatalogProductsFromStorage();

  const offlineOrdersRaw = loadJsonStorage(OFFLINE_ORDERS_KEY, []);
  const orders = (Array.isArray(offlineOrdersRaw) ? offlineOrdersRaw : []).map((order) => ({
    ...order,
    paymentStatus: order.paymentStatus || "pending",
    status: order.status || "processing",
    total: Number(order.total || 0),
    createdAt: order.createdAt || new Date().toISOString(),
    items: Array.isArray(order.items) ? order.items : []
  }));

  const paymentsCount = orders.filter((order) => ["paid", "authorized"].includes(String(order.paymentStatus || ""))).length;
  const totalRevenue = orders.reduce((sum, order) => {
    if (!["paid", "authorized"].includes(String(order.paymentStatus || ""))) {
      return sum;
    }
    return sum + Number(order.total || 0);
  }, 0);
  const totalInventoryValue = catalogProducts.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0);

  const sales = orders.map((order) => ({
    orderId: order.id,
    customerName: "Offline Customer",
    customerEmail: "offline@electromart.local",
    itemCount: Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0,
    total: Number(order.total || 0),
    paymentStatus: order.paymentStatus || "pending",
    orderStatus: order.status || "processing",
    createdAt: order.createdAt
  }));

  return {
    summary: {
      users: users.length,
      products: catalogProducts.length,
      orders: orders.length,
      payments: paymentsCount,
      totalRevenue
    },
    usersPayload: { count: users.length, users },
    salesPayload: { count: sales.length, totalRevenue, sales },
    catalogPayload: { count: catalogProducts.length, totalInventoryValue, products: catalogProducts },
    ordersPayload: { count: orders.length, orders },
    analytics: buildOfflineAnalytics(orders),
    phoneVerificationAutomationPayload: {
      settings: defaultPhoneVerificationAutomationSettings(),
      job: {
        lastRunAt: null,
        lastFinishedAt: null,
        lastStatus: "idle",
        lastMessage: "Automation has not run yet.",
        lastTriggeredBy: "",
        lastSummary: {
          deliveredCount: 0,
          queuedCount: 0,
          failedCount: 0,
          skippedCount: 0,
          affectedUsers: 0
        }
      },
      historySummary: defaultPhoneVerificationAutomationHistorySummary(),
      history: [],
      summary: {
        candidateCount: users.filter((user) => {
          const state = normalizeUserPhoneVerification(user.phoneVerification, user.mobile);
          return String(user.role || "customer").toLowerCase() === "customer" && Boolean(user.mobile) && !state.isVerified;
        }).length,
        eligibleCount: users.filter((user) => {
          const state = normalizeUserPhoneVerification(user.phoneVerification, user.mobile);
          return String(user.role || "customer").toLowerCase() === "customer"
            && Boolean(user.mobile)
            && !state.isVerified
            && !state.isLocked;
        }).length,
        lockedCount: users.filter((user) => normalizeUserPhoneVerification(user.phoneVerification, user.mobile).isLocked).length,
        pendingCount: users.filter((user) => normalizeUserPhoneVerification(user.phoneVerification, user.mobile).hasPendingCode).length,
        recentlyRemindedCount: 0,
        lastRunAt: null
      },
      counts: {},
      reminders: []
    }
  };
}
function normalizeBackInStockRequestEntry(item = {}) {
  return {
    id: String(item.id || `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    productId: String(item.productId || item.product?.id || ""),
    email: String(item.email || "").trim().toLowerCase(),
    name: String(item.name || "").trim(),
    quantityDesired: Math.max(1, Math.floor(numberOrZero(item.quantityDesired || 1))),
    status: String(item.status || "open").toLowerCase(),
    source: String(item.source || "product-page"),
    productName: String(item.productName || item.product?.name || "Unknown Product"),
    productBrand: String(item.productBrand || item.product?.brand || "Generic"),
    productSku: String(item.productSku || item.product?.sku || ""),
    productStock: numberOrZero(item.productStock ?? item.product?.stock ?? 0),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
    notifiedAt: item.notifiedAt || null,
    closedAt: item.closedAt || null,
    offline: Boolean(item.offline)
  };
}

function loadBackInStockRequestsLocal() {
  const raw = loadJsonStorage(BACK_IN_STOCK_REQUESTS_STORAGE_KEY, []);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => normalizeBackInStockRequestEntry(item));
}

function saveBackInStockRequestsLocal(list) {
  try {
    const safe = Array.isArray(list) ? list.map((item) => normalizeBackInStockRequestEntry(item)) : [];
    localStorage.setItem(BACK_IN_STOCK_REQUESTS_STORAGE_KEY, JSON.stringify(safe));
  } catch (error) {
    return;
  }
}

function saveJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    return;
  }
}

function defaultInventorySettings() {
  return {
    defaultLowStockThreshold: 5,
    restockTarget: 10,
    categoryThresholds: {}
  };
}

function getInventoryCategories(products = allCatalogProducts) {
  const categories = new Set();
  (Array.isArray(products) ? products : []).forEach((product) => {
    const category = normalizeCategoryValue(product && product.category);
    if (category) {
      categories.add(category);
    }
  });
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

function normalizeInventorySettings(settings, products = allCatalogProducts) {
  const fallback = defaultInventorySettings();
  const source = settings && typeof settings === "object" ? settings : {};
  const categories = new Set(getInventoryCategories(products));
  const categoryThresholdsSource = source.categoryThresholds && typeof source.categoryThresholds === "object"
    ? source.categoryThresholds
    : {};

  Object.keys(categoryThresholdsSource).forEach((key) => {
    const normalized = normalizeCategoryValue(key);
    if (normalized) {
      categories.add(normalized);
    }
  });

  const defaultLowStockThreshold = Math.max(0, Math.floor(numberOrZero(
    source.defaultLowStockThreshold ?? fallback.defaultLowStockThreshold
  )));
  const restockTarget = Math.max(0, Math.floor(numberOrZero(
    source.restockTarget ?? fallback.restockTarget
  )));
  const categoryThresholds = {};

  Array.from(categories).forEach((category) => {
    categoryThresholds[category] = Math.max(
      0,
      Math.floor(numberOrZero(categoryThresholdsSource[category] ?? defaultLowStockThreshold))
    );
  });

  return {
    defaultLowStockThreshold,
    restockTarget,
    categoryThresholds
  };
}

function loadInventorySettingsLocal(products = allCatalogProducts) {
  return normalizeInventorySettings(loadJsonStorage(INVENTORY_SETTINGS_STORAGE_KEY, defaultInventorySettings()), products);
}

function saveInventorySettingsLocal(settings) {
  saveJsonStorage(INVENTORY_SETTINGS_STORAGE_KEY, normalizeInventorySettings(settings));
}

function computeBackInStockDemand(requests) {
  const demandMap = new Map();
  (Array.isArray(requests) ? requests : [])
    .filter((item) => String(item.status || "open") === "open")
    .forEach((item) => {
      const key = String(item.productId || "");
      if (!key) {
        return;
      }
      const previous = demandMap.get(key) || {
        productId: key,
        name: String(item.productName || "Unknown Product"),
        brand: String(item.productBrand || "Generic"),
        sku: String(item.productSku || ""),
        stock: numberOrZero(item.productStock),
        requests: 0,
        demandUnits: 0,
        lastRequestedAt: null
      };
      previous.requests += 1;
      previous.demandUnits += Math.max(1, numberOrZero(item.quantityDesired || 1));
      const createdAt = String(item.createdAt || "");
      if (!previous.lastRequestedAt || createdAt > previous.lastRequestedAt) {
        previous.lastRequestedAt = createdAt;
      }
      demandMap.set(key, previous);
    });

  return Array.from(demandMap.values()).sort((a, b) => b.requests - a.requests || b.demandUnits - a.demandUnits);
}

function hydrateBackInStockPayload(payload = {}) {
  const serverRequests = Array.isArray(payload.requests)
    ? payload.requests.map((item) => normalizeBackInStockRequestEntry(item))
    : [];
  const localRequests = loadBackInStockRequestsLocal();
  const requestMap = new Map();
  serverRequests.forEach((item) => {
    requestMap.set(item.id, item);
  });
  localRequests.forEach((item) => {
    if (requestMap.has(item.id)) {
      return;
    }
    const duplicate = Array.from(requestMap.values()).find((entry) => {
      return String(entry.productId) === String(item.productId)
        && String(entry.email).toLowerCase() === String(item.email).toLowerCase();
    });
    if (!duplicate) {
      requestMap.set(item.id, item);
    }
  });

  allBackInStockRequests = Array.from(requestMap.values())
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  backInStockDemandByProduct = Array.isArray(payload.demandByProduct) && payload.demandByProduct.length
    ? payload.demandByProduct
    : computeBackInStockDemand(allBackInStockRequests);
}

function getFilteredBackInStockRequests() {
  const query = String(backInStockSearchInput && backInStockSearchInput.value ? backInStockSearchInput.value : "").trim().toLowerCase();
  const status = String(backInStockStatusFilter && backInStockStatusFilter.value ? backInStockStatusFilter.value : "all").toLowerCase();
  return allBackInStockRequests.filter((item) => {
    const statusMatch = status === "all" || String(item.status || "open") === status;
    const queryMatch = !query
      || String(item.email || "").toLowerCase().includes(query)
      || String(item.productName || "").toLowerCase().includes(query)
      || String(item.productSku || "").toLowerCase().includes(query)
      || String(item.productBrand || "").toLowerCase().includes(query);
    return statusMatch && queryMatch;
  });
}

function renderBackInStockDemand() {
  if (!backInStockDemandList) {
    return;
  }
  const demand = Array.isArray(backInStockDemandByProduct) ? backInStockDemandByProduct.slice(0, 8) : [];
  if (!demand.length) {
    backInStockDemandList.innerHTML = "<p class='catalog-health'>No active demand signals yet.</p>";
    return;
  }
  backInStockDemandList.innerHTML = demand.map((item) => {
    const stock = numberOrZero(item.stock);
    const statusClass = stock <= 0 ? "out" : (stock < numberOrZero(item.demandUnits) ? "low" : "healthy");
    return `
      <article class="inventory-alert-item ${statusClass}">
        <div class="inventory-alert-meta">
          <p class="inventory-alert-name">${escapeHtml(item.name || "Unknown Product")}</p>
          <p class="inventory-alert-note">Demand: ${numberOrZero(item.requests)} request(s), ${numberOrZero(item.demandUnits)} unit(s) • Stock: ${stock}</p>
        </div>
        <button class="mini-btn" type="button" data-action="notify-back-in-stock" data-product-id="${escapeHtmlAttr(item.productId || "")}" ${stock > 0 ? "" : "disabled"}>Notify Now</button>
      </article>
    `;
  }).join("");
}

function renderBackInStockRequests(requests = []) {
  visibleBackInStockRequests = Array.isArray(requests) ? requests : [];
  const openCount = allBackInStockRequests.filter((item) => String(item.status || "open") === "open").length;
  const notifiedCount = allBackInStockRequests.filter((item) => String(item.status || "") === "notified").length;
  const queuedCount = allBackInStockRequests.filter((item) => String(item.status || "") === "queued").length;
  const demandUnits = backInStockDemandByProduct.reduce((sum, item) => sum + numberOrZero(item.demandUnits), 0);
  if (backInStockMeta) {
    backInStockMeta.textContent = `Open: ${openCount} • Notified: ${notifiedCount} • Queued: ${queuedCount} • Demand units: ${demandUnits}`;
  }

  renderBackInStockDemand();

  if (!backInStockTableBody) {
    return;
  }
  if (!visibleBackInStockRequests.length) {
    backInStockTableBody.innerHTML = "<tr><td colspan='7'>No back-in-stock requests found.</td></tr>";
    return;
  }

  backInStockTableBody.innerHTML = visibleBackInStockRequests.map((item) => {
    const status = String(item.status || "open");
    const stock = numberOrZero(item.productStock);
    const canNotify = status === "open" && stock > 0;
    const canClose = status === "open" || status === "queued";
    const canReopen = status === "closed";
    return `
      <tr>
        <td>${dateTime(item.createdAt)}</td>
        <td>${escapeHtml(item.productName || "Unknown Product")}<br /><span class="subtle">${escapeHtml(item.productSku || "N/A")}</span></td>
        <td>${escapeHtml(item.email || "N/A")}</td>
        <td>${numberOrZero(item.quantityDesired)}</td>
        <td><span class="request-status ${escapeHtmlAttr(status)}">${escapeHtml(status)}</span></td>
        <td>${item.notifiedAt ? dateTime(item.notifiedAt) : "—"}</td>
        <td class="catalog-actions">
          <button class="mini-btn" type="button" data-action="notify-back-in-stock" data-product-id="${escapeHtmlAttr(item.productId || "")}" ${canNotify ? "" : "disabled"}>Notify</button>
          <button class="mini-btn" type="button" data-action="close-back-in-stock-request" data-request-id="${escapeHtmlAttr(item.id || "")}" ${canClose ? "" : "disabled"}>Close</button>
          <button class="mini-btn" type="button" data-action="reopen-back-in-stock-request" data-request-id="${escapeHtmlAttr(item.id || "")}" ${canReopen ? "" : "disabled"}>Reopen</button>
        </td>
      </tr>
    `;
  }).join("");
}

function applyBackInStockFilters() {
  renderBackInStockRequests(getFilteredBackInStockRequests());
}

async function refreshBackInStockRequests() {
  if (!isBackendOnline) {
    const local = loadBackInStockRequestsLocal();
    hydrateBackInStockPayload({
      requests: local,
      demandByProduct: computeBackInStockDemand(local)
    });
    applyBackInStockFilters();
    setMessage("Back-in-stock requests loaded from local storage.", false, {
      toast: true,
      title: "Back-in-stock (offline)",
      tone: "warning",
      timeoutMs: 5600
    });
    return;
  }

  try {
    const payload = await fetchJson("/admin/back-in-stock/requests");
    hydrateBackInStockPayload(payload);
    applyBackInStockFilters();
    setMessage("Back-in-stock requests refreshed.", false, {
      toast: true,
      title: "Back-in-stock refreshed",
      tone: "success",
      timeoutMs: 4200
    });
  } catch (error) {
    const local = loadBackInStockRequestsLocal();
    hydrateBackInStockPayload({
      requests: local,
      demandByProduct: computeBackInStockDemand(local)
    });
    applyBackInStockFilters();
    setMessage("Unable to fetch back-in-stock requests from backend. Showing local data.", true);
  }
}

async function notifyBackInStockForProduct(productId) {
  const id = String(productId || "").trim();
  if (!id) {
    return;
  }
  if (!isBackendOnline) {
    setMessage("Notify action requires backend online mode.", true);
    return;
  }

  try {
    const response = await api(`/admin/back-in-stock/notify/${encodeURIComponent(id)}`, {
      method: "POST"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to notify customers.");
    }
    setMessage(data.message || "Notifications processed.", false, {
      toast: true,
      title: "Notifications processed",
      tone: "success",
      timeoutMs: 4600
    });
    await refreshBackInStockRequests();
  } catch (error) {
    setMessage(error.message || "Failed to notify back-in-stock requests.", true);
  }
}

async function setBackInStockRequestStatus(requestId, status) {
  const id = String(requestId || "").trim();
  const normalizedStatus = String(status || "").toLowerCase();
  if (!id || !normalizedStatus) {
    return;
  }

  if (!isBackendOnline) {
    const local = loadBackInStockRequestsLocal();
    const target = local.find((item) => String(item.id || "") === id);
    if (!target) {
      setMessage("Request not found in local storage.", true);
      return;
    }
    target.status = normalizedStatus;
    target.updatedAt = new Date().toISOString();
    if (normalizedStatus === "closed") {
      target.closedAt = target.updatedAt;
    }
    if (normalizedStatus === "open") {
      target.closedAt = null;
    }
    saveBackInStockRequestsLocal(local);
    hydrateBackInStockPayload({
      requests: local,
      demandByProduct: computeBackInStockDemand(local)
    });
    applyBackInStockFilters();
    setMessage(`Request marked as ${normalizedStatus} (offline mode).`, false, {
      toast: true,
      title: "Request updated (offline)",
      tone: "warning",
      timeoutMs: 5600
    });
    return;
  }

  try {
    const response = await api(`/admin/back-in-stock/requests/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: normalizedStatus })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to update request.");
    }
    setMessage(`Request marked as ${formatStatus(normalizedStatus)}.`, false, {
      toast: true,
      title: "Request updated",
      tone: "success",
      timeoutMs: 4200
    });
    await refreshBackInStockRequests();
  } catch (error) {
    setMessage(error.message || "Failed to update request status.", true);
  }
}

function requireAdminSession() {
  const session = readSession();
  if (!session || !session.token) {
    window.location.href = "auth.html";
    return null;
  }
  if (session.role !== "admin") {
    setMessage("Admin access required. Sign in with admin account.", true, {
      title: "Access denied",
      tone: "error",
      toast: true,
      timeoutMs: 5600
    });
    refreshBtn.disabled = true;
    return null;
  }
  return session;
}

function ensureAdminToastStack() {
  const existing = document.getElementById(ADMIN_TOAST_STACK_ID);
  if (existing) {
    return existing;
  }
  if (!document.body) {
    return null;
  }
  const stack = document.createElement("section");
  stack.id = ADMIN_TOAST_STACK_ID;
  stack.className = "em-toast-stack";
  stack.setAttribute("aria-live", "polite");
  stack.setAttribute("aria-atomic", "false");
  document.body.appendChild(stack);
  return stack;
}

function showAdminToast({ title = "", message = "", tone = "info", timeoutMs = 4200 } = {}) {
  const safeMessage = String(message || "").trim();
  if (!safeMessage) {
    return;
  }
  const toastKey = `${String(tone || "info").trim().toLowerCase()}:${safeMessage}`;
  const now = Date.now();
  if (toastKey === lastAdminToastKey && now - lastAdminToastAt < 1200) {
    return;
  }
  lastAdminToastKey = toastKey;
  lastAdminToastAt = now;

  const stack = ensureAdminToastStack();
  if (!stack) {
    return;
  }
  const safeTone = ["success", "error", "warning", "info"].includes(String(tone || "").trim().toLowerCase())
    ? String(tone || "info").trim().toLowerCase()
    : "info";
  const toast = document.createElement("article");
  toast.className = `em-toast ${safeTone}`;

  if (title) {
    const heading = document.createElement("strong");
    heading.className = "em-toast-title";
    heading.textContent = String(title).trim();
    toast.appendChild(heading);
  }

  const body = document.createElement("p");
  body.className = "em-toast-message";
  body.textContent = safeMessage;
  toast.appendChild(body);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "em-toast-close";
  close.textContent = "Dismiss";
  close.addEventListener("click", () => {
    toast.remove();
  });
  toast.appendChild(close);

  stack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, Math.max(1200, Number(timeoutMs || 0)));
}

function setMessage(text, isError = false, options = {}) {
  const normalized = String(text || "").trim();
  adminMessage.textContent = normalized;
  adminMessage.classList.toggle("error", isError);
  if (!normalized) {
    return;
  }
  if (isError || options.toast === true) {
    showAdminToast({
      title: String(options.title || (isError ? "Request failed" : "Update")).trim(),
      message: normalized,
      tone: String(options.tone || (isError ? "error" : "info")).trim().toLowerCase(),
      timeoutMs: Number(options.timeoutMs || 4800)
    });
  }
}

function setBackendStatus(online) {
  isBackendOnline = Boolean(online);
  if (!backendStatusBadge) {
    return;
  }
  backendStatusBadge.textContent = `Backend: ${online ? "Online" : "Offline"}`;
  backendStatusBadge.classList.toggle("online", Boolean(online));
  backendStatusBadge.classList.toggle("offline", !online);
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function numberOrZero(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCategoryValue(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  const normalized = raw
    .replace(/&/g, " and ")
    .replace(/[’'`]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (normalized === "accessories") {
    return "accessory";
  }
  return normalized;
}

function normalizeAdminView(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "dashboard";
  }
  return ADMIN_VIEW_ALIASES[raw] || "dashboard";
}

function getRequestedAdminView() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("view");
  return normalizeAdminView(value);
}

function adminPageHref(view) {
  const normalized = normalizeAdminView(view);
  return ADMIN_PAGE_BY_VIEW[normalized] || ADMIN_PAGE_BY_VIEW.dashboard;
}

function applyAdminFocusedView() {
  const requestedView = getRequestedAdminView();
  const config = ADMIN_VIEW_CONFIG[requestedView] || ADMIN_VIEW_CONFIG.dashboard;
  const focusSelectors = config.selectors || [];
  const allSelectors = Array.from(
    new Set(
      Object.values(ADMIN_VIEW_CONFIG)
        .flatMap((item) => item.selectors || [])
    )
  );
  const focusSet = new Set(focusSelectors);

  allSelectors.forEach((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }
    element.hidden = !focusSet.has(selector);
  });

  if (adminHeadSection) {
    adminHeadSection.hidden = false;
  }
  if (adminQuickActionsSection) {
    adminQuickActionsSection.hidden = false;
  }
  if (adminMessage) {
    adminMessage.hidden = false;
  }

  const heading = adminHeadSection ? adminHeadSection.querySelector("h1") : null;
  if (heading) {
    heading.textContent = requestedView === "dashboard"
      ? "Seller Central Dashboard"
      : `Seller Central - ${config.label}`;
  }
  document.title = requestedView === "dashboard"
    ? "ElectroMart Admin Dashboard"
    : `ElectroMart Admin ${config.label}`;
}

function normalizeCollectionValues(value, fallbackCategory = "") {
  const list = Array.isArray(value)
    ? value
    : String(value || "").split(/[;|,]+/);
  const normalized = list
    .map((item) => normalizeCategoryValue(item))
    .filter(Boolean)
    .filter((item) => item !== "all" && item !== "all-products");
  const fallback = normalizeCategoryValue(fallbackCategory);
  if (fallback && !normalized.includes(fallback)) {
    normalized.unshift(fallback);
  }
  return [...new Set(normalized)].slice(0, 8);
}

function categoryLabel(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function makeCategoryRecord(slug, partial = {}, isDefault = false) {
  const normalizedSlug = normalizeCategoryValue(slug);
  return {
    slug: normalizedSlug,
    name: String(partial.name || categoryLabel(normalizedSlug)).trim(),
    description: String(partial.description || "").trim(),
    image: normalizeImageUrl(partial.image || ""),
    active: partial.active !== false,
    isDefault: Boolean(isDefault || partial.isDefault),
    createdAt: partial.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function loadCategoryRecords() {
  const raw = loadJsonStorage(CATEGORY_STORAGE_KEY, []);

  // Backward compatibility: previous versions stored plain string array
  if (Array.isArray(raw) && raw.every((item) => typeof item === "string")) {
    const managed = raw.map((item) => makeCategoryRecord(item)).filter((item) => item.slug);
    const defaults = DEFAULT_CATEGORIES.map((slug) => makeCategoryRecord(slug, {}, true));
    const allProductsRecord = makeCategoryRecord("all-products", { name: "All Products", description: "Default listing category.", active: true }, true);
    const map = new Map([allProductsRecord, ...defaults, ...managed].map((item) => [item.slug, item]));
    const migrated = Array.from(map.values());
    saveCategoryRecords(migrated);
    return migrated;
  }

  const parsed = Array.isArray(raw) ? raw : [];
  const records = parsed
    .map((item) => makeCategoryRecord(item && item.slug ? item.slug : "", item || {}, Boolean(item && item.isDefault)))
    .filter((item) => item.slug);

  const map = new Map(records.map((item) => [item.slug, item]));
  DEFAULT_CATEGORIES.forEach((slug) => {
    const key = normalizeCategoryValue(slug);
    if (!map.has(key)) {
      map.set(key, makeCategoryRecord(key, {}, true));
    }
  });
  if (!map.has("all-products")) {
    map.set("all-products", makeCategoryRecord("all-products", { name: "All Products", description: "Default listing category.", active: true }, true));
  }

  return Array.from(map.values());
}

function saveCategoryRecords(records) {
  const safe = Array.from(new Set((Array.isArray(records) ? records : []).map((item) => normalizeCategoryValue(item && item.slug)).filter(Boolean)))
    .map((slug) => {
      const found = (records || []).find((item) => normalizeCategoryValue(item && item.slug) === slug) || {};
      return makeCategoryRecord(slug, found, Boolean(found.isDefault));
    });
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(safe));
  } catch (error) {
    return;
  }
}

function getAllCategories() {
  const records = loadCategoryRecords();
  const explicit = records.map((item) => item.slug);
  const derived = allCatalogProducts.map((product) => normalizeCategoryValue(product.category));
  return Array.from(new Set([...explicit, ...derived].filter((slug) => slug && slug !== "all-products")));
}

function getCategoryRecord(slug) {
  const normalized = normalizeCategoryValue(slug);
  return loadCategoryRecords().find((item) => item.slug === normalized) || null;
}

function buildCategoryUrl(slug) {
  const normalized = normalizeCategoryValue(slug);
  return `products.html?category=${encodeURIComponent(normalized)}`;
}

function setCategoryManagerMessage(text, isError = false) {
  if (!categoryManagerMessage) {
    return;
  }
  categoryManagerMessage.textContent = text;
  categoryManagerMessage.classList.toggle("error", Boolean(isError));
}

function getCategoryProductUsageMap() {
  const usage = new Map();
  allCatalogProducts.forEach((product) => {
    productCategoryTokens(product).forEach((token) => {
      usage.set(token, (usage.get(token) || 0) + 1);
    });
  });
  return usage;
}

function getCategoryListFilterState() {
  const query = String(categorySearchInput && categorySearchInput.value ? categorySearchInput.value : "").trim().toLowerCase();
  const status = String(categoryStatusFilter && categoryStatusFilter.value ? categoryStatusFilter.value : "all").trim().toLowerCase();
  const sort = String(categorySortInput && categorySortInput.value ? categorySortInput.value : "manual").trim().toLowerCase();
  return { query, status, sort };
}

function formatCategoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleDateString();
}

function updateCategorySummary(records, visibleRecords, usageMap) {
  if (!categorySummary) {
    return;
  }
  const total = records.length;
  const visible = visibleRecords.length;
  const active = records.filter((item) => item.active).length;
  const inactive = total - active;
  const inUse = records.filter((item) => (usageMap.get(item.slug) || 0) > 0).length;
  categorySummary.textContent = `Total: ${total} • Active: ${active} • Inactive: ${inactive} • In use: ${inUse} • Showing: ${visible}`;
}

function sortCategoryRecords(records, sortMode, usageMap) {
  const list = [...records];
  if (sortMode === "name-asc") {
    list.sort((a, b) => String(a.name || a.slug).localeCompare(String(b.name || b.slug)));
    return list;
  }
  if (sortMode === "name-desc") {
    list.sort((a, b) => String(b.name || b.slug).localeCompare(String(a.name || a.slug)));
    return list;
  }
  if (sortMode === "updated-desc") {
    list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return list;
  }
  if (sortMode === "products-desc") {
    list.sort((a, b) => (usageMap.get(b.slug) || 0) - (usageMap.get(a.slug) || 0));
    return list;
  }
  return list;
}

function filterCategoryRecords(records, state, usageMap) {
  const query = state.query;
  const status = state.status;
  return records.filter((item) => {
    const usageCount = usageMap.get(item.slug) || 0;
    const queryMatch = !query
      || String(item.slug || "").toLowerCase().includes(query)
      || String(item.name || "").toLowerCase().includes(query)
      || String(item.description || "").toLowerCase().includes(query);
    const statusMatch = status === "all"
      || (status === "active" && item.active)
      || (status === "inactive" && !item.active)
      || (status === "in-use" && usageCount > 0)
      || (status === "unused" && usageCount <= 0);
    return queryMatch && statusMatch;
  });
}

function renderCategoryManagerList() {
  if (!categoryManagerList) {
    return;
  }
  const records = loadCategoryRecords();
  const usageMap = getCategoryProductUsageMap();
  const filterState = getCategoryListFilterState();
  const filteredRecords = filterCategoryRecords(records, filterState, usageMap);
  const visibleRecords = sortCategoryRecords(filteredRecords, filterState.sort, usageMap);
  const canReorder = filterState.sort === "manual" && !filterState.query && filterState.status === "all";

  updateCategorySummary(records, visibleRecords, usageMap);

  if (!records.length) {
    categoryManagerList.innerHTML = "<span class='subtle'>No categories found.</span>";
    return;
  }
  if (!visibleRecords.length) {
    categoryManagerList.innerHTML = "<span class='subtle'>No categories match current filters.</span>";
    return;
  }

  categoryManagerList.innerHTML = visibleRecords.map((item) => {
    const usageCount = usageMap.get(item.slug) || 0;
    const sourceIndex = records.findIndex((entry) => entry.slug === item.slug);
    const moveUpDisabled = !canReorder || sourceIndex <= 0;
    const moveDownDisabled = !canReorder || sourceIndex >= (records.length - 1);
    return `
      <article class="category-chip">
        <div class="category-chip-main">
          <span class="category-meta">
            ${item.name}
            <span>${item.description || "No description"}</span>
            <a href="${buildCategoryUrl(item.slug)}" target="_blank" rel="noopener">${buildCategoryUrl(item.slug)}</a>
            <span class="category-metrics">
              <em>Slug: ${item.slug}</em>
              <em>Products: ${usageCount}</em>
              <em>Updated: ${formatCategoryDate(item.updatedAt)}</em>
              ${item.isDefault ? "<em>Default</em>" : ""}
            </span>
          </span>
          <span class="category-status ${item.active ? "active" : "inactive"}">${item.active ? "active" : "inactive"}</span>
        </div>
        <div class="category-chip-actions">
          <button type="button" data-action="view-category-products" data-category="${item.slug}">View Products</button>
          <button type="button" data-action="toggle-category" data-category="${item.slug}">${item.active ? "Deactivate" : "Activate"}</button>
          <button type="button" data-action="edit-category" data-category="${item.slug}">Edit</button>
          <button type="button" data-action="copy-category-url" data-category="${item.slug}">Copy URL</button>
          <button type="button" data-action="move-category-up" data-category="${item.slug}" ${moveUpDisabled ? "disabled" : ""}>Up</button>
          <button type="button" data-action="move-category-down" data-category="${item.slug}" ${moveDownDisabled ? "disabled" : ""}>Down</button>
          <button type="button" data-action="remove-category" data-category="${item.slug}" ${item.isDefault ? "disabled" : ""}>Remove</button>
        </div>
      </article>
    `;
  }).join("");
}

function syncCategorySelectOptions() {
  const categories = getAllCategories();
  const records = loadCategoryRecords();
  const activeSet = new Set(records.filter((item) => item.active).map((item) => item.slug));
  const recordMap = new Map(records.map((item) => [item.slug, item]));

  if (productCategoryInput) {
    const selected = normalizeCategoryValue(productCategoryInput.value);
    productCategoryInput.innerHTML = [
      "<option value=''>Category</option>",
      ...categories.map((value) => {
        const record = recordMap.get(value) || null;
        const inactiveTag = activeSet.has(value) ? "" : " (Inactive)";
        return `<option value="${value}">${record ? record.name : categoryLabel(value)}${inactiveTag}</option>`;
      })
    ].join("");
    productCategoryInput.value = selected || "";
  }

  if (catalogCategoryFilter) {
    const selected = normalizeCategoryValue(catalogCategoryFilter.value || "all");
    catalogCategoryFilter.innerHTML = [
      "<option value='all'>All categories</option>",
      ...categories.map((value) => {
        const record = recordMap.get(value) || null;
        return `<option value="${value}">${record ? record.name : categoryLabel(value)}</option>`;
      })
    ].join("");
    catalogCategoryFilter.value = selected && selected !== "all" ? selected : "all";
  }

  renderCategoryManagerList();
}

function normalizeSourcingType(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "print-on-demand" || raw === "dropshipping") {
    return raw;
  }
  return "all";
}

function getSourcingFilterState() {
  const type = normalizeSourcingType(sourcingTypeFilter ? sourcingTypeFilter.value : "all");
  const query = String(sourcingSearchInput && sourcingSearchInput.value ? sourcingSearchInput.value : "").trim().toLowerCase();
  return { type, query };
}

function setSourcingQuickFilterState(type) {
  const normalized = normalizeSourcingType(type);
  if (sourcingQuickAllBtn) {
    sourcingQuickAllBtn.classList.toggle("active", normalized === "all");
  }
  if (sourcingQuickPodBtn) {
    sourcingQuickPodBtn.classList.toggle("active", normalized === "print-on-demand");
  }
  if (sourcingQuickDropBtn) {
    sourcingQuickDropBtn.classList.toggle("active", normalized === "dropshipping");
  }
}

function getCatalogMatchingKeys() {
  const keySet = new Set();
  const products = allCatalogProducts.length
    ? allCatalogProducts
    : localCatalogProductsFromStorage();
  products.forEach((product) => {
    const sku = String(product && product.sku ? product.sku : "").trim().toUpperCase();
    const name = String(product && product.name ? product.name : "").trim().toLowerCase();
    if (sku) {
      keySet.add(`sku:${sku}`);
    }
    if (name) {
      keySet.add(`name:${name}`);
    }
  });
  return keySet;
}

function isSourcingTemplateInCatalog(template, keySet = getCatalogMatchingKeys()) {
  const sku = String(template && template.sku ? template.sku : "").trim().toUpperCase();
  const name = String(template && template.name ? template.name : "").trim().toLowerCase();
  if (sku && keySet.has(`sku:${sku}`)) {
    return true;
  }
  return Boolean(name && keySet.has(`name:${name}`));
}

function getSourcingSearchText(template) {
  const keywords = Array.isArray(template.keywords) ? template.keywords.join(" ") : "";
  const collections = Array.isArray(template.collections) ? template.collections.join(" ") : "";
  return [
    template.name,
    template.brand,
    template.category,
    template.sourceType,
    template.supplier,
    keywords,
    collections,
    template.description
  ].map((value) => String(value || "").toLowerCase()).join(" ");
}

function getFilteredSourcingTemplates(state = getSourcingFilterState()) {
  return SOURCING_TEMPLATE_PRODUCTS.filter((template) => {
    const typeMatch = state.type === "all" || String(template.sourceType || "") === state.type;
    const queryMatch = !state.query || getSourcingSearchText(template).includes(state.query);
    return typeMatch && queryMatch;
  });
}

function sourcingTypeLabel(type) {
  return type === "print-on-demand" ? "Print on demand" : "Dropshipping";
}

function sourcingTypeClass(type) {
  return type === "print-on-demand" ? "pod" : "dropshipping";
}

function sourcingTemplateCard(template, existsInCatalog, adding = false) {
  const safeImage = escapeHtmlAttr(normalizeImageUrl(template.image) || CATALOG_FALLBACK_IMAGE);
  const safeFallback = escapeHtmlAttr(CATALOG_FALLBACK_IMAGE);
  const safeName = escapeHtml(template.name || "Product");
  const safeType = escapeHtml(sourcingTypeLabel(template.sourceType));
  const safeBrand = escapeHtml(template.brand || "Generic");
  const safeSupplier = escapeHtml(template.supplier || "Trusted partner");
  const safeLeadTime = Number(template.leadTimeDays || 0) > 0 ? `${Number(template.leadTimeDays)} days` : "N/A";
  const safeCategory = escapeHtml(formatStatus(template.category || "accessory"));
  const leadTimeText = escapeHtml(safeLeadTime);
  const discountValue = Math.max(0, numberOrZero(template.listPrice) - numberOrZero(template.price));
  const actionLabel = existsInCatalog ? "Already Added" : (adding ? "Adding..." : "Add to Products");
  const disableAction = existsInCatalog || adding;
  return `
    <article class="sourcing-card">
      <img
        class="sourcing-card-image"
        src="${safeImage}"
        alt="${escapeHtmlAttr(template.name || "Sourcing product")}"
        data-fallback="${safeFallback}"
        loading="lazy"
        decoding="async"
        onerror="this.onerror=null;this.src=this.dataset.fallback;"
      />
      <div class="sourcing-card-body">
        <div class="sourcing-card-head">
          <span class="sourcing-badge ${sourcingTypeClass(template.sourceType)}">${safeType}</span>
          <span class="sourcing-category">${safeCategory}</span>
        </div>
        <h4>${safeName}</h4>
        <p class="sourcing-byline">${safeBrand} • Supplier: ${safeSupplier}</p>
        <p class="sourcing-description">${escapeHtml(template.description || "")}</p>
        <div class="sourcing-stats">
          <span>Cost ${money(template.price || 0)}</span>
          <span>MRP ${money(template.listPrice || 0)}</span>
          <span>Margin ${money(discountValue)}</span>
          <span>Lead time ${leadTimeText}</span>
        </div>
        <button
          type="button"
          class="secondary-btn sourcing-add-btn"
          data-action="add-sourcing-product"
          data-source-id="${escapeHtmlAttr(template.id || "")}"
          ${disableAction ? "disabled" : ""}
        >${actionLabel}</button>
      </div>
    </article>
  `;
}

function renderSourcingPanel() {
  if (!sourcingList) {
    return;
  }
  const filterState = getSourcingFilterState();
  setSourcingQuickFilterState(filterState.type);

  const filteredTemplates = getFilteredSourcingTemplates(filterState);
  const keySet = getCatalogMatchingKeys();
  const existingCount = filteredTemplates.filter((template) => isSourcingTemplateInCatalog(template, keySet)).length;

  if (sourcingMeta) {
    sourcingMeta.textContent = `${filteredTemplates.length} shown of ${SOURCING_TEMPLATE_PRODUCTS.length} • ${existingCount} already added`;
  }

  if (!filteredTemplates.length) {
    sourcingList.innerHTML = "<p class='subtle'>No source products match current filters.</p>";
    return;
  }

  sourcingList.innerHTML = filteredTemplates.map((template) => {
    const templateId = String(template.id || "");
    const isAdding = sourcingAddInProgress.has(templateId);
    const existsInCatalog = isSourcingTemplateInCatalog(template, keySet);
    return sourcingTemplateCard(template, existsInCatalog, isAdding);
  }).join("");
}

function buildPayloadFromSourcingTemplate(template) {
  const fallbackCollections = normalizeCollectionValues(template.collections || [], template.category || "accessory");
  const fallbackImage = normalizeImageUrl(template.image || "");
  const payload = buildUpsertPayloadFromProduct({
    sku: template.sku,
    name: template.name,
    brand: template.brand,
    category: template.category,
    segment: template.segment || "b2c",
    price: template.price,
    listPrice: template.listPrice,
    stock: template.stock,
    rating: template.rating,
    moq: template.moq,
    status: template.status || "active",
    fulfillment: template.fulfillment || "fbm",
    featured: Boolean(template.featured),
    keywords: template.keywords || [],
    collections: fallbackCollections,
    description: template.description || "",
    image: fallbackImage,
    images: fallbackImage ? [fallbackImage] : []
  });
  const extraKeywords = [
    template.sourceType === "print-on-demand" ? "print on demand" : "dropshipping",
    "sourcing"
  ];
  payload.keywords = [...new Set([...(payload.keywords || []), ...extraKeywords].map((item) => String(item || "").trim()).filter(Boolean))];
  return payload;
}

async function addSourcingTemplateToCatalog(sourceId) {
  const template = SOURCING_TEMPLATE_PRODUCTS.find((item) => String(item.id || "") === String(sourceId || ""));
  if (!template) {
    setMessage("Selected source product was not found.", true);
    return;
  }
  if (sourcingAddInProgress.has(template.id)) {
    return;
  }
  const existsInCatalog = isSourcingTemplateInCatalog(template);
  if (existsInCatalog) {
    setMessage(`${template.name} is already available in your products.`, false, {
      toast: true,
      title: "Already added",
      tone: "warning",
      timeoutMs: 4600
    });
    renderSourcingPanel();
    return;
  }

  const payload = buildPayloadFromSourcingTemplate(template);
  sourcingAddInProgress = new Set([...sourcingAddInProgress, template.id]);
  renderSourcingPanel();

  try {
    const response = await api("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to import source product.");
    }
    if (data && data.id) {
      try {
        upsertCatalogProductOffline(String(data.id), data);
      } catch (cacheError) {
        // Ignore cache sync failures when backend save succeeds.
      }
    }
    setMessage(`${template.name} added from sourcing list.`, false, {
      toast: true,
      title: "Sourcing import added",
      tone: "success",
      timeoutMs: 4600
    });
    await loadDashboard();
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    const isNetworkIssue = /failed to fetch|network|backend/i.test(message);
    if (isNetworkIssue) {
      try {
        upsertCatalogProductOffline("", payload);
        setMessage(`${template.name} added in offline mode from sourcing list.`, false, {
          toast: true,
          title: "Sourcing import (offline)",
          tone: "warning",
          timeoutMs: 5600
        });
        await loadDashboard();
        return;
      } catch (offlineError) {
        setMessage(offlineError.message || "Failed to add source product in offline mode.", true);
      }
    } else {
      setMessage(message || "Failed to add source product.", true);
    }
  } finally {
    sourcingAddInProgress.delete(template.id);
    renderSourcingPanel();
  }
}

function resetCategoryEditor() {
  editingCategorySlug = "";
  if (newCategoryInput) {
    newCategoryInput.value = "";
  }
  if (newCategoryDescriptionInput) {
    newCategoryDescriptionInput.value = "";
  }
  if (newCategoryImageInput) {
    newCategoryImageInput.value = "";
  }
  if (newCategoryActiveInput) {
    newCategoryActiveInput.checked = true;
  }
  if (addCategoryBtn) {
    addCategoryBtn.textContent = "Save Category";
  }
}

function upsertCategory() {
  const value = normalizeCategoryValue(newCategoryInput ? newCategoryInput.value : "");
  const description = String(newCategoryDescriptionInput ? newCategoryDescriptionInput.value : "").trim();
  const image = normalizeImageUrl(newCategoryImageInput ? newCategoryImageInput.value : "");
  const active = newCategoryActiveInput ? Boolean(newCategoryActiveInput.checked) : true;
  if (!value) {
    setCategoryManagerMessage("Enter a category name first.", true);
    return;
  }

  const records = loadCategoryRecords();
  const existing = records.find((item) => item.slug === value);
  const editingExisting = records.find((item) => item.slug === editingCategorySlug);
  if (existing && value !== editingCategorySlug) {
    setCategoryManagerMessage("Category already exists.", true);
    return;
  }

  const next = records.filter((item) => item.slug !== editingCategorySlug);
  next.push(makeCategoryRecord(value, {
    name: categoryLabel(value),
    description,
    image,
    active,
    isDefault: Boolean((editingExisting && editingExisting.isDefault) || (existing && existing.isDefault))
  }, Boolean((editingExisting && editingExisting.isDefault) || (existing && existing.isDefault))));

  saveCategoryRecords(next);
  resetCategoryEditor();
  syncCategorySelectOptions();
  setCategoryManagerMessage(existing ? `Category updated: ${categoryLabel(value)}.` : `Category created: ${categoryLabel(value)}.`);
}

function startEditCategory(slug) {
  const record = getCategoryRecord(slug);
  if (!record) {
    return;
  }
  editingCategorySlug = record.slug;
  if (newCategoryInput) {
    newCategoryInput.value = record.slug;
  }
  if (newCategoryDescriptionInput) {
    newCategoryDescriptionInput.value = record.description || "";
  }
  if (newCategoryImageInput) {
    newCategoryImageInput.value = record.image || "";
  }
  if (newCategoryActiveInput) {
    newCategoryActiveInput.checked = Boolean(record.active);
  }
  if (addCategoryBtn) {
    addCategoryBtn.textContent = "Save Category";
  }
  setCategoryManagerMessage(`Editing category: ${record.name}`);
}

function toggleCategory(slug) {
  const normalized = normalizeCategoryValue(slug);
  const records = loadCategoryRecords();
  const record = records.find((item) => item.slug === normalized);
  if (!record) {
    return;
  }
  if (record.slug === "all-products") {
    setCategoryManagerMessage("All Products category cannot be deactivated.", true);
    return;
  }
  record.active = !record.active;
  record.updatedAt = new Date().toISOString();
  saveCategoryRecords(records);
  setCategoryManagerMessage(`Category ${record.active ? "activated" : "deactivated"}: ${record.name}.`);
  syncCategorySelectOptions();
}

function removeCategory(value) {
  const normalized = normalizeCategoryValue(value);
  if (!normalized) {
    return;
  }
  const records = loadCategoryRecords();
  const target = records.find((item) => item.slug === normalized);
  if (!target) {
    return;
  }
  if (target.isDefault) {
    setCategoryManagerMessage("Default category cannot be removed.", true);
    return;
  }
  const inUse = allCatalogProducts.some((product) => productCategoryTokens(product).includes(normalized));
  if (inUse) {
    setCategoryManagerMessage("Cannot remove category while products are using it.", true);
    return;
  }
  const next = records.filter((item) => item.slug !== normalized);
  saveCategoryRecords(next);
  if (editingCategorySlug === normalized) {
    resetCategoryEditor();
  }
  setCategoryManagerMessage(`Category removed: ${target.name}.`);
  syncCategorySelectOptions();
}

function moveCategory(value, direction) {
  const normalized = normalizeCategoryValue(value);
  const step = direction === "up" ? -1 : 1;
  if (!normalized || !step) {
    return;
  }
  const records = loadCategoryRecords();
  const index = records.findIndex((item) => item.slug === normalized);
  if (index < 0) {
    return;
  }
  const nextIndex = index + step;
  if (nextIndex < 0 || nextIndex >= records.length) {
    return;
  }
  [records[index], records[nextIndex]] = [records[nextIndex], records[index]];
  saveCategoryRecords(records);
  syncCategorySelectOptions();
  setCategoryManagerMessage(`Category moved ${direction}: ${categoryLabel(normalized)}.`);
}

function exportCategoryCsv() {
  const records = loadCategoryRecords();
  if (!records.length) {
    setCategoryManagerMessage("No categories available for export.", true);
    return;
  }
  const usageMap = getCategoryProductUsageMap();
  const rows = records.map((item, index) => ({
    order: index + 1,
    slug: item.slug,
    name: item.name || categoryLabel(item.slug),
    description: item.description || "",
    image: item.image || "",
    active: item.active ? "true" : "false",
    isDefault: item.isDefault ? "true" : "false",
    products: usageMap.get(item.slug) || 0
  }));
  downloadCsvFile(rows, `categories-export-${new Date().toISOString().slice(0, 10)}.csv`);
  setCategoryManagerMessage(`Category CSV exported (${rows.length} row(s)).`);
}

function parseCategoryImportRows(fileName, parsedRows) {
  const lowerName = String(fileName || "").toLowerCase();
  if (lowerName.endsWith(".json")) {
    try {
      const payload = JSON.parse(String(parsedRows || "[]"));
      if (!Array.isArray(payload)) {
        return [];
      }
      return payload;
    } catch (error) {
      throw new Error("Invalid JSON file.");
    }
  }
  if (!Array.isArray(parsedRows) || parsedRows.length < 2) {
    return [];
  }
  const headers = parsedRows[0].map((value) => canonicalCsvHeader(value));
  const rows = parsedRows.slice(1);
  return rows.map((row) => {
    const item = {};
    headers.forEach((header, idx) => {
      item[header] = String(row[idx] || "").trim();
    });
    return item;
  });
}

function normalizeImportedCategoryItem(item) {
  const source = typeof item === "string" ? { slug: item } : (item || {});
  const slug = normalizeCategoryValue(source.slug || source.category || source.name || source.label);
  if (!slug || slug === "all") {
    return null;
  }
  const activeRaw = source.active ?? source.enabled ?? source.visible ?? source.isActive;
  const isDefaultRaw = source.isdefault ?? source.isDefault ?? source.default ?? source.system;
  const hasActiveValue = typeof activeRaw !== "undefined" && String(activeRaw).trim() !== "";
  const hasDefaultValue = typeof isDefaultRaw !== "undefined" && String(isDefaultRaw).trim() !== "";
  return {
    slug,
    name: String(source.name || source.label || categoryLabel(slug)).trim(),
    description: String(source.description || source.details || "").trim(),
    image: normalizeImageUrl(source.image || source.imageurl || source.media || ""),
    active: hasActiveValue ? parseCsvBoolean(activeRaw) : true,
    isDefault: hasDefaultValue ? parseCsvBoolean(isDefaultRaw) : false
  };
}

function mergeImportedCategoryRecords(importedItems) {
  const existing = loadCategoryRecords();
  const map = new Map(existing.map((item) => [item.slug, item]));
  let added = 0;
  let updated = 0;
  let skipped = 0;

  (Array.isArray(importedItems) ? importedItems : []).forEach((item) => {
    const normalized = normalizeImportedCategoryItem(item);
    if (!normalized) {
      skipped += 1;
      return;
    }
    const current = map.get(normalized.slug);
    if (current) {
      map.set(normalized.slug, makeCategoryRecord(normalized.slug, {
        ...current,
        ...normalized,
        isDefault: Boolean(current.isDefault || normalized.isDefault)
      }, Boolean(current.isDefault || normalized.isDefault)));
      updated += 1;
      return;
    }
    map.set(normalized.slug, makeCategoryRecord(normalized.slug, normalized, Boolean(normalized.isDefault)));
    added += 1;
  });

  saveCategoryRecords(Array.from(map.values()));
  syncCategorySelectOptions();
  setCategoryManagerMessage(`Category import complete. Added: ${added}, Updated: ${updated}, Skipped: ${skipped}.`);
}

async function handleCategoryImportFile(file) {
  if (!file) {
    return;
  }
  const lowerName = String(file.name || "").toLowerCase();
  if (!lowerName.endsWith(".csv") && !lowerName.endsWith(".json")) {
    setCategoryManagerMessage("Please choose a CSV or JSON file.", true);
    return;
  }

  try {
    if (lowerName.endsWith(".json")) {
      const text = await file.text();
      const rows = parseCategoryImportRows(file.name, text);
      mergeImportedCategoryRecords(rows);
      return;
    }
    const csvBuffer = await file.arrayBuffer();
    const csvText = decodeCsvTextFromFile(csvBuffer);
    const parsedRows = parseCsvText(csvText);
    const rows = parseCategoryImportRows(file.name, parsedRows);
    mergeImportedCategoryRecords(rows);
  } catch (error) {
    setCategoryManagerMessage(error.message || "Failed to import categories.", true);
  }
}

function viewCategoryProducts(value) {
  const normalized = normalizeCategoryValue(value);
  if (!normalized) {
    return;
  }
  if (catalogCategoryFilter) {
    catalogCategoryFilter.value = normalized;
  }
  applyCatalogFilters();
  const catalogSection = document.getElementById("catalog");
  if (catalogSection && typeof catalogSection.scrollIntoView === "function") {
    catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  setMessage(`Products filtered by category: ${categoryLabel(normalized)}.`);
}

function formatStatus(value) {
  return String(value || "processing")
    .split("_")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function percent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function shortDayLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function dateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleString();
}

function dateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }
  return date.toLocaleDateString();
}

function defaultPhoneVerificationAutomationSettings() {
  return {
    enabled: false,
    runOnStart: false,
    intervalMinutes: 720,
    channels: ["sms", "email"],
    limit: 25,
    updatedAt: null,
    updatedBy: ""
  };
}

function defaultPhoneVerificationAutomationHistorySummary() {
  return {
    totalRuns: 0,
    runsLast7Days: 0,
    sentLast7Days: 0,
    failedLast7Days: 0,
    affectedUsersLast7Days: 0,
    statusCounts: {}
  };
}

function normalizePhoneVerificationAutomationSettings(value) {
  const fallback = defaultPhoneVerificationAutomationSettings();
  const source = value && typeof value === "object" ? value : {};
  const channels = Array.isArray(source.channels)
    ? [...new Set(source.channels.map((item) => String(item || "").trim().toLowerCase()).filter((item) => item === "sms" || item === "email"))]
    : fallback.channels;
  return {
    enabled: source.enabled === true,
    runOnStart: source.runOnStart === true,
    intervalMinutes: Math.max(15, Number(source.intervalMinutes || fallback.intervalMinutes)),
    channels: channels.length ? channels : [...fallback.channels],
    limit: Math.max(1, Math.min(200, Number(source.limit || fallback.limit))),
    updatedAt: source.updatedAt ? String(source.updatedAt) : null,
    updatedBy: source.updatedBy ? String(source.updatedBy) : ""
  };
}

function normalizePhoneVerificationAutomationHistorySummary(value) {
  const fallback = defaultPhoneVerificationAutomationHistorySummary();
  const source = value && typeof value === "object" ? value : {};
  return {
    totalRuns: Math.max(0, Number(source.totalRuns || fallback.totalRuns)),
    runsLast7Days: Math.max(0, Number(source.runsLast7Days || fallback.runsLast7Days)),
    sentLast7Days: Math.max(0, Number(source.sentLast7Days || fallback.sentLast7Days)),
    failedLast7Days: Math.max(0, Number(source.failedLast7Days || fallback.failedLast7Days)),
    affectedUsersLast7Days: Math.max(0, Number(source.affectedUsersLast7Days || fallback.affectedUsersLast7Days)),
    statusCounts: source.statusCounts && typeof source.statusCounts === "object" ? source.statusCounts : {}
  };
}

function normalizePhoneVerificationAutomationHistoryEntry(value) {
  const source = value && typeof value === "object" ? value : {};
  const channels = Array.isArray(source.channels)
    ? [...new Set(source.channels.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean))]
    : [];
  return {
    id: String(source.id || ""),
    startedAt: source.startedAt ? String(source.startedAt) : null,
    finishedAt: source.finishedAt ? String(source.finishedAt) : null,
    status: String(source.status || "idle").toLowerCase(),
    message: String(source.message || ""),
    actor: String(source.actor || ""),
    trigger: String(source.trigger || "manual"),
    channels,
    limit: Math.max(1, Math.min(200, Number(source.limit || 25))),
    candidateCount: Math.max(0, Number(source.candidateCount || 0)),
    eligibleCount: Math.max(0, Number(source.eligibleCount || 0)),
    deliveredCount: Math.max(0, Number(source.deliveredCount || 0)),
    queuedCount: Math.max(0, Number(source.queuedCount || 0)),
    failedCount: Math.max(0, Number(source.failedCount || 0)),
    skippedCount: Math.max(0, Number(source.skippedCount || 0)),
    affectedUsers: Math.max(0, Number(source.affectedUsers || 0))
  };
}

function applyPhoneVerificationAutomationSettings(settings) {
  const normalized = normalizePhoneVerificationAutomationSettings(settings);
  currentPhoneVerificationAutomationSettings = normalized;

  if (phoneVerificationAutomationEnabledInput) {
    phoneVerificationAutomationEnabledInput.checked = normalized.enabled;
  }
  if (phoneVerificationAutomationRunOnStartInput) {
    phoneVerificationAutomationRunOnStartInput.checked = normalized.runOnStart;
  }
  if (phoneVerificationAutomationIntervalInput) {
    phoneVerificationAutomationIntervalInput.value = String(normalized.intervalMinutes);
  }
  if (phoneVerificationAutomationLimitInput) {
    phoneVerificationAutomationLimitInput.value = String(normalized.limit);
  }
  if (phoneVerificationAutomationSmsChannelInput) {
    phoneVerificationAutomationSmsChannelInput.checked = normalized.channels.includes("sms");
  }
  if (phoneVerificationAutomationEmailChannelInput) {
    phoneVerificationAutomationEmailChannelInput.checked = normalized.channels.includes("email");
  }
  if (phoneVerificationAutomationSettingsMeta) {
    const parts = [
      normalized.enabled ? "Scheduler enabled" : "Scheduler disabled",
      `Every ${normalized.intervalMinutes} min`,
      `Batch ${normalized.limit}`,
      normalized.channels.map(formatNotificationChannel).join(" + ")
    ];
    if (normalized.updatedAt) {
      parts.push(`Updated ${dateTime(normalized.updatedAt)}`);
    }
    if (normalized.updatedBy) {
      parts.push(`By ${normalized.updatedBy}`);
    }
    phoneVerificationAutomationSettingsMeta.textContent = parts.join(" • ");
  }
}

function readPhoneVerificationAutomationSettingsDraft() {
  const channels = [];
  if (phoneVerificationAutomationSmsChannelInput && phoneVerificationAutomationSmsChannelInput.checked) {
    channels.push("sms");
  }
  if (phoneVerificationAutomationEmailChannelInput && phoneVerificationAutomationEmailChannelInput.checked) {
    channels.push("email");
  }
  return normalizePhoneVerificationAutomationSettings({
    enabled: Boolean(phoneVerificationAutomationEnabledInput && phoneVerificationAutomationEnabledInput.checked),
    runOnStart: Boolean(phoneVerificationAutomationRunOnStartInput && phoneVerificationAutomationRunOnStartInput.checked),
    intervalMinutes: Number(phoneVerificationAutomationIntervalInput && phoneVerificationAutomationIntervalInput.value),
    limit: Number(phoneVerificationAutomationLimitInput && phoneVerificationAutomationLimitInput.value),
    channels,
    updatedAt: currentPhoneVerificationAutomationSettings.updatedAt || null,
    updatedBy: currentPhoneVerificationAutomationSettings.updatedBy || ""
  });
}

function normalizePhoneNumber(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/[^\d]/g, "");
  return `${hasPlus ? "+" : ""}${digits}`;
}

function maskPhone(value) {
  const raw = String(value || "").trim();
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) {
    return "N/A";
  }
  if (digits.length <= 4) {
    return digits;
  }
  return `${hasPlus ? "+" : ""}${"*".repeat(Math.max(2, digits.length - 4))}${digits.slice(-4)}`;
}

function normalizeUserPhoneVerification(value, mobile = "") {
  const source = value && typeof value === "object" ? value : {};
  const normalizedMobile = normalizePhoneNumber(mobile);
  const verifiedForMobile = normalizePhoneNumber(source.verifiedForMobile || "");
  return {
    isVerified: source.isVerified === true || Boolean(source.verifiedAt && verifiedForMobile && verifiedForMobile === normalizedMobile),
    verifiedAt: source.verifiedAt ? String(source.verifiedAt) : null,
    mobileMasked: source.mobileMasked ? String(source.mobileMasked) : maskPhone(mobile),
    hasPendingCode: source.hasPendingCode === true || Boolean(source.pendingCode && source.pendingExpiresAt),
    pendingExpiresAt: source.pendingExpiresAt ? String(source.pendingExpiresAt) : null,
    resendAvailableAt: source.resendAvailableAt ? String(source.resendAvailableAt) : null,
    remainingAttempts: Number.isFinite(Number(source.remainingAttempts)) ? Math.max(0, Number(source.remainingAttempts)) : 5,
    isLocked: source.isLocked === true || Boolean(source.lockedUntil),
    lockedUntil: source.lockedUntil ? String(source.lockedUntil) : null
  };
}

function getUserPhoneStatus(user) {
  const mobile = String(user && user.mobile ? user.mobile : "").trim();
  const phoneVerification = normalizeUserPhoneVerification(user && user.phoneVerification, mobile);

  if (!mobile) {
    return {
      tone: "missing",
      label: "No phone",
      detail: "SMS and WhatsApp unavailable"
    };
  }

  if (phoneVerification.isVerified) {
    return {
      tone: "verified",
      label: "Verified",
      detail: phoneVerification.verifiedAt ? `Verified on ${dateOnly(phoneVerification.verifiedAt)}` : "Verification complete"
    };
  }

  if (phoneVerification.isLocked) {
    return {
      tone: "locked",
      label: "Locked",
      detail: phoneVerification.lockedUntil ? `Retry after ${dateTime(phoneVerification.lockedUntil)}` : "Too many attempts"
    };
  }

  if (phoneVerification.hasPendingCode) {
    return {
      tone: "pending",
      label: "Pending OTP",
      detail: phoneVerification.pendingExpiresAt ? `Code expires ${dateTime(phoneVerification.pendingExpiresAt)}` : "Awaiting OTP confirmation"
    };
  }

  return {
    tone: "unverified",
    label: "Needs verification",
    detail: "SMS and WhatsApp are blocked"
  };
}

function loadInvoiceLog() {
  return loadJsonStorage(INVOICE_LOG_KEY, {});
}

function renderBreakdown(listEl, values, labelFormatter = formatStatus) {
  if (!listEl) {
    return;
  }
  const entries = Object.entries(values || {});
  if (!entries.length) {
    listEl.innerHTML = "<li><span>No data</span><strong>0</strong></li>";
    return;
  }
  listEl.innerHTML = entries
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .map(([key, count]) => `<li><span>${labelFormatter(key)}</span><strong>${Number(count || 0)}</strong></li>`)
    .join("");
}

function renderRevenueSeries(series) {
  if (!revenueBars) {
    return;
  }
  if (!Array.isArray(series) || !series.length) {
    revenueBars.innerHTML = "<p>No revenue data yet.</p>";
    return;
  }

  const max = Math.max(...series.map((slot) => Number(slot.revenue || 0)), 1);
  revenueBars.innerHTML = series.map((slot) => {
    const value = Number(slot.revenue || 0);
    const height = Math.max((value / max) * 100, value > 0 ? 6 : 3);
    return `
      <article class="revenue-bar" title="${slot.date}: ${money(value)} from ${Number(slot.orders || 0)} orders">
        <div class="revenue-bar-fill" style="height:${height}%"></div>
        <span class="revenue-bar-day">${shortDayLabel(slot.date)}</span>
        <span class="revenue-bar-value">${money(value)}</span>
      </article>
    `;
  }).join("");
}

function renderTopProducts(products) {
  if (!topProductsList) {
    return;
  }
  if (!Array.isArray(products) || !products.length) {
    topProductsList.innerHTML = "<li><strong>No paid orders yet.</strong><span>Top products will appear here.</span></li>";
    return;
  }
  topProductsList.innerHTML = products.map((product) => `
    <li>
      <div>
        <strong>${product.name || "Unknown"}</strong>
        <span>${Number(product.quantity || 0)} units sold</span>
      </div>
      <strong>${money(product.revenue || 0)}</strong>
    </li>
  `).join("");
}

function renderInvoiceTracking(orders) {
  if (!invoiceMeta || !invoiceTableBody) {
    return;
  }
  const safeOrders = Array.isArray(orders) ? orders : [];
  const invoiceLog = loadInvoiceLog();
  const invoices = safeOrders.map((order) => {
    const orderId = String(order.id || "");
    const invoiceNo = `INV-${orderId.slice(0, 8).toUpperCase()}`;
    const issuedOn = order.createdAt || "";
    const paymentStatus = String(order.paymentStatus || "pending").toLowerCase();
    const isPaid = paymentStatus === "paid" || paymentStatus === "authorized" || paymentStatus === "captured";
    const logged = invoiceLog[orderId] || {};
    const paymentOn = logged.paymentReceivedAt || (isPaid ? order.createdAt : "");
    return {
      invoiceNo,
      orderId,
      issuedOn,
      paymentOn,
      status: isPaid ? "paid" : "pending",
      amount: Number(order.total || 0)
    };
  });

  const pendingCount = invoices.filter((item) => item.status === "pending").length;
  invoiceMeta.textContent = `${invoices.length} invoices • Pending ${pendingCount}`;

  if (!invoices.length) {
    invoiceTableBody.innerHTML = "<tr><td colspan='7'>No invoices found.</td></tr>";
    return;
  }

  invoiceTableBody.innerHTML = invoices.map((item) => `
    <tr>
      <td>${item.invoiceNo}</td>
      <td>${item.orderId || "N/A"}</td>
      <td>${dateOnly(item.issuedOn)}</td>
      <td>${item.paymentOn ? dateOnly(item.paymentOn) : "Pending"}</td>
      <td><span class="status-tag ${item.status}">${formatStatus(item.status)}</span></td>
      <td>${money(item.amount)}</td>
      <td><a class="mini-btn" href="invoice.html?orderId=${encodeURIComponent(item.orderId)}" target="_blank" rel="noopener">Open</a></td>
    </tr>
  `).join("");
}

function renderAnalytics(analytics) {
  const kpis = analytics && analytics.kpis ? analytics.kpis : {};

  if (kpiAov) {
    kpiAov.textContent = money(kpis.averageOrderValue || 0);
  }
  if (kpiPaidOrders) {
    kpiPaidOrders.textContent = String(kpis.paidOrders || 0);
  }
  if (kpiCancellationRate) {
    kpiCancellationRate.textContent = percent(kpis.cancellationRate || 0);
  }
  if (kpiOrdersToday) {
    kpiOrdersToday.textContent = String(kpis.ordersToday || 0);
  }
  if (revenue7dTotal) {
    revenue7dTotal.textContent = money(kpis.revenueLast7Days || 0);
  }

  renderRevenueSeries(analytics && analytics.revenueLast7Days ? analytics.revenueLast7Days : []);
  renderBreakdown(statusBreakdownList, analytics && analytics.ordersByStatus ? analytics.ordersByStatus : {});
  renderBreakdown(
    paymentBreakdownList,
    analytics && analytics.paymentsByMethod ? analytics.paymentsByMethod : {},
    (value) => String(value || "").toUpperCase()
  );
  renderTopProducts(analytics && analytics.topProducts ? analytics.topProducts : []);
}

function api(path, options = {}) {
  const session = requireAdminSession();
  if (!session) {
    return Promise.reject(new Error("Admin session required"));
  }

  const headers = {
    Authorization: `Bearer ${session.token}`,
    ...(options.headers || {})
  };

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
}

function updateSummary(summary) {
  statUsers.textContent = String(summary.users || 0);
  statProducts.textContent = String(summary.products || 0);
  statOrders.textContent = String(summary.orders || 0);
  statPayments.textContent = String(summary.payments || 0);
  statRevenue.textContent = money(summary.totalRevenue || 0);
}

function normalizeDashboardStatus(value) {
  return String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function countOrdersByStatuses(statuses = []) {
  const wanted = new Set((Array.isArray(statuses) ? statuses : []).map((item) => normalizeDashboardStatus(item)));
  return allOrders.filter((order) => wanted.has(normalizeDashboardStatus(order && order.status))).length;
}

function buildSellerCentralMetrics() {
  const products = Array.isArray(allCatalogProducts) ? allCatalogProducts : [];
  const users = Array.isArray(allUsers) ? allUsers : [];
  const notifications = Array.isArray(allOrderNotifications) ? allOrderNotifications : [];
  const afterSalesCases = Array.isArray(allAfterSalesCases) ? allAfterSalesCases : [];
  const lowStockCount = products.filter((item) => getProductInventoryStatus(item) === "low").length;
  const outOfStockCount = products.filter((item) => getProductInventoryStatus(item) === "out").length;
  const draftProducts = products.filter((item) => normalizeDashboardStatus(item && item.status) === "draft").length;
  const featuredProducts = products.filter((item) => Boolean(item && item.featured)).length;
  const b2bProducts = products.filter((item) => String(item && item.segment || "").trim().toLowerCase() === "b2b").length;
  const activeProducts = products.filter((item) => {
    const status = normalizeDashboardStatus(item && item.status);
    return !status || status === "active";
  }).length;
  const ordersToProcess = countOrdersByStatuses(["placed", "order_placed", "processing", "confirmed", "packed"]);
  const inTransitOrders = countOrdersByStatuses(["shipped", "out_for_delivery"]);
  const cancelledOrders = countOrdersByStatuses(["cancelled", "canceled"]);
  const openReturns = Number(currentAfterSalesSummary.open || 0) || afterSalesCases.filter((item) => {
    const status = normalizeDashboardStatus(item && item.status);
    return !["closed", "rejected", "refunded", "exchange_completed"].includes(status);
  }).length;
  const refundPending = afterSalesCases.filter((item) => normalizeDashboardStatus(item && item.status) === "refund_pending").length;
  const notificationFailures = notifications.filter((item) => {
    const status = normalizeDashboardStatus(item && item.status);
    return status === "failed" || status === "skipped" || Boolean(item && item.failed);
  }).length;
  const queuedNotifications = notifications.filter((item) => normalizeDashboardStatus(item && item.status) === "queued").length;
  const usersNeedVerification = users.filter((user) => {
    const state = normalizeUserPhoneVerification(user && user.phoneVerification, user && user.mobile);
    return !state.isVerified;
  }).length;
  const verifiedUsers = users.filter((user) => normalizeUserPhoneVerification(user && user.phoneVerification, user && user.mobile).isVerified).length;
  const automationCandidates = Number(currentPhoneVerificationAutomationSummary.candidateCount || 0);
  const auditActions = Array.isArray(allAdminAuditEntries) ? allAdminAuditEntries.length : 0;
  const activeCategories = new Set(products.map((item) => normalizeCategoryValue(item && item.category)).filter(Boolean)).size;

  return {
    lowStockCount,
    outOfStockCount,
    draftProducts,
    featuredProducts,
    b2bProducts,
    activeProducts,
    ordersToProcess,
    inTransitOrders,
    cancelledOrders,
    openReturns,
    refundPending,
    notificationFailures,
    queuedNotifications,
    usersNeedVerification,
    verifiedUsers,
    automationCandidates,
    auditActions,
    activeCategories
  };
}

function renderSellerCentralServices() {
  if (!sellerWorkbenchCards || !sellerServiceHub || !sellerActionQueue || !sellerQueueMeta) {
    return;
  }

  const metrics = buildSellerCentralMetrics();

  sellerWorkbenchCards.innerHTML = [
    {
      title: "Operations Health",
      copy: "Keep daily order movement clean and catch issues before they spill into support.",
      href: adminPageHref("orders"),
      cta: "Open orders desk",
      stats: [
        { label: "To process", value: metrics.ordersToProcess },
        { label: "In transit", value: metrics.inTransitOrders }
      ]
    },
    {
      title: "Inventory Pulse",
      copy: "Watch low-stock and out-of-stock pressure the same way seller central highlights inventory risk.",
      href: adminPageHref("listing"),
      cta: "Review product inventory",
      stats: [
        { label: "Low stock", value: metrics.lowStockCount },
        { label: "Out of stock", value: metrics.outOfStockCount }
      ]
    },
    {
      title: "Customer Trust",
      copy: "Track returns, refund pressure, and verification gaps from one operational view.",
      href: adminPageHref("after-sales"),
      cta: "Open customer support flows",
      stats: [
        { label: "Open cases", value: metrics.openReturns },
        { label: "Need verification", value: metrics.usersNeedVerification }
      ]
    },
    {
      title: "Listing Readiness",
      copy: "Keep products publish-ready with active assortments, featured merchandising, and B2B coverage.",
      href: adminPageHref("listing"),
      cta: "Open products workspace",
      stats: [
        { label: "Draft products", value: metrics.draftProducts },
        { label: "Featured", value: metrics.featuredProducts }
      ]
    }
  ].map((card) => `
    <article class="seller-workbench-card">
      <div>
        <h3>${card.title}</h3>
        <p>${card.copy}</p>
      </div>
      <div class="seller-workbench-stats">
        ${card.stats.map((stat) => `<span><strong>${stat.value}</strong>${stat.label}</span>`).join("")}
      </div>
      <a class="seller-workbench-link" href="${card.href}">${card.cta}</a>
    </article>
  `).join("");

  sellerServiceHub.innerHTML = [
    {
      title: "Listings & Pricing",
      pillar: "Listings",
      copy: "Add products, tighten inventory, and keep assortment breadth ready for search and merchandising.",
      meta: [
        `${metrics.activeProducts} active`,
        `${metrics.draftProducts} draft`,
        `${metrics.activeCategories} categories`
      ],
      href: adminPageHref("listing"),
      cta: "Go to products"
    },
    {
      title: "Fulfillment & Returns",
      pillar: "Fulfillment",
      copy: "Watch processing load, in-transit orders, and returns together so delivery and support stay aligned.",
      meta: [
        `${metrics.ordersToProcess} to process`,
        `${metrics.inTransitOrders} in transit`,
        `${metrics.openReturns} open cases`
      ],
      href: adminPageHref("after-sales"),
      cta: "Review operations"
    },
    {
      title: "Customer Messaging",
      pillar: "Support",
      copy: "Keep notifications, reminders, and follow-up actions reliable across order and phone-verification channels.",
      meta: [
        `${metrics.notificationFailures} failures`,
        `${metrics.queuedNotifications} queued`,
        `${metrics.automationCandidates} automation candidates`
      ],
      href: adminPageHref("notifications"),
      cta: "Open notification center"
    },
    {
      title: "Compliance & Oversight",
      pillar: "Governance",
      copy: "Use audit visibility and customer state tracking to maintain clean admin execution.",
      meta: [
        `${metrics.auditActions} audit actions`,
        `${metrics.verifiedUsers} verified users`,
        `${metrics.cancelledOrders} cancelled orders`
      ],
      href: adminPageHref("audit"),
      cta: "Open audit trail"
    }
  ].map((card) => `
    <article class="seller-service-card">
      <div class="seller-service-topline">
        <strong>${card.title}</strong>
        <span class="seller-service-pill">${card.pillar}</span>
      </div>
      <p>${card.copy}</p>
      <div class="seller-service-meta">
        ${card.meta.map((item) => `<span>${item}</span>`).join("")}
      </div>
      <a href="${card.href}">${card.cta}</a>
    </article>
  `).join("");

  const queueItems = [
    {
      count: metrics.outOfStockCount,
      title: "Restock out-of-stock products",
      detail: "These products are fully unavailable and need immediate inventory action.",
      href: adminPageHref("listing"),
      cta: "Open products",
      tone: "attention"
    },
    {
      count: metrics.openReturns,
      title: "Resolve open return and refund cases",
      detail: "Customer support load is waiting in after-sales and refund workflows.",
      href: adminPageHref("after-sales"),
      cta: "Open returns desk",
      tone: "warning"
    },
    {
      count: metrics.notificationFailures,
      title: "Review failed customer notifications",
      detail: "Notification delivery needs attention before support volume grows.",
      href: adminPageHref("notifications"),
      cta: "Open notifications",
      tone: "warning"
    },
    {
      count: metrics.usersNeedVerification,
      title: "Nudge customers pending verification",
      detail: "Phone verification gaps reduce messaging reach and trust signals.",
      href: adminPageHref("phone-verification"),
      cta: "Open automation",
      tone: "warning"
    },
    {
      count: metrics.draftProducts,
      title: "Publish draft product listings",
      detail: "Draft listings are sitting in the product workspace and can be activated.",
      href: adminPageHref("listing"),
      cta: "Review products",
      tone: "good"
    }
  ].filter((item) => item.count > 0);

  sellerQueueMeta.textContent = `${queueItems.length} active tasks`;
  sellerActionQueue.innerHTML = queueItems.length
    ? queueItems.map((item) => `
      <article class="seller-action-item">
        <span class="seller-action-badge ${item.tone}">${item.count}</span>
        <div>
          <strong>${item.title}</strong>
          <p>${item.detail}</p>
        </div>
        <a href="${item.href}">${item.cta}</a>
      </article>
    `).join("")
    : `
      <article class="seller-action-item">
        <span class="seller-action-badge good">OK</span>
        <div>
          <strong>Operations look healthy</strong>
          <p>No urgent actions are currently blocking orders, customer messaging, or listings.</p>
        </div>
        <a href="${adminPageHref("overview")}">Back to summary</a>
      </article>
    `;
}

function renderUsers(users) {
  const verifiedCount = users.filter((user) => normalizeUserPhoneVerification(user.phoneVerification, user.mobile).isVerified).length;
  const pendingCount = users.filter((user) => {
    const state = normalizeUserPhoneVerification(user.phoneVerification, user.mobile);
    return !state.isVerified && state.hasPendingCode;
  }).length;
  const totalUsers = Array.isArray(allUsers) ? allUsers.length : users.length;
  const countPrefix = users.length === totalUsers ? `${users.length} users` : `Showing ${users.length} of ${totalUsers} users`;
  usersMeta.textContent = `${countPrefix} • ${verifiedCount} verified${pendingCount ? ` • ${pendingCount} pending` : ""}`;
  if (!users.length) {
    usersTableBody.innerHTML = "<tr><td colspan='5'>No users found.</td></tr>";
    return;
  }

  usersTableBody.innerHTML = users.map((user) => {
    const phoneStatus = getUserPhoneStatus(user);
    return `
      <tr>
        <td>${escapeHtml(user.name || "N/A")}</td>
        <td>${escapeHtml(user.email || "N/A")}</td>
        <td>${escapeHtml(user.mobile || "N/A")}</td>
        <td class="status-cell">
          <span class="status-tag ${phoneStatus.tone}">${phoneStatus.label}</span>
          <div class="subtle">${escapeHtml(phoneStatus.detail)}</div>
        </td>
        <td>${escapeHtml(user.role || "customer")}</td>
      </tr>
    `;
  }).join("");
}

function getUserRoleFilterLabel(value) {
  const normalized = String(value || "all").trim().toLowerCase();
  if (normalized === "all") {
    return "Role: All";
  }
  const selectedLabel = String(userRoleFilter?.selectedOptions?.[0]?.textContent || normalized).trim();
  return `Role: ${selectedLabel}`;
}

function getUserPhoneFilterLabel(value) {
  const normalized = String(value || "all").trim().toLowerCase();
  if (normalized === "all") {
    return "Phone: All";
  }
  const selectedLabel = String(userPhoneVerificationFilter?.selectedOptions?.[0]?.textContent || normalized).trim();
  return `Phone: ${selectedLabel}`;
}

function getActiveUserFilters() {
  const filters = [];
  const query = String(userSearch?.value || "").trim();
  const role = String(userRoleFilter?.value || "all").trim().toLowerCase();
  const phoneState = String(userPhoneVerificationFilter?.value || "all").trim().toLowerCase();

  if (query) {
    filters.push({
      id: "query",
      label: `Search: ${query}`,
      clear: () => {
        userSearch.value = "";
      },
      focus: userSearch,
      feedback: "Removed user search filter. Focus moved to the user search input."
    });
  }

  if (role !== "all") {
    filters.push({
      id: "role",
      label: getUserRoleFilterLabel(role),
      clear: () => {
        userRoleFilter.value = "all";
      },
      focus: userRoleFilter,
      feedback: "Removed user role filter. Focus moved to the role filter."
    });
  }

  if (phoneState !== "all") {
    filters.push({
      id: "phoneState",
      label: getUserPhoneFilterLabel(phoneState),
      clear: () => {
        userPhoneVerificationFilter.value = "all";
      },
      focus: userPhoneVerificationFilter,
      feedback: "Removed phone verification filter. Focus moved to the phone filter."
    });
  }

  return filters;
}

function getFilteredUsers() {
  const query = String(userSearch.value || "").trim().toLowerCase();
  const role = String(userRoleFilter.value || "all");
  const phoneState = String(userPhoneVerificationFilter && userPhoneVerificationFilter.value ? userPhoneVerificationFilter.value : "all");
  return allUsers.filter((user) => {
    const name = String(user.name || "").toLowerCase();
    const email = String(user.email || "").toLowerCase();
    const mobile = String(user.mobile || "").toLowerCase();
    const phoneStatus = normalizeUserPhoneVerification(user.phoneVerification, user.mobile);
    const roleMatch = role === "all" || String(user.role || "customer") === role;
    const queryMatch = !query || name.includes(query) || email.includes(query) || mobile.includes(query);
    const phoneStateMatch = phoneState === "all"
      || (phoneState === "verified" && phoneStatus.isVerified)
      || (phoneState === "pending" && !phoneStatus.isVerified && phoneStatus.hasPendingCode)
      || (phoneState === "locked" && !phoneStatus.isVerified && phoneStatus.isLocked)
      || (phoneState === "unverified" && !phoneStatus.isVerified && !phoneStatus.hasPendingCode && !phoneStatus.isLocked && Boolean(mobile))
      || (phoneState === "missing" && !mobile);
    return roleMatch && queryMatch && phoneStateMatch;
  });
}

function applyUserFilters() {
  renderUsers(getFilteredUsers());
  adminUserFilterChipController?.update();
}

function orderItemsPreview(order) {
  if (!Array.isArray(order.items) || !order.items.length) {
    return "No items";
  }
  const names = order.items.map((item) => item.name).filter(Boolean);
  return names.length ? names.slice(0, 2).join(", ") : "Items";
}

function orderRow(order) {
  const currentStatus = String(order.status || "processing");
  const invoiceUrl = `invoice.html?orderId=${encodeURIComponent(String(order.id || ""))}`;
  const activeCase = getActiveAfterSalesCaseForOrder(order.id);
  const caseBadge = activeCase
    ? `<div class="after-sales-inline-meta"><span class="status-tag ${escapeHtmlAttr(activeCase.status)}">${escapeHtml(activeCase.type)}: ${escapeHtml(formatStatus(activeCase.status))}</span></div>`
    : "";
  return `
    <tr>
      <td>${order.id}</td>
      <td>${orderItemsPreview(order)}${caseBadge}</td>
      <td>${money(order.total)}</td>
      <td>${formatStatus(order.paymentStatus)}</td>
      <td class="status-cell">
        <span class="status-tag ${currentStatus}">${formatStatus(currentStatus)}</span>
      </td>
      <td>
        <select class="status-select" data-order-id="${order.id}">
          <option value="processing" ${currentStatus === "processing" ? "selected" : ""}>Processing</option>
          <option value="shipped" ${currentStatus === "shipped" ? "selected" : ""}>Shipped</option>
          <option value="delivered" ${currentStatus === "delivered" ? "selected" : ""}>Delivered</option>
          <option value="cancelled" ${currentStatus === "cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
        <button class="update-btn" type="button" data-action="update-order-status" data-order-id="${order.id}">Save</button>
        <button class="mini-btn" type="button" data-action="open-after-sales-case" data-order-id="${order.id}">After Sales</button>
        <a class="mini-btn" href="${invoiceUrl}" target="_blank" rel="noopener">Invoice</a>
      </td>
    </tr>
  `;
}

function renderOrders(orders) {
  ordersMeta.textContent = `${orders.length} orders`;
  if (!orders.length) {
    ordersTableBody.innerHTML = "<tr><td colspan='6'>No orders found.</td></tr>";
    return;
  }
  ordersTableBody.innerHTML = orders.map(orderRow).join("");
}

function getAdminOrderFilterStatusLabel(value) {
  const normalized = String(value || "all").trim().toLowerCase();
  if (normalized === "all") {
    return "Status: All";
  }
  const selectedLabel = String(orderStatusFilterAdmin?.selectedOptions?.[0]?.textContent || normalized).trim();
  return `Status: ${selectedLabel}`;
}

function getActiveAdminOrderFilters() {
  const filters = [];
  const query = String(orderSearchAdmin?.value || "").trim();
  const status = String(orderStatusFilterAdmin?.value || "all").trim().toLowerCase();

  if (query) {
    filters.push({
      id: "query",
      label: `Search: ${query}`,
      clear: () => {
        orderSearchAdmin.value = "";
      },
      focus: orderSearchAdmin,
      feedback: "Removed admin order search filter. Focus moved to the order search input."
    });
  }

  if (status !== "all") {
    filters.push({
      id: "status",
      label: getAdminOrderFilterStatusLabel(status),
      clear: () => {
        orderStatusFilterAdmin.value = "all";
      },
      focus: orderStatusFilterAdmin,
      feedback: "Removed admin order status filter. Focus moved to the status filter."
    });
  }

  return filters;
}

function salesRow(sale) {
  const paymentStatus = String(sale.paymentStatus || "pending");
  const orderStatus = String(sale.orderStatus || "processing");
  const orderId = String(sale.orderId || "");
  const invoiceUrl = orderId ? `invoice.html?orderId=${encodeURIComponent(orderId)}` : "";
  const invoiceAction = orderId
    ? `<a class="mini-btn" href="${invoiceUrl}" target="_blank" rel="noopener">Print Invoice</a>`
    : "<span>N/A</span>";
  return `
    <tr>
      <td>
        <strong>${orderId || "N/A"}</strong><br />
        ${invoiceAction}
      </td>
      <td>
        <strong>${sale.customerName || "Unknown"}</strong><br />
        <small>${sale.customerEmail || "N/A"}</small>
      </td>
      <td>${Number(sale.itemCount || 0)}</td>
      <td>${money(sale.total || 0)}</td>
      <td><span class="status-tag ${paymentStatus}">${formatStatus(paymentStatus)}</span></td>
      <td><span class="status-tag ${orderStatus}">${formatStatus(orderStatus)}</span></td>
      <td>${dateTime(sale.createdAt)}</td>
    </tr>
  `;
}

function renderSales(payload) {
  const sales = Array.isArray(payload && payload.sales) ? payload.sales : [];
  const totalRevenue = Number(payload && payload.totalRevenue ? payload.totalRevenue : 0);

  if (salesMeta) {
    salesMeta.textContent = `${sales.length} sales • ${money(totalRevenue)}`;
  }

  if (!salesTableBody) {
    return;
  }

  if (!sales.length) {
    salesTableBody.innerHTML = "<tr><td colspan='7'>No completed sales yet.</td></tr>";
    return;
  }

  salesTableBody.innerHTML = sales.map(salesRow).join("");
}

const AFTER_SALES_STATUS_OPTIONS = {
  refund: ["requested", "approved", "rejected", "refund_pending", "refunded", "closed"],
  return: ["requested", "approved", "rejected", "pickup_scheduled", "in_transit", "received", "refund_pending", "refunded", "closed"],
  exchange: ["requested", "approved", "rejected", "pickup_scheduled", "in_transit", "received", "exchange_processing", "exchange_shipped", "exchange_completed", "closed"]
};

function getAfterSalesStatusOptions(type) {
  return AFTER_SALES_STATUS_OPTIONS[String(type || "return").trim().toLowerCase()] || AFTER_SALES_STATUS_OPTIONS.return;
}

function getActiveAfterSalesCaseForOrder(orderId) {
  const normalizedOrderId = String(orderId || "").trim();
  if (!normalizedOrderId) {
    return null;
  }
  return allAfterSalesCases.find((item) => item.orderId === normalizedOrderId && !["rejected", "refunded", "exchange_completed", "closed"].includes(String(item.status || ""))) || null;
}

function afterSalesSummaryStat(label, value, tone = "") {
  return `
    <article class="summary-card after-sales-card ${tone}">
      <p>${escapeHtml(label)}</p>
      <strong>${Number(value || 0)}</strong>
    </article>
  `;
}

function renderAfterSalesSummary(summary = {}) {
  if (!afterSalesSummaryCards) {
    return;
  }
  afterSalesSummaryCards.innerHTML = [
    afterSalesSummaryStat("Open Cases", summary.open || 0),
    afterSalesSummaryStat("Refunds", summary.refund || 0),
    afterSalesSummaryStat("Returns", summary.return || 0),
    afterSalesSummaryStat("Exchanges", summary.exchange || 0),
    afterSalesSummaryStat("Refunded", summary.refunded || 0, "success"),
    afterSalesSummaryStat("Rejected", summary.rejected || 0, "warning")
  ].join("");
}

function afterSalesRow(caseItem) {
  const statusOptions = getAfterSalesStatusOptions(caseItem.type)
    .map((status) => `<option value="${status}" ${status === caseItem.status ? "selected" : ""}>${formatStatus(status)}</option>`)
    .join("");
  const refundValue = Number(caseItem.refundAmount || caseItem.orderTotal || 0);
  const customerLine = caseItem.customerEmail
    ? `<small>${escapeHtml(caseItem.customerEmail)}</small>`
    : "<small>N/A</small>";
  const timelineNote = caseItem.timeline && caseItem.timeline.length
    ? caseItem.timeline[caseItem.timeline.length - 1].note || ""
    : "";

  return `
    <tr>
      <td>
        <strong>${escapeHtml(caseItem.id)}</strong><br />
        <small>${dateTime(caseItem.createdAt)}</small>
      </td>
      <td>
        <strong>${escapeHtml(caseItem.orderId)}</strong><br />
        ${escapeHtml(caseItem.customerName || "Unknown")}<br />
        ${customerLine}
      </td>
      <td><span class="status-tag ${escapeHtmlAttr(caseItem.type)}">${escapeHtml(formatStatus(caseItem.type))}</span></td>
      <td>
        <strong>${escapeHtml(formatStatus(caseItem.reason || "other"))}</strong>
        ${timelineNote ? `<div class="note-preview">${escapeHtml(timelineNote)}</div>` : ""}
      </td>
      <td><span class="status-tag ${escapeHtmlAttr(caseItem.status)}">${escapeHtml(formatStatus(caseItem.status))}</span></td>
      <td>${money(refundValue)}</td>
      <td>
        <select class="status-select" data-case-id="${escapeHtmlAttr(caseItem.id)}">
          ${statusOptions}
        </select>
        <button class="update-btn" type="button" data-action="update-after-sales-status" data-case-id="${escapeHtmlAttr(caseItem.id)}">Save</button>
      </td>
    </tr>
  `;
}

function getFilteredAfterSalesCases() {
  const query = String(afterSalesSearchInput && afterSalesSearchInput.value ? afterSalesSearchInput.value : "").trim().toLowerCase();
  const type = String(afterSalesTypeFilter && afterSalesTypeFilter.value ? afterSalesTypeFilter.value : "all").trim().toLowerCase();
  const status = String(afterSalesStatusFilter && afterSalesStatusFilter.value ? afterSalesStatusFilter.value : "all").trim().toLowerCase();
  return allAfterSalesCases.filter((item) => {
    const typeMatch = type === "all" || String(item.type || "") === type;
    const statusMatch = status === "all" || String(item.status || "") === status;
    const haystack = [
      item.id,
      item.orderId,
      item.customerName,
      item.customerEmail,
      item.reason
    ].join(" ").toLowerCase();
    const queryMatch = !query || haystack.includes(query);
    return typeMatch && statusMatch && queryMatch;
  });
}

function getAfterSalesFilterTypeLabel(value) {
  const normalized = String(value || "all").trim().toLowerCase();
  if (normalized === "all") {
    return "Case Type: All";
  }
  const selectedLabel = String(afterSalesTypeFilter?.selectedOptions?.[0]?.textContent || normalized).trim();
  return `Case Type: ${selectedLabel}`;
}

function getAfterSalesFilterStatusLabel(value) {
  const normalized = String(value || "all").trim().toLowerCase();
  if (normalized === "all") {
    return "Status: All";
  }
  const selectedLabel = String(afterSalesStatusFilter?.selectedOptions?.[0]?.textContent || normalized).trim();
  return `Status: ${selectedLabel}`;
}

function getActiveAfterSalesFilters() {
  const filters = [];
  const query = String(afterSalesSearchInput?.value || "").trim();
  const type = String(afterSalesTypeFilter?.value || "all").trim().toLowerCase();
  const status = String(afterSalesStatusFilter?.value || "all").trim().toLowerCase();

  if (query) {
    filters.push({
      id: "query",
      label: `Search: ${query}`,
      clear: () => {
        afterSalesSearchInput.value = "";
      },
      focus: afterSalesSearchInput,
      feedback: "Removed after-sales search filter. Focus moved to the search input."
    });
  }

  if (type !== "all") {
    filters.push({
      id: "type",
      label: getAfterSalesFilterTypeLabel(type),
      clear: () => {
        afterSalesTypeFilter.value = "all";
      },
      focus: afterSalesTypeFilter,
      feedback: "Removed after-sales case type filter. Focus moved to the case type filter."
    });
  }

  if (status !== "all") {
    filters.push({
      id: "status",
      label: getAfterSalesFilterStatusLabel(status),
      clear: () => {
        afterSalesStatusFilter.value = "all";
      },
      focus: afterSalesStatusFilter,
      feedback: "Removed after-sales status filter. Focus moved to the status filter."
    });
  }

  return filters;
}

function renderAfterSales(payload = {}) {
  const cases = Array.isArray(payload.cases) ? payload.cases : [];
  currentAfterSalesSummary = payload.summary && typeof payload.summary === "object" ? payload.summary : {};
  allAfterSalesCases = cases;
  const filtered = getFilteredAfterSalesCases();
  if (afterSalesMeta) {
    afterSalesMeta.textContent = filtered.length === cases.length
      ? `${filtered.length} cases`
      : `Showing ${filtered.length} of ${cases.length} cases`;
  }
  renderAfterSalesSummary(currentAfterSalesSummary);
  if (!afterSalesTableBody) {
    return;
  }
  if (!filtered.length) {
    afterSalesTableBody.innerHTML = "<tr><td colspan='7'>No after-sales cases found.</td></tr>";
    adminAfterSalesFilterChipController?.update();
    return;
  }
  afterSalesTableBody.innerHTML = filtered.map(afterSalesRow).join("");
  adminAfterSalesFilterChipController?.update();
}

async function createAfterSalesCaseFromAdmin() {
  const orderId = String(afterSalesOrderIdInput && afterSalesOrderIdInput.value ? afterSalesOrderIdInput.value : "").trim();
  if (!orderId) {
    setMessage("Enter an order ID before creating an after-sales case.", true);
    return;
  }

  if (createAfterSalesCaseBtn) {
    createAfterSalesCaseBtn.disabled = true;
  }
  try {
    const response = await api("/admin/after-sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        type: afterSalesTypeInput ? afterSalesTypeInput.value : "return",
        reason: afterSalesReasonInput ? afterSalesReasonInput.value : "other",
        requestedBy: afterSalesRequestedByInput ? afterSalesRequestedByInput.value : "admin",
        refundAmount: afterSalesRefundAmountInput && afterSalesRefundAmountInput.value !== "" ? Number(afterSalesRefundAmountInput.value) : undefined,
        note: afterSalesNoteInput ? afterSalesNoteInput.value : ""
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to create after-sales case.");
    }
    setMessage(data.message || "After-sales case created.", false, {
      toast: true,
      title: "After-sales case created",
      tone: "success",
      timeoutMs: 4600
    });
    if (afterSalesOrderIdInput) afterSalesOrderIdInput.value = "";
    if (afterSalesRefundAmountInput) afterSalesRefundAmountInput.value = "";
    if (afterSalesNoteInput) afterSalesNoteInput.value = "";
    await loadDashboard();
  } catch (error) {
    setMessage(error.message || "Failed to create after-sales case.", true);
  } finally {
    if (createAfterSalesCaseBtn) {
      createAfterSalesCaseBtn.disabled = false;
    }
  }
}

async function updateAfterSalesCaseStatus(caseId, nextStatus, button) {
  if (button) {
    button.disabled = true;
  }
  try {
    const response = await api(`/admin/after-sales/${encodeURIComponent(caseId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to update after-sales case.");
    }
    const paymentLine = data && data.paymentUpdate
      ? data.paymentUpdate.message
        ? ` ${data.paymentUpdate.message}`
        : ""
      : "";
    setMessage(`After-sales case ${caseId} updated to ${formatStatus(data.caseItem && data.caseItem.status ? data.caseItem.status : nextStatus)}.${paymentLine}`.trim(), false, {
      toast: true,
      title: "After-sales updated",
      tone: "success",
      timeoutMs: 4600
    });
    await loadDashboard();
  } catch (error) {
    setMessage(error.message || "Failed to update after-sales case.", true);
  } finally {
    if (button) {
      button.disabled = false;
    }
  }
}

function prefillAfterSalesOrder(orderId, suggestedType = "return") {
  if (afterSalesOrderIdInput) {
    afterSalesOrderIdInput.value = String(orderId || "").trim();
  }
  if (afterSalesTypeInput) {
    afterSalesTypeInput.value = suggestedType;
  }
  const section = document.getElementById("afterSales");
  if (section) {
    window.scrollTo({ top: section.offsetTop - 16, behavior: "smooth" });
  }
}

const CATALOG_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23e7ebf0'/%3E%3Cpath d='M20 64l14-17 12 14 8-10 22 23H20z' fill='%2393a1b0'/%3E%3Ccircle cx='33' cy='32' r='6' fill='%2393a1b0'/%3E%3C/svg%3E";

function productDetailUrl(productId) {
  return `product-detail.html?id=${encodeURIComponent(String(productId || "").trim())}`;
}

function getCatalogProductThumbnail(product) {
  const imageUrl = normalizeMediaSet(product).find((item) => inferMediaType(item) === "image") || "";
  return imageUrl || CATALOG_FALLBACK_IMAGE;
}

function getProductLowStockThreshold(product, settings = currentInventorySettings) {
  const normalizedSettings = normalizeInventorySettings(settings);
  const category = normalizeCategoryValue(product && product.category);
  return Math.max(
    0,
    Math.floor(numberOrZero(
      normalizedSettings.categoryThresholds[category] ?? normalizedSettings.defaultLowStockThreshold
    ))
  );
}

function getProductInventoryStatus(product, settings = currentInventorySettings) {
  const stock = Number(product && product.stock ? product.stock : 0);
  const threshold = getProductLowStockThreshold(product, settings);
  if (stock <= 0) {
    return "out";
  }
  if (stock <= threshold) {
    return "low";
  }
  return "healthy";
}

function applyInventorySettingsToProducts(products = [], settings = currentInventorySettings) {
  return (Array.isArray(products) ? products : []).map((product) => ({
    ...product,
    lowStockThreshold: getProductLowStockThreshold(product, settings),
    inventoryStatus: getProductInventoryStatus(product, settings)
  }));
}

function renderInventoryThresholdManager(products = allCatalogProducts) {
  const settings = normalizeInventorySettings(currentInventorySettings, products);
  const categories = getInventoryCategories(products);
  const categoryStats = new Map();

  (Array.isArray(products) ? products : []).forEach((product) => {
    const category = normalizeCategoryValue(product && product.category);
    if (!category) {
      return;
    }
    const current = categoryStats.get(category) || {
      total: 0,
      low: 0,
      out: 0
    };
    const status = getProductInventoryStatus(product, settings);
    current.total += 1;
    if (status === "low") {
      current.low += 1;
    } else if (status === "out") {
      current.out += 1;
    }
    categoryStats.set(category, current);
  });

  if (inventoryThresholdMeta) {
    inventoryThresholdMeta.textContent = `Default threshold ${settings.defaultLowStockThreshold} • Restock to ${settings.restockTarget}`;
  }
  if (inventoryThresholdMessage) {
    inventoryThresholdMessage.textContent = categories.length
      ? `Managing ${categories.length} category threshold override(s). Changes can preview immediately and save to admin settings.`
      : "Thresholds will appear once catalog categories are available.";
  }
  if (!inventoryThresholdList) {
    return;
  }
  if (!categories.length) {
    inventoryThresholdList.innerHTML = "<p class='catalog-health'>No category thresholds available yet.</p>";
    return;
  }

  inventoryThresholdList.innerHTML = categories.map((category) => {
    const threshold = getProductLowStockThreshold({ category }, settings);
    const stats = categoryStats.get(category) || {
      total: 0,
      low: 0,
      out: 0
    };
    return `
      <label class="inventory-threshold-card">
        <strong>${escapeHtml(categoryLabel(category))}</strong>
        <small>${stats.total} SKUs • Low ${stats.low} • Out ${stats.out}</small>
        <input type="number" min="0" step="1" value="${threshold}" data-category-threshold="${escapeHtmlAttr(category)}" />
        <small>Low-stock alert triggers at ${threshold} unit(s) or below.</small>
      </label>
    `;
  }).join("");
}

function buildInventorySettingsDraft() {
  const categories = getInventoryCategories(allCatalogProducts);
  const categoryThresholds = {};
  categories.forEach((category) => {
    const input = inventoryThresholdList
      ? inventoryThresholdList.querySelector(`input[data-category-threshold="${category}"]`)
      : null;
    categoryThresholds[category] = Math.max(
      0,
      Math.floor(numberOrZero(input ? input.value : currentInventorySettings.categoryThresholds[category]))
    );
  });
  return normalizeInventorySettings({
    defaultLowStockThreshold: readInventoryThreshold(),
    restockTarget: readInventoryRestockTarget(),
    categoryThresholds
  }, allCatalogProducts);
}

function catalogRow(product) {
  const stock = Number(product.stock || 0);
  const threshold = getProductLowStockThreshold(product);
  const inventoryClass = getProductInventoryStatus(product);
  const selectedAttr = selectedCatalogProductIds.has(String(product.id)) ? "checked" : "";
  const featuredLabel = product.featured ? "Yes" : "No";
  const featuredBtnLabel = product.featured ? "Unfeature" : "Feature";
  const nextFeaturedAction = product.featured ? "set_featured_false" : "set_featured_true";
  const detailUrl = productDetailUrl(product.id);
  const safeProductName = escapeHtml(product.name || "N/A");
  const safeProductNameAttr = escapeHtmlAttr(product.name || "Product");
  const safeThumbnail = escapeHtmlAttr(getCatalogProductThumbnail(product));
  const safeFallbackThumbnail = escapeHtmlAttr(CATALOG_FALLBACK_IMAGE);
  const safeDefinition = String(product.description || "").trim()
    ? `<span class="catalog-product-definition">${escapeHtml(String(product.description || "").trim())}</span>`
    : "";
  return `
    <tr>
      <td><input type="checkbox" data-action="select-product" data-product-id="${product.id}" ${selectedAttr} /></td>
      <td class="catalog-product-cell">
        <div class="catalog-product-main">
          <img
            class="catalog-product-thumb"
            src="${safeThumbnail}"
            alt="${safeProductNameAttr}"
            data-fallback="${safeFallbackThumbnail}"
            loading="lazy"
            decoding="async"
            onerror="this.onerror=null;this.src=this.dataset.fallback;"
          />
          <div class="catalog-product-text">
            <a class="catalog-product-name" href="${escapeHtmlAttr(detailUrl)}" target="_blank" rel="noopener noreferrer">${safeProductName}</a>
            <span class="catalog-product-id">ID: ${escapeHtml(product.id || "N/A")}</span>
            ${safeDefinition}
          </div>
        </div>
      </td>
      <td>${product.sku || "N/A"}</td>
      <td>${product.brand || "N/A"}</td>
      <td>
        ${formatStatus(product.category || "other")}
        ${collectionBadgesMarkup(product)}
      </td>
      <td>${String(product.segment || "b2c").toUpperCase()}</td>
      <td>${money(product.price || 0)}</td>
      <td>${money(product.listPrice || product.price || 0)}</td>
      <td>${Number(product.discountPercent || 0).toFixed(1)}%</td>
      <td><span class="inventory-badge ${inventoryClass}" title="Low stock threshold: ${threshold}">${stock}</span></td>
      <td><span class="status-tag ${String(product.status || "active").toLowerCase()}">${formatStatus(product.status || "active")}</span></td>
      <td>${String(product.fulfillment || "fbm").toUpperCase()}</td>
      <td>${featuredLabel}</td>
      <td>${Number(product.rating || 0).toFixed(1)}</td>
      <td>${Number(product.moq || 0)}</td>
      <td class="catalog-actions">
        <button class="mini-btn" type="button" data-action="view-product" data-product-id="${product.id}">View</button>
        <button class="mini-btn" type="button" data-action="edit-product" data-product-id="${product.id}">Edit</button>
        <button class="mini-btn" type="button" data-action="duplicate-product" data-product-id="${product.id}">Duplicate</button>
        <button class="mini-btn" type="button" data-action="toggle-featured" data-next-action="${nextFeaturedAction}" data-product-id="${product.id}">${featuredBtnLabel}</button>
        <button class="mini-btn danger" type="button" data-action="delete-product" data-product-id="${product.id}">Delete</button>
      </td>
    </tr>
  `;
}

function getFilteredCatalog() {
  const query = String(catalogSearch && catalogSearch.value ? catalogSearch.value : "").trim().toLowerCase();
  const category = normalizeCategoryValue(catalogCategoryFilter && catalogCategoryFilter.value ? catalogCategoryFilter.value : "all");
  const segment = String(catalogSegmentFilter && catalogSegmentFilter.value ? catalogSegmentFilter.value : "all");
  const threshold = readInventoryThreshold();

  return allCatalogProducts.filter((product) => {
    const name = String(product.name || "").toLowerCase();
    const brand = String(product.brand || "").toLowerCase();
    const collections = productCategoryTokens(product);
    const categoryMatch = category === "all" || collections.includes(category);
    const segmentMatch = segment === "all" || String(product.segment || "b2c") === segment;
    const queryMatch = !query || name.includes(query) || brand.includes(query) || collections.join(" ").includes(query);
    const stockModeMatch = matchesCatalogStockMode(product, threshold);
    return categoryMatch && segmentMatch && queryMatch && stockModeMatch;
  });
}

function renderCatalog(products, inventoryValue) {
  visibleCatalogProducts = applyInventorySettingsToProducts(Array.isArray(products) ? products : []);
  if (catalogMeta) {
    catalogMeta.textContent = `${visibleCatalogProducts.length} products • Inventory ${money(inventoryValue || 0)}`;
  }
  if (catalogHealth) {
    const lowStockCount = visibleCatalogProducts.filter((item) => getProductInventoryStatus(item) === "low").length;
    const outOfStockCount = visibleCatalogProducts.filter((item) => getProductInventoryStatus(item) === "out").length;
    catalogHealth.textContent = `Low stock: ${lowStockCount} • Out of stock: ${outOfStockCount}`;
  }
  renderInventoryPanel(applyInventorySettingsToProducts(allCatalogProducts));
  renderInventoryThresholdManager(allCatalogProducts);

  if (!catalogTableBody) {
    return;
  }

  if (!visibleCatalogProducts.length) {
    catalogRenderToken += 1;
    catalogTableBody.innerHTML = "<tr><td colspan='16'>No products found.</td></tr>";
    if (selectAllCatalogProducts) {
      selectAllCatalogProducts.checked = false;
    }
    return;
  }

  const renderToken = ++catalogRenderToken;
  catalogTableBody.innerHTML = "";
  const batchSize = 60;
  const renderChunk = (startIndex) => {
    if (renderToken !== catalogRenderToken || !catalogTableBody) {
      return;
    }
    const html = visibleCatalogProducts
      .slice(startIndex, startIndex + batchSize)
      .map(catalogRow)
      .join("");
    catalogTableBody.insertAdjacentHTML("beforeend", html);
    if (startIndex + batchSize < visibleCatalogProducts.length) {
      scheduleUiTask(() => renderChunk(startIndex + batchSize));
      return;
    }
    syncCatalogSelectionState();
  };
  renderChunk(0);
}

function applyCatalogFilters() {
  const filtered = getFilteredCatalog();
  const filteredInventoryValue = filtered.reduce((sum, product) => {
    return sum + Number(product.price || 0) * Number(product.stock || 0);
  }, 0);
  renderCatalog(filtered, filteredInventoryValue);
  adminCatalogFilterChipController?.update();
}

function getCatalogInventoryModeLabel(mode) {
  const normalized = String(mode || "all").trim().toLowerCase();
  if (normalized === "low") {
    return "Inventory: Low Stock";
  }
  if (normalized === "out") {
    return "Inventory: Out of Stock";
  }
  return "Inventory: All Stock";
}

function getActiveCatalogFilters() {
  const filters = [];
  const query = String(catalogSearch?.value || "").trim();
  const category = normalizeCategoryValue(catalogCategoryFilter?.value || "all");
  const segment = String(catalogSegmentFilter?.value || "all").trim().toLowerCase();
  const stockMode = String(catalogStockFilterMode || "all").trim().toLowerCase();

  if (query) {
    filters.push({
      id: "query",
      label: `Search: ${query}`,
      clear: () => {
        catalogSearch.value = "";
      },
      focus: catalogSearch,
      feedback: "Removed products search filter. Focus moved to the products search input."
    });
  }

  if (category !== "all") {
    filters.push({
      id: "category",
      label: `Category: ${String(catalogCategoryFilter?.selectedOptions?.[0]?.textContent || category).trim()}`,
      clear: () => {
        catalogCategoryFilter.value = "all";
      },
      focus: catalogCategoryFilter,
      feedback: "Removed product category filter. Focus moved to the category filter."
    });
  }

  if (segment !== "all") {
    filters.push({
      id: "segment",
      label: `Segment: ${String(catalogSegmentFilter?.selectedOptions?.[0]?.textContent || segment).trim()}`,
      clear: () => {
        catalogSegmentFilter.value = "all";
      },
      focus: catalogSegmentFilter,
      feedback: "Removed product segment filter. Focus moved to the segment filter."
    });
  }

  if (stockMode !== "all") {
    filters.push({
      id: "stockMode",
      label: getCatalogInventoryModeLabel(stockMode),
      clear: () => {
        catalogStockFilterMode = "all";
        syncInventoryFilterButtons();
      },
      focus: inventoryShowAllBtn || inventoryShowLowBtn || inventoryShowOutBtn,
      feedback: "Removed inventory mode filter. Focus moved to the inventory filter controls."
    });
  }

  return filters;
}

function syncCatalogSelectionState() {
  if (!selectAllCatalogProducts) {
    return;
  }
  if (!visibleCatalogProducts.length) {
    selectAllCatalogProducts.checked = false;
    return;
  }
  const allSelected = visibleCatalogProducts.every((product) => selectedCatalogProductIds.has(String(product.id)));
  selectAllCatalogProducts.checked = allSelected;
}

function toggleVisibleCatalogSelection(checked) {
  visibleCatalogProducts.forEach((product) => {
    const key = String(product.id);
    if (checked) {
      selectedCatalogProductIds.add(key);
    } else {
      selectedCatalogProductIds.delete(key);
    }
  });
  applyCatalogFilters();
}

function clearCatalogSelection() {
  selectedCatalogProductIds.clear();
  applyCatalogFilters();
}

function readInventoryThreshold() {
  const fallback = Math.max(0, Math.floor(numberOrZero(currentInventorySettings.defaultLowStockThreshold || 5)));
  if (!inventoryThresholdInput) {
    return fallback;
  }
  const raw = String(inventoryThresholdInput.value || "").trim();
  if (!raw) {
    inventoryThresholdInput.value = String(fallback);
    return fallback;
  }
  const parsed = Math.max(0, Math.floor(numberOrZero(raw)));
  inventoryThresholdInput.value = String(parsed);
  return parsed;
}

function readInventoryRestockTarget() {
  const fallback = Math.max(0, Math.floor(numberOrZero(currentInventorySettings.restockTarget || 10)));
  if (!inventoryRestockInput) {
    return fallback;
  }
  const raw = String(inventoryRestockInput.value || "").trim();
  if (!raw) {
    inventoryRestockInput.value = String(fallback);
    return fallback;
  }
  const parsed = Math.max(0, Math.floor(numberOrZero(raw)));
  inventoryRestockInput.value = String(parsed);
  return parsed;
}

function matchesCatalogStockMode(product, threshold = readInventoryThreshold()) {
  const stock = Number(product && product.stock ? product.stock : 0);
  const effectiveThreshold = Math.max(0, Math.floor(numberOrZero(
    product && product.lowStockThreshold != null ? product.lowStockThreshold : threshold
  )));
  if (catalogStockFilterMode === "out") {
    return stock <= 0;
  }
  if (catalogStockFilterMode === "low") {
    return stock <= effectiveThreshold;
  }
  return true;
}

function syncInventoryFilterButtons() {
  const mode = String(catalogStockFilterMode || "all");
  const map = [
    [inventoryShowAllBtn, "all"],
    [inventoryShowLowBtn, "low"],
    [inventoryShowOutBtn, "out"]
  ];
  map.forEach(([button, key]) => {
    if (!button) {
      return;
    }
    const active = mode === key;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function renderInventoryPanel(products = []) {
  const list = applyInventorySettingsToProducts(Array.isArray(products) ? products : []);
  const threshold = readInventoryThreshold();
  const lowCount = list.filter((item) => getProductInventoryStatus(item) === "low").length;
  const outCount = list.filter((item) => getProductInventoryStatus(item) === "out").length;
  const healthyCount = list.filter((item) => getProductInventoryStatus(item) === "healthy").length;
  const totalUnits = list.reduce((sum, item) => sum + Math.max(0, Number(item.stock || 0)), 0);

  if (inventorySummary) {
    inventorySummary.textContent = `Inventory mode: ${formatStatus(catalogStockFilterMode)} • Threshold: ${threshold} • Healthy: ${healthyCount} • Low: ${lowCount} • Out: ${outCount} • Units: ${totalUnits}`;
  }

  if (!inventoryAlertList) {
    return;
  }

  const alerts = list
    .filter((item) => getProductInventoryStatus(item) !== "healthy")
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
    .slice(0, 10);

  if (!alerts.length) {
    inventoryAlertList.innerHTML = "<p class='catalog-health'>No low or out-of-stock alerts.</p>";
    return;
  }

  inventoryAlertList.innerHTML = alerts.map((product) => {
    const stock = Number(product.stock || 0);
    const thresholdValue = getProductLowStockThreshold(product);
    const statusClass = getProductInventoryStatus(product);
    const statusText = stock <= 0 ? "Out of stock" : `Low stock (${stock}/${thresholdValue})`;
    return `
      <article class="inventory-alert-item ${statusClass}">
        <div class="inventory-alert-meta">
          <p class="inventory-alert-name">${escapeHtml(product.name || "Unnamed Product")}</p>
          <p class="inventory-alert-note">${statusText} • SKU: ${escapeHtml(product.sku || "N/A")} • Category threshold: ${thresholdValue}</p>
        </div>
        <button class="mini-btn" type="button" data-action="inventory-restock-one" data-product-id="${escapeHtmlAttr(product.id || "")}">Restock</button>
      </article>
    `;
  }).join("");
}

function setCatalogStockMode(mode) {
  const normalized = String(mode || "all");
  if (!["all", "low", "out"].includes(normalized)) {
    return;
  }
  catalogStockFilterMode = normalized;
  syncInventoryFilterButtons();
  applyCatalogFilters();
}

function handleInventoryToolbarAction(action, productId = "") {
  const normalizedAction = String(action || "").trim().toLowerCase();
  if (!normalizedAction) {
    return false;
  }

  if (normalizedAction === "refresh") {
    applyCatalogFilters();
    setMessage("Inventory panel refreshed.", false, {
      toast: true,
      title: "Inventory refreshed",
      tone: "info",
      timeoutMs: 3600
    });
    return false;
  }
  if (normalizedAction === "show-all") {
    setCatalogStockMode("all");
    return false;
  }
  if (normalizedAction === "show-low") {
    setCatalogStockMode("low");
    return false;
  }
  if (normalizedAction === "show-out") {
    setCatalogStockMode("out");
    return false;
  }
  if (normalizedAction === "restock-selected") {
    const ids = Array.from(selectedCatalogProductIds.values());
    restockCatalogProducts(ids, "selected products");
    return false;
  }
  if (normalizedAction === "restock-visible") {
    const ids = visibleCatalogProducts.map((product) => String(product.id || "").trim()).filter(Boolean);
    restockCatalogProducts(ids, "visible products");
    return false;
  }
  if (normalizedAction === "restock-one") {
    const id = String(productId || "").trim();
    if (id) {
      restockCatalogProducts([id], "product");
    }
    return false;
  }
  return false;
}

function bindInventoryToolbarButton(button, action) {
  if (!button) {
    return;
  }
  button.removeAttribute("onclick");
  button.onclick = null;
  button.addEventListener("click", (event) => {
    event.preventDefault();
    handleInventoryToolbarAction(action);
  });
}

if (typeof window !== "undefined") {
  window.handleInventoryToolbarAction = handleInventoryToolbarAction;
}

function setInventoryActionButtonsBusy(isBusy) {
  const busy = Boolean(isBusy);
  [inventoryRefreshBtn, inventoryShowAllBtn, inventoryShowLowBtn, inventoryShowOutBtn, inventoryRestockSelectedBtn, inventoryRestockVisibleBtn]
    .forEach((button) => {
      if (!button) {
        return;
      }
      button.disabled = busy;
    });
}

async function updateCatalogProductStock(productId, targetStock) {
  const key = String(productId || "").trim();
  if (!key) {
    return { updated: false, offline: false, error: "Missing product id.", backInStock: null };
  }
  const source = allCatalogProducts.find((item) => String(item.id) === key)
    || visibleCatalogProducts.find((item) => String(item.id) === key)
    || loadJsonStorage(CATALOG_STORAGE_KEY, {})[key];
  if (!source) {
    return { updated: false, offline: false, error: "Product not found.", backInStock: null };
  }
  const payload = buildUpsertPayloadFromProduct({ ...source, stock: targetStock });
  try {
    const response = await api(`/products/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to update stock");
    }
    try {
      upsertCatalogProductOffline(key, { ...source, ...payload, ...data, stock: targetStock });
    } catch (cacheError) {
      // Keep server response as source of truth even if cache update fails.
    }
    return { updated: true, offline: false, error: "", backInStock: data && data.backInStock ? data.backInStock : null };
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    const isOffline = /failed to fetch|network|backend/i.test(message);
    if (isOffline) {
      try {
        upsertCatalogProductOffline(key, payload);
        return { updated: true, offline: true, error: "", backInStock: null };
      } catch (offlineError) {
        return { updated: false, offline: true, error: offlineError.message || "Offline stock update failed.", backInStock: null };
      }
    }
    return { updated: false, offline: false, error: message || "Stock update failed.", backInStock: null };
  }
}

async function restockCatalogProducts(ids, scopeLabel = "products") {
  const targetStock = readInventoryRestockTarget();
  const uniqueIds = [...new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || "").trim()).filter(Boolean))];
  if (!uniqueIds.length) {
    setMessage(`No ${scopeLabel} selected for restock.`, true);
    return;
  }

  setInventoryActionButtonsBusy(true);
  let updated = 0;
  let offlineUpdated = 0;
  let failed = 0;
  let firstError = "";
  let notifiedSent = 0;
  let notifiedQueued = 0;

  try {
    for (let index = 0; index < uniqueIds.length; index += 1) {
      const id = uniqueIds[index];
      setMessage(`Restocking inventory... ${index + 1}/${uniqueIds.length}`);
      const result = await updateCatalogProductStock(id, targetStock);
      if (result.updated) {
        updated += 1;
        if (result.offline) {
          offlineUpdated += 1;
        }
        if (result.backInStock) {
          notifiedSent += numberOrZero(result.backInStock.sent);
          notifiedQueued += numberOrZero(result.backInStock.queued);
        }
      } else {
        failed += 1;
        if (!firstError) {
          firstError = result.error || "Unknown stock update error.";
        }
      }
    }
    await loadDashboard();
    if (failed > 0) {
      const extra = firstError ? ` First error: ${firstError}` : "";
      setMessage(`Inventory restock completed with issues. Updated: ${updated}, Failed: ${failed}.${extra}`, true);
      return;
    }
    if (offlineUpdated > 0) {
      setMessage(`Inventory restock applied in offline mode for ${offlineUpdated} product(s). Target stock: ${targetStock}.`, false, {
        toast: true,
        title: "Inventory restock (offline)",
        tone: "warning",
        timeoutMs: 6200
      });
      return;
    }
    const notifyMeta = (notifiedSent || notifiedQueued)
      ? ` Notifications: sent ${notifiedSent}, queued ${notifiedQueued}.`
      : "";
    setMessage(`Inventory restock completed for ${updated} product(s). Target stock: ${targetStock}.${notifyMeta}`, false, {
      toast: true,
      title: "Inventory restock completed",
      tone: "success",
      timeoutMs: 5200
    });
  } finally {
    setInventoryActionButtonsBusy(false);
  }
}
function setProductFormMessage(text, isError = false) {
  if (!productFormMessage) {
    return;
  }
  productFormMessage.textContent = text;
  productFormMessage.classList.toggle("error", isError);
}

function updateMediaUploadProgress(current, total, label = "") {
  if (!productMediaUploadProgressWrap || !productMediaUploadProgress || !productMediaUploadProgressText) {
    return;
  }
  const safeTotal = Math.max(1, Number(total || 1));
  const safeCurrent = Math.max(0, Math.min(safeTotal, Number(current || 0)));
  const percentage = Math.round((safeCurrent / safeTotal) * 100);
  productMediaUploadProgressWrap.hidden = false;
  productMediaUploadProgress.max = safeTotal;
  productMediaUploadProgress.value = safeCurrent;
  productMediaUploadProgressText.textContent = label
    ? `${percentage}% (${safeCurrent}/${safeTotal}) ${label}`
    : `${percentage}% (${safeCurrent}/${safeTotal})`;
}

function resetMediaUploadProgress() {
  if (!productMediaUploadProgressWrap || !productMediaUploadProgress || !productMediaUploadProgressText) {
    return;
  }
  productMediaUploadProgress.value = 0;
  productMediaUploadProgress.max = 100;
  productMediaUploadProgressText.textContent = "0%";
  productMediaUploadProgressWrap.hidden = true;
}

function setPendingDriveRetryUploads(files = [], category = "") {
  pendingDriveRetryUploads = Array.isArray(files) ? files.slice() : [];
  pendingDriveRetryCategory = normalizeCategoryValue(category || "");
  if (!retryDriveUploadBtn) {
    return;
  }
  retryDriveUploadBtn.hidden = pendingDriveRetryUploads.length === 0;
}

function readBulkCollectionsInput() {
  const raw = catalogBulkCollectionsInput ? catalogBulkCollectionsInput.value : "";
  return normalizeCollectionValues(raw, "");
}

function syncBulkCollectionsInputState() {
  if (!catalogBulkCollectionsInput || !catalogBulkAction) {
    return;
  }
  const action = String(catalogBulkAction.value || "");
  const needsCollections = action === "set_collections" || action === "add_collections";
  catalogBulkCollectionsInput.disabled = !needsCollections;
  catalogBulkCollectionsInput.placeholder = needsCollections
    ? "Collections for bulk action (comma separated)"
    : "Collections input enabled for set/add actions";
}

function getCollectionOptionPool() {
  const categoryOptions = getAllCategories();
  const catalogOptions = allCatalogProducts.flatMap((product) => productCategoryTokens(product));
  const typedOptions = normalizeCollectionValues(productCollectionsInput ? productCollectionsInput.value : "", productCategoryInput ? productCategoryInput.value : "");
  return [...new Set([...DEFAULT_COLLECTION_OPTIONS, ...categoryOptions, ...catalogOptions, ...typedOptions])]
    .map((item) => normalizeCategoryValue(item))
    .filter(Boolean)
    .slice(0, 60);
}

function syncCollectionsInputFromSelection() {
  if (!productCollectionsInput) {
    return;
  }
  const optionPool = getCollectionOptionPool();
  const selectedOrdered = optionPool.filter((item) => selectedProductCollections.has(item));
  const selectedExtras = Array.from(selectedProductCollections).filter((item) => !selectedOrdered.includes(item));
  const finalSelections = [...selectedOrdered, ...selectedExtras]
    .map((item) => normalizeCategoryValue(item))
    .filter(Boolean)
    .slice(0, 8);
  selectedProductCollections = new Set(finalSelections);
  productCollectionsInput.value = finalSelections.join(", ");

  if (productCollectionsSelectionMeta) {
    if (!finalSelections.length) {
      productCollectionsSelectionMeta.textContent = "No collections selected. Choose one or more catalogues/pages.";
    } else {
      const labels = finalSelections.map((item) => categoryLabel(item)).join(", ");
      productCollectionsSelectionMeta.textContent = `Selected (${finalSelections.length}): ${labels}`;
    }
  }
}

function syncProductCollectionSelectionFromInput() {
  const fallbackCategory = normalizeCategoryValue(productCategoryInput ? productCategoryInput.value : "");
  selectedProductCollections = new Set(
    normalizeCollectionValues(productCollectionsInput ? productCollectionsInput.value : "", fallbackCategory)
  );
  syncCollectionsInputFromSelection();
}

function renderProductCollectionPicker() {
  if (!productCollectionOptionList) {
    return;
  }
  const options = getCollectionOptionPool();
  if (!options.length) {
    productCollectionOptionList.innerHTML = "<span class='subtle'>No collection options available.</span>";
    return;
  }
  productCollectionOptionList.innerHTML = options.map((item) => {
    const checked = selectedProductCollections.has(item);
    return `
      <label class="collection-option-chip${checked ? " is-selected" : ""}">
        <input type="checkbox" value="${escapeHtmlAttr(item)}" ${checked ? "checked" : ""} />
        <span>${escapeHtml(categoryLabel(item))}</span>
      </label>
    `;
  }).join("");
}

function addCustomCollectionFromInput() {
  if (!productCollectionCustomInput) {
    return;
  }
  const customValue = normalizeCategoryValue(productCollectionCustomInput.value || "");
  if (!customValue) {
    setProductFormMessage("Type a custom collection name first.", true);
    return;
  }
  selectedProductCollections.add(customValue);
  productCollectionCustomInput.value = "";
  syncCollectionsInputFromSelection();
  renderProductCollectionPicker();
  setProductFormMessage(`Collection ${categoryLabel(customValue)} added.`);
}

function appendCustomDefinitionToDescription() {
  if (!productDefinitionInput || !productDescriptionInput) {
    return;
  }
  const definitionLine = String(productDefinitionInput.value || "").trim();
  if (!definitionLine) {
    setProductFormMessage("Type a short definition first.", true);
    return;
  }
  const existing = String(productDescriptionInput.value || "").trim();
  productDescriptionInput.value = existing ? `${existing}\n${definitionLine}` : definitionLine;
  productDefinitionInput.value = "";
  productDescriptionInput.focus();
  setProductFormMessage("Custom definition added to description.");
}

function productCategoryTokens(product) {
  return normalizeCollectionValues(product && product.collections, product && product.category);
}

function collectionBadgesMarkup(product) {
  const collections = productCategoryTokens(product).slice(0, 6);
  if (!collections.length) {
    return "";
  }
  const chips = collections
    .map((item) => `<span class="collection-badge">${formatStatus(item)}</span>`)
    .join("");
  return `<div class="collection-badges">${chips}</div>`;
}

function normalizeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.startsWith("data:image/") || raw.startsWith("data:video/")) {
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

function escapeHtmlAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isImageMedia(src) {
  return inferMediaType(src) === "image";
}

function isVideoMedia(src) {
  return inferMediaType(src) === "video";
}

function getFileExtension(fileName) {
  const name = String(fileName || "").trim().toLowerCase();
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === name.length - 1) {
    return "";
  }
  return name.slice(dotIndex + 1);
}

function inferUploadFileType(file) {
  const mime = String(file?.type || "").toLowerCase();
  if (mime.startsWith("image/")) {
    return "image";
  }
  if (mime.startsWith("video/")) {
    return "video";
  }
  const ext = getFileExtension(file?.name);
  if (VIDEO_FILE_EXTENSIONS.has(ext)) {
    return "video";
  }
  if (IMAGE_FILE_EXTENSIONS.has(ext)) {
    return "image";
  }
  return "";
}

function setProductImagePreview(src, helpText = "") {
  if (!productImagePreview || !productImageHelp || !productVideoPreview) {
    return;
  }
  const safeSrc = String(src || "").trim();
  if (!safeSrc) {
    productImagePreview.hidden = true;
    productImagePreview.removeAttribute("src");
    productVideoPreview.hidden = true;
    productVideoPreview.removeAttribute("src");
    productImageHelp.textContent = helpText || "Upload image/video file or paste media URL.";
    return;
  }
  if (isVideoMedia(safeSrc)) {
    productImagePreview.hidden = true;
    productImagePreview.removeAttribute("src");
    productVideoPreview.src = safeSrc;
    productVideoPreview.muted = true;
    productVideoPreview.preload = "metadata";
    productVideoPreview.hidden = false;
    productImageHelp.textContent = helpText || "Video ready.";
    productVideoPreview.onloadeddata = () => {
      productVideoPreview.play().catch(() => {});
    };
    productVideoPreview.onerror = () => {
      productVideoPreview.hidden = true;
      productImageHelp.textContent = "Video preview failed. Check URL or use direct media link.";
    };
    return;
  }
  productVideoPreview.hidden = true;
  productVideoPreview.removeAttribute("src");
  productImagePreview.src = safeSrc;
  productImagePreview.hidden = false;
  productImageHelp.textContent = helpText || "Image ready.";
  productImagePreview.onerror = () => {
    productImagePreview.hidden = true;
    productImageHelp.textContent = "Image preview failed. Check URL or use direct media link.";
  };
}

function getGalleryInputs() {
  if (!productGalleryFields) {
    return [];
  }
  return Array.from(productGalleryFields.querySelectorAll("input[data-gallery-index]"));
}

function ensureGalleryInputs() {
  if (!productGalleryFields) {
    return;
  }
  if (productGalleryFields.children.length) {
    return;
  }
  const nodes = [];
  for (let i = 0; i < MAX_PRODUCT_IMAGES; i += 1) {
    const input = document.createElement("input");
    input.type = "url";
    input.setAttribute("data-gallery-index", String(i));
    input.placeholder = `Media URL ${i + 1} (image/video)`;
    nodes.push(input);
  }
  productGalleryFields.append(...nodes);
}

function readGalleryImagesFromForm() {
  const media = getGalleryInputs()
    .map((input) => normalizeImageUrl(input.value))
    .filter(Boolean);
  return media.slice(0, MAX_PRODUCT_IMAGES);
}

function setGalleryImagesOnForm(images) {
  const list = Array.isArray(images) ? images.slice(0, MAX_PRODUCT_IMAGES) : [];
  const inputs = getGalleryInputs();
  inputs.forEach((input, index) => {
    input.value = normalizeImageUrl(list[index]) || "";
  });
}

function getCoverMediaCandidate() {
  const cover = normalizeImageUrl(productImageInput.value || "");
  if (cover) {
    return cover;
  }
  const mediaItems = readGalleryImagesFromForm();
  return mediaItems[0] || "";
}

function renderMediaStudio() {
  if (!mediaStudioGrid) {
    return;
  }
  const mediaItems = readGalleryImagesFromForm();
  const coverCandidate = getCoverMediaCandidate();

  if (!mediaItems.length) {
    mediaStudioGrid.innerHTML = "<p class='field-help'>No media added yet. Use file upload or media URLs above.</p>";
    if (photoStudioEditor) {
      photoStudioEditor.hidden = true;
    }
    activeStudioIndex = -1;
    studioHistory = [];
    studioHistoryIndex = -1;
    return;
  }

  mediaStudioGrid.innerHTML = mediaItems.map((src, index) => {
    const type = inferMediaType(src);
    const isCover = src === coverCandidate;
    const safeSrc = escapeHtmlAttr(src);
    const preview = type === "video"
      ? `<video src="${safeSrc}" muted playsinline preload="metadata"></video>`
      : `<img src="${safeSrc}" alt="Media ${index + 1}" loading="lazy" />`;
    const coverLabel = isCover ? "Cover" : "Set Cover";
    return `
      <article class="studio-card${isCover ? " cover" : ""}">
        ${preview}
        <span class="studio-tag">${type}</span>
        <div class="studio-actions">
          <button type="button" data-action="set-cover" data-index="${index}">${coverLabel}</button>
          <button type="button" data-action="edit-media" data-index="${index}">Edit</button>
          <button type="button" data-action="remove-media" data-index="${index}">Remove</button>
        </div>
      </article>
    `;
  }).join("");
}

function syncPrimaryImageFromGallery() {
  const mediaItems = readGalleryImagesFromForm();
  if (!mediaItems.length) {
    renderMediaStudio();
    return;
  }
  if (!String(productImageInput.value || "").trim()) {
    productImageInput.value = mediaItems[0];
    setProductImagePreview(mediaItems[0]);
  }
  renderMediaStudio();
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read selected media file."));
    reader.readAsDataURL(file);
  });
}

function inferFallbackMimeType(file) {
  const uploadType = inferUploadFileType(file);
  if (uploadType === "video") {
    return "video/mp4";
  }
  if (uploadType === "image") {
    return "image/jpeg";
  }
  return "application/octet-stream";
}

async function buildDriveUploadPayload(files) {
  return Promise.all(files.map(async (file) => ({
    name: String(file?.name || `upload-${Date.now()}`).trim(),
    mimeType: String(file?.type || inferFallbackMimeType(file)).toLowerCase(),
    dataUrl: await readImageFileAsDataUrl(file)
  })));
}

async function uploadPayloadToGoogleDrive(filePayload, options = {}) {
  const onProgress = typeof options.onProgress === "function" ? options.onProgress : null;
  const category = normalizeCategoryValue(options.category || "");
  const files = Array.isArray(filePayload) ? filePayload : [];
  const uploadedUrls = [];

  for (let index = 0; index < files.length; index += 1) {
    const item = files[index];
    const current = index + 1;
    if (onProgress) {
      onProgress({ current, total: files.length, stage: "uploading", fileName: item?.name || "" });
    }

    try {
      const response = await api("/admin/media/upload-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: [item], category })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Google Drive upload failed.");
      }

      const uploaded = Array.isArray(data.uploaded) ? data.uploaded : [];
      const nextUrl = normalizeImageUrl(uploaded[0] && uploaded[0].url ? uploaded[0].url : "");
      if (!nextUrl) {
        throw new Error("Google Drive upload returned no media URLs.");
      }
      uploadedUrls.push(nextUrl);

      if (onProgress) {
        onProgress({ current, total: files.length, stage: "uploaded", fileName: item?.name || "" });
      }
    } catch (error) {
      error.uploadedUrls = uploadedUrls.slice();
      error.failedIndex = index;
      throw error;
    }
  }

  return uploadedUrls;
}

function replaceFormMediaWithDriveUrls(replacementMap) {
  if (!(replacementMap instanceof Map) || !replacementMap.size) {
    return;
  }
  const galleryInputs = getGalleryInputs();
  const nextGallery = galleryInputs.map((input) => {
    const current = normalizeImageUrl(input.value || "");
    return replacementMap.get(current) || current;
  });
  setGalleryImagesOnForm(nextGallery);

  const currentCover = normalizeImageUrl(productImageInput ? productImageInput.value : "");
  if (productImageInput && currentCover && replacementMap.has(currentCover)) {
    productImageInput.value = replacementMap.get(currentCover) || currentCover;
  }

  uploadedProductMediaDataUrls = nextGallery.slice();
  const previewSrc = normalizeImageUrl(productImageInput ? productImageInput.value : "") || nextGallery[0] || "";
  setProductImagePreview(previewSrc, "Failed uploads retried on Google Drive.");
  renderMediaStudio();
}

async function retryPendingDriveUploads() {
  const pendingFiles = Array.isArray(pendingDriveRetryUploads) ? pendingDriveRetryUploads.slice() : [];
  if (!pendingFiles.length) {
    setProductFormMessage("No pending Google Drive uploads to retry.");
    return;
  }

  if (retryDriveUploadBtn) {
    retryDriveUploadBtn.disabled = true;
  }
  resetMediaUploadProgress();

  try {
    const driveUrls = await uploadPayloadToGoogleDrive(pendingFiles, {
      category: pendingDriveRetryCategory,
      onProgress: ({ current, total, stage }) => {
        if (stage === "uploading") {
          updateMediaUploadProgress(current - 1, total, "Retrying Drive upload");
          setProductFormMessage(`Retrying upload... ${Math.max(0, current - 1)}/${total}`);
          return;
        }
        updateMediaUploadProgress(current, total, "Uploaded");
        setProductFormMessage(`Retry uploaded... ${current}/${total}`);
      }
    });

    const replacementMap = new Map();
    pendingFiles.forEach((item, index) => {
      const localUrl = normalizeImageUrl(item && item.dataUrl ? item.dataUrl : "");
      const driveUrl = normalizeImageUrl(driveUrls[index] || "");
      if (localUrl && driveUrl) {
        replacementMap.set(localUrl, driveUrl);
      }
    });
    replaceFormMediaWithDriveUrls(replacementMap);
    setPendingDriveRetryUploads([], "");
    setProductFormMessage("All failed media uploads retried successfully.");
  } catch (error) {
    setProductFormMessage(error.message || "Retry upload failed.", true);
  } finally {
    if (retryDriveUploadBtn) {
      retryDriveUploadBtn.disabled = false;
    }
    resetMediaUploadProgress();
  }
}

function getPhotoStudioContext() {
  if (!photoStudioCanvas) {
    return null;
  }
  return photoStudioCanvas.getContext("2d");
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to load image in Photo Studio."));
    img.src = src;
  });
}

function snapshotStudioCanvas(format = "image/png", quality = 0.92) {
  if (!photoStudioCanvas) {
    return "";
  }
  try {
    return photoStudioCanvas.toDataURL(format, quality);
  } catch (error) {
    studioSetHint("Crop/edit blocked for this URL image. Upload file or use CORS-enabled image URL.");
    return "";
  }
}

function canvasRelativePoint(event) {
  if (!photoStudioCanvas) {
    return { x: 0, y: 0 };
  }
  const rect = photoStudioCanvas.getBoundingClientRect();
  const scaleX = photoStudioCanvas.width / Math.max(1, rect.width);
  const scaleY = photoStudioCanvas.height / Math.max(1, rect.height);
  const x = Math.max(0, Math.min(photoStudioCanvas.width, (event.clientX - rect.left) * scaleX));
  const y = Math.max(0, Math.min(photoStudioCanvas.height, (event.clientY - rect.top) * scaleY));
  return { x, y };
}

function clearStudioCustomCropState() {
  studioCustomCropMode = false;
  studioCropSelection = null;
  studioCropPointerStart = null;
  studioPointerDown = false;
  if (studioCustomCropToggleBtn) {
    studioCustomCropToggleBtn.textContent = "Custom Crop";
  }
}

async function redrawStudioCanvasBase() {
  if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
    return;
  }
  const context = getPhotoStudioContext();
  if (!context) {
    return;
  }
  const image = await loadImageElement(studioCurrentImageDataUrl);
  photoStudioCanvas.width = image.width;
  photoStudioCanvas.height = image.height;
  context.clearRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
  context.drawImage(image, 0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
}

async function drawStudioCropOverlay() {
  if (!studioCropSelection || !photoStudioCanvas) {
    return;
  }
  await redrawStudioCanvasBase();
  const context = getPhotoStudioContext();
  if (!context) {
    return;
  }
  const { x, y, width, height } = studioCropSelection;
  const left = Math.max(0, Math.min(photoStudioCanvas.width, x));
  const top = Math.max(0, Math.min(photoStudioCanvas.height, y));
  const w = Math.max(1, Math.min(photoStudioCanvas.width - left, width));
  const h = Math.max(1, Math.min(photoStudioCanvas.height - top, height));

  context.save();
  context.fillStyle = "rgba(0,0,0,0.22)";
  context.fillRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
  context.clearRect(left, top, w, h);
  context.setLineDash([8, 6]);
  context.strokeStyle = "#0ea5e9";
  context.lineWidth = 2;
  context.strokeRect(left, top, w, h);
  context.restore();
}

async function applyCustomStudioCrop() {
  if (!studioCurrentImageDataUrl || !photoStudioCanvas || !studioCropSelection) {
    return;
  }
  const source = await loadImageElement(studioCurrentImageDataUrl);
  const left = Math.max(0, Math.floor(studioCropSelection.x));
  const top = Math.max(0, Math.floor(studioCropSelection.y));
  const width = Math.max(1, Math.floor(studioCropSelection.width));
  const height = Math.max(1, Math.floor(studioCropSelection.height));
  if (width < 8 || height < 8) {
    studioSetHint("Select a larger crop area.");
    return;
  }

  const context = getPhotoStudioContext();
  if (!context) {
    return;
  }
  photoStudioCanvas.width = width;
  photoStudioCanvas.height = height;
  context.clearRect(0, 0, width, height);
  context.drawImage(source, left, top, width, height, 0, 0, width, height);
  const snapshot = snapshotStudioCanvas("image/jpeg", 0.9);
  if (!snapshot) {
    return;
  }
  studioCurrentImageDataUrl = snapshot;
  pushStudioHistory(studioCurrentImageDataUrl);
  studioCropSelection = null;
  clearStudioCustomCropState();
  studioSetHint("Custom crop applied.");
}

async function drawImageOnStudioCanvas(src, options = {}) {
  const context = getPhotoStudioContext();
  if (!context || !photoStudioCanvas) {
    return;
  }
  const image = await loadImageElement(src);
  const canvasWidth = Number(options.width || photoStudioCanvas.width || 720);
  const canvasHeight = Number(options.height || photoStudioCanvas.height || 480);
  photoStudioCanvas.width = canvasWidth;
  photoStudioCanvas.height = canvasHeight;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = String(options.background || "#ffffff");
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  const ratio = Math.min(canvasWidth / image.width, canvasHeight / image.height);
  const drawWidth = Math.max(1, Math.round(image.width * ratio));
  const drawHeight = Math.max(1, Math.round(image.height * ratio));
  const drawX = Math.floor((canvasWidth - drawWidth) / 2);
  const drawY = Math.floor((canvasHeight - drawHeight) / 2);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

async function renderStudioImage(src) {
  if (!photoStudioEditor || !photoStudioHint) {
    return;
  }
  const safeSrc = String(src || "").trim();
  if (!safeSrc || !isImageMedia(safeSrc)) {
    photoStudioEditor.hidden = true;
    activeStudioIndex = -1;
    studioOriginalImageDataUrl = "";
    studioCurrentImageDataUrl = "";
    clearStudioCustomCropState();
    return;
  }

  try {
    await drawImageOnStudioCanvas(safeSrc);
    studioOriginalImageDataUrl = safeSrc;
    studioCurrentImageDataUrl = snapshotStudioCanvas("image/jpeg", 0.9) || safeSrc;
    studioHistory = [studioCurrentImageDataUrl];
    studioHistoryIndex = 0;
    clearStudioCustomCropState();
    photoStudioHint.textContent = "Photo Studio ready.";
    photoStudioEditor.hidden = false;
  } catch (error) {
    photoStudioHint.textContent = error.message || "Unable to load image.";
  }
}

function getStudioAdjustFilter() {
  const brightness = Number(studioBrightnessInput?.value || 100);
  const contrast = Number(studioContrastInput?.value || 100);
  const saturation = Number(studioSaturationInput?.value || 100);
  const preset = String(studioFilterPreset?.value || "none");
  const filters = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`
  ];
  if (preset === "grayscale") {
    filters.push("grayscale(100%)");
  } else if (preset === "sepia") {
    filters.push("sepia(90%)");
  } else if (preset === "warm") {
    filters.push("sepia(25%)", "hue-rotate(-12deg)");
  } else if (preset === "cool") {
    filters.push("hue-rotate(10deg)");
  }
  return filters.join(" ");
}

async function applyStudioFilterAdjustments() {
  if (!studioCurrentImageDataUrl) {
    return;
  }
  const context = getPhotoStudioContext();
  if (!context || !photoStudioCanvas) {
    return;
  }
  const baseImage = await loadImageElement(studioCurrentImageDataUrl);
  context.save();
  context.clearRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
  context.filter = getStudioAdjustFilter();
  context.drawImage(baseImage, 0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
  context.restore();
  const snapshot = snapshotStudioCanvas("image/jpeg", 0.9);
  if (snapshot) {
    studioCurrentImageDataUrl = snapshot;
    pushStudioHistory(studioCurrentImageDataUrl);
  }
}

function studioSetHint(text) {
  if (photoStudioHint) {
    photoStudioHint.textContent = text;
  }
}

function pushStudioHistory(snapshot) {
  const value = String(snapshot || "").trim();
  if (!value) {
    return;
  }
  if (studioHistoryIndex >= 0 && studioHistory[studioHistoryIndex] === value) {
    return;
  }
  if (studioHistoryIndex < studioHistory.length - 1) {
    studioHistory = studioHistory.slice(0, studioHistoryIndex + 1);
  }
  studioHistory.push(value);
  if (studioHistory.length > 24) {
    studioHistory.shift();
  }
  studioHistoryIndex = studioHistory.length - 1;
}

async function restoreStudioSnapshot(index) {
  const historySnapshot = studioHistory[index];
  if (!historySnapshot || !photoStudioCanvas) {
    return;
  }
  const context = getPhotoStudioContext();
  if (!context) {
    return;
  }
  const image = await loadImageElement(historySnapshot);
  photoStudioCanvas.width = image.width;
  photoStudioCanvas.height = image.height;
  context.clearRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
  context.drawImage(image, 0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
  const restoredSnapshot = snapshotStudioCanvas("image/png");
  if (restoredSnapshot) {
    studioCurrentImageDataUrl = restoredSnapshot;
  }
}

async function applyConvolutionKernel(kernel, factor = 1, bias = 0) {
  if (!photoStudioCanvas) {
    return;
  }
  const context = getPhotoStudioContext();
  if (!context) {
    return;
  }
  const width = photoStudioCanvas.width;
  const height = photoStudioCanvas.height;
  const src = context.getImageData(0, 0, width, height);
  const out = context.createImageData(width, height);
  const srcData = src.data;
  const outData = out.data;
  const size = Math.sqrt(kernel.length);
  const half = Math.floor(size / 2);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let ky = 0; ky < size; ky += 1) {
        for (let kx = 0; kx < size; kx += 1) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const srcOffset = (py * width + px) * 4;
          const weight = kernel[ky * size + kx];
          r += srcData[srcOffset] * weight;
          g += srcData[srcOffset + 1] * weight;
          b += srcData[srcOffset + 2] * weight;
          a += srcData[srcOffset + 3] * weight;
        }
      }
      const offset = (y * width + x) * 4;
      outData[offset] = Math.min(255, Math.max(0, factor * r + bias));
      outData[offset + 1] = Math.min(255, Math.max(0, factor * g + bias));
      outData[offset + 2] = Math.min(255, Math.max(0, factor * b + bias));
      outData[offset + 3] = Math.min(255, Math.max(0, a));
    }
  }
  context.putImageData(out, 0, 0);
  const snapshot = snapshotStudioCanvas("image/png");
  if (snapshot) {
    studioCurrentImageDataUrl = snapshot;
    pushStudioHistory(studioCurrentImageDataUrl);
  }
}

async function applyStudioCrop(targetRatio) {
  if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
    return;
  }
  const source = await loadImageElement(studioCurrentImageDataUrl);
  const sourceRatio = source.width / source.height;
  let cropWidth = source.width;
  let cropHeight = source.height;

  if (sourceRatio > targetRatio) {
    cropWidth = Math.floor(source.height * targetRatio);
  } else if (sourceRatio < targetRatio) {
    cropHeight = Math.floor(source.width / targetRatio);
  }

  const sx = Math.floor((source.width - cropWidth) / 2);
  const sy = Math.floor((source.height - cropHeight) / 2);
  const outputWidth = Math.min(1200, Math.max(480, cropWidth));
  const outputHeight = Math.round(outputWidth / targetRatio);

  const context = getPhotoStudioContext();
  if (!context) {
    return;
  }
  photoStudioCanvas.width = outputWidth;
  photoStudioCanvas.height = outputHeight;
  context.clearRect(0, 0, outputWidth, outputHeight);
  context.drawImage(source, sx, sy, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
  const snapshot = snapshotStudioCanvas("image/jpeg", 0.9);
  if (snapshot) {
    studioCurrentImageDataUrl = snapshot;
    pushStudioHistory(studioCurrentImageDataUrl);
  }
}

function updateStudioMediaSlot(newDataUrl) {
  const mediaItems = readGalleryImagesFromForm();
  if (activeStudioIndex < 0 || activeStudioIndex >= mediaItems.length) {
    return;
  }
  mediaItems[activeStudioIndex] = newDataUrl;
  setGalleryImagesOnForm(mediaItems);
  if (activeStudioIndex === 0 || !String(productImageInput.value || "").trim()) {
    productImageInput.value = newDataUrl;
  }
  setProductImagePreview(productImageInput.value || mediaItems[0] || "");
  renderMediaStudio();
}

function resetProductForm() {
  if (!productForm) {
    return;
  }
  productForm.reset();
  productIdInput.value = "";
  productStatusInput.value = "active";
  productFulfillmentInput.value = "fbm";
  productFeaturedInput.checked = false;
  uploadedProductMediaDataUrls = [];
  activeStudioIndex = -1;
  studioOriginalImageDataUrl = "";
  studioCurrentImageDataUrl = "";
  studioEraserEnabled = false;
  studioHistory = [];
  studioHistoryIndex = -1;
  clearStudioCustomCropState();
  setGalleryImagesOnForm([]);
  setProductImagePreview("");
  renderMediaStudio();
  selectedProductCollections = new Set();
  if (productCollectionCustomInput) {
    productCollectionCustomInput.value = "";
  }
  if (productDefinitionInput) {
    productDefinitionInput.value = "";
  }
  syncProductCollectionSelectionFromInput();
  renderProductCollectionPicker();
  saveProductBtn.textContent = "Add Product";
  resetMediaUploadProgress();
  setPendingDriveRetryUploads([], "");
  setProductFormMessage("");
}

function fillProductForm(product) {
  if (!product) {
    return;
  }
  productIdInput.value = product.id || "";
  productSkuInput.value = product.sku || "";
  productNameInput.value = product.name || "";
  productBrandInput.value = product.brand || "";
  productCategoryInput.value = normalizeCategoryValue(product.category || "");
  if (productCollectionsInput) {
    productCollectionsInput.value = normalizeCollectionValues(product.collections, product.category).join(", ");
  }
  syncProductCollectionSelectionFromInput();
  renderProductCollectionPicker();
  productSegmentInput.value = product.segment || "b2c";
  productPriceInput.value = numberOrZero(product.price);
  productListPriceInput.value = numberOrZero(product.listPrice || product.price);
  productStockInput.value = numberOrZero(product.stock);
  productRatingInput.value = numberOrZero(product.rating);
  productMoqInput.value = numberOrZero(product.moq);
  productStatusInput.value = String(product.status || "active");
  productFulfillmentInput.value = String(product.fulfillment || "fbm");
  productKeywordsInput.value = Array.isArray(product.keywords) ? product.keywords.join(", ") : "";
  productDescriptionInput.value = product.description || "";
  if (productDefinitionInput) {
    productDefinitionInput.value = "";
  }
  productImageInput.value = product.image || "";
  const combinedMedia = Array.isArray(product.media)
    ? product.media
    : [
      ...(Array.isArray(product.images) ? product.images : (product.image ? [product.image] : [])),
      ...(Array.isArray(product.videos) ? product.videos : [])
    ];
  setGalleryImagesOnForm(combinedMedia);
  uploadedProductMediaDataUrls = [];
  setProductImagePreview(product.image || "", "Loaded from saved product image.");
  renderMediaStudio();
  productFeaturedInput.checked = Boolean(product.featured);
  saveProductBtn.textContent = "Update Product";
  setProductFormMessage(`Editing ${product.name || "product"}.`);
}

function productPayloadFromForm() {
  const price = numberOrZero(productPriceInput.value);
  const listPrice = numberOrZero(productListPriceInput.value || price);
  const primaryCategory = normalizeCategoryValue(productCategoryInput.value);
  const galleryMedia = readGalleryImagesFromForm();
  const coverCandidate = normalizeImageUrl(productImageInput.value || uploadedProductMediaDataUrls[0] || galleryMedia[0] || "");
  const mergedMedia = [coverCandidate, ...galleryMedia].filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
  const dedupedMedia = [...new Set(mergedMedia)];
  const mediaImages = dedupedMedia.filter((item) => isImageMedia(item));
  const mediaVideos = dedupedMedia.filter((item) => isVideoMedia(item));
  const primaryImage = mediaImages[0] || "";
  return {
    sku: String(productSkuInput.value || "").trim(),
    name: String(productNameInput.value || "").trim(),
    brand: String(productBrandInput.value || "").trim(),
    category: primaryCategory,
    collections: normalizeCollectionValues(productCollectionsInput ? productCollectionsInput.value : "", primaryCategory),
    segment: String(productSegmentInput.value || "b2c").trim(),
    price,
    listPrice: listPrice < price ? price : listPrice,
    stock: numberOrZero(productStockInput.value),
    rating: numberOrZero(productRatingInput.value),
    moq: numberOrZero(productMoqInput.value),
    status: String(productStatusInput.value || "active").toLowerCase(),
    fulfillment: String(productFulfillmentInput.value || "fbm").toLowerCase(),
    keywords: String(productKeywordsInput.value || "").split(",").map((item) => item.trim()).filter(Boolean),
    description: String(productDescriptionInput.value || "").trim(),
    image: primaryImage,
    images: mediaImages,
    videos: mediaVideos,
    media: dedupedMedia,
    featured: Boolean(productFeaturedInput.checked)
  };
}

function upsertCatalogProductOffline(editingId, payload) {
  const catalogMap = loadJsonStorage(CATALOG_STORAGE_KEY, {});
  const existing = editingId ? catalogMap[editingId] : null;
  const id = editingId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}`);
  const sku = String(payload.sku || existing?.sku || `EM-${String(id).slice(0, 8).toUpperCase()}`).trim().toUpperCase();
  const nowIso = new Date().toISOString();

  catalogMap[id] = {
    id,
    sku,
    name: payload.name,
    brand: payload.brand,
    category: payload.category,
    segment: payload.segment,
    price: Number(payload.price || 0),
    listPrice: Number(payload.listPrice || payload.price || 0),
    stock: Number(payload.stock || 0),
    rating: Number(payload.rating || 0),
    moq: Number(payload.moq || 0),
    status: payload.status || "active",
    fulfillment: payload.fulfillment || "fbm",
    featured: Boolean(payload.featured),
    description: payload.description || "",
    keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
    collections: normalizeCollectionValues(payload.collections, payload.category),
    image: payload.image || "",
    images: Array.isArray(payload.images) ? payload.images.slice(0, MAX_PRODUCT_IMAGES) : [],
    videos: Array.isArray(payload.videos) ? payload.videos.slice(0, MAX_PRODUCT_IMAGES) : [],
    media: Array.isArray(payload.media) ? payload.media.slice(0, MAX_PRODUCT_IMAGES) : [],
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };

  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
  } catch (error) {
    throw new Error("Unable to save product in local mode. Storage may be full.");
  }
  return catalogMap[id];
}

function removeCatalogProductOffline(productId) {
  const catalogMap = loadJsonStorage(CATALOG_STORAGE_KEY, {});
  const key = String(productId || "").trim();
  if (!key || !catalogMap[key]) {
    throw new Error("Product not found in offline catalog.");
  }
  delete catalogMap[key];
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
  } catch (error) {
    throw new Error("Unable to delete product in offline mode.");
  }
}

function duplicateCatalogProductOffline(productId) {
  const catalogMap = loadJsonStorage(CATALOG_STORAGE_KEY, {});
  const sourceKey = String(productId || "").trim();
  const source = catalogMap[sourceKey];
  if (!source) {
    throw new Error("Product not found in offline catalog.");
  }
  const cloned = {
    ...source,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}`,
    sku: "",
    name: `${source.name || "Product"} Copy`,
    status: "draft",
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  upsertCatalogProductOffline("", cloned);
  return cloned;
}

function applyCatalogBulkActionOffline(action, ids, options = {}) {
  const catalogMap = loadJsonStorage(CATALOG_STORAGE_KEY, {});
  const idSet = new Set((Array.isArray(ids) ? ids : []).map((id) => String(id)));
  const collectionsInput = normalizeCollectionValues(options.collections || "", "");
  const entries = Object.entries(catalogMap);
  let affected = 0;

  const next = {};
  entries.forEach(([key, product]) => {
    if (!idSet.has(String(key))) {
      next[key] = product;
      return;
    }
    affected += 1;
    if (action === "delete") {
      return;
    }
    const updated = { ...product, updatedAt: new Date().toISOString() };
    if (action.startsWith("set_status_")) {
      updated.status = action.replace("set_status_", "");
    } else if (action.startsWith("set_fulfillment_")) {
      updated.fulfillment = action.replace("set_fulfillment_", "");
    } else if (action === "set_featured_true") {
      updated.featured = true;
    } else if (action === "set_featured_false") {
      updated.featured = false;
    } else if (action === "set_collections") {
      updated.collections = normalizeCollectionValues(collectionsInput, updated.category || product.category || "");
    } else if (action === "add_collections") {
      const existingCollections = normalizeCollectionValues(updated.collections || product.collections || [], updated.category || product.category || "");
      updated.collections = normalizeCollectionValues([...existingCollections, ...collectionsInput], updated.category || product.category || "");
    } else if (action === "clear_collections") {
      updated.collections = normalizeCollectionValues([], updated.category || product.category || "");
    }
    next[key] = updated;
  });

  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    throw new Error("Unable to apply bulk action in offline mode.");
  }
  return affected;
}

async function upsertCatalogProduct() {
  const editingId = String(productIdInput.value || "").trim();
  const payload = productPayloadFromForm();
  const hasVideoMedia = Array.isArray(payload.media) && payload.media.some((item) => isVideoMedia(item));

  if (!payload.name || !payload.brand || !payload.category || !Number.isFinite(payload.price) || payload.price <= 0) {
    setProductFormMessage("Name, brand, category and price are required.", true);
    return;
  }
  if (payload.listPrice < payload.price) {
    setProductFormMessage("MRP/List price cannot be lower than price.", true);
    return;
  }

  saveProductBtn.disabled = true;
  try {
    const endpoint = editingId ? `/products/${encodeURIComponent(editingId)}` : "/products";
    const method = editingId ? "PUT" : "POST";
    const response = await api(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save product");
    }
    const persistedProduct = data && data.id
      ? data
      : { ...payload, id: editingId || (payload && payload.id ? payload.id : "") };
    if (persistedProduct && persistedProduct.id) {
      try {
        upsertCatalogProductOffline(String(persistedProduct.id), persistedProduct);
      } catch (cacheError) {
        // Ignore local cache sync failures on successful server save.
      }
    }

    resetProductForm();
    setMessage(editingId ? "Product updated successfully." : "Product added successfully.", false, {
      toast: true,
      title: editingId ? "Product updated" : "Product added",
      tone: "success",
      timeoutMs: 4200
    });
    await loadDashboard();
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    const isNetworkIssue = /failed to fetch|network|backend/i.test(message);
    if (isNetworkIssue) {
      if (hasVideoMedia) {
        setProductFormMessage("Video upload needs backend running on port 4000. Offline save is disabled for video media.", true);
        return;
      }
      try {
        upsertCatalogProductOffline(editingId, payload);
        resetProductForm();
        setMessage(editingId ? "Product updated in offline mode." : "Product added in offline mode.", false, {
          toast: true,
          title: "Saved in offline mode",
          tone: "warning",
          timeoutMs: 5600
        });
        await loadDashboard();
        return;
      } catch (offlineError) {
        setProductFormMessage(offlineError.message || "Failed to save product in offline mode.", true);
        return;
      }
    }
    if (/payload too large|entity too large|413/i.test(message)) {
      setProductFormMessage("Media file is too large for backend limit. Use smaller image/video or compress video and try again.", true);
      return;
    }
    setProductFormMessage(message || "Failed to save product.", true);
  } finally {
    saveProductBtn.disabled = false;
  }
}

async function removeCatalogProduct(productId) {
  if (!productId || !window.confirm("Delete this product from catalog?")) {
    return;
  }
  try {
    const response = await api(`/products/${encodeURIComponent(productId)}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Unable to delete product");
    }
    try {
      removeCatalogProductOffline(productId);
    } catch (cacheError) {
      // Ignore cache delete failure when server delete succeeds.
    }
    setMessage("Product deleted.", false, {
      toast: true,
      title: "Product deleted",
      tone: "success",
      timeoutMs: 4200
    });
    await loadDashboard();
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    const isOffline = /failed to fetch|network|backend/i.test(message);
    if (isOffline) {
      try {
        removeCatalogProductOffline(productId);
        setMessage("Product deleted in offline mode.", false, {
          toast: true,
          title: "Deleted in offline mode",
          tone: "warning",
          timeoutMs: 5600
        });
        await loadDashboard();
        return;
      } catch (offlineError) {
        setMessage(offlineError.message || "Failed to delete product in offline mode.", true);
        return;
      }
    }
    setMessage(message || "Failed to delete product.", true);
  }
}

async function duplicateCatalogProduct(productId) {
  if (!productId) {
    return;
  }
  try {
    const response = await api(`/products/${encodeURIComponent(productId)}/clone`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to duplicate product");
    }
    if (data && data.id) {
      try {
        upsertCatalogProductOffline(String(data.id), data);
      } catch (cacheError) {
        // Ignore local cache sync failures on successful server duplicate.
      }
    }
    setMessage(`Product duplicated: ${data.name || "Copy"}.`, false, {
      toast: true,
      title: "Product duplicated",
      tone: "success",
      timeoutMs: 4200
    });
    await loadDashboard();
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    const isOffline = /failed to fetch|network|backend/i.test(message);
    if (isOffline) {
      try {
        const cloned = duplicateCatalogProductOffline(productId);
        setMessage(`Product duplicated in offline mode: ${cloned.name || "Copy"}.`, false, {
          toast: true,
          title: "Duplicated in offline mode",
          tone: "warning",
          timeoutMs: 5600
        });
        await loadDashboard();
        return;
      } catch (offlineError) {
        setMessage(offlineError.message || "Failed to duplicate product in offline mode.", true);
        return;
      }
    }
    setMessage(message || "Failed to duplicate product.", true);
  }
}

async function applyCatalogBulkAction(action, ids, options = {}) {
  if (!action || !Array.isArray(ids) || !ids.length) {
    return;
  }
  const collections = normalizeCollectionValues(options.collections || "", "");
  try {
    const response = await api("/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids, collections })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Bulk action failed");
    }
    setMessage(`Bulk action applied on ${Number(data.affected || 0)} product(s).`, false, {
      toast: true,
      title: "Bulk action applied",
      tone: "success",
      timeoutMs: 4600
    });
    if (catalogBulkCollectionsInput) {
      catalogBulkCollectionsInput.value = "";
    }
    selectedCatalogProductIds.clear();
    await loadDashboard();
  } catch (error) {
    const message = String(error && error.message ? error.message : "");
    const isOffline = /failed to fetch|network|backend/i.test(message);
    if (isOffline) {
      try {
        const affected = applyCatalogBulkActionOffline(action, ids, { collections });
        setMessage(`Bulk action applied in offline mode on ${affected} product(s).`, false, {
          toast: true,
          title: "Bulk action in offline mode",
          tone: "warning",
          timeoutMs: 5600
        });
        if (catalogBulkCollectionsInput) {
          catalogBulkCollectionsInput.value = "";
        }
        selectedCatalogProductIds.clear();
        await loadDashboard();
        return;
      } catch (offlineError) {
        setMessage(offlineError.message || "Failed to apply offline bulk action.", true);
        return;
      }
    }
    setMessage(message || "Failed to apply bulk action.", true);
  }
}

function toCsvValue(value) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function downloadCsvFile(rows, filename) {
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => toCsvValue(row[key])).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function isPhysicalProduct(product) {
  const delivery = String(product.deliveryType || product.productType || "").toLowerCase();
  const category = String(product.category || "").toLowerCase();
  const name = String(product.name || "").toLowerCase();
  const keywords = Array.isArray(product.keywords)
    ? product.keywords.join(" ").toLowerCase()
    : String(product.keywords || "").toLowerCase();
  const hasDigitalMarker = delivery === "digital"
    || category.includes("digital")
    || category.includes("software")
    || category.includes("subscription")
    || category.includes("license")
    || category.includes("gift-card")
    || name.includes("digital")
    || keywords.includes("digital")
    || keywords.includes("license key")
    || keywords.includes("download");
  return !hasDigitalMarker;
}

function exportCatalogCsv() {
  const rows = visibleCatalogProducts
    .filter((product) => isPhysicalProduct(product))
    .map((product) => ({
      id: product.id,
      sku: product.sku || "",
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      collections: Array.isArray(product.collections) ? product.collections.join("|") : "",
      segment: product.segment || "",
      price: Number(product.price || 0),
      listPrice: Number(product.listPrice || 0),
      stock: Number(product.stock || 0),
      status: product.status || "",
      fulfillment: product.fulfillment || "",
      featured: Boolean(product.featured),
      rating: Number(product.rating || 0),
      moq: Number(product.moq || 0),
      description: product.description || "",
      keywords: Array.isArray(product.keywords) ? product.keywords.join("|") : ""
    }));

  if (!rows.length) {
    setMessage("No physical products available to export in the current products view.", true);
    return;
  }

  downloadCsvFile(rows, `physical-products-export-${new Date().toISOString().slice(0, 10)}.csv`);
  setMessage(`Physical products CSV exported (${rows.length} row(s)).`, false, {
    toast: true,
    title: "CSV exported",
    tone: "success",
    timeoutMs: 4600
  });
}

async function downloadCleanCatalogCsv() {
  const cleanCsvPath = "imports/catalog_products_clean_import.csv";
  try {
    const response = await fetch(`${cleanCsvPath}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "catalog_products_clean_import.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage("Clean import CSV downloaded.", false, {
      toast: true,
      title: "CSV downloaded",
      tone: "success",
      timeoutMs: 4200
    });
  } catch (error) {
    setMessage("Clean CSV is not available in project yet. Run conversion and publish the file, then try again.", true);
  }
}

function detectCsvDelimiter(text) {
  const sampleLine = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0) || "";
  const commaCount = (sampleLine.match(/,/g) || []).length;
  const semicolonCount = (sampleLine.match(/;/g) || []).length;
  const tabCount = (sampleLine.match(/\t/g) || []).length;
  if (semicolonCount > commaCount && semicolonCount >= tabCount) {
    return ";";
  }
  if (tabCount > commaCount && tabCount > semicolonCount) {
    return "\t";
  }
  return ",";
}

function decodeCsvTextFromFile(fileBuffer) {
  const uint8 = new Uint8Array(fileBuffer || new ArrayBuffer(0));
  if (!uint8.length) {
    return "";
  }

  const hasUtf16LeBom = uint8.length >= 2 && uint8[0] === 0xFF && uint8[1] === 0xFE;
  const hasUtf16BeBom = uint8.length >= 2 && uint8[0] === 0xFE && uint8[1] === 0xFF;
  const hasUtf8Bom = uint8.length >= 3 && uint8[0] === 0xEF && uint8[1] === 0xBB && uint8[2] === 0xBF;
  const hasManyNulls = uint8.slice(0, Math.min(512, uint8.length)).some((byte, index) => index % 2 === 1 && byte === 0);

  if (hasUtf16LeBom || hasManyNulls) {
    return new TextDecoder("utf-16le").decode(uint8);
  }
  if (hasUtf16BeBom) {
    return new TextDecoder("utf-16be").decode(uint8);
  }
  if (hasUtf8Bom) {
    return new TextDecoder("utf-8").decode(uint8.slice(3));
  }
  return new TextDecoder("utf-8").decode(uint8);
}

function parseCsvText(csvText) {
  const text = String(csvText || "").replace(/^\uFEFF/, "");
  const delimiter = detectCsvDelimiter(text);
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      current.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      current.push(field);
      if (current.some((value) => String(value).trim() !== "")) {
        rows.push(current);
      }
      current = [];
      field = "";
      continue;
    }

    field += char;
  }

  current.push(field);
  if (current.some((value) => String(value).trim() !== "")) {
    rows.push(current);
  }

  return rows;
}

function truncateCsvPreviewCell(value, maxChars = CSV_PREVIEW_MAX_CHARS) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.length <= maxChars) {
    return raw;
  }
  return `${raw.slice(0, Math.max(1, maxChars - 1)).trim()}...`;
}

function renderCsvImportPreview(fileName, parsedRows) {
  if (!importCatalogPreviewMeta || !importCatalogPreviewWrap || !importCatalogPreviewHead || !importCatalogPreviewBody) {
    return;
  }

  if (!Array.isArray(parsedRows) || !parsedRows.length) {
    importCatalogPreviewMeta.textContent = "No CSV file selected.";
    importCatalogPreviewWrap.hidden = true;
    importCatalogPreviewHead.innerHTML = "";
    importCatalogPreviewBody.innerHTML = "";
    return;
  }

  const headerRow = parsedRows[0];
  const bodyRows = parsedRows.slice(1);
  const previewRows = bodyRows.slice(0, 8);
  importCatalogPreviewMeta.textContent = `Selected: ${fileName} • Rows: ${bodyRows.length} • Preview: ${previewRows.length}`;
  importCatalogPreviewHead.innerHTML = headerRow
    .slice(0, 12)
    .map((column) => `<th>${escapeHtmlAttr(column)}</th>`)
    .join("");
  importCatalogPreviewBody.innerHTML = previewRows.length
    ? previewRows.map((row) => {
      const cells = headerRow.slice(0, 12).map((_, index) => {
        const fullValue = String(row[index] || "");
        const compactValue = truncateCsvPreviewCell(fullValue);
        return `<td title="${escapeHtmlAttr(truncateCsvPreviewCell(fullValue, 220))}">${escapeHtmlAttr(compactValue)}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("")
    : "<tr><td colspan='12'>No data rows found in this CSV.</td></tr>";
  importCatalogPreviewWrap.hidden = false;
}

function canonicalCsvHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "");
}

function csvHeaderIndexMap(headerRow) {
  const map = new Map();
  (headerRow || []).forEach((header, index) => {
    map.set(canonicalCsvHeader(header), index);
  });
  return map;
}

function csvValueFromRow(row, headerMap, ...candidates) {
  for (const candidate of candidates) {
    const idx = headerMap.get(canonicalCsvHeader(candidate));
    if (typeof idx === "number" && idx >= 0 && idx < row.length) {
      return String(row[idx] || "").trim();
    }
  }
  return "";
}

function parseCsvNumber(value, fallback = 0) {
  const normalized = String(value || "")
    .trim()
    .replace(/[, ]+/g, "")
    .replace(/[^\d.-]/g, "");
  if (!normalized) {
    return fallback;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCsvBoolean(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["1", "true", "yes", "y"].includes(normalized);
}

let csvDecodeTextarea = null;

function decodeCsvHtmlEntities(value) {
  const raw = String(value || "");
  if (!raw) {
    return "";
  }
  if (!csvDecodeTextarea && typeof document !== "undefined" && typeof document.createElement === "function") {
    csvDecodeTextarea = document.createElement("textarea");
  }
  if (!csvDecodeTextarea) {
    return raw
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, "\"")
      .replace(/&#39;|&apos;/gi, "'");
  }
  csvDecodeTextarea.innerHTML = raw;
  return csvDecodeTextarea.value;
}

function sanitizeCsvText(value, maxLength = 0) {
  const decoded = decodeCsvHtmlEntities(value);
  const stripped = stripHtmlToText(decoded);
  if (!maxLength || stripped.length <= maxLength) {
    return stripped;
  }
  return stripped.slice(0, maxLength).trim();
}

function normalizeCsvSegment(value) {
  const normalized = sanitizeCsvText(value).toLowerCase();
  return normalized === "b2b" ? "b2b" : "b2c";
}

function parseCsvKeywords(value) {
  const raw = sanitizeCsvText(value);
  if (!raw) {
    return [];
  }
  const separator = raw.includes("|") ? "|" : ",";
  return raw
    .split(separator)
    .map((item) => sanitizeCsvText(item, 80))
    .filter(Boolean);
}

function extractCsvMediaUrlTokens(rawValue) {
  const matches = String(rawValue || "").match(/(?:https?:\/\/|\/\/)[^\s|;,]+/gi);
  return Array.isArray(matches) ? matches.map((item) => String(item || "").trim()).filter(Boolean) : [];
}

function splitCsvMediaCandidates(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) {
    return [];
  }

  const directUrlTokens = extractCsvMediaUrlTokens(raw);
  if (directUrlTokens.length > 1) {
    return directUrlTokens;
  }
  if (directUrlTokens.length === 1 && raw.replace(directUrlTokens[0], "").trim() === "") {
    return directUrlTokens;
  }

  const firstPass = raw
    .split(/[|;\n\r]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!firstPass.length) {
    return [raw];
  }

  const secondPass = firstPass
    .flatMap((item) => item.split(/,\s*(?=(?:https?:\/\/|\/\/|data:))/i))
    .map((item) => item.trim())
    .filter(Boolean);
  if (secondPass.length !== 1) {
    return secondPass;
  }

  const maybeWhitespaceParts = secondPass[0]
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const allLookLikeUrls = maybeWhitespaceParts.length > 1
    && maybeWhitespaceParts.every((item) => /^(?:https?:\/\/|\/\/|data:|[a-z0-9.-]+\.[a-z]{2,}(?:\/|$))/i.test(item));
  return allLookLikeUrls ? maybeWhitespaceParts : secondPass;
}

function parseCsvMedia(value) {
  const raw = decodeCsvHtmlEntities(value);
  if (!raw) {
    return [];
  }

  const candidates = splitCsvMediaCandidates(raw);
  return candidates
    .map((item) => {
      const entry = String(item || "").trim();
      if (!entry) {
        return "";
      }
      const safeEntry = /^data:(?:image|video)\//i.test(entry)
        ? entry
        : sanitizeCsvText(entry, 1800);
      return normalizeImageUrl(safeEntry);
    })
    .filter(Boolean)
    .filter((entry, index, list) => list.indexOf(entry) === index)
    .slice(0, MAX_PRODUCT_IMAGES);
}

function parseCsvStock(value) {
  const raw = String(value || "").trim();
  const numeric = parseCsvNumber(raw, Number.NaN);
  if (Number.isFinite(numeric)) {
    return Math.max(0, numeric);
  }
  const normalized = raw.toLowerCase();
  if (!normalized) {
    return 0;
  }
  if (normalized.includes("instock") || normalized.includes("in stock") || normalized.includes("available")) {
    return 10;
  }
  if (normalized.includes("low")) {
    return 3;
  }
  if (normalized.includes("outofstock") || normalized.includes("out of stock") || normalized.includes("soldout")) {
    return 0;
  }
  return 0;
}

function payloadFromCsvRow(row, headerMap) {
  const id = sanitizeCsvText(csvValueFromRow(row, headerMap, "id"), 120);
  const sku = sanitizeCsvText(csvValueFromRow(row, headerMap, "sku"), 120);
  const name = sanitizeCsvText(csvValueFromRow(row, headerMap, "name"), 220);
  const collectionValue = sanitizeCsvText(csvValueFromRow(row, headerMap, "collection"), 280);
  const collectionParts = String(collectionValue || "")
    .split(/[;|,]+/)
    .map((item) => sanitizeCsvText(item, 80))
    .filter(Boolean);
  const collectionPrimary = collectionParts[0] || "";
  const rawCategory = sanitizeCsvText(csvValueFromRow(
    row,
    headerMap,
    "category"
  ), 120) || collectionPrimary;
  const category = normalizeCategoryValue(rawCategory);
  const brandRaw = sanitizeCsvText(csvValueFromRow(row, headerMap, "brand"), 120);
  const brand = brandRaw || "Generic";
  const segment = normalizeCsvSegment(csvValueFromRow(row, headerMap, "segment") || "b2c");
  const price = parseCsvNumber(csvValueFromRow(row, headerMap, "price"), 0);
  const listPrice = parseCsvNumber(csvValueFromRow(row, headerMap, "listPrice", "list_price"), price);
  const stock = parseCsvStock(csvValueFromRow(row, headerMap, "stock"));
  const rating = parseCsvNumber(csvValueFromRow(row, headerMap, "rating"), 0);
  const moq = parseCsvNumber(csvValueFromRow(row, headerMap, "moq"), 0);
  const statusRaw = sanitizeCsvText(csvValueFromRow(row, headerMap, "status"), 40).toLowerCase();
  const status = statusRaw === "draft" || statusRaw === "inactive" ? statusRaw : "active";
  const fulfillmentRaw = sanitizeCsvText(csvValueFromRow(row, headerMap, "fulfillment"), 40).toLowerCase();
  const fulfillment = fulfillmentRaw === "fba" ? "fba" : "fbm";
  const featured = parseCsvBoolean(csvValueFromRow(row, headerMap, "featured"));
  const description = sanitizeCsvText(csvValueFromRow(row, headerMap, "description"), 2200);
  const additionalInfoTitle1 = sanitizeCsvText(csvValueFromRow(row, headerMap, "additionalInfoTitle1"), 90);
  const additionalInfoDescription1 = sanitizeCsvText(csvValueFromRow(row, headerMap, "additionalInfoDescription1"), 650);
  const additionalInfoTitle2 = sanitizeCsvText(csvValueFromRow(row, headerMap, "additionalInfoTitle2"), 90);
  const additionalInfoDescription2 = sanitizeCsvText(csvValueFromRow(row, headerMap, "additionalInfoDescription2"), 650);
  const compatibilityBlocks = [];
  if (additionalInfoTitle1 && additionalInfoDescription1) {
    compatibilityBlocks.push(`${additionalInfoTitle1}: ${additionalInfoDescription1}`);
  }
  if (additionalInfoTitle2 && additionalInfoDescription2) {
    compatibilityBlocks.push(`${additionalInfoTitle2}: ${additionalInfoDescription2}`);
  }
  const mergedDescription = [description, ...compatibilityBlocks].filter(Boolean).join("\n\n").slice(0, 2800);
  const keywords = parseCsvKeywords(csvValueFromRow(row, headerMap, "keywords"));
  const importedImageField = sanitizeCsvText(csvValueFromRow(row, headerMap, "image"), 1000);
  const images = parseCsvMedia(csvValueFromRow(row, headerMap, "images")) || [];
  const importedMedia = parseCsvMedia(csvValueFromRow(row, headerMap, "media"));
  const image = normalizeImageUrl(importedImageField) || importedMedia[0] || images[0] || "";
  const videos = parseCsvMedia(csvValueFromRow(row, headerMap, "videos"));
  const mergedMedia = [image, ...images, ...videos, ...importedMedia]
    .map((entry) => normalizeImageUrl(entry))
    .filter(Boolean);
  const media = [...new Set(mergedMedia)].slice(0, MAX_PRODUCT_IMAGES);
  const mediaImages = media.filter((item) => inferMediaType(item) === "image").slice(0, MAX_PRODUCT_IMAGES);
  const mediaVideos = media.filter((item) => inferMediaType(item) === "video").slice(0, MAX_PRODUCT_IMAGES);

  return {
    id,
    sku,
    payload: {
      sku,
      name,
      brand,
      category,
      segment: segment || "b2c",
      price: Number.isFinite(price) ? price : 0,
      listPrice: Number.isFinite(listPrice) && listPrice > 0 ? listPrice : (Number.isFinite(price) ? price : 0),
      stock: Number.isFinite(stock) ? stock : 0,
      rating: Number.isFinite(rating) ? rating : 0,
      moq: Number.isFinite(moq) ? moq : 0,
      status: status || "active",
      fulfillment: fulfillment || "fbm",
      featured,
      description: mergedDescription,
      keywords,
      image: mediaImages[0] || image,
      images: mediaImages,
      videos: mediaVideos,
      media,
      collections: normalizeCollectionValues(collectionParts, category)
    }
  };
}

function validateCsvPayload(rowIndex, payload) {
  if (!payload.sku || !payload.name || !payload.category || !Number.isFinite(payload.price) || payload.price <= 0) {
    throw new Error(`Row ${rowIndex}: sku, name, category and price are required.`);
  }
}

function stripHtmlToText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCompactOfflinePayload(payload, level = "normal") {
  const mediaLimit = level === "aggressive" ? 2 : 4;
  const descriptionLimit = level === "aggressive" ? 180 : 420;
  const safeMedia = normalizeMediaSet(payload).slice(0, mediaLimit);
  const safeImages = safeMedia.filter((item) => inferMediaType(item) === "image").slice(0, mediaLimit);
  const primaryImage = normalizeImageUrl(payload.image || safeImages[0] || safeMedia[0] || "");
  const description = stripHtmlToText(payload.description || "").slice(0, descriptionLimit);
  const keywords = Array.isArray(payload.keywords) ? payload.keywords.slice(0, 8) : [];
  const orderedMedia = [primaryImage, ...safeMedia].filter(Boolean);
  const uniqueMedia = [...new Set(orderedMedia)];
  const imageMedia = uniqueMedia.filter((item) => inferMediaType(item) === "image");
  const videoMedia = uniqueMedia.filter((item) => inferMediaType(item) === "video");
  return {
    ...payload,
    description,
    keywords,
    image: primaryImage,
    images: imageMedia.slice(0, mediaLimit),
    videos: videoMedia.slice(0, mediaLimit),
    media: uniqueMedia.slice(0, mediaLimit)
  };
}

function splitMediaEntries(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return [];
  }
  if (raw.includes(";") || raw.includes("|")) {
    return raw.split(/[;|]/).map((item) => item.trim()).filter(Boolean);
  }
  return [raw];
}

function normalizeMediaSet(product) {
  const merged = [
    ...(Array.isArray(product.media) ? product.media : splitMediaEntries(product.media)),
    ...(Array.isArray(product.images) ? product.images : splitMediaEntries(product.images)),
    ...(Array.isArray(product.videos) ? product.videos : splitMediaEntries(product.videos)),
    ...splitMediaEntries(product.image || "")
  ]
    .map((item) => normalizeImageUrl(item))
    .filter(Boolean);
  return [...new Set(merged)].slice(0, MAX_PRODUCT_IMAGES);
}

function buildUpsertPayloadFromProduct(product) {
  const normalizedMedia = normalizeMediaSet(product);
  const mediaImages = normalizedMedia.filter((item) => inferMediaType(item) === "image");
  const mediaVideos = normalizedMedia.filter((item) => inferMediaType(item) === "video");
  return {
    sku: String(product.sku || "").trim(),
    name: String(product.name || "").trim(),
    brand: String(product.brand || "Generic").trim(),
    category: normalizeCategoryValue(product.category || "accessory"),
    segment: String(product.segment || "b2c").trim(),
    price: numberOrZero(product.price),
    listPrice: numberOrZero(product.listPrice || product.price),
    stock: numberOrZero(product.stock),
    rating: numberOrZero(product.rating),
    moq: numberOrZero(product.moq),
    status: String(product.status || "active").toLowerCase(),
    fulfillment: String(product.fulfillment || "fbm").toLowerCase(),
    featured: Boolean(product.featured),
    description: String(product.description || "").trim(),
    keywords: Array.isArray(product.keywords)
      ? product.keywords.map((item) => String(item).trim()).filter(Boolean)
      : parseCsvKeywords(String(product.keywords || "")),
    collections: normalizeCollectionValues(product.collections, product.category),
    image: mediaImages[0] || normalizeImageUrl(product.image || ""),
    images: mediaImages.slice(0, MAX_PRODUCT_IMAGES),
    videos: mediaVideos.slice(0, MAX_PRODUCT_IMAGES),
    media: normalizedMedia
  };
}

function hasMediaChanged(product, payload) {
  const existingMedia = normalizeMediaSet(product);
  const nextMedia = Array.isArray(payload.media) ? payload.media : [];
  if (normalizeImageUrl(product.image || "") !== normalizeImageUrl(payload.image || "")) {
    return true;
  }
  if (existingMedia.length !== nextMedia.length) {
    return true;
  }
  return existingMedia.some((item, index) => item !== nextMedia[index]);
}

async function importCatalogCsvFile(file, preParsedRows = null, options = {}) {
  const batchSize = Math.max(1, Number(options.batchSize || 25));
  const onProgress = typeof options.onProgress === "function" ? options.onProgress : null;
  const parsedRows = Array.isArray(preParsedRows) ? preParsedRows : parseCsvText(await file.text());
  if (!parsedRows.length) {
    throw new Error("CSV file is empty.");
  }

  const headerMap = csvHeaderIndexMap(parsedRows[0]);
  const requiredColumns = [
    ["sku"],
    ["name"],
    ["brand"],
    ["category"],
    ["price"]
  ];
  const missingColumns = requiredColumns
    .filter((aliases) => !aliases.some((column) => headerMap.has(canonicalCsvHeader(column))))
    .map((aliases) => aliases[0]);
  if (missingColumns.length) {
    const detectedHeaders = parsedRows[0].map((value) => String(value || "").trim()).filter(Boolean).slice(0, 20);
    const requiredHeaderSet = "sku,name,brand,category,price";
    throw new Error(`Missing required ElectroMart CSV column(s): ${missingColumns.join(", ")}. Required headers: ${requiredHeaderSet}. Tip: convert external CSV first using 'npm.cmd run csv:convert:project -- --input \"C:\\path\\catalog_products.csv\"'. Detected headers: ${detectedHeaders.join(", ")}`);
  }

  let importableProductRows = 0;
  const seenCsvSkus = new Map();
  const duplicateSkuPairs = [];
  for (let rowIndex = 1; rowIndex < parsedRows.length; rowIndex += 1) {
    const row = parsedRows[rowIndex];
    if (!row || !row.some((cell) => String(cell || "").trim())) {
      continue;
    }
    const fieldType = String(csvValueFromRow(row, headerMap, "fieldtype", "rowtype") || "").trim().toLowerCase();
    if (fieldType && fieldType !== "product") {
      continue;
    }
    importableProductRows += 1;
    const normalizedSku = sanitizeCsvText(csvValueFromRow(row, headerMap, "sku"), 120).toUpperCase();
    if (!normalizedSku) {
      continue;
    }
    const existingRowNo = seenCsvSkus.get(normalizedSku);
    if (existingRowNo) {
      if (duplicateSkuPairs.length < 8) {
        duplicateSkuPairs.push(`${normalizedSku} (rows ${existingRowNo} & ${rowIndex + 1})`);
      }
      continue;
    }
    seenCsvSkus.set(normalizedSku, rowIndex + 1);
  }

  if (!importableProductRows) {
    throw new Error("No product rows found in CSV. Ensure row type is product or blank.");
  }
  if (duplicateSkuPairs.length) {
    throw new Error(`Duplicate SKU rows found in CSV. Please keep one row per SKU. Samples: ${duplicateSkuPairs.join("; ")}`);
  }

  const existingById = new Map(allCatalogProducts.map((product) => [String(product.id), product]));
  const existingBySku = new Map(
    allCatalogProducts
      .filter((product) => String(product.sku || "").trim())
      .map((product) => [String(product.sku || "").trim().toUpperCase(), product])
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];
  let processed = 0;
  const totalRows = Math.max(0, parsedRows.length - 1);

  for (let rowIndex = 1; rowIndex < parsedRows.length; rowIndex += 1) {
    const row = parsedRows[rowIndex];
    if (!row || !row.some((cell) => String(cell || "").trim())) {
      continue;
    }
    const fieldType = String(csvValueFromRow(row, headerMap, "fieldtype", "rowtype") || "").trim().toLowerCase();
    if (fieldType && fieldType !== "product") {
      skipped += 1;
      continue;
    }

    let id;
    let sku;
    let payload;
    try {
      ({ id, sku, payload } = payloadFromCsvRow(row, headerMap));
      validateCsvPayload(rowIndex + 1, payload);
    } catch (rowError) {
      failed += 1;
      errors.push(String(rowError.message || `Row ${rowIndex + 1}: invalid data.`));
      continue;
    }

    const normalizedId = String(id || "").trim();
    const normalizedSku = String(sku || "").trim().toUpperCase();
    const matchById = normalizedId ? existingById.get(normalizedId) : null;
    const matchBySku = normalizedSku ? existingBySku.get(normalizedSku) : null;
    const matched = matchById || matchBySku;

    if (!isBackendOnline) {
      try {
        const offlineEditId = matched ? String(matched.id) : "";
        const compactPayload = buildCompactOfflinePayload(payload, "normal");
        const upserted = upsertCatalogProductOffline(offlineEditId, compactPayload);
        if (matched) {
          updated += 1;
        } else {
          created += 1;
        }
        if (upserted && upserted.id) {
          const nextId = String(upserted.id);
          existingById.set(nextId, upserted);
          const nextSku = String(upserted.sku || "").trim().toUpperCase();
          if (nextSku) {
            existingBySku.set(nextSku, upserted);
          }
        }
      } catch (offlineError) {
        try {
          const offlineEditId = matched ? String(matched.id) : "";
          const compactPayload = buildCompactOfflinePayload(payload, "aggressive");
          const upserted = upsertCatalogProductOffline(offlineEditId, compactPayload);
          if (matched) {
            updated += 1;
          } else {
            created += 1;
          }
          if (upserted && upserted.id) {
            const nextId = String(upserted.id);
            existingById.set(nextId, upserted);
            const nextSku = String(upserted.sku || "").trim().toUpperCase();
            if (nextSku) {
              existingBySku.set(nextSku, upserted);
            }
          }
        } catch (fallbackOfflineError) {
          failed += 1;
          errors.push(`Row ${rowIndex + 1}: ${fallbackOfflineError.message || "offline import failed"}`);
        }
      }
      processed += 1;
      if (onProgress && (processed % batchSize === 0 || processed === totalRows)) {
        onProgress({
          processed,
          total: totalRows,
          totalRows,
          created,
          updated,
          skipped,
          failed
        });
      }
      continue;
    }

    try {
      if (matched) {
        const response = await api(`/products/${encodeURIComponent(matched.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || `Row ${rowIndex + 1}: failed to update product.`);
        }
        updated += 1;
      } else {
        const response = await api("/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || `Row ${rowIndex + 1}: failed to create product.`);
        }
        created += 1;
      }
    } catch (error) {
      const message = String(error && error.message ? error.message : "");
      const isOffline = /failed to fetch|network|backend/i.test(message);
      if (!isOffline) {
        failed += 1;
        errors.push(`Row ${rowIndex + 1}: ${message || "import failed"}`);
        continue;
      }

      try {
        const offlineEditId = matched ? String(matched.id) : "";
        const compactPayload = buildCompactOfflinePayload(payload, "normal");
        const upserted = upsertCatalogProductOffline(offlineEditId, compactPayload);
        if (matched) {
          updated += 1;
        } else {
          created += 1;
        }
        if (upserted && upserted.id) {
          const nextId = String(upserted.id);
          existingById.set(nextId, upserted);
          const nextSku = String(upserted.sku || "").trim().toUpperCase();
          if (nextSku) {
            existingBySku.set(nextSku, upserted);
          }
        }
      } catch (offlineError) {
        try {
          const offlineEditId = matched ? String(matched.id) : "";
          const compactPayload = buildCompactOfflinePayload(payload, "aggressive");
          const upserted = upsertCatalogProductOffline(offlineEditId, compactPayload);
          if (matched) {
            updated += 1;
          } else {
            created += 1;
          }
          if (upserted && upserted.id) {
            const nextId = String(upserted.id);
            existingById.set(nextId, upserted);
            const nextSku = String(upserted.sku || "").trim().toUpperCase();
            if (nextSku) {
              existingBySku.set(nextSku, upserted);
            }
          }
        } catch (fallbackOfflineError) {
          failed += 1;
          errors.push(`Row ${rowIndex + 1}: ${fallbackOfflineError.message || "offline import failed"}`);
        }
      }
    }

    processed += 1;
    if (onProgress && (processed % batchSize === 0 || rowIndex === parsedRows.length - 1)) {
      onProgress({ processed, total: totalRows, totalRows, created, updated, skipped, failed });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return { created, updated, skipped, failed, errors };
}

async function normalizeCatalogMediaUrls() {
  const products = Array.isArray(allCatalogProducts) ? allCatalogProducts : [];
  if (!products.length) {
    setMessage("No products available to normalize.", true);
    return;
  }
  if (!window.confirm(`Normalize media URLs for ${products.length} product(s)?`)) {
    return;
  }

  if (normalizeMediaBtn) {
    normalizeMediaBtn.disabled = true;
  }
  try {
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];
    const BATCH_SIZE = 20;

    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];
      const payload = buildUpsertPayloadFromProduct(product);
      if (!hasMediaChanged(product, payload)) {
        skipped += 1;
        continue;
      }

      try {
        if (isBackendOnline) {
          const response = await api(`/products/${encodeURIComponent(product.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.message || `Failed updating ${product.id}`);
          }
        } else {
          upsertCatalogProductOffline(String(product.id || ""), payload);
        }
        updated += 1;
      } catch (error) {
        failed += 1;
        errors.push(String(error.message || `Failed updating ${product.id}`));
      }

      if ((index + 1) % BATCH_SIZE === 0 || index === products.length - 1) {
        setMessage(`Normalizing media URLs... ${index + 1}/${products.length} processed.`);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    await loadDashboard();
    if (failed > 0) {
      const firstError = errors.length ? ` First error: ${errors[0]}` : "";
      setMessage(`Media URL normalization completed with issues. Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}.${firstError}`, true);
    } else {
      setMessage(`Media URL normalization completed. Updated: ${updated}, Skipped: ${skipped}.`, false, {
        toast: true,
        title: "Media normalization completed",
        tone: "success",
        timeoutMs: 5200
      });
    }
  } catch (error) {
    setMessage(error.message || "Failed to normalize media URLs.", true);
  } finally {
    if (normalizeMediaBtn) {
      normalizeMediaBtn.disabled = false;
    }
  }
}

function getFilteredOrders() {
  const query = String(orderSearchAdmin.value || "").trim().toLowerCase();
  const status = String(orderStatusFilterAdmin.value || "all");
  return allOrders.filter((order) => {
    const id = String(order.id || "").toLowerCase();
    const items = orderItemsPreview(order).toLowerCase();
    const statusMatch = status === "all" || String(order.status || "processing") === status;
    const queryMatch = !query || id.includes(query) || items.includes(query);
    return statusMatch && queryMatch;
  });
}

function applyOrderFilters() {
  renderOrders(getFilteredOrders());
  adminOrderFilterChipController?.update();
}

async function fetchJson(path) {
  let response;
  try {
    response = await api(path);
  } catch (error) {
    if (error && error.message === "Admin session required") {
      throw error;
    }
    throw new Error("Unable to connect to backend. Start backend on port 4000.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

async function fetchInventorySettings() {
  try {
    return normalizeInventorySettings(await fetchJson("/admin/inventory-settings"), allCatalogProducts);
  } catch (error) {
    return loadInventorySettingsLocal(allCatalogProducts);
  }
}

function applyInventorySettings(settings, options = {}) {
  currentInventorySettings = normalizeInventorySettings(settings, allCatalogProducts);
  saveInventorySettingsLocal(currentInventorySettings);
  if (inventoryThresholdInput) {
    inventoryThresholdInput.value = String(currentInventorySettings.defaultLowStockThreshold);
  }
  if (inventoryRestockInput) {
    inventoryRestockInput.value = String(currentInventorySettings.restockTarget);
  }
  allCatalogProducts = applyInventorySettingsToProducts(allCatalogProducts);
  visibleCatalogProducts = applyInventorySettingsToProducts(visibleCatalogProducts);
  if (!options.skipRender) {
    applyCatalogFilters();
  }
}

async function saveInventorySettings() {
  const draft = buildInventorySettingsDraft();
  if (saveInventorySettingsBtn) {
    saveInventorySettingsBtn.disabled = true;
  }
  try {
    const response = await api("/admin/inventory-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save inventory settings.");
    }
    applyInventorySettings(data);
    setMessage("Inventory thresholds saved to admin settings.", false, {
      toast: true,
      title: "Inventory thresholds saved",
      tone: "success",
      timeoutMs: 4600
    });
  } catch (error) {
    applyInventorySettings(draft);
    setMessage(`Backend offline: inventory thresholds saved locally. ${error.message || ""}`.trim(), true);
  } finally {
    if (saveInventorySettingsBtn) {
      saveInventorySettingsBtn.disabled = false;
    }
  }
}

function resetInventorySettingsDraft() {
  applyInventorySettings(currentInventorySettings);
  setMessage("Inventory threshold draft reset to saved values.", false, {
    toast: true,
    title: "Inventory draft reset",
    tone: "info",
    timeoutMs: 4200
  });
}

async function loadDashboard() {
  if (!requireAdminSession()) {
    return;
  }

  setMessage("Loading dashboard...");
  setBackendStatus(false);
  refreshBtn.disabled = true;
  try {
    const [summary, usersPayload, salesPayload, catalogPayload, ordersPayload, analytics, backInStockPayload, inventorySettings, orderNotificationsPayload, adminAuditPayload, phoneVerificationAutomationPayload, afterSalesPayload] = await Promise.all([
      fetchJson("/admin/dashboard"),
      fetchJson("/admin/users"),
      fetchJson("/admin/sales"),
      fetchJson("/admin/catalog"),
      fetchJson("/admin/orders"),
      fetchJson("/admin/analytics"),
      fetchJson("/admin/back-in-stock/requests"),
      fetchInventorySettings(),
      fetchJson("/admin/order-notifications"),
      fetchJson("/admin/audit-trail"),
      fetchJson("/admin/phone-verification-automation"),
      fetchJson("/admin/after-sales")
    ]);

    updateSummary(summary);
    renderAnalytics(analytics);
    renderSales(salesPayload);
    allUsers = Array.isArray(usersPayload.users) ? usersPayload.users : [];
    const serverCatalogProducts = Array.isArray(catalogPayload.products) ? catalogPayload.products : [];
    allCatalogProducts = mergeCatalogProducts(serverCatalogProducts, localCatalogProductsFromStorage());
    catalogInventoryValue = Number(catalogPayload.totalInventoryValue || 0);
    applyInventorySettings(inventorySettings || catalogPayload.inventorySettings || defaultInventorySettings(), { skipRender: true });
    allOrders = Array.isArray(ordersPayload.orders) ? ordersPayload.orders : [];
    allAfterSalesCases = Array.isArray(afterSalesPayload.cases) ? afterSalesPayload.cases : [];
    currentAfterSalesSummary = afterSalesPayload.summary && typeof afterSalesPayload.summary === "object" ? afterSalesPayload.summary : {};
    applyUserFilters();
    syncCategorySelectOptions();
    syncProductCollectionSelectionFromInput();
    renderProductCollectionPicker();
    renderSourcingPanel();
    applyCatalogFilters();
    applyOrderFilters();
    hydrateBackInStockPayload(backInStockPayload);
    applyBackInStockFilters();
    renderInvoiceTracking(allOrders);
    renderOrderNotifications(orderNotificationsPayload);
    renderAdminAuditTrail(adminAuditPayload);
    renderPhoneVerificationAutomation(phoneVerificationAutomationPayload);
    renderAfterSales(afterSalesPayload);
    renderSellerCentralServices();
    setBackendStatus(true);
    setMessage("Dashboard and analytics are up to date.");
  } catch (error) {
    const fallback = getOfflineDashboardPayload();
    updateSummary(fallback.summary);
    renderAnalytics(fallback.analytics);
    renderSales(fallback.salesPayload);
    allUsers = Array.isArray(fallback.usersPayload.users) ? fallback.usersPayload.users : [];
    allCatalogProducts = Array.isArray(fallback.catalogPayload.products) ? fallback.catalogPayload.products : [];
    catalogInventoryValue = Number(fallback.catalogPayload.totalInventoryValue || 0);
    applyInventorySettings(loadInventorySettingsLocal(allCatalogProducts), { skipRender: true });
    allOrders = Array.isArray(fallback.ordersPayload.orders) ? fallback.ordersPayload.orders : [];
    applyUserFilters();
    syncCategorySelectOptions();
    syncProductCollectionSelectionFromInput();
    renderProductCollectionPicker();
    renderSourcingPanel();
    applyCatalogFilters();
    applyOrderFilters();
    const localBackInStock = loadBackInStockRequestsLocal();
    hydrateBackInStockPayload({
      requests: localBackInStock,
      demandByProduct: computeBackInStockDemand(localBackInStock)
    });
    allAfterSalesCases = [];
    currentAfterSalesSummary = {};
    applyBackInStockFilters();
    renderInvoiceTracking(allOrders);
    renderOrderNotifications({ notifications: [], counts: {} });
    renderAdminAuditTrail({ entries: [], summary: { categoryCounts: {} } });
    renderPhoneVerificationAutomation(fallback.phoneVerificationAutomationPayload);
    renderAfterSales({ cases: [], summary: {} });
    renderSellerCentralServices();
    setBackendStatus(false);
    setMessage("Backend offline: showing local admin data mode.", true);
  } finally {
    refreshBtn.disabled = false;
  }
}

async function updateOrderStatus(orderId, nextStatus, button) {
  button.disabled = true;
  try {
    const response = await api(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to update order status");
    }

    const notification = data && data.notification ? data.notification : null;
    const notificationLine = notification
      ? notification.skipped
        ? ` Notification: ${notification.reason || "skipped"}.`
        : notification.failed
          ? ` Notification failed.`
          : notification.delivered
            ? ` Notification sent.`
            : ""
      : "";
    const notificationIssue = Boolean(notification && (notification.failed || notification.skipped));
    setMessage(`Order ${orderId} updated to ${formatStatus(data.status)}.${notificationLine}`, false, {
      toast: true,
      title: "Order status updated",
      tone: notificationIssue ? "warning" : "success",
      timeoutMs: notificationIssue ? 6200 : 4600
    });
    await loadDashboard();
  } catch (error) {
    setMessage(error.message || "Failed to update order status.", true);
  } finally {
    button.disabled = false;
  }
}

refreshBtn.addEventListener("click", loadDashboard);
adminOrderFilterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: "#orders .panel-tools",
  getFilters: getActiveAdminOrderFilters,
  clearAll: () => {
    if (orderSearchAdmin) {
      orderSearchAdmin.value = "";
    }
    if (orderStatusFilterAdmin) {
      orderStatusFilterAdmin.value = "all";
    }
  },
  focusAfterClearAll: orderSearchAdmin,
  clearAllFeedback: "Removed all admin order filters. Focus moved to the order search input.",
  onChange: applyOrderFilters,
  getResultSummary: () => String(ordersMeta?.textContent || "").trim()
}) || null;
adminCatalogFilterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: "#catalog .panel-tools-3",
  getFilters: getActiveCatalogFilters,
  clearAll: () => {
    if (catalogSearch) {
      catalogSearch.value = "";
    }
    if (catalogCategoryFilter) {
      catalogCategoryFilter.value = "all";
    }
    if (catalogSegmentFilter) {
      catalogSegmentFilter.value = "all";
    }
    catalogStockFilterMode = "all";
    syncInventoryFilterButtons();
  },
  focusAfterClearAll: catalogSearch,
  clearAllFeedback: "Removed all product filters. Focus moved to the products search input.",
  onChange: applyCatalogFilters,
  getResultSummary: () => String(catalogMeta?.textContent || "").trim()
}) || null;
adminAfterSalesFilterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: "#afterSales .panel-tools-3",
  getFilters: getActiveAfterSalesFilters,
  clearAll: () => {
    if (afterSalesSearchInput) {
      afterSalesSearchInput.value = "";
    }
    if (afterSalesTypeFilter) {
      afterSalesTypeFilter.value = "all";
    }
    if (afterSalesStatusFilter) {
      afterSalesStatusFilter.value = "all";
    }
  },
  focusAfterClearAll: afterSalesSearchInput,
  clearAllFeedback: "Removed all after-sales filters. Focus moved to the search input.",
  onChange: () => renderAfterSales({ cases: allAfterSalesCases, summary: currentAfterSalesSummary }),
  getResultSummary: () => String(afterSalesMeta?.textContent || "").trim()
}) || null;
adminUserFilterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: "#users .panel-tools",
  getFilters: getActiveUserFilters,
  clearAll: () => {
    if (userSearch) {
      userSearch.value = "";
    }
    if (userRoleFilter) {
      userRoleFilter.value = "all";
    }
    if (userPhoneVerificationFilter) {
      userPhoneVerificationFilter.value = "all";
    }
  },
  focusAfterClearAll: userSearch,
  clearAllFeedback: "Removed all user filters. Focus moved to the user search input.",
  onChange: applyUserFilters,
  getResultSummary: () => String(usersMeta?.textContent || "").trim()
}) || null;
adminAuditFilterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: "#adminAuditTrail .panel-tools-3",
  getFilters: getActiveAdminAuditFilters,
  clearAll: () => {
    currentAdminAuditFilters.search = "";
    currentAdminAuditFilters.category = "all";
    if (adminAuditSearchInput) {
      adminAuditSearchInput.value = "";
    }
    if (adminAuditCategoryFilter) {
      adminAuditCategoryFilter.value = "all";
    }
  },
  focusAfterClearAll: adminAuditSearchInput,
  clearAllFeedback: "Removed all audit trail filters. Focus moved to the search input.",
  onChange: () => renderAdminAuditTrail({
    entries: allAdminAuditEntries,
    summary: buildAdminAuditSummary(allAdminAuditEntries)
  }),
  getResultSummary: () => String(adminAuditMeta?.textContent || "").trim()
}) || null;
userSearch.addEventListener("input", applyUserFilters);
userRoleFilter.addEventListener("change", applyUserFilters);
if (userPhoneVerificationFilter) {
  userPhoneVerificationFilter.addEventListener("change", applyUserFilters);
}
orderSearchAdmin.addEventListener("input", applyOrderFilters);
orderStatusFilterAdmin.addEventListener("change", applyOrderFilters);
if (afterSalesSearchInput) {
  afterSalesSearchInput.addEventListener("input", () => renderAfterSales({ cases: allAfterSalesCases, summary: currentAfterSalesSummary }));
}
if (afterSalesTypeFilter) {
  afterSalesTypeFilter.addEventListener("change", () => renderAfterSales({ cases: allAfterSalesCases, summary: currentAfterSalesSummary }));
}
if (afterSalesStatusFilter) {
  afterSalesStatusFilter.addEventListener("change", () => renderAfterSales({ cases: allAfterSalesCases, summary: currentAfterSalesSummary }));
}
if (createAfterSalesCaseBtn) {
  createAfterSalesCaseBtn.addEventListener("click", createAfterSalesCaseFromAdmin);
}
catalogSearch.addEventListener("input", applyCatalogFilters);
catalogCategoryFilter.addEventListener("change", applyCatalogFilters);
catalogSegmentFilter.addEventListener("change", applyCatalogFilters);
if (sourcingTypeFilter) {
  sourcingTypeFilter.addEventListener("change", renderSourcingPanel);
}
if (sourcingSearchInput) {
  sourcingSearchInput.addEventListener("input", renderSourcingPanel);
}
if (sourcingRefreshBtn) {
  sourcingRefreshBtn.addEventListener("click", () => {
    renderSourcingPanel();
    setMessage("Sourcing list refreshed.", false, {
      toast: true,
      title: "Sourcing refreshed",
      tone: "info",
      timeoutMs: 3600
    });
  });
}
if (sourcingQuickAllBtn) {
  sourcingQuickAllBtn.addEventListener("click", () => {
    if (sourcingTypeFilter) {
      sourcingTypeFilter.value = "all";
    }
    renderSourcingPanel();
  });
}
if (sourcingQuickPodBtn) {
  sourcingQuickPodBtn.addEventListener("click", () => {
    if (sourcingTypeFilter) {
      sourcingTypeFilter.value = "print-on-demand";
    }
    renderSourcingPanel();
  });
}
if (sourcingQuickDropBtn) {
  sourcingQuickDropBtn.addEventListener("click", () => {
    if (sourcingTypeFilter) {
      sourcingTypeFilter.value = "dropshipping";
    }
    renderSourcingPanel();
  });
}
if (sourcingList) {
  sourcingList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='add-sourcing-product'][data-source-id]");
    if (!button) {
      return;
    }
    const sourceId = String(button.getAttribute("data-source-id") || "").trim();
    if (!sourceId) {
      return;
    }
    addSourcingTemplateToCatalog(sourceId);
  });
}
if (inventoryThresholdInput) {
  inventoryThresholdInput.addEventListener("input", () => {
    readInventoryThreshold();
    applyCatalogFilters();
  });
}
if (inventoryRestockInput) {
  inventoryRestockInput.addEventListener("input", () => {
    readInventoryRestockTarget();
    renderInventoryThresholdManager(allCatalogProducts);
  });
}
bindInventoryToolbarButton(inventoryRefreshBtn, "refresh");
bindInventoryToolbarButton(inventoryShowAllBtn, "show-all");
bindInventoryToolbarButton(inventoryShowLowBtn, "show-low");
bindInventoryToolbarButton(inventoryShowOutBtn, "show-out");
bindInventoryToolbarButton(inventoryRestockSelectedBtn, "restock-selected");
bindInventoryToolbarButton(inventoryRestockVisibleBtn, "restock-visible");
if (inventoryAlertList) {
  inventoryAlertList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='inventory-restock-one']");
    if (!button) {
      return;
    }
    const productId = String(button.getAttribute("data-product-id") || "").trim();
    if (!productId) {
      return;
    }
    handleInventoryToolbarAction("restock-one", productId);
  });
}
if (inventoryThresholdList) {
  inventoryThresholdList.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches("input[data-category-threshold]")) {
      return;
    }
    target.value = String(Math.max(0, Math.floor(numberOrZero(target.value))));
    applyCatalogFilters();
  });
}
if (saveInventorySettingsBtn) {
  saveInventorySettingsBtn.addEventListener("click", saveInventorySettings);
}
if (resetInventorySettingsBtn) {
  resetInventorySettingsBtn.addEventListener("click", resetInventorySettingsDraft);
}
if (backInStockSearchInput) {
  backInStockSearchInput.addEventListener("input", applyBackInStockFilters);
}
if (backInStockStatusFilter) {
  backInStockStatusFilter.addEventListener("change", applyBackInStockFilters);
}
if (backInStockRefreshBtn) {
  backInStockRefreshBtn.addEventListener("click", refreshBackInStockRequests);
}
if (backInStockDemandList) {
  backInStockDemandList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='notify-back-in-stock']");
    if (!button) {
      return;
    }
    const productId = String(button.getAttribute("data-product-id") || "").trim();
    if (!productId) {
      return;
    }
    notifyBackInStockForProduct(productId);
  });
}
if (backInStockTableBody) {
  backInStockTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }
    const action = String(button.getAttribute("data-action") || "").trim();
    if (action === "notify-back-in-stock") {
      const productId = String(button.getAttribute("data-product-id") || "").trim();
      if (productId) {
        notifyBackInStockForProduct(productId);
      }
      return;
    }
    if (action === "close-back-in-stock-request") {
      const requestId = String(button.getAttribute("data-request-id") || "").trim();
      if (requestId) {
        setBackInStockRequestStatus(requestId, "closed");
      }
      return;
    }
    if (action === "reopen-back-in-stock-request") {
      const requestId = String(button.getAttribute("data-request-id") || "").trim();
      if (requestId) {
        setBackInStockRequestStatus(requestId, "open");
      }
    }
  });
}
if (catalogBulkAction) {
  catalogBulkAction.addEventListener("change", syncBulkCollectionsInputState);
}
if (addCategoryBtn) {
  addCategoryBtn.addEventListener("click", upsertCategory);
}
if (newCategoryInput) {
  newCategoryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      upsertCategory();
    }
  });
}
if (cancelCategoryEditBtn) {
  cancelCategoryEditBtn.addEventListener("click", () => {
    resetCategoryEditor();
    setCategoryManagerMessage("");
  });
}
if (categorySearchInput) {
  categorySearchInput.addEventListener("input", () => {
    renderCategoryManagerList();
  });
}
if (categoryStatusFilter) {
  categoryStatusFilter.addEventListener("change", () => {
    renderCategoryManagerList();
  });
}
if (categorySortInput) {
  categorySortInput.addEventListener("change", () => {
    renderCategoryManagerList();
  });
}
if (categoryRefreshBtn) {
  categoryRefreshBtn.addEventListener("click", () => {
    syncCategorySelectOptions();
    setCategoryManagerMessage("Category panel refreshed.");
  });
}
if (categoryExportBtn) {
  categoryExportBtn.addEventListener("click", exportCategoryCsv);
}
if (categoryImportBtn && categoryImportInput) {
  categoryImportBtn.addEventListener("click", () => {
    try {
      if (typeof categoryImportInput.showPicker === "function") {
        categoryImportInput.showPicker();
        return;
      }
    } catch (error) {
      // Fallback to click for browsers that do not allow showPicker.
    }
    categoryImportInput.click();
  });
  categoryImportInput.addEventListener("change", async (event) => {
    const [file] = Array.from(event.target.files || []);
    await handleCategoryImportFile(file);
    categoryImportInput.value = "";
  });
}
selectAllCatalogProducts.addEventListener("change", (event) => {
  toggleVisibleCatalogSelection(Boolean(event.target.checked));
});
applyCatalogBulkBtn.addEventListener("click", () => {
  const action = String(catalogBulkAction.value || "");
  const ids = Array.from(selectedCatalogProductIds.values());
  const collections = readBulkCollectionsInput();
  const needsCollections = action === "set_collections" || action === "add_collections";
  if (!action) {
    setMessage("Select a bulk action first.", true);
    return;
  }
  if (!ids.length) {
    setMessage("Select at least one product.", true);
    return;
  }
  if (needsCollections && !collections.length) {
    setMessage("Enter collections for selected bulk action.", true);
    return;
  }
  applyCatalogBulkAction(action, ids, { collections });
});
clearCatalogSelectionBtn.addEventListener("click", () => {
  clearCatalogSelection();
  setMessage("Product selection cleared.", false, {
    toast: true,
    title: "Selection cleared",
    tone: "info",
    timeoutMs: 3200
  });
});
exportCatalogBtn.addEventListener("click", exportCatalogCsv);
if (downloadCleanCatalogCsvBtn) {
  downloadCleanCatalogCsvBtn.addEventListener("click", () => {
    downloadCleanCatalogCsv();
  });
}
if (importCatalogBtn && importCatalogFileInput) {
  importCatalogBtn.addEventListener("click", () => {
    try {
      if (typeof importCatalogFileInput.showPicker === "function") {
        importCatalogFileInput.showPicker();
        return;
      }
    } catch (error) {
      // Fallback to click for browsers that do not allow showPicker.
    }
    importCatalogFileInput.click();
  });
  importCatalogFileInput.addEventListener("change", async (event) => {
    const [file] = Array.from(event.target.files || []);
    if (!file) {
      return;
    }
    if (!String(file.name || "").toLowerCase().endsWith(".csv")) {
      setMessage("Please choose a valid CSV file.", true);
      importCatalogFileInput.value = "";
      return;
    }
    if (Number(file.size || 0) > MAX_IMPORT_CSV_BYTES) {
      setMessage(`CSV file is too large (${MAX_IMPORT_CSV_MB}+ MB). Split the file and import in smaller batches.`, true);
      importCatalogFileInput.value = "";
      return;
    }

    importCatalogBtn.disabled = true;
    try {
      const csvBuffer = await file.arrayBuffer();
      const csvText = decodeCsvTextFromFile(csvBuffer);
      const parsedRows = parseCsvText(csvText);
      renderCsvImportPreview(file.name, parsedRows);
      if (parsedRows.length < 2) {
        setMessage("CSV preview loaded, but no product data rows were found. Check delimiter/header format.", true);
        return;
      }
      const proceed = window.confirm(`Preview loaded for "${file.name}". Continue importing ${Math.max(0, parsedRows.length - 1)} row(s)?`);
      if (!proceed) {
        setMessage("CSV import cancelled after preview.", false, {
          toast: true,
          title: "CSV import cancelled",
          tone: "info",
          timeoutMs: 4200
        });
        return;
      }

      setMessage(`Importing CSV: ${file.name}`);
      const result = await importCatalogCsvFile(file, parsedRows, {
        batchSize: 25,
        onProgress: ({ processed, total, created, updated, skipped, failed }) => {
          setMessage(`Importing CSV... ${processed}/${total} rows. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
        }
      });
      catalogSearch.value = "";
      catalogCategoryFilter.value = "all";
      catalogSegmentFilter.value = "all";
      clearCatalogSelection();
      await loadDashboard();
      if (result.failed > 0) {
        const firstError = Array.isArray(result.errors) && result.errors.length ? ` First error: ${result.errors[0]}` : "";
        setMessage(`CSV import completed with issues. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped || 0}, Failed: ${result.failed}.${firstError}`, true);
      } else {
        setMessage(`CSV import completed. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped || 0}.`, false, {
          toast: true,
          title: "CSV import completed",
          tone: "success",
          timeoutMs: 5600
        });
      }
    } catch (error) {
      setMessage(error.message || "CSV import failed.", true);
    } finally {
      importCatalogBtn.disabled = false;
      importCatalogFileInput.value = "";
    }
  });
} else {
  setMessage("CSV import controls are unavailable. Reload this page.", true);
}
if (normalizeMediaBtn) {
  normalizeMediaBtn.addEventListener("click", () => {
    normalizeCatalogMediaUrls();
  });
}
if (productCollectionsInput) {
  productCollectionsInput.addEventListener("input", () => {
    syncProductCollectionSelectionFromInput();
    renderProductCollectionPicker();
  });
}
if (productCategoryInput) {
  productCategoryInput.addEventListener("change", () => {
    syncProductCollectionSelectionFromInput();
    renderProductCollectionPicker();
  });
}
if (productCollectionOptionList) {
  productCollectionOptionList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) {
      return;
    }
    const collectionValue = normalizeCategoryValue(checkbox.value || "");
    if (!collectionValue) {
      return;
    }
    if (checkbox.checked) {
      selectedProductCollections.add(collectionValue);
    } else {
      selectedProductCollections.delete(collectionValue);
    }
    syncCollectionsInputFromSelection();
    renderProductCollectionPicker();
  });
}
if (addProductCollectionCustomBtn) {
  addProductCollectionCustomBtn.addEventListener("click", addCustomCollectionFromInput);
}
if (productCollectionCustomInput) {
  productCollectionCustomInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomCollectionFromInput();
    }
  });
}
if (addProductDefinitionBtn) {
  addProductDefinitionBtn.addEventListener("click", appendCustomDefinitionToDescription);
}
if (productDefinitionInput) {
  productDefinitionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      appendCustomDefinitionToDescription();
    }
  });
}
productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  upsertCatalogProduct();
});
cancelProductEditBtn.addEventListener("click", resetProductForm);
if (retryDriveUploadBtn) {
  retryDriveUploadBtn.addEventListener("click", () => {
    retryPendingDriveUploads();
  });
}
if (productImageFileInput) {
  productImageFileInput.addEventListener("change", async (event) => {
    const selectedFiles = Array.from((event.target.files || []));
    const existingMedia = readGalleryImagesFromForm();
    const remainingSlots = Math.max(0, MAX_PRODUCT_IMAGES - existingMedia.length);
    const files = selectedFiles.slice(0, remainingSlots || MAX_PRODUCT_IMAGES);
    if (!files.length) {
      if (!selectedFiles.length) {
        setProductImagePreview(productImageInput.value || "");
        renderMediaStudio();
      } else {
        setProductFormMessage(`You can add maximum ${MAX_PRODUCT_IMAGES} files. Remove some media first.`, true);
      }
      return;
    }
    if (existingMedia.length >= MAX_PRODUCT_IMAGES) {
      setProductFormMessage(`Already ${MAX_PRODUCT_IMAGES} files added. Remove some media first.`, true);
      productImageFileInput.value = "";
      return;
    }
    if (selectedFiles.length > remainingSlots) {
      setProductFormMessage(`Only ${remainingSlots} more file(s) can be added. Keeping first ${remainingSlots}.`, true);
    }

    const invalidFile = files.find((file) => !inferUploadFileType(file));
    if (invalidFile) {
      setProductFormMessage("Please select valid image/video files (MP4, MOV, WEBM, AVI, MKV, JPG, PNG, WEBP).", true);
      productImageFileInput.value = "";
      return;
    }

    const oversizedFile = files.find((file) => {
      const uploadType = inferUploadFileType(file);
      const maxBytes = uploadType === "video"
        ? MAX_UPLOAD_VIDEO_MB * 1024 * 1024
        : MAX_UPLOAD_IMAGE_MB * 1024 * 1024;
      return Number(file.size || 0) > maxBytes;
    });
    if (oversizedFile) {
      const uploadType = inferUploadFileType(oversizedFile);
      const maxMb = uploadType === "video" ? MAX_UPLOAD_VIDEO_MB : MAX_UPLOAD_IMAGE_MB;
      setProductFormMessage(`"${oversizedFile.name}" is over ${maxMb} MB. Use smaller media.`, true);
      productImageFileInput.value = "";
      return;
    }

    const totalSize = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
    if (totalSize > MAX_UPLOAD_BATCH_MB * 1024 * 1024) {
      setProductFormMessage(`Total selected media size is too large. Keep this batch under ${MAX_UPLOAD_BATCH_MB} MB.`, true);
      productImageFileInput.value = "";
      return;
    }

    try {
      setPendingDriveRetryUploads([], "");
      const uploadPayload = await buildDriveUploadPayload(files);
      const uploadCategory = normalizeCategoryValue(productCategoryInput ? productCategoryInput.value : "");
      let nextMedia = [];
      let uploadedToDrive = false;
      let fallbackReason = "";
      resetMediaUploadProgress();

      try {
        nextMedia = await uploadPayloadToGoogleDrive(uploadPayload, {
          category: uploadCategory,
          onProgress: ({ current, total, stage }) => {
            if (stage === "uploading") {
              updateMediaUploadProgress(current - 1, total, "Uploading to Google Drive");
              setProductFormMessage(`Uploading to Google Drive... ${Math.max(0, current - 1)}/${total}`);
              return;
            }
            updateMediaUploadProgress(current, total, "Uploaded");
            setProductFormMessage(`Uploaded to Google Drive... ${current}/${total}`);
          }
        });
        uploadedToDrive = true;
      } catch (error) {
        const uploadedUrls = Array.isArray(error.uploadedUrls) ? error.uploadedUrls : [];
        const failedAt = Number.isFinite(error.failedIndex) ? error.failedIndex : uploadedUrls.length;
        const fallbackLocalMedia = uploadPayload
          .slice(Math.max(0, failedAt))
          .map((item) => String(item.dataUrl || ""))
          .filter(Boolean);
        nextMedia = [...uploadedUrls, ...fallbackLocalMedia];
        const pendingFiles = uploadPayload.slice(Math.max(0, failedAt));
        setPendingDriveRetryUploads(pendingFiles, uploadCategory);
        fallbackReason = error && error.message ? error.message : "Google Drive upload unavailable.";
        updateMediaUploadProgress(nextMedia.length, uploadPayload.length, "Finalized with local fallback");
      }

      const mergedMedia = [...existingMedia, ...nextMedia].slice(0, MAX_PRODUCT_IMAGES);
      uploadedProductMediaDataUrls = mergedMedia;
      const firstNewMedia = String(nextMedia[0] || "");
      if (!String(productImageInput.value || "").trim()) {
        productImageInput.value = mergedMedia[0] || firstNewMedia;
      }
      const inputs = getGalleryInputs();
      if (inputs.length && mergedMedia.length) {
        inputs.forEach((input, index) => {
          input.value = mergedMedia[index] || "";
        });
      }

      const statusText = uploadedToDrive
        ? `${files.length} file(s) uploaded to Google Drive. Total: ${mergedMedia.length}/${MAX_PRODUCT_IMAGES}.`
        : `${files.length} file(s) added in local mode. Total: ${mergedMedia.length}/${MAX_PRODUCT_IMAGES}.`;
      setProductImagePreview(firstNewMedia || productImageInput.value || "", statusText);
      renderMediaStudio();

      if (uploadedToDrive) {
        setPendingDriveRetryUploads([], "");
        setProductFormMessage("");
      } else {
        setProductFormMessage(`${fallbackReason} Files were added locally for now.`);
      }
      resetMediaUploadProgress();
      productImageFileInput.value = "";
    } catch (error) {
      resetMediaUploadProgress();
      setProductFormMessage(error.message || "Unable to process media file.", true);
      productImageFileInput.value = "";
    }
  });
}
if (productImageInput) {
  productImageInput.addEventListener("input", () => {
    const value = normalizeImageUrl(productImageInput.value || "");
    productImageInput.value = value;
    uploadedProductMediaDataUrls = [];
    const inputs = getGalleryInputs();
    if (inputs.length && value) {
      inputs[0].value = value;
    }
    setProductImagePreview(value);
    renderMediaStudio();
  });
}
if (productGalleryFields) {
  productGalleryFields.addEventListener("input", (event) => {
    const target = event.target.closest("input[data-gallery-index]");
    if (!target) {
      return;
    }
    const index = Number(target.getAttribute("data-gallery-index") || 0);
    const normalized = normalizeImageUrl(target.value || "");
    target.value = normalized;
    if (index === 0) {
      const firstMedia = normalized;
      if (firstMedia) {
        productImageInput.value = firstMedia;
        uploadedProductMediaDataUrls = [];
        setProductImagePreview(firstMedia);
      }
    }
    renderMediaStudio();
  });
}
if (mediaStudioGrid) {
  mediaStudioGrid.addEventListener("click", (event) => {
    const actionBtn = event.target.closest("button[data-action]");
    if (!actionBtn) {
      return;
    }
    const action = actionBtn.getAttribute("data-action");
    const index = Number(actionBtn.getAttribute("data-index"));
    if (!Number.isFinite(index) || index < 0) {
      return;
    }
    const mediaItems = readGalleryImagesFromForm();
    const selectedMedia = mediaItems[index] || "";

    if (action === "set-cover" && selectedMedia) {
      productImageInput.value = selectedMedia;
      uploadedProductMediaDataUrls = [];
      setProductImagePreview(selectedMedia, "Cover media updated.");
      renderMediaStudio();
      return;
    }

    if (action === "edit-media") {
      if (!selectedMedia) {
        return;
      }
      if (!isImageMedia(selectedMedia)) {
        studioSetHint("Video editing is not available in canvas mode. Use image media for editing.");
        if (photoStudioEditor) {
          photoStudioEditor.hidden = true;
        }
        return;
      }
      activeStudioIndex = index;
      studioEraserEnabled = false;
      if (studioEraserToggleBtn) {
        studioEraserToggleBtn.textContent = "Enable Eraser";
      }
      renderStudioImage(selectedMedia);
      return;
    }

    if (action === "remove-media") {
      const nextMedia = mediaItems.filter((_, itemIndex) => itemIndex !== index);
      setGalleryImagesOnForm(nextMedia);
      uploadedProductMediaDataUrls = [];
      const currentCover = normalizeImageUrl(productImageInput.value || "");
      if (!currentCover || currentCover === selectedMedia) {
        productImageInput.value = nextMedia[0] || "";
        setProductImagePreview(productImageInput.value || "", nextMedia.length ? "Cover media updated." : "");
      }
      if (activeStudioIndex === index) {
        activeStudioIndex = -1;
        studioOriginalImageDataUrl = "";
        studioCurrentImageDataUrl = "";
        if (photoStudioEditor) {
          photoStudioEditor.hidden = true;
        }
      }
      renderMediaStudio();
    }
  });
}

if (photoStudioCanvas) {
  photoStudioCanvas.addEventListener("pointerdown", (event) => {
    if (studioCustomCropMode) {
      studioPointerDown = true;
      const point = canvasRelativePoint(event);
      studioCropPointerStart = point;
      studioCropSelection = { x: point.x, y: point.y, width: 1, height: 1 };
      drawStudioCropOverlay().catch(() => {});
      return;
    }
    if (!studioEraserEnabled) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    const rect = photoStudioCanvas.getBoundingClientRect();
    const scaleX = photoStudioCanvas.width / Math.max(1, rect.width);
    const scaleY = photoStudioCanvas.height / Math.max(1, rect.height);
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const radius = Number(studioEraserSizeInput?.value || 24);
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
  });
  photoStudioCanvas.addEventListener("pointermove", (event) => {
    if (!studioCustomCropMode || !studioPointerDown || !studioCropPointerStart) {
      return;
    }
    const current = canvasRelativePoint(event);
    const left = Math.min(studioCropPointerStart.x, current.x);
    const top = Math.min(studioCropPointerStart.y, current.y);
    const width = Math.abs(current.x - studioCropPointerStart.x);
    const height = Math.abs(current.y - studioCropPointerStart.y);
    studioCropSelection = { x: left, y: top, width, height };
    drawStudioCropOverlay().catch(() => {});
  });
  photoStudioCanvas.addEventListener("pointerup", () => {
    if (!studioCustomCropMode) {
      return;
    }
    studioPointerDown = false;
    studioCropPointerStart = null;
  });
  photoStudioCanvas.addEventListener("pointerleave", () => {
    if (!studioCustomCropMode) {
      return;
    }
    studioPointerDown = false;
    studioCropPointerStart = null;
  });
}
if (studioCropSquareBtn) {
  studioCropSquareBtn.addEventListener("click", () => {
    applyStudioCrop(1).then(() => {
      studioSetHint("Crop 1:1 applied.");
    }).catch(() => {
      studioSetHint("Unable to crop image.");
    });
  });
}
if (studioCrop43Btn) {
  studioCrop43Btn.addEventListener("click", () => {
    applyStudioCrop(4 / 3).then(() => {
      studioSetHint("Crop 4:3 applied.");
    }).catch(() => {
      studioSetHint("Unable to crop image.");
    });
  });
}
if (studioCrop169Btn) {
  studioCrop169Btn.addEventListener("click", () => {
    applyStudioCrop(16 / 9).then(() => {
      studioSetHint("Crop 16:9 applied.");
    }).catch(() => {
      studioSetHint("Unable to crop image.");
    });
  });
}
if (studioCustomCropToggleBtn) {
  studioCustomCropToggleBtn.addEventListener("click", () => {
    studioCustomCropMode = !studioCustomCropMode;
    if (studioCustomCropMode) {
      studioEraserEnabled = false;
      if (studioEraserToggleBtn) {
        studioEraserToggleBtn.textContent = "Enable Eraser";
      }
      studioCustomCropToggleBtn.textContent = "Cancel Crop";
      studioSetHint("Custom crop enabled. Drag on canvas to select area, then click Apply Custom.");
      return;
    }
    studioCropSelection = null;
    studioCustomCropToggleBtn.textContent = "Custom Crop";
    redrawStudioCanvasBase().catch(() => {});
    studioSetHint("Custom crop cancelled.");
  });
}
if (studioApplyCustomCropBtn) {
  studioApplyCustomCropBtn.addEventListener("click", () => {
    applyCustomStudioCrop().catch(() => {
      studioSetHint("Unable to apply custom crop.");
    });
  });
}
if (studioExtendBtn) {
  studioExtendBtn.addEventListener("click", async () => {
    if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
      return;
    }
    const source = await loadImageElement(studioCurrentImageDataUrl);
    const padding = 60;
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    photoStudioCanvas.width = source.width + padding * 2;
    photoStudioCanvas.height = source.height + padding * 2;
    context.fillStyle = String(studioBackgroundInput?.value || "#ffffff");
    context.fillRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
    context.drawImage(source, padding, padding);
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/jpeg", 0.9);
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Extend applied.");
  });
}
if (studioRotateLeftBtn) {
  studioRotateLeftBtn.addEventListener("click", async () => {
    if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
      return;
    }
    const source = await loadImageElement(studioCurrentImageDataUrl);
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    photoStudioCanvas.width = source.height;
    photoStudioCanvas.height = source.width;
    context.save();
    context.translate(0, photoStudioCanvas.height);
    context.rotate(-Math.PI / 2);
    context.drawImage(source, 0, 0);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Rotated left.");
  });
}
if (studioRotateRightBtn) {
  studioRotateRightBtn.addEventListener("click", async () => {
    if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
      return;
    }
    const source = await loadImageElement(studioCurrentImageDataUrl);
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    photoStudioCanvas.width = source.height;
    photoStudioCanvas.height = source.width;
    context.save();
    context.translate(photoStudioCanvas.width, 0);
    context.rotate(Math.PI / 2);
    context.drawImage(source, 0, 0);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Rotated right.");
  });
}
if (studioFlipHorizontalBtn) {
  studioFlipHorizontalBtn.addEventListener("click", async () => {
    if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
      return;
    }
    const source = await loadImageElement(studioCurrentImageDataUrl);
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    photoStudioCanvas.width = source.width;
    photoStudioCanvas.height = source.height;
    context.save();
    context.translate(photoStudioCanvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(source, 0, 0);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Flipped horizontally.");
  });
}
if (studioFlipVerticalBtn) {
  studioFlipVerticalBtn.addEventListener("click", async () => {
    if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
      return;
    }
    const source = await loadImageElement(studioCurrentImageDataUrl);
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    photoStudioCanvas.width = source.width;
    photoStudioCanvas.height = source.height;
    context.save();
    context.translate(0, photoStudioCanvas.height);
    context.scale(1, -1);
    context.drawImage(source, 0, 0);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Flipped vertically.");
  });
}
if (studioBrightnessInput) {
  studioBrightnessInput.addEventListener("change", () => {
    applyStudioFilterAdjustments().catch(() => {
      studioSetHint("Unable to apply adjustments.");
    });
  });
}
if (studioContrastInput) {
  studioContrastInput.addEventListener("change", () => {
    applyStudioFilterAdjustments().catch(() => {
      studioSetHint("Unable to apply adjustments.");
    });
  });
}
if (studioSaturationInput) {
  studioSaturationInput.addEventListener("change", () => {
    applyStudioFilterAdjustments().catch(() => {
      studioSetHint("Unable to apply adjustments.");
    });
  });
}
if (studioFilterPreset) {
  studioFilterPreset.addEventListener("change", () => {
    applyStudioFilterAdjustments().catch(() => {
      studioSetHint("Unable to apply filter.");
    });
  });
}
if (studioBlurInput) {
  studioBlurInput.addEventListener("change", async () => {
    if (!studioCurrentImageDataUrl || !photoStudioCanvas) {
      return;
    }
    const blurValue = Number(studioBlurInput.value || 0);
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    const source = await loadImageElement(studioCurrentImageDataUrl);
    context.save();
    context.clearRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
    context.filter = blurValue > 0 ? `blur(${blurValue}px)` : "none";
    context.drawImage(source, 0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint(blurValue > 0 ? "Blur applied." : "Blur removed.");
  });
}
if (studioApplySharpenBtn) {
  studioApplySharpenBtn.addEventListener("click", () => {
    applyConvolutionKernel([
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]).then(() => {
      studioSetHint("Sharpen applied.");
    }).catch(() => {
      studioSetHint("Unable to sharpen image.");
    });
  });
}
if (studioApplyVignetteBtn) {
  studioApplyVignetteBtn.addEventListener("click", () => {
    if (!photoStudioCanvas) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    const cx = photoStudioCanvas.width / 2;
    const cy = photoStudioCanvas.height / 2;
    const radius = Math.max(photoStudioCanvas.width, photoStudioCanvas.height) * 0.68;
    const gradient = context.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.45)");
    context.save();
    context.fillStyle = gradient;
    context.fillRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Vignette applied.");
  });
}
if (studioEraserToggleBtn) {
  studioEraserToggleBtn.addEventListener("click", () => {
    studioEraserEnabled = !studioEraserEnabled;
    if (studioEraserEnabled) {
      studioCustomCropMode = false;
      studioCropSelection = null;
      if (studioCustomCropToggleBtn) {
        studioCustomCropToggleBtn.textContent = "Custom Crop";
      }
    }
    studioEraserToggleBtn.textContent = studioEraserEnabled ? "Disable Eraser" : "Enable Eraser";
    studioSetHint(studioEraserEnabled ? "Eraser enabled. Click on image to erase." : "Eraser disabled.");
  });
}
if (studioAddTextBtn) {
  studioAddTextBtn.addEventListener("click", () => {
    if (!photoStudioCanvas || !studioCurrentImageDataUrl) {
      return;
    }
    const text = String(studioTextInput?.value || "").trim();
    if (!text) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    context.save();
    context.font = "bold 38px Arial";
    context.fillStyle = "#ffffff";
    context.strokeStyle = "rgba(0,0,0,0.45)";
    context.lineWidth = 3;
    const x = 30;
    const y = Math.max(50, photoStudioCanvas.height - 40);
    context.strokeText(text, x, y);
    context.fillText(text, x, y);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Text added.");
  });
}
if (studioAddDecorativeBtn) {
  studioAddDecorativeBtn.addEventListener("click", () => {
    if (!photoStudioCanvas || !studioCurrentImageDataUrl) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    context.save();
    context.fillStyle = "#f59e0b";
    context.fillRect(16, 16, 140, 40);
    context.fillStyle = "#111827";
    context.font = "bold 18px Arial";
    context.fillText("Best Seller", 28, 42);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Decorative badge added.");
  });
}
if (studioAddStickerBtn) {
  studioAddStickerBtn.addEventListener("click", () => {
    if (!photoStudioCanvas || !studioCurrentImageDataUrl) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    const cx = photoStudioCanvas.width - 70;
    const cy = 70;
    context.save();
    context.fillStyle = "#ef4444";
    context.beginPath();
    context.arc(cx, cy, 44, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffffff";
    context.font = "bold 14px Arial";
    context.textAlign = "center";
    context.fillText("SALE", cx, cy + 5);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Sticker added.");
  });
}
if (studioApplyOverlayBtn) {
  studioApplyOverlayBtn.addEventListener("click", () => {
    if (!photoStudioCanvas || !studioCurrentImageDataUrl) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    const alpha = Math.min(0.8, Math.max(0, Number(studioOverlayOpacityInput?.value || 0) / 100));
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = String(studioOverlayColorInput?.value || "#000000");
    context.fillRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Overlay applied.");
  });
}
if (studioApplyBackgroundBtn) {
  studioApplyBackgroundBtn.addEventListener("click", () => {
    if (!photoStudioCanvas || !studioCurrentImageDataUrl) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    const sourceDataUrl = photoStudioCanvas.toDataURL("image/png");
    loadImageElement(sourceDataUrl).then((image) => {
      context.clearRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
      context.fillStyle = String(studioBackgroundInput?.value || "#ffffff");
      context.fillRect(0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
      context.drawImage(image, 0, 0, photoStudioCanvas.width, photoStudioCanvas.height);
      studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/jpeg", 0.9);
      pushStudioHistory(studioCurrentImageDataUrl);
      studioSetHint("Background updated.");
    }).catch(() => {
      studioSetHint("Unable to apply background.");
    });
  });
}
if (studioApplyBorderBtn) {
  studioApplyBorderBtn.addEventListener("click", () => {
    if (!photoStudioCanvas || !studioCurrentImageDataUrl) {
      return;
    }
    const context = getPhotoStudioContext();
    if (!context) {
      return;
    }
    const borderSize = Number(studioBorderSizeInput?.value || 0);
    if (borderSize <= 0) {
      studioSetHint("Increase border size to apply border.");
      return;
    }
    context.save();
    context.strokeStyle = String(studioBorderColorInput?.value || "#111827");
    context.lineWidth = borderSize;
    context.strokeRect(borderSize / 2, borderSize / 2, photoStudioCanvas.width - borderSize, photoStudioCanvas.height - borderSize);
    context.restore();
    studioCurrentImageDataUrl = photoStudioCanvas.toDataURL("image/png");
    pushStudioHistory(studioCurrentImageDataUrl);
    studioSetHint("Border applied.");
  });
}
if (studioUndoBtn) {
  studioUndoBtn.addEventListener("click", () => {
    if (studioHistoryIndex <= 0) {
      studioSetHint("Nothing to undo.");
      return;
    }
    studioHistoryIndex -= 1;
    restoreStudioSnapshot(studioHistoryIndex).then(() => {
      studioSetHint("Undo applied.");
    }).catch(() => {
      studioSetHint("Undo failed.");
    });
  });
}
if (studioRedoBtn) {
  studioRedoBtn.addEventListener("click", () => {
    if (studioHistoryIndex >= studioHistory.length - 1) {
      studioSetHint("Nothing to redo.");
      return;
    }
    studioHistoryIndex += 1;
    restoreStudioSnapshot(studioHistoryIndex).then(() => {
      studioSetHint("Redo applied.");
    }).catch(() => {
      studioSetHint("Redo failed.");
    });
  });
}
if (studioDownloadBtn) {
  studioDownloadBtn.addEventListener("click", () => {
    if (!studioCurrentImageDataUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = studioCurrentImageDataUrl;
    link.download = `photo-studio-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    studioSetHint("Edited image downloaded.");
  });
}
if (studioResetBtn) {
  studioResetBtn.addEventListener("click", () => {
    if (!studioOriginalImageDataUrl) {
      return;
    }
    renderStudioImage(studioOriginalImageDataUrl);
    if (studioBrightnessInput) studioBrightnessInput.value = "100";
    if (studioContrastInput) studioContrastInput.value = "100";
    if (studioSaturationInput) studioSaturationInput.value = "100";
    if (studioFilterPreset) studioFilterPreset.value = "none";
    if (studioBlurInput) studioBlurInput.value = "0";
    studioEraserEnabled = false;
    studioCropSelection = null;
    studioCustomCropMode = false;
    if (studioEraserToggleBtn) {
      studioEraserToggleBtn.textContent = "Enable Eraser";
    }
    if (studioCustomCropToggleBtn) {
      studioCustomCropToggleBtn.textContent = "Custom Crop";
    }
    studioSetHint("Editor reset.");
  });
}
if (studioSaveBtn) {
  studioSaveBtn.addEventListener("click", () => {
    if (!studioCurrentImageDataUrl) {
      return;
    }
    updateStudioMediaSlot(studioCurrentImageDataUrl);
    studioOriginalImageDataUrl = studioCurrentImageDataUrl;
    studioSetHint("Saved to product media.");
  });
}

ensureGalleryInputs();
syncPrimaryImageFromGallery();

ordersTableBody.addEventListener("click", (event) => {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) {
    return;
  }
  const action = actionButton.getAttribute("data-action");
  if (action === "open-after-sales-case") {
    const orderId = actionButton.getAttribute("data-order-id");
    if (!orderId) {
      return;
    }
    prefillAfterSalesOrder(orderId, "return");
    return;
  }
  const button = action === "update-order-status" ? actionButton : null;
  if (!button) {
    return;
  }
  const orderId = button.getAttribute("data-order-id");
  if (!orderId) {
    return;
  }
  const select = ordersTableBody.querySelector(`select.status-select[data-order-id='${orderId}']`);
  if (!select) {
    return;
  }
  updateOrderStatus(orderId, select.value, button);
});

if (afterSalesTableBody) {
  afterSalesTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='update-after-sales-status']");
    if (!button) {
      return;
    }
    const caseId = button.getAttribute("data-case-id");
    if (!caseId) {
      return;
    }
    const select = afterSalesTableBody.querySelector(`select.status-select[data-case-id='${caseId}']`);
    if (!select) {
      return;
    }
    updateAfterSalesCaseStatus(caseId, select.value, button);
  });
}

function handleCatalogRowAction(action, productId, actionBtn) {
  const selectedProduct = allCatalogProducts.find((product) => String(product.id) === String(productId))
    || visibleCatalogProducts.find((product) => String(product.id) === String(productId))
    || loadJsonStorage(CATALOG_STORAGE_KEY, {})[String(productId)];
  if (action === "view-product") {
    const detailUrl = productDetailUrl(productId);
    const opened = window.open(detailUrl, "_blank", "noopener");
    if (!opened) {
      window.location.href = detailUrl;
    }
    return;
  }

  if (action === "edit-product") {
    if (!selectedProduct) {
      setMessage("Unable to load selected product for editing.", true);
      return;
    }
    fillProductForm(selectedProduct);
    const catalogSection = document.getElementById("catalog");
    if (catalogSection) {
      window.scrollTo({ top: catalogSection.offsetTop - 16, behavior: "smooth" });
    }
    return;
  }

  if (action === "delete-product") {
    removeCatalogProduct(productId);
    return;
  }

  if (action === "duplicate-product") {
    duplicateCatalogProduct(productId);
    return;
  }

  if (action === "toggle-featured") {
    const nextAction = actionBtn.getAttribute("data-next-action");
    applyCatalogBulkAction(nextAction, [productId]);
    return;
  }
}

function sanitizeMenuItem(item) {
  const label = String(item?.label || "").trim();
  let href = String(item?.href || "").trim();
  if (!label || !href) {
    return null;
  }
  if (!/^(https?:\/\/|\/|[a-z0-9._-]+\.html(?:\?.*)?$)/i.test(href)) {
    href = `${href}.html`;
  }
  return {
    label,
    href,
    visible: item?.visible !== false
  };
}

function getWebsiteMenuItems() {
  const raw = loadJsonStorage(MENU_STORAGE_KEY, DEFAULT_WEBSITE_MENU);
  const list = (Array.isArray(raw) ? raw : []).map(sanitizeMenuItem).filter(Boolean);
  return list.length ? list : DEFAULT_WEBSITE_MENU.slice();
}

function saveWebsiteMenuItems(items) {
  try {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    return false;
  }
  return true;
}

function setMenuManagerMessage(text, isError = false) {
  if (!menuManagerMessage) {
    return;
  }
  menuManagerMessage.textContent = text;
  menuManagerMessage.classList.toggle("error", Boolean(isError));
}

function resetMenuEditor() {
  if (menuEditIndexInput) {
    menuEditIndexInput.value = "";
  }
  if (menuLabelInput) {
    menuLabelInput.value = "";
  }
  if (menuHrefInput) {
    menuHrefInput.value = "";
  }
  if (menuVisibleInput) {
    menuVisibleInput.checked = true;
  }
  if (menuAddBtn) {
    menuAddBtn.textContent = "Add Link";
  }
}

function renderWebsiteMenuManager() {
  if (!menuTableBody) {
    return;
  }
  const items = getWebsiteMenuItems();
  menuTableBody.innerHTML = items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.label)}</td>
      <td>${escapeHtml(item.href)}</td>
      <td>${item.visible === false ? "Hidden" : "Visible"}</td>
      <td>
        <div class="menu-actions">
          <button type="button" class="secondary-btn" data-action="menu-edit" data-index="${index}">Edit</button>
          <button type="button" class="secondary-btn" data-action="menu-toggle-visible" data-index="${index}">${item.visible === false ? "Show" : "Hide"}</button>
          <button type="button" class="secondary-btn" data-action="menu-up" data-index="${index}">Up</button>
          <button type="button" class="secondary-btn" data-action="menu-down" data-index="${index}">Down</button>
          <button type="button" class="secondary-btn" data-action="menu-delete" data-index="${index}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function formatNotificationChannel(channel) {
  const key = String(channel || "email").trim().toLowerCase();
  if (key === "sms") {
    return "SMS";
  }
  if (key === "whatsapp") {
    return "WhatsApp";
  }
  return "Email";
}

function applyOrderNotificationFilters(notifications) {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  return safeNotifications.filter((item) => {
    const itemChannel = String(item && item.channel ? item.channel : "email").trim().toLowerCase();
    const itemStatus = String(item && item.status ? item.status : "queued").trim().toLowerCase();
    if (currentOrderNotificationFilters.channel !== "all" && itemChannel !== currentOrderNotificationFilters.channel) {
      return false;
    }
    if (currentOrderNotificationFilters.status !== "all" && itemStatus !== currentOrderNotificationFilters.status) {
      return false;
    }
    return true;
  });
}

function syncOrderNotificationFilterControls() {
  if (orderNotificationChannelFilter) {
    orderNotificationChannelFilter.value = currentOrderNotificationFilters.channel;
  }
  if (orderNotificationStatusFilter) {
    orderNotificationStatusFilter.value = currentOrderNotificationFilters.status;
  }
}

function buildOrderNotificationCounts(notifications) {
  return (Array.isArray(notifications) ? notifications : []).reduce((accumulator, item) => {
    const key = String(item && item.status ? item.status : "queued").toLowerCase();
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function renderOrderNotificationChannelStats(notifications) {
  if (!orderNotificationChannelStats) {
    return;
  }
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const channels = ["email", "sms", "whatsapp"];
  orderNotificationChannelStats.innerHTML = channels.map((channel) => {
    const channelItems = safeNotifications.filter((item) => String(item && item.channel ? item.channel : "email").trim().toLowerCase() === channel);
    const sent = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "sent").length;
    const failed = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "failed").length;
    const queued = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "queued").length;
    const muted = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "muted").length;
    return `
      <article class="notification-channel-card">
        <span class="notification-channel-pill">${formatNotificationChannel(channel)}</span>
        <strong>${channelItems.length} notifications</strong>
        <p>Sent ${sent} • Failed ${failed} • Queued ${queued} • Muted ${muted}</p>
      </article>
    `;
  }).join("");
}

function renderOrderNotifications(payload) {
  const notifications = Array.isArray(payload && payload.notifications) ? payload.notifications : [];
  const counts = payload && payload.counts ? payload.counts : {};
  allOrderNotifications = notifications;
  syncOrderNotificationFilterControls();
  renderOrderNotificationChannelStats(notifications);
  const filteredNotifications = applyOrderNotificationFilters(notifications);

  if (orderNotificationsMeta) {
    const sent = Number(counts.sent || 0);
    const failed = Number(counts.failed || 0);
    const queued = Number(counts.queued || 0);
    orderNotificationsMeta.textContent = filteredNotifications.length !== notifications.length
      ? `${filteredNotifications.length} of ${notifications.length} notifications • Sent ${sent} • Failed ${failed} • Queued ${queued}`
      : `${notifications.length} notifications • Sent ${sent} • Failed ${failed} • Queued ${queued}`;
  }

  if (!orderNotificationsTableBody) {
    return;
  }

  if (!filteredNotifications.length) {
    orderNotificationsTableBody.innerHTML = "<tr><td colspan='9'>No order notifications match the current filters.</td></tr>";
    return;
  }

  orderNotificationsTableBody.innerHTML = filteredNotifications.map((item) => `
    <tr>
      <td>${dateTime(item.sentAt || item.createdAt)}</td>
      <td>${escapeHtml(item.orderId || "N/A")}</td>
      <td>${escapeHtml(item.eventLabel || formatStatus(item.eventKey || "update"))}</td>
      <td><span class="notification-channel-pill">${formatNotificationChannel(item.channel)}</span></td>
      <td>${escapeHtml(item.destination || item.email || "N/A")}</td>
      <td><span class="status-tag ${String(item.status || "queued").toLowerCase()}">${formatStatus(item.status || "queued")}</span></td>
      <td>${escapeHtml(String(item.provider || "system").toUpperCase())}</td>
      <td title="${escapeHtmlAttr(item.subject || "")}">${escapeHtml(item.subject || "N/A")}</td>
      <td>
        <button class="mini-btn" type="button" data-action="resend-order-notification" data-notification-id="${escapeHtmlAttr(item.id || "")}">
          ${String(item.status || "").toLowerCase() === "sent" ? "Send Again" : "Resend"}
        </button>
      </td>
    </tr>
  `).join("");
}

function formatAuditCategory(category) {
  const key = String(category || "admin").trim().toLowerCase();
  if (key === "after_sales") {
    return "After-sales";
  }
  if (key === "catalog") {
    return "Product";
  }
  if (key === "notification") {
    return "Notification";
  }
  if (key === "refund") {
    return "Refund";
  }
  if (key === "order") {
    return "Order";
  }
  return formatStatus(key || "admin");
}

function syncAdminAuditFilterControls() {
  if (adminAuditCategoryFilter) {
    adminAuditCategoryFilter.value = currentAdminAuditFilters.category;
  }
  if (adminAuditSearchInput) {
    adminAuditSearchInput.value = currentAdminAuditFilters.search;
  }
}

function applyAdminAuditFilters(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const category = String(currentAdminAuditFilters.category || "all").trim().toLowerCase();
  const search = String(currentAdminAuditFilters.search || "").trim().toLowerCase();
  return safeEntries.filter((item) => {
    const itemCategory = String(item && item.category ? item.category : "admin").trim().toLowerCase();
    if (category !== "all" && itemCategory !== category) {
      return false;
    }
    if (!search) {
      return true;
    }
    const haystack = [
      item && item.actorEmail ? item.actorEmail : "",
      item && item.actorName ? item.actorName : "",
      item && item.actionLabel ? item.actionLabel : "",
      item && item.summary ? item.summary : "",
      item && item.entityId ? item.entityId : "",
      item && item.orderId ? item.orderId : "",
      item && item.caseId ? item.caseId : "",
      item && item.paymentId ? item.paymentId : ""
    ].join(" ").toLowerCase();
    return haystack.includes(search);
  });
}

function buildAdminAuditSummary(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const categories = ["order", "refund", "after_sales", "catalog", "notification"];
  return {
    total: safeEntries.length,
    categoryCounts: categories.reduce((accumulator, key) => {
      accumulator[key] = safeEntries.filter((item) => String(item && item.category ? item.category : "").toLowerCase() === key).length;
      return accumulator;
    }, {})
  };
}

function getAdminAuditCategoryLabel(value) {
  const normalized = String(value || "all").trim().toLowerCase();
  if (normalized === "all") {
    return "Category: All";
  }
  const selectedLabel = String(adminAuditCategoryFilter?.selectedOptions?.[0]?.textContent || normalized).trim();
  return `Category: ${selectedLabel}`;
}

function getActiveAdminAuditFilters() {
  const filters = [];
  const search = String(currentAdminAuditFilters.search || "").trim();
  const category = String(currentAdminAuditFilters.category || "all").trim().toLowerCase();

  if (search) {
    filters.push({
      id: "search",
      label: `Search: ${search}`,
      clear: () => {
        currentAdminAuditFilters.search = "";
        if (adminAuditSearchInput) {
          adminAuditSearchInput.value = "";
        }
      },
      focus: adminAuditSearchInput,
      feedback: "Removed audit trail search filter. Focus moved to the search input."
    });
  }

  if (category !== "all") {
    filters.push({
      id: "category",
      label: getAdminAuditCategoryLabel(category),
      clear: () => {
        currentAdminAuditFilters.category = "all";
        if (adminAuditCategoryFilter) {
          adminAuditCategoryFilter.value = "all";
        }
      },
      focus: adminAuditCategoryFilter,
      feedback: "Removed audit trail category filter. Focus moved to the category filter."
    });
  }

  return filters;
}

function renderAdminAuditTrail(payload) {
  const entries = Array.isArray(payload && payload.entries) ? payload.entries : [];
  const summary = payload && payload.summary ? payload.summary : buildAdminAuditSummary(entries);
  allAdminAuditEntries = entries;
  syncAdminAuditFilterControls();
  const filteredEntries = applyAdminAuditFilters(entries);

  if (adminAuditMeta) {
    adminAuditMeta.textContent = filteredEntries.length !== entries.length
      ? `${filteredEntries.length} of ${entries.length} actions`
      : `${entries.length} actions`;
  }

  if (adminAuditStats) {
    const categoryCounts = summary.categoryCounts || {};
    adminAuditStats.innerHTML = [
      { label: "Order", value: Number(categoryCounts.order || 0) },
      { label: "Refund", value: Number(categoryCounts.refund || 0) },
      { label: "After-sales", value: Number(categoryCounts.after_sales || 0) },
      { label: "Product", value: Number(categoryCounts.catalog || 0) },
      { label: "Notification", value: Number(categoryCounts.notification || 0) }
    ].map((item) => `
      <article class="notification-channel-card">
        <span class="notification-channel-pill">${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(String(item.value))} actions</strong>
      </article>
    `).join("");
  }

  if (!adminAuditTableBody) {
    return;
  }

  if (!filteredEntries.length) {
    adminAuditTableBody.innerHTML = "<tr><td colspan='6'>No admin audit entries match the current filters.</td></tr>";
    adminAuditFilterChipController?.update();
    return;
  }

  adminAuditTableBody.innerHTML = filteredEntries.map((item) => {
    const actorLine = [item.actorName, item.actorEmail].filter(Boolean).join(" • ") || "Admin";
    const targetLine = [
      item.entityType ? formatStatus(item.entityType.replace(/_/g, " ")) : "",
      item.entityId || item.orderId || item.caseId || item.paymentId || ""
    ].filter(Boolean).join(" • ");
    return `
      <tr>
        <td>${dateTime(item.createdAt)}</td>
        <td>${escapeHtml(actorLine)}</td>
        <td><span class="notification-channel-pill">${escapeHtml(formatAuditCategory(item.category))}</span></td>
        <td>${escapeHtml(item.actionLabel || formatStatus(item.actionKey || "update"))}</td>
        <td>${escapeHtml(targetLine || "N/A")}</td>
        <td title="${escapeHtmlAttr(item.summary || "")}">${escapeHtml(item.summary || "Admin action recorded.")}</td>
      </tr>
    `;
  }).join("");
  adminAuditFilterChipController?.update();
}

function applyPhoneVerificationReminderFilters(reminders) {
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  return safeReminders.filter((item) => {
    const itemChannel = String(item && item.channel ? item.channel : "email").trim().toLowerCase();
    const itemStatus = String(item && item.status ? item.status : "queued").trim().toLowerCase();
    if (currentPhoneVerificationReminderFilters.channel !== "all" && itemChannel !== currentPhoneVerificationReminderFilters.channel) {
      return false;
    }
    if (currentPhoneVerificationReminderFilters.status !== "all" && itemStatus !== currentPhoneVerificationReminderFilters.status) {
      return false;
    }
    return true;
  });
}

function syncPhoneVerificationReminderFilterControls() {
  if (phoneVerificationReminderChannelFilter) {
    phoneVerificationReminderChannelFilter.value = currentPhoneVerificationReminderFilters.channel;
  }
  if (phoneVerificationReminderStatusFilter) {
    phoneVerificationReminderStatusFilter.value = currentPhoneVerificationReminderFilters.status;
  }
}

function buildPhoneVerificationReminderCounts(reminders) {
  return (Array.isArray(reminders) ? reminders : []).reduce((accumulator, item) => {
    const key = String(item && item.status ? item.status : "queued").toLowerCase();
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

function renderPhoneVerificationAutomationHistory(history, historySummary) {
  const normalizedHistory = (Array.isArray(history) ? history : []).map((item) => normalizePhoneVerificationAutomationHistoryEntry(item));
  const normalizedSummary = normalizePhoneVerificationAutomationHistorySummary(historySummary);
  currentPhoneVerificationAutomationHistory = normalizedHistory;
  currentPhoneVerificationAutomationHistorySummary = normalizedSummary;

  if (phoneVerificationAutomationHistoryMeta) {
    const completed = Number(normalizedSummary.statusCounts.completed || 0);
    const failed = Number(normalizedSummary.statusCounts.failed || 0);
    phoneVerificationAutomationHistoryMeta.textContent = `${normalizedSummary.totalRuns} runs logged • Completed ${completed} • Failed ${failed}`;
  }

  if (phoneVerificationAutomationHistoryStats) {
    phoneVerificationAutomationHistoryStats.innerHTML = [
      { label: "Runs (7d)", value: normalizedSummary.runsLast7Days },
      { label: "Sent (7d)", value: normalizedSummary.sentLast7Days },
      { label: "Failed (7d)", value: normalizedSummary.failedLast7Days },
      { label: "Users Touched", value: normalizedSummary.affectedUsersLast7Days }
    ].map((item) => `
      <article class="notification-channel-card">
        <span class="notification-channel-pill">${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(String(item.value))}</strong>
      </article>
    `).join("");
  }

  if (phoneVerificationAutomationHistoryChart) {
    const chartItems = normalizedHistory.slice(0, 7).reverse();
    const maxVolume = chartItems.reduce((max, item) => {
      const value = item.deliveredCount + item.queuedCount + item.failedCount + item.skippedCount;
      return Math.max(max, value);
    }, 1);
    phoneVerificationAutomationHistoryChart.innerHTML = chartItems.length
      ? chartItems.map((item) => {
        const totalActivity = item.deliveredCount + item.queuedCount + item.failedCount + item.skippedCount;
        const height = Math.max(10, Math.round((totalActivity / maxVolume) * 100));
        return `
          <article class="automation-history-bar ${escapeHtml(item.status)}" title="${escapeHtml(item.message || "Automation run")}">
            <div class="automation-history-bar-fill" style="height:${height}%"></div>
            <span class="automation-history-label">${escapeHtml(shortDayLabel(item.startedAt || item.finishedAt || new Date().toISOString()))}</span>
            <span class="automation-history-meta">${escapeHtml(formatStatus(item.status))} • ${escapeHtml(String(totalActivity))}</span>
          </article>
        `;
      }).join("")
      : "<span class='subtle'>Run history chart will appear here after automation runs.</span>";
  }

  if (!phoneVerificationAutomationHistoryTableBody) {
    return;
  }

  if (!normalizedHistory.length) {
    phoneVerificationAutomationHistoryTableBody.innerHTML = "<tr><td colspan='6'>No automation runs yet.</td></tr>";
    return;
  }

  phoneVerificationAutomationHistoryTableBody.innerHTML = normalizedHistory.map((item) => `
    <tr>
      <td>${dateTime(item.startedAt)}</td>
      <td>${item.finishedAt ? dateTime(item.finishedAt) : "In progress"}</td>
      <td>${escapeHtml(formatStatus(item.trigger))}<br /><span class="subtle">${escapeHtml(item.actor || "system")}</span></td>
      <td><span class="status-tag ${escapeHtml(item.status)}">${escapeHtml(formatStatus(item.status))}</span></td>
      <td>${item.channels.length ? item.channels.map((channel) => `<span class="notification-channel-pill">${escapeHtml(formatNotificationChannel(channel))}</span>`).join(" ") : "N/A"}</td>
      <td title="${escapeHtmlAttr(item.message || "")}">
        ${escapeHtml(`${item.deliveredCount} sent • ${item.failedCount} failed • ${item.skippedCount} skipped`)}
        <br />
        <span class="subtle">${escapeHtml(item.message || `Eligible ${item.eligibleCount} of ${item.candidateCount}`)}</span>
      </td>
    </tr>
  `).join("");
}

function renderPhoneVerificationReminderChannelStats(reminders) {
  if (!phoneVerificationReminderChannelStats) {
    return;
  }
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const channels = ["email", "sms"];
  phoneVerificationReminderChannelStats.innerHTML = channels.map((channel) => {
    const channelItems = safeReminders.filter((item) => String(item && item.channel ? item.channel : "email").trim().toLowerCase() === channel);
    const sent = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "sent").length;
    const failed = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "failed").length;
    const queued = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "queued").length;
    const skipped = channelItems.filter((item) => String(item && item.status ? item.status : "").toLowerCase() === "skipped").length;
    return `
      <article class="notification-channel-card">
        <span class="notification-channel-pill">${formatNotificationChannel(channel)}</span>
        <strong>${channelItems.length} reminders</strong>
        <p>Sent ${sent} • Failed ${failed} • Queued ${queued} • Skipped ${skipped}</p>
      </article>
    `;
  }).join("");
}

function renderPhoneVerificationAutomation(payload) {
  const settings = normalizePhoneVerificationAutomationSettings(
    payload && payload.settings ? payload.settings : currentPhoneVerificationAutomationSettings
  );
  const job = payload && payload.job ? payload.job : currentPhoneVerificationAutomationJob;
  const summary = payload && payload.summary ? payload.summary : currentPhoneVerificationAutomationSummary;
  const history = Array.isArray(payload && payload.history) ? payload.history : currentPhoneVerificationAutomationHistory;
  const historySummary = payload && payload.historySummary
    ? payload.historySummary
    : currentPhoneVerificationAutomationHistorySummary;
  const reminders = Array.isArray(payload && payload.reminders) ? payload.reminders : allPhoneVerificationReminders;
  const counts = payload && payload.counts ? payload.counts : buildPhoneVerificationReminderCounts(reminders);
  allPhoneVerificationReminders = reminders;
  applyPhoneVerificationAutomationSettings(settings);
  currentPhoneVerificationAutomationSummary = summary;
  currentPhoneVerificationAutomationJob = job;
  renderPhoneVerificationAutomationHistory(history, historySummary);
  syncPhoneVerificationReminderFilterControls();
  renderPhoneVerificationReminderChannelStats(reminders);
  const filteredReminders = applyPhoneVerificationReminderFilters(reminders);

  if (phoneVerificationAutomationMeta) {
    const dueRetryCount = Number(summary.dueRetryCount || 0);
    phoneVerificationAutomationMeta.textContent = dueRetryCount > 0
      ? `${Number(summary.candidateCount || 0)} candidates • ${Number(summary.eligibleCount || 0)} eligible now • ${dueRetryCount} retries due`
      : `${Number(summary.candidateCount || 0)} candidates • ${Number(summary.eligibleCount || 0)} eligible now`;
  }
  if (phoneVerificationAutomationSummary) {
    const parts = [
      `Pending OTP ${Number(summary.pendingCount || 0)}`,
      `Locked ${Number(summary.lockedCount || 0)}`,
      `Cooling down ${Number(summary.recentlyRemindedCount || 0)}`
    ];
    if (Number(summary.scheduledRetryCount || 0) > 0) {
      parts.push(`Queued retries ${Number(summary.scheduledRetryCount || 0)}`);
    }
    if (Number(summary.finalFailureCount || 0) > 0) {
      parts.push(`Retry exhausted ${Number(summary.finalFailureCount || 0)}`);
    }
    if (job.lastStatus) {
      parts.push(`Status ${formatStatus(job.lastStatus)}`);
    }
    if (job.lastTriggeredBy) {
      parts.push(`By ${job.lastTriggeredBy}`);
    }
    if (summary.lastRunAt || job.lastFinishedAt) {
      parts.push(`Last run ${dateTime(summary.lastRunAt || job.lastFinishedAt)}`);
    }
    if (job.lastMessage) {
      parts.push(job.lastMessage);
    }
    phoneVerificationAutomationSummary.textContent = parts.join(" • ");
  }
  if (!phoneVerificationReminderTableBody) {
    return;
  }
  if (!filteredReminders.length) {
    phoneVerificationReminderTableBody.innerHTML = "<tr><td colspan='7'>No phone verification reminders match the current filters.</td></tr>";
    return;
  }
  phoneVerificationReminderTableBody.innerHTML = filteredReminders.map((item) => {
    const retryParts = [];
    if (Number(item.retryAttempt || 1) > 1 || item.retrySourceId) {
      retryParts.push(`Attempt ${Number(item.retryAttempt || 1)}/${Math.max(1, Number(item.retryMaxAttempts || 1))}`);
    }
    if (item.retryEligible && item.nextRetryAt) {
      retryParts.push(`Next retry ${dateTime(item.nextRetryAt)}`);
    }
    if (item.retryFinalFailure) {
      retryParts.push("Retry exhausted");
    }
    if (item.retryProcessedAt && !item.retryEligible && String(item.status || "").toLowerCase() === "failed") {
      retryParts.push(`Retried ${dateTime(item.retryProcessedAt)}`);
    }
    const detail = [
      item.error || item.reason || item.subject || "N/A",
      ...retryParts
    ].filter(Boolean).join(" • ");
    return `
    <tr>
      <td>${dateTime(item.sentAt || item.createdAt)}</td>
      <td>${escapeHtml(item.name || "Customer")}<br /><span class="subtle">${escapeHtml(item.email || item.mobile || "N/A")}</span></td>
      <td><span class="notification-channel-pill">${formatNotificationChannel(item.channel)}</span></td>
      <td>${escapeHtml(item.destination || "N/A")}</td>
      <td><span class="status-tag ${String(item.status || "queued").toLowerCase()}">${formatStatus(item.status || "queued")}</span></td>
      <td>${escapeHtml(String(item.provider || "system").toUpperCase())}</td>
      <td title="${escapeHtmlAttr(detail)}">${escapeHtml(detail)}</td>
    </tr>
  `;
  }).join("");
}

async function runPhoneVerificationAutomation(button) {
  if (!button) {
    return;
  }
  button.disabled = true;
  try {
    const response = await api("/admin/phone-verification-automation/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ limit: currentPhoneVerificationAutomationSettings.limit || 25 })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to run phone verification automation.");
    }
    setMessage(data.message || "Phone verification automation finished.", false, {
      toast: true,
      title: "Automation run completed",
      tone: "success",
      timeoutMs: 5200
    });
    renderPhoneVerificationAutomation(data);
  } catch (error) {
    setMessage(error.message || "Failed to run phone verification automation.", true);
  } finally {
    button.disabled = false;
  }
}

function resetPhoneVerificationAutomationSettingsDraft() {
  applyPhoneVerificationAutomationSettings(currentPhoneVerificationAutomationSettings);
  setMessage("Phone verification scheduler draft reset.", false, {
    toast: true,
    title: "Scheduler draft reset",
    tone: "info",
    timeoutMs: 3600
  });
}

async function savePhoneVerificationAutomationSettings(button) {
  if (!button) {
    return;
  }
  const draft = readPhoneVerificationAutomationSettingsDraft();
  if (!Array.isArray(draft.channels) || !draft.channels.length) {
    setMessage("Select at least one reminder channel.", true);
    return;
  }

  button.disabled = true;
  try {
    const response = await api("/admin/phone-verification-automation/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        enabled: draft.enabled,
        runOnStart: draft.runOnStart,
        intervalMinutes: draft.intervalMinutes,
        limit: draft.limit,
        channels: draft.channels
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to save phone verification automation settings.");
    }
    setMessage(data.message || "Phone verification automation settings saved.", false, {
      toast: true,
      title: "Automation settings saved",
      tone: "success",
      timeoutMs: 4600
    });
    renderPhoneVerificationAutomation(data);
  } catch (error) {
    setMessage(error.message || "Failed to save phone verification automation settings.", true);
  } finally {
    button.disabled = false;
  }
}

async function resendOrderNotificationAdmin(notificationId, button) {
  const id = String(notificationId || "").trim();
  if (!id || !button) {
    return;
  }
  button.disabled = true;
  try {
    const response = await api(`/admin/order-notifications/${encodeURIComponent(id)}/resend`, {
      method: "POST"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Unable to resend order notification.");
    }
    const notificationStatus = String(data && data.notification && data.notification.status ? data.notification.status : "").trim().toLowerCase();
    const queued = notificationStatus === "queued" || /queued/i.test(String(data && data.message ? data.message : ""));
    setMessage(data.message || "Order notification resent.", false, {
      toast: true,
      title: "Notification resend",
      tone: queued ? "warning" : "success",
      timeoutMs: queued ? 6200 : 4600
    });
    await loadDashboard();
  } catch (error) {
    setMessage(error.message || "Failed to resend order notification.", true);
  } finally {
    button.disabled = false;
  }
}

document.addEventListener("click", (event) => {
  const actionBtn = event.target.closest("#catalogTableBody button[data-action]");
  if (!actionBtn) {
    return;
  }
  const action = String(actionBtn.getAttribute("data-action") || "");
  if (!["view-product", "edit-product", "duplicate-product", "toggle-featured", "delete-product"].includes(action)) {
    return;
  }
  const productId = String(actionBtn.getAttribute("data-product-id") || "").trim();
  if (!productId) {
    return;
  }
  handleCatalogRowAction(action, productId, actionBtn);
});

if (orderNotificationsTableBody) {
  orderNotificationsTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='resend-order-notification'][data-notification-id]");
    if (!button) {
      return;
    }
    const notificationId = String(button.getAttribute("data-notification-id") || "").trim();
    if (!notificationId) {
      return;
    }
    resendOrderNotificationAdmin(notificationId, button);
  });
}
if (orderNotificationChannelFilter) {
  orderNotificationChannelFilter.addEventListener("change", () => {
    currentOrderNotificationFilters.channel = String(orderNotificationChannelFilter.value || "all").trim().toLowerCase();
    renderOrderNotifications({
      notifications: allOrderNotifications,
      counts: buildOrderNotificationCounts(allOrderNotifications)
    });
  });
}
if (orderNotificationStatusFilter) {
  orderNotificationStatusFilter.addEventListener("change", () => {
    currentOrderNotificationFilters.status = String(orderNotificationStatusFilter.value || "all").trim().toLowerCase();
    renderOrderNotifications({
      notifications: allOrderNotifications,
      counts: buildOrderNotificationCounts(allOrderNotifications)
    });
  });
}
if (adminAuditSearchInput) {
  adminAuditSearchInput.addEventListener("input", () => {
    currentAdminAuditFilters.search = String(adminAuditSearchInput.value || "").trim();
    renderAdminAuditTrail({
      entries: allAdminAuditEntries,
      summary: buildAdminAuditSummary(allAdminAuditEntries)
    });
  });
}
if (adminAuditCategoryFilter) {
  adminAuditCategoryFilter.addEventListener("change", () => {
    currentAdminAuditFilters.category = String(adminAuditCategoryFilter.value || "all").trim().toLowerCase();
    renderAdminAuditTrail({
      entries: allAdminAuditEntries,
      summary: buildAdminAuditSummary(allAdminAuditEntries)
    });
  });
}
if (refreshAdminAuditBtn) {
  refreshAdminAuditBtn.addEventListener("click", loadDashboard);
}
if (runPhoneVerificationAutomationBtn) {
  runPhoneVerificationAutomationBtn.addEventListener("click", () => runPhoneVerificationAutomation(runPhoneVerificationAutomationBtn));
}
if (savePhoneVerificationAutomationSettingsBtn) {
  savePhoneVerificationAutomationSettingsBtn.addEventListener("click", () => {
    savePhoneVerificationAutomationSettings(savePhoneVerificationAutomationSettingsBtn);
  });
}
if (resetPhoneVerificationAutomationSettingsBtn) {
  resetPhoneVerificationAutomationSettingsBtn.addEventListener("click", resetPhoneVerificationAutomationSettingsDraft);
}
if (phoneVerificationReminderChannelFilter) {
  phoneVerificationReminderChannelFilter.addEventListener("change", () => {
    currentPhoneVerificationReminderFilters.channel = String(phoneVerificationReminderChannelFilter.value || "all").trim().toLowerCase();
    renderPhoneVerificationAutomation({
      settings: currentPhoneVerificationAutomationSettings,
      job: currentPhoneVerificationAutomationJob,
      summary: currentPhoneVerificationAutomationSummary,
      reminders: allPhoneVerificationReminders,
      counts: buildPhoneVerificationReminderCounts(allPhoneVerificationReminders)
    });
  });
}
if (phoneVerificationReminderStatusFilter) {
  phoneVerificationReminderStatusFilter.addEventListener("change", () => {
    currentPhoneVerificationReminderFilters.status = String(phoneVerificationReminderStatusFilter.value || "all").trim().toLowerCase();
    renderPhoneVerificationAutomation({
      settings: currentPhoneVerificationAutomationSettings,
      job: currentPhoneVerificationAutomationJob,
      summary: currentPhoneVerificationAutomationSummary,
      reminders: allPhoneVerificationReminders,
      counts: buildPhoneVerificationReminderCounts(allPhoneVerificationReminders)
    });
  });
}

if (catalogTableBody) {
  catalogTableBody.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox'][data-action='select-product']");
    if (!checkbox) {
      return;
    }
    const productId = checkbox.getAttribute("data-product-id");
    if (!productId) {
      return;
    }
    if (checkbox.checked) {
      selectedCatalogProductIds.add(String(productId));
    } else {
      selectedCatalogProductIds.delete(String(productId));
    }
    syncCatalogSelectionState();
  });
}

if (categoryManagerList) {
  categoryManagerList.addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) {
      return;
    }
    const action = btn.getAttribute("data-action");
    const category = btn.getAttribute("data-category");
    if (!category) {
      return;
    }

    if (action === "remove-category") {
      removeCategory(category);
      return;
    }
    if (action === "move-category-up") {
      moveCategory(category, "up");
      return;
    }
    if (action === "move-category-down") {
      moveCategory(category, "down");
      return;
    }
    if (action === "view-category-products") {
      viewCategoryProducts(category);
      return;
    }
    if (action === "toggle-category") {
      toggleCategory(category);
      return;
    }
    if (action === "edit-category") {
      startEditCategory(category);
      return;
    }
    if (action === "copy-category-url") {
      const url = buildCategoryUrl(category);
      try {
        await navigator.clipboard.writeText(url);
        setCategoryManagerMessage(`URL copied: ${url}`);
      } catch (error) {
        setCategoryManagerMessage(`Copy failed. URL: ${url}`, true);
      }
    }
  });
}

if (menuAddBtn) {
  menuAddBtn.addEventListener("click", () => {
    const label = String(menuLabelInput?.value || "").trim();
    let href = String(menuHrefInput?.value || "").trim();
    const visible = menuVisibleInput ? Boolean(menuVisibleInput.checked) : true;
    const editIndex = Number(menuEditIndexInput?.value);
    if (!label || !href) {
      setMenuManagerMessage("Label and link are required.", true);
      return;
    }
    if (!/^(https?:\/\/|\/|[a-z0-9._-]+\.html(?:\?.*)?$)/i.test(href)) {
      href = `${href}.html`;
    }
    const next = getWebsiteMenuItems();
    if (Number.isInteger(editIndex) && editIndex >= 0 && editIndex < next.length) {
      next[editIndex] = { label, href, visible };
    } else {
      next.push({ label, href, visible });
    }
    if (!saveWebsiteMenuItems(next)) {
      setMenuManagerMessage("Unable to save menu. Storage may be full.", true);
      return;
    }
    resetMenuEditor();
    renderWebsiteMenuManager();
    setMenuManagerMessage(Number.isInteger(editIndex) && editIndex >= 0 ? "Menu link updated." : "Menu link added.");
  });
}

if (menuCancelEditBtn) {
  menuCancelEditBtn.addEventListener("click", () => {
    resetMenuEditor();
    setMenuManagerMessage("Edit cancelled.");
  });
}

if (menuClearBtn) {
  menuClearBtn.addEventListener("click", () => {
    if (!saveWebsiteMenuItems([])) {
      setMenuManagerMessage("Unable to clear menu.", true);
      return;
    }
    resetMenuEditor();
    renderWebsiteMenuManager();
    setMenuManagerMessage("All menu links removed.");
  });
}

if (menuResetBtn) {
  menuResetBtn.addEventListener("click", () => {
    if (!saveWebsiteMenuItems(DEFAULT_WEBSITE_MENU.slice())) {
      setMenuManagerMessage("Unable to reset menu.", true);
      return;
    }
    resetMenuEditor();
    renderWebsiteMenuManager();
    setMenuManagerMessage("Menu reset to default.");
  });
}

if (menuTableBody) {
  menuTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action][data-index]");
    if (!button) {
      return;
    }
    const action = String(button.getAttribute("data-action") || "");
    const index = Number(button.getAttribute("data-index"));
    if (!Number.isFinite(index) || index < 0) {
      return;
    }
    const next = getWebsiteMenuItems();
    if (index >= next.length) {
      return;
    }
    if (action === "menu-edit") {
      if (menuEditIndexInput) {
        menuEditIndexInput.value = String(index);
      }
      if (menuLabelInput) {
        menuLabelInput.value = next[index].label || "";
      }
      if (menuHrefInput) {
        menuHrefInput.value = next[index].href || "";
      }
      if (menuVisibleInput) {
        menuVisibleInput.checked = next[index].visible !== false;
      }
      if (menuAddBtn) {
        menuAddBtn.textContent = "Save Link";
      }
      setMenuManagerMessage("Editing selected menu link.");
      return;
    }
    if (action === "menu-delete") {
      next.splice(index, 1);
    } else if (action === "menu-toggle-visible") {
      next[index].visible = !(next[index].visible !== false);
    } else if (action === "menu-up" && index > 0) {
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
    } else if (action === "menu-down" && index < next.length - 1) {
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
    }
    if (!saveWebsiteMenuItems(next)) {
      setMenuManagerMessage("Unable to update menu.", true);
      return;
    }
    renderWebsiteMenuManager();
    setMenuManagerMessage("Menu updated.");
  });
}

syncBulkCollectionsInputState();
syncInventoryFilterButtons();
readInventoryThreshold();
readInventoryRestockTarget();
const initialBackInStockRequests = loadBackInStockRequestsLocal();
hydrateBackInStockPayload({
  requests: initialBackInStockRequests,
  demandByProduct: computeBackInStockDemand(initialBackInStockRequests)
});
applyBackInStockFilters();
setPendingDriveRetryUploads([], "");
resetMenuEditor();
renderWebsiteMenuManager();
applyAdminFocusedView();
scheduleUiTask(() => {
  loadDashboard();
});









