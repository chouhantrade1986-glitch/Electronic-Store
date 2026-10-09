/* ElectroMart Loyalty & Rewards Marketplace JavaScript (Phase 42) */
/* Defensive controller for the points ledger, the tier ladder, the reward and */
/* partner catalogues, the referral programme, and the points-to-order engine. */
/* No randomness, no sampling, and no clock-dependent pricing: the same input */
/* always produces the same output, on every device and every visit. */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.Loyalty = electroMart.Loyalty || root.ElectroMartLoyalty || {};
  // Flat alias kept for integrations that predate the namespaced object.
  root.ElectroMartLoyalty = namespace;

  /* ---------------------------------------------------------------------
   * Storage contracts
   * ------------------------------------------------------------------- */
  var PROFILE_STORAGE_KEY = 'electromart_loyalty_profile_v1';
  var REFERRALS_STORAGE_KEY = 'electromart_loyalty_referrals_v1';
  var REDEMPTIONS_STORAGE_KEY = 'electromart_loyalty_redemptions_v1';
  var CART_STORAGE_KEY = 'electromart_cart_v1';
  var CATALOG_STORAGE_KEY = 'electromart_catalog_v1';
  var LANGUAGE_STORAGE_KEYS = ['electromart_lang_v1', 'electromart_lang'];
  var MAX_REFERRALS = 20;
  var MAX_REDEMPTIONS = 20;
  var EARNING_SHELF_SIZE = 8;

  /* ---------------------------------------------------------------------
   * The points economy — every rate in one place
   * ------------------------------------------------------------------- *
   * 100 points convert to exactly ₹1 at every tier. The rate never changes,
   * which is why a Bronze member and a Platinum member convert points the
   * same way; tiers change what surrounds the rate, not the rate itself. */
  var POINTS_PER_RUPEE = 100;
  var EARN_POINTS_PER_100_RUPEES = 10;
  var REFERRER_BONUS_POINTS = 1000;
  var REFEREE_BONUS_POINTS = 500;
  // Half the value of an order, in points, and never more than this ceiling.
  var MAX_POINTS_ORDER_SHARE = 0.5;
  var MAX_POINTS_PER_ORDER = 50000;

  /* ---------------------------------------------------------------------
   * Tier ladder
   * ------------------------------------------------------------------- *
   * Earn multipliers are held as integers over four so the arithmetic never
   * drifts through a float on its way to a rounded points figure. */
  var TIER_LADDER = [
    {
      tier: 'bronze', key: 'loyalty_tier_bronze', fallback: 'Bronze',
      minPoints: 0, earnMultiplierX4: 4,
      perks: ['loyalty_perk_points', 'loyalty_perk_member_pricing']
    },
    {
      tier: 'silver', key: 'loyalty_tier_silver', fallback: 'Silver',
      minPoints: 5000, earnMultiplierX4: 5,
      perks: ['loyalty_perk_points', 'loyalty_perk_member_pricing', 'loyalty_perk_free_shipping']
    },
    {
      tier: 'gold', key: 'loyalty_tier_gold', fallback: 'Gold',
      minPoints: 20000, earnMultiplierX4: 6,
      perks: ['loyalty_perk_points', 'loyalty_perk_member_pricing', 'loyalty_perk_free_shipping', 'loyalty_perk_early_access']
    },
    {
      tier: 'platinum', key: 'loyalty_tier_platinum', fallback: 'Platinum',
      minPoints: 50000, earnMultiplierX4: 8,
      perks: ['loyalty_perk_points', 'loyalty_perk_member_pricing', 'loyalty_perk_free_shipping', 'loyalty_perk_early_access', 'loyalty_perk_priority_support']
    }
  ];

  /* The perk list is held as bare keys for compactness, so the English wording
     lives here. Every other table in this file pairs a key with its own
     fallback; without this one a missing dictionary would print a raw
     loyalty_ identifier straight into the benefits grid. */
  var PERK_TEXT = {
    loyalty_perk_points: 'Points on every purchase, multiplied by your tier',
    loyalty_perk_member_pricing: 'Member pricing across the catalogue',
    loyalty_perk_free_shipping: 'Free standard shipping',
    loyalty_perk_early_access: 'Early access to selected launches',
    loyalty_perk_priority_support: 'Priority support queue'
  };

  /* ---------------------------------------------------------------------
   * Ways to earn. Fixed bonuses are never multiplied by the tier, which is
   * stated in the interface so nobody has to guess.
   * ------------------------------------------------------------------- */
  var EARN_ACTIONS = [
    {
      id: 'purchase', key: 'loyalty_earn_purchase_name', descKey: 'loyalty_earn_purchase_desc',
      fallback: 'Purchase on ElectroMart', fallbackDesc: 'Every ₹100 of an order books 10 points at your tier multiplier.',
      art: 'purchase', fixedPoints: 0, rateBased: true, needsValue: true, once: false,
      valueLabelKey: 'loyalty_earn_order_value_label', valueLabelFallback: 'Order value (₹)'
    },
    {
      id: 'review', key: 'loyalty_earn_review_name', descKey: 'loyalty_earn_review_desc',
      fallback: 'Write a product review', fallbackDesc: 'Publish one review of a product you have actually used.',
      art: 'review', fixedPoints: 50, rateBased: false, once: false
    },
    {
      id: 'share', key: 'loyalty_earn_share_name', descKey: 'loyalty_earn_share_desc',
      fallback: 'Share a product', fallbackDesc: 'Share a product page on a social network you use.',
      art: 'share', fixedPoints: 25, rateBased: false, once: false
    },
    {
      id: 'birthday', key: 'loyalty_earn_birthday_name', descKey: 'loyalty_earn_birthday_desc',
      fallback: 'Birthday bonus', fallbackDesc: 'A one-time thank-you recorded on your birthday.',
      art: 'birthday', fixedPoints: 500, rateBased: false, once: true
    }
  ];

  var BONUS_EVENTS = [
    { id: 'double_weekend', key: 'loyalty_event_double_weekend', fallback: 'Double points weekend', detailKey: 'loyalty_event_double_weekend_detail', fallbackDetail: 'Every Friday and Saturday, purchase points count twice.', multiplierX4: 8 },
    { id: 'birthday_month', key: 'loyalty_event_birthday_month', fallback: 'Birthday month', detailKey: 'loyalty_event_birthday_month_detail', fallbackDetail: 'Your birthday month earns 1.5x on top of your tier.', multiplierX4: 6 },
    { id: 'festive_offer', key: 'loyalty_event_festive', fallback: 'Festive redemption week', detailKey: 'loyalty_event_festive_detail', fallbackDetail: 'Selected rewards cost a third fewer points.', multiplierX4: 0 }
  ];

  /* ---------------------------------------------------------------------
   * Redemption catalogue
   * ------------------------------------------------------------------- */
  var REDEMPTION_CATALOG = [
    {
      id: 'loyalty-reward-101', pointsCost: 10000, cartCredit: true,
      key: 'loyalty_reward_101_name', fallback: '₹100 ElectroMart store voucher',
      descKey: 'loyalty_reward_101_desc', fallbackDesc: 'A store voucher applied as a credit line in your next cart.',
      categoryKey: 'loyalty_category_voucher', categoryFallback: 'Voucher', art: 'voucher'
    },
    {
      id: 'loyalty-reward-102', pointsCost: 25000, cartCredit: true,
      key: 'loyalty_reward_102_name', fallback: '₹250 ElectroMart store voucher',
      descKey: 'loyalty_reward_102_desc', fallbackDesc: 'A larger voucher for a bigger basket or a second order.',
      categoryKey: 'loyalty_category_voucher', categoryFallback: 'Voucher', art: 'voucher'
    },
    {
      id: 'loyalty-reward-103', pointsCost: 50000, cartCredit: true,
      key: 'loyalty_reward_103_name', fallback: '₹500 ElectroMart store voucher',
      descKey: 'loyalty_reward_103_desc', fallbackDesc: 'The highest store voucher in the reward counter.',
      categoryKey: 'loyalty_category_voucher', categoryFallback: 'Voucher', art: 'voucher'
    },
    {
      id: 'loyalty-reward-104', pointsCost: 1500, cartCredit: false,
      key: 'loyalty_reward_104_name', fallback: 'Free standard shipping',
      descKey: 'loyalty_reward_104_desc', fallbackDesc: 'One standard shipping charge waived on an order over ₹499.',
      categoryKey: 'loyalty_category_shipping', categoryFallback: 'Shipping', art: 'shipping'
    },
    {
      id: 'loyalty-reward-105', pointsCost: 4000, cartCredit: false,
      key: 'loyalty_reward_105_name', fallback: 'Extended warranty, one year',
      descKey: 'loyalty_reward_105_desc', fallbackDesc: 'Adds one year to the manufacturer warranty on one appliance.',
      categoryKey: 'loyalty_category_warranty', categoryFallback: 'Warranty', art: 'warranty'
    },
    {
      id: 'loyalty-reward-106', pointsCost: 12000, cartCredit: true,
      key: 'loyalty_reward_106_name', fallback: '15% off one laptop',
      descKey: 'loyalty_reward_106_desc', fallbackDesc: 'A single-use discount code for one laptop order.',
      categoryKey: 'loyalty_category_discount', categoryFallback: 'Discount', art: 'cashback'
    },
    {
      id: 'loyalty-reward-107', pointsCost: 8000, cartCredit: true,
      key: 'loyalty_reward_107_name', fallback: '5% cashback voucher',
      descKey: 'loyalty_reward_107_desc', fallbackDesc: 'Five percent back as a store credit after your next order ships.',
      categoryKey: 'loyalty_category_cashback', categoryFallback: 'Cashback', art: 'cashback'
    },
    {
      id: 'loyalty-reward-108', pointsCost: 900, cartCredit: false,
      key: 'loyalty_reward_108_name', fallback: 'Early access pass, 24 hours',
      descKey: 'loyalty_reward_108_desc', fallbackDesc: 'Shop selected launches a full day before everyone else.',
      categoryKey: 'loyalty_category_access', categoryFallback: 'Access', art: 'earlyaccess'
    },
    {
      id: 'loyalty-reward-109', pointsCost: 6000, cartCredit: false,
      key: 'loyalty_reward_109_name', fallback: 'Three months of priority support',
      descKey: 'loyalty_reward_109_desc', fallbackDesc: 'Priority queue on chat and phone support for ninety days.',
      categoryKey: 'loyalty_category_support', categoryFallback: 'Support', art: 'support'
    },
    {
      id: 'loyalty-reward-110', pointsCost: 2500, cartCredit: false,
      key: 'loyalty_reward_110_name', fallback: 'Gift wrap and doorstep setup',
      descKey: 'loyalty_reward_110_desc', fallbackDesc: 'Gift wrapping plus in-home setup on one appliance delivery.',
      categoryKey: 'loyalty_category_service', categoryFallback: 'Service', art: 'shipping'
    }
  ];

  /* ---------------------------------------------------------------------
   * Partner offers. These are independent businesses; each sets its own terms,
   * which are printed on the slip. ElectroMart settles the points.
   * ------------------------------------------------------------------- */
  var PARTNER_OFFERS = [
    {
      id: 'loyalty-partner-201', category: 'dining', mark: 'SL', pointsCost: 2500,
      key: 'loyalty_partner_201_name', fallback: 'Saffron Leaf Kitchen',
      offerKey: 'loyalty_partner_201_offer', offerFallback: '20% off a table for two',
      descKey: 'loyalty_partner_201_desc', fallbackDesc: 'Modern Indian dining, valid on dine-in bookings after 6pm.',
      termsKey: 'loyalty_partner_201_terms', termsFallback: 'One table per member per visit. Not valid on festive menus.'
    },
    {
      id: 'loyalty-partner-202', category: 'dining', mark: 'CG', pointsCost: 1200,
      key: 'loyalty_partner_202_name', fallback: 'Coastline Grill House',
      offerKey: 'loyalty_partner_202_offer', offerFallback: 'Free dessert with any main course',
      descKey: 'loyalty_partner_202_desc', fallbackDesc: 'Grilled seafood and grills on the seafront promenade.',
      termsKey: 'loyalty_partner_202_terms', termsFallback: 'Dine-in only, one redemption per member per week.'
    },
    {
      id: 'loyalty-partner-203', category: 'travel', mark: 'HS', pointsCost: 6000,
      key: 'loyalty_partner_203_name', fallback: 'Harbourline Stays',
      offerKey: 'loyalty_partner_203_offer', offerFallback: '15% off a weekend stay',
      descKey: 'loyalty_partner_203_desc', fallbackDesc: 'Boutique properties across coastal and hill destinations.',
      termsKey: 'loyalty_partner_203_terms', termsFallback: 'Two nights minimum, weekends only, subject to partner availability.'
    },
    {
      id: 'loyalty-partner-204', category: 'travel', mark: 'SA', pointsCost: 8000,
      key: 'loyalty_partner_204_name', fallback: 'Skyward Airways',
      offerKey: 'loyalty_partner_204_offer', offerFallback: '₹500 travel credit on a domestic booking',
      descKey: 'loyalty_partner_204_desc', fallbackDesc: 'Domestic flight credit applied at the time of booking.',
      termsKey: 'loyalty_partner_204_terms', termsFallback: 'One credit per booking, not combinable with partner promotions.'
    },
    {
      id: 'loyalty-partner-205', category: 'entertainment', mark: 'RC', pointsCost: 3000,
      key: 'loyalty_partner_205_name', fallback: 'Reelhouse Cinemas',
      offerKey: 'loyalty_partner_205_offer', offerFallback: 'Two adult tickets for the price of one',
      descKey: 'loyalty_partner_205_desc', fallbackDesc: 'Standard and premium screens, any weekday showtime.',
      termsKey: 'loyalty_partner_205_terms', termsFallback: 'Weekday shows only. IMAX and premium formats carry a surcharge.'
    },
    {
      id: 'loyalty-partner-206', category: 'entertainment', mark: 'CM', pointsCost: 1800,
      key: 'loyalty_partner_206_name', fallback: 'Cadence Music Hall',
      offerKey: 'loyalty_partner_206_offer', offerFallback: '25% off an evening ticket',
      descKey: 'loyalty_partner_206_desc', fallbackDesc: 'Live indie, folk and jazz performances every weekend.',
      termsKey: 'loyalty_partner_206_terms', termsFallback: 'Standby and balcony tiers only, one ticket per member per show.'
    },
    {
      id: 'loyalty-partner-207', category: 'services', mark: 'UH', pointsCost: 4500,
      key: 'loyalty_partner_207_name', fallback: 'UrbanCare Home Services',
      offerKey: 'loyalty_partner_207_offer', offerFallback: 'One free appliance deep clean',
      descKey: 'loyalty_partner_207_desc', fallbackDesc: 'In-home deep cleaning for one large appliance.',
      termsKey: 'loyalty_partner_207_terms', termsFallback: 'Metro serviceable pin codes only, 14-day advance booking.'
    },
    {
      id: 'loyalty-partner-208', category: 'services', mark: 'VP', pointsCost: 7500,
      key: 'loyalty_partner_208_name', fallback: 'Verdant Plan Insurance',
      offerKey: 'loyalty_partner_208_offer', offerFallback: '10% off a first policy year',
      descKey: 'loyalty_partner_208_desc', fallbackDesc: 'Appliance and extended-warranty cover for the first year.',
      termsKey: 'loyalty_partner_208_terms', termsFallback: 'First policy only, excludes pre-existing damage, underwriting applies.'
    }
  ];

  var PARTNER_CATEGORIES = [
    { id: 'all', key: 'loyalty_partner_category_all', fallback: 'All categories' },
    { id: 'dining', key: 'loyalty_partner_category_dining', fallback: 'Dining' },
    { id: 'travel', key: 'loyalty_partner_category_travel', fallback: 'Travel' },
    { id: 'entertainment', key: 'loyalty_partner_category_entertainment', fallback: 'Entertainment' },
    { id: 'services', key: 'loyalty_partner_category_services', fallback: 'Services' }
  ];

  /* ---------------------------------------------------------------------
   * Referral rules
   * ------------------------------------------------------------------- */
  var REFERRAL_CODE_PATTERN = /^EM-REF-[A-Z0-9]{6,12}$/;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var REFERRAL_CODE_PREFIX = 'EM-REF-';
  var MEMBER_CODE_SEED = 'ELECTROMART-LOYALTY-MEMBER-01';
  var REFERRAL_LINK_BASE = 'https://electromart.in/index.html';

  /* ---------------------------------------------------------------------
   * In-memory state
   * ------------------------------------------------------------------- */
  var memoryStorage = createMemoryStorage();
  var profile = null;
  var referrals = [];
  var redemptions = [];
  var partnerFilter = 'all';
  // The purchase row is re-rendered whenever the ledger changes, so the entered
  // order value lives here rather than only in the DOM. Without this, typing an
  // amount and claiming a second reward would silently discard it.
  var earnOrderValue = '';

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
      // The global storage binding can also be denied.
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

  function readJsonMap(key) {
    var parsed = parseJson(readStorage(key), {});
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
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

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
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
    return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function money(value) {
    return '₹' + formatNumber(value);
  }

  /* Multipliers are quarters: 1, 1.25, 1.5 and 2. The rupee formatter rounds to
     whole units, which would report a 1.25x tier as 1x and a 1.5x tier as 2x, so
     these get their own formatter that keeps the fraction. */
  function formatMultiplier(value) {
    var rounded = String(Math.round(numberOr(value, 1) * 100) / 100);
    if (rounded.indexOf('.') === -1) return rounded;
    return rounded.replace(/0+$/, '').replace(/\.$/, '');
  }

  function interpolate(template, replacements) {
    return String(template).replace(/\{(\w+)\}/g, function (match, token) {
      return Object.prototype.hasOwnProperty.call(replacements, token) ? String(replacements[token]) : match;
    });
  }

  /* ---------------------------------------------------------------------
   * Deterministic reference tokens
   * ------------------------------------------------------------------- *
   * Referral identifiers are a hash of the request rather than a counter, so
   * the same referrer and the same referee always resolve to the same line.
   * That is what stops one person being counted twice. */
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
      state = hashString('EM|' + prefix + '|' + state + '|' + index + '|' + seed);
      token += CODE_ALPHABET.charAt(state % CODE_ALPHABET.length);
    }
    return prefix + token;
  }

  /* ---------------------------------------------------------------------
   * Language
   * ------------------------------------------------------------------- *
   * The shared translator falls back to "hi" when no preference is stored and
   * paints the static data-i18n chrome in that language. This page must
   * resolve the same key with the same default or a first-time visitor sees a
   * page that is half-Hindi and half-English. Both storage keys are always
   * written together so every page in the storefront agrees on the language. */
  var DEFAULT_LANGUAGE = 'hi';

  function readStoredLanguage() {
    for (var index = 0; index < LANGUAGE_STORAGE_KEYS.length; index += 1) {
      var stored = readStorage(LANGUAGE_STORAGE_KEYS[index]);
      if (stored) return String(stored).toLowerCase();
    }
    return DEFAULT_LANGUAGE;
  }

  function syncLanguageStorage() {
    var language = readStoredLanguage();
    LANGUAGE_STORAGE_KEYS.forEach(function (key) {
      if (readStorage(key) !== language) writeStorage(key, language);
    });
    syncDocumentLanguage(language);
    return language;
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
      documentNode.setAttribute('dir', language === 'ur' ? 'rtl' : 'ltr');
    } catch (error) {
      // A missing document element is the only realistic failure and is harmless.
    }
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
    status.className = 'loyalty-status' + (targetId === 'referralStatus' ? ' loyalty-status--dark' : '') + ' is-' + (kind || 'info');
    status.hidden = !message;
  }

  /* Moves keyboard focus to a freshly rendered status line so assistive tech
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
   * Table lookups
   * ------------------------------------------------------------------- */
  function findTier(tierId) {
    var key = cleanText(tierId, 16).toLowerCase();
    for (var index = 0; index < TIER_LADDER.length; index += 1) {
      if (TIER_LADDER[index].tier === key) return TIER_LADDER[index];
    }
    return null;
  }

  function getTierLabel(tierId) {
    var entry = findTier(tierId);
    return entry ? text(entry.key, entry.fallback) : text('loyalty_tier_bronze', 'Bronze');
  }

  function getEarnMultiplierX4(tierId) {
    var entry = findTier(tierId);
    return entry ? entry.earnMultiplierX4 : TIER_LADDER[0].earnMultiplierX4;
  }

  function findReward(rewardId) {
    var key = cleanText(rewardId, 60);
    for (var index = 0; index < REDEMPTION_CATALOG.length; index += 1) {
      if (REDEMPTION_CATALOG[index].id === key) return REDEMPTION_CATALOG[index];
    }
    return null;
  }

  function findPartner(partnerId) {
    var key = cleanText(partnerId, 60);
    for (var index = 0; index < PARTNER_OFFERS.length; index += 1) {
      if (PARTNER_OFFERS[index].id === key) return PARTNER_OFFERS[index];
    }
    return null;
  }

  function findEarnAction(actionId) {
    var key = cleanText(actionId, 24);
    for (var index = 0; index < EARN_ACTIONS.length; index += 1) {
      if (EARN_ACTIONS[index].id === key) return EARN_ACTIONS[index];
    }
    return null;
  }

  function isPartnerCategory(categoryId) {
    var key = cleanText(categoryId, 20).toLowerCase();
    for (var index = 0; index < PARTNER_CATEGORIES.length; index += 1) {
      if (PARTNER_CATEGORIES[index].id === key) return PARTNER_CATEGORIES[index];
    }
    return PARTNER_CATEGORIES[0];
  }

  /* ---------------------------------------------------------------------
   * Tier engine
   * ------------------------------------------------------------------- *
   * Pure and total: any input resolves to a tier, and identical points always
   * resolve to the identical tier. There is no clock and no randomness here. */
  function calculateTier(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var points = Math.max(0, Math.round(numberOr(safeInput.points, 0)));
    if (!isFinite(points)) points = 0;

    var resolved = TIER_LADDER[0];
    for (var index = 0; index < TIER_LADDER.length; index += 1) {
      if (points >= TIER_LADDER[index].minPoints) resolved = TIER_LADDER[index];
    }

    var nextIndex = -1;
    for (var next = 0; next < TIER_LADDER.length; next += 1) {
      if (TIER_LADDER[next].minPoints > points) { nextIndex = next; break; }
    }
    var nextTier = nextIndex === -1 ? null : TIER_LADDER[nextIndex];

    var pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - points) : 0;
    var span = nextTier ? nextTier.minPoints - resolved.minPoints : 1;
    var progressPercent = nextTier
      ? clamp(Math.round(((points - resolved.minPoints) / span) * 100), 0, 100)
      : 100;

    return {
      points: points,
      tier: resolved.tier,
      tierLabel: text(resolved.key, resolved.fallback),
      minPoints: resolved.minPoints,
      nextTier: nextTier ? nextTier.tier : '',
      nextTierLabel: nextTier ? text(nextTier.key, nextTier.fallback) : '',
      nextTierPoints: nextTier ? nextTier.minPoints : 0,
      pointsToNext: pointsToNext,
      progressPercent: progressPercent,
      earnMultiplier: getEarnMultiplierX4(resolved.tier) / 4,
      earnMultiplierX4: getEarnMultiplierX4(resolved.tier),
      perks: resolved.perks.slice(),
      isTopTier: nextTier === null
    };
  }

  /* ---------------------------------------------------------------------
   * Redemption value engine
   * ------------------------------------------------------------------- *
   * One flat rate for every member at every tier: 100 points are worth ₹1.
   * This is deliberately not multiplied by the tier, which is why the copy on
   * the page states the rate in full. */
  function calculateRedemptionValue(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var points = Math.max(0, Math.round(numberOr(safeInput.points, numberOr(safeInput.pointsToUse, 0))));
    if (!isFinite(points)) points = 0;
    return {
      points: points,
      value: Math.round(points / POINTS_PER_RUPEE),
      pointsPerRupee: POINTS_PER_RUPEE,
      rate: POINTS_PER_RUPEE
    };
  }

  /* ---------------------------------------------------------------------
   * Points-to-order engine
   * ------------------------------------------------------------------- *
   * Up to half the value of the order in points, and never more than the
   * 50,000 point ceiling. Returns exactly what it will deduct and credit, so
   * the same call on checkout produces the same figures on the ledger. */
  function applyPointsToCart(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var cartTotal = Math.max(0, numberOr(safeInput.cartTotal, 0));
    if (!isFinite(cartTotal)) cartTotal = 0;
    var availablePoints = Math.max(0, Math.round(numberOr(safeInput.availablePoints, 0)));
    if (!isFinite(availablePoints)) availablePoints = 0;

    var shareCapPoints = Math.floor(cartTotal * POINTS_PER_RUPEE * MAX_POINTS_ORDER_SHARE);
    var cap = clamp(Math.min(shareCapPoints, MAX_POINTS_PER_ORDER), 0, MAX_POINTS_PER_ORDER);
    var pointsUsed = clamp(Math.min(availablePoints, cap), 0, cap);
    // Discount is the flat conversion, rounded to the nearest rupee, exactly
    // as the contract defines it.
    var discountAmount = Math.round(pointsUsed / POINTS_PER_RUPEE);
    var payableAmount = Math.max(0, cartTotal - discountAmount);

    return {
      cartTotal: cartTotal,
      availablePoints: availablePoints,
      pointsUsed: pointsUsed,
      discountAmount: discountAmount,
      payableAmount: payableAmount,
      balanceAfter: Math.max(0, availablePoints - pointsUsed),
      maxPointsForOrder: cap,
      maxPointsCeiling: MAX_POINTS_PER_ORDER,
      orderSharePercent: MAX_POINTS_ORDER_SHARE * 100,
      pointsPerRupee: POINTS_PER_RUPEE,
      hitCeiling: cap === MAX_POINTS_PER_ORDER && MAX_POINTS_PER_ORDER <= shareCapPoints,
      hitBalanceLimit: pointsUsed === availablePoints && availablePoints < cap,
      noPointsAvailable: availablePoints === 0
    };
  }

  /* ---------------------------------------------------------------------
   * Earning engine
   * ------------------------------------------------------------------- *
   * Purchase points use the tier multiplier. Fixed action bonuses are not
   * multiplied, because multiplying a thank-you for writing a review would be
   * strange. */
  function calculateEarnPoints(actionId, orderValue, tierId) {
    var action = findEarnAction(actionId);
    if (!action) return { actionId: '', points: 0, rateBased: false, reasonKey: 'loyalty_earn_unknown', reason: text('loyalty_earn_unknown', 'That earning action is not recognised.') };

    if (action.rateBased) {
      var value = Math.max(0, numberOr(orderValue, 0));
      if (!isFinite(value) || value <= 0) {
        return { actionId: action.id, points: 0, rateBased: true, reasonKey: 'loyalty_earn_bad_order_value', reason: text('loyalty_earn_bad_order_value', 'Enter the order value in rupees before recording a purchase.') };
      }
      // Integer-only arithmetic: multiply by ten, by the tier over four, then
      // divide by a hundred, and floor once at the end.
      var points = Math.floor((value * EARN_POINTS_PER_100_RUPEES * getEarnMultiplierX4(tierId)) / (POINTS_PER_RUPEE * 4));
      return {
        actionId: action.id,
        points: Math.max(0, points),
        rateBased: true,
        orderValue: value,
        earnMultiplier: getEarnMultiplierX4(tierId) / 4,
        pointsPer100: EARN_POINTS_PER_100_RUPEES,
        reasonKey: 'loyalty_earn_purchase_recorded',
        reason: interpolate(text('loyalty_earn_purchase_recorded', 'Recorded {value} at {multiplier}x earning for {points} points.'), {
          value: money(value),
          multiplier: formatMultiplier(getEarnMultiplierX4(tierId) / 4),
          points: formatNumber(Math.max(0, points))
        })
      };
    }

    return {
      actionId: action.id,
      points: action.fixedPoints,
      rateBased: false,
      once: Boolean(action.once),
      reasonKey: 'loyalty_earn_fixed_recorded',
      reason: interpolate(text('loyalty_earn_fixed_recorded', '{points} points added to your ledger.'), {
        points: formatNumber(action.fixedPoints)
      })
    };
  }

  /* ---------------------------------------------------------------------
   * Profile persistence
   * ------------------------------------------------------------------- */
  function createProfile() {
    return {
      points: 0,
      lifetimePoints: 0,
      redeemedPoints: 0,
      memberSince: '',
      // The member's own code is derived from a fixed seed rather than a
      // clock or a random source, so it is identical on every device that has
      // never recorded a code and stays put for the life of the profile.
      referralCode: buildReference(REFERRAL_CODE_PREFIX, MEMBER_CODE_SEED),
      claims: {},
      earnMultiplierX4: TIER_LADDER[0].earnMultiplierX4
    };
  }

  function sanitizeProfile(rawProfile) {
    var base = createProfile();
    if (!rawProfile || typeof rawProfile !== 'object' || Array.isArray(rawProfile)) return base;
    var points = Math.max(0, Math.round(numberOr(rawProfile.points, 0)));
    return {
      points: isFinite(points) ? points : 0,
      lifetimePoints: Math.max(0, Math.round(numberOr(rawProfile.lifetimePoints, points))),
      redeemedPoints: Math.max(0, Math.round(numberOr(rawProfile.redeemedPoints, 0))),
      memberSince: cleanText(rawProfile.memberSince, 10),
      referralCode: REFERRAL_CODE_PATTERN.test(cleanText(rawProfile.referralCode, 24).toUpperCase())
        ? cleanText(rawProfile.referralCode, 24).toUpperCase()
        : base.referralCode,
      claims: rawProfile.claims && typeof rawProfile.claims === 'object' && !Array.isArray(rawProfile.claims)
        ? rawProfile.claims
        : {},
      earnMultiplierX4: getEarnMultiplierX4(
        calculateTier({ points: points }).tier
      )
    };
  }

  function loadProfile() {
    profile = sanitizeProfile(parseJson(readStorage(PROFILE_STORAGE_KEY), null));
    return profile;
  }

  function saveProfile() {
    profile.earnMultiplierX4 = getEarnMultiplierX4(calculateTier({ points: profile.points }).tier);
    return writeStorage(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }

  function loadRedemptions() {
    var parsed = parseJson(readStorage(REDEMPTIONS_STORAGE_KEY), []);
    redemptions = Array.isArray(parsed) ? parsed.filter(function (entry) {
      return entry && typeof entry === 'object' && !Array.isArray(entry);
    }).slice(-MAX_REDEMPTIONS) : [];
    return redemptions;
  }

  function saveRedemptions() {
    return writeStorage(REDEMPTIONS_STORAGE_KEY, JSON.stringify(redemptions.slice(-MAX_REDEMPTIONS)));
  }

  function loadReferrals() {
    var parsed = parseJson(readStorage(REFERRALS_STORAGE_KEY), []);
    referrals = Array.isArray(parsed) ? parsed.map(sanitizeReferral).filter(Boolean).slice(-MAX_REFERRALS) : [];
    return referrals;
  }

  function saveReferrals() {
    return writeStorage(REFERRALS_STORAGE_KEY, JSON.stringify(referrals.slice(-MAX_REFERRALS)));
  }

  function getEarningShelf() {
    var catalog = Array.isArray(root.EM_CATALOG) ? root.EM_CATALOG : [];
    var tier = calculateTier({ points: profile.points });
    var shelf = [];
    for (var index = 0; index < catalog.length && shelf.length < EARNING_SHELF_SIZE; index += 1) {
      var product = catalog[index];
      if (!product || !product.id) continue;
      var price = Math.max(0, numberOr(product.price, 0));
      if (price <= 0) continue;
      shelf.push({
        id: String(product.id),
        name: cleanText(product.name, 140) || String(product.id),
        brand: cleanText(product.brand, 40),
        category: cleanText(product.category, 40),
        price: price,
        art: resolveProductArt(product),
        earnPoints: calculateEarnPoints('purchase', price, tier.tier).points,
        redemptionValue: calculateRedemptionValue({ points: calculateEarnPoints('purchase', price, tier.tier).points }).value
      });
    }
    return shelf;
  }

  /* Maps a catalogue product onto one of the CSS-art glyph families, by
     matching its own category and title text. No sampling, no randomness. */
  function resolveProductArt(product) {
    var signal = [product.category, product.name, product.title, product.tags].filter(Boolean).join(' ').toLowerCase();
    if (/laptop|notebook|chromebook|ultrabook/.test(signal)) return 'laptop';
    if (/monitor|display|panel/.test(signal)) return 'monitor';
    if (/mobile|phone|tablet/.test(signal)) return 'mobile';
    if (/audio|headphone|earphone|speaker/.test(signal)) return 'audio';
    if (/watch|wearable|band/.test(signal)) return 'wearable';
    if (/camera/.test(signal)) return 'camera';
    if (/printer|scanner/.test(signal)) return 'printer';
    if (/appliance|refrigerator|washing|air|microwave|kitchen/.test(signal)) return 'appliance';
    return 'device';
  }

  /* ---------------------------------------------------------------------
   * Redemptions
   * ------------------------------------------------------------------- */
  function recordRedemption(record) {
    redemptions.push(record);
    if (redemptions.length > MAX_REDEMPTIONS) redemptions = redemptions.slice(-MAX_REDEMPTIONS);
    if (!saveRedemptions()) {
      redemptions.pop();
      return null;
    }
    return record;
  }

  /**
   * Redeem a reward or a partner offer. Points must be available; the reward
   * is written into the ledger and, where the reward is a monetary one, into
   * the cart as a credit line rather than as a discount on goods.
   */
  function redeemReward(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var reward = findReward(safeInput.rewardId);
    var partner = findPartner(safeInput.partnerId);
    var subject = reward || partner;
    if (!subject) {
      return { ok: false, pointsSpent: 0, reasonKey: 'loyalty_redemption_unknown', reason: text('loyalty_redemption_unknown', 'That reward is no longer in the catalogue.') };
    }

    var kind = reward ? 'reward' : 'partner';
    var pointsCost = Math.max(0, Math.round(numberOr(subject.pointsCost, 0)));
    if (pointsCost <= 0) {
      return { ok: false, pointsSpent: 0, reasonKey: 'loyalty_redemption_no_cost', reason: text('loyalty_redemption_no_cost', 'That item has no points price.') };
    }

    if (profile.points < pointsCost) {
      return {
        ok: false,
        pointsSpent: 0,
        pointsCost: pointsCost,
        pointsShort: pointsCost - profile.points,
        reasonKey: 'loyalty_redemption_short',
        reason: interpolate(text('loyalty_redemption_short', 'You need {short} more points for this reward.'), {
          short: formatNumber(pointsCost - profile.points)
        })
      };
    }

    profile.points -= pointsCost;
    profile.redeemedPoints += pointsCost;
    var redemptionId = buildReference('EM-RED-', [kind, subject.id, String(pointsCost)].join('|'));
    var record = {
      redemptionId: redemptionId,
      kind: kind,
      itemId: subject.id,
      pointsSpent: pointsCost,
      rupeeValue: calculateRedemptionValue({ points: pointsCost }).value,
      balanceAfter: profile.points,
      status: 'claimed'
    };

    if (!recordRedemption(record) || !saveProfile()) {
      profile.points += pointsCost;
      profile.redeemedPoints -= pointsCost;
      saveProfile();
      return { ok: false, pointsSpent: 0, reasonKey: 'loyalty_storage_error', reason: text('loyalty_storage_error', 'We could not save that claim on this device. Please try again.') };
    }

    if (kind === 'reward' && reward.cartCredit) addRewardCartLine(record, reward);

    return {
      ok: true,
      redemptionId: redemptionId,
      kind: kind,
      itemId: subject.id,
      pointsSpent: pointsCost,
      rupeeValue: record.rupeeValue,
      balanceAfter: profile.points,
      reasonKey: 'loyalty_redemption_claimed',
      reason: interpolate(
        text('loyalty_redemption_claimed', '{name} claimed for {points} points. {value} added as cart credit, {balance} points left.'),
        {
          name: text(subject.key, subject.fallback),
          points: formatNumber(pointsCost),
          value: money(record.rupeeValue),
          balance: formatNumber(profile.points)
        }
      )
    };
  }

  /* A voucher reward is a store credit line in the cart, never a silent
     discount on the goods themselves, so the cart subtotal stays honest. */
  function addRewardCartLine(record, reward) {
    var id = 'loyalty-voucher-' + record.redemptionId.replace(/[^A-Z0-9]/gi, '').toLowerCase();
    var cartMap = readJsonMap(CART_STORAGE_KEY);
    cartMap[id] = 1;
    if (!writeStorage(CART_STORAGE_KEY, JSON.stringify(cartMap))) return false;

    var catalogMap = readJsonMap(CATALOG_STORAGE_KEY);
    catalogMap[id] = {
      id: id,
      name: text(reward.key, reward.fallback),
      price: 0,
      listPrice: 0,
      image: '',
      stock: 1,
      category: 'loyalty-voucher',
      hsnCode: '997321',
      gstRate: 0,
      segment: 'loyalty',
      itcEligible: false,
      isLoyaltyVoucher: true,
      faceValue: record.rupeeValue,
      pointsSpent: record.pointsSpent
    };
    writeStorage(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
    dispatch('cart:updated', { id: id, name: catalogMap[id].name, price: 0, quantity: 1 });
    dispatch('electromart:loyaltyVoucherApplied', { id: id, redemptionId: record.redemptionId });
    return true;
  }

  /* ---------------------------------------------------------------------
   * Referral engine
   * ------------------------------------------------------------------- */
  function sanitizeReferral(rawReferral) {
    if (!rawReferral || typeof rawReferral !== 'object' || Array.isArray(rawReferral)) return null;
    var code = cleanText(rawReferral.referralId, 32);
    if (!REFERRAL_CODE_PATTERN.test(code.toUpperCase())) return null;
    return {
      referralId: code.toUpperCase(),
      referrerCode: cleanText(rawReferral.referrerCode, 24).toUpperCase(),
      refereeEmail: cleanText(rawReferral.refereeEmail, 120).toLowerCase(),
      refereeName: cleanText(rawReferral.refereeName, 60),
      referrerBonus: Math.max(0, Math.round(numberOr(rawReferral.referrerBonus, REFERRER_BONUS_POINTS))),
      refereeBonus: Math.max(0, Math.round(numberOr(rawReferral.refereeBonus, REFEREE_BONUS_POINTS))),
      status: ['pending', 'completed', 'expired'].indexOf(rawReferral.status) === -1 ? 'pending' : rawReferral.status,
      recordedOn: cleanText(rawReferral.recordedOn, 10)
    };
  }

  function rejectReferral(reasonKey, reason) {
    return {
      ok: false,
      referralId: '',
      referrerCode: '',
      referrerBonus: 0,
      refereeBonus: 0,
      status: 'rejected',
      reasonKey: reasonKey,
      reason: reason
    };
  }

  /**
   * Referral processing. The identifier is a hash of the referrer code and the
   * referee's email address, so the same invitation always resolves to the
   * same line: recording it twice cannot mint a second bonus.
   */
  function processReferral(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var referrerCode = cleanText(safeInput.referrerCode, 24).toUpperCase();
    var refereeEmail = cleanText(safeInput.refereeEmail, 120).toLowerCase();
    var refereeName = cleanText(safeInput.refereeName, 60);

    if (!REFERRAL_CODE_PATTERN.test(referrerCode)) {
      return rejectReferral(
        'loyalty_referral_bad_code',
        text('loyalty_referral_bad_code', 'That referral code is not in the EM-REF-XXXXXX format. Check it and try again.')
      );
    }
    if (!EMAIL_PATTERN.test(refereeEmail)) {
      return rejectReferral(
        'loyalty_referral_bad_email',
        text('loyalty_referral_bad_email', "Enter the email address your friend signed up with.")
      );
    }
    if (refereeName.length < 2) {
      return rejectReferral(
        'loyalty_referral_bad_name',
        text('loyalty_referral_bad_name', "Enter the name your friend gave you.")
      );
    }

    var referralId = buildReference(REFERRAL_CODE_PREFIX, [referrerCode, refereeEmail].join('|'));

    for (var index = 0; index < referrals.length; index += 1) {
      if (referrals[index].referralId === referralId) {
        return withReferralMeta(referrals[index], true);
      }
    }

    var referral = {
      referralId: referralId,
      referrerCode: referrerCode,
      refereeEmail: refereeEmail,
      refereeName: refereeName,
      referrerBonus: REFERRER_BONUS_POINTS,
      refereeBonus: REFEREE_BONUS_POINTS,
      status: 'pending',
      recordedOn: ''
    };

    referrals.push(referral);
    if (referrals.length > MAX_REFERRALS) referrals = referrals.slice(-MAX_REFERRALS);
    if (!saveReferrals()) {
      referrals.pop();
      return rejectReferral('loyalty_storage_error', text('loyalty_storage_error', 'We could not save that invitation on this device. Please try again.'));
    }
    return withReferralMeta(referral, false);
  }

  function withReferralMeta(referral, existed) {
    return {
      ok: true,
      referralId: referral.referralId,
      referrerCode: referral.referrerCode,
      refereeEmail: referral.refereeEmail,
      refereeName: referral.refereeName,
      referrerBonus: referral.referrerBonus,
      refereeBonus: referral.refereeBonus,
      status: referral.status,
      recordedOn: referral.recordedOn,
      reused: Boolean(existed),
      totalInvited: referrals.length,
      reasonKey: existed ? 'loyalty_referral_already_recorded' : 'loyalty_referral_recorded',
      reason: existed
        ? interpolate(text('loyalty_referral_already_recorded', '{name} is already on your ledger as {code}. No second bonus was created.'), {
          name: referral.refereeName,
          code: referral.referralId
        })
        : interpolate(
          text('loyalty_referral_recorded', 'Invitation {code} recorded for {name}. {points} points credit once their first order ships.'),
          {
            code: referral.referralId,
            name: referral.refereeName,
            points: formatNumber(referral.referrerBonus)
          }
        )
    };
  }

  /* ---------------------------------------------------------------------
   * Recording an earning action
   * ------------------------------------------------------------------- */
  function recordEarning(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var action = findEarnAction(safeInput.actionId);
    if (!action) {
      return { ok: false, pointsAdded: 0, reasonKey: 'loyalty_earn_unknown', reason: text('loyalty_earn_unknown', 'That earning action is not recognised.') };
    }

    if (action.once && profile.claims[action.id]) {
      return {
        ok: false,
        pointsAdded: 0,
        reasonKey: 'loyalty_earn_already_claimed',
        reason: text('loyalty_earn_already_claimed', 'That one-time bonus is already on your ledger.')
      };
    }

    var tier = calculateTier({ points: profile.points });
    var earned = calculateEarnPoints(action.id, safeInput.orderValue, tier.tier);
    if (earned.points <= 0) {
      return { ok: false, pointsAdded: 0, reasonKey: earned.reasonKey, reason: earned.reason };
    }

    var previousTier = tier.tier;
    profile.points += earned.points;
    profile.lifetimePoints += earned.points;
    profile.claims[action.id] = true;
    if (!saveProfile()) {
      profile.points -= earned.points;
      profile.lifetimePoints -= earned.points;
      delete profile.claims[action.id];
      saveProfile();
      return { ok: false, pointsAdded: 0, reasonKey: 'loyalty_storage_error', reason: text('loyalty_storage_error', 'We could not save that on this device. Please try again.') };
    }

    var newTier = calculateTier({ points: profile.points });
    return {
      ok: true,
      actionId: action.id,
      pointsAdded: earned.points,
      pointsBalance: profile.points,
      redemptionValue: calculateRedemptionValue({ points: profile.points }).value,
      tierBefore: previousTier,
      tierAfter: newTier.tier,
      tierChanged: newTier.tier !== previousTier,
      reasonKey: earned.reasonKey,
      reason: earned.reason
    };
  }

  /* ---------------------------------------------------------------------
   * Markup fragments
   * ------------------------------------------------------------------- */
  function artMarkup(art, modifier) {
    return '<span class="loyalty-art loyalty-art--' + escapeHtml(art) + (modifier ? ' ' + escapeHtml(modifier) : '') + '" aria-hidden="true">' +
      '<span class="art-note"></span><span class="art-box"></span><span class="art-shield"></span>' +
      '<span class="art-coin"></span><span class="art-clock"></span><span class="art-headset"></span>' +
      '<span class="art-ticket"></span><span class="art-pad"></span>' +
      '</span>';
  }

  function renderRedemptionCatalog() {
    var grid = byId('redemptionGrid');
    var empty = byId('redemptionGridEmpty');
    var skeleton = byId('redemptionSkeleton');
    var meta = byId('redemptionCatalogMeta');
    if (skeleton) skeleton.hidden = true;
    if (!grid) return;

    var tier = calculateTier({ points: profile.points });

    if (!REDEMPTION_CATALOG.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      if (empty) {
        empty.textContent = text('loyalty_redemption_empty', 'No rewards are available for redemption right now. Please check back soon.');
        empty.hidden = false;
      }
      if (meta) meta.textContent = '';
      return;
    }

    grid.innerHTML = REDEMPTION_CATALOG.map(function (reward, index) {
      var affordable = profile.points >= reward.pointsCost;
      var shortfall = Math.max(0, reward.pointsCost - profile.points);
      var worth = calculateRedemptionValue({ points: reward.pointsCost }).value;
      return '<article class="loyalty-stub' + (affordable ? '' : ' is-locked') + '" style="animation-delay:' + Math.min(index * 45, 320) + 'ms">' +
        '<div class="loyalty-stub__top">' +
          '<span class="loyalty-stub__art">' + artMarkup(reward.art) + '</span>' +
          '<span class="loyalty-stub__cost">' +
            '<strong>' + escapeHtml(formatNumber(reward.pointsCost)) + '</strong>' +
            '<span data-i18n="loyalty_points_unit">points</span>' +
          '</span>' +
        '</div>' +
        '<div class="loyalty-stub__body">' +
          '<span class="loyalty-stub__category">' + escapeHtml(text(reward.categoryKey, reward.categoryFallback)) + '</span>' +
          '<h3>' + escapeHtml(text(reward.key, reward.fallback)) + '</h3>' +
          '<p class="loyalty-stub__desc">' + escapeHtml(text(reward.descKey, reward.fallbackDesc)) + '</p>' +
          '<p class="loyalty-stub__worth"><span data-i18n="loyalty_reward_worth_label">Worth</span> <strong>' + escapeHtml(money(worth)) + '</strong></p>' +
        '</div>' +
        '<div class="loyalty-stub__foot">' +
          '<p class="loyalty-stub__balance' + (affordable ? '' : ' is-short') + '">' +
            (affordable
              ? interpolate(text('loyalty_reward_affordable', 'Balance after: {points} points'), { points: formatNumber(profile.points - reward.pointsCost) })
              : interpolate(text('loyalty_reward_short', '{short} points short of this reward'), { short: formatNumber(shortfall) })) +
          '</p>' +
          '<button type="button" class="btn-loyalty btn-loyalty--stamp" data-loyalty-redeem="' + escapeHtml(reward.id) + '"' +
            (affordable ? '' : ' aria-disabled="true" disabled') + '>' +
            escapeHtml(text('loyalty_redeem_btn', 'Redeem')) +
          '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    if (empty) empty.hidden = true;
    if (meta) {
      meta.textContent = formatNumber(REDEMPTION_CATALOG.length) + ' ' +
        text('loyalty_redemption_items_label', 'rewards') + ' · ' +
        text(getTierLabelKey(tier.tier), tier.tierLabel);
    }
  }

  function getTierLabelKey(tierId) {
    var entry = findTier(tierId);
    return entry ? entry.key : 'loyalty_tier_bronze';
  }

  function renderTierBenefits() {
    var grid = byId('tierBenefitsGrid');
    if (!grid) return;
    var currentTier = calculateTier({ points: profile.points }).tier;

    grid.innerHTML = TIER_LADDER.map(function (tier, index) {
      var reached = profile.points >= tier.minPoints;
      var isCurrent = tier.tier === currentTier;
      return '<article class="loyalty-benefit loyalty-benefit--' + escapeHtml(tier.tier) + (isCurrent ? ' is-current' : '') + '" style="animation-delay:' + Math.min(index * 60, 300) + 'ms">' +
        '<header class="loyalty-benefit__head">' +
          '<span class="loyalty-benefit__tier">' + escapeHtml(text(tier.key, tier.fallback)) + '</span>' +
          '<span class="loyalty-benefit__threshold">' + escapeHtml(formatNumber(tier.minPoints)) + '+</span>' +
        '</header>' +
        '<ul class="loyalty-benefit__list">' +
          tier.perks.map(function (perkKey) {
            return '<li class="' + (reached ? '' : 'is-locked') + '">' +
              escapeHtml(text(perkKey, PERK_TEXT[perkKey] || perkKey)) + '</li>';
          }).join('') +
        '</ul>' +
        '<p class="loyalty-benefit__mult">' +
          '<span data-i18n="loyalty_benefit_multiplier_label">Purchase earning</span>' +
          '<strong>' + escapeHtml(formatMultiplier(tier.earnMultiplierX4 / 4)) + '×</strong>' +
        '</p>' +
      '</article>';
    }).join('');
  }

  function renderPartnerOffers() {
    var grid = byId('partnerOffersGrid');
    var empty = byId('partnerOffersEmpty');
    var skeleton = byId('partnerOffersSkeleton');
    if (skeleton) skeleton.hidden = true;
    if (!grid) return;

    var filter = isPartnerCategory(partnerFilter);
    var visible = filter.id === 'all'
      ? PARTNER_OFFERS.slice()
      : PARTNER_OFFERS.filter(function (offer) { return offer.category === filter.id; });

    if (!visible.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      if (empty) {
        empty.textContent = text('loyalty_partner_empty', 'No partner offers match that category right now. Please choose another category.');
        empty.hidden = false;
      }
      return;
    }

    grid.innerHTML = visible.map(function (offer, index) {
      var affordable = profile.points >= offer.pointsCost;
      var category = isPartnerCategory(offer.category);
      return '<article class="loyalty-slip loyalty-slip--' + escapeHtml(offer.category) + '" style="animation-delay:' + Math.min(index * 50, 300) + 'ms">' +
        '<header class="loyalty-slip__head">' +
          '<span class="loyalty-partner-mark" aria-hidden="true"><span>' + escapeHtml(offer.mark) + '</span></span>' +
          '<span class="loyalty-slip__identity">' +
            '<span class="loyalty-slip__partner">' + escapeHtml(text(offer.key, offer.fallback)) + '</span>' +
            '<span class="loyalty-slip__category">' + escapeHtml(text(category.key, category.fallback)) + '</span>' +
          '</span>' +
        '</header>' +
        '<p class="loyalty-slip__offer">' + escapeHtml(text(offer.offerKey, offer.offerFallback)) + '</p>' +
        '<p class="loyalty-slip__desc">' + escapeHtml(text(offer.descKey, offer.fallbackDesc)) + '</p>' +
        '<p class="loyalty-slip__terms">' + escapeHtml(text(offer.termsKey, offer.termsFallback)) + '</p>' +
        '<footer class="loyalty-slip__foot">' +
          '<span class="loyalty-slip__cost">' +
            '<strong>' + escapeHtml(formatNumber(offer.pointsCost)) + '</strong>' +
            '<span data-i18n="loyalty_points_unit">points</span>' +
          '</span>' +
          '<button type="button" class="btn-loyalty btn-loyalty--quiet" data-loyalty-redeem-partner="' + escapeHtml(offer.id) + '"' +
            (affordable ? '' : ' aria-disabled="true" disabled') + '>' +
            escapeHtml(text('loyalty_redeem_btn', 'Redeem')) +
          '</button>' +
        '</footer>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    if (empty) empty.hidden = true;
  }

  function populatePartnerFilter() {
    var select = byId('partnerCategorySelect');
    if (!select) return;
    select.innerHTML = PARTNER_CATEGORIES.map(function (category) {
      var selected = category.id === isPartnerCategory(partnerFilter).id ? ' selected' : '';
      return '<option value="' + escapeHtml(category.id) + '"' + selected + '>' +
        escapeHtml(text(category.key, category.fallback)) + '</option>';
    }).join('');
  }

  function renderEarnPoints() {
    var list = byId('earnPointsList');
    if (list) {
      var tier = calculateTier({ points: profile.points });
      list.innerHTML = EARN_ACTIONS.map(function (action, index) {
        var claimed = Boolean(profile.claims[action.id]);
        var unavailable = Boolean(action.once && claimed);
        var rateLabel = action.rateBased
          ? interpolate(text('loyalty_earn_rate_label', '{points} per ₹100 at {multiplier}x'), {
            points: formatNumber(EARN_POINTS_PER_100_RUPEES),
            multiplier: formatMultiplier(tier.earnMultiplier)
          })
          : formatNumber(action.fixedPoints);
        return '<li class="loyalty-punch' + (action.needsValue ? ' loyalty-punch--valued' : '') + '" style="animation-delay:' + Math.min(index * 55, 280) + 'ms">' +
          '<span class="loyalty-punch__label">' +
            '<span class="loyalty-punch__icon">' + artMarkup(action.art) + '</span>' +
            '<span class="loyalty-punch__name">' + escapeHtml(text(action.key, action.fallback)) + '</span>' +
            '<span class="loyalty-punch__desc">' + escapeHtml(text(action.descKey, action.fallbackDesc)) + '</span>' +
            (action.needsValue
              ? '<label class="loyalty-punch__inputlabel" for="loyaltyEarnOrderValue">' +
                  escapeHtml(text(action.valueLabelKey, action.valueLabelFallback)) + '</label>' +
                '<input type="number" id="loyaltyEarnOrderValue" name="earnOrderValue" data-loyalty-earn-value="' + escapeHtml(action.id) + '"' +
                  ' class="loyalty-input loyalty-input--num loyalty-punch__input" min="1" max="1000000" step="1"' +
                  ' inputmode="numeric" placeholder="5000" value="' + escapeHtml(action.id === 'purchase' ? earnOrderValue : '') + '" />'
              : '') +
          '</span>' +
          '<span class="loyalty-punch__value">' +
            '<strong>' + escapeHtml(rateLabel) + '</strong>' +
            '<span>' + escapeHtml(action.rateBased ? text('loyalty_earn_rate_unit', 'base rate') : text('loyalty_earn_fixed_unit', 'flat bonus')) + '</span>' +
          '</span>' +
          '<button type="button" class="btn-loyalty btn-loyalty--quiet" data-loyalty-earn="' + escapeHtml(action.id) + '"' +
            (unavailable ? ' aria-disabled="true" disabled' : '') + '>' +
            escapeHtml(unavailable
              ? text('loyalty_earn_claimed_btn', 'Claimed')
              : text('loyalty_earn_record_btn', 'Record this')) +
          '</button>' +
        '</li>';
      }).join('');
    }

    var events = byId('bonusEventsList');
    if (events) {
      events.innerHTML = BONUS_EVENTS.map(function (event) {
        return '<li><span>' + escapeHtml(text(event.key, event.fallback)) + '<br><span style="font-size:0.72rem">' +
          escapeHtml(text(event.detailKey, event.fallbackDetail)) + '</span></span>' +
          '<strong>' + (event.multiplierX4 ? escapeHtml(formatMultiplier(event.multiplierX4 / 4)) + '×' : '⅓ off') + '</strong></li>';
      }).join('');
    }
  }

  function renderEarningShelf() {
    var grid = byId('loyaltyProductGrid');
    var empty = byId('loyaltyProductEmpty');
    var skeleton = byId('loyaltyProductSkeleton');
    var meta = byId('loyaltyProductMeta');
    if (skeleton) skeleton.hidden = true;
    if (!grid) return;

    var shelf = getEarningShelf();
    if (!shelf.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      if (empty) {
        empty.textContent = text('loyalty_earn_shelf_empty', 'No products are earning points right now. Please check back soon.');
        empty.hidden = false;
      }
      if (meta) meta.textContent = '';
      return;
    }

    var tier = calculateTier({ points: profile.points });
    grid.innerHTML = shelf.map(function (product, index) {
      return '<article class="loyalty-earn-card" style="animation-delay:' + Math.min(index * 55, 320) + 'ms">' +
        '<div class="loyalty-earn-card__art">' +
          '<span class="loyalty-earn-card__stamp">+' + escapeHtml(formatNumber(product.earnPoints)) + '</span>' +
          artMarkup(product.art) +
        '</div>' +
        '<div class="loyalty-earn-card__body">' +
          '<h3>' + escapeHtml(product.name) + '</h3>' +
          '<p class="loyalty-earn-card__price"><strong>' + escapeHtml(money(product.price)) + '</strong></p>' +
          '<p class="loyalty-earn-card__worth">' +
            escapeHtml(interpolate(text('loyalty_earn_card_worth', 'Earns {points} points · worth {value} redeemed'), {
              points: formatNumber(product.earnPoints),
              value: money(product.redemptionValue)
            })) +
          '</p>' +
        '</div>' +
        '<a href="product-detail.html?id=' + encodeURIComponent(product.id) + '" class="btn-loyalty btn-loyalty--quiet">' +
          escapeHtml(text('loyalty_earn_view_product_btn', 'View product')) +
        '</a>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    if (empty) empty.hidden = true;
    if (meta) {
      meta.textContent = formatNumber(shelf.length) + ' ' + text('loyalty_earn_shelf_items_label', 'products') +
        ' · ' + escapeHtml(formatMultiplier(tier.earnMultiplier)) + '× ' + text('loyalty_earn_shelf_rate_label', 'earning');
    }
  }

  /* ---------------------------------------------------------------------
   * Headline panels
   * ------------------------------------------------------------------- */
  function renderBalance() {
    var redemption = calculateRedemptionValue({ points: profile.points });
    setText('currentPointsDisplay', formatNumber(profile.points));
    setText('pointsValueDisplay', money(redemption.value));
    setText('heroPointsDisplay', formatNumber(profile.points));
    setText('heroPointsValueDisplay', money(redemption.value));
    setText('lifetimePointsDisplay', formatNumber(profile.lifetimePoints));
    setText('redeemedPointsDisplay', formatNumber(profile.redeemedPoints));
    setText('memberSinceDisplay', profile.memberSince ? profile.memberSince : '—');
    setText('ownReferralCodeDisplay', profile.referralCode);
    setText('referralCodeDisplay', profile.referralCode);
    setText('heroRedemptionCount', formatNumber(redemptions.length));

    var linkInput = byId('referralLinkInput');
    if (linkInput && typeof linkInput.value === 'string') {
      linkInput.value = REFERRAL_LINK_BASE + '?ref=' + encodeURIComponent(profile.referralCode);
    }

    var pointsInput = byId('applyPointsPointsInput');
    if (pointsInput && typeof pointsInput.value === 'string' && !pointsInput.value) {
      pointsInput.value = String(Math.min(profile.points, MAX_POINTS_PER_ORDER));
    }
  }

  function renderTierStatus() {
    var tier = calculateTier({ points: profile.points });
    setText('currentTierDisplay', tier.tierLabel);
    setText('heroTierDisplay', tier.tierLabel);
    setText('nextTierDisplay', tier.isTopTier ? text('loyalty_tier_top_reached', 'Top tier') : tier.nextTierLabel);
    setText('currentTierMultiplierDisplay', interpolate(text('loyalty_tier_multiplier', '{multiplier}x purchase earning'), { multiplier: formatMultiplier(tier.earnMultiplier) }));
    setText('nextTierMultiplierDisplay', tier.isTopTier
      ? text('loyalty_tier_all_unlocked', 'All benefits unlocked')
      : interpolate(text('loyalty_tier_multiplier', '{multiplier}x purchase earning'), { multiplier: formatMultiplier(findTier(tier.nextTier).earnMultiplierX4 / 4) }));
    setText('tierProgressPercentDisplay', tier.progressPercent + '%');
    setText('pointsToNextTier', tier.isTopTier
      ? text('loyalty_tier_no_next', 'None — top tier reached')
      : formatNumber(tier.pointsToNext));

    var bar = byId('tierProgressBar');
    if (bar) {
      if (hasMethod(bar, 'setAttribute')) {
        bar.setAttribute('aria-valuenow', String(tier.progressPercent));
        bar.setAttribute('aria-valuetext', interpolate(
          text('loyalty_tier_progress_aria', '{percent}% toward {tier}'),
          { percent: tier.progressPercent, tier: tier.isTopTier ? text('loyalty_tier_top_reached', 'Top tier') : tier.nextTierLabel }
        ));
      }
    }
    var fill = byId('tierProgressFill');
    if (fill) fill.style.width = tier.progressPercent + '%';

    var row = byId('tierMedallionRow');
    if (row && typeof row.querySelectorAll === 'function') {
      var medallions = row.querySelectorAll('.loyalty-medallion');
      for (var index = 0; index < medallions.length; index += 1) {
        var node = medallions[index];
        if (!node || !hasMethod(node, 'getAttribute')) continue;
        var medalTier = node.getAttribute('data-tier');
        var reached = profile.points >= findTier(medalTier).minPoints;
        node.className = 'loyalty-medallion loyalty-medallion--' + medalTier +
          (medalTier === tier.tier ? ' is-current' : '') +
          (reached ? ' is-reached' : '');
      }
    }
  }

  function renderReferralStats() {
    var stats = byId('referralStats');
    var completed = referrals.filter(function (entry) { return entry.status === 'completed'; }).length;
    var pending = referrals.filter(function (entry) { return entry.status === 'pending'; }).length;
    var earned = referrals.reduce(function (sum, entry) {
      return sum + (entry.status === 'completed' ? entry.referrerBonus : 0);
    }, 0);

    var rows = [
      { label: 'loyalty_referral_stat_invited', fallback: 'Invited', value: formatNumber(referrals.length) },
      { label: 'loyalty_referral_stat_pending', fallback: 'Awaiting first order', value: formatNumber(pending) },
      { label: 'loyalty_referral_stat_completed', fallback: 'Completed', value: formatNumber(completed) },
      { label: 'loyalty_referral_stat_earned', fallback: 'Bonus points earned', value: formatNumber(earned) }
    ];

    if (stats) {
      stats.innerHTML = rows.map(function (row) {
        return '<div><dt>' + escapeHtml(text(row.label, row.fallback)) + '</dt><dd>' + escapeHtml(row.value) + '</dd></div>';
      }).join('');
    }

    var list = byId('referralHistoryList');
    var empty = byId('referralHistoryEmpty');
    if (!list) return;

    if (!referrals.length) {
      list.innerHTML = '';
      if (empty) {
        empty.textContent = text('loyalty_referral_history_empty', 'No invitations recorded yet. Fill in the form to write the first line.');
        empty.hidden = false;
      }
      return;
    }

    list.innerHTML = referrals.slice().reverse().map(function (entry) {
      return '<li class="loyalty-referral-row">' +
        '<span><span class="loyalty-referral-row__id">' + escapeHtml(entry.referralId) + '</span>' +
        '<span class="loyalty-referral-row__meta">' + escapeHtml(entry.refereeName + ' · ' + entry.refereeEmail) + '</span></span>' +
        '<span class="loyalty-referral-row__status is-' + escapeHtml(entry.status) + '">' +
          escapeHtml(text('loyalty_referral_status_' + entry.status, entry.status)) +
        '</span>' +
      '</li>';
    }).join('');
    if (empty) empty.hidden = true;
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = value;
  }

  /* ---------------------------------------------------------------------
   * Render everything
   * ------------------------------------------------------------------- */
  function render() {
    populatePartnerFilter();
    renderBalance();
    renderTierStatus();
    renderRedemptionCatalog();
    renderTierBenefits();
    renderPartnerOffers();
    renderReferralStats();
    renderEarnPoints();
    renderEarningShelf();
    refreshStaticTranslations();
    return profile;
  }

  /* ---------------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------------- */
  function handleRedeem(rewardId) {
    var result = redeemReward({ rewardId: rewardId });
    setStatus(result.reason, result.ok ? 'success' : 'error', 'loyaltyStatus');
    render();
    focusStatus('loyaltyStatus');
    return result;
  }

  function handlePartnerRedeem(partnerId) {
    var result = redeemReward({ partnerId: partnerId });
    setStatus(result.reason, result.ok ? 'success' : 'error', 'loyaltyStatus');
    render();
    focusStatus('loyaltyStatus');
    return result;
  }

  function handleReferralSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (form && hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setStatus(text('loyalty_referral_incomplete', 'Complete both the name and the email address before recording.'), 'error', 'referralStatus');
      return null;
    }

    var result = processReferral({
      referrerCode: profile.referralCode,
      refereeEmail: readValue('referralEmail'),
      refereeName: readValue('referralName')
    });

    setStatus(result.reason, result.ok ? 'success' : 'error', 'referralStatus');
    renderReferralStats();
    renderBalance();
    focusStatus('referralStatus');
    return result;
  }

  function handleCopyReferral() {
    var linkInput = byId('referralLinkInput');
    var link = linkInput && typeof linkInput.value === 'string' ? linkInput.value : '';

    function report(successKey, fallback, errorKey, errorFallback) {
      setStatus(
        successKey ? text(successKey, fallback) : text(errorKey, errorFallback),
        successKey ? 'success' : 'error',
        'referralStatus'
      );
      focusStatus('referralStatus');
    }

    if (!link) {
      report(null, '', 'loyalty_referral_no_link', 'There is no referral link to copy yet.');
      return null;
    }

    var clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : null;
    if (clipboard && hasMethod(clipboard, 'writeText')) {
      try {
        var pending = clipboard.writeText(link);
        if (pending && typeof pending.then === 'function') {
          pending.then(function () {
            report('loyalty_referral_copied', 'Referral link copied to your clipboard.', 'loyalty_referral_copy_failed', 'We could not copy the link. Select it and copy manually.');
          })['catch'](function () {
            fallbackCopy(linkInput, report);
          });
          return link;
        }
      } catch (error) {
        fallbackCopy(linkInput, report);
        return link;
      }
    }

    fallbackCopy(linkInput, report);
    return link;
  }

  /* Selecting the text is the honest fallback: it still leaves the user one
     keystroke from a copied link instead of claiming a copy that did not
     happen. */
  function fallbackCopy(input, report) {
    var selected = false;
    try {
      if (input && hasMethod(input, 'select')) {
        input.select();
        selected = true;
      } else if (input && hasMethod(input, 'setSelectionRange')) {
        input.setSelectionRange(0, String(input.value || '').length);
        selected = true;
      }
    } catch (error) {
      selected = false;
    }
    if (selected) {
      report('loyalty_referral_selected', 'Link selected. Press Ctrl+C or Cmd+C to copy it.', 'loyalty_referral_copy_failed', 'We could not copy the link. Select it and copy manually.');
    } else {
      report(null, '', 'loyalty_referral_copy_failed', 'We could not copy the link. Select it and copy manually.');
    }
  }

  function handleApplyPointsSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var result = byId('applyPointsResult');
    var form = event && (event.currentTarget || event.target);
    if (form && hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      renderApplyResult(null, 'error', text('loyalty_apply_incomplete', 'Enter the order value and how many points to apply.'));
      return null;
    }

    var cartTotal = Math.max(0, Math.round(numberOr(readValue('applyPointsCartTotalInput'), 0)));
    var requested = Math.max(0, Math.round(numberOr(readValue('applyPointsPointsInput'), 0)));
    var outcome = applyPointsToCart({ cartTotal: cartTotal, availablePoints: profile.points });

    // How many points this order would actually accept, before the balance is
    // taken into account. Anything above that is limited by the order; anything
    // still missing after it is limited by what the ledger holds.
    var permitted = Math.min(requested, outcome.maxPointsForOrder);

    var kind = 'success';
    var headline = interpolate(text('loyalty_apply_result', 'Applying {points} points takes {discount} off this order.'), {
      points: formatNumber(outcome.pointsUsed),
      discount: money(outcome.discountAmount)
    });

    if (outcome.pointsUsed < permitted) {
      // The order would take the amount; the ledger is what runs short. Say so,
      // rather than quoting a headline the settlement will not match.
      kind = 'warn';
      headline = interpolate(
        text('loyalty_apply_balance_capped', 'You asked for {requested}, but this ledger holds {available}. Applying {points} takes {discount} off instead.'),
        {
          requested: formatNumber(requested),
          available: formatNumber(profile.points),
          points: formatNumber(outcome.pointsUsed),
          discount: money(outcome.discountAmount)
        }
      );
    } else if (requested > outcome.maxPointsForOrder) {
      kind = 'warn';
      headline = interpolate(text('loyalty_apply_capped', 'You asked for {requested} but only {allowed} can be used on this order.'), {
        requested: formatNumber(requested),
        allowed: formatNumber(outcome.maxPointsForOrder)
      });
    } else if (outcome.noPointsAvailable) {
      kind = 'warn';
      headline = text('loyalty_apply_no_points', 'There are no points on this ledger yet. Record an earning action first.');
    } else if (outcome.pointsUsed === 0) {
      kind = 'warn';
      headline = text('loyalty_apply_nothing', 'The order value is too small to redeem any points against.');
    }

    renderApplyResult(outcome, kind, headline);
    return outcome;
  }

  function renderApplyResult(outcome, kind, headline) {
    var box = byId('applyPointsResult');
    if (!box) return;
    box.className = 'loyalty-apply__result' + (kind && kind !== 'success' ? ' is-' + kind : '');
    if (!outcome) {
      box.textContent = headline;
      box.hidden = false;
      return;
    }
    box.innerHTML = escapeHtml(headline) +
      '<dl class="loyalty-apply__figures">' +
        '<div><dt>' + escapeHtml(text('loyalty_apply_fig_points', 'Points applied')) + '</dt><dd>' + escapeHtml(formatNumber(outcome.pointsUsed)) + '</dd></div>' +
        '<div><dt>' + escapeHtml(text('loyalty_apply_fig_discount', 'Discount')) + '</dt><dd>' + escapeHtml(money(outcome.discountAmount)) + '</dd></div>' +
        '<div><dt>' + escapeHtml(text('loyalty_apply_fig_payable', 'Payable')) + '</dt><dd>' + escapeHtml(money(outcome.payableAmount)) + '</dd></div>' +
        '<div><dt>' + escapeHtml(text('loyalty_apply_fig_left', 'Points left')) + '</dt><dd>' + escapeHtml(formatNumber(outcome.balanceAfter)) + '</dd></div>' +
      '</dl>';
    box.hidden = false;
  }

  function handleEarnAction(actionId) {
    var result = recordEarning({ actionId: actionId, orderValue: readEarnOrderValue(actionId) });
    // A successful purchase claim consumes the amount, so the field clears for
    // the next one. A refused claim keeps whatever was typed so it can be fixed.
    if (actionId === 'purchase') earnOrderValue = result.ok ? '' : readEarnOrderValue(actionId);
    if (!result.ok) {
      setStatus(result.reason, 'error', 'loyaltyStatus');
    } else {
      var headline = interpolate(text('loyalty_earn_recorded_headline', '{points} points added. Your ledger now holds {balance}.'), {
        points: formatNumber(result.pointsAdded),
        balance: formatNumber(result.pointsBalance)
      });
      if (result.tierChanged) {
        headline = interpolate(text('loyalty_earn_tier_up', '{points} points added and you have reached {tier}.'), {
          points: formatNumber(result.pointsAdded),
          tier: getTierLabel(result.tierAfter)
        });
      }
      setStatus(headline, 'success', 'loyaltyStatus');
    }
    render();
    focusStatus('loyaltyStatus');
    return result;
  }

  function handlePartnerFilterChange() {
    partnerFilter = isPartnerCategory(readValue('partnerCategorySelect')).id;
    renderPartnerOffers();
    refreshStaticTranslations();
  }

  function readValue(id) {
    var node = byId(id);
    if (!node || node.value === undefined) return '';
    return cleanText(node.value, 300);
  }

  /* The punch card is rebuilt on every render, so the entered order value is
     kept in module state and written back into the field. The document-level
     input listener keeps that state in step while the user types. */
  function readEarnOrderValue(actionId) {
    return actionId === 'purchase' ? earnOrderValue : '';
  }

  // Receives the DOM event, so the node to inspect is event.target. Taking the
  // event itself here would make the delegated lookup walk an event object and
  // never match, silently dropping every keystroke.
  function handleEarnValueInput(event) {
    if (!event) return;
    var node = findAttribute(event.target, 'data-loyalty-earn-value');
    if (!node) return;
    if (node.getAttribute('data-loyalty-earn-value') !== 'purchase') return;
    earnOrderValue = cleanText(node.value, 20);
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

    var redeemTrigger = findAttribute(event.target, 'data-loyalty-redeem');
    if (redeemTrigger) {
      event.preventDefault();
      handleRedeem(redeemTrigger.getAttribute('data-loyalty-redeem'));
      return;
    }

    var partnerTrigger = findAttribute(event.target, 'data-loyalty-redeem-partner');
    if (partnerTrigger) {
      event.preventDefault();
      handlePartnerRedeem(partnerTrigger.getAttribute('data-loyalty-redeem-partner'));
      return;
    }

    var earnTrigger = findAttribute(event.target, 'data-loyalty-earn');
    if (earnTrigger) {
      event.preventDefault();
      handleEarnAction(earnTrigger.getAttribute('data-loyalty-earn'));
    }
  }

  function bindControl(id, eventName, handler) {
    var element = byId(id);
    if (!element || typeof element.addEventListener !== 'function' || element._loyaltyBound) return;
    element._loyaltyBound = true;
    element.addEventListener(eventName, handler);
  }

  function bindForm(id, handler) {
    var form = byId(id);
    if (!form || typeof form.addEventListener !== 'function' || form._loyaltyBound) return;
    form._loyaltyBound = true;
    form.addEventListener('submit', handler);
  }

  function setupEventListeners() {
    if (namespace._listenersBound) return;
    namespace._listenersBound = true;

    bindForm('referralForm', handleReferralSubmit);
    bindForm('pointsApplyForm', handleApplyPointsSubmit);
    bindControl('copyReferralBtn', 'click', handleCopyReferral);
    bindControl('partnerCategorySelect', 'change', handlePartnerFilterChange);

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('click', handleDocumentClick);
      doc.addEventListener('input', handleEarnValueInput);
    }

    if (root && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        if (!event) return;
        if (event.key === PROFILE_STORAGE_KEY) loadProfile();
        if (event.key === REFERRALS_STORAGE_KEY) loadReferrals();
        if (event.key === REDEMPTIONS_STORAGE_KEY) loadRedemptions();
        if (event.key === 'electromart_lang_v1' || event.key === 'electromart_lang') render();
      });
      root.addEventListener('languageChanged', render);
    }
  }

  function init() {
    // Make the page language explicit before the first paint so the static
    // data-i18n chrome and every dynamic string agree.
    syncLanguageStorage();
    loadProfile();
    loadReferrals();
    loadRedemptions();
    setupEventListeners();
    render();
    return namespace;
  }

  /* ---------------------------------------------------------------------
   * Public surface
   * ------------------------------------------------------------------- */
  namespace.init = init;
  namespace.calculateTier = calculateTier;
  namespace.calculateRedemptionValue = calculateRedemptionValue;
  namespace.applyPointsToCart = applyPointsToCart;
  namespace.processReferral = processReferral;
  namespace.calculateEarnPoints = calculateEarnPoints;
  namespace.recordEarning = recordEarning;
  namespace.redeemReward = redeemReward;
  namespace.applyVoucherToCart = addRewardCartLine;
  namespace.buildReference = buildReference;
  namespace.getTierLadder = function () { return TIER_LADDER.map(function (entry) { return Object.assign({}, entry, { perks: entry.perks.slice() }); }); };
  namespace.getEarnActions = function () { return EARN_ACTIONS.slice(); };
  namespace.getBonusEvents = function () { return BONUS_EVENTS.slice(); };
  namespace.getRedemptionCatalog = function () { return REDEMPTION_CATALOG.slice(); };
  namespace.getPartnerOffers = function () { return PARTNER_OFFERS.slice(); };
  namespace.getPartnerCategories = function () { return PARTNER_CATEGORIES.slice(); };
  namespace.getProfile = function () { return Object.assign({}, profile, { claims: Object.assign({}, profile.claims) }); };
  namespace.getReferrals = function () { return referrals.slice(); };
  namespace.getRedemptions = function () { return redemptions.slice(); };
  namespace.getTierStatus = function () { return calculateTier({ points: profile.points }); };
  namespace.getEarningShelf = getEarningShelf;
  namespace.setPartnerFilter = function (categoryId) {
    partnerFilter = isPartnerCategory(categoryId).id;
    renderPartnerOffers();
    return partnerFilter;
  };
  namespace.handleRedeem = handleRedeem;
  namespace.handlePartnerRedeem = handlePartnerRedeem;
  namespace.handleReferralSubmit = handleReferralSubmit;
  namespace.handleCopyReferral = handleCopyReferral;
  namespace.handleApplyPointsSubmit = handleApplyPointsSubmit;
  namespace.handleEarnAction = handleEarnAction;
  namespace.render = render;
  namespace.PROFILE_STORAGE_KEY = PROFILE_STORAGE_KEY;
  namespace.REFERRALS_STORAGE_KEY = REFERRALS_STORAGE_KEY;
  namespace.REDEMPTIONS_STORAGE_KEY = REDEMPTIONS_STORAGE_KEY;
  namespace.CART_STORAGE_KEY = CART_STORAGE_KEY;
  namespace.CATALOG_STORAGE_KEY = CATALOG_STORAGE_KEY;
  namespace.POINTS_PER_RUPEE = POINTS_PER_RUPEE;
  namespace.EARN_POINTS_PER_100_RUPEES = EARN_POINTS_PER_100_RUPEES;
  namespace.REFERRER_BONUS_POINTS = REFERRER_BONUS_POINTS;
  namespace.REFEREE_BONUS_POINTS = REFEREE_BONUS_POINTS;
  namespace.MAX_POINTS_PER_ORDER = MAX_POINTS_PER_ORDER;
  namespace.MAX_POINTS_ORDER_SHARE = MAX_POINTS_ORDER_SHARE;
  namespace.readStoredLanguage = readStoredLanguage;
  namespace.syncLanguageStorage = syncLanguageStorage;

  if (doc && doc.readyState === 'loading' && typeof doc.addEventListener === 'function') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}), typeof document !== 'undefined' ? document : null);