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

  try {
    const client = await pool.connect();

    try {
      // Test database connection
      const result = await client.query(
        "SELECT COUNT(*) as business_count FROM businesses",
      );
      const businessCount = result.rows[0]?.business_count || 0;

      // Get stats
      const statsResult = await client.query(
        "SELECT * FROM business_stats ORDER BY id DESC LIMIT 1",
      );
      const stats = statsResult.rows[0] || {};

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "healthy",
          database: "connected",
          timestamp: new Date().toISOString(),
          businessCount: parseInt(businessCount),
          stats: {
            totalBusinesses: stats.total_businesses || 0,
            totalReviews: stats.total_reviews || 0,
            avgRating: parseFloat(stats.avg_rating || 0),
            lastUpdated: stats.updated_at,
          },
        }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database health check failed:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "error",
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
