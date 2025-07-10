import React, { useState, useEffect } from "react";
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

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBusinesses();
    // Set search term from navigation state if available
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state]);

  useEffect(() => {
    // Filter businesses based on search term
    if (searchTerm.trim()) {
      const filtered = businesses.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredBusinesses(filtered);
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [searchTerm, businesses]);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/dubai-visa-services?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value.length >= 2) {
      const filtered = businesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 5);
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (business: BusinessData) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Dubai Business Directory
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover trusted businesses in Dubai. Our comprehensive directory
            features verified companies with real customer reviews and detailed
            business information. Find the perfect service provider for your
            needs with confidence.
          </p>
        </div>

        {/* Search Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search businesses by name, category, or location..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-14 pl-6 pr-14 bg-white border-2 border-gray-200 focus:border-blue-400 rounded-xl text-lg"
              />
              <Search className="absolute right-5 top-4 h-6 w-6 text-gray-400" />

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {searchSuggestions.map((business) => (
                    <div
                      key={business.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-3"
                      onClick={() => handleSuggestionClick(business)}
                    >
                      {/* Business Logo */}
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
                        <h3 className="font-medium text-gray-900 truncate">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {business.address}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{business.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading businesses...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBusinesses.slice(0, 12).map((business) => (
              <Card
                key={business.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-xl"
                onClick={() => navigateToDetails(business)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Business Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
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
                      <span className={business.logoUrl ? "hidden" : ""}>
                        {business.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
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
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{business.address}</span>
                    </div>

                    {business.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span>{business.phone}</span>
                      </div>
                    )}

                    {business.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{business.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Show More Button */}
        {filteredBusinesses.length > 12 && (
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                /* Add pagination logic */
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl"
            >
              Load More Businesses
            </Button>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredBusinesses.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No businesses found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or browse all businesses.
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="mt-4"
            >
              Show All Businesses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
