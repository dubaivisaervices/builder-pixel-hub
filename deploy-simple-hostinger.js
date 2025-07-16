#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "ftp.reportvisascam.com",
  user: process.env.HOSTINGER_FTP_USER || "reportvisascam",
  password: process.env.HOSTINGER_FTP_PASSWORD || "reportvisascam123",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
};

async function deployToHostinger() {
  const client = new ftp.Client();
  client.ftp.timeout = 30000;

  try {
    console.log("🚀 Deploying to Hostinger (PHP hosting compatible)...");
    console.log("🔗 Connecting to FTP...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected successfully");

    // Try to navigate to public_html, or stay in root
    try {
      await client.cd("public_html");
      console.log("📂 Working in public_html directory");
    } catch (error) {
      console.log("📂 Working in root directory");
    }

    const spaPath = path.join(__dirname, "dist", "spa");

    // Upload essential files
    const essentialFiles = [
      "index.html",
      "index.php",
      "composer.json",
      ".htaccess",
      "favicon.ico",
      "robots.txt",
    ];

    for (const file of essentialFiles) {
      const localPath = path.join(spaPath, file);
      if (fs.existsSync(localPath)) {
        console.log(`📄 Uploading ${file}...`);
        await client.uploadFrom(localPath, file);
        console.log(`✅ Uploaded ${file}`);
      }
    }

    // Upload assets directory
    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      console.log("📁 Uploading assets directory...");
      try {
        await client.ensureDir("assets");
      } catch (error) {
        console.log("📁 Assets directory already exists");
      }

      const assetFiles = fs.readdirSync(assetsPath);
      for (const file of assetFiles) {
        const localAssetPath = path.join(assetsPath, file);
        console.log(`📄 Uploading assets/${file}...`);
        await client.uploadFrom(localAssetPath, `assets/${file}`);
        console.log(`✅ Uploaded assets/${file}`);
      }
    }

    console.log("\n🎉 Deployment completed!");
    console.log("🌐 Website: https://reportvisascam.com");
    console.log("📝 Files deployed:");
    console.log("   ✅ index.html (React app)");
    console.log("   ✅ index.php (PHP hosting compatibility)");
    console.log("   ✅ composer.json (dependency file)");
    console.log("   ✅ .htaccess (routing configuration)");
    console.log("   ✅ assets/ (CSS, JS, images)");
    console.log("\n🛡️ Dubai Visa Scam Report is now live!");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.log("\n📋 Files ready for manual upload in dist/spa/:");
    console.log("   - index.html");
    console.log("   - index.php");
    console.log("   - composer.json");
    console.log("   - .htaccess");
    console.log("   - assets/ folder");
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

deployToHostinger();
