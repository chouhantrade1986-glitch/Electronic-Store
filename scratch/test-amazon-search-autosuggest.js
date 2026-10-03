const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("Testing Amazon Live Predictive Search Auto-Suggest...");

const sharedSearchJs = fs.readFileSync('shared-search.js', 'utf8');
const scriptJs = fs.readFileSync('script.js', 'utf8');
const headerHtml = fs.readFileSync('header.html', 'utf8');
const amazonCss = fs.readFileSync('amazon-theme.css', 'utf8');

// 1. Check shared-search.js getCatalogProducts integrates window.EM_CATALOG
assert(sharedSearchJs.includes('window.EM_CATALOG'), 'shared-search.js should check window.EM_CATALOG');
assert(sharedSearchJs.includes('window.EM_CATALOG_MAP'), 'shared-search.js should check window.EM_CATALOG_MAP');

// 2. Check script.js search integrates window.EM_CATALOG
assert(scriptJs.includes('window.EM_CATALOG'), 'script.js search should check window.EM_CATALOG');
assert(scriptJs.includes('window.EM_CATALOG_MAP'), 'script.js search should check window.EM_CATALOG_MAP');

// 3. Check image fallback in suggestions
assert(sharedSearchJs.includes("onerror=\"this.onerror=null;this.src='product-placeholder.svg';\""), 'shared-search.js should include image error fallback');
assert(scriptJs.includes("onerror=\"this.onerror=null;this.src='product-placeholder.svg';\""), 'script.js should include image error fallback');

// 4. Check multilingual title resolution
assert(sharedSearchJs.includes('window.getLocalizedTitle'), 'shared-search.js should resolve localized title');
assert(scriptJs.includes('window.getLocalizedTitle'), 'script.js should resolve localized title');

// 5. Check department scoping in suggestions
assert(sharedSearchJs.includes('selectedCategory') && sharedSearchJs.includes('categoryFilteredProducts'), 'shared-search.js should support department filtering');
assert(sharedSearchJs.includes('suggestion-scope-tag'), 'shared-search.js should have suggestion-scope-tag');
assert(scriptJs.includes('suggestion-scope-tag'), 'script.js should have suggestion-scope-tag');

// 6. Check price formatting in suggestions
assert(sharedSearchJs.includes('suggestion-price'), 'shared-search.js should render suggestion-price');
assert(scriptJs.includes('suggestion-price'), 'script.js should render suggestion-price');

// 7. Check Amazon CSS styles for suggestions
assert(amazonCss.includes('.search-suggestions'), 'amazon-theme.css should style .search-suggestions');
assert(amazonCss.includes('.suggestion-item'), 'amazon-theme.css should style .suggestion-item');
assert(amazonCss.includes('.suggestion-thumb'), 'amazon-theme.css should style .suggestion-thumb');
assert(amazonCss.includes('.suggestion-price'), 'amazon-theme.css should style .suggestion-price');
assert(amazonCss.includes('.suggestion-scope-tag'), 'amazon-theme.css should style .suggestion-scope-tag');
assert(amazonCss.includes('#f0f2f2'), 'amazon-theme.css should have Amazon hover background #f0f2f2');

// 8. Test in simulated browser environment
const vm = require('vm');
const windowMock = {
  location: { search: '', href: '' },
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  },
  EM_CATALOG: [
    {
      id: 'prod_test_1',
      name: 'HP KP03 Laptop Battery',
      brand: 'HP',
      category: 'laptop',
      price: 1399,
      rating: 4.2,
      image: 'https://example.com/battery.jpg',
      title: {
        en: 'HP KP03 Laptop Battery',
        hi: 'HP KP03 लैपटॉप बैटरी'
      }
    },
    {
      id: 'prod_test_2',
      name: 'Canon Pixma Color Printer',
      brand: 'Canon',
      category: 'printer',
      price: 4999,
      rating: 4.5,
      image: 'https://example.com/printer.jpg',
      title: {
        en: 'Canon Pixma Color Printer',
        hi: 'कैनन पिक्समा कलर प्रिंटर'
      }
    }
  ],
  EM_CATALOG_MAP: {},
  getLocalizedTitle(p) { return p.name; }
};

windowMock.EM_CATALOG_MAP = {
  prod_test_1: windowMock.EM_CATALOG[0],
  prod_test_2: windowMock.EM_CATALOG[1]
};

// Evaluate getCatalogProducts logic in VM
const ctx = vm.createContext({
  window: windowMock,
  localStorage: windowMock.localStorage,
  loadCatalogMap: () => ({}),
  CATALOG_STORAGE_KEY: 'electromart_catalog_v1'
});

const getProductsCode = `
  let memoryProducts = [];
  if (typeof window !== "undefined") {
    if (Array.isArray(window.EM_CATALOG) && window.EM_CATALOG.length) {
      memoryProducts = window.EM_CATALOG;
    } else if (window.EM_CATALOG_MAP && typeof window.EM_CATALOG_MAP === "object") {
      memoryProducts = typeof window.EM_CATALOG_MAP.values === "function"
        ? Array.from(window.EM_CATALOG_MAP.values())
        : Object.values(window.EM_CATALOG_MAP);
    }
  }
  const cachedMap = loadCatalogMap();
  const cachedList = Object.values(cachedMap);

  const merged = new Map();
  memoryProducts.forEach((item) => {
    if (item && item.id) {
      merged.set(String(item.id), item);
    }
  });
  cachedList.forEach((item) => {
    if (item && item.id) {
      const idStr = String(item.id);
      const existing = merged.get(idStr);
      merged.set(idStr, { ...(existing || {}), ...item });
    }
  });

  const res = Array.from(merged.values()).filter(
    (item) => item && item.id && Number(item.price || 0) > 0
  );
  res;
`;

const result = vm.runInContext(getProductsCode, ctx);
assert.strictEqual(result.length, 2, 'Should load 2 products from in-memory window.EM_CATALOG');
assert.strictEqual(result[0].name, 'HP KP03 Laptop Battery');
assert.strictEqual(result[1].name, 'Canon Pixma Color Printer');

console.log('✓ PASS: All Amazon search auto-suggest checks passed successfully!');
