import { RequestHandler } from "express";
import { BusinessReview } from "@shared/google-business";
import { businessService } from "../database/businessService";

interface GooglePlacesResponse {
  results: Array<{
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
  }>;
  status: string;
  next_page_token?: string;
}

interface BusinessData {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  photoReference?: string;
  isOpen?: boolean;
  priceLevel?: number;
}

// No fake review generation - only use real Google reviews from database

// Dubai visa/immigration service categories to search - prioritizing specific name patterns and variations
const DUBAI_VISA_CATEGORIES = [
  // High priority - businesses with exact target names
  '"overseas services" Dubai UAE',
  '"visa services" Dubai UAE',
  '"immigration services" Dubai UAE',
  '"visa consultants" Dubai UAE',
  '"work permit" Dubai UAE',
  '"study abroad" Dubai UAE',
  // Standard categories with variations
  "visa consulting services Dubai UAE",
  "immigration consultants Dubai UAE",
  "visa agency Dubai UAE",
  "travel agents Dubai UAE",
  // Additional comprehensive categories
  "immigration lawyers Dubai UAE",
  "visa processing center Dubai UAE",
  "document clearing Dubai UAE",
  "attestation services Dubai UAE",
  "PRO services Dubai UAE",
  "student visa services Dubai UAE",
  "business visa services Dubai UAE",
  "visa application center Dubai UAE",
  // Additional patterns to find more businesses
  "visitor visa Dubai UAE",
  "family visa Dubai UAE",
  "employment visa Dubai UAE",
  "residence visa Dubai UAE",
  "business setup Dubai UAE",
  "company formation Dubai UAE",
];

export const searchDubaiVisaServices: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log("🗄️ Fetching businesses from database...");

    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 161; // Show all businesses by default
    const offset = (page - 1) * limit;
    const includeReviews = req.query.includeReviews === "true" || limit <= 50; // Include reviews for smaller requests

    // Get total count for pagination
    const totalCount = await businessService.getStats();

    if (totalCount.total === 0) {
      // If no businesses in database, return message to sync first
      console.log("📭 Database is empty - suggesting sync");
      return res.json({
        businesses: [],
        total: 0,
        categories: [],
        processingTime: 0,
        message:
          "Database is empty. Please visit /admin/sync to load Google data, or we'll show sample businesses",
        needsSync: true,
        syncUrl: "/admin/sync",
      });
    }

    // Get paginated businesses (only include reviews for smaller requests for performance)
    const includeReviewsForListing = limit <= 50; // Only include reviews for small requests
    const businesses = await businessService.getBusinessesPaginated(
      limit,
      offset,
      includeReviewsForListing, // Only include reviews for smaller requests
    );

    // Get unique categories
    const categories = await businessService.getCategories();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Count businesses with target keywords
    const targetKeywordBusinesses = businesses.filter(
      (b) => b.hasTargetKeyword,
    );

    console.log(`📊 Database query completed:`);
    console.log(`   Page: ${page}, Limit: ${limit}, Offset: ${offset}`);
    console.log(`   Returned businesses: ${businesses.length}`);
    console.log(`   Total in database: ${totalCount.total}`);
    console.log(
      `   Target keyword businesses: ${targetKeywordBusinesses.length}`,
    );
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Query time: ${duration} seconds`);

    // Debug logging for first few businesses' images
    if (businesses.length > 0) {
      console.log(`📸 Image sampling for first 3 businesses:`);
      businesses.slice(0, 3).forEach((business, index) => {
        console.log(`  ${index + 1}. ${business.name}:`);
        console.log(
          `     - logoUrl: ${business.logoUrl ? "present" : "not present"}`,
        );
        console.log(
          `     - photos: ${business.photos ? business.photos.length : 0} items`,
        );
      });
    }

    res.json({
      businesses: businesses,
      total: totalCount.total,
      categories: categories,
      processingTime: duration,
      message: `Loaded ${businesses.length} of ${totalCount.total} Dubai visa service providers from database in ${duration} seconds`,
      source: "database",
      targetKeywordCount: targetKeywordBusinesses.length,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount.total,
        totalPages: Math.ceil(totalCount.total / limit),
        hasMore: offset + limit < totalCount.total,
      },
    });
  } catch (error) {
    console.error("Error fetching businesses from database:", error);
    res.status(500).json({
      error: "Failed to fetch business data from database",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getBusinessDetails: RequestHandler = async (req, res) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,rating,user_ratings_total&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === "OK") {
      res.json(data.result);
    } else {
      res.status(404).json({ error: "Business not found" });
    }
  } catch (error) {
    console.error("Error fetching business details:", error);
    res.status(500).json({
      error: "Failed to fetch business details",
    });
  }
};

export const getBusinessById: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    console.log(`Fetching business details for ID: ${businessId}`);

    // Get business from database with reviews
    const business = await businessService.getBusinessById(businessId);

    if (!business) {
      return res.status(404).json({
        error: "Business not found",
        details: `No business found with ID: ${businessId}`,
      });
    }

    console.log(
      `Found business: ${business.name} with ${business.reviews.length} reviews`,
    );

    // Debug logging for images
    console.log(`📸 Image Debug Info for ${business.name}:`);
    console.log(`  - logoUrl: ${business.logoUrl ? "present" : "not present"}`);
    console.log(
      `  - photos: ${business.photos ? business.photos.length : 0} items`,
    );
    if (business.photos && business.photos.length > 0) {
      business.photos.forEach((photo, index) => {
        console.log(
          `  - Photo ${index + 1}: ${photo.caption || "No caption"} - ${photo.base64 ? "base64 data present" : photo.url ? "URL present" : "no image data"}`,
        );
      });
    }

    console.log(`📝 Review Debug Info for ${business.name}:`);
    console.log(
      `  - reviews in business object: ${business.reviews ? business.reviews.length : 0} items`,
    );
    if (business.reviews && business.reviews.length > 0) {
      console.log(
        `  - First review: ${business.reviews[0].authorName} - ${business.reviews[0].rating} stars`,
      );
      console.log(
        `  - Last review: ${business.reviews[business.reviews.length - 1].authorName} - ${business.reviews[business.reviews.length - 1].rating} stars`,
      );
      console.log(
        `  - Review text sample: "${business.reviews[0].text.substring(0, 100)}..."`,
      );
    }

    res.json({
      success: true,
      business: business,
      reviews: business.reviews,
      reviewCount: business.reviews.length,
    });
  } catch (error) {
    console.error("Error fetching business by ID:", error);
    res.status(500).json({
      error: "Failed to fetch business details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Debug endpoint to check raw database data
export const debugImageData: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    // Get raw database row
    const business = await businessService.getBusinessById(businessId);

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const debugInfo = {
      businessName: business.name,
      logoUrl: business.logoUrl,
      logoUrlType: business.logoUrl
        ? business.logoUrl.startsWith("data:")
          ? "base64"
          : "url"
        : "none",
      logoUrlLength: business.logoUrl ? business.logoUrl.length : 0,
      photosCount: business.photos ? business.photos.length : 0,
      photosStructure: business.photos
        ? business.photos.map((photo: any, index: number) => ({
            index,
            id: photo.id,
            caption: photo.caption,
            hasUrl: !!photo.url,
            hasBase64: !!photo.base64,
            urlLength: photo.url ? photo.url.length : 0,
            base64Length: photo.base64 ? photo.base64.length : 0,
          }))
        : [],
    };

    res.json(debugInfo);
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getBusinessPhoto: RequestHandler = async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxwidth = 400 } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoReference}&maxwidth=${maxwidth}&key=${apiKey}`;

    // Return the photo URL for client to use directly
    res.json({ photoUrl });
  } catch (error) {
    console.error("Error getting business photo:", error);
    res.status(500).json({
      error: "Failed to get business photo",
    });
  }
};

export const testGoogleAPI: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    // Simple test query
    const testUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=visa+services+Dubai&key=${apiKey}`;

    const response = await fetch(testUrl);
    const data = await response.json();

    // Test photo URL if available
    let photoTest = null;
    if (data.results && data.results[0] && data.results[0].photos) {
      const photoRef = data.results[0].photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=200&key=${apiKey}`;

      try {
        const photoResponse = await fetch(photoUrl);
        photoTest = {
          photoReference: photoRef,
          photoUrl: photoUrl,
          photoStatus: photoResponse.status,
          photoHeaders: Object.fromEntries(photoResponse.headers.entries()),
        };
      } catch (photoError) {
        photoTest = {
          error: "Failed to fetch photo",
          details:
            photoError instanceof Error ? photoError.message : "Unknown error",
        };
      }
    }

    res.json({
      status: data.status,
      message: "Google Places API test",
      resultCount: data.results?.length || 0,
      sampleResult: data.results?.[0]?.name || "No results",
      hasPhotos: data.results?.[0]?.photos?.length || 0,
      photoTest: photoTest,
    });
  } catch (error) {
    console.error("Google API test error:", error);
    res.status(500).json({
      error: "Failed to test Google API",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
