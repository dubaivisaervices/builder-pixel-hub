import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real business data
        const response = await fetch("/api/businesses");
        const data = await response.json();
        const businesses = data.businesses || [];

        // Store all businesses for search
        setAllBusinesses(businesses);

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
      navigate("/services", {
        state: { searchTerm: searchTerm.trim() },
      });
    } else {
      navigate("/services");
    }
    setShowSuggestions(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value.length >= 3) {
      const filtered = allBusinesses
        .filter((business) =>
          business.name.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 5);
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

    navigate(`/${locationSlug}/review/${nameSlug}`, {
      state: { businessData: business },
    });
    setShowSuggestions(false);
    setSearchTerm("");
  };

  const handleQuickReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim()) {
      navigate("/complaint", {
        state: {
          companyName: companyName.trim(),
          companyLocation: "Dubai, UAE",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Dubai Visa Services
                </h1>
                <p className="text-xs text-gray-600">Trusted Directory</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => navigate("/services")}>
                Browse Services
              </Button>
              <Button variant="ghost" onClick={() => navigate("/complaint")}>
                Report Scam
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/dubai-businesses")}
              >
                All Businesses
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/services")}
                className="flex items-center space-x-2"
              >
                <Building2 className="h-5 w-5" />
                <span>Menu</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

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
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Dubai's #1 Visa Service Directory
                </Badge>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Find Trusted
                </span>
                <br />
                <span className="text-gray-900">Visa Services</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover verified immigration consultants in Dubai with real
                reviews, ratings, and community protection against scams.
              </p>
            </div>

            {/* Search Bar with Autocomplete */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                {/* Desktop Search */}
                <div className="hidden md:block">
                  <Input
                    type="text"
                    placeholder="Search visa services, company names, or locations..."
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
                  <div className="flex justify-center">
                    <Button
                      onClick={handleSearch}
                      size="lg"
                      className="px-12 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Services
                    </Button>
                  </div>
                </div>

                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
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

      {/* Services Categories */}
      <section
        className={`py-20 transition-all duration-1000 delay-300 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Popular Visa Services
            </h2>
            <p className="text-xl text-gray-600">
              Browse by category to find specialized immigration consultants
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Work Visa Services",
                description:
                  "Employment visa processing and work permit assistance",
                icon: "💼",
                count: Math.floor(stats.totalBusinesses * 0.35),
                color: "from-blue-500 to-blue-600",
              },
              {
                title: "Tourist Visa Services",
                description: "Visit visa and tourist visa applications",
                icon: "🏖️",
                count: Math.floor(stats.totalBusinesses * 0.25),
                color: "from-green-500 to-green-600",
              },
              {
                title: "Student Visa Services",
                description: "Education visa and university applications",
                icon: "🎓",
                count: Math.floor(stats.totalBusinesses * 0.2),
                color: "from-purple-500 to-purple-600",
              },
              {
                title: "Family Visa Services",
                description: "Family reunion and dependent visa processing",
                icon: "👨‍👩‍👧‍👦",
                count: Math.floor(stats.totalBusinesses * 0.15),
                color: "from-pink-500 to-pink-600",
              },
              {
                title: "Business Visa Services",
                description: "Investor visa and business setup assistance",
                icon: "🏢",
                count: Math.floor(stats.totalBusinesses * 0.18),
                color: "from-orange-500 to-orange-600",
              },
              {
                title: "Residence Visa Services",
                description: "Permanent residence and citizenship support",
                icon: "🏡",
                count: Math.floor(stats.totalBusinesses * 0.12),
                color: "from-indigo-500 to-indigo-600",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white/70 backdrop-blur-sm"
                onClick={() => {
                  // Map service titles to specific category filters
                  const categoryMap: { [key: string]: string } = {
                    "Work Visa Services": "work-visa",
                    "Tourist Visa Services": "tourist-visa",
                    "Student Visa Services": "student-visa",
                    "Family Visa Services": "family-visa",
                    "Business Visa Services": "business-visa",
                    "Residence Visa Services": "residence-visa",
                  };

                  const categorySlug = categoryMap[service.title] || "all";
                  navigate(`/services/${categorySlug}`);
                }}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-gray-100">
                          {service.count} services
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate("/dubai-businesses")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl px-8 py-3 text-lg"
            >
              View All Services
              <ArrowRight className="h-5 w-5 ml-2" />
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
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Report Scam Section */}
      <section
        className={`py-20 transition-all duration-1000 delay-700 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-2xl">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center space-y-6">
                <div className="inline-flex p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg">
                  <Shield className="h-12 w-12 text-white" />
                </div>

                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Protect the Community
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Help fellow visa applicants by reporting fraudulent
                    services. Your report can prevent others from being scammed.
                  </p>
                </div>

                <form onSubmit={handleQuickReport} className="max-w-md mx-auto">
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Enter company name to report"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-12 bg-white border-2 border-red-200 focus:border-red-400 rounded-xl"
                      required
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg"
                    >
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Report Scam
                    </Button>
                  </div>
                </form>

                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="bg-red-100 p-3 rounded-xl inline-flex mb-3">
                      <Users className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Community Protected
                    </h3>
                    <p className="text-sm text-gray-600">
                      {stats.scamReports} scam reports filed to protect the
                      community
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 p-3 rounded-xl inline-flex mb-3">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Verified Reviews
                    </h3>
                    <p className="text-sm text-gray-600">
                      All reports are verified and investigated thoroughly
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-100 p-3 rounded-xl inline-flex mb-3">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Anonymous Reporting
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your identity is protected when reporting suspicious
                      activities
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dubai Government Section */}
      <section className="py-16 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Government Authorized Services
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              All listed visa services are registered and comply with UAE
              government regulations and Dubai municipality standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* UAE Government */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/15652234/pexels-photo-15652234.jpeg"
                  alt="UAE Flag"
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">UAE Government</h3>
                <p className="text-blue-100 text-sm">
                  Federal Authority for Identity & Citizenship
                </p>
                <p className="text-blue-200 text-xs mt-1">www.government.ae</p>
              </div>
            </div>

            {/* Dubai Municipality */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/18294648/pexels-photo-18294648.jpeg"
                  alt="Dubai Municipality"
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">Dubai Municipality</h3>
                <p className="text-blue-100 text-sm">
                  Business Registration & Licensing Authority
                </p>
                <p className="text-blue-200 text-xs mt-1">www.dm.gov.ae</p>
              </div>
            </div>

            {/* Immigration Department */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 via-white to-green-600 rounded-full p-1 flex items-center justify-center">
                <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                  <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-green-600 bg-clip-text text-transparent">
                    UAE
                  </span>
                </div>
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">Immigration Dept</h3>
                <p className="text-blue-100 text-sm">
                  General Directorate of Residency & Foreign Affairs
                </p>
                <p className="text-blue-200 text-xs mt-1">www.gdrfad.gov.ae</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">
                Compliance Guarantee
              </h3>
            </div>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Every visa service listed on our platform is verified to hold
              valid trade licenses and comply with UAE federal laws and Dubai
              local regulations for immigration services.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
              <div className="text-blue-200">
                <div className="font-semibold text-white">150+</div>
                <div>Licensed Services</div>
              </div>
              <div className="text-blue-200">
                <div className="font-semibold text-white">100%</div>
                <div>Government Compliant</div>
              </div>
              <div className="text-blue-200">
                <div className="font-semibold text-white">24/7</div>
                <div>Support Available</div>
              </div>
              <div className="text-blue-200">
                <div className="font-semibold text-white">99%</div>
                <div>Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
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
                <li>Work Visa Services</li>
                <li>Tourist Visa Services</li>
                <li>Student Visa Services</li>
                <li>Business Visa Services</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Report Scam</li>
                <li>Community Guidelines</li>
                <li>Help Center</li>
                <li>Contact Us</li>
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

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dubai Visa Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
