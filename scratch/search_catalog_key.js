const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store';

const jsFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.js'));
jsFiles.forEach(f => {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (content.includes('electromart_catalog_v1') || content.includes('CATALOG_STORAGE_KEY')) {
    console.log(`Found in ${f}`);
  }
});
