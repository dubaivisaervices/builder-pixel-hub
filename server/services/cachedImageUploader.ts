import { HostingerUploadService } from "./hostingerUpload";

interface CachedImageResult {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
}

export class CachedImageUploader {
  private hostingerService: HostingerUploadService;

  constructor(hostingerService: HostingerUploadService) {
    this.hostingerService = hostingerService;
  }

  /**
   * Convert base64 string to buffer
   */
  base64ToBuffer(base64String: string): Buffer {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
    return Buffer.from(base64Data, "base64");
  }

  /**
   * Process single business using cached data (base64 photos)
   */
  async processBusinessCachedImages(business: any): Promise<CachedImageResult> {
    const result: CachedImageResult = {
      businessId: business.id,
      businessName: business.name,
      photoUrls: [],
      errors: [],
    };

    try {
      console.log(
        `🔄 Processing cached images for ${business.name} (ID: ${business.id})`,
      );

      // Method 1: Use base64 logo if available
      if (business.logo_base64) {
        try {
          const logoBuffer = this.base64ToBuffer(business.logo_base64);
          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            logoBuffer,
            business.id,
            `base64-logo-${business.id}`,
          );
          console.log(`✅ Logo uploaded from base64: ${result.logoUrl}`);
        } catch (error) {
          result.errors.push(`Logo from base64 failed: ${error.message}`);
        }
      }

      // Method 2: Use cached photos (photos_local_json - base64 encoded)
      if (business.photos_local_json) {
        try {
          const localPhotos = JSON.parse(business.photos_local_json);

          if (localPhotos && localPhotos.length > 0) {
            const validPhotos = localPhotos
              .filter((photo: any) => photo.base64 && photo.base64.length > 100)
              .slice(0, 6); // Max 6 photos

            if (validPhotos.length > 0) {
              const photoBuffers = validPhotos.map(
                (photo: any, index: number) => ({
                  buffer: this.base64ToBuffer(photo.base64),
                  originalUrl: `cached-photo-${business.id}-${index}`,
                }),
              );

              result.photoUrls =
                await this.hostingerService.uploadBusinessPhotos(
                  photoBuffers,
                  business.id,
                );
              console.log(
                `✅ ${result.photoUrls.length} photos uploaded from cache`,
              );

              // If no logo yet, use first photo as logo
              if (!result.logoUrl && result.photoUrls.length > 0) {
                result.logoUrl = result.photoUrls[0].replace(
                  "/photos/",
                  "/logos/",
                );
                console.log(
                  `✅ Used first cached photo as logo: ${result.logoUrl}`,
                );
              }
            }
          }
        } catch (error) {
          result.errors.push(
            `Cached photos processing failed: ${error.message}`,
          );
        }
      }

      // Method 3: Use regular photos_json as fallback (non-base64)
      else if (
        business.photos_json &&
        (!result.logoUrl || result.photoUrls.length === 0)
      ) {
        try {
          const photos = JSON.parse(business.photos_json);

          if (photos && photos.length > 0) {
            // Create placeholder/default images from business info
            const businessInfo = {
              name: business.name,
              category: business.category || "Business",
              rating: business.rating || 0,
            };

            // Generate simple text-based logo
            if (!result.logoUrl) {
              const logoSvg = this.generateTextLogo(businessInfo);
              const logoBuffer = Buffer.from(logoSvg);

              result.logoUrl = await this.hostingerService.uploadBusinessLogo(
                logoBuffer,
                business.id,
                `text-logo-${business.id}.svg`,
              );
              console.log(`✅ Generated text logo: ${result.logoUrl}`);
            }
          }
        } catch (error) {
          result.errors.push(`Fallback processing failed: ${error.message}`);
        }
      }

      // Final fallback: Generate text-based logo if nothing worked
      if (!result.logoUrl) {
        try {
          const businessInfo = {
            name: business.name,
            category: business.category || "Business",
            rating: business.rating || 0,
          };

          const logoSvg = this.generateTextLogo(businessInfo);
          const logoBuffer = Buffer.from(logoSvg);

          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            logoBuffer,
            business.id,
            `fallback-logo-${business.id}.svg`,
          );
          console.log(`✅ Generated fallback text logo: ${result.logoUrl}`);
        } catch (error) {
          result.errors.push(
            `Fallback logo generation failed: ${error.message}`,
          );
        }
      }
    } catch (error) {
      result.errors.push(`Processing failed: ${error.message}`);
      console.error(`❌ Error processing ${business.name}:`, error);
    }

    return result;
  }

  /**
   * Generate a simple SVG text logo
   */
  generateTextLogo(businessInfo: {
    name: string;
    category: string;
    rating: number;
  }): string {
    const initials = businessInfo.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 3)
      .join("");

    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
      "#F97316",
      "#EC4899",
      "#6366F1",
    ];

    const colorIndex = businessInfo.name.length % colors.length;
    const bgColor = colors[colorIndex];

    return `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${bgColor}" rx="20"/>
        <text x="100" y="110" font-family="Arial, sans-serif" font-size="60" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
        <text x="100" y="150" font-family="Arial, sans-serif" font-size="14" 
              text-anchor="middle" fill="white" opacity="0.8">${businessInfo.category}</text>
        ${
          businessInfo.rating > 0
            ? `
          <text x="100" y="170" font-family="Arial, sans-serif" font-size="12" 
                text-anchor="middle" fill="white" opacity="0.9">★ ${businessInfo.rating}</text>
        `
            : ""
        }
      </svg>
    `.trim();
  }

  /**
   * Process all businesses using cached data
   */
  async processAllCachedBusinessImages(): Promise<{
    processed: number;
    successful: number;
    totalLogos: number;
    totalPhotos: number;
    errors: string[];
  }> {
    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);

    console.log("🚀 Starting cached image upload to Hostinger...");

    // Get businesses with cached data
    const businesses = await database.all(`
      SELECT id, name, category, rating, logo_base64, photos_local_json, photos_json
      FROM businesses 
      WHERE name IS NOT NULL 
        AND (logo_base64 IS NOT NULL 
             OR photos_local_json IS NOT NULL 
             OR photos_json IS NOT NULL)
      ORDER BY rating DESC, has_target_keyword DESC
      LIMIT 100
    `);

    console.log(
      `📊 Found ${businesses.length} businesses with cached data to process`,
    );

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    const errors: string[] = [];

    // Process in small batches
    const batchSize = 5;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)}`,
      );

      const batchPromises = batch.map(async (business) => {
        const result = await this.processBusinessCachedImages(business);
        processed++;

        if (result.logoUrl || result.photoUrls.length > 0) {
          // Update database with Hostinger URLs
          try {
            if (result.logoUrl) {
              await businessService.updateBusinessLogo(
                business.id,
                result.logoUrl,
              );
              totalLogos++;
            }

            if (result.photoUrls.length > 0) {
              await businessService.updateBusinessPhotos(
                business.id,
                result.photoUrls,
              );
              totalPhotos += result.photoUrls.length;
            }

            successful++;
            console.log(`✅ Updated database for ${business.name}`);
          } catch (dbError) {
            result.errors.push(`Database update failed: ${dbError.message}`);
          }
        }

        if (result.errors.length > 0) {
          errors.push(
            ...result.errors.map((error) => `${business.name}: ${error}`),
          );
        }

        return result;
      });

      await Promise.all(batchPromises);

      // Small delay between batches
      if (i + batchSize < businesses.length) {
        console.log("⏳ Waiting 1 second before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✅ Cached image upload completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   • Processed: ${processed} businesses`);
    console.log(`   • Successful: ${successful} businesses`);
    console.log(`   • Total logos: ${totalLogos}`);
    console.log(`   • Total photos: ${totalPhotos}`);
    console.log(`   • Errors: ${errors.length}`);

    return {
      processed,
      successful,
      totalLogos,
      totalPhotos,
      errors,
    };
  }
}

/**
 * Create Cached Image Uploader
 */
export function createCachedImageUploader(
  hostingerService: HostingerUploadService,
): CachedImageUploader {
  return new CachedImageUploader(hostingerService);
}
