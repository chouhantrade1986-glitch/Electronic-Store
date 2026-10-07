const fs = require('fs');
const path = require('path');

const target = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'todays-deals.js');
let raw = fs.readFileSync(target, 'utf8');

// Normalize CRLF to LF
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

const brokenRegex = /if \(document\.readyState === "loading"\) \{[\s\S]*?return labels\[value\] \|\| "Featured";\n\}/;

const replacement = `if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    startDealCountdowns();
    setupDealCardActions();
  });
} else {
  startDealCountdowns();
  setupDealCardActions();
}

function render(list) {
  if (!resultMeta || !dealsGrid) {
    return;
  }
  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const t = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[currentLang]) ? window.EM_TRANSLATIONS[currentLang] : {};
  resultMeta.textContent = \`\${list.length} \${t.showing_x_deals || "डील्स दिखाई जा रही हैं"}\`;
  if (!list.length) {
    dealsGrid.innerHTML = \`<div class='empty'>\${t.no_deals_found || "No exact deal matches found. Try clearing one filter or broadening the search."}</div>\`;
    return;
  }
  dealsGrid.innerHTML = list.map(dealCard).join("");
}

function getSortLabel(value) {
  const labels = {
    discount_desc: "Highest Discount",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low"
  };
  return labels[value] || "Featured";
}`;

if (brokenRegex.test(code)) {
  code = code.replace(brokenRegex, replacement);
  if (isCrlf) {
    code = code.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(target, code, 'utf8');
  console.log('Regex matched and replaced successfully!');
} else {
  console.error('Broken regex did not match!');
}
