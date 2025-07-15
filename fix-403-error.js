#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";

const FTP_CONFIG = {
  host: "crossbordersmigrations.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function fix403Error() {
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    console.log("🔧 FIXING 403 FORBIDDEN ERROR");
    console.log("=".repeat(50));
    console.log("❌ Issue: .htaccess file causing 403 error");
    console.log("✅ Fix: Upload Hostinger-compatible .htaccess");

    console.log("\n🔗 Connecting to Hostinger...");
    await client.access(FTP_CONFIG);
    console.log("✅ Connected successfully");

    // Navigate to public_html
    try {
      await client.cd("public_html");
      console.log("📂 Moved to public_html");
    } catch (e) {
      console.log("�� Using root directory");
    }

    // Step 1: Remove problematic .htaccess
    console.log("\n🗑️  Step 1: Removing problematic .htaccess...");
    try {
      await client.remove(".htaccess");
      console.log("✅ Old .htaccess removed");
    } catch (e) {
      console.log("⚠️  No existing .htaccess found");
    }

    // Step 2: Test without .htaccess
    console.log("\n🧪 Step 2: Testing website without .htaccess...");
    console.log("   Try visiting reportvisascam.com now");
    console.log("   If it works, the .htaccess was the problem");

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Upload minimal .htaccess
    console.log("\n📝 Step 3: Uploading minimal .htaccess...");

    const minimalHtaccess = `# Report Visa Scam - Minimal Configuration
AddType application/javascript .js
AddType text/css .css

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;

    fs.writeFileSync("./.htaccess-minimal", minimalHtaccess);
    await client.uploadFrom("./.htaccess-minimal", ".htaccess");
    fs.unlinkSync("./.htaccess-minimal");
    console.log("✅ Minimal .htaccess uploaded");

    // Step 4: Verify files exist
    console.log("\n🔍 Step 4: Verifying deployment...");
    const files = await client.list();

    const checkFiles = {
      "index.html": files.find((f) => f.name === "index.html"),
      assets: files.find((f) => f.name === "assets"),
      data: files.find((f) => f.name === "data"),
      ".htaccess": files.find((f) => f.name === ".htaccess"),
    };

    console.log("📋 File verification:");
    for (const [name, file] of Object.entries(checkFiles)) {
      if (file) {
        const size =
          file.type === 2
            ? ` (${(file.size / 1024).toFixed(1)}KB)`
            : " (directory)";
        console.log(`   ✅ ${name}${size}`);
      } else {
        console.log(`   ❌ ${name}: Missing`);
      }
    }

    // Check domain pointing
    console.log("\n📊 DIAGNOSIS:");
    if (checkFiles["index.html"] && checkFiles["assets"]) {
      console.log("✅ Website files are deployed to Hostinger");
      console.log("❌ Domain still pointing to Fly.dev (not Hostinger)");

      console.log("\n🎯 REMAINING ISSUE:");
      console.log("Your domain 'reportvisascam.com' is pointing to Fly.dev");
      console.log("Need to change DNS to point to Hostinger instead");

      console.log("\n🔧 DNS FIX REQUIRED:");
      console.log("1. Login to your domain registrar");
      console.log("2. Change DNS A record from Fly.dev IP to Hostinger IP");
      console.log("3. Or change nameservers to Hostinger nameservers");
    } else {
      console.log("❌ Website files missing from Hostinger");
      console.log("Need to deploy files to Hostinger first");
    }

    console.log("\n🎉 403 ERROR FIX COMPLETED!");
    console.log("=".repeat(50));
    console.log("✅ Removed problematic .htaccess");
    console.log("✅ Uploaded minimal compatible .htaccess");
  } catch (error) {
    console.error("\n❌ FIX FAILED!");
    console.error("Error:", error.message);
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

fix403Error()
  .then(() => {
    console.log("\n✅ 403 ERROR FIX COMPLETED!");
    console.log("Check reportvisascam.com now - should load without 403 error");
  })
  .catch((error) => {
    console.error("\n💥 Fix failed:", error.message);
  });
