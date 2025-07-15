interface ProgressUpdate {
  batchNumber: number;
  totalBusinesses: number;
  currentBusiness: number;
  businessName: string;
  status: "processing" | "success" | "failed" | "completed";
  logos: number;
  photos: number;
  errors: string[];
  currentStep?: string;
}

class ProgressTracker {
  private listeners: Array<(update: ProgressUpdate) => void> = [];
  private currentProgress: ProgressUpdate | null = null;

  subscribe(callback: (update: ProgressUpdate) => void) {
    this.listeners.push(callback);

    // Send current progress if available
    if (this.currentProgress) {
      callback(this.currentProgress);
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  updateProgress(update: Partial<ProgressUpdate>) {
    if (!this.currentProgress) {
      this.currentProgress = {
        batchNumber: 1,
        totalBusinesses: 0,
        currentBusiness: 0,
        businessName: "",
        status: "processing",
        logos: 0,
        photos: 0,
        errors: [],
      };
    }

    this.currentProgress = { ...this.currentProgress, ...update };

    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentProgress!);
      } catch (error) {
        console.error("Progress tracker callback error:", error);
      }
    });
  }

  startBatch(batchNumber: number, totalBusinesses: number) {
    this.updateProgress({
      batchNumber,
      totalBusinesses,
      currentBusiness: 0,
      businessName: "",
      status: "processing",
      logos: 0,
      photos: 0,
      errors: [],
    });
  }

  updateBusiness(
    currentBusiness: number,
    businessName: string,
    currentStep?: string,
  ) {
    this.updateProgress({
      currentBusiness,
      businessName,
      currentStep,
    });
  }

  addSuccess(businessName: string, logoAdded: boolean, photosAdded: number) {
    const current = this.currentProgress;
    if (current) {
      this.updateProgress({
        logos: current.logos + (logoAdded ? 1 : 0),
        photos: current.photos + photosAdded,
      });
    }
  }

  addError(businessName: string, error: string) {
    const current = this.currentProgress;
    if (current) {
      this.updateProgress({
        errors: [...current.errors, `${businessName}: ${error}`],
      });
    }
  }

  completeBatch() {
    this.updateProgress({
      status: "completed",
    });
  }

  getCurrentProgress(): ProgressUpdate | null {
    return this.currentProgress;
  }

  reset() {
    this.currentProgress = null;
    this.listeners = [];
  }
}

// Singleton instance
export const progressTracker = new ProgressTracker();
