const COMPONENTS = {
  cpu: [
    { id: "cpu-intel-i5", name: "Intel Core i5 14400F", socket: "LGA1700", tdp: 65, price: 219 },
    { id: "cpu-intel-i7", name: "Intel Core i7 14700K", socket: "LGA1700", tdp: 125, price: 429 },
    { id: "cpu-amd-r5", name: "AMD Ryzen 5 7600", socket: "AM5", tdp: 65, price: 229 },
    { id: "cpu-amd-r7", name: "AMD Ryzen 7 7800X3D", socket: "AM5", tdp: 120, price: 399 }
  ],
  motherboard: [
    { id: "mb-b760", name: "B760 DDR5 Motherboard", socket: "LGA1700", maxRam: 128, price: 179 },
    { id: "mb-z790", name: "Z790 Performance Board", socket: "LGA1700", maxRam: 192, price: 289 },
    { id: "mb-b650", name: "B650 AM5 Motherboard", socket: "AM5", maxRam: 128, price: 189 },
    { id: "mb-x670", name: "X670 Creator Board", socket: "AM5", maxRam: 192, price: 329 }
  ],
  gpu: [
    { id: "gpu-4060", name: "NVIDIA RTX 4060", power: 115, price: 329 },
    { id: "gpu-4070", name: "NVIDIA RTX 4070 Super", power: 220, price: 589 },
    { id: "gpu-7800xt", name: "AMD RX 7800 XT", power: 263, price: 519 },
    { id: "gpu-7900xt", name: "AMD RX 7900 XT", power: 315, price: 749 }
  ],
  ram: [
    { id: "ram-16", name: "16GB DDR5 Kit", size: 16, price: 69 },
    { id: "ram-32", name: "32GB DDR5 Kit", size: 32, price: 129 },
    { id: "ram-64", name: "64GB DDR5 Kit", size: 64, price: 249 }
  ],
  storage: [
    { id: "ssd-1tb", name: "1TB NVMe SSD", size: 1, price: 89 },
    { id: "ssd-2tb", name: "2TB NVMe SSD", size: 2, price: 159 },
    { id: "ssd-4tb", name: "4TB NVMe SSD", size: 4, price: 329 }
  ],
  psu: [
    { id: "psu-650", name: "650W 80+ Gold PSU", watt: 650, price: 99 },
    { id: "psu-750", name: "750W 80+ Gold PSU", watt: 750, price: 129 },
    { id: "psu-850", name: "850W 80+ Platinum PSU", watt: 850, price: 179 }
  ],
  case: [
    { id: "case-mid", name: "ATX Mid Tower", size: "ATX", price: 89 },
    { id: "case-airflow", name: "Airflow Gaming Tower", size: "ATX", price: 119 },
    { id: "case-compact", name: "Compact mATX Tower", size: "mATX", price: 79 }
  ]
};

const PART_ORDER = [
  { key: "cpu", label: "CPU" },
  { key: "motherboard", label: "Motherboard" },
  { key: "gpu", label: "GPU" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "psu", label: "Power Supply" },
  { key: "case", label: "Case" }
];

const state = {
  selections: {}
};

const cpuSelect = document.getElementById("cpuSelect");
const motherboardSelect = document.getElementById("motherboardSelect");
const gpuSelect = document.getElementById("gpuSelect");
const ramSelect = document.getElementById("ramSelect");
const storageSelect = document.getElementById("storageSelect");
const psuSelect = document.getElementById("psuSelect");
const caseSelect = document.getElementById("caseSelect");
const summaryList = document.getElementById("summaryList");
const totalPrice = document.getElementById("totalPrice");
const buildTier = document.getElementById("buildTier");
const compatibilityBox = document.getElementById("compatibilityBox");
const copyBuildBtn = document.getElementById("copyBuildBtn");
const resetBuildBtn = document.getElementById("resetBuildBtn");
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

const selectMap = {
  cpu: cpuSelect,
  motherboard: motherboardSelect,
  gpu: gpuSelect,
  ram: ramSelect,
  storage: storageSelect,
  psu: psuSelect,
  case: caseSelect
};

function money(value) {
  return inrFormatter.format(Number(value || 0));
}

function getItem(group, id) {
  return COMPONENTS[group].find((item) => item.id === id) || null;
}

function populateSelect(group, element) {
  const items = COMPONENTS[group];
  element.innerHTML = items
    .map((item) => `<option value="${item.id}">${item.name} - ${money(item.price)}</option>`)
    .join("");
  state.selections[group] = items[0].id;
}

function getSelectedParts() {
  const selected = {};
  PART_ORDER.forEach(({ key }) => {
    selected[key] = getItem(key, state.selections[key]);
  });
  return selected;
}

function estimateWattage(parts) {
  const cpu = Number(parts.cpu?.tdp || 0);
  const gpu = Number(parts.gpu?.power || 0);
  const base = 130;
  return cpu + gpu + base;
}

function getBuildTier(total) {
  if (total < 1200) {
    return "Entry";
  }
  if (total < 2000) {
    return "Mainstream";
  }
  return "Enthusiast";
}

function evaluateCompatibility(parts) {
  if (!parts.cpu || !parts.motherboard || !parts.ram || !parts.psu) {
    return { level: "warn", message: "Select all required parts." };
  }

  if (parts.cpu.socket !== parts.motherboard.socket) {
    return { level: "bad", message: "CPU and motherboard socket do not match." };
  }

  if (Number(parts.ram.size || 0) > Number(parts.motherboard.maxRam || 0)) {
    return { level: "bad", message: "Selected RAM exceeds motherboard capacity." };
  }

  const estimatedWattage = estimateWattage(parts);
  const psuWatt = Number(parts.psu.watt || 0);

  if (psuWatt < estimatedWattage) {
    return { level: "bad", message: `PSU too low. Estimated load ${estimatedWattage}W.` };
  }

  if (psuWatt < estimatedWattage + 120) {
    return { level: "warn", message: `Build works, but recommended headroom is low (${estimatedWattage}W load).` };
  }

  return { level: "ok", message: `Compatible build. Estimated load ${estimatedWattage}W with safe headroom.` };
}

function renderSummary(parts) {
  const rows = PART_ORDER.map(({ key, label }) => {
    const item = parts[key];
    return `<li><span>${label}</span><strong>${item ? item.name : "Not selected"} ${item ? `(${money(item.price)})` : ""}</strong></li>`;
  });
  summaryList.innerHTML = rows.join("");

  const total = PART_ORDER.reduce((sum, { key }) => sum + Number(parts[key]?.price || 0), 0);
  totalPrice.textContent = money(total);
  buildTier.textContent = `Tier: ${getBuildTier(total)}`;

  const compatibility = evaluateCompatibility(parts);
  compatibilityBox.className = `compatibility ${compatibility.level}`;
  compatibilityBox.textContent = compatibility.message;
}

function buildText(parts) {
  const total = PART_ORDER.reduce((sum, { key }) => sum + Number(parts[key]?.price || 0), 0);
  const lines = [
    "ElectroMart PC Build",
    "---------------------"
  ];

  PART_ORDER.forEach(({ key, label }) => {
    lines.push(`${label}: ${parts[key]?.name || "N/A"}`);
  });

  lines.push(`Total: ${money(total)}`);
  lines.push(`Tier: ${getBuildTier(total)}`);
  lines.push(`Compatibility: ${evaluateCompatibility(parts).message}`);
  return lines.join("\n");
}

function refresh() {
  renderSummary(getSelectedParts());
}

Object.entries(selectMap).forEach(([key, element]) => {
  populateSelect(key, element);
  element.addEventListener("change", () => {
    state.selections[key] = element.value;
    refresh();
  });
});

copyBuildBtn.addEventListener("click", async () => {
  const text = buildText(getSelectedParts());
  try {
    await navigator.clipboard.writeText(text);
    copyBuildBtn.textContent = "Copied";
    setTimeout(() => {
      copyBuildBtn.textContent = "Copy Build";
    }, 1200);
  } catch (error) {
    copyBuildBtn.textContent = "Copy failed";
    setTimeout(() => {
      copyBuildBtn.textContent = "Copy Build";
    }, 1200);
  }
});

resetBuildBtn.addEventListener("click", () => {
  Object.entries(selectMap).forEach(([key, element]) => {
    element.selectedIndex = 0;
    state.selections[key] = element.value;
  });
  refresh();
});

refresh();
