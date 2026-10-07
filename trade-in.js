/* ElectroMart B2B Corporate Bulk Trade-In Hub JavaScript (Phase 41) */
/* Defensive controller for the bulk valuation ledger, GST input tax credit and */
/* corporate depreciation estimators, on-site pickup bookings, and enterprise */
/* credit vouchers. No randomness, no sampling, and no time-dependent pricing. */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.TradeIn = electroMart.TradeIn || root.ElectroMartTradeIn || {};
  // Flat alias kept for integrations that predate the namespaced object.
  root.ElectroMartTradeIn = namespace;

  /* ---------------------------------------------------------------------
   * Storage contracts
   * ------------------------------------------------------------------- */
  var VALUATION_STORAGE_KEY = 'electromart_tradein_bulk_valuation_v1';
  var BOOKING_STORAGE_KEY = 'electromart_tradein_pickup_bookings_v1';
  var VOUCHER_STORAGE_KEY = 'electromart_tradein_vouchers_v1';
  var CART_STORAGE_KEY = 'electromart_cart_v1';
  var CATALOG_STORAGE_KEY = 'electromart_catalog_v1';
  var LANGUAGE_STORAGE_KEYS = ['electromart_lang_v1', 'electromart_lang'];
  var MAX_BOOKINGS = 12;
  var MAX_VOUCHERS = 12;
  var MAX_LEDGER_LINES = 12;
  var MAX_CART_QUANTITY = 99;

  /* ---------------------------------------------------------------------
   * Corporate tax constants (statutory Indian defaults)
   * ------------------------------------------------------------------- */
  var DEFAULT_GST_RATE = 0.18;
  var DEFAULT_CORPORATE_TAX_RATE = 0.25;
  // Section 32 read/write-off on IT assets, Section 35AD for specified assets.
  var DEFAULT_DEPRECIATION_RATE = 0.40;
  var DEFAULT_VOUCHER_VALID_DAYS = 365;

  /* ---------------------------------------------------------------------
   * Deterministic fleet valuation engine
   * -------------------------------------------------------------------
   * A fixed asset table plus a fixed condition table plus a fixed volume
   * table. Nothing is sampled and nothing reads the clock, so the same ledger
   * always produces the same rupee total.
   * ------------------------------------------------------------------- */
  /* Every lookup table carries an English fallback alongside its translation key,
     so a host with no dictionary still renders real copy instead of a raw key. */
  var CONDITION_GRADES = [
    { id: 'excellent', factor: 0.72, key: 'tradein_condition_excellent', fallback: 'Excellent' },
    { id: 'good', factor: 0.62, key: 'tradein_condition_good', fallback: 'Good' },
    { id: 'fair', factor: 0.46, key: 'tradein_condition_fair', fallback: 'Fair' },
    { id: 'for_parts', factor: 0.22, key: 'tradein_condition_for_parts', fallback: 'For parts' }
  ];
  var DEFAULT_CONDITION = 'good';

  // Fleet volume uplift. Above 20 units the recovery lot earns a bulk rate,
  // which is what makes a single consolidated line worth more than the same
  // units split into small lots.
  var VOLUME_TIERS = [
    { min: 100, factor: 1.06, key: 'tradein_volume_tier_4', fallback: 'Estate lot' },
    { min: 50, factor: 1.04, key: 'tradein_volume_tier_3', fallback: 'Consolidated lot' },
    { min: 20, factor: 1.02, key: 'tradein_volume_tier_2', fallback: 'Bulk lot' },
    { min: 1, factor: 1, key: 'tradein_volume_tier_1', fallback: 'Standard lot' }
  ];

  var ASSET_TABLE = [
    {
      category: 'laptop', categoryKey: 'tradein_category_laptop', fallback: 'Laptops',
      brands: [
        {
          brand: 'dell', brandKey: 'tradein_brand_dell', fallback: 'Dell',
          models: [
            { model: 'latitude-5420', base: 42000, nameKey: 'tradein_model_latitude_5420' },
            { model: 'latitude-7420', base: 68000, nameKey: 'tradein_model_latitude_7420' },
            { model: 'inspiron-15', base: 28000, nameKey: 'tradein_model_inspiron_15' }
          ]
        },
        {
          brand: 'hp', brandKey: 'tradein_brand_hp', fallback: 'Hp',
          models: [
            { model: 'probook-450', base: 38000, nameKey: 'tradein_model_probook_450' },
            { model: 'elitebook-840', base: 72000, nameKey: 'tradein_model_elitebook_840' },
            { model: 'pavilion-15', base: 25000, nameKey: 'tradein_model_pavilion_15' }
          ]
        },
        {
          brand: 'lenovo', brandKey: 'tradein_brand_lenovo', fallback: 'Lenovo',
          models: [
            { model: 'thinkpad-e14', base: 34000, nameKey: 'tradein_model_thinkpad_e14' },
            { model: 'thinkpad-t14', base: 62000, nameKey: 'tradein_model_thinkpad_t14' },
            { model: 'ideapad-3', base: 21000, nameKey: 'tradein_model_ideapad_3' }
          ]
        },
        {
          brand: 'apple', brandKey: 'tradein_brand_apple', fallback: 'Apple',
          models: [
            { model: 'macbook-air-m2', base: 94000, nameKey: 'tradein_model_macbook_air_m2' },
            { model: 'macbook-pro-14', base: 148000, nameKey: 'tradein_model_macbook_pro_14' }
          ]
        }
      ]
    },
    {
      category: 'monitor', categoryKey: 'tradein_category_monitor', fallback: 'Monitors',
      brands: [
        {
          brand: 'dell', brandKey: 'tradein_brand_dell', fallback: 'Dell',
          models: [
            { model: 'p2422h', base: 18500, nameKey: 'tradein_model_p2422h' },
            { model: 'p2423h', base: 21000, nameKey: 'tradein_model_p2423h' },
            { model: 'u2422h', base: 32000, nameKey: 'tradein_model_u2422h' }
          ]
        },
        {
          brand: 'hp', brandKey: 'tradein_brand_hp', fallback: 'Hp',
          models: [
            { model: 'prodisplay-p24', base: 17500, nameKey: 'tradein_model_prodisplay_p24' },
            { model: 'z24-hs', base: 26000, nameKey: 'tradein_model_z24_hs' }
          ]
        },
        {
          brand: 'lg', brandKey: 'tradein_brand_lg', fallback: 'Lg',
          models: [
            { model: '22mk400', base: 14000, nameKey: 'tradein_model_22mk400' },
            { model: '27up850', base: 29000, nameKey: 'tradein_model_27up850' }
          ]
        }
      ]
    },
    {
      category: 'desktop', categoryKey: 'tradein_category_desktop', fallback: 'Desktops',
      brands: [
        {
          brand: 'hp', brandKey: 'tradein_brand_hp', fallback: 'Hp',
          models: [
            { model: 'pro-tower-280', base: 34000, nameKey: 'tradein_model_pro_tower_280' },
            { model: 'pro-tower-400', base: 52000, nameKey: 'tradein_model_pro_tower_400' },
            { model: 'elite-tower-800', base: 96000, nameKey: 'tradein_model_elite_tower_800' }
          ]
        },
        {
          brand: 'dell', brandKey: 'tradein_brand_dell', fallback: 'Dell',
          models: [
            { model: 'optiplex-3080', base: 33000, nameKey: 'tradein_model_optiplex_3080' },
            { model: 'optiplex-7080', base: 62000, nameKey: 'tradein_model_optiplex_7080' }
          ]
        },
        {
          brand: 'lenovo', brandKey: 'tradein_brand_lenovo', fallback: 'Lenovo',
          models: [
            { model: 'thinkcentre-m90', base: 48000, nameKey: 'tradein_model_thinkcentre_m90' }
          ]
        }
      ]
    },
    {
      category: 'printer', categoryKey: 'tradein_category_printer', fallback: 'Printers',
      brands: [
        {
          brand: 'hp', brandKey: 'tradein_brand_hp', fallback: 'Hp',
          models: [
            { model: 'laserjet-m428', base: 24000, nameKey: 'tradein_model_laserjet_m428' },
            { model: 'laserjet-m507', base: 38000, nameKey: 'tradein_model_laserjet_m507' }
          ]
        },
        {
          brand: 'brother', brandKey: 'tradein_brand_brother', fallback: 'Brother',
          models: [
            { model: 'hl-l2375dw', base: 16000, nameKey: 'tradein_model_hl_l2375dw' }
          ]
        },
        {
          brand: 'canon', brandKey: 'tradein_brand_canon', fallback: 'Canon',
          models: [
            { model: 'mfp-l269dw', base: 15500, nameKey: 'tradein_model_mfp_l269dw' }
          ]
        }
      ]
    },
    {
      category: 'ups', categoryKey: 'tradein_category_ups', fallback: 'UPS & power',
      brands: [
        {
          brand: 'apc', brandKey: 'tradein_brand_apc', fallback: 'Apc',
          models: [
            { model: 'smart-ups-1500', base: 22000, nameKey: 'tradein_model_smart_ups_1500' },
            { model: 'smart-ups-6000', base: 68000, nameKey: 'tradein_model_smart_ups_6000' }
          ]
        },
        {
          brand: 'eaton', brandKey: 'tradein_brand_eaton', fallback: 'Eaton',
          models: [
            { model: '9px-2000i', base: 26000, nameKey: 'tradein_model_9px_2000i' }
          ]
        }
      ]
    }
  ];

  var CATEGORY_IDS = ASSET_TABLE.map(function (entry) { return entry.category; });
  var DEFAULT_CATEGORY = 'laptop';

  /* ---------------------------------------------------------------------
   * Pickup time slots (fixed corporate recovery windows)
   * ------------------------------------------------------------------- */
  var PICKUP_SLOTS = [
    { id: '09:00-11:00', key: 'tradein_slot_morning_early', fallback: '09:00 - 11:00' },
    { id: '10:00-12:00', key: 'tradein_slot_morning', fallback: '10:00 - 12:00' },
    { id: '12:00-14:00', key: 'tradein_slot_midday', fallback: '12:00 - 14:00' },
    { id: '14:00-16:00', key: 'tradein_slot_afternoon', fallback: '14:00 - 16:00' },
    { id: '16:00-18:00', key: 'tradein_slot_evening', fallback: '16:00 - 18:00' }
  ];

  var VOUCHER_TYPES = [
    { id: 'business_account_balance', key: 'tradein_voucher_type_balance', fallback: 'Business Account balance' },
    { id: 'credit_note', key: 'tradein_voucher_type_credit_note', fallback: 'Formal credit note' }
  ];

  var BUSINESS_ACCOUNT_PATTERN = /^EM-BIZ-[0-9]{4}-[0-9]{5}$/;
  var GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  var PHONE_PATTERN = /^[6-9][0-9]{9}$/;
  var ISO_DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  var MAX_UNITS = 5000;
  var MAX_BOOKING_ADDRESS = 240;

  /* ---------------------------------------------------------------------
   * Enterprise refresh catalogue (replacement fleet)
   * ------------------------------------------------------------------- */
  var REFRESH_CATALOG = [
    {
      id: 'ti-refresh-101', brand: 'ElectroMart', brandKey: 'tradein_refresh_brand',
      name: 'Executive Fleet Notebook 14 (16GB / 512GB SSD)',
      nameKey: 'tradein_refresh_101_name',
      spec: 'MIL-spec chassis, 3-year onsite warranty, vPro-class processor.',
      specKey: 'tradein_refresh_101_spec',
      price: 52990, listPrice: 68990, art: 'laptop', gstRate: 0.18
    },
    {
      id: 'ti-refresh-102', brand: 'ElectroMart', brandKey: 'tradein_refresh_brand',
      name: 'Commercial 24 inch FHD IPS Display with USB-C Hub',
      nameKey: 'tradein_refresh_102_name',
      spec: 'Height-adjustable stand, hardware low-blue-light mode, 3-year warranty.',
      specKey: 'tradein_refresh_102_spec',
      price: 16490, listPrice: 22990, art: 'monitor', gstRate: 0.18
    },
    {
      id: 'ti-refresh-103', brand: 'ElectroMart', brandKey: 'tradein_refresh_brand',
      name: 'Managed Small-Form Desktop Workstation',
      nameKey: 'tradein_refresh_103_name',
      spec: 'Tool-less serviceable chassis with a 5-year lifecycle build.',
      specKey: 'tradein_refresh_103_spec',
      price: 39990, listPrice: 54990, art: 'desktop', gstRate: 0.18
    },
    {
      id: 'ti-refresh-104', brand: 'ElectroMart', brandKey: 'tradein_refresh_brand',
      name: 'Department Laser Multifunction Printer',
      nameKey: 'tradein_refresh_104_name',
      spec: 'High-duty cycle drum, fleet duplexing and per-user PIN printing.',
      specKey: 'tradein_refresh_104_spec',
      price: 28490, listPrice: 36990, art: 'printer', gstRate: 0.18
    },
    {
      id: 'ti-refresh-105', brand: 'ElectroMart', brandKey: 'tradein_refresh_brand',
      name: 'Rack-mountable Online UPS 3kVA with Extended Battery',
      nameKey: 'tradein_refresh_105_name',
      spec: 'Double-conversion topology, SNMP card, 10-minute ride-through.',
      specKey: 'tradein_refresh_105_spec',
      price: 46990, listPrice: 62990, art: 'ups', gstRate: 0.18
    }
  ];

  var memoryStorage = createMemoryStorage();
  var ledger = [];
  var bookings = [];
  var vouchers = [];
  var lastValuation = null;
  var activeVoucher = null;

  /* ---------------------------------------------------------------------
   * Small utilities
   * ------------------------------------------------------------------- */
  function createMemoryStorage() {
    var values = Object.create(null);
    return {
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(values, String(key)) ? values[String(key)] : null;
      },
      setItem: function (key, value) {
        values[String(key)] = String(value);
      },
      removeItem: function (key) {
        delete values[String(key)];
      }
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

  function queryAll(selector, scope) {
    var node = scope || doc;
    if (!node || typeof node.querySelectorAll !== 'function') return [];
    try {
      return Array.prototype.slice.call(node.querySelectorAll(selector));
    } catch (error) {
      return [];
    }
  }

  function hasMethod(value, method) {
    return Boolean(value && typeof value[method] === 'function');
  }

  /* ---------------------------------------------------------------------
   * Deterministic reference tokens
   * -------------------------------------------------------------------
   * Booking references and voucher codes are derived from a content hash, not
   * from a counter or the clock. Re-running an identical request therefore
   * returns the identical reference, which is what makes both engines
   * idempotent: a double-click cannot mint a second voucher for one fleet.
   * ------------------------------------------------------------------- */
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
   * -------------------------------------------------------------------
   * universal-i18n-bus.js falls back to "hi" when no preference is stored and
   * paints the static data-i18n chrome in that language. The hub must resolve
   * the same key with the same default or a first-time visitor sees a page that
   * is half-Hindi and half-English. Both storage keys are always written
   * together so every page in the storefront agrees on the language.
   * ------------------------------------------------------------------- */
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
     the document declaration in step with the language the hub actually paints,
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

  function interpolate(template, replacements) {
    return String(template).replace(/\{(\w+)\}/g, function (match, token) {
      return Object.prototype.hasOwnProperty.call(replacements, token) ? String(replacements[token]) : match;
    });
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
    status.className = 'tradein-status is-' + (kind || 'info');
    status.hidden = !message;
  }

  function setPanelStatus(message, kind, targetId) {
    var status = byId(targetId);
    if (!status) return;
    status.textContent = message;
    status.className = 'tradein-panel__status is-' + (kind || 'info');
    status.hidden = !message;
  }

  /* Moves keyboard focus to a freshly rendered status line so assistive tech
     announces the confirmation instead of leaving focus on a submit button. */
  function focusStatus(targetId) {
    var status = byId(targetId);
    if (!status || !hasMethod(status, 'focus')) return;
    if (!hasMethod(status, 'setAttribute') || !hasMethod(status, 'hasAttribute')) return;
    if (!status.hasAttribute('tabindex')) status.setAttribute('tabindex', '-1');
    try {
      status.focus();
    } catch (error) {
      // Focus is a progressive enhancement; storage and rendering already succeeded.
    }
  }

  /* ---------------------------------------------------------------------
   * Table lookups and normalizers
   * ------------------------------------------------------------------- */
  function getCategoryEntry(categoryId) {
    var found = findCategoryEntry(categoryId);
    return found || ASSET_TABLE[0];
  }

  function findCategoryEntry(categoryId) {
    var key = cleanText(categoryId, 32).toLowerCase();
    for (var index = 0; index < ASSET_TABLE.length; index += 1) {
      if (ASSET_TABLE[index].category === key) return ASSET_TABLE[index];
    }
    return null;
  }

  function findBrandEntry(categoryId, brandId) {
    var category = findCategoryEntry(categoryId);
    if (!category) return null;
    var key = cleanText(brandId, 32).toLowerCase();
    for (var index = 0; index < category.brands.length; index += 1) {
      if (category.brands[index].brand === key) return category.brands[index];
    }
    return null;
  }

  function findModelEntry(categoryId, brandId, modelId) {
    var brand = findBrandEntry(categoryId, brandId);
    if (!brand) return null;
    var key = cleanText(modelId, 40).toLowerCase();
    for (var index = 0; index < brand.models.length; index += 1) {
      if (brand.models[index].model === key) return brand.models[index];
    }
    return null;
  }

  function getBrandEntry(categoryId, brandId) {
    return findBrandEntry(categoryId, brandId) || getCategoryEntry(categoryId).brands[0];
  }

  function getModelEntry(categoryId, brandId, modelId) {
    return findModelEntry(categoryId, brandId, modelId) || getBrandEntry(categoryId, brandId).models[0];
  }

  function getConditionGrade(conditionId) {
    var key = cleanText(conditionId, 24).toLowerCase();
    for (var index = 0; index < CONDITION_GRADES.length; index += 1) {
      if (CONDITION_GRADES[index].id === key) return CONDITION_GRADES[index];
    }
    return CONDITION_GRADES[1];
  }

  function getVolumeTier(units) {
    var count = Math.max(1, Math.round(numberOr(units, 1)));
    for (var index = 0; index < VOLUME_TIERS.length; index += 1) {
      if (count >= VOLUME_TIERS[index].min) return VOLUME_TIERS[index];
    }
    return VOLUME_TIERS[VOLUME_TIERS.length - 1];
  }

  function normalizeUnits(value) {
    var units = Math.round(numberOr(value, 0));
    if (!isFinite(units) || units < 1) units = 1;
    return clamp(units, 1, MAX_UNITS);
  }

  function normalizeQuantityValue(value) {
    var units = Math.round(numberOr(value, 0));
    if (!isFinite(units) || units < 0) units = 0;
    return clamp(units, 0, MAX_UNITS);
  }

  /* A ledger row must name a real asset. An unknown category, brand or model is
     dropped rather than silently defaulted, so a malformed stored record can
     never materialise as a priced line nobody asked for. */
  function sanitizeLedgerLine(rawLine) {
    if (!rawLine || typeof rawLine !== 'object' || Array.isArray(rawLine)) return null;
    var category = findCategoryEntry(rawLine.category);
    if (!category) return null;
    var brand = findBrandEntry(category.category, rawLine.brand);
    if (!brand) return null;
    var model = findModelEntry(category.category, brand.brand, rawLine.model);
    if (!model) return null;
    var grade = getConditionGrade(rawLine.condition);
    var units = normalizeUnits(rawLine.quantity);
    var volumeTier = getVolumeTier(units);
    var unitRate = Math.round(model.base * grade.factor * volumeTier.factor);
    return {
      category: category.category,
      brand: brand.brand,
      model: model.model,
      condition: grade.id,
      quantity: units,
      baseValue: model.base,
      conditionFactor: grade.factor,
      volumeFactor: volumeTier.factor,
      volumeKey: volumeTier.key,
      unitRate: unitRate,
      estimatedValue: unitRate * units
    };
  }

  /* ---------------------------------------------------------------------
   * Bulk valuation engine
   * ------------------------------------------------------------------- */
  /**
   * Deterministic bulk valuation. The same ledger always returns the same
   * rupee total: the asset table, the condition table and the volume table are
   * all fixed tables, and no clock or random source is consulted.
   */
  function calculateBulkValuation(lines) {
    var rows = Array.isArray(lines) ? lines : [];
    var deviceBreakdown = [];
    var totalEstimatedValue = 0;
    var totalUnits = 0;

    for (var index = 0; index < rows.length; index += 1) {
      var line = sanitizeLedgerLine(rows[index]);
      if (!line) continue;
      deviceBreakdown.push(line);
      totalEstimatedValue += line.estimatedValue;
      totalUnits += line.quantity;
    }

    return {
      deviceBreakdown: deviceBreakdown,
      lineCount: deviceBreakdown.length,
      totalUnits: totalUnits,
      totalEstimatedValue: totalEstimatedValue,
      gstCredit: calculateGstCredit({ tradeInValue: totalEstimatedValue }),
      taxSavings: calculateTaxSavings({ tradeInValue: totalEstimatedValue })
    };
  }

  /**
   * GST input tax credit. The credit is the stated rate applied to the trade-in
   * value, rounded once to the nearest rupee, so it always reconciles with the
   * same figure on a corporate return.
   */
  function calculateGstCredit(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var tradeInValue = Math.max(0, numberOr(safeInput.tradeInValue, 0));
    if (!isFinite(tradeInValue)) tradeInValue = 0;
    var rate = numberOr(safeInput.gstRate, DEFAULT_GST_RATE);
    if (!isFinite(rate) || rate <= 0) rate = DEFAULT_GST_RATE;
    rate = clamp(rate, 0, 1);
    return Math.round(tradeInValue * rate);
  }

  /**
   * Corporate tax savings from the depreciation shield: the asset cost written
   * off at the depreciation rate times the corporate tax rate actually paid.
   * Section 32 and Section 35AD rates are indicative, never tax advice.
   */
  function calculateTaxSavings(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var tradeInValue = Math.max(0, numberOr(safeInput.tradeInValue, 0));
    if (!isFinite(tradeInValue)) tradeInValue = 0;
    var taxRate = numberOr(safeInput.corporateTaxRate, DEFAULT_CORPORATE_TAX_RATE);
    if (!isFinite(taxRate) || taxRate <= 0) taxRate = DEFAULT_CORPORATE_TAX_RATE;
    taxRate = clamp(taxRate, 0, 1);
    var depreciationRate = numberOr(safeInput.depreciationRate, DEFAULT_DEPRECIATION_RATE);
    if (!isFinite(depreciationRate) || depreciationRate <= 0) depreciationRate = DEFAULT_DEPRECIATION_RATE;
    depreciationRate = clamp(depreciationRate, 0, 1);
    return Math.round(tradeInValue * depreciationRate * taxRate);
  }

  /* ---------------------------------------------------------------------
   * Ledger persistence
   * ------------------------------------------------------------------- */
  function loadLedger() {
    var parsed = parseJson(readStorage(VALUATION_STORAGE_KEY), []);
    ledger = Array.isArray(parsed)
      ? parsed.map(sanitizeLedgerLine).filter(Boolean).slice(0, MAX_LEDGER_LINES)
      : [];
    return ledger;
  }

  function saveLedger() {
    return writeStorage(VALUATION_STORAGE_KEY, JSON.stringify(ledger.slice(0, MAX_LEDGER_LINES)));
  }

  function appendLedgerLine(line) {
    var safeLine = sanitizeLedgerLine(line);
    if (!safeLine) return null;
    if (ledger.length >= MAX_LEDGER_LINES) {
      setPanelStatus(
        interpolate(text('tradein_ledger_full', 'The ledger holds up to {max} lines. Remove a line before adding another.'), { max: MAX_LEDGER_LINES }),
        'warn',
        'valuationStatus'
      );
      return null;
    }
    ledger.push(safeLine);
    if (!saveLedger()) {
      ledger.pop();
      return null;
    }
    return safeLine;
  }

  /* The three ledger mutators are the public API as well as the backing store, so
     each one repaints the ledger. An integration that calls the documented
     namespace method therefore never leaves a stale rupee total on screen. */
  function addLedgerLine(line) {
    var added = appendLedgerLine(line);
    if (added) renderLedger();
    return added;
  }

  function removeLedgerLine(index) {
    var position = Math.round(numberOr(index, -1));
    if (!isFinite(position) || position < 0 || position >= ledger.length) return false;
    ledger.splice(position, 1);
    if (!saveLedger()) return false;
    renderLedger();
    return true;
  }

  function clearLedger() {
    ledger = [];
    if (!saveLedger()) return false;
    renderLedger();
    return true;
  }

  /* ---------------------------------------------------------------------
   * On-site bulk pickup booking
   * ------------------------------------------------------------------- */
  function formatIsoDate(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1);
    var day = String(date.getDate());
    return year + '-' + (month.length < 2 ? '0' + month : month) + '-' + (day.length < 2 ? '0' + day : day);
  }

  /* Expiry and issue dates are validity windows, not pricing: they describe how
     long a voucher stays usable and are therefore the one place the calendar is
     consulted. No rupee amount is derived from the date. */
  function addDays(days) {
    var offset = Math.round(numberOr(days, DEFAULT_VOUCHER_VALID_DAYS));
    if (!isFinite(offset)) offset = DEFAULT_VOUCHER_VALID_DAYS;
    offset = clamp(offset, 1, 1095);
    var base = new Date();
    return formatIsoDate(new Date(base.getTime() + offset * 86400000));
  }

  function getTodayIso() {
    return formatIsoDate(new Date());
  }

  function getPickupSlot(slotId) {
    var key = cleanText(slotId, 24);
    for (var index = 0; index < PICKUP_SLOTS.length; index += 1) {
      if (PICKUP_SLOTS[index].id === key) return PICKUP_SLOTS[index];
    }
    return PICKUP_SLOTS[0];
  }

  function sanitizeBooking(rawBooking) {
    if (!rawBooking || typeof rawBooking !== 'object') return null;
    var pickupDate = cleanText(rawBooking.pickupDate, 10);
    var slot = getPickupSlot(rawBooking.pickupTimeSlot);
    var address = cleanText(rawBooking.pickupAddress, MAX_BOOKING_ADDRESS);
    var contactPerson = cleanText(rawBooking.contactPerson, 80);
    var contactPhone = cleanText(rawBooking.contactPhone, 10);
    var deviceCount = normalizeUnits(rawBooking.deviceCount);
    if (!ISO_DATE_PATTERN.test(pickupDate)) return null;
    if (address.length < 10 || contactPerson.length < 2) return null;
    if (!PHONE_PATTERN.test(contactPhone)) return null;
    return {
      bookingId: cleanText(rawBooking.bookingId, 32),
      pickupDate: pickupDate,
      pickupTimeSlot: slot.id,
      pickupAddress: address,
      deviceCount: deviceCount,
      contactPerson: contactPerson,
      contactPhone: contactPhone,
      status: 'confirmed'
    };
  }

  function loadBookings() {
    var parsed = parseJson(readStorage(BOOKING_STORAGE_KEY), []);
    bookings = Array.isArray(parsed)
      ? parsed.map(sanitizeBooking).filter(Boolean).slice(-MAX_BOOKINGS)
      : [];
    return bookings;
  }

  function saveBookings() {
    return writeStorage(BOOKING_STORAGE_KEY, JSON.stringify(bookings.slice(-MAX_BOOKINGS)));
  }

  /**
   * On-site bulk pickup booking. The reference is a hash of the request, so the
   * same fleet, address and slot always resolve to the same booking — a repeat
   * submission confirms the existing booking instead of duplicating it.
   */
  function bookBulkPickup(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var booking = sanitizeBooking(safeInput);
    if (!booking) {
      return {
        ok: false,
        bookingId: '',
        confirmedDate: '',
        confirmedTimeSlot: '',
        status: 'rejected',
        reasonKey: 'tradein_pickup_invalid',
        reason: text(
          'tradein_pickup_invalid',
          'Enter a pickup date, a collection address of at least ten characters, a site contact and a ten-digit contact phone.'
        )
      };
    }

    booking.bookingId = buildReference(
      'EM-TI-',
      [
        booking.pickupDate,
        booking.pickupTimeSlot,
        booking.deviceCount,
        booking.pickupAddress,
        booking.contactPerson,
        booking.contactPhone
      ].join('|')
    );

    for (var index = 0; index < bookings.length; index += 1) {
      if (bookings[index].bookingId === booking.bookingId) {
        bookings[index] = booking;
        saveBookings();
        return withBookingMeta(booking, true);
      }
    }

    bookings.push(booking);
    if (bookings.length > MAX_BOOKINGS) bookings = bookings.slice(-MAX_BOOKINGS);
    if (!saveBookings()) {
      bookings.pop();
      return {
        ok: false,
        bookingId: '',
        confirmedDate: '',
        confirmedTimeSlot: '',
        status: 'rejected',
        reasonKey: 'tradein_storage_error',
        reason: text('tradein_storage_error', 'We could not save the booking on this device. Please try again.')
      };
    }
    return withBookingMeta(booking, false);
  }

  function withBookingMeta(booking, existed) {
    return {
      ok: true,
      bookingId: booking.bookingId,
      confirmedDate: booking.pickupDate,
      confirmedTimeSlot: booking.pickupTimeSlot,
      pickupAddress: booking.pickupAddress,
      deviceCount: booking.deviceCount,
      contactPerson: booking.contactPerson,
      contactPhone: booking.contactPhone,
      status: 'confirmed',
      reused: Boolean(existed),
      reasonKey: existed ? 'tradein_pickup_reconfirmed' : 'tradein_pickup_confirmed',
      reason: existed
        ? text('tradein_pickup_reconfirmed', 'These details already had a confirmed booking, so the same reference was returned.')
        : interpolate(text('tradein_pickup_confirmed', 'Pickup confirmed for {date}, slot {slot}.'), {
          date: booking.pickupDate,
          slot: booking.pickupTimeSlot
        })
    };
  }

  /* ---------------------------------------------------------------------
   * Enterprise credit voucher
   * ------------------------------------------------------------------- */
  function getVoucherType(typeId) {
    var key = cleanText(typeId, 40).toLowerCase();
    for (var index = 0; index < VOUCHER_TYPES.length; index += 1) {
      if (VOUCHER_TYPES[index].id === key) return VOUCHER_TYPES[index];
    }
    return VOUCHER_TYPES[0];
  }

  function sanitizeVoucher(rawVoucher) {
    if (!rawVoucher || typeof rawVoucher !== 'object') return null;
    var tradeInValue = Math.round(numberOr(rawVoucher.tradeInValue, numberOr(rawVoucher.value, 0)));
    if (!isFinite(tradeInValue) || tradeInValue <= 0) return null;
    var voucherType = getVoucherType(rawVoucher.type || rawVoucher.voucherType);
    var accountId = cleanText(rawVoucher.businessAccountId, 32).toUpperCase();
    var validDays = Math.round(numberOr(rawVoucher.validDays, DEFAULT_VOUCHER_VALID_DAYS));
    if (!isFinite(validDays)) validDays = DEFAULT_VOUCHER_VALID_DAYS;
    validDays = clamp(validDays, 1, 1095);
    return {
      voucherCode: cleanText(rawVoucher.voucherCode, 32),
      type: voucherType.id,
      value: tradeInValue,
      businessAccountId: accountId,
      gstin: cleanText(rawVoucher.gstin, 15).toUpperCase(),
      validDays: validDays,
      issueDate: cleanText(rawVoucher.issueDate, 10),
      expiryDate: cleanText(rawVoucher.expiryDate, 10),
      status: 'issued'
    };
  }

  function loadVouchers() {
    var parsed = parseJson(readStorage(VOUCHER_STORAGE_KEY), []);
    vouchers = Array.isArray(parsed)
      ? parsed.map(sanitizeVoucher).filter(Boolean).slice(-MAX_VOUCHERS)
      : [];
    return vouchers;
  }

  function saveVouchers() {
    return writeStorage(VOUCHER_STORAGE_KEY, JSON.stringify(vouchers.slice(-MAX_VOUCHERS)));
  }

  /**
   * Enterprise credit voucher. The code is a hash of the settlement request, so
   * one fleet cannot mint two vouchers and the same settlement always lands on
   * the same code. Business-account vouchers always need an account id; a formal
   * credit note always needs a GSTIN.
   */
  function generateEnterpriseVoucher(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var tradeInValue = Math.round(numberOr(safeInput.tradeInValue, numberOr(safeInput.value, 0)));
    var voucherType = getVoucherType(safeInput.voucherType);
    var accountId = cleanText(safeInput.businessAccountId, 32).toUpperCase();
    var gstin = cleanText(safeInput.gstin, 15).toUpperCase();
    var validDays = Math.round(numberOr(safeInput.validDays, DEFAULT_VOUCHER_VALID_DAYS));
    if (!isFinite(validDays)) validDays = DEFAULT_VOUCHER_VALID_DAYS;
    validDays = clamp(validDays, 1, 1095);

    if (!isFinite(tradeInValue) || tradeInValue <= 0) {
      return {
        ok: false,
        voucherCode: '',
        value: 0,
        type: voucherType.id,
        businessAccountId: accountId,
        expiryDate: '',
        reasonKey: 'tradein_voucher_no_value',
        reason: text('tradein_voucher_no_value', 'Value the fleet in the ledger before raising a voucher.')
      };
    }

    if (!BUSINESS_ACCOUNT_PATTERN.test(accountId)) {
      return {
        ok: false,
        voucherCode: '',
        value: tradeInValue,
        type: voucherType.id,
        businessAccountId: accountId,
        expiryDate: '',
        reasonKey: 'tradein_voucher_bad_account',
        reason: text(
          'tradein_voucher_bad_account',
          'Enter a business account id in the format EM-BIZ-2026-00123.'
        )
      };
    }

    if (voucherType.id === 'credit_note' && !GSTIN_PATTERN.test(gstin)) {
      return {
        ok: false,
        voucherCode: '',
        value: tradeInValue,
        type: voucherType.id,
        businessAccountId: accountId,
        expiryDate: '',
        reasonKey: 'tradein_voucher_bad_gstin',
        reason: text(
          'tradein_voucher_bad_gstin',
          'A formal credit note needs a valid 15-character GSTIN, for example 07AAAAA0000A1Z5.'
        )
      };
    }

    var voucherCode = buildReference(
      'EM-VCR-',
      [voucherType.id, tradeInValue, accountId, gstin, validDays].join('|')
    );
    var voucher = {
      voucherCode: voucherCode,
      type: voucherType.id,
      value: tradeInValue,
      businessAccountId: accountId,
      gstin: gstin,
      validDays: validDays,
      issueDate: getTodayIso(),
      expiryDate: addDays(validDays),
      status: 'issued'
    };

    for (var index = 0; index < vouchers.length; index += 1) {
      if (vouchers[index].voucherCode === voucherCode) {
        vouchers[index] = voucher;
        saveVouchers();
        return withVoucherMeta(voucher, true);
      }
    }

    vouchers.push(voucher);
    if (vouchers.length > MAX_VOUCHERS) vouchers = vouchers.slice(-MAX_VOUCHERS);
    if (!saveVouchers()) {
      vouchers.pop();
      return {
        ok: false,
        voucherCode: '',
        value: tradeInValue,
        type: voucherType.id,
        businessAccountId: accountId,
        expiryDate: '',
        reasonKey: 'tradein_storage_error',
        reason: text('tradein_storage_error', 'We could not save the voucher on this device. Please try again.')
      };
    }
    return withVoucherMeta(voucher, false);
  }

  function withVoucherMeta(voucher, existed) {
    return {
      ok: true,
      voucherCode: voucher.voucherCode,
      type: voucher.type,
      value: voucher.value,
      businessAccountId: voucher.businessAccountId,
      gstin: voucher.gstin,
      validDays: voucher.validDays,
      issueDate: voucher.issueDate,
      expiryDate: voucher.expiryDate,
      status: voucher.status,
      reused: Boolean(existed),
      cartLineId: 'tradein-voucher-' + voucher.voucherCode.replace(/[^A-Z0-9]/gi, '').toLowerCase(),
      reasonKey: existed ? 'tradein_voucher_reissued' : 'tradein_voucher_issued',
      reason: existed
        ? text('tradein_voucher_reissued', 'This settlement already had a voucher, so the same code was returned.')
        : interpolate(
          text('tradein_voucher_issued', 'Voucher {code} issued for {value}, valid until {expiry}.'),
          { code: voucher.voucherCode, value: money(voucher.value), expiry: voucher.expiryDate }
        )
    };
  }

  /* ---------------------------------------------------------------------
   * Cart integration (existing storefront conventions)
   * ------------------------------------------------------------------- */
  function addCartLine(line, quantity, quantityCap, replaceExisting) {
    var cap = clamp(Math.round(numberOr(quantityCap, MAX_CART_QUANTITY)), 1, MAX_CART_QUANTITY);
    var safeQuantity = clamp(Math.floor(numberOr(quantity, 1)), 1, cap);
    var cartMap = readJsonMap(CART_STORAGE_KEY);
    // A replaceExisting line is a credit, not a stackable good: applying the same
    // voucher twice must stay one line at one quantity rather than doubling it.
    cartMap[line.id] = replaceExisting
      ? safeQuantity
      : clamp((numberOr(cartMap[line.id], 0) || 0) + safeQuantity, 0, cap);
    if (!writeStorage(CART_STORAGE_KEY, JSON.stringify(cartMap))) return false;

    var catalogMap = readJsonMap(CATALOG_STORAGE_KEY);
    catalogMap[line.id] = {
      id: line.id,
      name: line.name,
      price: numberOr(line.price, 0),
      listPrice: numberOr(line.listPrice, numberOr(line.price, 0)),
      image: '',
      stock: cap,
      category: 'enterprise-credit',
      hsnCode: '997331',
      gstRate: 0,
      segment: 'b2b',
      itcEligible: false,
      isTradeInVoucher: true,
      voucherCode: line.voucherCode || ''
    };
    writeStorage(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));

    dispatch('cart:updated', { id: line.id, name: line.name, price: numberOr(line.price, 0), quantity: safeQuantity });
    dispatch('electromart:tradeInVoucherApplied', { id: line.id, voucherCode: line.voucherCode || '' });
    return true;
  }

  /* A voucher is a credit, not a payable line, so it is stored at zero payable
     value and the rupee face value travels on the catalog record. That keeps the
     cart subtotal honest instead of silently discounting goods. */
  /* Rebuilds the stored shape of a voucher result. The engine result and the
     stored shape carry the same fields, so storing it verbatim keeps the issued
     date and expiry window that the preview just showed. */
  function sanitizeVoucherResult(voucher) {
    return {
      ok: Boolean(voucher && voucher.ok),
      voucherCode: voucher ? voucher.voucherCode : '',
      type: voucher ? voucher.type : VOUCHER_TYPES[0].id,
      value: voucher ? numberOr(voucher.value, 0) : 0,
      businessAccountId: voucher ? voucher.businessAccountId : '',
      gstin: voucher ? voucher.gstin : '',
      validDays: voucher ? numberOr(voucher.validDays, DEFAULT_VOUCHER_VALID_DAYS) : DEFAULT_VOUCHER_VALID_DAYS,
      issueDate: voucher ? voucher.issueDate : '',
      expiryDate: voucher ? voucher.expiryDate : '',
      status: voucher ? voucher.status : 'issued',
      reused: voucher ? voucher.reused === true : false,
      cartLineId: voucher ? voucher.cartLineId : '',
      reasonKey: voucher ? voucher.reasonKey : '',
      reason: voucher ? voucher.reason : ''
    };
  }

  function applyVoucherToCart(voucher) {
    var target = voucher || activeVoucher;
    if (!target || !target.voucherCode) {
      setStatus(
        text('tradein_voucher_none_selected', 'Raise a voucher before applying it to a cart order.'),
        'warn',
        'voucherStatus'
      );
      return null;
    }

    var voucherType = getVoucherType(target.type);
    var name = interpolate(
      text('tradein_voucher_cart_line_name', 'ElectroMart Trade-In Voucher {code} ({type})'),
      { code: target.voucherCode, type: text(voucherType.key, voucherType.fallback) }
    );

    if (!addCartLine({
      id: target.cartLineId,
      name: name,
      price: 0,
      listPrice: 0,
      voucherCode: target.voucherCode
    }, 1, MAX_CART_QUANTITY, true)) {
      setStatus(text('tradein_storage_error', 'We could not apply the voucher to the cart. Please try again.'), 'error', 'voucherStatus');
      return null;
    }

    // The engine result already carries every stored field, including the issue
    // date and expiry window, so it is stored verbatim rather than re-derived.
    activeVoucher = sanitizeVoucherResult(target);
    setStatus(
      interpolate(text('tradein_voucher_applied', 'Voucher {code} applied to your cart.'), { code: target.voucherCode }),
      'success',
      'voucherStatus'
    );
    return target;
  }

  function addRefreshItemToCart(productId) {
    var product = getRefreshProduct(productId);
    if (!product) return null;
    var name = text(product.nameKey, product.name);
    if (!addCartLine({
      id: product.id,
      name: name,
      price: product.price,
      listPrice: product.listPrice,
      category: 'enterprise-refresh'
    }, 1, MAX_CART_QUANTITY)) {
      setStatus(text('tradein_storage_error', 'We could not add that item to the cart. Please try again.'), 'error', 'valuationStatus');
      return null;
    }
    setPanelStatus(
      interpolate(text('tradein_catalog_added', '{name} added to your cart.'), { name: name }),
      'success',
      'valuationStatus'
    );
    return product;
  }

  /* ---------------------------------------------------------------------
   * DOM reads
   * ------------------------------------------------------------------- */
  function readSelectValue(id, fallback) {
    var select = byId(id);
    if (!select || typeof select.value !== 'string') return fallback || '';
    return cleanText(select.value, 60) || fallback || '';
  }

  function readInputValue(id, fallback) {
    var input = byId(id);
    if (!input || input.value === undefined) return fallback === undefined ? '' : fallback;
    return cleanText(input.value, 300);
  }

  function readNumberValue(id, fallback) {
    var input = byId(id);
    if (!input || input.value === undefined) return fallback;
    var parsed = Math.round(numberOr(input.value, fallback));
    return isFinite(parsed) ? parsed : fallback;
  }

  function readLedgerForm() {
    return {
      category: readSelectValue('categorySelect', DEFAULT_CATEGORY),
      brand: readSelectValue('brandSelect', ''),
      model: readSelectValue('modelSelect', ''),
      quantity: readNumberValue('quantityInput', 1),
      condition: readSelectValue('conditionSelect', DEFAULT_CONDITION)
    };
  }

  function readPickupForm() {
    return {
      pickupDate: readInputValue('pickupDateInput', ''),
      pickupTimeSlot: readSelectValue('pickupTimeSlotSelect', PICKUP_SLOTS[0].id),
      pickupAddress: readInputValue('pickupAddressInput', ''),
      deviceCount: readNumberValue('pickupDeviceCountInput', 1),
      contactPerson: readInputValue('pickupContactPersonInput', ''),
      contactPhone: readInputValue('pickupContactPhoneInput', '')
    };
  }

  function readVoucherForm() {
    return {
      voucherType: readSelectValue('voucherTypeSelect', VOUCHER_TYPES[0].id),
      businessAccountId: readInputValue('businessAccountIdInput', ''),
      gstin: readInputValue('voucherGstinInput', ''),
      validDays: readNumberValue('voucherValidDaysInput', DEFAULT_VOUCHER_VALID_DAYS)
    };
  }

  /* ---------------------------------------------------------------------
   * Populating selects
   * ------------------------------------------------------------------- */
  function populateSelect(select, options, selectedValue, labelKey) {
    var markup = options.map(function (option) {
      var label = labelKey ? text(option.key, option.fallback || option.id) : (option.label || option.id);
      var selected = option.id === selectedValue ? ' selected' : '';
      return '<option value="' + escapeHtml(option.id) + '"' + selected + '>' + escapeHtml(label) + '</option>';
    }).join('');
    select.innerHTML = markup;
  }

  function populateCategorySelect() {
    var select = byId('categorySelect');
    if (!select) return;
    populateSelect(select, ASSET_TABLE.map(function (entry) {
      return { id: entry.category, key: entry.categoryKey, fallback: entry.fallback };
    }), DEFAULT_CATEGORY, true);
  }

  function populateBrandSelect() {
    var select = byId('brandSelect');
    if (!select) return;
    var category = getCategoryEntry(readSelectValue('categorySelect', DEFAULT_CATEGORY));
    populateSelect(select, category.brands.map(function (entry) {
      return { id: entry.brand, key: entry.brandKey, fallback: entry.fallback };
    }), '', true);
  }

  function populateModelSelect() {
    var select = byId('modelSelect');
    if (!select) return;
    var brand = getBrandEntry(
      readSelectValue('categorySelect', DEFAULT_CATEGORY),
      readSelectValue('brandSelect', '')
    );
    populateSelect(select, brand.models.map(function (entry) {
      return { id: entry.model, key: entry.nameKey, label: entry.model };
    }), '', false);
  }

  function populateConditionSelect() {
    var select = byId('conditionSelect');
    if (!select) return;
    populateSelect(select, CONDITION_GRADES.map(function (entry) {
      return { id: entry.id, key: entry.key, fallback: entry.fallback };
    }), DEFAULT_CONDITION, true);
  }

  function populateSlotSelect() {
    var select = byId('pickupTimeSlotSelect');
    if (!select) return;
    populateSelect(select, PICKUP_SLOTS.map(function (entry) {
      return { id: entry.id, key: entry.key, fallback: entry.fallback };
    }), PICKUP_SLOTS[0].id, true);
  }

  function populateVoucherTypeSelect() {
    var select = byId('voucherTypeSelect');
    if (!select) return;
    populateSelect(select, VOUCHER_TYPES.map(function (entry) {
      return { id: entry.id, key: entry.key, fallback: entry.fallback };
    }), VOUCHER_TYPES[0].id, true);
  }

  function refreshModelSelects() {
    populateBrandSelect();
    populateModelSelect();
  }

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */
  function renderLedger() {
    var container = byId('deviceRowsContainer');
    var emptyState = byId('deviceRowsEmpty');
    var skeleton = byId('valuationSkeleton');
    var metaEl = byId('tradeInLedgerMeta');

    if (skeleton) skeleton.hidden = true;

    var valuation = calculateBulkValuation(ledger);
    lastValuation = valuation;

    if (metaEl) {
      metaEl.textContent = interpolate(
        text('tradein_ledger_meta', '{lines} lines · {units} units · {assets} distinct asset models'),
        {
          lines: formatNumber(valuation.lineCount),
          units: formatNumber(valuation.totalUnits),
          assets: formatNumber(valuation.deviceBreakdown.length)
        }
      );
    }

    if (container) {
      if (!valuation.deviceBreakdown.length) {
        container.innerHTML = '';
      } else {
        container.innerHTML = valuation.deviceBreakdown.map(function (line, index) {
          var category = getCategoryEntry(line.category);
          var grade = getConditionGrade(line.condition);
          var volumeTier = getVolumeTier(line.quantity);
          var assetLabel = text(category.categoryKey, category.category) + ' / ' + text(grade.key, grade.fallback) + ' · ' + text(volumeTier.key, volumeTier.fallback);
          return '<li class="tradein-ledger-row" data-line-index="' + index + '">' +
            '<span class="tradein-ledger-row__asset">' +
              '<span class="tradein-ledger-row__name">' + escapeHtml(line.model.toUpperCase()) + '</span>' +
              '<span class="tradein-ledger-row__meta">' + escapeHtml(assetLabel) + '</span>' +
            '</span>' +
            '<span class="tradein-ledger-row__units">' + escapeHtml(formatNumber(line.quantity)) + '</span>' +
            '<span class="tradein-ledger-row__rate">' + escapeHtml(money(line.unitRate)) + '</span>' +
            '<span class="tradein-ledger-row__value">' + escapeHtml(money(line.estimatedValue)) + '</span>' +
            '<button type="button" class="tradein-ledger-row__remove" data-tradein-remove-line="' + index +
              '" aria-label="' + escapeHtml(interpolate(text('tradein_ledger_remove', 'Remove {model} from the ledger'), { model: line.model.toUpperCase() })) + '">&times;</button>' +
          '</li>';
        }).join('');
      }
    }

    if (emptyState) {
      emptyState.textContent = text(
        'tradein_ledger_empty',
        'No ledger lines yet. Compose an asset and add it to start valuing your fleet.'
      );
      emptyState.hidden = valuation.deviceBreakdown.length > 0;
    }

    var totalEl = byId('estimatedTotalValue');
    var gstEl = byId('gstCreditEstimate');
    var taxEl = byId('taxSavingsEstimate');
    if (totalEl) totalEl.textContent = money(valuation.totalEstimatedValue);
    if (gstEl) gstEl.textContent = money(valuation.gstCredit);
    if (taxEl) taxEl.textContent = money(valuation.taxSavings);

    renderHeroStats();
    renderVoucherPreview();
    return valuation;
  }

  function renderPickupReceipt(booking) {
    var idEl = byId('pickupBookingId');
    var dateEl = byId('pickupConfirmedDate');
    var slotEl = byId('pickupConfirmedSlot');
    var unitsEl = byId('pickupUnitTotal');
    var emptyEl = byId('pickupReceiptEmpty');
    var target = booking || bookings[bookings.length - 1] || null;

    if (emptyEl) emptyEl.hidden = Boolean(target);
    if (!target) {
      if (idEl) idEl.textContent = '—';
      if (dateEl) dateEl.textContent = '—';
      if (slotEl) slotEl.textContent = '—';
      if (unitsEl) unitsEl.textContent = '—';
      return null;
    }

    if (idEl) idEl.textContent = target.bookingId;
    if (dateEl) dateEl.textContent = target.pickupDate;
    if (slotEl) slotEl.textContent = target.pickupTimeSlot;
    if (unitsEl) unitsEl.textContent = formatNumber(target.deviceCount);
    return target;
  }

  function renderPickupHistory() {
    var list = byId('pickupHistoryList');
    var emptyEl = byId('pickupHistoryEmpty');
    if (!list) return;

    if (!bookings.length) {
      list.innerHTML = '';
      if (emptyEl) {
        emptyEl.textContent = text('tradein_pickup_history_empty', 'No earlier pickup bookings on this device.');
        emptyEl.hidden = false;
      }
      return;
    }

    list.innerHTML = bookings.slice().reverse().map(function (booking) {
      return '<li class="tradein-saved-row">' +
        '<span>' +
          '<span class="tradein-saved-row__code">' + escapeHtml(booking.bookingId) + '</span>' +
          '<span class="tradein-saved-row__meta">' + escapeHtml(booking.pickupDate + ' · ' + booking.pickupTimeSlot + ' · ' + formatNumber(booking.deviceCount)) + '</span>' +
        '</span>' +
        '<span class="tradein-saved-row__meta">' + escapeHtml(text('tradein_pickup_status_confirmed', 'Confirmed')) + '</span>' +
      '</li>';
    }).join('');

    if (emptyEl) emptyEl.hidden = true;
  }

  function renderVoucherPreview(voucher) {
    var target = voucher || activeVoucher || vouchers[vouchers.length - 1] || null;
    var codeEl = byId('voucherCode');
    var valueEl = byId('voucherValue');
    var expiryEl = byId('voucherExpiry');
    var typeEl = byId('voucherTypeLabel');
    var accountEl = byId('voucherAccountLabel');
    var applyBtn = byId('applyVoucherToCartBtn');

    if (applyBtn) {
      if (target) {
        if (hasMethod(applyBtn, 'removeAttribute')) applyBtn.removeAttribute('disabled');
        applyBtn.setAttribute('aria-disabled', 'false');
      } else {
        applyBtn.setAttribute('disabled', 'disabled');
        applyBtn.setAttribute('aria-disabled', 'true');
      }
    }

    if (!target) {
      if (codeEl) codeEl.textContent = '—';
      if (valueEl) valueEl.textContent = money(0);
      if (expiryEl) expiryEl.textContent = '—';
      if (typeEl) typeEl.textContent = '—';
      if (accountEl) accountEl.textContent = '—';
      return null;
    }

    var voucherType = getVoucherType(target.type);
    if (codeEl) codeEl.textContent = target.voucherCode;
    if (valueEl) valueEl.textContent = money(target.value);
    if (expiryEl) expiryEl.textContent = target.expiryDate || '—';
    if (typeEl) typeEl.textContent = text(voucherType.key, voucherType.fallback);
    if (accountEl) accountEl.textContent = target.businessAccountId || '—';
    return target;
  }

  function renderVoucherList() {
    var list = byId('voucherList');
    var emptyEl = byId('voucherListEmpty');
    if (!list) return;

    if (!vouchers.length) {
      list.innerHTML = '';
      if (emptyEl) {
        emptyEl.textContent = text('tradein_voucher_empty', 'No enterprise voucher has been raised on this device.');
        emptyEl.hidden = false;
      }
      return;
    }

    list.innerHTML = vouchers.slice().reverse().map(function (voucher) {
      var voucherType = getVoucherType(voucher.type);
      return '<li class="tradein-saved-row">' +
        '<span>' +
          '<span class="tradein-saved-row__code">' + escapeHtml(voucher.voucherCode) + '</span>' +
          '<span class="tradein-saved-row__meta">' +
            escapeHtml(money(voucher.value) + ' · ' + text(voucherType.key, voucherType.fallback) + ' · ' + voucher.expiryDate) +
          '</span>' +
        '</span>' +
        '<span class="tradein-saved-row__meta">' + escapeHtml(voucher.businessAccountId) + '</span>' +
      '</li>';
    }).join('');

    if (emptyEl) emptyEl.hidden = true;
  }

  function getRefreshProduct(productId) {
    var key = cleanText(productId, 60);
    for (var index = 0; index < REFRESH_CATALOG.length; index += 1) {
      if (REFRESH_CATALOG[index].id === key) return REFRESH_CATALOG[index];
    }
    return null;
  }

  function renderRefreshCatalog() {
    var grid = byId('tradeInProductGrid');
    var skeleton = byId('tradeInCatalogSkeleton');
    var emptyEl = byId('tradeInCatalogEmpty');
    var countEl = byId('tradeInCatalogCount');

    if (skeleton) skeleton.hidden = true;
    if (!grid) return;

    if (!REFRESH_CATALOG.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      if (emptyEl) {
        emptyEl.textContent = text('tradein_catalog_empty', 'No enterprise refresh catalogue is available right now. Please check back soon.');
        emptyEl.hidden = false;
      }
      if (countEl) countEl.textContent = '';
      return;
    }

    grid.innerHTML = REFRESH_CATALOG.map(function (product, index) {
      var discountPercent = product.listPrice > 0
        ? Math.round((1 - (product.price / product.listPrice)) * 100)
        : 0;
      return '<article class="tradein-catalog-card" style="animation-delay:' + Math.min(index * 60, 360) + 'ms">' +
        '<div class="tradein-catalog-card__art">' +
          '<span class="tradein-catalog-card__tag">-' + Math.max(0, discountPercent) + '%</span>' +
          '<span class="tradein-art tradein-art--' + escapeHtml(product.art) + '" aria-hidden="true">' +
            '<span class="art-screen"></span><span class="art-bezel"></span><span class="art-deck"></span><span class="art-hinge"></span>' +
            '<span class="art-panel"></span><span class="art-bar"></span><span class="art-neck"></span><span class="art-foot"></span>' +
            '<span class="art-case"></span><span class="art-slot"></span><span class="art-led"></span>' +
            '<span class="art-body"></span><span class="art-tray"></span><span class="art-sheet"></span>' +
            '<span class="art-tower"></span><span class="art-vent"></span><span class="art-display"></span>' +
          '</span>' +
        '</div>' +
        '<div class="tradein-catalog-card__body">' +
          '<h3>' + escapeHtml(text(product.nameKey, product.name)) + '</h3>' +
          '<p class="tradein-catalog-card__brand">' + escapeHtml(text(product.brandKey, product.brand)) + '</p>' +
          '<p class="tradein-catalog-card__spec">' + escapeHtml(text(product.specKey, product.spec)) + '</p>' +
          '<p class="tradein-catalog-card__price">' +
            '<strong>' + escapeHtml(money(product.price)) + '</strong>' +
            '<s>M.R.P.: ' + escapeHtml(money(product.listPrice)) + '</s>' +
          '</p>' +
        '</div>' +
        '<button type="button" class="btn-tradein btn-tradein--primary" data-tradein-add-refresh="' + escapeHtml(product.id) + '">' +
          escapeHtml(text('tradein_catalog_add_to_cart', 'Add to cart')) +
        '</button>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    if (emptyEl) emptyEl.hidden = true;
    if (countEl) {
      countEl.textContent = formatNumber(REFRESH_CATALOG.length) + ' ' + text('tradein_catalog_items', 'items');
    }
  }

  function renderHeroStats() {
    var linesEl = byId('tradeInLineCount');
    var unitsEl = byId('tradeInUnitCount');
    var vouchersEl = byId('tradeInVoucherCount');
    if (linesEl) linesEl.textContent = formatNumber(ledger.length);
    if (unitsEl) unitsEl.textContent = formatNumber(ledger.reduce(function (sum, line) { return sum + line.quantity; }, 0));
    if (vouchersEl) vouchersEl.textContent = formatNumber(vouchers.length);
  }

  function render() {
    populateCategorySelect();
    populateBrandSelect();
    populateModelSelect();
    populateConditionSelect();
    populateSlotSelect();
    populateVoucherTypeSelect();
    var valuation = renderLedger();
    renderPickupReceipt(null);
    renderPickupHistory();
    renderVoucherList();
    renderRefreshCatalog();
    refreshStaticTranslations();
    return valuation;
  }

  /* ---------------------------------------------------------------------
   * Ledger flow
   * ------------------------------------------------------------------- */
  function handleAddDeviceRow() {
    var line = readLedgerForm();
    // addLedgerLine appends, persists and repaints in one step.
    var added = addLedgerLine(line);
    if (!added) return null;

    setPanelStatus(
      interpolate(
        text('tradein_ledger_added', '{model} · {units} units added to the ledger.'),
        { model: added.model.toUpperCase(), units: formatNumber(added.quantity) }
      ),
      'success',
      'valuationStatus'
    );

    // Prefill the pickup unit count from the ledger so the two desks agree.
    var deviceCountInput = byId('pickupDeviceCountInput');
    var nextTotal = ledger.reduce(function (sum, entry) { return sum + entry.quantity; }, 0);
    if (deviceCountInput && typeof deviceCountInput.value === 'string') {
      deviceCountInput.value = String(nextTotal);
    }

    focusStatus('valuationStatus');
    return added;
  }

  function handleRemoveDeviceRow(index) {
    var position = Math.round(numberOr(index, -1));
    // removeLedgerLine repaints the ledger itself; only the failure path needs
    // a message, because a successful removal is obvious on screen.
    if (!removeLedgerLine(position)) {
      setPanelStatus(text('tradein_storage_error', 'We could not update the ledger on this device. Please try again.'), 'error', 'valuationStatus');
    }
    return true;
  }

  function handleClearLedger() {
    if (!clearLedger()) {
      setPanelStatus(text('tradein_storage_error', 'We could not clear the ledger on this device. Please try again.'), 'error', 'valuationStatus');
      return false;
    }
    setPanelStatus(text('tradein_ledger_cleared', 'The asset ledger is empty again.'), 'success', 'valuationStatus');
    return true;
  }

  /* ---------------------------------------------------------------------
   * Pickup flow
   * ------------------------------------------------------------------- */
  function handlePickupSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (form && hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setStatus(text('tradein_pickup_invalid', 'Complete every pickup field before booking.'), 'error', 'pickupStatus');
      return null;
    }

    var result = bookBulkPickup(readPickupForm());
    if (!result.ok) {
      setStatus(result.reason, 'error', 'pickupStatus');
      return null;
    }

    setStatus(result.reason, 'success', 'pickupStatus');
    renderPickupReceipt({
      bookingId: result.bookingId,
      pickupDate: result.confirmedDate,
      pickupTimeSlot: result.confirmedTimeSlot,
      deviceCount: result.deviceCount
    });
    renderPickupHistory();
    focusStatus('pickupStatus');
    return result;
  }

  /* ---------------------------------------------------------------------
   * Voucher flow
   * ------------------------------------------------------------------- */
  function handleVoucherSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (form && hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setStatus(text('tradein_voucher_invalid', 'Complete the voucher fields before generating.'), 'error', 'voucherStatus');
      return null;
    }

    var values = readVoucherForm();
    var valuation = calculateBulkValuation(ledger);
    var result = generateEnterpriseVoucher({
      tradeInValue: valuation.totalEstimatedValue,
      voucherType: values.voucherType,
      businessAccountId: values.businessAccountId,
      gstin: values.gstin,
      validDays: values.validDays
    });

    if (!result.ok) {
      setStatus(result.reason, 'error', 'voucherStatus');
      return null;
    }

    activeVoucher = result;
    setStatus(result.reason, 'success', 'voucherStatus');
    renderVoucherPreview(result);
    renderVoucherList();
    renderHeroStats();
    focusStatus('voucherStatus');
    return result;
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
    if (!event) return;

    var removeTrigger = findAttribute(event.target, 'data-tradein-remove-line');
    if (removeTrigger) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      handleRemoveDeviceRow(numberOr(removeTrigger.getAttribute('data-tradein-remove-line'), -1));
      return;
    }

    var refreshTrigger = findAttribute(event.target, 'data-tradein-add-refresh');
    if (refreshTrigger) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      addRefreshItemToCart(refreshTrigger.getAttribute('data-tradein-add-refresh'));
    }
  }

  function bindControl(id, eventName, handler) {
    var element = byId(id);
    if (!element || typeof element.addEventListener !== 'function' || element._tradeinBound) return;
    element._tradeinBound = true;
    element.addEventListener(eventName, handler);
  }

  function setupEventListeners() {
    if (namespace._listenersBound) return;
    namespace._listenersBound = true;

    var pickupForm = byId('pickupBookingForm');
    if (pickupForm && !pickupForm._tradeinBound && typeof pickupForm.addEventListener === 'function') {
      pickupForm._tradeinBound = true;
      pickupForm.addEventListener('submit', handlePickupSubmit);
    }

    var voucherForm = byId('creditVoucherForm');
    if (voucherForm && !voucherForm._tradeinBound && typeof voucherForm.addEventListener === 'function') {
      voucherForm._tradeinBound = true;
      voucherForm.addEventListener('submit', handleVoucherSubmit);
    }

    bindControl('addDeviceRowBtn', 'click', handleAddDeviceRow);
    bindControl('clearLedgerBtn', 'click', handleClearLedger);
    bindControl('categorySelect', 'change', refreshModelSelects);
    bindControl('brandSelect', 'change', populateModelSelect);
    bindControl('applyVoucherToCartBtn', 'click', function () {
      applyVoucherToCart(activeVoucher);
    });

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('click', handleDocumentClick);
    }

    if (root && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        if (!event) return;
        if (event.key === VALUATION_STORAGE_KEY) loadLedger();
        if (event.key === BOOKING_STORAGE_KEY) loadBookings();
        if (event.key === VOUCHER_STORAGE_KEY) loadVouchers();
        if (event.key === 'electromart_lang_v1' || event.key === 'electromart_lang') {
          render();
        }
      });
      root.addEventListener('languageChanged', function () {
        render();
      });
    }
  }

  function init() {
    // Make the hub language explicit before the first paint so the static
    // data-i18n chrome and every dynamic string agree.
    syncLanguageStorage();
    loadLedger();
    loadBookings();
    loadVouchers();
    applyDefaultsToControls();
    setupEventListeners();
    render();
    return namespace;
  }

  function applyDefaultsToControls() {
    var dateInput = byId('pickupDateInput');
    if (dateInput && typeof dateInput.value === 'string' && !dateInput.value) {
      dateInput.value = getTodayIso();
      if (hasMethod(dateInput, 'setAttribute')) dateInput.setAttribute('min', getTodayIso());
    }
    var unitInput = byId('pickupDeviceCountInput');
    if (unitInput && typeof unitInput.value === 'string' && (!unitInput.value || unitInput.value === '1')) {
      unitInput.value = String(Math.max(1, ledger.reduce(function (sum, entry) { return sum + entry.quantity; }, 0)));
    }
  }

  /* ---------------------------------------------------------------------
   * Public surface
   * ------------------------------------------------------------------- */
  namespace.init = init;
  namespace.calculateBulkValuation = calculateBulkValuation;
  namespace.calculateGstCredit = calculateGstCredit;
  namespace.calculateTaxSavings = calculateTaxSavings;
  namespace.bookBulkPickup = bookBulkPickup;
  namespace.generateEnterpriseVoucher = generateEnterpriseVoucher;
  namespace.applyVoucherToCart = applyVoucherToCart;
  namespace.addRefreshItemToCart = addRefreshItemToCart;
  namespace.buildReference = buildReference;
  namespace.getAssetTable = function () { return ASSET_TABLE.slice(); };
  namespace.getConditionGrades = function () { return CONDITION_GRADES.slice(); };
  namespace.getVolumeTiers = function () { return VOLUME_TIERS.slice(); };
  namespace.getPickupSlots = function () { return PICKUP_SLOTS.slice(); };
  namespace.getVoucherTypes = function () { return VOUCHER_TYPES.slice(); };
  namespace.getRefreshCatalog = function () { return REFRESH_CATALOG.slice(); };
  namespace.getLedger = function () { return ledger.slice(); };
  namespace.addLedgerLine = appendLedgerLine;
  namespace.removeLedgerLine = removeLedgerLine;
  namespace.clearLedger = clearLedger;
  namespace.getBookings = function () { return bookings.slice(); };
  namespace.getVouchers = function () { return vouchers.slice(); };
  namespace.getActiveVoucher = function () { return activeVoucher; };
  namespace.getLastValuation = function () {
    return lastValuation ? {
      totalEstimatedValue: lastValuation.totalEstimatedValue,
      totalUnits: lastValuation.totalUnits,
      lineCount: lastValuation.lineCount,
      gstCredit: lastValuation.gstCredit,
      taxSavings: lastValuation.taxSavings
    } : null;
  };
  namespace.handleAddDeviceRow = handleAddDeviceRow;
  namespace.handlePickupSubmit = handlePickupSubmit;
  namespace.handleVoucherSubmit = handleVoucherSubmit;
  namespace.render = render;
  namespace.VALUATION_STORAGE_KEY = VALUATION_STORAGE_KEY;
  namespace.BOOKING_STORAGE_KEY = BOOKING_STORAGE_KEY;
  namespace.VOUCHER_STORAGE_KEY = VOUCHER_STORAGE_KEY;
  namespace.CART_STORAGE_KEY = CART_STORAGE_KEY;
  namespace.CATALOG_STORAGE_KEY = CATALOG_STORAGE_KEY;
  namespace.DEFAULT_GST_RATE = DEFAULT_GST_RATE;
  namespace.DEFAULT_CORPORATE_TAX_RATE = DEFAULT_CORPORATE_TAX_RATE;
  namespace.DEFAULT_DEPRECIATION_RATE = DEFAULT_DEPRECIATION_RATE;
  namespace.DEFAULT_VOUCHER_VALID_DAYS = DEFAULT_VOUCHER_VALID_DAYS;
  namespace.MAX_LEDGER_LINES = MAX_LEDGER_LINES;
  namespace.MAX_BOOKINGS = MAX_BOOKINGS;
  namespace.MAX_VOUCHERS = MAX_VOUCHERS;
  namespace.readStoredLanguage = readStoredLanguage;
  namespace.syncLanguageStorage = syncLanguageStorage;

  if (doc && doc.readyState === 'loading' && typeof doc.addEventListener === 'function') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}), typeof document !== 'undefined' ? document : null);