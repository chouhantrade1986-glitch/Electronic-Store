(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) {
    root.ElectroMart = root.ElectroMart || {};
    root.ElectroMart.Recommendations = api;
    root.getPersonalizedRecommendations = api.getPersonalizedRecommendations;
    root.getFrequentlyViewedTogether = api.getFrequentlyViewedTogether;
    api.bindPage(root);
  }
})(typeof window !== 'undefined' ? window : null, function () {
  let exposedApi = null;
  const RECENT_KEY = 'electromart_recently_viewed_v1';
  const EVENT_KEY = 'electromart_view_events_v1';
  const MAX_EVENTS = 80;
  const PAIR_WINDOW_MS = 30 * 60 * 1000;

  function safeJson(storage, key, fallback) {
    try {
      const value = JSON.parse(storage && storage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (_) { return fallback; }
  }

  function idOf(item) {
    if (item && typeof item === 'object') return String(item.productId || item.id || '').trim();
    return String(item || '').trim();
  }

  function words(product) {
    const raw = [product.name, product.category, ...(Array.isArray(product.collections) ? product.collections : []), ...(Array.isArray(product.keywords) ? product.keywords : [])];
    return new Set(raw.join(' ').toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
  }

  function getCatalog(source) {
    return (Array.isArray(source) ? source : []).filter((item) => item && item.id != null && String(item.status || 'active').toLowerCase() === 'active' && String(item.segment || 'b2c').toLowerCase() !== 'b2b' && Number(item.stock == null ? 1 : item.stock) > 0);
  }

  function getPersonalizedRecommendations(options) {
    const opts = options || {};
    const catalog = getCatalog(opts.catalog);
    const historyIds = (Array.isArray(opts.history) ? opts.history : []).map(idOf).filter(Boolean);
    const byId = new Map(catalog.map((product) => [String(product.id), product]));
    const history = historyIds.map((id) => byId.get(id)).filter(Boolean);
    const excluded = new Set([...(opts.excludeIds || []).map(idOf), ...historyIds]);
    const historyWeights = new Map();
    history.forEach((product, index) => historyWeights.set(String(product.id), Math.max(1, 6 - index)));
    const categoryWeights = new Map();
    const brandWeights = new Map();
    const tokenWeights = new Map();
    history.forEach((product, index) => {
      const weight = Math.max(1, 6 - index);
      const category = String(product.category || '').toLowerCase();
      const brand = String(product.brand || '').toLowerCase();
      if (category) categoryWeights.set(category, (categoryWeights.get(category) || 0) + weight);
      if (brand) brandWeights.set(brand, (brandWeights.get(brand) || 0) + weight);
      words(product).forEach((token) => tokenWeights.set(token, (tokenWeights.get(token) || 0) + weight));
    });

    return catalog.filter((product) => !excluded.has(String(product.id))).map((product) => {
      const category = String(product.category || '').toLowerCase();
      const brand = String(product.brand || '').toLowerCase();
      let score = (categoryWeights.get(category) || 0) * 5 + (brandWeights.get(brand) || 0) * 2;
      words(product).forEach((token) => { score += (tokenWeights.get(token) || 0) * 1.5; });
      score += product.featured ? 2 : 0;
      score += Math.max(0, Number(product.rating) || 0) * 0.25;
      return { ...product, recommendationScore: score, recommendationReason: history.length ? 'personalized' : 'fallback' };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore || Number(b.rating || 0) - Number(a.rating || 0) || String(a.id).localeCompare(String(b.id)))
      .slice(0, Math.max(0, Math.min(24, Number(opts.limit) || 8)));
  }

  function getFrequentlyViewedTogether(options) {
    const opts = options || {};
    const currentId = idOf(opts.currentProductId);
    const catalog = getCatalog(opts.catalog);
    const byId = new Map(catalog.map((product) => [String(product.id), product]));
    const events = (Array.isArray(opts.events) ? opts.events : []).map((event) => ({
      productId: idOf(event), viewedAt: Date.parse(event && (event.viewedAt || event.at) || '')
    })).filter((event) => event.productId && Number.isFinite(event.viewedAt));
    const counts = new Map();
    events.forEach((event, index) => {
      if (event.productId !== currentId) return;
      events.forEach((other, otherIndex) => {
        if (otherIndex === index || other.productId === currentId) return;
        if (Math.abs(other.viewedAt - event.viewedAt) <= PAIR_WINDOW_MS) {
          counts.set(other.productId, (counts.get(other.productId) || 0) + 1);
        }
      });
    });
    const rankedPairs = Array.from(counts.entries()).map(([id, count]) => ({ product: byId.get(id), count }))
      .filter((entry) => entry.product)
      .sort((a, b) => b.count - a.count || String(a.product.id).localeCompare(String(b.product.id)))
      .map((entry) => ({ ...entry.product, coViewCount: entry.count, recommendationReason: 'co-view' }));
    const limit = Math.max(0, Math.min(12, Number(opts.limit) || 4));
    if (rankedPairs.length >= limit) return rankedPairs.slice(0, limit);
    const fallback = getPersonalizedRecommendations({ catalog, history: [currentId], excludeIds: [currentId, ...rankedPairs.map((item) => item.id)], limit });
    return rankedPairs.concat(fallback).slice(0, limit);
  }

  function recordProductView(productId, storage, now) {
    const targetStorage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    const id = idOf(productId);
    if (!targetStorage || !id) return [];
    const timestamp = Number.isFinite(Number(now)) ? Number(now) : Date.now();
    const events = safeJson(targetStorage, EVENT_KEY, []);
    const normalized = Array.isArray(events) ? events.filter((event) => event && idOf(event) && Number.isFinite(Date.parse(event.viewedAt))) : [];
    const last = normalized[normalized.length - 1];
    if (!last || idOf(last) !== id || timestamp - Date.parse(last.viewedAt) > 10000) normalized.push({ productId: id, viewedAt: new Date(timestamp).toISOString() });
    const bounded = normalized.slice(-MAX_EVENTS);
    try {
      targetStorage.setItem(EVENT_KEY, JSON.stringify(bounded));
      const recent = safeJson(targetStorage, RECENT_KEY, []);
      const recentIds = Array.isArray(recent) ? recent.map(idOf).filter(Boolean) : [];
      targetStorage.setItem(RECENT_KEY, JSON.stringify([id, ...recentIds.filter((value) => value !== id)].slice(0, 12)));
    } catch (_) { return bounded; }
    return bounded;
  }

  function activeLanguage() {
    try { return (localStorage.getItem('electromart_lang_v1') || localStorage.getItem('electromart_lang') || 'en').toLowerCase(); }
    catch (_) { return 'en'; }
  }

  function label(key, fallback) {
    const dict = window.EM_TRANSLATIONS && (window.EM_TRANSLATIONS[activeLanguage()] || window.EM_TRANSLATIONS.en);
    return (dict && dict[key]) || fallback;
  }

  function localizedName(product, lang) {
    const title = product.title;
    if (title && typeof title === 'object') return title[lang] || title.en || product.name || 'Product';
    return product.name || 'Product';
  }

  function productCard(product, lang) {
    const card = document.createElement('article');
    card.className = 'phase49-recommendation-card';
    const link = document.createElement('a');
    link.className = 'phase49-recommendation-card__link';
    link.href = `product-detail.html?id=${encodeURIComponent(String(product.id))}`;
    const image = document.createElement('img');
    image.src = product.image || (Array.isArray(product.images) ? product.images[0] : '') || 'images/placeholder-product.png';
    image.alt = localizedName(product, lang);
    image.loading = 'lazy';
    const title = document.createElement('span');
    title.className = 'phase49-recommendation-card__title';
    title.textContent = localizedName(product, lang);
    const price = document.createElement('strong');
    price.className = 'phase49-recommendation-card__price';
    price.textContent = new Intl.NumberFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(product.price) || 0);
    link.append(image, title, price);
    card.appendChild(link);
    return card;
  }

  function renderRecommendations(container, items, lang, reasonKey) {
    if (!container) return;
    container.replaceChildren();
    items.forEach((product) => container.appendChild(productCard(product, lang)));
    container.dataset.reason = reasonKey;
  }

  function bindPage(root) {
    if (!root || !root.document) return;
    const document = root.document;
    const renderHome = () => {
      const container = document.getElementById('homeRecommendedShelfRow');
      if (!container) return;
      const history = safeJson(root.localStorage, RECENT_KEY, []);
      const items = getPersonalizedRecommendations({ catalog: root.EM_CATALOG, history, limit: 12 });
      const personalized = Array.isArray(history) && history.length > 0;
      renderRecommendations(container, items, activeLanguage(), personalized ? 'personalized' : 'fallback');
      const reason = container.closest('.amz-product-shelf')?.querySelector('[data-recommendation-reason]');
      if (reason) {
        const key = personalized ? 'recommendation_reason_personalized' : 'recommendation_reason_fallback';
        reason.dataset.i18n = key;
        reason.textContent = label(key, personalized ? 'Picked for your browsing interests' : 'Popular picks from the ElectroMart catalog');
      }
    };
    const renderPdp = (product) => {
      if (!product || product.id == null) return;
      const section = document.getElementById('frequentlyViewedTogether');
      if (!section) return;
      const events = recordProductView(product.id, root.localStorage);
      const items = getFrequentlyViewedTogether({ catalog: root.EM_CATALOG, currentProductId: product.id, events, limit: 4 });
      const container = section.querySelector('[data-fvt-items]');
      renderRecommendations(container, items, activeLanguage(), items.some((item) => item.recommendationReason === 'co-view') ? 'personalized' : 'fallback');
      section.hidden = items.length === 0;
      const title = section.querySelector('[data-i18n="fvt_title"]');
      const subtitle = section.querySelector('[data-i18n="fvt_subtitle"]');
      if (title) title.textContent = label('fvt_title', 'Frequently viewed together');
      if (subtitle) subtitle.textContent = label('fvt_subtitle', 'Related picks based on product category and browsing activity.');
    };
    if (exposedApi) exposedApi.renderProduct = renderPdp;
    const start = () => {
      renderHome();
      if (root.currentLoadedProduct) renderPdp(root.currentLoadedProduct);
      root.addEventListener('languageChanged', renderHome);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }

  exposedApi = { getPersonalizedRecommendations, getFrequentlyViewedTogether, recordProductView, bindPage, storageKeys: { recent: RECENT_KEY, events: EVENT_KEY } };
  return exposedApi;
});
