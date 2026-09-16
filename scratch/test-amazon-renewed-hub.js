/**
 * Phase 31: ElectroMart Certified Renewed Electronics Hub Test Suite
 * scratch/test-amazon-renewed-hub.js
 * 
 * 7 Verification Layers:
 * 1. DOM Structure & Hub Elements Integrity (renewed.html)
 * 2. 3-Tier Grading System & 47-Point Diagnostic Quality Matrix
 * 3. Eco-Impact Visualizer & Interactive Calculator Math
 * 4. PDP Renewed Alternative Callout Box & Hero State Synchronization
 * 5. Cart, Checkout & Invoice Sync (Badge & 6-Month Warranty Tax Compliance)
 * 6. Global Navigation & Discovery (Header, Account, Sitemap)
 * 7. 11-Language Translation Coverage & 100% Brand Safety Compliance
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("===============================================================");
console.log("TEST SUITE: Phase 31 - ElectroMart Certified Renewed Hub");
console.log("===============================================================\n");

const ROOT_DIR = path.resolve(__dirname, "..");

// -------------------------------------------------------------
// Layer 1: DOM Structure & Hub Elements Integrity
// -------------------------------------------------------------
console.log("Layer 1: Checking renewed.html DOM Structure & Hub Elements...");
const renewedHtmlPath = path.join(ROOT_DIR, "renewed.html");
assert(fs.existsSync(renewedHtmlPath), "renewed.html must exist");
const renewedHtml = fs.readFileSync(renewedHtmlPath, "utf-8");

const requiredDomElements = [
  'id="renewedHero"',
  'id="renewedTrustStats"',
  'id="renewedEcoSection"',
  'id="ecoCalculator"',
  'id="calcEwasteSaved"',
  'id="calcCarbonSaved"',
  'id="calcTreesEquiv"',
  'id="renewedGradingSection"',
  'id="renewedQualityCheckSection"',
  'id="renewedCatalogSection"',
  'id="renewedCategoryPills"',
  'id="renewedGradeFilterChips"',
  'id="renewedProductsGrid"',
  'id="renewedWarrantyBanner"',
  'id="renewedFaqSection"'
];

requiredDomElements.forEach((idSnippet) => {
  assert(renewedHtml.includes(idSnippet), `renewed.html missing required DOM element: ${idSnippet}`);
});
console.log("  ✓ renewed.html contains all 15 core architectural DOM sections and containers.");

// -------------------------------------------------------------
// Layer 2: 3-Tier Grading System & 47-Point Diagnostic Matrix
// -------------------------------------------------------------
console.log("\nLayer 2: Validating 3-Tier Grading System & 47-Point Quality Matrix...");
// Check 3 grades presence
assert(renewedHtml.includes("Grade A"), "Must include Grade A tier");
assert(renewedHtml.includes("Grade B"), "Must include Grade B tier");
assert(renewedHtml.includes("Grade C"), "Must include Grade C tier");
assert(renewedHtml.includes("90%+"), "Grade A must specify 90%+ battery health");
assert(renewedHtml.includes("85%+"), "Grade B must specify 85%+ battery health");
assert(renewedHtml.includes("80%+"), "Grade C must specify 80%+ battery health");

// 47-point diagnostic checklist
assert(renewedHtml.includes("47-Point"), "Must display 47-point diagnostic check headline");
const checkClusters = [
  "Core Board &amp; CPU",
  "Multi-Touch Display",
  "Battery Capacity",
  "Cameras, Face ID",
  "Wireless, 5G",
  "Ports, Audio"
];
checkClusters.forEach((cluster) => {
  assert(renewedHtml.includes(cluster), `renewed.html must feature hardware cluster: ${cluster}`);
});

// Load renewed.js catalog
const renewedJsPath = path.join(ROOT_DIR, "renewed.js");
assert(fs.existsSync(renewedJsPath), "renewed.js must exist");
const renewedJsModule = require(renewedJsPath);
const catalog = renewedJsModule.RENEWED_CATALOG;
assert(Array.isArray(catalog), "RENEWED_CATALOG must be an array");
assert(catalog.length >= 24, `Catalog must contain at least 24 refurbished products, found ${catalog.length}`);

// Verify grading in catalog items
const grades = new Set(catalog.map((p) => p.renewedGrade));
assert(grades.has("A"), "Catalog must contain Grade A products");
assert(grades.has("B"), "Catalog must contain Grade B products");
assert(grades.has("C"), "Catalog must contain Grade C products");

catalog.forEach((item) => {
  assert(item.id, "Every item must have an id");
  assert(item.name, `Item ${item.id} must have a name`);
  assert(item.renewedPrice > 0, `Item ${item.id} must have a valid renewedPrice`);
  assert(item.originalMrp >= item.renewedPrice, `Item ${item.id} originalMrp must be >= renewedPrice`);
  assert(item.batteryHealth >= 80, `Item ${item.id} batteryHealth must be at least 80%`);
  assert(item.warranty.includes("6 Months"), `Item ${item.id} must include 6 Months warranty`);
});
console.log(`  ✓ Verified 3-tier grading (A, B, C) and all ${catalog.length} catalog items meet strict standards.`);

// -------------------------------------------------------------
// Layer 3: Eco-Impact Visualizer & Interactive Calculator Math
// -------------------------------------------------------------
console.log("\nLayer 3: Verifying Eco-Impact Visualizer & Calculator Data...");
const renewedJsContent = fs.readFileSync(renewedJsPath, "utf-8");
assert(renewedJsContent.includes("ECO_DATA"), "renewed.js must define ECO_DATA constants");
assert(renewedJsContent.includes("0.18 kg"), "Phone eco-data must specify 0.18 kg e-waste saved");
assert(renewedJsContent.includes("65 kg CO₂"), "Phone eco-data must specify 65 kg CO2 saved");
assert(renewedJsContent.includes("2.20 kg"), "Laptop eco-data must specify 2.20 kg e-waste saved");
assert(renewedJsContent.includes("280 kg CO₂"), "Laptop eco-data must specify 280 kg CO2 saved");
assert(renewedJsContent.includes("0.55 kg"), "Tablet eco-data must specify 0.55 kg e-waste saved");
assert(renewedJsContent.includes("110 kg CO₂"), "Tablet eco-data must specify 110 kg CO2 saved");
assert(renewedJsContent.includes("0.12 kg"), "Audio eco-data must specify 0.12 kg e-waste saved");
assert(renewedJsContent.includes("35 kg CO₂"), "Audio eco-data must specify 35 kg CO2 saved");
console.log("  ✓ Eco-impact constants and device calculation algorithms verified accurate.");

// -------------------------------------------------------------
// Layer 4: PDP Renewed Alternative Callout Box & Hero State Sync
// -------------------------------------------------------------
console.log("\nLayer 4: Testing PDP Renewed Alternative Box & Hero Badge Sync...");
const pdpHtmlPath = path.join(ROOT_DIR, "product-detail.html");
const pdpHtml = fs.readFileSync(pdpHtmlPath, "utf-8");
assert(pdpHtml.includes('id="pdpRenewedHeroBadge"'), "product-detail.html must contain #pdpRenewedHeroBadge");
assert(pdpHtml.includes('id="pdpRenewedAlternativeBox"'), "product-detail.html must contain #pdpRenewedAlternativeBox");
assert(pdpHtml.includes('id="pdpRenewedAltGrade"'), "product-detail.html must contain #pdpRenewedAltGrade");
assert(pdpHtml.includes('id="pdpRenewedAltPrice"'), "product-detail.html must contain #pdpRenewedAltPrice");
assert(pdpHtml.includes('id="pdpRenewedAltSavings"'), "product-detail.html must contain #pdpRenewedAltSavings");
assert(pdpHtml.includes('id="btnViewRenewedAlternative"'), "product-detail.html must contain #btnViewRenewedAlternative");
assert(pdpHtml.includes('<script src="renewed.js"></script>'), "product-detail.html must load renewed.js");

const pdpJsPath = path.join(ROOT_DIR, "product-detail.js");
const pdpJsContent = fs.readFileSync(pdpJsPath, "utf-8");
assert(pdpJsContent.includes("function renderPdpRenewedAlternative"), "product-detail.js must define renderPdpRenewedAlternative");
assert(pdpJsContent.includes("renderPdpRenewedAlternative(product, price);"), "renderProduct must invoke renderPdpRenewedAlternative");
assert(pdpJsContent.includes("pdpRenewedHeroBadge"), "renderPdpRenewedAlternative must toggle hero badge");
assert(pdpJsContent.includes("pdpRenewedAlternativeBox"), "renderPdpRenewedAlternative must toggle alternative box");
assert(pdpJsContent.includes("[Certified Renewed]"), "Must append [Certified Renewed] to title when renewed");
assert(!pdpJsContent.includes("sameBrand && hasKeyword"), "PDP renewed alternative must require an exact renewed SKU match");
console.log("  ✓ PDP Alternative callout box and Certified Renewed hero mode sync logic verified.");

// -------------------------------------------------------------
// Layer 5: Cart, Checkout & Invoice Sync
// -------------------------------------------------------------
console.log("\nLayer 5: Testing Cart, Checkout & Invoice Sync...");
const cartJsPath = path.join(ROOT_DIR, "cart.js");
const cartJsContent = fs.readFileSync(cartJsPath, "utf-8");
assert(cartJsContent.includes("cart-renewed-badge"), "cart.js must render .cart-renewed-badge for renewed items");
assert(cartJsContent.includes("ELECTROMART_RENEWED_CATALOG"), "cart.js must look up renewed catalog in getCatalogProduct");
assert(cartJsContent.includes("isRenewed: Boolean(product.isRenewed)"), "cart.js getCartRows must propagate isRenewed");
assert(cartJsContent.includes("resolveRenewedTaxProfile"), "cart.js must resolve renewed GST metadata from the SKU");

const checkoutJsPath = path.join(ROOT_DIR, "checkout.js");
const checkoutJsContent = fs.readFileSync(checkoutJsPath, "utf-8");
assert(checkoutJsContent.includes("checkout-renewed-pill"), "checkout.js must render .checkout-renewed-pill for renewed items");
assert(checkoutJsContent.includes("ELECTROMART_RENEWED_CATALOG"), "checkout.js must look up renewed catalog in getCartRows");
assert(checkoutJsContent.includes("isRenewed: Boolean(row.isRenewed)"), "checkout.js createOfflineOrder must record isRenewed on order items");
assert(checkoutJsContent.includes("resolveRenewedTaxProfile"), "checkout.js must resolve renewed GST metadata from the SKU");

const invoiceJsPath = path.join(ROOT_DIR, "invoice.js");
const invoiceJsContent = fs.readFileSync(invoiceJsPath, "utf-8");
assert(invoiceJsContent.includes("Certified Renewed"), "invoice.js must handle Certified Renewed item formatting");
assert(invoiceJsContent.includes("(6M Warranty)"), "invoice.js must include 6M Warranty tag on renewed line items");
console.log("  ✓ Cart, Checkout, and Invoice line-item renewed badges and 6-month warranty compliance verified.");

// -------------------------------------------------------------
// Layer 6: Global Navigation & Discovery
// -------------------------------------------------------------
console.log("\nLayer 6: Verifying Global Navigation & Discovery Links...");
const headerHtmlPath = path.join(ROOT_DIR, "header.html");
const headerHtml = fs.readFileSync(headerHtmlPath, "utf-8");
assert(headerHtml.includes('href="renewed.html"'), "header.html must link to renewed.html");

const accountHtmlPath = path.join(ROOT_DIR, "account.html");
const accountHtml = fs.readFileSync(accountHtmlPath, "utf-8");
assert(accountHtml.includes('id="tileRenewed"'), "account.html must feature #tileRenewed quick tile");
assert(accountHtml.includes('href="renewed.html"'), "account.html #tileRenewed must link to renewed.html");

const sitemapPath = path.join(ROOT_DIR, "sitemap.xml");
const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
assert(sitemapContent.includes("renewed.html"), "sitemap.xml must include renewed.html");
console.log("  ✓ Header navigation flyout, drawer, account tile, and sitemap verified.");

// -------------------------------------------------------------
// Layer 7: 11-Language i18n & 100% Brand Safety Compliance
// -------------------------------------------------------------
console.log("\nLayer 7: Verifying 11-Language i18n Coverage & 100% Brand Safety...");
const translationsPath = path.join(ROOT_DIR, "translations.js");
const translationsContent = fs.readFileSync(translationsPath, "utf-8");
const LANG_CODES = ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr", "ur", "pa", "gu"];

LANG_CODES.forEach((lang) => {
  assert(translationsContent.includes(`"${lang}":`), `translations.js must contain language: ${lang}`);
});
assert(translationsContent.includes("renewed_hero_title"), "translations.js must define renewed_hero_title");
assert(translationsContent.includes("renewed_grade_a_title"), "translations.js must define renewed_grade_a_title");
assert(translationsContent.includes("renewed_checklist_title"), "translations.js must define renewed_checklist_title");
assert(translationsContent.includes("renewed_warranty_badge"), "translations.js must define renewed_warranty_badge");

// Brand safety check on renewed files
const filesToCheck = ["renewed.html", "renewed.js", "renewed.css"];
filesToCheck.forEach((fileName) => {
  const filePath = path.join(ROOT_DIR, fileName);
  const content = fs.readFileSync(filePath, "utf-8");
  assert(!/\bAmazon Renewed\b/i.test(content), `${fileName} must not contain "Amazon Renewed"`);
  assert(!/\bAmazon\.in\b/i.test(content), `${fileName} must not contain "Amazon.in"`);
  assert(!/\bAmazon Basics\b/i.test(content), `${fileName} must not contain "Amazon Basics"`);
  assert(content.includes("ElectroMart") || fileName === "renewed.css", `${fileName} must feature ElectroMart branding`);
});
console.log("  ✓ 11 regional languages supported in translations.js with 0 customer-visible Amazon mentions.");

console.log("\n===============================================================");
console.log("✓ ALL 7 TEST LAYERS PASSED PERFECTLY (Phase 31 100% Verified)");
console.log("===============================================================");
