/**
 * ElectroMart - Delivery Tracking Visualizer (tracking.js)
 * Phase 23: Dynamic 4-Stage Milestone Stepper, Real-time Activity Timeline,
 * Delivery Instructions Modal Sync & Regional Language Localization.
 * 100% Pure ElectroMart Brand Safety.
 */

(function () {
  'use strict';

  const OFFLINE_ORDERS_KEY = 'electromart_offline_orders_v1';
  const DELIVERY_INSTRUCTIONS_KEY = 'electromart_delivery_instructions_v1';
  const AUTH_STORAGE_KEY = 'electromart_auth_v1';

  const API_BASE_URL = (() => {
    const { protocol, hostname, port } = window.location;
    if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000/api';
    }
    const origin = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    return `${origin}/api`;
  })();

  const inrFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });

  function money(val) {
    return inrFormatter.format(Number(val) || 0);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return String(isoDate || 'N/A');
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatDateTime(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return String(isoDate || 'N/A');
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function getI18nText(key, fallback) {
    if (window.EM_I18N && typeof window.EM_I18N.t === 'function') {
      const translated = window.EM_I18N.t(key);
      if (translated && translated !== key) return translated;
    }
    const lang = localStorage.getItem('electromart_lang_v1') || 'en';
    if (window.TRANSLATIONS && window.TRANSLATIONS[lang] && window.TRANSLATIONS[lang][key]) {
      return window.TRANSLATIONS[lang][key];
    }
    if (window.TRANSLATIONS && window.TRANSLATIONS.en && window.TRANSLATIONS.en[key]) {
      return window.TRANSLATIONS.en[key];
    }
    return fallback || key;
  }

  // --- STATE ---
  let currentOrder = null;
  let currentOrderId = null;

  // --- STORAGE HELPERS ---
  function loadOfflineOrders() {
    try {
      const raw = localStorage.getItem(OFFLINE_ORDERS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveOfflineOrders(orders) {
    try {
      localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save offline orders:', e);
    }
  }

  function loadDeliveryInstructions() {
    try {
      const raw = localStorage.getItem(DELIVERY_INSTRUCTIONS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveDeliveryInstructions(instructions) {
    try {
      localStorage.setItem(DELIVERY_INSTRUCTIONS_KEY, JSON.stringify(instructions));
    } catch (e) {
      console.error('Failed to save delivery instructions:', e);
    }
  }

  function readSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // --- TOAST NOTIFICATIONS ---
  function showTrackingToast(message, type = 'success') {
    const container = document.getElementById('trackingToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `amz-tracking-toast ${type}`;
    toast.innerHTML = `
      <span class="amz-toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span class="amz-toast-msg">${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- ORDER RETRIEVAL ---
  function getOrderIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId') || params.get('id');
  }

  async function resolveOrder() {
    const orderId = getOrderIdFromUrl();
    const offlineList = loadOfflineOrders();

    if (orderId) {
      // 1. Check offline orders
      const matched = offlineList.find((o) => String(o.id) === String(orderId));
      if (matched) return matched;

      // 2. Try fetching from remote API if authenticated
      const session = readSession();
      if (session && session.token) {
        try {
          const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
            headers: { Authorization: `Bearer ${session.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.id) return data;
          }
        } catch (err) {
          // ignore network error
        }
      }
    }

    // 3. Fallback: load most recent offline order
    if (offlineList.length > 0) {
      const sorted = [...offlineList].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return sorted[0];
    }

    return null;
  }

  // --- RECIPIENT & ADDRESS FORMATTING ---
  function formatShippingAddress(order) {
    if (!order) return 'Flat 402, Royal Palms, Connaught Place, New Delhi 110001';
    if (typeof order.shippingAddress === 'string') return order.shippingAddress;
    if (order.shippingAddress && typeof order.shippingAddress === 'object') {
      const addr = order.shippingAddress;
      const parts = [
        addr.fullName ? `<strong>${escapeHtml(addr.fullName)}</strong>` : '',
        addr.addressLine || addr.address || '',
        addr.city || '',
        addr.state || '',
        addr.pincode || addr.pinCode || ''
      ].filter(Boolean);
      const phone = addr.phone || order.phone || '+91 98765 43210';
      return `${parts.join(', ')}<br><small style="color: #565959;">${getI18nText('phone_label', 'Phone')}: ${escapeHtml(phone)}</small>`;
    }
    return 'Flat 402, Royal Palms, Connaught Place, New Delhi 110001';
  }

  // --- MILESTONE STATUS CALCULATION ---
  function computeMilestoneState(status) {
    const s = String(status || 'ordered').trim().toLowerCase();
    switch (s) {
      case 'delivered':
        return {
          stepIndex: 3, // 0: Ordered, 1: Shipped, 2: Out for delivery, 3: Delivered
          progressPercent: 100,
          isDelivered: true,
          isCancelled: false,
          headline: getI18nText('delivered_today', 'Delivered Today'),
          subhead: getI18nText('handed_to_resident', 'Package was handed directly to resident.')
        };
      case 'out_for_delivery':
      case 'outfordelivery':
        return {
          stepIndex: 2,
          progressPercent: 66,
          isDelivered: false,
          isCancelled: false,
          headline: getI18nText('out_for_delivery_today', 'Out for delivery today'),
          subhead: getI18nText('arriving_by_9pm', 'Arriving by 9 PM')
        };
      case 'shipped':
        return {
          stepIndex: 1,
          progressPercent: 33,
          isDelivered: false,
          isCancelled: false,
          headline: getI18nText('arriving_tomorrow', 'Arriving Tomorrow by 9 PM'),
          subhead: getI18nText('package_on_the_way', 'Package on the way with ElectroMart Logistics')
        };
      case 'cancelled':
        return {
          stepIndex: -1,
          progressPercent: 0,
          isDelivered: false,
          isCancelled: true,
          headline: getI18nText('order_cancelled_title', 'Order Cancelled'),
          subhead: getI18nText('order_cancelled_desc', 'This shipment was cancelled and will not be delivered.')
        };
      case 'processing':
      case 'ordered':
      default:
        return {
          stepIndex: 0,
          progressPercent: 8,
          isDelivered: false,
          isCancelled: false,
          headline: getI18nText('order_placed_status', 'Order Placed & Confirmed'),
          subhead: getI18nText('preparing_dispatch', 'Preparing for dispatch from national fulfillment center')
        };
    }
  }

  // --- ACTIVITY TIMELINE GENERATOR ---
  function generateActivityTimeline(order, milestone) {
    const orderDate = new Date(order.createdAt || Date.now() - 86400000 * 2);
    const validOrderDate = Number.isNaN(orderDate.getTime()) ? new Date(Date.now() - 86400000 * 2) : orderDate;
    const orderTimestamp = validOrderDate.getTime();

    const tOrdered = new Date(orderTimestamp);
    const tProcessed = new Date(orderTimestamp + 3600000 * 4);
    const tShipped = new Date(orderTimestamp + 3600000 * 18);
    const tSortArrived = new Date(orderTimestamp + 3600000 * 28);
    const tSortDeparted = new Date(orderTimestamp + 3600000 * 36);
    const tLocalArrived = new Date(orderTimestamp + 3600000 * 42);
    const tOutForDelivery = new Date(orderTimestamp + 3600000 * 46);
    const tDelivered = new Date(orderTimestamp + 3600000 * 50);

    const activities = [];

    if (milestone.isCancelled) {
      activities.push({
        status: getI18nText('timeline_cancelled', 'Shipment cancelled by customer'),
        location: 'Customer Service Hub',
        time: formatDateTime(new Date()),
        isLatest: true
      });
      activities.push({
        status: getI18nText('timeline_placed', 'Order placed and payment confirmed'),
        location: 'Online Store',
        time: formatDateTime(tOrdered),
        isLatest: false
      });
      return activities;
    }

    if (milestone.stepIndex >= 3) {
      activities.push({
        status: getI18nText('timeline_delivered', 'Package delivered directly to resident'),
        location: 'Delivery Address',
        time: formatDateTime(tDelivered),
        isLatest: true
      });
    }

    if (milestone.stepIndex >= 2) {
      activities.push({
        status: getI18nText('timeline_out_for_delivery', 'Out for delivery with courier partner'),
        location: 'Local Delivery Facility, Jaipur Hub',
        time: formatDateTime(tOutForDelivery),
        isLatest: milestone.stepIndex === 2
      });
      activities.push({
        status: getI18nText('timeline_local_arrived', 'Package arrived at local delivery facility'),
        location: 'Jaipur Delivery Station',
        time: formatDateTime(tLocalArrived),
        isLatest: false
      });
    }

    if (milestone.stepIndex >= 1) {
      activities.push({
        status: getI18nText('timeline_sort_departed', 'Package departed sort facility'),
        location: 'Northern Regional Hub, Gurugram',
        time: formatDateTime(tSortDeparted),
        isLatest: false
      });
      activities.push({
        status: getI18nText('timeline_sort_arrived', 'Package arrived at sort facility'),
        location: 'Northern Regional Hub, Gurugram',
        time: formatDateTime(tSortArrived),
        isLatest: false
      });
      activities.push({
        status: getI18nText('timeline_shipped', 'Package has shipped from fulfillment center'),
        location: 'Fulfillment Center FC-DEL-02',
        time: formatDateTime(tShipped),
        isLatest: milestone.stepIndex === 1
      });
    }

    activities.push({
      status: getI18nText('timeline_processing', 'Package packed and ready for carrier pickup'),
      location: 'Warehouse Dispatch Dock',
      time: formatDateTime(tProcessed),
      isLatest: false
    });

    activities.push({
      status: getI18nText('timeline_placed', 'Order placed and payment confirmed'),
      location: 'ElectroMart Store',
      time: formatDateTime(tOrdered),
      isLatest: milestone.stepIndex === 0
    });

    return activities;
  }

  // --- RENDER VISUAL TRACKER ---
  function renderTracker(order) {
    currentOrder = order;
    currentOrderId = order ? order.id : null;

    const emptyState = document.getElementById('trackingEmptyState');
    const container = document.getElementById('trackingContainer');
    const breadcrumbOrderId = document.getElementById('breadcrumbOrderId');
    const invoiceBtn = document.getElementById('trackingInvoiceBtn');

    if (!order) {
      if (emptyState) emptyState.style.display = 'block';
      if (container) container.style.display = 'none';
      if (breadcrumbOrderId) breadcrumbOrderId.textContent = getI18nText('order_not_found', 'Order Not Found');
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (container) container.style.display = 'grid';

    // 1. Breadcrumbs & Invoice Link
    const displayId = order.idLabel || (order.id ? `EM-${String(order.id).slice(0, 8).toUpperCase()}` : 'EM-ORDER');
    if (breadcrumbOrderId) {
      breadcrumbOrderId.textContent = `Order #${displayId}`;
    }
    if (invoiceBtn) {
      invoiceBtn.href = `invoice.html?orderId=${encodeURIComponent(order.id)}`;
    }

    // 2. Carrier & AWB Tracking Number
    const carrierNameEl = document.getElementById('trackingCarrierName');
    const awbNumberEl = document.getElementById('trackingAwbNumber');
    const carrierName = order.tracking?.carrier || 'ElectroMart Logistics';
    const awbNumber = order.tracking?.trackingId || order.awb || `EM-DEL-${String(order.id).replace(/[^0-9A-Z]/gi, '').slice(0, 8) || '89472914'}`;

    if (carrierNameEl) carrierNameEl.textContent = carrierName;
    if (awbNumberEl) awbNumberEl.textContent = awbNumber;

    // 3. Milestone State & Stepper
    const milestone = computeMilestoneState(order.status);
    const etaHeadlineEl = document.getElementById('trackingEtaHeadline');
    const subheadEl = document.getElementById('trackingSubhead');
    const progressFillEl = document.getElementById('trackingProgressFill');

    if (etaHeadlineEl) {
      etaHeadlineEl.textContent = milestone.headline;
      if (milestone.isDelivered) {
        etaHeadlineEl.style.color = '#007600';
      } else if (milestone.isCancelled) {
        etaHeadlineEl.style.color = '#b12704';
      } else {
        etaHeadlineEl.style.color = '#007600';
      }
    }

    if (subheadEl) {
      subheadEl.textContent = milestone.subhead;
    }

    if (progressFillEl) {
      progressFillEl.style.width = `${milestone.progressPercent}%`;
      if (milestone.isCancelled) {
        progressFillEl.style.background = '#b12704';
      } else {
        progressFillEl.style.background = '#007600';
      }
    }

    // Stepper Nodes
    const stepOrdered = document.getElementById('stepOrdered');
    const stepShipped = document.getElementById('stepShipped');
    const stepOutForDelivery = document.getElementById('stepOutForDelivery');
    const stepDelivered = document.getElementById('stepDelivered');
    const steps = [stepOrdered, stepShipped, stepOutForDelivery, stepDelivered];

    const orderDateFormatted = formatDate(order.createdAt || Date.now());
    const dateOrderedEl = document.getElementById('dateOrdered');
    const dateShippedEl = document.getElementById('dateShipped');
    const dateOutForDeliveryEl = document.getElementById('dateOutForDelivery');
    const dateDeliveredEl = document.getElementById('dateDelivered');

    if (dateOrderedEl) dateOrderedEl.textContent = orderDateFormatted;
    if (dateShippedEl) dateShippedEl.textContent = milestone.stepIndex >= 1 ? orderDateFormatted : '-';
    if (dateOutForDeliveryEl) dateOutForDeliveryEl.textContent = milestone.stepIndex >= 2 ? getI18nText('today_label', 'Today') : '-';
    if (dateDeliveredEl) dateDeliveredEl.textContent = milestone.stepIndex >= 3 ? getI18nText('today_label', 'Today') : (milestone.isCancelled ? getI18nText('cancelled_label', 'Cancelled') : getI18nText('expected_tomorrow', 'Tomorrow'));

    steps.forEach((stepEl, idx) => {
      if (!stepEl) return;
      stepEl.classList.remove('completed', 'active', 'cancelled');
      const dot = stepEl.querySelector('.amz-stepper-dot');

      if (milestone.isCancelled) {
        stepEl.classList.add('cancelled');
        if (dot) dot.textContent = '';
      } else if (idx < milestone.stepIndex) {
        stepEl.classList.add('completed');
        if (dot) dot.textContent = '✓';
      } else if (idx === milestone.stepIndex) {
        stepEl.classList.add('completed', 'active');
        if (dot) dot.textContent = milestone.isDelivered ? '✓' : '';
      } else {
        if (dot) dot.textContent = '';
      }
    });

    // 4. Items in this shipment
    const itemsContainer = document.getElementById('trackingItemsContainer');
    if (itemsContainer) {
      const items = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : [{
            id: order.productId || 'item-1',
            name: order.product || getI18nText('order_item', 'ElectroMart Item'),
            image: order.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80',
            price: order.total || 0,
            quantity: 1
          }];

      itemsContainer.innerHTML = items.map((item) => {
        const pId = item.id || item.productId || '';
        const pTitle = item.name || item.title || 'Product';
        const pImg = item.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80';
        const pPrice = Number(item.price || 0);
        const pQty = Number(item.quantity || item.qty || 1);

        return `
          <div class="amz-tracking-item-row">
            <a href="product-detail.html?id=${encodeURIComponent(pId)}" aria-label="${escapeHtml(pTitle)}">
              <img class="amz-tracking-item-thumb" src="${escapeHtml(pImg)}" alt="${escapeHtml(pTitle)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80';" />
            </a>
            <div class="amz-tracking-item-info">
              <a class="amz-tracking-item-title" href="product-detail.html?id=${encodeURIComponent(pId)}">${escapeHtml(pTitle)}</a>
              <div class="amz-tracking-item-meta">
                <span>${getI18nText('qty_label', 'Qty')}: ${pQty}</span>
                <span>|</span>
                <span>${money(pPrice)}</span>
              </div>
              <p class="amz-tracking-seller-line">${getI18nText('sold_by_electromart', 'Sold by: ElectroMart Retail Pvt Ltd')}</p>
            </div>
            <div>
              <button type="button" class="amz-buy-again-inline-btn" data-product-id="${escapeHtml(pId)}" data-product-title="${escapeHtml(pTitle)}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                <span data-i18n="buy_it_again">${getI18nText('buy_it_again', 'Buy it again')}</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // 5. Expandable Activity Timeline
    const timelineListEl = document.getElementById('trackingTimelineList');
    if (timelineListEl) {
      const activities = generateActivityTimeline(order, milestone);
      timelineListEl.innerHTML = activities.map((act) => `
        <li class="amz-timeline-item ${act.isLatest ? 'latest' : ''}">
          <div class="amz-timeline-dot"></div>
          <div class="amz-timeline-content">
            <span class="amz-timeline-time">${escapeHtml(act.time)}</span>
            <strong class="amz-timeline-status">${escapeHtml(act.status)}</strong>
            <span class="amz-timeline-location">${escapeHtml(act.location)}</span>
          </div>
        </li>
      `).join('');
    }

    // 6. Shipping Address Box
    const addressBoxEl = document.getElementById('trackingAddressBox');
    if (addressBoxEl) {
      addressBoxEl.innerHTML = formatShippingAddress(order);
    }

    // 7. Delivery Instructions Preview Box
    renderDeliveryInstructionsPreview(order.id);

    // 8. Cancel items button state
    const cancelBtn = document.getElementById('trackingCancelBtn');
    if (cancelBtn) {
      if (milestone.isDelivered || milestone.isCancelled) {
        cancelBtn.disabled = true;
        cancelBtn.style.opacity = '0.5';
        cancelBtn.style.cursor = 'not-allowed';
      } else {
        cancelBtn.disabled = false;
        cancelBtn.style.opacity = '1';
        cancelBtn.style.cursor = 'pointer';
      }
    }

    // 9. Return Center sync & banner
    const returnBannerEl = document.getElementById('trackingReturnBanner');
    const returnBannerLink = document.getElementById('trackingReturnBannerLink');
    const returnBtn = document.getElementById('trackingReturnBtn');
    const isReturnInitiated = Boolean(
      order.returnInitiated ||
      String(order.status || '').toLowerCase() === 'return_initiated' ||
      String(order.status || '').toLowerCase() === 'pickup_scheduled' ||
      (Array.isArray(order.afterSalesCases) && order.afterSalesCases.some(c => (c.type === 'return' || c.type === 'exchange') && !c.final))
    );

    if (returnBtn) {
      returnBtn.href = `returns.html?orderId=${encodeURIComponent(order.id)}`;
      returnBtn.textContent = isReturnInitiated ? getI18nText('view_return_slip', 'View Return Slip') : getI18nText('return_or_replace', 'Return or replace items');
    }

    if (returnBannerEl) {
      if (isReturnInitiated) {
        returnBannerEl.style.display = 'flex';
        if (returnBannerLink) {
          returnBannerLink.href = `returns.html?orderId=${encodeURIComponent(order.id)}`;
        }
      } else {
        returnBannerEl.style.display = 'none';
      }
    }

    // Refresh translations
    window.EM_I18N?.updateAllTranslations?.() || window.applyTranslations?.();
  }

  // --- DELIVERY INSTRUCTIONS HANDLING ---
  function renderDeliveryInstructionsPreview(orderId) {
    const previewEl = document.getElementById('instructionsPreviewText');
    if (!previewEl) return;

    const allInstructions = loadDeliveryInstructions();
    const inst = allInstructions[orderId];

    if (!inst || (!inst.prefs?.length && !inst.note)) {
      previewEl.textContent = getI18nText('no_instructions_set', 'No special instructions added');
      previewEl.style.color = '#565959';
      return;
    }

    const labelsMap = {
      leave_with_neighbor: getI18nText('pref_leave_neighbor', 'Leave with neighbor'),
      leave_at_security: getI18nText('pref_leave_security', 'Leave at security gate'),
      call_before_arrival: getI18nText('pref_call_before', 'Call before arriving'),
      do_not_ring_bell: getI18nText('pref_do_not_ring', 'Do not ring doorbell')
    };

    const readablePrefs = (inst.prefs || []).map((p) => labelsMap[p] || p);
    let output = readablePrefs.join(', ');
    if (inst.note) {
      output = output ? `${output}. Note: "${escapeHtml(inst.note)}"` : `Note: "${escapeHtml(inst.note)}"`;
    }

    previewEl.innerHTML = output;
    previewEl.style.color = '#111111';
  }

  function setupInstructionsModal() {
    const modal = document.getElementById('deliveryInstructionsModal');
    const openBtn = document.getElementById('openInstructionsModalBtn');
    const closeBtn = document.getElementById('closeInstructionsModalBtn');
    const cancelBtn = document.getElementById('cancelInstructionsModalBtn');
    const form = document.getElementById('deliveryInstructionsForm');
    const noteArea = document.getElementById('instructionsCustomNote');

    if (!modal || !openBtn || !form) return;

    function openModal() {
      if (!currentOrderId) return;
      const allInstructions = loadDeliveryInstructions();
      const inst = allInstructions[currentOrderId] || {};
      const savedPrefs = inst.prefs || [];

      form.querySelectorAll('input[name="pref"]').forEach((chk) => {
        chk.checked = savedPrefs.includes(chk.value);
      });
      if (noteArea) {
        noteArea.value = inst.note || '';
      }

      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentOrderId) return;

      const checkedPrefs = Array.from(form.querySelectorAll('input[name="pref"]:checked')).map((c) => c.value);
      const note = noteArea ? noteArea.value.trim() : '';

      const allInstructions = loadDeliveryInstructions();
      allInstructions[currentOrderId] = {
        prefs: checkedPrefs,
        note: note,
        updatedAt: new Date().toISOString()
      };
      saveDeliveryInstructions(allInstructions);

      // Sync into offline orders array
      const orders = loadOfflineOrders();
      const targetOrder = orders.find((o) => String(o.id) === String(currentOrderId));
      if (targetOrder) {
        targetOrder.deliveryInstructions = allInstructions[currentOrderId];
        saveOfflineOrders(orders);
      }

      renderDeliveryInstructionsPreview(currentOrderId);
      closeModal();
      showTrackingToast(getI18nText('instructions_saved_toast', 'Delivery instructions updated successfully.'));
    });
  }

  // --- CANCEL ORDER MODAL ---
  function setupCancelOrderModal() {
    const modal = document.getElementById('cancelOrderModal');
    const triggerBtn = document.getElementById('trackingCancelBtn');
    const closeBtn = document.getElementById('closeCancelModalBtn');
    const dismissBtn = document.getElementById('dismissCancelModalBtn');
    const confirmBtn = document.getElementById('confirmCancelOrderBtn');

    if (!modal || !triggerBtn || !confirmBtn) return;

    function openModal() {
      if (!currentOrder) return;
      if (currentOrder.status === 'delivered') {
        showTrackingToast(getI18nText('cannot_cancel_delivered', 'This order has already been delivered.'), 'info');
        return;
      }
      if (currentOrder.status === 'cancelled') {
        showTrackingToast(getI18nText('already_cancelled', 'This order is already cancelled.'), 'info');
        return;
      }
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }

    triggerBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    confirmBtn.addEventListener('click', async () => {
      if (!currentOrder) return;

      confirmBtn.disabled = true;
      confirmBtn.textContent = getI18nText('cancelling_btn', 'Cancelling...');

      try {
        // 1. Update local order status
        const orders = loadOfflineOrders();
        const matched = orders.find((o) => String(o.id) === String(currentOrderId));
        if (matched) {
          matched.status = 'cancelled';
          saveOfflineOrders(orders);
        }
        currentOrder.status = 'cancelled';

        // 2. Attempt remote cancel if logged in
        const session = readSession();
        if (session && session.token) {
          try {
            await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(currentOrderId)}/cancel`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${session.token}` }
            });
          } catch (err) {
            // ignore network error
          }
        }

        closeModal();
        renderTracker(currentOrder);
        showTrackingToast(getI18nText('cancellation_confirmed_toast', 'Shipment cancellation confirmed.'));
      } catch (e) {
        showTrackingToast(getI18nText('cancellation_failed', 'Failed to cancel shipment.'), 'error');
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = getI18nText('confirm_cancel', 'Yes, Cancel Shipment');
      }
    });
  }

  // --- INTERACTIVE FEATURES (COPY AWB, EXPAND TIMELINE, BUY AGAIN) ---
  function setupInteractiveFeatures() {
    // 1. Copy AWB Button
    const copyBtn = document.getElementById('copyAwbBtn');
    const awbEl = document.getElementById('trackingAwbNumber');
    if (copyBtn && awbEl) {
      copyBtn.addEventListener('click', async () => {
        const awbText = awbEl.textContent.trim();
        if (!awbText) return;

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(awbText);
          } else {
            const textarea = document.createElement('textarea');
            textarea.value = awbText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
          }
          const prevText = copyBtn.textContent;
          copyBtn.textContent = getI18nText('copied_label', 'Copied!');
          copyBtn.style.background = '#007600';
          copyBtn.style.color = '#ffffff';
          copyBtn.style.borderColor = '#006000';
          showTrackingToast(getI18nText('awb_copied_toast', 'Tracking ID copied to clipboard!'));
          setTimeout(() => {
            copyBtn.textContent = prevText;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
            copyBtn.style.borderColor = '';
          }, 2000);
        } catch (e) {
          showTrackingToast('Tracking ID: ' + awbText, 'info');
        }
      });
    }

    // 2. Expand/Collapse Activity Timeline
    const toggleActivityBtn = document.getElementById('toggleActivityBtn');
    const activityContent = document.getElementById('activityTimelineContent');
    if (toggleActivityBtn && activityContent) {
      toggleActivityBtn.addEventListener('click', () => {
        const isHidden = activityContent.style.display === 'none';
        if (isHidden) {
          activityContent.style.display = 'block';
          toggleActivityBtn.setAttribute('aria-expanded', 'true');
          toggleActivityBtn.textContent = getI18nText('hide_updates', 'Hide updates ▴');
        } else {
          activityContent.style.display = 'none';
          toggleActivityBtn.setAttribute('aria-expanded', 'false');
          toggleActivityBtn.textContent = getI18nText('see_all_updates', 'See all updates ▾');
        }
      });
    }

    // 3. Buy Again Inline Buttons
    const itemsContainer = document.getElementById('trackingItemsContainer');
    if (itemsContainer) {
      itemsContainer.addEventListener('click', (event) => {
        const buyAgainBtn = event.target.closest('.amz-buy-again-inline-btn');
        if (!buyAgainBtn) return;

        const productId = buyAgainBtn.getAttribute('data-product-id');
        if (productId) {
          try {
            const rawCart = localStorage.getItem('electromart_cart_v1');
            const cart = rawCart ? JSON.parse(rawCart) : {};
            cart[productId] = (Number(cart[productId]) || 0) + 1;
            localStorage.setItem('electromart_cart_v1', JSON.stringify(cart));

            const total = Object.values(cart).reduce((sum, qty) => sum + Number(qty || 0), 0);
            const cartCountEl = document.getElementById('cartCount');
            if (cartCountEl) cartCountEl.textContent = String(total);

            buyAgainBtn.style.background = '#007600';
            buyAgainBtn.style.color = '#ffffff';
            buyAgainBtn.style.borderColor = '#006000';
            buyAgainBtn.innerHTML = `✓ ${getI18nText('added_to_cart', 'Added to Cart')}`;
            showTrackingToast(getI18nText('item_added_to_cart_toast', 'Item added to your Cart!'));

            setTimeout(() => {
              buyAgainBtn.style.background = '';
              buyAgainBtn.style.color = '';
              buyAgainBtn.style.borderColor = '';
              buyAgainBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                <span>${getI18nText('buy_it_again', 'Buy it again')}</span>
              `;
            }, 2000);
          } catch (err) {
            console.error(err);
          }
        }
      });
    }

    // 4. Listen for language changes across the app
    window.addEventListener('languageChanged', () => {
      if (currentOrder) {
        renderTracker(currentOrder);
      }
    });
  }

  // --- INITIALIZATION ---
  async function init() {
    setupInstructionsModal();
    setupCancelOrderModal();
    setupInteractiveFeatures();

    const order = await resolveOrder();
    renderTracker(order);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for testing if running in node/browser
  if (typeof window !== 'undefined') {
    window.ElectroMartTracking = {
      computeMilestoneState,
      generateActivityTimeline,
      renderTracker,
      resolveOrder
    };
  }
})();
