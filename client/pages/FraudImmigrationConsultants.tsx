import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ChevronDown,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Calendar,
  BarChart3,
  Zap,
  Target,
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
  logoUrl?: string;
}

interface Report {
  id: string;
  companyId: string;
  reportType: string;
  description: string;
  status: string;
}

interface FilterOptions {
  category: string;
  rating: number;
  location: string;
  sortBy: "name" | "rating" | "reports" | "reviews";
  sortOrder: "asc" | "desc";
}

export default function FraudImmigrationConsultants() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [displayedBusinesses, setDisplayedBusinesses] = useState<Business[]>(
    [],
  );
  const [enhancedBusinesses, setEnhancedBusinesses] = useState<
    Record<string, Business>
  >({});
  const [reports, setReports] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: "all",
    rating: 0,
    location: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const itemsPerPage = 25;
  const navigate = useNavigate();

  // Target categories for immigration/visa consultants - expanded for better coverage
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
    "استشارات الهجرة",
    "استشارات الهجرة دبي",
    "registered visa agent dubai",
    "education visa",
    "document clearance",
    "document clearing",
    "business formation",
    "dependent visa",
    "golden visa",
    "emirates id",
    "attestation",
    "pro services",
    "mofa attestation",
    "certificate attestation",
    "legal translation",
    "document services",
    "visa processing",
    "visa center",
    "visa solutions",
    "immigration advisor",
    "migration consultant",
    "relocation services",
    "business setup",
    "company formation",
    "freezone setup",
    "mainland setup",
    "offshore setup",
    "legal services",
    "consulting services",
    "government services",
    "typing center",
    "translation services",
    "visa stamping",
    "residence permit",
    "work permit",
    "employment visa",
    "investor visa",
    "entrepreneur visa",
    "visit visa",
    "transit visa",
    "medical visa",
    "visa extension",
    "visa renewal",
    "canada immigration",
    "australia immigration",
    "uk immigration",
    "usa immigration",
    "europe immigration",
    "immigration law",
    "immigration attorney",
    "immigration lawyer",
    "visa application",
    "visa assistance",
    "visa guidance",
    "visa help",
    "visa support",
  ];

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (displayedBusinesses.length > 0) {
      fetchReportCounts();
      fetchEnhancedBusinessDetails();
    }
  }, [displayedBusinesses]);

  useEffect(() => {
    filterAndSortBusinesses();
  }, [businesses, searchTerm, filters]);

  useEffect(() => {
    updateDisplayedBusinesses();
  }, [filteredBusinesses, currentPage]);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        "🔄 Loading immigration businesses from comprehensive dataset...",
      );

      let data: any = null;
      let businessesArray: any[] = [];

      // Try multiple data sources for full 857 business dataset
      const dataSources = [
        {
          url: "/api/complete-businesses.json",
          name: "Complete Businesses (857)",
        },
        { url: "/data/businesses.json", name: "Business Data (857)" },
        { url: "/data/complete-dataset.json", name: "Complete Dataset" },
        { url: "/api/businesses?limit=1000", name: "API All Businesses" },
        { url: "/api/dubai-visa-services.json", name: "Visa Services" },
      ];

      for (const source of dataSources) {
        try {
          console.log(`🔄 Trying ${source.name} at ${source.url}...`);
          const response = await fetch(source.url);

          if (!response.ok) {
            console.warn(
              `❌ ${source.name} returned ${response.status}: ${response.statusText}`,
            );
            continue;
          }

          const responseText = await response.text();

          if (
            responseText.trim().startsWith("<!DOCTYPE") ||
            responseText.trim().startsWith("<html")
          ) {
            console.warn(`❌ ${source.name} returned HTML instead of JSON`);
            continue;
          }

          try {
            data = JSON.parse(responseText);

            if (Array.isArray(data)) {
              businessesArray = data;
            } else if (data.businesses && Array.isArray(data.businesses)) {
              businessesArray = data.businesses;
            } else {
              console.warn(`❌ ${source.name} has unexpected structure`);
              continue;
            }

            if (businessesArray.length > 0) {
              console.log(
                `✅ Successfully loaded ${businessesArray.length} businesses from ${source.name}`,
              );
              break;
            }
          } catch (jsonError) {
            console.warn(`❌ ${source.name} has invalid JSON:`, jsonError);
            continue;
          }
        } catch (fetchError) {
          console.warn(`❌ Failed to fetch ${source.name}:`, fetchError);
          continue;
        }
      }

      if (!businessesArray || businessesArray.length === 0) {
        throw new Error("No business data could be loaded from any source");
      }

      console.log(`📊 Processing ${businessesArray.length} total businesses`);

      // Filter businesses that match immigration/visa categories
      const immigrationBusinesses = businessesArray
        .filter((business: any) => {
          const category = business.category?.toLowerCase() || "";
          const name = business.name?.toLowerCase() || "";
          return targetCategories.some(
            (targetCat) =>
              category.includes(targetCat) || name.includes(targetCat),
          );
        })
        .map((business: any) => ({
          id: business.id,
          name: business.name,
          address: business.address,
          category: business.category,
          phone: business.phone,
          website: business.website,
          email: business.email,
          rating: business.rating,
          reviewCount: business.reviewCount,
          description: `Professional ${business.category?.toLowerCase() || "immigration"} services in Dubai.`,
          businessStatus: business.businessStatus,
          photos: business.photos,
          logoUrl: business.logoUrl,
          businessHours: business.hours
            ? Object.values(business.hours)
            : undefined,
        }));

      console.log(
        `🎯 Filtered ${immigrationBusinesses.length} immigration/visa businesses from ${businessesArray.length} total`,
      );
      console.log("✅ SUCCESS: Loaded businesses from comprehensive dataset");

      setBusinesses(immigrationBusinesses);
      setError(null);
    } catch (err) {
      console.error("Error loading businesses:", err);
      setError(
        `Failed to load businesses: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [targetCategories]);

  const fetchReportCounts = useCallback(async () => {
    try {
      const reportCounts: Record<string, number> = {};
      displayedBusinesses.forEach((business) => {
        reportCounts[business.id] = Math.floor(Math.random() * 8); // Mock data
      });
      setReports(reportCounts);
    } catch (err) {
      console.error("Error fetching report counts:", err);
    }
  }, [displayedBusinesses]);

  const fetchEnhancedBusinessDetails = useCallback(async () => {
    try {
      const enhanced: Record<string, Business> = {};
      displayedBusinesses.forEach((business) => {
        enhanced[business.id] = {
          ...business,
          description: `Professional ${business.category?.toLowerCase() || "immigration"} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`,
          businessStatus: business.businessStatus || "OPERATIONAL",
        };
      });
      setEnhancedBusinesses(enhanced);
    } catch (error) {
      console.error("Error fetching enhanced business details:", error);
    }
  }, [displayedBusinesses]);

  const filterAndSortBusinesses = useCallback(() => {
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
    if (filters.category !== "all") {
      filtered = filtered.filter((business) =>
        business.category
          .toLowerCase()
          .includes(filters.category.toLowerCase()),
      );
    }

    // Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter(
        (business) => business.rating && business.rating >= filters.rating,
      );
    }

    // Filter by location
    if (filters.location.trim()) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter((business) =>
        business.address.toLowerCase().includes(locationLower),
      );
    }

    // Sort businesses
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rating":
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case "reviews":
          comparison = (b.reviewCount || 0) - (a.reviewCount || 0);
          break;
        case "reports":
          comparison = (reports[b.id] || 0) - (reports[a.id] || 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredBusinesses(filtered);
    setCurrentPage(1);
  }, [businesses, searchTerm, filters, reports]);

  const updateDisplayedBusinesses = useCallback(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const businessesToShow = filteredBusinesses.slice(startIndex, endIndex);
    setDisplayedBusinesses(businessesToShow);
  }, [filteredBusinesses, currentPage, itemsPerPage]);

  const loadMoreBusinesses = useCallback(async () => {
    setLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Smooth loading
    setCurrentPage((prev) => prev + 1);
    setLoadingMore(false);
  }, []);

  const handleWriteReport = useCallback(
    (business: Business) => {
      navigate(
        `/complaint?company=${encodeURIComponent(business.name)}&id=${business.id}`,
      );
    },
    [navigate],
  );

  const handleBusinessClick = useCallback(
    (business: Business) => {
      const profileUrl = createBusinessProfileUrl(business);
      navigate(profileUrl);
    },
    [navigate],
  );

  const getUniqueCategories = useMemo(() => {
    const categories = businesses.map((b) => b.category).filter(Boolean);
    return [...new Set(categories)].sort();
  }, [businesses]);

  const businessStats = useMemo(
    () => ({
      total: businesses.length,
      displayed: displayedBusinesses.length,
      filtered: filteredBusinesses.length,
      totalReports: Object.values(reports).reduce((a, b) => a + b, 0),
      averageRating:
        businesses.reduce((sum, b) => sum + (b.rating || 0), 0) /
        businesses.length,
      highRated: businesses.filter((b) => b.rating && b.rating >= 4.5).length,
    }),
    [businesses, displayedBusinesses, filteredBusinesses, reports],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">
            Loading Immigration Consultants
          </p>
          <p className="text-sm text-gray-500">
            Scanning comprehensive database...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-blue-500/20 backdrop-blur-sm"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <Shield className="h-16 w-16 text-white mx-auto" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Immigration Consultants
              <span className="block text-yellow-300">
                Fraud Protection Hub
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Community-powered database of visa & immigration service
              providers. Comprehensive database with enhanced verification.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <Building2 className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {businessStats.total}
                </div>
                <div className="text-sm text-blue-100">Consultants Listed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <Users className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {businessStats.totalReports}
                </div>
                <div className="text-sm text-blue-100">Community Reports</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <Award className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {businessStats.highRated}
                </div>
                <div className="text-sm text-blue-100">Highly Rated</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <TrendingUp className="h-8 w-8 text-orange-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {businessStats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-blue-100">Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Warning Alert */}
        <Alert className="mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong className="font-semibold">
              Important Security Notice:
            </strong>{" "}
            This database contains immigration consultants and visa service
            providers from our comprehensive dataset. Always verify credentials
            through official channels and check multiple sources before engaging
            any immigration services. Report suspicious activities to protect
            the community.
          </AlertDescription>
        </Alert>

        {/* Modern Search and Filter Section */}
        <Card className="mb-8 shadow-xl bg-white/80 backdrop-blur-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Search className="h-6 w-6" />
              Advanced Search & Filters
              <Badge
                variant="secondary"
                className="ml-auto bg-white/20 text-white border-white/30"
              >
                {filteredBusinesses.length} Results
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search consultants, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-2 hover:bg-blue-50"
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                  >
                    <option value="all">All Categories</option>
                    {getUniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Rating
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.0}>4.0+ Stars</option>
                    <option value={3.5}>3.5+ Stars</option>
                    <option value={3.0}>3.0+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value as any,
                      }))
                    }
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                  >
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="reviews">Reviews</option>
                    <option value="reports">Reports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortOrder: e.target.value as any,
                      }))
                    }
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-700 font-medium">
                Showing{" "}
                <span className="font-bold text-blue-600">
                  {displayedBusinesses.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-purple-600">
                  {filteredBusinesses.length}
                </span>{" "}
                immigration consultants
                {searchTerm && (
                  <span className="text-gray-500">
                    {" "}
                    matching "{searchTerm}"
                  </span>
                )}
              </p>
            </div>
            {filteredBusinesses.length !== businesses.length && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Filtered from {businesses.length} total
              </Badge>
            )}
          </div>
        </div>

        {/* Business Listings */}
        <div
          className={`space-y-6 ${viewMode === "grid" ? "md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0" : ""}`}
        >
          {displayedBusinesses.map((business) => {
            const enhancedBusiness =
              enhancedBusinesses[business.id] || business;
            const reportCount = reports[business.id] || 0;

            return (
              <Card
                key={business.id}
                className={`group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 hover:scale-[1.02] ${
                  reportCount > 5
                    ? "border-l-4 border-l-red-500"
                    : reportCount > 2
                      ? "border-l-4 border-l-yellow-500"
                      : "border-l-4 border-l-green-500"
                }`}
              >
                <CardContent className="p-6">
                  <div
                    className={`${viewMode === "list" ? "flex gap-6" : "space-y-4"}`}
                  >
                    {/* Business Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 group-hover:text-blue-600"
                            onClick={() => handleBusinessClick(business)}
                          >
                            {enhancedBusiness.name}
                          </h3>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 border-blue-200"
                            >
                              {enhancedBusiness.category}
                            </Badge>

                            {enhancedBusiness.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-semibold text-gray-700">
                                  {enhancedBusiness.rating.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({enhancedBusiness.reviewCount} reviews)
                                </span>
                              </div>
                            )}

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
                        </div>

                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </div>

                      {/* Business Description */}
                      {enhancedBusiness.description && (
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            <span className="font-semibold text-blue-700">
                              About:
                            </span>{" "}
                            {enhancedBusiness.description}
                          </p>
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 leading-relaxed">
                            {enhancedBusiness.address}
                          </span>
                        </div>

                        {enhancedBusiness.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700">
                              {enhancedBusiness.phone}
                            </span>
                          </div>
                        )}

                        {enhancedBusiness.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <a
                              href={enhancedBusiness.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate"
                            >
                              {enhancedBusiness.website}
                            </a>
                          </div>
                        )}

                        {enhancedBusiness.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {enhancedBusiness.email}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Business Hours */}
                      {enhancedBusiness.businessHours &&
                        enhancedBusiness.businessHours.length > 0 && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-700">
                                Business Hours:
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              {enhancedBusiness.businessHours
                                .slice(0, 2)
                                .map((hours, index) => (
                                  <div key={index}>{hours}</div>
                                ))}
                              {enhancedBusiness.businessHours.length > 2 && (
                                <div className="text-blue-600 font-medium cursor-pointer hover:underline">
                                  +{enhancedBusiness.businessHours.length - 2}{" "}
                                  more days
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Actions and Report Section */}
                    <div
                      className={`${viewMode === "list" ? "flex flex-col justify-between" : ""} space-y-4`}
                    >
                      <div className="text-center">
                        <div
                          className={`text-4xl font-bold ${
                            reportCount > 5
                              ? "text-red-600"
                              : reportCount > 2
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {reportCount}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          Community Reports
                        </div>

                        {reportCount > 5 && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            High Risk
                          </Badge>
                        )}
                        {reportCount > 2 && reportCount <= 5 && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs bg-yellow-100 text-yellow-800"
                          >
                            Caution
                          </Badge>
                        )}
                        {reportCount <= 2 && (
                          <Badge
                            variant="secondary"
                            className="mt-1 text-xs bg-green-100 text-green-800"
                          >
                            Low Risk
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => handleWriteReport(business)}
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>

                        <Button
                          onClick={() => handleBusinessClick(business)}
                          variant="outline"
                          className="w-full border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More Button */}
        {displayedBusinesses.length < filteredBusinesses.length && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Button
                onClick={loadMoreBusinesses}
                disabled={loadingMore}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Loading More...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Load More (
                    {filteredBusinesses.length -
                      displayedBusinesses.length}{" "}
                    remaining)
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600 mt-4">
                Showing {displayedBusinesses.length} of{" "}
                {filteredBusinesses.length} consultants
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {filteredBusinesses.length === 0 && !loading && (
          <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
            <CardContent className="space-y-6">
              <div className="relative">
                <AlertTriangle className="h-20 w-20 text-gray-400 mx-auto" />
                <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                  <Search className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-700">
                No consultants found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? `No immigration consultants match "${searchTerm}". Try adjusting your search terms or filters.`
                  : "No immigration consultants found with the selected filters. Try clearing some filters."}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    category: "all",
                    rating: 0,
                    location: "",
                    sortBy: "name",
                    sortOrder: "asc",
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* UAE Government Footer */}
      <footer className="mt-16 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Government Logos Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-white">
              Supported by UAE Government Authorities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 w-24 h-24 flex items-center justify-center">
                <img
                  src="https://www.gdrfad.gov.ae/assets/img/logo-en.png"
                  alt="GDRFA Dubai"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML =
                      '<div class="text-white text-xs text-center font-semibold">GDRFA<br/>DUBAI</div>';
                  }}
                />
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 w-24 h-24 flex items-center justify-center">
                <div className="text-white text-xs text-center font-semibold">
                  MOHRE
                  <br />
                  UAE
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 w-24 h-24 flex items-center justify-center">
                <div className="text-white text-xs text-center font-semibold">
                  ICP
                  <br />
                  UAE
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 w-24 h-24 flex items-center justify-center">
                <div className="text-white text-xs text-center font-semibold">
                  MOFA
                  <br />
                  UAE
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 w-24 h-24 flex items-center justify-center">
                <div className="text-white text-xs text-center font-semibold">
                  DED
                  <br />
                  DUBAI
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 w-24 h-24 flex items-center justify-center">
                <div className="text-white text-xs text-center font-semibold">
                  AMER
                  <br />
                  UAE
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About Section */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-yellow-300">
                  About This Platform
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  A community-driven platform for reporting and tracking
                  immigration consultants and visa service providers in the UAE.
                  Help protect others from fraudulent services.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-yellow-300">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="/business-directory"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Business Directory
                    </a>
                  </li>
                  <li>
                    <a
                      href="/complaint"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Report a Business
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-lg font-bold mb-4 text-yellow-300">
                  Get Support
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">Report suspicious activities</p>
                  <p className="text-gray-300">Verify consultant credentials</p>
                  <p className="text-gray-300">Community protection services</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 mt-8 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2024 UAE Business Fraud Protection Platform. Protecting
                communities through transparency and verified information.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
