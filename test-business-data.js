const { getBusinessData } = require("./netlify/functions/businessData.js");

try {
  const data = getBusinessData();
  console.log("✅ Successfully loaded", data.length, "businesses");
  console.log("First business:", data[0]?.name || "No data");
} catch (error) {
  console.log("❌ Error loading business data:", error.message);
}
