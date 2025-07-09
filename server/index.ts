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
import {
  getDatabaseStats,
  syncInternalDatabase,
  syncGoogleApi,
  clearDatabase,
} from "./routes/admin-sync";
import {
  downloadAllPhotos,
  stopPhotoDownload,
  getDownloadStatus,
  syncAllReviews,
  checkSyncStatus,
  optimizeDatabase,
} from "./routes/photo-sync";
import {
  getBusinessPhotos,
  refreshBusinessPhotos,
  getPhotoStatusBatch,
} from "./routes/business-photos";
import {
  getApiStatus,
  enableApi,
  disableApi,
  resetCounters,
  getCostReport,
  testApiConnection,
} from "./routes/api-control";
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
import { getBusinessReviews } from "./routes/business-reviews-real";
import {
  syncAllGoogleReviews,
  syncBusinessReviews,
  getReviewSyncStats,
} from "./routes/sync-google-reviews";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Google Business API routes
  app.get("/api/test-google-api", testGoogleAPI);
  app.get("/api/businesses", searchDubaiVisaServices); // Simpler route for businesses
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
  app.post("/api/admin/sync-database", syncInternalDatabase);
  app.post("/api/admin/sync-google", syncGoogleApi);
  app.post("/api/admin/clear-database", clearDatabase);

  // Photo and review sync routes
  app.post("/api/admin/download-photos", downloadAllPhotos);
  app.post("/api/admin/stop-download", stopPhotoDownload);
  app.get("/api/admin/download-status", getDownloadStatus);
  app.post("/api/admin/sync-reviews", syncAllReviews);
  app.get("/api/admin/sync-status", checkSyncStatus);
  app.post("/api/admin/optimize-database", optimizeDatabase);

  // Enhanced business photos API with fallback protection
  app.get("/api/business-photos/:businessId", getBusinessPhotos);
  app.post("/api/business-photos/:businessId/refresh", refreshBusinessPhotos);
  app.post("/api/business-photos/status-batch", getPhotoStatusBatch);

  // Google API Connection Control
  app.get("/api/admin/api-status", getApiStatus);
  app.post("/api/admin/api-enable", enableApi);
  app.post("/api/admin/api-disable", disableApi);
  app.post("/api/admin/api-reset-counters", resetCounters);
  app.get("/api/admin/api-cost-report", getCostReport);
  app.post("/api/admin/api-test-connection", testApiConnection);

  // Fix business data
  app.post("/api/admin/fix-business-data", fixBusinessEmailsAndWebsites);

  // Company addition requests
  app.post("/api/admin/add-company-request", addCompanyRequest);
  app.get("/api/admin/company-requests", getCompanyRequests);
  app.put("/api/admin/company-requests/:requestId", updateCompanyRequestStatus);

  // Data persistence routes - Save all data to database and GitHub
  app.post("/api/admin/save-all-data", saveAllBusinessData);
  app.post("/api/admin/save-images/:businessId", saveBusinessImagesToGitHub);
  app.get("/api/admin/persistence-status", getDataPersistenceStatus);
  app.get("/api/admin/export-data", exportAllData);

  // Business reviews routes - Get and sync real Google reviews
  app.get("/api/business-reviews/:businessId", getBusinessReviews);
  app.post("/api/admin/sync-all-reviews", syncAllGoogleReviews);
  app.post("/api/admin/sync-business-reviews/:businessId", syncBusinessReviews);
  app.get("/api/admin/review-sync-stats", getReviewSyncStats);

  return app;
}
