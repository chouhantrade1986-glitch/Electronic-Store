/**
 * ElectroMart Pay & UPI Hub Controller
 * Manages wallet balance, 1-click auto-reload, virtual UPI ID,
 * QR scanner simulation, pending collect requests, scratch rewards, and passbook statements.
 */

(function () {
  'use strict';

  const PAY_BALANCE_KEY = "electromart_pay_balance_v1";
  const PAY_TXNS_KEY = "electromart_pay_txns_v1";
  const PAY_AUTO_RELOAD_KEY = "electromart_pay_auto_reload_v1";
  const PAY_SCRATCH_KEY = "electromart_pay_scratch_claimed_v1";
  const PAY_PENDING_REQUESTS_KEY = "electromart_pay_pending_requests_v1";

  // Initial seed transactions if none exist
  const DEFAULT_TRANSACTIONS = [
    {
      id: "txn_101",
      date: "Today, 10:15 AM",
      description: "Cashback Credited - Lightning Deal",
      type: "cashback",
      category: "credit",
      amount: 120.00,
      status: "Successful"
    },
    {
      id: "txn_102",
      date: "Yesterday, 04:30 PM",
      description: "Added Money via UPI FastPay",
      type: "added",
      category: "credit",
      amount: 2000.00,
      status: "Successful"
    },
    {
      id: "txn_103",
      date: "06 Sep 2026, 02:10 PM",
      description: "Paid for Order #EM-8921 (Logitech MX Master 3S)",
      type: "orders",
      category: "debit",
      amount: 1499.00,
      status: "Successful"
    },
    {
      id: "txn_104",
      date: "04 Sep 2026, 11:45 AM",
      description: "Cashback Credited - Super Saver Offer",
      type: "cashback",
      category: "credit",
      amount: 50.00,
      status: "Successful"
    }
  ];

  // Initial seed pending UPI collect requests
  const DEFAULT_PENDING_REQUESTS = [
    {
      id: "req_1",
      merchant: "Zomato Online",
      amount: 450.00,
      time: "10 mins ago"
    },
    {
      id: "req_2",
      merchant: "Swiggy Instamart",
      amount: 620.00,
      time: "25 mins ago"
    }
  ];

  // Helper: Format currency in Indian numbering format
  function formatINR(val) {
    return Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Read Wallet Balance
  function getPayBalance() {
    const stored = localStorage.getItem(PAY_BALANCE_KEY);
    if (stored !== null && !isNaN(parseFloat(stored))) {
      return parseFloat(stored);
    }
    return 2450.00; // default seed matching account.js
  }

  // Save Wallet Balance and notify all listeners
  function savePayBalance(newAmount) {
    localStorage.setItem(PAY_BALANCE_KEY, String(newAmount));
    window.dispatchEvent(new Event("electromart_pay_balance_updated"));
  }

  // Read Transactions
  function getTransactions() {
    try {
      const stored = localStorage.getItem(PAY_TXNS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse pay transactions", e);
    }
    return [...DEFAULT_TRANSACTIONS];
  }

  // Save Transactions
  function saveTransactions(txns) {
    localStorage.setItem(PAY_TXNS_KEY, JSON.stringify(txns));
  }

  // Prepend a Transaction
  function addTransaction(txn) {
    const txns = getTransactions();
    txns.unshift(txn);
    saveTransactions(txns);
  }

  // Read Pending Requests
  function getPendingRequests() {
    try {
      const stored = localStorage.getItem(PAY_PENDING_REQUESTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse pending requests", e);
    }
    return [...DEFAULT_PENDING_REQUESTS];
  }

  function savePendingRequests(reqs) {
    localStorage.setItem(PAY_PENDING_REQUESTS_KEY, JSON.stringify(reqs));
  }

  // UI Toast notification
  function showPayToast(msg, type = "info") {
    const container = document.getElementById("payToastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `pay-toast ${type}`;
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // DOM Elements
  let heroBalanceAmountEl;
  let customAmountInputEl;
  let addMoneySubmitBtnEl;
  let autoReloadToggleEl;
  let autoReloadStatusEl;
  let virtualVpaDisplayEl;
  let copyVpaBtnEl;
  let openQrScannerBtnEl;
  let qrScannerModalEl;
  let qrScannerModalBackdropEl;
  let closeQrModalBtnEl;
  let pendingCollectListEl;
  let pendingRequestsCountEl;
  let statementListEl;
  let statementSearchInputEl;
  let statementFilterTabsEl;
  let downloadStatementBtnEl;
  let scratchCardWidgetEl;
  let scratchCoverEl;
  let revealScratchCardBtnEl;
  let scratchRewardResultEl;
  let statCashbackNumEl;

  let currentFilter = "all";

  // Update Hero Balance
  function refreshBalanceDisplay() {
    const bal = getPayBalance();
    if (heroBalanceAmountEl) {
      heroBalanceAmountEl.textContent = formatINR(bal);
    }

    // Recalculate total cashback
    if (statCashbackNumEl) {
      const txns = getTransactions();
      const totalCashback = txns
        .filter(t => t.type === "cashback" && t.category === "credit")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      statCashbackNumEl.textContent = `₹${Math.round(totalCashback)}`;
    }
  }

  // Render Statement Rows
  function renderStatement() {
    if (!statementListEl) return;
    const txns = getTransactions();
    const query = (statementSearchInputEl ? statementSearchInputEl.value.trim().toLowerCase() : "");

    const filtered = txns.filter(t => {
      if (currentFilter !== "all" && t.type !== currentFilter) {
        return false;
      }
      if (query) {
        const descMatch = (t.description || "").toLowerCase().includes(query);
        const statusMatch = (t.status || "").toLowerCase().includes(query);
        return descMatch || statusMatch;
      }
      return true;
    });

    if (filtered.length === 0) {
      statementListEl.innerHTML = `
        <div class="statement-empty">
          <p>No transactions found matching your criteria.</p>
        </div>
      `;
      return;
    }

    statementListEl.innerHTML = filtered.map(t => {
      const isCredit = t.category === "credit";
      const iconClass = isCredit ? "credit" : "debit";
      const iconChar = isCredit ? "↓" : "↑";
      const amountSign = isCredit ? "+ " : "- ";
      const amountClass = isCredit ? "positive" : "negative";

      return `
        <div class="statement-row" data-id="${t.id}">
          <div class="stmt-left">
            <div class="stmt-icon ${iconClass}">${iconChar}</div>
            <div class="stmt-info">
              <strong class="stmt-title">${t.description}</strong>
              <span class="stmt-date">${t.date}</span>
            </div>
          </div>
          <div class="stmt-right">
            <span class="stmt-amount ${amountClass}">${amountSign}₹${formatINR(t.amount)}</span>
            <span class="stmt-status">${t.status || "Successful"}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  // Render Pending Collect Requests
  function renderPendingRequests() {
    if (!pendingCollectListEl) return;
    const reqs = getPendingRequests();

    if (pendingRequestsCountEl) {
      pendingRequestsCountEl.textContent = `${reqs.length} Pending`;
    }

    if (reqs.length === 0) {
      pendingCollectListEl.innerHTML = `
        <div class="pending-empty">No pending UPI collect requests.</div>
      `;
      return;
    }

    pendingCollectListEl.innerHTML = reqs.map(r => `
      <div class="pending-request-card" data-req-id="${r.id}">
        <div class="pending-req-meta">
          <strong class="pending-req-merchant">${r.merchant}</strong>
          <span class="pending-req-time">${r.time}</span>
        </div>
        <div class="pending-req-right">
          <span class="pending-req-amount">₹${formatINR(r.amount)}</span>
          <button type="button" class="pending-action-btn pending-approve-btn" data-action="approve" data-id="${r.id}" data-merchant="${r.merchant}" data-amount="${r.amount}">Approve</button>
          <button type="button" class="pending-action-btn pending-decline-btn" data-action="decline" data-id="${r.id}">Decline</button>
        </div>
      </div>
    `).join("");
  }

  // Handle Approve / Decline Pending Request
  function handlePendingAction(e) {
    const btn = e.target.closest(".pending-action-btn");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const merchant = btn.dataset.merchant;
    const amount = parseFloat(btn.dataset.amount);

    let reqs = getPendingRequests();

    if (action === "approve") {
      const currentBal = getPayBalance();
      if (currentBal < amount) {
        showPayToast(`Insufficient balance to approve request. Shortfall: ₹${formatINR(amount - currentBal)}. Please add money.`, "error");
        return;
      }

      // Deduct balance
      const newBal = currentBal - amount;
      savePayBalance(newBal);

      // Record transaction
      addTransaction({
        id: "txn_" + Date.now(),
        date: "Just now",
        description: `Approved UPI Collect Request - ${merchant}`,
        type: "orders",
        category: "debit",
        amount: amount,
        status: "Successful"
      });

      // Remove from pending
      reqs = reqs.filter(r => r.id !== id);
      savePendingRequests(reqs);

      refreshBalanceDisplay();
      renderStatement();
      renderPendingRequests();

      showPayToast(`Payment of ₹${formatINR(amount)} to ${merchant} approved successfully!`, "success");
    } else if (action === "decline") {
      reqs = reqs.filter(r => r.id !== id);
      savePendingRequests(reqs);
      renderPendingRequests();
      showPayToast("Collect request declined.", "info");
    }
  }

  // Setup Add Money Handlers
  function setupAddMoney() {
    const presetBtns = document.querySelectorAll(".pay-preset-btn");
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (customAmountInputEl) {
          customAmountInputEl.value = btn.dataset.preset;
        }
      });
    });

    if (customAmountInputEl) {
      customAmountInputEl.addEventListener("input", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
      });
    }

    if (addMoneySubmitBtnEl) {
      addMoneySubmitBtnEl.addEventListener("click", () => {
        const val = parseFloat(customAmountInputEl ? customAmountInputEl.value : 0);
        if (isNaN(val) || val < 100 || val > 50000) {
          showPayToast("Please enter an amount between ₹100 and ₹50,000.", "error");
          return;
        }

        const newBal = getPayBalance() + val;
        savePayBalance(newBal);

        addTransaction({
          id: "txn_" + Date.now(),
          date: "Just now",
          description: `Added Money via UPI FastPay`,
          type: "added",
          category: "credit",
          amount: val,
          status: "Successful"
        });

        refreshBalanceDisplay();
        renderStatement();
        if (customAmountInputEl) customAmountInputEl.value = "";
        presetBtns.forEach(b => b.classList.remove("active"));

        showPayToast(`₹${formatINR(val)} added to your ElectroMart Pay balance successfully!`, "success");
      });
    }
  }

  // Setup Auto-Reload Switch
  function setupAutoReload() {
    if (!autoReloadToggleEl) return;
    const isAuto = localStorage.getItem(PAY_AUTO_RELOAD_KEY) === "true";
    autoReloadToggleEl.checked = isAuto;
    updateAutoReloadStatusLabel(isAuto);

    autoReloadToggleEl.addEventListener("change", () => {
      const checked = autoReloadToggleEl.checked;
      localStorage.setItem(PAY_AUTO_RELOAD_KEY, String(checked));
      updateAutoReloadStatusLabel(checked);
      if (checked) {
        showPayToast("1-Click Auto-Reload enabled (₹1,000 when below ₹200).", "success");
      } else {
        showPayToast("1-Click Auto-Reload disabled.", "info");
      }
    });
  }

  function updateAutoReloadStatusLabel(isActive) {
    if (!autoReloadStatusEl) return;
    if (isActive) {
      autoReloadStatusEl.textContent = "Active";
      autoReloadStatusEl.classList.add("active");
    } else {
      autoReloadStatusEl.textContent = "Disabled";
      autoReloadStatusEl.classList.remove("active");
    }
  }

  // Setup Virtual UPI ID & QR Scanner Modal
  function setupUpi() {
    if (copyVpaBtnEl) {
      copyVpaBtnEl.addEventListener("click", () => {
        const vpa = (virtualVpaDisplayEl ? virtualVpaDisplayEl.textContent.trim() : "user@electromart");
        navigator.clipboard.writeText(vpa).then(() => {
          showPayToast(`UPI ID "${vpa}" copied to clipboard!`, "success");
        }).catch(() => {
          showPayToast(`Copied UPI ID: ${vpa}`, "success");
        });
      });
    }

    if (openQrScannerBtnEl) {
      openQrScannerBtnEl.addEventListener("click", openQrModal);
    }

    if (closeQrModalBtnEl) {
      closeQrModalBtnEl.addEventListener("click", closeQrModal);
    }

    if (qrScannerModalBackdropEl) {
      qrScannerModalBackdropEl.addEventListener("click", closeQrModal);
    }

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && qrScannerModalEl && !qrScannerModalEl.hasAttribute("hidden")) {
        closeQrModal();
      }
    });

    // Preset merchant scan buttons
    const presetScanBtns = document.querySelectorAll(".qr-scan-preset-btn");
    presetScanBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const merchant = btn.dataset.merchant;
        const amount = parseFloat(btn.dataset.amount);
        const currentBal = getPayBalance();

        if (currentBal < amount) {
          showPayToast(`Insufficient balance for QR payment. Shortfall: ₹${formatINR(amount - currentBal)}. Please add money.`, "error");
          return;
        }

        // Deduct balance
        const newBal = currentBal - amount;
        savePayBalance(newBal);

        // Record transaction
        addTransaction({
          id: "txn_" + Date.now(),
          date: "Just now",
          description: `QR Payment - ${merchant}`,
          type: "orders",
          category: "debit",
          amount: amount,
          status: "Successful"
        });

        refreshBalanceDisplay();
        renderStatement();
        closeQrModal();

        showPayToast(`QR Payment of ₹${formatINR(amount)} to ${merchant} completed!`, "success");
      });
    });
  }

  function openQrModal() {
    if (!qrScannerModalEl) return;
    qrScannerModalEl.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeQrModal() {
    if (!qrScannerModalEl) return;
    qrScannerModalEl.setAttribute("hidden", "true");
    document.body.style.overflow = "";
  }

  // Setup Scratch Card Reward
  function setupScratchCard() {
    const isClaimed = localStorage.getItem(PAY_SCRATCH_KEY) === "true";

    if (isClaimed) {
      if (scratchCoverEl) scratchCoverEl.classList.add("scratched");
      if (revealScratchCardBtnEl) {
        revealScratchCardBtnEl.disabled = true;
        revealScratchCardBtnEl.textContent = "Reward Claimed";
      }
      if (scratchRewardResultEl) scratchRewardResultEl.removeAttribute("hidden");
      return;
    }

    function claimScratchReward() {
      if (localStorage.getItem(PAY_SCRATCH_KEY) === "true") return;
      localStorage.setItem(PAY_SCRATCH_KEY, "true");

      if (scratchCoverEl) scratchCoverEl.classList.add("scratched");
      if (revealScratchCardBtnEl) {
        revealScratchCardBtnEl.disabled = true;
        revealScratchCardBtnEl.textContent = "Reward Claimed";
      }
      if (scratchRewardResultEl) scratchRewardResultEl.removeAttribute("hidden");

      // Credit ₹50 cashback to wallet
      const rewardAmt = 50.00;
      const newBal = getPayBalance() + rewardAmt;
      savePayBalance(newBal);

      addTransaction({
        id: "txn_" + Date.now(),
        date: "Just now",
        description: "Cashback Credited - Scratch & Win Reward",
        type: "cashback",
        category: "credit",
        amount: rewardAmt,
        status: "Successful"
      });

      refreshBalanceDisplay();
      renderStatement();

      showPayToast(`🎉 Congratulations! ₹${formatINR(rewardAmt)} instant cashback credited to your wallet!`, "success");
    }

    if (scratchCoverEl) {
      scratchCoverEl.addEventListener("click", claimScratchReward);
    }

    if (revealScratchCardBtnEl) {
      revealScratchCardBtnEl.addEventListener("click", claimScratchReward);
    }
  }

  // Setup Passbook Controls & Search
  function setupStatementControls() {
    const tabs = document.querySelectorAll(".statement-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentFilter = tab.dataset.filter || "all";
        renderStatement();
      });
    });

    if (statementSearchInputEl) {
      statementSearchInputEl.addEventListener("input", () => {
        renderStatement();
      });
    }

    if (downloadStatementBtnEl) {
      downloadStatementBtnEl.addEventListener("click", () => {
        const txns = getTransactions();
        let content = "ELECTROMART PAY STATEMENT\n";
        content += "Generated on: " + new Date().toLocaleString() + "\n";
        content += "Virtual UPI ID: user@electromart\n";
        content += "Available Balance: INR " + formatINR(getPayBalance()) + "\n";
        content += "---------------------------------------------------------\n";
        content += "Date | Description | Type | Amount | Status\n";
        content += "---------------------------------------------------------\n";
        txns.forEach(t => {
          content += `${t.date} | ${t.description} | ${t.category.toUpperCase()} | INR ${formatINR(t.amount)} | ${t.status}\n`;
        });
        content += "---------------------------------------------------------\n";
        content += "End of Statement. Thank you for using ElectroMart Pay.\n";

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ElectroMart_Pay_Statement.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showPayToast("Statement downloaded successfully!", "success");
      });
    }
  }

  // Initialize all elements and event bindings
  function init() {
    heroBalanceAmountEl = document.getElementById("heroBalanceAmount");
    customAmountInputEl = document.getElementById("customAmountInput");
    addMoneySubmitBtnEl = document.getElementById("addMoneySubmitBtn");
    autoReloadToggleEl = document.getElementById("autoReloadToggle");
    autoReloadStatusEl = document.getElementById("autoReloadStatus");
    virtualVpaDisplayEl = document.getElementById("virtualVpaDisplay");
    copyVpaBtnEl = document.getElementById("copyVpaBtn");
    openQrScannerBtnEl = document.getElementById("openQrScannerBtn");
    qrScannerModalEl = document.getElementById("qrScannerModal");
    qrScannerModalBackdropEl = document.getElementById("qrScannerModalBackdrop");
    closeQrModalBtnEl = document.getElementById("closeQrModalBtn");
    pendingCollectListEl = document.getElementById("pendingCollectList");
    pendingRequestsCountEl = document.getElementById("pendingRequestsCount");
    statementListEl = document.getElementById("statementList");
    statementSearchInputEl = document.getElementById("statementSearchInput");
    statementFilterTabsEl = document.getElementById("statementFilterTabs");
    downloadStatementBtnEl = document.getElementById("downloadStatementBtn");
    scratchCardWidgetEl = document.getElementById("scratchCardWidget");
    scratchCoverEl = document.getElementById("scratchCover");
    revealScratchCardBtnEl = document.getElementById("revealScratchCardBtn");
    scratchRewardResultEl = document.getElementById("scratchRewardResult");
    statCashbackNumEl = document.getElementById("statCashbackNum");

    // Initialize transaction list if not in storage
    if (!localStorage.getItem(PAY_TXNS_KEY)) {
      saveTransactions(DEFAULT_TRANSACTIONS);
    }

    if (!localStorage.getItem(PAY_PENDING_REQUESTS_KEY)) {
      savePendingRequests(DEFAULT_PENDING_REQUESTS);
    }

    refreshBalanceDisplay();
    renderPendingRequests();
    renderStatement();

    setupAddMoney();
    setupAutoReload();
    setupUpi();
    setupScratchCard();
    setupStatementControls();

    if (pendingCollectListEl) {
      pendingCollectListEl.addEventListener("click", handlePendingAction);
    }

    // Cross-tab and window event synchronization
    window.addEventListener("storage", (e) => {
      if (e.key === PAY_BALANCE_KEY || e.key === PAY_TXNS_KEY) {
        refreshBalanceDisplay();
        renderStatement();
      }
    });

    window.addEventListener("electromart_pay_balance_updated", () => {
      refreshBalanceDisplay();
      renderStatement();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Export to window for unit testing
  window.ElectroMartPay = {
    getPayBalance,
    savePayBalance,
    getTransactions,
    addTransaction,
    getPendingRequests,
    formatINR
  };

})();
