const CART_STORAGE_KEY = "electromart_cart_v1";

const bestSellers = [
  { id: 7, name: "Vector Gaming Laptop", category: "laptop", price: 1299, rating: 4.8, sold: "2.4k sold this month", soldCount: 2400, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Nimbus Phone X", category: "mobile", price: 749, rating: 4.7, sold: "3.1k sold this month", soldCount: 3100, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Pulse ANC Headphones", category: "audio", price: 179, rating: 4.6, sold: "1.8k sold this month", soldCount: 1800, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: 1, name: "AstraBook Pro 14", category: "laptop", price: 999, rating: 4.6, sold: "2.0k sold this month", soldCount: 2000, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Orbit Mechanical Keyboard", category: "accessory", price: 109, rating: 4.5, sold: "1.5k sold this month", soldCount: 1500, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "Echo Smart Speaker", category: "audio", price: 89, rating: 4.4, sold: "2.7k sold this month", soldCount: 2700, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" }
];

const bestGrid = document.getElementById("bestGrid");
const resultMeta = document.getElementById("resultMeta");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const cartCount = document.getElementById("cartCount");
const deptTrigger = document.getElementById("deptTrigger");
const deptMenu = document.getElementById("deptMenu");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});
let filterChipController = null;

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

function syncCartCount() {
  const total = Object.values(loadCartMap()).reduce((sum, qty) => sum + Number(qty || 0), 0);
  if (cartCount) {
    cartCount.textContent = String(total);
  }
}

function addToCart(id) {
  const cartMap = loadCartMap();
  const key = String(id);
  cartMap[key] = (Number(cartMap[key]) || 0) + 1;
  saveCartMap(cartMap);
  syncCartCount();
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function card(item) {
  const detailUrl = `product-detail.html?id=${encodeURIComponent(item.id)}`;
  return `
    <article class="product-card">
      <a href="${detailUrl}" aria-label="Open ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${item.name}</a></h3>
        <div class="meta">
          <span class="price">${money(item.price)}</span>
          <span class="rating">${item.rating} &#9733;</span>
        </div>
        <span class="sold-tag">${item.sold}</span>
        <button class="add-btn" data-id="${item.id}" type="button">Add to Cart</button>
      </div>
    </article>
  `;
}

function render(list) {
  if (!resultMeta || !bestGrid) {
    return;
  }
  resultMeta.textContent = `Showing ${list.length} products`;
  if (list.length === 0) {
    bestGrid.innerHTML = "<div class='empty'>No best sellers match your filters.</div>";
    return;
  }
  bestGrid.innerHTML = list.map(card).join("");
}

function getSortLabel(value) {
  const labels = {
    sold_desc: "Most Sold",
    rating_desc: "Top Rated",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low"
  };
  return labels[value] || "Featured";
}

function getActiveListingFilters() {
  const filters = [];
  const query = String(searchInput?.value || "").trim();
  const category = String(categoryFilter?.value || "all");
  const sortValue = String(sortFilter?.value || "relevance");

  if (query) {
    filters.push({
      id: "search",
      label: `Search: "${query}"`,
      ariaLabel: `Remove search ${query}`,
      clear: () => {
        searchInput.value = "";
      },
      focus: () => searchInput.focus(),
      feedback: `Removed search ${query}. Focus moved to the search input.`
    });
  }
  if (category !== "all") {
    const readable = category.charAt(0).toUpperCase() + category.slice(1);
    filters.push({
      id: "category",
      label: `Category: ${readable}`,
      ariaLabel: `Remove category filter ${readable}`,
      clear: () => {
        categoryFilter.value = "all";
      },
      focus: () => categoryFilter.focus(),
      feedback: `Removed category filter ${readable}. Focus moved to the category filter.`
    });
  }
  if (sortValue !== "relevance") {
    const sortLabel = getSortLabel(sortValue);
    filters.push({
      id: "sort",
      label: `Sort: ${sortLabel}`,
      ariaLabel: `Remove sort filter ${sortLabel}`,
      clear: () => {
        sortFilter.value = "relevance";
      },
      focus: () => sortFilter.focus(),
      feedback: `Removed sort order ${sortLabel}. Focus moved to the sort control.`
    });
  }
  return filters;
}

function sortBestSellers(items, sortValue) {
  const next = [...items];
  if (sortValue === "sold_desc") {
    next.sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0));
  } else if (sortValue === "rating_desc") {
    next.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  } else if (sortValue === "price_asc") {
    next.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortValue === "price_desc") {
    next.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }
  return next;
}

function applyInitialCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = String(params.get("category") || "").trim().toLowerCase();
  const allowed = new Set(["all", "laptop", "mobile", "audio", "accessory"]);
  if (requested && allowed.has(requested) && categoryFilter) {
    categoryFilter.value = requested;
  }
}

function filterBestSellers() {
  const query = String(searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
  const category = String(categoryFilter && categoryFilter.value ? categoryFilter.value : "all");
  const sortValue = String(sortFilter && sortFilter.value ? sortFilter.value : "relevance");

  const filtered = bestSellers.filter((item) => {
    const queryMatch = !query || item.name.toLowerCase().includes(query);
    const categoryMatch = category === "all" || item.category === category;
    return queryMatch && categoryMatch;
  });

  render(sortBestSellers(filtered, sortValue));
  filterChipController?.update();
}

if (searchInput) {
  searchInput.addEventListener("input", filterBestSellers);
}
if (categoryFilter) {
  categoryFilter.addEventListener("change", filterBestSellers);
}
if (sortFilter) {
  sortFilter.addEventListener("change", filterBestSellers);
}

document.addEventListener("click", (event) => {
  if (deptTrigger && event.target === deptTrigger) {
    const next = !deptMenu.classList.contains("open");
    deptMenu.classList.toggle("open", next);
    deptTrigger.setAttribute("aria-expanded", String(next));
    return;
  }

  if (deptMenu && !deptMenu.contains(event.target) && event.target !== deptTrigger) {
    deptMenu.classList.remove("open");
    if (deptTrigger) {
      deptTrigger.setAttribute("aria-expanded", "false");
    }
  }

  if (!event.target.classList.contains("add-btn")) {
    return;
  }

  const id = String(event.target.getAttribute("data-id") || "").trim();
  if (id) {
    addToCart(id);
  }
});

syncCartCount();
applyInitialCategoryFromUrl();
filterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: ".result-note",
  getFilters: getActiveListingFilters,
  clearAll: () => {
    if (searchInput) {
      searchInput.value = "";
    }
    if (categoryFilter) {
      categoryFilter.value = "all";
    }
    if (sortFilter) {
      sortFilter.value = "relevance";
    }
  },
  focusAfterClearAll: () => searchInput?.focus(),
  clearAllFeedback: "Removed all listing filters. Focus moved to the search input.",
  onChange: filterBestSellers,
  getResultSummary: () => String(resultMeta?.textContent || "").trim()
});
filterBestSellers();
