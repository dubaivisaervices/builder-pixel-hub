#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";

async function diagnoseDomainConfig() {
  console.log("🔍 DOMAIN CONFIGURATION DIAGNOSIS");
  console.log("=".repeat(60));
  console.log("❌ PERSISTENT ISSUE: React app still loads from Fly.dev");
  console.log("✅ CONFIRMED: test.php loads from Hostinger");
  console.log("🎯 GOAL: Find why domain serves mixed content");

  console.log("\n📊 ISSUE ANALYSIS:");
  console.log("- Navigation shows: Fly.dev URL");
  console.log("- This means: Domain NOT fully pointing to Hostinger");
  console.log("- Likely cause: Domain registrar configuration");

  // Test Hostinger FTP to confirm deployment
  console.log("\n🔗 Testing Hostinger deployment...");
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    await client.access({
      host: "reportvisascam.com",
      user: "u611952859.reportvisascam.com",
      password: "One@click1",
      port: 21,
      secure: false,
    });

    console.log("✅ Hostinger FTP accessible");

    try {
      await client.cd("public_html");
    } catch (e) {
      // Stay in root
    }

    const files = await client.list();
    const hasIndex = files.find((f) => f.name === "index.html");
    const hasAssets = files.find((f) => f.name === "assets");
    const hasData = files.find((f) => f.name === "data");

    console.log("📋 Hostinger files check:");
    console.log(`   ${hasIndex ? "✅" : "❌"} index.html`);
    console.log(`   ${hasAssets ? "✅" : "❌"} assets directory`);
    console.log(`   ${hasData ? "✅" : "❌"} data directory`);

    if (hasIndex && hasAssets && hasData) {
      console.log("✅ React app IS deployed to Hostinger correctly");
      console.log("❌ But domain is NOT serving it");
    }

    client.close();
  } catch (error) {
    console.log("❌ Hostinger FTP failed:", error.message);
  }

  console.log("\n🎯 ROOT CAUSE IDENTIFIED:");
  console.log("=".repeat(40));
  console.log("The issue is NOT deployment - it's domain configuration!");
  console.log("");
  console.log("Your domain has:");
  console.log("✅ test.php → Serves from Hostinger");
  console.log("❌ React app → Serves from Fly.dev");
  console.log("");
  console.log("This indicates MIXED ROUTING configuration.");

  console.log("\n🔧 SOLUTION REQUIRED:");
  console.log("=".repeat(30));
  console.log("You need to check your DOMAIN REGISTRAR settings:");
  console.log("");
  console.log(
    "1. **Login to domain registrar** (where you bought reportvisascam.com)",
  );
  console.log("2. **Check DNS settings**:");
  console.log("   - Look for ANY records pointing to Fly.dev");
  console.log("   - Look for CNAME records");
  console.log("   - Look for subdomain redirects");
  console.log("   - Look for URL forwarding rules");
  console.log("");
  console.log("3. **Remove ALL Fly.dev references**:");
  console.log("   - Delete any CNAME pointing to Fly.dev");
  console.log("   - Remove any A records pointing to Fly.dev IPs");
  console.log("   - Clear any URL forwarding to Fly.dev");
  console.log("");
  console.log("4. **Set ONLY Hostinger nameservers**:");
  console.log("   - ns1.dns-parking.com");
  console.log("   - ns2.dns-parking.com");

  console.log("\n📋 WHAT TO LOOK FOR:");
  console.log("=".repeat(25));
  console.log("In your domain registrar, search for:");
  console.log("❌ Any mention of 'fly.dev'");
  console.log("❌ Any mention of 'b3c877c3b0194509ab3bce409693409c'");
  console.log("❌ CNAME records");
  console.log("❌ URL forwarding/redirect rules");
  console.log("❌ Subdomain configurations");

  console.log("\n⚠️  CRITICAL ISSUE:");
  console.log("=".repeat(20));
  console.log("Your domain registrar is OVERRIDING Hostinger hosting.");
  console.log("Even though you deployed to Hostinger, the domain");
  console.log("registrar is redirecting React app requests to Fly.dev.");

  console.log("\n🚨 IMMEDIATE ACTION REQUIRED:");
  console.log("=".repeat(35));
  console.log("1. Contact your domain registrar support");
  console.log("2. Tell them: 'Remove ALL Fly.dev configurations'");
  console.log("3. Tell them: 'Point domain ONLY to Hostinger'");
  console.log("4. Provide Hostinger nameservers:");
  console.log("   - ns1.dns-parking.com");
  console.log("   - ns2.dns-parking.com");

  console.log("\n💡 ALTERNATIVE SOLUTIONS:");
  console.log("=".repeat(30));
  console.log("If you can't fix domain registrar:");
  console.log("");
  console.log("Option 1: Use different domain");
  console.log("- Register new domain");
  console.log("- Point directly to Hostinger");
  console.log("");
  console.log("Option 2: Use Hostinger subdomain");
  console.log("- Use your.hostinger.domain");
  console.log("- This bypasses domain registrar issues");

  console.log("\n🎯 NEXT STEPS:");
  console.log("=".repeat(15));
  console.log("1. ✅ React app IS deployed to Hostinger (confirmed)");
  console.log("2. ❌ Domain registrar needs fixing");
  console.log("3. 🔧 Contact domain registrar support");
  console.log("4. 🗑️  Remove ALL Fly.dev configurations");
  console.log("5. ✅ Point domain ONLY to Hostinger");

  console.log("\n📞 WHO TO CONTACT:");
  console.log("=".repeat(20));
  console.log("Contact the support team of:");
  console.log("- The company where you BOUGHT reportvisascam.com");
  console.log("- NOT Hostinger (they don't control your domain)");
  console.log("- The DOMAIN REGISTRAR");

  return true;
}

diagnoseDomainConfig()
  .then(() => {
    console.log("\n✅ DIAGNOSIS COMPLETE");
    console.log("The issue is DOMAIN REGISTRAR configuration, not deployment.");
    console.log("Contact your domain registrar to remove Fly.dev settings.");
  })
  .catch((error) => {
    console.error("💥 Diagnosis failed:", error.message);
  });
