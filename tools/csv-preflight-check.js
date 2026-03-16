const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const options = {
    file: "",
    out: ""
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = String(argv[index] || "").trim();
    if (!token) {
      continue;
    }
    if (token === "--file" && argv[index + 1]) {
      options.file = String(argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (token.startsWith("--file=")) {
      options.file = token.slice("--file=".length).trim();
      continue;
    }
    if (token === "--out" && argv[index + 1]) {
      options.out = String(argv[index + 1] || "").trim();
      index += 1;
      continue;
    }
    if (token.startsWith("--out=")) {
      options.out = token.slice("--out=".length).trim();
      continue;
    }
  }

  return options;
}

function detectCsvDelimiter(text) {
  const sampleLine = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0) || "";
  const commaCount = (sampleLine.match(/,/g) || []).length;
  const semicolonCount = (sampleLine.match(/;/g) || []).length;
  const tabCount = (sampleLine.match(/\t/g) || []).length;
  if (semicolonCount > commaCount && semicolonCount >= tabCount) {
    return ";";
  }
  if (tabCount > commaCount && tabCount > semicolonCount) {
    return "\t";
  }
  return ",";
}

function parseCsvText(csvText) {
  const delimiter = detectCsvDelimiter(csvText);
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      current.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      current.push(field);
      if (current.some((value) => String(value).trim() !== "")) {
        rows.push(current);
      }
      current = [];
      field = "";
      continue;
    }

    field += char;
  }

  current.push(field);
  if (current.some((value) => String(value).trim() !== "")) {
    rows.push(current);
  }

  return rows;
}

function canonicalCsvHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "");
}

function buildHeaderMap(headerRow) {
  const map = new Map();
  (headerRow || []).forEach((header, index) => {
    map.set(canonicalCsvHeader(header), index);
  });
  return map;
}

function csvValueFromRow(row, headerMap, ...candidates) {
  for (const candidate of candidates) {
    const idx = headerMap.get(canonicalCsvHeader(candidate));
    if (typeof idx === "number" && idx >= 0 && idx < row.length) {
      return String(row[idx] || "").trim();
    }
  }
  return "";
}

function parseCsvNumber(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/[, ]+/g, "")
    .replace(/[^\d.-]/g, "");
  if (!normalized) {
    return Number.NaN;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function hasHtmlLikeContent(value) {
  return /<[^>]+>|&(?:nbsp|amp|lt|gt|quot|apos|#\d+);/i.test(String(value || ""));
}

function firstMediaToken(value) {
  return String(value || "")
    .split(/[;|,]+/)
    .map((item) => item.trim())
    .find(Boolean) || "";
}

function looksLikeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return false;
  }
  return /^https?:\/\//i.test(raw) || raw.startsWith("/") || /^data:/i.test(raw) || /^blob:/i.test(raw);
}

function analyzeCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsvText(raw);
  const headerRow = rows[0] || [];
  const headerMap = buildHeaderMap(headerRow);
  const dataRows = rows.slice(1).filter((row) => row.some((value) => String(value || "").trim() !== ""));

  const requiredColumnGroups = [
    ["sku"],
    ["name"],
    ["brand"],
    ["category"],
    ["price"]
  ];

  const missingRequiredColumns = requiredColumnGroups
    .filter((aliases) => !aliases.some((column) => headerMap.has(canonicalCsvHeader(column))))
    .map((aliases) => aliases[0]);

  const rowTypeCounts = new Map();
  let productRows = 0;
  let skippedByType = 0;
  let missingName = 0;
  let missingBrand = 0;
  let missingCategory = 0;
  let invalidPrice = 0;
  let htmlDescription = 0;
  let nonUrlImage = 0;
  let multiImageEntries = 0;
  let duplicateSku = 0;
  const skuMap = new Map();
  const samples = [];

  dataRows.forEach((row, index) => {
    const rowNo = index + 2;
    const fieldType = csvValueFromRow(row, headerMap, "fieldtype", "rowtype").toLowerCase();
    const typeKey = fieldType || "(blank)";
    rowTypeCounts.set(typeKey, Number(rowTypeCounts.get(typeKey) || 0) + 1);
    if (fieldType && fieldType !== "product") {
      skippedByType += 1;
      return;
    }
    productRows += 1;

    const name = csvValueFromRow(row, headerMap, "name");
    const brand = csvValueFromRow(row, headerMap, "brand");
    const category = csvValueFromRow(row, headerMap, "category");
    const price = parseCsvNumber(csvValueFromRow(row, headerMap, "price"));
    const description = csvValueFromRow(row, headerMap, "description");
    const imageField = csvValueFromRow(row, headerMap, "image");
    const sku = csvValueFromRow(row, headerMap, "sku").toUpperCase();

    if (!name) {
      missingName += 1;
    }
    if (!brand) {
      missingBrand += 1;
    }
    if (!category) {
      missingCategory += 1;
    }
    if (!(Number.isFinite(price) && price > 0)) {
      invalidPrice += 1;
    }
    if (hasHtmlLikeContent(description)) {
      htmlDescription += 1;
      if (samples.length < 8) {
        samples.push({
          row: rowNo,
          issue: "description contains HTML",
          name,
          preview: description.slice(0, 90)
        });
      }
    }
    if (/[;|]/.test(imageField)) {
      multiImageEntries += 1;
    }
    const firstImage = firstMediaToken(imageField);
    if (firstImage && !looksLikeUrl(firstImage)) {
      nonUrlImage += 1;
      if (samples.length < 8) {
        samples.push({
          row: rowNo,
          issue: "image is not a valid URL/path",
          name,
          preview: firstImage
        });
      }
    }

    if (sku) {
      if (skuMap.has(sku)) {
        duplicateSku += 1;
        if (samples.length < 8) {
          samples.push({
            row: rowNo,
            issue: "duplicate SKU",
            name,
            preview: sku
          });
        }
      } else {
        skuMap.set(sku, rowNo);
      }
    }
  });

  const rowTypeSummary = Array.from(rowTypeCounts.entries()).sort((a, b) => b[1] - a[1]);

  return {
    file: filePath,
    headers: headerRow.length,
    totalRows: dataRows.length,
    productRows,
    skippedByType,
    missingRequiredColumns,
    rowTypeSummary,
    issues: {
      missingName,
      missingBrand,
      missingCategory,
      invalidPrice,
      htmlDescription,
      nonUrlImage,
      multiImageEntries,
      duplicateSku
    },
    samples
  };
}

function printHumanSummary(report) {
  const issues = report.issues || {};
  console.log("");
  console.log("CSV Preflight Summary");
  console.log("---------------------");
  console.log(`File: ${report.file}`);
  console.log(`Rows: ${report.totalRows} (product rows: ${report.productRows}, skipped non-product: ${report.skippedByType})`);
  console.log(`Headers detected: ${report.headers}`);
  if (report.missingRequiredColumns.length) {
    console.log(`Missing required columns: ${report.missingRequiredColumns.join(", ")}`);
  } else {
    console.log("Missing required columns: none");
  }
  console.log(`HTML in description: ${issues.htmlDescription}`);
  console.log(`Rows with non-URL image values: ${issues.nonUrlImage}`);
  console.log(`Rows with multi-image entries: ${issues.multiImageEntries}`);
  console.log(`Missing brand: ${issues.missingBrand}`);
  console.log(`Missing category: ${issues.missingCategory}`);
  console.log(`Invalid price: ${issues.invalidPrice}`);
  console.log(`Duplicate SKU rows: ${issues.duplicateSku}`);
  if (Array.isArray(report.rowTypeSummary) && report.rowTypeSummary.length) {
    const compact = report.rowTypeSummary.map(([type, count]) => `${type}:${count}`).join(", ");
    console.log(`Row types: ${compact}`);
  }
  if (Array.isArray(report.samples) && report.samples.length) {
    console.log("Sample issues:");
    report.samples.forEach((item) => {
      console.log(`- row ${item.row}: ${item.issue} (${item.preview || item.name || ""})`);
    });
  }
  console.log("");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.file) {
    console.error("Usage: node tools/csv-preflight-check.js --file \"C:\\path\\catalog.csv\" [--out report.json]");
    process.exit(1);
  }
  const fullPath = path.resolve(options.file);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const report = analyzeCsv(fullPath);
  printHumanSummary(report);

  if (options.out) {
    const outPath = path.resolve(options.out);
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Saved report: ${outPath}`);
  }
}

main();
