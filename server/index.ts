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
  syncAllReviews,
  checkSyncStatus,
} from "./routes/photo-sync";
import { fixBusinessEmailsAndWebsites } from "./routes/fix-business-data";
import {
  addCompanyRequest,
  getCompanyRequests,
  updateCompanyRequestStatus,
} from "./routes/add-company-request";

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
  app.post("/api/admin/sync-reviews", syncAllReviews);
  app.get("/api/admin/sync-status", checkSyncStatus);

  // Fix business data
  app.post("/api/admin/fix-business-data", fixBusinessEmailsAndWebsites);

  // Company addition requests
  app.post("/api/admin/add-company-request", addCompanyRequest);
  app.get("/api/admin/company-requests", getCompanyRequests);
  app.put("/api/admin/company-requests/:requestId", updateCompanyRequestStatus);

  return app;
}
