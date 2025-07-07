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
    console.log("🗄️ Fetching businesses from database...");

    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // Start with 50 for faster loading
    const offset = (page - 1) * limit;
    const includeReviews = req.query.includeReviews === "true";

    // Get total count for pagination
    const totalCount = await businessService.getStats();

    if (totalCount.total === 0) {
      // If no businesses in database, return message to sync first
      return res.json({
        businesses: [],
        total: 0,
        categories: [],
        processingTime: 0,
        message:
          "No businesses found in database. Please run data sync first using /api/sync-google-data",
        needsSync: true,
      });
    }

    // Get paginated businesses (lightweight by default)
    const businesses = await businessService.getBusinessesPaginated(
      limit,
      offset,
      includeReviews,
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
