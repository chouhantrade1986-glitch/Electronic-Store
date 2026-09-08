const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store';

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('electromart_lang')) {
      results.push({ lineNum: idx + 1, line: line.trim() });
    }
  });
  return results;
}

const jsFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.js'));
console.log('--- Scanning JS files for electromart_lang ---');
jsFiles.forEach(f => {
  const r = scanFile(path.join(ROOT, f));
  if (r.length > 0) {
    console.log(`\nFile: ${f}`);
    r.forEach(x => console.log(`  L${x.lineNum}: ${x.line}`));
  }
});

// Check API endpoints in JS files
console.log('\n--- Checking API baseURL or hardcoded fetch URLs ---');
const hardcodedHosts = [];
jsFiles.forEach(f => {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const matches = content.match(/https?:\/\/[a-zA-Z0-9.:_-]+/g);
  if (matches) {
    matches.forEach(m => {
      if (m.includes('localhost') || m.includes('127.0.0.1')) {
        hardcodedHosts.push({ file: f, url: m });
      }
    });
  }
});
console.log('Found hardcoded local hosts in frontend files:');
const uniqueHosts = new Set(hardcodedHosts.map(h => `${h.file}: ${h.url}`));
uniqueHosts.forEach(u => console.log('  ' + u));

// Check HTML pages missing header or universal scripts
console.log('\n--- Checking HTML pages header/footer/script inclusion ---');
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const pagesMissingHeader = [];
const pagesMissingTranslations = [];

htmlFiles.forEach(h => {
  // skip qa files
  if (h.startsWith('qa-')) return;
  const content = fs.readFileSync(path.join(ROOT, h), 'utf8');
  if (!content.includes('header.html') && !content.includes('header.js') && !content.includes('header-container') && !content.includes('electromart-header')) {
    pagesMissingHeader.push(h);
  }
  if (!content.includes('translations.js')) {
    pagesMissingTranslations.push(h);
  }
});

console.log('Pages without header/header.js (excluding qa-*.html):', pagesMissingHeader);
console.log('Pages without translations.js (excluding qa-*.html):', pagesMissingTranslations);
