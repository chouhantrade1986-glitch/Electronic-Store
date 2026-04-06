const CART_STORAGE_KEY = "electromart_cart_v1";

const stores = [
  {
    id: 1,
    name: "New York Flagship",
    city: "New York",
    address: "55 W 34th St, New York, NY",
    hours: "Open: 9 AM - 10 PM",
    phone: "+1 (212) 555-0198",
    services: ["pickup", "repair", "experience"],
    summary: "Flagship floor with creator demo stations, priority repairs, and after-work pickup windows."
  },
  {
    id: 2,
    name: "Los Angeles Central",
    city: "Los Angeles",
    address: "8400 Sunset Blvd, Los Angeles, CA",
    hours: "Open: 10 AM - 9 PM",
    phone: "+1 (310) 555-0147",
    services: ["pickup", "b2b", "experience"],
    summary: "Best for startup procurement, studio hardware demos, and same-day pickup of in-demand devices."
  },
  {
    id: 3,
    name: "Chicago Downtown",
    city: "Chicago",
    address: "600 N Michigan Ave, Chicago, IL",
    hours: "Open: 9 AM - 9 PM",
    phone: "+1 (312) 555-0133",
    services: ["repair", "b2b"],
    summary: "Focused on business supply, warranty diagnostics, and installation planning for office fleets."
  },
  {
    id: 4,
    name: "Dallas Tech Hub",
    city: "Dallas",
    address: "3011 North Stemmons Fwy, Dallas, TX",
    hours: "Open: 10 AM - 10 PM",
    phone: "+1 (469) 555-0112",
    services: ["pickup", "experience", "b2b"],
    summary: "Late-hour pickup, project hardware sourcing, and guided gaming or workstation consultations."
  },
  {
    id: 5,
    name: "Seattle Experience Center",
    city: "Seattle",
    address: "600 Pine St, Seattle, WA",
    hours: "Open: 9 AM - 9 PM",
    phone: "+1 (206) 555-0184",
    services: ["repair", "experience"],
    summary: "Hands-on experience zone for creators and professionals comparing premium device setups."
  },
  {
    id: 6,
    name: "Miami Commerce Store",
    city: "Miami",
    address: "701 Brickell Ave, Miami, FL",
    hours: "Open: 10 AM - 9 PM",
    phone: "+1 (305) 555-0166",
    services: ["pickup", "b2b"],
    summary: "Built for business buyers needing tax invoices, quick stock confirmation, and pickup handoff."
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
const serviceFilterList = document.getElementById("serviceFilterList");
const storeMeta = document.getElementById("storeMeta");
const storeGrid = document.getElementById("storeGrid");
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

function syncCartCount() {
  const cartMap = loadCartMap();
  const total = Object.values(cartMap).reduce((sum, qty) => sum + Number(qty || 0), 0);
  cartCount.textContent = String(total);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getServiceFilters() {
  return serviceFilterList ? Array.from(serviceFilterList.querySelectorAll(".service-filter")) : [];
}

function getSelectedServices() {
  return getServiceFilters()
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function getServiceOptions() {
  return Array.from(new Set(stores.flatMap((store) => Array.isArray(store.services) ? store.services : []).filter(Boolean)))
    .sort((left, right) => String(serviceLabels[left] || left).localeCompare(String(serviceLabels[right] || right)));
}

function syncDynamicServiceUI() {
  if (!serviceFilterList) {
    return;
  }
  const selected = new Set(getSelectedServices());
  const options = getServiceOptions();
  if (!options.length) {
    serviceFilterList.innerHTML = "<p class='service-filter-empty'>No services available right now.</p>";
    return;
  }
  serviceFilterList.innerHTML = options.map((service) => {
    const checked = selected.has(service) ? " checked" : "";
    const label = serviceLabels[service] || service;
    return `<label class="check-item"><input type="checkbox" class="service-filter" value="${escapeHtml(service)}"${checked} /> ${escapeHtml(label)}</label>`;
  }).join("");
}

function storeCard(store) {
  const tags = store.services.map((service) => `<span class="tag">${escapeHtml(serviceLabels[service])}</span>`).join("");

  return `
    <article class="store-card">
      <p class="city-line">${escapeHtml(store.city)}</p>
      <h3>${escapeHtml(store.name)}</h3>
      <p>${escapeHtml(store.address)}</p>
      <p class="hours">${escapeHtml(store.hours)}</p>
      <p class="store-summary">${escapeHtml(store.summary)}</p>
      <p>${escapeHtml(store.phone)}</p>
      <div class="tags">${tags}</div>
      <button type="button" data-phone="${escapeHtml(store.phone)}">Book Visit</button>
    </article>
  `;
}

function renderStores(list) {
  storeMeta.textContent = `Showing ${list.length} stores`;

  if (list.length === 0) {
    storeGrid.innerHTML = "<div class='empty-state'>No exact store matches found. Try clearing one filter or broadening the search.</div>";
    return;
  }

  storeGrid.innerHTML = list.map(storeCard).join("");
}

function getActiveStoreFilters() {
  const filters = [];
  const query = String(storeSearch?.value || "").trim();
  const selectedServices = getSelectedServices();

  if (query) {
    filters.push({
      id: "search",
      label: `Search: ${query}`,
      clear: () => {
        storeSearch.value = "";
      },
      focus: storeSearch,
      feedback: "Removed store search filter. Focus moved to the search input."
    });
  }

  selectedServices.forEach((service) => {
    const label = serviceLabels[service] || service;
    filters.push({
      id: `service-${service}`,
      label: `Service: ${label}`,
      clear: () => {
        const target = getServiceFilters().find((checkbox) => checkbox.value === service);
        if (target) {
          target.checked = false;
        }
      },
      focus: () => getServiceFilters().find((checkbox) => checkbox.value === service)?.focus(),
      feedback: "Removed service filter. Focus moved to the service option."
    });
  });

  return filters;
}

function filterStores() {
  syncDynamicServiceUI();
  const query = String(storeSearch?.value || "").trim().toLowerCase();
  const selectedServices = getSelectedServices();

  const filtered = stores.filter((store) => {
    const serviceMatch = !selectedServices.length || store.services.some((service) => selectedServices.includes(service));
    const queryMatch =
      !query ||
      store.name.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query) ||
      store.services.some((item) => serviceLabels[item].toLowerCase().includes(query));

    return serviceMatch && queryMatch;
  });

  renderStores(filtered);
  filterChipController?.update();
}

storeSearch.addEventListener("input", filterStores);
storeSearch.closest("form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  filterStores();
});
serviceFilterList?.addEventListener("change", (event) => {
  if (event.target.closest(".service-filter")) {
    filterStores();
  }
});
storeGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-phone]");
  if (!button) {
    return;
  }
  const phone = String(button.getAttribute("data-phone") || "").replace(/[^\d+]/g, "");
  if (phone) {
    window.location.href = `tel:${phone}`;
  }
});

syncCartCount();
syncDynamicServiceUI();
filterChipController = window.ElectroMartListingFilterChips?.init({
  mountAfter: ".filters",
  getFilters: getActiveStoreFilters,
  clearAll: () => {
    storeSearch.value = "";
    getServiceFilters().forEach((checkbox) => {
      checkbox.checked = false;
    });
  },
  focusAfterClearAll: storeSearch,
  clearAllFeedback: "Removed all store filters. Focus moved to the search input.",
  onChange: filterStores,
  getResultSummary: () => String(storeMeta?.textContent || "").trim()
}) || null;
filterStores();
