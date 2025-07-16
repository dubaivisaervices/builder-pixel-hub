#!/usr/bin/env node

import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const dbPath = path.join(
  __dirname,
  "server",
  "database",
  "dubai_businesses.db",
);

async function queryDatabase(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
      db.close();
    });
  });
}

async function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
      db.close();
    });
  });
}

async function exportBusinessData() {
  try {
    console.log("📊 Exporting business data from SQLite database...");
    console.log(`📁 Database path: ${dbPath}`);

    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found: ${dbPath}`);
    }

    // Get all businesses
    const businesses = await queryDatabase(`
      SELECT 
        id, name, address, category, phone, website, rating, review_count,
        latitude, longitude, place_id, google_url, logo_url, photos_urls,
        logo_s3_url, photos_s3_urls, created_at, updated_at
      FROM businesses 
      ORDER BY name
    `);

    console.log(`✅ Found ${businesses.length} businesses`);

    // Get categories
    const categories = await queryDatabase(`
      SELECT DISTINCT category 
      FROM businesses 
      WHERE category IS NOT NULL 
      ORDER BY category
    `);

    console.log(`✅ Found ${categories.length} categories`);

    // Get stats
    const stats = await queryOne(`SELECT COUNT(*) as total FROM businesses`);

    // Process business data
    const processedBusinesses = businesses.map((business) => {
      let photos = [];
      let photosS3 = [];

      try {
        if (business.photos_urls) {
          photos = JSON.parse(business.photos_urls);
        }
      } catch (e) {
        photos = [];
      }

      try {
        if (business.photos_s3_urls) {
          photosS3 = JSON.parse(business.photos_s3_urls);
        }
      } catch (e) {
        photosS3 = [];
      }

      // Use Hostinger URLs if available
      const logoUrl = business.logo_s3_url || business.logo_url;
      const processedPhotos = photosS3.length > 0 ? photosS3 : photos;

      return {
        id: business.id,
        name: business.name,
        address: business.address,
        category: business.category,
        phone: business.phone,
        website: business.website,
        rating: business.rating,
        reviewCount: business.review_count || 0,
        latitude: business.latitude,
        longitude: business.longitude,
        placeId: business.place_id,
        googleUrl: business.google_url,
        logoUrl: logoUrl,
        photos: processedPhotos || [],
        hasTargetKeyword: business.name
          ?.toLowerCase()
          .includes("visa" || "immigration" || "emirates" || "uae"),
        createdAt: business.created_at,
        updatedAt: business.updated_at,
      };
    });

    // Create export data
    const exportData = {
      businesses: processedBusinesses,
      categories: categories.map((c) => c.category),
      stats: {
        total: stats.total,
        categoriesCount: categories.length,
        exportDate: new Date().toISOString(),
        exportNote: "Exported from SQLite database for static hosting",
      },
      meta: {
        source: "Dubai Business Directory SQLite Database",
        totalBusinesses: processedBusinesses.length,
        hasPhotos: processedBusinesses.filter((b) => b.photos.length > 0)
          .length,
        hasLogos: processedBusinesses.filter((b) => b.logoUrl).length,
        exportTimestamp: Date.now(),
      },
    };

    // Ensure client/data directory exists
    const dataDir = path.join(__dirname, "client", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`📁 Created directory: ${dataDir}`);
    }

    // 1. Static JSON file for deployment
    const jsonPath = path.join(__dirname, "client", "data", "businesses.json");
    fs.writeFileSync(jsonPath, JSON.stringify(exportData));
    console.log(`✅ JSON data exported to: ${jsonPath}`);

    // 2. JavaScript module for import
    const jsPath = path.join(__dirname, "client", "data", "businesses.js");
    const jsContent = `// Auto-generated business data
// Generated: ${new Date().toISOString()}
// Total businesses: ${processedBusinesses.length}

export const businessData = ${JSON.stringify(exportData, null, 2)};

export const businesses = businessData.businesses;
export const categories = businessData.categories;
export const stats = businessData.stats;

export default businessData;
`;

    fs.writeFileSync(jsPath, jsContent);
    console.log(`✅ JS module exported to: ${jsPath}`);

    console.log("\n📊 Export Summary:");
    console.log(`   📈 Total businesses: ${processedBusinesses.length}`);
    console.log(`   📁 Categories: ${categories.length}`);
    console.log(`   🖼️  With photos: ${exportData.meta.hasPhotos}`);
    console.log(`   🎨 With logos: ${exportData.meta.hasLogos}`);

    return exportData;
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

// Run export
exportBusinessData()
  .then((data) => {
    console.log(
      "\n🎉 Export completed! Business data is ready for static hosting.",
    );
  })
  .catch((error) => {
    console.error("\n💥 Export failed:", error);
    process.exit(1);
  });
