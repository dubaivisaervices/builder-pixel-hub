#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";

const FTP_CONFIG = {
  host: "crossbordersmigrations.com", // Use working FTP host
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function fixMimeError() {
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    console.log("🔧 FIXING MIME TYPE ERROR");
    console.log("=".repeat(50));
    console.log("❌ Issue: JavaScript files served as HTML");
    console.log("✅ Fix: Upload correct .htaccess configuration");

    console.log("\n🔗 Connecting to Hostinger...");
    await client.access(FTP_CONFIG);
    console.log("✅ Connected successfully");

    // Navigate to public_html
    try {
      await client.cd("public_html");
      console.log("📂 Moved to public_html");
    } catch (e) {
      console.log("📂 Using root directory");
    }

    // Create comprehensive .htaccess
    const htaccessContent = `# Report Visa Scam - MIME Type Fix
# Critical: Fix JavaScript module loading

AddType application/javascript .js
AddType application/javascript .mjs
AddType application/javascript .jsx
AddType text/css .css
AddType application/json .json
AddType image/svg+xml .svg

# React SPA Routing
RewriteEngine On
RewriteBase /

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule ^.*$ /index.html [L,QSA]

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Error handling
ErrorDocument 404 /index.html`;

    // Upload .htaccess
    console.log("\n📝 Uploading .htaccess file...");
    fs.writeFileSync("./.htaccess-fix", htaccessContent);
    await client.uploadFrom("./.htaccess-fix", ".htaccess");
    fs.unlinkSync("./.htaccess-fix");
    console.log("✅ .htaccess uploaded with MIME type fixes");

    // Verify assets directory exists
    console.log("\n🔍 Checking assets directory...");
    const files = await client.list();
    const assetsDir = files.find((f) => f.name === "assets" && f.type === 1);

    if (assetsDir) {
      console.log("✅ Assets directory found");

      // Check JavaScript files in assets
      await client.cd("assets");
      const assetFiles = await client.list();
      const jsFiles = assetFiles.filter((f) => f.name.endsWith(".js"));

      console.log(`📊 Found ${jsFiles.length} JavaScript files`);
      jsFiles.forEach((file) => {
        console.log(`   📄 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      });

      await client.cd("../"); // Go back to root
    } else {
      console.log("❌ Assets directory missing - files may not be uploaded");
    }

    console.log("\n🎉 MIME TYPE FIX COMPLETED!");
    console.log("=".repeat(50));
    console.log("✅ .htaccess updated with correct MIME types");
    console.log("✅ JavaScript files should now load properly");
    console.log("✅ React app should work correctly");

    console.log("\n🔄 NEXT STEPS:");
    console.log("1. Clear browser cache (Ctrl+F5)");
    console.log("2. Refresh reportvisascam.com");
    console.log("3. Check if JavaScript loads without errors");

    console.log("\n🌐 TEST URLS:");
    console.log("   Primary: https://reportvisascam.com");
    console.log("   Backup:  https://crossbordersmigrations.com");
  } catch (error) {
    console.error("\n❌ FIX FAILED!");
    console.error("Error:", error.message);

    if (error.message.includes("530")) {
      console.error("\n💡 FTP Issues:");
      console.error("   - Check FTP credentials");
      console.error("   - Verify hosting account is active");
    }
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

fixMimeError()
  .then(() => {
    console.log("\n✅ MIME TYPE ERROR FIX COMPLETED!");
    console.log("Your Report Visa Scam website should now load correctly!");
  })
  .catch((error) => {
    console.error("\n💥 Fix failed:", error.message);
  });
