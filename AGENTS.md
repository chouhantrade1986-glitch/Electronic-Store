# ElectroMart — AI Agent Guidelines & Architecture Manual (AI एजेंट दिशा-निर्देश)

> [!NOTE]
> **Canonical source:** यह फ़ाइल एक संक्षिप्त प्रवेश-बिंदु (concise entry-point) है। पूर्ण और अद्यतन मैनुअल (विस्तृत आर्किटेक्चर, Phase 1–40 रोडमैप, और Universal Agent Rules) के लिए **`AGENT_INSTRUCTIONS.md`** पढ़ें। वर्तमान स्थिति और टेस्ट-मेट्रिक्स के लिए **`PROJECT_STATUS.md`** देखें।

> [!IMPORTANT]
> **सभी AI एजेंट्स (VS Code, Claude, Copilot, Antigravity) के लिए अनिवार्य नियम:**
> 1. ElectroMart एक पूर्ण ई-कॉमर्स प्लेटफ़ॉर्म है जो परिचित भारतीय marketplace UX patterns और **11 भारतीय भाषाओं (i18n)** पर आधारित है।
> 2. **सख्त ब्रांड व कानूनी सुरक्षा नियम (Strict Legal & Brand Safety Rule):** वेबसाइट (`electromart.in`) के किसी भी customer-facing text, badge, dictionary value, alt/title/placeholder/aria label, tooltip या generated label में किसी third-party marketplace का नाम **पूर्णतः वर्जित (Strictly Prohibited)** है। वेबसाइट का नाम केवल और केवल **ElectroMart (`electromart.in` / इलेक्ट्रोमार्ट)** है।
> 3. **आंतरिक पहचानकर्ता सुरक्षित रखें:** legacy CSS क्लासें (उदा. `.amazon-layout`, `.amazon-price-block`, `.ac-badge-pill`) और आंतरिक DOM IDs (उदा. `#amazonsChoiceBadge`, `#amazonAccountGrid`) को **न बदलें** — स्टाइलशीट्स और regression टेस्ट उन पर निर्भर हैं। केवल दिखने वाला टेक्स्ट ElectroMart होना चाहिए।
> 4. किसी भी नए फीचर या बग-फिक्स से पहले `AGENT_INSTRUCTIONS.md` पूरा पढ़ें, ताकि पिछला कोई भी काम प्रभावित न हो।

---

## 1. प्रोजेक्ट आर्किटेक्चर (Core Architecture Overview)

- **डेटा इंजन (Data Engine):** 751 इलेक्ट्रॉनिक्स उत्पाद दो जगह सिंक्रोनाइज़ रहते हैं —
  1. `products-data.js` (`window.EM_CATALOG` और `window.EM_CATALOG_MAP`) — फ्रंटएंड के लिए हाई-स्पीड इन-मेमरी कैटलॉग।
  2. `backend/src/data/db.json` — बैकएंड REST API डेटाबेस।
  सभी कीमतें **भारतीय रुपयों (₹ INR)** में हैं; किसी कीमत को मनमाने ढंग से पैसे या 100 से गुणा/भाग न करें।
- **अनुवाद इंजन (i18n):** डिक्शनरी `translations.js` — 11 भाषाएँ `en, hi, ta, te, kn, ml, bn, mr, ur, pa, gu`। रियल-टाइम अनुवाद बस `universal-i18n-bus.js`। भाषा हमेशा दोनों storage keys में एक साथ लिखें:
  ```javascript
  localStorage.setItem("electromart_lang_v1", lang);
  localStorage.setItem("electromart_lang", lang);
  ```
- **बैकएंड और पोर्ट्स:** Backend API (Node.js/Express) पोर्ट `4000` (`http://127.0.0.1:4000/api`); Frontend static server `qa-static-server.js` पोर्ट `5500` (`http://127.0.0.1:5500/index.html`)।
- **एकमात्र लॉन्च (Single canonical launch):** `npm start` (= `node launch-electromart.js`), जो बैकएंड (4000) और फ्रंटएंड (5500) दोनों चलाता है। नया launcher, alternate server, duplicate `index.html`, git worktree या parallel project folder बनाना **निषिध** है। केवल इसी repo root में काम करें: `C:\Users\Admin\Documents\GitHub\Electronic-Store`।

---

## 2. स्क्रिप्ट लोडिंग का अनिवार्य क्रम (Script Loading Rule)

प्रत्येक HTML पेज में स्क्रिप्ट्स हमेशा इसी क्रम में हों, और सभी `<script>` टैग `</body>` के अंदर रहें:

```html
  <!-- 1. बहुभाषी डिक्शनरी -->
  <script src="translations.js"></script>
  <!-- 2. 751 उत्पादों का कैटलॉग -->
  <script src="products-data.js"></script>
  <!-- 3. रियल-टाइम अनुवाद बस -->
  <script src="universal-i18n-bus.js"></script>
  <!-- 4. ग्लोबल हेडर और साझा निर्भरताएँ -->
  <script src="header.js"></script>
  <script src="menu-manager.js"></script>
  <script src="auth-state.js"></script>
  <script src="shared-search.js"></script>
  <!-- 5. इसके बाद ही पेज की मुख्य स्क्रिप्ट (उदा. cart.js, orders.js) -->
  <script src="page-specific.js"></script>
</body>
</html>
```

---

## 3. अनिवार्य प्री-फ्लाइट और पोस्ट-एडिट टेस्ट (Pre-flight & Post-edit Checklist)

किसी भी फाइल में बदलाव करने से **पहले और बाद में** दोनों कमांड चलाएं:

```bash
node scratch/run_all_tests.js          # फ्रंटएंड व i18n: सभी 75 टेस्ट सूट्स PASS होने चाहिए
cd backend && npm run test:unit        # बैकएंड यूनिट: सभी 105 टेस्ट PASS होने चाहिए
```

- वर्तमान लक्ष्य: **75 frontend suites + 105 backend unit tests = 180 / 180 (100%)**।
- **TDD अपनाएँ:** हर नए फीचर के लिए पहले एक focused failing टेस्ट लिखें, फिर implement करें, फिर focused टेस्ट और दोनों regression suites हरे करें।
- काम तब तक पूरा नहीं माना जाएगा जब तक focused suite और दोनों regression suites PASS न हों (या blocker स्पष्ट रूप से दर्ज न हो)।

---

## 4. ब्रांड एवं डिज़ाइन अनुपालन (Brand & Design Compliance)

> [!CAUTION]
> - Layout, UX, pricing hierarchy और interaction patterns मौजूदा ElectroMart conventions के अनुरूप रखें।
> - Website, translations और नए documentation में केवल **ElectroMart / electromart.in / इलेक्ट्रोमार्ट** branding रखें; किसी third-party marketplace का नाम customer-facing output में न जोड़ें।
> - Badge हमेशा **"ElectroMart's Choice"**, filters हमेशा **"ElectroMart Filters"**।
> - पूरा होने से पहले `scratch/test-brand-safety-and-legal-compliance.js` चलाएँ — कोई भी customer-visible third-party marketplace reference एक release blocker है।
> - विस्तृत डिज़ाइन-नियम (price block, buy box, search bar आदि) `AGENT_INSTRUCTIONS.md` सेक्शन 4 में हैं।

---

## 5. कार्य समाप्ति चेकपॉइंट (Work Done Checkpoint)

जब काम पूरा हो और सभी टेस्ट पास हो जाएं, तो बदलाव सुरक्षित रखने के लिए Git commit बनाएं:

```bash
git add <specific-files>
git commit -m "feat(scope): your descriptive commit message"
```

---

**पूर्ण मैनुअल व Universal Agent Rules:** `AGENT_INSTRUCTIONS.md` · **स्थिति व टेस्ट-मेट्रिक्स:** `PROJECT_STATUS.md` · **संचालन नियम (forbidden actions):** `CLAUDE.md`
