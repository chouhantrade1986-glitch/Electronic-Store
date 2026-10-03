const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store';

console.log('=== STARTING COMPREHENSIVE PROJECT AUDIT ===\n');

const auditResults = {
  htmlFiles: [],
  brokenReferences: [],
  syntaxErrors: [],
  databaseIssues: [],
  storageKeyInconsistencies: [],
  missingTranslations: [],
  scriptOrderingIssues: []
};

// 1. SCAN ALL HTML FILES FOR BROKEN LINKS/SCRIPTS/CSS
const allFiles = fs.readdirSync(PROJECT_ROOT);
const htmlFiles = allFiles.filter(f => f.endsWith('.html'));

console.log(`[1/6] Scanning ${htmlFiles.length} HTML files for script and link integrity...`);

htmlFiles.forEach(htmlFile => {
  const filePath = path.join(PROJECT_ROOT, htmlFile);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check script tags
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  const scripts = [];
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1];
    scripts.push(src);
    if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//')) {
      const cleanSrc = src.split('?')[0].replace(/^\//, '');
      const targetPath = path.join(PROJECT_ROOT, cleanSrc);
      if (!fs.existsSync(targetPath)) {
        auditResults.brokenReferences.push({
          file: htmlFile,
          type: 'script',
          src: src,
          missingPath: targetPath
        });
      }
    }
  }

  // Check link css tags
  const linkRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    if (content.substring(match.index, match.index + match[0].length).includes('stylesheet')) {
      if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//') && !href.startsWith('data:')) {
        const cleanHref = href.split('?')[0].replace(/^\//, '');
        const targetPath = path.join(PROJECT_ROOT, cleanHref);
        if (!fs.existsSync(targetPath)) {
          auditResults.brokenReferences.push({
            file: htmlFile,
            type: 'css',
            href: href,
            missingPath: targetPath
          });
        }
      }
    }
  }

  // Check script order: does header.js / script.js load before translations.js or products-data.js?
  const scriptSrcs = scripts.map(s => s.split('?')[0]);
  const trIndex = scriptSrcs.findIndex(s => s.endsWith('translations.js'));
  const catIndex = scriptSrcs.findIndex(s => s.endsWith('products-data.js'));
  const appIndex = scriptSrcs.findIndex(s => s.endsWith('script.js') || s.endsWith('product-detail.js') || s.endsWith('products.js'));
  
  if (trIndex > -1 && appIndex > -1 && appIndex < trIndex) {
    auditResults.scriptOrderingIssues.push({
      file: htmlFile,
      issue: `Application script (${scriptSrcs[appIndex]}) loaded BEFORE translations.js (index ${appIndex} < ${trIndex})`
    });
  }

  auditResults.htmlFiles.push({
    file: htmlFile,
    scriptCount: scripts.length
  });
});

console.log(`-> Found ${auditResults.brokenReferences.length} broken script/CSS references.`);
console.log(`-> Found ${auditResults.scriptOrderingIssues.length} script ordering issues.`);

// 2. SYNTAX CHECK ALL JS FILES
console.log('\n[2/6] Checking JS syntax for all root and backend files...');
const jsFiles = allFiles.filter(f => f.endsWith('.js'));
const backendDir = path.join(PROJECT_ROOT, 'backend', 'src');

function getJsFilesRecursive(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules') results = results.concat(getJsFilesRecursive(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const allProjectJs = jsFiles.map(f => path.join(PROJECT_ROOT, f)).concat(getJsFilesRecursive(backendDir));

allProjectJs.forEach(jsFile => {
  try {
    execSync(`node --check "${jsFile}"`, { stdio: 'pipe' });
  } catch (err) {
    auditResults.syntaxErrors.push({
      file: path.relative(PROJECT_ROOT, jsFile),
      error: err.message
    });
  }
});

console.log(`-> Checked ${allProjectJs.length} JS files. Syntax errors: ${auditResults.syntaxErrors.length}`);

// 3. DATABASE INTEGRITY CHECK (db.json)
console.log('\n[3/6] Checking backend/src/data/db.json database integrity...');
const dbPath = path.join(PROJECT_ROOT, 'backend', 'src', 'data', 'db.json');
let db = null;
try {
  const rawDb = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(rawDb);
  console.log(`-> Successfully parsed db.json. Products: ${db.products?.length || 0}, Users: ${db.users?.length || 0}, Orders: ${db.orders?.length || 0}`);
  
  // Price checks
  let zeroPriceCount = 0;
  let excessivePriceCount = 0;
  let missingImageCount = 0;
  let invalidCategoryCount = 0;

  (db.products || []).forEach(p => {
    if (!p.price || p.price <= 0) {
      zeroPriceCount++;
      auditResults.databaseIssues.push({ id: p.id, title: p.title, issue: `Invalid price: ${p.price}` });
    }
    // Check if price looks like paise (e.g. > 100,000 for accessories or cable)
    const cat = (p.category || '').toLowerCase();
    if ((cat.includes('accessories') || cat.includes('cable') || cat.includes('mouse') || cat.includes('keyboard')) && p.price > 100000) {
      excessivePriceCount++;
      auditResults.databaseIssues.push({ id: p.id, title: p.title, issue: `Suspicious high price (likely in paise): ₹${p.price}` });
    }
    if (!p.image && !p.images) {
      missingImageCount++;
    }
    if (!p.category) {
      invalidCategoryCount++;
    }
  });

  console.log(`-> Zero/Invalid prices: ${zeroPriceCount}`);
  console.log(`-> Suspicious paise prices: ${excessivePriceCount}`);
  console.log(`-> Missing images: ${missingImageCount}`);
  console.log(`-> Missing category: ${invalidCategoryCount}`);
} catch (e) {
  auditResults.databaseIssues.push({ issue: `Failed to read or parse db.json: ${e.message}` });
  console.error('db.json error:', e.message);
}

// 4. STORAGE KEY USAGE (Cart, Auth, Settings)
console.log('\n[4/6] Scanning localStorage key usage across JS files...');
const storageKeys = new Map();
const keyRegex = /localStorage\.(getItem|setItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g;

allProjectJs.forEach(jsFile => {
  const content = fs.readFileSync(jsFile, 'utf8');
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    const action = match[1];
    const key = match[2];
    const relFile = path.relative(PROJECT_ROOT, jsFile);
    if (!storageKeys.has(key)) storageKeys.set(key, []);
    storageKeys.get(key).push({ file: relFile, action });
  }
});

const keyList = Array.from(storageKeys.keys());
console.log(`-> Distinct localStorage keys found: ${keyList.length}`);
console.log('Keys:', keyList);

// Check cart key divergence
const cartKeys = keyList.filter(k => k.toLowerCase().includes('cart'));
console.log('Cart-related keys:', cartKeys);

// Check auth / user key divergence
const userKeys = keyList.filter(k => k.toLowerCase().includes('user') || k.toLowerCase().includes('token') || k.toLowerCase().includes('auth'));
console.log('Auth-related keys:', userKeys);

// 5. TRANSLATIONS SCAN
console.log('\n[5/6] Checking translation dictionary coverage...');
const translationsPath = path.join(PROJECT_ROOT, 'translations.js');
if (fs.existsSync(translationsPath)) {
  const trContent = fs.readFileSync(translationsPath, 'utf8');
  // extract languages
  const langMatch = trContent.match(/const\s+translations\s*=\s*({[\s\S]*?});?\s*(?:if|window|module)/);
  console.log('-> translations.js size:', (trContent.length / 1024).toFixed(2), 'KB');
}

// 6. BACKEND CONFIG & SECURITY AUDIT
console.log('\n[6/6] Checking Backend Config & Environment...');
const serverJsPath = path.join(PROJECT_ROOT, 'backend', 'src', 'server.js');
if (fs.existsSync(serverJsPath)) {
  const serverContent = fs.readFileSync(serverJsPath, 'utf8');
  const hasCors = serverContent.includes('cors');
  const hasHelmet = serverContent.includes('helmet');
  const hasRateLimit = serverContent.includes('rateLimit') || serverContent.includes('express-rate-limit');
  const hasHardcodedSecret = /secret['"]?\s*:\s*['"][a-zA-Z0-9_-]+['"]/i.test(serverContent) || serverContent.includes('your-secret-key') || serverContent.includes('secret123');
  
  console.log('Backend Security Settings:');
  console.log('  CORS enabled:', hasCors);
  console.log('  Helmet enabled:', hasHelmet);
  console.log('  Rate Limit enabled:', hasRateLimit);
  console.log('  Hardcoded JWT/Session Secret:', hasHardcodedSecret);
}

// Output Summary
console.log('\n=== AUDIT SCAN SUMMARY ===');
console.log(`Broken references: ${auditResults.brokenReferences.length}`);
auditResults.brokenReferences.forEach(br => console.log(`  - [${br.file}] ${br.type}: ${br.src || br.href}`));
console.log(`Script order issues: ${auditResults.scriptOrderingIssues.length}`);
auditResults.scriptOrderingIssues.forEach(so => console.log(`  - [${so.file}] ${so.issue}`));
console.log(`Database issues: ${auditResults.databaseIssues.length}`);
if (auditResults.databaseIssues.length > 0) {
  auditResults.databaseIssues.slice(0, 5).forEach(di => console.log(`  - ${JSON.stringify(di)}`));
  if (auditResults.databaseIssues.length > 5) console.log(`  ... and ${auditResults.databaseIssues.length - 5} more.`);
}

fs.writeFileSync(
  path.join(__dirname, 'audit_raw_results.json'),
  JSON.stringify(auditResults, null, 2)
);
console.log('\nRaw results saved to audit_raw_results.json');
