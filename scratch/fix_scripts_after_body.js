const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store';
const targetFiles = [
  'brands.html',
  'faq.html',
  'mega-store.html',
  'refund-policy.html',
  'review.html',
  'shipping-policy.html',
  'accessibility-statement.html'
];

targetFiles.forEach(file => {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const bodyClose = content.lastIndexOf('</body>');
  const htmlClose = content.lastIndexOf('</html>');

  if (bodyClose > -1) {
    const afterBody = content.substring(bodyClose + 7, htmlClose > -1 ? htmlClose : undefined);
    if (/<script/i.test(afterBody)) {
      console.log(`Fixing scripts after body in ${file}...`);
      // extract script tags from afterBody
      const scriptTags = afterBody.match(/<script[\s\S]*?<\/script>/gi) || [];
      // remove them from afterBody
      let cleanedAfter = afterBody;
      scriptTags.forEach(st => {
        cleanedAfter = cleanedAfter.replace(st, '');
      });
      // insert before </body>
      const beforeBody = content.substring(0, bodyClose);
      const scriptsToInsert = '\n  ' + scriptTags.map(s => s.trim()).join('\n  ') + '\n';
      
      const newContent = beforeBody + scriptsToInsert + '</body>' + cleanedAfter + (htmlClose > -1 ? '</html>\n' : '\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`-> Successfully fixed ${file}`);
    }
  }
});
