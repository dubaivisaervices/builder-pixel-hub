import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { database } from "./database/database";
import { handleDemo } from "./routes/demo";
import {
  searchDubaiVisaServices,
  getBusinessDetails,
  getBusinessPhoto,
  getBusinessById,
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
  addBusiness,
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
  uploadBusinessImages,
  handleBusinessImageUpload,
  handleUploadError,
} from "./routes/upload-business-images";
import {
  fetchBusinessesWithImages,
  getSearchCategories,
  checkGoogleApiStatus,
} from "./routes/enhanced-google-fetcher";
import { importBusinesses } from "./routes/import-businesses";
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
  getBusinessImages,
  serveOptimizedImage,
  getImageStats,
} from "./routes/unified-image-service";
import {
  uploadLogoToNetlify,
  uploadPhotosToNetlify,
  downloadImageToNetlify,
  batchDownloadToNetlify,
  getNetlifyImageStats,
} from "./routes/netlify-image-upload";
import {
  superFastNetlifyUpload,
  getNetlifyUploadProgress,
  stopNetlifyUpload,
  getNetlifyUploadResults,
  clearNetlifyUploadData,
} from "./routes/super-fast-netlify-upload";
import {
  debugBusinessData,
  testBusinessUrls,
} from "./routes/debug-business-data";
import { getSampleBusinessData } from "./routes/sample-business-data";
import { verifyPhotos, getBusinessPhotos } from "./routes/photo-verification";
import {
  refreshAllBusinessImages,
  getImageRefreshProgress,
  stopImageRefresh,
  getImageRefreshResults,
} from "./routes/google-image-refresh";
import { testGoogleAPI } from "./routes/test-google-api";
import { autoFetchDubaiVisa } from "./routes/auto-fetch-dubai-visa";
import { testSimpleSearch } from "./routes/test-simple-search";
import { debugVisaSearch } from "./routes/debug-visa-search";
import { fetchVisaCategories } from "./routes/fetch-visa-categories";
import { testVisaDirect } from "./routes/test-visa-direct";
import { simpleVisaFetch } from "./routes/simple-visa-fetch";
import { checkVisaBusinesses } from "./routes/check-visa-businesses";
import { checkDbSchema } from "./routes/check-db-schema";
import { fetchKeywordBusinesses } from "./routes/fetch-keyword-businesses";
import { keywordBusinessesReport } from "./routes/keyword-businesses-report";
import { fetchConsultants } from "./routes/fetch-consultants";
import { searchCompanyNames } from "./routes/search-company-names";
import { searchCompaniesSimple } from "./routes/search-companies-simple";
import { fetchSpecificCompanies } from "./routes/fetch-specific-companies";
import { debugDatabaseSave } from "./routes/debug-database-save";
import { testGoogleBusinessSave } from "./routes/test-google-business-save";
import { saveBusinessCorrectly } from "./routes/save-business-correctly";
import { fetchCompaniesWorking } from "./routes/fetch-companies-working";
import { fetchCategoriesPermanent } from "./routes/fetch-categories-permanent";
import { fetchCategoriesFixed } from "./routes/fetch-categories-fixed";
import {
  netlifyBusinessesAPI,
  netlifyStatsAPI,
  netlifyCategoriesAPI,
  netlifyFeaturedAPI,
} from "./routes/netlify-api";
import {
  testSupabaseConnection,
  getSupabaseBusinesses,
  startSupabaseSync,
  getSupabaseSyncStatus,
  stopSupabaseSync,
  testAllConnections,
  getSupabaseCategories,
  getSupabaseSyncResults,
} from "./routes/supabase-sync";
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
import { robustBusinessesAPI, pingAPI } from "./routes/netlify-api-fallback";

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
  app.use(
    cors({
      origin: true, // Allow all origins in serverless environment
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Ensure all API routes return JSON content-type
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
  });

  // Health check endpoints
  app.get("/api/ping", pingAPI);
  app.get("/api/health", pingAPI);

  app.get("/api/demo", handleDemo);

  // Primary business API routes with fallback
  app.get("/api/businesses", async (req, res) => {
    try {
      await searchDubaiVisaServices(req, res);
    } catch (error) {
      console.log("��� Database API failed, using fallback...");
      await robustBusinessesAPI(req, res);
    }
  });

  app.get("/api/dubai-visa-services", async (req, res) => {
    try {
      await searchDubaiVisaServices(req, res);
    } catch (error) {
      console.log("❌ Database API failed, using fallback...");
      await robustBusinessesAPI(req, res);
    }
  });

  // Robust fallback endpoint
  app.get("/api/businesses-static", robustBusinessesAPI);

  // Google API routes removed - using direct business data instead

  // Business photos endpoint
  app.get("/api/business-photos/:businessId", async (req, res) => {
    try {
      const { businessId } = req.params;
      console.log(`📸 Fetching photos for business: ${businessId}`);

      // Import required services
      const { S3Service } = await import("./utils/s3Service");
      const s3Service = new S3Service();
      const { businessService } = await import("./database/businessService");

      // Get business data including S3 URLs
      const business = await businessService.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({
          success: false,
          error: "Business not found",
          photos: [],
        });
      }

      console.log(`📸 Business found: ${business.name}`);
      console.log(`📸 S3 URLs available:`, business.photosS3Urls?.length || 0);
      console.log(`📸 Regular photos:`, business.photos?.length || 0);

      let photos = [];

      // Helper function to check if URL is from corrupted batch
      const isCorruptedUrl = (url: string): boolean => {
        const timestampMatch = url.match(/\/(\d{13})-/);
        if (timestampMatch) {
          const timestamp = parseInt(timestampMatch[1]);
          // Block corrupted batch uploads from timestamp range 1752379060000-1752379100000
          if (timestamp >= 1752379060000 && timestamp <= 1752379100000) {
            console.warn(
              "🚫 SERVER: BLOCKED CORRUPTED S3 URL from bad batch:",
              url,
            );
            return true;
          }
        }
        return false;
      };

      // 1. Process S3 URLs first (highest quality)
      if (business.photosS3Urls && business.photosS3Urls.length > 0) {
        console.log(`📸 Processing ${business.photosS3Urls.length} S3 URLs`);

        // Filter out corrupted URLs first
        const validS3Urls = business.photosS3Urls.filter((url) => {
          const s3Key = url.replace(/^https?:\/\/[^\/]+\//, "");
          return !isCorruptedUrl(s3Key);
        });

        if (validS3Urls.length < business.photosS3Urls.length) {
          console.warn(
            `📸 🚫 SERVER: Filtered out ${business.photosS3Urls.length - validS3Urls.length} corrupted S3 URLs`,
          );
        }

        for (let i = 0; i < validS3Urls.length; i++) {
          const s3Url = validS3Urls[i];
          try {
            // Extract S3 key from URL
            const s3Key = s3Url.replace(/^https?:\/\/[^\/]+\//, "");

            // Check if S3 object exists and get metadata
            const exists = await s3Service.objectExists(s3Key);
            if (exists) {
              photos.push({
                id: `s3-${i}`,
                url: `/api/s3-image/${encodeURIComponent(s3Key)}`,
                s3Url: s3Url,
                s3Key: s3Key,
                width: 800,
                height: 600,
                caption: `Business Photo ${i + 1}`,
                source: "s3",
                uploadedAt: new Date().toISOString(),
              });
              console.log(`📸 ✅ S3 photo ${i + 1} validated:`, s3Key);
            } else {
              console.log(`📸 ❌ S3 photo ${i + 1} not found:`, s3Key);
            }
          } catch (error) {
            console.error(`📸 Error validating S3 photo ${i + 1}:`, error);
          }
        }
      }

      // 2. Process regular photos array as fallback
      if (business.photos && business.photos.length > 0) {
        console.log(`📸 Processing ${business.photos.length} regular photos`);

        // Filter out corrupted URLs from regular photos
        const validPhotos = business.photos.filter((photo) => {
          if (photo.url && isCorruptedUrl(photo.url)) {
            console.warn(
              "🚫 SERVER: BLOCKED CORRUPTED photo URL from bad batch:",
              photo.url,
            );
            return false;
          }
          if (photo.s3Url && isCorruptedUrl(photo.s3Url)) {
            console.warn(
              "🚫 SERVER: BLOCKED CORRUPTED photo S3 URL from bad batch:",
              photo.s3Url,
            );
            return false;
          }
          return true;
        });

        if (validPhotos.length < business.photos.length) {
          console.warn(
            `📸 🚫 SERVER: Filtered out ${business.photos.length - validPhotos.length} corrupted regular photos`,
          );
        }

        for (let i = 0; i < validPhotos.length; i++) {
          const photo = validPhotos[i];

          // Skip if we already have S3 photos
          if (photos.length > 0 && photo.source !== "s3") {
            continue;
          }

          photos.push({
            id: photo.id || `photo-${i}`,
            url: photo.url || photo.s3Url,
            s3Url: photo.s3Url,
            base64: photo.base64,
            width: photo.width || 800,
            height: photo.height || 600,
            caption: photo.caption || `Business Photo ${photos.length + 1}`,
            source: photo.source || "api",
            needsDownload: photo.needsDownload,
            uploadedAt: new Date().toISOString(),
          });
        }
      }

      // 3. If no photos found, return empty array (frontend will use defaults)
      if (photos.length === 0) {
        console.log(`📸 No photos found for business ${businessId}`);
      }

      console.log(`📸 Returning ${photos.length} photos for ${business.name}`);

      res.json({
        success: true,
        businessId: businessId,
        businessName: business.name,
        photos: photos,
        totalCount: photos.length,
        s3Count: photos.filter((p) => p.source === "s3").length,
        metadata: {
          hasS3Photos:
            business.photosS3Urls && business.photosS3Urls.length > 0,
          hasRegularPhotos: business.photos && business.photos.length > 0,
          fetchedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("��� Error fetching business photos:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch business photos",
        photos: [],
      });
    }
  });
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
  app.post("/api/admin/add-business", addBusiness);
  app.post(
    "/api/admin/upload-business-images",
    uploadBusinessImages,
    handleBusinessImageUpload,
    handleUploadError,
  );
  app.put("/api/admin/business/:id", updateBusiness);
  app.delete("/api/admin/business/:id", deleteBusiness);
  app.get("/api/admin/categories", getAllCategories);
  app.put("/api/admin/category/:oldCategory", updateCategory);
  app.delete("/api/admin/category/:category", deleteCategory);
  app.get("/api/admin/debug-photos", debugPhotoData);

  // Enhanced Google Business Fetcher
  app.post("/api/admin/fetch-google-businesses", fetchBusinessesWithImages);
  app.get("/api/admin/google-search-categories", getSearchCategories);
  app.get("/api/admin/google-api-status", checkGoogleApiStatus);
  app.post("/api/admin/import-businesses", importBusinesses);
  app.get("/api/admin/auto-fetch-dubai-visa", autoFetchDubaiVisa);
  app.get("/api/admin/test-simple-search", testSimpleSearch);
  app.get("/api/admin/debug-visa-search", debugVisaSearch);
  app.get("/api/admin/fetch-visa-categories", fetchVisaCategories);
  app.get("/api/admin/test-visa-direct", testVisaDirect);
  app.get("/api/admin/simple-visa-fetch", simpleVisaFetch);
  app.get("/api/admin/check-visa-businesses", checkVisaBusinesses);
  app.get("/api/admin/check-db-schema", checkDbSchema);
  app.get("/api/admin/fetch-keyword-businesses", fetchKeywordBusinesses);
  app.get("/api/admin/keyword-businesses-report", keywordBusinessesReport);
  app.get("/api/admin/fetch-consultants", fetchConsultants);
  app.get("/api/admin/search-company-names", searchCompanyNames);
  app.get("/api/admin/search-companies-simple", searchCompaniesSimple);
  app.get("/api/admin/fetch-specific-companies", fetchSpecificCompanies);
  app.get("/api/admin/debug-database-save", debugDatabaseSave);
  app.get("/api/admin/test-google-business-save", testGoogleBusinessSave);
  app.get("/api/admin/save-business-correctly", saveBusinessCorrectly);
  app.get("/api/admin/fetch-companies-working", fetchCompaniesWorking);
  app.get("/api/admin/fetch-categories-permanent", fetchCategoriesPermanent);

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

  // Unified image service routes
  app.get("/api/business-images/:businessId", getBusinessImages);
  app.get("/api/optimized-image/:businessId", serveOptimizedImage);
  app.get("/api/image-stats", getImageStats);

  // Netlify direct image upload routes
  app.post("/api/netlify/upload-logo", uploadLogoToNetlify);
  app.post("/api/netlify/upload-photos", uploadPhotosToNetlify);
  app.post("/api/netlify/download-image", downloadImageToNetlify);
  app.post("/api/netlify/batch-download", batchDownloadToNetlify);
  app.get("/api/netlify/image-stats", getNetlifyImageStats);

  // Super Fast Netlify Upload System
  app.post("/api/netlify/super-fast-upload", superFastNetlifyUpload);
  app.get("/api/netlify/upload-progress", getNetlifyUploadProgress);
  app.post("/api/netlify/stop-upload", stopNetlifyUpload);
  app.get("/api/netlify/upload-results", getNetlifyUploadResults);
  app.post("/api/netlify/clear-data", clearNetlifyUploadData);

  // Debug business data quality
  app.get("/api/debug/business-data", debugBusinessData);
  app.get("/api/debug/test-urls/:businessId", testBusinessUrls);
  app.get("/api/debug/sample-data", getSampleBusinessData);
  app.get("/api/debug/verify-photos", verifyPhotos);
  app.get("/api/debug/business-photos/:businessId", getBusinessPhotos);

  // Google API Image Refresh System
  app.get("/api/google/test", testGoogleAPI);
  app.post("/api/google/refresh-all-images", refreshAllBusinessImages);
  app.get("/api/google/refresh-progress", getImageRefreshProgress);
  app.post("/api/google/stop-refresh", stopImageRefresh);
  app.get("/api/google/refresh-results", getImageRefreshResults);

  // Netlify-compatible static API routes
  app.get("/api/businesses-netlify", netlifyBusinessesAPI);
  app.get("/api/stats-netlify", netlifyStatsAPI);
  app.get("/api/categories-netlify", netlifyCategoriesAPI);
  app.get("/api/featured-netlify", netlifyFeaturedAPI);

  // Supabase integration routes
  app.get("/api/supabase/test", testSupabaseConnection);
  app.get("/api/supabase/businesses", getSupabaseBusinesses);
  app.post("/api/supabase/sync/start", startSupabaseSync);
  app.get("/api/supabase/sync/status", getSupabaseSyncStatus);
  app.post("/api/supabase/sync/stop", stopSupabaseSync);
  app.get("/api/supabase/sync/results", getSupabaseSyncResults);
  app.get("/api/supabase/test-all", testAllConnections);
  app.get("/api/supabase/categories", getSupabaseCategories);

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

  // S3 image upload endpoints
  app.post(
    "/api/upload-business-image",
    upload.single("file"),
    async (req, res) => {
      try {
        const { businessId, type } = req.body;
        const file = req.file;

        if (!file || !businessId || !type) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const s3Url = await uploadBusinessImageToS3(file, businessId, type);
        res.json({ s3Url });
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Upload failed" });
      }
    },
  );

  app.patch("/api/businesses/:businessId/update-images", async (req, res) => {
    try {
      const { businessId } = req.params;
      const { type, urls } = req.body;

      const { BusinessService } = await import("./database/businessService");
      const businessService = new BusinessService(database);

      if (type === "logo") {
        await businessService.updateBusinessLogo(businessId, urls[0]);
      } else {
        await businessService.updateBusinessPhotos(businessId, urls);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/admin/business-list", async (req, res) => {
    try {
      const { BusinessService } = await import("./database/businessService");
      const businessService = new BusinessService(database);

      const businesses = await database.all(
        "SELECT id, name, category, rating FROM businesses ORDER BY rating DESC LIMIT 50",
      );

      res.json(businesses);
    } catch (error) {
      console.error("Error fetching business list:", error);
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  // Hostinger upload routes
  app.post("/api/admin/upload-all-to-hostinger", async (req, res) => {
    const { uploadAllImagesToHostinger } = await import(
      "./routes/hostinger-upload"
    );
    return uploadAllImagesToHostinger(req, res);
  });
  app.post(
    "/api/admin/upload-business-to-hostinger/:businessId",
    async (req, res) => {
      const { uploadBusinessToHostinger } = await import(
        "./routes/hostinger-upload"
      );
      return uploadBusinessToHostinger(req, res);
    },
  );
  app.get("/api/admin/test-hostinger", async (req, res) => {
    const { testHostingerConnection } = await import(
      "./routes/hostinger-upload"
    );
    return testHostingerConnection(req, res);
  });

  // NEW: Google Places to Hostinger routes
  app.post("/api/admin/upload-all-google-to-hostinger", async (req, res) => {
    const { uploadAllGoogleImagesToHostinger } = await import(
      "./routes/hostinger-upload"
    );
    return uploadAllGoogleImagesToHostinger(req, res);
  });

  // IMPROVED: Google Places with better authentication to Hostinger
  app.post(
    "/api/admin/upload-all-improved-google-to-hostinger",
    async (req, res) => {
      const { uploadAllImprovedGoogleImagesToHostinger } = await import(
        "./routes/hostinger-upload"
      );
      return uploadAllImprovedGoogleImagesToHostinger(req, res);
    },
  );

  // HYBRID: Google API + Smart Fallback (ALWAYS WORKS)
  app.post("/api/admin/upload-all-hybrid-to-hostinger", async (req, res) => {
    const { uploadAllHybridImagesToHostinger } = await import(
      "./routes/hostinger-upload"
    );
    return uploadAllHybridImagesToHostinger(req, res);
  });

  // REAL GOOGLE PHOTOS: Upload real business photos using complete Google Places API workflow
  app.post(
    "/api/admin/upload-all-real-google-to-hostinger",
    async (req, res) => {
      const { uploadAllRealGooglePhotosToHostinger } = await import(
        "./routes/hostinger-upload"
      );
      return uploadAllRealGooglePhotosToHostinger(req, res);
    },
  );

  // BATCH 50: Upload businesses in batches of 50 using Real Google Places photos
  app.post(
    "/api/admin/upload-batch-50-real-google-to-hostinger",
    async (req, res) => {
      const { uploadBatch50RealGooglePhotos } = await import(
        "./routes/hostinger-upload"
      );
      return uploadBatch50RealGooglePhotos(req, res);
    },
  );

  // PROGRESS: Server-Sent Events for real-time progress tracking
  app.get("/api/admin/progress-stream", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    const { progressTracker } = require("./services/progressTracker");

    console.log("📡 SSE: New client connected");

    // Send initial connection confirmation
    res.write(
      `data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`,
    );

    // Send current progress if available
    const currentProgress = progressTracker.getCurrentProgress();
    if (currentProgress) {
      console.log("📤 SSE: Sending current progress:", currentProgress);
      res.write(`data: ${JSON.stringify(currentProgress)}\n\n`);
    }

    // Subscribe to progress updates
    const unsubscribe = progressTracker.subscribe((update) => {
      try {
        console.log("📤 SSE: Broadcasting update:", update);
        res.write(`data: ${JSON.stringify(update)}\n\n`);
      } catch (writeError) {
        console.error("❌ SSE: Write error:", writeError);
      }
    });

    // Handle client disconnect
    req.on("close", () => {
      unsubscribe();
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(": keepalive\n\n");
    }, 30000);

    req.on("close", () => {
      clearInterval(keepAlive);
      unsubscribe();
    });
  });

  // TEST: Test progress tracking system
  app.post("/api/admin/test-progress", async (req, res) => {
    const { testProgressTracking } = await import("./routes/test-progress");
    return testProgressTracking(req, res);
  });

  // SUPER FAST: Parallel batch processing for maximum speed
  app.post("/api/admin/super-fast-batch-upload", async (req, res) => {
    const { superFastBatchUpload } = await import("./routes/super-fast-upload");
    return superFastBatchUpload(req, res);
  });

  // AUTO PROCESS ALL: Automatically process all businesses
  app.post("/api/admin/auto-process-all", async (req, res) => {
    const { autoProcessAll } = await import("./routes/super-fast-upload");
    return autoProcessAll(req, res);
  });

  // DEBUG: Debug progress tracking status
  app.get("/api/admin/debug-progress-status", async (req, res) => {
    const { debugProgressStatus } = await import("./routes/debug-progress");
    return debugProgressStatus(req, res);
  });

  // DEBUG: Trigger test progress sequence
  app.post("/api/admin/trigger-test-progress", async (req, res) => {
    const { triggerTestProgress } = await import("./routes/debug-progress");
    return triggerTestProgress(req, res);
  });

  // FULL PROCESSING: Upload ALL remaining businesses
  app.post(
    "/api/admin/upload-all-remaining-hybrid-to-hostinger",
    async (req, res) => {
      const { uploadAllRemainingHybridImagesToHostinger } = await import(
        "./routes/hostinger-upload"
      );
      return uploadAllRemainingHybridImagesToHostinger(req, res);
    },
  );
  app.post(
    "/api/admin/upload-business-google-to-hostinger/:businessId",
    async (req, res) => {
      const { uploadBusinessGoogleToHostinger } = await import(
        "./routes/hostinger-upload"
      );
      return uploadBusinessGoogleToHostinger(req, res);
    },
  );

  // WORKING: Base64 to Hostinger routes (your suggested approach)
  app.post("/api/admin/upload-all-base64-to-hostinger", async (req, res) => {
    const { uploadAllBase64ToHostinger } = await import(
      "./routes/hostinger-upload"
    );
    return uploadAllBase64ToHostinger(req, res);
  });

  // FAILING: Google Photos proxy to Hostinger routes
  app.post(
    "/api/admin/upload-all-google-photos-to-hostinger",
    async (req, res) => {
      const { uploadAllGooglePhotosToHostinger } = await import(
        "./routes/hostinger-upload"
      );
      return uploadAllGooglePhotosToHostinger(req, res);
    },
  );

  // WORKING: Cached images to Hostinger routes (but no cached data available)
  app.post("/api/admin/upload-all-cached-to-hostinger", async (req, res) => {
    const { uploadAllCachedImagesToHostinger } = await import(
      "./routes/hostinger-upload"
    );
    return uploadAllCachedImagesToHostinger(req, res);
  });

  // Inspect cached image data
  app.get("/api/admin/inspect-cached-data", async (req, res) => {
    const { inspectCachedImageData } = await import(
      "./routes/inspect-cached-data"
    );
    return inspectCachedImageData(req, res);
  });

  // Admin authentication endpoints
  app.post("/api/admin/login", async (req, res) => {
    const { directAdminLogin } = await import("./routes/admin-auth");
    return directAdminLogin(req, res);
  });
  app.get("/api/admin/status", async (req, res) => {
    const { getAdminStatus } = await import("./routes/admin-auth");
    return getAdminStatus(req, res);
  });

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
  app.get("/api/admin/analyze-image-types", analyzeImageTypes);

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

  // Debug S3 URL status
  app.get("/api/admin/debug-s3-status", async (req, res) => {
    try {
      const result = await database.get(`
        SELECT
          COUNT(*) as total,
          COUNT(logo_s3_url) as with_logo_s3,
          COUNT(photos_s3_urls) as with_photos_s3
        FROM businesses
      `);

      const sample = await database.all(`
        SELECT id, name, logo_url, logo_s3_url, photos_s3_urls
        FROM businesses
        WHERE logo_url IS NOT NULL
        LIMIT 10
      `);

      res.json({
        success: true,
        stats: result,
        sample: sample,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Simple S3 URL test
  app.get("/api/admin/test-s3-url/:id", async (req, res) => {
    try {
      const businessId = req.params.id;

      const result = await database.get(
        "SELECT id, name, logo_s3_url IS NOT NULL as has_s3_url, LENGTH(logo_s3_url) as s3_url_length FROM businesses WHERE id = ?",
        [businessId],
      );

      res.json({
        success: true,
        result: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Test business mapping with S3 URLs
  app.get("/api/admin/test-mapping/:id", async (req, res) => {
    try {
      const businessId = req.params.id;
      const { businessService } = await import("./database/businessService");

      const business = await businessService.getBusinessById(businessId);

      res.json({
        success: true,
        business: {
          id: business?.id,
          name: business?.name,
          logoUrl: business?.logoUrl,
          logoS3Url: business?.logoS3Url,
          hasLogoS3Url: !!business?.logoS3Url,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // S3 Image Proxy - serve S3 images through server to bypass CORS/permissions
  app.get("/api/s3-image/:key(*)", async (req, res) => {
    try {
      const key = req.params.key;
      console.log(`S3 proxy request for: ${key}`);

      const { S3Service } = await import("./utils/s3Service");
      const s3Service = new S3Service();

      // Check if object exists first
      const exists = await s3Service.objectExists(key);
      if (!exists) {
        console.log(`S3 object not found: ${key}`);
        return res.status(404).json({ error: "Image not found" });
      }

      // Get image data directly from S3 and stream it
      const imageBuffer = await s3Service.downloadBuffer(key);

      // Validate image buffer
      if (!imageBuffer || imageBuffer.length < 500) {
        console.error(
          `S3 image corrupted or too small: ${key}, size: ${imageBuffer?.length || 0}`,
        );
        return res.status(404).json({ error: "Image corrupted or invalid" });
      }

      // Check for basic JPEG signature
      const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
      const hasEndMarker =
        imageBuffer[imageBuffer.length - 2] === 0xff &&
        imageBuffer[imageBuffer.length - 1] === 0xd9;

      if (!isJPEG || !hasEndMarker) {
        console.error(
          `S3 image not a valid JPEG: ${key}, hasStart: ${isJPEG}, hasEnd: ${hasEndMarker}`,
        );
        return res.status(404).json({ error: "Invalid image format" });
      }

      // Check for corruption (null byte sequences that indicate partial downloads)
      let nullByteSequences = 0;
      for (let i = 0; i < imageBuffer.length - 10; i++) {
        let allNull = true;
        for (let j = 0; j < 10; j++) {
          if (imageBuffer[i + j] !== 0x00) {
            allNull = false;
            break;
          }
        }
        if (allNull) {
          nullByteSequences++;
          break; // Found corruption, no need to continue
        }
      }

      if (nullByteSequences > 0) {
        console.error(
          `S3 image corrupted with null sequences: ${key}, sequences: ${nullByteSequences}`,
        );

        // Try to clear the corrupted S3 URL from database
        try {
          const businessId = key.split("/")[1]; // Extract business ID from path
          if (businessId) {
            const { businessService } = await import(
              "./database/businessService"
            );
            await businessService.updateBusinessS3Urls(businessId, null); // Clear S3 URL
            console.log(`Cleared corrupted S3 URL for business: ${businessId}`);
          }
        } catch (error) {
          console.error("Failed to clear corrupted S3 URL:", error);
        }

        return res
          .status(404)
          .json({ error: "Image corrupted, S3 URL cleared" });
      }

      // Set appropriate headers
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Content-Length", imageBuffer.length.toString());

      console.log(
        `S3 proxy serving: ${key}, size: ${imageBuffer.length} bytes`,
      );

      // Send the image buffer
      res.send(imageBuffer);
    } catch (error: any) {
      console.error("S3 image proxy error:", error);
      res.status(404).json({
        error: "Image not found",
        message: error.message,
      });
    }
  });

  // Check actual S3 URL format in database
  app.get("/api/admin/check-s3-urls", async (req, res) => {
    try {
      const sampleUrls = await database.all(`
        SELECT id, name, logo_s3_url
        FROM businesses
        WHERE logo_s3_url IS NOT NULL
        LIMIT 3
      `);

      res.json({
        success: true,
        sampleUrls: sampleUrls,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Test S3 connectivity and check if specific objects exist
  app.get("/api/admin/test-s3-objects", async (req, res) => {
    try {
      const { S3Service } = await import("./utils/s3Service");
      const s3Service = new S3Service();

      // Extract original S3 keys from proxy URLs in database
      const businesses = await database.all(`
        SELECT id, name, logo_s3_url
        FROM businesses
        WHERE logo_s3_url IS NOT NULL
        LIMIT 5
      `);

      const tests = [];
      for (const business of businesses) {
        // Extract S3 key from proxy URL
        const proxyUrl = business.logo_s3_url;
        const s3Key = proxyUrl.replace(
          "http://localhost:8080/api/s3-image/",
          "",
        );

        try {
          const exists = await s3Service.objectExists(s3Key);
          tests.push({
            businessId: business.id,
            businessName: business.name,
            s3Key: s3Key,
            exists: exists,
          });
        } catch (error: any) {
          tests.push({
            businessId: business.id,
            businessName: business.name,
            s3Key: s3Key,
            exists: false,
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        tests: tests,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Convert existing S3 URLs to proxy format
  app.post("/api/admin/convert-s3-urls", async (req, res) => {
    try {
      const baseUrl = process.env.BASE_URL || "http://localhost:8080";
      const bucketName = "dubai-business-images";
      const region = "ap-south-1";

      // Count matching URLs first
      const countResult = await database.get(`
        SELECT COUNT(*) as count
        FROM businesses
        WHERE logo_s3_url IS NOT NULL AND logo_s3_url LIKE 'https://${bucketName}.s3.${region}.amazonaws.com/%'
      `);

      // Update logo S3 URLs
      const logoUpdate = await database.run(`
        UPDATE businesses
        SET logo_s3_url = REPLACE(logo_s3_url, 'https://${bucketName}.s3.${region}.amazonaws.com/', '${baseUrl}/api/s3-image/')
        WHERE logo_s3_url IS NOT NULL AND logo_s3_url LIKE 'https://${bucketName}.s3.${region}.amazonaws.com/%'
      `);

      res.json({
        success: true,
        message: "S3 URLs converted to proxy format",
        matchingUrls: countResult.count,
        logoUrlsUpdated: logoUpdate.changes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Restore original Google Maps URLs by clearing S3 URLs
  app.post("/api/admin/restore-original-urls", async (req, res) => {
    try {
      // Clear the S3 URLs so the mapping will use original logoUrl field
      const logoUpdate = await database.run(`
        UPDATE businesses
        SET logo_s3_url = NULL
        WHERE logo_s3_url IS NOT NULL
      `);

      res.json({
        success: true,
        message:
          "S3 URLs cleared, businesses will now use original Google Maps URLs",
        logoUrlsCleared: logoUpdate.changes,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Get S3 image metadata for debugging
  app.get("/api/admin/s3-image-info/:key(*)", async (req, res) => {
    try {
      const key = req.params.key;
      const { S3Service } = await import("./utils/s3Service");
      const s3Service = new S3Service();

      const exists = await s3Service.objectExists(key);
      if (!exists) {
        return res.json({ exists: false });
      }

      const imageBuffer = await s3Service.downloadBuffer(key);
      const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
      const hasEndMarker =
        imageBuffer[imageBuffer.length - 2] === 0xff &&
        imageBuffer[imageBuffer.length - 1] === 0xd9;

      // Check for critical JPEG segments
      let hasSOI = false; // Start of Image
      let hasEOI = false; // End of Image
      let hasAPP0 = false; // JFIF marker
      let corruptionIssues = [];

      if (imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) hasSOI = true;
      if (
        imageBuffer[imageBuffer.length - 2] === 0xff &&
        imageBuffer[imageBuffer.length - 1] === 0xd9
      )
        hasEOI = true;

      // Look for JFIF marker (FF E0)
      for (let i = 0; i < Math.min(imageBuffer.length - 1, 20); i++) {
        if (imageBuffer[i] === 0xff && imageBuffer[i + 1] === 0xe0) {
          hasAPP0 = true;
          break;
        }
      }

      // Check for common corruption patterns
      if (!hasSOI) corruptionIssues.push("Missing SOI marker");
      if (!hasEOI) corruptionIssues.push("Missing EOI marker");
      if (!hasAPP0) corruptionIssues.push("Missing JFIF APP0 segment");
      if (imageBuffer.length < 500)
        corruptionIssues.push("File too small for valid JPEG");

      // Check for repeated null bytes (corruption indicator)
      let nullByteSequences = 0;
      for (let i = 0; i < imageBuffer.length - 10; i++) {
        let allNull = true;
        for (let j = 0; j < 10; j++) {
          if (imageBuffer[i + j] !== 0x00) {
            allNull = false;
            break;
          }
        }
        if (allNull) nullByteSequences++;
      }
      if (nullByteSequences > 0)
        corruptionIssues.push(`Found ${nullByteSequences} null byte sequences`);

      res.json({
        exists: true,
        size: imageBuffer.length,
        isValidJPEG: isJPEG,
        hasSOI,
        hasEOI,
        hasAPP0,
        corruptionIssues,
        isHealthy: corruptionIssues.length === 0,
        firstBytes: Array.from(imageBuffer.slice(0, 20))
          .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
          .join(" "),
        lastBytes: Array.from(imageBuffer.slice(-20))
          .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
          .join(" "),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Emergency: Clear ALL logo data for specific business
  app.post("/api/admin/reset-business-logos/:businessId", async (req, res) => {
    try {
      const { businessId } = req.params;
      const { database } = await import("./database/database");

      // Forcefully clear ALL logo-related fields
      await database.run(
        `
        UPDATE businesses
        SET logo_s3_url = NULL,
            logo_base64 = NULL,
            photos_s3_urls = NULL
        WHERE id = ?
      `,
        [businessId],
      );

      res.json({
        success: true,
        message: `Emergency reset: Cleared ALL logo data for business: ${businessId}`,
        businessId,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clear S3 URL for specific business
  app.post("/api/admin/clear-s3-url/:businessId", async (req, res) => {
    try {
      const { businessId } = req.params;
      const { businessService } = await import("./database/businessService");

      await businessService.updateBusinessS3Urls(businessId, null);

      res.json({
        success: true,
        message: `Cleared S3 URL for business: ${businessId}`,
        businessId,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clean up corrupted S3 URLs by testing all S3 images
  app.post("/api/admin/cleanup-corrupted-s3", async (req, res) => {
    try {
      const { businessService } = await import("./database/businessService");
      const { S3Service } = await import("./utils/s3Service");
      const s3Service = new S3Service();

      // Get all businesses with S3 URLs
      const businesses = await businessService.getBusinessesNeedingS3Upload();
      const results = [];
      let clearedCount = 0;

      for (const business of businesses) {
        if (!business.logoS3Url) continue;

        try {
          // Extract S3 key from URL
          const urlMatch = business.logoS3Url.match(/\/api\/s3-image\/(.+)$/);
          if (!urlMatch) continue;

          const key = urlMatch[1];

          // Check if S3 object exists and is healthy
          const exists = await s3Service.objectExists(key);
          if (!exists) {
            await businessService.updateBusinessS3Urls(business.id, null);
            results.push({
              businessId: business.id,
              issue: "S3 object not found",
              cleared: true,
            });
            clearedCount++;
            continue;
          }

          // Download and validate image
          const imageBuffer = await s3Service.downloadBuffer(key);

          // Check for corruption
          let corruptionFound = false;
          if (imageBuffer.length < 500) corruptionFound = true;

          const isJPEG = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;
          const hasEndMarker =
            imageBuffer[imageBuffer.length - 2] === 0xff &&
            imageBuffer[imageBuffer.length - 1] === 0xd9;
          if (!isJPEG || !hasEndMarker) corruptionFound = true;

          // Check for null byte sequences
          for (let i = 0; i < imageBuffer.length - 10; i++) {
            let allNull = true;
            for (let j = 0; j < 10; j++) {
              if (imageBuffer[i + j] !== 0x00) {
                allNull = false;
                break;
              }
            }
            if (allNull) {
              corruptionFound = true;
              break;
            }
          }

          if (corruptionFound) {
            await businessService.updateBusinessS3Urls(business.id, null);
            results.push({
              businessId: business.id,
              issue: "Corrupted image data",
              cleared: true,
            });
            clearedCount++;
          } else {
            results.push({
              businessId: business.id,
              issue: "none",
              cleared: false,
            });
          }
        } catch (error) {
          await businessService.updateBusinessS3Urls(business.id, null);
          results.push({
            businessId: business.id,
            issue: error.message,
            cleared: true,
          });
          clearedCount++;
        }
      }

      res.json({
        success: true,
        message: `Cleanup completed. Cleared ${clearedCount} corrupted S3 URLs.`,
        clearedCount,
        totalChecked: results.length,
        results: results.slice(0, 10), // Show first 10 results
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test S3 connectivity and configuration
  app.get("/api/admin/test-s3-connection", async (req, res) => {
    try {
      const { getS3Service } = await import("./utils/s3Service");
      const s3Service = getS3Service();

      // Test basic S3 operations
      const testResults = {
        awsConfig: {
          bucketName: process.env.AWS_S3_BUCKET_NAME,
          region: process.env.AWS_REGION,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) + "...",
        },
        tests: [],
      };

      // Test 1: List objects
      try {
        const objects = await s3Service.listObjects("businesses/", 1);
        testResults.tests.push({
          name: "List Objects",
          status: "success",
          result: `Found ${objects.length} objects`,
        });
      } catch (error) {
        testResults.tests.push({
          name: "List Objects",
          status: "failed",
          error: error.message,
        });
      }

      // Test 2: Try different regions to find the correct one
      const testRegions = [
        "us-east-1",
        "ap-south-1",
        "me-south-1",
        "eu-west-1",
        "us-west-2",
      ];
      for (const region of testRegions) {
        try {
          const { S3Client, ListObjectsV2Command } = await import(
            "@aws-sdk/client-s3"
          );
          const testClient = new S3Client({
            region: region,
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            },
          });

          const command = new ListObjectsV2Command({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            MaxKeys: 1,
          });

          await testClient.send(command);
          testResults.tests.push({
            name: `Region Test: ${region}`,
            status: "success",
            result: "✅ Bucket accessible from this region",
          });
          break; // Found working region
        } catch (error) {
          testResults.tests.push({
            name: `Region Test: ${region}`,
            status: "failed",
            error: error.message.substring(0, 100) + "...",
          });
        }
      }

      res.json({
        success: true,
        ...testResults,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Debug specific business S3 URLs
  app.get("/api/admin/debug-business/:id", async (req, res) => {
    try {
      const businessId = req.params.id;

      // Get raw database row
      const rawBusiness = await database.get(
        "SELECT * FROM businesses WHERE id = ?",
        [businessId],
      );

      if (!rawBusiness) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Get business via service (mapped)
      const { businessService } = await import("./database/businessService");
      const mappedBusiness = await businessService.getBusinessById(businessId);

      res.json({
        success: true,
        raw: {
          id: rawBusiness.id,
          name: rawBusiness.name,
          logo_url: rawBusiness.logo_url,
          logo_s3_url: rawBusiness.logo_s3_url,
          logo_base64: rawBusiness.logo_base64 ? "present" : "none",
          photos_json: rawBusiness.photos_json ? "present" : "none",
          photos_s3_urls: rawBusiness.photos_s3_urls,
        },
        mapped: {
          id: mappedBusiness?.id,
          name: mappedBusiness?.name,
          logoUrl: mappedBusiness?.logoUrl,
          logoS3Url: mappedBusiness?.logoS3Url,
          logoBase64: mappedBusiness?.logoBase64 ? "present" : "none",
          photosS3Urls: mappedBusiness?.photosS3Urls,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Database migration routes
  app.post("/api/admin/migrate/add-s3-columns", async (req, res) => {
    try {
      console.log("🔄 Adding S3 URL columns to businesses table...");

      // Add logo_s3_url column
      try {
        await database.run(
          "ALTER TABLE businesses ADD COLUMN logo_s3_url TEXT",
        );
        console.log("✅ Added logo_s3_url column");
      } catch (err: any) {
        if (err.message.includes("duplicate column name")) {
          console.log("ℹ️ logo_s3_url column already exists");
        } else {
          throw err;
        }
      }

      // Add photos_s3_urls column
      try {
        await database.run(
          "ALTER TABLE businesses ADD COLUMN photos_s3_urls TEXT",
        );
        console.log("��� Added photos_s3_urls column");
      } catch (err: any) {
        if (err.message.includes("duplicate column name")) {
          console.log("ℹ️ photos_s3_urls column already exists");
        } else {
          throw err;
        }
      }

      console.log("🎉 Database migration completed successfully!");

      res.json({
        success: true,
        message: "S3 URL columns added successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Database migration failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Simplified endpoints - complex API control removed for stability

  // DEBUG: Test Hostinger FTP connection and directory setup (disabled)
  // app.get("/api/admin/debug-hostinger", async (req, res) => {
  //   const { debugHostingerConnection } = await import(
  //     "./routes/debug-hostinger"
  //   );
  //   return debugHostingerConnection(req, res);
  // });

  // TEST: Test actual Hostinger upload service
  // app.get("/api/admin/test-upload", async (req, res) => {
  //   const { testHostingerUpload } = await import("./routes/test-upload");
  //   return testHostingerUpload(req, res);
  // });

  // Serve uploaded business images
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Serve Netlify business images from public directory
  app.use(
    "/business-images",
    express.static(path.join(process.cwd(), "public", "business-images")),
  );

  // Let Vite handle all development assets and modules
  // Only intercept non-API, non-asset routes for SPA fallback
  app.get(
    /^(?!\/api|\/client|\/node_modules|\/@|\/assets|\/uploads|\..*$).*/,
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
