const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store';

// Load db.json
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'backend', 'src', 'data', 'db.json'), 'utf8'));
console.log('db.json products count:', db.products.length);

// Extract categories from db.json
const dbCategories = new Set(db.products.map(p => p.category));
console.log('Categories in db.json:', Array.from(dbCategories));

// Load products-data.js
const pDataContent = fs.readFileSync(path.join(ROOT, 'products-data.js'), 'utf8');
const match = pDataContent.match(/const\s+EM_CATALOG\s*=\s*(\[[\s\S]*?\]);\s*(?:if|window|const)/);
if (match) {
  try {
    const emCatalog = eval(match[1]);
    console.log('products-data.js EM_CATALOG count:', emCatalog.length);
    const emCategories = new Set(emCatalog.map(p => p.category));
    console.log('Categories in products-data.js:', Array.from(emCategories));

    // Check price mismatches between db.json and products-data.js
    const dbMap = new Map(db.products.map(p => [p.id, p]));
    let mismatches = 0;
    emCatalog.forEach(p => {
      const dbProd = dbMap.get(p.id);
      if (dbProd) {
        if (Number(p.price) !== Number(dbProd.price)) {
          console.log(`Price mismatch for [${p.id}] "${p.name}": EM_CATALOG=${p.price} vs db.json=${dbProd.price}`);
          mismatches++;
        }
      } else {
        console.log(`Product in EM_CATALOG but not in db.json: [${p.id}] "${p.name}"`);
      }
    });
    console.log(`Total price mismatches: ${mismatches}`);
  } catch (e) {
    console.error('Error parsing EM_CATALOG:', e.message);
  }
} else {
  console.log('Could not regex extract EM_CATALOG');
}
