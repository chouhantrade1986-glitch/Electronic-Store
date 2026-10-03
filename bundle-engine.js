(function () {
  function toNumber(value, fallback = 0) {
    const parsed = Number(value ?? fallback);
    return Number.isFinite(parsed) ? parsed : Number(fallback || 0);
  }

  function normalizeProduct(rawProduct) {
    if (!rawProduct || !rawProduct.id) {
      return null;
    }

    const stockValue = toNumber(rawProduct.stock ?? rawProduct.inStock ?? rawProduct.quantity ?? 1, 1);
    const product = {
      id: String(rawProduct.id),
      name: rawProduct.name || rawProduct.title || `Product ${rawProduct.id}`,
      brand: rawProduct.brand || "ElectroMart",
      category: String(rawProduct.category || rawProduct.collections?.[0] || "accessory").toLowerCase(),
      price: toNumber(rawProduct.price, 0),
      listPrice: toNumber(rawProduct.listPrice ?? rawProduct.mrp, rawProduct.price ?? 0),
      rating: toNumber(rawProduct.rating, 0),
      stock: stockValue > 0 ? stockValue : 0,
      image: rawProduct.image || (Array.isArray(rawProduct.images) ? rawProduct.images[0] : "") || "",
      segment: rawProduct.segment || "b2c"
    };

    return product;
  }

  function getCatalog() {
    const explicitCatalog = Array.isArray(window.EM_CATALOG) ? window.EM_CATALOG : [];
    if (explicitCatalog.length) {
      return explicitCatalog.map(normalizeProduct).filter(Boolean);
    }

    if (Array.isArray(window.ELECTROMART_CATALOG)) {
      return window.ELECTROMART_CATALOG.map(normalizeProduct).filter(Boolean);
    }

    if (Array.isArray(window.allProducts)) {
      return window.allProducts.map(normalizeProduct).filter(Boolean);
    }

    return [];
  }

  function buildCategoryMap() {
    return {
      laptop: ["accessory", "computer", "audio"],
      mobile: ["accessory", "audio", "computer"],
      computer: ["accessory", "laptop", "audio"],
      printer: ["accessory", "computer"],
      audio: ["accessory", "mobile", "computer"],
      accessory: ["laptop", "mobile", "computer"],
      default: ["accessory", "computer", "audio", "mobile"]
    };
  }

  function getBundleRecommendations(productId, options = {}) {
    const catalog = getCatalog();
    if (!catalog.length) {
      return [];
    }

    const limit = Math.max(1, Number(options.limit || 3));
    const targetId = String(productId || "");
    const product = catalog.find((item) => String(item.id) === targetId) || null;

    if (!product) {
      return [];
    }

    const categoryMap = buildCategoryMap();
    const primaryCategories = categoryMap[product.category] || categoryMap.default;
    const preferredCategory = product.category || "accessory";
    const inStockOnly = options.stockAware !== false;

    const scoredCandidates = catalog
      .filter((item) => String(item.id) !== targetId)
      .map((item) => {
        const sameBrand = item.brand === product.brand ? 4 : 0;
        const sameCategory = item.category === preferredCategory ? 3 : 0;
        const categoryAffinity = primaryCategories.includes(item.category) ? 2 : 0;
        const stockBonus = (inStockOnly && item.stock > 0) ? 3 : 0;
        const ratingBonus = item.rating >= 4.5 ? 2 : item.rating >= 4 ? 1 : 0;
        const pricePenalty = item.price > 0 && item.price < product.price * 0.4 ? 1 : 0;
        const score = sameBrand + sameCategory + categoryAffinity + stockBonus + ratingBonus + pricePenalty;

        return {
          ...item,
          score,
          stockAware: inStockOnly ? item.stock > 0 : true
        };
      })
      .filter((item) => {
        const allowedByCategory = item.category === preferredCategory || primaryCategories.includes(item.category);
        if (inStockOnly) {
          return allowedByCategory && item.stock > 0;
        }
        return allowedByCategory;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (Number(b.stock) !== Number(a.stock)) return Number(b.stock) - Number(a.stock);
        return Number(b.rating || 0) - Number(a.rating || 0);
      })
      .slice(0, Math.max(limit, 3));

    if (scoredCandidates.length) {
      return scoredCandidates;
    }

    return catalog
      .filter((item) => String(item.id) !== targetId && (inStockOnly ? item.stock > 0 : true))
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, Math.max(limit, 3));
  }

  const bundleEngine = {
    getBundleRecommendations,
    version: "1.0.0"
  };

  if (typeof window !== "undefined") {
    window.getBundleRecommendations = getBundleRecommendations;
    window.ElectroMartBundleEngine = bundleEngine;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { getBundleRecommendations, bundleEngine };
  }
})();