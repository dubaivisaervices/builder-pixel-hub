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

export default function BusinessDirectory() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchDubaiBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchTerm, selectedCategory]);

  const fetchDubaiBusinesses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dubai-visa-services");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BusinessSearchResponse = await response.json();
      setBusinesses(data.businesses);
      setCategories(data.categories);
      setError(null);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch businesses",
      );
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-xl border-0 m-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Unable to Load Businesses
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchDubaiBusinesses} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                        // Navigate to company reviews page
                        const locationSlug =
                          business.address
                            .split(",")[0]
                            ?.trim()
                            .toLowerCase()
                            .replace(/\s+/g, "-") || "dubai";
                        const nameSlug = business.name
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        navigate(`/reviews/${locationSlug}/${nameSlug}`);
                      }}
                    >
                      View Reviews
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
