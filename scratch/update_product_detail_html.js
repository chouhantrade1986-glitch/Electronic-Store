const fs = require('fs');
const path = require('path');

const targetPath = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'product-detail.html');

const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="android-compat.css?v=20260410a" />
  <title>Product Details - ElectroMart</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="product-detail.css?v=20260305c" />
  <link rel="stylesheet" href="shared-search.css?v=20260314g" />
  <link rel="stylesheet" href="amazon-theme.css?v=20260411a" />
  <script src="android-compat.js?v=20260410a"></script>
</head>
<body>
  <div id="headerContainer"></div>

  <main class="detail-main">
    <p id="productBreadcrumb" class="breadcrumbs"><a href="products.html" data-i18n="breadcrumb_products">Products</a> &gt; <span id="crumbName">Product</span></p>

    <section id="productDetail" class="product-detail" hidden>
      <div class="product-media">
        <div id="mediaThumbRail" class="thumb-rail"></div>
        <img id="productImage" src="product-placeholder.svg" alt="" onerror="this.onerror=null;this.src='product-placeholder.svg';" />
        <video id="productVideo" controls playsinline hidden></video>
        <div id="imageZoomPane" class="image-zoom-pane" aria-hidden="true"></div>
      </div>

      <div class="product-info">
        <h1 id="productName"></h1>
        <p id="productBrand" class="muted"></p>
        <p id="productRating" class="rating"></p>
        <p class="seller-line" id="productBrandRow"><a id="brandStoreLink" href="brands.html"></a></p>
        <hr />
        <!-- Amazon India Price Block -->
        <div class="amazon-price-block" id="amazonPriceBlock">
          <!-- डील बैज -->
          <span class="deal-badge-pill" id="dealBadgePill" data-i18n="lightning_deal">लाइटनिंग डील</span>
          
          <div class="price-row-main">
            <!-- -20% लाल रंग में -->
            <span class="discount-percent-val" id="productDiscountPercent">-20%</span>
            <!-- मुख्य कीमत -->
            <span class="currency-symbol">₹</span><span class="main-price-val" id="productMainPrice">1,39,930</span><span class="price-fraction" id="productPriceFraction"></span>
          </div>

          <!-- MRP और टैक्स -->
          <div class="mrp-tax-row" id="mrpTaxRow">
            <span class="mrp-label">M.R.P.:</span> <span class="mrp-strikethrough" id="productMrpPrice">₹1,74,643</span>
            <div class="tax-inclusive" data-i18n="inclusive_all_taxes">सभी टैक्स सहित</div>
          </div>
        </div>

        <p id="productPrice" class="price" style="display: none;"></p>
        <p id="productListPrice" class="list-price" style="display: none;"></p>
        <p id="productDealMeta" class="deal-meta" style="display: none;"></p>
        <p id="productSegment" class="segment-pill"></p>
        <p id="productStockMeta" class="stock-meta" data-alias="productQuickMeta"></p>
        <p id="productKeywordLine" class="keyword-line"></p>
        <p id="productDescription" class="description"></p>
        <h2 data-i18n="about_item">About this item</h2>
        <ul id="productSpecs" class="spec-list" data-alias="aboutItemBulletList"></ul>
      </div>

      <aside class="buy-box">
        <p id="buyBoxPrice" class="buy-price"></p>
        <p id="buyBoxMrp" class="buy-mrp"></p>
        <p id="buyBoxSavings" class="buy-savings"></p>
        <p id="taxInfo" class="tax-info" data-i18n="inclusive_all_taxes">Inclusive of all taxes</p>
        <p id="deliveryText" class="delivery-text"></p>
        <p id="availabilityText" class="availability in-stock stock-status" data-i18n="in_stock"></p>
        <div id="buyBoxMetaDetails" class="buybox-meta-details"></div>
        <section id="backInStockPanel" class="back-in-stock-panel" hidden>
          <h3>Get Notified When Back in Stock</h3>
          <p>Enter your details and we will notify you as soon as this product is available.</p>
          <form id="backInStockForm" class="back-in-stock-form">
            <input id="backInStockEmailInput" type="email" placeholder="Email address" required />
            <input id="backInStockNameInput" type="text" placeholder="Name (optional)" />
            <input id="backInStockQtyInput" type="number" min="1" max="999" step="1" value="1" />
            <button id="backInStockSubmitBtn" type="submit">Notify Me</button>
          </form>
          <p id="backInStockMessage" class="back-in-stock-message"></p>
        </section>
        <label for="qtySelect" data-i18n="qty_label">Qty:</label>
        <select id="qtySelect">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button id="addToCartBtn" type="button" data-i18n="add_to_cart">Add to Cart</button>
        <button id="saveWishlistBtn" type="button" class="secondary-btn wishlist-btn" data-i18n="save_to_wishlist">Save to Wishlist</button>
        <a href="cart.html" class="buy-now-btn" data-i18n="buy_now">Buy Now</a>
        <a href="products.html" class="secondary-btn" data-i18n="back_to_products">Back to products</a>
        <p class="secure-line" data-i18n="secure_transaction">Secure transaction</p>
      </aside>
    </section>

    <section id="frequentlyBoughtContainer" class="detail-card frequently-bought-card" hidden></section>

    <section id="relatedBlock" class="related-block" hidden>
      <h2 data-i18n="related_products">Related products</h2>
      <div id="relatedGrid" class="related-grid"></div>
    </section>

    <section id="offersBlock" class="detail-card" hidden>
      <h2 data-i18n="offers_benefits">Offers & Benefits</h2>
      <div id="offersGrid" class="offers-grid"></div>
    </section>

    <section id="servicesBlock" class="detail-card" hidden>
      <h2 data-i18n="delivery_returns_services">Delivery, Returns & Services</h2>
      <div class="service-grid">
        <article class="service-item">
          <h3 data-i18n="sub_delivery">Delivery</h3>
          <p id="serviceDeliveryText" data-i18n="free_delivery_subtext"></p>
        </article>
        <article class="service-item">
          <h3 data-i18n="sub_returns">Returns</h3>
          <p id="serviceReturnText" data-i18n="return_subtext"></p>
        </article>
        <article class="service-item">
          <h3 data-i18n="sub_warranty">Warranty</h3>
          <p id="serviceWarrantyText" data-i18n="warranty_subtext"></p>
        </article>
        <article class="service-item">
          <h3 data-i18n="sub_seller">Seller</h3>
          <p id="serviceSellerText" data-i18n="seller_subtext"></p>
        </article>
      </div>
    </section>

    <section id="reviewsBlock" class="detail-card" hidden>
      <div class="reviews-header-flex">
        <h2 data-i18n="customer_reviews_title">Customer Reviews</h2>
        <button id="translateReviewsBtn" class="translate-reviews-btn" type="button" data-i18n="translate_reviews_btn">Translate all reviews</button>
      </div>
      <div class="review-summary">
        <p id="reviewHeadline" class="review-headline"></p>
        <div id="reviewBars" class="review-bars"></div>
      </div>
      <div id="customerReviewsList" class="customer-reviews-list"></div>
    </section>

    <section id="qaBlock" class="detail-card" hidden>
      <h2 data-i18n="questions_answers">Questions & Answers</h2>
      <div id="qaList" class="qa-list"></div>
    </section>

    <section class="detail-info-table" id="detailInfoTable" hidden>
      <h2 data-i18n="product_information">Product information</h2>
      <div id="productInfoTable">
      <table>
        <tr><th data-i18n="tbl_sku">SKU</th><td id="infoSku"></td></tr>
        <tr><th data-i18n="tbl_brand">Brand</th><td id="infoBrand"></td></tr>
        <tr><th data-i18n="tbl_category">Category</th><td id="infoCategory"></td></tr>
        <tr><th data-i18n="tbl_segment">Segment</th><td id="infoSegment"></td></tr>
        <tr><th data-i18n="tbl_price">Price</th><td id="infoPrice"></td></tr>
        <tr><th data-i18n="tbl_mrp">MRP</th><td id="infoListPrice"></td></tr>
        <tr><th data-i18n="tbl_stock">Stock</th><td id="infoStock"></td></tr>
        <tr><th data-i18n="tbl_status">Status</th><td id="infoStatus"></td></tr>
        <tr><th data-i18n="tbl_fulfillment">Fulfillment</th><td id="infoFulfillment"></td></tr>
        <tr><th data-i18n="tbl_moq">MOQ</th><td id="infoMoq"></td></tr>
        <tr><th data-i18n="tbl_featured">Featured</th><td id="infoFeatured"></td></tr>
        <tr><th data-i18n="tbl_keywords">Keywords</th><td id="infoKeywords"></td></tr>
        <tr><th data-i18n="tbl_rating">Rating</th><td id="infoRating"></td></tr>
      </table>
      </div>
    </section>

    <section id="missingState" class="missing-state" hidden>
      <h2>Product not found</h2>
      <p>This product may have been removed or the link is invalid.</p>
      <a href="products.html">Go to product listing</a>
    </section>
  </main>

  <div id="fullscreenViewer" class="fullscreen-viewer" hidden>
    <div class="fullscreen-modal">
      <button id="fullscreenCloseBtn" type="button" class="fullscreen-close" aria-label="Close viewer">&times;</button>
      <div class="fullscreen-toolbar">
        <div class="fullscreen-tabs" role="tablist" aria-label="Media type">
          <button id="fsTabVideos" class="fullscreen-tab" type="button">VIDEOS</button>
          <button id="fsTabImages" class="fullscreen-tab active" type="button">IMAGES</button>
        </div>
      </div>
      <div class="fullscreen-main">
        <div class="fullscreen-stage">
          <img id="fullscreenImage" alt="Product media preview" />
          <video id="fullscreenVideo" controls playsinline hidden></video>
        </div>
        <aside class="fullscreen-side">
          <div class="fullscreen-side-head">
            <div class="fullscreen-zoom-controls" aria-label="Zoom controls">
              <button id="fsZoomInBtn" type="button" class="zoom-btn" aria-label="Zoom in">+</button>
              <button id="fsZoomOutBtn" type="button" class="zoom-btn" aria-label="Zoom out">-</button>
            </div>
            <p id="fullscreenTitle" class="fullscreen-title"></p>
          </div>
          <div class="fullscreen-thumb-wrap">
            <button id="fsThumbUpBtn" type="button" class="thumb-nav-btn" aria-label="Scroll thumbnails up">&#9650;</button>
            <div id="fullscreenThumbs" class="fullscreen-thumbs"></div>
            <button id="fsThumbDownBtn" type="button" class="thumb-nav-btn" aria-label="Scroll thumbnails down">&#9660;</button>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <script src="translations.js"></script>
  <script src="products-data.js"></script>
  <script src="universal-i18n-bus.js"></script>
  <script src="header.js"></script>
  <script src="menu-manager.js?v=20260313b"></script>
  <script src="auth-state.js?v=20260313b"></script>
  <script src="shared-search.js?v=20260314g"></script>
  <script src="product-detail.js?v=20260315b"></script>
</body>
</html>
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully wrote updated product-detail.html');
