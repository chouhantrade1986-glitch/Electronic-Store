const fs = require('fs');
const pages = [
  'products.html', 'cart.html', 'checkout.html', 'account.html', 'orders.html',
  'todays-deals.html', 'best-sellers.html', 'laptop.html', 'printer.html',
  'product-detail.html', 'language-settings.html', 'index.html'
];
pages.forEach(p => {
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    console.log(p.padEnd(22), 'translations.js:', c.includes('translations.js'), '| header.js:', c.includes('header.js'));
  }
});
