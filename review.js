/**
 * ==========================================================================
 * ELECTROMART INDIA - CUSTOMER REVIEWS CONTROLLER (PHASE 20)
 * review.js
 * ==========================================================================
 */

const REVIEW_STORAGE_KEY = "electromart_reviews_v1";

// DOM Elements
const reviewForm = document.getElementById("reviewForm");
const reviewProduct = document.getElementById("reviewProduct");
const reviewRating = document.getElementById("reviewRating");
const reviewHeadline = document.getElementById("reviewHeadline");
const reviewText = document.getElementById("reviewText");
const reviewerName = document.getElementById("reviewerName");
const reviewList = document.getElementById("reviewList");
const starRatingButtons = document.getElementById("starRatingButtons");
const starRatingLabel = document.getElementById("starRatingLabel");
const reviewMediaInput = document.getElementById("reviewMediaInput");
const reviewUploadBtn = document.getElementById("reviewUploadBtn");
const reviewMediaPreviewStrip = document.getElementById("reviewMediaPreviewStrip");
const reviewSuccessBanner = document.getElementById("reviewSuccessBanner");
const backToProductLink = document.getElementById("backToProductLink");

// State
let currentProduct = null;
let currentRating = 5;
let uploadedImages = [];

/**
 * Translation helper
 */
function getTranslation(key, fallback) {
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  if (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang] && window.EM_TRANSLATIONS[currentLang][key]) {
    return window.EM_TRANSLATIONS[currentLang][key];
  }
  if (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS.en && window.EM_TRANSLATIONS.en[key]) {
    return window.EM_TRANSLATIONS.en[key];
  }
  return fallback || key;
}

/**
 * Resolve product from query params or fallback
 */
function resolveProduct() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("productId") || params.get("id");
  
  const catalog = (typeof getUnifiedCatalog === "function") 
    ? getUnifiedCatalog() 
    : (window.PRODUCTS_DATA || window.products || []);

  if (rawId && Array.isArray(catalog) && catalog.length > 0) {
    currentProduct = catalog.find((p) => String(p.id) === String(rawId) || String(p.sku) === String(rawId)) || null;
  }

  // Fallback to first product if none found or not specified
  if (!currentProduct && Array.isArray(catalog) && catalog.length > 0) {
    currentProduct = catalog[0];
  }

  renderProductOverview();
}

/**
 * Render Product Overview Card
 */
function renderProductOverview() {
  const imgEl = document.getElementById("reviewProductImg");
  const titleEl = document.getElementById("reviewProductTitle");
  const brandEl = document.getElementById("reviewProductBrand");
  const priceEl = document.getElementById("reviewProductPrice");
  const ratingEl = document.getElementById("reviewProductRating");

  if (!currentProduct) {
    if (titleEl) titleEl.textContent = "ElectroMart Product";
    return;
  }

  if (imgEl) {
    imgEl.src = currentProduct.image || "product-placeholder.svg";
    imgEl.alt = currentProduct.name || "Product";
  }
  if (titleEl) titleEl.textContent = currentProduct.name || "Product";
  if (brandEl) brandEl.textContent = currentProduct.brand || "ElectroMart";
  if (priceEl) {
    const formattedPrice = Number(currentProduct.price || 0).toLocaleString("en-IN");
    priceEl.textContent = `₹${formattedPrice}`;
  }
  if (ratingEl) {
    const r = Number(currentProduct.rating || 4.5).toFixed(1);
    ratingEl.textContent = `★★★★☆ (${r})`;
  }
  if (reviewProduct) {
    reviewProduct.value = currentProduct.name || "";
  }
  if (backToProductLink) {
    backToProductLink.href = `product-detail.html?id=${encodeURIComponent(currentProduct.id)}`;
  }
}

/**
 * Interactive Star Rating Handler
 */
function initStarRating() {
  if (!starRatingButtons) return;

  const starBtns = Array.from(starRatingButtons.querySelectorAll(".star-rating-btn"));

  function updateStars(rating, isHover = false) {
    starBtns.forEach((btn, idx) => {
      const starVal = idx + 1;
      btn.classList.toggle("active", !isHover && starVal <= rating);
      btn.classList.toggle("hovered", isHover && starVal <= rating);
    });

    const ratingKey = `review_rating_${rating}`;
    const defaultLabels = { 1: "Poor", 2: "Fair", 3: "Average", 4: "Good", 5: "Great" };
    if (starRatingLabel) {
      starRatingLabel.textContent = getTranslation(ratingKey, defaultLabels[rating] || "Great");
    }
  }

  starBtns.forEach((btn) => {
    const ratingVal = Number(btn.getAttribute("data-rating") || 5);

    btn.addEventListener("mouseenter", () => {
      updateStars(ratingVal, true);
    });

    btn.addEventListener("click", () => {
      currentRating = ratingVal;
      if (reviewRating) reviewRating.value = String(currentRating);
      updateStars(currentRating, false);
    });
  });

  starRatingButtons.addEventListener("mouseleave", () => {
    updateStars(currentRating, false);
  });

  // Initial state
  updateStars(currentRating, false);
}

/**
 * Media Upload & Preview
 */
function initMediaUpload() {
  if (!reviewUploadBtn || !reviewMediaInput) return;

  reviewUploadBtn.addEventListener("click", () => {
    reviewMediaInput.click();
  });

  reviewMediaInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImages.push(e.target.result);
        renderMediaPreviews();
      };
      reader.readAsDataURL(file);
    });

    reviewMediaInput.value = "";
  });
}

function renderMediaPreviews() {
  if (!reviewMediaPreviewStrip) return;

  if (uploadedImages.length === 0) {
    reviewMediaPreviewStrip.innerHTML = "";
    return;
  }

  reviewMediaPreviewStrip.innerHTML = uploadedImages
    .map((src, index) => `
      <div class="review-preview-item" data-index="${index}">
        <img src="${src}" alt="Preview ${index + 1}" />
        <button type="button" class="review-preview-remove" data-remove-index="${index}" aria-label="Remove image">&times;</button>
      </div>
    `)
    .join("");

  reviewMediaPreviewStrip.querySelectorAll(".review-preview-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(btn.getAttribute("data-remove-index"));
      if (!isNaN(idx)) {
        uploadedImages.splice(idx, 1);
        renderMediaPreviews();
      }
    });
  });
}

/**
 * Load Reviews from localStorage
 */
function loadReviews() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

/**
 * Save Reviews to localStorage
 */
function saveReviews(list) {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn("Unable to save reviews:", error);
  }
}

/**
 * Generate default seed reviews for Indian context if list is empty
 */
function getSeedReviews(pId) {
  return [
    {
      id: "seed_1_" + (pId || "1"),
      productId: String(pId || "1"),
      product: currentProduct ? currentProduct.name : "ElectroMart Product",
      rating: 5,
      headline: "Outstanding build quality and fast delivery!",
      text: "Packaging was secure with tamper-evident seal. Product arrived with full manufacturer warranty and GST invoice. Highly satisfied with ElectroMart service.",
      reviewerName: "Amit Sharma",
      verified: true,
      date: "18 August 2026",
      images: [],
      helpfulCount: 28
    },
    {
      id: "seed_2_" + (pId || "1"),
      productId: String(pId || "1"),
      product: currentProduct ? currentProduct.name : "ElectroMart Product",
      rating: 4,
      headline: "Value for money electronics purchase",
      text: "Performs exactly as described in technical specifications. Sleek design, battery life is solid, and setup was effortless.",
      reviewerName: "Sneha Patel",
      verified: true,
      date: "04 August 2026",
      images: [],
      helpfulCount: 14
    }
  ];
}

/**
 * Render Customer Reviews List
 */
function renderReviews() {
  if (!reviewList) return;

  const allReviews = loadReviews();
  const currentPId = currentProduct ? String(currentProduct.id) : "";

  // Filter reviews matching current product, or show all if general
  let filtered = allReviews.filter((r) => !currentPId || String(r.productId) === currentPId);

  // If no saved reviews for this product, append seed reviews
  if (filtered.length === 0) {
    filtered = getSeedReviews(currentPId);
  }

  const starSymbol = "★";
  const emptyStar = "☆";

  reviewList.innerHTML = filtered
    .map((item, idx) => {
      const ratingNum = Math.max(1, Math.min(5, Number(item.rating) || 5));
      const starsStr = starSymbol.repeat(ratingNum) + emptyStar.repeat(5 - ratingNum);
      const initial = (item.reviewerName || "E").charAt(0).toUpperCase();
      const verifiedText = getTranslation("verified_purchase", "Verified Purchase");

      const imagesHtml = Array.isArray(item.images) && item.images.length > 0
        ? `<div class="customer-review-images">
            ${item.images.map((img) => `<img class="customer-review-img-thumb" src="${img}" alt="Customer photo" />`).join("")}
          </div>`
        : "";

      return `
        <article class="customer-review-card" id="reviewCard_${item.id || idx}">
          <div class="customer-review-author-row">
            <div class="customer-review-avatar">${initial}</div>
            <span class="customer-review-name">${escapeHtml(item.reviewerName || "ElectroMart Customer")}</span>
          </div>
          <div class="customer-review-rating-row">
            <span class="customer-review-stars">${starsStr}</span>
            <span class="customer-review-headline">${escapeHtml(item.headline || item.product || "Customer Review")}</span>
          </div>
          <div class="customer-review-date">Reviewed in India on ${escapeHtml(item.date || "August 2026")}</div>
          <div class="customer-review-verified">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#c45500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <span>${verifiedText}</span>
          </div>
          <p class="customer-review-body">${escapeHtml(item.text)}</p>
          ${imagesHtml}
          <div class="customer-review-helpful-row">
            <button type="button" class="customer-review-helpful-btn" data-review-id="${item.id || idx}">
              ${getTranslation("helpful_button", "Helpful")} (<span class="helpful-num">${item.helpfulCount || 0}</span>)
            </button>
            <span class="report-abuse-link">Report</span>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach helpful button listeners
  reviewList.querySelectorAll(".customer-review-helpful-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn._voted) return;
      btn._voted = true;
      btn.classList.add("voted");
      const numSpan = btn.querySelector(".helpful-num");
      if (numSpan) {
        numSpan.textContent = String(Number(numSpan.textContent) + 1);
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Handle Review Form Submission
 */
if (reviewForm) {
  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const product = currentProduct ? currentProduct.name : (reviewProduct ? reviewProduct.value.trim() : "ElectroMart Product");
    const pId = currentProduct ? String(currentProduct.id) : "1";
    const rating = currentRating;
    const headline = reviewHeadline ? reviewHeadline.value.trim() : "";
    const text = reviewText ? reviewText.value.trim() : "";
    const name = reviewerName && reviewerName.value.trim() ? reviewerName.value.trim() : "ElectroMart Customer";

    if (!rating || !text) {
      alert("Please provide both a star rating and your review experience.");
      return;
    }

    const newReview = {
      id: "rev_" + Date.now(),
      productId: pId,
      product: product,
      rating: rating,
      headline: headline || "Verified Product Review",
      text: text,
      reviewerName: name,
      verified: true,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      images: [...uploadedImages],
      helpfulCount: 0
    };

    const existing = loadReviews();
    existing.unshift(newReview);
    saveReviews(existing);

    // Show success banner
    if (reviewSuccessBanner) {
      reviewSuccessBanner.hidden = false;
      reviewSuccessBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Reset form state
    reviewForm.reset();
    currentRating = 5;
    if (reviewRating) reviewRating.value = "5";
    uploadedImages = [];
    renderMediaPreviews();
    initStarRating();

    // Re-render recent reviews list
    renderReviews();
  });
}

/**
 * Initialize on DOM Load
 */
document.addEventListener("DOMContentLoaded", () => {
  resolveProduct();
  initStarRating();
  initMediaUpload();
  renderReviews();

  // Pre-fill reviewer name if logged in
  try {
    const authRaw = localStorage.getItem("electromart_auth_v1");
    if (authRaw) {
      const authObj = JSON.parse(authRaw);
      if (authObj && authObj.name && reviewerName) {
        reviewerName.value = authObj.name;
      }
    }
  } catch (e) {
    // Ignore error
  }

  // Handle language updates
  window.addEventListener("languageChanged", () => {
    const ratingKey = `review_rating_${currentRating}`;
    const defaultLabels = { 1: "Poor", 2: "Fair", 3: "Average", 4: "Good", 5: "Great" };
    if (starRatingLabel) {
      starRatingLabel.textContent = getTranslation(ratingKey, defaultLabels[currentRating] || "Great");
    }
    renderReviews();
  });
});
