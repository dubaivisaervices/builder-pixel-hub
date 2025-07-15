import { HostingerUploadService } from "./hostingerUpload";

interface BusinessImageResult {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
  method: string;
}

export class HybridGoogleImageFetcher {
  private apiKey: string;
  private hostingerService: HostingerUploadService;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string, hostingerService: HostingerUploadService) {
    this.apiKey = apiKey;
    this.hostingerService = hostingerService;
  }

  /**
   * Get business category-appropriate fallback images
   */
  private getFallbackImages(businessName: string, category?: string): string[] {
    const name = businessName.toLowerCase();
    const cat = (category || "").toLowerCase();

    // Dubai business-specific image URLs that are more likely to work
    const fallbacks: { [key: string]: string[] } = {
      visa: [
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400", // Passport
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
      ],
      attestation: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Documents
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Office work
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400", // Stamps
      ],
      document: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Papers
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Desk work
      ],
      clearing: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Office
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Business
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
      ],
      medical: [
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400", // Medical
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400", // Hospital
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400", // Healthcare
      ],
      fitness: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", // Gym
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", // Fitness
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400", // Workout
      ],
      freelance: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Remote work
        "https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=400", // Business
      ],
      typing: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // Office
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", // Computer work
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", // Documents
      ],
      default: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400", // Dubai skyline
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400", // Dubai buildings
        "https://images.unsplash.com/photo-1580834259967-f0fe83d7a088?w=400", // UAE business
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", // General office
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
   * Try Google API first, fallback to business-appropriate images
   */
  async processBusinessImages(business: any): Promise<BusinessImageResult> {
    const result: BusinessImageResult = {
      businessId: business.id,
      businessName: business.name,
      photoUrls: [],
      errors: [],
      method: "none",
    };

    console.log(`🔄 Processing ${business.name} (Hybrid approach)`);

    // Method 1: Try Google Places Photo API (quick attempt)
    if (business.photo_reference) {
      try {
        const photoUrl = `${this.baseUrl}/photo?maxwidth=400&photo_reference=${business.photo_reference}&key=${this.apiKey}`;
        const buffer = await this.downloadImageSafely(photoUrl);

        if (buffer) {
          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            buffer,
            business.id,
            `google-${business.photo_reference.substring(0, 20)}`,
          );
          result.method = "google-api";
          console.log(`✅ Google API worked: ${result.logoUrl}`);
          return result;
        }
      } catch (error) {
        result.errors.push(`Google API failed: ${error.message}`);
      }
    }

    // Method 2: Smart fallback with business-appropriate images
    console.log(
      `📷 Google API failed, using smart fallback for ${business.name}`,
    );
    try {
      const fallbackUrls = this.getFallbackImages(
        business.name,
        business.category,
      );

      // Try each fallback URL until one works
      for (let i = 0; i < fallbackUrls.length; i++) {
        const url = fallbackUrls[i];
        try {
          const buffer = await this.downloadImageSafely(url);
          if (buffer) {
            result.logoUrl = await this.hostingerService.uploadBusinessLogo(
              buffer,
              business.id,
              `fallback-${i}-${business.name.substring(0, 20).replace(/[^a-zA-Z0-9]/g, "")}`,
            );
            result.method = "smart-fallback";
            console.log(`✅ Smart fallback worked: ${result.logoUrl}`);

            // Try to get additional photos from remaining URLs
            for (let j = i + 1; j < Math.min(fallbackUrls.length, i + 4); j++) {
              try {
                const photoBuffer = await this.downloadImageSafely(
                  fallbackUrls[j],
                );
                if (photoBuffer) {
                  const photoUrl =
                    await this.hostingerService.uploadBusinessPhotos(
                      [{ buffer: photoBuffer, originalUrl: fallbackUrls[j] }],
                      business.id,
                    );
                  result.photoUrls.push(...photoUrl);
                }
              } catch (error) {
                // Continue to next photo
              }
            }

            break; // Success, exit loop
          }
        } catch (error) {
          console.warn(`Fallback ${i} failed:`, error.message);
        }
      }

      if (!result.logoUrl) {
        result.errors.push("All fallback images failed");
        result.method = "all-failed";
      }
    } catch (error) {
      result.errors.push(`Fallback processing failed: ${error.message}`);
      result.method = "error";
    }

    return result;
  }

  /**
   * Process all businesses with hybrid approach
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

    console.log("🚀 Starting hybrid Google+Fallback image processing...");

    // Get businesses prioritizing those without logos
    const businesses = await database.all(`
      SELECT id, name, photo_reference, lat, lng, address, category, rating
      FROM businesses 
      WHERE name IS NOT NULL 
      ORDER BY 
        CASE WHEN logo_s3_url IS NULL THEN 0 ELSE 1 END,
        CASE WHEN photo_reference IS NOT NULL THEN 0 ELSE 1 END,
        rating DESC NULLS LAST
      LIMIT 50
    `);

    console.log(`📊 Found ${businesses.length} businesses to process`);

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    const errors: string[] = [];
    const methods: { [key: string]: number } = {};

    // Process in smaller batches
    const batchSize = 5;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)}`,
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
              `✅ ${business.name}: ${result.method} (${result.logoUrl ? "logo" : ""}${result.photoUrls.length ? ` +${result.photoUrls.length} photos` : ""})`,
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

      // Small delay between batches
      if (i + batchSize < businesses.length) {
        console.log("⏳ Waiting 1 second...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✅ Hybrid processing completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   • Processed: ${processed} businesses`);
    console.log(`   • Successful: ${successful} businesses`);
    console.log(`   • Total logos: ${totalLogos}`);
    console.log(`   • Total photos: ${totalPhotos}`);
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
 * Create Hybrid Google+Fallback Image Fetcher
 */
export function createHybridGoogleImageFetcher(
  apiKey: string,
  hostingerService: HostingerUploadService,
): HybridGoogleImageFetcher {
  return new HybridGoogleImageFetcher(apiKey, hostingerService);
}
