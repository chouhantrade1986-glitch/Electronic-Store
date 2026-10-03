(function () {
  'use strict';

  const STORAGE_KEY = 'electromart_ewaste_v1';
  const VOUCHER_KEY = 'electromart_green_vouchers_v1';
  const GREEN_KEY = 'electromart_green_credits_v1';

  const itemProfiles = {
    mobile: { label: 'Smartphone', baseReward: 220, metals: { copper: 0.22, aluminium: 0.31, gold: 0.01 }, carbon: 18 },
    laptop: { label: 'Laptop', baseReward: 540, metals: { copper: 0.46, aluminium: 0.82, gold: 0.02 }, carbon: 42 },
    printer: { label: 'Printer', baseReward: 380, metals: { copper: 0.38, aluminium: 0.41, gold: 0.01 }, carbon: 26 },
    accessory: { label: 'Cable / Accessory', baseReward: 180, metals: { copper: 0.2, aluminium: 0.22, gold: 0.01 }, carbon: 12 },
    cartridge: { label: 'Ink / Cartridge', baseReward: 210, metals: { copper: 0.15, aluminium: 0.18, gold: 0.01 }, carbon: 10 },
    keyboard: { label: 'Keyboard', baseReward: 190, metals: { copper: 0.16, aluminium: 0.25, gold: 0.01 }, carbon: 8 }
  };

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function createRequestId() {
    const random = Math.floor(Math.random() * 900000 + 100000);
    return `EM-EWASTE-${random}`;
  }

  function createVoucherCode(amount) {
    const suffix = Math.floor(Math.random() * 900000 + 100000);
    return `EM-GREEN-${suffix}`;
  }

  function validatePincode(value) {
    return /^[1-9][0-9]{5}$/.test(String(value || '').trim());
  }

  function calculateImpact(category, weightKg) {
    const profile = itemProfiles[category] || itemProfiles.mobile;
    const metalWeight = (weightKg * 0.42) + (profile.metals.copper || 0.2) + (profile.metals.aluminium || 0.2);
    const carbonSaved = Math.round(((profile.carbon || 10) * weightKg * 1.2) * 10) / 10;
    const divertKg = Math.max(0.2, Number(weightKg || 1));
    const reward = Math.max(200, Math.round((weightKg * 130) + (profile.baseReward || 200)));

    return {
      category: profile.label,
      metalWeight: Number(metalWeight.toFixed(2)),
      carbonSaved,
      divertKg: Number(divertKg.toFixed(2)),
      reward
    };
  }

  function generateVoucher(amount) {
    return {
      code: createVoucherCode(amount),
      amount,
      createdAt: new Date().toISOString()
    };
  }

  function setSelectedStep(step) {
    document.querySelectorAll('.wizard-step').forEach((panel) => {
      panel.classList.toggle('active', panel.id === `ewasteStep${step}`);
    });
  }

  function initDateField() {
    const dateField = document.getElementById('ewastePickupDate');
    if (!dateField) return;
    const now = new Date();
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    dateField.min = iso;
    dateField.value = iso;
  }

  function syncRewardDisplay(category, weight) {
    const impact = calculateImpact(category, Number(weight || 1));
    const impactMetal = document.getElementById('ewasteMetalValue');
    const impactCarbon = document.getElementById('ewasteCarbonValue');
    const impactDivert = document.getElementById('ewasteDivertedValue');
    const rewardAmount = document.getElementById('ewasteRewardAmount');
    const voucherCode = document.getElementById('ewasteVoucherCode');

    if (impactMetal) impactMetal.textContent = `${impact.metalWeight.toFixed(2)} kg`;
    if (impactCarbon) impactCarbon.textContent = `${impact.carbonSaved} kg`;
    if (impactDivert) impactDivert.textContent = `${impact.divertKg.toFixed(2)} kg`;
    if (rewardAmount) rewardAmount.textContent = `₹${impact.reward}`;
    if (voucherCode) voucherCode.textContent = generateVoucher(impact.reward).code;

    const reviewReward = document.getElementById('ewasteReviewReward');
    if (reviewReward) reviewReward.textContent = `₹${impact.reward}`;
  }

  function getSelectedCategory() {
    const card = document.querySelector('.ewaste-category-card.selected');
    if (!card) return { category: 'mobile', weight: 1.5 };
    return {
      category: card.dataset.category || 'mobile',
      weight: Number(document.getElementById('ewasteWeightInput')?.value || card.dataset.weight || 1.5)
    };
  }

  function updateReviewSummary() {
    const selected = getSelectedCategory();
    const categoryLabel = itemProfiles[selected.category]?.label || 'Smartphone';
    const pincode = document.getElementById('ewastePincodeInput')?.value || '110001';
    const slot = document.getElementById('ewastePickupSlot');
    const slotText = slot ? slot.options[slot.selectedIndex]?.text || '9:00 AM - 12:00 PM' : '9:00 AM - 12:00 PM';
    const reviewCategory = document.getElementById('ewasteReviewCategory');
    const reviewWeight = document.getElementById('ewasteReviewWeight');
    const reviewPincode = document.getElementById('ewasteReviewPincode');
    const reviewSlot = document.getElementById('ewasteReviewSlot');

    if (reviewCategory) reviewCategory.textContent = categoryLabel;
    if (reviewWeight) reviewWeight.textContent = `${Number(selected.weight || 1).toFixed(1)} kg`;
    if (reviewPincode) reviewPincode.textContent = pincode;
    if (reviewSlot) reviewSlot.textContent = slotText;

    syncRewardDisplay(selected.category, Number(selected.weight || 1));
  }

  function bindCategorySelection() {
    const cards = document.querySelectorAll('.ewaste-category-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        cards.forEach((item) => item.classList.remove('selected'));
        card.classList.add('selected');
        const weightField = document.getElementById('ewasteWeightInput');
        if (weightField && card.dataset.weight) weightField.value = Number(card.dataset.weight).toFixed(1);
        updateReviewSummary();
      });
    });
  }

  function bindWizardFlow() {
    document.getElementById('ewasteScrollToWizard')?.addEventListener('click', () => {
      const wizard = document.getElementById('ewasteWizard') || document.getElementById('ewasteRequestForm');
      wizard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSelectedStep(1);
    });

    document.getElementById('ewasteNextStep1')?.addEventListener('click', () => {
      setSelectedStep(2);
      updateReviewSummary();
    });

    document.getElementById('ewasteBackStep2')?.addEventListener('click', () => {
      setSelectedStep(1);
    });

    document.getElementById('ewasteNextStep2')?.addEventListener('click', () => {
      const pincodeInput = document.getElementById('ewastePincodeInput');
      const error = document.getElementById('ewastePincodeError');
      if (!pincodeInput || !validatePincode(pincodeInput.value)) {
        if (error) error.hidden = false;
        return;
      }
      if (error) error.hidden = true;
      updateReviewSummary();
      setSelectedStep(3);
    });

    document.getElementById('ewasteBackStep3')?.addEventListener('click', () => {
      setSelectedStep(2);
    });
  }

  function persistRequest(request) {
    const requests = readStorage(STORAGE_KEY, []);
    requests.unshift(request);
    writeStorage(STORAGE_KEY, requests);

    const vouchers = readStorage(VOUCHER_KEY, []);
    vouchers.unshift({
      code: request.voucherCode,
      amount: request.rewardAmount,
      requestId: request.id,
      createdAt: request.createdAt
    });
    writeStorage(VOUCHER_KEY, vouchers);

    const credits = readStorage(GREEN_KEY, 0);
    writeStorage(GREEN_KEY, Number(credits) + Number(request.rewardAmount));
  }

  function submitRequest(event) {
    event.preventDefault();

    const form = document.getElementById('ewasteRequestForm');
    if (!form) return;

    const selected = getSelectedCategory();
    const pincodeInput = document.getElementById('ewastePincodeInput');
    const dateInput = document.getElementById('ewastePickupDate');
    const slotInput = document.getElementById('ewastePickupSlot');
    const weightInput = document.getElementById('ewasteWeightInput');

    if (!pincodeInput || !validatePincode(pincodeInput.value)) {
      const error = document.getElementById('ewastePincodeError');
      if (error) error.hidden = false;
      return;
    }

    const impact = calculateImpact(selected.category, Number(weightInput?.value || selected.weight || 1.5));
    const request = {
      id: createRequestId(),
      category: selected.category,
      weightKg: Number(weightInput?.value || selected.weight || 1.5),
      pincode: pincodeInput.value,
      pickupDate: dateInput?.value || new Date().toISOString().split('T')[0],
      pickupSlot: slotInput?.value || 'morning',
      rewardAmount: impact.reward,
      voucherCode: createVoucherCode(impact.reward).code,
      impact: {
        metalWeight: impact.metalWeight,
        carbonSaved: impact.carbonSaved,
        divertKg: impact.divertKg
      },
      createdAt: new Date().toISOString(),
      status: 'Scheduled'
    };

    persistRequest(request);

    const rewardCode = document.getElementById('ewasteVoucherCode');
    if (rewardCode) rewardCode.textContent = request.voucherCode;

    const reviewReward = document.getElementById('ewasteReviewReward');
    if (reviewReward) reviewReward.textContent = `₹${request.rewardAmount}`;

    const notice = document.createElement('div');
    notice.className = 'ewaste-success-banner';
    notice.textContent = `Pickup request ${request.id} created successfully. Voucher ${request.voucherCode} unlocked.`;
    form.appendChild(notice);
  }

  function bindWeightInput() {
    const field = document.getElementById('ewasteWeightInput');
    if (!field) return;
    field.addEventListener('input', () => {
      updateReviewSummary();
    });
  }

  function bindSlotSelect() {
    const slotSelect = document.getElementById('ewastePickupSlot');
    if (!slotSelect) return;
    slotSelect.addEventListener('change', updateReviewSummary);
  }

  function bootstrap() {
    initDateField();
    bindCategorySelection();
    bindWizardFlow();
    bindWeightInput();
    bindSlotSelect();
    updateReviewSummary();
    document.getElementById('ewasteRequestForm')?.addEventListener('submit', submitRequest);
    setSelectedStep(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
