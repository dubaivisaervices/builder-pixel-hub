import { Router, Request, Response } from "express";
import { database } from "../database/database";

const router = Router();

// Endpoint to add S3 URL columns to businesses table
router.post("/add-s3-columns", async (req: Request, res: Response) => {
  try {
    console.log("🔄 Adding S3 URL columns to businesses table...");

    // Add logo_s3_url column
    try {
      await database.run("ALTER TABLE businesses ADD COLUMN logo_s3_url TEXT");
      console.log("✅ Added logo_s3_url column");
    } catch (err: any) {
      if (err.message.includes("duplicate column name")) {
        console.log("ℹ️ logo_s3_url column already exists");
      } else {
        throw err;
      }
    }

    // Add photos_s3_urls column
    try {
      await database.run(
        "ALTER TABLE businesses ADD COLUMN photos_s3_urls TEXT",
      );
      console.log("✅ Added photos_s3_urls column");
    } catch (err: any) {
      if (err.message.includes("duplicate column name")) {
        console.log("ℹ️ photos_s3_urls column already exists");
      } else {
        throw err;
      }
    }

    console.log("🎉 Database migration completed successfully!");

    res.json({
      success: true,
      message: "S3 URL columns added successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Endpoint to check if S3 columns exist
router.get("/check-s3-columns", async (req: Request, res: Response) => {
  try {
    const result = await database.get(`
      PRAGMA table_info(businesses)
    `);

    const columns = await database.all(`
      PRAGMA table_info(businesses)
    `);

    const hasLogoS3 = columns.some((col: any) => col.name === "logo_s3_url");
    const hasPhotosS3 = columns.some(
      (col: any) => col.name === "photos_s3_urls",
    );

    res.json({
      success: true,
      columns: {
        logo_s3_url: hasLogoS3,
        photos_s3_urls: hasPhotosS3,
      },
      allColumns: columns.map((col: any) => col.name),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking S3 columns:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
