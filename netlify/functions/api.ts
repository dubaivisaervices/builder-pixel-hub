import serverless from "serverless-http";
const {
  getBusinessData: loadBusinessDataFromModule,
} = require("./businessData.js");

// Enhanced debugging function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] NETLIFY DEBUG: ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

// Load real business data using direct import
function loadRealBusinessData() {
  try {
    logDebug("🔍 Loading business data from module...");
    const businesses = loadBusinessDataFromModule();

    if (businesses && Array.isArray(businesses) && businesses.length > 0) {
      logDebug(
        `✅ Successfully loaded ${businesses.length} businesses from module`,
      );
      return businesses;
    } else {
      logDebug("❌ No business data returned from module");
      return null;
    }
  } catch (error) {
    logDebug("❌ Error loading business data from module:", error.message);
    return null;
  }
}

// Extended fallback sample data (based on real data structure)
function getFallbackSampleData() {
  // Generate more sample data to simulate real response while we debug the loading
  const samples = [];
  for (let i = 1; i <= 50; i++) {
    samples.push({
      id: `fallback-${i}`,
      name: `Dubai Visa Service Provider ${i}`,
      address: `Office ${i}, Business District, Dubai, UAE`,
      category:
        i % 3 === 0
          ? "visa services"
          : i % 3 === 1
            ? "immigration services"
            : "document clearing",
      rating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      businessStatus: "OPERATIONAL",
      logoUrl: "https://reportvisascam.com/placeholder-logo.jpg",
      phone: `04 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://visa-service-${i}.ae`,
    });
  }
  return samples;
}

// Cache for loaded business data
let cachedBusinessData: any[] | null = null;

function getBusinessData() {
  if (cachedBusinessData) {
    logDebug(
      `♻️ Using cached business data: ${cachedBusinessData.length} businesses`,
    );
    return cachedBusinessData;
  }

  logDebug("🔄 Starting fresh business data load...");

  // Try to load real business data
  const realData = loadRealBusinessData();

  if (realData && realData.length > 0) {
    cachedBusinessData = realData;
    logDebug(
      `✅ SUCCESS: Using real business data: ${realData.length} businesses`,
    );
    logDebug(`✅ Sample business: ${realData[0]?.name || "No name"}`);
    return cachedBusinessData;
  }

  // Fallback to sample data
  const fallbackData = getFallbackSampleData();
  logDebug(`⚠️ FALLBACK: Using sample data: ${fallbackData.length} businesses`);
  logDebug(`⚠️ This means real data loading failed - check server logs`);
  return fallbackData;
}

// Database-free server for Netlify with real business data
function createBusinessServer() {
  const express = require("express");
  const app = express();

  logDebug("Creating business server for Netlify Functions");

  // Enhanced CORS middleware
  app.use((req: any, res: any, next: any) => {
    logDebug(`Incoming request: ${req.method} ${req.url}`);

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

    if (req.method === "OPTIONS") {
      logDebug("Handling OPTIONS preflight request");
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json());

  // Health check
  app.get("/api/ping", (req: any, res: any) => {
    logDebug("Ping endpoint called");
    const response = {
      message: "API is working! (Real business data version)",
      timestamp: new Date().toISOString(),
      environment: "netlify-functions",
      database: "static JSON file",
      businessCount: getBusinessData().length,
    };

    logDebug("Ping response", response);
    res.json(response);
  });

  app.get("/api/health", (req: any, res: any) => {
    logDebug("Health endpoint called");
    const businessData = getBusinessData();
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "real-business-data-v1",
      businessCount: businessData.length,
      dataSource: cachedBusinessData ? "real_data" : "fallback_data",
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };

    logDebug("Health response", healthData);
    res.json(healthData);
  });

  // Real business data endpoint
  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    logDebug("Business data endpoint called", { query: req.query });

    try {
      const allBusinesses = getBusinessData();

      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Apply pagination
      const paginatedBusinesses = allBusinesses.slice(offset, offset + limit);

      // Get unique categories
      const categories = [
        ...new Set(allBusinesses.map((b: any) => b.category).filter(Boolean)),
      ];

      const response = {
        businesses: paginatedBusinesses,
        total: allBusinesses.length,
        categories: categories,
        processingTime: 0.05,
        message: `Loaded ${paginatedBusinesses.length} of ${allBusinesses.length} Dubai visa service providers`,
        source: cachedBusinessData ? "real_business_data" : "fallback_data",
        pagination: {
          page: page,
          limit: limit,
          total: allBusinesses.length,
          totalPages: Math.ceil(allBusinesses.length / limit),
          hasMore: offset + limit < allBusinesses.length,
        },
        success: true,
        debug: {
          timestamp: new Date().toISOString(),
          requestInfo: {
            method: req.method,
            url: req.url,
            query: req.query,
          },
        },
      };

      logDebug("Business data response", {
        businessCount: paginatedBusinesses.length,
        totalBusinesses: allBusinesses.length,
        categories: categories.length,
        dataSource: response.source,
      });

      res.json(response);
    } catch (error) {
      logDebug("Error in business data endpoint:", error.message);

      // Return error response
      res.status(500).json({
        error: "Failed to load business data",
        message: error.message,
        timestamp: new Date().toISOString(),
        businesses: [],
        total: 0,
        success: false,
      });
    }
  });

  // Alternative business endpoint
  app.get("/api/businesses", (req: any, res: any) => {
    logDebug(
      "Alternative business endpoint called, redirecting to main endpoint",
    );
    req.url = "/api/dubai-visa-services";
    app._router.handle(req, res);
  });

  // Debug endpoint
  app.get("/api/debug", (req: any, res: any) => {
    const businessData = getBusinessData();
    const debugInfo = {
      availableEndpoints: [
        "GET /api/ping",
        "GET /api/health",
        "GET /api/dubai-visa-services",
        "GET /api/businesses",
        "GET /api/debug",
      ],
      businessDataStatus: {
        loaded: !!cachedBusinessData,
        count: businessData.length,
        source: cachedBusinessData ? "real_data" : "fallback_data",
        sampleBusiness: businessData[0] || null,
      },
      environment: process.env.NODE_ENV || "production",
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };

    logDebug("Debug info requested", debugInfo);
    res.json(debugInfo);
  });

  // Enhanced error handling
  app.use((req: any, res: any) => {
    logDebug(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
      error: "Endpoint not found",
      available: [
        "/api/ping",
        "/api/health",
        "/api/dubai-visa-services",
        "/api/businesses",
        "/api/debug",
      ],
      request: {
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    logDebug(`Server error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  });

  logDebug("Business server created successfully");
  return app;
}

// Create the app
let app: any;

try {
  logDebug("Initializing Netlify Function with real business data");
  app = createBusinessServer();
  logDebug("Server created successfully");
} catch (error) {
  logDebug("Failed to create server", { error: error.message });
  throw error;
}

// Configure for serverless environment
const handler = serverless(app, {
  binary: ["image/*", "application/pdf", "application/octet-stream"],
});

export { handler };
