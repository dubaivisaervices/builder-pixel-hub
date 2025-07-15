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

export class ImprovedGoogleImageFetcher {
  private apiKey: string;
  private hostingerService: HostingerUploadService;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string, hostingerService: HostingerUploadService) {
    this.apiKey = apiKey;
    this.hostingerService = hostingerService;
  }

  /**
   * Download image with proper headers and error handling
   */
  private async downloadImageWithHeaders(url: string): Promise<Buffer> {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
      Referer: "https://maps.google.com/",
    };

    console.log(`🔄 Downloading image: ${url}`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ Downloaded image: ${buffer.length} bytes`);

    return buffer;
  }

  /**
   * Get Google Places text search results
   */
  async searchBusinessByNameAndLocation(
    name: string,
    location: string,
  ): Promise<GooglePlaceDetails | null> {
    try {
      const query = encodeURIComponent(`${name} ${location}`);
      const url = `${this.baseUrl}/textsearch/json?query=${query}&key=${this.apiKey}&fields=photos,name,place_id,icon`;

      console.log(`🔍 Searching Google Places: ${name} at ${location}`);

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];

        // Get detailed place information if we have a place_id
        if (result.place_id) {
          return await this.getPlaceDetails(result.place_id);
        }

        return result;
      } else {
        console.warn(`No results found for: ${name} at ${location}`);
        return null;
      }
    } catch (error) {
      console.error(`Error searching for ${name}:`, error);
      return null;
    }
  }

  /**
   * Get place details with photos
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
   * Try multiple methods to get a working photo URL
   */
  async downloadPhotoFromReference(
    photoReference: string,
    maxWidth: number = 800,
  ): Promise<Buffer> {
    const methods = [
      // Method 1: Standard photo API
      {
        name: "Standard API",
        url: `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`,
      },
      // Method 2: With referrer parameter
      {
        name: "With Referrer",
        url: `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}&referrer=https://maps.google.com`,
      },
      // Method 3: Different domain format
      {
        name: "Alternative Domain",
        url: `https://lh3.googleusercontent.com/places/${photoReference}=s${maxWidth}`,
      },
    ];

    for (const method of methods) {
      try {
        console.log(`🧪 Trying ${method.name}: ${method.url}`);
        const buffer = await this.downloadImageWithHeaders(method.url);

        // Validate the image
        if (buffer.length > 1000) {
          // Basic size check
          console.log(`✅ ${method.name} succeeded: ${buffer.length} bytes`);
          return buffer;
        }
      } catch (error) {
        console.warn(`❌ ${method.name} failed:`, error.message);
      }
    }

    throw new Error("All photo download methods failed");
  }

  /**
   * Process single business to get real Google images
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

      // Method 1: Try existing photo_reference from database
      if (business.photo_reference) {
        try {
          console.log(
            `📷 Trying existing photo reference: ${business.photo_reference.substring(0, 50)}...`,
          );
          const logoBuffer = await this.downloadPhotoFromReference(
            business.photo_reference,
            400,
          );

          result.logoUrl = await this.hostingerService.uploadBusinessLogo(
            logoBuffer,
            business.id,
            `google-photo-${business.photo_reference.substring(0, 20)}`,
          );

          console.log(
            `✅ Logo uploaded from existing reference: ${result.logoUrl}`,
          );
        } catch (error) {
          result.errors.push(
            `Existing photo reference failed: ${error.message}`,
          );
          console.warn(
            `❌ Existing photo reference failed for ${business.name}:`,
            error.message,
          );
        }
      }

      // Method 2: Search Google Places for new photos
      if (!result.logoUrl && business.lat && business.lng) {
        try {
          const location =
            business.address || `${business.lat},${business.lng}`;
          console.log(`🔍 Searching Google Places for: ${business.name}`);

          const placeDetails = await this.searchBusinessByNameAndLocation(
            business.name,
            location,
          );

          if (placeDetails?.photos && placeDetails.photos.length > 0) {
            console.log(
              `📷 Found ${placeDetails.photos.length} photos in Google Places`,
            );

            // Try to get logo from first photo
            if (!result.logoUrl) {
              try {
                const logoBuffer = await this.downloadPhotoFromReference(
                  placeDetails.photos[0].photo_reference,
                  400,
                );

                result.logoUrl = await this.hostingerService.uploadBusinessLogo(
                  logoBuffer,
                  business.id,
                  `google-search-${placeDetails.photos[0].photo_reference.substring(0, 20)}`,
                );

                console.log(`✅ Logo uploaded from search: ${result.logoUrl}`);
              } catch (error) {
                result.errors.push(`Logo from search failed: ${error.message}`);
              }
            }

            // Try to get additional photos
            const additionalPhotos = placeDetails.photos.slice(1, 6); // Max 5 additional photos
            if (additionalPhotos.length > 0) {
              console.log(
                `📷 Downloading ${additionalPhotos.length} additional photos`,
              );

              const photoBuffers = [];
              for (const photo of additionalPhotos) {
                try {
                  const buffer = await this.downloadPhotoFromReference(
                    photo.photo_reference,
                    800,
                  );
                  photoBuffers.push({
                    buffer,
                    originalUrl: `google-photo-${photo.photo_reference.substring(0, 20)}`,
                  });
                } catch (error) {
                  console.warn(`❌ Failed to download photo:`, error.message);
                }
              }

              if (photoBuffers.length > 0) {
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
            result.errors.push("No photos found in Google Places search");
          }
        } catch (error) {
          result.errors.push(`Google Places search failed: ${error.message}`);
        }
      }

      // If still no logo, add error
      if (!result.logoUrl && result.photoUrls.length === 0) {
        result.errors.push(
          "No images could be downloaded from Google Places API",
        );
      }
    } catch (error) {
      result.errors.push(`Processing failed: ${error.message}`);
      console.error(`❌ Error processing ${business.name}:`, error);
    }

    return result;
  }

  /**
   * Process all businesses with improved Google API integration
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

    console.log("🚀 Starting improved Google Places image fetch...");

    // Get businesses with location data
    const businesses = await database.all(`
      SELECT id, name, photo_reference, lat, lng, address, category, rating
      FROM businesses 
      WHERE name IS NOT NULL 
        AND (photo_reference IS NOT NULL OR (lat IS NOT NULL AND lng IS NOT NULL))
      ORDER BY 
        CASE WHEN photo_reference IS NOT NULL THEN 0 ELSE 1 END,
        rating DESC NULLS LAST
      LIMIT 20
    `);

    console.log(`📊 Found ${businesses.length} businesses to process`);

    let processed = 0;
    let successful = 0;
    let totalLogos = 0;
    let totalPhotos = 0;
    const errors: string[] = [];

    // Process one by one with delays to avoid rate limiting
    for (const business of businesses) {
      console.log(
        `\n📦 Processing ${processed + 1}/${businesses.length}: ${business.name}`,
      );

      try {
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

        // Rate limiting: wait 2 seconds between requests
        if (processed < businesses.length) {
          console.log("⏳ Waiting 2 seconds to avoid rate limiting...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        errors.push(`${business.name}: ${error.message}`);
        console.error(`❌ Failed to process ${business.name}:`, error.message);
        processed++;
      }
    }

    console.log(`\n✅ Improved Google Places processing completed!`);
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
 * Create Improved Google Image Fetcher
 */
export function createImprovedGoogleImageFetcher(
  apiKey: string,
  hostingerService: HostingerUploadService,
): ImprovedGoogleImageFetcher {
  return new ImprovedGoogleImageFetcher(apiKey, hostingerService);
}
