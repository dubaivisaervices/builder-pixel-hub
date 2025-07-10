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
  const [fadeIn, setFadeIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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
    setTimeout(() => setFadeIn(true), 100);

    // Add scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
          }
        });
      },
      { threshold: 0.1 },
    );

    const cards = document.querySelectorAll(".animate-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and PDF files are allowed");
        return;
      }
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
      // Create FormData for file uploads
      const formData = new FormData();

      // Add all text fields
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }

        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .file-upload-area {
          transition: all 0.3s ease;
          border: 2px dashed #d1d5db;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .file-upload-area:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .search-container {
          position: relative;
          z-index: 30;
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 8px;
          max-height: 300px;
          overflow-y: auto;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          z-index: 40;
        }

        .form-step {
          transition: all 0.3s ease;
        }

        .input-focus {
          transition: all 0.2s ease;
        }

        .input-focus:focus {
          transform: scale(1.02);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-900">
              Report Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-4">
              Your report has been submitted to our admin team for review. Once
              approved by our administrators, your report will be visible on the
              company's profile page to help protect other community members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <div className="animate-pulse">
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 transition-all duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Enhanced Header */}
          <div
            className={`text-center mb-12 transition-all duration-1000 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-purple-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-red-600 bg-clip-text text-transparent mb-6">
              Report Scam Immigration Company
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Help protect our community by reporting fraudulent immigration
              companies, visa scams, and unethical business practices. Your
              report helps others avoid similar experiences.
            </p>

            {/* Community Protection Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center animate-slide-in">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">10,000+</h3>
                <p className="text-gray-600">Community Protected</p>
              </div>
              <div
                className="text-center animate-slide-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">500+</h3>
                <p className="text-gray-600">Scams Prevented</p>
              </div>
              <div
                className="text-center animate-slide-in"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
                <p className="text-gray-600">Community Support</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Selection */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl animate-card hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Building2 className="h-6 w-6" />
                  <span>Step 1: Select Company</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="search-container">
                  <Label
                    htmlFor="company"
                    className="text-lg font-semibold text-gray-800 mb-3 block"
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
                      className="h-14 pl-14 pr-4 text-lg border-2 border-gray-200 rounded-xl input-focus bg-white"
                      required
                    />
                    <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                  </div>

                  {/* Company Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {searchSuggestions.map((business, index) => (
                        <div
                          key={business.id}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-4 transition-all duration-200"
                          onClick={() => handleCompanySelect(business)}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {business.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-lg">
                              {business.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {business.address}
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {business.category}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {business.rating} ({business.reviewCount})
                                </span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Company Display */}
                {selectedCompany && (
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl animate-fade-in-up">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {selectedCompany.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          {selectedCompany.address}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">
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
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl animate-card">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <AlertTriangle className="h-6 w-6" />
                  <span>Step 2: Report Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="issueType"
                      className="text-lg font-semibold text-gray-800"
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
                      <SelectTrigger className="h-14 text-lg border-2 border-gray-200 rounded-xl input-focus">
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
                      className="text-lg font-semibold text-gray-800"
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
                      className="h-14 text-lg border-2 border-gray-200 rounded-xl input-focus"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-lg font-semibold text-gray-800 mb-3 block"
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
                    className="min-h-[150px] text-lg border-2 border-gray-200 rounded-xl input-focus"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="amountLost"
                      className="text-lg font-semibold text-gray-800"
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
                      className="h-14 text-lg border-2 border-gray-200 rounded-xl input-focus"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="dateOfIncident"
                      className="text-lg font-semibold text-gray-800"
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
                      className="h-14 text-lg border-2 border-gray-200 rounded-xl input-focus"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="evidenceDescription"
                    className="text-lg font-semibold text-gray-800 mb-3 block"
                  >
                    Evidence Description
                  </Label>
                  <Textarea
                    id="evidenceDescription"
                    placeholder="Describe any evidence you have (documents, screenshots, emails, recordings, etc.)"
                    value={reportData.evidenceDescription}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        evidenceDescription: e.target.value,
                      }))
                    }
                    className="min-h-[100px] text-lg border-2 border-gray-200 rounded-xl input-focus"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl animate-card">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Upload className="h-6 w-6" />
                  <span>Step 3: Upload Evidence (Optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Receipt Upload */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800">
                      Payment Receipt / Invoice
                    </Label>
                    <div
                      className="file-upload-area p-8 rounded-xl cursor-pointer text-center"
                      onClick={() => triggerFileUpload("paymentReceipt")}
                    >
                      {reportData.paymentReceipt ? (
                        <div className="text-green-600">
                          <FileText className="h-12 w-12 mx-auto mb-3" />
                          <p className="font-semibold">
                            {reportData.paymentReceipt.name}
                          </p>
                          <p className="text-sm text-gray-500">
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
                          <Upload className="h-12 w-12 mx-auto mb-3" />
                          <p className="font-semibold">
                            Upload Payment Receipt
                          </p>
                          <p className="text-sm">PNG, JPG, PDF up to 5MB</p>
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

                  {/* Agreement Copy Upload */}
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-800">
                      Agreement / Contract Copy
                    </Label>
                    <div
                      className="file-upload-area p-8 rounded-xl cursor-pointer text-center"
                      onClick={() => triggerFileUpload("agreementCopy")}
                    >
                      {reportData.agreementCopy ? (
                        <div className="text-green-600">
                          <FileText className="h-12 w-12 mx-auto mb-3" />
                          <p className="font-semibold">
                            {reportData.agreementCopy.name}
                          </p>
                          <p className="text-sm text-gray-500">
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
                          <Upload className="h-12 w-12 mx-auto mb-3" />
                          <p className="font-semibold">Upload Agreement Copy</p>
                          <p className="text-sm">PNG, JPG, PDF up to 5MB</p>
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

                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    <strong>📁 File Upload Tips:</strong> Uploading evidence
                    strengthens your report. Accepted formats: JPEG, PNG, PDF.
                    Maximum size: 5MB per file.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reporter Information */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl animate-card">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <User className="h-6 w-6" />
                  <span>Step 4: Your Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="reporterName"
                      className="text-lg font-semibold text-gray-800"
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
                      className="h-14 text-lg border-2 border-gray-200 rounded-xl input-focus"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reporterEmail"
                      className="text-lg font-semibold text-gray-800"
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
                      className="h-14 text-lg border-2 border-gray-200 rounded-xl input-focus"
                      required
                    />
                  </div>
                </div>

                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy & Security Notice
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Your personal information is kept strictly confidential and
                    used only for investigating this report. We may contact you
                    for additional details if needed. Your identity will not be
                    disclosed to the reported company.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <Button
                type="submit"
                disabled={loading || !selectedCompany}
                className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white px-12 py-4 text-xl rounded-xl min-w-[250px] shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Submit Report</span>
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Footer Content */}
          <footer className="mt-16 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-blue-600" />
                  Community Protection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our platform helps protect thousands of people from
                  immigration scams and fraudulent companies. Together, we build
                  a safer community for everyone seeking legitimate immigration
                  services.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-2 text-green-600" />
                  How We Help
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Verify company legitimacy
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Share community warnings
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Connect with trusted services
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Provide legal resources
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-6 w-6 mr-2 text-purple-600" />
                  Connect With Us
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>support@dubaiprotect.com</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>+971 4 123 4567</span>
                  </div>
                  <div className="flex space-x-4 mt-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                      <Facebook className="h-4 w-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                      <Twitter className="h-4 w-4 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-colors">
                      <Instagram className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-6 border-t border-gray-200">
              <p className="text-gray-600">
                © 2024 Dubai Business Protection. All rights reserved.
                <span className="mx-2">•</span>
                Protecting our community since 2020.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
