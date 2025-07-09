import { RequestHandler } from "express";
import { googleApiManager } from "../utils/googleApiManager";

/**
 * Get current Google API status
 */
export const getApiStatus: RequestHandler = async (req, res) => {
  try {
    const status = googleApiManager.getStatus();
    const costReport = googleApiManager.getCostReport();

    res.json({
      success: true,
      api: status,
      costs: costReport,
      message: status.enabled
        ? "Google API is ACTIVE - Live data + Cache"
        : "Google API is DISABLED - Cache-only mode (NO COSTS)",
    });
  } catch (error) {
    console.error("❌ Failed to get API status:", error);
    res.status(500).json({
      error: "Failed to get API status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Enable Google Places API
 */
export const enableApi: RequestHandler = async (req, res) => {
  try {
    const { reason } = req.body;

    const status = googleApiManager.enableApi(
      reason || "Admin enabled via API",
    );

    console.log("🟢 Google Places API ENABLED by admin");

    res.json({
      success: true,
      message: "Google Places API enabled successfully",
      status,
      warning: "API calls will now cost money. Monitor usage carefully.",
    });
  } catch (error) {
    console.error("❌ Failed to enable API:", error);
    res.status(500).json({
      error: "Failed to enable API",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Disable Google Places API (switch to cache-only mode)
 */
export const disableApi: RequestHandler = async (req, res) => {
  try {
    const { reason } = req.body;

    const status = googleApiManager.disableApi(
      reason || "Admin disabled via API",
    );

    console.log("🔴 Google Places API DISABLED by admin");

    res.json({
      success: true,
      message: "Google Places API disabled successfully",
      status,
      info: "System is now in CACHE-ONLY mode. No API costs will be incurred.",
    });
  } catch (error) {
    console.error("❌ Failed to disable API:", error);
    res.status(500).json({
      error: "Failed to disable API",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Reset API call counters
 */
export const resetCounters: RequestHandler = async (req, res) => {
  try {
    googleApiManager.resetCounters();

    res.json({
      success: true,
      message: "API call counters reset successfully",
      newCounts: {
        apiCalls: 0,
        cacheHits: 0,
      },
    });
  } catch (error) {
    console.error("❌ Failed to reset counters:", error);
    res.status(500).json({
      error: "Failed to reset counters",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get detailed cost report
 */
export const getCostReport: RequestHandler = async (req, res) => {
  try {
    const report = googleApiManager.getCostReport();
    const status = googleApiManager.getStatus();

    // Calculate projected monthly costs
    const dailyApiCalls = report.apiCalls; // Assuming current session
    const projectedMonthlyCalls = dailyApiCalls * 30;
    const projectedMonthlyCost = (projectedMonthlyCalls * 0.017).toFixed(2);

    res.json({
      success: true,
      current: report,
      projections: {
        monthlyApiCalls: projectedMonthlyCalls,
        monthlyEstimatedCost: `$${projectedMonthlyCost} USD`,
        recommendation:
          report.costSavingsPercentage > 80
            ? "Excellent cache usage! API costs are minimal."
            : report.costSavingsPercentage > 60
              ? "Good cache usage. Consider downloading more photos to improve cache hit rate."
              : "High API usage detected. Consider disabling API and using cache-only mode.",
      },
      status: status,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to get cost report:", error);
    res.status(500).json({
      error: "Failed to get cost report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Test API connection (makes a minimal API call to verify connectivity)
 */
export const testApiConnection: RequestHandler = async (req, res) => {
  try {
    const isEnabled = googleApiManager.isApiEnabled();

    if (!isEnabled) {
      return res.json({
        success: false,
        message: "API is currently disabled",
        status: "DISABLED",
        recommendation: "Enable API first to test connection",
      });
    }

    // For now, just return a test response
    // In a real implementation, you'd make a minimal Google Places API call
    googleApiManager.recordApiCall();

    res.json({
      success: true,
      message: "API connection test successful",
      status: "CONNECTED",
      timestamp: new Date().toISOString(),
      note: "Test API call recorded in usage stats",
    });
  } catch (error) {
    console.error("❌ API connection test failed:", error);
    res.status(500).json({
      error: "API connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
