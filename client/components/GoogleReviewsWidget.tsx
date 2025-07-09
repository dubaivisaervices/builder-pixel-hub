import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, ExternalLink, User } from "lucide-react";

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

        // Try to fetch real reviews from our API
        const response = await fetch(`/api/business-reviews/${placeId}`);

        if (response.ok) {
          const data = await response.json();
          if (data.reviews && data.reviews.length > 0) {
            // Limit to first 10 reviews for display
            setReviews(data.reviews.slice(0, 10));
            console.log(`✅ Loaded ${data.reviews.length} reviews for display`);
          } else {
            console.log("📭 No reviews available from API");
            setReviews([]);
          }
        } else {
          console.log(`❌ API Response error: ${response.status}`);
          setReviews([]);
        }
      } catch (err) {
        console.error("❌ Error fetching reviews:", err);
        setError("Failed to load reviews");
        setReviews([]);
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
            ) : (
              <div className="space-y-4">
                {/* Embedded Google Reviews Widget */}
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&q=place_id:${placeId}&zoom=15&maptype=roadmap`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Google Maps for ${businessName}`}
                  />
                </div>

                {/* Alternative: Direct Google Business Profile Link */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        View All {reviewCount}+ Google Reviews
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        See authentic customer reviews and ratings on Google
                        Maps
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">
                          {rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {reviewCount}+ reviews
                      </div>
                    </div>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <span>Read Reviews on Google</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {/* Google Business Profile Widget Alternative */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png"
                        alt="Google"
                        className="h-8 w-8"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {businessName}
                      </h4>
                      <div className="flex items-center justify-center space-x-2 mt-2">
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
                    <p className="text-sm text-gray-600">
                      Click below to see all customer reviews and leave your own
                      review
                    </p>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <span>View & Write Review</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
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
