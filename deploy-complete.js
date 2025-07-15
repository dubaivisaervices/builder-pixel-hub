#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hostinger FTP Configuration
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "reportvisascam.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
};

async function uploadDirectory(client, localPath, remotePath) {
  console.log(`📁 Uploading directory: ${localPath} -> ${remotePath}`);

  const items = fs.readdirSync(localPath);

  for (const item of items) {
    const localItemPath = path.join(localPath, item);
    const remoteItemPath = remotePath ? `${remotePath}/${item}` : item;

    const stats = fs.statSync(localItemPath);

    if (stats.isDirectory()) {
      // Create directory on remote
      try {
        await client.ensureDir(remoteItemPath);
        console.log(`📂 Created directory: ${remoteItemPath}`);
      } catch (error) {
        console.log(`📂 Directory exists: ${remoteItemPath}`);
      }

      // Recursively upload subdirectory
      await uploadDirectory(client, localItemPath, remoteItemPath);
    } else {
      // Upload file
      console.log(`📄 Uploading: ${item}`);
      await client.uploadFrom(localItemPath, remoteItemPath);
      console.log(`✅ Uploaded: ${remoteItemPath}`);
    }
  }
}

async function deployComplete() {
  const client = new ftp.Client();

  try {
    console.log("🚀 Starting COMPLETE deployment to Hostinger...");
    console.log("📋 Option 2: SQLite Database + Website Upload");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // ========== 1. DEPLOY WEBSITE FILES ==========
    console.log("\n🌐 === DEPLOYING WEBSITE FILES ===");
    const spaPath = path.join(__dirname, "dist", "spa");

    if (!fs.existsSync(spaPath)) {
      throw new Error(
        `Build directory not found: ${spaPath}. Run 'npm run build' first.`,
      );
    }

    // Upload all website files to root
    await uploadDirectory(client, spaPath, "");
    console.log("✅ Website files deployed successfully!");

    // ========== 2. DEPLOY DATABASE FILES ==========
    console.log("\n📊 === DEPLOYING DATABASE FILES ===");

    // Create database directory
    try {
      await client.ensureDir("database");
      console.log("📂 Database directory created/verified");
    } catch (error) {
      console.log("📂 Database directory already exists");
    }

    // Upload main database file
    const dbPath = path.join(
      __dirname,
      "server",
      "database",
      "dubai_businesses.db",
    );
    if (fs.existsSync(dbPath)) {
      const dbStats = fs.statSync(dbPath);
      console.log(
        `📄 Uploading main database (${(dbStats.size / 1024 / 1024).toFixed(1)} MB)...`,
      );
      await client.uploadFrom(dbPath, "database/dubai_businesses.db");
      console.log("✅ Main database uploaded!");

      // Upload WAL file (Write-Ahead Log)
      const walPath = path.join(
        __dirname,
        "server",
        "database",
        "dubai_businesses.db-wal",
      );
      if (fs.existsSync(walPath)) {
        const walStats = fs.statSync(walPath);
        console.log(
          `📄 Uploading WAL file (${(walStats.size / 1024 / 1024).toFixed(1)} MB)...`,
        );
        await client.uploadFrom(walPath, "database/dubai_businesses.db-wal");
        console.log("✅ WAL file uploaded!");
      }

      // Upload SHM file (Shared Memory)
      const shmPath = path.join(
        __dirname,
        "server",
        "database",
        "dubai_businesses.db-shm",
      );
      if (fs.existsSync(shmPath)) {
        const shmStats = fs.statSync(shmPath);
        console.log(
          `📄 Uploading SHM file (${(shmStats.size / 1024).toFixed(0)} KB)...`,
        );
        await client.uploadFrom(shmPath, "database/dubai_businesses.db-shm");
        console.log("✅ SHM file uploaded!");
      }
    } else {
      throw new Error(`Database file not found: ${dbPath}`);
    }

    // ========== 3. DEPLOY SERVER FILES ==========
    console.log("\n🚀 === DEPLOYING SERVER APPLICATION ===");
    const serverPath = path.join(__dirname, "dist", "server");

    if (fs.existsSync(serverPath)) {
      try {
        await client.ensureDir("server");
        console.log("📂 Server directory created/verified");
      } catch (error) {
        console.log("📂 Server directory already exists");
      }

      await uploadDirectory(client, serverPath, "server");
      console.log("✅ Server application deployed!");
    } else {
      console.log("⚠️  Server build not found - website only mode");
    }

    // ========== 4. VERIFICATION ==========
    console.log("\n🔍 === VERIFYING DEPLOYMENT ===");

    // Check website files
    await client.cd("/");
    const rootFiles = await client.list();
    const hasIndex = rootFiles.some((f) => f.name === "index.html");
    const hasAssets = rootFiles.some((f) => f.name === "assets");
    console.log(`📄 index.html: ${hasIndex ? "✅" : "❌"}`);
    console.log(`📁 assets/: ${hasAssets ? "✅" : "❌"}`);

    // Check database files
    const hasDatabase = rootFiles.some((f) => f.name === "database");
    if (hasDatabase) {
      await client.cd("database");
      const dbFiles = await client.list();
      console.log("📊 Database files:");
      dbFiles.forEach((file) => {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        console.log(`  📄 ${file.name} (${sizeMB} MB)`);
      });
    }

    // ========== 5. SUCCESS SUMMARY ==========
    console.log("\n🎉 === DEPLOYMENT COMPLETED SUCCESSFULLY! ===");
    console.log("🌐 Website: https://reportvisascam.com");
    console.log("🗄️  Database: /database/dubai_businesses.db");
    console.log("📊 Data: 841 Dubai businesses with photos");
    console.log("💼 Features: Search, categories, ratings, reviews");
    console.log("📱 Responsive design with modern UI");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

// Run deployment
deployComplete()
  .then(() => {
    console.log("\n✅ OPTION 2 DEPLOYMENT COMPLETED!");
    console.log(
      "Your Dubai Business Directory is now live with SQLite database!",
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 DEPLOYMENT FAILED:", error);
    process.exit(1);
  });
