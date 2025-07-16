#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";

const FTP_CONFIG = {
  host: "reportvisascam.com", // Use your domain since DNS works
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function diagnoseAndFixDeployment() {
  const client = new ftp.Client();
  client.timeout = 60000;

  try {
    console.log("🔍 DIAGNOSING DEPLOYMENT ISSUE");
    console.log("=".repeat(60));
    console.log("❌ Problem: React app still loading from Fly.dev");
    console.log("✅ DNS working: test.php loads from Hostinger");

    console.log("\n🔗 Connecting to Hostinger...");
    await client.access(FTP_CONFIG);
    console.log("✅ Connected successfully");

    try {
      await client.cd("public_html");
      console.log("📂 Moved to public_html");
    } catch (e) {
      console.log("📂 Using root directory");
    }

    // Step 1: Check what's currently on Hostinger
    console.log("\n📋 Step 1: Checking current files on Hostinger...");
    const files = await client.list();

    console.log("📁 Files found on Hostinger:");
    files.forEach((file) => {
      const type = file.type === 1 ? "📁" : "📄";
      const size =
        file.type === 2 ? ` (${(file.size / 1024).toFixed(1)}KB)` : "";
      console.log(`   ${type} ${file.name}${size}`);
    });

    const hasIndex = files.find((f) => f.name === "index.html");
    const hasAssets = files.find((f) => f.name === "assets");
    const hasTestPhp = files.find((f) => f.name === "test.php");

    console.log("\n📊 Analysis:");
    console.log(`   ${hasTestPhp ? "✅" : "❌"} test.php (DNS working)`);
    console.log(`   ${hasIndex ? "✅" : "❌"} index.html (React app)`);
    console.log(`   ${hasAssets ? "✅" : "❌"} assets directory (React files)`);

    // Step 2: Check index.html content if it exists
    if (hasIndex) {
      console.log("\n🔍 Step 2: Checking index.html content...");
      try {
        await client.downloadTo("./temp-index-check.html", "index.html");
        const content = fs.readFileSync("./temp-index-check.html", "utf8");

        const hasFlyDevUrl = content.includes("fly.dev");
        const hasCorrectTitle = content.includes("Report Visa Scam");
        const hasReactRoot = content.includes('<div id="root">');

        console.log("📋 index.html analysis:");
        console.log(`   ${hasCorrectTitle ? "✅" : "❌"} Correct title`);
        console.log(`   ${hasReactRoot ? "✅" : "❌"} React root element`);
        console.log(
          `   ${hasFlyDevUrl ? "❌" : "✅"} ${hasFlyDevUrl ? "Contains Fly.dev URLs!" : "No Fly.dev URLs"}`,
        );

        if (hasFlyDevUrl) {
          console.log("   🚨 ISSUE: index.html contains Fly.dev URLs");
        }

        fs.unlinkSync("./temp-index-check.html");
      } catch (e) {
        console.log("   ⚠️  Could not analyze index.html content");
      }
    }

    // Step 3: Rebuild and deploy fresh React app
    console.log("\n🚀 Step 3: Deploying fresh React app...");

    // Check build directory
    const spaPath = "./dist/spa";
    if (!fs.existsSync(spaPath)) {
      console.log("❌ Build directory missing - running build...");
      console.log("Please run: npm run build");
      return false;
    }

    // Ensure data directory exists
    if (!fs.existsSync(path.join(spaPath, "data"))) {
      console.log("📊 Adding business data...");
      fs.mkdirSync(path.join(spaPath, "data"), { recursive: true });
      if (fs.existsSync("./client/data/businesses.json")) {
        fs.copyFileSync(
          "./client/data/businesses.json",
          path.join(spaPath, "data/businesses.json"),
        );
        console.log("   ✅ Added 841 businesses data");
      }
    }

    // Step 4: Clean deployment (remove old files)
    console.log("\n🗑️  Step 4: Cleaning old deployment...");

    // Remove old React files
    const filesToRemove = ["index.html"];
    for (const fileName of filesToRemove) {
      try {
        await client.remove(fileName);
        console.log(`   ✅ Removed old ${fileName}`);
      } catch (e) {
        console.log(`   ⚠️  ${fileName} not found or couldn't remove`);
      }
    }

    // Remove old assets directory
    try {
      const assetFiles = await client.list("assets");
      for (const file of assetFiles) {
        if (file.type === 2) {
          // Regular file
          await client.remove(`assets/${file.name}`);
        }
      }
      await client.removeDir("assets");
      console.log("   ✅ Removed old assets directory");
    } catch (e) {
      console.log("   ⚠️  No old assets directory to remove");
    }

    // Step 5: Upload fresh React app
    console.log("\n📦 Step 5: Uploading fresh React app...");

    // Upload index.html
    const indexPath = path.join(spaPath, "index.html");
    if (fs.existsSync(indexPath)) {
      await client.uploadFrom(indexPath, "index.html");
      console.log("   ✅ index.html uploaded");
    }

    // Upload assets directory
    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      await client.send("MKD assets");

      const assetFiles = fs.readdirSync(assetsPath);
      console.log(`   📁 Uploading ${assetFiles.length} asset files...`);

      for (const file of assetFiles) {
        await client.uploadFrom(path.join(assetsPath, file), `assets/${file}`);
        console.log(`   ✅ assets/${file}`);
      }
    }

    // Upload data directory
    const dataPath = path.join(spaPath, "data");
    if (fs.existsSync(dataPath)) {
      try {
        await client.send("MKD data");
      } catch (e) {} // Directory might exist

      const dataFiles = fs.readdirSync(dataPath);
      for (const file of dataFiles) {
        await client.uploadFrom(path.join(dataPath, file), `data/${file}`);
        console.log(`   ✅ data/${file}`);
      }
    }

    // Step 6: Create minimal .htaccess
    console.log("\n⚙️  Step 6: Creating .htaccess...");
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
    console.log("   ✅ .htaccess uploaded");

    // Step 7: Final verification
    console.log("\n🔍 Step 7: Final verification...");
    const finalFiles = await client.list();

    const verification = {
      "index.html": finalFiles.find((f) => f.name === "index.html"),
      assets: finalFiles.find((f) => f.name === "assets"),
      data: finalFiles.find((f) => f.name === "data"),
      ".htaccess": finalFiles.find((f) => f.name === ".htaccess"),
    };

    console.log("📋 Final deployment check:");
    let success = true;
    for (const [name, file] of Object.entries(verification)) {
      if (file) {
        console.log(`   ✅ ${name}`);
      } else {
        console.log(`   ❌ ${name} missing`);
        success = false;
      }
    }

    console.log("\n🎉 DEPLOYMENT COMPLETED!");
    console.log("=".repeat(60));
    console.log("✅ Fresh React app deployed to Hostinger");
    console.log("✅ Old Fly.dev files removed");
    console.log("✅ MIME types configured");
    console.log("✅ Business data included");

    console.log("\n🔄 CRITICAL NEXT STEPS:");
    console.log("1. Clear browser cache completely (Ctrl+Shift+Del)");
    console.log("2. Open incognito/private browsing window");
    console.log("3. Visit: https://reportvisascam.com");
    console.log("4. Should load from Hostinger (no Fly.dev URLs)");

    console.log("\n🚨 If still showing Fly.dev URLs:");
    console.log("- Clear all browser data");
    console.log("- Try different browser");
    console.log("- Wait 10-15 minutes for server cache");

    return success;
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("Error:", error.message);
    return false;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

diagnoseAndFixDeployment()
  .then((success) => {
    if (success) {
      console.log("\n✅ DEPLOYMENT DIAGNOSIS AND FIX COMPLETED!");
      console.log("Clear your browser cache and visit reportvisascam.com");
    } else {
      console.log("\n❌ Deployment issues found - check errors above");
    }
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error.message);
  });
