const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

// 1. Add CSS to amazon-theme.css
const cssPath = path.join(projectDir, 'amazon-theme.css');
let css = fs.readFileSync(cssPath, 'utf8');

const flyoutCss = `
/* ===== AMAZON LANGUAGE HOVER FLYOUT ===== */
.nav-lang-dropdown-wrap {
  position: relative !important;
  display: inline-flex !important;
}

.lang-flyout-menu {
  position: absolute !important;
  top: 100% !important;
  left: 50% !important;
  transform: translateX(-50%) translateY(6px) !important;
  width: 250px !important;
  background: #ffffff !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25) !important;
  border: 1px solid #d5d9d9 !important;
  padding: 12px 14px !important;
  z-index: 1250 !important;
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease !important;
  box-sizing: border-box !important;
}

.lang-flyout-menu .flyout-arrow {
  position: absolute !important;
  top: -8px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 0 !important;
  height: 0 !important;
  border-left: 8px solid transparent !important;
  border-right: 8px solid transparent !important;
  border-bottom: 8px solid #ffffff !important;
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.08)) !important;
}

.nav-lang-dropdown-wrap:hover .lang-flyout-menu,
.nav-lang-dropdown-wrap:focus-within .lang-flyout-menu {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  transform: translateX(-50%) translateY(0) !important;
}

.lang-flyout-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  max-height: 270px !important;
  overflow-y: auto !important;
}

.lang-flyout-item {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  font-size: 13px !important;
  color: #0f1111 !important;
  cursor: pointer !important;
  padding: 4px 6px !important;
  border-radius: 4px !important;
}

.lang-flyout-item:hover {
  background: #f0f2f2 !important;
  color: #c45500 !important;
}

.lang-flyout-divider {
  height: 1px !important;
  background: #e7e7e7 !important;
  margin: 4px 0 !important;
}

.lang-flyout-footer {
  margin-top: 8px !important;
  padding-top: 8px !important;
  border-top: 1px solid #e7e7e7 !important;
  text-align: center !important;
}

.lang-flyout-footer a {
  font-size: 12px !important;
  color: #007185 !important;
  text-decoration: none !important;
  font-weight: 600 !important;
}

.lang-flyout-footer a:hover {
  text-decoration: underline !important;
}
`;

if (!css.includes('.lang-flyout-menu')) {
  css += '\n' + flyoutCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log("Added language flyout CSS to amazon-theme.css");
}

// 2. HTML snippet for language flyout
const langPickerSnippet = `<div class="nav-lang-dropdown-wrap">
        <a href="language-settings.html" class="nav-lang-picker nav-action-card" title="Change Language">
          <span class="flag-icon">🇮🇳</span>
          <span class="lang-text">EN</span>
          <span class="nav-arrow">▾</span>
        </a>
        <div class="lang-flyout-menu" id="navLangFlyout" aria-label="Language options">
          <div class="flyout-arrow"></div>
          <div class="lang-flyout-list">
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="en" /> <span>English - EN</span></label>
            <div class="lang-flyout-divider"></div>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="hi" /> <span>हिन्दी - HI</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ta" /> <span>தமிழ் - TA</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="te" /> <span>తెలుగు - TE</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="kn" /> <span>ಕನ್ನಡ - KN</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ml" /> <span>മലയാളം - ML</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="bn" /> <span>বাংলা - BN</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="mr" /> <span>मराठी - MR</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ur" /> <span>اردو - UR</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="pa" /> <span>ਪੰਜਾਬੀ - PA</span></label>
            <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="gu" /> <span>ગુજરાતી - GU</span></label>
          </div>
          <div class="lang-flyout-footer">
            <a href="language-settings.html" data-i18n="lang_info_title">भाषा सेटिंग बदलें ›</a>
          </div>
        </div>
      </div>`;

// Update header.html
const htmlPath = path.join(projectDir, 'header.html');
let headerHtml = fs.readFileSync(htmlPath, 'utf8');
const oldHtmlLink = `<a href="language-settings.html" class="nav-lang-picker nav-action-card" title="Change Language">
        <span class="flag-icon">🇮🇳</span>
        <span class="lang-text">EN</span>
        <span class="nav-arrow">▾</span>
      </a>`;

if (headerHtml.replace(/\r\n/g, '\n').includes(oldHtmlLink.replace(/\r\n/g, '\n'))) {
  headerHtml = headerHtml.replace(/\r\n/g, '\n').replace(oldHtmlLink.replace(/\r\n/g, '\n'), langPickerSnippet);
  fs.writeFileSync(htmlPath, headerHtml, 'utf8');
  console.log("Updated header.html with language flyout");
}

// Update header.js template
const jsPath = path.join(projectDir, 'header.js');
let headerJs = fs.readFileSync(jsPath, 'utf8');
const isJsCRLF = headerJs.includes('\r\n');
let jsNorm = headerJs.replace(/\r\n/g, '\n');

const oldJsLink = `          <a href="language-settings.html" class="nav-lang-picker nav-action-card" title="Change Language">
            <span class="flag-icon">🇮🇳</span>
            <span class="lang-text">EN</span>
            <span class="nav-arrow">▾</span>
          </a>`;

const jsSnippet = `          <div class="nav-lang-dropdown-wrap">
            <a href="language-settings.html" class="nav-lang-picker nav-action-card" title="Change Language">
              <span class="flag-icon">🇮🇳</span>
              <span class="lang-text">EN</span>
              <span class="nav-arrow">▾</span>
            </a>
            <div class="lang-flyout-menu" id="navLangFlyout" aria-label="Language options">
              <div class="flyout-arrow"></div>
              <div class="lang-flyout-list">
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="en" /> <span>English - EN</span></label>
                <div class="lang-flyout-divider"></div>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="hi" /> <span>हिन्दी - HI</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ta" /> <span>தமிழ் - TA</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="te" /> <span>తెలుగు - TE</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="kn" /> <span>ಕನ್ನಡ - KN</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ml" /> <span>മലയാളം - ML</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="bn" /> <span>বাংলা - BN</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="mr" /> <span>मराठी - MR</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="ur" /> <span>اردو - UR</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="pa" /> <span>ਪੰਜਾਬੀ - PA</span></label>
                <label class="lang-flyout-item"><input type="radio" name="headerLangRadio" value="gu" /> <span>ગુજરાતી - GU</span></label>
              </div>
              <div class="lang-flyout-footer">
                <a href="language-settings.html" data-i18n="lang_info_title">भाषा सेटिंग बदलें ›</a>
              </div>
            </div>
          </div>`;

if (jsNorm.includes(oldJsLink)) {
  jsNorm = jsNorm.replace(oldJsLink, jsSnippet);
  console.log("Updated header.js template with language flyout");
}

// 3. Add synchronization in applySavedLanguage in header.js
const oldSyncCode = `      // 1. Sync header language badges
      document.querySelectorAll('.lang-text, #currentLangCode').forEach(el => {
        el.textContent = savedLang.toUpperCase();
      });`;

const newSyncCode = `      // 1. Sync header language badges and radio inputs
      document.querySelectorAll('.lang-text, #currentLangCode').forEach(el => {
        el.textContent = savedLang.toUpperCase();
      });
      document.querySelectorAll('input[name="headerLangRadio"]').forEach(radio => {
        radio.checked = (radio.value === savedLang);
      });`;

if (jsNorm.includes(oldSyncCode)) {
  jsNorm = jsNorm.replace(oldSyncCode, newSyncCode);
  console.log("Added radio sync in applySavedLanguage");
}

// 4. Add change listener for headerLangRadio
const oldChangeListener = `  // Listen for changes from footer language selectors
  document.addEventListener('change', (e) => {`;

const newChangeListener = `  // Listen for changes from header and footer language selectors
  document.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'headerLangRadio') {
      const nextLang = String(e.target.value || 'en').toLowerCase();
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
      localStorage.setItem('electromart_lang', nextLang);
      applySavedLanguage();
      if (typeof window.applyTranslations === 'function') {
        window.applyTranslations();
      }
      return;
    }`;

if (jsNorm.includes(oldChangeListener)) {
  jsNorm = jsNorm.replace(oldChangeListener, newChangeListener);
  console.log("Added headerLangRadio change listener in header.js");
}

const finalJs = isJsCRLF ? jsNorm.replace(/\n/g, '\r\n') : jsNorm;
fs.writeFileSync(jsPath, finalJs, 'utf8');
console.log("Successfully updated header.js!");
