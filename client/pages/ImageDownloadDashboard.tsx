import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Camera,
  Download,
  Image,
  Building2,
  DollarSign,
  Wifi,
  WifiOff,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Activity,
  TrendingUp,
  Clock,
  Users,
  FileImage,
  Zap,
  Shield,
  Database,
} from "lucide-react";
import CacheStatusIndicator from "@/components/CacheStatusIndicator";

interface ApiStatus {
  connected: boolean;
  totalCalls: number;
  costToday: number;
  lastActivity: string;
}

interface DownloadProgress {
  type: "logos" | "photos";
  progress: number;
  current: number;
  total: number;
  completed: number;
  errors: number;
  isRunning: boolean;
}

interface ImageStats {
  totalBusinesses: number;
  logosDownloaded: number;
  photosDownloaded: number;
  totalImages: number;
  cacheCoverage: number;
  lastDownloadTime?: string;
  businessesWithPhotos: number;
  downloadedToday: number;
}

export default function ImageDownloadDashboard() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    connected: false,
    totalCalls: 0,
    costToday: 0,
    lastActivity: "",
  });

  const [imageStats, setImageStats] = useState<ImageStats>({
    totalBusinesses: 0,
    logosDownloaded: 0,
    photosDownloaded: 0,
    totalImages: 0,
    cacheCoverage: 0,
  });

  const [logoProgress, setLogoProgress] = useState<DownloadProgress>({
    type: "logos",
    progress: 0,
    current: 0,
    total: 0,
    completed: 0,
    errors: 0,
    isRunning: false,
  });

  const [photoProgress, setPhotoProgress] = useState<DownloadProgress>({
    type: "photos",
    progress: 0,
    current: 0,
    total: 0,
    completed: 0,
    errors: 0,
    isRunning: false,
  });

  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch status on component mount
  useEffect(() => {
    fetchApiStatus();
    fetchImageStats();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const response = await fetch("/api/admin/api-status", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response type - expected JSON");
      }

      const data = await response.json();
      setApiStatus({
        connected: data.api?.enabled || false,
        totalCalls: data.costs?.apiCalls || 0,
        costToday: parseFloat(
          data.costs?.estimatedCost?.replace("$", "") || "0",
        ),
        lastActivity: data.api?.lastToggled || "",
      });
    } catch (error) {
      console.error("Failed to fetch API status:", error);
      // Set default disconnected state on error
      setApiStatus({
        connected: false,
        totalCalls: 0,
        costToday: 0,
        lastActivity: "",
      });
    }
  };

  const fetchImageStats = async () => {
    try {
      const response = await fetch("/api/admin/sync-status", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Get additional image details
      const logoStatsResponse = await fetch("/api/admin/logo-stats", {
        cache: "no-store",
      });
      const logoStats = logoStatsResponse.ok
        ? await logoStatsResponse.json()
        : {};

      setImageStats({
        totalBusinesses: data.totalBusinesses || 0,
        businessesWithPhotos: data.photos?.businessesWithPhotos || 0,
        logosDownloaded: logoStats.logos?.downloaded || 0,
        photosDownloaded: data.photos?.savedLocally || 0,
        totalImages: data.photos?.total || 0,
        cacheCoverage: data.photos?.percentage || 0,
        lastDownloadTime: logoStats.lastDownload || null,
        downloadedToday: logoStats.downloadedToday || 0,
      });
    } catch (error) {
      console.error("Failed to fetch image stats:", error);
      // Set default values on error
      setImageStats({
        totalBusinesses: 0,
        businessesWithPhotos: 0,
        logosDownloaded: 0,
        photosDownloaded: 0,
        totalImages: 0,
        cacheCoverage: 0,
        downloadedToday: 0,
      });
    }
  };

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchApiStatus(), fetchImageStats()]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const connectApi = async () => {
    try {
      const response = await fetch("/api/admin/api-enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Image download session" }),
      });
      if (response.ok) {
        await fetchApiStatus();
      }
    } catch (error) {
      console.error("Failed to connect API:", error);
    }
  };

  const disconnectApi = async () => {
    try {
      const response = await fetch("/api/admin/api-disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Cost saving - image download complete",
        }),
      });
      if (response.ok) {
        await fetchApiStatus();
        setShowDisconnectDialog(false);
      }
    } catch (error) {
      console.error("Failed to disconnect API:", error);
    }
  };

  const downloadLogos = async () => {
    setLogoProgress((prev) => ({ ...prev, isRunning: true, progress: 0 }));

    try {
      const response = await fetch("/api/admin/download-logos", {
        method: "POST",
      });

      if (response.ok) {
        // Simulate progress for demo - in real implementation, you'd use WebSocket or polling
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setLogoProgress((prev) => ({
              ...prev,
              isRunning: false,
              progress: 100,
              completed: prev.total,
            }));
            fetchImageStats();
          } else {
            setLogoProgress((prev) => ({
              ...prev,
              progress,
              current: Math.floor((progress / 100) * prev.total),
            }));
          }
        }, 500);
      }
    } catch (error) {
      console.error("Failed to download logos:", error);
      setLogoProgress((prev) => ({ ...prev, isRunning: false }));
    }
  };

  const downloadPhotos = async () => {
    setPhotoProgress((prev) => ({ ...prev, isRunning: true, progress: 0 }));

    try {
      const response = await fetch("/api/admin/download-photos", {
        method: "POST",
      });

      if (response.ok) {
        // Simulate progress for demo
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 5; // Slower for photos
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setPhotoProgress((prev) => ({
              ...prev,
              isRunning: false,
              progress: 100,
              completed: prev.total,
            }));
            fetchImageStats();
          } else {
            setPhotoProgress((prev) => ({
              ...prev,
              progress,
              current: Math.floor((progress / 100) * prev.total),
            }));
          }
        }, 800);
      }
    } catch (error) {
      console.error("Failed to download photos:", error);
      setPhotoProgress((prev) => ({ ...prev, isRunning: false }));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Image Download Dashboard
            </h1>
            <p className="text-gray-600">
              Manage API costs by downloading logos and business photos
              separately
            </p>
          </div>
          <Button
            onClick={refreshAllData}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* API Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Status</p>
                <div className="flex items-center mt-2">
                  {apiStatus.connected ? (
                    <>
                      <Wifi className="h-5 w-5 text-green-500 mr-2" />
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Connected
                      </Badge>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-5 w-5 text-red-500 mr-2" />
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        Disconnected
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  API Calls Today
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {apiStatus.totalCalls}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ${apiStatus.costToday.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Cache Coverage
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {imageStats.cacheCoverage}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Control Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            API Connection Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Google Places API</h3>
              <p className="text-sm text-gray-600">
                {apiStatus.connected
                  ? "API is active and incurring costs. Disconnect when done downloading."
                  : "API is disconnected to save costs. Connect to download images."}
              </p>
            </div>
            <div className="flex space-x-3">
              {!apiStatus.connected ? (
                <Button
                  onClick={connectApi}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect API
                </Button>
              ) : (
                <Dialog
                  open={showDisconnectDialog}
                  onOpenChange={setShowDisconnectDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <WifiOff className="h-4 w-4 mr-2" />
                      Disconnect API
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Disconnect Google API?</DialogTitle>
                      <DialogDescription>
                        This will stop all API calls and save costs. You can
                        reconnect anytime to download more images.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end space-x-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowDisconnectDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={disconnectApi}>
                        Disconnect & Save Costs
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Status Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Image Cache Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CacheStatusIndicator
            totalImages={imageStats.totalImages}
            cachedImages={
              imageStats.photosDownloaded + imageStats.logosDownloaded
            }
            apiCallsNeeded={
              imageStats.totalImages - imageStats.photosDownloaded
            }
            moneySaved={`$${((imageStats.photosDownloaded + imageStats.logosDownloaded) * 0.017).toFixed(2)}`}
          />
        </CardContent>
      </Card>

      {/* Image Download Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Logo Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Business Logos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Download Company Logos</p>
                  <p className="text-sm text-gray-600">
                    {imageStats.logosDownloaded} of {imageStats.totalBusinesses}{" "}
                    logos cached
                  </p>
                  {imageStats.lastDownloadTime && (
                    <p className="text-xs text-gray-500">
                      Last download:{" "}
                      {new Date(
                        imageStats.lastDownloadTime,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <FileImage className="h-8 w-8 text-blue-500" />
              </div>

              {logoProgress.isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Downloading logos...</span>
                    <span>{Math.round(logoProgress.progress)}%</span>
                  </div>
                  <Progress value={logoProgress.progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {logoProgress.current} of {logoProgress.total} completed
                  </p>
                </div>
              )}

              <Button
                onClick={downloadLogos}
                disabled={!apiStatus.connected || logoProgress.isRunning}
                className="w-full"
              >
                {logoProgress.isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Logos
                  </>
                )}
              </Button>

              {!apiStatus.connected && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connect API first to download logos
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Photos Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Business Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Download Business Photos</p>
                  <p className="text-sm text-gray-600">
                    {imageStats.photosDownloaded} of {imageStats.totalImages}{" "}
                    photos cached
                  </p>
                  <p className="text-xs text-gray-500">
                    {imageStats.businessesWithPhotos} businesses have photos
                  </p>
                  {imageStats.downloadedToday > 0 && (
                    <p className="text-xs text-green-600">
                      {imageStats.downloadedToday} downloaded today
                    </p>
                  )}
                </div>
                <Image className="h-8 w-8 text-green-500" />
              </div>

              {optimizedProgress.isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Optimized download...</span>
                    <span>
                      {optimizedProgress.current} / {optimizedProgress.total}
                    </span>
                  </div>
                  <Progress
                    value={
                      optimizedProgress.total > 0
                        ? (optimizedProgress.current /
                            optimizedProgress.total) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    Status: {optimizedProgress.status}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={downloadOptimizedPhotos}
                  disabled={!apiStatus.connected || optimizedProgress.isRunning}
                  className="w-full"
                >
                  {optimizedProgress.isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Downloading (Space-Efficient)...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Photos (Optimized)
                    </>
                  )}
                </Button>

                {optimizedProgress.isRunning && (
                  <Button
                    onClick={stopOptimizedDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Download
                  </Button>
                )}
              </div>

              {!apiStatus.connected && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connect API first to download photos
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Optimized download compresses images and processes in small
                  batches to avoid disk space issues.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Download Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {imageStats.totalBusinesses}
              </p>
              <p className="text-sm text-gray-600">Total Businesses</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {imageStats.logosDownloaded}
              </p>
              <p className="text-sm text-gray-600">Logos Downloaded</p>
              <p className="text-xs text-gray-500">Cached Locally</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {imageStats.photosDownloaded}
              </p>
              <p className="text-sm text-gray-600">Photos Cached</p>
              <p className="text-xs text-gray-500">From Database</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {imageStats.cacheCoverage}%
              </p>
              <p className="text-sm text-gray-600">Cache Coverage</p>
              <p className="text-xs text-gray-500">No API Calls</p>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <p className="text-2xl font-bold text-teal-600">
                {imageStats.downloadedToday}
              </p>
              <p className="text-sm text-gray-600">Downloaded Today</p>
              {imageStats.lastDownloadTime && (
                <p className="text-xs text-gray-500">
                  Last:{" "}
                  {new Date(imageStats.lastDownloadTime).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Saving Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Cost Saving Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-green-800">
                Download in Batches
              </h4>
              <p className="text-sm text-green-700">
                Connect API, download logos first, then photos, then disconnect
                immediately.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-blue-800">Schedule Downloads</h4>
              <p className="text-sm text-blue-700">
                Download during off-peak hours to minimize business impact.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <Users className="h-6 w-6 text-orange-600 mb-2" />
              <h4 className="font-medium text-orange-800">Monitor Usage</h4>
              <p className="text-sm text-orange-700">
                Keep track of API calls and costs to stay within budget.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
