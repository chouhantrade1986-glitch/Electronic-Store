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

### 1. फ्रंटएंड व i18n टेस्ट (38 Test Suites):
```bash
node scratch/run_all_tests.js
```
*(सभी 38 टेस्ट सूट्स PASS होने चाहिए, जिसमें 35वां सूट लीगल ब्रांड सेफ्टी गार्डरेल, 37वां सूट ऑथेंटिकेशन और 38वां सूट डिलीवरी लोकेशन मोडल है।)*

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
3. **सर्च बार:**
   - बाईं ओर "All ▾" श्रेणी चयनकर्ता ड्रॉपडाउन (`.nav-search-facade-wrap`).
   - सर्च इनपुट बॉक्स (`#navSearchInput`) का अलग व स्वतंत्र क्लिक/होवर क्षेत्र।
   - दाईं ओर प्रामाणिक अमेज़न येलो/ऑरेंज सर्च लेंस बटन (`#navSearchBtn`).
   - ऑटो-सजेस्ट ड्रॉपडाउन में कीवर्ड हाइलाइटिंग और `See all results for "query"` लिंक।
4. **बाय बॉक्स (Buy Box):**
   - गतिशील फ्री डिलीवरी और टाइमर काउंटडाउन ("Order within X hrs Y mins")।
   - अमेज़न येलो `Add to Cart` (`#ffd814`) और अमेज़न ऑरेंज `Buy Now` (`#ffa41c`) 20px पिल बटन।
5. **हैमबर्गर मेन्यू:** उप-श्रेणी शुद्ध हिंदी में सक्रिय और बैक बटन के साथ।

---

## 5. कार्य समाप्ति चेकपॉइंट (Work Done Checkpoint)
जब आपका काम पूरा हो जाए और सभी टेस्ट पास हो जाएं, तो बदलावों को सुरक्षित रखने के लिए Git Commit अवश्य बनाएं:
```bash
git add .
git commit -m "feat(scope): your descriptive commit message"
```

---

## 6. पूर्ण हो चुके चरण और आगामी रोडमैप (Handover Roadmap)

### A. पूर्ण हो चुके चरण (Phases 1-10 Completed):
- **चरण 1:** Shopping Cart Upgrade (`cart.html`, `cart.js`)
- **चरण 2:** Products Listing & Faceting (`products.html`, `products.js`)
- **चरण 3:** Homepage & Quad Overlap Cards (`index.html`, `homepage-products.js`)
- **चरण 4:** Accordion Checkout 3-Step Flow (`checkout.html`, `checkout.js`)
- **चरण 5:** Your Orders & Tracking Hub (`orders.html`, `orders.js`)
- **चरण 6:** Product Detail Page (PDP) Suite (`product-detail.html`, `product-detail.js`)
- **चरण 7:** Your Account 8-Tile Navigation Hub (`account.html`, `account.js`)
- **चरण 8:** Wishlist Hub (`wishlist.html`, `wishlist.js`, `wishlist.css`): 2-कॉलम लेआउट, मल्टी-लिस्ट, पब्लिक/प्राइवेट टॉगल, प्राइस ड्रॉप अलर्ट, 1-क्लिक Move to Cart।
- **चरण 9:** Authentication Flow (`auth.html`, `auth.js`, `auth.css`): सेंटर्ड ऑथ कार्ड `#authCard`, IN +91 प्रीफ़िक्स, पासवर्ड शो/हाइड टॉगल, Need help अकॉर्डियन, Create account स्विच।
- **चरण 10:** Delivery Location / Pincode Modal (`header.js`, `header.html`, `amazon-theme.css`, `index.html`, `product-detail.js`): 6-डिजिट पिनकोड वैलिडेशन, 11 मेट्रो पिल्स, सेव्ड एड्रेस कार्ड, स्टोर-वाइड रीयल-टाइम सिंक।
- **ब्रांड सुरक्षा:** 100% शुद्ध ElectroMart ब्रांडिंग, 0 दृश्य Amazon टेक्स्ट, स्थायी गार्डरेल टेस्ट (`scratch/test-brand-safety-and-legal-compliance.js`)।

### B. आगामी चरण (Next Recommended Phases for Future Agents):
- **चरण 11 (Deals & Best Sellers Grids - `todays-deals.html`, `best-sellers.html`):** डिपार्टमेंट पिल्स (Electronics, Accessories आदि) और Deal of the Day फीचर्ड ग्रिड।
- **चरण 12 (Seller / Store Admin - `admin-dashboard.html`):** Seller Central स्टाइल डार्क-नेवी डैशबोर्ड और ऑपरेशंस व्यू।

