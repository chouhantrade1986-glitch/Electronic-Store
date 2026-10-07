const fs = require('fs');
const path = require('path');

const repoRoot = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store');
const targetId = 'product_faadad46-7286-8744-5d9a-1263da26d23c';

// 1. UPDATE backend/src/data/db.json and db.json.bak
['db.json', 'db.json.bak'].forEach(filename => {
  const filePath = path.join(repoRoot, 'backend', 'src', 'data', filename);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updatedCount = 0;
    
    (data.products || []).forEach(p => {
      if (p.id === targetId) {
        p.price = 1399;
        p.listPrice = 1713;
        updatedCount++;
      } else {
        // Normalize bloated accessory prices (>50000)
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        if (p.price > 50000 && (
          cat.includes('battery') || cat.includes('keyboard') || cat.includes('adaptor') || 
          cat.includes('adapter') || cat.includes('cooling') || cat.includes('cartridge') || 
          name.includes('battery') || name.includes('keyboard') || name.includes('adapter') || name.includes('charger')
        )) {
          p.price = Math.round(p.price / 100);
          if (p.listPrice && p.listPrice > 50000) {
            p.listPrice = Math.round(p.listPrice / 100);
          }
          updatedCount++;
        }
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${updatedCount} products in ${filename}`);
  }
});

// 2. ADD / UPDATE IN products-data.js (EM_CATALOG)
const productsDataPath = path.join(repoRoot, 'products-data.js');
let pdContent = fs.readFileSync(productsDataPath, 'utf8');

const kp03CatalogItem = `    {
      id: "product_faadad46-7286-8744-5d9a-1263da26d23c",
      name: "KP03 Laptop Battery For HP 729759-241, HSTNN-DB5P, KP03, KP06, 210 G1 Laptops",
      brand: "HP",
      category: "hp-laptop-battery",
      segment: "b2c",
      price: 1399,
      listPrice: 1713,
      rating: 3.9,
      stock: 10,
      sku: "KP03",
      image: "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
      images: [
        "https://static.wixstatic.com/media/9db3dd_bd739df27b6e419497fe08362b05d225~mv2.jpg",
        "https://static.wixstatic.com/media/9db3dd_445d7faf1d984d6cb94657a8e443f907~mv2.avif",
        "https://static.wixstatic.com/media/9db3dd_7764bf7f25b54f2b97f4d818f74ea3c2~mv2.avif",
        "https://static.wixstatic.com/media/9db3dd_206ae4b7a8dd49719c98d65e8a7055df~mv2.avif",
        "https://static.wixstatic.com/media/9db3dd_9070699515c74bfaac41e69018b6a709~mv2.avif",
        "https://static.wixstatic.com/media/9db3dd_06b13965e785467c92488c2435082e22~mv2.avif",
        "https://static.wixstatic.com/media/9db3dd_30c2742e507d4c9d8d9dc3fece564a6d~mv2.avif"
      ],
      title: {
        en: "KP03 Laptop Battery For HP 729759-241, HSTNN-DB5P, KP03, KP06, 210 G1 Laptops",
        hi: "KP03 के लिए लैपटॉप बैटरी - HP 729759-241, HSTNN-DB5P, KP03, KP06, 210 G1 Laptops",
        ta: "HP 729759-241 க்கான KP03 லேப்டாப் பேட்டரி",
        te: "HP 729759-241 కోసం KP03 ల్యాప్‌టాప్ బ్యాటరీ",
        kn: "HP 729759-241 ಗಾಗಿ KP03 ಲ್ಯಾಪ್‌ಟಾಪ್ ಬ್ಯಾಟರಿ",
        ml: "HP 729759-241 നുള്ള KP03 ലാപ്ടോപ്പ് ബാറ്ററി",
        bn: "HP 729759-241-এর জন্য KP03 ল্যাপটপ ব্যাটারি",
        mr: "HP 729759-241 साठी KP03 लॅपटॉप बॅटरी",
        ur: "HP 729759-241 کے لیے KP03 لیپ ٹاپ بیٹری",
        pa: "HP 729759-241 ਲਈ KP03 ਲੈਪਟਾਪ ਬੈਟਰੀ",
        gu: "HP 729759-241 માટે KP03 લેપટોપ બેટરી"
      },
      description: {
        en: "Quality HP KP03 Battery – 100% compatible with your laptop, identical size, including all safety measures. Highly Compatible HP KP03 Battery for HP 729759-241, HSTNN-DB5P, KP03, KP06, 210 G1 Laptops. Capacity: 2200 mAh, Voltage: 10.8 V, 12-months warranty.",
        hi: "गुणवत्तायुक्त HP KP03 बैटरी – आपके लैपटॉप के साथ 100% संगत, सटीक आकार, सभी सुरक्षा मानकों सहित। HP 729759-241, HSTNN-DB5P, KP03, KP06, 210 G1 लैपटॉप के लिए अत्यधिक संगत। 2200 mAh 10.8 V क्षमता और 12 महीने की वारंटी।"
      },
      aboutSpecs: {
        en: [
          "Capacity: 2200 mAh | Voltage: 10.8 V | Number of cells: 3.",
          "Warranty Details: 12-months warranty.",
          "Quality HP KP03 Battery – 100% compatible with your laptop, identical size, including all safety measures.",
          "Highly Compatible HP KP03 Battery for HP 729759-241, HSTNN-DB5P, KP03, KP06, 210 G1 Laptops."
        ],
        hi: [
          "क्षमता: 2200 mAh | वोल्टेज: 10.8 V | सेल की संख्या: 3",
          "वारंटी विवरण: 12 महीने की वारंटी",
          "गुणवत्तायुक्त HP KP03 बैटरी – आपके लैपटॉप के साथ 100% संगत, सटीक आकार, सभी सुरक्षा मानकों सहित",
          "HP 729759-241, HSTNN-DB5P, KP03, KP06, 210 G1 लैपटॉप के लिए अत्यधिक संगत HP KP03 बैटरी"
        ]
      }
    },`;

if (!pdContent.includes(targetId)) {
  pdContent = pdContent.replace(
    'const EM_CATALOG = [',
    `const EM_CATALOG = [\n${kp03CatalogItem}`
  );
  fs.writeFileSync(productsDataPath, pdContent, 'utf8');
  console.log('Added KP03 battery to products-data.js EM_CATALOG');
} else {
  console.log('KP03 battery already in products-data.js');
}

// 3. UPDATE product-detail.js (mapApiProduct auto-normalization & English brandStoreText fix)
const pdJsPath = path.join(repoRoot, 'product-detail.js');
let pdJs = fs.readFileSync(pdJsPath, 'utf8');

// Safeguard in mapApiProduct:
const oldMapPrice = `    price: Number(product.price || 0),
    listPrice: Number(product.listPrice || product.price || 0),`;

const newMapPrice = `    price: (function() {
      let p = Number(product.price || 0);
      if (p >= 50000 && (category.includes("battery") || category.includes("keyboard") || category.includes("adaptor") || category.includes("adapter") || category.includes("cooling") || category.includes("accessories") || category.includes("accessory") || name.toLowerCase().includes("battery") || name.toLowerCase().includes("keyboard"))) {
        p = Math.round(p / 100);
      }
      return p;
    })(),
    listPrice: (function() {
      let lp = Number(product.listPrice || product.price || 0);
      let p = Number(product.price || 0);
      if (lp >= 50000 && (category.includes("battery") || category.includes("keyboard") || category.includes("adaptor") || category.includes("adapter") || category.includes("cooling") || category.includes("accessories") || category.includes("accessory") || name.toLowerCase().includes("battery") || name.toLowerCase().includes("keyboard"))) {
        lp = Math.round(lp / 100);
      }
      return lp;
    })(),`;

if (pdJs.includes(oldMapPrice)) {
  pdJs = pdJs.replace(oldMapPrice, newMapPrice);
  console.log('Updated mapApiProduct price normalization in product-detail.js');
}

// Natural English Brand Store Text ("Visit the HP Store" instead of "HP Visit the")
const oldBrandStoreLine = `const brandStoreText = \`\${product.brand} \${cleanVisitStore}\`.replace(/:\\s*$/, "").trim();`;
const newBrandStoreLine = `const brandStoreText = (currentLang === "en")
    ? \`Visit the \${product.brand} Store\`
    : \`\${product.brand} \${cleanVisitStore}\`.replace(/:\\s*$/, "").trim();`;

if (pdJs.includes(oldBrandStoreLine)) {
  pdJs = pdJs.replace(oldBrandStoreLine, newBrandStoreLine);
  console.log('Updated brandStoreText English phrasing in product-detail.js');
}

fs.writeFileSync(pdJsPath, pdJs, 'utf8');
console.log('All changes applied successfully!');
