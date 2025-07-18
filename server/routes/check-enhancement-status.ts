import { RequestHandler } from "express";
import { database } from "../database/database";
import fs from "fs";
import path from "path";

export const checkEnhancementStatus: RequestHandler = async (req, res) => {
  try {
    // Check businesses with logos/photos
    const enhancedBusinesses = await database.all(
      "SELECT COUNT(*) as count FROM businesses WHERE logo_url IS NOT NULL AND logo_url != ''",
    );

    // Check businesses with photos JSON
    const businessesWithPhotos = await database.all(
      "SELECT COUNT(*) as count FROM businesses WHERE photos_json IS NOT NULL AND photos_json != '' AND photos_json != '[]'",
    );

    // Get sample of enhanced businesses
    const sampleEnhanced = await database.all(
      "SELECT name, logo_url, photos_json FROM businesses WHERE logo_url IS NOT NULL AND logo_url != '' LIMIT 10",
    );

    // Check total businesses
    const totalBusinesses = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    // Count actual photo files
    const photosDir = path.join(process.cwd(), "uploads", "business-photos");
    let photoFilesCount = 0;
    try {
      if (fs.existsSync(photosDir)) {
        const files = fs.readdirSync(photosDir);
        photoFilesCount = files.filter((file) => file.endsWith(".jpg")).length;
      }
    } catch (error) {
      console.error("Error counting photo files:", error);
    }

    // Calculate enhancement stats
    const enhancementPercentage = (
      (enhancedBusinesses[0].count / totalBusinesses.total) *
      100
    ).toFixed(1);

    res.json({
      success: true,
      enhancementStatus: {
        totalBusinesses: totalBusinesses.total,
        businessesWithLogos: enhancedBusinesses[0].count,
        businessesWithPhotos: businessesWithPhotos[0].count,
        photoFilesDownloaded: photoFilesCount,
        enhancementPercentage: `${enhancementPercentage}%`,
        processStatus:
          enhancedBusinesses[0].count > 0
            ? "Enhancement process has been running successfully"
            : "Enhancement process not started or failed",
      },
      sampleEnhancedBusinesses: sampleEnhanced.map((b) => ({
        name: b.name,
        hasLogo: !!b.logo_url,
        photosCount: b.photos_json
          ? JSON.parse(b.photos_json || "[]").length
          : 0,
      })),
      recentlyEnhanced: sampleEnhanced
        .filter((b) => b.logo_url)
        .slice(0, 5)
        .map((b) => b.name),
    });
  } catch (error) {
    console.error("Enhancement status check error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
