import { RequestHandler } from "express";
import { database } from "../database/database";

const OLD_API_KEY = "AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk";
const NEW_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export const updateApiKeys: RequestHandler = async (req, res) => {
  try {
    console.log("🔧 Updating Google API URLs in database...");
    console.log(`Old key: ${OLD_API_KEY}`);
    console.log(`New key: ${NEW_API_KEY}`);

    if (!NEW_API_KEY) {
      return res.status(400).json({
        error: "New API key not configured",
        message: "GOOGLE_PLACES_API_KEY environment variable is required",
      });
    }

    // Check how many records need updating
    const countResult = await database.get(
      `SELECT COUNT(*) as count FROM businesses WHERE logo_url LIKE '%${OLD_API_KEY}%'`,
    );

    const logoUrlCount = countResult?.count || 0;
    console.log(
      `📊 Found ${logoUrlCount} businesses with old API key in logo_url`,
    );

    // Check photos JSON
    const photosCountResult = await database.get(
      `SELECT COUNT(*) as count FROM businesses WHERE photos_json LIKE '%${OLD_API_KEY}%'`,
    );

    const photosJsonCount = photosCountResult?.count || 0;
    console.log(
      `📊 Found ${photosJsonCount} businesses with old API key in photos_json`,
    );

    let updatedLogoUrls = 0;
    let updatedPhotosJson = 0;

    // Update logo URLs
    if (logoUrlCount > 0) {
      const logoResult = await database.run(
        `UPDATE businesses 
         SET logo_url = REPLACE(logo_url, ?, ?)
         WHERE logo_url LIKE ?`,
        [OLD_API_KEY, NEW_API_KEY, `%${OLD_API_KEY}%`],
      );
      updatedLogoUrls = logoResult.changes || 0;
      console.log(`✅ Updated ${updatedLogoUrls} logo URLs`);
    }

    // Update photos JSON
    if (photosJsonCount > 0) {
      const photosResult = await database.run(
        `UPDATE businesses 
         SET photos_json = REPLACE(photos_json, ?, ?)
         WHERE photos_json LIKE ?`,
        [OLD_API_KEY, NEW_API_KEY, `%${OLD_API_KEY}%`],
      );
      updatedPhotosJson = photosResult.changes || 0;
      console.log(`✅ Updated ${updatedPhotosJson} photos JSON records`);
    }

    res.json({
      success: true,
      message: "API keys updated successfully",
      updated: {
        logoUrls: updatedLogoUrls,
        photosJson: updatedPhotosJson,
        total: updatedLogoUrls + updatedPhotosJson,
      },
      apiKeys: {
        oldKey: OLD_API_KEY.substring(0, 10) + "...",
        newKey: NEW_API_KEY.substring(0, 10) + "...",
      },
    });

    console.log("🎉 Database API key update completed successfully!");
  } catch (error) {
    console.error("❌ Failed to update API keys:", error);
    res.status(500).json({
      error: "Failed to update API keys",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
