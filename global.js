/**
 * ElectroMart Global Store Hub — Phase 37
 * Direct Imports, Customs Duty Calculation & Indian Customs KYC Compliance
 * 100% Brand Safe: Pure ElectroMart Branding Only
 */

(function () {
  'use strict';

  // 1. Core Duty & Freight Calculation Engine
  function calculateDutyBreakdown(basePrice, shippingMode) {
    const price = Math.max(0, Number(basePrice) || 0);
    const mode = String(shippingMode || 'standard').toLowerCase();
    
    // Statutory Indian Customs rate for electronics (5% Base Customs Duty)
    const duty = Math.round(price * 0.05);
    
    // Cross-border freight charges (Standard ₹499 / Express ₹1,299)
    const freight = mode === 'express' ? 1299 : 499;
    
    // Integrated Goods and Services Tax (18% IGST on CIF value + Duty)
    const taxableValue = price + duty + freight;
    const igst = Math.round(taxableValue * 0.18);
    
    // Total Delivered Duty Paid (DDP) Landed Price
    const total = price + duty + freight + igst;

    return {
      basePrice: price,
      duty,
      freight,
      igst,
      total,
      mode
    };
  }

  // Expose to window for testing and cross-module integration
  if (typeof window !== 'undefined') {
    window.calculateDutyBreakdown = calculateDutyBreakdown;
  }

  // 2. DOM Controller for Global Store Page
  function initGlobalHub() {
    const basePriceInput = document.getElementById('base-price');
    const calcBtn = document.getElementById('calc-btn');
    const resultBox = document.getElementById('result');
    const dutyAmountSpan = document.getElementById('duty-amount');
    const igstAmountSpan = document.getElementById('igst-amount');
    const freightAmountSpan = document.getElementById('freight-amount');
    const totalAmountSpan = document.getElementById('total-amount');

    const kycForm = document.getElementById('kyc-form');
    const kycTypeSelect = document.getElementById('kyc-type');
    const kycNumberInput = document.getElementById('kyc-number');
    const kycStatusP = document.getElementById('kyc-status');

    // Restore saved KYC status if available
    try {
      const savedKycRaw = localStorage.getItem('electromart_global_kyc_v1');
      if (savedKycRaw && kycStatusP) {
        const savedKyc = JSON.parse(savedKycRaw);
        if (savedKyc && savedKyc.status === 'VERIFIED') {
          kycStatusP.classList.remove('hidden', 'error');
          kycStatusP.classList.add('success');
          kycStatusP.textContent = `✓ Customs KYC Verified (${savedKyc.type.toUpperCase()}: ${savedKyc.maskedNumber})`;
          if (kycNumberInput) kycNumberInput.value = savedKyc.maskedNumber;
        }
      }
    } catch (e) {
      // Ignore parse errors
    }

    // Handle Duty Calculation
    if (calcBtn && basePriceInput) {
      calcBtn.addEventListener('click', function () {
        const price = parseFloat(basePriceInput.value);
        if (isNaN(price) || price <= 0) {
          alert('Please enter a valid base price in ₹ INR.');
          basePriceInput.focus();
          return;
        }

        const selectedModeEl = document.querySelector('input[name="shipping-mode"]:checked');
        const mode = selectedModeEl ? selectedModeEl.value : 'standard';

        const breakdown = calculateDutyBreakdown(price, mode);

        if (dutyAmountSpan) dutyAmountSpan.textContent = `₹${breakdown.duty.toLocaleString('en-IN')}`;
        if (igstAmountSpan) igstAmountSpan.textContent = `₹${breakdown.igst.toLocaleString('en-IN')}`;
        if (freightAmountSpan) freightAmountSpan.textContent = `₹${breakdown.freight.toLocaleString('en-IN')}`;
        if (totalAmountSpan) totalAmountSpan.textContent = `₹${breakdown.total.toLocaleString('en-IN')}`;

        if (resultBox) {
          resultBox.classList.remove('hidden');
        }
      });
    }

    // Handle KYC Verification
    if (kycForm && kycTypeSelect && kycNumberInput && kycStatusP) {
      kycForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const docType = kycTypeSelect.value;
        const rawNumber = kycNumberInput.value.trim().toUpperCase().replace(/[\s-]/g, '');

        let isValid = false;
        let maskedNumber = '';

        if (docType === 'passport') {
          // Indian Passport: 1 uppercase letter followed by 7 digits
          isValid = /^[A-Z][0-9]{7}$/.test(rawNumber);
          if (isValid) {
            maskedNumber = rawNumber[0] + '*****' + rawNumber.slice(-2);
          }
        } else if (docType === 'aadhaar') {
          // Aadhaar: 12 digits (starting with 2-9)
          isValid = /^[2-9][0-9]{11}$/.test(rawNumber);
          if (isValid) {
            maskedNumber = 'XXXX-XXXX-' + rawNumber.slice(-4);
          }
        } else if (docType === 'dl') {
          // Driving License: 2 letters state code followed by 13 numeric digits/alphanumeric
          isValid = /^[A-Z]{2}[0-9A-Z]{11,14}$/.test(rawNumber);
          if (isValid) {
            maskedNumber = rawNumber.slice(0, 2) + '*********' + rawNumber.slice(-3);
          }
        }

        if (!isValid) {
          kycStatusP.classList.remove('hidden', 'success');
          kycStatusP.classList.add('error');
          kycStatusP.textContent = `Invalid ${docType.toUpperCase()} format. Please verify and enter a valid document number.`;
          return;
        }

        // Save verified KYC state
        const kycPayload = {
          type: docType,
          maskedNumber: maskedNumber,
          verifiedAt: new Date().toISOString(),
          status: 'VERIFIED'
        };

        try {
          localStorage.setItem('electromart_global_kyc_v1', JSON.stringify(kycPayload));
        } catch (err) {
          console.warn('Unable to store KYC in localStorage', err);
        }

        kycStatusP.classList.remove('hidden', 'error');
        kycStatusP.classList.add('success');
        kycStatusP.textContent = `✓ Customs KYC Verified & Saved (${docType.toUpperCase()}: ${maskedNumber})`;
      });
    }
  }

  // Run on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGlobalHub);
    } else {
      initGlobalHub();
    }
  }
})();
