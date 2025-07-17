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

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const client = await pool.connect();

    try {
      // Parse query parameters
      const params = new URLSearchParams(event.queryStringParameters || {});
      const page = parseInt(params.get("page") || "1");
      const limit = Math.min(parseInt(params.get("limit") || "50"), 200); // Max 200 per request
      const category = params.get("category");
      const search = params.get("search");
      const all = params.get("all") === "true";

      let query = `
        SELECT 
          id, name, address, category, phone, website, email,
          rating, review_count, latitude, longitude, business_status,
          logo_url, logo_s3_url, photos, has_target_keyword,
          created_at, updated_at
        FROM businesses 
        WHERE business_status = 'OPERATIONAL'
      `;
      const queryParams = [];

      // Add filters
      if (category) {
        queryParams.push(category);
        query += ` AND category ILIKE $${queryParams.length}`;
      }

      if (search) {
        queryParams.push(`%${search}%`);
        query += ` AND (name ILIKE $${queryParams.length} OR address ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
      }

      // Add ordering
      query += ` ORDER BY rating DESC, review_count DESC`;

      // Get total count for pagination
      let totalQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        "SELECT COUNT(*) as total FROM",
      );
      totalQuery = totalQuery.replace(/ORDER BY.*$/, "");

      const totalResult = await client.query(totalQuery, queryParams);
      const total = parseInt(totalResult.rows[0]?.total || 0);

      // Add pagination unless requesting all
      if (!all) {
        const offset = (page - 1) * limit;
        queryParams.push(limit, offset);
        query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
      }

      // Execute main query
      const result = await client.query(query, queryParams);
      const businesses = result.rows.map((row) => ({
        ...row,
        rating: parseFloat(row.rating || 0),
        review_count: parseInt(row.review_count || 0),
        latitude: parseFloat(row.latitude || 0),
        longitude: parseFloat(row.longitude || 0),
        photos: row.photos || [],
      }));

      const response = {
        businesses,
        total,
        page: all ? 1 : page,
        totalPages: all ? 1 : Math.ceil(total / limit),
        limit: all ? total : limit,
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database query failed:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Database query failed",
        message: error.message,
      }),
    };
  }
};
