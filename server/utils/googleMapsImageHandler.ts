import { EnhancedImageFetcher } from "./enhancedImageFetcher";

export class GoogleMapsImageHandler {
  /**
   * Handle Google Maps API images that require authentication
   */
  static async handleGoogleMapsImage(imageUrl: string): Promise<{
    success: boolean;
    buffer?: Buffer;
    contentType?: string;
    error?: string;
    shouldSkip?: boolean;
  }> {
    // Check if this is a Google Maps API URL that requires a key
    if (this.requiresGoogleMapsApiKey(imageUrl)) {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        return {
          success: false,
          shouldSkip: true,
          error:
            "Google Maps API URLs require API key - please configure GOOGLE_PLACES_API_KEY",
        };
      }

      // Add API key to the URL
      const authenticatedUrl = this.addApiKeyToUrl(imageUrl, apiKey);

      try {
        const result = await EnhancedImageFetcher.fetchImage(authenticatedUrl);
        return {
          success: result.success,
          buffer: result.buffer,
          contentType: result.contentType,
          error: result.error,
          shouldSkip: false,
        };
      } catch (error) {
        return {
          success: false,
          shouldSkip: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    // For other Google images, try the enhanced fetcher
    const result = await EnhancedImageFetcher.fetchImage(imageUrl);

    return {
      success: result.success,
      buffer: result.buffer,
      contentType: result.contentType,
      error: result.error,
      shouldSkip: false,
    };
  }

  /**
   * Check if URL requires Google Maps API key
   */
  private static requiresGoogleMapsApiKey(url: string): boolean {
    return (
      url.includes("maps.googleapis.com/maps/api/place/photo") ||
      url.includes("maps.googleapis.com/maps/api/streetview") ||
      (url.includes("maps.googleapis.com") && url.includes("key="))
    );
  }

  /**
   * Try to extract a usable image URL from Google Business data
   */
  static extractUsableImageUrl(originalUrl: string): string | null {
    try {
      // For Google user content URLs, ensure they don't have restrictive parameters
      if (originalUrl.includes("googleusercontent.com")) {
        // Remove size restrictions and get high-res version
        let cleanUrl = originalUrl.replace(/=s\d+(-c)?/g, "=s800");
        cleanUrl = cleanUrl.replace(/=w\d+-h\d+(-c)?/g, "");
        return cleanUrl;
      }

      // For other Google static content
      if (
        originalUrl.includes("gstatic.com") ||
        originalUrl.includes("ggpht.com")
      ) {
        return originalUrl;
      }

      // For Maps API URLs that require keys, return null (skip them)
      if (this.requiresGoogleMapsApiKey(originalUrl)) {
        return null;
      }

      return originalUrl;
    } catch {
      return null;
    }
  }

  /**
   * Get image statistics for reporting
   */
  static analyzeImageUrl(url: string): {
    type: "googleusercontent" | "maps_api" | "gstatic" | "other";
    requiresAuth: boolean;
    canDownload: boolean;
    optimizedUrl?: string;
  } {
    if (url.includes("googleusercontent.com")) {
      return {
        type: "googleusercontent",
        requiresAuth: false,
        canDownload: true,
        optimizedUrl: this.extractUsableImageUrl(url) || url,
      };
    }

    if (this.requiresGoogleMapsApiKey(url)) {
      return {
        type: "maps_api",
        requiresAuth: true,
        canDownload: false,
      };
    }

    if (url.includes("gstatic.com") || url.includes("ggpht.com")) {
      return {
        type: "gstatic",
        requiresAuth: false,
        canDownload: true,
      };
    }

    return {
      type: "other",
      requiresAuth: false,
      canDownload: true,
    };
  }
}
