import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, XCircle, Trash2 } from "lucide-react";

interface NetlifyImageStats {
  totalLogos: number;
  totalPhotos: number;
  totalSize: number;
  totalSizeMB: number;
  directories: {
    businessImages: boolean;
    logos: boolean;
    photos: boolean;
  };
}

interface UploadResult {
  success: boolean;
  message: string;
  businessId?: string;
  logoUrl?: string;
  photoUrls?: string[];
  error?: string;
}

const NetlifyImageManager: React.FC = () => {
  const [stats, setStats] = useState<NetlifyImageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState("");

  // Super Fast Upload States
  const [superFastUploading, setSuperFastUploading] = useState(false);
  const [superFastProgress, setSuperFastProgress] = useState<any>(null);
  const [superFastStats, setSuperFastStats] = useState<any>(null);

  // Form states
  const [businessId, setBusinessId] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadType, setDownloadType] = useState("logo");
  const [businesses, setBusinesses] = useState<any[]>([]);

  // Debug states
  const [debugData, setDebugData] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadBusinesses();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/netlify/image-stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadBusinesses = async () => {
    try {
      const response = await fetch("/api/businesses?limit=100");
      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Error loading businesses:", error);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !businessId) {
      setUploadResult({
        success: false,
        error: "Please select a logo file and enter business ID",
      });
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      formData.append("businessId", businessId);

      const response = await fetch("/api/netlify/upload-logo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        loadStats(); // Refresh stats
        setLogoFile(null);
        setBusinessId("");
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: "Upload failed: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotosUpload = async () => {
    if (!photoFiles || !businessId) {
      setUploadResult({
        success: false,
        error: "Please select photo files and enter business ID",
      });
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      Array.from(photoFiles).forEach((file) => {
        formData.append("photos", file);
      });
      formData.append("businessId", businessId);

      const response = await fetch("/api/netlify/upload-photos", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        loadStats(); // Refresh stats
        setPhotoFiles(null);
        setBusinessId("");
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: "Upload failed: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFromUrl = async () => {
    if (!downloadUrl || !businessId || !downloadType) {
      setUploadResult({
        success: false,
        error: "Please fill in all fields for URL download",
      });
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      const response = await fetch("/api/netlify/download-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          imageUrl: downloadUrl,
          type: downloadType,
          index: downloadType === "photo" ? "1" : undefined,
        }),
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        loadStats(); // Refresh stats
        setDownloadUrl("");
        setBusinessId("");
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: "Download failed: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDownload = async () => {
    if (businesses.length === 0) {
      setUploadResult({
        success: false,
        error: "No businesses available for batch download",
      });
      return;
    }

    setLoading(true);
    setBatchProgress(0);
    setBatchStatus("Starting batch download...");
    setUploadResult(null);

    try {
      // Process businesses in batches of 10
      const batchSize = 10;
      const totalBatches = Math.ceil(businesses.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const batch = businesses.slice(i * batchSize, (i + 1) * batchSize);
        setBatchStatus(`Processing batch ${i + 1} of ${totalBatches}...`);

        const response = await fetch("/api/netlify/batch-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businesses: batch }),
        });

        const result = await response.json();
        console.log(`Batch ${i + 1} result:`, result);

        const progress = ((i + 1) / totalBatches) * 100;
        setBatchProgress(progress);

        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setBatchStatus("Batch download completed!");
      setUploadResult({
        success: true,
        message: `Batch download completed for ${businesses.length} businesses`,
      });

      loadStats(); // Refresh stats
    } catch (error) {
      setUploadResult({
        success: false,
        error: "Batch download failed: " + error.message,
      });
      setBatchStatus("Batch download failed");
    } finally {
      setLoading(false);
      setBatchProgress(0);
    }
  };

  // Super Fast Upload Functions
  const startSuperFastUpload = async () => {
    try {
      setSuperFastUploading(true);
      setUploadResult(null);

      const response = await fetch("/api/netlify/super-fast-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult({
          success: true,
          message: `Super fast upload started for ${result.stats.total} businesses!`,
        });

        // Start polling for progress
        startProgressPolling();
      } else {
        setUploadResult({
          success: false,
          error: result.error || "Failed to start super fast upload",
        });
        setSuperFastUploading(false);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: "Failed to start super fast upload: " + error.message,
      });
      setSuperFastUploading(false);
    }
  };

  const startProgressPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/netlify/upload-progress");
        const data = await response.json();

        if (data.success) {
          setSuperFastProgress(data);
          setSuperFastStats(data.stats);

          // Stop polling if upload is complete
          if (!data.isUploading) {
            clearInterval(pollInterval);
            setSuperFastUploading(false);
            loadStats(); // Refresh main stats
          }
        }
      } catch (error) {
        console.error("Error polling progress:", error);
      }
    }, 2000); // Poll every 2 seconds

    // Auto-stop polling after 30 minutes
    setTimeout(
      () => {
        clearInterval(pollInterval);
        setSuperFastUploading(false);
      },
      30 * 60 * 1000,
    );
  };

  const stopSuperFastUpload = async () => {
    try {
      const response = await fetch("/api/netlify/stop-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        setSuperFastUploading(false);
        setUploadResult({
          success: true,
          message: "Super fast upload stopped successfully",
        });
      }
    } catch (error) {
      console.error("Error stopping upload:", error);
    }
  };

  const clearProgressData = async () => {
    try {
      await fetch("/api/netlify/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      setSuperFastProgress(null);
      setSuperFastStats(null);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  // Debug Functions
  const checkDataQuality = async () => {
    setDebugLoading(true);
    try {
      const response = await fetch("/api/debug/business-data");
      const data = await response.json();

      if (data.success) {
        setDebugData(data);
        console.log("Business data quality analysis:", data);
      }
    } catch (error) {
      console.error("Error checking data quality:", error);
    } finally {
      setDebugLoading(false);
    }
  };

  const testRandomBusinessUrls = async () => {
    if (businesses.length === 0) return;

    // Test a random business
    const randomBusiness =
      businesses[Math.floor(Math.random() * businesses.length)];

    try {
      const response = await fetch(`/api/debug/test-urls/${randomBusiness.id}`);
      const data = await response.json();

      console.log("URL test results for", randomBusiness.name, ":", data);
      alert(
        `URL Test Results for ${randomBusiness.name}:\n\nLogo: ${data.summary.logoAccessible ? "✅ Accessible" : "❌ Not accessible"}\nPhotos: ${data.summary.photosAccessible}/${data.summary.totalPhotos} accessible`,
      );
    } catch (error) {
      console.error("Error testing URLs:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Netlify Image Manager
          </h1>
          <p className="text-gray-600">
            Upload and manage business images directly to Netlify static files
          </p>
        </div>

        {/* Statistics Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📊 Storage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalLogos}
                  </div>
                  <div className="text-sm text-gray-600">Logos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalPhotos}
                  </div>
                  <div className="text-sm text-gray-600">Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalSizeMB}MB
                  </div>
                  <div className="text-sm text-gray-600">Total Size</div>
                </div>
                <div className="text-center">
                  <Button onClick={loadStats} variant="outline" size="sm">
                    🔄 Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <div>Loading statistics...</div>
            )}
          </CardContent>
        </Card>

        {/* Upload Result Alert */}
        {uploadResult && (
          <Alert
            className={`mb-6 ${
              uploadResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <AlertDescription>
              <div
                className={
                  uploadResult.success ? "text-green-800" : "text-red-800"
                }
              >
                {uploadResult.success ? "✅ " : "❌ "}
                {uploadResult.message || uploadResult.error}
              </div>
              {uploadResult.logoUrl && (
                <div className="mt-2">
                  <strong>Logo URL:</strong> {uploadResult.logoUrl}
                </div>
              )}
              {uploadResult.photoUrls && (
                <div className="mt-2">
                  <strong>Photo URLs:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {uploadResult.photoUrls.map((url, index) => (
                      <li key={index}>{url}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Batch Progress */}
        {loading && batchProgress > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{batchStatus}</span>
                  <span>{Math.round(batchProgress)}%</span>
                </div>
                <Progress value={batchProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for different upload methods */}
        <Tabs defaultValue="superfast" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="superfast">🚀 Super Fast Upload</TabsTrigger>
            <TabsTrigger value="debug">🔍 Debug Data</TabsTrigger>
            <TabsTrigger value="single">Single Upload</TabsTrigger>
            <TabsTrigger value="download">Download from URL</TabsTrigger>
            <TabsTrigger value="batch">Batch Operations</TabsTrigger>
          </TabsList>

          {/* Super Fast Upload Tab */}
          <TabsContent value="superfast">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="animate-pulse">🚀</div>
                  <span>Super Fast Upload - All 841 Businesses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Display */}
                {superFastProgress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">
                      📊 Real-time Progress
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {superFastStats?.processed || 0}
                        </div>
                        <div className="text-sm text-gray-600">Processed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {superFastStats?.logosDownloaded || 0}
                        </div>
                        <div className="text-sm text-gray-600">Logos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {superFastStats?.photosDownloaded || 0}
                        </div>
                        <div className="text-sm text-gray-600">Photos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(
                            (superFastStats?.totalSize || 0) / (1024 * 1024),
                          )}
                          MB
                        </div>
                        <div className="text-sm text-gray-600">Downloaded</div>
                      </div>
                    </div>

                    {superFastStats && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            Progress: {superFastStats.processed}/
                            {superFastStats.total}
                          </span>
                          <span>
                            {Math.round(
                              (superFastStats.processed /
                                superFastStats.total) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (superFastStats.processed / superFastStats.total) *
                            100
                          }
                          className="w-full h-3"
                        />
                        {superFastStats.estimatedTimeRemaining && (
                          <div className="text-center text-sm text-gray-600">
                            Estimated time remaining:{" "}
                            {Math.ceil(
                              superFastStats.estimatedTimeRemaining /
                                (1000 * 60),
                            )}{" "}
                            minutes
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Information */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-bold text-green-900 mb-3">
                    ⚡ What This Does
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">
                        📋 Processing Details
                      </h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Downloads ALL 841 business logos</li>
                        <li>• Downloads up to 5 photos per business</li>
                        <li>• Saves directly to Netlify public directory</li>
                        <li>• Updates database with new Netlify URLs</li>
                        <li>• Processes 20 businesses simultaneously</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">
                        🎯 Expected Results
                      </h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• ~841 business logos</li>
                        <li>• ~4,200 business photos (5 per business)</li>
                        <li>• ~2-3 GB total download size</li>
                        <li>• ~10-15 minutes completion time</li>
                        <li>• Real images shown to users instantly</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {!superFastUploading ? (
                    <Button
                      onClick={startSuperFastUpload}
                      className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white font-bold"
                      size="lg"
                    >
                      <div className="animate-pulse mr-2">🚀</div>
                      Start Super Fast Upload (841 Businesses)
                    </Button>
                  ) : (
                    <Button
                      onClick={stopSuperFastUpload}
                      variant="destructive"
                      size="lg"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Stop Upload
                    </Button>
                  )}

                  <Button
                    onClick={loadStats}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Stats
                  </Button>

                  {superFastProgress && !superFastUploading && (
                    <Button
                      onClick={clearProgressData}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Progress
                    </Button>
                  )}
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    ⚠️ Important Notes
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • This will download images from external sources (Google,
                      Hostinger)
                    </li>
                    <li>
                      • Large file download (~2-3 GB) - ensure stable internet
                      connection
                    </li>
                    <li>
                      • Process runs in background - you can close this page
                      during upload
                    </li>
                    <li>
                      • Images will be immediately available at
                      /business-images/ URLs
                    </li>
                    <li>
                      • Existing images will be overwritten with fresh downloads
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Single Upload Tab */}
          <TabsContent value="single">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>📷 Upload Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessId1">Business ID</Label>
                    <Input
                      id="businessId1"
                      value={businessId}
                      onChange={(e) => setBusinessId(e.target.value)}
                      placeholder="Enter business ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logoFile">Logo File</Label>
                    <Input
                      id="logoFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button
                    onClick={handleLogoUpload}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Uploading..." : "Upload Logo"}
                  </Button>
                </CardContent>
              </Card>

              {/* Photos Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>🖼️ Upload Photos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessId2">Business ID</Label>
                    <Input
                      id="businessId2"
                      value={businessId}
                      onChange={(e) => setBusinessId(e.target.value)}
                      placeholder="Enter business ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photoFiles">Photo Files (up to 10)</Label>
                    <Input
                      id="photoFiles"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setPhotoFiles(e.target.files)}
                    />
                  </div>
                  <Button
                    onClick={handlePhotosUpload}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Uploading..." : "Upload Photos"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Download from URL Tab */}
          <TabsContent value="download">
            <Card>
              <CardHeader>
                <CardTitle>🔗 Download from URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessId3">Business ID</Label>
                    <Input
                      id="businessId3"
                      value={businessId}
                      onChange={(e) => setBusinessId(e.target.value)}
                      placeholder="Enter business ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="downloadType">Image Type</Label>
                    <Select
                      value={downloadType}
                      onValueChange={setDownloadType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logo">Logo</SelectItem>
                        <SelectItem value="photo">Photo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="downloadUrl">Image URL</Label>
                  <Textarea
                    id="downloadUrl"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="Enter image URL to download"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleDownloadFromUrl}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Downloading..." : "Download and Save"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Operations Tab */}
          <TabsContent value="batch">
            <Card>
              <CardHeader>
                <CardTitle>⚡ Batch Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Download logos and photos for all {businesses.length}{" "}
                  businesses from their existing URLs to Netlify static files.
                </div>
                <Button
                  onClick={handleBatchDownload}
                  disabled={loading || businesses.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading
                    ? "Processing..."
                    : `Batch Download ${businesses.length} Businesses`}
                </Button>
                <div className="text-xs text-gray-500">
                  This will download all available logos and photos from
                  existing URLs and save them directly to Netlify's public
                  directory for faster loading.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NetlifyImageManager;
