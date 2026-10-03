const fs = require('fs');
const file = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store\\products.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<h3><a class="title-link" href="product-detail.html?id=${encodeURIComponent(product.id)}">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name)}</a></h3>',
  '<h3><a class="title-link" href="product-detail.html?id=${encodeURIComponent(product.id)}">${window.getLocalizedTitle ? window.getLocalizedTitle(product, currentLang) : product.name}</a></h3>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed escapeHtml in products.js');
