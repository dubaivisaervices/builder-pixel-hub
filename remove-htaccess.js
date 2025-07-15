#!/usr/bin/env node

import * as ftp from "basic-ftp";

const FTP_CONFIG = {
  host: "crossbordersmigrations.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function removeHtaccess() {
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    console.log("🗑️  REMOVING .HTACCESS TO FIX 403 ERROR");
    console.log("=".repeat(50));

    await client.access(FTP_CONFIG);
    console.log("✅ Connected to Hostinger");

    try {
      await client.cd("public_html");
      console.log("📂 Moved to public_html");
    } catch (e) {
      console.log("📂 Using root directory");
    }

    // Remove .htaccess file completely
    try {
      await client.remove(".htaccess");
      console.log("✅ .htaccess file removed");
    } catch (e) {
      console.log("⚠️  No .htaccess file found to remove");
    }

    // Check if website files exist
    const files = await client.list();
    const hasIndex = files.find((f) => f.name === "index.html");
    const hasAssets = files.find((f) => f.name === "assets");

    console.log("\n📋 Hostinger Files Check:");
    console.log(`   ${hasIndex ? "✅" : "❌"} index.html`);
    console.log(`   ${hasAssets ? "✅" : "❌"} assets directory`);

    if (hasIndex && hasAssets) {
      console.log("\n🎉 SUCCESS: Website files are on Hostinger!");
      console.log("❌ ISSUE: Domain pointing to Fly.dev, not Hostinger");
    } else {
      console.log("\n❌ ISSUE: Website files not deployed to Hostinger");
    }

    console.log("\n🔧 NEXT STEPS:");
    console.log("1. Test reportvisascam.com without .htaccess");
    console.log("2. If still on Fly.dev, fix DNS configuration");
    console.log("3. Point domain to Hostinger, not Fly.dev");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    client.close();
  }
}

removeHtaccess();
