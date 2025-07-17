import { RequestHandler } from "express";
import { createGoogleToSupabaseService } from "../services/googleToSupabase";
import { createSupabaseService } from "../database/supabase";

interface SyncStatus {
  isRunning: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  stats: {
    businessesProcessed: number;
    reviewsProcessed: number;
    errors: string[];
  };
  startTime?: number;
  estimatedTimeRemaining?: number;
}

// Global sync status
let currentSyncStatus: SyncStatus = {
  isRunning: false,
  progress: { current: 0, total: 0, percentage: 0 },
  stats: { businessesProcessed: 0, reviewsProcessed: 0, errors: [] },
};

// Test Supabase connection
export const testSupabaseConnection: RequestHandler = async (req, res) => {
  try {
    console.log("🧪 Testing Supabase connection...");

    const supabase = createSupabaseService();
    const result = await supabase.testConnection();

    if (result.success) {
      const stats = await supabase.getStats();
      res.json({
        success: true,
        message: "Supabase connection successful",
        stats,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    res.status(500).json({
      success: false,
      error: `Connection test failed: ${error.message}`,
    });
  }
};

// Get all businesses from Supabase
export const getSupabaseBusinesses: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;

    const supabase = createSupabaseService();

    // Get search parameters
    const searchQuery = req.query.search as string;
    const categoryFilter = req.query.category as string;
    const cityFilter = req.query.city as string;

    let businesses;
    if (searchQuery || categoryFilter || cityFilter) {
      businesses = await supabase.searchBusinesses(
        searchQuery,
        categoryFilter,
        cityFilter,
        limit,
      );
    } else {
      businesses = await supabase.getAllBusinesses(limit, offset);
    }

    const stats = await supabase.getStats();

    res.json({
      success: true,
      businesses,
      stats,
      pagination: {
        page,
        limit,
        total: stats.total,
        pages: Math.ceil(stats.total / limit),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching Supabase businesses:", error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch businesses: ${error.message}`,
    });
  }
};

// Start Google API to Supabase sync
export const startSupabaseSync: RequestHandler = async (req, res) => {
  if (currentSyncStatus.isRunning) {
    return res.status(409).json({
      success: false,
      error: "Sync already in progress",
      status: currentSyncStatus,
    });
  }

  try {
    console.log("🚀 Starting Google API to Supabase sync...");

    // Reset sync status
    currentSyncStatus = {
      isRunning: true,
      progress: { current: 0, total: 841, percentage: 0 }, // Estimate
      stats: { businessesProcessed: 0, reviewsProcessed: 0, errors: [] },
      startTime: Date.now(),
    };

    // Start async sync process
    syncGoogleDataToSupabase();

    res.json({
      success: true,
      message: "Google API to Supabase sync started",
      status: currentSyncStatus,
    });
  } catch (error) {
    currentSyncStatus.isRunning = false;
    console.error("Error starting Supabase sync:", error);
    res.status(500).json({
      success: false,
      error: `Failed to start sync: ${error.message}`,
    });
  }
};

// Get sync status
export const getSupabaseSyncStatus: RequestHandler = async (req, res) => {
  try {
    // Calculate estimated time remaining
    if (
      currentSyncStatus.isRunning &&
      currentSyncStatus.startTime &&
      currentSyncStatus.progress.current > 0
    ) {
      const elapsed = Date.now() - currentSyncStatus.startTime;
      const rate = currentSyncStatus.progress.current / elapsed; // items per ms
      const remaining =
        currentSyncStatus.progress.total - currentSyncStatus.progress.current;
      currentSyncStatus.estimatedTimeRemaining = Math.ceil(remaining / rate);
    }

    res.json({
      success: true,
      status: currentSyncStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to get sync status: ${error.message}`,
    });
  }
};

// Stop sync process
export const stopSupabaseSync: RequestHandler = async (req, res) => {
  try {
    currentSyncStatus.isRunning = false;

    res.json({
      success: true,
      message: "Sync process stopped",
      status: currentSyncStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to stop sync: ${error.message}`,
    });
  }
};

// Test both Google API and Supabase connections
export const testAllConnections: RequestHandler = async (req, res) => {
  try {
    console.log("🧪 Testing Google API and Supabase connections...");

    const service = createGoogleToSupabaseService();
    const results = await service.testConnections();

    res.json({
      success: results.googleApi && results.supabase,
      connections: {
        googleApi: results.googleApi,
        supabase: results.supabase,
      },
      errors: results.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Connection tests failed:", error);
    res.status(500).json({
      success: false,
      error: `Connection tests failed: ${error.message}`,
    });
  }
};

// Get business categories from Supabase
export const getSupabaseCategories: RequestHandler = async (req, res) => {
  try {
    const supabase = createSupabaseService();
    const categories = await supabase.getCategories();

    res.json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch categories: ${error.message}`,
    });
  }
};

// Async function to sync data from Google API to Supabase
async function syncGoogleDataToSupabase() {
  try {
    console.log("📡 Starting Google API data fetch...");

    const service = createGoogleToSupabaseService();
    const results = await service.fetchAndStoreAllBusinesses();

    // Update final status
    currentSyncStatus.isRunning = false;
    currentSyncStatus.progress.current = currentSyncStatus.progress.total;
    currentSyncStatus.progress.percentage = 100;
    currentSyncStatus.stats.businessesProcessed = results.businessesCount;
    currentSyncStatus.stats.reviewsProcessed = results.reviewsCount;
    currentSyncStatus.stats.errors = results.errors;

    if (results.success) {
      console.log(
        `🎉 Sync completed successfully! ${results.businessesCount} businesses, ${results.reviewsCount} reviews`,
      );
    } else {
      console.error("❌ Sync completed with errors:", results.errors);
    }
  } catch (error) {
    console.error("❌ Sync failed:", error);
    currentSyncStatus.isRunning = false;
    currentSyncStatus.stats.errors.push(`Sync failed: ${error.message}`);
  }
}

// Get sync results/summary
export const getSupabaseSyncResults: RequestHandler = async (req, res) => {
  try {
    const supabase = createSupabaseService();
    const stats = await supabase.getStats();

    res.json({
      success: true,
      syncStatus: currentSyncStatus,
      currentData: {
        totalBusinesses: stats.total,
        averageRating: Math.round(stats.avgRating * 10) / 10,
        totalReviews: stats.totalReviews,
      },
      isComplete: !currentSyncStatus.isRunning,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to get sync results: ${error.message}`,
    });
  }
};
