const fs = require('fs');
const { JSDOM } = require('jsdom');

const productsHtml = fs.readFileSync('products.html', 'utf8');
const headerHtml = fs.readFileSync('header.html', 'utf8');

// Simulate products.html after headerContainer is populated with header.html
const dom = new JSDOM(productsHtml);
const document = dom.window.document;
const headerContainer = document.getElementById('headerContainer');
headerContainer.innerHTML = headerHtml;

// Old way
const oldCatFilter = document.getElementById('categoryFilter');
console.log('Old getElementById("categoryFilter"):', oldCatFilter.className, 'parent:', oldCatFilter.parentElement.className);

// New way targeting sidebar
const sidebarCatFilter = document.querySelector('.filters-panel #categoryFilter, .refine-panel #categoryFilter, .filters-panel select.filter-select, aside #categoryFilter');
console.log('New sidebar selector:', sidebarCatFilter.className, 'parent:', sidebarCatFilter.parentElement.className);

const headerCatFilter = document.querySelector('.nav-search-facade-wrap select, #siteHeader select[data-search-catalog="1"]');
console.log('Header selector:', headerCatFilter.className, 'parent:', headerCatFilter.parentElement.className);

console.log('Are they different elements?', sidebarCatFilter !== headerCatFilter);
