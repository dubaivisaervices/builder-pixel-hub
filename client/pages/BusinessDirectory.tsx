import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Star,
  MapPin,
  Phone,
  Globe,
  Building2,
  ArrowRight,
  Filter,
  Grid3X3,
  List,
  Heart,
  Share2,
  ExternalLink,
  Users,
  Clock,
  Award,
  Shield,
  Verified,
  TrendingUp,
  Eye,
  MessageCircle,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  hasTargetKeyword?: boolean;
  photos?: any[];
}

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<BusinessData[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessData[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [displayCount, setDisplayCount] = useState(12);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);

  // Get unique categories
  const categories = ["all", ...new Set(businesses.map((b) => b.category))];
  const topRatedBusinesses = businesses
    .filter((b) => b.rating >= 4.5)
    .slice(0, 6);

  useEffect(() => {
    fetchBusinesses();
    setIsVisible(true);
    setTimeout(() => setAnimateCards(true), 100);

    // Set search term from navigation state if available
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state]);

  useEffect(() => {
    // Filter businesses based on search term and category
    let filtered = businesses;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory,
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredBusinesses(filtered);
  }, [searchTerm, businesses, selectedCategory]);

  const fetchBusinesses = async () => {
    try {
      console.log("🔄 Fetching businesses for directory...");
      const response = await fetch("/api/dubai-visa-services?limit=1000");
      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ Successfully loaded",
          data.businesses?.length || 0,
          "businesses",
        );
        setBusinesses(data.businesses || []);
      } else {
        console.error("❌ Failed to fetch businesses:", response.status);
        // Fallback with sample data
        setBusinesses([
          {
            id: "sample1",
            name: "Dubai Visa Solutions",
            address: "Business Bay, Dubai, UAE",
            rating: 4.8,
            reviewCount: 156,
            category: "Visa Services",
            phone: "+971 4 123 4567",
            website: "dubaivisasolutions.com",
            hasTargetKeyword: true,
          },
          {
            id: "sample2",
            name: "Emirates Immigration Consultants",
            address: "DIFC, Dubai, UAE",
            rating: 4.6,
            reviewCount: 89,
            category: "Immigration Services",
            phone: "+971 4 987 6543",
            website: "emiratesimmigration.ae",
            hasTargetKeyword: true,
          },
          {
            id: "sample3",
            name: "Al Majid PRO Services",
            address: "Deira, Dubai, UAE",
            rating: 4.5,
            reviewCount: 234,
            category: "PRO Services",
            phone: "+971 4 555 0123",
            hasTargetKeyword: false,
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Error fetching businesses:", error);
      // Fallback with sample data
      setBusinesses([
        {
          id: "sample1",
          name: "Dubai Visa Solutions",
          address: "Business Bay, Dubai, UAE",
          rating: 4.8,
          reviewCount: 156,
          category: "Visa Services",
          phone: "+971 4 123 4567",
          website: "dubaivisasolutions.com",
          hasTargetKeyword: true,
        },
        {
          id: "sample2",
          name: "Emirates Immigration Consultants",
          address: "DIFC, Dubai, UAE",
          rating: 4.6,
          reviewCount: 89,
          category: "Immigration Services",
          phone: "+971 4 987 6543",
          website: "emiratesimmigration.ae",
          hasTargetKeyword: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value.length >= 1) {
      const filtered = businesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 6);
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (business: BusinessData) => {
    navigateToDetails(business);
    setShowSuggestions(false);
    setSearchTerm("");
  };

  const navigateToDetails = (business: BusinessData) => {
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
  };

  const toggleFavorite = (businessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(businessId)) {
      newFavorites.delete(businessId);
    } else {
      newFavorites.add(businessId);
    }
    setFavorites(newFavorites);
  };

  const shareCompany = (business: BusinessData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `Check out ${business.name} on Dubai Business Directory`,
        url:
          window.location.origin +
          `/${business.address
            .split(",")[0]
            ?.trim()
            .toLowerCase()
            .replace(
              /[^a-z0-9]/g,
              "-",
            )}/review/${business.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Generate SVG logo for businesses
  const generateSVGLogo = (businessName: string, size: number = 64) => {
    const initials = businessName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const colors = [
      "#3B82F6",
      "#8B5CF6",
      "#EF4444",
      "#10B981",
      "#F59E0B",
      "#EC4899",
      "#06B6D4",
      "#84CC16",
      "#F97316",
      "#6366F1",
    ];

    const colorIndex = businessName.length % colors.length;
    const bgColor = colors[colorIndex];
    const lightBg = bgColor + "20"; // Add transparency

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[(colorIndex + 1) % colors.length]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="12" fill="url(#grad${colorIndex})" />
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
          ${initials}
        </text>
      </svg>
    `)}`;
  };

  const BusinessCard = ({
    business,
    index,
  }: {
    business: BusinessData;
    index: number;
  }) => {
    const isHovered = hoveredCard === business.id;
    const cardDelay = index * 0.1;

    return (
      <Card
        className={`group cursor-pointer transition-all duration-500 border-0 bg-white hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 relative overflow-hidden ${
          animateCards ? "animate-in slide-in-from-bottom-4" : "opacity-0"
        }`}
        style={{
          animationDelay: `${cardDelay}s`,
          animationDuration: "0.6s",
          animationFillMode: "forwards",
        }}
        onClick={() => navigateToDetails(business)}
        onMouseEnter={() => setHoveredCard(business.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Premium Badge */}
        {business.hasTargetKeyword && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
              <Award className="h-3 w-3" />
              <span>Verified</span>
            </Badge>
          </div>
        )}

        {/* Action Buttons - Hidden on mobile for better touch experience */}
        <div className="hidden sm:flex absolute top-3 right-3 z-10 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
            onClick={(e) => toggleFavorite(business.id, e)}
          >
            <Heart
              className={`h-4 w-4 ${
                favorites.has(business.id)
                  ? "text-red-500 fill-current"
                  : "text-gray-600"
              }`}
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
            onClick={(e) => shareCompany(business, e)}
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>

        <CardContent className="p-0">
          {/* Header Image/Logo Section */}
          <div className="relative h-24 sm:h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-xl border-2 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                />
              ) : null}
              <div className={business.logoUrl ? "hidden" : ""}>
                <img
                  src={generateSVGLogo(business.name, 64)}
                  alt={business.name}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl border-2 border-white shadow-lg"
                />
              </div>
            </div>

            {/* Animated overlay on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
            ></div>
          </div>

          {/* Content Section */}
          <div className="p-3 sm:p-5">
            {/* Business Name & Category */}
            <div className="mb-2 sm:mb-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                {business.name}
              </h3>
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-gray-100 text-gray-700"
              >
                {business.category}
              </Badge>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < Math.floor(business.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  {business.rating}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{business.reviewCount}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>

              {business.phone && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span>{business.phone}</span>
                </div>
              )}

              {business.website && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span className="truncate">{business.website}</span>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {business.rating}
                </div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {business.reviewCount}
                </div>
                <div className="text-xs text-gray-500">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">4.2k</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 group-hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                navigateToDetails(business);
              }}
            >
              <span>View Details</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </CardContent>

        {/* Hover effect overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        ></div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
          }
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="h-5 w-5 text-white" />
              <span className="text-white text-sm font-medium">
                Verified Business Directory
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Discover Dubai's
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Trusted Businesses
              </span>
            </h1>

            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed mb-6">
              Connect with verified companies, read authentic reviews, and make
              informed decisions. Your gateway to Dubai's most trusted service
              providers.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto mb-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {businesses.length}+
                </div>
                <div className="text-blue-200 text-xs sm:text-sm">
                  Businesses
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  4.8
                </div>
                <div className="text-blue-200 text-xs sm:text-sm">
                  Avg Rating
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  50k+
                </div>
                <div className="text-blue-200 text-xs sm:text-sm">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-6 relative z-10">
        {/* Search & Filter Section */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Input
                ref={searchRef}
                type="text"
                placeholder="Search businesses by name, category, or location..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-12 sm:h-14 pl-12 pr-4 bg-white border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((business, index) => (
                    <div
                      key={business.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-3 transition-colors"
                      onClick={() => handleSuggestionClick(business)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {business.logoUrl ? (
                          <img
                            src={business.logoUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove(
                                "hidden",
                              );
                            }}
                          />
                        ) : null}
                        <span className={business.logoUrl ? "hidden" : ""}>
                          {business.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .substring(0, 2)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-sm">
                          {business.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {business.address}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs">{business.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filters & View Toggle - Hidden on Mobile */}
            <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-2 overflow-x-auto">
                <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div className="flex space-x-2">
                  {categories.slice(0, 6).map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {category === "all" ? "All Categories" : category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex border border-gray-200 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Category Filter - Simplified */}
            <div className="sm:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-sm"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Section */}
        {!searchTerm &&
          selectedCategory === "all" &&
          topRatedBusinesses.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Top Rated Businesses
                  </h2>
                  <p className="text-gray-600">
                    Highest rated companies in Dubai
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topRatedBusinesses.map((business, index) => (
                  <BusinessCard
                    key={`top-${business.id}`}
                    business={business}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Main Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm
                  ? `Search Results for "${searchTerm}"`
                  : selectedCategory !== "all"
                    ? `${selectedCategory} Businesses`
                    : "All Businesses"}
              </h2>
              <p className="text-gray-600">
                Showing {Math.min(displayCount, filteredBusinesses.length)} of{" "}
                {filteredBusinesses.length} businesses
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <div className="absolute inset-0 animate-ping h-12 w-12 border-4 border-blue-300 border-t-transparent rounded-full mx-auto opacity-20"></div>
              </div>
              <p className="text-gray-600 font-medium">
                Loading amazing businesses...
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBusinesses
                    .slice(0, displayCount)
                    .map((business, index) => (
                      <BusinessCard
                        key={business.id}
                        business={business}
                        index={index}
                      />
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBusinesses
                    .slice(0, displayCount)
                    .map((business, index) => (
                      <Card
                        key={business.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white"
                        onClick={() => navigateToDetails(business)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {business.logoUrl ? (
                                <img
                                  src={business.logoUrl}
                                  alt=""
                                  className="w-full h-full object-cover rounded-xl"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.classList.remove(
                                      "hidden",
                                    );
                                  }}
                                />
                              ) : null}
                              <span
                                className={business.logoUrl ? "hidden" : ""}
                              >
                                {business.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                                  .substring(0, 2)}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                    {business.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {business.category}
                                  </p>

                                  <div className="flex items-center space-x-1 mb-2">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium">
                                      {business.rating}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      ({business.reviewCount} reviews)
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{business.address}</span>
                                  </div>
                                </div>

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToDetails(business);
                                  }}
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                >
                                  View Details
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}

              {/* Load More Button */}
              {filteredBusinesses.length > displayCount && (
                <div className="text-center mt-12">
                  <Button
                    onClick={() => setDisplayCount(displayCount + 12)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg"
                  >
                    Load More Businesses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && filteredBusinesses.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Building2 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No businesses found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any businesses matching your criteria. Try
                  adjusting your search terms or browse all businesses.
                </p>
                <div className="space-x-3">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  >
                    Show All Businesses
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => searchRef.current?.focus()}
                  >
                    Try Different Search
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl"
          onClick={() => searchRef.current?.focus()}
        >
          <Search className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
