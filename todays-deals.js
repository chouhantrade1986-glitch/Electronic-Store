const priceRangeFilter = document.getElementById("priceRangeFilter");
const discountFilter = document.getElementById("discountFilter");
let currentDealType = "all";
const CART_STORAGE_KEY = "electromart_cart_v1";
const CATEGORY_PRIORITY_SLUGS = ["laptop", "mobile", "audio", "accessory", "computer", "creator-studio"];

let currentDealStatus = "live";
let currentDropSlot = "all";
const WAITLIST_STORAGE_KEY = "electromart_deal_waitlists_v1";
const REMINDERS_STORAGE_KEY = "electromart_deal_alerts_v1";

const deals = [
  { id: 1, name: "AstraBook Pro 14", brand: "AstraTech", category: "laptop", collections: ["laptop", "computer"], oldPrice: 1149, dealPrice: 999, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", status: "live", stockClaimed: 45, stockTotal: 100 },
  { id: 2, name: "Nimbus Phone X", brand: "Nimbus", category: "mobile", collections: ["mobile"], oldPrice: 849, dealPrice: 749, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80", status: "live", stockClaimed: 88, stockTotal: 100 },
  { id: 3, name: "Pulse ANC Headphones", brand: "PulseWave", category: "audio", collections: ["audio"], oldPrice: 229, dealPrice: 179, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", status: "live", stockClaimed: 62, stockTotal: 100 },
  { id: 5, name: "Orbit Mechanical Keyboard", brand: "OrbitX", category: "accessory", collections: ["accessory", "computer"], oldPrice: 149, dealPrice: 109, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80", status: "live", stockClaimed: 78, stockTotal: 100 },
  { id: 7, name: "Vector Gaming Laptop", brand: "Vector", category: "laptop", collections: ["laptop", "computer"], oldPrice: 1499, dealPrice: 1299, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80", status: "live", stockClaimed: 35, stockTotal: 100 },
  { id: 8, name: "Echo Smart Speaker", brand: "EchoSphere", category: "audio", collections: ["audio"], oldPrice: 129, dealPrice: 89, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80", status: "waitlist", stockClaimed: 50, stockTotal: 50 },
  { id: 4, name: "Apex 4K Ultra Monitor", brand: "ApexVision", category: "computer", collections: ["computer", "creator-studio"], oldPrice: 24999, dealPrice: 18999, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80", status: "upcoming", dropSlot: "1h" },
  { id: 6, name: "Nova Wireless Pro Gaming Mouse", brand: "OrbitX", category: "accessory", collections: ["accessory", "computer"], oldPrice: 2499, dealPrice: 1499, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80", status: "upcoming", dropSlot: "3h" },
  { id: 9, name: "HyperDrive 1TB NVMe Gen4 SSD", brand: "Vector", category: "computer", collections: ["computer", "accessory"], oldPrice: 7999, dealPrice: 4999, image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80", status: "upcoming", dropSlot: "tomorrow" }
];

if (typeof window !== "undefined") {
  window.EM_LIGHTNING_DEALS = deals;
  window.getLightningDealForProduct = function (prodId) {
    const strId = String(prodId || "").trim();
    return deals.find((d) => String(d.id) === strId || String(d.productId) === strId) || null;
  };
}

const dealsGrid = document.getElementById("dealsGrid");
const resultMeta = document.getElementById("resultMeta");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const brandFilterList = document.getElementById("brandFilterList");
const sortFilter = document.getElementById("sortFilter");
const cartCount = document.getElementById("cartCount");
const deptTrigger = document.getElementById("deptTrigger");
const deptMenu = document.getElementById("deptMenu");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
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

function saveCartMap(cartMap) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
  } catch (error) {
    return;
  }
}

function syncCartCount() {
  const total = Object.values(loadCartMap()).reduce((sum, qty) => sum + Number(qty || 0), 0);
  if (cartCount) {
    cartCount.textContent = String(total);
  }
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function discountPercent(oldPrice, dealPrice) {
  return Math.round(((Number(oldPrice || 0) - Number(dealPrice || 0)) / Number(oldPrice || 1)) * 100);
}

function normalizeCategory(value) {
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

function normalizeCollectionValues(collections, category) {
  const normalized = (Array.isArray(collections) ? collections : [])
    .map((item) => normalizeCategory(item))
    .filter(Boolean);
  const categoryValue = normalizeCategory(category);
  if (categoryValue) {
    normalized.push(categoryValue);
  }
  return Array.from(new Set(normalized));
}

function categoryLabel(value) {
  const labels = {
    accessory: "Accessories",
    audio: "Audio",
    computer: "Computers",
    "creator-studio": "Creator Studio",
    laptop: "Laptops",
    mobile: "Mobiles",
    printer: "Printers"
  };
  const normalized = normalizeCategory(value);
  if (labels[normalized]) {
    return labels[normalized];
  }
  return normalized.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function sortCategorySlugs(slugs) {
  const unique = Array.from(new Set((Array.isArray(slugs) ? slugs : []).filter(Boolean)));
  return unique.sort((left, right) => {
    const leftPriority = CATEGORY_PRIORITY_SLUGS.indexOf(left);
    const rightPriority = CATEGORY_PRIORITY_SLUGS.indexOf(right);
    if (leftPriority !== -1 || rightPriority !== -1) {
      if (leftPriority === -1) return 1;
      if (rightPriority === -1) return -1;
      return leftPriority - rightPriority;
    }
    return categoryLabel(left).localeCompare(categoryLabel(right));
  });
}

function normalizeBrandKey(value) {
  return String(value || "").trim().toLowerCase();
}

function getBrandFilters() {
  return brandFilterList ? Array.from(brandFilterList.querySelectorAll(".brand-filter")) : [];
}

function getSelectedBrands() {
  return getBrandFilters().filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
}

function getCategoryOptions() {
  return sortCategorySlugs(deals.flatMap((item) => normalizeCollectionValues(item.collections, item.category)));
}

function syncDynamicCategoryUI() {
  if (!categoryFilter) {
    return;
  }
  const selected = normalizeCategory(categoryFilter.value || "all");
  const options = getCategoryOptions();
  categoryFilter.innerHTML = [
    "<option value='all'>All Categories</option>",
    ...options.map((slug) => `<option value="${escapeHtml(slug)}">${escapeHtml(categoryLabel(slug))}</option>`)
  ].join("");
  categoryFilter.value = options.includes(selected) ? selected : "all";
}

function syncDynamicBrandUI() {
  if (!brandFilterList) {
    return;
  }
  const selectedBrands = getSelectedBrands();
  const selectedKeys = new Set(selectedBrands.map((brand) => normalizeBrandKey(brand)));
  const activeCategory = normalizeCategory(categoryFilter?.value || "all");
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const source = deals.filter((item) => {
    const collections = normalizeCollectionValues(item.collections, item.category);
    const categoryMatch = activeCategory === "all" || collections.includes(activeCategory);
    const queryMatch = !query || `${item.name} ${item.brand} ${collections.join(" ")}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
  const optionMap = new Map();
  [...source, ...deals.filter((item) => selectedKeys.has(normalizeBrandKey(item.brand)))]
    .forEach((item) => {
      const brand = String(item.brand || "").trim();
      if (!brand) {
        return;
      }
      optionMap.set(normalizeBrandKey(brand), brand);
    });

  const options = Array.from(optionMap.values()).sort((left, right) => left.localeCompare(right));
  if (!options.length) {
    brandFilterList.innerHTML = "<p class='brand-filter-empty'>No brands match the current filters.</p>";
    return;
  }
  brandFilterList.innerHTML = options.map((brand) => {
    const checked = selectedKeys.has(normalizeBrandKey(brand)) ? " checked" : "";
    return `<label class=\"check-item\"><input type=\"checkbox\" class=\"brand-filter\" value=\"${escapeHtml(brand)}\"${checked} /> ${escapeHtml(brand)}</label>`;
  }).join("");
}


function getWaitlists() {
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveWaitlists(map) {
  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

function isInWaitlist(dealId) {
  const map = getWaitlists();
  return Boolean(map[String(dealId)]);
}

function getWaitlistPosition(dealId) {
  const map = getWaitlists();
  const entry = map[String(dealId)];
  return entry && entry.position ? entry.position : 1;
}

function joinWaitlist(dealId) {
  const map = getWaitlists();
  const idStr = String(dealId);
  const position = Object.keys(map).length + 1;
  map[idStr] = {
    dealId: idStr,
    position,
    joinedAt: Date.now()
  };
  saveWaitlists(map);
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const msgTemplate = t.waitlist_toast_joined || "You're #{pos} in line! We'll alert you if a spot opens up.";
  showDealToast(msgTemplate.replace("#{pos}", position));
  filterDeals();
}

function leaveWaitlist(dealId) {
  const map = getWaitlists();
  const idStr = String(dealId);
  if (map[idStr]) {
    delete map[idStr];
    saveWaitlists(map);
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  showDealToast(t.waitlist_toast_left || "You have left the waitlist for this deal.");
  filterDeals();
}

function getReminders() {
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveReminders(map) {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

function hasReminder(dealId) {
  const map = getReminders();
  return Boolean(map[String(dealId)]);
}

function toggleReminder(dealId) {
  const map = getReminders();
  const idStr = String(dealId);
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};

  if (map[idStr]) {
    delete map[idStr];
    saveReminders(map);
    showDealToast(t.reminder_toast_cancelled || "Reminder cancelled for this deal.");
  } else {
    map[idStr] = {
      dealId: idStr,
      remindedAt: Date.now()
    };
    saveReminders(map);
    showDealToast(t.reminder_toast_set || "Reminder set! We'll alert you 10 minutes before the drop goes live.");
  }
  filterDeals();
}

function showDealToast(message, duration = 3500) {
  const container = document.getElementById("dealToastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "amz-deal-toast";
  toast.innerHTML = `<span>⚡</span> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 350);
  }, duration);
}

function getDealBadge(item) {
  if (item.status === "upcoming") return { label: "Upcoming Drop", class: "badge-upcoming" };
  if (item.status === "waitlist") return { label: "Waitlist Available", class: "badge-waitlist" };
  if (item.dealPrice <= 100) return { label: "Lightning Deal", class: "badge-lightning" };
  if (item.brand === "AstraTech" || item.brand === "Vector") return { label: "Best Seller", class: "badge-best" };
  if (item.oldPrice - item.dealPrice > 300) return { label: "Limited Stock", class: "badge-limited" };
  return { label: "Deal", class: "badge-default" };
}

// Helper: get stock/claim progress
function getDealProgress(item) {
  if (item.status === "waitlist") return 100;
  if (item.status === "upcoming") return 0;
  if (item.stockTotal && item.stockClaimed != null) {
    return Math.min(100, Math.round((Number(item.stockClaimed) / Number(item.stockTotal)) * 100));
  }
  return 30 + ((item.id * 17) % 61);
}

function getDealExpiry(item) {
  if (!item._expiry) {
    item._expiry = Date.now() + 6 * 60 * 60 * 1000 + (item.id * 10000);
  }
  return item._expiry;
}

function getDealStartTime(item) {
  if (!item.startTime) {
    item.startTime = Date.now() + 2 * 60 * 60 * 1000 + (item.id * 8000);
  }
  return item.startTime;
}

function formatCountdown(ms) {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getPrimeTag(item) {
  if (item.brand === "Vector" || item.brand === "Nimbus") {
    return '<span class="prime-tag">Prime</span>';
  }
  if (item.dealPrice === Math.min(...deals.map((d) => d.dealPrice))) {
    return '<span class="featured-tag">Featured</span>';
  }
  return '';
}

function getDealRating(item) {
  const rating = (Math.round((4 + (item.id % 10) * 0.13) * 10) / 10).toFixed(1);
  const reviews = 50 + (item.id * 13) % 350;
  return { rating, reviews };
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '<span class="deal-stars">' +
    '★'.repeat(full) +
    (half ? '½' : '') +
    '<span class="deal-star-empty">' + '☆'.repeat(empty) + '</span>' +
    '</span>';
}

function dealCard(item) {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : ((window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en) ? window.EM_TRANSLATIONS.en : {});

  const preview = `<div class='deal-preview-overlay' tabindex="-1"><strong>${t.quick_view || "Quick View"}:</strong> ${escapeHtml(item.name)}<br>${t.brands || "Brand"}: ${escapeHtml(item.brand)}<br>${t.discount || "Discount"}: ${discountPercent(item.oldPrice, item.dealPrice)}%</div>`;
  const detailUrl = `product-detail.html?id=${encodeURIComponent(item.id)}`;
  const brandUrl = `brands.html?brand=${encodeURIComponent(String(item.brand || "").trim())}`;
  const discount = discountPercent(item.oldPrice, item.dealPrice);

  const rawBadge = getDealBadge(item);
  let badgeText = rawBadge.label;
  if (badgeText === "Best Seller") badgeText = t.badge_best_seller || "Best Seller";
  else if (badgeText === "Lightning Deal") badgeText = t.lightning_deal || "Lightning Deal";
  else if (badgeText === "Limited Stock") badgeText = t.limited_stock || "Limited Stock";
  else if (badgeText === "Deal") badgeText = t.deal_badge || "Deal";
  else if (badgeText === "Upcoming Drop") badgeText = t.upcoming_drops || "Upcoming Drop";
  else if (badgeText === "Waitlist Available") badgeText = t.waitlist_deals || "Waitlist Available";

  const expiry = getDealExpiry(item);
  const countdownId = `deal-timer-${item.id}`;
  const progress = getDealProgress(item);
  const { rating, reviews } = getDealRating(item);

  const isUpcoming = item.status === "upcoming";
  const isWaitlist = item.status === "waitlist" || progress >= 100;

  // Timer row
  let timerRowHtml = "";
  if (isUpcoming) {
    const startTime = getDealStartTime(item);
    timerRowHtml = `<div class="deal-timer-row"><span class="deal-timer-label">${t.drop_starts_in || "Drop starts in:"}</span> <span class="deal-timer deal-upcoming-timer" id="${countdownId}">${formatCountdown(startTime - Date.now())}</span></div>`;
  } else {
    timerRowHtml = `<div class="deal-timer-row"><span class="deal-timer-label">${t.ends_in || "Ends in:"}</span> <span class="deal-timer" id="${countdownId}">${formatCountdown(expiry - Date.now())}</span></div>`;
  }

  // Progress row
  let progressRowHtml = "";
  if (isUpcoming) {
    progressRowHtml = `
      <div class="deal-progress-row">
        <span class="deal-progress-label">${t.limited_drop_allocation || "Limited units allocated for this drop"}</span>
      </div>`;
  } else {
    const isUrgent = progress >= 75 && progress < 100;
    const isFull = progress >= 100;
    const progressClass = isFull ? "deal-progress-bar full" : (isUrgent ? "deal-progress-bar urgent" : "deal-progress-bar");
    const progressText = isFull ? (t.waitlist_available || "100% Claimed - Waitlist Available") : `${progress}% ${t.claimed || "claimed"}`;
    const urgencyHtml = isUrgent ? `<span class="deal-urgency-note">🔥 ${t.claimed_hurry || "Hurry, deal ends soon!"}</span>` : "";
    progressRowHtml = `
      <div class="deal-progress-row">
        <div class="deal-progress-bar-bg">
          <div class="${progressClass}" style="width:${progress}%"></div>
        </div>
        <span class="deal-progress-label">${progressText}</span>
        ${urgencyHtml}
      </div>`;
  }

  // Action buttons
  let actionButtonsHtml = "";
  if (isUpcoming) {
    const reminded = hasReminder(item.id);
    actionButtonsHtml = `
      <button class="amz-btn-remind${reminded ? " reminded" : ""}" data-deal-id="${escapeHtml(item.id)}" type="button">
        ${reminded ? "✓ " + (t.reminder_set || "Reminder Set") : "🔔 " + (t.remind_me || "Remind Me")}
      </button>
      <a class="view-link" href="${detailUrl}">${t.view_details || "View details"}</a>
    `;
  } else if (isWaitlist) {
    const inWaitlist = isInWaitlist(item.id);
    if (inWaitlist) {
      const pos = getWaitlistPosition(item.id);
      actionButtonsHtml = `
        <button class="amz-btn-waitlist in-waitlist" data-deal-id="${escapeHtml(item.id)}" type="button">
          ✓ ${t.in_waitlist || "In Waitlist"} (#${pos} ${t.waitlist_position || "in line"})
        </button>
        <a href="javascript:void(0)" class="waitlist-leave-link" data-leave-deal-id="${escapeHtml(item.id)}">${t.leave_waitlist || "Leave Waitlist"}</a>
        <a class="view-link" href="${detailUrl}" style="margin-left: 8px;">${t.view_details || "View details"}</a>
      `;
    } else {
      actionButtonsHtml = `
        <button class="amz-btn-waitlist" data-deal-id="${escapeHtml(item.id)}" type="button">
          ${t.join_waitlist || "Join Waitlist"}
        </button>
        <a class="view-link" href="${detailUrl}">${t.view_details || "View details"}</a>
      `;
    }
  } else {
    actionButtonsHtml = `
      <button class="add-btn" data-id="${escapeHtml(item.id)}" type="button">${t.add_to_cart || "Add to Cart"}</button>
      <a class="view-link" href="${detailUrl}">${t.view_details || "View details"}</a>
    `;
  }

  return `
    <article class="deal-card" tabindex="0" onmouseenter="this.querySelector('.deal-preview-overlay').style.opacity=0" onmouseleave="this.querySelector('.deal-preview-overlay').style.opacity=''">
      <div class="deal-badge ${rawBadge.class}">${badgeText}</div>
      ${getPrimeTag(item)}
      <a class="deal-card-media" href="${detailUrl}" aria-label="Open ${escapeHtml(item.name)}">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" />
        ${preview}
      </a>
      <div class="content">
        <p class="card-kicker">${t.limited_time_deal_badge || "Limited time deal"}</p>
        <h3><a href="${detailUrl}">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : item.name)}</a></h3>
        <p><a class="brand-line" href="${brandUrl}">${t.by_brand || "by"} ${escapeHtml(item.brand)}</a></p>
        <div class="price-row">
          <span class="price-now">${escapeHtml(money(item.dealPrice))}</span>
          <span class="discount">${escapeHtml(String(discount))}% ${t.percent_off || "off"}</span>
        </div>
        <div class="deal-rating-row">
          ${renderStars(rating)}
          <span class="deal-rating-label">${rating} | ${reviews} ${t.reviews_label || "reviews"}</span>
        </div>
        ${timerRowHtml}
        ${progressRowHtml}
        <p class="price-meta">${t.mrp || "M.R.P."} <s>${escapeHtml(money(item.oldPrice))}</s> - ${t.grab_before_refresh || "grab it before the next refresh."}</p>
        <p class="delivery-note">${t.free_delivery_pincode || "FREE delivery by tomorrow on eligible pincodes"}</p>
        <div class="card-actions">
          ${actionButtonsHtml}
        </div>
      </div>
    </article>
  `;
}

// Memory-safe countdown timer update loop
function startDealCountdowns() {
  if (window._emDealTimerInterval) {
    clearInterval(window._emDealTimerInterval);
    window._emDealTimerInterval = null;
  }

  window._emDealTimerInterval = setInterval(() => {
    deals.forEach((item) => {
      const el = document.getElementById(`deal-timer-${item.id}`);
      if (el) {
        const now = Date.now();
        if (item.status === "upcoming") {
          const startTime = getDealStartTime(item);
          el.textContent = formatCountdown(startTime - now);
        } else {
          const expiry = getDealExpiry(item);
          el.textContent = formatCountdown(expiry - now);
        }
      }
    });

    const spotTimer = document.getElementById("spotlight-timer");
    if (spotTimer && deals.length > 0) {
      const firstExpiry = getDealExpiry(deals[0]);
      spotTimer.textContent = formatCountdown(firstExpiry - Date.now());
    }
  }, 1000);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (window._emDealTimerInterval) {
      clearInterval(window._emDealTimerInterval);
      window._emDealTimerInterval = null;
    }
  });
}

// Start countdowns and card action listeners after DOM loads
function setupDealCardActions() {
  // Quick Add to Cart, Remind Me, and Waitlist on dealsGrid
  dealsGrid?.addEventListener("click", function (e) {
    const btn = e.target.closest(".add-btn");
    if (btn) {
      const id = btn.getAttribute("data-id");
      if (id) {
        addToCart(id);
        btn.disabled = true;
        const oldText = btn.textContent;
        btn.textContent = "Added!";
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = oldText;
        }, 2000);
      }
      return;
    }

    const remindBtn = e.target.closest(".amz-btn-remind");
    if (remindBtn) {
      const dealId = remindBtn.getAttribute("data-deal-id");
      if (dealId) {
        toggleReminder(dealId);
      }
      return;
    }

    const waitlistBtn = e.target.closest(".amz-btn-waitlist");
    if (waitlistBtn) {
      const dealId = waitlistBtn.getAttribute("data-deal-id");
      if (dealId) {
        if (isInWaitlist(dealId)) {
          leaveWaitlist(dealId);
        } else {
          joinWaitlist(dealId);
        }
      }
      return;
    }

    const leaveLink = e.target.closest(".waitlist-leave-link");
    if (leaveLink) {
      const dealId = leaveLink.getAttribute("data-leave-deal-id");
      if (dealId) {
        leaveWaitlist(dealId);
      }
      return;
    }
  });

  // Quick Add on Spotlight Banner
  const spotlightBanner = document.getElementById("dealsSpotlightBanner");
  spotlightBanner?.addEventListener("click", function (e) {
    const btn = e.target.closest(".add-btn");
    if (btn) {
      const id = btn.getAttribute("data-id");
      if (id) {
        addToCart(id);
        btn.disabled = true;
        const oldText = btn.textContent;
        btn.classList.add("added");
        btn.textContent = "✓ Added!";
        setTimeout(() => {
          btn.disabled = false;
          btn.classList.remove("added");
          btn.textContent = oldText;
        }, 2000);
      }
      return;
    }

    const waitlistBtn = e.target.closest(".amz-btn-waitlist");
    if (waitlistBtn) {
      const dealId = waitlistBtn.getAttribute("data-deal-id");
      if (dealId) {
        if (isInWaitlist(dealId)) {
          leaveWaitlist(dealId);
        } else {
          joinWaitlist(dealId);
        }
      }
      return;
    }
  });
}

function renderSpotlightDeal(deal) {
  const spotlightBanner = document.getElementById("dealsSpotlightBanner");
  if (!spotlightBanner) return;
  if (!deal) {
    spotlightBanner.innerHTML = "";
    return;
  }

  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  const discount = discountPercent(deal.oldPrice, deal.dealPrice);
  const detailUrl = `product-detail.html?id=${encodeURIComponent(deal.id)}`;
  const expiry = getDealExpiry(deal);
  const progress = getDealProgress(deal);
  const title = escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(deal, currentLang) : deal.name);

  spotlightBanner.innerHTML = `
    <div class="amz-spotlight-deal">
      <div class="amz-spotlight-media">
        <a href="${detailUrl}">
          <img class="amz-spotlight-img" src="${escapeHtml(deal.image)}" alt="${title}" loading="lazy" />
        </a>
      </div>
      <div class="amz-spotlight-info">
        <span class="amz-spotlight-badge">${escapeHtml(t.deal_of_the_day || "Deal of the Day")}</span>
        <h3 class="amz-spotlight-title"><a href="${detailUrl}">${title}</a></h3>
        <div class="amz-spotlight-price-row">
          <span class="amz-spotlight-discount">-${discount}%</span>
          <span class="amz-spotlight-price">${escapeHtml(money(deal.dealPrice))}</span>
          <span class="amz-spotlight-mrp">${t.mrp || "M.R.P."} <s>${escapeHtml(money(deal.oldPrice))}</s></span>
        </div>
        <div class="amz-spotlight-meta-row">
          <span class="amz-spotlight-timer">⏱️ ${t.ends_in || "Ends in:"} <span id="spotlight-timer">${formatCountdown(expiry - Date.now())}</span></span>
          <div class="amz-spotlight-progress-wrap">
            <div class="amz-spotlight-progress-bar">
              <div class="amz-spotlight-progress-fill" style="width:${progress}%"></div>
            </div>
            <span>${progress}% ${t.claimed || "claimed"}</span>
          </div>
        </div>
        <div class="amz-spotlight-actions">
          <button class="amz-spotlight-btn add-btn" data-id="${escapeHtml(deal.id)}" type="button">${t.add_to_cart || "Add to Cart"}</button>
          <a class="amz-spotlight-link" href="${detailUrl}">${t.view_details || "View details"} &rsaquo;</a>
        </div>
      </div>
    </div>
  `;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    startDealCountdowns();
    setupDealCardActions();
  });
} else {
  startDealCountdowns();
  setupDealCardActions();
}

function render(list) {
  if (!resultMeta || !dealsGrid) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  resultMeta.textContent = `${list.length} ${t.showing_x_deals || "डील्स दिखाई जा रही हैं"}`;
  
  updateDealStatusCounts();

  if (typeof renderSpotlightDeal === "function") {
    renderSpotlightDeal(list.length > 0 ? list[0] : null);
  }

  if (!list.length) {
    dealsGrid.innerHTML = `<div class='empty'>${t.no_deals_found || "No exact deal matches found. Try clearing one filter or broadening the search."}</div>`;
    return;
  }
  dealsGrid.innerHTML = list.map(dealCard).join("");
}

function getSortLabel(value) {
  const labels = {
    discount_desc: "Highest Discount",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low"
  };
  return labels[value] || "Featured";
}

function getActiveListingFilters() {
  const filters = [];
  const query = String(searchInput?.value || "").trim();
  const category = String(categoryFilter?.value || "all");
  const sortValue = String(sortFilter?.value || "relevance");

  if (query) {
    filters.push({
      id: "search",
      label: `Search: \"${query}\"`,
      ariaLabel: `Remove search ${query}`,
      clear: () => { searchInput.value = ""; },
      focus: () => searchInput.focus(),
      feedback: `Removed search ${query}. Focus moved to the search input.`
    });
  }
  if (category !== "all") {
    const readable = categoryLabel(category);
    filters.push({
      id: "category",
      label: `Category: ${readable}`,
      ariaLabel: `Remove category filter ${readable}`,
      clear: () => { categoryFilter.value = "all"; },
      focus: () => categoryFilter.focus(),
      feedback: `Removed category filter ${readable}. Focus moved to the category filter.`
    });
  }
  getSelectedBrands().forEach((brand) => {
    filters.push({
      id: `brand-${normalizeBrandKey(brand)}`,
      label: `Brand: ${brand}`,
      ariaLabel: `Remove brand filter ${brand}`,
      clear: () => {
        const target = getBrandFilters().find((checkbox) => checkbox.value === brand);
        if (target) target.checked = false;
      },
      focus: () => getBrandFilters().find((checkbox) => checkbox.value === brand)?.focus(),
      feedback: `Removed brand filter ${brand}. Focus moved to the brand option.`
    });
  });
  if (sortValue !== "relevance") {
    const sortLabel = getSortLabel(sortValue);
    filters.push({
      id: "sort",
      label: `Sort: ${sortLabel}`,
      ariaLabel: `Remove sort filter ${sortLabel}`,
      clear: () => { sortFilter.value = "relevance"; },
      focus: () => sortFilter.focus(),
      feedback: `Removed sort order ${sortLabel}. Focus moved to the sort control.`
    });
  }
  return filters;
}

function sortDeals(items, sortValue) {
  const next = [...items];
  if (sortValue === "discount_desc") {
    next.sort((a, b) => discountPercent(b.oldPrice, b.dealPrice) - discountPercent(a.oldPrice, a.dealPrice));
  } else if (sortValue === "price_asc") {
    next.sort((a, b) => Number(a.dealPrice || 0) - Number(b.dealPrice || 0));
  } else if (sortValue === "price_desc") {
    next.sort((a, b) => Number(b.dealPrice || 0) - Number(a.dealPrice || 0));
  }
  return next;
}

function applyInitialCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = normalizeCategory(params.get("category") || "");
  const allowed = new Set(["all", ...getCategoryOptions()]);
  if (requested && allowed.has(requested) && categoryFilter) {
    categoryFilter.value = requested;
  }
}

function syncDeptPillsUI(activeCategory) {
  const pills = document.querySelectorAll("#dealsDeptBar .amz-dept-pill");
  pills.forEach((pill) => {
    const cat = pill.getAttribute("data-category");
    if (cat === activeCategory) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });
}

function initDealsDeptPills() {
  const deptBar = document.getElementById("dealsDeptBar");
  if (!deptBar || deptBar._bound) return;
  deptBar._bound = true;

  deptBar.addEventListener("click", (e) => {
    const pill = e.target.closest(".amz-dept-pill");
    if (!pill) return;
    const cat = pill.getAttribute("data-category") || "all";
    if (categoryFilter) {
      categoryFilter.value = cat;
    }
    syncDeptPillsUI(cat);

    try {
      const url = new URL(window.location.href);
      if (cat === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", cat);
      }
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}

    filterDeals();
  });
}

function initDealTypePills() {
  const typeBar = document.getElementById("dealTypeBar");
  if (!typeBar || typeBar._bound) return;
  typeBar._bound = true;

  typeBar.addEventListener("click", (e) => {
    const pill = e.target.closest(".amz-deal-type-pill");
    if (!pill) return;
    typeBar.querySelectorAll(".amz-deal-type-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentDealType = pill.getAttribute("data-type") || "all";
    filterDeals();
  });
}

function initDealStatusTabs() {
  const statusTabs = document.getElementById("dealStatusTabs");
  if (!statusTabs || statusTabs._bound) return;
  statusTabs._bound = true;

  statusTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".amz-deal-status-tab");
    if (!tab) return;
    statusTabs.querySelectorAll(".amz-deal-status-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentDealStatus = tab.getAttribute("data-status") || "live";

    const scheduleEl = document.getElementById("lightningDropsSchedule");
    if (scheduleEl) {
      scheduleEl.style.display = currentDealStatus === "upcoming" ? "block" : "none";
    }

    filterDeals();
  });
}

function initDropsSchedulePills() {
  const scheduleBar = document.getElementById("dropsSchedulePills");
  if (!scheduleBar || scheduleBar._bound) return;
  scheduleBar._bound = true;

  scheduleBar.addEventListener("click", (e) => {
    const pill = e.target.closest(".amz-drop-pill");
    if (!pill) return;
    scheduleBar.querySelectorAll(".amz-drop-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    currentDropSlot = pill.getAttribute("data-slot") || "all";
    filterDeals();
  });
}

function updateDealStatusCounts() {
  const liveCount = deals.filter((item) => item.status === "live" || !item.status).length;
  const upcomingCount = deals.filter((item) => item.status === "upcoming").length;
  const waitlistCount = deals.filter((item) => item.status === "waitlist" || getDealProgress(item) >= 100).length;

  const liveEl = document.getElementById("liveDealsCount");
  if (liveEl) liveEl.textContent = `(${liveCount})`;
  const upcomingEl = document.getElementById("upcomingDealsCount");
  if (upcomingEl) upcomingEl.textContent = `(${upcomingCount})`;
  const waitlistEl = document.getElementById("waitlistDealsCount");
  if (waitlistEl) waitlistEl.textContent = `(${waitlistCount})`;
}

function filterDeals() {
  const query = String(searchInput?.value || "").trim().toLowerCase();
  const category = normalizeCategory(categoryFilter?.value || "all");
  const sortValue = String(sortFilter?.value || "relevance");
  const selectedBrands = getSelectedBrands();
  const discountValue = Number(discountFilter?.value || 0);

  syncDynamicCategoryUI();
  syncDynamicBrandUI();
  syncDeptPillsUI(category);

  const filtered = deals.filter((item) => {
    const collections = normalizeCollectionValues(item.collections, item.category);
    const queryMatch = !query || `${item.name} ${item.brand} ${collections.join(" ")}`.toLowerCase().includes(query);
    const categoryMatch = category === "all" || collections.includes(category);
    const brandMatch = !selectedBrands.length || selectedBrands.includes(item.brand);

    // Price range dropdown logic
    let priceMatch = true;
    if (priceRangeFilter && priceRangeFilter.value && priceRangeFilter.value !== "all") {
      const [min, max] = priceRangeFilter.value.split("-").map(Number);
      priceMatch = item.dealPrice >= min && item.dealPrice <= max;
    }

    // Discount dropdown logic
    let discMatch = true;
    if (discountValue > 0) {
      discMatch = discountPercent(item.oldPrice, item.dealPrice) >= discountValue;
    }

    // Deal status filter (Live, Upcoming Drops, Waitlist Deals)
    let statusMatch = true;
    if (currentDealStatus === "live") {
      statusMatch = item.status === "live" || !item.status;
    } else if (currentDealStatus === "upcoming") {
      statusMatch = item.status === "upcoming";
      if (statusMatch && currentDropSlot !== "all") {
        statusMatch = item.dropSlot === currentDropSlot;
      }
    } else if (currentDealStatus === "waitlist") {
      statusMatch = item.status === "waitlist" || getDealProgress(item) >= 100;
    }

    // Deal type pill filter
    let typeMatch = true;
    if (currentDealType === "dotd") {
      typeMatch = item.id === 1 || item.id === 7 || discountPercent(item.oldPrice, item.dealPrice) >= 20;
    } else if (currentDealType === "lightning") {
      typeMatch = item.id === 3 || item.id === 8 || item.id === 5;
    } else if (currentDealType === "under500") {
      typeMatch = Number(item.dealPrice || 0) < 500;
    } else if (currentDealType === "halfprice") {
      typeMatch = discountPercent(item.oldPrice, item.dealPrice) >= 50;
    }

    return queryMatch && categoryMatch && brandMatch && priceMatch && discMatch && typeMatch && statusMatch;
  });

  render(sortDeals(filtered, sortValue));
  filterChipController?.update();
}

if (searchInput) {
  searchInput.addEventListener("input", filterDeals);
}
if (categoryFilter) {
  categoryFilter.addEventListener("change", filterDeals);
}
if (priceRangeFilter) {
  priceRangeFilter.addEventListener("change", filterDeals);
}
if (discountFilter) {
  discountFilter.addEventListener("change", filterDeals);
}
if (brandFilterList) {
  brandFilterList.addEventListener("change", (event) => {
    if (event.target.closest(".brand-filter")) {
      filterDeals();
    }
  });
}
if (sortFilter) {
  sortFilter.addEventListener("change", filterDeals);
}

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

syncCartCount();
syncDynamicCategoryUI();
applyInitialCategoryFromUrl();
syncDynamicBrandUI();
initDealsDeptPills();
initDealTypePills();
initDealStatusTabs();
initDropsSchedulePills();
updateDealStatusCounts();
filterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: ".result-note",
  getFilters: getActiveListingFilters,
  clearAll: () => {
    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "all";
    getBrandFilters().forEach((checkbox) => {
      checkbox.checked = false;
    });
    if (sortFilter) sortFilter.value = "relevance";
    if (priceRangeFilter) priceRangeFilter.value = "all";
    if (discountFilter) discountFilter.value = "all";
  },
  focusAfterClearAll: () => searchInput?.focus(),
  clearAllFeedback: "Removed all listing filters. Focus moved to the search input.",
  onChange: filterDeals,
  getResultSummary: () => String(resultMeta?.textContent || "").trim()
});
filterDeals();

window.renderTodaysDeals = function() {
  filterDeals();
};
window.filterDeals = filterDeals;
