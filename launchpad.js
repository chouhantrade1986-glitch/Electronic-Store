/* ElectroMart Launchpad Hub JavaScript (Phase 38) */
/* Defensive controller for startup discovery, pre-orders, and applications. */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.Launchpad = electroMart.Launchpad || root.ElectroMartLaunchpad || {};
  // Keep the historical namespace as a compatibility alias without adding a new global.
  root.ElectroMartLaunchpad = namespace;

  var STORAGE_KEY = 'electromart_startup_applications_v1';
  var FEATURED_STARTUP_KEY = 'electromart_featured_startup_v1';
  var RESERVATION_STORAGE_KEY = 'electromart_launchpad_reservations_v1';
  // Retain these keys as read-only compatibility references for older integrations.
  var CART_STORAGE_KEY = 'electromart_cart_v1';
  var CATALOG_STORAGE_KEY = 'electromart_catalog_v1';
  var MAX_APPLICATIONS = 50;
  var MAX_RESERVATIONS = 50;
  var MAX_QUANTITY = 99;
  var PAGE_SIZE = 6;

  var CATEGORY_VALUES = [
    'electronics',
    'wearables',
    'home-automation',
    'audio',
    'computing',
    'gaming'
  ];
  var SORT_VALUES = ['featured', 'funded', 'discount', 'backers'];
  var APPLICATION_STATUS_VALUES = [
    'idea',
    'prototype',
    'ready-to-launch',
    'launched'
  ];

  var memoryStorage = createMemoryStorage();
  var products = [];
  var applications = [];
  var featuredStartup = null;
  var state = {
    activeCategory: 'all',
    visibleLimit: PAGE_SIZE,
    searchQuery: '',
    sortBy: 'featured',
    initialized: false
  };

  function createMemoryStorage() {
    var values = Object.create(null);
    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(values, String(key)) ? values[String(key)] : null;
      },
      setItem: function (key, value) {
        values[String(key)] = String(value);
      },
      removeItem: function (key) {
        delete values[String(key)];
      }
    };
  }

  function getStorage() {
    try {
      if (globalWindow && globalWindow.localStorage && typeof globalWindow.localStorage.getItem === 'function') {
        return globalWindow.localStorage;
      }
    } catch (error) {
      // Access to storage can be denied by the browser; use the fallback below.
    }

    try {
      if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
        return localStorage;
      }
    } catch (error) {
      // Access to the global storage binding can also be denied.
    }

    return memoryStorage;
  }

  function readStorage(key) {
    try {
      return getStorage().getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      var storage = getStorage();
      if (!storage || typeof storage.setItem !== 'function') {
        memoryStorage.setItem(key, value);
      } else {
        storage.setItem(key, value);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function parseJson(value, fallback) {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    try {
      var parsed = JSON.parse(value);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function cleanText(value, maxLength) {
    var text = value === null || value === undefined ? '' : String(value).replace(/\s+/g, ' ').trim();
    if (!maxLength || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim();
  }

  function numberOr(value, fallback) {
    var parsed = Number(value);
    return typeof parsed === 'number' && isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function isAllowed(value, allowed) {
    return allowed.indexOf(String(value || '').toLowerCase()) !== -1;
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function byId(id) {
    if (!doc || typeof doc.getElementById !== 'function') return null;
    try {
      return doc.getElementById(id);
    } catch (error) {
      return null;
    }
  }

  function query(selector, scope) {
    var node = scope || doc;
    if (!node || typeof node.querySelector !== 'function') return null;
    try {
      return node.querySelector(selector);
    } catch (error) {
      return null;
    }
  }

  function queryAll(selector, scope) {
    var node = scope || doc;
    if (!node || typeof node.querySelectorAll !== 'function') return [];
    try {
      return Array.prototype.slice.call(node.querySelectorAll(selector));
    } catch (error) {
      return [];
    }
  }

  function hasMethod(value, method) {
    return Boolean(value && typeof value[method] === 'function');
  }

  function getLanguage() {
    var saved = readStorage('electromart_lang_v1') || readStorage('electromart_lang') || 'en';
    return String(saved).toLowerCase();
  }

  function text(key, fallback) {
    var dictionaries = root.EM_TRANSLATIONS || {};
    var language = getLanguage();
    var dictionary = dictionaries[language] || dictionaries.en || {};
    return dictionary[key] || fallback || key;
  }

  function formatNumber(value) {
    var amount = Math.max(0, numberOr(value, 0));
    try {
      if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
      }
    } catch (error) {
      // Fall through to the lightweight formatter.
    }
    return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function money(value) {
    return '₹' + formatNumber(value);
  }

  function safeImage(value) {
    var image = cleanText(value, 500);
    if (!image) return '';
    if (/^(?:javascript|vbscript|data):/i.test(image)) return 'product-placeholder.svg';
    return image;
  }

  function signal(product) {
    return [product && product.name, product && product.title, product && product.brand, product && product.category, product && product.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  function renderProductVisual(product, extraClass, imageClass) {
    var visual = cleanText(product && product.visual, 24).toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'solar';
    var image = safeImage(product && product.image);
    var hasRealImage = image && image !== 'product-placeholder.svg' && !/placeholder/i.test(image);
    if (hasRealImage) {
      return '<img class="' + escapeHtml(imageClass || 'product-image') + '" src="' + escapeHtml(image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy">';
    }
    return '<div class="product-art product-art--' + escapeHtml(visual) + (extraClass ? ' ' + escapeHtml(extraClass) : '') + '" role="img" aria-label="' + escapeHtml(product.name) + '">' +
      '<span class="art-grid" aria-hidden="true"></span>' +
      '<span class="art-orbit" aria-hidden="true"></span>' +
      '<span class="art-core" aria-hidden="true"></span>' +
    '</div>';
  }

  function createSampleProducts() {
    return [
      {
        id: 'launchpad-solarsmart-charger',
        name: 'SolarSmart Charger',
        description: 'Portable solar charger with a built-in power bank for outdoor adventures.',
        image: '',
        price: 2999,
        originalPrice: 3999,
        discount: 25,
        fundingGoal: 500000,
        currentFunding: 375000,
        backers: 124,
        category: 'electronics',
        earlyBird: true,
        visual: 'solar'
      },
      {
        id: 'launchpad-ecotrack-fitness-band',
        name: 'EcoTrack Fitness Band',
        description: 'Biodegradable fitness tracker with heart-rate monitoring and sleep analysis.',
        image: '',
        price: 4999,
        originalPrice: 6499,
        discount: 23,
        fundingGoal: 750000,
        currentFunding: 525000,
        backers: 89,
        category: 'wearables',
        earlyBird: true,
        visual: 'eco'
      },
      {
        id: 'launchpad-smarthome-hub-mini',
        name: 'SmartHome Hub Mini',
        description: 'Compact voice-controlled home automation hub supporting the Matter protocol.',
        image: '',
        price: 3499,
        originalPrice: 4499,
        discount: 22,
        fundingGoal: 400000,
        currentFunding: 280000,
        backers: 67,
        category: 'home-automation',
        earlyBird: true,
        visual: 'hub'
      },
      {
        id: 'launchpad-aurabuds-mini',
        name: 'AuraBuds Mini',
        description: 'Lightweight spatial-audio earbuds tuned by an emerging Indian audio studio.',
        image: '',
        price: 2799,
        originalPrice: 3499,
        discount: 20,
        fundingGoal: 300000,
        currentFunding: 246000,
        backers: 143,
        category: 'audio',
        earlyBird: true,
        visual: 'audio'
      }
    ];
  }

  function normalizeProduct(rawProduct) {
    if (!rawProduct || typeof rawProduct !== 'object') return null;
    var source = null;
    var rawId = rawProduct.id;
    if (rawId !== undefined && rawId !== null) {
      source = products.find(function (product) { return String(product.id) === String(rawId); }) || null;
    }
    var base = source || {};
    var name = cleanText(rawProduct.name || base.name, 140);
    if (!name) return null;
    var price = Math.max(0, numberOr(rawProduct.price !== undefined ? rawProduct.price : base.price, 0));
    var originalPrice = Math.max(price, numberOr(rawProduct.originalPrice !== undefined ? rawProduct.originalPrice : base.originalPrice, price));
    var discountValue = rawProduct.discount !== undefined ? rawProduct.discount : base.discount;
    var calculatedDiscount = originalPrice > 0 ? Math.round((1 - (price / originalPrice)) * 100) : 0;
    var discount = clamp(Math.round(numberOr(discountValue, calculatedDiscount)), 0, 99);
    var category = String(rawProduct.category || base.category || 'electronics').toLowerCase();
    if (!isAllowed(category, CATEGORY_VALUES)) category = 'electronics';

    return {
      id: rawProduct.id !== undefined ? rawProduct.id : (base.id || 0),
      name: name,
      description: cleanText(rawProduct.description || base.description, 700),
      image: safeImage(rawProduct.image || base.image),
      price: price,
      originalPrice: originalPrice,
      discount: discount,
      fundingGoal: Math.max(0, numberOr(rawProduct.fundingGoal !== undefined ? rawProduct.fundingGoal : base.fundingGoal, 0)),
      currentFunding: Math.max(0, numberOr(rawProduct.currentFunding !== undefined ? rawProduct.currentFunding : base.currentFunding, 0)),
      backers: Math.max(0, Math.floor(numberOr(rawProduct.backers !== undefined ? rawProduct.backers : base.backers, 0))),
      category: category,
      earlyBird: rawProduct.earlyBird !== undefined ? Boolean(rawProduct.earlyBird) : Boolean(base.earlyBird),
      visual: cleanText(rawProduct.visual || base.visual || category, 24).toLowerCase().replace(/[^a-z0-9-]/g, '-')
    };
  }

  function sanitizeApplication(rawApplication) {
    if (!rawApplication || typeof rawApplication !== 'object') return null;
    var startupName = cleanText(rawApplication.startupName, 120);
    var founderEmail = cleanText(rawApplication.founderEmail, 254).toLowerCase();
    var description = cleanText(rawApplication.startupDescription, 2000);
    var category = String(rawApplication.productCategory || '').toLowerCase();
    if (startupName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founderEmail) || description.length < 10 || !isAllowed(category, CATEGORY_VALUES)) {
      return null;
    }

    var dpiitNumber = cleanText(rawApplication.dpiitNumber, 40).toUpperCase();
    if (dpiitNumber && !/^[A-Z0-9-]{6,40}$/.test(dpiitNumber)) dpiitNumber = '';

    var applyStatus = String(rawApplication.applyStatus || 'prototype').toLowerCase();
    if (!isAllowed(applyStatus, APPLICATION_STATUS_VALUES)) applyStatus = 'prototype';

    var fundingGoal = clamp(numberOr(rawApplication.fundingGoal, 0), 0, 1000000000000);
    var currentFunding = clamp(numberOr(rawApplication.currentFunding, 0), 0, 1000000000000);
    var rawId = rawApplication.id;
    var id = rawId === undefined || rawId === null ? Date.now() : cleanText(rawId, 40);

    return {
      id: id,
      timestamp: cleanText(rawApplication.timestamp, 80) || new Date().toISOString(),
      startupName: startupName,
      founderEmail: founderEmail,
      productCategory: category,
      dpiitNumber: dpiitNumber || null,
      applyStatus: applyStatus,
      startupDescription: description,
      fundingGoal: fundingGoal,
      currentFunding: currentFunding
    };
  }

  function loadApplications() {
    var parsed = parseJson(readStorage(STORAGE_KEY), []);
    applications = Array.isArray(parsed)
      ? parsed.map(sanitizeApplication).filter(Boolean).slice(-MAX_APPLICATIONS)
      : [];
  }

  function saveApplications() {
    return writeStorage(STORAGE_KEY, JSON.stringify(applications.slice(-MAX_APPLICATIONS)));
  }

  function loadFeaturedStartup() {
    var parsed = parseJson(readStorage(FEATURED_STARTUP_KEY), null);
    featuredStartup = normalizeProduct(parsed);
  }

  function saveFeaturedStartup() {
    if (!featuredStartup) return false;
    return writeStorage(FEATURED_STARTUP_KEY, JSON.stringify(featuredStartup));
  }

  function loadSampleProducts() {
    products = createSampleProducts().map(normalizeProduct).filter(Boolean);
  }

  function getProductById(productId) {
    var key = String(productId === undefined || productId === null ? '' : productId);
    var direct = products.find(function (product) { return String(product.id) === key; });
    if (direct) return direct;
    if (featuredStartup && String(featuredStartup.id) === key) return normalizeProduct(featuredStartup);
    // Older deep links used 1-based sample indexes; keep them readable without
    // reintroducing catalog ID collisions in storage.
    if (/^\d+$/.test(key)) {
      var legacyIndex = Number(key) - 1;
      if (legacyIndex >= 0 && legacyIndex < products.length) return products[legacyIndex];
    }
    return null;
  }

  function getRequestedProduct() {
    var location = root.location || (doc && doc.location);
    var search = location && typeof location.search === 'string' ? location.search : '';
    var match = search.match(/[?&]productId=([^&]+)/i);
    if (!match) return null;
    var id;
    try {
      id = decodeURIComponent(match[1]);
    } catch (error) {
      id = match[1];
    }
    return getProductById(id);
  }

  function getFundingTotals() {
    if (featuredStartup) {
      return {
        goal: numberOr(featuredStartup.fundingGoal, 0),
        current: numberOr(featuredStartup.currentFunding, 0),
        backers: numberOr(featuredStartup.backers, 0)
      };
    }
    return products.reduce(function (totals, product) {
      totals.goal += numberOr(product.fundingGoal, 0);
      totals.current += numberOr(product.currentFunding, 0);
      totals.backers += numberOr(product.backers, 0);
      return totals;
    }, { goal: 0, current: 0, backers: 0 });
  }

  function calculateFundingProgress(current, goal) {
    var currentAmount = Math.max(0, numberOr(current, 0));
    var goalAmount = numberOr(goal, 0);
    if (goalAmount <= 0) return 0;
    return clamp(Math.round((currentAmount / goalAmount) * 100), 0, 100);
  }

  function fundingLabel(product) {
    var current = money(product.currentFunding);
    var goal = money(product.fundingGoal);
    return text('launchpad_funded_of_goal', '{current} of {goal} funded').replace('{current}', current).replace('{goal}', goal);
  }

  function progressMarkup(product, className) {
    var progress = calculateFundingProgress(product.currentFunding, product.fundingGoal);
    return '<div class="' + className + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress + '" aria-label="' + escapeHtml(text('launchpad_funding_progress', 'Funding progress')) + '"><span style="width:' + progress + '%"></span></div>';
  }

  function translateDynamicContent() {
    if (hasMethod(root, 'applyGlobalThemeTranslation')) {
      try { root.applyGlobalThemeTranslation(); } catch (error) { /* Translation bus is optional in lightweight hosts. */ }
    }
  }

  function renderFeaturedStartup() {
    var container = query('.spotlight-container');
    if (!container) return;
    var product = normalizeProduct(featuredStartup) || products[0];
    if (!product) return;
    featuredStartup = product;
    var progress = calculateFundingProgress(product.currentFunding, product.fundingGoal);

    container.innerHTML = '<div class="spotlight-product">' +
      '<div class="spotlight-media">' +
        renderProductVisual(product, 'spotlight-art', 'spotlight-image') +
        '<span class="early-bird-badge" data-i18n="launchpad_early_bird">Early bird</span>' +
      '</div>' +
      '<div class="spotlight-info">' +
        '<p class="launchpad-eyebrow" data-i18n="launchpad_featured_eyebrow">Featured startup</p>' +
        '<h3 class="spotlight-title">' + escapeHtml(product.name) + '</h3>' +
        '<p class="spotlight-description">' + escapeHtml(product.description) + '</p>' +
        '<div class="spotlight-price">' +
          '<span class="discount-percent">-' + product.discount + '%</span>' +
          '<span class="price">' + money(product.price) + '</span>' +
          '<span class="mrp">M.R.P.: ' + money(product.originalPrice) + '</span>' +
        '</div>' +
        '<p class="tax-inclusive-note" data-i18n="launchpad_taxes_included">Inclusive of all taxes</p>' +
        '<div class="launchpad-progress spotlight-progress">' +
          '<div class="progress-label"><span data-i18n="launchpad_funding_progress">Funding progress</span><strong>' + progress + '%</strong></div>' +
          progressMarkup(product, 'funding-progress-bar') +
          '<div class="progress-meta"><span>' + escapeHtml(fundingLabel(product)) + '</span><span>' + formatNumber(product.backers) + ' ' + escapeHtml(text('launchpad_backers', 'backers')) + '</span></div>' +
        '</div>' +
        '<button type="button" class="btn-secondary" id="spotlightPreorderBtn2" data-launchpad-preorder="' + escapeHtml(product.id) + '" data-i18n="launchpad_preorder_btn">Pre-Order Now</button>' +
      '</div>' +
    '</div>';
    translateDynamicContent();
  }

  function getFilteredProducts() {
    var queryText = state.searchQuery.trim().toLowerCase();
    var filtered = products.filter(function (product) {
      var categoryMatch = state.activeCategory === 'all' || product.category === state.activeCategory;
      var queryMatch = !queryText || signal(product).indexOf(queryText) !== -1;
      return categoryMatch && queryMatch;
    });
    if (state.sortBy === 'funded') {
      return filtered.sort(function (a, b) { return numberOr(b.currentFunding, 0) - numberOr(a.currentFunding, 0); });
    }
    if (state.sortBy === 'discount') {
      return filtered.sort(function (a, b) { return numberOr(b.discount, 0) - numberOr(a.discount, 0); });
    }
    if (state.sortBy === 'backers') {
      return filtered.sort(function (a, b) { return numberOr(b.backers, 0) - numberOr(a.backers, 0); });
    }
    return filtered;
  }

  function renderProductCard(product, index) {
    var progress = calculateFundingProgress(product.currentFunding, product.fundingGoal);
    var categoryLabel = text('launchpad_category_' + product.category.replace(/-/g, '_'), product.category);
    return '<article class="product-card fade-in" style="--launchpad-delay:' + Math.min(index * 60, 360) + 'ms" data-launchpad-category="' + escapeHtml(product.category) + '">' +
      '<div class="product-image-wrap">' +
        renderProductVisual(product, 'product-card-art', 'product-image') +
        (product.earlyBird ? '<span class="early-bird-badge" data-i18n="launchpad_early_bird">Early bird</span>' : '') +
      '</div>' +
      '<div class="product-info">' +
        '<div class="product-card-topline"><span class="product-category-label">' + escapeHtml(categoryLabel) + '</span><span class="discount-badge">-' + product.discount + '%</span></div>' +
        '<h3 class="product-title">' + escapeHtml(product.name) + '</h3>' +
        '<p class="product-description">' + escapeHtml(product.description) + '</p>' +
        '<div class="product-price"><span class="price-tag">' + money(product.price) + '</span><span class="original-price">M.R.P.: ' + money(product.originalPrice) + '</span></div>' +
        '<p class="tax-inclusive-note" data-i18n="launchpad_taxes_included">Inclusive of all taxes</p>' +
        '<div class="launchpad-progress product-progress">' +
          '<div class="progress-label"><span data-i18n="launchpad_funding_progress">Funding progress</span><strong>' + progress + '%</strong></div>' +
          progressMarkup(product, 'funding-progress-bar') +
          '<div class="progress-meta"><span>' + escapeHtml(fundingLabel(product)) + '</span><span>' + formatNumber(product.backers) + ' ' + escapeHtml(text('launchpad_backers', 'backers')) + '</span></div>' +
        '</div>' +
        '<div class="product-actions">' +
          '<button type="button" class="action-btn btn-preorder" data-launchpad-preorder="' + escapeHtml(product.id) + '" data-i18n="launchpad_preorder_btn">Pre-Order</button>' +
          '<button type="button" class="action-btn btn-details" data-launchpad-details="' + escapeHtml(product.id) + '" data-i18n="launchpad_details_btn">Details</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderProducts() {
    var container = byId('launchpadProductsContainer');
    if (!container) return;
    var filtered = getFilteredProducts();
    var visible = filtered.slice(0, state.visibleLimit);
    container.innerHTML = visible.map(renderProductCard).join('');

    var emptyState = byId('launchpadEmptyState');
    if (emptyState) {
      emptyState.hidden = visible.length > 0;
      emptyState.textContent = text('launchpad_no_products', 'No startup products match this filter.');
    }

    var results = byId('launchpadResultsMeta');
    if (results) {
      results.textContent = visible.length + ' / ' + filtered.length + ' ' + text('launchpad_results', 'products');
    }

    var loadMore = byId('loadMoreBtn');
    if (loadMore) {
      loadMore.hidden = visible.length >= filtered.length;
    }
    translateDynamicContent();
  }

  function setProgressElement(element, progress) {
    if (!element) return;
    var fill = element.firstElementChild;
    if (fill && fill.style) fill.style.width = progress + '%';
    else if (element.style) element.style.width = progress + '%';
    if (typeof element.setAttribute === 'function') element.setAttribute('aria-valuenow', String(progress));
  }

  function updateFundingProgress() {
    var totals = getFundingTotals();
    var progress = calculateFundingProgress(totals.current, totals.goal);
    var fundedPercent = byId('fundedPercent');
    var heroFundingPercent = byId('heroFundingPercent');
    var backersCount = byId('backersCount');
    if (fundedPercent) fundedPercent.textContent = money(totals.current);
    if (heroFundingPercent) heroFundingPercent.textContent = progress + '%';
    if (backersCount) backersCount.textContent = formatNumber(totals.backers);

    setProgressElement(byId('fundingProgressBar'), progress);
    setProgressElement(byId('spotlightFundingBar'), progress);
    setProgressElement(query('.spotlight-progress .funding-progress-bar'), progress);
  }

  function dispatch(name, detail) {
    if (!root || typeof root.dispatchEvent !== 'function') return;
    var event = null;
    try {
      if (typeof root.CustomEvent === 'function') {
        event = new root.CustomEvent(name, { detail: detail });
      } else if (typeof root.Event === 'function') {
        event = new root.Event(name);
        event.detail = detail;
      } else if (doc && typeof doc.createEvent === 'function') {
        event = doc.createEvent('CustomEvent');
        event.initCustomEvent(name, false, false, detail);
      }
    } catch (error) {
      event = null;
    }
    if (event) {
      try { root.dispatchEvent(event); } catch (error) { /* Event support is optional. */ }
    }
  }

  function getReservations() {
    var parsed = parseJson(readStorage(RESERVATION_STORAGE_KEY), []);
    return Array.isArray(parsed) ? parsed.filter(function (item) {
      return item && typeof item === 'object' && item.productId;
    }).slice(-MAX_RESERVATIONS) : [];
  }

  function writeReservation(product, quantity) {
    var safeQuantity = clamp(Math.floor(numberOr(quantity, 1)), 1, MAX_QUANTITY);
    var reservations = getReservations();
    reservations.push({
      productId: String(product.id),
      productName: product.name,
      quantity: safeQuantity,
      earlyBirdPrice: product.price,
      mrp: product.originalPrice,
      status: 'reserved',
      reservedAt: new Date().toISOString()
    });
    return writeStorage(RESERVATION_STORAGE_KEY, JSON.stringify(reservations.slice(-MAX_RESERVATIONS)));
  }

  function setFeedback(message, kind, targetId) {
    var feedback = byId(targetId || 'launchpadFeedback') || byId('launchpadApplyStatus');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = 'launchpad-status' + (kind ? ' is-' + kind : '');
    feedback.hidden = !message;
  }

  function reserveEarlyBird(productOrId, quantity) {
    var product = productOrId && typeof productOrId === 'object'
      ? normalizeProduct(productOrId)
      : getProductById(productOrId);
    if (!product) {
      setFeedback(text('launchpad_product_unavailable', 'This startup product is not available right now.'), 'error');
      return null;
    }

    if (!writeReservation(product, quantity || 1)) {
      setFeedback(text('launchpad_storage_error', 'We could not save your early-bird reservation. Please try again.'), 'error');
      return null;
    }

    var message = text('launchpad_reserved', '{name} is reserved for early access. No payment is collected in this demo.').replace('{name}', product.name);
    var detailsModal = byId('launchpadDetailsModal');
    var detailsIsOpen = detailsModal && (detailsModal.open || (typeof detailsModal.hasAttribute === 'function' && detailsModal.hasAttribute('open')));
    setFeedback(message, 'success', detailsIsOpen ? 'launchpadDetailsStatus' : undefined);
    dispatch('electromart:launchpadReserved', {
      productId: product.id,
      productName: product.name,
      quantity: Math.max(1, Math.floor(numberOr(quantity, 1))),
      earlyBirdPrice: product.price
    });
    return product;
  }

  // Backward-compatible public name: this is a reservation, not a stocked cart item.
  function addToCart(productOrId, quantity) {
    return reserveEarlyBird(productOrId, quantity);
  }

  function viewProductDetails(productId) {
    var product = getProductById(productId);
    if (!product) {
      setFeedback(text('launchpad_product_unavailable', 'This startup product is not available right now.'), 'error');
      return null;
    }
    var visual = byId('launchpadDetailsVisual');
    var name = byId('launchpadDetailsName');
    var description = byId('launchpadDetailsDescription');
    var price = byId('launchpadDetailsPrice');
    var funding = byId('launchpadDetailsFunding');
    var backers = byId('launchpadDetailsBackers');
    var progressPercent = byId('launchpadDetailsProgressPercent');
    var progressBar = byId('launchpadDetailsProgressBar');
    var preorder = byId('launchpadDetailsPreorderBtn');
    var category = byId('launchpadDetailsCategory');
    var progress = calculateFundingProgress(product.currentFunding, product.fundingGoal);
    if (visual) visual.innerHTML = renderProductVisual(product, 'details-art', 'details-image');
    if (name) name.textContent = product.name;
    if (description) description.textContent = product.description;
    if (price) price.textContent = money(product.price) + ' · M.R.P.: ' + money(product.originalPrice);
    if (funding) funding.textContent = fundingLabel(product);
    if (backers) backers.textContent = formatNumber(product.backers) + ' ' + text('launchpad_backers', 'backers');
    if (progressPercent) progressPercent.textContent = progress + '%';
    setProgressElement(progressBar, progress);
    if (preorder && typeof preorder.setAttribute === 'function') preorder.setAttribute('data-launchpad-preorder', String(product.id));
    if (category) category.textContent = text('launchpad_category_' + product.category.replace(/-/g, '_'), product.category);
    translateDynamicContent();
    openDialog('launchpadDetailsModal');
    return product;
  }

  function getFormValue(form, name) {
    try {
      if (typeof FormData === 'function') {
        var formData = new FormData(form);
        if (formData && typeof formData.get === 'function') {
          var value = formData.get(name);
          if (value !== null && value !== undefined) return value;
        }
      }
    } catch (error) {
      // Fall back to reading the named control directly.
    }
    var field = byId(name);
    if (!field && form && typeof form.querySelector === 'function') {
      try { field = form.querySelector('[name="' + name + '"]'); } catch (error) { field = null; }
    }
    return field && field.value !== undefined ? field.value : '';
  }

  function validateApplication(values) {
    var startupName = cleanText(values.startupName, 120);
    var founderEmail = cleanText(values.founderEmail, 254).toLowerCase();
    var productCategory = String(values.productCategory || '').toLowerCase();
    var description = cleanText(values.startupDescription, 2000);
    var dpiitNumber = cleanText(values.dpiitNumber, 40).toUpperCase();
    var applyStatus = String(values.applyStatus || 'prototype').toLowerCase();
    var fundingGoalRaw = cleanText(values.fundingGoal, 30);
    var currentFundingRaw = cleanText(values.currentFunding, 30);
    var fundingGoal = fundingGoalRaw ? numberOr(fundingGoalRaw, NaN) : 0;
    var currentFunding = currentFundingRaw ? numberOr(currentFundingRaw, NaN) : 0;
    var invalid = text('launchpad_invalid_form', 'Please check the highlighted application details and try again.');

    if (startupName.length < 2 || startupName.length > 120) return { valid: false, message: invalid };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founderEmail) || founderEmail.length > 254) return { valid: false, message: invalid };
    if (!isAllowed(productCategory, CATEGORY_VALUES)) return { valid: false, message: invalid };
    if (description.length < 10 || description.length > 2000) return { valid: false, message: invalid };
    if (dpiitNumber && !/^[A-Z0-9-]{6,40}$/.test(dpiitNumber)) return { valid: false, message: invalid };
    if (!isAllowed(applyStatus, APPLICATION_STATUS_VALUES)) return { valid: false, message: invalid };
    if (fundingGoalRaw && (!isFinite(fundingGoal) || fundingGoal < 100000 || fundingGoal > 1000000000000)) return { valid: false, message: invalid };
    if (currentFundingRaw && (!isFinite(currentFunding) || currentFunding < 0 || currentFunding > 1000000000000)) return { valid: false, message: invalid };

    return {
      valid: true,
      application: {
        id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        startupName: startupName,
        founderEmail: founderEmail,
        productCategory: productCategory,
        dpiitNumber: dpiitNumber || null,
        applyStatus: applyStatus,
        startupDescription: description,
        fundingGoal: fundingGoal,
        currentFunding: currentFunding
      }
    };
  }

  function showApplicationSuccess(application) {
    var applicationIdDisplay = byId('applicationIdDisplay');
    if (applicationIdDisplay) {
      var numericId = String(application.id).replace(/\D/g, '').slice(-6);
      if (numericId.length !== 6) numericId = String(Date.now()).slice(-6);
      applicationIdDisplay.textContent = 'EM-LP-' + numericId;
    }
    openDialog('applySuccessModal');
  }

  function handleApplicationSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (!form) form = byId('startupApplyForm');
    if (!form) return false;

    if (hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setFeedback(text('launchpad_invalid_form', 'Please check the highlighted application details and try again.'), 'error', 'launchpadApplyStatus');
      return false;
    }

    var values = {
      startupName: getFormValue(form, 'startupName'),
      founderEmail: getFormValue(form, 'founderEmail'),
      productCategory: getFormValue(form, 'productCategory'),
      dpiitNumber: getFormValue(form, 'dpiitNumber'),
      applyStatus: getFormValue(form, 'applyStatus'),
      startupDescription: getFormValue(form, 'startupDescription'),
      fundingGoal: getFormValue(form, 'fundingGoal'),
      currentFunding: getFormValue(form, 'currentFunding')
    };
    var validation = validateApplication(values);
    if (!validation.valid) {
      setFeedback(validation.message, 'error', 'launchpadApplyStatus');
      return false;
    }

    applications.push(validation.application);
    if (applications.length > MAX_APPLICATIONS) applications = applications.slice(-MAX_APPLICATIONS);
    if (!saveApplications()) {
      applications.pop();
      setFeedback(text('launchpad_storage_error', 'We could not save your application. Please try again.'), 'error', 'launchpadApplyStatus');
      return false;
    }

    setFeedback(text('launchpad_apply_success', 'Application submitted successfully.'), 'success', 'launchpadApplyStatus');
    closeApplyModal();
    showApplicationSuccess(validation.application);
    if (hasMethod(form, 'reset')) {
      try { form.reset(); } catch (error) { /* Reset is optional in lightweight DOM shims. */ }
    }
    return true;
  }

  function openDialog(id) {
    var dialog = byId(id);
    if (!dialog) return;
    dialog.hidden = false;
    if (hasMethod(dialog, 'showModal')) {
      try {
        dialog.showModal();
        return;
      } catch (error) {
        // Fall through to the non-dialog fallback below.
      }
    }
    if (typeof dialog.setAttribute === 'function') dialog.setAttribute('open', '');
  }

  function closeDialog(id) {
    var dialog = byId(id);
    if (!dialog) return;
    if (hasMethod(dialog, 'close')) {
      try { dialog.close(); } catch (error) { /* Fall through to the fallback. */ }
    }
    dialog.hidden = true;
    if (typeof dialog.removeAttribute === 'function') dialog.removeAttribute('open');
  }

  function openApplyModal() {
    openDialog('startupApplyModal');
  }

  function closeApplyModal() {
    closeDialog('startupApplyModal');
  }

  function closeSuccessModal() {
    closeDialog('applySuccessModal');
  }

  function closeDetailsModal() {
    closeDialog('launchpadDetailsModal');
  }

  function findAttribute(target, attribute) {
    var node = target;
    while (node && node !== doc) {
      if (typeof node.getAttribute === 'function' && node.getAttribute(attribute) !== null) return node;
      node = node.parentNode;
    }
    return null;
  }

  function handleClick(event) {
    if (!event) return;
    var target = event.target;
    var preorderButton = findAttribute(target, 'data-launchpad-preorder');
    if (preorderButton) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      reserveEarlyBird(preorderButton.getAttribute('data-launchpad-preorder'));
      return;
    }

    var detailsButton = findAttribute(target, 'data-launchpad-details');
    if (detailsButton) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      viewProductDetails(detailsButton.getAttribute('data-launchpad-details'));
      return;
    }

    var filterButton = findAttribute(target, 'data-category');
    if (filterButton && filterButton.classList && filterButton.classList.contains('filter-btn')) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      state.activeCategory = String(filterButton.getAttribute('data-category') || 'all');
      state.visibleLimit = PAGE_SIZE;
      queryAll('.filter-btn').forEach(function (button) {
        var active = button === filterButton;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      renderProducts();
    }
  }

  function setupEventListeners() {
    if (namespace._listenersBound) return;
    namespace._listenersBound = true;

    var form = byId('startupApplyForm');
    if (form && !form._launchpadBound && typeof form.addEventListener === 'function') {
      form._launchpadBound = true;
      form.addEventListener('submit', handleApplicationSubmit);
    }

    var openButton = byId('openApplyModalBtn');
    if (openButton && typeof openButton.addEventListener === 'function' && !openButton._launchpadBound) {
      openButton._launchpadBound = true;
      openButton.addEventListener('click', openApplyModal);
    }

    [['closeApplyModalBtn', closeApplyModal], ['cancelApplyBtn', closeApplyModal], ['closeSuccessModalBtn', closeSuccessModal], ['applySuccessCloseBtn', closeSuccessModal], ['closeDetailsModalBtn', closeDetailsModal], ['closeDetailsModalBtn2', closeDetailsModal]].forEach(function (binding) {
      var button = byId(binding[0]);
      if (button && typeof button.addEventListener === 'function' && !button._launchpadBound) {
        button._launchpadBound = true;
        button.addEventListener('click', binding[1]);
      }
    });

    var heroPreorder = byId('spotlightPreorderBtn');
    if (heroPreorder && typeof heroPreorder.addEventListener === 'function' && !heroPreorder._launchpadBound) {
      heroPreorder._launchpadBound = true;
      heroPreorder.addEventListener('click', function () {
        if (featuredStartup) reserveEarlyBird(featuredStartup.id);
      });
    }

    var loadMore = byId('loadMoreBtn');
    if (loadMore && typeof loadMore.addEventListener === 'function' && !loadMore._launchpadBound) {
      loadMore._launchpadBound = true;
      loadMore.addEventListener('click', function () {
        state.visibleLimit += PAGE_SIZE;
        renderProducts();
      });
    }

    var searchInput = byId('launchpadSearchInput');
    if (searchInput && typeof searchInput.addEventListener === 'function' && !searchInput._launchpadBound) {
      searchInput._launchpadBound = true;
      searchInput.addEventListener('input', function (event) {
        setSearchQuery(event && event.target ? event.target.value : '');
      });
    }

    var sortSelect = byId('launchpadSortSelect');
    if (sortSelect && typeof sortSelect.addEventListener === 'function' && !sortSelect._launchpadBound) {
      sortSelect._launchpadBound = true;
      sortSelect.addEventListener('change', function (event) {
        setSort(event && event.target ? event.target.value : 'featured');
      });
    }

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('click', handleClick);
      doc.addEventListener('keydown', function (event) {
        if (event && event.key === 'Escape') {
          var applyModal = byId('startupApplyModal');
          var successModal = byId('applySuccessModal');
          var detailsModal = byId('launchpadDetailsModal');
          var applyIsOpen = applyModal && (applyModal.open || (typeof applyModal.hasAttribute === 'function' && applyModal.hasAttribute('open')));
          var successIsOpen = successModal && (successModal.open || (typeof successModal.hasAttribute === 'function' && successModal.hasAttribute('open')));
          var detailsIsOpen = detailsModal && (detailsModal.open || (typeof detailsModal.hasAttribute === 'function' && detailsModal.hasAttribute('open')));
          if (applyIsOpen) closeApplyModal();
          if (successIsOpen) closeSuccessModal();
          if (detailsIsOpen) closeDetailsModal();
        }
      });
      doc.addEventListener('click', function (event) {
        var applyModal = byId('startupApplyModal');
        var successModal = byId('applySuccessModal');
        var detailsModal = byId('launchpadDetailsModal');
        if (applyModal && event && event.target === applyModal) closeApplyModal();
        if (successModal && event && event.target === successModal) closeSuccessModal();
        if (detailsModal && event && event.target === detailsModal) closeDetailsModal();
      });
    }

    if (root && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        if (!event) return;
        if (event.key === STORAGE_KEY) loadApplications();
        if (event.key === FEATURED_STARTUP_KEY) loadFeaturedStartup();
        if (event.key === 'electromart_lang_v1' || event.key === 'electromart_lang') {
          renderFeaturedStartup();
          renderProducts();
          updateFundingProgress();
          refreshStaticTranslations();
        }
      });
      root.addEventListener('languageChanged', function () {
        renderFeaturedStartup();
        renderProducts();
        updateFundingProgress();
        refreshStaticTranslations();
      });
    }
  }

  function refreshStaticTranslations() {
    if (hasMethod(root, 'applyGlobalThemeTranslation')) {
      try { root.applyGlobalThemeTranslation(); } catch (error) { /* Translation bus is optional. */ }
    }
  }

  function init() {
    loadSampleProducts();
    loadApplications();
    loadFeaturedStartup();
    var requestedProduct = getRequestedProduct();
    if (requestedProduct) featuredStartup = requestedProduct;
    if (!featuredStartup) featuredStartup = products[0] || null;
    setupEventListeners();
    renderFeaturedStartup();
    renderProducts();
    updateFundingProgress();
    refreshStaticTranslations();
    state.initialized = true;
    return namespace;
  }

  function setCategory(category) {
    state.activeCategory = isAllowed(category, CATEGORY_VALUES) || category === 'all' ? String(category) : 'all';
    state.visibleLimit = PAGE_SIZE;
    queryAll('.filter-btn').forEach(function (button) {
      var active = button.getAttribute('data-category') === state.activeCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderProducts();
  }

  function setSearchQuery(value) {
    state.searchQuery = cleanText(value, 120);
    state.visibleLimit = PAGE_SIZE;
    var searchInput = byId('launchpadSearchInput');
    if (searchInput && typeof searchInput.value === 'string' && searchInput.value !== state.searchQuery) searchInput.value = state.searchQuery;
    renderProducts();
  }

  function setSort(value) {
    var nextSort = String(value || 'featured').toLowerCase();
    state.sortBy = isAllowed(nextSort, SORT_VALUES) ? nextSort : 'featured';
    state.visibleLimit = PAGE_SIZE;
    var sortSelect = byId('launchpadSortSelect');
    if (sortSelect) sortSelect.value = state.sortBy;
    renderProducts();
  }

  function setFeaturedStartup(value) {
    var product = normalizeProduct(value);
    if (!product) return null;
    featuredStartup = product;
    saveFeaturedStartup();
    renderFeaturedStartup();
    updateFundingProgress();
    return product;
  }

  function getApplications() {
    return applications.slice();
  }

  function getProducts() {
    return products.slice();
  }

  namespace.init = init;
  namespace.reserveEarlyBird = reserveEarlyBird;
  namespace.addToCart = addToCart;
  namespace.getReservations = getReservations;
  namespace.viewProductDetails = viewProductDetails;
  namespace.openApplyModal = openApplyModal;
  namespace.closeApplyModal = closeApplyModal;
  namespace.closeSuccessModal = closeSuccessModal;
  namespace.closeDetailsModal = closeDetailsModal;
  namespace.handleApplicationSubmit = handleApplicationSubmit;
  namespace.validateApplication = validateApplication;
  namespace.calculateFundingProgress = calculateFundingProgress;
  namespace.updateFundingProgress = updateFundingProgress;
  namespace.setCategory = setCategory;
  namespace.setSearchQuery = setSearchQuery;
  namespace.setSort = setSort;
  namespace.setFeaturedStartup = setFeaturedStartup;
  namespace.getApplications = getApplications;
  namespace.getProducts = getProducts;
  namespace.STORAGE_KEY = STORAGE_KEY;
  namespace.FEATURED_STARTUP_KEY = FEATURED_STARTUP_KEY;
  namespace.RESERVATION_STORAGE_KEY = RESERVATION_STORAGE_KEY;
  namespace.CART_STORAGE_KEY = CART_STORAGE_KEY;
  namespace.CATALOG_STORAGE_KEY = CATALOG_STORAGE_KEY;
  root.calculateFundingProgress = calculateFundingProgress;

  if (doc && doc.readyState === 'loading' && typeof doc.addEventListener === 'function') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}), typeof document !== 'undefined' ? document : null);
