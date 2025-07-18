import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Building2,
  Search,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  ArrowRight,
  BarChart3,
  Shield,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";
import { getBestLogoUrl } from "@/lib/imageUtils";

export default function SimpleBusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [allDataLoaded, setAllDataLoaded] = useState(false);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = 50; // Show 50 items per page

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const page = searchParams.get("page");

    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
    if (page) setCurrentPage(parseInt(page) || 1);
  }, [searchParams]);

  // Load businesses from multiple sources
  useEffect(() => {
    async function loadBusinesses() {
      try {
        setLoading(true);
        setError(null);

        console.log("🗄️ Loading businesses from comprehensive database...");
        let businessData = null;

        // Try multiple data sources to get all 857+ businesses
        const dataSources = [
          {
            url: "/api/complete-businesses.json",
            name: "Complete Businesses (857+)",
          },
          { url: "/data/businesses.json", name: "Business Data (857+)" },
          { url: "/data/complete-dataset.json", name: "Complete Dataset" },
          {
            url: "/.netlify/functions/database-businesses?all=true",
            name: "Database API",
          },
          { url: "/api/dubai-visa-services.json", name: "Visa Services" },
        ];

        for (const source of dataSources) {
          try {
            console.log(`🔄 Trying ${source.name} at ${source.url}...`);
            const response = await fetch(`${source.url}?t=${Date.now()}`);

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
              const data = JSON.parse(responseText);

              if (Array.isArray(data)) {
                businessData = data;
              } else if (data.businesses && Array.isArray(data.businesses)) {
                businessData = data.businesses;
              } else {
                console.warn(`❌ ${source.name} has unexpected structure`);
                continue;
              }

              if (businessData && businessData.length > 0) {
                console.log(
                  `✅ Successfully loaded ${businessData.length} businesses from ${source.name}`,
                );
                setAllDataLoaded(businessData.length > 100);
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

        // Fallback data if all sources fail
        if (!businessData || businessData.length === 0) {
          console.log("⚠️ Using emergency fallback business data");
          businessData = [
            {
              id: "fallback-1",
              name: "10-PRO Consulting | Business Setup & Visa Services",
              address: "Business Central Towers, Dubai Media City, UAE",
              category: "Visa Services",
              phone: "04 529 3354",
              website: "https://10-pro.com/",
              rating: 4.7,
              reviewCount: 505,
            },
            {
              id: "fallback-2",
              name: "4S Study Abroad | Education Visa Consultant",
              address: "Sultan Business Centre, Oud Metha, Dubai, UAE",
              category: "Education Visa",
              phone: "04 553 8909",
              website: "https://www.4sstudyabroad.com/",
              rating: 4.7,
              reviewCount: 218,
            },
            {
              id: "fallback-3",
              name: "A to Z Document Clearing Services",
              address: "Al Fahidi, Dubai, UAE",
              category: "Document Services",
              phone: "052 603 8558",
              website: "http://www.a2zdocument.com/",
              rating: 5.0,
              reviewCount: 246,
            },
          ];
          setAllDataLoaded(false);
        }

        // Process and clean data
        const processedBusinesses = businessData.map((business) => {
          // Clean up corrupted logoUrl
          let cleanLogoUrl = business.logoUrl;
          if (
            cleanLogoUrl &&
            cleanLogoUrl.includes("/business-images/logos/")
          ) {
            cleanLogoUrl = null;
          }

          return {
            id: business.id || business.place_id,
            name: business.name,
            address: business.address || business.formatted_address || "",
            category: business.category || business.type || "Business Services",
            phone: business.phone || business.formatted_phone_number || "",
            website: business.website || "",
            rating: business.rating || business.google_rating || 4.0,
            reviewCount:
              business.reviewCount || business.user_ratings_total || 0,
            logoUrl:
              cleanLogoUrl ||
              getBestLogoUrl({ ...business, logoUrl: cleanLogoUrl }),
            photos: business.photos || [],
          };
        });

        setBusinesses(processedBusinesses);
        console.log(
          `✅ Total businesses processed: ${processedBusinesses.length}`,
        );
      } catch (error) {
        console.error("Error loading businesses:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  // Filter and sort businesses
  const processedBusinesses = useMemo(() => {
    let filtered = businesses;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchLower) ||
          business.category.toLowerCase().includes(searchLower) ||
          business.address.toLowerCase().includes(searchLower),
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

    // Sort businesses
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rating":
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case "reviews":
          comparison = (b.reviewCount || 0) - (a.reviewCount || 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [businesses, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Update filtered businesses and reset page when filters change
  useEffect(() => {
    setFilteredBusinesses(processedBusinesses);
    setCurrentPage(1);
  }, [processedBusinesses]);

  // Update URL when search/filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [searchTerm, selectedCategory, currentPage, setSearchParams]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex);

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    const categories = businesses.map((b) => b.category).filter(Boolean);
    return [...new Set(categories)].sort();
  }, [businesses]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: businesses.length,
      displayed: currentBusinesses.length,
      filtered: filteredBusinesses.length,
      averageRating:
        businesses.reduce((sum, b) => sum + (b.rating || 0), 0) /
        businesses.length,
      highRated: businesses.filter((b) => b.rating && b.rating >= 4.5).length,
    }),
    [businesses, currentBusinesses, filteredBusinesses],
  );

  const handleBusinessClick = (business: any) => {
    navigate(`/company/${business.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      // Show first page
      pages.push(1);

      // Show ellipsis if current page is far from start
      if (currentPage > 4) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }

      // Show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    } else {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {pages.map((page, index) => (
          <Button
            key={index}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => typeof page === "number" && handlePageChange(page)}
            disabled={page === "..."}
            className={`min-w-[40px] ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-50"
            }`}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Loading Business Directory
          </h2>
          <p className="text-gray-600">
            Fetching {businesses.length > 0 ? businesses.length : "857+"}{" "}
            verified businesses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <Building2 className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Directory
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <Building2 className="h-16 w-16 text-white mx-auto" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Dubai Business
              <span className="block text-yellow-300">Directory</span>
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Comprehensive database of verified businesses in Dubai with real
              reviews, contact information, and scam protection.
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <Building2 className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {stats.total}
                </div>
                <div className="text-sm text-blue-100">Total Businesses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <Shield className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">Verified</div>
                <div className="text-sm text-blue-100">Scam Protection</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <Award className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {stats.highRated}
                </div>
                <div className="text-sm text-blue-100">Highly Rated</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <TrendingUp className="h-8 w-8 text-orange-300 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-blue-100">Avg. Rating</div>
              </div>
            </div>

            {/* Enhanced Search */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <Input
                  type="text"
                  placeholder="Search businesses, services, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border-0 bg-white/90 backdrop-blur-sm rounded-xl focus:ring-4 focus:ring-white/30 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        <Card className="mb-8 shadow-xl bg-white/80 backdrop-blur-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600 flex items-center gap-4">
                <span>
                  Page {currentPage} of {totalPages} • {stats.filtered}{" "}
                  businesses
                </span>
                {allDataLoaded && (
                  <Badge className="bg-green-100 text-green-800">
                    Complete Dataset
                  </Badge>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  >
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="reviews">Reviews</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Grid */}
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }`}
        >
          {currentBusinesses.map((business) => (
            <Card
              key={business.id}
              className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 hover:scale-[1.02] ${
                viewMode === "list" ? "flex" : ""
              }`}
              onClick={() => handleBusinessClick(business)}
            >
              <CardContent
                className={`p-6 ${viewMode === "list" ? "flex gap-6 w-full" : ""}`}
              >
                {/* Logo */}
                <div
                  className={`${
                    viewMode === "list"
                      ? "w-20 h-20 flex-shrink-0"
                      : "w-16 h-16 mx-auto mb-4"
                  } rounded-lg overflow-hidden bg-gray-100`}
                >
                  <img
                    src={business.logoUrl || getBestLogoUrl(business)}
                    alt={`${business.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const category = business.category?.toLowerCase() || "";
                      let categoryImage = "";

                      if (
                        category.includes("visa") ||
                        category.includes("immigration")
                      ) {
                        categoryImage =
                          "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80";
                      } else if (
                        category.includes("document") ||
                        category.includes("attestation")
                      ) {
                        categoryImage =
                          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80";
                      } else {
                        categoryImage =
                          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80";
                      }

                      target.src = categoryImage;
                    }}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  {/* Business Name */}
                  <h3
                    className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors ${
                      viewMode === "list" ? "text-lg" : "text-center"
                    } line-clamp-2`}
                  >
                    {business.name}
                  </h3>

                  {/* Rating */}
                  <div
                    className={`flex items-center ${
                      viewMode === "list" ? "justify-start" : "justify-center"
                    } gap-2`}
                  >
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
                      {business.rating}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({business.reviewCount})
                    </span>
                  </div>

                  {/* Category */}
                  <div className={viewMode === "list" ? "" : "text-center"}>
                    <Badge className="bg-blue-100 text-blue-800">
                      {business.category}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{business.address}</span>
                    </div>

                    {business.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        <span>{business.phone}</span>
                      </div>
                    )}

                    {business.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate">
                          {business.website
                            .replace("https://", "")
                            .replace("http://", "")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBusinessClick(business);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Results Summary */}
        {filteredBusinesses.length > 0 && (
          <div className="text-center mt-8 text-gray-600">
            <p>
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredBusinesses.length)} of{" "}
              {filteredBusinesses.length} businesses
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* No Results */}
        {filteredBusinesses.length === 0 && (
          <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
            <CardContent className="space-y-6">
              <Building2 className="h-20 w-20 text-gray-400 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-700">
                No businesses found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? `No businesses match "${searchTerm}". Try different search terms.`
                  : "No businesses found with the selected filters."}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setCurrentPage(1);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4 text-yellow-300">
                Dubai Business Directory
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Comprehensive directory of verified businesses in Dubai. Find
                trusted services, read reviews, and protect yourself from
                fraudulent providers.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-yellow-300">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/fraud-immigration-consultants"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Immigration Consultants
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
                    href="/help"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-yellow-300">
                Protection
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">✓ Verified businesses</p>
                <p className="text-gray-300">✓ Real customer reviews</p>
                <p className="text-gray-300">✓ Fraud protection</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Dubai Business Directory. Protecting communities through
              transparency.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
