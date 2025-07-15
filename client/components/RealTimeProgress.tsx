import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Clock, Upload, Image } from "lucide-react";

interface ProgressData {
  batchNumber: number;
  totalBusinesses: number;
  currentBusiness: number;
  businessName: string;
  status: "processing" | "success" | "failed" | "completed";
  logos: number;
  photos: number;
  errors: string[];
  currentStep?: string;
}

interface RealTimeProgressProps {
  isActive: boolean;
  onComplete?: (data: ProgressData) => void;
}

export function RealTimeProgress({
  isActive,
  onComplete,
}: RealTimeProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setProgressData(null);
      setIsConnected(false);
      return;
    }

    console.log("🔄 Connecting to progress stream...");

    // Add a small delay to ensure backend is ready
    const connectTimer = setTimeout(() => {
      const eventSource = new EventSource("/api/admin/progress-stream");

      eventSource.onopen = () => {
        console.log("✅ Connected to progress stream");
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ProgressData = JSON.parse(event.data);
          console.log("📊 Progress update received:", data);
          setProgressData(data);

          if (data.status === "completed" && onComplete) {
            console.log("🎉 Processing completed, calling onComplete");
            onComplete(data);
          }
        } catch (error) {
          console.error("❌ Error parsing progress data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ Progress stream error:", error);
        setIsConnected(false);

        // Try to reconnect after a short delay
        setTimeout(() => {
          if (isActive) {
            console.log("🔄 Attempting to reconnect...");
            eventSource.close();
            // This will trigger the useEffect to run again
            setIsConnected(false);
          }
        }, 2000);
      };

      // Cleanup function
      return () => {
        console.log("🔌 Disconnecting from progress stream");
        eventSource.close();
        setIsConnected(false);
      };
    }, 500);

    return () => {
      clearTimeout(connectTimer);
    };
  }, [isActive, onComplete]);

  if (!isActive || !progressData) {
    return null;
  }

  const progressPercentage =
    progressData.totalBusinesses > 0
      ? (progressData.currentBusiness / progressData.totalBusinesses) * 100
      : 0;

  const statusIcon = {
    processing: <Clock className="h-4 w-4 text-blue-600" />,
    success: <CheckCircle className="h-4 w-4 text-green-600" />,
    failed: <XCircle className="h-4 w-4 text-red-600" />,
    completed: <CheckCircle className="h-4 w-4 text-green-600" />,
  };

  const statusColor = {
    processing: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    failed: "bg-red-50 border-red-200",
    completed: "bg-green-50 border-green-200",
  };

  return (
    <Card
      className={`${statusColor[progressData.status]} transition-all duration-300`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {statusIcon[progressData.status]}
          Real-Time Progress - Batch {progressData.batchNumber}
          {isConnected && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>
              {progressData.currentBusiness} / {progressData.totalBusinesses}{" "}
              businesses
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="text-center text-xs text-gray-600">
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Current Business */}
        {progressData.status === "processing" && (
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="font-medium">Currently Processing:</span>
            </div>
            <div className="text-sm text-gray-700 truncate">
              {progressData.businessName}
            </div>
            {progressData.currentStep && (
              <div className="text-xs text-gray-500 mt-1">
                {progressData.currentStep}
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Image className="h-4 w-4 text-purple-600" />
              <span className="text-lg font-bold text-purple-600">
                {progressData.logos}
              </span>
            </div>
            <div className="text-xs text-gray-600">Logos</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Upload className="h-4 w-4 text-indigo-600" />
              <span className="text-lg font-bold text-indigo-600">
                {progressData.photos}
              </span>
            </div>
            <div className="text-xs text-gray-600">Photos</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-lg font-bold text-red-600">
                {progressData.errors?.length || 0}
              </span>
            </div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
        </div>

        {/* Status Message */}
        {progressData.status === "completed" && (
          <div className="bg-green-100 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Batch Completed!</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              Successfully processed {progressData.currentBusiness} businesses
            </div>
          </div>
        )}

        {/* Recent Errors */}
        {progressData.errors.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-red-800">
              Recent Errors:
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {progressData.errors.slice(-3).map((error, index) => (
                <div
                  key={index}
                  className="text-xs text-red-600 bg-red-50 p-2 rounded"
                >
                  {error}
                </div>
              ))}
            </div>
            {progressData.errors.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                ... and {progressData.errors.length - 3} more errors
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
