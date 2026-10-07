const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');

console.log("================================================================================");
console.log("TEST SUITE: Best Sellers Full DOM Execution Verification");
console.log("================================================================================");

// Mock DOM elements
function createElement(tag, id = "", className = "") {
  return {
    tagName: tag.toUpperCase(),
    id,
    className,
    classList: {
      contains: function(c) { return (this._classes || []).includes(c); },
      add: function(c) { this._classes = this._classes || []; if (!this._classes.includes(c)) this._classes.push(c); },
      remove: function(c) { this._classes = (this._classes || []).filter(x => x !== c); },
      toggle: function(c, force) { if (force) this.add(c); else this.remove(c); }
    },
    innerHTML: "",
    textContent: "",
    value: "",
    getAttribute: function(name) { return this[name] || this.dataset?.[name] || null; },
    setAttribute: function(name, val) { this[name] = val; },
    querySelectorAll: function() { return []; },
    querySelector: function() { return null; },
    addEventListener: function() {},
    focus: function() {}
  };
}

const elements = {
  bestGrid: createElement("div", "bestGrid", "best-grid"),
  resultMeta: createElement("p", "resultMeta"),
  searchInput: createElement("input", "searchInput"),
  categoryFilter: createElement("select", "categoryFilter"),
  brandFilterList: createElement("div", "brandFilterList", "brand-filter-list"),
  sortFilter: createElement("select", "sortFilter"),
  cartCount: createElement("span", "cartCount"),
  deptTrigger: createElement("button", "deptTrigger"),
  deptMenu: createElement("div", "deptMenu"),
  bestSellersDeptBar: createElement("nav", "bestSellersDeptBar", "amz-dept-pills-bar")
};

const mockDoc = {
  readyState: 'complete',
  documentElement: { lang: 'en', setAttribute: () => {} },
  getElementById: (id) => elements[id] || null,
  querySelector: (sel) => {
    if (sel === "#bestGrid") return elements.bestGrid;
    if (sel === "#bestSellersDeptBar") return elements.bestSellersDeptBar;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes(".amz-dept-pill")) return [];
    if (sel.includes(".brand-filter")) return [];
    return [];
  },
  addEventListener: () => {}
};

const mockWindow = {
  location: { search: "", pathname: "/best-sellers.html" },
  document: mockDoc,
  localStorage: {
    getItem: (k) => 'en',
    setItem: () => {}
  },
  Intl: Intl
};

const sandbox = {
  window: mockWindow,
  document: mockDoc,
  localStorage: mockWindow.localStorage,
  Intl: Intl,
  URLSearchParams: URLSearchParams,
  console: console
};

vm.createContext(sandbox);

// 1. Check syntax first
console.log("\n[TEST 1] Verifying best-sellers.js syntax via node compilation...");
const bsCode = fs.readFileSync(path.join(projectDir, 'best-sellers.js'), 'utf8');
assert.doesNotThrow(() => {
  new vm.Script(bsCode);
}, "best-sellers.js must compile with 0 syntax errors!");
console.log("  PASS: best-sellers.js compiled with 0 syntax errors.");

// 2. Load translations and products-data
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
vm.runInContext(transCode, sandbox);
const catalogCode = fs.readFileSync(path.join(projectDir, 'products-data.js'), 'utf8');
vm.runInContext(catalogCode, sandbox);

// 3. Execute best-sellers.js
console.log("\n[TEST 2] Executing best-sellers.js in simulated browser runtime...");
vm.runInContext(bsCode, sandbox);

// 4. Assert products are rendered in bestGrid
console.log("\n[TEST 3] Inspecting DOM output...");
const gridHtml = elements.bestGrid.innerHTML;
assert(gridHtml.length > 0, "bestGrid.innerHTML must NOT be empty!");
assert(gridHtml.includes("product-card"), "bestGrid must render product cards!");
assert(gridHtml.includes("amz-rank-badge rank-1"), "bestGrid must render #1 rank badge!");
assert(gridHtml.includes("amz-rank-badge rank-2"), "bestGrid must render #2 rank badge!");
assert(gridHtml.includes("amz-rank-badge rank-3"), "bestGrid must render #3 rank badge!");
console.log("  PASS: Product cards and authentic podium rank ribbons (#1, #2, #3) rendered successfully.");

// 5. Assert resultMeta shows positive product count
const metaText = elements.resultMeta.textContent;
console.log("  resultMeta text:", metaText);
assert(!metaText.includes("Showing 0 products"), "resultMeta must NOT say 'Showing 0 products'");
assert(metaText.includes("Showing") && !metaText.includes(" 0 "), "resultMeta must show positive product count");
console.log("  PASS: resultMeta shows positive product count.");

// 6. Assert brand filter list is populated (not 'Loading brands...')
const brandHtml = elements.brandFilterList.innerHTML;
assert(!brandHtml.includes("Loading brands..."), "brandFilterList must replace 'Loading brands...' with real brand checkboxes!");
assert(brandHtml.includes("brand-filter"), "brandFilterList must render brand checkboxes!");
console.log("  PASS: Brand filters populated properly.");

console.log("\n================================================================================");
console.log("ALL BEST SELLERS DOM EXECUTION CHECKS PASSED (100%)!");
console.log("================================================================================\n");
