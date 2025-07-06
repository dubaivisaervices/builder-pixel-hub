import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, MapPin, Calendar, User } from "lucide-react";

export default function CompanyReviews() {
  const { location, companyName } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app this would come from API
  const company = {
    name: companyName?.replace(/-/g, " ") || "Unknown Company",
    location: location?.replace(/-/g, " ") || "Unknown Location",
    totalReports: 3,
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <Card className="shadow-lg border-0 mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {company.name}
                </h1>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start lg:items-end space-y-2">
                <Badge
                  variant="destructive"
                  className="text-base px-4 py-2 font-semibold"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {company.totalReports} people reported this company
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
          </CardContent>
        </Card>

        {/* Warning Banner */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8">
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
          <h2 className="text-2xl font-bold text-foreground">
            Reported Scams ({company.totalReports})
          </h2>

          {company.reports.map((report) => (
            <Card key={report.id} className="shadow-md border-0">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{report.reporterName}</div>
                      <div className="text-sm text-muted-foreground">
                        Applied for {report.visaType} to {report.country}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(report.date).toLocaleDateString()}</span>
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
