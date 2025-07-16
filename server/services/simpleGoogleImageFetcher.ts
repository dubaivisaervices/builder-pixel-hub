import { HostingerUploadService } from "./hostingerUpload";

interface BusinessImageResult {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
}

export class SimpleGoogleImageFetcher {
  private apiKey: string;
  private hostingerService: HostingerUploadService;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string, hostingerService: HostingerUploadService) {
    this.apiKey = apiKey;
    this.hostingerService = hostingerService;
  }

  /**
   * Get photo URL from Google Places photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * Download image from Google Places photo reference
   */
  async downloadPhotoFromReference(
    photoReference: string,
    maxWidth: number = 800,
  ): Promise<Buffer> {
    const photoUrl = this.getPhotoUrl(photoReference, maxWidth);
    return await this.hostingerService.downloadImage(photoUrl);
  }

  /**
   * Search for business by name and location to get place details with photos
   */
  async searchBusinessForPhotos(name: string, location: string): Promise<any> {
    try {
      const query = encodeURIComponent(`${name} ${location}`);
      const url = `${this.baseUrl}/textsearch/json?query=${query}&key=${this.apiKey}&fields=photos,name,place_id`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const business = data.results[0];

        // Get detailed place information including photos
        if (business.place_id) {
          const detailsUrl = `${this.baseUrl}/details/json?place_id=${business.place_id}&fields=photos&key=${this.apiKey}`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          if (detailsData.status === "OK" && detailsData.result) {
            return detailsData.result;
          }
        }

        return business;
      }
      return null;
    } catch (error) {
      console.error(`Error searching for business ${name}:`, error);
      return null;
    }
  }

  /**
   * Process single business: fetch Google images and upload to Hostinger
   */
  async processBusinessImages(business: any): Promise<BusinessImageResult> {
    const result: BusinessImageResult = {
      businessId: business.id,
      businessName: business.name,
      photoUrls: [],
      errors: [],
    };

    try {
      console.log(`🔄 Processing ${business.name} (ID: ${business.id})`);

      // Method 1: Use existing photo_reference from database if available
      if (business.photo_reference) {
        try {
          const logoBuffer = await this.downloadPhotoFromReference(
            business.photo_reference,
            400,
          );
          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            logoBuffer,
            business.id,
            this.getPhotoUrl(business.photo_reference, 400),
          );
          console.log(
            `✅ Logo uploaded from existing photo_reference: ${result.logoUrl}`,
          );
        } catch (error) {
          result.errors.push(
            `Logo from photo_reference failed: ${error.message}`,
          );
        }
      }

      // Method 2: Search Google Places for additional photos
      if (business.lat && business.lng && business.address) {
        try {
          const location = `${business.address} ${business.lat},${business.lng}`;
          const placeDetails = await this.searchBusinessForPhotos(
            business.name,
            location,
          );

          if (placeDetails?.photos && placeDetails.photos.length > 0) {
            // If we don't have a logo yet, use first photo as logo
            if (!result.logoUrl && placeDetails.photos.length > 0) {
              try {
                const logoBuffer = await this.downloadPhotoFromReference(
                  placeDetails.photos[0].photo_reference,
                  400,
                );
                result.logoUrl = await this.hostingerService.uploadBusinessLogo(
                  logoBuffer,
                  business.id,
                  this.getPhotoUrl(placeDetails.photos[0].photo_reference, 400),
                );
                console.log(`✅ Logo uploaded from search: ${result.logoUrl}`);
              } catch (error) {
                result.errors.push(`Logo from search failed: ${error.message}`);
              }
            }

            // Upload additional photos (skip first one if used as logo)
            const photoStartIndex = result.logoUrl ? 1 : 0;
            const additionalPhotos = placeDetails.photos.slice(
              photoStartIndex,
              photoStartIndex + 6,
            ); // Max 6 photos

            if (additionalPhotos.length > 0) {
              try {
                const photoBuffers = await Promise.all(
                  additionalPhotos.map(async (photo: any) => ({
                    buffer: await this.downloadPhotoFromReference(
                      photo.photo_reference,
                      800,
                    ),
                    originalUrl: this.getPhotoUrl(photo.photo_reference, 800),
                  })),
                );

                result.photoUrls =
                  await this.hostingerService.uploadBusinessPhotos(
                    photoBuffers,
                    business.id,
                  );
                console.log(
                  `✅ ${result.photoUrls.length} photos uploaded from search`,
                );
              } catch (error) {
                result.errors.push(
                  `Photos from search failed: ${error.message}`,
                );
              }
            }
          } else {
            result.errors.push("No photos found in Google Places search");
          }
        } catch (error) {
          result.errors.push(`Google Places search failed: ${error.message}`);
        }
      } else {
        result.errors.push(
          "Insufficient location data for Google Places search",
        );
      }

      // Method 3: Fallback - if still no logo, try to get from any existing business photos
      if (!result.logoUrl && result.photoUrls.length > 0) {
        // Use first uploaded photo as logo
        result.logoUrl = result.photoUrls[0].replace("/photos/", "/logos/");
        console.log(`✅ Used first photo as logo: ${result.logoUrl}`);
      }
    } catch (error) {
      result.errors.push(`Processing failed: ${error.message}`);
      console.error(`❌ Error processing ${business.name}:`, error);
    }

    return result;
  }

  /**
   * Process all businesses in batches
   */
  async processAllBusinesses(): Promise<{
    processed: number;
    successful: number;
    totalLogos: number;
    totalPhotos: number;
    errors: string[];
  }> {
    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);

    console.log(
      "🚀 Starting simplified Google Places image fetch and upload...",
    );

    // Get all businesses from database (using existing schema)
    const businesses = await database.all(`
      SELECT id, name, photo_reference, lat, lng, address, category, rating
      FROM businesses 
      WHERE name IS NOT NULL 
        AND (lat IS NOT NULL AND lng IS NOT NULL)
      ORDER BY rating DESC, has_target_keyword DESC
      LIMIT 50
    `);

    console.log(`📊 Found ${businesses.length} businesses to process`);

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    const errors: string[] = [];

    // Process in smaller batches to avoid overwhelming APIs
    const batchSize = 3;
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)}`,
      );

      const batchPromises = batch.map(async (business) => {
        const result = await this.processBusinessImages(business);
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

      // Rate limiting delay between batches
      if (i + batchSize < businesses.length) {
        console.log("⏳ Waiting 3 seconds before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log(`\n✅ Simplified bulk processing completed!`);
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
 * Create Simple Google Image Fetcher
 */
export function createSimpleGoogleImageFetcher(
  apiKey: string,
  hostingerService: HostingerUploadService,
): SimpleGoogleImageFetcher {
  return new SimpleGoogleImageFetcher(apiKey, hostingerService);
}
