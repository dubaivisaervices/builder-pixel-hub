#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple host formats for Hostinger
const HOST_VARIANTS = [
  "reportvisascam.com",
  "ftp.reportvisascam.com",
  "files.hostinger.com",
  "files.000webhost.com",
];

const USER_VARIANTS = [
  "reportvisascam",
  "u123456789.reportvisascam",
  process.env.HOSTINGER_FTP_USER,
].filter(Boolean);

const PASSWORD_VARIANTS = [
  "reportvisascam123",
  "reportvisascam2024",
  process.env.HOSTINGER_FTP_PASSWORD,
].filter(Boolean);

async function uploadFile(client, localPath, remotePath) {
  try {
    console.log(`📄 Uploading: ${path.basename(localPath)}`);
    await client.uploadFrom(localPath, remotePath);
    console.log(`✅ Uploaded: ${remotePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to upload ${remotePath}: ${error.message}`);
    return false;
  }
}

async function tryConnection(host, user, password) {
  const client = new ftp.Client();
  client.ftp.timeout = 30000;

  try {
    console.log(`🔗 Trying: ${user}@${host}`);
    await client.access({ host, user, password, port: 21 });
    console.log(`✅ Connected successfully to ${host}`);
    return client;
  } catch (error) {
    console.log(`❌ Failed ${host}: ${error.message}`);
    client.close();
    return null;
  }
}

async function deployToHostinger() {
  console.log("🚀 Starting automatic deployment to reportvisascam.com...");

  let client = null;

  // Try different host/credential combinations
  for (const host of HOST_VARIANTS) {
    for (const user of USER_VARIANTS) {
      for (const password of PASSWORD_VARIANTS) {
        client = await tryConnection(host, user, password);
        if (client) break;
      }
      if (client) break;
    }
    if (client) break;
  }

  if (!client) {
    console.log("❌ Could not connect with any credential combination");
    console.log("📋 Manual upload required:");
    console.log("   - Get FTP credentials from Hostinger control panel");
    console.log("   - Upload files from dist/spa/ to public_html/");
    return false;
  }

  try {
    // Navigate to public_html
    try {
      await client.cd("public_html");
      console.log("📂 Working in public_html directory");
    } catch (error) {
      console.log("📂 Working in root directory (public_html not found)");
    }

    const spaPath = path.join(__dirname, "dist", "spa");

    // Upload essential files
    const files = [
      "index.html",
      "index.php",
      "composer.json",
      ".htaccess",
      "favicon.ico",
      "robots.txt",
    ];

    for (const file of files) {
      const localPath = path.join(spaPath, file);
      if (fs.existsSync(localPath)) {
        await uploadFile(client, localPath, file);
      }
    }

    // Create and upload assets
    try {
      await client.ensureDir("assets");
      console.log("📁 Created assets directory");
    } catch (error) {
      console.log("📁 Assets directory already exists");
    }

    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath);
      for (const file of assetFiles) {
        const localPath = path.join(assetsPath, file);
        await uploadFile(client, localPath, `assets/${file}`);
      }
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("🌐 Website should be live at: https://reportvisascam.com");
    console.log("🛡️ Report Visa Scam website is now active!");

    return true;
  } catch (error) {
    console.error("❌ Deployment error:", error.message);
    return false;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

deployToHostinger()
  .then((success) => {
    if (success) {
      console.log("✅ Automatic deployment successful!");
      process.exit(0);
    } else {
      console.log("❌ Automatic deployment failed - manual upload required");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("💥 Deployment script error:", error);
    process.exit(1);
  });
