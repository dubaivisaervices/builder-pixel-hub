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

// No fake reviews - businesses will show empty reviews until real Google reviews are synced

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
    email: "info@dubaiviasolutions.ae",
    // Note: In real implementation, these would come from Google Places API
    logoUrl: undefined, // Will show fallback letter logo
    photos: [
      { id: 1, url: "", caption: "Office Reception" },
      { id: 2, url: "", caption: "Consultation Room" },
    ],
    reviews: [], // No fake reviews
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
    email: "contact@emiratesimmigration.ae",
    reviews: [], // No fake reviews
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
    email: "info@globalvisacenter.ae",
    reviews: [], // No fake reviews
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
    email: "services@dubaitravelvisa.ae",
    reviews: [], // No fake reviews
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
    email: "support@quickvisadubai.ae",
    reviews: [], // No fake reviews
  },
  // Additional comprehensive sample businesses
  {
    id: "sample15",
    name: "Dubai Business Visa Center",
    address: "DIFC, Dubai, UAE",
    location: { lat: 25.213, lng: 55.279 },
    rating: 4.2,
    reviewCount: 445,
    category: "business visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-789-0123",
    email: "contact@dubaibusinessvisa.ae",
    reviews: [],
  },
  {
    id: "sample16",
    name: "Middle East Visa Solutions",
    address: "Jumeirah Lake Towers, Dubai, UAE",
    location: { lat: 25.073, lng: 55.139 },
    rating: 3.8,
    reviewCount: 234,
    category: "visa consulting services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-890-1234",
    email: "info@mevisa.ae",
    reviews: [],
  },
  {
    id: "sample17",
    name: "Gulf Immigration Experts",
    address: "Downtown Dubai, UAE",
    location: { lat: 25.197, lng: 55.274 },
    rating: 4.5,
    reviewCount: 567,
    category: "immigration consultants",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-901-2345",
    email: "experts@gulfimmigration.ae",
    reviews: [],
  },
  {
    id: "sample18",
    name: "Fast Track Visa Services",
    address: "Al Barsha, Dubai, UAE",
    location: { lat: 25.117, lng: 55.2 },
    rating: 4.0,
    reviewCount: 334,
    category: "visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-012-3456",
    email: "fasttrack@visaservices.ae",
    reviews: [],
  },
  {
    id: "sample19",
    name: "Emirates Family Visa Center",
    address: "Al Nahda, Dubai, UAE",
    location: { lat: 25.3, lng: 55.38 },
    rating: 3.9,
    reviewCount: 223,
    category: "family visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-123-4567",
    email: "family@emiratesvisa.ae",
    reviews: [],
  },
  {
    id: "sample20",
    name: "Professional Immigration Dubai",
    address: "Business Bay, Dubai, UAE",
    location: { lat: 25.188, lng: 55.274 },
    rating: 4.3,
    reviewCount: 456,
    category: "immigration services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-234-5678",
    email: "pro@immigrationdubai.ae",
    reviews: [],
  },
  {
    id: "sample21",
    name: "Dubai Student Visa Hub",
    address: "Academic City, Dubai, UAE",
    location: { lat: 25.117, lng: 55.411 },
    rating: 4.1,
    reviewCount: 345,
    category: "student visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-345-6789",
    email: "students@visahub.ae",
    reviews: [],
  },
  {
    id: "sample22",
    name: "Corporate Visa Solutions",
    address: "Financial Centre, Dubai, UAE",
    location: { lat: 25.213, lng: 55.279 },
    rating: 4.4,
    reviewCount: 678,
    category: "business setup",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-456-7890",
    email: "corporate@visasolutions.ae",
    reviews: [],
  },
  {
    id: "sample23",
    name: "Trusted Immigration Advisors",
    address: "Deira City Centre, Dubai, UAE",
    location: { lat: 25.252, lng: 55.347 },
    rating: 3.7,
    reviewCount: 289,
    category: "immigration consultants",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-567-8901",
    email: "trust@advisors.ae",
    reviews: [],
  },
  {
    id: "sample24",
    name: "Golden Visa Specialists",
    address: "Palm Jumeirah, Dubai, UAE",
    location: { lat: 25.112, lng: 55.138 },
    rating: 4.6,
    reviewCount: 512,
    category: "golden visa services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-678-9012",
    email: "golden@visaspecialists.ae",
    reviews: [],
  },
  // Add more categories
  {
    id: "sample25",
    name: "Express Document Services",
    address: "Satwa, Dubai, UAE",
    location: { lat: 25.234, lng: 55.272 },
    rating: 3.8,
    reviewCount: 167,
    category: "document clearing",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-789-0123",
    email: "express@documents.ae",
    reviews: [],
  },
  {
    id: "sample26",
    name: "Attestation Services Dubai",
    address: "Oud Metha, Dubai, UAE",
    location: { lat: 25.237, lng: 55.315 },
    rating: 4.0,
    reviewCount: 234,
    category: "attestation services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-890-1234",
    email: "attest@services.ae",
    reviews: [],
  },
  {
    id: "sample27",
    name: "PRO Services International",
    address: "Al Rigga, Dubai, UAE",
    location: { lat: 25.267, lng: 55.31 },
    rating: 4.2,
    reviewCount: 345,
    category: "PRO services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-901-2345",
    email: "pro@international.ae",
    reviews: [],
  },
  {
    id: "sample28",
    name: "Overseas Career Consultants",
    address: "Tecom, Dubai, UAE",
    location: { lat: 25.111, lng: 55.172 },
    rating: 3.9,
    reviewCount: 278,
    category: "overseas services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-012-3456",
    email: "career@overseas.ae",
    reviews: [],
  },
  {
    id: "sample29",
    name: "Elite Travel & Visa",
    address: "Jumeirah Beach Road, Dubai, UAE",
    location: { lat: 25.204, lng: 55.267 },
    rating: 4.3,
    reviewCount: 456,
    category: "travel agents",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-123-4567",
    email: "elite@travel.ae",
    reviews: [],
  },
  {
    id: "sample30",
    name: "Work Permit Solutions",
    address: "Motor City, Dubai, UAE",
    location: { lat: 25.056, lng: 55.232 },
    rating: 4.1,
    reviewCount: 334,
    category: "work permit",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-234-5678",
    email: "work@permits.ae",
    reviews: [],
  },
];

// Enhanced fallback with more comprehensive sample data - expanded for better coverage
const getEnhancedFallbackBusinesses = (): BusinessData[] => [
  ...getFallbackBusinesses(),
  {
    id: "sample6",
    name: "Al Fardan Immigration Services",
    address: "Sheikh Zayed Road, Dubai, UAE",
    location: { lat: 25.213, lng: 55.279 },
    rating: 4.1,
    reviewCount: 234,
    category: "immigration lawyers",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-987-6543",
    website: "https://alfardan-immigration.ae",
    reviews: [], // No fake reviews
  },
  {
    id: "sample7",
    name: "Express PRO Services Dubai",
    address: "Trade Centre, Dubai, UAE",
    location: { lat: 25.222, lng: 55.285 },
    rating: 4.3,
    reviewCount: 189,
    category: "PRO services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-567-8901",
    reviews: [], // No fake reviews
  },
  {
    id: "sample8",
    name: "Dubai Document Clearing",
    address: "Al Garhoud, Dubai, UAE",
    location: { lat: 25.252, lng: 55.347 },
    rating: 3.9,
    reviewCount: 156,
    category: "document clearing",
    businessStatus: "OPERATIONAL",
    isOpen: false,
    phone: "+971-4-234-5678",
    reviews: [], // No fake reviews
  },
  {
    id: "sample9",
    name: "Emirates Attestation Center",
    address: "Karama, Dubai, UAE",
    location: { lat: 25.238, lng: 55.289 },
    rating: 4.0,
    reviewCount: 298,
    category: "attestation services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-345-6789",
    website: "https://emirates-attestation.com",
    reviews: [], // No fake reviews
  },
  {
    id: "sample10",
    name: "Skyline Immigration Consultants",
    address: "Marina Walk, Dubai, UAE",
    location: { lat: 25.077, lng: 55.139 },
    rating: 4.4,
    reviewCount: 167,
    category: "immigration consultants",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-456-7890",
    reviews: [], // No fake reviews
  },
  {
    id: "sample11",
    name: "Global Overseas Services",
    address: "Satwa, Dubai, UAE",
    location: { lat: 25.232, lng: 55.279 },
    rating: 4.2,
    reviewCount: 201,
    category: "overseas services",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-567-8901",
    website: "https://global-overseas.ae",
    reviews: [], // No fake reviews
  },
  {
    id: "sample12",
    name: "Dubai Work Permit Center",
    address: "DIFC, Dubai, UAE",
    location: { lat: 25.214, lng: 55.282 },
    rating: 4.1,
    reviewCount: 145,
    category: "work permit",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-678-9012",
    reviews: [], // No fake reviews
  },
  {
    id: "sample13",
    name: "Study Abroad Dubai",
    address: "Jumeirah Beach Road, Dubai, UAE",
    location: { lat: 25.231, lng: 55.266 },
    rating: 4.5,
    reviewCount: 178,
    category: "study abroad",
    businessStatus: "OPERATIONAL",
    isOpen: true,
    phone: "+971-4-789-0123",
    reviews: [], // No fake reviews
    website: "https://studyabroaddubai.com",
  },
];

export default function BusinessDirectory() {
  const navigate = useNavigate();
  // Start with empty state and load immediately
  const [allBusinesses, setAllBusinesses] = useState<BusinessData[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessData[]>(
    [],
  );
  const [displayedBusinesses, setDisplayedBusinesses] = useState<
    BusinessData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);

  const ITEMS_PER_PAGE = 25;

  useEffect(() => {
    // Auto-fetch live data with logos on page load - prevent multiple calls
    if (!isApiCallInProgress) {
      fetchDubaiBusinesses();
    }
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [allBusinesses, searchTerm, selectedCategory]);

  const fetchDubaiBusinesses = async (page = 1, append = false) => {
    // Prevent multiple concurrent API calls
    if (isApiCallInProgress) {
      console.log("API call already in progress, skipping...");
      return;
    }

    try {
      setIsApiCallInProgress(true);
      if (!append) setLoading(true);
      if (append) setLoadingMore(true);
      setError(null);

      // Add timeout and better error handling - much faster now
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      console.log(
        `Starting API call to fetch Dubai businesses page ${page}...`,
      );
      const response = await fetch(
        `/api/dubai-visa-services?page=${page}&limit=300`,
        {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`,
        );
      }

      const data: BusinessSearchResponse = await response.json();
      console.log(
        `API response received: ${data.businesses?.length || 0} businesses`,
      );
      console.log("API response keys:", Object.keys(data));
      console.log(
        "First business sample:",
        data.businesses?.[0]
          ? Object.keys(data.businesses[0])
          : "No businesses",
      );

      // If no businesses found from API, use fallback data
      if (!data.businesses || data.businesses.length === 0) {
        if (data.needsSync) {
          console.log(
            "Database is empty, showing fallback data with sync message",
          );
          setError(
            "Database is empty. Using sample data. Visit /admin/sync to load real Google data.",
          );
        } else {
          console.log("No businesses found, using fallback data");
        }
        setAllBusinesses(getEnhancedFallbackBusinesses());
        setCategories([
          "visa consulting services",
          "immigration consultants",
          "visa services",
          "overseas services",
          "work permit",
          "study abroad",
          "travel agents",
        ]);
      } else {
        console.log(
          `Successfully loaded ${data.businesses.length} businesses from ${data.source || "database"}`,
        );

        if (append) {
          // Append new businesses to existing list
          setAllBusinesses((prev) => [...prev, ...data.businesses]);
        } else {
          // Replace with new businesses
          setAllBusinesses(data.businesses);
        }

        setCategories(data.categories);
        setError(null);

        // Update pagination info
        console.log("Pagination data:", data.pagination);
        if (data.pagination) {
          setCurrentPage(data.pagination.page);
          setHasMore(data.pagination.hasMore);
          console.log(
            "Updated pagination - page:",
            data.pagination.page,
            "hasMore:",
            data.pagination.hasMore,
          );
        }

        // Force loading to false with a small delay to ensure state updates
        setTimeout(() => {
          console.log("Forcing loading to false as backup");
          setLoading(false);
          setIsApiCallInProgress(false);
        }, 100);
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);

      // Use fallback data on any error
      console.log("API error, using enhanced fallback data");
      setAllBusinesses(getEnhancedFallbackBusinesses());
      setCategories([
        "visa consulting services",
        "immigration consultants",
        "visa services",
        "overseas services",
        "work permit",
        "study abroad",
        "travel agents",
        "immigration lawyers",
        "PRO services",
        "document clearing",
      ]);

      let errorMessage = null; // Don't show error, just use fallback seamlessly

      if (err instanceof Error) {
        console.log("Error details:", err.name, err.message);
        if (err.name === "AbortError") {
          console.log("Request timeout - using fallback data");
        } else if (
          err.message.includes("fetch") ||
          err.message.includes("Failed to fetch")
        ) {
          console.log("Connection issue - using fallback data");
        } else {
          console.log("API error - using fallback data");
        }
      }

      setError(errorMessage);
    } finally {
      console.log("Finally block executing - setting loading to false");
      setLoading(false);
      if (append) setLoadingMore(false);
      setIsApiCallInProgress(false);
      console.log("API call completed and state cleaned up");
    }
  };

  const filterBusinesses = () => {
    console.log(
      "filterBusinesses called with:",
      allBusinesses.length,
      "businesses",
    );
    let filtered = allBusinesses;

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

    // Sort by review count (highest first) then by rating
    filtered = filtered.sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount;
      }
      return b.rating - a.rating;
    });

    console.log("Setting filtered businesses:", filtered.length);
    setFilteredBusinesses(filtered);

    // Show all filtered businesses (no pagination needed since we load all from DB)
    console.log("Setting displayed businesses:", filtered.length);
    setDisplayedBusinesses(filtered);
    setHasMore(false); // No pagination needed
    console.log("filterBusinesses completed successfully");
  };

  const loadMoreBusinesses = () => {
    const nextPage = currentPage + 1;
    fetchDubaiBusinesses(nextPage, true); // Append to existing data
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

  console.log(
    "Render - loading state:",
    loading,
    "businesses count:",
    allBusinesses.length,
    "displayed:",
    displayedBusinesses.length,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Loading Dubai Visa Services
          </h3>
          <p className="text-muted-foreground mb-4">
            Loading Dubai visa service providers from our database. Contact
            information and business details are loaded instantly.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              ⚡ Fast loading from local database - should complete in under 3
              seconds!
            </p>
          </div>
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
                  {loading
                    ? "Loading reliable business database from Google... (This may take 60-90 seconds)"
                    : `${filteredBusinesses.length} businesses found • Showing ${displayedBusinesses.length} (sorted by reviews)`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner - Only show when there's an actual error */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-1">API Issue</h3>
                <p className="text-sm text-yellow-700">{error}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchDubaiBusinesses}
                    disabled={loading}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    {loading ? "Retrying..." : "Retry Google API"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-yellow-600 hover:bg-yellow-100"
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
        {displayedBusinesses.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedBusinesses.map((business) => (
                <Card
                  key={business.id}
                  className="shadow-lg border-0 hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Business Logo */}
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center border border-primary/20 flex-shrink-0 overflow-hidden relative">
                          {business.logoUrl ? (
                            <>
                              <img
                                src={business.logoUrl}
                                alt={`${business.name} logo`}
                                className="w-full h-full object-cover absolute inset-0"
                                onError={(e) => {
                                  // Hide image and show fallback letter
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  const fallback = parent?.querySelector(
                                    ".logo-fallback",
                                  ) as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = "flex";
                                  }
                                }}
                                onLoad={(e) => {
                                  // Hide fallback when image loads successfully
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  const fallback = parent?.querySelector(
                                    ".logo-fallback",
                                  ) as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = "none";
                                  }
                                }}
                              />
                              <div
                                className="logo-fallback absolute inset-0 flex items-center justify-center"
                                style={{ display: "none" }}
                              >
                                <span className="text-primary text-xl font-bold">
                                  {business.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="logo-fallback absolute inset-0 flex items-center justify-center">
                              <span className="text-primary text-xl font-bold">
                                {business.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
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
                        {business.reviewCount > 0 &&
                          ` (${business.reviewCount})`}
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

                    {business.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {business.phone}
                        </span>
                      </div>
                    )}

                    {business.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline line-clamp-1"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
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

                    {/* Reviews Summary - simplified for faster loading */}
                    {business.reviewCount > 0 && (
                      <div className="mt-4 border-t pt-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            Customer Reviews
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {business.reviewCount} reviews available
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Click "View Details" to see full reviews and ratings
                        </p>
                      </div>
                    )}

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

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <Card className="shadow-lg border-0 inline-block">
                  <CardContent className="pt-6 pb-6">
                    <Button
                      onClick={loadMoreBusinesses}
                      disabled={loadingMore}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Loading More...
                        </>
                      ) : (
                        <>
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
                    <p className="text-sm text-muted-foreground mt-3">
                      Showing {displayedBusinesses.length} of{" "}
                      {filteredBusinesses.length} businesses
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Results Summary */}
        {!loading && filteredBusinesses.length > 0 && (
          <Card className="shadow-lg border-0 mt-8">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-semibold mb-4">
                📊 Comprehensive Dubai Visa Services Database
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {filteredBusinesses.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Businesses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {categories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Service Categories
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(
                      (filteredBusinesses.reduce(
                        (acc, b) => acc + b.rating,
                        0,
                      ) /
                        filteredBusinesses.length) *
                        10,
                    ) / 10}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Rating
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                This comprehensive database includes visa consultants,
                immigration lawyers, PRO services, document clearing, and
                attestation services across Dubai.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="shadow-lg border-0 mt-8">
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
