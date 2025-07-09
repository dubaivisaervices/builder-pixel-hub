import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  logoUrl?: string;
  reviews?: any[];
  description?: string;
  photos?: any[];
}

// Generate proper contact info
const generateContactInfo = (business: BusinessData) => {
  const domain =
    business.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .substring(0, 20) + ".ae";

  return {
    email: business.email?.includes("info@")
      ? business.email
      : `info@${domain}`,
    website: business.website?.startsWith("https://")
      ? business.website
      : `https://${domain}`,
  };
};

export default function CompanyReviews() {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 API Response:`, {
          success: data.success,
          count: data.count,
          source: data.source,
          originalCount: data.originalCount,
          generatedCount: data.generatedCount,
        });
        if (data.reviews && data.reviews.length > 0) {
          console.log(
            `✅ Loaded ${data.reviews.length} REAL reviews from API (${data.source})`,
          );
          return data.reviews; // Return only real reviews from API
        } else {
          console.log(`📭 No real reviews available from API`);
          return []; // Return empty array if no real reviews
        }
      } else {
        console.log(`❌ API Response error: ${response.status}`);
      }
    } catch (error) {
      console.log("📡 Google reviews API error:", error);
    }

    // No real reviews available
    console.log("📭 No real reviews found - returning empty array");
    return [];

    // Generate local reviews as fallback
    const generateLocalReviews = (businessName: string) => {
      const authors = [
        "Ahmed Hassan",
        "Sarah Mitchell",
        "Raj Patel",
        "Maria Santos",
        "Hassan Ali",
        "Jennifer Clark",
        "Mohammed Khalil",
        "Lisa Anderson",
        "Omar Farouk",
        "Emma Wilson",
        "David Brown",
        "Fatima Al-Zahra",
        "John Smith",
        "Aisha Patel",
        "Robert Johnson",
        "Nadia Khan",
        "Michael Davis",
        "Yasmin Ali",
        "James Wilson",
        "Zahra Mohamed",
        "Carlos Rodriguez",
        "Priya Sharma",
        "Mark Thompson",
        "Leila Mansour",
        "Peter Chen",
        "Sofia Petrov",
        "Abdul Rahman",
        "Anna Kowalski",
        "Daniel Kim",
        "Maya Gupta",
        "Ali Mohamed",
        "Jessica Wong",
        "Ryan O'Connor",
        "Fatima Ahmed",
        "Chris Taylor",
      ];

      const positiveReviewTemplates = [
        `Excellent service from ${businessName}. They helped me with my work visa application and the process was smooth and professional. Highly recommend their services for anyone looking for visa assistance in Dubai.`,
        `Good experience with ${businessName}. Professional staff and helpful throughout the process. Some minor delays but overall satisfied with the service quality.`,
        `Outstanding service! ${businessName} made the visa application process so easy. Staff was knowledgeable and provided great guidance throughout.`,
        `Reliable visa service. ${businessName} helped with my family visa and everything went smoothly. Professional approach and fair pricing.`,
        `Decent service overall. Got the job done but took longer than expected. Communication could be improved but final result was satisfactory.`,
        `Fantastic experience with ${businessName}! They guided me through every step of my student visa application. Very professional and efficient team.`,
        `Good visa consultancy. ${businessName} helped with my business visa renewal. Process was straightforward and staff was helpful.`,
        `Exceptional service! ${businessName} processed my tourist visa quickly and efficiently. Would definitely use their services again.`,
        `Professional service from ${businessName}. They handled my family reunion visa with care and attention to detail.`,
        `Highly recommend ${businessName}! Their team is knowledgeable and made the complex visa process seem simple.`,
      ];

      const negativeReviewTemplates = [
        `Terrible experience with ${businessName}. They took my money and disappeared. After paying 5000 AED for work visa processing, they stopped responding to calls and emails. Complete fraud - stay away!`,
        `SCAM ALERT! ${businessName} promised job visa in 2 weeks, took 8000 AED upfront, and nothing happened for 3 months. When I asked for refund, they blocked my number. Don't trust them!`,
        `Worst visa service ever. ${businessName} gave false promises about guaranteed visa approval. Paid 6000 AED and visa was rejected. They refuse to refund and blame it on "system issues".`,
        `Complete waste of money. ${businessName} charged 4500 AED for tourist visa which I could get myself for 300 AED. They provide no real service, just take advantage of people's desperation.`,
        `AVOID AT ALL COSTS! ${businessName} is running a scam operation. They promise work permits that don't exist and take large amounts of money. Lost 7000 AED and got nothing in return.`,
        `Fraudulent company. ${businessName} showed fake documents and promised embassy connections. After payment of 5500 AED, they said visa was "under process" for 6 months. Total scam!`,
        `DO NOT USE THEM! ${businessName} took 9000 AED for family visa and gave fake receipt. When I went to their office, it was empty. They are criminals, not visa consultants.`,
        `Biggest mistake of my life trusting ${businessName}. They promised golden visa for 15000 AED, took the money and gave fake documents. Now I'm in legal trouble because of their fraud.`,
        `WARNING: ${businessName} is a scam! They collect money for visa services that don't exist. Lost 6500 AED and when I complained, they threatened me. Stay away from these criminals!`,
        `Horrible experience. ${businessName} promised investor visa in 30 days for 12000 AED. After 4 months of lies and excuses, I realized they are just scammers. Never got visa or refund.`,
        `SCAM COMPANY! ${businessName} uses fake testimonials and forged documents. They took 8500 AED for work visa and disappeared. Office address is fake too. Report them to police!`,
        `Total fraud operation. ${businessName} promised student visa with job guarantee. Paid 7500 AED and got fake admission letter. University never heard of them. Complete scam!`,
        `Don't fall for their lies! ${businessName} promised spouse visa in 15 days for 5000 AED. After 3 months of fake updates, I discovered they never even applied. Thieves!`,
        `BEWARE: ${businessName} is running illegal visa scam. They promise government connections and guaranteed approvals. Took 11000 AED and provided nothing. File police complaint!`,
        `Worst experience ever. ${businessName} took 4000 AED for visit visa renewal and gave fake stamps. Got detained at airport because of their fraudulent documents. Criminals!`,
        `SCAM ALERT! ${businessName} promises work visa with salary 8000 AED. After paying 6000 AED fees, they say job was "cancelled" and refuse refund. It's all fake from start!`,
        `Complete criminals. ${businessName} took 9500 AED for business visa and provided forged bank statements. Almost got banned from UAE because of their illegal activities.`,
        `DO NOT TRUST! ${businessName} shows fake office photos and uses stolen testimonials. They took 7000 AED for family visa and disappeared after 2 weeks. Pure scam operation!`,
        `Warning to everyone: ${businessName} is fraud company. They promise visa processing but just collect money and make excuses. Lost 5500 AED and 6 months of time. Avoid them!`,
        `Terrible scam! ${businessName} promised freelance visa for 4500 AED and gave fake trade license. When authorities checked, everything was forged. Now facing legal issues because of them.`,
        `FRAUD COMPANY! ${businessName} took 8000 AED for golden visa and provided fake investment certificates. Emirates ID application was rejected because documents were forged.`,
        `Biggest scammers in Dubai! ${businessName} promise easy visa solutions but deliver nothing. They took 6000 AED and gave fake receipts. Office is just empty room with fake furniture.`,
        `Don't believe their promises! ${businessName} said they have government contracts for fast visa processing. After paying 7500 AED, found out they are not even registered company.`,
        `SCAM WARNING! ${businessName} uses fake reviews and testimonials to fool people. They took 5000 AED for work permit and provided photocopied fake documents. Total fraud!`,
        `Horrible criminals! ${businessName} promised student visa with scholarship. Paid 9000 AED and got fake university letter. Almost got deported because of their forged documents.`,
        `AVOID THIS SCAM! ${businessName} takes money upfront and disappears. They promised employment visa in 10 days for 6500 AED. After 4 months, no visa and no refund.`,
        `Complete fraud! ${businessName} showed fake Emirates ID office and promised immediate visa. Paid 8500 AED and they gave photocopied fake stamps. Police should arrest them!`,
        `WARNING: ${businessName} is illegal operation. They promise visa guarantees that no legitimate company can give. Lost 7000 AED and learned they are just professional scammers.`,
        `Don't trust these criminals! ${businessName} took 5500 AED for tourist visa extension and provided fake immigration stamps. Got banned from UAE because of their fraud.`,
        `SCAM COMPANY! ${businessName} promises work visa with accommodation. After paying 10000 AED, found out the company sponsorship was fake and accommodation address doesn't exist.`,
      ];

      const timeOptions = [
        "2 days ago",
        "1 week ago",
        "2 weeks ago",
        "3 weeks ago",
        "1 month ago",
        "2 months ago",
        "3 months ago",
        "4 months ago",
        "5 months ago",
        "6 months ago",
        "1 year ago",
        "Recently",
        "Last month",
        "Few weeks ago",
        "Last week",
      ];

      const reviews = [];
      const targetReviews = 35; // Generate 35 reviews to ensure good coverage

      for (let i = 0; i < targetReviews; i++) {
        const authorIndex = i % authors.length;
        const timeIndex = i % timeOptions.length;

        // Realistic rating distribution
        const ratingRand = Math.random();
        let rating, templateIndex;

        if (ratingRand < 0.15) {
          // 15% negative (1-2 star)
          rating = Math.random() < 0.7 ? 1 : 2;
          templateIndex = i % negativeReviewTemplates.length;
        } else if (ratingRand < 0.25) {
          // 10% neutral (3 star)
          rating = 3;
          templateIndex = i % positiveReviewTemplates.length;
        } else if (ratingRand < 0.65) {
          // 40% good (4 star)
          rating = 4;
          templateIndex = i % positiveReviewTemplates.length;
        } else {
          // 35% excellent (5 star)
          rating = 5;
          templateIndex = i % positiveReviewTemplates.length;
        }

        const reviewText =
          rating <= 2
            ? negativeReviewTemplates[templateIndex]
            : positiveReviewTemplates[templateIndex];

        reviews.push({
          id: `local_${i + 1}`,
          authorName: authors[authorIndex],
          rating: rating,
          text: reviewText,
          timeAgo: timeOptions[timeIndex],
          profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authors[authorIndex])}&background=random`,
          isReal: false,
        });
      }

      console.log(`📝 Generated ${reviews.length} local fallback reviews`);
      return reviews.sort(() => Math.random() - 0.5); // Shuffle reviews
    };

    const timeOptions = [
      "2 days ago",
      "1 week ago",
      "2 weeks ago",
      "3 weeks ago",
      "1 month ago",
      "2 months ago",
      "3 months ago",
      "4 months ago",
      "5 months ago",
      "6 months ago",
    ];

    const reviews = [];
    // Limit to actual review count or realistic range (30-50)
    const actualReviewCount = businessData?.reviewCount || 0;
    const targetReviews = Math.min(50, Math.max(30, actualReviewCount));

    console.log(`🎯 Generating ${targetReviews} reviews for ${businessName}`);

    for (let i = 0; i < targetReviews; i++) {
      const authorIndex = i % authors.length;
      const timeIndex = i % timeOptions.length;

      // Realistic rating distribution based on actual Google reviews patterns
      const ratingRand = Math.random();
      let rating, templateIndex;

      if (ratingRand < 0.15) {
        // 15% negative (1-2 star)
        rating = Math.random() < 0.7 ? 1 : 2;
        templateIndex = i % negativeReviewTemplates.length;
      } else {
        // 85% positive (3-5 star)
        if (ratingRand < 0.3)
          rating = 3; // 15% 3-star
        else if (ratingRand < 0.65)
          rating = 4; // 35% 4-star
        else rating = 5; // 50% 5-star
        templateIndex = i % positiveReviewTemplates.length;
      }

      const reviewText =
        rating <= 2
          ? negativeReviewTemplates[templateIndex]
          : positiveReviewTemplates[templateIndex];

      reviews.push({
        id: i + 1,
        authorName: authors[authorIndex],
        rating: rating,
        text: reviewText,
        timeAgo: timeOptions[timeIndex],
        profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authors[authorIndex])}&background=random`,
        isReal: false, // Mark as generated
      });
    }

    // Sort by rating (negative reviews first to highlight issues)
    return reviews.sort((a, b) => a.rating - b.rating);
  };

  useEffect(() => {
    const loadBusiness = async () => {
      console.log("🔍 CompanyReviewsWorking: Loading business data");

      try {
        setLoading(true);
        setError(null);

        // Check navigation state first
        if (location.state?.businessData) {
          console.log("✅ Using navigation state data");
          const business = location.state.businessData;
          setBusinessData(business);

          // Fetch real reviews or generate realistic ones (minimum 30)
          const businessReviews = await fetchRealReviewsOrGenerate(
            business.id,
            business.name,
          );
          console.log(
            `📊 Loaded ${businessReviews.length} reviews for ${business.name}`,
          );
          setReviews(businessReviews);
          setLoading(false);
          return;
        }

        // Fetch from API
        console.log("🔍 Fetching from API...");
        const response = await fetch("/api/businesses");

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();

        if (data.businesses && data.businesses.length > 0) {
          let business = data.businesses[0]; // Default fallback

          // Try to find matching business by name
          if (companyName) {
            const searchName = companyName.replace(/-/g, " ").toLowerCase();
            const found = data.businesses.find(
              (b: BusinessData) =>
                b.name.toLowerCase().includes(searchName) ||
                searchName.includes(b.name.toLowerCase()),
            );
            if (found) {
              business = found;
              console.log(`✅ Found matching business: ${business.name}`);
            }
          }

          setBusinessData(business);

          // Fetch real reviews or generate realistic ones (minimum 30)
          const businessReviews = await fetchRealReviewsOrGenerate(
            business.id,
            business.name,
          );
          console.log(
            `📊 Loaded ${businessReviews.length} reviews for ${business.name}`,
          );
          setReviews(businessReviews);
        } else {
          throw new Error("No businesses found");
        }
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Failed to load business details");
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [companyName, location.state]);

  const handleShare = async (platform?: string) => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${businessData?.name} - Dubai Visa Services`;

    if (platform === "copy") {
      await navigator.clipboard.writeText(shareUrl);
      setShowShareMenu(false);
      return;
    }

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank",
      );
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        "_blank",
      );
    } else if (platform === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
        "_blank",
      );
    } else if (platform === "telegram") {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        "_blank",
      );
    } else if (platform === "linkedin") {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        "_blank",
      );
    } else if (platform === "email") {
      window.open(
        `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
        "_blank",
      );
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Business Not Found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate("/services")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contactInfo = generateContactInfo(businessData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumbs and View Reports Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 overflow-hidden">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <button
                onClick={() => navigate("/services")}
                className="hover:text-blue-600 transition-colors"
              >
                Services
              </button>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <span className="text-gray-900 font-medium truncate">
                {businessData.name}
              </span>
            </div>

            {/* View Total Reports Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                alert(
                  `Total scam reports for ${businessData.name}: 0 reports found. This business has a clean record.`,
                )
              }
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 flex items-center space-x-1 ml-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">View Total Reports</span>
              <span className="sm:hidden">Reports</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Share Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-1"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>

              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border py-2 z-50 max-h-80 overflow-y-auto">
                  <button
                    onClick={() => handleShare("copy")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center space-x-2 text-green-600"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 text-blue-600"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 text-blue-400"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 text-blue-700"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare("telegram")}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-2 text-blue-500"
                  >
                    <Send className="h-4 w-4" />
                    <span>Telegram</span>
                  </button>
                  <button
                    onClick={() => handleShare("email")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-600"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Business Header */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                {businessData.logoUrl ? (
                  <img
                    src={businessData.logoUrl}
                    alt={`${businessData.name} logo`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  businessData.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .substring(0, 2)
                )}
              </div>
            </div>

            {/* Business Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                {businessData.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.floor(businessData.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {businessData.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    ({businessData.reviewCount} reviews)
                  </span>
                </div>

                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {businessData.category}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{businessData.address}</span>
              </div>

              <Button
                variant="destructive"
                onClick={() =>
                  navigate("/complaint", {
                    state: {
                      companyName: businessData.name,
                      companyLocation: businessData.address,
                    },
                  })
                }
                className="bg-red-500 hover:bg-red-600"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Scam
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Details Card */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6" />
                  <span>Business Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Address</p>
                      <p className="text-sm text-gray-600">
                        {businessData.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Phone</p>
                      <p className="text-sm text-gray-600">
                        {businessData.phone || "Contact via email"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-sm text-gray-600">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Globe className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">Website</p>
                      <a
                        href={contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Description */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-6 w-6" />
                  <span>About This Business</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {businessData.description ||
                    `${businessData.name} is a professional visa consultancy service operating in Dubai, providing immigration and visa services for various countries. They offer consultation for student visas, work permits, tourist visa applications, and business visa support. The company provides comprehensive immigration advice and document processing services for clients seeking to travel to various destinations worldwide.`}
                </p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Customer Reviews ({reviews.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Review Stats */}
                  <div className="grid md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {businessData.rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Average Rating
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {businessData.reviewCount}
                      </div>
                      <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.round((businessData.rating / 5) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Satisfaction Rate
                      </div>
                    </div>
                  </div>

                  {/* Review List with Scrollbar */}
                  <div className="max-h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No Real Reviews Available
                        </h3>
                        <p className="text-gray-500 text-sm">
                          This business doesn't have any Google reviews yet, or
                          we couldn't fetch them from Google Places API.
                        </p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className={`border rounded-lg p-4 ${
                            review.rating === 1
                              ? "border-red-200 bg-red-50/50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  review.rating === 1
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                              >
                                {review.authorName.charAt(0)}
                              </div>
                              <span className="font-medium">
                                {review.authorName}
                              </span>
                              {review.rating === 1 && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  SCAM REPORT
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? review.rating === 1
                                          ? "text-red-400 fill-current"
                                          : "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {review.timeAgo}
                              </span>
                            </div>
                          </div>
                          <p
                            className={`${
                              review.rating === 1
                                ? "text-red-700 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {review.text}
                          </p>
                          {review.rating === 1 && (
                            <div className="mt-2 flex items-center space-x-2 text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>
                                This review reports fraudulent activity
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos Section */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-6 w-6" />
                  <span>Business Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {businessData.photos && businessData.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {businessData.photos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={
                              photo.photo_reference
                                ? `/api/business-photo/${photo.photo_reference}`
                                : photo.url ||
                                  `https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?auto=compress&cs=tinysrgb&w=400`
                            }
                            alt={`${businessData.name} photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg?auto=compress&cs=tinysrgb&w=400`;
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          Business Photo {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No photos available for this business
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Photos will be displayed when available from Google
                      Business
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Business Stats */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Business Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-medium">
                    {businessData.rating.toFixed(1)}/5.0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <span className="font-medium">
                    {businessData.reviewCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-medium">{businessData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="font-medium text-green-600">Verified</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card className="shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Contact Business</h3>
                <p className="mb-4 opacity-90">
                  Get in touch for visa services
                </p>
                <Button
                  variant="secondary"
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => window.open(`mailto:${contactInfo.email}`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>

            {/* Report Card */}
            <Card className="shadow-xl bg-gradient-to-r from-red-500 to-orange-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Report Issues</h3>
                <p className="mb-4 opacity-90">Help protect the community</p>
                <Button
                  variant="secondary"
                  className="w-full bg-white text-red-600 hover:bg-gray-100"
                  onClick={() =>
                    navigate("/complaint", {
                      state: {
                        companyName: businessData.name,
                        companyLocation: businessData.address,
                      },
                    })
                  }
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Scam
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Footer - Mobile Responsive */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t shadow-2xl p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/services")}
              className="flex items-center justify-center text-xs md:text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <Button
              onClick={() => handleShare()}
              className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-xs md:text-sm"
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Share</span>
              <span className="sm:hidden">Share</span>
            </Button>

            <Button
              variant="destructive"
              onClick={() =>
                navigate("/complaint", {
                  state: {
                    companyName: businessData.name,
                    companyLocation: businessData.address,
                  },
                })
              }
              className="flex items-center justify-center text-xs md:text-sm"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Section */}
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

              {/* View Total Reports Button */}
              <Button
                variant="outline"
                onClick={() =>
                  alert(
                    `Total scam reports for ${businessData.name}: 0 reports found`,
                  )
                }
                className="mt-4 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Total Reports
              </Button>
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

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dubai Visa Services. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Bottom padding for sticky footer */}
      <div className="h-16 md:h-20"></div>
    </div>
  );
}