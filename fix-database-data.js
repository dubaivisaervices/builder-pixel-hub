#!/usr/bin/env node

/**
 * QUICK DATABASE DATA FIX SCRIPT
 * This script checks if data exists in database and imports if missing
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(colors[color] + message + colors.reset);
}

async function checkAndFixDatabase() {
  log("\n🔍 CHECKING DATABASE DATA...", "bright");
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "cyan");

  // Check for database URL
  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    log("\n❌ ERROR: NEON_DATABASE_URL not set!", "red");
    log(
      "Set it with: export NEON_DATABASE_URL='your-connection-string'",
      "yellow",
    );
    return false;
  }

  log("✅ Database URL found", "green");

  // Connect to database
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: true,
  });

  let client;
  try {
    client = await pool.connect();
    log("✅ Connected to database", "green");
  } catch (error) {
    log(`❌ Connection failed: ${error.message}`, "red");
    return false;
  }

  try {
    // Check if businesses table exists
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'businesses'
    `);

    if (tableCheck.rows[0].count === "0") {
      log("❌ Businesses table doesn't exist! Creating...", "yellow");

      // Create table
      await client.query(`
        CREATE TABLE IF NOT EXISTS businesses (
          id VARCHAR(255) PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT,
          category VARCHAR(255),
          phone VARCHAR(50),
          website TEXT,
          email VARCHAR(255),
          rating DECIMAL(3,2) DEFAULT 0,
          review_count INTEGER DEFAULT 0,
          latitude DECIMAL(10,7),
          longitude DECIMAL(10,7),
          business_status VARCHAR(50) DEFAULT 'OPERATIONAL',
          logo_url TEXT,
          logo_s3_url TEXT,
          photos TEXT[],
          has_target_keyword BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
        CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating);
        CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses USING GIN(to_tsvector('english', name));
      `);

      log("✅ Table created successfully", "green");
    } else {
      log("✅ Businesses table exists", "green");
    }

    // Check how many businesses are in database
    const countResult = await client.query(
      "SELECT COUNT(*) as count FROM businesses",
    );
    const businessCount = parseInt(countResult.rows[0].count);

    log(`📊 Businesses in database: ${businessCount}`, "cyan");

    if (businessCount === 0) {
      log("\n🚀 NO BUSINESSES FOUND - IMPORTING DATA...", "yellow");

      // Check if JSON file exists
      const dataPath = path.join(
        __dirname,
        "public/api/complete-businesses.json",
      );
      if (!fs.existsSync(dataPath)) {
        log(`❌ Data file not found: ${dataPath}`, "red");
        return false;
      }

      // Read and import data
      const businessData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      if (!businessData.businesses || !Array.isArray(businessData.businesses)) {
        log("❌ Invalid data format in JSON file", "red");
        return false;
      }

      const businesses = businessData.businesses;
      log(`📦 Found ${businesses.length} businesses to import`, "cyan");

      // Import data in batches
      const insertQuery = `
        INSERT INTO businesses (
          id, name, address, category, phone, website, email,
          rating, review_count, latitude, longitude, business_status,
          logo_url, logo_s3_url, photos, has_target_keyword,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO NOTHING
      `;

      let imported = 0;
      await client.query("BEGIN");

      for (let i = 0; i < businesses.length; i++) {
        const business = businesses[i];

        try {
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

          if (imported % 50 === 0) {
            log(`📈 Progress: ${imported}/${businesses.length}`, "cyan");
          }
        } catch (error) {
          log(
            `⚠️ Skipped business ${business.name}: ${error.message}`,
            "yellow",
          );
        }
      }

      await client.query("COMMIT");
      log(`\n✅ IMPORT COMPLETE! ${imported} businesses imported`, "green");
    } else {
      log("✅ Database has business data", "green");
    }

    // Final verification
    const finalCount = await client.query(
      "SELECT COUNT(*) as count FROM businesses",
    );
    log(
      `\n🎉 FINAL RESULT: ${finalCount.rows[0].count} businesses in database`,
      "bright",
    );

    return true;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    log(`❌ Error: ${error.message}`, "red");
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check and fix
if (require.main === module) {
  checkAndFixDatabase().then((success) => {
    if (success) {
      log(
        "\n✨ Database is ready! Your website should now show real data.",
        "bright",
      );
      log("🔗 Test at: https://reportvisascam.com/dubai-businesses", "blue");
    } else {
      log("\n💥 Failed to fix database. Check the errors above.", "red");
    }
    process.exit(success ? 0 : 1);
  });
}
