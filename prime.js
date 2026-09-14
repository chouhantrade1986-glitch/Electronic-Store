/**
 * ElectroMart Phase 24: Prime Membership Hub & Rewards Ecosystem
 * Manages membership tiers, savings tracker, instant activations,
 * plan modifications, modal controllers, and global sync.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'electromart_prime_status_v1';
  const ORDERS_KEY = 'electromart_orders_v1';

  const PRIME_PLANS = {
    monthly: {
      id: 'monthly',
      name: 'ElectroMart Prime Monthly',
      price: 299,
      period: 'month',
      durationDays: 30
    },
    annual: {
      id: 'annual',
      name: 'ElectroMart Prime Annual',
      price: 1499,
      period: 'year',
      durationDays: 365
    },
    lite: {
      id: 'lite',
      name: 'ElectroMart Prime Lite',
      price: 799,
      period: 'year',
      durationDays: 365
    }
  };

  /**
   * Helper to format date into readable string e.g. "14 Oct 2026"
   */
  function formatDate(d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  /**
   * Calculate future renewal date given duration in days
   */
  function getRenewalDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return formatDate(d);
  }

  /**
   * Retrieve current Prime membership status from storage
   */
  function getPrimeStatus() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read prime status:', e);
    }
    return {
      active: false,
      plan: null,
      tierName: null,
      price: 0,
      startDate: null,
      renewalDate: null,
      autoRenew: false,
      isTrial: false,
      totalSavings: 0
    };
  }

  /**
   * Save Prime status and emit sync events
   */
  function savePrimeStatus(status) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    } catch (e) {
      console.error('Could not save prime status:', e);
    }

    // Dispatch global event for header, checkout, cart & test scripts
    window.dispatchEvent(
      new CustomEvent('electromart_prime_updated', {
        detail: status
      })
    );
  }

  /**
   * Calculate Prime Savings
   */
  function calculateSavings(status) {
    let deliverySavings = 1250;
    let cashbackSavings = 820;
    let dealsSavings = 380;

    // If user has orders in storage, compute dynamic estimates
    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      if (Array.isArray(orders) && orders.length > 0) {
        deliverySavings = Math.max(orders.length * 99, 495);
        const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        cashbackSavings = Math.round(totalSpent * 0.05) || 500;
        dealsSavings = Math.round(orders.length * 150) || 300;
      }
    } catch (e) {
      // fallback to standard defaults
    }

    const total = deliverySavings + cashbackSavings + dealsSavings;
    return {
      delivery: deliverySavings,
      cashback: cashbackSavings,
      deals: dealsSavings,
      total: total
    };
  }

  /**
   * Toast notification helper
   */
  function showToast(message, type = 'success') {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function' || typeof document.createElement !== 'function') return;
    const container = document.getElementById('primeToastContainer');
    if (!container || typeof container.appendChild !== 'function') return;

    const toast = document.createElement('div');
    toast.className = `amz-prime-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.style) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
      }
      setTimeout(() => {
        if (typeof toast.remove === 'function') toast.remove();
      }, 300);
    }, 3500);
  }

  /**
   * Modal Management: Open and Close with Escape & Backdrop support
   */
  function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    const modals = document.querySelectorAll('.amz-prime-modal');
    modals.forEach((m) => {
      m.style.display = 'none';
    });
    document.body.style.overflow = '';
  }

  /**
   * Render prime hub UI according to current status
   */
  function renderHub() {
    const status = getPrimeStatus();
    const heroNonMember = document.getElementById('primeHeroNonMember');
    const heroMember = document.getElementById('primeHeroMember');
    const memberTierHeadline = document.getElementById('memberTierHeadline');
    const memberRenewalText = document.getElementById('memberRenewalText');
    const renewalDateSpan = document.getElementById('primeRenewalDateStr');

    // Savings elements
    const savings = calculateSavings(status);
    const totalSavingsEl = document.getElementById('primeTotalSavings');
    const deliverySavingsEl = document.getElementById('primeDeliverySavings');
    const cashbackSavingsEl = document.getElementById('primeCashbackSavings');
    const dealsSavingsEl = document.getElementById('primeDealsSavings');

    if (totalSavingsEl) totalSavingsEl.textContent = `₹${savings.total.toLocaleString('en-IN')}`;
    if (deliverySavingsEl) deliverySavingsEl.textContent = `₹${savings.delivery.toLocaleString('en-IN')}`;
    if (cashbackSavingsEl) cashbackSavingsEl.textContent = `₹${savings.cashback.toLocaleString('en-IN')}`;
    if (dealsSavingsEl) dealsSavingsEl.textContent = `₹${savings.deals.toLocaleString('en-IN')}`;

    // Plan cards
    const planCards = document.querySelectorAll('.amz-prime-plan-card');
    planCards.forEach((card) => {
      const planId = card.getAttribute('data-plan');
      const actionBtn = card.querySelector('.amz-plan-action-btn');
      card.classList.remove('active-plan');

      if (status.active && status.plan === planId) {
        card.classList.add('active-plan');
        if (actionBtn) {
          actionBtn.textContent = '✓ Current Plan';
          actionBtn.disabled = true;
          actionBtn.style.opacity = '0.7';
          actionBtn.style.cursor = 'default';
        }
      } else {
        if (actionBtn) {
          actionBtn.disabled = false;
          actionBtn.style.opacity = '1';
          actionBtn.style.cursor = 'pointer';
          if (planId === 'monthly') actionBtn.textContent = 'Join Monthly (₹299/mo)';
          else if (planId === 'annual') actionBtn.textContent = 'Join Annual (₹1,499/yr)';
          else if (planId === 'lite') actionBtn.textContent = 'Join Lite (₹799/yr)';
        }
      }
    });

    if (status.active) {
      if (heroNonMember) heroNonMember.style.display = 'none';
      if (heroMember) heroMember.style.display = 'flex';
      if (memberTierHeadline) {
        memberTierHeadline.textContent = status.tierName || 'ElectroMart Prime Member';
      }
      if (renewalDateSpan && status.renewalDate) {
        renewalDateSpan.textContent = status.renewalDate;
      }
      if (memberRenewalText && status.isTrial) {
        memberRenewalText.innerHTML = `Your <strong>30-Day Free Trial</strong> is active until <strong>${status.renewalDate}</strong>.`;
      }
    } else {
      if (heroNonMember) heroNonMember.style.display = 'block';
      if (heroMember) heroMember.style.display = 'none';
    }
  }

  /**
   * Action: Activate Plan or 30-Day Free Trial
   */
  function activatePlan(planKey, isTrial = false) {
    const plan = PRIME_PLANS[planKey] || PRIME_PLANS.annual;
    const duration = isTrial ? 30 : plan.durationDays;
    const renewal = getRenewalDate(duration);
    const today = formatDate(new Date());

    const newStatus = {
      active: true,
      plan: plan.id,
      tierName: isTrial ? `${plan.name} (Trial)` : plan.name,
      price: plan.price,
      startDate: today,
      renewalDate: renewal,
      autoRenew: true,
      isTrial: isTrial,
      totalSavings: 2450
    };

    savePrimeStatus(newStatus);
    renderHub();

    if (isTrial) {
      showToast('🎉 30-Day Free Trial Activated! Welcome to ElectroMart Prime!', 'success');
    } else {
      showToast(`✨ Welcome to ${plan.name}! All Prime benefits unlocked.`, 'success');
    }
  }

  /**
   * Action: Pause Membership
   */
  function pauseMembership() {
    const status = getPrimeStatus();
    if (!status.active) return;

    status.isPaused = true;
    savePrimeStatus(status);
    showToast('Prime membership paused for 30 days. You can resume anytime.', 'info');
    closeAllModals();
  }

  /**
   * Action: Cancel Membership
   */
  function cancelMembership() {
    const canceledStatus = {
      active: false,
      plan: null,
      tierName: null,
      price: 0,
      startDate: null,
      renewalDate: null,
      autoRenew: false,
      isTrial: false,
      totalSavings: 0
    };

    savePrimeStatus(canceledStatus);
    renderHub();
    closeAllModals();
    showToast('ElectroMart Prime membership ended. You can rejoin anytime!', 'info');
  }

  /**
   * Action: Change Plan
   */
  function changePlan(newPlanKey) {
    const plan = PRIME_PLANS[newPlanKey];
    if (!plan) return;

    const currentStatus = getPrimeStatus();
    const renewal = getRenewalDate(plan.durationDays);
    const updatedStatus = {
      ...currentStatus,
      active: true,
      plan: plan.id,
      tierName: plan.name,
      price: plan.price,
      renewalDate: renewal,
      isTrial: false
    };

    savePrimeStatus(updatedStatus);
    renderHub();
    closeAllModals();
    showToast(`Plan successfully updated to ${plan.name}!`, 'success');
  }

  /**
   * Initialize event bindings and DOM handlers
   */
  function init() {
    // 1. Hero Buttons
    const startTrialHeroBtn = document.getElementById('startTrialHeroBtn');
    if (startTrialHeroBtn) {
      startTrialHeroBtn.addEventListener('click', () => {
        activatePlan('annual', true);
      });
    }

    // 2. Plan Action Buttons
    const selectMonthlyPlanBtn = document.getElementById('selectMonthlyPlanBtn');
    if (selectMonthlyPlanBtn) {
      selectMonthlyPlanBtn.addEventListener('click', () => activatePlan('monthly', false));
    }

    const selectAnnualPlanBtn = document.getElementById('selectAnnualPlanBtn');
    if (selectAnnualPlanBtn) {
      selectAnnualPlanBtn.addEventListener('click', () => activatePlan('annual', false));
    }

    const selectLitePlanBtn = document.getElementById('selectLitePlanBtn');
    if (selectLitePlanBtn) {
      selectLitePlanBtn.addEventListener('click', () => activatePlan('lite', false));
    }

    // 3. Modals
    const changePlanModal = document.getElementById('primeChangePlanModal');
    const cancelModal = document.getElementById('primeCancelModal');

    const openChangePlanModalBtn = document.getElementById('openChangePlanModalBtn');
    if (openChangePlanModalBtn) {
      openChangePlanModalBtn.addEventListener('click', () => {
        const current = getPrimeStatus();
        if (current.plan) {
          const radio = document.querySelector(`input[name="primePlanRadio"][value="${current.plan}"]`);
          if (radio) radio.checked = true;
        }
        openModal(changePlanModal);
      });
    }

    const closeChangePlanModalBtn = document.getElementById('closeChangePlanModalBtn');
    if (closeChangePlanModalBtn) {
      closeChangePlanModalBtn.addEventListener('click', () => closeModal(changePlanModal));
    }

    const dismissChangePlanBtn = document.getElementById('dismissChangePlanBtn');
    if (dismissChangePlanBtn) {
      dismissChangePlanBtn.addEventListener('click', () => closeModal(changePlanModal));
    }

    const changePlanForm = document.getElementById('changePlanForm');
    if (changePlanForm) {
      changePlanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedRadio = document.querySelector('input[name="primePlanRadio"]:checked');
        if (selectedRadio) {
          changePlan(selectedRadio.value);
        }
      });
    }

    const openCancelModalBtn = document.getElementById('openCancelModalBtn');
    if (openCancelModalBtn) {
      openCancelModalBtn.addEventListener('click', () => openModal(cancelModal));
    }

    const closeCancelModalBtn = document.getElementById('closeCancelModalBtn');
    if (closeCancelModalBtn) {
      closeCancelModalBtn.addEventListener('click', () => closeModal(cancelModal));
    }

    const dismissCancelModalBtn = document.getElementById('dismissCancelModalBtn');
    if (dismissCancelModalBtn) {
      dismissCancelModalBtn.addEventListener('click', () => closeModal(cancelModal));
    }

    const pauseMembershipBtn = document.getElementById('pauseMembershipBtn');
    if (pauseMembershipBtn) {
      pauseMembershipBtn.addEventListener('click', pauseMembership);
    }

    const confirmCancelPrimeBtn = document.getElementById('confirmCancelPrimeBtn');
    if (confirmCancelPrimeBtn) {
      confirmCancelPrimeBtn.addEventListener('click', cancelMembership);
    }

    // 4. Modal Escape Key & Backdrop dismiss listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeAllModals();
      }
    });

    [changePlanModal, cancelModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // 5. Cross-tab storage sync
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        renderHub();
      }
    });

    // 6. Custom event sync
    window.addEventListener('electromart_prime_updated', () => {
      renderHub();
    });

    // Initial render
    renderHub();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for testing & external integration
  window.ElectroMartPrime = {
    getPrimeStatus,
    savePrimeStatus,
    activatePlan,
    changePlan,
    pauseMembership,
    cancelMembership,
    calculateSavings,
    renderHub,
    openModal,
    closeModal,
    closeAllModals,
    STORAGE_KEY,
    PRIME_PLANS
  };
})();
