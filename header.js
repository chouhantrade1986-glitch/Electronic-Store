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
  }
  
  function getLocalizedNavText(key, fallbackText) {
    const lang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
    const dict = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[lang]) ? window.EM_TRANSLATIONS[lang] : (typeof translations !== "undefined" ? translations[lang] : null);
    return (dict && dict[key]) ? dict[key] : (fallbackText || key);
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
        <button class="deliver-btn" id="locationTrigger" type="button" aria-haspopup="dialog" aria-controls="locationModal">
          <span class="deliver-to-prefix"><span data-i18n="deliver_to_prefix">Deliver to</span> <strong id="deliveryLocationText">New Delhi 110001</strong></span>
        </button>
        <div class="search-stack search-bar-wrapper">
          <form id="searchForm" class="search-form" role="search" data-shared-search="1">
            <select id="categoryFilter" class="search-context-select" data-search-catalog="1" aria-label="Filter category">
              <option id="catAll" data-i18n="categoryFilter.all" value="all">All Categories</option>
              <option id="catComputer" data-i18n="categoryFilter.computer" value="computer">Computers &amp; Desktops</option>
              <option id="catLaptop" data-i18n="categoryFilter.laptop" value="laptop">Laptops &amp; Accessories</option>
              <option id="catComponents" data-i18n="categoryFilter.components" value="components">Components &amp; Parts</option>
              <option id="catPrinter" data-i18n="categoryFilter.printer" value="printer">Printers &amp; Cartridges</option>
              <option id="catAudio" data-i18n="categoryFilter.audio" value="audio">Audio &amp; Headphones</option>
              <option id="catMobile" data-i18n="categoryFilter.mobile" value="mobile">Mobile Accessories</option>
            </select>
            <div class="search-input-wrap">
              <input id="searchInput" type="search" placeholder="Search ElectroMart.in" data-i18n-placeholder="search_placeholder" aria-label="Search products" autocomplete="off" />
              <button id="searchClearBtn" class="search-clear-btn" type="button" aria-label="Clear search" hidden>&times;</button>
              <div id="searchSuggestions" class="search-suggestions" hidden></div>
            </div>
            <button id="searchSubmitBtn" class="search-submit-btn" type="submit" aria-label="Submit search">
              <svg class="search-lens-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#0f1111" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
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
            <a href="auth.html" class="account-link nav-action-card" id="navAccountTrigger">
              <span data-i18n="hello_sign_in">Hello, sign in</span>
              <strong data-i18n="account_lists">Account &amp; Lists ▾</strong>
            </a>
            <div class="account-flyout-menu" id="navAccountFlyout" aria-label="Account and Lists Menu">
              <div class="flyout-arrow"></div>
              <div class="flyout-top-signin">
                <a href="auth.html" class="flyout-signin-btn" data-i18n="drawer_sign_in">Sign in</a>
                <p class="flyout-new-customer"><span data-i18n="new_customer">New customer?</span> <a href="auth.html" data-i18n="start_here">Start here.</a></p>
              </div>
              <div class="flyout-columns">
                <div class="flyout-col">
                  <h3 data-i18n="nav.yourLists">Your Lists</h3>
                  <a href="wishlist.html" data-i18n="nav.createWishlist">Create a Wish List</a>
                  <a href="wishlist.html" data-i18n="nav.wishAnyWebsite">Wish from Any Website</a>
                  <a href="wishlist.html" data-i18n="nav.yourSavedItems">Your Saved Items</a>
                  <a href="products.html" data-i18n="nav.discoverStyle">Discover Your Style</a>
                  <a href="mega-store.html" data-i18n="nav.exploreShowroom">Explore Showroom</a>
                </div>
                <div class="flyout-col">
                  <h3 data-i18n="footer.yourAccount">Your Account</h3>
                  <a href="account.html" data-i18n="footer.yourAccount">Your Account</a>
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
          <a href="best-sellers.html" class="category-quick-link" data-i18n="best_sellers">Best Sellers</a>
          <a href="products.html" class="category-quick-link" data-i18n="all_products">All Products</a>
          <a href="products.html?search=mobile" class="category-quick-link" data-i18n="mobiles">Mobiles</a>
          <a href="laptop.html" class="category-quick-link" data-i18n="laptops">Laptops</a>
          <a href="pc-builder.html" class="category-quick-link" data-i18n="pc_builder">PC Builder</a>
          <a href="creator-studio.html" class="category-quick-link" data-i18n="creator_studio">Creator Studio</a>
          <a href="faq.html" class="category-quick-link" data-i18n="customer_service">Customer Service</a>
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
    </header>
    `;
    
    syncCartCount();
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

  if (document.getElementById('headerContainer')) {
    injectHeader();
    initThemeToggle();
    initCartObserver();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectHeader();
      initThemeToggle();
      initCartObserver();
    });
  } else {
    injectHeader();
    initThemeToggle();
    initCartObserver();
  }
  
  // Listen for cart changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === CART_STORAGE_KEY) {
      syncCartCount();
    }
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

