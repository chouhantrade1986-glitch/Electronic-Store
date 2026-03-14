const CART_STORAGE_KEY = "electromart_cart_v1";

const deals = [
  { id: 1, name: "AstraBook Pro 14", category: "laptop", oldPrice: 1149, dealPrice: 999, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Nimbus Phone X", category: "mobile", oldPrice: 849, dealPrice: 749, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Pulse ANC Headphones", category: "audio", oldPrice: 229, dealPrice: 179, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Orbit Mechanical Keyboard", category: "accessory", oldPrice: 149, dealPrice: 109, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80" },
  { id: 7, name: "Vector Gaming Laptop", category: "laptop", oldPrice: 1499, dealPrice: 1299, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80" },
  { id: 8, name: "Echo Smart Speaker", category: "audio", oldPrice: 129, dealPrice: 89, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80" }
];

const dealsGrid = document.getElementById("dealsGrid");
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

function discountPercent(oldPrice, dealPrice) {
  return Math.round(((oldPrice - dealPrice) / oldPrice) * 100);
}

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function dealCard(item) {
  const detailUrl = `product-detail.html?id=${encodeURIComponent(item.id)}`;
  const discount = discountPercent(item.oldPrice, item.dealPrice);

  return `
    <article class="deal-card">
      <a href="${detailUrl}" aria-label="Open ${item.name}">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </a>
      <div class="content">
        <h3><a href="${detailUrl}">${item.name}</a></h3>
        <div class="price-row">
          <span class="price-now">${money(item.dealPrice)}</span>
          <span class="price-old">${money(item.oldPrice)}</span>
        </div>
        <span class="discount">Save ${discount}%</span>
        <button class="add-btn" data-id="${item.id}" type="button">Add to Cart</button>
      </div>
    </article>
  `;
}

function render(list) {
  if (!resultMeta || !dealsGrid) {
    return;
  }
  resultMeta.textContent = `Showing ${list.length} deals`;
  if (!list.length) {
    dealsGrid.innerHTML = "<div class='empty'>No deals match your search.</div>";
    return;
  }
  dealsGrid.innerHTML = list.map(dealCard).join("");
}

function getSortLabel(value) {
  const labels = {
    discount_desc: "Highest Discount",
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

function sortDeals(items, sortValue) {
  const next = [...items];
  if (sortValue === "discount_desc") {
    next.sort((a, b) => discountPercent(b.oldPrice, b.dealPrice) - discountPercent(a.oldPrice, a.dealPrice));
  } else if (sortValue === "price_asc") {
    next.sort((a, b) => Number(a.dealPrice) - Number(b.dealPrice));
  } else if (sortValue === "price_desc") {
    next.sort((a, b) => Number(b.dealPrice) - Number(a.dealPrice));
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

function filterDeals() {
  const query = String(searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
  const category = String(categoryFilter && categoryFilter.value ? categoryFilter.value : "all");
  const sortValue = String(sortFilter && sortFilter.value ? sortFilter.value : "relevance");

  const filtered = deals.filter((item) => {
    const queryMatch = !query || item.name.toLowerCase().includes(query);
    const categoryMatch = category === "all" || item.category === category;
    return queryMatch && categoryMatch;
  });

  render(sortDeals(filtered, sortValue));
  filterChipController?.update();
}

if (searchInput) {
  searchInput.addEventListener("input", filterDeals);
}
if (categoryFilter) {
  categoryFilter.addEventListener("change", filterDeals);
}
if (sortFilter) {
  sortFilter.addEventListener("change", filterDeals);
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
  onChange: filterDeals,
  getResultSummary: () => String(resultMeta?.textContent || "").trim()
});
filterDeals();
