const fs = require('fs');
const target = 'C:\\Users\\Admin\\Documents\\GitHub\\Electronic-Store\\products-data.js';
let content = fs.readFileSync(target, 'utf8');

// Replace all 6.7" with 6.7″
content = content.replace(/6\.7"/g, '6.7″');
content = content.replace(/10\.3"/g, '10.3″');

fs.writeFileSync(target, content, 'utf8');
console.log('Cleaned all double quotes in products-data.js');
