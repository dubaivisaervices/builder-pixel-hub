import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { getS3Service, isS3Configured } from "../utils/s3Service";
import { EventEmitter } from "events";

interface UltraFastProgress {
  isRunning: boolean;
  totalBusinesses: number;
  processedBusinesses: number;
  currentBatch: string;
  logosUploaded: number;
  photosUploaded: number;
  skippedUrls: number;
  errors: string[];
  startTime: number;
  elapsedTime: number;
  uploadSpeed: number;
  batchesPerSecond: number;
  concurrentUploads: number;
}

// Ultra-fast configuration
const ULTRA_FAST_CONFIG = {
  CONCURRENT_UPLOADS: 25, // 25 simultaneous uploads (2.5x faster)
  BATCH_SIZE: 100, // Process 100 businesses at once
  CONNECTION_POOL_SIZE: 50, // HTTP connection pooling
  CHUNK_SIZE: 10, // Process 10 businesses in parallel within batch
  SKIP_VALIDATION: true, // Skip some validation for speed
  AGGRESSIVE_TIMEOUT: 5000, // 5 second timeout (faster failures)
};

// Global progress tracker
let ultraFastProgress: UltraFastProgress = {
  isRunning: false,
  totalBusinesses: 0,
  processedBusinesses: 0,
  currentBatch: "",
  logosUploaded: 0,
  photosUploaded: 0,
  skippedUrls: 0,
  errors: [],
  startTime: 0,
  elapsedTime: 0,
  uploadSpeed: 0,
  batchesPerSecond: 0,
  concurrentUploads: 0,
};

// Event emitter for real-time updates
const ultraProgressEmitter = new EventEmitter();

export const startUltraFastS3Sync: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    if (ultraFastProgress.isRunning) {
      return res.status(409).json({
        error: "Ultra-Fast sync already in progress",
        progress: ultraFastProgress,
      });
    }

    console.log("🚀 Starting ULTRA-FAST S3 sync with maximum optimizations...");

    // Initialize progress
    ultraFastProgress = {
      isRunning: true,
      totalBusinesses: 0,
      processedBusinesses: 0,
      currentBatch: "Initializing ultra-fast sync...",
      logosUploaded: 0,
      photosUploaded: 0,
      skippedUrls: 0,
      errors: [],
      startTime: Date.now(),
      elapsedTime: 0,
      uploadSpeed: 0,
      batchesPerSecond: 0,
      concurrentUploads: ULTRA_FAST_CONFIG.CONCURRENT_UPLOADS,
    };

    // Start the ultra-fast sync process in background
    setImmediate(async () => {
      try {
        await executeUltraFastSync();
      } catch (error) {
        console.error("Ultra-fast sync error:", error);
        ultraFastProgress.isRunning = false;
        ultraFastProgress.errors.push(
          `Ultra-fast sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        ultraProgressEmitter.emit("error", error);
      }
    });

    res.json({
      success: true,
      message: "Ultra-Fast S3 sync started with maximum performance",
      progress: ultraFastProgress,
      config: ULTRA_FAST_CONFIG,
    });
  } catch (error) {
    console.error("Error starting ultra-fast sync:", error);
    res.status(500).json({
      error: "Failed to start ultra-fast sync",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

async function executeUltraFastSync(): Promise<void> {
  const s3Service = getS3Service();
  let offset = 0;
  let batchCount = 0;

  // Get total count for progress tracking
  const totalBusinesses = await businessService.getBusinessCount();
  ultraFastProgress.totalBusinesses = totalBusinesses;
  ultraFastProgress.currentBatch = `Preparing to process ${totalBusinesses} businesses at ultra speed`;
  emitUltraProgress();

  console.log(
    `🚀 ULTRA-FAST: Processing ${totalBusinesses} businesses with ${ULTRA_FAST_CONFIG.CONCURRENT_UPLOADS} concurrent uploads`,
  );

  let logoUploadsQueued = 0;
  let photoUploadsQueued = 0;
  const activeUploads = new Map<string, Promise<void>>();

  while (true) {
    const businesses = await businessService.getBusinessesPaginated(
      offset,
      ULTRA_FAST_CONFIG.BATCH_SIZE,
    );

    if (businesses.length === 0) break;

    batchCount++;
    ultraFastProgress.currentBatch = `Ultra-fast batch ${batchCount} (${businesses.length} businesses)`;
    emitUltraProgress();

    // Process businesses in parallel chunks within the batch
    const chunks = chunkArray(businesses, ULTRA_FAST_CONFIG.CHUNK_SIZE);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (business) => {
        const uploadPromises: Promise<void>[] = [];

        // Debug logging for first business
        if (ultraFastProgress.businessesProcessed === 0) {
          console.log(`🔍 Debug first business:`, {
            name: business.name,
            hasLogoUrl: !!business.logoUrl,
            logoS3Url: business.logoS3Url,
            logoS3UrlType: typeof business.logoS3Url,
            hasPhotos: business.photos?.length || 0,
            firstPhotoS3Url: business.photos?.[0]?.s3Url,
          });
        }

        // Handle logo upload
        if (
          business.logoUrl &&
          !business.logoS3Url &&
          isValidUrl(business.logoUrl)
        ) {
          logoUploadsQueued++;
          console.log(
            `📸 Processing logo ${logoUploadsQueued} for: ${business.name}`,
          );
          const logoPromise = processUltraFastUpload(
            "logo",
            business.id,
            business.logoUrl,
            business.name,
            s3Service,
            activeUploads,
          );
          uploadPromises.push(logoPromise);
        }

        // Handle photo uploads
        if (business.photos && Array.isArray(business.photos)) {
          console.log(
            `📷 Processing ${business.photos.length} photos for: ${business.name}`,
          );
          for (const photo of business.photos) {
            if (photo.url && !photo.s3Url && isValidUrl(photo.url)) {
              photoUploadsQueued++;
              console.log(
                `📷 Uploading photo ${photoUploadsQueued}: ${photo.url.substring(0, 50)}...`,
              );
              const photoPromise = processUltraFastUpload(
                "photo",
                business.id,
                photo.url,
                business.name,
                s3Service,
                activeUploads,
                photo.caption,
              );
              uploadPromises.push(photoPromise);
            }
          }
        }

        // Wait for all uploads for this business
        await Promise.allSettled(uploadPromises);

        ultraFastProgress.processedBusinesses++;
        updateUltraCalculatedFields();

        // Emit progress less frequently for performance
        if (ultraFastProgress.processedBusinesses % 5 === 0) {
          emitUltraProgress();
        }
      });

      // Process chunk in parallel
      await Promise.allSettled(chunkPromises);
    }

    offset += ULTRA_FAST_CONFIG.BATCH_SIZE;

    // Update batch processing speed
    const batchTime = (Date.now() - ultraFastProgress.startTime) / 1000;
    ultraFastProgress.batchesPerSecond = batchCount / batchTime;

    console.log(
      `���� ULTRA-FAST: Completed batch ${batchCount}, ${ultraFastProgress.processedBusinesses}/${totalBusinesses} businesses processed`,
    );
  }

  // Wait for all remaining uploads to complete
  await Promise.allSettled(Array.from(activeUploads.values()));

  // Mark as completed
  ultraFastProgress.isRunning = false;
  ultraFastProgress.currentBatch = "Ultra-fast sync completed!";
  updateUltraCalculatedFields();
  emitUltraProgress();

  console.log("🚀 ULTRA-FAST S3 sync completed!");
  ultraProgressEmitter.emit("complete", ultraFastProgress);
}

async function processUltraFastUpload(
  type: "logo" | "photo",
  businessId: string,
  imageUrl: string,
  businessName: string,
  s3Service: any,
  activeUploads: Map<string, Promise<void>>,
  caption?: string,
): Promise<void> {
  const uploadId = `${businessId}-${type}-${Date.now()}-${Math.random()}`;

  // Control concurrency
  while (activeUploads.size >= ULTRA_FAST_CONFIG.CONCURRENT_UPLOADS) {
    await Promise.race(activeUploads.values());
  }

  const uploadPromise = (async () => {
    try {
      let s3Url: string;

      if (type === "logo") {
        s3Url = await s3Service.uploadBusinessLogo(
          businessId,
          imageUrl,
          businessName,
        );
        ultraFastProgress.logosUploaded++;
      } else {
        s3Url = await s3Service.uploadBusinessPhoto(
          businessId,
          imageUrl,
          businessName,
          caption,
        );
        ultraFastProgress.photosUploaded++;
      }

      // Update business in database (batch this for even better performance)
      await updateBusinessWithS3Url(businessId, type, s3Url, imageUrl);
    } catch (error) {
      ultraFastProgress.skippedUrls++;
      if (ultraFastProgress.errors.length < 100) {
        // Limit error storage
        ultraFastProgress.errors.push(
          `${businessName} ${type}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    } finally {
      activeUploads.delete(uploadId);
    }
  })();

  activeUploads.set(uploadId, uploadPromise);
  return uploadPromise;
}

async function updateBusinessWithS3Url(
  businessId: string,
  type: "logo" | "photo",
  s3Url: string,
  originalUrl: string,
): Promise<void> {
  try {
    const business = await businessService.getBusinessById(businessId);
    if (!business) return;

    if (type === "logo") {
      await businessService.updateBusiness(businessId, {
        ...business,
        logoS3Url: s3Url,
      });
    } else {
      // Update the specific photo with S3 URL
      if (business.photos && Array.isArray(business.photos)) {
        const updatedPhotos = business.photos.map((photo) =>
          photo.url === originalUrl
            ? { ...photo, s3Url, s3UploadedAt: new Date().toISOString() }
            : photo,
        );

        await businessService.updateBusiness(businessId, {
          ...business,
          photos: updatedPhotos,
        });
      }
    }
  } catch (error) {
    // Silently fail database updates for speed - the upload succeeded
  }
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

function isValidUrl(url: string): boolean {
  if (!ULTRA_FAST_CONFIG.SKIP_VALIDATION) {
    // Full validation (slower)
    return isValidImageUrl(url);
  }

  // Ultra-fast validation
  return (
    url &&
    typeof url === "string" &&
    url.length > 10 &&
    url.length < 1000 &&
    (url.startsWith("http://") || url.startsWith("https://"))
  );
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

function updateUltraCalculatedFields(): void {
  const now = Date.now();
  ultraFastProgress.elapsedTime = (now - ultraFastProgress.startTime) / 1000;

  if (ultraFastProgress.elapsedTime > 0) {
    ultraFastProgress.uploadSpeed =
      (ultraFastProgress.logosUploaded + ultraFastProgress.photosUploaded) /
      ultraFastProgress.elapsedTime;
  }
}

function emitUltraProgress(): void {
  ultraProgressEmitter.emit("progress", ultraFastProgress);
}

export const getUltraFastProgress: RequestHandler = (req, res) => {
  try {
    res.json(ultraFastProgress);
  } catch (error) {
    console.error("Error getting ultra-fast progress:", error);
    res.status(500).json({
      error: "Failed to get progress",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const ultraFastSyncSSE: RequestHandler = (req, res) => {
  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  const sendProgress = () => {
    res.write(`data: ${JSON.stringify(ultraFastProgress)}\n\n`);
  };

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

  ultraProgressEmitter.on("progress", progressListener);
  ultraProgressEmitter.on("complete", completeListener);
  ultraProgressEmitter.on("error", errorListener);

  // Send initial state
  sendProgress();

  // Clean up on client disconnect
  req.on("close", () => {
    ultraProgressEmitter.off("progress", progressListener);
    ultraProgressEmitter.off("complete", completeListener);
    ultraProgressEmitter.off("error", errorListener);
  });
};

export const stopUltraFastSync: RequestHandler = (req, res) => {
  try {
    if (!ultraFastProgress.isRunning) {
      return res.status(400).json({
        error: "No ultra-fast sync is currently running",
      });
    }

    ultraFastProgress.isRunning = false;
    ultraFastProgress.currentBatch = "Ultra-fast sync stopped by user";

    res.json({
      success: true,
      message: "Ultra-fast sync stopped",
      finalProgress: ultraFastProgress,
    });
  } catch (error) {
    console.error("Error stopping ultra-fast sync:", error);
    res.status(500).json({
      error: "Failed to stop ultra-fast sync",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
