const fs = require('fs');
const path = require('path');

const repoRoot = "C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store";
const prodDetailPath = path.join(repoRoot, 'product-detail.js');
let content = fs.readFileSync(prodDetailPath, 'utf8').replace(/\r\n/g, '\n');

const targetBundle = `  const total = Number(product.price || 0) + Number(bundleItem.price || 0);
  container.innerHTML = \`
    <h2>\${t.frequently_bought_together || "Frequently bought together"}</h2>
    <div class="bundle-flex" style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-top: 12px;">
      <div class="bundle-images" style="display: flex; align-items: center; gap: 12px;">
        <img src="\${product.image}" alt="\${escapeHtml(product.name)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
        <span style="font-size: 1.5rem; font-weight: bold; color: #555;">+</span>
        <img src="\${bundleItem.image}" alt="\${escapeHtml(bundleItem.name)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
      </div>
      <div class="bundle-details" style="flex: 1; min-width: 250px;">
        <p style="font-size: 1.05rem; margin-bottom: 8px;">
          <strong>\${t.cart_subtotal || "Total"}:</strong> <span style="color: #b12704; font-size: 1.25rem; font-weight: bold;">\${money(total)}</span>
        </p>
        <div style="font-size: 0.9rem; color: #333; margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px;"><input type="checkbox" checked disabled /> <strong>\${t.val_this_item || "This item:"}</strong> \${escapeHtml(product.name)} (\${money(product.price)})</label>
          <label style="display: block;"><input type="checkbox" id="bundleAccCheckbox" checked /> \${escapeHtml(bundleItem.name)} (\${money(bundleItem.price)})</label>
        </div>`;

const replacementBundle = `  const currentLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "hi").toLowerCase();
  const mainTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name).trim();
  const bundleItemTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(bundleItem, currentLang) : bundleItem.name).trim();
  const total = Number(product.price || 0) + Number(bundleItem.price || 0);
  container.innerHTML = \`
    <h2>\${t.frequently_bought_together || "Frequently bought together"}</h2>
    <div class="bundle-flex" style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-top: 12px;">
      <div class="bundle-images" style="display: flex; align-items: center; gap: 12px;">
        <img src="\${product.image}" alt="\${escapeHtml(mainTitle)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
        <span style="font-size: 1.5rem; font-weight: bold; color: #555;">+</span>
        <img src="\${bundleItem.image}" alt="\${escapeHtml(bundleItemTitle)}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" />
      </div>
      <div class="bundle-details" style="flex: 1; min-width: 250px;">
        <p style="font-size: 1.05rem; margin-bottom: 8px;">
          <strong>\${t.cart_subtotal || "Total"}:</strong> <span style="color: #b12704; font-size: 1.25rem; font-weight: bold;">\${money(total)}</span>
        </p>
        <div style="font-size: 0.9rem; color: #333; margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 4px;"><input type="checkbox" checked disabled /> <strong>\${t.val_this_item || "This item:"}</strong> <span class="this-item-title">\${escapeHtml(mainTitle)}</span> (\${money(product.price)})</label>
          <label style="display: block;"><input type="checkbox" id="bundleAccCheckbox" checked /> <span class="bundle-item-title">\${escapeHtml(bundleItemTitle)}</span> (\${money(bundleItem.price)})</label>
        </div>\`;`;

if (content.includes(targetBundle)) {
  content = content.replace(targetBundle, replacementBundle);
  console.log("Successfully patched bundle in renderFrequentlyBoughtTogether!");
} else {
  console.log("Target bundle not found!");
}

fs.writeFileSync(prodDetailPath, content, 'utf8');
