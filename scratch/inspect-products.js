const fs = require('fs');
const db = JSON.parse(fs.readFileSync('backend/src/data/db.json', 'utf8'));
console.log('Total DB products:', db.products ? db.products.length : 0);
if (db.products) {
  db.products.slice(0, 20).forEach(p => console.log(p.id, '|', p.name, '|', p.brand));
}
