import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, Shield, CheckCircle } from "lucide-react";

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
    // Personal details
    reporterName: "",
    reporterEmail: "",
    reporterPhone: "",
  });

  const [files, setFiles] = useState({
    paymentReceipt: null as File | null,
    agreementDocument: null as File | null,
    companyPhoto: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-6 text-center">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Report Submitted Successfully
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for helping protect the immigration community. Your
              report has been recorded and will be reviewed.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() =>
                  navigate(
                    `/reviews/${formData.companyLocation.toLowerCase().replace(/\s+/g, "-")}/${formData.companyName.toLowerCase().replace(/\s+/g, "-")}`,
                  )
                }
                className="w-full"
              >
                View Company Page
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">
                File Immigration Scam Report
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLocation">Location *</Label>
                  <Input
                    id="companyLocation"
                    value={formData.companyLocation}
                    onChange={(e) =>
                      handleInputChange("companyLocation", e.target.value)
                    }
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">
                    Company Website (Optional)
                  </Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://"
                    value={formData.companyWebsite}
                    onChange={(e) =>
                      handleInputChange("companyWebsite", e.target.value)
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email (Optional)</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) =>
                      handleInputChange("companyEmail", e.target.value)
                    }
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPhone">
                  Company Phone Number (Optional)
                </Label>
                <Input
                  id="companyPhone"
                  type="tel"
                  value={formData.companyPhone}
                  onChange={(e) =>
                    handleInputChange("companyPhone", e.target.value)
                  }
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Visa Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Visa & Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">Country You Applied For *</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("country", value)
                    }
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="france">France</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visaType">Visa Type *</Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("visaType", value)
                    }
                    required
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student Visa</SelectItem>
                      <SelectItem value="work">Work Visa</SelectItem>
                      <SelectItem value="tourist">Tourist Visa</SelectItem>
                      <SelectItem value="business">Business Visa</SelectItem>
                      <SelectItem value="permanent">
                        Permanent Residency
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scam Description */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Describe the Scam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="scamDescription">
                  Detailed Description of the Scam * (Max 250 words)
                </Label>
                <Textarea
                  id="scamDescription"
                  placeholder="Please provide a detailed description of how you were scammed, what promises were made, money requested, etc."
                  value={formData.scamDescription}
                  onChange={(e) =>
                    handleInputChange("scamDescription", e.target.value)
                  }
                  maxLength={1250}
                  rows={6}
                  required
                  className="resize-none"
                />
                <div className="text-right text-sm text-muted-foreground">
                  {formData.scamDescription.length}/1250 characters
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Supporting Documents (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Payment Receipt</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Drop PDF or image file
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(
                          "paymentReceipt",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                      id="paymentReceipt"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        document.getElementById("paymentReceipt")?.click()
                      }
                    >
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Agreement Document</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Drop PDF or image file
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(
                          "agreementDocument",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                      id="agreementDocument"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        document.getElementById("agreementDocument")?.click()
                      }
                    >
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Company Photo/Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Drop image file
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileChange(
                          "companyPhoto",
                          e.target.files?.[0] || null,
                        )
                      }
                      className="hidden"
                      id="companyPhoto"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        document.getElementById("companyPhoto")?.click()
                      }
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Your Contact Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Required for verification. Your information will be kept
                confidential.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reporterName">Your Name *</Label>
                  <Input
                    id="reporterName"
                    value={formData.reporterName}
                    onChange={(e) =>
                      handleInputChange("reporterName", e.target.value)
                    }
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterEmail">Your Email *</Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    value={formData.reporterEmail}
                    onChange={(e) =>
                      handleInputChange("reporterEmail", e.target.value)
                    }
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterPhone">Your Phone Number *</Label>
                <Input
                  id="reporterPhone"
                  type="tel"
                  value={formData.reporterPhone}
                  onChange={(e) =>
                    handleInputChange("reporterPhone", e.target.value)
                  }
                  required
                  className="h-11"
                />
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Or sign in with social media for faster submission
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <span>Continue with Google</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <span>Continue with Facebook</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={
                isSubmitting ||
                !formData.companyName ||
                !formData.companyLocation ||
                !formData.country ||
                !formData.visaType ||
                !formData.scamDescription ||
                !formData.reporterName ||
                !formData.reporterEmail ||
                !formData.reporterPhone
              }
              className="w-full max-w-md h-12 text-base font-medium"
            >
              {isSubmitting ? "Submitting Report..." : "Submit Report"}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            By submitting this report, you confirm that the information provided
            is accurate and agree to our terms of service.
          </div>
        </form>
      </div>
    </div>
  );
}
