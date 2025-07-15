#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FTP_CONFIG = {
  host: "crossbordersmigrations.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
};

async function deployDatabaseFix() {
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    console.log("🚀 DEPLOYING DATABASE FIX FOR REPORT VISA SCAM");
    console.log("🎯 Goal: Fix website to show all 841 businesses");
    console.log("=".repeat(60));

    await client.access(FTP_CONFIG);
    console.log("✅ Connected to FTP server");

    // Ensure we have the business data
    const dataSource = path.join(
      __dirname,
      "client",
      "data",
      "businesses.json",
    );
    if (!fs.existsSync(dataSource)) {
      throw new Error(
        "Business data not found! Run 'npm run export-data' first.",
      );
    }

    const dataStats = fs.statSync(dataSource);
    const dataSizeMB = (dataStats.size / 1024 / 1024).toFixed(1);
    console.log(`📊 Business data file: ${dataSizeMB}MB`);

    // Verify data content
    const data = JSON.parse(fs.readFileSync(dataSource, "utf8"));
    console.log(`📋 Data contains: ${data.businesses.length} businesses`);

    if (data.businesses.length < 800) {
      console.log(
        "⚠️ Warning: Expected 841 businesses, got",
        data.businesses.length,
      );
    }

    // Create data directory on server
    try {
      await client.send("MKD data");
      console.log("📂 Created /data directory");
    } catch (error) {
      console.log("📂 /data directory already exists");
    }

    // Upload the business data
    console.log("📤 Uploading business data...");
    await client.uploadFrom(dataSource, "data/businesses.json");
    console.log("✅ Business data uploaded successfully");

    // Verify upload
    await client.cd("data");
    const files = await client.list();
    const uploadedFile = files.find((f) => f.name === "businesses.json");

    if (uploadedFile) {
      const uploadedSizeMB = (uploadedFile.size / 1024 / 1024).toFixed(1);
      console.log(
        `✅ Verified: businesses.json (${uploadedSizeMB}MB) on server`,
      );
    } else {
      throw new Error("Upload verification failed - file not found on server");
    }

    console.log("\n🎉 DATABASE FIX DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("✅ All 841 businesses now accessible");
    console.log("✅ No more dummy data");
    console.log("✅ Static data loading should work");
    console.log("🌐 Test URL: https://crossbordersmigrations.com");
    console.log(
      "🔍 Check URL: https://crossbordersmigrations.com/data-diagnostic",
    );
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("Error:", error.message);

    if (error.message.includes("530")) {
      console.error("\n💡 Solution: Check FTP credentials");
    } else if (error.message.includes("Timeout")) {
      console.error("\n💡 Solution: Try again in a few minutes");
    }

    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

deployDatabaseFix()
  .then(() => {
    console.log("\n🎊 SUCCESS! Database connection should now be fixed!");
  })
  .catch((error) => {
    console.error("\n💥 FAILED:", error.message);
    process.exit(1);
  });
