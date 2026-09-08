const fs = require('fs');

let content = fs.readFileSync('translations.js', 'utf8');

// Remove those stacked lines 3993-4003
content = content.replace(/(?:\s*"drawer_subcategory":\s*"[^"]*",?)+/g, '');

const langMap = {
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

for (const [lang, val] of Object.entries(langMap)) {
  // In MEGA_I18N: "lang": { ... "see_all": "..."
  const regex = new RegExp(`("${lang}":\\s*\\{[\\s\\S]*?"see_all":\\s*"[^"]*")`);
  content = content.replace(regex, `$1,\n    "drawer_subcategory": "${val}"`);
}

fs.writeFileSync('translations.js', content, 'utf8');
console.log('Fixed translations.js cleanly!');
