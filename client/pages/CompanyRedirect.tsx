import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createBusinessProfileUrl } from "@/lib/urlUtils";

export default function CompanyRedirect() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findAndRedirectCompany = async () => {
      if (!companyId) {
        setError("No company ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log(`🔍 Looking up company with ID: ${companyId}`);

        // Try to fetch from complete businesses file first
        let business = null;

        try {
          const completeRes = await fetch(
            `/api/complete-businesses.json?_t=${Date.now()}`,
          );
          if (completeRes.ok) {
            const completeData = await completeRes.json();
            if (
              completeData.businesses &&
              Array.isArray(completeData.businesses)
            ) {
              business = completeData.businesses.find(
                (b: any) => b.id === companyId,
              );
              if (business) {
                console.log(
                  `✅ Found business in complete data: ${business.name}`,
                );
              }
            }
          }
        } catch (error) {
          console.log(
            "⚠️ Complete businesses file not available, trying main file",
          );
        }

        // Fallback to main businesses file
        if (!business) {
          const response = await fetch(
            `/api/dubai-visa-services.json?_t=${Date.now()}`,
          );

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }

          const businesses = await response.json();

          if (!Array.isArray(businesses)) {
            throw new Error("Invalid API response format");
          }

          business = businesses.find((b: any) => b.id === companyId);
        }

        if (!business) {
          throw new Error("Company not found");
        }

        console.log(`✅ Found company: ${business.name}`);

        // Create consistent URL using the utility function
        const modernProfileUrl = createBusinessProfileUrl(business);
        console.log(`➡️ Redirecting to: ${modernProfileUrl}`);

        navigate(modernProfileUrl, {
          replace: true,
          state: { businessData: business }, // Pass business data to avoid re-fetch
        });
      } catch (err) {
        console.error("❌ Error finding company:", err);
        setError(err instanceof Error ? err.message : "Failed to find company");
        setLoading(false);
      }
    };

    findAndRedirectCompany();
  }, [companyId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Looking up company details...</p>
          <p className="text-sm text-gray-500">ID: {companyId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Company Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
          <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-500">
            Company ID: {companyId}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/dubai-businesses")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              Browse All Companies
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors w-full"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Should never reach here due to redirect
}
