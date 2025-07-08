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
  Warning,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Logo and Basic Info */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center mb-4 border-2 border-primary/20 overflow-hidden relative">
                  {businessData?.logoUrl ? (
                    <>
                      <img
                        src={businessData.logoUrl}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-cover absolute inset-0"
                        onError={(e) => {
                          // Hide image and show fallback letter
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          const fallback = parent?.querySelector(
                            ".company-logo-fallback",
                          ) as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                        onLoad={(e) => {
                          // Hide fallback when image loads successfully
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          const fallback = parent?.querySelector(
                            ".company-logo-fallback",
                          ) as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "none";
                          }
                        }}
                      />
                      <div
                        className="company-logo-fallback absolute inset-0 flex items-center justify-center"
                        style={{ display: "none" }}
                      >
                        <span className="text-primary text-4xl font-bold">
                          {company.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="company-logo-fallback absolute inset-0 flex items-center justify-center">
                      <span className="text-primary text-4xl font-bold">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(company.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {company.rating} ({company.totalReviews} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Est. {company.establishedYear}
                  </p>
                </div>
              </div>

              {/* Company Details */}
              <div className="flex-grow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="flex-grow">
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                      {company.name}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                      {company.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-sm">{company.address}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="text-sm">{company.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="text-sm">{company.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Warning and Action */}
                  <div className="flex flex-col space-y-3 lg:ml-6">
                    <Badge
                      variant="destructive"
                      className="text-base px-4 py-2 font-semibold self-start"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {company.totalReports} scam reports
                    </Badge>
                    <Button
                      onClick={() =>
                        navigate("/complaint", {
                          state: {
                            companyName: company.name,
                            companyLocation: company.location,
                          },
                        })
                      }
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Report This Company
                    </Button>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">
                    Services Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((service, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reports">Scam Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Operating Hours */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Operating Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(company.hours).map(([day, hours]) => (
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

            {/* License Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>License & Registration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">DED License Number</span>
                    <span className="text-muted-foreground">
                      {company.licenseNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Established</span>
                    <span className="text-muted-foreground">
                      {company.establishedYear}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Business Type</span>
                    <span className="text-muted-foreground">
                      Visa Consultation Services
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Company Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Always show photos - simplified approach */}
                {businessData?.photos && businessData.photos.length > 0 ? (
                  <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    📷 Showing {businessData.photos.length} real business photos
                    from Google My Business
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    📷 Showing placeholder photo gallery for this business
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {company.photos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200">
                        {photo.url && businessData?.photos ? (
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback to placeholder if Google image fails
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
                        <div
                          className={`photo-placeholder text-center text-gray-500 ${photo.url && businessData?.photos ? "hidden" : ""}`}
                        >
                          <Camera className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm font-medium">{photo.caption}</p>
                          <p className="text-xs text-gray-400">
                            Photo placeholder
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center font-medium">
                        {photo.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>
                  Customer Reviews (
                  {businessData?.reviews?.length || company.totalReviews})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show real reviews from business data if available */}
                {businessData?.reviews && businessData.reviews.length > 0 ? (
                  <>
                    <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      ⭐ Showing {businessData.reviews.length} real Google
                      reviews from verified customers
                    </div>
                    {businessData.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-6 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {review.authorName}
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{review.timeAgo}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                      ⚠️ No real Google reviews available for this business.
                      Please run "Sync Real Google Reviews" from the admin panel
                      to fetch authentic customer reviews.
                    </div>
                    {company.positiveReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-6 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {review.reviewerName}
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scam Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    ⚠️ Warning: Multiple Fraud Reports
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This company has multiple reports of fraudulent activity.
                    Exercise extreme caution before engaging their services or
                    providing any personal information or payments.
                  </p>
                </div>
              </div>
            </div>

            {/* Reports */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                Reported Scams ({company.totalReports})
              </h3>

              {company.reports.map((report) => (
                <Card key={report.id} className="shadow-md border-0">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="bg-destructive/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {report.reporterName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Applied for {report.visaType} to {report.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">
                      {report.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="shadow-lg border-0 mt-12">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-4">
              Have you been scammed by this company?
            </h3>
            <p className="text-muted-foreground mb-6">
              Help protect others by sharing your experience. Your report can
              prevent others from becoming victims.
            </p>
            <Button
              size="lg"
              onClick={() =>
                navigate("/complaint", {
                  state: {
                    companyName: company.name,
                    companyLocation: company.location,
                  },
                })
              }
              className="bg-primary hover:bg-primary/90"
            >
              File a Report Against This Company
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
