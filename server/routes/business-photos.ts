import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { PhotoFallbackSystem } from "../utils/photoFallbackSystem";

/**
 * Get business photos with intelligent fallback system
 * This endpoint provides resilient photo access that works even when Google API fails
 */
export const getBusinessPhotos: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { maxPhotos = 10, quality = "medium" } = req.query;

    if (!businessId) {
      return res.status(400).json({
        error: "Business ID is required",
        message: "Please provide a valid business ID",
      });
    }

    console.log(
      `🖼️ Getting photos for business: ${businessId} (max: ${maxPhotos})`,
    );

    // Get business data with photo status
    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({
        error: "Business not found",
        message: `No business found with ID: ${businessId}`,
      });
    }

    // Check photo availability status
    const photoStatus = await PhotoFallbackSystem.getPhotoStatus(businessId);

    // If no photos at all
    if (!business.photos || business.photos.length === 0) {
      console.log(`📷 No photos found for business: ${business.name}`);
      return res.json({
        businessId,
        businessName: business.name,
        photos: [],
        status: {
          total: 0,
          available: 0,
          cached: 0,
          percentage: 0,
        },
        source: "none",
        message: "No photos available for this business",
      });
    }

    // Process photos with fallback system
    const processedPhotos = [];
    const maxPhotosNum = parseInt(maxPhotos as string, 10);

    for (let i = 0; i < Math.min(business.photos.length, maxPhotosNum); i++) {
      const photo = business.photos[i];

      try {
        // Use fallback system to get photo
        const photoResult = await PhotoFallbackSystem.getPhotoWithFallback(
          photo.url || "",
          businessId,
          `photo_${photo.id}`,
          {
            retryAttempts: 1, // Quick retry for individual requests
            retryDelay: 500,
            fallbackToCache: true,
            optimizeForMobile: quality === "mobile",
          },
        );

        if (photoResult.success && photoResult.base64) {
          processedPhotos.push({
            id: photo.id,
            caption: photo.caption || `Photo ${i + 1}`,
            base64: photoResult.base64,
            source: photoResult.source,
            hasLocal: photoResult.source === "cache",
            optimized: quality === "mobile",
          });
        } else {
          // Include error info but still return something
          processedPhotos.push({
            id: photo.id,
            caption: photo.caption || `Photo ${i + 1}`,
            base64: photoResult.base64 || null, // May be placeholder
            source: photoResult.source,
            hasLocal: false,
            error: photoResult.error,
            optimized: quality === "mobile",
          });
        }
      } catch (error) {
        console.error(`Error processing photo ${i + 1}:`, error);
        // Don't fail the whole request for one photo
        processedPhotos.push({
          id: photo.id,
          caption: photo.caption || `Photo ${i + 1}`,
          base64: null,
          source: "error",
          hasLocal: false,
          error: error instanceof Error ? error.message : "Unknown error",
          optimized: false,
        });
      }
    }

    const successfulPhotos = processedPhotos.filter(
      (p) => p.base64 && !p.error,
    );
    const cachedPhotos = processedPhotos.filter((p) => p.hasLocal);

    console.log(
      `✅ Photos processed: ${successfulPhotos.length}/${processedPhotos.length} successful, ${cachedPhotos.length} from cache`,
    );

    // Determine overall cost impact
    const apiCalls = processedPhotos.filter((p) => p.source === "api").length;
    const costImpact = apiCalls > 0 ? "API_COST_INCURRED" : "NO_API_COST";

    res.json({
      businessId,
      businessName: business.name,
      photos: processedPhotos,
      status: {
        total: business.photos.length,
        requested: maxPhotosNum,
        returned: processedPhotos.length,
        successful: successfulPhotos.length,
        cached: cachedPhotos.length,
        percentage: photoStatus.percentage,
        needsDownload: photoStatus.needsDownload,
        lastUpdated: photoStatus.lastUpdated,
      },
      costImpact,
      apiCalls,
      message:
        apiCalls > 0
          ? `${apiCalls} photos downloaded from Google API (costs money)`
          : "All photos served from local cache (no cost)",
    });
  } catch (error) {
    console.error("❌ Business photos API error:", error);

    // Emergency fallback - try to get any cached photos
    try {
      const { businessId } = req.params;
      const business = await businessService.getBusinessById(businessId);

      if (business?.photos) {
        const cachedPhotos = business.photos
          .filter((photo) => photo.base64)
          .slice(0, 3) // Max 3 emergency photos
          .map((photo, index) => ({
            id: photo.id || index + 1,
            caption: photo.caption || `Emergency Photo ${index + 1}`,
            base64: photo.base64,
            source: "emergency_cache",
            hasLocal: true,
            optimized: false,
          }));

        if (cachedPhotos.length > 0) {
          return res.json({
            businessId,
            businessName: business.name,
            photos: cachedPhotos,
            status: {
              total: business.photos.length,
              available: cachedPhotos.length,
              cached: cachedPhotos.length,
              percentage: 100,
            },
            source: "emergency_fallback",
            message: "Emergency fallback to cached photos due to system error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    } catch (fallbackError) {
      console.error("❌ Emergency fallback also failed:", fallbackError);
    }

    res.status(500).json({
      error: "Failed to get business photos",
      details: error instanceof Error ? error.message : "Unknown error",
      message: "Photo system temporarily unavailable. Please try again later.",
    });
  }
};

/**
 * Force refresh photos for a business (downloads from Google API)
 */
export const refreshBusinessPhotos: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { forceDownload = false } = req.body;

    if (!businessId) {
      return res.status(400).json({
        error: "Business ID is required",
      });
    }

    console.log(
      `🔄 Refreshing photos for business: ${businessId} (force: ${forceDownload})`,
    );

    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    if (!business.photos || business.photos.length === 0) {
      return res.json({
        message: "No photos to refresh for this business",
        businessId,
        businessName: business.name,
        refreshed: 0,
      });
    }

    // Get photo URLs that need refreshing
    const photoUrls = business.photos
      .filter((photo) => photo.url && (forceDownload || !photo.base64))
      .map((photo) => photo.url);

    if (photoUrls.length === 0) {
      return res.json({
        message: "All photos already cached locally",
        businessId,
        businessName: business.name,
        refreshed: 0,
        cached: business.photos.filter((p) => p.base64).length,
      });
    }

    // Download photos with enhanced fallback
    const downloadResult = await PhotoFallbackSystem.downloadBusinessPhotos(
      businessId,
      photoUrls,
      {
        retryAttempts: 3,
        retryDelay: 1000,
        fallbackToCache: false, // Force fresh download
        optimizeForMobile: false,
      },
    );

    console.log(
      `✅ Photo refresh complete: ${downloadResult.success} downloaded, ${downloadResult.failed} failed`,
    );

    res.json({
      message: "Photo refresh completed",
      businessId,
      businessName: business.name,
      refreshed: downloadResult.success,
      failed: downloadResult.failed,
      cached: downloadResult.cached,
      details: downloadResult.results,
      costImpact:
        downloadResult.success > 0 ? "API_COST_INCURRED" : "NO_API_COST",
    });
  } catch (error) {
    console.error("❌ Photo refresh error:", error);
    res.status(500).json({
      error: "Photo refresh failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get photo status for multiple businesses
 */
export const getPhotoStatusBatch: RequestHandler = async (req, res) => {
  try {
    const { businessIds } = req.body;

    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({
        error: "Business IDs array is required",
        message: "Please provide an array of business IDs",
      });
    }

    console.log(`📊 Getting photo status for ${businessIds.length} businesses`);

    const results = [];
    let totalPhotos = 0;
    let totalCached = 0;

    for (const businessId of businessIds) {
      try {
        const status = await PhotoFallbackSystem.getPhotoStatus(businessId);
        const business = await businessService.getBusinessById(businessId);

        results.push({
          businessId,
          businessName: business?.name || "Unknown",
          ...status,
        });

        totalPhotos += status.totalPhotos;
        totalCached += status.localPhotos;
      } catch (error) {
        results.push({
          businessId,
          businessName: "Error",
          totalPhotos: 0,
          localPhotos: 0,
          percentage: 0,
          needsDownload: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const overallPercentage =
      totalPhotos > 0 ? Math.round((totalCached / totalPhotos) * 100) : 0;

    res.json({
      summary: {
        totalBusinesses: businessIds.length,
        totalPhotos,
        totalCached,
        overallPercentage,
        needsWork: results.filter((r) => r.needsDownload).length,
      },
      results,
      message: `Photo status for ${businessIds.length} businesses retrieved`,
    });
  } catch (error) {
    console.error("❌ Batch photo status error:", error);
    res.status(500).json({
      error: "Failed to get photo status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
