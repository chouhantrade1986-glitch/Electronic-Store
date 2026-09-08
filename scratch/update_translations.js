const fs = require('fs');

let content = fs.readFileSync('translations.js', 'utf8');

// 1. Remove trailing colons from visit_store_prefix across all languages
content = content.replace(/"visit_store_prefix":\s*"([^"]+):"/g, '"visit_store_prefix": "$1"');

// 2. Add drawer_subcategory to MEGA_I18N
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
  gu: "પેટા કેટેગરી"
};

// Check if drawer_subcategory already exists
if (!content.includes('"drawer_subcategory"')) {
  for (const [lang, trans] of Object.entries(drawerSubcatMap)) {
    // Look for language block in MEGA_I18N
    const megaRegex = new RegExp(`("${lang}":\\s*\\{[\\s\\S]*?"main_menu":\\s*"[^"]*",\\s*"see_all":\\s*"[^"]*")`, 'm');
    if (megaRegex.test(content)) {
      content = content.replace(megaRegex, `$1,\n    "drawer_subcategory": "${trans}"`);
    }
  }
}

fs.writeFileSync('translations.js', content, 'utf8');
console.log('translations.js updated successfully!');
