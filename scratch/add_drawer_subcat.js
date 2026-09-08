const fs = require('fs');

let content = fs.readFileSync('translations.js', 'utf8');

const drawerSubcatMap = {
  en: "Subcategory",
  hi: "उप-श्रेणी",
  ta: "துணைப்பிரிவு",
  te: "ఉపవర్గం",
  kn: "ಉಪವರ್ಗ",
  ml: "ഉപവിഭാഗം",
  bn: "উপ-বিভাগ",
  mr: "उपवर्ग",
  ur: "ذیلی زمرہ",
  pa: "ਉਪ-ਸ਼੍ਰੇਣੀ",
  gu: "પેટા કેટેગरी"
};

// Locate DRAWER_ITEMS_I18N
const drawerIdx = content.indexOf('const DRAWER_ITEMS_I18N = {');
if (drawerIdx !== -1) {
  let drawerPart = content.slice(drawerIdx);
  const endIdx = drawerPart.indexOf('};\n  Object.keys(DRAWER_ITEMS_I18N)');
  let block = drawerPart.slice(0, endIdx);

  for (const [lang, val] of Object.entries(drawerSubcatMap)) {
    // find "drawer_sign_in": ... in each language section
    const langHeader = `"${lang}": {`;
    const headerPos = block.indexOf(langHeader);
    if (headerPos !== -1) {
      const signInPos = block.indexOf('"drawer_sign_in":', headerPos);
      if (signInPos !== -1) {
        const lineEnd = block.indexOf('\n', signInPos);
        block = block.slice(0, lineEnd) + `,\n    "drawer_subcategory": "${val}"` + block.slice(lineEnd);
      }
    }
  }

  content = content.slice(0, drawerIdx) + block + drawerPart.slice(endIdx);
  fs.writeFileSync('translations.js', content, 'utf8');
  console.log('Successfully updated DRAWER_ITEMS_I18N with drawer_subcategory!');
} else {
  console.error('Could not find DRAWER_ITEMS_I18N');
}
