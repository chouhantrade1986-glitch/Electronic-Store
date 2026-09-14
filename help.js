/**
 * ElectroMart - 24x7 Customer Service & Help Center Engine (help.js)
 * Phase 26: Amazon India Customer Service Architecture.
 * Active Order Quick Help, 6-Core Category Explorer, Live Search FAQ Library,
 * Interactive Chat Assistant, 2-Min Callback Timer with Memory Leak Prevention,
 * Support Ticket Generator, and Cross-Page Navigation.
 * 100% Brand Safe: Pure ElectroMart Customer Service.
 */

(function () {
  'use strict';

  // State keys
  const STORAGE_KEYS = {
    OFFLINE_ORDERS: 'electromart_offline_orders_v1',
    ONLINE_ORDERS: 'electromart_orders_v1',
    TICKETS: 'electromart_support_tickets_v1',
    CHAT_HISTORY: 'electromart_chat_history_v1',
    AUTH_USER: 'electromart_auth_user_v1'
  };

  // State
  let activeOrder = null;
  let allOrders = [];
  let callbackIntervalId = null;
  let callbackSecondsRemaining = 120;
  let isAgentConnected = false;

  // 18+ Curated FAQs across 6 Core Categories
  const HELP_FAQS = [
    // 1. Orders
    {
      id: 'faq-1',
      category: 'orders',
      tag: 'Orders',
      question: "How do I track my package in real-time?",
      answer: "You can track your package by clicking 'Track Package' in the Active Order section above or visiting your Orders page. Our live Delivery Tracking visualizer shows milestones: Order Confirmed, Dispatched from Hub, Out for Delivery, and Delivered."
    },
    {
      id: 'faq-2',
      category: 'orders',
      tag: 'Orders',
      question: "Can I change my delivery address or phone number after placing an order?",
      answer: "Yes, as long as your order has not reached the 'Out for Delivery' stage. Go to Your Orders, select the order, and choose 'Update Delivery Address'. You can also edit delivery instructions for our courier partners."
    },
    {
      id: 'faq-3',
      category: 'orders',
      tag: 'Orders',
      question: "What should I do if my delivery is delayed or rescheduled?",
      answer: "If your order encounters unforeseen logistical delays due to weather or transit, our tracking system updates the estimated arrival window automatically. If it is delayed by more than 24 hours past the promised date, you can request an instant callback or cancel with a full refund."
    },

    // 2. Returns & Refunds
    {
      id: 'faq-4',
      category: 'returns',
      tag: 'Returns',
      question: "What is the ElectroMart 7-Day Hassle-Free Return Policy?",
      answer: "Most electronics and gadgets purchased on ElectroMart are eligible for returns or replacements within 7 days of delivery. The item must be in its original condition with all accessories, brand box, and serial numbers intact."
    },
    {
      id: 'faq-5',
      category: 'returns',
      tag: 'Returns',
      question: "How does free doorstep replacement work for defective items?",
      answer: "When initiating a return in our Returns Center, select 'Replacement' as your resolution. A replacement unit will be dispatched with ₹0.00 additional cost, and our pickup executive will inspect and collect the defective unit at your doorstep."
    },
    {
      id: 'faq-6',
      category: 'returns',
      tag: 'Returns',
      question: "How quickly will my refund be credited to my ElectroMart Pay wallet?",
      answer: "Refunds issued to your ElectroMart Pay wallet are credited within 2 hours of doorstep pickup verification. Refunds to original bank accounts, UPI, or credit cards typically reflect within 3 to 5 business days."
    },

    // 3. Payment & Wallet
    {
      id: 'faq-7',
      category: 'payment',
      tag: 'Payment',
      question: "What should I do if money was debited but the order failed?",
      answer: "Don't worry! In cases of banking network timeouts, if the transaction was debited without generating an order, your bank will automatically reverse the amount within 24 to 48 banking hours. You can also submit an inquiry ticket with your Bank Reference / UTR number."
    },
    {
      id: 'faq-8',
      category: 'payment',
      tag: 'Payment',
      question: "How do I add funds and earn 5% cashback with ElectroMart Pay?",
      answer: "Visit the ElectroMart Pay Hub, choose 'Add Money', and pay using UPI, NetBanking, or Debit Card. Prime members receive an instant 5% cashback credited directly into their ElectroMart Pay wallet on eligible electronics purchases."
    },
    {
      id: 'faq-9',
      category: 'payment',
      tag: 'Payment',
      question: "Are No-Cost EMI options available on credit and debit cards?",
      answer: "Yes, ElectroMart offers 3, 6, and 9-month No-Cost EMI on leading Indian banks (HDFC, ICICI, SBI, Axis, Kotak) for purchases above ₹3,000. Interest charged by the bank is given as an upfront discount at checkout."
    },

    // 4. Prime Membership
    {
      id: 'faq-10',
      category: 'prime',
      tag: 'Prime',
      question: "What exclusive perks do ElectroMart Prime members receive?",
      answer: "Prime members enjoy unlimited FREE 1-Day & Same-Day delivery without minimum order thresholds, 30-minute early access to Lightning Deals, 5% wallet cashback, Prime Video streaming, and ad-free music in 11 Indian languages."
    },
    {
      id: 'faq-11',
      category: 'prime',
      tag: 'Prime',
      question: "How do I start my 30-Day Free Trial of ElectroMart Prime?",
      answer: "Navigate to the Prime Hub (prime.html) and click 'Start Your 30-Day Free Trial'. You can enjoy full Prime benefits immediately, and you can switch between Monthly (₹299/mo) and Annual (₹1,499/yr) plans at any time."
    },
    {
      id: 'faq-12',
      category: 'prime',
      tag: 'Prime',
      question: "Can I pause or cancel my Prime membership without cancellation fees?",
      answer: "Yes! In the Prime Hub, select 'Cancel / Pause Membership'. You can choose to pause your plan for 30 days or cancel anytime with zero penalties."
    },

    // 5. Account Settings
    {
      id: 'faq-13',
      category: 'account',
      tag: 'Account',
      question: "How do I reset my password or update my registered mobile number?",
      answer: "Go to Your Account > Login & Security. Click 'Edit' next to your Password or Mobile Number. You will receive an OTP on your registered phone or email to authenticate the update safely."
    },
    {
      id: 'faq-14',
      category: 'account',
      tag: 'Account',
      question: "How do I enable Two-Factor Authentication (2FA) for extra security?",
      answer: "In Your Account settings, toggle on 'Two-Factor Authentication (2FA)'. Every new login attempt will require an SMS verification code sent to your registered Indian mobile number."
    },
    {
      id: 'faq-15',
      category: 'account',
      tag: 'Account',
      question: "How can I manage and set a default delivery address?",
      answer: "Visit Your Account > Your Addresses. Here you can add new residential or commercial addresses, enter landmark directions, and set a default address for quick 1-click checkout."
    },

    // 6. Safe Shopping & Security
    {
      id: 'faq-16',
      category: 'security',
      tag: 'Security',
      question: "How do I download an official GST tax invoice for business purchases?",
      answer: "Every order on ElectroMart includes a 100% compliant Indian GST Tax Invoice. Go to Your Orders, select the order, and click 'Download Invoice'. The invoice includes HSN codes, GSTIN breakdown, and seller stamp."
    },
    {
      id: 'faq-17',
      category: 'security',
      tag: 'Security',
      question: "How does ElectroMart protect me from online payment fraud and phishing?",
      answer: "All transactions are secured with 256-bit SSL encryption and RBI-mandated two-factor tokenization. ElectroMart representatives will NEVER ask you for your UPI PIN, OTP, or CVV over the phone or email."
    },
    {
      id: 'faq-18',
      category: 'security',
      tag: 'Security',
      question: "Are all electronics sold on ElectroMart covered by manufacturer brand warranty?",
      answer: "Yes. All products listed on ElectroMart are 100% genuine and sourced directly from authorized brand distributors with valid manufacturer warranties applicable across official service centers in India."
    }
  ];

  // Category Details Mapping
  const CATEGORY_DETAILS = {
    orders: {
      icon: '📦',
      title: 'Your Orders & Package Tracking',
      solutions: [
        {
          title: 'Live Package Tracking',
          desc: 'Inspect live milestone progress, delivery courier contact, and live ETA for your shipments.',
          link: 'tracking.html',
          linkText: 'Track Active Package'
        },
        {
          title: 'Order Cancellation',
          desc: 'Cancel any item or complete order before dispatch for an immediate 100% refund.',
          link: 'orders.html',
          linkText: 'Manage Orders'
        },
        {
          title: 'GST Invoicing & Bills',
          desc: 'Download certified PDF tax invoices with itemized GST breakdown for your personal or business records.',
          link: 'orders.html',
          linkText: 'Download Invoices'
        }
      ],
      actionUrl: 'orders.html',
      actionText: 'Go to Your Orders'
    },
    returns: {
      icon: '🔄',
      title: 'Returns & Replacements Center',
      solutions: [
        {
          title: '7-Day Return Guarantee',
          desc: 'Initiate a return within 7 days for damaged, defective, or unwanted electronics.',
          link: 'returns.html',
          linkText: 'Start Return or Replacement'
        },
        {
          title: 'Free Doorstep Replacement',
          desc: 'Get an identical replacement delivered with zero additional shipping or handling fees.',
          link: 'returns.html',
          linkText: 'Request Replacement'
        },
        {
          title: 'Instant Wallet Refund',
          desc: 'Choose ElectroMart Pay wallet refund for instant payout within 2 hours of doorstep handover.',
          link: 'returns.html',
          linkText: 'Check Refund Methods'
        }
      ],
      actionUrl: 'returns.html',
      actionText: 'Open Returns Center'
    },
    payment: {
      icon: '💳',
      title: 'Payment, UPI & ElectroMart Pay',
      solutions: [
        {
          title: 'ElectroMart Pay Wallet',
          desc: 'Manage your prepaid balance, earn 5% cashback, and enjoy seamless 1-click checkout.',
          link: 'pay.html',
          linkText: 'Open Pay Hub'
        },
        {
          title: 'Payment Failure Assistance',
          desc: 'Failed bank debits auto-reverse within 24-48 hours. Report unresolved transactions directly.',
          link: '#',
          linkText: 'Report Failed Payment'
        },
        {
          title: 'No-Cost EMI Options',
          desc: 'Calculate monthly installments across major Indian credit cards and Bajaj Finserv cards.',
          link: 'products.html',
          linkText: 'Explore EMI Products'
        }
      ],
      actionUrl: 'pay.html',
      actionText: 'Open ElectroMart Pay'
    },
    prime: {
      icon: '👑',
      title: 'ElectroMart Prime Membership',
      solutions: [
        {
          title: 'Prime Benefits & Savings',
          desc: 'View your cumulative delivery fee savings, 5% cashback rewards, and exclusive deal access.',
          link: 'prime.html',
          linkText: 'View Prime Hub'
        },
        {
          title: 'Change or Renew Plan',
          desc: 'Switch between Monthly (₹299/mo), Annual (₹1,499/yr), and Prime Lite (₹799/yr).',
          link: 'prime.html',
          linkText: 'Manage Prime Plan'
        },
        {
          title: 'Pause or Cancel Prime',
          desc: 'Temporarily pause your subscription or cancel anytime with zero hidden penalty fees.',
          link: 'prime.html',
          linkText: 'Membership Settings'
        }
      ],
      actionUrl: 'prime.html',
      actionText: 'Go to Prime Hub'
    },
    account: {
      icon: '👤',
      title: 'Account Settings & Security',
      solutions: [
        {
          title: 'Login & Security Credentials',
          desc: 'Update your registered email, password, and mobile number with OTP verification.',
          link: 'account.html',
          linkText: 'Security Settings'
        },
        {
          title: 'Saved Shipping Addresses',
          desc: 'Add, edit, or delete delivery addresses with pincode landmark instructions.',
          link: 'account.html',
          linkText: 'Manage Addresses'
        },
        {
          title: 'Wishlist & Preferences',
          desc: 'View saved items, price drop alerts, and regional language preferences.',
          link: 'wishlist.html',
          linkText: 'Open Wishlist'
        }
      ],
      actionUrl: 'account.html',
      actionText: 'Go to Account Settings'
    },
    security: {
      icon: '🛡️',
      title: 'Safe Shopping, GST & Warranties',
      solutions: [
        {
          title: 'Phishing & Fraud Protection',
          desc: 'Recognize official ElectroMart communications and report suspicious calls or emails.',
          link: '#',
          linkText: 'Security Guidelines'
        },
        {
          title: 'GST Compliance & Invoicing',
          desc: 'Ensure your business GSTIN is validated for 100% input tax credit claiming.',
          link: 'business.html',
          linkText: 'ElectroMart Business'
        },
        {
          title: 'Brand Warranty Service',
          desc: 'Find official manufacturer brand service center locations across all Indian cities.',
          link: 'products.html',
          linkText: 'Authorized Products'
        }
      ],
      actionUrl: 'business.html',
      actionText: 'Visit Business & Security'
    }
  };

  /**
   * Helper: Parse JSON safely
   */
  function safeJsonParse(val, fallback) {
    if (!val) return fallback;
    try {
      return JSON.parse(val);
    } catch (e) {
      return fallback;
    }
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    loadOrders();
    setupActiveOrderWidget();
    renderFaqList(HELP_FAQS);
    setupSearch();
    setupCategoryCards();
    setupSupportChannels();
    setupChatAssistant();
    setupCallbackScheduler();
    setupInquiryTickets();
    setupModalDismissal();
  }

  /**
   * 1. Load Orders from LocalStorage
   */
  function loadOrders() {
    const offline = safeJsonParse(localStorage.getItem(STORAGE_KEYS.OFFLINE_ORDERS), []);
    const online = safeJsonParse(localStorage.getItem(STORAGE_KEYS.ONLINE_ORDERS), []);
    allOrders = Array.isArray(offline) && offline.length > 0 ? offline : (Array.isArray(online) ? online : []);

    if (allOrders.length > 0) {
      activeOrder = allOrders[0]; // Most recent order
    } else {
      activeOrder = null;
    }
  }

  /**
   * 2. Setup Top Active Order Widget & Clean Fallback
   */
  function setupActiveOrderWidget() {
    const activeCard = document.getElementById('activeOrderCard');
    const emptyState = document.getElementById('activeOrderEmptyState');

    if (!activeOrder) {
      if (activeCard) activeCard.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (activeCard) activeCard.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    // Extract item details
    const orderId = activeOrder.id || activeOrder.orderId || 'EM-948201';
    let firstItem = null;
    if (activeOrder.items && activeOrder.items.length > 0) {
      firstItem = activeOrder.items[0];
    }

    const title = firstItem ? (firstItem.title || firstItem.name || 'ElectroMart Gadget') : 'ElectroMart Electronic Product';
    const image = firstItem ? (firstItem.image || firstItem.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150') : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150';
    const status = activeOrder.status || 'delivered';
    const dateStr = activeOrder.createdAt || activeOrder.date || 'Sep 12, 2026';

    const thumbEl = document.getElementById('activeOrderThumb');
    if (thumbEl) {
      thumbEl.src = image;
      thumbEl.alt = title;
    }

    const titleEl = document.getElementById('activeOrderTitle');
    if (titleEl) titleEl.textContent = title;

    const metaEl = document.getElementById('activeOrderMeta');
    if (metaEl) metaEl.textContent = `Order #${orderId} • Placed on ${dateStr}`;

    const badgeEl = document.getElementById('activeOrderStatusBadge');
    if (badgeEl) {
      badgeEl.className = 'active-order-status-badge';
      if (status.includes('return') || status.includes('pickup')) {
        badgeEl.classList.add('status-return');
        badgeEl.textContent = 'Return Initiated / Pickup Scheduled';
      } else if (status.includes('shipped') || status.includes('transit') || status.includes('out_for_delivery')) {
        badgeEl.classList.add('status-shipped');
        badgeEl.textContent = 'Shipped / In Transit';
      } else {
        badgeEl.classList.add('status-delivered');
        badgeEl.textContent = 'Delivered';
      }
    }

    // Action button links
    const trackBtn = document.getElementById('helpTrackPackageBtn');
    if (trackBtn) trackBtn.href = `tracking.html?orderId=${encodeURIComponent(orderId)}`;

    const returnBtn = document.getElementById('helpReturnBtn');
    if (returnBtn) returnBtn.href = `returns.html?orderId=${encodeURIComponent(orderId)}`;

    const invoiceBtn = document.getElementById('helpInvoiceBtn');
    if (invoiceBtn) invoiceBtn.href = `invoice.html?orderId=${encodeURIComponent(orderId)}`;

    const reportBtn = document.getElementById('helpReportIssueBtn');
    if (reportBtn) {
      reportBtn.onclick = function () {
        openTicketModalWithOrder(orderId);
      };
    }
  }

  /**
   * 3. Render FAQ Accordion List
   */
  function renderFaqList(faqs, query = '') {
    const listEl = document.getElementById('helpFaqList');
    const countEl = document.getElementById('helpSearchResultsCount');
    const emptyEl = document.getElementById('faqEmptyState');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (faqs.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      if (countEl) countEl.textContent = '0 articles found';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (countEl) {
      countEl.textContent = query
        ? `Showing ${faqs.length} matching articles for "${query}"`
        : `Showing ${faqs.length} help articles`;
    }

    faqs.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'faq-item';
      itemEl.id = `faqItem-${item.id || index}`;

      // Highlight keyword if query present
      let displayQ = item.question;
      let displayA = item.answer;

      if (query && query.trim().length > 1) {
        const regex = new RegExp(`(${escapeRegex(query.trim())})`, 'gi');
        displayQ = displayQ.replace(regex, '<mark class="help-highlight">$1</mark>');
        displayA = displayA.replace(regex, '<mark class="help-highlight">$1</mark>');
      }

      itemEl.innerHTML = `
        <button type="button" class="faq-question-btn" aria-expanded="false">
          <span>
            <span class="faq-tag">${item.tag}</span>
            <span class="faq-question-text">${displayQ}</span>
          </span>
          <span class="faq-arrow" aria-hidden="true">&#9660;</span>
        </button>
        <div class="faq-answer">
          ${displayA}
        </div>
      `;

      // Accordion toggle
      const btn = itemEl.querySelector('.faq-question-btn');
      btn.addEventListener('click', function () {
        const isActive = itemEl.classList.contains('active');
        // Toggle current
        if (isActive) {
          itemEl.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          itemEl.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      listEl.appendChild(itemEl);
    });
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 4. Smart Search Library & Chips
   */
  function setupSearch() {
    const input = document.getElementById('helpSearchInput');
    const clearBtn = document.getElementById('helpSearchClearBtn');
    const resetBtn = document.getElementById('faqResetSearchBtn');

    if (input) {
      input.addEventListener('input', function () {
        const val = input.value.trim();
        if (clearBtn) {
          clearBtn.style.display = val.length > 0 ? 'block' : 'none';
        }
        filterFaqs(val);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (input) {
          input.value = '';
          input.focus();
        }
        clearBtn.style.display = 'none';
        renderFaqList(HELP_FAQS);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (input) input.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        renderFaqList(HELP_FAQS);
      });
    }

    // Quick Search Chips
    const chips = document.querySelectorAll('.help-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', function () {
        const query = chip.getAttribute('data-query') || '';
        if (input) {
          input.value = query;
          if (clearBtn) clearBtn.style.display = 'block';
          filterFaqs(query);
          // Scroll smoothly to FAQs
          const faqSec = document.getElementById('helpFaqSection');
          if (faqSec) faqSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function filterFaqs(query) {
    if (!query || query.trim().length === 0) {
      renderFaqList(HELP_FAQS);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = HELP_FAQS.filter(item => {
      return item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q);
    });

    renderFaqList(filtered, q);
  }

  /**
   * 5. 6-Core Category Explorer & Modal
   */
  function setupCategoryCards() {
    const cards = document.querySelectorAll('.help-category-card');
    cards.forEach(card => {
      card.addEventListener('click', function () {
        const catKey = card.getAttribute('data-category');
        openCategoryModal(catKey);
      });
      // Keyboard Accessibility
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const catKey = card.getAttribute('data-category');
          openCategoryModal(catKey);
        }
      });
    });

    const closeBtn = document.getElementById('closeCategoryModalBtn');
    const footerCloseBtn = document.getElementById('catModalCloseFooterBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeCategoryModal);
    if (footerCloseBtn) footerCloseBtn.addEventListener('click', closeCategoryModal);
  }

  function openCategoryModal(categoryKey) {
    const data = CATEGORY_DETAILS[categoryKey];
    if (!data) return;

    const modal = document.getElementById('categoryDetailModal');
    const iconEl = document.getElementById('catModalIcon');
    const headlineEl = document.getElementById('catModalHeadline');
    const contentEl = document.getElementById('catModalContent');
    const actionLink = document.getElementById('catModalActionLink');

    if (iconEl) iconEl.textContent = data.icon;
    if (headlineEl) headlineEl.textContent = data.title;

    if (contentEl) {
      contentEl.innerHTML = data.solutions.map(sol => `
        <div class="cat-detail-solution-item">
          <div class="cat-detail-solution-title">${sol.title}</div>
          <div class="cat-detail-solution-desc">${sol.desc}</div>
          <a href="${sol.link}" class="cat-detail-solution-link">${sol.linkText} &rarr;</a>
        </div>
      `).join('');
    }

    if (actionLink) {
      actionLink.href = data.actionUrl;
      actionLink.textContent = data.actionText;
    }

    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCategoryModal() {
    const modal = document.getElementById('categoryDetailModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /**
   * 6. Setup Support Channels
   */
  function setupSupportChannels() {
    const openChatBtn = document.getElementById('openChatBtn');
    if (openChatBtn) {
      openChatBtn.addEventListener('click', openChatWidget);
    }

    const openCallbackBtn = document.getElementById('openCallbackModalBtn');
    if (openCallbackBtn) {
      openCallbackBtn.addEventListener('click', openCallbackModal);
    }

    const openTicketBtn = document.getElementById('openTicketModalBtn');
    if (openTicketBtn) {
      openTicketBtn.addEventListener('click', function () {
        openTicketModalWithOrder();
      });
    }
  }

  /**
   * 7. Interactive Chat Assistant
   */
  function setupChatAssistant() {
    const widget = document.getElementById('helpChatWidget');
    const closeBtn = document.getElementById('chatCloseBtn');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeChatWidget);
    }

    // Quick Query Chips
    const chips = document.querySelectorAll('.chat-chip-btn');
    chips.forEach(chip => {
      chip.addEventListener('click', function () {
        const query = chip.getAttribute('data-query');
        if (query) {
          sendUserMessage(query);
          processChatQuery(query);
        }
      });
    });

    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';
        sendUserMessage(text);
        processChatQuery(text);
      });
    }
  }

  function openChatWidget() {
    const widget = document.getElementById('helpChatWidget');
    if (!widget) return;

    widget.style.display = 'flex';

    // If chat container is empty, send initial greetings
    const container = document.getElementById('chatMessagesContainer');
    if (container && container.children.length === 0) {
      sendBotMessage("Hello! 👋 I'm your 24x7 ElectroMart Assistant. How can I help you today with your orders, returns, or account?");
      if (activeOrder) {
        const orderId = activeOrder.id || activeOrder.orderId;
        setTimeout(() => {
          sendBotMessage(`I noticed your recent order #${orderId}. Would you like to track its delivery or check its invoice?`);
        }, 500);
      }
    }

    const input = document.getElementById('chatInput');
    if (input) setTimeout(() => input.focus(), 150);
  }

  function closeChatWidget() {
    const widget = document.getElementById('helpChatWidget');
    if (widget) widget.style.display = 'none';
  }

  function sendUserMessage(text) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user-bubble';
    bubble.textContent = text;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const meta = document.createElement('div');
    meta.className = 'chat-meta';
    meta.textContent = time;
    bubble.appendChild(meta);

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;

    saveChatMessage('user', text);
  }

  function sendBotMessage(text, isAgent = false) {
    const container = document.getElementById('chatMessagesContainer');
    const indicator = document.getElementById('chatTypingIndicator');
    if (!container) return;

    if (indicator) indicator.style.display = 'block';

    setTimeout(() => {
      if (indicator) indicator.style.display = 'none';

      const bubble = document.createElement('div');
      bubble.className = isAgent ? 'chat-bubble agent-bubble' : 'chat-bubble bot-bubble';
      bubble.innerHTML = text;

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const meta = document.createElement('div');
      meta.className = 'chat-meta';
      meta.textContent = isAgent ? `Agent Priya • ${time}` : `ElectroMart Assistant • ${time}`;
      bubble.appendChild(meta);

      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;

      saveChatMessage(isAgent ? 'agent' : 'bot', text);
    }, 600);
  }

  function saveChatMessage(sender, text) {
    const history = safeJsonParse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY), []);
    history.push({ sender, text, timestamp: new Date().toISOString() });
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history.slice(-30)));
    } catch (e) { }
  }

  function processChatQuery(query) {
    const q = query.toLowerCase();

    if (isAgentConnected) {
      setTimeout(() => {
        sendBotMessage("Thank you for the details. I am reviewing your account records on ElectroMart right now to resolve this for you.", true);
      }, 700);
      return;
    }

    if (q.includes('agent') || q.includes('human') || q.includes('speak') || q.includes('specialist')) {
      sendBotMessage("Initiating handoff to our live customer support team... Please stay on the line.");
      setTimeout(() => {
        isAgentConnected = true;
        sendBotMessage("<strong>Connected!</strong> Hello, I'm Agent Priya from ElectroMart Customer Support. I have your order details in front of me. How may I assist you today?", true);
      }, 1500);
      return;
    }

    if (q.includes('order') || q.includes('track') || q.includes('where')) {
      if (activeOrder) {
        const orderId = activeOrder.id || activeOrder.orderId;
        const status = activeOrder.status || 'delivered';
        sendBotMessage(`Your latest order <strong>#${orderId}</strong> is currently: <em>${status}</em>.<br><br><a href="tracking.html?orderId=${encodeURIComponent(orderId)}" style="color:#007185; font-weight:700; text-decoration:underline;">Click here to view live tracking details &rarr;</a>`);
      } else {
        sendBotMessage("I don't see any recent orders in your profile. You can visit <a href='orders.html' style='color:#007185; font-weight:700;'>Your Orders</a> to view all your order archives.");
      }
      return;
    }

    if (q.includes('return') || q.includes('replace') || q.includes('damage') || q.includes('exchange')) {
      sendBotMessage("ElectroMart offers a 7-day hassle-free return or free replacement policy! You can select a delivered order and choose doorstep pickup.<br><br><a href='returns.html' style='color:#007185; font-weight:700; text-decoration:underline;'>Go to Returns & Replacements Center &rarr;</a>");
      return;
    }

    if (q.includes('refund') || q.includes('money') || q.includes('wallet')) {
      sendBotMessage("Refunds to your <strong>ElectroMart Pay</strong> wallet are credited within 2 hours of doorstep pickup! Original bank or UPI refunds take 3-5 business days.");
      return;
    }

    if (q.includes('cancel')) {
      sendBotMessage("You can cancel any eligible order before it leaves our fulfillment facility directly from <a href='orders.html' style='color:#007185; font-weight:700;'>Your Orders</a> with a 100% immediate refund.");
      return;
    }

    if (q.includes('prime')) {
      sendBotMessage("ElectroMart Prime members enjoy free 1-day delivery, 5% cashback rewards, and early deal access. Learn more at the <a href='prime.html' style='color:#007185; font-weight:700;'>Prime Hub</a>.");
      return;
    }

    // Default Fallback
    sendBotMessage("Thank you for your question. You can also search our Help Library above, request an instant 2-minute callback, or ask me to <em>'Connect to Agent'</em> anytime!");
  }

  /**
   * 8. 2-Minute Instant Callback Scheduler (With Memory Leak Prevention)
   */
  function setupCallbackScheduler() {
    const form = document.getElementById('callbackForm');
    const closeBtn = document.getElementById('closeCallbackModalBtn');
    const cancelFormBtn = document.getElementById('cancelCallbackFormBtn');
    const cancelTimerBtn = document.getElementById('cancelCallbackTimerBtn');
    const phoneInput = document.getElementById('callbackPhoneInput');
    const phoneError = document.getElementById('callbackPhoneError');

    if (closeBtn) closeBtn.addEventListener('click', closeCallbackModal);
    if (cancelFormBtn) cancelFormBtn.addEventListener('click', closeCallbackModal);
    if (cancelTimerBtn) cancelTimerBtn.addEventListener('click', cancelCallback);

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const phone = phoneInput ? phoneInput.value.trim() : '';

        // Validate 10-digit Indian Mobile Number
        const isValid = /^[6-9]\d{9}$/.test(phone);
        if (!isValid) {
          if (phoneError) phoneError.style.display = 'block';
          if (phoneInput) phoneInput.focus();
          return;
        }

        if (phoneError) phoneError.style.display = 'none';
        startCallbackCountdown(phone);
      });
    }
  }

  function openCallbackModal() {
    const modal = document.getElementById('callbackModal');
    const form = document.getElementById('callbackForm');
    const timerBox = document.getElementById('callbackTimerContainer');
    const phoneInput = document.getElementById('callbackPhoneInput');
    const phoneError = document.getElementById('callbackPhoneError');

    if (form) form.style.display = 'block';
    if (timerBox) timerBox.style.display = 'none';
    if (phoneError) phoneError.style.display = 'none';

    // Pre-fill phone if available in auth
    const authUser = safeJsonParse(localStorage.getItem(STORAGE_KEYS.AUTH_USER), null);
    if (authUser && authUser.phone && phoneInput) {
      phoneInput.value = authUser.phone.replace('+91', '').trim();
    }

    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    if (phoneInput) setTimeout(() => phoneInput.focus(), 100);
  }

  function closeCallbackModal() {
    cancelCallback();
    const modal = document.getElementById('callbackModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function startCallbackCountdown(phone) {
    const form = document.getElementById('callbackForm');
    const timerBox = document.getElementById('callbackTimerContainer');
    const countdownEl = document.getElementById('callbackCountdownTimer');
    const headlineEl = document.getElementById('callbackStatusHeadline');
    const refEl = document.getElementById('callbackRefId');

    if (form) form.style.display = 'none';
    if (timerBox) timerBox.style.display = 'block';

    const refId = 'EM-CALL-' + Math.floor(10000 + Math.random() * 90000);
    if (refEl) refEl.textContent = `Reference ID: ${refId} • Contact: +91 ${phone}`;
    if (headlineEl) headlineEl.textContent = "Connecting to ElectroMart Support Specialist...";

    // Reset and start 120-sec countdown
    clearInterval(callbackIntervalId);
    callbackSecondsRemaining = 120;
    updateTimerDisplay(countdownEl, callbackSecondsRemaining);

    callbackIntervalId = setInterval(() => {
      callbackSecondsRemaining--;
      updateTimerDisplay(countdownEl, callbackSecondsRemaining);

      if (callbackSecondsRemaining <= 0) {
        clearInterval(callbackIntervalId);
        callbackIntervalId = null;
        if (headlineEl) headlineEl.textContent = "Incoming Call Connected! Please answer your phone.";
        if (countdownEl) countdownEl.textContent = "00:00";
        showToast("📞 Incoming call connected from ElectroMart Support Specialist.", "success");
      }
    }, 1000);
  }

  function updateTimerDisplay(element, seconds) {
    if (!element) return;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    element.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function cancelCallback() {
    if (callbackIntervalId) {
      clearInterval(callbackIntervalId);
      callbackIntervalId = null;
    }
  }

  /**
   * 9. Submit Inquiry Ticket Engine
   */
  function setupInquiryTickets() {
    const form = document.getElementById('ticketForm');
    const closeBtn = document.getElementById('closeTicketModalBtn');
    const cancelBtn = document.getElementById('cancelTicketBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeTicketModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeTicketModal);

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('ticketNameInput')?.value.trim() || 'ElectroMart Customer';
        const email = document.getElementById('ticketEmailInput')?.value.trim() || '';
        const orderId = document.getElementById('ticketOrderSelect')?.value || 'N/A';
        const category = document.getElementById('ticketCategorySelect')?.value || 'General';
        const subject = document.getElementById('ticketSubjectInput')?.value.trim() || 'Support Query';
        const message = document.getElementById('ticketMessageInput')?.value.trim() || '';

        const ticketId = 'EM-TKT-' + Math.floor(10000 + Math.random() * 90000);

        const newTicket = {
          ticketId,
          name,
          email,
          orderId,
          category,
          subject,
          message,
          status: 'Open',
          createdAt: new Date().toISOString()
        };

        // Save into local storage
        const tickets = safeJsonParse(localStorage.getItem(STORAGE_KEYS.TICKETS), []);
        tickets.unshift(newTicket);
        try {
          localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
        } catch (err) { }

        closeTicketModal();
        showToast(`Ticket #${ticketId} created successfully! Our team will respond within 4 hours.`, "success");
        form.reset();
      });
    }
  }

  function openTicketModalWithOrder(preferredOrderId = null) {
    const modal = document.getElementById('ticketModal');
    const select = document.getElementById('ticketOrderSelect');

    // Populate orders dropdown
    if (select) {
      select.innerHTML = '<option value="">-- Select an Order or N/A --</option>';
      allOrders.forEach(ord => {
        const id = ord.id || ord.orderId;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = `Order #${id} (${ord.status || 'Delivered'})`;
        if (preferredOrderId && preferredOrderId === id) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    }

    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeTicketModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /**
   * 10. Modal Dismissal (Escape Key & Backdrop Click)
   */
  function setupModalDismissal() {
    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeCategoryModal();
        closeCallbackModal();
        closeTicketModal();
        closeChatWidget();
      }
    });

    // Backdrop clicks
    const modals = [
      { id: 'categoryDetailModal', close: closeCategoryModal },
      { id: 'callbackModal', close: closeCallbackModal },
      { id: 'ticketModal', close: closeTicketModal }
    ];

    modals.forEach(({ id, close }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', function (e) {
          if (e.target === el) {
            close();
          }
        });
      }
    });

    // Cleanup on beforeunload to prevent memory leaks
    window.addEventListener('beforeunload', function () {
      cancelCallback();
    });
  }

  /**
   * 11. Toast Notifications
   */
  function showToast(message, type = 'info') {
    const container = document.getElementById('helpToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `help-toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Self Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global helper for testing
  window.ElectroMartHelpEngine = {
    getAllFaqs: () => HELP_FAQS,
    getCategoryDetails: (key) => CATEGORY_DETAILS[key],
    filterFaqs: filterFaqs,
    cancelCallback: cancelCallback
  };

})();
