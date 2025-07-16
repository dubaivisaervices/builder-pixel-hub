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
    return realBusinessData;
  }

  try {
    // Try to load the business data from the copied file
    const dataPath = path.join(__dirname, "client", "data", "businesses.json");
    logDebug(`Attempting to load business data from: ${dataPath}`);

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const parsed = JSON.parse(rawData);

    if (parsed && parsed.businesses && Array.isArray(parsed.businesses)) {
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
          logDebug(`🔧 Fixed logoUrl domain for business: ${business.name}`);
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
        `✅ Successfully loaded ${realBusinessData.length} real businesses`,
      );
      return realBusinessData;
    } else {
      logDebug("❌ Invalid business data structure");
      return null;
    }
  } catch (error) {
    logDebug(`❌ Failed to load business data: ${error.message}`);
    return null;
  }
}

// Comprehensive fallback data (50+ businesses)
function getExtendedFallbackData() {
  const fallbackBusinesses = [];

  // Add sample businesses with realistic Dubai visa service data
  const sampleNames = [
    "Dubai Visa Express",
    "Emirates Immigration Hub",
    "Al Barsha PRO Services",
    "Business Bay Visa Center",
    "DIFC Immigration Consultants",
    "Jumeirah Visa Solutions",
    "Deira Document Clearing",
    "Marina Visa Services",
    "Downtown Dubai Immigration",
    "Al Karama Visa Center",
    "Bur Dubai PRO Services",
    "Al Garhoud Immigration",
    "Dubai Mall Visa Center",
    "Ibn Battuta Visa Hub",
    "City Walk Immigration",
    "Dubai Festival City Visa",
    "Al Rigga PRO Services",
    "Satwa Immigration Center",
    "Al Wasl Visa Solutions",
    "Oud Metha Document Services",
    "Al Qusais Visa Center",
    "Dubai Silicon Oasis Immigration",
    "Al Warqa Visa Services",
    "Mirdif PRO Center",
    "Al Mizhar Immigration Hub",
    "Dubai Investment Park Visa",
    "Al Sufouh PRO Services",
    "Knowledge Village Immigration",
    "Academic City Visa Center",
    "Healthcare City PRO",
    "Dubai Sports City Immigration",
    "Motor City Visa Hub",
    "Arabian Ranches PRO",
    "Dubai Hills Visa Center",
    "Dubai Creek Immigration",
    "Al Seef PRO Services",
    "Dubai Design District Visa",
    "La Mer Immigration Center",
    "City Centre Visa Hub",
    "Mall of Emirates PRO",
    "Ibn Battuta Immigration",
    "Global Village Visa Center",
    "Dubai Outlet Mall PRO",
    "Al Ghurair City Immigration",
    "Wafi Mall Visa Services",
    "BurJuman Centre PRO",
    "Dubai Festival Centre Immigration",
    "Times Square Visa Hub",
    "Al Wahda Mall PRO Services",
    "Dubai Land Immigration",
    "International City Visa",
  ];

  sampleNames.forEach((name, index) => {
    fallbackBusinesses.push({
      id: `fallback-${index + 1}`,
      name: name,
      address: `Office ${index + 100}, Dubai, UAE`,
      category:
        index % 4 === 0
          ? "visa services"
          : index % 4 === 1
            ? "immigration services"
            : index % 4 === 2
              ? "pro services"
              : "document clearing",
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 300) + 50,
      businessStatus: "OPERATIONAL",
      phone: `04 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://${name.toLowerCase().replace(/\s+/g, "")}.ae`,
      logoUrl: "https://reportvisascam.com/placeholder-logo.jpg",
      hasTargetKeyword: Math.random() > 0.3,
      latitude: 25.2048 + (Math.random() - 0.5) * 0.2,
      longitude: 55.2708 + (Math.random() - 0.5) * 0.2,
    });
  });

  return fallbackBusinesses;
}

// Get business data with prioritized loading
function getBusinessData() {
  // Try real data first
  const realData = loadRealBusinessData();
  if (realData && realData.length > 0) {
    logDebug(`✅ Using real business data: ${realData.length} businesses`);
    return realData;
  }

  // Fall back to extended sample data
  const fallbackData = getExtendedFallbackData();
  logDebug(`⚠️ Using fallback data: ${fallbackData.length} businesses`);
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
      version: "no-google-api-v1",
    });
  });

  // Main business endpoint - NO Google API
  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    logDebug("Business endpoint called", { query: req.query });

    try {
      const allBusinesses = getBusinessData();

      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const paginatedBusinesses = allBusinesses.slice(offset, offset + limit);

      // Categories
      const categories = [
        ...new Set(allBusinesses.map((b: any) => b.category).filter(Boolean)),
      ];

      const response = {
        businesses: paginatedBusinesses,
        total: allBusinesses.length,
        categories: categories,
        message: `Loaded ${paginatedBusinesses.length} of ${allBusinesses.length} Dubai visa services (NO Google API)`,
        source: realBusinessData ? "real_business_data" : "fallback_data",
        pagination: {
          page: page,
          limit: limit,
          total: allBusinesses.length,
          totalPages: Math.ceil(allBusinesses.length / limit),
          hasMore: offset + limit < allBusinesses.length,
        },
        success: true,
        timestamp: new Date().toISOString(),
      };

      logDebug("Returning business data", {
        count: paginatedBusinesses.length,
        total: allBusinesses.length,
        source: response.source,
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
      },
      googleAPIRemoved: true,
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
