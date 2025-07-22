import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, ExternalLink, User } from "lucide-react";
import { getFallbackReviews } from "@/lib/fallbackReviews";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  timeAgo: string;
  profilePhotoUrl?: string;
}

interface GoogleReviewsWidgetProps {
  businessName: string;
  placeId: string;
  rating?: number;
  reviewCount?: number;
}

export default function GoogleReviewsWidget({
  businessName,
  placeId,
  rating = 4.8,
  reviewCount = 25,
}: GoogleReviewsWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔍 Fetching reviews for placeId:", placeId);
        console.log("🔍 Current URL:", window.location.href);

        if (!placeId) {
          setError("No business ID provided for reviews");
          return;
        }

        // First test if API routing works at all
        try {
          const debugResponse = await fetch(`/api/debug-reviews/${placeId}`);
          const debugData = await debugResponse.text();
          console.log(
            "🔍 Debug API test:",
            debugResponse.status,
            debugData.substring(0, 100),
          );
          console.log("🔍 Debug response headers:", Object.fromEntries(debugResponse.headers.entries()));
        } catch (debugErr) {
          console.log("🔍 Debug API test failed:", debugErr.message);
        }

        const apiUrl = `/api/business-reviews/${placeId}`;
        console.log("🔍 API URL:", apiUrl);

        // Try to fetch real reviews from our API
        let response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log(`🔍 Response status: ${response.status}`);
        console.log(`🔍 Response content-type: ${response.headers.get("content-type")}`);

        // If primary endpoint fails, try alternative endpoint
        if (
          !response.ok ||
          response.headers.get("content-type")?.includes("text/html")
        ) {
          console.log("🔄 Primary API failed, trying alternative endpoint");
          const altApiUrl = `/api/reviews/${placeId}`;
          response = await fetch(altApiUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          console.log(`🔍 Alt Response status: ${response.status}`);
          console.log(`🔍 Alt Response content-type: ${response.headers.get("content-type")}`);
        }

        if (response.ok) {
          let data;
          try {
            const responseText = await response.text();
            console.log("🔍 Raw response:", responseText.substring(0, 200));

            // Check if response is actually JSON
            if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
              data = JSON.parse(responseText);
            } else {
              throw new Error("API returned invalid response (HTML instead of JSON)");
            }
          } catch (parseError) {
            console.error("🔍 JSON Parse Error:", parseError);
            setError("API returned invalid response (HTML instead of JSON)");
            setReviews([]);
            return;
          }

          console.log("🔍 API Response:", data); // Debug log
          if (data.success && data.reviews && data.reviews.length > 0) {
            // Limit to first 10 reviews for display
            setReviews(data.reviews.slice(0, 10));
            const source =
              data.source === "database_cache"
                ? "cached database"
                : "Google API";
            const cost =
              data.source === "database_cache" ? "(FREE)" : "(COST MONEY)";
            console.log(
              `✅ Loaded ${data.reviews.length} reviews from ${source} ${cost}`,
            );
          } else {
            console.log("📭 No reviews available from API", data);
            setReviews([]);
          }
        } else {
          console.log(
            `❌ API Response error: ${response.status} - ${response.statusText}`,
          );
          console.log(`❌ Request URL: ${response.url}`);
          console.log(
            `❌ Response headers:`,
            Object.fromEntries(response.headers.entries()),
          );
          const responseText = await response.text();
          console.log(
            `❌ Response text (first 200 chars):`,
            responseText.substring(0, 200),
          );

          // Check if we got HTML instead of JSON
          if (
            responseText.includes("<!doctype") ||
            responseText.includes("<html")
          ) {
            console.log(
              "❌ Received HTML instead of JSON - API route not working",
            );
            setError(
              "API endpoint not responding correctly - got HTML instead of JSON",
            );
          } else {
            setError(`API Error: ${response.status} - ${response.statusText}`);
          }
          setReviews([]);
        }
      } catch (err) {
        console.error("❌ Error fetching reviews:", err);
        console.error("❌ Request URL:", `/api/business-reviews/${placeId}`);
        console.error("❌ PlaceId:", placeId);
        console.error("❌ Error type:", typeof err);
        console.error("❌ Error stack:", err.stack);

        let errorMessage = "Failed to load reviews";
        if (err.message) {
          if (
            err.message.includes("JSON") ||
            err.message.includes("Unexpected token")
          ) {
            errorMessage =
              "API returned invalid response (HTML instead of JSON)";
          } else {
            errorMessage = `Failed to load reviews: ${err.message}`;
          }
        }

        setError(errorMessage);

        // Use fallback reviews when API fails
        console.log("🔄 Using fallback reviews due to API failure");
        const fallbackData = getFallbackReviews(placeId);
        if (fallbackData.length > 0) {
          setReviews(fallbackData);
          setError(`${errorMessage} (showing sample reviews)`);
        } else {
          setReviews([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [placeId]);

  // Generate Google Maps reviews URL
  const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;

  // Create the Google My Business embed URL for reviews
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&q=place_id:${placeId}&zoom=15&maptype=roadmap`;

  return (
    <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <span>Google Reviews</span>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            <span>View on Google</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Review Stats */}
          <div className="grid md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {rating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">Google Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {reviewCount}+
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((rating / 5) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>

          {/* Google Reviews Embed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Reviews</h3>
              <span className="text-sm text-gray-500">Powered by Google</span>
            </div>

            {isLoading ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Google Reviews...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Display actual reviews */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Recent Reviews ({reviews.length} of {reviewCount}+)
                    </h3>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {review.profilePhotoUrl ? (
                                  <img
                                    src={review.profilePhotoUrl}
                                    alt={review.authorName}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {review.authorName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {review.timeAgo}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-sm font-medium">
                                {review.rating}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {review.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Reviews Available
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      This business doesn't have any Google reviews yet, or we
                      couldn't fetch them from Google Places API.
                    </p>
                  </div>
                )}

                {/* View More on Google Button */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png"
                        alt="Google"
                        className="h-8 w-8"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        View All {reviewCount}+ Google Reviews
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        See all authentic customer reviews and ratings on Google
                        Maps
                      </p>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{rating.toFixed(1)}</span>
                        <span className="text-gray-500">
                          ({reviewCount}+ reviews)
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => window.open(googleMapsUrl, "_blank")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <span>View More Reviews on Google</span>
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
