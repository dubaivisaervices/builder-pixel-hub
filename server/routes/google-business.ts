import { RequestHandler } from "express";
import { BusinessReview } from "@shared/google-business";

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

// Generate realistic reviews with 70% negative, 30% positive ratio
const generateBusinessReviews = (
  businessName: string,
  reviewCount: number,
): BusinessReview[] => {
  const reviews: BusinessReview[] = [];
  const targetReviews = Math.min(30, reviewCount || 15); // Up to 30 reviews

  // Common reviewer names
  const reviewerNames = [
    "Ahmed Al-Rashid",
    "Sarah Johnson",
    "Mohammed Hassan",
    "Emily Chen",
    "David Wilson",
    "Fatima Al-Zahra",
    "James Smith",
    "Aisha Khan",
    "Michael Brown",
    "Noor Abdullah",
    "Jennifer Taylor",
    "Omar Malik",
    "Lisa Anderson",
    "Hassan Ali",
    "Maria Garcia",
    "Khalid Al-Mansouri",
    "Rachel Williams",
    "Abdul Rahman",
    "Sophie Martin",
    "Youssef Ibrahim",
    "Anna Thompson",
    "Rashid Al-Maktoum",
    "Catherine Lee",
    "Tariq Ahmed",
    "Grace Miller",
    "Saeed Al-Qasimi",
    "Victoria Clark",
    "Mansour Al-Suwaidi",
    "Jessica Davis",
    "Hamad Al-Thani",
  ];

  // Negative review templates (70%)
  const negativeReviews = [
    {
      text: `Terrible experience with ${businessName}. They promised quick visa processing but took months longer than expected. Poor communication and hidden fees.`,
      rating: 1,
    },
    {
      text: `Do NOT use this service! ${businessName} gave me wrong information about visa requirements. Cost me time and money. Very unprofessional.`,
      rating: 1,
    },
    {
      text: `Worst visa service in Dubai. They took my documents and money, then became impossible to reach. Still waiting for updates after 3 months.`,
      rating: 2,
    },
    {
      text: `${businessName} charged me double what they quoted initially. So many hidden fees and no transparency. Would never recommend.`,
      rating: 1,
    },
    {
      text: `Complete waste of time and money. They messed up my visa application twice. Had to start over with another company. Avoid at all costs.`,
      rating: 1,
    },
    {
      text: `Very disappointing service. Staff is rude and unprofessional. They don't return calls and provide misleading information.`,
      rating: 2,
    },
    {
      text: `Scammed me out of 3000 AED. Promised family visa in 2 weeks, it's been 4 months. They stopped answering my calls.`,
      rating: 1,
    },
    {
      text: `Poor customer service and overpriced. Made so many mistakes in documentation. Had to correct everything myself.`,
      rating: 2,
    },
    {
      text: `${businessName} is a complete fraud. They took advance payment and disappeared. Filing complaint with authorities.`,
      rating: 1,
    },
    {
      text: `Extremely slow process and unprofessional staff. They don't know basic visa procedures. Lost my documents twice.`,
      rating: 2,
    },
    {
      text: `Horrible experience. They promised things they couldn't deliver. Very expensive for poor quality service.`,
      rating: 1,
    },
    {
      text: `Unreliable and untrustworthy. They gave me wrong dates for visa expiry. Could have gotten me in legal trouble.`,
      rating: 2,
    },
    {
      text: `Worst decision ever choosing ${businessName}. They don't follow up, don't answer questions, and charge extra for everything.`,
      rating: 1,
    },
    {
      text: `Complete disaster. They submitted wrong documents to immigration. Had to hire lawyer to fix their mistakes.`,
      rating: 1,
    },
    {
      text: `Overpriced and underdelivered. They don't stick to promises and always have excuses for delays.`,
      rating: 2,
    },
    {
      text: `Terrible communication and poor service quality. They lost my passport for a week. Very stressful experience.`,
      rating: 2,
    },
    {
      text: `${businessName} is unprofessional and unreliable. They charge premium prices but provide substandard service.`,
      rating: 1,
    },
    {
      text: `Avoid this company! They gave me wrong information that led to visa rejection. Then blamed me for their mistake.`,
      rating: 1,
    },
    {
      text: `Poor service and hidden charges. They keep asking for more money for every small thing. Not transparent at all.`,
      rating: 2,
    },
    {
      text: `Disappointed with their service. Took much longer than promised and result was unsatisfactory. Would not recommend.`,
      rating: 2,
    },
    {
      text: `They don't care about customers after taking payment. Very difficult to get updates on application status.`,
      rating: 2,
    },
  ];

  // Positive review templates (30%)
  const positiveReviews = [
    {
      text: `Excellent service from ${businessName}! They processed my work visa quickly and efficiently. Highly professional team.`,
      rating: 5,
    },
    {
      text: `Great experience! The staff was helpful and guided me through the entire process. Would definitely recommend.`,
      rating: 4,
    },
    {
      text: `${businessName} delivered exactly what they promised. Fast processing and transparent pricing. Very satisfied.`,
      rating: 5,
    },
    {
      text: `Professional and reliable service. They handled my family visa application smoothly. Good communication throughout.`,
      rating: 4,
    },
    {
      text: `Positive experience overall. They were upfront about costs and timeline. Got my visa on time as promised.`,
      rating: 4,
    },
    {
      text: `Decent service and reasonable prices. The process took the expected time and they kept me updated regularly.`,
      rating: 4,
    },
    {
      text: `Good customer service and knowledgeable staff. They answered all my questions and helped with documentation.`,
      rating: 4,
    },
    {
      text: `${businessName} handled my visa renewal efficiently. Fair pricing and professional approach. Would use again.`,
      rating: 5,
    },
    {
      text: `Satisfied with their service. They were patient with my questions and guided me well through the process.`,
      rating: 4,
    },
  ];

  // Generate reviews with 70% negative, 30% positive ratio
  for (let i = 0; i < targetReviews; i++) {
    const isNegative = Math.random() < 0.7; // 70% chance of negative
    const reviewTemplate = isNegative
      ? negativeReviews[Math.floor(Math.random() * negativeReviews.length)]
      : positiveReviews[Math.floor(Math.random() * positiveReviews.length)];

    const reviewerName =
      reviewerNames[Math.floor(Math.random() * reviewerNames.length)];

    // Generate random time ago (1 week to 2 years)
    const daysAgo = Math.floor(Math.random() * 730) + 7;
    let timeAgo: string;
    if (daysAgo < 30) {
      timeAgo = `${daysAgo} days ago`;
    } else if (daysAgo < 365) {
      const monthsAgo = Math.floor(daysAgo / 30);
      timeAgo = `${monthsAgo} month${monthsAgo > 1 ? "s" : ""} ago`;
    } else {
      const yearsAgo = Math.floor(daysAgo / 365);
      timeAgo = `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
    }

    reviews.push({
      id: `review_${i + 1}`,
      authorName: reviewerName,
      rating: reviewTemplate.rating,
      text: reviewTemplate.text,
      timeAgo: timeAgo,
      profilePhotoUrl: undefined, // Could add placeholder profile photos later
    });
  }

  // Sort reviews by rating (worst first to show problems prominently)
  return reviews.sort((a, b) => a.rating - b.rating);
};

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

    // Process ALL categories to maximize unique business listings
    const priorityCategories = DUBAI_VISA_CATEGORIES; // Use all categories for maximum coverage
    console.log(
      `Processing ${priorityCategories.length} categories to maximize Dubai business listings`,
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
          // Process up to 12 results per category for better server performance (24 categories × 12 = 288+ potential)
          const limitedResults = data.results.slice(0, 12);

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

                  // Generate realistic email address
                  const generateEmail = (businessName: string): string => {
                    const cleanName = businessName
                      .toLowerCase()
                      .replace(/[^a-z0-9\s]/g, "")
                      .replace(/\s+/g, "")
                      .substring(0, 20);
                    return `info@${cleanName}.ae`;
                  };

                  const business: BusinessData = {
                    id: place.place_id,
                    name: details.name || place.name,
                    address:
                      details.formatted_address || place.formatted_address,
                    phone: details.formatted_phone_number || undefined,
                    website: details.website || undefined,
                    email: generateEmail(details.name || place.name),
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
                    // Generate reviews with 70% negative, 30% positive ratio
                    reviews: generateBusinessReviews(
                      details.name || place.name,
                      details.user_ratings_total ||
                        place.user_ratings_total ||
                        15,
                    ),
                  };

                  allBusinesses.push(business);

                  // Log progress every 50 businesses for reliable processing
                  if (allBusinesses.length % 50 === 0) {
                    console.log(
                      `🎯 MILESTONE: ${allBusinesses.length} unique businesses processed!`,
                    );
                  } else if (allBusinesses.length % 25 === 0) {
                    console.log(
                      `Progress: ${allBusinesses.length} unique businesses processed`,
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

                  // Generate realistic email address for fallback
                  const generateEmail = (businessName: string): string => {
                    const cleanName = businessName
                      .toLowerCase()
                      .replace(/[^a-z0-9\s]/g, "")
                      .replace(/\s+/g, "")
                      .substring(0, 20);
                    return `info@${cleanName}.ae`;
                  };

                  // Fallback to basic information if details API fails
                  const business: BusinessData = {
                    id: place.place_id,
                    name: place.name,
                    address: place.formatted_address,
                    email: generateEmail(place.name),
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
                    // Generate reviews with 70% negative, 30% positive ratio
                    reviews: generateBusinessReviews(
                      place.name,
                      place.user_ratings_total || 15,
                    ),
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

              // Minimal delay for server stability
              await new Promise((resolve) => setTimeout(resolve, 20)); // Minimal delay for faster processing
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

        // Minimal delay between categories for faster processing
        await new Promise((resolve) => setTimeout(resolve, 20)); // Minimal delay for faster processing
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
      message: `Successfully fetched ${sortedBusinesses.length} Dubai visa service providers in ${duration} seconds`,
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
