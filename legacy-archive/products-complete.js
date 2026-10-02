/* COMPLETE products.js - all functions defined before DOMContentLoaded */

// Constants and globals
const CART_STORAGE_KEY = "electromart_cart_v1";

const fallbackProducts = [
  {id:'1',name:'AstraBook Pro 14',brand:'AstraTech',price:999,rating:4.6,image:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',badge:'Best Seller'},
  {id:'2',name:'Nimbus Phone X',brand:'Nimbus',price:749,rating:4.5,image:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',badge:'New'},
  {id:'3',name:'Pulse ANC Headphones',brand:'PulseWave',price:179,rating:4.4,image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',badge:''},
  {id:'4',name:'Vector Gaming Laptop',brand:'Vector',price:1299,rating:4.8,image:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',badge:'Hot Deal'},
  {id:'5',name:'Office Laptop Bundle (10 Units)',brand:'AstraTech',price:8690,rating:4.7,image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',badge:'Bundle'}
];

const inrFormatter = new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'});

// ALL FUNCTIONS FIRST
function syncCartCount() {
  try {
    const cartMap = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
    const total = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) cartCountEl.textContent = String(total);
  } catch (e) { console.warn("Cart sync failed", e); }
}

function syncDynamicCategoryUI() { console.log("Category UI sync stub"); }

function applyInitialQueryFilters() { console.log("Query filters stub"); }

function syncDynamicBrandUI() { console.log("Brand UI sync stub"); }

function sortProducts(products, sortBy) {
  const sorted = [...products];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted;
    default:
      return sorted;
  }
}

function filterProducts(products) {
  // Simple filter, no UI elements
  return products;
}

function updatePriceLabels() { }

function showProductModal(productId) {
  const product = currentProducts.find(p => p.id == productId);
  if (!product) return;
  alert(`Product: ${product.name}\nPrice: ₹${product.price}`);
}

function addToCart(productId) {
  const cartMap = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "{}");
  cartMap[productId] = (cartMap[productId] || 0) + 1;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
  syncCartCount();
  alert('Added to cart!');
}

let allProducts = fallbackProducts;
let currentProducts = allProducts.slice(0, 12);
let currentSort = 'relevance';
let displayedCount = 12;
let searchTerm = '';

async function fetchProductsFromApi() {
  try {
    const response = await fetch('http://localhost:4000/api/products?status=active');
    if (response.ok) {
      const data = await response.json();
      allProducts = data.products || [];
      currentProducts = allProducts.slice(0, displayedCount);
    } else {
      allProducts = fallbackProducts;
      currentProducts = allProducts.slice(0, displayedCount);
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    allProducts = fallbackProducts;
    currentProducts = allProducts.slice(0, displayedCount);
  }
  renderProducts(sortProducts(filterProducts(currentProducts), currentSort));
}

// DOMContentLoaded - SAFE NOW
document.addEventListener('DOMContentLoaded', function() {
  console.log('Products-complete.js DOM ready');
  
  syncCartCount();
  syncDynamicCategoryUI();
  applyInitialQueryFilters();
  syncDynamicBrandUI();
  updatePriceLabels();
  fetchProductsFromApi();
});

// Product rendering
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  const meta = document.getElementById("resultMeta");
  if (grid) {
    grid.innerHTML = products.slice(0, displayedCount).map(p => `
      <div class="product-card" data-id="${p.id}" onclick="showProductModal(${p.id})" role="button" tabindex="0" aria-label="View details for ${p.name}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <img src="${p.image}" alt="${p.name}" loading="lazy" style="width:100%;height:200px;object-fit:cover;border-radius:4px;margin-bottom:0.5rem;">
        <h3 style="font-size:1.1rem;margin:0.5rem 0;">${p.name}</h3>
        <div class="rating" style="margin:0.25rem 0;">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))} ${p.rating}</div>
        <div class="price" style="font-size:1.2rem;font-weight:bold;color:#b12704;margin:0.25rem 0;">₹${p.price}</div>
        <button onclick="event.stopPropagation(); addToCart('${p.id}')" style="background:#ffd814;border:none;padding:0.5rem 1rem;border-radius:4px;cursor:pointer;width:100%;">Add to Cart</button>
      </div>
    `).join('');

    if (products.length > displayedCount) {
      grid.innerHTML += `<button onclick="displayedCount += 12; fetchProductsFromApi()" style="grid-column:1/-1;margin:1rem;padding:1rem;background:#f0f0f0;border:none;border-radius:4px;cursor:pointer;">Load More Products</button>`;
    }
  }
  if (meta) meta.textContent = `Showing ${Math.min(displayedCount, products.length)} of ${products.length} products`;
}


