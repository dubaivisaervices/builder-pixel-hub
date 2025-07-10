import express from "express";
import cors from "cors";
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
  checkCompanyExists,
  submitNewCompany,
  submitReport,
  getCompanyReports,
  voteOnReport,
  getReportsStats,
} from "./routes/company-reports";

export function createServer() {
  const app = express();

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
  app.get("/api/admin/check-old-keys", checkOldApiKeys);
  app.post("/api/admin/update-old-keys", updateOldApiKeys);
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

  // Company reports and complaints API
  app.post("/api/reports/check-company", checkCompanyExists);
  app.post("/api/reports/submit-company", submitNewCompany);
  app.post("/api/reports/submit", submitReport);
  app.get("/api/reports/company/:companyId", getCompanyReports);
  app.post("/api/reports/:reportId/vote", voteOnReport);
  app.get("/api/reports/stats", getReportsStats);

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
