const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'language-settings.html');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="product-placeholder.svg" type="image/svg+xml" />
  <title>Change Language Settings | ElectroMart.in</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css?v=20260315d" />
  <link rel="stylesheet" href="amazon-theme.css?v=20260411a" />
  <link rel="stylesheet" href="shared-search.css?v=20260314g" />
  <style>
    body {
      background-color: #ffffff;
      color: #0f1111;
      font-family: "Amazon Ember", Arial, sans-serif;
      margin: 0;
      padding: 0;
    }

    .lang-settings-page {
      max-width: 980px;
      margin: 24px auto 50px auto;
      padding: 0 18px;
      box-sizing: border-box;
    }

    .lang-settings-card {
      background: #ffffff;
      padding: 4px 0 16px 0;
    }

    .lang-settings-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 50px;
    }

    .lang-settings-left {
      flex: 1 1 560px;
      max-width: 580px;
    }

    .lang-settings-info-card {
      flex: 1 1 320px;
      max-width: 360px;
      font-size: 13px;
      line-height: 19px;
      color: #333333;
      padding-top: 6px;
    }

    .lang-settings-info-card h4 {
      font-size: 14px;
      font-weight: 700;
      color: #0f1111;
      margin: 0 0 8px 0;
    }

    .lang-settings-info-card p {
      margin: 0 0 8px 0;
      font-size: 13px;
      line-height: 20px;
      color: #333333;
    }

    .lang-settings-info-card a {
      color: #007185;
      text-decoration: none;
    }

    .lang-settings-info-card a:hover {
      color: #c7511f;
      text-decoration: underline;
    }

    .lang-settings-title {
      font-size: 24px;
      font-weight: 700;
      line-height: 32px;
      color: #0f1111;
      margin: 0 0 6px 0;
    }

    .lang-settings-subtitle {
      font-size: 14px;
      line-height: 20px;
      color: #0f1111;
      margin: 0 0 22px 0;
    }

    .lang-options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .lang-option-row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 14px;
      line-height: 20px;
      color: #0f1111;
      user-select: none;
      padding: 2px 0;
      width: fit-content;
    }

    .lang-option-row input[type="radio"] {
      width: 17px;
      height: 17px;
      accent-color: #007185;
      margin: 0;
      cursor: pointer;
    }

    .lang-option-label {
      font-weight: 400;
      color: #0f1111;
    }

    .lang-option-translation {
      color: #565959;
      font-size: 13px;
      margin-left: 4px;
    }

    /* Subtle divider under English matching Amazon India */
    .lang-english-divider {
      border: 0;
      border-top: 1px solid #e7e7e7;
      width: 220px;
      margin: 6px 0 8px 0;
    }

    /* Full-width divider above Save Changes */
    .lang-divider {
      border: 0;
      border-top: 1px solid #eaeded;
      margin: 28px 0 22px 0;
      width: 100%;
    }

    /* Amazon India Action Buttons */
    .lang-actions-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .lang-cancel-btn {
      display: inline-block;
      background: #ffffff;
      border: 1px solid #d5d9d9;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(213, 217, 217, 0.5);
      padding: 6px 18px;
      font-size: 13px;
      font-weight: 400;
      color: #0f1111;
      cursor: pointer;
      text-decoration: none;
      line-height: 20px;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .lang-cancel-btn:hover {
      background: #f7fafa;
      border-color: #d5d9d9;
    }

    .lang-save-btn {
      display: inline-block;
      background: #ffd814;
      border: 1px solid #fcd200;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(213, 217, 217, 0.5);
      padding: 6px 18px;
      font-size: 13px;
      font-weight: 500;
      color: #0f1111;
      cursor: pointer;
      line-height: 20px;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .lang-save-btn:hover {
      background: #f7ca00;
      border-color: #f2c200;
    }

    .lang-save-btn:focus,
    .lang-cancel-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px #c8f3fa, 0 1px 2px rgba(15, 17, 17, 0.15);
    }

    /* Amazon Recommendations Banner */
    .recommendations-banner {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e7e7e7;
      text-align: center;
    }

    .recommendations-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f1111;
      margin-bottom: 8px;
    }

    .recommendations-signin-btn {
      display: inline-block;
      width: 230px;
      background: #ffd814;
      border: 1px solid #fcd200;
      border-radius: 8px;
      padding: 6px 0;
      font-size: 13px;
      font-weight: 700;
      color: #0f1111;
      text-decoration: none;
      box-shadow: 0 2px 5px rgba(213, 217, 217, 0.5);
      margin-bottom: 6px;
      transition: background 0.15s ease;
    }

    .recommendations-signin-btn:hover {
      background: #f7ca00;
    }

    .recommendations-new-cust {
      font-size: 11px;
      color: #0f1111;
    }

    .recommendations-new-cust a {
      color: #007185;
      text-decoration: none;
    }

    .recommendations-new-cust a:hover {
      color: #c7511f;
      text-decoration: underline;
    }

    /* Back to Top & Footer */
    .back-to-top {
      display: block;
      width: 100%;
      background: #37475a;
      color: #ffffff;
      text-align: center;
      padding: 15px 0;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      margin-top: 40px;
      transition: background 0.15s ease;
    }

    .back-to-top:hover {
      background: #485769;
    }

    .amazon-footer {
      background: #232f3e;
      color: #ffffff;
      padding: 40px 20px 30px 20px;
      font-family: inherit;
    }

    .amazon-footer-grid {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30px;
      font-size: 13px;
    }

    .amazon-footer h4 {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 14px;
    }

    .amazon-footer ul {
      list-style: none;
      padding: 0;
      margin: 0;
      line-height: 2;
    }

    .amazon-footer ul li a {
      color: #dddddd;
      text-decoration: none;
    }

    .amazon-footer ul li a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .lang-settings-grid {
        flex-direction: column;
        gap: 24px;
      }
      .lang-settings-info-card {
        max-width: 100%;
        border-top: 1px solid #eaeded;
        padding-top: 20px;
      }
      .amazon-footer-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <!-- Standardized Amazon India Unified Top Header -->
  <div id="headerContainer"></div>

  <main class="lang-settings-page">
    <div class="lang-settings-card">
      <div class="lang-settings-grid">
        <div class="lang-settings-left">
          <h1 class="lang-settings-title" id="pageTitle" data-i18n="lang_settings_title">Language Settings</h1>
          <p class="lang-settings-subtitle" id="pageSubtitle" data-i18n="lang_settings_desc">Select the language you prefer for browsing, shopping and communications.</p>

          <form id="languageForm">
            <div class="lang-options-list">
              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="en" />
                <span class="lang-option-label">English - EN</span>
              </label>

              <div class="lang-english-divider"></div>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="hi" />
                <span class="lang-option-label">हिन्दी - HI</span>
                <span class="lang-option-translation">- अनुवाद</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="ta" />
                <span class="lang-option-label">தமிழ் - TA</span>
                <span class="lang-option-translation">- மொழிபெயர்ப்பு</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="te" />
                <span class="lang-option-label">తెలుగు - TE</span>
                <span class="lang-option-translation">- అనువాదం</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="kn" />
                <span class="lang-option-label">ಕನ್ನಡ - KN</span>
                <span class="lang-option-translation">- ಭಾಷಾಂತರ</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="ml" />
                <span class="lang-option-label">മലയാളം - ML</span>
                <span class="lang-option-translation">- വിവർത്തനം</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="bn" />
                <span class="lang-option-label">বাংলা - BN</span>
                <span class="lang-option-translation">- अनुवाद</span>
              </label>

              <label class="lang-option-row">
                <input type="radio" name="languagePref" value="mr" />
                <span class="lang-option-label">मराठी - MR</span>
                <span class="lang-option-translation">- भाषांतर</span>
              </label>
            </div>

            <hr class="lang-divider" />

            <div class="lang-actions-row">
              <button type="button" class="lang-cancel-btn" id="cancelBtn" data-i18n="cancel">Cancel</button>
              <button type="submit" class="lang-save-btn" id="saveLanguageBtn" data-i18n="save_changes">Save Changes</button>
            </div>
          </form>
        </div>

        <!-- Right Column Informational Note matching Amazon India -->
        <aside class="lang-settings-info-card">
          <h4 data-i18n="lang_info_title">Translation</h4>
          <p data-i18n="lang_info_desc">We will translate the most important information for your browsing, shopping and communications. Our translations are provided for your convenience. The English version of ElectroMart.in is the definitive version. <a href="#">Learn more</a></p>
        </aside>
      </div>
    </div>

    <!-- Recommendations Banner matching Amazon India -->
    <div class="recommendations-banner">
      <h3 class="recommendations-title" id="recTitle" data-i18n="recommendations_title">See personalized recommendations</h3>
      <a href="auth.html" class="recommendations-signin-btn" id="recSignInBtn" data-i18n="sign_in">Sign in</a>
      <div class="recommendations-new-cust">
        <span data-i18n="new_customer">New customer?</span> <a href="auth.html" data-i18n="start_here">Start here.</a>
      </div>
    </div>
  </main>

  <!-- Amazon Back to Top & Footer Section -->
  <a href="#" class="back-to-top" id="backToTop" data-i18n="back_to_top" onclick="window.scrollTo({top: 0, behavior: 'smooth'}); return false;">
    Back to top
  </a>

  <footer class="amazon-footer">
    <div class="amazon-footer-grid">
      <div>
        <h4>Get to Know Us</h4>
        <ul>
          <li><a href="#">About ElectroMart</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Press Releases</a></li>
          <li><a href="#">ElectroMart Science</a></li>
        </ul>
      </div>
      <div>
        <h4>Connect with Us</h4>
        <ul>
          <li><a href="#">Facebook</a></li>
          <li><a href="#">Twitter</a></li>
          <li><a href="#">Instagram</a></li>
        </ul>
      </div>
      <div>
        <h4>Make Money with Us</h4>
        <ul>
          <li><a href="#">Sell on ElectroMart</a></li>
          <li><a href="#">Sell under ElectroMart Accelerator</a></li>
          <li><a href="#">Protect and Build Your Brand</a></li>
          <li><a href="#">Become an Affiliate</a></li>
        </ul>
      </div>
      <div>
        <h4>Let Us Help You</h4>
        <ul>
          <li><a href="auth.html">Your Account</a></li>
          <li><a href="orders.html">Returns Centre</a></li>
          <li><a href="#">100% Purchase Protection</a></li>
          <li><a href="#">ElectroMart App Download</a></li>
          <li><a href="#">Help</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid #3a4553; margin: 30px 0 20px 0;"></div>
    <div style="max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap;">
      <div class="footer-logo">
        <span style="font-size: 1.1rem; font-weight: 700; color: #fff;">electro<span style="color:#ffe000">mart</span>.in</span>
      </div>
      <div class="footer-selectors">
        <select id="footerLanguageSelect" class="footer-language-select" aria-label="Select preferred language">
          <option value="en">English - EN</option>
          <option value="hi">हिन्दी - HI</option>
          <option value="ta">தமிழ் - TA</option>
          <option value="te">తెలుగు - TE</option>
          <option value="kn">ಕನ್ನಡ - KN</option>
          <option value="ml">മലയാളം - ML</option>
          <option value="bn">বাংলা - BN</option>
          <option value="mr">मराठी - MR</option>
        </select>
        <select aria-label="Select currency">
          <option value="INR">₹ INR - Indian Rupee</option>
          <option value="USD">$ USD - US Dollar</option>
        </select>
        <select aria-label="Select country">
          <option value="IN">🇮🇳 India</option>
          <option value="US">🇺🇸 United States</option>
        </select>
      </div>
    </div>
  </footer>

  <script src="translations.js"></script>
  <script src="header.js"></script>
  <script src="shared-search.js?v=20260314g"></script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const LANGUAGE_STORAGE_KEY = "electromart_lang_v1";
      const getActiveLang = () => (localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem("electromart_lang") || "en").toLowerCase();
      const savedLang = getActiveLang();

      // Select active radio button matching saved preference
      const activeRadio = document.querySelector(\`input[name="languagePref"][value="\${savedLang}"]\`);
      if (activeRadio) {
        activeRadio.checked = true;
      } else {
        const enRadio = document.querySelector('input[name="languagePref"][value="en"]');
        if (enRadio) enRadio.checked = true;
      }

      // Initial full-page translation
      if (typeof window.applyFullPageTranslation === "function") {
        window.applyFullPageTranslation(savedLang);
      }

      // Live real-time preview on radio selection (matching Amazon!)
      document.querySelectorAll('input[name="languagePref"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
          const previewLang = e.target.value.toLowerCase();
          if (typeof window.applyFullPageTranslation === "function") {
            window.applyFullPageTranslation(previewLang);
          }
        });
      });

      // Handle Cancel button
      const cancelBtn = document.getElementById("cancelBtn");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
          e.preventDefault();
          // Revert to saved language if preview was changed
          if (typeof window.applyFullPageTranslation === "function") {
            window.applyFullPageTranslation(savedLang);
          }
          if (document.referrer && !document.referrer.includes("language-settings.html")) {
            window.location.href = document.referrer;
          } else {
            window.location.href = "index.html";
          }
        });
      }

      // Handle Save Changes form submission
      const form = document.getElementById("languageForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const selected = document.querySelector('input[name="languagePref"]:checked');
          if (selected) {
            const newLang = selected.value.toLowerCase();
            localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
            localStorage.setItem("electromart_lang", newLang);

            if (typeof window.applyFullPageTranslation === "function") {
              window.applyFullPageTranslation(newLang);
            }

            // Show Amazon-style save confirmation toast
            const toast = document.createElement("div");
            toast.className = "amz-toast";
            toast.style.cssText = "position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#0f1111; color:#ffffff; padding:12px 24px; border-radius:8px; font-size:14px; font-weight:500; z-index:99999; box-shadow:0 4px 12px rgba(0,0,0,0.25); display:flex; align-items:center; gap:8px;";
            const msg = (newLang === "hi") ? "भाषा प्राथमिकता सहेजी गई" : "Language preference saved";
            toast.innerHTML = '<span style="color:#2dd4bf; font-weight:bold; font-size:16px;">✓</span> ' + msg + ': <strong>' + newLang.toUpperCase() + '</strong>';
            document.body.appendChild(toast);

            // Redirect back to previous page or index after short delay
            setTimeout(() => {
              if (document.referrer && !document.referrer.includes("language-settings.html")) {
                window.location.href = document.referrer;
              } else {
                window.location.href = "index.html";
              }
            }, 600);
          }
        });
      }
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(targetPath, htmlContent, 'utf8');
console.log('Successfully written language-settings.html');
