#!/usr/bin/env node

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATABASE_PATH = "./database/reportvisascam_businesses.db";

async function createSQLiteDatabase() {
  try {
    console.log("🗄️  CREATING SQLITE DATABASE: Report Visa Scam");
    console.log("=".repeat(60));

    // Create database directory
    const dbDir = path.dirname(DATABASE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log("📁 Created database directory");
    }

    // Remove existing database
    if (fs.existsSync(DATABASE_PATH)) {
      fs.unlinkSync(DATABASE_PATH);
      console.log("🗑️  Removed existing database");
    }

    // Create new database
    console.log("⚡ Creating new SQLite database...");
    const db = new Database(DATABASE_PATH);

    // Enable WAL mode for better performance
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = 10000");
    db.pragma("temp_store = memory");

    console.log("✅ Database optimized for performance");

    // Create businesses table
    console.log("📊 Creating businesses table...");
    db.exec(`
      CREATE TABLE businesses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        category TEXT,
        phone TEXT,
        website TEXT,
        email TEXT,
        rating REAL,
        reviewCount INTEGER,
        latitude REAL,
        longitude REAL,
        businessStatus TEXT DEFAULT 'OPERATIONAL',
        logoUrl TEXT,
        photos TEXT, -- JSON string
        hasTargetKeyword BOOLEAN DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX idx_business_name ON businesses(name);
      CREATE INDEX idx_business_category ON businesses(category);
      CREATE INDEX idx_business_rating ON businesses(rating);
      CREATE INDEX idx_business_status ON businesses(businessStatus);
      CREATE INDEX idx_business_keyword ON businesses(hasTargetKeyword);
    `);

    console.log("✅ Table and indexes created");

    // Load business data
    console.log("📥 Loading business data...");
    const businessData = JSON.parse(
      fs.readFileSync("./client/data/businesses.json", "utf8"),
    );
    const businesses = businessData.businesses;

    console.log(`📊 Found ${businesses.length} businesses to import`);

    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT INTO businesses (
        id, name, address, category, phone, website, email,
        rating, reviewCount, latitude, longitude, businessStatus,
        logoUrl, photos, hasTargetKeyword, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Begin transaction for faster inserts
    const insertMany = db.transaction((businesses) => {
      for (const business of businesses) {
        insertStmt.run(
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
          business.hasTargetKeyword ? 1 : 0,
          business.createdAt || new Date().toISOString(),
          business.updatedAt || new Date().toISOString(),
        );
      }
    });

    console.log("⚡ Inserting businesses (using transaction)...");
    insertMany(businesses);

    // Verify data
    const count = db.prepare("SELECT COUNT(*) as count FROM businesses").get();
    console.log(`✅ Inserted ${count.count} businesses successfully`);

    // Get database stats
    const stats = db
      .prepare(
        `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN hasTargetKeyword = 1 THEN 1 END) as withKeywords,
        COUNT(CASE WHEN logoUrl IS NOT NULL THEN 1 END) as withLogos,
        COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as withRatings,
        ROUND(AVG(CASE WHEN rating IS NOT NULL THEN rating END), 2) as avgRating
      FROM businesses
    `,
      )
      .get();

    console.log("\n📊 DATABASE STATISTICS:");
    console.log(`   🏢 Total businesses: ${stats.total}`);
    console.log(`   🎯 With target keywords: ${stats.withKeywords}`);
    console.log(`   🖼️  With logos: ${stats.withLogos}`);
    console.log(`   ⭐ With ratings: ${stats.withRatings}`);
    console.log(`   📈 Average rating: ${stats.avgRating}`);

    // Test queries
    console.log("\n🧪 Testing database queries...");
    const testQueries = [
      {
        name: "Top rated businesses",
        query:
          "SELECT name, rating FROM businesses WHERE rating >= 4.5 LIMIT 5",
      },
      {
        name: "Visa services",
        query:
          "SELECT name FROM businesses WHERE category LIKE '%visa%' LIMIT 5",
      },
      {
        name: "Target keyword businesses",
        query: "SELECT name FROM businesses WHERE hasTargetKeyword = 1 LIMIT 5",
      },
    ];

    for (const test of testQueries) {
      const results = db.prepare(test.query).all();
      console.log(`   ✅ ${test.name}: ${results.length} results`);
    }

    // Get file size
    const fileStats = fs.statSync(DATABASE_PATH);
    const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);

    console.log("\n🎉 SQLITE DATABASE CREATED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`📁 File: ${DATABASE_PATH}`);
    console.log(`📦 Size: ${fileSizeMB} MB`);
    console.log(`🏢 Records: ${count.count} businesses`);
    console.log("✅ Ready for Hostinger upload");

    db.close();
    console.log("🔌 Database connection closed");

    return {
      path: DATABASE_PATH,
      size: fileStats.size,
      records: count.count,
    };
  } catch (error) {
    console.error("\n❌ DATABASE CREATION FAILED!");
    console.error("Error:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSQLiteDatabase()
    .then((result) => {
      console.log("\n✅ Database creation completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Database creation failed:", error.message);
      process.exit(1);
    });
}

export { createSQLiteDatabase };
