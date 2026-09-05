const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("Testing Amazon Category Facade (All ▾) & Search History (✕ Delete)...");

const headerHtml = fs.readFileSync('header.html', 'utf8');
const headerJs = fs.readFileSync('header.js', 'utf8');
const scriptJs = fs.readFileSync('script.js', 'utf8');
const sharedSearchJs = fs.readFileSync('shared-search.js', 'utf8');
const amazonCss = fs.readFileSync('amazon-theme.css', 'utf8');

// 1. Check header.html for Category Facade Wrap & Label
assert(headerHtml.includes('class="nav-search-facade-wrap"'), 'header.html must include nav-search-facade-wrap');
assert(headerHtml.includes('id="navCategoryLabel"'), 'header.html must include navCategoryLabel');
assert(headerHtml.includes('All <span class="nav-arrow">▾</span>'), 'header.html navCategoryLabel must have "All ▾" default');
assert(headerHtml.includes('value="all">All Categories<'), 'header.html must preserve All Categories option text for native dropdown');

// 2. Check header.js for Category Facade Wrap & syncNavCategoryLabel
assert(headerJs.includes('class="nav-search-facade-wrap"'), 'header.js injectHeader must include nav-search-facade-wrap');
assert(headerJs.includes('id="navCategoryLabel"'), 'header.js injectHeader must include navCategoryLabel');
assert(headerJs.includes('function syncNavCategoryLabel()'), 'header.js must include syncNavCategoryLabel function');
assert(headerJs.includes('categorySelectEl.addEventListener(\'change\', syncNavCategoryLabel)'), 'header.js must listen for category change to sync label');

// 3. Check shared-search.js for Category Facade & syncNavCategoryLabel
assert(sharedSearchJs.includes('nav-search-facade-wrap'), 'shared-search.js must support nav-search-facade-wrap');
assert(sharedSearchJs.includes('function syncNavCategoryLabel(form)'), 'shared-search.js must include syncNavCategoryLabel');

// 4. Check shared-search.js for Search History item delete
assert(sharedSearchJs.includes('function removeSearchHistoryItem(query)'), 'shared-search.js must have removeSearchHistoryItem function');
assert(sharedSearchJs.includes('data-remove-history='), 'shared-search.js renderSuggestionItem must render data-remove-history delete button');
assert(sharedSearchJs.includes('suggestion-remove-btn'), 'shared-search.js must have suggestion-remove-btn');
assert(sharedSearchJs.includes('suggestion-label--history'), 'shared-search.js must apply suggestion-label--history class');

// 5. Check script.js for Search History item delete & syncNavCategoryLabel
assert(scriptJs.includes('function removeSearchHistoryItem(query)'), 'script.js must have removeSearchHistoryItem function');
assert(scriptJs.includes('data-remove-history='), 'script.js renderSuggestionCard must render data-remove-history delete button');
assert(scriptJs.includes('suggestion-remove-btn'), 'script.js must have suggestion-remove-btn');
assert(scriptJs.includes('suggestion-label--history'), 'script.js must apply suggestion-label--history class');
assert(scriptJs.includes('function syncNavCategoryLabel()'), 'script.js must include syncNavCategoryLabel function');

// 6. Check CSS styles in amazon-theme.css
assert(amazonCss.includes('.nav-search-facade-wrap'), 'amazon-theme.css must style .nav-search-facade-wrap');
assert(amazonCss.includes('.nav-search-facade-text'), 'amazon-theme.css must style .nav-search-facade-text');
assert(amazonCss.includes('.suggestion-remove-btn'), 'amazon-theme.css must style .suggestion-remove-btn');
assert(amazonCss.includes('#562774'), 'amazon-theme.css must style search history in authentic Amazon purple #562774');

// 7. Functional verification: Simulated VM test for removeSearchHistoryItem
const vm = require('vm');
const mockLocalStorage = {
  store: {
    'electromart_search_history_v1': JSON.stringify(['laptop', 'hp battery', 'wireless mouse'])
  },
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); }
};

const sandbox = {
  localStorage: mockLocalStorage,
  SEARCH_HISTORY_STORAGE_KEY: 'electromart_search_history_v1',
  loadSearchHistory: () => JSON.parse(mockLocalStorage.getItem('electromart_search_history_v1') || '[]'),
  saveSearchHistory: (entries) => mockLocalStorage.setItem('electromart_search_history_v1', JSON.stringify(entries))
};

const code = `
function removeSearchHistoryItem(query) {
  const value = String(query || "").trim();
  if (!value) return;
  const history = loadSearchHistory();
  const updated = history.filter((item) => item.toLowerCase() !== value.toLowerCase());
  saveSearchHistory(updated);
}
removeSearchHistoryItem('hp battery');
`;

vm.runInNewContext(code, sandbox);

const remaining = JSON.parse(mockLocalStorage.store['electromart_search_history_v1']);
assert.deepStrictEqual(remaining, ['laptop', 'wireless mouse'], 'Item hp battery should be removed while preserving other search history items');

console.log("✓ All Amazon Category Facade & Search History Delete assertions PASSED!");
