import { Request, Response } from "express";
import { database } from "../database/database";

export async function addMissingColumns(req: Request, res: Response) {
  try {
    // Add logo_base64 column if it doesn't exist
    await database.run(`
      ALTER TABLE businesses 
      ADD COLUMN logo_base64 TEXT DEFAULT NULL
    `);

    // Add photos_local_json column if it doesn't exist
    await database.run(`
      ALTER TABLE businesses 
      ADD COLUMN photos_local_json TEXT DEFAULT NULL
    `);

    res.json({
      success: true,
      message: "Missing columns added successfully",
    });
  } catch (error) {
    // Ignore errors if columns already exist
    if (error instanceof Error && error.message.includes("duplicate column")) {
      res.json({
        success: true,
        message: "Columns already exist",
      });
    } else {
      console.error("Error adding columns:", error);
      res.status(500).json({
        error: "Failed to add columns",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export async function checkDatabaseSchema(req: Request, res: Response) {
  try {
    const columns = await database.all("PRAGMA table_info(businesses)");

    const columnNames = columns.map((col: any) => col.name);
    const missingColumns = [];

    if (!columnNames.includes("logo_base64")) {
      missingColumns.push("logo_base64");
    }

    if (!columnNames.includes("photos_local_json")) {
      missingColumns.push("photos_local_json");
    }

    res.json({
      columns: columnNames,
      missingColumns,
      needsfix: missingColumns.length > 0,
    });
  } catch (error) {
    console.error("Error checking schema:", error);
    res.status(500).json({
      error: "Failed to check schema",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
