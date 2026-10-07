const fs = require('fs');
const path = require('path');

const repoRoot = "C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store";
const prodDetailPath = path.join(repoRoot, 'product-detail.js');
let content = fs.readFileSync(prodDetailPath, 'utf8').replace(/\r\n/g, '\n');

const targetRelated = `  relatedGrid.innerHTML = items.map((item) => \`
    <a href="product-detail.html?id=\${encodeURIComponent(item.id)}" class="related-item">
      <img src="\${normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL}" alt="\${item.name}" loading="lazy" />
      <p>\${item.name}</p>
    </a>
  \`).join("");`;

const replacementRelated = `  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  relatedGrid.innerHTML = items.map((item) => {
    const locTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : (item.title || item.name || "")).trim();
    return \`
      <a href="product-detail.html?id=\${encodeURIComponent(item.id)}" class="related-item">
        <img src="\${normalizeImageUrl(item.image) || FALLBACK_IMAGE_URL}" alt="\${escapeHtml(locTitle)}" loading="lazy" />
        <p>\${escapeHtml(locTitle)}</p>
      </a>
    \`;
  }).join("");`;

if (content.includes(targetRelated)) {
  content = content.replace(targetRelated, replacementRelated);
  console.log("Successfully patched renderRelatedProducts!");
} else {
  console.log("Target related not found!");
}

fs.writeFileSync(prodDetailPath, content, 'utf8');
