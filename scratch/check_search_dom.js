const fs = require('fs');

const productsHtml = fs.readFileSync('products.html', 'utf8');
const headerHtml = fs.readFileSync('header.html', 'utf8');
const amazonTheme = fs.readFileSync('amazon-theme.css', 'utf8');
const productsCss = fs.readFileSync('products.css', 'utf8');
const stylesCss = fs.readFileSync('styles.css', 'utf8');

console.log('--- CSS Links in products.html ---');
const links = productsHtml.match(/<link[^>]+>/g);
console.log(links);

console.log('--- CSS Links in index.html ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
console.log(indexHtml.match(/<link[^>]+>/g));
