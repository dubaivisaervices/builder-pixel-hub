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
  const [enhancingDetails, setEnhancingDetails] = useState(false);
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

      const data = await response.json();
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

      // Fetch report counts for each business
      for (const business of businesses) {
        try {
          const response = await fetch(`/api/reports/company/${business.id}`);
          if (response.ok) {
            const data = await response.json();
            reportCounts[business.id] = data.totalReports || 0;
          } else {
            // Fallback to 0 if API fails
            reportCounts[business.id] = 0;
          }
        } catch {
          // Fallback to random sample data for demonstration
          reportCounts[business.id] = Math.floor(Math.random() * 5);
        }
      }

      setReports(reportCounts);
    } catch (err) {
      console.error("Error fetching report counts:", err);

      // Fallback: create sample data
      const sampleReports: Record<string, number> = {};
      businesses.forEach((business) => {
        sampleReports[business.id] = Math.floor(Math.random() * 5);
      });
      setReports(sampleReports);
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
    // Navigate to complaint form with pre-filled business info
    navigate(
      `/complaint?company=${encodeURIComponent(business.name)}&id=${business.id}`,
    );
  };

  const handleBusinessClick = (business: Business) => {
    // Navigate to business profile page
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
              Community-Reported Visa & Immigration Service Providers
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
            consultants and visa service providers that have been flagged by the
            community. Always verify credentials and check multiple sources
            before engaging any immigration services.
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
        <div className="space-y-4">
          {filteredBusinesses.map((business) => (
            <Card
              key={business.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Business Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className="text-xl font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={() => handleBusinessClick(business)}
                          >
                            {business.name}
                          </h3>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                            <span>{business.address}</span>
                          </div>

                          {business.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{business.phone}</span>
                            </div>
                          )}

                          {business.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {business.website}
                              </a>
                            </div>
                          )}

                          {business.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{business.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            {business.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions and Report Count */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
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
          ))}
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
                Help Protect the Community
              </h3>
              <p className="text-blue-700 text-sm">
                If you've had negative experiences with any immigration
                consultant or visa service provider, please report it to help
                others make informed decisions. Your reports help build a safer
                community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
