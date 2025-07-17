// Enhanced data loader for Report Visa Scam platform
// Handles static hosting, API fallbacks, and error recovery

interface BusinessData {
  id: string;
  name: string;
  address?: string;
  category?: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  businessStatus?: string;
  logoUrl?: string;
  photos?: string[];
  hasTargetKeyword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DataSource {
  businesses: BusinessData[];
  categories: string[];
  stats: {
    total: number;
    categoriesCount: number;
    exportDate: string;
    exportNote: string;
  };
  meta: {
    source: string;
    totalBusinesses: number;
    hasPhotos: number;
    hasLogos: number;
    exportTimestamp: number;
  };
}

class DataLoader {
  private static instance: DataLoader;
  private cachedData: DataSource | null = null;
  private isLoading = false;

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadBusinessData(): Promise<DataSource> {
    // Return cached data if available
    if (this.cachedData) {
      console.log(
        "📦 Using cached business data:",
        this.cachedData.businesses.length,
        "businesses",
      );
      return this.cachedData;
    }

    // Prevent multiple simultaneous loads
    if (this.isLoading) {
      console.log("⏳ Data loading in progress, waiting...");
      await this.waitForLoad();
      return this.cachedData!;
    }

    this.isLoading = true;
    console.log("🔄 Loading business data...");

    try {
      // Strategy 1: Try real businesses data first
      try {
        console.log("🔍 Loading real businesses data from complete file");

        const completeRes = await fetch("/api/complete-businesses.json");

        if (completeRes.ok) {
          const completeData = await completeRes.json();

          if (
            completeData.businesses &&
            Array.isArray(completeData.businesses) &&
            completeData.businesses.length > 0
          ) {
            console.log(
              `✅ Successfully loaded REAL data:`,
              completeData.businesses.length,
              "businesses",
            );

            this.cachedData = this.validateAndNormalizeData(completeData);
            this.isLoading = false;
            return this.cachedData;
          }
        }
      } catch (error) {
        console.log("❌ Failed to load real businesses data:", error.message);
      }

      // Strategy 2: Try existing static JSON files as fallback
      try {
        console.log("🔍 Loading static data from /api/ directory");

        const [businessesRes, statsRes, categoriesRes] = await Promise.all([
          fetch("/api/dubai-visa-services.json"),
          fetch("/api/stats.json"),
          fetch("/api/categories.json"),
        ]);

        if (businessesRes.ok && statsRes.ok) {
          const businesses = await businessesRes.json();
          const stats = await statsRes.json();
          const categories = categoriesRes.ok ? await categoriesRes.json() : [];

          if (Array.isArray(businesses) && businesses.length > 0) {
            console.log(
              `✅ Successfully loaded from /api/:`,
              businesses.length,
              "businesses",
            );

            const normalizedData = {
              businesses,
              categories,
              stats,
              meta: {
                source: "Static JSON",
                totalBusinesses: businesses.length,
                hasPhotos: businesses.filter(
                  (b: BusinessData) => b.photos && b.photos.length > 0,
                ).length,
                hasLogos: businesses.filter((b: BusinessData) => b.logoUrl)
                  .length,
                exportTimestamp: Date.now(),
              },
            };

            this.cachedData = this.validateAndNormalizeData(normalizedData);
            this.isLoading = false;
            return this.cachedData;
          }
        }
      } catch (error) {
        console.log("❌ Failed to load from /api/ directory:", error.message);
      }

      // Strategy 3: Try alternative static paths and API endpoints
      const apiPaths = [
        "/api/complete-businesses.json", // Real complete data file
        "/api/dubai-visa-services.json", // Our main static file
        "/api/featured.json", // Featured businesses
        "/api/dubai-visa-services?limit=1000", // API endpoint
        "/api/businesses",
        "/api/admin/businesses-all",
      ];

      for (const apiPath of apiPaths) {
        try {
          console.log(`🔍 Trying API path: ${apiPath}`);
          const response = await fetch(apiPath);

          if (response.ok) {
            const data = await response.json();
            if (
              data.businesses &&
              Array.isArray(data.businesses) &&
              data.businesses.length > 0
            ) {
              console.log(
                `✅ Successfully loaded from API ${apiPath}:`,
                data.businesses.length,
                "businesses",
              );

              // Convert API response to our expected format
              const normalizedData = {
                businesses: data.businesses,
                categories: data.categories || [],
                stats: {
                  total: data.total || data.businesses.length,
                  categoriesCount: data.categories?.length || 0,
                  exportDate: new Date().toISOString(),
                  exportNote: "Loaded from API",
                },
                meta: {
                  source: "API",
                  totalBusinesses: data.businesses.length,
                  hasPhotos: data.businesses.filter(
                    (b: BusinessData) => b.photos && b.photos.length > 0,
                  ).length,
                  hasLogos: data.businesses.filter(
                    (b: BusinessData) => b.logoUrl,
                  ).length,
                  exportTimestamp: Date.now(),
                },
              };

              this.cachedData = this.validateAndNormalizeData(normalizedData);
              this.isLoading = false;
              return this.cachedData;
            }
          }
        } catch (error) {
          console.log(`❌ Failed to load from API ${apiPath}:`, error.message);
        }
      }

      // Strategy 3: Return fallback data if everything fails
      console.log("⚠️ All data sources failed, using fallback data");
      this.cachedData = this.getFallbackData();
      this.isLoading = false;
      return this.cachedData;
    } catch (error) {
      console.error("💥 Critical error in data loading:", error);
      this.cachedData = this.getFallbackData();
      this.isLoading = false;
      return this.cachedData;
    }
  }

  private validateAndNormalizeData(data: any): DataSource {
    // Ensure all required fields are present
    const businesses = (data.businesses || []).map((business: any) => ({
      id: business.id || `fallback-${Date.now()}-${Math.random()}`,
      name: business.name || "Unknown Business",
      address: business.address || "",
      category: business.category || "General Services",
      phone: business.phone || "",
      website: business.website || "",
      email: business.email || "",
      rating: business.rating || 0,
      reviewCount: business.reviewCount || business.review_count || 0,
      latitude: business.latitude || business.lat || 0,
      longitude: business.longitude || business.lng || 0,
      businessStatus:
        business.businessStatus || business.business_status || "OPERATIONAL",
      logoUrl:
        business.logoUrl || business.logo_url || business.logo_s3_url || "",
      photos: business.photos || [],
      hasTargetKeyword:
        business.hasTargetKeyword || business.has_target_keyword || false,
      createdAt:
        business.createdAt || business.created_at || new Date().toISOString(),
      updatedAt:
        business.updatedAt || business.updated_at || new Date().toISOString(),
    }));

    return {
      businesses,
      categories: data.categories || [],
      stats: data.stats || {
        total: businesses.length,
        categoriesCount: data.categories?.length || 0,
        exportDate: new Date().toISOString(),
        exportNote: "Validated data",
      },
      meta: data.meta || {
        source: "Unknown",
        totalBusinesses: businesses.length,
        hasPhotos: 0,
        hasLogos: 0,
        exportTimestamp: Date.now(),
      },
    };
  }

  private getFallbackData(): DataSource {
    console.log("🔄 Generating fallback data for Report Visa Scam");

    const fallbackBusinesses: BusinessData[] = [
      {
        id: "fallback-1",
        name: "Dubai Visa Solutions",
        address: "Business Bay, Dubai, UAE",
        category: "Visa Services",
        phone: "+971 4 123 4567",
        website: "dubaivisasolutions.com",
        rating: 4.8,
        reviewCount: 156,
        hasTargetKeyword: true,
      },
      {
        id: "fallback-2",
        name: "Emirates Immigration Consultants",
        address: "DIFC, Dubai, UAE",
        category: "Immigration Services",
        phone: "+971 4 987 6543",
        website: "emiratesimmigration.ae",
        rating: 4.6,
        reviewCount: 89,
        hasTargetKeyword: true,
      },
      {
        id: "fallback-3",
        name: "Al Majid PRO Services",
        address: "Deira, Dubai, UAE",
        category: "PRO Services",
        phone: "+971 4 555 0123",
        rating: 4.5,
        reviewCount: 234,
        hasTargetKeyword: false,
      },
    ];

    return {
      businesses: fallbackBusinesses,
      categories: ["Visa Services", "Immigration Services", "PRO Services"],
      stats: {
        total: fallbackBusinesses.length,
        categoriesCount: 3,
        exportDate: new Date().toISOString(),
        exportNote: "Fallback data - connection issue detected",
      },
      meta: {
        source: "Fallback",
        totalBusinesses: fallbackBusinesses.length,
        hasPhotos: 0,
        hasLogos: 0,
        exportTimestamp: Date.now(),
      },
    };
  }

  private async waitForLoad(): Promise<void> {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();

    while (this.isLoading && Date.now() - startTime < maxWait) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cachedData = null;
    console.log("🗑️ Data cache cleared");
  }

  // Get current data status
  getStatus(): { loaded: boolean; count: number; source: string } {
    if (!this.cachedData) {
      return { loaded: false, count: 0, source: "none" };
    }

    return {
      loaded: true,
      count: this.cachedData.businesses.length,
      source: this.cachedData.meta.source,
    };
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();
export type { BusinessData, DataSource };
