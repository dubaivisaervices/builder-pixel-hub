import { createSupabaseService, Business, Review } from "../database/supabase";

interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  business_status: string;
  photos?: Array<{
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
  price_level?: number;
}

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  website?: string;
  photos?: Array<{
    photo_reference: string;
  }>;
  reviews?: Array<{
    author_name: string;
    author_url?: string;
    profile_photo_url?: string;
    rating: number;
    text: string;
    time: number;
    relative_time_description: string;
  }>;
  opening_hours?: {
    open_now: boolean;
    periods: Array<any>;
    weekday_text: string[];
  };
  price_level?: number;
  business_status: string;
  types: string[];
}

export class GoogleToSupabaseService {
  private apiKey: string;
  private supabase: ReturnType<typeof createSupabaseService>;
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  constructor(apiKey: string, supabaseConfig?: any) {
    this.apiKey = apiKey;
    this.supabase = createSupabaseService(supabaseConfig);
  }

  // Search categories for Dubai visa/immigration businesses
  private readonly SEARCH_CATEGORIES = [
    '"visa services" Dubai UAE',
    '"immigration services" Dubai UAE',
    '"visa consultants" Dubai UAE',
    '"work permit" Dubai UAE',
    '"study abroad" Dubai UAE',
    '"document clearing" Dubai UAE',
    '"attestation services" Dubai UAE',
    '"PRO services" Dubai UAE',
    '"business visa" Dubai UAE',
    '"family visa" Dubai UAE',
    '"employment visa" Dubai UAE',
    '"residence visa" Dubai UAE',
    '"business setup" Dubai UAE',
    '"company formation" Dubai UAE',
    "visa agency Dubai UAE",
    "immigration consultants Dubai UAE",
    "travel agents Dubai UAE",
    "immigration lawyers Dubai UAE",
    "visa processing center Dubai UAE",
  ];

  // Search for businesses using Google Places API
  async searchBusinesses(query: string): Promise<GooglePlacesResult[]> {
    try {
      const url = `${this.baseUrl}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}`;

      console.log(`🔍 Searching Google Places: ${query}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "OK") {
        console.warn(`Google API warning for "${query}": ${data.status}`);
        return [];
      }

      return data.results || [];
    } catch (error) {
      console.error(`Error searching businesses for "${query}":`, error);
      return [];
    }
  }

  // Get detailed information for a specific place
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const fields = [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "rating",
        "user_ratings_total",
        "formatted_phone_number",
        "website",
        "photos",
        "reviews",
        "opening_hours",
        "price_level",
        "business_status",
        "types",
      ].join(",");

      const url = `${this.baseUrl}/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;

      console.log(`📍 Fetching details for place: ${placeId}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "OK" || !data.result) {
        console.warn(`No details found for place: ${placeId}`);
        return null;
      }

      return data.result;
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      return null;
    }
  }

  // Convert Google Place to Business format
  private convertToBusiness(place: GooglePlaceDetails): Business {
    const category = this.determineCategory(place.types, place.name);

    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || "",
      website: place.website || "",
      email: "", // Not available from Google Places
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating || 0,
      review_count: place.user_ratings_total || 0,
      category: category,
      business_status: place.business_status || "OPERATIONAL",
      photo_reference: place.photos?.[0]?.photo_reference || "",
      photos: JSON.stringify(
        place.photos?.map((p) => ({
          reference: p.photo_reference,
          url: `${this.baseUrl}/photo?photoreference=${p.photo_reference}&maxwidth=800&key=${this.apiKey}`,
        })) || [],
      ),
      opening_hours: place.opening_hours
        ? JSON.stringify(place.opening_hours)
        : "",
      price_level: place.price_level || null,
      logoUrl: place.photos?.[0]
        ? `${this.baseUrl}/photo?photoreference=${place.photos[0].photo_reference}&maxwidth=400&key=${this.apiKey}`
        : "",
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Determine business category from Google types and name
  private determineCategory(types: string[], name: string): string {
    const nameLC = name.toLowerCase();
    const typesStr = types.join(" ").toLowerCase();

    if (
      nameLC.includes("visa") ||
      nameLC.includes("immigration") ||
      typesStr.includes("travel_agency")
    ) {
      if (nameLC.includes("work") || nameLC.includes("employment")) {
        return "work visa services";
      } else if (nameLC.includes("student") || nameLC.includes("education")) {
        return "student visa services";
      } else if (nameLC.includes("family") || nameLC.includes("spouse")) {
        return "family visa services";
      } else if (nameLC.includes("business") || nameLC.includes("investor")) {
        return "business visa services";
      } else if (nameLC.includes("tourist") || nameLC.includes("visit")) {
        return "tourist visa services";
      } else {
        return "visa services";
      }
    }

    if (nameLC.includes("attestation") || nameLC.includes("certificate")) {
      return "attestation services";
    }

    if (nameLC.includes("document") || nameLC.includes("clearing")) {
      return "document clearing";
    }

    if (
      nameLC.includes("business setup") ||
      nameLC.includes("company formation")
    ) {
      return "business setup";
    }

    return "professional services";
  }

  // Convert Google Review to Review format
  private convertToReview(
    review: any,
    businessId: string,
    reviewId: string,
  ): Review {
    return {
      id: reviewId,
      business_id: businessId,
      author_name: review.author_name,
      author_url: review.author_url || "",
      profile_photo_url: review.profile_photo_url || "",
      rating: review.rating,
      text: review.text || "",
      time: review.time,
      relative_time_description: review.relative_time_description || "",
      created_at: new Date().toISOString(),
    };
  }

  // Fetch all businesses and store in Supabase
  async fetchAndStoreAllBusinesses(): Promise<{
    success: boolean;
    businessesCount: number;
    reviewsCount: number;
    errors: string[];
  }> {
    const results = {
      success: false,
      businessesCount: 0,
      reviewsCount: 0,
      errors: [] as string[],
    };

    try {
      console.log("🚀 Starting Google Places API data fetch to Supabase...");

      const allBusinesses: Business[] = [];
      const allReviews: Review[] = [];
      const processedPlaceIds = new Set<string>();

      // Search for businesses using all categories
      for (const query of this.SEARCH_CATEGORIES) {
        try {
          console.log(`🔍 Searching: ${query}`);
          const places = await this.searchBusinesses(query);

          for (const place of places) {
            if (processedPlaceIds.has(place.place_id)) {
              continue; // Skip duplicates
            }

            processedPlaceIds.add(place.place_id);

            // Get detailed information
            const details = await this.getPlaceDetails(place.place_id);
            if (!details) continue;

            // Convert to business format
            const business = this.convertToBusiness(details);
            allBusinesses.push(business);

            // Process reviews if available
            if (details.reviews && details.reviews.length > 0) {
              for (let i = 0; i < details.reviews.length; i++) {
                const review = details.reviews[i];
                const reviewId = `${place.place_id}_review_${i}`;
                const convertedReview = this.convertToReview(
                  review,
                  place.place_id,
                  reviewId,
                );
                allReviews.push(convertedReview);
              }
            }

            console.log(
              `✅ Processed: ${business.name} (${business.review_count} reviews)`,
            );

            // Add delay to respect API rate limits
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Add delay between category searches
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          const errorMsg = `Error searching category "${query}": ${error.message}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }

      console.log(`📊 Total unique businesses found: ${allBusinesses.length}`);
      console.log(`📊 Total reviews found: ${allReviews.length}`);

      // Store businesses in Supabase in batches
      if (allBusinesses.length > 0) {
        console.log("💾 Storing businesses in Supabase...");
        const batchSize = 100;

        for (let i = 0; i < allBusinesses.length; i += batchSize) {
          const batch = allBusinesses.slice(i, i + batchSize);
          try {
            await this.supabase.batchUpsertBusinesses(batch);
            console.log(
              `✅ Stored batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allBusinesses.length / batchSize)}`,
            );
          } catch (error) {
            const errorMsg = `Error storing business batch: ${error.message}`;
            console.error(errorMsg);
            results.errors.push(errorMsg);
          }
        }

        results.businessesCount = allBusinesses.length;
      }

      // Store reviews in Supabase in batches
      if (allReviews.length > 0) {
        console.log("💾 Storing reviews in Supabase...");
        const batchSize = 200;

        for (let i = 0; i < allReviews.length; i += batchSize) {
          const batch = allReviews.slice(i, i + batchSize);
          try {
            await this.supabase.batchUpsertReviews(batch);
            console.log(
              `✅ Stored review batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allReviews.length / batchSize)}`,
            );
          } catch (error) {
            const errorMsg = `Error storing review batch: ${error.message}`;
            console.error(errorMsg);
            results.errors.push(errorMsg);
          }
        }

        results.reviewsCount = allReviews.length;
      }

      results.success = true;
      console.log(
        `🎉 Successfully stored ${results.businessesCount} businesses and ${results.reviewsCount} reviews in Supabase!`,
      );

      return results;
    } catch (error) {
      const errorMsg = `Fatal error in fetchAndStoreAllBusinesses: ${error.message}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
      return results;
    }
  }

  // Test connection to both Google API and Supabase
  async testConnections(): Promise<{
    googleApi: boolean;
    supabase: boolean;
    errors: string[];
  }> {
    const results = {
      googleApi: false,
      supabase: false,
      errors: [] as string[],
    };

    // Test Google API
    try {
      const testResults = await this.searchBusinesses("Dubai visa services");
      results.googleApi = testResults.length > 0;
      if (!results.googleApi) {
        results.errors.push("Google API returned no results");
      }
    } catch (error) {
      results.errors.push(`Google API error: ${error.message}`);
    }

    // Test Supabase
    try {
      const connectionTest = await this.supabase.testConnection();
      results.supabase = connectionTest.success;
      if (!results.supabase) {
        results.errors.push(connectionTest.message);
      }
    } catch (error) {
      results.errors.push(`Supabase error: ${error.message}`);
    }

    return results;
  }
}

export function createGoogleToSupabaseService(
  apiKey?: string,
  supabaseConfig?: any,
): GoogleToSupabaseService {
  const googleApiKey = apiKey || process.env.GOOGLE_PLACES_API_KEY;

  if (!googleApiKey) {
    throw new Error("Google Places API key is required");
  }

  return new GoogleToSupabaseService(googleApiKey, supabaseConfig);
}
