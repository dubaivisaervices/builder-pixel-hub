import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fs from "fs";
import path from "path";

interface ImageRefreshProgress {
  businessId: string;
  businessName: string;
  status: "pending" | "processing" | "completed" | "failed";
  logoStatus: "pending" | "fetching" | "downloaded" | "failed" | "not_found";
  photosStatus: "pending" | "fetching" | "downloaded" | "failed" | "not_found";
  newLogoUrl?: string;
  newPhotoUrls: string[];
  errors: string[];
  processed: boolean;
}

interface RefreshStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  logosRefreshed: number;
  photosRefreshed: number;
  totalPhotosDownloaded: number;
  apiCallsUsed: number;
  startTime: number;
  estimatedTimeRemaining?: number;
}

// Global progress tracking
let currentRefreshProgress: Map<string, ImageRefreshProgress> = new Map();
let currentRefreshStats: RefreshStats | null = null;
let isRefreshing = false;

// Refresh all business images from Google API
export const refreshAllBusinessImages: RequestHandler = async (req, res) => {
  if (isRefreshing) {
    return res.status(409).json({
      success: false,
      error: "Image refresh already in progress",
      currentStats: currentRefreshStats,
    });
  }

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log("🔄 Starting Google API image refresh for all businesses");

    isRefreshing = true;
    currentRefreshProgress.clear();

    // Get all businesses from database
    const allBusinesses = await businessService.getAllBusinesses();
    console.log(
      `📊 Found ${allBusinesses.length} businesses to refresh images`,
    );

    // Initialize refresh stats
    currentRefreshStats = {
      total: allBusinesses.length,
      processed: 0,
      successful: 0,
      failed: 0,
      logosRefreshed: 0,
      photosRefreshed: 0,
      totalPhotosDownloaded: 0,
      apiCallsUsed: 0,
      startTime: Date.now(),
    };

    // Initialize progress tracking
    allBusinesses.forEach((business) => {
      currentRefreshProgress.set(business.id, {
        businessId: business.id,
        businessName: business.name,
        status: "pending",
        logoStatus: "pending",
        photosStatus: "pending",
        newPhotoUrls: [],
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

    // Start async processing
    processImageRefreshAsync(allBusinesses, apiKey);

    res.json({
      success: true,
      message: `Started Google API image refresh for ${allBusinesses.length} businesses`,
      refreshId: Date.now().toString(),
      stats: currentRefreshStats,
      estimatedDuration: `${Math.ceil(allBusinesses.length / 5)} minutes`, // ~5 businesses per minute due to API calls
    });
  } catch (error) {
    isRefreshing = false;
    console.error("❌ Image refresh error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start image refresh",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Async image refresh processing
async function processImageRefreshAsync(businesses: any[], apiKey: string) {
  const BATCH_SIZE = 5; // Process 5 businesses simultaneously to avoid API rate limits
  const MAX_RETRIES = 3;

  try {
    console.log(
      `🔥 Refreshing images for ${businesses.length} businesses in batches of ${BATCH_SIZE}`,
    );

    // Process businesses in parallel batches
    for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
      const batch = businesses.slice(i, i + BATCH_SIZE);
      console.log(
        `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(businesses.length / BATCH_SIZE)}`,
      );

      // Process batch in parallel
      const batchPromises = batch.map((business) =>
        refreshSingleBusinessImages(business, apiKey, MAX_RETRIES),
      );

      await Promise.allSettled(batchPromises);

      // Update stats
      if (currentRefreshStats) {
        currentRefreshStats.processed = i + batch.length;

        // Calculate success/failure counts
        let successful = 0;
        let failed = 0;
        currentRefreshProgress.forEach((progress) => {
          if (progress.processed) {
            if (progress.errors.length === 0) {
              successful++;
            } else {
              failed++;
            }
          }
        });

        currentRefreshStats.successful = successful;
        currentRefreshStats.failed = failed;

        // Calculate estimated time remaining
        const elapsed = Date.now() - currentRefreshStats.startTime;
        const rate = currentRefreshStats.processed / elapsed; // businesses per ms
        const remaining =
          currentRefreshStats.total - currentRefreshStats.processed;
        currentRefreshStats.estimatedTimeRemaining = Math.ceil(
          remaining / rate,
        );

        console.log(
          `📊 Refresh progress: ${currentRefreshStats.processed}/${currentRefreshStats.total} (${Math.round((currentRefreshStats.processed / currentRefreshStats.total) * 100)}%)`,
        );
      }

      // Delay between batches to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
    }

    console.log("🎉 Google API image refresh completed successfully!");
  } catch (error) {
    console.error("❌ Image refresh processing error:", error);
  } finally {
    isRefreshing = false;
  }
}

// Refresh images for a single business
async function refreshSingleBusinessImages(
  business: any,
  apiKey: string,
  maxRetries: number,
): Promise<void> {
  const progress = currentRefreshProgress.get(business.id);
  if (!progress) return;

  try {
    console.log(`🔄 Refreshing images for: ${business.name}`);
    progress.status = "processing";

    // Get business details from Google Places API using place_id
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=name,photos&key=${apiKey}`;

    console.log(`📡 Fetching Google Places details for ${business.name}`);
    const detailsResponse = await fetch(detailsUrl);
    if (currentRefreshStats) currentRefreshStats.apiCallsUsed++;

    if (!detailsResponse.ok) {
      throw new Error(`Google API error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    if (detailsData.status !== "OK" || !detailsData.result) {
      throw new Error(`Google API response: ${detailsData.status}`);
    }

    const details = detailsData.result;

    // Download logo (first photo)
    if (details.photos && details.photos.length > 0) {
      progress.logoStatus = "fetching";
      try {
        const logoRef = details.photos[0].photo_reference;
        const logoGoogleUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${logoRef}&maxwidth=400&key=${apiKey}`;

        console.log(`📥 Downloading logo for ${business.name}`);
        const logoUrl = await downloadImageToNetlify(
          logoGoogleUrl,
          `logos/logo-${business.id}.jpg`,
          maxRetries,
        );

        if (logoUrl) {
          progress.newLogoUrl = logoUrl;
          progress.logoStatus = "downloaded";
          if (currentRefreshStats) currentRefreshStats.logosRefreshed++;

          // Update business in database
          await businessService.updateBusinessLogo(business.id, logoUrl);
          console.log(`✅ Logo updated for ${business.name}: ${logoUrl}`);
        } else {
          progress.logoStatus = "failed";
          progress.errors.push("Logo download failed");
        }
      } catch (error) {
        progress.logoStatus = "failed";
        progress.errors.push(`Logo error: ${error.message}`);
      }
    } else {
      progress.logoStatus = "not_found";
      progress.errors.push("No photos available from Google");
    }

    // Download additional photos (up to 5)
    if (details.photos && details.photos.length > 1) {
      progress.photosStatus = "fetching";
      const photoPromises = details.photos
        .slice(1, 6) // Skip first photo (used as logo), take next 5
        .map(async (photo: any, index: number) => {
          try {
            const photoRef = photo.photo_reference;
            const photoGoogleUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=800&key=${apiKey}`;

            console.log(
              `📸 Downloading photo ${index + 1} for ${business.name}`,
            );
            const netlifyUrl = await downloadImageToNetlify(
              photoGoogleUrl,
              `photos/photo_${index + 1}-${business.id}.jpg`,
              maxRetries,
            );

            if (netlifyUrl) {
              progress.newPhotoUrls.push(netlifyUrl);
              if (currentRefreshStats)
                currentRefreshStats.totalPhotosDownloaded++;
              console.log(
                `✅ Photo ${index + 1} downloaded for ${business.name}`,
              );
              return netlifyUrl;
            }
            return null;
          } catch (error) {
            progress.errors.push(`Photo ${index + 1} error: ${error.message}`);
            return null;
          }
        });

      const photoResults = await Promise.allSettled(photoPromises);
      const successfulPhotos = photoResults
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as any).value);

      if (successfulPhotos.length > 0) {
        progress.photosStatus = "downloaded";
        if (currentRefreshStats) currentRefreshStats.photosRefreshed++;

        // Update business photos in database
        await businessService.updateBusinessPhotos(
          business.id,
          progress.newPhotoUrls,
        );
        console.log(
          `✅ ${successfulPhotos.length} photos updated for ${business.name}`,
        );
      } else {
        progress.photosStatus = "failed";
        progress.errors.push("All photo downloads failed");
      }
    } else {
      progress.photosStatus = "not_found";
    }

    progress.status = "completed";
    progress.processed = true;
    console.log(
      `✅ Image refresh completed for ${business.name} (Logo: ${progress.logoStatus}, Photos: ${progress.photosStatus})`,
    );
  } catch (error) {
    progress.status = "failed";
    progress.logoStatus = "failed";
    progress.photosStatus = "failed";
    progress.errors.push(`Processing error: ${error.message}`);
    progress.processed = true;
    console.error(`❌ Failed to refresh images for ${business.name}:`, error);
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
      if (imageBuffer.length < 1000) {
        throw new Error("Image too small or corrupted");
      }

      // Save to Netlify public directory
      const filePath = path.join(
        process.cwd(),
        "public",
        "business-images",
        filename,
      );
      await fs.promises.writeFile(filePath, imageBuffer);

      return `/business-images/${filename}`;
    } catch (error) {
      console.warn(
        `⚠️ Download attempt ${attempt}/${maxRetries} failed for ${filename}: ${error.message}`,
      );

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  return null;
}

// Ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as any).code !== "EEXIST") {
      throw error;
    }
  }
}

// Get refresh progress
export const getImageRefreshProgress: RequestHandler = async (req, res) => {
  try {
    const progressArray = Array.from(currentRefreshProgress.values());

    res.json({
      success: true,
      isRefreshing,
      stats: currentRefreshStats,
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
      error: "Failed to get refresh progress",
    });
  }
};

// Stop refresh process
export const stopImageRefresh: RequestHandler = async (req, res) => {
  try {
    isRefreshing = false;

    res.json({
      success: true,
      message: "Image refresh process stopped",
      stats: currentRefreshStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to stop refresh",
    });
  }
};

// Get refresh results
export const getImageRefreshResults: RequestHandler = async (req, res) => {
  try {
    const progressArray = Array.from(currentRefreshProgress.values());
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
        stats: currentRefreshStats,
        successfulBusinesses: successful.slice(0, 50),
        failedBusinesses: failed.slice(0, 50),
        isComplete: !isRefreshing && progressArray.every((p) => p.processed),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get refresh results",
    });
  }
};
