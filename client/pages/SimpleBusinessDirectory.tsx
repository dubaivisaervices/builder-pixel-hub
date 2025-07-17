import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Building2,
  Search,
  Users,
  Loader2,
} from "lucide-react";
import { getBestLogoUrl } from "@/lib/imageUtils";
import { loadBusinessesWithFallback, databaseService } from "@/lib/database";

export default function SimpleBusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const navigate = useNavigate();

  // Load businesses from API
  useEffect(() => {
    async function loadBusinesses() {
      try {
        setLoading(true);
        setError(null);

        console.log("🗄️ Loading businesses from database...");

        let businessData = null;

        // Priority 1: Try database first (force database loading)
        try {
          console.log("🔄 Connecting to database...");
          const dbResponse = await fetch(
            "/.netlify/functions/database-businesses?all=true",
          );
          console.log("📡 Database response status:", dbResponse.status);

          if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            console.log("📊 Database response:", dbData);

            if (dbData.businesses && dbData.businesses.length > 0) {
              businessData = dbData.businesses;
              console.log(
                `✅ SUCCESS: Loaded ${businessData.length} businesses from database`,
              );
              setAllDataLoaded(true);
            } else {
              console.warn(
                "⚠️ Database connected but no businesses found. Need to import data!",
              );
              throw new Error("No businesses in database - import needed");
            }
          } else {
            console.warn(
              "❌ Database response not OK:",
              dbResponse.status,
              dbResponse.statusText,
            );
            throw new Error(`Database API failed: ${dbResponse.status}`);
          }
        } catch (dbError) {
          console.error("❌ Database loading failed:", dbError.message);
          console.log("📄 Falling back to JSON files...");
        }

        // Priority 2: Fallback to small JSON file (avoid large file 403 errors)
        if (!businessData) {
          try {
            console.log("📄 Trying JSON fallback...");
            const fallbackResponse = await fetch(
              `/api/dubai-visa-services.json?v=${Date.now()}`,
            );
            console.log("📡 JSON response status:", fallbackResponse.status);

            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              businessData = Array.isArray(fallbackData)
                ? fallbackData
                : fallbackData.businesses || [];
              console.log(
                `📄 SUCCESS: Loaded ${businessData.length} businesses from JSON`,
              );
              setAllDataLoaded(businessData.length > 25);
            } else {
              console.warn(
                `📄 JSON response failed: ${fallbackResponse.status}`,
              );
              throw new Error(
                `JSON file access failed: ${fallbackResponse.status}`,
              );
            }
          } catch (jsonError) {
            console.error("📄 JSON fallback failed:", jsonError.message);
          }
        }

        // Priority 3: Emergency hardcoded data to prevent blank page
        if (!businessData || businessData.length === 0) {
          console.log(
            "⚠️ No data found from any source - using emergency fallback",
          );
          // Show a helpful error message instead of blank page
          setError(
            "No business data available. Please check database connection or try refreshing the page.",
          );
          businessData = [];
        }

        // Transform data to ensure consistent format
        const processedBusinesses = businessData.map((business) => ({
          id: business.id || business.place_id,
          name: business.name,
          address: business.address || business.formatted_address || "",
          category: business.category || business.type || "Business Services",
          phone: business.phone || business.formatted_phone_number || "",
          website: business.website || "",
          rating: business.rating || business.google_rating || 4.0,
          reviewCount: business.reviewCount || business.user_ratings_total || 0,
          logoUrl: getBestLogoUrl(business),
          photos: business.photos || [],
        }));

        setBusinesses(processedBusinesses);
        setFilteredBusinesses(processedBusinesses);
        console.log(`Total businesses loaded: ${processedBusinesses.length}`);
      } catch (error) {
        console.error("Error loading businesses:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  // Filter businesses based on search
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = businesses.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredBusinesses(filtered);
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [searchTerm, businesses]);

  const handleBusinessClick = (business: any) => {
    navigate(`/company/${business.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Loading Business Directory
          </h2>
          <p className="text-gray-600">
            Fetching the latest business listings...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <Building2 className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Error Loading Businesses
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Dubai Business Directory
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {businesses.length} Verified Businesses • Real Reviews • Scam
              Protection
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            Showing {Math.min(displayCount, filteredBusinesses.length)} of{" "}
            {filteredBusinesses.length} businesses
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBusinesses.slice(0, displayCount).map((business) => (
            <Card
              key={business.id}
              className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleBusinessClick(business)}
            >
              <CardContent className="p-6">
                {/* Logo */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={business.logoUrl || getBestLogoUrl(business)}
                    alt={`${business.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Try local business logo first
                      if (!target.src.includes("/business-images/logos/")) {
                        const businessId = business.id || business.place_id;
                        if (businessId) {
                          target.src = `/business-images/logos/logo-${businessId}.jpg`;
                          return;
                        }
                      }
                      // Final fallback to stock image
                      target.src =
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80";
                    }}
                  />
                </div>

                {/* Business Name */}
                <h3 className="font-semibold text-center mb-2 line-clamp-2 h-12">
                  {business.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center justify-center mb-3">
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
                  <span className="ml-2 font-semibold text-gray-900">
                    {business.rating}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({business.reviewCount})
                  </span>
                </div>

                {/* Category */}
                <div className="text-center mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {business.category}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-2">{business.address}</span>
                </div>

                {/* Contact */}
                <div className="space-y-1">
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
                <div className="mt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBusinessClick(business);
                    }}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredBusinesses.length > displayCount && (
          <div className="text-center mt-12">
            <Button
              onClick={() => {
                setLoadingMore(true);
                setTimeout(() => {
                  setDisplayCount(displayCount + 50);
                  setLoadingMore(false);
                }, 500);
              }}
              disabled={loadingMore}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading More...
                </>
              ) : (
                <>
                  Load More Businesses (
                  {Math.min(50, filteredBusinesses.length - displayCount)} more)
                  <Users className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Show completion message when all data is displayed */}
        {filteredBusinesses.length <= displayCount &&
          filteredBusinesses.length > 50 && (
            <div className="text-center mt-12 text-gray-600">
              <p className="text-lg">
                🎉 All {filteredBusinesses.length} businesses loaded!
              </p>
              {allDataLoaded && (
                <p className="text-sm mt-2">
                  Showing complete directory of verified UAE businesses
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
