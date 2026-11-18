/**
 * ElectroMart Digital Gift Cards Hub Controller (Phase 46)
 * =======================================================
 * Digital Gift Cards Storefront & Redemption Engine:
 *  - Interactive Card Design Studio with real-time preview
 *  - Custom Denominations & Delivery Scheduling (Email/WhatsApp/Link)
 *  - Server-issued random claim codes (EM-GC-XXXXXX-XXXXXX-XXXXXX-XXXXXX)
 *  - Authenticated server-side redemption and wallet synchronization
 *  - 100% Brand Safety: Pure ElectroMart
 */

(function (globalWindow, globalDocument) {
  'use strict';

  var root = globalWindow || {};
  var doc = globalDocument || null;
  var electroMart = root.ElectroMart = root.ElectroMart || {};
  var namespace = electroMart.GiftCards = electroMart.GiftCards || root.ElectroMartGiftCards || {};
  root.ElectroMartGiftCards = namespace;

  /* ---------------------------------------------------------------------
   * Storage Keys
   * ------------------------------------------------------------------- */
  var WALLET_BALANCE_KEY = 'electromart_pay_balance_v1';
  var CART_KEY = 'electromart_cart_v1';
  var CATALOG_KEY = 'electromart_catalog_v1';
  var AUTH_KEY = 'electromart_auth_v1';
  var resolvedApiBaseUrl = '';

  /* ---------------------------------------------------------------------
   * Safe LocalStorage Helpers
   * ------------------------------------------------------------------- */
  function getStorage() {
    try {
      if (root && root.localStorage) return root.localStorage;
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (e) {}
    return null;
  }

  function getStoredItems(key) {
    try {
      var s = getStorage();
      if (s) {
        var raw = s.getItem(key);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return [];
  }

  function saveStoredItems(key, items) {
    try {
      var s = getStorage();
      if (s) {
        s.setItem(key, JSON.stringify(items));
      }
    } catch (e) {}
  }

  function getAuthSession() {
    var session = getStoredItems(AUTH_KEY);
    return session && typeof session === 'object' && session.token ? session : null;
  }

  function resolveApiBaseUrl() {
    if (resolvedApiBaseUrl) return Promise.resolve(resolvedApiBaseUrl);
    var configuredBase = String(root.__ELECTROMART_CONFIG__ && root.__ELECTROMART_CONFIG__.apiBaseUrl || '').trim();
    var candidates = [(configuredBase || '/api').replace(/\/+$/, '')];

    return candidates.reduce(function (pending, candidate) {
      return pending.then(function (found) {
        if (found) return found;
        return root.fetch(candidate + '/health').then(function (response) {
          if (response.ok) {
            resolvedApiBaseUrl = candidate;
            return candidate;
          }
          return '';
        }).catch(function () { return ''; });
      });
    }, Promise.resolve('')).then(function (found) {
      if (!found) throw new Error('Gift card services are unavailable. Start the backend or configure its API URL.');
      return found;
    });
  }

  function requestGiftCardApi(path, options) {
    var session = getAuthSession();
    if (!session) {
      return Promise.reject(new Error('Please sign in to use gift card services.'));
    }
    return resolveApiBaseUrl().then(function (baseUrl) {
      return root.fetch(baseUrl + path, Object.assign({
        headers: {
          Authorization: 'Bearer ' + session.token,
          'Content-Type': 'application/json'
        }
      }, options || {}));
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (payload) {
        if (!response.ok) {
          throw new Error(payload.message || 'Gift card request failed.');
        }
        return payload;
      });
    });
  }

  namespace.getMyGiftCards = function () {
    return requestGiftCardApi('/gift-cards/my');
  };
  namespace.getWalletBalance = function () {
    return requestGiftCardApi('/gift-cards/balance');
  };
  namespace.redeemGiftCard = function (claimCode) {
    return requestGiftCardApi('/gift-cards/redeem', {
      method: 'POST',
      body: JSON.stringify({ claimCode: claimCode })
    });
  };

  /* ---------------------------------------------------------------------
   * DOM Controller & Event Binding
   * ------------------------------------------------------------------- */
  function initDOM() {
    if (!doc) return;

    var previewDesign = doc.getElementById('gcCardPreviewDesign');
    var previewAmount = doc.getElementById('gcCardPreviewAmount');
    var previewRecipient = doc.getElementById('gcCardPreviewRecipient');
    var previewMessage = doc.getElementById('gcCardPreviewMessage');
    var cardPreview = doc.getElementById('gcCardPreview');

    var customAmountInput = doc.getElementById('gcCustomAmountInput');
    var recipientNameInput = doc.getElementById('gcRecipientNameInput');
    var recipientEmailInput = doc.getElementById('gcRecipientEmailInput');
    var senderNameInput = doc.getElementById('gcSenderNameInput');
    var giftMessageInput = doc.getElementById('gcGiftMessageInput');
    var deliveryDateInput = doc.getElementById('gcDeliveryDateInput');
    var hiddenAmountInput = doc.getElementById('gcSelectedAmountInput');
    var hiddenTemplateInput = doc.getElementById('gcSelectedTemplateInput');

    var addToCartBtn = doc.getElementById('gcAddToCartBtn');
    var buyNowBtn = doc.getElementById('gcBuyNowBtn');
    var redeemForm = doc.getElementById('gcRedeemForm');
    var claimCodeInput = doc.getElementById('gcClaimCodeInput');
    var redeemBtn = doc.getElementById('gcRedeemBtn');
    var walletBalDisplay = doc.getElementById('gcWalletBalanceDisplay');
    var recentTable = doc.getElementById('gcRecentGCTable');

    // 1. Update Wallet Balance Display
    function refreshWalletDisplay() {
      if (!walletBalDisplay) return;
      walletBalDisplay.textContent = getAuthSession() ? 'Loading…' : 'Sign in to view';
      namespace.getWalletBalance().then(function (result) {
        var balance = Number(result.balance || 0);
        walletBalDisplay.textContent = '₹' + balance.toLocaleString('en-IN');
        var storage = getStorage();
        if (storage) storage.setItem(WALLET_BALANCE_KEY, String(balance));
      }).catch(function (error) {
        walletBalDisplay.textContent = getAuthSession() ? 'Unavailable' : 'Sign in to view';
        if (root.console && typeof root.console.error === 'function') {
          root.console.error('Gift card wallet balance unavailable:', error.message);
        }
      });
    }
    refreshWalletDisplay();

    // 2. Amount Pills Listener
    var pillsContainer = doc.getElementById('gcAmountPillsContainer');
    if (pillsContainer) {
      pillsContainer.addEventListener('click', function (e) {
        var pill = e.target.closest('.gc-amount-pill');
        if (!pill) return;
        var pills = pillsContainer.querySelectorAll('.gc-amount-pill');
        for (var i = 0; i < pills.length; i++) {
          pills[i].classList.remove('active');
        }
        pill.classList.add('active');
        var amt = pill.getAttribute('data-amount');
        if (previewAmount) previewAmount.textContent = '₹' + Number(amt).toLocaleString('en-IN');
        if (hiddenAmountInput) hiddenAmountInput.value = amt;
        if (customAmountInput) customAmountInput.value = '';
      });
    }

    // 3. Custom Amount Input Listener
    if (customAmountInput) {
      customAmountInput.addEventListener('input', function () {
        var val = parseFloat(customAmountInput.value);
        if (!isNaN(val) && val >= 100 && val <= 10000) {
          if (previewAmount) previewAmount.textContent = '₹' + val.toLocaleString('en-IN');
          if (hiddenAmountInput) hiddenAmountInput.value = String(val);
          if (pillsContainer) {
            var pills = pillsContainer.querySelectorAll('.gc-amount-pill');
            for (var i = 0; i < pills.length; i++) {
              pills[i].classList.remove('active');
            }
          }
        }
      });
    }

    // 4. Interactive Template Selector
    var templateGrid = doc.getElementById('gcTemplateGrid');
    if (templateGrid) {
      templateGrid.addEventListener('click', function (e) {
        var card = e.target.closest('.gc-template-card');
        if (!card) return;
        var cards = templateGrid.querySelectorAll('.gc-template-card');
        for (var i = 0; i < cards.length; i++) {
          cards[i].classList.remove('active');
        }
        card.classList.add('active');
        var templateId = card.getAttribute('data-template-id');
        var templateName = card.getAttribute('data-template-name');

        if (hiddenTemplateInput) hiddenTemplateInput.value = templateId;
        if (previewDesign) previewDesign.textContent = templateName;

        if (cardPreview) {
          cardPreview.className = 'gc-card-preview template-' + templateId;
        }
      });
    }

    // 5. Live Inputs Sync to Preview
    if (recipientNameInput && previewRecipient) {
      recipientNameInput.addEventListener('input', function () {
        previewRecipient.textContent = recipientNameInput.value.trim() || 'For: Loved One';
      });
    }

    if (giftMessageInput && previewMessage) {
      giftMessageInput.addEventListener('input', function () {
        previewMessage.textContent = giftMessageInput.value.trim() || 'Wishing you endless joy & prosperity from ElectroMart!';
      });
    }

    // Set Default Delivery Date to Today
    if (deliveryDateInput && !deliveryDateInput.value) {
      deliveryDateInput.value = new Date().toISOString().split('T')[0];
    }

    // 6. Add Gift Card to Cart Action
    function handleAddToCart(shouldRedirect) {
      var amt = Number(hiddenAmountInput ? hiddenAmountInput.value : 1000);
      if (!Number.isInteger(amt) || amt < 100 || amt > 10000) {
        alert('Choose a gift card amount between ₹100 and ₹10,000.');
        return;
      }
      var template = hiddenTemplateInput ? hiddenTemplateInput.value : 'festival';
      var recName = recipientNameInput ? recipientNameInput.value.trim() : 'Friend';
      var recEmail = recipientEmailInput ? recipientEmailInput.value.trim() : 'friend@example.com';
      var sndName = senderNameInput ? senderNameInput.value.trim() : 'Valued Customer';
      var msg = giftMessageInput ? giftMessageInput.value.trim() : 'Best Wishes';
      var delDate = deliveryDateInput ? deliveryDateInput.value : '';

      var itemId = 'giftcard-' + (root.crypto && root.crypto.randomUUID
        ? root.crypto.randomUUID()
        : String(Date.now()) + '-' + String(Math.floor(Math.random() * 1000000)));
      var productId = 'EM-GC-' + amt;
      var cartItem = {
        id: itemId,
        productId: productId,
        title: 'ElectroMart E-Gift Card (₹' + amt + ') - ' + recName,
        name: 'ElectroMart E-Gift Card (₹' + amt + ') - ' + recName,
        price: amt,
        current_price: amt,
        mrp: amt,
        original_price: amt,
        quantity: 1,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300',
        imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300',
        isGiftCard: true,
        giftCard: {
          amount: amt,
          templateId: template,
          recipientName: recName,
          recipientEmail: recEmail,
          senderName: sndName,
          giftMessage: msg,
          deliveryDate: delDate
        },
        gstRate: 0.18
      };

      var cart = getStoredItems(CART_KEY);
      if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
      cart[itemId] = 1;
      saveStoredItems(CART_KEY, cart);
      var catalog = getStoredItems(CATALOG_KEY);
      if (!catalog || typeof catalog !== 'object' || Array.isArray(catalog)) catalog = {};
      catalog[itemId] = cartItem;
      saveStoredItems(CATALOG_KEY, catalog);

      // Header cart count sync
      if (typeof root.syncHeaderCartCount === 'function') {
        root.syncHeaderCartCount();
      }

      renderRecentTable();

      if (shouldRedirect) {
        root.location.href = 'checkout.html';
      } else {
        alert('Gift card added to your cart. The claim code will be issued after payment is confirmed.');
      }
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleAddToCart(false);
      });
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', function (e) {
        e.preventDefault();
        handleAddToCart(true);
      });
    }

    // 7. Redeem Gift Card Action
    if (redeemForm) {
      redeemForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!claimCodeInput) return;
        var code = claimCodeInput.value.trim();
        if (redeemBtn) redeemBtn.disabled = true;
        namespace.redeemGiftCard(code).then(function (result) {
          var storage = getStorage();
          if (storage) storage.setItem(WALLET_BALANCE_KEY, String(result.balance));
          if (root.dispatchEvent && typeof root.CustomEvent === 'function') {
            root.dispatchEvent(new root.CustomEvent('electromart_pay_balance_updated', {
              detail: { balance: result.balance }
            }));
          }
          alert('Success! ₹' + Number(result.amount).toLocaleString('en-IN') + ' has been added to your ElectroMart Pay balance.\nNew balance: ₹' + Number(result.balance).toLocaleString('en-IN'));
          claimCodeInput.value = '';
          refreshWalletDisplay();
          renderRecentTable();
        }).catch(function (error) {
          alert('Gift card redemption failed: ' + error.message);
        }).finally(function () {
          if (redeemBtn) redeemBtn.disabled = false;
        });
      });
    }

    // 8. Render Recent Gift Cards & Redemptions Table
    function renderRecentTable() {
      if (!recentTable) return;
      var tbody = recentTable.querySelector('tbody');
      if (!tbody) return;
      while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
      namespace.getMyGiftCards().then(function (result) {
        var cards = Array.isArray(result.giftCards) ? result.giftCards.slice(0, 10) : [];
        if (cards.length === 0) {
          var emptyRow = doc.createElement('tr');
          var emptyCell = doc.createElement('td');
          emptyCell.colSpan = 5;
          emptyCell.textContent = getAuthSession() ? 'No gift cards purchased yet.' : 'Sign in to view your gift cards.';
          emptyRow.appendChild(emptyCell);
          tbody.appendChild(emptyRow);
          return;
        }
        cards.forEach(function (card) {
          var tr = doc.createElement('tr');
          [
            card.orderId || 'Gift card',
            card.claimCode || '',
            card.recipientName || 'Recipient',
            '₹' + Number(card.amount || 0).toLocaleString('en-IN'),
            card.status === 'redeemed' ? 'Redeemed' : 'Issued'
          ].forEach(function (value) {
            var cell = doc.createElement('td');
            cell.textContent = value;
            tr.appendChild(cell);
          });
          tbody.appendChild(tr);
        });
      }).catch(function (error) {
        var errorRow = doc.createElement('tr');
        var errorCell = doc.createElement('td');
        errorCell.colSpan = 5;
        errorCell.textContent = error.message;
        errorRow.appendChild(errorCell);
        tbody.appendChild(errorRow);
      });
    }
    renderRecentTable();
  }

  // Auto-initialize when DOM is ready
  if (doc) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', initDOM);
    } else {
      initDOM();
    }
  }

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : null);
