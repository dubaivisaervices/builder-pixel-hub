import { RequestHandler } from "express";
import { database } from "../database/database";

export const getEnhancedBusinessDetails: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    console.log(`🔍 Fetching stored details for business: ${businessId}`);

    // Get the business from our database with all stored enhanced data
    const business = await database.get(
      "SELECT * FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Parse stored JSON data
    let businessHours: string[] = [];
    let photos: any[] = [];
    let businessTypes: string[] = [];

    try {
      if (business.hours_json) {
        const parsedHours = JSON.parse(business.hours_json);
        businessHours = parsedHours.weekday_text || [];
      }
    } catch (e) {
      console.warn(`Failed to parse hours_json for ${business.name}`);
    }

    try {
      if (business.photos_json) {
        photos = JSON.parse(business.photos_json);
      }
    } catch (e) {
      console.warn(`Failed to parse photos_json for ${business.name}`);
    }

    // Create description from stored data or use category-based fallback
    const description =
      business.business_status ||
      `Professional ${business.category?.toLowerCase() || "immigration"} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`;

    // Enhanced business data using stored information
    const enhancedBusiness = {
      id: business.id,
      name: business.name,
      address: business.address,
      phone: business.phone,
      website: business.website,
      email: business.email,
      category: business.category,

      // Enhanced data from stored fields
      description,
      businessHours,
      businessStatus: business.business_status || "Unknown",
      priceLevel: business.price_level,
      googleRating: business.rating,
      googleReviewCount: business.review_count,
      businessTypes,
      photos,

      // Source indicator
      source: "database_stored",
      lastUpdated: business.updated_at || business.created_at,
    };

    console.log(`✅ Retrieved stored data for: ${business.name}`);
    res.json(enhancedBusiness);
  } catch (error) {
    console.error("❌ Error in enhanced business details:", error);
    res.status(500).json({
      error: "Failed to fetch enhanced business details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
