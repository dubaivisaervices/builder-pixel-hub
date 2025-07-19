import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
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
  Target,
  Eye,
  Award,
  Flag,
  Phone,
  Mail,
  Globe,
  MapPin,
  ChevronRight,
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
  evidenceFiles?: File[];
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  isPublic: boolean;
}

export default function ComplaintFormImproved() {
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
    isPublic: true,
    evidenceFiles: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
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
                  rating: business.rating || 4.0,
                  reviewCount: business.reviewCount || 0,
                  category: business.category,
                })),
              );
              return;
            }
          }
        } catch (error) {
          console.warn(`Failed to load from ${source}:`, error);
        }
      }

      // Fallback data
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
      ];
      setBusinesses(fallbackBusinesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const handleCompanySearch = (value: string) => {
    setSearchTerm(value);

    // Clear selected company when search is cleared
    if (value.trim() === "") {
      setSelectedCompany(null);
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (value.length >= 2) {
      const filtered = businesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 8);

      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleCompanySelect = (business: BusinessData) => {
    setSelectedCompany(business);
    setSearchTerm(business.name);
    setShowSuggestions(false);
  };

  const handleSelectChange = (value: string) => {
    if (value === "add-new") {
      navigate("/add-business");
      return;
    }

    const business = businesses.find((b) => b.id === value);
    if (business) {
      handleCompanySelect(business);
    }
  };

  const filteredBusinesses =
    searchTerm.length >= 2
      ? businesses
          .filter(
            (business) =>
              business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              business.address
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              business.category
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
          )
          .slice(0, 10)
      : [];

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

  const getProgressPercentage = () => {
    let completed = 0;
    const total = 4;

    if (selectedCompany) completed++;
    if (
      reportData.issueType &&
      reportData.description &&
      reportData.dateOfIncident
    )
      completed++;
    if (reportData.evidenceDescription) completed++;
    if (reportData.reporterName && reportData.reporterEmail) completed++;

    return (completed / total) * 100;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-lg w-full shadow-xl border-0 bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Report Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for helping protect the Dubai business community.
            </p>
            <Button
              onClick={() => navigate("/dubai-businesses")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Compact Hero */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              Report Business Issues
            </h1>
            <p className="text-red-100">
              Help protect Dubai's business community through transparent
              reporting.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Step 1: Company Selection */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Select Company</h3>
                {selectedCompany && (
                  <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                )}
              </div>

              <div className="max-w-lg mx-auto">
                <Select
                  value={selectedCompany?.id || ""}
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Select or search company..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Type 2+ characters to search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {searchTerm.length >= 2 ? (
                      filteredBusinesses.length > 0 ? (
                        filteredBusinesses.map((business) => (
                          <SelectItem key={business.id} value={business.id}>
                            <div className="flex items-center space-x-2 w-full">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {business.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {business.category} • ⭐ {business.rating}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <div className="p-3 text-center text-sm text-gray-500">
                            Company not found
                          </div>
                          <SelectItem value="add-new">
                            <div className="flex items-center space-x-2 text-green-600">
                              <Building2 className="h-4 w-4" />
                              <span>Add New Company</span>
                            </div>
                          </SelectItem>
                        </>
                      )
                    ) : (
                      <div className="p-3 text-center text-sm text-gray-500">
                        Type at least 2 characters to search
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCompany && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-lg mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {selectedCompany.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {selectedCompany.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {selectedCompany.address}
                      </p>
                      <Badge className="mt-1 text-xs">
                        {selectedCompany.category}
                      </Badge>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Report Details */}
          <Card
            className={`shadow-sm border border-gray-200 ${!selectedCompany ? "opacity-50" : ""}`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Report Details</h3>
                {reportData.issueType &&
                  reportData.description &&
                  reportData.dateOfIncident && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="issueType"
                    className="text-sm font-medium text-gray-700"
                  >
                    Type of Issue *
                  </Label>
                  <Select
                    value={reportData.issueType}
                    onValueChange={(value) =>
                      setReportData((prev) => ({
                        ...prev,
                        issueType: value,
                      }))
                    }
                    required
                    disabled={!selectedCompany}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select issue type..." />
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
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about the issue..."
                    value={reportData.description}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="mt-1 min-h-[100px]"
                    required
                    disabled={!selectedCompany}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
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
                          amountLost: e.target.value,
                        }))
                      }
                      className="mt-1"
                      disabled={!selectedCompany}
                    />
                  </div>

                  <div>
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
                      className="mt-1"
                      required
                      disabled={!selectedCompany}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Evidence */}
          <Card
            className={`shadow-sm border border-gray-200 ${!reportData.issueType ? "opacity-50" : ""}`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Evidence (Optional)</h3>
                {reportData.evidenceDescription && (
                  <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                )}
              </div>

              <div>
                <Label
                  htmlFor="evidenceDescription"
                  className="text-sm font-medium text-gray-700"
                >
                  Evidence Description
                </Label>
                <Textarea
                  id="evidenceDescription"
                  placeholder="Describe any evidence you have..."
                  value={reportData.evidenceDescription}
                  onChange={(e) =>
                    setReportData((prev) => ({
                      ...prev,
                      evidenceDescription: e.target.value,
                    }))
                  }
                  className="mt-1"
                  disabled={!reportData.issueType}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Contact Information */}
          <Card
            className={`shadow-sm border border-gray-200 ${!reportData.description ? "opacity-50" : ""}`}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Your Information</h3>
                {reportData.reporterName && reportData.reporterEmail && (
                  <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="reporterName"
                      className="text-sm font-medium text-gray-700"
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
                      className="mt-1"
                      required
                      disabled={!reportData.description}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="reporterEmail"
                      className="text-sm font-medium text-gray-700"
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
                      className="mt-1"
                      required
                      disabled={!reportData.description}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="reporterPhone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="reporterPhone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={reportData.reporterPhone}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        reporterPhone: e.target.value,
                      }))
                    }
                    className="mt-1"
                    disabled={!reportData.description}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !selectedCompany ||
                      !reportData.issueType ||
                      !reportData.description ||
                      !reportData.dateOfIncident ||
                      !reportData.reporterName ||
                      !reportData.reporterEmail
                    }
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Community Impact */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Protect Your Community
            </h2>
            <p className="text-gray-700 mb-6">
              Your report helps protect future customers and builds a safer
              business environment.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2.8k+</div>
                <div className="text-sm text-gray-600">Reports Filed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24h</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GovernmentSection />
      <Footer />

      {/* Sticky Bottom Steps */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between relative">
            {[
              { number: 1, label: "Company", completed: !!selectedCompany },
              {
                number: 2,
                label: "Details",
                completed: !!(
                  reportData.issueType &&
                  reportData.description &&
                  reportData.dateOfIncident
                ),
              },
              {
                number: 3,
                label: "Evidence",
                completed: !!reportData.evidenceDescription,
              },
              {
                number: 4,
                label: "Contact",
                completed: !!(
                  reportData.reporterName && reportData.reporterEmail
                ),
              },
            ].map((step, index) => (
              <div
                key={step.number}
                className="flex flex-col items-center flex-1 relative"
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                    step.completed
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 text-center">
                  {step.label}
                </span>
                {index < 3 && (
                  <div
                    className={`absolute top-2 sm:top-3 left-1/2 w-full h-0.5 ${
                      step.completed ? "bg-green-600" : "bg-gray-200"
                    }`}
                    style={{
                      left: "50%",
                      width: "calc(100% - 1rem)",
                      marginLeft: "0.5rem",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
