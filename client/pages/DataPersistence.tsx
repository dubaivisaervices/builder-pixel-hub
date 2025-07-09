import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Github,
  Save,
  Download,
  RefreshCw,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Shield,
} from "lucide-react";

interface PersistenceStatus {
  database: {
    totalBusinesses: number;
    totalCategories: number;
    businessesWithReviews: number;
    connected: boolean;
  } | null;
  github: {
    configured: boolean;
    repository: string;
    repoExists: boolean;
    error: string | null;
  } | null;
  timestamp: string;
}

interface SaveResult {
  success: boolean;
  savedBusinesses: number;
  savedReviews: number;
  savedImages: number;
  githubImages: number;
  errors: string[];
  details: any;
}

export default function DataPersistence() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PersistenceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/persistence-status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllData = async () => {
    try {
      setLoading(true);
      setSaveResult(null);

      const response = await fetch("/api/admin/save-all-data", {
        method: "POST",
      });
      const result = await response.json();
      setSaveResult(result);

      // Refresh status after save
      await fetchStatus();
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveResult({
        success: false,
        savedBusinesses: 0,
        savedReviews: 0,
        savedImages: 0,
        githubImages: 0,
        errors: ["Failed to save data: " + (error as Error).message],
        details: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/export-data");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dubai_visa_services_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
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
                  <Shield className="h-6 w-6" />
                  <span>Data Persistence & Backup</span>
                </h1>
                <p className="text-gray-600">
                  Manage data storage, GitHub backup, and export functionality
                </p>
              </div>
            </div>
            <Button
              onClick={fetchStatus}
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
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-green-600" />
                <span>Database Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status?.database ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Connected to SQLite database</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {status.database.totalBusinesses}
                      </div>
                      <div className="text-sm text-blue-600">Businesses</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {status.database.businessesWithReviews}
                      </div>
                      <div className="text-sm text-green-600">With Reviews</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading database status...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Github className="h-6 w-6 text-purple-600" />
                <span>GitHub Storage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status?.github ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {status.github.configured ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span>
                      {status.github.configured
                        ? "GitHub token configured"
                        : "GitHub token not configured"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>
                      <strong>Repository:</strong> {status.github.repository}
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <Badge
                        variant={
                          status.github.repoExists ? "default" : "secondary"
                        }
                        className="ml-2"
                      >
                        {status.github.repoExists ? "Ready" : "Will be created"}
                      </Badge>
                    </div>
                  </div>
                  {status.github.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {status.github.error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading GitHub status...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <Button
                onClick={handleSaveAllData}
                disabled={loading}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0 h-auto py-4 flex flex-col items-center space-y-2"
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <Save className="h-8 w-8" />
                )}
                <div className="text-center">
                  <div className="font-bold text-lg">Save All Data</div>
                  <div className="text-sm opacity-90">
                    Database + GitHub Images
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <Button
                onClick={handleExportData}
                disabled={loading}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0 h-auto py-4 flex flex-col items-center space-y-2"
              >
                <Download className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold text-lg">Export Backup</div>
                  <div className="text-sm opacity-90">Download JSON file</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-red-600 text-white hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <Button
                onClick={() => navigate("/admin")}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0 h-auto py-4 flex flex-col items-center space-y-2"
              >
                <Settings className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold text-lg">Admin Dashboard</div>
                  <div className="text-sm opacity-90">Full admin panel</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Save Result */}
        {saveResult && (
          <Card
            className={`shadow-xl border-0 mb-8 ${saveResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                {saveResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
                <h3
                  className={`text-lg font-bold ${saveResult.success ? "text-green-800" : "text-red-800"}`}
                >
                  {saveResult.success
                    ? "Data Saved Successfully!"
                    : "Save Completed with Issues"}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">
                    {saveResult.savedBusinesses}
                  </div>
                  <div className="text-sm text-gray-600">Businesses Saved</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">
                    {saveResult.savedReviews}
                  </div>
                  <div className="text-sm text-gray-600">Reviews Saved</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">
                    {saveResult.savedImages}
                  </div>
                  <div className="text-sm text-gray-600">Images (Local)</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold">
                    {saveResult.githubImages}
                  </div>
                  <div className="text-sm text-gray-600">GitHub Images</div>
                </div>
              </div>

              {saveResult.errors.length > 0 && (
                <div className="bg-red-100 border border-red-300 rounded p-3">
                  <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {saveResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-6 w-6 text-blue-600" />
              <span>Setup & Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  🚀 Quick Setup
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>
                    Run{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      node scripts/setup-github-storage.js
                    </code>
                  </li>
                  <li>Follow prompts to configure GitHub storage</li>
                  <li>Restart your development server</li>
                  <li>Use "Save All Data" to backup everything</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  ✨ Features
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                  <li>All 840+ business listings saved to SQLite database</li>
                  <li>Complete reviews and ratings preservation</li>
                  <li>Images saved as base64 AND uploaded to GitHub</li>
                  <li>Full JSON backup export for migration</li>
                  <li>Redundant storage (local + cloud)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
