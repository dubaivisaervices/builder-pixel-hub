import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  MapPin,
  Phone,
  Globe,
  Mail,
  FileText,
  Users,
  Search,
  Building2,
  Shield,
  ExternalLink,
  Star,
} from "lucide-react";

interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
}

export default function FraudImmigrationConsultantsStatic() {
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [displayedBusinesses, setDisplayedBusinesses] = useState<Business[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 25;

  const navigate = useNavigate();

  // Static sample data for immigration consultants
  const staticBusinesses: Business[] = [
    {
      id: "static-1",
      name: "Dubai Immigration Services LLC",
      address: "Business Bay, Dubai, UAE",
      category: "immigration consultants",
      phone: "+971 4 XXX XXXX",
      website: "https://example.com",
      email: "info@dubaiimmigration.ae",
      rating: 4.2,
      reviewCount: 85,
      description:
        "Professional immigration services in Dubai specializing in visa processing, residency permits, and immigration consulting for individuals and businesses.",
    },
    {
      id: "static-2",
      name: "Visa Solutions UAE",
      address: "Deira, Dubai, UAE",
      category: "visa agent",
      phone: "+971 4 XXX XXXX",
      rating: 3.8,
      reviewCount: 124,
      description:
        "Registered visa agent providing comprehensive visa services including tourist visas, business visas, and residence permits for UAE.",
    },
    {
      id: "static-3",
      name: "Emirates Migration Services",
      address: "Abu Dhabi, UAE",
      category: "migration services",
      phone: "+971 2 XXX XXXX",
      rating: 4.0,
      reviewCount: 67,
      description:
        "Migration services specialist offering assistance with UAE golden visa, investor visa, and family reunification programs.",
    },
    {
      id: "static-4",
      name: "Golden Visa Consultants",
      address: "Sharjah, UAE",
      category: "visa consultants",
      phone: "+971 6 XXX XXXX",
      rating: 3.5,
      reviewCount: 43,
      description:
        "Visa consulting services for UAE golden visa program, student visas, and work permit applications.",
    },
    {
      id: "static-5",
      name: "Professional Immigration Hub",
      address: "Ajman, UAE",
      category: "immigration services",
      phone: "+971 7 XXX XXXX",
      rating: 4.1,
      reviewCount: 92,
      description:
        "Full-service immigration consultancy providing legal advice and assistance for UAE visa applications and residency permits.",
    },
    {
      id: "static-6",
      name: "UAE Work Visa Center",
      address: "Al Ain, UAE",
      category: "work visa",
      phone: "+971 3 XXX XXXX",
      rating: 3.9,
      reviewCount: 156,
      description:
        "Specialized in work visa applications, employment visa processing, and labor card services for UAE.",
    },
    {
      id: "static-7",
      name: "Overseas Consultants Dubai",
      address: "DIFC, Dubai, UAE",
      category: "overseas consultants",
      phone: "+971 4 XXX XXXX",
      rating: 4.3,
      reviewCount: 78,
      description:
        "Overseas education and immigration consultants specializing in student visas and skilled migration programs.",
    },
    {
      id: "static-8",
      name: "Student Visa Experts",
      address: "Academic City, Dubai, UAE",
      category: "student visa",
      phone: "+971 4 XXX XXXX",
      rating: 4.0,
      reviewCount: 203,
      description:
        "Education visa specialists helping students obtain study permits and student visas for UAE universities.",
    },
  ];

  // Mock report counts for demonstration
  const mockReports: Record<string, number> = {
    "static-1": 3,
    "static-2": 7,
    "static-3": 1,
    "static-4": 12,
    "static-5": 2,
    "static-6": 5,
    "static-7": 0,
    "static-8": 4,
  };

  useEffect(() => {
    // Initialize with static data
    setFilteredBusinesses(staticBusinesses);
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    updateDisplayedBusinesses();
  }, [filteredBusinesses, currentPage]);

  const filterBusinesses = () => {
    let filtered = staticBusinesses;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (business) =>
          business.name.toLowerCase().includes(searchLower) ||
          business.address.toLowerCase().includes(searchLower) ||
          business.category.toLowerCase().includes(searchLower),
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
    setCurrentPage(1); // Reset to first page when filtering
  };

  const updateDisplayedBusinesses = () => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const businessesToShow = filteredBusinesses.slice(startIndex, endIndex);
    setDisplayedBusinesses(businessesToShow);
  };

  const loadMoreBusinesses = async () => {
    setLoadingMore(true);
    setCurrentPage((prev) => prev + 1);
    setLoadingMore(false);
  };

  const handleWriteReport = (business: Business) => {
    navigate(
      `/complaint?company=${encodeURIComponent(business.name)}&id=${business.id}`,
    );
  };

  const getUniqueCategories = () => {
    const categories = staticBusinesses.map((b) => b.category).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Fraud Immigration Consultants in UAE
            </h1>
            <p className="text-xl text-red-100 mb-4">
              Community-Reported Visa & Immigration Service Providers
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{staticBusinesses.length} Consultants Listed</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {Object.values(mockReports).reduce((a, b) => a + b, 0)}{" "}
                  Community Reports
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Warning Alert */}
        <Alert className="mb-8 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Important:</strong> This list contains immigration
            consultants and visa service providers. Always verify credentials
            and check multiple sources before engaging any immigration services.
          </AlertDescription>
        </Alert>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Consultants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search by name or location
                </label>
                <Input
                  type="text"
                  placeholder="Search consultants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Filter by category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <strong>{displayedBusinesses.length}</strong> of{" "}
            <strong>{filteredBusinesses.length}</strong> immigration consultants
            {searchTerm && ` matching "${searchTerm}"`}
            {filteredBusinesses.length !== staticBusinesses.length && (
              <span> (filtered from {staticBusinesses.length} total)</span>
            )}
          </p>
        </div>

        {/* Business Listings */}
        <div className="space-y-6">
          {displayedBusinesses.map((business) => (
            <Card
              key={business.id}
              className="hover:shadow-lg transition-shadow border-l-4 border-l-red-400"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Business Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <h3 className="text-xl font-semibold text-blue-600">
                            {business.name}
                          </h3>
                          <ExternalLink className="h-4 w-4 text-gray-400" />

                          {/* Rating */}
                          {business.rating && (
                            <div className="flex items-center gap-1 ml-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">
                                {business.rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({business.reviewCount} reviews)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Business Description */}
                        {business.description && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-l-blue-400">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              <strong>About:</strong> {business.description}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                            <span>{business.address}</span>
                          </div>

                          {business.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{business.phone}</span>
                            </div>
                          )}

                          {business.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a
                                href={business.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {business.website}
                              </a>
                            </div>
                          )}

                          {business.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{business.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {business.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions and Report Count */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {mockReports[business.id] || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Community Reports
                      </div>
                    </div>

                    <Button
                      onClick={() => handleWriteReport(business)}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                      size="sm"
                    >
                      <FileText className="h-4 w-4" />
                      Write a Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {displayedBusinesses.length < filteredBusinesses.length && (
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <Button
                onClick={loadMoreBusinesses}
                disabled={loadingMore}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More (
                    {filteredBusinesses.length - displayedBusinesses.length}{" "}
                    remaining)
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Showing {displayedBusinesses.length} of{" "}
                {filteredBusinesses.length} consultants
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {filteredBusinesses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No consultants found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No immigration consultants match "${searchTerm}"`
                  : "No immigration consultants found with the selected filters"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 mb-2">
                Sample Immigration Consultants Directory
              </h3>
              <p className="text-blue-700 text-sm">
                This page displays sample immigration consultants for
                demonstration. Always verify credentials and check multiple
                sources before engaging any immigration services. Report
                negative experiences to help others make informed decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
