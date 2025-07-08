import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Star,
  Globe,
  Phone,
  Mail,
  Clock,
  Camera,
  Shield,
  ExternalLink,
  TrendingDown,
  Filter,
  SortDesc,
} from "lucide-react";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  timeAgo: string;
  profilePhotoUrl?: string;
}

interface BusinessData {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  logoUrl?: string;
  reviews: Review[];
  hours?: any;
  photos?: any[];
}

export default function CompanyReviews() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "1star" | "2star" | "3star" | "4star" | "5star"
  >("all");

  // Fetch business data from database
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get businessId from URL params or state
        const idToFetch = businessId || location.state?.businessData?.id;

        if (!idToFetch) {
          throw new Error("No business ID provided");
        }

        console.log(`Fetching business data for ID: ${idToFetch}`);

        const response = await fetch(`/api/business-db/${idToFetch}`);
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Failed to fetch business data`,
          );
        }

        const data = await response.json();

        if (!data.success || !data.business) {
          throw new Error("Invalid response format from server");
        }

        console.log(
          `Loaded business: ${data.business.name} with ${data.business.reviews.length} reviews`,
        );
        setBusinessData(data.business);
      } catch (err) {
        console.error("Error fetching business data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load business data",
        );

        // Fallback to passed business data if available
        if (location.state?.businessData) {
          console.log("Using fallback business data from navigation state");
          setBusinessData(location.state.businessData);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessId, location.state?.businessData]);

  // Filter reviews based on rating
  const filteredReviews =
    businessData?.reviews.filter((review) => {
      if (reviewFilter === "all") return true;
      const targetRating = parseInt(reviewFilter.replace("star", ""));
      return review.rating === targetRating;
    }) || [];

  // Count reviews by rating
  const reviewCounts =
    businessData?.reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    ) || {};

  // Calculate scam alert level based on 1-star reviews
  const oneStarCount = reviewCounts[1] || 0;
  const totalReviews = businessData?.reviews.length || 0;
  const scamPercentage =
    totalReviews > 0 ? (oneStarCount / totalReviews) * 100 : 0;
  const scamAlertLevel =
    scamPercentage > 50 ? "high" : scamPercentage > 25 ? "medium" : "low";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Business
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-sm md:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Directory</span>
              <span className="sm:hidden">Back</span>
            </Button>

            {/* Scam Alert Badge */}
            {scamAlertLevel === "high" && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                High Scam Risk
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
        {/* Scam Warning Banner - Prominent for mobile */}
        {scamAlertLevel === "high" && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 md:p-6 rounded-xl shadow-xl">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0 mt-1" />
              <div className="flex-grow">
                <h2 className="text-lg md:text-xl font-bold mb-2">
                  ⚠️ HIGH SCAM RISK ALERT
                </h2>
                <p className="text-sm md:text-base opacity-90">
                  This business has {oneStarCount} negative reviews (
                  {scamPercentage.toFixed(0)}% of all reviews). Multiple
                  customers report fraudulent activities.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Company Header */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col space-y-6">
              {/* Mobile-first header layout */}
              <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Logo */}
                <div className="flex-shrink-0 self-center sm:self-start">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center border-2 border-primary/20 overflow-hidden relative">
                    {businessData?.logoUrl ? (
                      <>
                        <img
                          src={businessData.logoUrl}
                          alt={`${businessData.name} logo`}
                          className="w-full h-full object-cover absolute inset-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            const fallback = parent?.querySelector(
                              ".company-logo-fallback",
                            ) as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div
                          className="company-logo-fallback absolute inset-0 flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <span className="text-primary text-2xl md:text-4xl font-bold">
                            {businessData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="company-logo-fallback absolute inset-0 flex items-center justify-center">
                        <span className="text-primary text-2xl md:text-4xl font-bold">
                          {businessData.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Info */}
                <div className="flex-grow text-center sm:text-left">
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">
                    {businessData.name}
                  </h1>

                  {/* Rating with emphasis on poor ratings */}
                  <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 md:h-5 md:w-5 ${
                            i < Math.floor(businessData.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm md:text-base text-muted-foreground">
                      {businessData.rating.toFixed(1)} (
                      {businessData.reviewCount} reviews)
                    </span>
                    {businessData.rating <= 2.0 && (
                      <Badge variant="destructive" className="text-xs">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Poor Rating
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Category: {businessData.category}
                  </p>

                  {/* Contact Info - Grid for larger screens, stack for mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm">
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{businessData.address}</span>
                    </div>
                    {businessData.phone && (
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{businessData.phone}</span>
                      </div>
                    )}
                    {businessData.email && (
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="truncate">{businessData.email}</span>
                      </div>
                    )}
                    {businessData.website && (
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                        <a
                          href={businessData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center truncate"
                        >
                          Website
                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={() =>
                    navigate("/complaint", {
                      state: {
                        companyName: businessData.name,
                        companyLocation: businessData.address,
                      },
                    })
                  }
                  className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                  size="lg"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report This Company
                </Button>

                {oneStarCount > 0 && (
                  <Badge
                    variant="outline"
                    className="w-full sm:w-auto justify-center py-2 text-destructive border-destructive"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {oneStarCount} Scam Report{oneStarCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section - Primary Focus */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <CardTitle className="text-xl md:text-2xl">
                Customer Reviews ({businessData.reviews.length})
              </CardTitle>

              {/* Review Filter */}
              <div className="flex items-center space-x-2 text-sm">
                <Filter className="h-4 w-4" />
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">
                    All Reviews ({businessData.reviews.length})
                  </option>
                  <option value="1star">1 Star ({reviewCounts[1] || 0})</option>
                  <option value="2star">
                    2 Stars ({reviewCounts[2] || 0})
                  </option>
                  <option value="3star">
                    3 Stars ({reviewCounts[3] || 0})
                  </option>
                  <option value="4star">
                    4 Stars ({reviewCounts[4] || 0})
                  </option>
                  <option value="5star">
                    5 Stars ({reviewCounts[5] || 0})
                  </option>
                </select>
              </div>
            </div>

            {/* Review Distribution Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Review Distribution</span>
                <span>{filteredReviews.length} showing</span>
              </div>
              <div className="grid grid-cols-5 gap-1 h-2">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const count = reviewCounts[rating] || 0;
                  const percentage =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div
                      key={rating}
                      className={`rounded ${
                        rating === 1
                          ? "bg-red-500"
                          : rating === 2
                            ? "bg-orange-500"
                            : rating === 3
                              ? "bg-yellow-500"
                              : rating === 4
                                ? "bg-green-400"
                                : "bg-green-500"
                      }`}
                      style={{
                        height: `${Math.max(percentage, 2)}%`,
                        minHeight: "2px",
                      }}
                      title={`${rating} star: ${count} reviews (${percentage.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* No Reviews Message */}
            {filteredReviews.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reviews found for the selected filter.</p>
                {businessData.reviews.length === 0 && (
                  <p className="text-sm mt-2">
                    This business has no customer reviews yet.
                  </p>
                )}
              </div>
            )}

            {/* Reviews List */}
            {filteredReviews.map((review, index) => (
              <div
                key={review.id}
                className={`p-4 rounded-lg border-l-4 ${
                  review.rating === 1
                    ? "border-l-red-500 bg-red-50"
                    : review.rating === 2
                      ? "border-l-orange-500 bg-orange-50"
                      : review.rating === 3
                        ? "border-l-yellow-500 bg-yellow-50"
                        : review.rating === 4
                          ? "border-l-green-400 bg-green-50"
                          : "border-l-green-500 bg-green-50"
                } ${index < filteredReviews.length - 1 ? "border-b pb-4 mb-4" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0 mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        review.rating <= 2 ? "bg-red-100" : "bg-primary/10"
                      }`}
                    >
                      <User
                        className={`h-4 w-4 ${
                          review.rating <= 2 ? "text-red-600" : "text-primary"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-sm md:text-base">
                        {review.authorName}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 md:h-4 md:w-4 ${
                              i < review.rating
                                ? review.rating <= 2
                                  ? "text-red-500 fill-current"
                                  : "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        {review.rating === 1 && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            SCAM ALERT
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-xs md:text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    <span>{review.timeAgo}</span>
                  </div>
                </div>
                <p
                  className={`text-sm md:text-base leading-relaxed ${
                    review.rating <= 2
                      ? "text-red-900"
                      : "text-muted-foreground"
                  }`}
                >
                  {review.text}
                </p>

                {/* Highlight concerning keywords for low ratings */}
                {review.rating <= 2 && (
                  <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    <strong>Warning:</strong> This review reports negative
                    experiences. Exercise caution.
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Additional Info Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="photos" className="text-xs md:text-sm">
              Photos
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="text-xs md:text-sm hidden md:block"
            >
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Business Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Shield className="h-5 w-5" />
                  <span>Business Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Business ID</span>
                      <span className="text-muted-foreground font-mono text-xs md:text-sm">
                        {businessData.id}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Category</span>
                      <span className="text-muted-foreground">
                        {businessData.category}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Status</span>
                      <span className="text-muted-foreground">
                        {businessData.businessStatus || "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Total Reviews</span>
                      <span className="text-muted-foreground">
                        {businessData.reviewCount}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Average Rating</span>
                      <span className="text-muted-foreground">
                        {businessData.rating.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium">Negative Reviews</span>
                      <span
                        className={`${oneStarCount > 0 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}
                      >
                        {oneStarCount} (1-star reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning for poor ratings */}
                {businessData.rating < 2.5 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Warning className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          Low Rating Alert
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          This business has a low average rating of{" "}
                          {businessData.rating.toFixed(1)}/5.0. Please review
                          customer feedback carefully before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours - if available */}
            {businessData.hours && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Clock className="h-5 w-5" />
                    <span>Operating Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm md:text-base">
                    {Object.entries(businessData.hours).map(([day, hours]) => (
                      <div
                        key={day}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium capitalize">{day}</span>
                        <span className="text-muted-foreground">{hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4 md:space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Camera className="h-5 w-5" />
                  <span>Business Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {businessData?.photos && businessData.photos.length > 0 ? (
                  <>
                    <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      📷 Showing {businessData.photos.length} real business
                      photos
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {businessData.photos.map((photo, index) => (
                        <div key={photo.id || index} className="space-y-2">
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-200 group">
                            {photo.base64 ? (
                              <img
                                src={`data:image/jpeg;base64,${photo.base64}`}
                                alt={photo.caption || "Business photo"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : photo.url ? (
                              <img
                                src={photo.url}
                                alt={photo.caption || "Business photo"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const placeholder =
                                    target.parentElement?.querySelector(
                                      ".photo-placeholder",
                                    );
                                  if (placeholder)
                                    placeholder.classList.remove("hidden");
                                }}
                              />
                            ) : null}
                            <div className="photo-placeholder hidden text-center text-gray-500 flex flex-col items-center justify-center h-full">
                              <Camera className="h-8 w-8 md:h-12 md:w-12 mb-2" />
                              <p className="text-xs md:text-sm font-medium">
                                {photo.caption || "Business Photo"}
                              </p>
                            </div>
                          </div>
                          {photo.caption && (
                            <p className="text-xs md:text-sm text-muted-foreground text-center font-medium">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No photos available for this business.</p>
                    <p className="text-sm mt-2">
                      Photos may be added when available from Google My
                      Business.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab - Mobile only */}
          <TabsContent value="contact" className="space-y-4 md:space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Phone className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {businessData.address && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {businessData.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {businessData.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {businessData.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {businessData.email && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {businessData.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {businessData.website && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Website</p>
                        <a
                          href={businessData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Have Experience with This Business?
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Help protect others by sharing your experience. Your report
                  can prevent others from becoming victims of scams.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() =>
                    navigate("/complaint", {
                      state: {
                        companyName: businessData.name,
                        companyLocation: businessData.address,
                      },
                    })
                  }
                  className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Scam
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Directory
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
