// Google API Connection Manager - Enable/Disable API calls
import { businessService } from "../database/businessService";

interface ApiStatus {
  enabled: boolean;
  lastToggled: string;
  reason?: string;
  callsMade: number;
  cacheHits: number;
}

class GoogleApiManager {
  private static instance: GoogleApiManager;
  private apiStatus: ApiStatus = {
    enabled: true,
    lastToggled: new Date().toISOString(),
    callsMade: 0,
    cacheHits: 0,
  };

  static getInstance(): GoogleApiManager {
    if (!GoogleApiManager.instance) {
      GoogleApiManager.instance = new GoogleApiManager();
    }
    return GoogleApiManager.instance;
  }

  /**
   * Check if Google API calls are enabled
   */
  isApiEnabled(): boolean {
    return this.apiStatus.enabled;
  }

  /**
   * Enable Google API calls
   */
  enableApi(reason?: string): ApiStatus {
    console.log("🟢 GOOGLE API ENABLED" + (reason ? ` - ${reason}` : ""));

    this.apiStatus = {
      ...this.apiStatus,
      enabled: true,
      lastToggled: new Date().toISOString(),
      reason: reason || "Manually enabled",
    };

    return this.apiStatus;
  }

  /**
   * Disable Google API calls (force cache-only mode)
   */
  disableApi(reason?: string): ApiStatus {
    console.log("🔴 GOOGLE API DISABLED" + (reason ? ` - ${reason}` : ""));
    console.log("💡 System will now use CACHE-ONLY mode (NO API COSTS)");

    this.apiStatus = {
      ...this.apiStatus,
      enabled: false,
      lastToggled: new Date().toISOString(),
      reason: reason || "Manually disabled",
    };

    return this.apiStatus;
  }

  /**
   * Get current API status
   */
  getStatus(): ApiStatus & {
    costSavings: string;
    mode: string;
  } {
    const totalRequests = this.apiStatus.callsMade + this.apiStatus.cacheHits;
    const cacheRatio =
      totalRequests > 0
        ? Math.round((this.apiStatus.cacheHits / totalRequests) * 100)
        : 0;

    return {
      ...this.apiStatus,
      costSavings: `${cacheRatio}% requests served from cache`,
      mode: this.apiStatus.enabled ? "LIVE API + CACHE" : "CACHE ONLY",
    };
  }

  /**
   * Record an API call
   */
  recordApiCall(): void {
    this.apiStatus.callsMade++;
    console.log(
      `💰 API CALL MADE (Total: ${this.apiStatus.callsMade}) - THIS COSTS MONEY`,
    );
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(): void {
    this.apiStatus.cacheHits++;
    console.log(`💾 CACHE HIT (Total: ${this.apiStatus.cacheHits}) - NO COST`);
  }

  /**
   * Reset counters
   */
  resetCounters(): void {
    this.apiStatus.callsMade = 0;
    this.apiStatus.cacheHits = 0;
    console.log("🔄 API call counters reset");
  }

  /**
   * Decide whether to make an API call or use cache
   */
  async shouldMakeApiCall(
    businessId: string,
    operationType: "reviews" | "photos" | "details",
  ): Promise<{
    allowed: boolean;
    reason: string;
    useCache: boolean;
  }> {
    // If API is disabled, always use cache
    if (!this.apiStatus.enabled) {
      this.recordCacheHit();
      return {
        allowed: false,
        reason: "API disabled - using cache only mode",
        useCache: true,
      };
    }

    // Check if we have cached data first
    const hasCachedData = await this.checkCachedData(businessId, operationType);

    if (hasCachedData) {
      this.recordCacheHit();
      return {
        allowed: false, // Don't make API call if we have cache
        reason: "Cached data available - saving API costs",
        useCache: true,
      };
    }

    // API is enabled and no cache - make the call
    this.recordApiCall();
    return {
      allowed: true,
      reason: "No cached data - making API call",
      useCache: false,
    };
  }

  /**
   * Check if cached data exists for a business
   */
  private async checkCachedData(
    businessId: string,
    operationType: "reviews" | "photos" | "details",
  ): Promise<boolean> {
    try {
      const business = await businessService.getBusinessById(businessId);
      if (!business) return false;

      switch (operationType) {
        case "reviews":
          const reviews = await businessService.getBusinessReviews(businessId);
          return reviews && reviews.length > 0;

        case "photos":
          return (
            business.photos &&
            business.photos.length > 0 &&
            business.photos.some((photo) => photo.base64)
          );

        case "details":
          return business.name && business.address && business.rating;

        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking cached data:", error);
      return false;
    }
  }

  /**
   * Force an emergency API call even if disabled (for critical operations)
   */
  forceApiCall(reason: string): void {
    console.log(`🚨 EMERGENCY API CALL FORCED - ${reason}`);
    this.recordApiCall();
  }

  /**
   * Get cost savings report
   */
  getCostReport(): {
    totalRequests: number;
    apiCalls: number;
    cacheHits: number;
    costSavingsPercentage: number;
    estimatedSavings: string;
    status: string;
  } {
    const totalRequests = this.apiStatus.callsMade + this.apiStatus.cacheHits;
    const costSavingsPercentage =
      totalRequests > 0
        ? Math.round((this.apiStatus.cacheHits / totalRequests) * 100)
        : 0;

    // Rough estimate: Google Places API costs around $0.017 per request
    const estimatedApiCost = this.apiStatus.callsMade * 0.017;
    const estimatedSavings = (this.apiStatus.cacheHits * 0.017).toFixed(2);

    return {
      totalRequests,
      apiCalls: this.apiStatus.callsMade,
      cacheHits: this.apiStatus.cacheHits,
      costSavingsPercentage,
      estimatedSavings: `$${estimatedSavings} USD saved`,
      status: this.apiStatus.enabled ? "API ACTIVE" : "API DISABLED",
    };
  }
}

export const googleApiManager = GoogleApiManager.getInstance();
