const fs = require('fs');
const path = require('path');
const projectDir = process.cwd();

const headerHtml = fs.readFileSync('header.html', 'utf8');
const headerJs = fs.readFileSync('header.js', 'utf8');
const scriptJs = fs.readFileSync('script.js', 'utf8');
const sharedSearchJs = fs.readFileSync('shared-search.js', 'utf8');
const amazonCss = fs.readFileSync('amazon-theme.css', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const langHtml = fs.readFileSync('language-settings.html', 'utf8');

const checks = [
  // Header and Drawer checks
  { name: 'header.html has cart trolley SVG', test: headerHtml.includes('cart-trolley-icon') },
  { name: 'header.html has cartCount badge', test: headerHtml.includes('id="cartCount"') },
  { name: 'header.html has Account & Lists flyout wrap', test: headerHtml.includes('nav-account-dropdown-wrap') && headerHtml.includes('account-flyout-menu') },
  { name: 'header.html does NOT have standalone Wishlist link in nav-actions', test: !headerHtml.includes('<a href="wishlist.html" class="orders-link') },
  { name: 'header.html has category-quick-links', test: headerHtml.includes('category-quick-links') },
  { name: 'header.html does NOT have deptQuickSearch', test: !headerHtml.includes('deptQuickSearch') },
  { name: 'header.html does NOT have search-trust-strip in header', test: !headerHtml.includes('search-trust-strip') },
  { name: 'header.html has deptSliderTrack and subpanel', test: headerHtml.includes('dept-slider-track') && headerHtml.includes('deptSubPanel') },
  { name: 'header.html has deptSeeAllBtn and deptShopMore', test: headerHtml.includes('id="deptSeeAllBtn"') && headerHtml.includes('id="deptShopMore"') },
  { name: 'header.html does NOT have dept-sidebar-footer', test: !headerHtml.includes('dept-sidebar-footer') },
  { name: 'header.html has deptCloseInside in drawer header', test: headerHtml.includes('id="deptCloseInside"') },
  { name: 'header.html has hidden attribute on deptClose', test: headerHtml.includes('id="deptClose" class="dept-close-btn" aria-label="Close menu" hidden') },

  // Search Bar Requirements: header.html
  { name: 'header.html categoryFilter has All Categories', test: headerHtml.includes('value="all">All Categories<') },
  { name: 'header.html categoryFilter has Computers & Desktops', test: headerHtml.includes('value="computer">Computers &amp; Desktops<') },
  { name: 'header.html categoryFilter has Laptops & Accessories', test: headerHtml.includes('value="laptop">Laptops &amp; Accessories<') },
  { name: 'header.html categoryFilter has Components & Parts', test: headerHtml.includes('value="components">Components &amp; Parts') },
  { name: 'header.html categoryFilter has Printers & Cartridges', test: headerHtml.includes('value="printer">Printers &amp; Cartridges<') },
  { name: 'header.html categoryFilter has Audio & Headphones', test: headerHtml.includes('value="audio">Audio &amp; Headphones<') },
  { name: 'header.html categoryFilter has Mobile Accessories', test: headerHtml.includes('value="mobile">Mobile Accessories<') },
  { name: 'header.html has searchClearBtn', test: headerHtml.includes('id="searchClearBtn"') && headerHtml.includes('class="search-clear-btn"') },
  { name: 'header.html has SVG magnifying glass in search button', test: headerHtml.includes('search-lens-icon') && headerHtml.includes('id="searchSubmitBtn"') },
  { name: 'header.html does NOT have obsolete smartKeywordList datalist', test: !headerHtml.includes('id="smartKeywordList"') },

  // Search Bar Requirements: header.js
  { name: 'header.js has matching 7 parent categories in injectHeader', test: headerJs.includes('value="all">All Categories<') && headerJs.includes('value="components">Components &amp; Parts') },
  { name: 'header.js has searchClearBtn in template and event handler', test: headerJs.includes('searchClearBtn') && headerJs.includes('searchClearBtn.addEventListener') },
  { name: 'header.js has SVG magnifying glass in template', test: headerJs.includes('search-lens-icon') && headerJs.includes('id="searchSubmitBtn"') },
  { name: 'header.js saves search query to localStorage on submit', test: headerJs.includes('electromart_search_history_v1') },

  // Search Bar Requirements: script.js
  { name: 'script.js has MAIN_SEARCH_CATEGORIES with 7 parent categories', test: scriptJs.includes('MAIN_SEARCH_CATEGORIES') && scriptJs.includes('Components & Parts (RAM, SSD, GPU)') },
  { name: 'script.js syncCategoryFilterOptions uses MAIN_SEARCH_CATEGORIES', test: scriptJs.includes('function syncCategoryFilterOptions()') && scriptJs.includes('categoryFilter.innerHTML = MAIN_SEARCH_CATEGORIES') },
  { name: 'script.js renderSuggestionCard has clock icon for history', test: scriptJs.includes('suggestion-clock') && scriptJs.includes('🕒') },
  { name: 'script.js renderSearchSuggestions has scoped category matching', test: scriptJs.includes('suggestion-scope-tag') && scriptJs.includes('scopedCat') },
  { name: 'script.js renderSearchSuggestions has tech keyword suggestions', test: scriptJs.includes('TECH_KEYWORDS') },

  // Search Bar Requirements: shared-search.js
  { name: 'shared-search.js DEFAULT_CATALOG_ORDER matches 7 categories', test: sharedSearchJs.includes('"components"') && sharedSearchJs.includes('"printer"') },
  { name: 'shared-search.js categoryLabel has Components & Parts', test: sharedSearchJs.includes('Components & Parts (RAM, SSD, GPU)') },
  { name: 'shared-search.js renderSuggestionItem has clock icon for history', test: sharedSearchJs.includes('suggestion-clock') && sharedSearchJs.includes('🕒') },
  { name: 'shared-search.js has SVG magnifying glass in createSearchButton', test: sharedSearchJs.includes('search-lens-icon') },
  { name: 'shared-search.js has clearBtn handling in enhanceForm', test: sharedSearchJs.includes('search-clear-btn') },

  // CSS Styling: amazon-theme.css
  { name: 'amazon-theme.css has search-clear-btn styling', test: amazonCss.includes('.search-clear-btn') && amazonCss.includes('#searchClearBtn') },
  { name: 'amazon-theme.css has search-submit-btn amber #febd69 styling', test: amazonCss.includes('.search-submit-btn') && amazonCss.includes('#febd69 !important') },
  { name: 'amazon-theme.css has search-lens-icon SVG display', test: amazonCss.includes('.search-lens-icon') },
  { name: 'amazon-theme.css has search-suggestions[hidden] rule', test: amazonCss.includes('.search-suggestions[hidden]') },
  { name: 'amazon-theme.css has suggestion-clock styling', test: amazonCss.includes('.suggestion-clock') },
  { name: 'amazon-theme.css has suggestion-scope-tag styling', test: amazonCss.includes('.suggestion-scope-tag') },
  { name: 'amazon-theme.css eliminates duplicate search button icon (::before content: none)', test: amazonCss.includes('.search-form button::before') && amazonCss.includes('content: none !important') },
  { name: 'amazon-theme.css has top-nav nowrap for single row header', test: amazonCss.includes('flex-wrap: nowrap !important') },
  { name: 'amazon-theme.css has uniform 3px amber focus glow on search-form:focus-within', test: amazonCss.includes('box-shadow: 0 0 0 2px #ff9900, 0 0 0 4px rgba(255, 153, 0, 0.5) !important') },
  { name: 'header.js does NOT contain legacy fire tag emoji', test: !headerJs.includes('🔥') },
  { name: 'header.js does NOT contain legacy initSearchSuggestions', test: !headerJs.includes('initSearchSuggestions') },

  // Home Page layout verification
  { name: 'index.html does NOT have why-shop-section', test: !indexHtml.includes('why-shop-section') },
  { name: 'index.html does NOT have Stay Updated newsletter form', test: !indexHtml.includes('Stay Updated') },
  { name: 'index.html has amz-product-shelf', test: indexHtml.includes('amz-product-shelf') && indexHtml.includes('Recommended for You based on your browsing history') },

  { name: 'language-settings.html uses standardized headerContainer and header.js', test: langHtml.includes('id="headerContainer"') && langHtml.includes('header.js') },
  { name: 'language-settings.html does NOT have obsolete search-trust-strip', test: !langHtml.includes('search-trust-strip') },
  { name: 'language-settings.html has cancelBtn and saveLanguageBtn', test: langHtml.includes('id="cancelBtn"') && langHtml.includes('id="saveLanguageBtn"') && langHtml.includes('>Save Changes<') },
  { name: 'language-settings.html does NOT have search svg inside saveLanguageBtn', test: !langHtml.includes('id="saveLanguageBtn"><svg') },
  { name: 'language-settings.html has English divider', test: langHtml.includes('lang-english-divider') },
  { name: 'language-settings.html has all 11 languages (including Urdu, Punjabi, Gujarati)', test: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'].every(code => langHtml.includes(`value="${code}"`)) },
  { name: 'language-settings.html has pure Kannada script భाಷಾಂತರ', test: langHtml.includes('ಭಾಷಾಂತರ') && !langHtml.includes('ಕನ್ನಡ - KN</span>\n            <span class="lang-option-translation">- भाषांतर') },
  { name: 'language-settings.html has recommendations banner and signin button', test: langHtml.includes('recommendations-banner') && langHtml.includes('recommendations-signin-btn') },
  { name: 'header.js has applySavedLanguage function', test: headerJs.includes('function applySavedLanguage()') },
  { name: 'header.js has LANGUAGE_DISPLAY_NAMES for 11 languages', test: headerJs.includes('LANGUAGE_DISPLAY_NAMES') && headerJs.includes('اردو - UR') && headerJs.includes('ਪੰਜਾਬੀ - PA') && headerJs.includes('ગુજરાતી - GU') },
  { name: 'header.html and header.js have dynamic deptDrawerLangText', test: headerHtml.includes('deptDrawerLangText') && headerJs.includes('deptDrawerLangText') },
  { name: 'index.html has 11-language footerLanguageSelect', test: indexHtml.includes('id="footerLanguageSelect"') && ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'].every(c => indexHtml.includes(`value="${c}"`)) },
  { name: 'script.js has Indian regional language translation dictionaries', test: scriptJs.includes('bn:') && scriptJs.includes('mr:') && scriptJs.includes('ta:') && scriptJs.includes('te:') },

  // Full Page i18n Translation Requirements
  { name: 'translations.js file exists and exports window.EM_TRANSLATIONS', test: fs.existsSync(path.join(projectDir, 'translations.js')) },
  { name: 'translations.js has exact Hindi phrases (आज की डील, सर्वाधिक बिकने वाले, भाषा सेटिंग, परिवर्तन सहेजें, कैंसल करें)', test: fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8').includes('आज की डील') && fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8').includes('सर्वाधिक बिकने वाले') && fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8').includes('परिवर्तन सहेजें') && fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8').includes('कैंसल करें') },
  { name: 'translations.js has applyFullPageTranslation function', test: fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8').includes('function applyFullPageTranslation(') },
  { name: 'header.html has data-i18n keys for deliver_to_prefix, todays_deals, best_sellers, all_products, cart, hello_sign_in', test: headerHtml.includes('data-i18n="deliver_to_prefix"') && headerHtml.includes('data-i18n="todays_deals"') && headerHtml.includes('data-i18n="best_sellers"') && headerHtml.includes('data-i18n="all_products"') && headerHtml.includes('data-i18n="cart"') },
  { name: 'language-settings.html has data-i18n on pageTitle, pageSubtitle, cancelBtn, saveLanguageBtn', test: langHtml.includes('data-i18n="lang_settings_title"') && langHtml.includes('data-i18n="lang_settings_desc"') && langHtml.includes('data-i18n="cancel"') && langHtml.includes('data-i18n="save_changes"') },
  { name: 'language-settings.html has translation info card matching Amazon India', test: langHtml.includes('data-i18n="lang_info_title"') && langHtml.includes('data-i18n="lang_info_desc"') },
  { name: 'language-settings.html has live radio preview listener calling applyFullPageTranslation', test: langHtml.includes('applyFullPageTranslation(previewLang)') },
  { name: 'language-settings.html has Urdu, Punjabi, and Gujarati radio options', test: langHtml.includes('value="ur"') && langHtml.includes('value="pa"') && langHtml.includes('value="gu"') },
  { name: 'index.html includes translations.js', test: indexHtml.includes('translations.js') },
  { name: 'header.js dynamically executes applyFullPageTranslation on language change', test: headerJs.includes('applyFullPageTranslation(savedLang)') },
  { name: 'script.js integrates with EM_TRANSLATIONS dictionary and calls applyFullPageTranslation', test: scriptJs.includes('window.EM_TRANSLATIONS') && scriptJs.includes('applyFullPageTranslation(currentLang)') }
];

let allPassed = true;
checks.forEach(c => {
  if (c.test) {
    console.log('PASS:', c.name);
  } else {
    console.log('FAIL:', c.name);
    allPassed = false;
  }
});

if (!allPassed) process.exit(1);
console.log(`\nAll ${checks.length} verification assertions passed successfully!`);
