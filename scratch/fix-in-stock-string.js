const fs = require('fs');
const path = require('path');

const file = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'translations.js');
let content = fs.readFileSync(file, 'utf8');

content = content.split('"in_stock": "स्टॉक में है"').join('"in_stock": "स्टॉक में उपलब्ध"');

fs.writeFileSync(file, content, 'utf8');
console.log("Successfully normalized in_stock to 'स्टॉक में उपलब्ध'");
