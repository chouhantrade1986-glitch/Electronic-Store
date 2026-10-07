/* ElectroMart Student & Educator Campus Store JavaScript (Phase 40) */
/* Defensive controller for local student verification, the semester course */
/* material shelf, the deterministic student discount engines, back to college */
/* offers, and faculty course lists. No randomness, no sampling, and no */
/* time-dependent pricing anywhere in this file. */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.EduStore = electroMart.EduStore || root.ElectroMartEduStore || {};
  // Flat alias kept for integrations that predate the namespaced object.
  root.ElectroMartEduStore = namespace;

  /* ---------------------------------------------------------------------
   * Storage contracts
   * ------------------------------------------------------------------- */
  var PROFILE_STORAGE_KEY = 'electromart_edu_student_profile_v1';
  var FACULTY_STORAGE_KEY = 'electromart_edu_faculty_lists_v1';
  var CART_STORAGE_KEY = 'electromart_cart_v1';
  var CATALOG_STORAGE_KEY = 'electromart_catalog_v1';
  var LANGUAGE_STORAGE_KEYS = ['electromart_lang_v1', 'electromart_lang'];
  var MAX_FACULTY_LISTS = 10;
  var MAX_CART_QUANTITY = 99;
  // A department order is one line for the whole class, so the class-size cap
  // doubles as the cart quantity cap for a faculty list.
  var MAX_FACULTY_QUANTITY = 500;

  /* ---------------------------------------------------------------------
   * Deterministic discount engine
   * -------------------------------------------------------------------
   * One ladder drives the estimator, the on-page legend, and the dial arc, so
   * the printed percentage can never drift from the engine that produced it.
   * The ladder only ever climbs with the academic score, which is what makes
   * "a higher score is never worse" a structural property instead of a promise.
   * ------------------------------------------------------------------- */
  var DIAL_REFERENCE_PERCENT = 20;
  var DIAL_ARC_SWEEP_DEG = 180;

  var STUDENT_DISCOUNT_LADDER = [
    { min: 90, percent: 20, key: 'edu_ladder_band_4' },
    { min: 75, percent: 15, key: 'edu_ladder_band_3' },
    { min: 60, percent: 10, key: 'edu_ladder_band_2' },
    { min: 45, percent: 6, key: 'edu_ladder_band_1' },
    { min: 0, percent: 0, key: 'edu_ladder_band_0' }
  ];

  var STUDENT_DISCOUNT_CATEGORIES = [
    { id: 'textbook', scale: 1, cap: 20, key: 'edu_filter_textbook' },
    { id: 'notes', scale: 1, cap: 20, key: 'edu_filter_notes' },
    { id: 'lab-kit', scale: 0.8, cap: 16, key: 'edu_filter_lab' },
    { id: 'electronics', scale: 1, cap: 5, key: 'edu_filter_electronics' },
    { id: 'accessories', scale: 0.6, cap: 4, key: 'edu_filter_accessories' }
  ];

  var CATEGORY_IDS = STUDENT_DISCOUNT_CATEGORIES.map(function (category) { return category.id; });
  var DEFAULT_CATEGORY = 'textbook';
  var DEFAULT_CGPA = 75;
  var MIN_CGPA = 40;
  var MAX_CGPA = 100;
  var DIAL_SWEEP_RATIO = DIAL_ARC_SWEEP_DEG / DIAL_REFERENCE_PERCENT;

  /* ---------------------------------------------------------------------
   * Local eligibility preview rules (honest by construction)
   * -------------------------------------------------------------------
   * This never contacts a university and never claims a server-side or
   * institutional confirmation. It is a format and domain check that runs on
   * this device, and the UI says so in the same sentence every time.
   * ------------------------------------------------------------------- */
  var STUDENT_ID_PATTERN = /^[A-Z]{2,4}[0-9]{4}[A-Z0-9]{1,6}$/;
  var COLLEGE_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
  var ACADEMIC_DOMAIN_SUFFIXES = [
    'ac.in', 'edu.in', 'ac.uk', 'ac.jp', 'ac.au', 'edu.au', 'edu.ng',
    'ac.ae', 'edu.sg', 'ac.bd', 'ac.lk', 'edu.pk', 'ac.eg', 'ac.za',
    'edu', 'univ', 'ac'
  ];

  var MIN_SEMESTER = 1;
  var MAX_SEMESTER = 8;
  var DEFAULT_SEMESTER = 2;

  /* ---------------------------------------------------------------------
   * Semester course material shelf (fixed table, no generated content)
   * ------------------------------------------------------------------- */
  var COURSE_MATERIAL = [
    {
      id: 'edu-cm-ds-textbook', code: 'CS204', category: 'textbook', semesters: [2, 6],
      nameKey: 'edu_item_ds_textbook_name', name: 'Data Structures & Algorithms Textbook',
      descriptionKey: 'edu_item_ds_textbook_description',
      description: 'University-grade text with solved problem sets and exam question banks.',
      price: 749, mrp: 1199, art: 'book'
    },
    {
      id: 'edu-cm-ds-notes', code: 'CS204', category: 'notes', semesters: [2, 6],
      nameKey: 'edu_item_ds_notes_name', name: 'Data Structures Revision Notes',
      descriptionKey: 'edu_item_ds_notes_description',
      description: 'Condensed unit summaries, diagrams and previous-year question walkthroughs.',
      price: 249, mrp: 399, art: 'notes'
    },
    {
      id: 'edu-cm-os-textbook', code: 'CS305', category: 'textbook', semesters: [4, 8],
      nameKey: 'edu_item_os_textbook_name', name: 'Operating Systems Textbook',
      descriptionKey: 'edu_item_os_textbook_description',
      description: 'Process scheduling, memory management and file systems, written for campus labs.',
      price: 899, mrp: 1399, art: 'book'
    },
    {
      id: 'edu-cm-os-labkit', code: 'CS305', category: 'lab-kit', semesters: [4, 8],
      nameKey: 'edu_item_os_labkit_name', name: 'Operating Systems Lab Kit',
      descriptionKey: 'edu_item_os_labkit_description',
      description: 'Breadboard, jumper set, logic probe and a printed lab manual in one box.',
      price: 1899, mrp: 2799, art: 'kit'
    },
    {
      id: 'edu-cm-db-textbook', code: 'CS307', category: 'textbook', semesters: [5],
      nameKey: 'edu_item_db_textbook_name', name: 'Database Systems Textbook',
      descriptionKey: 'edu_item_db_textbook_description',
      description: 'Relational design, indexing and transaction handling with Indian case studies.',
      price: 949, mrp: 1499, art: 'book'
    },
    {
      id: 'edu-cm-db-labkit', code: 'CS307', category: 'lab-kit', semesters: [5],
      nameKey: 'edu_item_db_labkit_name', name: 'Database Systems Lab Kit',
      descriptionKey: 'edu_item_db_labkit_description',
      description: 'Portable SQL practice server image, sample schema and a graded lab workbook.',
      price: 2149, mrp: 3299, art: 'kit'
    },
    {
      id: 'edu-cm-alg-textbook', code: 'CS402', category: 'textbook', semesters: [3, 7],
      nameKey: 'edu_item_alg_textbook_name', name: 'Algorithms & Complexity Textbook',
      descriptionKey: 'edu_item_alg_textbook_description',
      description: 'Design paradigms, graph algorithms and complexity analysis with proofs.',
      price: 1099, mrp: 1699, art: 'book'
    },
    {
      id: 'edu-cm-alg-notes', code: 'CS402', category: 'notes', semesters: [3, 7],
      nameKey: 'edu_item_alg_notes_name', name: 'Algorithms Revision Notes',
      descriptionKey: 'edu_item_alg_notes_description',
      description: 'Hand-listed recurrence tables, greedy proofs and a full exam revision map.',
      price: 279, mrp: 449, art: 'notes'
    },
    {
      id: 'edu-cm-net-labkit', code: 'CS410', category: 'lab-kit', semesters: [6],
      nameKey: 'edu_item_net_labkit_name', name: 'Computer Networks Lab Kit',
      descriptionKey: 'edu_item_net_labkit_description',
      description: 'Patch panel, patch leads, crimp tool and a topology lab manual.',
      price: 2399, mrp: 3499, art: 'kit'
    },
    {
      id: 'edu-cm-fresher-laptop', code: 'SEM1', category: 'electronics', semesters: [1],
      nameKey: 'edu_item_fresher_laptop_name', name: 'First-Year Notebook Laptop',
      descriptionKey: 'edu_item_fresher_laptop_description',
      description: '14 inch study notebook with a warranty that survives four years of labs.',
      price: 34999, mrp: 42999, art: 'laptop'
    },
    {
      id: 'edu-cm-fresher-kit', code: 'SEM1', category: 'lab-kit', semesters: [1],
      nameKey: 'edu_item_fresher_kit_name', name: 'Engineering Drawing Starter Kit',
      descriptionKey: 'edu_item_fresher_kit_description',
      description: 'A2 drawing sheet pack, geometry box, scale set and a drawing instrument pouch.',
      price: 1299, mrp: 1899, art: 'kit'
    },
    {
      id: 'edu-cm-backpack', code: 'CAMPUS', category: 'accessories', semesters: [1, 2, 3, 4, 5, 6, 7, 8],
      nameKey: 'edu_item_backpack_name', name: 'Campus Laptop Backpack 24L',
      descriptionKey: 'edu_item_backpack_description',
      description: 'Padded 15.6 inch laptop sleeve, water-repellent weave and a rain cover.',
      price: 899, mrp: 1499, art: 'bag'
    },
    {
      id: 'edu-cm-stand', code: 'CAMPUS', category: 'accessories', semesters: [1, 2, 3, 4, 5, 6, 7, 8],
      nameKey: 'edu_item_stand_name', name: 'Foldable Study Laptop Stand',
      descriptionKey: 'edu_item_stand_description',
      description: 'Aluminium desk riser with six height positions for long library sessions.',
      price: 549, mrp: 899, art: 'bag'
    },
    {
      id: 'edu-cm-stylus', code: 'CAMPUS', category: 'accessories', semesters: [1, 2, 3, 4, 5, 6, 7, 8],
      nameKey: 'edu_item_stylus_name', name: 'Campus Note-Taking Stylus Pen',
      descriptionKey: 'edu_item_stylus_description',
      description: 'Pressure-sensitive stylus with a palm-reject tip for handwritten notes.',
      price: 449, mrp: 699, art: 'pen'
    }
  ];

  var MATERIAL_FILTERS = [
    { id: 'all', key: 'edu_filter_all' }
  ].concat(STUDENT_DISCOUNT_CATEGORIES.map(function (category) {
    return { id: category.id, key: category.key };
  }));

  /* ---------------------------------------------------------------------
   * Back to college offers (fixed ElectroMart seasonal copy)
   * ------------------------------------------------------------------- */
  var BACK_TO_COLLEGE_OFFERS = [
    {
      id: 'edu-offer-fresher-laptop', seasonKey: 'edu_offer_season_fresher',
      nameKey: 'edu_offer_fresher_name', name: 'First-Year Notebook Laptop',
      descriptionKey: 'edu_offer_fresher_description',
      description: 'Campus-rate pricing on 14 inch study notebooks with a four-year warranty.',
      price: 32999, mrp: 42999, category: 'electronics'
    },
    {
      id: 'edu-offer-hostel-kit', seasonKey: 'edu_offer_season_hostel',
      nameKey: 'edu_offer_hostel_name', name: 'Hostel Room Starter Kit',
      descriptionKey: 'edu_offer_hostel_description',
      description: 'Study lamp, extension board, desk organiser and a surge-protected rail in one bundle.',
      price: 1899, mrp: 2799, category: 'accessories'
    },
    {
      id: 'edu-offer-lab-kit', seasonKey: 'edu_offer_season_lab',
      nameKey: 'edu_offer_lab_name', name: 'Department Lab Kit',
      descriptionKey: 'edu_offer_lab_description',
      description: 'Class-size lab kits with printed manuals and a single consolidated invoice.',
      price: 16999, mrp: 24999, category: 'lab-kit'
    },
    {
      id: 'edu-offer-project-laptop', seasonKey: 'edu_offer_season_project',
      nameKey: 'edu_offer_project_name', name: 'Final-Year Project Workstation',
      descriptionKey: 'edu_offer_project_description',
      description: 'Portable workstation for capstone builds, internships and lab submissions.',
      price: 62999, mrp: 78999, category: 'electronics'
    },
    {
      id: 'edu-offer-placement-prep', seasonKey: 'edu_offer_season_placement',
      nameKey: 'edu_offer_placement_name', name: 'Placement Season Study Bundle',
      descriptionKey: 'edu_offer_placement_description',
      description: 'Aptitude workbooks, interview revision notes and a mock-interview notebook.',
      price: 1199, mrp: 1799, category: 'notes'
    },
    {
      id: 'edu-offer-exam-refresh', seasonKey: 'edu_offer_season_exam',
      nameKey: 'edu_offer_exam_name', name: 'Exam Season Revision Compendium',
      descriptionKey: 'edu_offer_exam_description',
      description: 'Full-semester revision compendium with printed question banks and answers.',
      price: 999, mrp: 1599, category: 'textbook'
    }
  ];

  /* ---------------------------------------------------------------------
   * Faculty copy pricing (fixed department rate card)
   * ------------------------------------------------------------------- */
  var FACULTY_COPY_OPTIONS = [
    { id: 'textbook', price: 749, mrp: 1199, key: 'edu_faculty_copy_textbook' },
    { id: 'notes', price: 249, mrp: 399, key: 'edu_faculty_copy_notes' },
    { id: 'lab-kit', price: 1899, mrp: 2799, key: 'edu_faculty_copy_lab' },
    { id: 'compendium', price: 1099, mrp: 1699, key: 'edu_faculty_copy_compendium' }
  ];
  var DEFAULT_FACULTY_COPY_ID = 'textbook';

  var COURSE_CODE_PATTERN = /^[A-Z]{2,6}[0-9]{2,4}[A-Z]{0,4}$/;
  var MAX_FACULTY_STUDENTS = 500;

  var CAMPUS_STATS = {
    maxDiscountPercent: DIAL_REFERENCE_PERCENT
  };

  var memoryStorage = createMemoryStorage();
  var facultyLists = [];
  var currentProfile = null;
  var currentList = null;
  var activeMaterialFilter = 'all';

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

  function slugify(value) {
    return cleanText(value, 60).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'course';
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
   * paints the static data-i18n chrome in that language. The campus store must
   * resolve the same key with the same default or a first-time visitor sees a
   * page that is half-Hindi and half-English. Both storage keys are always
   * written together so every page in the storefront agrees on the language.
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
     the document declaration in step with the language the store actually
     paints, including the RTL flip for Urdu. */
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
    status.className = 'edu-status' + (kind ? ' is-' + kind : '');
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
   * Normalizers
   * ------------------------------------------------------------------- */
  function normalizeCategory(value) {
    var key = cleanText(value, 32).toLowerCase();
    return CATEGORY_IDS.indexOf(key) === -1 ? DEFAULT_CATEGORY : key;
  }

  function normalizeCgpa(value) {
    var cgpa = Math.round(numberOr(value, DEFAULT_CGPA));
    if (!isFinite(cgpa)) cgpa = DEFAULT_CGPA;
    return clamp(cgpa, 0, MAX_CGPA);
  }

  function normalizeSemester(value) {
    var semester = Math.round(numberOr(value, DEFAULT_SEMESTER));
    if (!isFinite(semester)) semester = DEFAULT_SEMESTER;
    return clamp(semester, MIN_SEMESTER, MAX_SEMESTER);
  }

  function normalizeBasePrice(value) {
    var price = Math.round(numberOr(value, 0));
    if (!isFinite(price)) price = 0;
    return Math.max(0, price);
  }

  function getCategory(categoryId) {
    var key = normalizeCategory(categoryId);
    for (var index = 0; index < STUDENT_DISCOUNT_CATEGORIES.length; index += 1) {
      if (STUDENT_DISCOUNT_CATEGORIES[index].id === key) return STUDENT_DISCOUNT_CATEGORIES[index];
    }
    return STUDENT_DISCOUNT_CATEGORIES[0];
  }

  function getLadderBand(cgpa) {
    var score = normalizeCgpa(cgpa);
    for (var index = 0; index < STUDENT_DISCOUNT_LADDER.length; index += 1) {
      if (score >= STUDENT_DISCOUNT_LADDER[index].min) return STUDENT_DISCOUNT_LADDER[index];
    }
    return STUDENT_DISCOUNT_LADDER[STUDENT_DISCOUNT_LADDER.length - 1];
  }

  function getAcademicDomain(email) {
    var address = cleanText(email, 254).toLowerCase();
    var at = address.lastIndexOf('@');
    if (at === -1) return '';
    return address.slice(at + 1);
  }

  function isAcademicDomain(domain) {
    var host = cleanText(domain, 120).toLowerCase();
    if (!host || host.indexOf('.') === -1) return false;
    for (var index = 0; index < ACADEMIC_DOMAIN_SUFFIXES.length; index += 1) {
      var suffix = ACADEMIC_DOMAIN_SUFFIXES[index];
      if (host === suffix || host.slice(-(suffix.length + 1)) === '.' + suffix) return true;
    }
    return false;
  }

  /* ---------------------------------------------------------------------
   * Deterministic pricing engines
   * ------------------------------------------------------------------- */
  /**
   * Student discount ladder. Pure function of (verified, cgpa, category):
   * identical input always returns an identical integer percentage, a higher
   * score never returns a smaller percentage, and an unverified student always
   * returns exactly zero.
   */
  function calculateStudentDiscount(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    if (safeInput.verified !== true) return 0;

    var base = getLadderBand(safeInput.cgpa).percent;
    if (base <= 0) return 0;

    var category = getCategory(safeInput.category);
    var scaled = Math.round(base * numberOr(category.scale, 1));
    return clamp(scaled, 0, Math.min(category.cap, DIAL_REFERENCE_PERCENT));
  }

  /**
   * Rupee student pricing. Rounds to the nearest whole rupee once, at the end,
   * so a 15% cut on ₹1,499 lands on ₹1,274 rather than a drifting decimal.
   */
  function calculateStudentPrice(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var basePrice = normalizeBasePrice(safeInput.basePrice);
    var discount = calculateStudentDiscount(safeInput);
    return Math.round((basePrice * (100 - discount)) / 100);
  }

  function getDialArc(discountPercent) {
    var ratio = clamp(numberOr(discountPercent, 0) / DIAL_REFERENCE_PERCENT, 0, 1);
    return (ratio * DIAL_ARC_SWEEP_DEG).toFixed(1) + 'deg';
  }

  function getBandRangeLabel(band) {
    var index = STUDENT_DISCOUNT_LADDER.indexOf(band);
    if (index === -1) return '';
    var floor = band.min;
    if (index === 0) return floor + '%+';
    var ceiling = STUDENT_DISCOUNT_LADDER[index - 1].min - 1;
    return ceiling > floor ? floor + '&ndash;' + ceiling + '%' : floor + '%+';
  }

  /* ---------------------------------------------------------------------
   * Local student verification
   * -------------------------------------------------------------------
   * A local eligibility preview: student-ID format plus an academic email
   * domain. It never contacts a server and never claims institutional
   * approval, and every return value carries that reason string.
   * ------------------------------------------------------------------- */
  function verifyStudentProfile(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var studentId = cleanText(safeInput.studentId, 24).toUpperCase().replace(/[\s-]+/g, '');
    var collegeEmail = cleanText(safeInput.collegeEmail, 254).toLowerCase();
    var collegeDomain = getAcademicDomain(collegeEmail);

    var idValid = STUDENT_ID_PATTERN.test(studentId);
    var emailValid = COLLEGE_EMAIL_PATTERN.test(collegeEmail) && isAcademicDomain(collegeDomain);

    var reasonKey;
    var reason;
    if (idValid && emailValid) {
      reasonKey = 'edu_verify_ok';
      reason = text(
        'edu_verify_ok',
        'This student ID and college domain match the campus store format. Verified locally on this device.'
      );
    } else if (!idValid && !emailValid) {
      reasonKey = 'edu_verify_invalid_both';
      reason = text(
        'edu_verify_invalid_both',
        'Enter a student ID in the format ABC1234X and a college email address such as you@college.ac.in.'
      );
    } else if (!idValid) {
      reasonKey = 'edu_verify_invalid_id';
      reason = text('edu_verify_invalid_id', 'Enter a student ID in the format ABC1234X.');
    } else {
      reasonKey = 'edu_verify_invalid_email';
      reason = text('edu_verify_invalid_email', 'Use your college email address, for example you@college.ac.in.');
    }

    var semester = normalizeSemester(safeInput.semester);
    return {
      verified: Boolean(idValid && emailValid),
      studentId: studentId,
      collegeEmail: collegeEmail,
      collegeDomain: collegeDomain,
      semester: semester,
      cgpa: normalizeCgpa(safeInput.cgpa),
      checkedLocally: true,
      reasonKey: reasonKey,
      reason: reason
    };
  }

  function sanitizeProfile(rawProfile) {
    var checked = verifyStudentProfile(rawProfile || {});
    return {
      verified: checked.verified,
      studentId: checked.studentId,
      collegeEmail: checked.collegeEmail,
      collegeDomain: checked.collegeDomain,
      semester: checked.semester,
      cgpa: checked.cgpa,
      checkedLocally: true
    };
  }

  function loadProfile() {
    currentProfile = sanitizeProfile(parseJson(readStorage(PROFILE_STORAGE_KEY), {}));
    return currentProfile;
  }

  function saveProfile(profile) {
    currentProfile = sanitizeProfile(profile);
    return writeStorage(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
  }

  function clearProfile() {
    currentProfile = sanitizeProfile({});
    return writeStorage(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
  }

  /* ---------------------------------------------------------------------
   * Course material shelf
   * ------------------------------------------------------------------- */
  function getSemesterOptions() {
    var options = [];
    for (var semester = MIN_SEMESTER; semester <= MAX_SEMESTER; semester += 1) {
      options.push({ value: semester, key: 'edu_semester_option', number: semester });
    }
    return options;
  }

  function getMaterialById(materialId) {
    var key = cleanText(materialId, 80);
    for (var index = 0; index < COURSE_MATERIAL.length; index += 1) {
      if (COURSE_MATERIAL[index].id === key) return COURSE_MATERIAL[index];
    }
    return null;
  }

  function getMaterialName(material) {
    if (!material) return '';
    return text(material.nameKey, material.name || material.nameKey);
  }

  function getMaterialDescription(material) {
    if (!material) return '';
    return text(material.descriptionKey, material.description || material.descriptionKey);
  }

  /* Deterministic shelf query: a title belongs to a semester when the fixed
     table says so, and the filter narrows that list further. Never sampled. */
  function getMaterialsForSemester(semester, filter) {
    var normalizedSemester = normalizeSemester(semester);
    var normalizedFilter = cleanText(filter, 32) || 'all';
    return COURSE_MATERIAL.filter(function (material) {
      if (material.semesters.indexOf(normalizedSemester) === -1) return false;
      if (normalizedFilter === 'all') return true;
      return material.category === normalizedFilter;
    });
  }

  function getAllMaterials() {
    return COURSE_MATERIAL.slice();
  }

  function getSemesterLabel(semester) {
    return interpolate(text('edu_semester_option', 'Semester {number}'), { number: normalizeSemester(semester) });
  }

  /* ---------------------------------------------------------------------
   * Faculty course lists
   * ------------------------------------------------------------------- */
  function findCopyOption(perStudentCopyPrice, copyId) {
    var wanted = cleanText(copyId, 32);
    if (wanted) {
      for (var index = 0; index < FACULTY_COPY_OPTIONS.length; index += 1) {
        if (FACULTY_COPY_OPTIONS[index].id === wanted) return FACULTY_COPY_OPTIONS[index];
      }
    }
    var wantedPrice = numberOr(perStudentCopyPrice, NaN);
    if (isFinite(wantedPrice) && wantedPrice > 0) {
      for (var byPrice = 0; byPrice < FACULTY_COPY_OPTIONS.length; byPrice += 1) {
        if (FACULTY_COPY_OPTIONS[byPrice].price === Math.round(wantedPrice)) return FACULTY_COPY_OPTIONS[byPrice];
      }
    }
    return FACULTY_COPY_OPTIONS[0];
  }

  function getFacultyCopyPriceLabel(copyOption) {
    if (!copyOption) return '';
    return text(copyOption.key, copyOption.key);
  }

  /**
   * Deterministic faculty course list. The same course code, name, class size
   * and copy price always produce the same copy count, rupee total and rupee
   * saving, and the id is stable so re-adding a class updates one cart line.
   */
  function buildFacultyList(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var courseCode = cleanText(safeInput.courseCode, 16).toUpperCase().replace(/\s+/g, '');
    var courseName = cleanText(safeInput.courseName, 80);
    var studentCount = Math.round(numberOr(safeInput.studentCount, 0));
    if (!isFinite(studentCount) || studentCount < 0) studentCount = 0;
    studentCount = clamp(studentCount, 0, MAX_FACULTY_STUDENTS);

    var copyOption = findCopyOption(safeInput.perStudentCopyPrice, safeInput.perStudentCopyId);
    var perStudentCopyPrice = numberOr(safeInput.perStudentCopyPrice, copyOption.price);
    if (!isFinite(perStudentCopyPrice) || perStudentCopyPrice <= 0) perStudentCopyPrice = copyOption.price;
    perStudentCopyPrice = Math.round(perStudentCopyPrice);

    var mrpPerCopy = numberOr(copyOption.mrp, Math.round(perStudentCopyPrice * 1.4));
    var mrpTotal = studentCount * mrpPerCopy;
    var totalPrice = studentCount * perStudentCopyPrice;
    var totalSavings = mrpTotal - totalPrice;
    var discountPercent = mrpTotal > 0 ? Math.round((totalSavings / mrpTotal) * 100) : 0;
    var copyId = cleanText(safeInput.perStudentCopyId, 32) || copyOption.id;
    var courseSlug = slugify(courseCode + ' ' + courseName);

    return {
      id: 'edu-faculty-' + courseSlug + '-' + copyId + '-' + studentCount,
      courseCode: courseCode,
      courseName: courseName,
      studentCount: studentCount,
      totalCopies: studentCount,
      perStudentCopyId: copyId,
      perStudentCopyPrice: perStudentCopyPrice,
      mrpPerCopy: mrpPerCopy,
      mrpTotal: mrpTotal,
      totalPrice: totalPrice,
      totalSavings: totalSavings,
      discountPercent: clamp(discountPercent, 0, 100),
      checkedLocally: true
    };
  }

  function validateFacultyList(input) {
    var safeInput = input && typeof input === 'object' ? input : {};
    var courseCode = cleanText(safeInput.courseCode, 16).toUpperCase().replace(/\s+/g, '');
    var courseName = cleanText(safeInput.courseName, 80);
    var rawCount = cleanText(safeInput.studentCount, 8);
    var studentCount = Math.round(numberOr(rawCount, NaN));

    if (!COURSE_CODE_PATTERN.test(courseCode)) {
      return {
        valid: false,
        code: 'edu_faculty_invalid_code',
        message: text('edu_faculty_invalid_code', 'Course codes need two to six letters followed by two to four digits.')
      };
    }
    if (courseName.length < 3) {
      return {
        valid: false,
        code: 'edu_faculty_invalid_name',
        message: text('edu_faculty_invalid_name', 'Enter a course name of at least three characters.')
      };
    }
    if (!rawCount || !isFinite(studentCount) || studentCount < 1 || studentCount > MAX_FACULTY_STUDENTS) {
      return {
        valid: false,
        code: 'edu_faculty_invalid_count',
        message: text('edu_faculty_invalid_count', 'Class size must be between one and five hundred.')
      };
    }

    return { valid: true, list: buildFacultyList(safeInput) };
  }

  function sanitizeFacultyList(rawList) {
    if (!rawList || typeof rawList !== 'object') return null;
    var courseCode = cleanText(rawList.courseCode, 16).toUpperCase().replace(/\s+/g, '');
    var courseName = cleanText(rawList.courseName, 80);
    var studentCount = Math.round(numberOr(rawList.totalCopies, numberOr(rawList.studentCount, 0)));
    if (!COURSE_CODE_PATTERN.test(courseCode) || courseName.length < 3) return null;
    if (!isFinite(studentCount) || studentCount < 1 || studentCount > MAX_FACULTY_STUDENTS) return null;

    // Totals are recomputed from the stored inputs rather than trusted, so a
    // hand-edited storage value can never invent a price.
    var rebuilt = buildFacultyList({
      courseCode: courseCode,
      courseName: courseName,
      studentCount: studentCount,
      perStudentCopyId: cleanText(rawList.perStudentCopyId, 32),
      perStudentCopyPrice: numberOr(rawList.perStudentCopyPrice, 0)
    });
    rebuilt.id = cleanText(rawList.id, 120) || rebuilt.id;
    return rebuilt;
  }

  function loadFacultyLists() {
    var parsed = parseJson(readStorage(FACULTY_STORAGE_KEY), []);
    facultyLists = Array.isArray(parsed)
      ? parsed.map(sanitizeFacultyList).filter(Boolean).slice(-MAX_FACULTY_LISTS)
      : [];
    return facultyLists;
  }

  function saveFacultyLists() {
    return writeStorage(FACULTY_STORAGE_KEY, JSON.stringify(facultyLists.slice(-MAX_FACULTY_LISTS)));
  }

  function upsertFacultyList(list) {
    if (!list) return null;
    for (var index = 0; index < facultyLists.length; index += 1) {
      if (facultyLists[index].id === list.id) {
        facultyLists[index] = list;
        return saveFacultyLists() ? list : null;
      }
    }
    facultyLists.push(list);
    if (facultyLists.length > MAX_FACULTY_LISTS) {
      facultyLists = facultyLists.slice(-MAX_FACULTY_LISTS);
    }
    return saveFacultyLists() ? list : null;
  }

  function removeFacultyList(listId) {
    var key = cleanText(listId, 120);
    for (var index = 0; index < facultyLists.length; index += 1) {
      if (facultyLists[index].id === key) {
        facultyLists.splice(index, 1);
        return saveFacultyLists();
      }
    }
    return false;
  }

  /* ---------------------------------------------------------------------
   * Cart integration (existing storefront conventions)
   * ------------------------------------------------------------------- */
  function addCartLine(line, quantity, quantityCap) {
    var cap = clamp(Math.round(numberOr(quantityCap, MAX_CART_QUANTITY)), 1, MAX_FACULTY_QUANTITY);
    var safeQuantity = clamp(Math.floor(numberOr(quantity, 1)), 1, cap);
    var cartMap = readJsonMap(CART_STORAGE_KEY);
    cartMap[line.id] = clamp((numberOr(cartMap[line.id], 0) || 0) + safeQuantity, 0, cap);
    if (!writeStorage(CART_STORAGE_KEY, JSON.stringify(cartMap))) return false;

    var catalogMap = readJsonMap(CATALOG_STORAGE_KEY);
    catalogMap[line.id] = {
      id: line.id,
      name: line.name,
      price: numberOr(line.price, 0),
      listPrice: numberOr(line.mrp, numberOr(line.price, 0)),
      image: '',
      stock: cap,
      category: line.category || 'campus-store',
      hsnCode: '49019999',
      gstRate: 0.18,
      segment: 'b2c',
      itcEligible: true
    };
    writeStorage(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));

    dispatch('cart:updated', { id: line.id, name: line.name, price: numberOr(line.price, 0), quantity: safeQuantity });
    dispatch('electromart:eduCartAdded', { id: line.id, name: line.name, quantity: safeQuantity });
    return true;
  }

  function getStudentPriceForMaterial(material) {
    var profile = currentProfile || {};
    return calculateStudentPrice({
      basePrice: material.price,
      verified: profile.verified === true,
      cgpa: profile.cgpa,
      category: material.category
    });
  }

  function addMaterialToCart(materialId) {
    var material = getMaterialById(materialId);
    if (!material) return null;
    var name = getMaterialName(material);
    var price = getStudentPriceForMaterial(material);

    if (!addCartLine({
      id: material.id,
      name: name,
      price: price,
      mrp: material.mrp,
      category: material.category
    }, 1, MAX_CART_QUANTITY)) {
      setStatus(text('edu_storage_error', 'We could not save your request on this device. Please try again.'), 'error', 'studentStatus');
      return null;
    }

    setStatus(
      interpolate(text('edu_material_added', '{name} added to your cart.'), { name: name }),
      'success',
      'studentStatus'
    );
    return material;
  }

  function addFacultyListToCart(list) {
    var target = list || currentList;
    if (!target) {
      setStatus(text('edu_faculty_none_selected', 'Build a course list before adding it to the cart.'), 'warn', 'facultyListStatus');
      return null;
    }

    var name = interpolate(text('edu_faculty_cart_line_name', 'ElectroMart Course List · {code} · {copies} copies'), {
      code: target.courseCode,
      copies: formatNumber(target.totalCopies)
    });

    if (!addCartLine({
      id: target.id,
      name: name,
      price: target.totalPrice,
      mrp: target.mrpTotal,
      category: 'campus-course-list'
    }, target.totalCopies, MAX_FACULTY_QUANTITY)) {
      setStatus(text('edu_storage_error', 'We could not save your course list to the cart. Please try again.'), 'error', 'facultyListStatus');
      return null;
    }

    setStatus(
      interpolate(text('edu_faculty_added', '{code} course list added to your cart.'), { code: target.courseCode }),
      'success',
      'facultyListStatus'
    );
    return target;
  }

  /* ---------------------------------------------------------------------
   * DOM reads
   * ------------------------------------------------------------------- */
  function readSelectValue(id) {
    var select = byId(id);
    if (!select) return '';
    return cleanText(select.value, 60);
  }

  function readRangeValue(id, fallback) {
    var input = byId(id);
    if (!input || input.value === undefined) return fallback;
    return clamp(Math.round(numberOr(input.value, fallback)), 0, MAX_CGPA);
  }

  function readProfileForm() {
    return {
      studentId: byId('studentIdInput') ? byId('studentIdInput').value : '',
      collegeEmail: byId('collegeEmailInput') ? byId('collegeEmailInput').value : ''
    };
  }

  /* Control name -> element id map. FormData is the primary read path, but a
     missing or restricted FormData must never turn a faculty course list into
     a silent no-op, so every named control also has a stable id to fall back on. */
  var NAMED_CONTROL_IDS = {
    courseCode: 'courseCodeInput',
    courseName: 'courseNameInput',
    studentCount: 'studentCountInput',
    perStudentCopyPrice: 'copyPriceSelect'
  };

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
    if ((!field || field.value === undefined) && form && typeof form.querySelector === 'function') {
      try {
        field = form.querySelector('[name="' + name + '"]');
      } catch (error) {
        field = null;
      }
    }
    if ((!field || field.value === undefined) && NAMED_CONTROL_IDS[name]) {
      field = byId(NAMED_CONTROL_IDS[name]);
    }
    return field && field.value !== undefined ? field.value : '';
  }

  function getEstimatorInput() {
    var profile = currentProfile || {};
    return {
      verified: profile.verified === true,
      cgpa: readRangeValue('cgpaRange', profile.cgpa || DEFAULT_CGPA),
      category: normalizeCategory(readSelectValue('categorySelect') || profile.category || DEFAULT_CATEGORY)
    };
  }

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */
  function populateSemesterSelect() {
    var select = byId('semesterSelect');
    if (!select || select.getAttribute('data-edu-populated') === 'true') return;
    var markup = '<option value="">' + escapeHtml(text('edu_semester_select', 'Select a semester')) + '</option>' +
      getSemesterOptions().map(function (option) {
        return '<option value="' + option.value + '">' + escapeHtml(getSemesterLabel(option.value)) + '</option>';
      }).join('');
    if (typeof select.insertAdjacentHTML === 'function') {
      try {
        select.insertAdjacentHTML('beforeend', markup);
        select.setAttribute('data-edu-populated', 'true');
      } catch (error) {
        select.innerHTML = markup;
      }
    } else {
      select.innerHTML = markup;
    }
  }

  function populateCategorySelect() {
    var select = byId('categorySelect');
    if (!select || select.getAttribute('data-edu-populated') === 'true') return;
    var markup = STUDENT_DISCOUNT_CATEGORIES.map(function (category) {
      return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(text(category.key, category.key)) + '</option>';
    }).join('');
    if (typeof select.insertAdjacentHTML === 'function') {
      try {
        select.insertAdjacentHTML('beforeend', markup);
        select.setAttribute('data-edu-populated', 'true');
      } catch (error) {
        select.innerHTML = markup;
      }
    } else {
      select.innerHTML = markup;
    }
  }

  function populateCopyPriceSelect() {
    var select = byId('copyPriceSelect');
    if (!select || select.getAttribute('data-edu-populated') === 'true') return;
    var markup = FACULTY_COPY_OPTIONS.map(function (option) {
      return '<option value="' + escapeHtml(option.id) + '">' +
        escapeHtml(getFacultyCopyPriceLabel(option)) + ' — ' + escapeHtml(money(option.price)) +
      '</option>';
    }).join('');
    if (typeof select.insertAdjacentHTML === 'function') {
      try {
        select.insertAdjacentHTML('beforeend', markup);
        select.setAttribute('data-edu-populated', 'true');
      } catch (error) {
        select.innerHTML = markup;
      }
    } else {
      select.innerHTML = markup;
    }
  }

  function renderFilterRail() {
    var rail = byId('courseMaterialFilter');
    if (!rail) return;
    if (rail.getAttribute('data-edu-rendered') === 'true') {
      syncFilterRail();
      return;
    }
    rail.innerHTML = MATERIAL_FILTERS.map(function (filter) {
      return '<button type="button" class="edu-filter-chip" data-edu-filter="' + escapeHtml(filter.id) + '" aria-pressed="false">' +
        escapeHtml(text(filter.key, filter.key)) +
      '</button>';
    }).join('');
    if (hasMethod(rail, 'setAttribute')) rail.setAttribute('data-edu-rendered', 'true');
    syncFilterRail();
  }

  function syncFilterRail() {
    queryAll('[data-edu-filter]').forEach(function (chip) {
      if (!chip || !hasMethod(chip, 'setAttribute')) return;
      chip.setAttribute('aria-pressed', chip.getAttribute('data-edu-filter') === activeMaterialFilter ? 'true' : 'false');
    });
  }

  function renderLadder(cgpa) {
    var list = byId('eduLadderList');
    if (!list) return;
    var activeBand = getLadderBand(cgpa);

    list.innerHTML = STUDENT_DISCOUNT_LADDER.map(function (band) {
      var isActive = band === activeBand;
      return '<li class="edu-ladder__row' + (isActive ? ' is-active' : ' is-idle') + '"' +
        (isActive ? ' aria-current="true"' : '') + '>' +
        '<span class="edu-ladder__name">' + escapeHtml(text(band.key, band.key)) + '</span>' +
        '<span class="edu-ladder__rate">' + getBandRangeLabel(band) + '</span>' +
      '</li>';
    }).join('');
  }

  function renderHeroStats(materialCount) {
    var materialsEl = byId('eduMaterialCount');
    var discountEl = byId('eduMaxDiscount');
    var facultyEl = byId('eduFacultyCount');
    if (materialsEl) materialsEl.textContent = formatNumber(materialCount);
    if (discountEl) discountEl.textContent = '-' + CAMPUS_STATS.maxDiscountPercent + '%';
    if (facultyEl) facultyEl.textContent = formatNumber(facultyLists.length);
  }

  function renderProfileReadout() {
    var profile = currentProfile || sanitizeProfile({});
    var statusPill = byId('eduStatusPill');
    var semesterPill = byId('eduSemesterPill');
    var discountPill = byId('eduDiscountPill');
    var stamp = byId('eduProfileStamp');

    if (statusPill) {
      statusPill.className = profile.verified ? 'is-verified' : 'is-pending';
      statusPill.textContent = profile.verified
        ? text('edu_verified_status', 'Verified student on this device')
        : text('edu_pending_status', 'Not verified yet');
    }
    if (semesterPill) {
      semesterPill.textContent = getSemesterLabel(profile.semester);
    }
    if (discountPill) {
      discountPill.textContent = profile.verified
        ? '-' + calculateStudentDiscount({ verified: true, cgpa: profile.cgpa, category: DEFAULT_CATEGORY }) + '%'
        : '-0%';
    }
    if (stamp) {
      stamp.innerHTML = profile.verified
        ? escapeHtml(interpolate(text('edu_profile_saved', 'Saved on this device · {domain}'), { domain: profile.collegeDomain }))
        : escapeHtml(text('edu_local_only_note_short', 'Nothing is stored until you run the check on this device.'));
    }
  }

  function applyProfileToControls() {
    var profile = currentProfile || sanitizeProfile({});
    var idInput = byId('studentIdInput');
    var emailInput = byId('collegeEmailInput');
    var semesterSelect = byId('semesterSelect');
    var cgpaRange = byId('cgpaRange');
    var cgpaNumber = byId('cgpaNumber');

    if (idInput && typeof idInput.value === 'string') idInput.value = profile.studentId || '';
    if (emailInput && typeof emailInput.value === 'string') emailInput.value = profile.collegeEmail || '';
    if (semesterSelect && typeof semesterSelect.value === 'string') semesterSelect.value = String(normalizeSemester(profile.semester));
    if (cgpaRange && typeof cgpaRange.value === 'string') cgpaRange.value = String(profile.cgpa);
    if (cgpaNumber && typeof cgpaNumber.value === 'string') cgpaNumber.value = String(profile.cgpa);
    if (cgpaRange && cgpaRange.style && typeof cgpaRange.style.setProperty === 'function') {
      cgpaRange.style.setProperty('--edu-range-fill', getRangeFillPercent(profile.cgpa) + '%');
    }
  }

  function getRangeFillPercent(cgpa) {
    var span = Math.max(1, MAX_CGPA - MIN_CGPA);
    return clamp(((normalizeCgpa(cgpa) - MIN_CGPA) / span) * 100, 0, 100).toFixed(1);
  }

  function renderMaterials() {
    var grid = byId('courseMaterialGrid');
    var skeleton = byId('eduMaterialSkeleton');
    var emptyState = byId('eduMaterialEmpty');
    var countEl = byId('eduMaterialGridCount');
    var semester = normalizeSemester((currentProfile && currentProfile.semester) || DEFAULT_SEMESTER);
    var materials = getMaterialsForSemester(semester, activeMaterialFilter);
    var profile = currentProfile || sanitizeProfile({});

    if (skeleton) skeleton.hidden = true;
    if (countEl) {
      countEl.textContent = interpolate(text('edu_material_count', '{count} titles for {semester}'), {
        count: formatNumber(materials.length),
        semester: getSemesterLabel(semester)
      });
    }

    if (!grid) return;
    if (!materials.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      if (emptyState) {
        emptyState.textContent = text('edu_course_material_empty', 'No course material is listed for this semester. Please check back soon.');
        emptyState.hidden = false;
      }
      return;
    }

    grid.innerHTML = materials.map(function (material, index) {
      var discountPercent = material.mrp > 0 ? Math.round((1 - (material.price / material.mrp)) * 100) : 0;
      var studentPrice = calculateStudentPrice({
        basePrice: material.price,
        verified: profile.verified === true,
        cgpa: profile.cgpa,
        category: material.category
      });
      var studentDiscount = calculateStudentDiscount({
        verified: profile.verified === true,
        cgpa: profile.cgpa,
        category: material.category
      });

      return '<article class="edu-material-card" style="animation-delay:' + Math.min(index * 70, 420) + 'ms">' +
        '<div class="edu-material-card__art">' +
          '<span class="edu-material-card__badge">-' + Math.max(0, discountPercent) + '%</span>' +
          '<span class="edu-material-card__tag">' + escapeHtml(text(material.category === 'lab-kit' ? 'edu_filter_lab' : material.category === 'textbook' ? 'edu_filter_textbook' : material.category === 'notes' ? 'edu_filter_notes' : material.category === 'electronics' ? 'edu_filter_electronics' : 'edu_filter_accessories', material.category)) + '</span>' +
          '<span class="edu-art edu-art--' + escapeHtml(material.art) + '" aria-hidden="true">' +
            '<span class="art-cover"></span><span class="art-spine"></span><span class="art-page"></span>' +
            '<span class="art-band"></span><span class="art-notebook"></span><span class="art-line art-line--one"></span>' +
            '<span class="art-line art-line--two"></span><span class="art-line art-line--three"></span><span class="art-ring"></span>' +
            '<span class="art-screen"></span><span class="art-code"></span><span class="art-deck"></span><span class="art-sticker"></span>' +
            '<span class="art-tray"></span><span class="art-handle"></span>' +
            '<span class="art-vial art-vial--one"></span><span class="art-vial art-vial--two"></span><span class="art-vial art-vial--three"></span>' +
            '<span class="art-shell"></span><span class="art-pocket"></span><span class="art-strap"></span>' +
            '<span class="art-body"></span><span class="art-nib"></span><span class="art-cap"></span>' +
          '</span>' +
        '</div>' +
        '<div class="edu-material-card__body">' +
          '<h3>' + escapeHtml(getMaterialName(material)) + '</h3>' +
          '<p class="edu-material-card__code">' + escapeHtml(material.code) + '</p>' +
          '<p class="edu-material-card__desc">' + escapeHtml(getMaterialDescription(material)) + '</p>' +
          (profile.verified && studentDiscount > 0
            ? '<p class="edu-material-card__meta"><span>' + escapeHtml(text('edu_student_price_line', 'Student price')) + '</span>' +
              '<strong>' + escapeHtml(money(studentPrice)) + ' &minus;' + studentDiscount + '%</strong></p>'
            : '<p class="edu-material-card__meta">' + escapeHtml(text('edu_material_publisher', 'ElectroMart Academic Press')) + '</p>') +
          '<div class="edu-material-card__price">' +
            '<strong>' + escapeHtml(money(material.price)) + '</strong>' +
            '<s>M.R.P.: ' + escapeHtml(money(material.mrp)) + '</s>' +
          '</div>' +
          '<p class="edu-material-card__tax">' + escapeHtml(text('edu_taxes_included', 'Inclusive of all taxes')) + '</p>' +
        '</div>' +
        '<div class="edu-material-card__action">' +
          '<button type="button" class="btn-edu" data-edu-add-material="' + escapeHtml(material.id) + '">' +
            escapeHtml(text('edu_material_add_to_cart', 'Add to cart')) +
          '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    if (emptyState) emptyState.hidden = true;
  }

  function renderEstimator() {
    var input = getEstimatorInput();
    var basePrice = normalizeBasePrice(byId('basePriceInput') ? byId('basePriceInput').value : 1200);
    var discount = calculateStudentDiscount(input);
    var studentPrice = calculateStudentPrice({
      basePrice: basePrice,
      verified: input.verified,
      cgpa: input.cgpa,
      category: input.category
    });

    var dial = byId('eduDiscountDial');
    if (dial && dial.style && typeof dial.style.setProperty === 'function') {
      dial.style.setProperty('--edu-arc-angle', getDialArc(discount));
    }
    if (dial && hasMethod(dial, 'setAttribute')) {
      dial.setAttribute('aria-label', interpolate(text('edu_dial_aria', 'Student discount {percent} percent'), { percent: discount }));
    }

    var valueEl = byId('eduDiscountValue');
    var priceEl = byId('eduStudentPrice');
    var baseEl = byId('eduBasePrice');
    var scaleEl = byId('eduDialScale');
    var hintEl = byId('eduEstimateHint');
    var cgpaReadout = byId('cgpaReadout');
    var cgpaNumber = byId('cgpaNumber');
    var cgpaRange = byId('cgpaRange');

    if (valueEl) valueEl.textContent = '-' + discount + '%';
    if (priceEl) priceEl.textContent = money(studentPrice);
    if (baseEl) baseEl.textContent = money(basePrice);
    if (scaleEl) scaleEl.textContent = '0 &ndash; ' + DIAL_REFERENCE_PERCENT + '%';
    if (cgpaReadout) cgpaReadout.textContent = input.cgpa + '%';
    if (cgpaNumber && typeof cgpaNumber.value === 'string' && Number(cgpaNumber.value) !== input.cgpa) {
      cgpaNumber.value = String(input.cgpa);
    }
    if (cgpaRange && cgpaRange.style && typeof cgpaRange.style.setProperty === 'function') {
      cgpaRange.style.setProperty('--edu-range-fill', getRangeFillPercent(input.cgpa) + '%');
    }

    if (hintEl) {
      hintEl.textContent = input.verified
        ? text('edu_estimate_verified', 'Verified pricing — the same score and category always return the same price.')
        : text('edu_estimate_unverified', 'Not verified — the estimator is showing the full store price.');
      if (hasMethod(hintEl, 'classList')) hintEl.classList.toggle('is-verified', input.verified);
    }

    renderLadder(input.cgpa);
    return { discount: discount, basePrice: basePrice, studentPrice: studentPrice, cgpa: input.cgpa, category: input.category };
  }

  function renderOffers() {
    var grid = byId('backToCollegeGrid');
    var emptyState = byId('eduOffersEmpty');
    if (!grid) return;

    if (!BACK_TO_COLLEGE_OFFERS.length) {
      grid.innerHTML = '';
      if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
      if (emptyState) {
        emptyState.textContent = text('edu_offers_empty', 'No campus offer is running right now. Please check back soon.');
        emptyState.hidden = false;
      }
      return;
    }

    grid.innerHTML = BACK_TO_COLLEGE_OFFERS.map(function (offer, index) {
      var saving = Math.max(0, offer.mrp - offer.price);
      var percent = offer.mrp > 0 ? Math.round((saving / offer.mrp) * 100) : 0;
      return '<article class="edu-offer-card" style="animation-delay:' + Math.min(index * 60, 360) + 'ms">' +
        '<span class="edu-offer-card__season">' + escapeHtml(text(offer.seasonKey, offer.seasonKey)) + '</span>' +
        '<h3>' + escapeHtml(text(offer.nameKey, offer.name)) + '</h3>' +
        '<p>' + escapeHtml(text(offer.descriptionKey, offer.description)) + '</p>' +
        '<div class="edu-offer-card__foot">' +
          '<span class="edu-offer-card__price">' + escapeHtml(money(offer.price)) +
            ' <s style="font-weight:400;opacity:.7">M.R.P.: ' + escapeHtml(money(offer.mrp)) + '</s></span>' +
          '<span class="edu-offer-card__save">' + escapeHtml(interpolate(text('edu_offer_save', 'Save {amount} ({percent}%)'), { amount: money(saving), percent: percent })) + '</span>' +
        '</div>' +
      '</article>';
    }).join('');

    if (hasMethod(grid, 'setAttribute')) grid.setAttribute('aria-busy', 'false');
    if (emptyState) emptyState.hidden = true;
  }

  function renderFacultyPreview() {
    var rows = byId('facultyListRows');
    var totalEl = byId('facultyTotalPrice');
    var addButton = byId('addFacultyListToCartBtn');
    var list = currentList;

    if (rows) {
      if (!list) {
        rows.innerHTML = '<li><span class="edu-preview__empty">' +
          escapeHtml(text('edu_faculty_preview_empty', 'Build a course list to see copies and the rupee total.')) +
        '</span><span>—</span></li>';
      } else {
        rows.innerHTML = [
          { label: text('edu_faculty_row_code', 'Course code'), value: list.courseCode },
          { label: text('edu_faculty_row_name', 'Course name'), value: list.courseName },
          { label: text('edu_faculty_row_copies', 'Copies'), value: formatNumber(list.totalCopies) + ' ' + text('edu_faculty_copies_suffix', 'copies') },
          { label: text('edu_faculty_row_price', 'Per-student copy'), value: money(list.perStudentCopyPrice) },
          { label: text('edu_faculty_row_savings', 'Department savings'), value: money(list.totalSavings) + ' (-' + list.discountPercent + '%)' }
        ].map(function (row) {
          return '<li><span>' + escapeHtml(row.label) + '</span><span class="edu-row-price">' + escapeHtml(row.value) + '</span></li>';
        }).join('');
      }
    }

    if (totalEl) totalEl.textContent = list ? money(list.totalPrice) : money(0);

    if (addButton) {
      if (list) {
        if (hasMethod(addButton, 'removeAttribute')) addButton.removeAttribute('disabled');
        addButton.setAttribute('aria-disabled', 'false');
      } else {
        addButton.setAttribute('disabled', 'disabled');
        addButton.setAttribute('aria-disabled', 'true');
      }
    }
  }

  function renderFacultySaved() {
    var list = byId('facultySavedList');
    var emptyState = byId('eduFacultyEmpty');
    if (!list) return;

    if (!facultyLists.length) {
      list.innerHTML = '';
      if (emptyState) {
        emptyState.textContent = text('edu_faculty_empty', 'No course list has been saved on this device yet.');
        emptyState.hidden = false;
      }
      return;
    }

    list.innerHTML = facultyLists.map(function (entry, index) {
      return '<li class="edu-saved-course">' +
        '<span class="edu-saved-course__index">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<div class="edu-saved-course__body">' +
          '<h4>' + escapeHtml(entry.courseCode + ' · ' + entry.courseName) + '</h4>' +
          '<p>' + escapeHtml(formatNumber(entry.totalCopies) + ' ' + text('edu_faculty_copies_suffix', 'copies') + ' · ' + money(entry.perStudentCopyPrice) + ' ' + text('edu_faculty_row_each', 'per student')) + '</p>' +
        '</div>' +
        '<div class="edu-saved-course__side">' +
          '<span class="edu-saved-course__total">' + escapeHtml(money(entry.totalPrice)) + '</span>' +
          '<span class="edu-saved-course__copies">M.R.P.: ' + escapeHtml(money(entry.mrpTotal)) + '</span>' +
          '<button type="button" class="edu-saved-course__remove" data-edu-remove-list="' + escapeHtml(entry.id) + '">' +
            escapeHtml(text('edu_faculty_remove', 'Remove')) +
          '</button>' +
        '</div>' +
      '</li>';
    }).join('');

    if (emptyState) emptyState.hidden = true;
  }

  function render() {
    var semester = normalizeSemester((currentProfile && currentProfile.semester) || DEFAULT_SEMESTER);
    renderProfileReadout();
    renderFilterRail();
    renderMaterials();
    renderEstimator();
    renderOffers();
    renderFacultyPreview();
    renderFacultySaved();
    renderHeroStats(getAllMaterials().length);
    refreshStaticTranslations();
    return { semester: semester, facultyLists: facultyLists.slice() };
  }

  /* ---------------------------------------------------------------------
   * Student verification flow
   * ------------------------------------------------------------------- */
  function handleVerifySubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (!form) form = byId('studentVerifyForm');
    if (form && hasMethod(form, 'checkValidity') && !form.checkValidity()) {
      setStatus(text('edu_verify_invalid_both', 'Enter a valid student ID and your college email address.'), 'error', 'studentStatus');
      return null;
    }

    var values = readProfileForm();
    var checked = verifyStudentProfile({
      studentId: values.studentId,
      collegeEmail: values.collegeEmail,
      semester: (currentProfile && currentProfile.semester) || DEFAULT_SEMESTER,
      cgpa: readRangeValue('cgpaRange', (currentProfile && currentProfile.cgpa) || DEFAULT_CGPA)
    });

    if (!saveProfile(checked)) {
      setStatus(text('edu_storage_error', 'We could not save your details on this device. Please try again.'), 'error', 'studentStatus');
      return null;
    }

    setStatus(checked.reason, checked.verified ? 'success' : 'warn', 'studentStatus');
    applyProfileToControls();
    render();
    focusStatus('studentStatus');
    return checked;
  }

  function handleClearProfile() {
    if (!clearProfile()) {
      setStatus(text('edu_storage_error', 'We could not update your details on this device. Please try again.'), 'error', 'studentStatus');
      return false;
    }
    var idInput = byId('studentIdInput');
    var emailInput = byId('collegeEmailInput');
    if (idInput && typeof idInput.value === 'string') idInput.value = '';
    if (emailInput && typeof emailInput.value === 'string') emailInput.value = '';
    setStatus(text('edu_profile_cleared', 'Student details cleared from this device.'), 'success', 'studentStatus');
    render();
    return true;
  }

  function handleSemesterChange() {
    var value = readSelectValue('semesterSelect');
    var semester = normalizeSemester(value);
    currentProfile = sanitizeProfile({
      studentId: currentProfile ? currentProfile.studentId : '',
      collegeEmail: currentProfile ? currentProfile.collegeEmail : '',
      semester: semester,
      cgpa: currentProfile ? currentProfile.cgpa : DEFAULT_CGPA
    });
    saveProfile(currentProfile);
    renderMaterials();
    renderProfileReadout();
    return semester;
  }

  function handleEstimatorInput() {
    var profile = currentProfile || sanitizeProfile({});
    profile.cgpa = readRangeValue('cgpaRange', profile.cgpa);
    saveProfile(profile);
    return renderEstimator();
  }

  function handleCgpaNumberInput() {
    var numberInput = byId('cgpaNumber');
    var rangeInput = byId('cgpaRange');
    if (!numberInput) return renderEstimator();
    var cgpa = clamp(Math.round(numberOr(numberInput.value, DEFAULT_CGPA)), 0, MAX_CGPA);
    if (rangeInput && typeof rangeInput.value === 'string') rangeInput.value = String(cgpa);
    var profile = currentProfile || sanitizeProfile({});
    profile.cgpa = cgpa;
    saveProfile(profile);
    return renderEstimator();
  }

  /* ---------------------------------------------------------------------
   * Faculty flow
   * ------------------------------------------------------------------- */
  function handleFacultySubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var form = event && (event.currentTarget || event.target);
    if (!form) form = byId('facultyCourseListForm');
    if (!form) return null;

    var validation = validateFacultyList({
      courseCode: getFormValue(form, 'courseCode'),
      courseName: getFormValue(form, 'courseName'),
      studentCount: getFormValue(form, 'studentCount'),
      perStudentCopyId: getFormValue(form, 'perStudentCopyPrice')
    });

    if (!validation.valid) {
      setStatus(validation.message, 'error', 'facultyListStatus');
      return null;
    }

    if (!upsertFacultyList(validation.list)) {
      setStatus(text('edu_storage_error', 'We could not save your course list on this device. Please try again.'), 'error', 'facultyListStatus');
      return null;
    }

    currentList = validation.list;
    setStatus(
      interpolate(text('edu_faculty_built', '{code} · {copies} copies added to the list.'), {
        code: currentList.courseCode,
        copies: formatNumber(currentList.totalCopies)
      }),
      'success',
      'facultyListStatus'
    );
    renderFacultyPreview();
    renderFacultySaved();
    renderHeroStats(getAllMaterials().length);
    focusStatus('facultyListStatus');
    return currentList;
  }

  function removeFacultyListById(listId) {
    var removed = removeFacultyList(listId);
    if (!removed) {
      setStatus(text('edu_storage_error', 'We could not update your course lists on this device. Please try again.'), 'error', 'facultyListStatus');
      return false;
    }
    if (currentList && currentList.id === cleanText(listId, 120)) currentList = null;
    setStatus(text('edu_faculty_removed', 'The course list was removed from this device.'), 'success', 'facultyListStatus');
    renderFacultyPreview();
    renderFacultySaved();
    renderHeroStats(getAllMaterials().length);
    return true;
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

    var materialTrigger = findAttribute(event.target, 'data-edu-add-material');
    if (materialTrigger) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      addMaterialToCart(materialTrigger.getAttribute('data-edu-add-material'));
      return;
    }

    var filterTrigger = findAttribute(event.target, 'data-edu-filter');
    if (filterTrigger) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      var filterId = filterTrigger.getAttribute('data-edu-filter');
      var known = MATERIAL_FILTERS.some(function (filter) { return filter.id === filterId; });
      if (known) {
        activeMaterialFilter = filterId;
        syncFilterRail();
        renderMaterials();
      }
      return;
    }

    var removeTrigger = findAttribute(event.target, 'data-edu-remove-list');
    if (removeTrigger) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      removeFacultyListById(removeTrigger.getAttribute('data-edu-remove-list'));
    }
  }

  function bindControl(id, eventName, handler) {
    var element = byId(id);
    if (!element || typeof element.addEventListener !== 'function' || element._eduBound) return;
    element._eduBound = true;
    element.addEventListener(eventName, handler);
  }

  function setupEventListeners() {
    if (namespace._listenersBound) return;
    namespace._listenersBound = true;

    var verifyForm = byId('studentVerifyForm');
    if (verifyForm && !verifyForm._eduBound && typeof verifyForm.addEventListener === 'function') {
      verifyForm._eduBound = true;
      verifyForm.addEventListener('submit', handleVerifySubmit);
    }

    var facultyForm = byId('facultyCourseListForm');
    if (facultyForm && !facultyForm._eduBound && typeof facultyForm.addEventListener === 'function') {
      facultyForm._eduBound = true;
      facultyForm.addEventListener('submit', handleFacultySubmit);
    }

    bindControl('clearStudentBtn', 'click', handleClearProfile);
    bindControl('addFacultyListToCartBtn', 'click', function () {
      addFacultyListToCart(currentList);
    });
    bindControl('semesterSelect', 'change', handleSemesterChange);
    bindControl('cgpaRange', 'input', handleEstimatorInput);
    bindControl('cgpaNumber', 'input', handleCgpaNumberInput);
    bindControl('categorySelect', 'change', function () {
      renderEstimator();
    });
    bindControl('basePriceInput', 'input', function () {
      renderEstimator();
    });

    if (doc && typeof doc.addEventListener === 'function') {
      doc.addEventListener('click', handleDocumentClick);
    }

    if (root && typeof root.addEventListener === 'function') {
      root.addEventListener('storage', function (event) {
        if (!event) return;
        if (event.key === FACULTY_STORAGE_KEY) loadFacultyLists();
        if (event.key === PROFILE_STORAGE_KEY) loadProfile();
        if (event.key === 'electromart_lang_v1' || event.key === 'electromart_lang') {
          applyProfileToControls();
          render();
        }
      });
      root.addEventListener('languageChanged', function () {
        applyProfileToControls();
        render();
      });
    }
  }

  function init() {
    // Make the campus store language explicit before the first paint so the
    // static data-i18n chrome and every dynamic string agree.
    syncLanguageStorage();
    populateSemesterSelect();
    populateCategorySelect();
    populateCopyPriceSelect();
    loadFacultyLists();
    loadProfile();
    applyProfileToControls();
    setupEventListeners();
    render();
    return namespace;
  }

  /* ---------------------------------------------------------------------
   * Public surface
   * ------------------------------------------------------------------- */
  namespace.init = init;
  namespace.calculateStudentDiscount = calculateStudentDiscount;
  namespace.calculateStudentPrice = calculateStudentPrice;
  namespace.verifyStudentProfile = verifyStudentProfile;
  namespace.buildFacultyList = buildFacultyList;
  namespace.validateFacultyList = validateFacultyList;
  namespace.getDialArc = getDialArc;
  namespace.getLadderBand = getLadderBand;
  namespace.getBandRangeLabel = getBandRangeLabel;
  namespace.getCategory = getCategory;
  namespace.getDiscountLadder = function () { return STUDENT_DISCOUNT_LADDER.slice(); };
  namespace.getDiscountCategories = function () { return STUDENT_DISCOUNT_CATEGORIES.slice(); };
  namespace.getSemesterOptions = getSemesterOptions;
  namespace.getSemesterLabel = getSemesterLabel;
  namespace.getMaterialsForSemester = getMaterialsForSemester;
  namespace.getMaterialById = getMaterialById;
  namespace.getAllMaterials = getAllMaterials;
  namespace.getMaterialName = getMaterialName;
  namespace.getMaterialDescription = getMaterialDescription;
  namespace.getOffers = function () { return BACK_TO_COLLEGE_OFFERS.slice(); };
  namespace.getCopyOptions = function () { return FACULTY_COPY_OPTIONS.slice(); };
  namespace.getFacultyLists = function () { return facultyLists.slice(); };
  namespace.getProfile = function () {
    var profile = currentProfile || sanitizeProfile({});
    return {
      verified: profile.verified,
      studentId: profile.studentId,
      collegeEmail: profile.collegeEmail,
      collegeDomain: profile.collegeDomain,
      semester: profile.semester,
      cgpa: profile.cgpa,
      checkedLocally: true
    };
  };
  namespace.getCurrentList = function () { return currentList; };
  namespace.addMaterialToCart = addMaterialToCart;
  namespace.addFacultyListToCart = addFacultyListToCart;
  namespace.handleVerifySubmit = handleVerifySubmit;
  namespace.handleFacultySubmit = handleFacultySubmit;
  namespace.removeFacultyList = removeFacultyList;
  namespace.setActiveMaterialFilter = function (filterId) {
    activeMaterialFilter = MATERIAL_FILTERS.some(function (filter) { return filter.id === filterId; })
      ? filterId
      : 'all';
    renderMaterials();
    syncFilterRail();
    return activeMaterialFilter;
  };
  namespace.render = render;
  namespace.PROFILE_STORAGE_KEY = PROFILE_STORAGE_KEY;
  namespace.FACULTY_STORAGE_KEY = FACULTY_STORAGE_KEY;
  namespace.CART_STORAGE_KEY = CART_STORAGE_KEY;
  namespace.CATALOG_STORAGE_KEY = CATALOG_STORAGE_KEY;
  namespace.MAX_FACULTY_LISTS = MAX_FACULTY_LISTS;
  namespace.MAX_FACULTY_STUDENTS = MAX_FACULTY_STUDENTS;
  namespace.DIAL_REFERENCE_PERCENT = DIAL_REFERENCE_PERCENT;
  namespace.DIAL_ARC_SWEEP_DEG = DIAL_ARC_SWEEP_DEG;
  namespace.ACADEMIC_DOMAIN_SUFFIXES = ACADEMIC_DOMAIN_SUFFIXES.slice();
  namespace.readStoredLanguage = readStoredLanguage;
  namespace.syncLanguageStorage = syncLanguageStorage;

  if (doc && doc.readyState === 'loading' && typeof doc.addEventListener === 'function') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {}), typeof document !== 'undefined' ? document : null);
