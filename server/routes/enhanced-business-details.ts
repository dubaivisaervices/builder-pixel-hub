import { RequestHandler } from "express";
import { database } from "../database/database";
import fetch from "node-fetch";

export const getEnhancedBusinessDetails: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    console.log(`🔍 Fetching enhanced details for business: ${businessId}`);

    // First get the business from our database
    const business = await database.get(
      "SELECT * FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Check if we have Google Places API key
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.log("⚠️ Google Places API key not configured");
      return res.json({
        ...business,
        description: "Professional immigration and visa services",
        businessStatus: "Unknown",
        source: "database_only",
      });
    }

    try {
      // Fetch detailed information from Google Places API
      console.log(`📡 Calling Google Places API for: ${business.name}`);

      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${businessId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,business_status,price_level,types,photos,editorial_summary,reviews&key=${apiKey}`,
      );

      if (!detailsResponse.ok) {
        throw new Error(
          `Google API error: ${detailsResponse.status} ${detailsResponse.statusText}`,
        );
      }

      const detailsData = await detailsResponse.json();

      if (detailsData.status !== "OK") {
        console.log(
          `⚠️ Google Places API status: ${detailsData.status} for ${business.name}`,
        );
        throw new Error(`Google API status: ${detailsData.status}`);
      }

      const result = detailsData.result;
      console.log(`✅ Got Google Places data for: ${result.name}`);

      // Enhance business data with Google Places information
      const enhancedBusiness = {
        ...business,
        // Basic info (prefer our database values if available)
        name: business.name || result.name,
        address: business.address || result.formatted_address,
        phone: business.phone || result.formatted_phone_number,
        website: business.website || result.website,

        // Google-specific data
        description:
          result.editorial_summary?.overview ||
          result.business_status ||
          `Professional ${business.category.toLowerCase()} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`,

        businessHours: result.opening_hours?.weekday_text || [],
        businessStatus: result.business_status || "Unknown",
        priceLevel: result.price_level,
        googleRating: result.rating,
        googleReviewCount: result.user_ratings_total,
        businessTypes: result.types || [],

        // Process photos
        photos: result.photos
          ? result.photos.slice(0, 3).map((photo: any) => ({
              photoReference: photo.photo_reference,
              url: `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=400&key=${apiKey}`,
            }))
          : [],

        // Recent reviews
        recentReviews: result.reviews
          ? result.reviews.slice(0, 3).map((review: any) => ({
              authorName: review.author_name,
              rating: review.rating,
              text: review.text,
              timeAgo: review.relative_time_description,
            }))
          : [],

        source: "google_places_enhanced",
        lastUpdated: new Date().toISOString(),
      };

      console.log(`✅ Enhanced business data prepared for: ${business.name}`);

      res.json(enhancedBusiness);
    } catch (googleError) {
      console.error(
        `❌ Google Places API error for ${business.name}:`,
        googleError.message,
      );

      // Return enhanced data with fallback description
      res.json({
        ...business,
        description: `Professional ${business.category.toLowerCase()} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`,
        businessStatus: "Unknown",
        source: "database_with_fallback",
        error: googleError.message,
      });
    }
  } catch (error) {
    console.error("❌ Error in enhanced business details:", error);
    res.status(500).json({
      error: "Failed to fetch enhanced business details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
