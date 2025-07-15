#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";

// Use the working FTP configuration
const FTP_CONFIG = {
  host: "crossbordersmigrations.com", // Use the original working domain for FTP
  user: "u611952859.reportvisascam.com", // But the new user account
  password: "One@click1",
  port: 21,
  secure: false,
  keepAlive: 10000,
};

async function deployFixed() {
  const client = new ftp.Client();
  client.timeout = 60000;

  try {
    console.log("🚀 DEPLOYMENT: Report Visa Scam Platform");
    console.log("=".repeat(60));
    console.log("🎯 Strategy: Use working FTP, deploy to new domain");

    console.log("\n🔗 Connecting to FTP server...");
    await client.access(FTP_CONFIG);
    console.log("✅ FTP Connection established");

    // Navigate to the right directory
    console.log("\n📂 Navigating to deployment directory...");
    try {
      await client.cd("public_html");
      console.log("✅ Moved to public_html");
    } catch (e) {
      console.log("📂 Staying in root directory");
    }

    const spaPath = "./dist/spa";

    if (!fs.existsSync(spaPath)) {
      throw new Error(
        "❌ Build directory not found. Run 'npm run build' first.",
      );
    }

    // Ensure data directory exists in build
    if (!fs.existsSync(path.join(spaPath, "data"))) {
      console.log("📊 Creating data directory...");
      fs.mkdirSync(path.join(spaPath, "data"), { recursive: true });

      if (fs.existsSync("./client/data/businesses.json")) {
        fs.copyFileSync(
          "./client/data/businesses.json",
          path.join(spaPath, "data/businesses.json"),
        );
        console.log("✅ Business data copied to build");
      }
    }

    console.log("\n📊 Deployment Summary:");
    const stats = await getDeploymentStats(spaPath);
    console.log(`   📄 Total files: ${stats.totalFiles}`);
    console.log(
      `   📦 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`,
    );
    console.log(`   🏢 Business records: ${stats.businessCount}`);

    // 1. Deploy main website files
    console.log("\n🌐 Phase 1: Main website files");
    const mainFiles = [
      "index.html",
      "favicon.ico",
      "robots.txt",
      "placeholder.svg",
    ];

    for (const file of mainFiles) {
      const localPath = path.join(spaPath, file);
      if (fs.existsSync(localPath)) {
        await client.uploadFrom(localPath, file);
        const size = fs.statSync(localPath).size;
        console.log(`   ✅ ${file} (${(size / 1024).toFixed(1)}KB)`);
      }
    }

    // 2. Deploy assets
    console.log("\n📁 Phase 2: Assets directory");
    await deployDirectory(client, path.join(spaPath, "assets"), "assets");

    // 3. Deploy business data
    console.log("\n📊 Phase 3: Business data");
    await deployDirectory(client, path.join(spaPath, "data"), "data");

    // 4. Create .htaccess for SPA routing
    console.log("\n⚙️  Phase 4: SPA Configuration");
    const htaccessContent = `RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>`;

    fs.writeFileSync("./.htaccess-temp", htaccessContent);
    await client.uploadFrom("./.htaccess-temp", ".htaccess");
    fs.unlinkSync("./.htaccess-temp");
    console.log("   ✅ .htaccess uploaded (SPA routing enabled)");

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=".repeat(60));
    console.log("✅ Report Visa Scam is now deployed!");
    console.log("🌐 Primary URL: https://reportvisascam.com");
    console.log("🌐 Backup URL: https://crossbordersmigrations.com");
    console.log("🛡️  Admin panel: /admin");
    console.log("📊 Business data: /data/businesses.json");
    console.log("🔍 Diagnostic: /data-diagnostic");
    console.log("=".repeat(60));

    // Test the deployment
    console.log("\n🔍 Testing deployment...");
    await testDeployment(client);
  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED!");
    console.error("Error:", error.message);

    if (error.message.includes("530")) {
      console.error("\n💡 FTP Login Issues:");
      console.error("   - Domain may not be fully configured yet");
      console.error("   - Try again in 30 minutes after DNS propagation");
    }
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

async function deployDirectory(client, localPath, remoteName) {
  if (!fs.existsSync(localPath)) {
    console.log(`   ⚠️  ${localPath} not found, skipping`);
    return;
  }

  try {
    await client.send(`MKD ${remoteName}`);
    console.log(`   📂 Created ${remoteName} directory`);
  } catch (error) {
    console.log(`   📂 ${remoteName} directory exists`);
  }

  const files = fs.readdirSync(localPath);
  console.log(`   📁 Uploading ${files.length} files`);

  for (const file of files) {
    const localFilePath = path.join(localPath, file);
    const stats = fs.statSync(localFilePath);

    if (stats.isFile()) {
      await client.uploadFrom(localFilePath, `${remoteName}/${file}`);
      const sizeDisplay =
        stats.size > 1024 * 1024
          ? `${(stats.size / 1024 / 1024).toFixed(1)}MB`
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

async function testDeployment(client) {
  try {
    const files = await client.list();
    const hasIndex = files.some((f) => f.name === "index.html");
    const hasAssets = files.some((f) => f.name === "assets");
    const hasData = files.some((f) => f.name === "data");

    console.log(`   ${hasIndex ? "✅" : "❌"} index.html`);
    console.log(`   ${hasAssets ? "✅" : "❌"} assets directory`);
    console.log(`   ${hasData ? "✅" : "❌"} data directory`);

    if (hasIndex && hasAssets && hasData) {
      console.log("   🎉 All critical files deployed successfully!");
    } else {
      console.log("   ⚠️  Some files missing - deployment may be incomplete");
    }
  } catch (error) {
    console.log("   ❌ Could not verify deployment");
  }
}

deployFixed();
