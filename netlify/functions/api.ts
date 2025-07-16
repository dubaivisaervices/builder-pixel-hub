import serverless from "serverless-http";

// Enhanced debugging function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] NETLIFY DEBUG: ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

// Direct business data embedding - we'll load this from our JSON file
const fs = require("fs");
const path = require("path");

let realBusinessData: any[] | null = null;

function loadRealBusinessData() {
  if (realBusinessData) {
    logDebug(
      `♻️ Using cached business data: ${realBusinessData.length} businesses`,
    );
    return realBusinessData;
  }

  // Try multiple approaches to load the business data
  const possiblePaths = [
    path.join(__dirname, "client", "data", "businesses.json"),
    path.join(__dirname, "./client/data/businesses.json"),
    path.join(__dirname, "../client/data/businesses.json"),
    path.join(__dirname, "../../client/data/businesses.json"),
    "./client/data/businesses.json",
    "../client/data/businesses.json",
    "../../client/data/businesses.json",
  ];

  logDebug(
    `🔍 Attempting to load business data from ${possiblePaths.length} possible paths...`,
  );
  logDebug(`📁 Current working directory: ${process.cwd()}`);
  logDebug(`📁 __dirname: ${__dirname}`);

  // Try each path
  for (let i = 0; i < possiblePaths.length; i++) {
    const dataPath = possiblePaths[i];
    try {
      logDebug(`🔄 Trying path ${i + 1}/${possiblePaths.length}: ${dataPath}`);

      // Check if file exists
      if (fs.existsSync(dataPath)) {
        logDebug(`✅ File exists at: ${dataPath}`);

        const rawData = fs.readFileSync(dataPath, "utf-8");
        logDebug(`📊 Raw data size: ${rawData.length} characters`);

        const parsed = JSON.parse(rawData);
        logDebug(
          `🔍 Parsed data structure: ${typeof parsed}, has businesses: ${!!parsed.businesses}`,
        );

        if (parsed && parsed.businesses && Array.isArray(parsed.businesses)) {
          logDebug(`📈 Found ${parsed.businesses.length} businesses in data`);

          // Fix any domain issues in the business data
          const correctedBusinesses = parsed.businesses.map((business: any) => {
            if (
              business.logoUrl &&
              business.logoUrl.includes("crossbordersmigrations.com")
            ) {
              business.logoUrl = business.logoUrl.replace(
                "crossbordersmigrations.com",
                "reportvisascam.com",
              );
              logDebug(
                `🔧 Fixed logoUrl domain for business: ${business.name}`,
              );
            }

            if (business.photos && Array.isArray(business.photos)) {
              business.photos = business.photos.map((photo: string) => {
                if (photo.includes("crossbordersmigrations.com")) {
                  return photo.replace(
                    "crossbordersmigrations.com",
                    "reportvisascam.com",
                  );
                }
                return photo;
              });
            }

            return business;
          });

          realBusinessData = correctedBusinesses;
          logDebug(
            `✅ SUCCESS: Loaded ${realBusinessData.length} real businesses from: ${dataPath}`,
          );
          return realBusinessData;
        } else {
          logDebug(`❌ Invalid data structure at: ${dataPath}`);
        }
      } else {
        logDebug(`❌ File not found at: ${dataPath}`);
      }
    } catch (error) {
      logDebug(`❌ Error loading from ${dataPath}: ${error.message}`);
    }
  }

  logDebug("❌ FAILED to load business data from any path - will use fallback");
  return null;
}

// Simple fallback data (only if real data completely fails)
function getSimpleFallbackData() {
  return [
    {
      id: "fallback-1",
      name: "Dubai Visa Services Center",
      address: "Business Bay, Dubai, UAE",
      category: "visa services",
      rating: 4.5,
      reviewCount: 150,
      businessStatus: "OPERATIONAL",
      phone: "04 123 4567",
      website: "https://example.ae",
    },
    {
      id: "fallback-2",
      name: "Emirates Immigration Hub",
      address: "DIFC, Dubai, UAE",
      category: "immigration services",
      rating: 4.3,
      reviewCount: 89,
      businessStatus: "OPERATIONAL",
      phone: "04 987 6543",
      website: "https://example2.ae",
    },
    {
      id: "fallback-3",
      name: "Document Clearing Services",
      address: "Deira, Dubai, UAE",
      category: "document clearing",
      rating: 4.1,
      reviewCount: 67,
      businessStatus: "OPERATIONAL",
      phone: "04 555 0123",
      website: "https://example3.ae",
    },
  ];
}

// Get business data with prioritized loading
function getBusinessData() {
  // Try real data first
  const realData = loadRealBusinessData();
  if (realData && realData.length > 0) {
    logDebug(`✅ Using real business data: ${realData.length} businesses`);
    return realData;
  }

  // Fall back to simple sample data
  const fallbackData = getSimpleFallbackData();
  logDebug(`⚠️ Using fallback data: ${fallbackData.length} businesses`);
  logDebug("🚨 CRITICAL: Real business data loading failed - check logs above");
  return fallbackData;
}

// Create Express server without Google API dependencies
function createBusinessServer() {
  const express = require("express");
  const app = express();

  logDebug("Creating business server (NO Google API dependencies)");

  // CORS and cache-busting middleware
  app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept",
    );
    res.header("Access-Control-Max-Age", "86400");

    // Add cache-busting headers for API responses
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json());

  // Health check
  app.get("/api/ping", (req: any, res: any) => {
    const businessCount = getBusinessData().length;
    res.json({
      message: "API is working! (Direct business data - NO Google API)",
      timestamp: new Date().toISOString(),
      businessCount: businessCount,
      source: "direct_data_loading",
    });
  });

  app.get("/api/health", (req: any, res: any) => {
    const businessData = getBusinessData();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      businessCount: businessData.length,
      dataSource: realBusinessData ? "real_json_data" : "fallback_data",
      version: "enhanced-loading-v1",
    });
  });

  // Main business endpoint - NO Google API
  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    logDebug("Business endpoint called", { query: req.query });

    try {
      const allBusinesses = getBusinessData();
      logDebug(`📊 Serving ${allBusinesses.length} businesses`);

      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const paginatedBusinesses = allBusinesses.slice(offset, offset + limit);

      // Categories
      const categories = [
        ...new Set(allBusinesses.map((b: any) => b.category).filter(Boolean)),
      ];

      const dataSource = realBusinessData
        ? "real_business_data"
        : "fallback_data";

      const response = {
        businesses: paginatedBusinesses,
        total: allBusinesses.length,
        categories: categories,
        message: `Loaded ${paginatedBusinesses.length} of ${allBusinesses.length} Dubai visa services (Enhanced Loading)`,
        source: dataSource,
        pagination: {
          page: page,
          limit: limit,
          total: allBusinesses.length,
          totalPages: Math.ceil(allBusinesses.length / limit),
          hasMore: offset + limit < allBusinesses.length,
        },
        success: true,
        timestamp: new Date().toISOString(),
        debug: {
          loadingAttempted: true,
          realDataAvailable: !!realBusinessData,
          fallbackUsed: !realBusinessData,
        },
      };

      logDebug("Business response prepared", {
        count: paginatedBusinesses.length,
        total: allBusinesses.length,
        source: dataSource,
      });

      res.json(response);
    } catch (error) {
      logDebug("Error in business endpoint:", error.message);
      res.status(500).json({
        error: "Failed to load business data",
        message: error.message,
        businesses: [],
        total: 0,
        success: false,
      });
    }
  });

  // Alternative endpoint
  app.get("/api/businesses", (req: any, res: any) => {
    // Redirect to main endpoint
    req.url = "/api/dubai-visa-services";
    app._router.handle(req, res);
  });

  // Debug endpoint
  app.get("/api/debug", (req: any, res: any) => {
    const businessData = getBusinessData();
    res.json({
      availableEndpoints: [
        "GET /api/ping",
        "GET /api/health",
        "GET /api/dubai-visa-services",
        "GET /api/businesses",
        "GET /api/debug",
      ],
      businessDataStatus: {
        count: businessData.length,
        source: realBusinessData ? "real_data" : "fallback_data",
        sampleBusiness: businessData[0] || null,
        realDataCached: !!realBusinessData,
      },
      loadingInfo: {
        attemptedPaths: 7,
        currentWorkingDir: process.cwd(),
        functionDir: __dirname,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req: any, res: any) => {
    res.status(404).json({
      error: "Endpoint not found",
      available: [
        "/api/ping",
        "/api/health",
        "/api/dubai-visa-services",
        "/api/businesses",
        "/api/debug",
      ],
    });
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    logDebug("Server error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  });

  return app;
}

// Create and export the serverless handler
const app = createBusinessServer();
const handler = serverless(app);

export { handler };
