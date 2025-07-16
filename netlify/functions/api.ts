import serverless from "serverless-http";

// Enhanced debugging function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] NETLIFY DEBUG: ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

// Database-free server for Netlify with comprehensive debugging
function createDebugServer() {
  const express = require("express");
  const app = express();

  logDebug("Creating debug server for Netlify Functions");

  // Enhanced CORS middleware with debugging
  app.use((req: any, res: any, next: any) => {
    logDebug(`Incoming request: ${req.method} ${req.url}`, {
      headers: req.headers,
      query: req.query,
      origin: req.headers.origin,
    });

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

  // Enhanced health check with debugging info
  app.get("/api/ping", (req: any, res: any) => {
    logDebug("Ping endpoint called");
    const response = {
      message: "API is working! (Netlify debug version)",
      timestamp: new Date().toISOString(),
      environment: "netlify-functions",
      database: "none (static data)",
      debug: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        query: req.query,
        functionName: "api",
        runtime: "nodejs",
      },
    };

    logDebug("Ping response", response);
    res.json(response);
  });

  app.get("/api/health", (req: any, res: any) => {
    logDebug("Health endpoint called");
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "netlify-debug-v2",
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "production",
    };

    logDebug("Health response", healthData);
    res.json(healthData);
  });

  // Enhanced business data endpoint with comprehensive sample data
  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    logDebug("Business data endpoint called", { query: req.query });

    const sampleBusinesses = [
      {
        id: "debug-1",
        name: "Dubai Visa Services Pro - Debug Version",
        address: "Business Bay, Dubai, UAE",
        category: "visa services",
        rating: 4.5,
        reviewCount: 150,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
        phone: "+971-4-123-4567",
        website: "https://example.com",
        latitude: 25.1976,
        longitude: 55.2744,
      },
      {
        id: "debug-2",
        name: "Emirates Immigration Consultants - Working",
        address: "DIFC, Dubai, UAE",
        category: "immigration services",
        rating: 4.3,
        reviewCount: 89,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
        phone: "+971-4-234-5678",
        website: "https://example2.com",
        latitude: 25.2134,
        longitude: 55.2824,
      },
      {
        id: "debug-3",
        name: "Al Barsha Document Clearing - Active",
        address: "Al Barsha, Dubai, UAE",
        category: "document clearing",
        rating: 4.1,
        reviewCount: 67,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
        phone: "+971-4-345-6789",
        website: "https://example3.com",
        latitude: 25.1136,
        longitude: 55.1902,
      },
      {
        id: "debug-4",
        name: "Jumeirah Visa Center - Verified",
        address: "Jumeirah, Dubai, UAE",
        category: "visa services",
        rating: 4.0,
        reviewCount: 45,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
        phone: "+971-4-456-7890",
        website: "https://example4.com",
        latitude: 25.2048,
        longitude: 55.2708,
      },
      {
        id: "debug-5",
        name: "Dubai Immigration Hub - Trusted",
        address: "Downtown Dubai, UAE",
        category: "immigration services",
        rating: 4.2,
        reviewCount: 78,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
        phone: "+971-4-567-8901",
        website: "https://example5.com",
        latitude: 25.1972,
        longitude: 55.2744,
      },
    ];

    const response = {
      businesses: sampleBusinesses,
      total: sampleBusinesses.length,
      categories: [
        "visa services",
        "immigration services",
        "document clearing",
      ],
      processingTime: 0.05,
      message: `Loaded ${sampleBusinesses.length} Dubai visa service providers (Netlify debug data)`,
      source: "netlify_debug",
      pagination: {
        page: 1,
        limit: 50,
        total: sampleBusinesses.length,
        totalPages: 1,
        hasMore: false,
      },
      success: true,
      debug: {
        timestamp: new Date().toISOString(),
        requestInfo: {
          method: req.method,
          url: req.url,
          query: req.query,
          headers: Object.keys(req.headers),
        },
      },
    };

    logDebug("Business data response", {
      businessCount: sampleBusinesses.length,
      categories: response.categories,
    });
    res.json(response);
  });

  // Alternative business endpoint
  app.get("/api/businesses", (req: any, res: any) => {
    logDebug(
      "Alternative business endpoint called, redirecting to main endpoint",
    );
    // Manually call the main endpoint
    req.url = "/api/dubai-visa-services";
    app._router.handle(req, res);
  });

  // Debug endpoint to show all available routes
  app.get("/api/debug", (req: any, res: any) => {
    const debugInfo = {
      availableEndpoints: [
        "GET /api/ping",
        "GET /api/health",
        "GET /api/dubai-visa-services",
        "GET /api/businesses",
        "GET /api/debug",
      ],
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
      debug: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });

  logDebug("Debug server created successfully");
  return app;
}

// Create the app
let app: any;

try {
  logDebug("Initializing Netlify Function");
  app = createDebugServer();
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
