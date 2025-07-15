#!/usr/bin/env node

import * as ftp from "basic-ftp";

const HOSTINGER_CONFIG = {
  host: "reportvisascam.com",
  user: "u611952859.crossborder1120",
  password: "One@click1",
  port: 21,
};

async function exploreFiles(client, directory = "/", level = 0) {
  const indent = "  ".repeat(level);
  console.log(`${indent}📂 ${directory}`);

  try {
    await client.cd(directory);
    const files = await client.list();

    // Show all files in current directory
    for (const file of files) {
      const prefix = file.type === 1 ? "📁" : "📄";
      const size =
        file.size > 1024 * 1024
          ? `${(file.size / 1024 / 1024).toFixed(1)}MB`
          : file.size > 1024
            ? `${(file.size / 1024).toFixed(0)}KB`
            : `${file.size}B`;

      console.log(`${indent}  ${prefix} ${file.name} (${size})`);

      // Look for important files
      if (file.name === "index.html") {
        console.log(`${indent}    ✅ WEBSITE ENTRY POINT FOUND!`);
      }
      if (file.name === "database") {
        console.log(`${indent}    ✅ DATABASE DIRECTORY FOUND!`);
        // Explore database directory
        await client.cd("database");
        const dbFiles = await client.list();
        for (const dbFile of dbFiles) {
          const dbSize = (dbFile.size / 1024 / 1024).toFixed(1);
          console.log(
            `${indent}      📄 ${dbFile.name} (${dbSize}MB) ✅ DATABASE FILE`,
          );
        }
        await client.cd("..");
      }
      if (file.name === "assets") {
        console.log(`${indent}    ✅ ASSETS DIRECTORY FOUND!`);
        // Explore assets directory
        await client.cd("assets");
        const assetFiles = await client.list();
        for (const assetFile of assetFiles) {
          const assetSize = (assetFile.size / 1024).toFixed(0);
          console.log(`${indent}      📄 ${assetFile.name} (${assetSize}KB)`);
        }
        await client.cd("..");
      }
    }
  } catch (error) {
    console.log(`${indent}  ❌ Error accessing ${directory}: ${error.message}`);
  }
}

async function exploreFTP() {
  const client = new ftp.Client();

  try {
    console.log("🔍 Exploring FTP structure for Option 2 verification...");
    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    const currentDir = await client.pwd();
    console.log(`📂 Starting directory: ${currentDir}`);

    await exploreFiles(client, currentDir);

    console.log("\n📋 Summary:");
    console.log("Looking for these key files:");
    console.log("  📄 index.html - Website entry point");
    console.log("  📁 assets/ - CSS and JS files");
    console.log("  📁 database/ - SQLite database files");
    console.log("    📄 dubai_businesses.db - Main database");
    console.log("    📄 dubai_businesses.db-wal - Transaction log");
    console.log("    📄 dubai_businesses.db-shm - Shared memory");
  } catch (error) {
    console.error("❌ Exploration failed:", error.message);
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

exploreFTP();
