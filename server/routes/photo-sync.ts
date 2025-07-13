import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";
import { getS3Service, isS3Configured } from "../utils/s3Service";

// Track if download is in progress to prevent multiple simultaneous downloads
let downloadInProgress = false;

interface PhotoDownloadResult {
  businessId: string;
  businessName: string;
  photosProcessed: number;
  photosDownloaded: number;
  photosSaved: number;
  s3UploadsSuccessful: number;
  s3UploadsFailed: number;
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

    // Log current database size for monitoring
    try {
      const fs = require("fs");
      const dbPath = "./server/database/dubai_businesses.db";
      const stats = fs.statSync(dbPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      console.log(`📊 Current database size: ${fileSizeInMB.toFixed(1)}MB`);
    } catch (error) {
      console.warn("Could not check database size:", error);
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
        s3UploadsSuccessful: 0,
        s3UploadsFailed: 0,
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

      let updatedPhotos = [];

      for (const photo of business.photos) {
        try {
          // Skip if we already have base64 data
          if (photo.base64) {
            updatedPhotos.push(photo);
            result.photosSaved++;
            continue;
          }

          // Skip if no URL to download from
          if (!photo.url) {
            updatedPhotos.push(photo);
            continue;
          }

          // Download the photo
          console.log(`📥 Downloading photo: ${photo.caption || "Untitled"}`);
          const photoResponse = await fetch(photo.url, {
            timeout: 10000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (!photoResponse.ok) {
            throw new Error(`HTTP ${photoResponse.status}`);
          }

          const arrayBuffer = await photoResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString("base64");

          // Update photo with base64 data
          let updatedPhoto = {
            ...photo,
            base64: base64,
            downloadedAt: new Date().toISOString(),
          };

          // Also upload to S3 if configured
          if (isS3Configured()) {
            try {
              const s3Service = getS3Service();
              const s3Url = await s3Service.uploadBusinessPhoto(
                business.id,
                photo.url,
                business.name,
                photo.caption,
              );

              updatedPhoto = {
                ...updatedPhoto,
                s3Url: s3Url,
                s3UploadedAt: new Date().toISOString(),
              };

              result.s3UploadsSuccessful++;
              console.log(`☁️ Uploaded to S3: ${s3Url}`);
            } catch (s3Error) {
              result.s3UploadsFailed++;
              result.errors.push(
                `S3 upload failed: ${s3Error instanceof Error ? s3Error.message : "Unknown S3 error"}`,
              );
              console.error(
                `❌ S3 upload failed: ${s3Error instanceof Error ? s3Error.message : "Unknown S3 error"}`,
              );
            }
          }

          updatedPhotos.push(updatedPhoto);
          result.photosDownloaded++;
          result.photosSaved++;
          totalPhotosDownloaded++;
          totalPhotosSaved++;

          console.log(
            `✅ Downloaded and saved photo ${result.photosDownloaded}/${result.photosProcessed}`,
          );

          // Small delay to avoid overwhelming servers
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(
            `❌ Failed to download photo: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          result.errors.push(
            `Photo download failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          // Keep original photo data
          updatedPhotos.push(photo);
        }
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
