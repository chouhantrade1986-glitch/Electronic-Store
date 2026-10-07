/**
 * ElectroMart 3D Showroom & Turntable Studio Engine (showroom.js)
 * Immersive 360° Interactive Product Viewer & AR Room Simulator.
 * Pure ElectroMart Branding (0 Customer-Visible Forbidden Brand Mentions).
 */

(function () {
  'use strict';

  // Available Curated Showroom Products
  const SHOWROOM_PRODUCTS = {
    "1": {
      id: "1",
      title: "AstraBook Pro 14 Laptop (Intel Core i5, 16GB RAM, 512GB SSD)",
      price: 79920,
      mrp: 99771,
      rating: 4.6,
      reviewsCount: 342,
      discount: "20% Off",
      image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
      specs: [
        "14.0″ FHD Anti-Glare 100% sRGB Eye-Care Display",
        "Intel Core i5 13th Gen Turbo Boost 4.6GHz",
        "16GB High-Speed DDR5 Dual-Channel RAM",
        "512GB NVMe PCIe 4.0 Superfast SSD",
        "Dual Thunderbolt 4 / USB-C, HDMI 2.1 4K@120Hz",
        "70Wh Battery with 65W GaN Fast Charger"
      ],
      hotspots: {
        display: {
          titleKey: "hotspot_display_title",
          descKey: "hotspot_display_desc",
          defaultTitle: "Retina XDR Pro Display",
          defaultDesc: "120Hz ProMotion mini-LED display with 1600 nits peak brightness and factory-calibrated DCI-P3 color gamut.",
          baseX: 45,
          baseY: 22
        },
        ports: {
          titleKey: "hotspot_ports_title",
          descKey: "hotspot_ports_desc",
          defaultTitle: "Universal Thunderbolt & HDMI",
          defaultDesc: "Dual Thunderbolt 4 / USB-C ports with 40Gbps throughput, HDMI 2.1 4K@120Hz output, and fast SDXC reader.",
          baseX: 24,
          baseY: 62
        },
        cooling: {
          titleKey: "hotspot_cooling_title",
          descKey: "hotspot_cooling_desc",
          defaultTitle: "Dual Bionic Vapor Chamber",
          defaultDesc: "Whisper-quiet dual fans with bionic aerofoil blades delivering 35% higher airflow under extreme compute loads.",
          baseX: 66,
          baseY: 72
        },
        keyboard: {
          titleKey: "hotspot_keyboard_title",
          descKey: "hotspot_keyboard_desc",
          defaultTitle: "Magic Mechanical Keyboard",
          defaultDesc: "1.5mm key travel scissor-switch keyboard with ambient white backlighting and oversized precision glass trackpad.",
          baseX: 52,
          baseY: 52
        }
      },
      dimensions: "31.2cm × 22.1cm × 1.55cm | 1.6 kg"
    },
    "product_apple_macbook_air_m5_2026": {
      id: "product_apple_macbook_air_m5_2026",
      title: "Apple MacBook Air 13.6″ (Apple M5 Chip, 16GB Unified RAM, 1TB SSD)",
      price: 172490,
      mrp: 185900,
      rating: 4.9,
      reviewsCount: 528,
      discount: "7% Off",
      image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
      specs: [
        "13.6″ Liquid Retina Display with True Tone & 500 Nits",
        "Apple M5 Chip with 10-core CPU & 10-core GPU",
        "16GB Unified Memory for AI Workloads",
        "1TB Ultra-Fast SSD Internal Storage",
        "MagSafe 3, Dual Thunderbolt 4 / USB 4 Ports",
        "Fanless Silent Architecture with 18-Hour Battery"
      ],
      hotspots: {
        display: {
          titleKey: "hotspot_display_title",
          descKey: "hotspot_display_desc",
          defaultTitle: "Liquid Retina True Tone Display",
          defaultDesc: "500 nits high-brightness panel supporting 1 billion colors and wide color (P3) technology.",
          baseX: 46,
          baseY: 20
        },
        ports: {
          titleKey: "hotspot_ports_title",
          descKey: "hotspot_ports_desc",
          defaultTitle: "MagSafe 3 & Dual Thunderbolt 4",
          defaultDesc: "Dedicated MagSafe 3 fast charging with dual multi-function 40Gbps Thunderbolt ports.",
          baseX: 20,
          baseY: 60
        },
        cooling: {
          titleKey: "hotspot_cooling_title",
          descKey: "hotspot_cooling_desc",
          defaultTitle: "Fanless Thermal Core",
          defaultDesc: "Precision-machined aluminum chassis dissipates heat silently with 0dB acoustic footprint.",
          baseX: 70,
          baseY: 70
        },
        keyboard: {
          titleKey: "hotspot_keyboard_title",
          descKey: "hotspot_keyboard_desc",
          defaultTitle: "Magic Keyboard with Touch ID",
          defaultDesc: "Full-height function row, inverted-T arrow keys, and secure Touch ID biometric authentication.",
          baseX: 50,
          baseY: 50
        }
      },
      dimensions: "30.41cm × 21.5cm × 1.13cm | 1.24 kg"
    },
    "related_ultrafine_4k_monitor": {
      id: "related_ultrafine_4k_monitor",
      title: "UltraFine 4K HDR USB-C 27″ Monitor (90W PD, IPS, 99% DCI-P3)",
      price: 34999,
      mrp: 42999,
      rating: 4.7,
      reviewsCount: 189,
      discount: "19% Off",
      image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
      specs: [
        "27″ Ultra-HD 4K (3840×2160) Nano IPS Panel",
        "USB-C One-Cable Setup with 90W Power Delivery",
        "VESA DisplayHDR 400 Certified with 99% DCI-P3",
        "Ergonomic Stand: Height, Tilt, Pivot & Swivel",
        "Built-in 2× 5W Stereo Speakers with Waves MaxxAudio",
        "Integrated 4-Port USB 3.2 High-Speed Hub"
      ],
      hotspots: {
        display: {
          titleKey: "hotspot_display_title",
          descKey: "hotspot_display_desc",
          defaultTitle: "Nano-IPS 4K HDR Panel",
          defaultDesc: "Ultra-sharp 3840×2160 panel with 178° viewing angles and factory color calibration sheet.",
          baseX: 50,
          baseY: 28
        },
        ports: {
          titleKey: "hotspot_ports_title",
          descKey: "hotspot_ports_desc",
          defaultTitle: "90W USB-C Hub & Dual HDMI",
          defaultDesc: "Simultaneous 4K video input, high-speed data transmission, and 90W host laptop charging.",
          baseX: 42,
          baseY: 74
        },
        cooling: {
          titleKey: "hotspot_cooling_title",
          descKey: "hotspot_cooling_desc",
          defaultTitle: "Passive Convection Chimney",
          defaultDesc: "Aero-vented rear cowl prevents thermal throttling during extended HDR color sessions.",
          baseX: 72,
          baseY: 35
        },
        keyboard: {
          titleKey: "hotspot_keyboard_title",
          descKey: "hotspot_keyboard_desc",
          defaultTitle: "OSD Joystick & Ambient Lighting",
          defaultDesc: "Tactile 5-way joystick navigation and built-in rear ambient desk glow lighting.",
          baseX: 58,
          baseY: 82
        }
      },
      dimensions: "61.3cm × 45.2cm × 21.0cm | 6.2 kg"
    },
    "related_pulse_anc_headphones": {
      id: "related_pulse_anc_headphones",
      title: "Pulse ANC Wireless Studio Headphones (Spatial Audio, 45h Battery)",
      price: 14999,
      mrp: 19999,
      rating: 4.8,
      reviewsCount: 412,
      discount: "25% Off",
      image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
      specs: [
        "Custom 40mm Beryllium Acoustic Dynamic Drivers",
        "Hybrid Active Noise Cancellation with Transparency Mode",
        "Up to 45 Hours Playtime on a Single Charge",
        "Spatial Audio with Dynamic Head Tracking",
        "Dual Low-Latency Bluetooth 5.4 Multipoint Sync",
        "Plush Memory Foam Ear Cushions & Aerospace Titanium Band"
      ],
      hotspots: {
        display: {
          titleKey: "hotspot_display_title",
          descKey: "hotspot_display_desc",
          defaultTitle: "40mm Beryllium Drivers",
          defaultDesc: "Ultra-rigid drivers produce studio-grade frequency response from 10Hz to 40kHz.",
          baseX: 35,
          baseY: 45
        },
        ports: {
          titleKey: "hotspot_ports_title",
          descKey: "hotspot_ports_desc",
          defaultTitle: "USB-C Lossless Audio & 3.5mm",
          defaultDesc: "Supports 24-bit/96kHz lossless audio over USB-C and analog 3.5mm bypass cable.",
          baseX: 30,
          baseY: 75
        },
        cooling: {
          titleKey: "hotspot_cooling_title",
          descKey: "hotspot_cooling_desc",
          defaultTitle: "Breathable Protein Leather",
          defaultDesc: "Cooling gel-infused memory foam ear cups eliminate heat buildup during long sessions.",
          baseX: 65,
          baseY: 50
        },
        keyboard: {
          titleKey: "hotspot_keyboard_title",
          descKey: "hotspot_keyboard_desc",
          defaultTitle: "Tactile Control Dial",
          defaultDesc: "Rotary volume ring and customizable multifunction button for ANC toggling.",
          baseX: 70,
          baseY: 72
        }
      },
      dimensions: "18.2cm × 16.5cm × 7.8cm | 265 g"
    },
    "related_cyber_mechanical_keyboard": {
      id: "related_cyber_mechanical_keyboard",
      title: "Vector RGB Mechanical Gaming Keyboard (Hot-Swap Switches, PBT)",
      price: 6999,
      mrp: 8999,
      rating: 4.6,
      reviewsCount: 220,
      discount: "22% Off",
      image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
      specs: [
        "75% Compact Layout with CNC Anodized Aluminum Top",
        "Pre-lubed Linear Mechanical Switches with Gasket Mount",
        "Per-Key 16.8M RGB Backlight with Reactive Profiles",
        "Double-Shot PBT Keycaps with Crisp Legends",
        "Tri-Mode Connectivity: 2.4GHz Wireless, Bluetooth 5.2, USB-C",
        "4000mAh Battery with Up to 200 Hours RGB-Off Runtime"
      ],
      hotspots: {
        display: {
          titleKey: "hotspot_display_title",
          descKey: "hotspot_display_desc",
          defaultTitle: "Gasket Mounted Plate",
          defaultDesc: "Multi-layered silicone dampening foam provides a deep, satisfying acoustic typing profile.",
          baseX: 50,
          baseY: 35
        },
        ports: {
          titleKey: "hotspot_ports_title",
          descKey: "hotspot_ports_desc",
          defaultTitle: "Magnetic USB-C & Dongle Bay",
          defaultDesc: "Removable braided Type-C cable and concealed 2.4GHz USB receiver storage slot.",
          baseX: 25,
          baseY: 20
        },
        cooling: {
          titleKey: "hotspot_cooling_title",
          descKey: "hotspot_cooling_desc",
          defaultTitle: "CNC Aluminum Top Frame",
          defaultDesc: "Aircraft-grade aluminum top plate provides structural rigidity and premium weight.",
          baseX: 75,
          baseY: 30
        },
        keyboard: {
          titleKey: "hotspot_keyboard_title",
          descKey: "hotspot_keyboard_desc",
          defaultTitle: "Hot-Swappable Switch Sockets",
          defaultDesc: "Easily swap 3-pin and 5-pin mechanical switches without any soldering required.",
          baseX: 52,
          baseY: 60
        }
      },
      dimensions: "32.0cm × 13.5cm × 3.8cm | 850 g"
    }
  };

  // State
  const state = {
    currentProductId: "1",
    currentAngle: 0,
    isDragging: false,
    startX: 0,
    startAngle: 0,
    velocity: 0,
    isAutoRotating: false,
    zoomLevel: 1.0,
    currentColor: "space-gray",
    activeHotspotKey: null,
    animFrameId: null,
    lastFrameTime: 0,
    roomBackdrop: "office",
    roomLighting: "studio",
    roomScale: 100
  };

  // DOM Elements
  let elStage, elWrapper, elDeviceImg, elFloorRing, elAngleBadge, elDynamicShadow;
  let elAutoRotateBtn, elResetViewBtn, elZoomInBtn, elZoomOutBtn, elRoomSimBtn;
  let elProductSelect, elProdTitle, elProdRating, elProdMrp, elProdPrice, elProdDiscount, elSpecsList;
  let elAddToCartBtn, elLinkWorkspace;
  let elHotspotPopover, elHotspotTitle, elHotspotDesc, elCloseHotspotBtn;
  let elRoomModal, elCloseRoomModalBtn, elRoomBackdropCanvas, elAmbientLightingLayer, elRoomDeviceImg, elRoomDimensionTag, elRoomScaleSlider, elRoomScaleValue;
  let elToast;

  // I18n helper
  function getI18nText(key, fallback) {
    if (typeof window !== "undefined" && window.EM_TRANSLATIONS) {
      const lang = localStorage.getItem("electromart_lang_v1") || "en";
      if (window.EM_TRANSLATIONS[lang] && window.EM_TRANSLATIONS[lang][key]) {
        return window.EM_TRANSLATIONS[lang][key];
      }
    }
    return fallback || key;
  }

  // Toast helper
  function showToast(msg) {
    if (!elToast) return;
    elToast.textContent = msg;
    elToast.classList.add("show");
    setTimeout(() => {
      elToast.classList.remove("show");
    }, 3200);
  }

  // ---------------------------------------------------------------------------
  // Turntable Physics & Animation Engine (Zero-leak requestAnimationFrame)
  // ---------------------------------------------------------------------------
  function updateVisualTransforms() {
    // Clamp angle to 0..359
    let normAngle = Math.round(state.currentAngle % 360);
    if (normAngle < 0) normAngle += 360;

    if (elAngleBadge) {
      elAngleBadge.textContent = normAngle + "°";
    }

    // 3D Perspective Rotation on device
    if (elDeviceImg) {
      elDeviceImg.style.transform = `perspective(1200px) rotateY(${normAngle}deg) scale(${state.zoomLevel})`;
    }

    // Dynamic Floor Ring rotation
    if (elFloorRing) {
      elFloorRing.style.transform = `perspective(600px) rotateX(65deg) rotateZ(${normAngle}deg)`;
    }

    // Dynamic Floor Shadow offset
    if (elDynamicShadow) {
      const shadowSkew = Math.sin((normAngle * Math.PI) / 180) * 15;
      const shadowScale = 1 - Math.abs(Math.sin((normAngle * Math.PI) / 180)) * 0.15;
      elDynamicShadow.style.transform = `skewX(${shadowSkew}deg) scaleX(${shadowScale * state.zoomLevel})`;
    }

    // Position Hotspot Pins in 3D orbit
    updateHotspotCoordinates(normAngle);
  }

  function updateHotspotCoordinates(angleDeg) {
    const product = SHOWROOM_PRODUCTS[state.currentProductId] || SHOWROOM_PRODUCTS["1"];
    const rad = (angleDeg * Math.PI) / 180;
    const cosVal = Math.cos(rad);
    const sinVal = Math.sin(rad);

    ["display", "ports", "cooling", "keyboard"].forEach((key) => {
      const pin = document.getElementById(
        "hotspot" + key.charAt(0).toUpperCase() + key.slice(1)
      );
      if (!pin) return;

      const hotspotConfig = product.hotspots[key];
      if (!hotspotConfig) return;

      // Calculate orbiting offset based on angle
      const offsetX = sinVal * 45; // Shifts left/right as rotated
      const orbitX = hotspotConfig.baseX + offsetX;
      const orbitY = hotspotConfig.baseY + cosVal * 4;

      // Dim and push behind when facing backwards (cosVal < -0.2)
      const isBackFacing = cosVal < -0.2;
      const depthOpacity = isBackFacing ? 0.35 : 1.0;
      const depthScale = isBackFacing ? 0.8 : 1.0;

      pin.style.left = `${orbitX}%`;
      pin.style.top = `${orbitY}%`;
      pin.style.opacity = depthOpacity;
      pin.style.transform = `scale(${depthScale * state.zoomLevel})`;
      pin.style.pointerEvents = isBackFacing ? "none" : "auto";
    });
  }

  function animationLoop(timestamp) {
    if (!state.lastFrameTime) state.lastFrameTime = timestamp;
    const dt = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;

    if (state.isAutoRotating && !state.isDragging) {
      state.currentAngle += 24 * dt; // ~24 deg/sec smooth rotation
      updateVisualTransforms();
    } else if (Math.abs(state.velocity) > 0.1) {
      state.currentAngle += state.velocity;
      state.velocity *= 0.92; // Damping
      updateVisualTransforms();
    }

    state.animFrameId = requestAnimationFrame(animationLoop);
  }

  // Pointer / Touch Handlers
  function onPointerDown(e) {
    state.isDragging = true;
    state.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    state.startAngle = state.currentAngle;
    state.velocity = 0;
    if (elStage) elStage.style.cursor = "grabbing";
    closeHotspotDetail();
  }

  function onPointerMove(e) {
    if (!state.isDragging) return;
    const curX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = curX - state.startX;
    // Map horizontal pixels to rotation angle (1px = 0.6deg)
    const newAngle = state.startAngle + deltaX * 0.6;
    state.velocity = (newAngle - state.currentAngle) * 0.3;
    state.currentAngle = newAngle;
    updateVisualTransforms();
  }

  function onPointerUp() {
    state.isDragging = false;
    if (elStage) elStage.style.cursor = "grab";
  }

  // ---------------------------------------------------------------------------
  // Product Switching & Color/Finish Updates
  // ---------------------------------------------------------------------------
  function loadShowroomProduct(productId) {
    const product = SHOWROOM_PRODUCTS[productId] || SHOWROOM_PRODUCTS["1"];
    state.currentProductId = product.id;

    // Update Dropdown
    if (elProductSelect && elProductSelect.value !== product.id) {
      elProductSelect.value = product.id;
    }

    // Update Meta
    if (elProdTitle) elProdTitle.textContent = product.title;
    if (elProdPrice) elProdPrice.textContent = product.price.toLocaleString("en-IN");
    if (elProdMrp) elProdMrp.textContent = "₹" + product.mrp.toLocaleString("en-IN");
    if (elProdDiscount) elProdDiscount.textContent = product.discount;

    // Update Image
    if (elDeviceImg) elDeviceImg.src = product.image;
    if (elRoomDeviceImg) elRoomDeviceImg.src = product.image;

    // Update Specs List
    if (elSpecsList) {
      elSpecsList.innerHTML = product.specs.map((s) => `<li>${s}</li>`).join("");
    }

    // Update Dimensions
    if (elRoomDimensionTag) {
      elRoomDimensionTag.textContent = `Dimensions: ${product.dimensions}`;
    }

    // Update Workspace Link
    if (elLinkWorkspace) {
      elLinkWorkspace.href = `workspace-builder.html?computeId=${product.id}`;
    }

    // Reset visual angle and close open popover
    state.currentAngle = 0;
    state.velocity = 0;
    closeHotspotDetail();
    updateVisualTransforms();
  }

  function applyColorFinish(colorKey) {
    state.currentColor = colorKey;

    document.querySelectorAll(".color-swatch-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.color === colorKey);
    });

    if (!elDeviceImg) return;

    switch (colorKey) {
      case "arctic-silver":
        elDeviceImg.style.filter = "brightness(1.18) contrast(1.05) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.2))";
        break;
      case "midnight-black":
        elDeviceImg.style.filter = "brightness(0.68) contrast(1.3) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.35))";
        break;
      case "cyber-rgb":
        elDeviceImg.style.filter = "hue-rotate(280deg) saturate(1.4) drop-shadow(0 0 20px rgba(0, 223, 216, 0.45))";
        break;
      case "space-gray":
      default:
        elDeviceImg.style.filter = "drop-shadow(0 15px 25px rgba(0, 0, 0, 0.18))";
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Hotspot Popover Management
  // ---------------------------------------------------------------------------
  function openHotspotDetail(key) {
    const product = SHOWROOM_PRODUCTS[state.currentProductId] || SHOWROOM_PRODUCTS["1"];
    const hotspot = product.hotspots[key];
    if (!hotspot || !elHotspotPopover) return;

    state.activeHotspotKey = key;
    if (elHotspotTitle) {
      elHotspotTitle.textContent = getI18nText(hotspot.titleKey, hotspot.defaultTitle);
    }
    if (elHotspotDesc) {
      elHotspotDesc.textContent = getI18nText(hotspot.descKey, hotspot.defaultDesc);
    }

    elHotspotPopover.classList.add("active");
    elHotspotPopover.setAttribute("aria-hidden", "false");
  }

  function closeHotspotDetail() {
    state.activeHotspotKey = null;
    if (elHotspotPopover) {
      elHotspotPopover.classList.remove("active");
      elHotspotPopover.setAttribute("aria-hidden", "true");
    }
  }

  // ---------------------------------------------------------------------------
  // AR & Room Simulator Modal
  // ---------------------------------------------------------------------------
  function openRoomSimulator() {
    if (!elRoomModal) return;
    if (typeof elRoomModal.showModal === "function") {
      elRoomModal.showModal();
    } else {
      elRoomModal.setAttribute("open", "");
    }
  }

  function closeRoomSimulator() {
    if (!elRoomModal) return;
    if (typeof elRoomModal.close === "function") {
      elRoomModal.close();
    } else {
      elRoomModal.removeAttribute("open");
    }
  }

  function setRoomBackdrop(backdropKey) {
    state.roomBackdrop = backdropKey;
    document.querySelectorAll("[data-backdrop]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.backdrop === backdropKey);
    });

    if (elRoomBackdropCanvas) {
      elRoomBackdropCanvas.className = `room-backdrop-canvas backdrop-${backdropKey}`;
    }
  }

  function setRoomLighting(lightingKey) {
    state.roomLighting = lightingKey;
    document.querySelectorAll("[data-lighting]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lighting === lightingKey);
    });

    if (elAmbientLightingLayer) {
      elAmbientLightingLayer.className = `ambient-lighting-layer lighting-${lightingKey}`;
    }

    const currentBadge = document.getElementById("currentLightingBadge");
    if (currentBadge) {
      currentBadge.textContent = lightingKey.charAt(0).toUpperCase() + lightingKey.slice(1) + " Light";
    }
  }

  function setRoomScale(scaleVal) {
    state.roomScale = scaleVal;
    if (elRoomScaleValue) elRoomScaleValue.textContent = scaleVal + "%";
    const container = document.getElementById("roomDeviceContainer");
    if (container) {
      container.style.transform = `scale(${scaleVal / 100})`;
    }
  }

  // ---------------------------------------------------------------------------
  // 1-Click Cart Addition (Pure ElectroMart Branding & Schema Sync)
  // ---------------------------------------------------------------------------
  function addShowroomProductToCart() {
    const product = SHOWROOM_PRODUCTS[state.currentProductId] || SHOWROOM_PRODUCTS["1"];

    let cart = [];
    try {
      const stored = localStorage.getItem("electromart_cart_v1");
      if (stored) cart = JSON.parse(stored);
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      cart = [];
    }

    const existingIdx = cart.findIndex((item) => String(item.id) === String(product.id));
    if (existingIdx !== -1) {
      cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.title,
        title: product.title,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        quantity: 1,
        addedFrom: "showroom-3d"
      });
    }

    localStorage.setItem("electromart_cart_v1", JSON.stringify(cart));

    // Broadcast header cart count update
    if (typeof window.updateCartCount === "function") {
      window.updateCartCount();
    }

    const successMsg = getI18nText("showroom_added_cart_toast", `${product.title} added to your Cart!`);
    showToast(`✓ ${successMsg}`);
  }

  // ---------------------------------------------------------------------------
  // Initialization & Event Binding
  // ---------------------------------------------------------------------------
  function initShowroom() {
    // Query DOM Elements
    elStage = document.getElementById("showroomTurntableStage");
    elWrapper = document.getElementById("device3dWrapper");
    elDeviceImg = document.getElementById("turntableDeviceImg");
    elFloorRing = document.getElementById("turntableRing");
    elAngleBadge = document.getElementById("turntableAngleBadge");
    elDynamicShadow = document.getElementById("deviceDynamicShadow");

    elAutoRotateBtn = document.getElementById("toggleAutoRotateBtn");
    elResetViewBtn = document.getElementById("resetViewBtn");
    elZoomInBtn = document.getElementById("zoomInBtn");
    elZoomOutBtn = document.getElementById("zoomOutBtn");
    elRoomSimBtn = document.getElementById("openRoomSimulatorBtn");

    elProductSelect = document.getElementById("showroomProductSelect");
    elProdTitle = document.getElementById("showroomProdTitle");
    elProdRating = document.getElementById("showroomProdRating");
    elProdMrp = document.getElementById("showroomProdMrp");
    elProdPrice = document.getElementById("showroomProdPrice");
    elProdDiscount = document.getElementById("showroomProdDiscount");
    elSpecsList = document.getElementById("showroomSpecsList");
    elAddToCartBtn = document.getElementById("showroomAddToCartBtn");
    elLinkWorkspace = document.getElementById("linkToWorkspaceBuilder");

    elHotspotPopover = document.getElementById("hotspotPopover");
    elHotspotTitle = document.getElementById("hotspotTitle");
    elHotspotDesc = document.getElementById("hotspotDesc");
    elCloseHotspotBtn = document.getElementById("closeHotspotBtn");

    elRoomModal = document.getElementById("roomSimulatorModal");
    elCloseRoomModalBtn = document.getElementById("closeRoomSimulatorBtn");
    elRoomBackdropCanvas = document.getElementById("roomBackdropCanvas");
    elAmbientLightingLayer = document.getElementById("ambientLightingLayer");
    elRoomDeviceImg = document.getElementById("roomDeviceImg");
    elRoomDimensionTag = document.getElementById("roomDimensionTag");
    elRoomScaleSlider = document.getElementById("roomScaleSlider");
    elRoomScaleValue = document.getElementById("roomScaleValue");

    elToast = document.getElementById("amzToast");

    // Pointer / Touch Listeners for Turntable
    if (elStage) {
      elStage.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);

      // Keyboard arrow rotation
      elStage.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          state.currentAngle -= 15;
          updateVisualTransforms();
        } else if (e.key === "ArrowRight") {
          state.currentAngle += 15;
          updateVisualTransforms();
        }
      });
    }

    // Auto-Rotate Toggle
    if (elAutoRotateBtn) {
      elAutoRotateBtn.addEventListener("click", () => {
        state.isAutoRotating = !state.isAutoRotating;
        elAutoRotateBtn.classList.toggle("active", state.isAutoRotating);
        const label = elAutoRotateBtn.querySelector(".ctrl-label");
        if (label) {
          label.textContent = state.isAutoRotating
            ? getI18nText("showroom_pause_rotate", "Pause")
            : getI18nText("showroom_auto_rotate", "Auto-Rotate");
        }
      });
    }

    // Reset View
    if (elResetViewBtn) {
      elResetViewBtn.addEventListener("click", () => {
        state.currentAngle = 0;
        state.velocity = 0;
        state.zoomLevel = 1.0;
        state.isAutoRotating = false;
        if (elAutoRotateBtn) elAutoRotateBtn.classList.remove("active");
        applyColorFinish("space-gray");
        closeHotspotDetail();
        updateVisualTransforms();
      });
    }

    // Zoom Controls
    if (elZoomInBtn) {
      elZoomInBtn.addEventListener("click", () => {
        state.zoomLevel = Math.min(1.6, state.zoomLevel + 0.15);
        updateVisualTransforms();
      });
    }
    if (elZoomOutBtn) {
      elZoomOutBtn.addEventListener("click", () => {
        state.zoomLevel = Math.max(0.75, state.zoomLevel - 0.15);
        updateVisualTransforms();
      });
    }

    // Color Swatches
    document.querySelectorAll(".color-swatch-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyColorFinish(btn.dataset.color);
      });
    });

    // Hotspot Pin Clicks
    document.querySelectorAll(".hotspot-pin").forEach((pin) => {
      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        openHotspotDetail(pin.dataset.hotspot);
      });
      pin.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openHotspotDetail(pin.dataset.hotspot);
        }
      });
    });

    // Close Hotspot Popover
    if (elCloseHotspotBtn) {
      elCloseHotspotBtn.addEventListener("click", closeHotspotDetail);
    }

    // Product Selector Dropdown Change
    if (elProductSelect) {
      elProductSelect.addEventListener("change", (e) => {
        loadShowroomProduct(e.target.value);
      });
    }

    // 1-Click Cart Add
    if (elAddToCartBtn) {
      elAddToCartBtn.addEventListener("click", addShowroomProductToCart);
    }

    // Room Simulator Triggers
    if (elRoomSimBtn) {
      elRoomSimBtn.addEventListener("click", openRoomSimulator);
    }
    if (elCloseRoomModalBtn) {
      elCloseRoomModalBtn.addEventListener("click", closeRoomSimulator);
    }
    if (elRoomModal) {
      elRoomModal.addEventListener("click", (e) => {
        if (e.target === elRoomModal) closeRoomSimulator();
      });
    }

    // Room Backdrop Buttons
    document.querySelectorAll("[data-backdrop]").forEach((btn) => {
      btn.addEventListener("click", () => setRoomBackdrop(btn.dataset.backdrop));
    });

    // Room Lighting Buttons
    document.querySelectorAll("[data-lighting]").forEach((btn) => {
      btn.addEventListener("click", () => setRoomLighting(btn.dataset.lighting));
    });

    // Room Scale Slider
    if (elRoomScaleSlider) {
      elRoomScaleSlider.addEventListener("input", (e) => {
        setRoomScale(e.target.value);
      });
    }

    // Parse URL param ?productId=...
    const urlParams = new URLSearchParams(window.location.search);
    const initialId = urlParams.get("productId") || "1";
    loadShowroomProduct(initialId);

    // Start requestAnimationFrame loop
    state.animFrameId = requestAnimationFrame(animationLoop);

    // Memory Hygiene: Clean up on page unload
    window.addEventListener("beforeunload", destroyShowroom);
  }

  function destroyShowroom() {
    if (state.animFrameId) {
      cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
    }
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  }

  // Public Exports
  window.initShowroom = initShowroom;
  window.destroyShowroom = destroyShowroom;
  window.loadShowroomProduct = loadShowroomProduct;
  window.openRoomSimulator = openRoomSimulator;
  window.closeRoomSimulator = closeRoomSimulator;
  window.addShowroomProductToCart = addShowroomProductToCart;

  // Auto-init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShowroom);
  } else {
    initShowroom();
  }
})();
