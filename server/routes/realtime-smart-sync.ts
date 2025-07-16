import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { getS3Service, isS3Configured } from "../utils/s3Service";
import { EventEmitter } from "events";

interface SmartSyncProgress {
  isRunning: boolean;
  totalBusinesses: number;
  processedBusinesses: number;
  currentBusiness: string;
  logosUploaded: number;
  photosUploaded: number;
  base64Uploads: number;
  urlUploads: number;
  skippedUrls: number;
  errors: string[];
  startTime: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  uploadSpeed: number;
}

// Global progress tracker
let currentProgress: SmartSyncProgress = {
  isRunning: false,
  totalBusinesses: 0,
  processedBusinesses: 0,
  currentBusiness: "",
  logosUploaded: 0,
  photosUploaded: 0,
  base64Uploads: 0,
  urlUploads: 0,
  skippedUrls: 0,
  errors: [],
  startTime: 0,
  elapsedTime: 0,
  estimatedTimeRemaining: 0,
  uploadSpeed: 0,
};

// Event emitter for real-time updates
const progressEmitter = new EventEmitter();

export const startRealtimeSmartSync: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    if (currentProgress.isRunning) {
      return res.status(409).json({
        error: "Smart Sync already in progress",
        progress: currentProgress,
      });
    }

    console.log("🧠 Starting REAL-TIME Smart S3 sync...");

    // Initialize progress
    currentProgress = {
      isRunning: true,
      totalBusinesses: 0,
      processedBusinesses: 0,
      currentBusiness: "Initializing...",
      logosUploaded: 0,
      photosUploaded: 0,
      base64Uploads: 0,
      urlUploads: 0,
      skippedUrls: 0,
      errors: [],
      startTime: Date.now(),
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      uploadSpeed: 0,
    };

    // Start the sync process in background
    setImmediate(async () => {
      try {
        await executeSmartSyncWithProgress();
      } catch (error) {
        console.error("Smart sync error:", error);
        currentProgress.isRunning = false;
        currentProgress.errors.push(
          `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        progressEmitter.emit("error", error);
      }
    });

    res.json({
      success: true,
      message: "Real-time Smart S3 sync started",
      progress: currentProgress,
    });
  } catch (error) {
    console.error("Error starting real-time smart sync:", error);
    res.status(500).json({
      error: "Failed to start real-time smart sync",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

async function executeSmartSyncWithProgress(): Promise<void> {
  const s3Service = getS3Service();
  const batchSize = 50; // Smaller batches for more frequent updates
  let offset = 0;

  // First, get total count
  const totalBusinesses = await businessService.getBusinessCount();
  currentProgress.totalBusinesses = totalBusinesses;
  currentProgress.currentBusiness = `Found ${totalBusinesses} businesses to process`;
  emitProgress();

  while (true) {
    const businesses = await businessService.getBusinessesPaginated(
      offset,
      batchSize,
    );
    if (businesses.length === 0) break;

    for (const business of businesses) {
      try {
        currentProgress.currentBusiness = `Processing: ${business.name}`;
        emitProgress();

        let businessUpdated = false;
        const updates: any = { ...business };

        // Handle logo
        if (business.logo_base64 && !business.logoS3Url) {
          try {
            const logoBuffer = Buffer.from(business.logo_base64, "base64");
            const logoS3Url = await s3Service.uploadBuffer(
              logoBuffer,
              `businesses/${business.id}/logo-${Date.now()}.jpg`,
              "image/jpeg",
              {
                businessId: business.id,
                businessName: business.name,
                imageType: "logo",
                source: "base64",
              },
            );

            updates.logoS3Url = logoS3Url;
            currentProgress.logosUploaded++;
            currentProgress.base64Uploads++;
            businessUpdated = true;
            console.log(`✅ Logo uploaded (base64): ${business.name}`);
          } catch (error) {
            currentProgress.errors.push(
              `Logo base64 upload failed for ${business.name}: ${error}`,
            );
          }
        } else if (business.logoUrl && !business.logoS3Url) {
          if (isValidImageUrl(business.logoUrl)) {
            try {
              const logoS3Url = await s3Service.uploadBusinessLogo(
                business.id,
                business.logoUrl,
                business.name,
              );

              updates.logoS3Url = logoS3Url;
              currentProgress.logosUploaded++;
              currentProgress.urlUploads++;
              businessUpdated = true;
              console.log(`✅ Logo uploaded (URL): ${business.name}`);
            } catch (error) {
              currentProgress.skippedUrls++;
              console.log(
                `⏭️ Skipped logo URL for ${business.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
            }
          } else {
            currentProgress.skippedUrls++;
          }
        }

        // Handle photos with progress updates
        if (business.photos && Array.isArray(business.photos)) {
          const updatedPhotos = [];

          for (let i = 0; i < business.photos.length; i++) {
            const photo = business.photos[i];
            currentProgress.currentBusiness = `Processing: ${business.name} (Photo ${i + 1}/${business.photos.length})`;
            emitProgress();

            let photoUpdated = false;

            // Try base64 first
            if (photo.base64 && !photo.s3Url) {
              try {
                const photoBuffer = Buffer.from(photo.base64, "base64");
                const photoS3Url = await s3Service.uploadBuffer(
                  photoBuffer,
                  `businesses/${business.id}/photos/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`,
                  "image/jpeg",
                  {
                    businessId: business.id,
                    businessName: business.name,
                    imageType: "photo",
                    source: "base64",
                    caption: photo.caption || "",
                  },
                );

                updatedPhotos.push({
                  ...photo,
                  s3Url: photoS3Url,
                  s3UploadedAt: new Date().toISOString(),
                });

                currentProgress.photosUploaded++;
                currentProgress.base64Uploads++;
                businessUpdated = true;
                photoUpdated = true;
              } catch (error) {
                currentProgress.errors.push(
                  `Photo base64 upload failed for ${business.name}: ${error}`,
                );
              }
            }

            // Try URL if no base64 success
            if (
              !photoUpdated &&
              photo.url &&
              !photo.s3Url &&
              isValidImageUrl(photo.url)
            ) {
              try {
                const photoS3Url = await s3Service.uploadBusinessPhoto(
                  business.id,
                  photo.url,
                  business.name,
                  photo.caption,
                );

                updatedPhotos.push({
                  ...photo,
                  s3Url: photoS3Url,
                  s3UploadedAt: new Date().toISOString(),
                });

                currentProgress.photosUploaded++;
                currentProgress.urlUploads++;
                businessUpdated = true;
              } catch (error) {
                currentProgress.skippedUrls++;
                updatedPhotos.push(photo);
              }
            } else if (!photoUpdated) {
              updatedPhotos.push(photo);
              if (photo.url && !isValidImageUrl(photo.url)) {
                currentProgress.skippedUrls++;
              }
            }

            // Update progress after each photo
            emitProgress();
          }

          if (updatedPhotos.length > 0) {
            updates.photos = updatedPhotos;
          }
        }

        // Update business if changes were made
        if (businessUpdated) {
          await businessService.updateBusiness(business.id, updates);
        }

        currentProgress.processedBusinesses++;
        updateCalculatedFields();
        emitProgress();

        // Small delay to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        currentProgress.errors.push(
          `Business processing failed for ${business.name}: ${error}`,
        );
        currentProgress.processedBusinesses++;
        updateCalculatedFields();
        emitProgress();
      }
    }

    offset += batchSize;
  }

  // Mark as completed
  currentProgress.isRunning = false;
  currentProgress.currentBusiness = "Completed!";
  updateCalculatedFields();
  emitProgress();

  console.log("🧠 Real-time Smart S3 sync completed!");
  progressEmitter.emit("complete", currentProgress);
}

function updateCalculatedFields(): void {
  const now = Date.now();
  currentProgress.elapsedTime = (now - currentProgress.startTime) / 1000;

  if (currentProgress.elapsedTime > 0) {
    currentProgress.uploadSpeed =
      currentProgress.processedBusinesses / currentProgress.elapsedTime;

    const remaining =
      currentProgress.totalBusinesses - currentProgress.processedBusinesses;
    if (currentProgress.uploadSpeed > 0) {
      currentProgress.estimatedTimeRemaining =
        remaining / currentProgress.uploadSpeed;
    }
  }
}

function emitProgress(): void {
  progressEmitter.emit("progress", currentProgress);
}

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("data:")) return false;
  if (url.length > 2000) return false;

  try {
    new URL(url);
  } catch {
    return false;
  }

  const imagePatterns = [
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i,
    /googleusercontent\.com/,
    /maps\.googleapis\.com/,
    /lh\d+\.googleusercontent\.com/,
  ];

  return imagePatterns.some((pattern) => pattern.test(url));
}

export const getRealtimeSmartSyncProgress: RequestHandler = (req, res) => {
  try {
    res.json(currentProgress);
  } catch (error) {
    console.error("Error getting real-time progress:", error);
    res.status(500).json({
      error: "Failed to get progress",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const realtimeSmartSyncSSE: RequestHandler = (req, res) => {
  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Send initial progress
  const sendProgress = () => {
    res.write(`data: ${JSON.stringify(currentProgress)}\n\n`);
  };

  // Send progress updates
  const progressListener = () => sendProgress();
  const completeListener = () => {
    sendProgress();
    res.write(`data: {"type": "complete"}\n\n`);
  };
  const errorListener = (error: any) => {
    res.write(
      `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`,
    );
  };

  progressEmitter.on("progress", progressListener);
  progressEmitter.on("complete", completeListener);
  progressEmitter.on("error", errorListener);

  // Send initial state
  sendProgress();

  // Clean up on client disconnect
  req.on("close", () => {
    progressEmitter.off("progress", progressListener);
    progressEmitter.off("complete", completeListener);
    progressEmitter.off("error", errorListener);
  });
};
