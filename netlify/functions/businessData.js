// This file exports the business data as a JavaScript module
// for reliable import in Netlify Functions

const fs = require("fs");
const path = require("path");

let businessData = null;

function loadBusinessData() {
  if (businessData) {
    return businessData;
  }

  try {
    // Try to load from the copied file
    const dataPath = path.join(__dirname, "client", "data", "businesses.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const parsed = JSON.parse(rawData);

    if (parsed && parsed.businesses && Array.isArray(parsed.businesses)) {
      businessData = parsed.businesses;
      console.log(`✅ Loaded ${businessData.length} businesses from JSON file`);
      return businessData;
    }
  } catch (error) {
    console.log(`❌ Failed to load business data: ${error.message}`);
  }

  // Return empty array if loading fails
  return [];
}

module.exports = {
  getBusinessData: loadBusinessData,
};
