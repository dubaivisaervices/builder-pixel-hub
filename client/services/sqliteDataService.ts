// SQLite Data Service for Report Visa Scam Platform
// Handles all database operations through API endpoints

export interface Business {
  id: string;
  name: string;
  address: string;
  category: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  businessStatus: string;
  logoUrl?: string;
  photos: string[];
  hasTargetKeyword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessesResponse {
  success: boolean;
  data: {
    businesses: Business[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      search: string;
      category: string;
      minRating: number;
    };
  };
}

export interface BusinessResponse {
  success: boolean;
  data: Business;
}

export interface Category {
  category: string;
  count: number;
}

export interface DatabaseStats {
  totalBusinesses: number;
  withKeywords: number;
  withLogos: number;
  withRatings: number;
  avgRating: number;
  maxRating: number;
  minRating: number;
  totalCategories: number;
  databasePath: string;
  lastUpdated: string;
}

class SQLiteDataService {
  private baseUrl: string;

  constructor() {
    // Use environment-appropriate base URL
    this.baseUrl =
      process.env.NODE_ENV === "production"
        ? "" // Use relative URLs in production
        : "http://localhost:3001"; // Development server
  }

  /**
   * Fetch businesses with pagination and filtering
   */
  async getBusinesses(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      minRating?: number;
    } = {},
  ): Promise<BusinessesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.category) queryParams.append("category", params.category);
      if (params.minRating)
        queryParams.append("minRating", params.minRating.toString());

      const response = await fetch(
        `${this.baseUrl}/api/sqlite/businesses?${queryParams}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching businesses:", error);
      throw new Error("Failed to fetch businesses from SQLite database");
    }
  }

  /**
   * Fetch single business by ID
   */
  async getBusiness(id: string): Promise<BusinessResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sqlite/business/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Business not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching business:", error);
      throw error;
    }
  }

  /**
   * Fetch all categories with counts
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sqlite/categories`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories from SQLite database");
    }
  }

  /**
   * Fetch database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sqlite/stats`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw new Error("Failed to fetch database statistics");
    }
  }

  /**
   * Check database health
   */
  async checkHealth(): Promise<{
    success: boolean;
    status: string;
    databaseConnected: boolean;
    businessCount: number;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sqlite/health`);
      return await response.json();
    } catch (error) {
      console.error("Error checking health:", error);
      return {
        success: false,
        status: "unhealthy",
        databaseConnected: false,
        businessCount: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Search businesses by keyword
   */
  async searchBusinesses(
    query: string,
    limit: number = 20,
  ): Promise<Business[]> {
    try {
      const response = await this.getBusinesses({
        search: query,
        limit,
        page: 1,
      });

      return response.data.businesses;
    } catch (error) {
      console.error("Error searching businesses:", error);
      return [];
    }
  }

  /**
   * Get businesses by category
   */
  async getBusinessesByCategory(
    category: string,
    limit: number = 50,
  ): Promise<Business[]> {
    try {
      const response = await this.getBusinesses({
        category,
        limit,
        page: 1,
      });

      return response.data.businesses;
    } catch (error) {
      console.error("Error fetching businesses by category:", error);
      return [];
    }
  }

  /**
   * Get top rated businesses
   */
  async getTopRatedBusinesses(limit: number = 20): Promise<Business[]> {
    try {
      const response = await this.getBusinesses({
        minRating: 4.0,
        limit,
        page: 1,
      });

      return response.data.businesses;
    } catch (error) {
      console.error("Error fetching top rated businesses:", error);
      return [];
    }
  }
}

// Export singleton instance
export const sqliteDataService = new SQLiteDataService();

// Export individual methods for convenience
export const {
  getBusinesses,
  getBusiness,
  getCategories,
  getStats,
  checkHealth,
  searchBusinesses,
  getBusinessesByCategory,
  getTopRatedBusinesses,
} = sqliteDataService;
