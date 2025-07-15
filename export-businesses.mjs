#!/usr/bin/env node

import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found: ${dbPath}`);
    }

    // Get all businesses with correct column names
    const businesses = await queryDatabase(`
      SELECT 
        id, name, address, category, phone, website, email, rating, review_count,
        lat, lng, business_status, logo_url, photos_json, 
        logo_s3_url, photos_s3_urls, has_target_keyword, created_at, updated_at
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

      // Parse photos_json
      try {
        if (business.photos_json) {
          photos = JSON.parse(business.photos_json);
        }
      } catch (e) {
        photos = [];
      }

      // Parse photos_s3_urls
      try {
        if (business.photos_s3_urls) {
          photosS3 = JSON.parse(business.photos_s3_urls);
        }
      } catch (e) {
        photosS3 = [];
      }

      // Use Hostinger URLs if available, otherwise original
      const logoUrl = business.logo_s3_url || business.logo_url;
      const processedPhotos = photosS3.length > 0 ? photosS3 : photos;

      return {
        id: business.id,
        name: business.name,
        address: business.address,
        category: business.category,
        phone: business.phone,
        website: business.website,
        email: business.email,
        rating: business.rating,
        reviewCount: business.review_count || 0,
        latitude: business.lat,
        longitude: business.lng,
        businessStatus: business.business_status,
        logoUrl: logoUrl,
        photos: processedPhotos || [],
        hasTargetKeyword:
          business.has_target_keyword ||
          business.name?.toLowerCase().includes("visa") ||
          business.name?.toLowerCase().includes("immigration") ||
          business.name?.toLowerCase().includes("emirates"),
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
        exportNote: "Dubai Business Directory - Static Export",
      },
      meta: {
        source: "SQLite Database (dubai_businesses.db)",
        totalBusinesses: processedBusinesses.length,
        hasPhotos: processedBusinesses.filter((b) => b.photos.length > 0)
          .length,
        hasLogos: processedBusinesses.filter((b) => b.logoUrl).length,
        exportTimestamp: Date.now(),
      },
    };

    // Create data directory
    const dataDir = path.join(__dirname, "client", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Export as JSON for static hosting
    const jsonPath = path.join(dataDir, "businesses.json");
    fs.writeFileSync(jsonPath, JSON.stringify(exportData));
    console.log(`✅ JSON exported: ${jsonPath}`);

    // Export as JS module
    const jsPath = path.join(dataDir, "businesses.js");
    const jsContent = `// Dubai Business Directory Data
// Generated: ${new Date().toISOString()}
// Total: ${processedBusinesses.length} businesses

export const businessData = ${JSON.stringify(exportData, null, 2)};

export const { businesses, categories, stats } = businessData;

export default businessData;
`;

    fs.writeFileSync(jsPath, jsContent);
    console.log(`✅ JS module exported: ${jsPath}`);

    console.log("\n📊 Export Summary:");
    console.log(`   📈 Total businesses: ${processedBusinesses.length}`);
    console.log(`   📁 Categories: ${categories.length}`);
    console.log(`   🖼️  With photos: ${exportData.meta.hasPhotos}`);
    console.log(`   🎨 With logos: ${exportData.meta.hasLogos}`);
    console.log(
      `   📱 Target keywords: ${processedBusinesses.filter((b) => b.hasTargetKeyword).length}`,
    );

    return exportData;
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

exportBusinessData()
  .then(() => {
    console.log("\n🎉 Business data exported successfully for static hosting!");
  })
  .catch((error) => {
    console.error("\n💥 Export failed:", error);
    process.exit(1);
  });
