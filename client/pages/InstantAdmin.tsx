import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function InstantAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Instantly set admin authentication
    localStorage.setItem("admin_authenticated", "true");

    // Redirect to upload page immediately
    navigate("/hostinger-upload");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Accessing admin panel...</p>
      </div>
    </div>
  );
}

export default InstantAdmin;
