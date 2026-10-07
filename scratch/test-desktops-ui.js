const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(projectDir, 'desktops.css'), 'utf8');
const js = fs.readFileSync(path.join(projectDir, 'desktops.js'), 'utf8');
const html = fs.readFileSync(path.join(projectDir, 'desktops.html'), 'utf8');

console.log('================================================================================');
console.log('=== Desktops UI Polish Test Suite (Amazon-style grid + card contract) ===');
console.log('================================================================================\n');

function extractMediaBlocks(cssText) {
  const blocks = [];
  const re = /@media[^{]*\{/g;
  let m;
  while ((m = re.exec(cssText)) !== null) {
    const start = m.index;
    const header = m[0];
    let depth = 1;
    let j = re.lastIndex;
    while (j < cssText.length && depth > 0) {
      const ch = cssText[j];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      j++;
    }
    blocks.push({ header, body: cssText.slice(re.lastIndex, j - 1), start, end: j });
    re.lastIndex = j;
  }
  return blocks;
}

function baseCss(cssText) {
  const blocks = extractMediaBlocks(cssText);
  let out = '';
  let cursor = 0;
  blocks.forEach((b) => {
    out += cssText.slice(cursor, b.start);
    cursor = b.end;
  });
  out += cssText.slice(cursor);
  return out;
}

function gridColumns(scopeCss) {
  const m = scopeCss.match(/\.desktop-grid\s*\{([^}]*)\}/);
  if (!m) return null;
  const g = m[1].match(/grid-template-columns:\s*([^;]+);/);
  return g ? g[1].trim() : null;
}

function findMediaBlock(blocks, maxWidthPx) {
  return blocks.find(
    (b) => b.header.includes(`max-width: ${maxWidthPx}px`) || b.header.includes(`max-width:${maxWidthPx}px`)
  );
}

// 1. Responsive product grid: desktop 4, tablet 3, mobile 2, small mobile 1
console.log('1. Testing responsive desktop grid columns (4 / 3 / 2 / 1)...');
const blocks = extractMediaBlocks(css);
const base = baseCss(css);
const baseCols = gridColumns(base);
assert.ok(baseCols && baseCols.startsWith('repeat(4,'), `Base .desktop-grid must be 4 columns, got "${baseCols}"`);

const b1020 = findMediaBlock(blocks, 1020);
assert.ok(b1020, 'desktops.css must have a max-width:1020px media block');
const cols1020 = gridColumns(b1020.body);
assert.ok(cols1020 && cols1020.startsWith('repeat(3,'), `At 1020px .desktop-grid must be 3 columns, got "${cols1020}"`);

const b640 = findMediaBlock(blocks, 640);
assert.ok(b640, 'desktops.css must have a max-width:640px media block');
const cols640 = gridColumns(b640.body);
assert.ok(cols640 && cols640.startsWith('repeat(2,'), `At 640px .desktop-grid must be 2 columns, got "${cols640}"`);

const b420 = findMediaBlock(blocks, 420);
assert.ok(b420, 'desktops.css must have a max-width:420px media block');
const cols420 = gridColumns(b420.body);
assert.strictEqual(cols420, '1fr', `At 420px .desktop-grid must be 1 column (1fr), got "${cols420}"`);
console.log('  ✓ Responsive grid verified: 4 (base) / 3 (<=1020) / 2 (<=640) / 1 (<=420).');

// 2. Card action + price classes rendered by desktops.js must be styled (Amazon look)
console.log('\n2. Testing JS-rendered card classes are styled (.desktop-add-btn, .current-price)...');
assert.ok(/\.desktop-add-btn\s*\{/.test(css), 'desktops.css must style .desktop-add-btn (the Add to Cart button desktops.js renders)');
assert.ok(/\.current-price\s*\{/.test(css), 'desktops.css must style .current-price (the price desktops.js renders)');

const addBtnRule = (css.match(/\.desktop-add-btn\s*\{([^}]*)\}/) || [])[1] || '';
assert.ok(/#ffd814|--accent-2|linear-gradient/.test(addBtnRule), '.desktop-add-btn must use the Amazon amber button styling');
assert.ok(/cursor:\s*pointer/.test(addBtnRule), '.desktop-add-btn must set cursor: pointer');

const priceRule = (css.match(/\.current-price\s*\{([^}]*)\}/) || [])[1] || '';
assert.ok(/font-weight:\s*700|font-weight:\s*bold/.test(priceRule), '.current-price must be bold');
assert.ok(/font-size:/.test(priceRule), '.current-price must declare a prominent font-size');
console.log('  ✓ Add-to-Cart button and price carry Amazon-style visual treatment.');

// 3. Brand list must pre-populate before the API call (never stuck on "Loading brands...")
console.log('\n3. Testing brand filter pre-population before API fetch...');
const initStart = js.indexOf('async function initDesktopPage');
assert.ok(initStart > -1, 'desktops.js must define initDesktopPage');
const afterInit = js.slice(initStart);
const syncIdx = afterInit.indexOf('syncDynamicBrandUI');
const fetchIdx = afterInit.indexOf('await fetchDesktopsFromApi');
assert.ok(syncIdx > -1, 'initDesktopPage must call syncDynamicBrandUI to pre-populate brands');
assert.ok(fetchIdx > -1, 'initDesktopPage must call fetchDesktopsFromApi');
assert.ok(syncIdx < fetchIdx, 'Brands must be populated BEFORE the API fetch so the list never shows "Loading brands..."');
console.log('  ✓ Brand list is populated from fallback/catalog before any network dependency.');

// 4. Initial paint must not show a misleading "Showing 0 products"
console.log('\n4. Testing initial-paint result count guard...');
assert.ok(js.includes('fallbackSize'), 'render() must compute a fallbackSize guard');
assert.ok(js.includes('Showing ${fallbackSize} products'), 'render() must show the fallback count instead of 0 on initial paint');
console.log('  ✓ Result meta avoids a misleading zero count during initial paint.');

// 5. Required DOM hooks must exist in desktops.html
console.log('\n5. Testing required desktops.html DOM hooks...');
['id="searchInput"', 'id="desktopGrid"', 'id="resultMeta"', 'id="brandFilterList"'].forEach((id) => {
  assert.ok(html.includes(id), `desktops.html must contain ${id}`);
});
console.log('  ✓ Search, grid, result-meta and brand-filter hooks present.');

// 6. Brand safety: zero customer-facing third-party marketplace text
console.log('\n6. Testing brand safety (zero customer-facing marketplace branding)...');
const visibleText = html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ');
['Amazon.in', 'Amazon India', 'Shop on Amazon', 'अमेज़न'].forEach((word) => {
  assert.ok(!visibleText.includes(word), `Customer-facing text must not contain "${word}"`);
});
console.log('  ✓ Pure ElectroMart branding verified on desktops.html.');

console.log('\n================================================================================');
console.log('=== ALL DESKTOPS UI POLISH TESTS PASSED (100%) ===');
console.log('================================================================================');
