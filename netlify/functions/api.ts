import serverless from "serverless-http";
import { readFileSync } from "fs";
import { join } from "path";

// Enhanced debugging function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] NETLIFY DEBUG: ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

// Load real business data from JSON file
function loadRealBusinessData() {
  try {
    // Try multiple possible paths for the business data
    const possiblePaths = [
      join(process.cwd(), "client/data/businesses.json"),
      join(__dirname, "../../client/data/businesses.json"),
      "./client/data/businesses.json",
      "../client/data/businesses.json",
      "../../client/data/businesses.json",
    ];

    for (const path of possiblePaths) {
      try {
        logDebug(`Trying to load business data from: ${path}`);
        const fileContent = readFileSync(path, "utf-8");
        const businessData = JSON.parse(fileContent);

        if (
          businessData &&
          businessData.businesses &&
          Array.isArray(businessData.businesses)
        ) {
          logDebug(
            `✅ Successfully loaded ${businessData.businesses.length} businesses from: ${path}`,
          );
          return businessData.businesses;
        }
      } catch (err) {
        logDebug(`❌ Failed to load from: ${path} - ${err.message}`);
      }
    }

    // If all paths fail, return null
    logDebug("❌ Could not load business data from any path");
    return null;
  } catch (error) {
    logDebug("❌ Error in loadRealBusinessData:", error.message);
    return null;
  }
}

// Fallback sample data (only used if real data fails to load)
function getFallbackSampleData() {
  return [
    {
      id: "fallback-1",
      name: "Dubai Visa Services Pro",
      address: "Business Bay, Dubai, UAE",
      category: "visa services",
      rating: 4.5,
      reviewCount: 150,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
    {
      id: "fallback-2",
      name: "Emirates Immigration Consultants",
      address: "DIFC, Dubai, UAE",
      category: "immigration services",
      rating: 4.3,
      reviewCount: 89,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
    {
      id: "fallback-3",
      name: "Al Barsha Document Clearing",
      address: "Al Barsha, Dubai, UAE",
      category: "document clearing",
      rating: 4.1,
      reviewCount: 67,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
  ];
}

// Cache for loaded business data
let cachedBusinessData: any[] | null = null;

function getBusinessData() {
  if (cachedBusinessData) {
    return cachedBusinessData;
  }

  // Try to load real business data
  const realData = loadRealBusinessData();

  if (realData && realData.length > 0) {
    cachedBusinessData = realData;
    logDebug(`✅ Using real business data: ${realData.length} businesses`);
    return cachedBusinessData;
  }

  // Fallback to sample data
  const fallbackData = getFallbackSampleData();
  logDebug(`⚠️ Using fallback sample data: ${fallbackData.length} businesses`);
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
