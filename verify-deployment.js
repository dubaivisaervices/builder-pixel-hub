#!/usr/bin/env node

import * as ftp from "basic-ftp";

// Hostinger FTP Configuration
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "crossbordersmigrations.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
};

async function verifyDeployment() {
  const client = new ftp.Client();

  try {
    console.log("🔍 Verifying deployment...");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Navigate to public_html directory
    await client.cd("/public_html");
    console.log("📂 Navigated to /public_html");

    // List all files in public_html
    const files = await client.list();
    console.log("📋 Files in /public_html:");
    files.forEach((file) => {
      console.log(
        `  ${file.type === 1 ? "📁" : "📄"} ${file.name} (${file.size} bytes)`,
      );
    });

    // Check if our main files exist
    const expectedFiles = ["index.html", "assets", "favicon.ico"];
    const existingFiles = files.map((f) => f.name);

    console.log("\n🔍 Checking for expected files:");
    expectedFiles.forEach((file) => {
      const exists = existingFiles.includes(file);
      console.log(`  ${exists ? "✅" : "❌"} ${file}`);
    });

    // Check assets directory if it exists
    if (existingFiles.includes("assets")) {
      console.log("\n📁 Contents of /assets directory:");
      await client.cd("assets");
      const assetFiles = await client.list();
      assetFiles.forEach((file) => {
        console.log(
          `  📄 ${file.name} (${file.size} bytes) - ${new Date(file.modifiedAt).toLocaleString()}`,
        );
      });
    }

    console.log("\n🎯 Deployment verification completed!");
    console.log("🌐 Try accessing: https://crossbordersmigrations.com");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

// Run verification
verifyDeployment()
  .then(() => {
    console.log("✅ Verification process completed");
  })
  .catch((error) => {
    console.error("💥 Verification process failed:", error);
  });
