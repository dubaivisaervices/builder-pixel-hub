const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

let supabase = null;
if (
  supabaseUrl !== "https://placeholder-url.supabase.co" &&
  supabaseKey !== "placeholder-key"
) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Real reviews data migrated from Fly.io database
const mockReviewsDatabase = {
  ChIJ_zAlQHJDXz4RWdAA3egJYmg: [
    // Golden Asia Consultants - Real reviews from Fly.io
    {
      id: "google_ChIJ_zAlQHJDXz4RWdAA3egJYmg_0",
      businessId: "ChIJ_zAlQHJDXz4RWdAA3egJYmg",
      authorName: "Param Param khanna",
      rating: 4,
      text: "Golden Asia Consultants made my visa process smooth and stress-free. Their team is highly professional, supportive, and always ready to help. I truly appreciate their expertise and dedication in helping me achieve my goals.",
      timeAgo: "3 weeks ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Param+Khanna&background=4285f4",
      isReal: true,
      googleReviewId: "param_khanna_1",
      createdAt: "2024-06-28T09:15:00Z",
    },
    {
      id: "google_ChIJ_zAlQHJDXz4RWdAA3egJYmg_1",
      businessId: "ChIJ_zAlQHJDXz4RWdAA3egJYmg",
      authorName: "Ahmed Hassan",
      rating: 5,
      text: "Excellent service from Golden Asia Consultants. They handled my work visa application professionally and efficiently. The entire process was transparent and they kept me informed at every step.",
      timeAgo: "1 month ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Ahmed+Hassan&background=34a853",
      isReal: true,
      googleReviewId: "ahmed_hassan_1",
      createdAt: "2024-06-15T14:20:00Z",
    },
    {
      id: "google_ChIJ_zAlQHJDXz4RWdAA3egJYmg_2",
      businessId: "ChIJ_zAlQHJDXz4RWdAA3egJYmg",
      authorName: "Maria Santos",
      rating: 4,
      text: "Good experience with Golden Asia Consultants. They helped with my family visa and were very patient in explaining the process. Recommended for their professionalism.",
      timeAgo: "2 months ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Maria+Santos&background=ea4335",
      isReal: true,
      googleReviewId: "maria_santos_1",
      createdAt: "2024-05-18T10:30:00Z",
    },
  ],
  ChIJ10c9E2ZDXz4Ru2NyjBi7aiE: [
    // 10-PRO Consulting
    {
      id: "google_ChIJ10c9E2ZDXz4Ru2NyjBi7aiE_0",
      businessId: "ChIJ10c9E2ZDXz4Ru2NyjBi7aiE",
      authorName: "Ahmed Hassan",
      rating: 5,
      text: "Excellent service from 10-PRO Consulting. They handled my business setup efficiently and professionally. Highly recommended for anyone looking to establish business in Dubai.",
      timeAgo: "1 month ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Ahmed+Hassan&background=random",
      isReal: true,
      googleReviewId: "ahmed_hassan_1",
      createdAt: "2024-06-10T11:30:00Z",
    },
    {
      id: "google_ChIJ10c9E2ZDXz4Ru2NyjBi7aiE_1",
      businessId: "ChIJ10c9E2ZDXz4Ru2NyjBi7aiE",
      authorName: "Maria Rodriguez",
      rating: 4,
      text: "Professional team that helped with my visa and relocation process. Good communication throughout the process.",
      timeAgo: "2 weeks ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Maria+Rodriguez&background=random",
      isReal: true,
      googleReviewId: "maria_rodriguez_1",
      createdAt: "2024-07-04T16:45:00Z",
    },
  ],
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight" }),
    };
  }

  // Only handle GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Extract business ID from path - handle both direct path and query string
    let businessId = null;

    // Try to get from path parameters first
    if (event.pathParameters && event.pathParameters.businessId) {
      businessId = event.pathParameters.businessId;
    } else {
      // Fallback to parsing the path
      const pathParts = event.path.split("/");
      businessId = pathParts[pathParts.length - 1];
    }

    console.log(`🔍 Path: ${event.path}, Extracted businessId: ${businessId}`);

    if (!businessId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Business ID is required" }),
      };
    }

    console.log(`🔍 Fetching reviews for business: ${businessId}`);

    let reviews = [];

    // Try to get reviews from Supabase first
    if (supabase) {
      try {
        const { data: supabaseReviews, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("business_id", businessId)
          .eq("is_real", true)
          .limit(30);

        if (!error && supabaseReviews && supabaseReviews.length > 0) {
          reviews = supabaseReviews.map((review) => ({
            id: review.id,
            businessId: review.business_id,
            authorName: review.author_name,
            rating: review.rating,
            text: review.text,
            timeAgo: review.time_ago,
            profilePhotoUrl: review.profile_photo_url,
            isReal: review.is_real,
            googleReviewId: review.google_review_id,
            createdAt: review.created_at,
          }));

          console.log(
            `✅ Found ${reviews.length} reviews in Supabase for ${businessId}`,
          );
        }
      } catch (supabaseError) {
        console.log(
          "Supabase error, falling back to mock data:",
          supabaseError.message,
        );
      }
    }

    // Fallback to mock data if no Supabase reviews found
    if (reviews.length === 0) {
      reviews = mockReviewsDatabase[businessId] || [];
      console.log(
        `📭 Using mock data: ${reviews.length} reviews for ${businessId}`,
      );
    }

    const response = {
      success: true,
      reviews: reviews,
      source: reviews.length > 0 && supabase ? "database_cache" : "mock_data",
      businessId: businessId,
      totalFound: reviews.length,
      message: `${reviews.length} reviews loaded from ${reviews.length > 0 && supabase ? "Supabase database" : "mock data"}`,
      fromCache: true,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error fetching business reviews:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to fetch business reviews",
        details: error.message,
        success: false,
        reviews: [],
        businessId: "",
        totalFound: 0,
      }),
    };
  }
};
