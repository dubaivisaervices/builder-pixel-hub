#!/usr/bin/env node

/**
 * Import All Businesses to Database
 * This script imports all 957 businesses (841 original + 116 newly fetched) to the database
 */

import fetch from "node-fetch";
import fs from "fs";

const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error("❌ NEON_DATABASE_URL environment variable not set");
  process.exit(1);
}

console.log("🔄 Starting business import to database...");
console.log("📊 Expected: 957 total businesses (841 + 116 newly fetched)");

async function importBusinesses() {
  try {
    // Test database connection first
    console.log("🔍 Testing database connection...");
    const testResponse = await fetch(
      "https://reportvisascam.com/.netlify/functions/test-connection",
    );
    const testResult = await testResponse.json();

    if (!testResult.success) {
      console.error("❌ Database connection failed:", testResult);
      return;
    }

    console.log("✅ Database connection successful");

    // Load businesses from JSON file
    console.log("📄 Loading businesses from complete JSON file...");
    let businesses = [];

    try {
      const response = await fetch(
        "https://reportvisascam.com/api/complete-businesses.json",
      );
      const data = await response.json();
      businesses = data.businesses || [];
      console.log(`📊 Loaded ${businesses.length} businesses from JSON`);
    } catch (error) {
      console.error("❌ Failed to load businesses from JSON:", error.message);
      return;
    }

    if (businesses.length === 0) {
      console.error("❌ No businesses found in JSON file");
      return;
    }

    // Import businesses to database in batches
    console.log("🔄 Starting database import...");
    const batchSize = 10;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      try {
        const importResponse = await fetch(
          "https://reportvisascam.com/.netlify/functions/database-businesses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "import_batch",
              businesses: batch,
            }),
          },
        );

        if (importResponse.ok) {
          imported += batch.length;
          console.log(
            `✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${imported}/${businesses.length} businesses`,
          );
        } else {
          const errorData = await importResponse.json();
          console.error(
            `❌ Batch ${Math.floor(i / batchSize) + 1} failed:`,
            errorData.error,
          );
          errors += batch.length;
        }
      } catch (error) {
        console.error(
          `❌ Batch ${Math.floor(i / batchSize) + 1} error:`,
          error.message,
        );
        errors += batch.length;
      }

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\n📊 Import Summary:");
    console.log(`✅ Successfully imported: ${imported} businesses`);
    console.log(`❌ Failed to import: ${errors} businesses`);
    console.log(`📈 Total processed: ${imported + errors} businesses`);

    if (imported > 0) {
      // Verify the import
      console.log("\n🔍 Verifying database content...");
      const statsResponse = await fetch(
        "https://reportvisascam.com/.netlify/functions/database-stats",
      );

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log(
          `📊 Database now contains: ${stats.totalBusinesses} businesses`,
        );
        console.log(`📈 Expected around: 957 businesses (841 + 116 new)`);

        if (stats.totalBusinesses >= 950) {
          console.log("🎉 SUCCESS! All businesses imported successfully");
        } else {
          console.log("⚠️ Some businesses may be missing. Check logs above.");
        }
      }
    }
  } catch (error) {
    console.error("❌ Import failed:", error.message);
  }
}

// Run the import
importBusinesses();
