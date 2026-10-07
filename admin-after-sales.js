/**
 * ElectroMart Seller Central — Returns & Support Controller (Phase 12)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'electromart_after_sales_cases_v1';
  let cases = [];
  let filteredCases = [];

  function getSeedCases() {
    return [
      {
        id: 'CLM-2026-081',
        orderId: 'ORD-IN-2026-9079',
        customer: 'Vikram Mehta',
        item: 'Logitech MX Master 3S Wireless Mouse',
        type: 'Replacement',
        reason: 'Scroll wheel ratchet mechanism feeling loose on arrival.',
        amount: 8995,
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: 'CLM-2026-080',
        orderId: 'ORD-IN-2026-9078',
        customer: 'Ananya Roy',
        item: 'Sony WH-1000XM5 Noise Canceling Headphones',
        type: 'Return',
        reason: 'Color shade mismatch. Requested return within 7-day window.',
        amount: 29990,
        status: 'refunded',
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
      },
      {
        id: 'CLM-2026-079',
        orderId: 'ORD-IN-2026-9076',
        customer: 'Kunal Verma',
        item: 'Apple iPad Air 11-inch (M2, 128GB Wi-Fi)',
        type: 'Replacement',
        reason: 'Box seal opened in transit. Requested replacement unit.',
        amount: 59900,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 52).toISOString()
      },
      {
        id: 'CLM-2026-078',
        orderId: 'ORD-IN-2026-9075',
        customer: 'Deepak Chopra',
        item: 'Dell 27-inch 4K UHD USB-C Hub Monitor',
        type: 'Warranty',
        reason: 'Power adapter replacement claim under manufacturer warranty.',
        amount: 34990,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
      }
    ];
  }

  function loadCases() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const seed = getSeedCases();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  function saveCases() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (e) {}
  }

  function initClaimsPage() {
    if (!window.EM_ADMIN) return;
    window.EM_ADMIN.renderTopbar('after-sales');

    cases = loadCases();
    setupEventListeners();
    applyFilters();
  }

  function updateKpis() {
    const total = cases.length;
    const pending = cases.filter(c => c.status === 'pending').length;
    const approved = cases.filter(c => c.status === 'approved').length;
    const refundedSum = cases
      .filter(c => c.status === 'refunded')
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const elTotal = document.getElementById('kpiTotalClaims');
    const elPending = document.getElementById('kpiPendingClaimsCount');
    const elApproved = document.getElementById('kpiApprovedClaims');
    const elRefunds = document.getElementById('kpiTotalRefunds');

    if (elTotal) elTotal.textContent = String(total);
    if (elPending) elPending.textContent = String(pending);
    if (elApproved) elApproved.textContent = String(approved);
    if (elRefunds) elRefunds.textContent = window.EM_ADMIN.formatCurrency(refundedSum);
  }

  function applyFilters() {
    const searchInput = document.getElementById('claimsSearchInput');
    const typeFilter = document.getElementById('claimTypeFilter');
    const statusFilter = document.getElementById('claimStatusFilter');

    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const typeVal = typeFilter ? typeFilter.value : 'all';
    const statusVal = statusFilter ? statusFilter.value : 'all';

    filteredCases = cases.filter(item => {
      if (typeVal !== 'all' && item.type !== typeVal) return false;
      if (statusVal !== 'all' && item.status !== statusVal) return false;
      if (q) {
        const idMatch = String(item.id || '').toLowerCase().includes(q);
        const orderMatch = String(item.orderId || '').toLowerCase().includes(q);
        const custMatch = String(item.customer || '').toLowerCase().includes(q);
        const itemMatch = String(item.item || '').toLowerCase().includes(q);
        if (!idMatch && !orderMatch && !custMatch && !itemMatch) return false;
      }
      return true;
    });

    updateKpis();
    renderClaimsTable();
  }

  function renderClaimsTable() {
    const tbody = document.getElementById('claimsTableBody');
    const countMeta = document.getElementById('claimsCountMeta');
    if (!tbody) return;

    if (countMeta) {
      countMeta.textContent = `Showing ${filteredCases.length} of ${cases.length} claims`;
    }

    if (filteredCases.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 36px 16px;">
            <p style="margin: 0; font-size: 1.1rem; color: var(--subtle);">No after-sales claims match your filter criteria.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredCases.map(c => {
      const status = String(c.status || 'pending').toLowerCase();
      return `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td><a href="admin-orders.html?search=${encodeURIComponent(c.orderId)}" style="color: var(--link); text-decoration: none; font-weight: 600;">${c.orderId}</a></td>
          <td><strong>${c.customer}</strong></td>
          <td>
            <strong>${c.item}</strong><br />
            <small style="color: var(--subtle);">${c.reason}</small>
          </td>
          <td><span style="font-weight: 600;">${c.type}</span></td>
          <td><strong>${window.EM_ADMIN.formatCurrency(c.amount)}</strong></td>
          <td><span class="status-pill ${status}">${status}</span></td>
          <td>
            <button type="button" class="amz-btn-secondary resolve-btn" data-cid="${c.id}" style="padding: 4px 10px; font-size: 0.78rem;">
              <span>⚖️ Resolve</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.resolve-btn').forEach(btn => {
      btn.addEventListener('click', () => openResolveModal(btn.dataset.cid));
    });
  }

  function openResolveModal(claimId) {
    const c = cases.find(item => item.id === claimId);
    if (!c) return;

    const modal = document.getElementById('processClaimModal');
    const hiddenId = document.getElementById('modalClaimId');
    const display = document.getElementById('modalClaimDisplay');
    const refundAmount = document.getElementById('modalClaimRefundAmount');
    const actionSelect = document.getElementById('modalClaimAction');

    if (hiddenId) hiddenId.value = c.id;
    if (display) display.value = `${c.id} (${c.orderId}) — ${c.customer} — ${c.item}`;
    if (refundAmount) refundAmount.value = c.amount;
    if (actionSelect) actionSelect.value = c.status === 'pending' ? 'approved' : c.status;

    if (modal) modal.hidden = false;
  }

  function saveResolution() {
    const hiddenId = document.getElementById('modalClaimId');
    const actionSelect = document.getElementById('modalClaimAction');
    const refundAmount = document.getElementById('modalClaimRefundAmount');
    const notes = document.getElementById('modalClaimNotes');

    const cid = hiddenId ? hiddenId.value : null;
    if (!cid) return;

    const idx = cases.findIndex(c => c.id === cid);
    if (idx === -1) return;

    const newStatus = actionSelect ? actionSelect.value : 'approved';
    const amount = Number(refundAmount ? refundAmount.value : cases[idx].amount);
    const noteText = notes ? notes.value.trim() : '';

    cases[idx].status = newStatus;
    if (amount) cases[idx].amount = amount;

    saveCases();
    window.EM_ADMIN.recordAudit('CLAIM_RESOLUTION', 'refund', cid, `Case updated to ${newStatus}. Amount: ₹${amount}. Note: ${noteText}`);
    window.EM_ADMIN.showToast(`Claim ${cid} resolved as ${newStatus.toUpperCase()}`, 'success');

    closeResolveModal();
    applyFilters();
  }

  function closeResolveModal() {
    const modal = document.getElementById('processClaimModal');
    if (modal) modal.hidden = true;
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('claimsSearchInput');
    const typeFilter = document.getElementById('claimTypeFilter');
    const statusFilter = document.getElementById('claimStatusFilter');
    const refreshBtn = document.getElementById('refreshClaimsBtn');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        cases = loadCases();
        applyFilters();
        window.EM_ADMIN.showToast('Claims refreshed.', 'success');
      });
    }

    const closeBtn = document.getElementById('closeClaimModalBtn');
    const cancelBtn = document.getElementById('cancelClaimModalBtn');
    const saveBtn = document.getElementById('saveClaimModalBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeResolveModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeResolveModal);
    if (saveBtn) saveBtn.addEventListener('click', saveResolution);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClaimsPage);
  } else {
    initClaimsPage();
  }
})();
