#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";

const FTP_CONFIG = {
  host: "reportvisascam.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function checkHostingerFiles() {
  const client = new ftp.Client();
  client.timeout = 60000;

  try {
    console.log("🔍 CHECKING HOSTINGER FILE CONTENTS");
    console.log("=".repeat(60));
    console.log("✅ DNS working: test.php loads from Hostinger");
    console.log("❌ React app links still show Fly.dev URLs");
    console.log("🎯 Checking: What's actually on Hostinger");

    await client.access(FTP_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    try {
      await client.cd("public_html");
      console.log("📂 Working in /public_html");
    } catch (e) {
      console.log("📂 Working in root directory");
    }

    // Check what files exist
    console.log("\n📋 Files on Hostinger:");
    const files = await client.list();
    files.forEach((file) => {
      const type = file.type === 1 ? "📁" : "📄";
      const size =
        file.type === 2 ? ` (${(file.size / 1024).toFixed(1)}KB)` : "";
      console.log(`   ${type} ${file.name}${size}`);
    });

    // Check index.html content (the key file)
    const indexFile = files.find((f) => f.name === "index.html");

    if (indexFile) {
      console.log("\n🔍 ANALYZING index.html content:");

      try {
        await client.downloadTo("./temp-index-analysis.html", "index.html");
        const content = fs.readFileSync("./temp-index-analysis.html", "utf8");

        console.log("📄 index.html analysis:");
        console.log(`   📏 File size: ${(content.length / 1024).toFixed(1)}KB`);

        // Check for Fly.dev references
        const flyDevMatches = content.match(/fly\.dev/g);
        const flyDevCount = flyDevMatches ? flyDevMatches.length : 0;

        // Check for correct title
        const hasCorrectTitle = content.includes("Report Visa Scam");

        // Check for asset references
        const assetMatches = content.match(/\/assets\/[^"]+/g);

        console.log(
          `   ${hasCorrectTitle ? "✅" : "❌"} Has "Report Visa Scam" title`,
        );
        console.log(
          `   ${flyDevCount === 0 ? "✅" : "❌"} Fly.dev references: ${flyDevCount}`,
        );
        console.log(
          `   📦 Asset references: ${assetMatches ? assetMatches.length : 0}`,
        );

        if (flyDevCount > 0) {
          console.log("\n🚨 PROBLEM FOUND: index.html contains Fly.dev URLs!");
          console.log(
            "This means the wrong index.html was deployed to Hostinger",
          );
        }

        if (assetMatches) {
          console.log("\n📦 Asset files referenced:");
          assetMatches.slice(0, 3).forEach((asset) => {
            console.log(`   📄 ${asset}`);
          });
          if (assetMatches.length > 3) {
            console.log(`   ... and ${assetMatches.length - 3} more`);
          }
        }

        // Show first 500 characters
        console.log("\n📝 First 500 characters of index.html:");
        console.log("─".repeat(50));
        console.log(content.substring(0, 500) + "...");
        console.log("─".repeat(50));

        fs.unlinkSync("./temp-index-analysis.html");
      } catch (e) {
        console.log("❌ Could not download/analyze index.html");
      }
    } else {
      console.log("\n❌ index.html NOT FOUND on Hostinger!");
    }

    // Check assets directory
    const assetsDir = files.find((f) => f.name === "assets" && f.type === 1);
    if (assetsDir) {
      console.log("\n📁 Checking assets directory:");
      await client.cd("assets");
      const assetFiles = await client.list();
      console.log(`   📦 Found ${assetFiles.length} asset files`);

      assetFiles.slice(0, 5).forEach((file) => {
        const size = (file.size / 1024).toFixed(1);
        console.log(`   📄 ${file.name} (${size}KB)`);
      });

      await client.cd("../");
    } else {
      console.log("\n❌ assets directory NOT FOUND!");
    }

    // Check data directory
    const dataDir = files.find((f) => f.name === "data" && f.type === 1);
    if (dataDir) {
      console.log("\n📊 Checking data directory:");
      await client.cd("data");
      const dataFiles = await client.list();

      const businessFile = dataFiles.find((f) => f.name === "businesses.json");
      if (businessFile) {
        const sizeMB = (businessFile.size / 1024 / 1024).toFixed(1);
        console.log(`   ✅ businesses.json found (${sizeMB}MB)`);
      } else {
        console.log(`   ❌ businesses.json NOT FOUND`);
      }

      await client.cd("../");
    } else {
      console.log("\n❌ data directory NOT FOUND!");
    }

    console.log("\n🎯 DIAGNOSIS SUMMARY:");
    console.log("=".repeat(30));

    if (indexFile) {
      console.log("✅ index.html exists on Hostinger");
      console.log("❌ But it may contain wrong content (Fly.dev URLs)");
      console.log("");
      console.log("🔧 SOLUTION:");
      console.log("Need to deploy CORRECT index.html to Hostinger");
      console.log("The current index.html is from wrong source");
    } else {
      console.log("❌ index.html missing from Hostinger");
      console.log("");
      console.log("🔧 SOLUTION:");
      console.log("Need to deploy React app files to Hostinger");
    }
  } catch (error) {
    console.error("\n❌ ANALYSIS FAILED!");
    console.error("Error:", error.message);
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

checkHostingerFiles()
  .then(() => {
    console.log("\n✅ HOSTINGER FILE ANALYSIS COMPLETED");
  })
  .catch((error) => {
    console.error("💥 Analysis failed:", error.message);
  });
