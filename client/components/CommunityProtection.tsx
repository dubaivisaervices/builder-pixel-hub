import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Users, CheckCircle, Award } from "lucide-react";

interface CommunityProtectionProps {
  stats?: {
    scamReports: number;
  };
}

export default function CommunityProtection({
  stats = { scamReports: 150 },
}: CommunityProtectionProps) {
  const navigate = useNavigate();

  const handleReportScam = () => {
    navigate("/complaint");
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/50 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-6 shadow-lg">
                <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Protect Our Community
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Help protect thousands of people from immigration scams by
                reporting suspicious activities and fraudulent companies.
              </p>

              {/* Report Button */}
              <Button
                onClick={handleReportScam}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg px-8 py-4 text-lg font-semibold rounded-xl transform hover:scale-105 transition-all duration-200"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Report Immigration Scam
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-6 mt-8 sm:mt-12">
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-xl inline-flex mb-3">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">
                  Community Protected
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {stats.scamReports}+ scam reports filed to protect the
                  community
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-xl inline-flex mb-3">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">
                  Verified Reports
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  All reports are verified and investigated thoroughly by our
                  team
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 p-3 rounded-xl inline-flex mb-3">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">
                  Anonymous & Safe
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Your identity is protected when reporting suspicious
                  activities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
