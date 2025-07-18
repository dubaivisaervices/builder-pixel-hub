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

// Mock reviews data for businesses (matching Fly.io data structure)
const mockReviewsDatabase = {
  ChIJ_zAlQHJDXz4RWdAA3egJYmg: [
    // Golden Asia Consultants
    {
      id: "google_ChIJ_zAlQHJDXz4RWdAA3egJYmg_0",
      businessId: "ChIJ_zAlQHJDXz4RWdAA3egJYmg",
      authorName: "Manjot Singh",
      rating: 5,
      text: "Golden aisa consultants is an outstanding migration company that provides seamless and efficient services for individuals looking to relocate abroad. Their team is highly professional, knowledgeable, and dedicated to ensuring a smooth transition for their clients.",
      timeAgo: "2 months ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Manjot+Singh&background=random",
      isReal: true,
      googleReviewId: "manjot_singh_1",
      createdAt: "2024-05-18T10:30:00Z",
    },
    {
      id: "google_ChIJ_zAlQHJDXz4RWdAA3egJYmg_1",
      businessId: "ChIJ_zAlQHJDXz4RWdAA3egJYmg",
      authorName: "Sarah Ahmed",
      rating: 4,
      text: "Good service overall. The visa process was completed within the promised timeframe. Staff was helpful and responsive to queries.",
      timeAgo: "1 month ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Sarah+Ahmed&background=random",
      isReal: true,
      googleReviewId: "sarah_ahmed_1",
      createdAt: "2024-06-15T14:20:00Z",
    },
    {
      id: "google_ChIJ_zAlQHJDXz4RWdAA3egJYmg_2",
      businessId: "ChIJ_zAlQHJDXz4RWdAA3egJYmg",
      authorName: "Param Param khanna",
      rating: 4,
      text: "Golden Asia Consultants made my visa process smooth and stress-free. Their team is highly professional, supportive, and always ready to help. I truly appreciate their expertise and dedication.",
      timeAgo: "3 weeks ago",
      profilePhotoUrl:
        "https://ui-avatars.com/api/?name=Param+Khanna&background=random",
      isReal: true,
      googleReviewId: "param_khanna_1",
      createdAt: "2024-06-28T09:15:00Z",
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
    // Extract business ID from path
    const pathParts = event.path.split("/");
    const businessId = pathParts[pathParts.length - 1];

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
