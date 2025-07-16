import React, { useState, useEffect, useMemo } from "react";
import { getBestLogoUrl } from "../lib/imageUtils";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CommunityProtection from "@/components/CommunityProtection";
import GovernmentSection from "@/components/GovernmentSection";
import Footer from "@/components/Footer";
import { BusinessData } from "@shared/google-business";
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
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
} from "lucide-react";

const BusinessDirectory: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchSuggestions, setSearchSuggestions] = useState<BusinessData[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [dataSource, setDataSource] = useState<string>("unknown");

  const navigate = useNavigate();
  const location = useLocation();

  // Categories for filtering
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    businesses.forEach((business) => {
      if (business.category) {
        categorySet.add(business.category);
      }
    });
    return ["All", ...Array.from(categorySet).sort()];
  }, [businesses]);

  // Filtered businesses based on search and category
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory,
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [searchTerm, businesses, selectedCategory]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading businesses for Report Visa Scam...");

      // Try to load static data first (production)
      try {
        const response = await fetch("/data/businesses.json");
        if (response.ok) {
          const data = await response.json();
          console.log(
            "✅ Loaded from static data:",
            data.businesses?.length || 0,
            "businesses",
          );
          setBusinesses(data.businesses || []);
          setDataSource("Static Data");
          return;
        }
      } catch (error) {
        console.log("📡 Static data not found, trying API...");
      }

      // Fallback to API (development)
      const response = await fetch("/api/dubai-visa-services?limit=1000");
      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ Successfully loaded from API:",
          data.businesses?.length || 0,
          "businesses",
        );
        setBusinesses(data.businesses || []);
        setDataSource("API");
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
        setDataSource("Fallback");
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
      setDataSource("Error Fallback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value.length >= 1) {
      const filtered = businesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category?.toLowerCase().includes(value.toLowerCase()),
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
        ?.split(",")[0]
        ?.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-") || "dubai";
    const nameSlug = business.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    navigate(`/modern-profile/${locationSlug}/${nameSlug}`);
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
        text: `Check out ${business.name} on Report Visa Scam`,
        url:
          window.location.origin +
          `/modern-profile/${
            business.address
              ?.split(",")[0]
              ?.trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-") || "dubai"
          }/${business.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Business Directory
          </h2>
          <p className="text-gray-600">Fetching verified companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              🛡️ Report Visa Scam Directory
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-red-100">
              Verify companies before you trust them with your visa application
            </p>

            {/* Data Source Badge */}
            <div className="flex justify-center mb-8">
              <Badge className="bg-white/20 text-white px-4 py-2 text-lg">
                📊 Data Source: {dataSource} | {businesses.length} Companies
              </Badge>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search companies, check reviews, or report scams..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() =>
                    searchTerm.length >= 1 && setShowSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  className="h-14 pl-6 pr-16 text-lg bg-white/90 backdrop-blur-sm border-0 shadow-xl"
                />
                <Button
                  size="lg"
                  className="absolute right-2 top-2 h-10 px-6 bg-red-600 hover:bg-red-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 bg-gray-50 text-sm text-gray-600 font-medium">
                    {searchSuggestions.length} companies found
                  </div>
                  {searchSuggestions.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleSuggestionClick(business)}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {business.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {business.name}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {business.address?.split(",")[0]}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold text-gray-700">
                            {business.rating || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle and Results Count */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredBusinesses.length} companies found
              </span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-red-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-red-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No businesses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredBusinesses.map((business) => (
              <Card
                key={business.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white"
                onClick={() => navigateToDetails(business)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {business.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {business.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => toggleFavorite(business.id, e)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favorites.has(business.id)
                              ? "text-red-500 fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => shareCompany(business, e)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Share2 className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {business.address?.split(",")[0]}
                      </span>
                    </div>

                    {business.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {business.phone}
                        </span>
                      </div>
                    )}

                    {business.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {business.website}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">
                          {business.rating || "N/A"}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({business.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Spotted a Scammer? Report Them Now!
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Help protect others from visa fraud by reporting suspicious
            companies
          </p>
          <Button
            onClick={() => navigate("/complaint")}
            size="lg"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg"
          >
            🚨 REPORT SCAM
          </Button>
        </div>
      </div>

      <CommunityProtection />
      <GovernmentSection />
      <Footer />
    </div>
  );
};

export default BusinessDirectory;
