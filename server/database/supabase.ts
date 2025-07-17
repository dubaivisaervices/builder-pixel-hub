import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Database Types
export interface Business {
  id: string; // Google Place ID
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  lat: number;
  lng: number;
  rating: number;
  review_count: number;
  category: string;
  business_status: string;
  photo_reference?: string;
  photos?: string; // JSON array
  opening_hours?: string; // JSON object
  price_level?: number;
  logoUrl?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

class SupabaseService {
  private client: SupabaseClient;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
  }

  // Business operations
  async getAllBusinesses(limit = 1000, offset = 0) {
    try {
      const { data, error } = await this.client
        .from("businesses")
        .select("*")
        .order("rating", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching businesses:", error);
      return [];
    }
  }

  async getBusinessById(id: string) {
    try {
      const { data, error } = await this.client
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching business:", error);
      return null;
    }
  }

  async searchBusinesses(
    query: string,
    category?: string,
    city?: string,
    limit = 100,
  ) {
    try {
      let queryBuilder = this.client.from("businesses").select("*");

      if (query) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,address.ilike.%${query}%,category.ilike.%${query}%`,
        );
      }

      if (category) {
        queryBuilder = queryBuilder.ilike("category", `%${category}%`);
      }

      if (city) {
        queryBuilder = queryBuilder.ilike("address", `%${city}%`);
      }

      const { data, error } = await queryBuilder
        .order("rating", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching businesses:", error);
      return [];
    }
  }

  async upsertBusiness(business: Partial<Business>) {
    try {
      const { data, error } = await this.client.from("businesses").upsert({
        ...business,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error upserting business:", error);
      throw error;
    }
  }

  async batchUpsertBusinesses(businesses: Partial<Business>[]) {
    try {
      const timestamp = new Date().toISOString();
      const businessesWithTimestamp = businesses.map((business) => ({
        ...business,
        updated_at: timestamp,
        created_at: business.created_at || timestamp,
      }));

      const { data, error } = await this.client
        .from("businesses")
        .upsert(businessesWithTimestamp);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error batch upserting businesses:", error);
      throw error;
    }
  }

  async deleteBusiness(id: string) {
    try {
      const { error } = await this.client
        .from("businesses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting business:", error);
      return false;
    }
  }

  // Review operations
  async getBusinessReviews(businessId: string) {
    try {
      const { data, error } = await this.client
        .from("reviews")
        .select("*")
        .eq("business_id", businessId)
        .order("time", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }

  async upsertReview(review: Partial<Review>) {
    try {
      const { data, error } = await this.client.from("reviews").upsert({
        ...review,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error upserting review:", error);
      throw error;
    }
  }

  async batchUpsertReviews(reviews: Partial<Review>[]) {
    try {
      const timestamp = new Date().toISOString();
      const reviewsWithTimestamp = reviews.map((review) => ({
        ...review,
        created_at: timestamp,
      }));

      const { data, error } = await this.client
        .from("reviews")
        .upsert(reviewsWithTimestamp);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error batch upserting reviews:", error);
      throw error;
    }
  }

  // Statistics
  async getStats() {
    try {
      const [businessCount, avgRating, totalReviews] = await Promise.all([
        this.client.from("businesses").select("id", { count: "exact" }),
        this.client.from("businesses").select("rating"),
        this.client.from("businesses").select("review_count"),
      ]);

      const businesses = businessCount.data || [];
      const ratings = avgRating.data || [];
      const reviews = totalReviews.data || [];

      const stats = {
        total: businessCount.count || 0,
        avgRating:
          ratings.length > 0
            ? ratings.reduce((sum, b) => sum + (b.rating || 0), 0) /
              ratings.length
            : 0,
        totalReviews: reviews.reduce(
          (sum, b) => sum + (b.review_count || 0),
          0,
        ),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { total: 0, avgRating: 0, totalReviews: 0 };
    }
  }

  async getCategories() {
    try {
      const { data, error } = await this.client
        .from("businesses")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      const categories = [
        ...new Set(
          (data || [])
            .map((b) => b.category)
            .filter(Boolean)
            .map((c) => c.toLowerCase()),
        ),
      ].sort();

      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  // Health check
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from("businesses")
        .select("id")
        .limit(1);

      if (error) throw error;
      return { success: true, message: "Supabase connection successful" };
    } catch (error) {
      return {
        success: false,
        message: `Supabase connection failed: ${error.message}`,
      };
    }
  }
}

// Create singleton instance
let supabaseService: SupabaseService | null = null;

export function createSupabaseService(
  config?: SupabaseConfig,
): SupabaseService {
  if (!supabaseService) {
    const supabaseConfig = config || {
      url: process.env.SUPABASE_URL || "",
      anonKey: process.env.SUPABASE_ANON_KEY || "",
    };

    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      throw new Error("Supabase URL and ANON_KEY are required");
    }

    supabaseService = new SupabaseService(supabaseConfig);
  }

  return supabaseService;
}

export { SupabaseService };
