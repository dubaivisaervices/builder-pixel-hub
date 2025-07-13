import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { getS3Service, isS3Configured } from "../utils/s3Service";

interface SmartSyncResult {
  totalBusinesses: number;
  processedBusinesses: number;
  logosUploaded: number;
  photosUploaded: number;
  base64Uploads: number;
  urlUploads: number;
  skippedUrls: number;
  errors: string[];
  duration: number;
}

export const smartS3Sync: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    console.log("🧠 Starting SMART S3 sync...");
    const startTime = Date.now();

    const result: SmartSyncResult = {
      totalBusinesses: 0,
      processedBusinesses: 0,
      logosUploaded: 0,
      photosUploaded: 0,
      base64Uploads: 0,
      urlUploads: 0,
      skippedUrls: 0,
      errors: [],
      duration: 0,
    };

    const s3Service = getS3Service();
    const batchSize = 100;
    let offset = 0;

    while (true) {
      const businesses = await businessService.getBusinessesPaginated(
        offset,
        batchSize,
      );
      if (businesses.length === 0) break;

      result.totalBusinesses += businesses.length;

      for (const business of businesses) {
        try {
          let businessUpdated = false;
          const updates: any = { ...business };

          // Handle logo
          if (business.logo_base64 && !business.logoS3Url) {
            try {
              const logoBuffer = Buffer.from(business.logo_base64, "base64");
              const logoS3Url = await s3Service.uploadBuffer(
                logoBuffer,
                `businesses/${business.id}/logo.jpg`,
                "image/jpeg",
                {
                  businessId: business.id,
                  businessName: business.name,
                  imageType: "logo",
                  source: "base64",
                },
              );

              updates.logoS3Url = logoS3Url;
              result.logosUploaded++;
              result.base64Uploads++;
              businessUpdated = true;
              console.log(`✅ Logo uploaded (base64): ${business.name}`);
            } catch (error) {
              result.errors.push(
                `Logo base64 upload failed for ${business.name}: ${error}`,
              );
            }
          } else if (business.logoUrl && !business.logoS3Url) {
            // Try URL upload with error handling
            if (isValidImageUrl(business.logoUrl)) {
              try {
                const logoS3Url = await s3Service.uploadBusinessLogo(
                  business.id,
                  business.logoUrl,
                  business.name,
                );

                updates.logoS3Url = logoS3Url;
                result.logosUploaded++;
                result.urlUploads++;
                businessUpdated = true;
                console.log(`✅ Logo uploaded (URL): ${business.name}`);
              } catch (error) {
                result.skippedUrls++;
                console.log(
                  `��️ Skipped logo URL for ${business.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
                );
              }
            } else {
              result.skippedUrls++;
            }
          }

          // Handle photos
          if (business.photos && Array.isArray(business.photos)) {
            const updatedPhotos = [];

            for (const photo of business.photos) {
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

                  result.photosUploaded++;
                  result.base64Uploads++;
                  businessUpdated = true;
                  photoUpdated = true;
                } catch (error) {
                  result.errors.push(
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

                  result.photosUploaded++;
                  result.urlUploads++;
                  businessUpdated = true;
                } catch (error) {
                  result.skippedUrls++;
                  // Keep original photo
                  updatedPhotos.push(photo);
                }
              } else if (!photoUpdated) {
                // Keep original photo
                updatedPhotos.push(photo);
                if (photo.url && !isValidImageUrl(photo.url)) {
                  result.skippedUrls++;
                }
              }
            }

            if (updatedPhotos.length > 0) {
              updates.photos = updatedPhotos;
            }
          }

          // Update business if changes were made
          if (businessUpdated) {
            await businessService.updateBusiness(business.id, updates);
          }

          result.processedBusinesses++;

          // Log progress
          if (result.processedBusinesses % 50 === 0) {
            console.log(
              `📊 Progress: ${result.processedBusinesses} businesses processed, ${result.logosUploaded} logos, ${result.photosUploaded} photos uploaded`,
            );
          }
        } catch (error) {
          result.errors.push(
            `Business processing failed for ${business.name}: ${error}`,
          );
        }
      }

      offset += batchSize;
    }

    result.duration = Date.now() - startTime;

    console.log("🧠 SMART S3 sync completed!");
    console.log(`📊 Final results:`);
    console.log(`   - Businesses processed: ${result.processedBusinesses}`);
    console.log(`   - Logos uploaded: ${result.logosUploaded}`);
    console.log(`   - Photos uploaded: ${result.photosUploaded}`);
    console.log(`   - Base64 uploads: ${result.base64Uploads}`);
    console.log(`   - URL uploads: ${result.urlUploads}`);
    console.log(`   - Skipped URLs: ${result.skippedUrls}`);
    console.log(`   - Duration: ${result.duration / 1000} seconds`);

    res.json({
      success: true,
      message: "Smart S3 sync completed successfully",
      result,
    });
  } catch (error) {
    console.error("Smart S3 sync error:", error);
    res.status(500).json({
      error: "Smart S3 sync failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper function to validate image URLs
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  // Skip data URLs
  if (url.startsWith("data:")) return false;

  // Skip very long URLs (likely corrupted)
  if (url.length > 2000) return false;

  // Skip URLs with invalid characters
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Check for common image extensions or Google photos
  const imagePatterns = [
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i,
    /googleusercontent\.com/,
    /maps\.googleapis\.com/,
    /lh\d+\.googleusercontent\.com/,
  ];

  return imagePatterns.some((pattern) => pattern.test(url));
}

export const getSmartSyncStats: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({ error: "S3 not configured" });
    }

    // Get statistics about what needs to be synced
    const totalBusinesses = await businessService.getBusinessCount();

    let businessesWithBase64Logos = 0;
    let businessesWithUrlLogos = 0;
    let businessesWithS3Logos = 0;
    let totalPhotosWithBase64 = 0;
    let totalPhotosWithUrls = 0;
    let totalPhotosWithS3 = 0;

    const batchSize = 100;
    let offset = 0;

    while (true) {
      const businesses = await businessService.getBusinessesPaginated(
        offset,
        batchSize,
      );
      if (businesses.length === 0) break;

      for (const business of businesses) {
        // Count logos
        if (business.logoS3Url) businessesWithS3Logos++;
        else if (business.logo_base64) businessesWithBase64Logos++;
        else if (business.logoUrl) businessesWithUrlLogos++;

        // Count photos
        if (business.photos && Array.isArray(business.photos)) {
          for (const photo of business.photos) {
            if (photo.s3Url) totalPhotosWithS3++;
            else if (photo.base64) totalPhotosWithBase64++;
            else if (photo.url) totalPhotosWithUrls++;
          }
        }
      }

      offset += batchSize;
    }

    res.json({
      totalBusinesses,
      logos: {
        withS3: businessesWithS3Logos,
        withBase64: businessesWithBase64Logos,
        withUrls: businessesWithUrlLogos,
        needSync: businessesWithBase64Logos + businessesWithUrlLogos,
      },
      photos: {
        withS3: totalPhotosWithS3,
        withBase64: totalPhotosWithBase64,
        withUrls: totalPhotosWithUrls,
        needSync: totalPhotosWithBase64 + totalPhotosWithUrls,
      },
    });
  } catch (error) {
    console.error("Error getting smart sync stats:", error);
    res.status(500).json({
      error: "Failed to get sync stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
