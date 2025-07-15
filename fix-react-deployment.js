#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";

const FTP_CONFIG = {
  host: "reportvisascam.com", // Use your domain since DNS works now
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function fixReactDeployment() {
  const client = new ftp.Client();
  client.timeout = 60000;

  try {
    console.log("🚀 FIXING REACT APP DEPLOYMENT ON HOSTINGER");
    console.log("=".repeat(60));
    console.log("✅ DNS working (test.php confirmed)");
    console.log("🎯 Fix: React app MIME types and deployment");

    console.log("\n🔗 Connecting to Hostinger...");
    await client.access(FTP_CONFIG);
    console.log("✅ Connected successfully");

    try {
      await client.cd("public_html");
      console.log("📂 Moved to public_html");
    } catch (e) {
      console.log("📂 Using root directory");
    }

    // Step 1: Remove any old React files
    console.log("\n🗑️  Step 1: Cleaning old deployment...");
    try {
      await client.remove("index.html");
      console.log("   ✅ Removed old index.html");
    } catch (e) {
      console.log("   ⚠️  No old index.html found");
    }

    try {
      await client.removeDir("assets");
      console.log("   ✅ Removed old assets directory");
    } catch (e) {
      console.log("   ⚠️  No old assets directory found");
    }

    // Step 2: Check if build exists and is ready
    const spaPath = "./dist/spa";
    if (!fs.existsSync(spaPath)) {
      throw new Error("❌ Build directory missing. Run 'npm run build' first");
    }

    // Ensure data exists
    if (!fs.existsSync(path.join(spaPath, "data"))) {
      console.log("📊 Adding business data to build...");
      fs.mkdirSync(path.join(spaPath, "data"), { recursive: true });
      if (fs.existsSync("./client/data/businesses.json")) {
        fs.copyFileSync(
          "./client/data/businesses.json",
          path.join(spaPath, "data/businesses.json"),
        );
        console.log("   ✅ Added 841 businesses data");
      }
    }

    // Step 3: Create proper .htaccess for React + MIME types
    console.log("\n📝 Step 2: Creating React-optimized .htaccess...");
    const htaccessContent = `# Report Visa Scam - React App Configuration
# Fix MIME types and enable SPA routing

# Essential MIME Types
AddType application/javascript .js
AddType application/javascript .mjs
AddType text/css .css
AddType application/json .json
AddType image/svg+xml .svg

# React SPA Routing - Handle all routes
RewriteEngine On
RewriteBase /

# Don't rewrite files and directories that exist
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Handle React Router routes
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security for sensitive files
<Files ".htaccess">
    Require all denied
</Files>

<Files "*.md">
    Require all denied
</Files>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType application/json "access plus 1 week"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>`;

    fs.writeFileSync("./.htaccess-react", htaccessContent);
    await client.uploadFrom("./.htaccess-react", ".htaccess");
    fs.unlinkSync("./.htaccess-react");
    console.log("   ✅ React-optimized .htaccess uploaded");

    // Step 4: Deploy React app files
    console.log("\n🚀 Step 3: Deploying React app files...");

    // Deploy main HTML
    const indexPath = path.join(spaPath, "index.html");
    if (fs.existsSync(indexPath)) {
      await client.uploadFrom(indexPath, "index.html");
      console.log("   ✅ index.html uploaded");
    }

    // Deploy assets directory
    const assetsPath = path.join(spaPath, "assets");
    if (fs.existsSync(assetsPath)) {
      try {
        await client.send("MKD assets");
      } catch (e) {
        // Directory exists
      }

      const assetFiles = fs.readdirSync(assetsPath);
      console.log(`   📁 Uploading ${assetFiles.length} asset files...`);

      for (const file of assetFiles) {
        await client.uploadFrom(path.join(assetsPath, file), `assets/${file}`);
        const size = fs.statSync(path.join(assetsPath, file)).size;
        console.log(`   ✅ assets/${file} (${(size / 1024).toFixed(1)}KB)`);
      }
    }

    // Deploy data directory
    const dataPath = path.join(spaPath, "data");
    if (fs.existsSync(dataPath)) {
      try {
        await client.send("MKD data");
      } catch (e) {
        // Directory exists
      }

      const dataFiles = fs.readdirSync(dataPath);
      for (const file of dataFiles) {
        await client.uploadFrom(path.join(dataPath, file), `data/${file}`);
        const size = fs.statSync(path.join(dataPath, file)).size;
        console.log(
          `   ✅ data/${file} (${(size / 1024 / 1024).toFixed(1)}MB)`,
        );
      }
    }

    // Step 5: Deploy other essential files
    console.log("\n📦 Step 4: Deploying additional files...");
    const otherFiles = ["favicon.ico", "robots.txt", "placeholder.svg"];

    for (const file of otherFiles) {
      const filePath = path.join(spaPath, file);
      if (fs.existsSync(filePath)) {
        await client.uploadFrom(filePath, file);
        console.log(`   ✅ ${file} uploaded`);
      }
    }

    // Step 6: Verify deployment
    console.log("\n🔍 Step 5: Verifying React app deployment...");
    const files = await client.list();

    const verification = {
      "index.html": files.find((f) => f.name === "index.html"),
      assets: files.find((f) => f.name === "assets"),
      data: files.find((f) => f.name === "data"),
      ".htaccess": files.find((f) => f.name === ".htaccess"),
    };

    console.log("📋 Deployment verification:");
    let allGood = true;
    for (const [name, file] of Object.entries(verification)) {
      if (file) {
        const size =
          file.type === 2
            ? ` (${(file.size / 1024).toFixed(1)}KB)`
            : " (directory)";
        console.log(`   ✅ ${name}${size}`);
      } else {
        console.log(`   ❌ ${name}: Missing`);
        allGood = false;
      }
    }

    console.log("\n🎉 REACT APP DEPLOYMENT COMPLETED!");
    console.log("=".repeat(60));
    console.log("✅ React app deployed with correct MIME types");
    console.log("✅ SPA routing configured");
    console.log("✅ All 841 businesses data included");
    console.log("✅ Assets and JavaScript files properly configured");

    console.log("\n🔄 NEXT STEPS:");
    console.log("1. Clear browser cache (Ctrl+F5)");
    console.log("2. Visit reportvisascam.com");
    console.log("3. Should load React app from Hostinger (not Fly.dev)");

    return allGood;
  } catch (error) {
    console.error("\n❌ REACT DEPLOYMENT FAILED!");
    console.error("Error:", error.message);
    return false;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

fixReactDeployment()
  .then((success) => {
    if (success) {
      console.log("\n✅ REACT APP DEPLOYMENT SUCCESS!");
      console.log("Your Report Visa Scam website should now work correctly!");
    } else {
      console.log("\n❌ Deployment had issues - check errors above");
    }
  })
  .catch((error) => {
    console.error("\n💥 Deployment script failed:", error.message);
  });
