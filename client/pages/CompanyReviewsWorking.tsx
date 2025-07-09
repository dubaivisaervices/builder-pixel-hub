import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  Building2,
  Users,
  MessageSquare,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Camera,
  Shield,
  ExternalLink,
  Home,
  ChevronRight,
  Clock,
  Award,
  TrendingUp,
  Send,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus?: string;
  photoReference?: string;
  logoUrl?: string;
  isOpen?: boolean;
  priceLevel?: number;
  hasTargetKeyword?: boolean;
  hours?: any;
  photos?: any[];
  reviews?: any[];
  description?: string;
}

export default function CompanyReviews() {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const loadBusiness = async () => {
      console.log("🔍 CompanyReviewsWorking: Loading business data");

      try {
        setLoading(true);
        setError(null);

        // Check navigation state first
        if (location.state?.businessData) {
          console.log("✅ Using navigation state data");
          const business = location.state.businessData;
          setBusinessData(business);
          setLoading(false);
          return;
        }

        // Fetch from API
        console.log("🔍 Fetching from API...");
        const response = await fetch("/api/businesses");

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();

        if (data.businesses && data.businesses.length > 0) {
          let business = data.businesses[0]; // Default fallback

          // Try to find matching business by name
          if (companyName) {
            const searchName = companyName.replace(/-/g, " ").toLowerCase();
            const found = data.businesses.find(
              (b: BusinessData) =>
                b.name.toLowerCase().includes(searchName) ||
                searchName.includes(b.name.toLowerCase()),
            );
            if (found) {
              business = found;
              console.log(`✅ Found matching business: ${business.name}`);
            } else {
              console.log(
                `⚠️ No exact match found for "${companyName}", using first business: ${business.name}`,
              );
            }
          }

          setBusinessData(business);
        } else {
          setError("No businesses found");
        }
      } catch (err) {
        console.error("❌ Error loading business:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [companyName, location.state]);

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href;
    const shareText = `Check out ${businessData?.name} - Professional visa consultancy services in Dubai`;
    const shareUrl = currentUrl;

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank",
      );
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        "_blank",
      );
    } else if (platform === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        "_blank",
      );
    } else if (platform === "email") {
      window.open(
        `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
        "_blank",
      );
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Business Not Found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate("/services")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/services")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span>Services</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">
                  {businessData.name}
                </span>
              </div>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare("email")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Header */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      {businessData.logoUrl ? (
                        <img
                          src={businessData.logoUrl}
                          alt={businessData.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <Building2 className="h-12 w-12 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-grow space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {businessData.name}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Verified Business
                        </Badge>
                        <Badge variant="outline">{businessData.category}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= businessData.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-lg font-semibold">
                          {businessData.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-600">
                        ({businessData.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                      {businessData.address && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">
                            {businessData.address}
                          </span>
                        </div>
                      )}
                      {businessData.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{businessData.phone}</span>
                        </div>
                      )}
                      {businessData.website && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          <a
                            href={businessData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {businessData.email && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a
                            href={`mailto:${businessData.email}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {businessData.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Description */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>About This Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {businessData.description ||
                    `${businessData.name} is a professional visa consultancy service operating in Dubai, providing immigration and visa services for various countries. They offer consultation for student visas, work permits, tourist visa applications, and business visa support. The company provides comprehensive immigration advice and document processing services for clients seeking to travel to various destinations worldwide.`}
                </p>
              </CardContent>
            </Card>

            {/* Google Reviews Widget */}
            <GoogleReviewsWidget
              businessName={businessData.name}
              placeId={businessData.id}
              rating={businessData.rating}
              reviewCount={businessData.reviewCount}
            />

            {/* Photos Section */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-6 w-6" />
                  <span>Business Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {businessData.photos && businessData.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {businessData.photos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={
                              photo.photo_reference
                                ? `/api/business-photo/${photo.photo_reference}`
                                : photo.url ||
                                  `https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?auto=compress&cs=tinysrgb&w=400`
                            }
                            alt={`${businessData.name} photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?auto=compress&cs=tinysrgb&w=400`;
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          Business Photo {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No photos available for this business
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Photos will be displayed when available from Google
                      Business
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Business Stats */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Business Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-medium">
                    {businessData.rating.toFixed(1)}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <span className="font-medium">
                    {businessData.reviewCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-medium">{businessData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600"
                  >
                    {businessData.businessStatus || "Active"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {businessData.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{businessData.phone}</p>
                      <p className="text-sm text-gray-500">Phone</p>
                    </div>
                  </div>
                )}
                {businessData.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <a
                        href={`mailto:${businessData.email}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {businessData.email}
                      </a>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                )}
                {businessData.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <a
                        href={businessData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline flex items-center"
                      >
                        Website
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <p className="text-sm text-gray-500">Official Website</p>
                    </div>
                  </div>
                )}
                {businessData.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">{businessData.address}</p>
                      <p className="text-sm text-gray-500">Address</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Hours */}
            {businessData.hours && (
              <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-6 w-6" />
                    <span>Business Hours</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(businessData.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize text-gray-600">{day}</span>
                        <span className="font-medium">{hours as string}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
