// Enhanced photo fallback system for handling Google API failures
import { PhotoDownloader } from "./photoDownloader";
import { businessService } from "../database/businessService";

export interface PhotoFallbackOptions {
  retryAttempts: number;
  retryDelay: number;
  fallbackToCache: boolean;
  optimizeForMobile: boolean;
}

export interface PhotoStatus {
  hasLocal: boolean;
  hasRemote: boolean;
  lastDownloaded?: string;
  size?: number;
}

export class PhotoFallbackSystem {
  private static readonly DEFAULT_OPTIONS: PhotoFallbackOptions = {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackToCache: true,
    optimizeForMobile: false,
  };

  /**
   * Get photo with intelligent fallback strategy
   * 1. Try cached base64 first (instant, no API cost)
   * 2. If no cache, try Google API with retry logic
   * 3. If API fails, return placeholder or cached backup
   */
  static async getPhotoWithFallback(
    photoUrl: string,
    businessId: string,
    photoId?: string,
    options: Partial<PhotoFallbackOptions> = {},
  ): Promise<{
    success: boolean;
    base64?: string;
    source: "cache" | "api" | "placeholder" | "error";
    error?: string;
  }> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      // First check if we have this photo cached locally
      const cachedPhoto = await this.getCachedPhoto(businessId, photoId);
      if (cachedPhoto) {
        console.log(
          `📸 Photo served from CACHE (NO API COST) - Business: ${businessId}`,
        );
        return {
          success: true,
          base64: cachedPhoto,
          source: "cache",
        };
      }

      // Try to download from Google API with retry logic
      console.log(
        `📥 Downloading photo from Google API (COSTS MONEY) - Business: ${businessId}`,
      );
      const downloadResult = await this.downloadWithRetry(photoUrl, opts);

      if (downloadResult.success && downloadResult.base64) {
        // Save to cache for future use
        await this.cachePhoto(businessId, photoId, downloadResult.base64);
        console.log(`💾 Photo cached for business: ${businessId}`);

        return {
          success: true,
          base64: downloadResult.base64,
          source: "api",
        };
      }

      // If API fails and fallback is enabled, try to find any cached photo for this business
      if (opts.fallbackToCache) {
        const anyPhoto = await this.getAnyBusinessPhoto(businessId);
        if (anyPhoto) {
          console.log(
            `🔄 Fallback to existing cached photo - Business: ${businessId}`,
          );
          return {
            success: true,
            base64: anyPhoto,
            source: "cache",
          };
        }
      }

      // Last resort: return placeholder
      const placeholder = this.getPlaceholderImage();
      return {
        success: false,
        base64: placeholder,
        source: "placeholder",
        error: "Google API failed and no cached photos available",
      };
    } catch (error) {
      console.error(
        `❌ Photo fallback system error for business ${businessId}:`,
        error,
      );

      // Emergency fallback to any cached photo
      const emergencyPhoto = await this.getAnyBusinessPhoto(businessId);
      if (emergencyPhoto) {
        return {
          success: false,
          base64: emergencyPhoto,
          source: "cache",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }

      return {
        success: false,
        base64: this.getPlaceholderImage(),
        source: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Batch download photos with intelligent queuing and rate limiting
   */
  static async downloadBusinessPhotos(
    businessId: string,
    photoUrls: string[],
    options: Partial<PhotoFallbackOptions> = {},
  ): Promise<{
    success: number;
    failed: number;
    cached: number;
    results: Array<{
      id: number;
      base64?: string;
      cached: boolean;
      error?: string;
    }>;
  }> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const results = [];
    let successCount = 0;
    let failedCount = 0;
    let cachedCount = 0;

    console.log(
      `🔄 Processing ${photoUrls.length} photos for business: ${businessId}`,
    );

    for (let i = 0; i < photoUrls.length; i++) {
      const photoId = `photo_${i + 1}`;

      try {
        // Check cache first
        const cached = await this.getCachedPhoto(businessId, photoId);
        if (cached) {
          results.push({ id: i + 1, base64: cached, cached: true });
          cachedCount++;
          continue;
        }

        // Download with retry
        const result = await this.downloadWithRetry(photoUrls[i], opts);
        if (result.success && result.base64) {
          await this.cachePhoto(businessId, photoId, result.base64);
          results.push({ id: i + 1, base64: result.base64, cached: false });
          successCount++;
        } else {
          results.push({ id: i + 1, error: result.error, cached: false });
          failedCount++;
        }

        // Rate limiting to avoid overwhelming Google API
        if (i < photoUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } catch (error) {
        results.push({
          id: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
          cached: false,
        });
        failedCount++;
      }
    }

    console.log(
      `✅ Photo batch complete: ${successCount} downloaded, ${cachedCount} cached, ${failedCount} failed`,
    );

    return {
      success: successCount,
      failed: failedCount,
      cached: cachedCount,
      results,
    };
  }

  /**
   * Check photo availability status
   */
  static async getPhotoStatus(businessId: string): Promise<{
    totalPhotos: number;
    localPhotos: number;
    percentage: number;
    needsDownload: boolean;
    lastUpdated?: string;
  }> {
    try {
      const business = await businessService.getBusinessById(businessId);
      if (!business || !business.photos) {
        return {
          totalPhotos: 0,
          localPhotos: 0,
          percentage: 0,
          needsDownload: false,
        };
      }

      const totalPhotos = business.photos.length;
      const localPhotos = business.photos.filter(
        (photo) => photo.base64,
      ).length;
      const percentage =
        totalPhotos > 0 ? Math.round((localPhotos / totalPhotos) * 100) : 0;

      return {
        totalPhotos,
        localPhotos,
        percentage,
        needsDownload: percentage < 100,
        lastUpdated: business.photos.find((p) => p.base64)?.downloadedAt,
      };
    } catch (error) {
      console.error(
        `Error checking photo status for business ${businessId}:`,
        error,
      );
      return {
        totalPhotos: 0,
        localPhotos: 0,
        percentage: 0,
        needsDownload: false,
      };
    }
  }

  /**
   * Get cached photo from business data
   */
  private static async getCachedPhoto(
    businessId: string,
    photoId?: string,
  ): Promise<string | null> {
    try {
      const business = await businessService.getBusinessById(businessId);
      if (!business?.photos) return null;

      // If specific photo ID requested
      if (photoId) {
        const photo = business.photos.find((p) => `photo_${p.id}` === photoId);
        return photo?.base64 || null;
      }

      // Return first available cached photo
      const cachedPhoto = business.photos.find((photo) => photo.base64);
      return cachedPhoto?.base64 || null;
    } catch (error) {
      console.error(
        `Error getting cached photo for business ${businessId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Cache photo in business data
   */
  private static async cachePhoto(
    businessId: string,
    photoId: string | undefined,
    base64: string,
  ): Promise<void> {
    try {
      const business = await businessService.getBusinessById(businessId);
      if (!business) return;

      // Update existing photos with base64 data
      if (business.photos) {
        const photoIndex = photoId
          ? business.photos.findIndex((p) => `photo_${p.id}` === photoId)
          : 0;

        if (photoIndex >= 0 && photoIndex < business.photos.length) {
          business.photos[photoIndex] = {
            ...business.photos[photoIndex],
            base64,
            downloadedAt: new Date().toISOString(),
          };

          await businessService.upsertBusiness(business);
        }
      }
    } catch (error) {
      console.error(`Error caching photo for business ${businessId}:`, error);
    }
  }

  /**
   * Get any available photo for business (for fallback)
   */
  private static async getAnyBusinessPhoto(
    businessId: string,
  ): Promise<string | null> {
    try {
      const business = await businessService.getBusinessById(businessId);
      if (!business) return null;

      // Try logo first
      if (business.logoBase64) {
        return business.logoBase64;
      }

      // Try any cached photo
      if (business.photos) {
        const cachedPhoto = business.photos.find((photo) => photo.base64);
        if (cachedPhoto?.base64) {
          return cachedPhoto.base64;
        }
      }

      return null;
    } catch (error) {
      console.error(
        `Error getting any photo for business ${businessId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Download with retry logic
   */
  private static async downloadWithRetry(
    url: string,
    options: PhotoFallbackOptions,
  ): Promise<{ success: boolean; base64?: string; error?: string }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= options.retryAttempts; attempt++) {
      try {
        const result = await PhotoDownloader.downloadPhotoAsBase64(url);
        if (result.success) {
          return { success: true, base64: result.base64 };
        }
        lastError = new Error("Download failed without error");
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");
        console.log(
          `🔄 Retry ${attempt}/${options.retryAttempts} for photo download`,
        );

        if (attempt < options.retryAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, options.retryDelay * attempt),
          );
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Download failed after all retries",
    };
  }

  /**
   * Generate placeholder image as base64
   */
  private static getPlaceholderImage(): string {
    // Simple 1x1 pixel transparent PNG as base64
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  }

  /**
   * Clean up old cached photos to save database space
   */
  static async cleanupOldPhotos(daysOld: number = 30): Promise<{
    cleaned: number;
    spaceSaved: number;
  }> {
    try {
      const businesses = await businessService.getAllBusinesses();
      let cleanedCount = 0;
      let spaceSaved = 0;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      for (const business of businesses) {
        if (!business.photos) continue;

        let hasChanges = false;
        for (const photo of business.photos) {
          if (photo.base64 && photo.downloadedAt) {
            const downloadDate = new Date(photo.downloadedAt);
            if (downloadDate < cutoffDate) {
              spaceSaved += photo.base64.length;
              delete photo.base64;
              delete photo.downloadedAt;
              cleanedCount++;
              hasChanges = true;
            }
          }
        }

        if (hasChanges) {
          await businessService.upsertBusiness(business);
        }
      }

      console.log(
        `🧹 Cleaned ${cleanedCount} old photos, saved ${Math.round(spaceSaved / 1024 / 1024)}MB`,
      );

      return { cleaned: cleanedCount, spaceSaved };
    } catch (error) {
      console.error("Error cleaning up old photos:", error);
      return { cleaned: 0, spaceSaved: 0 };
    }
  }
}
