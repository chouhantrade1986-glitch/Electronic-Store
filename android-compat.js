(function () {
  "use strict";

  var win = window;
  var doc = document;
  var root = doc.documentElement;
  var nav = win.navigator || {};
  var ua = String(nav.userAgent || "");
  var platform = String(nav.platform || "");
  var maxTouchPoints = Number(nav.maxTouchPoints || 0);
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
  var isChromeOS = /CrOS/i.test(ua);
  var isWindows = /Windows NT/i.test(ua);
  var isMacOS = !isIOS && /(Macintosh|Mac OS X)/i.test(ua);
  var isLinux = !isAndroid && !isChromeOS && /Linux/i.test(ua);
  var isMobileOS = isAndroid || isIOS;
  var supportsModernSyntax = true;

  function appendClass(target, className) {
    if (!target || !className) {
      return;
    }
    if (target.classList && typeof target.classList.add === "function") {
      target.classList.add(className);
      return;
    }
    var current = String(target.className || "");
    if ((" " + current + " ").indexOf(" " + className + " ") !== -1) {
      return;
    }
    target.className = (current ? current + " " : "") + className;
  }

  function addWindowListener(eventName, handler, usePassive) {
    if (!win || typeof win.addEventListener !== "function") {
      return;
    }

    if (!usePassive) {
      win.addEventListener(eventName, handler, false);
      return;
    }

    try {
      win.addEventListener(eventName, handler, { passive: true });
    } catch (error) {
      win.addEventListener(eventName, handler, false);
    }
  }

  function ensureViewportMeta() {
    var head = doc.head || doc.getElementsByTagName("head")[0];
    if (!head) {
      return;
    }

    var viewportMeta = doc.querySelector("meta[name='viewport']");
    if (!viewportMeta) {
      viewportMeta = doc.createElement("meta");
      viewportMeta.setAttribute("name", "viewport");
      head.appendChild(viewportMeta);
    }

    var content = String(viewportMeta.getAttribute("content") || "");
    if (!/width\s*=\s*device-width/i.test(content)) {
      content += (content ? ", " : "") + "width=device-width";
    }
    if (!/initial-scale\s*=\s*1(?:\.0+)?/i.test(content)) {
      content += (content ? ", " : "") + "initial-scale=1.0";
    }
    if (!/viewport-fit\s*=\s*cover/i.test(content)) {
      content += (content ? ", " : "") + "viewport-fit=cover";
    }

    viewportMeta.setAttribute("content", content);
  }

  function setViewportHeightVariable() {
    if (!root || !root.style) {
      return;
    }

    var viewportHeight = 0;
    if (win.visualViewport && typeof win.visualViewport.height === "number") {
      viewportHeight = win.visualViewport.height;
    }
    if (!viewportHeight) {
      viewportHeight = win.innerHeight || 0;
    }

    root.style.setProperty("--os-vh", Math.max(viewportHeight, 0) * 0.01 + "px");

    if (isAndroid) {
      root.style.setProperty("--android-vh", Math.max(viewportHeight, 0) * 0.01 + "px");
    }
  }

  try {
    // Detects parser support for syntax used by app scripts.
    new Function("var obj={v:1}; return (obj?.v ?? 0) === 1;");
  } catch (error) {
    supportsModernSyntax = false;
  }

  appendClass(root, "os-ready");
  if (isMobileOS) {
    appendClass(root, "os-mobile");
  }
  if (maxTouchPoints > 0) {
    appendClass(root, "os-touch");
  }
  if (isWindows) {
    appendClass(root, "os-windows");
  }
  if (isMacOS) {
    appendClass(root, "os-macos");
  }
  if (isLinux) {
    appendClass(root, "os-linux");
  }
  if (isChromeOS) {
    appendClass(root, "os-chromeos");
  }
  if (isIOS) {
    appendClass(root, "os-ios");
  }
  if (isAndroid) {
    appendClass(root, "os-android");
    appendClass(root, "android-os");
  }

  ensureViewportMeta();
  setViewportHeightVariable();
  addWindowListener("resize", setViewportHeightVariable, true);
  addWindowListener("orientationchange", setViewportHeightVariable, false);
  if (win.visualViewport && typeof win.visualViewport.addEventListener === "function") {
    try {
      win.visualViewport.addEventListener("resize", setViewportHeightVariable);
    } catch (error) {
      // Ignore browsers where visualViewport listeners are restricted.
    }
  }

  if (!supportsModernSyntax) {
    appendClass(root, "legacy-js-engine");
    if (isAndroid) {
      appendClass(root, "android-legacy-js");
    }
    win.__ELECTROMART_LEGACY_MODE__ = true;
  }

  if (!Object.assign) {
    Object.assign = function (target) {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var output = Object(target);
      for (var index = 1; index < arguments.length; index += 1) {
        var source = arguments[index];
        if (source == null) {
          continue;
        }
        for (var nextKey in source) {
          if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
            output[nextKey] = source[nextKey];
          }
        }
      }
      return output;
    };
  }

  if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
      if (search instanceof RegExp) {
        throw new TypeError("First argument must not be a RegExp");
      }
      return this.indexOf(search, start || 0) !== -1;
    };
  }

  if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement, fromIndex) {
      var length = this.length >>> 0;
      if (length === 0) {
        return false;
      }
      var start = fromIndex | 0;
      var index = Math.max(start >= 0 ? start : length - Math.abs(start), 0);
      while (index < length) {
        var value = this[index];
        if (value === searchElement || (value !== value && searchElement !== searchElement)) {
          return true;
        }
        index += 1;
      }
      return false;
    };
  }

  if (!Object.fromEntries) {
    Object.fromEntries = function (entries) {
      var result = {};
      if (!entries || typeof entries.length !== "number") {
        return result;
      }

      for (var index = 0; index < entries.length; index += 1) {
        var entry = entries[index];
        if (!entry || entry.length < 2) {
          continue;
        }
        result[entry[0]] = entry[1];
      }

      return result;
    };
  }

  if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth) {
      var maxDepth = typeof depth === "number" ? depth : 1;
      var output = [];

      function flatten(input, currentDepth) {
        for (var i = 0; i < input.length; i += 1) {
          var value = input[i];
          if (Array.isArray(value) && currentDepth < maxDepth) {
            flatten(value, currentDepth + 1);
          } else {
            output.push(value);
          }
        }
      }

      flatten(this, 0);
      return output;
    };
  }

  if (!Array.prototype.flatMap) {
    Array.prototype.flatMap = function (callback, thisArg) {
      return this.map(callback, thisArg).flat(1);
    };
  }

  if (win.NodeList && win.NodeList.prototype && !win.NodeList.prototype.forEach) {
    win.NodeList.prototype.forEach = Array.prototype.forEach;
  }

  if (win.Element && win.Element.prototype) {
    if (!win.Element.prototype.matches) {
      win.Element.prototype.matches =
        win.Element.prototype.msMatchesSelector ||
        win.Element.prototype.webkitMatchesSelector ||
        function (selector) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(selector);
          var index = matches.length;
          while (index >= 0 && matches.item(index) !== this) {
            index -= 1;
          }
          return index > -1;
        };
    }

    if (!win.Element.prototype.closest) {
      win.Element.prototype.closest = function (selector) {
        var node = this;
        while (node && node.nodeType === 1) {
          if (node.matches(selector)) {
            return node;
          }
          node = node.parentElement || node.parentNode;
        }
        return null;
      };
    }
  }

  if (typeof win.CustomEvent !== "function") {
    var CustomEventPolyfill = function (event, params) {
      params = params || { bubbles: false, cancelable: false, detail: null };
      var customEvent = doc.createEvent("CustomEvent");
      customEvent.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return customEvent;
    };

    CustomEventPolyfill.prototype = win.Event ? win.Event.prototype : {};
    win.CustomEvent = CustomEventPolyfill;
  }

  if (!win.requestAnimationFrame) {
    win.requestAnimationFrame = function (callback) {
      return win.setTimeout(function () {
        callback(Date.now());
      }, 16);
    };
    win.cancelAnimationFrame = function (id) {
      win.clearTimeout(id);
    };
  }

  function injectLegacyBanner() {
    if (supportsModernSyntax || !doc.body) {
      return;
    }
    if (doc.getElementById("legacyBrowserNotice")) {
      return;
    }

    var notice = doc.createElement("div");
    notice.id = "legacyBrowserNotice";
    notice.className = "legacy-browser-notice";
    notice.setAttribute("role", "status");
    notice.textContent = "Legacy browser detected. Please update your browser for full checkout, account, and admin features.";

    doc.body.insertBefore(notice, doc.body.firstChild);
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", injectLegacyBanner);
  } else {
    injectLegacyBanner();
  }
})();
