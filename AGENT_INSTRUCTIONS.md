# ElectroMart — AI Agent Guidelines & Architecture Manual (AI एजेंट दिशा-निर्देश)

> [!IMPORTANT]
> **सभी AI एजेंट्स (VS Code, Claude, Copilot, Antigravity) के लिए अनिवार्य नियम:**
> 1. ElectroMart एक पूर्ण ई-कॉमर्स प्लेटफ़ॉर्म है जो परिचित भारतीय marketplace UX patterns और **11 भारतीय भाषाओं (i18n)** पर आधारित है।
> 2. **सख्त ब्रांड व कानूनी सुरक्षा नियम (Strict Legal & Brand Safety Rule):** वेबसाइट (`electromart.in`) के किसी भी customer-facing text, badge, dictionary value, alt/title/placeholder/aria label, tooltip, generated label या नए documentation content में किसी third-party marketplace का नाम नहीं आना चाहिए। वेबसाइट का नाम केवल **ElectroMart (`electromart.in` / इलेक्ट्रोमार्ट)** है।
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
- **डिक्शनरी:** `translations.js` (हिंदी `hi`, तमिल `ta`, तेलुगु `te`, मराठी `mr`, बंगाली `bn`, गुजराती `gu`, कन्नड़ `kn`, मलयालम `ml`, पंजाबी `pa`, उर्दू `ur`, अंग्रेजी `en`)।
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

### 1. फ्रंटएंड व i18n टेस्ट (71 Test Suites):
```bash
node scratch/run_all_tests.js
```
*(सभी 71 टेस्ट सूट्स PASS होने चाहिए, जिसमें Phase 38 ElectroMart Launchpad Hub और सभी regression/guardrail सूट्स शामिल हैं।)*

### 2. बैकएंड यूनिट टेस्ट्स (74 Unit Tests):
```bash
cd backend
npm run test:unit
```
*(सभी 74 टेस्ट PASS होने चाहिए। वर्तमान लक्ष्य कुल 145 / 145 टेस्ट उत्तीर्ण है।)*

---

## 4. ElectroMart marketplace UX design rules
> [!CAUTION]
> **ब्रांडिंग एवं ट्रेडमार्क सुरक्षा का सख्त नियम (Strict Brand Compliance Rule):**
> - Layout, UX, pricing hierarchy और interaction patterns existing ElectroMart conventions के अनुरूप रहें।
> - Website, translations और नए documentation में केवल **ElectroMart / electromart.in / इलेक्ट्रोमार्ट** branding रखें।
> - किसी third-party marketplace का नाम नए code, component, translation, customer copy या legal-facing content में न जोड़ें।
> - Existing legacy test filenames, compatibility keys और historical internal records को केवल backward compatibility के लिए रखें; वे customer-facing output में कभी render नहीं होने चाहिए।

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
- **चरण 25:** Returns & Replacements Center (`returns.html`, `returns.js`, `returns.css`, `orders.js`, `tracking.html`, `tracking.js`): 4-चरणीय रिटर्न विज़ार्ड (आइटम व कारण चयन, रिप्लेसमेंट बनाम रिफंड, डोरस्टेप पिकअप शेड्यूलिंग, पुष्टि व डिजिटल रिटर्न स्लिप), विज़ार्ड स्टेट वैलिडेशन, रिप्लेसमेंट पर ₹0 अतिरिक्त ऑर्डर सृजन, इलेक्ट्रोमार्ट पे वॉलेट तत्काल रिफंड क्रेडिट, डायनामिक SVG बारकोड व प्रिंटेबल स्लिप, `orders.html` व `tracking.html` क्रॉस-पेज सिंक, 11 भाषाएं और 100% ब्रांड सुरक्षा।
- **चरण 26:** 24x7 Customer Service & Help Center Hub (`help.html`, `help.js`, `help.css`, `contact-us.html`): अमेज़न इंडिया स्तर का स्व-सेवा सहायता केंद्र, एक्टिव ऑर्डर क्विक हेल्प विजेट (ट्रैक पैकेज, रिटर्न/रिप्लेस, इनवॉइस, रिपोर्ट इशू), नो-ऑर्डर पर स्वच्छ फॉलबैक, 6-कोर हेल्प कैटेगरीज ग्रिड (Your Orders, Returns & Refunds, Payment & Wallet, Prime Membership, Account Settings, Safe Shopping), 18+ एफएक्यू प्रश्नों के साथ स्मार्ट सर्च लाइब्रेरी व कीवर्ड हाइलाइटिंग, 24x7 सपोर्ट चैनल्स (ElectroMart Assistant इंटरेक्टिव लाइव चैट विथ एजेंट ट्रांसफर, 2-मिनट इंस्टेंट कॉलबैक टाइमर विथ मेमोरी लीक प्रिवेंशन, अद्वितीय टिकट जनरेटर `EM-TKT-XXXXX`), `Escape` की व बैकड्रॉप डिस्मिसल, 11 भारतीय भाषाओं में पूर्ण डिक्शनरी और 58/58 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 27:** ElectroMart Wishlist & Multi-List Registry Suite (`registry.html`, `registry.js`, `registry.css`, `wishlist.html`, `wishlist.js`, `wishlist.css`): अमेज़न इंडिया स्तर का मल्टी-लिस्ट विशलिस्ट व गिफ्ट रजिस्ट्री हब। 3 सेलिब्रेशन कैटेगरीज (Birthday & Milestone, Wedding & Housewarming, Tech Workspace & Student Setup), एक्टिव रजिस्ट्री डैशबोर्ड, लाइव इवेंट काउंटडाउन टाइमर विथ मेमोरी लीक प्रिवेंशन (`clearInterval` on unload), प्रोग्रेस व गोल ट्रैकर (% fulfilled bar, stats strip), 1-क्लिक शेयर लिंक व व्हाट्सएप शेयरिंग, इन-पेज गिफ्टिंग इंजन (कार्ट सिंक विथ गिफ्ट टैग व रजिस्ट्री प्रोग्रेस रीकैलकुलेशन), 751-आइटम कैटलॉग पिकर मोडल विथ सर्च व कैटेगरी पिल्स, क्रिएट रजिस्ट्री मोडल (शीर्षक, श्रेणी, तारीख, होस्ट, पता, प्राइवेसी), विशलिस्ट आइटम प्रायोरिटी बैजेस (High, Medium, Low), पर्सनल नोट्स बॉक्स, मूव-टू-अदर-लिस्ट ड्रॉपडाउन, `electromart_wishlist_v1` स्ट्रिंग ऐरे के साथ 100% बैकवर्ड कम्पैटिबिलिटी व स्टेट सिंक, 11 भारतीय भाषाओं में पूर्ण डिक्शनरी और 59/59 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 28:** ElectroMart Verified Customer Reviews Video & Photo Gallery Hub (`customer-media.html`, `customer-media.js`, `customer-media.css`, `product-detail.html`, `product-detail.js`, `product-detail.css`): अमेज़न इंडिया स्तर का सत्यापित ग्राहक वीडियो व फोटो गैलरी हब। हीरो बैनर विथ लाइव स्टैट्स (कुल अपलोड्स, हाई-रेज़ तस्वीरें, अनबॉक्सिंग वीडियोज़, सत्यापित खरीदार प्रतिशत), मीडिया टाइप पिकर (All, Photos Only, Videos Only), लाइव सर्च व 6 कैटेगरी पिल्स, 3-वे सॉर्ट (Most Recent, Most Helpful, Highest Rated), रेस्पॉन्सिव मेसनरी कार्ड्स विथ वीडियो प्ले ओवरले व सटीक ड्यूरेशन बैजेस (`▶ 0:48`), 2-कॉलम फुल-स्क्रीन लाइटबॉक्स मोडल विथ कीबोर्ड नेविगेशन (`ArrowLeft`, `ArrowRight`, `Escape`) व थंबनेल स्क्रबर स्ट्रिप, ऑडियो/वीडियो मेमोरी हाइजीन (`stopActiveVideoPlayback` विथ पॉज़, `removeAttribute('src')`, और `load()`), 1-क्लिक हेल्पफुल वोटिंग (`electromart_helpful_votes_v1`), इन-मोडल 1-क्लिक कार्ट एड (`electromart_cart_v1`) विथ लाइव हेडर बैज सिंक, कस्टमर अपलोड मोडल विथ ड्रैग-एंड-ड्रॉप ज़ोन व लाइव प्रीव्यूज़, PDP डीप-लिंकिंग (`#customerMediaGallery` स्ट्रिप, वीडियो ड्यूरेशन बैज, क्लिक-टू-लाइटबॉक्स, और `customer-media.html?productId=...` फ़िल्टर लिंक), हेडर, अकाउंट व साइटमैप इंटीग्रेशन, 11 भारतीय भाषाओं में 48+ कीज़, और 60/60 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 29:** ElectroMart 3D Showroom & Virtual Workspace Studio (`showroom.html`, `showroom.js`, `showroom.css`, `workspace-builder.html`, `workspace-builder.js`, `workspace-builder.css`, `product-detail.html`, `product-detail.js`, `product-detail.css`): अमेज़न इंडिया स्तर का 360° इंटरैक्टिव टर्नटेबल व्यूअर विथ इनर्शियल ड्रैग/टच रोटेशन (`requestAnimationFrame`), लाइव एंगल डिस्प्ले (`0°..359°`), 4 इंटरेक्टिव हार्डवेयर हॉटस्पॉट एनोटेशन्स विथ ऑर्बिट कोऑर्डिनेट्स व पॉपओवर, 4 फिनिश कलर्स स्विचर, एआर/रूम स्केल सिम्युलेटर मोडल (4 बैकड्रॉप्स, 4 लाइटिंग मोड्स, डायमेंशन मेजरमेंट टेप, स्केल स्लाइडर), 6-स्लॉट मॉड्यूलर वर्चुअल वर्कस्पेस स्टूडियो विथ 2.5D डेस्क कैनवास, 4 क्विक प्रीसेट्स, पोर्ट्स व पावर वॉटेज हेडरुम कम्पैटिबिलिटी इंजन, 10% बंडल डिस्काउंट व 18% जीएसटी ब्रेकडाउन, 1-क्लिक कम्प्लीट सेटअप कार्ट सिंक, शेयरेबल URL स्टेट, PDP डीप-लिंक फ्लो, 11 भाषाएं और 61/61 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 30:** ElectroMart Device Trade-In & Exchange Hub (`exchange.html`, `exchange.js`, `exchange.css`, `product-detail.html`, `product-detail.js`, `product-detail.css`, `cart.html`, `cart.js`, `checkout.html`, `checkout.js`, `orders.js`, `tracking.html`, `tracking.js`): अमेज़न इंडिया स्तर का डिवाइस ट्रेड-इन व एक्सचेंज हब। 4-चरणीय डायनामिक वैल्यूएशन कैलकुलेटर (5 कैटेगरीज़: स्मार्टफ़ोन, लैपटॉप, टैबलेट, स्मार्टवॉच, ऑडियो), 30+ प्रीमियम मॉडल्स कैटलॉग, 3-पॉइंट कंडीशन असेसमेंट, अप-टू ₹25,000 डिस्काउंट + ₹1,000 इलेक्ट्रोमार्ट ट्रेड-इन बोनस, ट्रेड-इन वाउचर कोड (`EM-EX-XXXXXX`), डोरस्टेप हैंडओवर चेकलिस्ट व FAQ, PDP बायबॉक्स रेडियो टॉगल ("Without Exchange" vs "With Exchange"), 6-डिजिट पिनकोड वैलिडेटर, इन-पेज वैल्यूएशन मोडल विथ 15-डिजिट IMEI / 6-18 कैरेक्टर सीरियल नंबर वैलिडेशन, रियल-टाइम इफेक्टिव प्राइस रिफ्लेक्शन, कार्ट व चेकआउट ऑर्डर समरी में एक्सचेंज डिस्काउंट डिडक्शन, डिलीवरी बॉय हैंडओवर नोटिस, ऑर्डर ऑब्जेक्ट में `exchangeDetails` रिकॉर्डिंग, ऑर्डर्स हिस्ट्री बैज, लाइव डिलीवरी ट्रैकिंग हैंडओवर चेकलिस्ट बैनर, 11 भाषाएं और 62/62 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 31:** ElectroMart Certified Renewed Electronics Hub (`renewed.html`, `renewed.js`, `renewed.css`, `product-detail.html`, `product-detail.js`, `product-detail.css`, `cart.js`, `checkout.js`, `invoice.js`): अमेज़न रिन्यूड स्तर का सर्टिफाइड रीफर्बिश्ड स्टोर। 24 प्रीमियम एसकेयू (ग्रेड ए 90%+, ग्रेड बी 85%+, ग्रेड सी 80%+ बैटरी हेल्थ), 47-पॉइंट डायग्नोस्टिक क्वालिटी चेक, पर्सनल इको-इम्पैक्ट कैलकुलेटर (ई-वेस्ट, कार्बन, ट्रीज़), पीडीपी अल्टरनेटिव बॉक्स, इनवॉइस व कार्ट 6-महीने वारंटी इंटीग्रेशन, 11 भाषाएं और 63/63 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 32:** ElectroMart Protect & Care Warranty Hub (`warranty.html`, `warranty.css`, `warranty.js`, `product-detail.html`, `product-detail.js`, `cart.js`, `checkout.js`, `invoice.js`, `orders.js`): डिवाइस प्रोटेक्शन प्लान (ElectroMart Protect व ElectroMart Care), कैशलेस रिपेयर, 3-चरणीय क्लेम विज़ार्ड (`EM-CLM-XXXXX`), पीडीपी ऐड-ऑन, सैक 998714 व 18% जीएसटी इनवॉइस, 11 भाषाएं और 64/64 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 33:** ElectroMart Electronics Recycling & E-Waste Pickup Hub (`ewaste.html`, `ewaste.js`, `ewaste.css`): ई-कचरा प्रबंधन, फ्री डोरस्टेप पिकअप शेड्यूलिंग, ग्रीन रिवॉर्ड पॉइंट्स व कूपन क्रेडिट, और रीसाइक्लिंग सर्टिफिकेट जनरेटर।
- **चरण 34:** Frequently Bought Together (FBT) & Smart Bundle Engine (`bundle-engine.js`, `product-detail.html`, `product-detail.js`): ऑटो-पेयरिंग स्मार्ट बंडल इंजन, स्टॉक-अवेयर फॉलबैक्स, बंडल डिस्काउंट डिडक्शन।
- **चरण 35:** ElectroMart Live Shopping & Stream Hub (`live-shopping.html`, `live-shopping.js`, `live-shopping.css`): इंटरएक्टिव वीडियो प्लेयर, होस्ट व वेरिफाइड बायर चैट, फ्लैश डील्स और पीडीपी कॉलआउट।
- **चरण 36:** Smart Home & IoT Appliance Ecosystem Hub (`smarthome.html`, `smarthome.js`, `smarthome.css`): रूम व इकोसिस्टम विज़ुअलाइज़र, कम्पैटिबिलिटी चेकर, रूटीन प्रीव्यूज़, और 1-क्लिक कार्ट एडिशन।
- **चरण 37:** ElectroMart Global Store & Cross-Border Delivery Hub (`global.html`, `global.css`, `global.js`, `product-detail.html`, `product-detail.js`): 5% सीमा शुल्क व 18% IGST कैलकुलेटर, स्टैंडर्ड (₹499) व एक्सप्रेस (₹1,299) फ्रेट, पासपोर्ट/आधार/DL KYC सत्यापन पोर्टल विथ मास्किंग, 100% DDP गारंटी, पीडीपी बायबॉक्स एकीकरण, 11 भाषाएं और 71/71 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 38:** ElectroMart Launchpad & Innovative Tech Hub (`launchpad.html`, `launchpad.css`, `launchpad.js`, `product-detail.html`, `product-detail.js`, `product-detail.css`, `header.html`, `header.js`, `sitemap.xml`): उभरते भारतीय हार्डवेयर स्टार्टअप्स के लिए शोकेस, नामांकित ऑफर IDs, INR pricing/MRP/early-bird reservation flow, funding progress, category filters, product details modal, सुरक्षित application persistence, 11 भाषाएं और deterministic PDP callout; 71/71 frontend suites तथा 74/74 backend unit tests PASS।
- **ब्रांड सुरक्षा:** 100% शुद्ध ElectroMart ब्रांडिंग, 0 दृश्य Amazon टेक्स्ट, स्थायी गार्डरेल टेस्ट (`scratch/test-brand-safety-and-legal-compliance.js`)।

### B. आगामी चरण (Next Recommended Phases for Future Agents):
- **अगला चरण:** अगले roadmap feature का स्कोप उपयोगकर्ता द्वारा निर्देशित किए जाने पर तय किया जाएगा; Phase 38 के बाद नया duplicate launcher या project folder नहीं बनाया जाएगा।

---

## Universal Agent Rules & Execution Guidelines Framework

### 1. Workspace and directory integrity
- The single source of truth is `C:\Users\Admin\Documents\GitHub\Electronic-Store`.
- All agents and tools must work inside this project directory only.
- Do not create parallel project folders, copied worktrees, or duplicate project directories.
- Do not create duplicate source files such as `product-detail-v2.html`, `copy_cart.js`, or `test_new.js`; edit the owning project files directly.

### 2. Code stability and overwrite protection
- Read the relevant local code path and its nearby tests before deleting, replacing, or substantially rewriting working logic.
- Preserve existing behavior, public DOM contracts, storage schemas, and backward compatibility unless the approved feature explicitly requires a change.
- Preserve the required script order: `translations.js` -> `products-data.js` -> `universal-i18n-bus.js` -> `header.js` -> `menu-manager.js` -> `auth-state.js` -> `shared-search.js` -> page-specific JavaScript.
- Keep all script tags inside the document body and load page-specific scripts only after shared dependencies.
- Put new globals under the approved `window.ElectroMart` namespace or keep them inside a local scope; avoid unrelated global variables and function collisions.

### 2A. Single website and canonical launch policy
- The only canonical application root is `C:\Users\Admin\Documents\GitHub\Electronic-Store`.
- The only canonical launch command is `npm start`, which runs `launch-electromart.js`.
- `launch-electromart.js` is the single owner of local service startup: frontend `http://127.0.0.1:5500/index.html` and backend API `http://127.0.0.1:4000/api`.
- Existing `.bat`, `.ps1`, QA, smoke, and release scripts are wrappers or verification tools; they must not be treated as separate website entry points.
- Do not create any new launcher, server, `index` copy, alternate frontend root, duplicate project folder, or parallel static-server configuration without explicit approval.
- Before starting services, check whether ports `5500` or `4000` are already occupied; reuse the canonical service or stop only the process created by the current task.
- A Git worktree is not a second deployable website. Agents must not edit `Electronic-Store.worktrees` for the main project task and must not register another worktree or branch as a substitute for the canonical root.

### 3. Data, tax, and brand safety
- Use existing approved localStorage keys and schemas. New keys require a clear feature-specific need and the `electromart_*_v1` convention.
- Do not alter GST/HSN product calculations or warranty/service tax rules without explicit scope and focused tests.
- Customer-visible UI, translations, badges, tooltips, generated labels, legal-facing content, and new documentation must use ElectroMart branding only and must not expose third-party marketplace names.
- Before completing work, run `scratch/test-brand-safety-and-legal-compliance.js`; any customer-visible third-party marketplace reference is a release blocker.

### 4. Multilingual i18n
- Keep all 11 supported language dictionaries centralized in `translations.js`: `en`, `hi`, `ta`, `te`, `kn`, `ml`, `bn`, `mr`, `ur`, `pa`, and `gu`.
- Do not create separate translation files for feature labels.
- Preserve the dual-write language storage convention for `electromart_lang_v1` and `electromart_lang`.

### 5. TDD and quality gates
- Before changing code, run the existing frontend and backend pre-flight suites when the environment permits.
- For every new feature, create and run a focused failing test before implementation.
- After implementation, run the focused test first, then `node scratch/run_all_tests.js`, then `cd backend; npm run test:unit`.
- Work is not complete until the focused suite and both regression suites pass, or a blocker is explicitly documented.

### Mandatory agent directive

> सभी AI एजेंट ध्यान दें: प्रत्येक कार्रवाई मुख्य प्रोजेक्ट डायरेक्टरी `C:\Users\Admin\Documents\GitHub\Electronic-Store` में ही करें। नई duplicate files या project copies न बनाएं, पुराने working code और script order को सुरक्षित रखें, और काम समाप्त करने से पहले focused तथा full regression tests चलाकर परिणाम दर्ज करें।
>
> वेबसाइट launch करने के लिए केवल `npm start` और `launch-electromart.js` का उपयोग करें। नया launcher, alternate frontend root, duplicate `index.html`, parallel server या दूसरा project folder बनाना निषिद्ध है।
