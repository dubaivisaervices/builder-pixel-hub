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

async function deployWebsite() {
  const client = new ftp.Client();

  try {
    console.log("🚀 Starting website deployment to Hostinger...");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Navigate to public_html directory
    await client.cd("/public_html");
    console.log("📂 Navigated to /public_html");

    // Get current directory listing
    const files = await client.list();
    console.log("📋 Current files in public_html:");
    files.forEach((file) => console.log(`  - ${file.name}`));

    // Upload the built SPA files
    const spaPath = path.join(__dirname, "dist", "spa");
    console.log(`📁 Local SPA path: ${spaPath}`);

    if (!fs.existsSync(spaPath)) {
      throw new Error(
        `Build directory not found: ${spaPath}. Please run 'npm run build' first.`,
      );
    }

    // Upload all files from dist/spa to public_html root
    await uploadDirectory(client, spaPath, "/public_html");

    console.log("🎉 Website deployment completed successfully!");
    console.log(
      "🌐 Your website should now be live at: https://crossbordersmigrations.com",
    );
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

// Run deployment
deployWebsite()
  .then(() => {
    console.log("✅ Deployment process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment process failed:", error);
    process.exit(1);
  });
