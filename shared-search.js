// Pages can opt into the shared search pattern with shared-search.css/shared-search.js.
// This script upgrades existing header search forms and injects one when a page has no header search.
(function initElectroMartSharedSearch() {
  const SEARCH_HISTORY_STORAGE_KEY = "electromart_search_history_v1";
  const CATALOG_STORAGE_KEY = "electromart_catalog_v1";
  const API_BASE_URL = (() => {
    const { protocol, hostname, port } = window.location;
    if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000/api";
    }
    const origin = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    return `${origin}/api`;
  })();
  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });
  const DEFAULT_CATALOG_ORDER = ["computer", "laptop", "printer", "mobile", "audio", "accessory"];

  let fetchedCatalog = false;
  let fetchPromise = null;

  function loadSearchHistory() {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.map((item) => String(item).trim()).filter(Boolean)
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveSearchHistory(entries) {
    try {
      const unique = Array.from(
        new Set(entries.map((item) => String(item).trim()).filter(Boolean))
      );
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(unique.slice(0, 6)));
    } catch (error) {
      return;
    }
  }

  function rememberSearchQuery(query) {
    const value = String(query || "").trim();
    if (!value) {
      return;
    }
    saveSearchHistory([value, ...loadSearchHistory()]);
  }

  function normalizeImageUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) {
      return "";
    }
    if (raw.startsWith("/") || raw.startsWith("blob:") || raw.startsWith("data:")) {
      return raw;
    }
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) {
      return `https://${raw}`;
    }
    return raw;
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

  function saveCatalogMap(catalogMap) {
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalogMap));
    } catch (error) {
      return;
    }
  }

  function cacheCatalogProducts(products) {
    if (!Array.isArray(products) || !products.length) {
      return;
    }
    const next = loadCatalogMap();
    let changed = false;
    products.forEach((product) => {
      if (!product || !product.id) {
        return;
      }
      const key = String(product.id).trim();
      if (!key) {
        return;
      }
      const existing = next[key] || {};
      next[key] = {
        ...existing,
        ...product,
        id: key,
        name: product.name || existing.name || `Product #${key}`,
        brand: product.brand || existing.brand || "Generic",
        category: product.category || existing.category || "accessory",
        price: Number(product.price ?? existing.price ?? 0),
        listPrice: Number(product.listPrice ?? existing.listPrice ?? product.price ?? 0),
        rating: Number(product.rating ?? existing.rating ?? 0),
        image: normalizeImageUrl(product.image || existing.image || "")
      };
      changed = true;
    });
    if (changed) {
      saveCatalogMap(next);
    }
  }

  function normalizeCategorySlug(value) {
    const raw = String(value || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (raw === "accessories") {
      return "accessory";
    }
    if (raw === "computers") {
      return "computer";
    }
    if (raw === "mobiles") {
      return "mobile";
    }
    return raw;
  }

  function categoryLabel(value) {
    const normalized = normalizeCategorySlug(value);
    const knownLabels = {
      all: "All Catalogue",
      accessory: "Accessories",
      audio: "Audio",
      computer: "Computers",
      laptop: "Laptops",
      mobile: "Mobiles",
      printer: "Printers"
    };
    if (knownLabels[normalized]) {
      return knownLabels[normalized];
    }
    return (
      normalized
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (ch) => ch.toUpperCase()) || "Products"
    );
  }

  function getSearchCatalogOptions() {
    return ["all", ...DEFAULT_CATALOG_ORDER];
  }

  function buildCatalogOptionsMarkup(selectedValue = "all") {
    const normalizedSelected = normalizeCategorySlug(selectedValue) || "all";
    return getSearchCatalogOptions()
      .map((value) => {
        const selected = value === normalizedSelected ? ' selected="selected"' : "";
        return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(categoryLabel(value))}</option>`;
      })
      .join("");
  }

  function money(value) {
    return inrFormatter.format(Number(value || 0));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightQuery(text, query) {
    const raw = String(text || "");
    const cleanQuery = String(query || "").trim();
    if (!cleanQuery) {
      return escapeHtml(raw);
    }

    const matcher = new RegExp(`(${escapeRegExp(cleanQuery)})`, "ig");
    const parts = raw.split(matcher);
    if (parts.length === 1) {
      return escapeHtml(raw);
    }

    return parts
      .map((part, index) => (index % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
      .join("");
  }

  function renderSuggestionItem(item, query) {
    const media =
      item.type === "product" && item.image
        ? `
          <span class="suggestion-media suggestion-thumb" aria-hidden="true">
            <img src="${escapeHtml(item.image)}" alt="" loading="lazy" />
          </span>
        `
        : `<span class="suggestion-media suggestion-icon suggestion-icon--${escapeHtml(item.type)}" aria-hidden="true"></span>`;

    const kicker = item.kicker
      ? `<span class="suggestion-kicker">${escapeHtml(item.kicker)}</span>`
      : "";
    const meta = item.meta
      ? `<span class="suggestion-meta">${highlightQuery(item.meta, query)}</span>`
      : "";
    const trailingBits = [];
    if (item.priceText) {
      trailingBits.push(`<span class="suggestion-price">${escapeHtml(item.priceText)}</span>`);
    }
    if (item.action) {
      trailingBits.push(`<span class="suggestion-action">${escapeHtml(item.action)}</span>`);
    }
    const trailing = trailingBits.length
      ? `<span class="suggestion-trailing">${trailingBits.join("")}</span>`
      : "";

    return `
      <button class="suggestion-item suggestion-item--${escapeHtml(item.type)}" type="button" data-suggestion-type="${escapeHtml(item.type)}" data-suggestion-value="${escapeHtml(item.value)}">
        ${media}
        <span class="suggestion-copy">
          ${kicker}
          <span class="suggestion-label">${highlightQuery(item.label, query)}</span>
          ${meta}
        </span>
        ${trailing}
      </button>
    `;
  }

  function renderSuggestionGroup(title, items, query) {
    if (!items.length) {
      return "";
    }
    return `
      <section class="suggestion-group">
        <div class="suggestion-group-head">
          <p class="suggestion-group-label">${escapeHtml(title)}</p>
          ${title === "Recent Searches" ? '<button class="suggestion-clear" type="button" data-clear-search-history="1">Clear</button>' : ""}
        </div>
        ${items.map((item) => renderSuggestionItem(item, query)).join("")}
      </section>
    `;
  }

  function renderSuggestionEmptyState(query) {
    return `
      <div class="suggestion-empty">
        <strong>No direct matches yet</strong>
        <span>Press Search to see all results for "${escapeHtml(query)}".</span>
      </div>
    `;
  }

  function getCatalogProducts() {
    return Object.values(loadCatalogMap()).filter(
      (item) => item && item.id && Number(item.price || 0) > 0
    );
  }

  async function warmCatalogCache() {
    if (fetchedCatalog) {
      return;
    }
    if (Object.keys(loadCatalogMap()).length >= 48) {
      fetchedCatalog = true;
      return;
    }
    if (fetchPromise) {
      return fetchPromise;
    }
    fetchPromise = (async () => {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/products?status=active`);
      } catch (error) {
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || !Array.isArray(data.products)) {
        return;
      }
      cacheCatalogProducts(data.products);
      fetchedCatalog = true;
    })();
    try {
      await fetchPromise;
    } finally {
      fetchPromise = null;
    }
  }

  function buildProductsSearchUrl(query, category = "") {
    const params = new URLSearchParams();
    const cleanQuery = String(query || "").trim();
    const cleanCategory = normalizeCategorySlug(category);
    if (cleanQuery) {
      params.set("search", cleanQuery);
    }
    if (cleanCategory && cleanCategory !== "all") {
      params.set("category", cleanCategory);
    }
    const suffix = params.toString();
    return suffix ? `products.html?${suffix}` : "products.html";
  }

  function createSearchButton() {
    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Search";
    return button;
  }

  function ensureInputWrap(form, input) {
    let wrap = input.closest(".search-input-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "search-input-wrap";
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
    }
    return wrap;
  }

  function ensureSuggestionsHost(form, input) {
    const wrap = ensureInputWrap(form, input);
    let suggestions = wrap.querySelector(".search-suggestions");
    if (!suggestions) {
      suggestions = document.createElement("div");
      suggestions.className = "search-suggestions";
      suggestions.hidden = true;
      wrap.appendChild(suggestions);
    }
    return suggestions;
  }

  function ensureSearchContext(form, input) {
    const queryCategory = normalizeCategorySlug(
      new URLSearchParams(window.location.search).get("category") || ""
    );
    let context = form.querySelector('select[data-search-catalog="1"], select.search-context-select');
    if (!context) {
      const legacyContext = form.querySelector(".search-context");
      context = document.createElement("select");
      if (legacyContext) {
        legacyContext.replaceWith(context);
      } else {
        const wrap = input.closest(".search-input-wrap");
        if (wrap && wrap.parentNode) {
          wrap.parentNode.insertBefore(context, wrap);
        } else {
          form.insertBefore(context, input);
        }
      }
    }
    const nextValue =
      normalizeCategorySlug(form.dataset.sharedSearchCategory || "") ||
      queryCategory ||
      normalizeCategorySlug(context.value || "") ||
      "all";
    context.className = "search-context-select";
    context.setAttribute("data-search-catalog", "1");
    context.setAttribute("aria-label", "Browse catalogue");
    context.innerHTML = buildCatalogOptionsMarkup(nextValue);
    context.value = getSearchCatalogOptions().includes(nextValue) ? nextValue : "all";
    return context;
  }

  function normalizeSharedSearchForm(form) {
    if (!form) {
      return null;
    }
    const input = form.querySelector('input[type="search"]');
    if (!input) {
      return null;
    }

    form.setAttribute("data-shared-search", "1");
    if (!form.classList.contains("search-form")) {
      form.classList.add("search-form");
    }
    form.classList.add("shared-search-form");
    if (!form.getAttribute("action")) {
      form.setAttribute("action", "products.html");
    }
    if (!form.getAttribute("method")) {
      form.setAttribute("method", "get");
    }
    if (!form.getAttribute("role")) {
      form.setAttribute("role", "search");
    }

    input.setAttribute("autocomplete", "off");
    if (!input.getAttribute("name")) {
      input.setAttribute("name", "q");
    }
    if (!input.getAttribute("placeholder")) {
      input.setAttribute("placeholder", "Search products");
    }
    if (!input.getAttribute("aria-label")) {
      input.setAttribute("aria-label", "Search products");
    }

    ensureInputWrap(form, input);
    const catalogSelect = ensureSearchContext(form, input);

    let submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) {
      submitButton = createSearchButton();
      form.appendChild(submitButton);
    } else if (!String(submitButton.textContent || "").trim()) {
      submitButton.textContent = "Search";
    }

    return { form, input, catalogSelect };
  }

  function buildInjectedSearchForm() {
    const form = document.createElement("form");
    form.innerHTML = `
      <input type="search" name="q" placeholder="Search products" aria-label="Search products" />
      <button type="submit">Search</button>
    `;
    return normalizeSharedSearchForm(form)?.form || null;
  }

  function injectSearchIntoContainer(container) {
    if (!container || container.querySelector('form[data-shared-search="1"], form.search-shell, form.search-form')) {
      return null;
    }

    const form = buildInjectedSearchForm();
    if (!form) {
      return null;
    }

    container.classList.add("shared-search-ready");

    const beforeNode =
      container.querySelector(".header-links, .top-links, .invoice-actions") || null;

    if (beforeNode) {
      container.insertBefore(form, beforeNode);
    } else {
      container.appendChild(form);
    }
    return form;
  }

  function injectInvoiceSearchRail() {
    const header = document.querySelector(".invoice-header.no-print");
    if (!header) {
      return null;
    }
    if (document.querySelector(".shared-search-rail")) {
      return null;
    }
    const form = buildInjectedSearchForm();
    if (!form) {
      return null;
    }
    const rail = document.createElement("div");
    rail.className = "shared-search-rail no-print";
    rail.appendChild(form);
    header.insertAdjacentElement("afterend", rail);
    return form;
  }

  function collectSearchForms() {
    const forms = new Set();

    document
      .querySelectorAll('form[data-shared-search="1"], .top-nav form.search-shell, .top-nav form.search-form')
      .forEach((form) => forms.add(form));

    document.querySelectorAll(".page-header").forEach((header) => {
      const nestedForm = header.querySelector("form.search-shell, form.search-form");
      if (nestedForm) {
        forms.add(nestedForm);
      } else {
        const injected = injectSearchIntoContainer(header);
        if (injected) {
          forms.add(injected);
        }
      }
    });

    document.querySelectorAll(".site-header .top-nav").forEach((nav) => {
      const nestedForm = nav.querySelector("form.search-shell, form.search-form");
      if (nestedForm) {
        forms.add(nestedForm);
      } else {
        const injected = injectSearchIntoContainer(nav);
        if (injected) {
          forms.add(injected);
        }
      }
    });

    const invoiceForm = injectInvoiceSearchRail();
    if (invoiceForm) {
      forms.add(invoiceForm);
    }

    return Array.from(forms)
      .map((form) => normalizeSharedSearchForm(form)?.form || null)
      .filter(Boolean);
  }

  function closeSuggestions(host) {
    if (!host) {
      return;
    }
    host.hidden = true;
    host.innerHTML = "";
    host.setAttribute("aria-hidden", "true");
    const owningInputId = host.getAttribute("data-search-input-id");
    if (owningInputId) {
      const owningInput = document.getElementById(owningInputId);
      owningInput?.setAttribute("aria-expanded", "false");
      owningInput?.removeAttribute("aria-activedescendant");
    }
  }

  function prepareSuggestionAccessibility(input, host) {
    if (!input || !host) {
      return;
    }
    host.setAttribute("role", "listbox");
    host.setAttribute("aria-hidden", host.hidden ? "true" : "false");
    if (!input.id) {
      input.id = `shared-search-input-${Math.random().toString(36).slice(2, 8)}`;
    }
    host.setAttribute("data-search-input-id", input.id);
    input.setAttribute("aria-controls", host.id || "sharedSearchSuggestions");
    input.setAttribute("aria-expanded", host.hidden ? "false" : "true");
    Array.from(host.querySelectorAll("[data-suggestion-type]")).forEach((item, index) => {
      if (!item.id) {
        item.id = `${host.id || "shared-search-suggestion"}-${index}`;
      }
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", item.classList.contains("is-active") ? "true" : "false");
    });
  }

  function clearSearchHistory() {
    saveSearchHistory([]);
  }

  function renderSuggestions(input, host) {
    if (!host) {
      return;
    }
    const query = String(input.value || "").trim().toLowerCase();
    if (!query) {
      const recent = loadSearchHistory();
      if (!recent.length) {
        closeSuggestions(host);
        return;
      }
      host.innerHTML = renderSuggestionGroup(
        "Recent Searches",
        recent.map((item) => ({
          type: "history",
          value: item,
          label: item,
          meta: "Recent search",
          kicker: "Recent",
          action: "Use"
        })),
        ""
      );
      host.hidden = false;
      prepareSuggestionAccessibility(input, host);
      return;
    }
    if (query.length < 2) {
      closeSuggestions(host);
      return;
    }

    const products = getCatalogProducts();
    const categoryMatches = Array.from(
      new Set(
        products
          .map((item) => normalizeCategorySlug(item.category))
          .filter(
            (category) => category && categoryLabel(category).toLowerCase().includes(query)
          )
      )
    )
      .slice(0, 2)
      .map((category) => ({
        type: "category",
        value: category,
        label: categoryLabel(category),
        meta: "Browse category",
        kicker: "Category",
        action: "Browse"
      }));

    const productMatches = products
      .filter((item) =>
        `${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(query)
      )
      .slice(0, 4)
      .map((item) => ({
        type: "product",
        value: String(item.id),
        label: String(item.name || `Product #${item.id}`),
        meta: `${item.brand || "ElectroMart"} | ${categoryLabel(normalizeCategorySlug(item.category))}`,
        kicker: Number(item.rating || 0) > 0 ? `${Number(item.rating).toFixed(1)} rated` : "Top match",
        action: "View",
        image: normalizeImageUrl(item.image || ""),
        priceText: money(item.price)
      }));
    const markup = [
      renderSuggestionGroup("Categories", categoryMatches, query),
      renderSuggestionGroup("Top Matches", productMatches, query)
    ]
      .filter(Boolean)
      .join("");

    if (!markup) {
      host.innerHTML = renderSuggestionEmptyState(String(input.value || "").trim());
      host.hidden = false;
      prepareSuggestionAccessibility(input, host);
      return;
    }

    host.innerHTML = markup;
    host.hidden = false;
    prepareSuggestionAccessibility(input, host);
  }

  function enhanceForm(form) {
    if (form.dataset.sharedSearchBound === "1") {
      return;
    }

    const normalized = normalizeSharedSearchForm(form);
    if (!normalized) {
      return;
    }

    const { input, catalogSelect } = normalized;
    const suggestions = ensureSuggestionsHost(form, input);
    if (!suggestions.id) {
      suggestions.id = `shared-search-suggestions-${Math.random().toString(36).slice(2, 8)}`;
    }
    let activeSuggestionIndex = -1;
    form.dataset.sharedSearchBound = "1";

    const params = new URLSearchParams(window.location.search);
    const preset = String(params.get("search") || params.get("q") || "").trim();
    const presetCategory = normalizeCategorySlug(params.get("category") || "");
    if (preset && !String(input.value || "").trim()) {
      input.value = preset;
    }
    if (catalogSelect && presetCategory) {
      catalogSelect.value = getSearchCatalogOptions().includes(presetCategory)
        ? presetCategory
        : "all";
      form.dataset.sharedSearchCategory = catalogSelect.value;
    }

    const debouncedRender = (() => {
      let timer = 0;
      return () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          renderSuggestions(input, suggestions);
          resetSuggestionNavigation();
        }, 180);
      };
    })();

    function getSuggestionButtons() {
      return Array.from(suggestions.querySelectorAll("[data-suggestion-type]"));
    }

    function resetSuggestionNavigation() {
      activeSuggestionIndex = -1;
      getSuggestionButtons().forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-selected", "false");
      });
      input.removeAttribute("aria-activedescendant");
      prepareSuggestionAccessibility(input, suggestions);
    }

    function syncSuggestionNavigation() {
      const items = getSuggestionButtons();
      if (!items.length) {
        activeSuggestionIndex = -1;
        return;
      }
      const safeIndex = Math.max(0, Math.min(activeSuggestionIndex, items.length - 1));
      activeSuggestionIndex = safeIndex;
      items.forEach((item, index) => {
        const active = index === safeIndex;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
      });
      input.setAttribute("aria-activedescendant", items[safeIndex].id);
      items[safeIndex].scrollIntoView({ block: "nearest" });
    }

    function moveSuggestionNavigation(direction) {
      const items = getSuggestionButtons();
      if (!items.length) {
        return false;
      }
      if (activeSuggestionIndex < 0) {
        activeSuggestionIndex = direction > 0 ? 0 : items.length - 1;
      } else {
        activeSuggestionIndex = (activeSuggestionIndex + direction + items.length) % items.length;
      }
      syncSuggestionNavigation();
      return true;
    }

    function activateSuggestionSelection() {
      const items = getSuggestionButtons();
      if (activeSuggestionIndex < 0 || !items[activeSuggestionIndex]) {
        return false;
      }
      const item = items[activeSuggestionIndex];
      const type = item.getAttribute("data-suggestion-type");
      const value = String(item.getAttribute("data-suggestion-value") || "").trim();
      closeSuggestions(suggestions);
      resetSuggestionNavigation();
      if (type === "product" && value) {
        window.location.href = `product-detail.html?id=${encodeURIComponent(value)}`;
        return true;
      }
      if (type === "category" && value) {
        rememberSearchQuery(categoryLabel(value));
        window.location.href = buildProductsSearchUrl("", value);
        return true;
      }
      if (type === "history" && value) {
        input.value = value;
        rememberSearchQuery(value);
        window.location.href = buildProductsSearchUrl(value, catalogSelect?.value || "all");
        return true;
      }
      return true;
    }

    function handleSuggestionKeydown(event) {
      if (event.key === "Escape") {
        if (!suggestions.hidden) {
          event.preventDefault();
          closeSuggestions(suggestions);
          resetSuggestionNavigation();
          input.focus();
        }
        return;
      }
      if (event.key === "Tab") {
        if (suggestions.hidden) {
          return;
        }
        const items = getSuggestionButtons();
        if (!items.length) {
          if (event.shiftKey) {
            closeSuggestions(suggestions);
          }
          return;
        }
        if (event.shiftKey) {
          closeSuggestions(suggestions);
          return;
        }
        event.preventDefault();
        const nextIndex = activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0;
        activeSuggestionIndex = nextIndex;
        syncSuggestionNavigation();
        items[nextIndex].focus();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
        return;
      }
      if (suggestions.hidden) {
        renderSuggestions(input, suggestions);
        resetSuggestionNavigation();
      }
      const items = getSuggestionButtons();
      if (!items.length) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSuggestionNavigation(1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSuggestionNavigation(-1);
        return;
      }
      if (event.key === "Enter" && activeSuggestionIndex >= 0) {
        event.preventDefault();
        activateSuggestionSelection();
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = String(input.value || "").trim();
      const category = normalizeCategorySlug(catalogSelect?.value || "all");
      rememberSearchQuery(query);
      closeSuggestions(suggestions);
      resetSuggestionNavigation();
      window.location.href = buildProductsSearchUrl(query, category);
    });

    input.addEventListener("input", () => {
      debouncedRender();
    });
    input.addEventListener("focus", () => {
      renderSuggestions(input, suggestions);
      resetSuggestionNavigation();
      prepareSuggestionAccessibility(input, suggestions);
      void warmCatalogCache();
    });
    input.addEventListener("keydown", handleSuggestionKeydown);
    if (catalogSelect) {
      catalogSelect.addEventListener("change", () => {
        const value = normalizeCategorySlug(catalogSelect.value || "all") || "all";
        catalogSelect.value = getSearchCatalogOptions().includes(value) ? value : "all";
        form.dataset.sharedSearchCategory = catalogSelect.value;
        closeSuggestions(suggestions);
        resetSuggestionNavigation();
      });
    }

    suggestions.addEventListener("mousedown", (event) => {
      if (event.target.closest("[data-suggestion-type], [data-clear-search-history]")) {
        event.preventDefault();
      }
    });

    suggestions.addEventListener("mouseover", (event) => {
      const item = event.target.closest("[data-suggestion-type]");
      if (!item) {
        return;
      }
      const items = getSuggestionButtons();
      const nextIndex = items.indexOf(item);
      if (nextIndex >= 0) {
        activeSuggestionIndex = nextIndex;
        syncSuggestionNavigation();
      }
    });

    suggestions.addEventListener("click", (event) => {
      const clearButton = event.target.closest("[data-clear-search-history]");
      if (clearButton) {
        event.preventDefault();
        clearSearchHistory();
        if (String(input.value || "").trim()) {
          renderSuggestions(input, suggestions);
          resetSuggestionNavigation();
        } else {
          closeSuggestions(suggestions);
          resetSuggestionNavigation();
        }
        return;
      }
      const item = event.target.closest("[data-suggestion-type]");
      if (!item) {
        return;
      }
      const type = item.getAttribute("data-suggestion-type");
      const value = String(item.getAttribute("data-suggestion-value") || "").trim();
      closeSuggestions(suggestions);
      resetSuggestionNavigation();
      if (type === "product" && value) {
        window.location.href = `product-detail.html?id=${encodeURIComponent(value)}`;
        return;
      }
      if (type === "category" && value) {
        rememberSearchQuery(categoryLabel(value));
        window.location.href = buildProductsSearchUrl("", value);
        return;
      }
      if (type === "history" && value) {
        input.value = value;
        rememberSearchQuery(value);
        window.location.href = buildProductsSearchUrl(value, catalogSelect?.value || "all");
      }
    });

    document.addEventListener("click", (event) => {
      if (!form.contains(event.target)) {
        closeSuggestions(suggestions);
        resetSuggestionNavigation();
      }
    });

    suggestions.addEventListener("focusin", (event) => {
      const item = event.target.closest("[data-suggestion-type]");
      if (!item) {
        return;
      }
      const items = getSuggestionButtons();
      const nextIndex = items.indexOf(item);
      if (nextIndex >= 0) {
        activeSuggestionIndex = nextIndex;
        syncSuggestionNavigation();
      }
    });

    suggestions.addEventListener("keydown", (event) => {
      const item = event.target.closest("[data-suggestion-type]");
      if (!item) {
        return;
      }
      const items = getSuggestionButtons();
      const currentIndex = items.indexOf(item);
      if (currentIndex < 0) {
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        activeSuggestionIndex = nextIndex;
        syncSuggestionNavigation();
        items[nextIndex].focus();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = (currentIndex - 1 + items.length) % items.length;
        activeSuggestionIndex = nextIndex;
        syncSuggestionNavigation();
        items[nextIndex].focus();
        return;
      }
      if (event.key === "Tab") {
        if (event.shiftKey) {
          event.preventDefault();
          if (currentIndex === 0) {
            input.focus();
            activeSuggestionIndex = 0;
            syncSuggestionNavigation();
            return;
          }
          const prevIndex = currentIndex - 1;
          activeSuggestionIndex = prevIndex;
          syncSuggestionNavigation();
          items[prevIndex].focus();
          return;
        }
        if (currentIndex === items.length - 1) {
          window.setTimeout(() => {
            closeSuggestions(suggestions);
            resetSuggestionNavigation();
          }, 0);
          return;
        }
        event.preventDefault();
        const nextIndex = currentIndex + 1;
        activeSuggestionIndex = nextIndex;
        syncSuggestionNavigation();
        items[nextIndex].focus();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestions(suggestions);
        resetSuggestionNavigation();
        input.focus();
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateSuggestionSelection();
      }
    });
  }

  const forms = collectSearchForms();
  if (!forms.length) {
    return;
  }

  forms.forEach(enhanceForm);
  void warmCatalogCache();
})();
