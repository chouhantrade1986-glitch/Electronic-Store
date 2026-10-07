const fs = require('fs');
const path = require('path');

const target = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'todays-deals.html');

const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="android-compat.css?v=20260410a" />
  <title>ElectroMart Today's Deals</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css?v=20260424a" />
  <link rel="stylesheet" href="todays-deals.css?v=20260315a" />
  <link rel="stylesheet" href="listing-filter-chips.css?v=20260314a" />
  <link rel="stylesheet" href="shared-search.css?v=20260314g" />

  <link rel="stylesheet" href="amazon-theme.css?v=20260411a" />
  <script src="android-compat.js?v=20260410a"></script>
</head>
<body>
  <div id="headerContainer"></div>

  <main class="deals-main">
    <section class="hero">
      <p class="eyebrow" data-i18n="limited_time_offers">Limited Time Offers</p>
      <h1 data-i18n="todays_deals">Today's Deals</h1>
      <p data-i18n="deals_subheading">Grab flash discounts on top electronics before they expire.</p>
      <div class="hero-pills">
        <span data-i18n="daily_refresh">Daily Refresh</span>
        <span data-i18n="top_categories">Top Categories</span>
        <span data-i18n="fast_checkout">Fast Checkout</span>
      </div>
    </section>

    <section class="amazon-layout">
      <aside class="panel refine-panel">
        <div class="panel-head">
          <h2 data-i18n="filter_by">Refine Results</h2>
          <p data-i18n="amazon_style_filters">Amazon style filters</p>
        </div>

        <section class="filters" aria-label="Filter deals">
          <div class="filter-block">
            <h3 data-i18n="brands">Brand</h3>
            <div id="brandFilterList" class="brand-filter-list" role="group" aria-label="Filter by brand">
              <p class="brand-filter-empty">Loading brands...</p>
            </div>
          </div>
          <div class="filter-block">
            <h3 data-i18n="price">Price Range</h3>
            <select id="priceRangeFilter" aria-label="Filter by price range">
              <option value="all" data-i18n="all_option">All</option>
              <option value="0-499" data-i18n="under_500">Under ₹500</option>
              <option value="500-999" data-i18n="price_500_999">₹500 - ₹999</option>
              <option value="1000-1999" data-i18n="price_1000_1999">₹1000 - ₹1999</option>
              <option value="2000-4999" data-i18n="price_2000_4999">₹2000 - ₹4999</option>
              <option value="5000-9999" data-i18n="price_5000_9999">₹5000 - ₹9999</option>
              <option value="10000-999999" data-i18n="price_10000_above">₹10000 & Above</option>
            </select>
          </div>
          <div class="filter-block">
            <h3 data-i18n="discount">Discount</h3>
            <select id="discountFilter" aria-label="Filter by discount">
              <option value="all" data-i18n="all_option">All</option>
              <option value="10" data-i18n="discount_10_more">10% or more</option>
              <option value="20" data-i18n="discount_20_more">20% or more</option>
              <option value="30" data-i18n="discount_30_more">30% or more</option>
              <option value="40" data-i18n="discount_40_more">40% or more</option>
              <option value="50" data-i18n="discount_50_more">50% or more</option>
            </select>
          </div>
          <select id="categoryFilter" aria-label="Filter category">
            <option value="all" data-i18n="all_categories">All Categories</option>
            <option value="laptop" data-i18n="laptops">Laptops</option>
            <option value="mobile" data-i18n="mobiles">Mobiles</option>
            <option value="audio" data-i18n="audio_headphones">Audio</option>
            <option value="accessory" data-i18n="accessories">Accessories</option>
          </select>
          <select id="sortFilter" aria-label="Sort deals">
            <option value="relevance" data-i18n="sort_relevance">Sort: Relevance</option>
            <option value="discount_desc" data-i18n="sort_highest_discount">Highest Discount</option>
            <option value="price_asc" data-i18n="price_low_high">Price: Low to High</option>
            <option value="price_desc" data-i18n="price_high_low">Price: High to Low</option>
          </select>
        </section>

        <div class="rail-block promo-block">
          <h3 data-i18n="deal_tip_title">Deal Tip</h3>
          <p data-i18n="deal_tip_desc">Open product details and checkout quickly before stock runs out.</p>
        </div>
      </aside>

      <section class="panel result-panel">
        <div class="panel-head">
          <h2 data-i18n="best_deals_today">Best Deals Today</h2>
          <p id="resultMeta" role="status" aria-live="polite" aria-atomic="true">Showing 0 deals</p>
        </div>
        <p class="result-note" data-i18n="limited_time_pricing_note">Limited-time pricing updates daily.</p>
        <div id="dealsGrid" class="deals-grid"></div>
      </section>
    </section>
  </main>

  <script src="translations.js"></script>
  <script src="header.js"></script>
  <script src="listing-filter-chips.js?v=20260314a"></script>
  <script src="todays-deals.js?v=20260315d"></script>
  <script src="menu-manager.js"></script>
  <script src="shared-search.js?v=20260314g"></script>
</body>
</html>
`;

fs.writeFileSync(target, content, 'utf8');
console.log('Successfully wrote clean todays-deals.html');
