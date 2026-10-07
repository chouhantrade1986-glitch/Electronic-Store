/**
 * ElectroMart Seller Central — Audit Trail Controller (Phase 12)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'electromart_audit_trail_v1';
  let logs = [];
  let filteredLogs = [];

  function getSeedLogs() {
    return [
      {
        id: 'aud_001',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        actor: 'Operations Admin',
        category: 'order',
        action: 'ORDER_FULFILLMENT_UPDATE',
        target: 'ORD-IN-2026-9080',
        summary: 'Marked order as shipped via Delhivery Air with AWB EM-IN-7821904'
      },
      {
        id: 'aud_002',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        actor: 'Operations Admin',
        category: 'catalog',
        action: 'PRODUCT_UPDATE',
        target: 'LAP-ASUS-ROG16',
        summary: 'Updated selling price to ₹1,19,990 and adjusted reserve stock to 2 units'
      },
      {
        id: 'aud_003',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        actor: 'Operations Admin',
        category: 'refund',
        action: 'CLAIM_RESOLUTION',
        target: 'CLM-2026-080',
        summary: 'Approved return and credited full refund ₹29,990 to customer account'
      },
      {
        id: 'aud_004',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        actor: 'Operations Admin',
        category: 'order',
        action: 'ORDER_FULFILLMENT_UPDATE',
        target: 'ORD-IN-2026-9079',
        summary: 'Marked order as delivered via Blue Dart Express'
      }
    ];
  }

  function loadLogs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const seed = getSeedLogs();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  function initAuditPage() {
    if (!window.EM_ADMIN) return;
    window.EM_ADMIN.renderTopbar('audit');

    logs = loadLogs();
    setupEventListeners();
    applyFilters();
  }

  function updateKpis() {
    const total = logs.length;
    const ordersCount = logs.filter(l => l.category === 'order').length;
    const catalogCount = logs.filter(l => l.category === 'catalog').length;
    const refundCount = logs.filter(l => l.category === 'refund').length;

    const elTotal = document.getElementById('kpiTotalAudit');
    const elOrders = document.getElementById('kpiOrderAudits');
    const elCatalog = document.getElementById('kpiCatalogAudits');
    const elRefund = document.getElementById('kpiRefundAudits');

    if (elTotal) elTotal.textContent = String(total);
    if (elOrders) elOrders.textContent = String(ordersCount);
    if (elCatalog) elCatalog.textContent = String(catalogCount);
    if (elRefund) elRefund.textContent = String(refundCount);
  }

  function applyFilters() {
    const searchInput = document.getElementById('auditSearchInput');
    const catFilter = document.getElementById('auditCategoryFilter');

    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const catVal = catFilter ? catFilter.value : 'all';

    filteredLogs = logs.filter(item => {
      if (catVal !== 'all' && item.category !== catVal) return false;
      if (q) {
        const actorMatch = String(item.actor || '').toLowerCase().includes(q);
        const actionMatch = String(item.action || '').toLowerCase().includes(q);
        const targetMatch = String(item.target || '').toLowerCase().includes(q);
        const summaryMatch = String(item.summary || '').toLowerCase().includes(q);
        if (!actorMatch && !actionMatch && !targetMatch && !summaryMatch) return false;
      }
      return true;
    });

    updateKpis();
    renderAuditTable();
  }

  function renderAuditTable() {
    const tbody = document.getElementById('auditTableBody');
    const meta = document.getElementById('auditCountMeta');
    if (!tbody) return;

    if (meta) {
      meta.textContent = `Showing ${filteredLogs.length} of ${logs.length} log entries`;
    }

    if (filteredLogs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px 16px;">
            <p style="margin: 0; font-size: 1.1rem; color: var(--subtle);">No audit trail records found.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredLogs.map(l => {
      let catBadgeClass = 'delivered';
      if (l.category === 'refund') catBadgeClass = 'urgent';
      if (l.category === 'order') catBadgeClass = 'highlight';

      return `
        <tr>
          <td><small style="font-family: monospace; font-size: 0.82rem;">${window.EM_ADMIN.formatDate(l.timestamp)}</small></td>
          <td><strong>${l.actor || 'Admin'}</strong></td>
          <td><span class="dept-badge" style="font-size: 0.72rem; text-transform: uppercase;">${l.category}</span></td>
          <td><code style="background: #f2f4f8; padding: 2px 6px; border-radius: 4px; font-size: 0.78rem; font-weight: 600;">${l.action}</code></td>
          <td><span style="font-weight: 600; color: var(--link);">${l.target}</span></td>
          <td style="font-size: 0.84rem; line-height: 1.35;">${l.summary}</td>
        </tr>
      `;
    }).join('');
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('auditSearchInput');
    const catFilter = document.getElementById('auditCategoryFilter');
    const refreshBtn = document.getElementById('refreshAuditBtn');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (catFilter) catFilter.addEventListener('change', applyFilters);

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        logs = loadLogs();
        applyFilters();
        window.EM_ADMIN.showToast('Audit trail refreshed.', 'success');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuditPage);
  } else {
    initAuditPage();
  }
})();
