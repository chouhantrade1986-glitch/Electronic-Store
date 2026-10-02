<!--- Full header.js content --->
(function() {
  'use strict';
  
  const CART_STORAGE_KEY = "electromart_cart_v1";
  
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
         <span data-i18n="header.deliverTo">Deliver to</span> <strong id="deliveryLocationText">New Delhi 110001</strong>
       </button>
       <div class="search-stack">
         <form id="searchForm" class="search-form" role="search" data-shared-search="1">
           <select id="categoryFilter" class="search-context-select" data-search-catalog="1" aria-label="Filter category">
             <option id="catAll" value="all">All Catalogue</option>
             <option id="catComputer" value="computer">Computers</option>
             <option id="catLaptop" value="laptop">Laptops</option>
             <option id="catPrinter" value="printer">Printers</option>
             <option id="catMobile" value="mobile">Mobiles</option>
             <option id="catAudio" value="audio">Audio</option>
             <option id="catAccessory" value="accessory">Accessories</option>
           </select>
           <div class="search-input-wrap">
             <input id="searchInput" type="search" list="smartKeywordList" placeholder="Search electronics" aria-label="Search products" data-i18n-placeholder="header.searchPlaceholder" autocomplete="off" />
             <div id="searchSuggestions" class="search-suggestions" hidden></div>
             <datalist id="smartKeywordList">
               <option value="gaming"></option>
               <option value="budget"></option>
               <option value="premium"></option>
               <option value="audio"></option>
               <option value="mobile"></option>
               <option value="laptop"></option>
               <option value="under 500"></option>
               <option value="above 1000"></option>
             </datalist>
           </div>
           <button type="submit" data-i18n="header.searchBtn">Search</button>
         </form>
         <div class="search-trust-strip" aria-label="Search benefits">
           <span>Top Deals live</span>
           <span>Fast delivery</span>
           <span>GST invoicing available</span>
         </div>
       </div>
       <div class="nav-actions">
         <a href="auth.html" class="account-link nav-action-card">
           <span>Hello, sign in</span>
           <strong data-i18n="nav.account">Account</strong>
         </a>
         <a href="orders.html" class="orders-link nav-action-card">
           <span>Orders</span>
           <strong data-i18n="nav.orders">Orders</strong>
         </a>
         <a href="wishlist.html" class="orders-link nav-action-card">
           <span>Wishlist</span>
           <strong>Wishlist</strong>
         </a>
         <a href="cart.html" class="cart-link"><span data-i18n="nav.cart">Cart</span> <span id="cartCount">0</span></a>
       </div>
     </nav>

     <nav class="category-nav home-main-nav" aria-label="Main navigation">
       <button id="deptTrigger" class="dept-trigger amazon-hamburger" type="button" aria-expanded="false" aria-controls="deptSidebar">
         <span class="hamburger-icon" aria-hidden="true">
           <span></span><span></span><span></span>
         </span>
         <span class="hamburger-label">All</span>
       </button>
     </nav>

       <!-- Amazon-style All Departments Sidebar -->
       <div id="deptOverlay" class="dept-overlay" hidden></div>
       <aside id="deptSidebar" class="dept-sidebar" aria-label="All departments" hidden>
         <button id="deptClose" class="dept-close" aria-label="Close departments menu">&times;</button>
         <nav class="dept-sidebar-nav">
                                   <div class="dept-sidebar-footer">
                                     <div class="footer-links">
                                       <a href="about.html" target="_blank">About</a>
                                       <a href="contact.html" target="_blank">Contact</a>
                                       <a href="https://twitter.com/" target="_blank" aria-label="Twitter" class="footer-social"><svg width="18" height="18" viewBox="0 0 20 20"><path fill="#1da1f2" d="M20 3.924a8.18 8.18 0 0 1-2.357.646A4.118 4.118 0 0 0 19.448 2.3a8.224 8.224 0 0 1-2.605.996A4.107 4.107 0 0 0 9.85 7.034a11.65 11.65 0 0 1-8.457-4.287a4.106 4.106 0 0 0 1.27 5.482A4.073 4.073 0 0 1 .8 7.15v.052a4.108 4.108 0 0 0 3.292 4.025a4.095 4.095 0 0 1-1.853.07a4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 0 17.54a11.616 11.616 0 0 0 6.29 1.84c7.547 0 11.675-6.155 11.675-11.49c0-.175-.004-.349-.012-.522A8.18 8.18 0 0 0 20 3.924z"/></svg></a>
                                       <a href="https://facebook.com/" target="_blank" aria-label="Facebook" class="footer-social"><svg width="18" height="18" viewBox="0 0 20 20"><path fill="#1877f3" d="M18.896 0H1.104C.494 0 0 .494 0 1.104v17.792C0 19.506.494 20 1.104 20h9.583v-7.745H8.077v-3.02h2.61V7.413c0-2.587 1.582-3.997 3.892-3.997c1.107 0 2.057.082 2.334.119v2.707h-1.602c-1.257 0-1.5.597-1.5 1.474v1.934h3l-.391 3.02h-2.609V20h5.116c.61 0 1.104-.494 1.104-1.104V1.104C20 .494 19.506 0 18.896 0"/></svg></a>
                                     </div>
                                     <div class="footer-copy">&copy; 2026 ElectroMart</div>
                                   </div>
                           <div class="sidebar-theme-toggle">
                             <label class="theme-switch">
                               <input type="checkbox" id="themeToggle">
                               <span class="slider"></span>
                             </label>
                             <span class="theme-label" id="themeLabel">Light Mode</span>
                           </div>
                   <div class="dept-search-box">
                     <input type="text" id="deptQuickSearch" placeholder="Search departments..." aria-label="Search departments" autocomplete="off">
                   </div>
                   <!-- Accessibility: ARIA roles for navigation -->
                   <ul class="dept-nav-list" role="menu" aria-label="Departments">
           <div class="dept-signin-block">
             <span class="signin-icon" id="sidebarAvatar" aria-hidden="true">👤</span>
             <span class="signin-text" id="sidebarGreeting"><strong>Hello,</strong> <a href="auth.html">sign in</a></span>
           </div>
           <h2 class="dept-sidebar-title">All Departments</h2>
           <!-- Trending Section -->
           <div class="dept-section">
             <div class="dept-label">Trending</div>
             <a class="dept-link" href="best-sellers.html">Best Sellers</a>
             <a class="dept-link" href="products.html">New Arrivals</a>
             <a class="dept-link" href="products.html">Top Rated</a>
           </div>
           <div class="dept-divider"></div>

         <!-- Shop by Category Section -->
         <div class="dept-section">
           <div class="dept-label collapsible-label" tabindex="0" data-section="shop-category" role="menuitem" aria-expanded="true">Shop by Category <span class="collapse-arrow">&#9660;</span></div>
           <a class="dept-link" href="desktops.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="2" y="5" width="16" height="10" rx="2" fill="#0a4b78"/></svg></span>Desktops <span class="badge badge-hot">Hot</span></a>
           <a class="dept-link" href="barebone-desktop.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="3" y="7" width="14" height="6" rx="1.5" fill="#0a4b78"/></svg></span>Barebone Desktop</a>
           <a class="dept-link" href="branded-desktop.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="4" y="6" width="12" height="8" rx="2" fill="#0a4b78"/></svg></span>Branded Desktop</a>
           <a class="dept-link" href="laptop.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="3" y="7" width="14" height="5" rx="1.5" fill="#0a4b78"/><rect x="5" y="13" width="10" height="2" rx="1" fill="#0a4b78"/></svg></span>Laptops <span class="badge badge-new">New</span></a>
           <a class="dept-link" href="cpu-processor.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="6" y="6" width="8" height="8" rx="2" fill="#0a4b78"/></svg></span>CPU / Processor</a>
           <a class="dept-link" href="motherboard.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="3" y="8" width="14" height="4" rx="1.5" fill="#0a4b78"/></svg></span>Motherboard</a>
           <a class="dept-link" href="desktop-ram-memory.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="5" y="8" width="10" height="4" rx="1" fill="#0a4b78"/></svg></span>Desktop RAM</a>
           <a class="dept-link" href="graphics-card-gpu.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="4" y="9" width="12" height="2" rx="1" fill="#0a4b78"/></svg></span>Graphics Card / GPU <span class="badge badge-sale">Sale</span></a>
           <a class="dept-link" href="power-supply-smps.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="7" y="8" width="6" height="4" rx="1" fill="#0a4b78"/></svg></span>Power Supply / SMPS</a>
           <a class="dept-link" href="cabinet.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="5" y="7" width="10" height="6" rx="2" fill="#0a4b78"/></svg></span>Cabinet</a>
           <a class="dept-link" href="cabinet-fan.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="#0a4b78"/></svg></span>Cabinet Fan</a>
           <a class="dept-link" href="printer.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="4" y="8" width="12" height="4" rx="1.5" fill="#0a4b78"/></svg></span>Printer</a>
           <a class="dept-link" href="pc-builder.html"><span class="dept-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20"><rect x="6" y="7" width="8" height="6" rx="1.5" fill="#0a4b78"/></svg></span>PC Builder</a>
         </div>
         <div class="dept-divider"></div>

         <!-- Help & Settings Section -->
         <div class="dept-section">
           <div class="dept-label collapsible-label" tabindex="0" data-section="help-settings" role="menuitem" aria-expanded="true">Help & Settings <span class="collapse-arrow">&#9660;</span></div>
           <a class="dept-link" href="account.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" fill="#0a4b78"/><rect x="3" y="13" width="14" height="5" rx="2.5" fill="#0a4b78"/></svg></span>Your Account</a>
           <a class="dept-link" href="orders.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="12" rx="2" fill="#0a4b78"/><rect x="6" y="2" width="8" height="3" rx="1.5" fill="#0a4b78"/></svg></span>Your Orders</a>
           <span class="notif-badge" id="ordersNotif"></span>
           <span class="notif-badge" id="wishlistNotif"></span>
           <a class="dept-link" href="faq.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#0a4b78" stroke-width="2"/><text x="10" y="15" text-anchor="middle" font-size="12" fill="#0a4b78">?</text></svg></span>FAQ</a>
           <a class="dept-link" href="auth.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#0a4b78" stroke-width="2"/><path d="M10 6v4l3 3" stroke="#0a4b78" stroke-width="2" stroke-linecap="round"/></svg></span>Sign In</a>
           <a class="dept-link" href="shipping-policy.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="7" width="16" height="8" rx="2" fill="#0a4b78"/><rect x="5" y="5" width="10" height="2" rx="1" fill="#0a4b78"/></svg></span>Shipping Policy</a>
           <a class="dept-link" href="refund-policy.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#0a4b78" stroke-width="2"/><path d="M7 10l3 3 3-3" stroke="#0a4b78" stroke-width="2" stroke-linecap="round"/></svg></span>Refund Policy</a>
           <a class="dept-link" href="terms.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="2" fill="#0a4b78"/></svg></span>Terms &amp; Conditions</a>
           <a class="dept-link" href="accessibility-statement.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#0a4b78" stroke-width="2"/></svg></span>Accessibility Statement</a>
           <a class="dept-link" href="review.html"><span class="dept-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="6" rx="2" fill="#0a4b78"/></svg></span>Customer Reviews</a>
         </div>
       </nav>
     </aside>
   </header>
    `;
    
    syncCartCount();

    // All Departments Sidebar Logic
    const deptTrigger = document.getElementById('deptTrigger');
    const deptSidebar = document.getElementById('deptSidebar');
    const deptOverlay = document.getElementById('deptOverlay');
    const deptClose = document.getElementById('deptClose');

    function openSidebar() {
      if (!deptSidebar || !deptOverlay) return;
      deptSidebar.removeAttribute('hidden');
      deptOverlay.removeAttribute('hidden');
      // Small delay to ensure CSS transition works after removing hidden
      setTimeout(() => {
        deptSidebar.classList.add('open');
      }, 10);
      if (deptTrigger) deptTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      if (!deptSidebar || !deptOverlay) return;
      deptSidebar.classList.remove('open');
      if (deptTrigger) deptTrigger.setAttribute('aria-expanded', 'false');
      // Wait for transition to finish before hiding elements
      setTimeout(() => {
        deptSidebar.setAttribute('hidden', '');
        deptOverlay.setAttribute('hidden', '');
      }, 250); // Matches 0.25s transition in CSS
    }

    if (deptTrigger) {
      deptTrigger.addEventListener('click', openSidebar);
    }
    if (deptClose) {
      deptClose.addEventListener('click', closeSidebar);
    }
    if (deptOverlay) {
      deptOverlay.addEventListener('click', closeSidebar);
    }
  }
  
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

  // Amazon-style Search Auto-Suggestions
  function initSearchSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('searchSuggestions');
    
    if (!searchInput || !suggestionsBox) return;

    const RECENT_SEARCHES_KEY = 'electromart_recent_searches';
    const TRENDING_SEARCHES = [
      'gaming laptop',
      'wireless headphones',
      'smartphone under 20000',
      'mechanical keyboard',
      '4k monitor',
      'bluetooth speaker'
    ];

    let debounceTimer;

    function getRecentSearches() {
      try {
        const searches = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
        return searches.slice(0, 5); // Show max 5 recent searches
      } catch {
        return [];
      }
    }

    function saveRecentSearch(query) {
      if (!query || query.trim().length < 2) return;
      
      try {
        let searches = getRecentSearches();
        // Remove duplicate if exists
        searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
        // Add to beginning
        searches.unshift(query.trim());
        // Keep only last 10
        searches = searches.slice(0, 10);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      } catch {}
    }

    function renderSuggestions(suggestions, type) {
      if (!suggestions || suggestions.length === 0) {
        suggestionsBox.hidden = true;
        suggestionsBox.innerHTML = '';
        return;
      }

      const html = suggestions.map(item => {
        const icon = type === 'recent' ? '🕐' : (type === 'trending' ? '🔥' : '🔍');
        return `
          <div class="suggestion-item" data-query="${item}" role="option">
            <span class="suggestion-icon">${icon}</span>
            <span class="suggestion-text">${item}</span>
          </div>
        `;
      }).join('');

      suggestionsBox.innerHTML = html;
      suggestionsBox.hidden = false;
    }

    function showDefaultSuggestions() {
      const recent = getRecentSearches();
      const trending = TRENDING_SEARCHES;

      if (recent.length > 0) {
        renderSuggestions(recent, 'recent');
      } else {
        renderSuggestions(trending, 'trending');
      }
    }

    // Show suggestions on focus
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length === 0) {
        showDefaultSuggestions();
      }
    });

    // Handle input with debounce
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();

      if (query.length === 0) {
        showDefaultSuggestions();
        return;
      }

      if (query.length < 2) {
        suggestionsBox.hidden = true;
        return;
      }

      // Debounce API call or filtering
      debounceTimer = setTimeout(() => {
        // For now, just hide suggestions during typing
        // In future, integrate with backend search API
        suggestionsBox.hidden = true;
      }, 300);
    });

    // Handle suggestion click
    suggestionsBox.addEventListener('click', (e) => {
      const item = e.target.closest('.suggestion-item');
      if (!item) return;

      const query = item.dataset.query;
      searchInput.value = query;
      suggestionsBox.hidden = true;
      saveRecentSearch(query);

      // Trigger search form submission
      const searchForm = document.getElementById('searchForm');
      if (searchForm) {
        searchForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });

    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.hidden = true;
      }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      const items = suggestionsBox.querySelectorAll('.suggestion-item');
      if (items.length === 0) return;

      const currentIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items.forEach(item => item.classList.remove('active'));
        items[nextIndex].classList.add('active');
        items[nextIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items.forEach(item => item.classList.remove('active'));
        items[prevIndex].classList.add('active');
        items[prevIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (currentIndex >= 0) {
          e.preventDefault();
          items[currentIndex].click();
        }
      } else if (e.key === 'Escape') {
        suggestionsBox.hidden = true;
      }
    });
  }

  // Initialize search suggestions after header is injected
  setTimeout(() => {
    initSearchSuggestions();
  }, 100);

})();

