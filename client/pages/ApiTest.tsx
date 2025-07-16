import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Loader2, Building2 } from "lucide-react";

interface ApiTestResult {
  status: string;
  message: string;
  resultCount: number;
  sampleResult: string;
}

export default function ApiTest() {
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBusinessAPI = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch("/api/dubai-visa-services?limit=10");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult({
        status: "success",
        message: data.message || "Business API test completed successfully",
        resultCount: data.total || 0,
        sampleResult: data.businesses?.[0]?.name || "No business data",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testHealthAPI = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/health");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult({
        status: "success",
        message: `Health check: ${data.status}`,
        resultCount: data.businessCount || 0,
        sampleResult: `Data source: ${data.dataSource}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Building2 className="h-6 w-6" />
              Business API Test
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Test the business directory API (No Google API dependencies)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={testBusinessAPI}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="mr-2 h-4 w-4" />
                )}
                Test Business Directory
              </Button>
              <Button
                onClick={testHealthAPI}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Test Health Check
              </Button>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Error</span>
                  </div>
                  <p className="text-red-600 mt-2">{error}</p>
                </CardContent>
              </Card>
            )}

            {testResult && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-semibold">Test Results</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100">
                      {testResult.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Message:</span>{" "}
                      {testResult.message}
                    </p>
                    <p>
                      <span className="font-medium">Business Count:</span>{" "}
                      {testResult.resultCount}
                    </p>
                    <p>
                      <span className="font-medium">Sample Result:</span>{" "}
                      {testResult.sampleResult}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  API Information
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Endpoints: /api/dubai-visa-services, /api/health</p>
                  <p>• Data Source: Local business directory (No Google API)</p>
                  <p>• Expected Business Count: 1,114+ or 50+ (fallback)</p>
                  <p>• Response Format: JSON with pagination</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
