const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("warranty.html");
const js = read("warranty.js");
const pdp = read("product-detail.html");
const pdpJs = read("product-detail.js");
const cart = read("cart.js");
const checkout = read("checkout.js");
const invoice = read("invoice.js");
const account = read("account.html");
const sitemap = read("sitemap.xml");
const translations = read("translations.js");

assert(html.includes('id="protectionPlanCatalog"'), "Warranty hub must expose plan catalog");
assert(html.includes('id="claimWizardForm"'), "Warranty hub must expose claim wizard");
assert(js.includes("extended_warranty_1y") && js.includes("complete_damage_1y"), "Both protection plans must exist");
assert(js.includes("eligibleFamilies") && js.includes("isProtectionEligible"), "Eligibility must be explicit");
assert(js.includes('sacCode: "998714"') && js.includes("gstRate: 0.18"), "Protection plans must use SAC and 18% GST");
assert(js.includes("EM-CLM-") && js.includes("generateClaimId"), "Claim IDs must use EM-CLM format");
assert(js.includes("findProtectedOrder") && js.includes("active protection plan"), "Claims must verify a protected order before submission");
assert(pdp.includes('id="protectionPlanWidget"'), "PDP must contain protection widget");
assert(pdpJs.includes("isProtectionEligible") && pdpJs.includes("protection:updated"), "PDP must implement eligible plan sync");
assert(cart.includes("protectionPlan") && checkout.includes("protectionPlan"), "Cart and checkout must preserve protection metadata");
assert(invoice.includes("protectionPlan") && invoice.includes("sacCode"), "Invoice must render protection service metadata");
assert(account.includes("warranty.html") && account.includes('id="tileWarranty"') && sitemap.includes("warranty.html"), "Warranty hub must be discoverable");
assert(translations.includes("PROTECTION_I18N") && ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr", "ur", "pa", "gu"].every((lang) => translations.includes(`${lang}:`)), "Protection i18n keys and languages must exist");
for (const file of ["warranty.html", "warranty.js", "warranty.css"]) {
  assert(!/Amazon Renewed|Amazon\.in|Amazon Basics/i.test(read(file)), `${file} contains prohibited customer-visible branding`);
}
console.log("Phase 32 warranty suite: 7 layers passed");
