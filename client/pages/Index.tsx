import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "../hooks/useSEO";
import { createBusinessProfileUrl } from "@/lib/urlUtils";
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
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    address: "",
    city: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<BusinessData[]>(
    [],
  );
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalReviews: 0,
    avgRating: 0,
    locations: 0,
    scamReports: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔄 Fetching business data for homepage...");

        // Priority 1: Try database first for real current data
        let businesses, stats, featured;

        try {
          console.log("🔍 Trying database for latest business count...");
          const [dbBusinessesRes, dbStatsRes] = await Promise.all([
            fetch(
              `/.netlify/functions/database-businesses?all=true&t=${Date.now()}`,
            ),
            fetch(`/.netlify/functions/database-stats?t=${Date.now()}`),
          ]);

          if (dbBusinessesRes.ok && dbStatsRes.ok) {
            const dbBusinesses = await dbBusinessesRes.json();
            const dbStats = await dbStatsRes.json();

            if (dbBusinesses.businesses && dbBusinesses.businesses.length > 0) {
              businesses = dbBusinesses.businesses;
              stats = {
                totalBusinesses: businesses.length,
                totalReviews: dbStats.totalReviews || 0,
                avgRating: dbStats.avgRating || 4.5,
                locations: 15,
                scamReports: 145,
              };
              featured = businesses.filter((b) => b.rating >= 4.5).slice(0, 20);
              console.log(
                `✅ Loaded REAL ${businesses.length} businesses from DATABASE`,
              );
            }
          }
        } catch (error) {
          console.log("❌ Database failed, trying JSON files...");
        }

        // Priority 2: Try complete JSON file if database failed
        if (!businesses) {
          try {
            console.log("🔍 Trying complete businesses file...");
            const completeRes = await fetch("/api/complete-businesses.json");
            if (completeRes.ok) {
              const completeData = await completeRes.json();
              if (
                completeData.businesses &&
                completeData.businesses.length > 0
              ) {
                businesses = completeData.businesses;
                stats = completeData.stats || {
                  totalBusinesses: businesses.length,
                  totalReviews: 0,
                  avgRating: 4.5,
                  locations: 15,
                  scamReports: 145,
                };
                featured = businesses
                  .filter((b) => b.rating >= 4.5)
                  .slice(0, 20);
                console.log(
                  `📄 Loaded ${businesses.length} businesses from complete JSON`,
                );
              }
            }
          } catch (error) {
            console.log(
              "❌ Failed to load complete data, trying individual files",
            );
          }
        }

        // Fallback to individual files if complete data failed
        if (!businesses) {
          console.log("🔍 Fetching from individual static JSON files...");
          const [businessesRes, statsRes, featuredRes] = await Promise.all([
            fetch("/api/dubai-visa-services.json"),
            fetch("/api/stats.json"),
            fetch("/api/featured.json"),
          ]);

          businesses = await businessesRes.json();
          stats = await statsRes.json();
          featured = await featuredRes.json();
          console.log(
            `✅ Loaded ${businesses.length} businesses from individual files`,
          );
        }

        setAllBusinesses(businesses);
        setFeaturedBusinesses(featured.slice(0, 6));
        setStats(stats);

        // Process categories for the homepage display
        const categoryCount: { [key: string]: number } = {};
        if (businesses.length > 0) {
          businesses.forEach((business) => {
            if (!business) return;
            const category = business.category?.toLowerCase() || "other";

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
              category.includes("university")
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
              categoryCount["residence"] =
                (categoryCount["residence"] || 0) + 1;
            } else {
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

          const topCategoriesData = sortedCategories.map(
            ([category, count]) => ({
              category,
              count,
              ...categoryDetails[category],
            }),
          );

          setTopCategories(topCategoriesData);
        }

        console.log("✅ Homepage data loaded successfully");
      } catch (error) {
        console.error("❌ Error fetching homepage data:", error);

        // Ultimate fallback: create sample data
        const sampleBusinesses: BusinessData[] = [
          {
            id: "sample-1",
            name: "Dubai Visa Services Pro",
            rating: 4.5,
            reviewCount: 150,
            address: "Business Bay, Dubai, UAE",
            category: "visa services",
          },
          {
            id: "sample-2",
            name: "Emirates Immigration Consultants",
            rating: 4.3,
            reviewCount: 89,
            address: "DIFC, Dubai, UAE",
            category: "immigration services",
          },
          {
            id: "sample-3",
            name: "Al Barsha Document Clearing",
            rating: 4.1,
            reviewCount: 67,
            address: "Al Barsha, Dubai, UAE",
            category: "document clearing",
          },
        ];

        setAllBusinesses(sampleBusinesses);
        setFeaturedBusinesses(sampleBusinesses);

        setStats({
          totalBusinesses: 841,
          totalReviews: 306627,
          avgRating: 4.5,
          locations: 15,
          scamReports: 145,
        });

        console.log("📊 Using sample data as ultimate fallback");
      } finally {
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.length >= 3 && Array.isArray(allBusinesses)) {
      const filtered = allBusinesses.filter(
        (business) =>
          business &&
          (business.name?.toLowerCase().includes(value.toLowerCase()) ||
            business.category?.toLowerCase().includes(value.toLowerCase()) ||
            business.address?.toLowerCase().includes(value.toLowerCase())),
      );
      setSearchSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/dubai-businesses?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate("/dubai-businesses");
    }
  };

  const handleSuggestionClick = (business: BusinessData) => {
    setShowSuggestions(false);
    navigate(`/company/${business.id}`);
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
                  <Shield className="h-4 w-4 mr-2" />
                  🛡️ UAE's Most Trusted Scam Protection Platform
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  UAE's Trusted Platform
                </span>
                <br />
                <span className="text-gray-900">For Visa Safety</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                🛡️ Expose scammers, protect your money, and save others from
                fraud. Access verified company reviews, report suspicious
                activities, and join thousands protecting the UAE immigration
                community.
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
                    onClick={() => navigate("/complaint")}
                    size="lg"
                    className="absolute right-2 top-2 h-12 px-8 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Report
                  </Button>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search or report scams..."
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
                      onClick={() => navigate("/complaint")}
                      size="lg"
                      className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg text-white font-semibold"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Check Company Safety
                    </Button>
                    <Button
                      onClick={handleSearch}
                      size="lg"
                      variant="outline"
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-lg px-8 py-3 rounded-xl font-semibold"
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      Browse Verified Companies
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
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">
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

            {/* Quick Stats Section */}
            <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl">
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">
                  {stats.scamReports || 145}+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Scams Reported
                </div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                  {stats.totalBusinesses || 841}+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Companies Listed
                </div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                  5k+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Protected Users
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fraud Alert Section */}
      <section
        className={`py-16 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 transition-all duration-1000 delay-300 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              ⚠️ Protect Yourself from Fraud Immigration Consultants
            </h2>
            <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto">
              Our community has identified immigration consultants and visa
              service providers with questionable practices. View the list to
              stay informed and protect yourself.
            </p>
            <Button
              onClick={() => navigate("/fraud-immigration-consultants")}
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-3"
            >
              <Shield className="h-5 w-5 mr-2" />
              View Fraud Consultants List
            </Button>
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
                Recently Reported Companies
              </h2>
              <p className="text-xl text-gray-600">
                These companies have recent scam reports - be cautious and check
                reviews
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredBusinesses.map((business, index) => (
                <Card
                  key={business.id}
                  className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white"
                  onClick={() => navigate(createBusinessProfileUrl(business))}
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

                    <Badge className="mb-4" variant="secondary">
                      {business.category
                        ?.split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </Badge>

                    <Button
                      className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/complaint");
                      }}
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

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <section
          className={`py-20 transition-all duration-1000 delay-700 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Popular Visa Categories
              </h2>
              <p className="text-xl text-gray-600">
                Browse services by visa type to find trusted providers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topCategories.map((category, index) => (
                <Card
                  key={category.category}
                  className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white border-0"
                  onClick={() =>
                    navigate(
                      `/dubai-businesses?category=${encodeURIComponent(category.category)}`,
                    )
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}
                      >
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.count} providers
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                      <span className="text-sm font-medium">View Services</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Protection Section */}
      <CommunityProtection stats={stats} />

      {/* Government Section */}
      <GovernmentSection />

      {/* Footer */}
      <Footer />

      {/* Sticky Report Scam Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:left-auto md:right-6 md:transform-none z-50">
        <Button
          onClick={() => navigate("/complaint")}
          className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-2xl px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300"
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Report Scam</span>
        </Button>
      </div>
    </div>
  );
}
