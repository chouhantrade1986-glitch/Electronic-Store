/**
 * ElectroMart Virtual Workspace & Desk Setup Studio Engine (workspace-builder.js)
 * Modular 6-Slot Visual Desk Builder, Hardware Compatibility Checker, and 10% Bundle Checkout.
 * Pure ElectroMart Branding (0 Customer-Visible Forbidden Brand Mentions).
 */

(function () {
  'use strict';

  // Catalog of Modular Components for Workspace Studio
  const WORKSPACE_CATALOG = {
    desk: [
      {
        id: "desk_walnut_140",
        category: "desk",
        name: "Walnut Motorized Sit-Stand Desk 140cm",
        title: "Walnut Motorized Sit-Stand Desk 140cm with Dual Motors & Memory Presets",
        desc: "Solid walnut hardwood top with dual heavy-duty motors, anti-collision gyro, and integrated cable tray.",
        price: 24999,
        mrp: 32999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        woodEdge: "Walnut Motorized Sit-Stand 140cm"
      },
      {
        id: "desk_bamboo_120",
        category: "desk",
        name: "Minimalist Natural Bamboo Desk 120cm",
        title: "Minimalist Natural Bamboo Desk 120cm with Steel Frame",
        desc: "Eco-friendly sustainable solid bamboo top with matte black powder-coated chamfered steel legs.",
        price: 18999,
        mrp: 24999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        woodEdge: "Natural Bamboo Studio 120cm"
      },
      {
        id: "desk_carbon_battlestation",
        category: "desk",
        name: "Cyber Battlestation Carbon Desk 160cm",
        title: "Cyber Battlestation Carbon Desk 160cm with Dual RGB Ambient Trim",
        desc: "Carbon fiber textured desktop, full-surface desk mat, headphone hook, and rear monitor arm mounts.",
        price: 28999,
        mrp: 37999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        woodEdge: "Carbon Fiber Battlestation 160cm"
      },
      {
        id: "desk_oak_executive_160",
        category: "desk",
        name: "Executive Studio Oak Desk 160cm",
        title: "Executive Studio Solid Oak Desk 160cm with Leather Inset Pad",
        desc: "Premium handcrafted European white oak with flush wireless charging pad and soft-close drawers.",
        price: 34999,
        mrp: 44999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        woodEdge: "European White Oak 160cm"
      }
    ],
    compute: [
      {
        id: "1",
        category: "compute",
        name: "AstraBook Pro 14 Laptop",
        title: "AstraBook Pro 14 Laptop (Intel Core i5, 16GB RAM, 512GB SSD)",
        desc: "Intel Core i5 13th Gen, 16GB DDR5, 512GB NVMe SSD, Dual Thunderbolt 4 / USB-C, 65W PD.",
        price: 79920,
        mrp: 99771,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        ports: ["Thunderbolt 4", "USB-C", "HDMI 2.1"],
        powerDraw: 65,
        tag: "AstraBook Pro 14"
      },
      {
        id: "product_apple_macbook_air_m5_2026",
        category: "compute",
        name: "Apple MacBook Air 13.6″ M5",
        title: "Apple MacBook Air 13.6″ (Apple M5 Chip, 16GB Unified RAM, 1TB SSD)",
        desc: "M5 Chip 10-core GPU, 16GB Unified Memory, 1TB SSD, Dual Thunderbolt 4 ports, 70W Fast Charge.",
        price: 172490,
        mrp: 185900,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        ports: ["Thunderbolt 4", "MagSafe 3"],
        powerDraw: 70,
        tag: "MacBook Air M5"
      },
      {
        id: "compute_vector_rtx_tower",
        category: "compute",
        name: "Vector RTX 4070 Gaming Tower",
        title: "Vector RTX 4070 Gaming Workstation Tower (Ryzen 7, 32GB RAM, 2TB SSD)",
        desc: "AMD Ryzen 7 7800X3D, RTX 4070 12GB, 32GB DDR5, DisplayPort 1.4a, HDMI 2.1, 750W Gold PSU.",
        price: 124999,
        mrp: 149999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        ports: ["DisplayPort 1.4a", "HDMI 2.1", "USB 3.2"],
        powerDraw: 450,
        tag: "Vector RTX Tower"
      },
      {
        id: "compute_core_mini_workstation",
        category: "compute",
        name: "Core Mini Studio Workstation",
        title: "Core Mini Studio Workstation (Intel Core i7, 32GB RAM, 1TB SSD, WiFi 6E)",
        desc: "Ultra-compact 1-liter chassis, Intel Core i7 14-Core, Dual HDMI, Dual 2.5G LAN, 90W PD.",
        price: 49999,
        mrp: 62999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        ports: ["USB-C", "Dual HDMI", "DisplayPort"],
        powerDraw: 90,
        tag: "Core Mini Studio"
      }
    ],
    monitor: [
      {
        id: "related_ultrafine_4k_monitor",
        category: "monitor",
        name: "UltraFine 4K HDR USB-C 27″ Monitor",
        title: "UltraFine 4K HDR USB-C 27″ Monitor (90W PD, IPS, 99% DCI-P3)",
        desc: "3840×2160 UHD IPS, 90W USB-C Power Delivery hub, Dual HDMI 2.0, DisplayPort 1.4, Ergonomic stand.",
        price: 34999,
        mrp: 42999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        inputs: ["USB-C PD 90W", "HDMI 2.0", "DisplayPort 1.4"],
        pdWattage: 90,
        tag: "UltraFine 4K 27″"
      },
      {
        id: "monitor_curved_gaming_34",
        category: "monitor",
        name: "Curved 34″ Ultrawide 144Hz Gaming Monitor",
        title: "Curved 34″ Ultrawide QHD 144Hz HDR Monitor (1ms, FreeSync Premium)",
        desc: "3440×1440 21:9 UWQHD, 1500R curvature, 144Hz refresh rate, 1ms response, DisplayPort 1.4 & HDMI 2.1.",
        price: 44999,
        mrp: 54999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        inputs: ["DisplayPort 1.4", "HDMI 2.1"],
        pdWattage: 0,
        tag: "Curved 34″ 144Hz"
      },
      {
        id: "monitor_dual_4k_creator_setup",
        category: "monitor",
        name: "Dual UltraFine 4K 27″ Creator Displays",
        title: "Dual UltraFine 4K 27″ Displays with VESA Dual-Arm Mounting Kit",
        desc: "Twin calibrated 4K IPS monitors with matching dual gas-spring desktop arm and daisy-chain Thunderbolt support.",
        price: 69998,
        mrp: 85998,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        inputs: ["Thunderbolt 4", "DisplayPort 1.4"],
        pdWattage: 96,
        tag: "Dual 4K Displays"
      },
      {
        id: "monitor_ergonomic_24_fhd",
        category: "monitor",
        name: "Ergonomic 24″ FHD Eye-Care Monitor",
        title: "Ergonomic 24″ FHD IPS Monitor with TÜV Rheinland Eye Comfort & USB-C",
        desc: "1920×1080 100Hz IPS, low blue light, anti-flicker, 65W USB-C hub, height-adjustable stand.",
        price: 14999,
        mrp: 18999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        inputs: ["USB-C PD 65W", "HDMI 1.4"],
        pdWattage: 65,
        tag: "Ergo 24″ EyeCare"
      }
    ],
    input: [
      {
        id: "related_cyber_mechanical_keyboard",
        category: "input",
        name: "Vector RGB Mechanical Gaming Keyboard",
        title: "Vector RGB Mechanical Gaming Keyboard (Hot-Swap Switches, PBT)",
        desc: "75% layout, pre-lubed linear switches, gasket mount, tri-mode wireless + USB-C, 16.8M RGB lighting.",
        price: 6999,
        mrp: 8999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        tag: "Vector RGB Keyboard"
      },
      {
        id: "input_master_precision_combo",
        category: "input",
        name: "Master Precision Ergonomic Combo",
        title: "Master Precision Wireless Split Keyboard & Vertical Ergonomic Mouse",
        desc: "Split contoured keyboard with wrist rest, electromagnetic scroll wheel vertical mouse, Multi-OS pairing.",
        price: 8999,
        mrp: 11999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        tag: "Master Ergo Combo"
      },
      {
        id: "input_silent_slim_combo",
        category: "input",
        name: "Silent Slim Wireless Keyboard & Mouse",
        title: "Silent Slim Aluminum Wireless Keyboard and Whisper-Quiet Mouse",
        desc: "Scissor-switch low profile keys, rechargeable lithium battery, 2.4GHz + dual Bluetooth channels.",
        price: 2999,
        mrp: 4499,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        tag: "Silent Slim Combo"
      }
    ],
    audio: [
      {
        id: "related_pulse_anc_headphones",
        category: "audio",
        name: "Pulse ANC Wireless Studio Headphones",
        title: "Pulse ANC Wireless Studio Headphones (Spatial Audio, 45h Battery)",
        desc: "40mm Beryllium drivers, hybrid active noise cancellation, lossless USB-C audio, spatial tracking.",
        price: 14999,
        mrp: 19999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        tag: "Pulse ANC Studio"
      },
      {
        id: "audio_hifi_studio_monitors",
        category: "audio",
        name: "Hi-Fi Desktop Studio Monitors Pair",
        title: "Hi-Fi Active 2.0 Desktop Studio Monitors (50W RMS, Bluetooth 5.2 & Optical)",
        desc: "4-inch Kevlar bass drivers, silk dome tweeters, rear bass-reflex ports, balanced TRS inputs.",
        price: 18999,
        mrp: 23999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        tag: "Hi-Fi Studio 2.0"
      },
      {
        id: "audio_conference_speakerphone",
        category: "audio",
        name: "Compact Wireless Conference Speakerphone",
        title: "360° Omnidirectional Voice Conference Speakerphone with AI Noise Suppression",
        desc: "4-mic array, full-duplex acoustic echo cancellation, 12-hour talk time, USB-C & Bluetooth.",
        price: 4999,
        mrp: 6999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        tag: "Conference Speaker"
      }
    ],
    power: [
      {
        id: "power_100w_gan_dock",
        category: "power",
        name: "100W GaN Desktop Charging Hub",
        title: "100W GaN 4-Port Desktop Fast Charging Dock with Surge Protection",
        desc: "3× USB-C PD 3.0 (up to 100W single port), 1× USB-A, intelligent power allocation, cool GaN III tech.",
        price: 5999,
        mrp: 7999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        outputWattage: 100,
        tag: "100W GaN Dock"
      },
      {
        id: "power_140w_multi_dock",
        category: "power",
        name: "140W Multi-Port GaN Workstation Hub",
        title: "140W Multi-Port GaN Workstation Hub (PD 3.1, Dual 4K HDMI, Gigabit Ethernet)",
        desc: "140W EPR charging for power laptops, dual 4K@60Hz display outputs, 10Gbps USB data, SD 4.0 card reader.",
        price: 8999,
        mrp: 11999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        outputWattage: 140,
        tag: "140W GaN Station"
      },
      {
        id: "power_65w_travel_dock",
        category: "power",
        name: "65W Compact GaN Desktop Charger",
        title: "65W 3-Port GaN Fast Charger with Detachable AC Cord",
        desc: "Dual USB-C 65W PD, 1× USB-A QC 3.0, ultra-compact palm-sized form factor with over-temp protection.",
        price: 3499,
        mrp: 4999,
        image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        outputWattage: 65,
        tag: "65W GaN Charger"
      }
    ]
  };

  // Presets Definition
  const WORKSPACE_PRESETS = {
    coder: {
      desk: "desk_walnut_140",
      compute: "1",
      monitor: "related_ultrafine_4k_monitor",
      input: "related_cyber_mechanical_keyboard",
      audio: "related_pulse_anc_headphones",
      power: "power_100w_gan_dock"
    },
    gaming: {
      desk: "desk_carbon_battlestation",
      compute: "compute_vector_rtx_tower",
      monitor: "monitor_curved_gaming_34",
      input: "related_cyber_mechanical_keyboard",
      audio: "related_pulse_anc_headphones",
      power: "power_140w_multi_dock"
    },
    creator: {
      desk: "desk_oak_executive_160",
      compute: "product_apple_macbook_air_m5_2026",
      monitor: "monitor_dual_4k_creator_setup",
      input: "input_master_precision_combo",
      audio: "audio_hifi_studio_monitors",
      power: "power_140w_multi_dock"
    },
    office: {
      desk: "desk_bamboo_120",
      compute: "1",
      monitor: "monitor_ergonomic_24_fhd",
      input: "input_silent_slim_combo",
      audio: "audio_conference_speakerphone",
      power: "power_65w_travel_dock"
    }
  };

  // Current Workspace State
  let currentSetup = {
    desk: "desk_walnut_140",
    compute: "1",
    monitor: "related_ultrafine_4k_monitor",
    input: "related_cyber_mechanical_keyboard",
    audio: "related_pulse_anc_headphones",
    power: "power_100w_gan_dock"
  };

  let activePickerSlot = null;

  // DOM Elements
  let elSlotsContainer, elCompatibilityCard, elCompatIcon, elCompatTitle, elCompatDesc, elCompatSuggestBox;
  let elTotalMrp, elSavingsAmount, elGstAmount, elPayableAmount, elAddToCartBtn, elShareBtn, elResetBtn;
  let elPickerModal, elPickerTitle, elPickerCategory, elPickerGrid, elClosePickerBtn;
  let elToast;

  function getI18nText(key, fallback) {
    if (typeof window !== "undefined" && window.EM_TRANSLATIONS) {
      const lang = localStorage.getItem("electromart_lang_v1") || "en";
      if (window.EM_TRANSLATIONS[lang] && window.EM_TRANSLATIONS[lang][key]) {
        return window.EM_TRANSLATIONS[lang][key];
      }
    }
    return fallback || key;
  }

  function showToast(msg) {
    if (!elToast) return;
    elToast.textContent = msg;
    elToast.classList.add("show");
    setTimeout(() => {
      elToast.classList.remove("show");
    }, 3200);
  }

  function getComponent(category, id) {
    const list = WORKSPACE_CATALOG[category] || [];
    return list.find((item) => String(item.id) === String(id)) || list[0];
  }

  // ---------------------------------------------------------------------------
  // Render & Sync Visual 2.5D Canvas & Slot Cards
  // ---------------------------------------------------------------------------
  function updateWorkspaceUI() {
    const deskItem = getComponent("desk", currentSetup.desk);
    const computeItem = getComponent("compute", currentSetup.compute);
    const monitorItem = getComponent("monitor", currentSetup.monitor);
    const inputItem = getComponent("input", currentSetup.input);
    const audioItem = getComponent("audio", currentSetup.audio);
    const powerItem = getComponent("power", currentSetup.power);

    // Update 2.5D Canvas Tags & Images
    const elDeskEdge = document.getElementById("labelCanvasDesk");
    if (elDeskEdge && deskItem) elDeskEdge.textContent = deskItem.woodEdge;

    const elImgMonitor = document.getElementById("imgCanvasMonitor");
    const elLabelMonitor = document.getElementById("labelCanvasMonitor");
    if (elImgMonitor && monitorItem) elImgMonitor.src = monitorItem.image;
    if (elLabelMonitor && monitorItem) elLabelMonitor.textContent = monitorItem.tag;

    const elImgCompute = document.getElementById("imgCanvasCompute");
    const elLabelCompute = document.getElementById("labelCanvasCompute");
    if (elImgCompute && computeItem) elImgCompute.src = computeItem.image;
    if (elLabelCompute && computeItem) elLabelCompute.textContent = computeItem.tag;

    const elImgInput = document.getElementById("imgCanvasInput");
    const elLabelInput = document.getElementById("labelCanvasInput");
    if (elImgInput && inputItem) elImgInput.src = inputItem.image;
    if (elLabelInput && inputItem) elLabelInput.textContent = inputItem.tag;

    const elImgAudio = document.getElementById("imgCanvasAudio");
    const elLabelAudio = document.getElementById("labelCanvasAudio");
    if (elImgAudio && audioItem) elImgAudio.src = audioItem.image;
    if (elLabelAudio && audioItem) elLabelAudio.textContent = audioItem.tag;

    const elImgPower = document.getElementById("imgCanvasPower");
    const elLabelPower = document.getElementById("labelCanvasPower");
    if (elImgPower && powerItem) elImgPower.src = powerItem.image;
    if (elLabelPower && powerItem) elLabelPower.textContent = powerItem.tag;

    // Update 3D Showroom Link to match selected compute item
    const elLinkShowroom = document.getElementById("linkTo3dShowroom");
    if (elLinkShowroom && computeItem) {
      elLinkShowroom.href = `showroom.html?productId=${computeItem.id}`;
    }

    // Update Sidebar Slot Cards
    updateSlotCard("desk", deskItem);
    updateSlotCard("compute", computeItem);
    updateSlotCard("monitor", monitorItem);
    updateSlotCard("input", inputItem);
    updateSlotCard("audio", audioItem);
    updateSlotCard("power", powerItem);

    // Evaluate Hardware Compatibility
    evaluateCompatibility(computeItem, monitorItem, powerItem);

    // Calculate Bundle Pricing & 10% Discount
    calculateBundlePricing([deskItem, computeItem, monitorItem, inputItem, audioItem, powerItem]);

    // Persist State
    try {
      localStorage.setItem("electromart_workspace_setup_v1", JSON.stringify(currentSetup));
    } catch (e) {}
  }

  function updateSlotCard(category, item) {
    if (!item) return;
    const catUpper = category.charAt(0).toUpperCase() + category.slice(1);
    const titleEl = document.getElementById(`slot${catUpper}Title`);
    const priceEl = document.getElementById(`slot${catUpper}Price`);
    if (titleEl) titleEl.textContent = item.name;
    if (priceEl) priceEl.textContent = "₹" + item.price.toLocaleString("en-IN");
  }

  // ---------------------------------------------------------------------------
  // Hardware Compatibility Engine (Ports & Wattage Matrix)
  // ---------------------------------------------------------------------------
  function evaluateCompatibility(compute, monitor, power) {
    if (!elCompatibilityCard) return;

    let isCompatible = true;
    let title = getI18nText("compat_all_ok", "100% Compatible Setup");
    let desc = getI18nText(
      "compat_all_ok_desc",
      "All video signals (Thunderbolt 4 / HDMI 2.1) and power headroom (100W GaN PD) are fully matched."
    );
    let showAdapterSuggest = false;

    // Check 1: Gaming Tower with monitor without native DisplayPort input matching
    if (compute.id === "compute_vector_rtx_tower" && monitor.id === "monitor_ergonomic_24_fhd") {
      isCompatible = false;
      title = getI18nText("compat_warn_ports", "Video Port Adapter Recommended");
      desc = "The selected gaming tower requires a DisplayPort to HDMI 2.0 cable to connect with this monitor.";
      showAdapterSuggest = true;
    }
    // Check 2: High power compute with low wattage power dock
    else if ((compute.powerDraw || 65) > (power.outputWattage || 100)) {
      isCompatible = false;
      title = getI18nText("compat_warn_power", "Power Headroom Advisory");
      desc = `The computing core requires ${compute.powerDraw}W peak power, which exceeds the ${power.outputWattage}W dock capacity. Upgrading to a 100W or 140W dock is recommended.`;
      showAdapterSuggest = false;
    }
    // Check 3: MacBook Air with DisplayPort only monitor
    else if (compute.id === "product_apple_macbook_air_m5_2026" && monitor.id === "monitor_curved_gaming_34") {
      isCompatible = false;
      title = getI18nText("compat_warn_ports", "USB-C to DisplayPort Adapter Recommended");
      desc = getI18nText(
        "compat_warn_ports_desc",
        "The selected computer requires a USB-C to DisplayPort cable to drive 4K@144Hz on this monitor."
      );
      showAdapterSuggest = true;
    }

    if (isCompatible) {
      elCompatibilityCard.classList.remove("warning");
      if (elCompatIcon) elCompatIcon.textContent = "✓";
    } else {
      elCompatibilityCard.classList.add("warning");
      if (elCompatIcon) elCompatIcon.textContent = "!";
    }

    if (elCompatTitle) elCompatTitle.textContent = title;
    if (elCompatDesc) elCompatDesc.textContent = desc;
    if (elCompatSuggestBox) {
      elCompatSuggestBox.style.display = showAdapterSuggest ? "block" : "none";
    }
  }

  // ---------------------------------------------------------------------------
  // Bundle Pricing Engine (10% Instant Savings & 18% GST Invoice Breakdown)
  // ---------------------------------------------------------------------------
  function calculateBundlePricing(items) {
    let totalMrp = 0;
    let regularTotal = 0;

    items.forEach((item) => {
      if (!item) return;
      totalMrp += item.mrp || item.price;
      regularTotal += item.price;
    });

    // 10% Instant Discount on complete bundle
    const bundleSavings = Math.round(regularTotal * 0.1);
    const netPayable = regularTotal - bundleSavings;

    // 18% GST calculation (included in gross amount: Tax = Net * 18 / 118)
    const gstAmount = Math.round((netPayable * 18) / 118);

    if (elTotalMrp) elTotalMrp.textContent = "₹" + totalMrp.toLocaleString("en-IN");
    if (elSavingsAmount) elSavingsAmount.textContent = "-₹" + bundleSavings.toLocaleString("en-IN");
    if (elGstAmount) elGstAmount.textContent = "₹" + gstAmount.toLocaleString("en-IN");
    if (elPayableAmount) elPayableAmount.textContent = "₹" + netPayable.toLocaleString("en-IN");
  }

  // ---------------------------------------------------------------------------
  // Presets & Preset Switcher
  // ---------------------------------------------------------------------------
  function setWorkspacePreset(presetKey) {
    const preset = WORKSPACE_PRESETS[presetKey];
    if (!preset) return;

    currentSetup = { ...preset };

    document.querySelectorAll(".btn-preset-pill").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.preset === presetKey);
    });

    updateWorkspaceUI();
    showToast(`✓ Setup switched to ${presetKey.charAt(0).toUpperCase() + presetKey.slice(1)} Preset`);
  }

  // ---------------------------------------------------------------------------
  // Component Slot Picker Modal
  // ---------------------------------------------------------------------------
  function openSlotPicker(slotCategory) {
    activePickerSlot = slotCategory;
    const items = WORKSPACE_CATALOG[slotCategory] || [];

    if (elPickerCategory) {
      elPickerCategory.textContent = `SLOT ${slotCategory.toUpperCase()} SELECTION`;
    }
    if (elPickerTitle) {
      elPickerTitle.textContent = `Choose ${slotCategory.charAt(0).toUpperCase() + slotCategory.slice(1)} for Setup`;
    }

    if (elPickerGrid) {
      elPickerGrid.innerHTML = items
        .map((item) => {
          const isSelected = String(currentSetup[slotCategory]) === String(item.id);
          return `
            <div class="picker-item-card ${isSelected ? "selected" : ""}" data-id="${item.id}">
              <div class="picker-img-holder">
                <img src="${item.image}" alt="${item.name}" />
              </div>
              <h4 class="picker-item-title">${item.title || item.name}</h4>
              <p class="picker-item-desc">${item.desc}</p>
              <div class="picker-price-row">
                <span class="picker-price">₹${item.price.toLocaleString("en-IN")}</span>
                <span class="picker-mrp">₹${item.mrp.toLocaleString("en-IN")}</span>
              </div>
              <button type="button" class="btn-select-picker-item" data-id="${item.id}">
                ${isSelected ? "✓ Selected in Setup" : "Select for Setup"}
              </button>
            </div>
          `;
        })
        .join("");

      // Bind selection buttons
      elPickerGrid.querySelectorAll(".btn-select-picker-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectSlotItem(activePickerSlot, btn.dataset.id);
        });
      });
    }

    if (elPickerModal) {
      if (typeof elPickerModal.showModal === "function") {
        elPickerModal.showModal();
      } else {
        elPickerModal.setAttribute("open", "");
      }
    }
  }

  function closeSlotPicker() {
    activePickerSlot = null;
    if (elPickerModal) {
      if (typeof elPickerModal.close === "function") {
        elPickerModal.close();
      } else {
        elPickerModal.removeAttribute("open");
      }
    }
  }

  function selectSlotItem(slotCategory, itemId) {
    currentSetup[slotCategory] = itemId;
    closeSlotPicker();
    updateWorkspaceUI();
    const item = getComponent(slotCategory, itemId);
    showToast(`✓ Updated ${slotCategory.toUpperCase()}: ${item.name}`);
  }

  // ---------------------------------------------------------------------------
  // 1-Click "Add Complete Setup to Cart" (Schema Sync & Header Count)
  // ---------------------------------------------------------------------------
  function addWorkspaceToCart() {
    const slots = ["desk", "compute", "monitor", "input", "audio", "power"];
    const bundleId = "ws_bundle_" + Date.now();

    let cart = [];
    try {
      const stored = localStorage.getItem("electromart_cart_v1");
      if (stored) cart = JSON.parse(stored);
      if (!Array.isArray(cart)) cart = [];
    } catch (e) {
      cart = [];
    }

    slots.forEach((slotKey) => {
      const item = getComponent(slotKey, currentSetup[slotKey]);
      if (!item) return;

      // Apply 10% bundle discount pricing
      const bundlePrice = Math.round(item.price * 0.9);

      cart.push({
        id: item.id,
        name: item.title || item.name,
        title: item.title || item.name,
        price: bundlePrice,
        originalPrice: item.price,
        mrp: item.mrp || item.price,
        image: item.image,
        quantity: 1,
        bundleId: bundleId,
        bundleDiscount: "10% Off",
        bundleCategory: slotKey
      });
    });

    localStorage.setItem("electromart_cart_v1", JSON.stringify(cart));

    // Update header cart badge
    if (typeof window.updateCartCount === "function") {
      window.updateCartCount();
    }

    const successMsg = getI18nText(
      "bundle_added_success",
      "All workspace items added to Cart with 10% bundle savings!"
    );
    showToast(`✓ ${successMsg}`);
  }

  // ---------------------------------------------------------------------------
  // Share Setup Configuration (URL Query Param Encoding)
  // ---------------------------------------------------------------------------
  function shareWorkspaceSetup() {
    const params = new URLSearchParams();
    Object.keys(currentSetup).forEach((k) => {
      params.set(k, currentSetup[k]);
    });

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("✓ Setup configuration link copied to clipboard!");
      });
    } else {
      showToast("✓ Setup configuration link generated in address bar!");
    }

    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, "", shareUrl);
    }
  }

  // ---------------------------------------------------------------------------
  // Initialization & Event Binding
  // ---------------------------------------------------------------------------
  function initWorkspaceBuilder() {
    elSlotsContainer = document.getElementById("slotsContainer");
    elCompatibilityCard = document.getElementById("compatibilityStatusCard");
    elCompatIcon = document.getElementById("compatIcon");
    elCompatTitle = document.getElementById("compatStatusTitle");
    elCompatDesc = document.getElementById("compatStatusDesc");
    elCompatSuggestBox = document.getElementById("compatSuggestionBox");

    elTotalMrp = document.getElementById("bundleTotalMrp");
    elSavingsAmount = document.getElementById("bundleSavingsAmount");
    elGstAmount = document.getElementById("bundleGstAmount");
    elPayableAmount = document.getElementById("bundlePayableAmount");
    elAddToCartBtn = document.getElementById("addWorkspaceToCartBtn");
    elShareBtn = document.getElementById("shareWorkspaceBtn");
    elResetBtn = document.getElementById("resetWorkspaceBtn");

    elPickerModal = document.getElementById("slotPickerModal");
    elPickerTitle = document.getElementById("pickerModalTitle");
    elPickerCategory = document.getElementById("pickerSlotCategory");
    elPickerGrid = document.getElementById("pickerGrid");
    elClosePickerBtn = document.getElementById("closeSlotPickerBtn");

    elToast = document.getElementById("amzToast");

    // Load saved setup from localStorage if available
    try {
      const saved = localStorage.getItem("electromart_workspace_setup_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.desk && parsed.compute) {
          currentSetup = { ...currentSetup, ...parsed };
        }
      }
    } catch (e) {}

    // Check URL parameters (?computeId=... or ?compute=...)
    const urlParams = new URLSearchParams(window.location.search);
    const computeParam = urlParams.get("computeId") || urlParams.get("compute");
    if (computeParam && WORKSPACE_CATALOG.compute.some((c) => String(c.id) === String(computeParam))) {
      currentSetup.compute = computeParam;
    }
    ["desk", "monitor", "input", "audio", "power"].forEach((k) => {
      const paramVal = urlParams.get(k);
      if (paramVal && WORKSPACE_CATALOG[k].some((i) => String(i.id) === String(paramVal))) {
        currentSetup[k] = paramVal;
      }
    });

    // Preset Buttons
    document.querySelectorAll(".btn-preset-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        setWorkspacePreset(btn.dataset.preset);
      });
    });

    // Change Slot Buttons
    document.querySelectorAll(".btn-change-slot").forEach((btn) => {
      btn.addEventListener("click", () => {
        openSlotPicker(btn.dataset.slot);
      });
    });

    // Canvas slot clicks also open picker
    document.querySelectorAll(".canvas-gear-slot").forEach((slotEl) => {
      slotEl.addEventListener("click", () => {
        const slotKey = slotEl.id.replace("canvasSlot", "").toLowerCase();
        openSlotPicker(slotKey);
      });
    });

    // Modal Close
    if (elClosePickerBtn) {
      elClosePickerBtn.addEventListener("click", closeSlotPicker);
    }
    if (elPickerModal) {
      elPickerModal.addEventListener("click", (e) => {
        if (e.target === elPickerModal) closeSlotPicker();
      });
    }

    // Checkout & Action Buttons
    if (elAddToCartBtn) {
      elAddToCartBtn.addEventListener("click", addWorkspaceToCart);
    }
    if (elShareBtn) {
      elShareBtn.addEventListener("click", shareWorkspaceSetup);
    }
    if (elResetBtn) {
      elResetBtn.addEventListener("click", () => {
        setWorkspacePreset("coder");
      });
    }

    // Initial render
    updateWorkspaceUI();
  }

  // Public Exports
  window.initWorkspaceBuilder = initWorkspaceBuilder;
  window.setWorkspacePreset = setWorkspacePreset;
  window.openSlotPicker = openSlotPicker;
  window.closeSlotPicker = closeSlotPicker;
  window.selectSlotItem = selectSlotItem;
  window.addWorkspaceToCart = addWorkspaceToCart;
  window.shareWorkspaceSetup = shareWorkspaceSetup;

  // Auto-init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorkspaceBuilder);
  } else {
    initWorkspaceBuilder();
  }
})();
