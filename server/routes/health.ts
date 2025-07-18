import { RequestHandler } from "express";
import { database } from "../database/database";

export const healthCheck: RequestHandler = async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await database.get("SELECT 1 as test");

    // Check if we can read business data
    const businessCount = await database.get(
      "SELECT COUNT(*) as count FROM businesses",
    );

    // Check if reviews are accessible
    const reviewCount = await database.get(
      "SELECT COUNT(*) as count FROM reviews",
    );

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: !!dbCheck,
        businesses: businessCount?.count || 0,
        reviews: reviewCount?.count || 0,
      },
      version: process.env.npm_package_version || "unknown",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      uptime: process.uptime(),
    });
  }
};
