import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { GoogleMapsImageHandler } from "../utils/googleMapsImageHandler";

export const analyzeImageTypes: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Analyzing image types in database...");

    const stats = {
      totalBusinesses: 0,
      businessesWithLogos: 0,
      businessesWithPhotos: 0,
      logoTypes: {
        googleusercontent: 0,
        maps_api: 0,
        gstatic: 0,
        other: 0,
        canDownload: 0,
        requiresAuth: 0,
      },
      photoTypes: {
        googleusercontent: 0,
        maps_api: 0,
        gstatic: 0,
        other: 0,
        canDownload: 0,
        requiresAuth: 0,
      },
      totalLogos: 0,
      totalPhotos: 0,
    };

    const batchSize = 100;
    let offset = 0;

    while (true) {
      const businesses = await businessService.getBusinessesPaginated(
        offset,
        batchSize,
      );

      if (businesses.length === 0) break;

      for (const business of businesses) {
        stats.totalBusinesses++;

        // Analyze logo
        if (business.logoUrl) {
          stats.businessesWithLogos++;
          stats.totalLogos++;

          const analysis = GoogleMapsImageHandler.analyzeImageUrl(
            business.logoUrl,
          );
          stats.logoTypes[analysis.type]++;

          if (analysis.canDownload) {
            stats.logoTypes.canDownload++;
          }
          if (analysis.requiresAuth) {
            stats.logoTypes.requiresAuth++;
          }
        }

        // Analyze photos
        if (business.photos && Array.isArray(business.photos)) {
          stats.businessesWithPhotos++;

          for (const photo of business.photos) {
            if (photo.url) {
              stats.totalPhotos++;

              const analysis = GoogleMapsImageHandler.analyzeImageUrl(
                photo.url,
              );
              stats.photoTypes[analysis.type]++;

              if (analysis.canDownload) {
                stats.photoTypes.canDownload++;
              }
              if (analysis.requiresAuth) {
                stats.photoTypes.requiresAuth++;
              }
            }
          }
        }
      }

      offset += batchSize;

      // Log progress for large datasets
      if (stats.totalBusinesses % 200 === 0) {
        console.log(`📊 Analyzed ${stats.totalBusinesses} businesses...`);
      }
    }

    console.log("🔍 Analysis completed!");

    const summary = {
      overview: {
        totalBusinesses: stats.totalBusinesses,
        businessesWithLogos: stats.businessesWithLogos,
        businessesWithPhotos: stats.businessesWithPhotos,
        totalImages: stats.totalLogos + stats.totalPhotos,
      },
      downloadability: {
        totalDownloadableLogos: stats.logoTypes.canDownload,
        totalDownloadablePhotos: stats.photoTypes.canDownload,
        totalRequiringAuth:
          stats.logoTypes.requiresAuth + stats.photoTypes.requiresAuth,
        downloadablePercentage: Math.round(
          ((stats.logoTypes.canDownload + stats.photoTypes.canDownload) /
            (stats.totalLogos + stats.totalPhotos)) *
            100,
        ),
      },
      breakdown: {
        logos: stats.logoTypes,
        photos: stats.photoTypes,
      },
    };

    res.json({
      success: true,
      message: "Image type analysis completed",
      stats,
      summary,
    });
  } catch (error) {
    console.error("Error analyzing image types:", error);
    res.status(500).json({
      error: "Failed to analyze image types",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
