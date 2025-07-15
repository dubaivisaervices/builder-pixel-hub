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
    console.log("🚀 Starting complete deployment to Hostinger...");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Work in root directory (this hosting doesn't use public_html)
    console.log("📂 Working in root directory");

    // 1. Upload website files (SPA)
    console.log("🌐 Uploading website files...");
    const spaPath = path.join(__dirname, "dist", "spa");

    if (!fs.existsSync(spaPath)) {
      throw new Error(
        `Build directory not found: ${spaPath}. Please run 'npm run build' first.`,
      );
    }

    // Upload all files from dist/spa to root directory
    await uploadDirectory(client, spaPath, "");

    // 2. Upload SQLite database
    console.log("📊 Uploading SQLite database...");

    // Create database directory
    try {
      await client.ensureDir("database");
      console.log("📂 Created database directory");
    } catch (error) {
      console.log("📂 Database directory already exists");
    }

    // Upload SQLite database file
    const dbPath = path.join(
      __dirname,
      "server",
      "database",
      "dubai_businesses.db",
    );
    if (fs.existsSync(dbPath)) {
      await client.uploadFrom(dbPath, "database/dubai_businesses.db");
      console.log("✅ Uploaded SQLite database");

      // Upload WAL and SHM files if they exist
      const walPath = path.join(
        __dirname,
        "server",
        "database",
        "dubai_businesses.db-wal",
      );
      const shmPath = path.join(
        __dirname,
        "server",
        "database",
        "dubai_businesses.db-shm",
      );

      if (fs.existsSync(walPath)) {
        await client.uploadFrom(walPath, "database/dubai_businesses.db-wal");
        console.log("✅ Uploaded SQLite WAL file");
      }

      if (fs.existsSync(shmPath)) {
        await client.uploadFrom(shmPath, "database/dubai_businesses.db-shm");
        console.log("✅ Uploaded SQLite SHM file");
      }
    } else {
      console.log("⚠️  SQLite database file not found");
    }

    // 3. Upload server files
    console.log("🚀 Uploading server application...");
    const serverPath = path.join(__dirname, "dist", "server");

    if (fs.existsSync(serverPath)) {
      try {
        await client.ensureDir("server");
        console.log("📂 Created server directory");
      } catch (error) {
        console.log("📂 Server directory already exists");
      }

      await uploadDirectory(client, serverPath, "server");
      console.log("✅ Uploaded server application");
    } else {
      console.log("⚠️  Server build not found");
    }

    console.log("\n🎉 Complete deployment finished successfully!");
    console.log("🌐 Website: https://crossbordersmigrations.com");
    console.log("🗄️  Database: Uploaded to /database/");
    console.log("🚀 Server: Uploaded to /server/");
    console.log("📊 Your Dubai Business Directory is now live with database!");
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
