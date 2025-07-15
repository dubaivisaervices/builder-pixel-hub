#!/usr/bin/env node

import * as ftp from "basic-ftp";

// Test multiple domain configurations
const CONFIGS = [
  {
    name: "reportvisascam.com (Direct)",
    host: "reportvisascam.com",
    user: "u611952859.reportvisascam.com",
  },
  {
    name: "crossbordersmigrations.com (Backup)",
    host: "crossbordersmigrations.com",
    user: "u611952859.reportvisascam.com",
  },
  {
    name: "Hostinger IP (Alternative)",
    host: "reportvisascam.com",
    user: "u611952859.crossborder1120",
  },
];

async function testDomainConfigs() {
  console.log("🔍 TESTING DOMAIN CONFIGURATIONS");
  console.log("=".repeat(50));

  for (const config of CONFIGS) {
    console.log(`\n🧪 Testing: ${config.name}`);
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

      // Test directory access
      try {
        await client.cd("public_html");
        console.log("✅ public_html access: SUCCESS");
      } catch (e) {
        console.log("⚠️  public_html access: Not found, using root");
      }

      // List files
      const files = await client.list();
      console.log(`✅ File count: ${files.length} files found`);

      const hasIndex = files.some((f) => f.name === "index.html");
      console.log(
        `${hasIndex ? "✅" : "❌"} index.html: ${hasIndex ? "Found" : "Missing"}`,
      );

      if (hasIndex) {
        console.log("🎉 WORKING CONFIGURATION FOUND!");
        console.log(`🌐 Use this config for deployment`);
        break;
      }
    } catch (error) {
      console.log("❌ Connection failed:", error.message);
    } finally {
      client.close();
    }
  }

  console.log("\n📋 TROUBLESHOOTING STEPS:");
  console.log("1. Check domain is added in Hostinger cPanel");
  console.log("2. Verify DNS settings point to Hostinger");
  console.log("3. Wait 24-48 hours for DNS propagation");
  console.log("4. Use working configuration for immediate deployment");
}

testDomainConfigs();
