import { getS3Service, isS3Configured } from "./s3Service";
import { businessService } from "../database/businessService";
import { EventEmitter } from "events";

interface UploadTask {
  id: string;
  businessId: string;
  businessName: string;
  imageUrl: string;
  imageType: "logo" | "photo";
  caption?: string;
  priority: number;
}

interface UploadResult {
  taskId: string;
  businessId: string;
  imageType: "logo" | "photo";
  success: boolean;
  s3Url?: string;
  error?: string;
  duration: number;
}

interface SyncProgress {
  totalTasks: number;
  completedTasks: number;
  successfulUploads: number;
  failedUploads: number;
  currentlyProcessing: number;
  averageSpeed: number; // uploads per second
  estimatedTimeRemaining: number; // seconds
  startTime: number;
  errors: string[];
}

export class FastS3Sync extends EventEmitter {
  private concurrentLimit: number = 10; // Process 10 uploads simultaneously
  private batchSize: number = 50; // Process 50 businesses at a time
  private currentTasks: Map<string, UploadTask> = new Map();
  private results: UploadResult[] = [];
  private progress: SyncProgress;
  private isRunning: boolean = false;
  private aborted: boolean = false;

  constructor() {
    super();
    this.progress = this.initializeProgress();
  }

  private initializeProgress(): SyncProgress {
    return {
      totalTasks: 0,
      completedTasks: 0,
      successfulUploads: 0,
      failedUploads: 0,
      currentlyProcessing: 0,
      averageSpeed: 0,
      estimatedTimeRemaining: 0,
      startTime: Date.now(),
      errors: [],
    };
  }

  /**
   * Start ultra-fast sync of all business images
   */
  async startFastSync(): Promise<SyncProgress> {
    if (this.isRunning) {
      throw new Error("Sync already in progress");
    }

    if (!isS3Configured()) {
      throw new Error("S3 is not configured");
    }

    console.log("🚀 Starting ULTRA-FAST S3 sync...");
    this.isRunning = true;
    this.aborted = false;
    this.progress = this.initializeProgress();
    this.results = [];

    try {
      // Get all businesses in batches for memory efficiency
      const totalBusinesses = await businessService.getBusinessCount();
      console.log(`📊 Found ${totalBusinesses} businesses to process`);

      // Create upload tasks
      const tasks = await this.createUploadTasks();
      this.progress.totalTasks = tasks.length;

      console.log(`🎯 Created ${tasks.length} upload tasks`);
      console.log(`⚡ Using ${this.concurrentLimit} concurrent uploads`);

      // Process tasks with concurrency control
      await this.processConcurrentUploads(tasks);

      // Final statistics
      const endTime = Date.now();
      const totalTime = (endTime - this.progress.startTime) / 1000;
      const finalSpeed = this.progress.completedTasks / totalTime;

      console.log(`✅ ULTRA-FAST sync completed!`);
      console.log(`📊 Final Stats:`);
      console.log(`   - Total time: ${totalTime.toFixed(1)} seconds`);
      console.log(`   - Average speed: ${finalSpeed.toFixed(1)} uploads/sec`);
      console.log(`   - Successful: ${this.progress.successfulUploads}`);
      console.log(`   - Failed: ${this.progress.failedUploads}`);

      this.progress.averageSpeed = finalSpeed;
      this.emit("complete", this.progress);

      return this.progress;
    } catch (error) {
      this.progress.errors.push(
        `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      this.emit("error", error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Create optimized upload tasks with priority
   */
  private async createUploadTasks(): Promise<UploadTask[]> {
    const tasks: UploadTask[] = [];
    let taskCounter = 0;
    let businessCounter = 0;

    // Process businesses in batches to avoid memory issues
    for (let offset = 0; ; offset += this.batchSize) {
      const businesses = await businessService.getBusinessesPaginated(
        offset,
        this.batchSize,
      );

      if (businesses.length === 0) break;

      for (const business of businesses) {
        businessCounter++;

        // Add logo upload task (high priority)
        if (business.logoUrl && !business.logoS3Url) {
          tasks.push({
            id: `logo-${taskCounter++}`,
            businessId: business.id,
            businessName: business.name,
            imageUrl: business.logoUrl,
            imageType: "logo",
            priority: 1, // High priority for logos
          });
        }

        // Add photo upload tasks (normal priority)
        if (business.photos && Array.isArray(business.photos)) {
          for (const photo of business.photos) {
            if (photo.url && !photo.s3Url) {
              tasks.push({
                id: `photo-${taskCounter++}`,
                businessId: business.id,
                businessName: business.name,
                imageUrl: photo.url,
                imageType: "photo",
                caption: photo.caption,
                priority: 2, // Normal priority for photos
              });
            }
          }
        }

        // Log progress for large datasets
        if (businessCounter % 100 === 0) {
          console.log(`📝 Analyzed ${businessCounter} businesses...`);
        }
      }
    }

    // Sort tasks by priority (logos first)
    tasks.sort((a, b) => a.priority - b.priority);

    console.log(`🎯 Task breakdown:`);
    console.log(
      `   - Logos: ${tasks.filter((t) => t.imageType === "logo").length}`,
    );
    console.log(
      `   - Photos: ${tasks.filter((t) => t.imageType === "photo").length}`,
    );

    return tasks;
  }

  /**
   * Process uploads with smart concurrency control
   */
  private async processConcurrentUploads(tasks: UploadTask[]): Promise<void> {
    const activeUploads: Promise<void>[] = [];

    for (const task of tasks) {
      if (this.aborted) break;

      // Wait if we're at the concurrency limit
      if (activeUploads.length >= this.concurrentLimit) {
        await Promise.race(activeUploads);
      }

      // Start upload task
      const uploadPromise = this.processUploadTask(task).finally(() => {
        // Remove completed task from active list
        const index = activeUploads.indexOf(uploadPromise);
        if (index > -1) {
          activeUploads.splice(index, 1);
        }
      });

      activeUploads.push(uploadPromise);
    }

    // Wait for all remaining uploads to complete
    await Promise.all(activeUploads);
  }

  /**
   * Process individual upload task with error handling
   */
  private async processUploadTask(task: UploadTask): Promise<void> {
    const startTime = Date.now();
    this.progress.currentlyProcessing++;
    this.currentTasks.set(task.id, task);

    try {
      const s3Service = getS3Service();
      let s3Url: string;

      if (task.imageType === "logo") {
        s3Url = await s3Service.uploadBusinessLogo(
          task.businessId,
          task.imageUrl,
          task.businessName,
        );

        // Update business with S3 URL
        const business = await businessService.getBusinessById(task.businessId);
        if (business) {
          await businessService.updateBusiness(task.businessId, {
            ...business,
            logoS3Url: s3Url,
          });
        }
      } else {
        s3Url = await s3Service.uploadBusinessPhoto(
          task.businessId,
          task.imageUrl,
          task.businessName,
          task.caption,
        );

        // Update business photos with S3 URL
        const business = await businessService.getBusinessById(task.businessId);
        if (business && business.photos) {
          const updatedPhotos = business.photos.map((photo) =>
            photo.url === task.imageUrl
              ? { ...photo, s3Url, s3UploadedAt: new Date().toISOString() }
              : photo,
          );

          await businessService.updateBusiness(task.businessId, {
            ...business,
            photos: updatedPhotos,
          });
        }
      }

      const duration = Date.now() - startTime;

      const result: UploadResult = {
        taskId: task.id,
        businessId: task.businessId,
        imageType: task.imageType,
        success: true,
        s3Url,
        duration,
      };

      this.results.push(result);
      this.progress.successfulUploads++;

      // Log success for important uploads
      if (
        task.imageType === "logo" ||
        this.progress.successfulUploads % 10 === 0
      ) {
        console.log(
          `✅ ${task.imageType} uploaded: ${task.businessName} (${duration}ms)`,
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      const result: UploadResult = {
        taskId: task.id,
        businessId: task.businessId,
        imageType: task.imageType,
        success: false,
        error: errorMessage,
        duration,
      };

      this.results.push(result);
      this.progress.failedUploads++;
      this.progress.errors.push(
        `${task.businessName} ${task.imageType}: ${errorMessage}`,
      );

      console.error(
        `❌ Upload failed: ${task.businessName} ${task.imageType} - ${errorMessage}`,
      );
    } finally {
      this.progress.currentlyProcessing--;
      this.progress.completedTasks++;
      this.currentTasks.delete(task.id);

      // Update speed and time estimates
      this.updateProgressStats();

      // Emit progress update
      this.emit("progress", this.progress);

      // Log milestone progress
      if (this.progress.completedTasks % 50 === 0) {
        console.log(
          `📊 Progress: ${this.progress.completedTasks}/${this.progress.totalTasks} (${((this.progress.completedTasks / this.progress.totalTasks) * 100).toFixed(1)}%) - Speed: ${this.progress.averageSpeed.toFixed(1)}/sec`,
        );
      }
    }
  }

  /**
   * Update speed and time estimates
   */
  private updateProgressStats(): void {
    const elapsed = (Date.now() - this.progress.startTime) / 1000;
    this.progress.averageSpeed = this.progress.completedTasks / elapsed;

    if (this.progress.averageSpeed > 0) {
      const remaining = this.progress.totalTasks - this.progress.completedTasks;
      this.progress.estimatedTimeRemaining =
        remaining / this.progress.averageSpeed;
    }
  }

  /**
   * Get current progress
   */
  getProgress(): SyncProgress {
    return { ...this.progress };
  }

  /**
   * Abort current sync
   */
  abort(): void {
    console.log("🛑 Aborting S3 sync...");
    this.aborted = true;
    this.isRunning = false;
    this.emit("aborted", this.progress);
  }

  /**
   * Check if sync is currently running
   */
  isSyncRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get detailed results
   */
  getResults(): UploadResult[] {
    return [...this.results];
  }
}

// Singleton instance for managing sync state
let syncInstance: FastS3Sync | null = null;

export function getFastS3Sync(): FastS3Sync {
  if (!syncInstance) {
    syncInstance = new FastS3Sync();
  }
  return syncInstance;
}
