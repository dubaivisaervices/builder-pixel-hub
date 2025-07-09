import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";

// Get ONLY real reviews for a specific business - NO FAKE REVIEWS
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
      const realDbReviews = dbReviews.filter(
        (review) =>
          review.isReal !== false &&
          !review.id?.startsWith("fallback_") &&
          !review.id?.startsWith("supplement_") &&
          !review.id?.startsWith("local_"),
      );

      if (realDbReviews.length > 0) {
        console.log(
          `✅ Found ${realDbReviews.length} REAL reviews in database`,
        );
        return res.json({
          success: true,
          reviews: realDbReviews,
          source: "database_real",
          count: realDbReviews.length,
          isReal: true,
        });
      }
    }

    // Get business details
    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Try to fetch from Google Places API if we have the place ID
    let googleReviews = [];
    if (business.id && process.env.GOOGLE_PLACES_API_KEY) {
      try {
        console.log(`🔍 Fetching Google reviews for place ID: ${business.id}`);

        // Try multiple API calls to get more reviews
        const reviewSources = [
          // Standard call
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`,
          // With language parameter to potentially get different reviews
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews&language=en&key=${process.env.GOOGLE_PLACES_API_KEY}`,
        ];

        const allReviewsMap = new Map(); // To avoid duplicates

        for (const url of reviewSources) {
          try {
            const googleResponse = await fetch(url);

            if (googleResponse.ok) {
              const googleData = await googleResponse.json();

              if (googleData.result && googleData.result.reviews) {
                googleData.result.reviews.forEach((review: any) => {
                  const reviewKey = `${review.author_name}_${review.time}`;
                  if (!allReviewsMap.has(reviewKey) && allReviewsMap.size < 30) {
                    allReviewsMap.set(reviewKey, review);
                  }
                });
              }
            }
          } catch (err) {
            console.log(`⚠️ Error with one API call: ${err}`);
          }
        }

        // Convert collected reviews to final format
        const collectedReviews = Array.from(allReviewsMap.values());

        console.log("📊 Google API Response:", {
          totalReviewsCollected: collectedReviews.length,
          maxPossible: 30,
        });

        if (collectedReviews.length > 0) {
          googleReviews = collectedReviews.map(
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
          console.log(`📭 No reviews found in any API calls`);
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
      console.log(`✅ Returning ${googleReviews.length} REAL Google reviews (max 30)`);
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