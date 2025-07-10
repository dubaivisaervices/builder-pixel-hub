import { RequestHandler } from "express";

// Simple in-memory API status tracking (in production, use database)
let apiState = {
  enabled: true,
  lastToggled: new Date().toISOString(),
  reason: "Default enabled",
  apiCalls: 0,
  cacheHits: 0,
};

/**
 * Get current API status and usage stats
 */
export const getApiStatus: RequestHandler = async (req, res) => {
  try {
    // Calculate some basic stats
    const totalRequests = apiState.apiCalls + apiState.cacheHits;
    const cachePercentage =
      totalRequests > 0
        ? Math.round((apiState.cacheHits / totalRequests) * 100)
        : 0;

    const estimatedCost = apiState.apiCalls * 0.017; // Rough Google Places API cost per request

    res.json({
      success: true,
      api: {
        enabled: apiState.enabled,
        lastToggled: apiState.lastToggled,
        reason: apiState.reason,
        mode: apiState.enabled ? "LIVE API + CACHE" : "CACHE ONLY",
      },
      costs: {
        apiCalls: apiState.apiCalls,
        cacheHits: apiState.cacheHits,
        totalRequests,
        costSavingsPercentage: cachePercentage,
        estimatedSavings: `$${(apiState.cacheHits * 0.017).toFixed(2)}`,
        estimatedCost: `$${estimatedCost.toFixed(2)}`,
      },
      message: apiState.enabled
        ? "Google API is active - Live data available but costs money"
        : "Google API is disabled - Cache-only mode (No costs)",
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

    apiState = {
      ...apiState,
      enabled: true,
      lastToggled: new Date().toISOString(),
      reason: reason || "Admin enabled via dashboard",
    };

    console.log(
      "🟢 Google Places API ENABLED:",
      reason || "No reason provided",
    );

    res.json({
      success: true,
      message: "Google Places API enabled successfully",
      api: {
        enabled: apiState.enabled,
        lastToggled: apiState.lastToggled,
        reason: apiState.reason,
      },
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

    apiState = {
      ...apiState,
      enabled: false,
      lastToggled: new Date().toISOString(),
      reason: reason || "Admin disabled via dashboard",
    };

    console.log(
      "🔴 Google Places API DISABLED:",
      reason || "No reason provided",
    );

    res.json({
      success: true,
      message: "Google Places API disabled successfully",
      api: {
        enabled: apiState.enabled,
        lastToggled: apiState.lastToggled,
        reason: apiState.reason,
      },
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
 * Record an API call (for cost tracking)
 */
export const recordApiCall = () => {
  apiState.apiCalls++;
  console.log(
    `💰 API CALL RECORDED (Total: ${apiState.apiCalls}) - COSTS MONEY`,
  );
};

/**
 * Record a cache hit (for savings tracking)
 */
export const recordCacheHit = () => {
  apiState.cacheHits++;
  console.log(`💾 CACHE HIT RECORDED (Total: ${apiState.cacheHits}) - FREE`);
};

/**
 * Check if API is enabled
 */
export const isApiEnabled = (): boolean => {
  return apiState.enabled;
};

/**
 * Reset counters
 */
export const resetCounters: RequestHandler = async (req, res) => {
  try {
    apiState.apiCalls = 0;
    apiState.cacheHits = 0;

    console.log("🔄 API usage counters reset");

    res.json({
      success: true,
      message: "API usage counters reset successfully",
      counters: {
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
    const totalRequests = apiState.apiCalls + apiState.cacheHits;
    const cachePercentage =
      totalRequests > 0
        ? Math.round((apiState.cacheHits / totalRequests) * 100)
        : 0;

    const estimatedDailyCost = apiState.apiCalls * 0.017;
    const estimatedMonthlyCost = estimatedDailyCost * 30;
    const moneySaved = apiState.cacheHits * 0.017;

    res.json({
      success: true,
      report: {
        totalRequests,
        apiCalls: apiState.apiCalls,
        cacheHits: apiState.cacheHits,
        cachePercentage,
        estimatedDailyCost: `$${estimatedDailyCost.toFixed(2)}`,
        estimatedMonthlyCost: `$${estimatedMonthlyCost.toFixed(2)}`,
        moneySaved: `$${moneySaved.toFixed(2)}`,
      },
      recommendations: [
        cachePercentage > 80
          ? "Excellent cache usage! API costs are minimal."
          : cachePercentage > 60
            ? "Good cache usage. Consider downloading more images to improve cache hit rate."
            : "High API usage detected. Consider disabling API and using cache-only mode.",
      ],
      status: apiState,
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
