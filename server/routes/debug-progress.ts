import { Request, Response } from "express";

export async function debugProgressStatus(req: Request, res: Response) {
  try {
    const { progressTracker } = await import("../services/progressTracker");

    const currentProgress = progressTracker.getCurrentProgress();
    const listenerCount = progressTracker.listeners?.length || 0;

    res.json({
      success: true,
      currentProgress,
      listenerCount,
      hasProgress: !!currentProgress,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function triggerTestProgress(req: Request, res: Response) {
  try {
    const { progressTracker } = await import("../services/progressTracker");

    // Trigger a test progress update
    progressTracker.startBatch(99, 5);

    setTimeout(() => {
      progressTracker.updateBusiness(1, "Test Business 1", "Testing...");
    }, 1000);

    setTimeout(() => {
      progressTracker.addSuccess("Test Business 1", true, 3);
    }, 2000);

    setTimeout(() => {
      progressTracker.completeBatch();
    }, 3000);

    res.json({
      success: true,
      message: "Test progress sequence triggered",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
