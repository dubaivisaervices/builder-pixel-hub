import { Router } from "express";
import Database from "better-sqlite3";
import path from "path";

const router = Router();

// SQLite database configuration
const DB_PATH =
  process.env.NODE_ENV === "production"
    ? "/database/reportvisascam_businesses.db" // Hostinger path
    : "./database/reportvisascam_businesses.db"; // Local development

let db: Database.Database | null = null;

// Initialize database connection
function getDatabase() {
  if (!db) {
    try {
      db = new Database(DB_PATH);
      db.pragma("journal_mode = WAL");
      db.pragma("synchronous = NORMAL");
      console.log("✅ SQLite database connected successfully");
    } catch (error) {
      console.error("❌ SQLite database connection failed:", error.message);
      throw error;
    }
  }
  return db;
}

// GET /api/sqlite/businesses - Get all businesses with pagination
router.get("/businesses", async (req, res) => {
  try {
    const database = getDatabase();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const minRating = parseFloat(req.query.minRating as string) || 0;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1=1";
    const params: any[] = [];

    if (search) {
      whereClause += " AND (name LIKE ? OR address LIKE ? OR category LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereClause += " AND category LIKE ?";
      params.push(`%${category}%`);
    }

    if (minRating > 0) {
      whereClause += " AND rating >= ?";
      params.push(minRating);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM businesses ${whereClause}`;
    const countResult = database.prepare(countQuery).get(...params) as {
      total: number;
    };

    // Get businesses
    const businessesQuery = `
      SELECT 
        id, name, address, category, phone, website, email,
        rating, reviewCount, latitude, longitude, businessStatus,
        logoUrl, photos, hasTargetKeyword, createdAt, updatedAt
      FROM businesses 
      ${whereClause}
      ORDER BY rating DESC, reviewCount DESC
      LIMIT ? OFFSET ?
    `;

    const businesses = database
      .prepare(businessesQuery)
      .all(...params, limit, offset);

    // Parse JSON fields
    const formattedBusinesses = businesses.map((business: any) => ({
      ...business,
      photos: business.photos ? JSON.parse(business.photos) : [],
      hasTargetKeyword: Boolean(business.hasTargetKeyword),
    }));

    res.json({
      success: true,
      data: {
        businesses: formattedBusinesses,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit),
        },
        filters: {
          search,
          category,
          minRating,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch businesses",
      message: error.message,
    });
  }
});

// GET /api/sqlite/business/:id - Get single business by ID
router.get("/business/:id", async (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;

    const query = `
      SELECT 
        id, name, address, category, phone, website, email,
        rating, reviewCount, latitude, longitude, businessStatus,
        logoUrl, photos, hasTargetKeyword, createdAt, updatedAt
      FROM businesses 
      WHERE id = ?
    `;

    const business = database.prepare(query).get(id);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found",
      });
    }

    // Parse JSON fields
    const formattedBusiness = {
      ...business,
      photos: business.photos ? JSON.parse(business.photos) : [],
      hasTargetKeyword: Boolean(business.hasTargetKeyword),
    };

    res.json({
      success: true,
      data: formattedBusiness,
    });
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch business",
      message: error.message,
    });
  }
});

// GET /api/sqlite/categories - Get all categories
router.get("/categories", async (req, res) => {
  try {
    const database = getDatabase();

    const query = `
      SELECT category, COUNT(*) as count 
      FROM businesses 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `;

    const categories = database.prepare(query).all();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
      message: error.message,
    });
  }
});

// GET /api/sqlite/stats - Get database statistics
router.get("/stats", async (req, res) => {
  try {
    const database = getDatabase();

    const statsQuery = `
      SELECT 
        COUNT(*) as totalBusinesses,
        COUNT(CASE WHEN hasTargetKeyword = 1 THEN 1 END) as withKeywords,
        COUNT(CASE WHEN logoUrl IS NOT NULL THEN 1 END) as withLogos,
        COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as withRatings,
        ROUND(AVG(CASE WHEN rating IS NOT NULL THEN rating END), 2) as avgRating,
        MAX(rating) as maxRating,
        MIN(rating) as minRating
      FROM businesses
    `;

    const stats = database.prepare(statsQuery).get();

    const categoryQuery = `
      SELECT COUNT(DISTINCT category) as totalCategories
      FROM businesses 
      WHERE category IS NOT NULL
    `;

    const categoryStats = database.prepare(categoryQuery).get();

    res.json({
      success: true,
      data: {
        ...stats,
        ...categoryStats,
        databasePath: DB_PATH,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
      message: error.message,
    });
  }
});

// GET /api/sqlite/health - Health check for SQLite database
router.get("/health", async (req, res) => {
  try {
    const database = getDatabase();

    // Test basic query
    const testQuery = "SELECT COUNT(*) as count FROM businesses LIMIT 1";
    const result = database.prepare(testQuery).get() as { count: number };

    res.json({
      success: true,
      status: "healthy",
      databaseConnected: true,
      businessCount: result.count,
      databasePath: DB_PATH,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      databaseConnected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  if (db) {
    console.log("🔌 Closing SQLite database connection...");
    db.close();
  }
  process.exit(0);
});

export default router;
