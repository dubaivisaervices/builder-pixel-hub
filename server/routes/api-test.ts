import { RequestHandler } from "express";
import { database } from "../database/database";

export const apiTest: RequestHandler = async (req, res) => {
  try {
    // Test database connection
    const dbTest = await database.get("SELECT 1 as test");

    // Test business count
    const businessCount = await database.get(
      "SELECT COUNT(*) as count FROM businesses",
    );

    // Test reviews count
    const reviewCount = await database.get(
      "SELECT COUNT(*) as count FROM reviews",
    );

    // Test specific business
    const testBusiness = await database.get(
      "SELECT * FROM businesses WHERE id = ? LIMIT 1",
      ["ChIJ_zAlQHJDXz4RWdAA3egJYmg"],
    );

    // Test reviews for this business
    const testReviews = await database.all(
      "SELECT * FROM reviews WHERE business_id = ? LIMIT 3",
      ["ChIJ_zAlQHJDXz4RWdAA3egJYmg"],
    );

    const testResults = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: !!dbTest,
        businesses: businessCount?.count || 0,
        reviews: reviewCount?.count || 0,
      },
      testBusiness: {
        found: !!testBusiness,
        name: testBusiness?.name || "Not found",
        id: testBusiness?.id || "N/A",
      },
      testReviews: {
        count: testReviews?.length || 0,
        samples: testReviews?.slice(0, 2) || [],
      },
      endpoints: {
        businessReviews: `/api/business-reviews/${testBusiness?.id || "test-id"}`,
        companyReports: `/api/reports/company/${testBusiness?.id || "test-id"}`,
        businesses: "/api/businesses",
        dubaiServices: "/api/dubai-visa-services",
      },
      server: {
        cors: "enabled",
        jsonParser: "enabled",
        contentType: res.getHeader("Content-Type"),
      },
    };

    res.json(testResults);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};
