import { useParams, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";

export default function CompanyReviews() {
  const { location: locationParam, companyName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const businessData = location.state?.businessData;

  // Debug logging
  console.log("CompanyReviews - businessData:", businessData);
  console.log("CompanyReviews - businessData.reviews:", businessData?.reviews);
  console.log("CompanyReviews - businessData.photos:", businessData?.photos);

  // Use passed business data or enhanced mock data
  const company = {
    name:
      businessData?.name ||
      companyName?.replace(/-/g, " ") ||
      "Unknown Company",
    location:
      businessData?.address ||
      locationParam?.replace(/-/g, " ") ||
      "Unknown Location",
    // Use real business data if available
    rating: businessData?.rating || 3.2,
    totalReviews: businessData?.reviewCount || 127,
    totalReports: 3,
    // Company details - use real data when available
    description:
      "A visa consultancy service operating in Dubai, providing immigration and visa services for various countries. They offer consultation for student visas, work permits, and tourist visa applications.",
    website: businessData?.website || "https://example-visa-services.com",
    email:
      businessData?.email ||
      `info@${(businessData?.name || companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.ae`,
    phone: businessData?.phone || "+971-4-123-4567",
    address:
      businessData?.address || "Office 1204, Business Bay Tower, Dubai, UAE",
    establishedYear: "2018",
    licenseNumber: "DED-12345678",
    // Business metrics
    rating: 3.2,
    totalReviews: 127,
    // Photos - use real photos if available, otherwise show placeholders
    photos: businessData?.photos || [
      { id: 1, caption: "Office Reception" },
      { id: 2, caption: "Consultation Room" },
      { id: 3, caption: "Team Photo" },
      { id: 4, caption: "Office Exterior" },
      { id: 5, caption: "Waiting Area" },
      { id: 6, caption: "Document Processing Center" },
    ],
    // Reviews - use real reviews if available
    realReviews: businessData?.reviews || [],
    // Operating hours - use real data when available
    hours: businessData?.hours || {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed",
    },
    // Services offered
    services: [
      "Student Visa Consultation",
      "Work Permit Processing",
      "Tourist Visa Services",
      "Business Visa Support",
      "Document Translation",
      "Embassy Appointments",
    ],
    // Positive reviews
    positiveReviews: [
      {
        id: 1,
        reviewerName: "Sarah M.",
        rating: 5,
        date: "2024-01-20",
        comment:
          "Excellent service! They helped me get my student visa to Canada within 3 weeks. Very professional and responsive team.",
      },
      {
        id: 2,
        reviewerName: "Ahmed K.",
        rating: 4,
        date: "2024-01-18",
        comment:
          "Good experience overall. The process was smooth and they kept me updated throughout. A bit expensive but worth it.",
      },
    ],
    // Scam reports
    reports: [
      {
        id: 1,
        reporterName: "Anonymous User",
        date: "2024-01-15",
        country: "United States",
        visaType: "Student Visa",
        description:
          "They promised guaranteed visa approval for $5000 upfront. After payment, they became unresponsive and provided fake documents. Lost all my money and got visa rejection.",
      },
      {
        id: 2,
        reporterName: "Jane D.",
        date: "2024-01-10",
        country: "Canada",
        visaType: "Work Visa",
        description:
          "Company charged excessive fees for basic document preparation that I could have done myself. They provided outdated forms and incorrect information leading to application delays.",
      },
      {
        id: 3,
        reporterName: "Anonymous User",
        date: "2024-01-05",
        country: "United Kingdom",
        visaType: "Business Visa",
        description:
          "Fake company with no proper licensing. They collected personal information and money but never processed any applications. Office address was fake too.",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Logo and Basic Info */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center mb-4 border-2 border-primary/20 overflow-hidden">
                  {businessData?.logoUrl ? (
                    <img
                      src={businessData.logoUrl}
                      alt={`${company.name} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to letter if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling!.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`text-primary text-4xl font-bold ${businessData?.logoUrl ? "hidden" : ""}`}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(company.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {company.rating} ({company.totalReviews} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Est. {company.establishedYear}
                  </p>
                </div>
              </div>

              {/* Company Details */}
              <div className="flex-grow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="flex-grow">
                    <h1 className="text-4xl font-bold text-foreground mb-3">
                      {company.name}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                      {company.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-sm">{company.address}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="text-sm">{company.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="text-sm">{company.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Warning and Action */}
                  <div className="flex flex-col space-y-3 lg:ml-6">
                    <Badge
                      variant="destructive"
                      className="text-base px-4 py-2 font-semibold self-start"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {company.totalReports} scam reports
                    </Badge>
                    <Button
                      onClick={() =>
                        navigate("/complaint", {
                          state: {
                            companyName: company.name,
                            companyLocation: company.location,
                          },
                        })
                      }
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Report This Company
                    </Button>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">
                    Services Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((service, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reports">Scam Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Operating Hours */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Operating Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(company.hours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium capitalize">{day}</span>
                      <span className="text-muted-foreground">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* License Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>License & Registration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">DED License Number</span>
                    <span className="text-muted-foreground">
                      {company.licenseNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Established</span>
                    <span className="text-muted-foreground">
                      {company.establishedYear}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Business Type</span>
                    <span className="text-muted-foreground">
                      Visa Consultation Services
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Company Photos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Always show photos section */}
                <>
                  {businessData?.photos && businessData.photos.length > 0 ? (
                    <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      📷 Showing {businessData.photos.length} real business photos from Google My Business
                    </div>
                  ) : (
                    <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      📷 No photos available from Google My Business. Showing placeholder gallery.
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {company.photos.map((photo) => (
                      <div key={photo.id} className="space-y-2">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200">
                          {photo.url && businessData?.photos ? (
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                // Fallback to placeholder if Google image fails
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const placeholder = target.parentElement?.querySelector('.photo-placeholder');
                                if (placeholder) placeholder.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`photo-placeholder text-center text-gray-500 ${photo.url && businessData?.photos ? 'hidden' : ''}`}>
                            <Camera className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm font-medium">
                              {photo.caption}
                            </p>
                            <p className="text-xs text-gray-400">
                              Photo placeholder
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground text-center font-medium">
                          {photo.caption}
                        </p>
                      </div>
                    ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      📷 No photos available from Google My Business. Showing placeholder gallery.
                    </div>
                    {/* Fallback placeholder photos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {company.photos.map((photo) => (
                        <div key={photo.id} className="space-y-2">
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200">
                            <div className="text-center text-gray-500">
                              <Camera className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm font-medium">
                                {photo.caption}
                              </p>
                              <p className="text-xs text-gray-400">
                                Photo placeholder
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground text-center font-medium">
                            {photo.caption}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* No Photos Message */}
                    <div className="text-center py-8 text-muted-foreground">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">
                        Photo Gallery
                      </h3>
                      <p className="text-sm">
                        Real business photos from Google My Business will be
                        displayed here when available. This includes office
                        reception, consultation rooms, team photos, and exterior
                        views.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>
                  Customer Reviews (
                  {businessData?.reviews?.length || company.totalReviews})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show real reviews from business data if available */}
                {company.realReviews && company.realReviews.length > 0 ? (
                  <>
                    <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                      ⭐ Showing {company.realReviews.length} real customer reviews (70% negative, 30% positive)
                    </div>
                    {company.realReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-6 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {review.authorName}
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{review.timeAgo}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {review.text}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      ⭐ No reviews available from business data. Showing sample reviews.
                    </div>
                    {company.positiveReviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b pb-6 last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {review.reviewerName}
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {review.comment}
                      </p>
                    </div>
                  ))}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scam Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-2">
                    ⚠️ Warning: Multiple Fraud Reports
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This company has multiple reports of fraudulent activity.
                    Exercise extreme caution before engaging their services or
                    providing any personal information or payments.
                  </p>
                </div>
              </div>
            </div>

            {/* Reports */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">
                Reported Scams ({company.totalReports})
              </h3>

              {company.reports.map((report) => (
                <Card key={report.id} className="shadow-md border-0">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="bg-destructive/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {report.reporterName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Applied for {report.visaType} to {report.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">
                      {report.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="shadow-lg border-0 mt-12">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-semibold mb-4">
              Have you been scammed by this company?
            </h3>
            <p className="text-muted-foreground mb-6">
              Help protect others by sharing your experience. Your report can
              prevent others from becoming victims.
            </p>
            <Button
              size="lg"
              onClick={() =>
                navigate("/complaint", {
                  state: {
                    companyName: company.name,
                    companyLocation: company.location,
                  },
                })
              }
              className="bg-primary hover:bg-primary/90"
            >
              File a Report Against This Company
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}