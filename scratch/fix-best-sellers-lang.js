const fs = require('fs');
const path = require('path');
const file = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store\\best-sellers.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<h3><a href="${detailUrl}">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(item, currentLang) : item.name)}</a></h3>',
  '<h3><a href="${detailUrl}">${escapeHtml(window.getLocalizedTitle ? window.getLocalizedTitle(item, lang) : item.name)}</a></h3>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed best-sellers.js lang parameter');
