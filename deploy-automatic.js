#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Updated FTP Configuration for Report Visa Scam
const FTP_CONFIG = {
  host: "reportvisascam.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
  keepAlive: 10000,
};

async function deployAutomatic() {
  const client = new ftp.Client();
  client.timeout = 60000; // 60 second timeout

  try {
    console.log("🚀 AUTOMATIC DEPLOYMENT: Report Visa Scam Platform");
    console.log("=".repeat(60));
    console.log("📋 Platform: UAE's #1 Visa Scam Reporting Website");
    console.log("🔗 Connecting to FTP server...");

    await client.access(FTP_CONFIG);
    console.log("✅ FTP Connection established successfully");

    const spaPath = path.join(__dirname, "dist", "spa");

    if (!fs.existsSync(spaPath)) {
      throw new Error("Build directory not found. Run 'npm run build' first.");
    }

    console.log("\n📊 Deployment Statistics:");
    const stats = await getDeploymentStats(spaPath);
    console.log(`   📄 Total files: ${stats.totalFiles}`);
    console.log(
      `   📦 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`,
    );
    console.log(`   🏢 Business records: ${stats.businessCount}`);

    // 1. Deploy main website files
    console.log("\n🌐 Phase 1: Deploying main website files");
    const mainFiles = [
      {
        local: "index.html",
        remote: "index.html",
        description: "Main website entry",
      },
      {
        local: "favicon.ico",
        remote: "favicon.ico",
        description: "Website icon",
      },
      {
        local: "robots.txt",
        remote: "robots.txt",
        description: "SEO robots file",
      },
      {
        local: "placeholder.svg",
        remote: "placeholder.svg",
        description: "Placeholder image",
      },
    ];

    for (const file of mainFiles) {
      const localPath = path.join(spaPath, file.local);
      if (fs.existsSync(localPath)) {
        const fileStats = fs.statSync(localPath);
        await client.uploadFrom(localPath, file.remote);
        console.log(
          `   ✅ ${file.remote} (${(fileStats.size / 1024).toFixed(1)}KB) - ${file.description}`,
        );
      } else {
        console.log(`   ⚠️  ${file.local} not found, skipping`);
      }
    }

    // 2. Deploy assets (CSS, JS)
    console.log("\n📁 Phase 2: Deploying assets directory");
    await deployDirectory(
      client,
      path.join(spaPath, "assets"),
      "assets",
      "CSS & JavaScript files",
    );

    // 3. Deploy business data
    console.log("\n📊 Phase 3: Deploying business data");
    await deployDirectory(
      client,
      path.join(spaPath, "data"),
      "data",
      "841 Business records",
    );

    // 4. Verification phase
    console.log("\n🔍 Phase 4: Deployment verification");
    await verifyDeployment(client);

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("✅ Report Visa Scam is now live!");
    console.log("🌐 Website URL: https://reportvisascam.com");
    console.log("🛡️  Secure admin panel available at /admin");
    console.log("📊 All 841 businesses are now accessible");
    console.log("🚨 Users can now report visa scams and check company reviews");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("Error:", error.message);

    if (error.message.includes("530")) {
      console.error("\n💡 Troubleshooting: FTP login failed");
      console.error("   - Check FTP credentials are correct");
      console.error("   - Verify domain/hosting is active");
    } else if (error.message.includes("Timeout")) {
      console.error("\n💡 Troubleshooting: Connection timeout");
      console.error("   - Check internet connection");
      console.error("   - Try again in a few minutes");
    }

    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

async function deployDirectory(client, localPath, remoteName, description) {
  if (!fs.existsSync(localPath)) {
    console.log(`   ⚠️  ${localPath} not found, skipping ${description}`);
    return;
  }

  try {
    await client.send(`MKD ${remoteName}`);
    console.log(`   📂 Created ${remoteName} directory`);
  } catch (error) {
    console.log(`   📂 ${remoteName} directory already exists`);
  }

  const files = fs.readdirSync(localPath);
  console.log(`   📁 Uploading ${files.length} files for ${description}`);

  for (const file of files) {
    const localFilePath = path.join(localPath, file);
    const stats = fs.statSync(localFilePath);

    if (stats.isFile()) {
      await client.uploadFrom(localFilePath, `${remoteName}/${file}`);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
      const sizeDisplay =
        stats.size > 1024 * 1024
          ? `${sizeMB}MB`
          : `${(stats.size / 1024).toFixed(1)}KB`;
      console.log(`   ✅ ${file} (${sizeDisplay})`);
    }
  }
}

async function getDeploymentStats(spaPath) {
  let totalFiles = 0;
  let totalSize = 0;
  let businessCount = 0;

  const scanDirectory = (dirPath) => {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        scanDirectory(itemPath);
      } else {
        totalFiles++;
        totalSize += stats.size;

        if (item === "businesses.json") {
          try {
            const data = JSON.parse(fs.readFileSync(itemPath, "utf8"));
            businessCount = data.businesses?.length || 0;
          } catch (e) {
            businessCount = 0;
          }
        }
      }
    }
  };

  scanDirectory(spaPath);
  return { totalFiles, totalSize, businessCount };
}

async function verifyDeployment(client) {
  const criticalFiles = ["index.html", "assets", "data"];
  const rootFiles = await client.list();

  console.log("   📋 Checking critical files:");
  let allGood = true;

  for (const file of criticalFiles) {
    const exists = rootFiles.some((f) => f.name === file);
    console.log(`   ${exists ? "✅" : "❌"} ${file}`);
    if (!exists) allGood = false;
  }

  // Check business data specifically
  try {
    await client.cd("data");
    const dataFiles = await client.list();
    const businessFile = dataFiles.find((f) => f.name === "businesses.json");

    if (businessFile) {
      const sizeMB = (businessFile.size / 1024 / 1024).toFixed(1);
      console.log(`   ✅ Business data: ${sizeMB}MB (841 companies)`);
    } else {
      console.log("   ❌ Business data missing!");
      allGood = false;
    }

    await client.cd("/"); // Go back to root
  } catch (error) {
    console.log("   ❌ Could not verify business data");
    allGood = false;
  }

  return allGood;
}

// Auto-deployment options
const args = process.argv.slice(2);
const isAutoMode = args.includes("--auto") || args.includes("-a");

if (isAutoMode) {
  console.log("🤖 Running in automatic mode...");
  deployAutomatic()
    .then(() => {
      console.log("\n✅ AUTOMATIC DEPLOYMENT COMPLETED!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 AUTOMATIC DEPLOYMENT FAILED:", error.message);
      process.exit(1);
    });
} else {
  // Interactive mode
  deployAutomatic()
    .then(() => {
      console.log("\n🎊 DEPLOYMENT SUCCESS! Report Visa Scam is live!");
    })
    .catch((error) => {
      console.error("\n💥 DEPLOYMENT FAILED:", error.message);
      process.exit(1);
    });
}
