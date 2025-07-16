import React, { useState, useEffect } from "react";

export const ApiDebug: React.FC = () => {
  const [status, setStatus] = useState<string>("Testing...");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log("Testing API connectivity...");

        // Test if we can reach the server
        const response = await fetch("/api/database-status");
        console.log("Response received:", response);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Database status data:", data);

        setStatus("✅ API Connection Working");
        setDetails(data);

        // Now test S3 status
        try {
          const s3Response = await fetch("/api/admin/s3-status");
          console.log("S3 Response:", s3Response);

          if (s3Response.ok) {
            const s3Data = await s3Response.json();
            console.log("S3 status data:", s3Data);
            setDetails((prev) => ({ ...prev, s3Status: s3Data }));
          } else {
            console.warn(
              "S3 endpoint failed:",
              s3Response.status,
              s3Response.statusText,
            );
            setDetails((prev) => ({
              ...prev,
              s3Error: `HTTP ${s3Response.status}`,
            }));
          }
        } catch (s3Error) {
          console.error("S3 fetch error:", s3Error);
          setDetails((prev) => ({ ...prev, s3Error: s3Error.message }));
        }
      } catch (error) {
        console.error("API test failed:", error);
        setStatus(`❌ API Connection Failed: ${error.message}`);
        setDetails({ error: error.message });
      }
    };

    testApi();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔧 API Debug Status
      </h3>

      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-blue-900 font-medium">{status}</p>
        </div>

        {details && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Details:</h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
