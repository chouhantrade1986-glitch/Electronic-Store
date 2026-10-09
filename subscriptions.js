/* ElectroMart Subscription & Recurring Orders JavaScript (Phase 43) */
/* Defensive controller for the points-free recurring-order ledger: enrollment,
   the discount tier ladder, the delivery schedule, and the pause / resume /
   cancel revision trail.
 *
 * Determinism: no randomness, no sampling and no clock-dependent pricing. The
 * four engines below are pure, so identical input always produces identical
 * output on every device. Calendar arithmetic uses an integer proleptic
 * Gregorian conversion rather than the runtime Date type, which keeps the
 * delivery-date engine free of both the system clock and any timezone offset. */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.Subscriptions = electroMart.Subscriptions || root.ElectroMartSubscriptions || {};
  // Flat alias kept for integrations that predate the namespaced object.
  root.ElectroMartSubscriptions = namespace;

  /* ---------------------------------------------------------------------
   * Storage contracts
   * ------------------------------------------------------------------- */
  var SUBSCRIPTIONS_STORAGE_KEY = 'electromart_subscriptions_v1';
  var SCHEDULES_STORAGE_KEY = 'electromart_subscription_schedules_v1';
  var ANCHOR_STORAGE_KEY = 'electromart_subscription_anchor_v1';
  var AUDIT_STORAGE_KEY = 'electromart_subscription_audit_v1';
  var LANGUAGE_STORAGE_KEYS = ['electromart_lang_v1', 'electromart_lang'];
  var MAX_SUBSCRIPTIONS = 40;
  var MAX_AUDIT_ROWS = 24;
  var FORECAST_CYCLES = 6;
  var CADENCE_PLOTS = 6;

  /* ---------------------------------------------------------------------
   * The points-free economy: every rate and limit in one place
   * ------------------------------------------------------------------- */
  var MAX_ACTIVE_LINES = 20;
  var MIN_DAY_OF_MONTH = 1;
  var MAX_DAY_OF_MONTH = 28;
  var MIN_QUANTITY = 1;
  var MAX_QUANTITY = 20;
  var MIN_CUSTOM_INTERVAL = 1;
  var MAX_CUSTOM_INTERVAL = 365;

  /* Tier thresholds follow the brief exactly: one or two lines pay 5%, three
     or four pay 10%, five or more pay 15%. */
  var DISCOUNT_TIERS = [
    { tier: 1, minLines: 1, maxLines: 2, discountPercent: 5 },
    { tier: 2, minLines: 3, maxLines: 4, discountPercent: 10 },
    { tier: 3, minLines: 5, maxLines: 9999, discountPercent: 15 }
  ];
  var BASE_TIER_PERCENT = 5;

  var FREQUENCIES = { monthly: true, weekly: true, custom: true };
  var DELIVERIES_PER_YEAR = { monthly: 12, weekly: 52, custom: 12 };

  var PAUSE_REASON_CODES = ['vacation', 'travelling', 'budget', 'temporary_gap', 'other'];
  var CANCEL_REASON_CODES = ['no_longer_needed', 'switching_product', 'found_alternative', 'too_expensive', 'moving_out', 'other'];

  /* Pause holds the tier place; cancel releases it. That is the whole of the
     difference between the two, and the interface says so rather than leaving
     the member to work it out. */
  var ACTIONS = {
    pause: { status: 'paused', keepsTierPlace: true, needsReason: true, reasonCodes: PAUSE_REASON_CODES },
    resume: { status: 'active', keepsTierPlace: true, needsReason: false, reasonCodes: PAUSE_REASON_CODES },
    cancel: { status: 'cancelled', keepsTierPlace: false, needsReason: true, reasonCodes: CANCEL_REASON_CODES },
    modify: { status: 'active', keepsTierPlace: true, needsReason: false, reasonCodes: PAUSE_REASON_CODES }
  };

  /* Replenishable consumables. A schedule only makes sense where the same unit
     is genuinely bought again, and where a rupee price exists to price it. */
  var REPLENISHABLE_PATTERNS = [
    'battery', 'batteries', 'filter', 'refill', 'consumable', 'ink', 'toner',
    'cartridge', 'bulb', 'fuse', 'cable', 'adapter', 'charger', 'power bank',
    'powerbank', 'stylus', 'styler'
  ];

  /* ---------------------------------------------------------------------
   * In-memory state
   * ------------------------------------------------------------------- */
  var memoryStorage = createMemoryStorage();
  var subscriptions = [];
  var schedule = null;
  var audit = [];
  var selectedSubscriptionId = '';
  var partnerFilter = 'all';

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

  function numberOr(value, fallback) {
    var parsed = Number(value);
    return typeof parsed === 'number' && isFinite(parsed) ? parsed : fallback;
  }

  function roundHalfUp(value) {
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
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
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
    return String(roundHalfUp(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

  /* ---------------------------------------------------------------------
   * Calendar arithmetic
   * ------------------------------------------------------------------- *
   * Days-from-civil and its inverse, using integer maths only. This keeps the
   * schedule engine independent of the system clock, of leap-second drift and
   * of any timezone the browser happens to be in: a delivery date is the same
   * date everywhere, which is exactly what a delivery promise needs. */

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
    // Reject impossible days such as 2026-02-30 by round-tripping them.
    var civil = civilFromDays(daysFromCivil(year, month, day));
    if (civil.year !== year || civil.month !== month || civil.day !== day) return null;
    return { year: year, month: month, day: day };
  }

  function addDays(civil, count) {
    return civilFromDays(daysFromCivil(civil.year, civil.month, civil.day) + count);
  }

  /* Sunday is 0, matching the option order the schedule form offers. */
  function weekdayOf(civil) {
    return ((daysFromCivil(civil.year, civil.month, civil.day) % 7) + 11) % 7;
  }

  /* ---------------------------------------------------------------------
   * Deterministic identifiers
   * ------------------------------------------------------------------- *
   * A subscription identifier is a hash of what was ordered, never a counter
   * and never a clock reading. Enrolling the same line twice therefore
   * resolves to the same identifier, which is what stops a member being billed
   * twice for one standing order. */
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
      state = hashString('EM|SUB|' + prefix + '|' + state + '|' + index + '|' + seed);
      token += CODE_ALPHABET.charAt(state % CODE_ALPHABET.length);
    }
    return prefix + token;
  }

  function buildSubscriptionId(seed) {
    return buildReference('SUB-', seed);
  }

  /* Accepts both the SUB-XXXXXX the brief specifies and the longer dated form
     such as SUB-2026-ABC123, so a printed identifier always validates. */
  var SUBSCRIPTION_ID_PATTERN = /^SUB-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

  function normalizeSubscriptionId(value) {
    var id = cleanText(value, 40).toUpperCase();
    return SUBSCRIPTION_ID_PATTERN.test(id) ? id : '';
  }

  /* ---------------------------------------------------------------------
   * Language
   * ------------------------------------------------------------------- *
   * The shared translator falls back to "hi" when no preference is stored and
   * paints the static data-i18n chrome in that language. This page resolves
   * the same key with the same default, or a first-time visitor would see a
   * page that is half-Hindi and half-English. Both storage keys are always
   * written together so every page in the storefront agrees. */
  var DEFAULT_LANGUAGE = 'hi';
  var RTL_LANGUAGES = ['ur'];

  function readStoredLanguage() {
    for (var index = 0; index < LANGUAGE_STORAGE_KEYS.length; index += 1) {
      var stored = readStorage(LANGUAGE_STORAGE_KEYS[index]);
      if (stored) return String(stored).toLowerCase();
    }
    return DEFAULT_LANGUAGE;
  }

  /* The shared translator stamps <html lang> from its own default, so a first
     visit can end up rendering Hindi copy under an English language tag. Keep
     the document declaration in step with the language actually painted,
     including the RTL flip for Urdu. */
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

  function dispatch(name, detail) {
    if (!root || typeof root.dispatchEvent !== 'function') return;
    var event = null;
    try {
      if (typeof root.CustomEvent === 'function') {
        event = new root.CustomEvent(name, { detail: detail });
      } else if (typeof root.Event === 'function') {
        event = new root.Event(name);
        event.detail = detail;
      } else if (doc && typeof doc.createEvent === 'function') {
        event = doc.createEvent('CustomEvent');
        event.initCustomEvent(name, false, false, detail);
      }
    } catch (error) {
      event = null;
    }
    if (event) {
      try {
        root.dispatchEvent(event);
      } catch (error) {
        // Event support is optional.
      }
    }
  }

  function setStatus(message, kind, targetId) {
    var status = byId(targetId);
    if (!status) return;
    status.textContent = message;
    status.className = 'subs-status' + (kind && kind !== 'success' ? ' is-' + kind : '');
    status.hidden = !message;
  }

  /* Moves keyboard focus to a freshly written status line so assistive tech
     announces the outcome instead of leaving focus on a submit button. */
  function focusStatus(targetId) {
    var status = byId(targetId);
    if (!status || !hasMethod(status, 'focus')) return;
    if (hasMethod(status, 'setAttribute') && hasMethod(status, 'hasAttribute')) {
      if (!status.hasAttribute('tabindex')) status.setAttribute('tabindex', '-1');
    }
    try {
      status.focus();
    } catch (error) {
      // Focus is a progressive enhancement; storage and rendering already succeeded.
    }
  }

  /* ---------------------------------------------------------------------
   * Engine: discount tier
   * ------------------------------------------------------------------- */

  function calculateDiscountTier(lineCount) {
    var count = Math.max(0, Math.round(numberOr(lineCount, 0)));
    for (var index = 0; index < DISCOUNT_TIERS.length; index += 1) {
      if (count >= DISCOUNT_TIERS[index].minLines && count <= DISCOUNT_TIERS[index].maxLines) {
        return DISCOUNT_TIERS[index].tier;
      }
    }
    // A brand-new member with no lines yet sits at the entry tier, so the
    // first line they draw already carries a discount rather than starting
    // at nothing and having to draw a second line to see anything change.
    return DISCOUNT_TIERS[0].tier;
  }

  function resolveTier(value) {
    var tier = Math.round(numberOr(value, 1));
    if (!isFinite(tier)) tier = 1;
    return clamp(tier, DISCOUNT_TIERS[0].tier, DISCOUNT_TIERS[DISCOUNT_TIERS.length - 1].tier);
  }

  function tierPercent(tier) {
    for (var index = 0; index < DISCOUNT_TIERS.length; index += 1) {
      if (DISCOUNT_TIERS[index].tier === tier) return DISCOUNT_TIERS[index].discountPercent;
    }
    return BASE_TIER_PERCENT;
  }

  function normalizeFrequency(value) {
    var frequency = cleanText(value, 12).toLowerCase();
    return hasOwn(FREQUENCIES, frequency) ? frequency : 'monthly';
  }

  function deliveriesPerYear(frequency, customIntervalDays) {
    if (frequency === 'weekly') return DELIVERIES_PER_YEAR.weekly;
    if (frequency === 'custom') {
      var interval = clamp(Math.round(numberOr(customIntervalDays, 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL);
      return Math.max(1, Math.round(365 / interval));
    }
    return DELIVERIES_PER_YEAR.monthly;
  }

  /**
   * Subscription discount engine. The percentage depends only on the tier:
   * the frequency a member picks changes when a line lands, never what it
   * saves. Pass either a tier directly, or a subscriptionCount to have the
   * tier derived from it.
   */
  function calculateSubscriptionDiscount(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var basePrice = Math.max(0, numberOr(safeInput.basePrice, 0));
    if (!isFinite(basePrice)) basePrice = 0;
    var frequency = normalizeFrequency(safeInput.frequency);

    var tier = safeInput.subscriptionCount === undefined || safeInput.subscriptionCount === null || safeInput.subscriptionCount === ''
      ? resolveTier(safeInput.tier)
      : resolveTier(calculateDiscountTier(safeInput.subscriptionCount));

    var discountPercent = tierPercent(tier);
    var discountAmount = roundHalfUp((basePrice * discountPercent) / 100);
    var customIntervalDays = clamp(Math.round(numberOr(safeInput.customIntervalDays, 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL);

    return {
      basePrice: basePrice,
      tier: tier,
      discountPercent: discountPercent,
      discountAmount: discountAmount,
      discountedPrice: Math.max(0, basePrice - discountAmount),
      frequency: frequency,
      customIntervalDays: customIntervalDays,
      deliveriesPerYear: deliveriesPerYear(frequency, customIntervalDays),
      currency: 'INR'
    };
  }

  /* ---------------------------------------------------------------------
   * Engine: next delivery date
   * ------------------------------------------------------------------- *
   * Pure. Given a start date and a cadence, returns the first matching date on
   * or after the start, as YYYY-MM-DD. Day 0 is Sunday, matching the form. */

  function readAnchorDate() {
    var stored = parseIsoDate(readStorage(ANCHOR_STORAGE_KEY));
    if (stored) return formatIso(stored.year, stored.month, stored.day);
    return '2026-01-01';
  }

  function calculateNextDeliveryDate(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var frequency = normalizeFrequency(safeInput.frequency);
    var start = parseIsoDate(safeInput.startDate) || parseIsoDate(readAnchorDate()) || { year: 2026, month: 1, day: 1 };

    if (frequency === 'weekly') {
      var dayOfWeek = clamp(Math.round(numberOr(safeInput.dayOfWeek, 0)), 0, 6);
      var gap = (dayOfWeek - weekdayOf(start) + 7) % 7;
      var weekly = addDays(start, gap);
      return formatIso(weekly.year, weekly.month, weekly.day);
    }

    if (frequency === 'custom') {
      var interval = clamp(Math.round(numberOr(safeInput.customIntervalDays, 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL);
      var custom = addDays(start, interval);
      return formatIso(custom.year, custom.month, custom.day);
    }

    // Monthly. The window is capped at 28 in the form because every month can
    // honour that, so no line can ever be silently pushed into the next month.
    var dayOfMonth = clamp(Math.round(numberOr(safeInput.dayOfMonth, 1)), MIN_DAY_OF_MONTH, MAX_DAY_OF_MONTH);
    if (start.day <= dayOfMonth) {
      return formatIso(start.year, start.month, dayOfMonth);
    }
    var nextMonthStart = start.month === 12
      ? { year: start.year + 1, month: 1, day: 1 }
      : { year: start.year, month: start.month + 1, day: 1 };
    return formatIso(nextMonthStart.year, nextMonthStart.month, dayOfMonth);
  }

  /* Plots the next N deliveries of a cadence. The cursor steps one day past
     each hit before asking again, so a cadence that lands on the cursor date
     advances instead of repeating it. */
  function plotCadenceDates(input, count) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var total = clamp(Math.round(numberOr(count, CADENCE_PLOTS)), 1, CADENCE_PLOTS);
    var dates = [];
    var cursor = parseIsoDate(safeInput.startDate) || parseIsoDate(readAnchorDate()) || { year: 2026, month: 1, day: 1 };

    for (var index = 0; index < total; index += 1) {
      var iso = calculateNextDeliveryDate({
        frequency: safeInput.frequency,
        dayOfMonth: safeInput.dayOfMonth,
        dayOfWeek: safeInput.dayOfWeek,
        customIntervalDays: safeInput.customIntervalDays,
        startDate: formatIso(cursor.year, cursor.month, cursor.day)
      });
      dates.push(iso);
      var hit = parseIsoDate(iso);
      if (!hit) break;
      var next = addDays(hit, 1);
      cursor = next;
    }
    return dates;
  }

  /* ---------------------------------------------------------------------
   * Engine: pause / resume / cancel
   * ------------------------------------------------------------------- *
   * Pure by design. The processor reports what an action implies for a line;
   * it neither reads nor writes the ledger. That is what lets the same line be
   * paused, resumed, cancelled and paused again and always resolve to the same
   * answer, and it means a status is never reported for a line the page has
   * not actually stored. */

  function normalizeReasonCode(reason, action) {
    var rule = hasOwn(ACTIONS, action) ? ACTIONS[action] : null;
    var allowed = rule ? rule.reasonCodes : PAUSE_REASON_CODES;
    var token = cleanText(reason, 80).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!token) return 'other';
    return allowed.indexOf(token) !== -1 ? token : 'other';
  }

  function reasonLabel(reasonCode, rawReason) {
    var code = cleanText(reasonCode, 40) || 'other';
    return text('subscriptions_reason_' + code, cleanText(rawReason, 80) || code);
  }

  /* Every reason is shown by resolving its code against the dictionary that is
     active right now. The ledger stores the code, never a rendered phrase: a
     line paused in one language would otherwise keep showing that language's
     words after the member switched, which is the worst possible reading of a
     billing record. The stored phrase survives only as a fallback for a line
     written by an older build that recorded no code. */
  function resolveReasonLabel(code, storedPhrase) {
    var candidate = cleanText(code, 40).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    // Accept a code from either vocabulary: a line cancelled for a reason that
    // only the cancel list knows about must not be flattened to "other" just
    // because this call site does not know which action produced it.
    var known = PAUSE_REASON_CODES.indexOf(candidate) !== -1 || CANCEL_REASON_CODES.indexOf(candidate) !== -1;
    return reasonLabel(known ? candidate : 'other', cleanText(storedPhrase, 120));
  }

  function processSubscriptionAction(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var subscriptionId = normalizeSubscriptionId(safeInput.subscriptionId);
    var action = cleanText(safeInput.action, 20).toLowerCase();
    var rawReason = cleanText(safeInput.reason, 80);

    if (!subscriptionId) {
      return {
        success: false,
        subscriptionId: '',
        action: action,
        status: '',
        reasonKey: 'subscriptions_missing_id',
        reason: text('subscriptions_missing_id', 'Enter a subscription ID in the EM-SUB-XXXXXX format first.')
      };
    }
    if (!hasOwn(ACTIONS, action)) {
      return {
        success: false,
        subscriptionId: subscriptionId,
        action: action,
        status: '',
        reasonKey: 'subscriptions_unknown_action',
        reason: text('subscriptions_unknown_action', 'That action is not one this hub can perform.')
      };
    }

    var rule = ACTIONS[action];
    var reasonCode = normalizeReasonCode(rawReason, action);
    return {
      success: true,
      subscriptionId: subscriptionId,
      action: action,
      status: rule.status,
      reasonCode: reasonCode,
      reason: rule.needsReason ? reasonLabel(reasonCode, rawReason) : '',
      requiresReason: rule.needsReason,
      keepsTierPlace: rule.keepsTierPlace,
      releaseTierPlace: !rule.keepsTierPlace,
      actionLabel: text('subscriptions_action_' + action, action)
    };
  }

  /* ---------------------------------------------------------------------
   * Engine: enrollment
   * ------------------------------------------------------------------- */

  function rejectEnrollment(reasonKey, reason) {
    return {
      success: false,
      subscriptionId: '',
      status: '',
      frequency: '',
      quantity: 0,
      reasonKey: reasonKey,
      reason: reason
    };
  }

  /**
   * Enrolls a product on a standing order. The identifier is a hash of the
   * order itself, so enrolling the same product, cadence, day and quantity
   * again resolves to the line that already exists rather than minting a
   * duplicate. The date is deliberately not part of the hash: the identifier
   * is the identity of the line, while the first delivery date is a property
   * of it that may legitimately be recalculated.
   */
  function enrollProductInSubscription(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var productId = cleanText(safeInput.productId, 80);
    if (!productId) {
      return rejectEnrollment('subscriptions_enroll_failed', text('subscriptions_enroll_failed', 'Choose a product before subscribing.'));
    }

    var frequency = normalizeFrequency(safeInput.frequency);
    var quantity = clamp(Math.round(numberOr(safeInput.quantity, 1)), MIN_QUANTITY, MAX_QUANTITY);
    var dayOfMonth = clamp(Math.round(numberOr(safeInput.dayOfMonth, 1)), MIN_DAY_OF_MONTH, MAX_DAY_OF_MONTH);
    var dayOfWeek = clamp(Math.round(numberOr(safeInput.dayOfWeek, 0)), 0, 6);
    var customIntervalDays = clamp(Math.round(numberOr(safeInput.customIntervalDays, 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL);
    var startDate = parseIsoDate(safeInput.startDate) ? formatIsoOf(safeInput.startDate) : readAnchorDate();

    var subscriptionId = buildSubscriptionId([
      productId, frequency, dayOfMonth, dayOfWeek, quantity, customIntervalDays
    ].join('|'));

    var existingCount = safeInput.subscriptionCount === undefined || safeInput.subscriptionCount === null || safeInput.subscriptionCount === ''
      ? countLinesHoldingTierPlace() + 1
      : Math.max(0, Math.round(numberOr(safeInput.subscriptionCount, 0)));
    var tier = safeInput.tier === undefined || safeInput.tier === null || safeInput.tier === ''
      ? calculateDiscountTier(existingCount)
      : resolveTier(safeInput.tier);

    var unitPrice = Math.max(0, numberOr(safeInput.unitPrice, 0));
    var priced = unitPrice > 0 ? calculateSubscriptionDiscount({ basePrice: unitPrice, frequency: frequency, tier: tier }) : null;

    return {
      success: true,
      subscriptionId: subscriptionId,
      status: 'active',
      productId: productId,
      productName: cleanText(safeInput.productName, 140),
      brand: cleanText(safeInput.brand, 40),
      unitPrice: unitPrice,
      quantity: quantity,
      frequency: frequency,
      dayOfMonth: dayOfMonth,
      dayOfWeek: dayOfWeek,
      customIntervalDays: customIntervalDays,
      startDate: startDate,
      tier: tier,
      discountPercent: priced ? priced.discountPercent : tierPercent(tier),
      discountAmount: priced ? priced.discountAmount * quantity : 0,
      perCyclePrice: priced ? priced.discountedPrice * quantity : 0,
      nextDeliveryDate: calculateNextDeliveryDate({
        frequency: frequency,
        dayOfMonth: dayOfMonth,
        dayOfWeek: dayOfWeek,
        customIntervalDays: customIntervalDays,
        startDate: startDate
      }),
      deliveriesPerYear: deliveriesPerYear(frequency, customIntervalDays),
      reasonCode: '',
      reason: ''
    };
  }

  function formatIsoOf(value) {
    var civil = parseIsoDate(value);
    return civil ? formatIso(civil.year, civil.month, civil.day) : '';
  }

  /* ---------------------------------------------------------------------
   * Catalog eligibility
   * ------------------------------------------------------------------- */
  function resolveProductArt(product) {
    var signal = [product.category, product.name, product.title].filter(Boolean).join(' ').toLowerCase();
    if (/battery|batteries/.test(signal)) return 'battery';
    if (/filter|purifier/.test(signal)) return 'filter';
    if (/ink|toner|cartridge/.test(signal)) return 'ink';
    if (/cable|adapter|wire/.test(signal)) return 'cable';
    if (/bulb|led|lamp/.test(signal)) return 'bulb';
    if (/refill|consumable|sachet/.test(signal)) return 'sachet';
    return 'loop';
  }

  function isReplenishable(product) {
    var price = numberOr(product && product.price, 0);
    // A schedule needs a price to bill against, so an unpriced line is never
    // eligible however obviously consumable the item looks.
    if (price <= 0) return false;
    var signal = [product.category, product.name, product.title].filter(Boolean).join(' ').toLowerCase();
    return REPLENISHABLE_PATTERNS.some(function (pattern) {
      return signal.indexOf(pattern) !== -1;
    });
  }

  function getEligibleProducts() {
    var catalog = Array.isArray(root.EM_CATALOG) ? root.EM_CATALOG : [];
    var tier = calculateDiscountTier(countLinesHoldingTierPlace());
    var eligible = [];
    for (var index = 0; index < catalog.length; index += 1) {
      var product = catalog[index];
      if (!product || !product.id || !isReplenishable(product)) continue;
      var price = numberOr(product.price, 0);
      var priced = calculateSubscriptionDiscount({ basePrice: price, frequency: 'monthly', tier: tier });
      eligible.push({
        id: String(product.id),
        name: cleanText(product.name, 140) || String(product.id),
        brand: cleanText(product.brand, 40),
        category: cleanText(product.category, 40),
        price: price,
        art: resolveProductArt(product),
        tier: tier,
        discountPercent: priced.discountPercent,
        discountAmount: priced.discountAmount,
        netPrice: priced.discountedPrice
      });
    }
    return eligible;
  }

  function artMarkup(art) {
    var variant = cleanText(art, 24) || 'loop';
    return '<span class="subs-art subs-art--' + escapeHtml(variant) + '" aria-hidden="true">' +
      '<span class="art-cell"></span><span class="art-cart"></span><span class="art-nozzle"></span>' +
      '<span class="art-coil"></span><span class="art-globe"></span><span class="art-seal"></span>' +
      '<span class="art-loop"></span>' +
      '</span>';
  }

  /* ---------------------------------------------------------------------
   * Ledger persistence
   * ------------------------------------------------------------------- */

  function sanitizeSubscription(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var id = normalizeSubscriptionId(raw.subscriptionId);
    if (!id) return null;
    var frequency = normalizeFrequency(raw.frequency);
    var status = ['active', 'paused', 'cancelled'].indexOf(raw.status) === -1 ? 'active' : raw.status;
    var reasonCode = cleanText(raw.reasonCode, 40) || 'other';
    return {
      subscriptionId: id,
      productId: cleanText(raw.productId, 80),
      productName: cleanText(raw.productName, 140),
      brand: cleanText(raw.brand, 40),
      unitPrice: Math.max(0, numberOr(raw.unitPrice, 0)),
      quantity: clamp(Math.round(numberOr(raw.quantity, 1)), MIN_QUANTITY, MAX_QUANTITY),
      frequency: frequency,
      dayOfMonth: clamp(Math.round(numberOr(raw.dayOfMonth, 1)), MIN_DAY_OF_MONTH, MAX_DAY_OF_MONTH),
      dayOfWeek: clamp(Math.round(numberOr(raw.dayOfWeek, 0)), 0, 6),
      customIntervalDays: clamp(Math.round(numberOr(raw.customIntervalDays, 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL),
      startDate: formatIsoOf(raw.startDate) || readAnchorDate(),
      status: status,
      reasonCode: reasonCode,
      reason: cleanText(raw.reason, 120),
      savedOn: formatIsoOf(raw.savedOn) || ''
    };
  }

  function loadSubscriptions() {
    var parsed = parseJson(readStorage(SUBSCRIPTIONS_STORAGE_KEY), []);
    subscriptions = Array.isArray(parsed)
      ? parsed.map(sanitizeSubscription).filter(Boolean).slice(0, MAX_SUBSCRIPTIONS)
      : [];
    if (selectedSubscriptionId && !findSubscription(selectedSubscriptionId)) selectedSubscriptionId = '';
    return subscriptions;
  }

  function saveSubscriptions() {
    var trimmed = subscriptions.slice(0, MAX_SUBSCRIPTIONS);
    var payload = trimmed.map(function (entry) {
      var copy = {};
      Object.keys(entry).forEach(function (key) { copy[key] = entry[key]; });
      return copy;
    });
    var ok = writeStorage(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(payload));
    if (ok) subscriptions = trimmed;
    return ok;
  }

  function findSubscription(subscriptionId) {
    var id = normalizeSubscriptionId(subscriptionId);
    if (!id) return null;
    for (var index = 0; index < subscriptions.length; index += 1) {
      if (subscriptions[index].subscriptionId === id) return subscriptions[index];
    }
    return null;
  }

  /* A paused line still holds its tier place; a cancelled line gives it back.
     This is the single rule behind every tier figure on the page. */
  function countLinesHoldingTierPlace() {
    var count = 0;
    for (var index = 0; index < subscriptions.length; index += 1) {
      if (subscriptions[index].status === 'active' || subscriptions[index].status === 'paused') count += 1;
    }
    return count;
  }

  function countByStatus(status) {
    var count = 0;
    for (var index = 0; index < subscriptions.length; index += 1) {
      if (subscriptions[index].status === status) count += 1;
    }
    return count;
  }

  function currentTier() {
    return calculateDiscountTier(countLinesHoldingTierPlace());
  }

  /* Per-cycle money for one line at the live tier. Active lines only: a paused
     or cancelled line is not being billed, so counting it would overstate both
     the spend and the saving. */
  function priceLine(entry, tier) {
    var priced = calculateSubscriptionDiscount({
      basePrice: entry.unitPrice,
      frequency: entry.frequency,
      tier: tier,
      customIntervalDays: entry.customIntervalDays
    });
    return {
      discountAmount: priced.discountAmount * entry.quantity,
      perCyclePrice: priced.discountedPrice * entry.quantity
    };
  }

  function nextDeliveryFor(entry) {
    return calculateNextDeliveryDate({
      frequency: entry.frequency,
      dayOfMonth: entry.dayOfMonth,
      dayOfWeek: entry.dayOfWeek,
      customIntervalDays: entry.customIntervalDays,
      startDate: entry.startDate
    });
  }

  function getSummary() {
    var tier = currentTier();
    var listPricePerCycle = 0;
    var netPerCycle = 0;
    var nextDelivery = '';
    var nextIso = '';
    var total = subscriptions.length;

    for (var index = 0; index < subscriptions.length; index += 1) {
      var entry = subscriptions[index];
      if (entry.status !== 'active') continue;
      var money_ = priceLine(entry, tier);
      listPricePerCycle += entry.unitPrice * entry.quantity;
      netPerCycle += money_.perCyclePrice;
      var iso = nextDeliveryFor(entry);
      // The soonest upcoming delivery across every active line, compared as
      // plain ISO strings, which sort chronologically.
      if (iso && (!nextIso || iso < nextIso)) {
        nextIso = iso;
        nextDelivery = iso;
      }
    }

    var discountPerCycle = Math.max(0, listPricePerCycle - netPerCycle);
    return {
      total: total,
      tier: tier,
      discountPercent: tierPercent(tier),
      active: countByStatus('active'),
      paused: countByStatus('paused'),
      cancelled: countByStatus('cancelled'),
      listPricePerCycle: listPricePerCycle,
      netPerCycle: netPerCycle,
      discountPerCycle: discountPerCycle,
      nextDeliveryDate: nextDelivery,
      forecastCycles: FORECAST_CYCLES,
      savingsOverForecast: discountPerCycle * FORECAST_CYCLES
    };
  }

  /* ---------------------------------------------------------------------
   * Audit trail
   * ------------------------------------------------------------------- */
  function loadAudit() {
    var parsed = parseJson(readStorage(AUDIT_STORAGE_KEY), []);
    audit = Array.isArray(parsed) ? parsed.filter(function (entry) {
      return entry && typeof entry === 'object' && !Array.isArray(entry);
    }).slice(-MAX_AUDIT_ROWS) : [];
    return audit;
  }

  function recordAudit(actionResult) {
    audit.push({
      subscriptionId: actionResult.subscriptionId,
      action: actionResult.action,
      status: actionResult.status,
      reasonCode: actionResult.reasonCode || 'other',
      // The trail records the code only. A rendered phrase would freeze this
      // history in whichever language happened to be active when the member
      // pressed the button.
      reason: '',
      sequence: audit.length + 1
    });
    if (audit.length > MAX_AUDIT_ROWS) audit = audit.slice(-MAX_AUDIT_ROWS);
    writeStorage(AUDIT_STORAGE_KEY, JSON.stringify(audit));
    return actionResult;
  }

  /* ---------------------------------------------------------------------
   * Ledger mutations (the storage-facing half of the action engine)
   * ------------------------------------------------------------------- */
  function applySubscriptionAction(input) {
    var result = processSubscriptionAction(input);
    if (!result.success) return result;

    var entry = findSubscription(result.subscriptionId);
    if (!entry) {
      return {
        success: false,
        subscriptionId: result.subscriptionId,
        action: result.action,
        status: '',
        reasonKey: 'subscriptions_unknown_subscription',
        reason: text('subscriptions_unknown_subscription', 'No line with that identifier is stored on this device.')
      };
    }

    var previousStatus = entry.status;
    entry.status = result.status;
    // The code is the durable fact about the line; the phrase is presentation
    // and is rebuilt from the dictionary on every render.
    entry.reasonCode = result.requiresReason ? result.reasonCode : '';
    entry.reason = '';
    if (!saveSubscriptions()) {
      entry.status = previousStatus;
      return {
        success: false,
        subscriptionId: entry.subscriptionId,
        action: result.action,
        status: previousStatus,
        reasonKey: 'subscriptions_storage_error',
        reason: text('subscriptions_storage_error', 'We could not save that change on this device. Please try again.')
      };
    }
    recordAudit(result);
    // Repaint here as well as in the click handler. The tier, the projected
    // savings and the audit trail all move with a single action, so a caller
    // that reaches for this mutator directly must not be left looking at the
    // figures from before it.
    render();
    return result;
  }

  function upsertEnrollment(enrollment) {
    if (!enrollment || !enrollment.success) return null;
    var existing = findSubscription(enrollment.subscriptionId);
    if (existing) {
      // Re-enrolling the same line refreshes its cadence rather than creating
      // a second charge for the same standing order.
      var previousStatus = existing.status;
      existing.startDate = enrollment.startDate;
      existing.nextDeliveryDate = enrollment.nextDeliveryDate;
      if (!saveSubscriptions()) {
        existing.startDate = previousStatus;
        return null;
      }
      return existing;
    }

    var entry = {
      subscriptionId: enrollment.subscriptionId,
      productId: enrollment.productId,
      productName: enrollment.productName,
      brand: enrollment.brand,
      unitPrice: enrollment.unitPrice,
      quantity: enrollment.quantity,
      frequency: enrollment.frequency,
      dayOfMonth: enrollment.dayOfMonth,
      dayOfWeek: enrollment.dayOfWeek,
      customIntervalDays: enrollment.customIntervalDays,
      startDate: enrollment.startDate,
      status: 'active',
      reasonCode: '',
      reason: '',
      savedOn: enrollment.startDate
    };
    subscriptions.push(entry);
    if (!saveSubscriptions()) {
      subscriptions.pop();
      return null;
    }
    return entry;
  }

  /* ---------------------------------------------------------------------
   * Schedule persistence
   * ------------------------------------------------------------------- */
  function defaultSchedule() {
    return {
      frequency: 'monthly',
      dayOfMonth: 1,
      dayOfWeek: 1,
      customIntervalDays: 30,
      savedOn: ''
    };
  }

  function loadSchedule() {
    var parsed = parseJson(readStorage(SCHEDULES_STORAGE_KEY), null);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      schedule = defaultSchedule();
      return schedule;
    }
    schedule = {
      frequency: normalizeFrequency(parsed.frequency),
      dayOfMonth: clamp(Math.round(numberOr(parsed.dayOfMonth, 1)), MIN_DAY_OF_MONTH, MAX_DAY_OF_MONTH),
      dayOfWeek: clamp(Math.round(numberOr(parsed.dayOfWeek, 1)), 0, 6),
      customIntervalDays: clamp(Math.round(numberOr(parsed.customIntervalDays, 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL),
      savedOn: formatIsoOf(parsed.savedOn)
    };
    return schedule;
  }

  function saveSchedule(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var next = {
      frequency: normalizeFrequency(safeInput.frequency),
      dayOfMonth: clamp(Math.round(numberOr(safeInput.dayOfMonth, 1)), MIN_DAY_OF_MONTH, MAX_DAY_OF_MONTH),
      dayOfWeek: clamp(Math.round(numberOr(safeInput.dayOfWeek, 1)), 0, 6),
      customIntervalDays: clamp(Math.round(numberOr(safeInput.customIntervalDays, 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL),
      savedOn: formatIsoOf(safeInput.savedOn) || readAnchorDate()
    };
    if (!writeStorage(SCHEDULES_STORAGE_KEY, JSON.stringify(next))) return null;
    schedule = next;
    return schedule;
  }

  function getCadenceSource(override) {
    var base = schedule || defaultSchedule();
    var safeOverride = override && typeof override === 'object' ? override : {};
    return {
      frequency: normalizeFrequency(safeOverride.frequency !== undefined ? safeOverride.frequency : base.frequency),
      dayOfMonth: clamp(Math.round(numberOr(safeOverride.dayOfMonth, base.dayOfMonth)), MIN_DAY_OF_MONTH, MAX_DAY_OF_MONTH),
      dayOfWeek: clamp(Math.round(numberOr(safeOverride.dayOfWeek, base.dayOfWeek)), 0, 6),
      customIntervalDays: clamp(Math.round(numberOr(safeOverride.customIntervalDays, base.customIntervalDays)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL),
      startDate: formatIsoOf(safeOverride.startDate) || readAnchorDate()
    };
  }

  /* The only place the page reads the wall clock, and it decides nothing about
     a price, a tier or an identifier: it only decides which future date the
     ledger starts counting from. */
  function readTodayIso() {
    var now = new Date();
    return formatIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  /* ---------------------------------------------------------------------
   * Rendering: cadence ruler and schedule panel
   * ------------------------------------------------------------------- */
  function renderCadenceRuler(source) {
    var list = byId('cadenceRuler');
    var empty = byId('cadenceRulerEmpty');
    var dates = plotCadenceDates(source, CADENCE_PLOTS);

    if (list) {
      list.innerHTML = dates.map(function (iso, index) {
        return '<li class="subs-ruler__tick">' +
          '<span class="subs-ruler__tick__seq">C' + (index + 1) + '</span>' +
          '<span class="subs-ruler__tick__date">' + escapeHtml(iso) + '</span>' +
          '</li>';
      }).join('');
    }
    show(empty, dates.length === 0);
    return dates;
  }

  function renderSchedulePanel(source) {
    var cadence = source || getCadenceSource({ startDate: readTodayIso() });
    var nextDelivery = calculateNextDeliveryDate(cadence);
    var dates = plotCadenceDates(cadence, CADENCE_PLOTS);

    setText('nextDeliveryDateDisplay', nextDelivery);
    setText('nextDeliveryDateNote', interpolate(
      text('subscriptions_next_delivery_note', 'Counting from {start}, on a {frequency} cadence.'),
      { start: cadence.startDate, frequency: frequencyLabel(cadence.frequency) }
    ));
    setText('nextDeliveryFormula', interpolate(
      text('subscriptions_next_delivery_formula', 'start {start} + {frequency} rule -> {next}'),
      { start: cadence.startDate, frequency: frequencyLabel(cadence.frequency), next: nextDelivery }
    ));

    var preview = byId('cadencePreview');
    if (preview) {
      preview.innerHTML = dates.map(function (iso, index) {
        return '<li class="subs-cadence__item">' +
          '<span class="subs-cadence__date">' + escapeHtml(iso) + '</span>' +
          '<span class="subs-cadence__label">' + escapeHtml(cadenceRuleLabel(cadence)) + '</span>' +
          '</li>';
      }).join('');
    }
    show(byId('cadencePreviewEmpty'), dates.length === 0);

    syncScheduleFields(cadence.frequency);
    return { nextDeliveryDate: nextDelivery, dates: dates };
  }

  function cadenceRuleLabel(cadence) {
    if (!cadence) return '';
    if (cadence.frequency === 'weekly') {
      return interpolate(text('subscriptions_rule_weekly', 'every {weekday}'), { weekday: weekdayLabel(cadence.dayOfWeek) });
    }
    if (cadence.frequency === 'custom') {
      return interpolate(text('subscriptions_rule_custom', 'every {days} days'), { days: formatNumber(cadence.customIntervalDays) });
    }
    return interpolate(text('subscriptions_rule_monthly', 'on day {day} of the month'), { day: formatNumber(cadence.dayOfMonth) });
  }

  var WEEKDAY_KEYS = [
    'subscriptions_weekday_sunday', 'subscriptions_weekday_monday', 'subscriptions_weekday_tuesday',
    'subscriptions_weekday_wednesday', 'subscriptions_weekday_thursday', 'subscriptions_weekday_friday',
    'subscriptions_weekday_saturday'
  ];
  var WEEKDAY_FALLBACKS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function weekdayLabel(dayOfWeek) {
    var index = clamp(Math.round(numberOr(dayOfWeek, 0)), 0, 6);
    return text(WEEKDAY_KEYS[index], WEEKDAY_FALLBACKS[index]);
  }

  function frequencyLabel(frequency) {
    var key = frequency === 'weekly' ? 'subscriptions_weekly_option'
      : frequency === 'custom' ? 'subscriptions_custom_option'
        : 'subscriptions_monthly_option';
    var fallback = frequency === 'weekly' ? 'Every week' : frequency === 'custom' ? 'Custom interval' : 'Every month';
    return text(key, fallback);
  }

  function syncScheduleFields(frequency) {
    var normalized = normalizeFrequency(frequency);
    show(byId('dayOfMonthField'), normalized === 'monthly');
    show(byId('dayOfWeekField'), normalized === 'weekly');
    show(byId('customIntervalField'), normalized === 'custom');
  }

  function readScheduleForm() {
    return {
      frequency: normalizeFrequency(readValue('frequencySelect')),
      dayOfMonth: clamp(Math.round(numberOr(readValue('dayOfMonthInput'), 1)), MIN_DAY_OF_MONTH, MAX_DAY_OF_MONTH),
      dayOfWeek: clamp(Math.round(numberOr(readValue('dayOfWeekSelect'), 1)), 0, 6),
      customIntervalDays: clamp(Math.round(numberOr(readValue('customIntervalInput'), 30)), MIN_CUSTOM_INTERVAL, MAX_CUSTOM_INTERVAL)
    };
  }

  function writeScheduleForm(source) {
    var cadence = source || getCadenceSource();
    var frequency = byId('frequencySelect');
    if (frequency) frequency.value = cadence.frequency;
    setFormValue('dayOfMonthInput', String(cadence.dayOfMonth));
    setFormValue('dayOfWeekSelect', String(cadence.dayOfWeek));
    setFormValue('customIntervalInput', String(cadence.customIntervalDays));
    syncScheduleFields(cadence.frequency);
  }

  function setFormValue(id, value) {
    var node = byId(id);
    if (node && typeof node.value === 'string') node.value = value;
  }

  function readValue(id) {
    var node = byId(id);
    if (!node || node.value === undefined) return '';
    return cleanText(node.value, 300);
  }

  /* ---------------------------------------------------------------------
   * Rendering: summary and sheets
   * ------------------------------------------------------------------- */
  function renderSummary() {
    var summary = getSummary();
    setText('summaryActiveCount', formatNumber(summary.active));
    setText('summaryPausedCount', formatNumber(summary.paused));
    setText('summaryPerCycle', money(summary.netPerCycle));
    setText('totalSavingsDisplay', money(summary.savingsOverForecast));
    setText('nextDeliverySummary', summary.nextDeliveryDate || '—');
    return summary;
  }

  function renderTierSection(summary) {
    var live = summary || getSummary();
    setText('discountTierDisplay', interpolate(text('subscriptions_tier_display', 'Tier {tier}'), { tier: live.tier }));
    setText('subscriptionDiscountDisplay', live.discountPercent + '%');
    setText('subscriptionDiscountNote', interpolate(
      text('subscriptions_discount_note', '{amount} off every cycle at list price'),
      { amount: money(live.discountPerCycle) }
    ));

    var ladder = byId('tierLadder');
    if (ladder) {
      ladder.innerHTML = DISCOUNT_TIERS.map(function (tier, index) {
        var reached = live.tier >= tier.tier;
        var isCurrent = live.tier === tier.tier;
        var range = tier.maxLines > 1000
          ? interpolate(text('subscriptions_tier_range_open', '{from} or more lines'), { from: formatNumber(tier.minLines) })
          : interpolate(text('subscriptions_tier_range', '{from} to {to} lines'), { from: formatNumber(tier.minLines), to: formatNumber(tier.maxLines) });
        return '<li class="subs-tier' + (isCurrent ? ' is-current' : '') + '" style="animation-delay:' + Math.min(index * 60, 240) + 'ms">' +
          '<div class="subs-tier__bar" aria-hidden="true"><span style="width:' + tier.discountPercent + '%"></span></div>' +
          '<div class="subs-tier__head">' +
            '<span class="subs-tier__name">' + escapeHtml(interpolate(text('subscriptions_tier_display', 'Tier {tier}'), { tier: tier.tier })) + '</span>' +
            '<span class="subs-tier__percent">' + tier.discountPercent + '%</span>' +
          '</div>' +
          '<span class="subs-tier__range">' + escapeHtml(range) + '</span>' +
          '<p class="subs-tier__note">' + escapeHtml(reached
            ? text('subscriptions_tier_unlocked', 'Unlocked. Every line you keep running pays this rate.')
            : text('subscriptions_tier_locked', 'Keep this many lines running to reach it.')) + '</p>' +
        '</li>';
      }).join('');
    }

    renderForecast(live);
    return live;
  }

  function renderForecast(summary) {
    var live = summary || getSummary();
    var body = byId('forecastBody');
    var listTotal = 0;
    var discountTotal = 0;
    var netTotal = 0;

    var rows = [];
    for (var cycle = 1; cycle <= FORECAST_CYCLES; cycle += 1) {
      rows.push({
        cycle: cycle,
        list: live.listPricePerCycle,
        discount: live.discountPerCycle,
        net: live.netPerCycle
      });
      listTotal += live.listPricePerCycle;
      discountTotal += live.discountPerCycle;
      netTotal += live.netPerCycle;
    }

    if (body) {
      body.innerHTML = rows.map(function (row) {
        return '<tr>' +
          '<th scope="row" class="subs-mono">C' + row.cycle + '</th>' +
          '<td class="subs-mono">' + escapeHtml(money(row.list)) + '</td>' +
          '<td class="subs-mono is-discount">−' + escapeHtml(money(row.discount)) + '</td>' +
          '<td class="subs-mono">' + escapeHtml(money(row.net)) + '</td>' +
        '</tr>';
      }).join('');
    }
    setText('forecastListTotal', money(listTotal));
    setText('forecastDiscountTotal', money(discountTotal));
    setText('forecastNetTotal', money(netTotal));
    return { listTotal: listTotal, discountTotal: discountTotal, netTotal: netTotal };
  }

  function renderSubscriptionList() {
    var list = byId('subscriptionsList');
    var empty = byId('subscriptionsListEmpty');
    var skeleton = byId('subscriptionsSkeleton');
    var meta = byId('subscriptionsListMeta');
    if (skeleton) skeleton.hidden = true;
    if (!list) return;

    if (!subscriptions.length) {
      list.innerHTML = '';
      if (hasMethod(list, 'setAttribute')) list.setAttribute('aria-busy', 'false');
      show(empty, true);
      setText('subscriptionsListMeta', '');
      return;
    }

    var tier = currentTier();
    list.innerHTML = subscriptions.map(function (entry, index) {
      var priced = priceLine(entry, tier);
      var isSelected = entry.subscriptionId === selectedSubscriptionId;
      var statusKey = 'subscriptions_status_' + entry.status;
      var statusFallback = entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
      return '<article class="subs-sheet is-' + escapeHtml(entry.status) + (isSelected ? ' is-selected' : '') + '"' +
        ' data-subs-select="' + escapeHtml(entry.subscriptionId) + '" tabindex="0" role="button"' +
        ' aria-pressed="' + (isSelected ? 'true' : 'false') + '"' +
        ' style="animation-delay:' + Math.min(index * 50, 280) + 'ms">' +
        '<div class="subs-sheet__head">' +
          '<div>' +
            '<p class="subs-sheet__id">' + escapeHtml(entry.subscriptionId) + '</p>' +
            '<h3 class="subs-sheet__title">' + escapeHtml(entry.productName || entry.productId) + '</h3>' +
          '</div>' +
          '<span class="subs-statuspill is-' + escapeHtml(entry.status) + '">' +
            escapeHtml(text(statusKey, statusFallback)) +
          '</span>' +
        '</div>' +
        '<div class="subs-sheet__body">' +
          '<dl class="subs-sheet__spec">' +
            '<div><dt>' + escapeHtml(text('subscriptions_frequency_label', 'Frequency')) + '</dt><dd>' + escapeHtml(frequencyLabel(entry.frequency)) + '</dd></div>' +
            '<div><dt>' + escapeHtml(text('subscriptions_quantity_label', 'Quantity')) + '</dt><dd>' + escapeHtml(formatNumber(entry.quantity)) + '</dd></div>' +
            '<div><dt>' + escapeHtml(text('subscriptions_discount_percent_label', 'Discount per cycle')) + '</dt><dd>' + entryTierPercent(entry, tier) + '%</dd></div>' +
            '<div><dt>' + escapeHtml(text('subscriptions_per_cycle_label', 'Per cycle')) + '</dt><dd>' + escapeHtml(money(priced.perCyclePrice)) + '</dd></div>' +
          '</dl>' +
          '<p class="subs-sheet__next">' +
            escapeHtml(text('subscriptions_next_delivery_label', 'Next delivery')) +
            ' <strong>' + escapeHtml(nextDeliveryFor(entry)) + '</strong>' +
          '</p>' +
          (entry.reasonCode
            ? '<p class="subs-sheet__reason">' + escapeHtml(resolveReasonLabel(entry.reasonCode, entry.reason)) + '</p>'
            : '') +
        '</div>' +
        '<div class="subs-sheet__foot">' +
          '<span class="subs-sheet__save">' +
            escapeHtml(interpolate(text('subscriptions_sheet_saving', 'Saves {amount} per cycle'), { amount: money(priced.discountAmount) })) +
          '</span>' +
          '<button type="button" class="btn-subs btn-subs--quiet" data-subs-open="' + escapeHtml(entry.subscriptionId) + '">' +
            escapeHtml(text('subscriptions_open_btn', 'Open')) +
          '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    if (hasMethod(list, 'setAttribute')) list.setAttribute('aria-busy', 'false');
    show(empty, false);
    setText('subscriptionsListMeta', interpolate(
      text('subscriptions_list_meta', '{count} lines on this sheet, {active} delivering, {tier} at {percent}% off.'),
      {
        count: formatNumber(subscriptions.length),
        active: formatNumber(countByStatus('active')),
        tier: live_tierText(tier),
        percent: tierPercent(tier)
      }
    ));
  }

  function entryTierPercent(entry, tier) {
    // A cancelled line is no longer billed, so quoting it a live discount
    // would be misleading; it keeps the rate it held when it was running.
    if (entry.status === 'cancelled') return tierPercent(tier);
    return tierPercent(tier);
  }

  function live_tierText(tier) {
    return text('subscriptions_tier_display', 'Tier {tier}').replace('{tier}', String(tier));
  }

  function renderInspector() {
    var none = byId('selectedSubscriptionNone');
    var body = byId('selectedSubscriptionBody');
    var entry = findSubscription(selectedSubscriptionId);
    show(none, !entry);
    show(body, Boolean(entry));
    if (!entry) {
      setText('subscriptionStatusDisplay', '—');
      setText('nextDeliveryDate', '—');
      return null;
    }

    var tier = currentTier();
    var priced = priceLine(entry, tier);
    var statusKey = 'subscriptions_status_' + entry.status;
    var statusFallback = entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
    var pill = byId('subscriptionStatusDisplay');
    if (pill) {
      pill.textContent = text(statusKey, statusFallback);
      pill.className = 'subs-statuspill is-' + entry.status;
    }
    setText('nextDeliveryDate', nextDeliveryFor(entry));
    setText('selectedSubscriptionId', entry.subscriptionId);
    setText('selectedSubscriptionDiscount', tierPercent(tier) + '%');
    setText('selectedSubscriptionPerCycle', money(priced.perCyclePrice));

    var reason = byId('selectedSubscriptionReason');
    if (reason) {
      // A reason is worth showing whenever the line carries one, whether it was
      // paused or cancelled. What it says is resolved from the live dictionary.
      reason.textContent = entry.reasonCode ? resolveReasonLabel(entry.reasonCode, entry.reason) : '';
      show(reason, Boolean(entry.reasonCode));
    }
    setFormValue('subscriptionIdInput', entry.subscriptionId);
    return entry;
  }

  function renderAudit() {
    var list = byId('subscriptionAudit');
    var empty = byId('subscriptionAuditEmpty');
    if (!list) return;
    if (!audit.length) {
      list.innerHTML = '';
      show(empty, true);
      return;
    }
    list.innerHTML = audit.slice().reverse().map(function (row) {
      return '<li class="subs-audit__row">' +
        '<div>' +
          '<span class="subs-audit__action">' + escapeHtml(text('subscriptions_action_' + row.action, row.action)) + '</span>' +
          '<span class="subs-audit__id">' + escapeHtml(row.subscriptionId) + '</span>' +
        '</div>' +
        '<span class="subs-audit__meta">' + escapeHtml(resolveReasonLabel(row.reasonCode, row.reason)) + '</span>' +
      '</li>';
    }).join('');
    show(empty, false);
  }

  /* ---------------------------------------------------------------------
   * Rendering: eligible products
   * ------------------------------------------------------------------- */
  function populateProductSelect(eligible) {
    var select = byId('enrollProductSelect');
    if (!select) return;
    if (!eligible.length) {
      select.innerHTML = '';
      select.disabled = true;
      return;
    }
    select.disabled = false;
    select.innerHTML = eligible.map(function (product) {
      return '<option value="' + escapeHtml(product.id) + '">' +
        escapeHtml((product.name || product.id) + ' — ' + money(product.netPrice)) +
        '</option>';
    }).join('');
  }

  function renderProductGrid() {
    var grid = byId('subscriptionProductGrid');
    var empty = byId('subscriptionProductGridEmpty');
    var skeleton = byId('subscriptionProductSkeleton');
    if (skeleton) skeleton.hidden = true;
    var eligible = getEligibleProducts();
    populateProductSelect(eligible);

    if (!grid) return eligible;
    if (!eligible.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      show(empty, true);
      return eligible;
    }

    grid.innerHTML = eligible.map(function (product, index) {
      var existing = findSubscriptionByProduct(product.id);
      return '<article class="subs-product" style="animation-delay:' + Math.min(index * 55, 300) + 'ms">' +
        '<div class="subs-product__art">' +
          '<span class="subs-product__stamp">−' + product.discountPercent + '%</span>' +
          artMarkup(product.art) +
        '</div>' +
        '<div class="subs-product__body">' +
          '<span class="subs-product__brand">' + escapeHtml(product.brand || product.category) + '</span>' +
          '<h3>' + escapeHtml(product.name) + '</h3>' +
          '<p class="subs-product__price"><strong>' + escapeHtml(money(product.price)) + '</strong></p>' +
          '<p class="subs-product__save">' +
            escapeHtml(interpolate(text('subscriptions_product_saving', 'Schedule it and pay {net} instead of {list}.'), {
              net: money(product.netPrice),
              list: money(product.price)
            })) +
          '</p>' +
        '</div>' +
        (existing
          ? '<button type="button" class="btn-subs btn-subs--quiet" data-subs-open="' + escapeHtml(existing.subscriptionId) + '">' +
              escapeHtml(text('subscriptions_open_line_btn', 'Open line')) + '</button>'
          : '<button type="button" class="btn-subs btn-subs--stamp" data-subs-enroll="' + escapeHtml(product.id) + '">' +
              escapeHtml(text('subscriptions_subscribe_btn', 'Subscribe & save')) + '</button>') +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    show(empty, false);
    return eligible;
  }

  function findSubscriptionByProduct(productId) {
    var id = cleanText(productId, 80);
    for (var index = 0; index < subscriptions.length; index += 1) {
      if (subscriptions[index].productId === id && subscriptions[index].status !== 'cancelled') {
        return subscriptions[index];
      }
    }
    return null;
  }

  /* ---------------------------------------------------------------------
   * Render everything
   * ------------------------------------------------------------------- */
  function render() {
    var cadence = getCadenceSource({ startDate: readTodayIso() });
    renderCadenceRuler(cadence);
    renderSchedulePanel(cadence);
    var summary = renderSummary();
    renderTierSection(summary);
    renderSubscriptionList();
    renderInspector();
    renderAudit();
    renderProductGrid();
    refreshStaticTranslations();
    return summary;
  }

  /* ---------------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------------- */
  function handleScheduleSave(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (form && hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setText('scheduleSavedMeta', text('subscriptions_schedule_incomplete', 'Complete every field before saving the schedule.'));
      return null;
    }
    var next = saveSchedule(readScheduleForm());
    if (!next) {
      setText('scheduleSavedMeta', text('subscriptions_storage_error', 'We could not save that schedule on this device. Please try again.'));
      return null;
    }
    var cadence = getCadenceSource({ startDate: readTodayIso() });
    renderCadenceRuler(cadence);
    renderSchedulePanel(cadence);
    setText('scheduleSavedMeta', interpolate(
      text('subscriptions_schedule_saved', 'Cadence saved. Next delivery {next}.'),
      { next: calculateNextDeliveryDate(cadence) }
    ));
    return next;
  }

  function handleFrequencyChange() {
    var draft = readScheduleForm();
    syncScheduleFields(draft.frequency);
    var cadence = getCadenceSource({ startDate: readTodayIso(), frequency: draft.frequency, dayOfMonth: draft.dayOfMonth, dayOfWeek: draft.dayOfWeek, customIntervalDays: draft.customIntervalDays });
    renderCadenceRuler(cadence);
    renderSchedulePanel(cadence);
    return cadence;
  }

  function handleEnrollSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (form && hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setText('enrollMeta', text('subscriptions_enroll_incomplete', 'Complete the product and quantity before subscribing.'));
      return null;
    }

    var productId = readValue('enrollProductSelect');
    var eligible = getEligibleProducts();
    var product = null;
    for (var index = 0; index < eligible.length; index += 1) {
      if (eligible[index].id === productId) { product = eligible[index]; break; }
    }
    if (!product) {
      setText('enrollMeta', text('subscriptions_enroll_failed', 'Choose an eligible product before subscribing.'));
      return null;
    }

    var enrollment = enrollProductInSubscription({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      unitPrice: product.price,
      frequency: readValue('enrollFrequencySelect'),
      dayOfMonth: readValue('enrollDayInput'),
      quantity: readValue('enrollQuantityInput'),
      startDate: readTodayIso()
    });

    if (!enrollment.success) {
      setText('enrollMeta', enrollment.reason);
      return enrollment;
    }

    var saved = upsertEnrollment(enrollment);
    if (!saved) {
      setText('enrollMeta', text('subscriptions_storage_error', 'We could not save that line on this device. Please try again.'));
      return null;
    }

    selectedSubscriptionId = saved.subscriptionId;
    var summary = render();
    setText('enrollMeta', interpolate(
      text('subscriptions_enrolled_meta', '{id} added. {amount} off every cycle at Tier {tier}.'),
      {
        id: saved.subscriptionId,
        amount: money(enrollment.discountAmount),
        tier: live_tierText(summary.tier)
      }
    ));
    setStatus(interpolate(
      text('subscriptions_enrolled', '{name} is on the schedule as {id}, first delivery {date}.'),
      {
        name: saved.productName || saved.productId,
        id: saved.subscriptionId,
        date: enrollment.nextDeliveryDate
      }
    ), 'success', 'subsStatus');
    focusStatus('subsStatus');
    return enrollment;
  }

  function handleAction(action, reason) {
    var subscriptionId = readValue('subscriptionIdInput') || selectedSubscriptionId;
    var result = applySubscriptionAction({ subscriptionId: subscriptionId, action: action, reason: reason });
    if (!result.success) {
      setStatus(result.reason, 'error', 'subsActionStatus');
      focusStatus('subsActionStatus');
      return result;
    }
    render();
    setStatus(interpolate(
      text('subscriptions_action_done', '{id} is now {status}.'),
      { id: result.subscriptionId, status: text('subscriptions_status_' + result.status, result.status) }
    ), 'success', 'subsActionStatus');
    focusStatus('subsActionStatus');
    return result;
  }

  function handlePauseSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    return handleAction('pause', readValue('pauseReasonSelect'));
  }

  function handleCancelSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    return handleAction('cancel', readValue('cancelReasonSelect'));
  }

  function selectSubscription(subscriptionId) {
    var id = normalizeSubscriptionId(subscriptionId);
    if (!id) return null;
    selectedSubscriptionId = id;
    setFormValue('subscriptionIdInput', id);
    renderSubscriptionList();
    renderInspector();
    return findSubscription(id);
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
    var control = section.querySelector('select, input, button');
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

  /* ---------------------------------------------------------------------
   * Event wiring
   * ------------------------------------------------------------------- */
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

    var enrollTrigger = findAttribute(event.target, 'data-subs-enroll');
    if (enrollTrigger) {
      event.preventDefault();
      var productId = enrollTrigger.getAttribute('data-subs-enroll');
      var eligible = getEligibleProducts();
      for (var index = 0; index < eligible.length; index += 1) {
        if (eligible[index].id !== productId) continue;
        var enrollment = enrollProductInSubscription({
          productId: eligible[index].id,
          productName: eligible[index].name,
          brand: eligible[index].brand,
          unitPrice: eligible[index].price,
          frequency: readValue('enrollFrequencySelect') || 'monthly',
          dayOfMonth: readValue('enrollDayInput'),
          quantity: readValue('enrollQuantityInput'),
          startDate: readTodayIso()
        });
        if (!enrollment.success) break;
        var saved = upsertEnrollment(enrollment);
        if (!saved) {
          setStatus(text('subscriptions_storage_error', 'We could not save that line on this device. Please try again.'), 'error', 'subsStatus');
          focusStatus('subsStatus');
          break;
        }
        selectedSubscriptionId = saved.subscriptionId;
        var summary = render();
        setStatus(interpolate(
          text('subscriptions_enrolled', '{name} is on the schedule as {id}, first delivery {date}.'),
          { name: saved.productName || saved.productId, id: saved.subscriptionId, date: enrollment.nextDeliveryDate }
        ), 'success', 'subsStatus');
        focusStatus('subsStatus');
        scrollToSection('mySubscriptionsSection');
        break;
      }
      return;
    }

    var openTrigger = findAttribute(event.target, 'data-subs-open');
    if (openTrigger) {
      event.preventDefault();
      selectSubscription(openTrigger.getAttribute('data-subs-open'));
      scrollToSection('pauseResumeSection');
      focusFirstControl('pauseResumeSection');
      return;
    }

    var selectTrigger = findAttribute(event.target, 'data-subs-select');
    if (selectTrigger) {
      event.preventDefault();
      selectSubscription(selectTrigger.getAttribute('data-subs-select'));
    }
  }

  function handleDocumentKeydown(event) {
    if (!event || (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar')) return;
    var sheet = findAttribute(event.target, 'data-subs-select');
    if (!sheet) return;
    event.preventDefault();
    selectSubscription(sheet.getAttribute('data-subs-select'));
  }

  function bindControl(id, eventName, handler) {
    var element = byId(id);
    if (!element || typeof element.addEventListener !== 'function' || element._subsBound) return;
    element._subsBound = true;
    element.addEventListener(eventName, handler);
  }

  function bindForm(id, handler) {
    var form = byId(id);
    if (!form || typeof form.addEventListener !== 'function' || form._subsBound) return;
    form._subsBound = true;
    form.addEventListener('submit', handler);
  }

  function setupEventListeners() {
    if (namespace._listenersBound) return;
    namespace._listenersBound = true;

    bindForm('deliveryScheduleForm', handleScheduleSave);
    bindForm('enrollForm', handleEnrollSubmit);
    bindForm('pauseSubscriptionForm', handlePauseSubmit);
    bindForm('cancelSubscriptionForm', handleCancelSubmit);

    bindControl('frequencySelect', 'change', handleFrequencyChange);
    bindControl('dayOfMonthInput', 'change', handleFrequencyChange);
    bindControl('dayOfWeekSelect', 'change', handleFrequencyChange);
    bindControl('customIntervalInput', 'change', handleFrequencyChange);

    bindControl('addSubscriptionBtn', 'click', function () {
      scrollToSection('eligibleProductsSection');
      focusFirstControl('eligibleProductsSection');
    });
    bindControl('manageSubscriptionBtn', 'click', function () {
      scrollToSection('pauseResumeSection');
      focusFirstControl('pauseResumeSection');
    });
    bindControl('pauseSubscriptionBtn', 'click', function () {
      handleAction('pause', readValue('pauseReasonSelect'));
    });
    bindControl('resumeSubscriptionBtn', 'click', function () {
      handleAction('resume');
    });
    bindControl('cancelSubscriptionBtn', 'click', function () {
      handleAction('cancel', readValue('cancelReasonSelect'));
    });

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('click', handleDocumentClick);
      doc.addEventListener('keydown', handleDocumentKeydown);
    }

    if (root && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        if (!event) return;
        if (event.key === SUBSCRIPTIONS_STORAGE_KEY) loadSubscriptions();
        if (event.key === SCHEDULES_STORAGE_KEY) loadSchedule();
        if (event.key === AUDIT_STORAGE_KEY) loadAudit();
        if (event.key === 'electromart_lang_v1' || event.key === 'electromart_lang') render();
      });
      root.addEventListener('languageChanged', render);
    }
  }

  function init() {
    // Make the page language explicit before the first paint so the static
    // data-i18n chrome and every dynamic string agree.
    syncLanguageStorage();
    if (!parseIsoDate(readStorage(ANCHOR_STORAGE_KEY))) writeStorage(ANCHOR_STORAGE_KEY, '2026-01-01');
    loadSubscriptions();
    loadSchedule();
    loadAudit();
    writeScheduleForm(schedule);
    setupEventListeners();
    render();
    return namespace;
  }

  /* ---------------------------------------------------------------------
   * Public surface
   * ------------------------------------------------------------------- */
  namespace.init = init;
  namespace.calculateSubscriptionDiscount = calculateSubscriptionDiscount;
  namespace.calculateNextDeliveryDate = calculateNextDeliveryDate;
  namespace.processSubscriptionAction = processSubscriptionAction;
  namespace.enrollProductInSubscription = enrollProductInSubscription;
  namespace.applySubscriptionAction = applySubscriptionAction;
  namespace.calculateDiscountTier = calculateDiscountTier;
  namespace.plotCadenceDates = plotCadenceDates;
  namespace.getEligibleProducts = getEligibleProducts;
  namespace.isReplenishable = isReplenishable;
  namespace.getSummary = getSummary;
  namespace.getSchedule = function () { return schedule ? Object.assign({}, schedule) : defaultSchedule(); };
  namespace.getCadenceSource = getCadenceSource;
  namespace.saveSchedule = saveSchedule;
  namespace.loadSchedule = loadSchedule;
  namespace.getSubscriptions = function () { return subscriptions.slice(); };
  namespace.getAudit = function () { return audit.slice(); };
  namespace.findSubscription = findSubscription;
  namespace.selectSubscription = selectSubscription;
  namespace.readTodayIso = readTodayIso;
  namespace.readAnchorDate = readAnchorDate;
  namespace.render = render;
  namespace.renderSchedulePanel = renderSchedulePanel;
  namespace.renderCadenceRuler = renderCadenceRuler;
  namespace.normalizeSubscriptionId = normalizeSubscriptionId;
  namespace.normalizeReasonCode = normalizeReasonCode;
  namespace.countLinesHoldingTierPlace = countLinesHoldingTierPlace;
  namespace.currentTier = currentTier;
  namespace.SUBSCRIPTIONS_STORAGE_KEY = SUBSCRIPTIONS_STORAGE_KEY;
  namespace.SCHEDULES_STORAGE_KEY = SCHEDULES_STORAGE_KEY;
  namespace.AUDIT_STORAGE_KEY = AUDIT_STORAGE_KEY;
  namespace.ANCHOR_STORAGE_KEY = ANCHOR_STORAGE_KEY;
  namespace.MAX_ACTIVE_LINES = MAX_ACTIVE_LINES;
  namespace.FORECAST_CYCLES = FORECAST_CYCLES;
  namespace.MIN_DAY_OF_MONTH = MIN_DAY_OF_MONTH;
  namespace.MAX_DAY_OF_MONTH = MAX_DAY_OF_MONTH;
  namespace.MIN_QUANTITY = MIN_QUANTITY;
  namespace.MAX_QUANTITY = MAX_QUANTITY;
  namespace.MIN_CUSTOM_INTERVAL = MIN_CUSTOM_INTERVAL;
  namespace.MAX_CUSTOM_INTERVAL = MAX_CUSTOM_INTERVAL;
  namespace.readStoredLanguage = readStoredLanguage;
  namespace.syncLanguageStorage = syncLanguageStorage;
  namespace.getTierLadder = function () { return DISCOUNT_TIERS.map(function (entry) { return Object.assign({}, entry); }); };

  if (doc && doc.readyState === 'loading' && typeof doc.addEventListener === 'function') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}), typeof document !== 'undefined' ? document : null);