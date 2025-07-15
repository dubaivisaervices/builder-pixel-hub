#!/usr/bin/env node

import * as ftp from "basic-ftp";

async function diagnoseHostingIssue() {
  console.log("🔍 COMPREHENSIVE HOSTING DIAGNOSIS");
  console.log("=".repeat(60));
  console.log("📋 Issue: reportvisascam.com not loading from Hostinger");
  console.log("🎯 Current: Website running on fly.dev (development)");

  console.log("\n📊 PROBLEM ANALYSIS:");
  console.log("❌ Domain not resolving to any IP address");
  console.log("❌ Website showing development environment");
  console.log("❌ Navigation showing 'DBD' instead of 'Report Visa Scam'");

  // Test Hostinger FTP connections
  const ftpConfigs = [
    {
      name: "Primary Configuration",
      host: "reportvisascam.com",
      user: "u611952859.reportvisascam.com",
      password: "One@click1",
    },
    {
      name: "Backup Configuration",
      host: "crossbordersmigrations.com",
      user: "u611952859.reportvisascam.com",
      password: "One@click1",
    },
    {
      name: "Original Configuration",
      host: "crossbordersmigrations.com",
      user: "u611952859.crossborder1120",
      password: "One@click1",
    },
  ];

  console.log("\n🧪 TESTING HOSTINGER FTP ACCESS:");

  let workingConfig = null;
  let deploymentFound = false;

  for (const config of ftpConfigs) {
    console.log(`\n${config.name}:`);
    console.log("-".repeat(40));

    const client = new ftp.Client();
    client.timeout = 15000;

    try {
      await client.access({
        host: config.host,
        user: config.user,
        password: config.password,
        port: 21,
        secure: false,
      });

      console.log("✅ FTP Connection: SUCCESS");

      // Check directory structure
      let currentDir = await client.pwd();
      console.log(`📂 Current directory: ${currentDir}`);

      // Try to navigate to public_html
      try {
        await client.cd("public_html");
        console.log("✅ public_html: Found");
        currentDir = "public_html";
      } catch (e) {
        console.log("⚠️  public_html: Not found, staying in root");
      }

      // List files
      const files = await client.list();
      console.log(`📁 Total files: ${files.length}`);

      const importantFiles = {
        "index.html": files.find((f) => f.name === "index.html"),
        assets: files.find((f) => f.name === "assets" && f.type === 1),
        data: files.find((f) => f.name === "data" && f.type === 1),
        ".htaccess": files.find((f) => f.name === ".htaccess"),
        database: files.find((f) => f.name === "database" && f.type === 1),
      };

      console.log("\n📋 Key Files Check:");
      for (const [fileName, file] of Object.entries(importantFiles)) {
        if (file) {
          const size =
            file.type === 2
              ? ` (${(file.size / 1024).toFixed(1)}KB)`
              : " (directory)";
          console.log(`   ✅ ${fileName}${size}`);
          if (fileName === "index.html") deploymentFound = true;
        } else {
          console.log(`   ❌ ${fileName}: Missing`);
        }
      }

      // Check for Report Visa Scam content
      if (importantFiles["index.html"]) {
        try {
          // Download and check index.html content
          await client.downloadTo("./temp-index.html", "index.html");
          const fs = await import("fs");
          const content = fs.readFileSync("./temp-index.html", "utf8");

          const hasReportVisa = content.includes("Report Visa Scam");
          const hasCorrectTitle = content.includes(
            "Report Visa Scam - UAE's Scam Protection Platform",
          );

          console.log("\n🔍 Content Analysis:");
          console.log(
            `   ${hasReportVisa ? "✅" : "❌"} Contains 'Report Visa Scam'`,
          );
          console.log(`   ${hasCorrectTitle ? "✅" : "❌"} Correct page title`);

          // Clean up
          fs.unlinkSync("./temp-index.html");

          if (hasReportVisa && hasCorrectTitle) {
            workingConfig = config;
            console.log("🎉 CORRECT DEPLOYMENT FOUND!");
          }
        } catch (e) {
          console.log("   ⚠️  Could not analyze content");
        }
      }

      if (deploymentFound && !workingConfig) {
        workingConfig = config;
      }
    } catch (error) {
      console.log("❌ Connection Failed:", error.message);
    } finally {
      client.close();
    }
  }

  console.log("\n📊 DIAGNOSIS RESULTS:");
  console.log("=".repeat(30));

  if (workingConfig) {
    console.log("✅ Hostinger hosting is accessible");
    console.log(`✅ Working FTP: ${workingConfig.host}`);
    console.log(`✅ User: ${workingConfig.user}`);

    if (deploymentFound) {
      console.log("✅ Website files are deployed");
    } else {
      console.log("❌ Website files missing");
    }
  } else {
    console.log("❌ No working Hostinger configuration found");
  }

  console.log("\n🔧 SPECIFIC ISSUES TO FIX:");

  if (!workingConfig) {
    console.log("1. ❌ FTP access not working - check credentials");
    console.log("2. ❌ Hostinger account may not be active");
  } else if (!deploymentFound) {
    console.log("1. ❌ Website files not deployed to Hostinger");
    console.log("2. ✅ FTP access working");
  } else {
    console.log("1. ✅ Website deployed to Hostinger");
    console.log("2. ❌ Domain DNS not pointing to Hostinger");
  }

  console.log("\n🚀 SOLUTION STEPS:");

  if (workingConfig && deploymentFound) {
    console.log("DNS Configuration Issue:");
    console.log("1. Check Hostinger cPanel → Domains");
    console.log("2. Ensure reportvisascam.com is added as primary domain");
    console.log("3. Check DNS A record points to Hostinger server IP");
    console.log("4. Wait for DNS propagation (24-48 hours)");

    console.log("\n💡 IMMEDIATE TEST:");
    console.log(`Try accessing: https://${workingConfig.host}`);
    if (workingConfig.host !== "reportvisascam.com") {
      console.log("(This should show your Report Visa Scam website)");
    }
  } else if (workingConfig) {
    console.log("Deployment Issue:");
    console.log("1. Deploy website files to Hostinger");
    console.log("2. Run: npm run deploy-now");
    console.log("3. Then fix DNS configuration");
  } else {
    console.log("Access Issue:");
    console.log("1. Verify Hostinger account is active");
    console.log("2. Check FTP credentials in Hostinger cPanel");
    console.log("3. Ensure domain is added to hosting account");
  }

  return {
    workingConfig,
    deploymentFound,
    needsDeployment: workingConfig && !deploymentFound,
    needsDNSFix: workingConfig && deploymentFound,
  };
}

// Run diagnosis
diagnoseHostingIssue()
  .then((result) => {
    console.log("\n✅ DIAGNOSIS COMPLETE");

    if (result.needsDeployment) {
      console.log("🎯 NEXT ACTION: Deploy website files");
      console.log("Run: npm run deploy-now");
    } else if (result.needsDNSFix) {
      console.log("🎯 NEXT ACTION: Fix domain DNS configuration");
      console.log("Check Hostinger domain settings");
    } else if (!result.workingConfig) {
      console.log("🎯 NEXT ACTION: Fix Hostinger access");
      console.log("Check account and FTP credentials");
    }
  })
  .catch((error) => {
    console.error("💥 Diagnosis failed:", error.message);
  });
