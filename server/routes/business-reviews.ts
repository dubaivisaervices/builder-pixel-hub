import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";

// Get real reviews for a specific business
export const getBusinessReviews: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    console.log(`🔍 Fetching reviews for business: ${businessId}`);

    // First try to get reviews from database
    const dbReviews = await businessService.getBusinessReviews(businessId);
    if (dbReviews && dbReviews.length > 0) {
      console.log(`✅ Found ${dbReviews.length} reviews in database`);
      return res.json({
        success: true,
        reviews: dbReviews,
        source: "database",
        count: dbReviews.length,
      });
    }

    // Get business details first
    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Try to fetch from Google Places API if we have the place ID
    let googleReviews = [];
    if (business.id && process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews&key=${process.env.GOOGLE_PLACES_API_KEY}`,
        );

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          if (googleData.result && googleData.result.reviews) {
            googleReviews = googleData.result.reviews.map(
              (review: any, index: number) => ({
                id: `google_${index}`,
                authorName: review.author_name,
                rating: review.rating,
                text: review.text,
                timeAgo: review.relative_time_description,
                profilePhotoUrl: review.profile_photo_url,
                isReal: true,
              }),
            );

            console.log(
              `✅ Fetched ${googleReviews.length} real Google reviews`,
            );

            // Save to database for future use
            if (googleReviews.length > 0) {
              await businessService.saveBusinessReviews(
                businessId,
                googleReviews,
              );
            }
          }
        }
      } catch (error) {
        console.log("📡 Google Places API not available:", error);
      }
    }

    // If we have Google reviews, return them
    if (googleReviews.length > 0) {
      return res.json({
        success: true,
        reviews: googleReviews.slice(0, 50), // Limit to 50 reviews
        source: "google_api",
        count: googleReviews.length,
      });
    }

    // Generate realistic reviews as fallback
    const fallbackReviews = generateFallbackReviews(
      business.name,
      business.reviewCount || 0,
    );

    console.log(`📝 Generated ${fallbackReviews.length} fallback reviews`);

    res.json({
      success: true,
      reviews: fallbackReviews,
      source: "generated",
      count: fallbackReviews.length,
    });
  } catch (error) {
    console.error("Error fetching business reviews:", error);
    res.status(500).json({
      error: "Failed to fetch business reviews",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Generate realistic fallback reviews when no real ones are available
function generateFallbackReviews(businessName: string, reviewCount: number) {
  const authors = [
    "Ahmed Hassan",
    "Sarah Mitchell",
    "Raj Patel",
    "Maria Santos",
    "Hassan Ali",
    "Jennifer Clark",
    "Mohammed Khalil",
    "Lisa Anderson",
    "Omar Farouk",
    "Emma Wilson",
    "David Brown",
    "Fatima Al-Zahra",
    "John Smith",
    "Aisha Patel",
    "Robert Johnson",
    "Nadia Khan",
    "Michael Davis",
    "Yasmin Ali",
    "James Wilson",
    "Zahra Mohamed",
    "Carlos Rodriguez",
    "Priya Sharma",
    "Mark Thompson",
    "Leila Mansour",
    "Peter Chen",
    "Sofia Petrov",
    "Abdul Rahman",
    "Anna Kowalski",
    "Daniel Kim",
    "Maya Gupta",
  ];

  const positiveTemplates = [
    `Great service from ${businessName}. Professional team and smooth visa processing.`,
    `Excellent experience with ${businessName}. They made the visa application very easy.`,
    `Highly recommend ${businessName}. Knowledgeable staff and efficient service.`,
    `Very satisfied with ${businessName}. Quick processing and good communication.`,
    `Outstanding service! ${businessName} helped me get my visa without any hassle.`,
    `Professional and reliable. ${businessName} delivered exactly what they promised.`,
    `Good experience overall. ${businessName} staff was helpful throughout the process.`,
    `Efficient visa service. ${businessName} processed my application quickly and professionally.`,
    `Recommended! ${businessName} has a knowledgeable team and good customer service.`,
    `Smooth process with ${businessName}. They guided me through every step clearly.`,
  ];

  const negativeTemplates = [
    `Poor experience with ${businessName}. Delayed processing and poor communication.`,
    `Not satisfied with the service. ${businessName} promised faster processing but it took months.`,
    `Had issues with ${businessName}. They were not responsive to my queries and concerns.`,
    `Disappointing service from ${businessName}. Expected better for the fees they charge.`,
    `Would not recommend ${businessName}. Too many delays and unclear communication.`,
    `Had problems with ${businessName}. They made mistakes in my application that caused delays.`,
    `Not happy with the service quality. ${businessName} needs to improve their customer service.`,
    `Faced difficulties with ${businessName}. The process was much longer than they initially said.`,
    `Poor communication from ${businessName}. Had to follow up multiple times for updates.`,
    `Unsatisfactory experience. ${businessName} did not meet the expectations they set.`,
  ];

  const timeOptions = [
    "2 days ago",
    "1 week ago",
    "2 weeks ago",
    "3 weeks ago",
    "1 month ago",
    "2 months ago",
    "3 months ago",
    "4 months ago",
    "5 months ago",
    "6 months ago",
  ];

  const reviews = [];
  // Use actual review count or default to 30-40 range
  const targetReviews = Math.min(50, Math.max(30, reviewCount || 35));

  for (let i = 0; i < targetReviews; i++) {
    const authorIndex = i % authors.length;
    const timeIndex = i % timeOptions.length;

    // Realistic rating distribution
    const ratingRand = Math.random();
    let rating, templateIndex;

    if (ratingRand < 0.15) {
      // 15% negative (1-2 star)
      rating = Math.random() < 0.6 ? 1 : 2;
      templateIndex = i % negativeTemplates.length;
    } else {
      // 85% positive (3-5 star)
      if (ratingRand < 0.25)
        rating = 3; // 10% 3-star
      else if (ratingRand < 0.6)
        rating = 4; // 35% 4-star
      else rating = 5; // 50% 5-star
      templateIndex = i % positiveTemplates.length;
    }

    const reviewText =
      rating <= 2
        ? negativeTemplates[templateIndex]
        : positiveTemplates[templateIndex];

    reviews.push({
      id: `fallback_${i + 1}`,
      authorName: authors[authorIndex],
      rating: rating,
      text: reviewText,
      timeAgo: timeOptions[timeIndex],
      profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authors[authorIndex])}&background=random`,
      isReal: false,
    });
  }

  // Sort by rating (show negative reviews first to highlight issues)
  return reviews.sort((a, b) => a.rating - b.rating);
}
