(function attachListingFilterChips(global) {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function resolveElement(target) {
    if (!target) {
      return null;
    }
    if (typeof target === "string") {
      return document.querySelector(target);
    }
    return target;
  }

  function ensureToolsHost(mountAfter) {
    const anchor = resolveElement(mountAfter);
    if (!anchor || !anchor.parentNode) {
      return null;
    }
    let host = anchor.parentNode.querySelector(".listing-filter-tools");
    if (host) {
      return host;
    }
    host = document.createElement("div");
    host.className = "listing-filter-tools";

    const chips = document.createElement("div");
    chips.className = "listing-filter-chips";
    chips.hidden = true;
    chips.setAttribute("aria-label", "Active filters");

    const feedback = document.createElement("p");
    feedback.className = "listing-filter-feedback";
    feedback.hidden = true;

    const live = document.createElement("p");
    live.className = "listing-filter-live sr-only";
    live.hidden = true;
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");

    host.appendChild(chips);
    host.appendChild(feedback);
    host.appendChild(live);
    anchor.insertAdjacentElement("afterend", host);
    return host;
  }

  function init(options) {
    const host = ensureToolsHost(options.mountAfter);
    if (!host) {
      return null;
    }
    const chipsHost = host.querySelector(".listing-filter-chips");
    const feedbackNode = host.querySelector(".listing-filter-feedback");
    const liveNode = host.querySelector(".listing-filter-live");

    let hasRendered = false;
    let lastAnnouncement = "";
    let feedbackTimer = 0;

    function showFeedback(text) {
      if (!feedbackNode) {
        return;
      }
      window.clearTimeout(feedbackTimer);
      if (!text) {
        feedbackNode.hidden = true;
        feedbackNode.textContent = "";
        return;
      }
      feedbackNode.hidden = false;
      feedbackNode.textContent = text;
      feedbackTimer = window.setTimeout(() => {
        feedbackNode.hidden = true;
        feedbackNode.textContent = "";
      }, 2600);
    }

    function announce(text) {
      if (!liveNode) {
        return;
      }
      if (!text) {
        liveNode.hidden = true;
        liveNode.textContent = "";
        return;
      }
      liveNode.hidden = false;
      liveNode.textContent = "";
      window.requestAnimationFrame(() => {
        liveNode.textContent = text;
      });
    }

    function getFilters() {
      const items = typeof options.getFilters === "function" ? options.getFilters() : [];
      return Array.isArray(items) ? items.filter(Boolean) : [];
    }

    function focusTarget(target) {
      const focusable = target && typeof target.focus === "function"
        ? target
        : target && target.focus && typeof target.focus.focus === "function"
          ? target.focus
          : null;
      if (!focusable) {
        return;
      }
      window.requestAnimationFrame(() => {
        focusable.focus();
      });
    }

    function applyChange(config) {
      if (config && typeof config.clear === "function") {
        config.clear();
      }
      if (config && config.feedback) {
        showFeedback(config.feedback);
      }
      focusTarget(config);
      if (typeof options.onChange === "function") {
        options.onChange();
      }
    }

    function animateAndApply(chip, config) {
      if (!chip) {
        applyChange(config);
        return;
      }
      chip.classList.add("is-removing");
      window.setTimeout(() => {
        applyChange(config);
      }, 140);
    }

    function render() {
      const filters = getFilters();
      if (!chipsHost) {
        return;
      }

      if (!filters.length) {
        chipsHost.hidden = true;
        chipsHost.innerHTML = "";
      } else {
        const chipMarkup = filters
          .map((filter) => `
            <button
              type="button"
              class="listing-filter-chip"
              data-filter-chip-id="${escapeHtml(filter.id)}"
              aria-label="${escapeHtml(filter.ariaLabel || `Remove ${filter.label}`)}"
            >
              <span class="listing-filter-chip-label">${escapeHtml(filter.label)}</span>
              <span class="listing-filter-chip-close" aria-hidden="true">&times;</span>
            </button>
          `)
          .join("");

        const clearAllMarkup = `
          <button
            type="button"
            class="listing-filter-chip listing-filter-chip--clear-all"
            data-filter-chip-id="__clear_all__"
            aria-label="Clear all active filters"
          >
            <span class="listing-filter-chip-label">Clear all filters</span>
          </button>
        `;

        chipsHost.hidden = false;
        chipsHost.innerHTML = `${chipMarkup}${clearAllMarkup}`;
      }

      const announcement = filters.length
        ? `Filters updated: ${filters.map((filter) => filter.label).join(", ")}.`
        : "All filters cleared. Broadest listing view restored.";

      if (!hasRendered) {
        hasRendered = true;
        lastAnnouncement = announcement;
        announce("");
        return;
      }

      if (announcement !== lastAnnouncement) {
        const resultSummary = typeof options.getResultSummary === "function"
          ? String(options.getResultSummary() || "").trim()
          : "";
        announce(`${announcement} ${resultSummary}`.trim());
      }
      lastAnnouncement = announcement;
    }

    chipsHost?.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-filter-chip-id]");
      if (!chip) {
        return;
      }

      const chipId = String(chip.getAttribute("data-filter-chip-id") || "").trim();
      if (chipId === "__clear_all__") {
        animateAndApply(chip, {
          clear: options.clearAll,
          focus: options.focusAfterClearAll,
          feedback: options.clearAllFeedback || "Removed all filters.",
        });
        return;
      }

      const filter = getFilters().find((item) => item.id === chipId);
      if (!filter) {
        return;
      }
      animateAndApply(chip, filter);
    });

    return {
      update: render,
      showFeedback
    };
  }

  global.ElectroMartListingFilterChips = {
    init
  };
})(window);
