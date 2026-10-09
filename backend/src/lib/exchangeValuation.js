const EXCHANGE_CATALOG = {
  smartphones: [
    ["Apple", "Apple iPhone 14 Pro Max (128 GB)", 24000],
    ["Apple", "Apple iPhone 14 Pro (128 GB)", 21000],
    ["Apple", "Apple iPhone 13 (128 GB)", 14000],
    ["Apple", "Apple iPhone 12 (64 GB)", 10500],
    ["Apple", "Apple iPhone 11 (64 GB)", 7500],
    ["Samsung", "Samsung Galaxy S23 Ultra 5G", 22000],
    ["Samsung", "Samsung Galaxy S22 5G", 13500],
    ["Samsung", "Samsung Galaxy Note 20", 9000],
    ["Samsung", "Samsung Galaxy A54 5G", 6500],
    ["OnePlus", "OnePlus 11 5G (16GB RAM)", 15000],
    ["OnePlus", "OnePlus 10 Pro 5G", 11000],
    ["OnePlus", "OnePlus Nord CE 3 5G", 5500],
    ["Xiaomi", "Xiaomi 13 Pro 5G", 14000],
    ["Xiaomi", "Redmi Note 12 Pro 5G", 5000]
  ],
  laptops: [
    ["Apple", "Apple MacBook Pro 14 M2 Pro", 24500],
    ["Apple", "Apple MacBook Air 13 M1", 18000],
    ["Apple", "Apple MacBook Pro 16 Intel Core i7", 12000],
    ["Dell", "Dell XPS 15 OLED Core i7", 19000],
    ["Dell", "Dell Inspiron 15 Core i5", 9500],
    ["HP", "HP Spectre x360 2-in-1 Touch", 18500],
    ["HP", "HP Pavilion 15 Gaming Core i5", 8500],
    ["Lenovo", "Lenovo ThinkPad X1 Carbon Gen 9", 19500],
    ["Lenovo", "Lenovo IdeaPad Slim 3 Core i3", 7500],
    ["Asus", "Asus ROG Zephyrus G14 Ryzen 7", 17000],
    ["Asus", "Asus ZenBook 14 OLED", 11000]
  ],
  tablets: [
    ["Apple", "Apple iPad Pro 11-inch M1 (128 GB)", 16000],
    ["Apple", "Apple iPad Air 5th Gen (64 GB)", 12500],
    ["Apple", "Apple iPad 10th Gen (64 GB)", 8000],
    ["Samsung", "Samsung Galaxy Tab S8 11-inch", 13000],
    ["Samsung", "Samsung Galaxy Tab A8 10.5", 4500]
  ],
  smartwatches: [
    ["Apple", "Apple Watch Series 8 GPS 45mm", 9000],
    ["Apple", "Apple Watch SE GPS 44mm", 5000],
    ["Samsung", "Samsung Galaxy Watch 5 Pro", 7500],
    ["Samsung", "Samsung Galaxy Watch 4 Classic", 4000]
  ],
  audio: [
    ["Sony", "Sony WH-1000XM5 Wireless ANC", 8000],
    ["Sony", "Sony WH-1000XM4 Wireless ANC", 5500],
    ["Bose", "Bose QuietComfort 45 Headphones", 7000],
    ["Apple", "Apple AirPods Max Wireless", 9500],
    ["Apple", "Apple AirPods Pro 2nd Gen", 5500]
  ]
};

const VALID_POWER_STATES = new Set(["yes", "no"]);
const VALID_SCREEN_STATES = new Set(["flawless", "minor", "heavy", "cracked"]);
const VALID_BODY_STATES = new Set(["flawless", "minor", "heavy"]);

function calculateExchangeValuation({ category, brand, modelName, condition = {} } = {}) {
  const normalizedCategory = String(category || "").trim().toLowerCase();
  const models = EXCHANGE_CATALOG[normalizedCategory];
  const normalizedBrand = String(brand || "").trim();
  const normalizedModelName = String(modelName || "").trim();
  const model = models && models.find((entry) => entry[0] === normalizedBrand && entry[1] === normalizedModelName);

  if (!model) {
    return { ok: false, message: "Choose a supported exchange device model." };
  }

  const power = String(condition.power || "").trim().toLowerCase();
  const screen = String(condition.screen || "").trim().toLowerCase();
  const body = String(condition.body || "").trim().toLowerCase();
  if (!VALID_POWER_STATES.has(power) || !VALID_SCREEN_STATES.has(screen) || !VALID_BODY_STATES.has(body)) {
    return { ok: false, message: "Choose valid power, screen, and body condition values." };
  }

  const baseValue = model[2];
  let deduction = 0;
  if (power === "no") deduction += baseValue * 0.5;
  if (screen === "minor") deduction += baseValue * 0.12;
  if (screen === "heavy") deduction += baseValue * 0.28;
  if (screen === "cracked") deduction += baseValue * 0.45;
  if (body === "minor") deduction += baseValue * 0.08;
  if (body === "heavy") deduction += baseValue * 0.22;

  const bonus = power === "yes" && screen !== "cracked" ? 1000 : 0;
  const discountAmount = Math.min(25000, Math.max(500, Math.round(baseValue - deduction + bonus)));
  return {
    ok: true,
    category: normalizedCategory,
    brand: normalizedBrand,
    modelName: normalizedModelName,
    baseValue,
    deduction: Math.round(deduction),
    bonus,
    discountAmount
  };
}

module.exports = { calculateExchangeValuation };