import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const DataDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState({
    staticData: { status: "pending", data: null, error: null },
    apiData: { status: "pending", data: null, error: null },
    fallbackData: { status: "pending", data: null, error: null },
  });
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const newDiagnostics = { ...diagnostics };

    // Test 1: Static Data from /data/businesses.json
    console.log("🔍 Testing static data loading...");
    try {
      const response = await fetch("/data/businesses.json");
      if (response.ok) {
        const data = await response.json();
        newDiagnostics.staticData = {
          status: "success",
          data: {
            businessCount: data.businesses?.length || 0,
            categories: data.categories?.length || 0,
            fileSize: response.headers.get("content-length"),
            dataStructure: data.meta || "No meta info",
          },
          error: null,
        };
        console.log(
          "✅ Static data loaded successfully:",
          data.businesses?.length,
          "businesses",
        );
      } else {
        newDiagnostics.staticData = {
          status: "error",
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
        console.log("❌ Static data failed:", response.status);
      }
    } catch (error) {
      newDiagnostics.staticData = {
        status: "error",
        data: null,
        error: error.message,
      };
      console.log("❌ Static data error:", error.message);
    }

    // Test 2: API Data from /api/dubai-visa-services
    console.log("🔍 Testing API data loading...");
    try {
      const response = await fetch("/api/dubai-visa-services?limit=10");
      if (response.ok) {
        const data = await response.json();
        newDiagnostics.apiData = {
          status: "success",
          data: {
            businessCount: data.businesses?.length || 0,
            source: data.source || "unknown",
            message: data.message || "No message",
          },
          error: null,
        };
        console.log("✅ API data loaded successfully");
      } else {
        newDiagnostics.apiData = {
          status: "error",
          data: null,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
        console.log("❌ API data failed:", response.status);
      }
    } catch (error) {
      newDiagnostics.apiData = {
        status: "error",
        data: null,
        error: error.message,
      };
      console.log("❌ API data error:", error.message);
    }

    // Test 3: Check if we have any fallback data in the build
    console.log("🔍 Testing fallback mechanisms...");
    try {
      // Try different possible paths
      const paths = [
        "/data/businesses.json",
        "/assets/data/businesses.json",
        "/businesses.json",
        "/static/businesses.json",
      ];

      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const data = await response.json();
            newDiagnostics.fallbackData = {
              status: "success",
              data: {
                foundPath: path,
                businessCount: data.businesses?.length || 0,
                working: true,
              },
              error: null,
            };
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }

      if (newDiagnostics.fallbackData.status === "pending") {
        newDiagnostics.fallbackData = {
          status: "error",
          data: null,
          error: "No data found in any fallback paths",
        };
      }
    } catch (error) {
      newDiagnostics.fallbackData = {
        status: "error",
        data: null,
        error: error.message,
      };
    }

    setDiagnostics(newDiagnostics);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-yellow-200 bg-yellow-50";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-6 w-6" />
            <span>Report Visa Scam - Data Connection Diagnostics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={runDiagnostics}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Run Diagnostics</span>
            </Button>
            {loading && (
              <span className="text-gray-500">Testing data connections...</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-1 gap-6">
        {/* Static Data Test */}
        <Card className={`${getStatusColor(diagnostics.staticData.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(diagnostics.staticData.status)}
              <span>Static Data Loading (/data/businesses.json)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diagnostics.staticData.status === "success" &&
            diagnostics.staticData.data ? (
              <div className="space-y-2">
                <p className="text-green-700 font-semibold">
                  ✅ Static data is working!
                </p>
                <p>
                  📊 Business count: {diagnostics.staticData.data.businessCount}
                </p>
                <p>📁 Categories: {diagnostics.staticData.data.categories}</p>
                <p>
                  📦 File size: {diagnostics.staticData.data.fileSize} bytes
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-700 font-semibold">
                  ❌ Static data failed
                </p>
                <p className="text-sm text-red-600">
                  Error: {diagnostics.staticData.error}
                </p>
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This means the /data/businesses.json file is not accessible.
                    The website will show dummy data.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Data Test */}
        <Card className={`${getStatusColor(diagnostics.apiData.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(diagnostics.apiData.status)}
              <span>API Data Loading (/api/dubai-visa-services)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diagnostics.apiData.status === "success" &&
            diagnostics.apiData.data ? (
              <div className="space-y-2">
                <p className="text-green-700 font-semibold">
                  ✅ API is working!
                </p>
                <p>
                  📊 Business count: {diagnostics.apiData.data.businessCount}
                </p>
                <p>🔗 Source: {diagnostics.apiData.data.source}</p>
                <p>💬 Message: {diagnostics.apiData.data.message}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-orange-700 font-semibold">
                  ⚠️ API not available (Expected for static hosting)
                </p>
                <p className="text-sm text-orange-600">
                  Error: {diagnostics.apiData.error}
                </p>
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This is normal for static hosting. The website should use
                    static data instead.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fallback Test */}
        <Card className={`${getStatusColor(diagnostics.fallbackData.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(diagnostics.fallbackData.status)}
              <span>Fallback Data Detection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diagnostics.fallbackData.status === "success" &&
            diagnostics.fallbackData.data ? (
              <div className="space-y-2">
                <p className="text-green-700 font-semibold">
                  ✅ Found working data source!
                </p>
                <p>📍 Path: {diagnostics.fallbackData.data.foundPath}</p>
                <p>
                  📊 Business count:{" "}
                  {diagnostics.fallbackData.data.businessCount}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-700 font-semibold">
                  ❌ No fallback data found
                </p>
                <p className="text-sm text-red-600">
                  Error: {diagnostics.fallbackData.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overall Status */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            {diagnostics.staticData.status === "success" ? (
              <div className="text-green-700">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">
                  ✅ Data Connection Working
                </h3>
                <p>All 841 businesses should be visible on the website</p>
              </div>
            ) : (
              <div className="text-red-700">
                <XCircle className="h-8 w-8 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">
                  ❌ Data Connection Issue
                </h3>
                <p>Website will show dummy data instead of real businesses</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDiagnostic;
