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

interface EvidenceFile {
  file: File;
  name: string;
  type: string;
}

interface ReportFormData {
  issueType: string;
  employeeName?: string;
  description: string;
  amountLost?: string;
  dateOfIncident: string;
  evidenceDescription: string;
  evidenceFiles?: EvidenceFile[];
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

  const [evidenceNames, setEvidenceNames] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [addCompanyData, setAddCompanyData] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [companySubmitted, setCompanySubmitted] = useState(false);

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
      setShowAddCompanyModal(true);
      return;
    }

    const business = businesses.find((b) => b.id === value);
    if (business) {
      handleCompanySelect(business);
    }
  };

  const handleAddCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCompanyData.name.trim() || !addCompanyData.location.trim()) {
      alert("Company name and location are required.");
      return;
    }

    try {
      const response = await fetch("/api/admin/add-company-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: addCompanyData.name,
          address: addCompanyData.location,
          city: addCompanyData.location,
          description: addCompanyData.description,
        }),
      });

      if (response.ok) {
        setCompanySubmitted(true);
        setAddCompanyData({ name: "", location: "", description: "" });
        setTimeout(() => {
          setShowAddCompanyModal(false);
          setCompanySubmitted(false);
        }, 3000);
      } else {
        throw new Error("Failed to submit company request");
      }
    } catch (error) {
      console.error("Error submitting company:", error);
      alert("Error submitting company request. Please try again.");
    }
  };

  const getFieldErrorClass = (fieldValue: any, isRequired: boolean = false) => {
    if (!isRequired) return "";
    return !fieldValue ||
      (typeof fieldValue === "string" && fieldValue.trim() === "")
      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
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

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newEvidenceFiles: EvidenceFile[] = [];
    const newEvidenceNames: string[] = [];
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "image/webp",
    ];
    const maxFiles = 5;

    // Check total number of files
    const currentFiles = reportData.evidenceFiles || [];
    if (currentFiles.length + files.length > maxFiles) {
      errors.push(
        `Maximum ${maxFiles} files allowed. You have ${currentFiles.length} files already.`,
      );
      setUploadErrors(errors);
      return;
    }

    Array.from(files).forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(
          `${file.name} is not a supported format. Use JPG, PNG, PDF, or WebP.`,
        );
        return;
      }

      // Determine default evidence type based on filename
      const fileName = file.name.toLowerCase();
      let evidenceType = "Document";
      if (fileName.includes("agreement") || fileName.includes("contract")) {
        evidenceType = "Agreement Copy";
      } else if (fileName.includes("receipt") || fileName.includes("payment")) {
        evidenceType = "Payment Receipt";
      } else if (fileName.includes("invoice")) {
        evidenceType = "Invoice";
      } else if (fileName.includes("email") || fileName.includes("message")) {
        evidenceType = "Email/Message";
      } else if (file.type.includes("image")) {
        evidenceType = "Photo Evidence";
      }

      newEvidenceFiles.push({
        file,
        name: evidenceType,
        type: file.type,
      });
      newEvidenceNames.push(evidenceType);
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
    } else {
      setUploadErrors([]);
      setReportData((prev) => ({
        ...prev,
        evidenceFiles: [...(prev.evidenceFiles || []), ...newEvidenceFiles],
      }));
      setEvidenceNames((prev) => [...prev, ...newEvidenceNames]);
    }
  };

  const removeFile = (index: number) => {
    setReportData((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles?.filter((_, i) => i !== index) || [],
    }));
    setEvidenceNames((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEvidenceName = (index: number, newName: string) => {
    setEvidenceNames((prev) => {
      const updated = [...prev];
      updated[index] = newName;
      return updated;
    });
    setReportData((prev) => ({
      ...prev,
      evidenceFiles:
        prev.evidenceFiles?.map((evidence, i) =>
          i === index ? { ...evidence, name: newName } : evidence,
        ) || [],
    }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCompany(null);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
        if (key === "evidenceFiles" && Array.isArray(value)) {
          // Handle multiple evidence files with names
          value.forEach((evidenceFile, index) => {
            formData.append(`evidenceFile_${index}`, evidenceFile.file);
            formData.append(`evidenceFileName_${index}`, evidenceFile.name);
            formData.append(`evidenceFileType_${index}`, evidenceFile.type);
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (
          value !== null &&
          value !== undefined &&
          key !== "evidenceFiles"
        ) {
          formData.append(key, value.toString());
        }
      });

      formData.append("companyName", selectedCompany.name);
      formData.append("companyAddress", selectedCompany.address);
      formData.append(
        "evidenceFileCount",
        (reportData.evidenceFiles?.length || 0).toString(),
      );

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
    if (
      reportData.evidenceDescription ||
      (reportData.evidenceFiles && reportData.evidenceFiles.length > 0)
    )
      completed++;
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

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 w-full">
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white mx-2 sm:mx-0">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
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

                <div className="max-w-full sm:max-w-lg mx-auto">
                  <Select
                    value={selectedCompany?.id || ""}
                    onValueChange={handleSelectChange}
                    onOpenChange={(open) => {
                      // Prevent scroll to top on mobile when select opens
                      if (open && window.innerWidth <= 768) {
                        const currentScrollY = window.scrollY;
                        setTimeout(
                          () => window.scrollTo(0, currentScrollY),
                          100,
                        );
                      }
                    }}
                    required
                  >
                    <SelectTrigger
                      className={`w-full h-10 text-sm ${!selectedCompany ? "border-red-500" : "border-gray-300"}`}
                    >
                      <SelectValue placeholder="Select or search company..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <div className="p-2 relative">
                        <input
                          type="text"
                          placeholder="Type 2+ characters to search..."
                          value={searchTerm}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm(value);
                            handleCompanySearch(value);
                          }}
                          onFocus={(e) => {
                            e.stopPropagation();
                          }}
                          onInput={(e) => {
                            // Keep focus after input
                            const target = e.target as HTMLInputElement;
                            setTimeout(() => {
                              if (target && document.activeElement !== target) {
                                target.focus();
                              }
                            }, 10);
                          }}
                          autoComplete="off"
                          className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSearch();
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
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
                      <SelectTrigger
                        className={`mt-1 ${getFieldErrorClass(reportData.issueType, true)}`}
                      >
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

                  {reportData.issueType && (
                    <div>
                      <Label
                        htmlFor="employeeName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Employee/Contact Person Involved (Optional)
                      </Label>
                      <Input
                        id="employeeName"
                        type="text"
                        placeholder="Name of the employee or contact person"
                        value={reportData.employeeName || ""}
                        onChange={(e) =>
                          setReportData((prev) => ({
                            ...prev,
                            employeeName: e.target.value,
                          }))
                        }
                        className="mt-1"
                        disabled={!selectedCompany}
                      />
                    </div>
                  )}

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
                      className={`mt-1 min-h-[100px] ${getFieldErrorClass(reportData.description, true)}`}
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
                        className={`mt-1 ${getFieldErrorClass(reportData.dateOfIncident, true)}`}
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
                  {(reportData.evidenceDescription ||
                    (reportData.evidenceFiles &&
                      reportData.evidenceFiles.length > 0)) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </div>

                <div className="space-y-4">
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

                  {/* File Upload Section */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Upload Evidence Files (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="evidenceFiles"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        disabled={!reportData.issueType}
                      />
                      <label
                        htmlFor="evidenceFiles"
                        className={`cursor-pointer flex flex-col items-center space-y-2 ${!reportData.issueType ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Click to upload files
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, PDF, WebP up to 5MB each (Max 5 files)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Upload Errors */}
                    {uploadErrors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {uploadErrors.map((error, index) => (
                          <p
                            key={index}
                            className="text-sm text-red-600 flex items-center"
                          >
                            <X className="h-4 w-4 mr-1" />
                            {error}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Uploaded Files */}
                    {reportData.evidenceFiles &&
                      reportData.evidenceFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Uploaded Evidence Files (
                            {reportData.evidenceFiles.length}/5)
                          </Label>
                          <div className="space-y-3">
                            {reportData.evidenceFiles.map(
                              (evidenceFile, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-gray-50 rounded-lg border space-y-3"
                                >
                                  {/* File Info */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        {evidenceFile.type.includes("image") ? (
                                          <Eye className="h-4 w-4 text-blue-600" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-blue-600" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                          {evidenceFile.file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatFileSize(
                                            evidenceFile.file.size,
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Evidence Name/Type */}
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600 mb-1 block">
                                      Evidence Type/Name
                                    </Label>
                                    <Select
                                      value={evidenceFile.name}
                                      onValueChange={(value) =>
                                        updateEvidenceName(index, value)
                                      }
                                    >
                                      <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Agreement Copy">
                                          📄 Agreement Copy
                                        </SelectItem>
                                        <SelectItem value="Payment Receipt">
                                          🧾 Payment Receipt
                                        </SelectItem>
                                        <SelectItem value="Invoice">
                                          💵 Invoice
                                        </SelectItem>
                                        <SelectItem value="Email/Message">
                                          📧 Email/Message
                                        </SelectItem>
                                        <SelectItem value="Photo Evidence">
                                          📸 Photo Evidence
                                        </SelectItem>
                                        <SelectItem value="Bank Statement">
                                          🏦 Bank Statement
                                        </SelectItem>
                                        <SelectItem value="Contract">
                                          📋 Contract
                                        </SelectItem>
                                        <SelectItem value="ID Copy">
                                          🆔 ID Copy
                                        </SelectItem>
                                        <SelectItem value="Communication Records">
                                          💬 Communication Records
                                        </SelectItem>
                                        <SelectItem value="Service Agreement">
                                          📜 Service Agreement
                                        </SelectItem>
                                        <SelectItem value="Other Document">
                                          📁 Other Document
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
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
                        className={`mt-1 ${getFieldErrorClass(reportData.reporterName, true)}`}
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
                        className={`mt-1 ${getFieldErrorClass(reportData.reporterEmail, true)}`}
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

                  {/* Confidentiality Settings */}
                  <div className="border-t pt-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Report Visibility Settings
                      </Label>
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={reportData.isPublic}
                          onChange={(e) =>
                            setReportData((prev) => ({
                              ...prev,
                              isPublic: e.target.checked,
                            }))
                          }
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={!reportData.description}
                        />
                        <div>
                          <label
                            htmlFor="isPublic"
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            Make my report public
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            {reportData.isPublic
                              ? "✅ Your report will be publicly visible to help warn other customers. Your personal details will be kept confidential."
                              : "🔒 Your report will be kept private and only shared with authorities and the reported company for resolution."}
                          </p>
                        </div>
                      </div>

                      {/* Privacy Notice */}
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-start space-x-2">
                          <Shield className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-yellow-800">
                              Privacy Protection
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Regardless of your choice, your personal contact
                              information (name, email, phone) is always kept
                              confidential and never shared publicly.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
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
        </div>

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

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {companySubmitted ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Company Request Submitted!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your company addition request has been submitted for review.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        24-Hour Review Process
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please come back after 24 hours to report this company
                        once it's approved by our authority.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddCompanySubmit}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add New Company
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddCompanyModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="companyName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Company Name *
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Enter company name"
                        value={addCompanyData.name}
                        onChange={(e) =>
                          setAddCompanyData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`mt-1 ${getFieldErrorClass(addCompanyData.name, true)}`}
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="companyLocation"
                        className="text-sm font-medium text-gray-700"
                      >
                        Location *
                      </Label>
                      <Input
                        id="companyLocation"
                        type="text"
                        placeholder="Enter company location (e.g., Business Bay, Dubai)"
                        value={addCompanyData.location}
                        onChange={(e) =>
                          setAddCompanyData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className={`mt-1 ${getFieldErrorClass(addCompanyData.location, true)}`}
                        required
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="companyDescription"
                        className="text-sm font-medium text-gray-700"
                      >
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="companyDescription"
                        placeholder="Brief description of company services..."
                        value={addCompanyData.description}
                        onChange={(e) =>
                          setAddCompanyData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="mt-1 min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddCompanyModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={
                        !addCompanyData.name.trim() ||
                        !addCompanyData.location.trim()
                      }
                    >
                      Submit Request
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
                completed: !!(
                  reportData.evidenceDescription ||
                  (reportData.evidenceFiles &&
                    reportData.evidenceFiles.length > 0)
                ),
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
