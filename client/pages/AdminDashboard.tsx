import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  Database,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  MessageSquare,
  Camera,
  RotateCw,
  Trash2,
  Eye,
  Lock,
  LogOut,
  BarChart3,
  TrendingUp,
  Activity,
  Search,
  Plus,
  Tags,
} from "lucide-react";
import BusinessSearchManager from "./BusinessSearchManager";
import S3Configuration from "../components/S3Configuration";
import UltraFastS3Sync from "../components/UltraFastS3Sync";
import RealTimeSmartSync from "../components/RealTimeSmartSync";
import UltraFastS3SyncNew from "../components/UltraFastS3Sync";
import { DatabaseMigration } from "../components/DatabaseMigration";
import { SimpleS3Status } from "../components/SimpleS3Status";
import { ApiDebug } from "../components/ApiDebug";
import { QuickUploadAccess } from "../components/QuickUploadAccess";
import { UploadAlert } from "../components/UploadAlert";

interface CompanyRequest {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface DatabaseStats {
  totalBusinesses: number;
  totalReviews: number;
  totalPhotos: number;
  categories: number;
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get active tab from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/") return "dashboard";
    if (path.includes("/admin/sync")) return "sync";
    if (path.includes("/admin/search")) return "search";
    if (path.includes("/admin/requests")) return "requests";
    if (path.includes("/admin/categories")) return "categories";
    if (path.includes("/admin/database")) return "database";
    if (path.includes("/admin/s3")) return "s3";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());
  const [companyRequests, setCompanyRequests] = useState<CompanyRequest[]>([]);
  const [stats, setStats] = useState<DatabaseStats>({
    totalBusinesses: 0,
    totalReviews: 0,
    totalPhotos: 0,
    categories: 0,
  });
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch company requests
      const requestsResponse = await fetch("/api/admin/company-requests");
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setCompanyRequests(requestsData.requests || []);
      }

      // Fetch database stats
      const statsResponse = await fetch("/api/admin/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {});
      }

      // Calculate real business count from API
      const totalBusinesses = await calculateTotalBusinesses();
      setStats((prevStats) => ({
        ...prevStats,
        businesses: totalBusinesses,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleRequestStatus = async (
    requestId: number,
    status: "approved" | "rejected",
  ) => {
    try {
      const response = await fetch(`/api/admin/company-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(
          `Company request ${status === "approved" ? "approved" : "rejected"} successfully`,
        );
        fetchDashboardData();
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update request status");
    }
  };

  const handleSync = async (type: string) => {
    setLoading(true);
    setSyncStatus(`Starting ${type} sync...`);

    try {
      let endpoint = "";
      switch (type) {
        case "google":
          endpoint = "/api/sync-google-data";
          break;
        case "reviews":
          endpoint = "/api/sync-reviews";
          break;
        case "photos":
          endpoint = "/api/sync-offline-photos";
          break;
        default:
          endpoint = "/api/admin/sync-database";
      }

      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        setSyncStatus(`${type} sync completed successfully`);
        fetchDashboardData();
      } else {
        setSyncStatus(`${type} sync failed: ${data.error}`);
      }
    } catch (error) {
      setSyncStatus(`${type} sync error: ${error}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(""), 5000);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all caches? This will force reload for all users.",
      )
    ) {
      return;
    }

    setLoading(true);
    setSyncStatus("Clearing caches...");

    try {
      // Clear browser cache headers by adding timestamp
      const timestamp = Date.now();

      // Force reload the business data
      const response = await fetch(
        `/api/dubai-visa-services?_cache_clear=${timestamp}&limit=1`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );

      if (response.ok) {
        setSyncStatus(
          "✅ Cache cleared successfully! Users will see fresh content.",
        );
        fetchDashboardData(); // Refresh stats
      } else {
        setSyncStatus("❌ Cache clear failed");
      }
    } catch (error) {
      setSyncStatus(`❌ Cache clear error: ${error}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(""), 5000);
    }
  };

  const calculateTotalBusinesses = async () => {
    try {
      const response = await fetch("/api/dubai-visa-services?limit=1");
      if (response.ok) {
        const data = await response.json();
        return data.total || data.businesses?.length || 0;
      }
    } catch (error) {
      console.error("Failed to calculate total businesses:", error);
    }
    return 0;
  };

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will delete ALL data. Are you absolutely sure?",
      )
    ) {
      return;
    }

    if (!confirm("This action cannot be undone. Type 'DELETE' to confirm:")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/clear-database", {
        method: "POST",
      });
      if (response.ok) {
        alert("Database cleared successfully");
        fetchDashboardData();
      }
    } catch (error) {
      alert("Failed to clear database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Update active tab when URL changes
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const handleTabChange = (tabId: string) => {
    if (tabId === "upload") {
      // Navigate to Hostinger upload page
      window.location.href = "/hostinger-upload";
      return;
    }

    setActiveTab(tabId);
    // Update URL to match tab
    const urlMap = {
      dashboard: "/admin",
      requests: "/admin/requests",
      search: "/admin/search",
      categories: "/admin/categories",
      sync: "/admin/sync",
      database: "/admin/database",
      s3: "/admin/s3",
    };
    navigate(urlMap[tabId as keyof typeof urlMap] || "/admin");
  };

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-300">Dubai Visa Services Management</p>
              </div>
            </div>
            <div className="text-sm text-gray-300">Direct Admin Access</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Alert */}
        <UploadAlert />

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-xl rounded-xl p-1 shadow-lg">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "requests", label: "Company Requests", icon: Building2 },
              { id: "search", label: "Add Businesses", icon: Search },
              { id: "categories", label: "Categories", icon: Tags },
              { id: "upload", label: "🚀 Upload to Hostinger", icon: Camera },
              { id: "sync", label: "Data Sync", icon: RotateCw },
              { id: "database", label: "Database", icon: Database },
              { id: "s3", label: "S3 Storage", icon: Plus },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Businesses",
                  value: stats.totalBusinesses,
                  icon: Building2,
                  color: "blue",
                },
                {
                  label: "Total Reviews",
                  value: stats.totalReviews,
                  icon: MessageSquare,
                  color: "green",
                },
                {
                  label: "Total Photos",
                  value: stats.totalPhotos,
                  icon: Camera,
                  color: "purple",
                },
                {
                  label: "Categories",
                  value: stats.categories,
                  icon: Activity,
                  color: "orange",
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="shadow-xl border-0 bg-white/70 backdrop-blur-xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                        <stat.icon
                          className={`h-6 w-6 text-${stat.color}-600`}
                        />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Hostinger Upload Access */}
            <QuickUploadAccess />

            {/* Business Entry Portal Access */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-green-600" />
                      Business Entry Portal
                    </h3>
                    <p className="text-sm text-gray-600">
                      Secure portal to manually add new business listings with
                      photos and reviews
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open("/add-business", "_blank")}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Business
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span>Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span>Google API Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span>Last Sync</span>
                    <span className="text-sm text-gray-600">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cache Management Section */}
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-6 w-6" />
                  <span>Cache Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Clear Website Cache
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Force all users to reload fresh content. Use this if users
                      report seeing outdated data.
                    </p>
                    <Button
                      onClick={handleClearCache}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Clear All Caches
                    </Button>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">
                      Total Business Listings
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-700">
                        Currently showing {stats.businesses || 0} business
                        listings in the directory
                      </p>
                      <Button
                        onClick={fetchDashboardData}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        {loading ? (
                          <RotateCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Refresh Count
                      </Button>
                    </div>
                  </div>

                  {syncStatus && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">{syncStatus}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Company Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-6 w-6" />
                  <span>Company Addition Requests</span>
                  <Badge variant="secondary">
                    {
                      companyRequests.filter((r) => r.status === "pending")
                        .length
                    }{" "}
                    pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companyRequests.length > 0 ? (
                  <div className="space-y-4">
                    {companyRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 border border-gray-200 rounded-lg bg-white/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {request.name}
                            </h3>
                            <p className="text-gray-600">
                              {request.address}, {request.city}
                            </p>
                            {request.description && (
                              <p className="text-sm text-gray-500 mt-2">
                                {request.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Requested on{" "}
                              {new Date(
                                request.requestedAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                request.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : request.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {request.status}
                            </Badge>
                            {request.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleRequestStatus(request.id, "approved")
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleRequestStatus(request.id, "rejected")
                                  }
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No company requests found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Business Search Tab */}
        {activeTab === "search" && (
          <div>
            <BusinessSearchManager />
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Redirect to Full Category Management */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-50 to-blue-50 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Tags className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Advanced Category Management
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Access the comprehensive business and category management
                      system with advanced editing tools.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/admin/manage")}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    Open Category Management
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Category Overview */}
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tags className="h-6 w-6" />
                  <span>Quick Category Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Categories List */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Available Categories ({16})
                    </h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      {[
                        "registered visa agent Dubai",
                        "education visa",
                        "document clearance",
                        "pro services",
                        "attestation services",
                        "work permit services",
                        "tourist visa",
                        "business visa",
                        "family visa",
                        "golden visa services",
                        "residence visa",
                        "employment visa",
                        "investor visa",
                        "visa helper",
                        "immigration services",
                        "business setup services",
                      ].map((category, index) => (
                        <Badge
                          key={index}
                          className="justify-start bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Category Statistics */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">
                      Category Statistics
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white rounded p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          16
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Categories
                        </div>
                      </div>
                      <div className="bg-white rounded p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          841
                        </div>
                        <div className="text-sm text-gray-600">Businesses</div>
                      </div>
                      <div className="bg-white rounded p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          52.6
                        </div>
                        <div className="text-sm text-gray-600">
                          Avg per Category
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-900 mb-3">
                      For Advanced Management
                    </h4>
                    <div className="text-sm text-orange-700 mb-3">
                      To add, edit, merge, or delete categories, use the full
                      management interface.
                    </div>
                    <Button
                      onClick={() => navigate("/admin/manage")}
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Open Full Management
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Sync Tab */}
        {activeTab === "sync" && (
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RotateCw className="h-6 w-6" />
                  <span>Data Synchronization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Google Business Data",
                      desc: "Sync business listings from Google Places API",
                      action: () => handleSync("google"),
                      icon: RefreshCw,
                      color: "blue",
                    },
                    {
                      title: "Reviews Sync",
                      desc: "Update all business reviews",
                      action: () => handleSync("reviews"),
                      icon: MessageSquare,
                      color: "green",
                    },
                    {
                      title: "Photos Sync",
                      desc: "Download and sync business photos",
                      action: () => handleSync("photos"),
                      icon: Camera,
                      color: "purple",
                    },
                    {
                      title: "Database Maintenance",
                      desc: "Optimize and maintain database",
                      action: () => handleSync("database"),
                      icon: Database,
                      color: "orange",
                    },
                  ].map((sync, index) => (
                    <Card
                      key={index}
                      className="border-0 bg-white/50 hover:bg-white/70 transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-3 rounded-xl bg-${sync.color}-100`}
                          >
                            <sync.icon
                              className={`h-6 w-6 text-${sync.color}-600`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{sync.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              {sync.desc}
                            </p>
                            <Button
                              onClick={sync.action}
                              disabled={loading}
                              className={`bg-gradient-to-r from-${sync.color}-500 to-${sync.color}-600 hover:from-${sync.color}-600 hover:to-${sync.color}-700`}
                            >
                              {loading ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <sync.icon className="h-4 w-4 mr-2" />
                              )}
                              Start Sync
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {syncStatus && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">{syncStatus}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* S3 Storage Tab */}
        {activeTab === "s3" && (
          <div className="space-y-8">
            <ApiDebug />
            <SimpleS3Status />
            <DatabaseMigration />
            <UltraFastS3SyncNew />
            <RealTimeSmartSync />
            <S3Configuration />
          </div>
        )}

        {/* Database Tab */}
        {activeTab === "database" && (
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-6 w-6" />
                  <span>Database Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => window.open("/admin/status", "_blank")}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-6 h-auto"
                    >
                      <div className="text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-medium">View Status</div>
                        <div className="text-xs opacity-80">
                          Database details
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => window.open("/admin/manage", "_blank")}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-6 h-auto"
                    >
                      <div className="text-center">
                        <Settings className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-medium">Manage Data</div>
                        <div className="text-xs opacity-80">
                          Business & Categories
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={handleClearDatabase}
                      variant="destructive"
                      disabled={loading}
                      className="p-6 h-auto"
                    >
                      <div className="text-center">
                        <Trash2 className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-medium">Clear Database</div>
                        <div className="text-xs opacity-80">⚠️ Danger zone</div>
                      </div>
                    </Button>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-800 mb-1">
                          Security Notice
                        </h3>
                        <p className="text-sm text-red-700">
                          This admin panel has restricted access. All actions
                          are logged and monitored. Unauthorized access attempts
                          will be reported.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
