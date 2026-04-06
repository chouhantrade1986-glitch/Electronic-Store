const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "data", "db.json");

function readDbFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return {
      ok: true,
      data: JSON.parse(raw)
    };
  } catch (error) {
    return {
      ok: false,
      error
    };
  }
}

console.log("Testing readDbFile on", dbPath);
const result = readDbFile(dbPath);
console.log("Result:", result);