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

  // ... (other functions would go here)

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
                  Stop Visa Fraudsters
                </span>
                <br />
                <span className="text-gray-900">Before They Strike</span>
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
                      size="lg"
                      variant="outline"
                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-lg px-8 py-3 rounded-xl font-semibold"
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      Browse Verified Companies
                    </Button>
                  </div>
                </div>
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
                  850+
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
