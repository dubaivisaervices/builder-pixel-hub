import React, { useState, useEffect } from "react";
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
  Shield,
  CheckCircle,
  AlertTriangle,
  Star,
  Building2,
  Search,
  ArrowRight,
  MapPin,
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
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBusinesses();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      alert("Please select a company from our database");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reports/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reportData,
          status: "pending",
          createdAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
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
        <Card className="max-w-md w-full shadow-xl border-0 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Report Submitted Successfully
            </h2>
            <p className="text-gray-600 mb-6">
              Your report has been submitted to our admin team for review. We
              will investigate the matter and take appropriate action.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                Back to Home
              </Button>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedCompany(null);
                  setSearchTerm("");
                  setReportData({
                    companyId: "",
                    companyName: "",
                    issueType: "",
                    description: "",
                    reporterName: "",
                    reporterEmail: "",
                    amountLost: 0,
                    dateOfIncident: "",
                    evidenceDescription: "",
                  });
                }}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Report a Business Issue
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help protect our community by reporting fraudulent activities, poor
            service, or any other issues with businesses in our directory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Select Company</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label htmlFor="company">Search Company Name *</Label>
                <div className="relative">
                  <Input
                    id="company"
                    type="text"
                    placeholder="Start typing company name..."
                    value={searchTerm}
                    onChange={(e) => handleCompanySearch(e.target.value)}
                    className="h-12 pl-12"
                    required
                  />
                  <Search className="absolute left-4 top-3 h-6 w-6 text-gray-400" />
                </div>

                {/* Company Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto">
                    {searchSuggestions.map((business) => (
                      <div
                        key={business.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-3"
                        onClick={() => handleCompanySelect(business)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {business.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {business.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {business.address}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {business.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">
                                {business.rating} ({business.reviewCount})
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Company Display */}
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
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Report Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="issueType">Type of Issue *</Label>
                <Select
                  value={reportData.issueType}
                  onValueChange={(value) =>
                    setReportData((prev) => ({ ...prev, issueType: value }))
                  }
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fraud">Fraud / Scam</SelectItem>
                    <SelectItem value="poor-service">Poor Service</SelectItem>
                    <SelectItem value="overcharging">Overcharging</SelectItem>
                    <SelectItem value="false-advertising">
                      False Advertising
                    </SelectItem>
                    <SelectItem value="unprofessional">
                      Unprofessional Behavior
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
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
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amountLost">Amount Lost (AED)</Label>
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
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfIncident">Date of Incident *</Label>
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
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="evidenceDescription">
                  Evidence Description
                </Label>
                <Textarea
                  id="evidenceDescription"
                  placeholder="Describe any evidence you have (documents, screenshots, emails, etc.)"
                  value={reportData.evidenceDescription}
                  onChange={(e) =>
                    setReportData((prev) => ({
                      ...prev,
                      evidenceDescription: e.target.value,
                    }))
                  }
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reporter Information */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName">Your Name *</Label>
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
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reporterEmail">Your Email *</Label>
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
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Privacy Notice:</strong> Your information will be kept
                  confidential and used only for investigating this report. We
                  may contact you for additional details if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={loading || !selectedCompany}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 text-lg rounded-xl min-w-[200px]"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
