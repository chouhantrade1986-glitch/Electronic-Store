/* ElectroMart Gaming & eSports Arena JavaScript (Phase 39) */
/* Defensive controller for the rig configurator, frame-rate engine, arena gear, */
/* tournament listings, and tournament / creator sponsorship applications. */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.Gaming = electroMart.Gaming || root.ElectroMartGaming || {};
  // Historical alias kept for integrations that predate the namespaced object.
  root.ElectroMartGaming = namespace;

  /* ---------------------------------------------------------------------
   * Storage contracts
   * ------------------------------------------------------------------- */
  var RIG_STORAGE_KEY = 'electromart_gaming_rig_config_v1';
  var SPONSOR_STORAGE_KEY = 'electromart_gaming_sponsor_applications_v1';
  // Older preview builds shipped the longer key; keep reading it for continuity.
  var SPONSOR_LEGACY_STORAGE_KEY = 'electromart_gaming_sponsorship_applications_v1';
  var CART_STORAGE_KEY = 'electromart_cart_v1';
  var CATALOG_STORAGE_KEY = 'electromart_catalog_v1';
  var MAX_SPONSOR_APPLICATIONS = 25;
  var MAX_QUANTITY = 99;

  /* ---------------------------------------------------------------------
   * Frame-rate engine (deterministic, no randomness anywhere)
   * ------------------------------------------------------------------- */
  var GPU_TIER_FRAMES = { 1: 30, 2: 52, 3: 78, 4: 122, 5: 168 };
  var CPU_TIER_FRAMES = { 1: 20, 2: 29, 3: 42, 4: 66, 5: 92 };
  var RAM_TIER_BONUS = [
    { maxGb: 8, bonus: -4 },
    { maxGb: 16, bonus: 0 },
    { maxGb: 32, bonus: 10 },
    { maxGb: 9999, bonus: 15 }
  ];
  var RESOLUTION_FACTORS = { '720p': 1.18, '1080p': 1, '1440p': 0.78, '4k': 0.56 };
  var RESOLUTION_ALIASES = {
    '1080p': '1080p', 'fhd': '1080p', 'full-hd': '1080p', 'fullhd': '1080p',
    '1440p': '1440p', 'qhd': '1440p', '2k': '1440p',
    '4k': '4k', '2160p': '4k', 'uhd': '4k',
    '720p': '720p', 'hd': '720p'
  };
  var DEFAULT_RESOLUTION = '1080p';
  var MIN_ESTIMATE = 24;
  var MAX_ESTIMATE = 360;
  // Single source of truth for both gauges: the arc sweep and the scale label
  // are derived from this one reference, so the hero ring and the configurator
  // ring can never disagree for the same estimate.
  var GAUGE_REFERENCE_FPS = 240;
  var GAUGE_ARC_SWEEP_DEG = 180;

  var FPS_TIERS = [
    { min: 165, key: 'gaming_tier_elite', fallback: 'Elite esports' },
    { min: 110, key: 'gaming_tier_competitive', fallback: 'Competitive' },
    { min: 60, key: 'gaming_tier_entry', fallback: 'Entry esports' },
    { min: 0, key: 'gaming_tier_starter', fallback: 'Starter build' }
  ];

  /* ---------------------------------------------------------------------
   * Component catalogs (namespaced away from the canonical storefront catalog)
   * ------------------------------------------------------------------- */
  var CPU_OPTIONS = [
    { id: 'ascend-s3', name: 'ElectroMart Ascend S3 (4-Core)', short: 'Ascend S3', tier: 1, price: 6499, mrp: 7999 },
    { id: 'ascend-c5', name: 'ElectroMart Ascend C5 (6-Core)', short: 'Ascend C5', tier: 2, price: 12999, mrp: 15999 },
    { id: 'ascend-c7', name: 'ElectroMart Ascend C7 (10-Core)', short: 'Ascend C7', tier: 3, price: 24999, mrp: 29999 },
    { id: 'ascend-x7', name: 'ElectroMart Ascend X7 (16-Core)', short: 'Ascend X7', tier: 4, price: 38999, mrp: 45999 },
    { id: 'ascend-x9', name: 'ElectroMart Ascend X9 (24-Core)', short: 'Ascend X9', tier: 5, price: 62999, mrp: 72999 }
  ];

  var GPU_OPTIONS = [
    { id: 'flux-g550', name: 'ElectroMart Flux G550 6GB', short: 'Flux G550', tier: 1, price: 14999, mrp: 17999 },
    { id: 'flux-g660', name: 'ElectroMart Flux G660 8GB', short: 'Flux G660', tier: 2, price: 26999, mrp: 31999 },
    { id: 'flux-g770xt', name: 'ElectroMart Flux G770 XT 12GB', short: 'Flux G770 XT', tier: 3, price: 42999, mrp: 49999 },
    { id: 'flux-g880ti', name: 'ElectroMart Flux G880 Ti 16GB', short: 'Flux G880 Ti', tier: 4, price: 64999, mrp: 74999 },
    { id: 'flux-g990', name: 'ElectroMart Flux G990 24GB', short: 'Flux G990', tier: 5, price: 98999, mrp: 114999 }
  ];

  var RAM_OPTIONS = [
    { id: 'ddr4-8', name: '8GB DDR4 3200MHz', short: '8GB DDR4', ramGb: 8, price: 1899, mrp: 2499 },
    { id: 'ddr5-16', name: '16GB DDR5 5600MHz', short: '16GB DDR5', ramGb: 16, price: 3499, mrp: 4299 },
    { id: 'ddr5-32', name: '32GB DDR5 RGB 6000MHz', short: '32GB DDR5', ramGb: 32, price: 7999, mrp: 9499 },
    { id: 'ddr5-64', name: '64GB DDR5 RGB 6400MHz', short: '64GB DDR5', ramGb: 64, price: 14999, mrp: 17999 }
  ];

  var STORAGE_OPTIONS = [
    { id: 'nvme-512', name: '512GB NVMe PCIe 4.0 SSD', short: '512GB NVMe', price: 3999, mrp: 4999 },
    { id: 'nvme-1tb', name: '1TB NVMe PCIe 4.0 SSD', short: '1TB NVMe', price: 6999, mrp: 8499 },
    { id: 'nvme-2tb', name: '2TB NVMe Gen4 Gaming SSD', short: '2TB NVMe Gen4', price: 12999, mrp: 15499 },
    { id: 'nvme-4tb', name: '4TB NVMe Gen4 plus 1TB HDD', short: '4TB NVMe + 1TB HDD', price: 21999, mrp: 25999 }
  ];

  // Gear copy is resolved through the translation dictionaries like the
  // tournament rows; the literal English strings stay on as the fallback so a
  // missing dictionary entry can never blank a product name.
  var GAMING_GEAR = [
    {
      id: 'gaming-gear-vector-tkl',
      nameKey: 'gaming_gear_vector_tkl_name',
      name: 'Vector TKL RGB Mechanical Keyboard',
      descriptionKey: 'gaming_gear_vector_tkl_description',
      description: 'Hot-swap switches, per-key RGB and a 1 ms polling rate built for tournament play.',
      price: 2499,
      mrp: 3999,
      art: 'keyboard'
    },
    {
      id: 'gaming-gear-photon-mouse',
      nameKey: 'gaming_gear_photon_mouse_name',
      name: 'Photon 8K Wireless Gaming Mouse',
      descriptionKey: 'gaming_gear_photon_mouse_description',
      description: '26,000 DPI sensor with 8K wireless polling and 58 gram magnesium shell.',
      price: 3299,
      mrp: 4999,
      art: 'mouse'
    },
    {
      id: 'gaming-gear-aura-pro-headset',
      nameKey: 'gaming_gear_aura_pro_headset_name',
      name: 'Aura Pro Wireless Gaming Headset',
      descriptionKey: 'gaming_gear_aura_pro_headset_description',
      description: 'Dolby-tuned 50 mm drivers, detachable boom mic and 60 hour wireless battery.',
      price: 4599,
      mrp: 6999,
      art: 'headset'
    },
    {
      id: 'gaming-gear-flux-reference-gpu',
      nameKey: 'gaming_gear_flux_reference_gpu_name',
      name: 'Flux G880 Ti Reference Card',
      descriptionKey: 'gaming_gear_flux_reference_gpu_description',
      description: 'Triple-fan reference cooling card tuned and stress-tested for the ElectroMart arena.',
      price: 64999,
      mrp: 74999,
      art: 'gpu'
    },
    {
      id: 'gaming-gear-velocity-chair',
      nameKey: 'gaming_gear_velocity_chair_name',
      name: 'Velocity Ergonomic Gaming Chair',
      descriptionKey: 'gaming_gear_velocity_chair_description',
      description: 'Lumbar support, 4D armrests and a recline bracket rated for long scrim blocks.',
      price: 8999,
      mrp: 12999,
      art: 'chair'
    },
    {
      id: 'gaming-gear-rapid-165-monitor',
      nameKey: 'gaming_gear_rapid_165_monitor_name',
      name: 'Rapid 27 inch 165Hz Esports Monitor',
      descriptionKey: 'gaming_gear_rapid_165_monitor_description',
      description: '1 ms response, 165 Hz refresh and a low-latency mode for tournament broadcasts.',
      price: 17999,
      mrp: 23499,
      art: 'monitor'
    }
  ];

  var TOURNAMENTS = [
    { nameKey: 'gaming_cup_name_1', gameKey: 'gaming_game_battleroyale', date: '12 Oct 2026', prize: 150000, slots: 8, statusKey: 'gaming_cup_status_registration', statusClass: 'is-registration' },
    { nameKey: 'gaming_cup_name_2', gameKey: 'gaming_game_tacticalfps', date: '26 Oct 2026', prize: 120000, slots: 12, statusKey: 'gaming_cup_status_qualifiers', statusClass: '' },
    { nameKey: 'gaming_cup_name_3', gameKey: 'gaming_game_cricket', date: '09 Nov 2026', prize: 200000, slots: 16, statusKey: 'gaming_cup_status_open', statusClass: '' },
    { nameKey: 'gaming_cup_name_4', gameKey: 'gaming_game_racing', date: '23 Nov 2026', prize: 80000, slots: 6, statusKey: 'gaming_cup_status_live', statusClass: 'is-live' }
  ];

  var GAME_VALUES = ['battle-royale', 'tactical-fps', 'cricket', 'racing', 'fighting', 'sports'];

  var ARENA_STATS = {
    certifiedRigs: 1284,
    creatorsOnboarded: 216
  };

  var memoryStorage = createMemoryStorage();
  var sponsorApplications = [];
  var lastEstimate = { fps: 0, tierKey: 'gaming_tier_starter', ready: false };

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

  function query(selector, scope) {
    var node = scope || doc;
    if (!node || typeof node.querySelector !== 'function') return null;
    try {
      return node.querySelector(selector);
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
   * Language
   * -------------------------------------------------------------------
   * universal-i18n-bus.js falls back to "hi" when no preference is stored and
   * paints the static data-i18n chrome in that language. Gaming must resolve
   * the same key with the same default or a first-time visitor sees a page
   * that is half-Hindi and half-English. Both storage keys are always written
   * together so every page in the storefront agrees on the language.
   */
  var LANGUAGE_STORAGE_KEYS = ['electromart_lang_v1', 'electromart_lang'];
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
     the document declaration in step with the language the arena actually
     paints, including the RTL flip for Urdu. */
  function syncDocumentLanguage(language) {
    var doc = typeof document !== 'undefined' ? document.documentElement : null;
    if (!doc || !hasMethod(doc, 'setAttribute')) return language;
    try {
      doc.setAttribute('lang', language);
      doc.setAttribute('dir', language === 'ur' ? 'rtl' : 'ltr');
    } catch (error) {
      // A missing document element is the only realistic failure and is harmless.
    }
    return language;
  }

  function getLanguage() {
    return readStoredLanguage();
  }

  function text(key, fallback) {
    var dictionaries = root.EM_TRANSLATIONS || {};
    var language = getLanguage();
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
    status.className = 'gaming-status' + (kind ? ' is-' + kind : '');
    status.hidden = !message;
  }

  /* Moves keyboard focus to a freshly rendered status line so assistive tech
     announces the confirmation instead of leaving focus on a reset button. */
  function focusStatus(targetId) {
    var status = byId(targetId);
    if (!status || !hasMethod(status, 'focus')) return;
    if (!status.hasAttribute('tabindex')) status.setAttribute('tabindex', '-1');
    try {
      status.focus();
    } catch (error) {
      // Focus is a progressive enhancement; storage and rendering already succeeded.
    }
  }

  /* ---------------------------------------------------------------------
   * Frame-rate estimation
   * ------------------------------------------------------------------- */
  function normalizeTier(value) {
    var tier = Math.round(numberOr(value, 2));
    if (!isFinite(tier)) tier = 2;
    return clamp(tier, 1, 5);
  }

  function normalizeRamGb(value) {
    var ramGb = Math.round(numberOr(value, 8));
    if (!isFinite(ramGb)) ramGb = 8;
    return clamp(ramGb, 2, 256);
  }

  function normalizeResolution(value) {
    var key = cleanText(value, 12).toLowerCase();
    if (RESOLUTION_FACTORS[key] !== undefined) return key;
    if (RESOLUTION_ALIASES[key]) return RESOLUTION_ALIASES[key];
    return DEFAULT_RESOLUTION;
  }

  function getRamTierBonus(ramGb) {
    var normalized = normalizeRamGb(ramGb);
    var bonus = 0;
    for (var index = 0; index < RAM_TIER_BONUS.length; index += 1) {
      if (normalized <= RAM_TIER_BONUS[index].maxGb) {
        bonus = RAM_TIER_BONUS[index].bonus;
        break;
      }
    }
    return bonus;
  }

  /**
   * Deterministic frame-rate engine. The same parts always return the same
   * number: no sampling, no random jitter, no device-dependent input.
   */
  function calculateFpsEstimate(config) {
    var safeConfig = config && typeof config === 'object' ? config : {};
    var gpuTier = normalizeTier(safeConfig.gpuTier);
    var cpuTier = normalizeTier(safeConfig.cpuTier);
    var ramGb = normalizeRamGb(safeConfig.ramGb);
    var resolution = normalizeResolution(safeConfig.resolution);

    var gpuFrames = numberOr(GPU_TIER_FRAMES[gpuTier], GPU_TIER_FRAMES[2]);
    var cpuFrames = numberOr(CPU_TIER_FRAMES[cpuTier], CPU_TIER_FRAMES[2]);
    var estimated = (gpuFrames + cpuFrames + getRamTierBonus(ramGb)) * RESOLUTION_FACTORS[resolution];

    return clamp(Math.round(estimated), MIN_ESTIMATE, MAX_ESTIMATE);
  }

  function getFpsTierKey(fps) {
    var frames = Math.max(0, numberOr(fps, 0));
    for (var index = 0; index < FPS_TIERS.length; index += 1) {
      if (frames >= FPS_TIERS[index].min) return FPS_TIERS[index].key;
    }
    return FPS_TIERS[FPS_TIERS.length - 1].key;
  }

  function getFpsTierLabel(fps) {
    var key = getFpsTierKey(fps);
    for (var index = 0; index < FPS_TIERS.length; index += 1) {
      if (FPS_TIERS[index].key === key) return text(key, FPS_TIERS[index].fallback);
    }
    return text(key, key);
  }

  function getGaugeRatio(fps) {
    return clamp(numberOr(fps, 0) / GAUGE_REFERENCE_FPS, 0, 1);
  }

  function getGaugeArc(fps) {
    return (getGaugeRatio(fps) * GAUGE_ARC_SWEEP_DEG).toFixed(1) + 'deg';
  }

  /**
   * Apply one shared arc calculation to every gauge element on the page. The
   * hero telemetry ring and the configurator readout therefore always encode an
   * identical value with an identical sweep.
   */
  function applyGaugeArc(fps) {
    var arc = getGaugeArc(fps);
    ['telemetryGauge', 'fpsGauge'].forEach(function (id) {
      var element = byId(id);
      if (element && element.style && typeof element.style.setProperty === 'function') {
        element.style.setProperty('--gaming-arc-angle', arc);
      }
    });
    return arc;
  }

  function renderGaugeScales() {
    var unit = text('gaming_fps_unit', 'FPS');
    ['telemetryScale', 'fpsScale'].forEach(function (id) {
      var element = byId(id);
      if (!element) return;
      element.textContent = '0 – ' + GAUGE_REFERENCE_FPS + ' ' + unit;
    });
  }

  function getTierRangeLabel(index) {
    var tier = FPS_TIERS[index];
    var floor = Math.max(numberOr(tier && tier.min, 0), MIN_ESTIMATE);
    if (index === 0) return floor + '+';
    var ceiling = numberOr(FPS_TIERS[index - 1] && FPS_TIERS[index - 1].min, 0) - 1;
    return ceiling > floor ? floor + '–' + ceiling : floor + '+';
  }

  /**
   * Paint the tier ladder. It is the legend for the 0-240 gauge arc and the
   * active row is driven by the same FPS_TIERS table the estimator uses, so the
   * scale can never drift from the engine.
   */
  function renderTierLadder(activeTierKey) {
    var rows = queryAll('.gaming-tier-ladder__row');
    if (!rows.length) return;

    rows.forEach(function (row) {
      var key = row.getAttribute('data-tier-key');
      var range = query('.gaming-tier-ladder__range', row);
      for (var index = 0; index < FPS_TIERS.length; index += 1) {
        if (FPS_TIERS[index].key === key && range) {
          range.textContent = getTierRangeLabel(index);
          break;
        }
      }
      var isActive = Boolean(activeTierKey) && key === activeTierKey;
      if (row.classList && typeof row.classList.toggle === 'function') {
        row.classList.toggle('is-active', isActive);
        row.classList.toggle('is-idle', !isActive);
      }
      if (typeof row.setAttribute === 'function') {
        if (isActive) row.setAttribute('aria-current', 'true');
        else row.removeAttribute('aria-current');
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Rig configuration
   * ------------------------------------------------------------------- */
  function findOption(list, id) {
    var key = cleanText(id, 60);
    for (var index = 0; index < list.length; index += 1) {
      if (list[index].id === key) return list[index];
    }
    return null;
  }

  function readSelectValue(id) {
    var select = byId(id);
    if (!select) return '';
    return cleanText(select.value, 60);
  }

  function readSegmentedValue(name, fallback) {
    var checked = query('input[name="' + name + '"]:checked');
    if (checked && typeof checked.value === 'string' && checked.value.trim()) return checked.value.trim();
    return fallback;
  }

  function applySegmentedValue(name, value) {
    queryAll('input[name="' + name + '"]').forEach(function (input) {
      if (input && input.value === value) input.checked = true;
    });
  }

  function readConfig() {
    return {
      cpuId: readSelectValue('cpuSelect'),
      gpuId: readSelectValue('gpuSelect'),
      ramId: readSelectValue('ramSelect'),
      storageId: readSelectValue('storageSelect'),
      resolution: normalizeResolution(readSegmentedValue('resolution', DEFAULT_RESOLUTION))
    };
  }

  function isConfigComplete(config) {
    return Boolean(config && config.cpuId && config.gpuId && config.ramId && config.storageId);
  }

  function sanitizeConfig(rawConfig) {
    var safeConfig = rawConfig && typeof rawConfig === 'object' ? rawConfig : {};
    return {
      cpuId: findOption(CPU_OPTIONS, safeConfig.cpuId) ? cleanText(safeConfig.cpuId, 60) : '',
      gpuId: findOption(GPU_OPTIONS, safeConfig.gpuId) ? cleanText(safeConfig.gpuId, 60) : '',
      ramId: findOption(RAM_OPTIONS, safeConfig.ramId) ? cleanText(safeConfig.ramId, 60) : '',
      storageId: findOption(STORAGE_OPTIONS, safeConfig.storageId) ? cleanText(safeConfig.storageId, 60) : '',
      resolution: normalizeResolution(safeConfig.resolution)
    };
  }

  function loadRigConfig() {
    return sanitizeConfig(parseJson(readStorage(RIG_STORAGE_KEY), {}));
  }

  function saveRigConfig(config) {
    return writeStorage(RIG_STORAGE_KEY, JSON.stringify(sanitizeConfig(config)));
  }

  function buildRig(config) {
    var safeConfig = sanitizeConfig(config);
    var cpu = findOption(CPU_OPTIONS, safeConfig.cpuId);
    var gpu = findOption(GPU_OPTIONS, safeConfig.gpuId);
    var ram = findOption(RAM_OPTIONS, safeConfig.ramId);
    var storage = findOption(STORAGE_OPTIONS, safeConfig.storageId);
    var complete = Boolean(cpu && gpu && ram && storage);
    var parts = [cpu, gpu, ram, storage].filter(Boolean);
    var total = parts.reduce(function (sum, part) { return sum + numberOr(part.price, 0); }, 0);
    var mrp = parts.reduce(function (sum, part) { return sum + numberOr(part.mrp, 0); }, 0);
    var fps = complete
      ? calculateFpsEstimate({
        gpuTier: gpu.tier,
        cpuTier: cpu.tier,
        ramGb: ram.ramGb,
        resolution: safeConfig.resolution
      })
      : 0;

    return {
      id: complete
        ? 'gaming-rig-' + [cpu.id, gpu.id, ram.id, storage.id, safeConfig.resolution].join('-')
        : 'gaming-rig-incomplete',
      name: complete
        ? 'ElectroMart Arena Rig ' + cpu.short + ' + ' + gpu.short
        : 'ElectroMart Arena Rig',
      cpu: cpu,
      gpu: gpu,
      ram: ram,
      storage: storage,
      resolution: safeConfig.resolution,
      fps: fps,
      total: total,
      mrp: mrp,
      complete: complete
    };
  }

  /* ---------------------------------------------------------------------
   * Cart integration (existing storefront conventions)
   * ------------------------------------------------------------------- */
  function addCartLine(line, quantity) {
    var safeQuantity = clamp(Math.floor(numberOr(quantity, 1)), 1, MAX_QUANTITY);
    var cartMap = readJsonMap(CART_STORAGE_KEY);
    cartMap[line.id] = clamp((numberOr(cartMap[line.id], 0) || 0) + safeQuantity, 0, MAX_QUANTITY);
    if (!writeStorage(CART_STORAGE_KEY, JSON.stringify(cartMap))) return false;

    var catalogMap = readJsonMap(CATALOG_STORAGE_KEY);
    catalogMap[line.id] = {
      id: line.id,
      name: line.name,
      price: numberOr(line.price, 0),
      listPrice: numberOr(line.mrp, numberOr(line.price, 0)),
      image: '',
      stock: 10,
      category: 'gaming',
      hsnCode: '84713010',
      gstRate: 0.18,
      segment: 'b2c',
      itcEligible: true
    };
    writeStorage(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));

    dispatch('cart:updated', { id: line.id, name: line.name, price: numberOr(line.price, 0), quantity: safeQuantity });
    dispatch('electromart:gamingRigAdded', { id: line.id, name: line.name, quantity: safeQuantity });
    return true;
  }

  function addRigToCart(config, quantity) {
    var rig = buildRig(config || readConfig());
    if (!rig.complete) {
      setStatus(text('gaming_rig_incomplete', 'Select a processor, graphics card, memory, and storage before adding this rig.'), 'error', 'gamingRigStatus');
      return null;
    }

    if (!addCartLine({ id: rig.id, name: rig.name, price: rig.total, mrp: rig.mrp }, quantity || 1)) {
      setStatus(text('gaming_rig_storage_error', 'We could not save your rig to the cart. Please try again.'), 'error', 'gamingRigStatus');
      return null;
    }

    setStatus(
      text('gaming_rig_added', '{name} added to your cart.').replace('{name}', rig.name),
      'success',
      'gamingRigStatus'
    );
    return rig;
  }

  /* ---------------------------------------------------------------------
   * Gear copy resolution
   * ------------------------------------------------------------------- */
  function getGearName(gear) {
    if (!gear) return '';
    return text(gear.nameKey, gear.name || gear.nameKey);
  }

  function getGearDescription(gear) {
    if (!gear) return '';
    return text(gear.descriptionKey, gear.description || gear.descriptionKey);
  }

  function getGearById(gearId) {
    var key = cleanText(gearId, 80);
    for (var index = 0; index < GAMING_GEAR.length; index += 1) {
      if (GAMING_GEAR[index].id === key) return GAMING_GEAR[index];
    }
    return null;
  }

  function addGearToCart(gearId, quantity) {
    var gear = getGearById(gearId);
    if (!gear) return null;
    var gearName = getGearName(gear);

    if (!addCartLine({ id: gear.id, name: gearName, price: gear.price, mrp: gear.mrp }, quantity || 1)) {
      setStatus(text('gaming_rig_storage_error', 'We could not save your rig to the cart. Please try again.'), 'error', 'gamingRigStatus');
      return null;
    }

    setStatus(
      text('gaming_gear_added', '{name} added to your cart.').replace('{name}', gearName),
      'success',
      'gamingRigStatus'
    );
    return gear;
  }

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */
  function populateOptions() {
    var pairs = [
      { selectId: 'cpuSelect', list: CPU_OPTIONS },
      { selectId: 'gpuSelect', list: GPU_OPTIONS },
      { selectId: 'ramSelect', list: RAM_OPTIONS },
      { selectId: 'storageSelect', list: STORAGE_OPTIONS }
    ];

    pairs.forEach(function (pair) {
      var select = byId(pair.selectId);
      if (!select || select.getAttribute('data-gaming-populated') === 'true') return;
      var markup = pair.list.map(function (option) {
        return '<option value="' + escapeHtml(option.id) + '">' +
          escapeHtml(option.name) + ' — ' + escapeHtml(money(option.price)) +
        '</option>';
      }).join('');
      if (typeof select.insertAdjacentHTML === 'function') {
        try {
          select.insertAdjacentHTML('beforeend', markup);
          select.setAttribute('data-gaming-populated', 'true');
        } catch (error) {
          // Fall back to the innerHTML path below.
          select.innerHTML = markup;
        }
      } else {
        select.innerHTML = markup;
      }
    });
  }

  function applyConfigToControls(config) {
    var safeConfig = sanitizeConfig(config);
    var pairs = [
      { selectId: 'cpuSelect', value: safeConfig.cpuId },
      { selectId: 'gpuSelect', value: safeConfig.gpuId },
      { selectId: 'ramSelect', value: safeConfig.ramId },
      { selectId: 'storageSelect', value: safeConfig.storageId }
    ];
    pairs.forEach(function (pair) {
      var select = byId(pair.selectId);
      if (select && typeof select.value === 'string') select.value = pair.value;
    });
    applySegmentedValue('resolution', safeConfig.resolution);
  }

  function renderHeroStats() {
    var prizePool = TOURNAMENTS.reduce(function (sum, cup) { return sum + numberOr(cup.prize, 0); }, 0);
    var rigsCount = byId('heroRigCount');
    var prizeEl = byId('heroPrizePool');
    var creatorsEl = byId('heroCreatorCount');
    if (rigsCount) rigsCount.textContent = formatNumber(ARENA_STATS.certifiedRigs);
    if (prizeEl) prizeEl.textContent = money(prizePool);
    if (creatorsEl) creatorsEl.textContent = formatNumber(ARENA_STATS.creatorsOnboarded);
  }

  function renderRigSummary(rig) {
    var list = byId('rigSummaryList');
    if (!list) return;

    var rows = [
      { label: text('gaming_cpu_label', 'Processor (CPU)'), part: rig.cpu },
      { label: text('gaming_gpu_label', 'Graphics card (GPU)'), part: rig.gpu },
      { label: text('gaming_ram_label', 'Memory (RAM)'), part: rig.ram },
      { label: text('gaming_storage_label', 'Storage'), part: rig.storage }
    ];

    list.innerHTML = rows.map(function (row) {
      if (!row.part) {
        return '<li><span class="gaming-part-empty">' + escapeHtml(row.label) + '</span><span>—</span></li>';
      }
      return '<li><span class="gaming-part-name">' + escapeHtml(row.part.name) + '</span>' +
        '<span class="gaming-part-price">' + escapeHtml(money(row.part.price)) + '</span></li>';
    }).join('') +
      '<li><span class="gaming-part-name">' + escapeHtml(text('gaming_resolution_label', 'Target resolution')) + '</span>' +
      '<span class="gaming-part-price">' + escapeHtml(rig.resolution) + '</span></li>';

    var totalEl = byId('rigTotalPrice');
    var mrpEl = byId('rigMrpPrice');
    var savingsEl = byId('rigSavings');
    var discount = rig.mrp > 0 ? Math.round((1 - (rig.total / rig.mrp)) * 100) : 0;
    if (totalEl) totalEl.textContent = money(rig.total);
    if (mrpEl) mrpEl.textContent = money(rig.mrp);
    if (savingsEl) savingsEl.textContent = '-' + Math.max(0, discount) + '%';

    var addButton = byId('addRigToCartBtn');
    if (addButton) {
      if (rig.complete) {
        addButton.removeAttribute('disabled');
        addButton.setAttribute('aria-disabled', 'false');
      } else {
        addButton.setAttribute('disabled', 'disabled');
        addButton.setAttribute('aria-disabled', 'true');
      }
    }
  }

  function renderEstimate(rig) {
    var fpsValue = byId('fpsValue');
    var tierEl = byId('fpsTier');
    var hintEl = byId('fpsHint');
    var telemetryFps = byId('telemetryFps');
    var telemetryCpu = byId('telemetryCpu');
    var telemetryGpu = byId('telemetryGpu');
    var telemetryRam = byId('telemetryRam');

    lastEstimate = {
      fps: rig.fps,
      tierKey: getFpsTierKey(rig.fps),
      ready: rig.complete
    };

    if (fpsValue) fpsValue.textContent = rig.complete ? String(rig.fps) : '--';
    if (telemetryFps) telemetryFps.textContent = rig.complete ? String(rig.fps) : '--';
    if (tierEl) {
      tierEl.textContent = rig.complete
        ? getFpsTierLabel(rig.fps)
        : text('gaming_tier_label', 'Competitive tier');
    }
    if (hintEl) {
      hintEl.textContent = rig.complete
        ? text('gaming_estimate_note', 'The same parts always return this number — no guesswork, no run-to-run drift.')
        : text('gaming_estimate_placeholder', 'Select every part, then estimate your frame rate.');
    }

    // One shared arc calculation drives both rings, and the tier ladder is the
    // legend for that same 0-240 scale.
    applyGaugeArc(rig.complete ? rig.fps : 0);
    renderTierLadder(rig.complete ? lastEstimate.tierKey : '');
    if (telemetryCpu) telemetryCpu.textContent = rig.cpu ? rig.cpu.short : '—';
    if (telemetryGpu) telemetryGpu.textContent = rig.gpu ? rig.gpu.short : '—';
    if (telemetryRam) telemetryRam.textContent = rig.ram ? rig.ram.short : '—';
  }

  function renderGear() {
    var grid = byId('gamingProductGrid');
    var skeleton = byId('gamingGearSkeleton');
    var emptyState = byId('gamingGearEmpty');
    var countEl = byId('gamingGearCount');

    if (skeleton) skeleton.hidden = true;
    if (!grid) return;

    if (!GAMING_GEAR.length) {
      grid.innerHTML = '';
      grid.setAttribute('aria-busy', 'false');
      if (emptyState) {
        emptyState.textContent = text('gaming_gear_empty', 'No arena gear is available right now. Please check back soon.');
        emptyState.hidden = false;
      }
      if (countEl) countEl.textContent = '';
      return;
    }

    grid.innerHTML = GAMING_GEAR.map(function (gear, index) {
      var discount = gear.mrp > 0 ? Math.round((1 - (gear.price / gear.mrp)) * 100) : 0;
      return '<article class="gaming-gear-card" style="animation-delay:' + Math.min(index * 70, 420) + 'ms">' +
        '<div class="gaming-gear-card__art">' +
          '<span class="gaming-gear-card__badge">-' + Math.max(0, discount) + '%</span>' +
          '<span class="gaming-art gaming-art--' + escapeHtml(gear.art) + '" aria-hidden="true">' +
            '<span class="art-body"></span><span class="art-fan"></span><span class="art-fan art-fan--two"></span>' +
            '<span class="art-pcie"></span><span class="art-band"></span><span class="art-cup art-cup--left"></span>' +
            '<span class="art-cup art-cup--right"></span><span class="art-mic"></span><span class="art-deck"></span>' +
            '<span class="art-keyrow art-keyrow--one"></span><span class="art-keyrow art-keyrow--two"></span>' +
            '<span class="art-keyrow art-keyrow--three"></span><span class="art-rgb"></span><span class="art-shell"></span>' +
            '<span class="art-wheel"></span><span class="art-glow"></span><span class="art-screen"></span>' +
            '<span class="art-hud"></span><span class="art-stand"></span><span class="art-base"></span>' +
            '<span class="art-back"></span><span class="art-seat"></span><span class="art-foot"></span>' +
          '</span>' +
        '</div>' +
        '<div class="gaming-gear-card__body">' +
          '<h3>' + escapeHtml(getGearName(gear)) + '</h3>' +
          '<p>' + escapeHtml(getGearDescription(gear)) + '</p>' +
          '<div class="gaming-gear-card__price">' +
            '<strong>' + escapeHtml(money(gear.price)) + '</strong>' +
            '<s>M.R.P.: ' + escapeHtml(money(gear.mrp)) + '</s>' +
          '</div>' +
          '<p class="gaming-gear-card__tax">' + escapeHtml(text('gaming_taxes_included', 'Inclusive of all taxes')) + '</p>' +
        '</div>' +
        '<button type="button" class="btn-gaming btn-gaming--neon" data-gaming-add-gear="' + escapeHtml(gear.id) + '">' +
          escapeHtml(text('gaming_gear_add_to_cart', 'Add to cart')) +
        '</button>' +
      '</article>';
    }).join('');

    grid.setAttribute('aria-busy', 'false');
    if (emptyState) emptyState.hidden = true;
    if (countEl) countEl.textContent = formatNumber(GAMING_GEAR.length) + ' ' + text('gaming_gear_items', 'items');
  }

  function renderTournaments() {
    var cupList = byId('gamingCupList');
    var prizeEl = byId('tournamentPrizePool');
    var slotsEl = byId('tournamentOpenSlots');
    var breakdown = byId('tournamentPrizeBreakdown');

    var prizePool = TOURNAMENTS.reduce(function (sum, cup) { return sum + numberOr(cup.prize, 0); }, 0);
    var openSlots = TOURNAMENTS.reduce(function (sum, cup) { return sum + numberOr(cup.slots, 0); }, 0);

    if (prizeEl) prizeEl.textContent = money(prizePool);
    if (slotsEl) slotsEl.textContent = formatNumber(openSlots);

    if (breakdown) {
      breakdown.innerHTML = TOURNAMENTS.map(function (cup) {
        return '<li><span>' + escapeHtml(text(cup.gameKey, cup.gameKey)) + '</span><strong>' + escapeHtml(money(cup.prize)) + '</strong></li>';
      }).join('');
    }

    if (cupList) {
      cupList.innerHTML = TOURNAMENTS.map(function (cup, index) {
        return '<li class="gaming-cup">' +
          '<span class="gaming-cup__index">' + String(index + 1).padStart(2, '0') + '</span>' +
          '<div class="gaming-cup__body">' +
            '<h3>' + escapeHtml(text(cup.nameKey, cup.nameKey)) + '</h3>' +
            '<p class="gaming-cup__meta">' + escapeHtml(text(cup.gameKey, cup.gameKey)) + ' · ' + escapeHtml(cup.date) + '</p>' +
          '</div>' +
          '<div class="gaming-cup__side">' +
            '<span class="gaming-cup__prize">' + escapeHtml(money(cup.prize)) + '</span>' +
            '<span class="gaming-cup__status ' + escapeHtml(cup.statusClass) + '">' + escapeHtml(text(cup.statusKey, cup.statusKey)) + '</span>' +
          '</div>' +
        '</li>';
      }).join('');
    }
  }

  function renderSponsorCounter() {
    var counter = byId('gamingSponsorCount');
    if (counter) counter.textContent = formatNumber(sponsorApplications.length);
  }

  function render() {
    var config = readConfig();
    var rig = buildRig(config);
    renderHeroStats();
    renderRigSummary(rig);
    renderGaugeScales();
    renderEstimate(rig);
    renderTournaments();
    renderSponsorCounter();
    refreshStaticTranslations();
    return rig;
  }

  /* ---------------------------------------------------------------------
   * Sponsorship applications
   * ------------------------------------------------------------------- */
  function sanitizeSponsorApplication(rawApplication) {
    if (!rawApplication || typeof rawApplication !== 'object') return null;
    var sponsorName = cleanText(rawApplication.sponsorName, 120);
    var sponsorEmail = cleanText(rawApplication.sponsorEmail, 254).toLowerCase();
    var creatorHandle = cleanText(rawApplication.creatorHandle, 31);
    var sponsorGame = cleanText(rawApplication.sponsorGame, 40).toLowerCase();

    if (sponsorName.length < 2) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sponsorEmail)) return null;
    if (!/^@?[A-Za-z0-9._]{3,30}$/.test(creatorHandle)) return null;
    if (GAME_VALUES.indexOf(sponsorGame) === -1) return null;

    var rawId = rawApplication.id;
    return {
      id: rawId === undefined || rawId === null ? String(Date.now()) : cleanText(rawId, 40),
      submittedAt: cleanText(rawApplication.submittedAt, 80) || new Date().toISOString(),
      sponsorName: sponsorName,
      sponsorEmail: sponsorEmail,
      creatorHandle: creatorHandle,
      sponsorGame: sponsorGame
    };
  }

  function loadSponsorApplications() {
    var parsed = parseJson(readStorage(SPONSOR_STORAGE_KEY), null);
    if (parsed === null) parsed = parseJson(readStorage(SPONSOR_LEGACY_STORAGE_KEY), []);
    sponsorApplications = Array.isArray(parsed)
      ? parsed.map(sanitizeSponsorApplication).filter(Boolean).slice(-MAX_SPONSOR_APPLICATIONS)
      : [];
  }

  function saveSponsorApplications() {
    return writeStorage(SPONSOR_STORAGE_KEY, JSON.stringify(sponsorApplications.slice(-MAX_SPONSOR_APPLICATIONS)));
  }

  function validateSponsorApplication(values) {
    var safeValues = values && typeof values === 'object' ? values : {};
    var application = sanitizeSponsorApplication(safeValues);
    if (!application) {
      return {
        valid: false,
        message: text('gaming_sponsor_invalid', 'Please check the highlighted sponsorship details and try again.')
      };
    }
    return { valid: true, application: application };
  }

  function getFormValue(form, name) {
    try {
      if (typeof FormData === 'function') {
        var formData = new FormData(form);
        if (formData && typeof formData.get === 'function') {
          var value = formData.get(name);
          if (value !== null && value !== undefined) return value;
        }
      }
    } catch (error) {
      // Fall back to reading the named control directly.
    }
    var field = byId(name);
    if (!field && form && typeof form.querySelector === 'function') {
      try {
        field = form.querySelector('[name="' + name + '"]');
      } catch (error) {
        field = null;
      }
    }
    return field && field.value !== undefined ? field.value : '';
  }

  function handleSponsorSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (!form) form = byId('sponsorApplyForm');
    if (!form) return false;

    if (hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setStatus(text('gaming_sponsor_invalid', 'Please check the highlighted sponsorship details and try again.'), 'error', 'sponsorStatus');
      return false;
    }

    var validation = validateSponsorApplication({
      sponsorName: getFormValue(form, 'sponsorName'),
      sponsorEmail: getFormValue(form, 'sponsorEmail'),
      creatorHandle: getFormValue(form, 'creatorHandle'),
      sponsorGame: getFormValue(form, 'sponsorGame')
    });

    if (!validation.valid) {
      setStatus(validation.message, 'error', 'sponsorStatus');
      return false;
    }

    sponsorApplications.push(validation.application);
    if (sponsorApplications.length > MAX_SPONSOR_APPLICATIONS) {
      sponsorApplications = sponsorApplications.slice(-MAX_SPONSOR_APPLICATIONS);
    }
    if (!saveSponsorApplications()) {
      sponsorApplications.pop();
      setStatus(text('gaming_sponsor_storage_error', 'We could not save your sponsorship application. Please try again.'), 'error', 'sponsorStatus');
      return false;
    }

    renderSponsorCounter();
    setStatus(text('gaming_sponsor_success', 'Sponsorship application saved on this device.'), 'success', 'sponsorStatus');
    dispatch('electromart:gamingSponsorApplied', validation.application);
    if (hasMethod(form, 'reset')) {
      try {
        form.reset();
      } catch (error) {
        // Reset is optional in lightweight DOM shims.
      }
    }
    // Keep the dialog open on the confirmation, but hand focus to the status
    // line so the saved state is announced instead of the reset submit button.
    focusStatus('sponsorStatus');
    return true;
  }

  function openSponsorModal() {
    var modal = byId('sponsorApplyModal');
    if (!modal) return;
    modal.hidden = false;
    if (hasMethod(modal, 'showModal')) {
      try {
        modal.showModal();
        var firstField = byId('sponsorName');
        if (firstField && typeof firstField.focus === 'function') firstField.focus();
        return;
      } catch (error) {
        // Fall through to the non-dialog fallback.
      }
    }
    if (typeof modal.setAttribute === 'function') modal.setAttribute('open', '');
  }

  function closeSponsorModal() {
    var modal = byId('sponsorApplyModal');
    if (!modal) return;
    if (hasMethod(modal, 'close')) {
      try {
        modal.close();
      } catch (error) {
        // Fall through to the fallback.
      }
    }
    modal.hidden = true;
    if (typeof modal.removeAttribute === 'function') modal.removeAttribute('open');
  }

  function isSponsorModalOpen() {
    var modal = byId('sponsorApplyModal');
    if (!modal) return false;
    return Boolean(modal.open || (typeof modal.hasAttribute === 'function' && modal.hasAttribute('open')));
  }

  /* ---------------------------------------------------------------------
   * Event wiring
   * ------------------------------------------------------------------- */
  function estimateCurrentRig() {
    var config = readConfig();
    var rig = buildRig(config);
    renderRigSummary(rig);
    renderEstimate(rig);
    saveRigConfig(config);
    return rig;
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
    if (!event) return;

    var sponsorTrigger = findAttribute(event.target, 'data-gaming-open-sponsor');
    if (sponsorTrigger) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      openSponsorModal();
      return;
    }

    var gearTrigger = findAttribute(event.target, 'data-gaming-add-gear');
    if (gearTrigger) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      addGearToCart(gearTrigger.getAttribute('data-gaming-add-gear'), 1);
      return;
    }

    // Clicking the dialog backdrop (the dialog element itself) closes it.
    var modal = byId('sponsorApplyModal');
    if (modal && event.target === modal) closeSponsorModal();
  }

  function bindControl(id, eventName, handler) {
    var element = byId(id);
    if (!element || typeof element.addEventListener !== 'function' || element._gamingBound) return;
    element._gamingBound = true;
    element.addEventListener(eventName, handler);
  }

  function setupEventListeners() {
    if (namespace._listenersBound) return;
    namespace._listenersBound = true;

    var form = byId('sponsorApplyForm');
    if (form && !form._gamingBound && typeof form.addEventListener === 'function') {
      form._gamingBound = true;
      form.addEventListener('submit', handleSponsorSubmit);
    }

    bindControl('openSponsorModalBtn', 'click', openSponsorModal);
    bindControl('closeSponsorModalBtn', 'click', closeSponsorModal);
    bindControl('cancelSponsorBtn', 'click', closeSponsorModal);
    bindControl('estimateFpsBtn', 'click', function () {
      estimateCurrentRig();
    });
    bindControl('addRigToCartBtn', 'click', function () {
      addRigToCart(readConfig(), 1);
    });

    ['cpuSelect', 'gpuSelect', 'ramSelect', 'storageSelect'].forEach(function (id) {
      bindControl(id, 'change', function () {
        estimateCurrentRig();
      });
    });

    queryAll('input[name="resolution"]').forEach(function (input) {
      if (!input || input._gamingBound || typeof input.addEventListener !== 'function') return;
      input._gamingBound = true;
      input.addEventListener('change', function () {
        estimateCurrentRig();
      });
    });

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('click', handleDocumentClick);
      doc.addEventListener('keydown', function (event) {
        if (event && event.key === 'Escape' && isSponsorModalOpen()) closeSponsorModal();
      });
    }

    if (root && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        if (!event) return;
        if (event.key === RIG_STORAGE_KEY || event.key === SPONSOR_STORAGE_KEY) loadSponsorApplications();
        if (event.key === 'electromart_lang_v1' || event.key === 'electromart_lang') {
          renderTournaments();
          renderGear();
          renderSponsorCounter();
          refreshStaticTranslations();
        }
      });
      root.addEventListener('languageChanged', function () {
        renderTournaments();
        renderGear();
        renderSponsorCounter();
        refreshStaticTranslations();
      });
      root.addEventListener('cart:updated', function () {
        // Keep the arena status line intact; the cart owns its own counters.
      });
    }
  }

  function init() {
    // Make the arena language explicit before the first paint so the static
    // data-i18n chrome and every dynamic string agree.
    syncLanguageStorage();
    populateOptions();
    loadSponsorApplications();
    applyConfigToControls(loadRigConfig());
    setupEventListeners();
    render();
    renderGear();
    return namespace;
  }

  /* ---------------------------------------------------------------------
   * Public surface
   * ------------------------------------------------------------------- */
  namespace.init = init;
  namespace.calculateFpsEstimate = calculateFpsEstimate;
  namespace.getFpsTierKey = getFpsTierKey;
  namespace.getFpsTierLabel = getFpsTierLabel;
  namespace.buildRig = buildRig;
  namespace.getConfig = readConfig;
  namespace.setConfig = function (config) {
    var safeConfig = sanitizeConfig(config);
    applyConfigToControls(safeConfig);
    saveRigConfig(safeConfig);
    return estimateCurrentRig();
  };
  namespace.estimate = estimateCurrentRig;
  namespace.addRigToCart = addRigToCart;
  namespace.addGearToCart = addGearToCart;
  namespace.getGear = function () { return GAMING_GEAR.slice(); };
  namespace.getGearName = getGearName;
  namespace.getGearDescription = getGearDescription;
  namespace.getGearById = getGearById;
  namespace.getTournaments = function () { return TOURNAMENTS.slice(); };
  namespace.getSponsorApplications = function () { return sponsorApplications.slice(); };
  namespace.validateSponsorApplication = validateSponsorApplication;
  namespace.handleSponsorSubmit = handleSponsorSubmit;
  namespace.openSponsorModal = openSponsorModal;
  namespace.closeSponsorModal = closeSponsorModal;
  namespace.render = render;
  namespace.RIG_STORAGE_KEY = RIG_STORAGE_KEY;
  namespace.SPONSOR_STORAGE_KEY = SPONSOR_STORAGE_KEY;
  namespace.SPONSOR_LEGACY_STORAGE_KEY = SPONSOR_LEGACY_STORAGE_KEY;
  namespace.CART_STORAGE_KEY = CART_STORAGE_KEY;
  namespace.CATALOG_STORAGE_KEY = CATALOG_STORAGE_KEY;
  namespace.MAX_SPONSOR_APPLICATIONS = MAX_SPONSOR_APPLICATIONS;
  namespace.GPU_TIER_FRAMES = GPU_TIER_FRAMES;
  namespace.CPU_TIER_FRAMES = CPU_TIER_FRAMES;
  namespace.RESOLUTION_FACTORS = RESOLUTION_FACTORS;
  namespace.GAUGE_REFERENCE_FPS = GAUGE_REFERENCE_FPS;
  namespace.GAUGE_ARC_SWEEP_DEG = GAUGE_ARC_SWEEP_DEG;
  namespace.getGaugeArc = getGaugeArc;
  namespace.applyGaugeArc = applyGaugeArc;
  namespace.getTierRangeLabel = getTierRangeLabel;
  namespace.readStoredLanguage = readStoredLanguage;
  namespace.syncLanguageStorage = syncLanguageStorage;
  namespace.getLastEstimate = function () {
    return { fps: lastEstimate.fps, tierKey: lastEstimate.tierKey, ready: lastEstimate.ready };
  };

  if (doc && doc.readyState === 'loading' && typeof doc.addEventListener === 'function') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}), typeof document !== 'undefined' ? document : null);
