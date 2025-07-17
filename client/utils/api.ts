/**
 * Environment-aware API utility
 * Handles both development (dynamic API) and production (static JSON) environments
 */

interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  fallback?: boolean;
}

class APIClient {
  private baseUrl: string;
  private isProduction: boolean;

  constructor() {
    // Detect environment
    this.isProduction =
      import.meta.env.PROD ||
      window.location.hostname.includes("netlify") ||
      window.location.hostname.includes("github.io") ||
      window.location.hostname.includes("vercel");

    this.baseUrl = this.isProduction ? "" : "";
    console.log(`🌐 API Client initialized - Production: ${this.isProduction}`);
  }

  private async fetchWithFallback<T>(
    primaryUrl: string,
    fallbackUrl?: string,
  ): Promise<APIResponse<T>> {
    try {
      // Try primary URL first
      console.log(`🔄 Fetching: ${primaryUrl}`);
      const response = await fetch(primaryUrl);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${primaryUrl}`);
        return { data, success: true };
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (primaryError) {
      console.warn(`⚠️ Primary API failed: ${primaryError.message}`);

      // Try fallback URL if provided
      if (fallbackUrl) {
        try {
          console.log(`🔄 Trying fallback: ${fallbackUrl}`);
          const fallbackResponse = await fetch(fallbackUrl);

          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            console.log(`✅ Fallback success: ${fallbackUrl}`);
            return { data, success: true, fallback: true };
          }
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback also failed: ${fallbackError.message}`);
        }
      }

      return {
        data: null as T,
        success: false,
        error: primaryError.message,
      };
    }
  }

  async getBusinesses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    city?: string;
  }): Promise<APIResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.search) queryParams.set("search", params.search);
    if (params?.category) queryParams.set("category", params.category);
    if (params?.city) queryParams.set("city", params.city);

    const queryString = queryParams.toString();
    const primary = `/api/dubai-visa-services${queryString ? `?${queryString}` : ""}`;
    const fallback = "/api/dubai-visa-services.json"; // Static file fallback

    const result = await this.fetchWithFallback<any[]>(primary, fallback);

    // Handle different response formats
    if (result.success && result.data) {
      let businesses = [];

      if (Array.isArray(result.data)) {
        businesses = result.data;
      } else if (
        result.data.businesses &&
        Array.isArray(result.data.businesses)
      ) {
        businesses = result.data.businesses;
      } else if (result.data.data && Array.isArray(result.data.data)) {
        businesses = result.data.data;
      }

      return { ...result, data: businesses };
    }

    return result;
  }

  async getStats(): Promise<APIResponse<any>> {
    const primary = "/api/stats";
    const fallback = "/api/stats.json";

    return this.fetchWithFallback(primary, fallback);
  }

  async getCategories(): Promise<APIResponse<string[]>> {
    const primary = "/api/categories";
    const fallback = "/api/categories.json";

    return this.fetchWithFallback(primary, fallback);
  }

  async getFeatured(): Promise<APIResponse<any[]>> {
    const primary = "/api/featured";
    const fallback = "/api/featured.json";

    return this.fetchWithFallback(primary, fallback);
  }

  async getCities(): Promise<APIResponse<string[]>> {
    const primary = "/api/cities";
    const fallback = "/api/cities.json";

    return this.fetchWithFallback(primary, fallback);
  }

  // Ultimate fallback data
  private getUltimateFallbackData() {
    return {
      businesses: [
        {
          id: "sample-1",
          name: "Dubai Visa Services Pro",
          rating: 4.5,
          reviewCount: 150,
          address: "Business Bay, Dubai, UAE",
          category: "visa services",
          logoUrl: "https://via.placeholder.com/100x100/0066cc/ffffff?text=DVS",
          photos: [],
        },
        {
          id: "sample-2",
          name: "Emirates Immigration Consultants",
          rating: 4.3,
          reviewCount: 89,
          address: "DIFC, Dubai, UAE",
          category: "immigration services",
          logoUrl: "https://via.placeholder.com/100x100/009900/ffffff?text=EIC",
          photos: [],
        },
        {
          id: "sample-3",
          name: "Al Barsha Document Clearing",
          rating: 4.1,
          reviewCount: 67,
          address: "Al Barsha, Dubai, UAE",
          category: "document clearing",
          logoUrl: "https://via.placeholder.com/100x100/cc6600/ffffff?text=ADC",
          photos: [],
        },
      ],
      stats: {
        totalBusinesses: 841,
        totalReviews: 306627,
        avgRating: 4.5,
        locations: 15,
        scamReports: 145,
      },
      categories: [
        "visa services",
        "immigration services",
        "document clearing",
        "attestation services",
        "business setup",
        "work permits",
      ],
      cities: [
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Ras Al Khaimah",
        "Fujairah",
        "Umm Al Quwain",
        "Al Ain",
      ],
    };
  }

  async getCompleteData(): Promise<{
    businesses: any[];
    stats: any;
    categories: string[];
    cities: string[];
    featured: any[];
  }> {
    try {
      console.log("🔄 Fetching complete data...");

      // Try to fetch all data in parallel
      const [
        businessesResult,
        statsResult,
        categoriesResult,
        citiesResult,
        featuredResult,
      ] = await Promise.allSettled([
        this.getBusinesses({ limit: 1000 }),
        this.getStats(),
        this.getCategories(),
        this.getCities(),
        this.getFeatured(),
      ]);

      const businesses =
        businessesResult.status === "fulfilled" &&
        businessesResult.value.success
          ? businessesResult.value.data
          : [];

      const stats =
        statsResult.status === "fulfilled" && statsResult.value.success
          ? statsResult.value.data
          : this.getUltimateFallbackData().stats;

      const categories =
        categoriesResult.status === "fulfilled" &&
        categoriesResult.value.success
          ? categoriesResult.value.data
          : this.getUltimateFallbackData().categories;

      const cities =
        citiesResult.status === "fulfilled" && citiesResult.value.success
          ? citiesResult.value.data
          : this.getUltimateFallbackData().cities;

      const featured =
        featuredResult.status === "fulfilled" && featuredResult.value.success
          ? featuredResult.value.data
          : businesses.slice(0, 6);

      // If we have no businesses, use fallback
      if (businesses.length === 0) {
        console.warn("⚠️ No businesses loaded, using fallback data");
        const fallback = this.getUltimateFallbackData();
        return {
          businesses: fallback.businesses,
          stats: fallback.stats,
          categories: fallback.categories,
          cities: fallback.cities,
          featured: fallback.businesses,
        };
      }

      console.log(`✅ Complete data loaded: ${businesses.length} businesses`);

      return {
        businesses,
        stats,
        categories,
        cities,
        featured,
      };
    } catch (error) {
      console.error("❌ Failed to fetch complete data:", error);
      const fallback = this.getUltimateFallbackData();
      return {
        businesses: fallback.businesses,
        stats: fallback.stats,
        categories: fallback.categories,
        cities: fallback.cities,
        featured: fallback.businesses,
      };
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
