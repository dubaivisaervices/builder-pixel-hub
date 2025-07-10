// Modern Company Profile - Redirect to new design
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CompanyReviewsWorking() {
  const { location: locationParam, companyName } = useParams();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects and DOM issues
    if (!hasRedirected.current && locationParam && companyName) {
      hasRedirected.current = true;

      // Use setTimeout to avoid DOM manipulation conflicts
      const timer = setTimeout(() => {
        const newPath = `/modern-profile/${locationParam}/${companyName}`;
        navigate(newPath, { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [locationParam, companyName, navigate]);

  // Early return to prevent rendering issues
  if (!locationParam || !companyName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Invalid company parameters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600">Redirecting to modern profile...</p>
      </div>
    </div>
  );
}
