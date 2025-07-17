const { Pool } = require("pg");
const fetch = require("node-fetch");

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: true,
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    console.log("🔄 Starting business import to database...");

    // Create businesses table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        category TEXT,
        phone TEXT,
        website TEXT,
        email TEXT,
        rating DECIMAL(3,2),
        review_count INTEGER,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        business_status TEXT,
        logo_url TEXT,
        photos JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Load businesses from complete JSON file
    console.log("📄 Loading businesses from complete JSON...");
    let businesses = [];

    try {
      const response = await fetch(
        "https://reportvisascam.com/api/complete-businesses.json",
      );
      const data = await response.json();
      businesses = data.businesses || [];
      console.log(`📊 Loaded ${businesses.length} businesses from JSON`);
    } catch (error) {
      throw new Error(`Failed to load businesses: ${error.message}`);
    }

    if (businesses.length === 0) {
      throw new Error("No businesses found in JSON file");
    }

    // Import businesses in batches
    console.log("🔄 Importing businesses to database...");
    let imported = 0;
    let errors = 0;
    const batchSize = 100;

    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      // Create values array for batch insert
      const values = [];
      const placeholders = [];

      batch.forEach((business, index) => {
        const baseIndex = index * 14;
        placeholders.push(`(
          $${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4},
          $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8},
          $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12},
          $${baseIndex + 13}, $${baseIndex + 14}
        )`);

        values.push(
          business.id || business.place_id,
          business.name || "Unknown Business",
          business.address || business.formatted_address || "",
          business.category || "Business Services",
          business.phone || business.formatted_phone_number || "",
          business.website || "",
          business.email || "",
          parseFloat(business.rating || business.google_rating || 4.0),
          parseInt(business.reviewCount || business.user_ratings_total || 0),
          parseFloat(business.latitude || 0),
          parseFloat(business.longitude || 0),
          business.businessStatus || "OPERATIONAL",
          business.logoUrl || "",
          JSON.stringify(business.photos || []),
        );
      });

      try {
        const query = `
          INSERT INTO businesses (
            id, name, address, category, phone, website, email,
            rating, review_count, latitude, longitude, business_status, logo_url, photos
          ) VALUES ${placeholders.join(", ")}
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            category = EXCLUDED.category,
            phone = EXCLUDED.phone,
            website = EXCLUDED.website,
            email = EXCLUDED.email,
            rating = EXCLUDED.rating,
            review_count = EXCLUDED.review_count,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            business_status = EXCLUDED.business_status,
            logo_url = EXCLUDED.logo_url,
            photos = EXCLUDED.photos,
            updated_at = CURRENT_TIMESTAMP
        `;

        await pool.query(query, values);
        imported += batch.length;
        console.log(`✅ Imported batch: ${imported}/${businesses.length}`);
      } catch (batchError) {
        console.error(`❌ Batch import error:`, batchError.message);
        errors += batch.length;
      }
    }

    // Get final count
    const countResult = await pool.query(
      "SELECT COUNT(*) as total FROM businesses",
    );
    const totalInDB = parseInt(countResult.rows[0].total);

    console.log(`📊 Import complete: ${totalInDB} businesses in database`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Businesses imported successfully",
        summary: {
          totalBusinesses: businesses.length,
          imported: imported,
          errors: errors,
          finalDatabaseCount: totalInDB,
        },
      }),
    };
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Import failed",
        message: error.message,
      }),
    };
  }
};
