/* Compare Products Page Logic - Amazon Style */
const COMPARE_STORAGE_KEY = "electromart_compare_v1";
const CART_STORAGE_KEY = "electromart_cart_v1";

// Fallback products for demo
const fallbackProducts = [
  {id:'1',name:'AstraBook Pro 14"',brand:'AstraTech',price:999,rating:4.6,image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',category:'laptop',inStock:true,specs:{screen:'14" FHD',processor:'Intel i7',ram:'16GB',storage:'512GB SSD',battery:'10 hours',weight:'1.4 kg'}},
  {id:'2',name:'Nimbus Phone X',brand:'Nimbus',price:749,rating:4.5,image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',category:'mobile',inStock:true,specs:{screen:'6.5" AMOLED',processor:'Snapdragon 8',ram:'8GB',storage:'128GB',battery:'4500 mAh',weight:'180g'}},
  {id:'3',name:'Pulse ANC Headphones',brand:'PulseWave',price:179,rating:4.4,image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',category:'audio',inStock:true,specs:{type:'Over-ear',connectivity:'Bluetooth 5.0',battery:'30 hours',anc:'Yes',weight:'250g',warranty:'2 years'}},
  {id:'4',name:'Vector Gaming Laptop',brand:'Vector',price:1299,rating:4.8,image:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',category:'laptop',inStock:true,specs:{screen:'15.6" 144Hz',processor:'AMD Ryzen 9',ram:'32GB',storage:'1TB SSD',gpu:'RTX 4070',weight:'2.3 kg'}}
];

let allProducts = fallbackProducts;
let compareList = [];

const inrFormatter = new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'});

function formatPrice(price) {
  return inrFormatter.format(price);
}

function getCompareList() {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCompareList(list) {
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

async function fetchProductsFromApi() {
  try {
    const response = await fetch('http://localhost:4000/api/products?status=active');
    if (response.ok) {
      const data = await response.json();
      allProducts = data.products || fallbackProducts;
    } else {
      allProducts = fallbackProducts;
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    allProducts = fallbackProducts;
  }
  renderComparison();
}

function renderComparison() {
  compareList = getCompareList();
  
  const emptyState = document.getElementById('emptyCompareState');
  const comparisonTable = document.getElementById('comparisonTable');
  const compareActions = document.getElementById('compareActions');
  
  if (!emptyState || !comparisonTable || !compareActions) return;
  
  if (compareList.length === 0) {
    emptyState.style.display = 'block';
    comparisonTable.style.display = 'none';
    compareActions.style.display = 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  comparisonTable.style.display = 'table';
  compareActions.style.display = 'flex';
  
  // Get product details
  const products = compareList.map(id => {
    return allProducts.find(p => p.id == id) || null;
  }).filter(p => p !== null);
  
  if (products.length === 0) {
    emptyState.style.display = 'block';
    comparisonTable.style.display = 'none';
    return;
  }
  
  renderTableHeader(products);
  renderTableBody(products);
}

function renderTableHeader(products) {
  const headerRow = document.querySelector('.product-header-row');
  if (!headerRow) return;
  
  // Clear existing product columns (keep feature column)
  while (headerRow.children.length > 1) {
    headerRow.removeChild(headerRow.lastChild);
  }
  
  // Add product columns
  products.forEach(product => {
    const th = document.createElement('th');
    th.className = 'product-column';
    th.innerHTML = `
      <button class="product-remove-btn" data-product-id="${product.id}" title="Remove from compare">&times;</button>
      <div class="product-image-cell">
        <img src="${product.image}" alt="${product.name}" />
        <a href="product-detail.html?id=${product.id}" class="product-name-cell">${product.name}</a>
        <div class="product-rating-cell">⭐ ${product.rating} / 5</div>
        <div class="product-price-cell">${formatPrice(product.price)}</div>
        <button class="add-to-cart-btn" data-cart-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
          ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    `;
    headerRow.appendChild(th);
  });
}

function renderTableBody(products) {
  const tbody = document.getElementById('comparisonBody');
  if (!tbody) return;
  
  // Define comparison features
  const features = [
    { key: 'brand', label: 'Brand' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', format: (val) => formatPrice(val) },
    { key: 'rating', label: 'Rating', format: (val) => `⭐ ${val} / 5` },
    { key: 'inStock', label: 'Availability', format: (val) => val ? '<span style="color: #007600; font-weight: 600;">✓ In Stock</span>' : '<span style="color: #cc0c39; font-weight: 600;">✗ Out of Stock</span>' }
  ];
  
  // Add spec-based features if available
  if (products[0] && products[0].specs) {
    const specKeys = Object.keys(products[0].specs);
    specKeys.forEach(key => {
      features.push({
        key: `spec.${key}`,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        isSpec: true,
        specKey: key
      });
    });
  }
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  // Render each feature row
  features.forEach(feature => {
    const tr = document.createElement('tr');
    
    // Feature name column
    const featureTd = document.createElement('td');
    featureTd.textContent = feature.label;
    tr.appendChild(featureTd);
    
    // Product value columns
    products.forEach(product => {
      const td = document.createElement('td');
      
      let value;
      if (feature.isSpec && product.specs) {
        value = product.specs[feature.specKey] || 'N/A';
      } else {
        value = product[feature.key];
      }
      
      td.innerHTML = feature.format ? feature.format(value) : (value || 'N/A');
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });
  
  // Add event listeners for remove buttons and add to cart buttons
  addEventListeners();
}

function addEventListeners() {
  // Remove product buttons
  document.querySelectorAll('.product-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      removeFromCompare(productId);
    });
  });
  
  // Add to cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.cartId;
      addToCart(productId);
    });
  });
}

function removeFromCompare(productId) {
  compareList = compareList.filter(id => id !== productId);
  saveCompareList(compareList);
  renderComparison();
  showNotification('Product removed from comparison', 'info');
}

function clearAllCompare() {
  saveCompareList([]);
  renderComparison();
  showNotification('All products removed from comparison', 'info');
}

function addToCart(productId) {
  try {
    const cartMap = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
    cartMap[productId] = (cartMap[productId] || 0) + 1;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
    showNotification('Product added to cart!', 'success');
    
    // Update cart count in header if exists
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
      const total = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
      cartCountEl.textContent = String(total);
    }
  } catch (e) {
    console.error('Failed to add to cart:', e);
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `toast-notification toast-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#007600' : (type === 'warning' ? '#ff9900' : '#565959')};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    font-weight: 600;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  fetchProductsFromApi();
  
  // Clear all button
  const clearAllBtn = document.getElementById('clearAllCompare');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllCompare);
  }
});
