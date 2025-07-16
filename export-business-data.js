#!/usr/bin/env node

import { database } from "./server/database/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportBusinessData() {
  try {
    console.log("📊 Exporting business data from SQLite database...");

    // Get all businesses with basic info
    const businesses = await database.all(`
      SELECT 
        id, name, address, category, phone, website, rating, review_count,
        latitude, longitude, place_id, google_url, logo_url, photos_urls,
        logo_s3_url, photos_s3_urls, created_at, updated_at
      FROM businesses 
      ORDER BY name
    `);

    console.log(`✅ Found ${businesses.length} businesses`);

    // Get categories
    const categories = await database.all(`
      SELECT DISTINCT category 
      FROM businesses 
      WHERE category IS NOT NULL 
      ORDER BY category
    `);

    console.log(`✅ Found ${categories.length} categories`);

    // Get database stats
    const stats = await database.get(`
      SELECT COUNT(*) as total FROM businesses
    `);

    // Process business data
    const processedBusinesses = businesses.map((business) => {
      // Parse JSON fields
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

      // Determine best logo URL
      const logoUrl = business.logo_s3_url || business.logo_url;

      // Use Hostinger URLs for photos if available, otherwise use original
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
          .includes("visa" || "immigration" || "emirates"),
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

    // Write to multiple formats for different use cases

    // 1. Full data for development/backup
    const fullDataPath = path.join(__dirname, "business-data-full.json");
    fs.writeFileSync(fullDataPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Full data exported to: ${fullDataPath}`);

    // 2. Minified data for production
    const minDataPath = path.join(__dirname, "business-data.json");
    fs.writeFileSync(minDataPath, JSON.stringify(exportData));
    console.log(`✅ Minified data exported to: ${minDataPath}`);

    // 3. JavaScript module for direct import
    const jsDataPath = path.join(__dirname, "client", "data", "businesses.js");

    // Ensure directory exists
    const dataDir = path.join(__dirname, "client", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const jsContent = `// Auto-generated business data from SQLite database
// Generated on: ${new Date().toISOString()}

export const businessData = ${JSON.stringify(exportData, null, 2)};

export const businesses = businessData.businesses;
export const categories = businessData.categories;
export const stats = businessData.stats;

export default businessData;
`;

    fs.writeFileSync(jsDataPath, jsContent);
    console.log(`✅ JavaScript module exported to: ${jsDataPath}`);

    console.log("\n📊 Export Summary:");
    console.log(`   📈 Total businesses: ${processedBusinesses.length}`);
    console.log(`   📁 Categories: ${categories.length}`);
    console.log(`   🖼️  Businesses with photos: ${exportData.meta.hasPhotos}`);
    console.log(`   🎨 Businesses with logos: ${exportData.meta.hasLogos}`);
    console.log(`   💾 Export files created: 3`);

    return exportData;
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

// Run export
exportBusinessData()
  .then((data) => {
    console.log("\n🎉 Business data export completed successfully!");
    console.log(
      "   Use business-data.json for static hosting or import the JS module",
    );
  })
  .catch((error) => {
    console.error("\n💥 Export failed:", error);
    process.exit(1);
  });
