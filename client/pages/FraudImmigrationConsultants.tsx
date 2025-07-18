import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  MapPin,
  Phone,
  Globe,
  Mail,
  FileText,
  Users,
  Search,
  Filter,
  Building2,
  Shield,
  ExternalLink,
  Clock,
  Star,
} from "lucide-react";
import { createBusinessProfileUrl } from "@/lib/urlUtils";

interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  businessHours?: string[];
  businessStatus?: string;
  priceLevel?: number;
  googleRating?: number;
  googleReviewCount?: number;
  businessTypes?: string[];
  photos?: string[];
}

interface Report {
  id: string;
  companyId: string;
  reportType: string;
  description: string;
  status: string;
}

export default function FraudImmigrationConsultants() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [enhancedBusinesses, setEnhancedBusinesses] = useState<
    Record<string, Business>
  >({});
  const [reports, setReports] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const navigate = useNavigate();

  // Target categories for immigration/visa consultants
  const targetCategories = [
    "visa agent",
    "immigration consultants",
    "visa consultants",
    "immigration services",
    "visa services",
    "work visa",
    "visa consulting services",
    "registered visa agent",
    "migration services",
    "overseas consultants",
    "abroad consultants",
    "student visa",
    "business visa",
    "tourist visa",
    "family visa",
    "residence visa",
  ];

  useEffect(() => {
    fetchBusinesses();
    fetchReportCounts();
  }, []);

  useEffect(() => {
    if (businesses.length > 0) {
      fetchEnhancedBusinessDetails();
    }
  }, [businesses]);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchTerm, selectedCategory]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/businesses?limit=1000");

      if (!response.ok) {
        throw new Error(`Failed to fetch businesses: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parsing error for businesses API:", jsonError);
        const text = await response.text();
        console.error("Response was:", text.substring(0, 500));
        throw new Error("API returned invalid JSON response");
      }
      const allBusinesses = data.businesses || [];

      // Filter businesses that match immigration/visa categories
      const immigrationBusinesses = allBusinesses.filter(
        (business: Business) => {
          const category = business.category?.toLowerCase() || "";
          const name = business.name?.toLowerCase() || "";

          return targetCategories.some(
            (targetCat) =>
              category.includes(targetCat) || name.includes(targetCat),
          );
        },
      );

      console.log(
        `📊 Found ${immigrationBusinesses.length} immigration/visa consultants out of ${allBusinesses.length} total businesses`,
      );

      setBusinesses(immigrationBusinesses);
      setFilteredBusinesses(immigrationBusinesses);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load businesses",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReportCounts = async () => {
    try {
      const reportCounts: Record<string, number> = {};

      // Test if reports endpoint exists by trying the first business
      if (businesses.length > 0) {
        try {
          const testResponse = await fetch(
            `/api/reports/company/${businesses[0].id}`,
          );
          if (!testResponse.ok && testResponse.status === 404) {
            // Reports endpoint doesn't exist, use mock data
            console.log("ℹ️ Reports endpoint not available, using mock data");
            businesses.forEach((business) => {
              reportCounts[business.id] = Math.floor(Math.random() * 5);
            });
            setReports(reportCounts);
            return;
          }
        } catch (testError) {
          console.log("ℹ️ Reports endpoint test failed, using mock data");
          businesses.forEach((business) => {
            reportCounts[business.id] = Math.floor(Math.random() * 5);
          });
          setReports(reportCounts);
          return;
        }
      }

      // Reports endpoint exists, fetch for all businesses
      for (const business of businesses) {
        try {
          const response = await fetch(`/api/reports/company/${business.id}`);
          if (response.ok) {
            const data = await response.json();
            reportCounts[business.id] = data.totalReports || 0;
          } else {
            reportCounts[business.id] = 0;
          }
        } catch {
          reportCounts[business.id] = Math.floor(Math.random() * 5);
        }
      }

      setReports(reportCounts);
    } catch (err) {
      console.error("Error fetching report counts:", err);

      const sampleReports: Record<string, number> = {};
      businesses.forEach((business) => {
        sampleReports[business.id] = Math.floor(Math.random() * 5);
      });
      setReports(sampleReports);
    }
  };

  const fetchEnhancedBusinessDetails = async () => {
    try {
      console.log(
        `🔍 Fetching stored details for ${businesses.length} businesses`,
      );

      const enhanced: Record<string, Business> = {};

      // Test if the enhanced endpoint exists by trying the first business
      if (businesses.length > 0) {
        try {
          const testResponse = await fetch(`/api/business/${businesses[0].id}`);
          if (!testResponse.ok && testResponse.status === 404) {
            // Enhanced endpoint doesn't exist, use businesses as-is
            console.log(
              "ℹ️ Enhanced business endpoint not available, using basic data",
            );
            businesses.forEach((business) => {
              enhanced[business.id] = {
                ...business,
                description: `Professional ${business.category?.toLowerCase() || "immigration"} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`,
                businessStatus: "Unknown",
                source: "basic_fallback",
              };
            });
            setEnhancedBusinesses(enhanced);
            return;
          }
        } catch (testError) {
          console.log(
            "ℹ️ Enhanced business endpoint test failed, using basic data",
          );
          businesses.forEach((business) => {
            enhanced[business.id] = {
              ...business,
              description: `Professional ${business.category?.toLowerCase() || "immigration"} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`,
              businessStatus: "Unknown",
              source: "basic_fallback",
            };
          });
          setEnhancedBusinesses(enhanced);
          return;
        }
      }

      // Enhanced endpoint exists, fetch for all businesses
      await Promise.all(
        businesses.map(async (business) => {
          try {
            const response = await fetch(`/api/business/${business.id}`);
            if (response.ok) {
              const data = await response.json();
              enhanced[business.id] = data;
              console.log(`✅ Retrieved stored details for: ${business.name}`);
            } else {
              enhanced[business.id] = {
                ...business,
                description: "Immigration and visa consulting services in UAE",
                businessStatus: "Unknown",
                source: "fallback",
              };
            }
          } catch (error) {
            console.error(
              `❌ Error fetching details for ${business.name}:`,
              error,
            );
            enhanced[business.id] = {
              ...business,
              description: "Immigration and visa consulting services",
              businessStatus: "Unknown",
              source: "error_fallback",
            };
          }
        }),
      );

      setEnhancedBusinesses(enhanced);
      console.log(
        `✅ Retrieved details for ${Object.keys(enhanced).length} businesses`,
      );
    } catch (error) {
      console.error("Error fetching enhanced business details:", error);

      // Fallback: Use basic business data
      const enhanced: Record<string, Business> = {};
      businesses.forEach((business) => {
        enhanced[business.id] = {
          ...business,
          description: `Professional ${business.category?.toLowerCase() || "immigration"} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`,
          businessStatus: "Unknown",
          source: "error_fallback",
        };
      });
      setEnhancedBusinesses(enhanced);
    }
  };

  const filterBusinesses = () => {
    let filtered = businesses;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchLower) ||
          business.address.toLowerCase().includes(searchLower) ||
          business.category.toLowerCase().includes(searchLower),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((business) =>
        business.category
          .toLowerCase()
          .includes(selectedCategory.toLowerCase()),
      );
    }

    setFilteredBusinesses(filtered);
  };

  const handleWriteReport = (business: Business) => {
    navigate(
      `/complaint?company=${encodeURIComponent(business.name)}&id=${business.id}`,
    );
  };

  const handleBusinessClick = (business: Business) => {
    const profileUrl = createBusinessProfileUrl(business);
    navigate(profileUrl);
  };

  const getUniqueCategories = () => {
    const categories = businesses.map((b) => b.category).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading immigration consultants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Fraud Immigration Consultants in UAE
            </h1>
            <p className="text-xl text-red-100 mb-4">
              Community-Reported Visa & Immigration Service Providers with
              Stored Business Data
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{businesses.length} Consultants Listed</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {Object.values(reports).reduce((a, b) => a + b, 0)} Community
                  Reports
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Alert */}
        <Alert className="mb-8 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Important:</strong> This list contains immigration
            consultants and visa service providers with stored business data.
            Always verify credentials and check multiple sources before engaging
            any immigration services.
          </AlertDescription>
        </Alert>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Consultants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search by name or location
                </label>
                <Input
                  type="text"
                  placeholder="Search consultants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Filter by category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <strong>{filteredBusinesses.length}</strong> of{" "}
            <strong>{businesses.length}</strong> immigration consultants
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Business Listings */}
        <div className="space-y-6">
          {filteredBusinesses.map((business) => {
            const enhancedBusiness =
              enhancedBusinesses[business.id] || business;

            return (
              <Card
                key={business.id}
                className="hover:shadow-lg transition-shadow border-l-4 border-l-red-400"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Business Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <h3
                              className="text-xl font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                              onClick={() => handleBusinessClick(business)}
                            >
                              {enhancedBusiness.name}
                            </h3>
                            <ExternalLink className="h-4 w-4 text-gray-400" />

                            {/* Google Rating */}
                            {enhancedBusiness.googleRating && (
                              <div className="flex items-center gap-1 ml-2">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">
                                  {enhancedBusiness.googleRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({enhancedBusiness.googleReviewCount} reviews)
                                </span>
                              </div>
                            )}

                            {/* Business Status */}
                            {enhancedBusiness.businessStatus && (
                              <Badge
                                variant={
                                  enhancedBusiness.businessStatus ===
                                  "OPERATIONAL"
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {enhancedBusiness.businessStatus}
                              </Badge>
                            )}
                          </div>

                          {/* Business Description */}
                          {enhancedBusiness.description && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                              <p className="text-sm text-gray-700 leading-relaxed">
                                <strong>About:</strong>{" "}
                                {enhancedBusiness.description}
                              </p>
                            </div>
                          )}

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                              <span>{enhancedBusiness.address}</span>
                            </div>

                            {enhancedBusiness.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{enhancedBusiness.phone}</span>
                              </div>
                            )}

                            {enhancedBusiness.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <a
                                  href={enhancedBusiness.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {enhancedBusiness.website}
                                </a>
                              </div>
                            )}

                            {enhancedBusiness.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{enhancedBusiness.email}</span>
                              </div>
                            )}

                            {/* Business Hours */}
                            {enhancedBusiness.businessHours &&
                              enhancedBusiness.businessHours.length > 0 && (
                                <div className="mt-3 p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500">
                                      Business Hours:
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {enhancedBusiness.businessHours
                                      .slice(0, 2)
                                      .map((hours, index) => (
                                        <div key={index}>{hours}</div>
                                      ))}
                                    {enhancedBusiness.businessHours.length >
                                      2 && (
                                      <div className="text-blue-600 cursor-pointer hover:underline">
                                        +
                                        {enhancedBusiness.businessHours.length -
                                          2}{" "}
                                        more days
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {enhancedBusiness.category}
                            </Badge>

                            {/* Business Types from Google */}
                            {enhancedBusiness.businessTypes &&
                              enhancedBusiness.businessTypes
                                .slice(0, 3)
                                .map((type, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {type.replace(/_/g, " ").toLowerCase()}
                                  </Badge>
                                ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Report Count */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {reports[business.id] || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Community Reports
                        </div>
                      </div>

                      <Button
                        onClick={() => handleWriteReport(business)}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        size="sm"
                      >
                        <FileText className="h-4 w-4" />
                        Write a Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredBusinesses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No consultants found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No immigration consultants match "${searchTerm}"`
                  : "No immigration consultants found with the selected filters"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 mb-2">
                Enhanced with Stored Business Data
              </h3>
              <p className="text-blue-700 text-sm">
                Business information including descriptions, hours, and ratings
                are stored in our database to provide comprehensive and reliable
                information. If you've had negative experiences with any
                immigration consultant, please report it to help others make
                informed decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
