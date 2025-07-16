import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

interface UploadProgress {
  businessId: string;
  businessName: string;
  logoStatus: "pending" | "downloading" | "success" | "failed";
  photosStatus: "pending" | "downloading" | "success" | "failed";
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
  processed: boolean;
}

interface BatchUploadStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  logosDownloaded: number;
  photosDownloaded: number;
  totalSize: number;
  startTime: number;
  estimatedTimeRemaining?: number;
}

// Global progress tracking
let currentUploadProgress: Map<string, UploadProgress> = new Map();
let currentBatchStats: BatchUploadStats | null = null;
let isUploading = false;

// Super fast parallel upload with concurrency control
export const superFastNetlifyUpload: RequestHandler = async (req, res) => {
  if (isUploading) {
    return res.status(409).json({
      success: false,
      error: "Upload already in progress",
      currentStats: currentBatchStats,
    });
  }

  try {
    console.log("🚀 Starting super fast Netlify upload for all 841 businesses");

    isUploading = true;
    currentUploadProgress.clear();

    // Get all businesses from database
    const allBusinesses = await businessService.getAllBusinesses();
    console.log(`📊 Found ${allBusinesses.length} businesses to process`);

    // Initialize batch stats
    currentBatchStats = {
      total: allBusinesses.length,
      processed: 0,
      successful: 0,
      failed: 0,
      logosDownloaded: 0,
      photosDownloaded: 0,
      totalSize: 0,
      startTime: Date.now(),
    };

    // Initialize progress tracking
    allBusinesses.forEach((business) => {
      currentUploadProgress.set(business.id, {
        businessId: business.id,
        businessName: business.name,
        logoStatus: "pending",
        photosStatus: "pending",
        photoUrls: [],
        errors: [],
        processed: false,
      });
    });

    // Create Netlify directories
    const netlifyDir = path.join(process.cwd(), "public", "business-images");
    const logoDir = path.join(netlifyDir, "logos");
    const photoDir = path.join(netlifyDir, "photos");

    await ensureDirectoryExists(netlifyDir);
    await ensureDirectoryExists(logoDir);
    await ensureDirectoryExists(photoDir);

    // Start async processing (don't wait for completion)
    processBatchUploadAsync(allBusinesses);

    res.json({
      success: true,
      message: `Started super fast upload for ${allBusinesses.length} businesses`,
      batchId: Date.now().toString(),
      stats: currentBatchStats,
      estimatedDuration: `${Math.ceil(allBusinesses.length / 10)} minutes`, // ~10 businesses per minute
    });
  } catch (error) {
    isUploading = false;
    console.error("❌ Super fast upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start super fast upload",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Async batch processing with parallel workers
async function processBatchUploadAsync(businesses: any[]) {
  const BATCH_SIZE = 20; // Process 20 businesses simultaneously
  const MAX_RETRIES = 3;

  try {
    console.log(
      `🔥 Processing ${businesses.length} businesses in batches of ${BATCH_SIZE}`,
    );

    // Process businesses in parallel batches
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      const batch = businesses.slice(i, i + BATCH_SIZE);
      console.log(
        `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(businesses.length / BATCH_SIZE)}`,
      );

      // Process batch in parallel
      const batchPromises = batch.map((business) =>
        processSingleBusiness(business, MAX_RETRIES),
      );

      await Promise.allSettled(batchPromises);

      // Update batch stats
      if (currentBatchStats) {
        currentBatchStats.processed = i + batch.length;

        // Calculate success/failure counts
        let successful = 0;
        let failed = 0;
        currentUploadProgress.forEach((progress) => {
          if (progress.processed) {
            if (progress.errors.length === 0) {
              successful++;
            } else {
              failed++;
            }
          }
        });

        currentBatchStats.successful = successful;
        currentBatchStats.failed = failed;

        // Calculate estimated time remaining
        const elapsed = Date.now() - currentBatchStats.startTime;
        const rate = currentBatchStats.processed / elapsed; // businesses per ms
        const remaining = currentBatchStats.total - currentBatchStats.processed;
        currentBatchStats.estimatedTimeRemaining = Math.ceil(remaining / rate);

        console.log(
          `📊 Batch progress: ${currentBatchStats.processed}/${currentBatchStats.total} (${Math.round((currentBatchStats.processed / currentBatchStats.total) * 100)}%)`,
        );
      }

      // Small delay between batches to avoid overwhelming the servers
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("🎉 Super fast upload completed successfully!");
  } catch (error) {
    console.error("❌ Batch processing error:", error);
  } finally {
    isUploading = false;
  }
}

// Process a single business with logo and photos
async function processSingleBusiness(
  business: any,
  maxRetries: number,
): Promise<void> {
  const progress = currentUploadProgress.get(business.id);
  if (!progress) return;

  try {
    console.log(`🏢 Processing: ${business.name}`);

    // Download logo
    if (business.logoUrl) {
      progress.logoStatus = "downloading";

      // Check if it's already a Netlify URL
      if (business.logoUrl.includes("/business-images/")) {
        console.log(
          `✅ Logo already on Netlify for ${business.name}: ${business.logoUrl}`,
        );
        progress.logoUrl = business.logoUrl;
        progress.logoStatus = "success";
        progress.errors.push("Logo already on Netlify (skipped download)");
        if (currentBatchStats) currentBatchStats.logosDownloaded++;
      } else {
        try {
          console.log(
            `📥 Downloading logo for ${business.name}: ${business.logoUrl}`,
          );
          const logoUrl = await downloadImageToNetlify(
            business.logoUrl,
            `logos/logo-${business.id}.jpg`,
            maxRetries,
          );
          if (logoUrl) {
            progress.logoUrl = logoUrl;
            progress.logoStatus = "success";
            if (currentBatchStats) currentBatchStats.logosDownloaded++;
            console.log(`✅ Logo downloaded for ${business.name}: ${logoUrl}`);
          } else {
            progress.logoStatus = "failed";
            progress.errors.push("Logo download failed");
          }
        } catch (error) {
          progress.logoStatus = "failed";
          progress.errors.push(`Logo error: ${error.message}`);
        }
      }
    } else {
      progress.logoStatus = "success"; // No logo to download
    }

    // Download photos (up to 5)
    console.log(`📸 Checking photos for ${business.name}:`, {
      hasPhotos: !!business.photos,
      photosLength: business.photos?.length || 0,
      photosType: typeof business.photos,
      firstPhotoSample: business.photos?.[0],
    });

    if (business.photos && business.photos.length > 0) {
      progress.photosStatus = "downloading";
      console.log(
        `📥 Starting download of ${business.photos.length} photos for ${business.name}`,
      );

      const photoPromises = business.photos
        .slice(0, 5)
        .map(async (photo: any, index: number) => {
          try {
            // Handle different photo formats - sometimes it's a string, sometimes an object
            let photoUrl: string;
            if (typeof photo === "string") {
              photoUrl = photo;
            } else if (photo && typeof photo === "object") {
              photoUrl = photo.url || photo.src || photo.photoUrl || "";
            } else {
              console.warn(
                `⚠️ Invalid photo format for ${business.name} photo ${index + 1}:`,
                photo,
              );
              return null;
            }

            if (!photoUrl) {
              console.warn(
                `⚠️ No photo URL found for ${business.name} photo ${index + 1}`,
              );
              return null;
            }

            // Check if it's already a Netlify URL
            if (photoUrl.includes("/business-images/")) {
              console.log(
                `📁 Photo ${index + 1} already on Netlify for ${business.name}: ${photoUrl}`,
              );
              progress.photoUrls.push(photoUrl);
              if (currentBatchStats) currentBatchStats.photosDownloaded++;
              return photoUrl;
            } else {
              console.log(
                `📸 Downloading photo ${index + 1} for ${business.name}: ${photoUrl}`,
              );

              const netlifyUrl = await downloadImageToNetlify(
                photoUrl,
                `photos/photo_${index + 1}-${business.id}.jpg`,
                maxRetries,
              );
              if (netlifyUrl) {
                progress.photoUrls.push(netlifyUrl);
                if (currentBatchStats) currentBatchStats.photosDownloaded++;
                console.log(
                  `✅ Successfully downloaded photo ${index + 1} for ${business.name}`,
                );
                return netlifyUrl;
              }
              return null;
            }
          } catch (error) {
            console.error(
              `❌ Photo ${index + 1} error for ${business.name}:`,
              error,
            );
            progress.errors.push(`Photo ${index + 1} error: ${error.message}`);
            return null;
          }
        });

      const photoResults = await Promise.allSettled(photoPromises);
      const successfulPhotos = photoResults
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as any).value);

      console.log(
        `📊 Photo processing complete for ${business.name}: ${successfulPhotos.length}/${business.photos.length} successful`,
      );

      if (successfulPhotos.length > 0) {
        progress.photosStatus = "success";
        console.log(
          `✅ Photos successful for ${business.name}: ${successfulPhotos.length} photos downloaded`,
        );
      } else {
        progress.photosStatus = "failed";
        progress.errors.push("All photo downloads failed");
        console.error(`❌ All photo downloads failed for ${business.name}`);
      }
    } else {
      progress.photosStatus = "success"; // No photos to download
    }

    // Update business in database with new Netlify URLs
    try {
      if (progress.logoUrl) {
        await businessService.updateBusinessLogo(business.id, progress.logoUrl);
      }
      if (progress.photoUrls.length > 0) {
        await businessService.updateBusinessPhotos(
          business.id,
          progress.photoUrls,
        );
      }
    } catch (error) {
      progress.errors.push(`Database update error: ${error.message}`);
    }

    progress.processed = true;
    console.log(
      `✅ Completed: ${business.name} (Logo: ${progress.logoStatus}, Photos: ${progress.photosStatus})`,
    );
  } catch (error) {
    progress.logoStatus = "failed";
    progress.photosStatus = "failed";
    progress.errors.push(`Processing error: ${error.message}`);
    progress.processed = true;
    console.error(`❌ Failed to process ${business.name}:`, error);
  }
}

// Download image with retry logic
async function downloadImageToNetlify(
  imageUrl: string,
  filename: string,
  maxRetries: number,
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(buffer);

      // Validate image size
      if (imageBuffer.length < 500) {
        throw new Error("Image too small or corrupted");
      }

      // Save to Netlify public directory
      const filePath = path.join(
        process.cwd(),
        "public",
        "business-images",
        filename,
      );
      await writeFile(filePath, imageBuffer);

      if (currentBatchStats) {
        currentBatchStats.totalSize += imageBuffer.length;
      }

      return `/business-images/${filename}`;
    } catch (error) {
      console.warn(
        `⚠️ Download attempt ${attempt}/${maxRetries} failed for ${filename}: ${error.message}`,
      );

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  return null;
}

// Ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as any).code !== "EEXIST") {
      throw error;
    }
  }
}

// Get upload progress
export const getNetlifyUploadProgress: RequestHandler = async (req, res) => {
  try {
    const progressArray = Array.from(currentUploadProgress.values());

    res.json({
      success: true,
      isUploading,
      stats: currentBatchStats,
      progress: progressArray.slice(0, 100), // Return first 100 for performance
      summary: {
        total: progressArray.length,
        pending: progressArray.filter((p) => !p.processed).length,
        successful: progressArray.filter(
          (p) => p.processed && p.errors.length === 0,
        ).length,
        failed: progressArray.filter((p) => p.processed && p.errors.length > 0)
          .length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get progress",
    });
  }
};

// Stop upload process
export const stopNetlifyUpload: RequestHandler = async (req, res) => {
  try {
    isUploading = false;

    res.json({
      success: true,
      message: "Upload process stopped",
      stats: currentBatchStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to stop upload",
    });
  }
};

// Get detailed results
export const getNetlifyUploadResults: RequestHandler = async (req, res) => {
  try {
    const progressArray = Array.from(currentUploadProgress.values());
    const successful = progressArray.filter(
      (p) => p.processed && p.errors.length === 0,
    );
    const failed = progressArray.filter(
      (p) => p.processed && p.errors.length > 0,
    );

    res.json({
      success: true,
      results: {
        total: progressArray.length,
        successful: successful.length,
        failed: failed.length,
        stats: currentBatchStats,
        successfulBusinesses: successful.slice(0, 50), // First 50 successful
        failedBusinesses: failed.slice(0, 50), // First 50 failed
        isComplete: !isUploading && progressArray.every((p) => p.processed),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get results",
    });
  }
};

// Clear progress data
export const clearNetlifyUploadData: RequestHandler = async (req, res) => {
  try {
    if (isUploading) {
      return res.status(409).json({
        success: false,
        error: "Cannot clear data while upload is in progress",
      });
    }

    currentUploadProgress.clear();
    currentBatchStats = null;

    res.json({
      success: true,
      message: "Progress data cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear data",
    });
  }
};
