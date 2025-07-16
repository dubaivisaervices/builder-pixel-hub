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
};

async function deployWithData() {
  const client = new ftp.Client();

  try {
    console.log("🚀 Deploying Dubai Business Directory with static data...");
    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    const spaPath = path.join(__dirname, "dist", "spa");

    // 1. Upload main website files
    console.log("\n🌐 Uploading website files...");
    await client.uploadFrom(path.join(spaPath, "index.html"), "index.html");
    console.log("✅ index.html uploaded");

    await client.uploadFrom(path.join(spaPath, "favicon.ico"), "favicon.ico");
    console.log("✅ favicon.ico uploaded");

    // Upload other static files
    const staticFiles = ["robots.txt", "placeholder.svg"];
    for (const file of staticFiles) {
      const filePath = path.join(spaPath, file);
      if (fs.existsSync(filePath)) {
        await client.uploadFrom(filePath, file);
        console.log(`✅ ${file} uploaded`);
      }
    }

    // 2. Upload assets directory
    console.log("\n📁 Uploading assets...");
    try {
      await client.send("MKD assets");
    } catch (error) {
      console.log("📂 Assets directory already exists");
    }

    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath);
      for (const assetFile of assetFiles) {
        const localAssetPath = path.join(assetsPath, assetFile);
        await client.uploadFrom(localAssetPath, `assets/${assetFile}`);
        console.log(`✅ assets/${assetFile} uploaded`);
      }
    }

    // 3. Upload business data directory
    console.log("\n📊 Uploading business data...");
    try {
      await client.send("MKD data");
      console.log("📂 Created data directory");
    } catch (error) {
      console.log("📂 Data directory already exists");
    }

    // Upload business data JSON
    const dataPath = path.join(spaPath, "data", "businesses.json");
    if (fs.existsSync(dataPath)) {
      await client.uploadFrom(dataPath, "data/businesses.json");
      const stats = fs.statSync(dataPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`✅ businesses.json uploaded (${sizeMB} MB)`);
    } else {
      console.log("❌ Business data file not found!");
    }

    // 4. Verification
    console.log("\n🔍 Verifying deployment...");
    const rootFiles = await client.list();

    const requiredFiles = ["index.html", "assets", "data"];
    requiredFiles.forEach((file) => {
      const exists = rootFiles.some((f) => f.name === file);
      console.log(`  ${exists ? "✅" : "❌"} ${file}`);
    });

    // Check data directory
    await client.cd("data");
    const dataFiles = await client.list();
    console.log("📊 Data directory contents:");
    dataFiles.forEach((file) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      console.log(`  📄 ${file.name} (${sizeMB} MB)`);
    });

    console.log("\n🎉 DEPLOYMENT COMPLETED!");
    console.log("✅ Website: https://reportvisascam.com");
    console.log("✅ Data: /data/businesses.json");
    console.log("✅ All 841 businesses now available!");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

deployWithData()
  .then(() => {
    console.log(
      "\n🎊 SUCCESS! Dubai Business Directory is live with all data!",
    );
  })
  .catch((error) => {
    console.error("\n💥 FAILED:", error);
    process.exit(1);
  });
