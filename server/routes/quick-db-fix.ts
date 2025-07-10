import { Request, Response } from "express";
import { database } from "../database/database";

export async function quickFixDatabase(req: Request, res: Response) {
  try {
    // Add missing columns if they don't exist
    try {
      await database.run(
        `ALTER TABLE businesses ADD COLUMN logo_base64 TEXT DEFAULT NULL`,
      );
    } catch (error) {
      // Column might already exist
    }

    try {
      await database.run(
        `ALTER TABLE businesses ADD COLUMN photos_local_json TEXT DEFAULT NULL`,
      );
    } catch (error) {
      // Column might already exist
    }

    res.json({
      success: true,
      message: "Database schema fixed",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fix database",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
