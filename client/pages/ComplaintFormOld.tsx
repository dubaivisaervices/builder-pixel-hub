import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Shield,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Camera,
  Globe,
  Phone,
  Mail,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  Award,
  Clock,
  ChevronRight,
  Home,
} from "lucide-react";

interface LocationState {
  companyName: string;
  companyLocation: string;
}

export default function ComplaintForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Form state
  const [formData, setFormData] = useState({
    companyName: state?.companyName || "",
    companyLocation: state?.companyLocation || "",
    companyWebsite: "",
    companyEmail: "",
    companyPhone: "",
    country: "",
    visaType: "",
    issueType: "",
    scamDescription: "",
    amountLost: "",
    incidentDate: "",
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
    reporterCountry: "",
  });

  const [files, setFiles] = useState({
    paymentReceipt: null as File | null,
    agreementDocument: null as File | null,
    companyPhoto: null as File | null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Company verification states
  const [companyExists, setCompanyExists] = useState<boolean | null>(null);
  const [verifiedCompany, setVerifiedCompany] = useState<any>(null);
  const [isCheckingCompany, setIsCheckingCompany] = useState(false);
  const [showAddCompanyDialog, setShowAddCompanyDialog] = useState(false);
  const [addCompanySubmitted, setAddCompanySubmitted] = useState(false);

  // Animation states
  const [fadeIn, setFadeIn] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    setTimeout(() => setSlideIn(true), 200);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const checkCompanyInDatabase = async (companyName: string) => {
    if (!companyName.trim()) return;

    setIsCheckingCompany(true);
    try {
      const response = await fetch("/api/companies/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      const data = await response.json();

      if (data.exists) {
        setCompanyExists(true);
        setVerifiedCompany(data.company);
        console.log("✅ Company found:", data.company);
      } else {
        setCompanyExists(false);
        setVerifiedCompany(null);
        console.log("❌ Company not found");
      }
    } catch (error) {
      console.error("Error checking company:", error);
      setCompanyExists(false);
    } finally {
      setIsCheckingCompany(false);
    }
  };

  const handleAddNewCompany = async () => {
    try {
      const response = await fetch("/api/companies/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          companyLocation: formData.companyLocation,
          companyWebsite: formData.companyWebsite,
          companyEmail: formData.companyEmail,
          companyPhone: formData.companyPhone,
          reporterName: formData.reporterName,
          reporterEmail: formData.reporterEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAddCompanySubmitted(true);
        setShowAddCompanyDialog(false);
        alert(
          "Company submitted for admin approval! You'll be notified in 24-48 hours.",
        );
      }
    } catch (error) {
      console.error("Error adding company:", error);
      alert("Failed to submit company. Please try again.");
    }
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName.trim()) {
        errors.companyName = "Company name is required";
      }
      if (!formData.companyLocation.trim()) {
        errors.companyLocation = "Company location is required";
      }
      if (!formData.country.trim()) {
        errors.country = "Country is required";
      }
      if (!formData.visaType.trim()) {
        errors.visaType = "Visa type is required";
      }
      if (!formData.issueType.trim()) {
        errors.issueType = "Issue type is required";
      }
    }

    if (step === 2) {
      if (!formData.scamDescription.trim()) {
        errors.scamDescription = "Description is required";
      }
      if (!formData.incidentDate.trim()) {
        errors.incidentDate = "Incident date is required";
      }
    }

    if (step === 3) {
      if (!formData.reporterName.trim()) {
        errors.reporterName = "Your name is required";
      }
      if (!formData.reporterEmail.trim()) {
        errors.reporterEmail = "Your email is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    "Company Information",
    "Incident Details",
    "Your Information",
    "Evidence Upload",
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <div
          className={`transform transition-all duration-1000 ${fadeIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
            <CardContent className="pt-8 text-center">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Report Submitted Successfully!
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  Thank you for helping protect the immigration community. Your
                  report has been recorded and will be reviewed by our team.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    What happens next?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Our team will review your report within 24-48 hours</li>
                    <li>We will verify the information provided</li>
                    <li>If approved, your report will be published</li>
                    <li>You will receive an email confirmation</li>
                  </ul>
                </div>
                <Button
                  onClick={() => navigate("/")}
                  className="mt-6"
                  size="lg"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 font-medium">Report Scam</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;

              return (
                <div
                  key={stepNum}
                  className={`flex items-center ${index < stepTitles.length - 1 ? "flex-1" : ""}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                            ? "border-blue-500 text-blue-500 bg-blue-50"
                            : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium hidden sm:block ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Step {currentStep}: {stepTitles[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Company Information + Issue Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <div className="relative">
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => {
                          handleInputChange("companyName", e.target.value);
                          // Reset verification when name changes
                          setCompanyExists(null);
                          setVerifiedCompany(null);
                        }}
                        onBlur={() =>
                          checkCompanyInDatabase(formData.companyName)
                        }
                        className={
                          formErrors.companyName ? "border-red-500" : ""
                        }
                        placeholder="Enter company name"
                      />
                      {isCheckingCompany && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>

                    {/* Company verification status */}
                    {companyExists === true && verifiedCompany && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            Company found in our database
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-green-600">
                          {verifiedCompany.name} - {verifiedCompany.address}
                        </div>
                      </div>
                    )}

                    {companyExists === false && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-700 font-medium">
                              Company not found in our database
                            </span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddCompanyDialog(true)}
                            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                          >
                            Add Company
                          </Button>
                        </div>
                        <div className="mt-1 text-xs text-yellow-600">
                          Add this company for admin review to submit your
                          report
                        </div>
                      </div>
                    )}

                    {formErrors.companyName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyLocation">Company Location *</Label>
                    <Input
                      id="companyLocation"
                      value={formData.companyLocation}
                      onChange={(e) =>
                        handleInputChange("companyLocation", e.target.value)
                      }
                      className={
                        formErrors.companyLocation ? "border-red-500" : ""
                      }
                      placeholder="Enter company location"
                    />
                    {formErrors.companyLocation && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.companyLocation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Country/Destination *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        handleInputChange("country", value)
                      }
                    >
                      <SelectTrigger
                        className={formErrors.country ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uae">UAE</SelectItem>
                        <SelectItem value="usa">USA</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="germany">Germany</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Visa Type *</Label>
                    <Select
                      value={formData.visaType}
                      onValueChange={(value) =>
                        handleInputChange("visaType", value)
                      }
                    >
                      <SelectTrigger
                        className={formErrors.visaType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select visa type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tourist">Tourist Visa</SelectItem>
                        <SelectItem value="work">Work Visa</SelectItem>
                        <SelectItem value="student">Student Visa</SelectItem>
                        <SelectItem value="business">Business Visa</SelectItem>
                        <SelectItem value="family">Family Visa</SelectItem>
                        <SelectItem value="residence">
                          Residence Visa
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.visaType && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.visaType}
                      </p>
                    )}
                  </div>
                </div>

                {/* New Issue Type Field */}
                <div>
                  <Label>Type of Issue *</Label>
                  <Select
                    value={formData.issueType}
                    onValueChange={(value) =>
                      handleInputChange("issueType", value)
                    }
                  >
                    <SelectTrigger
                      className={formErrors.issueType ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select type of issue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scam">Scam / Fraud</SelectItem>
                      <SelectItem value="poor_service">Poor Service</SelectItem>
                      <SelectItem value="hidden_fees">Hidden Fees</SelectItem>
                      <SelectItem value="document_issues">
                        Document Issues
                      </SelectItem>
                      <SelectItem value="delayed_processing">
                        Delayed Processing
                      </SelectItem>
                      <SelectItem value="fake_business">
                        Fake Business
                      </SelectItem>
                      <SelectItem value="unprofessional_conduct">
                        Unprofessional Conduct
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.issueType && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.issueType}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="companyWebsite">Company Website</Label>
                    <Input
                      id="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={(e) =>
                        handleInputChange("companyWebsite", e.target.value)
                      }
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      value={formData.companyEmail}
                      onChange={(e) =>
                        handleInputChange("companyEmail", e.target.value)
                      }
                      placeholder="info@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      value={formData.companyPhone}
                      onChange={(e) =>
                        handleInputChange("companyPhone", e.target.value)
                      }
                      placeholder="+971 4 XXX XXXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="scamDescription">
                    Describe what happened *
                  </Label>
                  <Textarea
                    id="scamDescription"
                    value={formData.scamDescription}
                    onChange={(e) =>
                      handleInputChange("scamDescription", e.target.value)
                    }
                    className={
                      formErrors.scamDescription ? "border-red-500" : ""
                    }
                    placeholder="Please provide detailed information about the incident..."
                    rows={6}
                  />
                  {formErrors.scamDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.scamDescription}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="amountLost">Amount Lost (if any)</Label>
                    <Input
                      id="amountLost"
                      value={formData.amountLost}
                      onChange={(e) =>
                        handleInputChange("amountLost", e.target.value)
                      }
                      placeholder="e.g., AED 5,000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="incidentDate">
                      When did this happen? *
                    </Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) =>
                        handleInputChange("incidentDate", e.target.value)
                      }
                      className={
                        formErrors.incidentDate ? "border-red-500" : ""
                      }
                    />
                    {formErrors.incidentDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.incidentDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Your Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="reporterName">Your Name *</Label>
                    <Input
                      id="reporterName"
                      value={formData.reporterName}
                      onChange={(e) =>
                        handleInputChange("reporterName", e.target.value)
                      }
                      className={
                        formErrors.reporterName ? "border-red-500" : ""
                      }
                      placeholder="Enter your full name"
                    />
                    {formErrors.reporterName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.reporterName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="reporterEmail">Your Email *</Label>
                    <Input
                      id="reporterEmail"
                      type="email"
                      value={formData.reporterEmail}
                      onChange={(e) =>
                        handleInputChange("reporterEmail", e.target.value)
                      }
                      className={
                        formErrors.reporterEmail ? "border-red-500" : ""
                      }
                      placeholder="your.email@example.com"
                    />
                    {formErrors.reporterEmail && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.reporterEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="reporterPhone">Your Phone</Label>
                    <Input
                      id="reporterPhone"
                      value={formData.reporterPhone}
                      onChange={(e) =>
                        handleInputChange("reporterPhone", e.target.value)
                      }
                      placeholder="+971 50 XXX XXXX"
                    />
                  </div>

                  <div>
                    <Label>Your Country</Label>
                    <Select
                      value={formData.reporterCountry}
                      onValueChange={(value) =>
                        handleInputChange("reporterCountry", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uae">UAE</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="pakistan">Pakistan</SelectItem>
                        <SelectItem value="philippines">Philippines</SelectItem>
                        <SelectItem value="bangladesh">Bangladesh</SelectItem>
                        <SelectItem value="egypt">Egypt</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Evidence Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Supporting Documents (Optional)
                  </h3>
                  <p className="text-gray-600">
                    Please upload any evidence that supports your report
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Payment Receipt */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">
                      Payment Receipt
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload payment proof
                    </p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleFileChange(
                          "paymentReceipt",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                      id="paymentReceipt"
                    />
                    <label htmlFor="paymentReceipt">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Choose File</span>
                      </Button>
                    </label>
                    {files.paymentReceipt && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ {files.paymentReceipt.name}
                      </p>
                    )}
                  </div>

                  {/* Agreement Document */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">
                      Agreement/Contract
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload contract or agreement
                    </p>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        handleFileChange(
                          "agreementDocument",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                      id="agreementDocument"
                    />
                    <label htmlFor="agreementDocument">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Choose File</span>
                      </Button>
                    </label>
                    {files.agreementDocument && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ {files.agreementDocument.name}
                      </p>
                    )}
                  </div>

                  {/* Company Photo */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900 mb-1">
                      Company Photo
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload company/office photo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(
                          "companyPhoto",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                      id="companyPhoto"
                    />
                    <label htmlFor="companyPhoto">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">Choose File</span>
                      </Button>
                    </label>
                    {files.companyPhoto && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ {files.companyPhoto.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Important Note
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your documents will be kept confidential and used only
                        for verification purposes. We do not share personal
                        information with third parties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}

              <div className="ml-auto">
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Company Dialog */}
      <Dialog
        open={showAddCompanyDialog}
        onOpenChange={setShowAddCompanyDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Add New Company</span>
            </DialogTitle>
            <DialogDescription>
              This company will be added to our database after admin approval
              (24-48 hours).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">
                Company Details
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <strong>Name:</strong> {formData.companyName}
                </div>
                <div>
                  <strong>Location:</strong> {formData.companyLocation}
                </div>
                {formData.companyWebsite && (
                  <div>
                    <strong>Website:</strong> {formData.companyWebsite}
                  </div>
                )}
                {formData.companyEmail && (
                  <div>
                    <strong>Email:</strong> {formData.companyEmail}
                  </div>
                )}
                {formData.companyPhone && (
                  <div>
                    <strong>Phone:</strong> {formData.companyPhone}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <strong>What happens next:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Our admin team will verify this company exists</li>
                    <li>You'll receive email confirmation once approved</li>
                    <li>You can then submit your report for this company</li>
                    <li>Estimated approval time: 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAddCompanyDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNewCompany}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Submit for Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Homepage Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-20">
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
                <li>
                  <button
                    onClick={() => navigate("/services/work-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Work Visa Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services/tourist-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Tourist Visa Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services/student-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Student Visa Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services/business-visa")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Business Visa Services
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate("/complaint")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Report Scam
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/help-center")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/dubai-businesses")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Business Directory
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    All Services
                  </button>
                </li>
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

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="text-center text-gray-400">
              <p>&copy; 2024 Dubai Visa Services. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
