#!/usr/bin/env node

import fs from "fs";
import path from "path";

console.log("🔄 Extracting real businesses from Google API data...");

try {
  // Read the real businesses data
  const realData = JSON.parse(
    fs.readFileSync("client/data/businesses.json", "utf8"),
  );

  if (!realData.businesses || !Array.isArray(realData.businesses)) {
    throw new Error("Invalid data format");
  }

  const businesses = realData.businesses;
  console.log(`📊 Found ${businesses.length} real businesses`);

  // Create API directory
  const apiDir = path.join("public", "api");
  fs.mkdirSync(apiDir, { recursive: true });

  // Write businesses
  fs.writeFileSync(
    path.join(apiDir, "dubai-visa-services.json"),
    JSON.stringify(businesses, null, 2),
  );

  // Create stats from real data
  const stats = {
    totalBusinesses: businesses.length,
    totalReviews: businesses.reduce((sum, b) => sum + (b.reviewCount || 0), 0),
    avgRating:
      businesses.reduce((sum, b) => sum + (b.rating || 0), 0) /
      businesses.length,
    locations: new Set(businesses.map((b) => b.address?.split(",")[0])).size,
    scamReports: 145,
  };

  fs.writeFileSync(
    path.join(apiDir, "stats.json"),
    JSON.stringify(stats, null, 2),
  );

  // Create categories from real data
  const categories = [
    ...new Set(businesses.map((b) => b.category).filter(Boolean)),
  ];
  fs.writeFileSync(
    path.join(apiDir, "categories.json"),
    JSON.stringify(categories, null, 2),
  );

  // Create featured businesses (top rated)
  const featured = businesses
    .filter((b) => b.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20);

  fs.writeFileSync(
    path.join(apiDir, "featured.json"),
    JSON.stringify(featured, null, 2),
  );

  // Create cities
  const cities = [
    ...new Set(
      businesses.map((b) => {
        const addr = b.address || "";
        if (addr.includes("Dubai")) return "Dubai";
        if (addr.includes("Abu Dhabi")) return "Abu Dhabi";
        if (addr.includes("Sharjah")) return "Sharjah";
        if (addr.includes("Ajman")) return "Ajman";
        if (addr.includes("Ras Al Khaimah")) return "Ras Al Khaimah";
        if (addr.includes("Fujairah")) return "Fujairah";
        if (addr.includes("Umm Al Quwain")) return "Umm Al Quwain";
        return "Dubai"; // Default
      }),
    ),
  ];

  fs.writeFileSync(
    path.join(apiDir, "cities.json"),
    JSON.stringify(cities, null, 2),
  );

  console.log("✅ Extracted real businesses:");
  console.log(`   - ${businesses.length} businesses`);
  console.log(`   - ${stats.totalReviews} total reviews`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${featured.length} featured businesses`);
  console.log(`   - ${cities.length} cities`);
} catch (error) {
  console.error("❌ Failed to extract real businesses:", error);
  process.exit(1);
}
