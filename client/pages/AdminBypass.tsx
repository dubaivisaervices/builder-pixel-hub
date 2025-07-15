import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, Key, ArrowRight } from "lucide-react";

function AdminBypass() {
  const [loginStatus, setLoginStatus] = useState<string>("checking");
  const navigate = useNavigate();

  useEffect(() => {
    performAutoLogin();
  }, []);

  const performAutoLogin = async () => {
    try {
      // Get admin credentials
      const statusResponse = await fetch("/api/admin/status");
      const statusData = await statusResponse.json();

      if (statusData.success) {
        // Perform login
        const loginResponse = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminId: statusData.credentials.adminId,
            password: statusData.credentials.password,
          }),
        });

        const loginData = await loginResponse.json();

        if (loginData.success) {
          // Set localStorage auth
          localStorage.setItem("admin_authenticated", "true");
          setLoginStatus("success");
        } else {
          setLoginStatus("failed");
        }
      } else {
        setLoginStatus("failed");
      }
    } catch (error) {
      console.error("Auto-login error:", error);
      setLoginStatus("failed");
    }
  };

  const goToUploadPage = () => {
    navigate("/hostinger-upload");
  };

  const goToImageManager = () => {
    navigate("/admin-images");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel Auto-Login
          </h1>
          <p className="text-gray-600">
            Automatic authentication for Dubai Business Directory admin panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Admin Authentication Status
            </CardTitle>
            <CardDescription>
              Logging in with admin credentials automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginStatus === "checking" && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800">
                  Authenticating with admin credentials...
                </span>
              </div>
            )}

            {loginStatus === "success" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    ✅ Admin login successful!
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">
                    Choose admin panel section:
                  </h3>

                  <Button
                    onClick={goToUploadPage}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    🚀 Google Places → Hostinger Upload
                  </Button>

                  <Button
                    onClick={goToImageManager}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    📁 Business Image Manager
                  </Button>
                </div>
              </div>
            )}

            {loginStatus === "failed" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-800">
                  ❌ Admin login failed. Please check credentials.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Admin ID:</strong> crossborder_admin
              </p>
              <p>
                <strong>Password:</strong> Dubai@2024!Upload
              </p>
              <p className="text-gray-600 mt-3">
                These credentials are automatically used for authentication.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminBypass;
