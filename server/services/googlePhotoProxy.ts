import { HostingerUploadService } from "./hostingerUpload";

interface GooglePhotoResult {
  businessId: string;
  businessName: string;
  logoUrl?: string;
  photoUrls: string[];
  errors: string[];
}

export class GooglePhotoProxy {
  private apiKey: string;
  private hostingerService: HostingerUploadService;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string, hostingerService: HostingerUploadService) {
    this.apiKey = apiKey;
    this.hostingerService = hostingerService;
  }

  /**
   * Download photo through proper Google Places API with server-side proxy
   */
  async downloadGooglePhoto(
    photoReference: string,
    maxWidth: number = 800,
  ): Promise<Buffer> {
    try {
      // Use proper Google Places Photo API endpoint
      const photoUrl = `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;

      console.log(
        `🔄 Downloading photo: ${photoReference.substring(0, 20)}...`,
      );

      const response = await fetch(photoUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow", // Important: Google Photos API returns redirects
      });

      if (!response.ok) {
        throw new Error(
          `Google Photos API error: ${response.status} ${response.statusText}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error(`Not an image: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`✅ Downloaded photo: ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error(
        `❌ Failed to download photo ${photoReference}:`,
        error.message,
      );
      throw new Error(`Photo download failed: ${error.message}`);
    }
  }

  /**
   * Get fresh place details with photos from Google Places API
   */
  async getPlacePhotos(placeId: string): Promise<GooglePhotoResult> {
    const result: GooglePhotoResult = {
      businessId: placeId,
      businessName: "",
      photoUrls: [],
      errors: [],
    };

    try {
      // Get place details with photos
      const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,photos&key=${this.apiKey}`;

      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.status !== "OK" || !data.result) {
        throw new Error(
          `Places API error: ${data.status} - ${data.error_message || "Unknown error"}`,
        );
      }

      result.businessName = data.result.name || "Unknown Business";

      if (data.result.photos && data.result.photos.length > 0) {
        const photos = data.result.photos.slice(0, 7); // Max 7 photos (1 for logo + 6 for gallery)

        // Upload logo (first photo)
        try {
          const logoBuffer = await this.downloadGooglePhoto(
            photos[0].photo_reference,
            400,
          );
          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            logoBuffer,
            placeId,
            `google-photo-${photos[0].photo_reference}`,
          );
          console.log(`✅ Logo uploaded: ${result.logoUrl}`);
        } catch (error) {
          result.errors.push(`Logo upload failed: ${error.message}`);
        }

        // Upload additional photos
        if (photos.length > 1) {
          const additionalPhotos = photos.slice(1);
          const photoBuffers: Array<{ buffer: Buffer; originalUrl: string }> =
            [];

          for (const photo of additionalPhotos) {
            try {
              const buffer = await this.downloadGooglePhoto(
                photo.photo_reference,
                800,
              );
              photoBuffers.push({
                buffer,
                originalUrl: `google-photo-${photo.photo_reference}`,
              });
            } catch (error) {
              result.errors.push(`Photo download failed: ${error.message}`);
            }
          }

          if (photoBuffers.length > 0) {
            try {
              result.photoUrls =
                await this.hostingerService.uploadBusinessPhotos(
                  photoBuffers,
                  placeId,
                );
              console.log(`✅ ${result.photoUrls.length} photos uploaded`);
            } catch (error) {
              result.errors.push(`Batch photo upload failed: ${error.message}`);
            }
          }
        }
      } else {
        result.errors.push("No photos found for this place");
      }
    } catch (error) {
      result.errors.push(`Place details fetch failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Process business using existing photo_reference with proper proxy
   */
  async processBusinessWithPhotoReference(
    business: any,
  ): Promise<GooglePhotoResult> {
    const result: GooglePhotoResult = {
      businessId: business.id,
      businessName: business.name,
      photoUrls: [],
      errors: [],
    };

    try {
      console.log(`🔄 Processing ${business.name} with photo reference`);

      if (business.photo_reference) {
        try {
          // Download and upload logo using existing photo reference
          const logoBuffer = await this.downloadGooglePhoto(
            business.photo_reference,
            400,
          );
          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            logoBuffer,
            business.id,
            `existing-photo-${business.photo_reference}`,
          );
          console.log(
            `✅ Logo uploaded from existing reference: ${result.logoUrl}`,
          );
        } catch (error) {
          result.errors.push(
            `Logo from photo_reference failed: ${error.message}`,
          );
        }
      }

      // Try to get more photos using place_id if available
      if (business.place_id) {
        try {
          const placeResult = await this.getPlacePhotos(business.place_id);

          // If we didn't get a logo from photo_reference, use the one from place details
          if (!result.logoUrl && placeResult.logoUrl) {
            result.logoUrl = placeResult.logoUrl;
          }

          // Add additional photos
          result.photoUrls.push(...placeResult.photoUrls);
          result.errors.push(...placeResult.errors);
        } catch (error) {
          result.errors.push(`Place photos fetch failed: ${error.message}`);
        }
      }
    } catch (error) {
      result.errors.push(`Processing failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Search for business and get photos
   */
  async searchAndGetPhotos(
    businessName: string,
    location: string,
  ): Promise<GooglePhotoResult> {
    const result: GooglePhotoResult = {
      businessId: "search-result",
      businessName: businessName,
      photoUrls: [],
      errors: [],
    };

    try {
      // Search for the business
      const query = encodeURIComponent(`${businessName} ${location}`);
      const searchUrl = `${this.baseUrl}/textsearch/json?query=${query}&key=${this.apiKey}`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const place = data.results[0];
        result.businessId = place.place_id;

        // Get photos for the found place
        const photoResult = await this.getPlacePhotos(place.place_id);
        result.logoUrl = photoResult.logoUrl;
        result.photoUrls = photoResult.photoUrls;
        result.errors = photoResult.errors;
      } else {
        result.errors.push(`No search results found for ${businessName}`);
      }
    } catch (error) {
      result.errors.push(`Search failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Process all businesses with proper Google Photos proxy
   */
  async processAllBusinessesWithProxy(): Promise<{
    processed: number;
    successful: number;
    totalLogos: number;
    totalPhotos: number;
    errors: string[];
  }> {
    const { database } = await import("../database/database");
    const { BusinessService } = await import("../database/businessService");
    const businessService = new BusinessService(database);

    console.log("🚀 Starting Google Photos proxy upload to Hostinger...");

    // Get businesses with photo references or place IDs
    const businesses = await database.all(`
      SELECT id, name, photo_reference, lat, lng, address, category, rating
      FROM businesses 
      WHERE name IS NOT NULL 
        AND (photo_reference IS NOT NULL OR lat IS NOT NULL)
      ORDER BY rating DESC, has_target_keyword DESC
      LIMIT 50
    `);

    console.log(`📊 Found ${businesses.length} businesses to process`);

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    const errors: string[] = [];

    // Process in small batches to respect API limits
    const batchSize = 2; // Very small batches to avoid rate limits
    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(businesses.length / batchSize)}`,
      );

      for (const business of batch) {
        try {
          processed++;

          const result = await this.processBusinessWithPhotoReference(business);

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

          // Rate limiting: wait between each business
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          errors.push(`${business.name}: ${error.message}`);
          console.error(`❌ Error processing ${business.name}:`, error);
        }
      }

      // Additional delay between batches
      if (i + batchSize < businesses.length) {
        console.log("⏳ Waiting 5 seconds before next batch...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    console.log(`\n✅ Google Photos proxy upload completed!`);
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
 * Create Google Photo Proxy
 */
export function createGooglePhotoProxy(
  apiKey: string,
  hostingerService: HostingerUploadService,
): GooglePhotoProxy {
  return new GooglePhotoProxy(apiKey, hostingerService);
}
