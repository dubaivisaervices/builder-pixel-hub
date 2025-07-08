import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Cloud,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Settings,
  BarChart3,
  Users,
  Image,
  MessageSquare,
  Building2,
} from "lucide-react";

interface SyncProgress {
  isRunning: boolean;
  progress: number;
  currentOperation: string;
  totalOperations: number;
  completedOperations: number;
  errors: string[];
  results?: any;
}

interface DatabaseStats {
  totalBusinesses: number;
  totalReviews: number;
  totalPhotos: number;
  lastSyncDate: string;
}

export default function Admin() {
  const [databaseSync, setDatabaseSync] = useState<SyncProgress>({
    isRunning: false,
    progress: 0,
    currentOperation: "",
    totalOperations: 0,
    completedOperations: 0,
    errors: [],
  });

  const [googleSync, setGoogleSync] = useState<SyncProgress>({
    isRunning: false,
    progress: 0,
    currentOperation: "",
    totalOperations: 0,
    completedOperations: 0,
    errors: [],
  });

  const [databaseStats, setDatabaseStats] = useState<DatabaseStats>({
    totalBusinesses: 0,
    totalReviews: 0,
    totalPhotos: 0,
    lastSyncDate: "",
  });

  // Load database stats on component mount
  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const stats = await response.json();
      setDatabaseStats(stats);
    } catch (error) {
      console.error("Failed to load database stats:", error);
    }
  };

  const startDatabaseSync = async () => {
    setDatabaseSync((prev) => ({
      ...prev,
      isRunning: true,
      progress: 0,
      errors: [],
    }));

    try {
      const response = await fetch("/api/admin/sync-database", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Simulate progress tracking
      const operations = [
        "Loading businesses",
        "Processing reviews",
        "Optimizing photos",
        "Building indexes",
      ];

      for (let i = 0; i < operations.length; i++) {
        setDatabaseSync((prev) => ({
          ...prev,
          currentOperation: operations[i],
          completedOperations: i,
          totalOperations: operations.length,
          progress: ((i + 1) / operations.length) * 100,
        }));

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      const result = await response.json();
      setDatabaseSync((prev) => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentOperation: "Completed",
        results: result,
      }));

      loadDatabaseStats(); // Refresh stats
    } catch (error) {
      setDatabaseSync((prev) => ({
        ...prev,
        isRunning: false,
        errors: [
          ...prev.errors,
          error instanceof Error ? error.message : "Unknown error",
        ],
      }));
    }
  };

  const startGoogleApiSync = async () => {
    setGoogleSync((prev) => ({
      ...prev,
      isRunning: true,
      progress: 0,
      errors: [],
    }));

    try {
      const response = await fetch("/api/admin/sync-google", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Simulate progress tracking for Google API sync
      const operations = [
        "Connecting to Google API",
        "Searching Dubai businesses",
        "Fetching business details",
        "Downloading photos",
        "Processing reviews",
        "Saving to database",
      ];

      for (let i = 0; i < operations.length; i++) {
        setGoogleSync((prev) => ({
          ...prev,
          currentOperation: operations[i],
          completedOperations: i,
          totalOperations: operations.length,
          progress: ((i + 1) / operations.length) * 100,
        }));

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const result = await response.json();
      setGoogleSync((prev) => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentOperation: "Completed",
        results: result,
      }));

      loadDatabaseStats(); // Refresh stats
    } catch (error) {
      setGoogleSync((prev) => ({
        ...prev,
        isRunning: false,
        errors: [
          ...prev.errors,
          error instanceof Error ? error.message : "Unknown error",
        ],
      }));
    }
  };

  const clearDatabase = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all data? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
      });

      if (response.ok) {
        loadDatabaseStats();
        alert("Database cleared successfully");
      } else {
        throw new Error("Failed to clear database");
      }
    } catch (error) {
      alert(
        "Error clearing database: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage Dubai visa services database and synchronization
          </p>
        </div>

        {/* Database Statistics */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-800">
                  {databaseStats.totalBusinesses}
                </div>
                <div className="text-sm text-blue-600">Businesses</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-800">
                  {databaseStats.totalReviews}
                </div>
                <div className="text-sm text-green-600">Reviews</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Image className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-800">
                  {databaseStats.totalPhotos}
                </div>
                <div className="text-sm text-purple-600">Photos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="text-sm font-bold text-gray-800">Last Sync</div>
                <div className="text-xs text-gray-600">
                  {databaseStats.lastSyncDate || "Never"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo and Review Status */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="h-5 w-5 mr-2 text-orange-600" />
              Photo & Review Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-800">
                    {databaseStats.photosSaved || 0} /{" "}
                    {databaseStats.expectedPhotos || 4072}
                  </div>
                  <div className="text-xs text-orange-600">
                    Photos Saved Locally
                  </div>
                </div>
                <div className="text-center p-3 bg-white/50 rounded-lg">
                  <div className="text-lg font-bold text-green-800">
                    {databaseStats.realReviews || 0}
                  </div>
                  <div className="text-xs text-green-600">Real Reviews</div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/admin/download-photos",
                        { method: "POST" },
                      );
                      const result = await response.json();
                      alert(
                        `Photos downloaded: ${result.totalPhotosDownloaded || 0}`,
                      );
                      loadDatabaseStats();
                    } catch (error) {
                      alert("Failed to download photos");
                    }
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Photos
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/sync-reviews", {
                        method: "POST",
                      });
                      const result = await response.json();
                      alert(`Reviews synced: ${result.totalReviewsSaved || 0}`);
                      loadDatabaseStats();
                    } catch (error) {
                      alert("Failed to sync reviews");
                    }
                  }}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Sync All Reviews
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/admin/sync-status");
                      const status = await response.json();
                      console.log("Sync Status:", status);
                      alert(
                        `Status: ${status.photos.savedLocally}/${status.photos.total} photos, ${status.reviews.total} reviews`,
                      );
                    } catch (error) {
                      alert("Failed to check status");
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Check Detailed Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Sync Section */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Database Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Internal Database Sync
                  </h3>
                  <Badge
                    variant={databaseSync.isRunning ? "default" : "secondary"}
                  >
                    {databaseSync.isRunning ? "Running" : "Ready"}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">
                  Optimize and reorganize existing database records, reviews,
                  and photos.
                </p>

                {databaseSync.isRunning && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{databaseSync.currentOperation}</span>
                      <span>
                        {databaseSync.completedOperations}/
                        {databaseSync.totalOperations}
                      </span>
                    </div>
                    <Progress value={databaseSync.progress} className="h-3" />
                    <div className="text-xs text-gray-500 text-center">
                      {Math.round(databaseSync.progress)}% Complete
                    </div>
                  </div>
                )}

                {databaseSync.results && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">
                        Sync completed successfully
                      </span>
                    </div>
                  </div>
                )}

                {databaseSync.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        Errors:
                      </span>
                    </div>
                    {databaseSync.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-700">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={startDatabaseSync}
                    disabled={databaseSync.isRunning || googleSync.isRunning}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {databaseSync.isRunning
                      ? "Syncing..."
                      : "Start Database Sync"}
                  </Button>

                  <Button
                    onClick={clearDatabase}
                    disabled={databaseSync.isRunning || googleSync.isRunning}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Clear Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google API Sync Section */}
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-green-600" />
                Google API Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Google Places Sync</h3>
                  <Badge
                    variant={googleSync.isRunning ? "default" : "secondary"}
                  >
                    {googleSync.isRunning ? "Running" : "Ready"}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">
                  Fetch fresh data from Google Places API including businesses,
                  reviews, and photos.
                </p>

                {googleSync.isRunning && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{googleSync.currentOperation}</span>
                      <span>
                        {googleSync.completedOperations}/
                        {googleSync.totalOperations}
                      </span>
                    </div>
                    <Progress value={googleSync.progress} className="h-3" />
                    <div className="text-xs text-gray-500 text-center">
                      {Math.round(googleSync.progress)}% Complete - Est.{" "}
                      {Math.round((100 - googleSync.progress) * 0.3)} seconds
                      remaining
                    </div>
                  </div>
                )}

                {googleSync.results && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">
                        Google sync completed successfully
                      </span>
                    </div>
                  </div>
                )}

                {googleSync.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        Errors:
                      </span>
                    </div>
                    {googleSync.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-700">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={startGoogleApiSync}
                    disabled={databaseSync.isRunning || googleSync.isRunning}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Cloud className="h-4 w-4 mr-2" />
                    {googleSync.isRunning
                      ? "Syncing..."
                      : "Start Google API Sync"}
                  </Button>

                  <Button variant="outline" className="w-full" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    API Settings (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <Download className="h-5 w-5 mb-1" />
                <span className="text-xs">Export Data</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Upload className="h-5 w-5 mb-1" />
                <span className="text-xs">Import Data</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
