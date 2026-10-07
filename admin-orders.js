/**
 * ElectroMart Seller Central — Orders & Fulfillment Controller (Phase 12)
 */

(function () {
  'use strict';

  let allOrders = [];
  let filteredOrders = [];

  function initOrdersPage() {
    if (!window.EM_ADMIN) return;
    window.EM_ADMIN.renderTopbar('orders');

    allOrders = window.EM_ADMIN.getOrders();

    // Check URL parameters for search query
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    const searchInput = document.getElementById('orderSearchInput');
    if (searchParam && searchInput) {
      searchInput.value = searchParam;
    }

    setupEventListeners();
    applyFilters();
  }

  function updateKpis() {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'pending').length;
    const shipped = allOrders.filter(o => o.status === 'shipped').length;
    const delivered = allOrders.filter(o => o.status === 'delivered').length;

    const elTotal = document.getElementById('orderKpiTotal');
    const elPending = document.getElementById('orderKpiPending');
    const elShipped = document.getElementById('orderKpiShipped');
    const elDelivered = document.getElementById('orderKpiDelivered');

    if (elTotal) elTotal.textContent = String(total);
    if (elPending) elPending.textContent = String(pending);
    if (elShipped) elShipped.textContent = String(shipped);
    if (elDelivered) elDelivered.textContent = String(delivered);
  }

  function applyFilters() {
    const searchInput = document.getElementById('orderSearchInput');
    const statusFilter = document.getElementById('orderStatusFilter');
    const courierFilter = document.getElementById('orderCourierFilter');

    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const statusVal = statusFilter ? statusFilter.value : 'all';
    const courierVal = courierFilter ? courierFilter.value : 'all';

    filteredOrders = allOrders.filter(order => {
      // Status filter
      if (statusVal !== 'all' && String(order.status).toLowerCase() !== statusVal) {
        return false;
      }
      // Courier filter
      if (courierVal !== 'all' && !String(order.courier || '').toLowerCase().includes(courierVal.toLowerCase())) {
        return false;
      }
      // Search query
      if (q) {
        const idMatch = String(order.id || '').toLowerCase().includes(q);
        const nameMatch = order.customer && String(order.customer.name || '').toLowerCase().includes(q);
        const cityMatch = order.customer && String(order.customer.city || '').toLowerCase().includes(q);
        const phoneMatch = order.customer && String(order.customer.phone || '').includes(q);
        const trackingMatch = String(order.trackingNumber || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !cityMatch && !phoneMatch && !trackingMatch) {
          return false;
        }
      }
      return true;
    });

    updateKpis();
    renderOrdersTable();
  }

  function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const meta = document.getElementById('ordersCountMeta');
    if (!tbody) return;

    if (meta) {
      meta.textContent = `Showing ${filteredOrders.length} of ${allOrders.length} orders`;
    }

    if (filteredOrders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 36px 16px;">
            <p style="margin: 0; font-size: 1.1rem; color: var(--subtle);">No orders match your filter criteria.</p>
            <button type="button" class="amz-btn-secondary" id="clearFiltersBtn" style="margin-top: 10px;">Clear Filters</button>
          </td>
        </tr>
      `;
      const clearBtn = document.getElementById('clearFiltersBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          const searchInput = document.getElementById('orderSearchInput');
          const statusFilter = document.getElementById('orderStatusFilter');
          const courierFilter = document.getElementById('orderCourierFilter');
          if (searchInput) searchInput.value = '';
          if (statusFilter) statusFilter.value = 'all';
          if (courierFilter) courierFilter.value = 'all';
          applyFilters();
        });
      }
      return;
    }

    tbody.innerHTML = filteredOrders.map(order => {
      const status = String(order.status || 'pending').toLowerCase();
      const customer = order.customer || {};
      const customerInfo = `
        <strong>${customer.name || 'Customer'}</strong><br />
        <small style="color: var(--subtle);">${customer.phone || ''}</small><br />
        <small style="color: var(--subtle);">${customer.city || 'Delhi'}, ${customer.pincode || '110001'}</small>
      `;

      const itemsSummary = Array.isArray(order.items)
        ? order.items.map(i => `<div style="margin-bottom: 2px;">• ${i.name || 'Product'} <strong style="color: var(--subtle);">(x${i.quantity || 1})</strong></div>`).join('')
        : '1 Item';

      const courierInfo = order.trackingNumber
        ? `<strong>${order.courier || 'Easy Ship'}</strong><br /><small style="font-family: monospace; color: var(--link);">${order.trackingNumber}</small>`
        : `<span style="color: var(--subtle); font-style: italic;">Not assigned</span>`;

      return `
        <tr>
          <td><strong>${order.id}</strong></td>
          <td>${window.EM_ADMIN.formatDate(order.createdAt)}</td>
          <td>${customerInfo}</td>
          <td style="max-width: 240px; font-size: 0.82rem;">${itemsSummary}</td>
          <td><strong>${window.EM_ADMIN.formatCurrency(order.total)}</strong></td>
          <td><span style="font-size: 0.8rem; font-weight: 600;">${order.paymentMethod || 'UPI'}</span></td>
          <td><span class="status-pill ${status}">${status}</span></td>
          <td>${courierInfo}</td>
          <td>
            <div style="display: flex; gap: 6px; flex-direction: column;">
              <button type="button" class="amz-btn-primary ship-btn" data-order-id="${order.id}" style="padding: 4px 10px; font-size: 0.78rem;">
                <span>📦 Update Status</span>
              </button>
              <button type="button" class="amz-btn-secondary invoice-btn" data-order-id="${order.id}" style="padding: 4px 10px; font-size: 0.78rem;">
                <span>📄 Tax Invoice</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row button listeners
    tbody.querySelectorAll('.ship-btn').forEach(btn => {
      btn.addEventListener('click', () => openShipModal(btn.dataset.orderId));
    });

    tbody.querySelectorAll('.invoice-btn').forEach(btn => {
      btn.addEventListener('click', () => openInvoiceModal(btn.dataset.orderId));
    });
  }

  function openShipModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('shipOrderModal');
    const displayId = document.getElementById('modalOrderDisplayId');
    const hiddenId = document.getElementById('modalOrderId');
    const statusSelect = document.getElementById('modalOrderStatus');
    const courierSelect = document.getElementById('modalOrderCourier');
    const trackingInput = document.getElementById('modalOrderTracking');

    if (displayId) displayId.value = order.id;
    if (hiddenId) hiddenId.value = order.id;
    if (statusSelect) statusSelect.value = order.status || 'pending';
    if (courierSelect) courierSelect.value = order.courier || 'Easy Ship Standard';
    if (trackingInput) {
      trackingInput.value = order.trackingNumber || `EM-IN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    }

    if (modal) modal.hidden = false;
  }

  function saveShipModal() {
    const hiddenId = document.getElementById('modalOrderId');
    const statusSelect = document.getElementById('modalOrderStatus');
    const courierSelect = document.getElementById('modalOrderCourier');
    const trackingInput = document.getElementById('modalOrderTracking');

    const orderId = hiddenId ? hiddenId.value : null;
    if (!orderId) return;

    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const prevStatus = allOrders[orderIndex].status;
    const newStatus = statusSelect ? statusSelect.value : prevStatus;
    const newCourier = courierSelect ? courierSelect.value : 'Easy Ship Standard';
    const newTracking = trackingInput ? trackingInput.value.trim() : '';

    allOrders[orderIndex].status = newStatus;
    allOrders[orderIndex].courier = newCourier;
    allOrders[orderIndex].trackingNumber = newTracking;

    window.EM_ADMIN.saveOrders(allOrders);
    window.EM_ADMIN.recordAudit('ORDER_FULFILLMENT_UPDATE', 'order', orderId, `Status updated from ${prevStatus} to ${newStatus}. Courier: ${newCourier}, AWB: ${newTracking}`);
    window.EM_ADMIN.showToast(`Order ${orderId} updated to ${newStatus.toUpperCase()}`, 'success');

    closeShipModal();
    applyFilters();
  }

  function closeShipModal() {
    const modal = document.getElementById('shipOrderModal');
    if (modal) modal.hidden = true;
  }

  function openInvoiceModal(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('invoiceModal');
    const content = document.getElementById('invoiceModalContent');
    if (!modal || !content) return;

    const customer = order.customer || {};
    const itemsHtml = Array.isArray(order.items)
      ? order.items.map((i, idx) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
              <strong>${i.name || 'Product'}</strong><br />
              <small style="color: #666;">HSN: 84713010 | SKU: ${i.id || 'N/A'}</small>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${i.quantity || 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${window.EM_ADMIN.formatCurrency(i.price)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;"><strong>${window.EM_ADMIN.formatCurrency((i.price || 0) * (i.quantity || 1))}</strong></td>
          </tr>
        `).join('')
      : '';

    content.innerHTML = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #111; padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #232f3e; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <h2 style="margin: 0; color: #232f3e; font-size: 1.5rem;">ElectroMart India</h2>
            <small style="color: #555;">GSTIN: 07AAACE9812M1Z2 | State: Delhi (07)</small><br />
            <small style="color: #555;">Authorized Seller & Fulfillment Center</small>
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 1.1rem; color: #067d62;">TAX INVOICE</strong><br />
            <small>Invoice #: INV-${order.id}</small><br />
            <small>Date: ${window.EM_ADMIN.formatDate(order.createdAt)}</small>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; font-size: 0.88rem;">
          <div style="background: #f9f9f9; padding: 12px; border-radius: 6px;">
            <strong>Sold By:</strong><br />
            ElectroMart Retail Private Limited<br />
            Plot 45, Okhla Industrial Area Phase III<br />
            New Delhi, Delhi, 110020
          </div>
          <div style="background: #f9f9f9; padding: 12px; border-radius: 6px;">
            <strong>Billing & Shipping Address:</strong><br />
            ${customer.name || 'Customer'}<br />
            ${customer.phone ? `Phone: ${customer.phone}<br />` : ''}
            ${customer.city || 'Delhi'}, ${customer.pincode || '110001'}, India
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 0.88rem;">
          <thead>
            <tr style="background: #232f3e; color: #fff;">
              <th style="padding: 8px; text-align: left;">#</th>
              <th style="padding: 8px; text-align: left;">Item Description</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit Price</th>
              <th style="padding: 8px; text-align: right;">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ddd; padding-top: 12px;">
          <div style="font-size: 0.8rem; color: #555;">
            Payment Mode: <strong>${order.paymentMethod || 'UPI'}</strong> (Payment Cleared)<br />
            Courier Partner: <strong>${order.courier || 'Easy Ship'}</strong><br />
            AWB Tracking: <strong>${order.trackingNumber || 'Pending'}</strong>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.88rem; color: #555;">Shipping: Free Delivery (₹0.00)</div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #232f3e; margin-top: 4px;">
              Grand Total: ${window.EM_ADMIN.formatCurrency(order.total)}
            </div>
            <small style="color: #666;">(Inclusive of 18% GST)</small>
          </div>
        </div>
      </div>
    `;

    modal.hidden = false;
  }

  function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) modal.hidden = true;
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('orderSearchInput');
    const statusFilter = document.getElementById('orderStatusFilter');
    const courierFilter = document.getElementById('orderCourierFilter');
    const refreshBtn = document.getElementById('refreshOrdersBtn');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (courierFilter) courierFilter.addEventListener('change', applyFilters);

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        allOrders = window.EM_ADMIN.getOrders();
        applyFilters();
        window.EM_ADMIN.showToast('Orders refreshed from storage.', 'success');
      });
    }

    // Modal buttons
    const closeShipModalBtn = document.getElementById('closeShipModalBtn');
    const cancelShipModalBtn = document.getElementById('cancelShipModalBtn');
    const saveShipModalBtn = document.getElementById('saveShipModalBtn');

    if (closeShipModalBtn) closeShipModalBtn.addEventListener('click', closeShipModal);
    if (cancelShipModalBtn) cancelShipModalBtn.addEventListener('click', closeShipModal);
    if (saveShipModalBtn) saveShipModalBtn.addEventListener('click', saveShipModal);

    const closeInvoiceModalBtn = document.getElementById('closeInvoiceModalBtn');
    const closeInvoiceFooterBtn = document.getElementById('closeInvoiceFooterBtn');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');

    if (closeInvoiceModalBtn) closeInvoiceModalBtn.addEventListener('click', closeInvoiceModal);
    if (closeInvoiceFooterBtn) closeInvoiceFooterBtn.addEventListener('click', closeInvoiceModal);
    if (printInvoiceBtn) {
      printInvoiceBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrdersPage);
  } else {
    initOrdersPage();
  }
})();
