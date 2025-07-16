#!/usr/bin/env node

import * as ftp from "basic-ftp";

// Test multiple hosting configurations
const HOSTINGER_CONFIGS = [
  {
    name: "reportvisascam.com (Primary)",
    host: "reportvisascam.com",
    user: "u611952859.reportvisascam.com",
  },
  {
    name: "crossbordersmigrations.com (Backup)",
    host: "crossbordersmigrations.com",
    user: "u611952859.reportvisascam.com",
  },
  {
    name: "Alternative User Account",
    host: "crossbordersmigrations.com",
    user: "u611952859.crossborder1120",
  },
];

async function checkDomainStatus() {
  console.log("🔍 CHECKING REPORTVISASCAM.COM STATUS");
  console.log("=".repeat(50));

  console.log("📋 DOMAIN INFORMATION:");
  console.log("   Domain: reportvisascam.com");
  console.log("   Status: Registered (Nov 3, 2024 - Nov 3, 2025)");
  console.log("   Current NS: ns1.dyna-ns.net, ns2.dyna-ns.net");
  console.log("   Issue: NOT pointing to Hostinger");

  console.log("\n🧪 TESTING HOSTINGER ACCESS:");

  let workingConfig = null;

  for (const config of HOSTINGER_CONFIGS) {
    console.log(`\n${config.name}:`);
    console.log("-".repeat(30));

    const client = new ftp.Client();
    client.timeout = 15000;

    try {
      await client.access({
        host: config.host,
        user: config.user,
        password: "One@click1",
        port: 21,
        secure: false,
      });

      console.log("✅ FTP Connection: SUCCESS");

      // Check directory structure
      try {
        await client.cd("public_html");
        console.log("✅ public_html: Found");
      } catch (e) {
        console.log("⚠️  public_html: Not found");
      }

      // List files
      const files = await client.list();
      const hasIndex = files.some((f) => f.name === "index.html");
      const hasAssets = files.some((f) => f.name === "assets");
      const hasData = files.some((f) => f.name === "data");

      console.log(
        `${hasIndex ? "✅" : "❌"} index.html: ${hasIndex ? "Found" : "Missing"}`,
      );
      console.log(
        `${hasAssets ? "✅" : "❌"} assets: ${hasAssets ? "Found" : "Missing"}`,
      );
      console.log(
        `${hasData ? "✅" : "❌"} data: ${hasData ? "Found" : "Missing"}`,
      );

      if (hasIndex) {
        workingConfig = config;
        console.log("🎉 WORKING CONFIGURATION!");
      }
    } catch (error) {
      console.log("❌ Connection Failed:", error.message);
    } finally {
      client.close();
    }
  }

  console.log("\n📊 DIAGNOSIS SUMMARY:");
  console.log("=".repeat(30));

  if (workingConfig) {
    console.log("✅ Hostinger hosting is working");
    console.log(`✅ Files are deployed on: ${workingConfig.host}`);
    console.log("❌ Domain reportvisascam.com not pointing to hosting");
  } else {
    console.log("❌ No working Hostinger configuration found");
  }

  console.log("\n🔧 SOLUTION:");
  console.log("1. Change reportvisascam.com nameservers to Hostinger");
  console.log("2. Add reportvisascam.com domain in Hostinger cPanel");
  console.log("3. Wait 24-48 hours for DNS propagation");

  if (workingConfig && workingConfig.host !== "reportvisascam.com") {
    console.log(`\n🌐 TEMPORARY ACCESS:`);
    console.log(`   Try: https://${workingConfig.host}`);
  }

  return workingConfig;
}

async function deployToWorkingDomain() {
  console.log("\n🚀 DEPLOYING TO WORKING DOMAIN:");

  // This would deploy to whatever domain is working
  console.log("Run: npm run deploy-now");
  console.log("This will deploy to the working hosting configuration");
}

checkDomainStatus()
  .then((workingConfig) => {
    if (workingConfig) {
      console.log(
        "\n✅ Diagnosis complete - hosting works, domain needs fixing",
      );
    } else {
      console.log("\n❌ Diagnosis complete - hosting setup needed");
    }
  })
  .catch((error) => {
    console.error("💥 Check failed:", error.message);
  });
