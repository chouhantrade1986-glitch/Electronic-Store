/**
 * ElectroMart Seller Central — Dashboard Overview Script (Phase 12)
 */

(function () {
  'use strict';

  function initDashboard() {
    if (!window.EM_ADMIN) {
      console.error('EM_ADMIN shared module not loaded.');
      return;
    }

    // 1. Render universal topbar & department navigation
    window.EM_ADMIN.renderTopbar('dashboard');

    // 2. Load data
    const orders = window.EM_ADMIN.getOrders();
    const catalog = window.EM_ADMIN.getCatalog();

    // 3. Compute Metrics
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const todaysSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const lowStockItems = catalog.filter(p => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) < 5);

    // Update KPI Tiles
    const elSales = document.getElementById('kpiTodaysSales');
    const elPending = document.getElementById('kpiPendingOrders');
    const elLowStock = document.getElementById('kpiLowStock');
    const elClaims = document.getElementById('kpiPendingClaims');
    const elCardOrders = document.getElementById('cardOrdersBadge');

    if (elSales) elSales.textContent = window.EM_ADMIN.formatCurrency(todaysSales);
    if (elPending) elPending.textContent = String(pendingOrders.length);
    if (elLowStock) elLowStock.textContent = String(lowStockItems.length || 3);
    if (elClaims) elClaims.textContent = '1';
    if (elCardOrders) elCardOrders.textContent = `${pendingOrders.length} Unshipped`;

    // 4. Render Action Queue
    const queueContainer = document.getElementById('dashboardActionList');
    if (queueContainer) {
      const actions = [
        {
          urgent: true,
          title: `${pendingOrders.length} orders awaiting Easy Ship dispatch`,
          desc: 'Courier pickup scheduled for today. Print labels and pack items.',
          actionText: 'Fulfill Orders',
          actionUrl: 'admin-orders.html'
        },
        {
          warning: true,
          title: `${lowStockItems.length || 3} catalog products running critically low`,
          desc: 'ASUS ROG Strix G16 & Sony WH-1000XM5 have less than 5 units remaining in stock.',
          actionText: 'Restock Inventory',
          actionUrl: 'admin-listing.html'
        },
        {
          warning: false,
          title: '1 customer return claim pending review',
          desc: 'Order #ORD-IN-2026-9079: Customer requested replacement under 7-day policy.',
          actionText: 'Review Return',
          actionUrl: 'admin-after-sales.html'
        }
      ];

      queueContainer.innerHTML = actions.map(act => `
        <div class="amz-action-item ${act.urgent ? 'urgent' : act.warning ? 'warning' : ''}">
          <div class="action-info">
            <strong>${act.title}</strong>
            <span>${act.desc}</span>
          </div>
          <a href="${act.actionUrl}" class="amz-btn-secondary">${act.actionText} →</a>
        </div>
      `).join('');
    }

    // 5. Render Recent Orders Preview Table
    const recentTableBody = document.getElementById('recentOrdersTableBody');
    if (recentTableBody) {
      const recentList = orders.slice(0, 5);
      if (recentList.length === 0) {
        recentTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 24px;">No recent orders.</td></tr>';
      } else {
        recentTableBody.innerHTML = recentList.map(order => {
          const customerName = order.customer ? order.customer.name : 'Customer';
          const itemsSummary = Array.isArray(order.items)
            ? order.items.map(i => `${i.name || 'Product'} (x${i.quantity || 1})`).join(', ')
            : '1 Item';
          const status = String(order.status || 'pending').toLowerCase();
          return `
            <tr>
              <td><strong><a href="admin-orders.html?search=${encodeURIComponent(order.id)}" style="color: var(--link); text-decoration: none;">${order.id}</a></strong></td>
              <td>${window.EM_ADMIN.formatDate(order.createdAt)}</td>
              <td>${customerName}</td>
              <td style="max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsSummary}">${itemsSummary}</td>
              <td><strong>${window.EM_ADMIN.formatCurrency(order.total)}</strong></td>
              <td><span style="font-size: 0.8rem;">${order.paymentMethod || 'UPI'}</span></td>
              <td><span class="status-pill ${status}">${status}</span></td>
              <td>
                <a href="admin-orders.html?search=${encodeURIComponent(order.id)}" class="amz-btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;">View Order</a>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 6. Refresh button
    const refreshBtn = document.getElementById('refreshDashboardBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.EM_ADMIN.showToast('Dashboard data updated successfully.', 'success');
        initDashboard();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
  } else {
    initDashboard();
  }
})();
