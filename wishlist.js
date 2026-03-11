const CART_STORAGE_KEY = "electromart_cart_v1";
const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
const WISHLIST_STORAGE_KEY = "electromart_wishlist_v1";
const FALLBACK_IMAGE_URL = "./product-placeholder.svg";

const wishlistGrid = document.getElementById("wishlistGrid");
const wishlistMeta = document.getElementById("wishlistMeta");
const cartCount = document.getElementById("cartCount");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const fallbackProducts = [
  { id: "1", name: "AstraBook Pro 14", brand: "AstraTech", category: "laptop", price: 999, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: "2", name: "Nimbus Phone X", brand: "Nimbus", category: "mobile", price: 749, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: "3", name: "Pulse ANC Headphones", brand: "PulseWave", category: "audio", price: 179, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: "7", name: "Vector Gaming Laptop", brand: "Vector", category: "laptop", price: 1299, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: "201", name: "Epson EcoTank L3250", brand: "Epson", category: "printer", price: 15999, image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=900&q=80" }
];

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function loadCartMap() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveCartMap(cartMap) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartMap));
  } catch (error) {
    return;
  }
}

function loadCatalogMap() {
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function loadWishlistIds() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function saveWishlistIds(ids) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids.map((item) => String(item).trim()).filter(Boolean)))));
  } catch (error) {
    return;
  }
}

function syncCartCount() {
  const total = Object.values(loadCartMap()).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(total);
}

function getWishlistProducts() {
  const catalogMap = loadCatalogMap();
  const mergedMap = new Map([
    ...fallbackProducts.map((item) => [String(item.id), item]),
    ...Object.values(catalogMap).map((item) => [String(item.id), item])
  ]);
  return loadWishlistIds().map((id) => {
    const product = mergedMap.get(String(id));
    if (!product) {
      return {
        id: String(id),
        name: `Product #${id}`,
        brand: "ElectroMart",
        category: "electronics",
        price: 0,
        image: FALLBACK_IMAGE_URL
      };
    }
    return {
      id: String(product.id),
      name: product.name || `Product #${id}`,
      brand: product.brand || "ElectroMart",
      category: product.category || "electronics",
      price: Number(product.price || 0),
      image: product.image || FALLBACK_IMAGE_URL
    };
  });
}

function wishlistCard(product) {
  return `
    <article class="wishlist-card">
      <a href="product-detail.html?id=${encodeURIComponent(product.id)}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="wishlist-content">
        <h2><a href="product-detail.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h2>
        <p class="wishlist-meta">Brand: ${product.brand} | Category: ${product.category}</p>
        <strong class="wishlist-price">${money(product.price)}</strong>
        <p class="wishlist-note">Saved for later. Move it to cart whenever you are ready to checkout.</p>
      </div>
      <div class="wishlist-buttons">
        <button class="move-btn" data-move-id="${product.id}" type="button">Move to Cart</button>
        <a href="product-detail.html?id=${encodeURIComponent(product.id)}" class="view-btn">Quick View</a>
        <button class="remove-btn" data-remove-id="${product.id}" type="button">Remove</button>
      </div>
    </article>
  `;
}

function renderWishlist() {
  const items = getWishlistProducts();
  wishlistMeta.textContent = `${items.length} saved item${items.length === 1 ? "" : "s"}`;
  if (!items.length) {
    wishlistGrid.innerHTML = `
      <div class="empty-state">
        <h2>Your wishlist is empty</h2>
        <p>Save products from the homepage, listing page, or product detail page.</p>
      </div>
    `;
    return;
  }
  wishlistGrid.innerHTML = items.map(wishlistCard).join("");
}

document.addEventListener("click", (event) => {
  const removeBtn = event.target.closest("[data-remove-id]");
  if (removeBtn) {
    const productId = String(removeBtn.getAttribute("data-remove-id") || "").trim();
    saveWishlistIds(loadWishlistIds().filter((id) => id !== productId));
    renderWishlist();
    return;
  }

  const moveBtn = event.target.closest("[data-move-id]");
  if (!moveBtn) {
    return;
  }
  const productId = String(moveBtn.getAttribute("data-move-id") || "").trim();
  if (!productId) {
    return;
  }
  const cartMap = loadCartMap();
  cartMap[productId] = (Number(cartMap[productId]) || 0) + 1;
  saveCartMap(cartMap);
  syncCartCount();
  moveBtn.textContent = "Added to Cart";
});

syncCartCount();
renderWishlist();
