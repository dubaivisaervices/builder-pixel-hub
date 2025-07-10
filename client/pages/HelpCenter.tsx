import React, { useState, useEffect } from "react";
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
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  BookOpen,
  Zap,
  Star,
  Globe,
  Clock,
  Award,
  PlayCircle,
  Download,
  ExternalLink,
  X,
} from "lucide-react";
import Footer from "@/components/Footer";
import GovernmentSection from "@/components/GovernmentSection";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newCompanyData, setNewCompanyData] = useState({
    name: "",
    address: "",
    city: "Dubai",
    description: "",
  });

  // Interactive typing animation for hero section
  const [displayText, setDisplayText] = useState("");
  const fullText = "How can we help you today?";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

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

  const categories = [
    { id: "all", label: "All Topics", icon: BookOpen },
    { id: "visa", label: "Visa Services", icon: FileText },
    { id: "reporting", label: "Reporting Scams", icon: Shield },
    { id: "business", label: "Business Directory", icon: Building2 },
    { id: "account", label: "Account & Support", icon: Users },
  ];

  const faqs = [
    {
      category: "visa",
      question: "How do I find legitimate visa service providers?",
      answer:
        "Use our verified Business Directory to find government-approved visa service providers. All businesses in our directory are verified through Google Business listings and comply with UAE regulations.",
    },
    {
      category: "reporting",
      question: "How do I report a fraudulent visa service?",
      answer:
        "Click on 'Report Scam' from the main menu or use the report button on any business profile. You can only report companies that are already listed in our database for accuracy.",
    },
    {
      category: "reporting",
      question: "What if the company I want to report is not in your database?",
      answer:
        "Use the 'Add New Company' feature to request adding the company to our database. Our admin team will review and verify the information before adding it to our directory.",
    },
    {
      category: "business",
      question: "How are businesses verified in your directory?",
      answer:
        "All businesses undergo a multi-step verification process including Google Business listing verification, UAE trade license verification, and compliance with Dubai Municipality standards.",
    },
    {
      category: "reporting",
      question: "Is my report anonymous and safe?",
      answer:
        "Yes, your identity is completely protected. We use advanced encryption and never share personal information. Your reports help protect the community while keeping you safe.",
    },
    {
      category: "visa",
      question: "What types of visa services can I find?",
      answer:
        "Our directory covers all UAE visa types: Tourist visas, Work permits, Student visas, Business visas, Family visas, and Golden visa services from verified providers.",
    },
    {
      category: "account",
      question: "How do I contact customer support?",
      answer:
        "You can reach us via phone (+971 4 XXX XXXX), email (support@dubaivisaservices.ae), or visit our Dubai office. We provide 24/7 support for urgent matters.",
    },
    {
      category: "business",
      question: "How often is the business directory updated?",
      answer:
        "Our directory is updated in real-time. New businesses are verified and added within 24-48 hours, and we continuously monitor existing listings for compliance.",
    },
  ];

  const quickActions = [
    {
      title: "Report Immigration Scam",
      description:
        "Protect the community by reporting fraudulent visa services",
      icon: AlertTriangle,
      color: "from-red-500 to-pink-600",
      action: () => navigate("/complaint"),
      gradient: "bg-gradient-to-r from-red-500 to-pink-600",
    },
    {
      title: "Browse Verified Businesses",
      description: "Find trusted visa service providers in Dubai",
      icon: Building2,
      color: "from-blue-500 to-indigo-600",
      action: () => navigate("/dubai-businesses"),
      gradient: "bg-gradient-to-r from-blue-500 to-indigo-600",
    },
    {
      title: "Add New Company",
      description: "Request to add a new business to our directory",
      icon: Users,
      color: "from-green-500 to-emerald-600",
      action: () => setShowAddCompanyForm(true),
      gradient: "bg-gradient-to-r from-green-500 to-emerald-600",
    },
    {
      title: "Download Resources",
      description: "Get safety guides and visa application tips",
      icon: Download,
      color: "from-purple-500 to-violet-600",
      action: () => {},
      gradient: "bg-gradient-to-r from-purple-500 to-violet-600",
    },
  ];

  const resources = [
    {
      title: "Visa Safety Guide",
      description: "Complete guide to avoid visa scams in Dubai",
      type: "PDF",
      icon: FileText,
    },
    {
      title: "Video Tutorial",
      description: "How to use our platform effectively",
      type: "Video",
      icon: PlayCircle,
    },
    {
      title: "Government Links",
      description: "Official UAE immigration resources",
      type: "Links",
      icon: ExternalLink,
    },
  ];

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const filteredFaqsBySearch = searchQuery
    ? filteredFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredFaqs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex p-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl mb-8">
              <HelpCircle className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {displayText}
              <span className="animate-pulse">|</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Get instant help, find trusted services, and protect yourself from
              immigration scams
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for help topics, FAQs, or questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg rounded-2xl border-0 bg-white/90 backdrop-blur-sm shadow-xl focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-blue-100">Support Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-blue-100">Questions Answered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="text-3xl font-bold">99%</div>
                <div className="text-blue-100">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Quick Actions Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div
                      className={`${action.gradient} p-4 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <action.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                    : "hover:scale-105"
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl mb-16">
          <CardContent className="p-8">
            {filteredFaqsBySearch.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or category filter
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqsBySearch.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      className="w-full text-left p-6 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                      onClick={() =>
                        setExpandedFaq(expandedFaq === index ? null : index)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                    {expandedFaq === index && (
                      <div className="p-6 bg-white border-t border-gray-100">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Helpful Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <resource.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {resource.description}
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {resource.type}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-white/10 backdrop-blur-lg rounded-2xl mb-6">
                <MessageCircle className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Our expert support team is available 24/7 to assist you with any
                questions or concerns
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl inline-flex mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
                <p className="text-blue-100 mb-4">24/7 Emergency Support</p>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-900 transition-all duration-300"
                >
                  +971 4 XXX XXXX
                </Button>
              </div>

              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl inline-flex mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email Support</h3>
                <p className="text-blue-100 mb-4">Response within 2 hours</p>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-900 transition-all duration-300"
                >
                  support@dubaivisaservices.ae
                </Button>
              </div>

              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl inline-flex mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Visit Our Office</h3>
                <p className="text-blue-100 mb-4">Monday - Friday, 9AM - 6PM</p>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-900 transition-all duration-300"
                >
                  Dubai, UAE
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Company Form Modal */}
      {showAddCompanyForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Company
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddCompanyForm(false)}
                  className="text-gray-500 hover:text-gray-700 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6">
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowAddCompanyForm(false)}
                  className="flex-1 rounded-xl"
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
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
                >
                  Submit to Admin
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GovernmentSection />
      <Footer />
    </div>
  );
}
