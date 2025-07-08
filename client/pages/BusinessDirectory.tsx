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
import {
  BusinessData,
  BusinessSearchResponse,
  BusinessReview,
} from "@shared/google-business";
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
    email: "contact@emiratesimmigration.com",
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
    email: "info@primevisaconsultants.com",
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
    email: "support@fasttrackvisas.ae",
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
    email: "hello@globalimmigrationhub.com",
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

  // Fetch businesses with error handling
  const fetchBusinesses = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching businesses from API...");
      const response = await fetch("/api/dubai-visa-services?limit=300");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch businesses`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Check the correct response format from the API
      if (data.businesses && Array.isArray(data.businesses)) {
        console.log(`Loaded ${data.businesses.length} businesses from API`);

        // If no businesses in database, use fallback
        if (data.businesses.length === 0) {
          console.log("No businesses in database, using fallback data");
          setBusinesses(getFallbackBusinesses());
        } else {
          setBusinesses(data.businesses);
        }
      } else {
        console.log("API returned no businesses, using fallback data");
        setBusinesses(getFallbackBusinesses());
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load businesses",
      );

      // Fallback to sample data
      console.log("Using fallback sample data due to error");
      setBusinesses(getFallbackBusinesses());
    } finally {
      setLoading(false);
    }
  }, []);

  // Load businesses on component mount
  useEffect(() => {
    fetchBusinesses();
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
      {/* Modern Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 hover:bg-white/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>

              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>Dubai Visa Services Directory</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                {filteredBusinesses.length} Services Found
              </Badge>

              {error && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Using Fallback Data
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Dubai Visa Services Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and evaluate visa consultation services in Dubai. Read
            reviews, compare ratings, and make informed decisions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {businesses.length} total businesses
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              Real customer reviews
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Scam alerts included
            </span>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search businesses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select
                value={filters.ratingFilter.toString()}
                onValueChange={(value) =>
                  handleFilterChange("ratingFilter", parseInt(value))
                }
              >
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                  <SelectItem value="1">1+ Stars</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  handleFilterChange("sortBy", value as FilterState["sortBy"])
                }
              >
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="newest">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle and Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode.mode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode({ mode: "grid" })}
                  className="h-8"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode.mode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode({ mode: "list" })}
                  className="h-8"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                Showing {displayedBusinesses.length} of{" "}
                {filteredBusinesses.length} results
              </div>
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

        {/* Business Grid/List */}
        {filteredBusinesses.length > 0 && (
          <div
            className={`grid gap-6 ${
              viewMode.mode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {displayedBusinesses.map((business, index) => (
              <Card
                key={business.id}
                className="shadow-xl border-0 bg-white/60 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105"
              >
                <CardContent className="p-6">
                  {/* Business Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {business.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {business.address.split(",")[0]}
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

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
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
                      <span className="text-sm text-gray-500">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>

                    {business.rating < 2.5 && (
                      <Badge
                        variant="destructive"
                        className="text-xs animate-pulse"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Rating
                      </Badge>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {business.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{business.email}</span>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="h-3 w-3" />
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

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      onClick={() => navigateToDetails(business)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() =>
                        navigate("/complaint", {
                          state: {
                            companyName: business.name,
                            companyLocation: business.address,
                          },
                        })
                      }
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report
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
      </div>
    </div>
  );
}
