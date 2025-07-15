#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";

const FTP_CONFIG = {
  host: "reportvisascam.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function testDeployment() {
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    console.log("🚀 Testing deployment to reportvisascam.com");
    console.log("=".repeat(50));

    console.log("📡 Connecting to FTP server...");
    await client.access(FTP_CONFIG);
    console.log("✅ FTP Connection successful!");

    // Check current directory
    console.log("\n📂 Current directory:", await client.pwd());

    // List files in root
    console.log("\n📋 Files in root directory:");
    const rootFiles = await client.list();
    rootFiles.forEach((file) => {
      const type = file.type === 1 ? "📁" : "📄";
      const size =
        file.type === 2 ? ` (${(file.size / 1024).toFixed(1)}KB)` : "";
      console.log(`   ${type} ${file.name}${size}`);
    });

    // Check if public_html exists
    try {
      await client.cd("public_html");
      console.log("\n📁 Found public_html directory");

      const publicFiles = await client.list();
      console.log("\n📋 Files in public_html:");
      publicFiles.forEach((file) => {
        const type = file.type === 1 ? "📁" : "📄";
        const size =
          file.type === 2 ? ` (${(file.size / 1024).toFixed(1)}KB)` : "";
        console.log(`   ${type} ${file.name}${size}`);
      });
    } catch (error) {
      console.log("\n⚠️  public_html directory not found or not accessible");
    }

    // Test file upload
    console.log("\n🧪 Testing file upload...");
    const testContent = "Test deployment - " + new Date().toISOString();
    const testPath = "./test-deploy.txt";
    fs.writeFileSync(testPath, testContent);

    await client.uploadFrom(testPath, "test-deploy.txt");
    console.log("✅ Test file uploaded successfully");

    // Clean up
    fs.unlinkSync(testPath);
    await client.remove("test-deploy.txt");
    console.log("✅ Test file removed");

    console.log("\n🎉 Deployment test completed successfully!");
    console.log("🌐 Your hosting is working correctly");
  } catch (error) {
    console.error("\n❌ Deployment test failed!");
    console.error("Error:", error.message);

    if (error.message.includes("530") || error.message.includes("Login")) {
      console.error("\n💡 Login Error Solutions:");
      console.error("   - Verify username: u611952859.reportvisascam.com");
      console.error(
        "   - Check if the reportvisascam.com subdomain is properly configured",
      );
      console.error("   - Ensure the hosting account is active");
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("\n💡 DNS Error Solutions:");
      console.error(
        "   - reportvisascam.com domain may not be pointing to hosting",
      );
      console.error("   - DNS propagation may still be in progress");
      console.error("   - Try using the direct server IP if available");
    }
  } finally {
    client.close();
  }
}

testDeployment();
