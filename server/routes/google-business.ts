import { RequestHandler } from "express";

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

// Dubai visa/immigration service categories to search - prioritizing specific name patterns
const DUBAI_VISA_CATEGORIES = [
  // High priority - businesses with exact target names
  '"overseas services" Dubai UAE',
  '"visa services" Dubai UAE',
  '"immigration services" Dubai UAE',
  '"visa consultants" Dubai UAE',
  '"work permit" Dubai UAE',
  '"study abroad" Dubai UAE',
  // Standard categories
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
];

export const searchDubaiVisaServices: RequestHandler = async (req, res) => {
  const startTime = Date.now();
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log("API Key configured:", !!apiKey);

    if (!apiKey) {
      console.error("Google Places API key not found in environment variables");
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    const allBusinesses: BusinessData[] = [];
    const processedPlaceIds = new Set<string>();
    let totalRequests = 0;
    let successfulRequests = 0;

    // Process 12 priority categories focusing on businesses with target names
    const priorityCategories = DUBAI_VISA_CATEGORIES.slice(0, 12); // Top 12 categories prioritizing exact name matches
    console.log(
      `Processing ${priorityCategories.length} priority categories focusing on businesses with target keyword names`,
    );

    // Search each category
    for (const category of priorityCategories) {
      try {
        totalRequests++;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category)}&key=${apiKey}`;

        console.log(`Searching category: ${category}`);
        const response = await fetch(searchUrl);
        const data: GooglePlacesResponse = await response.json();

        console.log(`API Response for ${category}:`, {
          status: data.status,
          resultCount: data.results?.length || 0,
          totalProcessed: allBusinesses.length,
        });

        if (data.status === "OK" && data.results) {
          successfulRequests++;

          // Process results and get detailed information for each business
          // Process up to 15 results per category for stable performance (8 categories × 15 = 120 potential)
          const limitedResults = data.results.slice(0, 15);

          for (const place of limitedResults) {
            if (!processedPlaceIds.has(place.place_id)) {
              processedPlaceIds.add(place.place_id);

              // Also check for duplicate business names to avoid similar businesses
              const existingBusiness = allBusinesses.find(
                (b) =>
                  b.name.toLowerCase().trim() ===
                  place.name.toLowerCase().trim(),
              );

              if (existingBusiness) {
                console.log(`Skipping duplicate business name: ${place.name}`);
                continue;
              }

              // Get detailed business information using Place Details API
              try {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total,business_status,geometry&key=${apiKey}`;

                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();

                if (detailsData.status === "OK" && detailsData.result) {
                  const details = detailsData.result;

                  // Check if business name contains target keywords for prioritization
                  const targetKeywords = [
                    "overseas services",
                    "visa services",
                    "immigration services",
                    "visa consultants",
                    "work permit",
                    "study abroad",
                    "visa consulting",
                    "immigration consulting",
                    "visa agency",
                  ];

                  const businessName = (
                    details.name || place.name
                  ).toLowerCase();
                  const hasTargetKeyword = targetKeywords.some((keyword) =>
                    businessName.includes(keyword.toLowerCase()),
                  );

                  // Log when we find businesses with target keywords
                  if (hasTargetKeyword) {
                    console.log(
                      `🎯 FOUND TARGET BUSINESS: ${details.name || place.name} - contains relevant keywords!`,
                    );
                  }

                  const business: BusinessData = {
                    id: place.place_id,
                    name: details.name || place.name,
                    address:
                      details.formatted_address || place.formatted_address,
                    phone: details.formatted_phone_number || undefined,
                    website: details.website || undefined,
                    location: {
                      lat:
                        details.geometry?.location?.lat ||
                        place.geometry.location.lat,
                      lng:
                        details.geometry?.location?.lng ||
                        place.geometry.location.lng,
                    },
                    rating: details.rating || place.rating || 0,
                    reviewCount:
                      details.user_ratings_total ||
                      place.user_ratings_total ||
                      0,
                    category: category.replace(" Dubai UAE", ""),
                    businessStatus:
                      details.business_status || place.business_status,
                    photoReference:
                      details.photos?.[0]?.photo_reference ||
                      place.photos?.[0]?.photo_reference,
                    // Generate Google Photos URL if photo reference exists
                    logoUrl: details.photos?.[0]?.photo_reference
                      ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${details.photos[0].photo_reference}&maxwidth=200&key=${apiKey}`
                      : undefined,
                    // Get all photos for the business
                    photos:
                      details.photos?.slice(0, 6).map((photo, index) => ({
                        id: index + 1,
                        url: `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=400&key=${apiKey}`,
                        caption:
                          index === 0
                            ? "Business Logo/Main Photo"
                            : `Business Photo ${index + 1}`,
                      })) || [],
                    // Operating hours
                    hours: details.opening_hours?.weekday_text
                      ? {
                          monday:
                            details.opening_hours.weekday_text[0] ||
                            "Hours not available",
                          tuesday:
                            details.opening_hours.weekday_text[1] ||
                            "Hours not available",
                          wednesday:
                            details.opening_hours.weekday_text[2] ||
                            "Hours not available",
                          thursday:
                            details.opening_hours.weekday_text[3] ||
                            "Hours not available",
                          friday:
                            details.opening_hours.weekday_text[4] ||
                            "Hours not available",
                          saturday:
                            details.opening_hours.weekday_text[5] ||
                            "Hours not available",
                          sunday:
                            details.opening_hours.weekday_text[6] ||
                            "Hours not available",
                        }
                      : undefined,
                    isOpen:
                      details.opening_hours?.open_now ??
                      place.opening_hours?.open_now,
                    priceLevel: place.price_level,
                    hasTargetKeyword: hasTargetKeyword, // Flag for businesses with target keywords
                  };

                  allBusinesses.push(business);

                  // Log progress every 25 businesses for reliable processing
                  if (allBusinesses.length % 25 === 0) {
                    console.log(
                      `🎯 MILESTONE: ${allBusinesses.length} businesses processed! Target: 150+`,
                    );
                  } else {
                    console.log(
                      `Fetched detailed info for: ${business.name} (Total: ${allBusinesses.length})`,
                    );
                  }
                } else {
                  console.log(
                    `Failed to get details for ${place.name}: ${detailsData.status}`,
                  );

                  // Check fallback business for target keywords too
                  const targetKeywords = [
                    "overseas services",
                    "visa services",
                    "immigration services",
                    "visa consultants",
                    "work permit",
                    "study abroad",
                    "visa consulting",
                    "immigration consulting",
                    "visa agency",
                  ];

                  const businessName = place.name.toLowerCase();
                  const hasTargetKeyword = targetKeywords.some((keyword) =>
                    businessName.includes(keyword.toLowerCase()),
                  );

                  if (hasTargetKeyword) {
                    console.log(
                      `🎯 FOUND TARGET BUSINESS (fallback): ${place.name} - contains relevant keywords!`,
                    );
                  }

                  // Fallback to basic information if details API fails
                  const business: BusinessData = {
                    id: place.place_id,
                    name: place.name,
                    address: place.formatted_address,
                    location: {
                      lat: place.geometry.location.lat,
                      lng: place.geometry.location.lng,
                    },
                    rating: place.rating || 0,
                    reviewCount: place.user_ratings_total || 0,
                    category: category.replace(" Dubai UAE", ""),
                    businessStatus: place.business_status,
                    photoReference: place.photos?.[0]?.photo_reference,
                    logoUrl: place.photos?.[0]?.photo_reference
                      ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${place.photos[0].photo_reference}&maxwidth=200&key=${apiKey}`
                      : undefined,
                    photos:
                      place.photos?.slice(0, 6).map((photo, index) => ({
                        id: index + 1,
                        url: `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=400&key=${apiKey}`,
                        caption:
                          index === 0
                            ? "Business Logo/Main Photo"
                            : `Business Photo ${index + 1}`,
                      })) || [],
                    isOpen: place.opening_hours?.open_now,
                    priceLevel: place.price_level,
                    hasTargetKeyword: hasTargetKeyword,
                  };
                  allBusinesses.push(business);
                  console.log(
                    `Added fallback business: ${business.name} (Total: ${allBusinesses.length})`,
                  );
                }
              } catch (detailsError) {
                console.error(
                  `Error fetching details for ${place.name}:`,
                  detailsError,
                );
              }

              // Balanced delay for server stability
              await new Promise((resolve) => setTimeout(resolve, 50));

              // Early exit if we have enough businesses to prevent timeout
              if (allBusinesses.length >= 150) {
                console.log(
                  `Reached 150 businesses limit, stopping to prevent timeout`,
                );
                break;
              }
            }
          }
        } else if (data.status === "ZERO_RESULTS") {
          console.log(`No results found for category: ${category}`);
        } else {
          console.error(`API Error for ${category}:`, data.status);
        }

        console.log(
          `Completed category "${category}" - Current total: ${allBusinesses.length} businesses`,
        );

        // Balanced delay between categories for stable processing
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Early exit if we have enough businesses
        if (allBusinesses.length >= 150) {
          console.log(`Reached business limit, stopping category processing`);
          break;
        }
      } catch (error) {
        console.error(`Error searching category ${category}:`, error);
        // Continue with other categories
      }
    }

    console.log(
      `Search completed: ${successfulRequests}/${totalRequests} successful requests`,
    );
    console.log(`Total unique businesses found: ${allBusinesses.length}`);
    console.log(`Categories processed: ${successfulRequests}/${totalRequests}`);
    console.log(
      `Average businesses per successful category: ${Math.round(allBusinesses.length / Math.max(successfulRequests, 1))}`,
    );

    // Count businesses with target keywords
    const targetKeywordBusinesses = allBusinesses.filter(
      (b) => b.hasTargetKeyword,
    );
    console.log(
      `🎯 TARGET KEYWORD BUSINESSES FOUND: ${targetKeywordBusinesses.length} out of ${allBusinesses.length}`,
    );
    if (targetKeywordBusinesses.length > 0) {
      console.log(
        `Target businesses: ${targetKeywordBusinesses.map((b) => b.name).join(", ")}`,
      );
    }

    // Add timing info for performance monitoring
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    console.log(`API process took approximately ${duration} seconds`);

    // Sort by target keywords first, then by rating and review count
    const sortedBusinesses = allBusinesses.sort((a, b) => {
      // Prioritize businesses with target keywords
      if (a.hasTargetKeyword && !b.hasTargetKeyword) return -1;
      if (!a.hasTargetKeyword && b.hasTargetKeyword) return 1;

      // Then sort by review count (highest first)
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;

      // Finally by rating
      return b.rating - a.rating;
    });

    res.json({
      businesses: sortedBusinesses,
      total: sortedBusinesses.length,
      categories: DUBAI_VISA_CATEGORIES.map((cat) =>
        cat.replace(" Dubai UAE", ""),
      ),
      processingTime: duration,
      message: `Fetched detailed information for ${sortedBusinesses.length} businesses in ${duration} seconds`,
    });
  } catch (error) {
    console.error("Error fetching Dubai visa services:", error);
    res.status(500).json({
      error: "Failed to fetch business data",
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

    res.json({
      status: data.status,
      message: "Google Places API test",
      resultCount: data.results?.length || 0,
      sampleResult: data.results?.[0]?.name || "No results",
    });
  } catch (error) {
    console.error("Google API test error:", error);
    res.status(500).json({
      error: "Failed to test Google API",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
