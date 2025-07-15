import { Request, Response } from "express";
import { createHostingerService } from "../services/hostingerUpload";
import { createSimpleGoogleImageFetcher } from "../services/simpleGoogleImageFetcher";
import { createCachedImageUploader } from "../services/cachedImageUploader";
import { createGooglePhotoProxy } from "../services/googlePhotoProxy";
import { createBase64ToHostingerUploader } from "../services/base64ToHostingerUploader";
import { createImprovedGoogleImageFetcher } from "../services/improvedGoogleImageFetcher";
import { createHybridGoogleImageFetcher } from "../services/hybridGoogleImageFetcher";
import { createHybridGoogleImageFetcherAll } from "../services/hybridGoogleImageFetcherAll";
import { RealGoogleBusinessPhotos } from "../services/realGoogleBusinessPhotos";
import { StepByStepGooglePhotos } from "../services/stepByStepGooglePhotos";

// Hostinger FTP Configuration
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "crossbordersmigrations.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
  remotePath: "/public_html/business-images", // Path on your hosting server
  baseUrl: "https://crossbordersmigrations.com/business-images", // Your domain URL
};

/**
 * Upload ALL business images using REAL Google Places API photos (AUTHENTIC BUSINESS PHOTOS)
 */
export async function uploadAllRealGooglePhotosToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🚀 Starting STEP-BY-STEP Google Places API workflow for authentic business photos...",
    );
    console.log(
      `🔑 API Key status: ${apiKey ? `SET (${apiKey.substring(0, 10)}...)` : "NOT SET"}`,
    );

    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);
    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const stepByStepService = new StepByStepGooglePhotos(apiKey);

    // Get businesses to test step-by-step workflow
    const businesses = await database.all(
      "SELECT id, name, address FROM businesses ORDER BY CASE WHEN logo_s3_url IS NULL OR logo_s3_url = '' THEN 0 ELSE 1 END LIMIT 5",
    );

    console.log(`📊 Found ${businesses.length} businesses to process`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const business of businesses) {
      try {
        console.log(`\n🔍 Processing: ${business.name}`);
        results.processed++;

        // Execute complete step-by-step workflow
        const photoResult = await stepByStepService.getBusinessPhoto(
          business.name,
        );

        if (
          !photoResult.success ||
          (!photoResult.logoPath && !photoResult.businessPhotos?.length)
        ) {
          console.log(
            `❌ Step-by-step workflow failed for ${business.name}: ${photoResult.error}`,
          );
          console.log(
            `📋 Workflow details:`,
            JSON.stringify(photoResult.details, null, 2),
          );
          results.failed++;
          results.errors.push(`${business.name}: ${photoResult.error}`);
          continue;
        }

        try {
          const fs = await import("fs");
          let logoUrl: string | undefined;
          const businessPhotoUrls: string[] = [];

          // Upload logo if available
          if (photoResult.logoPath) {
            console.log(`📋 Uploading logo for ${business.name}...`);
            const logoBuffer = fs.readFileSync(photoResult.logoPath);
            logoUrl = await hostingerService.uploadBusinessLogo(
              logoBuffer,
              business.id,
              photoResult.logoPath,
            );
            console.log(`✅ Logo uploaded: ${logoUrl}`);
          }

          // Upload business photos if available
          if (photoResult.businessPhotos?.length > 0) {
            console.log(
              `📋 Uploading ${photoResult.businessPhotos.length} business photos for ${business.name}...`,
            );

            for (let i = 0; i < photoResult.businessPhotos.length; i++) {
              const photoPath = photoResult.businessPhotos[i];
              const photoBuffer = fs.readFileSync(photoPath);

              // Upload business photo
              const photoUrl = await hostingerService.uploadBusinessPhoto(
                photoBuffer,
                business.id,
                `photo_${i + 1}`,
                photoPath,
              );
              businessPhotoUrls.push(photoUrl);
              console.log(`✅ Business photo ${i + 1} uploaded: ${photoUrl}`);
            }
          }

          // Save to database
          if (logoUrl) {
            await businessService.updateBusinessLogo(business.id, logoUrl);
          }

          if (businessPhotoUrls.length > 0) {
            await businessService.updateBusinessPhotos(
              business.id,
              businessPhotoUrls,
            );
          }

          // Cleanup temp files
          const allFiles = [
            photoResult.logoPath,
            ...(photoResult.businessPhotos || []),
          ].filter(Boolean);
          stepByStepService.cleanupFiles(allFiles);

          console.log(
            `✅ Successfully processed ${business.name}: Logo: ${logoUrl ? "Yes" : "No"}, Photos: ${businessPhotoUrls.length}`,
          );
          results.successful++;
        } catch (uploadError) {
          console.error(
            `❌ Error uploading to Hostinger for ${business.name}:`,
            uploadError,
          );
          results.failed++;
          results.errors.push(
            `${business.name}: Upload failed - ${uploadError.message}`,
          );

          // Cleanup temp files even on error
          const allFiles = [
            photoResult.logoPath,
            ...(photoResult.businessPhotos || []),
          ].filter(Boolean);
          stepByStepService.cleanupFiles(allFiles);
          continue;
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error processing ${business.name}:`, error);
        results.failed++;
        results.errors.push(`${business.name}: ${error.message}`);
      }
    }

    console.log(
      "�� STEP-BY-STEP Google Places photo processing completed:",
      results,
    );

    res.json({
      success: true,
      message: "Step-by-step Google Places photos processed successfully",
      results,
    });
  } catch (error) {
    console.error(
      "❌ Step-by-step Google Places photo processing error:",
      error,
    );
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload ALL REMAINING business images using hybrid approach (PROCESSES ALL BUSINESSES)
 */
export async function uploadAllRemainingHybridImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🚀 Starting FULL HYBRID processing for ALL remaining businesses...",
    );

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const hybridFetcher = createHybridGoogleImageFetcherAll(
      apiKey,
      hostingerService,
    );

    const results = await hybridFetcher.processAllBusinesses();

    console.log("✅ FULL Hybrid processing completed:", results);

    res.json({
      success: true,
      message: "ALL remaining businesses processed successfully",
      results,
    });
  } catch (error) {
    console.error("❌ FULL Hybrid processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images using hybrid Google+Fallback approach (WORKS EVEN WHEN GOOGLE FAILS)
 */
export async function uploadAllHybridImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🚀 Starting HYBRID Google+Fallback bulk fetch and upload to Hostinger...",
    );

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const hybridFetcher = createHybridGoogleImageFetcher(
      apiKey,
      hostingerService,
    );

    const results = await hybridFetcher.processAllBusinesses();

    console.log("✅ Hybrid Google+Fallback bulk upload completed:", results);

    res.json({
      success: true,
      message:
        "Hybrid Google+Fallback upload to Hostinger completed successfully",
      results,
    });
  } catch (error) {
    console.error("❌ Hybrid Google+Fallback bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images from Google Places API to Hostinger (IMPROVED METHOD)
 */
export async function uploadAllImprovedGoogleImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🚀 Starting IMPROVED Google Places bulk fetch and upload to Hostinger...",
    );

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googleFetcher = createImprovedGoogleImageFetcher(
      apiKey,
      hostingerService,
    );

    const results = await googleFetcher.processAllBusinesses();

    console.log("✅ Improved Google Places bulk upload completed:", results);

    res.json({
      success: true,
      message: "Improved Google Places bulk upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Improved Google Places bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images from Google Places API to Hostinger (OLD METHOD)
 */
export async function uploadAllGoogleImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🚀 Starting Google Places bulk fetch and upload to Hostinger...",
    );

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googleFetcher = createSimpleGoogleImageFetcher(
      apiKey,
      hostingerService,
    );

    const results = await googleFetcher.processAllBusinesses();

    console.log("✅ Google Places bulk upload completed:", results);

    res.json({
      success: true,
      message: "Google Places bulk upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Google Places bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images via base64 storage to Hostinger (WORKING METHOD)
 */
export async function uploadAllBase64ToHostinger(req: Request, res: Response) {
  try {
    console.log("🚀 Starting base64 → Hostinger upload process...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const base64Uploader = createBase64ToHostingerUploader(hostingerService);

    const results =
      await base64Uploader.processAllBusinessesBase64ToHostinger();

    console.log("✅ Base64 → Hostinger upload completed:", results);

    res.json({
      success: true,
      message: "Base64 → Hostinger upload completed successfully",
      results,
    });
  } catch (error) {
    console.error("❌ Base64 → Hostinger upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images using Google Photos proxy to Hostinger (FAILING METHOD)
 */
export async function uploadAllGooglePhotosToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log("🚀 Starting Google Photos proxy upload to Hostinger...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googlePhotoProxy = createGooglePhotoProxy(apiKey, hostingerService);

    const results = await googlePhotoProxy.processAllBusinessesWithProxy();

    console.log("✅ Google Photos proxy upload completed:", results);

    res.json({
      success: true,
      message: "Google Photos proxy upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Google Photos proxy upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images from cached data to Hostinger (NO DATA AVAILABLE)
 */
export async function uploadAllCachedImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    console.log("🚀 Starting cached image upload to Hostinger...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const cachedUploader = createCachedImageUploader(hostingerService);

    const results = await cachedUploader.processAllCachedBusinessImages();

    console.log("✅ Cached image upload completed:", results);

    res.json({
      success: true,
      message: "Cached image upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Cached image upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images from existing database URLs to Hostinger (OLD METHOD)
 */
export async function uploadAllImagesToHostinger(req: Request, res: Response) {
  try {
    console.log("🚀 Starting bulk upload to Hostinger...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const results = await hostingerService.uploadAllBusinessImages();

    console.log("✅ Bulk upload completed:", results);

    res.json({
      success: true,
      message: "Bulk upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload single business images from Google Places to Hostinger (NEW METHOD)
 */
export async function uploadBusinessGoogleToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const { businessId } = req.params;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID required" });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "Google Places API key not configured",
      });
    }

    console.log(
      `🔄 Uploading business ${businessId} from Google Places to Hostinger...`,
    );

    const { database } = await import("../database/database");
    const business = await database.get(
      "SELECT id, name, place_id, photo_reference, lat, lng, address FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googleFetcher = createSimpleGoogleImageFetcher(
      apiKey,
      hostingerService,
    );

    const result = await googleFetcher.processBusinessImages(business);

    // Update database
    if (result.logoUrl || result.photoUrls.length > 0) {
      const { BusinessService } = await import("../database/businessService");
      const businessService = new BusinessService(database);

      if (result.logoUrl) {
        await businessService.updateBusinessLogo(business.id, result.logoUrl);
      }

      if (result.photoUrls.length > 0) {
        await businessService.updateBusinessPhotos(
          business.id,
          result.photoUrls,
        );
      }
    }

    res.json({
      success: true,
      business: business.name,
      result,
    });
  } catch (error) {
    console.error("❌ Single business Google Places upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload single business images to Hostinger (OLD METHOD - from existing URLs)
 */
export async function uploadBusinessToHostinger(req: Request, res: Response) {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID required" });
    }

    console.log(`🔄 Uploading business ${businessId} to Hostinger...`);

    const { database } = await import("../database/database");
    const business = await database.get(
      "SELECT id, name, logo_url, photos_json FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const results: { logoUrl?: string; photoUrls?: string[] } = {};

    // Upload logo
    if (business.logo_url && business.logo_url.startsWith("http")) {
      const logoBuffer = await hostingerService.downloadImage(
        business.logo_url,
      );
      results.logoUrl = await hostingerService.uploadBusinessLogo(
        logoBuffer,
        business.id,
        business.logo_url,
      );
    }

    // Upload photos
    if (business.photos_json) {
      const photos = JSON.parse(business.photos_json);
      const validPhotos = photos
        .filter((photo: any) => photo.url && photo.url.startsWith("http"))
        .slice(0, 6);

      if (validPhotos.length > 0) {
        const imageBuffers = await Promise.all(
          validPhotos.map(async (photo: any) => ({
            buffer: await hostingerService.downloadImage(photo.url),
            originalUrl: photo.url,
          })),
        );

        results.photoUrls = await hostingerService.uploadBusinessPhotos(
          imageBuffers,
          business.id,
        );
      }
    }

    // Update database
    if (results.logoUrl || results.photoUrls) {
      const { BusinessService } = await import("../database/businessService");
      const businessService = new BusinessService(database);

      await businessService.updateBusinessS3Urls(
        business.id,
        results.logoUrl,
        results.photoUrls?.map((url) => ({ s3Url: url })),
      );
    }

    res.json({
      success: true,
      business: business.name,
      results,
    });
  } catch (error) {
    console.error("❌ Single business upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload businesses in batches of 50 using Real Google Places photos
 */
export async function uploadBatch50RealGooglePhotos(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    const { batchNumber = 1 } = req.body; // Default to batch 1 if not specified
    const batchSize = 50;
    const offset = (batchNumber - 1) * batchSize;

    console.log(
      `🚀 Starting batch ${batchNumber} (businesses ${offset + 1}-${offset + batchSize}) Real Google Places photo upload...`,
    );

    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);
    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const stepByStepService = new StepByStepGooglePhotos(apiKey);

    // Get 50 businesses for this batch, prioritizing those without logos
    const businesses = await database.all(
      `SELECT id, name, address FROM businesses
       ORDER BY CASE WHEN logo_s3_url IS NULL OR logo_s3_url = '' OR logo_s3_url LIKE '%s3.ap-south-1.amazonaws.com%' THEN 0 ELSE 1 END, id
       LIMIT ? OFFSET ?`,
      [batchSize, offset],
    );

    console.log(
      `📊 Found ${businesses.length} businesses in batch ${batchNumber}`,
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
        },
      });
    }

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      totalLogos: 0,
      totalPhotos: 0,
      errors: [] as string[],
      batchNumber,
      batchSize,
    };

    // Process businesses one by one
    for (const business of businesses) {
      try {
        console.log(
          `\n🔍 Processing ${results.processed + 1}/${businesses.length}: ${business.name}`,
        );
        results.processed++;

        // Execute complete step-by-step workflow
        const photoResult = await stepByStepService.getBusinessPhoto(
          business.name,
        );

        if (
          !photoResult.success ||
          (!photoResult.logoPath && !photoResult.businessPhotos?.length)
        ) {
          console.log(
            `❌ Step-by-step workflow failed for ${business.name}: ${photoResult.error}`,
          );
          results.failed++;
          results.errors.push(`${business.name}: ${photoResult.error}`);
          continue;
        }

        try {
          const fs = await import("fs");
          let logoUrl: string | undefined;
          const businessPhotoUrls: string[] = [];

          // Upload logo if available
          if (photoResult.logoPath) {
            console.log(`📋 Uploading logo for ${business.name}...`);
            const logoBuffer = fs.readFileSync(photoResult.logoPath);
            logoUrl = await hostingerService.uploadBusinessLogo(
              logoBuffer,
              business.id,
              photoResult.logoPath,
            );
            console.log(`✅ Logo uploaded: ${logoUrl}`);
            results.totalLogos++;
          }

          // Upload business photos if available
          if (photoResult.businessPhotos?.length > 0) {
            console.log(
              `📋 Uploading ${photoResult.businessPhotos.length} business photos for ${business.name}...`,
            );

            for (let i = 0; i < photoResult.businessPhotos.length; i++) {
              const photoPath = photoResult.businessPhotos[i];
              const photoBuffer = fs.readFileSync(photoPath);

              const photoUrl = await hostingerService.uploadBusinessPhoto(
                photoBuffer,
                business.id,
                `photo_${i + 1}`,
                photoPath,
              );
              businessPhotoUrls.push(photoUrl);
              console.log(`✅ Business photo ${i + 1} uploaded: ${photoUrl}`);
              results.totalPhotos++;
            }
          }

          // Save to database
          if (logoUrl) {
            await businessService.updateBusinessLogo(business.id, logoUrl);
          }

          if (businessPhotoUrls.length > 0) {
            await businessService.updateBusinessPhotos(
              business.id,
              businessPhotoUrls,
            );
          }

          // Cleanup temp files
          const allFiles = [
            photoResult.logoPath,
            ...(photoResult.businessPhotos || []),
          ].filter(Boolean);
          stepByStepService.cleanupFiles(allFiles);

          results.successful++;
          console.log(
            `✅ Successfully processed ${business.name}: Logo: ${logoUrl ? "Yes" : "No"}, Photos: ${businessPhotoUrls.length}`,
          );
        } catch (uploadError) {
          console.error(`❌ Upload error for ${business.name}:`, uploadError);
          results.failed++;
          results.errors.push(
            `${business.name}: Upload failed - ${uploadError.message}`,
          );
        }

        // Small delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Processing error for ${business.name}:`, error);
        results.failed++;
        results.errors.push(
          `${business.name}: Processing failed - ${error.message}`,
        );
      }
    }

    console.log(`\n✅ Batch ${batchNumber} completed:`, results);

    res.json({
      success: true,
      results,
      message: `Batch ${batchNumber} completed: ${results.successful}/${results.processed} businesses processed successfully`,
    });
  } catch (error) {
    console.error("❌ Batch upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Test Hostinger connection
 */
export async function testHostingerConnection(req: Request, res: Response) {
  try {
    const hostingerService = createHostingerService(HOSTINGER_CONFIG);

    // Test with a small dummy file
    const testBuffer = Buffer.from("Hostinger connection test");
    await hostingerService.uploadBusinessLogo(testBuffer, "test", "test.txt");

    res.json({
      success: true,
      message: "Hostinger connection successful",
      config: {
        host: HOSTINGER_CONFIG.host,
        user: HOSTINGER_CONFIG.user,
        baseUrl: HOSTINGER_CONFIG.baseUrl,
      },
    });
  } catch (error) {
    console.error("❌ Hostinger connection test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Please check your Hostinger FTP credentials",
    });
  }
}
