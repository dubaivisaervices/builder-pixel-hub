import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
} from "lucide-react";

interface SyncStats {
  totalSynced?: number;
  totalNew?: number;
  totalUpdated?: number;
  duration?: number;
  databaseStats?: {
    total: number;
    categories: number;
    withReviews: number;
  };
}

export default function AdminSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [isClearingReviews, setIsClearingReviews] = useState(false);
  const [isFreshSyncing, setIsFreshSyncing] = useState(false);
  const [isOfflineSyncing, setIsOfflineSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncStats | null>(null);
  const [reviewsSyncResult, setReviewsSyncResult] = useState<any>(null);
  const [clearReviewsResult, setClearReviewsResult] = useState<any>(null);
  const [freshSyncResult, setFreshSyncResult] = useState<any>(null);
  const [offlineSyncResult, setOfflineSyncResult] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOfflinePhotoSync = async () => {
    setIsOfflineSyncing(true);
    setError(null);
    setOfflineSyncResult(null);

    try {
      console.log("Starting offline photo sync...");

      const response = await fetch("/api/sync-offline-photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Offline photo sync completed:", result);

      setOfflineSyncResult(result.stats || {});
      await checkStatus(); // Refresh database stats
    } catch (error) {
      console.error("Offline photo sync failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unknown error occurred during offline photo sync",
      );
    } finally {
      setIsOfflineSyncing(false);
    }
  };

  const handleFreshSync = async () => {
    setIsFreshSyncing(true);
    setError(null);
    setFreshSyncResult(null);

    try {
      console.log("Starting fresh database clear and Google sync...");

      const response = await fetch("/api/clear-and-resync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fresh sync completed:", result);

      setFreshSyncResult(result.stats || {});
      await checkStatus(); // Refresh database stats
    } catch (error) {
      console.error("Fresh sync failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unknown error occurred during fresh sync",
      );
    } finally {
      setIsFreshSyncing(false);
    }
  };

  const handleClearFakeReviews = async () => {
    setIsClearingReviews(true);
    setError(null);
    setClearReviewsResult(null);

    try {
      console.log("Clearing fake reviews and syncing real Google reviews...");

      const response = await fetch("/api/clear-fake-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Clear fake reviews completed:", result);

      setClearReviewsResult(result.stats || {});
      await checkStatus(); // Refresh database stats
    } catch (error) {
      console.error("Clear fake reviews failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unknown error occurred during fake reviews clearing",
      );
    } finally {
      setIsClearingReviews(false);
    }
  };

  const handleReviewsSync = async () => {
    setIsReviewsLoading(true);
    setError(null);
    setReviewsSyncResult(null);

    try {
      console.log("Starting Google reviews sync...");

      const response = await fetch("/api/sync-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Reviews sync completed:", result);

      setReviewsSyncResult(result.stats || {});
      await checkStatus(); // Refresh database stats
    } catch (error) {
      console.error("Reviews sync failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unknown error occurred during reviews sync",
      );
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setSyncResult(null);

    try {
      console.log("Starting Google data sync...");

      const response = await fetch("/api/sync-google-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSyncResult(data.stats);
        console.log("Sync completed successfully:", data.stats);
      } else {
        throw new Error(data.message || "Sync failed");
      }
    } catch (err) {
      console.error("Sync error:", err);
      setError(err instanceof Error ? err.message : "Failed to sync data");
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/sync-status");
      const data = await response.json();

      if (data.success) {
        setDbStats(data.stats);
      }
    } catch (err) {
      console.error("Error checking status:", err);
    }
  };

  // Check status on component mount
  useState(() => {
    checkStatus();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Admin - Google Data Sync
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage Google Places API data synchronization
          </p>
          <div className="mt-4">
            <Button
              onClick={() => window.open("/admin/manage", "_blank")}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Manage Businesses & Categories
            </Button>
          </div>
        </div>

        {/* Current Database Status */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Current Database Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span>Database information:</span>
              <Button variant="outline" size="sm" onClick={checkStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {dbStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dbStats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Businesses
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dbStats.categories}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Categories
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dbStats.withReviews}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    With Reviews
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Click refresh to check database status</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Control */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Google Data Sync</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">
                    Important Information
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    This process fetches fresh data from Google Places API and
                    updates the database. It may take 2-3 minutes to complete
                    and will update existing businesses with new information.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Button
                onClick={handleOfflinePhotoSync}
                disabled={
                  isLoading ||
                  isReviewsLoading ||
                  isClearingReviews ||
                  isFreshSyncing ||
                  isOfflineSyncing
                }
                variant="default"
                size="lg"
                className="min-w-[200px] bg-purple-600 hover:bg-purple-700"
              >
                {isOfflineSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Downloading Photos...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Photos Offline
                  </>
                )}
              </Button>

              <Button
                onClick={handleFreshSync}
                disabled={
                  isLoading ||
                  isReviewsLoading ||
                  isClearingReviews ||
                  isFreshSyncing ||
                  isOfflineSyncing
                }
                variant="default"
                size="lg"
                className="min-w-[200px] bg-green-600 hover:bg-green-700"
              >
                {isFreshSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Fresh Syncing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Fresh Sync (Clear & Reload)
                  </>
                )}
              </Button>

              <Button
                onClick={handleSync}
                disabled={
                  isLoading ||
                  isReviewsLoading ||
                  isClearingReviews ||
                  isFreshSyncing
                }
                size="lg"
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Sync Google Data
                  </>
                )}
              </Button>

              <Button
                onClick={handleClearFakeReviews}
                disabled={
                  isLoading ||
                  isReviewsLoading ||
                  isClearingReviews ||
                  isFreshSyncing
                }
                variant="destructive"
                size="lg"
                className="min-w-[200px]"
              >
                {isClearingReviews ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Clearing Fake Reviews...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Fake Reviews & Sync Real
                  </>
                )}
              </Button>

              <Button
                onClick={handleReviewsSync}
                disabled={
                  isLoading ||
                  isReviewsLoading ||
                  isClearingReviews ||
                  isFreshSyncing
                }
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                {isReviewsLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing Reviews...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Real Google Reviews
                  </>
                )}
              </Button>
            </div>

            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <h3 className="font-medium text-blue-800">
                      Sync in Progress
                    </h3>
                    <p className="text-sm text-blue-700">
                      Fetching businesses from Google Places API and updating
                      database...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offline Photo Sync Results */}
        {offlineSyncResult && (
          <Card className="shadow-lg border-0 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <CheckCircle className="h-5 w-5" />
                <span>Offline Photo Sync Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-purple-800">
                      Photos Downloaded Successfully
                    </h3>
                    <p className="text-sm text-purple-700">
                      All business photos are now stored offline in the database
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {offlineSyncResult.totalSynced || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Businesses Processed
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {offlineSyncResult.photosDownloaded || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Photos Downloaded
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {offlineSyncResult.businessesWithPhotos || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    With Photos
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {offlineSyncResult.duration || 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fresh Sync Results */}
        {freshSyncResult && (
          <Card className="shadow-lg border-0 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span>Fresh Sync Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      Fresh Sync Completed Successfully
                    </h3>
                    <p className="text-sm text-green-700">
                      Database cleared and fresh Google data with unique photos
                      synced
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {freshSyncResult.totalSynced || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Synced
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {freshSyncResult.totalNew || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    New Businesses
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {freshSyncResult.businessesWithPhotos || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    With Photos
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {freshSyncResult.duration || 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Sync Results */}
        {reviewsSyncResult && (
          <Card className="shadow-lg border-0 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <CheckCircle className="h-5 w-5" />
                <span>Reviews Sync Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-800">
                      Reviews Sync Completed Successfully
                    </h3>
                    <p className="text-sm text-blue-700">
                      Real Google reviews have been fetched and updated in the
                      database
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {reviewsSyncResult.businessesProcessed || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Businesses Processed
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {reviewsSyncResult.reviewsUpdated || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Updated with Reviews
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {reviewsSyncResult.duration || 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Results */}
        {syncResult && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Sync Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      Sync Completed Successfully
                    </h3>
                    <p className="text-sm text-green-700">
                      Google data has been synchronized with the database
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {syncResult.totalSynced || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Synced
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {syncResult.totalNew || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    New Businesses
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {syncResult.totalUpdated || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {syncResult.duration || 0}s
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>

              {syncResult.databaseStats && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Database Summary</h4>
                  <div className="text-sm text-muted-foreground">
                    Total: {syncResult.databaseStats.total} businesses •
                    Categories: {syncResult.databaseStats.categories} • With
                    Reviews: {syncResult.databaseStats.withReviews}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="shadow-lg border-0 border-red-200">
            <CardContent className="pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">Sync Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
