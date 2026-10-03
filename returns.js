/**
 * ElectroMart - Returns & Replacements Center (returns.js)
 * Phase 25: 4-Stage Return Wizard, State Validation, Replacement vs Refund Logic,
 * Cross-page Sync (orders.html & tracking.html), Digital Return Slip with SVG Barcode.
 * 100% Brand Safe: Pure ElectroMart Branding Only.
 */

(function () {
  'use strict';

  const RETURNS_STORAGE_KEY = 'electromart_returns_v1';
  const OFFLINE_ORDERS_KEY = 'electromart_offline_orders_v1';
  const WALLET_BALANCE_KEY = 'electromart_pay_balance_v1';
  const WALLET_TRANSACTIONS_KEY = 'electromart_pay_transactions_v1';
  const AUTH_STORAGE_KEY = 'electromart_auth_v1';

  const API_BASE_URL = (() => {
    if (typeof window === 'undefined') return 'http://localhost:4000/api';
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

  function getI18nText(key, fallback) {
    if (typeof window !== 'undefined') {
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
    }
    return fallback || key;
  }

  // --- STORAGE HELPERS ---
  function loadReturns() {
    try {
      const raw = localStorage.getItem(RETURNS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveReturns(list) {
    try {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save returns:', e);
    }
  }

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

  function loadWalletBalance() {
    try {
      const raw = localStorage.getItem(WALLET_BALANCE_KEY);
      return raw ? Number(raw) || 0 : 2500;
    } catch (e) {
      return 2500;
    }
  }

  function saveWalletBalance(amount) {
    try {
      localStorage.setItem(WALLET_BALANCE_KEY, String(amount));
    } catch (e) {
      console.error('Failed to save wallet balance:', e);
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

  // --- STATE ---
  let currentOrder = null;
  let currentItem = null;
  let currentStep = 1;
  let selectedReason = null;
  let selectedResolution = 'replacement';
  let selectedDate = null;
  let selectedSlot = 'morning';
  let pickupAddress = {
    fullName: 'Customer',
    addressLine: 'Flat 402, Royal Palms, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    phone: '+91 98765 43210'
  };
  let uploadedPhotos = [];

  // --- TOAST NOTIFICATION ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('returnsToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `returns-toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- RESOLVE ORDER ---
  function getOrderIdFromUrl() {
    if (typeof window === 'undefined') return null;
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

      // 2. Fetch from backend API if authenticated
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
        } catch (e) {
          // ignore network failure
        }
      }
    }

    // 3. Fallback: Find most recent delivered order
    if (offlineList.length > 0) {
      const deliveredOrders = offlineList.filter((o) => String(o.status || '').toLowerCase() === 'delivered');
      if (deliveredOrders.length > 0) {
        return deliveredOrders[0];
      }
      return offlineList[0];
    }

    return null;
  }

  // --- SVG BARCODE GENERATOR ---
  function renderSvgBarcode(svgEl, text) {
    if (!svgEl) return;
    const cleanText = String(text || 'EM-RET-000000').toUpperCase();
    const bars = [];
    const width = 280;
    const height = 50;
    let x = 10;

    // Standard start pattern
    bars.push({ x: x, w: 2 }); x += 4;
    bars.push({ x: x, w: 1 }); x += 3;

    for (let i = 0; i < cleanText.length; i++) {
      const charCode = cleanText.charCodeAt(i);
      const w1 = (charCode % 3) + 1;
      const w2 = ((charCode >> 1) % 3) + 1;
      const w3 = ((charCode >> 2) % 3) + 1;

      bars.push({ x: x, w: w1 }); x += w1 + 2;
      bars.push({ x: x, w: w2 }); x += w2 + 2;
      bars.push({ x: x, w: w3 }); x += w3 + 3;

      if (x > width - 20) break;
    }

    // Standard stop pattern
    bars.push({ x: x, w: 2 }); x += 4;
    bars.push({ x: x, w: 1 });

    const rects = bars.map(b => `<rect x="${b.x}" y="0" width="${b.w}" height="${height}" fill="#111111" />`).join('');
    svgEl.innerHTML = rects;
  }

  // --- WIZARD STEP NAVIGATION ---
  function goToStep(stepNumber) {
    currentStep = stepNumber;

    const step1El = document.getElementById('returnsStep1');
    const step2El = document.getElementById('returnsStep2');
    const step3El = document.getElementById('returnsStep3');
    const step4El = document.getElementById('returnsStep4');
    const steps = [step1El, step2El, step3El, step4El];

    steps.forEach((el, idx) => {
      if (el) {
        el.style.display = (idx + 1 === stepNumber) ? 'block' : 'none';
      }
    });

    // Update Stepper Visuals
    const progressEl = document.getElementById('returnsStepperProgress');
    const node1 = document.getElementById('stepNode1');
    const node2 = document.getElementById('stepNode2');
    const node3 = document.getElementById('stepNode3');
    const node4 = document.getElementById('stepNode4');
    const nodes = [node1, node2, node3, node4];

    const bubble1 = document.getElementById('stepBubble1');
    const bubble2 = document.getElementById('stepBubble2');
    const bubble3 = document.getElementById('stepBubble3');
    const bubble4 = document.getElementById('stepBubble4');
    const bubbles = [bubble1, bubble2, bubble3, bubble4];

    const progressPercents = [0, 33, 66, 100];
    if (progressEl) {
      progressEl.style.width = `${progressPercents[stepNumber - 1]}%`;
    }

    nodes.forEach((node, idx) => {
      if (!node) return;
      node.classList.remove('active', 'completed');
      const stepIdx = idx + 1;
      if (stepIdx < stepNumber) {
        node.classList.add('completed');
        if (bubbles[idx]) bubbles[idx].textContent = '✓';
      } else if (stepIdx === stepNumber) {
        node.classList.add('active');
        if (bubbles[idx]) bubbles[idx].textContent = String(stepIdx);
      } else {
        if (bubbles[idx]) bubbles[idx].textContent = String(stepIdx);
      }
    });

    // Refresh translations on UI
    if (typeof window !== 'undefined' && window.EM_I18N && typeof window.EM_I18N.updateAllTranslations === 'function') {
      window.EM_I18N.updateAllTranslations();
    }

    // Scroll to top of main container for smooth wizard flow
    const container = document.getElementById('returnsMainContainer');
    if (container && typeof container.scrollIntoView === 'function') {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- REASON LABEL LOOKUP ---
  function getReasonLabel(reasonCode) {
    const reasonsMap = {
      defective: getI18nText('reason_defective', 'Performance or quality not adequate'),
      damaged: getI18nText('reason_damaged', 'Item arrived damaged / broken packaging'),
      missing_parts: getI18nText('reason_missing_parts', 'Missing parts or accessories'),
      wrong_item: getI18nText('reason_wrong_item', 'Different item was received'),
      performance_issue: getI18nText('reason_performance_issue', 'Technical malfunction or hardware defect'),
      no_longer_needed: getI18nText('reason_no_longer_needed', 'No longer needed / bought by mistake')
    };
    return reasonsMap[reasonCode] || reasonCode || 'General return';
  }

  // --- RESOLUTION LABEL LOOKUP ---
  function getResolutionLabel(resCode) {
    if (resCode === 'replacement') {
      return getI18nText('res_replacement_title', 'Replacement (Free of charge - ₹0)');
    }
    if (resCode === 'refund_wallet') {
      return getI18nText('res_refund_wallet', 'Refund: ElectroMart Pay Wallet (Instant)');
    }
    return getI18nText('res_refund_original', 'Refund: Original Payment Method (3-5 business days)');
  }

  // --- POPULATE ORDER DETAILS ---
  function populateOrderDetails(order) {
    currentOrder = order;

    // Pick first item or order info
    const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
    currentItem = items[0] || {
      id: order.productId || 'item-1',
      title: order.product || 'ElectroMart Item',
      image: order.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80',
      price: order.total || 0,
      quantity: 1
    };

    // DOM bindings
    const thumbEl = document.getElementById('step1ItemThumb');
    const titleEl = document.getElementById('step1ItemTitle');
    const orderIdEl = document.getElementById('step1OrderId');
    const orderDateEl = document.getElementById('step1OrderDate');
    const priceEl = document.getElementById('step1ItemPrice');

    if (thumbEl) {
      thumbEl.src = currentItem.image || currentItem.thumb || order.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80';
      thumbEl.alt = currentItem.title || currentItem.name || order.product || 'Item';
    }
    if (titleEl) {
      titleEl.textContent = currentItem.title || currentItem.name || order.product || 'ElectroMart Item';
    }
    if (orderIdEl) {
      orderIdEl.textContent = order.idLabel || order.id || 'EM-ORD-000000';
    }
    if (orderDateEl) {
      orderDateEl.textContent = `Ordered: ${order.date || 'Recent'}`;
    }
    if (priceEl) {
      priceEl.textContent = money(currentItem.price || order.total || 0);
    }

    // Set initial address from order if available
    if (order.shippingAddress) {
      if (typeof order.shippingAddress === 'string') {
        pickupAddress.addressLine = order.shippingAddress;
      } else if (typeof order.shippingAddress === 'object') {
        pickupAddress.fullName = order.shippingAddress.fullName || pickupAddress.fullName;
        pickupAddress.addressLine = order.shippingAddress.addressLine || order.shippingAddress.address || pickupAddress.addressLine;
        pickupAddress.city = order.shippingAddress.city || pickupAddress.city;
        pickupAddress.state = order.shippingAddress.state || pickupAddress.state;
        pickupAddress.pincode = order.shippingAddress.pincode || order.shippingAddress.pinCode || pickupAddress.pincode;
        pickupAddress.phone = order.shippingAddress.phone || order.phone || pickupAddress.phone;
      }
    }
    updatePickupAddressDisplay();

    // Populate pickup date options (next 3 business days)
    populatePickupDates();
  }

  // --- POPULATE PICKUP DATES ---
  function populatePickupDates() {
    const selectEl = document.getElementById('pickupDateSelect');
    if (!selectEl) return;

    selectEl.innerHTML = '';
    const now = new Date();

    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'long' });
      const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const opt = document.createElement('option');
      opt.value = d.toISOString().split('T')[0];
      opt.textContent = `${dayName}, ${dateStr} (Doorstep pickup)`;
      selectEl.appendChild(opt);
    }

    selectedDate = selectEl.value;
    selectEl.addEventListener('change', (e) => {
      selectedDate = e.target.value;
    });
  }

  // --- UPDATE PICKUP ADDRESS DISPLAY ---
  function updatePickupAddressDisplay() {
    const displayEl = document.getElementById('pickupAddressDisplay');
    if (!displayEl) return;
    displayEl.innerHTML = `
      <strong>${escapeHtml(pickupAddress.fullName)}</strong>
      <span>${escapeHtml(pickupAddress.addressLine)}, ${escapeHtml(pickupAddress.city)}, ${escapeHtml(pickupAddress.state)} ${escapeHtml(pickupAddress.pincode)}</span>
      <br><small style="color:#565959;">${getI18nText('phone_label', 'Phone')}: ${escapeHtml(pickupAddress.phone)}</small>
    `;
  }

  // --- SUBMIT RETURN REQUEST ---
  function submitReturnRequest() {
    if (!currentOrder || !selectedReason) {
      showToast('Please select a return reason first.', 'error');
      return;
    }

    const returnId = `EM-RET-${Math.floor(100000 + Math.random() * 900000)}`;
    const returnItemTitle = currentItem?.title || currentItem?.name || currentOrder.product || 'ElectroMart Item';
    const returnItemPrice = Number(currentItem?.price || currentOrder.total || 0);
    const comments = document.getElementById('step1Comments')?.value || '';

    // 1. Build Return Record
    const returnRecord = {
      id: returnId,
      orderId: currentOrder.id,
      productId: currentItem?.id || currentOrder.productId || '',
      productTitle: returnItemTitle,
      productImage: currentItem?.image || currentOrder.image || '',
      productPrice: returnItemPrice,
      reason: selectedReason,
      reasonLabel: getReasonLabel(selectedReason),
      comments: comments,
      resolution: selectedResolution,
      resolutionLabel: getResolutionLabel(selectedResolution),
      pickupDate: selectedDate,
      pickupSlot: selectedSlot,
      pickupSlotLabel: selectedSlot === 'morning' ? 'Morning (9:00 AM - 1:00 PM)' : 'Afternoon (2:00 PM - 6:00 PM)',
      pickupAddress: { ...pickupAddress },
      status: 'pickup_scheduled',
      statusLabel: 'Pickup scheduled',
      createdAt: new Date().toISOString()
    };

    // Save to electromart_returns_v1
    const allReturns = loadReturns();
    allReturns.unshift(returnRecord);
    saveReturns(allReturns);

    // 2. Resolution Branching
    if (selectedResolution === 'replacement') {
      // Create new replacement order at ₹0 additional charge!
      const replacementOrderId = `EM-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const replacementOrder = {
        id: replacementOrderId,
        idLabel: replacementOrderId,
        product: `[Replacement] ${returnItemTitle}`,
        productId: currentItem?.id || currentOrder.productId || '',
        image: currentItem?.image || currentOrder.image || '',
        total: 0,
        subtotal: 0,
        shipping: 0,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'Replacement (Zero Cost)',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        isReplacement: true,
        originalOrderId: currentOrder.id,
        tracking: {
          carrier: 'ElectroMart Logistics Express',
          trackingId: `EM-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
          eta: 'Arriving in 2-3 business days'
        }
      };

      const offlineOrders = loadOfflineOrders();
      offlineOrders.unshift(replacementOrder);
      saveOfflineOrders(offlineOrders);

      showToast(getI18nText('replacement_order_toast', 'Replacement order created at ₹0 additional charge!'), 'success');
    } else if (selectedResolution === 'refund_wallet') {
      // Instant wallet credit hook
      const currentWallet = loadWalletBalance();
      const nextWallet = currentWallet + returnItemPrice;
      saveWalletBalance(nextWallet);

      // Record wallet transaction
      try {
        const rawTx = localStorage.getItem(WALLET_TRANSACTIONS_KEY);
        const txList = rawTx ? JSON.parse(rawTx) : [];
        txList.unshift({
          id: `WTX-${Date.now()}`,
          title: `Return Refund for ${returnId}`,
          amount: returnItemPrice,
          type: 'credit',
          date: new Date().toISOString()
        });
        localStorage.setItem(WALLET_TRANSACTIONS_KEY, JSON.stringify(txList));
      } catch (e) {
        // ignore
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('electromart_pay_balance_updated', {
          detail: { balance: nextWallet, credited: returnItemPrice }
        }));
      }

      showToast(getI18nText('refund_credited_toast', `Refund of ${money(returnItemPrice)} credited to ElectroMart Pay Wallet!`), 'success');
    }

    // 3. Cross-Page Sync: Update original order status to 'return_initiated' / 'pickup_scheduled'
    const offlineList = loadOfflineOrders();
    const orderIdx = offlineList.findIndex((o) => String(o.id) === String(currentOrder.id));
    if (orderIdx !== -1) {
      offlineList[orderIdx].status = 'return_initiated';
      offlineList[orderIdx].returnInitiated = true;
      offlineList[orderIdx].returnId = returnId;

      // Add to afterSalesCases
      if (!Array.isArray(offlineList[orderIdx].afterSalesCases)) {
        offlineList[orderIdx].afterSalesCases = [];
      }
      offlineList[orderIdx].afterSalesCases.unshift({
        id: returnId,
        type: selectedResolution === 'replacement' ? 'exchange' : 'return',
        typeLabel: selectedResolution === 'replacement' ? 'Replacement' : 'Return',
        status: 'pickup_scheduled',
        statusLabel: 'Pickup scheduled',
        reason: selectedReason,
        reasonLabel: getReasonLabel(selectedReason),
        refundAmount: selectedResolution === 'replacement' ? 0 : returnItemPrice,
        createdAt: new Date().toISOString(),
        final: false
      });

      saveOfflineOrders(offlineList);
    }

    // Dispatch global custom event for live cross-tab/cross-page sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('electromart_return_updated', {
        detail: { returnId, orderId: currentOrder.id, resolution: selectedResolution }
      }));
    }

    // 4. Populate Step 4 (Digital Return Slip)
    populateReturnSlip(returnRecord);

    // 5. Navigate to Step 4
    goToStep(4);
  }

  // --- POPULATE RETURN SLIP ---
  function populateReturnSlip(record) {
    const confIdEl = document.getElementById('confirmationReturnId');
    const slipReturnIdEl = document.getElementById('slipReturnId');
    const slipOrderIdEl = document.getElementById('slipOrderId');
    const slipItemTitleEl = document.getElementById('slipItemTitle');
    const slipReturnReasonEl = document.getElementById('slipReturnReason');
    const slipResolutionEl = document.getElementById('slipResolution');
    const slipPickupSlotEl = document.getElementById('slipPickupSlot');
    const slipPickupAddressEl = document.getElementById('slipPickupAddress');
    const barcodeTextEl = document.getElementById('returnBarcodeText');
    const barcodeSvgEl = document.getElementById('returnBarcodeSvg');
    const trackReturnBtn = document.getElementById('trackReturnOrderBtn');

    if (confIdEl) confIdEl.textContent = record.id;
    if (slipReturnIdEl) slipReturnIdEl.textContent = record.id;
    if (slipOrderIdEl) slipOrderIdEl.textContent = record.orderId;
    if (slipItemTitleEl) slipItemTitleEl.textContent = `${record.productTitle} (${money(record.productPrice)})`;
    if (slipReturnReasonEl) slipReturnReasonEl.textContent = record.reasonLabel;
    if (slipResolutionEl) slipResolutionEl.textContent = record.resolutionLabel;
    if (slipPickupSlotEl) slipPickupSlotEl.textContent = `${record.pickupDate} (${record.pickupSlotLabel})`;
    if (slipPickupAddressEl) {
      const a = record.pickupAddress;
      slipPickupAddressEl.textContent = `${a.fullName}, ${a.addressLine}, ${a.city}, ${a.state} ${a.pincode} (Ph: ${a.phone})`;
    }
    if (barcodeTextEl) barcodeTextEl.textContent = record.id;
    if (barcodeSvgEl) renderSvgBarcode(barcodeSvgEl, record.id);
    if (trackReturnBtn) {
      trackReturnBtn.href = `tracking.html?orderId=${encodeURIComponent(record.orderId)}`;
    }
  }

  // --- ATTACH EVENT LISTENERS ---
  function setupEventListeners() {
    // Step 1: Return Reason selection validation
    const reasonCards = document.querySelectorAll('#step1ReasonsList .returns-option-card');
    const continueBtn1 = document.getElementById('step1ContinueBtn');

    reasonCards.forEach((card) => {
      const radio = card.querySelector('input[name="returnReason"]');
      if (!radio) return;

      const handleSelect = () => {
        radio.checked = true;
        selectedReason = radio.value;

        // Update selected visual state
        reasonCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // VALIDATION: Activate Continue button immediately upon selection!
        if (continueBtn1) {
          continueBtn1.disabled = false;
        }
      };

      card.addEventListener('click', handleSelect);
      radio.addEventListener('change', handleSelect);
    });

    if (continueBtn1) {
      continueBtn1.addEventListener('click', () => {
        if (!selectedReason) {
          showToast('Please select a return reason first.', 'error');
          return;
        }
        goToStep(2);
      });
    }

    // Step 2: Resolution selection
    const resCards = document.querySelectorAll('#step2ResolutionList .returns-option-card');
    const continueBtn2 = document.getElementById('step2ContinueBtn');
    const backBtn2 = document.getElementById('step2BackBtn');

    resCards.forEach((card) => {
      const radio = card.querySelector('input[name="returnResolution"]');
      if (!radio) return;

      const handleSelect = () => {
        radio.checked = true;
        selectedResolution = radio.value;
        resCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      };

      card.addEventListener('click', handleSelect);
      radio.addEventListener('change', handleSelect);
    });

    if (backBtn2) {
      backBtn2.addEventListener('click', () => goToStep(1));
    }
    if (continueBtn2) {
      continueBtn2.addEventListener('click', () => goToStep(3));
    }

    // Step 3: Pickup schedule & Address
    const slotCards = document.querySelectorAll('input[name="pickupSlot"]');
    slotCards.forEach((radio) => {
      const card = radio.closest('.returns-option-card');
      const handleSlot = () => {
        radio.checked = true;
        selectedSlot = radio.value;
        document.querySelectorAll('input[name="pickupSlot"]').forEach(r => {
          r.closest('.returns-option-card')?.classList.remove('selected');
        });
        card?.classList.add('selected');
      };
      card?.addEventListener('click', handleSlot);
      radio.addEventListener('change', handleSlot);
    });

    const backBtn3 = document.getElementById('step3BackBtn');
    const submitBtn3 = document.getElementById('step3SubmitBtn');

    if (backBtn3) {
      backBtn3.addEventListener('click', () => goToStep(2));
    }
    if (submitBtn3) {
      submitBtn3.addEventListener('click', submitReturnRequest);
    }

    // Address Change Modal
    const changeAddressBtn = document.getElementById('changeAddressBtn');
    const addressModal = document.getElementById('addressEditModal');
    const modalCancelBtn = document.getElementById('modalCancelAddressBtn');
    const modalSaveBtn = document.getElementById('modalSaveAddressBtn');

    if (changeAddressBtn && addressModal) {
      changeAddressBtn.addEventListener('click', () => {
        // Pre-fill modal
        document.getElementById('modalNameInput').value = pickupAddress.fullName;
        document.getElementById('modalAddressLineInput').value = pickupAddress.addressLine;
        document.getElementById('modalCityInput').value = pickupAddress.city;
        document.getElementById('modalStateInput').value = pickupAddress.state;
        document.getElementById('modalPincodeInput').value = pickupAddress.pincode;
        document.getElementById('modalPhoneInput').value = pickupAddress.phone;
        addressModal.style.display = 'flex';
      });
    }

    if (modalCancelBtn && addressModal) {
      modalCancelBtn.addEventListener('click', () => {
        addressModal.style.display = 'none';
      });
    }

    if (modalSaveBtn && addressModal) {
      modalSaveBtn.addEventListener('click', () => {
        pickupAddress.fullName = document.getElementById('modalNameInput')?.value || pickupAddress.fullName;
        pickupAddress.addressLine = document.getElementById('modalAddressLineInput')?.value || pickupAddress.addressLine;
        pickupAddress.city = document.getElementById('modalCityInput')?.value || pickupAddress.city;
        pickupAddress.state = document.getElementById('modalStateInput')?.value || pickupAddress.state;
        pickupAddress.pincode = document.getElementById('modalPincodeInput')?.value || pickupAddress.pincode;
        pickupAddress.phone = document.getElementById('modalPhoneInput')?.value || pickupAddress.phone;

        updatePickupAddressDisplay();
        addressModal.style.display = 'none';
        showToast('Pickup address updated successfully!', 'success');
      });
    }

    // Photo Upload Simulator
    const uploadBox = document.getElementById('step1UploadBox');
    const fileInput = document.getElementById('step1FileInput');
    const photoPreviews = document.getElementById('step1PhotoPreviews');

    if (uploadBox && fileInput) {
      uploadBox.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (re) => {
            const dataUrl = re.target.result;
            uploadedPhotos.push(dataUrl);

            if (photoPreviews) {
              const wrap = document.createElement('div');
              wrap.className = 'returns-photo-thumb-wrap';
              wrap.innerHTML = `
                <img src="${dataUrl}" alt="Issue Photo" />
                <button type="button" class="returns-photo-remove" title="Remove photo">&times;</button>
              `;
              wrap.querySelector('.returns-photo-remove').addEventListener('click', (ev) => {
                ev.stopPropagation();
                wrap.remove();
                uploadedPhotos = uploadedPhotos.filter(p => p !== dataUrl);
              });
              photoPreviews.appendChild(wrap);
            }
          };
          reader.readAsDataURL(file);
        });
      });
    }

    // Step 4: Print Slip
    const printBtn = document.getElementById('printSlipBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          window.print();
        }
      });
    }
  }

  // --- INITIALIZATION ---
  async function init() {
    const order = await resolveOrder();
    const emptyStateEl = document.getElementById('returnsEmptyState');
    const wizardContainerEl = document.getElementById('returnsWizardContainer');

    if (!order) {
      if (emptyStateEl) emptyStateEl.style.display = 'block';
      if (wizardContainerEl) wizardContainerEl.style.display = 'none';
      return;
    }

    if (emptyStateEl) emptyStateEl.style.display = 'none';
    if (wizardContainerEl) wizardContainerEl.style.display = 'block';

    populateOrderDetails(order);
    setupEventListeners();
    goToStep(1);
  }

  // Expose public API for testing and programmatic use
  if (typeof window !== 'undefined') {
    window.ElectroMartReturns = {
      init,
      goToStep,
      resolveOrder,
      submitReturnRequest,
      getReasonLabel,
      getResolutionLabel,
      renderSvgBarcode,
      get state() {
        return {
          currentOrder,
          currentItem,
          currentStep,
          selectedReason,
          selectedResolution,
          selectedDate,
          selectedSlot,
          pickupAddress,
          uploadedPhotos
        };
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // CommonJS export for headless node unit tests
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      loadReturns,
      saveReturns,
      loadOfflineOrders,
      saveOfflineOrders,
      loadWalletBalance,
      saveWalletBalance,
      getReasonLabel,
      getResolutionLabel,
      renderSvgBarcode
    };
  }
})();
