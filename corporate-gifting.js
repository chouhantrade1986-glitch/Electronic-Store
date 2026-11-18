/**
 * ElectroMart Corporate Gifting & Bulk Orders Hub Controller (Phase 45)
 * =====================================================================
 * Enterprise procurement engine:
 *  - Festival & Seasonal Gifting Catalogs
 *  - GST Commercial Bulk Invoicing & PO Management
 *  - Corporate Gift Registries & Recipient Management
 *  - Procurement Team & Spending Analytics Dashboard
 *
 * Determinism & Contracts:
 *  - Server-authoritative registry IDs, access, and persistence
 *  - Local storage persistence only for non-registry UI data
 *  - 100% Brand Safety: ElectroMart only
 */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.CorporateGifting = electroMart.CorporateGifting || root.ElectroMartCorporateGifting || {};
  root.ElectroMartCorporateGifting = namespace;

  /* ---------------------------------------------------------------------
   * Storage Keys
   * ------------------------------------------------------------------- */
  var FESTIVAL_CATALOG_KEY = 'electromart_cg_festival_catalog_v1';
  var BULK_ORDERS_KEY = 'electromart_cg_bulk_orders_v1';
  var TEAM_MEMBERS_KEY = 'electromart_cg_team_members_v1';
  var AUTH_KEY = 'electromart_auth_v1';
  var resolvedApiBaseUrl = '';

  /* ---------------------------------------------------------------------
   * Deterministic Hashing Helper
   * ------------------------------------------------------------------- */
  function deterministicHash(inputString) {
    var str = String(inputString || '');
    var hash = 2166136261;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    var hex = (hash >>> 0).toString(16).toUpperCase();
    while (hex.length < 8) {
      hex = '0' + hex;
    }
    return hex;
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------------------------------------------------------------------
   * Safe Storage Helpers
   * ------------------------------------------------------------------- */
  function getStoredItems(key) {
    try {
      if (root.localStorage) {
        var raw = root.localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return [];
  }

  function saveStoredItems(key, items) {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(key, JSON.stringify(items));
      }
    } catch (e) {}
  }

  /* ---------------------------------------------------------------------
   * 1. Bulk Order Total Calculator
   * ------------------------------------------------------------------- */
  function calculateBulkOrderTotal(items) {
    if (!Array.isArray(items)) {
      return { subtotal: 0, gst: 0, total: 0 };
    }

    var subtotal = 0;
    var totalGst = 0;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var unitPrice = Number(item.unitPrice) || 0;
      var quantity = Number(item.quantity) || 0;
      var gstRate = (item.gstRate !== undefined && item.gstRate !== null) ? Number(item.gstRate) : 0.18;

      var lineSubtotal = unitPrice * quantity;
      var lineGst = lineSubtotal * gstRate;

      subtotal += lineSubtotal;
      totalGst += lineGst;
    }

    // Rounding to 2 decimal places deterministically
    subtotal = Math.round(subtotal * 100) / 100;
    totalGst = Math.round(totalGst * 100) / 100;
    var grandTotal = Math.round((subtotal + totalGst) * 100) / 100;

    return {
      subtotal: subtotal,
      gst: totalGst,
      total: grandTotal
    };
  }

  /* ---------------------------------------------------------------------
   * 2. Bulk Invoice Generator
   * ------------------------------------------------------------------- */
  function generateBulkInvoice(bulkOrder) {
    if (!bulkOrder || typeof bulkOrder !== 'object') {
      throw new Error('Valid bulkOrder object is required');
    }

    var poNumber = String(bulkOrder.poNumber || '').trim();
    var companyName = String(bulkOrder.companyName || '').trim();
    var gstin = String(bulkOrder.gstin || '').trim();
    var items = Array.isArray(bulkOrder.items) ? bulkOrder.items : [];
    var billingAddress = String(bulkOrder.billingAddress || '').trim();
    var shippingAddress = String(bulkOrder.shippingAddress || '').trim();

    var calculation = calculateBulkOrderTotal(items);

    var seed = poNumber + '|' + companyName + '|' + gstin + '|' + items.length + '|' + calculation.subtotal;
    var invoiceCode = deterministicHash(seed);
    var invoiceNumber = 'EM-CG-INV-' + invoiceCode;

    var invoice = {
      invoiceNumber: invoiceNumber,
      poNumber: poNumber,
      companyName: companyName,
      gstin: gstin,
      billingAddress: billingAddress,
      shippingAddress: shippingAddress,
      items: items,
      subtotal: calculation.subtotal,
      gstAmount: calculation.gst,
      total: calculation.total,
      createdAt: '2026-10-11T00:00:00.000Z'
    };

    var existing = getStoredItems(BULK_ORDERS_KEY);
    var exists = false;
    for (var j = 0; j < existing.length; j++) {
      if (existing[j].invoiceNumber === invoiceNumber) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      existing.unshift(invoice);
      saveStoredItems(BULK_ORDERS_KEY, existing.slice(0, 50));
    }

    return invoice;
  }

  /* ---------------------------------------------------------------------
   * 3. Gift Registry Engine
   * ------------------------------------------------------------------- */
  function createGiftRegistry(registryData) {
    if (!registryData || typeof registryData !== 'object') {
      throw new Error('Valid registryData object is required');
    }

    var registryName = String(registryData.registryName || '').trim();
    var occasion = String(registryData.occasion || 'general').trim();
    var eventDate = String(registryData.eventDate || '').trim();
    var items = Array.isArray(registryData.items) ? registryData.items : [];
    var recipients = Array.isArray(registryData.recipients) ? registryData.recipients : [];

    return {
      registryName: registryName,
      occasion: occasion,
      eventDate: eventDate,
      items: items,
      recipients: recipients
    };
  }

  function getAuthSession() {
    try {
      var session = root.localStorage ? JSON.parse(root.localStorage.getItem(AUTH_KEY) || 'null') : null;
      return session && typeof session === 'object' && session.token ? session : null;
    } catch (error) {
      return null;
    }
  }

  function resolveApiBaseUrl() {
    if (resolvedApiBaseUrl) return Promise.resolve(resolvedApiBaseUrl);
    var configuredBase = String(root.__ELECTROMART_CONFIG__ && root.__ELECTROMART_CONFIG__.apiBaseUrl || '').trim();
    var candidates = [(configuredBase || '/api').replace(/\/+$/, '')];

    return candidates.reduce(function (pending, candidate) {
      return pending.then(function (found) {
        if (found) return found;
        return root.fetch(candidate + '/health').then(function (response) {
          if (response.ok) {
            resolvedApiBaseUrl = candidate;
            return candidate;
          }
          return '';
        }).catch(function () { return ''; });
      });
    }, Promise.resolve('')).then(function (found) {
      if (!found) throw new Error('Corporate registry services are unavailable. Start the backend or configure its API URL.');
      return found;
    });
  }

  function requestCorporateApi(path, options) {
    var requestOptions = options || {};
    return resolveApiBaseUrl().then(function (apiBaseUrl) {
      var session = getAuthSession();
      var headers = Object.assign({ 'Content-Type': 'application/json' }, requestOptions.headers || {});
      if (session) headers.Authorization = 'Bearer ' + session.token;
      return root.fetch(apiBaseUrl + '/corporate' + path, Object.assign({}, requestOptions, { headers: headers }));
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) throw new Error(body.message || 'The corporate registry request could not be completed.');
        return body;
      });
    });
  }

  /* ---------------------------------------------------------------------
   * 4. Team Member Management Engine
   * ------------------------------------------------------------------- */
  function addTeamMember(memberData) {
    if (!memberData || typeof memberData !== 'object') {
      throw new Error('Valid memberData object is required');
    }

    var name = String(memberData.name || '').trim();
    var email = String(memberData.email || '').trim();
    var role = String(memberData.role || 'team_member').trim();
    var budgetLimit = Number(memberData.budgetLimit) || 0;

    var seed = name + '|' + email + '|' + role;
    var memberCode = deterministicHash(seed);
    var memberId = 'EM-CG-TM-' + memberCode;

    var member = {
      memberId: memberId,
      name: name,
      email: email,
      role: role,
      budgetLimit: budgetLimit,
      addedAt: '2026-10-11T00:00:00.000Z'
    };

    var existing = getStoredItems(TEAM_MEMBERS_KEY);
    var exists = false;
    for (var m = 0; m < existing.length; m++) {
      if (existing[m].memberId === memberId) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      existing.push(member);
      saveStoredItems(TEAM_MEMBERS_KEY, existing.slice(0, 50));
    }

    return member;
  }

  /* ---------------------------------------------------------------------
   * Expose Methods on Namespace
   * ------------------------------------------------------------------- */
  namespace.generateBulkInvoice = generateBulkInvoice;
  namespace.calculateBulkOrderTotal = calculateBulkOrderTotal;
  namespace.createGiftRegistry = createGiftRegistry;
  namespace.addTeamMember = addTeamMember;
  namespace.escapeHtml = escapeHtml;

  /* ---------------------------------------------------------------------
   * Default Festival Catalogs & Products Data
   * ------------------------------------------------------------------- */
  var DEFAULT_FESTIVAL_CATALOGS = {
    diwali: [
      { id: 'CG-PROD-01', name: 'ElectroMart Executive SoundBar 120W', category: 'Audio', unitPrice: 4999, bulkMoq: 20, discount: '25% Off', badge: 'Diwali Bestseller', image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80' },
      { id: 'CG-PROD-02', name: 'AstraTech 20,000mAh MagSafe PowerBank Hub', category: 'Power', unitPrice: 1899, bulkMoq: 50, discount: '30% Off', badge: 'Top Corporate Pick', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=500&q=80' },
      { id: 'CG-PROD-03', name: 'PulseFit Pro ANC Smartwatch & Metal Band', category: 'Wearables', unitPrice: 3299, bulkMoq: 25, discount: '20% Off', badge: 'Leadership Gift', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80' },
      { id: 'CG-PROD-04', name: 'SonicBlast True Wireless Quad-Mic Earbuds', category: 'Audio', unitPrice: 1499, bulkMoq: 100, discount: '35% Off', badge: 'Volume Deal', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80' }
    ],
    new_year: [
      { id: 'CG-PROD-05', name: 'ErgoComfort Wireless Desk Ergonomics Kit', category: 'Workspace', unitPrice: 2499, bulkMoq: 30, discount: '18% Off', badge: 'New Year Kickoff', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80' },
      { id: 'CG-PROD-06', name: 'SmartDesk 4K Conference Webcam & Ring Light', category: 'Peripherals', unitPrice: 2999, bulkMoq: 25, discount: '22% Off', badge: 'Hybrid Work Kit', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=500&q=80' }
    ],
    rewards: [
      { id: 'CG-PROD-07', name: 'ElectroMart UltraBook Pro 14 Elite Edition', category: 'Laptops', unitPrice: 58999, bulkMoq: 5, discount: '15% Off', badge: 'Chairman Excellence Award', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80' },
      { id: 'CG-PROD-08', name: 'OLED Studio Monitor 27-inch 165Hz', category: 'Monitors', unitPrice: 22999, bulkMoq: 10, discount: '18% Off', badge: 'Annual Achiever Reward', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80' }
    ]
  };

  /* ---------------------------------------------------------------------
   * DOM Initialization (Safe Browser-only Execution)
   * ------------------------------------------------------------------- */
  function initializeHubUI() {
    if (!doc || !doc.getElementById) return;

    var festivalCatalogGrid = doc.getElementById('festivalCatalogGrid');
    var cgProductGrid = doc.getElementById('cgProductGrid');
    var festivalTabs = doc.getElementById('festivalTabs');
    var bulkItemProductSelect = doc.getElementById('bulkItemProductSelect');
    var bulkItemUnitPriceInput = doc.getElementById('bulkItemUnitPriceInput');
    var bulkItemQuantityInput = doc.getElementById('bulkItemQuantityInput');
    var addBulkItemBtn = doc.getElementById('addBulkItemBtn');
    var bulkItemsContainer = doc.getElementById('bulkItemsContainer');
    var bulkOrderForm = doc.getElementById('bulkOrderForm');
    var bulkInvoicePreview = doc.getElementById('bulkInvoicePreview');
    var bulkInvoiceTotal = doc.getElementById('bulkInvoiceTotal');
    var giftRegistryForm = doc.getElementById('giftRegistryForm');
    var registryShareLink = doc.getElementById('registryShareLink');
    var registryStatus = doc.getElementById('registryStatus');
    var registryItemsContainer = doc.getElementById('registryItemsContainer');
    var registryItemProductSelect = doc.getElementById('registryItemProductSelect');
    var registryItemQuantityInput = doc.getElementById('registryItemQuantityInput');
    var addRegistryItemBtn = doc.getElementById('addRegistryItemBtn');
    var shareRegistryBtn = doc.getElementById('shareRegistryBtn');
    var addTeamMemberForm = doc.getElementById('addTeamMemberForm');
    var ordersHistoryTable = doc.getElementById('ordersHistoryTable');
    var teamManagementTable = doc.getElementById('teamManagementTable');
    var spendingAnalyticsChart = doc.getElementById('spendingAnalyticsChart');

    // Populate Catalog Grid
    function renderCatalogCards(categoryKey) {
      var items = DEFAULT_FESTIVAL_CATALOGS[categoryKey] || DEFAULT_FESTIVAL_CATALOGS.diwali;
      var html = '';
      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        html += '<div class="cg-product-card">' +
          '<div class="cg-product-image">' +
            '<span class="cg-product-badge">' + p.badge + '</span>' +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />' +
          '</div>' +
          '<div class="cg-product-body">' +
            '<h4 class="cg-product-title">' + p.name + '</h4>' +
            '<p class="cg-product-specs">MOQ: ' + p.bulkMoq + ' Units | Category: ' + p.category + '</p>' +
            '<div class="cg-product-pricing">' +
              '<span class="cg-unit-price">₹' + p.unitPrice.toLocaleString('en-IN') + '</span>' +
              '<span class="cg-tier-discount">' + p.discount + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }
      if (festivalCatalogGrid) festivalCatalogGrid.innerHTML = html;
      if (cgProductGrid) cgProductGrid.innerHTML = html;
    }

    renderCatalogCards('diwali');

    var activeRegistryItems = [];
    var activeRegistry = null;
    var activeRegistryShareToken = '';
    var shareTokenFromUrl = '';

    function setRegistryStatus(message, isError) {
      if (!registryStatus) return;
      registryStatus.textContent = message;
      registryStatus.setAttribute('role', isError ? 'alert' : 'status');
      registryStatus.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    }

    function renderRegistryItems() {
      if (!registryItemsContainer) return;
      if (!activeRegistryItems.length) {
        registryItemsContainer.textContent = 'No products added to this registry yet.';
        return;
      }
      registryItemsContainer.textContent = '';
      activeRegistryItems.forEach(function (item) {
        var product = allRegistryProducts.find(function (entry) { return entry.id === item.productId; });
        var chip = doc.createElement('div');
        chip.className = 'cg-registry-item-chip';
        var label = doc.createElement('span');
        label.textContent = (product ? product.name : item.productId) + ' (Qty: ' + item.quantity + ')';
        chip.appendChild(label);
        registryItemsContainer.appendChild(chip);
      });
    }

    var allRegistryProducts = [];
    Object.keys(DEFAULT_FESTIVAL_CATALOGS).forEach(function (key) {
      allRegistryProducts = allRegistryProducts.concat(DEFAULT_FESTIVAL_CATALOGS[key]);
    });
    if (registryItemProductSelect) {
      var registryOptions = '<option value="">Select a corporate product...</option>';
      allRegistryProducts.forEach(function (product) {
        registryOptions += '<option value="' + product.id + '">' + product.name + '</option>';
      });
      registryItemProductSelect.innerHTML = registryOptions;
    }
    renderRegistryItems();

    // Tab switcher
    if (festivalTabs) {
      festivalTabs.addEventListener('click', function (e) {
        var tab = e.target.closest('.cg-tab-btn');
        if (!tab) return;
        var allTabs = festivalTabs.querySelectorAll('.cg-tab-btn');
        for (var t = 0; t < allTabs.length; t++) allTabs[t].classList.remove('active');
        tab.classList.add('active');
        var cat = tab.getAttribute('data-festival') || 'diwali';
        renderCatalogCards(cat);
      });
    }

    // Populate Product Select Dropdown
    if (bulkItemProductSelect) {
      var allProducts = [];
      Object.keys(DEFAULT_FESTIVAL_CATALOGS).forEach(function (k) {
        allProducts = allProducts.concat(DEFAULT_FESTIVAL_CATALOGS[k]);
      });
      var selectHtml = '<option value="">Select a corporate product...</option>';
      for (var pIdx = 0; pIdx < allProducts.length; pIdx++) {
        var prod = allProducts[pIdx];
        selectHtml += '<option value="' + prod.id + '" data-price="' + prod.unitPrice + '">' +
          prod.name + ' (₹' + prod.unitPrice.toLocaleString('en-IN') + ')' +
        '</option>';
      }
      bulkItemProductSelect.innerHTML = selectHtml;

      bulkItemProductSelect.addEventListener('change', function () {
        var selectedOpt = bulkItemProductSelect.selectedOptions ? bulkItemProductSelect.selectedOptions[0] : null;
        if (selectedOpt && selectedOpt.dataset && selectedOpt.dataset.price && bulkItemUnitPriceInput) {
          bulkItemUnitPriceInput.value = selectedOpt.dataset.price;
        }
      });
    }

    // Active bulk items state in form
    var activeBulkItems = [
      { productId: 'CG-PROD-01', name: 'ElectroMart Executive SoundBar 120W', quantity: 25, unitPrice: 4999, gstRate: 0.18 }
    ];

    function renderBulkItemsRows() {
      if (!bulkItemsContainer) return;
      var rowsHtml = '';
      for (var idx = 0; idx < activeBulkItems.length; idx++) {
        var it = activeBulkItems[idx];
        rowsHtml += '<div class="cg-item-row" data-index="' + idx + '">' +
          '<span><strong>' + it.name + '</strong></span>' +
          '<span>Qty: ' + it.quantity + '</span>' +
          '<span>₹' + it.unitPrice.toLocaleString('en-IN') + '</span>' +
          '<button type="button" class="btn-remove-item" style="color:#DC2626;background:none;border:none;cursor:pointer;">✕</button>' +
        '</div>';
      }
      bulkItemsContainer.innerHTML = rowsHtml;

      var totals = calculateBulkOrderTotal(activeBulkItems);
      if (bulkInvoiceTotal) {
        bulkInvoiceTotal.textContent = '₹' + totals.total.toLocaleString('en-IN');
      }
    }

    renderBulkItemsRows();

    if (addBulkItemBtn && bulkItemProductSelect && bulkItemQuantityInput && bulkItemUnitPriceInput) {
      addBulkItemBtn.addEventListener('click', function () {
        var prodId = bulkItemProductSelect.value;
        var qty = Number(bulkItemQuantityInput.value) || 10;
        var price = Number(bulkItemUnitPriceInput.value) || 1000;
        var opt = bulkItemProductSelect.selectedOptions ? bulkItemProductSelect.selectedOptions[0] : null;
        var name = opt ? opt.text.split(' (₹')[0] : 'Corporate Item';

        if (prodId) {
          activeBulkItems.push({
            productId: prodId,
            name: name,
            quantity: qty,
            unitPrice: price,
            gstRate: 0.18
          });
          renderBulkItemsRows();
        }
      });
    }

    if (bulkItemsContainer) {
      bulkItemsContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-remove-item')) {
          var row = e.target.closest('.cg-item-row');
          if (row && row.dataset.index) {
            var removeIdx = parseInt(row.dataset.index, 10);
            activeBulkItems.splice(removeIdx, 1);
            renderBulkItemsRows();
          }
        }
      });
    }

    // Handle Bulk Order Form Submission
    if (bulkOrderForm) {
      bulkOrderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var poNumber = (doc.getElementById('poNumberInput') || {}).value || 'PO-2026-DEFAULT';
        var companyName = (doc.getElementById('companyNameInput') || {}).value || 'Enterprise Client';
        var gstin = (doc.getElementById('gstinInput') || {}).value || '27AAACA1234A1Z5';
        var billingAddress = (doc.getElementById('billingAddressInput') || {}).value || 'Corporate Towers, Mumbai';
        var shippingAddress = (doc.getElementById('shippingAddressInput') || {}).value || 'Central Warehouse, Pune';

        var invoice = generateBulkInvoice({
          poNumber: poNumber,
          companyName: companyName,
          gstin: gstin,
          billingAddress: billingAddress,
          shippingAddress: shippingAddress,
          items: activeBulkItems
        });

        if (bulkInvoicePreview) {
          var itemsTableHtml = '';
          for (var i = 0; i < invoice.items.length; i++) {
            var item = invoice.items[i];
            itemsTableHtml += '<tr>' +
              '<td>' + escapeHtml(item.name || item.productId) + '</td>' +
              '<td>' + item.quantity + '</td>' +
              '<td>₹' + item.unitPrice.toLocaleString('en-IN') + '</td>' +
              '<td>₹' + (item.unitPrice * item.quantity).toLocaleString('en-IN') + '</td>' +
            '</tr>';
          }

          bulkInvoicePreview.innerHTML = '<div class="cg-invoice-header">' +
            '<div>' +
              '<h3 style="color:var(--cg-accent);margin:0;">ElectroMart Commercial GST Invoice</h3>' +
              '<p style="margin:4px 0;color:var(--cg-text-secondary);">Invoice No: <strong>' + escapeHtml(invoice.invoiceNumber) + '</strong> | PO: ' + escapeHtml(invoice.poNumber) + '</p>' +
            '</div>' +
            '<div style="text-align:right;">' +
              '<p style="margin:0;"><strong>' + escapeHtml(invoice.companyName) + '</strong></p>' +
              '<p style="margin:4px 0;color:var(--cg-text-muted);">GSTIN: ' + escapeHtml(invoice.gstin) + '</p>' +
            '</div>' +
          '</div>' +
          '<table class="cg-invoice-table">' +
            '<thead><tr><th>Item Description</th><th>Quantity</th><th>Unit Price</th><th>Line Total</th></tr></thead>' +
            '<tbody>' + itemsTableHtml + '</tbody>' +
          '</table>' +
          '<div class="cg-invoice-summary">' +
            '<p style="margin:4px 0;">Subtotal: <strong>₹' + invoice.subtotal.toLocaleString('en-IN') + '</strong></p>' +
            '<p style="margin:4px 0;">Integrated GST (18%): <strong>₹' + invoice.gstAmount.toLocaleString('en-IN') + '</strong></p>' +
            '<p style="margin:6px 0;font-size:1.15rem;color:var(--cg-accent);">Net Payable: <span id="bulkInvoiceTotal">₹' + invoice.total.toLocaleString('en-IN') + '</span></p>' +
          '</div>';
        }

        renderDashboardTables();
      });
    }

    // Handle Gift Registry Form Submission
    if (giftRegistryForm) {
      giftRegistryForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var registryName = (doc.getElementById('registryNameInput') || {}).value || '';
        var occasion = (doc.getElementById('occasionSelect') || {}).value || 'general';
        var eventDate = (doc.getElementById('eventDateInput') || {}).value || '';
        var recipientName = (doc.getElementById('recipientNameInput') || {}).value || '';
        var recipientEmail = (doc.getElementById('recipientEmailInput') || {}).value || '';
        var session = getAuthSession();
        if (!session) {
          setRegistryStatus('Sign in to create and manage a corporate registry.', true);
          return;
        }

        var payload = createGiftRegistry({
          registryName: registryName,
          occasion: occasion,
          eventDate: eventDate,
          items: activeRegistryItems,
          recipients: recipientName || recipientEmail ? [{ name: recipientName, email: recipientEmail }] : []
        });
        try {
          var result = await requestCorporateApi('/registry', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          activeRegistry = result.registry;
          activeRegistryShareToken = result.shareToken;
          if (registryShareLink) {
            var shareUrl = new URL(root.location.href);
            shareUrl.searchParams.set('registry', activeRegistry.id);
            shareUrl.hash = new URLSearchParams({ share: activeRegistryShareToken }).toString();
            registryShareLink.textContent = '';
            var link = doc.createElement('a');
            link.href = shareUrl.toString();
            link.textContent = shareUrl.toString();
            registryShareLink.appendChild(link);
          }
          activeRegistryItems = activeRegistry.items.slice();
          renderRegistryItems();
          setRegistryStatus('Corporate registry created and synchronized.');
        } catch (error) {
          setRegistryStatus(error.message, true);
        }
      });
    }

    if (addRegistryItemBtn) {
      addRegistryItemBtn.addEventListener('click', async function () {
        var productId = registryItemProductSelect ? registryItemProductSelect.value : '';
        var quantity = Number(registryItemQuantityInput && registryItemQuantityInput.value);
        if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
          setRegistryStatus('Select a product and enter a quantity from 1 to 999.', true);
          return;
        }
        var selectedItem = { productId: productId, quantity: quantity };
        var existingItem = activeRegistryItems.find(function (item) { return item.productId === productId; });
        if (existingItem) existingItem.quantity += quantity;
        else activeRegistryItems.push(selectedItem);
        renderRegistryItems();

        if (activeRegistry) {
          try {
            var update = await requestCorporateApi('/registry/' + encodeURIComponent(activeRegistry.id) + '/items', {
              method: 'PATCH',
              headers: activeRegistryShareToken ? { 'x-corporate-share-token': activeRegistryShareToken } : {},
              body: JSON.stringify(selectedItem)
            });
            activeRegistry = update.registry;
            activeRegistryItems = activeRegistry.items.slice();
            renderRegistryItems();
            setRegistryStatus('Registry item synchronized.');
          } catch (error) {
            setRegistryStatus(error.message + ' The item remains selected; retry after access is restored.', true);
          }
        }
      });
    }

    if (shareRegistryBtn) {
      shareRegistryBtn.addEventListener('click', async function () {
        if (!activeRegistry || !activeRegistryShareToken) {
          setRegistryStatus('Create a registry or open a valid shared registry before sharing.', true);
          return;
        }
        var shareUrl = new URL(root.location.href);
        shareUrl.searchParams.set('registry', activeRegistry.id);
        shareUrl.hash = new URLSearchParams({ share: activeRegistryShareToken }).toString();
        if (registryShareLink) {
          registryShareLink.textContent = '';
          var link = doc.createElement('a');
          link.href = shareUrl.toString();
          link.textContent = shareUrl.toString();
          registryShareLink.appendChild(link);
        }
        try {
          if (root.navigator && root.navigator.clipboard) await root.navigator.clipboard.writeText(shareUrl.toString());
          setRegistryStatus('Registry share link is ready.');
        } catch (error) {
          setRegistryStatus('Registry link is shown below. Clipboard access was unavailable.', true);
        }
      });
    }

    if (root.location) {
      var registryId = new URLSearchParams(root.location.search || '').get('registry');
      shareTokenFromUrl = new URLSearchParams(String(root.location.hash || '').replace(/^#/, '')).get('share') || '';
      if (registryId) {
        requestCorporateApi('/registry/' + encodeURIComponent(registryId), {
          headers: shareTokenFromUrl ? { 'x-corporate-share-token': shareTokenFromUrl } : {}
        }).then(function (result) {
          activeRegistry = result.registry;
          activeRegistryShareToken = shareTokenFromUrl;
          activeRegistryItems = activeRegistry.items.slice();
          renderRegistryItems();
          setRegistryStatus('Shared corporate registry synchronized.');
        }).catch(function (error) {
          setRegistryStatus(error.message, true);
        });
      }
    }

    // Handle Team Member Form Submission
    if (addTeamMemberForm) {
      addTeamMemberForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = (doc.getElementById('teamMemberNameInput') || {}).value || 'Team Lead';
        var email = (doc.getElementById('teamMemberEmailInput') || {}).value || 'lead@enterprise.com';
        var role = (doc.getElementById('teamMemberRoleSelect') || {}).value || 'procurement_manager';
        var budget = Number((doc.getElementById('teamMemberBudgetInput') || {}).value) || 250000;

        addTeamMember({
          name: name,
          email: email,
          role: role,
          budgetLimit: budget
        });

        renderDashboardTables();
        addTeamMemberForm.reset();
      });
    }

    // Render Dashboard Orders & Team Members
    function renderDashboardTables() {
      var orders = getStoredItems(BULK_ORDERS_KEY);
      if (ordersHistoryTable) {
        var ordersTbody = '';
        if (orders.length === 0) {
          ordersTbody = '<tr><td colspan="5" style="text-align:center;color:var(--cg-text-muted);">No bulk orders placed yet.</td></tr>';
        } else {
          for (var o = 0; o < Math.min(orders.length, 6); o++) {
            var ord = orders[o];
            ordersTbody += '<tr>' +
              '<td><strong>' + ord.invoiceNumber + '</strong></td>' +
              '<td>' + ord.companyName + '</td>' +
              '<td>' + (ord.items ? ord.items.length : 0) + ' Items</td>' +
              '<td>₹' + Number(ord.total || 0).toLocaleString('en-IN') + '</td>' +
              '<td><span style="color:var(--cg-success);font-weight:600;">✓ Confirmed</span></td>' +
            '</tr>';
          }
        }
        ordersHistoryTable.innerHTML = '<thead><tr><th>Invoice #</th><th>Company</th><th>Units</th><th>Total (₹)</th><th>Status</th></tr></thead>' +
          '<tbody>' + ordersTbody + '</tbody>';
      }

      var members = getStoredItems(TEAM_MEMBERS_KEY);
      if (teamManagementTable) {
        var teamTbody = '';
        if (members.length === 0) {
          // Pre-seed sample member for dashboard view
          members = [
            { memberId: 'EM-CG-TM-DEMO01', name: 'Siddharth Rao', email: 'siddharth@enterprise.com', role: 'procurement_manager', budgetLimit: 750000 },
            { memberId: 'EM-CG-TM-DEMO02', name: 'Ananya Deshmukh', email: 'ananya@enterprise.com', role: 'finance_approver', budgetLimit: 1200000 }
          ];
        }
        for (var m = 0; m < members.length; m++) {
          var mem = members[m];
          teamTbody += '<tr>' +
            '<td><strong>' + mem.name + '</strong></td>' +
            '<td>' + mem.email + '</td>' +
            '<td><code>' + mem.role + '</code></td>' +
            '<td>₹' + Number(mem.budgetLimit || 0).toLocaleString('en-IN') + '</td>' +
            '<td><span style="color:var(--cg-success);">Active</span></td>' +
          '</tr>';
        }
        teamManagementTable.innerHTML = '<thead><tr><th>Member Name</th><th>Email</th><th>Role</th><th>Budget Limit</th><th>Status</th></tr></thead>' +
          '<tbody>' + teamTbody + '</tbody>';
      }

      // Visual analytics chart
      if (spendingAnalyticsChart) {
        spendingAnalyticsChart.innerHTML = '<h4 style="margin:0 0 1rem 0;color:var(--cg-accent);">Procurement Spend Breakdown (Q3 - Q4 2026)</h4>' +
          '<div class="cg-chart-bars">' +
            '<div class="cg-bar-col"><div class="cg-bar" style="height:65%;"></div><span class="cg-bar-label">Diwali Kits (₹1.8M)</span></div>' +
            '<div class="cg-bar-col"><div class="cg-bar" style="height:45%;"></div><span class="cg-bar-label">Onboarding (₹1.2M)</span></div>' +
            '<div class="cg-bar-col"><div class="cg-bar" style="height:85%;"></div><span class="cg-bar-label">Executive (₹2.4M)</span></div>' +
            '<div class="cg-bar-col"><div class="cg-bar" style="height:35%;"></div><span class="cg-bar-label">Rewards (₹950K)</span></div>' +
          '</div>';
      }
    }

    renderDashboardTables();
  }

  // Self-initialize if in browser environment
  if (typeof document !== 'undefined' && document.addEventListener) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeHubUI);
    } else {
      initializeHubUI();
    }
  }

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : null);
