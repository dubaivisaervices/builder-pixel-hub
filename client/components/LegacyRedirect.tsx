import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function LegacyRedirect() {
  const { location, companyName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect from old /modern-profile/ to new /reviews/ URL
    if (location && companyName) {
      const newUrl = `/reviews/${location}/${companyName}`;
      navigate(newUrl, { replace: true });
    }
  }, [location, companyName, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to new URL...</p>
      </div>
    </div>
  );
}
