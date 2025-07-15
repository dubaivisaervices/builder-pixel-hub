import { useState, useEffect } from "react";
import { dataLoader, BusinessData } from "../utils/dataLoader";

export const useBusinessData = () => {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("none");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Loading business data for Report Visa Scam...");

        const data = await dataLoader.loadBusinessData();

        setBusinesses(data.businesses);
        setDataSource(data.meta.source);

        console.log(
          `✅ Loaded ${data.businesses.length} businesses from ${data.meta.source}`,
        );

        // Alert if using fallback data
        if (data.meta.source === "Fallback") {
          console.warn("⚠️ Using fallback data - some features may be limited");
        } else if (data.businesses.length > 800) {
          console.log(
            "🎉 Full database loaded - all 841 businesses available!",
          );
        }
      } catch (err) {
        console.error("❌ Failed to load business data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");

        // Set minimal fallback data
        setBusinesses([
          {
            id: "emergency-fallback",
            name: "Data Loading Issue",
            address: "Please refresh the page",
            category: "System",
            rating: 0,
            reviewCount: 0,
            hasTargetKeyword: false,
          },
        ]);
        setDataSource("Emergency Fallback");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    dataLoader.clearCache();
    setLoading(true);

    try {
      const data = await dataLoader.loadBusinessData();
      setBusinesses(data.businesses);
      setDataSource(data.meta.source);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    businesses,
    loading,
    error,
    dataSource,
    refreshData,
    isFullDataset: businesses.length > 800,
    isFallbackData:
      dataSource === "Fallback" || dataSource === "Emergency Fallback",
  };
};
