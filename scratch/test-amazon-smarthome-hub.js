const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const projectDir = path.join(__dirname, "..");
const languages = ["en", "hi", "ta", "te", "kn", "ml", "bn", "mr", "ur", "pa", "gu"];
const requiredFiles = ["smarthome.html", "smarthome.css", "smarthome.js"];
const requiredIds = [
  "smartHomeHub",
  "smartHomeRoomTabs",
  "smartHomeVisualizer",
  "smartHomeEcosystemFilters",
  "smartHomeProductGrid",
  "smartHomeAssistant",
  "smartHomeRoutineGrid",
  "smartHomeCompatibilityStatus",
  "smartHomeBundleSummary",
  "smartHomeAddSetupBtn",
  "smartHomeSetupModal",
  "smartHomeEcosystemSelect",
  "smartHomeCompatibilityResult"
];
const i18nKeys = [
  "smarthome_title",
  "smarthome_subtitle",
  "smarthome_room_living",
  "smarthome_room_bedroom",
  "smarthome_room_kitchen",
  "smarthome_room_office",
  "smarthome_ecosystem_filter",
  "smarthome_assistant_title",
  "smarthome_routine_arrive",
  "smarthome_routine_night",
  "smarthome_routine_energy",
  "smarthome_routine_movie",
  "smarthome_bundle_title",
  "smarthome_add_setup",
  "smarthome_compatibility_title",
  "smarthome_compatibility_check",
  "smarthome_compatibility_compatible",
  "smarthome_compatibility_incompatible",
  "smarthome_no_products"
];

console.log("==================================================");
console.log("TEST SUITE: ElectroMart Smart Home & IoT Hub (Phase 36)");
console.log("==================================================");

requiredFiles.forEach((fileName) => {
  assert(fs.existsSync(path.join(projectDir, fileName)), `${fileName} must exist`);
});

const html = fs.readFileSync(path.join(projectDir, "smarthome.html"), "utf8");
const css = fs.readFileSync(path.join(projectDir, "smarthome.css"), "utf8");
const js = fs.readFileSync(path.join(projectDir, "smarthome.js"), "utf8");
const pdpHtml = fs.readFileSync(path.join(projectDir, "product-detail.html"), "utf8");
const pdpJs = fs.readFileSync(path.join(projectDir, "product-detail.js"), "utf8");
const translationsCode = fs.readFileSync(path.join(projectDir, "translations.js"), "utf8");

requiredIds.forEach((id) => {
  assert(html.includes(`id="${id}"`), `smarthome.html must contain #${id}`);
});
assert(html.includes('data-smart-room="living"'), "Smart home room controls must expose room data attributes");
assert(html.includes('data-smart-ecosystem="matter"'), "Smart home ecosystem controls must expose ecosystem data attributes");
assert(html.includes("translations.js"), "smarthome.html must load translations.js");
assert(html.includes("products-data.js"), "smarthome.html must load products-data.js");
assert(html.includes("universal-i18n-bus.js"), "smarthome.html must load universal-i18n-bus.js");
assert(html.includes("smarthome.js"), "smarthome.html must load its page controller");
assert(css.includes("smart-home-visualizer"), "smarthome.css must style the visualizer");
assert(js.includes("electromart_smarthome_setup_v1"), "smarthome.js must persist bounded setup state");
assert(js.includes("electromart_smarthome_preferences_v1"), "smarthome.js must persist preferences");
assert(js.includes("electromart_smarthome_routines_v1"), "smarthome.js must persist routines");
assert(js.includes("getSmartHomeRecommendations"), "smarthome.js must expose deterministic recommendations");
assert(js.includes("calculateSmartHomeCompatibility"), "smarthome.js must expose compatibility checks");
assert(js.includes("calculateEnergyEstimate"), "smarthome.js must expose energy estimates");
assert(js.includes("smartHomeSetup"), "smarthome.js must attach setup metadata to cart lines");

[
  "pdpSmartHomeCompatibility",
  "pdpSmartHomeCompatibilityBtn",
  "pdpSmartHomeCompatibilityModal",
  "pdpSmartHomeEcosystemSelect",
  "pdpSmartHomeCompatibilityResult"
].forEach((id) => {
  assert(pdpHtml.includes(`id="${id}"`), `product-detail.html must contain #${id}`);
});
assert(pdpHtml.includes("smarthome.html"), "PDP must link to the smart home hub");
assert(pdpJs.includes("renderPdpSmartHomeCompatibility"), "product-detail.js must control smart home compatibility");
assert(pdpJs.includes("isSmartHomeEligible"), "product-detail.js must gate compatibility to eligible products");

const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    createElement: () => ({})
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(sandbox);
vm.runInContext(translationsCode, sandbox);
const translations = sandbox.window.EM_TRANSLATIONS;
assert(translations, "EM_TRANSLATIONS must exist");
languages.forEach((language) => {
  assert(translations[language], `Language ${language} must exist`);
  i18nKeys.forEach((key) => {
    assert(translations[language][key], `Key ${key} must exist in ${language}`);
  });
});

const customerFacingSources = [html, css, js, pdpHtml.match(/<section id="pdpSmartHomeCompatibility"[\s\S]*?<\/section>/i)?.[0] || ""];
customerFacingSources.forEach((source, index) => {
  const visibleSource = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\b(?:src|href|class|id)=(['"])[^'"]*\1/gi, "")
    .replace(/<[^>]+>/g, " ");
  assert(!/Amazon|अमेज़न/i.test(visibleSource), `Customer-facing source ${index + 1} must remain brand-safe`);
});

console.log("PASS: Phase 36 Smart Home & IoT contract verified.");
