import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";

interface SyncResult {
  success: boolean;
  totalBusinesses: number;
  processedBusinesses: number;
  totalReviewsFetched: number;
  totalReviewsSaved: number;
  errors: string[];
  details: any[];
}

// Sync Google reviews for all businesses
export const syncAllGoogleReviews: RequestHandler = async (req, res) => {
  const startTime = Date.now();
  console.log("🚀 Starting comprehensive Google reviews sync...");

  const result: SyncResult = {
    success: false,
    totalBusinesses: 0,
    processedBusinesses: 0,
    totalReviewsFetched: 0,
    totalReviewsSaved: 0,
    errors: [],
    details: [],
  };

  try {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      throw new Error("Google Places API key not configured");
    }

    // Get all businesses from database
    const businesses = await businessService.getAllBusinesses();
    result.totalBusinesses = businesses.length;

    console.log(`📊 Found ${businesses.length} businesses to process`);

    // Process each business
    for (const business of businesses) {
      try {
        console.log(`🔍 Processing ${business.name} (${business.id})`);

        const businessResult = await fetchAndSaveGoogleReviews(business);
        result.processedBusinesses++;
        result.totalReviewsFetched += businessResult.reviewsFetched;
        result.totalReviewsSaved += businessResult.reviewsSaved;

        result.details.push({
          businessId: business.id,
          businessName: business.name,
          reviewsFetched: businessResult.reviewsFetched,
          reviewsSaved: businessResult.reviewsSaved,
          rating: businessResult.rating,
          success: businessResult.success,
          error: businessResult.error,
        });

        if (businessResult.error) {
          result.errors.push(`${business.name}: ${businessResult.error}`);
        }

        // Small delay to avoid hitting API rate limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        const errorMsg = `Error processing ${business.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    result.success = result.processedBusinesses > 0;

    console.log(`✅ Google reviews sync completed in ${duration}ms`);
    console.log(
      `📊 Results: ${result.processedBusinesses}/${result.totalBusinesses} businesses, ${result.totalReviewsSaved} reviews saved`,
    );

    res.json({
      ...result,
      duration: `${duration}ms`,
      summary: {
        successRate: `${Math.round((result.processedBusinesses / result.totalBusinesses) * 100)}%`,
        averageReviewsPerBusiness:
          result.processedBusinesses > 0
            ? Math.round(result.totalReviewsSaved / result.processedBusinesses)
            : 0,
        apiCallsUsed: result.processedBusinesses,
      },
    });
  } catch (error) {
    const errorMsg = `Google reviews sync failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    result.errors.push(errorMsg);
    console.error(errorMsg);

    res.status(500).json(result);
  }
};

// Fetch and save Google reviews for a single business
async function fetchAndSaveGoogleReviews(business: any) {
  const result = {
    success: false,
    reviewsFetched: 0,
    reviewsSaved: 0,
    rating: null as number | null,
    error: null as string | null,
  };

  try {
    if (!business.id || business.id.startsWith("sample")) {
      result.error = "No valid Google Place ID";
      return result;
    }

    console.log(`📍 Fetching Google reviews for: ${business.name}`);

    // Fetch from Google Places API with expanded fields
    const googleResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews,rating,user_ratings_total,name&key=${process.env.GOOGLE_PLACES_API_KEY}`,
    );

    if (!googleResponse.ok) {
      result.error = `Google API HTTP ${googleResponse.status}`;
      return result;
    }

    const googleData = await googleResponse.json();

    if (googleData.status !== "OK") {
      result.error = `Google API status: ${googleData.status}`;
      return result;
    }

    if (!googleData.result) {
      result.error = "No result from Google API";
      return result;
    }

    const googleResult = googleData.result;

    // Process reviews if available
    if (googleResult.reviews && googleResult.reviews.length > 0) {
      const googleReviews = googleResult.reviews.map(
        (review: any, index: number) => ({
          id: `google_${business.id}_${index}`,
          business_id: business.id,
          author_name: review.author_name,
          rating: review.rating,
          text: review.text || "No review text provided",
          time_ago: review.relative_time_description || "Recently",
          profile_photo_url:
            review.profile_photo_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=random`,
          created_at: new Date().toISOString(),
        }),
      );

      result.reviewsFetched = googleReviews.length;

      // Clear existing reviews and save new ones
      await businessService.clearBusinessReviews(business.id);
      await businessService.saveBusinessReviews(business.id, googleReviews);

      result.reviewsSaved = googleReviews.length;

      console.log(
        `💾 Saved ${googleReviews.length} reviews for ${business.name}`,
      );
    } else {
      console.log(`📝 No reviews found for ${business.name}`);
    }

    // Update business rating and review count
    if (googleResult.rating && googleResult.user_ratings_total) {
      await businessService.updateBusinessRating(
        business.id,
        googleResult.rating,
        googleResult.user_ratings_total,
      );

      result.rating = googleResult.rating;
      console.log(
        `📊 Updated ${business.name} rating: ${googleResult.rating} (${googleResult.user_ratings_total} total reviews)`,
      );
    }

    result.success = true;
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error fetching reviews for ${business.name}:`, error);
    return result;
  }
}

// Sync reviews for a specific business
export const syncBusinessReviews: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    console.log(`🔍 Syncing reviews for specific business: ${business.name}`);

    const result = await fetchAndSaveGoogleReviews(business);

    res.json({
      success: result.success,
      businessId: businessId,
      businessName: business.name,
      reviewsFetched: result.reviewsFetched,
      reviewsSaved: result.reviewsSaved,
      rating: result.rating,
      error: result.error,
    });
  } catch (error) {
    console.error("Error syncing business reviews:", error);
    res.status(500).json({
      error: "Failed to sync business reviews",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get sync statistics
export const getReviewSyncStats: RequestHandler = async (req, res) => {
  try {
    const stats = await businessService.getStats();

    // Count businesses with reviews
    const businessesWithReviews = stats.withReviews;
    const totalBusinesses = stats.total;

    res.json({
      totalBusinesses,
      businessesWithReviews,
      businessesWithoutReviews: totalBusinesses - businessesWithReviews,
      syncCoverage:
        totalBusinesses > 0
          ? Math.round((businessesWithReviews / totalBusinesses) * 100)
          : 0,
      lastSyncTime: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GOOGLE_PLACES_API_KEY,
    });
  } catch (error) {
    console.error("Error getting review sync stats:", error);
    res.status(500).json({
      error: "Failed to get sync statistics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
