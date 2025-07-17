const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Neon connection configuration
// These will be set as environment variables in Netlify
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: true,
});

async function migrateBusinessData() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting business data migration to Neon...");

    // Read the complete businesses JSON file
    const businessDataPath = path.join(
      __dirname,
      "../public/api/complete-businesses.json",
    );
    const businessData = JSON.parse(fs.readFileSync(businessDataPath, "utf8"));

    if (!businessData.businesses || !Array.isArray(businessData.businesses)) {
      throw new Error("Invalid business data format");
    }

    const businesses = businessData.businesses;
    console.log(`📊 Found ${businesses.length} businesses to migrate`);

    // Begin transaction
    await client.query("BEGIN");

    // Clear existing data
    await client.query("DELETE FROM businesses");
    console.log("🗑️ Cleared existing business data");

    // Prepare the insert statement
    const insertQuery = `
      INSERT INTO businesses (
        id, name, address, category, phone, website, email,
        rating, review_count, latitude, longitude, business_status,
        logo_url, logo_s3_url, photos, has_target_keyword,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `;

    // Process businesses in batches for better performance
    const batchSize = 50;
    let processed = 0;

    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      for (const business of batch) {
        try {
          // Clean and validate data
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
            business_status:
              business.businessStatus ||
              business.business_status ||
              "OPERATIONAL",
            logo_url: business.logoUrl || "",
            logo_s3_url: business.logoS3Url || "",
            photos: business.photos || [],
            has_target_keyword: Boolean(
              business.hasTargetKeyword || business.has_target_keyword,
            ),
            created_at:
              business.createdAt ||
              business.created_at ||
              new Date().toISOString(),
            updated_at:
              business.updatedAt ||
              business.updated_at ||
              new Date().toISOString(),
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

          processed++;
        } catch (error) {
          console.error(
            `❌ Error inserting business ${business.name}:`,
            error.message,
          );
        }
      }

      console.log(
        `📝 Processed ${Math.min(i + batchSize, businesses.length)}/${businesses.length} businesses`,
      );
    }

    // Update category counts
    await client.query(`
      UPDATE business_categories 
      SET business_count = (
        SELECT COUNT(*) 
        FROM businesses 
        WHERE category ILIKE '%' || business_categories.name || '%'
      )
    `);

    // Update business stats
    await client.query("SELECT update_business_stats()");

    // Commit transaction
    await client.query("COMMIT");

    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Total businesses migrated: ${processed}`);

    // Verify the migration
    const countResult = await client.query("SELECT COUNT(*) FROM businesses");
    const statsResult = await client.query(
      "SELECT * FROM business_stats ORDER BY id DESC LIMIT 1",
    );

    console.log(`🔍 Verification:`);
    console.log(`   - Businesses in database: ${countResult.rows[0].count}`);
    if (statsResult.rows.length > 0) {
      const stats = statsResult.rows[0];
      console.log(`   - Total reviews: ${stats.total_reviews}`);
      console.log(`   - Average rating: ${stats.avg_rating}`);
      console.log(`   - Total locations: ${stats.total_locations}`);
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Export for use in other scripts
module.exports = { migrateBusinessData, pool };

// Run migration if called directly
if (require.main === module) {
  migrateBusinessData()
    .then(() => {
      console.log("🎉 Database migration completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}
