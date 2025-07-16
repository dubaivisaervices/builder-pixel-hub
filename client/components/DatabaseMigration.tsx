import React, { useState } from "react";

export const DatabaseMigration: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const runMigration = async () => {
    setIsLoading(true);
    setMigrationStatus("🔄 Running database migration...");

    try {
      const response = await fetch("/api/admin/migrate/add-s3-columns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setMigrationStatus("✅ Migration completed successfully!");
      } else {
        setMigrationStatus(`❌ Migration failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Migration error:", error);
      setMigrationStatus(`❌ Migration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔧 Database Migration
      </h3>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Add S3 URL columns to the database to enable S3 image storage.
        </p>

        <button
          onClick={runMigration}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          {isLoading ? "Running..." : "Run Migration"}
        </button>

        {migrationStatus && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-mono text-gray-800">{migrationStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};
