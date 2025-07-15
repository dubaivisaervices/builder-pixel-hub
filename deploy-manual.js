#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";

// Try both domains to see which one works
const FTP_CONFIGS = [
  {
    name: "New Domain (reportvisascam.com)",
    config: {
      host: "reportvisascam.com",
      user: "u611952859.reportvisascam.com",
      password: "One@click1",
      port: 21,
      secure: false,
    },
  },
  {
    name: "Original Domain (crossbordersmigrations.com)",
    config: {
      host: "crossbordersmigrations.com",
      user: "u611952859.reportvisascam.com",
      password: "One@click1",
      port: 21,
      secure: false,
    },
  },
];

async function deployWithConfig(configInfo) {
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    console.log(`\n🔄 Trying: ${configInfo.name}`);
    console.log("=".repeat(40));

    await client.access(configInfo.config);
    console.log("✅ Connection successful!");

    // Check if this is the right place to deploy
    const pwd = await client.pwd();
    console.log(`📂 Current directory: ${pwd}`);

    // Try to go to public_html if we're not there
    if (!pwd.includes("public_html")) {
      try {
        await client.cd("public_html");
        console.log("📁 Moved to public_html");
      } catch (e) {
        console.log("⚠️  No public_html directory, staying in root");
      }
    }

    // List current files
    const files = await client.list();
    console.log("\n📋 Current files:");
    files.slice(0, 10).forEach((file) => {
      const type = file.type === 1 ? "📁" : "📄";
      console.log(`   ${type} ${file.name}`);
    });

    // Deploy main files from build
    const spaPath = "./dist/spa";
    if (fs.existsSync(spaPath)) {
      console.log("\n🚀 Starting deployment...");

      // Deploy index.html
      const indexPath = path.join(spaPath, "index.html");
      if (fs.existsSync(indexPath)) {
        await client.uploadFrom(indexPath, "index.html");
        console.log("✅ index.html uploaded");
      }

      // Deploy assets directory
      const assetsPath = path.join(spaPath, "assets");
      if (fs.existsSync(assetsPath)) {
        try {
          await client.send("MKD assets");
        } catch (e) {
          // Directory might already exist
        }

        const assetFiles = fs.readdirSync(assetsPath);
        for (const file of assetFiles) {
          await client.uploadFrom(
            path.join(assetsPath, file),
            `assets/${file}`,
          );
          console.log(`✅ assets/${file} uploaded`);
        }
      }

      // Deploy data directory
      const dataPath = path.join(spaPath, "data");
      if (fs.existsSync(dataPath)) {
        try {
          await client.send("MKD data");
        } catch (e) {
          // Directory might already exist
        }

        const dataFiles = fs.readdirSync(dataPath);
        for (const file of dataFiles) {
          await client.uploadFrom(path.join(dataPath, file), `data/${file}`);
          console.log(`✅ data/${file} uploaded`);
        }
      }

      console.log("\n🎉 Deployment completed!");
      console.log(
        `🌐 Website should be live at: https://${configInfo.config.host}`,
      );

      return true; // Success
    } else {
      console.log("❌ Build directory not found");
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed with ${configInfo.name}`);
    console.log(`Error: ${error.message}`);
    return false;
  } finally {
    client.close();
  }
}

async function deploy() {
  console.log("🚀 MANUAL DEPLOYMENT: Report Visa Scam");
  console.log("Trying multiple configurations...");

  for (const config of FTP_CONFIGS) {
    const success = await deployWithConfig(config);
    if (success) {
      console.log("\n✅ DEPLOYMENT SUCCESSFUL!");
      return;
    }
  }

  console.log("\n❌ All deployment attempts failed");
  console.log("\n💡 Troubleshooting suggestions:");
  console.log("1. Check domain DNS settings");
  console.log("2. Verify hosting account is active");
  console.log("3. Contact hosting provider about FTP access");
}

deploy();
