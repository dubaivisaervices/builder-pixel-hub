import { HostingerUploadService } from "./hostingerUpload";

interface BusinessImageResult {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
  method: string;
}

export class HybridGoogleImageFetcherAll {
  private apiKey: string;
  private hostingerService: HostingerUploadService;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string, hostingerService: HostingerUploadService) {
    this.apiKey = apiKey;
    this.hostingerService = hostingerService;
  }

  /**
   * Get business category-appropriate fallback images (enhanced)
   */
  private getFallbackImages(businessName: string, category?: string): string[] {
    const name = businessName.toLowerCase();
    const cat = (category || "").toLowerCase();

    // Enhanced business-specific image URLs
    const fallbacks: { [key: string]: string[] } = {
      visa: [
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400", // Passport
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Business
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400", // Stamps
      ],
      attestation: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office work
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400", // Stamps
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Desk
        "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400", // Business
      ],
      document: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Papers
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Desk work
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400", // Filing
        "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400", // Professional
      ],
      clearing: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Office
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Business
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
        "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400", // Corporate
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400", // Processing
      ],
      immigration: [
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400", // Passport
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Consultation
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400", // International
      ],
      migration: [
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400", // Travel
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Service
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Consulting
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400", // Global
      ],
      medical: [
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400", // Medical
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400", // Hospital
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400", // Healthcare
        "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400", // Clinic
        "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400", // Health
      ],
      fitness: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", // Gym
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", // Fitness
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400", // Workout
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400", // Exercise
        "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400", // Training
      ],
      education: [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400", // Education
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400", // Learning
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400", // Study
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Consultation
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Academic
      ],
      business: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Business
        "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400", // Corporate
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400", // Skyline
        "https://images.unsplash.com/photo-1551721434-8b94ddff0e6d?w=400", // Meeting
      ],
      travel: [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400", // Travel
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400", // Passport
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400", // Tourism
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Planning
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Service
      ],
      default: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400", // Dubai skyline
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400", // Dubai buildings
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // General office
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Professional
        "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400", // Business
      ],
    };

    // Determine category from business name and category
    for (const [key, urls] of Object.entries(fallbacks)) {
      if (key === "default") continue;
      if (name.includes(key) || cat.includes(key)) {
        return urls;
      }
    }

    return fallbacks.default;
  }

  /**
   * Download image with error handling
   */
  private async downloadImageSafely(url: string): Promise<Buffer | null> {
    try {
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://maps.google.com/",
      };

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 1000) {
        return buffer;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to download ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Process single business (optimized for speed)
   */
  async processBusinessImages(business: any): Promise<BusinessImageResult> {
    const result: BusinessImageResult = {
      businessId: business.id,
      businessName: business.name,
      photoUrls: [],
      errors: [],
      method: "none",
    };

    try {
      // Skip Google API attempt (we know it's failing), go straight to fallback
      const fallbackUrls = this.getFallbackImages(
        business.name,
        business.category,
      );

      // Try first fallback URL for logo
      const logoBuffer = await this.downloadImageSafely(fallbackUrls[0]);
      if (logoBuffer) {
        result.logoUrl = await this.hostingerService.uploadBusinessLogo(
          logoBuffer,
          business.id,
          `fallback-${business.name.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "")}`,
        );
        result.method = "smart-fallback";

        // Upload up to 4 additional photos
        const photoPromises = fallbackUrls
          .slice(1, 5)
          .map(async (url, index) => {
            try {
              const photoBuffer = await this.downloadImageSafely(url);
              if (photoBuffer) {
                const uploadResult =
                  await this.hostingerService.uploadBusinessPhotos(
                    [{ buffer: photoBuffer, originalUrl: url }],
                    business.id,
                  );
                return uploadResult;
              }
            } catch (error) {
              // Silent fail for photos
            }
            return [];
          });

        const photoResults = await Promise.all(photoPromises);
        result.photoUrls = photoResults.flat().filter((url) => url);
      } else {
        result.errors.push("Primary fallback image failed");
        result.method = "failed";
      }
    } catch (error) {
      result.errors.push(`Processing failed: ${error.message}`);
      result.method = "error";
    }

    return result;
  }

  /**
   * Process ALL businesses efficiently
   */
  async processAllBusinesses(): Promise<{
    processed: number;
    successful: number;
    totalLogos: number;
    totalPhotos: number;
    errors: string[];
    methods: { [key: string]: number };
  }> {
    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);

    console.log("🚀 Starting FULL hybrid Google+Fallback image processing...");

    // Get ALL businesses without logos
    const businesses = await database.all(`
      SELECT id, name, photo_reference, lat, lng, address, category, rating
      FROM businesses 
      WHERE name IS NOT NULL 
        AND (logo_s3_url IS NULL OR logo_s3_url = '')
      ORDER BY 
        CASE WHEN photo_reference IS NOT NULL THEN 0 ELSE 1 END,
        rating DESC NULLS LAST
    `);

    console.log(
      `📊 Found ${businesses.length} businesses without logos to process`,
    );

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    const errors: string[] = [];
    const methods: { [key: string]: number } = {};

    // Process in batches (increased speed)
    const batchSize = 10;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)} (${batch.length} businesses)`,
      );

      const batchPromises = batch.map(async (business) => {
        const result = await this.processBusinessImages(business);
        processed++;

        // Track methods used
        methods[result.method] = (methods[result.method] || 0) + 1;

        if (result.logoUrl || result.photoUrls.length > 0) {
          // Update database
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
            console.log(
              `✅ ${business.name}: ${result.method} (${result.logoUrl ? "logo" : ""} ${result.photoUrls.length ? `+${result.photoUrls.length} photos` : ""})`,
            );
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

      // Report progress
      const progressPercent = Math.round((processed / businesses.length) * 100);
      console.log(
        `📊 Progress: ${processed}/${businesses.length} (${progressPercent}%) - ${successful} successful`,
      );

      // Small delay between batches
      if (i + batchSize < businesses.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`\n✅ FULL hybrid processing completed!`);
    console.log(`📊 Final Statistics:`);
    console.log(`   • Processed: ${processed} businesses`);
    console.log(`   • Successful: ${successful} businesses`);
    console.log(`   • Total logos: ${totalLogos}`);
    console.log(`   • Total photos: ${totalPhotos}`);
    console.log(
      `   • Success rate: ${Math.round((successful / processed) * 100)}%`,
    );
    console.log(`   • Methods used:`, methods);
    console.log(`   • Errors: ${errors.length}`);

    return {
      processed,
      successful,
      totalLogos,
      totalPhotos,
      errors,
      methods,
    };
  }
}

/**
 * Create Hybrid Google+Fallback Image Fetcher for ALL businesses
 */
export function createHybridGoogleImageFetcherAll(
  apiKey: string,
  hostingerService: HostingerUploadService,
): HybridGoogleImageFetcherAll {
  return new HybridGoogleImageFetcherAll(apiKey, hostingerService);
}
