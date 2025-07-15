#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOSTINGER_CONFIG = {
  host: "crossbordersmigrations.com",
  user: "u611952859.crossborder1120",
  password: "One@click1",
  port: 21,
};

async function deploySimple() {
  const client = new ftp.Client();

  try {
    console.log("🚀 Starting Option 2: SQLite + Hostinger Deployment");
    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // 1. Upload website files one by one
    console.log("\n🌐 Uploading website files...");
    const spaPath = path.join(__dirname, "dist", "spa");

    // Upload index.html
    await client.uploadFrom(path.join(spaPath, "index.html"), "index.html");
    console.log("✅ index.html uploaded");

    // Upload favicon
    await client.uploadFrom(path.join(spaPath, "favicon.ico"), "favicon.ico");
    console.log("✅ favicon.ico uploaded");

    // Upload other files
    const files = ["robots.txt", "placeholder.svg"];
    for (const file of files) {
      const filePath = path.join(spaPath, file);
      if (fs.existsSync(filePath)) {
        await client.uploadFrom(filePath, file);
        console.log(`✅ ${file} uploaded`);
      }
    }

    // Create and upload assets directory
    console.log("\n📁 Ensuring assets directory...");
    try {
      await client.send("MKD assets");
      console.log("📂 Assets directory created");
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

    // 2. Upload SQLite database
    console.log("\n📊 Uploading database...");
    await client.send("MKD database");

    // Main database
    const dbPath = path.join(
      __dirname,
      "server",
      "database",
      "dubai_businesses.db",
    );
    await client.uploadFrom(dbPath, "database/dubai_businesses.db");
    console.log("✅ Main database uploaded (12.8MB)");

    // WAL file
    const walPath = path.join(
      __dirname,
      "server",
      "database",
      "dubai_businesses.db-wal",
    );
    if (fs.existsSync(walPath)) {
      await client.uploadFrom(walPath, "database/dubai_businesses.db-wal");
      console.log("✅ WAL file uploaded (6.8MB)");
    }

    // SHM file
    const shmPath = path.join(
      __dirname,
      "server",
      "database",
      "dubai_businesses.db-shm",
    );
    if (fs.existsSync(shmPath)) {
      await client.uploadFrom(shmPath, "database/dubai_businesses.db-shm");
      console.log("✅ SHM file uploaded (32KB)");
    }

    // 3. Verification
    console.log("\n🔍 Verifying deployment...");
    const rootFiles = await client.list();
    console.log("📂 Root directory files:");
    rootFiles.forEach((file) => {
      const size =
        file.size > 1024
          ? `${(file.size / 1024).toFixed(0)}KB`
          : `${file.size}B`;
      console.log(`  ${file.type === 1 ? "📁" : "📄"} ${file.name} (${size})`);
    });

    console.log("\n🎉 OPTION 2 DEPLOYMENT COMPLETED!");
    console.log("✅ Website: https://crossbordersmigrations.com");
    console.log("✅ Database: /database/dubai_businesses.db");
    console.log("✅ 841 Dubai businesses with photos and data");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

deploySimple()
  .then(() => {
    console.log("\n🎊 SUCCESS! Your Dubai Business Directory is live!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 FAILED:", error);
    process.exit(1);
  });
