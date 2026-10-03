const fs = require('fs');

let html = fs.readFileSync('product-detail.html', 'utf8');

const oldBlock = `<hr />
        <p id="productPrice" class="price"></p>
        <p id="productListPrice" class="list-price"></p>
        <p id="productDealMeta" class="deal-meta"></p>`;

const newBlock = `<hr />
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
        <p id="productDealMeta" class="deal-meta" style="display: none;"></p>`;

// Normalize CRLF to LF for matching
const isCRLF = html.includes('\r\n');
const normalizedHtml = html.replace(/\r\n/g, '\n');

if (normalizedHtml.includes(oldBlock)) {
  let updatedHtml = normalizedHtml.replace(oldBlock, newBlock);
  if (isCRLF) {
    updatedHtml = updatedHtml.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync('product-detail.html', updatedHtml, 'utf8');
  console.log('product-detail.html updated successfully with Amazon price block!');
} else {
  console.error('Could not find target price block in product-detail.html');
}
