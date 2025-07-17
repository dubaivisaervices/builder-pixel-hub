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
    const businessData = JSON.parse(event.body);
    const client = await pool.connect();

    try {
      // Check if business already exists
      const existingBusiness = await client.query(
        "SELECT id FROM businesses WHERE id = $1",
        [businessData.id],
      );

      if (existingBusiness.rows.length > 0) {
        // Update existing business
        await client.query(
          `UPDATE businesses SET 
           name = $2, address = $3, category = $4, phone = $5, website = $6, email = $7,
           rating = $8, review_count = $9, latitude = $10, longitude = $11, business_status = $12,
           logo_url = $13, photos = $14, has_target_keyword = $15, updated_at = NOW()
           WHERE id = $1`,
          [
            businessData.id,
            businessData.name,
            businessData.address,
            businessData.category,
            businessData.phone || "",
            businessData.website || "",
            businessData.email || "",
            businessData.rating || 4.0,
            businessData.reviewCount || 0,
            businessData.latitude,
            businessData.longitude,
            businessData.businessStatus || "OPERATIONAL",
            businessData.logoUrl || "",
            JSON.stringify(businessData.photos || []),
            businessData.hasTargetKeyword || false,
          ],
        );
        console.log(`Updated business: ${businessData.name}`);
      } else {
        // Insert new business
        await client.query(
          `INSERT INTO businesses (
            id, name, address, category, phone, website, email,
            rating, review_count, latitude, longitude, business_status,
            logo_url, photos, has_target_keyword, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
          [
            businessData.id,
            businessData.name,
            businessData.address,
            businessData.category,
            businessData.phone || "",
            businessData.website || "",
            businessData.email || "",
            businessData.rating || 4.0,
            businessData.reviewCount || 0,
            businessData.latitude,
            businessData.longitude,
            businessData.businessStatus || "OPERATIONAL",
            businessData.logoUrl || "",
            JSON.stringify(businessData.photos || []),
            businessData.hasTargetKeyword || false,
          ],
        );
        console.log(`Inserted new business: ${businessData.name}`);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: `Business ${businessData.name} saved successfully`,
          businessId: businessData.id,
        }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database save failed:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to save business",
        message: error.message,
      }),
    };
  }
};
