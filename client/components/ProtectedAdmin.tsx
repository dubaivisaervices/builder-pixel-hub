import React, { useState, useEffect } from "react";
import SecureAdminAuth from "./SecureAdminAuth";

interface ProtectedAdminProps {
  children: React.ReactNode;
}

export function ProtectedAdmin({ children }: ProtectedAdminProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const authStatus = localStorage.getItem("admin_authenticated");
    setIsAuthenticated(authStatus === "true");
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Admin Header with logout */}
      <div className="bg-blue-600 text-white p-3 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-semibold">Report Visa Scam - Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
