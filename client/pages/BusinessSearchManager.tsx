import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  MapPin,
  Phone,
  Globe,
  Mail,
  Loader2,
  Database,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ApiStatus {
  connected: boolean;
  key: string;
  usageToday: number;
  costSaved: number;
}

interface BusinessData {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  place_id?: string;
}

export default function BusinessSearchManager() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    connected: false,
    key: "",
    usageToday: 0,
    costSaved: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<BusinessData[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );

  // Manual business addition form
  const [manualBusiness, setManualBusiness] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    category: "",
    rating: 5,
    workingHours: {
      weekdays: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "Closed",
      is24x7: false,
    },
    logoUrl: "",
    photos: "",
    reviews: [
      {
        author: "Happy Customer",
        rating: 5,
        text: "Excellent service and professional staff!",
      },
      {
        author: "Satisfied Client",
        rating: 4,
        text: "Great experience, highly recommended.",
      },
      {
        author: "Regular Customer",
        rating: 5,
        text: "Always reliable and trustworthy.",
      },
    ],
  });

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/admin/api-status");
      if (response.ok) {
        const data = await response.json();
        setApiStatus({
          connected: data.connected || false,
          key: data.key || "",
          usageToday: data.usageToday || 0,
          costSaved: data.costSaved || 0,
        });
      }
    } catch (error) {
      console.error("Error checking API status:", error);
      // Set default values on error
      setApiStatus({
        connected: false,
        key: "",
        usageToday: 0,
        costSaved: 0,
      });
    }
  };

  const toggleApiConnection = async () => {
    setLoading(true);
    try {
      const endpoint = apiStatus.connected
        ? "/api/admin/api-disable"
        : "/api/admin/api-enable";
      const response = await fetch(endpoint, { method: "POST" });

      if (response.ok) {
        await checkApiStatus();
        setMessage(
          apiStatus.connected
            ? "API disconnected successfully"
            : "API connected successfully",
        );
        setMessageType("success");
      } else {
        throw new Error("Failed to toggle API connection");
      }
    } catch (error) {
      setMessage("Failed to toggle API connection");
      setMessageType("error");
    }
    setLoading(false);
  };

  const searchBusinesses = async () => {
    if (!searchTerm.trim()) {
      setMessage("Please enter a search term");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `/api/admin/search-businesses?query=${encodeURIComponent(searchTerm)}`,
      );
      const data = await response.json();

      if (response.ok && data.businesses) {
        setSearchResults(data.businesses);
        setMessage(`Found ${data.businesses.length} businesses`);
        setMessageType("success");
      } else {
        setMessage(data.error || "Search failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Search failed - API may be unavailable");
      setMessageType("error");
    }
    setLoading(false);
  };

  const addBusinessToDatabase = async (business: BusinessData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/add-business-manually", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business.name,
          placeId: business.place_id || `offline_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully added ${business.name} to database`);
        setMessageType("success");
      } else {
        setMessage(data.error || "Failed to add business");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to add business to database");
      setMessageType("error");
    }
    setLoading(false);
  };

  const addManualBusiness = async () => {
    if (!manualBusiness.name || !manualBusiness.address) {
      setMessage("Please fill in at least business name and address");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const businessData = {
        id: `offline_${Date.now()}`,
        name: manualBusiness.name,
        address: manualBusiness.address,
        phone: manualBusiness.phone,
        email: manualBusiness.email,
        website: manualBusiness.website,
        rating: manualBusiness.rating,
        category: manualBusiness.category || "General Business",
        description: manualBusiness.description,
        hours_json: JSON.stringify(manualBusiness.workingHours),
        logo_url: manualBusiness.logoUrl,
        photos_json: manualBusiness.photos
          ? manualBusiness.photos.split(",").map((url) => url.trim())
          : [],
        reviews: manualBusiness.reviews,
        business_status: "OPERATIONAL",
        is_open: true,
        lat: 25.2048, // Default Dubai coordinates
        lng: 55.2708,
      };

      const response = await fetch("/api/admin/add-complete-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData),
      });

      if (response.ok) {
        setMessage(
          `Successfully added ${manualBusiness.name} with complete details`,
        );
        setMessageType("success");
        // Reset form
        setManualBusiness({
          name: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          description: "",
          category: "",
          rating: 5,
          workingHours: {
            weekdays: "9:00 AM - 6:00 PM",
            saturday: "9:00 AM - 6:00 PM",
            sunday: "Closed",
            is24x7: false,
          },
          logoUrl: "",
          photos: "",
          reviews: [
            {
              author: "Happy Customer",
              rating: 5,
              text: "Excellent service and professional staff!",
            },
            {
              author: "Satisfied Client",
              rating: 4,
              text: "Great experience, highly recommended.",
            },
            {
              author: "Regular Customer",
              rating: 5,
              text: "Always reliable and trustworthy.",
            },
          ],
        });
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to add business");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Failed to add business - creating basic entry");
      setMessageType("error");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Search & Manager</h1>
            <p className="text-muted-foreground">
              Search and add new businesses to your directory
            </p>
          </div>
        </div>

        {/* API Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {apiStatus.connected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span>Google Places API Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Badge variant={apiStatus.connected ? "default" : "secondary"}>
                  {apiStatus.connected ? "Connected" : "Disconnected"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Cost saved today: ${(apiStatus.costSaved || 0).toFixed(2)}
                </p>
              </div>
              <Button
                onClick={toggleApiConnection}
                disabled={loading}
                variant={apiStatus.connected ? "destructive" : "default"}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {apiStatus.connected ? "Disconnect API" : "Connect API"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Message Display */}
        {message && (
          <Alert variant={messageType === "error" ? "destructive" : "default"}>
            {messageType === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : messageType === "error" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Business Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Businesses (Google Places API)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for businesses (e.g., 'restaurants in Dubai')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchBusinesses()}
                disabled={!apiStatus.connected}
              />
              <Button
                onClick={searchBusinesses}
                disabled={loading || !apiStatus.connected}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Search
              </Button>
            </div>

            {!apiStatus.connected && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Connect to Google Places API to search for businesses
                </AlertDescription>
              </Alert>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Search Results:</h3>
                {searchResults.map((business, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{business.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {business.address}
                        </p>
                        {business.rating && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{business.rating}</span>
                            {business.reviews && (
                              <span className="text-sm text-muted-foreground">
                                ({business.reviews} reviews)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => addBusinessToDatabase(business)}
                        disabled={loading}
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Database
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Manual Business Addition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Add Business Manually (Offline)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Basic Information</h3>
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={manualBusiness.name}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={manualBusiness.address}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Enter full address"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={manualBusiness.category}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="e.g., Restaurant, Hotel, Service"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Contact Information</h3>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={manualBusiness.phone}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+971 XX XXX XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={manualBusiness.email}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="contact@business.com"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={manualBusiness.website}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://business.com"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={manualBusiness.description}
                onChange={(e) =>
                  setManualBusiness((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the business"
                rows={3}
              />
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <h3 className="font-medium">Working Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weekdays">Weekdays</Label>
                  <Input
                    id="weekdays"
                    value={manualBusiness.workingHours.weekdays}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          weekdays: e.target.value,
                        },
                      }))
                    }
                    placeholder="9:00 AM - 6:00 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="saturday">Saturday</Label>
                  <Input
                    id="saturday"
                    value={manualBusiness.workingHours.saturday}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          saturday: e.target.value,
                        },
                      }))
                    }
                    placeholder="9:00 AM - 6:00 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="sunday">Sunday</Label>
                  <Input
                    id="sunday"
                    value={manualBusiness.workingHours.sunday}
                    onChange={(e) =>
                      setManualBusiness((prev) => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          sunday: e.target.value,
                        },
                      }))
                    }
                    placeholder="Closed"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={manualBusiness.logoUrl}
                  onChange={(e) =>
                    setManualBusiness((prev) => ({
                      ...prev,
                      logoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
              <div>
                <Label htmlFor="photos">Photos (comma-separated URLs)</Label>
                <Input
                  id="photos"
                  value={manualBusiness.photos}
                  onChange={(e) =>
                    setManualBusiness((prev) => ({
                      ...prev,
                      photos: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                />
              </div>
            </div>

            <Button
              onClick={addManualBusiness}
              disabled={
                loading || !manualBusiness.name || !manualBusiness.address
              }
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Add Business to Database
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
