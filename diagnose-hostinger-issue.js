#!/usr/bin/env node

import * as ftp from "basic-ftp";

const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "crossbordersmigrations.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
};

async function diagnoseHostinger() {
  const client = new ftp.Client();
  client.ftp.timeout = 30000; // 30 second timeout

  try {
    console.log("🔍 Diagnosing Hostinger hosting issue...");
    console.log("🔗 Attempting FTP connection...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Successfully connected to Hostinger FTP");

    // Check current directory
    const currentDir = await client.pwd();
    console.log(`📂 Current directory: ${currentDir}`);

    // List root directory
    console.log("📋 Root directory contents:");
    const rootFiles = await client.list();
    rootFiles.forEach((file) => {
      console.log(
        `  ${file.type === 1 ? "📁" : "📄"} ${file.name} (${file.size} bytes)`,
      );
    });

    // Check if public_html exists
    const publicHtmlExists = rootFiles.some(
      (file) => file.name === "public_html",
    );

    if (publicHtmlExists) {
      console.log("\n📂 Checking public_html directory...");
      await client.cd("public_html");
      const publicHtmlFiles = await client.list();
      console.log("📋 public_html contents:");
      publicHtmlFiles.forEach((file) => {
        console.log(
          `  ${file.type === 1 ? "📁" : "📄"} ${file.name} (${file.size} bytes)`,
        );
      });

      // Check for index.html
      const hasIndexHtml = publicHtmlFiles.some(
        (file) => file.name === "index.html",
      );
      const hasIndexPhp = publicHtmlFiles.some(
        (file) => file.name === "index.php",
      );

      console.log(`\n🔍 Analysis:`);
      console.log(`   index.html present: ${hasIndexHtml ? "✅" : "❌"}`);
      console.log(`   index.php present: ${hasIndexPhp ? "✅" : "❌"}`);

      if (!hasIndexHtml && !hasIndexPhp) {
        console.log(
          "\n❌ Issue: No index files found in public_html directory",
        );
        console.log(
          "💡 Solution: Deploy React build files to public_html directory",
        );
      } else if (hasIndexHtml) {
        console.log("\n✅ React app appears to be deployed");
        console.log(
          "💡 The composer error might be due to PHP hosting settings",
        );
      }
    } else {
      console.log("\n❌ public_html directory not found");
      console.log("💡 Files might need to be deployed to root directory");
    }

    console.log("\n🌐 Try accessing: https://crossbordersmigrations.com");
  } catch (error) {
    console.error("❌ Diagnosis failed:", error.message);

    if (error.message.includes("Timeout")) {
      console.log("\n💡 Troubleshooting suggestions:");
      console.log("   1. Check internet connection");
      console.log("   2. Verify FTP credentials");
      console.log("   3. Try again in a few minutes");
      console.log("   4. Check if Hostinger FTP service is operational");
    }
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

diagnoseHostinger();
