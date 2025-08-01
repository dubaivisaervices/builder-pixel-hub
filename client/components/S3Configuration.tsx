import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CloudUpload,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Upload,
  Trash2,
  List,
  BarChart3,
} from "lucide-react";

interface S3Status {
  configured: boolean;
  stats?: {
    totalObjects: number;
    totalSize: number;
    businessCount: number;
  };
  bucketName?: string;
  region?: string;
  message?: string;
}

export default function S3Configuration() {
  const [s3Status, setS3Status] = useState<S3Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [testImageUrl, setTestImageUrl] = useState("");
  const [testBusinessId, setTestBusinessId] = useState("test-business");
  const [smartSyncResults, setSmartSyncResults] = useState<any>(null);
  const [smartSyncStats, setSmartSyncStats] = useState<any>(null);

  const fetchS3Status = async () => {
    try {
      console.log("Fetching S3 status from:", "/api/admin/s3-status");
      const response = await fetch("/api/admin/s3-status");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("S3 status received:", data);
      setS3Status(data);
    } catch (error) {
      console.error("Error fetching S3 status:", error);
      setS3Status({
        configured: false,
        message: `Failed to fetch S3 status: ${error.message}`,
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const uploadTestImage = async () => {
    if (!testImageUrl || !testBusinessId) {
      alert("Please provide both image URL and business ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/s3-upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: testBusinessId,
          imageUrl: testImageUrl,
          imageType: "photo",
          businessName: "Test Business",
          caption: "Test upload",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResults(data);
        alert("Image uploaded successfully!");
        fetchS3Status(); // Refresh stats
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Upload failed: Network error");
    } finally {
      setLoading(false);
    }
  };

  const syncAllImages = async () => {
    if (
      !confirm(
        "This will upload all business images to S3. This may take several minutes. Continue?",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/s3-sync-all", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        const summary = data.summary;
        alert(
          `Sync completed successfully!\n\nSummary:\n- Businesses processed: ${summary.businessesProcessed}\n- Logos uploaded: ${summary.totalLogosUploaded}\n- Photos uploaded: ${summary.totalPhotosUploaded}\n- Businesses with errors: ${summary.businessesWithErrors}`,
        );
      } else {
        alert(`Sync failed: ${data.error}`);
      }

      fetchS3Status(); // Refresh stats
    } catch (error) {
      console.error("Error syncing images:", error);
      alert("Sync failed: Network error");
    } finally {
      setLoading(false);
    }
  };

  const smartSync = async () => {
    if (
      !confirm(
        "This will intelligently upload business images to S3, prioritizing local data and handling errors gracefully. Continue?",
      )
    ) {
      return;
    }

    setLoading(true);
    setSmartSyncResults(null);
    try {
      const response = await fetch("/api/admin/smart-s3-sync", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSmartSyncResults(data.result);
        const result = data.result;
        alert(
          `Smart Sync completed successfully!\n\nResults:\n- Businesses processed: ${result.processedBusinesses}\n- Logos uploaded: ${result.logosUploaded}\n- Photos uploaded: ${result.photosUploaded}\n- Base64 uploads: ${result.base64Uploads}\n- URL uploads: ${result.urlUploads}\n- Skipped URLs: ${result.skippedUrls}\n- Duration: ${(result.duration / 1000).toFixed(1)}s`,
        );
      } else {
        alert(`Smart Sync failed: ${data.error}`);
      }

      fetchS3Status(); // Refresh stats
      fetchSmartSyncStats(); // Refresh smart stats
    } catch (error) {
      console.error("Error running smart sync:", error);
      alert("Smart Sync failed: Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartSyncStats = async () => {
    try {
      console.log(
        "Fetching smart sync stats from:",
        "/api/admin/smart-sync-stats",
      );
      const response = await fetch("/api/admin/smart-sync-stats");

      if (!response.ok) {
        console.warn(
          `Smart sync stats endpoint returned ${response.status}: ${response.statusText}`,
        );
        return;
      }

      const data = await response.json();
      console.log("Smart sync stats received:", data);
      setSmartSyncStats(data);
    } catch (error) {
      console.error("Error fetching smart sync stats:", error);
      // Don't show error to user for optional stats
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    fetchS3Status();
    fetchSmartSyncStats();
  }, []);

  if (!s3Status) {
    return (
      <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading S3 configuration...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (initialLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading S3 configuration...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* S3 Status Card */}
      <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudUpload className="h-6 w-6" />
            <span>AWS S3 Configuration</span>
            <Badge
              className={
                s3Status.configured
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {s3Status.configured ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {s3Status.configured ? "Configured" : "Not Configured"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!s3Status.configured ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    S3 Not Configured
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    {s3Status.message}
                  </p>
                  <div className="text-xs text-yellow-600">
                    <p>Required environment variables:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>AWS_ACCESS_KEY_ID</li>
                      <li>AWS_SECRET_ACCESS_KEY</li>
                      <li>AWS_S3_BUCKET_NAME</li>
                      <li>AWS_REGION (optional, defaults to us-east-1)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* S3 Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Bucket Name
                  </Label>
                  <p className="text-lg font-semibold">{s3Status.bucketName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Region
                  </Label>
                  <p className="text-lg font-semibold">{s3Status.region}</p>
                </div>
              </div>

              {/* Statistics */}
              {s3Status.stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {s3Status.stats.totalObjects}
                    </div>
                    <div className="text-sm text-blue-600">Total Objects</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatFileSize(s3Status.stats.totalSize)}
                    </div>
                    <div className="text-sm text-green-600">Total Size</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {s3Status.stats.businessCount}
                    </div>
                    <div className="text-sm text-purple-600">Businesses</div>
                  </div>
                </div>
              )}

              <Button
                onClick={fetchS3Status}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Upload Card */}
      {s3Status.configured && (
        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-6 w-6" />
              <span>Test Image Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testImageUrl">Image URL</Label>
                <Input
                  id="testImageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={testImageUrl}
                  onChange={(e) => setTestImageUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="testBusinessId">Business ID</Label>
                <Input
                  id="testBusinessId"
                  placeholder="business-id"
                  value={testBusinessId}
                  onChange={(e) => setTestBusinessId(e.target.value)}
                />
              </div>
              <Button
                onClick={uploadTestImage}
                disabled={loading || !testImageUrl || !testBusinessId}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Test Image
              </Button>

              {uploadResults && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Upload Successful!
                  </h4>
                  <p className="text-sm text-green-700">
                    <strong>S3 URL:</strong>{" "}
                    <a
                      href={uploadResults.s3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {uploadResults.s3Url}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operations Card */}
      {s3Status.configured && (
        <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-6 w-6" />
              <span>Bulk Operations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={smartSync}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Smart Sync (Recommended)
              </Button>

              <Button
                onClick={syncAllImages}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4 mr-2" />
                )}
                Force Sync All Images
              </Button>

              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Smart Sync:</strong> Intelligently uploads images,
                  prioritizing local base64 data and gracefully handling URL
                  errors.
                </p>
                <p>
                  <strong>Force Sync:</strong> Attempts to upload all images
                  from URLs (may encounter errors).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
