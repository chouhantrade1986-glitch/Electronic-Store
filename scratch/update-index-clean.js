const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'index.html');
let html = fs.readFileSync(targetPath, 'utf8');

// 1. Hero slides
html = html.replace(
  '<h1 style="color: #ff9900; font-size: 3rem;">Great Indian Festival</h1>',
  '<h1 style="color: #ff9900; font-size: 3rem;" data-i18n="hero_slide1_title">Great Indian Festival</h1>'
);
html = html.replace(
  '<p>Up to 70% Off on Electronics & Accessories. 10% Instant Discount on HDFC Bank Cards.</p>',
  '<p data-i18n="hero_slide1_subtitle">Up to 70% Off on Electronics & Accessories. 10% Instant Discount on HDFC Bank Cards.</p>'
);
html = html.replace(
  '<a href="todays-deals.html">Shop Deals Now</a>',
  '<a href="todays-deals.html" data-i18n="hero_slide1_cta">Shop Deals Now</a>'
);

html = html.replace(
  '<h1 style="color: #fbbf24;">New Launch: Nimbus X Pro</h1>',
  '<h1 style="color: #fbbf24;" data-i18n="hero_slide2_title">New Launch: Nimbus X Pro</h1>'
);
html = html.replace(
  '<p>Experience the ultimate flagship. Pre-order now and get free ANC headphones worth ₹4,999.</p>',
  '<p data-i18n="hero_slide2_subtitle">Experience the ultimate flagship. Pre-order now and get free ANC headphones worth ₹4,999.</p>'
);
html = html.replace(
  '<a href="products.html?search=nimbus">Pre-order Now</a>',
  '<a href="products.html?search=nimbus" data-i18n="hero_slide2_cta">Pre-order Now</a>'
);

html = html.replace(
  '<h1 style="color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Blockbuster TV Deals</h1>',
  '<h1 style="color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);" data-i18n="hero_slide3_title">Blockbuster TV Deals</h1>'
);
html = html.replace(
  '<p>Upgrade your home entertainment. Up to 50% Off on 4K Smart TVs.</p>',
  '<p data-i18n="hero_slide3_subtitle">Upgrade your home entertainment. Up to 50% Off on 4K Smart TVs.</p>'
);
html = html.replace(
  '<a href="products.html?search=tv">Explore TVs</a>',
  '<a href="products.html?search=tv" data-i18n="hero_slide3_cta">Explore TVs</a>'
);

// 2. Top Picks Section
html = html.replace(
  '<h2 class="hero-overlap-heading">Top Picks for You</h2>',
  '<h2 class="hero-overlap-heading" data-i18n="section_top_picks">Top Picks for You</h2>'
);
html = html.replace(
  '<div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: flex-start;">',
  '<div id="homeTopPicksGrid" style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: flex-start;">'
);

// 3. Deals Section
html = html.replace(
  '<div class="deal-kicker" style="color: #cc0c39; font-weight: 700; text-transform: uppercase; font-size: 0.85rem;">Deal of the Day</div>',
  '<div class="deal-kicker" data-i18n="deal_of_the_day" style="color: #cc0c39; font-weight: 700; text-transform: uppercase; font-size: 0.85rem;">Deal of the Day</div>'
);
html = html.replace(
  '<h2 style="margin: 0;">Today\'s Hot Deals</h2>',
  '<h2 style="margin: 0;" data-i18n="todays_hot_deals">Today\'s Hot Deals</h2>'
);
html = html.replace(
  '<a class="deal-strip-link" href="todays-deals.html" style="color: #007185; text-decoration: none; font-weight: 500;">See all deals</a>',
  '<a class="deal-strip-link" href="todays-deals.html" data-i18n="see_all_deals" style="color: #007185; text-decoration: none; font-weight: 500;">See all deals</a>'
);

// 4. Keep shopping for
html = html.replace(
  '<h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; padding-left: 0.5rem;">Keep shopping for</h2>',
  '<h2 data-i18n="keep_shopping_for" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; padding-left: 0.5rem;">Keep shopping for</h2>'
);
html = html.replace(
  '>Gaming Laptops</span>',
  ' data-i18n="cat_gaming_laptops">Gaming Laptops</span>'
);
html = html.replace(
  '>Smartphones & Accessories</span>',
  ' data-i18n="cat_smartphones_acc">Smartphones & Accessories</span>'
);
html = html.replace(
  '>Wireless Audio Devices</span>',
  ' data-i18n="cat_wireless_audio">Wireless Audio Devices</span>'
);
html = html.replace(
  '>Smartwatches</span>',
  ' data-i18n="cat_smartwatches">Smartwatches</span>'
);

// 5. 4-in-1 Quad Grid
// Card 1
html = html.replace(
  '<h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Gaming accessories</h3>',
  '<h3 data-i18n="cat_gaming_acc" style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Gaming accessories</h3>'
);
html = html.replace('>Headsets</span>', ' data-i18n="item_headsets">Headsets</span>');
html = html.replace('>Keyboards</span>', ' data-i18n="item_keyboards">Keyboards</span>');
html = html.replace('>Computer mice</span>', ' data-i18n="item_mice">Computer mice</span>');
html = html.replace('>Chairs</span>', ' data-i18n="item_chairs">Chairs</span>');
html = html.replace(
  '<a href="best-sellers.html" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">See more</a>',
  '<a href="best-sellers.html" data-i18n="see_more" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">See more</a>'
);

// Card 2
html = html.replace(
  '<h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Refresh your space</h3>',
  '<h3 data-i18n="cat_refresh_space" style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Refresh your space</h3>'
);
html = html.replace('>Monitors</span>', ' data-i18n="item_monitors">Monitors</span>');
html = html.replace('>Storage</span>', ' data-i18n="item_storage">Storage</span>');
html = html.replace('>Printers</span>', ' data-i18n="item_printers">Printers</span>');
html = html.replace('>Networking</span>', ' data-i18n="item_networking">Networking</span>');
html = html.replace(
  '<a href="products.html" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">See more</a>',
  '<a href="products.html" data-i18n="see_more" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">See more</a>'
);

// Card 3
html = html.replace(
  '<h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Discover ElectroMart Plus</h3>',
  '<h3 data-i18n="plus_title" style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Discover ElectroMart Plus</h3>'
);
html = html.replace(
  '<p style="font-size: 0.9rem; color: #0f1111; margin-bottom: 0.5rem;">Fast, free delivery on millions of items.</p>',
  '<p data-i18n="plus_subtitle" style="font-size: 0.9rem; color: #0f1111; margin-bottom: 0.5rem;">Fast, free delivery on millions of items.</p>'
);
html = html.replace(
  '<a href="#" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">Explore Plus Benefits</a>',
  '<a href="#" data-i18n="btn_explore_plus" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">Explore Plus Benefits</a>'
);

// Card 4
html = html.replace(
  '<h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Top Laptops for Creators</h3>',
  '<h3 data-i18n="cat_creator_laptops" style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f1111;">Top Laptops for Creators</h3>'
);
html = html.replace(
  '<a href="laptop.html" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">Shop Laptops</a>',
  '<a href="laptop.html" data-i18n="btn_shop_laptops" style="color: #007185; text-decoration: none; font-size: 0.85rem; font-weight: 500;">Shop Laptops</a>'
);

// 6. Recommended shelf
html = html.replace(
  '<h2 class="amz-shelf-title">Recommended for You based on your browsing history</h2>',
  '<h2 class="amz-shelf-title" data-i18n="recommended_shelf_title">Recommended for You based on your browsing history</h2>'
);
html = html.replace(
  '<a href="products.html" class="amz-shelf-see-more">See all recommendations &rsaquo;</a>',
  '<a href="products.html" class="amz-shelf-see-more" data-i18n="see_all_recommendations">See all recommendations &rsaquo;</a>'
);
html = html.replace(
  '<div class="amz-shelf-row">',
  '<div class="amz-shelf-row" id="homeRecommendedShelfRow">'
);

// 7. Browsing History
html = html.replace(
  '<h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: #0f1111;">Your browsing history</h2>',
  '<h2 data-i18n="your_browsing_history" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: #0f1111;">Your browsing history</h2>'
);

// 8. Script tag for homepage-products.js
if (!html.includes('homepage-products.js')) {
  html = html.replace(
    '<script src="translations.js?v=20260412b"></script>',
    '<script src="translations.js?v=20260412b"></script>\n  <script src="homepage-products.js?v=20260412b"></script>'
  );
}

fs.writeFileSync(targetPath, html, 'utf8');
console.log('Successfully updated index.html with all data-i18n tags and dynamic container IDs');
