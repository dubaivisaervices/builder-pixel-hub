#!/usr/bin/env node

import * as ftp from "basic-ftp";

const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "reportvisascam.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
};

async function inspectFTP() {
  const client = new ftp.Client();

  try {
    console.log("🔗 Connecting to FTP server...");
    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Get current working directory
    const currentDir = await client.pwd();
    console.log(`📂 Current directory: ${currentDir}`);

    // List root directory contents
    console.log("📋 Root directory contents:");
    const rootFiles = await client.list();
    rootFiles.forEach((file) => {
      console.log(
        `  ${file.type === 1 ? "📁" : "📄"} ${file.name} (${file.size} bytes)`,
      );
    });

    // Check if public_html exists and navigate to it
    const publicHtmlExists = rootFiles.some(
      (file) => file.name === "public_html",
    );

    if (publicHtmlExists) {
      console.log("\n🎯 Found public_html directory, navigating...");
      await client.cd("public_html");

      const publicHtmlFiles = await client.list();
      console.log("📋 public_html contents:");
      publicHtmlFiles.forEach((file) => {
        console.log(
          `  ${file.type === 1 ? "📁" : "📄"} ${file.name} (${file.size} bytes)`,
        );
      });
    } else {
      console.log("❌ public_html directory not found in root");
      console.log("💡 Files might need to be uploaded to root directory");
    }
  } catch (error) {
    console.error("❌ FTP inspection failed:", error.message);
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

inspectFTP();
