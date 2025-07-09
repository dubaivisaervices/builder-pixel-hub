import { useState, useEffect } from "react";
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

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.companyName.trim())
        errors.companyName = "Company name is required";
      if (!formData.companyLocation.trim())
        errors.companyLocation = "Location is required";
      if (!formData.visaType) errors.visaType = "Please select visa type";
      if (!formData.country) errors.country = "Please select country";
    } else if (step === 2) {
      if (!formData.scamDescription.trim())
        errors.scamDescription = "Please describe what happened";
      if (!formData.amountLost.trim())
        errors.amountLost = "Please specify amount lost";
      if (!formData.incidentDate)
        errors.incidentDate = "Please provide incident date";
    } else if (step === 3) {
      if (!formData.reporterName.trim())
        errors.reporterName = "Your name is required";
      if (!formData.reporterEmail.trim())
        errors.reporterEmail = "Your email is required";
      if (!formData.reporterCountry)
        errors.reporterCountry = "Please select your country";
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
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsSubmitting(false);
    setSubmitted(true);
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
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-6">
                  <div className="flex items-center justify-center space-x-2 text-green-800">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">
                      Community Guardian Badge Earned!
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Your contribution helps keep Dubai's visa services safe and
                    trustworthy.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <Button
                    onClick={() => navigate("/dubai-businesses")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    size="lg"
                  >
                    Browse Companies
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="border-2 border-gray-300 hover:border-blue-400"
                    size="lg"
                  >
                    Submit Another Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
      {/* Animated Header */}
      <div
        className={`bg-white/80 backdrop-blur-xl border-b border-red-100 shadow-xl transition-all duration-700 ${fadeIn ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 hover:bg-red-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Report Immigration Scam
                  </h1>
                  <p className="text-sm text-gray-600">
                    Help protect the community
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Community Protected</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">Fraud Prevention</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-16">
        {/* Progress Bar */}
        <div
          className={`mb-8 transition-all duration-1000 delay-300 ${slideIn ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          <div className="flex items-center justify-between mb-4">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={`flex-1 text-center ${index < stepTitles.length - 1 ? "mr-4" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentStep > index + 1
                      ? "bg-green-500 text-white shadow-lg"
                      : currentStep === index + 1
                        ? "bg-red-500 text-white shadow-lg animate-pulse"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > index + 1 ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <p
                  className={`text-xs font-medium ${currentStep >= index + 1 ? "text-gray-800" : "text-gray-400"}`}
                >
                  {title}
                </p>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / stepTitles.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card
          className={`shadow-2xl border-0 bg-white/90 backdrop-blur-xl transition-all duration-700 delay-500 ${slideIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center space-x-3">
              {currentStep === 1 && <Building className="h-6 w-6" />}
              {currentStep === 2 && <AlertTriangle className="h-6 w-6" />}
              {currentStep === 3 && <Users className="h-6 w-6" />}
              {currentStep === 4 && <Upload className="h-6 w-6" />}
              <span>{stepTitles[currentStep - 1]}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Company Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="companyName"
                        className="flex items-center space-x-2 text-sm font-semibold"
                      >
                        <Building className="h-4 w-4" />
                        <span>Company Name *</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) =>
                          handleInputChange("companyName", e.target.value)
                        }
                        placeholder="Enter company name"
                        className={`mt-2 ${formErrors.companyName ? "border-red-500" : ""}`}
                      />
                      {formErrors.companyName && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.companyName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="companyLocation"
                        className="flex items-center space-x-2 text-sm font-semibold"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Company Location *</span>
                      </Label>
                      <Input
                        id="companyLocation"
                        value={formData.companyLocation}
                        onChange={(e) =>
                          handleInputChange("companyLocation", e.target.value)
                        }
                        placeholder="Enter company address"
                        className={`mt-2 ${formErrors.companyLocation ? "border-red-500" : ""}`}
                      />
                      {formErrors.companyLocation && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.companyLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="companyWebsite"
                        className="flex items-center space-x-2 text-sm font-semibold"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </Label>
                      <Input
                        id="companyWebsite"
                        value={formData.companyWebsite}
                        onChange={(e) =>
                          handleInputChange("companyWebsite", e.target.value)
                        }
                        placeholder="Company website"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="companyEmail"
                        className="flex items-center space-x-2 text-sm font-semibold"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </Label>
                      <Input
                        id="companyEmail"
                        value={formData.companyEmail}
                        onChange={(e) =>
                          handleInputChange("companyEmail", e.target.value)
                        }
                        placeholder="Company email"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="companyPhone"
                        className="flex items-center space-x-2 text-sm font-semibold"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Phone</span>
                      </Label>
                      <Input
                        id="companyPhone"
                        value={formData.companyPhone}
                        onChange={(e) =>
                          handleInputChange("companyPhone", e.target.value)
                        }
                        placeholder="Company phone"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-semibold">
                        Country Applied For *
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          handleInputChange("country", value)
                        }
                      >
                        <SelectTrigger
                          className={`mt-2 ${formErrors.country ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uae">UAE</SelectItem>
                          <SelectItem value="usa">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                          <SelectItem value="germany">Germany</SelectItem>
                          <SelectItem value="france">France</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.country}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">
                        Visa Type *
                      </Label>
                      <Select
                        value={formData.visaType}
                        onValueChange={(value) =>
                          handleInputChange("visaType", value)
                        }
                      >
                        <SelectTrigger
                          className={`mt-2 ${formErrors.visaType ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select visa type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tourist">Tourist Visa</SelectItem>
                          <SelectItem value="work">Work Visa</SelectItem>
                          <SelectItem value="student">Student Visa</SelectItem>
                          <SelectItem value="business">
                            Business Visa
                          </SelectItem>
                          <SelectItem value="family">Family Visa</SelectItem>
                          <SelectItem value="residence">
                            Residence Visa
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.visaType && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.visaType}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Incident Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                  <div>
                    <Label
                      htmlFor="scamDescription"
                      className="flex items-center space-x-2 text-sm font-semibold"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Describe What Happened *</span>
                    </Label>
                    <Textarea
                      id="scamDescription"
                      value={formData.scamDescription}
                      onChange={(e) =>
                        handleInputChange("scamDescription", e.target.value)
                      }
                      placeholder="Please provide detailed information about the scam, including dates, promises made, and what went wrong..."
                      rows={6}
                      className={`mt-2 ${formErrors.scamDescription ? "border-red-500" : ""}`}
                    />
                    {formErrors.scamDescription && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.scamDescription}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="amountLost"
                        className="flex items-center space-x-2 text-sm font-semibold"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Amount Lost (AED) *</span>
                      </Label>
                      <Input
                        id="amountLost"
                        value={formData.amountLost}
                        onChange={(e) =>
                          handleInputChange("amountLost", e.target.value)
                        }
                        placeholder="Enter amount lost"
                        type="number"
                        className={`mt-2 ${formErrors.amountLost ? "border-red-500" : ""}`}
                      />
                      {formErrors.amountLost && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.amountLost}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="incidentDate"
                        className="flex items-center space-x-2 text-sm font-semibold"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>When Did This Happen? *</span>
                      </Label>
                      <Input
                        id="incidentDate"
                        value={formData.incidentDate}
                        onChange={(e) =>
                          handleInputChange("incidentDate", e.target.value)
                        }
                        type="date"
                        className={`mt-2 ${formErrors.incidentDate ? "border-red-500" : ""}`}
                      />
                      {formErrors.incidentDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.incidentDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-orange-800 mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">Important Tips</span>
                    </div>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>
                        • Be as specific as possible with dates and amounts
                      </li>
                      <li>
                        • Include any communication records or promises made
                      </li>
                      <li>
                        • Mention if others were affected by the same company
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Personal Information */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="reporterName"
                        className="text-sm font-semibold"
                      >
                        Your Full Name *
                      </Label>
                      <Input
                        id="reporterName"
                        value={formData.reporterName}
                        onChange={(e) =>
                          handleInputChange("reporterName", e.target.value)
                        }
                        placeholder="Enter your full name"
                        className={`mt-2 ${formErrors.reporterName ? "border-red-500" : ""}`}
                      />
                      {formErrors.reporterName && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.reporterName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="reporterEmail"
                        className="text-sm font-semibold"
                      >
                        Your Email *
                      </Label>
                      <Input
                        id="reporterEmail"
                        value={formData.reporterEmail}
                        onChange={(e) =>
                          handleInputChange("reporterEmail", e.target.value)
                        }
                        placeholder="Enter your email"
                        type="email"
                        className={`mt-2 ${formErrors.reporterEmail ? "border-red-500" : ""}`}
                      />
                      {formErrors.reporterEmail && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.reporterEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="reporterPhone"
                        className="text-sm font-semibold"
                      >
                        Your Phone
                      </Label>
                      <Input
                        id="reporterPhone"
                        value={formData.reporterPhone}
                        onChange={(e) =>
                          handleInputChange("reporterPhone", e.target.value)
                        }
                        placeholder="Enter your phone number"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">
                        Your Country *
                      </Label>
                      <Select
                        value={formData.reporterCountry}
                        onValueChange={(value) =>
                          handleInputChange("reporterCountry", value)
                        }
                      >
                        <SelectTrigger
                          className={`mt-2 ${formErrors.reporterCountry ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uae">UAE</SelectItem>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="pakistan">Pakistan</SelectItem>
                          <SelectItem value="bangladesh">Bangladesh</SelectItem>
                          <SelectItem value="philippines">
                            Philippines
                          </SelectItem>
                          <SelectItem value="egypt">Egypt</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.reporterCountry && (
                        <p className="text-red-500 text-xs mt-1">
                          {formErrors.reporterCountry}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 text-blue-800 mb-2">
                      <Shield className="h-5 w-5" />
                      <span className="font-semibold">Privacy & Security</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your personal information is encrypted and secured. We
                      only use it to process your report and may contact you for
                      additional information if needed.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: File Upload */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                  <p className="text-gray-600 mb-6">
                    Upload any supporting documents to strengthen your report.
                    All files are optional but recommended.
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        key: "paymentReceipt",
                        label: "Payment Receipt/Bank Transfer",
                        icon: FileText,
                        desc: "Proof of payment to the company",
                      },
                      {
                        key: "agreementDocument",
                        label: "Agreement/Contract",
                        icon: FileText,
                        desc: "Any signed agreements or contracts",
                      },
                      {
                        key: "companyPhoto",
                        label: "Company Photos",
                        icon: Camera,
                        desc: "Photos of office, business cards, etc.",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <item.icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {item.label}
                            </h4>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                          <div>
                            <input
                              type="file"
                              id={item.key}
                              onChange={(e) =>
                                handleFileChange(
                                  item.key,
                                  e.target.files?.[0] || null,
                                )
                              }
                              className="hidden"
                              accept="image/*,.pdf,.doc,.docx"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document.getElementById(item.key)?.click()
                              }
                              className="flex items-center space-x-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>
                                {files[item.key as keyof typeof files]
                                  ? "Change File"
                                  : "Choose File"}
                              </span>
                            </Button>
                          </div>
                        </div>
                        {files[item.key as keyof typeof files] && (
                          <div className="mt-3 p-2 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800 flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>
                                File uploaded:{" "}
                                {files[item.key as keyof typeof files]?.name}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center space-x-2 ${currentStep === 1 ? "opacity-50" : ""}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg"
                  >
                    <span>Next Step</span>
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Community Impact Section */}
        <div
          className={`mt-8 mb-8 grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-700 ${slideIn ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-blue-800 mb-2">
                Community Protected
              </h3>
              <p className="text-sm text-blue-700">
                Your report helps protect thousands of visa applicants
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-bold text-orange-800 mb-2">
                Fraud Prevention
              </h3>
              <p className="text-sm text-orange-700">
                Help us identify and stop fraudulent activities
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-green-800 mb-2">
                Make a Difference
              </h3>
              <p className="text-sm text-green-700">
                Be part of creating a safer immigration ecosystem
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
