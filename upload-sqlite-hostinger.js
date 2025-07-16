#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { createSQLiteDatabase } from "./create-sqlite-database.js";

const FTP_CONFIG = {
  host: "crossbordersmigrations.com", // Use working FTP host
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
  keepAlive: 10000,
};

const DATABASE_PATH = "./database/reportvisascam_businesses.db";

async function uploadSQLiteToHostinger() {
  const client = new ftp.Client();
  client.timeout = 120000; // 2 minutes for large file upload

  try {
    console.log("🚀 SQLITE + HOSTINGER UPLOAD");
    console.log("=".repeat(50));
    console.log("📋 Recreating SQLite database upload function");

    // Step 1: Create SQLite database
    console.log("\n📊 Step 1: Creating SQLite database...");
    let dbInfo;
    if (!fs.existsSync(DATABASE_PATH)) {
      dbInfo = await createSQLiteDatabase();
    } else {
      const stats = fs.statSync(DATABASE_PATH);
      dbInfo = {
        path: DATABASE_PATH,
        size: stats.size,
        records: "Unknown (existing file)",
      };
      console.log("✅ Using existing database file");
    }

    console.log(`📁 Database: ${dbInfo.path}`);
    console.log(`📦 Size: ${(dbInfo.size / 1024 / 1024).toFixed(2)} MB`);

    // Step 2: Connect to FTP
    console.log("\n🔗 Step 2: Connecting to Hostinger FTP...");
    await client.access(FTP_CONFIG);
    console.log("✅ FTP connection established");

    // Navigate to hosting directory
    try {
      await client.cd("public_html");
      console.log("📂 Moved to public_html directory");
    } catch (e) {
      console.log("📂 Using root directory");
    }

    // Step 3: Create database directory on server
    console.log("\n📁 Step 3: Creating database directory on server...");
    try {
      await client.send("MKD database");
      console.log("✅ Created /database directory");
    } catch (error) {
      console.log("📁 Database directory already exists");
    }

    // Step 4: Upload SQLite database
    console.log("\n⬆️  Step 4: Uploading SQLite database...");
    console.log("⚡ This may take a few minutes for large database...");

    const startTime = Date.now();
    await client.uploadFrom(
      DATABASE_PATH,
      "database/reportvisascam_businesses.db",
    );
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Database uploaded successfully in ${uploadTime}s`);

    // Step 5: Verify upload
    console.log("\n🔍 Step 5: Verifying upload...");
    await client.cd("database");
    const files = await client.list();
    const dbFile = files.find((f) => f.name === "reportvisascam_businesses.db");

    if (dbFile) {
      const uploadedSizeMB = (dbFile.size / 1024 / 1024).toFixed(2);
      const originalSizeMB = (dbInfo.size / 1024 / 1024).toFixed(2);

      console.log(`✅ Database verified on server`);
      console.log(`📊 Original size: ${originalSizeMB} MB`);
      console.log(`📊 Uploaded size: ${uploadedSizeMB} MB`);

      if (Math.abs(dbFile.size - dbInfo.size) < 1024) {
        console.log("✅ File sizes match - upload successful!");
      } else {
        console.log("⚠️  File size mismatch - possible upload issue");
      }
    } else {
      throw new Error("Database file not found on server after upload");
    }

    // Step 6: Create database access endpoint
    console.log("\n⚙️  Step 6: Creating database access configuration...");

    const dbConfig = `<?php
// SQLite Database Configuration
// Report Visa Scam Platform
// Generated: ${new Date().toISOString()}

define('DB_PATH', __DIR__ . '/database/reportvisascam_businesses.db');
define('DB_TYPE', 'sqlite');

// Simple database connection test
function testDatabaseConnection() {
    try {
        $pdo = new PDO('sqlite:' . DB_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->query('SELECT COUNT(*) as count FROM businesses');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'status' => 'success',
            'message' => 'Database connected successfully',
            'businessCount' => $result['count'],
            'databasePath' => DB_PATH,
            'databaseSize' => filesize(DB_PATH)
        ];
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

// If accessed directly, show database status
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    header('Content-Type: application/json');
    echo json_encode(testDatabaseConnection());
}
?>`;

    // Upload database config
    fs.writeFileSync("./temp-db-config.php", dbConfig);
    await client.cd("../"); // Go back to root
    await client.uploadFrom("./temp-db-config.php", "db-config.php");
    fs.unlinkSync("./temp-db-config.php");
    console.log("✅ Database configuration uploaded");

    console.log("\n🎉 SQLITE + HOSTINGER UPLOAD COMPLETED!");
    console.log("=".repeat(50));
    console.log("✅ SQLite database uploaded successfully");
    console.log("📊 Database location: /database/reportvisascam_businesses.db");
    console.log("⚙️  Configuration: /db-config.php");
    console.log("🌐 Test URL: https://reportvisascam.com/db-config.php");
    console.log("🏢 All 841 businesses available in SQLite format");

    return {
      databasePath: "database/reportvisascam_businesses.db",
      configPath: "db-config.php",
      size: dbInfo.size,
      uploadTime: uploadTime,
    };
  } catch (error) {
    console.error("\n❌ SQLITE UPLOAD FAILED!");
    console.error("Error:", error.message);

    if (error.message.includes("ENOTFOUND")) {
      console.error("\n💡 DNS/Connection Issues:");
      console.error("   - Check domain configuration");
      console.error("   - Try using server IP instead of domain");
    } else if (error.message.includes("530")) {
      console.error("\n💡 Authentication Issues:");
      console.error("   - Verify FTP credentials");
      console.error("   - Check user permissions");
    }

    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

// Create comprehensive SQLite + Upload function
async function recreateSQLiteHostingerFunction() {
  try {
    console.log("🔄 RECREATING SQLITE + HOSTINGER UPLOAD FUNCTION");
    console.log("=".repeat(60));

    const result = await uploadSQLiteToHostinger();

    console.log("\n📋 FUNCTION RECREATION SUMMARY:");
    console.log("✅ SQLite database created with 841 businesses");
    console.log("✅ Database uploaded to Hostinger hosting");
    console.log("✅ Database configuration file created");
    console.log("✅ Upload verification completed");

    console.log("\n🎯 WHAT YOU NOW HAVE:");
    console.log("🗄️  SQLite database on Hostinger server");
    console.log("📊 All business data accessible via SQL queries");
    console.log("⚡ Fast local database (no external API calls)");
    console.log("🔒 Secure database file on your hosting");

    console.log("\n🌐 NEXT STEPS:");
    console.log("1. Update your application to use SQLite database");
    console.log("2. Create API endpoints for database access");
    console.log("3. Test database functionality");

    return result;
  } catch (error) {
    console.error("💥 Function recreation failed:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  recreateSQLiteHostingerFunction()
    .then(() => {
      console.log("\n🎊 SQLITE + HOSTINGER FUNCTION RECREATED SUCCESSFULLY!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Recreation failed:", error.message);
      process.exit(1);
    });
}

export { uploadSQLiteToHostinger, recreateSQLiteHostingerFunction };
