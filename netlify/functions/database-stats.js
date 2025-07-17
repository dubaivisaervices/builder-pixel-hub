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
      // Get latest stats
      const statsResult = await client.query(
        "SELECT * FROM business_stats ORDER BY id DESC LIMIT 1",
      );

      let stats;
      if (statsResult.rows.length === 0) {
        // Calculate stats if not available
        const calcResult = await client.query(`
          SELECT 
            COUNT(*) as total_businesses,
            COALESCE(SUM(review_count), 0) as total_reviews,
            ROUND(AVG(rating), 2) as avg_rating,
            COUNT(DISTINCT CONCAT(latitude, ',', longitude)) as total_locations
          FROM businesses 
          WHERE business_status = 'OPERATIONAL'
        `);

        stats = {
          total_businesses: parseInt(calcResult.rows[0].total_businesses || 0),
          total_reviews: parseInt(calcResult.rows[0].total_reviews || 0),
          avg_rating: parseFloat(calcResult.rows[0].avg_rating || 0),
          total_locations: parseInt(calcResult.rows[0].total_locations || 0),
          scam_reports: 0, // Will be implemented later
          updated_at: new Date().toISOString(),
        };

        // Update stats table
        await client.query("SELECT update_business_stats()");
      } else {
        stats = {
          total_businesses: parseInt(statsResult.rows[0].total_businesses || 0),
          total_reviews: parseInt(statsResult.rows[0].total_reviews || 0),
          avg_rating: parseFloat(statsResult.rows[0].avg_rating || 0),
          total_locations: parseInt(statsResult.rows[0].total_locations || 0),
          scam_reports: parseInt(statsResult.rows[0].scam_reports || 0),
          updated_at: statsResult.rows[0].updated_at,
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          totalBusinesses: stats.total_businesses,
          totalReviews: stats.total_reviews,
          avgRating: stats.avg_rating,
          locations: stats.total_locations,
          scamReports: stats.scam_reports,
          lastUpdated: stats.updated_at,
        }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Stats query failed:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch stats",
        message: error.message,
      }),
    };
  }
};
