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
    if (dbReviews && dbReviews.length >= 30) {
      console.log(
        `✅ Found ${dbReviews.length} reviews in database (sufficient)`,
      );
      return res.json({
        success: true,
        reviews: dbReviews,
        source: "database",
        count: dbReviews.length,
      });
    } else if (dbReviews && dbReviews.length > 0) {
      console.log(
        `📊 Found ${dbReviews.length} reviews in database (insufficient - will supplement)`,
      );
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
        console.log(`🔍 Fetching Google reviews for place ID: ${business.id}`);

        // Fetch with expanded fields to get all available reviews
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.id}&fields=reviews,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`,
        );

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          console.log("📊 Google API Response:", {
            status: googleData.status,
            totalReviews: googleData.result?.user_ratings_total || 0,
            fetchedReviews: googleData.result?.reviews?.length || 0,
          });

          if (googleData.result && googleData.result.reviews) {
            googleReviews = googleData.result.reviews.map(
              (review: any, index: number) => ({
                id: `google_${business.id}_${index}`,
                businessId: businessId,
                authorName: review.author_name,
                rating: review.rating,
                text: review.text || "No review text provided",
                timeAgo: review.relative_time_description || "Recently",
                profilePhotoUrl:
                  review.profile_photo_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=random`,
                isReal: true,
                googleReviewId: review.author_name + "_" + review.time,
                createdAt: new Date().toISOString(),
              }),
            );

            console.log(
              `✅ Processed ${googleReviews.length} real Google reviews`,
            );

            // Save ALL Google reviews to database for future use
            if (googleReviews.length > 0) {
              try {
                // Clear existing reviews for this business first
                await businessService.clearBusinessReviews(businessId);

                // Save new Google reviews
                await businessService.saveBusinessReviews(
                  businessId,
                  googleReviews,
                );

                console.log(
                  `💾 Saved ${googleReviews.length} Google reviews to database`,
                );
              } catch (saveError) {
                console.error(
                  "❌ Error saving Google reviews to database:",
                  saveError,
                );
              }
            }

            // Update business rating info if available
            if (
              googleData.result.rating &&
              googleData.result.user_ratings_total
            ) {
              try {
                await businessService.updateBusinessRating(
                  businessId,
                  googleData.result.rating,
                  googleData.result.user_ratings_total,
                );
                console.log(
                  `📊 Updated business rating: ${googleData.result.rating} (${googleData.result.user_ratings_total} reviews)`,
                );
              } catch (updateError) {
                console.error(
                  "❌ Error updating business rating:",
                  updateError,
                );
              }
            }
          }
        } else {
          console.log(`❌ Google API error: ${googleResponse.status}`);
        }
      } catch (error) {
        console.log("📡 Google Places API error:", error);
      }
    } else {
      console.log(
        "⚠️ Google Places API key not configured or business ID missing",
      );
    }

    // If we have Google reviews or database reviews, supplement with generated reviews if needed
    let finalReviews = [...googleReviews];

    // If we have database reviews but no new Google reviews, start with database reviews
    if (googleReviews.length === 0 && dbReviews && dbReviews.length > 0) {
      finalReviews = [...dbReviews];
      console.log(`📋 Starting with ${dbReviews.length} database reviews`);
    }

    if (finalReviews.length > 0) {
      // If we have some Google reviews but less than 30, supplement with generated ones
      if (googleReviews.length < 30) {
        const additionalCount = 30 - googleReviews.length;
        const supplementalReviews = generateFallbackReviews(
          business.name,
          additionalCount,
          true, // Mark as supplemental
        );
        finalReviews = [...googleReviews, ...supplementalReviews];
        console.log(
          `📝 Supplemented ${googleReviews.length} Google reviews with ${additionalCount} generated reviews`,
        );
      }

      return res.json({
        success: true,
        reviews: finalReviews.slice(0, 50), // Limit to 50 total reviews
        source:
          googleReviews.length >= 30 ? "google_api" : "google_plus_generated",
        count: finalReviews.length,
        googleCount: googleReviews.length,
        generatedCount: finalReviews.length - googleReviews.length,
      });
    }

    // Generate realistic reviews as fallback (minimum 30)
    const fallbackReviews = generateFallbackReviews(
      business.name,
      Math.max(30, business.reviewCount || 30),
    );

    console.log(
      `📝 Generated ${fallbackReviews.length} fallback reviews (no Google reviews available)`,
    );

    res.json({
      success: true,
      reviews: fallbackReviews,
      source: "generated",
      count: fallbackReviews.length,
      googleCount: 0,
      generatedCount: fallbackReviews.length,
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
function generateFallbackReviews(
  businessName: string,
  reviewCount: number,
  isSupplemental: boolean = false,
) {
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
    `Great service from ${businessName}. Professional team and smooth visa processing. They helped me get my work visa in just 2 weeks.`,
    `Excellent experience with ${businessName}. They made the visa application very easy and explained every step clearly.`,
    `Highly recommend ${businessName}. Knowledgeable staff and efficient service. Got my family visa without any complications.`,
    `Very satisfied with ${businessName}. Quick processing and good communication throughout the entire process.`,
    `Outstanding service! ${businessName} helped me get my visa without any hassle. Worth every dirham spent.`,
    `Professional and reliable. ${businessName} delivered exactly what they promised within the timeline given.`,
    `Good experience overall. ${businessName} staff was helpful throughout the process and answered all my questions.`,
    `Efficient visa service. ${businessName} processed my application quickly and professionally. Highly recommended.`,
    `Recommended! ${businessName} has a knowledgeable team and good customer service. They made everything simple.`,
    `Smooth process with ${businessName}. They guided me through every step clearly and got my tourist visa approved.`,
    `Amazing team at ${businessName}! They processed my business visa renewal efficiently and kept me updated.`,
    `Top-notch service from ${businessName}. They helped with my student visa and made the whole process stress-free.`,
    `Perfect experience with ${businessName}. Professional, quick, and reliable. Got my work permit without issues.`,
    `Fantastic service! ${businessName} team was very helpful and processed my visa application faster than expected.`,
    `Excellent consultation from ${businessName}. They guided me through the Golden Visa process step by step.`,
    `Outstanding work by ${businessName}. They helped my entire family get residence visas efficiently.`,
    `Great communication and service from ${businessName}. They kept me informed throughout the visa process.`,
    `Reliable and trustworthy. ${businessName} delivered on their promises and got my visa approved quickly.`,
    `Professional service from ${businessName}. They handled my investment visa application with expertise.`,
    `Highly satisfied with ${businessName}. Clean process, good communication, and successful visa approval.`,
  ];

  const negativeTemplates = [
    `Poor experience with ${businessName}. Delayed processing and poor communication. Took 3 months for a simple tourist visa.`,
    `Not satisfied with the service. ${businessName} promised faster processing but it took months longer than expected.`,
    `Had issues with ${businessName}. They were not responsive to my queries and concerns about document requirements.`,
    `Disappointing service from ${businessName}. Expected better for the high fees they charge. Very unprofessional.`,
    `Would not recommend ${businessName}. Too many delays and unclear communication about visa status.`,
    `Had problems with ${businessName}. They made mistakes in my application that caused unnecessary delays.`,
    `Not happy with the service quality. ${businessName} needs to improve their customer service and responsiveness.`,
    `Faced difficulties with ${businessName}. The process was much longer than they initially said it would be.`,
    `Poor communication from ${businessName}. Had to follow up multiple times for updates on my application.`,
    `Unsatisfactory experience. ${businessName} did not meet the expectations they set during initial consultation.`,
    `Terrible service from ${businessName}. They charged extra fees that were not mentioned initially.`,
    `Avoid ${businessName}! They gave me wrong information about visa requirements and wasted my time.`,
    `Bad experience with ${businessName}. They lost my documents and I had to resubmit everything twice.`,
    `Unprofessional service from ${businessName}. They didn't return my calls and were very rude when I visited.`,
    `Waste of money! ${businessName} couldn't deliver what they promised and refused to refund the fees.`,
    `Poor handling by ${businessName}. My visa application was rejected due to their incomplete documentation.`,
    `Frustrated with ${businessName}. They kept changing requirements and asking for additional documents.`,
    `Dishonest service from ${businessName}. They promised guaranteed approval but my visa was rejected.`,
    `Terrible experience! ${businessName} staff was unprofessional and didn't know proper visa procedures.`,
    `Do not trust ${businessName}! They charge high fees but provide substandard service and fake promises.`,
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
  // Ensure minimum 30 reviews, maximum 50
  const targetReviews = Math.min(50, Math.max(30, reviewCount || 35));

  console.log(
    `📝 Generating ${targetReviews} ${isSupplemental ? "supplemental" : "fallback"} reviews for ${businessName}`,
  );

  for (let i = 0; i < targetReviews; i++) {
    const authorIndex = i % authors.length;
    const timeIndex = i % timeOptions.length;

    // Enhanced rating distribution for more realistic spread
    const ratingRand = Math.random();
    let rating, templateIndex;

    if (ratingRand < 0.12) {
      // 12% negative (1-2 star)
      rating = Math.random() < 0.7 ? 1 : 2;
      templateIndex = i % negativeTemplates.length;
    } else if (ratingRand < 0.25) {
      // 13% neutral (3 star)
      rating = 3;
      templateIndex = i % positiveTemplates.length;
    } else if (ratingRand < 0.65) {
      // 40% good (4 star)
      rating = 4;
      templateIndex = i % positiveTemplates.length;
    } else {
      // 35% excellent (5 star)
      rating = 5;
      templateIndex = i % positiveTemplates.length;
    }

    const reviewText =
      rating <= 2
        ? negativeTemplates[templateIndex]
        : positiveTemplates[templateIndex];

    reviews.push({
      id: isSupplemental ? `supplement_${i + 1}` : `fallback_${i + 1}`,
      businessId: businessName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      authorName: authors[authorIndex],
      rating: rating,
      text: reviewText,
      timeAgo: timeOptions[timeIndex],
      profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authors[authorIndex])}&background=random`,
      isReal: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Mix the reviews for realistic ordering (not all negative first)
  return reviews.sort(() => Math.random() - 0.5);
}
