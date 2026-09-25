<!--- Full header.js content --->
(function() {
  'use strict';
  
  const CART_STORAGE_KEY = "electromart_cart_v1";
  
  if (typeof window.applyFullPageTranslation !== 'function' && typeof document !== 'undefined') {
    const transScript = document.createElement('script');
    transScript.src = 'translations.js';
    transScript.onload = () => {
      if (typeof applySavedLanguage === 'function') {
        applySavedLanguage();
      }
    };
    if (document.head) {
      document.head.appendChild(transScript);
    }
  }
  
  function loadCartMap() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
      return {};
    }
  }
  
  function syncCartCount() {
    const cartMap = loadCartMap();
    const total = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
    const cartCountEl = document.getElementById('cartCount') || document.querySelector('[id="cartCount"]');
    if (cartCountEl) {
      cartCountEl.textContent = String(total);
    }
    const checkoutCountEl = document.getElementById('checkoutHeaderItemCount');
    if (checkoutCountEl) {
      checkoutCountEl.textContent = String(total);
    }
  }

  function syncCheckoutHeaderCount() {
    syncCartCount();
  }
  
  function getLocalizedNavText(key, fallbackText) {
    const lang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang]) ? window.EM_TRANSLATIONS[lang] : (typeof translations !== "undefined" ? translations[lang] : null);
    return (dict && dict[key]) ? dict[key] : (fallbackText || key);
  }

  const PRIME_STORAGE_KEY = "electromart_prime_status_v1";

  function syncHeaderPrimeBadge() {
    try {
      const badge = document.getElementById('headerPrimeCrownBadge');
      if (!badge) return;
      const raw = localStorage.getItem(PRIME_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && parsed.active) {
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    } catch (e) {
      console.warn('syncHeaderPrimeBadge error:', e);
    }
  }

  function injectHeader() {
    const container = document.getElementById('headerContainer');
    if (!container) return;
    
    container.innerHTML = `
    <header class="site-header" id="siteHeader">
      <nav class="top-nav">
        <a href="index.html" class="brand logo-block" aria-label="ElectroMart home">
          <span class="brand-main">electro<span class="brand-accent">mart</span></span>
          <span class="brand-sub">.in</span>
        </a>
        <!-- Amazon Distraction-Free Checkout Header Bar (Shown only on checkout) -->
        <div class="amz-checkout-distraction-free-bar" id="checkoutHeaderBar">
          <div class="amz-checkout-header-middle">
            <span class="amz-checkout-header-title" data-i18n="checkout_title">Checkout</span> <span class="amz-checkout-header-cart-wrap">(<a href="cart.html" id="checkoutHeaderCountLink" class="amz-checkout-header-cart-link"><span id="checkoutHeaderItemCount">0</span> <span data-i18n="items">items</span></a>)</span>
          </div>
          <div class="amz-checkout-header-secure">
            <svg class="amz-checkout-lock-icon" viewBox="0 0 24 24" width="18" height="18" fill="#007600" aria-hidden="true">
              <path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm3 8H9V7c0-1.66 1.34-3 3-3s3 1.34 3 3v3z"/>
            </svg>
            <span class="amz-checkout-lock-text" data-i18n="checkout_secure_badge">100% Secure</span>
          </div>
        </div>
        <button class="deliver-btn" id="locationTrigger" type="button" aria-haspopup="dialog" aria-controls="locationModal">
          <span class="deliver-to-prefix"><span data-i18n="deliver_to_prefix">Deliver to</span> <strong id="deliveryLocationText">New Delhi 110001</strong></span>
        </button>
        <div class="search-stack search-bar-wrapper">
          <form id="searchForm" class="search-form" role="search" action="products.html" method="get" data-shared-search="1">
            <div class="nav-search-facade-wrap" id="navCategoryFacadeWrap">
              <span class="nav-search-facade-text" id="navCategoryLabel">All <span class="nav-arrow">▾</span></span>
              <select id="categoryFilter" class="search-context-select" data-search-catalog="1" aria-label="Filter category">
                <option id="catAll" data-i18n="categoryFilter.all" value="all">All Categories</option>
                <option id="catComputer" data-i18n="categoryFilter.computer" value="computer">Computers &amp; Desktops</option>
                <option id="catLaptop" data-i18n="categoryFilter.laptop" value="laptop">Laptops &amp; Accessories</option>
                <option id="catComponents" data-i18n="categoryFilter.components" value="components">Components &amp; Parts</option>
                <option id="catPrinter" data-i18n="categoryFilter.printer" value="printer">Printers &amp; Cartridges</option>
                <option id="catAudio" data-i18n="categoryFilter.audio" value="audio">Audio &amp; Headphones</option>
                <option id="catMobile" data-i18n="categoryFilter.mobile" value="mobile">Mobile Accessories</option>
              </select>
            </div>
            <div class="search-input-wrap">
              <input id="searchInput" type="search" name="search" placeholder="Search ElectroMart.in" data-i18n-placeholder="search_placeholder" aria-label="Search products" autocomplete="off" />
              <button id="searchClearBtn" class="search-clear-btn" type="button" aria-label="Clear search" hidden>&times;</button>
              <div id="searchSuggestions" class="search-suggestions" hidden></div>
            </div>
            <button id="searchSubmitBtn" class="search-submit-btn" type="submit" aria-label="Submit search">
              <svg class="search-lens-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#111111" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5"></circle>
                <line x1="15.5" y1="15.5" x2="21" y2="21"></line>
              </svg>
            </button>
          </form>
        </div>
        <div class="nav-actions">
          <div class="nav-lang-dropdown-wrap">
            <a href="language-settings.html" class="nav-lang-picker nav-action-card" title="Change Language">
              <span class="flag-icon">🇮🇳</span>
              <span class="lang-text">EN</span>
              <span class="nav-arrow">▾</span>
            </a>
            <div class="lang-flyout-menu" id="navLangFlyout" aria-label="Language options">
              <div class="flyout-arrow"></div>
              <div class="lang-flyout-list">
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="en" /> <span>English - EN</span></label>
                <div class="lang-flyout-divider"></div>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="hi" /> <span>हिन्दी - HI</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ta" /> <span>தமிழ் - TA</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="te" /> <span>తెలుగు - TE</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="kn" /> <span>ಕನ್ನಡ - KN</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ml" /> <span>മലയാളം - ML</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="bn" /> <span>বাংলা - BN</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="mr" /> <span>मराठी - MR</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ur" /> <span>اردو - UR</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="pa" /> <span>ਪੰਜਾਬੀ - PA</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="gu" /> <span>ગુજરાતી - GU</span></label>
              </div>
              <div class="lang-flyout-footer">
                <a href="language-settings.html" data-i18n="lang_info_title">भाषा सेटिंग बदलें ›</a>
              </div>
            </div>
          </div>
          <div class="nav-account-dropdown-wrap">
            <a href="login.html" class="account-link nav-action-card" id="navAccountTrigger">
              <span data-i18n="hello_sign_in">Hello, sign in</span>
              <strong style="display: flex; align-items: center; gap: 4px;"><span data-i18n="account_lists">Account &amp; Lists ▾</span><span id="headerPrimeCrownBadge" class="nav-prime-crown-badge" style="display: none; color: #ffd814; font-size: 11px; font-weight: 800; background: rgba(0, 168, 225, 0.25); border: 1px solid #00a8e1; border-radius: 4px; padding: 1px 4px; line-height: 1.2;">👑 Prime</span></strong>
            </a>
            <div class="account-flyout-menu" id="navAccountFlyout" aria-label="Account and Lists Menu">
              <div class="flyout-arrow"></div>
              <div class="flyout-top-signin">
                <a href="login.html" class="flyout-signin-btn" data-i18n="drawer_sign_in">Sign in</a>
                <p class="flyout-new-customer"><span data-i18n="new_customer">New customer?</span> <a href="register.html" data-i18n="start_here">Start here.</a></p>
              </div>
              <div class="flyout-columns">
                <div class="flyout-col">
                  <h3 data-i18n="nav.yourLists">Your Lists</h3>
                  <a href="wishlist.html" data-i18n="nav.createWishlist">Create a Wish List</a>
                  <a href="registry.html" data-i18n="registry_hero_title">Gift Registry &amp; Celebrations</a>
                  <a href="wishlist.html" data-i18n="nav.wishAnyWebsite">Wish from Any Website</a>
                  <a href="wishlist.html" data-i18n="nav.yourSavedItems">Your Saved Items</a>
                  <a href="products.html" data-i18n="nav.discoverStyle">Discover Your Style</a>
                  <a href="mega-store.html" data-i18n="nav.exploreShowroom">Explore Showroom</a>
                   <a href="launchpad.html" data-i18n="nav_launchpad">ElectroMart Launchpad</a>
                </div>
                <div class="flyout-col">
                  <h3 data-i18n="footer.yourAccount">Your Account</h3>
                  <a href="account.html" data-i18n="footer.yourAccount">Your Account</a>
                  <a href="prime.html" data-i18n="prime_hub_title">Your Prime Membership</a>
                  <a href="orders.html" data-i18n="nav.orders">Your Orders</a>
                  <a href="wishlist.html" data-i18n="footer.wishlist">Your Wish List</a>
                  <a href="todays-deals.html" data-i18n="nav.yourRecommendations">Your Recommendations</a>
                  <a href="pc-builder.html" data-i18n="dept.pcBuilder">PC Builder &amp; Custom PC</a>
                  <a href="terms-and-conditions.html" data-i18n="category.customerService">Customer Service</a>
                  <a href="faq.html" data-i18n="footer.faq">FAQ &amp; Help</a>
                </div>
              </div>
            </div>
          </div>
          <a href="orders.html" class="orders-link nav-action-card">
            <span data-i18n="returns">Returns</span>
            <strong data-i18n="orders">&amp; Orders</strong>
          </a>
          <a href="cart.html" class="cart-link nav-action-card" aria-label="Shopping Cart">
            <div class="cart-icon-container">
              <span id="cartCount" class="cart-count-badge">0</span>
              <svg class="cart-trolley-icon" viewBox="0 0 38 32" width="38" height="32" aria-hidden="true">
                <path fill="#ffffff" d="M10 24c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zm18 0c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zM8.5 6L11 18h18l3.6-12H8.5zM6.1 2H2v3h2.6l4.6 15.6c-.3.5-.5 1.1-.5 1.7 0 1.7 1.3 3 3 3h19v-3H11.8c-.2 0-.3-.1-.3-.3l.1-.6 1.4-2.4H28c1.1 0 2.1-.6 2.6-1.6l4.9-10.4c.3-.6.1-1.3-.4-1.7-.5-.4-1.2-.4-1.7-.1L32 5H7.2L6.1 2z"/>
              </svg>
            </div>
            <span class="cart-text" data-i18n="cart">Cart</span>
          </a>
        </div>
      </nav>

      <nav class="category-nav home-main-nav" aria-label="Main navigation">
        <button id="deptTrigger" class="dept-trigger amazon-hamburger" type="button" aria-expanded="false" aria-controls="deptSidebar">
          <span class="hamburger-icon" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          <span class="hamburger-label" data-i18n="all">All</span>
        </button>
        <div class="category-quick-links">
          <a href="todays-deals.html" class="category-quick-link" data-i18n="todays_deals">Today's Deals</a>
          <a href="prime.html" class="category-quick-link nav-prime-link" data-i18n="prime_nav_link" style="color: #00a8e1; font-weight: 700;">👑 Prime</a>
          <a href="best-sellers.html" class="category-quick-link" data-i18n="best_sellers">Best Sellers</a>
          <a href="products.html" class="category-quick-link" data-i18n="all_products">All Products</a>
          <a href="products.html?search=mobile" class="category-quick-link" data-i18n="mobiles">Mobiles</a>
          <a href="laptop.html" class="category-quick-link" data-i18n="laptops">Laptops</a>
          <a href="pc-builder.html" class="category-quick-link" data-i18n="pc_builder">PC Builder</a>
          <a href="creator-studio.html" class="category-quick-link" data-i18n="creator_studio">Creator Studio</a>
          <a href="launchpad.html" class="category-quick-link" data-i18n="nav_launchpad">ElectroMart Launchpad</a>
          <a href="help.html" class="category-quick-link" data-i18n="customer_service">Customer Service</a>
        </div>
        <div class="category-nav-promo">
          <a href="products.html?search=gst" class="category-promo-link" data-i18n="fast_delivery">⚡ Fast Delivery | GST Invoicing</a>
        </div>
      </nav>

      <!-- Amazon-style All Departments Sidebar -->
      <div id="deptOverlay" class="dept-overlay" hidden></div>
      <aside id="deptSidebar" class="dept-sidebar" aria-label="All departments" hidden>
        <div class="dept-header-signin">
          <div class="dept-header-user">
            <span class="dept-header-avatar" id="sidebarAvatar" aria-hidden="true">👤</span>
            <span class="dept-header-greeting" id="sidebarGreeting" data-i18n="hello_sign_in_menu"><strong>Hello,</strong> <a href="auth.html">sign in</a></span>
          </div>
          <button id="deptCloseInside" class="dept-close-inside" type="button" aria-label="Close menu">&times;</button>
        </div>

        <!-- Multi-Panel Sliding Layout -->
        <div class="dept-slider-track" id="deptSliderTrack">
          <!-- MAIN PANEL -->
          <div class="dept-panel" id="deptMainPanel">
            <!-- Trending -->
            <div class="dept-section-title" data-i18n="menu_trending">Trending</div>
            <a class="dept-menu-item" href="best-sellers.html" data-i18n="best_sellers">Best Sellers</a>
            <a class="dept-menu-item" href="todays-deals.html" data-i18n="todays_deals">Today's Deals</a>
            <a class="dept-menu-item" href="products.html?filter=new" data-i18n="new_arrivals">New Arrivals</a>

            <hr class="dept-menu-divider" />

            <!-- Shop by Department -->
            <div class="dept-section-title" data-i18n="menu_shop_department">Shop by Department</div>
            <button class="dept-menu-item dept-submenu-trigger" type="button" data-submenu="pc-components">
              <span data-i18n="components_parts">PC Components &amp; Parts</span>
              <span class="dept-arrow" aria-hidden="true">›</span>
            </button>
            <button class="dept-menu-item dept-submenu-trigger" type="button" data-submenu="laptops-desktops">
              <span data-i18n="laptops_desktops">Laptops &amp; Desktops</span>
              <span class="dept-arrow" aria-hidden="true">›</span>
            </button>
            <a class="dept-menu-item" href="products.html?search=mobile">
              <span data-i18n="mobiles_accessories">Mobiles &amp; Accessories</span>
              <span class="dept-arrow" aria-hidden="true">›</span>
            </a>
            <a class="dept-menu-item" href="products.html?search=audio">
              <span data-i18n="audio_headphones">Audio &amp; Headphones</span>
              <span class="dept-arrow" aria-hidden="true">›</span>
            </a>
            <div id="deptShopMore" class="dept-collapsible" hidden>
              <a class="dept-menu-item" href="printer.html">
                <span data-i18n="printers_office">Printers &amp; Office</span>
                <span class="dept-arrow" aria-hidden="true">›</span>
              </a>
              <a class="dept-menu-item" href="barebone-desktop.html">
                <span data-i18n="barebone_desktops">Barebone Desktops</span>
                <span class="dept-arrow" aria-hidden="true">›</span>
              </a>
              <a class="dept-menu-item" href="branded-desktop.html">
                <span data-i18n="branded_desktops">Branded Desktops</span>
                <span class="dept-arrow" aria-hidden="true">›</span>
              </a>
              <a class="dept-menu-item" href="pc-builder.html">
                <span data-i18n="pc_builder_custom">PC Builder (Custom Rig)</span>
                <span class="dept-arrow" aria-hidden="true">›</span>
              </a>
            </div>
            <button id="deptSeeAllBtn" class="dept-menu-item dept-see-all-btn" type="button" aria-expanded="false">
              <span id="deptSeeAllLabel" data-i18n="see_all">See all</span>
              <span class="dept-toggle-arrow" id="deptSeeAllArrow" aria-hidden="true">▾</span>
            </button>

            <hr class="dept-menu-divider" />

            <!-- Programs & Features -->
            <div class="dept-section-title" data-i18n="menu_programs">Programs &amp; Features</div>
            <a class="dept-menu-item" href="prime.html" data-i18n="prime_hub_title">👑 ElectroMart Prime Hub</a>
            <a class="dept-menu-item" href="electromart-pay.html" data-i18n="electromart_pay_hub">ElectroMart Pay &amp; UPI Hub</a>
            <a class="dept-menu-item" href="pc-builder.html" data-i18n="pc_builder_custom">PC Builder (Custom Rig)</a>
            <a class="dept-menu-item" href="creator-studio.html" data-i18n="creator_studio">Creator Studio</a>
            <a class="dept-menu-item" href="products.html?search=gst" data-i18n="business_gst_invoicing">Business &amp; GST Invoicing</a>
            <a class="dept-menu-item" href="brands.html" data-i18n="top_brands_store">Top Brands Store</a>

            <hr class="dept-menu-divider" />

            <!-- Help & Settings -->
            <div class="dept-section-title" data-i18n="menu_help_settings">Help &amp; Settings</div>
            <a class="dept-menu-item" href="account.html" data-i18n="your_account">Your Account</a>
            <a class="dept-menu-item" href="orders.html" data-i18n="returns_orders">Returns &amp; Orders</a>
            <a class="dept-menu-item dept-drawer-lang-link" href="language-settings.html">🇮🇳 <span class="dept-drawer-lang-text" id="deptDrawerLangText">English</span></a>
            <a class="dept-menu-item" href="faq.html" data-i18n="customer_service_help">Customer Service / Help</a>
            <a class="dept-menu-item" href="auth.html" data-i18n="sign_in">Sign In</a>
          </div>

          <!-- SUBMENU PANEL -->
          <div class="dept-panel" id="deptSubPanel">
            <div class="dept-back-row" id="deptBackBtn" role="button" tabindex="0">
              <span class="dept-back-arrow">‹</span> <strong data-i18n="main_menu">MAIN MENU</strong>
            </div>
            <div class="dept-section-title drawer-subcategory-title" id="deptSubTitle" data-i18n="drawer_subcategory">Subcategory</div>
            <div id="deptSubList"></div>
          </div>
        </div>
      </aside>
      <button id="deptClose" class="dept-close-btn" aria-label="Close menu" hidden>&times;</button>

      <!-- Amazon-style Cart Flyout Drawer -->
      <div id="cartFlyoutOverlay" class="cart-flyout-overlay" style="display: none; pointer-events: none;" hidden></div>
      <aside id="cartFlyout" class="cart-flyout-drawer" aria-label="Shopping Cart Flyout" style="display: none; pointer-events: none;" hidden>
        <div class="cart-flyout-header">
          <div class="cart-flyout-title-wrap">
            <span class="cart-flyout-check" aria-hidden="true">✓</span>
            <h2 class="cart-flyout-title" data-i18n="flyout_added_to_cart">Added to Cart</h2>
          </div>
          <button id="cartFlyoutClose" class="cart-flyout-close" type="button" aria-label="Close cart flyout">&times;</button>
        </div>

        <!-- Active / Added Item Card -->
        <div class="cart-flyout-item-card" id="cartFlyoutItemCard" style="display: none;">
          <img id="cartFlyoutItemImg" class="cart-flyout-item-img" src="product-placeholder.svg" alt="" onerror="this.onerror=null;this.src='product-placeholder.svg';" />
          <div class="cart-flyout-item-info">
            <h3 id="cartFlyoutItemTitle" class="cart-flyout-item-title">Product Name</h3>
            <div class="cart-flyout-item-meta">
              <span id="cartFlyoutItemQty" class="cart-flyout-item-qty">Qty: 1</span>
              <span class="cart-flyout-item-sep">|</span>
              <span id="cartFlyoutItemPrice" class="cart-flyout-item-price">₹0</span>
            </div>
          </div>
        </div>

        <!-- Free Delivery Milestone Banner -->
        <div class="cart-flyout-delivery-banner" id="cartFlyoutDeliveryBanner">
          <span class="delivery-tick" aria-hidden="true">✓</span>
          <span class="delivery-text" data-i18n="flyout_free_delivery_eligible">Your order qualifies for FREE Delivery</span>
        </div>

        <!-- Subtotal & Direct Checkout Actions -->
        <div class="cart-flyout-actions-box">
          <div class="cart-flyout-subtotal-row">
            <span class="subtotal-label" data-i18n="flyout_cart_subtotal">Cart subtotal</span>
            <span class="subtotal-items" id="cartFlyoutSubtotalItems">(1 item):</span>
            <span class="subtotal-amount" id="cartFlyoutSubtotalAmount">₹0</span>
          </div>

          <div class="cart-flyout-buttons">
            <a href="checkout.html" class="cart-flyout-checkout-btn amazon-btn-cart" id="cartFlyoutCheckoutBtn">
              <span data-i18n="flyout_proceed_to_checkout">Proceed to checkout</span>
              <span id="cartFlyoutCheckoutCount">(1 item)</span>
            </a>
            <a href="cart.html" class="cart-flyout-cart-btn amazon-btn-secondary" data-i18n="flyout_go_to_cart">Go to Cart</a>
          </div>
        </div>

        <!-- Mini Cart Items Preview List -->
        <div class="cart-flyout-recent-section">
          <h4 class="cart-flyout-recent-title" data-i18n="shopping_cart">Shopping Cart</h4>
          <div id="cartFlyoutItemsList" class="cart-flyout-items-list"></div>
        </div>
      </aside>
    </header>
    `;
    
    syncCartCount();
    syncHeaderPrimeBadge();
    applySavedLanguage();

    // All Departments Sidebar Logic
    const deptTrigger = document.getElementById('deptTrigger');
    const deptSidebar = document.getElementById('deptSidebar');
    const deptOverlay = document.getElementById('deptOverlay');
    const deptClose = document.getElementById('deptClose');
    const deptCloseInside = document.getElementById('deptCloseInside');
    const sliderTrack = document.getElementById('deptSliderTrack');
    const subTitle = document.getElementById('deptSubTitle');
    const subList = document.getElementById('deptSubList');
    const backBtn = document.getElementById('deptBackBtn');
    const deptSeeAllBtn = document.getElementById('deptSeeAllBtn');
    const deptShopMore = document.getElementById('deptShopMore');
    const deptSeeAllLabel = document.getElementById('deptSeeAllLabel');
    const deptSeeAllArrow = document.getElementById('deptSeeAllArrow');

    const subcategories = {
      'pc-components': {
        title: 'PC Components & Parts',
        titleKey: 'components_parts',
        items: [
          { name: 'Motherboard', url: 'motherboard.html', key: 'subcat_motherboard' },
          { name: 'Desktop RAM / Memory', url: 'desktop-ram-memory.html', key: 'subcat_ram' },
          { name: 'CPU / Processors', url: 'cpu-processor.html', key: 'subcat_cpu' },
          { name: 'Graphics Card / GPU', url: 'graphics-card-gpu.html', key: 'subcat_gpu' },
          { name: 'Power Supply / SMPS', url: 'power-supply-smps.html', key: 'subcat_smps' },
          { name: 'Cabinet / PC Cases', url: 'cabinet.html', key: 'subcat_cabinet' },
          { name: 'Cabinet Fan & Cooling', url: 'cabinet-fan.html', key: 'subcat_cooling' },
          { name: 'PC Builder Tool', url: 'pc-builder.html', key: 'subcat_pc_tool' },
          { name: 'All in PC Components', url: 'products.html?category=computer', key: 'subcat_all_components' }
        ]
      },
      'laptops-desktops': {
        title: 'Laptops & Desktops',
        titleKey: 'laptops_desktops',
        items: [
          { name: 'All Laptops', url: 'laptop.html', key: 'subcat_all_laptops' },
          { name: 'Gaming Laptops', url: 'laptop.html?filter=gaming', key: 'subcat_gaming_laptops' },
          { name: 'Branded Desktops', url: 'branded-desktop.html', key: 'subcat_branded_desktops' },
          { name: 'Barebone Desktops', url: 'barebone-desktop.html', key: 'subcat_barebone_desktops' },
          { name: 'All Desktop Computers', url: 'desktops.html', key: 'subcat_all_desktops' }
        ]
      }
    };

    function openSidebar() {
      if (!deptSidebar || !deptOverlay) return;
      deptSidebar.removeAttribute('hidden');
      deptOverlay.removeAttribute('hidden');
      if (deptClose) {
        deptClose.removeAttribute('hidden');
        deptClose.classList.add('visible');
      }
      setTimeout(() => {
        deptSidebar.classList.add('open');
      }, 10);
      if (deptTrigger) deptTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      if (!deptSidebar || !deptOverlay) return;
      deptSidebar.classList.remove('open');
      if (deptClose) {
        deptClose.classList.remove('visible');
      }
      if (sliderTrack) sliderTrack.classList.remove('in-subpanel');
      if (deptShopMore) {
        deptShopMore.setAttribute('hidden', '');
        if (deptSeeAllBtn) deptSeeAllBtn.setAttribute('aria-expanded', 'false');
        if (deptSeeAllLabel) deptSeeAllLabel.textContent = 'See all';
        if (deptSeeAllArrow) deptSeeAllArrow.textContent = '▾';
      }
      if (deptTrigger) deptTrigger.setAttribute('aria-expanded', 'false');
      setTimeout(() => {
        deptSidebar.setAttribute('hidden', '');
        deptOverlay.setAttribute('hidden', '');
        if (deptClose) deptClose.setAttribute('hidden', '');
      }, 280);
    }

    if (deptTrigger) deptTrigger.addEventListener('click', openSidebar);
    if (deptClose) deptClose.addEventListener('click', closeSidebar);
    if (deptCloseInside) deptCloseInside.addEventListener('click', closeSidebar);
    if (deptOverlay) deptOverlay.addEventListener('click', closeSidebar);

    // See all / See less toggle in drawer
    if (deptSeeAllBtn && deptShopMore) {
      deptSeeAllBtn.addEventListener('click', () => {
        const isHidden = deptShopMore.hasAttribute('hidden');
        if (isHidden) {
          deptShopMore.removeAttribute('hidden');
          deptSeeAllBtn.setAttribute('aria-expanded', 'true');
          if (deptSeeAllLabel) deptSeeAllLabel.textContent = 'See less';
          if (deptSeeAllArrow) deptSeeAllArrow.textContent = '▴';
        } else {
          deptShopMore.setAttribute('hidden', '');
          deptSeeAllBtn.setAttribute('aria-expanded', 'false');
          if (deptSeeAllLabel) deptSeeAllLabel.textContent = 'See all';
          if (deptSeeAllArrow) deptSeeAllArrow.textContent = '▾';
        }
      });
    }

    // Submenu click events
    if (deptSidebar) {
      const triggers = deptSidebar.querySelectorAll('.dept-submenu-trigger');
      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const key = trigger.dataset.submenu;
          const data = subcategories[key];
          if (!data || !sliderTrack || !subTitle || !subList) return;

          const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
          const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
          subTitle.textContent = (data.titleKey && dict[data.titleKey]) ? dict[data.titleKey] : data.title;
          subList.innerHTML = data.items.map(item => {
            const label = (item.key && dict[item.key]) ? dict[item.key] : item.name;
            return `
            <a class="dept-menu-item" href="${item.url}" data-i18n="${item.key || ''}">
              <span>${label}</span>
            </a>
          `;
          }).join('');

          sliderTrack.classList.add('in-subpanel');
        });
      });
    }

    if (backBtn && sliderTrack) {
      backBtn.addEventListener('click', () => {
        sliderTrack.classList.remove('in-subpanel');
      });
    }

    // Search clear button and search history handling
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const searchForm = document.getElementById('searchForm');

    if (searchInput && searchClearBtn) {
      const toggleClearBtn = () => {
        if (searchInput.value.trim().length > 0) {
          searchClearBtn.removeAttribute('hidden');
        } else {
          searchClearBtn.setAttribute('hidden', '');
        }
      };

      searchInput.addEventListener('input', toggleClearBtn);
      searchInput.addEventListener('keyup', toggleClearBtn);

      searchClearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = '';
        searchClearBtn.setAttribute('hidden', '');
        searchInput.focus();
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('focus', { bubbles: true }));
      });
    }

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', () => {
        const query = searchInput.value.trim();
        if (query) {
          try {
            const raw = localStorage.getItem('electromart_search_history_v1');
            const history = raw ? JSON.parse(raw) : [];
            const updated = Array.from(new Set([query, ...history])).slice(0, 8);
            localStorage.setItem('electromart_search_history_v1', JSON.stringify(updated));
          } catch {}
        }
      });
    }

    // Amazon-style Category dropdown label sync (All ▾)
    function syncNavCategoryLabel() {
      const categorySelect = document.getElementById('categoryFilter');
      const labelEl = document.getElementById('navCategoryLabel');
      if (!categorySelect || !labelEl) return;
      const val = categorySelect.value || "all";
      const shortLabels = {
        all: "All",
        computer: "Computers",
        laptop: "Laptops",
        components: "Components",
        printer: "Printers",
        audio: "Audio",
        mobile: "Mobiles"
      };
      const display = shortLabels[val] || (categorySelect.options[categorySelect.selectedIndex]?.text?.split('&')[0]?.trim() || "All");
      labelEl.innerHTML = `${display} <span class="nav-arrow">▾</span>`;
    }

    const categorySelectEl = document.getElementById('categoryFilter');
    if (categorySelectEl) {
      categorySelectEl.addEventListener('change', syncNavCategoryLabel);
      syncNavCategoryLabel();
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && deptSidebar && deptSidebar.classList.contains('open')) {
        closeSidebar();
      }
    });
  }
  
  // Apply language immediately on load
  const LANGUAGE_STORAGE_KEY = "electromart_lang_v1";
  const LANGUAGE_DISPLAY_NAMES = {
    en: "English",
    hi: "हिन्दी - HI",
    ta: "தமிழ் - TA",
    te: "తెలుగు - TE",
    kn: "ಕನ್ನಡ - KN",
    ml: "മലയാളം - ML",
    bn: "বাংলা - BN",
    mr: "मराठी - MR",
    ur: "اردو - UR",
    pa: "ਪੰਜਾਬੀ - PA",
    gu: "ગુજરાતી - GU"
  };

  function applySavedLanguage() {
    try {
      const savedLang = (localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem("electromart_lang") || "en").toLowerCase();

      // 1. Sync header language badges and radio inputs
      document.querySelectorAll('.lang-text, #currentLangCode').forEach(el => {
        el.textContent = savedLang.toUpperCase();
      });
      document.querySelectorAll('input[name="headerLangRadio"]').forEach(radio => {
        radio.checked = (radio.value === savedLang);
      });

      // 2. Sync hamburger sidebar drawer language link text & subcategory title
      document.querySelectorAll('.dept-drawer-lang-text, #deptDrawerLangText').forEach(el => {
        el.textContent = LANGUAGE_DISPLAY_NAMES[savedLang] || "English";
      });
      const subTitleEl = document.getElementById('deptSubTitle');
      if (subTitleEl) {
        const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[savedLang]) ? window.EM_TRANSLATIONS[savedLang] : (window.translations && window.translations[savedLang] ? window.translations[savedLang] : null);
        if (dict && dict.drawer_subcategory) {
          subTitleEl.textContent = dict.drawer_subcategory;
        }
      }

      // 3. Sync footer language dropdown selectors
      document.querySelectorAll('#footerLanguageSelect, .footer-language-select, #languageSelect').forEach(el => {
        if (el.value !== savedLang) {
          el.value = savedLang;
        }
      });

      document.documentElement.lang = savedLang;

      if (typeof window.applyFullPageTranslation === 'function') {
        window.applyFullPageTranslation(savedLang);
      }
    } catch (e) {
      console.warn("applySavedLanguage error:", e);
    }
  }
  applySavedLanguage();

  // Listen for changes from header and footer language selectors
  document.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'headerLangRadio') {
      const nextLang = String(e.target.value || 'en').toLowerCase();
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
      localStorage.setItem('electromart_lang', nextLang);
      applySavedLanguage();
      if (typeof window.applyTranslations === 'function') {
        window.applyTranslations();
      }
      return;
    }
    if (e.target && (e.target.id === 'footerLanguageSelect' || e.target.classList.contains('footer-language-select'))) {
      const nextLang = String(e.target.value || 'en').toLowerCase();
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
      localStorage.setItem('electromart_lang', nextLang);
      applySavedLanguage();
      if (typeof window.applyTranslations === 'function') {
        window.applyTranslations();
      }
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === LANGUAGE_STORAGE_KEY || e.key === 'electromart_lang') {
      applySavedLanguage();
    }
  });

  // Apply theme immediately on load
  const THEME_STORAGE_KEY = "electromart_theme_v1";
  function applySavedTheme() {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    } catch {}
  }
  applySavedTheme();

  function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    if (!themeToggle || !themeLabel) return;

    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.checked = isDark;
    themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';

    themeToggle.addEventListener('change', (e) => {
      const dark = e.target.checked;
      if (dark) {
        document.body.classList.add('dark-mode');
        themeLabel.textContent = 'Dark Mode';
        try { localStorage.setItem(THEME_STORAGE_KEY, 'dark'); } catch {}
      } else {
        document.body.classList.remove('dark-mode');
        themeLabel.textContent = 'Light Mode';
        try { localStorage.setItem(THEME_STORAGE_KEY, 'light'); } catch {}
      }
    });
  }

  function initCartObserver() {
    const cartCountEl = document.getElementById('cartCount') || document.querySelector('[id="cartCount"]');
    if (!cartCountEl) return;
    
    cartCountEl.addEventListener('animationend', () => {
      cartCountEl.classList.remove('cart-pop-animation');
    });

    const observer = new MutationObserver(() => {
      cartCountEl.classList.remove('cart-pop-animation');
      void cartCountEl.offsetWidth; // Force reflow
      cartCountEl.classList.add('cart-pop-animation');
    });
    
    observer.observe(cartCountEl, { childList: true, characterData: true, subtree: true });
  }

  // ===== PHASE 10: UNIVERSAL DELIVERY LOCATION & PINCODE MODAL MANAGER =====
  const LOCATION_STORAGE_KEY = "electromart_location_v1";

  const INDIAN_PINCODE_MAP = {
    "11": "New Delhi",
    "12": "Haryana",
    "13": "Haryana",
    "14": "Punjab",
    "15": "Punjab",
    "16": "Chandigarh",
    "17": "Himachal Pradesh",
    "18": "Jammu & Kashmir",
    "19": "Jammu & Kashmir",
    "20": "Uttar Pradesh",
    "21": "Uttar Pradesh",
    "22": "Lucknow",
    "23": "Uttar Pradesh",
    "24": "Uttar Pradesh",
    "25": "Uttar Pradesh",
    "26": "Uttarakhand",
    "27": "Uttar Pradesh",
    "28": "Uttar Pradesh",
    "30": "Jaipur",
    "31": "Rajasthan",
    "32": "Rajasthan",
    "33": "Rajasthan",
    "34": "Jodhpur",
    "36": "Gujarat",
    "37": "Gujarat",
    "38": "Ahmedabad",
    "39": "Surat",
    "40": "Mumbai",
    "41": "Pune",
    "42": "Maharashtra",
    "43": "Maharashtra",
    "44": "Nagpur",
    "45": "Indore",
    "46": "Bhopal",
    "47": "Gwalior",
    "48": "Jabalpur",
    "49": "Raipur",
    "50": "Hyderabad",
    "51": "Andhra Pradesh",
    "52": "Vijayawada",
    "53": "Visakhapatnam",
    "56": "Bengaluru",
    "57": "Karnataka",
    "58": "Karnataka",
    "59": "Belagavi",
    "60": "Chennai",
    "61": "Tamil Nadu",
    "62": "Madurai",
    "63": "Coimbatore",
    "64": "Coimbatore",
    "67": "Kozhikode",
    "68": "Kochi",
    "69": "Thiruvananthapuram",
    "70": "Kolkata",
    "71": "West Bengal",
    "72": "West Bengal",
    "73": "Siliguri",
    "74": "West Bengal",
    "75": "Bhubaneswar",
    "76": "Odisha",
    "77": "Odisha",
    "78": "Guwahati",
    "79": "Northeast",
    "80": "Patna",
    "81": "Bihar",
    "82": "Bihar",
    "83": "Ranchi",
    "84": "Bihar",
    "85": "Bihar"
  };

  const MAJOR_METROS = [
    { city: "New Delhi", postal: "110001" },
    { city: "Mumbai", postal: "400001" },
    { city: "Bengaluru", postal: "560001" },
    { city: "Hyderabad", postal: "500001" },
    { city: "Chennai", postal: "600001" },
    { city: "Kolkata", postal: "700001" },
    { city: "Pune", postal: "411001" },
    { city: "Ahmedabad", postal: "380001" },
    { city: "Jaipur", postal: "302001" },
    { city: "Lucknow", postal: "226001" },
    { city: "Chandigarh", postal: "160001" }
  ];

  function resolveCityFromPincode(pin) {
    const clean = String(pin || "").replace(/\D/g, "");
    if (clean.length === 6) {
      const prefix = clean.slice(0, 2);
      if (INDIAN_PINCODE_MAP[prefix]) {
        return INDIAN_PINCODE_MAP[prefix];
      }
    }
    return "India";
  }

  function loadDeliveryLocation() {
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY) || localStorage.getItem("electromart_delivery_location");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") {
        const city = String(parsed.city || "").trim();
        const postal = String(parsed.postal || "").trim();
        if (city || postal) {
          return { city: city || "New Delhi", postal: postal || "110001" };
        }
      }
      const legacyPin = localStorage.getItem("electromart_delivery_pincode");
      if (legacyPin && /^\d{6}$/.test(legacyPin.trim())) {
        const pin = legacyPin.trim();
        return { city: resolveCityFromPincode(pin), postal: pin };
      }
    } catch (e) {}
    return { city: "New Delhi", postal: "110001" };
  }

  function saveDeliveryLocation(city, postal) {
    const pref = { city: city || "New Delhi", postal: postal || "110001" };
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(pref));
      localStorage.setItem("electromart_delivery_location", JSON.stringify(pref));
      localStorage.setItem("electromart_delivery_pincode", pref.postal);
      localStorage.setItem("electromart_delivery_city", pref.city);
    } catch (e) {}

    const locEl = document.getElementById("deliveryLocationText");
    if (locEl) {
      locEl.textContent = `${pref.city} ${pref.postal}`;
    }

    const postalInput = document.getElementById("locationPostal");
    if (postalInput) {
      postalInput.value = pref.postal;
    }

    const citySelect = document.getElementById("locationCity");
    if (citySelect) {
      citySelect.value = pref.city;
    }

    window.dispatchEvent(new CustomEvent("electromart:locationChanged", { detail: pref }));
  }

  function ensureLocationModal() {
    let modal = document.getElementById("locationModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "locationModal";
      modal.className = "location-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-labelledby", "locationTitle");
      modal.hidden = true;
      modal.innerHTML = `
        <div class="location-modal__backdrop" data-close-location-modal></div>
        <section class="location-modal__content amz-location-card">
          <div class="amz-location-header">
            <h2 id="locationTitle" class="amz-location-title" data-i18n="location_choose_title">Choose your location</h2>
            <button type="button" class="amz-location-close-btn" data-close-location-modal aria-label="Close">&times;</button>
          </div>
          <p id="locationSubtitle" class="amz-location-subtitle" data-i18n="location_subtitle">Select a delivery location to see product availability and delivery options.</p>

          <div id="amzLocationAuthSection" class="amz-location-section"></div>

          <div class="amz-location-divider">
            <span data-i18n="location_or_pincode">or enter an Indian PIN code</span>
          </div>

          <form id="amzLocationPincodeForm" class="amz-location-form" onsubmit="return false;">
            <div class="amz-location-pincode-wrap">
              <input id="locationPostal" class="amz-location-input" type="text" inputmode="numeric" maxlength="6" placeholder="Enter 6-digit PIN code" data-i18n-placeholder="location_pincode_placeholder" autocomplete="postal-code" />
              <button id="locationSave" class="amz-location-apply-btn" type="submit" data-i18n="location_apply_btn">Apply</button>
            </div>
            <div id="locationPostalError" class="amz-location-error" role="alert" data-i18n="location_invalid_pincode">Please enter a valid 6-digit Indian PIN code.</div>
          </form>

          <select id="locationCity" style="display:none;" aria-hidden="true">
            <option value="New Delhi">New Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Chennai">Chennai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Pune">Pune</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Lucknow">Lucknow</option>
          </select>

          <div class="amz-location-divider">
            <span data-i18n="location_or_city">or select a major city</span>
          </div>

          <div class="amz-location-metros-grid" id="amzMajorMetrosGrid"></div>

          <div class="location-actions">
            <button id="locationCancel" type="button" class="location-cancel" data-close-location-modal data-i18n="location.cancel">Cancel</button>
          </div>
        </section>
      `;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function populateLocationAuthSection() {
    const container = document.getElementById("amzLocationAuthSection");
    if (!container) return;

    let user = null;
    try {
      const rawUser = localStorage.getItem("electromart_auth_v1");
      user = rawUser ? JSON.parse(rawUser) : null;
    } catch (e) {}

    let profile = null;
    try {
      const rawProfile = localStorage.getItem("electromart_profile_v1");
      profile = rawProfile ? JSON.parse(rawProfile) : null;
    } catch (e) {}

    const addressText = (profile && profile.address) || (user && user.address) || "";
    const userName = (user && user.name) || (profile && profile.fullName) || "";

    if (user && addressText) {
      const currentLoc = loadDeliveryLocation();
      container.innerHTML = `
        <div class="amz-location-addresses-list">
          <div class="amz-location-address-card selected" id="amzSavedAddrCard">
            <span style="font-size: 16px;">📍</span>
            <div class="amz-location-addr-info">
              <span class="amz-location-addr-name">${userName}</span>
              <span class="amz-location-addr-text">${addressText}</span>
            </div>
          </div>
        </div>
      `;
      const card = document.getElementById("amzSavedAddrCard");
      if (card) {
        card.addEventListener("click", () => {
          const pinMatch = addressText.match(/\\b([1-9][0-9]{5})\\b/);
          if (pinMatch) {
            const pin = pinMatch[1];
            const city = resolveCityFromPincode(pin);
            saveDeliveryLocation(city, pin);
          } else {
            saveDeliveryLocation(currentLoc.city, currentLoc.postal);
          }
          closeLocationModal();
        });
      }
    } else {
      container.innerHTML = `
        <div class="amz-location-signin-box">
          <a href="auth.html" class="amz-location-signin-btn" data-i18n="location_signin_btn">Sign in to see your addresses</a>
        </div>
      `;
    }
  }

  function populateMajorMetros(currentPostal) {
    const grid = document.getElementById("amzMajorMetrosGrid");
    if (!grid) return;

    grid.innerHTML = MAJOR_METROS.map((m) => {
      const isActive = m.postal === currentPostal;
      return `<button type="button" class="amz-metro-pill ${isActive ? 'active' : ''}" data-city="${m.city}" data-postal="${m.postal}">${m.city} ${m.postal}</button>`;
    }).join("");

    grid.querySelectorAll(".amz-metro-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        const city = btn.getAttribute("data-city");
        const postal = btn.getAttribute("data-postal");
        saveDeliveryLocation(city, postal);
        closeLocationModal();
      });
    });
  }

  function openLocationModal() {
    const modal = ensureLocationModal();
    if (!modal) return;

    const currentLoc = loadDeliveryLocation();
    populateLocationAuthSection();
    populateMajorMetros(currentLoc.postal);

    const postalInput = document.getElementById("locationPostal");
    if (postalInput) {
      postalInput.value = currentLoc.postal;
    }
    const errEl = document.getElementById("locationPostalError");
    if (errEl) {
      errEl.classList.remove("visible");
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");
    if (postalInput) {
      setTimeout(() => postalInput.focus(), 50);
    }
  }

  function closeLocationModal() {
    const modal = document.getElementById("locationModal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    const trigger = document.getElementById("locationTrigger");
    if (trigger) trigger.focus();
  }

  window.openLocationModal = openLocationModal;
  window.closeLocationModal = closeLocationModal;

  function initDeliveryLocationManager() {
    // 1. Initial sync of header label
    const loc = loadDeliveryLocation();
    updateHeaderLocationText(loc.city, loc.postal);

    // 2. Wire Trigger
    const trigger = document.getElementById("locationTrigger");
    if (trigger && !trigger._locBound) {
      trigger._locBound = true;
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        openLocationModal();
      });
    }

    // 3. Ensure modal and wire modal-level events
    const modal = ensureLocationModal();
    if (modal && !modal._eventsBound) {
      modal._eventsBound = true;

      modal.addEventListener("click", (e) => {
        if (e.target.matches("[data-close-location-modal]") || e.target.classList.contains("location-modal__backdrop")) {
          closeLocationModal();
        }
      });

      const applyBtn = document.getElementById("locationSave");
      const postalInput = document.getElementById("locationPostal");
      const errEl = document.getElementById("locationPostalError");
      const form = document.getElementById("amzLocationPincodeForm");

      const handleApply = (e) => {
        if (e) e.preventDefault();
        if (!postalInput) return;
        const pin = postalInput.value.trim();
        if (/^[1-9][0-9]{5}$/.test(pin)) {
          if (errEl) errEl.classList.remove("visible");
          const city = resolveCityFromPincode(pin);
          saveDeliveryLocation(city, pin);
          closeLocationModal();
        } else {
          if (errEl) errEl.classList.add("visible");
          postalInput.focus();
        }
      };

      if (applyBtn) {
        applyBtn.addEventListener("click", handleApply);
      }
      if (form) {
        form.addEventListener("submit", handleApply);
      }
      if (postalInput) {
        postalInput.addEventListener("input", () => {
          if (errEl) errEl.classList.remove("visible");
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && !modal.hidden) {
          closeLocationModal();
        }
      });
    }

    // 4. Storage sync across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === LOCATION_STORAGE_KEY || e.key === "electromart_delivery_pincode") {
        const nextLoc = loadDeliveryLocation();
        updateHeaderLocationText(nextLoc.city, nextLoc.postal);
      }
    });
  }

  // --- Amazon-style Cart Flyout Drawer Manager ---
  function ensureCartFlyout() {
    let flyout = document.getElementById("cartFlyout");
    let overlay = document.getElementById("cartFlyoutOverlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "cartFlyoutOverlay";
      overlay.className = "cart-flyout-overlay";
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      overlay.setAttribute("hidden", "");
      document.body.appendChild(overlay);
    }

    if (!flyout) {
      flyout = document.createElement("aside");
      flyout.id = "cartFlyout";
      flyout.className = "cart-flyout-drawer";
      flyout.setAttribute("aria-label", "Shopping Cart Flyout");
      flyout.style.display = "none";
      flyout.style.pointerEvents = "none";
      flyout.setAttribute("hidden", "");
      flyout.innerHTML = `
        <div class="cart-flyout-header">
          <div class="cart-flyout-title-wrap">
            <span class="cart-flyout-check" aria-hidden="true">✓</span>
            <h2 class="cart-flyout-title" data-i18n="flyout_added_to_cart">Added to Cart</h2>
          </div>
          <button id="cartFlyoutClose" class="cart-flyout-close" type="button" aria-label="Close cart flyout">&times;</button>
        </div>

        <!-- Active / Added Item Card -->
        <div class="cart-flyout-item-card" id="cartFlyoutItemCard" style="display: none;">
          <img id="cartFlyoutItemImg" class="cart-flyout-item-img" src="product-placeholder.svg" alt="" onerror="this.onerror=null;this.src='product-placeholder.svg';" />
          <div class="cart-flyout-item-info">
            <h3 id="cartFlyoutItemTitle" class="cart-flyout-item-title">Product Name</h3>
            <div class="cart-flyout-item-meta">
              <span id="cartFlyoutItemQty" class="cart-flyout-item-qty">Qty: 1</span>
              <span class="cart-flyout-item-sep">|</span>
              <span id="cartFlyoutItemPrice" class="cart-flyout-item-price">₹0</span>
            </div>
          </div>
        </div>

        <!-- Free Delivery Milestone Banner -->
        <div class="cart-flyout-delivery-banner" id="cartFlyoutDeliveryBanner">
          <span class="delivery-tick" aria-hidden="true">✓</span>
          <span class="delivery-text" data-i18n="flyout_free_delivery_eligible">Your order qualifies for FREE Delivery</span>
        </div>

        <!-- Subtotal & Direct Checkout Actions -->
        <div class="cart-flyout-actions-box">
          <div class="cart-flyout-subtotal-row">
            <span class="subtotal-label" data-i18n="flyout_cart_subtotal">Cart subtotal</span>
            <span class="subtotal-items" id="cartFlyoutSubtotalItems">(1 item):</span>
            <span class="subtotal-amount" id="cartFlyoutSubtotalAmount">₹0</span>
          </div>

          <div class="cart-flyout-buttons">
            <a href="checkout.html" class="cart-flyout-checkout-btn amazon-btn-cart" id="cartFlyoutCheckoutBtn">
              <span data-i18n="flyout_proceed_to_checkout">Proceed to checkout</span>
              <span id="cartFlyoutCheckoutCount">(1 item)</span>
            </a>
            <a href="cart.html" class="cart-flyout-cart-btn amazon-btn-secondary" data-i18n="flyout_go_to_cart">Go to Cart</a>
          </div>
        </div>

        <!-- Mini Cart Items Preview List -->
        <div class="cart-flyout-recent-section">
          <h4 class="cart-flyout-recent-title" data-i18n="shopping_cart">Shopping Cart</h4>
          <div id="cartFlyoutItemsList" class="cart-flyout-items-list"></div>
        </div>
      `;
      document.body.appendChild(flyout);
    }

    return { flyout, overlay };
  }

  function openCartFlyout(itemDetails) {
    const { flyout, overlay } = ensureCartFlyout();
    if (!flyout || !overlay) return;

    const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : (window.translations && window.translations[currentLang] ? window.translations[currentLang] : {});

    // Compute Cart Totals & Items from localStorage
    const cartMap = (() => {
      try {
        const raw = localStorage.getItem("electromart_cart_v1");
        return raw ? JSON.parse(raw) : {};
      } catch (_) {
        return {};
      }
    })();

    const catalogMap = window.EM_CATALOG_MAP || {};
    const catalogList = window.EM_CATALOG || [];

    let totalCount = 0;
    let subtotal = 0;
    const recentItems = [];

    Object.entries(cartMap).forEach(([id, qtyVal]) => {
      const qty = Number(qtyVal);
      if (!Number.isFinite(qty) || qty <= 0) return;
      totalCount += qty;

      const prod = catalogMap[id] || catalogList.find(p => String(p.id) === String(id));
      const price = prod ? Number(prod.price || 0) : (itemDetails && String(itemDetails.id) === String(id) ? Number(itemDetails.price || 0) : 0);
      subtotal += (price * qty);

      if (prod) {
        recentItems.push({ prod, qty, price });
      }
    });

    if (itemDetails && totalCount === 0) {
      const qty = Number(itemDetails.qty || 1);
      totalCount = qty;
      subtotal = Number(itemDetails.price || 0) * qty;
    }

    // Active Item Card Resolution (Fall back to most recent item in cart if itemDetails wasn't provided)
    let activeItem = itemDetails;
    if (!activeItem && recentItems.length > 0) {
      const latest = recentItems[recentItems.length - 1];
      activeItem = {
        id: latest.prod.id,
        name: latest.prod.name || latest.prod.title,
        image: latest.prod.image,
        price: latest.price,
        qty: latest.qty
      };
    }

    const itemCard = document.getElementById("cartFlyoutItemCard");
    const itemImg = document.getElementById("cartFlyoutItemImg");
    const itemTitle = document.getElementById("cartFlyoutItemTitle");
    const itemQty = document.getElementById("cartFlyoutItemQty");
    const itemPrice = document.getElementById("cartFlyoutItemPrice");

    if (activeItem && itemCard) {
      itemCard.style.display = "flex";
      if (itemImg) itemImg.src = activeItem.image || "product-placeholder.svg";
      const locTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(activeItem, currentLang) : (activeItem.name || activeItem.title || "")).trim();
      if (itemTitle) itemTitle.textContent = locTitle || "Product";
      const qty = Number(activeItem.qty || activeItem.quantity || 1);
      if (itemQty) itemQty.textContent = `${t.qty || "Qty"}: ${qty}`;
      const price = Number(activeItem.price || 0);
      if (itemPrice) itemPrice.textContent = `₹${(price * qty).toLocaleString("en-IN")}`;
    } else if (itemCard) {
      itemCard.style.display = "none";
    }

    const subtotalItems = document.getElementById("cartFlyoutSubtotalItems");
    const subtotalAmount = document.getElementById("cartFlyoutSubtotalAmount");
    const checkoutCount = document.getElementById("cartFlyoutCheckoutCount");

    const itemWord = totalCount === 1 ? (t.item || "item") : (t.items || "items");
    if (subtotalItems) subtotalItems.textContent = `(${totalCount} ${itemWord}):`;
    if (subtotalAmount) subtotalAmount.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
    if (checkoutCount) checkoutCount.textContent = `(${totalCount} ${itemWord})`;

    const deliveryBanner = document.getElementById("cartFlyoutDeliveryBanner");
    if (deliveryBanner) {
      deliveryBanner.style.display = (subtotal >= 499 || totalCount > 0) ? "flex" : "none";
    }

    const itemsListEl = document.getElementById("cartFlyoutItemsList");
    if (itemsListEl) {
      if (recentItems.length > 0) {
        itemsListEl.innerHTML = recentItems.slice(0, 5).map(({ prod, qty, price }) => {
          const title = (window.getLocalizedTitle ? window.getLocalizedTitle(prod, currentLang) : (prod.name || prod.title || "")).trim();
          return `
            <div class="cart-flyout-mini-item">
              <img src="${prod.image || 'product-placeholder.svg'}" alt="" onerror="this.onerror=null;this.src='product-placeholder.svg';" class="mini-item-img" />
              <div class="mini-item-details">
                <a href="product-detail.html?id=${encodeURIComponent(prod.id)}" class="mini-item-title">${title}</a>
                <div class="mini-item-price-qty">
                  <span class="mini-qty">Qty: ${qty}</span>
                  <span class="mini-price">₹${(price * qty).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          `;
        }).join("");
      } else {
        itemsListEl.innerHTML = `<p class="mini-cart-empty">${t.cart_empty || "Your cart is empty"}</p>`;
      }
    }

    // Localize drawer labels
    flyout.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) el.textContent = t[key];
    });

    overlay.removeAttribute("hidden");
    flyout.removeAttribute("hidden");
    overlay.style.display = "block";
    overlay.style.pointerEvents = "auto";
    flyout.style.display = "flex";
    flyout.style.pointerEvents = "auto";
    document.body.classList.add("cart-flyout-open");

    void flyout.offsetWidth;
    overlay.classList.add("open");
    flyout.classList.add("open");

    const closeBtn = document.getElementById("cartFlyoutClose");
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener("click", closeCartFlyout);
    }
    if (!overlay._bound) {
      overlay._bound = true;
      overlay.addEventListener("click", closeCartFlyout);
    }
  }

  function closeCartFlyout() {
    const flyout = document.getElementById("cartFlyout");
    const overlay = document.getElementById("cartFlyoutOverlay");
    if (!flyout) return;

    flyout.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
    flyout.style.pointerEvents = "none";
    if (overlay) overlay.style.pointerEvents = "none";
    document.body.classList.remove("cart-flyout-open");

    setTimeout(() => {
      if (!flyout.classList.contains("open")) {
        flyout.setAttribute("hidden", "");
        flyout.style.display = "none";
        if (overlay) {
          overlay.setAttribute("hidden", "");
          overlay.style.display = "none";
        }
      }
    }, 300);
  }

  window.openCartFlyout = openCartFlyout;
  window.closeCartFlyout = closeCartFlyout;

  function initCartFlyoutManager() {
    ensureCartFlyout();

    const closeBtn = document.getElementById("cartFlyoutClose");
    const overlay = document.getElementById("cartFlyoutOverlay");
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener("click", closeCartFlyout);
    }
    if (overlay && !overlay._bound) {
      overlay._bound = true;
      overlay.addEventListener("click", closeCartFlyout);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const flyout = document.getElementById("cartFlyout");
        if (flyout && flyout.classList.contains("open")) {
          closeCartFlyout();
        }
      }
    });

    window.addEventListener("electromart:itemAddedToCart", (e) => {
      if (e && e.detail) {
        openCartFlyout(e.detail);
      }
    });
  }

  if (document.getElementById('headerContainer')) {
    injectHeader();
    initThemeToggle();
    initCartObserver();
    initDeliveryLocationManager();
    initCartFlyoutManager();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectHeader();
      initThemeToggle();
      initCartObserver();
      initDeliveryLocationManager();
      initCartFlyoutManager();
    });
  } else {
    injectHeader();
    initThemeToggle();
    initCartObserver();
    initDeliveryLocationManager();
    initCartFlyoutManager();
  }
  
  // Listen for cart changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === CART_STORAGE_KEY) {
      syncCartCount();
    }
    if (e.key === PRIME_STORAGE_KEY) {
      syncHeaderPrimeBadge();
    }
  });

  window.addEventListener('electromart_prime_updated', () => {
    syncHeaderPrimeBadge();
  });

  // Amazon-style auto-hide sticky header
  function initStickyHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    let isHidden = false;
    
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > lastScrollY && currentY > 80) {
            // Scroll down, hide header
            if (!isHidden) {
              header.style.transform = 'translateY(-100%)';
              header.style.transition = 'transform 0.35s cubic-bezier(.4,0,.2,1)';
              isHidden = true;
            }
          } else {
            // Scroll up, show header
            if (isHidden) {
              header.style.transform = 'translateY(0)';
              header.style.transition = 'transform 0.35s cubic-bezier(.4,0,.2,1)';
              isHidden = false;
            }
          }
          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', onScroll);
    // Ensure header is visible on page load
    header.style.transform = 'translateY(0)';
    header.style.transition = 'transform 0.35s cubic-bezier(.4,0,.2,1)';
  }

  // Initialize sticky header after injection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initStickyHeader, 50));
  } else {
    setTimeout(initStickyHeader, 50);
  }

  // Product Image Hover Effect (Premium Feel)
  function initProductHoverEffect() {
    const style = document.createElement('style');
    style.textContent = `
      .product-image-container {
        position: relative;
        display: block;
        overflow: hidden;
        border-radius: inherit;
        width: 100%;
        aspect-ratio: 1; /* Match general product image proportions */
      }
      .product-image-container img {
        transition: opacity 0.4s ease, transform 0.4s ease !important;
      }
      .product-image-container .hover-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain; /* Ensure full image is visible, similar to main image */
        opacity: 0;
        z-index: 2;
      }
      .product-card:hover .product-image-container .primary-img {
        opacity: 0;
      }
      .product-card:hover .product-image-container .hover-img {
        opacity: 1;
        transform: scale(1.05); /* Premium zoom effect */
      }
    `;
    document.head.appendChild(style);

    function getAlternateImage(src) {
      if (!src) return src;
      const imageMap = {
        // Laptops & Computers
        "photo-1496181133206-80ce9b88a853": "photo-1531297484001-80022131f5a1", // AstraBook Pro
        "photo-1603302576837-37561b2e2302": "photo-1593640408182-31c70c8268f5", // Vector Gaming
        "photo-1591488320449-011701bb6704": "photo-1587831990711-23ca6441447b", // Titan Office Tower
        "photo-1587202372775-e229f172b9d7": "photo-1547082299-de196ea013d6", // Vortex Gaming Rig
        "photo-1517336714739-489689fd1ca8": "photo-1517336714739-489689fd1ca8", // AstraStudio (self fallback)
        // Phones & Accessories
        "photo-1511707171634-5f897ff02aa9": "photo-1533228100845-08145b01de14", // Nimbus Phone
        "photo-1505740420928-5e560c06d30e": "photo-1484704849700-f032a568e944", // Pulse ANC
        "photo-1618384887929-16ec33fab9ef": "photo-1595225476474-87563907a212", // Orbit Keyboard
        "photo-1589003077984-894e133dabab": "photo-1543512214-318c7553f230", // Echo Speaker
        // Printers
        "photo-1612817159949-195b6eb9e31a": "photo-1612815154858-60aa4c59eaa6", // Epson EcoTank
        "photo-1614027164847-1b28cfe1df89": "photo-1622434641406-a158123450f9", // HP LaserJet
      };

      for (const [key, val] of Object.entries(imageMap)) {
        if (src.includes(key)) {
          return src.replace(key, val);
        }
      }
      
      // If it's unsplash, try to provide a generic gadget back/side angle
      if (src.includes("unsplash.com")) {
        return "https://images.unsplash.com/photo-1588508065123-287b28e018ea?auto=format&fit=crop&w=900&q=80"; 
      }
      return src;
    }

    function applyHoverEffect() {
      const cards = document.querySelectorAll('.product-card');
      cards.forEach(card => {
        if (card.dataset.hoverApplied) return;
        
        // Exclude elements that shouldn't have hover logic or already have it complex
        const img = card.querySelector('img');
        if (!img || img.classList.contains('hover-img')) return;

        // Ensure we don't mess up if there are already multiple images inside a card
        if (card.querySelectorAll('img').length > 1) {
            card.dataset.hoverApplied = "true";
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'product-image-container';
        
        // Carry over specific inline styles if necessary
        if (img.style.width) wrapper.style.width = img.style.width;
        if (img.style.height) wrapper.style.height = img.style.height;
        if (img.style.objectFit) wrapper.style.objectFit = img.style.objectFit;
        if (img.style.borderRadius) wrapper.style.borderRadius = img.style.borderRadius;
        if (img.style.marginBottom) wrapper.style.marginBottom = img.style.marginBottom;
        
        // Remove specific inline styles from img so container manages layout
        img.style.marginBottom = "0";
        img.style.borderRadius = "0";

        img.parentNode.insertBefore(wrapper, img);
        
        img.classList.add('primary-img');
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = img.style.objectFit || 'cover';

        wrapper.appendChild(img);

        const hoverImg = document.createElement('img');
        hoverImg.className = 'hover-img';
        hoverImg.src = getAlternateImage(img.src);
        hoverImg.alt = img.alt ? `${img.alt} - Alternate View` : 'Alternate View';
        hoverImg.loading = 'lazy';
        
        wrapper.appendChild(hoverImg);
        card.dataset.hoverApplied = "true";
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyHoverEffect);
    } else {
      applyHoverEffect();
    }

    const observer = new MutationObserver((mutations) => {
      let shouldApply = false;
      for (const mut of mutations) {
        if (mut.addedNodes.length) {
          shouldApply = true;
          break;
        }
      }
      if (shouldApply) applyHoverEffect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  initProductHoverEffect();

})();

