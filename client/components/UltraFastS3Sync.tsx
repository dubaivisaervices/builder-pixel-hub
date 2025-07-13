import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  Zap,
  Upload,
  Gauge,
  Clock,
  CheckCircle,
  Activity,
  TrendingUp,
  Image,
  Database,
  CloudUpload,
  AlertTriangle,
  Play,
  Square,
  Layers,
} from "lucide-react";

interface UltraFastProgress {
  isRunning: boolean;
  totalBusinesses: number;
  processedBusinesses: number;
  currentBatch: string;
  logosUploaded: number;
  photosUploaded: number;
  skippedUrls: number;
  errors: string[];
  startTime: number;
  elapsedTime: number;
  uploadSpeed: number;
  batchesPerSecond: number;
  concurrentUploads: number;
}

export default function UltraFastS3Sync() {
  const [progress, setProgress] = useState<UltraFastProgress>({
    isRunning: false,
    totalBusinesses: 0,
    processedBusinesses: 0,
    currentBatch: "",
    logosUploaded: 0,
    photosUploaded: 0,
    skippedUrls: 0,
    errors: [],
    startTime: 0,
    elapsedTime: 0,
    uploadSpeed: 0,
    batchesPerSecond: 0,
    concurrentUploads: 0,
  });

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate completion percentage
  const completionPercentage =
    progress.totalBusinesses > 0
      ? (progress.processedBusinesses / progress.totalBusinesses) * 100
      : 0;

  // Start Ultra-Fast Sync
  const startUltraFastSync = async () => {
    if (isStarting || progress.isRunning) {
      console.log("Ultra-fast sync already running or starting");
      return;
    }

    setIsStarting(true);

    try {
      const response = await fetch("/api/admin/ultra-fast-s3-sync", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("🚀 Ultra-Fast S3 Sync started:", data);
        startUltraFastProgressMonitoring();
      } else {
        alert(
          `Failed to start Ultra-Fast Sync: ${data.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error starting Ultra-Fast Sync:", error);
      alert("Failed to start Ultra-Fast Sync: Network error");
    } finally {
      setIsStarting(false);
    }
  };

  // Stop Ultra-Fast Sync
  const stopUltraFastSync = async () => {
    setIsStopping(true);
    try {
      const response = await fetch("/api/admin/ultra-fast-stop", {
        method: "POST",
      });

      if (response.ok) {
        console.log("🛑 Ultra-Fast Sync stopped");
        stopProgressMonitoring();
      } else {
        const error = await response.json();
        alert(`Failed to stop sync: ${error.error}`);
      }
    } catch (error) {
      console.error("Error stopping sync:", error);
      alert("Failed to stop sync: Network error");
    } finally {
      setIsStopping(false);
    }
  };

  // Start real-time progress monitoring with SSE
  const startUltraFastProgressMonitoring = () => {
    stopProgressMonitoring(); // Clean up any existing connection

    eventSourceRef.current = new EventSource(
      "/api/admin/ultra-fast-sync-stream",
    );

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "complete") {
          console.log("✅ Ultra-Fast Sync completed!");
          stopProgressMonitoring();
        } else if (data.type === "error") {
          console.error("❌ Ultra-Fast Sync error:", data.error);
          stopProgressMonitoring();
        } else {
          setProgress(data);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error("SSE connection error:", error);
      stopProgressMonitoring();
      // Fall back to polling
      startProgressPolling();
    };
  };

  // Fallback polling method
  const startProgressPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/ultra-fast-progress");
        if (response.ok) {
          const data = await response.json();
          setProgress(data);

          if (!data.isRunning) {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error("Error polling progress:", error);
      }
    }, 1000);
  };

  // Stop progress monitoring
  const stopProgressMonitoring = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressMonitoring();
    };
  }, []);

  // Check for existing sync on mount
  useEffect(() => {
    const checkExistingSync = async () => {
      try {
        const response = await fetch("/api/admin/ultra-fast-progress");
        if (response.ok) {
          const progressData = await response.json();

          if (progressData.isRunning) {
            console.log("Found existing ultra-fast sync, connecting...");
            setProgress(progressData);
            startUltraFastProgressMonitoring();
          }
        }
      } catch (error) {
        console.error("Error checking existing ultra-fast sync:", error);
      }
    };

    checkExistingSync();
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Ultra-Fast S3 Sync
              </span>
              <p className="text-sm text-gray-600 font-normal">
                Maximum performance with 25 concurrent uploads
              </p>
            </div>
            {progress.isRunning && (
              <Badge className="bg-red-100 text-red-800 animate-pulse">
                <Rocket className="h-3 w-3 mr-1" />
                ULTRA SPEED
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-700">25x</div>
                <div className="text-xs text-orange-600">
                  Concurrent Uploads
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-700">100</div>
                <div className="text-xs text-red-600">Batch Size</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-700">5s</div>
                <div className="text-xs text-pink-600">Ultra Timeout</div>
              </div>
            </div>

            {/* Progress Bar */}
            {progress.totalBusinesses > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Ultra-Fast Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {progress.processedBusinesses} / {progress.totalBusinesses}{" "}
                    businesses
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-4" />
                <div className="text-center">
                  <span className="text-3xl font-bold text-red-600">
                    {completionPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Current Status */}
            {progress.isRunning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-red-600 animate-bounce" />
                  <span className="font-medium text-red-800">
                    {progress.currentBatch}
                  </span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex space-x-3">
              {!progress.isRunning ? (
                <Button
                  onClick={startUltraFastSync}
                  disabled={isStarting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3"
                >
                  {isStarting ? (
                    <Activity className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Rocket className="h-5 w-5 mr-2" />
                  )}
                  {isStarting
                    ? "Launching Ultra-Fast Sync..."
                    : "🚀 Launch Ultra-Fast Sync"}
                </Button>
              ) : (
                <div className="flex-1 flex space-x-2">
                  <Button disabled className="flex-1 py-3 bg-red-600">
                    <Rocket className="h-5 w-5 mr-2 animate-spin" />
                    Ultra-Fast Running...
                  </Button>
                  <Button
                    onClick={stopUltraFastSync}
                    disabled={isStopping}
                    variant="destructive"
                    className="px-6"
                  >
                    {isStopping ? (
                      <Activity className="h-4 w-4 animate-spin" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ultra-Fast Performance Stats */}
      {progress.isRunning && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Upload Speed */}
          <Card className="border-0 bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700">
                {progress.uploadSpeed.toFixed(1)}/s
              </div>
              <div className="text-xs text-red-600">Upload Speed</div>
            </CardContent>
          </Card>

          {/* Batch Speed */}
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Layers className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {progress.batchesPerSecond.toFixed(1)}/s
              </div>
              <div className="text-xs text-orange-600">Batches/Sec</div>
            </CardContent>
          </Card>

          {/* Concurrent */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Gauge className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {progress.concurrentUploads}
              </div>
              <div className="text-xs text-purple-600">Concurrent</div>
            </CardContent>
          </Card>

          {/* Logos */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Image className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {progress.logosUploaded}
              </div>
              <div className="text-xs text-blue-600">Logos</div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">
                {progress.photosUploaded}
              </div>
              <div className="text-xs text-green-600">Photos</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      {(progress.isRunning || progress.elapsedTime > 0) && (
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Ultra-Fast Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Elapsed Time</div>
                <div className="text-xl font-semibold">
                  {formatTime(progress.elapsedTime)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Total Uploaded</div>
                <div className="text-xl font-semibold text-green-600">
                  {progress.logosUploaded + progress.photosUploaded}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Skipped URLs</div>
                <div className="text-xl font-semibold text-orange-600">
                  {progress.skippedUrls}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Efficiency</div>
                <div className="text-xl font-semibold text-purple-600">
                  {progress.totalBusinesses > 0
                    ? (
                        (progress.processedBusinesses /
                          progress.totalBusinesses) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {progress.errors.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">
                    Errors (Limited to prevent slowdown)
                  </span>
                  <Badge variant="destructive">{progress.errors.length}</Badge>
                </div>
                <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                  {progress.errors.slice(0, 3).map((error, index) => (
                    <div key={index} className="truncate">
                      • {error}
                    </div>
                  ))}
                  {progress.errors.length > 3 && (
                    <div className="text-xs text-red-600">
                      ... and {progress.errors.length - 3} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* System Performance Info */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-red-50 to-orange-50">
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-6">
              <span className="flex items-center space-x-1">
                <Rocket className="h-4 w-4" />
                <span>25 concurrent uploads</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>Ultra-fast validation</span>
              </span>
              <span className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>Optimized batching</span>
              </span>
              <span className="flex items-center space-x-1">
                <CloudUpload className="h-4 w-4" />
                <span>Maximum S3 throughput</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
