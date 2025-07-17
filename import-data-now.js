#!/usr/bin/env node

/**
 * ONE-CLICK DATA IMPORT SCRIPT
 * This script automatically imports all 841 businesses to your Neon database
 *
 * Usage: node import-data-now.js
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(colors[color] + message + colors.reset);
}

async function importData() {
  log("\n🚀 NEON DATABASE IMPORT STARTING...", "bright");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");

  // Check for database URL
  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    log("\n❌ ERROR: NEON_DATABASE_URL environment variable not found!", "red");
    log("\n💡 Set it by running:", "yellow");
    log(
      'export NEON_DATABASE_URL="postgresql://username:password@ep-xyz.neon.tech/database?sslmode=require"',
      "cyan",
    );
    log("\n📖 Or follow the setup guide in SIMPLE_SETUP.md", "blue");
    process.exit(1);
  }

  log("✅ Database URL found", "green");

  // Check for business data file
  const dataPath = path.join(__dirname, "public/api/complete-businesses.json");
  if (!fs.existsSync(dataPath)) {
    log(`\n❌ ERROR: Business data file not found at ${dataPath}`, "red");
    log(
      "💡 Make sure complete-businesses.json exists in public/api/",
      "yellow",
    );
    process.exit(1);
  }

  log("✅ Business data file found", "green");

  // Connect to database
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: true,
  });

  let client;
  try {
    client = await pool.connect();
    log("✅ Connected to Neon database", "green");
  } catch (error) {
    log(`\n��� Database connection failed: ${error.message}`, "red");
    log("\n💡 Check your NEON_DATABASE_URL is correct", "yellow");
    process.exit(1);
  }

  try {
    // Read business data
    log("\n📖 Reading business data...", "blue");
    const businessData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    if (!businessData.businesses || !Array.isArray(businessData.businesses)) {
      throw new Error("Invalid business data format");
    }

    const businesses = businessData.businesses;
    log(`📊 Found ${businesses.length} businesses to import`, "cyan");

    // Begin transaction
    await client.query("BEGIN");
    log("🔄 Transaction started", "blue");

    // Clear existing data
    await client.query("DELETE FROM businesses");
    log("🗑️ Cleared existing business data", "yellow");

    // Insert businesses
    const insertQuery = `
      INSERT INTO businesses (
        id, name, address, category, phone, website, email,
        rating, review_count, latitude, longitude, business_status,
        logo_url, logo_s3_url, photos, has_target_keyword,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `;

    let imported = 0;
    const total = businesses.length;

    log("\n📦 Importing businesses...", "blue");

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];

      try {
        // Clean data
        const cleanBusiness = {
          id: business.id || business.place_id || `business_${i}`,
          name: business.name || "Unknown Business",
          address: business.address || business.formatted_address || "",
          category: business.category || business.type || "Business Services",
          phone: business.phone || business.formatted_phone_number || "",
          website: business.website || "",
          email: business.email || "",
          rating: parseFloat(business.rating || business.google_rating || 0),
          review_count: parseInt(
            business.reviewCount || business.user_ratings_total || 0,
          ),
          latitude: parseFloat(business.latitude || 0),
          longitude: parseFloat(business.longitude || 0),
          business_status: business.businessStatus || "OPERATIONAL",
          logo_url: business.logoUrl || "",
          logo_s3_url: business.logoS3Url || "",
          photos: business.photos || [],
          has_target_keyword: Boolean(business.hasTargetKeyword),
          created_at: business.createdAt || new Date().toISOString(),
          updated_at: business.updatedAt || new Date().toISOString(),
        };

        await client.query(insertQuery, [
          cleanBusiness.id,
          cleanBusiness.name,
          cleanBusiness.address,
          cleanBusiness.category,
          cleanBusiness.phone,
          cleanBusiness.website,
          cleanBusiness.email,
          cleanBusiness.rating,
          cleanBusiness.review_count,
          cleanBusiness.latitude,
          cleanBusiness.longitude,
          cleanBusiness.business_status,
          cleanBusiness.logo_url,
          cleanBusiness.logo_s3_url,
          cleanBusiness.photos,
          cleanBusiness.has_target_keyword,
          cleanBusiness.created_at,
          cleanBusiness.updated_at,
        ]);

        imported++;

        // Progress indicator
        if (imported % 50 === 0 || imported === total) {
          const percent = Math.round((imported / total) * 100);
          log(`📈 Progress: ${imported}/${total} (${percent}%)`, "cyan");
        }
      } catch (error) {
        log(`⚠️ Skipped business ${business.name}: ${error.message}`, "yellow");
      }
    }

    // Update stats
    await client.query(`
      INSERT INTO business_stats (total_businesses, total_reviews, avg_rating, total_locations)
      SELECT 
        COUNT(*) as total_businesses,
        SUM(review_count) as total_reviews,
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(DISTINCT CONCAT(latitude, ',', longitude)) as total_locations
      FROM businesses
      WHERE business_status = 'OPERATIONAL'
    `);

    // Commit transaction
    await client.query("COMMIT");

    // Verification
    const countResult = await client.query("SELECT COUNT(*) FROM businesses");
    const statsResult = await client.query(
      "SELECT * FROM business_stats ORDER BY id DESC LIMIT 1",
    );

    log("\n🎉 IMPORT COMPLETED SUCCESSFULLY!", "green");
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");
    log(`✅ Businesses imported: ${imported}`, "green");
    log(`✅ Businesses in database: ${countResult.rows[0].count}`, "green");

    if (statsResult.rows.length > 0) {
      const stats = statsResult.rows[0];
      log(`📊 Total reviews: ${stats.total_reviews}`, "cyan");
      log(`⭐ Average rating: ${stats.avg_rating}`, "cyan");
      log(`📍 Unique locations: ${stats.total_locations}`, "cyan");
    }

    log("\n🚀 Your website is now ready with all business data!", "bright");
    log("🔗 Test at: https://your-site.netlify.app/dubai-businesses", "blue");
  } catch (error) {
    await client.query("ROLLBACK");
    log(`\n❌ Import failed: ${error.message}`, "red");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import
if (require.main === module) {
  importData()
    .then(() => {
      log("\n✨ All done! Your database is ready to use.", "bright");
      process.exit(0);
    })
    .catch((error) => {
      log(`\n💥 Import failed: ${error.message}`, "red");
      log("\n💡 Check the setup guide in SIMPLE_SETUP.md", "yellow");
      process.exit(1);
    });
}
