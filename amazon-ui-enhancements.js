/**
 * Amazon-Style UI Enhancement Utilities
 * Features: Countdown Timer, Progress Bars, Cart Animation, Wishlist, Search Suggestions
 */

(function() {
  'use strict';

  // ===== COUNTDOWN TIMER =====
  class CountdownTimer {
    constructor(elementId, endTime) {
      this.element = document.getElementById(elementId);
      if (!this.element) return;
      
      this.endTime = endTime instanceof Date ? endTime : new Date(endTime);
      this.interval = null;
      this.start();
    }

    start() {
      this.update();
      this.interval = setInterval(() => this.update(), 1000);
    }

    stop() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }

    update() {
      const now = new Date();
      const diff = this.endTime - now;

      if (diff <= 0) {
        this.element.innerHTML = '<span class="countdown-expired">Deal Ended!</span>';
        this.stop();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      this.element.innerHTML = `
        <span class="timer-icon">⏰</span>
        <span class="countdown-segment">
          <span class="countdown-value">${String(hours).padStart(2, '0')}</span>
          <span class="countdown-label">Hrs</span>
        </span>
        <span class="countdown-separator">:</span>
        <span class="countdown-segment">
          <span class="countdown-value">${String(minutes).padStart(2, '0')}</span>
          <span class="countdown-label">Min</span>
        </span>
        <span class="countdown-separator">:</span>
        <span class="countdown-segment">
          <span class="countdown-value">${String(seconds).padStart(2, '0')}</span>
          <span class="countdown-label">Sec</span>
        </span>
      `;
    }
  }

  // ===== PROGRESS BAR =====
  class ClaimProgressBar {
    constructor(containerId, percentage) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;
      
      this.percentage = Math.min(100, Math.max(0, percentage));
      this.render();
    }

    render() {
      this.container.innerHTML = `
        <div class="claim-progress">
          <div class="claim-progress-bar">
            <div class="claim-progress-fill" style="width: ${this.percentage}%"></div>
          </div>
          <div class="claim-progress-text">
            <span><strong>${this.percentage}%</strong> Claimed</span>
            <span>${100 - this.percentage}% remaining</span>
          </div>
        </div>
      `;
    }

    update(newPercentage) {
      this.percentage = Math.min(100, Math.max(0, newPercentage));
      const fill = this.container.querySelector('.claim-progress-fill');
      const text = this.container.querySelector('.claim-progress-text');
      
      if (fill) {
        fill.style.width = `${this.percentage}%`;
      }
      
      if (text) {
        text.innerHTML = `
          <span><strong>${this.percentage}%</strong> Claimed</span>
          <span>${100 - this.percentage}% remaining</span>
        `;
      }
    }
  }

  // ===== WISHLIST MANAGER =====
  class WishlistManager {
    constructor() {
      this.storageKey = 'electromart_wishlist_v1';
      this.wishlist = this.load();
      this.initEventListeners();
    }

    load() {
      try {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
      } catch (e) {
        return {};
      }
    }

    save() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist));
    }

    toggle(productId, productName) {
      if (this.wishlist[productId]) {
        delete this.wishlist[productId];
        this.showNotification('Removed from Wishlist', 'info');
      } else {
        this.wishlist[productId] = {
          id: productId,
          name: productName,
          addedAt: new Date().toISOString()
        };
        this.showNotification('Added to Wishlist', 'success');
      }
      this.save();
      this.updateUI(productId);
    }

    isInWishlist(productId) {
      return !!this.wishlist[productId];
    }

    updateUI(productId) {
      const heartIcons = document.querySelectorAll(`[data-wishlist-id="${productId}"]`);
      const isInList = this.isInWishlist(productId);
      
      heartIcons.forEach(icon => {
        if (isInList) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      });
    }

    showNotification(message, type) {
      // Create toast notification
      const toast = document.createElement('div');
      toast.className = `toast-notification toast-${type}`;
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#007600' : '#565959'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }

    initEventListeners() {
      document.addEventListener('click', (e) => {
        const heartBtn = e.target.closest('.wishlist-heart');
        if (heartBtn) {
          e.preventDefault();
          e.stopPropagation();
          
          const productId = heartBtn.dataset.wishlistId;
          const productName = heartBtn.dataset.productName || 'Product';
          
          this.toggle(productId, productName);
        }
      });
    }
  }

  // ===== CART ANIMATION =====
  class CartAnimator {
    constructor() {
      this.cartCountEl = null;
      this.init();
    }

    init() {
      this.cartCountEl = document.getElementById('cartCount');
      this.observeCartChanges();
    }

    observeCartChanges() {
      // Listen for cart updates
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            this.animate();
          }
        });
      });

      if (this.cartCountEl) {
        observer.observe(this.cartCountEl, { 
          childList: true, 
          characterData: true,
          subtree: true 
        });
      }
    }

    animate() {
      if (!this.cartCountEl) return;
      
      this.cartCountEl.classList.remove('cart-count-animate');
      void this.cartCountEl.offsetWidth; // Trigger reflow
      this.cartCountEl.classList.add('cart-count-animate');
      
      setTimeout(() => {
        this.cartCountEl.classList.remove('cart-count-animate');
      }, 400);
    }
  }

  // ===== SEARCH SUGGESTIONS =====
  class SearchSuggestions {
    constructor(searchInputId, suggestionsId) {
      this.input = document.getElementById(searchInputId);
      this.suggestionsBox = document.getElementById(suggestionsId);
      
      if (!this.input || !this.suggestionsBox) return;
      
      this.debounceTimer = null;
      this.init();
    }

    init() {
      this.input.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.fetchSuggestions(e.target.value);
        }, 300);
      });

      this.input.addEventListener('focus', () => {
        if (this.suggestionsBox.children.length > 0) {
          this.suggestionsBox.classList.add('active');
        }
      });

      document.addEventListener('click', (e) => {
        if (!this.input.contains(e.target) && !this.suggestionsBox.contains(e.target)) {
          this.suggestionsBox.classList.remove('active');
        }
      });
    }

    async fetchSuggestions(query) {
      if (!query || query.length < 2) {
        this.suggestionsBox.innerHTML = '';
        this.suggestionsBox.classList.remove('active');
        return;
      }

      // Mock suggestions - replace with actual API call
      const mockSuggestions = [
        { text: query + ' laptop', icon: '🔍' },
        { text: query + ' desktop', icon: '🖥️' },
        { text: query + ' gaming', icon: '🎮' },
        { text: query + ' under 50000', icon: '💰' }
      ];

      this.renderSuggestions(mockSuggestions, query);
    }

    renderSuggestions(suggestions, query) {
      if (!suggestions.length) {
        this.suggestionsBox.classList.remove('active');
        return;
      }

      this.suggestionsBox.innerHTML = suggestions.map(item => `
        <div class="suggestion-item" data-value="${item.text}">
          <span class="suggestion-icon">${item.icon}</span>
          <span>${item.text.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`)}</span>
        </div>
      `).join('');

      this.suggestionsBox.classList.add('active');

      // Add click handlers
      this.suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          this.input.value = item.dataset.value;
          this.suggestionsBox.classList.remove('active');
          this.input.form?.submit();
        });
      });
    }
  }

  // ===== LOCATION MODAL =====
  class LocationModal {
    constructor(triggerId) {
      this.trigger = document.getElementById(triggerId);
      if (!this.trigger) return;
      
      this.init();
    }

    init() {
      this.trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLocationPopup();
      });
    }

    showLocationPopup() {
      const currentLocation = document.getElementById('deliveryLocationText')?.textContent || 'New Delhi 110001';
      
      const modal = document.createElement('div');
      modal.className = 'location-modal-overlay';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
      `;

      modal.innerHTML = `
        <div class="location-modal" style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; color: #0f1111;">Choose your location</h3>
            <button class="location-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #565959;">&times;</button>
          </div>
          <p style="margin: 0 0 16px; color: #565959; font-size: 14px;">Delivery options and speeds may vary for different locations.</p>
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #0f1111;">Enter pincode</label>
            <input type="text" class="location-pincode-input" placeholder="Enter 6-digit pincode" maxlength="6" pattern="[0-9]{6}" style="
              width: 100%;
              padding: 10px 12px;
              border: 1px solid #d5d9d9;
              border-radius: 8px;
              font-size: 14px;
            " value="${currentLocation.split(' ').pop()}">
          </div>
          <button class="location-save-btn" style="
            width: 100%;
            padding: 10px;
            background: #ffd814;
            border: 1px solid #fcd200;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          ">Save Location</button>
        </div>
      `;

      document.body.appendChild(modal);

      // Close handlers
      const closeBtn = modal.querySelector('.location-close');
      const saveBtn = modal.querySelector('.location-save-btn');
      const input = modal.querySelector('.location-pincode-input');

      closeBtn.addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });

      saveBtn.addEventListener('click', () => {
        const pincode = input.value.trim();
        if (pincode && pincode.length === 6) {
          document.getElementById('deliveryLocationText').textContent = `New Delhi ${pincode}`;
          localStorage.setItem('electromart_delivery_pincode', pincode);
          modal.remove();
        } else {
          input.style.borderColor = '#cc0c39';
          input.focus();
        }
      });

      input.focus();
    }
  }

  // ===== INITIALIZE ALL ENHANCEMENTS =====
  function initAmazonEnhancements() {
    // Initialize Wishlist Manager
    window.wishlistManager = new WishlistManager();

    // Initialize Cart Animator
    window.cartAnimator = new CartAnimator();

    // Initialize Location Modal
    window.locationModal = new LocationModal('locationTrigger');

    // Initialize Search Suggestions
    window.searchSuggestions = new SearchSuggestions('searchInput', 'searchSuggestions');

    // Auto-initialize countdown timers
    document.querySelectorAll('[data-countdown]').forEach(el => {
      const endTime = el.dataset.countdown;
      new CountdownTimer(el.id, endTime);
    });

    // Auto-initialize progress bars
    document.querySelectorAll('[data-claim-progress]').forEach(el => {
      const percentage = parseInt(el.dataset.claimProgress);
      new ClaimProgressBar(el.id, percentage);
    });

    // Update existing wishlist items UI
    Object.keys(window.wishlistManager.wishlist).forEach(productId => {
      window.wishlistManager.updateUI(productId);
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmazonEnhancements);
  } else {
    initAmazonEnhancements();
  }

  // Export for external use
  window.AmazonUI = {
    CountdownTimer,
    ClaimProgressBar,
    WishlistManager,
    CartAnimator,
    SearchSuggestions,
    LocationModal
  };

})();
