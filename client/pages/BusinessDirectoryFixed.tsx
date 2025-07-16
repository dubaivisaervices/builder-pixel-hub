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
  const [totalBusinessCount, setTotalBusinessCount] = useState<number>(0);

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

  // Enhanced data loading with comprehensive fallback strategy
  useEffect(() => {
    const loadBusinessData = async () => {
      console.log("🔄 Starting enhanced business data loading...");

      try {
        // Primary: Try to fetch from API with cache busting
        const timestamp = Date.now();
        const response = await fetch(
          `/api/dubai-visa-services?limit=1000&_t=${timestamp}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log(
          "✅ Successfully loaded from API:",
          data.businesses?.length || 0,
          "businesses",
          "Total in database:",
          data.total || "unknown",
        );

        setBusinesses(data.businesses || []);
        setTotalBusinessCount(data.total || data.businesses?.length || 0);
        setDataSource("API");

        // Log data source and quality info
        if (data.total && data.total >= 1000) {
          console.log(
            `🎉 Full dataset loaded - all ${data.total} businesses available!`,
          );
        } else if (data.businesses?.length >= 50) {
          console.log(
            `📊 Large dataset loaded: ${data.businesses.length} businesses`,
          );
        } else if (data.businesses?.length <= 5) {
          console.log("⚠️ Small dataset - possible fallback data");
        }

        return;
      } catch (error) {
        console.error("❌ API loading failed:", error);

        // Fallback: Use sample data
        const fallbackBusinesses = [
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
        ];

        setBusinesses(fallbackBusinesses);
        setTotalBusinessCount(fallbackBusinesses.length);
        setDataSource("Fallback");
        console.log(
          "📊 Using fallback data:",
          fallbackBusinesses.length,
          "businesses",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 3 && Array.isArray(businesses)) {
      const filtered = businesses.filter(
        (business) =>
          business &&
          (business.name?.toLowerCase().includes(value.toLowerCase()) ||
            business.category?.toLowerCase().includes(value.toLowerCase()) ||
            business.address?.toLowerCase().includes(value.toLowerCase())),
      );
      setSearchSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/dubai-businesses?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((business) =>
        business.category
          ?.toLowerCase()
          .includes(selectedCategory.toLowerCase()),
      );
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (business) =>
          business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [businesses, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            Loading {totalBusinessCount || "1,114+"} businesses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Dubai Business Directory
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Discover {totalBusinessCount || "1,114+"} verified visa and
            immigration service providers in Dubai
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {totalBusinessCount || "1,114+"}
              </div>
              <div className="text-blue-200 text-sm">Total Businesses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {categories.length - 1}
              </div>
              <div className="text-blue-200 text-sm">Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {filteredBusinesses.length}
              </div>
              <div className="text-blue-200 text-sm">Showing</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{dataSource}</div>
              <div className="text-blue-200 text-sm">Data Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 max-h-64 overflow-y-auto">
                  {searchSuggestions.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => navigate(`/company/${business.id}`)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium">{business.name}</div>
                      <div className="text-sm text-gray-500">
                        {business.address}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-lg px-3 py-2 bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
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
        </div>
      </section>

      {/* Business Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No businesses found
              </h3>
              <p className="text-gray-500">
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
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/company/${business.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {business.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="line-clamp-1">
                            {business.address}
                          </span>
                        </div>
                        {business.phone && (
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Phone className="h-4 w-4 mr-1" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <img
                          src={getBestLogoUrl(business)}
                          alt={business.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">
                            {business.rating || "N/A"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          ({business.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {business.category || "Business"}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFavorites = new Set(favorites);
                            if (favorites.has(business.id)) {
                              newFavorites.delete(business.id);
                            } else {
                              newFavorites.add(business.id);
                            }
                            setFavorites(newFavorites);
                          }}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.has(business.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <CommunityProtection />
      <GovernmentSection />
      <Footer />
    </div>
  );
};

export default BusinessDirectory;
