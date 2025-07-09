// Modern Company Profile - Redirect to new design
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CompanyReviewsWorking() {
  const { location: locationParam, companyName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to new modern profile page
    const newPath = `/${locationParam}/${companyName}`;
    navigate(newPath, { replace: true });
  }, [locationParam, companyName, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Redirecting to modern profile...</p>
      </div>
    </div>
  );
}
