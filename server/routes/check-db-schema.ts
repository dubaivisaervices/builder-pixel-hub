import { RequestHandler } from "express";
import { database } from "../database/database";

export const checkDbSchema: RequestHandler = async (req, res) => {
  try {
    // Get table schema
    const schema = await database.all("PRAGMA table_info(businesses)");

    // Get sample business
    const sampleBusiness = await database.get(
      "SELECT * FROM businesses LIMIT 1",
    );

    // Get total count
    const countResult = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.json({
      success: true,
      schema,
      sampleBusiness,
      totalBusinesses: countResult.total,
    });
  } catch (error) {
    console.error("Check schema error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
