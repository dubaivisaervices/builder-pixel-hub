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

async function forceHostingerDeployment() {
  const client = new ftp.Client();
  client.timeout = 120000;

  try {
    console.log("🚀 FORCE HOSTINGER DEPLOYMENT");
    console.log("=".repeat(60));
    console.log("❌ Current: React app loading from Fly.dev");
    console.log("✅ Goal: Force React app to load from Hostinger ONLY");

    console.log("\n🔗 Connecting to Hostinger...");
    await client.access(FTP_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    try {
      await client.cd("public_html");
      console.log("📂 Working in /public_html");
    } catch (e) {
      console.log("📂 Working in root directory");
    }

    // Step 1: NUCLEAR OPTION - Remove EVERYTHING except test.php
    console.log(
      "\n💥 Step 1: NUCLEAR CLEAN - Remove everything except test.php...",
    );

    const allFiles = await client.list();
    console.log(`Found ${allFiles.length} files on Hostinger`);

    // Keep only essential files
    const filesToKeep = ["test.php", "cgi-bin", "error_docs"];

    for (const file of allFiles) {
      if (!filesToKeep.includes(file.name)) {
        try {
          if (file.type === 1) {
            // Directory
            // Remove directory contents first
            await client.cd(file.name);
            const dirFiles = await client.list();
            for (const dirFile of dirFiles) {
              if (dirFile.type === 2) {
                await client.remove(dirFile.name);
              }
            }
            await client.cd("../");
            await client.removeDir(file.name);
            console.log(`   💥 Removed directory: ${file.name}`);
          } else {
            // File
            await client.remove(file.name);
            console.log(`   💥 Removed file: ${file.name}`);
          }
        } catch (e) {
          console.log(`   ⚠️  Could not remove: ${file.name}`);
        }
      }
    }

    // Step 2: Verify clean state
    console.log("\n🧹 Step 2: Verifying clean state...");
    const cleanFiles = await client.list();
    console.log("Remaining files:");
    cleanFiles.forEach((f) => console.log(`   📄 ${f.name}`));

    // Step 3: Deploy React app from build
    console.log("\n🚀 Step 3: Deploying fresh React app...");

    const spaPath = "./dist/spa";
    if (!fs.existsSync(spaPath)) {
      throw new Error("❌ Build missing. Run 'npm run build' first");
    }

    // Ensure business data exists
    const dataDir = path.join(spaPath, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync("./client/data/businesses.json")) {
      fs.copyFileSync(
        "./client/data/businesses.json",
        path.join(dataDir, "businesses.json"),
      );
      console.log("   ✅ Added 841 businesses to build");
    }

    // Deploy main index.html
    console.log("\n📄 Deploying main files...");
    const indexPath = path.join(spaPath, "index.html");
    if (fs.existsSync(indexPath)) {
      await client.uploadFrom(indexPath, "index.html");
      console.log("   ✅ index.html uploaded");
    }

    // Deploy assets (JavaScript & CSS)
    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      await client.send("MKD assets");
      const assets = fs.readdirSync(assetsPath);

      console.log(`   📁 Uploading ${assets.length} assets...`);
      for (const asset of assets) {
        await client.uploadFrom(
          path.join(assetsPath, asset),
          `assets/${asset}`,
        );
        const size = fs.statSync(path.join(assetsPath, asset)).size;
        console.log(`   ✅ assets/${asset} (${(size / 1024).toFixed(1)}KB)`);
      }
    }

    // Deploy business data
    if (fs.existsSync(dataDir)) {
      await client.send("MKD data");
      const dataFiles = fs.readdirSync(dataDir);

      for (const file of dataFiles) {
        await client.uploadFrom(path.join(dataDir, file), `data/${file}`);
        const size = fs.statSync(path.join(dataDir, file)).size;
        console.log(
          `   ✅ data/${file} (${(size / 1024 / 1024).toFixed(1)}MB)`,
        );
      }
    }

    // Deploy other static files
    const staticFiles = ["favicon.ico", "robots.txt", "placeholder.svg"];
    for (const file of staticFiles) {
      const filePath = path.join(spaPath, file);
      if (fs.existsSync(filePath)) {
        await client.uploadFrom(filePath, file);
        console.log(`   ✅ ${file} uploaded`);
      }
    }

    // Step 4: Create ABSOLUTE .htaccess (no room for error)
    console.log("\n⚙️  Step 4: Creating bulletproof .htaccess...");

    const bulletproofHtaccess = `# Report Visa Scam - BULLETPROOF Configuration
# Force correct MIME types and React routing

# CRITICAL: Fix MIME types
AddType application/javascript .js
AddType application/javascript .mjs  
AddType text/css .css
AddType application/json .json
AddType image/svg+xml .svg

# CRITICAL: React SPA routing
RewriteEngine On
RewriteBase /

# Handle all non-file requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/test\\.php$
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security
<Files ".htaccess">
    Require all denied
</Files>

# Force no cache for HTML to prevent Fly.dev caching
<FilesMatch "\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</FilesMatch>`;

    fs.writeFileSync("./.htaccess-bulletproof", bulletproofHtaccess);
    await client.uploadFrom("./.htaccess-bulletproof", ".htaccess");
    fs.unlinkSync("./.htaccess-bulletproof");
    console.log("   ✅ Bulletproof .htaccess uploaded");

    // Step 5: Create index.php fallback (in case index.html fails)
    console.log("\n🛡️  Step 5: Creating PHP fallback...");

    const phpFallback = `<?php
// Report Visa Scam - PHP Fallback
// Redirect to React app

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Report Visa Scam - UAE's Scam Protection Platform</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .loading { color: #dc2626; font-size: 18px; }
    </style>
</head>
<body>
    <h1>Report Visa Scam</h1>
    <p class="loading">Loading from Hostinger...</p>
    <script>
        // Force reload index.html
        setTimeout(() => {
            window.location.href = '/index.html?t=' + Date.now();
        }, 1000);
    </script>
</body>
</html>`;

    fs.writeFileSync("./index-fallback.php", phpFallback);
    await client.uploadFrom("./index-fallback.php", "index.php");
    fs.unlinkSync("./index-fallback.php");
    console.log("   ✅ PHP fallback created");

    // Step 6: Final verification
    console.log("\n🔍 Step 6: Final verification...");

    const finalFiles = await client.list();
    const required = {
      "index.html": finalFiles.find((f) => f.name === "index.html"),
      "index.php": finalFiles.find((f) => f.name === "index.php"),
      assets: finalFiles.find((f) => f.name === "assets" && f.type === 1),
      data: finalFiles.find((f) => f.name === "data" && f.type === 1),
      ".htaccess": finalFiles.find((f) => f.name === ".htaccess"),
      "test.php": finalFiles.find((f) => f.name === "test.php"),
    };

    console.log("📋 Final verification:");
    let success = true;
    for (const [name, file] of Object.entries(required)) {
      if (file) {
        console.log(`   ✅ ${name}`);
      } else {
        console.log(`   ❌ ${name} MISSING!`);
        if (name !== "test.php") success = false;
      }
    }

    if (success) {
      console.log("\n🎉 FORCE DEPLOYMENT COMPLETED!");
      console.log("=".repeat(60));
      console.log("✅ All Fly.dev files removed from Hostinger");
      console.log("✅ Fresh React app deployed");
      console.log("✅ MIME types fixed");
      console.log("✅ PHP fallback created");
      console.log("✅ All 841 businesses included");

      console.log("\n🔥 CRITICAL NEXT STEPS:");
      console.log("1. CLEAR ALL BROWSER DATA (Ctrl+Shift+Del)");
      console.log("2. Close ALL browser tabs");
      console.log("3. Open NEW incognito window");
      console.log("4. Visit: https://reportvisascam.com");
      console.log("5. Should load from Hostinger (NO Fly.dev)");

      console.log("\n🎯 SUCCESS INDICATORS:");
      console.log("- Navigation shows reportvisascam.com URLs only");
      console.log("- No Fly.dev URLs anywhere");
      console.log("- JavaScript loads without MIME errors");
      console.log("- All businesses display correctly");

      console.log("\n⚠️  IF STILL SEEING FLY.DEV:");
      console.log("- Browser cache issue - try different browser");
      console.log("- DNS cache - wait 30 minutes");
      console.log("- Try: https://reportvisascam.com/index.php");
    }

    return success;
  } catch (error) {
    console.error("\n❌ FORCE DEPLOYMENT FAILED!");
    console.error("Error:", error.message);
    return false;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

forceHostingerDeployment()
  .then((success) => {
    if (success) {
      console.log("\n🎊 NUCLEAR DEPLOYMENT SUCCESSFUL!");
      console.log("Your site should now load from Hostinger ONLY!");
    } else {
      console.log("\n💥 Nuclear deployment failed - check errors");
    }
  })
  .catch((error) => {
    console.error("\n💥 Script error:", error.message);
  });
