#!/usr/bin/env node

import fs from "fs";
import path from "path";

console.log("🔧 Running quick fix for database connection issue...");

// Check if business data exists
const dataPath = "./client/data/businesses.json";
if (fs.existsSync(dataPath)) {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(
    `✅ Found business data: ${data.businesses?.length || 0} businesses`,
  );

  // Ensure data is in build directory
  const buildDataDir = "./dist/spa/data";
  if (!fs.existsSync(buildDataDir)) {
    fs.mkdirSync(buildDataDir, { recursive: true });
  }

  fs.copyFileSync(dataPath, path.join(buildDataDir, "businesses.json"));
  console.log("✅ Copied business data to build directory");

  console.log("🎉 Quick fix completed - data should be accessible on website");
} else {
  console.log("❌ Business data file not found");
  console.log("📋 Running data export...");

  // Run export
  import("./export-businesses.mjs").then(() => {
    console.log("✅ Data export completed");
  });
}
