/**
 * ElectroMart Seller Central — Store Settings Controller (Phase 12)
 */

(function () {
  'use strict';

  const SETTINGS_KEY = 'electromart_store_settings_v1';
  const COUPONS_KEY = 'electromart_promo_coupons_v1';

  let settings = {
    freeShippingThreshold: 499,
    standardShippingFee: 40,
    expressShippingFee: 99,
    returnWindowDays: 7
  };

  let coupons = [
    { code: 'ELECTRO10', discount: '10% OFF', minOrder: 999, validFor: 'All Categories', active: true },
    { code: 'FESTIVE500', discount: '₹500 Flat', minOrder: 4999, validFor: 'Laptops & Mobiles', active: true },
    { code: 'FREESHIP', discount: 'Free Delivery', minOrder: 0, validFor: 'Entire Catalog', active: true }
  ];

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) settings = Object.assign(settings, JSON.parse(raw));
    } catch (e) {}

    try {
      const rawC = localStorage.getItem(COUPONS_KEY);
      if (rawC) coupons = JSON.parse(rawC);
    } catch (e) {}
  }

  function initSettingsPage() {
    if (!window.EM_ADMIN) return;
    window.EM_ADMIN.renderTopbar('settings');

    loadSettings();

    // Populate form fields
    const fThreshold = document.getElementById('freeShippingThreshold');
    const fStandard = document.getElementById('standardShippingFee');
    const fExpress = document.getElementById('expressShippingFee');
    const fReturn = document.getElementById('returnWindowDays');

    if (fThreshold) fThreshold.value = settings.freeShippingThreshold;
    if (fStandard) fStandard.value = settings.standardShippingFee;
    if (fExpress) fExpress.value = settings.expressShippingFee;
    if (fReturn) fReturn.value = settings.returnWindowDays;

    renderCoupons();
    setupEventListeners();
  }

  function renderCoupons() {
    const tbody = document.getElementById('couponsTableBody');
    if (!tbody) return;

    if (coupons.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">No active promotional vouchers.</td></tr>';
      return;
    }

    tbody.innerHTML = coupons.map((c, idx) => `
      <tr>
        <td><strong style="font-family: monospace; font-size: 0.95rem; color: #b12704;">${c.code}</strong></td>
        <td><span style="font-weight: 700; color: #067d62;">${c.discount}</span></td>
        <td>${window.EM_ADMIN.formatCurrency(c.minOrder)}</td>
        <td>${c.validFor}</td>
        <td><span class="status-pill delivered">Active</span></td>
        <td>
          <button type="button" class="amz-btn-danger delete-coupon-btn" data-index="${idx}" style="padding: 4px 10px; font-size: 0.78rem;">
            <span>Delete</span>
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.delete-coupon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const deleted = coupons.splice(idx, 1)[0];
        try {
          localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
        } catch (e) {}
        window.EM_ADMIN.recordAudit('COUPON_DELETE', 'general', deleted ? deleted.code : 'coupon', 'Deleted coupon voucher.');
        window.EM_ADMIN.showToast(`Coupon ${deleted ? deleted.code : ''} deleted.`, 'info');
        renderCoupons();
      });
    });
  }

  function setupEventListeners() {
    // Shipping form
    const form = document.getElementById('shippingSettingsForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fThreshold = document.getElementById('freeShippingThreshold');
        const fStandard = document.getElementById('standardShippingFee');
        const fExpress = document.getElementById('expressShippingFee');
        const fReturn = document.getElementById('returnWindowDays');

        settings.freeShippingThreshold = Number(fThreshold ? fThreshold.value : 499);
        settings.standardShippingFee = Number(fStandard ? fStandard.value : 40);
        settings.expressShippingFee = Number(fExpress ? fExpress.value : 99);
        settings.returnWindowDays = Number(fReturn ? fReturn.value : 7);

        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {}

        window.EM_ADMIN.recordAudit('STORE_SETTINGS_UPDATE', 'general', 'shipping_policies', `Free delivery threshold set to ₹${settings.freeShippingThreshold}. Standard fee: ₹${settings.standardShippingFee}`);
        window.EM_ADMIN.showToast('Shipping policies updated successfully!', 'success');
      });
    }

    // Pincode checker
    const checkBtn = document.getElementById('checkPincodeBtn');
    const pinInput = document.getElementById('testPincodeInput');
    const box = document.getElementById('pincodeResultBox');
    const resText = document.getElementById('pincodeResultText');

    if (checkBtn && pinInput && box && resText) {
      checkBtn.addEventListener('click', () => {
        const pin = pinInput.value.trim();
        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
          window.EM_ADMIN.showToast('Please enter a valid 6-digit Indian PIN code.', 'error');
          return;
        }

        box.hidden = false;
        resText.innerHTML = `
          <strong style="color: #067d62;">✓ PIN ${pin} is Fully Serviceable</strong><br />
          <div style="margin-top: 6px; font-size: 0.84rem; color: #333; line-height: 1.5;">
            • <strong>Easy Ship Priority Delivery:</strong> Guaranteed 1-Day Delivery available<br />
            • <strong>Standard Shipping:</strong> 2 - 3 business days via Delhivery / Blue Dart<br />
            • <strong>Cash on Delivery (COD):</strong> Enabled up to ₹50,000<br />
            • <strong>Reverse Return Pickup:</strong> Available within 24 hours
          </div>
        `;
      });
    }

    // Coupon modal
    const openAddBtn = document.getElementById('openAddCouponBtn');
    const closeBtn = document.getElementById('closeCouponModalBtn');
    const cancelBtn = document.getElementById('cancelCouponModalBtn');
    const saveBtn = document.getElementById('saveCouponBtn');
    const modal = document.getElementById('addCouponModal');

    if (openAddBtn) openAddBtn.addEventListener('click', () => { if (modal) modal.hidden = false; });
    if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.hidden = true; });
    if (cancelBtn) cancelBtn.addEventListener('click', () => { if (modal) modal.hidden = true; });

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const codeInput = document.getElementById('newCouponCode');
        const discInput = document.getElementById('newCouponDiscount');
        const minInput = document.getElementById('newCouponMinOrder');

        const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
        const discount = discInput ? discInput.value.trim() : '';
        const minOrder = Number(minInput ? minInput.value : 0);

        if (!code || !discount) {
          window.EM_ADMIN.showToast('Please enter coupon code and discount value.', 'error');
          return;
        }

        coupons.push({
          code: code,
          discount: discount,
          minOrder: minOrder,
          validFor: 'All Categories',
          active: true
        });

        try {
          localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
        } catch (e) {}

        window.EM_ADMIN.recordAudit('COUPON_CREATE', 'general', code, `Created coupon ${code} (${discount}) min order ₹${minOrder}.`);
        window.EM_ADMIN.showToast(`Coupon ${code} created successfully!`, 'success');

        if (modal) modal.hidden = true;
        renderCoupons();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettingsPage);
  } else {
    initSettingsPage();
  }
})();
