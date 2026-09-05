# ElectroMart — AI Agent Handover & Continuation Manual (हैंडओवर एवं निरंतरता नियमावली)

**अंतिम अद्यतन (Last Updated):** सितंबर 2026  
**शाखा (Branch):** `main`  
**वेबसाइट:** `electromart.in`  
**वर्तमान टेस्ट स्कोर:** **111 / 111 Tests Passing (100%)** — 37 Frontend Suites + 74 Backend Unit Tests

---

## 📌 1. भावी AI एजेंट्स और डेवलपर्स के लिए मुख्य संदेश (Crucial Notice for Future Agents)

> [!CAUTION]
> ### 🚨 अनिवार्य ब्रांड सुरक्षा एवं कानूनी नियम (STRICT LEGAL & BRAND SAFETY POLICY)
> 1. हमारी वेबसाइट का लेआउट, डिज़ाइन, रंग पैलेट और UX पूरी तरह **Amazon India** से प्रेरित है।
> 2. **परंतु वेबसाइट पर "Amazon" या "अमेज़न" का नाम किसी भी दृश्य (Customer-Facing) टेक्स्ट, बैज, बटन, फ़िल्टर हेडर, विवरण या अनुवाद में 100% वर्जित (Strictly Prohibited) है।**
> 3. वेबसाइट का नाम केवल और केवल **ElectroMart (`electromart.in` / इलेक्ट्रोमार्ट)** है।
> 4. बैज नाम हमेशा **"ElectroMart's Choice" (इलेक्ट्रोमार्ट चॉइस)** होगा। फ़िल्टर हेडर **"ElectroMart Filters" (इलेक्ट्रोमार्ट फ़िल्टर)** होगा।
> 5. **चेतावनी:** आंतरिक CSS क्लास (उदा. `.amazon-layout`, `.amazon-price-block`, `.ac-badge-pill`) और आंतरिक DOM IDs (उदा. `#amazonsChoiceBadge`, `#amazonAccountGrid`) को न बदलें, क्योंकि स्टाइलशीट्स और रिग्रेशन टेस्ट उन पर निर्भर हैं। केवल दिखने वाला टेक्स्ट ही ElectroMart होना चाहिए।

---

## 🛠️ 2. अनिवार्य टेस्ट कमांड्स (Mandatory Test Protocol)

किसी भी कार्य को शुरू करने से पहले और समाप्त करने के बाद ये कमांड्स चलाना अनिवार्य है:

### A. फ्रंटएंड एवं अनुवाद टेस्ट (37 Test Suites):
```bash
cd c:\Users\Admin\Documents\GitHub\Electronic-Store
node scratch/run_all_tests.js
```
*परिणाम: 37 / 37 PASS होने चाहिए। इसमें 35वां सूट `test-brand-safety-and-legal-compliance.js` है जो सभी 49 HTML पेजों और 11 भाषाओं में Amazon नाम की जांच करता है, और 37वां सूट `test-amazon-auth.js` है।*

### B. बैकएंड यूनिट टेस्ट्स (74 Unit Tests):
```bash
cd c:\Users\Admin\Documents\GitHub\Electronic-Store\backend
npm run test:unit
```
*परिणाम: 74 / 74 PASS होने चाहिए।*

---

## 🚀 3. अब तक पूर्ण हो चुका कार्य (Completed Phases 1 to 9)

| चरण | विषय / मॉड्यूल | फ़ाइलें | मुख्य फीचर्स |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Shopping Cart** | `cart.html`, `cart.js` | ₹499+ फ़्री डिलीवरी बार, आइटम चेकबॉक्स, Saved for Later शेल्फ़, स्टिकी बाय बॉक्स। |
| **Phase 2** | **Products Listing & Facets** | `products.html`, `products.js` | 6-डिपार्टमेंट ट्री, 4★ & Up रेटिंग, कस्टम ₹ प्राइस रेंज, 3-लाइन प्राइसिंग, ElectroMart's Choice बैज। |
| **Phase 3** | **Homepage & Carousels** | `index.html`, `homepage-products.js` | -240px क्वाड ग्रिड कार्ड्स, 44×88px पैडल्स, लाइव काउंटडाउन डील्स, 1-क्लिक Add-to-Cart फीडबैक। |
| **Phase 4** | **Accordion Checkout** | `checkout.html`, `checkout.js` | 3-स्टेप इंटरएक्टिव अकॉर्डियन (Address, Payment, Review), चेंज बटन्स, स्टिकी ऑर्डर समरी। |
| **Phase 5** | **Your Orders & Tracking** | `orders.html`, `orders.js` | 4-टैब बार (Orders, Buy Again, Not Shipped, Cancelled), दो-स्तरीय कार्ड, 4-स्टेप ट्रैकिंग प्रोग्रेस स्टेपर। |
| **Phase 6** | **Product Detail Page (PDP)** | `product-detail.html`, `product-detail.js` | थंबनेल रेल विथ ज़ूम लेंस, बैंक ऑफर्स, 5 ट्रस्ट बैज, Frequently Bought Together बंडल, 2-कॉलम रिव्यूज़। |
| **Phase 7** | **Your Account Hub** | `account.html`, `account.js` | प्रामाणिक 8-टाइल नेविगेशन ग्रिड, ElectroMart Pay Balance वॉलेट (+₹500/+₹1000), प्राइम कार्ड, 24x7 सपोर्ट। |
| **Phase 8** | **Wishlist Hub** | `wishlist.html`, `wishlist.js` | 2-कॉलम लेआउट, मल्टी-लिस्ट्स, पब्लिक/प्राइवेट टॉगल, प्राइस ड्रॉप बैज, 1-क्लिक Move to Cart। |
| **Phase 9** | **Authentication Flow** | `auth.html`, `auth.js`, `auth.css` | सेंटर्ड कार्ड `#authCard`, IN +91 प्रीफ़िक्स, पासवर्ड शो/हाइड टॉगल, Need help अकॉर्डियन, Create account स्विच। |
| **Brand Safety** | **ब्रांड सुरक्षा गार्डरेल** | `scratch/test-brand-safety-and-legal-compliance.js` | 0 विज़िबल Amazon नाम, 11 भाषाओं का पूर्ण अनुवाद, ऑटोमेटेड CI रिग्रेशन लॉक। |

---

## 🧭 4. आगामी चरणों की विस्तृत कार्ययोजना (Next Steps Roadmap)

भविष्य के किसी भी एजेंट को दोबारा काम शुरू करने के लिए यहाँ से आगे बढ़ना है:

### 🔹 चरण 9 (Phase 9): Authentication Flow (`auth.html`) — ✅ पूर्ण (COMPLETED)
- **उपलब्धियां:**
  - प्रामाणिक अमेज़न सेंटर्ड ऑथ कार्ड (`#authCard`, `.amz-auth-card`) विथ मिनिमलिस्ट लोगो हेडर।
  - भारतीय मोबाइल नंबर इनपुट के लिए `IN +91` कंट्री कोड प्रीफिक्स बैज।
  - पासवर्ड विजिबिलिटी शो/हाइड टॉगल बटन्स (`.amz-toggle-pwd-btn`) विथ क्लीन SVG आई आइकन्स।
  - "Need help?" ड्रॉपडाउन अकॉर्डियन (`<details class="amz-auth-help-accordion">`) विथ पासवर्ड रीसेट लिंक और अन्य इश्यूज़।
  - "New to ElectroMart?" ऑथ डिवाइडर विथ "Create your ElectroMart account" सेकेंडरी बटन (`#switchToSignupBtn`) और साइन-इन स्विच।
  - अमेज़न येलो पिल प्राइमरी बटन्स (`.amz-btn-auth-primary`), कस्टम फ़ोकस ग्लो, और लीगल नोटिस।
  - 100% बैकवर्ड कम्पैटिबिलिटी: सभी 41+ लेगेसी एडमिन/सेलर सेंट्रल DOM IDs और टेस्ट्स सुरक्षित।
  - 11 भारतीय भाषाओं में i18n अनुवाद और स्वचालित टेस्ट सूट `scratch/test-amazon-auth.js` (100% पास)।
  - टेस्ट सूट परिणाम: 37 / 37 टेस्ट सूट्स उत्तीर्ण (100%), बैकएंड 74 / 74 उत्तीर्ण (100%), कुल 111 / 111।

### 🔹 चरण 10 (Phase 10): Delivery Location / Pincode Modal
- **लक्ष्य:** अमेज़न हेडर में स्थित "Deliver to [City] [Pincode]" सेलेक्टर पर क्लिक करने पर पॉपअप मोडल।
- **मुख्य फीचर्स:**
  - 6-अंकों का भारतीय पिनकोड इनपुट।
  - सेव्ड एड्रेस से 1-क्लिक चयन।
  - पिनकोड के आधार पर डिलीवरी तिथि (जैसे "Get it by Tomorrow, 11 AM") का लाइव कैलकुलेशन।

### 🔹 चरण 11 (Phase 11): Deals & Best Sellers Dedicated Hubs
- **फ़ाइलें:** `todays-deals.html`, `best-sellers.html`
- **लक्ष्य:** अमेज़न स्टाइल हॉरिजॉन्टल डिपार्टमेंट पिल बार और "Deal of the Day" ग्रिड्स।

### 🔹 चरण 12 (Phase 12): Store Operations / Admin Dashboard
- **फ़ाइल:** `admin-dashboard.html`
- **लक्ष्य:** Seller Central स्टाइल डार्क-नेवी बार, इन्वेंट्री मैनेजमेंट, और रीयल-टाइम ऑर्डर मेट्रिक्स।

---

## 🔒 5. Git चेकपॉइंट नियम (Commit Protocol)
काम पूरा होने और सभी 109 टेस्ट पास होने पर इस प्रारूप में कमिट करें:
```bash
git add .
git commit -m "feat(phase-X): descriptive summary of completed work"
```
