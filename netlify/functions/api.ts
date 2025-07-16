import serverless from "serverless-http";

// Database-free server for Netlify
function createSimpleServer() {
  const express = require("express");
  const app = express();

  // CORS middleware
  app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json());

  // Health check
  app.get("/api/ping", (req: any, res: any) => {
    res.json({
      message: "API is working! (Netlify static version)",
      timestamp: new Date().toISOString(),
      environment: "netlify-functions",
      database: "none (static data)",
    });
  });

  app.get("/api/health", (req: any, res: any) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "netlify-static-v1",
    });
  });

  // Business data - sample static data
  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    const sampleBusinesses = [
      {
        id: "netlify-1",
        name: "Dubai Visa Services Pro",
        address: "Business Bay, Dubai, UAE",
        category: "visa services",
        rating: 4.5,
        reviewCount: 150,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
      },
      {
        id: "netlify-2",
        name: "Emirates Immigration Consultants",
        address: "DIFC, Dubai, UAE",
        category: "immigration services",
        rating: 4.3,
        reviewCount: 89,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
      },
      {
        id: "netlify-3",
        name: "Al Barsha Document Clearing",
        address: "Al Barsha, Dubai, UAE",
        category: "document clearing",
        rating: 4.1,
        reviewCount: 67,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
      },
      {
        id: "netlify-4",
        name: "Jumeirah Visa Center",
        address: "Jumeirah, Dubai, UAE",
        category: "visa services",
        rating: 4.0,
        reviewCount: 45,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
      },
      {
        id: "netlify-5",
        name: "Dubai Immigration Hub",
        address: "Downtown Dubai, UAE",
        category: "immigration services",
        rating: 4.2,
        reviewCount: 78,
        businessStatus: "OPERATIONAL",
        logoUrl: "/placeholder.svg",
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
      message: `Loaded ${sampleBusinesses.length} Dubai visa service providers (Netlify static data)`,
      source: "netlify_static",
      pagination: {
        page: 1,
        limit: 50,
        total: sampleBusinesses.length,
        totalPages: 1,
        hasMore: false,
      },
      success: true,
    };

    console.log("✅ Serving static business data via Netlify Functions");
    res.json(response);
  });

  // Alternative endpoint
  app.get("/api/businesses", (req: any, res: any) => {
    app._router.handle(
      Object.assign(req, { url: "/api/dubai-visa-services" }),
      res,
    );
  });

  // Catch-all
  app.use((req: any, res: any) => {
    res.status(404).json({
      error: "Endpoint not found",
      available: [
        "/api/ping",
        "/api/health",
        "/api/dubai-visa-services",
        "/api/businesses",
      ],
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

// Try to import the main server, but fallback to simple version
let app: any;

try {
  // Try to create the main server
  const { createNetlifyServer } = require("../../server/netlify-server");
  app = createNetlifyServer();
  console.log("✅ Using database-free Netlify server");
} catch (error) {
  console.warn("⚠️ Main server failed, using simple fallback:", error.message);
  app = createSimpleServer();
  console.log("✅ Using simple fallback server");
}

// Configure for serverless environment
const handler = serverless(app, {
  binary: ["image/*", "application/pdf", "application/octet-stream"],
});

export { handler };
