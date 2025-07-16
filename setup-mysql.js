#!/usr/bin/env node

import mysql from "mysql2/promise";
import fs from "fs";

// You need to get these from Hostinger cPanel > MySQL Databases
const MYSQL_CONFIG = {
  host: "localhost", // or your Hostinger MySQL host
  user: "YOUR_MYSQL_USERNAME", // Get from Hostinger
  password: "YOUR_MYSQL_PASSWORD", // Get from Hostinger
  database: "YOUR_DATABASE_NAME", // Get from Hostinger
  port: 3306,
};

async function setupMySQLDatabase() {
  let connection;

  try {
    console.log("🔗 Connecting to Hostinger MySQL...");
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log("✅ Connected to MySQL database");

    // Create businesses table
    console.log("📊 Creating businesses table...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        category VARCHAR(255),
        phone VARCHAR(50),
        website TEXT,
        email VARCHAR(255),
        rating DECIMAL(3,2),
        reviewCount INT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        businessStatus VARCHAR(50),
        logoUrl TEXT,
        photos JSON,
        hasTargetKeyword BOOLEAN,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Businesses table created");

    // Load and insert data
    console.log("📁 Loading business data...");
    const businessData = JSON.parse(
      fs.readFileSync("./client/data/businesses.json", "utf8"),
    );
    const businesses = businessData.businesses;

    console.log(`📊 Inserting ${businesses.length} businesses...`);

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];

      await connection.execute(
        `
        INSERT INTO businesses 
        (id, name, address, category, phone, website, email, rating, reviewCount, 
         latitude, longitude, businessStatus, logoUrl, photos, hasTargetKeyword, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        address = VALUES(address),
        updatedAt = CURRENT_TIMESTAMP
      `,
        [
          business.id,
          business.name,
          business.address,
          business.category,
          business.phone || null,
          business.website || null,
          business.email || null,
          business.rating || null,
          business.reviewCount || null,
          business.latitude || null,
          business.longitude || null,
          business.businessStatus || "OPERATIONAL",
          business.logoUrl || null,
          JSON.stringify(business.photos || []),
          business.hasTargetKeyword || false,
          business.createdAt || new Date().toISOString(),
          business.updatedAt || new Date().toISOString(),
        ],
      );

      if ((i + 1) % 50 === 0) {
        console.log(`   ✅ Inserted ${i + 1}/${businesses.length} businesses`);
      }
    }

    console.log("🎉 Database setup completed!");
    console.log(`📊 Total businesses inserted: ${businesses.length}`);

    // Test query
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM businesses",
    );
    console.log(`🔍 Verification: ${rows[0].count} businesses in database`);
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n💡 Access Denied Solutions:");
      console.error("1. Check MySQL credentials in Hostinger cPanel");
      console.error("2. Ensure database user has proper permissions");
      console.error("3. Verify database name exists");
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

setupMySQLDatabase();
