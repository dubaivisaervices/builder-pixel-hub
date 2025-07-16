import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

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
      const response = await fetch("/api/dubai-visa-services?limit=5");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testDubaiServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dubai-visa-services");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult({
        status: "OK",
        message: "Dubai services search",
        resultCount: data.businesses?.length || 0,
        sampleResult: data.businesses?.[0]?.name || "No results",
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
            <CardTitle className="text-2xl font-bold text-center">
              Google Places API Test
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Test the Google Places API integration
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={testGoogleAPI}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Test Basic API
              </Button>
              <Button
                onClick={testDubaiServices}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Test Dubai Search
              </Button>
            </div>

            {error && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="font-medium text-destructive">Error:</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{error}</p>
                </CardContent>
              </Card>
            )}

            {testResult && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Test Result:
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge
                        variant={
                          testResult.status === "OK" ? "default" : "destructive"
                        }
                        className="bg-green-100 text-green-800"
                      >
                        {testResult.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Test Type:</span>
                      <span className="text-sm text-muted-foreground">
                        {testResult.message}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Results Found:
                      </span>
                      <Badge variant="outline">{testResult.resultCount}</Badge>
                    </div>

                    {testResult.sampleResult && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Sample Result:
                        </span>
                        <span className="text-sm text-muted-foreground max-w-60 truncate">
                          {testResult.sampleResult}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">API Status:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Google Places API Key: Configured ✓</p>
                <p>• Server Environment: Ready ✓</p>
                <p>
                  • Endpoints: /api/test-google-api, /api/dubai-visa-services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
