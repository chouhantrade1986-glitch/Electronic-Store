/* ElectroMart BNPL & EMI JavaScript (Phase 44) */
/* Controller for the instalment-plan hub: the reducing-balance calculator, the
 * partner bank offer table, the eligibility checker and the auto-deduction
 * mandate.
 *
 * Determinism: no randomness, no sampling, and no clock-dependent pricing. The
 * four engines below are pure functions, so identical input always produces
 * identical output on every device. Calendar arithmetic uses integer proleptic
 * Gregorian conversion rather than the runtime Date type, which keeps instalment
 * due dates independent of the system clock and of any timezone.
 *
 * Privacy: the ledger never stores a full PAN, mobile number, email address or
 * bank account number. It keeps the verdict, and the last few characters of an
 * identifier, because that is all a person needs to recognise their own record.
 */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.EMI = electroMart.EMI || root.ElectroMartEMI || {};
  // Flat alias kept for integrations that predate the namespaced object.
  root.ElectroMartEMI = namespace;

  /* ---------------------------------------------------------------------
   * Storage contracts
   * ------------------------------------------------------------------- */
  var CALCULATIONS_STORAGE_KEY = 'electromart_emi_calculations_v1';
  var ELIGIBILITY_STORAGE_KEY = 'electromart_emi_eligibility_v1';
  var MANDATES_STORAGE_KEY = 'electromart_emi_mandates_v1';
  var AUDIT_STORAGE_KEY = 'electromart_emi_audit_v1';
  var ANCHOR_STORAGE_KEY = 'electromart_emi_anchor_v1';
  var LANGUAGE_STORAGE_KEYS = ['electromart_lang_v1', 'electromart_lang'];

  var MAX_SAVED_CALCULATIONS = 12;
  var MAX_MANDATES = 12;
  var MAX_AUDIT_ROWS = 24;

  /* ---------------------------------------------------------------------
   * The plain numbers: every rate, band and limit in one place
   * ------------------------------------------------------------------- */
  var MIN_PRINCIPAL = 10000;
  var MAX_PRINCIPAL = 10000000;
  var MAX_RATE_PERCENT = 48;
  var SUPPORTED_TENURES = [3, 6, 9, 12, 18, 24];
  var DEFAULT_TENURE = 9;

  // Rates are held in hundredths of a percent so an adjustment never drifts
  // through a float. 1350 means 13.50%.
  var RATE_SCALE = 100;

  /* Tenure discount, in hundredths of a percent. A longer commitment is
     priced lower, which is how these products are actually sold. */
  var TENURE_DISCOUNT = {
    3: 150, 6: 75, 9: 25, 12: 0, 18: -25, 24: -50
  };

  /* Principal adjustment, in hundredths of a percent. Larger tickets carry a
     small reduction; small ones pay to borrow. */
  function principalAdjustment(principal) {
    if (principal >= 200000) return -50;
    if (principal >= 100000) return -25;
    if (principal >= 50000) return 0;
    return 75;
  }

  /* Partner banks. These are illustrative example offers: the figures below are
     what a sample plan looks like, not a rate card, and the page says so
     wherever it shows one. Approval and the rate on an account are the bank's. */
  var BANKS = [
    { code: 'HDFC', name: 'HDFC Bank', baseRateHundredths: 1350, processingFee: 350, maxTenure: 24, minPrincipal: 10000, maxPrincipal: 2000000, zeroCostTenures: [6, 9], note: 'Familiar for salaried accounts' },
    { code: 'ICICI', name: 'ICICI Bank', baseRateHundredths: 1275, processingFee: 300, maxTenure: 24, minPrincipal: 15000, maxPrincipal: 2000000, zeroCostTenures: [9], note: 'Popular with salaried customers' },
    { code: 'SBI', name: 'State Bank of India', baseRateHundredths: 1325, processingFee: 250, maxTenure: 24, minPrincipal: 10000, maxPrincipal: 2500000, zeroCostTenures: [6, 9, 12], note: 'Lowest processing fee of the group' },
    { code: 'AXIS', name: 'Axis Bank', baseRateHundredths: 1400, processingFee: 400, maxTenure: 24, minPrincipal: 15000, maxPrincipal: 1500000, zeroCostTenures: [9], note: 'Longest tenure on high tickets' },
    { code: 'KOTAK', name: 'Kotak Mahindra Bank', baseRateHundredths: 1375, processingFee: 350, maxTenure: 18, minPrincipal: 20000, maxPrincipal: 1000000, zeroCostTenures: [6], note: 'Six-month zero-cost window' },
    { code: 'PNB', name: 'Punjab National Bank', baseRateHundredths: 1250, processingFee: 200, maxTenure: 18, minPrincipal: 10000, maxPrincipal: 750000, zeroCostTenures: [12], note: 'Lowest base rate of the group' }
  ];
  var BANK_CODES = BANKS.map(function (bank) { return bank.code; });

  /* The selection value that means "show me the cheapest". */
  var COMPARE_ALL = 'ALL';

  var FREQUENCIES = { monthly: true, quarterly: true };
  var MANDATE_STATES = ['active', 'paused', 'cancelled'];

  /* Eligibility bands for the indicative limit, in rupees. The limit is derived
     from the PAN by hash, never from a random source, so the same PAN always
     lands on the same figure. */
  var CREDIT_BANDS = [
    { min: 1000000, limit: 600000 },
    { min: 750000, limit: 500000 },
    { min: 500000, limit: 400000 },
    { min: 300000, limit: 300000 },
    { min: 180000, limit: 200000 },
    { min: 100000, limit: 150000 },
    { min: 60000, limit: 120000 },
    { min: 30000, limit: 80000 },
    { min: 10000, limit: 60000 },
    { min: 0, limit: 50000 }
  ];

  /* The longest tenure whose monthly instalment still fits the limit. */
  var TENURE_LADDER = [24, 18, 12, 9, 6, 3];

  /* ---------------------------------------------------------------------
   * In-memory state
   * ------------------------------------------------------------------- */
  var memoryStorage = createMemoryStorage();
  var calculations = [];
  var eligibility = null;
  var mandates = [];
  var audit = [];
  var currentPlan = null;
  var currentOffers = [];
  // True when a partner bank's own rate is in force rather than the reader's.
  var currentUsesBankRate = false;
  var selectedBankCode = COMPARE_ALL;
  var anchorDate = '';

  /* ---------------------------------------------------------------------
   * Small utilities
   * ------------------------------------------------------------------- */
  function createMemoryStorage() {
    var values = Object.create(null);
    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(values, String(key)) ? values[String(key)] : null;
      },
      setItem: function (key, value) { values[String(key)] = String(value); },
      removeItem: function (key) { delete values[String(key)]; }
    };
  }

  function getStorage() {
    try {
      if (globalWindow && globalWindow.localStorage && typeof globalWindow.localStorage.getItem === 'function') {
        return globalWindow.localStorage;
      }
    } catch (error) {
      // Storage access can be denied by the browser; fall through.
    }
    try {
      if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
        return localStorage;
      }
    } catch (error) {
      // The global binding can also be denied.
    }
    return memoryStorage;
  }

  function readStorage(key) {
    try {
      var value = getStorage().getItem(key);
      return typeof value === 'string' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      var storage = getStorage();
      if (!storage || typeof storage.setItem !== 'function') {
        memoryStorage.setItem(key, value);
      } else {
        storage.setItem(key, value);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function parseJson(value, fallback) {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    try {
      var parsed = JSON.parse(value);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function cleanText(value, maxLength) {
    var text = value === null || value === undefined ? '' : String(value).replace(/\s+/g, ' ').trim();
    if (!maxLength || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim();
  }

  /* A blank field must fall back to its documented default, never to zero.
     Number('') is 0, which is finite, so a naive guard would pass an empty
     rate field straight through as 0% and quietly promise a plan with no
     interest at all. Anything that is not a real number reads as absent. */
  function numberOr(value, fallback) {
    if (typeof value === 'string' && !value.trim()) return fallback;
    var parsed = Number(value);
    return typeof parsed === 'number' && isFinite(parsed) ? parsed : fallback;
  }

  function roundHalfUp(value) {
    // Nudge by a hair before flooring so a figure such as 2.675, which binary
    // floating point stores just below itself, rounds the way a person expects.
    return Math.floor(value * 100 + 0.5 + Number.EPSILON * Math.abs(value * 100)) / 100;
  }

  function roundWholeRupees(value) {
    return Math.floor(value + 0.5);
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, String(key));
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function byId(id) {
    if (!doc || typeof doc.getElementById !== 'function') return null;
    try {
      return doc.getElementById(id);
    } catch (error) {
      return null;
    }
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = value;
  }

  function show(node, visible) {
    if (node) node.hidden = !visible;
  }

  function hasMethod(value, method) {
    return Boolean(value && typeof value[method] === 'function');
  }

  function formatNumber(value) {
    var amount = Math.max(0, numberOr(value, 0));
    try {
      if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
      }
    } catch (error) {
      // Fall through to the lightweight formatter.
    }
    return String(roundWholeRupees(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function money(value) {
    return '₹' + formatNumber(value);
  }

  function interpolate(template, replacements) {
    return String(template).replace(/\{(\w+)\}/g, function (match, token) {
      return hasOwn(replacements, token) ? String(replacements[token]) : match;
    });
  }

  function padTwo(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function formatIso(year, month, day) {
    return String(year) + '-' + padTwo(month) + '-' + padTwo(day);
  }

  /* Masks an identifier down to its last few characters. Anything a person
     needs in order to recognise their own record, and nothing more. */
  function tailOf(value, keep) {
    var text = cleanText(value, 40);
    if (text.length <= keep) return text;
    return text.slice(text.length - keep);
  }

  /* ---------------------------------------------------------------------
   * Calendar arithmetic
   * ------------------------------------------------------------------- *
   * Days-from-civil and its inverse, using integer maths only. This keeps due
   * dates independent of the system clock, of leap-second drift and of whatever
   * timezone the browser is in: an instalment falls on the same calendar day in
   * every city, which is exactly what a repayment date has to do. */

  function daysFromCivil(year, month, day) {
    var y = year - (month <= 2 ? 1 : 0);
    var era = Math.floor((y >= 0 ? y : y - 399) / 400);
    var yearOfEra = y - era * 400;
    var dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
    var dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
    return era * 146097 + dayOfEra - 719468;
  }

  function civilFromDays(days) {
    var z = days + 719468;
    var era = Math.floor((z >= 0 ? z : z - 146096) / 146097);
    var dayOfEra = z - era * 146097;
    var yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
    var year = yearOfEra + era * 400;
    var dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
    var monthPrime = Math.floor((5 * dayOfYear + 2) / 153);
    var day = dayOfYear - Math.floor((153 * monthPrime + 2) / 5) + 1;
    var month = monthPrime + (monthPrime < 10 ? 3 : -9);
    return { year: year + (month <= 2 ? 1 : 0), month: month, day: day };
  }

  var ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

  function parseIsoDate(value) {
    var match = ISO_PATTERN.exec(cleanText(value, 10));
    if (!match) return null;
    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    // Round-trip the date so an impossible one such as 2026-02-30 is refused.
    var civil = civilFromDays(daysFromCivil(year, month, day));
    if (civil.year !== year || civil.month !== month || civil.day !== day) return null;
    return { year: year, month: month, day: day };
  }

  function daysInMonth(year, month) {
    var nextYear = month === 12 ? year + 1 : year;
    var nextMonth = month === 12 ? 1 : month + 1;
    return daysFromCivil(nextYear, nextMonth, 1) - daysFromCivil(year, month, 1);
  }

  /* Instalment k falls on the same day of the month, k months after the start.
     Where the target month is short the day is pulled back to that month's
     length, so a plan starting on the 31st still collects every month. */
  function addMonthsIso(iso, count) {
    var civil = parseIsoDate(iso);
    if (!civil) return '';
    var total = (civil.year * 12) + (civil.month - 1) + count;
    var year = Math.floor(total / 12);
    var month = (total % 12) + 1;
    var day = Math.min(civil.day, daysInMonth(year, month));
    return formatIso(year, month, day);
  }

  function formatIsoOf(value) {
    var civil = parseIsoDate(value);
    return civil ? formatIso(civil.year, civil.month, civil.day) : '';
  }

  /* ---------------------------------------------------------------------
   * Deterministic identifiers
   * ------------------------------------------------------------------- *
   * A mandate identifier is a hash of the instruction it stands for, never a
   * counter and never a clock reading. Setting up the same mandate twice
   * therefore resolves to the same identifier, which is what stops two live
   * collections being raised against one account. */
  var CODE_ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  var CODE_LENGTH = 6;

  function hashString(input) {
    var hash = 2166136261;
    var text = String(input);
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function buildReference(prefix, seed) {
    var token = '';
    var state = hashString(seed);
    for (var index = 0; index < CODE_LENGTH; index += 1) {
      state = hashString('EM|EMI|' + prefix + '|' + state + '|' + index + '|' + seed);
      token += CODE_ALPHABET.charAt(state % CODE_ALPHABET.length);
    }
    return prefix + token;
  }

  /* ---------------------------------------------------------------------
   * Language
   * ------------------------------------------------------------------- *
   * The shared translator falls back to "hi" when no preference is stored and
   * paints the static data-i18n chrome in that language. This page resolves the
   * same key with the same default, or a first-time visitor would see a page
   * that is half-Hindi and half-English. Both storage keys are always written
   * together so every page in the storefront agrees. */
  var DEFAULT_LANGUAGE = 'hi';
  var RTL_LANGUAGES = ['ur'];

  function readStoredLanguage() {
    for (var index = 0; index < LANGUAGE_STORAGE_KEYS.length; index += 1) {
      var stored = readStorage(LANGUAGE_STORAGE_KEYS[index]);
      if (stored) return String(stored).toLowerCase();
    }
    return DEFAULT_LANGUAGE;
  }

  function syncDocumentLanguage(language) {
    var documentNode = typeof document !== 'undefined' ? document.documentElement : null;
    if (!documentNode || !hasMethod(documentNode, 'setAttribute')) return language;
    try {
      documentNode.setAttribute('lang', language);
      documentNode.setAttribute('dir', RTL_LANGUAGES.indexOf(language) !== -1 ? 'rtl' : 'ltr');
    } catch (error) {
      // A missing document element is the only realistic failure and is harmless.
    }
    return language;
  }

  function syncLanguageStorage() {
    var language = readStoredLanguage();
    LANGUAGE_STORAGE_KEYS.forEach(function (key) {
      if (readStorage(key) !== language) writeStorage(key, language);
    });
    syncDocumentLanguage(language);
    return language;
  }

  function text(key, fallback) {
    var dictionaries = root.EM_TRANSLATIONS || {};
    var language = readStoredLanguage();
    var dictionary = dictionaries[language] || dictionaries.en || {};
    return dictionary[key] || fallback || key;
  }

  function refreshStaticTranslations() {
    if (hasMethod(root, 'applyGlobalThemeTranslation')) {
      try {
        root.applyGlobalThemeTranslation();
      } catch (error) {
        // The translation bus is optional in lightweight hosts.
      }
    }
  }

  /* ---------------------------------------------------------------------
   * Engine: EMI calculator
   * ------------------------------------------------------------------- *
   * Standard reducing balance. The monthly instalment is returned unrounded so
   * that totalAmount is exactly monthlyInstallment x tenureMonths, which is the
   * identity a borrower is entitled to check. Whole-rupee figures for display
   * are derived separately, and the residual is placed on the final instalment
   * so the slips still add up to the total instead of quietly losing a rupee. */
  function calculateEMI(input) {
    var safeInput = input && typeof input === 'object' ? input : {};

    var principal = numberOr(safeInput.principal, 0);
    if (!isFinite(principal)) principal = 0;
    principal = Math.max(0, principal);

    var annualRate = numberOr(safeInput.annualRate, 0);
    if (!isFinite(annualRate)) annualRate = 0;
    annualRate = clamp(annualRate, 0, MAX_RATE_PERCENT);

    var tenureMonths = roundWholeRupees(numberOr(safeInput.tenureMonths, DEFAULT_TENURE));
    if (!isFinite(tenureMonths)) tenureMonths = DEFAULT_TENURE;
    tenureMonths = clamp(tenureMonths, 1, 60);

    var monthlyRate = annualRate / 12 / 100;

    var monthlyInstallment;
    if (monthlyRate === 0) {
      monthlyInstallment = principal / tenureMonths;
    } else {
      var growth = Math.pow(1 + monthlyRate, tenureMonths);
      monthlyInstallment = (principal * monthlyRate * growth) / (growth - 1);
    }
    if (!isFinite(monthlyInstallment) || monthlyInstallment < 0) monthlyInstallment = 0;

    // Computed as the product itself rather than principal + interest, so the
    // two are bit-identical and the identity above holds exactly.
    var totalAmount = monthlyInstallment * tenureMonths;
    var totalInterest = Math.max(0, totalAmount - principal);

    var installmentRounded = roundWholeRupees(monthlyInstallment);
    var lastInstallment = totalAmount - (installmentRounded * (tenureMonths - 1));

    return {
      principal: principal,
      annualRate: annualRate,
      monthlyRate: monthlyRate,
      tenureMonths: tenureMonths,
      monthlyInstallment: monthlyInstallment,
      totalInterest: totalInterest,
      totalAmount: totalAmount,
      installmentRounded: installmentRounded,
      lastInstallment: lastInstallment,
      currency: 'INR'
    };
  }

  /* Builds the repayment plan: one entry per collection, with the residual
     riding on the final instalment so the slips sum to the total exactly. */
  function buildRepaymentPlan(emi, startDate) {
    var plan = emi && emi.tenureMonths ? emi : calculateEMI(emi);
    var start = formatIsoOf(startDate) || anchorDate;
    var slips = [];
    for (var index = 1; index <= plan.tenureMonths; index += 1) {
      var isLast = index === plan.tenureMonths;
      slips.push({
        sequence: index,
        dueDate: addMonthsIso(start, index),
        amount: isLast ? plan.lastInstallment : plan.installmentRounded,
        isLast: isLast
      });
    }
    return slips;
  }

  /* ---------------------------------------------------------------------
   * Engine: partner bank offers
   * ------------------------------------------------------------------- *
   * Pure, and a function of the principal and the tenure only. The effective
   * rate is built from a base rate, a tenure discount and a size adjustment, all
   * held as integer hundredths of a percent so no rate drifts through a float. */
  function effectiveRateHundredths(bank, principal, tenureMonths) {
    var discount = hasOwn(TENURE_DISCOUNT, tenureMonths) ? TENURE_DISCOUNT[tenureMonths] : 0;
    var total = bank.baseRateHundredths - discount + principalAdjustment(principal);
    return Math.max(0, total);
  }

  function bankAccepts(bank, principal, tenureMonths) {
    return principal >= bank.minPrincipal && principal <= bank.maxPrincipal && tenureMonths <= bank.maxTenure;
  }

  function getBankOffers(input) {
    var safeInput = input && typeof input === 'object' ? input : {};

    var principal = numberOr(safeInput.principal, 0);
    if (!isFinite(principal)) principal = 0;
    principal = Math.max(0, principal);

    var tenureMonths = roundWholeRupees(numberOr(safeInput.tenureMonths, DEFAULT_TENURE));
    if (!isFinite(tenureMonths)) tenureMonths = DEFAULT_TENURE;
    tenureMonths = SUPPORTED_TENURES.indexOf(tenureMonths) === -1 ? DEFAULT_TENURE : tenureMonths;

    var offers = [];
    for (var index = 0; index < BANKS.length; index += 1) {
      var bank = BANKS[index];
      if (!bankAccepts(bank, principal, tenureMonths)) continue;

      var rateHundredths = effectiveRateHundredths(bank, principal, tenureMonths);
      var emi = calculateEMI({ principal: principal, annualRate: rateHundredths / RATE_SCALE, tenureMonths: tenureMonths });

      // A zero-cost plan is one where the bank waives the interest for this
      // ticket size at this tenure. It is never interest-free: the processing
      // fee still applies, and the offer always shows it.
      var zeroCostEligible = bank.zeroCostTenures.indexOf(tenureMonths) !== -1 && principal >= 30000;

      offers.push({
        bankCode: bank.code,
        bankName: bank.name,
        effectiveRate: rateHundredths / RATE_SCALE,
        processingFee: bank.processingFee,
        processingFeeWithTax: roundWholeRupees(bank.processingFee * 1.18),
        zeroCostEligible: zeroCostEligible,
        monthlyInstallment: emi.monthlyInstallment,
        installmentRounded: emi.installmentRounded,
        lastInstallment: emi.lastInstallment,
        totalInterest: emi.totalInterest,
        totalAmount: emi.totalAmount,
        // What the plan costs beyond the interest, which is the honest
        // comparison against the rate a borrower is really paying.
        costOnZeroCost: roundWholeRupees(bank.processingFee * 1.18),
        tenureMonths: tenureMonths,
        maxTenure: bank.maxTenure,
        minPrincipal: bank.minPrincipal,
        maxPrincipal: bank.maxPrincipal,
        note: bank.note,
        currency: 'INR'
      });
    }

    // Cheapest rate first. A stable secondary key keeps the order fixed when
    // two banks quote the same figure, so the list never reshuffles itself.
    offers.sort(function (left, right) {
      if (left.effectiveRate !== right.effectiveRate) return left.effectiveRate - right.effectiveRate;
      if (left.processingFee !== right.processingFee) return left.processingFee - right.processingFee;
      return left.bankCode < right.bankCode ? -1 : (left.bankCode > right.bankCode ? 1 : 0);
    });
    return offers;
  }

  function getBankByCode(code) {
    var normalized = cleanText(code, 12).toUpperCase();
    for (var index = 0; index < BANKS.length; index += 1) {
      if (BANKS[index].code === normalized) return BANKS[index];
    }
    return null;
  }

  /* ---------------------------------------------------------------------
   * Engine: eligibility
   * ------------------------------------------------------------------- *
   * Format and plausibility only. Nothing here contacts a bureau or a bank.
   * The indicative limit is derived from the PAN by hash, so the same PAN always
   * lands on the same band, and the PAN itself is never stored. */
  var PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  var PHONE_PATTERN = /^[6-9][0-9]{9}$/;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  var IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  var ACCOUNT_PATTERN = /^[0-9]{9,18}$/;

  /* Separators are stripped before the length cap is applied, not after.
     Someone reading a PAN off a card types "ABCDE 1234 F", which is twelve
     characters; capping first would cut it to "ABCDE 1234" and then report the
     PAN as malformed when every character they typed was correct. */
  function normalizePan(value) {
    return String(value === null || value === undefined ? '' : value)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);
  }

  function normalizePhone(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/[^0-9]/g, '')
      .slice(0, 10);
  }

  /* Same rule for the bank details: strip what a person would type to make the
     number readable, then cap, so "HDFC 0001234" and "5010 0123 4567 89" are
     understood rather than truncated into something that fails the pattern. */
  function normalizeIfsc(value) {
    return String(value === null || value === undefined ? '' : value)
      .toUpperCase()
      .replace(/\s/g, '')
      .slice(0, 11);
  }

  function normalizeAccount(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/\s/g, '')
      .slice(0, 18);
  }

  function isValidPan(value) { return PAN_PATTERN.test(normalizePan(value)); }
  function isValidPhone(value) { return PHONE_PATTERN.test(normalizePhone(value)); }
  function isValidEmail(value) { return EMAIL_PATTERN.test(cleanText(value, 120)); }
  function isValidIfsc(value) { return IFSC_PATTERN.test(normalizeIfsc(value)); }
  function isValidAccount(value) { return ACCOUNT_PATTERN.test(normalizeAccount(value)); }

  function creditLimitForPan(pan) {
    var normalized = normalizePan(pan);
    if (!PAN_PATTERN.test(normalized)) return 0;
    var seed = hashString('EM|EMI|LIMIT|' + normalized);
    var band = CREDIT_BANDS[seed % CREDIT_BANDS.length];
    return band.limit;
  }

  function maxTenureFor(principal, creditLimit) {
    // The longest tenure whose instalment still sits inside the limit. This is a
    // plausible ceiling, not an approval: only the bank can approve a limit.
    var ladder = TENURE_LADDER;
    for (var index = 0; index < ladder.length; index += 1) {
      var months = ladder[index];
      var plan = calculateEMI({ principal: principal, annualRate: 13.5, tenureMonths: months });
      if (plan.monthlyInstallment <= creditLimit / 2) return months;
    }
    return ladder[ladder.length - 1];
  }

  function checkEMIEligibility(input) {
    var safeInput = input && typeof input === 'object' ? input : {};

    var pan = normalizePan(safeInput.pan);
    var phone = normalizePhone(safeInput.phone);
    var email = cleanText(safeInput.email, 120);
    var amount = numberOr(safeInput.amount, 0);
    if (!isFinite(amount)) amount = 0;
    amount = Math.max(0, amount);

    var panOk = PAN_PATTERN.test(pan);
    var phoneOk = PHONE_PATTERN.test(phone);
    var emailOk = EMAIL_PATTERN.test(email);
    var amountOk = amount >= MIN_PRINCIPAL && amount <= MAX_PRINCIPAL;

    var creditLimit = creditLimitForPan(pan);
    var withinLimit = amountOk && amount <= creditLimit;
    var eligible = panOk && phoneOk && emailOk && withinLimit;

    // Always a positive tenure, even when nothing validates, because a zero
    // here would read as "no plan at all" rather than "no plan was matched".
    var maxTenure = eligible ? maxTenureFor(amount, creditLimit) : Math.min(DEFAULT_TENURE, TENURE_LADDER[TENURE_LADDER.length - 1]);
    if (!isFinite(maxTenure) || maxTenure <= 0) maxTenure = DEFAULT_TENURE;

    var checks = [
      { key: 'emi_check_pan', ok: panOk },
      { key: 'emi_check_phone', ok: phoneOk },
      { key: 'emi_check_email', ok: emailOk },
      { key: 'emi_check_amount', ok: amountOk },
      { key: 'emi_check_limit', ok: withinLimit }
    ];

    return {
      eligible: eligible,
      creditLimit: Math.max(0, creditLimit),
      maxTenure: maxTenure,
      amount: amount,
      panLastFour: pan ? tailOf(pan, 4) : '',
      checks: checks,
      reasonKey: eligible
        ? 'emi_eligibility_yes'
        : (!panOk ? 'emi_eligibility_bad_pan'
          : !phoneOk ? 'emi_eligibility_bad_phone'
            : !emailOk ? 'emi_eligibility_bad_email'
              : !amountOk ? 'emi_eligibility_bad_amount'
                : 'emi_eligibility_over_limit'),
      reason: text(
        eligible ? 'emi_eligibility_yes'
          : (!panOk ? 'emi_eligibility_bad_pan'
            : !phoneOk ? 'emi_eligibility_bad_phone'
              : !emailOk ? 'emi_eligibility_bad_email'
                : !amountOk ? 'emi_eligibility_bad_amount'
                  : 'emi_eligibility_over_limit'),
        eligible ? 'Your details pass the format and plausibility checks.' : 'One or more details did not pass.'
      )
    };
  }

  /* ---------------------------------------------------------------------
   * Engine: auto-deduction mandate
   * ------------------------------------------------------------------- *
   * Pure by design. It reports what a mandate instruction would look like; it
   * neither reads nor writes the ledger. That keeps the identifier stable for
   * the same instruction, and means the full account number is used to derive
   * the hash and then immediately discarded. */
  function setupEMIMandate(input) {
    var safeInput = input && typeof input === 'object' ? input : {};

    var bankCode = cleanText(safeInput.bankCode, 12).toUpperCase();
    var accountNumber = normalizeAccount(safeInput.accountNumber);
    var ifsc = normalizeIfsc(safeInput.ifsc);
    var frequency = cleanText(safeInput.frequency, 12).toLowerCase();
    var maxAmount = numberOr(safeInput.maxAmount, 0);
    if (!isFinite(maxAmount)) maxAmount = 0;

    var refuse = function (reasonKey, reason) {
      return { success: false, mandateId: '', status: '', bankCode: bankCode, reasonKey: reasonKey, reason: reason };
    };

    var bank = getBankByCode(bankCode);
    if (!bank) {
      return refuse('emi_mandate_bad_bank', text('emi_mandate_bad_bank', 'Choose one of the partner banks listed above.'));
    }
    if (!isValidAccount(accountNumber)) {
      return refuse('emi_mandate_bad_account', text('emi_mandate_bad_account', 'An account number is nine to eighteen digits.'));
    }
    if (!isValidIfsc(ifsc)) {
      return refuse('emi_mandate_bad_ifsc', text('emi_mandate_bad_ifsc', 'An IFSC code is four letters, a zero, then six letters or digits.'));
    }
    if (!(maxAmount > 0) || maxAmount > MAX_PRINCIPAL) {
      return refuse('emi_mandate_bad_amount', text('emi_mandate_bad_amount', 'Set a collection ceiling above zero.'));
    }
    if (!hasOwn(FREQUENCIES, frequency)) {
      return refuse('emi_mandate_bad_frequency', text('emi_mandate_bad_frequency', 'Choose monthly or quarterly collection.'));
    }
    // The first four characters of an IFSC are the bank code, so a mismatch
    // between the two fields means the account cannot belong to that bank.
    if (ifsc.slice(0, 4) !== bank.code) {
      return refuse('emi_mandate_bank_mismatch', text('emi_mandate_bank_mismatch', 'Those account details do not belong to the bank you chose.'));
    }

    // The account number is hashed and then dropped: it is never stored, never
    // returned and never displayed in full.
    var mandateId = buildReference('EM-MND-', [
      bank.code, ifsc, accountNumber, maxAmount, frequency
    ].join('|'));

    return {
      success: true,
      mandateId: mandateId,
      status: 'active',
      bankCode: bank.code,
      bankName: bank.name,
      accountLastFour: tailOf(accountNumber, 4),
      accountMasked: '••••••' + tailOf(accountNumber, 4),
      ifsc: ifsc,
      maxAmount: maxAmount,
      frequency: frequency,
      createdOn: anchorDate,
      reasonCode: ''
    };
  }

  function mandateAction(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var mandateId = cleanText(safeInput.mandateId, 40).toUpperCase();
    var action = cleanText(safeInput.action, 20).toLowerCase();
    var states = { pause: 'paused', resume: 'active', cancel: 'cancelled' };

    if (!hasOwn(states, action)) {
      return {
        success: false, mandateId: mandateId, action: action, status: '',
        reasonKey: 'emi_mandate_unknown_action',
        reason: text('emi_mandate_unknown_action', 'That action is not one this hub can perform.')
      };
    }
    // Closing a mandate gives the ceiling back; pausing holds it.
    return {
      success: true,
      mandateId: mandateId,
      action: action,
      status: states[action],
      keepsCeiling: action !== 'cancel',
      reasonCode: action
    };
  }

  /* ---------------------------------------------------------------------
   * Ledger persistence
   * ------------------------------------------------------------------- */
  function sanitizeCalculation(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var plan = calculateEMI(raw);
    return {
      principal: plan.principal,
      annualRate: plan.annualRate,
      tenureMonths: plan.tenureMonths,
      monthlyInstallment: plan.monthlyInstallment,
      totalInterest: plan.totalInterest,
      totalAmount: plan.totalAmount,
      bankCode: cleanText(raw.bankCode, 12).toUpperCase(),
      savedOn: formatIsoOf(raw.savedOn)
    };
  }

  function loadCalculations() {
    var parsed = parseJson(readStorage(CALCULATIONS_STORAGE_KEY), []);
    calculations = Array.isArray(parsed) ? parsed.map(sanitizeCalculation).filter(Boolean).slice(0, MAX_SAVED_CALCULATIONS) : [];
    return calculations;
  }

  function saveCalculations() {
    var payload = calculations.slice(0, MAX_SAVED_CALCULATIONS).map(function (entry) {
      var copy = {};
      Object.keys(entry).forEach(function (key) { copy[key] = entry[key]; });
      return copy;
    });
    var ok = writeStorage(CALCULATIONS_STORAGE_KEY, JSON.stringify(payload));
    if (ok) calculations = payload;
    return ok;
  }

  function recordCalculation(plan, bankCode) {
    var entry = sanitizeCalculation({
      principal: plan.principal,
      annualRate: plan.annualRate,
      tenureMonths: plan.tenureMonths,
      bankCode: bankCode,
      savedOn: anchorDate
    });
    if (!entry) return null;
    // Replace a matching row rather than stacking duplicates, so repeatedly
    // pressing the button does not fill the ledger with identical plans.
    calculations = calculations.filter(function (existing) {
      return !(existing.principal === entry.principal && existing.tenureMonths === entry.tenureMonths && existing.annualRate === entry.annualRate && existing.bankCode === entry.bankCode);
    });
    calculations.unshift(entry);
    saveCalculations();
    return entry;
  }

  /* The stored verdict keeps no PAN, phone or email: only the outcome and the
     last four characters needed to recognise it. */
  function saveEligibility(result) {
    eligibility = {
      eligible: Boolean(result.eligible),
      creditLimit: Math.max(0, numberOr(result.creditLimit, 0)),
      maxTenure: Math.max(0, numberOr(result.maxTenure, DEFAULT_TENURE)),
      amount: Math.max(0, numberOr(result.amount, 0)),
      panLastFour: cleanText(result.panLastFour, 4),
      reasonKey: cleanText(result.reasonKey, 40),
      // The reason code is the durable fact; the sentence beside it is resolved
      // from the live dictionary at render time, so a verdict written in one
      // language still reads correctly after a switch. The checks are booleans
      // and dictionary keys only, so persisting them reveals nothing.
      checks: Array.isArray(result.checks) ? result.checks.map(function (check) {
        return { key: cleanText(check.key, 40), ok: Boolean(check.ok) };
      }) : [],
      checkedOn: anchorDate
    };
    writeStorage(ELIGIBILITY_STORAGE_KEY, JSON.stringify(eligibility));
    return eligibility;
  }

  function loadEligibility() {
    var parsed = parseJson(readStorage(ELIGIBILITY_STORAGE_KEY), null);
    eligibility = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    if (eligibility) {
      eligibility.eligible = Boolean(eligibility.eligible);
      eligibility.creditLimit = Math.max(0, numberOr(eligibility.creditLimit, 0));
      eligibility.maxTenure = Math.max(1, roundWholeRupees(numberOr(eligibility.maxTenure, DEFAULT_TENURE)));
    }
    return eligibility;
  }

  function sanitizeMandate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var id = cleanText(raw.mandateId, 40).toUpperCase();
    if (id.indexOf('EM-MND-') !== 0) return null;
    var status = MANDATE_STATES.indexOf(raw.status) === -1 ? 'active' : raw.status;
    return {
      mandateId: id,
      bankCode: cleanText(raw.bankCode, 12).toUpperCase(),
      bankName: cleanText(raw.bankName, 60) || (getBankByCode(raw.bankCode) || {}).name || '',
      accountMasked: cleanText(raw.accountMasked, 20),
      ifsc: cleanText(raw.ifsc, 11).toUpperCase(),
      maxAmount: Math.max(0, numberOr(raw.maxAmount, 0)),
      frequency: hasOwn(FREQUENCIES, raw.frequency) ? raw.frequency : 'monthly',
      status: status,
      createdOn: formatIsoOf(raw.createdOn)
    };
  }

  function loadMandates() {
    var parsed = parseJson(readStorage(MANDATES_STORAGE_KEY), []);
    mandates = Array.isArray(parsed) ? parsed.map(sanitizeMandate).filter(Boolean).slice(0, MAX_MANDATES) : [];
    return mandates;
  }

  function saveMandates() {
    var payload = mandates.slice(0, MAX_MANDATES).map(function (entry) {
      var copy = {};
      Object.keys(entry).forEach(function (key) { copy[key] = entry[key]; });
      return copy;
    });
    var ok = writeStorage(MANDATES_STORAGE_KEY, JSON.stringify(payload));
    if (ok) mandates = payload;
    return ok;
  }

  function upsertMandate(mandate) {
    if (!mandate || !mandate.success) return null;
    for (var index = 0; index < mandates.length; index += 1) {
      if (mandates[index].mandateId === mandate.mandateId) {
        var previousStatus = mandates[index].status;
        var previousCeiling = mandates[index].maxAmount;
        mandates[index].maxAmount = mandate.maxAmount;
        mandates[index].frequency = mandate.frequency;
        mandates[index].status = 'active';
        if (!saveMandates()) {
          mandates[index].status = previousStatus;
          mandates[index].maxAmount = previousCeiling;
          return null;
        }
        return mandates[index];
      }
    }
    if (mandates.length >= MAX_MANDATES) mandates = mandates.slice(1);
    var record = sanitizeMandate(mandate);
    if (!record) return null;
    mandates.unshift(record);
    if (!saveMandates()) {
      mandates.shift();
      return null;
    }
    return record;
  }

  function loadAudit() {
    var parsed = parseJson(readStorage(AUDIT_STORAGE_KEY), []);
    audit = Array.isArray(parsed) ? parsed.filter(function (entry) {
      return entry && typeof entry === 'object' && !Array.isArray(entry);
    }).slice(-MAX_AUDIT_ROWS) : [];
    return audit;
  }

  function saveAudit() {
    writeStorage(AUDIT_STORAGE_KEY, JSON.stringify(audit.slice(-MAX_AUDIT_ROWS)));
  }

  function recordAudit(row) {
    audit.push({ mandateId: row.mandateId, action: row.action, status: row.status, reasonCode: row.reasonCode || '', sequence: audit.length + 1 });
    if (audit.length > MAX_AUDIT_ROWS) audit = audit.slice(-MAX_AUDIT_ROWS);
    saveAudit();
    return row;
  }

  function applyMandateAction(input) {
    var result = mandateAction(input);
    if (!result.success) return result;
    for (var index = 0; index < mandates.length; index += 1) {
      if (mandates[index].mandateId !== result.mandateId) continue;
      var previous = mandates[index].status;
      mandates[index].status = result.status;
      if (!saveMandates()) {
        mandates[index].status = previous;
        return {
          success: false, mandateId: result.mandateId, action: result.action, status: previous,
          reasonKey: 'emi_storage_error',
          reason: text('emi_storage_error', 'We could not save that change on this device. Please try again.')
        };
      }
      recordAudit(result);
      render();
      return result;
    }
    return {
      success: false, mandateId: result.mandateId, action: result.action, status: '',
      reasonKey: 'emi_mandate_unknown_mandate',
      reason: text('emi_mandate_unknown_mandate', 'No mandate with that identifier is stored on this device.')
    };
  }

  /* ---------------------------------------------------------------------
   * Catalogue eligibility
   * ------------------------------------------------------------------- *
   * A product can run on a plan when it has a rupee price at or above the
   * plan minimum. Below that, spreading the cost over nine months costs more in
   * interest than it saves in convenience, so the page says so rather than
   * offering it. */
  function resolveProductTitle(product) {
    if (!product) return '';
    // Some catalogue entries carry a localised title object rather than a
    // plain name, so resolve it against the active language before trimming.
    if (product.title && typeof product.title === 'object') {
      var language = readStoredLanguage();
      var localized = cleanText(product.title[language] || product.title.en || '', 120);
      if (localized) return localized;
    }
    return cleanText(product.name, 120) || cleanText(product.title, 120);
  }

  function resolveProductArt(product) {
    var signal = [product && product.category, product && product.name].filter(Boolean).join(' ').toLowerCase();
    if (/laptop|desktop|computer/.test(signal)) return 'device';
    if (/mobile|phone|smartphone/.test(signal)) return 'phone';
    if (/tv|home-cinema|television/.test(signal)) return 'screen';
    if (/audio|speaker|headphone|earbud/.test(signal)) return 'audio';
    if (/battery|power|charger|adapter/.test(signal)) return 'power';
    return 'chip';
  }

  function isEmiEligible(product) {
    var price = numberOr(product && product.price, 0);
    return price >= MIN_PRINCIPAL && price <= MAX_PRINCIPAL;
  }

  function getEmiProducts() {
    var catalog = Array.isArray(root.EM_CATALOG) ? root.EM_CATALOG : [];
    var eligible = [];
    for (var index = 0; index < catalog.length; index += 1) {
      var product = catalog[index];
      if (!product || !product.id || !isEmiEligible(product)) continue;
      var price = numberOr(product.price, 0);
      var plan = calculateEMI({ principal: price, annualRate: 13.5, tenureMonths: DEFAULT_TENURE });
      eligible.push({
        id: String(product.id),
        name: resolveProductTitle(product),
        brand: cleanText(product.brand, 40),
        category: cleanText(product.category, 40),
        price: price,
        art: resolveProductArt(product),
        fromMonthly: plan.installmentRounded,
        tenureMonths: DEFAULT_TENURE
      });
    }
    return eligible;
  }

  function artMarkup(art) {
    var variant = cleanText(art, 16) || 'chip';
    return '<span class="emi-art emi-art--' + escapeHtml(variant) + '" aria-hidden="true">' +
      '<span class="art-shell"></span><span class="art-screen"></span><span class="art-plate"></span>' +
      '<span class="art-port"></span><span class="art-dot"></span>' +
      '</span>';
  }

  /* ---------------------------------------------------------------------
   * The one clock read
   * ------------------------------------------------------------------- *
   * It decides nothing about a rate, a fee, a limit or an identifier: it only
   * decides which future date instalment numbering starts from. */
  function readTodayIso() {
    var now = new Date();
    return formatIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function readAnchorDate() {
    var stored = formatIsoOf(readStorage(ANCHOR_STORAGE_KEY));
    if (stored) return stored;
    return '2026-01-01';
  }

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */
  function setStatus(message, tone, targetId) {
    var node = byId(targetId);
    if (!node) return;
    node.textContent = message;
    node.setAttribute('data-tone', tone || 'idle');
    node.hidden = !message;
  }

  /* Moves keyboard focus to a freshly written status line so assistive tech
     announces the outcome instead of leaving focus on a submit button. */
  function focusStatus(targetId) {
    var node = byId(targetId);
    if (!node || !hasMethod(node, 'focus')) return;
    try {
      node.focus();
    } catch (error) {
      // Focus is a progressive enhancement; storage and rendering already worked.
    }
  }

  function tenureLabel(months) {
    var value = roundWholeRupees(numberOr(months, 0));
    return interpolate(text('emi_tenure_months', '{count} months'), { count: formatNumber(value) });
  }

  function renderResultCard(plan, offer) {
    if (!plan) return null;
    setText('emiMonthlyInstallment', money(plan.installmentRounded));
    setText('emiTotalInterest', money(plan.totalInterest));
    setText('emiTotalAmount', money(plan.totalAmount));
    setText('emiProcessingFee', offer ? money(offer.processingFeeWithTax) : '—');
    // Name the rate that produced the figure. Leaving the reader to guess
    // whether they are looking at their own rate or a bank's is how a
    // calculator starts quietly telling the wrong story.
    setText('emiEffectiveRate', (offer ? offer.effectiveRate : plan.annualRate).toFixed(2) + '%');
    setText('emiEffectiveRateSource', offer
      ? interpolate(text('emi_rate_from_bank', "{bank}'s rate"), { bank: offer.bankName })
      : text('emi_rate_from_you', 'your rate'));

    setText('emiFormula', interpolate(
      text('emi_formula', 'principal {principal} at {rate}% over {tenure} gives {monthly} a month'),
      {
        principal: money(plan.principal),
        rate: plan.annualRate.toFixed(2),
        tenure: formatNumber(plan.tenureMonths),
        monthly: money(plan.installmentRounded)
      }
    ));

    // The residual statement: a plan is quoted in whole rupees, and the
    // remainder lands on the final collection rather than disappearing.
    setText('emiResultNote', interpolate(
      text('emi_result_note_residual', 'Your first instalment is due one month after the plan starts. Instalments are shown in whole rupees; the final one is {last} so the slips add up to {total} exactly.'),
      { last: money(plan.lastInstallment), total: money(plan.totalAmount) }
    ));

    var stamp = byId('emiZeroCostBadge');
    if (stamp) {
      var anyZeroCost = currentOffers.some(function (entry) { return entry.zeroCostEligible; });
      stamp.setAttribute('data-tone', anyZeroCost ? 'on' : 'off');
      var stampText = stamp.querySelector ? stamp.querySelector('.emi-stamp__text') : null;
      if (stampText) {
        stampText.textContent = anyZeroCost
          ? text('emi_zero_cost_badge', 'Zero-cost EMI')
          : text('emi_zero_cost_badge_off', 'No zero-cost plan at this tenure');
      }
    }
    return plan;
  }

  function renderSlipStrip(plan) {
    var list = byId('emiSlipStrip');
    var empty = byId('emiSlipStripEmpty');
    var meta = byId('emiScheduleMeta');
    var slips = plan ? buildRepaymentPlan(plan, readTodayIso()) : [];

    if (list) {
      list.innerHTML = slips.map(function (slip, index) {
        return '<li class="emi-slip' + (slip.isLast ? ' emi-slip--last' : '') + '" style="animation-delay:' + Math.min(index * 30, 300) + 'ms">' +
          '<span class="emi-slip__seq">' + escapeHtml(interpolate(text('emi_slip_seq', 'Slip C{count}'), { count: slip.sequence })) + '</span>' +
          '<strong class="emi-slip__amount">' + escapeHtml(money(slip.amount)) + '</strong>' +
          '<span class="emi-slip__date">' + escapeHtml(slip.dueDate) + '</span>' +
          '</li>';
      }).join('');
    }
    show(empty, slips.length === 0);
    setText('emiScheduleMeta', slips.length
      ? interpolate(text('emi_schedule_meta', '{count} collections, {total} in all, first on {first}.'), {
        count: formatNumber(slips.length),
        total: money(plan.totalAmount),
        first: slips[0].dueDate
      })
      : '');
    return slips;
  }

  function renderBankOffers(offers) {
    var grid = byId('bankOffersGrid');
    var empty = byId('bankOffersEmpty');
    var skeleton = byId('bankOffersSkeleton');
    if (skeleton) skeleton.hidden = true;
    if (!grid) return offers;

    if (!offers.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      show(empty, true);
      return offers;
    }

    var tenure = offers.length ? offers[0].tenureMonths : DEFAULT_TENURE;
    grid.innerHTML = offers.map(function (offer, index) {
      var isSelected = offer.bankCode === selectedBankCode;
      var effectiveCost = offer.zeroCostEligible
        ? interpolate(text('emi_card_zero_cost', 'Fee only: {cost}'), { cost: money(offer.costOnZeroCost) })
        : interpolate(text('emi_card_with_interest', 'Interest {cost}'), { cost: money(offer.totalInterest) });
      return '<article class="emi-card' + (isSelected ? ' is-selected' : '') + '" data-emi-bank="' + escapeHtml(offer.bankCode) + '" style="animation-delay:' + Math.min(index * 60, 320) + 'ms">' +
        '<span class="emi-card__foil" aria-hidden="true"></span>' +
        '<div class="emi-card__head">' +
          '<h3 class="emi-card__bank">' + escapeHtml(offer.bankName) + '</h3>' +
          '<span class="emi-card__zc" data-zero="' + (offer.zeroCostEligible ? 'true' : 'false') + '">' +
            escapeHtml(offer.zeroCostEligible ? text('emi_zero_cost_badge', 'Zero cost') : text('emi_standard_rate_badge', 'Standard rate')) +
          '</span>' +
        '</div>' +
        '<p class="emi-card__rate emi-mono">' + escapeHtml(offer.effectiveRate.toFixed(2) + '%') + '</p>' +
        '<p class="emi-card__ratelabel">' + escapeHtml(interpolate(text('emi_card_rate_label', 'on a {tenure} plan'), { tenure: tenureLabel(tenure) })) + '</p>' +
        '<p class="emi-card__emi emi-mono">' + escapeHtml(money(offer.installmentRounded)) +
          ' <span>' + escapeHtml(interpolate(text('emi_per_month', 'a month')) ) + '</span></p>' +
        '<dl class="emi-card__specs">' +
          '<div><dt>' + escapeHtml(text('emi_card_processing_fee', 'Processing fee')) + '</dt><dd>' + escapeHtml(money(offer.processingFee)) + '</dd></div>' +
          '<div><dt>' + escapeHtml(text('emi_card_fee_with_tax', 'Fee with tax')) + '</dt><dd>' + escapeHtml(money(offer.processingFeeWithTax)) + '</dd></div>' +
          '<div><dt>' + escapeHtml(text('emi_card_total_interest', 'Total interest')) + '</dt><dd>' + escapeHtml(money(offer.totalInterest)) + '</dd></div>' +
          '<div><dt>' + escapeHtml(text('emi_card_total', 'Total payable')) + '</dt><dd>' + escapeHtml(money(offer.totalAmount)) + '</dd></div>' +
          '<div><dt>' + escapeHtml(text('emi_card_tenure_range', 'Longest tenure')) + '</dt><dd>' + escapeHtml(tenureLabel(offer.maxTenure)) + '</dd></div>' +
        '</dl>' +
        '<p class="emi-card__note">' + escapeHtml(effectiveCost + ' · ' + offer.note) + '</p>' +
        '<button type="button" class="btn-emi btn-emi--card" data-emi-pick="' + escapeHtml(offer.bankCode) + '" aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
          escapeHtml(isSelected ? text('emi_card_selected', 'Selected') : text('emi_card_select', 'Use this bank')) +
        '</button>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    show(empty, false);
    return offers;
  }

  function renderEligibility(result) {
    var idle = byId('emiEligibilityBody');
    var idleText = idle ? idle.previousElementSibling : null;
    var banner = byId('emiEligibilityBanner');
    var checks = byId('emiEligibilityChecks');

    show(idle, Boolean(result));
    if (idleText) show(idleText, !result);
    if (!result) {
      setText('emiCreditLimit', money(0));
      setText('emiMaxTenure', '—');
      setText('emiAmountRequested', money(0));
      if (checks) checks.innerHTML = '';
      return null;
    }

    if (banner) banner.setAttribute('data-tone', result.eligible ? 'yes' : 'no');
    // Resolve the headline from the stored reason code rather than from a
    // translated phrase captured at check time. A stored verdict therefore
    // survives a reload and re-reads in whatever language is now active.
    setText('emiEligibilityHeadline', text(
      result.reasonKey,
      result.eligible ? 'Your details pass the format and plausibility checks.' : 'One or more details did not pass.'
    ));
    setText('emiCreditLimit', money(result.creditLimit));
    setText('emiMaxTenure', tenureLabel(result.maxTenure));
    setText('emiAmountRequested', money(result.amount));

    if (checks) {
      checks.innerHTML = (Array.isArray(result.checks) ? result.checks : []).map(function (check) {
        return '<li data-ok="' + (check.ok ? 'true' : 'false') + '">' +
          escapeHtml(text(check.key, check.key)) +
          '</li>';
      }).join('');
    }
    return result;
  }

  function renderMandateList() {
    var list = byId('emiMandateList');
    var empty = byId('emiMandateListEmpty');
    if (!list) return mandates;
    if (!mandates.length) {
      list.innerHTML = '';
      show(empty, true);
      return mandates;
    }
    list.innerHTML = mandates.map(function (record) {
      var bank = getBankByCode(record.bankCode);
      var statusLabel = text('emi_mandate_state_' + record.status, record.status);
      var summary = interpolate(text('emi_mandate_row_meta', 'Up to {max} {frequency} from {account}'), {
        max: money(record.maxAmount),
        frequency: text(record.frequency === 'quarterly' ? 'emi_frequency_quarterly' : 'emi_frequency_monthly', record.frequency),
        account: record.accountMasked || '••••'
      });
      return '<li class="emi-mandate-row" data-status="' + escapeHtml(record.status) + '">' +
        '<div>' +
          '<span class="emi-mandate-row__id">' + escapeHtml(record.mandateId) + '</span>' +
          '<span class="emi-mandate-row__meta">' + escapeHtml((bank ? bank.name + ' · ' : '') + record.ifsc + ' · ' + summary) + '</span>' +
        '</div>' +
        '<span class="emi-statuspill" data-status="' + escapeHtml(record.status) + '">' + escapeHtml(statusLabel) + '</span>' +
        '<div class="emi-mandate-row__actions">' +
          (record.status === 'active'
            ? '<button type="button" class="btn-emi btn-emi--quiet" data-emi-action="pause" data-emi-id="' + escapeHtml(record.mandateId) + '">' + escapeHtml(text('emi_mandate_pause_btn', 'Pause')) + '</button>'
            : '<button type="button" class="btn-emi btn-emi--quiet" data-emi-action="resume" data-emi-id="' + escapeHtml(record.mandateId) + '">' + escapeHtml(text('emi_mandate_resume_btn', 'Resume')) + '</button>') +
          (record.status === 'cancelled'
            ? ''
            : '<button type="button" class="btn-emi btn-emi--danger" data-emi-action="cancel" data-emi-id="' + escapeHtml(record.mandateId) + '">' + escapeHtml(text('emi_mandate_cancel_btn', 'Cancel')) + '</button>') +
        '</div>' +
      '</li>';
    }).join('');
    show(empty, false);
    return mandates;
  }

  function renderProducts() {
    var grid = byId('emiProductGrid');
    var empty = byId('emiProductGridEmpty');
    var skeleton = byId('emiProductSkeleton');
    if (skeleton) skeleton.hidden = true;
    var products = getEmiProducts();
    if (!grid) return products;

    if (!products.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      show(empty, true);
      return products;
    }

    grid.innerHTML = products.map(function (product, index) {
      return '<article class="emi-product" style="animation-delay:' + Math.min(index * 55, 300) + 'ms">' +
        '<div class="emi-product__art">' +
          '<span class="emi-product__stamp">' + escapeHtml(tenureLabel(product.tenureMonths)) + '</span>' +
          artMarkup(product.art) +
        '</div>' +
        '<div class="emi-product__body">' +
          '<span class="emi-product__brand">' + escapeHtml(product.brand || product.category) + '</span>' +
          '<h3>' + escapeHtml(product.name) + '</h3>' +
          '<p class="emi-product__price"><strong>' + escapeHtml(money(product.price)) + '</strong></p>' +
          '<p class="emi-product__from">' +
            escapeHtml(interpolate(text('emi_product_from', 'From {amount} a month over {tenure}.'), {
              amount: money(product.fromMonthly),
              tenure: tenureLabel(product.tenureMonths)
            })) +
          '</p>' +
        '</div>' +
        '<button type="button" class="btn-emi btn-emi--quiet" data-emi-amount="' + escapeHtml(product.price) + '">' +
          escapeHtml(text('emi_product_plan_btn', 'Plan this one')) +
        '</button>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    show(empty, false);
    return products;
  }

  /* ---------------------------------------------------------------------
   * Options and form state
   * ------------------------------------------------------------------- */
  function populateBankSelects() {
    var options = ['<option value="' + COMPARE_ALL + '">' + escapeHtml(text('emi_bank_compare_all', 'Compare all partner banks')) + '</option>']
      .concat(BANKS.map(function (bank) {
        return '<option value="' + bank.code + '">' + escapeHtml(bank.name) + '</option>';
      }))
      .join('');

    var calculatorSelect = byId('emiBankSelect');
    if (calculatorSelect) {
      calculatorSelect.innerHTML = options;
      calculatorSelect.value = selectedBankCode;
    }
    var mandateSelect = byId('emiMandateBankSelect');
    if (mandateSelect) {
      mandateSelect.innerHTML = BANKS.map(function (bank) {
        return '<option value="' + bank.code + '"' + (bank.code === selectedBankCode ? ' selected' : '') + '>' + escapeHtml(bank.name) + '</option>';
      }).join('');
      if (selectedBankCode !== COMPARE_ALL) mandateSelect.value = selectedBankCode;
    }
  }

  function readCalculatorForm() {
    var frequencylessTenure = roundWholeRupees(numberOr(readValue('emiTenureSelect'), DEFAULT_TENURE));
    if (SUPPORTED_TENURES.indexOf(frequencylessTenure) === -1) frequencylessTenure = DEFAULT_TENURE;
    return {
      principal: clamp(numberOr(readValue('emiAmountInput'), MIN_PRINCIPAL), MIN_PRINCIPAL, MAX_PRINCIPAL),
      annualRate: clamp(numberOr(readValue('emiRateInput'), 13.5), 0, MAX_RATE_PERCENT),
      tenureMonths: frequencylessTenure,
      bankCode: cleanText(readValue('emiBankSelect'), 12).toUpperCase() || COMPARE_ALL
    };
  }

  function readValue(id) {
    var node = byId(id);
    if (!node || node.value === undefined) return '';
    return cleanText(node.value, 300);
  }

  function setFormValue(id, value) {
    var node = byId(id);
    if (node && typeof node.value === 'string') node.value = value;
  }

  function setFieldError(id, message) {
    var node = byId(id);
    if (!node) return;
    node.textContent = message || '';
    show(node, Boolean(message));
    var inputId = id.replace(/Error$/, 'Input');
    var input = byId(inputId);
    if (input && hasMethod(input, 'setAttribute')) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  function clearFieldErrors() {
    ['emiPANError', 'emiPhoneError', 'emiEmailError', 'emiAccountError', 'emiIFSCError', 'emiMaxAmountError'].forEach(function (id) {
      setFieldError(id, '');
    });
  }

  /* ---------------------------------------------------------------------
   * Rendering entry point
   * ------------------------------------------------------------------- */
  function render() {
    var form = readCalculatorForm();
    var offers = getBankOffers({ principal: form.principal, tenureMonths: form.tenureMonths });
    currentOffers = offers;

    var chosen = null;
    for (var index = 0; index < offers.length; index += 1) {
      if (offers[index].bankCode === selectedBankCode) { chosen = offers[index]; break; }
    }
    // A bank that will not take this ticket cannot stay selected. Fall back to
    // the comparison view rather than to one partner, because silently
    // promoting a bank would swap the reader's own rate for a partner rate
    // without their having asked for it.
    if (!chosen && selectedBankCode !== COMPARE_ALL) {
      selectedBankCode = COMPARE_ALL;
      setFormValue('emiBankSelect', COMPARE_ALL);
    }

    // Exactly one rate is in play, and the page always says which. A partner
    // bank quotes its own rate; with the comparison option chosen the reader's
    // own rate is used, which is what makes the rate field a live control.
    var usingBankRate = Boolean(chosen);
    var rate = usingBankRate ? chosen.effectiveRate : form.annualRate;
    var plan = calculateEMI({ principal: form.principal, annualRate: rate, tenureMonths: form.tenureMonths });
    currentPlan = plan;
    currentUsesBankRate = usingBankRate;

    syncRateFieldState(usingBankRate, chosen);
    renderResultCard(plan, chosen);
    renderSlipStrip(plan);
    renderBankOffers(offers);
    // Re-reads the stored verdict through the live dictionary, so switching
    // language re-renders a verdict that was written in another one.
    renderEligibility(eligibility);
    renderMandateList();
    renderProducts();
    refreshStaticTranslations();
    return plan;
  }

  /* The rate field is never a decorative control. While a partner bank is
     quoted its own rate is in force, so the field is disabled and says so
     rather than silently disagreeing with the figure above it. */
  function syncRateFieldState(usingBankRate, chosen) {
    var field = byId('emiRateInput');
    var note = byId('emiRateState');
    if (field) field.disabled = usingBankRate;
    if (!note) return;
    note.textContent = usingBankRate
      ? interpolate(text('emi_rate_overridden', "{bank}'s own rate is in use here. Pick the comparison option to quote your own rate again."), {
        bank: chosen ? chosen.bankName : ''
      })
      : interpolate(text('emi_rate_yours', 'Your own rate, applied while you compare all partner banks.'), {});
  }

  /* ---------------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------------- */
  function handleCalculate(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = readCalculatorForm();
    if (form.principal < MIN_PRINCIPAL) {
      setStatus(interpolate(text('emi_amount_too_low', 'Enter at least {min} to run an instalment plan.'), { min: money(MIN_PRINCIPAL) }), 'warn', 'emiStatus');
      focusStatus('emiStatus');
      return null;
    }
    selectedBankCode = form.bankCode;
    var plan = render();
    recordCalculation(plan, selectedBankCode);
    if (plan) {
      var chosen = currentOffers.filter(function (offer) { return offer.bankCode === selectedBankCode; })[0];
      var line = chosen
        ? interpolate(text('emi_calculated', 'Calculated {monthly} a month over {tenure} at {bank}.'), {
          monthly: money(plan.installmentRounded),
          tenure: tenureLabel(plan.tenureMonths),
          bank: chosen.bankName
        })
        : interpolate(text('emi_calculated_yours', 'Calculated {monthly} a month over {tenure} at your own rate of {rate}%.'), {
          monthly: money(plan.installmentRounded),
          tenure: tenureLabel(plan.tenureMonths),
          rate: plan.annualRate.toFixed(2)
        });
      setStatus(line, 'success', 'emiStatus');
      focusStatus('emiStatus');
    }
    return plan;
  }

  function handleEligibilitySubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    clearFieldErrors();

    var pan = readValue('emiPANInput');
    var phone = readValue('emiPhoneInput');
    var email = readValue('emiEmailInput');

    if (!isValidPan(pan)) setFieldError('emiPANError', text('emi_pan_error', 'A PAN is five letters, then four digits, then one letter.'));
    if (!isValidPhone(phone)) setFieldError('emiPhoneError', text('emi_phone_error', 'A mobile number is ten digits starting 6 to 9.'));
    if (!isValidEmail(email)) setFieldError('emiEmailError', text('emi_email_error', 'That does not look like an email address.'));

    var principal = clamp(numberOr(readValue('emiAmountInput'), MIN_PRINCIPAL), MIN_PRINCIPAL, MAX_PRINCIPAL);
    var result = checkEMIEligibility({ pan: pan, phone: phone, email: email, amount: principal });
    saveEligibility(result);
    renderEligibility(result);
    setStatus(result.reason, result.eligible ? 'success' : 'warn', 'emiStatus');
    focusStatus('emiStatus');
    return result;
  }

  function handleMandateSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    clearFieldErrors();

    var accountNumber = readValue('emiAccountInput');
    var ifsc = readValue('emiIfscInput');
    if (!isValidAccount(accountNumber)) setFieldError('emiAccountError', text('emi_account_error', 'An account number is nine to eighteen digits.'));
    if (!isValidIfsc(ifsc)) setFieldError('emiIFSCError', text('emi_ifsc_error', 'An IFSC code is four letters, a zero, then six letters or digits.'));

    var mandate = setupEMIMandate({
      bankCode: readValue('emiMandateBankSelect'),
      accountNumber: accountNumber,
      ifsc: ifsc,
      maxAmount: numberOr(readValue('emiMaxAmountInput'), 0),
      frequency: readValue('emiFrequencySelect')
    });

    if (!mandate.success) {
      setStatus(mandate.reason, 'error', 'emiMandateStatus');
      focusStatus('emiMandateStatus');
      return mandate;
    }

    var saved = upsertMandate(mandate);
    if (!saved) {
      setStatus(text('emi_storage_error', 'We could not save that on this device. Please try again.'), 'error', 'emiMandateStatus');
      focusStatus('emiMandateStatus');
      return null;
    }
    recordAudit({ mandateId: saved.mandateId, action: 'created', status: saved.status, reasonCode: 'created' });
    render();

    setStatus(interpolate(text('emi_mandate_created', 'Mandate {id} is active with {bank}, collecting up to {max} {frequency}.'), {
      id: saved.mandateId,
      bank: saved.bankName,
      max: money(saved.maxAmount),
      frequency: text(saved.frequency === 'quarterly' ? 'emi_frequency_quarterly' : 'emi_frequency_monthly', saved.frequency)
    }), 'success', 'emiMandateStatus');
    focusStatus('emiMandateStatus');
    return mandate;
  }

  /* "Use my current calculation": fills the mandate form from the plan on
     screen, so the ceiling can never be below the instalment it has to cover. */
  function handleUseCurrentPlan() {
    if (!currentPlan) {
      setStatus(text('emi_mandate_no_plan', 'Calculate an instalment plan first, then come back here.'), 'warn', 'emiMandateStatus');
      focusStatus('emiMandateStatus');
      return null;
    }
    // Round the ceiling up so it always covers the rounded instalment.
    var ceiling = Math.ceil(currentPlan.installmentRounded / 100) * 100;
    setFormValue('emiMaxAmountInput', String(Math.max(100, ceiling)));
    setFormValue('emiFrequencySelect', 'monthly');
    // Also carry the quoted bank across, because an IFSC only belongs to one
    // bank: leaving the previous choice in place would make the very next
    // submission fail the consistency check for a reason the reader did not
    // cause. The status line names the bank so nothing changes unnoticed.
    var quotedBank = null;
    if (selectedBankCode !== COMPARE_ALL) {
      setFormValue('emiMandateBankSelect', selectedBankCode);
      quotedBank = getBankByCode(selectedBankCode);
    }
    setFieldError('emiMaxAmountError', '');

    setStatus(interpolate(
      text('emi_mandate_prefilled', 'Filled in from your plan: {bank}, ceiling {max}, collected {frequency}.'),
      {
        bank: quotedBank ? quotedBank.name : text('emi_bank_compare_all', 'Compare all partner banks'),
        max: money(Math.max(100, ceiling)),
        frequency: text('emi_frequency_monthly', 'Every month')
      }
    ), 'success', 'emiMandateStatus');
    focusStatus('emiMandateStatus');
    return { ceiling: Math.max(100, ceiling), bankCode: quotedBank ? quotedBank.code : '' };
  }

  function selectBank(bankCode) {
    var normalized = cleanText(bankCode, 12).toUpperCase();
    if (!getBankByCode(normalized)) return null;
    selectedBankCode = normalized;
    setFormValue('emiBankSelect', normalized);
    setFormValue('emiMandateBankSelect', normalized);
    var plan = render();
    setStatus(interpolate(text('emi_bank_selected', 'Now quoting {bank}.'), {
      bank: (getBankByCode(normalized) || {}).name || normalized
    }), 'success', 'emiStatus');
    focusStatus('emiStatus');
    return plan;
  }

  function selectAmount(principal) {
    var value = clamp(numberOr(principal, MIN_PRINCIPAL), MIN_PRINCIPAL, MAX_PRINCIPAL);
    setFormValue('emiAmountInput', String(value));
    var plan = render();
    scrollToSection('emiCalculatorSection');
    focusFirstControl('emiCalculatorSection');
    return plan;
  }

  function scrollToSection(id) {
    var target = byId(id);
    if (target && hasMethod(target, 'scrollIntoView')) {
      try {
        target.scrollIntoView({ block: 'start', behavior: 'smooth' });
        return true;
      } catch (error) {
        try {
          target.scrollIntoView();
          return true;
        } catch (innerError) {
          return false;
        }
      }
    }
    return false;
  }

  function focusFirstControl(sectionId) {
    var section = byId(sectionId);
    if (!section || typeof section.querySelector !== 'function') return false;
    var control = section.querySelector('input, select, button');
    if (control && hasMethod(control, 'focus')) {
      try {
        control.focus();
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  function findAttribute(target, attribute) {
    var node = target;
    while (node && node !== doc) {
      if (typeof node.getAttribute === 'function' && node.getAttribute(attribute) !== null) return node;
      node = node.parentNode;
    }
    return null;
  }

  function handleDocumentClick(event) {
    if (!event || typeof event.preventDefault !== 'function') return;

    var pick = findAttribute(event.target, 'data-emi-pick');
    if (pick) {
      event.preventDefault();
      selectBank(pick.getAttribute('data-emi-pick'));
      return;
    }
    var card = findAttribute(event.target, 'data-emi-bank');
    if (card && !pick) {
      event.preventDefault();
      selectBank(card.getAttribute('data-emi-bank'));
      return;
    }
    var amount = findAttribute(event.target, 'data-emi-amount');
    if (amount) {
      event.preventDefault();
      selectAmount(amount.getAttribute('data-emi-amount'));
      return;
    }
    var action = findAttribute(event.target, 'data-emi-action');
    if (action) {
      event.preventDefault();
      var result = applyMandateAction({
        mandateId: action.getAttribute('data-emi-id'),
        action: action.getAttribute('data-emi-action')
      });
      if (result.success) {
        var stateLabel = text('emi_mandate_state_' + result.status, result.status);
        setStatus(interpolate(text('emi_mandate_action_done', 'Mandate {id} is now {state}.'), {
          id: result.mandateId,
          state: stateLabel
        }), 'success', 'emiMandateStatus');
      } else {
        setStatus(result.reason, 'error', 'emiMandateStatus');
      }
      focusStatus('emiMandateStatus');
    }
  }

  /* ---------------------------------------------------------------------
   * Event wiring
   * ------------------------------------------------------------------- */
  function bindControl(id, eventName, handler) {
    var element = byId(id);
    if (!element || typeof element.addEventListener !== 'function' || element._emiBound) return;
    element._emiBound = true;
    element.addEventListener(eventName, handler);
  }

  function bindForm(id, handler) {
    var form = byId(id);
    if (!form || typeof form.addEventListener !== 'function' || form._emiBound) return;
    form._emiBound = true;
    form.addEventListener('submit', handler);
  }

  function setupEventListeners() {
    if (namespace._listenersBound) return;
    namespace._listenersBound = true;

    bindForm('emiCalculatorForm', handleCalculate);
    bindForm('emiEligibilityForm', handleEligibilitySubmit);
    bindForm('emiMandateForm', handleMandateSubmit);

    // Re-quoting on every keystroke would make the page flicker while someone
    // is halfway through typing an amount, so the preview follows a change and
    // the committed figure follows the button.
    ['emiAmountInput', 'emiTenureSelect', 'emiBankSelect'].forEach(function (id) {
      bindControl(id, 'change', function () { render(); });
    });

    // Editing the rate means quoting at that rate, so return to the comparison
    // view first. Without this the field would be swallowed by whichever bank
    // happened to be selected, and a reader could never test their own figure.
    bindControl('emiRateInput', 'change', function () {
      if (selectedBankCode !== COMPARE_ALL) {
        selectedBankCode = COMPARE_ALL;
        setFormValue('emiBankSelect', COMPARE_ALL);
        render();
        setStatus(interpolate(text('emi_rate_reapplied', 'Back to your own rate of {rate}%. Pick a bank card to quote that bank instead.'), {
          rate: readCalculatorForm().annualRate.toFixed(2)
        }), 'success', 'emiStatus');
        focusStatus('emiStatus');
      } else {
        render();
      }
    });

    bindControl('emiMandateSetupBtn', 'click', handleUseCurrentPlan);
    // The same check from the section head, so a reader who has not scrolled
    // down to the form can still run it and be taken to the outcome.
    bindControl('emiCheckEligibilityBtn', 'click', function () {
      handleEligibilitySubmit(null);
      scrollToSection('emiEligibilityChecker');
    });

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('click', handleDocumentClick);
    }

    if (root && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        if (!event) return;
        if (event.key === MANDATES_STORAGE_KEY) loadMandates();
        if (event.key === ELIGIBILITY_STORAGE_KEY) loadEligibility();
        if (event.key === CALCULATIONS_STORAGE_KEY) loadCalculations();
        if (event.key === 'electromart_lang_v1' || event.key === 'electromart_lang') render();
      });
      root.addEventListener('languageChanged', render);
    }
  }

  function init() {
    // Make the page language explicit before the first paint so the static
    // data-i18n chrome and every dynamic string agree.
    syncLanguageStorage();

    var storedAnchor = formatIsoOf(readStorage(ANCHOR_STORAGE_KEY));
    anchorDate = storedAnchor || readTodayIso();
    if (!storedAnchor) writeStorage(ANCHOR_STORAGE_KEY, anchorDate);

    loadCalculations();
    loadEligibility();
    loadMandates();
    loadAudit();
    populateBankSelects();
    setupEventListeners();
    renderEligibility(eligibility);
    render();
    return namespace;
  }

  /* ---------------------------------------------------------------------
   * Public surface
   * ------------------------------------------------------------------- */
  namespace.init = init;
  namespace.calculateEMI = calculateEMI;
  namespace.buildRepaymentPlan = buildRepaymentPlan;
  namespace.getBankOffers = getBankOffers;
  namespace.getBankByCode = getBankByCode;
  namespace.checkEMIEligibility = checkEMIEligibility;
  namespace.setupEMIMandate = setupEMIMandate;
  namespace.mandateAction = mandateAction;
  namespace.applyMandateAction = applyMandateAction;
  namespace.upsertMandate = upsertMandate;
  namespace.isValidPan = isValidPan;
  namespace.isValidPhone = isValidPhone;
  namespace.isValidEmail = isValidEmail;
  namespace.isValidIfsc = isValidIfsc;
  namespace.isValidAccount = isValidAccount;
  namespace.normalizePan = normalizePan;
  namespace.normalizePhone = normalizePhone;
  namespace.normalizeIfsc = normalizeIfsc;
  namespace.normalizeAccount = normalizeAccount;
  namespace.creditLimitForPan = creditLimitForPan;
  namespace.maxTenureFor = maxTenureFor;
  namespace.getEmiProducts = getEmiProducts;
  namespace.isEmiEligible = isEmiEligible;
  namespace.resolveProductTitle = resolveProductTitle;
  namespace.getCurrentPlan = function () { return currentPlan; };
  namespace.getCurrentOffers = function () { return currentOffers.slice(); };
  namespace.getSelectedBankCode = function () { return selectedBankCode; };
  namespace.selectBank = selectBank;
  namespace.selectAmount = selectAmount;
  namespace.getMandates = function () { return mandates.slice(); };
  namespace.getAudit = function () { return audit.slice(); };
  namespace.getEligibility = function () { return eligibility; };
  namespace.getCalculations = function () { return calculations.slice(); };
  namespace.getAnchorDate = function () { return anchorDate; };
  namespace.readTodayIso = readTodayIso;
  namespace.render = render;
  namespace.renderEligibility = renderEligibility;
  namespace.readStoredLanguage = readStoredLanguage;
  namespace.syncLanguageStorage = syncLanguageStorage;
  namespace.tenureLabel = tenureLabel;
  namespace.getBanks = function () { return BANKS.map(function (bank) { return Object.assign({}, bank); }); };
  namespace.CALCULATIONS_STORAGE_KEY = CALCULATIONS_STORAGE_KEY;
  namespace.ELIGIBILITY_STORAGE_KEY = ELIGIBILITY_STORAGE_KEY;
  namespace.MANDATES_STORAGE_KEY = MANDATES_STORAGE_KEY;
  namespace.AUDIT_STORAGE_KEY = AUDIT_STORAGE_KEY;
  namespace.SUPPORTED_TENURES = SUPPORTED_TENURES;
  namespace.MIN_PRINCIPAL = MIN_PRINCIPAL;
  namespace.MAX_PRINCIPAL = MAX_PRINCIPAL;
  namespace.MAX_RATE_PERCENT = MAX_RATE_PERCENT;

  if (doc && doc.readyState === 'loading' && typeof doc.addEventListener === 'function') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}), typeof document !== 'undefined' ? document : null);