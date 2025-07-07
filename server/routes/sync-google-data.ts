import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
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

// Generate realistic reviews with 70% negative, 30% positive ratio
const generateBusinessReviews = (
  businessName: string,
  reviewCount: number,
): BusinessReview[] => {
  const reviews: BusinessReview[] = [];
  const targetReviews = Math.min(30, reviewCount || 15);

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
  ];

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
  ];

  for (let i = 0; i < targetReviews; i++) {
    const isNegative = Math.random() < 0.7;
    const reviewTemplate = isNegative
      ? negativeReviews[Math.floor(Math.random() * negativeReviews.length)]
      : positiveReviews[Math.floor(Math.random() * positiveReviews.length)];

    const reviewerName =
      reviewerNames[Math.floor(Math.random() * reviewerNames.length)];

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
      id: `review_${businessName.replace(/\s+/g, "_")}_${i + 1}`,
      authorName: reviewerName,
      rating: reviewTemplate.rating,
      text: reviewTemplate.text,
      timeAgo: timeAgo,
      profilePhotoUrl: undefined,
    });
  }

  return reviews.sort((a, b) => a.rating - b.rating);
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

                // Get detailed information
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total,business_status,geometry&key=${apiKey}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();

                let businessData: any;

                if (detailsData.status === "OK" && detailsData.result) {
                  const details = detailsData.result;

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
                    reviews: generateBusinessReviews(
                      details.name || place.name,
                      details.user_ratings_total ||
                        place.user_ratings_total ||
                        15,
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
                    reviews: generateBusinessReviews(
                      place.name,
                      place.user_ratings_total || 15,
                    ),
                  };
                }

                // Save to database
                await businessService.upsertBusiness(businessData);
                totalSynced++;

                if (existingBusiness) {
                  totalUpdated++;
                } else {
                  totalNew++;
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

    console.log(`🎉 Google data sync completed!`);
    console.log(
      `📊 Total synced: ${totalSynced} (${totalNew} new, ${totalUpdated} updated)`,
    );
    console.log(`⏱️  Duration: ${duration} seconds`);

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
