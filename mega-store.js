const CART_STORAGE_KEY = "electromart_cart_v1";

const stores = [
  {
    id: 1,
    name: "New York Flagship",
    address: "55 W 34th St, New York, NY",
    hours: "Open: 9 AM - 10 PM",
    phone: "+1 (212) 555-0198",
    services: ["pickup", "repair", "experience"]
  },
  {
    id: 2,
    name: "Los Angeles Central",
    address: "8400 Sunset Blvd, Los Angeles, CA",
    hours: "Open: 10 AM - 9 PM",
    phone: "+1 (310) 555-0147",
    services: ["pickup", "b2b", "experience"]
  },
  {
    id: 3,
    name: "Chicago Downtown",
    address: "600 N Michigan Ave, Chicago, IL",
    hours: "Open: 9 AM - 9 PM",
    phone: "+1 (312) 555-0133",
    services: ["repair", "b2b"]
  },
  {
    id: 4,
    name: "Dallas Tech Hub",
    address: "3011 North Stemmons Fwy, Dallas, TX",
    hours: "Open: 10 AM - 10 PM",
    phone: "+1 (469) 555-0112",
    services: ["pickup", "experience", "b2b"]
  },
  {
    id: 5,
    name: "Seattle Experience Center",
    address: "600 Pine St, Seattle, WA",
    hours: "Open: 9 AM - 9 PM",
    phone: "+1 (206) 555-0184",
    services: ["repair", "experience"]
  },
  {
    id: 6,
    name: "Miami Commerce Store",
    address: "701 Brickell Ave, Miami, FL",
    hours: "Open: 10 AM - 9 PM",
    phone: "+1 (305) 555-0166",
    services: ["pickup", "b2b"]
  }
];

const serviceLabels = {
  pickup: "Same-day Pickup",
  repair: "Device Repair",
  b2b: "B2B Desk",
  experience: "Experience Zone"
};

const cartCount = document.getElementById("cartCount");
const storeSearch = document.getElementById("storeSearch");
const serviceFilter = document.getElementById("serviceFilter");
const storeMeta = document.getElementById("storeMeta");
const storeGrid = document.getElementById("storeGrid");

function loadCartMap() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    return {};
  }
}

function syncCartCount() {
  const cartMap = loadCartMap();
  const total = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(total);
}

function storeCard(store) {
  const tags = store.services.map((service) => `<span class="tag">${serviceLabels[service]}</span>`).join("");

  return `
    <article class="store-card">
      <h3>${store.name}</h3>
      <p>${store.address}</p>
      <p class="hours">${store.hours}</p>
      <p>${store.phone}</p>
      <div class="tags">${tags}</div>
      <button type="button">Book Visit</button>
    </article>
  `;
}

function renderStores(list) {
  storeMeta.textContent = `Showing ${list.length} stores`;

  if (list.length === 0) {
    storeGrid.innerHTML = "<div class='empty-state'>No stores match your filters.</div>";
    return;
  }

  storeGrid.innerHTML = list.map(storeCard).join("");
}

function filterStores() {
  const query = storeSearch.value.trim().toLowerCase();
  const service = serviceFilter.value;

  const filtered = stores.filter((store) => {
    const serviceMatch = service === "all" || store.services.includes(service);
    const queryMatch =
      store.name.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query) ||
      store.services.some((item) => serviceLabels[item].toLowerCase().includes(query));

    return serviceMatch && queryMatch;
  });

  renderStores(filtered);
}

storeSearch.addEventListener("input", filterStores);
serviceFilter.addEventListener("change", filterStores);

syncCartCount();
filterStores();
