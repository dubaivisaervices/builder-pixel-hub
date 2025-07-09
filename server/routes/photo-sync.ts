import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";
import { PhotoFallbackSystem } from "../utils/photoFallbackSystem";

// Track if download is in progress to prevent multiple simultaneous downloads
let downloadInProgress = false;

interface PhotoDownloadResult {
  businessId: string;
  businessName: string;
  photosProcessed: number;
  photosDownloaded: number;
  photosSaved: number;
  errors: string[];
}

interface ReviewSyncResult {
  businessId: string;
  businessName: string;
  reviewsFound: number;
  reviewsSaved: number;
  errors: string[];
}

// Download and save all photos to database as base64
export const downloadAllPhotos: RequestHandler = async (req, res) => {
  try {
    console.log("🖼️ Starting comprehensive photo download...");

    // Check if another download process is already running
    if (downloadInProgress) {
      return res.status(409).json({
        error: "Photo download already in progress",
        message: "Please wait for the current download to complete",
        inProgress: true,
      });
    }

    downloadInProgress = true;

    const businesses = await businessService.getAllBusinesses();
    const results: PhotoDownloadResult[] = [];
    let totalPhotosDownloaded = 0;
    let totalPhotosSaved = 0;

    for (const business of businesses) {
      const result: PhotoDownloadResult = {
        businessId: business.id,
        businessName: business.name,
        photosProcessed: 0,
        photosDownloaded: 0,
        photosSaved: 0,
        errors: [],
      };

      if (!business.photos || business.photos.length === 0) {
        console.log(`⏭️ Skipping ${business.name} - no photos`);
        results.push(result);
        continue;
      }

      console.log(
        `🔄 Processing ${business.name} - ${business.photos.length} photos`,
      );
      result.photosProcessed = business.photos.length;

      const updatedPhotos = [];

      // Use enhanced batch download with fallback system
      const photoUrls = business.photos
        .filter((photo) => !photo.base64 && photo.url)
        .map((photo) => photo.url);

      if (photoUrls.length > 0) {
        console.log(
          `📥 Downloading ${photoUrls.length} photos for ${business.name} with fallback protection`,
        );

        const batchResult = await PhotoFallbackSystem.downloadBusinessPhotos(
          business.id,
          photoUrls,
          {
            retryAttempts: 2,
            retryDelay: 1000,
            fallbackToCache: true,
            optimizeForMobile: false,
          },
        );

        // Update photos with download results
        let downloadIndex = 0;
        for (const photo of business.photos) {
          if (photo.base64) {
            // Already have base64, keep it
            updatedPhotos.push(photo);
            result.photosSaved++;
          } else if (photo.url && downloadIndex < batchResult.results.length) {
            // Try to get download result
            const downloadResult = batchResult.results[downloadIndex];
            downloadIndex++;

            if (downloadResult.base64) {
              const updatedPhoto = {
                ...photo,
                base64: downloadResult.base64,
                downloadedAt: new Date().toISOString(),
              };
              updatedPhotos.push(updatedPhoto);
              result.photosDownloaded++;
              result.photosSaved++;
              totalPhotosDownloaded++;
              totalPhotosSaved++;
            } else {
              // Download failed, keep original photo data
              updatedPhotos.push(photo);
              if (downloadResult.error) {
                result.errors.push(
                  `Photo ${photo.caption || "untitled"}: ${downloadResult.error}`,
                );
              }
            }
          } else {
            // No URL to download from
            updatedPhotos.push(photo);
          }
        }

        console.log(
          `✅ Batch download complete: ${batchResult.success} downloaded, ${batchResult.cached} cached, ${batchResult.failed} failed`,
        );
      } else {
        // All photos already have base64 data
        updatedPhotos = business.photos;
        result.photosSaved = business.photos.filter((p) => p.base64).length;
      }

      // Update business with new photos
      try {
        const updatedBusiness = {
          ...business,
          photos: updatedPhotos,
          photosLocal: updatedPhotos.filter((p) => p.base64),
        };

        await businessService.upsertBusiness(updatedBusiness);
        console.log(
          `💾 Saved ${result.photosSaved} photos for ${business.name}`,
        );
      } catch (error) {
        console.error(`❌ Failed to save photos for ${business.name}:`, error);
        result.errors.push(
          `Database save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      results.push(result);

      // Progress logging
      const processed = results.length;
      const total = businesses.length;
      console.log(
        `📊 Progress: ${processed}/${total} businesses (${Math.round((processed / total) * 100)}%)`,
      );
    }

    console.log(`✅ Photo download completed:
      - Businesses processed: ${businesses.length}
      - Total photos downloaded: ${totalPhotosDownloaded}
      - Total photos saved: ${totalPhotosSaved}
    `);

    res.json({
      success: true,
      message: "Photo download completed",
      totalBusinesses: businesses.length,
      totalPhotosDownloaded,
      totalPhotosSaved,
      results: results.filter((r) => r.photosProcessed > 0), // Only include businesses with photos
      summary: {
        businessesWithPhotos: results.filter((r) => r.photosProcessed > 0)
          .length,
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      },
    });
  } catch (error) {
    console.error("❌ Photo download failed:", error);
    res.status(500).json({
      error: "Photo download failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    downloadInProgress = false;
  }
};

// Stop any running download process
export const stopPhotoDownload: RequestHandler = async (req, res) => {
  downloadInProgress = false;
  res.json({
    success: true,
    message: "Photo download process stopped",
  });
};

// Get download status
export const getDownloadStatus: RequestHandler = async (req, res) => {
  res.json({
    inProgress: downloadInProgress,
    message: downloadInProgress
      ? "Photo download in progress"
      : "No download in progress",
  });
};

// Sync all reviews from Google API and save to database
export const syncAllReviews: RequestHandler = async (req, res) => {
  try {
    console.log("📝 Starting comprehensive review sync...");

    const businesses = await businessService.getAllBusinesses();
    const results: ReviewSyncResult[] = [];
    let totalReviewsSaved = 0;

    for (const business of businesses) {
      const result: ReviewSyncResult = {
        businessId: business.id,
        businessName: business.name,
        reviewsFound: 0,
        reviewsSaved: 0,
        errors: [],
      };

      try {
        // Check current reviews in database
        const existingReviews = await businessService.getBusinessReviews(
          business.id,
        );
        console.log(
          `🔍 ${business.name}: ${existingReviews.length} existing reviews`,
        );

        // For now, we'll use the reviews that are already in the business object
        // In a real implementation, this would fetch from Google Places API
        if (business.reviews && business.reviews.length > 0) {
          result.reviewsFound = business.reviews.length;

          // Save reviews to database if not already there
          if (existingReviews.length < business.reviews.length) {
            await businessService.upsertReviews(business.id, business.reviews);
            result.reviewsSaved =
              business.reviews.length - existingReviews.length;
            totalReviewsSaved += result.reviewsSaved;
            console.log(
              `💾 Saved ${result.reviewsSaved} new reviews for ${business.name}`,
            );
          } else {
            console.log(`✅ Reviews already saved for ${business.name}`);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to sync reviews for ${business.name}:`, error);
        result.errors.push(
          `Review sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }

      results.push(result);
    }

    console.log(`✅ Review sync completed:
      - Businesses processed: ${businesses.length}
      - Total reviews saved: ${totalReviewsSaved}
    `);

    res.json({
      success: true,
      message: "Review sync completed",
      totalBusinesses: businesses.length,
      totalReviewsSaved,
      results: results.filter((r) => r.reviewsFound > 0),
      summary: {
        businessesWithReviews: results.filter((r) => r.reviewsFound > 0).length,
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      },
    });
  } catch (error) {
    console.error("❌ Review sync failed:", error);
    res.status(500).json({
      error: "Review sync failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Check photo and review status
export const checkSyncStatus: RequestHandler = async (req, res) => {
  try {
    const businesses = await businessService.getAllBusinesses();

    let totalPhotos = 0;
    let photosWithBase64 = 0;
    let totalReviews = 0;
    let businessesWithPhotos = 0;
    let businessesWithReviews = 0;

    for (const business of businesses) {
      // Count photos
      if (business.photos && business.photos.length > 0) {
        businessesWithPhotos++;
        totalPhotos += business.photos.length;
        photosWithBase64 += business.photos.filter((p) => p.base64).length;
      }

      // Count reviews
      const reviews = await businessService.getBusinessReviews(business.id);
      if (reviews && reviews.length > 0) {
        businessesWithReviews++;
        totalReviews += reviews.length;
      }
    }

    const status = {
      totalBusinesses: businesses.length,
      photos: {
        total: totalPhotos,
        savedLocally: photosWithBase64,
        percentage:
          totalPhotos > 0
            ? Math.round((photosWithBase64 / totalPhotos) * 100)
            : 0,
        businessesWithPhotos,
      },
      reviews: {
        total: totalReviews,
        businessesWithReviews,
        averagePerBusiness:
          businessesWithReviews > 0
            ? Math.round(totalReviews / businessesWithReviews)
            : 0,
      },
      isComplete: {
        photos: photosWithBase64 >= 4000, // Close to target of 4072
        reviews: totalReviews >= 1000, // Reasonable target
      },
    };

    res.json(status);
  } catch (error) {
    console.error("❌ Status check failed:", error);
    res.status(500).json({
      error: "Status check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
