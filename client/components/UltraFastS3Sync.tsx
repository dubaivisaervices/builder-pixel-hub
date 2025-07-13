import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Upload,
  Pause,
  Play,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  CloudUpload,
  TrendingUp,
  Gauge,
} from "lucide-react";

interface SyncProgress {
  totalTasks: number;
  completedTasks: number;
  successfulUploads: number;
  failedUploads: number;
  currentlyProcessing: number;
  averageSpeed: number;
  estimatedTimeRemaining: number;
  completionPercentage: number;
  elapsedTime: number;
  isRunning: boolean;
  errors: string[];
}

interface SyncStats {
  current: {
    isRunning: boolean;
    activeUploads: number;
  };
  performance: {
    averageSpeed: number;
    totalUploaded: number;
    errorRate: number;
  };
  estimates: {
    timeRemaining: number;
    completionTime: string | null;
  };
}

export default function UltraFastS3Sync() {
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const eventSourceRef = useRef<EventSource | null>(null);

  // Format time in seconds to human readable
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Format speed for display
  const formatSpeed = (speed: number): string => {
    if (speed < 1) return `${(speed * 1000).toFixed(0)}ms/upload`;
    return `${speed.toFixed(1)}/sec`;
  };

  // Fetch current progress
  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/admin/fast-s3-progress");
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  // Fetch performance stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/fast-s3-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Start ultra-fast sync
  const startSync = async () => {
    setIsStarting(true);
    try {
      const response = await fetch("/api/admin/fast-s3-sync", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🚀 Ultra-fast sync started:", data);
        
        // Start real-time progress monitoring
        startProgressStream();
        
        // Refresh progress immediately
        setTimeout(fetchProgress, 1000);
      } else {
        const error = await response.json();
        alert(`Failed to start sync: ${error.error}`);
      }
    } catch (error) {
      console.error("Error starting sync:", error);
      alert("Failed to start sync: Network error");
    } finally {
      setIsStarting(false);
    }
  };

  // Stop sync
  const stopSync = async () => {
    setIsStopping(true);
    try {
      const response = await fetch("/api/admin/fast-s3-stop", {
        method: "POST",
      });

      if (response.ok) {
        console.log("🛑 Sync stopped");
        stopProgressStream();
        fetchProgress(); // Get final state
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

  // Start Server-Sent Events for real-time progress
  const startProgressStream = () => {
    stopProgressStream(); // Clean up any existing connection

    eventSourceRef.current = new EventSource("/api/admin/fast-s3-progress-stream");
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "complete") {
          console.log("✅ Sync completed!");
          stopProgressStream();
        } else if (data.type === "error") {
          console.error("❌ Sync error:", data.error);
          stopProgressStream();
        } else {
          setProgress(data);
          setLastUpdate(Date.now());
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error("SSE connection error:", error);
      stopProgressStream();
    };
  };

  // Stop progress stream
  const stopProgressStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Initialize and cleanup
  useEffect(() => {
    fetchProgress();
    fetchStats();
    
    const interval = setInterval(() => {
      fetchStats();
      if (!eventSourceRef.current) {
        fetchProgress();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      stopProgressStream();
    };
  }, []);

  const isRunning = progress?.isRunning || false;
  const completionPercentage = progress?.completionPercentage || 0;

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ultra-Fast S3 Sync
              </span>
              <p className="text-sm text-gray-600 font-normal">
                High-performance concurrent image uploads
              </p>
            </div>
            {isRunning && (
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
            {progress && progress.totalTasks > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">
                    {progress.completedTasks} / {progress.totalTasks} uploads
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {completionPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex space-x-3">
              {!isRunning ? (
                <Button
                  onClick={startSync}
                  disabled={isStarting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {isStarting ? (
                    <Activity className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-5 w-5 mr-2" />
                  )}
                  {isStarting ? "Starting Ultra-Fast Sync..." : "Start Ultra-Fast Sync"}
                </Button>
              ) : (
                <Button
                  onClick={stopSync}
                  disabled={isStopping}
                  variant="destructive"
                  className="flex-1 py-3"
                >
                  {isStopping ? (
                    <Activity className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Pause className="h-5 w-5 mr-2" />
                  )}
                  {isStopping ? "Stopping..." : "Stop Sync"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Stats Grid */}
      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Speed */}
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Gauge className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">
                {formatSpeed(progress.averageSpeed)}
              </div>
              <div className="text-xs text-green-600">Upload Speed</div>
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
                  : "Calculating..."
                }
              </div>
              <div className="text-xs text-orange-600">Time Remaining</div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {progress.successfulUploads}
              </div>
              <div className="text-xs text-blue-600">Successful</div>
            </CardContent>
          </Card>

          {/* Active Uploads */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Upload className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {progress.currentlyProcessing}
              </div>
              <div className="text-xs text-purple-600">Active Uploads</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Stats */}
      {progress && (
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Metrics</span>
              <Badge variant="outline" className="text-xs">
                Updated {Math.round((Date.now() - lastUpdate) / 1000)}s ago
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Total Tasks</div>
                <div className="text-xl font-semibold">{progress.totalTasks.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-xl font-semibold text-green-600">
                  {progress.completedTasks.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Failed</div>
                <div className="text-xl font-semibold text-red-600">
                  {progress.failedUploads.toLocaleString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Elapsed Time</div>
                <div className="text-xl font-semibold">{formatTime(progress.elapsedTime)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="text-xl font-semibold text-blue-600">
                  {progress.completedTasks > 0 
                    ? ((progress.successfulUploads / progress.completedTasks) * 100).toFixed(1)
                    : "0"
                  }%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Throughput</div>
                <div className="text-xl font-semibold text-purple-600">
                  {(progress.successfulUploads / Math.max(progress.elapsedTime, 1) * 60).toFixed(1)}/min
                </div>
              </div>
            </div>

            {/* Error Summary */}
            {progress.errors && progress.errors.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">Recent Errors</span>
                  <Badge variant="destructive">{progress.errors.length}</Badge>
                </div>
                <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                  {progress.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="truncate">
                      • {error}
                    </div>
                  ))}
                  {progress.errors.length > 5 && (
                    <div className="text-xs text-red-600">
                      ... and {progress.errors.length - 5} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>Database optimized</span>
              </span>
              <span className="flex items-center space-x-1">
                <CloudUpload className="h-4 w-4" />
                <span>10 concurrent uploads</span>
              </span>
              <span className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Real-time monitoring</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}