import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Star,
  Building2,
  Search,
  ArrowRight,
  MapPin,
  Upload,
  FileText,
  User,
  Clock,
  Sparkles,
  Heart,
  Users,
  Globe,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  reviewCount: number;
}

interface ReportData {
  companyId: string;
  companyName: string;
  issueType: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  amountLost?: number;
  dateOfIncident: string;
  evidenceDescription: string;
  employeeName?: string;
  paymentReceipt?: File;
  agreementCopy?: File;
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
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formProgress, setFormProgress] = useState(0);
  const [showFilePreview, setShowFilePreview] = useState<{
    receipt: boolean;
    agreement: boolean;
  }>({ receipt: false, agreement: false });
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [animateCards, setAnimateCards] = useState(false);

  const fileInputRefs = {
    paymentReceipt: useRef<HTMLInputElement>(null),
    agreementCopy: useRef<HTMLInputElement>(null),
  };

  const [reportData, setReportData] = useState<ReportData>({
    companyId: "",
    companyName: "",
    issueType: "",
    description: "",
    reporterName: "",
    reporterEmail: "",
    amountLost: 0,
    dateOfIncident: "",
    evidenceDescription: "",
    employeeName: "",
    paymentReceipt: undefined,
    agreementCopy: undefined,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
    setAnimateCards(true);
  }, []);

  // Track form progress
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
      if (reportData.reporterName && reportData.reporterEmail)
        newCompletedSteps.push(4);
      setCompletedSteps(newCompletedSteps);
    };

    calculateProgress();
  }, [selectedCompany, reportData]);

  // Typing indicator for text areas
  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  }, [reportData.description, reportData.evidenceDescription]);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch("/api/dubai-visa-services?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const handleCompanySearch = (value: string) => {
    setSearchTerm(value);
    setIsTyping(true);

    if (value.length >= 1) {
      const filtered = businesses
        .filter((business) =>
          business.name.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 8);
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCompanySelect = (business: BusinessData) => {
    setSelectedCompany(business);
    setSearchTerm(business.name);
    setShowSuggestions(false);
    setReportData((prev) => ({
      ...prev,
      companyId: business.id,
      companyName: business.name,
    }));
  };

  const handleFileUpload = (
    field: "paymentReceipt" | "agreementCopy",
    file: File | null,
  ) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and PDF files are allowed");
        return;
      }

      // Show file preview animation
      if (field === "paymentReceipt") {
        setShowFilePreview((prev) => ({ ...prev, receipt: true }));
      } else {
        setShowFilePreview((prev) => ({ ...prev, agreement: true }));
      }

      // Auto-hide preview after 3 seconds
      setTimeout(() => {
        if (field === "paymentReceipt") {
          setShowFilePreview((prev) => ({ ...prev, receipt: false }));
        } else {
          setShowFilePreview((prev) => ({ ...prev, agreement: false }));
        }
      }, 3000);
    }

    setReportData((prev) => ({ ...prev, [field]: file }));
  };

  const triggerFileUpload = (field: "paymentReceipt" | "agreementCopy") => {
    fileInputRefs[field].current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      alert("Please select a company from our database");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(reportData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      formData.append("status", "pending");
      formData.append("createdAt", new Date().toISOString());

      const response = await fetch("/api/reports/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setSubmitted(true);
        }, 3000);
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Report Submitted Successfully
            </h2>
            <p className="text-gray-600 mb-6">
              Your report has been submitted to our admin team for review. Once
              approved, it will be visible on the company's profile to help
              protect other community members.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Home
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
      <style jsx>{`
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

        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
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

        .card-animate {
          animation: slideInUp 0.6s ease-out;
        }

        .card-animate:nth-child(2) {
          animation-delay: 0.1s;
        }

        .card-animate:nth-child(3) {
          animation-delay: 0.2s;
        }

        .card-animate:nth-child(4) {
          animation-delay: 0.3s;
        }

        .file-upload-area {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px dashed #d1d5db;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          position: relative;
          overflow: hidden;
        }

        .file-upload-area:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
        }

        .file-upload-area.uploaded {
          border-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          animation: pulseGlow 2s infinite;
        }

        .search-container {
          position: relative;
          z-index: 30;
        }

        .typing-indicator {
          animation: shake 0.5s ease-in-out;
        }

        .suggestion-item {
          transition: all 0.3s ease;
          transform: translateX(0);
        }

        .suggestion-item:hover {
          transform: translateX(5px);
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .progress-bar {
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(
            90deg,
            #3b82f6 0%,
            #8b5cf6 50%,
            #ef4444 100%
          );
        }

        .step-indicator {
          transition: all 0.4s ease;
        }

        .step-indicator.completed {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          animation: pulseGlow 1s ease-out;
        }

        .step-indicator.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          animation: pulseGlow 2s infinite;
        }

        .glassmorphism {
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              Report Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-4">
              Your report has been submitted to our admin team for review. Once
              approved by our administrators, your report will be visible on the
              company's profile page to help protect other community members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg hover-lift">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold gradient-text mb-3 sm:mb-4 px-2">
              Report Scam Immigration Company
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4 mb-6">
              Help protect our community by reporting fraudulent immigration
              companies, visa scams, and unethical business practices.
            </p>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex justify-between items-center mb-2 px-4">
                <span className="text-sm font-medium text-gray-600">
                  Form Progress
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(formProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 px-4">
                <div
                  className="progress-bar h-2 rounded-full"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center space-x-4 mt-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold step-indicator ${
                      completedSteps.includes(step)
                        ? "completed text-white"
                        : currentStep === step
                          ? "active text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {completedSteps.includes(step) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {step === 1
                      ? "Company"
                      : step === 2
                        ? "Details"
                        : step === 3
                          ? "Evidence"
                          : "Info"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Company Selection */}
            <Card
              className={`shadow-lg border border-gray-200 bg-white hover-lift glassmorphism ${animateCards ? "card-animate" : ""}`}
            >
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span>Step 1: Select Company</span>
                  {completedSteps.includes(1) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="search-container">
                  <Label
                    htmlFor="company"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Search Company Name *
                  </Label>
                  <div className="relative">
                    <Input
                      id="company"
                      type="text"
                      placeholder="Start typing company name..."
                      value={searchTerm}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                      className={`h-11 pl-10 pr-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all duration-300 ${isTyping ? "typing-indicator" : ""}`}
                      required
                    />
                    <Search
                      className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-300 ${isTyping ? "text-blue-500" : "text-gray-400"}`}
                    />
                  </div>

                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto glassmorphism">
                      {searchSuggestions.map((business, index) => (
                        <div
                          key={business.id}
                          className="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-3"
                          onClick={() => handleCompanySelect(business)}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
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
                                className="text-xs px-2 py-0"
                              >
                                {business.category}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">
                                  {business.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCompany && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {selectedCompany.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedCompany.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card
              className={`shadow-lg border border-gray-200 bg-white hover-lift glassmorphism ${animateCards ? "card-animate" : ""}`}
            >
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Step 2: Report Details</span>
                  {completedSteps.includes(2) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="issueType"
                      className="text-sm font-medium text-gray-700"
                    >
                      Type of Issue *
                    </Label>
                    <Select
                      value={reportData.issueType}
                      onValueChange={(value) =>
                        setReportData((prev) => ({ ...prev, issueType: value }))
                      }
                      required
                    >
                      <SelectTrigger className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fraud">💰 Fraud / Scam</SelectItem>
                        <SelectItem value="poor-service">
                          😞 Poor Service
                        </SelectItem>
                        <SelectItem value="overcharging">
                          💸 Overcharging
                        </SelectItem>
                        <SelectItem value="false-advertising">
                          📢 False Advertising
                        </SelectItem>
                        <SelectItem value="unprofessional">
                          😡 Unprofessional Behavior
                        </SelectItem>
                        <SelectItem value="document-fraud">
                          📄 Document Fraud
                        </SelectItem>
                        <SelectItem value="other">❓ Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="employeeName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Employee Name (Optional)
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
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="amountLost"
                      className="text-sm font-medium text-gray-700"
                    >
                      Amount Lost (AED)
                    </Label>
                    <Input
                      id="amountLost"
                      type="number"
                      placeholder="0"
                      value={reportData.amountLost || ""}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          amountLost: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dateOfIncident"
                      className="text-sm font-medium text-gray-700"
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
                    Evidence Description & Details Experience with Company
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
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <Upload className="h-5 w-5 text-purple-600" />
                  <span>Step 3: Upload Evidence (Optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Payment Receipt / Invoice
                    </Label>
                    <div
                      className="file-upload-area p-6 rounded-lg cursor-pointer text-center"
                      onClick={() => triggerFileUpload("paymentReceipt")}
                    >
                      {reportData.paymentReceipt ? (
                        <div className="text-green-600">
                          <FileText className="h-10 w-10 mx-auto mb-2" />
                          <p className="font-medium text-sm">
                            {reportData.paymentReceipt.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              reportData.paymentReceipt.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <Upload className="h-10 w-10 mx-auto mb-2" />
                          <p className="font-medium text-sm">
                            Upload Payment Receipt
                          </p>
                          <p className="text-xs">PNG, JPG, PDF up to 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRefs.paymentReceipt}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) =>
                        handleFileUpload(
                          "paymentReceipt",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Agreement / Contract Copy
                    </Label>
                    <div
                      className="file-upload-area p-6 rounded-lg cursor-pointer text-center"
                      onClick={() => triggerFileUpload("agreementCopy")}
                    >
                      {reportData.agreementCopy ? (
                        <div className="text-green-600">
                          <FileText className="h-10 w-10 mx-auto mb-2" />
                          <p className="font-medium text-sm">
                            {reportData.agreementCopy.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(
                              reportData.agreementCopy.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <Upload className="h-10 w-10 mx-auto mb-2" />
                          <p className="font-medium text-sm">
                            Upload Agreement Copy
                          </p>
                          <p className="text-xs">PNG, JPG, PDF up to 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRefs.agreementCopy}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) =>
                        handleFileUpload(
                          "agreementCopy",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>📁 File Upload Tips:</strong> Uploading evidence
                    strengthens your report. Accepted formats: JPEG, PNG, PDF.
                    Maximum size: 5MB per file.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reporter Information */}
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <User className="h-5 w-5 text-green-600" />
                  <span>Step 4: Your Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="reporterName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Your Full Name *
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

                  <div className="space-y-2">
                    <Label
                      htmlFor="reporterEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Your Email Address *
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

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy & Security Notice
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Your personal information is kept strictly confidential and
                    used only for investigating this report. We may contact you
                    for additional details if needed. Your identity will not be
                    disclosed to the reported company.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !selectedCompany}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg rounded-lg min-w-[200px] shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Submit Report</span>
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
                  10,000+
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Community Protected
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  500+
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Scams Prevented
                </p>
              </div>

              <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
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

          {/* Footer Content */}
          <footer className="bg-gray-800 text-white mt-12 sm:mt-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto py-8 sm:py-12">
              {/* Dubai Government Logos Section */}
              <div className="mb-8 sm:mb-12 text-center">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                  Authorized by Dubai Government
                </h3>
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 opacity-80">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">
                        Dubai Municipality
                      </div>
                      <div className="text-xs text-gray-300">
                        Business Registration
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">DED</div>
                      <div className="text-xs text-gray-300">
                        Department of Economic Development
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                      <Globe className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">UAE Gov</div>
                      <div className="text-xs text-gray-300">
                        Federal Authority
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-400" />
                    Community Protection
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Our platform helps protect thousands of people from
                    immigration scams and fraudulent companies. Together, we
                    build a safer community for everyone seeking legitimate
                    immigration services.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                    How We Help
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                      Verify company legitimacy
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                      Share community warnings
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                      Connect with trusted services
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                      Provide legal resources
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-purple-400" />
                    Contact Us
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>support@dubaiprotect.ae</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>+971 4 123 4567</span>
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                        <Facebook className="h-4 w-4 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                        <Twitter className="h-4 w-4 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-colors">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center py-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  © 2024 Dubai Business Protection Platform. All rights
                  reserved.
                  <span className="mx-2">•</span>
                  Protecting our community since 2020.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
