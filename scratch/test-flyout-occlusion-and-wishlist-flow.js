const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectDir = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const headerHtml = fs.readFileSync(path.join(projectDir, 'header.html'), 'utf8');
const headerJs = fs.readFileSync(path.join(projectDir, 'header.js'), 'utf8');
const prodHtml = fs.readFileSync(path.join(projectDir, 'products.html'), 'utf8');
const prodJs = fs.readFileSync(path.join(projectDir, 'products.js'), 'utf8');
const prodCss = fs.readFileSync(path.join(projectDir, 'products.css'), 'utf8');
const cartJs = fs.readFileSync(path.join(projectDir, 'cart.js'), 'utf8');
const wishlistJs = fs.readFileSync(path.join(projectDir, 'wishlist.js'), 'utf8');
const amazonCss = fs.readFileSync(path.join(projectDir, 'amazon-theme.css'), 'utf8');

console.log("================================================================================");
console.log("=== Testing Cart Flyout & Quick View Occlusion Fix + Wishlist & Save Flow ===");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. Cart Flyout Occlusion & Click-Blocking Fix
// -----------------------------------------------------------------------------
console.log("1. Testing Cart Flyout Occlusion Prevention...");

// Check CSS rules for inactive overlay & drawer
assert(amazonCss.includes('.cart-flyout-overlay') && amazonCss.includes('#cartFlyoutOverlay'), "Must target .cart-flyout-overlay and #cartFlyoutOverlay in CSS");
assert(amazonCss.includes('pointer-events: none !important;'), "Must enforce pointer-events: none !important; on inactive overlay/drawer");

// Check active overlay & drawer rules
assert(amazonCss.includes('.cart-flyout-overlay.open') || amazonCss.includes('#cartFlyoutOverlay.open'), "Must have open state for overlay");
assert(amazonCss.includes('pointer-events: auto !important;'), "Must restore pointer-events: auto !important; when open");

// Check initial HTML markup in header.html
assert(headerHtml.includes('id="cartFlyoutOverlay"') && headerHtml.includes('display: none; pointer-events: none;'), "header.html must have inline display: none and pointer-events: none on #cartFlyoutOverlay");
assert(headerHtml.includes('id="cartFlyout"') && headerHtml.includes('display: none; pointer-events: none;'), "header.html must have inline display: none and pointer-events: none on #cartFlyout");

// Check header.js open & close methods
assert(headerJs.includes('overlay.style.pointerEvents = "auto"'), "header.js must set pointerEvents auto on open");
assert(headerJs.includes('flyout.style.pointerEvents = "auto"'), "header.js must set drawer pointerEvents auto on open");
assert(headerJs.includes('flyout.style.pointerEvents = "none"'), "header.js must set pointerEvents none on close");
assert(headerJs.includes('overlay.style.pointerEvents = "none"'), "header.js must set overlay pointerEvents none on close");
console.log("  ✓ Cart Flyout inactive occlusion prevention verified.");

// -----------------------------------------------------------------------------
// 2. Quick View Modal & Drawer Inactive Occlusion Fix
// -----------------------------------------------------------------------------
console.log("\n2. Testing Quick View Inactive Occlusion Prevention...");

// Check products.css rules
assert(prodCss.includes('.quick-view-drawer-overlay') && prodCss.includes('#qvDrawerOverlay'), "products.css must target #qvDrawerOverlay");
assert(prodCss.includes('#qvDrawer') && prodCss.includes('.quick-view-drawer'), "products.css must target #qvDrawer");
assert(prodCss.includes('#quickViewModal'), "products.css must target #quickViewModal");

// Check amazon-theme.css rules
assert(amazonCss.includes('#qvDrawerOverlay') && amazonCss.includes('#qvDrawer'), "amazon-theme.css must include #qvDrawer rules");
assert(amazonCss.includes('#quickViewModal'), "amazon-theme.css must include #quickViewModal rules");

// Check products.html inline style
assert(prodHtml.includes('id="qvDrawerOverlay"') && prodHtml.includes('display: none; pointer-events: none;'), "products.html must have inline display: none and pointer-events: none on #qvDrawerOverlay");
assert(prodHtml.includes('id="qvDrawer"') && prodHtml.includes('display: none; pointer-events: none;'), "products.html must have inline display: none and pointer-events: none on #qvDrawer");

// Check products.js methods
assert(prodJs.includes('qvDrawer.style.pointerEvents = "none"'), "products.js must set pointerEvents none in closeQuickViewDrawer");
assert(prodJs.includes('qvDrawerOverlay.style.pointerEvents = "none"'), "products.js must set overlay pointerEvents none in closeQuickViewDrawer");
assert(prodJs.includes('closeQuickViewDrawer()'), "products.js must invoke closeQuickViewDrawer() on initial load");
console.log("  ✓ Quick View inactive occlusion prevention verified.");

// -----------------------------------------------------------------------------
// 3. Wishlist Button Toggle & Preservation
// -----------------------------------------------------------------------------
console.log("\n3. Testing Wishlist Button Toggle...");
assert(prodJs.includes('toggleWishlist(productId)'), "products.js must call toggleWishlist");
assert(prodJs.includes('heart-icon'), "products.js must preserve heart-icon on wishlist toggle");
assert(prodJs.includes('♥') && prodJs.includes('♡'), "products.js must toggle between filled and outline hearts");
console.log("  ✓ Wishlist button toggle and heart icon preservation verified.");

// -----------------------------------------------------------------------------
// 4. Cart Save For Later Flow
// -----------------------------------------------------------------------------
console.log("\n4. Testing Cart Save for Later Flow...");
assert(cartJs.includes('data-action="save-for-later"'), "cart.js must provide save-for-later action");
assert(cartJs.includes('function saveForLater('), "cart.js must define saveForLater function");
assert(cartJs.includes('function moveToCart('), "cart.js must define moveToCart function");
assert(cartJs.includes('function removeSavedItem('), "cart.js must define removeSavedItem function");
assert(cartJs.includes('syncHeaderCartCount()'), "cart.js must sync header cart count in renderCart");
console.log("  ✓ Save for later and move to cart actions verified.");

// -----------------------------------------------------------------------------
// 5. Wishlist Hub Grid & Actions
// -----------------------------------------------------------------------------
console.log("\n5. Testing Wishlist Hub Grid & Actions...");
assert(wishlistJs.includes('data-move-id'), "wishlist.js must provide Move to Cart action");
assert(wishlistJs.includes('data-remove-id'), "wishlist.js must provide Delete action");
assert(wishlistJs.includes('&times;'), "wishlist.js remove button must include &times; icon");
console.log("  ✓ Wishlist Hub Move to Cart and Delete actions verified.");

console.log("\n================================================================================");
console.log("=== ALL OCCLUSION AND WISHLIST FLOW TESTS PASSED (100%) ===");
console.log("================================================================================");
