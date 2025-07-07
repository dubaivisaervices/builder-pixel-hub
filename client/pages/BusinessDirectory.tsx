import { useState, useEffect } from "react";
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
} from "lucide-react";
import { BusinessData, BusinessSearchResponse } from "@shared/google-business";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fallback sample data for Dubai visa services
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
  },
  {
    id: "sample2",
    name: "Emirates Immigration Services",
    address: "Deira, Dubai, UAE",
    location: { lat: 25.263, lng: 55.297 },
    rating: 4.0,
    reviewCount: 89,
    category: "immigration consultants",
    businessStatus: "OPERATIONAL",
    isOpen: true,
  },
  {
    id: "sample3",
    name: "Global Visa Center Dubai",
    address: "Jumeirah, Dubai, UAE",
    location: { lat: 25.218, lng: 55.272 },
    rating: 3.8,
    reviewCount: 234,
    category: "visa services",
    businessStatus: "OPERATIONAL",
    isOpen: false,
  },
  {
    id: "sample4",
    name: "Dubai Travel & Visa Hub",
    address: "Al Karama, Dubai, UAE",
    location: { lat: 25.238, lng: 55.289 },
    rating: 4.5,
    reviewCount: 67,
    category: "travel agents",
    businessStatus: "OPERATIONAL",
    isOpen: true,
  },
  {
    id: "sample5",
    name: "Quick Visa Dubai",
    address: "Bur Dubai, Dubai, UAE",
    location: { lat: 25.262, lng: 55.29 },
    rating: 3.5,
    reviewCount: 123,
    category: "visa agency",
    businessStatus: "OPERATIONAL",
    isOpen: true,
  },
];

export default function BusinessDirectory() {
  const navigate = useNavigate();
  // Initialize with fallback data immediately
  const [businesses, setBusinesses] = useState<BusinessData[]>(
    getFallbackBusinesses(),
  );
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessData[]>(
    getFallbackBusinesses(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    "Showing sample Dubai businesses. Click 'Load Live Data' to fetch from Google.",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([
    "visa consulting services",
    "immigration consultants",
    "visa services",
    "travel agents",
    "visa agency",
  ]);

  useEffect(() => {
    // Don't auto-fetch on load, let user trigger it
    // fetchDubaiBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchTerm, selectedCategory]);

  const fetchDubaiBusinesses = async () => {
    try {
      setLoading(true);

      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/dubai-visa-services", {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BusinessSearchResponse = await response.json();

      // If no businesses found from API, use fallback data
      if (!data.businesses || data.businesses.length === 0) {
        console.log("No businesses from API, using fallback data");
        setBusinesses(getFallbackBusinesses());
        setCategories([
          "visa consulting services",
          "immigration consultants",
          "visa services",
          "travel agents",
        ]);
        setError("API returned no results. Showing sample businesses.");
      } else {
        console.log(
          `Successfully loaded ${data.businesses.length} businesses from API`,
        );
        setBusinesses(data.businesses);
        setCategories(data.categories);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);

      // Use fallback data on any error
      console.log("API error, using fallback data");
      setBusinesses(getFallbackBusinesses());
      setCategories([
        "visa consulting services",
        "immigration consultants",
        "visa services",
        "travel agents",
      ]);

      let errorMessage = "Network error. Showing sample Dubai businesses.";
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage = "Request timeout. Showing sample Dubai businesses.";
        } else if (err.message.includes("fetch")) {
          errorMessage =
            "Unable to connect to server. Showing sample Dubai businesses.";
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    let filtered = businesses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()),
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

    setFilteredBusinesses(filtered);
  };

  const getBusinessStatusColor = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return "bg-green-100 text-green-800";
      case "CLOSED_TEMPORARILY":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED_PERMANENTLY":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading Dubai visa services...
          </p>
        </div>
      </div>
    );
  }

  // Don't show error screen, just show warning banner and fallback data

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Dubai Visa Services Directory
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredBusinesses.length} businesses found
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Banner for API Issues */}
        {error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-800 mb-1">
                  Sample Data Mode
                </h3>
                <p className="text-sm text-blue-700">{error}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDubaiBusinesses}
                    disabled={loading}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {loading ? "Loading..." : "Load Live Data from Google"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-blue-600 hover:bg-blue-100"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <Card className="shadow-lg border-0 mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="md:w-64">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-11">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Grid */}
        {filteredBusinesses.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No businesses found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or clearing filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Card
                key={business.id}
                className="shadow-lg border-0 hover:shadow-xl transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Business Logo */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center border border-primary/20 flex-shrink-0 overflow-hidden">
                        {business.logoUrl ? (
                          <img
                            src={business.logoUrl}
                            alt={`${business.name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to letter if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling!.classList.remove(
                                "hidden",
                              );
                            }}
                          />
                        ) : null}
                        <span
                          className={`text-primary text-xl font-bold ${business.logoUrl ? "hidden" : ""}`}
                        >
                          {business.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                          {business.name}
                        </CardTitle>
                        <Badge
                          className={`text-xs ${getBusinessStatusColor(business.businessStatus)}`}
                        >
                          {business.businessStatus.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 mt-2">
                    {renderStars(business.rating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {business.rating > 0
                        ? business.rating.toFixed(1)
                        : "No rating"}
                      {business.reviewCount > 0 && ` (${business.reviewCount})`}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {business.address}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {business.category}
                    </Badge>
                    {business.isOpen !== undefined && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span
                          className={`text-xs ${business.isOpen ? "text-green-600" : "text-red-600"}`}
                        >
                          {business.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        // Navigate to company details page with business data
                        const locationSlug =
                          business.address
                            .split(",")[0]
                            ?.trim()
                            .toLowerCase()
                            .replace(/\s+/g, "-") || "dubai";
                        const nameSlug = business.name
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        navigate(`/reviews/${locationSlug}/${nameSlug}`, {
                          state: { businessData: business },
                        });
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        navigate("/complaint", {
                          state: {
                            companyName: business.name,
                            companyLocation: business.address,
                          },
                        })
                      }
                    >
                      Report Issues
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <Card className="shadow-lg border-0 mt-12">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-4">
              Don't see your experience listed?
            </h3>
            <p className="text-muted-foreground mb-6">
              Help the community by reporting your experience with visa service
              providers in Dubai.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/complaint")}
              className="bg-primary hover:bg-primary/90"
            >
              Report a Company
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
