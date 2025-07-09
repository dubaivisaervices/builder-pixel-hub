import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";

// Get ONLY real reviews for a specific business - NO FAKE REVIEWS, MAX 30
export const getBusinessReviews: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    console.log(`🔍 Fetching ONLY REAL reviews for business: ${businessId}`);

    // First try to get real reviews from database
    const dbReviews = await businessService.getBusinessReviews(businessId);
    if (dbReviews && dbReviews.length > 0) {
      // Filter to keep only real reviews (not generated ones)
      const realDbReviews = dbReviews
        .filter(
          (review) =>
            review.isReal !== false &&
            !review.id?.startsWith("fallback_") &&
            !review.id?.startsWith("supplement_") &&
            !review.id?.startsWith("local_"),
        )
        .slice(0, 30); // Limit to max 30

      if (realDbReviews.length > 0) {
        console.log(
          `✅ Found ${realDbReviews.length} REAL reviews in database (max 30) - SERVED FROM CACHE (NO API COST)`,
        );
        return res.json({
          success: true,
          reviews: realDbReviews,
          source: "database_cached",
          count: realDbReviews.length,
          maxPossible: 30,
          isReal: true,
          fromCache: true,
        });
      }
    }

    // Get business details
    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    console.log(
      `💰 No cached reviews found, calling Google API (THIS COSTS MONEY)...`,
    );

    // Try to fetch from Google Places API if we have the place ID
    let googleReviews = [];
    if (business.id && process.env.GOOGLE_PLACES_API_KEY) {
      try {
        console.log(`🔍 Fetching Google reviews for place ID: ${business.id}`);

        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`,
        );

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          console.log("📊 Google API Response:", {
            status: googleData.status,
            totalReviews: googleData.result?.user_ratings_total || 0,
            fetchedReviews: googleData.result?.reviews?.length || 0,
          });

          if (googleData.result && googleData.result.reviews) {
            // Process Google reviews, limit to 30 maximum
            const allGoogleReviews = googleData.result.reviews.slice(0, 30);

            googleReviews = allGoogleReviews.map(
              (review: any, index: number) => ({
                id: `google_${business.id}_${index}`,
                businessId: businessId,
                authorName: review.author_name,
                rating: review.rating,
                text: review.text || "No review text provided",
                timeAgo: review.relative_time_description || "Recently",
                profilePhotoUrl:
                  review.profile_photo_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=random`,
                isReal: true, // Mark as real Google review
                googleReviewId: review.author_name + "_" + review.time,
                createdAt: new Date().toISOString(),
              }),
            );

            console.log(
              `✅ Processed ${googleReviews.length} REAL Google reviews (max 30)`,
            );

            // Save Google reviews to database for future use
            if (googleReviews.length > 0) {
              try {
                // Clear existing reviews for this business first
                await businessService.clearBusinessReviews(businessId);

                // Save new Google reviews
                await businessService.saveBusinessReviews(
                  businessId,
                  googleReviews,
                );

                console.log(
                  `💾 Saved ${googleReviews.length} REAL Google reviews to database`,
                );
              } catch (saveError) {
                console.error(
                  "❌ Error saving Google reviews to database:",
                  saveError,
                );
              }
            }

            // Update business rating info if available
            if (
              googleData.result.rating &&
              googleData.result.user_ratings_total
            ) {
              try {
                await businessService.updateBusinessRating(
                  businessId,
                  googleData.result.rating,
                  googleData.result.user_ratings_total,
                );
                console.log(
                  `📊 Updated business rating: ${googleData.result.rating} (${googleData.result.user_ratings_total} reviews)`,
                );
              } catch (updateError) {
                console.error(
                  "❌ Error updating business rating:",
                  updateError,
                );
              }
            }
          }
        } else {
          console.log(`❌ Google API error: ${googleResponse.status}`);
        }
      } catch (error) {
        console.log("📡 Google Places API error:", error);
      }
    } else {
      console.log(
        "⚠️ Google Places API key not configured or business ID missing",
      );
    }

    // Return only real Google reviews if found (max 30)
    if (googleReviews.length > 0) {
      console.log(
        `✅ Returning ${googleReviews.length} REAL Google reviews (max 30)`,
      );
      return res.json({
        success: true,
        reviews: googleReviews,
        source: "google_api_real",
        count: googleReviews.length,
        maxPossible: 30,
        isReal: true,
        note: `Showing ${googleReviews.length} real Google reviews (limited to maximum 30)`,
      });
    }

    // No real reviews found
    console.log(`📭 No real Google reviews found for ${business.name}`);
    res.json({
      success: true,
      reviews: [],
      source: "none",
      count: 0,
      maxPossible: 30,
      message: "No real reviews available for this business",
    });
  } catch (error) {
    console.error("Error fetching business reviews:", error);
    res.status(500).json({
      error: "Failed to fetch business reviews",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
