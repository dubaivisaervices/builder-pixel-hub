import React, { useState, useEffect } from "react";

export const SimpleS3Status: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkS3Status = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/debug-s3-status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error checking S3 status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkS3Status();
  }, []);

  if (loading && !status) {
    return <div className="text-center">Loading S3 status...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔍 S3 URL Status
      </h3>

      {status && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Database Stats:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Total businesses: {status.stats.total}</li>
              <li>• With S3 logo URLs: {status.stats.with_logo_s3}</li>
              <li>• With S3 photo URLs: {status.stats.with_photos_s3}</li>
            </ul>
          </div>

          {status.stats.with_logo_s3 === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>No S3 URLs found!</strong> You need to run the
                Ultra-Fast S3 Sync to upload images to S3 and populate the S3
                URLs in the database.
              </p>
            </div>
          )}

          <button
            onClick={checkS3Status}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            {loading ? "Checking..." : "Refresh Status"}
          </button>
        </div>
      )}
    </div>
  );
};
