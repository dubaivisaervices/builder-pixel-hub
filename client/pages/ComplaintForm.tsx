import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Shield,
  AlertTriangle,
  Upload,
  FileText,
  CheckCircle,
  X,
  Search,
  ArrowRight,
  Building2,
  Users,
  TrendingDown,
  Clock,
  MessageCircleQuestion,
  Building,
  Star,
  Zap,
  Target,
  Eye,
  Heart,
  Award,
  Flag,
  Phone,
  Mail,
  Globe,
  MapPin,
  ChevronRight,
  Sparkles,
  Rocket,
  Fingerprint,
  Lock,
  UserCheck,
} from "lucide-react";
import Footer from "../components/Footer";
import GovernmentSection from "../components/GovernmentSection";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
}

interface ReportFormData {
  issueType: string;
  employeeName?: string;
  description: string;
  amountLost?: string;
  dateOfIncident: string;
  evidenceDescription: string;
  paymentReceipt?: File;
  agreementCopy?: File;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
}

export default function ComplaintForm() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<BusinessData[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<BusinessData | null>(
    null,
  );
  const [reportData, setReportData] = useState<ReportFormData>({
    issueType: "",
    description: "",
    dateOfIncident: "",
    evidenceDescription: "",
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState({
    receipt: false,
    agreement: false,
  });
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showAddCompanyPopup, setShowAddCompanyPopup] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    category: "",
    description: "",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  const fileInputRefs = {
    paymentReceipt: useRef<HTMLInputElement>(null),
    agreementCopy: useRef<HTMLInputElement>(null),
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (location.state?.company) {
      const company = location.state.company;
      setSelectedCompany(company);
      setSearchTerm(company.name);
    }
  }, [location.state]);

  useEffect(() => {
    const calculateProgress = () => {
      const fields = [
        selectedCompany,
        reportData.issueType,
        reportData.description,
        reportData.dateOfIncident,
        reportData.reporterName,
        reportData.reporterEmail,
      ];
      const filledFields = fields.filter(
        (field) => field && field !== "",
      ).length;
      const progress = (filledFields / fields.length) * 100;
      setFormProgress(progress);

      // Update completed steps
      const newCompletedSteps = [];
      if (selectedCompany) newCompletedSteps.push(1);
      if (
        reportData.issueType &&
        reportData.description &&
        reportData.dateOfIncident
      )
        newCompletedSteps.push(2);
      if (reportData.paymentReceipt || reportData.agreementCopy)
        newCompletedSteps.push(3);
      if (reportData.reporterName && reportData.reporterEmail)
        newCompletedSteps.push(4);

      setCompletedSteps(newCompletedSteps);
      setCurrentStep(Math.max(1, newCompletedSteps.length));
    };

    calculateProgress();
  }, [selectedCompany, reportData]);

  useEffect(() => {
    setIsTyping(true);
  }, [reportData.description, reportData.evidenceDescription]);

  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  }, [reportData.description, reportData.evidenceDescription]);

  const fetchBusinesses = async () => {
    try {
      console.log("🔄 Fetching businesses for complaint form...");
      const response = await fetch("/api/dubai-visa-services?limit=1000");
      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ Successfully loaded",
          data.businesses?.length || 0,
          "businesses",
        );
        setBusinesses(data.businesses || []);
      } else {
        console.error("❌ Failed to fetch businesses:", response.status);
        // Fallback with comprehensive sample data
        const fallbackBusinesses = [
          {
            id: "sample1",
            name: "Dubai Visa Solutions",
            address: "Business Bay, Dubai, UAE",
            rating: 4.8,
            reviewCount: 156,
            category: "Visa Services",
          },
          {
            id: "sample2",
            name: "Emirates Document Clearing",
            address: "DIFC, Dubai, UAE",
            rating: 4.6,
            reviewCount: 89,
            category: "Document Clearing",
          },
          {
            id: "sample3",
            name: "Gulf Immigration Services",
            address: "Downtown Dubai, UAE",
            rating: 4.7,
            reviewCount: 203,
            category: "Immigration Services",
          },
          {
            id: "sample4",
            name: "Al Rostamani Business Setup",
            address: "Sheikh Zayed Road, Dubai, UAE",
            rating: 4.5,
            reviewCount: 124,
            category: "Business Setup",
          },
          {
            id: "sample5",
            name: "Professional PRO Services",
            address: "Jumeirah Lakes Towers, Dubai, UAE",
            rating: 4.9,
            reviewCount: 87,
            category: "PRO Services",
          },
        ];

        console.log(
          "🔧 Using fallback data with",
          fallbackBusinesses.length,
          "businesses",
        );
        setBusinesses(fallbackBusinesses);
      }
    } catch (error) {
      console.error("❌ Network error fetching businesses:", error);
      // Same fallback as above
      const fallbackBusinesses = [
        {
          id: "sample1",
          name: "Dubai Visa Solutions",
          address: "Business Bay, Dubai, UAE",
          rating: 4.8,
          reviewCount: 156,
          category: "Visa Services",
        },
        {
          id: "sample2",
          name: "Emirates Document Clearing",
          address: "DIFC, Dubai, UAE",
          rating: 4.6,
          reviewCount: 89,
          category: "Document Clearing",
        },
        {
          id: "sample3",
          name: "Gulf Immigration Services",
          address: "Downtown Dubai, UAE",
          rating: 4.7,
          reviewCount: 203,
          category: "Immigration Services",
        },
      ];

      console.log(
        "🔧 Using error fallback data with",
        fallbackBusinesses.length,
        "businesses",
      );
      setBusinesses(fallbackBusinesses);
    }
  };

  const handleAddCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/companies/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompanyData),
      });

      if (response.ok) {
        alert(
          "Company request submitted successfully! Our admin team will review it.",
        );
        setShowAddCompanyPopup(false);
        setNewCompanyData({
          name: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          category: "",
          description: "",
        });
      } else {
        throw new Error("Failed to submit company request");
      }
    } catch (error) {
      console.error("Error submitting company request:", error);
      alert("There was an error submitting your request. Please try again.");
    }
  };

  const handleCompanySearch = (value: string) => {
    setSearchTerm(value);
    setIsTyping(true);

    if (value.length >= 1) {
      const filtered = businesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category.toLowerCase().includes(value.toLowerCase()),
        )
        .sort((a, b) => {
          // Prioritize exact matches at the beginning
          const aStartsWith = a.name
            .toLowerCase()
            .startsWith(value.toLowerCase());
          const bStartsWith = b.name
            .toLowerCase()
            .startsWith(value.toLowerCase());

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          // Then sort by rating
          return b.rating - a.rating;
        });

      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchFocus = () => {
    if (!searchTerm) {
      setSearchSuggestions(businesses.slice(0, 50));
      setShowSuggestions(true);
    }
  };

  const handleCompanySelect = (business: BusinessData) => {
    setSelectedCompany(business);
    setSearchTerm(business.name);
    setShowSuggestions(false);
    setReportData((prev) => ({
      ...prev,
      companyId: business.id,
    }));
  };

  const handleFileUpload = (
    field: "paymentReceipt" | "agreementCopy",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only JPEG, PNG images or PDF files.");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("File size must be less than 5MB.");
        return;
      }

      setReportData((prev) => ({
        ...prev,
        [field]: file,
      }));

      setShowFilePreview((prev) => ({
        ...prev,
        [field === "paymentReceipt" ? "receipt" : "agreement"]: true,
      }));

      setTimeout(() => {
        setShowFilePreview((prev) => ({
          ...prev,
          [field === "paymentReceipt" ? "receipt" : "agreement"]: false,
        }));
      }, 2000);
    }
  };

  const triggerFileUpload = (field: "paymentReceipt" | "agreementCopy") => {
    fileInputRefs[field].current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) {
      alert("Please select a company to report.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(reportData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value) {
          formData.append(key, value.toString());
        }
      });

      formData.append("companyName", selectedCompany.name);
      formData.append("companyAddress", selectedCompany.address);

      const response = await fetch("/api/reports/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("There was an error submitting your report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <Card className="max-w-lg w-full shadow-2xl border-0 bg-white/80 backdrop-blur-xl relative overflow-hidden">
          {/* Success Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>

          <CardContent className="p-8 sm:p-12 text-center relative">
            {/* Animated Success Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto animate-ping opacity-20"></div>

              {/* Floating Success Elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-4 -left-4 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Report Submitted Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Thank you for helping protect the Dubai business community. Your
              report has been received and will be reviewed by our expert team.
            </p>

            {/* Success Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24h</div>
                <div className="text-xs text-green-700">Review Time</div>
              </div>
              <div className="text-center border-x border-green-200">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-xs text-green-700">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2.8k+</div>
                <div className="text-xs text-green-700">Reports Filed</div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate("/dubai-businesses")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Back to Directory
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-all duration-300"
              >
                <Flag className="h-5 w-5 mr-2" />
                Submit Another Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6); }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .glow-animation {
          animation: glow 2s ease-in-out infinite;
        }

        .slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }

        .fade-in-scale {
          animation: fadeInScale 0.5s ease-out;
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .file-upload-area {
          border: 2px dashed #e5e7eb;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .file-upload-area::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .file-upload-area:hover::before {
          left: 100%;
        }

        .file-upload-area:hover {
          border-color: #3b82f6;
          background-color: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .file-upload-area.uploaded {
          border-color: #10b981;
          background-color: #f0fdf4;
          animation: glow 2s ease-in-out;
        }

        .progress-bar {
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          border-radius: 9999px;
          height: 8px;
          transition: width 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .progress-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .step-indicator {
          transition: all 0.3s ease;
        }

        .step-indicator.active {
          animation: glow 1s ease-in-out;
        }

        .search-pulse {
          position: relative;
        }

        .search-pulse::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateY(-50%) scale(1.2); }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <div className="text-center">
              {/* Main Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                Report Business Issues
              </h1>

              <p className="text-base text-blue-100 max-w-xl mx-auto mb-4">
                Help protect Dubai's business community.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-16 relative">
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
            {/* Company Selection - Redesigned */}
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                  <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                  Select Company to Report
                  {completedSteps.includes(1) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 relative">
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Search by company name, location, or category..."
                      value={searchTerm}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                      onFocus={handleSearchFocus}
                      className={`w-full h-14 sm:h-16 pl-14 pr-6 text-base sm:text-lg border-2 rounded-2xl focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl ${
                        isTyping
                          ? "border-blue-400 ring-2 ring-blue-200 bg-blue-50/50 search-pulse"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      required
                    />
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                      <Search
                        className={`h-6 w-6 transition-colors duration-300 ${isTyping ? "text-blue-500" : "text-gray-400"}`}
                      />
                    </div>
                    {isTyping && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {showSuggestions && (
                    <div className="absolute z-20 w-full mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto fade-in-scale">
                      {searchSuggestions.length > 0 ? (
                        <>
                          {/* Header */}
                          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 p-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-blue-800 flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              {searchTerm
                                ? `${searchSuggestions.length} companies found`
                                : `Browse ${searchSuggestions.length} companies`}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSuggestions(false)}
                              className="text-gray-500 hover:text-gray-700 p-1 h-8 w-8 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Company List */}
                          <div className="p-2">
                            {searchSuggestions.map((business, index) => (
                              <div
                                key={business.id}
                                className="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer rounded-xl m-1 flex items-center space-x-4 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02]"
                                onClick={() => handleCompanySelect(business)}
                              >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                                  {business.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate text-base">
                                    {business.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 truncate flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                    {business.address}
                                  </p>
                                  <div className="flex items-center space-x-3 mt-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-blue-100 text-blue-700"
                                    >
                                      {business.category}
                                    </Badge>
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                      <span className="text-xs text-gray-600 font-medium">
                                        {business.rating}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        ({business.reviewCount})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        searchTerm.length >= 2 && (
                          <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Building className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              Company not found? 🤔
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                              Can't find the company you're looking for? Help us
                              expand our directory and make it better for
                              everyone.
                            </p>

                            <Button
                              onClick={() => {
                                setNewCompanyData((prev) => ({
                                  ...prev,
                                  name: searchTerm,
                                }));
                                setShowAddCompanyPopup(true);
                              }}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              <Building2 className="h-5 w-5 mr-2" />
                              Add New Company ✨
                            </Button>
                            <p className="text-xs text-gray-500 mt-3">
                              New companies are reviewed and added by our admin
                              team
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {selectedCompany && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl fade-in-scale">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {selectedCompany.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {selectedCompany.address}
                          </span>
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {selectedCompany.category}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 font-medium">
                              {selectedCompany.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Details - Enhanced */}
            <Card className="glass-card shadow-2xl border-0 overflow-hidden fade-in-scale">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
              <CardHeader className="pb-4 sm:pb-6 relative">
                <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Report Details
                    </span>
                    {completedSteps.includes(2) && (
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-600 text-sm font-medium">
                          Details Completed
                        </span>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6 relative">
                {/* Issue Type */}
                <div className="space-y-3">
                  <Label
                    htmlFor="issueType"
                    className="text-base font-semibold text-gray-700 flex items-center"
                  >
                    <Flag className="h-5 w-5 mr-2 text-orange-500" />
                    Type of Issue *
                  </Label>
                  <Select
                    value={reportData.issueType}
                    onValueChange={(value) =>
                      setReportData((prev) => ({ ...prev, issueType: value }))
                    }
                    required
                  >
                    <SelectTrigger className="h-14 text-base border-2 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                      <SelectValue placeholder="🏷️ Select the type of issue you experienced" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 shadow-xl">
                      <SelectItem value="fraud" className="p-4 hover:bg-red-50">
                        <span className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-3 text-red-500" />
                          Fraud / Scam
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="poor_service"
                        className="p-4 hover:bg-orange-50"
                      >
                        <span className="flex items-center">
                          <TrendingDown className="h-4 w-4 mr-3 text-orange-500" />
                          Poor Service Quality
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="overcharging"
                        className="p-4 hover:bg-yellow-50"
                      >
                        <span className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-3 text-yellow-500" />
                          Overcharging / Hidden Fees
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="unprofessional"
                        className="p-4 hover:bg-purple-50"
                      >
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-3 text-purple-500" />
                          Unprofessional Behavior
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="delayed_service"
                        className="p-4 hover:bg-blue-50"
                      >
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-3 text-blue-500" />
                          Delayed Service
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="license_issues"
                        className="p-4 hover:bg-gray-50"
                      >
                        <span className="flex items-center">
                          <Shield className="h-4 w-4 mr-3 text-gray-500" />
                          License / Legal Issues
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="refund_issues"
                        className="p-4 hover:bg-green-50"
                      >
                        <span className="flex items-center">
                          <ArrowRight className="h-4 w-4 mr-3 text-green-500" />
                          Refund Problems
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="false_advertising"
                        className="p-4 hover:bg-pink-50"
                      >
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-3 text-pink-500" />
                          False Advertising
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="data_misuse"
                        className="p-4 hover:bg-indigo-50"
                      >
                        <span className="flex items-center">
                          <Fingerprint className="h-4 w-4 mr-3 text-indigo-500" />
                          Data Misuse
                        </span>
                      </SelectItem>
                      <SelectItem
                        value="other"
                        className="p-4 hover:bg-gray-50"
                      >
                        <span className="flex items-center">
                          <MessageCircleQuestion className="h-4 w-4 mr-3 text-gray-500" />
                          Other
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reportData.issueType && (
                  <div className="space-y-3 fade-in-scale">
                    <Label
                      htmlFor="employeeName"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <UserCheck className="h-5 w-5 mr-2 text-blue-500" />
                      Employee/Contact Person Involved (Optional)
                    </Label>
                    <Input
                      id="employeeName"
                      type="text"
                      placeholder="👤 Name of the employee or contact person"
                      value={reportData.employeeName || ""}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          employeeName: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                  <Label
                    htmlFor="description"
                    className="text-base font-semibold text-gray-700 flex items-center"
                  >
                    <FileText className="h-5 w-5 mr-2 text-purple-500" />
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="📝 Please provide detailed information about the issue. Include dates, amounts, specific incidents, and any relevant context that will help us understand what happened..."
                    value={reportData.description}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-[150px] text-base border-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    required
                  />
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {reportData.description.length} characters
                    </span>
                  </div>
                </div>

                {/* Amount and Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="amountLost"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <Building className="h-5 w-5 mr-2 text-green-500" />
                      Amount Lost (AED)
                    </Label>
                    <Input
                      id="amountLost"
                      type="number"
                      placeholder="💰 0"
                      value={reportData.amountLost || ""}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          amountLost: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="dateOfIncident"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                      Date of Incident *
                    </Label>
                    <Input
                      id="dateOfIncident"
                      type="date"
                      value={reportData.dateOfIncident}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          dateOfIncident: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Evidence Description */}
                <div className="space-y-3">
                  <Label
                    htmlFor="evidenceDescription"
                    className="text-base font-semibold text-gray-700 flex items-center"
                  >
                    <Eye className="h-5 w-5 mr-2 text-orange-500" />
                    Evidence & Additional Details (Optional)
                  </Label>
                  <Textarea
                    id="evidenceDescription"
                    placeholder="🔍 Describe any evidence you have (documents, screenshots, emails, recordings, etc.) and share your detailed experience with this company..."
                    value={reportData.evidenceDescription}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        evidenceDescription: e.target.value,
                      }))
                    }
                    className="min-h-[100px] text-base border-2 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section - Enhanced */}
            <Card className="glass-card shadow-2xl border-0 overflow-hidden fade-in-scale">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <CardHeader className="pb-4 sm:pb-6 relative">
                <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Supporting Documents
                    </span>
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      Upload evidence to strengthen your report
                    </p>
                    {completedSteps.includes(3) && (
                      <div className="flex items-center mt-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-600 text-sm font-medium">
                          Documents Uploaded
                        </span>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Payment Receipt */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-700 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      Payment Receipt/Invoice
                    </Label>
                    <div
                      className={`file-upload-area p-8 rounded-2xl cursor-pointer text-center transition-all duration-300 ${
                        reportData.paymentReceipt ? "uploaded" : ""
                      } ${showFilePreview.receipt ? "animate-pulse" : ""}`}
                      onClick={() => triggerFileUpload("paymentReceipt")}
                      onMouseEnter={() => setShowTooltip("receipt")}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      {reportData.paymentReceipt ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                              <FileText className="h-8 w-8 text-white" />
                            </div>
                            {showFilePreview.receipt && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {reportData.paymentReceipt.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Size:{" "}
                              {(
                                reportData.paymentReceipt.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                          {showTooltip === "receipt" && (
                            <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -mt-12 left-1/2 transform -translate-x-1/2">
                              Click to replace file
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                              Upload Payment Receipt
                            </p>
                            <p className="text-sm text-gray-500">
                              JPEG, PNG, PDF (Max 5MB)
                            </p>
                          </div>
                          {showTooltip === "receipt" && (
                            <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -mt-12 left-1/2 transform -translate-x-1/2">
                              Evidence of payment made
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRefs.paymentReceipt}
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleFileUpload("paymentReceipt", e)}
                      className="hidden"
                    />
                  </div>

                  {/* Agreement Copy */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-700 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-purple-500" />
                      Agreement/Contract Copy
                    </Label>
                    <div
                      className={`file-upload-area p-8 rounded-2xl cursor-pointer text-center transition-all duration-300 ${
                        reportData.agreementCopy ? "uploaded" : ""
                      } ${showFilePreview.agreement ? "animate-pulse" : ""}`}
                      onClick={() => triggerFileUpload("agreementCopy")}
                      onMouseEnter={() => setShowTooltip("agreement")}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      {reportData.agreementCopy ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                              <FileText className="h-8 w-8 text-white" />
                            </div>
                            {showFilePreview.agreement && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {reportData.agreementCopy.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Size:{" "}
                              {(
                                reportData.agreementCopy.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                          {showTooltip === "agreement" && (
                            <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -mt-12 left-1/2 transform -translate-x-1/2">
                              Click to replace file
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                              Upload Agreement/Contract
                            </p>
                            <p className="text-sm text-gray-500">
                              JPEG, PNG, PDF (Max 5MB)
                            </p>
                          </div>
                          {showTooltip === "agreement" && (
                            <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -mt-12 left-1/2 transform -translate-x-1/2">
                              Contract or agreement documents
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRefs.agreementCopy}
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleFileUpload("agreementCopy", e)}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl">
                  <div className="flex items-center justify-center mb-2">
                    <Lock className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-semibold text-yellow-800">
                      Security Notice
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    <span className="font-semibold">Max 5MB per file.</span>{" "}
                    Supported formats: JPEG, PNG, PDF. All uploads are encrypted
                    and securely stored.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reporter Information - Enhanced */}
            <Card className="glass-card shadow-2xl border-0 overflow-hidden fade-in-scale">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5"></div>
              <CardHeader className="pb-4 sm:pb-6 relative">
                <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-gray-900">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <MessageCircleQuestion className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      Your Information
                    </span>
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      Your details are kept strictly confidential
                    </p>
                    {completedSteps.includes(4) && (
                      <div className="flex items-center mt-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-600 text-sm font-medium">
                          Information Completed
                        </span>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6 relative">
                {/* Confidential Notice */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 text-lg mb-2">
                        🔒 Confidentiality Guarantee
                      </h4>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        Your personal information is protected with bank-level
                        encryption and will be used only for investigation
                        purposes. We strictly follow UAE data protection
                        regulations and international privacy standards.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="reporterName"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <UserCheck className="h-5 w-5 mr-2 text-green-500" />
                      Full Name *
                    </Label>
                    <Input
                      id="reporterName"
                      type="text"
                      placeholder="👤 Enter your full name"
                      value={reportData.reporterName}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          reporterName: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="reporterEmail"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <Mail className="h-5 w-5 mr-2 text-blue-500" />
                      Email Address *
                    </Label>
                    <Input
                      id="reporterEmail"
                      type="email"
                      placeholder="📧 Enter your email address"
                      value={reportData.reporterEmail}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          reporterEmail: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="reporterPhone"
                    className="text-base font-semibold text-gray-700 flex items-center"
                  >
                    <Phone className="h-5 w-5 mr-2 text-purple-500" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="reporterPhone"
                    type="tel"
                    placeholder="📱 Enter your phone number (e.g., +971 50 123 4567)"
                    value={reportData.reporterPhone}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        reporterPhone: e.target.value,
                      }))
                    }
                    className="h-14 text-base border-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !selectedCompany}
                    className={`w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white px-8 sm:px-12 py-4 text-lg sm:text-xl font-bold rounded-2xl min-w-[280px] shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl relative overflow-hidden ${
                      loading ? "animate-pulse" : ""
                    } ${!selectedCompany ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {/* Button background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting Report...</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Shield className="h-6 w-6" />
                          <span>Submit Report</span>
                          <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                          <Sparkles className="h-5 w-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="text-center pt-4">
                  <Button
                    type="button"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-8 py-3 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                    Back to Top
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Community Impact Stats */}
          <div className="mt-16 sm:mt-24 mb-12 sm:mb-16 fade-in-scale">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Community Protection Impact
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Together we're building the safest business environment in the
                Middle East 🌟
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4">
              <div className="glass-card p-6 sm:p-8 text-center rounded-3xl hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
                  2,847
                </h3>
                <p className="text-base sm:text-lg text-gray-300 font-medium">
                  Reports Submitted
                </p>
                <p className="text-sm text-gray-400 mt-2">This month: +127</p>
              </div>

              <div className="glass-card p-6 sm:p-8 text-center rounded-3xl hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                  <TrendingDown className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
                  73%
                </h3>
                <p className="text-base sm:text-lg text-gray-300 font-medium">
                  Reduction in Scams
                </p>
                <p className="text-sm text-gray-400 mt-2">Since last year</p>
              </div>

              <div className="glass-card p-6 sm:p-8 text-center rounded-3xl hover:scale-105 transition-all duration-300">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
                  24/7
                </h3>
                <p className="text-base sm:text-lg text-gray-300 font-medium">
                  Community Support
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Always here for you
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Government Section */}
      <GovernmentSection />

      {/* Footer */}
      <Footer />

      {/* Sticky Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-xl z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round(formProgress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${formProgress}%` }}
            ></div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-3">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center ${completedSteps.includes(step) ? "text-green-600" : currentStep === step ? "text-blue-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mb-1 ${
                    completedSteps.includes(step)
                      ? "bg-green-500 border-green-400 text-white"
                      : currentStep === step
                        ? "bg-blue-100 border-blue-600"
                        : "border-gray-300"
                  }`}
                >
                  {completedSteps.includes(step) ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    step
                  )}
                </div>
                <span className="text-xs font-medium">
                  {step === 1
                    ? "Company"
                    : step === 2
                      ? "Details"
                      : step === 3
                        ? "Evidence"
                        : "Contact"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom padding for sticky progress bar */}
      <div className="h-24"></div>

      {/* Add Company Popup - Enhanced */}
      {showAddCompanyPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 fade-in-scale">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>

            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 sm:p-8 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2240%22%20height=%2240%22%20viewBox=%220%200%2040%2040%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.1%22%3E%3Cpath%20d=%22M20%2020c0%2011.046-8.954%2020-20%2020v20h40V20H20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

              <div className="flex items-center justify-between relative">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">
                      Add New Company
                    </h2>
                    <p className="text-green-100 text-base mt-1">
                      Help expand our business directory 🚀
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCompanyPopup(false)}
                  className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-140px)] relative">
              <form onSubmit={handleAddCompanySubmit} className="space-y-6">
                {/* Company Name */}
                <div className="space-y-3">
                  <Label
                    htmlFor="companyName"
                    className="text-base font-semibold text-gray-700 flex items-center"
                  >
                    <Building2 className="h-5 w-5 mr-2 text-green-500" />
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="🏢 Enter the full company name"
                    value={newCompanyData.name}
                    onChange={(e) =>
                      setNewCompanyData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="h-14 text-base border-2 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <Label
                    htmlFor="companyAddress"
                    className="text-base font-semibold text-gray-700 flex items-center"
                  >
                    <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                    Address *
                  </Label>
                  <Textarea
                    id="companyAddress"
                    placeholder="📍 Enter the complete business address including area, city, and country"
                    value={newCompanyData.address}
                    onChange={(e) =>
                      setNewCompanyData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="min-h-[100px] text-base border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    required
                  />
                </div>

                {/* Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="companyPhone"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <Phone className="h-5 w-5 mr-2 text-purple-500" />
                      Phone Number
                    </Label>
                    <Input
                      id="companyPhone"
                      type="tel"
                      placeholder="📱 +971 XX XXX XXXX"
                      value={newCompanyData.phone}
                      onChange={(e) =>
                        setNewCompanyData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="companyEmail"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <Mail className="h-5 w-5 mr-2 text-orange-500" />
                      Email Address
                    </Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="📧 company@example.com"
                      value={newCompanyData.email}
                      onChange={(e) =>
                        setNewCompanyData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Website and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="companyWebsite"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <Globe className="h-5 w-5 mr-2 text-indigo-500" />
                      Website
                    </Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      placeholder="🌐 https://example.com"
                      value={newCompanyData.website}
                      onChange={(e) =>
                        setNewCompanyData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      className="h-14 text-base border-2 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="companyCategory"
                      className="text-base font-semibold text-gray-700 flex items-center"
                    >
                      <Building className="h-5 w-5 mr-2 text-pink-500" />
                      Category *
                    </Label>
                    <select
                      id="companyCategory"
                      value={newCompanyData.category}
                      onChange={(e) =>
                        setNewCompanyData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full h-14 text-base border-2 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                      required
                    >
                      <option value="">🏷️ Select a category</option>
                      <option value="Visa Services">Visa Services</option>
                      <option value="Document Clearing">
                        Document Clearing
                      </option>
                      <option value="Business Setup">Business Setup</option>
                      <option value="PRO Services">PRO Services</option>
                      <option value="Immigration Consultancy">
                        Immigration Consultancy
                      </option>
                      <option value="Legal Services">Legal Services</option>
                      <option value="Business Consultancy">
                        Business Consultancy
                      </option>
                      <option value="Trade License Services">
                        Trade License Services
                      </option>
                      <option value="Corporate Services">
                        Corporate Services
                      </option>
                      <option value="Government Relations">
                        Government Relations
                      </option>
                      <option value="Permit Services">Permit Services</option>
                      <option value="Attestation Services">
                        Attestation Services
                      </option>
                      <option value="Translation Services">
                        Translation Services
                      </option>
                      <option value="Typing Services">Typing Services</option>
                      <option value="Business Services">
                        Business Services
                      </option>
                      <option value="Administrative Services">
                        Administrative Services
                      </option>
                      <option value="Professional Services">
                        Professional Services
                      </option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label
                    htmlFor="companyDescription"
                    className="text-base font-semibold text-gray-700 flex items-center"
                  >
                    <FileText className="h-5 w-5 mr-2 text-teal-500" />
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="companyDescription"
                    placeholder="📝 Brief description of services offered, specializations, or any additional information..."
                    value={newCompanyData.description}
                    onChange={(e) =>
                      setNewCompanyData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-[100px] text-base border-2 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                  />
                </div>

                {/* Info Notice */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 text-lg mb-2">
                        Review Process
                      </h4>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        All company submissions undergo thorough verification by
                        our admin team to ensure accuracy, legitimacy, and
                        compliance with UAE business regulations before being
                        added to the directory.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCompanyPopup(false)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    Submit Request ✨
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
