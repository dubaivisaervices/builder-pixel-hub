import { HostingerUploadService } from "./hostingerUpload";

interface GooglePlacesPhoto {
  photo_reference: string;
  height: number;
  width: number;
}

interface GooglePlaceDetails {
  name: string;
  photos?: GooglePlacesPhoto[];
  icon?: string;
  place_id: string;
}

interface BusinessImageResult {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
}

export class GoogleImageFetcher {
  private apiKey: string;
  private hostingerService: HostingerUploadService;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string, hostingerService: HostingerUploadService) {
    this.apiKey = apiKey;
    this.hostingerService = hostingerService;
  }

  /**
   * Fetch place details from Google Places API
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,photos,icon,place_id&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result) {
        return data.result;
      } else {
        console.warn(
          `Failed to fetch place details for ${placeId}:`,
          data.status,
        );
        return null;
      }
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      return null;
    }
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

      // Method 1: Use place_id if available (skip since database doesn't have place_id)
      // Since our database doesn't have place_id, we'll start with photo_reference method

      // Method 2: Use existing photo_reference from database
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
            `✅ Logo uploaded from photo_reference: ${result.logoUrl}`,
          );
        } catch (error) {
          result.errors.push(
            `Logo from photo_reference failed: ${error.message}`,
          );
        }
      }

      // Method 3: Search by business name and location
      else {
        try {
          const searchResult = await this.searchBusinessByName(
            business.name,
            `${business.lat},${business.lng}`,
          );
          if (searchResult) {
            const placeDetails = await this.getPlaceDetails(
              searchResult.place_id,
            );

            if (placeDetails?.photos) {
              // Upload logo (first photo)
              if (placeDetails.photos.length > 0) {
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
              }

              // Upload additional photos
              const additionalPhotos = placeDetails.photos.slice(1, 7);
              if (additionalPhotos.length > 0) {
                const photoBuffers = await Promise.all(
                  additionalPhotos.map(async (photo) => ({
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
              }
            }
          } else {
            result.errors.push("No Google Places data found for this business");
          }
        } catch (error) {
          result.errors.push(`Search and upload failed: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Processing failed: ${error.message}`);
      console.error(`❌ Error processing ${business.name}:`, error);
    }

    return result;
  }

  /**
   * Search for business by name and location
   */
  async searchBusinessByName(name: string, location: string): Promise<any> {
    try {
      const query = encodeURIComponent(`${name} near ${location}`);
      const url = `${this.baseUrl}/textsearch/json?query=${query}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        return data.results[0]; // Return first result
      }
      return null;
    } catch (error) {
      console.error(`Error searching for business ${name}:`, error);
      return null;
    }
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

    console.log("🚀 Starting bulk Google Places image fetch and upload...");

    // Get all businesses from database
    const businesses = await database.all(`
            SELECT id, name, photo_reference, lat, lng, address, category, rating
      FROM businesses 
      WHERE name IS NOT NULL 
      ORDER BY rating DESC, has_target_keyword DESC
    `);

    console.log(`📊 Found ${businesses.length} businesses to process`);

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    const errors: string[] = [];

    // Process in batches to avoid overwhelming the APIs
    const batchSize = 5;
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
        console.log("⏳ Waiting 2 seconds before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n✅ Bulk processing completed!`);
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
 * Create Google Image Fetcher with Hostinger upload
 */
export function createGoogleImageFetcher(
  apiKey: string,
  hostingerService: HostingerUploadService,
): GoogleImageFetcher {
  return new GoogleImageFetcher(apiKey, hostingerService);
}
