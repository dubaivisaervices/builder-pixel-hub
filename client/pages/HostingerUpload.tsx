import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  AlertTriangle,
  Upload,
  Server,
  CheckCircle,
  XCircle,
  Settings,
  Globe,
} from "lucide-react";

interface UploadResults {
  processed: number;
  successful: number;
  errors: string[];
}

function HostingerUpload() {
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(
    null,
  );
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/admin/test-hostinger");
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const uploadAllImages = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch("/api/admin/upload-all-to-hostinger", {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadAllGoogleImages = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch(
        "/api/admin/upload-all-google-to-hostinger",
        {
          method: "POST",
        },
      );
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          totalLogos: 0,
          totalPhotos: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        totalLogos: 0,
        totalPhotos: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadAllImprovedGoogleImages = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch(
        "/api/admin/upload-all-improved-google-to-hostinger",
        {
          method: "POST",
        },
      );
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          totalLogos: 0,
          totalPhotos: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        totalLogos: 0,
        totalPhotos: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadAllHybridImages = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch(
        "/api/admin/upload-all-hybrid-to-hostinger",
        {
          method: "POST",
        },
      );
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          totalLogos: 0,
          totalPhotos: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        totalLogos: 0,
        totalPhotos: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadAllRemainingHybridImages = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch(
        "/api/admin/upload-all-remaining-hybrid-to-hostinger",
        {
          method: "POST",
        },
      );
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          totalLogos: 0,
          totalPhotos: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        totalLogos: 0,
        totalPhotos: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadAllBase64ToHostinger = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch(
        "/api/admin/upload-all-base64-to-hostinger",
        {
          method: "POST",
        },
      );
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          totalLogos: 0,
          totalPhotos: 0,
          base64Cleared: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        totalLogos: 0,
        totalPhotos: 0,
        base64Cleared: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadAllGooglePhotos = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch(
        "/api/admin/upload-all-google-photos-to-hostinger",
        {
          method: "POST",
        },
      );
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          totalLogos: 0,
          totalPhotos: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        totalLogos: 0,
        totalPhotos: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadAllCachedImages = async () => {
    setUploading(true);
    setUploadResults(null);

    try {
      const response = await fetch(
        "/api/admin/upload-all-cached-to-hostinger",
        {
          method: "POST",
        },
      );
      const result = await response.json();

      if (result.success) {
        setUploadResults(result.results);
      } else {
        setUploadResults({
          processed: 0,
          successful: 0,
          totalLogos: 0,
          totalPhotos: 0,
          errors: [result.error],
        });
      }
    } catch (error) {
      setUploadResults({
        processed: 0,
        successful: 0,
        totalLogos: 0,
        totalPhotos: 0,
        errors: [error.message],
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadSingleBusiness = async () => {
    if (!selectedBusinessId.trim()) return;

    setUploading(true);

    try {
      const response = await fetch(
        `/api/admin/upload-business-to-hostinger/${selectedBusinessId}`,
        { method: "POST" },
      );
      const result = await response.json();

      if (result.success) {
        alert(`✅ Successfully uploaded images for ${result.business}`);
      } else {
        alert(`❌ Upload failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Server className="h-8 w-8" />
          Hostinger Image Upload
        </h1>
        <p className="text-gray-600">
          Upload business images from Google API directly to your Hostinger
          hosting server
        </p>
      </div>

      {/* Configuration Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Settings className="h-5 w-5" />
            Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-orange-700">
          <p className="mb-3">
            Before using this feature, you need to configure your Hostinger FTP
            credentials in:
          </p>
          <code className="bg-orange-100 px-2 py-1 rounded text-sm">
            code/server/routes/hostinger-upload.ts
          </code>
          <div className="mt-3 space-y-1 text-sm">
            <p>• Replace HOSTINGER_CONFIG with your actual FTP credentials</p>
            <p>• Set your domain URL for image access</p>
            <p>• Ensure /public_html/business-images directory exists</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Test Connection
            </CardTitle>
            <CardDescription>
              Test your Hostinger FTP connection before uploading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testConnection}
              disabled={testing}
              className="w-full"
              variant="outline"
            >
              {testing ? "Testing..." : "Test Hostinger Connection"}
            </Button>

            {testResult && (
              <div
                className={`p-3 rounded-lg border ${
                  testResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      testResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {testResult.success
                      ? "Connection Successful"
                      : "Test Failed"}
                  </span>
                </div>
                {testResult.config && (
                  <div className="text-sm space-y-1">
                    <p>Host: {testResult.config.host}</p>
                    <p>User: {testResult.config.user}</p>
                    <p>Base URL: {testResult.config.baseUrl}</p>
                  </div>
                )}
                {testResult.error && (
                  <p className="text-sm text-red-600">{testResult.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Single Business Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Single Business Upload
            </CardTitle>
            <CardDescription>
              Upload images for a specific business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter Business ID"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
            />
            <Button
              onClick={uploadSingleBusiness}
              disabled={uploading || !selectedBusinessId.trim()}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Business Images"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload All Images
          </CardTitle>
          <CardDescription>
            Upload all business images from Google API to Hostinger (processes
            top 50 businesses)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              This will download images from Google API and upload them to your
              Hostinger server. Make sure your connection test passes first.
            </span>
          </div>

          <div className="space-y-3">
            <Button
              onClick={uploadAllHybridImages}
              disabled={uploading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {uploading
                ? "Processing Hybrid Images..."
                : "✅ REAL Business Images (HYBRID)"}
            </Button>

            <div className="text-center text-sm text-green-600 font-medium">
              Tries Google API first, falls back to business-appropriate images
            </div>

            <div className="text-center text-sm text-gray-500">
              --- Alternative methods ---
            </div>

            <Button
              onClick={uploadAllImprovedGoogleImages}
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {uploading
                ? "Processing Real Google Images..."
                : "🚀 Google API Only (LIKELY TO FAIL)"}
            </Button>

            <div className="text-center text-sm text-blue-600">
              Pure Google Places API (currently returning 403 Forbidden)
            </div>

            <Button
              onClick={uploadAllBase64ToHostinger}
              disabled={uploading}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {uploading
                ? "Processing Base64 → Hostinger..."
                : "✅ Base64 → Hostinger (Unsplash Stock)"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Downloads stock images → Stores as base64 → Uploads to Hostinger →
              Clears base64
            </div>

            <div className="text-center text-sm text-gray-500">
              --- Failing methods ---
            </div>

            <Button
              onClick={uploadAllGooglePhotos}
              disabled={uploading}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {uploading ? "Failing..." : "❌ Google Photos Proxy (FAILING)"}
            </Button>

            <Button
              onClick={uploadAllCachedImages}
              disabled={uploading}
              className="w-full bg-gray-600 hover:bg-gray-700"
              size="lg"
            >
              {uploading
                ? "No data..."
                : "📁 Cached Images (No data available)"}
            </Button>

            <Button
              onClick={uploadAllGoogleImages}
              disabled={uploading}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
              size="lg"
            >
              {uploading
                ? "Failing..."
                : "⚠️ Direct Google API (403 Forbidden)"}
            </Button>
          </div>

          {uploadResults && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {uploadResults.processed}
                  </div>
                  <div className="text-xs text-blue-800">Processed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {uploadResults.successful}
                  </div>
                  <div className="text-xs text-green-800">Successful</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {uploadResults.totalLogos || 0}
                  </div>
                  <div className="text-xs text-purple-800">Logos</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-xl font-bold text-indigo-600">
                    {uploadResults.totalPhotos || 0}
                  </div>
                  <div className="text-xs text-indigo-800">Photos</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {uploadResults.base64Cleared || 0}
                  </div>
                  <div className="text-xs text-orange-800">Base64 Cleared</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">
                    {uploadResults.errors.length}
                  </div>
                  <div className="text-xs text-red-800">Errors</div>
                </div>
              </div>

              {uploadResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {uploadResults.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">1</Badge>
            <p>
              <strong>Fetch from Google API:</strong> Downloads business logos
              and photos from Google Places API
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">2</Badge>
            <p>
              <strong>Upload to Hostinger:</strong> Transfers images to your
              hosting server via FTP
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">3</Badge>
            <p>
              <strong>Update Database:</strong> Replaces S3 URLs with your
              domain URLs
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-0.5">4</Badge>
            <p>
              <strong>Display Images:</strong> Business profiles now show images
              from your domain instead of S3
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HostingerUpload;
