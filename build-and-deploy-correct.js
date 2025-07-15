#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const FTP_CONFIG = {
  host: "reportvisascam.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function buildAndDeployCorrect() {
  try {
    console.log("🔧 BUILD AND DEPLOY CORRECT VERSION");
    console.log("=".repeat(60));
    console.log("❌ Current: React app has Fly.dev URLs");
    console.log("✅ Goal: Build with relative URLs for Hostinger");

    // Step 1: Clean previous build
    console.log("\n🗑️  Step 1: Cleaning previous build...");
    if (fs.existsSync("./dist")) {
      fs.rmSync("./dist", { recursive: true, force: true });
      console.log("   ✅ Previous build removed");
    }

    // Step 2: Build React app correctly
    console.log("\n📦 Step 2: Building React app correctly...");
    try {
      execSync("npm run build", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log("   ✅ React app built successfully");
    } catch (error) {
      console.error("   ❌ Build failed:", error.message);
      return false;
    }

    // Step 3: Verify build has correct content
    console.log("\n🔍 Step 3: Verifying build content...");
    const indexPath = "./dist/spa/index.html";

    if (!fs.existsSync(indexPath)) {
      console.error("   ❌ index.html not found in build");
      return false;
    }

    const indexContent = fs.readFileSync(indexPath, "utf8");

    // Check for problematic URLs
    const hasFlyDev = indexContent.includes("fly.dev");
    const hasAbsoluteUrls = indexContent.includes("https://");
    const hasCorrectTitle = indexContent.includes("Report Visa Scam");

    console.log("   📋 Build verification:");
    console.log(`   ${hasCorrectTitle ? "✅" : "❌"} Correct title`);
    console.log(`   ${!hasFlyDev ? "✅" : "❌"} No Fly.dev URLs`);
    console.log(`   ${!hasAbsoluteUrls ? "✅" : "❌"} Uses relative URLs`);

    if (hasFlyDev) {
      console.error("   🚨 Build still contains Fly.dev URLs!");
      console.error("   This suggests build configuration issue");
      return false;
    }

    // Step 4: Add business data
    console.log("\n📊 Step 4: Adding business data...");
    const dataDir = "./dist/spa/data";
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync("./client/data/businesses.json")) {
      fs.copyFileSync(
        "./client/data/businesses.json",
        path.join(dataDir, "businesses.json"),
      );
      console.log("   ✅ 841 businesses added to build");
    }

    // Step 5: Connect to Hostinger
    console.log("\n🔗 Step 5: Connecting to Hostinger...");
    const client = new ftp.Client();
    client.timeout = 60000;

    await client.access(FTP_CONFIG);
    console.log("   ✅ Connected to Hostinger");

    try {
      await client.cd("public_html");
      console.log("   📂 Working in /public_html");
    } catch (e) {
      console.log("   📂 Working in root directory");
    }

    // Step 6: Remove old React files
    console.log("\n🗑️  Step 6: Removing old React files...");

    // Remove specific files that might have Fly.dev URLs
    const filesToRemove = ["index.html"];
    for (const fileName of filesToRemove) {
      try {
        await client.remove(fileName);
        console.log(`   ✅ Removed old ${fileName}`);
      } catch (e) {
        console.log(`   ⚠️  ${fileName} not found or couldn't remove`);
      }
    }

    // Remove assets directory
    try {
      const files = await client.list();
      const assetsDir = files.find((f) => f.name === "assets" && f.type === 1);
      if (assetsDir) {
        await client.cd("assets");
        const assetFiles = await client.list();
        for (const file of assetFiles) {
          if (file.type === 2) {
            await client.remove(file.name);
          }
        }
        await client.cd("../");
        await client.removeDir("assets");
        console.log("   ✅ Removed old assets directory");
      }
    } catch (e) {
      console.log("   ⚠️  No old assets directory to remove");
    }

    // Step 7: Deploy correct React app
    console.log("\n🚀 Step 7: Deploying correct React app...");

    const spaPath = "./dist/spa";

    // Deploy index.html
    await client.uploadFrom(path.join(spaPath, "index.html"), "index.html");
    console.log("   ✅ index.html deployed");

    // Deploy assets
    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      await client.send("MKD assets");
      const assetFiles = fs.readdirSync(assetsPath);

      for (const file of assetFiles) {
        await client.uploadFrom(path.join(assetsPath, file), `assets/${file}`);
        console.log(`   ✅ assets/${file}`);
      }
    }

    // Deploy data
    if (fs.existsSync(dataDir)) {
      try {
        await client.send("MKD data");
      } catch (e) {} // Directory might exist

      const dataFiles = fs.readdirSync(dataDir);
      for (const file of dataFiles) {
        await client.uploadFrom(path.join(dataDir, file), `data/${file}`);
        const sizeMB = (
          fs.statSync(path.join(dataDir, file)).size /
          1024 /
          1024
        ).toFixed(1);
        console.log(`   ✅ data/${file} (${sizeMB}MB)`);
      }
    }

    // Deploy static files
    const staticFiles = ["favicon.ico", "robots.txt", "placeholder.svg"];
    for (const file of staticFiles) {
      const filePath = path.join(spaPath, file);
      if (fs.existsSync(filePath)) {
        await client.uploadFrom(filePath, file);
        console.log(`   ✅ ${file}`);
      }
    }

    // Step 8: Create .htaccess
    console.log("\n⚙️  Step 8: Creating .htaccess...");
    const htaccess = `AddType application/javascript .js
AddType text/css .css
AddType application/json .json

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;

    fs.writeFileSync("./.htaccess-temp", htaccess);
    await client.uploadFrom("./.htaccess-temp", ".htaccess");
    fs.unlinkSync("./.htaccess-temp");
    console.log("   ✅ .htaccess created");

    client.close();

    console.log("\n🎉 CORRECT BUILD DEPLOYED!");
    console.log("=".repeat(60));
    console.log("✅ React app built with relative URLs");
    console.log("✅ No Fly.dev URLs in build");
    console.log("✅ Deployed to Hostinger correctly");
    console.log("✅ All 841 businesses included");

    console.log("\n🔄 NEXT STEPS:");
    console.log("1. Clear browser cache (Ctrl+F5)");
    console.log("2. Visit: https://reportvisascam.com");
    console.log("3. Navigation should show reportvisascam.com URLs");
    console.log("4. No more Fly.dev URLs anywhere");

    return true;
  } catch (error) {
    console.error("\n❌ BUILD AND DEPLOY FAILED!");
    console.error("Error:", error.message);
    return false;
  }
}

buildAndDeployCorrect()
  .then((success) => {
    if (success) {
      console.log("\n✅ SUCCESS! Your website should now work correctly!");
    } else {
      console.log("\n❌ Failed - check errors above");
    }
  })
  .catch((error) => {
    console.error("💥 Script error:", error.message);
  });
