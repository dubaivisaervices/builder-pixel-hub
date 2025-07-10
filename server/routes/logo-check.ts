import { RequestHandler } from "express";
import { database } from "../database/database";

export const checkLogoStorage: RequestHandler = async (req, res) => {
  try {
    // Get total businesses
    const totalBusinesses = await database.get(
      "SELECT COUNT(*) as count FROM businesses",
    );

    // Get businesses with logo URLs
    const businessesWithLogoUrls = await database.get(
      "SELECT COUNT(*) as count FROM businesses WHERE logo_url IS NOT NULL",
    );

    // Get businesses with cached base64 logos
    const businessesWithBase64Logos = await database.get(
      "SELECT COUNT(*) as count FROM businesses WHERE logo_base64 IS NOT NULL AND logo_base64 != ''",
    );

    // Get businesses with logos but no cache (need API calls)
    const businessesNeedingApiCalls = await database.get(
      "SELECT COUNT(*) as count FROM businesses WHERE logo_url IS NOT NULL AND (logo_base64 IS NULL OR logo_base64 = '')",
    );

    // Get some examples of each type
    const examplesWithCache = await database.all(
      "SELECT name, LENGTH(logo_base64) as base64_size FROM businesses WHERE logo_base64 IS NOT NULL AND logo_base64 != '' LIMIT 5",
    );

    const examplesNeedingApi = await database.all(
      "SELECT name, logo_url FROM businesses WHERE logo_url IS NOT NULL AND (logo_base64 IS NULL OR logo_base64 = '') LIMIT 5",
    );

    const cachePercentage =
      totalBusinesses.count > 0
        ? Math.round(
            (businessesWithBase64Logos.count / totalBusinesses.count) * 100,
          )
        : 0;

    const response = {
      success: true,
      summary: {
        totalBusinesses: totalBusinesses.count,
        businessesWithLogos: businessesWithLogoUrls.count,
        cachedLogos: businessesWithBase64Logos.count,
        needingApiCalls: businessesNeedingApiCalls.count,
        cachePercentage: cachePercentage,
      },
      details: {
        storedInDatabase: {
          count: businessesWithBase64Logos.count,
          description:
            "Logos stored as base64 in database (FREE - no API calls needed)",
          examples: examplesWithCache.map((ex) => ({
            name: ex.name,
            sizeKB: Math.round((ex.base64_size * 0.75) / 1024), // rough base64 to bytes conversion
          })),
        },
        needingGoogleApi: {
          count: businessesNeedingApiCalls.count,
          description:
            "Only have Google API URLs (COSTS MONEY - API calls required)",
          examples: examplesNeedingApi.map((ex) => ({
            name: ex.name,
            hasUrl: !!ex.logo_url,
          })),
        },
      },
      recommendation:
        businessesWithBase64Logos.count === 0
          ? "🚨 NO LOGOS CACHED - All logos will require Google API calls (costs money)"
          : cachePercentage >= 80
            ? "✅ EXCELLENT - Most logos are cached in database"
            : cachePercentage >= 50
              ? "⚠️ PARTIAL - Some logos cached, consider downloading more"
              : "🔴 POOR - Most logos require API calls, recommend downloading to database",
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Failed to check logo storage:", error);
    res.status(500).json({
      error: "Failed to check logo storage",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
