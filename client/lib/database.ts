// Database service for Neon PostgreSQL
// This replaces the JSON file approach with a proper database

export interface Business {
  id: string;
  name: string;
  address: string;
  category: string;
  phone: string;
  website: string;
  email: string;
  rating: number;
  review_count: number;
  latitude: number;
  longitude: number;
  business_status: string;
  logo_url: string;
  logo_s3_url: string;
  photos: string[];
  has_target_keyword: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessStats {
  total_businesses: number;
  total_reviews: number;
  avg_rating: number;
  total_locations: number;
  scam_reports: number;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  business_count: number;
}

class DatabaseService {
  private baseUrl: string;

  constructor() {
    // Use Netlify Functions or API endpoint
    this.baseUrl = "/api/database";
  }

  // Get all businesses with pagination
  async getBusinesses(
    page: number = 1,
    limit: number = 50,
    category?: string,
    search?: string,
  ): Promise<{
    businesses: Business[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category) params.append("category", category);
    if (search) params.append("search", search);

    const response = await fetch(`${this.baseUrl}/businesses?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch businesses: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all businesses (for initial load)
  async getAllBusinesses(): Promise<Business[]> {
    const response = await fetch(`${this.baseUrl}/businesses/all`);

    if (!response.ok) {
      throw new Error(`Failed to fetch all businesses: ${response.statusText}`);
    }

    const data = await response.json();
    return data.businesses || [];
  }

  // Get business by ID
  async getBusiness(id: string): Promise<Business | null> {
    const response = await fetch(`${this.baseUrl}/businesses/${id}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch business: ${response.statusText}`);
    }

    const data = await response.json();
    return data.business;
  }

  // Get business statistics
  async getStats(): Promise<BusinessStats> {
    const response = await fetch(`${this.baseUrl}/stats`);

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data.stats;
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${this.baseUrl}/categories`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const data = await response.json();
    return data.categories || [];
  }

  // Search businesses
  async searchBusinesses(
    query: string,
    filters?: {
      category?: string;
      minRating?: number;
      location?: string;
    },
  ): Promise<Business[]> {
    const params = new URLSearchParams({ search: query });

    if (filters?.category) params.append("category", filters.category);
    if (filters?.minRating)
      params.append("minRating", filters.minRating.toString());
    if (filters?.location) params.append("location", filters.location);

    const response = await fetch(`${this.baseUrl}/businesses/search?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to search businesses: ${response.statusText}`);
    }

    const data = await response.json();
    return data.businesses || [];
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.json();
    } catch (error) {
      return {
        status: "error",
        database: "disconnected",
      };
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Helper function for backward compatibility with existing code
export async function loadBusinessesFromDatabase(): Promise<Business[]> {
  try {
    return await databaseService.getAllBusinesses();
  } catch (error) {
    console.error("Failed to load from database:", error);
    return [];
  }
}

// Fallback function that tries database first, then JSON
export async function loadBusinessesWithFallback(): Promise<Business[]> {
  try {
    // Try database first
    const businesses = await databaseService.getAllBusinesses();
    if (businesses.length > 0) {
      console.log(
        `✅ Loaded ${businesses.length} businesses from Neon database`,
      );
      return businesses;
    }
  } catch (error) {
    console.warn("Database loading failed, falling back to JSON:", error);
  }

  // Fallback to JSON files
  try {
    const response = await fetch(
      `/api/complete-businesses.json?v=${Date.now()}`,
    );
    if (response.ok) {
      const data = await response.json();
      if (data.businesses && Array.isArray(data.businesses)) {
        console.log(
          `📄 Loaded ${data.businesses.length} businesses from JSON fallback`,
        );
        return data.businesses;
      }
    }
  } catch (error) {
    console.warn("JSON fallback also failed:", error);
  }

  // Final fallback to small dataset
  try {
    const response = await fetch(
      `/api/dubai-visa-services.json?v=${Date.now()}`,
    );
    if (response.ok) {
      const data = await response.json();
      const businesses = Array.isArray(data) ? data : data.businesses || [];
      console.log(
        `🔄 Loaded ${businesses.length} businesses from final fallback`,
      );
      return businesses;
    }
  } catch (error) {
    console.error("All data loading methods failed:", error);
  }

  return [];
}
