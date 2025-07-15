import { Request, Response } from "express";
import { createHostingerService } from "../services/hostingerUpload";
import { StepByStepGooglePhotos } from "../services/stepByStepGooglePhotos";

// Hostinger FTP Configuration
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "crossbordersmigrations.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
  remotePath: "/public_html/business-images",
  baseUrl: "https://crossbordersmigrations.com/business-images",
};

/**
 * SUPER FAST: Process single business with parallel operations
 */
async function processSingleBusinessFast(
  business: any,
  stepByStepService: StepByStepGooglePhotos,
  hostingerService: any,
  businessService: any,
  progressTracker: any,
  currentIndex: number,
) {
  try {
    // Update progress
    progressTracker.updateBusiness(
      currentIndex,
      business.name,
      "Processing...",
    );

    // Get photos with timeout
    const photoPromise = stepByStepService.getBusinessPhoto(business.name);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 15000),
    );

    const photoResult = await Promise.race([photoPromise, timeoutPromise]);

    if (
      !photoResult.success ||
      (!photoResult.logoPath && !photoResult.businessPhotos?.length)
    ) {
      progressTracker.addError(
        business.name,
        photoResult.error || "No photos found",
      );
      return {
        success: false,
        business: business.name,
        error: photoResult.error || "No photos found",
      };
    }

    const fs = await import("fs");
    const uploadPromises = [];
    let logoUrl: string | undefined;
    const businessPhotoUrls: string[] = [];

    // Upload logo in parallel
    if (photoResult.logoPath) {
      const logoBuffer = fs.readFileSync(photoResult.logoPath);
      uploadPromises.push(
        hostingerService
          .uploadBusinessLogo(logoBuffer, business.id, photoResult.logoPath)
          .then((url: string) => {
            logoUrl = url;
            return { type: "logo", url };
          }),
      );
    }

    // Upload business photos in parallel
    if (photoResult.businessPhotos?.length > 0) {
      photoResult.businessPhotos.forEach((photoPath: string, index: number) => {
        const photoBuffer = fs.readFileSync(photoPath);
        uploadPromises.push(
          hostingerService
            .uploadBusinessPhoto(
              photoBuffer,
              business.id,
              `photo_${index + 1}`,
              photoPath,
            )
            .then((url: string) => {
              businessPhotoUrls.push(url);
              return { type: "photo", url };
            }),
        );
      });
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    // Update database in parallel
    const dbPromises = [];
    if (logoUrl) {
      dbPromises.push(businessService.updateBusinessLogo(business.id, logoUrl));
    }
    if (businessPhotoUrls.length > 0) {
      dbPromises.push(
        businessService.updateBusinessPhotos(business.id, businessPhotoUrls),
      );
    }
    await Promise.all(dbPromises);

    // Cleanup files
    const allFiles = [
      photoResult.logoPath,
      ...(photoResult.businessPhotos || []),
    ].filter(Boolean);
    stepByStepService.cleanupFiles(allFiles);

    // Update progress
    progressTracker.addSuccess(
      business.name,
      !!logoUrl,
      businessPhotoUrls.length,
    );

    return {
      success: true,
      business: business.name,
      logoUrl,
      photoUrls: businessPhotoUrls,
      logoCount: logoUrl ? 1 : 0,
      photoCount: businessPhotoUrls.length,
    };
  } catch (error) {
    progressTracker.addError(business.name, error.message);
    return {
      success: false,
      business: business.name,
      error: error.message,
    };
  }
}

/**
 * SUPER FAST: Process batch with parallel processing
 */
export async function superFastBatchUpload(req: Request, res: Response) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    const { batchNumber = 1, concurrency = 5 } = req.body;
    const batchSize = 50;
    const offset = (batchNumber - 1) * batchSize;

    // Minimal logging for maximum speed
    if (batchNumber % 10 === 1) {
      console.log(
        `🚀 SUPER FAST: Starting batch ${batchNumber} with ${concurrency} parallel workers...`,
      );
    }

    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);
    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const stepByStepService = new StepByStepGooglePhotos(apiKey);

    // Get businesses for this batch
    const businesses = await database.all(
      `SELECT id, name, address, logo_s3_url FROM businesses 
       ORDER BY CASE WHEN logo_s3_url IS NULL OR logo_s3_url = '' OR logo_s3_url LIKE '%s3.ap-south-1.amazonaws.com%' THEN 0 ELSE 1 END, id
       LIMIT ? OFFSET ?`,
      [batchSize, offset],
    );

    if (businesses.length === 0) {
      return res.json({
        success: true,
        message: `No more businesses to process in batch ${batchNumber}`,
        results: {
          processed: 0,
          successful: 0,
          failed: 0,
          totalLogos: 0,
          totalPhotos: 0,
          errors: [],
          batchNumber,
          batchSize,
          hasMore: false,
        },
      });
    }

    const { progressTracker } = await import("../services/progressTracker");
    progressTracker.startBatch(batchNumber, businesses.length);

    // Process businesses in parallel batches
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      totalLogos: 0,
      totalPhotos: 0,
      errors: [] as string[],
      batchNumber,
      batchSize,
      hasMore: businesses.length === batchSize,
    };

    // Split businesses into chunks for parallel processing
    const chunks = [];
    for (let i = 0; i < businesses.length; i += concurrency) {
      chunks.push(businesses.slice(i, i + concurrency));
    }

    // Process each chunk in parallel
    for (const chunk of chunks) {
      const chunkPromises = chunk.map((business, index) =>
        processSingleBusinessFast(
          business,
          stepByStepService,
          hostingerService,
          businessService,
          progressTracker,
          results.processed + index + 1,
        ),
      );

      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults.forEach((result) => {
        results.processed++;

        if (result.status === "fulfilled" && result.value.success) {
          results.successful++;
          results.totalLogos += result.value.logoCount || 0;
          results.totalPhotos += result.value.photoCount || 0;
        } else {
          results.failed++;
          const error =
            result.status === "fulfilled"
              ? result.value.error
              : result.reason?.message || "Unknown error";
          results.errors.push(
            `${result.status === "fulfilled" ? result.value.business : "Unknown"}: ${error}`,
          );
        }
      });
    }

    progressTracker.completeBatch();

    console.log(
      `✅ SUPER FAST: Batch ${batchNumber} completed in parallel:`,
      results,
    );

    res.json({
      success: true,
      results,
      message: `Super fast batch ${batchNumber} completed: ${results.successful}/${results.processed} businesses processed`,
    });
  } catch (error) {
    console.error("❌ Super fast batch error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * AUTO PROCESS ALL: Automatically process all businesses in sequential batches
 */
export async function autoProcessAll(req: Request, res: Response) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🤖 AUTO PROCESS ALL: Starting automatic processing of all businesses...",
    );

    // Get total number of businesses that need processing
    const { database } = await import("../database/database");
    const totalBusinesses = await database.get(
      `SELECT COUNT(*) as count FROM businesses 
       WHERE logo_s3_url IS NULL OR logo_s3_url = '' OR logo_s3_url LIKE '%s3.ap-south-1.amazonaws.com%'`,
    );

    const totalCount = totalBusinesses.count;
    const totalBatches = Math.ceil(totalCount / 50);

    console.log(
      `📊 AUTO PROCESS: ${totalCount} businesses need processing across ${totalBatches} batches`,
    );

    const { progressTracker } = await import("../services/progressTracker");

    // Initialize overall progress
    progressTracker.updateProgress({
      batchNumber: 1,
      totalBusinesses: totalCount,
      currentBusiness: 0,
      businessName: "Starting automatic processing...",
      status: "processing",
      logos: 0,
      photos: 0,
      errors: [],
      currentStep: `Processing ${totalBatches} batches automatically`,
    });

    res.json({
      success: true,
      message: `Started automatic processing of ${totalCount} businesses across ${totalBatches} batches`,
      totalBusinesses: totalCount,
      totalBatches,
    });

    // Process all batches automatically in the background
    processAllBatchesAutomatically(totalBatches, progressTracker);
  } catch (error) {
    console.error("❌ Auto process all error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Background processing of all batches
 */
async function processAllBatchesAutomatically(
  totalBatches: number,
  progressTracker: any,
) {
  let overallStats = {
    totalProcessed: 0,
    totalSuccessful: 0,
    totalLogos: 0,
    totalPhotos: 0,
    totalErrors: [] as string[],
  };

  for (let batchNumber = 1; batchNumber <= totalBatches; batchNumber++) {
    try {
      console.log(`🤖 AUTO BATCH ${batchNumber}/${totalBatches}: Starting...`);

      // Update progress for current batch
      progressTracker.updateProgress({
        currentStep: `Auto-processing batch ${batchNumber}/${totalBatches}`,
        batchNumber,
      });

      // Process single batch using internal API
      const batchResult = await processSingleBatchInternal(batchNumber);

      if (batchResult.success) {
        overallStats.totalProcessed += batchResult.results.processed;
        overallStats.totalSuccessful += batchResult.results.successful;
        overallStats.totalLogos += batchResult.results.totalLogos;
        overallStats.totalPhotos += batchResult.results.totalPhotos;
        overallStats.totalErrors.push(...batchResult.results.errors);

        console.log(
          `✅ AUTO BATCH ${batchNumber}/${totalBatches}: Completed - ${batchResult.results.successful}/${batchResult.results.processed} successful`,
        );

        // Update overall progress
        progressTracker.updateProgress({
          currentBusiness: overallStats.totalProcessed,
          logos: overallStats.totalLogos,
          photos: overallStats.totalPhotos,
          errors: overallStats.totalErrors,
        });

        // If no more businesses in this batch, we're done
        if (!batchResult.results.hasMore) {
          console.log(
            `🎉 AUTO PROCESS: All batches completed! Total: ${overallStats.totalSuccessful}/${overallStats.totalProcessed} successful`,
          );
          break;
        }
      } else {
        console.error(
          `❌ AUTO BATCH ${batchNumber}: Failed - ${batchResult.error}`,
        );
        overallStats.totalErrors.push(
          `Batch ${batchNumber}: ${batchResult.error}`,
        );
      }

      // Small delay between batches to prevent overwhelming
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ AUTO BATCH ${batchNumber}: Error -`, error);
      overallStats.totalErrors.push(`Batch ${batchNumber}: ${error.message}`);
    }
  }

  // Mark as completed
  progressTracker.updateProgress({
    status: "completed",
    currentStep: `Completed ${totalBatches} batches automatically`,
  });

  console.log(`🎉 AUTO PROCESS ALL: Completed! Final stats:`, overallStats);
}

/**
 * Internal batch processing function
 */
async function processSingleBatchInternal(batchNumber: number) {
  // This is a simplified version of the batch processing for internal use
  // We'll reuse the super fast batch logic
  const mockReq = { body: { batchNumber, concurrency: 5 } } as Request;
  let result: any;

  const mockRes = {
    json: (data: any) => {
      result = data;
    },
    status: () => mockRes,
  } as Response;

  await superFastBatchUpload(mockReq, mockRes);
  return result;
}
