# ElectroMart — AI Agent Guidelines & Architecture Manual (AI एजेंट दिशा-निर्देश)

> [!IMPORTANT]
> **सभी AI एजेंट्स (VS Code, Claude, Copilot, Antigravity) के लिए अनिवार्य नियम:**
> 1. ElectroMart एक पूर्ण ई-कॉमर्स प्लेटफ़ॉर्म है जो **Amazon India UI/UX लेआउट** और **11 भारतीय भाषाओं (i18n)** पर आधारित है।
> 2. **सख्त ब्रांड व कानूनी सुरक्षा नियम (Strict Legal & Brand Safety Rule):** लेआउट और स्टाइलिंग Amazon जैसी होगी, परंतु वेबसाइट (`electromart.in`) पर **"Amazon" या "अमेज़न"** नाम का उल्लेख किसी भी विज़िबल टेक्स्ट, बैज, डिक्शनरी या विवरण में **पूर्णतः वर्जित (Strictly Prohibited)** है। वेबसाइट का नाम केवल और केवल **ElectroMart (`electromart.in` / इलेक्ट्रोमार्ट)** है।
> 3. किसी भी नए फीचर को जोड़ने या बग फिक्स करने से पहले इस दस्तावेज़ को पूरा पढ़ें ताकि पिछला कोई भी काम प्रभावित न हो।

---

## 1. प्रोजेक्ट आर्किटेक्चर (Core Architecture Overview)

### A. डेटा इंजन (Data Engine & Products Catalog)
- **751 इलेक्ट्रॉनिक्स उत्पाद:** पूरा कैटलॉग दो जगह सिंक्रोनाइज़ रहता है:
  1. `products-data.js` (`window.EM_CATALOG` और `window.EM_CATALOG_MAP`) — फ्रंटएंड के लिए हाई-स्पीड इन-मेमोरी कैटलॉग।
  2. `backend/src/data/db.json` — बैकएंड REST API डेटाबेस।
- **मूल्य निर्धारण (Pricing Convention):**
  - सभी कीमतें **भारतीय रुपयों (₹ INR)** में हैं (जैसे ₹1,399, ₹1,713)।
  - किसी भी एक्सेसरी या प्रोडक्ट की कीमत को मनमाने ढंग से पैसे (paise) या 100 से गुणा/भाग न करें।

### B. अनुवाद इंजन (Multilingual 11-Language i18n Engine)
- **डिक्शनरी:** `translations.js` (हिंदी `hi`, तमिल `ta`, तेलुगु `te`, मराठी `mr`, बंगाली `bn`, गुजराती `gu`, कन्नड़ `kn`, मलयालम `ml`, पंजाबी `pa`, उड़िया `or`, अंग्रेजी `en`)।
- **ट्रांसलेशन बस:** `universal-i18n-bus.js` (DOM म्यूटेशन ऑब्जर्वर जो डायनामिक एलिमेंट्स का भी रियल-टाइम अनुवाद करता है)।
- **लोकल स्टोरेज कीज (Storage Keys):** भाषा को हमेशा दोनों कीज में एक साथ अपडेट करें:
  ```javascript
  localStorage.setItem("electromart_lang_v1", lang);
  localStorage.setItem("electromart_lang", lang);
  ```

### C. बैकएंड और पोर्ट्स (Backend & Ports)
- **बैकएंड API:** Node.js Express (Port `4000`)
- **लाइव फ्रंटएंड:** Live Server / Static (Port `5500`)

---

## 2. स्क्रिप्ट लोडिंग का अनिवार्य क्रम (Script Loading Rule)

प्रत्येक HTML पेज में स्क्रिप्ट्स का क्रम हमेशा इसी क्रम में होना चाहिए:
```html
  <!-- 1. बहुभाषी डिक्शनरी -->
  <script src="translations.js"></script>
  <!-- 2. 751 उत्पादों का कैटलॉग -->
  <script src="products-data.js"></script>
  <!-- 3. रियल-टाइम अनुवाद बस -->
  <script src="universal-i18n-bus.js"></script>
  <!-- 4. अमेज़न ग्लोबल हेडर -->
  <script src="header.js"></script>
  <script src="menu-manager.js"></script>
  <script src="auth-state.js"></script>
  <script src="shared-search.js"></script>
  <!-- 5. इसके बाद ही पेज की मुख्य स्क्रिप्ट लगाएं (उदा. cart.js, orders.js आदि) -->
  <script src="page-specific.js"></script>
</body>
</html>
```
*(ध्यान दें: कोई भी `<script>` टैग `</body>` के बाहर न लगाएं।)*

---

## 3. अनिवार्य प्री-फ्लाइट और पोस्ट-एडिट टेस्ट (Pre-flight & Post-edit Checklist)

किसी भी फाइल में बदलाव करने से पहले और बाद में निम्नलिखित दोनों कमांड चलाएं:

### 1. फ्रंटएंड व i18n टेस्ट (23 Test Suites):
```bash
node C:\Users\Admin\.gemini\antigravity\brain\3644e994-3886-46d5-9cda-45daac2ccdba\scratch\run_all_tests.js
```
*(सभी 23 टेस्ट सूट्स PASS होने चाहिए।)*

### 2. बैकएंड यूनिट टेस्ट्स (74 Unit Tests):
```bash
cd backend
npm run test:unit
```
*(सभी 74 टेस्ट PASS होने चाहिए।)*

---

## 4. अमेज़न इंडिया डिज़ाइन नियम (Amazon India Theme Principles)
> [!CAUTION]
> **ब्रांडिंग एवं ट्रेडमार्क सुरक्षा का सख्त नियम (Strict Brand Compliance Rule):**
> - लेआउट, UI/UX, कलर पैलेट और कार्यप्रणाली **Amazon India स्टाइल** की तरह होगी, लेकिन वेबसाइट पर **"Amazon" या "अमेज़न"** नाम का उल्लेख किसी भी दृश्य (User-Visible) टेक्स्ट, बटन, बैज, डिक्शनरी या विवरण में **कदापि नहीं होना चाहिए**।
> - वेबसाइट का नाम केवल और केवल **ElectroMart / electromart.in / इलेक्ट्रोमार्ट** है।
> - उदाहरण: "Amazon's Choice" के स्थान पर हमेशा **"ElectroMart's Choice" (इलेक्ट्रोमार्ट चॉइस)** होगा।
> - "Amazon style filters" के स्थान पर हमेशा **"ElectroMart Filters" (इलेक्ट्रोमार्ट फ़िल्टर)** होगा।
> - किसी भी नए कोड, कंपोनेंट या अनुवाद में Amazon ब्रांड नाम का प्रयोग वर्जित है।

1. **कीमत ब्लॉक (Price Block):**
   - बड़ा लाल डिस्काउंट प्रतिशत (उदा. `-18%`, रंग: `#cc0c39`, फ़ॉन्ट: 28px)।
   - मुख्य कीमत के ऊपर या साथ में `M.R.P.: ₹...` और `सभी टैक्स सहित (Inclusive of all taxes)`.
   - लाइटनिंग डील पिल: लाल बैकग्राउंड `#cc0c39` के साथ सफेद टेक्स्ट।
2. **ब्रांड लिंक:** `HP स्टोर पर जाएं` (बिना किसी कोलन `:` के)।
3. **हैमबर्गर मेन्यू:** उप-श्रेणी शुद्ध हिंदी में सक्रिय और बैक बटन के साथ।

---

## 5. कार्य समाप्ति चेकपॉइंट (Work Done Checkpoint)
जब आपका काम पूरा हो जाए और सभी टेस्ट पास हो जाएं, तो बदलावों को सुरक्षित रखने के लिए Git Commit अवश्य बनाएं:
```bash
git add .
git commit -m "feat(scope): your descriptive commit message"
```
