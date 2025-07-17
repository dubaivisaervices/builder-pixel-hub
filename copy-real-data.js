const fs = require("fs");

console.log("🔄 Copying real businesses data...");

try {
  // Read the real data
  const realData = JSON.parse(
    fs.readFileSync("client/data/businesses.json", "utf8"),
  );

  if (realData.businesses && Array.isArray(realData.businesses)) {
    console.log(`📊 Found ${realData.businesses.length} real businesses`);

    // Write just the businesses array
    fs.writeFileSync(
      "public/api/dubai-visa-services.json",
      JSON.stringify(realData.businesses, null, 2),
    );

    // Copy stats if available
    if (realData.stats) {
      fs.writeFileSync(
        "public/api/stats.json",
        JSON.stringify(realData.stats, null, 2),
      );
    }

    // Copy categories if available
    if (realData.categories) {
      fs.writeFileSync(
        "public/api/categories.json",
        JSON.stringify(realData.categories, null, 2),
      );
    }

    console.log("✅ Real businesses data copied successfully!");
  } else {
    throw new Error("No businesses array found");
  }
} catch (error) {
  console.error("❌ Error:", error.message);
}
