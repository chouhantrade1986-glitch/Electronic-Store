const fs = require('fs');
const path = require('path');

const repoRoot = "C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store";
const prodDetailPath = path.join(repoRoot, 'product-detail.js');
let content = fs.readFileSync(prodDetailPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Update Title and Breadcrumb block in renderProduct
const targetTitle = `  productImage.alt = product.name;
  productName.textContent = product.name;
  
  // 1. Localized Breadcrumb
  const breadcrumbEl = document.getElementById("productBreadcrumb");
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = \`<a href="products.html" data-i18n="breadcrumb_products">\${t.breadcrumb_products || "Products"}</a> &gt; <span id="crumbName">\${escapeHtml(product.name)}</span>\`;
  }`;

const replacementTitle = `  const localizedTitle = (window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : (product.title || product.name || "")).trim();
  const localizedDesc = (window.getLocalizedDescription ? window.getLocalizedDescription(product, currentLang) : "").trim();
  const localizedSpecs = window.getLocalizedSpecs ? window.getLocalizedSpecs(product, currentLang) : [];

  productImage.alt = localizedTitle;
  productName.textContent = localizedTitle;
  
  // 1. Localized Breadcrumb
  const breadcrumbEl = document.getElementById("productBreadcrumb");
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = \`<a href="products.html" data-i18n="breadcrumb_products">\${t.breadcrumb_products || "Products"}</a> &gt; <span id="crumbName">\${escapeHtml(localizedTitle)}</span>\`;
  }
  renderProductHeader(product);`;

if (content.includes(targetTitle)) {
  content = content.replace(targetTitle, replacementTitle);
  console.log("Successfully patched localizedTitle in renderProduct!");
} else {
  console.log("Target title block not found!");
}

// 2. Update Description block in renderProduct
const targetDesc = `  const fallbackDescription = \`Explore \${product.name} for \${product.category} needs with trusted performance and reliable support.\`;
  const descriptionRaw = String(product.description || "").trim();
  if (!descriptionRaw) {
    productDescription.textContent = fallbackDescription;
  } else if (/<[a-z][\\s\\S]*>/i.test(descriptionRaw) || /&[a-z]+;/i.test(descriptionRaw)) {
    const sanitized = descriptionRaw
      .replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi, "")
      .replace(/\\son\\w+="[^"]*"/gi, "")
      .replace(/\\son\\w+='[^']*'/gi, "");
    productDescription.innerHTML = sanitized;
  } else {
    productDescription.textContent = descriptionRaw;
  }`;

const replacementDesc = `  const fallbackDescription = \`Explore \${localizedTitle} for \${product.category} needs with trusted performance and reliable support.\`;
  const descriptionRaw = String(localizedDesc || product.description || "").trim();
  if (!descriptionRaw || descriptionRaw.includes("I'm a product description")) {
    productDescription.textContent = localizedDesc || fallbackDescription;
  } else if (/<[a-z][\\s\\S]*>/i.test(descriptionRaw) || /&[a-z]+;/i.test(descriptionRaw)) {
    const sanitized = descriptionRaw
      .replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi, "")
      .replace(/\\son\\w+="[^"]*"/gi, "")
      .replace(/\\son\\w+='[^']*'/gi, "");
    productDescription.innerHTML = sanitized;
  } else {
    productDescription.textContent = localizedDesc || descriptionRaw;
  }`;

if (content.includes(targetDesc)) {
  content = content.replace(targetDesc, replacementDesc);
  console.log("Successfully patched localizedDesc in renderProduct!");
} else {
  console.log("Target desc block not found!");
}

// 3. Update Specs block in renderProduct
const targetSpecs = `  const defaultSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];
  const keywordSpecs = Array.isArray(product.keywords) ? product.keywords.slice(0, 6) : [];
  const specs = keywordSpecs.length ? keywordSpecs : defaultSpecs;
  productSpecs.innerHTML = specs.map((spec) => \`<li>\${localizeSpec(spec, t)}</li>\`).join("");
  
  const bulletMap = {
    "High performance processor": t.spec_high_performance || "उच्च प्रदर्शन प्रोसेसर",
    "SSD storage": t.spec_ssd_storage || "एसएसडी स्टोरेज",
    "Long battery life": t.spec_battery_life || "लंबी बैटरी लाइफ"
  };
  document.querySelectorAll("#productSpecs li, #aboutItemBulletList li").forEach((li) => {
    const text = li.textContent.trim();
    if (bulletMap[text]) li.textContent = bulletMap[text];
  });`;

const replacementSpecs = `  const defaultSpecs = specMap[productCategoryFamily] || ["Quality assured", "Trusted by customers", "Fast delivery options"];
  const keywordSpecs = Array.isArray(product.keywords) ? product.keywords.slice(0, 6) : [];
  const fallbackSpecs = keywordSpecs.length ? keywordSpecs : defaultSpecs;
  const finalSpecs = (localizedSpecs && localizedSpecs.length) ? localizedSpecs : fallbackSpecs;
  productSpecs.innerHTML = finalSpecs.map((spec) => \`<li>\${localizeSpec(spec, t)}</li>\`).join("");
  
  const bulletMap = {
    "High performance processor": t.spec_high_performance || "उच्च प्रदर्शन प्रोसेसर",
    "SSD storage": t.spec_ssd_storage || "एसएसडी स्टोरेज",
    "Long battery life": t.spec_battery_life || "लंबी बैटरी लाइफ",
    "Mobile and Wearable Tech": t.spec_mobile_wearable || "मोबाइल और वियरेबल तकनीक",
    "Water resistant IP68": t.spec_water_resistant || "वॉटर रेसिस्टेंट IP68",
    "Up to 7 days battery life": t.spec_battery_7days || "7 दिनों तक की बैटरी लाइफ"
  };
  document.querySelectorAll("#productSpecs li, #aboutItemBulletList li").forEach((li) => {
    const text = li.textContent.trim();
    if (bulletMap[text]) li.textContent = bulletMap[text];
  });`;

if (content.includes(targetSpecs)) {
  content = content.replace(targetSpecs, replacementSpecs);
  console.log("Successfully patched localizedSpecs in renderProduct!");
} else {
  console.log("Target specs block not found!");
}

fs.writeFileSync(prodDetailPath, content, 'utf8');
console.log("product-detail.js patch complete!");
