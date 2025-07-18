const { Pool } = require("pg");

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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const client = await pool.connect();

    try {
      // Test database connection
      console.log("🔍 Testing database connection...");

      // Create table if it doesn't exist
      await client.query(`
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
          has_target_keyword BOOLEAN,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get current count
      const countResult = await client.query(
        "SELECT COUNT(*) as count FROM businesses",
      );
      const currentCount = parseInt(countResult.rows[0].count);

      // Test insert
      const testBusiness = {
        id: `test_${Date.now()}`,
        name: "Test Business",
        address: "Test Address, Dubai",
        category: "Test Category",
        phone: "+971-123-456789",
        website: "https://test.com",
        email: "test@test.com",
        rating: 4.5,
        review_count: 10,
        latitude: 25.2048,
        longitude: 55.2708,
        business_status: "OPERATIONAL",
        logo_url: "",
        photos: JSON.stringify([]),
        has_target_keyword: true,
      };

      await client.query(
        `INSERT INTO businesses (
          id, name, address, category, phone, website, email,
          rating, review_count, latitude, longitude, business_status,
          logo_url, photos, has_target_keyword
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          testBusiness.id,
          testBusiness.name,
          testBusiness.address,
          testBusiness.category,
          testBusiness.phone,
          testBusiness.website,
          testBusiness.email,
          testBusiness.rating,
          testBusiness.review_count,
          testBusiness.latitude,
          testBusiness.longitude,
          testBusiness.business_status,
          testBusiness.logo_url,
          testBusiness.photos,
          testBusiness.has_target_keyword,
        ],
      );

      // Get new count
      const newCountResult = await client.query(
        "SELECT COUNT(*) as count FROM businesses",
      );
      const newCount = parseInt(newCountResult.rows[0].count);

      // Clean up test business
      await client.query("DELETE FROM businesses WHERE id = $1", [
        testBusiness.id,
      ]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Database test successful",
          test: {
            connection: "✅ Connected",
            tableCreation: "✅ Table exists/created",
            beforeCount: currentCount,
            afterInsert: newCount,
            insertWorked: newCount > currentCount,
          },
          environment: {
            hasNeonUrl: !!process.env.NEON_DATABASE_URL,
            urlPrefix: process.env.NEON_DATABASE_URL
              ? process.env.NEON_DATABASE_URL.substring(0, 20) + "..."
              : "Not set",
          },
        }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database test failed:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Database test failed",
        message: error.message,
        environment: {
          hasNeonUrl: !!process.env.NEON_DATABASE_URL,
          urlPrefix: process.env.NEON_DATABASE_URL
            ? process.env.NEON_DATABASE_URL.substring(0, 20) + "..."
            : "Not set",
        },
      }),
    };
  }
};
