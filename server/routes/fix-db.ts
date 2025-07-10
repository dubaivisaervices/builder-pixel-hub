import { RequestHandler } from "express";
import { database } from "../database/database";

export const fixDatabase: RequestHandler = async (req, res) => {
  try {
    console.log("🔧 Adding missing database columns...");

    const alterQueries = [
      `ALTER TABLE businesses ADD COLUMN logo_base64 TEXT`,
      `ALTER TABLE businesses ADD COLUMN photos_local_json TEXT`,
    ];

    const results = [];

    for (const query of alterQueries) {
      try {
        await database.run(query);
        const columnName = query.match(/ADD COLUMN (\w+)/)?.[1];
        console.log(`✅ Added missing column: ${columnName}`);
        results.push({ column: columnName, status: "added" });
      } catch (error: any) {
        if (error.message.includes("duplicate column")) {
          const columnName = query.match(/ADD COLUMN (\w+)/)?.[1];
          console.log(`ℹ️ Column already exists: ${columnName}`);
          results.push({ column: columnName, status: "exists" });
        } else {
          throw error;
        }
      }
    }

    res.json({
      success: true,
      message: "Database columns fixed",
      results,
    });
  } catch (error) {
    console.error("❌ Failed to fix database:", error);
    res.status(500).json({
      error: "Failed to fix database",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
