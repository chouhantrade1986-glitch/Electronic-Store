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

### 1. फ्रंटएंड व i18n टेस्ट (54 Test Suites):
```bash
node scratch/run_all_tests.js
```
*(सभी 54 टेस्ट सूट्स PASS होने चाहिए, जिसमें 35वां सूट लीगल ब्रांड सेफ्टी गार्डरेल, 50वां सूट B2B बल्क पोर्टल, 51वां सूट प्रोडक्ट कंपैरिज़न हब, 52वां सूट कस्टमर रिव्यूज़ व कम्युनिटी Q&A सुइट, 53वां सूट ElectroMart Pay व UPI हब, और 54वां सूट लाइटनिंग डील्स लाइव ड्रॉप्स व काउंटडाउन हब है।)*

### 2. बैकएंड यूनिट टेस्ट्स (74 Unit Tests):
```bash
cd backend
npm run test:unit
```
*(सभी 74 टेस्ट PASS होने चाहिए। कुल 128 / 128 टेस्ट उत्तीर्ण।)*

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

### A. पूर्ण हो चुके चरण (Phases 1-25 Completed):
- **चरण 1:** Shopping Cart Upgrade (`cart.html`, `cart.js`)
- **चरण 2:** Products Listing & Faceting (`products.html`, `products.js`)
- **चरण 3:** Homepage & Quad Overlap Cards (`index.html`, `homepage-products.js`)
- **चरण 4:** Accordion Checkout 3-Step Flow (`checkout.html`, `checkout.js`)
- **चरण 5:** Your Orders & Tracking Hub (`orders.html`, `orders.js`)
- **चरण 6:** Product Detail Page (PDP) Suite (`product-detail.html`, `product-detail.js`)
- **चरण 7:** Your Account 8-Tile Navigation Hub (`account.html`, `account.js`)
- **चरण 8:** Wishlist Hub (`wishlist.html`, `wishlist.js`, `wishlist.css`)
- **चरण 9:** Authentication Flow (`auth.html`, `auth.js`, `auth.css`)
- **चरण 10:** Delivery Location / Pincode Modal (`header.js`, `header.html`, `amazon-theme.css`, `index.html`, `product-detail.js`)
- **चरण 11:** Deals & Best Sellers Dedicated Hubs (`todays-deals.html`, `todays-deals.js`, `best-sellers.html`, `best-sellers.js`)
- **चरण 12:** Seller Central & Store Admin Department Hubs (`admin-dashboard.html`, `admin-orders.html`, `admin-listing.html`, `admin-analytics.html`, `admin-after-sales.html`, `admin-users.html`, `admin-audit.html`, `admin-settings.html`, `admin-shared.js`)
- **चरण 13:** Order Confirmation & Printable GST Tax Invoice (`thank-you.html`, `invoice.html`, `invoice.css`)
- **चरण 14:** Orders Management Hub & Account Addresses Sync (`orders.html`, `account.html`)
- **चरण 15:** Search & Category Filtering Engine (`products.html`, `products.js`)
- **चरण 16:** Cart Flyout & Quick View Occlusion Fix (`amazon-theme.css`, `header.js`, `products.js`)
- **चरण 17:** Amazon India-Style Dedicated Auth & Security Suite (`login.html`, `register.html`, `forgot-password.html`)
- **चरण 18:** ElectroMart Business B2B Bulk Purchase Portal (`business.html`, `business.js`, `business.css`)
- **चरण 19:** Amazon India-Style Product Comparison Hub (`compare.html`, `compare.css`, `compare.js`)
- **चरण 20:** Customer Reviews, Ratings & Community Q&A Suite (`review.html`, `product-detail.html`, `product-detail.js`, `review.js`, `review.css`)
- **चरण 21:** ElectroMart Pay & UPI Hub (`electromart-pay.html`, `electromart-pay.css`, `electromart-pay.js`, `checkout.html`, `checkout.js`)
- **चरण 22:** Lightning Deals Live Drops & Deal Countdown Hub (`todays-deals.html`, `todays-deals.js`, `product-detail.html`, `product-detail.js`, `amazon-theme.css`)
- **चरण 23:** Delivery Tracking Visualizer (`tracking.html`, `tracking.js`, `tracking.css`, `orders.js`, `thank-you.html`, `thank-you.js`)
- **चरण 24:** ElectroMart Prime Membership Hub & Rewards Ecosystem (`prime.html`, `prime.js`, `prime.css`, `header.js`, `account.html`, `cart.js`, `checkout.js`)
- **चरण 25:** Returns & Replacements Center (`returns.html`, `returns.js`, `returns.css`, `orders.js`, `tracking.html`, `tracking.js`): 4-चरणीय रिटर्न विज़ार्ड (आइटम व कारण चयन, रिप्लेसमेंट बनाम रिफंड, डोरस्टेप पिकअप शेड्यूलिंग, पुष्टि व डिजिटल रिटर्न स्लिप), विज़ार्ड स्टेट वैलिडेशन (कारण चयन तक Continue बटन अक्षम), रिप्लेसमेंट पर ₹0 अतिरिक्त ऑर्डर सृजन, इलेक्ट्रोमार्ट पे वॉलेट तत्काल रिफंड क्रेडिट हुक, डायनामिक SVG बारकोड व प्रिंटेबल स्लिप, `orders.html` में हरा "Return Initiated" बैज व सीधा लिंक, `tracking.html` में रिटर्न स्टेटस अलर्ट बैनर, 11 क्षेत्रीय भाषाओं का समर्थन, 100% ब्रांड सुरक्षा और 57/57 टेस्ट सूट्स 100% उत्तीर्ण।
- **ब्रांड सुरक्षा:** 100% शुद्ध ElectroMart ब्रांडिंग, 0 दृश्य Amazon टेक्स्ट, स्थायी गार्डरेल टेस्ट (`scratch/test-brand-safety-and-legal-compliance.js`)।

### B. आगामी चरण (Next Recommended Phases for Future Agents):
- **चरण 26 (Customer Service & Help Center Hub - `help.html` / `contact-us.html`):** अमेज़न इंडिया स्तर का स्व-सेवा सहायता केंद्र, त्वरित समस्या निवारक (Troubleshooter), ऑर्डर-संबंधी त्वरित समाधान, लाइव चैटबॉट और कॉल-बैक शेड्यूलर।


