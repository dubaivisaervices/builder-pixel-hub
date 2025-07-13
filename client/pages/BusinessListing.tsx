import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getBestLogoUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Eye,
  AlertTriangle,
  Building2,
  Shield,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  logoUrl?: string;
}

export default function BusinessListing() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessData[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Category mapping for filtering businesses - using broader terms to get more results
  const categoryMap: { [key: string]: string[] } = {
    "work-visa": ["work", "employment", "job", "labor", "visa", "permit"],
    "tourist-visa": [
      "tourist",
      "visit",
      "tourism",
      "vacation",
      "travel",
      "visitor",
    ],
    "student-visa": [
      "student",
      "education",
      "study",
      "university",
      "college",
      "academic",
    ],
    "family-visa": [
      "family",
      "spouse",
      "dependent",
      "relative",
      "reunion",
      "marriage",
    ],
    "business-visa": [
      "business",
      "investor",
      "trade",
      "commercial",
      "entrepreneur",
      "company",
    ],
    "residence-visa": [
      "residence",
      "permanent",
      "settlement",
      "residency",
      "long-term",
      "expatriate",
    ],
  };

  // Category titles for display
  const categoryTitles: { [key: string]: string } = {
    "work-visa": "Work Visa Services",
    "tourist-visa": "Tourist Visa Services",
    "student-visa": "Student Visa Services",
    "family-visa": "Family Visa Services",
    "business-visa": "Business Visa Services",
    "residence-visa": "Residence Visa Services",
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/businesses");
        const data = await response.json();

        setBusinesses(data.businesses || []);

        // Filter by category if specified
        if (category && categoryMap[category]) {
          const searchTerms = categoryMap[category];
          const filtered = data.businesses.filter((business: BusinessData) => {
            const categoryLower = business.category.toLowerCase();
            const nameLower = business.name.toLowerCase();
            const addressLower = business.address.toLowerCase();

            // Check if any of the search terms match in category, name, or address
            return searchTerms.some(
              (term) =>
                categoryLower.includes(term.toLowerCase()) ||
                nameLower.includes(term.toLowerCase()) ||
                addressLower.includes(term.toLowerCase()) ||
                (categoryLower.includes("visa") &&
                  categoryLower.includes(term.toLowerCase())),
            );
          });
          setFilteredBusinesses(filtered);
          console.log(
            `🔍 Filtered ${filtered.length} businesses for category: ${category} using terms: ${searchTerms.join(", ")}`,
          );
        } else {
          setFilteredBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
        setFilteredBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [category]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = businesses.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredBusinesses(filtered);
    } else {
      if (category && categoryMap[category]) {
        const searchTerms = categoryMap[category];
        const filtered = businesses.filter((business) => {
          const categoryLower = business.category.toLowerCase();
          const nameLower = business.name.toLowerCase();
          const addressLower = business.address.toLowerCase();

          // Check if any of the search terms match in category, name, or address
          return searchTerms.some(
            (term) =>
              categoryLower.includes(term.toLowerCase()) ||
              nameLower.includes(term.toLowerCase()) ||
              addressLower.includes(term.toLowerCase()) ||
              (categoryLower.includes("visa") &&
                categoryLower.includes(term.toLowerCase())),
          );
        });
        setFilteredBusinesses(filtered);
      } else {
        setFilteredBusinesses(businesses);
      }
    }
  }, [searchTerm, businesses, category]);

  const navigateToDetails = (business: BusinessData) => {
    try {
      const locationSlug =
        business.address
          .split(",")[0]
          ?.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-") || "dubai";
      const nameSlug = business.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

      navigate(`/modern-profile/${locationSlug}/${nameSlug}`, {
        state: { businessData: business },
      });
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const getCategoryTitle = () => {
    if (!category) return "All Services";
    return categoryTitles[category] || "Services";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 hover:bg-blue-50"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getCategoryTitle()}
              </h1>
              <p className="text-gray-600">
                {filteredBusinesses.length} services found
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-xl mb-8">
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-4 pr-12 text-base bg-white border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                />
                <Search className="absolute right-4 top-3 h-6 w-6 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Grid */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredBusinesses.map((business) => (
              <Card
                key={business.id}
                className="group shadow-xl border-0 bg-white/70 backdrop-blur-xl hover:bg-white/90 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigateToDetails(business)}
              >
                <CardContent className="p-6">
                  {/* Business Header */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {business.logoUrl ? (
                        <img
                          src={business.logoUrl}
                          alt={`${business.name} logo`}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        business.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {business.address}
                      </p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {business.category
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {business.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{business.phone}</span>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{business.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetails(business);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="border-2 border-red-300 text-red-600 hover:bg-red-50"
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
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report
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
      </div>

      {/* Footer with Government Logos */}
      <footer className="bg-gray-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Dubai Visa Services</span>
              </div>
              <p className="text-gray-400">
                Dubai's trusted platform for finding verified visa services and
                protecting against immigration scams.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/services/work-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Work Visa Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services/tourist-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Tourist Visa Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services/student-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Student Visa Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services/business-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Business Visa Services
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/complaint")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Report Scam
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/help-center")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/dubai-businesses")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Business Directory
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    All Services
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+971 4 XXX XXXX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@dubaivisaservices.ae</span>
                </div>
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
  );
}
