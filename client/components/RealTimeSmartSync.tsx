import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Activity,
  TrendingUp,
  Image,
  Database,
  CloudUpload,
  AlertTriangle,
  Play,
  Pause,
} from "lucide-react";

interface SmartSyncProgress {
  isRunning: boolean;
  totalBusinesses: number;
  processedBusinesses: number;
  currentBusiness: string;
  logosUploaded: number;
  photosUploaded: number;
  base64Uploads: number;
  urlUploads: number;
  skippedUrls: number;
  errors: string[];
  startTime: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  uploadSpeed: number;
}

export default function RealTimeSmartSync() {
  const [progress, setProgress] = useState<SmartSyncProgress>({
    isRunning: false,
    totalBusinesses: 0,
    processedBusinesses: 0,
    currentBusiness: "",
    logosUploaded: 0,
    photosUploaded: 0,
    base64Uploads: 0,
    urlUploads: 0,
    skippedUrls: 0,
    errors: [],
    startTime: 0,
    elapsedTime: 0,
    estimatedTimeRemaining: 0,
    uploadSpeed: 0,
  });

  const [syncResult, setSyncResult] = useState<any>(null);
  const [isStarting, setIsStarting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Start Smart Sync with real-time monitoring
  const startSmartSync = async () => {
    // Prevent multiple starts
    if (isStarting || progress.isRunning) {
      console.log("Sync already running or starting");
      return;
    }

    setIsStarting(true);
    setSyncResult(null);

    // Reset progress
    setProgress({
      isRunning: true,
      totalBusinesses: 0,
      processedBusinesses: 0,
      currentBusiness: "Initializing...",
      logosUploaded: 0,
      photosUploaded: 0,
      base64Uploads: 0,
      urlUploads: 0,
      skippedUrls: 0,
      errors: [],
      startTime: Date.now(),
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      uploadSpeed: 0,
    });

    try {
      // Start the real-time sync process
      const response = await fetch("/api/admin/realtime-smart-sync", {
        method: "POST",
      });

      let data;
      try {
        // Safely read the response body
        data = await response.json();
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        throw new Error("Invalid response from server");
      }

      if (response.ok) {
        console.log("🧠 Real-time Smart Sync started:", data);

        // Start real-time monitoring
        startRealTimeProgressMonitoring();
      } else if (response.status === 409) {
        // Sync already running - start monitoring existing sync
        console.log("Sync already running, connecting to existing sync...");
        alert("Smart Sync is already running. Connecting to existing sync...");
        setProgress((prev) => ({ ...prev, isRunning: true }));
        startRealTimeProgressMonitoring();
      } else {
        alert(`Failed to start Smart Sync: ${data.error || "Unknown error"}`);
        setProgress((prev) => ({ ...prev, isRunning: false }));
      }
    } catch (error) {
      console.error("Error starting Smart Sync:", error);

      // If there's a network error, let's check if there's already a sync running
      try {
        const progressResponse = await fetch(
          "/api/admin/realtime-smart-progress",
        );
        const progressData = await progressResponse.json();

        if (progressData.isRunning) {
          alert("Connecting to existing Smart Sync...");
          setProgress(progressData);
          startRealTimeProgressMonitoring();
        } else {
          alert("Failed to start Smart Sync: Network error");
          setProgress((prev) => ({ ...prev, isRunning: false }));
        }
      } catch (fallbackError) {
        alert("Failed to start Smart Sync: Network error");
        setProgress((prev) => ({ ...prev, isRunning: false }));
      }
    } finally {
      setIsStarting(false);
    }
  };

  // Start real-time progress monitoring with SSE
  const startRealTimeProgressMonitoring = () => {
    const eventSource = new EventSource(
      "/api/admin/realtime-smart-sync-stream",
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "complete") {
          console.log("✅ Smart Sync completed!");
          eventSource.close();
        } else if (data.type === "error") {
          console.error("❌ Smart Sync error:", data.error);
          eventSource.close();
          setProgress((prev) => ({
            ...prev,
            isRunning: false,
            errors: [...prev.errors, data.error],
          }));
        } else {
          // Update progress with real data
          setProgress(data);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();

      // Update progress to show we're falling back to polling
      setProgress((prev) => ({
        ...prev,
        currentBusiness: prev.currentBusiness + " (using fallback monitoring)",
      }));

      // Fall back to polling
      setTimeout(() => {
        startProgressPolling();
      }, 1000);
    };

    // Store reference for cleanup
    intervalRef.current = eventSource as any;
  };

  // Fallback polling method
  const startProgressPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/admin/realtime-smart-progress");
        if (response.ok) {
          const data = await response.json();
          setProgress(data);

          // Stop polling if sync is complete
          if (!data.isRunning) {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error("Error polling progress:", error);
      }
    }, 2000); // Poll every 2 seconds

    intervalRef.current = pollInterval as any;
  };

  // Stop progress monitoring
  const stopProgressMonitoring = () => {
    if (intervalRef.current) {
      if (intervalRef.current instanceof EventSource) {
        intervalRef.current.close();
      } else {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = null;
    }
  };

  // Check for final results
  const checkFinalResults = async () => {
    try {
      const response = await fetch("/api/admin/smart-sync-stats");
      if (response.ok) {
        const stats = await response.json();
        setProgress((prev) => ({
          ...prev,
          isRunning: false,
          totalBusinesses: stats.totalBusinesses,
          processedBusinesses: stats.totalBusinesses,
          currentBusiness: "Completed!",
        }));
      }
    } catch (error) {
      console.error("Error getting final results:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressMonitoring();
    };
  }, []);

  // Auto-check for running syncs on mount
  useEffect(() => {
    // Check if there's already a sync running
    const checkExistingSync = async () => {
      try {
        const response = await fetch("/api/admin/realtime-smart-progress");
        if (response.ok) {
          const progressData = await response.json();

          if (progressData.isRunning) {
            console.log("Found existing running sync, connecting...");
            setProgress(progressData);
            startRealTimeProgressMonitoring();
          } else {
            // If no sync running, just get basic stats
            try {
              const statsResponse = await fetch("/api/admin/smart-sync-stats");
              if (statsResponse.ok) {
                const stats = await statsResponse.json();
                setProgress((prev) => ({
                  ...prev,
                  totalBusinesses: stats.totalBusinesses,
                }));
              }
            } catch (statsError) {
              console.error("Error getting stats:", statsError);
            }
          }
        }
      } catch (error) {
        console.error("Error checking existing sync:", error);
      }
    };

    checkExistingSync();
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Smart S3 Sync
              </span>
              <p className="text-sm text-gray-600 font-normal">
                Intelligent image upload with real-time progress
              </p>
            </div>
            {progress.isRunning && (
              <Badge className="bg-green-100 text-green-800 animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                RUNNING
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Bar */}
            {progress.totalBusinesses > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">
                    {progress.processedBusinesses} / {progress.totalBusinesses}{" "}
                    businesses
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
                <div className="text-center">
                  <span className="text-2xl font-bold text-green-600">
                    {completionPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Current Status */}
            {progress.isRunning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="font-medium text-blue-800">
                    {progress.currentBusiness}
                  </span>
                </div>
              </div>
            )}

            {/* Control Button */}
            <div className="flex space-x-3">
              {!progress.isRunning ? (
                <Button
                  onClick={startSmartSync}
                  disabled={isStarting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3"
                >
                  {isStarting ? (
                    <Activity className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  {isStarting ? "Starting Smart Sync..." : "Start Smart Sync"}
                </Button>
              ) : (
                <Button disabled className="flex-1 py-3 bg-green-600">
                  <Activity className="h-5 w-5 mr-2 animate-spin" />
                  Smart Sync Running...
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats Grid */}
      {progress.isRunning && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Upload Speed */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {progress.uploadSpeed.toFixed(1)}/s
              </div>
              <div className="text-xs text-blue-600">Upload Speed</div>
            </CardContent>
          </Card>

          {/* Time Remaining */}
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {progress.estimatedTimeRemaining > 0
                  ? formatTime(progress.estimatedTimeRemaining)
                  : "Calculating..."}
              </div>
              <div className="text-xs text-orange-600">Time Remaining</div>
            </CardContent>
          </Card>

          {/* Logos Uploaded */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Image className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {progress.logosUploaded}
              </div>
              <div className="text-xs text-purple-600">Logos</div>
            </CardContent>
          </Card>

          {/* Photos Uploaded */}
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

      {/* Detailed Metrics */}
      {(progress.isRunning || progress.elapsedTime > 0) && (
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Real-time Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Elapsed Time</div>
                <div className="text-xl font-semibold">
                  {formatTime(progress.elapsedTime)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Base64 Uploads</div>
                <div className="text-xl font-semibold text-green-600">
                  {progress.base64Uploads}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">URL Uploads</div>
                <div className="text-xl font-semibold text-blue-600">
                  {progress.urlUploads}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Skipped URLs</div>
                <div className="text-xl font-semibold text-orange-600">
                  {progress.skippedUrls}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="text-xl font-semibold text-green-600">
                  {progress.processedBusinesses > 0
                    ? (
                        ((progress.logosUploaded + progress.photosUploaded) /
                          Math.max(progress.processedBusinesses, 1)) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Total Images</div>
                <div className="text-xl font-semibold text-purple-600">
                  {progress.logosUploaded + progress.photosUploaded}
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {progress.errors.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">
                    Recent Errors
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

      {/* System Status */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>Smart processing</span>
              </span>
              <span className="flex items-center space-x-1">
                <CloudUpload className="h-4 w-4" />
                <span>Error-resilient</span>
              </span>
              <span className="flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span>Real-time monitoring</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
