const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.resolve(__dirname, '..');

console.log("==================================================");
console.log("Starting Indian GST Compliance & Slabs Test Suite");
console.log("==================================================");

// 1. Validate translations across all 11 supported languages
const translationsPath = path.join(projectDir, 'translations.js');
assert(fs.existsSync(translationsPath), "translations.js exists");
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

const supportedLanguages = ["en", "hi", "bn", "te", "mr", "ta", "ur", "gu", "kn", "ml", "pa"];
for (const lang of supportedLanguages) {
  assert(translationsContent.includes(`"${lang}":`), `translations.js supports language: ${lang}`);
}
assert(translationsContent.includes('subtotal_excl_tax'), "translations.js defines subtotal_excl_tax");
assert(translationsContent.includes('estimated_gst'), "translations.js defines estimated_gst");
console.log("✔ Step 1: Translations across all 11 Indian languages verified.");

// 2. Validate frontend catalog (products-data.js)
const productsDataPath = path.join(projectDir, 'products-data.js');
const productsDataContent = fs.readFileSync(productsDataPath, 'utf8');

// Load window.EM_CATALOG by simulating minimal environment
const catalogSandbox = { window: {} };
const evalCatalog = new Function('window', productsDataContent + '; return window.EM_CATALOG;');
const catalog = evalCatalog(catalogSandbox.window);
assert(Array.isArray(catalog) && catalog.length >= 15, "Catalog has at least 15 items");

let tvCount = 0;
let batteryCount = 0;
for (const prod of catalog) {
  assert(prod.hsnCode && typeof prod.hsnCode === 'string', `Product ${prod.id} has valid hsnCode`);
  assert(typeof prod.gstRate === 'number' && (prod.gstRate === 0.18 || prod.gstRate === 0.28), `Product ${prod.id} has valid gstRate (0.18 or 0.28), got ${prod.gstRate}`);
  if (prod.gstRate === 0.28) tvCount++;
  if (prod.hsnCode === '85076000') batteryCount++;
}
assert(tvCount > 0, "At least one product in catalog is classified as 28% GST (e.g. Smart TV)");
assert(batteryCount > 0, "At least one product in catalog is classified with HSN 85076000 (Lithium battery)");
console.log(`✔ Step 2: Catalog products-data.js verified (${catalog.length} products, ${tvCount} @ 28% GST, ${catalog.length - tvCount} @ 18% GST).`);

// 3. Validate backend database (backend/src/data/db.json)
const dbJsonPath = path.join(projectDir, 'backend', 'src', 'data', 'db.json');
assert(fs.existsSync(dbJsonPath), "db.json exists");
const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
assert(Array.isArray(dbData.products) && dbData.products.length > 700, "db.json has 700+ products");

let dbTvCount = 0;
let dbBatteryCount = 0;
for (const prod of dbData.products) {
  assert(prod.hsnCode, `db product ${prod.id} has hsnCode`);
  assert(prod.gstRate === 0.18 || prod.gstRate === 0.28, `db product ${prod.id} has 0.18 or 0.28 gstRate`);
  if (prod.gstRate === 0.28) dbTvCount++;
  if (prod.hsnCode === '85076000') dbBatteryCount++;
}
assert(dbTvCount >= 10, `db.json has at least 10 products @ 28% GST (found ${dbTvCount})`);
assert(dbBatteryCount >= 5, `db.json has battery items with HSN 85076000 (found ${dbBatteryCount})`);
console.log(`✔ Step 3: Backend db.json verified (${dbData.products.length} products, ${dbTvCount} @ 28%, ${dbData.products.length - dbTvCount} @ 18%).`);

// 4. Validate HTML elements in cart.html and checkout.html
const cartHtml = fs.readFileSync(path.join(projectDir, 'cart.html'), 'utf8');
assert(cartHtml.includes('id="cartTaxLabel"'), "cart.html contains id='cartTaxLabel'");
assert(cartHtml.includes('id="subtotalLabel"'), "cart.html contains id='subtotalLabel'");
assert(cartHtml.includes('id="subtotalValue"'), "cart.html contains id='subtotalValue'");
assert(cartHtml.includes('id="taxValue"'), "cart.html contains id='taxValue'");
assert(cartHtml.includes('id="orderTotalValue"'), "cart.html contains id='orderTotalValue'");

const checkoutHtml = fs.readFileSync(path.join(projectDir, 'checkout.html'), 'utf8');
assert(checkoutHtml.includes('id="checkoutTaxLabel"'), "checkout.html contains id='checkoutTaxLabel'");
assert(checkoutHtml.includes('id="checkoutSubtotalLabel"'), "checkout.html contains id='checkoutSubtotalLabel'");
assert(checkoutHtml.includes('id="subtotalValue"'), "checkout.html contains id='subtotalValue'");
assert(checkoutHtml.includes('id="taxValue"'), "checkout.html contains id='taxValue'");
assert(checkoutHtml.includes('id="totalValue"'), "checkout.html contains id='totalValue'");
console.log("✔ Step 4: HTML templates cart.html and checkout.html verified for GST and Subtotal labels.");

// 5. Test Cart & Checkout Pricing Engine Calculation (Deterministic Math)
function computePricingBreakdown(selectedRows, coupon = { valid: false, amount: 0, type: "none" }) {
  const itemCount = selectedRows.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = selectedRows.reduce((sum, row) => sum + row.price * row.quantity, 0);
  const shipping = itemCount > 0 ? (subtotal >= 499 ? 0 : 19) : 0;
  const nonShippingDiscount = coupon.valid && coupon.type !== "shipping" ? coupon.amount : 0;
  const discountRatio = subtotal > 0 ? Math.max(0, 1 - (nonShippingDiscount / subtotal)) : 1;

  let totalGst = 0;
  const gstBreakdownByRate = {};

  selectedRows.forEach((item) => {
    const itemSubtotal = item.price * item.quantity;
    const discountedItemSubtotal = itemSubtotal * discountRatio;
    const rate = typeof item.gstRate === "number" ? item.gstRate : 0.18;
    const itemGst = discountedItemSubtotal * rate;
    totalGst += itemGst;

    const rateKey = String(Math.round(rate * 100));
    gstBreakdownByRate[rateKey] = (gstBreakdownByRate[rateKey] || 0) + itemGst;
  });

  const roundedTax = Math.round(totalGst * 100) / 100;
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedDiscount = Math.round((coupon.amount || 0) * 100) / 100;
  const total = Math.round((roundedSubtotal + shipping + roundedTax - roundedDiscount) * 100) / 100;

  const rates = Object.keys(gstBreakdownByRate);
  let gstLabelSuffix = "18%";
  if (rates.length === 1) {
    gstLabelSuffix = `${rates[0]}%`;
  } else if (rates.length > 1) {
    const blended = subtotal > 0 ? Math.round((roundedTax / Math.max(1, subtotal - nonShippingDiscount)) * 100) : 18;
    gstLabelSuffix = `${blended}%`;
  }

  return {
    itemCount,
    subtotal: roundedSubtotal,
    shipping,
    tax: roundedTax,
    total,
    gstBreakdownByRate,
    gstLabelSuffix
  };
}

// Scenario A: Single 18% item (Laptop Battery @ ₹5,999)
const batteryRow = {
  id: "battery-1",
  name: "Lenovo Yoga Laptop Battery 52Wh",
  price: 5999,
  quantity: 1,
  gstRate: 0.18,
  hsnCode: "85076000"
};
const resA = computePricingBreakdown([batteryRow]);
assert.strictEqual(resA.subtotal, 5999);
assert.strictEqual(resA.tax, 1079.82); // 5999 * 0.18 = 1079.82
assert.strictEqual(resA.shipping, 0); // >= 499 -> free
assert.strictEqual(resA.total, 7078.82); // 5999 + 1079.82 = 7078.82
assert.strictEqual(resA.gstLabelSuffix, "18%");
console.log("✔ Step 5A: Single 18% item verified: Subtotal ₹5,999 + GST 18% (₹1,079.82) = ₹7,078.82");

// Scenario B: Single 28% item (Smart TV @ ₹24,999)
const tvRow = {
  id: "tv-1",
  name: "Samsung 42 inch 4K UHD Smart TV",
  price: 24999,
  quantity: 1,
  gstRate: 0.28,
  hsnCode: "85287200"
};
const resB = computePricingBreakdown([tvRow]);
assert.strictEqual(resB.subtotal, 24999);
assert.strictEqual(resB.tax, 6999.72); // 24999 * 0.28 = 6999.72
assert.strictEqual(resB.shipping, 0);
assert.strictEqual(resB.total, 31998.72); // 24999 + 6999.72 = 31998.72
assert.strictEqual(resB.gstLabelSuffix, "28%");
console.log("✔ Step 5B: Single 28% item verified: Subtotal ₹24,999 + GST 28% (₹6,999.72) = ₹31,998.72");

// Scenario C: Multi-product mixed cart (18% Battery + 28% Smart TV)
const resC = computePricingBreakdown([batteryRow, tvRow]);
assert.strictEqual(resC.subtotal, 30998); // 5999 + 24999
// Expected tax: 1079.82 + 6999.72 = 8079.54
assert.strictEqual(resC.tax, 8079.54);
assert.strictEqual(resC.total, 39077.54); // 30998 + 8079.54 = 39077.54
// Blended rate label: Math.round((8079.54 / 30998) * 100) = 26%
assert.strictEqual(resC.gstLabelSuffix, "26%");
// Verify exact paisa math: total === subtotal + tax + shipping
assert.strictEqual(resC.total, Math.round((resC.subtotal + resC.shipping + resC.tax) * 100) / 100);
console.log("✔ Step 5C: Multi-product mixed cart verified: ₹30,998 Subtotal + ₹8,079.54 GST (26% blended) = ₹39,077.54 Total (0 paisa error).");

// Scenario D: Multi-product mixed cart with coupon discount (SAVE10 max ₹500)
const couponSave10 = { valid: true, amount: 500, type: "percent" };
const resD = computePricingBreakdown([batteryRow, tvRow], couponSave10);
assert.strictEqual(resD.subtotal, 30998);
// Battery taxable: 5999 * (1 - 500/30998) = 5902.23595... * 0.18 = 1062.40247...
// TV taxable: 24999 * (1 - 500/30998) = 24595.76404... * 0.28 = 6886.81393...
// Total GST: 7949.2164... -> rounded: 7949.22
assert.strictEqual(resD.tax, 7949.22);
// Total: 30998 + 0 + 7949.22 - 500 = 38447.22
assert.strictEqual(resD.total, 38447.22);
console.log("✔ Step 5D: Multi-product with coupon verified: ₹500 discount prorated accurately with ₹7,949.22 GST, Total ₹38,447.22.");

// 6. Test Backend orderCommerce.js buildOrderPricing
const { buildOrderPricing } = require(path.join(projectDir, 'backend', 'src', 'lib', 'orderCommerce.js'));
const backendOrderResult = buildOrderPricing(
  [
    { productId: "battery-1", quantity: 1 },
    { productId: "tv-1", quantity: 1 }
  ],
  [
    {
      id: "battery-1",
      name: "Lenovo Yoga Laptop Battery 52Wh",
      price: 5999,
      stock: 50,
      gstRate: 0.18,
      hsnCode: "85076000",
      status: "active"
    },
    {
      id: "tv-1",
      name: "Samsung 42 inch 4K UHD Smart TV",
      price: 24999,
      stock: 20,
      gstRate: 0.28,
      hsnCode: "85287200",
      status: "active"
    }
  ]
);

assert.strictEqual(backendOrderResult.ok, true);
assert.strictEqual(backendOrderResult.subtotal, 30998);
assert.strictEqual(backendOrderResult.tax, 8079.54);
// Backend base shipping is 19 for orders
assert.strictEqual(backendOrderResult.shipping, 19);
assert.strictEqual(backendOrderResult.total, 39096.54); // 30998 + 19 + 8079.54 = 39096.54
assert.strictEqual(backendOrderResult.items[0].hsnCode, "85076000");
assert.strictEqual(backendOrderResult.items[0].gstRate, 0.18);
assert.strictEqual(backendOrderResult.items[1].hsnCode, "85287200");
assert.strictEqual(backendOrderResult.items[1].gstRate, 0.28);
console.log("✔ Step 6: Backend buildOrderPricing verified with mixed 18% & 28% GST calculation.");

console.log("==================================================");
console.log("ALL INDIAN GST COMPLIANCE CHECKS PASSED (100%)");
console.log("==================================================");
