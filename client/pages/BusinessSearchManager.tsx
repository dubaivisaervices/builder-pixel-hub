import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  MapPin,
  Star,
  Phone,
  Globe,
  Image,
  MessageSquare,
  Wifi,
  WifiOff,
  Download,
  Database,
  Github,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
} from "lucide-react";

interface SearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  business_status?: string;
  photos?: Array<{ photo_reference: string }>;
  website?: string;
  formatted_phone_number?: string;
  types?: string[];
}

interface ApiStatus {
  connected: boolean;
  totalCalls: number;
  costToday: number;
}

interface AddBusinessProgress {
  stage: string;
  current: number;
  total: number;
  isRunning: boolean;
  success: boolean;
  error?: string;
}

export default function BusinessSearchManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [category, setCategory] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<SearchResult | null>(
    null,
  );
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    connected: false,
    totalCalls: 0,
    costToday: 0,
  });
  const [addProgress, setAddProgress] = useState<AddBusinessProgress>({
    stage: "idle",
    current: 0,
    total: 0,
    isRunning: false,
    success: false,
  });
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [githubBranch, setGithubBranch] = useState("main");

  // Categories for dropdown
  const categories = [
    "Business Setup",
    "Document Clearing",
    "Legal Services",
    "Immigration",
    "Travel Agency",
    "Education",
    "Real Estate",
    "Moving Services",
    "Medical Services",
  ];

  useEffect(() => {
    fetchApiStatus();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const response = await fetch("/api/admin/api-status");
      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          connected: data.api?.enabled || false,
          totalCalls: data.costs?.apiCalls || 0,
          costToday: parseFloat(
            data.costs?.estimatedCost?.replace("$", "") || "0",
          ),
        });
      }
    } catch (error) {
      console.error("Failed to fetch API status:", error);
    }
  };

  const connectApi = async () => {
    try {
      const response = await fetch("/api/admin/api-enable", {
        method: "POST",
      });
      if (response.ok) {
        setApiStatus((prev) => ({ ...prev, connected: true }));
      }
    } catch (error) {
      console.error("Failed to connect API:", error);
    }
  };

  const disconnectApi = async () => {
    try {
      const response = await fetch("/api/admin/api-disable", {
        method: "POST",
      });
      if (response.ok) {
        setApiStatus((prev) => ({ ...prev, connected: false }));
      }
    } catch (error) {
      console.error("Failed to disconnect API:", error);
    }
  };

  const searchBusinesses = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const params = new URLSearchParams({
        query: searchQuery,
        location: location,
        ...(category && { category }),
      });

      const response = await fetch(
        `/api/admin/search-businesses?${params.toString()}`,
      );

      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.results || []);
      } else {
        console.error("Search failed:", data.details || response.statusText);

        // Show user-friendly error
        alert(
          `Search failed: ${data.details || "Unknown error"}\n\nSolution: ${data.solution || "Please check your API configuration"}`,
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed: Network error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const addBusinessToDatabase = async (business: SearchResult) => {
    setAddProgress({
      stage: "connecting",
      current: 0,
      total: 5,
      isRunning: true,
      success: false,
    });

    try {
      // Step 1: Ensure API is connected
      if (!apiStatus.connected) {
        await connectApi();
        setAddProgress((prev) => ({
          ...prev,
          stage: "connected",
          current: 1,
        }));
      }

      // Step 2: Add business with full details
      setAddProgress((prev) => ({
        ...prev,
        stage: "adding-business",
        current: 2,
      }));

      const addResponse = await fetch("/api/admin/add-business-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: business.place_id }),
      });

      if (!addResponse.ok) {
        throw new Error("Failed to add business");
      }

      // Step 3: Download reviews
      setAddProgress((prev) => ({
        ...prev,
        stage: "downloading-reviews",
        current: 3,
      }));

      const reviewResponse = await fetch(
        "/api/admin/download-business-reviews",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ place_id: business.place_id }),
        },
      );

      // Step 4: Download photos and logo
      setAddProgress((prev) => ({
        ...prev,
        stage: "downloading-media",
        current: 4,
      }));

      const mediaResponse = await fetch("/api/admin/download-business-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: business.place_id }),
      });

      // Step 5: Disconnect API to save costs
      setAddProgress((prev) => ({
        ...prev,
        stage: "disconnecting",
        current: 5,
      }));

      await disconnectApi();

      setAddProgress({
        stage: "completed",
        current: 5,
        total: 5,
        isRunning: false,
        success: true,
      });

      // Refresh search results to show it's added
      setTimeout(() => {
        setAddProgress({
          stage: "idle",
          current: 0,
          total: 0,
          isRunning: false,
          success: false,
        });
      }, 3000);
    } catch (error) {
      console.error("Failed to add business:", error);
      setAddProgress({
        stage: "error",
        current: 0,
        total: 0,
        isRunning: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Ensure API is disconnected even on error
      await disconnectApi();
    }
  };

  const addCategoryToDatabase = async () => {
    if (!category) return;

    setAddProgress({
      stage: "searching-category",
      current: 0,
      total: 10,
      isRunning: true,
      success: false,
    });

    try {
      // Connect API
      if (!apiStatus.connected) {
        await connectApi();
      }

      // Search for businesses in category
      const response = await fetch("/api/admin/add-category-businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          location,
          limit: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Process each business
        for (let i = 0; i < data.businesses.length; i++) {
          setAddProgress((prev) => ({
            ...prev,
            stage: `adding-business-${i + 1}`,
            current: i + 1,
          }));

          await addBusinessToDatabase(data.businesses[i]);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between businesses
        }

        setAddProgress({
          stage: "completed",
          current: 10,
          total: 10,
          isRunning: false,
          success: true,
        });
      }

      // Disconnect API
      await disconnectApi();
    } catch (error) {
      console.error("Failed to add category businesses:", error);
      setAddProgress({
        stage: "error",
        current: 0,
        total: 0,
        isRunning: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      await disconnectApi();
    }
  };

  const pullFromGithub = async () => {
    try {
      const response = await fetch("/api/admin/github-pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: githubBranch }),
      });

      if (response.ok) {
        setShowGithubDialog(false);
        // Show success message
      }
    } catch (error) {
      console.error("Failed to pull from GitHub:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Search & Management
        </h1>
        <p className="text-gray-600">
          Search and add new businesses to your database with complete data
        </p>
      </div>

      {/* API Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            {apiStatus.connected ? (
              <Wifi className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 mr-2 text-red-500" />
            )}
            API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge
                variant={apiStatus.connected ? "default" : "secondary"}
                className={
                  apiStatus.connected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {apiStatus.connected ? "Connected" : "Disconnected"}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Cost today: ${apiStatus.costToday.toFixed(2)} | Calls:{" "}
                {apiStatus.totalCalls}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={connectApi}
                disabled={apiStatus.connected}
                variant="outline"
                size="sm"
              >
                Connect
              </Button>
              <Button
                onClick={disconnectApi}
                disabled={!apiStatus.connected}
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Integration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Github className="h-5 w-5 mr-2" />
            GitHub Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              GitHub integration for pulling business data (Coming Soon)
            </p>
            <Button variant="outline" size="sm" disabled>
              <Github className="h-4 w-4 mr-2" />
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Business Addition */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Business Manually
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">
                    Manual Addition Available
                  </h4>
                  <p className="text-sm text-blue-700">
                    If search is not working due to API limitations, you can
                    manually add businesses using their Google Place ID. Find
                    the business on Google Maps, copy the place ID from the URL,
                    and paste it below.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Google Place ID (e.g., ChIJN1t_tDeuEmsRUsoyG83frY4)"
                id="manualPlaceId"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById(
                    "manualPlaceId",
                  ) as HTMLInputElement;
                  const placeId = input?.value.trim();
                  if (placeId) {
                    addBusinessToDatabase({
                      place_id: placeId,
                      name: "Manual Addition",
                    } as SearchResult);
                    input.value = "";
                  } else {
                    alert("Please enter a Google Place ID");
                  }
                }}
                disabled={!apiStatus.connected || addProgress.isRunning}
              >
                <Database className="h-4 w-4 mr-2" />
                Add by Place ID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search New Businesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search for businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchBusinesses()}
              />
              <Input
                placeholder="Location (e.g., Dubai, UAE)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={searchBusinesses}
                disabled={!apiStatus.connected || isSearching}
                className="flex-1"
              >
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search Businesses
              </Button>
              <Button
                onClick={addCategoryToDatabase}
                disabled={
                  !apiStatus.connected || !category || addProgress.isRunning
                }
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
            {!apiStatus.connected && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect to API first to search for businesses
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Progress */}
      {addProgress.isRunning && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Adding Business to Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Stage: {addProgress.stage}</span>
                <span>
                  {addProgress.current} / {addProgress.total}
                </span>
              </div>
              <Progress
                value={(addProgress.current / addProgress.total) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500">
                This will automatically disconnect API when complete to save
                costs
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((business) => (
                <div
                  key={business.place_id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{business.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {business.formatted_address}
                        </span>
                        {business.rating && (
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {business.rating} ({business.user_ratings_total}{" "}
                            reviews)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        {business.formatted_phone_number && (
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {business.formatted_phone_number}
                          </span>
                        )}
                        {business.website && (
                          <span className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            Website
                          </span>
                        )}
                        {business.photos && (
                          <span className="flex items-center">
                            <Image className="h-4 w-4 mr-1" />
                            {business.photos.length} photos
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => addBusinessToDatabase(business)}
                      disabled={addProgress.isRunning}
                      size="sm"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Add to Database
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success/Error Messages */}
      {addProgress.success && (
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Business successfully added to database with reviews, photos, and
            logo!
          </AlertDescription>
        </Alert>
      )}

      {addProgress.error && (
        <Alert variant="destructive" className="mt-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Error: {addProgress.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
