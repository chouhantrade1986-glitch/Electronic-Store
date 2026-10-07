/**
 * ElectroMart Seller Central — Sales & Analytics Controller (Phase 12)
 */

(function () {
  'use strict';

  function initAnalyticsPage() {
    if (!window.EM_ADMIN) return;
    window.EM_ADMIN.renderTopbar('analytics');

    const orders = window.EM_ADMIN.getOrders();
    const catalog = window.EM_ADMIN.getCatalog();

    const grossRev = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const paidCount = orders.filter(o => o.paymentStatus === 'paid' || o.status !== 'cancelled').length || orders.length;
    const aov = paidCount > 0 ? Math.round(grossRev / paidCount) : 0;

    const elRev = document.getElementById('kpiGrossRevenue');
    const elAov = document.getElementById('kpiAov');
    const elPaid = document.getElementById('kpiPaidCount');

    if (elRev) elRev.textContent = window.EM_ADMIN.formatCurrency(grossRev);
    if (elAov) elAov.textContent = window.EM_ADMIN.formatCurrency(aov);
    if (elPaid) elPaid.textContent = String(paidCount);

    // Top 10 Best Selling Products
    const topProducts = [
      { name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256GB)', category: 'Mobiles', price: 129999, units: 1, revenue: 129999 },
      { name: 'ASUS ROG Strix G16 Gaming Laptop (Core i7, RTX 4060)', category: 'Laptops', price: 119990, units: 1, revenue: 119990 },
      { name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', category: 'Audio', price: 29990, units: 1, revenue: 29990 },
      { name: 'Corsair K70 RGB PRO Mechanical Gaming Keyboard', category: 'Accessories', price: 12499, units: 1, revenue: 12499 },
      { name: 'Logitech MX Master 3S Advanced Wireless Mouse', category: 'Accessories', price: 8995, units: 1, revenue: 8995 },
      { name: 'Apple MacBook Air M2 13-inch (8GB RAM, 256GB SSD)', category: 'Laptops', price: 89900, units: 0, revenue: 0 },
      { name: 'OnePlus 12 5G (Silky Black, 16GB RAM, 512GB Storage)', category: 'Mobiles', price: 69999, units: 0, revenue: 0 },
      { name: 'Dell Alienware 27-inch 280Hz Fast IPS Gaming Monitor', category: 'Monitors', price: 44990, units: 0, revenue: 0 },
      { name: 'Bose QuietComfort 45 Wireless Noise Cancelling Headphones', category: 'Audio', price: 24900, units: 0, revenue: 0 },
      { name: 'SanDisk 2TB Extreme Portable SSD USB-C 1050MB/s', category: 'Storage', price: 17499, units: 0, revenue: 0 }
    ];

    const tbody = document.getElementById('topSellingTableBody');
    if (tbody) {
      tbody.innerHTML = topProducts.map((p, idx) => {
        const share = grossRev > 0 && p.revenue > 0 ? ((p.revenue / grossRev) * 100).toFixed(1) : '0.0';
        return `
          <tr>
            <td><strong>#${idx + 1}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>${window.EM_ADMIN.formatCurrency(p.price)}</td>
            <td><strong>${p.units} units</strong></td>
            <td><strong>${window.EM_ADMIN.formatCurrency(p.revenue)}</strong></td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 60px; height: 6px; background: #eaeded; border-radius: 3px; overflow: hidden;">
                  <div style="width: ${share}%; height: 100%; background: #ffa41c;"></div>
                </div>
                <span style="font-size: 0.8rem; font-weight: 600;">${share}%</span>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    const refreshBtn = document.getElementById('refreshAnalyticsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.EM_ADMIN.showToast('Analytics metrics refreshed.', 'success');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalyticsPage);
  } else {
    initAnalyticsPage();
  }
})();
