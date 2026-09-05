/**
 * ElectroMart Seller Central & Store Admin — Shared Infrastructure (Phase 12)
 * Provides universal Seller Central header, department navigation, authentication,
 * state persistence, and helper utilities.
 */

(function (global) {
  'use strict';

  const AUTH_STORAGE_KEY = 'electromart_auth_v1';
  const LOCAL_USERS_KEY = 'electromart_local_users_v1';
  const OFFLINE_ORDERS_KEY = 'electromart_offline_orders_v1';
  const CATALOG_STORAGE_KEY = 'electromart_catalog_v1';
  const AUDIT_STORAGE_KEY = 'electromart_audit_trail_v1';
  const SETTINGS_STORAGE_KEY = 'electromart_store_settings_v1';

  const API_BASE_URL = (() => {
    const { protocol, hostname, port } = window.location;
    if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000/api';
    }
    const origin = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    return `${origin}/api`;
  })();

  const DEPARTMENTS = [
    { id: 'dashboard', file: 'admin-dashboard.html', icon: '🏠', key: 'dept_dashboard', label: 'Dashboard' },
    { id: 'orders', file: 'admin-orders.html', icon: '📦', key: 'dept_orders', label: 'Orders & Fulfillment' },
    { id: 'listing', file: 'admin-listing.html', icon: '🏷️', key: 'dept_inventory', label: 'Inventory & Catalog' },
    { id: 'analytics', file: 'admin-analytics.html', icon: '📊', key: 'dept_analytics', label: 'Sales & Analytics' },
    { id: 'after-sales', file: 'admin-after-sales.html', icon: '🔄', key: 'dept_returns', label: 'Returns & Support' },
    { id: 'users', file: 'admin-users.html', icon: '👥', key: 'dept_customers', label: 'Customer Accounts' },
    { id: 'audit', file: 'admin-audit.html', icon: '🛡️', key: 'dept_audit', label: 'Audit Trail' },
    { id: 'settings', file: 'admin-settings.html', icon: '⚙️', key: 'dept_settings', label: 'Store Settings' }
  ];

  function getSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
    }
    // Default demo admin session for frictionless local operations
    return {
      id: 'usr_admin_default',
      name: 'Operations Admin',
      email: 'admin@electromart.in',
      role: 'admin',
      token: 'demo_admin_jwt_token'
    };
  }

  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  }

  function formatDate(val) {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return String(val);
    }
  }

  function t(key, fallback) {
    if (window.EM_I18N && typeof window.EM_I18N.t === 'function') {
      const val = window.EM_I18N.t(key);
      if (val && val !== key) return val;
    }
    return fallback || key;
  }

  function renderTopbar(activeDeptId) {
    const container = document.getElementById('sellerHeaderContainer');
    if (!container) return;

    const session = getSession();
    const currentLang = localStorage.getItem('electromart_lang') || 'en';

    const languages = [
      { code: 'en', label: 'English - EN' },
      { code: 'hi', label: 'हिन्दी - HI' },
      { code: 'ta', label: 'தமிழ் - TA' },
      { code: 'te', label: 'తెలుగు - TE' },
      { code: 'mr', label: 'मराठी - MR' },
      { code: 'bn', label: 'বাংলা - BN' },
      { code: 'kn', label: 'ಕನ್ನಡ - KN' },
      { code: 'ml', label: 'മലയാളം - ML' },
      { code: 'ur', label: 'اردو - UR' },
      { code: 'pa', label: 'ਪੰਜਾਬੀ - PA' },
      { code: 'gu', label: 'ગુજરાતી - GU' }
    ];

    container.innerHTML = `
      <header class="amz-seller-topbar" role="banner">
        <div class="amz-seller-topbar-left">
          <a href="admin-dashboard.html" class="amz-seller-brand" title="ElectroMart Seller Central">
            <span class="brand-text">ElectroMart</span>
            <span class="seller-tag" data-i18n="seller_central">${t('seller_central', 'Seller Central')}</span>
          </a>
          <div class="amz-seller-marketplace" title="Marketplace: India">
            <span class="mp-flag">🇮🇳</span>
            <span class="mp-name">India</span>
          </div>
        </div>

        <div class="amz-seller-topbar-search">
          <div class="amz-search-box">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input type="search" id="amzGlobalSearchInput" placeholder="Search orders, catalog, ASIN/SKU, customers..." aria-label="Global Seller Search" />
          </div>
        </div>

        <div class="amz-seller-topbar-right">
          <!-- Language Selector -->
          <div class="amz-seller-lang-wrap">
            <span class="globe-icon" aria-hidden="true">🌐</span>
            <select id="amzSellerLangSelect" aria-label="Change Language">
              ${languages.map(l => `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.label}</option>`).join('')}
            </select>
          </div>

          <!-- Storefront Quick Link -->
          <a href="index.html" class="amz-seller-link" target="_blank" rel="noopener noreferrer" title="Open Customer Storefront">
            <span>🛒</span>
            <span class="link-label">Storefront</span>
          </a>

          <!-- Staff Profile Dropdown -->
          <div class="amz-seller-profile" id="sellerProfileMenu">
            <button type="button" class="profile-btn" id="sellerProfileBtn" aria-expanded="false" aria-haspopup="true">
              <span class="avatar">👤</span>
              <span class="staff-name">${session.name || 'Admin'}</span>
              <span class="chevron">▾</span>
            </button>
            <div class="profile-dropdown" id="sellerProfileDropdown" hidden>
              <div class="dropdown-header">
                <strong>${session.name || 'Operations Staff'}</strong>
                <small>${session.email || 'admin@electromart.in'}</small>
                <span class="role-badge">Admin</span>
              </div>
              <ul class="dropdown-links">
                <li><a href="account.html">My Store Account</a></li>
                <li><a href="admin-settings.html">Store Settings</a></li>
                <li><hr /></li>
                <li><a href="javascript:void(0)" id="sellerSignOutBtn" class="danger-link">Sign Out</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <!-- Department Navigation Bar -->
      <nav class="amz-seller-dept-nav" aria-label="Seller Central Departments">
        <div class="dept-nav-scroll">
          ${DEPARTMENTS.map(dept => {
            const isActive = dept.id === activeDeptId;
            return `
              <a href="${dept.file}" class="dept-nav-item ${isActive ? 'active' : ''}" data-dept="${dept.id}">
                <span class="dept-icon" aria-hidden="true">${dept.icon}</span>
                <span class="dept-label" data-i18n="${dept.key}">${t(dept.key, dept.label)}</span>
              </a>
            `;
          }).join('')}
        </div>
      </nav>
    `;

    // Hook events
    const langSelect = document.getElementById('amzSellerLangSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('electromart_lang', lang);
        if (window.EM_I18N && typeof window.EM_I18N.setLanguage === 'function') {
          window.EM_I18N.setLanguage(lang);
        }
        window.location.reload();
      });
    }

    const profileBtn = document.getElementById('sellerProfileBtn');
    const profileDropdown = document.getElementById('sellerProfileDropdown');
    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !profileDropdown.hidden;
        profileDropdown.hidden = isOpen;
        profileBtn.setAttribute('aria-expanded', String(!isOpen));
      });
      document.addEventListener('click', () => {
        if (!profileDropdown.hidden) {
          profileDropdown.hidden = true;
          profileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const signOutBtn = document.getElementById('sellerSignOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.location.href = 'auth.html?mode=admin&redirect=admin-dashboard.html';
      });
    }

    // Global search handler
    const globalSearchInput = document.getElementById('amzGlobalSearchInput');
    if (globalSearchInput) {
      globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = globalSearchInput.value.trim();
          if (q) {
            window.location.href = `admin-orders.html?search=${encodeURIComponent(q)}`;
          }
        }
      });
    }
  }

  function showToast(message, type = 'info') {
    let stack = document.getElementById('amzSellerToastStack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'amzSellerToastStack';
      stack.className = 'amz-seller-toast-stack';
      document.body.appendChild(stack);
    }
    const toast = document.createElement('div');
    toast.className = `amz-seller-toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span class="toast-text">${message}</span>
    `;
    stack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // Record Admin Audit Trail
  function recordAudit(action, category, target, summary) {
    const session = getSession();
    const entry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor: session.name || session.email || 'Admin Staff',
      category: category || 'general',
      action: action || 'MUTATION',
      target: target || 'system',
      summary: summary || ''
    };

    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      if (list.length > 200) list.pop();
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to persist audit log:', e);
    }
    return entry;
  }

  // Load Seed Orders if none exist
  function getSeedOrders() {
    return [
      {
        id: 'ORD-IN-2026-9081',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        customer: { name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '+91 98765 43210', city: 'New Delhi', pincode: '110001' },
        items: [{ id: 'LAP-ASUS-ROG16', name: 'ASUS ROG Strix G16 Gaming Laptop', price: 119990, quantity: 1 }],
        total: 119990,
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        status: 'pending',
        trackingNumber: '',
        courier: 'Easy Ship Standard'
      },
      {
        id: 'ORD-IN-2026-9080',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        customer: { name: 'Priya Patel', email: 'priya.p@example.com', phone: '+91 98111 22233', city: 'Ahmedabad', pincode: '380015' },
        items: [{ id: 'MOB-SAM-S24U', name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray)', price: 129999, quantity: 1 }],
        total: 129999,
        paymentMethod: 'Credit Card',
        paymentStatus: 'paid',
        status: 'shipped',
        trackingNumber: 'EM-IN-7821904',
        courier: 'Delhivery Air'
      },
      {
        id: 'ORD-IN-2026-9079',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        customer: { name: 'Vikram Mehta', email: 'vikram.m@example.com', phone: '+91 97234 56789', city: 'Mumbai', pincode: '400001' },
        items: [{ id: 'ACC-LOGI-MXM3S', name: 'Logitech MX Master 3S Wireless Mouse', price: 8995, quantity: 1 }],
        total: 8995,
        paymentMethod: 'Net Banking',
        paymentStatus: 'paid',
        status: 'delivered',
        trackingNumber: 'EM-IN-7821855',
        courier: 'Blue Dart Express'
      },
      {
        id: 'ORD-IN-2026-9078',
        createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
        customer: { name: 'Ananya Roy', email: 'ananya.roy@example.com', phone: '+91 99001 23456', city: 'Kolkata', pincode: '700001' },
        items: [{ id: 'AUD-SONY-WH1000XM5', name: 'Sony WH-1000XM5 Noise Canceling Headphones', price: 29990, quantity: 1 }],
        total: 29990,
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        status: 'delivered',
        trackingNumber: 'EM-IN-7821720',
        courier: 'Easy Ship Express'
      },
      {
        id: 'ORD-IN-2026-9077',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        customer: { name: 'Siddharth Iyer', email: 'siddharth.i@example.com', phone: '+91 98450 12345', city: 'Bengaluru', pincode: '560001' },
        items: [{ id: 'KEY-COR-K70', name: 'Corsair K70 RGB Mechanical Keyboard', price: 12499, quantity: 1 }],
        total: 12499,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending',
        status: 'pending',
        trackingNumber: '',
        courier: 'Easy Ship Standard'
      }
    ];
  }

  function getOrders() {
    try {
      const raw = localStorage.getItem(OFFLINE_ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading offline orders:', e);
    }
    const seed = getSeedOrders();
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(seed));
    return seed;
  }

  function saveOrders(orders) {
    try {
      localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed saving offline orders:', e);
    }
  }

  // Load Seed Catalog
  function getCatalog() {
    try {
      const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    if (Array.isArray(window.EM_CATALOG) && window.EM_CATALOG.length > 0) {
      return window.EM_CATALOG;
    }
    return [];
  }

  // Public API
  global.EM_ADMIN = {
    API_BASE_URL,
    DEPARTMENTS,
    getSession,
    renderTopbar,
    formatCurrency,
    formatDate,
    showToast,
    recordAudit,
    getOrders,
    saveOrders,
    getCatalog,
    t
  };

})(window);
