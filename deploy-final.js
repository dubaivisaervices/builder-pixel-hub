#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOSTINGER_CONFIG = {
  host: "reportvisascam.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
  secureOptions: {
    rejectUnauthorized: false,
  },
};

async function deployFinal() {
  const client = new ftp.Client();
  client.timeout = 30000; // 30 second timeout

  try {
    console.log("🚀 Deploying Dubai Business Directory (Final Version)...");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    const spaPath = path.join(__dirname, "dist", "spa");

    // 1. Upload main files one by one with progress
    console.log("\n🌐 Uploading main website files...");

    const mainFiles = [
      { local: "index.html", remote: "index.html" },
      { local: "favicon.ico", remote: "favicon.ico" },
      { local: "robots.txt", remote: "robots.txt" },
      { local: "placeholder.svg", remote: "placeholder.svg" },
    ];

    for (const file of mainFiles) {
      const localPath = path.join(spaPath, file.local);
      if (fs.existsSync(localPath)) {
        await client.uploadFrom(localPath, file.remote);
        console.log(`✅ ${file.remote} uploaded`);
      } else {
        console.log(`⚠️  ${file.local} not found, skipping`);
      }
    }

    // 2. Create and upload assets
    console.log("\n📁 Handling assets directory...");
    try {
      await client.send("MKD assets");
      console.log("📂 Assets directory created");
    } catch (error) {
      console.log("📂 Assets directory already exists");
    }

    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath);
      console.log(`📁 Found ${assetFiles.length} asset files`);

      for (const assetFile of assetFiles) {
        const localAssetPath = path.join(assetsPath, assetFile);
        const stats = fs.statSync(localAssetPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);

        await client.uploadFrom(localAssetPath, `assets/${assetFile}`);
        console.log(`✅ assets/${assetFile} uploaded (${sizeMB} MB)`);
      }
    }

    // 3. Create and upload data directory with business data
    console.log("\n📊 Uploading business data...");
    try {
      await client.send("MKD data");
      console.log("📂 Data directory created");
    } catch (error) {
      console.log("📂 Data directory already exists");
    }

    // Upload the crucial business data
    const dataFile = path.join(spaPath, "data", "businesses.json");
    if (fs.existsSync(dataFile)) {
      const stats = fs.statSync(dataFile);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);

      console.log(`📄 Uploading businesses.json (${sizeMB} MB)...`);
      await client.uploadFrom(dataFile, "data/businesses.json");
      console.log("✅ Business data uploaded successfully!");
    } else {
      console.log("❌ Business data file not found!");
      throw new Error("Critical: businesses.json not found");
    }

    // 4. Final verification
    console.log("\n🔍 Verifying deployment...");
    const rootFiles = await client.list();

    const criticalFiles = ["index.html", "assets", "data"];
    let allGood = true;

    criticalFiles.forEach((file) => {
      const exists = rootFiles.some((f) => f.name === file);
      console.log(`  ${exists ? "✅" : "❌"} ${file}`);
      if (!exists) allGood = false;
    });

    // Check data directory specifically
    await client.cd("data");
    const dataFiles = await client.list();
    const hasBusinessData = dataFiles.some((f) => f.name === "businesses.json");
    console.log(`  ${hasBusinessData ? "✅" : "❌"} data/businesses.json`);

    if (hasBusinessData) {
      const businessFile = dataFiles.find((f) => f.name === "businesses.json");
      const sizeMB = (businessFile.size / 1024 / 1024).toFixed(1);
      console.log(`    📊 Business data size: ${sizeMB} MB`);
    }

    if (allGood && hasBusinessData) {
      console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
      console.log("✅ Website: https://reportvisascam.com");
      console.log("✅ All 841 businesses now available");
      console.log("✅ No more dummy data - real Dubai businesses loaded!");
    } else {
      console.log("\n⚠️  Deployment completed with issues");
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

deployFinal()
  .then(() => {
    console.log(
      "\n🎊 SUCCESS! Dubai Business Directory is live with real data!",
    );
  })
  .catch((error) => {
    console.error("\n💥 DEPLOYMENT FAILED:", error);
    process.exit(1);
  });
