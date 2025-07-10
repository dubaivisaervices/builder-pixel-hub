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

  const fileInputRefs = {
    paymentReceipt: useRef<HTMLInputElement>(null),
    agreementCopy: useRef<HTMLInputElement>(null),
  };

  const navigate = useNavigate();
  const location = useLocation();

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
        // Fallback with comprehensive sample data (same as BusinessDirectory)
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
          {
            id: "sample6",
            name: "Express Typing Center",
            address: "Deira, Dubai, UAE",
            rating: 4.3,
            reviewCount: 156,
            category: "Typing Services",
          },
          {
            id: "sample7",
            name: "Quick Legal Consultancy",
            address: "Bur Dubai, UAE",
            rating: 4.4,
            reviewCount: 67,
            category: "Legal Services",
          },
          {
            id: "sample8",
            name: "Smart Business Consultancy",
            address: "Dubai Marina, UAE",
            rating: 4.6,
            reviewCount: 198,
            category: "Business Services",
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
        "🔧 Using error fallback data with",
        fallbackBusinesses.length,
        "businesses",
      );
      setBusinesses(fallbackBusinesses);
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

  const showAllBusinesses = () => {
    setSearchSuggestions(businesses);
    setShowSuggestions(true);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-xl border-0 bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Report Submitted Successfully
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for helping protect the Dubai business community. Your
              report has been received and will be reviewed by our team.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/dubai-businesses")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Back to Directory
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
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
      <style>{`
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

        .slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }

        .file-upload-area {
          border: 2px dashed #e5e7eb;
          transition: all 0.3s ease;
        }

        .file-upload-area:hover {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }

        .file-upload-area.uploaded {
          border-color: #10b981;
          background-color: #f0fdf4;
        }

        .progress-bar {
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 9999px;
          height: 8px;
          transition: width 0.5s ease;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            <div className="text-center slide-in-up">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Report Business Issues
              </h1>
              <p className="text-base sm:text-lg text-red-100 max-w-2xl mx-auto">
                Help protect the Dubai business community by reporting scams,
                fraud, or unethical practices
              </p>

              {/* Progress Bar */}
              <div className="mt-6 sm:mt-8 max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(formProgress)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="progress-bar"
                    style={{ width: `${formProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Company Selection */}
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2 sm:mr-3" />
                  Select Company to Report
                  {completedSteps.includes(1) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by company name, location, or category..."
                      value={searchTerm}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                      onFocus={handleSearchFocus}
                      className={`h-11 sm:h-12 pl-10 pr-4 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all duration-300 shadow-sm hover:border-gray-400 w-full ${isTyping ? "border-blue-400 ring-1 ring-blue-200" : ""}`}
                      required
                    />
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${isTyping ? "text-blue-500" : "text-gray-400"}`}
                    />
                  </div>

                  {showSuggestions && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                      {searchSuggestions.length > 0 ? (
                        <>
                          {/* Header with results count and controls */}
                          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                              {searchTerm
                                ? `${searchSuggestions.length} results found`
                                : `All ${searchSuggestions.length} companies loaded - Scroll to browse`}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSuggestions(false)}
                              className="text-gray-500 hover:text-gray-700 px-2 py-1"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Business List */}
                          {searchSuggestions.map((business, index) => (
                            <div
                              key={business.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-3 transition-colors duration-200 hover:shadow-sm"
                              onClick={() => handleCompanySelect(business)}
                            >
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {business.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                                  .substring(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate text-sm">
                                  {business.name}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                  {business.address}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {business.category}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs text-gray-600">
                                      {business.rating}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      ★
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        searchTerm.length >= 2 && (
                          <div className="p-6 text-center">
                            <Building className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Company not found?
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Can't find the company you're looking for? Help us
                              expand our directory.
                            </p>

                            {/* Add New Company Button */}
                            <div className="space-y-3">
                              <Button
                                onClick={() => navigate("/help-center")}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium text-sm py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                <Building2 className="h-4 w-4 mr-2" />
                                Add New Company
                              </Button>
                              <p className="text-xs text-gray-500">
                                New companies are reviewed and added by our
                                admin team
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {selectedCompany && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {selectedCompany.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {selectedCompany.address}
                          </span>
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {selectedCompany.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2 sm:mr-3" />
                  Report Details
                  {completedSteps.includes(2) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                <div>
                  <Label
                    htmlFor="issueType"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Type of Issue *
                  </Label>
                  <div className="space-y-2">
                    <Select
                      value={reportData.issueType}
                      onValueChange={(value) =>
                        setReportData((prev) => ({ ...prev, issueType: value }))
                      }
                      required
                    >
                      <SelectTrigger className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <SelectValue placeholder="Select the type of issue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fraud">Fraud / Scam</SelectItem>
                        <SelectItem value="poor_service">
                          Poor Service Quality
                        </SelectItem>
                        <SelectItem value="overcharging">
                          Overcharging / Hidden Fees
                        </SelectItem>
                        <SelectItem value="unprofessional">
                          Unprofessional Behavior
                        </SelectItem>
                        <SelectItem value="delayed_service">
                          Delayed Service
                        </SelectItem>
                        <SelectItem value="license_issues">
                          License / Legal Issues
                        </SelectItem>
                        <SelectItem value="refund_issues">
                          Refund Problems
                        </SelectItem>
                        <SelectItem value="false_advertising">
                          False Advertising
                        </SelectItem>
                        <SelectItem value="data_misuse">Data Misuse</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {reportData.issueType && (
                  <div>
                    <Label
                      htmlFor="employeeName"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Employee/Contact Person Involved (Optional)
                    </Label>
                    <Input
                      id="employeeName"
                      type="text"
                      placeholder="Name of the employee involved"
                      value={reportData.employeeName || ""}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          employeeName: e.target.value,
                        }))
                      }
                      className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Detailed Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about the issue. Include dates, amounts, and specific incidents..."
                    value={reportData.description}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-[120px] text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="amountLost"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Amount Lost (AED) (Optional)
                    </Label>
                    <Input
                      id="amountLost"
                      type="number"
                      placeholder="0"
                      value={reportData.amountLost || ""}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          amountLost: e.target.value,
                        }))
                      }
                      className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="dateOfIncident"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
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
                      className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="evidenceDescription"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Evidence & Additional Details (Optional)
                  </Label>
                  <Textarea
                    id="evidenceDescription"
                    placeholder="Describe any evidence you have (documents, screenshots, emails, recordings, etc.) and share your detailed experience with this company..."
                    value={reportData.evidenceDescription}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        evidenceDescription: e.target.value,
                      }))
                    }
                    className="min-h-[80px] text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2 sm:mr-3" />
                  Supporting Documents (Optional)
                  {completedSteps.includes(3) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Payment Receipt/Invoice
                    </Label>
                    <div
                      className={`file-upload-area p-6 rounded-lg cursor-pointer text-center ${reportData.paymentReceipt ? "uploaded" : ""} ${showFilePreview.receipt ? "animate-pulse" : ""}`}
                      onClick={() => triggerFileUpload("paymentReceipt")}
                      onMouseEnter={() => setShowTooltip("receipt")}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      {reportData.paymentReceipt ? (
                        <div className="space-y-2">
                          <div className="relative inline-block">
                            <FileText className="h-12 w-12 text-green-600 mx-auto" />
                            {showFilePreview.receipt && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                            )}
                          </div>
                          <p className="font-medium text-sm">
                            {reportData.paymentReceipt.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size:{" "}
                            {(
                              reportData.paymentReceipt.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                          {showTooltip === "receipt" && (
                            <div className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded shadow-lg -mt-8">
                              Click to replace file
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium text-gray-600">
                            Upload Payment Receipt
                          </p>
                          <p className="text-xs text-gray-500">
                            JPEG, PNG, PDF (Max 5MB)
                          </p>
                          {showTooltip === "receipt" && (
                            <div className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded shadow-lg -mt-8">
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

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Agreement/Contract Copy
                    </Label>
                    <div
                      className={`file-upload-area p-6 rounded-lg cursor-pointer text-center ${reportData.agreementCopy ? "uploaded" : ""} ${showFilePreview.agreement ? "animate-pulse" : ""}`}
                      onClick={() => triggerFileUpload("agreementCopy")}
                      onMouseEnter={() => setShowTooltip("agreement")}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      {reportData.agreementCopy ? (
                        <div className="space-y-2">
                          <div className="relative inline-block">
                            <FileText className="h-12 w-12 text-green-600 mx-auto" />
                            {showFilePreview.agreement && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                            )}
                          </div>
                          <p className="font-medium text-sm">
                            {reportData.agreementCopy.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size:{" "}
                            {(
                              reportData.agreementCopy.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                          {showTooltip === "agreement" && (
                            <div className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded shadow-lg -mt-8">
                              Click to replace file
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium text-gray-600">
                            Upload Agreement/Contract
                          </p>
                          <p className="text-xs text-gray-500">
                            JPEG, PNG, PDF (Max 5MB)
                          </p>
                          {showTooltip === "agreement" && (
                            <div className="absolute z-10 px-2 py-1 text-xs text-white bg-black rounded shadow-lg -mt-8">
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

                <div className="text-center text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <span className="font-semibold text-red-700">
                    {" "}
                    Max 5MB per file.
                  </span>{" "}
                  Supported formats: JPEG, PNG, PDF
                </div>
              </CardContent>
            </Card>

            {/* Reporter Information */}
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                  <MessageCircleQuestion className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2 sm:mr-3" />
                  Your Information
                  {completedSteps.includes(4) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                {/* Confidential Notice - Moved to Top */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm">
                        Confidentiality Notice
                      </h4>
                      <p className="text-blue-800 text-xs mt-1">
                        Your personal information will be kept strictly
                        confidential and used only for investigation purposes.
                        We follow UAE data protection regulations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="reporterName"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="reporterName"
                      type="text"
                      placeholder="Enter your full name"
                      value={reportData.reporterName}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          reporterName: e.target.value,
                        }))
                      }
                      className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="reporterEmail"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="reporterEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={reportData.reporterEmail}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          reporterEmail: e.target.value,
                        }))
                      }
                      className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="reporterPhone"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="reporterPhone"
                    type="tel"
                    placeholder="Enter your phone number (e.g., +971 50 123 4567)"
                    value={reportData.reporterPhone}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        reporterPhone: e.target.value,
                      }))
                    }
                    className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-3 sm:pt-4 md:pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !selectedCompany}
                    className={`w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg rounded-lg min-w-[180px] sm:min-w-[200px] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${loading ? "animate-pulse" : ""} ${!selectedCompany ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Submitting...</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                          <div
                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Submit Report</span>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Another Scam Button */}
            <div className="text-center mt-6 pt-4">
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                variant="outline"
                className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 px-6 py-2.5 text-base rounded-lg"
              >
                <Shield className="h-4 w-4 mr-2" />
                Report Another Scam
              </Button>
            </div>
          </form>

          {/* Community Stats Section */}
          <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8 px-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Community Protection Impact
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Together we're building a safer business environment in Dubai
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4">
              <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  2,840+
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Reports Submitted
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  67%
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Reduction in Scams
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  24/7
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Community Support
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
    </>
  );
}
