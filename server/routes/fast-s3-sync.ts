import { RequestHandler } from "express";
import { getFastS3Sync } from "../utils/fastS3Sync";
import { isS3Configured } from "../utils/s3Service";

// Store active sync for SSE connections
let activeSync: any = null;

export const startFastS3Sync: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
        message: "Please configure AWS credentials and S3 bucket name",
      });
    }

    const sync = getFastS3Sync();

    if (sync.isRunning()) {
      return res.status(409).json({
        error: "Sync already in progress",
        progress: sync.getProgress(),
      });
    }

    console.log("🚀 Starting ULTRA-FAST S3 sync via API...");

    // Start sync in background
    setImmediate(async () => {
      try {
        activeSync = sync;
        await sync.startFastSync();
      } catch (error) {
        console.error("Fast sync error:", error);
        activeSync = null;
      }
    });

    res.json({
      success: true,
      message: "Ultra-fast S3 sync started",
      syncId: Date.now().toString(),
      estimatedTime: "Calculating...",
    });
  } catch (error) {
    console.error("Error starting fast S3 sync:", error);
    res.status(500).json({
      error: "Failed to start fast S3 sync",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getFastSyncProgress: RequestHandler = async (req, res) => {
  try {
    const sync = getFastS3Sync();
    const progress = sync.getProgress();

    // Calculate additional metrics
    const completionPercentage =
      progress.totalTasks > 0
        ? (progress.completedTasks / progress.totalTasks) * 100
        : 0;

    const elapsedTime = (Date.now() - progress.startTime) / 1000;

    res.json({
      ...progress,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      elapsedTime: Math.round(elapsedTime),
      isRunning: sync.isRunning(),
      throughput: {
        uploadsPerSecond: progress.averageSpeed,
        imagesProcessed: progress.completedTasks,
        successRate:
          progress.completedTasks > 0
            ? (progress.successfulUploads / progress.completedTasks) * 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Error getting sync progress:", error);
    res.status(500).json({
      error: "Failed to get sync progress",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const stopFastS3Sync: RequestHandler = async (req, res) => {
  try {
    const sync = getFastS3Sync();

    if (!sync.isRunning()) {
      return res.status(400).json({
        error: "No sync is currently running",
      });
    }

    sync.abort();
    activeSync = null;

    res.json({
      success: true,
      message: "Fast S3 sync stopped",
      finalProgress: sync.getProgress(),
    });
  } catch (error) {
    console.error("Error stopping fast S3 sync:", error);
    res.status(500).json({
      error: "Failed to stop fast S3 sync",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getFastSyncResults: RequestHandler = async (req, res) => {
  try {
    const sync = getFastS3Sync();
    const results = sync.getResults();
    const progress = sync.getProgress();

    // Analyze results
    const analysis = {
      summary: {
        totalUploads: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        averageDuration:
          results.length > 0
            ? results.reduce((sum, r) => sum + r.duration, 0) / results.length
            : 0,
      },
      breakdown: {
        logos: results.filter((r) => r.imageType === "logo"),
        photos: results.filter((r) => r.imageType === "photo"),
      },
      errors: progress.errors.slice(0, 20), // Show first 20 errors
      performance: {
        fastestUpload: Math.min(...results.map((r) => r.duration)),
        slowestUpload: Math.max(...results.map((r) => r.duration)),
        totalTime: (Date.now() - progress.startTime) / 1000,
      },
    };

    res.json({
      progress,
      results: results.slice(0, 100), // Limit to first 100 for performance
      analysis,
    });
  } catch (error) {
    console.error("Error getting sync results:", error);
    res.status(500).json({
      error: "Failed to get sync results",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Server-Sent Events for real-time progress updates
export const syncProgressSSE: RequestHandler = (req, res) => {
  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  const sync = getFastS3Sync();

  // Send initial progress
  const sendProgress = () => {
    const progress = sync.getProgress();
    const completionPercentage =
      progress.totalTasks > 0
        ? (progress.completedTasks / progress.totalTasks) * 100
        : 0;

    res.write(
      `data: ${JSON.stringify({
        ...progress,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
        isRunning: sync.isRunning(),
      })}\n\n`,
    );
  };

  // Send progress updates
  const progressListener = () => sendProgress();
  const completeListener = () => {
    sendProgress();
    res.write(`data: {"type": "complete"}\n\n`);
  };
  const errorListener = (error: any) => {
    res.write(
      `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`,
    );
  };

  sync.on("progress", progressListener);
  sync.on("complete", completeListener);
  sync.on("error", errorListener);

  // Send initial state
  sendProgress();

  // Clean up on client disconnect
  req.on("close", () => {
    sync.off("progress", progressListener);
    sync.off("complete", completeListener);
    sync.off("error", errorListener);
  });
};

export const getSyncStats: RequestHandler = async (req, res) => {
  try {
    const sync = getFastS3Sync();
    const progress = sync.getProgress();
    const results = sync.getResults();

    const stats = {
      current: {
        isRunning: sync.isRunning(),
        progress: progress,
        activeUploads: progress.currentlyProcessing,
      },
      performance: {
        averageSpeed: progress.averageSpeed,
        totalUploaded: progress.successfulUploads,
        errorRate:
          progress.completedTasks > 0
            ? (progress.failedUploads / progress.completedTasks) * 100
            : 0,
      },
      estimates: {
        timeRemaining: progress.estimatedTimeRemaining,
        completionTime: progress.estimatedTimeRemaining
          ? new Date(Date.now() + progress.estimatedTimeRemaining * 1000)
          : null,
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting sync stats:", error);
    res.status(500).json({
      error: "Failed to get sync stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
