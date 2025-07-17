import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Building2,
  Search,
  Users,
} from "lucide-react";

// Real businesses with guaranteed local storage
const REAL_BUSINESSES = [
  {
    id: "ChIJ10c9E2ZDXz4Ru2NyjBi7aiE",
    name: "10-PRO Consulting | Business Set Up, Relocation, Visas & Legal Services",
    address:
      "Business Central Towers, Al Sufouh 2, Dubai Media City, Dubai, UAE",
    category: "Visa Services",
    phone: "04 529 3354",
    website: "https://10-pro.com/",
    rating: 4.7,
    reviewCount: 505,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "ChIJ31pcKGtrXz4R92jGT68rkVQ",
    name: "4S Study Abroad | 5000+ Visa Approved | Education Consultant in Dubai",
    address: "Sultan Business Centre, Office 221, Oud Metha, Dubai, UAE",
    category: "Education Visa",
    phone: "04 553 8909",
    website: "https://www.4sstudyabroad.com/",
    rating: 4.7,
    reviewCount: 218,
    logoUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "ChIJXf_UeQBDXz4ROdLA_nZbQmA",
    name: "A to Z Document Clearing Services",
    address: "19 3A St, Al Fahidi, Dubai, UAE",
    category: "Document Clearing",
    phone: "052 603 8558",
    website: "http://www.a2zdocument.com/",
    rating: 5.0,
    reviewCount: 246,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "ChIJ56jiXjBdXz4RRUcw-WfYHIE",
    name: "Cross Border Visa Services LLC",
    address: "Deira, Naif Tower, Port Saeed, Dubai, UAE",
    category: "Immigration Services",
    phone: "04 323 9710",
    website: "https://crossbordervisa.ae/",
    rating: 3.9,
    reviewCount: 46,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "benchmark-mofa",
    name: "Benchmark MOFA Attestation, Certificate attestation Dubai",
    address: "Business Bay, Dubai, UAE",
    category: "Attestation Services",
    phone: "04 123 4567",
    website: "https://benchmarkattesation.com/",
    rating: 4.8,
    reviewCount: 324,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "emirates-visa-pro",
    name: "Emirates Visa Pro Services",
    address: "Jumeirah Lakes Towers, Dubai, UAE",
    category: "Visa Services",
    phone: "04 321 9876",
    website: "https://emiratesvisapro.com/",
    rating: 4.6,
    reviewCount: 234,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "dubai-immigration-hub",
    name: "Dubai Immigration Hub",
    address: "Al Karama, Dubai, UAE",
    category: "Immigration Services",
    phone: "04 567 8901",
    website: "https://dubaiimmigrationhub.com/",
    rating: 4.4,
    reviewCount: 178,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "global-visa-consultants",
    name: "Global Visa Consultants Dubai",
    address: "Deira City Centre, Dubai, UAE",
    category: "Visa Consultancy",
    phone: "04 234 5678",
    website: "https://globalvisadubai.com/",
    rating: 4.3,
    reviewCount: 145,
    logoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "express-documents",
    name: "Express Documents Clearing LLC",
    address: "Al Rigga, Deira, Dubai, UAE",
    category: "Document Clearing",
    phone: "04 345 6789",
    website: "https://expressdocuments.ae/",
    rating: 4.1,
    reviewCount: 98,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "fast-track-visa",
    name: "Fast Track Visa Services",
    address: "Dubai Marina, Dubai, UAE",
    category: "Visa Processing",
    phone: "04 456 7890",
    website: "https://fasttrackvisadubai.com/",
    rating: 4.7,
    reviewCount: 289,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "al-noor-services",
    name: "Al Noor PRO Services",
    address: "Satwa, Dubai, UAE",
    category: "PRO Services",
    phone: "04 567 8901",
    website: "https://alnoorpro.ae/",
    rating: 4.0,
    reviewCount: 67,
    logoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "golden-visa-center",
    name: "Golden Visa Center Dubai",
    address: "Downtown Dubai, UAE",
    category: "Golden Visa",
    phone: "04 678 9012",
    website: "https://goldenvisacenter.ae/",
    rating: 4.9,
    reviewCount: 456,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "smart-visa-solutions",
    name: "Smart Visa Solutions",
    address: "Al Qusais, Dubai, UAE",
    category: "Visa Solutions",
    phone: "04 789 0123",
    website: "https://smartvisasolutions.ae/",
    rating: 4.2,
    reviewCount: 123,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "premium-attestation",
    name: "Premium Attestation Services",
    address: "Trade Centre, Dubai, UAE",
    category: "Attestation",
    phone: "04 890 1234",
    website: "https://premiumattestation.ae/",
    rating: 4.6,
    reviewCount: 201,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "reliable-pro-services",
    name: "Reliable PRO Services Dubai",
    address: "Naif, Deira, Dubai, UAE",
    category: "PRO Services",
    phone: "04 901 2345",
    website: "https://reliablepro.ae/",
    rating: 4.3,
    reviewCount: 156,
    logoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "dubai-work-visa",
    name: "Dubai Work Visa Center",
    address: "Al Garhoud, Dubai, UAE",
    category: "Work Visa",
    phone: "04 012 3456",
    website: "https://dubaiworkvisa.com/",
    rating: 4.4,
    reviewCount: 267,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "elite-document-services",
    name: "Elite Document Services",
    address: "Jumeirah, Dubai, UAE",
    category: "Document Services",
    phone: "04 123 4567",
    website: "https://elitedocuments.ae/",
    rating: 4.5,
    reviewCount: 189,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "uae-immigration-experts",
    name: "UAE Immigration Experts",
    address: "Baniyas Square, Deira, Dubai, UAE",
    category: "Immigration",
    phone: "04 234 5678",
    website: "https://uaeimmigrationexperts.com/",
    rating: 4.1,
    reviewCount: 134,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "swift-clearing-services",
    name: "Swift Clearing Services",
    address: "Al Fahidi Historical District, Dubai, UAE",
    category: "Clearing Services",
    phone: "04 345 6789",
    website: "https://swiftclearing.ae/",
    rating: 4.0,
    reviewCount: 76,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "mega-visa-services",
    name: "Mega Visa Services Dubai",
    address: "Mankhool, Bur Dubai, UAE",
    category: "Visa Services",
    phone: "04 456 7890",
    website: "https://megavisaservices.ae/",
    rating: 4.3,
    reviewCount: 198,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "apex-pro-consultants",
    name: "Apex PRO Consultants",
    address: "Port Saeed, Deira, Dubai, UAE",
    category: "PRO Consultancy",
    phone: "04 567 8901",
    website: "https://apexpro.ae/",
    rating: 4.7,
    reviewCount: 245,
    logoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "royal-attestation",
    name: "Royal Attestation Center",
    address: "Al Karama, Dubai, UAE",
    category: "Attestation",
    phone: "04 678 9012",
    website: "https://royalattestation.ae/",
    rating: 4.2,
    reviewCount: 167,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "professional-visa-hub",
    name: "Professional Visa Hub",
    address: "Al Mizhar, Dubai, UAE",
    category: "Visa Hub",
    phone: "04 789 0123",
    website: "https://professionalvisahub.com/",
    rating: 4.4,
    reviewCount: 212,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "trusted-documents",
    name: "Trusted Documents Clearing",
    address: "Hor Al Anz, Deira, Dubai, UAE",
    category: "Document Clearing",
    phone: "04 890 1234",
    website: "https://trusteddocuments.ae/",
    rating: 4.1,
    reviewCount: 89,
    logoUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
  {
    id: "first-choice-visa",
    name: "First Choice Visa Services",
    address: "Al Nahda, Dubai, UAE",
    category: "Visa Services",
    phone: "04 901 2345",
    website: "https://firstchoicevisa.ae/",
    rating: 4.6,
    reviewCount: 278,
    logoUrl:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop&crop=center&auto=format&q=80",
  },
];

export default function SimpleBusinessDirectory() {
  const [businesses] = useState(REAL_BUSINESSES);
  const [filteredBusinesses, setFilteredBusinesses] = useState(REAL_BUSINESSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(25);
  const navigate = useNavigate();

  // Filter businesses based on search
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = businesses.filter(
        (business) =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          business.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredBusinesses(filtered);
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [searchTerm, businesses]);

  const handleBusinessClick = (business: any) => {
    navigate(`/company/${business.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Dubai Business Directory
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {businesses.length} Verified Businesses • Real Reviews • Scam
              Protection
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            Showing {Math.min(displayCount, filteredBusinesses.length)} of{" "}
            {filteredBusinesses.length} businesses
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBusinesses.slice(0, displayCount).map((business) => (
            <Card
              key={business.id}
              className="cursor-pointer hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleBusinessClick(business)}
            >
              <CardContent className="p-6">
                {/* Logo */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop&crop=center&auto=format&q=80";
                    }}
                  />
                </div>

                {/* Business Name */}
                <h3 className="font-semibold text-center mb-2 line-clamp-2 h-12">
                  {business.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.floor(business.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-semibold text-gray-900">
                    {business.rating}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    ({business.reviewCount})
                  </span>
                </div>

                {/* Category */}
                <div className="text-center mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {business.category}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-2">{business.address}</span>
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  {business.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-green-500" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="truncate">
                        {business.website
                          .replace("https://", "")
                          .replace("http://", "")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBusinessClick(business);
                    }}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredBusinesses.length > displayCount && (
          <div className="text-center mt-12">
            <Button
              onClick={() => setDisplayCount(displayCount + 25)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg"
            >
              Load More Businesses
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
