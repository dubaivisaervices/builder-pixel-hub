import express from "express";
import cors from "cors";
import multer from "multer";
import { database } from "./database/database";
import { handleDemo } from "./routes/demo";
import {
  searchDubaiVisaServices,
  getBusinessDetails,
  getBusinessPhoto,
  getBusinessById,
  testGoogleAPI,
  debugImageData,
} from "./routes/google-business";
import {
  syncGoogleData,
  getSyncStatus,
  syncReviewsOnly,
  clearFakeReviewsAndSyncReal,
  clearAllDataAndResync,
  syncWithOfflinePhotos,
} from "./routes/sync-google-data";
import {
  getBusinessesByCategory,
  updateBusiness,
  deleteBusiness,
  getAllCategories,
  updateCategory,
  deleteCategory,
  debugPhotoData,
} from "./routes/admin";
import { getDatabaseStats } from "./routes/admin-sync";
import {
  downloadAllPhotos,
  stopPhotoDownload,
  getDownloadStatus,
  syncAllReviews,
  checkSyncStatus,
} from "./routes/photo-sync";
import { fixBusinessEmailsAndWebsites } from "./routes/fix-business-data";
import {
  addCompanyRequest,
  getCompanyRequests,
  updateCompanyRequestStatus,
} from "./routes/add-company-request";
import {
  saveAllBusinessData,
  saveBusinessImagesToGitHub,
  getDataPersistenceStatus,
  exportAllData,
} from "./routes/data-persistence";
import {
  fetchAllDataFromGitHub,
  getGitHubStatus,
  fetchBusinessFromGitHub,
} from "./routes/github-data-fetcher";
import {
  downloadLogos,
  getLogoDownloadProgress,
  stopLogoDownload,
  getLogoStats,
} from "./routes/logo-download";
import {
  getApiStatus,
  enableApi,
  disableApi,
  resetCounters,
  getCostReport,
} from "./routes/api-control-simple";
// Simplified imports for space constraints
import { addBusinessManually } from "./routes/manual-business-add";
import {
  serveCachedLogo,
  serveCachedPhoto,
} from "./routes/serve-cached-images";
import { generatePlaceholderLogo } from "./routes/placeholder-logo";
import {
  submitReport,
  getCompanyReports,
  getAllReports,
  updateReportStatus,
} from "./routes/reports-api";
// Temporarily disabled due to space constraints
// import {
//   downloadOptimizedPhotos,
//   stopOptimizedDownload,
//   getOptimizedDownloadProgress,
// } from "./routes/optimized-photo-download";
import { getBusinessReviews } from "./routes/business-reviews-real";
import {
  syncAllGoogleReviews,
  syncBusinessReviews,
  getReviewSyncStats,
} from "./routes/sync-google-reviews";
import {
  getS3Status,
  uploadBusinessImageToS3,
  batchUploadBusinessImages,
  syncAllBusinessImagesToS3,
  deleteS3Object,
  listS3Objects,
} from "./routes/s3-management";
import {
  syncBusinessesToS3,
  syncSingleBusinessToS3,
} from "./routes/s3-sync-businesses";
import {
  startFastS3Sync,
  getFastSyncProgress,
  stopFastS3Sync,
  getFastSyncResults,
  syncProgressSSE,
  getSyncStats,
} from "./routes/fast-s3-sync";
import { smartS3Sync, getSmartSyncStats } from "./routes/smart-s3-sync";
import {
  startRealtimeSmartSync,
  getRealtimeSmartSyncProgress,
  realtimeSmartSyncSSE,
} from "./routes/realtime-smart-sync";
import {
  startUltraFastS3Sync,
  getUltraFastProgress,
  ultraFastSyncSSE,
  stopUltraFastSync,
} from "./routes/ultra-fast-s3-sync";
import {
  debugBusinessImages,
  testSingleImageFetch,
} from "./routes/debug-images";
import { analyzeImageTypes } from "./routes/analyze-image-types";
import {
  checkCompanyExists,
  submitNewCompany,
  submitReport,
  getCompanyReports,
  voteOnReport,
  getReportsStats,
} from "./routes/company-reports";

export function createServer() {
  const app = express();

  // Configure multer for file uploads
  const upload = multer({
    dest: "uploads/",
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."),
        );
      }
    },
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ensure all API routes return JSON content-type
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Google Business API routes
  app.get("/api/test-google-api", testGoogleAPI);
  app.get("/api/businesses", searchDubaiVisaServices);
  app.get("/api/dubai-visa-services", searchDubaiVisaServices);
  app.get("/api/business/:placeId", getBusinessDetails);
  app.get("/api/business-photo/:photoReference", getBusinessPhoto);
  app.get("/api/business-db/:businessId", getBusinessById);
  app.get("/api/debug-images/:businessId", debugImageData);

  // Database sync routes
  app.post("/api/sync-google-data", syncGoogleData);
  app.post("/api/sync-reviews", syncReviewsOnly);
  app.post("/api/clear-fake-reviews", clearFakeReviewsAndSyncReal);
  app.post("/api/clear-and-resync", clearAllDataAndResync);
  app.post("/api/sync-offline-photos", syncWithOfflinePhotos);
  app.get("/api/sync-status", getSyncStatus);

  // Admin routes for business and category management
  app.get("/api/admin/businesses-by-category", getBusinessesByCategory);
  app.put("/api/admin/business/:id", updateBusiness);
  app.delete("/api/admin/business/:id", deleteBusiness);
  app.get("/api/admin/categories", getAllCategories);
  app.put("/api/admin/category/:oldCategory", updateCategory);
  app.delete("/api/admin/category/:category", deleteCategory);
  app.get("/api/admin/debug-photos", debugPhotoData);

  // Admin sync routes
  app.get("/api/admin/stats", getDatabaseStats);

  // Fix business data
  app.post("/api/admin/fix-business-data", fixBusinessEmailsAndWebsites);

  // Company request routes
  app.post("/api/admin/add-company-request", addCompanyRequest);
  app.get("/api/admin/company-requests", getCompanyRequests);
  app.put("/api/admin/company-request/:id", updateCompanyRequestStatus);

  // Photo sync routes
  app.post("/api/admin/download-photos", downloadAllPhotos);
  app.post("/api/admin/stop-download", stopPhotoDownload);
  app.get("/api/admin/download-status", getDownloadStatus);
  app.post("/api/admin/sync-reviews", syncAllReviews);
  app.get("/api/admin/sync-status", checkSyncStatus);

  // Data persistence routes - Save all data to database and GitHub
  app.post("/api/admin/save-all-data", saveAllBusinessData);
  app.post("/api/admin/save-images/:businessId", saveBusinessImagesToGitHub);
  app.get("/api/admin/persistence-status", getDataPersistenceStatus);
  app.get("/api/admin/export-data", exportAllData);

  // GitHub data fetching routes - Restore data from GitHub
  app.post("/api/admin/fetch-from-github", fetchAllDataFromGitHub);
  app.get("/api/admin/github-status", getGitHubStatus);
  app.get("/api/admin/fetch-business/:businessId", fetchBusinessFromGitHub);

  // Logo download routes - Separate logo management
  app.post("/api/admin/download-logos", downloadLogos);
  app.get("/api/admin/logo-progress", getLogoDownloadProgress);
  app.post("/api/admin/stop-logo-download", stopLogoDownload);
  app.get("/api/admin/logo-stats", getLogoStats);

  // API Control routes - Manage Google Places API costs
  app.get("/api/admin/api-status", getApiStatus);
  app.post("/api/admin/api-enable", enableApi);
  app.post("/api/admin/api-disable", disableApi);
  app.post("/api/admin/api-reset-counters", resetCounters);
  app.get("/api/admin/api-cost-report", getCostReport);

  // Simplified routes for space constraints
  app.post("/api/admin/add-business-manually", addBusinessManually);

  // Serve cached images from database
  app.get("/api/cached-logo/:businessId", serveCachedLogo);
  app.get("/api/cached-photo/:businessId/:photoIndex", serveCachedPhoto);
  app.get("/api/placeholder-logo/:businessName", generatePlaceholderLogo);

  // Reports API
  app.post(
    "/api/reports/submit",
    upload.fields([
      { name: "paymentReceipt", maxCount: 1 },
      { name: "agreementCopy", maxCount: 1 },
    ]),
    submitReport,
  );
  app.get("/api/reports/company/:companyId", getCompanyReports);
  app.get("/api/reports/all", getAllReports);
  app.put("/api/reports/:reportId/status", updateReportStatus);

  // Temporarily disabled due to space constraints
  // app.post("/api/admin/download-optimized-photos", downloadOptimizedPhotos);
  // app.post("/api/admin/stop-optimized-download", stopOptimizedDownload);
  // app.get(
  //   "/api/admin/optimized-download-progress",
  //   getOptimizedDownloadProgress,
  // );

  // Real Google reviews API (cache-first, no fake reviews)
  app.get("/api/business-reviews/:businessId", getBusinessReviews);

  // Google Reviews sync routes
  app.post("/api/admin/sync-google-reviews", syncAllGoogleReviews);
  app.post("/api/admin/sync-business-reviews/:businessId", syncBusinessReviews);
  app.get("/api/admin/review-sync-stats", getReviewSyncStats);

  // S3 Management routes
  app.get("/api/admin/s3-status", getS3Status);
  app.post("/api/admin/s3-upload-image", uploadBusinessImageToS3);
  app.post("/api/admin/s3-batch-upload", batchUploadBusinessImages);
  app.post("/api/admin/s3-sync-all", syncBusinessesToS3);
  app.post("/api/admin/s3-sync-business/:businessId", syncSingleBusinessToS3);
  app.delete("/api/admin/s3-object/:key", deleteS3Object);
  app.get("/api/admin/s3-list-objects", listS3Objects);

  // Ultra-Fast S3 Sync routes
  app.post("/api/admin/fast-s3-sync", startFastS3Sync);
  app.get("/api/admin/fast-s3-progress", getFastSyncProgress);
  app.post("/api/admin/fast-s3-stop", stopFastS3Sync);
  app.get("/api/admin/fast-s3-results", getFastSyncResults);
  app.get("/api/admin/fast-s3-stats", getSyncStats);
  app.get("/api/admin/fast-s3-progress-stream", syncProgressSSE);

  // Smart S3 Sync routes (handles errors better)
  app.post("/api/admin/smart-s3-sync", smartS3Sync);
  app.get("/api/admin/smart-sync-stats", getSmartSyncStats);

  // Real-time Smart S3 Sync routes
  app.post("/api/admin/realtime-smart-sync", startRealtimeSmartSync);
  app.get("/api/admin/realtime-smart-progress", getRealtimeSmartSyncProgress);
  app.get("/api/admin/realtime-smart-sync-stream", realtimeSmartSyncSSE);

  // Ultra-Fast S3 Sync routes (Maximum Performance)
  app.post("/api/admin/ultra-fast-s3-sync", startUltraFastS3Sync);
  app.get("/api/admin/ultra-fast-progress", getUltraFastProgress);
  app.get("/api/admin/ultra-fast-sync-stream", ultraFastSyncSSE);
  app.post("/api/admin/ultra-fast-stop", stopUltraFastSync);

  // Debug routes for image analysis
  app.get("/api/admin/debug-images", debugBusinessImages);
  app.get("/api/admin/test-image-fetch", testSingleImageFetch);

  // Company reports and complaints API
  app.post("/api/reports/check-company", checkCompanyExists);
  app.post("/api/reports/submit-company", submitNewCompany);
  app.post("/api/reports/submit", submitReport);
  app.get("/api/reports/company/:companyId", getCompanyReports);
  app.post("/api/reports/:reportId/vote", voteOnReport);
  app.get("/api/reports/stats", getReportsStats);

  // Database status endpoint
  app.get("/api/database-status", async (_req, res) => {
    try {
      const result = await database.get(
        "SELECT COUNT(*) as count FROM businesses",
      );
      res.json({
        status: "optimized",
        businessCount: result.count,
        message: "Database running with optimizations",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
      });
    }
  });

  // Simplified endpoints - complex API control removed for stability

  // Let Vite handle all development assets and modules
  // Only intercept non-API, non-asset routes for SPA fallback
  app.get(
    /^(?!\/api|\/client|\/node_modules|\/@|\/assets|\..*$).*/,
    (_req, res) => {
      res.sendFile("index.html", { root: "." });
    },
  );

  return app;
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT || 8080;
  const app = createServer();

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
}
