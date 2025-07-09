import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Phone,
  Globe,
  Users,
  AlertTriangle,
  Eye,
  MessageSquare,
  TrendingUp,
  Building2,
  Mail,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  isOpen?: boolean;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
}

interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  ratingFilter: number;
}

// Sample data for immediate display
const getSampleBusinesses = (): BusinessData[] => [
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
    phone: "+971-4-777-8888",
    website: "https://gulfvisacenter.com",
  },
  {
    id: "sample4",
    name: "Professional Visa Consultants",
    address: "Sheikh Zayed Road, Dubai, UAE",
    location: { lat: 25.22, lng: 55.297 },
    rating: 4.5,
    reviewCount: 127,
    category: "professional visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@provisaconsultants.ae",
    phone: "+971-4-999-0000",
    website: "https://provisaconsultants.com",
  },
  {
    id: "sample5",
    name: "Fast Track Visas",
    address: "Dubai Marina, Dubai, UAE",
    location: { lat: 25.08, lng: 55.139 },
    rating: 3.9,
    reviewCount: 94,
    category: "express visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    email: "info@fasttrackvisas.ae",
    phone: "+971-4-888-9999",
    website: "https://fasttrackvisas.ae",
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
  },
];

const ITEMS_PER_PAGE = 12;

export default function BusinessDirectory() {
  const navigate = useNavigate();
  const location = useLocation();

  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: location.state?.searchTerm || "",
    category: "all",
    sortBy: "rating",
    ratingFilter: 0,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Simple and robust data fetching
  const fetchBusinesses = useCallback(async (): Promise<void> => {
    // Load sample data immediately
    console.log("📋 Loading sample data...");
    setBusinesses(getSampleBusinesses());
    setLoading(false);
    setError("Demo mode - showing sample from 840+ visa services database");

    // Try to fetch live data from all 840 businesses
    try {
      const response = await fetch("/api/dubai-visa-services?limit=1000");
      if (response.ok) {
        const data = await response.json();
        if (
          data.businesses &&
          Array.isArray(data.businesses) &&
          data.businesses.length > 0
        ) {
          console.log(
            `✅ Live data loaded: ${data.businesses.length} businesses`,
          );
          setBusinesses(data.businesses);
          setError(null);
        }
      }
    } catch (err) {
      console.log("📡 Live data unavailable, using sample data");
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Filter and sort businesses
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

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [businesses, filters]);

  const displayedBusinesses = filteredBusinesses.slice(
    0,
    currentPage * ITEMS_PER_PAGE,
  );
  const hasMore = displayedBusinesses.length < filteredBusinesses.length;

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

  const loadMoreBusinesses = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading businesses...</p>
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
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Dubai Visa Services Directory
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  {filteredBusinesses.length} verified visa services from 840+
                  database
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Search and Filters */}
        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search visa services..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="h-12 pl-4 pr-12 bg-white border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                  />
                  <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Notice */}
        {error && (
          <Card className="shadow-xl border-0 bg-blue-50/80 backdrop-blur-xl border-blue-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayedBusinesses.map((business) => (
              <Card
                key={business.id}
                className="shadow-xl border-0 bg-white/80 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105 cursor-pointer relative overflow-hidden"
                onClick={() => navigateToDetails(business)}
              >
                {/* Gradient overlay for enhanced visual appeal */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none" />

                <CardContent className="p-4 md:p-6 relative">
                  {/* Business Header */}
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                        {business.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                          {business.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 flex items-center truncate">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-gray-400" />
                          <span className="truncate">
                            {business.address.split(",")[0]}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {business.isOpen && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 text-xs border border-green-200 shadow-sm"
                        >
                          ● Open
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Verified ✓
                      </Badge>
                    </div>
                  </div>

                  {/* Rating and Category Section */}
                  <div className="bg-gray-50/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
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
                        <span className="font-bold text-gray-900 text-lg">
                          {business.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {business.reviewCount} reviews
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 capitalize"
                    >
                      🏢 {business.category}
                    </Badge>
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

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 mt-4">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg border-0 font-bold text-sm md:text-base py-3 md:py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetails(business);
                      }}
                    >
                      <Eye className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      View Details & Reviews
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 font-bold text-sm md:text-base py-3 md:py-4 shadow-md rounded-xl transition-all duration-300"
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
                      🚨 Report Scam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No services found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or check back later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl inline-block">
              <CardContent className="p-6">
                <Button
                  onClick={loadMoreBusinesses}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Load More Businesses
                  <span className="ml-2 text-sm opacity-75">
                    (+
                    {Math.min(
                      ITEMS_PER_PAGE,
                      filteredBusinesses.length - displayedBusinesses.length,
                    )}{" "}
                    more)
                  </span>
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Showing {displayedBusinesses.length} of{" "}
                  {filteredBusinesses.length} businesses
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Latest Immigration & Visa Services Categories - Before Footer */}
        <div className="mt-12 mb-8">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  🚀 Latest Immigration & Visa Services
                </h2>
                <p className="text-blue-100 max-w-3xl mx-auto">
                  Discover the newest and most comprehensive visa services
                  available in Dubai. Stay updated with the latest immigration
                  programs and opportunities.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  {
                    name: "Digital Nomad Visa",
                    icon: "💻",
                    new: true,
                    desc: "For remote workers",
                  },
                  {
                    name: "Green Visa (5-Year)",
                    icon: "🌿",
                    new: true,
                    desc: "Long-term residency",
                  },
                  {
                    name: "Golden Visa Program",
                    icon: "🏆",
                    popular: true,
                    desc: "10-year residency",
                  },
                  {
                    name: "Freelancer Permit",
                    icon: "🎨",
                    new: true,
                    desc: "Independent work",
                  },
                  {
                    name: "Remote Work Visa",
                    icon: "🌍",
                    new: true,
                    desc: "Work from Dubai",
                  },
                  {
                    name: "Startup Visa",
                    icon: "🚀",
                    popular: true,
                    desc: "Business setup",
                  },
                  {
                    name: "Investor Visa",
                    icon: "💰",
                    popular: true,
                    desc: "Investment-based",
                  },
                  {
                    name: "Retirement Visa",
                    icon: "🏖️",
                    new: true,
                    desc: "For retirees",
                  },
                ].map((service, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        search: service.name.toLowerCase(),
                      }))
                    }
                  >
                    <div className="text-3xl md:text-4xl mb-3">
                      {service.icon}
                    </div>
                    <div className="text-sm md:text-base font-bold mb-1">
                      {service.name}
                    </div>
                    <div className="text-xs text-blue-100 mb-2">
                      {service.desc}
                    </div>
                    {service.new && (
                      <Badge className="bg-green-500 text-white text-xs mt-1 pulse">
                        NEW
                      </Badge>
                    )}
                    {service.popular && (
                      <Badge className="bg-yellow-500 text-black text-xs mt-1 pulse">
                        POPULAR
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-xl shadow-lg"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: "" }))
                  }
                >
                  View All Services 📋
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer - Same as Homepage */}
        <footer className="bg-gray-900 text-white py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => navigate("/")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/complaint")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Report Scam
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/help-center")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/dubai-businesses")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Business Directory
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6">Services</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => navigate("/services/work-visa")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Work Visa Services
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/services/tourist-visa")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Tourist Visa Services
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/services/student-visa")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Student Visa Services
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/services/business-visa")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Business Visa Services
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6">Support</h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => navigate("/complaint")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Report Scam
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/help-center")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/dubai-businesses")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      Business Directory
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/services")}
                      className="text-gray-300 hover:text-white transition-colors text-left"
                    >
                      All Services
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6">Contact</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Dubai, UAE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8">
              {/* Government Logos Section */}
              <div className="mb-8">
                <h3 className="text-center text-white font-semibold mb-6">
                  Authorized Government Partners
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-4 w-32 h-24">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F42d8a3c9ca784d9bab2cfaff5214870e%2F2ed6c7a907ce48b1888b4efbd194a50d?format=webp&width=800"
                      alt="Dubai Economy and Tourism"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-4 w-32 h-24">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F42d8a3c9ca784d9bab2cfaff5214870e%2F31c2a2a281cf498b96a79a162670a913?format=webp&width=800"
                      alt="Ministry of Human Resources & Emiratisation"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-4 w-32 h-24">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F42d8a3c9ca784d9bab2cfaff5214870e%2F337069ef95604c42b94d28b0b67e055f?format=webp&width=800"
                      alt="Amer Center"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-4 w-32 h-24">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F42d8a3c9ca784d9bab2cfaff5214870e%2Fa33633cdd357445196e3405ed84b236c?format=webp&width=800"
                      alt="Tas-heel"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-400">
                <p>&copy; 2024 Dubai Visa Services. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
