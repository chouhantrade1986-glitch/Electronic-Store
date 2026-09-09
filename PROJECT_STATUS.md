# ElectroMart — Project Status (परियोजना की वर्तमान स्थिति)

**अंतिम अद्यतन (Last Updated):** सितंबर 2026 (Phase 19: Amazon India-Style Product Comparison Hub with 4-Slot Matrix & Differential Highlighting Completed)  
**शाखा (Branch):** `main`  
**वातावरण (Environment):** Windows / Node.js 20+

---

## 1. समग्र स्वास्थ्य और टेस्ट मेट्रिक्स (Overall Health & Test Metrics)

| **घटक** | **टेस्ट सूट** | **स्थिति** | **परिणाम** |
| --- | --- | --- | --- |
| **फ्रंटएंड व i18n रिग्रेशन टेस्ट्स** | `node scratch/run_all_tests.js` | ✅ **PASS** | 51 / 51 टेस्ट सूट्स उत्तीर्ण (100%) |
| **प्रोडक्ट कंपैरिज़न हब टेस्ट** | `node scratch/test-amazon-compare-hub.js` | ✅ **PASS** | 5 / 5 ब्लॉक्स उत्तीर्ण (100%) |
| **B2B बल्क व GSTIN पोर्टल टेस्ट** | `node scratch/test-b2b-bulk-purchase-portal.js` | ✅ **PASS** | 9 / 9 ब्लॉक उत्तीर्ण (100%) |
| **समर्पित ऑथ व सुरक्षा टेस्ट** | `node scratch/test-amazon-login-register.js` | ✅ **PASS** | 7 / 7 ब्लॉक उत्तीर्ण (100%) |
| **फ़्लाईआउट ऑक्लूजन व विशलिस्ट फ़्लो** | `node scratch/test-flyout-occlusion-and-wishlist-flow.js` | ✅ **PASS** | 5 / 5 परिदृश्य उत्तीर्ण (100%) |
| **सर्च व कैटगरी फ़िल्टरिंग टेस्ट** | `node scratch/test-search-and-category-filtering.js` | ✅ **PASS** | 9 / 9 चरण उत्तीर्ण (100%) |
| **बैकएंड यूनिट टेस्ट्स** | `npm run test:unit` (in `backend/`) | ✅ **PASS** | 74 / 74 टेस्ट उत्तीर्ण (100%) |
| **ऑर्डर्स हब व एड्रेस सिंक टेस्ट** | `node scratch/test-orders-and-account-popups.js` | ✅ **PASS** | 5 / 5 परिदृश्य उत्तीर्ण (100%) |
| **भारतीय GST अनुपालन टेस्ट** | `node scratch/test-indian-gst-compliance.js` | ✅ **PASS** | 6 / 6 परिदृश्य उत्तीर्ण (0 पैसे का अंतर) |
| **ऑर्डर कन्फर्मेशन व इनवॉइस टेस्ट** | `node scratch/test-thankyou-and-invoice-pages.js` | ✅ **PASS** | 6 / 6 चरण उत्तीर्ण (100%) |
| **कुल टेस्ट पास स्कोर** | संपूर्ण सिस्टम | ✅ **PASS** | **125 / 125 (100% Pass Rate)** |

---

## 2. आर्किटेक्चर एवं फीचर्स स्थिति (Architecture & Features Status)

### A. उत्पाद कैटलॉग (Products Catalog)
- **751 उत्पाद पूरी तरह सक्रिय:** `products-data.js` (`window.EM_CATALOG` और `window.EM_CATALOG_MAP`) तथा `backend/src/data/db.json` में पूरी तरह सिंक्रोनाइज़्ड।
- **कीमतें (Pricing):** सभी उत्पादों और एक्सेसरीज़ में प्रामाणिक भारतीय रुपये (₹ INR)।
- **कैटलॉग फॉलबैक:** कार्ट और प्रोडक्ट डिटेल पेजों पर तेज़ इन-मेमोरी लुकअप।

### B. अमेज़न इंडिया UI/UX थीम (Amazon India Theme - Phases 1 to 11 Completed)
- **चरण 1 (Shopping Cart Upgrade - `cart.html`, `cart.js`):**
  - ₹499+ फ़्री डिलीवरी प्रोग्रेस व क्वालिफायर बार (ग्रीन चेकमार्क बैज)।
  - आइटम सिलेक्शन/अचयन चेकबॉक्स, "Deselect/Select all" टॉगल, और अमेज़न एक्शन बार।
  - पूर्ण "Saved for Later" शेल्फ़ विथ 1-क्लिक "Move to cart" और डिलीट।
  - स्टिकी बाय बॉक्स विथ पिल बटन (`#checkoutBtn`) और गिफ्ट विकल्प।
- **चरण 2 (Products Listing & Facets - `products.html`, `products.js`):**
  - अमेज़न स्टाइल 6-कैटेगरी डिपार्टमेंट ट्री और स्टार रेटिंग फ़िल्टर्स (4★ & Up, 3★ & Up)।
  - कस्टम प्राइस रेंज इनपुट्स (₹ Min - ₹ Max) विथ "Go" बटन।
  - 3-लाइन अमेज़न प्राइसिंग स्टैक (लाल डिस्काउंट %, बड़ा बोल्ड ₹ प्राइस, M.R.P. स्ट्राइकथ्रू)।
  - सोशल प्रूफ बैज ("1K+ bought in past month") और ElectroMart's Choice बैज (स्टाइलिश डार्क पिल)।
- **चरण 3 (Homepage & Carousels - `index.html`, `homepage-products.js`):**
  - हीरो ओवरलैप 4-इन-1 क्वाड ग्रिड कार्ड्स (`-240px` नेगेटिव मार्जिन विथ अमेज़न फेड ग्रेडिएंट)।
  - 44px × 88px सर्कुलर सेमी-ट्रांसपेरेंट कैरोसेल पैडल्स (Deals, Top Picks, Recommended, Browsing History)।
  - टुडेज़ हॉट डील्स पर लाइव काउंटडाउन टाइमर और क्लेम स्टेटस प्रोग्रेस बार।
  - होमपेज 1-क्लिक "Add to Cart" विथ ग्रीन चेकमार्क विजुअल फीडबैक (`✓ Added`)।
- **चरण 4 (Accordion Checkout Flow - `checkout.html`, `checkout.js`):**
  - 3-स्टेप इंटरएक्टिव अकॉर्डियन: (1) Delivery Address, (2) Payment Method, (3) Review Items & Delivery Window।
  - मल्टी-एड्रेस कार्ड्स (Home व Work टैग्स के साथ), 1-क्लिक रेडियो चयन, "+ Add a new address / Edit" टॉगल, और 2-लाइन लाइव समरी टेक्स्ट।
  - पेमेंट मेथड कार्ड्स: ElectroMart Pay UPI, क्रेडिट/डेबिट कार्ड, नेट बैंकिंग और COD विथ ऑटो-कोलाप्स।
  - अकॉर्डियन चेंज बटन्स (`#step1ChangeBtn`, `#step2ChangeBtn`), स्मूथ ऑटो-स्क्रोलिंग और एम्प्टी कार्ट प्रोटेक्शन (रीडायरेक्ट टू `cart.html`)।
  - राइट स्टिकी ऑर्डर समरी बॉक्स विथ कूपन इनपुट, 18%/28% GST ब्रेकडाउन, मुफ़्त शिपिंग टैग, 100% सिक्योर परचेज़ बैज और "Place your order" अमेज़न-स्टाइल एम्बर बटन।
  - प्रामाणिक ElectroMart डिस्ट्रैक्शन-फ्री चेकआउट हेडर (`#checkoutHeaderBar`) विथ सेंटर्ड टाइटल, डायनामिक कार्ट आइटम काउंट लिंक (`#checkoutHeaderItemCount`), 100% सिक्योर लॉक बैज (`.amz-checkout-header-secure`), और मिनिमलिस्ट फुटर (`.amz-checkout-footer`)।
- **चरण 5 (Your Orders & Tracking Hub - `orders.html`, `orders.js`):**
  - अमेज़न 4-टैब नेविगेशन बार (`#orderTabs`): "Orders", "Buy Again", "Not Yet Shipped", "Cancelled Orders"।
  - समय अवधि फ़िल्टर (`#timeFilter`) और रीयल-टाइम ऑर्डर काउंट।
  - दो-स्तरीय कार्ड: टॉप ग्रे बार (`#f0f2f2`) और बॉडी में 1-क्लिक `Buy it again` पिल बटन।
  - राइट एक्शन स्टैक: अमेज़न येलो पिल `Track package`, `Return or replace items`, `Write a review`, `Feedback`, `Download Invoice`।
  - 4-माइलस्टोन विजुअल ट्रैकिंग प्रोग्रेस स्टेपर (`Ordered` › `Shipped` › `Out for delivery` › `Delivered`)।
- **चरण 6 (Product Detail Page - PDP Full Suite - `product-detail.html`, `product-detail.js`):**
  - वर्टिकल थंबनेल रेल विथ एम्बर एक्टिव बॉर्डर (`#e77600`) और स्मूथ मैग्निफायर जूम लेंस।
  - "ElectroMart's Choice" डार्क बैज और "1K+ bought in past month" सोशल प्रूफ इंडिकेटर।
  - अमेज़न बैंक ऑफर्स व नो कॉस्ट ईएमआई कार्ड्स कैरोसेल (`#offersGrid`).
  - 5 अमेज़न ट्रस्ट बैज स्ट्रिप (7 days Replacement, Free Delivery, 1 Year Warranty, Pay on Delivery, Top Brand) विथ क्लीन SVG आइकन्स।
  - इंटरएक्टिव Frequently Bought Together बंडल विथ रीयल-टाइम चेकबॉक्स सबटोटल रीकैलकुलेशन।
  - 2-कॉलम कस्टमर रिव्यूज़ हब: बाईं तरफ 5-स्टार हिस्टोग्राम प्रोग्रेस बार व फीचर ब्रेकडाउन, दाईं तरफ वेरिफाइड परचेज़ रिव्यूज़ विथ हेल्पफुल वोट काउंटर्स।
  - Add-to-Cart पर तुरंत विजुअल फीडबैक (`✓ Added to Cart` / `✓ कार्ट में जोड़ा गया`, ग्रीन स्टाइलिंग) और Buy Now पर 1-क्लिक कार्ट एडिशन।
- **चरण 7 (Your Account 8-Grid Suite - `account.html`, `account.js`):**
  - प्रामाणिक अमेज़न 8-टाइल नेविगेशन ग्रिड (`#amazonAccountGrid`): Your Orders, Login & security, Prime Membership, Your Addresses, Payment options, ElectroMart Pay balance, Contact Us, Your Wish List।
  - डायनामिक ब्रेडक्रम्ब नेविगेशन (`Your Account › [Section]`) विथ "‹ Back to Your Account" 1-क्लिक रिटर्न।
  - ElectroMart Pay Balance वॉलेट विथ क्विक ऐड बटन्स (+ ₹500, + ₹1,000, + ₹2,000), रीयल-टाइम बैलेंस सिंक, और रिसेंट ट्रांजैक्शन टेबल।
  - प्राइम मेंबरशिप स्टेटस कार्ड और 3 कोर प्राइम बेनिफिट्स (Free Delivery, Early Deals, 5% Cashback) विथ ग्रीन चेकमार्क।
  - 24x7 सपोर्ट हब विथ सर्च, FAQ अकॉर्डियन (`<details>`), लाइव चैट व कॉल-बैक टोस्ट ट्रिगर्स।
  - पुराने QA ऑटोमेशन के लिए पूर्ण बैकवर्ड कम्पैटिबिलिटी (`.account-sidebar-head h1` "My Account", 41 क्रिटिकल DOM IDs)।
- **चरण 8 (Wishlist Hub - `wishlist.html`, `wishlist.js`, `wishlist.css`):**
  - 2-कॉलम लेआउट: बाईं ओर "Your Lists" साइडबार विथ मल्टी-लिस्ट नेविगेशन व "+ Create a List" मोडल, दाईं ओर इन-लिस्ट सर्च और सॉर्ट टूलबार (`#wishlistSearchInput`, `#wishlistSortSelect`)।
  - पब्लिक / प्राइवेट प्राइवेसी टॉगल (`#togglePrivacyBtn`, `#listPrivacyBadge`) विथ 1-क्लिक स्टेटस स्विचिंग और टोस्ट अलर्ट।
  - प्रामाणिक अमेज़न 3-लाइन प्राइसिंग स्टैक (लाल डिस्काउंट %, बड़ा बोल्ड ₹ प्राइस, M.R.P. स्ट्राइकथ्रू) और प्राइस ड्रॉप अलर्ट बैज (`📉 Price dropped X% since added`)।
  - 1-क्लिक "Move to Cart" विथ कार्ट काउंट सिंक (`#cartCount`) और ग्रीन विजुअल फीडबैक (`✓ Added to Cart`)।
  - इनवाइट / शेयर मोडल (`#shareListModal`) विथ 1-क्लिक कॉपी लिंक।
  - 100% बैकवर्ड कम्पैटिबिलिटी: `#wishlistGrid`, `#wishlistMeta`, `.wishlist-card`, `electromart_wishlist_v1`।
  - 11 भारतीय भाषाओं में i18n अनुवाद और स्वचालित टेस्ट सूट `scratch/test-amazon-wishlist.js` (100% पास)।
- **चरण 9 (Authentication Flow - `auth.html`, `auth.js`, `auth.css`):**
  - प्रामाणिक अमेज़न सेंटर्ड ऑथ कार्ड (`#authCard`, `.amz-auth-card`) विथ मिनिमलिस्ट लोगो हेडर और 390px मैक्स-विड्थ।
  - भारतीय मोबाइल नंबर इनपुट के लिए `IN +91` कंट्री कोड प्रीफिक्स बैज।
  - पासवर्ड विजिबिलिटी शो/हाइड टॉगल बटन्स (`.amz-toggle-pwd-btn`) विथ क्लीन SVG आई आइकन्स।
  - "Need help?" ड्रॉपडाउन अकॉर्डियन (`<details class="amz-auth-help-accordion">`) विथ पासवर्ड रीसेट लिंक और अकाउंट इश्यूज़।
  - "New to ElectroMart?" ऑथ डिवाइडर विथ "Create your ElectroMart account" सेकेंडरी बटन (`#switchToSignupBtn`) और साइन-अप से साइन-इन स्विच (`#switchToSigninBtn`)।
  - अमेज़न येलो पिल प्राइमरी बटन्स (`.amz-btn-auth-primary`), कस्टम फ़ोकस ग्लो, और लीगल नोटिस (शर्तें व गोपनीयता नीति)।
  - 100% बैकवर्ड कम्पैटिबिलिटी: सभी 41+ लेगेसी एडमिन/सेलर सेंट्रल DOM IDs और टेस्ट्स सुरक्षित।
  - 11 भारतीय भाषाओं में i18n अनुवाद और स्वचालित टेस्ट सूट `scratch/test-amazon-auth.js` (100% पास)।
- **चरण 10 (Delivery Location & Pincode Modal - `header.js`, `header.html`, `amazon-theme.css`, `index.html`, `product-detail.js`):**
  - प्रामाणिक अमेज़न इंडिया डिलीवरी लोकेशन मोडल (`#locationModal`, `.location-modal`, `.amz-location-card`)।
  - 6-अंकों का भारतीय पिनकोड वैलिडेशन (`/^[1-9][0-9]{5}$/`) और स्वतः शहर मैपिंग (11->New Delhi, 40->Mumbai, 56->Bengaluru आदि)।
  - 11 प्रमुख भारतीय महानगरों के क्विक-सिलेक्शन पिल्स (`.amz-metro-pill`): New Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh।
  - ऑथेंटिकेटेड यूज़र के लिए सेव्ड एड्रेस कार्ड से 1-क्लिक डिलीवरी लोकेशन चयन (`#amzLocationAuthSection`) व साइन-इन सीटीए।
  - स्टोर-वाइड रीयल-टाइम सिंक्रोनाइज़ेशन: ग्लोबल हेडर (`#locationTrigger`), प्रोडक्ट डिटेल पेज बायबॉक्स (`#buyboxLocationLink`), कार्ट और चेकआउट के बीच तत्काल लाइव लोकेशन अपडेट।
  - `header.js` द्वारा स्टोर-वाइड डायनामिक मोडल इंजेक्शन (पेज पर मोडल न होने पर भी सभी पेजों पर निर्बाध कार्य)।
  - 100% बैकवर्ड कम्पैटिबिलिटी: पुराने QA IDs (`#locationModal`, `#locationTitle`, `#locationCity`, `#locationPostal`, `#locationCancel`, `#locationSave`, `data-close-location-modal`) पूर्णतः सुरक्षित।
  - 11 भारतीय भाषाओं में i18n अनुवाद और स्वचालित टेस्ट सूट `scratch/test-amazon-location-modal.js` (100% पास)।
- **चरण 11 (Deals & Best Sellers Dedicated Hubs - `todays-deals.html`, `todays-deals.js`, `best-sellers.html`, `best-sellers.js`):**
  - प्रामाणिक अमेज़न इंडिया डिपार्टमेंट पिल बार (`#dealsDeptBar`, `#bestSellersDeptBar`) विथ स्मूथ हॉरिजॉन्टल स्क्रोलिंग व ऑटो सिंक।
  - डील टाइप पिल्स (`#dealTypeBar`): All Deals, Deal of the Day, Lightning Deals, Under ₹500, 50% Off or More।
  - फीचर्ड डील ऑफ द डे स्पॉटलाइट शोकेस बैनर (`#dealsSpotlightBanner`, `.amz-spotlight-deal`) विथ लाइव एक्सपायरी काउंटडाउन और क्लेम प्रोग्रेस बार।
  - बेस्ट सेलर्स पोडियम रैंक रिबन्स (`.amz-rank-badge`): गोल्ड ग्रेडिएंट (`#1`), सिल्वर ग्रेडिएंट (`#2`), ब्रॉन्ज ग्रेडिएंट (`#3`), और नेवी-येलो (`#4+`)।
  - फुल कैटलॉग इंटीग्रेशन (`products-data.js` / `window.EM_CATALOG`)।
  - 11 भारतीय भाषाओं में i18n अनुवाद और स्वचालित टेस्ट सूट `scratch/test-amazon-deals-and-best-sellers.js` (100% पास)।
- **चरण 12 (Seller Central & Store Admin Departmental Hubs - `admin-dashboard.html`, `admin-orders.html`, `admin-listing.html`, `admin-analytics.html`, `admin-after-sales.html`, `admin-users.html`, `admin-audit.html`, `admin-settings.html`):**
  - **8 अलग-अलग समर्पित विभाग पेजेज़:** डैशबोर्ड ओवरव्यू, ऑर्डर व शिपिंग, इन्वेंट्री व कैटलॉग (751 SKUs), सेल्स व एनालिटिक्स, रिटर्न व रिफंड, ग्राहक खाते व स्टाफ, सुरक्षा ऑडिट ट्रेल, और स्टोर सेटिंग्स।
  - **100% ऑथेंटिक Amazon India Seller Central थीम:** डार्क नेवी टॉपबार (`#232f3e`), सब-नेव बार (`#131921`), अमेज़न येलो/ऑरेंज एक्शन बटन्स, और वर्कस्पेस ग्रे बैकग्राउंड (`#eaeded`)।
  - **शेयर्ड इन्फ्रास्ट्रक्चर (`admin-shared.js`):** यूनिवर्सल हेडर, मार्केटप्लेस इंडिकेटर (`🇮🇳 IN`), स्टाफ प्रोफाइल मेन्यू, भाषा स्विचर, और सेंट्रलाइज़्ड डेटा एक्सेस।
  - **सख्त ब्रांड व कानूनी सुरक्षा:** विज़िबल ब्रांड केवल **ElectroMart Seller Central** (`इलेक्ट्रोमार्ट सेलर सेंट्रल`), 0 दृश्य "Amazon" टेक्स्ट।
  - **11 भारतीय भाषाओं में i18n अनुवाद:** सभी 22 सेलर सेंट्रल कीवर्ड्स का 11 भाषाओं में पूर्ण अनुवाद।
  - **स्वचालित टेस्ट सूट:** `scratch/test-amazon-seller-central.js` (100% पास)।
- **चरण 13 (Order Confirmation & Printable GST Tax Invoice - `thank-you.html`, `thank-you.js`, `invoice.html`, `invoice.js`, `invoice.css`):**
  - **ऑर्डर सक्सेस स्क्रीन (`thank-you.html`):** बड़ा हरा चेकमार्क (`.amz-thankyou-check-circle`), "Order placed, thank you!" हेडिंग, ईमेल पुष्टिकरण सूचना, गारंटीड डिलीवरी स्लॉट प्रीव्यू बैनर, और दो मुख्य अमेज़न-स्टाइल एक्शन बटन्स: "Print / Download GST Invoice" व "View or manage order"।
  - **ऑर्डर किए गए उत्पाद प्रीव्यू:** इमेज थंबनेल (विथ `onerror` सेफ फॉलबैक), उत्पाद शीर्षक, मात्रा (`Qty: X`), और लाइन कुल। "Recommended based on your purchase" कैरोसेल ग्रिड।
  - **प्रिंंटेबल GST टैक्स इनवॉइस (`invoice.html`):** आधिकारिक **Tax Invoice / Bill of Supply** लेआउट (ElectroMart Retail Pvt. Ltd. पंजीकृत पता, PAN ও GSTIN: `07ABCDE1234F1Z5`), सटीक 8-अंकीय HSN कोड (`85076000`, `85287200`, `84713010`), और इंट्रा-स्टेट (Delhi) के लिए अलग-अलग **CGST (9% / 14%)** + **SGST (9% / 14%)** कॉलम्स व इंटर-स्टेट के लिए IGST।
  - **A4 प्रिंट मीडिया क्वेरी (`@media print`):** नेविगेशन बार, बटन्स, हेडर/फुटर स्वतः `display: none !important;` होकर साफ़-सुथरा A4 PDF रेंडर।
  - **11 भारतीय भाषाओं में i18n अनुवाद व टेस्ट:** `scratch/test-thankyou-and-invoice-pages.js` (100% पास)।
- **चरण 14 (Orders Management Hub & Account Addresses Sync - `orders.html`, `orders.js`, `account.html`, `account.js`, `amazon-theme.css`, `checkout.js`):**
  - **"Ship To" पॉपओवर (`.amz-ship-to-wrapper`, `.amz-ship-to-popover`):** प्राप्तकर्ता का नाम, पता और फोन नंबर के साथ प्रामाणिक अमेज़न इंडिया-स्टाइल पॉपओवर विथ पॉइंटर ट्राइंगल। बाहर कहीं भी क्लिक करने (outside click) या `Escape` दबाने पर स्मूथ क्लोज़िंग।
  - **"View order details" मोडल (`#orderDetailsModal`):** फुल स्क्रीन-फ्रेंडली मोडल जिसमें सभी ऑर्डर किए गए आइटम्स के थंबनेल (विथ `onerror` फॉलबैक), मात्रा, मूल्य, टैक्स ब्रेकडाउन (CGST+SGST vs IGST), शिपिंग डिटेल्स और "Download Invoice" डायरेक्ट लिंक शामिल हैं। बैकड्रॉप क्लिक व `Escape` की पर स्मूथ क्लोज़िंग।
  - **एम्प्टी स्टेट्स प्रोटेक्शन (`.amz-empty-orders-card`):** जब कोई ऑर्डर न हो या फ़िल्टर में 0 परिणाम आएं, तो अमेज़न-स्टाइल एम्प्टी बॉक्स आइकन, स्पष्ट संदेश, और "Continue Shopping" बटन।
  - **एड्रेस डेटा की सुसंगतता (Consistency & Real-time Sync):** `account.html` के "Your Addresses" सेक्शन में जोड़े गए, एडिट किए गए या डिफ़ॉल्ट सेट किए गए पते सीधे `localStorage` (`electromart_saved_addresses_v1` और `electromart_profile_v1`) में सिंक होते हैं। यह डेटा `checkout.html` के Step 1 (डिलीवरी पता) के साथ रीयल-टाइम में जुड़ा रहता है।
  - **एड्रेस एडिट / ऐड मोडल (`#addressEditModal`):** स्वच्छ फॉर्म मोडल विथ फुल नेम, फोन, एड्रेस लाइन 1 व 2, शहर, राज्य, 6-अंकीय पिनकोड, एड्रेस टाइप (Home/Work), और "Make this my default address" चेकबॉक्स।
  - **100% बैकवर्ड कम्पैटिबिलिटी व ब्रांड सुरक्षा:** सभी 41+ पुराने DOM IDs सुरक्षित, ग्राहक को दिखने वाला ब्रांड 100% **ElectroMart** (0 दृश्य Amazon टेक्स्ट)।
  - **स्वचालित टेस्ट सूट:** `scratch/test-orders-and-account-popups.js` (100% पास)।
- **चरण 15 (Search & Category Filtering Engine - `products.html`, `products.js`, `amazon-theme.css`):**
  - **डिपार्टमेंट / कैटेगरी ट्री (`#amzDeptTree`):** 6-कैटेगरी ट्री लिंक्स विथ डायनामिक काउंट बैजेस (`.amz-dept-count`, `data-category-count`) और एक्टिव स्टेट सिंक्रोनाइज़ेशन।
  - **कस्टमर रिव्यूज़ फ़िल्टर (`#amzRatingList`):** 4★ & Up, 3★ & Up, 2★ & Up, 1★ & Up विथ गोल्ड स्टार्स (`#ffa41c`) और क्लिक टॉगल सपोर्ट।
  - **ब्रांड चेकलिस्ट:** 751-प्रोडक्ट कैटलॉग से डायनामिक मल्टी-सेलेक्ट चेकबॉक्सेस विथ प्रमुख ब्रांड प्राथमिकता (Apple, Samsung, ASUS, Sony, Lenovo, HP, Dell, OnePlus, boAt) व केस-इंसेंसिटिव मैचिंग।
  - **प्राइस रेंज व 'Go' बटन (`#minPriceInput`, `#maxPriceInput`, `#priceGoBtn`):** न्यूमेरिक इनपुट्स विथ ₹ प्रीफिक्स, स्वतः Min/Max स्वैप वैलिडेशन, और एक्टिव टॉगल-सक्षम प्राइस प्रीसेट बटन्स।
  - **फास्ट-फ़िल्टर चेकबॉक्सेस:** Pay on Delivery (COD) और Free Delivery (₹499+) फास्ट-फ़िल्टर टॉगल चेकबॉक्सेस।
  - **एक्टिव फ़िल्टर चिप्स (`#activeFiltersContainer`, `#activeFiltersList`):** रिमूवेबल चिप्स विथ '×' क्लोज़ बटन और "Clear all" एक्शन (रीसेट ऑल फ़िल्टर्स, प्रीसेट्स, स्लाइडर्स व `currentPage = 1`)।
  - **टॉप सॉर्ट बार व रिजल्ट्स हेडर:** डायनामिक स्ट्रिंग (उदा. `1-20 of over 700 results for "laptops"`), फुल सॉर्ट मेन्यू (Featured, Price: Low to High, Price: High to Low, Avg. Customer Review, Newest Arrivals, Best Sellers)।
  - **ग्रिड / लिस्ट व्यू व पेजिनेशन:** व्यू डेंसिटी स्विच (`.view-btn[data-view="grid"]`, `[data-view="list"]`), पेज साइज कंट्रोल (20, 40, 60 प्रति पेज), और न्यूमेरेकल पेजिनेशन कंट्रोल्स।
  - **माउस व कर्सर इंटरेक्शन मैंडेट्स (Permanent Lock):** सभी फ़िल्टर रो, लेबल्स, चेकबॉक्स, प्रीसेट्स, चिप्स, स्टार रेटिंग्स, 'Go' बटन, व्यू बटन्स, और पेजिनेशन पर `cursor: pointer !important;`।
  - **स्वचालित टेस्ट सूट:** `scratch/test-search-and-category-filtering.js` (100% पास)।
- **चरण 16 (Cart Flyout & Quick View Occlusion Fix + Wishlist & Save-for-Later Flow - `amazon-theme.css`, `header.js`, `products.js`, `cart.js`, `wishlist.js`):**
  - **कार्ट फ़्लाईआउट व बैकड्रॉप ऑक्लूजन समाधान:** `#cartFlyout` और `#cartFlyoutOverlay` कंटेनर अब डिफ़ॉल्ट रूप से `display: none !important; pointer-events: none !important; opacity: 0;` रहते हैं, जिससे इनएक्टिव स्थिति में कोई भी अदृश्य लेयर यूज़र के क्लिक, स्क्रोल या पेजिनेशन को ब्लॉक नहीं करती। केवल जब यूज़र स्पष्ट रूप से "Add to Cart" या कार्ट आइकन दबाता है तभी `.open` / `.active` क्लास के साथ `display: flex/block !important; pointer-events: auto !important;` सक्रिय होता है।
  - **क्विक व्यू मोडल व ड्रॉअर ऑक्लूजन समाधान:** `#quickViewModal`, `#qvDrawer`, `#qvDrawerOverlay` अब निष्क्रिय अवस्था में पूर्णतः `display: none !important; pointer-events: none !important;` रहते हैं।
  - **विशलिस्ट व हार्ट आइकन संगति:** प्रोडक्ट कार्ड्स पर `.wishlist-btn` अब विशलिस्ट टॉगल होने पर भी दिल का आइकन सुरक्षित रखता है (`<span class="heart-icon">${active ? "♥" : "♡"}</span> ${label}`) और `electromart_wishlist_v1` के साथ इंस्टेंट सिंक करता है।
  - **सेव फॉर लेटर व हेडर सिंक:** कार्ट के प्रत्येक आइटम एक्शन बार में "Save for later" (`data-action="save-for-later"`) आइटम को "Saved for later" शेल्फ़ में भेजता है, कार्ट सबटोटल रीकैलकुलेट करता है, और हेडर के कार्ट काउंट बैज (`#cartCount`) को तुरंत `syncHeaderCartCount()` द्वारा अपडेट करता है।
  - **विशलिस्ट हब एक्शन:** `wishlist.html` पर सेव किए गए आइटम्स के लिए प्रामाणिक "Move to Cart" और '×' डिलीट एक्शन सुचारू रूप से कार्य करते हैं।
  - **स्वचालित टेस्ट सूट:** `scratch/test-flyout-occlusion-and-wishlist-flow.js` (100% पास)।
- **चरण 17 (Amazon India-Style Dedicated Auth & Security Suite - `login.html`, `register.html`, `forgot-password.html`, `auth.css`):**
  - **समर्पित लॉगिन स्क्रीन (`login.html` & `login.js`):**
    - 2-स्टेप प्रोग्रेसिव डिस्क्लोज़र: स्टेप 1 (ईमेल/10-अंकीय भारतीय मोबाइल विथ `IN +91` बैज) ➔ बिना पेज रीलोड के स्टेप 2 (पासवर्ड इनपुट व वैकल्पिक फोन OTP विकल्प)।
    - दर्ज मान का संक्षिप्त प्रीव्यू विथ एक्टिव नीला `Change` लिंक (स्टेप 1 पर लौटने हेतु)।
    - ऑटो-फ़ोकस प्रबंधन: पेज लोड पर कर्सर स्वतः ईमेल/मोबाइल फ़ील्ड पर, और "Continue" पर क्लिक के बाद तुरंत पासवर्ड फ़ील्ड पर फ़ोकस।
    - "Keep me signed in" चेकबॉक्स और उसके पूरे टेक्स्ट लेबल (`<label for="...">`) पर स्थायी `cursor: pointer !important;` और "Details" टूलटिप पॉपओवर।
    - पासवर्ड शो/हाइड (`Show`/`Hide`) आई बटन पर स्मूथ होवर व पॉइंटर कर्सर।
    - "Need help?" अकॉर्डियन विथ डायरेक्ट लिंक टू `forgot-password.html`।
    - "New to ElectroMart?" डिवाइडर विथ "Create your ElectroMart account" बटन (`register.html`)।
  - **समर्पित रजिस्ट्रेशन स्क्रीन (`register.html` & `register.js`):**
    - Your name, भारतीय 10-अंकीय मोबाइल नंबर (`/^[6-9]\d{9}$/`), ईमेल (वैकल्पिक), पासवर्ड (कम से कम 6 अक्षर), और 6-अंकीय OTP वेरिफिकेशन।
    - लीगल व सुरक्षा टेक्स्ट मैसेज नोटिस और "Already have an account? Sign in ▾" लिंक।
  - **समर्पित पासवर्ड सहायता स्क्रीन (`forgot-password.html` & `forgot-password.js`):**
    - ईमेल/मोबाइल दर्ज कर 1-क्लिक OTP वेरिफिकेशन और नया पासवर्ड रीसेट फ़्लो।
  - **100% ब्रांड सुरक्षा व पूर्ण बैकवर्ड कम्पैटिबिलिटी:**
    - सभी 59 HTML फाइल्स व 11 भाषाओं में ग्राहक-सामने 0 दृश्य "Amazon" टेक्स्ट (100% शुद्ध ElectroMart)।
    - लेगेसी `auth.html` व उसके टेस्ट्स पूर्णतः सुरक्षित।
  - **स्वचालित टेस्ट सूट:** `scratch/test-amazon-login-register.js` (7 / 7 टेस्ट ब्लॉक्स उत्तीर्ण, 100%)।

### C. 11 भारतीय भाषाओं का i18n अनुवाद इंजन (Multilingual Engine)
- **डिक्शनरी (`translations.js`):** हिंदी (`hi`), तमिल (`ta`), तेलुगु (`te`), मराठी (`mr`), बंगाली (`bn`), गुजराती (`gu`), कन्नड़ (`kn`), मलयालम (`ml`), पंजाबी (`pa`), उर्दू (`ur`), अंग्रेजी (`en`)।
- **यूनिवर्सल बस (`universal-i18n-bus.js`):** DOM म्यूटेशन को ट्रैक करके रियल-टाइम में डायनामिक कंटेंट का भी अनुवाद करती है।
- कार्ट, प्रोडक्ट्स लिस्टिंग, होमपेज, अकॉर्डियन चेकआउट, योर ऑर्डर्स हब, प्रोडक्ट डिटेल पेज (चरण 6), योर अकाउंट हब (चरण 7), विशलिस्ट हब (चरण 8), और ऑथ फ्लो (चरण 9) के सभी कीवर्ड्स 11 भाषाओं में 100% उपलब्ध।

### D. ब्रांड सुरक्षा एवं कानूनी अनुपालन (Brand Safety & Legal Compliance - PERMANENT LOCK)
- **कठोर नियम:** वेबसाइट `electromart.in` पर अमेज़न इंडिया की शैली, लेआउट और UX का उपयोग होता है, परंतु ग्राहक को दिखने वाले किसी भी टेक्स्ट, बैज या अनुवाद में "Amazon" / "अमेज़न" का नाम कभी नहीं आना चाहिए।
- **स्थायी ऑटोमेटेड गार्डरेल:** `scratch/test-brand-safety-and-legal-compliance.js` को `scratch/run_all_tests.js` में एकीकृत किया गया है। यह सभी 56 HTML पेजों, `translations.js` की सभी 11 भाषाओं और `products.js` को स्कैन करता है। यदि कहीं भी दिखाई देने वाला Amazon नाम आता है, तो टेस्ट तुरंत फेल हो जाता है।

### E. भारतीय GST अनुपालन एवं मल्टी-प्रोडक्ट कार्ट इंजन (Indian GST Compliance - Slabs & Multi-Product Cart)
- **18% व 28% वैधानिक स्लैब्स:** IT हार्डवेयर, लैपटॉप, बैटरियां, कंपोनेंट्स पर 18% (HSN `84713010`, `85076000`), और 32"+ स्मार्ट टेलीविज़न व लक्ज़री डिस्प्ले पर 28% (HSN `85287200`)।
- **751 उत्पाद पूरी तरह वर्गीकृत:** `products-data.js` और `backend/src/data/db.json` में प्रत्येक उत्पाद पर प्रामाणिक `hsnCode` और `gstRate` लागू।
- **मल्टी-प्रोडक्ट कार्ट व सटीक राउंडिंग:** कार्ट व चेकआउट में 18% और 28% के मिश्रित उत्पादों पर अलग-अलग व संयुक्त GST सटीक गणना (`Math.round(totalGst * 100) / 100`) से 0 पैसे का अंतर।
- **कूपन प्रो-रेशन (Proration):** कूपन डिस्काउंट को लाइन-टोटल के अनुपात में बांटकर सटीक टैक्स गणना।
- **11 भाषाओं में लेबल्स:** `Subtotal (Excl. Tax)`, `Estimated GST (18% / 28% / blended)`।
- **स्वचालित टेस्ट सूट:** `scratch/test-indian-gst-compliance.js` (100% पास)।

### F. ElectroMart Business B2B पोर्टल एवं GSTIN सत्यापन (Phase 18 Completed)
- **समर्पित B2B पोर्टल (`business.html`, `business.css`, `business.js`):** Amazon Business India शैली में निर्मित एग्जीक्यूटिव नेवी थीम (`#0f1e2e`), कॉर्पोरेट स्टैट्स, और टायर्ड होलसेल ग्रिड।
- **वैधानिक 15-अंकीय GSTIN सत्यापन:** भारतीय सांविधिक पैटर्न (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`) पर क्लाइंट-साइड रियल-टाइम फीडबैक, 01 से 38 तक राज्य कोड मैपिंग (उदा. 07 -> Delhi, 27 -> Maharashtra), और `electromart_business_profile_v1` में सुरक्षित प्रोफ़ाइल स्टोरेज।
- **B2B बल्क डिस्काउंट मैट्रिक्स व MOQ:** न्यूनतम ऑर्डर सीमा (MOQ >= 5 यूनिट्स), 5-9 यूनिट्स पर 5% छूट, 10-24 यूनिट्स पर 10% छूट, और 25+ यूनिट्स पर 15% छूट का पारदर्शी स्लैब।
- **इंटरएक्टिव बल्क कैलकुलेटर:** हार्डवेयर चयन, स्पिनर क्वांटिटी कंट्रोल, थोक छूट व 18%/28% GST इनपुट टैक्स क्रेडिट (ITC) की लाइव गणना, और 1-क्लिक "Add Bulk Order to Cart"।
- **B2B कार्ट सिंक्रोनाइज़ेशन व लाइन-आइटम बैज:** कार्ट और चेकआउट में `electromart_cart_v1`, `electromart_catalog_v1`, और `electromart_b2b_cart_meta_v1` का सहज समन्वय; प्रत्येक B2B आइटम पर `✓ [Tier] Discount` और `✓ GST ITC Eligible` बैज का दृश्य प्रदर्शन।
- **RFQ (Request for Quotation) पोर्टल:** 50+ यूनिट्स या कस्टम एंटरप्राइज खरीद हेतु मोडल फॉर्म, इनपुट सत्यापन, स्वतः जनरेटेड ट्रैकिंग आईडी (`EM-RFQ-XXXXXX`), और `electromart_rfq_requests_v1` में डेटा परसिस्टेंस।
- **माउस व कर्सर इंटरेक्शन (स्थायी नियम):** GSTIN इनपुट, ऑर्गनाइज़ेशन टाइप पिल्स, स्पिनर कंट्रोल्स, टियर कार्ड्स, और RFQ सबमिट बटन पर स्पष्ट `cursor: pointer !important;` और एक्टिव होवर स्टेट्स। साथ ही, बंद होने पर मोडल में `display: none !important; pointer-events: none !important;` द्वारा ज़ीरो-ऑक्लूजन (बिना किसी अनचाहे ओवरले के स्मूथ क्लिक्स)।
- **100% ब्रांड व लीगल सुरक्षा:** केवल ElectroMart Business (`electromart.in/business` / इलेक्ट्रोमार्ट बिज़नेस); 0 ग्राहक-सामने अमेज़न संदर्भ।
- **11 भारतीय भाषाओं में अनुवाद एवं स्वचालित टेस्ट:** `translations.js` की सभी 11 भाषाओं में B2B कीज और `scratch/test-b2b-bulk-purchase-portal.js` (9/9 ब्लॉक 100% पास)।

### G. Amazon India-Style Product Comparison Hub (Phase 19 Completed)
- **समर्पित 4-स्लॉट तुलना मैट्रिक्स (`compare.html`, `compare.css`, `compare.js`):** प्रामाणिक Amazon India-स्टाइल साइड-बाय-साइड तुलना तालिका, स्टिकी प्रोडक्ट हेडर कार्ड्स, और 4 से कम उत्पाद होने पर "+ Add a product to compare" स्लॉट कार्ड।
- **डायनामिक "Highlight Differences" टॉगल:** अंतर वाले स्पेसिफिकेशन पंक्तियों (Differential Spec Rows) का रीयल-टाइम डिटेक्शन और टॉगल सक्रिय होने पर कोमल एम्बर बैकग्राउंड (`#fff8e7`) व लेफ्ट ऑरेंज एक्सेंट बॉर्डर (`#ff9900`) के साथ विज़ुअल हाइलाइटिंग।
- **3-लाइन प्रामाणिक प्राइसिंग स्टैक व 1-क्लिक कार्ट:** प्रत्येक प्रोडक्ट कार्ड पर लाल डिस्काउंट प्रतिशत (`-XX%`), बड़ा बोल्ड ₹ मूल्य, M.R.P. स्ट्राइकथ्रू, फ्री डिलीवरी टैग, और 1-क्लिक "Add to Cart" (विथ `✓ Added` फीडबैक व हेडर `#cartCount` सिंक) तथा "Buy Now" डायरेक्ट चेकआउट।
- **क्विक प्रोडक्ट सेलेक्टर मोडल (`#addProductModal`):** 751 उत्पादों के कैटलॉग से लाइव इंस्टेंट सर्च, श्रेणी फ़िल्टर पिल्स (Laptops, Mobiles, Audio, Computers, Accessories), और 1-क्लिक "+ Add to Compare"।
- **लोकप्रिय तुलना प्रीसेट्स (Starter Presets):** खाली स्थिति में 1-क्लिक तुलना लोड करने के लिए 4 प्री-कॉन्फिगर्ड कार्ड्स (Top Laptops, Premium Audio, Smartphones, PC Components)।
- **शेयर तुलना लिंक:** URL क्वेरी पैरामीटर्स (`?ids=1,7,2`) द्वारा सीधे क्लिपबोर्ड पर तुलना लिंक कॉपी करने की सुविधा।
- **100% ब्रांड व लीगल सुरक्षा:** केवल ElectroMart (`electromart.in` / इलेक्ट्रोमार्ट); 0 ग्राहक-सामने "Amazon" / "अमेज़न" संदर्भ।
- **11 भारतीय भाषाओं में अनुवाद एवं स्वचालित टेस्ट:** `translations.js` की सभी 11 भाषाओं में तुलना कीज और `scratch/test-amazon-compare-hub.js` (100% पास)।

---

## 3. हालिया कमिट्स (Recent Commits)

- `df30664`: docs(handover): record complete phase 1-7 progress, brand safety lock, and roadmap for future agents
- `fcf12c1`: feat(brand-safety): enforce pure ElectroMart branding across Amazon-style UI with permanent guardrail test
- `e4ac24b`: feat(pdp): authentic Amazon India product detail page with bank offers, trust badges, interactive bundle, and 2-column reviews (Phase 6)
- `a2369e5`: feat(orders): authentic Amazon India Your Orders page with 4-tab bar, two-tier card, and tracking stepper (Phase 5)
- `3c5efb8`: feat(checkout): authentic Amazon India accordion checkout flow with address cards, payment summary, and review step (Phase 4)
- `4e1defc`: feat(homepage): authentic Amazon India hero overlap cards, deals carousels with paddles, and add-to-cart feedback (Phase 3)
- `d6b86cd`: feat(products): authentic Amazon India listing filters, 3-line pricing, social proof, and department tree (Phase 2)
- `16f8c2f`: feat(cart): authentic Amazon India cart with free delivery bar, item controls, and saved for later (Phase 1)
- `a840e50`: fix(search): isolate category dropdown hitbox from search input and update authentic Amazon search button and lens icon
- `4c643a2`: feat(search): Amazon India category dropdown facade (All ▾) and recent search history individual delete button

---

## 4. सर्वर पोर्ट्स और रन कमांड्स (Server Ports & Run Commands)

- **बैकएंड API:** Port `4000` (`npm start` in `backend/`) -> `http://localhost:4000/api/health`
- **फ्रंटएंड:** Port `5500` (`node qa-static-server.js` or Live Server) -> `http://localhost:5500/index.html`
- **टेस्ट रनर:** `node scratch/run_all_tests.js`
