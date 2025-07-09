import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Star,
  Download,
  Database,
  BarChart3,
  Clock,
  RotateCcw,
} from "lucide-react";

interface SyncStats {
  totalBusinesses: number;
  businessesWithReviews: number;
  businessesWithoutReviews: number;
  syncCoverage: number;
  lastSyncTime: string;
  apiKeyConfigured: boolean;
}

interface SyncResult {
  success: boolean;
  totalBusinesses: number;
  processedBusinesses: number;
  totalReviewsFetched: number;
  totalReviewsSaved: number;
  errors: string[];
  duration: string;
  summary: {
    successRate: string;
    averageReviewsPerBusiness: number;
    apiCallsUsed: number;
  };
}

export default function ReviewsSync() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/review-sync-stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAllReviews = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);

      const response = await fetch("/api/admin/sync-all-reviews", {
        method: "POST",
      });
      const result = await response.json();
      setSyncResult(result);

      // Refresh stats after sync
      await fetchStats();
    } catch (error) {
      console.error("Error syncing reviews:", error);
      setSyncResult({
        success: false,
        totalBusinesses: 0,
        processedBusinesses: 0,
        totalReviewsFetched: 0,
        totalReviewsSaved: 0,
        errors: ["Failed to sync reviews: " + (error as Error).message],
        duration: "0ms",
        summary: {
          successRate: "0%",
          averageReviewsPerBusiness: 0,
          apiCallsUsed: 0,
        },
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <RotateCcw className="h-6 w-6" />
                  <span>Google Reviews Sync</span>
                </h1>
                <p className="text-gray-600">
                  Fetch and cache real Google reviews for all businesses
                </p>
              </div>
            </div>
            <Button
              onClick={fetchStats}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Database className="h-4 w-4 text-blue-600" />
                <span>Total Businesses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.totalBusinesses || 0}
              </div>
              <p className="text-xs text-gray-600">In database</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Star className="h-4 w-4 text-green-600" />
                <span>With Reviews</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.businessesWithReviews || 0}
              </div>
              <p className="text-xs text-gray-600">Have Google reviews</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span>Sync Coverage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.syncCoverage || 0}%
              </div>
              <p className="text-xs text-gray-600">Businesses synced</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>API Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {stats?.apiKeyConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    stats?.apiKeyConfigured ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats?.apiKeyConfigured ? "Connected" : "Not Configured"}
                </span>
              </div>
              <p className="text-xs text-gray-600">Google Places API</p>
            </CardContent>
          </Card>
        </div>

        {/* Sync Action */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                🚀 Sync All Google Reviews
              </h2>
              <p className="text-blue-100 max-w-2xl mx-auto mb-6">
                Fetch real Google reviews for all businesses and cache them in
                our database. This ensures we have authentic reviews and reduces
                API calls for future requests.
              </p>

              <Button
                onClick={handleSyncAllReviews}
                disabled={syncing || !stats?.apiKeyConfigured}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-0 px-8 py-4 text-lg font-bold"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Syncing Reviews...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Start Sync Process
                  </>
                )}
              </Button>

              {!stats?.apiKeyConfigured && (
                <p className="text-sm text-red-200 mt-4">
                  ⚠️ Google Places API key required. Configure in environment
                  variables.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sync Results */}
        {syncResult && (
          <Card
            className={`shadow-xl border-0 mb-8 ${
              syncResult.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                {syncResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
                <h3
                  className={`text-lg font-bold ${
                    syncResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {syncResult.success
                    ? "Reviews Sync Completed!"
                    : "Sync Completed with Issues"}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">
                    {syncResult.processedBusinesses}
                  </div>
                  <div className="text-sm text-gray-600">
                    Businesses Processed
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">
                    {syncResult.totalReviewsSaved}
                  </div>
                  <div className="text-sm text-gray-600">Reviews Saved</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">
                    {syncResult.summary.successRate}
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">{syncResult.duration}</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
              </div>

              {syncResult.errors.length > 0 && (
                <div className="bg-red-100 border border-red-300 rounded p-3">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Issues ({syncResult.errors.length}):
                  </h4>
                  <div className="max-h-32 overflow-y-auto">
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                      {syncResult.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {syncResult.errors.length > 10 && (
                        <li>
                          ... and {syncResult.errors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>📋 How Google Reviews Sync Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  🔄 Sync Process
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Fetch all businesses from database</li>
                  <li>For each business, call Google Places API</li>
                  <li>
                    Download all available reviews (usually 5-30 per business)
                  </li>
                  <li>Save reviews to database for future use</li>
                  <li>Update business ratings and review counts</li>
                  <li>Generate fallback reviews if none found (minimum 30)</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  ✨ Benefits
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                  <li>Real authentic Google reviews displayed</li>
                  <li>Reduced API calls (cached in database)</li>
                  <li>Minimum 30 reviews guaranteed per business</li>
                  <li>Faster page load times</li>
                  <li>Backup system if Google API unavailable</li>
                  <li>Updated business ratings from Google</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
