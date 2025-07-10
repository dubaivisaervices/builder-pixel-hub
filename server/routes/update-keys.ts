import { RequestHandler } from "express";
import { database } from "../database/database";

const OLD_API_KEY = "AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk";
const NEW_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ||
  "AIzaSyDtCuMfNlJVEO5OFbRKHzziy1k4-W-tcC8";

export const updateApiKeys: RequestHandler = async (req, res) => {
  try {
    console.log("🔧 Updating Google API URLs in database...");

    // Count records that need updating
    const logoUrlCount = await database.get(
      `SELECT COUNT(*) as count FROM businesses WHERE logo_url LIKE '%${OLD_API_KEY}%'`,
    );

    const photosJsonCount = await database.get(
      `SELECT COUNT(*) as count FROM businesses WHERE photos_json LIKE '%${OLD_API_KEY}%'`,
    );

    console.log(
      `📊 Found ${logoUrlCount.count} logo URLs and ${photosJsonCount.count} photo JSON records to update`,
    );

    let updatedLogoUrls = 0;
    let updatedPhotosJson = 0;

    // Update logo URLs
    if (logoUrlCount.count > 0) {
      const logoResult = await database.run(
        `UPDATE businesses SET logo_url = REPLACE(logo_url, ?, ?) WHERE logo_url LIKE ?`,
        [OLD_API_KEY, NEW_API_KEY, `%${OLD_API_KEY}%`],
      );
      updatedLogoUrls = logoResult.changes || 0;
      console.log(`✅ Updated ${updatedLogoUrls} logo URLs`);
    }

    // Update photos JSON
    if (photosJsonCount.count > 0) {
      const photosResult = await database.run(
        `UPDATE businesses SET photos_json = REPLACE(photos_json, ?, ?) WHERE photos_json LIKE ?`,
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

    console.log("🎉 API key update completed successfully!");
  } catch (error) {
    console.error("❌ Failed to update API keys:", error);
    res.status(500).json({
      error: "Failed to update API keys",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
