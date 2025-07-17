// Quick test to check business count from database
const { Pool } = require("pg");

async function testBusinessCount() {
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: true,
  });

  try {
    const client = await pool.connect();

    // Get total count from database
    const result = await client.query(
      "SELECT COUNT(*) as count FROM businesses",
    );
    const dbCount = result.rows[0]?.count || 0;

    console.log(`📊 Database business count: ${dbCount}`);

    client.release();

    // Also check JSON file for comparison
    const fs = require("fs");
    try {
      const jsonData = JSON.parse(
        fs.readFileSync("./public/complete-businesses.json", "utf8"),
      );
      const jsonCount = jsonData.businesses?.length || 0;
      console.log(`📄 JSON business count: ${jsonCount}`);
    } catch (e) {
      console.log("📄 JSON file not found or invalid");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  } finally {
    await pool.end();
  }
}

testBusinessCount();
