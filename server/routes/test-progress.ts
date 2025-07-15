import { Request, Response } from "express";

export async function testProgressTracking(req: Request, res: Response) {
  try {
    const { progressTracker } = await import("../services/progressTracker");

    // Start a test batch
    progressTracker.startBatch(1, 10);

    res.json({ success: true, message: "Test progress started" });

    // Simulate processing 10 businesses
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        progressTracker.updateBusiness(i, `Test Business ${i}`, `Step ${i}`);

        // Simulate some success
        if (i % 3 === 0) {
          progressTracker.addSuccess(`Test Business ${i}`, true, 2);
        } else if (i % 4 === 0) {
          progressTracker.addError(`Test Business ${i}`, "Test error");
        }

        // Complete the batch
        if (i === 10) {
          setTimeout(() => {
            progressTracker.completeBatch();
          }, 1000);
        }
      }, i * 2000); // 2 seconds between each update
    }
  } catch (error) {
    console.error("❌ Test progress error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
