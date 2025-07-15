#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hostinger FTP Configuration
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "crossbordersmigrations.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
};

async function uploadDirectory(client, localPath, remotePath) {
  console.log(`📁 Uploading directory: ${localPath} -> ${remotePath}`);

  const items = fs.readdirSync(localPath);

  for (const item of items) {
    const localItemPath = path.join(localPath, item);
    const remoteItemPath = `${remotePath}/${item}`;

    const stats = fs.statSync(localItemPath);

    if (stats.isDirectory()) {
      // Create directory on remote
      try {
        await client.ensureDir(remoteItemPath);
        console.log(`📂 Created directory: ${remoteItemPath}`);
      } catch (error) {
        console.log(
          `📂 Directory already exists or created: ${remoteItemPath}`,
        );
      }

      // Recursively upload subdirectory
      await uploadDirectory(client, localItemPath, remoteItemPath);
    } else {
      // Upload file
      console.log(`📄 Uploading file: ${item}`);
      await client.uploadFrom(localItemPath, remoteItemPath);
      console.log(`✅ Uploaded: ${remoteItemPath}`);
    }
  }
}

async function deployWebsiteOnly() {
  const client = new ftp.Client();
  client.ftp.timeout = 30000; // 30 second timeout

  try {
    console.log("🚀 Starting website-only deployment to Hostinger...");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Work in root directory
    console.log("📂 Working in root directory");

    // Upload website files (SPA)
    console.log("🌐 Uploading updated website files...");
    const spaPath = path.join(__dirname, "dist", "spa");

    if (!fs.existsSync(spaPath)) {
      throw new Error(
        `Build directory not found: ${spaPath}. Please run 'npm run build' first.`,
      );
    }

    // Upload only essential files
    const essentialFiles = ["index.html", "assets"];

    for (const item of essentialFiles) {
      const localItemPath = path.join(spaPath, item);

      if (fs.existsSync(localItemPath)) {
        const stats = fs.statSync(localItemPath);

        if (stats.isDirectory()) {
          // Upload directory
          await uploadDirectory(client, localItemPath, item);
        } else {
          // Upload single file
          console.log(`📄 Uploading file: ${item}`);
          await client.uploadFrom(localItemPath, item);
          console.log(`✅ Uploaded: ${item}`);
        }
      }
    }

    console.log("\n🎉 Website deployment completed successfully!");
    console.log("🌐 Your updated Dubai Visa Scam Report website is now live!");
    console.log("🔗 Visit: https://crossbordersmigrations.com");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

// Run deployment
deployWebsiteOnly()
  .then(() => {
    console.log("✅ Website deployment completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Website deployment failed:", error);
    process.exit(1);
  });
