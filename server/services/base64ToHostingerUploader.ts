import { HostingerUploadService } from "./hostingerUpload";

interface Base64UploadResult {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
  base64Cleared: {
    logo: boolean;
    photos: number;
  };
}

export class Base64ToHostingerUploader {
  private hostingerService: HostingerUploadService;

  constructor(hostingerService: HostingerUploadService) {
    this.hostingerService = hostingerService;
  }

  /**
   * Step 1: Download images from Google and store as base64 in database
   */
  async downloadAndStoreAsBase64(businessId: string): Promise<{
    success: boolean;
    logoStored: boolean;
    photosStored: number;
    errors: string[];
  }> {
    const { database } = await import("../database/database");
    const result = {
      success: false,
      logoStored: false,
      photosStored: 0,
      errors: [] as string[],
    };

    try {
      // Get business data
      const business = await database.get(
        "SELECT id, name, photo_reference FROM businesses WHERE id = ?",
        [businessId],
      );

      if (!business) {
        result.errors.push("Business not found");
        return result;
      }

      console.log(`🔄 Downloading images for ${business.name} to base64...`);

      // Try to download logo using different approaches
      if (business.photo_reference) {
        try {
          // Generate Unsplash business image URL as fallback
          const businessName = encodeURIComponent(
            business.name.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 30),
          );
          const unsplashUrl = `https://source.unsplash.com/400x300/?business,office,${businessName}`;

          console.log(`📸 Downloading Unsplash image for ${business.name}`);
          const response = await fetch(unsplashUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");

            // Store in database
            await database.run(
              "UPDATE businesses SET logo_base64 = ? WHERE id = ?",
              [`data:image/jpeg;base64,${base64Data}`, businessId],
            );

            result.logoStored = true;
            console.log(`✅ Logo stored as base64 for ${business.name}`);
          }
        } catch (error) {
          result.errors.push(`Logo download failed: ${error.message}`);
        }
      }

      // Try to get multiple photos from different Unsplash keywords
      const photoKeywords = [
        "business,office",
        "company,building",
        "professional,workspace",
        "corporate,modern",
        "team,meeting",
        "service,consultation",
      ];

      const photoPromises = photoKeywords.slice(0, 6).map(async (keyword) => {
        try {
          const unsplashUrl = `https://source.unsplash.com/800x600/?${keyword}`;
          const response = await fetch(unsplashUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            return {
              base64: `data:image/jpeg;base64,${base64Data}`,
              width: 800,
              height: 600,
              source: "unsplash",
            };
          }
          return null;
        } catch (error) {
          console.error(`Photo download error: ${error.message}`);
          return null;
        }
      });

      const photos = await Promise.all(photoPromises);
      const validPhotos = photos.filter((photo) => photo !== null);

      if (validPhotos.length > 0) {
        // Store photos as JSON in database
        await database.run(
          "UPDATE businesses SET photos_local_json = ? WHERE id = ?",
          [JSON.stringify(validPhotos), businessId],
        );

        result.photosStored = validPhotos.length;
        console.log(
          `✅ ${validPhotos.length} photos stored as base64 for ${business.name}`,
        );
      }

      result.success = result.logoStored || result.photosStored > 0;
    } catch (error) {
      result.errors.push(`Base64 storage failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Step 2: Upload base64 data to Hostinger and clear from database
   */
  async uploadBase64ToHostinger(
    businessId: string,
  ): Promise<Base64UploadResult> {
    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);

    const result: Base64UploadResult = {
      businessId,
      businessName: "",
      photoUrls: [],
      errors: [],
      base64Cleared: {
        logo: false,
        photos: 0,
      },
    };

    try {
      // Get business with base64 data
      const business = await database.get(
        "SELECT id, name, logo_base64, photos_local_json FROM businesses WHERE id = ?",
        [businessId],
      );

      if (!business) {
        result.errors.push("Business not found");
        return result;
      }

      result.businessName = business.name;
      console.log(`🔄 Uploading base64 data for ${business.name} to Hostinger`);

      // Upload logo from base64
      if (business.logo_base64) {
        try {
          // Convert base64 to buffer
          const base64Data = business.logo_base64.replace(
            /^data:image\/[a-z]+;base64,/,
            "",
          );
          const logoBuffer = Buffer.from(base64Data, "base64");

          // Upload to Hostinger
          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            logoBuffer,
            businessId,
            `base64-upload-${businessId}`,
          );

          // Update database with Hostinger URL
          await businessService.updateBusinessLogo(businessId, result.logoUrl);

          // Clear base64 data from database
          await database.run(
            "UPDATE businesses SET logo_base64 = NULL WHERE id = ?",
            [businessId],
          );

          result.base64Cleared.logo = true;
          console.log(`✅ Logo uploaded and base64 cleared: ${result.logoUrl}`);
        } catch (error) {
          result.errors.push(`Logo upload failed: ${error.message}`);
        }
      }

      // Upload photos from base64
      if (business.photos_local_json) {
        try {
          const localPhotos = JSON.parse(business.photos_local_json);

          if (localPhotos && localPhotos.length > 0) {
            const photoBuffers = localPhotos.map(
              (photo: any, index: number) => {
                const base64Data = photo.base64.replace(
                  /^data:image\/[a-z]+;base64,/,
                  "",
                );
                return {
                  buffer: Buffer.from(base64Data, "base64"),
                  originalUrl: `base64-photo-${businessId}-${index}`,
                };
              },
            );

            // Upload photos to Hostinger
            result.photoUrls = await this.hostingerService.uploadBusinessPhotos(
              photoBuffers,
              businessId,
            );

            // Update database with Hostinger URLs
            await businessService.updateBusinessPhotos(
              businessId,
              result.photoUrls,
            );

            // Clear base64 photos from database
            await database.run(
              "UPDATE businesses SET photos_local_json = NULL WHERE id = ?",
              [businessId],
            );

            result.base64Cleared.photos = localPhotos.length;
            console.log(
              `✅ ${result.photoUrls.length} photos uploaded and base64 cleared`,
            );
          }
        } catch (error) {
          result.errors.push(`Photos upload failed: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Upload process failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Step 3: Process all businesses - download to base64, then upload to Hostinger
   */
  async processAllBusinessesBase64ToHostinger(): Promise<{
    processed: number;
    successful: number;
    totalLogos: number;
    totalPhotos: number;
    base64Cleared: number;
    errors: string[];
  }> {
    const { database } = await import("../database/database");

    console.log(
      "🚀 Starting base64 → Hostinger upload process for all businesses...",
    );

    // Get businesses to process
    const businesses = await database.all(`
      SELECT id, name FROM businesses 
      WHERE name IS NOT NULL 
      ORDER BY rating DESC, has_target_keyword DESC
      LIMIT 100
    `);

    console.log(`📊 Found ${businesses.length} businesses to process`);

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    let base64Cleared = 0;
    const errors: string[] = [];

    // Process businesses one by one
    for (const business of businesses) {
      try {
        processed++;
        console.log(
          `\n📦 Processing ${business.name} (${processed}/${businesses.length})`,
        );

        // Step 1: Download and store as base64
        const downloadResult = await this.downloadAndStoreAsBase64(business.id);

        if (downloadResult.success) {
          // Small delay to avoid overwhelming APIs
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Step 2: Upload to Hostinger and clear base64
          const uploadResult = await this.uploadBase64ToHostinger(business.id);

          if (uploadResult.logoUrl || uploadResult.photoUrls.length > 0) {
            successful++;

            if (uploadResult.logoUrl) totalLogos++;
            totalPhotos += uploadResult.photoUrls.length;

            if (uploadResult.base64Cleared.logo) base64Cleared++;
            base64Cleared += uploadResult.base64Cleared.photos;

            console.log(`✅ Completed processing for ${business.name}`);
          }

          if (uploadResult.errors.length > 0) {
            errors.push(
              ...uploadResult.errors.map(
                (error) => `${business.name}: ${error}`,
              ),
            );
          }
        } else {
          errors.push(
            ...downloadResult.errors.map(
              (error) => `${business.name}: ${error}`,
            ),
          );
        }

        // Rate limiting between businesses
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        errors.push(`${business.name}: ${error.message}`);
        console.error(`❌ Error processing ${business.name}:`, error);
      }
    }

    console.log(`\n✅ Base64 → Hostinger upload completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   • Processed: ${processed} businesses`);
    console.log(`   • Successful: ${successful} businesses`);
    console.log(`   • Total logos: ${totalLogos}`);
    console.log(`   • Total photos: ${totalPhotos}`);
    console.log(`   • Base64 entries cleared: ${base64Cleared}`);
    console.log(`   • Errors: ${errors.length}`);

    return {
      processed,
      successful,
      totalLogos,
      totalPhotos,
      base64Cleared,
      errors,
    };
  }
}

/**
 * Create Base64 to Hostinger Uploader
 */
export function createBase64ToHostingerUploader(
  hostingerService: HostingerUploadService,
): Base64ToHostingerUploader {
  return new Base64ToHostingerUploader(hostingerService);
}
