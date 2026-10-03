const fs = require('fs');
const content = fs.readFileSync('translations.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('visit_store_prefix')) {
    const match = line.match(/"visit_store_prefix":\s*"([^"]+)"/);
    if (match && match[1].includes(':')) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
