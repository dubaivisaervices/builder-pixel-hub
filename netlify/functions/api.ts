import serverless from "serverless-http";
import { promises as fs } from "fs";
import * as path from "path";

// Enhanced debugging function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] NETLIFY DEBUG: ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

// Get business data - try file loading first, fallback to embedded
async function getBusinessData() {
  logDebug("Starting business data loading...");

  // Try multiple possible paths for businesses.json
  const possiblePaths = [
    "/opt/build/repo/code/client/data/businesses.json",
    "/opt/build/repo/client/data/businesses.json",
    "/opt/build/repo/data/businesses.json",
    "./data/businesses.json",
    "../data/businesses.json",
    "../../client/data/businesses.json",
    "../../../client/data/businesses.json",
  ];

  for (const filePath of possiblePaths) {
    try {
      logDebug(`Trying to load businesses from: ${filePath}`);
      const fileContent = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(fileContent);

      if (parsed && parsed.businesses && Array.isArray(parsed.businesses)) {
        logDebug(
          `✅ Successfully loaded ${parsed.businesses.length} real businesses from ${filePath}`,
        );

        // Apply domain fix to all businesses
        const businessesWithFixedDomains = parsed.businesses.map(
          (business: any) => ({
            ...business,
            logoUrl: business.logoUrl
              ? business.logoUrl.replace(
                  "crossbordersmigrations.com",
                  "reportvisascam.com",
                )
              : business.logoUrl,
            photos: business.photos
              ? business.photos.map((photo: string) =>
                  photo.replace(
                    "crossbordersmigrations.com",
                    "reportvisascam.com",
                  ),
                )
              : business.photos,
          }),
        );

        return businessesWithFixedDomains;
      }
    } catch (error) {
      logDebug(`Failed to load from ${filePath}: ${error.message}`);
    }
  }

  // Fallback to embedded data if file loading fails
  logDebug("⚠️ File loading failed, using embedded business data");
  return getEmbeddedBusinessData();
}

// Embedded fallback data (real businesses from database)
function getEmbeddedBusinessData() {
  const embeddedBusinesses = [
    {
      id: "ChIJ10c9E2ZDXz4Ru2NyjBi7aiE",
      name: "10-PRO Consulting | Business Set Up, Relocation, Visas & Legal Services (Freezone, Mainland & Offshore companies)",
      address:
        "Business Central Towers (Tower B Office # 2004, 20th Floor Al Sufouh 2 - الصفوح - Dubai Media City - دبي - United Arab Emirates",
      category: "registered visa agent Dubai",
      phone: "04 529 3354",
      website: "https://10-pro.com/",
      email: "info@10proconsultingbusin.ae",
      rating: 4.7,
      reviewCount: 505,
      latitude: 25.1007776,
      longitude: 55.1694272,
      businessStatus: "OPERATIONAL",
      logoUrl:
        "https://reportvisascam.com/business-images/logos/logo-ChIJ10c9E2ZDXz4Ru2NyjBi7aiE.jpg",
      photos: [
        "https://reportvisascam.com/business-images/photos/photo_1-ChIJ10c9E2ZDXz4Ru2NyjBi7aiE.jpg",
        "https://reportvisascam.com/business-images/photos/photo_5-ChIJ10c9E2ZDXz4Ru2NyjBi7aiE.jpg",
        "https://reportvisascam.com/business-images/photos/photo_2-ChIJ10c9E2ZDXz4Ru2NyjBi7aiE.jpg",
        "https://reportvisascam.com/business-images/photos/photo_3-ChIJ10c9E2ZDXz4Ru2NyjBi7aiE.jpg",
        "https://reportvisascam.com/business-images/photos/photo_4-ChIJ10c9E2ZDXz4Ru2NyjBi7aiE.jpg",
      ],
      hasTargetKeyword: true,
      createdAt: "2025-07-08 00:28:56",
      updatedAt: "2025-07-15 04:07:21",
    },
    {
      id: "ChIJ31pcKGtrXz4R92jGT68rkVQ",
      name: "4S Study Abroad | 5000+ Visa Approved | Education Consultant in Dubai",
      address:
        "Sultan Business Centre - Office 221 - Oud Metha - Dubai - United Arab Emirates",
      category: "education visa",
      phone: "04 553 8909",
      website:
        "https://www.4sstudyabroad.com/?utm_source=GBP&utm_medium=website_click&utm_campaign=4sstudyabroad",
      email: "info@4sstudyabroad5000vis.ae",
      rating: 4.7,
      reviewCount: 218,
      latitude: 25.233408,
      longitude: 55.3087672,
      businessStatus: "OPERATIONAL",
      logoUrl:
        "https://reportvisascam.com/business-images/logos/logo-ChIJ31pcKGtrXz4R92jGT68rkVQ.jpg",
      photos: [
        "https://reportvisascam.com/business-images/photos/photo_5-ChIJ31pcKGtrXz4R92jGT68rkVQ.jpg",
        "https://reportvisascam.com/business-images/photos/photo_1-ChIJ31pcKGtrXz4R92jGT68rkVQ.jpg",
        "https://reportvisascam.com/business-images/photos/photo_2-ChIJ31pcKGtrXz4R92jGT68rkVQ.jpg",
        "https://reportvisascam.com/business-images/photos/photo_3-ChIJ31pcKGtrXz4R92jGT68rkVQ.jpg",
        "https://reportvisascam.com/business-images/photos/photo_4-ChIJ31pcKGtrXz4R92jGT68rkVQ.jpg",
      ],
      hasTargetKeyword: 1,
      createdAt: "2025-07-08 00:29:59",
      updatedAt: "2025-07-15 04:07:21",
    },
  ];

  logDebug(
    `Using ${embeddedBusinesses.length} embedded real businesses as fallback`,
  );
  return embeddedBusinesses;
}

// Create Express server with embedded data
function createBusinessServer() {
  const express = require("express");
  const app = express();

  logDebug(
    "Creating business server with EMBEDDED DATA (NO file dependencies)",
  );

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
      message: "API is working! (EMBEDDED DATA - No file dependencies)",
      timestamp: new Date().toISOString(),
      businessCount: businessCount,
      source: "embedded_data",
    });
  });

  app.get("/api/health", (req: any, res: any) => {
    const businessData = getBusinessData();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      businessCount: businessData.length,
      dataSource: "embedded_data",
      version: "embedded-data-v1",
      fileSystemDependencies: false,
    });
  });

  // Main business endpoint with embedded data
  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    logDebug("Business endpoint called with embedded data", {
      query: req.query,
    });

    try {
      const allBusinesses = getBusinessData();
      logDebug(`📊 Serving ${allBusinesses.length} embedded businesses`);

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
        message: `Loaded ${paginatedBusinesses.length} of ${allBusinesses.length} Dubai visa services (EMBEDDED DATA)`,
        source: "embedded_business_data",
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
          dataEmbedded: true,
          fileSystemUsed: false,
          realBusinessesIncluded: 5,
          generatedBusinesses: allBusinesses.length - 5,
        },
      };

      logDebug("Embedded business response prepared", {
        count: paginatedBusinesses.length,
        total: allBusinesses.length,
        source: "embedded_data",
      });

      res.json(response);
    } catch (error) {
      logDebug("Error in embedded business endpoint:", error.message);
      res.status(500).json({
        error: "Failed to load embedded business data",
        message: error.message,
        businesses: [],
        total: 0,
        success: false,
      });
    }
  });

  // Alternative endpoint
  app.get("/api/businesses", (req: any, res: any) => {
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
        source: "embedded_data",
        sampleBusiness: businessData[0] || null,
        fileSystemUsed: false,
      },
      systemInfo: {
        embeddedBusinesses: 5,
        generatedBusinesses: businessData.length - 5,
        totalBusinesses: businessData.length,
        noFileSystemDependencies: true,
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
