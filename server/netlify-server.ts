import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join } from "path";

interface BusinessData {
  id: string;
  name: string;
  address: string;
  category: string;
  phone?: string;
  website?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  latitude?: number;
  longitude?: number;
  businessStatus: string;
  logoUrl?: string;
  photos?: string[];
}

// Cache for static data
let cachedBusinessData: BusinessData[] | null = null;

function loadStaticBusinessData(): BusinessData[] {
  if (cachedBusinessData) {
    return cachedBusinessData;
  }

  try {
    // Try to load from multiple possible locations
    const possiblePaths = [
      join(process.cwd(), "client/data/businesses.json"),
      join(__dirname, "../client/data/businesses.json"),
      "./client/data/businesses.json",
      "../client/data/businesses.json",
    ];

    let businessesData = null;

    for (const path of possiblePaths) {
      try {
        console.log(`🔍 Trying to load businesses from: ${path}`);
        const fileContent = readFileSync(path, "utf-8");
        businessesData = JSON.parse(fileContent);
        console.log(`✅ Successfully loaded businesses from: ${path}`);
        break;
      } catch (err) {
        console.log(`❌ Failed to load from: ${path}`);
      }
    }

    if (!businessesData) {
      // Return sample data if file not found
      console.log("📊 Using sample business data as fallback");
      return getSampleBusinessData();
    }

    // Extract businesses array from the data
    const businesses = businessesData.businesses || businessesData;

    if (!Array.isArray(businesses)) {
      console.log("⚠️ Invalid data format, using sample data");
      return getSampleBusinessData();
    }

    cachedBusinessData = businesses;
    console.log(`📊 Loaded ${businesses.length} businesses from static data`);
    return cachedBusinessData;
  } catch (error) {
    console.error("❌ Error loading static business data:", error);
    return getSampleBusinessData();
  }
}

function getSampleBusinessData(): BusinessData[] {
  return [
    {
      id: "sample-1",
      name: "Dubai Visa Services Pro",
      address: "Business Bay, Dubai, UAE",
      category: "visa services",
      rating: 4.5,
      reviewCount: 150,
      latitude: 25.1976,
      longitude: 55.2744,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
    {
      id: "sample-2",
      name: "Emirates Immigration Consultants",
      address: "DIFC, Dubai, UAE",
      category: "immigration services",
      rating: 4.3,
      reviewCount: 89,
      latitude: 25.2134,
      longitude: 55.2824,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
    {
      id: "sample-3",
      name: "Al Barsha Document Clearing",
      address: "Al Barsha, Dubai, UAE",
      category: "document clearing",
      rating: 4.1,
      reviewCount: 67,
      latitude: 25.1136,
      longitude: 55.1902,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
    {
      id: "sample-4",
      name: "Jumeirah Visa Center",
      address: "Jumeirah, Dubai, UAE",
      category: "visa services",
      rating: 4.0,
      reviewCount: 45,
      latitude: 25.2048,
      longitude: 55.2708,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
    {
      id: "sample-5",
      name: "Dubai Immigration Hub",
      address: "Downtown Dubai, UAE",
      category: "immigration services",
      rating: 4.2,
      reviewCount: 78,
      latitude: 25.1972,
      longitude: 55.2744,
      businessStatus: "OPERATIONAL",
      logoUrl: "/placeholder.svg",
    },
  ];
}

export function createNetlifyServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/api/ping", (req, res) => {
    res.json({
      message: "API is working! (Netlify version)",
      timestamp: new Date().toISOString(),
      environment: "netlify",
      database: "static_data",
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "netlify-static",
    });
  });

  // Business data endpoint
  app.get("/api/dubai-visa-services", (req, res) => {
    const startTime = Date.now();

    try {
      console.log("🔄 Fetching businesses (Netlify static data)...");

      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Load business data
      const allBusinesses = loadStaticBusinessData();

      // Apply pagination
      const paginatedBusinesses = allBusinesses.slice(offset, offset + limit);

      // Get unique categories
      const categories = [...new Set(allBusinesses.map((b) => b.category))];

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 10) / 100; // seconds

      const response = {
        businesses: paginatedBusinesses,
        total: allBusinesses.length,
        categories: categories,
        processingTime: duration,
        message: `Loaded ${paginatedBusinesses.length} of ${allBusinesses.length} Dubai visa service providers (static data)`,
        source: "static_data",
        pagination: {
          page: page,
          limit: limit,
          total: allBusinesses.length,
          totalPages: Math.ceil(allBusinesses.length / limit),
          hasMore: offset + limit < allBusinesses.length,
        },
        success: true,
      };

      console.log(
        `✅ API Response ready: ${paginatedBusinesses.length} businesses`,
      );
      res.json(response);
    } catch (error) {
      console.error("❌ Error in businesses API:", error);

      // Return sample data as ultimate fallback
      const sampleData = getSampleBusinessData();
      res.json({
        businesses: sampleData,
        total: sampleData.length,
        categories: [
          "visa services",
          "immigration services",
          "document clearing",
        ],
        processingTime: 0.1,
        message: "Loaded sample business data (fallback mode)",
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown error",
        pagination: {
          page: 1,
          limit: 50,
          total: sampleData.length,
          totalPages: 1,
          hasMore: false,
        },
        success: false,
      });
    }
  });

  // Alternative endpoint
  app.get("/api/businesses", (req, res) => {
    // Redirect to main endpoint
    app.handle(Object.assign(req, { url: "/api/dubai-visa-services" }), res);
  });

  // Catch-all for unhandled routes
  app.use((req, res) => {
    res.status(404).json({
      error: "Endpoint not found",
      available_endpoints: [
        "/api/ping",
        "/api/health",
        "/api/dubai-visa-services",
        "/api/businesses",
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("❌ Server error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
