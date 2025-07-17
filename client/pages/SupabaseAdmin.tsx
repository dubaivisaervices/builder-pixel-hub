import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  RefreshCw,
  Play,
  Square,
  CheckCircle,
  XCircle,
  Cloud,
  BarChart3,
  Users,
  Star,
  MessageSquare,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface SyncStatus {
  isRunning: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  stats: {
    businessesProcessed: number;
    reviewsProcessed: number;
    errors: string[];
  };
  startTime?: number;
  estimatedTimeRemaining?: number;
}

interface DatabaseStats {
  total_businesses: number;
  average_rating: number;
  total_reviews: number;
  total_categories: number;
}

const SupabaseAdmin: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    googleApi: boolean;
    supabase: boolean;
    errors: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Poll for sync status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollSyncStatus = async () => {
      try {
        const response = await fetch("/api/supabase/sync/status");
        const data = await response.json();
        if (data.success) {
          setSyncStatus(data.status);
        }
      } catch (error) {
        console.error("Error polling sync status:", error);
      }
    };

    // Poll every 2 seconds when sync is running
    if (syncStatus?.isRunning) {
      interval = setInterval(pollSyncStatus, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [syncStatus?.isRunning]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([loadConnectionStatus(), loadDatabaseStats()]);
  };

  const loadConnectionStatus = async () => {
    try {
      const response = await fetch("/api/supabase/test-all");
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      console.error("Error testing connections:", error);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch("/api/supabase/businesses?limit=1");
      const data = await response.json();
      if (data.success && data.stats) {
        setDbStats({
          total_businesses: data.stats.total,
          average_rating: data.stats.avgRating,
          total_reviews: data.stats.totalReviews,
          total_categories: 15, // Placeholder
        });
      }
    } catch (error) {
      console.error("Error loading database stats:", error);
    }
  };

  const startSync = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/supabase/sync/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setSyncStatus(data.status);
        setMessage({
          type: "success",
          text: "Google API to Supabase sync started successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to start sync",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error starting sync: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopSync = async () => {
    try {
      const response = await fetch("/api/supabase/sync/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setSyncStatus(data.status);
        setMessage({
          type: "info",
          text: "Sync stopped successfully",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error stopping sync: ${error.message}`,
      });
    }
  };

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/supabase/test");
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Supabase connection successful!",
        });
        await loadInitialData();
      } else {
        setMessage({
          type: "error",
          text: `Supabase connection failed: ${data.error}`,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Connection test failed: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Supabase Database Management
          </h1>
          <p className="text-gray-600">
            Sync real business data from Google API to Supabase database
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert
            className={
              message.type === "error"
                ? "border-red-200 bg-red-50"
                : message.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-blue-200 bg-blue-50"
            }
          >
            <AlertDescription className="text-sm">
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="font-medium">Google Places API</span>
                </div>
                <Badge
                  variant={
                    connectionStatus?.googleApi ? "default" : "destructive"
                  }
                >
                  {connectionStatus?.googleApi ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {connectionStatus?.googleApi ? "Connected" : "Disconnected"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium">Supabase Database</span>
                </div>
                <Badge
                  variant={
                    connectionStatus?.supabase ? "default" : "destructive"
                  }
                >
                  {connectionStatus?.supabase ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {connectionStatus?.supabase ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={testSupabaseConnection}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Test Connections
              </Button>
              <Button
                onClick={loadConnectionStatus}
                variant="outline"
                size="sm"
              >
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Statistics */}
        {dbStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Database Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {dbStats.total_businesses.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Businesses</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {dbStats.average_rating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {dbStats.total_reviews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {dbStats.total_categories}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Google API Sync Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sync Progress */}
            {syncStatus && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        syncStatus.isRunning
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="font-medium">
                      {syncStatus.isRunning ? "Sync in Progress" : "Sync Idle"}
                    </span>
                  </div>
                  {syncStatus.isRunning &&
                    syncStatus.estimatedTimeRemaining && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {formatTimeRemaining(
                          syncStatus.estimatedTimeRemaining,
                        )}{" "}
                        remaining
                      </div>
                    )}
                </div>

                {syncStatus.isRunning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {syncStatus.progress.current}/
                        {syncStatus.progress.total}
                      </span>
                    </div>
                    <Progress value={syncStatus.progress.percentage} />
                  </div>
                )}

                {/* Sync Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {syncStatus.stats.businessesProcessed}
                    </div>
                    <div className="text-xs text-gray-600">Businesses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {syncStatus.stats.reviewsProcessed}
                    </div>
                    <div className="text-xs text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {syncStatus.stats.errors.length}
                    </div>
                    <div className="text-xs text-gray-600">Errors</div>
                  </div>
                </div>

                {/* Errors */}
                {syncStatus.stats.errors.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2">Sync Errors:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {syncStatus.stats.errors
                          .slice(0, 3)
                          .map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        {syncStatus.stats.errors.length > 3 && (
                          <li>
                            ... and {syncStatus.stats.errors.length - 3} more
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!syncStatus?.isRunning ? (
                <Button
                  onClick={startSync}
                  disabled={
                    isLoading ||
                    !connectionStatus?.googleApi ||
                    !connectionStatus?.supabase
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Google API Sync
                </Button>
              ) : (
                <Button onClick={stopSync} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Sync
                </Button>
              )}

              <Button
                onClick={loadDatabaseStats}
                variant="outline"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh Stats
              </Button>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                📊 What This Sync Does:
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Fetches all Dubai visa/immigration businesses from Google
                  Places API
                </li>
                <li>
                  • Stores real business data, ratings, and reviews in Supabase
                </li>
                <li>• Replaces dummy data with 841+ real business listings</li>
                <li>
                  • Enables live data on your website without local database
                  dependency
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseAdmin;
