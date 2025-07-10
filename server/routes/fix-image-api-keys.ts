import { Request, Response } from "express";
import { database } from "../database/database";

export const fixImageApiKeys = async (req: Request, res: Response) => {
  try {
    const oldKey = "AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk";
    const newKey = "AIzaSyDtCuMfNlJVEO5OFbRKHzziy1k4-W-tcC8";

    console.log("🔧 Fixing old API keys in image URLs...");

    // Fix logo URLs
    const logoResult = await database.run(
      `UPDATE businesses 
       SET logo_url = REPLACE(logo_url, ?, ?) 
       WHERE logo_url LIKE ?`,
      [oldKey, newKey, `%${oldKey}%`],
    );

    // Fix photo URLs in photos_json
    const photosResult = await database.run(
      `UPDATE businesses 
       SET photos_json = REPLACE(photos_json, ?, ?) 
       WHERE photos_json LIKE ?`,
      [oldKey, newKey, `%${oldKey}%`],
    );

    // Fix photo references
    const photoRefResult = await database.run(
      `UPDATE businesses 
       SET photo_reference = REPLACE(photo_reference, ?, ?) 
       WHERE photo_reference LIKE ?`,
      [oldKey, newKey, `%${oldKey}%`],
    );

    console.log(`✅ Updated ${logoResult.changes} logo URLs`);
    console.log(`✅ Updated ${photosResult.changes} photo collections`);
    console.log(`✅ Updated ${photoRefResult.changes} photo references`);

    res.json({
      success: true,
      message: "API keys updated successfully",
      updated: {
        logoUrls: logoResult.changes,
        photosJson: photosResult.changes,
        photoReferences: photoRefResult.changes,
      },
    });
  } catch (error) {
    console.error("Error fixing API keys:", error);
    res.status(500).json({
      error: "Failed to fix API keys",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
