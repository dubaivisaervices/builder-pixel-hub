import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Users } from "lucide-react";

export default function Index() {
  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && companyLocation.trim()) {
      navigate("/complaint", {
        state: {
          companyName: companyName.trim(),
          companyLocation: companyLocation.trim(),
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Report Immigration Scam
              </h1>
            </div>
            <div className="hidden sm:flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Community Protected</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Fraud Prevention</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Protect Others From Immigration Fraud
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Help build a safer immigration community by reporting fraudulent
            companies and scams. Your report can prevent others from becoming
            victims.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Reports Filed</div>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-sm text-muted-foreground">
                Companies Exposed
              </div>
            </CardContent>
          </Card>
          <Card className="text-center border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">
                People Protected
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Immigration Services Categories */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Immigration Services Categories
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore verified visa and immigration consultants across
                different service categories in Dubai
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  name: "Visa Consulting",
                  icon: "🛂",
                  description: "Expert visa guidance",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  name: "Immigration",
                  icon: "✈️",
                  description: "Complete immigration support",
                  color: "from-green-500 to-green-600",
                },
                {
                  name: "Work Permits",
                  icon: "💼",
                  description: "Employment visa assistance",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  name: "Student Visas",
                  icon: "🎓",
                  description: "Education visa processing",
                  color: "from-orange-500 to-orange-600",
                },
                {
                  name: "Tourist Visas",
                  icon: "🏖️",
                  description: "Visit visa services",
                  color: "from-teal-500 to-teal-600",
                },
                {
                  name: "Business Setup",
                  icon: "🏢",
                  description: "Business visa solutions",
                  color: "from-indigo-500 to-indigo-600",
                },
              ].map((category, index) => (
                <button
                  key={index}
                  onClick={() => navigate("/dubai-businesses")}
                  className="group relative p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:bg-white/80 hover:scale-105 hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}
                  ></div>

                  <div className="relative z-10">
                    <div className="text-2xl md:text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h4 className="font-bold text-xs md:text-sm text-gray-900 mb-1 leading-tight">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {category.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button
                onClick={() => navigate("/dubai-businesses")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 font-semibold"
                size="lg"
              >
                View All Consultants
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Form */}
        <Card className="max-w-2xl mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-semibold">
              Start Your Report
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter basic company information to begin filing your complaint
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-base font-medium">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Enter the company or organization name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="companyLocation"
                  className="text-base font-medium"
                >
                  Company Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyLocation"
                  type="text"
                  placeholder="City, State or Country where company is located"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-medium"
                disabled={!companyName.trim() || !companyLocation.trim()}
              >
                Continue to File Complaint
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Your identity will be kept confidential. All reports are
                reviewed for accuracy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Browse Businesses Link */}
        <Card className="max-w-2xl mx-auto mt-8 shadow-lg border-0">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Browse Dubai Visa Services
            </h3>
            <p className="text-muted-foreground mb-4">
              Research visa service providers in Dubai before choosing one
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/dubai-businesses")}
              className="w-full"
            >
              View Dubai Business Directory
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Anonymous & Secure</h3>
              <p className="text-muted-foreground">
                Your personal information is protected and reports can be filed
                anonymously.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Help build a database of fraudulent companies to protect future
                immigrants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
