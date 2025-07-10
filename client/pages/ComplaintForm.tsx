import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GovernmentSection from "@/components/GovernmentSection";
import Footer from "@/components/Footer";
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
  X,
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
  reporterPhone: string;
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
    reporterPhone: "",
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
        reportData.reporterPhone,
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
      if (
        reportData.reporterName &&
        reportData.reporterEmail &&
        reportData.reporterPhone
      )
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
      console.log("🔄 Fetching businesses for complaint form...");
      const response = await fetch("/api/dubai-visa-services?limit=1000");
      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ Successfully loaded",
          data.businesses?.length || 0,
          "businesses",
        );
        setBusinesses(data.businesses || []);
      } else {
        console.error("❌ Failed to fetch businesses:", response.status);
        // Fallback with comprehensive sample data (same as BusinessDirectory)
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
            name: "Emirates Immigration Consultants",
            address: "DIFC, Dubai, UAE",
            rating: 4.6,
            reviewCount: 89,
            category: "Immigration Services",
          },
          {
            id: "sample3",
            name: "Al Majid PRO Services",
            address: "Deira, Dubai, UAE",
            rating: 4.5,
            reviewCount: 234,
            category: "PRO Services",
          },
          {
            id: "sample4",
            name: "Perfect Connection Document Clearing",
            address: "Business Bay, Dubai, UAE",
            rating: 4.9,
            reviewCount: 312,
            category: "Document Clearing Services",
          },
          {
            id: "sample5",
            name: "Cross Border Visa Services",
            address: "Sheikh Zayed Road, Dubai, UAE",
            rating: 4.7,
            reviewCount: 198,
            category: "Visa Services",
          },
          {
            id: "sample6",
            name: "Golden Visa Services",
            address: "Downtown Dubai, UAE",
            rating: 4.6,
            reviewCount: 145,
            category: "Visa Services",
          },
          {
            id: "sample7",
            name: "Express Immigration Services",
            address: "Marina, Dubai, UAE",
            rating: 4.4,
            reviewCount: 167,
            category: "Immigration Services",
          },
          {
            id: "sample8",
            name: "Smart Business Setup",
            address: "Jumeirah Lake Towers, Dubai, UAE",
            rating: 4.5,
            reviewCount: 203,
            category: "Business Services",
          }
        ];

        console.log("🔧 Using fallback data with", fallbackBusinesses.length, "businesses");
        setBusinesses(fallbackBusinesses);
      }
    } catch (error) {
      console.error("❌ Network error fetching businesses:", error);
      // Same fallback as above
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
          name: "Emirates Immigration Consultants",
          address: "DIFC, Dubai, UAE",
          rating: 4.6,
          reviewCount: 89,
          category: "Immigration Services",
        },
        {
          id: "sample3",
          name: "Al Majid PRO Services",
          address: "Deira, Dubai, UAE",
          rating: 4.5,
          reviewCount: 234,
          category: "PRO Services",
        },
        {
          id: "sample4",
          name: "Perfect Connection Document Clearing",
          address: "Business Bay, Dubai, UAE",
          rating: 4.9,
          reviewCount: 312,
          category: "Document Clearing Services",
        },
        {
          id: "sample5",
          name: "Cross Border Visa Services",
          address: "Sheikh Zayed Road, Dubai, UAE",
          rating: 4.7,
          reviewCount: 198,
          category: "Visa Services",
        }
      ];

      console.log("🔧 Using error fallback data with", fallbackBusinesses.length, "businesses");
      setBusinesses(fallbackBusinesses);
    }
  };

    // Generate comprehensive mock data with 840+ businesses
    const businessNames = [
      "Perfect Connection Document Clearing",
      "Emirates Visa Services",
      "Dubai Immigration Consultants",
      "Golden Visa Services",
      "Al Rostamani Visa Center",
      "Smart Business Setup",
      "Express Immigration Services",
      "Professional Visa Consultancy",
      "Dubai PRO Services",
      "Elite Immigration Solutions",
      "Quick Visa Processing",
      "Trustworthy Document Services",
      "Fast Track Visas",
      "Premium Immigration Hub",
      "Reliable Visa Center",
      "Paradise Immigration",
      "Falcon Visa Services",
      "Dubai Business Hub",
      "Al Khaleej Services",
      "Crown Immigration",
      "Excellence Visa Center",
      "Royal Document Services",
      "Premier Immigration",
      "Global Visa Solutions",
      "Metro Services",
      "City Center Immigration",
      "Tower Visa Services",
      "Bridge Consultancy",
      "Summit Services",
      "Peak Immigration",
      "Prime Visa Center",
      "Alpha Document Services",
      "Beta Immigration",
      "Gamma Visa Services",
      "Delta Consultancy",
      "Epsilon Services",
      "Zeta Immigration",
      "Eta Visa Center",
      "Theta Services",
      "Iota Consultancy",
      "Kappa Immigration",
      "Lambda Services",
      "Mu Visa Center",
      "Nu Immigration",
      "Xi Services",
      "Omicron Consultancy",
      "Pi Immigration",
      "Rho Services",
      "Sigma Visa Center",
      "Tau Immigration",
      "Cross Border Visa Services",
      "Horizon Immigration",
      "Apex Visa Solutions",
      "Nexus Immigration Services",
      "Stellar Visa Center",
      "Phoenix Immigration",
      "Quantum Visa Services",
      "Crystal Immigration Hub",
      "Atlas Visa Solutions",
      "Meridian Immigration",
      "Zenith Visa Services",
      "Infinity Immigration Center",
      "Matrix Visa Solutions",
      "Vertex Immigration",
      "Pinnacle Visa Services",
      "Spectrum Immigration Hub",
      "Fusion Visa Center",
      "Catalyst Immigration",
      "Velocity Visa Services",
      "Magnitude Immigration",
      "Dynamics Visa Solutions",
      "Trajectory Immigration",
      "Momentum Visa Center",
      "Synergy Immigration Hub",
      "Impact Visa Services",
      "Leverage Immigration",
      "Maximize Visa Solutions",
      "Optimize Immigration Center",
      "Streamline Visa Services",
      "Accelerate Immigration",
      "Transform Visa Solutions",
      "Navigate Immigration Hub",
      "Compass Visa Center",
      "Pathway Immigration",
      "Gateway Visa Services",
      "Portal Immigration Solutions",
      "Access Visa Center",
      "Bridge Immigration Hub",
      "Connect Visa Services",
      "Link Immigration Solutions",
      "Network Visa Center",
      "Circuit Immigration",
      "Flow Visa Services",
      "Current Immigration Hub",
      "Wave Visa Center",
      "Tide Immigration",
      "Stream Visa Services",
      "River Immigration Solutions",
      "Ocean Visa Center",
      "Bay Immigration Hub",
      "Coast Visa Services",
      "Shore Immigration Solutions",
    ];

    const locations = [
      "Business Bay, Dubai",
      "DIFC, Dubai",
      "Downtown Dubai",
      "Jumeirah Lake Towers, Dubai",
      "Deira, Dubai",
      "Sheikh Zayed Road, Dubai",
      "Bur Dubai",
      "Marina, Dubai",
      "Karama, Dubai",
      "Al Barsha, Dubai",
      "Satwa, Dubai",
      "Al Qusais, Dubai",
      "Jumeirah, Dubai",
      "Al Wasl, Dubai",
      "Oud Metha, Dubai",
      "Al Garhoud, Dubai",
      "Port Saeed, Dubai",
      "Al Rigga, Dubai",
      "Al Fahidi, Dubai",
      "Trade Centre, Dubai",
      "Festival City, Dubai",
      "Motor City, Dubai",
      "Sports City, Dubai",
      "Silicon Oasis, Dubai",
      "International City, Dubai",
      "Discovery Gardens, Dubai",
      "Mirdif, Dubai",
      "Rashidiya, Dubai",
      "Muhaisnah, Dubai",
      "Al Mizhar, Dubai",
      "Al Warqa, Dubai",
      "Nad Al Sheba, Dubai",
      "Al Khawaneej, Dubai",
      "Hatta, Dubai",
      "Sharjah",
      "Abu Dhabi",
      "Ajman",
      "Fujairah",
      "Ras Al Khaimah",
      "Umm Al Quwain",
      "Al Ain",
    ];

    const categories = [
      "Visa Services",
      "Immigration Services",
      "Document Clearing Services",
      "PRO Services",
      "Business Services",
      "Document Services",
      "Consultation Services",
      "Legal Services",
      "Translation Services",
      "Attestation Services",
      "Licensing Services",
      "Government Relations",
    ];

    const mockBusinesses: BusinessData[] = [];

    // Generate base businesses with real names
    businessNames.forEach((baseName, index) => {
      const location = locations[index % locations.length];
      const category = categories[index % categories.length];

      mockBusinesses.push({
        id: `biz${String(index + 1).padStart(3, "0")}`,
        name: baseName,
        address: `${location}, UAE`,
        category: category,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 300) + 50,
      });
    });

    // Generate additional businesses with variations to reach 840+
    const variations = [
      "LLC",
      "FZE",
      "FZCO",
      "& Associates",
      "Consultancy",
      "Group",
      "International",
      "Limited",
      "& Co",
      "Solutions",
      "Services",
      "Center",
      "Hub",
      "Agency",
      "Company",
      "Corporation",
    ];

    const prefixes = [
      "Al",
      "Emirates",
      "Dubai",
      "UAE",
      "Gulf",
      "Middle East",
      "Arabian",
      "International",
      "Global",
      "Premier",
      "Elite",
      "Royal",
      "Crown",
      "Golden",
      "Diamond",
      "Platinum",
    ];

    // Add variations to reach 840+ businesses
    for (let i = 0; i < 25; i++) {
      businessNames.forEach((baseName, nameIndex) => {
        if (mockBusinesses.length >= 840) return;

        variations.forEach((variation, varIndex) => {
          if (mockBusinesses.length >= 840) return;

          const prefix = prefixes[(nameIndex + varIndex) % prefixes.length];
          const location =
            locations[(nameIndex + varIndex + i) % locations.length];
          const category =
            categories[(nameIndex + varIndex) % categories.length];

          const newName =
            Math.random() > 0.5
              ? `${prefix} ${baseName} ${variation}`
              : `${baseName} ${variation}`;

          mockBusinesses.push({
            id: `biz${String(mockBusinesses.length + 1).padStart(3, "0")}`,
            name: newName,
            address: `${location}, UAE`,
            category: category,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            reviewCount: Math.floor(Math.random() * 300) + 50,
          });
        });
      });
    }

    // Simulate API loading delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log("✅ Successfully loaded", mockBusinesses.length, "businesses");
    setBusinesses(mockBusinesses);
  };

  const handleCompanySearch = (value: string) => {
    setSearchTerm(value);
    setIsTyping(true);

    if (value.length >= 1) {
      const filtered = businesses
        .filter(
          (business) =>
            business.name.toLowerCase().includes(value.toLowerCase()) ||
            business.address.toLowerCase().includes(value.toLowerCase()) ||
            business.category.toLowerCase().includes(value.toLowerCase()),
        )
        .sort((a, b) => {
          // Prioritize exact matches at the beginning
          const aStartsWith = a.name
            .toLowerCase()
            .startsWith(value.toLowerCase());
          const bStartsWith = b.name
            .toLowerCase()
            .startsWith(value.toLowerCase());
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          // Then sort by rating
          return b.rating - a.rating;
        }); // Show ALL search results, no limit
      setSearchSuggestions(filtered);
      setShowSuggestions(true);

      console.log(
        `🔍 Search "${value}" found ${filtered.length} results out of ${businesses.length} total businesses`,
      );
    } else {
      // Show ALL businesses when no search term
      setSearchSuggestions(businesses); // Show ALL businesses, no slice
      setShowSuggestions(true);
      console.log(`📋 Showing ALL ${businesses.length} businesses`);
    }
  };

  const handleSearchFocus = () => {
    if (!searchTerm) {
      // Show ALL businesses when focused and no search term
      setSearchSuggestions(businesses);
      setShowSuggestions(true);
      console.log(`📋 Focus: Showing ALL ${businesses.length} businesses`);
    }
  };

  const showAllBusinesses = () => {
    setSearchSuggestions(businesses);
    setShowSuggestions(true);
    console.log(`📋 Showing ALL ${businesses.length} businesses`);
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
      <style>{`
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
              <strong>Admin Review Required:</strong> Your report and any
              uploaded files are now being reviewed by our admin team. Once
              approved, your report will be published on the company's profile
              to help protect other community members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header - Wider Professional Design */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 sm:mb-6 mx-0">
            <div className="px-6 sm:px-8 py-4 sm:py-5 max-w-5xl mx-auto bg-red-50 text-gray-800">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 text-white" />
                </div>
                <div className="ml-3 sm:ml-4 text-left flex-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    Report Scam Immigration Company
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-0.5 leading-relaxed">
                    Help protect our community by reporting scam immigration
                    companies, fake visa services, and unethical business
                    practices in Dubai and UAE.
                  </p>
                </div>
              </div>

              {/* Compact Progress Bar */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Progress
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-blue-600">
                    {Math.round(formProgress)}%
                  </span>
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold step-indicator ${
                        completedSteps.includes(step)
                          ? "completed text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {completedSteps.includes(step) ? (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      ) : (
                        step
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                <div
                  className="progress-bar h-2 sm:h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3 sm:space-y-4 md:space-y-6"
          >
            {/* Company Selection */}
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-800">
                  <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="flex-1">Step 1: Select Company</span>
                  {completedSteps.includes(1) && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                <div className="search-container">
                  <Label
                    htmlFor="company"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Search Company Name *
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      ({businesses.length} companies available)
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="company"
                      type="text"
                      placeholder="Search by company name, location, or category..."
                      value={searchTerm}
                      onChange={(e) => handleCompanySearch(e.target.value)}
                      onFocus={handleSearchFocus}
                      className={`h-11 sm:h-12 pl-10 pr-4 text-sm sm:text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all duration-300 shadow-sm hover:border-gray-400 ${isTyping ? "border-blue-400 ring-1 ring-blue-200" : ""}`}
                      required
                    />
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${isTyping ? "text-blue-500" : "text-gray-400"}`}
                    />
                  </div>

                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto backdrop-blur-sm bg-white/95">
                      {searchSuggestions.length > 0 ? (
                        <>
                          {/* Header with results count and controls */}
                          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                              {searchTerm
                                ? `${searchSuggestions.length} results found`
                                : `All ${searchSuggestions.length} companies loaded - Scroll to browse`}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSuggestions(false)}
                                className="text-gray-500 hover:text-gray-700 px-2 py-1"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Business List */}
                          {searchSuggestions.map((business, index) => (
                            <div
                              key={business.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center space-x-3 transition-colors duration-200 hover:shadow-sm"
                              onClick={() => handleCompanySelect(business)}
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
                        </>
                      ) : (
                        searchTerm.length >= 2 && (
                          <div className="p-4 text-center">
                            <div className="space-y-4">
                              <div className="flex flex-col items-center space-y-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="text-center">
                                  <h3 className="font-medium text-gray-900 text-sm">
                                    Company not found in our database
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1">
                                    "{searchTerm}" doesn't match any registered
                                    companies
                                  </p>
                                </div>
                              </div>

                              {/* Add New Company Button */}
                              <div className="space-y-3">
                                <Button
                                  onClick={() => navigate("/help-center")}
                                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium text-sm py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                  <Building2 className="h-4 w-4 mr-2" />
                                  Add New Company
                                </Button>

                                <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3 border border-blue-200">
                                  <div className="flex items-start space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-blue-800 mb-1">
                                        Need to add this company?
                                      </p>
                                      <p className="text-blue-700">
                                        Click "Add New Company" to request
                                        adding "{searchTerm}" to our database.
                                        Once approved by our admin team, you can
                                        return to file your report.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {selectedCompany && (
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                        {selectedCompany.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {selectedCompany.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {selectedCompany.address}
                          </span>
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            {selectedCompany.category}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {selectedCompany.rating} (
                              {selectedCompany.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Step 2: Report Details</span>
                  {completedSteps.includes(2) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <Upload className="h-5 w-5 text-purple-600" />
                  <span>Step 3: Upload Evidence (Optional)</span>
                  {(reportData.paymentReceipt || reportData.agreementCopy) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Payment Receipt / Invoice
                    </Label>
                    <div
                      className={`file-upload-area p-6 rounded-lg cursor-pointer text-center ${reportData.paymentReceipt ? "uploaded" : ""} ${showFilePreview.receipt ? "animate-pulse" : ""}`}
                      onClick={() => triggerFileUpload("paymentReceipt")}
                      onMouseEnter={() => setShowTooltip("receipt")}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      {reportData.paymentReceipt ? (
                        <div className="text-green-600">
                          <div className="relative">
                            <FileText className="h-10 w-10 mx-auto mb-2" />
                            {showFilePreview.receipt && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                            )}
                          </div>
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
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            ✓ Uploaded
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <Upload className="h-10 w-10 mx-auto mb-2 transition-transform duration-300 hover:scale-110" />
                          <p className="font-medium text-sm">
                            Upload Payment Receipt
                          </p>
                          <p className="text-xs text-red-600 font-medium">
                            ⚠️ Max 5MB • PNG, JPG, PDF only
                          </p>
                          {showTooltip === "receipt" && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Click to select • Admin will review
                            </div>
                          )}
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
                      className={`file-upload-area p-6 rounded-lg cursor-pointer text-center ${reportData.agreementCopy ? "uploaded" : ""} ${showFilePreview.agreement ? "animate-pulse" : ""}`}
                      onClick={() => triggerFileUpload("agreementCopy")}
                      onMouseEnter={() => setShowTooltip("agreement")}
                      onMouseLeave={() => setShowTooltip(null)}
                    >
                      {reportData.agreementCopy ? (
                        <div className="text-green-600">
                          <div className="relative">
                            <FileText className="h-10 w-10 mx-auto mb-2" />
                            {showFilePreview.agreement && (
                              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                            )}
                          </div>
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
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            ✓ Uploaded
                          </Badge>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <Upload className="h-10 w-10 mx-auto mb-2 transition-transform duration-300 hover:scale-110" />
                          <p className="font-medium text-sm">
                            Upload Agreement Copy
                          </p>
                          <p className="text-xs text-red-600 font-medium">
                            ⚠️ Max 5MB • PNG, JPG, PDF only
                          </p>
                          {showTooltip === "agreement" && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Click to select • Admin will review
                            </div>
                          )}
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

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-amber-800">
                    <strong>📁 Evidence Guidelines:</strong> Files strengthen
                    your report and go to admin for verification.
                    <span className="font-semibold text-red-700">
                      {" "}
                      Max 5MB per file.
                    </span>
                    Formats: JPEG, PNG, PDF only.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reporter Information */}
            <Card className="shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <User className="h-5 w-5 text-green-600" />
                  <span>Step 4: Your Information</span>
                  {completedSteps.includes(4) && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                {/* Confidential Notice - Moved to Top */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Your Details Are Confidential
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong>Admin Approval:</strong> All reports and files are
                    reviewed by our admin team before publication. Your personal
                    information remains strictly confidential during this
                    process. Your identity will not be disclosed to the reported
                    company.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="reporterPhone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Your Contact Number *
                    </Label>
                    <Input
                      id="reporterPhone"
                      type="tel"
                      placeholder="Enter your phone number (e.g., +971 50 123 4567)"
                      value={reportData.reporterPhone}
                      onChange={(e) =>
                        setReportData((prev) => ({
                          ...prev,
                          reporterPhone: e.target.value,
                        }))
                      }
                      className="h-11 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-3 sm:pt-4 md:pt-6">
                  <Button
                    type="submit"
                    disabled={loading || !selectedCompany}
                    className={`w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg rounded-lg min-w-[180px] sm:min-w-[200px] shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      loading ? "animate-pulse" : ""
                    } ${!selectedCompany ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Submitting...</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                          <div
                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Submit Report</span>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
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
        </div>
      </div>

      {/* Government Section */}
      <GovernmentSection />

      {/* Footer */}
      <Footer />
    </>
  );
}