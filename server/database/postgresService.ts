import { Pool } from "pg";

// PostgreSQL service for server-side operations
class PostgresService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: true,
    });
  }

  // Insert or update a business in PostgreSQL
  async upsertBusiness(businessData: any): Promise<void> {
    const client = await this.pool.connect();

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
        console.log(`✅ Updated business in PostgreSQL: ${businessData.name}`);
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
        console.log(
          `✅ Inserted new business in PostgreSQL: ${businessData.name}`,
        );
      }
    } finally {
      client.release();
    }
  }

  // Check if business exists by ID
  async getBusinessById(id: string): Promise<any | null> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        "SELECT * FROM businesses WHERE id = $1",
        [id],
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Get business count
  async getBusinessCount(): Promise<number> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        "SELECT COUNT(*) as count FROM businesses",
      );
      return parseInt(result.rows[0]?.count || 0);
    } finally {
      client.release();
    }
  }
}

export const postgresService = new PostgresService();
