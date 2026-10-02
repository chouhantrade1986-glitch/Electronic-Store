const fs = require('fs');
const path = require('path');

// Read the database file - fix path to go up one level from jobs folder
const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Starting price normalization for products...');
console.log(`Total products found: ${db.products.length}\n`);

// Price conversion multipliers (USD to realistic INR)
const categoryMultipliers = {
  'laptop': 80,           // $1000 -> ₹80,000
  'mobile': 75,           // $500 -> ₹37,500
  'audio': 65,            // $100 -> ₹6,500
  'laptop-battery': 1,    // Already in INR
  'accessory': 60,        // $50 -> ₹3,000
  'default': 70
};

let updatedCount = 0;

db.products = db.products.map(product => {
  const originalPrice = product.price;
  const multiplier = categoryMultipliers[product.category] || categoryMultipliers.default;
  
  // Only convert if price seems to be in USD (< 10000) and not laptop-battery
  if (originalPrice < 10000 && product.category !== 'laptop-battery') {
    // Convert to INR with realistic pricing
    let newPrice = Math.round(originalPrice * multiplier);
    
    // Ensure minimum prices for different categories
    const minPrices = {
      'laptop': 45000,
      'mobile': 8000,
      'audio': 999,
      'accessory': 499
    };
    
    const minPrice = minPrices[product.category] || 500;
    if (newPrice < minPrice) {
      newPrice = minPrice + Math.floor(Math.random() * 5000);
    }
    
    // Set listPrice (MRP) - typically 10-20% higher than selling price
    const listPriceMultiplier = 1.15 + (Math.random() * 0.10); // 15-25% higher
    const listPrice = Math.round(newPrice * listPriceMultiplier);
    
    // Fix ratings - ensure no product has 0 rating
    let rating = product.rating;
    if (!rating || rating === 0) {
      // Generate realistic rating between 3.5 and 4.8
      rating = parseFloat((Math.random() * (4.8 - 3.5) + 3.5).toFixed(1));
    }
    
    // Add review count if missing
    if (!product.reviewCount) {
      product.reviewCount = Math.floor(Math.random() * 450) + 50;
    }
    
    console.log(`✓ ${product.name}: ₹${originalPrice} -> ₹${newPrice} (MRP: ₹${listPrice}), Rating: ${rating}`);
    
    updatedCount++;
    
    return {
      ...product,
      price: newPrice,
      listPrice: listPrice,
      rating: rating,
      reviewCount: product.reviewCount
    };
  }
  
  // For products already in INR or laptop-batteries, just fix ratings
  let needsUpdate = false;
  let updatedProduct = { ...product };
  
  if (!product.rating || product.rating === 0) {
    updatedProduct.rating = parseFloat((Math.random() * (4.8 - 3.5) + 3.5).toFixed(1));
    needsUpdate = true;
  }
  
  if (!product.reviewCount) {
    updatedProduct.reviewCount = Math.floor(Math.random() * 450) + 50;
    needsUpdate = true;
  }
  
  // Ensure listPrice exists and is higher than price
  if (!product.listPrice || product.listPrice <= product.price) {
    updatedProduct.listPrice = Math.round(product.price * (1.15 + Math.random() * 0.10));
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    console.log(`✓ ${product.name}: Fixed rating/reviews (Rating: ${updatedProduct.rating}, Reviews: ${updatedProduct.reviewCount})`);
    updatedCount++;
  }
  
  return updatedProduct;
});

// Write back to file
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`\n✅ Successfully updated ${updatedCount} products!`);
console.log('All prices are now in realistic INR values.');
console.log('All products have valid ratings and review counts.');
