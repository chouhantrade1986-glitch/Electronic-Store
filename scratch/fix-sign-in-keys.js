const fs = require('fs');
const path = require('path');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');

let trans = fs.readFileSync(path.join(projectDir, 'translations.js'), 'utf8');
trans = trans.replace(
  'sign_in: "साइन इन"',
  'sign_in: "साइन इन करें",\n    drawer_sign_in: "साइन इन"'
);
fs.writeFileSync(path.join(projectDir, 'translations.js'), trans, 'utf8');

let hHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
hHtml = hHtml.replace('data-i18n="sign_in"', 'data-i18n="drawer_sign_in"');
fs.writeFileSync(path.join(projectDir, 'header.html'), hHtml, 'utf8');

let hJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
hJs = hJs.replace('data-i18n="sign_in"', 'data-i18n="drawer_sign_in"');
fs.writeFileSync(path.join(projectDir, 'header.js'), hJs, 'utf8');

let mMgr = fs.readFileSync(path.join(projectDir, 'menu-manager.js'), 'utf8');
mMgr = mMgr.replace("key: 'sign_in'", "key: 'drawer_sign_in'");
fs.writeFileSync(path.join(projectDir, 'menu-manager.js'), mMgr, 'utf8');

console.log('Successfully adjusted sign_in and drawer_sign_in');
