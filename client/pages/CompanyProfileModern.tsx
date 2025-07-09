import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GoogleReviewsWidget from "@/components/GoogleReviewsWidget";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Star,
  Globe,
  Phone,
  Mail,
  Building2,
  Users,
  MessageSquare,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Camera,
  Shield,
  ExternalLink,
  Home,
  ChevronRight,
  Clock,
  Award,
  TrendingUp,
  Send,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Heart,
  BookmarkPlus,
  MoreHorizontal,
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Verified,
  Navigation,
  Download,
  Printer,
  Filter,
  SortDesc,
  ChevronDown,
  ImageIcon,
  Video,
  FileText,
  UserCheck,
  TrendingDown,
  UserX,
  Briefcase,
  MapPinned,
  CreditCard,
  HelpCircle,
  MessageCircleQuestion,
  Headphones,
  Mail as MailIcon,
  PhoneCall,
} from "lucide-react";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  timeAgo: string;
  profilePhotoUrl?: string;
}

interface BusinessData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus?: string;
  photoReference?: string;
  logoUrl?: string;
  reviews?: Review[];
  hours?: any;
  photos?: any[];
  description?: string;
  services?: string[];
  established?: string;
  license?: string;
  languages?: string[];
}

interface ReportFormData {
  reportType: "scam" | "fraud" | "poor_service" | "fake_business" | "other";
  description: string;
  evidence?: File;
  contactInfo: string;
}

const generateContactInfo = (business: BusinessData) => {
  const domain =
    business.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .substring(0, 20) + ".ae";

  return {
    email: business.email?.includes("@") ? business.email : `info@${domain}`,
    website: business.website?.startsWith("http")
      ? business.website
      : `https://www.${domain}`,
  };
};

export default function CompanyProfileModern() {
  const { location: locationParam, companyName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportForm, setReportForm] = useState<ReportFormData>({
    reportType: "scam",
    description: "",
    contactInfo: "",
  });
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample enhanced business data - in real app this would come from API
  const sampleBusinessData: BusinessData = {
    id: "sample-business-1",
    name: "Cross Border Visa Services LLC",
    address:
      "Office 1205, Al Attar Business Tower, Sheikh Zayed Road, Dubai, UAE",
    phone: "+971 4 321 5432",
    website: "https://crossbordervisaservices.ae",
    email: "info@crossbordervisaservices.ae",
    location: { lat: 25.2048, lng: 55.2708 },
    rating: 4.6,
    reviewCount: 127,
    category: "Visa Services",
    businessStatus: "OPERATIONAL",
    logoUrl: "/api/placeholder/120/120",
    description:
      "Professional visa and immigration services with over 10 years of experience. We specialize in UAE visas, work permits, family visas, and business setup services. Our certified consultants provide personalized assistance for all your immigration needs.",
    services: [
      "Work Visa Processing",
      "Tourist Visa Services",
      "Family Visa Applications",
      "Business Visa Assistance",
      "Visa Renewal Services",
      "Document Attestation",
      "Emirates ID Services",
      "PRO Services",
    ],
    established: "2014",
    license: "MOHRE License #12345",
    languages: ["English", "Arabic", "Hindi", "Urdu"],
    hours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed",
    },
    photos: [
      { id: 1, url: "/api/placeholder/400/300", caption: "Office Reception" },
      { id: 2, url: "/api/placeholder/400/300", caption: "Consultation Room" },
      {
        id: 3,
        url: "/api/placeholder/400/300",
        caption: "Documents Processing Area",
      },
      { id: 4, url: "/api/placeholder/400/300", caption: "Team Photo" },
    ],
  };

  useEffect(() => {
    // In real app, fetch business data from API based on params
    setBusinessData(sampleBusinessData);
    setLoading(false);
  }, [locationParam, companyName]);

  const handleReportSubmit = async () => {
    try {
      // Submit report form
      console.log("Submitting report:", reportForm);
      setIsReportDialogOpen(false);
      alert(
        "Report submitted successfully. We will review it within 24-48 hours.",
      );
    } catch (error) {
      alert("Failed to submit report. Please try again.");
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${businessData?.name} - ${businessData?.category} services in Dubai`;

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
          "_blank",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        break;
    }
    setShareMenuOpen(false);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "operational":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            ✅ Verified & Active
          </Badge>
        );
      case "temporarily_closed":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            ⚠️ Temporarily Closed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            ℹ️ Status Unknown
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Company Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The company profile you're looking for doesn't exist or has been
              removed.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contactInfo = generateContactInfo(businessData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="flex items-center space-x-2 text-white/80 text-sm mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1"
            >
              <Home className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-4 w-4" />
            <Button
              variant="ghost"
              onClick={() => navigate("/services")}
              className="text-white/80 hover:text-white hover:bg-white/10 px-2 py-1"
            >
              Services
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">
              {businessData.category}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Company Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-white rounded-2xl p-3 shadow-lg flex-shrink-0">
                  {businessData.logoUrl ? (
                    <img
                      src={businessData.logoUrl}
                      alt={`${businessData.name} logo`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {businessData.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                    {businessData.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {businessData.category}
                    </Badge>
                    {getStatusBadge(businessData.businessStatus || "")}
                    {businessData.established && (
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        Est. {businessData.established}
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= businessData.rating
                              ? "text-yellow-400 fill-current"
                              : "text-white/40"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-semibold text-white">
                      {businessData.rating.toFixed(1)}
                    </span>
                    <span className="text-white/80">
                      ({businessData.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-2 text-white/90">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">
                  {businessData.address}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`${bookmarked ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"} text-white border-0 backdrop-blur-sm`}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${bookmarked ? "fill-current" : ""}`}
                  />
                  {bookmarked ? "Saved" : "Save"}
                </Button>

                <div className="relative">
                  <Button
                    onClick={() => setShareMenuOpen(!shareMenuOpen)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  {shareMenuOpen && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border p-2 z-50 min-w-[160px]">
                      <button
                        onClick={() => handleShare("whatsapp")}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare("facebook")}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare("twitter")}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare("copy")}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Copy className="h-4 w-4 mr-2 text-gray-600" />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() =>
                  window.open(`tel:${businessData.phone}`, "_self")
                }
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-white shadow-sm border">
                <TabsTrigger value="overview" className="text-xs lg:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs lg:text-sm">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="photos" className="text-xs lg:text-sm">
                  Photos
                </TabsTrigger>
                <TabsTrigger value="services" className="text-xs lg:text-sm">
                  Services
                </TabsTrigger>
                <TabsTrigger
                  value="hours"
                  className="text-xs lg:text-sm hidden lg:block"
                >
                  Hours
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="text-xs lg:text-sm hidden lg:block"
                >
                  Contact
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span>About This Business</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {businessData.description ||
                        "Professional services provider specializing in comprehensive solutions for all your business needs."}
                    </p>

                    {businessData.languages && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Languages Spoken:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {businessData.languages.map((lang, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {businessData.license && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>{businessData.license}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Key Features */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Why Choose Us</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Verified className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">Government Licensed</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Expert Consultants</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <span className="text-sm">Fast Processing</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm">100% Success Rate</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Reviews Widget */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span>Customer Reviews</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GoogleReviewsWidget placeId={businessData.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-600" />
                        <span>Customer Reviews</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <SortDesc className="h-4 w-4 mr-2" />
                          Sort
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GoogleReviewsWidget placeId={businessData.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="h-5 w-5 text-purple-600" />
                      <span>Photo Gallery</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {businessData.photos && businessData.photos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {businessData.photos.map((photo, index) => (
                          <div
                            key={photo.id}
                            className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square"
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setImageGalleryOpen(true);
                            }}
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                                {photo.caption}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No photos available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <span>Our Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {businessData.services &&
                    businessData.services.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {businessData.services.map((service, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{service}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Services information not available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hours Tab */}
              <TabsContent value="hours">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span>Business Hours</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {businessData.hours ? (
                      <div className="space-y-3">
                        {Object.entries(businessData.hours).map(
                          ([day, hours]) => (
                            <div
                              key={day}
                              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                            >
                              <span className="font-medium text-gray-900 capitalize">
                                {day}
                              </span>
                              <span className="text-gray-600">
                                {hours as string}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Business hours not available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PhoneCall className="h-5 w-5 text-blue-600" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <a
                            href={`tel:${businessData.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {businessData.phone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <MailIcon className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <a
                            href={`mailto:${contactInfo.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contactInfo.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Globe className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Website</p>
                          <a
                            href={contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            Visit Website
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <MapPinned className="h-5 w-5 text-red-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-gray-600 leading-relaxed">
                            {businessData.address}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MailIcon className="h-5 w-5 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Report Issues */}
            <Card className="shadow-lg border-0 bg-red-50/80 backdrop-blur-sm border-red-100">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Report Issues</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-red-700">
                  Help protect the community by reporting scams, fraud, or poor
                  service experiences.
                </p>

                <Dialog
                  open={isReportDialogOpen}
                  onOpenChange={setIsReportDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report Scam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Flag className="h-5 w-5 text-red-600" />
                        <span>Report Business Issues</span>
                      </DialogTitle>
                      <DialogDescription>
                        Help us maintain a safe community by reporting any
                        issues with this business.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Type of Issue
                        </label>
                        <Select
                          value={reportForm.reportType}
                          onValueChange={(value: any) =>
                            setReportForm({ ...reportForm, reportType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scam">Scam / Fraud</SelectItem>
                            <SelectItem value="poor_service">
                              Poor Service
                            </SelectItem>
                            <SelectItem value="fake_business">
                              Fake Business
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Description
                        </label>
                        <Textarea
                          placeholder="Please describe the issue in detail..."
                          value={reportForm.description}
                          onChange={(e) =>
                            setReportForm({
                              ...reportForm,
                              description: e.target.value,
                            })
                          }
                          className="min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Your Contact (optional)
                        </label>
                        <Input
                          placeholder="Email or phone for follow-up"
                          value={reportForm.contactInfo}
                          onChange={(e) =>
                            setReportForm({
                              ...reportForm,
                              contactInfo: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setIsReportDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleReportSubmit}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          disabled={!reportForm.description.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <MessageCircleQuestion className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </CardContent>
            </Card>

            {/* Trust & Safety */}
            <Card className="shadow-lg border-0 bg-blue-50/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">
                  Trust & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Verified Business License</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>Government Registered</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                  <span>Customer Verified</span>
                </div>

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-600 border-blue-200"
                >
                  <Info className="h-4 w-4 mr-2" />
                  View Safety Tips
                </Button>
              </CardContent>
            </Card>

            {/* Similar Businesses */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Similar Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        VS
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Visa Services Pro</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            4.5 (89 reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Header */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Company Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {businessData.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .substring(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">
                  {businessData.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600">
                    {businessData.rating} ({businessData.reviewCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportDialogOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hidden sm:flex"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Report
              </Button>

              <Button variant="outline" size="sm" className="hidden sm:flex">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>

              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() =>
                  window.open(`tel:${businessData.phone}`, "_self")
                }
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>

              {/* Mobile Menu */}
              <div className="sm:hidden">
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Padding for Fixed Header */}
      <div className="h-20"></div>
    </div>
  );
}
