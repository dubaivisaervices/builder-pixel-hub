import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface ApiStatus {
  enabled: boolean;
  lastToggled: string;
  reason?: string;
  callsMade: number;
  cacheHits: number;
  mode: string;
  costSavings: string;
}

interface CostReport {
  totalRequests: number;
  apiCalls: number;
  cacheHits: number;
  costSavingsPercentage: number;
  estimatedSavings: string;
  status: string;
}

export default function ApiControlPanel() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [costReport, setCostReport] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/admin/api-status");
      const data = await response.json();

      if (data.success) {
        setApiStatus(data.api);
        setCostReport(data.costs);
        setError(null);
      } else {
        setError("Failed to fetch API status");
      }
    } catch (err) {
      setError("Network error fetching status");
      console.error("Error fetching API status:", err);
    }
  };

  const toggleApi = async (enable: boolean, reason?: string) => {
    setLoading(true);
    try {
      const endpoint = enable
        ? "/api/admin/api-enable"
        : "/api/admin/api-disable";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchStatus();
        setError(null);
      } else {
        setError(data.error || "Failed to toggle API");
      }
    } catch (err) {
      setError("Network error toggling API");
      console.error("Error toggling API:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetCounters = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/api-reset-counters", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        await fetchStatus();
        setError(null);
      } else {
        setError("Failed to reset counters");
      }
    } catch (err) {
      setError("Network error resetting counters");
      console.error("Error resetting counters:", err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/api-test-connection", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        await fetchStatus();
        alert("API connection test successful!");
      } else {
        alert(`API test failed: ${data.message}`);
      }
    } catch (err) {
      alert("Network error testing connection");
      console.error("Error testing connection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!apiStatus || !costReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google API Control</CardTitle>
          <CardDescription>Loading API status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Google Places API Control
            <Badge variant={apiStatus.enabled ? "default" : "secondary"}>
              {apiStatus.enabled ? "ACTIVE" : "DISABLED"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Control Google Places API access and monitor costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {apiStatus.mode}
              </div>
              <div className="text-sm text-gray-600">Current Mode</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {costReport.costSavingsPercentage}%
              </div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {costReport.estimatedSavings}
              </div>
              <div className="text-sm text-gray-600">Estimated Savings</div>
            </div>
          </div>

          <Separator />

          {/* API Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {apiStatus.enabled ? (
              <Button
                onClick={() =>
                  toggleApi(false, "Manual disable via admin panel")
                }
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                🔴 Disable API (Cache Only)
              </Button>
            ) : (
              <Button
                onClick={() => toggleApi(true, "Manual enable via admin panel")}
                disabled={loading}
                className="flex-1"
              >
                🟢 Enable API (Live + Cache)
              </Button>
            )}

            <Button
              onClick={testConnection}
              disabled={loading || !apiStatus.enabled}
              variant="outline"
              className="flex-1"
            >
              🔗 Test Connection
            </Button>

            <Button
              onClick={resetCounters}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              🔄 Reset Counters
            </Button>
          </div>

          {/* Usage Statistics */}
          <div className="space-y-3">
            <h4 className="font-medium">Usage Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold text-red-600">
                  {costReport.apiCalls}
                </div>
                <div className="text-gray-600">API Calls (💰)</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">
                  {costReport.cacheHits}
                </div>
                <div className="text-gray-600">Cache Hits (FREE)</div>
              </div>
              <div>
                <div className="font-semibold">{costReport.totalRequests}</div>
                <div className="text-gray-600">Total Requests</div>
              </div>
              <div>
                <div className="font-semibold">{costReport.status}</div>
                <div className="text-gray-600">Current Status</div>
              </div>
            </div>
          </div>

          {/* Last Action */}
          <div className="text-xs text-gray-500">
            Last toggled: {formatDate(apiStatus.lastToggled)}
            {apiStatus.reason && ` (${apiStatus.reason})`}
          </div>

          {/* Warnings and Tips */}
          {apiStatus.enabled && (
            <Alert>
              <AlertDescription>
                ⚠️ API is ACTIVE - Google Places API calls will cost money.
                Monitor usage and disable when not needed to save costs.
              </AlertDescription>
            </Alert>
          )}

          {!apiStatus.enabled && (
            <Alert>
              <AlertDescription>
                💡 API is DISABLED - System is using cache-only mode. No API
                costs will be incurred. Enable when you need fresh data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cost Report Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
          <CardDescription>
            Understanding your Google API usage and savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span>Cache Efficiency</span>
              <span className="font-bold text-green-600">
                {costReport.costSavingsPercentage}% cache hit rate
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span>Money Saved</span>
              <span className="font-bold text-blue-600">
                {costReport.estimatedSavings}
              </span>
            </div>

            <div className="text-sm text-gray-600 mt-4">
              <p>
                💡 <strong>Tips for cost optimization:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Disable API when not actively needing fresh data</li>
                <li>Run photo downloads periodically to build cache</li>
                <li>
                  Cache hit rates above 80% indicate excellent cost efficiency
                </li>
                <li>Monitor this panel regularly to track usage patterns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
