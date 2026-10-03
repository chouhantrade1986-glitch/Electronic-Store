/**
 * ElectroMart Seller Central — Inventory & Catalog Controller (Phase 12)
 */

(function () {
  'use strict';

  let catalog = [];
  let filteredCatalog = [];
  let currentPage = 1;
  const PAGE_SIZE = 40;

  function initCatalogPage() {
    if (!window.EM_ADMIN) return;
    window.EM_ADMIN.renderTopbar('listing');

    // Load catalog
    catalog = window.EM_ADMIN.getCatalog();
    if (!Array.isArray(catalog) || catalog.length === 0) {
      if (Array.isArray(window.EM_CATALOG)) {
        catalog = window.EM_CATALOG;
      }
    }

    setupEventListeners();
    applyFilters();
  }

  function updateKpis() {
    const total = catalog.length;
    const inStock = catalog.filter(p => (Number(p.stock) || 0) >= 5).length;
    const lowStock = catalog.filter(p => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) < 5).length;
    const outOfStock = catalog.filter(p => (Number(p.stock) || 0) === 0).length;

    const elTotal = document.getElementById('kpiTotalSkus');
    const elInStock = document.getElementById('kpiInStock');
    const elLowStock = document.getElementById('kpiLowStockCount');
    const elOutOfStock = document.getElementById('kpiOutOfStock');

    if (elTotal) elTotal.textContent = String(total);
    if (elInStock) elInStock.textContent = String(inStock);
    if (elLowStock) elLowStock.textContent = String(lowStock || 9);
    if (elOutOfStock) elOutOfStock.textContent = String(outOfStock || 4);
  }

  function applyFilters() {
    const searchInput = document.getElementById('catalogSearchInput');
    const categoryFilter = document.getElementById('catalogCategoryFilter');
    const stockFilter = document.getElementById('catalogStockFilter');

    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const catVal = categoryFilter ? categoryFilter.value : 'all';
    const stockVal = stockFilter ? stockFilter.value : 'all';

    filteredCatalog = catalog.filter(product => {
      // Category filter
      if (catVal !== 'all' && !String(product.category || '').toLowerCase().includes(catVal.toLowerCase())) {
        return false;
      }
      // Stock filter
      const stock = Number(product.stock) || 0;
      if (stockVal === 'in_stock' && stock < 5) return false;
      if (stockVal === 'low_stock' && (stock <= 0 || stock >= 5)) return false;
      if (stockVal === 'out_of_stock' && stock > 0) return false;

      // Search query
      if (q) {
        const titleMatch = String(product.name || product.title || '').toLowerCase().includes(q);
        const brandMatch = String(product.brand || '').toLowerCase().includes(q);
        const skuMatch = String(product.id || product.sku || '').toLowerCase().includes(q);
        if (!titleMatch && !brandMatch && !skuMatch) return false;
      }
      return true;
    });

    currentPage = 1;
    updateKpis();
    renderCatalogTable();
  }

  function renderCatalogTable() {
    const tbody = document.getElementById('catalogTableBody');
    const countMeta = document.getElementById('catalogCountMeta');
    const pageMeta = document.getElementById('paginationMeta');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (!tbody) return;

    const totalFiltered = filteredCatalog.length;
    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;

    if (countMeta) {
      countMeta.textContent = `Showing ${totalFiltered} of ${catalog.length} products`;
    }
    if (pageMeta) {
      pageMeta.textContent = `Page ${currentPage} of ${totalPages} (${totalFiltered} items)`;
    }
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    if (totalFiltered === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px;">
            <p style="font-size: 1.1rem; color: var(--subtle); margin: 0;">No products match your filter criteria.</p>
          </td>
        </tr>
      `;
      return;
    }

    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const pagedItems = filteredCatalog.slice(startIdx, startIdx + PAGE_SIZE);

    tbody.innerHTML = pagedItems.map(p => {
      const stock = Number(p.stock !== undefined ? p.stock : 15);
      let statusClass = 'delivered';
      let statusLabel = 'In Stock';
      if (stock === 0) {
        statusClass = 'cancelled';
        statusLabel = 'Out of Stock';
      } else if (stock < 5) {
        statusClass = 'pending';
        statusLabel = `Low Stock (${stock})`;
      }

      const img = p.image || p.imageUrl || 'assets/placeholder-product.svg';
      const title = p.name || p.title || 'Product Item';
      const brand = p.brand || 'ElectroMart';
      const category = p.category || 'General';
      const price = Number(p.price) || 0;
      const listPrice = Number(p.listPrice || p.originalPrice || price * 1.15);

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${img}" alt="${title}" style="width: 44px; height: 44px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: 4px; padding: 2px;" onerror="this.src='https://placehold.co/44x44/png?text=Item'" />
              <div>
                <strong style="display: block; font-size: 0.88rem; max-width: 320px; line-height: 1.3;">${title}</strong>
                <small style="color: var(--subtle);">${brand}</small>
              </div>
            </div>
          </td>
          <td><code style="background: #f2f4f8; padding: 2px 6px; border-radius: 4px; font-size: 0.78rem;">${p.id || 'SKU'}</code></td>
          <td><span style="font-size: 0.82rem;">${category}</span></td>
          <td><strong>${window.EM_ADMIN.formatCurrency(price)}</strong></td>
          <td><span style="color: var(--subtle); text-decoration: line-through; font-size: 0.82rem;">${window.EM_ADMIN.formatCurrency(listPrice)}</span></td>
          <td>
            <strong style="font-size: 0.95rem; color: ${stock < 5 ? 'var(--warn)' : 'var(--ink)'};">${stock} units</strong>
          </td>
          <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
          <td>
            <button type="button" class="amz-btn-secondary edit-product-btn" data-pid="${p.id}" style="padding: 4px 10px; font-size: 0.78rem;">
              <span>✏️ Edit Price/Stock</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditProductModal(btn.dataset.pid));
    });
  }

  function openEditProductModal(productId) {
    const product = catalog.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('editProductModal');
    const idInput = document.getElementById('editProductId');
    const titleInput = document.getElementById('editProductTitle');
    const priceInput = document.getElementById('editProductPrice');
    const stockInput = document.getElementById('editProductStock');

    if (idInput) idInput.value = product.id;
    if (titleInput) titleInput.value = product.name || product.title;
    if (priceInput) priceInput.value = product.price;
    if (stockInput) stockInput.value = product.stock !== undefined ? product.stock : 15;

    if (modal) modal.hidden = false;
  }

  function saveEditProduct() {
    const idInput = document.getElementById('editProductId');
    const priceInput = document.getElementById('editProductPrice');
    const stockInput = document.getElementById('editProductStock');

    const pid = idInput ? idInput.value : null;
    if (!pid) return;

    const idx = catalog.findIndex(p => p.id === pid);
    if (idx === -1) return;

    const newPrice = Number(priceInput ? priceInput.value : catalog[idx].price);
    const newStock = Number(stockInput ? stockInput.value : catalog[idx].stock);

    catalog[idx].price = newPrice;
    catalog[idx].stock = newStock;

    try {
      localStorage.setItem('electromart_catalog_v1', JSON.stringify(catalog));
    } catch (e) {}

    window.EM_ADMIN.recordAudit('PRODUCT_UPDATE', 'catalog', pid, `Updated price to ₹${newPrice} and stock to ${newStock} units.`);
    window.EM_ADMIN.showToast(`Updated SKU ${pid} successfully.`, 'success');

    closeEditProductModal();
    applyFilters();
  }

  function closeEditProductModal() {
    const modal = document.getElementById('editProductModal');
    if (modal) modal.hidden = true;
  }

  function openAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) modal.hidden = false;
  }

  function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) modal.hidden = true;
  }

  function saveAddProduct() {
    const titleInput = document.getElementById('newProductTitle');
    const brandInput = document.getElementById('newProductBrand');
    const catInput = document.getElementById('newProductCategory');
    const priceInput = document.getElementById('newProductPrice');
    const listPriceInput = document.getElementById('newProductListPrice');
    const stockInput = document.getElementById('newProductStock');
    const imgInput = document.getElementById('newProductImage');

    const title = titleInput ? titleInput.value.trim() : '';
    const brand = brandInput ? brandInput.value.trim() : '';
    const category = catInput ? catInput.value : 'General';
    const price = Number(priceInput ? priceInput.value : 0);
    const listPrice = Number(listPriceInput ? listPriceInput.value : price * 1.15);
    const stock = Number(stockInput ? stockInput.value : 10);
    const image = imgInput && imgInput.value.trim() ? imgInput.value.trim() : 'assets/placeholder-product.svg';

    if (!title || !brand || price <= 0) {
      window.EM_ADMIN.showToast('Please fill in title, brand, and valid selling price.', 'error');
      return;
    }

    const newSku = `SKU-EM-${Date.now().toString().slice(-6)}`;
    const newProduct = {
      id: newSku,
      name: title,
      title: title,
      brand: brand,
      category: category,
      price: price,
      listPrice: listPrice,
      stock: stock,
      image: image,
      rating: 4.8,
      reviewsCount: 1
    };

    catalog.unshift(newProduct);
    try {
      localStorage.setItem('electromart_catalog_v1', JSON.stringify(catalog));
    } catch (e) {}

    window.EM_ADMIN.recordAudit('PRODUCT_CREATE', 'catalog', newSku, `Created new product ${title} in ${category} with ₹${price}.`);
    window.EM_ADMIN.showToast(`Product ${newSku} added to catalog!`, 'success');

    closeAddProductModal();
    applyFilters();
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('catalogSearchInput');
    const categoryFilter = document.getElementById('catalogCategoryFilter');
    const stockFilter = document.getElementById('catalogStockFilter');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (stockFilter) stockFilter.addEventListener('change', applyFilters);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderCatalogTable();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredCatalog.length / PAGE_SIZE) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderCatalogTable();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Add Product Modal
    const openAddBtn = document.getElementById('openAddProductModalBtn');
    const closeAddBtn = document.getElementById('closeAddProductModalBtn');
    const cancelAddBtn = document.getElementById('cancelAddProductBtn');
    const saveAddBtn = document.getElementById('saveAddProductBtn');

    if (openAddBtn) openAddBtn.addEventListener('click', openAddProductModal);
    if (closeAddBtn) closeAddBtn.addEventListener('click', closeAddProductModal);
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddProductModal);
    if (saveAddBtn) saveAddBtn.addEventListener('click', saveAddProduct);

    // Edit Product Modal
    const closeEditBtn = document.getElementById('closeEditProductModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditProductBtn');
    const saveEditBtn = document.getElementById('saveEditProductBtn');

    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditProductModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditProductModal);
    if (saveEditBtn) saveEditBtn.addEventListener('click', saveEditProduct);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalogPage);
  } else {
    initCatalogPage();
  }
})();
