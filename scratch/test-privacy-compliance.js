const assert = require('assert');
const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(projectDir, 'privacy.html'), 'utf8');
const cart = fs.readFileSync(path.join(projectDir, 'cart.html'), 'utf8');

console.log('==================================================');
console.log('TEST SUITE: ElectroMart Privacy & Governance Controls');
console.log('==================================================');

['privacyHub', 'consentCard', 'saveConsentBtn', 'exportDataBtn', 'deleteDataBtn', 'grievanceCard', 'dataRightsStatus'].forEach((id) => {
  assert(html.includes(`id="${id}"`), `privacy.html must contain #${id}`);
});
['electromart_privacy_consent_v1', 'electromart_privacy_requests_v1', 'electromart-data-export.json'].forEach((value) => {
  assert(html.includes(value), `privacy.html must include ${value}`);
});
assert(/legal@electromart\.in/i.test(html), 'Privacy page must publish the legal contact');
assert(/48 hours/i.test(html), 'Privacy page must publish acknowledgement target');
assert(/No third-party advertising tracker/i.test(html), 'Privacy page must disclose tracker posture');
const visibleHtml = html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/\b(?:src|href|class|id)=(["'])[^"']*\1/gi, "")
  .replace(/<[^>]+>/g, " ");
assert(!/Amazon|अमेज़न/i.test(visibleHtml), 'Privacy page must remain ElectroMart brand-safe');

const expectedOrder = ['translations.js', 'products-data.js', 'universal-i18n-bus.js', 'header.js', 'menu-manager.js', 'auth-state.js', 'shared-search.js', 'cart.js'];
const cartScripts = [...cart.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1].replace(/\?.*$/, ''));
const positions = expectedOrder.map((name) => cartScripts.indexOf(name));
assert(positions.every((position) => position >= 0), 'cart.html must contain the complete shared script chain');
assert(positions.every((position, index) => index === 0 || position > positions[index - 1]), 'cart.html shared script order must be canonical');

console.log('PASS: privacy controls, governance disclosures, brand safety, and cart script order verified.');
