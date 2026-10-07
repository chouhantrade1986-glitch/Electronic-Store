/**
 * ElectroMart Seller Central — Customer Accounts Controller (Phase 12)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'electromart_local_users_v1';
  let users = [];
  let filteredUsers = [];

  function getSeedUsers() {
    return [
      {
        id: 'usr_001',
        name: 'Rahul Sharma',
        email: 'rahul.s@example.com',
        phone: '+91 98765 43210',
        role: 'customer',
        verified: true,
        spend: 119990,
        createdAt: '2026-01-15T10:30:00Z'
      },
      {
        id: 'usr_002',
        name: 'Priya Patel',
        email: 'priya.p@example.com',
        phone: '+91 98111 22233',
        role: 'customer',
        verified: true,
        spend: 129999,
        createdAt: '2026-02-02T14:15:00Z'
      },
      {
        id: 'usr_003',
        name: 'Vikram Mehta',
        email: 'vikram.m@example.com',
        phone: '+91 97234 56789',
        role: 'customer',
        verified: true,
        spend: 8995,
        createdAt: '2026-02-18T09:45:00Z'
      },
      {
        id: 'usr_004',
        name: 'Ananya Roy',
        email: 'ananya.roy@example.com',
        phone: '+91 99001 23456',
        role: 'customer',
        verified: false,
        spend: 29990,
        createdAt: '2026-03-01T11:20:00Z'
      },
      {
        id: 'usr_005',
        name: 'Operations Admin',
        email: 'admin@electromart.in',
        phone: '+91 99999 88888',
        role: 'admin',
        verified: true,
        spend: 0,
        createdAt: '2025-12-01T00:00:00Z'
      }
    ];
  }

  function loadUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const seed = getSeedUsers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  function initUsersPage() {
    if (!window.EM_ADMIN) return;
    window.EM_ADMIN.renderTopbar('users');

    users = loadUsers();
    setupEventListeners();
    applyFilters();
  }

  function applyFilters() {
    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('userRoleFilter');
    const verFilter = document.getElementById('userVerificationFilter');

    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const roleVal = roleFilter ? roleFilter.value : 'all';
    const verVal = verFilter ? verFilter.value : 'all';

    filteredUsers = users.filter(u => {
      if (roleVal !== 'all' && u.role !== roleVal) return false;
      if (verVal === 'verified' && !u.verified) return false;
      if (verVal === 'pending' && u.verified) return false;
      if (q) {
        const nameMatch = String(u.name || '').toLowerCase().includes(q);
        const emailMatch = String(u.email || '').toLowerCase().includes(q);
        const phoneMatch = String(u.phone || '').includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    });

    renderUsersTable();
  }

  function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const meta = document.getElementById('usersCountMeta');
    if (!tbody) return;

    if (meta) {
      meta.textContent = `Showing ${filteredUsers.length} of ${users.length} accounts`;
    }

    if (filteredUsers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px 16px;">
            <p style="margin: 0; font-size: 1.1rem; color: var(--subtle);">No user accounts match your filter criteria.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredUsers.map(u => {
      const isVerified = Boolean(u.verified);
      const verBadge = isVerified
        ? '<span class="status-pill delivered">✓ Verified</span>'
        : '<span class="status-pill pending">Pending OTP</span>';
      const roleBadge = u.role === 'admin'
        ? '<span class="role-badge">Admin Staff</span>'
        : '<span style="font-size: 0.82rem; color: var(--subtle);">Shopper</span>';

      return `
        <tr>
          <td>
            <strong>${u.name || 'User'}</strong><br />
            <small style="color: var(--subtle);">${u.email || ''}</small>
          </td>
          <td><span style="font-family: monospace; font-size: 0.88rem;">${u.phone || '—'}</span></td>
          <td>${roleBadge}</td>
          <td>${verBadge}</td>
          <td><strong>${window.EM_ADMIN.formatCurrency(u.spend || 0)}</strong></td>
          <td>${window.EM_ADMIN.formatDate(u.createdAt)}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <a href="admin-orders.html?search=${encodeURIComponent(u.name || '')}" class="amz-btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;">
                <span>Orders</span>
              </a>
              ${!isVerified ? `
                <button type="button" class="amz-btn-primary nudge-btn" data-phone="${u.phone}" style="padding: 4px 10px; font-size: 0.78rem;">
                  <span>Nudge OTP</span>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.nudge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.EM_ADMIN.showToast(`SMS OTP verification reminder sent to ${btn.dataset.phone}`, 'success');
      });
    });
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('userRoleFilter');
    const verFilter = document.getElementById('userVerificationFilter');
    const refreshBtn = document.getElementById('refreshUsersBtn');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (roleFilter) roleFilter.addEventListener('change', applyFilters);
    if (verFilter) verFilter.addEventListener('change', applyFilters);

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        users = loadUsers();
        applyFilters();
        window.EM_ADMIN.showToast('Customer directory refreshed.', 'success');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUsersPage);
  } else {
    initUsersPage();
  }
})();
