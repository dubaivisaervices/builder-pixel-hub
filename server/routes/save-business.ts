import { RequestHandler } from "express";
import { Pool } from "pg";

export const saveBusiness: RequestHandler = async (req, res) => {
  try {
    const businessData = req.body;
    console.log(`💾 Saving business: ${businessData.name}`);

    // Create pool connection
    const pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: true,
    });

    const client = await pool.connect();

    try {
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
            businessData.latitude || 0,
            businessData.longitude || 0,
            businessData.businessStatus || "OPERATIONAL",
            businessData.logoUrl || "",
            JSON.stringify(businessData.photos || []),
            businessData.hasTargetKeyword || false,
          ],
        );
        console.log(`✅ Updated business: ${businessData.name}`);
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
            businessData.latitude || 0,
            businessData.longitude || 0,
            businessData.businessStatus || "OPERATIONAL",
            businessData.logoUrl || "",
            JSON.stringify(businessData.photos || []),
            businessData.hasTargetKeyword || false,
          ],
        );
        console.log(`✅ Inserted new business: ${businessData.name}`);
      }

      await pool.end();

      res.json({
        success: true,
        message: `Business ${businessData.name} saved successfully`,
        businessId: businessData.id,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Database save failed:", error);

    res.status(500).json({
      success: false,
      error: "Failed to save business",
      message: error.message,
      details: {
        errorName: error.name,
        errorCode: error.code,
      },
    });
  }
};
