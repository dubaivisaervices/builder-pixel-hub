import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Shield,
  Building2,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  FileText,
  Users,
  CheckCircle,
} from "lucide-react";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    address: "",
    city: "Dubai",
    description: "",
  });

  const handleAddCompanyRequest = async () => {
    try {
      const response = await fetch("/api/admin/add-company-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompanyData),
      });

      if (response.ok) {
        alert("Company addition request submitted to admin successfully!");
        setShowAddCompanyForm(false);
        setNewCompanyData({
          name: "",
          address: "",
          city: "Dubai",
          description: "",
        });
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting company request:", error);
      alert("Failed to submit request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 hover:bg-blue-50"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
              <p className="text-gray-600">
                Get help and support for our platform
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <HelpCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions, report issues, or request new
            business listings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-8" onClick={() => navigate("/complaint")}>
              <div className="text-center">
                <div className="bg-red-100 p-4 rounded-2xl inline-flex mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Report Scam
                </h3>
                <p className="text-gray-600">
                  Report fraudulent visa services to protect the community
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white/70 backdrop-blur-sm">
            <CardContent
              className="p-8"
              onClick={() => setShowAddCompanyForm(true)}
            >
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-2xl inline-flex mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Add New Company
                </h3>
                <p className="text-gray-600">
                  Request to add a new visa service company to our directory
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white/70 backdrop-blur-sm">
            <CardContent
              className="p-8"
              onClick={() => navigate("/dubai-businesses")}
            >
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-2xl inline-flex mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Browse Directory
                </h3>
                <p className="text-gray-600">
                  View all verified visa service providers in Dubai
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I report a fraudulent visa service?
                </h3>
                <p className="text-gray-600">
                  Use our Report Scam feature on the homepage or click the
                  "Report Scam" button above. You can only report companies that
                  are already listed in our database.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What if the company I want to report is not in your database?
                </h3>
                <p className="text-gray-600">
                  If the company is not found, you can request to add it to our
                  database using the "Add New Company" form. An admin will
                  review and add it if it meets our criteria.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How are businesses verified?
                </h3>
                <p className="text-gray-600">
                  All businesses in our directory are verified through Google
                  Business listings and must comply with UAE government
                  regulations and Dubai municipality standards.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is my report anonymous?
                </h3>
                <p className="text-gray-600">
                  Yes, your identity is protected when reporting suspicious
                  activities. We only use your report information to investigate
                  and verify claims.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
          <CardContent className="p-8">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-6">Still need help?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="bg-white/10 p-3 rounded-xl inline-flex mb-3">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-blue-100">+971 4 XXX XXXX</p>
                </div>
                <div>
                  <div className="bg-white/10 p-3 rounded-xl inline-flex mb-3">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-blue-100">support@dubaivisaservices.ae</p>
                </div>
                <div>
                  <div className="bg-white/10 p-3 rounded-xl inline-flex mb-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Office Location</h3>
                  <p className="text-blue-100">Dubai, UAE</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Company Form Modal */}
      {showAddCompanyForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Company
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddCompanyForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      Submit a request to add a new visa service company. Our
                      admin team will review and verify the information before
                      adding it to our directory.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    value={newCompanyData.name}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter complete company name"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <Input
                    type="text"
                    value={newCompanyData.address}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter complete address"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={newCompanyData.city}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        city: e.target.value,
                      })
                    }
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newCompanyData.description}
                    onChange={(e) =>
                      setNewCompanyData({
                        ...newCompanyData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description about the company services..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCompanyForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCompanyRequest}
                  disabled={
                    !newCompanyData.name ||
                    !newCompanyData.address ||
                    !newCompanyData.city
                  }
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  Submit to Admin
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
