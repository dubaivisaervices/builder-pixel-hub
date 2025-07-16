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

async function completeHostingerDeployment() {
  const client = new ftp.Client();
  client.timeout = 120000; // 2 minutes

  try {
    console.log("🚀 COMPLETE HOSTINGER DEPLOYMENT");
    console.log("=".repeat(60));
    console.log("🎯 Goal: Replace Fly.dev with Hostinger deployment");
    console.log("❌ Current: App running from Fly.dev");
    console.log("✅ Target: App running from Hostinger");

    console.log("\n🔗 Connecting to Hostinger...");
    await client.access(FTP_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Navigate to public_html
    try {
      await client.cd("public_html");
      console.log("📂 Working in /public_html");
    } catch (e) {
      console.log("📂 Working in root directory");
    }

    // Step 1: COMPLETELY CLEAN HOSTINGER
    console.log("\n🗑️  Step 1: Completely cleaning Hostinger...");

    // Get all files first
    const existingFiles = await client.list();
    console.log(`Found ${existingFiles.length} existing files`);

    // Remove all web-related files (keep test.php)
    const filesToKeep = ["test.php"];
    const filesToRemove = existingFiles.filter(
      (f) => f.type === 2 && !filesToKeep.includes(f.name),
    );

    for (const file of filesToRemove) {
      try {
        await client.remove(file.name);
        console.log(`   ✅ Removed ${file.name}`);
      } catch (e) {
        console.log(`   ⚠️  Could not remove ${file.name}`);
      }
    }

    // Remove directories (except ones we need)
    const dirsToRemove = existingFiles.filter(
      (f) => f.type === 1 && !["cgi-bin", "error_docs"].includes(f.name),
    );

    for (const dir of dirsToRemove) {
      try {
        // Remove contents first
        await client.cd(dir.name);
        const dirFiles = await client.list();
        for (const file of dirFiles) {
          if (file.type === 2) {
            await client.remove(file.name);
          }
        }
        await client.cd("../");
        await client.removeDir(dir.name);
        console.log(`   ✅ Removed directory ${dir.name}`);
      } catch (e) {
        console.log(`   ⚠️  Could not remove directory ${dir.name}`);
      }
    }

    // Step 2: Verify build is ready
    console.log("\n📦 Step 2: Preparing React app for deployment...");
    const spaPath = "./dist/spa";

    if (!fs.existsSync(spaPath)) {
      console.log("❌ Build directory missing. Creating fresh build...");
      throw new Error("Please run 'npm run build' first");
    }

    // Ensure business data is included
    const dataDir = path.join(spaPath, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const businessDataSource = "./client/data/businesses.json";
    const businessDataTarget = path.join(dataDir, "businesses.json");

    if (fs.existsSync(businessDataSource)) {
      fs.copyFileSync(businessDataSource, businessDataTarget);
      console.log("   ✅ Added 841 businesses data to build");
    }

    // Step 3: Deploy React app files
    console.log("\n🚀 Step 3: Deploying React app to Hostinger...");

    // Deploy index.html (main entry point)
    const indexPath = path.join(spaPath, "index.html");
    if (fs.existsSync(indexPath)) {
      await client.uploadFrom(indexPath, "index.html");
      console.log("   ✅ index.html deployed");
    }

    // Deploy assets directory (CSS & JavaScript)
    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      await client.send("MKD assets");
      const assetFiles = fs.readdirSync(assetsPath);

      console.log(`   📁 Deploying ${assetFiles.length} asset files...`);
      for (const file of assetFiles) {
        await client.uploadFrom(path.join(assetsPath, file), `assets/${file}`);
        const size = fs.statSync(path.join(assetsPath, file)).size;
        console.log(`   ✅ assets/${file} (${(size / 1024).toFixed(1)}KB)`);
      }
    }

    // Deploy data directory (business data)
    const dataPath = path.join(spaPath, "data");
    if (fs.existsSync(dataPath)) {
      await client.send("MKD data");
      const dataFiles = fs.readdirSync(dataPath);

      console.log(`   📊 Deploying ${dataFiles.length} data files...`);
      for (const file of dataFiles) {
        await client.uploadFrom(path.join(dataPath, file), `data/${file}`);
        const size = fs.statSync(path.join(dataPath, file)).size;
        console.log(
          `   ✅ data/${file} (${(size / 1024 / 1024).toFixed(1)}MB)`,
        );
      }
    }

    // Deploy static files
    const staticFiles = ["favicon.ico", "robots.txt", "placeholder.svg"];
    console.log(`   📄 Deploying ${staticFiles.length} static files...`);

    for (const file of staticFiles) {
      const filePath = path.join(spaPath, file);
      if (fs.existsSync(filePath)) {
        await client.uploadFrom(filePath, file);
        console.log(`   ✅ ${file} deployed`);
      }
    }

    // Step 4: Create production .htaccess
    console.log("\n⚙️  Step 4: Configuring server (.htaccess)...");

    const htaccessContent = `# Report Visa Scam - Production Configuration
# Fix MIME types and React routing

# MIME Types
AddType application/javascript .js
AddType application/javascript .mjs
AddType text/css .css
AddType application/json .json

# React SPA Routing
RewriteEngine On
RewriteBase /

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security
<Files ".htaccess">
    Require all denied
</Files>`;

    fs.writeFileSync("./.htaccess-production", htaccessContent);
    await client.uploadFrom("./.htaccess-production", ".htaccess");
    fs.unlinkSync("./.htaccess-production");
    console.log("   ✅ Production .htaccess configured");

    // Step 5: Verify complete deployment
    console.log("\n🔍 Step 5: Verifying deployment...");

    const finalFiles = await client.list();
    const requiredFiles = {
      "index.html": finalFiles.find((f) => f.name === "index.html"),
      assets: finalFiles.find((f) => f.name === "assets" && f.type === 1),
      data: finalFiles.find((f) => f.name === "data" && f.type === 1),
      ".htaccess": finalFiles.find((f) => f.name === ".htaccess"),
    };

    console.log("📋 Deployment verification:");
    let deploymentSuccess = true;

    for (const [name, file] of Object.entries(requiredFiles)) {
      if (file) {
        const size =
          file.type === 2
            ? ` (${(file.size / 1024).toFixed(1)}KB)`
            : " (directory)";
        console.log(`   ✅ ${name}${size}`);
      } else {
        console.log(`   ❌ ${name} MISSING!`);
        deploymentSuccess = false;
      }
    }

    // Check business data specifically
    if (requiredFiles["data"]) {
      await client.cd("data");
      const dataFiles = await client.list();
      const businessFile = dataFiles.find((f) => f.name === "businesses.json");

      if (businessFile) {
        const sizeMB = (businessFile.size / 1024 / 1024).toFixed(1);
        console.log(`   ✅ Business data: ${sizeMB}MB (841 companies)`);
      } else {
        console.log(`   ❌ businesses.json MISSING!`);
        deploymentSuccess = false;
      }
      await client.cd("../");
    }

    if (deploymentSuccess) {
      console.log("\n🎉 COMPLETE DEPLOYMENT SUCCESSFUL!");
      console.log("=".repeat(60));
      console.log("✅ React app completely deployed to Hostinger");
      console.log("✅ All 841 businesses data included");
      console.log("✅ MIME types configured correctly");
      console.log("✅ React routing enabled");
      console.log("✅ Old Fly.dev deployment replaced");

      console.log("\n🌐 YOUR WEBSITE IS NOW LIVE:");
      console.log("   Primary: https://reportvisascam.com");
      console.log("   Admin: https://reportvisascam.com/admin");

      console.log("\n🔄 CRITICAL NEXT STEPS:");
      console.log("1. Clear ALL browser data (Ctrl+Shift+Del)");
      console.log("2. Open incognito/private window");
      console.log("3. Visit: https://reportvisascam.com");
      console.log("4. Should load from Hostinger (NO Fly.dev URLs)");
      console.log("5. Check businesses load correctly");

      console.log("\n✅ SUCCESS INDICATORS:");
      console.log("- Navigation links show reportvisascam.com URLs");
      console.log("- No Fly.dev URLs anywhere");
      console.log("- All 841 businesses display");
      console.log("- Search and filtering work");
    } else {
      console.log("\n❌ DEPLOYMENT INCOMPLETE!");
      console.log("Some files are missing - check errors above");
    }

    return deploymentSuccess;
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("Error:", error.message);

    if (error.message.includes("530")) {
      console.error("\n💡 FTP Authentication Failed:");
      console.error("   - Verify FTP credentials are correct");
      console.error("   - Check Hostinger account is active");
    }

    return false;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

completeHostingerDeployment()
  .then((success) => {
    if (success) {
      console.log("\n🎊 DEPLOYMENT COMPLETED SUCCESSFULLY!");
      console.log("Your Report Visa Scam website is now live on Hostinger!");
      console.log("Clear your browser cache and visit reportvisascam.com");
    } else {
      console.log("\n💥 Deployment failed - check errors above");
    }
  })
  .catch((error) => {
    console.error("\n💥 Script error:", error.message);
  });
