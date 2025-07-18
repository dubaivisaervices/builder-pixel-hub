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
  MessageSquare,
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
  Send,
  Calendar,
  DollarSign,
  FileImage,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  category: string;
  phone?: string;
  website?: string;
  email?: string;
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

export default function ComplaintFormModern() {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Load businesses data
  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const companyName = urlParams.get("company");
    const companyId = urlParams.get("id");

    if (companyName) {
      setSearchTerm(companyName);
      if (companyId) {
        const business = businesses.find((b) => b.id === companyId);
        if (business) {
          setSelectedCompany(business);
        } else {
          setSelectedCompany({
            id: companyId,
            name: companyName,
            address: "Address not available",
            category: "Business",
          });
        }
      }
    }
  }, [location.search, businesses]);

  // Generate search suggestions after 2 characters
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const suggestions = businesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.category.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 6);

      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, businesses]);

  const fetchBusinesses = async () => {
    try {
      // Try multiple data sources
      const dataSources = [
        "/api/complete-businesses.json",
        "/data/businesses.json",
        "/api/dubai-visa-services.json",
      ];

      for (const source of dataSources) {
        try {
          const response = await fetch(source);
          if (response.ok) {
            const data = await response.json();
            const businessesArray = Array.isArray(data)
              ? data
              : data.businesses || [];

            if (businessesArray.length > 0) {
              setBusinesses(
                businessesArray.map((business) => ({
                  id: business.id,
                  name: business.name,
                  address: business.address,
                  category: business.category,
                  phone: business.phone,
                  website: business.website,
                  email: business.email,
                  rating: business.rating,
                  reviewCount: business.reviewCount,
                })),
              );
              break;
            }
          }
        } catch (error) {
          console.warn(`Failed to load from ${source}:`, error);
        }
      }
    } catch (error) {
      console.error("Error loading businesses:", error);
    }
  };

  const handleSuggestionClick = (business: BusinessData) => {
    setSelectedCompany(business);
    setSearchTerm(business.name);
    setShowSuggestions(false);
  };

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setLoading(false);
    }
  };

  const issueTypes = [
    { value: "fraud", label: "🚨 Fraud / Scam", color: "red" },
    {
      value: "poor_service",
      label: "😞 Poor Service Quality",
      color: "orange",
    },
    {
      value: "overcharging",
      label: "💰 Overcharging / Hidden Fees",
      color: "yellow",
    },
    {
      value: "unprofessional",
      label: "👔 Unprofessional Behavior",
      color: "blue",
    },
    {
      value: "false_promises",
      label: "🤥 False Promises / Misleading",
      color: "purple",
    },
    {
      value: "delayed_service",
      label: "⏰ Delayed Service / No Response",
      color: "gray",
    },
    { value: "other", label: "📝 Other Issues", color: "green" },
  ];

  const steps = [
    { id: 1, title: "Select Business", icon: Building2 },
    { id: 2, title: "Issue Details", icon: AlertTriangle },
    { id: 3, title: "Evidence", icon: FileText },
    { id: 4, title: "Your Information", icon: UserCheck },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Report Submitted Successfully!
            </h2>
            <p className="text-gray-600 text-lg">
              Thank you for helping protect the community. Your report has been
              received and will be reviewed by our team.
            </p>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-blue-800 font-medium">
                📧 A confirmation email has been sent to{" "}
                {reportData.reporterEmail}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/dubai-businesses")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Business Directory
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-2 border-gray-300 hover:bg-gray-50"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-white mx-auto" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Report Business Issues
              <span className="block text-yellow-300">
                Protect Your Community
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Help others by reporting fraud, poor service, or other issues with
              businesses. Your report contributes to community safety and
              awareness.
            </p>

            {/* Progress Indicator */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2 sm:space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        currentStep >= step.id
                          ? "bg-white text-blue-600 border-white"
                          : currentStep === step.id
                            ? "bg-yellow-400 text-gray-900 border-yellow-400"
                            : "bg-transparent text-white border-white/50"
                      }`}
                    >
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </div>
                    {step.id < steps.length && (
                      <div
                        className={`w-8 sm:w-12 h-0.5 mx-2 transition-all duration-300 ${
                          currentStep > step.id ? "bg-white" : "bg-white/30"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Select Business */}
          {currentStep === 1 && (
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Building2 className="h-6 w-6" />
                  Step 1: Select Business to Report
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Search Box with Suggestions */}
                <div className="relative">
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">
                    Search for the business you want to report
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                    <Input
                      type="text"
                      placeholder="Type business name (e.g., 'ABC Consulting', 'XYZ Services')..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() =>
                        searchTerm.length >= 2 && setShowSuggestions(true)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                      className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 w-full"
                      autoFocus
                    />

                    {/* Search Suggestions */}
                    {showSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                        {searchSuggestions.map((business) => (
                          <div
                            key={business.id}
                            onClick={() => handleSuggestionClick(business)}
                            className="px-4 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <Building2 className="h-5 w-5 text-blue-600" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                                  {business.name}
                                </div>
                                <div className="text-sm text-gray-500 mt-0.5">
                                  {business.category}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5 truncate">
                                  {business.address}
                                </div>
                              </div>

                              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Company Display */}
                {selectedCompany && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {selectedCompany.category}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedCompany.address}
                        </p>
                        {selectedCompany.rating && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.floor(selectedCompany.rating!)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {selectedCompany.rating} (
                              {selectedCompany.reviewCount} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(null);
                          setSearchTerm("");
                        }}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add New Business Option */}
                {searchTerm &&
                  !selectedCompany &&
                  searchSuggestions.length === 0 && (
                    <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            Business not found?
                          </h3>
                          <p className="text-gray-600 mt-1">
                            Can't find the business you're looking for? You can
                            still submit a report.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                            onClick={() => {
                              setSelectedCompany({
                                id: "manual-" + Date.now(),
                                name: searchTerm,
                                address: "Address to be provided",
                                category: "Other",
                              });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Report "{searchTerm}"
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Continue Button */}
                {selectedCompany && (
                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setCurrentStep(2);
                        handleStepComplete(1);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                    >
                      Continue to Issue Details
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Issue Details */}
          {currentStep === 2 && (
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <AlertTriangle className="h-6 w-6" />
                  Step 2: Describe the Issue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Issue Type Selection */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">
                    What type of issue are you reporting?
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {issueTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() =>
                          setReportData({
                            ...reportData,
                            issueType: type.value,
                          })
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          reportData.issueType === type.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-lg font-medium">{type.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">
                    Provide detailed description of the issue
                  </Label>
                  <Textarea
                    placeholder="Please describe what happened, when it occurred, and any other relevant details..."
                    value={reportData.description}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        description: e.target.value,
                      })
                    }
                    className="min-h-32 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Date of Incident */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">
                    Date of incident
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="date"
                      value={reportData.dateOfIncident}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          dateOfIncident: e.target.value,
                        })
                      }
                      className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Amount Lost (if applicable) */}
                {reportData.issueType === "fraud" && (
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      Amount lost (if applicable)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="e.g., 1000 AED"
                        value={reportData.amountLost}
                        onChange={(e) =>
                          setReportData({
                            ...reportData,
                            amountLost: e.target.value,
                          })
                        }
                        className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="border-2 border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3);
                      handleStepComplete(2);
                    }}
                    disabled={
                      !reportData.issueType ||
                      !reportData.description ||
                      !reportData.dateOfIncident
                    }
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3"
                  >
                    Continue to Evidence
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Evidence */}
          {currentStep === 3 && (
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="h-6 w-6" />
                  Step 3: Evidence & Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">
                        Providing evidence helps strengthen your report
                      </p>
                      <p className="mt-1">
                        Upload documents like receipts, contracts, screenshots,
                        or any other relevant files.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evidence Description */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">
                    Describe your evidence
                  </Label>
                  <Textarea
                    placeholder="Describe any evidence you have (receipts, emails, screenshots, etc.)..."
                    value={reportData.evidenceDescription}
                    onChange={(e) =>
                      setReportData({
                        ...reportData,
                        evidenceDescription: e.target.value,
                      })
                    }
                    className="min-h-24 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* File Upload Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Receipt */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-700">
                      Payment Receipt
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                      <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-3">
                        Upload payment receipt or invoice
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>

                  {/* Agreement/Contract */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-700">
                      Agreement/Contract
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-3">
                        Upload contract or agreement
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="border-2 border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep(4);
                      handleStepComplete(3);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3"
                  >
                    Continue to Your Info
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Reporter Information */}
          {currentStep === 4 && (
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <UserCheck className="h-6 w-6" />
                  Step 4: Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">
                        Your information is secure and confidential
                      </p>
                      <p className="mt-1">
                        We use your contact information only to follow up on
                        your report if needed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reporter Name */}
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      Your Full Name *
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={reportData.reporterName}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          reporterName: e.target.value,
                        })
                      }
                      className="border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 py-3"
                      required
                    />
                  </div>

                  {/* Reporter Phone */}
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="tel"
                        placeholder="+971 50 123 4567"
                        value={reportData.reporterPhone}
                        onChange={(e) =>
                          setReportData({
                            ...reportData,
                            reporterPhone: e.target.value,
                          })
                        }
                        className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Reporter Email */}
                <div>
                  <Label className="text-base font-semibold text-gray-700 mb-3 block">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={reportData.reporterEmail}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          reporterEmail: e.target.value,
                        })
                      }
                      className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Navigation and Submit */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="border-2 border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !reportData.reporterName ||
                      !reportData.reporterEmail ||
                      !reportData.reporterPhone
                    }
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
