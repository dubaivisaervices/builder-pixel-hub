import fetch from "node-fetch";

interface ImageFetchResult {
  success: boolean;
  buffer?: Buffer;
  contentType?: string;
  error?: string;
}

export class EnhancedImageFetcher {
  private static readonly RETRY_ATTEMPTS = 3;
  private static readonly TIMEOUT = 10000; // 10 seconds

  /**
   * Enhanced image fetching with multiple strategies for Google Business URLs
   */
  static async fetchImage(imageUrl: string): Promise<ImageFetchResult> {
    // Strategy 1: Try with enhanced headers for Google services
    const result1 = await this.tryFetchWithGoogleHeaders(imageUrl);
    if (result1.success) return result1;

    // Strategy 2: Try with modified URL parameters
    const result2 = await this.tryFetchWithModifiedUrl(imageUrl);
    if (result2.success) return result2;

    // Strategy 3: Try with proxy-like headers
    const result3 = await this.tryFetchWithProxyHeaders(imageUrl);
    if (result3.success) return result3;

    // Strategy 4: Try without size restrictions for Google images
    const result4 = await this.tryFetchWithoutSizeParams(imageUrl);
    if (result4.success) return result4;

    return {
      success: false,
      error: `All fetch strategies failed for ${imageUrl}`,
    };
  }

  /**
   * Strategy 1: Enhanced headers specifically for Google services
   */
  private static async tryFetchWithGoogleHeaders(
    imageUrl: string,
  ): Promise<ImageFetchResult> {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "cross-site",
          "Sec-Ch-Ua":
            '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          Referer: "https://www.google.com/",
        },
        timeout: this.TIMEOUT,
      });

      if (response.ok) {
        const buffer = await response.buffer();
        const contentType =
          response.headers.get("content-type") || "image/jpeg";
        return { success: true, buffer, contentType };
      }

      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Strategy 2: Modify Google image URLs to remove size restrictions
   */
  private static async tryFetchWithModifiedUrl(
    imageUrl: string,
  ): Promise<ImageFetchResult> {
    try {
      let modifiedUrl = imageUrl;

      // For Google user content URLs, try removing size parameters
      if (imageUrl.includes("googleusercontent.com")) {
        // Remove size parameters like =s100-c, =w400-h300, etc.
        modifiedUrl = imageUrl.replace(/=s\d+(-c)?/g, "=s0");
        modifiedUrl = modifiedUrl.replace(/=w\d+-h\d+(-c)?/g, "");
        modifiedUrl = modifiedUrl.replace(/=s\d+/g, "");
      }

      // For Maps API URLs, try without size parameters
      if (imageUrl.includes("maps.googleapis.com")) {
        const url = new URL(imageUrl);
        url.searchParams.delete("maxwidth");
        url.searchParams.delete("maxheight");
        url.searchParams.set("maxwidth", "800");
        modifiedUrl = url.toString();
      }

      if (modifiedUrl !== imageUrl) {
        const response = await fetch(modifiedUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            Referer: "https://maps.google.com/",
          },
          timeout: this.TIMEOUT,
        });

        if (response.ok) {
          const buffer = await response.buffer();
          const contentType =
            response.headers.get("content-type") || "image/jpeg";
          return { success: true, buffer, contentType };
        }
      }

      return { success: false, error: "URL modification strategy failed" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Strategy 3: Try with proxy-like headers
   */
  private static async tryFetchWithProxyHeaders(
    imageUrl: string,
  ): Promise<ImageFetchResult> {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          "X-Forwarded-For": "66.249.66.1", // Google IP
        },
        timeout: this.TIMEOUT,
      });

      if (response.ok) {
        const buffer = await response.buffer();
        const contentType =
          response.headers.get("content-type") || "image/jpeg";
        return { success: true, buffer, contentType };
      }

      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Strategy 4: For Google images, try removing all size parameters
   */
  private static async tryFetchWithoutSizeParams(
    imageUrl: string,
  ): Promise<ImageFetchResult> {
    try {
      let baseUrl = imageUrl;

      // For Google images, get the base URL without any parameters
      if (
        imageUrl.includes("googleusercontent.com") ||
        imageUrl.includes("maps.googleapis.com")
      ) {
        const url = new URL(imageUrl);
        // Keep only essential parameters
        const essentialParams = ["key", "signature", "place_id"];
        const newSearchParams = new URLSearchParams();

        essentialParams.forEach((param) => {
          if (url.searchParams.has(param)) {
            newSearchParams.set(param, url.searchParams.get(param)!);
          }
        });

        url.search = newSearchParams.toString();
        baseUrl = url.toString();

        const response = await fetch(baseUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "image/*",
            Referer: "https://www.google.com/",
          },
          timeout: this.TIMEOUT,
        });

        if (response.ok) {
          const buffer = await response.buffer();
          const contentType =
            response.headers.get("content-type") || "image/jpeg";
          return { success: true, buffer, contentType };
        }
      }

      return { success: false, error: "No size parameters strategy failed" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if URL is likely a Google service URL
   */
  static isGoogleImageUrl(url: string): boolean {
    return (
      url.includes("googleusercontent.com") ||
      url.includes("maps.googleapis.com") ||
      url.includes("gstatic.com") ||
      url.includes("ggpht.com")
    );
  }

  /**
   * Get optimized image URL for Google services
   */
  static getOptimizedGoogleImageUrl(url: string, maxSize = 800): string {
    if (!this.isGoogleImageUrl(url)) return url;

    try {
      if (url.includes("googleusercontent.com")) {
        // For Google user content, use high quality size
        return url.replace(/=s\d+(-c)?/g, `=s${maxSize}`);
      }

      if (url.includes("maps.googleapis.com")) {
        const urlObj = new URL(url);
        urlObj.searchParams.set("maxwidth", maxSize.toString());
        urlObj.searchParams.set("maxheight", maxSize.toString());
        return urlObj.toString();
      }

      return url;
    } catch {
      return url;
    }
  }
}
