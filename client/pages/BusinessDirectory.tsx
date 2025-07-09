import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  Users,
  AlertTriangle,
  Filter,
  Eye,
  MessageSquare,
  TrendingUp,
  Building2,
  Mail,
  Calendar,
  ExternalLink,
  ChevronDown,
  SortAsc,
  Grid3X3,
  List,
  Sparkles,
} from "lucide-react";
import { BusinessData, BusinessReview } from "@shared/google-business";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Enhanced interfaces for better type safety
interface FilterState {
  search: string;
  category: string;
  sortBy: "rating" | "reviews" | "name" | "newest";
  ratingFilter: number;
}

interface ViewMode {
  mode: "grid" | "list";
}

// Enhanced fallback sample data for Dubai visa services
const getFallbackBusinesses = (): BusinessData[] => [
  {
    id: "sample1",
    name: "Dubai Visa Solutions",
    address: "Business Bay, Dubai, UAE",
    location: { lat: 25.188, lng: 55.274 },
    rating: 4.2,
    reviewCount: 156,
    category: "visa consulting services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@dubaivisasolutions.ae",
    phone: "+971-4-333-1234",
    website: "https://dubaivisasolutions.ae",
    logoUrl: undefined,
    photos: [],
    reviews: [],
    hours: {},
    hasTargetKeyword: true,
  },
  {
    id: "sample2",
    name: "Emirates Immigration Services",
    address: "DIFC, Dubai, UAE",
    location: { lat: 25.214, lng: 55.282 },
    rating: 3.8,
    reviewCount: 203,
    category: "immigration consultancy",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@emiratesimmigration.ae",
    phone: "+971-4-555-6789",
    website: "https://emiratesimmigration.com",
    logoUrl: undefined,
    photos: [],
    reviews: [],
    hours: {},
    hasTargetKeyword: true,
  },
  {
    id: "sample3",
    name: "Gulf Visa Center",
    address: "Jumeirah Lakes Towers, Dubai, UAE",
    location: { lat: 25.071, lng: 55.141 },
    rating: 4.0,
    reviewCount: 89,
    category: "visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@gulfvisacenter.ae",
    phone: "+971-4-777-8901",
    website: "https://gulfvisacenter.ae",
    logoUrl: undefined,
    photos: [],
    reviews: [],
    hours: {},
    hasTargetKeyword: true,
  },
  {
    id: "sample4",
    name: "Prime Visa Consultants",
    address: "Sheikh Zayed Road, Dubai, UAE",
    location: { lat: 25.19, lng: 55.274 },
    rating: 3.5,
    reviewCount: 134,
    category: "visa consulting services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@primevisaconsultants.ae",
    phone: "+971-4-888-9012",
    website: "https://primevisaconsultants.com",
    logoUrl: undefined,
    photos: [],
    reviews: [],
    hours: {},
    hasTargetKeyword: true,
  },
  {
    id: "sample5",
    name: "FastTrack Visa Services",
    address: "Dubai Marina, Dubai, UAE",
    location: { lat: 25.077, lng: 55.139 },
    rating: 2.1,
    reviewCount: 267,
    category: "immigration services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@fasttrackvisas.ae",
    phone: "+971-4-999-1234",
    website: "https://fasttrackvisas.ae",
    logoUrl: undefined,
    photos: [],
    reviews: [],
    hours: {},
    hasTargetKeyword: true,
  },
  {
    id: "sample6",
    name: "Global Immigration Hub",
    address: "Downtown Dubai, Dubai, UAE",
    location: { lat: 25.197, lng: 55.274 },
    rating: 4.1,
    reviewCount: 78,
    category: "immigration consultancy",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@globalimmigrationhub.ae",
    phone: "+971-4-111-2345",
    website: "https://globalimmigrationhub.com",
    logoUrl: undefined,
    photos: [],
    reviews: [],
    hours: {},
    hasTargetKeyword: true,
  },
];

const ITEMS_PER_PAGE = 12;

export default function BusinessDirectory() {
  const navigate = useNavigate();

  // State management with proper typing
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sortBy: "rating",
    ratingFilter: 0,
  });
  const [viewMode, setViewMode] = useState<ViewMode>({ mode: "grid" });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Fetch businesses with enhanced error handling and retry logic
  const fetchBusinesses = useCallback(async (retryCount = 0): Promise<void> => {
    try {
      setLoading(true);
      if (retryCount === 0) setError(null);

      console.log(
        `Fetching businesses from API... (attempt ${retryCount + 1})`,
      );

      // Add small delay on first attempt to ensure server is ready
      if (retryCount === 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch("/api/dubai-visa-services?limit=300", {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
        cache: "no-cache",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Server error - ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Check the correct response format from the API
      if (data.businesses && Array.isArray(data.businesses)) {
        console.log(`✅ Loaded ${data.businesses.length} businesses from API`);

        // If no businesses in database, use fallback but don't show error
        if (data.businesses.length === 0) {
          console.log(
            "📭 Database is empty, using sample data for demonstration",
          );
          setError("Database is empty - showing sample data for demonstration");
          setBusinesses(getFallbackBusinesses());
        } else {
          console.log(`📸 Frontend Image Debug - First 3 businesses:`);
          data.businesses
            .slice(0, 3)
            .forEach((business: any, index: number) => {
              console.log(`  ${index + 1}. ${business.name}:`);
              console.log(
                `     - logoUrl: ${business.logoUrl ? "present" : "not present"}`,
              );
              if (business.logoUrl) {
                console.log(
                  `     - logoUrl preview: ${business.logoUrl.substring(0, 50)}...`,
                );
                console.log(
                  `     - logoUrl type: ${business.logoUrl.startsWith("data:") ? "base64" : "url"}`,
                );
              }
              console.log(
                `     - photos array: ${business.photos ? business.photos.length : 0} items`,
              );
              if (business.photos && business.photos.length > 0) {
                console.log(
                  `     - photos structure:`,
                  business.photos.slice(0, 2),
                );
              }
            });

          setBusinesses(data.businesses);
          setError(null); // Clear any previous errors
        }
      } else {
        console.log("⚠️ API returned invalid format, using fallback data");
        setError("Invalid API response - using sample data");
        setBusinesses(getFallbackBusinesses());
      }
    } catch (err) {
      console.error(
        `❌ Error fetching businesses (attempt ${retryCount + 1}):`,
        err,
      );

      // Determine error type for better user feedback
      let errorMessage = "Unable to load live data";
      let shouldRetry = false;

      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Network connection failed - using offline data";
        shouldRetry = retryCount < 2; // Retry up to 3 times for network errors
      } else if (err instanceof Error && err.name === "AbortError") {
        errorMessage = "Request timeout - using offline data";
        shouldRetry = retryCount < 1; // Retry once for timeouts
      } else if (err instanceof Error && err.message.includes("HTTP 5")) {
        errorMessage = "Server temporarily unavailable - using offline data";
        shouldRetry = retryCount < 1; // Retry once for server errors
      } else if (err instanceof Error) {
        errorMessage = `API Error: ${err.message}`;
      }

      // Retry logic for certain errors
      if (shouldRetry) {
        console.log(`🔄 Retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(
          () => {
            fetchBusinesses(retryCount + 1);
          },
          (retryCount + 1) * 2000,
        ); // Exponential backoff
        return;
      }

      setError(errorMessage);

      // Always fallback to sample data to ensure the page works
      console.log("�� Using sample data to ensure page functionality");
      setBusinesses(getFallbackBusinesses());
    } finally {
      if (retryCount === 0 || !setLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Load businesses on component mount with a small delay
  useEffect(() => {
    // Add a small delay to ensure the server middleware is fully loaded
    const timeoutId = setTimeout(() => {
      fetchBusinesses();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [fetchBusinesses]);

  // Memoized filtered and sorted businesses
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses.filter((business) => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        business.name.toLowerCase().includes(searchTerm) ||
        business.address.toLowerCase().includes(searchTerm) ||
        business.category.toLowerCase().includes(searchTerm);

      const matchesCategory =
        filters.category === "all" || business.category === filters.category;

      const matchesRating =
        filters.ratingFilter === 0 || business.rating >= filters.ratingFilter;

      return matchesSearch && matchesCategory && matchesRating;
    });

    // Sort businesses
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return b.reviewCount - a.reviewCount; // Fallback sort
        default:
          return 0;
      }
    });

    return filtered;
  }, [businesses, filters]);

  // Paginated businesses
  const displayedBusinesses = useMemo(() => {
    return filteredBusinesses.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredBusinesses, currentPage]);

  const hasMore = displayedBusinesses.length < filteredBusinesses.length;

  // Unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(businesses.map((b) => b.category)),
    );
    return uniqueCategories.sort();
  }, [businesses]);

  // Event handlers
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string | number) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1); // Reset pagination
    },
    [],
  );

  const loadMoreBusinesses = useCallback(() => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 500);
  }, []);

  const navigateToDetails = useCallback(
    (business: BusinessData) => {
      try {
        const locationSlug =
          business.address
            .split(",")[0]
            ?.trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-") || "dubai";
        const nameSlug = business.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

        navigate(`/${locationSlug}/review/${nameSlug}`, {
          state: { businessData: business },
        });
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback navigation
        navigate("/complaint", {
          state: {
            companyName: business.name,
            companyLocation: business.address,
          },
        });
      }
    },
    [navigate],
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <h3 className="text-xl font-semibold text-gray-700">
                Loading Dubai Visa Services
              </h3>
              <p className="text-gray-500">
                Fetching the latest business listings...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-1 md:space-x-2 hover:bg-white/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>Dubai Visa Services Directory</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                {filteredBusinesses.length} Services Found
              </Badge>

              {error && (
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    error.includes("Network") ||
                    error.includes("connection") ||
                    error.includes("timeout")
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {error.includes("Network") ||
                  error.includes("connection") ||
                  error.includes("timeout") ? (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Offline Mode
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Demo Mode
                    </>
                  )}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 md:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Dubai Visa Services Directory
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover and evaluate visa consultation services in Dubai. Read
            reviews, compare ratings, and make informed decisions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              {businesses.length} total businesses
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 md:h-4 md:w-4" />
              Real customer reviews
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
              Scam alerts included
            </span>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <Card className="shadow-xl border-0 bg-blue-50/80 backdrop-blur-xl border-blue-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {error.includes("Network") ||
                  error.includes("connection") ||
                  error.includes("timeout") ? (
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  ) : (
                    <Building2 className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {error.includes("Network") ||
                    error.includes("connection") ||
                    error.includes("timeout")
                      ? "🌐 Offline Mode"
                      : "📋 Demo Mode"}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {error.includes("Network") || error.includes("connection")
                      ? "Can't reach the server right now. Displaying sample Dubai visa services for demonstration."
                      : error.includes("timeout")
                        ? "Server is taking too long to respond. Displaying sample data instead."
                        : error.includes("Database is empty")
                          ? "The database hasn't been populated yet. Displaying sample businesses to show how the directory works."
                          : "Displaying sample data. All features are fully functional for testing."}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      ✨ 6 Sample Businesses
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      🔍 Full Search & Filter
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-800"
                    >
                      📱 Mobile Responsive
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attractive Search Section */}
        {/* Simple Search Bar */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search Dubai visa services..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="h-12 pl-4 pr-12 text-base bg-white border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                />
                <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {filteredBusinesses.length} visa services found
              </p>
            </div>
          </CardContent>
        </Card>

        {/* No Results */}
        {!loading && filteredBusinesses.length === 0 && (
          <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                  No businesses found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try adjusting your search criteria or filters to find more
                  results.
                </p>
                <Button
                  onClick={() => {
                    setFilters({
                      search: "",
                      category: "all",
                      sortBy: "rating",
                      ratingFilter: 0,
                    });
                    setCurrentPage(1);
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Grid */}
        {filteredBusinesses.length > 0 && (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedBusinesses.map((business, index) => (
              <Card
                key={business.id}
                className="shadow-xl border-0 bg-white/60 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105 cursor-pointer"
                onClick={() => navigateToDetails(business)}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Business Header */}
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg overflow-hidden relative flex-shrink-0">
                        {business.logoUrl ? (
                          <>
                            <img
                              src={business.logoUrl}
                              alt={`${business.name} logo`}
                              className="w-full h-full object-cover absolute inset-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                const fallback = parent?.querySelector(
                                  ".logo-fallback",
                                ) as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div
                              className="logo-fallback absolute inset-0 flex items-center justify-center"
                              style={{ display: "none" }}
                            >
                              {business.name.charAt(0).toUpperCase()}
                            </div>
                          </>
                        ) : (
                          <div className="logo-fallback absolute inset-0 flex items-center justify-center">
                            {business.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 md:line-clamp-1">
                          {business.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 flex items-center truncate">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {business.address.split(",")[0]}
                          </span>
                        </p>
                      </div>
                    </div>

                    {business.isOpen && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        Open
                      </Badge>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {business.category
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </Badge>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(business.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {business.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                    {business.phone && (
                      <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{business.phone}</span>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{business.email}</span>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">Website Available</span>
                      </div>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <Badge variant="outline" className="text-xs">
                      {business.category}
                    </Badge>
                  </div>

                  {/* Action Buttons - Improved Design */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg border-0 font-semibold text-sm md:text-base py-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetails(business);
                      }}
                    >
                      <Eye className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      View Details
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-semibold text-sm md:text-base py-3 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/complaint", {
                          state: {
                            companyName: business.name,
                            companyLocation: business.address,
                          },
                        });
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Report Scam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center">
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl inline-block">
              <CardContent className="p-6">
                <Button
                  onClick={loadMoreBusinesses}
                  disabled={loadingMore}
                  size="lg"
                  className="min-w-[250px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading More...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Load More Businesses
                      <span className="ml-2 text-sm opacity-75">
                        (+
                        {Math.min(
                          ITEMS_PER_PAGE,
                          filteredBusinesses.length -
                            displayedBusinesses.length,
                        )}{" "}
                        more)
                      </span>
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Showing {displayedBusinesses.length} of{" "}
                  {filteredBusinesses.length} businesses
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredBusinesses.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
            <CardContent className="p-6 text-center">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>{filteredBusinesses.length} Total Businesses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>
                    Avg Rating:{" "}
                    {(
                      filteredBusinesses.reduce((acc, b) => acc + b.rating, 0) /
                      filteredBusinesses.length
                    ).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {filteredBusinesses.reduce(
                      (acc, b) => acc + b.reviewCount,
                      0,
                    )}{" "}
                    Total Reviews
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {filteredBusinesses.filter((b) => b.rating < 2.5).length}{" "}
                    Low-Rated Services
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Always check reviews and ratings
                  before choosing a visa service. Be cautious of services with
                  consistently low ratings or no reviews.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dubai Government Logos */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4 md:p-6">
            <div className="text-center mb-4">
              <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-3">
                Officially Recognized Dubai Visa Services
              </h3>
              <div className="flex items-center justify-center gap-6 md:gap-8">
                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-lg p-2 group-hover:shadow-xl transition-all duration-300">
                    <img
                      src="https://images.pexels.com/photos/15652234/pexels-photo-15652234.jpeg"
                      alt="UAE Flag"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-2 font-medium">
                    UAE Government
                  </span>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-lg p-2 group-hover:shadow-xl transition-all duration-300">
                    <img
                      src="https://images.pexels.com/photos/18294648/pexels-photo-18294648.jpeg"
                      alt="UAE Official Emblem"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-2 font-medium">
                    Dubai Municipality
                  </span>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 via-white to-green-600 rounded-xl shadow-lg p-1 group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full h-full flex items-center justify-center">
                      <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-500 to-green-600 bg-clip-text text-transparent">
                        UAE
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2 font-medium">
                    Immigration Dept
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 max-w-lg mx-auto">
                All listed services comply with Dubai government regulations for
                visa and immigration services
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Government Body Footer Section */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                Dubai Government Partners
              </h2>
              <p className="text-blue-100 max-w-3xl mx-auto">
                Our platform works in collaboration with official Dubai
                government bodies to ensure all listed visa services comply with
                UAE immigration regulations and standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
              {/* General Directorate of Residency */}
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <img
                    src="https://images.pexels.com/photos/15652234/pexels-photo-15652234.jpeg"
                    alt="UAE Immigration"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  General Directorate of Residency
                </h3>
                <p className="text-sm text-blue-200">
                  Official authority for visa and residence permit regulations
                  in Dubai
                </p>
                <div className="text-xs text-blue-300">
                  📞 +971-4-313-9999 | 🌐 gdrfad.gov.ae
                </div>
              </div>

              {/* Dubai Municipality */}
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <img
                    src="https://images.pexels.com/photos/18294648/pexels-photo-18294648.jpeg"
                    alt="Dubai Municipality"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Dubai Municipality
                </h3>
                <p className="text-sm text-blue-200">
                  Business licensing and regulation authority for visa service
                  providers
                </p>
                <div className="text-xs text-blue-300">
                  📞 +971-4-221-5555 | 🌐 dm.gov.ae
                </div>
              </div>

              {/* Ministry of Human Resources */}
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-white to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-800">UAE</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Ministry of Human Resources
                </h3>
                <p className="text-sm text-blue-200">
                  Oversees employment visa regulations and work permit
                  procedures
                </p>
                <div className="text-xs text-blue-300">
                  📞 +971-4-394-4000 | 🌐 mohre.gov.ae
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Official Resources
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      UAE Visa Application Portal - visa.gov.ae
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      Dubai Smart Government - dubai.ae
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      UAE Immigration Guidelines - ica.gov.ae
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Compliance Notice
                  </h4>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-blue-100">
                      ⚠️ Always verify that your chosen visa service provider
                      holds valid licensing from Dubai authorities. Report
                      unlicensed operators to the General Directorate of
                      Residency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-white/20">
              <p className="text-xs text-blue-300">
                This directory is an independent platform. For official visa
                information, always consult government sources.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
