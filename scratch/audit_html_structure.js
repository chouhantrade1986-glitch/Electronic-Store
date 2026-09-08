const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store';
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

console.log(`Auditing HTML structure for ${htmlFiles.length} files...\n`);

const issues = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
  
  // Check if scripts exist after </body>
  const bodyCloseIndex = content.lastIndexOf('</body>');
  const htmlCloseIndex = content.lastIndexOf('</html>');
  
  if (bodyCloseIndex > -1) {
    const afterBody = content.substring(bodyCloseIndex + 7, htmlCloseIndex > -1 ? htmlCloseIndex : undefined);
    if (/<script/i.test(afterBody)) {
      issues.push({
        file,
        type: 'SCRIPTS_AFTER_BODY',
        details: 'Found <script> tags placed outside/after </body> tag.'
      });
    }
  }

  // Check script order: translations.js vs main page script
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  const scriptList = [];
  while ((match = scriptRegex.exec(content)) !== null) {
    scriptList.push(match[1].split('?')[0]);
  }

  const transIdx = scriptList.findIndex(s => s.endsWith('translations.js'));
  const prodDataIdx = scriptList.findIndex(s => s.endsWith('products-data.js'));
  const headerIdx = scriptList.findIndex(s => s.endsWith('header.js'));
  
  // Find page specific script
  const baseName = file.replace('.html', '.js');
  const pageScriptIdx = scriptList.findIndex(s => s.endsWith(baseName));

  if (transIdx > -1 && pageScriptIdx > -1 && pageScriptIdx < transIdx) {
    issues.push({
      file,
      type: 'PAGE_SCRIPT_BEFORE_TRANSLATIONS',
      details: `Page script ${baseName} (pos ${pageScriptIdx}) runs before translations.js (pos ${transIdx})`
    });
  }

  // Check missing DOCTYPE
  if (!content.trim().toLowerCase().startsWith('<!doctype html>')) {
    issues.push({
      file,
      type: 'MISSING_DOCTYPE',
      details: 'File does not start with <!DOCTYPE html>'
    });
  }

  // Check missing viewport
  if (!content.includes('name="viewport"') && !content.includes("name='viewport'")) {
    issues.push({
      file,
      type: 'MISSING_VIEWPORT',
      details: 'Missing viewport meta tag'
    });
  }
});

console.log(`Found ${issues.length} structural issues across HTML files:`);
issues.forEach(i => {
  console.log(`[${i.type}] ${i.file}: ${i.details}`);
});
