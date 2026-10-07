/**
 * ElectroMart — Verified Customer Reviews Video & Photo Gallery Engine (customer-media.js)
 * Phase 28: Authentic Customer Media Experience
 * Pure ElectroMart Branding: 0 Visible Forbidden Brand Text.
 */

(function () {
  "use strict";

  // Storage Keys
  const MEDIA_STORAGE_KEY = "electromart_customer_media_v1";
  const REVIEWS_STORAGE_KEY = "electromart_reviews_v1";
  const CART_STORAGE_KEY = "electromart_cart_v1";
  const HELPFUL_VOTES_KEY = "electromart_helpful_votes_v1";
  const FALLBACK_IMAGE_URL = "./product-placeholder.svg";

  // INR Currency Formatter
  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  });

  function money(val) {
    return inrFormatter.format(Number(val || 0));
  }

  // Reliable Fallback Products if window.EM_CATALOG not loaded
  const fallbackCatalog = [
    { id: "1", name: "AstraBook Pro 14", brand: "AstraTech", category: "laptop", price: 64999, originalPrice: 79999, discount: 19, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", rating: 4.8 },
    { id: "2", name: "Nimbus Phone X", brand: "Nimbus", category: "mobile", price: 42999, originalPrice: 49999, discount: 14, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80", rating: 4.6 },
    { id: "3", name: "Pulse ANC Headphones", brand: "PulseWave", category: "audio", price: 7999, originalPrice: 12999, discount: 38, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", rating: 4.7 },
    { id: "7", name: "Vector Gaming Laptop", brand: "Vector", category: "laptop", price: 89999, originalPrice: 109999, discount: 18, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80", rating: 4.9 },
    { id: "201", name: "Epson EcoTank L3250 All-in-One Printer", brand: "Epson", category: "printer", price: 14999, originalPrice: 17999, discount: 17, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80", rating: 4.5 }
  ];

  function getCatalogProduct(id) {
    if (Array.isArray(window.EM_CATALOG)) {
      const p = window.EM_CATALOG.find((item) => String(item.id) === String(id));
      if (p) return p;
    }
    if (window.EM_CATALOG_MAP && window.EM_CATALOG_MAP[id]) {
      return window.EM_CATALOG_MAP[id];
    }
    return fallbackCatalog.find((item) => String(item.id) === String(id)) || null;
  }

  // Realistic Verified Customer Media Seed Database
  const SEED_CUSTOMER_MEDIA = [
    {
      id: "media-101",
      type: "video",
      mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
      duration: "0:48",
      productId: "1",
      productName: "AstraBook Pro 14 Laptop",
      productBrand: "AstraTech",
      category: "laptop",
      rating: 5,
      reviewerName: "Rohan Sen",
      location: "Bengaluru, Karnataka",
      date: "Reviewed in India on 12 August 2026",
      headline: "Unboxing & First Boot: Blazing fast M-series performance!",
      text: "Unboxing was super satisfying. Packaging had genuine ElectroMart tamper-proof seals. The 120Hz display is stunning for coding and color grading. Battery easily lasts 14+ hours of continuous dev work.",
      helpfulCount: 42
    },
    {
      id: "media-102",
      type: "photo",
      mediaUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      productId: "2",
      productName: "Nimbus Phone X",
      productBrand: "Nimbus",
      category: "mobile",
      rating: 5,
      reviewerName: "Kavita Nair",
      location: "Kochi, Kerala",
      date: "Reviewed in India on 08 August 2026",
      headline: "Real camera test in low light — exceeded expectations!",
      text: "Captured this photo right after unboxing. Night portrait mode is remarkably sharp. Delivered with official GST warranty bill from ElectroMart. Highly recommend for mobile photography enthusiasts.",
      helpfulCount: 29
    },
    {
      id: "media-103",
      type: "photo",
      mediaUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      productId: "3",
      productName: "Pulse ANC Headphones",
      productBrand: "PulseWave",
      category: "audio",
      rating: 5,
      reviewerName: "Arjun Reddy",
      location: "Hyderabad, Telangana",
      date: "Reviewed in India on 02 August 2026",
      headline: "Desk setup setup completed! Noise cancellation is pure magic.",
      text: "Cuts out ambient city traffic and ceiling fan noise effortlessly. Ear cushions feel premium and don't heat up even during 4-hour conference calls. Seamless Bluetooth multipoint connection.",
      helpfulCount: 38
    },
    {
      id: "media-104",
      type: "video",
      mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
      duration: "1:12",
      productId: "7",
      productName: "Vector Gaming Laptop",
      productBrand: "Vector",
      category: "gaming",
      rating: 5,
      reviewerName: "Siddharth Gupta",
      location: "New Delhi, Delhi",
      date: "Reviewed in India on 26 July 2026",
      headline: "Gaming FPS Benchmark Test & Thermals Video",
      text: "Tested AAA titles on Ultra 1440p settings. Consistent 120+ FPS with excellent thermal management. Fans ramp up smoothly without high-pitch whine. Delivered in 1 day via ElectroMart Prime.",
      helpfulCount: 56
    },
    {
      id: "media-105",
      type: "photo",
      mediaUrl: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80",
      productId: "201",
      productName: "Epson EcoTank L3250 Wi-Fi Printer",
      productBrand: "Epson",
      category: "printer",
      rating: 4,
      reviewerName: "Pooja Verma",
      location: "Pune, Maharashtra",
      date: "Reviewed in India on 19 July 2026",
      headline: "Home study setup print quality & ink tank filling",
      text: "Spill-free ink bottles made initial setup foolproof. Wi-Fi Direct prints directly from mobile in seconds. Cost per page is negligible. Great investment for home office and school projects.",
      helpfulCount: 17
    },
    {
      id: "media-106",
      type: "photo",
      mediaUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
      productId: "1",
      productName: "AstraBook Pro 14 Laptop",
      productBrand: "AstraTech",
      category: "laptop",
      rating: 5,
      reviewerName: "Meera Iyer",
      location: "Chennai, Tamil Nadu",
      date: "Reviewed in India on 15 July 2026",
      headline: "Minimalist desk setup: Sleek aluminum finish",
      text: "The space gray aluminum chassis looks gorgeous beside my external monitor. Keyboard travel is crisp and trackpad is massive. 100% original product delivered by ElectroMart with genuine warranty.",
      helpfulCount: 31
    },
    {
      id: "media-107",
      type: "video",
      mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
      duration: "0:36",
      productId: "2",
      productName: "Nimbus Phone X",
      productBrand: "Nimbus",
      category: "mobile",
      rating: 5,
      reviewerName: "Amitabh Sen",
      location: "Kolkata, West Bengal",
      date: "Reviewed in India on 11 July 2026",
      headline: "Unboxing & Display Refresh Rate Check",
      text: "Super smooth 120Hz AMOLED panel. Haptics feel super tight and punchy. Fast charging topped it up in 28 minutes. Great deal on ElectroMart.",
      helpfulCount: 22
    },
    {
      id: "media-108",
      type: "video",
      mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      duration: "0:52",
      productId: "3",
      productName: "Pulse ANC Headphones",
      productBrand: "PulseWave",
      category: "audio",
      rating: 5,
      reviewerName: "Sneha Patel",
      location: "Ahmedabad, Gujarat",
      date: "Reviewed in India on 05 July 2026",
      headline: "ANC isolation test inside busy metro train",
      text: "Turned on ANC as soon as the train started. Rumble and track clicks vanished completely. Mic clarity on calls is crisp even in traffic.",
      helpfulCount: 35
    }
  ];

  // DOM Elements
  const customerMediaGrid = document.getElementById("customerMediaGrid");
  const mediaEmptyState = document.getElementById("mediaEmptyState");
  const mediaResultCountText = document.getElementById("mediaResultCountText");
  const mediaSearchInput = document.getElementById("mediaSearchInput");
  const mediaSearchClearBtn = document.getElementById("mediaSearchClearBtn");
  const mediaSortSelect = document.getElementById("mediaSortSelect");
  const mediaTypePills = document.querySelectorAll(".media-type-pill");
  const categoryPills = document.querySelectorAll(".category-pill");
  const activeFilterResetBtn = document.getElementById("activeFilterResetBtn");
  const emptyStateResetBtn = document.getElementById("emptyStateResetBtn");
  const loadMoreMediaBtn = document.getElementById("loadMoreMediaBtn");

  // Lightbox Elements
  const mediaLightboxModal = document.getElementById("mediaLightboxModal");
  const closeLightboxBtn = document.getElementById("closeLightboxBtn");
  const prevMediaBtn = document.getElementById("prevMediaBtn");
  const nextMediaBtn = document.getElementById("nextMediaBtn");
  const lightboxMediaHolder = document.getElementById("lightboxMediaHolder");
  const lightboxThumbStrip = document.getElementById("lightboxThumbStrip");
  const lightboxReviewerAvatar = document.getElementById("lightboxReviewerAvatar");
  const lightboxReviewerName = document.getElementById("lightboxReviewerName");
  const lightboxStars = document.getElementById("lightboxStars");
  const lightboxDate = document.getElementById("lightboxDate");
  const lightboxHeadline = document.getElementById("lightboxHeadline");
  const lightboxReviewBody = document.getElementById("lightboxReviewBody");
  const lightboxHelpfulBtn = document.getElementById("lightboxHelpfulBtn");
  const lightboxHelpfulCount = document.getElementById("lightboxHelpfulCount");
  const lightboxProdThumb = document.getElementById("lightboxProdThumb");
  const lightboxProdTitle = document.getElementById("lightboxProdTitle");
  const lightboxProdRating = document.getElementById("lightboxProdRating");
  const lightboxProdPrice = document.getElementById("lightboxProdPrice");
  const lightboxProdMrp = document.getElementById("lightboxProdMrp");
  const lightboxProdDiscount = document.getElementById("lightboxProdDiscount");
  const lightboxAddToCartBtn = document.getElementById("lightboxAddToCartBtn");
  const lightboxViewProductLink = document.getElementById("lightboxViewProductLink");

  // Upload Modal Elements
  const openUploadMediaBtn = document.getElementById("openUploadMediaBtn");
  const uploadMediaModal = document.getElementById("uploadMediaModal");
  const closeUploadModalBtn = document.getElementById("closeUploadModalBtn");
  const cancelUploadModalBtn = document.getElementById("cancelUploadModalBtn");
  const uploadMediaForm = document.getElementById("uploadMediaForm");
  const uploadProductSelect = document.getElementById("uploadProductSelect");
  const uploadMediaFileInput = document.getElementById("uploadMediaFileInput");
  const browseFilesBtn = document.getElementById("browseFilesBtn");
  const uploadPreviewGrid = document.getElementById("uploadPreviewGrid");
  const amzToast = document.getElementById("amzToast");

  // Active State
  let currentMediaType = "all";
  let currentCategory = "all";
  let currentSearchQuery = "";
  let currentSortBy = "recent";
  let targetProductId = "";
  let activeLightboxIndex = 0;
  let activeFilteredMedia = [];
  let pendingUploadFiles = [];
  let toastTimer = null;

  // Language & i18n
  function getLang() {
    return (
      localStorage.getItem("electromart_lang_v1") ||
      localStorage.getItem("electromart_lang") ||
      "en"
    ).toLowerCase();
  }

  function t(key, fallback) {
    const lang = getLang();
    if (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang] && window.EM_TRANSLATIONS[lang][key]) {
      return window.EM_TRANSLATIONS[lang][key];
    }
    if (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en && window.EM_TRANSLATIONS.en[key]) {
      return window.EM_TRANSLATIONS.en[key];
    }
    return fallback || "";
  }

  // Toast Notification
  function showToast(msg) {
    if (!amzToast) return;
    if (toastTimer) clearTimeout(toastTimer);
    amzToast.textContent = msg;
    amzToast.classList.add("show");
    toastTimer = setTimeout(() => {
      amzToast.classList.remove("show");
    }, 3200);
  }

  // Load & Seed Media from localStorage
  function loadCustomerMedia() {
    try {
      const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
      let parsed = raw ? JSON.parse(raw) : null;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        parsed = SEED_CUSTOMER_MEDIA;
        saveCustomerMedia(parsed);
      }
      return parsed;
    } catch {
      return SEED_CUSTOMER_MEDIA;
    }
  }

  function saveCustomerMedia(list) {
    try {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }

  // Parse URL Parameters (e.g. ?productId=1 or ?mediaId=media-102)
  function parseUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const pId = params.get("productId") || (window.location.pathname.includes("product-detail") ? params.get("id") : null);
      if (pId) {
        targetProductId = String(pId);
      }
      const mId = params.get("mediaId");
      if (mId) {
        // Will open after load
        window._initialMediaId = mId;
      }
    } catch {
      /* ignore */
    }
  }

  // Filter and Sort Engine
  function getFilteredMedia() {
    const all = loadCustomerMedia();

    let filtered = all.filter((item) => {
      // Product ID filter if present
      if (targetProductId && String(item.productId) !== targetProductId) {
        return false;
      }

      // Media Type filter
      if (currentMediaType === "photos" && item.type !== "photo") {
        return false;
      }
      if (currentMediaType === "videos" && item.type !== "video") {
        return false;
      }

      // Category filter
      if (currentCategory !== "all") {
        if (item.category !== currentCategory) return false;
      }

      // Search keyword
      if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        const pName = (item.productName || "").toLowerCase();
        const rName = (item.reviewerName || "").toLowerCase();
        const hLine = (item.headline || "").toLowerCase();
        const body = (item.text || "").toLowerCase();
        if (!pName.includes(q) && !rName.includes(q) && !hLine.includes(q) && !body.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (currentSortBy === "helpful") {
        return Number(b.helpfulCount || 0) - Number(a.helpfulCount || 0);
      }
      if (currentSortBy === "rating") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }
      // "recent" by default: preserve natural order or newer
      return 0;
    });

    return filtered;
  }

  // Render Grid Cards
  function renderMediaGrid() {
    if (!customerMediaGrid) return;
    activeFilteredMedia = getFilteredMedia();

    customerMediaGrid.innerHTML = "";

    // Result count text
    if (mediaResultCountText) {
      const count = activeFilteredMedia.length;
      mediaResultCountText.textContent = `Showing ${count} verified customer upload${count === 1 ? "" : "s"}`;
    }

    // Active filter reset link
    if (activeFilterResetBtn) {
      const hasActiveFilter = (
        currentMediaType !== "all" ||
        currentCategory !== "all" ||
        currentSearchQuery !== "" ||
        targetProductId !== ""
      );
      activeFilterResetBtn.hidden = !hasActiveFilter;
    }

    // Empty State Handling
    if (activeFilteredMedia.length === 0) {
      if (mediaEmptyState) mediaEmptyState.hidden = false;
      if (loadMoreMediaBtn) loadMoreMediaBtn.hidden = true;
      return;
    } else {
      if (mediaEmptyState) mediaEmptyState.hidden = true;
      if (loadMoreMediaBtn) loadMoreMediaBtn.hidden = false;
    }

    activeFilteredMedia.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "media-card";
      card.setAttribute("data-media-id", item.id);
      card.setAttribute("data-index", String(index));

      const isVideo = item.type === "video";
      const badgeText = isVideo ? (item.duration ? `▶ ${item.duration}` : "▶ Video") : "📷 Photo";
      const starsStr = "★".repeat(Math.max(1, Math.min(5, item.rating || 5)));
      const verifiedLabel = t("media_card_verified", "Verified Purchase");
      const initial = (item.reviewerName || "E").charAt(0).toUpperCase();

      card.innerHTML = `
        <div class="media-card-frame">
          <img src="${item.thumbnailUrl || FALLBACK_IMAGE_URL}" alt="${item.headline}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE_URL}'" />
          ${
            isVideo
              ? `<div class="media-video-overlay"><div class="media-play-icon" aria-hidden="true">▶</div></div>`
              : ""
          }
          <div class="media-badge-tag ${isVideo ? "video" : "photo"}">
            ${badgeText}
          </div>
        </div>
        <div class="media-card-content">
          <div class="media-product-bar">
            <img src="${item.thumbnailUrl || FALLBACK_IMAGE_URL}" alt="" class="media-product-thumb" onerror="this.src='${FALLBACK_IMAGE_URL}'" />
            <a href="product-detail.html?id=${item.productId}" class="media-product-title" title="${item.productName}" onclick="event.stopPropagation();">
              ${item.productName}
            </a>
          </div>

          <div class="media-review-meta">
            <span class="media-stars">${starsStr}</span>
            <span class="media-verified-badge">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="#c45500" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              ${verifiedLabel}
            </span>
          </div>

          <h3 class="media-review-headline">${item.headline}</h3>
          <p class="media-review-excerpt">${item.text}</p>

          <div class="media-card-footer">
            <div class="media-author-box">
              <span class="media-author-avatar">${initial}</span>
              <span class="media-author-name">${item.reviewerName}</span>
            </div>
            <button type="button" class="btn-card-helpful" data-helpful-id="${item.id}" onclick="event.stopPropagation(); window.voteHelpful('${item.id}', this);">
              👍 Helpful (${item.helpfulCount || 0})
            </button>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        openLightbox(index);
      });

      customerMediaGrid.appendChild(card);
    });

    // Check if initial deep-link mediaId was passed
    if (window._initialMediaId) {
      const idx = activeFilteredMedia.findIndex((m) => m.id === window._initialMediaId);
      if (idx !== -1) {
        openLightbox(idx);
      }
      window._initialMediaId = null;
    }
  }

  // ===========================================================================
  // Lightbox Engine (with Memory & Audio Hygiene)
  // ===========================================================================
  function stopActiveVideoPlayback() {
    if (!lightboxMediaHolder) return;
    const existingVideo = lightboxMediaHolder.querySelector("video");
    if (existingVideo) {
      try {
        existingVideo.pause();
        existingVideo.removeAttribute("src");
        existingVideo.load();
      } catch {
        /* ignore */
      }
    }
  }

  function openLightbox(index) {
    if (!mediaLightboxModal) return;
    if (index < 0 || index >= activeFilteredMedia.length) return;

    stopActiveVideoPlayback();
    activeLightboxIndex = index;
    const item = activeFilteredMedia[index];
    if (!item) return;

    // 1. Render Left Media Viewport
    if (lightboxMediaHolder) {
      lightboxMediaHolder.innerHTML = "";
      if (item.type === "video") {
        const vid = document.createElement("video");
        vid.src = item.mediaUrl;
        vid.poster = item.thumbnailUrl;
        vid.controls = true;
        vid.autoplay = true;
        vid.playsInline = true;
        lightboxMediaHolder.appendChild(vid);
      } else {
        const img = document.createElement("img");
        img.src = item.mediaUrl;
        img.alt = item.headline;
        lightboxMediaHolder.appendChild(img);
      }
    }

    // 2. Render Thumb Scrubber Strip
    if (lightboxThumbStrip) {
      lightboxThumbStrip.innerHTML = "";
      activeFilteredMedia.forEach((m, idx) => {
        const thumb = document.createElement("div");
        thumb.className = `scrubber-thumb ${idx === activeLightboxIndex ? "active" : ""}`;
        thumb.innerHTML = `<img src="${m.thumbnailUrl || FALLBACK_IMAGE_URL}" alt="" onerror="this.src='${FALLBACK_IMAGE_URL}'" />`;
        thumb.addEventListener("click", () => {
          openLightbox(idx);
        });
        lightboxThumbStrip.appendChild(thumb);
      });
      // Scroll active thumb into view
      const activeThumb = lightboxThumbStrip.querySelector(".scrubber-thumb.active");
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }

    // 3. Render Reviewer & Content Details
    if (lightboxReviewerAvatar) {
      lightboxReviewerAvatar.textContent = (item.reviewerName || "E").charAt(0).toUpperCase();
    }
    if (lightboxReviewerName) {
      lightboxReviewerName.textContent = item.reviewerName || "ElectroMart Customer";
    }
    if (lightboxStars) {
      lightboxStars.textContent = "★".repeat(Math.max(1, Math.min(5, item.rating || 5)));
    }
    if (lightboxDate) {
      lightboxDate.textContent = item.date || "Reviewed in India on August 2026";
    }
    if (lightboxHeadline) {
      lightboxHeadline.textContent = item.headline || "Customer Review";
    }
    if (lightboxReviewBody) {
      lightboxReviewBody.textContent = item.text || "";
    }
    if (lightboxHelpfulCount) {
      lightboxHelpfulCount.textContent = String(item.helpfulCount || 0);
    }

    // Helpful button state
    if (lightboxHelpfulBtn) {
      const votes = getHelpfulVotes();
      if (votes.includes(item.id)) {
        lightboxHelpfulBtn.classList.add("voted");
      } else {
        lightboxHelpfulBtn.classList.remove("voted");
      }
      lightboxHelpfulBtn.onclick = () => {
        window.voteHelpful(item.id, lightboxHelpfulBtn);
        if (lightboxHelpfulCount) {
          lightboxHelpfulCount.textContent = String(item.helpfulCount || 0);
        }
      };
    }

    // 4. Render Product Buybox Card
    const product = getCatalogProduct(item.productId) || {
      id: item.productId,
      name: item.productName,
      price: 29999,
      originalPrice: 34999,
      discount: 14,
      image: item.thumbnailUrl
    };

    if (lightboxProdThumb) {
      lightboxProdThumb.src = product.image || item.thumbnailUrl || FALLBACK_IMAGE_URL;
    }
    if (lightboxProdTitle) {
      lightboxProdTitle.textContent = product.name || item.productName;
      lightboxProdTitle.href = `product-detail.html?id=${product.id}`;
    }
    if (lightboxProdRating) {
      lightboxProdRating.textContent = `★★★★☆ (${product.rating || 4.6})`;
    }
    if (lightboxProdPrice) {
      lightboxProdPrice.textContent = money(product.price);
    }
    if (lightboxProdMrp) {
      lightboxProdMrp.textContent = product.originalPrice ? money(product.originalPrice) : "";
    }
    if (lightboxProdDiscount) {
      lightboxProdDiscount.textContent = product.discount ? `-${product.discount}%` : "";
    }
    if (lightboxViewProductLink) {
      lightboxViewProductLink.href = `product-detail.html?id=${product.id}`;
    }

    // 1-Click Add to Cart Action
    if (lightboxAddToCartBtn) {
      lightboxAddToCartBtn.onclick = () => {
        addItemToCart(product.id, 1);
        showToast(`Added ${product.name} to your cart!`);
      };
    }

    // Show modal if not open
    if (!mediaLightboxModal.open) {
      mediaLightboxModal.showModal();
    }
  }

  function closeLightbox() {
    stopActiveVideoPlayback();
    if (mediaLightboxModal && mediaLightboxModal.open) {
      mediaLightboxModal.close();
    }
  }

  function prevMedia() {
    if (activeFilteredMedia.length === 0) return;
    const nextIdx = (activeLightboxIndex - 1 + activeFilteredMedia.length) % activeFilteredMedia.length;
    openLightbox(nextIdx);
  }

  function nextMedia() {
    if (activeFilteredMedia.length === 0) return;
    const nextIdx = (activeLightboxIndex + 1) % activeFilteredMedia.length;
    openLightbox(nextIdx);
  }

  // Helpful Voting System
  function getHelpfulVotes() {
    try {
      const raw = localStorage.getItem(HELPFUL_VOTES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function voteHelpful(mediaId, btnEl) {
    const votes = getHelpfulVotes();
    const mediaList = loadCustomerMedia();
    const item = mediaList.find((m) => m.id === mediaId);
    if (!item) return;

    if (votes.includes(mediaId)) {
      // Toggle off
      const idx = votes.indexOf(mediaId);
      votes.splice(idx, 1);
      item.helpfulCount = Math.max(0, Number(item.helpfulCount || 1) - 1);
      if (btnEl) btnEl.classList.remove("voted");
    } else {
      // Toggle on
      votes.push(mediaId);
      item.helpfulCount = Number(item.helpfulCount || 0) + 1;
      if (btnEl) btnEl.classList.add("voted");
    }

    localStorage.setItem(HELPFUL_VOTES_KEY, JSON.stringify(votes));
    saveCustomerMedia(mediaList);

    // Update button text if on card
    if (btnEl) {
      btnEl.textContent = `👍 Helpful (${item.helpfulCount})`;
    }

    // Sync in activeFilteredMedia
    const fItem = activeFilteredMedia.find((m) => m.id === mediaId);
    if (fItem) fItem.helpfulCount = item.helpfulCount;
  }

  // Cart helper
  function addItemToCart(productId, qty) {
    try {
      const rawCart = localStorage.getItem(CART_STORAGE_KEY);
      const cartMap = rawCart ? JSON.parse(rawCart) : {};
      cartMap[String(productId)] = (Number(cartMap[String(productId)] || 0)) + (qty || 1);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));

      // Sync header cart count badge
      const headerCartBadge = document.getElementById("cartCount");
      if (headerCartBadge) {
        const total = Object.values(cartMap).reduce((a, b) => a + Number(b || 0), 0);
        headerCartBadge.textContent = String(total);
      }
    } catch {
      /* ignore */
    }
  }

  // Populate Products into Upload Modal Dropdown
  function populateProductDropdown() {
    if (!uploadProductSelect) return;
    const products = Array.isArray(window.EM_CATALOG) && window.EM_CATALOG.length > 0
      ? window.EM_CATALOG
      : fallbackCatalog;

    uploadProductSelect.innerHTML = `<option value="">-- Choose your purchased product --</option>`;
    products.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} (${money(p.price)})`;
      if (targetProductId && String(p.id) === targetProductId) {
        opt.selected = true;
      }
      uploadProductSelect.appendChild(opt);
    });
  }

  // Initialize Listeners
  function initEventListeners() {
    // Media Type Selector
    mediaTypePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        mediaTypePills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        currentMediaType = pill.getAttribute("data-type") || "all";
        renderMediaGrid();
      });
    });

    // Category Selector
    categoryPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        categoryPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        currentCategory = pill.getAttribute("data-cat") || "all";
        renderMediaGrid();
      });
    });

    // Search input
    if (mediaSearchInput) {
      mediaSearchInput.addEventListener("input", () => {
        currentSearchQuery = mediaSearchInput.value.trim();
        if (mediaSearchClearBtn) {
          mediaSearchClearBtn.hidden = currentSearchQuery.length === 0;
        }
        renderMediaGrid();
      });
    }

    if (mediaSearchClearBtn) {
      mediaSearchClearBtn.addEventListener("click", () => {
        if (mediaSearchInput) mediaSearchInput.value = "";
        currentSearchQuery = "";
        mediaSearchClearBtn.hidden = true;
        renderMediaGrid();
      });
    }

    // Sort select
    if (mediaSortSelect) {
      mediaSortSelect.addEventListener("change", () => {
        currentSortBy = mediaSortSelect.value || "recent";
        renderMediaGrid();
      });
    }

    // Reset filters
    const handleReset = () => {
      currentMediaType = "all";
      currentCategory = "all";
      currentSearchQuery = "";
      targetProductId = "";
      if (mediaSearchInput) mediaSearchInput.value = "";
      if (mediaSearchClearBtn) mediaSearchClearBtn.hidden = true;

      mediaTypePills.forEach((p) => p.classList.toggle("active", p.getAttribute("data-type") === "all"));
      categoryPills.forEach((p) => p.classList.toggle("active", p.getAttribute("data-cat") === "all"));
      renderMediaGrid();
    };

    if (activeFilterResetBtn) activeFilterResetBtn.addEventListener("click", handleReset);
    if (emptyStateResetBtn) emptyStateResetBtn.addEventListener("click", handleReset);

    // Lightbox Controls
    if (closeLightboxBtn) closeLightboxBtn.addEventListener("click", closeLightbox);
    if (prevMediaBtn) prevMediaBtn.addEventListener("click", prevMedia);
    if (nextMediaBtn) nextMediaBtn.addEventListener("click", nextMedia);

    // Keyboard Navigation for Lightbox
    document.addEventListener("keydown", (e) => {
      if (mediaLightboxModal && mediaLightboxModal.open) {
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          prevMedia();
        } else if (e.key === "ArrowRight") {
          nextMedia();
        }
      }
      if (uploadMediaModal && uploadMediaModal.open && e.key === "Escape") {
        uploadMediaModal.close();
      }
    });

    // Close on Backdrop Click
    [mediaLightboxModal, uploadMediaModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener("click", (e) => {
          const rect = modal.getBoundingClientRect();
          const isInDialog = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
          );
          if (!isInDialog) {
            if (modal === mediaLightboxModal) closeLightbox();
            else modal.close();
          }
        });
      }
    });

    // Upload Modal Controls
    if (openUploadMediaBtn && uploadMediaModal) {
      openUploadMediaBtn.addEventListener("click", () => {
        populateProductDropdown();
        uploadMediaModal.showModal();
      });
    }

    if (closeUploadModalBtn && uploadMediaModal) {
      closeUploadModalBtn.addEventListener("click", () => uploadMediaModal.close());
    }
    if (cancelUploadModalBtn && uploadMediaModal) {
      cancelUploadModalBtn.addEventListener("click", () => uploadMediaModal.close());
    }

    if (browseFilesBtn && uploadMediaFileInput) {
      browseFilesBtn.addEventListener("click", () => uploadMediaFileInput.click());
    }

    // Upload File Previews
    if (uploadMediaFileInput) {
      uploadMediaFileInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const isVid = file.type.startsWith("video/");
            pendingUploadFiles.push({
              type: isVid ? "video" : "photo",
              dataUrl: evt.target.result,
              name: file.name
            });
            renderUploadPreviews();
          };
          reader.readAsDataURL(file);
        });
        uploadMediaFileInput.value = "";
      });
    }

    // Upload Form Submission
    if (uploadMediaForm) {
      uploadMediaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pId = uploadProductSelect.value;
        const author = document.getElementById("uploadAuthorName").value.trim();
        const rating = Number(document.getElementById("uploadRatingSelect").value || 5);
        const headline = document.getElementById("uploadHeadlineInput").value.trim();
        const text = document.getElementById("uploadReviewTextInput").value.trim();

        if (!pId) {
          alert("Please select a product!");
          return;
        }

        const product = getCatalogProduct(pId);
        const primaryFile = pendingUploadFiles[0] || {
          type: "photo",
          dataUrl: product ? product.image : FALLBACK_IMAGE_URL
        };

        const newMediaItem = {
          id: "media-" + Date.now(),
          type: primaryFile.type,
          mediaUrl: primaryFile.dataUrl,
          thumbnailUrl: primaryFile.dataUrl,
          duration: primaryFile.type === "video" ? "0:35" : undefined,
          productId: String(pId),
          productName: product ? product.name : "ElectroMart Product",
          productBrand: product ? product.brand : "ElectroMart",
          category: product ? product.category : "laptop",
          rating: rating,
          reviewerName: author || "ElectroMart Customer",
          location: "India",
          date: `Reviewed in India on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
          headline: headline,
          text: text,
          helpfulCount: 0
        };

        const mediaList = loadCustomerMedia();
        mediaList.unshift(newMediaItem);
        saveCustomerMedia(mediaList);

        // Reset form & close
        pendingUploadFiles = [];
        renderUploadPreviews();
        uploadMediaForm.reset();
        uploadMediaModal.close();

        renderMediaGrid();
        showToast(t("media_upload_success_toast", "Thank you! Your media has been submitted to the verified customer gallery."));
      });
    }

    // Stop videos on page unload
    window.addEventListener("beforeunload", stopActiveVideoPlayback);
    window.addEventListener("unload", stopActiveVideoPlayback);
  }

  function renderUploadPreviews() {
    if (!uploadPreviewGrid) return;
    uploadPreviewGrid.innerHTML = pendingUploadFiles.map((file, idx) => `
      <div class="upload-preview-item">
        ${
          file.type === "video"
            ? `<video src="${file.dataUrl}"></video>`
            : `<img src="${file.dataUrl}" alt="Preview" />`
        }
        <button type="button" class="upload-preview-remove" data-idx="${idx}" onclick="window._removePendingUpload(${idx})">&times;</button>
      </div>
    `).join("");
  }

  window._removePendingUpload = function (idx) {
    pendingUploadFiles.splice(idx, 1);
    renderUploadPreviews();
  };

  // Window API for PDP and Testing
  window.loadCustomerMedia = loadCustomerMedia;
  saveCustomerMedia(loadCustomerMedia());
  window.saveCustomerMedia = saveCustomerMedia;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.prevMedia = prevMedia;
  window.nextMedia = nextMedia;
  window.voteHelpful = voteHelpful;
  window.setActiveCustomerMedia = function (list) {
    if (Array.isArray(list)) {
      activeFilteredMedia = list;
    }
  };

  // Initialize
  function init() {
    parseUrlParams();
    renderMediaGrid();
    initEventListeners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
