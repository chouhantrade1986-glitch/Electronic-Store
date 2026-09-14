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

### A. पूर्ण हो चुके चरण (Phases 1-24 Completed):
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
- **चरण 11:** Deals & Best Sellers Dedicated Hubs (`todays-deals.html`, `todays-deals.js`, `best-sellers.html`, `best-sellers.js`): डिपार्टमेंट पिल बार (`#dealsDeptBar`, `#bestSellersDeptBar`), डील टाइप पिल्स (`#dealTypeBar`), स्पॉटलाइट शोकेस कार्ड विथ लाइव टाइमर व क्लेम बार (`#dealsSpotlightBanner`), और पोडियम रैंक रिबन्स (`.amz-rank-badge` `#1`, `#2`, `#3`, general)।
- **चरण 12:** Seller Central & Store Admin Department Hubs (`admin-dashboard.html`, `admin-orders.html`, `admin-listing.html`, `admin-analytics.html`, `admin-after-sales.html`, `admin-users.html`, `admin-audit.html`, `admin-settings.html`, `admin-shared.js`): प्रामाणिक अमेज़न सेलर सेंट्रल डार्क नेवी लेआउट, 8 अलग-अलग समर्पित विभाग, ईज़ी शिप, 751 SKU इन्वेंट्री एडिटर।
- **चरण 13:** Order Confirmation & Printable GST Tax Invoice (`thank-you.html`, `invoice.html`, `invoice.css`): A4 प्रिंट मीडिया सपोर्ट, CGST/SGST/IGST ब्रेकडाउन।
- **चरण 14:** Orders Management Hub & Account Addresses Sync (`orders.html`, `account.html`): "Ship To" पॉपओवर, "View order details" मोडल, रीयल-टाइम एड्रेस सिंक।
- **चरण 15:** Search & Category Filtering Engine (`products.html`, `products.js`): 6-कैटेगरी डिपार्टमेंट ट्री, एक्टिव फ़िल्टर चिप्स, प्राइस रेंज, कर्सर लॉकिंग।
- **चरण 16:** Cart Flyout & Quick View Occlusion Fix (`amazon-theme.css`, `header.js`, `products.js`): ज़ीरो-ऑक्लूजन डिफ़ॉल्ट हिडन स्टेट्स, विशलिस्ट हार्ट आइकॉन संगति।
- **चरण 17:** Amazon India-Style Dedicated Auth & Security Suite (`login.html`, `register.html`, `forgot-password.html`): 2-स्टेप प्रोग्रेसिव लॉगिन, +91 मोबाइल, शो/हाइड पासवर्ड।
- **चरण 18:** ElectroMart Business B2B Bulk Purchase Portal (`business.html`, `business.js`, `business.css`): 15-अंकीय GSTIN सत्यापन, बल्क डिस्काउंट टियर्स (5%, 10%, 15%), RFQ पोर्टल।
- **चरण 19:** Amazon India-Style Product Comparison Hub (`compare.html`, `compare.css`, `compare.js`): 4-स्लॉट तुलना मैट्रिक्स, डायनामिक "Highlight Differences" टॉगल, 751-कैटलॉग त्वरित उत्पाद चयन मोडल, 1-क्लिक कार्ट एडिशन, 11-भाषा अनुवाद व स्वचालित टेस्ट सूट (`scratch/test-amazon-compare-hub.js`)।
- **चरण 20:** Customer Reviews, Ratings & Community Q&A Suite (`review.html`, `product-detail.html`, `product-detail.js`, `review.js`, `review.css`): 5-स्टार इंटरएक्टिव रेटिंग, फोटो अपलोड्स, कम्युनिटी Q&A लाइव सर्च, हिस्टोग्राम स्टार फ़िल्टरिंग, और टेस्ट सूट (`scratch/test-amazon-reviews-and-qa.js`)।
- **चरण 21:** ElectroMart Pay & UPI Hub (`electromart-pay.html`, `electromart-pay.css`, `electromart-pay.js`, `checkout.html`, `checkout.js`): लाइव वॉलेट बैलेंस, 1-क्लिक ऑटो-रीलोड, त्वरित ऐड-मनी प्रीसेट्स, वर्चुअल UPI ID (`user@electromart`), Bharat QR स्कैनर सिम्युलेटर मोडल, पेंडिंग कलेक्ट रिक्वेस्ट्स अप्रूवल, कैशबैक स्क्रैच कार्ड विजेट, सर्च/फ़िल्टर-सक्षम पासबुक, चेकआउट में लाइव बैलेंस बैज, अपर्याप्त बैलेंस लाल चेतावनी व शॉर्टफॉल गणना, 1-क्लिक इंस्टेंट पेमेंट और 5% कैशबैक रिवार्ड।
- **चरण 22:** Lightning Deals Live Drops & Deal Countdown Hub (`todays-deals.html`, `todays-deals.js`, `product-detail.html`, `product-detail.js`, `amazon-theme.css`): लाइव डील स्टेटस सब-टैब्स (`#dealStatusTabs`: Live Now, Upcoming Drops, Waitlist Available), लाइटनिंग ड्रॉप्स शेड्यूल टाइमलाइन स्लॉट बार (`#lightningDropsSchedule`, `#dropsSchedulePills`: 1h, 3h, tomorrow, all), रियल-टाइम क्लेम्ड प्रतिशत मीटर (≥75% अर्जेंट फ्लेम वार्निंग, 100% फुल/वेटलिस्ट), मेमोरी-लीक फ्री काउंटडाउन टाइमर, वेटलिस्ट प्रबंधन प्रणाली (`electromart_deal_waitlists_v1`, queue position tracking, join/leave, floating toast notifications), अपकमिंग ड्रॉप्स अनुस्मारक अलर्ट सिस्टम (`electromart_deal_alerts_v1`, 1-क्लिक Remind Me toggle), पीडीपी सिंक (`#pdpLightningDealBox`), 11-भाषा अनुवाद व स्वचालित टेस्ट सूट (`scratch/test-amazon-lightning-deals.js`)।
- **चरण 23:** Delivery Tracking Visualizer (`tracking.html`, `tracking.js`, `tracking.css`, `orders.js`, `thank-you.html`, `thank-you.js`): 4-स्टेज माइलस्टोन स्टेपर (8%, 33%, 66%, 100% प्रोग्रेस बार, एक्टिव पल्स एनिमेशन), कैरियर व AWB ट्रैकिंग ID विथ 1-क्लिक कॉपी बटन, मल्टी-फैसिलिटी एक्टिविटी टाइमलाइन अकॉर्डियन, डिलीवरी इंस्ट्रक्शंस मोडल सिंक (`electromart_delivery_instructions_v1`), कैंसलेशन मोडल, URL फॉलबैक व एम्प्टी स्टेट, 11 भारतीय भाषाओं में अनुवाद व समर्पित टेस्ट सूट (`scratch/test-amazon-delivery-tracking.js`)।
- **चरण 24:** ElectroMart Prime Membership Hub & Rewards Ecosystem (`prime.html`, `prime.js`, `prime.css`, `header.js`, `account.html`, `cart.js`, `checkout.js`): समरुप प्राइम हब, 30-दिवसीय निःशुल्क ट्रायल, 3-टियर प्लान्स (मासिक ₹299, वार्षिक ₹1,499 [BEST VALUE 58% रिबन], लाइट ₹799), कुल संचयी बचत ट्रैकर विजेट (डिलीवरी शुल्क, 5% पे कैशबैक, डील्स छूट), 6 प्रमुख लाभ कार्ड्स, प्लान चेंज व कैंसल/पॉज़ मोडल्स विथ एस्केप/बैकड्रॉप लॉजिक, हेडर प्राइम क्राउन बैज (`👑 Prime`), कार्ट व चेकआउट में एक्सप्रेस डिलीवरी शुल्क वेवर, 11 भारतीय भाषाओं में अनुवाद व समर्पित टेस्ट सूट (`scratch/test-amazon-prime-hub.js`, 56/56 टेस्ट सूट्स 100% पास)।
- **ब्रांड सुरक्षा:** 100% शुद्ध ElectroMart ब्रांडिंग, 0 दृश्य Amazon टेक्स्ट, स्थायी गार्डरेल टेस्ट (`scratch/test-brand-safety-and-legal-compliance.js`)।

### B. आगामी चरण (Next Recommended Phases for Future Agents):
- **चरण 25 (Returns & Replacements Center - `returns.html`):** अमेज़न इंडिया स्तर का 7-दिवसीय रिप्लेसमेंट व रिटर्न हब, दोष/क्षति कारण चयनकर्ता, डोरस्टेप पिकअप शेड्यूलिंग, तत्काल वॉलेट/सोर्स रिफंड मोड चयन और पिकअप बारकोड जनरेटर।


