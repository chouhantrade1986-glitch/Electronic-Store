# ElectroMart — AI Agent Guidelines & Architecture Manual (AI एजेंट दिशा-निर्देश)

> [!IMPORTANT]
> **सभी AI एजेंट्स (VS Code, Claude, Copilot, Antigravity) के लिए अनिवार्य नियम:**
> 1. ElectroMart एक पूर्ण ई-कॉमर्स प्लेटफ़ॉर्म है जो परिचित भारतीय marketplace UX patterns और **11 भारतीय भाषाओं (i18n)** पर आधारित है।
> 2. **सख्त ब्रांड व कानूनी सुरक्षा नियम (Strict Legal & Brand Safety Rule):** वेबसाइट (`electromart.in`) के किसी भी customer-facing text, badge, dictionary value, alt/title/placeholder/aria label, tooltip, generated label या नए documentation content में किसी third-party marketplace का नाम नहीं आना चाहिए। वेबसाइट का नाम केवल **ElectroMart (`electromart.in` / इलेक्ट्रोमार्ट)** है।
> 3. किसी भी नए फीचर को जोड़ने या बग फिक्स करने से पहले इस दस्तावेज़ को पूरा पढ़ें ताकि पिछला कोई भी काम प्रभावित न हो।

> **Current handover:** Before continuing project work, read [`PROJECT_HANDOVER_ROADMAP.md`](./PROJECT_HANDOVER_ROADMAP.md) for verified commits, local encrypted-data protections, CI state, and the ordered next steps. Its data-preservation rules are mandatory.

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

### 1. फ्रंटएंड व i18n टेस्ट (85 Test Suites):
```bash
node scratch/run_all_tests.js
```
*(सभी 85 टेस्ट सूट्स PASS होने चाहिए, जिसमें Phase 50 Reviews & Q&A, Phase 49 Recommendations Engine, Phase 48 Buy Again Hub, Phase 46 Digital Gift Cards Hub, Phase 45 Corporate Gifting Hub, और सभी regression/guardrail सूट्स शामिल हैं।)*

### 2. बैकएंड यूनिट टेस्ट्स (174 Unit Tests):
```bash
npm --prefix backend run test:unit
```
*(सभी 174 टेस्ट PASS होने चाहिए। वर्तमान लक्ष्य 85 frontend suites + 174 backend unit tests = 259 total passing checks है।)*

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

### A. पूर्ण हो चुके चरण (Phases 1-40 Completed):
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
- **चरण 39:** ElectroMart Gaming & eSports Arena (`gaming.html`, `gaming.css`, `gaming.js`, `product-detail.html`, `product-detail.js`, `product-detail.css`): dark cyber/neon arena थीम, कस्टम रिग कॉन्फ़िग्युरेटर (CPU/GPU/RAM/storage/resolution), deterministic FPS अनुमानक (`window.ElectroMart.Gaming.calculateFpsEstimate`), ई-स्पोर्ट्स व क्रिएटर स्पॉन्सरशिप पोर्टल (bounded local persistence), namespaced `gaming-rig-*`/`gaming-gear-*` कार्ट इंटीग्रेशन, deterministic PDP callout, 11 भाषाएं; `scratch/test-amazon-gaming-arena.js` PASS (8/8), 73/73 frontend suites तथा 74/74 backend unit tests PASS (147/147 total)।
- **चरण 40:** ElectroMart Student & Educator Campus Store (`edu-store.html`, `edu-store.css`, `edu-store.js`)
- **चरण 41:** ElectroMart B2B Corporate Bulk Trade-In Hub (`trade-in.html`, `trade-in.css`, `trade-in.js`)
- **चरण 42:** ElectroMart Loyalty & Rewards Marketplace (`loyalty.html`, `loyalty.css`, `loyalty.js`)
- **चरण 43:** ElectroMart Subscription & Recurring Orders Hub (`subscriptions.html`, `subscriptions.css`, `subscriptions.js`)
- **चरण 44:** ElectroMart BNPL & EMI Hub (`emi.html`, `emi.css`, `emi.js`)
- **चरण 45:** ElectroMart Corporate Gifting & Bulk Orders Hub (`corporate-gifting.html`, `corporate-gifting.css`, `corporate-gifting.js`)
- Corporate registries backend `/api/corporate/registry` पर authenticated बनें; owner/organization authorization या scoped share token के बिना read/update न हों। Registry data localStorage में authoritative रूप से न रखें; GSTIN format validation को external GST registration verification न मानें।
- **चरण 46–47:** ElectroMart Digital Gift Cards Hub (`gift-cards.html`, `gift-cards.css`, `gift-cards.js`): इंटरएक्टिव कार्ड प्रिव्यू और कस्टमाइजेशन; claim code केवल captured online payment के बाद backend `crypto.randomBytes(12).toString('hex')` से जारी करे। Redemption, balance और user identity server-authoritative हों; checkout में Gift Card तथा वैकल्पिक wallet रकम server पर reserve हों और केवल शेष `amountDue` payment gateway को भेजें। Client-supplied amount/user ID को भरोसेमंद न मानें।
- **desktops.html UI पॉलिश (Quick Fix):** Amazon-स्टाइल पॉलिश (`desktops.css`, `scratch/test-desktops-ui.js`)
- **ब्रांड सुरक्षा:** 100% शुद्ध ElectroMart ब्रांडिंग, 0 दृश्य third-party marketplace टेक्स्ट, स्थायी गार्डरेल टेस्ट (`scratch/test-brand-safety-and-legal-compliance.js`)।

- **चरण 47:** ElectroMart Dedicated Coupons & Promo Deals Hub (`coupons.html`, `coupons.js`, `coupons.css`, `checkout.js`, `orderCommerce.js`): Amazon Coupons Hub स्तर का टीयर-टिकट कूपन कार्ड्स इंटरफ़ेस, 1-क्लिक 'Clip Coupon' / 'Clipped ✓' इंटरेक्टिव बैज, `electromart_clipped_coupons_v1` लोकल सिंक, चेकआउट ऑटो-अप्लाई चिप्स बार, सर्वर-ऑथॉरिटेटिव डिस्काउंट वैलिडेशन (`GET /api/orders/coupons`, `POST /api/orders/coupons/validate`), 11 भाषाएं और 82/82 टेस्ट सूट्स 100% उत्तीर्ण।
- **चरण 48:** ElectroMart Buy Again & Fast Reorder Hub (`buy-again.html`, `buy-again.js`, `buy-again.css`): authenticated `/api/orders/my` history aggregation, स्पष्ट sample catalog fallback, purchase frequency and last-order badges, catalog price-drop comparison, quantity-aware cart/checkout actions, date/category filters, shared navigation, sitemap entry, 11-language dictionary, and `scratch/test-amazon-phase48.js` regression coverage.
- **चरण 49:** ElectroMart Personalized Recommendations & Frequently Viewed Together Engine (`recommendations.js`, `recommendations.css`, `index.html`, `product-detail.html`, `product-detail.js`): deterministic, local browsing-affinity ranking with an in-stock catalog fallback, bounded on-device co-view signals, homepage and product-detail carousels, 11-language customer copy, and `scratch/test-amazon-phase49.js` contract coverage.

### B. आगामी चरण (Next Recommended Phases for Future Agents):
- **Phase 50 Customer Reviews, Verified Ratings & Community Q&A:** `productReviewRoutes.js` provides public review listing plus authenticated submission and idempotent helpful votes. Verified purchase status comes from the signed-in user's paid/delivered order; reviewer names use contextual PII encryption. `reviews.js` is the shared API client, while the existing product detail review and Q&A experience remains the canonical UI. `scratch/test-amazon-phase50.js` verifies page wiring, filters, API contract, PII rule, i18n, and branding; backend integration coverage lives in `backend/tests/product-reviews.test.js`.

---

## Universal Agent Rules & Execution Guidelines Framework

### 1. Workspace and directory integrity
- The single source of truth is the repository root opened in the active workspace.
- All agents and tools must work inside that project directory only; use workspace-relative paths instead of machine-specific absolute paths.
- Do not create parallel project folders, copied worktrees, or duplicate project directories.
- Do not create duplicate source files such as `product-detail-v2.html`, `copy_cart.js`, or `test_new.js`; edit the owning project files directly.

### 2. Code stability and overwrite protection
- Read the relevant local code path and its nearby tests before deleting, replacing, or substantially rewriting working logic.
- Preserve existing behavior, public DOM contracts, storage schemas, and backward compatibility unless the approved feature explicitly requires a change.
- Preserve the required script order: `translations.js` -> `products-data.js` -> `universal-i18n-bus.js` -> `header.js` -> `menu-manager.js` -> `auth-state.js` -> `shared-search.js` -> page-specific JavaScript.
- Keep all script tags inside the document body and load page-specific scripts only after shared dependencies.
- Put new globals under the approved `window.ElectroMart` namespace or keep them inside a local scope; avoid unrelated global variables and function collisions.

### 2A. Single website and canonical launch policy
- The only canonical application root is the repository root opened in the active workspace.
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
- Before changing code, run the existing frontend and backend pre-flight suites when the environment permits. For verified baseline, current expected counts are 81 frontend suites and 151 backend tests; check `PROJECT_HANDOVER_ROADMAP.md` for the latest recorded results.
- For every new feature, create and run a focused failing test before implementation.
- After implementation, run the focused test first, then `node scratch/run_all_tests.js`, then `npm --prefix backend run test:unit`.
- Work is not complete until the focused suite and both regression suites pass, or a blocker is explicitly documented.

### 5A. Sensitive snapshot preservation — mandatory
- Never restore `backend/src/data/db.json` or `backend/src/data/db.json.bak` from `HEAD` or a remote; committed historical snapshots contain plaintext PII/OTP data.
- Never commit or push `backend/.env` or the local encrypted JSON snapshots. The local snapshots use a local-only `PII_ENCRYPTION_KEY`; check the handover for their last verified state.
- Do not expose PII or secrets while checking snapshots. Preserve `stash@{0}` unless the user explicitly authorizes changing it.

### Mandatory agent directive

> सभी AI एजेंट ध्यान दें: प्रत्येक कार्रवाई active workspace में खुले मुख्य project repository के अंदर ही करें। नई duplicate files या project copies न बनाएं, पुराने working code और script order को सुरक्षित रखें, और काम समाप्त करने से पहले focused तथा full regression tests चलाकर परिणाम दर्ज करें।
>
> वेबसाइट launch करने के लिए केवल `npm start` और `launch-electromart.js` का उपयोग करें। नया launcher, alternate frontend root, duplicate `index.html`, parallel server या दूसरा project folder बनाना निषिद्ध है।
---
## 6. Code Review & Quality Gates (Mandatory)

- **Pre-commit hooks**: ESLint + Prettier + type-check (`npm run lint`, `npm run typecheck`) हर commit से पहले चलने चाहिए — `husky` से enforce करें।
- **PR template**: हर PR में `## Summary`, `## Breaking Changes`, `## Test Plan`, `## Screenshots / Video`, `## Checklist` सेक्शन अनिवार्य।
- **Approval rule**: कम से कम 1 senior agent/human review बिना merge न हो; self-merge निषिद्ध।
- **Coverage floor**: नए code पर ≥80% unit coverage; critical paths (cart, checkout, payments, auth) पर ≥95% — `npm run test:coverage` से enforce।
- **Bundle size budget**: नया JS/CSS जोड़ने पर `npm run build -- --analyze` से size delta ≤5KB gzipped; breach = block।
- **Dependency freshness**: `npm audit --audit-level=high` हर PR पर; high/critical = block, `npm outdated` monthly review।

## 7. Accessibility Standards (WCAG 2.1 AA — Non-Negotiable)

- **Semantic HTML**: `<button>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>` — कभी `<div onclick>` न लिखें।
- **Focus management**: हर modal/drawer खुलने पर focus trap, `Escape` से बंद, वापस trigger element पर focus return।
- **ARIA**: `aria-label`, `aria-live="polite"`, `role="status"`, `aria-expanded`, `aria-controls`, `aria-describedby` सभी interactive elements पर सही लगे हों।
- **Color contrast**: टेक्स्ट ≥4.5:1, large text (≥18px/14px bold) ≥3:1, UI components (borders, icons) ≥3:1 — automated `axe-core` check CI में।
- **Keyboard**: हर action `Tab`/`Shift+Tab`/`Enter`/`Space`/`Arrow keys` से पहुंच योग्य; focus indicator visible (`outline` कभी `none` न हो बिना replacement के)।
- **Screen reader**: `alt` text meaningful हो (content images के लिए कभी खाली नहीं); decorative = `alt=""`; `role="img"` + `aria-label` जहां ज़रूरी।
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` पर सभी animations/transitions/auto-play disable।
- **Language declaration**: `<html lang>` हर page पर सही हो; RTL languages (`ur`) के लिए `dir="rtl"` + CSS logical properties (`margin-inline-start`)।

## 8. Security Rules

- **No secrets in code**: API keys, tokens, DB passwords, JWT secrets केवल `backend/.env` में (`.gitignore` में हों) — कभी repo में commit न हों।
- **PII at rest**: `PII_ENCRYPTION_KEY` को `backend/.env` या deployment secret store में रखें; strict runtimes में यह आवश्यक है। JSON/SQLite snapshot writes पर name, email, address, phone/mobile, GSTIN और order-notification destinations AES-256-GCM से encrypt होते हैं; API responses में middleware इन्हें decrypt करता है। SQLite corporate invoice/registry tables index केवल non-PII identifiers, status और dates; संवेदनशील fields encrypted JSON में रहें। Key कभी hardcode या log न करें। Structured logs में email/phone/name mask, address/GSTIN/IMEI redact, request query हटाएं और client/error details को raw न लिखें।
- **Dev tunnel/API configuration**: `DEV_TUNNEL_HOST` केवल development में optional bare DNS hostname है; scheme, port, path, query, local/IP hosts अस्वीकार हों। Tunnel configured हो तो `PUBLIC_API_BASE_URL` का hostname उसी से match हो और HTTPS हो। Staging/production में `DEV_TUNNEL_HOST` निषिद्ध है; कोई static tunnel hostname fallback न जोड़ें। `open-electromart-online.ps1` चलाने के लिए यह variable अनिवार्य है; script केवल configured host उपयोग करती है और temporary quick tunnels स्वतः नहीं बनाती। Frontend API base URL `/api/config.js` से `window.__ELECTROMART_CONFIG__` में आता है; unset `PUBLIC_API_BASE_URL` पर same-origin `/api` proxy fallback रहता है।
- Corporate registry recipient name/email, GSTIN और billing address भी persistence से पहले PII field encryption से गुजरें। Registry share token केवल एक बार client को दिया जाए; storage में केवल उसका SHA-256 hash रखें।
- **Input validation**: Client + Server दोनों तरफ — shared Zod/JSON Schema schemas (`shared/schemas/`) से validate करें।
- **XSS prevention**: `innerHTML` केवल trusted/sanitized data के लिए (DOMPurify), बाकी `textContent` या framework auto-escaping।
- **CSP headers**: `Content-Security-Policy` header सख्त — `script-src 'self' 'nonce-...'`; inline scripts केवल `nonce` के साथ।
- **CSRF protection**: State-changing endpoints (POST/PUT/DELETE/PATCH) पर `SameSite=Strict` cookies + CSRF token header।
- **Rate limiting**: Auth (`/api/auth/*`), search, API endpoints पर per-IP/per-user limits (token bucket)।
- **PII masking**: Logs/analytics/telemetry में email/phone/name mask करें (`a***@b.com`, `98****1234`, `R***h`)।
- **Dependency scanning**: `npm audit --audit-level=high` हर PR पर; `package-lock.json` commit होता है।

## 9. Performance Budgets (Enforced in CI)

| Metric | Budget | Tool |
|--------|--------|------|
| LCP (Largest Contentful Paint) | ≤2.5s | Lighthouse CI |
| CLS (Cumulative Layout Shift) | ≤0.1 | Lighthouse CI |
| TBT (Total Blocking Time) | ≤200ms | Lighthouse CI |
| JS bundle (gzipped, initial) | ≤120KB | webpack-bundle-analyzer / `npm run build -- --analyze` |
| CSS (gzipped) | ≤30KB | — |
| Image weight/page | ≤500KB | — |
| Third-party requests | ≤10 | — |
| TTI (Time to Interactive) | ≤3.5s | Lighthouse CI |

- **Regression gate**: नया feature merge से पहले सभी budgets pass होने चाहिए — Lighthouse CI job fail = merge block।

## 10. Testing Strategy

- **Unit (Jest/Vitest)**: Pure functions, utils, engines (discount, GST, FPS, verification) — fast, isolated, deterministic।
- **Integration (Playwright)**: Critical user flows — add-to-cart → checkout → order confirmation → tracking; cross-browser (Chromium, Firefox, WebKit)।
- **Visual regression (Chromatic/Percy)**: Key pages (PDP, cart, checkout, account, hub pages) — baseline से pixel diff ≤0.5%।
- **Contract tests**: API schemas (OpenAPI 3.0) — frontend/backend sync; breaking change = CI fail।
- **i18n smoke**: हर language (`en, hi, ta, te, kn, ml, bn, mr, ur, pa, gu`) में 1 बार full page render + no missing keys।
- **A11y audit**: `axe-core` हर PR पर — violations = fail।
- **Flaky test quarantine**: >2 बार flaky → quarantine label + fix within 48h; quarantine tests CI gate block नहीं करते लेकिन visibility रहती है।

## 11. Internationalization Workflow (11 Languages)

- **Single source**: `translations.js` में `window.EM_TRANSLATIONS` — कोई separate JSON/PO/YAML files नहीं।
- **Key naming**: `feature_subfeature_element` (snake_case, hierarchical) — e.g., `gaming_rig_configurator_cpu_label`।
- **Fallback chain**: `lang → en → key` — never blank; missing key = console warn + fallback।
- **Pluralization**: ICU MessageFormat syntax — `{count, plural, one {...} other {...}}`।
- **RTL support**: `ur` के लिए `dir="rtl"` + CSS logical properties (`margin-inline-start`, `padding-inline-end`, `border-inline-start`)।
- **Font fallbacks**: हर language के लिए `font-family` stack में Noto Sans <script> शामिल (e.g., `Noto Sans Devanagari`, `Noto Sans Tamil`, `Noto Nastaliq Urdu`)।
- **New key checklist**:
  1. English value add करें `ELECTROMART_<FEATURE>_I18N` block में।
  2. 10 अन्य भाषाओं में translate करें (ML-assisted + human review)।
  3. `scratch/test-brand-safety-and-legal-compliance.js` pass करे।
  4. Visual spot-check 320px/1440px दोनों में, RTL में `ur`।
- **Date/Number formatting**: `Intl.DateTimeFormat` / `Intl.NumberFormat` with `en-IN` locale for ₹, भारतीय calendar।

## 12. CSS Architecture (Amazon-style + ElectroMart Brand)

- **Methodology**: BEM (`block__element--modifier`) + CSS Custom Properties (design tokens)।
- **Design tokens**: `amazon-theme.css` में — colors (`--color-primary`, `--color-accent`), spacing (`--space-*`), typography (`--font-*`), shadows (`--shadow-*`), radii (`--radius-*`), z-index scale (`--z-*`)।
- **Utility classes**: केवल layout/spacing के लिए (`.d-flex`, `.gap-3`, `.p-2`, `.text-center`) — component styles BEM में।
- **No `!important`**: except focus-visible overrides vs global theme (`amazon-theme.css:2274` amber outline) — उस स्थिति में `outline: 3px solid var(--color-focus) !important;`।
- **Responsive**: Mobile-first, breakpoints: `320, 640, 1024, 1280, 1440` — container queries जहां appropriate।
- **Print styles**: `@media print` — हर transactional page (invoice, return slip, order detail, GST certificate) पर clean A4 rendering।
- **Dark mode ready**: `prefers-color-scheme: dark` support future के लिए — tokens के via switchable (`@media (prefers-color-scheme: dark) { :root { --color-bg: #0a0a0f; } }`)।
- **Animation**: `prefers-reduced-motion` respect — transitions केवल `transform`/`opacity` पर (GPU accelerated), layout-triggering properties avoid करें।

## 13. State Management Patterns

- **Server state**: React Query / SWR style — cache + stale-while-revalidate (backend API `/api/*`)।
- **Client state**: `localStorage` (`electromart_*_v1` keys) — synchronous, versioned (`_v1`), migratable (`migrateStorage()` utility)।
- **URL state**: Search params (`?category=laptops&page=2&sort=price_asc`) — shareable, bookmarkable, SSR-friendly।
- **Event bus**: `window.dispatchEvent(new CustomEvent('electromart:cartUpdated', { detail: {...} }))` — cross-tab sync via `storage` event।
- **No circular deps**: Page scripts only import shared utils (`shared/*.js`), never other page scripts।
- **Namespace**: सभी globals `window.ElectroMart.<Feature>` under — e.g., `ElectroMart.Gaming`, `ElectroMart.EduStore`, `ElectroMart.Business`।
- **Immutability**: State updates हमेशा new object/array — `Object.freeze` production में read-only views के लिए।

## 14. Dependencies & Build

- **Lockfile**: `package-lock.json` commit होता है — CI में `npm ci` (faster, reproducible)।
- **Audit**: `npm audit --audit-level=high` हर PR पर — high/critical = block।
- **Outdated check**: महीने में एक बार `npm outdated` review; major updates के लिए PR बनाएं।
- **No duplicate deps**: `npm ls` — single version per package; `dedupe` यदि ज़रूरी।
- **Build reproducibility**: `npm run build` deterministic (same input → same output hash) — `SOURCES_DATE_EPOCH` set करें।
- **Source maps**: Production में `hidden-source-map` (error tracking के लिए Sentry/Datadog, public नहीं)।
- **Tree shaking**: ES modules only — side-effect-free packages `package.json` में `"sideEffects": false`।
- **Bundle analysis**: `webpack-bundle-analyzer` output CI artifact के रूप में store करें।

## 15. Release Process

- **Versioning**: SemVer — `MAJOR.MINOR.PATCH` (breaking / feature / fix)।
- **Changelog**: `CHANGELOG.md` — [Keep a Changelog](https://keepachangelog.com/) format, हर release पर update।
- **Tagging**: `git tag v1.2.3` + `git push --tags`; annotated tag with release notes।
- **Rollback**: `git revert <commit>` + hotfix branch (`hotfix/v1.2.4`) — कभी force-push `main` पर नहीं।
- **Feature flags**: नए risky features `localStorage` flag के पीछे launch करें (`electromart_ff_<name>`) — instant rollback possible।
- **Canary**: Production पर 5% traffic → 24h monitor (error rate, latency, business metrics) → full rollout।
- **Release notes**: Auto-generated from merged PR titles + manual curation; stakeholders को notify।

## 16. Multi-Agent Collaboration Protocol

- **Work allocation**: एक समय पर एक agent एक feature — `git branch feat/<phase>-<slug>` (e.g., `feat/41-trade-in`)।
- **Handoff doc**: हर phase पूरा होने पर `HANDOVER.md` update — context, decisions, known issues, follow-up tasks।
- **Conflict resolution**: Same file पर simultaneous edits → human/lead agent resolve; `git merge --no-ff` for feature branches।
- **Knowledge sharing**: नया pattern/utility create करने पर `docs/patterns/<name>.md` में document करें (e.g., `docs/patterns/discount-engine.md`)।
- **Regression ownership**: अगर आपका change किसी existing test को break करता है → आप ही fix करें (blameless, लेकिन accountable)।
- **Communication**: Breaking changes से पहले `#dev-sync` channel / issue comment में announce करें।
- **Documentation sync**: Code change के साथ `AGENT_INSTRUCTIONS.md`, `PROJECT_STATUS.md`, `README.md` update atomic commit में।
---
## 17. Legal Protection & Trademark Risk Mitigation (CRITICAL — ZERO TOLERANCE)

> ⚠️ **LEGAL WARNING**: Amazon holds registered trademarks worldwide for "Amazon", "अमेज़न", and related marks. Unauthorized use in customer-facing content on `electromart.in` constitutes **trademark infringement** and **passing off** under Indian Trade Marks Act, 1999 and international IP law. Amazon's legal team actively monitors and enforces — **cease-and-desist, injunctions, and damages are real risks**.

### 17.1 Absolute Prohibitions (Customer-Facing — ZERO Occurrences Allowed)

| Context | Forbidden | Required ElectroMart Equivalent |
|---------|-----------|--------------------------------|
| **Visible text** | "Amazon", "अमेज़न", "अमेजन", "अमेजॉन" | "ElectroMart", "इलेक्ट्रोमार्ट" |
| **Translations** (all 11 langs) | Any transliteration of Amazon | "ElectroMart" / native script इलेक्ट्रोमार्ट |
| **Badges** | "Amazon's Choice", "Amazon Prime" | "ElectroMart's Choice", "ElectroMart Prime" |
| **Filters/UI** | "Amazon Filters", "Amazon Deals" | "ElectroMart Filters", "ElectroMart Deals" |
| **Alt/Title/Placeholder/Aria** | Any Amazon reference | ElectroMart equivalent |
| **Tooltips/Toasts/Notifications** | Amazon mentions | ElectroMart equivalent |
| **Error messages** | "Amazon server error" | "ElectroMart server error" |
| **Legal pages** (Terms, Privacy) | "Amazon.com", "Amazon India" | "electromart.in", "ElectroMart India" |

### 17.2 Internal Code — Safe but Documented

| Item | Status | Rule |
|------|--------|------|
| Legacy CSS classes (`.amazon-layout`, `.amazon-price-block`, `.ac-badge-pill`) | **Allowed internally** | **Never rename** — regression tests depend on them |
| Legacy DOM IDs (`#amazonsChoiceBadge`, `#amazonAccountGrid`) | **Allowed internally** | **Never rename** — tests/selectors depend on them |
| Test filenames (`test-amazon-*.js`) | **Allowed** | Internal only — never rendered to customer |
| Comments referencing Amazon | **Allowed** | Internal documentation only |
| Variable names (`amazonTheme`, `amazonConfig`) | **Allowed** | Internal scope only |

### 17.3 Automated Enforcement (Mandatory Gates)

| Gate | Tool | Frequency | Failure = |
|------|------|-----------|-----------|
| **Brand Safety Test** | `node scratch/test-brand-safety-and-legal-compliance.js` | Every commit (pre-commit hook) + CI | **Release blocker** |
| **Translation Audit** | Same test scans `translations.js` all 11 langs | Every commit | **Release blocker** |
| **HTML Content Scan** | Strips scripts/styles/comments, checks text nodes + attributes | Every commit | **Release blocker** |
| **PR Checklist** | Manual verification: "No Amazon text in customer-facing output" | Every PR | Merge block |

### 17.4 Pre-Release Legal Checklist (Must Complete Before Any Deploy)

```
☐ Run `node scratch/test-brand-safety-and-legal-compliance.js` — PASS
☐ Grep all 11 language dictionaries for "amazon|अमेज़न" — ZERO results
☐ Grep all HTML files for visible Amazon text — ZERO results  
☐ Check alt/title/placeholder/aria-label attributes — ZERO Amazon
☐ Verify all badges say "ElectroMart's Choice" / "ElectroMart Prime"
☐ Verify all filters say "ElectroMart Filters" / "ElectroMart Deals"
☐ Confirm `scratch/run_all_tests.js` = 81/81 PASS
☐ Confirm `cd backend && npm run test:unit` = 150/150 PASS
☐ Legal sign-off documented (if available)
```

### 17.5 Incident Response (If Amazon Reference Found in Production)

1. **Immediate**: Hotfix branch → remove reference → deploy within 1 hour
2. **Root cause**: How did it bypass gates? (test gap? manual edit? third-party lib?)
3. **Fix gate**: Add specific regex to brand safety test for the missed pattern
4. **Document**: `INCIDENT_LOG.md` with timeline, fix, prevention
5. **Notify**: Stakeholders + legal counsel (if available)

### 17.6 Third-Party Library Audit

- Any npm package that injects UI text (toast libraries, UI kits, analytics) **must be audited** for hardcoded "Amazon" strings
- Use `grep -r "amazon" node_modules/<pkg>/dist` before adding dependency
- If found: patch, fork, or reject the package

---

**THIS SECTION IS NON-NEGOTIABLE. ANY AGENT VIOLATING THIS WILL HAVE THEIR WORK REVERTED IMMEDIATELY.**
