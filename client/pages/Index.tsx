import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CommunityProtection from "@/components/CommunityProtection";
import GovernmentSection from "@/components/GovernmentSection";
import Footer from "@/components/Footer";
import {
  AlertTriangle,
  Shield,
  Users,
  Building2,
  Star,
  Search,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Globe,
  Award,
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  Clock,
  Eye,
  BarChart3,
  Target,
  Sparkles,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  category: string;
}

export default function Index() {
  const [companyName, setCompanyName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<BusinessData[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<BusinessData[]>([]);
  const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);
  const [companyNotFound, setCompanyNotFound] = useState(false);
  const [protectCommunitySuggestions, setProtectCommunitySuggestions] =
    useState<BusinessData[]>([]);
  const [showProtectSuggestions, setShowProtectSuggestions] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    address: "",
    city: "",
    description: "",
  });
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalReviews: 0,
    avgRating: 0,
    locations: 0,
    scamReports: 0,
  });
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessData[]>(
    [],
  );
  const [topCategories, setTopCategories] = useState<
    Array<{
      category: string;
      count: number;
      title: string;
      description: string;
      icon: string;
      color: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch business data (static first, then API)
        let businesses = [];

        // Try static data first (for production)
        try {
          console.log("🔍 Loading business data from static file...");
          const response = await fetch("/data/businesses.json");
          if (response.ok) {
            const data = await response.json();
            businesses = data.businesses || [];
            console.log(
              `✅ Loaded ${businesses.length} businesses from static data`,
            );
          }
        } catch (error) {
          console.log("📡 Static data not found, trying API...");
        }

        // Fallback to API if static data not available
        if (businesses.length === 0) {
          try {
            const response = await fetch("/api/dubai-visa-services?limit=1000");
            const data = await response.json();
            businesses = data.businesses || [];
            console.log(`✅ Loaded ${businesses.length} businesses from API`);
          } catch (error) {
            console.log("❌ API also failed, using fallback data");
          }
        }

        console.log(
          `🔍 Final loaded: ${businesses.length} total businesses for search`,
        );

        // Store all businesses for search
        setAllBusinesses(businesses);
        console.log(
          `🎯 Search now enabled for ALL ${businesses.length} businesses in database!`,
        );

        // Calculate real statistics
        const totalReviews = businesses.reduce(
          (sum: number, b: BusinessData) => sum + b.reviewCount,
          0,
        );
        const avgRating =
          businesses.length > 0
            ? businesses.reduce(
                (sum: number, b: BusinessData) => sum + b.rating,
                0,
              ) / businesses.length
            : 0;
        const uniqueLocations = [
          ...new Set(
            businesses.map((b: BusinessData) => b.address.split(",")[0]),
          ),
        ].length;

        setStats({
          totalBusinesses: businesses.length,
          totalReviews,
          avgRating: parseFloat(avgRating.toFixed(1)),
          locations: uniqueLocations,
          scamReports: Math.floor(businesses.length * 0.15),
        });

        // Get top rated businesses for featured section
        const topBusinesses = businesses
          .sort((a: BusinessData, b: BusinessData) => b.rating - a.rating)
          .slice(0, 3);
        setFeaturedBusinesses(topBusinesses);

        // Calculate category distribution and get top categories
        const categoryCount: { [key: string]: number } = {};
        businesses.forEach((business: BusinessData) => {
          const category = business.category.toLowerCase();
          // Group similar categories together
          if (
            category.includes("work") ||
            category.includes("employment") ||
            category.includes("job")
          ) {
            categoryCount["work"] = (categoryCount["work"] || 0) + 1;
          } else if (
            category.includes("tourist") ||
            category.includes("visit") ||
            category.includes("travel")
          ) {
            categoryCount["tourist"] = (categoryCount["tourist"] || 0) + 1;
          } else if (
            category.includes("student") ||
            category.includes("education") ||
            category.includes("study")
          ) {
            categoryCount["student"] = (categoryCount["student"] || 0) + 1;
          } else if (
            category.includes("family") ||
            category.includes("spouse") ||
            category.includes("dependent")
          ) {
            categoryCount["family"] = (categoryCount["family"] || 0) + 1;
          } else if (
            category.includes("business") ||
            category.includes("investor") ||
            category.includes("trade")
          ) {
            categoryCount["business"] = (categoryCount["business"] || 0) + 1;
          } else if (
            category.includes("residence") ||
            category.includes("permanent") ||
            category.includes("settlement")
          ) {
            categoryCount["residence"] = (categoryCount["residence"] || 0) + 1;
          } else {
            // Default grouping for other visa services
            categoryCount["other"] = (categoryCount["other"] || 0) + 1;
          }
        });

        // Sort categories by count and get top 6
        const sortedCategories = Object.entries(categoryCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6);

        // Map to display format
        const categoryDetails: {
          [key: string]: {
            title: string;
            description: string;
            icon: string;
            color: string;
          };
        } = {
          work: {
            title: "Work Visa Services",
            description:
              "Employment visa processing and work permit assistance",
            icon: "💼",
            color: "from-blue-500 to-blue-600",
          },
          tourist: {
            title: "Tourist Visa Services",
            description: "Visit visa and tourist visa applications",
            icon: "🏖️",
            color: "from-green-500 to-green-600",
          },
          student: {
            title: "Student Visa Services",
            description: "Education visa and university applications",
            icon: "🎓",
            color: "from-purple-500 to-purple-600",
          },
          family: {
            title: "Family Visa Services",
            description: "Family reunion and dependent visa processing",
            icon: "👨‍👩‍👧‍👦",
            color: "from-pink-500 to-pink-600",
          },
          business: {
            title: "Business Visa Services",
            description: "Investor visa and business setup assistance",
            icon: "🏢",
            color: "from-orange-500 to-orange-600",
          },
          residence: {
            title: "Residence Visa Services",
            description: "Permanent residence and citizenship support",
            icon: "🏡",
            color: "from-indigo-500 to-indigo-600",
          },
          other: {
            title: "Other Visa Services",
            description: "Additional visa services and consultation",
            icon: "📋",
            color: "from-gray-500 to-gray-600",
          },
        };

        const topCategoriesData = sortedCategories.map(([category, count]) => ({
          category,
          count,
          ...categoryDetails[category],
        }));

        setTopCategories(topCategoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to sample data
        setStats({
          totalBusinesses: 156,
          totalReviews: 4280,
          avgRating: 3.8,
          locations: 15,
          scamReports: 23,
        });
      } finally {
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate("/dubai-businesses", {
        state: { searchTerm: searchTerm.trim() },
      });
    } else {
      navigate("/dubai-businesses");
    }
    setShowSuggestions(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value.length >= 3) {
      const filtered = allBusinesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category.toLowerCase().includes(value.toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
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

    navigate(`/modern-profile/${locationSlug}/${nameSlug}`);
    setShowSuggestions(false);
    setSearchTerm("");
  };

  const handleProtectCommunitySearch = (value: string) => {
    setCompanyName(value);
    setCompanyNotFound(false);

    if (value.length >= 2) {
      const filtered = allBusinesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category.toLowerCase().includes(value.toLowerCase()),
        )
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
      setProtectCommunitySuggestions(filtered);
      setShowProtectSuggestions(true);
    } else {
      setShowProtectSuggestions(false);
    }
  };

  const handleProtectSuggestionClick = (business: BusinessData) => {
    setCompanyName(business.name);
    setShowProtectSuggestions(false);
    navigate("/complaint", {
      state: {
        companyName: business.name,
        companyLocation: business.address,
      },
    });
  };

  const handleQuickReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      // Check if company exists in database
      const foundCompany = allBusinesses.find((business) =>
        business.name.toLowerCase().includes(companyName.trim().toLowerCase()),
      );

      if (foundCompany) {
        // Company exists, proceed to report
        navigate("/complaint", {
          state: {
            companyName: foundCompany.name,
            companyLocation: foundCompany.address,
          },
        });
      } else {
        // Company not found, show add company option
        setCompanyNotFound(true);
        setNewCompanyData({
          name: companyName.trim(),
          address: "",
          city: "Dubai",
          description: "",
        });
      }
    }
  };

  const handleAddCompanyRequest = async () => {
    try {
      const response = await fetch("/api/admin/add-company-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompanyData),
      });

      if (response.ok) {
        alert("Company addition request submitted to admin successfully!");
        setShowAddCompanyPopup(false);
        setCompanyNotFound(false);
        setCompanyName("");
        setNewCompanyData({ name: "", address: "", city: "", description: "" });
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting company request:", error);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section
        className={`relative overflow-hidden transition-all duration-1000 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  UAE's #1 Visa Scam Reporting Platform
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Report Visa
                </span>
                <br />
                <span className="text-gray-900">Scams</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Protect yourself and others by reporting visa scams. Browse
                verified companies, read real reviews, and help build a safer
                immigration community in Dubai.
              </p>
            </div>

            {/* Search Bar with Autocomplete */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                {/* Desktop Search */}
                <div className="hidden md:block">
                  <Input
                    type="text"
                    placeholder="Search companies, report scams, or check reviews..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    onFocus={() =>
                      searchTerm.length >= 3 && setShowSuggestions(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    className="h-16 pl-6 pr-32 text-lg bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-blue-400 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                  />
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="absolute right-2 top-2 h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search visa services..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      onFocus={() =>
                        searchTerm.length >= 3 && setShowSuggestions(true)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                      className="h-14 px-4 text-base bg-white/90 backdrop-blur-sm border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-xl"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                      onClick={handleSearch}
                      size="lg"
                      className="px-12 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Services
                    </Button>
                    <Button
                      onClick={() => navigate("/dubai-businesses")}
                      size="lg"
                      variant="outline"
                      className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 shadow-lg px-8 py-3 rounded-xl font-semibold"
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      All Dubai Visa Services Directory
                    </Button>
                  </div>
                </div>

                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-100 bg-gray-50 text-sm text-gray-600 font-medium">
                      {searchSuggestions.length} businesses found
                    </div>
                    {searchSuggestions.map((business) => (
                      <div
                        key={business.id}
                        onClick={() => handleSuggestionClick(business)}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {business.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {business.name}
                            </h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {business.address.split(",")[0]}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">
                              {business.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                {
                  label: "Visa Services",
                  value: stats.totalBusinesses,
                  icon: Building2,
                  color: "blue",
                },
                {
                  label: "Reviews",
                  value: stats.totalReviews.toLocaleString(),
                  icon: MessageSquare,
                  color: "green",
                },
                {
                  label: "Locations",
                  value: stats.locations,
                  icon: MapPin,
                  color: "purple",
                },
                {
                  label: "Avg Rating",
                  value: `${stats.avgRating}★`,
                  icon: Star,
                  color: "yellow",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`inline-flex p-3 rounded-xl bg-${stat.color}-100 mb-3`}
                  >
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dubai Immigration Services - Redesigned with High Quality Image */}
      <section
        className={`py-12 sm:py-16 lg:py-20 transition-all duration-1000 delay-300 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Image Section with Dubai Skyline */}
          <div className="relative overflow-hidden rounded-3xl mb-8 sm:mb-12 lg:mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10"></div>

            {/* High Quality Dubai Image */}
            <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Dubai Skyline with Burj Khalifa"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />

              {/* Content Overlay */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center text-white px-4 sm:px-6 max-w-4xl">
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                    Dubai Immigration Services
                  </h2>
                  <p className="text-sm sm:text-lg lg:text-xl mb-6 sm:mb-8 text-gray-200 leading-relaxed">
                    Your gateway to Dubai's most trusted visa and immigration
                    specialists. Connect with verified consultants for seamless
                    UAE residency.
                  </p>

                  {/* CTA Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => navigate("/dubai-businesses")}
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      Explore Dubai Immigration Business
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Categories Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {topCategories.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                onClick={() => {
                  navigate("/dubai-businesses");
                }}
              >
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <div
                      className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0`}
                    >
                      {service.icon}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 text-xs sm:text-sm"
                        >
                          {service.count} services
                        </Badge>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats Section */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                500+
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Verified Partners
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                98%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Success Rate
              </div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                24/7
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Support</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                50k+
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Happy Clients
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredBusinesses.length > 0 && (
        <section
          className={`py-20 bg-gradient-to-br from-gray-50 to-blue-50 transition-all duration-1000 delay-500 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Top Rated Services
              </h2>
              <p className="text-xl text-gray-600">
                Discover Dubai's most trusted visa service providers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredBusinesses.map((business, index) => (
                <Card
                  key={business.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {business.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {business.address.split(",")[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
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
                        <span className="font-semibold text-gray-900">
                          {business.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({business.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <Badge variant="outline" className="mb-4">
                      {business.category
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </Badge>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      onClick={() => navigate("/dubai-businesses")}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Report Visa Scam
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Report Scam Section */}
      {/* Community Protection Section */}
      <CommunityProtection stats={stats} />

      {/* Government Section */}
      <GovernmentSection />

      {/* Footer */}
      <Footer />

      {/* Sticky Report Scam Button - Mobile: Bottom Center, Desktop: Bottom Right */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:left-auto md:right-6 md:transform-none z-50">
        <Button
          onClick={() => navigate("/complaint")}
          className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-2xl px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300"
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Report Scam</span>
        </Button>
      </div>

      {/* Add Company Popup Modal */}
      {showAddCompanyPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddCompanyPopup(false);
              setCompanyNotFound(false);
            }
          }}
        >
          <div
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                  Add New Company
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAddCompanyPopup(false);
                    setCompanyNotFound(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 touch-manipulation p-2"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>

              {/* Form */}
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    value={newCompanyData.name}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        name: e.target.value,
                      })
                    }
                    className="w-full h-11 md:h-10 text-base md:text-sm touch-manipulation"
                    placeholder="Enter complete company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <Input
                    type="text"
                    value={newCompanyData.address}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter complete address"
                    className="w-full h-11 md:h-10 text-base md:text-sm touch-manipulation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={newCompanyData.city}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        city: e.target.value,
                      })
                    }
                    className="w-full h-11 md:h-10 text-base md:text-sm touch-manipulation"
                    placeholder="e.g., Dubai, Abu Dhabi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newCompanyData.description}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description about the company services..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-sm touch-manipulation resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mt-4 md:mt-6">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAddCompanyPopup(false);
                    setCompanyNotFound(false);
                  }}
                  className="flex-1 h-11 md:h-10 text-base md:text-sm touch-manipulation"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddCompanyRequest();
                  }}
                  disabled={
                    !newCompanyData.name ||
                    !newCompanyData.address ||
                    !newCompanyData.city
                  }
                  className="flex-1 h-11 md:h-10 text-base md:text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white touch-manipulation"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Submit to Admin
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
