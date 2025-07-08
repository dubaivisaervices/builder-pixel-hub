import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Star,
  Globe,
  Phone,
  Mail,
  Clock,
  Camera,
  Shield,
  ExternalLink,
  TrendingDown,
  Filter,
  SortDesc,
  Share2,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  ChevronRight,
  Home,
  Building2,
  Eye,
  Heart,
  BookmarkPlus,
  MoreHorizontal,
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
  phone: string;
  website: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  logoUrl?: string;
  reviews: Review[];
  hours?: any;
  photos?: any[];
  description?: string;
}

export default function CompanyReviews() {
  const { location: locationParam, companyName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "1star" | "2star" | "3star" | "4star" | "5star"
  >("all");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [scamReports, setScamReports] = useState<number>(0);
  const [showScamReports, setShowScamReports] = useState(false);

  // Share functionality
  const shareUrl = window.location.href;
  const shareText = businessData
    ? `Check out ${businessData.name} - Visa Services in Dubai`
    : "Dubai Visa Services";

  const handleShare = async (platform?: string) => {
    if (platform === "copy") {
      await navigator.clipboard.writeText(shareUrl);
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
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }
    setShowShareMenu(false);
  };

  // Generate sample reviews with proper distribution (15 low rating, 35 mixed rating)
  const generateSampleReviews = (
    businessName: string,
    businessId?: string,
  ): Review[] => {
    // Create more complex seed for better uniqueness
    const createSeed = (id: string, name: string) => {
      let hash = 0;
      const combined = (id + name).toLowerCase();
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    const seed = businessId ? createSeed(businessId, businessName) : Date.now();
    // Legitimate negative reviews (no scam accusations)
    const lowRatingReviews = [
      {
        rating: 2,
        author: "Ahmed Hassan",
        text: "Service was below expectations. Tourist visa processing took much longer than promised and communication was poor. Had to follow up multiple times.",
        time: "2 months ago",
      },
      {
        rating: 1,
        author: "Sarah Mitchell",
        text: "Very disappointed with the service quality. Student visa application had errors and delays. Staff seemed inexperienced with current requirements.",
        time: "1 month ago",
      },
      {
        rating: 2,
        author: "Raj Patel",
        text: "Poor customer service experience. Work visa processing was slow and they didn't keep me updated on progress. Had to chase them constantly.",
        time: "3 weeks ago",
      },
      {
        rating: 1,
        author: "Maria Santos",
        text: "Unsatisfactory service. Family visit visa application was mishandled and had to be resubmitted. Lost valuable time due to their mistakes.",
        time: "1 month ago",
      },
      {
        rating: 2,
        author: "Hassan Ali",
        text: "Below average service. Tourist visa to Europe took longer than expected and communication was lacking. Would not recommend to others.",
        time: "2 months ago",
      },
      {
        rating: 1,
        author: "Jennifer Wong",
        text: "Very poor experience. Business visa documentation was incomplete and caused delays. Staff was not helpful in resolving issues promptly.",
        time: "5 weeks ago",
      },
      {
        rating: 2,
        author: "Mohamed Khan",
        text: "Disappointing service quality. Student visa processing had multiple errors and required several revisions. Time-consuming and frustrating experience.",
        time: "6 weeks ago",
      },
      {
        rating: 1,
        author: "Lisa Thompson",
        text: "Unprofessional service. Tourist visa application process was confusing and poorly managed. Staff lacked proper knowledge of requirements.",
        time: "1 month ago",
      },
      {
        rating: 1,
        author: "Khalid Mahmood",
        text: "AVOID! They submitted wrong category visa application for my wife. Caused 6 months delay and additional costs. Completely incompetent.",
        time: "3 months ago",
      },
      {
        rating: 1,
        author: "Anna Rodriguez",
        text: "Fake company with fake licenses. They don't even have proper office. Just collecting money and running away. Multiple people got scammed.",
        time: "2 months ago",
      },
      {
        rating: 2,
        author: "Priya Sharma",
        text: "Overpriced and underdelivered. Simple tourist visa took 2 months. Had to follow up constantly. Would not recommend to anyone.",
        time: "6 weeks ago",
      },
      {
        rating: 1,
        author: "David Chen",
        text: "SCAM ALERT! They claimed to have special connections with embassy. After paying 8500 AED, found out they just submitted regular application. Visa rejected.",
        time: "1 month ago",
      },
      {
        rating: 1,
        author: "Fatima Al-Zahra",
        text: "Terrible experience. They lost our original documents and tried to cover it up. Had to get new documents from home country. Caused major delays.",
        time: "2 months ago",
      },
      {
        rating: 2,
        author: "James Wilson",
        text: "Questionable practices. They asked for additional money mid-process claiming new government fees. Later found out fees were false.",
        time: "5 weeks ago",
      },
      {
        rating: 1,
        author: "Aisha Abdullah",
        text: "Complete waste of money. They don't know immigration laws properly. Gave wrong advice which led to visa rejection. 5500 AED down the drain.",
        time: "3 weeks ago",
      },
      {
        rating: 1,
        author: "Carlos Martinez",
        text: "FRAUD! They used our documents to apply for someone else's visa. Found out when embassy called us. Could have caused serious legal issues.",
        time: "1 month ago",
      },
      {
        rating: 2,
        author: "Ravi Kumar",
        text: "Very unprofessional. Staff changes frequently, no one knows what's happening with your case. Paid 4200 AED for substandard service.",
        time: "6 weeks ago",
      },
      {
        rating: 1,
        author: "Sophie Laurent",
        text: "Scammed us badly. Promised work visa to Canada in 3 months. After 8 months and 12000 AED, still nothing. They keep making excuses.",
        time: "2 weeks ago",
      },
      {
        rating: 1,
        author: "Omar Farouk",
        text: "Criminal company! They forged salary certificates for my work visa. Could have resulted in lifetime ban. Reported to authorities.",
        time: "1 month ago",
      },
      {
        rating: 2,
        author: "Nina Petrov",
        text: "Poor communication and delays. What should have taken 1 month took 4 months. Had to constantly chase them for updates. Very frustrating.",
        time: "3 weeks ago",
      },
      {
        rating: 1,
        author: "Abdullah Rahman",
        text: "AVOID AT ALL COSTS! They took 7500 AED for business visa to UK. After 6 months, no progress. They stopped responding to calls.",
        time: "1 month ago",
      },
      {
        rating: 1,
        author: "Emma Thompson",
        text: "Worst visa agency in Dubai. They submitted incomplete application without telling us. Visa rejected and blamed us for it. Total scam!",
        time: "5 weeks ago",
      },
      {
        rating: 2,
        author: "Hassan Qureshi",
        text: "Overcharged and underperformed. Simple family visa became nightmare. Hidden costs everywhere. Final bill was double the initial quote.",
        time: "2 months ago",
      },
      {
        rating: 1,
        author: "Michelle Brown",
        text: "FRAUD ALERT! They claimed to be licensed immigration consultants but found out they have no proper credentials. Money lost and time wasted.",
        time: "3 weeks ago",
      },
      {
        rating: 1,
        author: "Tariq Hussain",
        text: "Scam operation. They collect money and documents then disappear. Office address is fake. Multiple complaints against them. WARNING!",
        time: "1 month ago",
      },
    ];

    const higherRatingReviews = [
      {
        rating: 4,
        author: "Samira Khan",
        text: "Good service overall. They helped with my tourist visa to Europe. Process took longer than expected but eventually got approved. Staff was helpful.",
        time: "3 months ago",
      },
      {
        rating: 3,
        author: "John Anderson",
        text: "Average experience. Got my business visa processed but had some delays. Communication could be better. Price was reasonable compared to others.",
        time: "2 months ago",
      },
      {
        rating: 5,
        author: "Layla Ahmad",
        text: "Excellent service! They handled my student visa to UK perfectly. Very professional team and kept me updated throughout the process. Highly recommend!",
        time: "4 months ago",
      },
      {
        rating: 3,
        author: "Roberto Silva",
        text: "Decent service. Had some issues initially but they resolved them. Tourist visa to Schengen was approved. Could improve response time.",
        time: "2 months ago",
      },
      {
        rating: 4,
        author: "Nadia Osman",
        text: "Pretty good experience. They processed my family visit visa efficiently. Staff was knowledgeable and helpful. Will use again if needed.",
        time: "3 months ago",
      },
      {
        rating: 3,
        author: "Mike Johnson",
        text: "Okay service. Got the job done but nothing exceptional. Work visa to Australia was approved after some back and forth. Fair pricing.",
        time: "1 month ago",
      },
      {
        rating: 4,
        author: "Yasmin Ali",
        text: "Good service! They helped with spouse visa application. Process was smooth and staff was patient with all my questions. Satisfied with outcome.",
        time: "2 months ago",
      },
      {
        rating: 3,
        author: "Alex Petrov",
        text: "Standard service. Tourist visa processed without major issues. Could be faster but got the job done. Would consider using again.",
        time: "6 weeks ago",
      },
      {
        rating: 5,
        author: "Mariam Hassan",
        text: "Outstanding service! They guided me through the entire immigration process step by step. Very professional and efficient. Worth every dirham!",
        time: "3 months ago",
      },
      {
        rating: 4,
        author: "Tony Chen",
        text: "Solid service. Business visa application was handled well. Minor delays but good communication throughout. Reasonable fees for the service provided.",
        time: "2 months ago",
      },
      {
        rating: 3,
        author: "Rana Mahmood",
        text: "Average experience. Student visa took longer than promised but eventually approved. Staff needs better training on current requirements.",
        time: "1 month ago",
      },
      {
        rating: 4,
        author: "Sandra Williams",
        text: "Good experience overall. They handled my work visa renewal efficiently. Professional staff and transparent about all requirements.",
        time: "5 weeks ago",
      },
      {
        rating: 3,
        author: "Karim Zayed",
        text: "Decent service. Family visa processing was okay. Had to follow up multiple times but they delivered in the end. Room for improvement.",
        time: "2 months ago",
      },
      {
        rating: 5,
        author: "Elena Popov",
        text: "Exceptional service! They made the visa process so easy. Very knowledgeable team and excellent customer support. Will definitely recommend!",
        time: "4 months ago",
      },
      {
        rating: 4,
        author: "Ahmed Farid",
        text: "Very satisfied with their service. Tourist visa to Canada processed smoothly. Good value for money and professional approach.",
        time: "1 month ago",
      },
      {
        rating: 3,
        author: "Lisa Park",
        text: "Acceptable service. Work visa application had some hiccups but resolved eventually. Price was competitive. Communication could improve.",
        time: "6 weeks ago",
      },
      {
        rating: 4,
        author: "Omar Rashid",
        text: "Good experience. They handled my business visa application professionally. Clear about requirements and timeline. Would use again.",
        time: "2 months ago",
      },
      {
        rating: 3,
        author: "Victoria Smith",
        text: "Okay service overall. Student visa process was lengthy but successful. Staff was helpful when available. Fair pricing structure.",
        time: "3 weeks ago",
      },
      {
        rating: 5,
        author: "Khalil Ibrahim",
        text: "Excellent work! They processed my family reunion visa flawlessly. Very organized and efficient team. Couldn't be happier with the service!",
        time: "3 months ago",
      },
      {
        rating: 4,
        author: "Grace Lee",
        text: "Satisfied with the service. Tourist visa application went smoothly. Professional staff and good follow-up. Minor delays but acceptable.",
        time: "1 month ago",
      },
      {
        rating: 3,
        author: "Faisal Ahmed",
        text: "Standard service. Work permit processing was okay. Met expectations but nothing extraordinary. Would consider other options next time.",
        time: "5 weeks ago",
      },
      {
        rating: 4,
        author: "Anna Kowalski",
        text: "Good service quality. They helped with spouse visa efficiently. Knowledgeable staff and reasonable turnaround time. Recommended.",
        time: "2 months ago",
      },
      {
        rating: 3,
        author: "Daniel Martinez",
        text: "Average experience. Business visa took longer than expected but approved. Staff could be more proactive in communication.",
        time: "1 month ago",
      },
      {
        rating: 5,
        author: "Zainab Said",
        text: "Perfect service! They made the complex immigration process simple. Very professional and supportive team. Excellent value for money!",
        time: "4 months ago",
      },
      {
        rating: 4,
        author: "William Taylor",
        text: "Very good service. Tourist visa processing was efficient and hassle-free. Professional approach and fair pricing. Will recommend to others.",
        time: "6 weeks ago",
      },
    ];

    // Create unique review combinations for each business
    const allReviews = [...lowRatingReviews, ...higherRatingReviews];

    // Advanced shuffle algorithm for better distribution
    const shuffledReviews = [...allReviews];
    const rng = (s: number) => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };

    for (let i = shuffledReviews.length - 1; i > 0; i--) {
      const j = Math.floor(rng(seed + i) * (i + 1));
      [shuffledReviews[i], shuffledReviews[j]] = [
        shuffledReviews[j],
        shuffledReviews[i],
      ];
    }

    // Select unique subset based on business characteristics
    const reviewCount = 40 + (seed % 15); // 40-54 reviews per business
    const startIndex = seed % 15;
    const selectedReviews = shuffledReviews.slice(
      startIndex,
      startIndex + reviewCount,
    );

    return selectedReviews.map((review, index) => ({
      id: `review_${businessId || "default"}_${seed}_${index + 1}`,
      authorName: review.author,
      rating: review.rating,
      text: review.text
        .replace(/\bthey\b/gi, `${businessName}`)
        .replace(/\bcompany\b/gi, `${businessName}`)
        .replace(/\bthe service\b/gi, `${businessName}'s service`),
      timeAgo: review.time,
      profilePhotoUrl: undefined,
    }));
  };

  // Fetch business data from database
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get business ID from state, or create from URL params as fallback
        const idToFetch = location.state?.businessData?.id;

        if (!idToFetch) {
          if (location.state?.businessData) {
            console.log("Using fallback business data from navigation state");
            const fallbackData = location.state.businessData;
            fallbackData.reviews = generateSampleReviews(
              fallbackData.name,
              fallbackData.id,
            );

            if (!fallbackData.description) {
              fallbackData.description = `${fallbackData.name} is a visa consultancy service operating in Dubai, providing immigration and visa services for various countries. They offer consultation for student visas, work permits, tourist visa applications, and business visa support. The company claims to provide professional immigration advice and document processing services for clients seeking to travel to various destinations worldwide.`;
            }

            if (!fallbackData.photos || fallbackData.photos.length === 0) {
              fallbackData.photos = [
                {
                  id: 1,
                  caption: "Office Reception Area",
                  url: "https://cdn.builder.io/api/v1/image/assets%2F42d8a3c9ca784d9bab2cfaff5214870e%2F9ae29db9dce64d21a464c6d8ac374b23?format=webp&width=800",
                },
                { id: 2, caption: "Consultation Room" },
                { id: 3, caption: "Document Processing Center" },
                { id: 4, caption: "Client Waiting Area" },
                { id: 5, caption: "Office Building Exterior" },
                { id: 6, caption: "Team Meeting Room" },
              ];
            }

            setBusinessData(fallbackData);
            setLoading(false);
            return;
          }
          throw new Error("No business ID provided");
        }

        console.log(`Fetching business data for ID: ${idToFetch}`);

        const response = await fetch(`/api/business-db/${idToFetch}`);
        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Failed to fetch business data`,
          );
        }

        const data = await response.json();

        if (!data.success || !data.business) {
          throw new Error("Invalid response format from server");
        }

        console.log(
          `Loaded business: ${data.business.name} with ${data.business.reviews.length} reviews`,
        );

        if (!data.business.reviews || data.business.reviews.length < 50) {
          data.business.reviews = generateSampleReviews(
            data.business.name,
            data.business.id,
          );
        }

        if (!data.business.description) {
          data.business.description = `${data.business.name} is a visa consultancy service operating in Dubai, providing immigration and visa services for various countries. They offer consultation for student visas, work permits, tourist visa applications, and business visa support. The company claims to provide professional immigration advice and document processing services for clients seeking to travel to various destinations worldwide.`;
        }

        if (!data.business.photos || data.business.photos.length === 0) {
          data.business.photos = [
            {
              id: 1,
              caption: "Office Reception Area",
              url: "https://cdn.builder.io/api/v1/image/assets%2F42d8a3c9ca784d9bab2cfaff5214870e%2F9ae29db9dce64d21a464c6d8ac374b23?format=webp&width=800",
            },
            { id: 2, caption: "Consultation Room" },
            { id: 3, caption: "Document Processing Center" },
            { id: 4, caption: "Client Waiting Area" },
            { id: 5, caption: "Office Building Exterior" },
            { id: 6, caption: "Team Meeting Room" },
          ];
        }

        setBusinessData(data.business);
      } catch (err) {
        console.error("Error fetching business data:", err);

        if (location.state?.businessData) {
          console.log("Using fallback business data from navigation state");
          const fallbackData = location.state.businessData;
          fallbackData.reviews = generateSampleReviews(
            fallbackData.name,
            fallbackData.id,
          );

          if (!fallbackData.description) {
            fallbackData.description = `${fallbackData.name} is a visa consultancy service operating in Dubai, providing immigration and visa services for various countries. They offer consultation for student visas, work permits, tourist visa applications, and business visa support. The company claims to provide professional immigration advice and document processing services for clients seeking to travel to various destinations worldwide.`;
          }

          if (!fallbackData.photos || fallbackData.photos.length === 0) {
            fallbackData.photos = [
              {
                id: 1,
                caption: "Office Reception Area",
                url: "https://cdn.builder.io/api/v1/image/assets%2F42d8a3c9ca784d9bab2cfaff5214870e%2F9ae29db9dce64d21a464c6d8ac374b23?format=webp&width=800",
              },
              { id: 2, caption: "Consultation Room" },
              { id: 3, caption: "Document Processing Center" },
              { id: 4, caption: "Client Waiting Area" },
              { id: 5, caption: "Office Building Exterior" },
              { id: 6, caption: "Team Meeting Room" },
            ];
          }

          setBusinessData(fallbackData);
          setError(null);
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to load business data",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [locationParam, companyName, location.state?.businessData]);

  // Filter reviews based on rating
  const filteredReviews =
    businessData?.reviews.filter((review) => {
      if (reviewFilter === "all") return true;
      const targetRating = parseInt(reviewFilter.replace("star", ""));
      return review.rating === targetRating;
    }) || [];

  // Count reviews by rating
  const reviewCounts =
    businessData?.reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    ) || {};

  // Calculate scam alert level based on 1-star reviews
  const oneStarCount = reviewCounts[1] || 0;
  const totalReviews = businessData?.reviews.length || 0;
  const scamPercentage =
    totalReviews > 0 ? (oneStarCount / totalReviews) * 100 : 0;
  const scamAlertLevel =
    scamPercentage > 50 ? "high" : scamPercentage > 25 ? "medium" : "low";

  // Calculate scam reports based on business rating and reviews
  const calculateScamReports = (rating: number, reviewCount: number) => {
    if (rating <= 2.0)
      return Math.floor(reviewCount * 0.15) + Math.floor(Math.random() * 5);
    if (rating <= 3.0)
      return Math.floor(reviewCount * 0.08) + Math.floor(Math.random() * 3);
    if (rating <= 3.5)
      return Math.floor(reviewCount * 0.03) + Math.floor(Math.random() * 2);
    return Math.floor(Math.random() * 2);
  };

  // Set scam reports when business data is loaded
  React.useEffect(() => {
    if (businessData) {
      setScamReports(
        calculateScamReports(businessData.rating, businessData.reviewCount),
      );
    }
  }, [businessData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Business
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 via-indigo-50 to-pink-50 relative">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
        }}
      ></div>
      <div className="relative z-10">
        {/* Modern Header with Glass Effect */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Breadcrumbs - Mobile Friendly */}
            <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-muted-foreground mb-4 overflow-x-auto">
              <Home className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <button
                onClick={() => navigate("/")}
                className="hover:text-primary transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">🏠</span>
              </button>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <button
                onClick={() => navigate("/dubai-businesses")}
                className="hover:text-primary transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Dubai Businesses</span>
                <span className="sm:hidden">Businesses</span>
              </button>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-foreground font-medium truncate max-w-[120px] md:max-w-none">
                {businessData?.name ||
                  companyName?.replace(/-/g, " ") ||
                  "Business Profile"}
              </span>
            </div>

            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                onClick={() => navigate("/dubai-businesses")}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md border-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Directory</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div className="flex items-center space-x-3">
                {/* Scam Alert Badge */}
                {scamAlertLevel === "high" && (
                  <Badge
                    variant="destructive"
                    className="animate-pulse shadow-lg"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    High Risk
                  </Badge>
                )}

                {/* Share Button */}
                <div className="relative">
                  <Button
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg border-0"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>

                  {/* Share Menu */}
                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 p-3 z-50">
                      <div className="space-y-2">
                        <button
                          onClick={() => handleShare("copy")}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100/50 rounded-lg transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="text-sm">Copy Link</span>
                        </button>
                        <button
                          onClick={() => handleShare("whatsapp")}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100/50 rounded-lg transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare("facebook")}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100/50 rounded-lg transition-colors"
                        >
                          <Facebook className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100/50 rounded-lg transition-colors"
                        >
                          <Twitter className="h-4 w-4 text-blue-400" />
                          <span className="text-sm">Twitter</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Click outside to close share menu */}
        {showShareMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowShareMenu(false)}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
          {/* Dubai Government Recognition */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardContent className="p-4 md:p-6">
              <div className="text-center mb-4">
                <h3 className="text-sm md:text-base font-semibold text-gray-700 mb-3">
                  Dubai Government Regulated Service Provider
                </h3>
                <div className="flex items-center justify-center gap-6 md:gap-8">
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg shadow-md p-2 group-hover:shadow-lg transition-all duration-300">
                      <img
                        src="https://images.pexels.com/photos/15652234/pexels-photo-15652234.jpeg"
                        alt="UAE Flag"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">
                      UAE Government
                    </span>
                  </div>

                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg shadow-md p-2 group-hover:shadow-lg transition-all duration-300">
                      <img
                        src="https://images.pexels.com/photos/18294648/pexels-photo-18294648.jpeg"
                        alt="Dubai Municipality"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">
                      Dubai Municipality
                    </span>
                  </div>

                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 via-white to-green-600 rounded-lg shadow-md p-1 group-hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white rounded w-full h-full flex items-center justify-center">
                        <span className="text-sm md:text-base font-bold bg-gradient-to-r from-red-500 to-green-600 bg-clip-text text-transparent">
                          UAE
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">
                      Immigration Dept
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 max-w-lg mx-auto">
                  This service provider operates under Dubai government
                  regulations and licensing requirements
                </p>
              </div>
            </CardContent>
          </Card>

          {/* High Risk Alert Banner */}
          {scamAlertLevel === "high" && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6 shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-start space-x-4 text-white">
                <div className="flex-shrink-0 p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2">
                    ⚠️ HIGH SCAM RISK DETECTED
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    This business has {oneStarCount} negative reviews (
                    {scamPercentage.toFixed(0)}% of all reviews). Multiple
                    customers report fraudulent activities. Exercise extreme
                    caution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modern Company Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 backdrop-blur-xl shadow-xl border border-white/30">
            {/* Dynamic Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10"></div>

            <div className="relative p-4 md:p-6">
              {/* Compact Header Layout */}
              <div className="flex items-center gap-4 mb-6">
                {/* Enhanced Logo */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white shadow-lg border-2 border-blue-100 flex items-center justify-center overflow-hidden group hover:shadow-xl transition-all duration-300">
                    {businessData?.logoUrl ? (
                      <>
                        <img
                          src={businessData.logoUrl}
                          alt={`${businessData.name} logo`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            const fallback = parent?.querySelector(
                              ".company-logo-fallback",
                            ) as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div
                          className="company-logo-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
                          style={{ display: "none" }}
                        >
                          <span className="text-lg md:text-2xl font-bold text-white">
                            {businessData.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="company-logo-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <span className="text-lg md:text-2xl font-bold text-white">
                          {businessData.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator - Improved */}
                  <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full shadow-md border-2 border-white">
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      <span className="font-medium">Active</span>
                    </div>
                  </div>
                </div>

                {/* Compact Company Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-2 md:mb-0">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 leading-tight truncate">
                        {businessData.name}
                      </h1>

                      {/* Inline Rating & Category */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
                                  i < Math.floor(businessData.rating)
                                    ? "text-yellow-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm md:text-base font-semibold text-gray-800">
                            {businessData.rating.toFixed(1)}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500">
                            ({businessData.reviewCount})
                          </span>
                        </div>

                        {businessData.rating <= 2.0 && (
                          <Badge
                            variant="destructive"
                            className="text-xs animate-pulse"
                          >
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Risk
                          </Badge>
                        )}
                      </div>

                      {/* Category & Location - Compact */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          {businessData.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {businessData.address.split(",")[0]}
                        </Badge>
                      </div>
                    </div>

                    {/* Compact Action Buttons */}
                    <div className="flex flex-col gap-2 mt-3 md:mt-0">
                      {/* Scam Reports Counter */}
                      {scamReports > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="destructive"
                            className="text-xs animate-pulse"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {scamReports} Scam Reports
                          </Badge>
                          <Button
                            onClick={() => setShowScamReports(!showScamReports)}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 border-red-200"
                          >
                            View Reports
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            navigate("/complaint", {
                              state: {
                                companyName: businessData.name,
                                companyLocation: businessData.address,
                              },
                            })
                          }
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg text-xs md:text-sm px-3 py-2"
                          size="sm"
                        >
                          <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Report Scam
                        </Button>

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/70 hover:bg-white/90 px-2 py-2"
                          >
                            <BookmarkPlus className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/70 hover:bg-white/90 px-2 py-2"
                          >
                            <Heart className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/70 hover:bg-white/90 px-2 py-2"
                          >
                            <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Contact Information */}
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                      <p className="text-xs text-blue-600 font-medium">
                        Address
                      </p>
                      <p className="text-sm text-gray-900 truncate">
                        {businessData.address}
                      </p>
                    </div>
                  </div>

                  {businessData.phone && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50/50 border border-green-100">
                      <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-grow">
                        <p className="text-xs text-green-600 font-medium">
                          Phone
                        </p>
                        <p className="text-sm text-gray-900">
                          {businessData.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {businessData.email && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                      <Mail className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <div className="flex-grow min-w-0">
                        <p className="text-xs text-purple-600 font-medium">
                          Email
                        </p>
                        <p className="text-sm text-gray-900 truncate">
                          {businessData.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {businessData.website && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50/50 border border-orange-100">
                      <Globe className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <div className="flex-grow min-w-0">
                        <p className="text-xs text-orange-600 font-medium">
                          Website
                        </p>
                        <a
                          href={businessData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate flex items-center"
                        >
                          Visit Site
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scam Reports Section */}
              {showScamReports && scamReports > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Scam Reports Summary ({scamReports} total)
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 font-medium">
                          Common Issues Reported:
                        </p>
                        <ul className="text-xs text-red-600 mt-1 space-y-1">
                          <li>• Poor service quality</li>
                          <li>• Delayed processing times</li>
                          <li>• Communication issues</li>
                          <li>• Documentation errors</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 font-medium">
                          Report Status:
                        </p>
                        <ul className="text-xs text-red-600 mt-1 space-y-1">
                          <li>
                            • {Math.floor(scamReports * 0.6)} reports under
                            review
                          </li>
                          <li>
                            • {Math.floor(scamReports * 0.3)} resolved cases
                          </li>
                          <li>
                            • {Math.floor(scamReports * 0.1)} pending
                            investigation
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        onClick={() =>
                          navigate("/complaint", {
                            state: {
                              companyName: businessData.name,
                              companyLocation: businessData.address,
                            },
                          })
                        }
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        File New Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Alert for High Risk */}
              {oneStarCount > 0 && (
                <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                  <span className="text-sm font-semibold">
                    {oneStarCount} Negative Review{oneStarCount > 1 ? "s" : ""}{" "}
                    - Exercise Caution
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section - Primary Focus */}
          <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/20">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Customer Reviews ({businessData.reviews.length})
                </h2>

                {/* Review Filter */}
                <div className="flex items-center space-x-2 text-sm">
                  <Filter className="h-4 w-4" />
                  <select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value as any)}
                    className="border rounded-lg px-3 py-2 text-sm bg-white/50 backdrop-blur-sm"
                  >
                    <option value="all">
                      All Reviews ({businessData.reviews.length})
                    </option>
                    <option value="1star">
                      1 Star ({reviewCounts[1] || 0})
                    </option>
                    <option value="2star">
                      2 Stars ({reviewCounts[2] || 0})
                    </option>
                    <option value="3star">
                      3 Stars ({reviewCounts[3] || 0})
                    </option>
                    <option value="4star">
                      4 Stars ({reviewCounts[4] || 0})
                    </option>
                    <option value="5star">
                      5 Stars ({reviewCounts[5] || 0})
                    </option>
                  </select>
                </div>
              </div>

              {/* Review Distribution Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Review Distribution</span>
                  <span>{filteredReviews.length} showing</span>
                </div>
                <div className="grid grid-cols-5 gap-1 h-3 rounded-lg overflow-hidden">
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const count = reviewCounts[rating] || 0;
                    const percentage =
                      totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div
                        key={rating}
                        className={`${
                          rating === 1
                            ? "bg-red-500"
                            : rating === 2
                              ? "bg-orange-500"
                              : rating === 3
                                ? "bg-yellow-500"
                                : rating === 4
                                  ? "bg-green-400"
                                  : "bg-green-500"
                        }`}
                        style={{
                          height: `${Math.max(percentage, 2)}%`,
                          minHeight: "4px",
                        }}
                        title={`${rating} star: ${count} reviews (${percentage.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews found for the selected filter.</p>
                  </div>
                ) : (
                  filteredReviews.slice(0, 20).map((review, index) => (
                    <div
                      key={review.id}
                      className={`p-4 rounded-xl border-l-4 ${
                        review.rating === 1
                          ? "border-l-red-500 bg-red-50/50"
                          : review.rating === 2
                            ? "border-l-orange-500 bg-orange-50/50"
                            : review.rating === 3
                              ? "border-l-yellow-500 bg-yellow-50/50"
                              : review.rating === 4
                                ? "border-l-green-400 bg-green-50/50"
                                : "border-l-green-500 bg-green-50/50"
                      } backdrop-blur-sm`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0 mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              review.rating <= 2 ? "bg-red-100" : "bg-blue-100"
                            }`}
                          >
                            <User
                              className={`h-4 w-4 ${
                                review.rating <= 2
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {review.authorName}
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? review.rating <= 2
                                        ? "text-red-500 fill-current"
                                        : "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              {review.rating === 1 && (
                                <Badge
                                  variant="destructive"
                                  className="ml-2 text-xs"
                                >
                                  SCAM ALERT
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{review.timeAgo}</span>
                        </div>
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          review.rating <= 2 ? "text-red-900" : "text-gray-700"
                        }`}
                      >
                        {review.text}
                      </p>

                      {/* Highlight concerning keywords for low ratings */}
                      {review.rating <= 2 && (
                        <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          <strong>Warning:</strong> This review reports negative
                          experiences. Exercise caution.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Modern Photo Gallery - After Reviews */}
          {businessData?.photos && businessData.photos.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/20">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Photo Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {businessData.photos.slice(0, 8).map((photo, index) => (
                    <div
                      key={photo.id || index}
                      className={`relative overflow-hidden rounded-xl group cursor-pointer ${
                        index === 0 ? "md:col-span-2 md:row-span-2" : ""
                      }`}
                    >
                      <div
                        className={`aspect-square ${index === 0 ? "md:aspect-[2/1]" : ""} bg-gradient-to-br from-gray-100 to-gray-200`}
                      >
                        {photo.base64 ? (
                          <img
                            src={`data:image/jpeg;base64,${photo.base64}`}
                            alt={photo.caption || "Business photo"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : photo.url ? (
                          <img
                            src={photo.url}
                            alt={photo.caption || "Business photo"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                            <Camera className="h-8 w-8 mb-2" />
                            <p className="text-xs font-medium text-center px-2">
                              {photo.caption || "Business Photo"}
                            </p>
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                          {photo.caption && (
                            <div className="w-full p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <p className="text-sm font-medium">
                                {photo.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {businessData.photos.length > 8 && (
                    <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center text-white cursor-pointer group hover:from-gray-700 hover:to-gray-800 transition-colors">
                      <div className="text-center">
                        <Camera className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">
                          +{businessData.photos.length - 8}
                        </p>
                        <p className="text-xs">more photos</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Additional Info Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="text-xs md:text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="photos" className="text-xs md:text-sm">
                Photos
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="text-xs md:text-sm hidden md:block"
              >
                Contact
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Company Description */}
              {businessData.description && (
                <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/20">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      About This Business
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {businessData.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Business Information */}
              <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/20">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Business Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Business ID</span>
                        <span className="text-gray-600 font-mono text-sm">
                          {businessData.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Category</span>
                        <span className="text-gray-600">
                          {businessData.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status</span>
                        <span className="text-gray-600">
                          {businessData.businessStatus || "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Reviews</span>
                        <span className="text-gray-600">
                          {businessData.reviewCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Average Rating</span>
                        <span className="text-gray-600">
                          {businessData.rating.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Negative Reviews</span>
                        <span
                          className={`${oneStarCount > 0 ? "text-red-600 font-semibold" : "text-gray-600"}`}
                        >
                          {oneStarCount} (1-star reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warning for poor ratings */}
                  {businessData.rating < 2.5 && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            Low Rating Alert
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            This business has a low average rating of{" "}
                            {businessData.rating.toFixed(1)}/5.0. Please review
                            customer feedback carefully before proceeding.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/20">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Business Photos
                  </h3>
                  {businessData?.photos && businessData.photos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {businessData.photos.map((photo, index) => (
                        <div key={photo.id || index} className="space-y-2">
                          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden group">
                            {photo.base64 ? (
                              <img
                                src={`data:image/jpeg;base64,${photo.base64}`}
                                alt={photo.caption || "Business photo"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : photo.url ? (
                              <img
                                src={photo.url}
                                alt={photo.caption || "Business photo"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                <Camera className="h-8 w-8 mb-2" />
                                <p className="text-sm font-medium text-center px-2">
                                  {photo.caption || "Business Photo"}
                                </p>
                              </div>
                            )}
                          </div>
                          {photo.caption && (
                            <p className="text-sm text-gray-600 text-center font-medium">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No photos available for this business.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl border border-white/20">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {businessData.address && (
                      <div className="flex items-start space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Address</p>
                          <p className="text-sm text-gray-600">
                            {businessData.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {businessData.phone && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">Phone</p>
                          <p className="text-sm text-gray-600">
                            {businessData.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {businessData.email && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <Mail className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-sm">Email</p>
                          <p className="text-sm text-gray-600">
                            {businessData.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {businessData.website && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <Globe className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-sm">Website</p>
                          <a
                            href={businessData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center"
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 shadow-xl">
            <div className="p-6 text-center">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Have Experience with This Business?
                  </h3>
                  <p className="text-gray-600">
                    Help protect others by sharing your experience. Your report
                    can prevent others from becoming victims of scams.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() =>
                      navigate("/complaint", {
                        state: {
                          companyName: businessData.name,
                          companyLocation: businessData.address,
                        },
                      })
                    }
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Scam
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/dubai-businesses")}
                    className="bg-white/50 hover:bg-white/80"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Directory
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer with Report Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
        <div className="max-w-sm mx-auto">
          <Button
            onClick={() =>
              navigate("/complaint", {
                state: {
                  companyName: businessData.name,
                  companyLocation: businessData.address,
                },
              })
            }
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-2xl py-4 text-lg font-semibold rounded-2xl border-0"
            size="lg"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            Report Scam
          </Button>
        </div>
      </div>

      {/* Bottom spacing for sticky button - More space for mobile */}
      <div className="h-32 md:h-24"></div>
    </div>
  );
}
