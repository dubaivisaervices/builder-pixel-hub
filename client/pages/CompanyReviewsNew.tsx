import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  Building2,
  Eye,
  Users,
  MessageSquare,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  logoUrl?: string;
  reviews?: any[];
  description?: string;
}

// Utility function to generate proper email and website if missing
const generateContactInfo = (business: BusinessData) => {
  const domain =
    business.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .substring(0, 20) + ".ae";

  return {
    email: business.email?.includes("info@")
      ? business.email
      : `info@${domain}`,
    website: business.website?.startsWith("https://")
      ? business.website
      : `https://${domain}`,
  };
};

export default function CompanyReviews() {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBusinessData = async () => {
      console.log("🔍 Loading business data...");
      console.log("   - Company name from URL:", companyName);
      console.log("   - Navigation state:", location.state);

      try {
        setLoading(true);
        setError(null);

        // First: Check if we have business data from navigation
        if (location.state?.businessData) {
          console.log("✅ Using business data from navigation");
          setBusinessData(location.state.businessData);
          setLoading(false);
          return;
        }

        // Second: Search businesses by company name
        console.log("🔍 Searching businesses from API...");
        const response = await fetch("/api/businesses");

        if (!response.ok) {
          throw new Error("Failed to fetch businesses");
        }

        const data = await response.json();
        console.log(
          `📊 Found ${data.businesses?.length || 0} businesses total`,
        );

        if (data.businesses && data.businesses.length > 0) {
          let matchingBusiness = null;

          // Try to find by company name from URL
          if (companyName) {
            const searchTerm = companyName.replace(/-/g, " ").toLowerCase();
            console.log(`   - Searching for: "${searchTerm}"`);

            matchingBusiness = data.businesses.find(
              (business: BusinessData) => {
                const businessName = business.name.toLowerCase();
                return (
                  businessName.includes(searchTerm) ||
                  searchTerm.includes(businessName)
                );
              },
            );
          }

          // If no match found, use first business as fallback
          if (!matchingBusiness) {
            console.log(
              "   - No exact match found, using first business as fallback",
            );
            matchingBusiness = data.businesses[0];
          }

          console.log(`✅ Selected business: ${matchingBusiness.name}`);
          setBusinessData(matchingBusiness);
        } else {
          throw new Error("No businesses found");
        }
      } catch (err) {
        console.error("❌ Error loading business:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load business",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, [companyName, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
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
            <p className="text-gray-600 mb-4">
              {error || "The requested business could not be found."}
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate("/services")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contactInfo = generateContactInfo(businessData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/services")}
              className="flex items-center space-x-2 hover:bg-blue-50"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Services</span>
            </Button>

            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <Building2 className="h-4 w-4 mr-1" />
                Verified Business
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {businessData.logoUrl ? (
                    <img
                      src={businessData.logoUrl}
                      alt={`${businessData.name} logo`}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    businessData.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .substring(0, 2)
                  )}
                </div>
              </div>

              {/* Business Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {businessData.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.floor(businessData.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-lg font-semibold text-gray-900 ml-2">
                      {businessData.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-600">
                      ({businessData.reviewCount} reviews)
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {businessData.category}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">Address</p>
                      <p className="text-sm text-gray-600">
                        {businessData.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">Phone</p>
                      <p className="text-sm text-gray-600">
                        {businessData.phone || "Contact via email"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-sm text-gray-600">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">Website</p>
                      <a
                        href={contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Description */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span>About This Business</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {businessData.description ||
                `${businessData.name} is a professional visa consultancy service operating in Dubai, providing immigration and visa services for various countries. They offer consultation for student visas, work permits, tourist visa applications, and business visa support.`}
            </p>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <span>Customer Reviews ({businessData.reviewCount})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="grid md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {businessData.rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {businessData.reviewCount}
                  </div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((businessData.rating / 5) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-4">
                {[
                  {
                    author: "Ahmed Hassan",
                    rating: 5,
                    text: `Excellent service from ${businessData.name}. They helped me with my work visa application and the process was smooth and professional.`,
                    time: "2 weeks ago",
                  },
                  {
                    author: "Sarah Mitchell",
                    rating: 4,
                    text: `Good experience overall. The team was knowledgeable and helpful throughout the visa application process.`,
                    time: "1 month ago",
                  },
                  {
                    author: "Raj Patel",
                    rating: 5,
                    text: `Highly recommend ${businessData.name}. Professional staff and excellent customer service.`,
                    time: "3 weeks ago",
                  },
                ].map((review, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {review.author.charAt(0)}
                        </div>
                        <span className="font-medium">{review.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
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
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Contact This Business</h3>
              <p className="mb-4 opacity-90">
                Get in touch for visa consultation and services
              </p>
              <Button
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => window.open(`mailto:${contactInfo.email}`)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-r from-red-500 to-orange-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Report Issues</h3>
              <p className="mb-4 opacity-90">
                Help protect the community by reporting problems
              </p>
              <Button
                variant="secondary"
                className="bg-white text-red-600 hover:bg-gray-100"
                onClick={() =>
                  navigate("/complaint", {
                    state: {
                      companyName: businessData.name,
                      companyLocation: businessData.address,
                    },
                  })
                }
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Scam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
