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

async function deployDatabase() {
  const client = new ftp.Client();

  try {
    console.log("📊 Starting database deployment to Hostinger...");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Check if database directory exists, if not create it
    try {
      const files = await client.list();
      const databaseDirExists = files.some((file) => file.name === "database");

      if (!databaseDirExists) {
        await client.send("MKD database");
        console.log("📂 Created database directory");
      } else {
        console.log("📂 Database directory already exists");
      }
    } catch (error) {
      console.log("📂 Creating database directory...");
      await client.send("MKD database");
    }

    // Upload SQLite database file
    const dbPath = path.join(
      __dirname,
      "server",
      "database",
      "dubai_businesses.db",
    );

    if (fs.existsSync(dbPath)) {
      console.log("📄 Uploading main database file...");
      await client.uploadFrom(dbPath, "database/dubai_businesses.db");
      console.log("✅ Uploaded SQLite database (main file)");

      // Upload WAL file if exists
      const walPath = path.join(
        __dirname,
        "server",
        "database",
        "dubai_businesses.db-wal",
      );
      if (fs.existsSync(walPath)) {
        console.log("📄 Uploading WAL file...");
        await client.uploadFrom(walPath, "database/dubai_businesses.db-wal");
        console.log("✅ Uploaded SQLite WAL file");
      }

      // Upload SHM file if exists
      const shmPath = path.join(
        __dirname,
        "server",
        "database",
        "dubai_businesses.db-shm",
      );
      if (fs.existsSync(shmPath)) {
        console.log("📄 Uploading SHM file...");
        await client.uploadFrom(shmPath, "database/dubai_businesses.db-shm");
        console.log("✅ Uploaded SQLite SHM file");
      }

      // Verify upload by listing database directory
      console.log("\n📋 Verifying database upload...");
      await client.cd("database");
      const dbFiles = await client.list();
      console.log("📂 Files in database directory:");
      dbFiles.forEach((file) => {
        console.log(
          `  📄 ${file.name} (${file.size} bytes) - ${new Date(file.modifiedAt).toLocaleString()}`,
        );
      });

      console.log("\n🎉 Database deployment completed successfully!");
      console.log("🗄️  Database available at: /database/dubai_businesses.db");
      console.log("📊 Contains 841 Dubai businesses with photos and data!");
    } else {
      throw new Error(`Database file not found: ${dbPath}`);
    }
  } catch (error) {
    console.error("❌ Database deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

// Run deployment
deployDatabase()
  .then(() => {
    console.log("✅ Database deployment completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Database deployment failed:", error);
    process.exit(1);
  });
