import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DatabaseStats {
  totalBusinesses: number;
  totalReviews: number;
  realReviews: number;
  businessesWithReviews: number;
  totalPhotos: number;
  photosWithUrls: number;
  photosWithBase64: number;
  businessesWithPhotos: number;
  expectedPhotos: number;
  photosSaved: number;
}

export default function DatabaseStatus() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
      console.log("Database Stats:", data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSyncStatus = async () => {
    try {
      const response = await fetch("/api/admin/sync-status");
      const data = await response.json();
      console.log("Sync Status:", data);
      alert(
        `Sync Status:\n- Photos: ${data.photos.savedLocally}/${data.photos.total} (${data.photos.percentage}%)\n- Reviews: ${data.reviews.total} across ${data.reviews.businessesWithReviews} businesses`,
      );
    } catch (error) {
      console.error("Failed to check sync status:", error);
      alert("Failed to check sync status");
    }
  };

  const downloadPhotos = async () => {
    if (
      !confirm(
        "This will download all photos and may take a long time. Continue?",
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/download-photos", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409) {
          alert(`Download already in progress: ${error.message}`);
          return;
        }
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Download Result:", data);
      alert(
        `Download completed!\n- Photos downloaded: ${data.totalPhotosDownloaded}\n- Photos saved: ${data.totalPhotosSaved}`,
      );
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to download photos:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to download photos: ${errorMessage}`);
    }
  };

  const stopDownload = async () => {
    if (!confirm("Stop the current photo download process?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/stop-download", {
        method: "POST",
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Failed to stop download:", error);
      alert("Failed to stop download");
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Database Status Checker
          </h1>
          <p className="text-gray-600">
            Check photos and reviews in the database
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Businesses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalBusinesses}
                </div>
                <div className="text-sm text-gray-500">Total businesses</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.totalReviews}
                </div>
                <div className="text-sm text-gray-500">
                  Total reviews ({stats.realReviews} real)
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {stats.businessesWithReviews} businesses have reviews
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.photosSaved} / {stats.expectedPhotos}
                </div>
                <div className="text-sm text-gray-500">
                  Photos saved locally
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {stats.totalPhotos} total photos in database
                </div>
                <div className="text-xs text-gray-400">
                  {stats.businessesWithPhotos} businesses have photos
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={loadStats} disabled={loading}>
              {loading ? "Loading..." : "Refresh Stats"}
            </Button>

            <Button onClick={checkSyncStatus} variant="outline">
              Check Sync Status
            </Button>

            <Button onClick={downloadPhotos} variant="outline">
              Download All Photos
            </Button>

            <Button onClick={stopDownload} variant="destructive">
              Stop Download
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats && stats.photosSaved < stats.expectedPhotos && (
                  <div className="text-orange-600">
                    ⚠️ Missing photos:{" "}
                    {stats.expectedPhotos - stats.photosSaved} photos not saved
                    locally
                  </div>
                )}
                {stats && stats.totalReviews < 1000 && (
                  <div className="text-red-600">
                    ❌ Low review count: Only {stats.totalReviews} reviews in
                    database
                  </div>
                )}
                {stats &&
                  stats.photosSaved >= stats.expectedPhotos &&
                  stats.totalReviews >= 1000 && (
                    <div className="text-green-600">
                      ✅ All systems good! Photos and reviews are properly saved
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Photos</div>
                  <div>Total photos: {stats.totalPhotos}</div>
                  <div>With URLs: {stats.photosWithUrls}</div>
                  <div>With Base64: {stats.photosWithBase64}</div>
                  <div>Expected: {stats.expectedPhotos}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Reviews</div>
                  <div>Total reviews: {stats.totalReviews}</div>
                  <div>Real reviews: {stats.realReviews}</div>
                  <div>
                    Businesses with reviews: {stats.businessesWithReviews}
                  </div>
                  <div>
                    Average per business:{" "}
                    {stats.businessesWithReviews > 0
                      ? Math.round(
                          stats.totalReviews / stats.businessesWithReviews,
                        )
                      : 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
