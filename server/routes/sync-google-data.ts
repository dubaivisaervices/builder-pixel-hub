import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { BusinessReview } from "@shared/google-business";
import { database } from "../database/database";

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

// Dubai visa/immigration service categories to search - expanded for comprehensive coverage
const DUBAI_VISA_CATEGORIES = [
  // Core visa services
  '"overseas services" Dubai UAE',
  '"visa services" Dubai UAE',
  '"immigration services" Dubai UAE',
  '"visa consultants" Dubai UAE',
  '"visa consulting" Dubai UAE',
  '"visa consultation" Dubai UAE',

  // Consulting services - expanded
  "visa consulting services Dubai UAE",
  "immigration consulting services Dubai UAE",
  "visa consultancy Dubai UAE",
  "immigration consultancy Dubai UAE",
  "visa consultant Dubai UAE",
  "immigration consultant Dubai UAE",
  "visa advisor Dubai UAE",
  "immigration advisor Dubai UAE",

  // Professional services
  "visa agency Dubai UAE",
  "immigration agency Dubai UAE",
  "visa processing center Dubai UAE",
  "visa processing services Dubai UAE",
  "immigration processing Dubai UAE",
  "visa application center Dubai UAE",
  "visa application services Dubai UAE",

  // Document and legal services
  "document clearing Dubai UAE",
  "document clearance Dubai UAE",
  "attestation services Dubai UAE",
  "document attestation Dubai UAE",
  "PRO services Dubai UAE",
  "legal services Dubai UAE",
  "immigration lawyers Dubai UAE",
  "visa lawyers Dubai UAE",

  // Specific visa types
  '"work permit" Dubai UAE',
  '"work visa" Dubai UAE',
  "employment visa Dubai UAE",
  "business visa services Dubai UAE",
  "investor visa Dubai UAE",
  "student visa services Dubai UAE",
  '"study abroad" Dubai UAE',
  "education visa Dubai UAE",
  "family visa Dubai UAE",
  "spouse visa Dubai UAE",
  "dependent visa Dubai UAE",
  "visitor visa Dubai UAE",
  "tourist visa Dubai UAE",
  "residence visa Dubai UAE",
  "golden visa Dubai UAE",

  // Business setup (often includes visa services)
  "business setup Dubai UAE",
  "company formation Dubai UAE",
  "business formation Dubai UAE",
  "freezone setup Dubai UAE",
  "mainland company Dubai UAE",
  "offshore company Dubai UAE",

  // Travel and relocation
  "travel agents Dubai UAE",
  "travel agencies Dubai UAE",
  "relocation services Dubai UAE",
  "migration services Dubai UAE",
  "expatriate services Dubai UAE",

  // Additional variations
  "visa processing office Dubai UAE",
  "immigration office Dubai UAE",
  "visa center Dubai UAE",
  "immigration center Dubai UAE",
  "visa expert Dubai UAE",
  "immigration expert Dubai UAE",
  "visa specialist Dubai UAE",
  "immigration specialist Dubai UAE",
  "visa helper Dubai UAE",
  "visa assistance Dubai UAE",
  "immigration assistance Dubai UAE",
  "visa support Dubai UAE",
  "immigration support Dubai UAE",

  // Location-specific searches to find more businesses
  "visa services DIFC Dubai",
  "visa services Jumeirah Dubai",
  "visa services Bur Dubai",
  "visa services Deira Dubai",
  "visa services Business Bay Dubai",
  "visa services Downtown Dubai",
  "visa services Marina Dubai",
  "visa consulting Karama Dubai",
  "immigration services Al Barsha Dubai",
  "visa agency Satwa Dubai",
  "visa consultants Sheikh Zayed Road Dubai",

  // Professional variations
  "certified visa consultant Dubai",
  "licensed immigration advisor Dubai",
  "registered visa agent Dubai",
  "authorized visa center Dubai",
  "government approved visa Dubai",

  // Arabic/local terms
  "خدمات التأشيرات دب��",
  "استشارات الهجرة دبي",
  "خدمات الهجرة دبي",
];

// Process real Google reviews (up to 50 reviews)
const processGoogleReviews = (
  googleReviews: any[],
  businessName: string,
): BusinessReview[] => {
  if (!googleReviews || googleReviews.length === 0) {
    console.log(`   ⚠️  No Google reviews found for ${businessName}`);
    return [];
  }

  const processedReviews: BusinessReview[] = [];

  // Process up to 50 reviews
  const reviewsToProcess = googleReviews.slice(0, 50);

  reviewsToProcess.forEach((review, index) => {
    try {
      // Calculate time ago from relative_time_description or time
      let timeAgo = "Unknown";
      if (review.relative_time_description) {
        timeAgo = review.relative_time_description;
      } else if (review.time) {
        const reviewDate = new Date(review.time * 1000);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
          timeAgo = `${diffDays} days ago`;
        } else if (diffDays < 365) {
          const months = Math.floor(diffDays / 30);
          timeAgo = `${months} month${months > 1 ? "s" : ""} ago`;
        } else {
          const years = Math.floor(diffDays / 365);
          timeAgo = `${years} year${years > 1 ? "s" : ""} ago`;
        }
      }

      processedReviews.push({
        id: `google_review_${businessName.replace(/\s+/g, "_")}_${index + 1}`,
        authorName: review.author_name || "Anonymous",
        rating: review.rating || 0,
        text: review.text || "No review text available",
        timeAgo: timeAgo,
        profilePhotoUrl: review.profile_photo_url,
      });
    } catch (error) {
      console.error(
        `Error processing review ${index} for ${businessName}:`,
        error,
      );
    }
  });

  console.log(
    `   ✅ Processed ${processedReviews.length} real Google reviews for ${businessName}`,
  );

  // Sort reviews by rating (lowest first to show problems prominently)
  return processedReviews.sort((a, b) => a.rating - b.rating);
};

export const syncGoogleData: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    console.log("🔄 Starting enhanced Google data sync...");
    console.log(
      `📋 Processing ${DUBAI_VISA_CATEGORIES.length} search categories with pagination`,
    );

    let totalSynced = 0;
    let totalUpdated = 0;
    let totalNew = 0;
    let skippedDuplicates = 0;

    // Process all categories
    for (const category of DUBAI_VISA_CATEGORIES) {
      try {
        console.log(`📍 Processing category: ${category}`);

        let nextPageToken: string | undefined;
        let pageCount = 0;
        const maxPagesPerCategory = 2; // Fetch up to 2 pages per category (up to 40 results)

        do {
          const searchUrl = nextPageToken
            ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
            : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category)}&key=${apiKey}`;

          const response = await fetch(searchUrl);
          const data: GooglePlacesResponse = await response.json();

          if (data.status === "OK" && data.results) {
            pageCount++;
            console.log(
              `   📄 Processing page ${pageCount} (${data.results.length} results)`,
            );

            for (const place of data.results) {
              try {
                // Check if business already exists
                const existingBusiness = await businessService.getBusinessById(
                  place.place_id,
                );

                // Generate email address
                const generateEmail = (businessName: string): string => {
                  const cleanName = businessName
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "")
                    .replace(/\s+/g, "")
                    .substring(0, 20);
                  return `info@${cleanName}.ae`;
                };

                // Get detailed information including reviews
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,rating,user_ratings_total,business_status,geometry&key=${apiKey}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();

                let businessData: any;

                if (detailsData.status === "OK" && detailsData.result) {
                  const details = detailsData.result;

                  // Log photo availability for debugging
                  if (details.photos && details.photos.length > 0) {
                    console.log(
                      `   📷 Found ${details.photos.length} photos for ${details.name || place.name}`,
                    );
                  } else {
                    console.log(
                      `   ❌ No photos found for ${details.name || place.name}`,
                    );
                  }

                  // Check for target keywords - expanded for better detection
                  const targetKeywords = [
                    "overseas services",
                    "visa services",
                    "immigration services",
                    "visa consultants",
                    "visa consulting",
                    "visa consultation",
                    "visa consultancy",
                    "immigration consulting",
                    "immigration consultancy",
                    "immigration consultant",
                    "visa consultant",
                    "visa advisor",
                    "immigration advisor",
                    "visa agency",
                    "immigration agency",
                    "visa processing",
                    "immigration processing",
                    "visa application",
                    "visa center",
                    "immigration center",
                    "work permit",
                    "work visa",
                    "employment visa",
                    "business visa",
                    "student visa",
                    "study abroad",
                    "education visa",
                    "family visa",
                    "residence visa",
                    "golden visa",
                    "document clearing",
                    "document clearance",
                    "attestation",
                    "pro services",
                    "visa expert",
                    "visa specialist",
                    "immigration expert",
                    "immigration specialist",
                    "visa assistance",
                    "immigration assistance",
                    "visa support",
                    "immigration support",
                    "migration services",
                    "relocation services",
                    "expatriate services",
                  ];

                  const businessName = (
                    details.name || place.name
                  ).toLowerCase();
                  const hasTargetKeyword = targetKeywords.some((keyword) =>
                    businessName.includes(keyword.toLowerCase()),
                  );

                  businessData = {
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
                    logoUrl: details.photos?.[0]?.photo_reference
                      ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${details.photos[0].photo_reference}&maxwidth=200&key=${apiKey}`
                      : undefined,
                    photos:
                      details.photos?.slice(0, 6).map((photo, index) => ({
                        id: index + 1,
                        url: `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=400&key=${apiKey}`,
                        caption:
                          index === 0
                            ? "Business Logo/Main Photo"
                            : `Business Photo ${index + 1}`,
                      })) || [],
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
                    hasTargetKeyword: hasTargetKeyword,
                    reviews: processGoogleReviews(
                      details.reviews || [],
                      details.name || place.name,
                    ),
                  };
                } else {
                  // Fallback data
                  businessData = {
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
                    hasTargetKeyword: false,
                    reviews: processGoogleReviews(
                      [], // No Google reviews available for fallback data
                      place.name,
                    ),
                  };
                }

                // Save to database
                const wasNew = !existingBusiness;
                await businessService.upsertBusiness(businessData);
                totalSynced++;

                if (existingBusiness) {
                  totalUpdated++;
                  console.log(`🔄 Updated: ${businessData.name}`);
                } else {
                  totalNew++;
                  console.log(`🆕 New: ${businessData.name}`);
                }

                // Progress logging
                if (totalSynced % 25 === 0) {
                  console.log(`✅ Synced ${totalSynced} businesses so far...`);
                }

                // Small delay for API stability
                await new Promise((resolve) => setTimeout(resolve, 20));
              } catch (error) {
                console.error(
                  `Error processing business ${place.name}:`,
                  error,
                );
              }
            }

            // Set next page token for pagination
            nextPageToken = data.next_page_token;

            // Add delay for next page token to become valid (required by Google API)
            if (nextPageToken && pageCount < maxPagesPerCategory) {
              console.log(
                `   ⏳ Waiting for next page token to become valid...`,
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          } else {
            console.log(
              `   ❌ No results for category: ${category} (Status: ${data.status})`,
            );
            break;
          }
        } while (nextPageToken && pageCount < maxPagesPerCategory);

        // Small delay between categories
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing category ${category}:`, error);
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    const stats = await businessService.getStats();

    console.log(`🎉 Enhanced Google data sync completed!`);
    console.log(`📊 Categories processed: ${DUBAI_VISA_CATEGORIES.length}`);
    console.log(
      `📊 Total synced: ${totalSynced} (${totalNew} new, ${totalUpdated} updated)`,
    );
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`💾 Database now contains ${stats.total} total businesses`);

    res.json({
      success: true,
      message: "Google data sync completed successfully",
      stats: {
        totalSynced,
        totalNew,
        totalUpdated,
        duration,
        databaseStats: stats,
      },
    });
  } catch (error) {
    console.error("Error during Google data sync:", error);
    res.status(500).json({
      error: "Failed to sync Google data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const clearFakeReviewsAndSyncReal: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    console.log("🧹 Clearing all fake reviews from database...");
    await businessService.clearAllReviews();

    console.log(
      "🔄 Starting real Google reviews sync for existing businesses...",
    );

    // Get all businesses from database
    const allBusinesses = await businessService.getBusinessesPaginated(
      1000,
      0,
      false,
    );
    let reviewsUpdated = 0;
    let businessesProcessed = 0;
    let businessesWithReviews = 0;

    for (const business of allBusinesses) {
      try {
        businessesProcessed++;
        console.log(
          `📝 Processing reviews for: ${business.name} (${businessesProcessed}/${allBusinesses.length})`,
        );

        // Get detailed information including reviews
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (
          detailsData.status === "OK" &&
          detailsData.result &&
          detailsData.result.reviews
        ) {
          const googleReviews = processGoogleReviews(
            detailsData.result.reviews,
            business.name,
          );

          if (googleReviews.length > 0) {
            // Update only the reviews for this business
            await businessService.upsertReviews(business.id, googleReviews);
            reviewsUpdated++;
            businessesWithReviews++;
            console.log(
              `   ✅ Added ${googleReviews.length} real Google reviews for ${business.name}`,
            );
          } else {
            console.log(`   ⚠️  No Google reviews found for ${business.name}`);
          }
        } else {
          console.log(
            `   ❌ Failed to get reviews for ${business.name}: ${detailsData.status}`,
          );
        }

        // Progress logging
        if (businessesProcessed % 25 === 0) {
          console.log(
            `📊 Progress: ${businessesProcessed}/${allBusinesses.length} businesses processed, ${businessesWithReviews} have real reviews`,
          );
        }

        // Small delay for API stability
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `Error processing reviews for business ${business.name}:`,
          error,
        );
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log(`🎉 Real Google reviews sync completed!`);
    console.log(`📊 Businesses processed: ${businessesProcessed}`);
    console.log(`📊 Businesses with real reviews: ${businessesWithReviews}`);
    console.log(`⏱️  Duration: ${duration} seconds`);

    res.json({
      success: true,
      message:
        "Fake reviews cleared and real Google reviews synced successfully",
      stats: {
        businessesProcessed,
        businessesWithReviews,
        reviewsUpdated,
        duration,
      },
    });
  } catch (error) {
    console.error("Error during reviews sync:", error);
    res.status(500).json({
      error: "Failed to sync real reviews",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const syncReviewsOnly: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    console.log("🔄 Starting reviews-only sync for existing businesses...");

    // Get all businesses from database
    const allBusinesses = await businessService.getBusinessesPaginated(
      1000,
      0,
      false,
    );
    let reviewsUpdated = 0;
    let businessesProcessed = 0;

    for (const business of allBusinesses) {
      try {
        businessesProcessed++;
        console.log(
          `📝 Processing reviews for: ${business.name} (${businessesProcessed}/${allBusinesses.length})`,
        );

        // Get detailed information including reviews
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (
          detailsData.status === "OK" &&
          detailsData.result &&
          detailsData.result.reviews
        ) {
          const googleReviews = processGoogleReviews(
            detailsData.result.reviews,
            business.name,
          );

          if (googleReviews.length > 0) {
            // Update only the reviews for this business
            await businessService.upsertReviews(business.id, googleReviews);
            reviewsUpdated++;
            console.log(
              `   ✅ Updated ${googleReviews.length} reviews for ${business.name}`,
            );
          } else {
            console.log(`   ⚠️  No reviews found for ${business.name}`);
          }
        } else {
          console.log(
            `   ❌ Failed to get reviews for ${business.name}: ${detailsData.status}`,
          );
        }

        // Progress logging
        if (businessesProcessed % 50 === 0) {
          console.log(
            `📊 Progress: ${businessesProcessed}/${allBusinesses.length} businesses processed, ${reviewsUpdated} updated with reviews`,
          );
        }

        // Small delay for API stability
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `Error processing reviews for business ${business.name}:`,
          error,
        );
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log(`🎉 Reviews sync completed!`);
    console.log(`📊 Businesses processed: ${businessesProcessed}`);
    console.log(`📊 Businesses updated with reviews: ${reviewsUpdated}`);
    console.log(`⏱️  Duration: ${duration} seconds`);

    res.json({
      success: true,
      message: "Reviews sync completed successfully",
      stats: {
        businessesProcessed,
        reviewsUpdated,
        duration,
      },
    });
  } catch (error) {
    console.error("Error during reviews sync:", error);
    res.status(500).json({
      error: "Failed to sync reviews",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const clearAllDataAndResync: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    console.log("🗑️ Clearing all existing business data...");

    // Clear all existing data
    await businessService.clearAllReviews();
    const clearBusinessQuery = `DELETE FROM businesses`;
    await (
      await import("../database/database")
    ).database.run(clearBusinessQuery);

    console.log("✅ All existing data cleared");
    console.log("🔄 Starting fresh Google data sync...");

    let totalSynced = 0;
    let totalNew = 0;
    let businessesWithPhotos = 0;

    // Process all categories with fresh data
    for (const category of DUBAI_VISA_CATEGORIES) {
      try {
        console.log(`📍 Processing category: ${category}`);

        let nextPageToken: string | undefined;
        let pageCount = 0;
        const maxPagesPerCategory = 2;

        do {
          const searchUrl = nextPageToken
            ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
            : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category)}&key=${apiKey}`;

          const response = await fetch(searchUrl);
          const data: GooglePlacesResponse = await response.json();

          if (data.status === "OK" && data.results) {
            pageCount++;
            console.log(
              `   📄 Processing page ${pageCount} (${data.results.length} results)`,
            );

            for (const place of data.results) {
              try {
                // Generate email address
                const generateEmail = (businessName: string): string => {
                  const cleanName = businessName
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "")
                    .replace(/\s+/g, "")
                    .substring(0, 20);
                  return `info@${cleanName}.ae`;
                };

                // Get detailed information including photos
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total,business_status,geometry&key=${apiKey}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();

                let businessData: any;

                if (detailsData.status === "OK" && detailsData.result) {
                  const details = detailsData.result;

                  // Log photo availability
                  if (details.photos && details.photos.length > 0) {
                    console.log(
                      `   📷 Found ${details.photos.length} photos for ${details.name}`,
                    );
                    businessesWithPhotos++;
                  } else {
                    console.log(`   📷 No photos for ${details.name}`);
                  }

                  const targetKeywords = [
                    "overseas services",
                    "visa services",
                    "immigration services",
                    "visa consultants",
                    "visa consulting",
                    "visa consultation",
                    "visa consultancy",
                    "immigration consulting",
                    "immigration consultancy",
                    "immigration consultant",
                    "visa consultant",
                    "visa advisor",
                    "immigration advisor",
                    "visa agency",
                    "immigration agency",
                    "visa processing",
                    "immigration processing",
                    "visa application",
                    "visa center",
                    "immigration center",
                    "work permit",
                    "work visa",
                    "employment visa",
                    "business visa",
                    "student visa",
                    "study abroad",
                    "education visa",
                    "family visa",
                    "residence visa",
                    "golden visa",
                    "document clearing",
                    "document clearance",
                    "attestation",
                    "pro services",
                    "visa expert",
                    "visa specialist",
                    "immigration expert",
                    "immigration specialist",
                    "visa assistance",
                    "immigration assistance",
                    "visa support",
                    "immigration support",
                    "migration services",
                    "relocation services",
                    "expatriate services",
                  ];

                  const businessName = (
                    details.name || place.name
                  ).toLowerCase();
                  const hasTargetKeyword = targetKeywords.some((keyword) =>
                    businessName.includes(keyword.toLowerCase()),
                  );

                  businessData = {
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
                    logoUrl: details.photos?.[0]?.photo_reference
                      ? `https://maps.googleapis.com/maps/api/place/photo?photoreference=${details.photos[0].photo_reference}&maxwidth=200&key=${apiKey}`
                      : undefined,
                    photos:
                      details.photos?.slice(0, 6).map((photo, index) => ({
                        id: index + 1,
                        url: `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photo.photo_reference}&maxwidth=400&key=${apiKey}`,
                        caption:
                          index === 0
                            ? "Business Logo/Main Photo"
                            : `Business Photo ${index + 1}`,
                      })) || [],
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
                    hasTargetKeyword: hasTargetKeyword,
                    reviews: [], // No fake reviews
                  };
                } else {
                  // Fallback data without photos
                  businessData = {
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
                    hasTargetKeyword: false,
                    reviews: [], // No fake reviews
                  };
                }

                // Save to database
                await businessService.upsertBusiness(businessData);
                totalSynced++;
                totalNew++;

                if (businessData.logoUrl) {
                  console.log(
                    `   ✅ Added business with photo: ${businessData.name}`,
                  );
                } else {
                  console.log(
                    `   ✅ Added business without photo: ${businessData.name}`,
                  );
                }

                // Progress logging
                if (totalSynced % 50 === 0) {
                  console.log(
                    `📊 Progress: ${totalSynced} businesses synced, ${businessesWithPhotos} with photos`,
                  );
                }

                // Small delay for API stability
                await new Promise((resolve) => setTimeout(resolve, 100));
              } catch (error) {
                console.error(
                  `Error processing business ${place.name}:`,
                  error,
                );
              }
            }

            // Set next page token for pagination
            nextPageToken = data.next_page_token;

            if (nextPageToken && pageCount < maxPagesPerCategory) {
              console.log(`   ⏳ Waiting for next page token...`);
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
          } else {
            console.log(
              `   ❌ No results for category: ${category} (Status: ${data.status})`,
            );
            break;
          }
        } while (nextPageToken && pageCount < maxPagesPerCategory);

        // Small delay between categories
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing category ${category}:`, error);
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    const stats = await businessService.getStats();

    console.log(`🎉 Fresh sync completed!`);
    console.log(`📊 Total synced: ${totalSynced} (${totalNew} new)`);
    console.log(`📷 Businesses with photos: ${businessesWithPhotos}`);
    console.log(`⏱️  Duration: ${duration} seconds`);

    res.json({
      success: true,
      message: "Database cleared and fresh Google data synced successfully",
      stats: {
        totalSynced,
        totalNew,
        businessesWithPhotos,
        duration,
        databaseStats: stats,
      },
    });
  } catch (error) {
    console.error("Error during fresh sync:", error);
    res.status(500).json({
      error: "Failed to clear and resync data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getSyncStatus: RequestHandler = async (req, res) => {
  try {
    const stats = await businessService.getStats();

    res.json({
      success: true,
      stats: stats,
      message: `Database contains ${stats.total} businesses in ${stats.categories} categories, ${stats.withReviews} have reviews`,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get sync status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
