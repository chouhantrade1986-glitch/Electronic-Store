const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectDir = path.join(__dirname, '..');

console.log('===============================================================');
console.log('TEST SUITE: Brand Safety & Legal Compliance (ElectroMart Only)');
console.log('===============================================================');

// Forbidden brand patterns that must NEVER be visible to customers on electromart.in
const FORBIDDEN_VISIBLE_BRAND_REGEX = /\b(amazon|amazons)\b|अमेज़न|अमेजन|अमेजॉन|അമേസാൻ|அமேசான்|అమెజాన్|ಅಮೆಜಾನ್|অ্যামাজন|ਐਮਾਜ਼ਾਨ|એમેઝોન|ایمیزون/i;

// 1. Verify all HTML files have 0 user-visible Amazon branding
const htmlFiles = fs.readdirSync(projectDir).filter(f => f.endsWith('.html'));
const htmlViolations = [];

htmlFiles.forEach(file => {
  const filePath = path.join(projectDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Strip script, style, and comments
  const stripped = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // Check all rendered text nodes >text<
  const textMatches = stripped.match(/>([^<]+)</g) || [];
  textMatches.forEach(tm => {
    const text = tm.slice(1, -1).trim();
    if (FORBIDDEN_VISIBLE_BRAND_REGEX.test(text)) {
      htmlViolations.push({ file, type: 'visible text node', text });
    }
  });

  // Check attributes: alt, title, placeholder, aria-label
  const attrRegex = /(?:alt|title|placeholder|aria-label)=["']([^"']+)["']/gi;
  let m;
  while ((m = attrRegex.exec(stripped)) !== null) {
    if (FORBIDDEN_VISIBLE_BRAND_REGEX.test(m[1])) {
      htmlViolations.push({ file, type: 'attribute', attr: m[1] });
    }
  }
});

assert.strictEqual(
  htmlViolations.length,
  0,
  `BRAND SAFETY VIOLATION: User-visible Amazon branding detected in HTML files:\n${JSON.stringify(htmlViolations, null, 2)}`
);
console.log(`PASS: All ${htmlFiles.length} HTML files are 100% clean of visible Amazon brand text!`);

// 2. Verify translations.js across all 11 languages
const transCode = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    documentElement: { setAttribute: () => {} }
  },
  localStorage: {
    getItem: () => 'hi',
    setItem: () => {}
  }
};
vm.createContext(sandbox);
vm.runInContext(transCode, sandbox);

const trans = sandbox.window.EM_TRANSLATIONS;
assert(trans, 'EM_TRANSLATIONS must exist on window');

const languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'ur', 'pa', 'gu'];
const translationViolations = [];

languages.forEach(lang => {
  assert(trans[lang], `Language "${lang}" must exist`);

  // Check amazons_choice
  const choiceVal = trans[lang].amazons_choice;
  if (choiceVal && FORBIDDEN_VISIBLE_BRAND_REGEX.test(choiceVal)) {
    translationViolations.push({ lang, key: 'amazons_choice', value: choiceVal });
  }

  // Check amazon_style_filters
  const filterVal = trans[lang].amazon_style_filters;
  if (filterVal && FORBIDDEN_VISIBLE_BRAND_REGEX.test(filterVal)) {
    translationViolations.push({ lang, key: 'amazon_style_filters', value: filterVal });
  }

  // Check electromarts_choice parity
  assert(
    trans[lang].electromarts_choice,
    `Key "electromarts_choice" must exist in "${lang}"`
  );
  assert.strictEqual(
    trans[lang].electromarts_choice,
    trans[lang].amazons_choice,
    `electromarts_choice and amazons_choice must be identical in "${lang}"`
  );
});

assert.strictEqual(
  translationViolations.length,
  0,
  `BRAND SAFETY VIOLATION: Forbidden Amazon strings in translations.js:\n${JSON.stringify(translationViolations, null, 2)}`
);
console.log('PASS: All 11 language dictionaries in translations.js strictly use ElectroMart branding!');

// 3. Verify products.js ribbon fallback logic
const prodCode = fs.readFileSync(path.join(projectDir, 'products.js'), 'utf8');
assert(
  !prodCode.includes('ribbonLabel = t.amazons_choice || "Amazon\'s Choice";'),
  'products.js must not fallback to "Amazon\'s Choice"'
);
assert(
  prodCode.includes('ElectroMart\'s Choice'),
  'products.js must fallback to "ElectroMart\'s Choice"'
);
console.log('PASS: products.js ribbon label strictly renders ElectroMart\'s Choice!');

// 4. Verify product-detail.html badge text
const pdpHtml = fs.readFileSync(path.join(projectDir, 'product-detail.html'), 'utf8');
assert(
  pdpHtml.includes("ElectroMart's <span class=\"ac-accent\">Choice</span>"),
  'product-detail.html must display ElectroMart\'s Choice in choice badge'
);
assert(
  !pdpHtml.includes("Amazon's <span class=\"ac-accent\">Choice</span>"),
  'product-detail.html must not contain Amazon\'s Choice'
);
console.log('PASS: product-detail.html choice badge markup verified!');

// 5. Verify backend database descriptions
const dbPath = path.join(projectDir, 'backend', 'src', 'data', 'db.json');
if (fs.existsSync(dbPath)) {
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  assert(
    !dbContent.includes('Amazon Customer Service'),
    'backend/src/data/db.json must not reference Amazon Customer Service'
  );
  assert(
    dbContent.includes('ElectroMart Customer Service'),
    'backend/src/data/db.json must reference ElectroMart Customer Service'
  );
  console.log('PASS: backend/src/data/db.json verified clean of Amazon customer service!');
}

console.log('\n✓ ALL BRAND SAFETY & LEGAL COMPLIANCE CHECKS PASSED PERFECTLY!\n');
