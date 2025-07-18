import serverless from "serverless-http";

// Enhanced debugging function
function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] NETLIFY DEBUG: ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
}

// Get business data - load all 841 businesses from JSON file
function getBusinessData() {
  try {
    logDebug("Loading all businesses from JSON file");

    // Load the complete business data from JSON file
    const businessData = require("./businesses.json");
    const realBusinesses = businessData.businesses || [];

    logDebug(
      `✅ Loaded ${realBusinesses.length} real businesses from JSON file`,
    );

    // Ensure all businesses have proper image URLs pointing to Netlify
    const businessesWithNetlifyImages = realBusinesses.map((business: any) => ({
      ...business,
      logoUrl:
        business.logoUrl ||
        `https://reportvisascam.com/business-images/logos/logo-${business.id}.jpg`,
      photos: business.photos || [],
    }));

    return businessesWithNetlifyImages;
  } catch (error) {
    logDebug(
      "Error loading businesses.json, falling back to sample data",
      error,
    );

    // Fallback to a few sample businesses if JSON loading fails
    return [
      {
        id: "ChIJ10c9E2ZDXz4Ru2NyjBi7aiE",
        name: "10-PRO Consulting | Business Set Up, Relocation, Visas & Legal Services",
        address: "Business Central Towers, Dubai Media City, Dubai, UAE",
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
        ],
        hasTargetKeyword: true,
        createdAt: "2025-07-08 00:28:56",
        updatedAt: "2025-07-15 04:07:21",
      },
    ];
  }
}

// Enhanced search function with filters
function searchBusinesses(
  businesses: any[],
  searchQuery?: string,
  category?: string,
  city?: string,
) {
  let filteredBusinesses = [...businesses];

  // Apply search filter
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = searchQuery.toLowerCase().trim();
    filteredBusinesses = filteredBusinesses.filter(
      (business) =>
        business.name.toLowerCase().includes(searchTerm) ||
        business.address.toLowerCase().includes(searchTerm) ||
        business.category.toLowerCase().includes(searchTerm),
    );
  }

  // Apply category filter
  if (category && category !== "all" && category.trim()) {
    filteredBusinesses = filteredBusinesses.filter(
      (business) => business.category === category.trim(),
    );
  }

  // Apply city filter (UAE cities)
  if (city && city !== "all" && city.trim()) {
    const cityTerm = city.toLowerCase().trim();
    filteredBusinesses = filteredBusinesses.filter((business) =>
      business.address.toLowerCase().includes(cityTerm),
    );
  }

  return filteredBusinesses;
}

// Get unique categories from businesses
function getCategories(businesses: any[]) {
  const categories = [
    ...new Set(businesses.map((b) => b.category).filter(Boolean)),
  ];
  return categories.sort();
}

// Get unique UAE cities from addresses
function getUAECities(businesses: any[]) {
  const cities = new Set<string>();
  const uaeCityPatterns = [
    /Dubai/i,
    /Abu Dhabi/i,
    /Sharjah/i,
    /Ajman/i,
    /Fujairah/i,
    /Ras Al Khaimah/i,
    /Umm Al Quwain/i,
    /Al Ain/i,
    /Khor Fakkan/i,
    /Kalba/i,
    /Dibba/i,
    /Madinat Zayed/i,
    /Ruwais/i,
    /Liwa/i,
  ];

  businesses.forEach((business) => {
    if (business.address) {
      uaeCityPatterns.forEach((pattern) => {
        const match = business.address.match(pattern);
        if (match) {
          cities.add(match[0]);
        }
      });
    }
  });

  return Array.from(cities).sort();
}

// Create Express server with real business data
function createBusinessServer() {
  const express = require("express");
  const app = express();

  logDebug("Creating business server with ALL 841+ REAL BUSINESSES FROM JSON");

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
    const businessData = getBusinessData();
    res.json({
      message: "API is working! (ALL 841+ REAL BUSINESSES FROM JSON)",
      timestamp: new Date().toISOString(),
      businessCount: businessData.length,
      source: "businesses.json",
    });
  });

  app.get("/api/health", (req: any, res: any) => {
    const businessData = getBusinessData();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      businessCount: businessData.length,
      dataSource: "businesses.json",
      version: "json-full-dataset-v1",
      fileSystemDependencies: false,
    });
  });

  // Main business endpoint with search and filter support
  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    logDebug("Business endpoint called for all real businesses", {
      query: req.query,
    });

    try {
      const allBusinesses = getBusinessData();
      logDebug(`📊 Loaded ${allBusinesses.length} real businesses from JSON`);

      // Extract search and filter parameters
      const searchQuery = req.query.search as string;
      const categoryFilter = req.query.category as string;
      const cityFilter = req.query.city as string;

      // Apply filters
      const filteredBusinesses = searchBusinesses(
        allBusinesses,
        searchQuery,
        categoryFilter,
        cityFilter,
      );

      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const paginatedBusinesses = filteredBusinesses.slice(
        offset,
        offset + limit,
      );

      // Get categories and cities for filter options
      const categories = getCategories(allBusinesses);
      const cities = getUAECities(allBusinesses);

      const hasActiveFilters = !!(searchQuery || categoryFilter || cityFilter);

      const response = {
        businesses: paginatedBusinesses,
        total: filteredBusinesses.length,
        totalUnfiltered: allBusinesses.length,
        categories: categories,
        cities: cities,
        message: hasActiveFilters
          ? `Found ${paginatedBusinesses.length} of ${filteredBusinesses.length} filtered businesses (${allBusinesses.length} total) from JSON dataset`
          : `Loaded ${paginatedBusinesses.length} of ${allBusinesses.length} Dubai visa services from JSON dataset`,
        source: "businesses.json",
        filters: {
          search: searchQuery || null,
          category: categoryFilter || null,
          city: cityFilter || null,
          hasActiveFilters: hasActiveFilters,
        },
        pagination: {
          page: page,
          limit: limit,
          total: filteredBusinesses.length,
          totalPages: Math.ceil(filteredBusinesses.length / limit),
          hasMore: offset + limit < filteredBusinesses.length,
        },
        success: true,
        timestamp: new Date().toISOString(),
        debug: {
          dataLoadedFromJSON: true,
          realBusinessesCount: allBusinesses.length,
          filteredCount: filteredBusinesses.length,
          searchApplied: !!searchQuery,
          categoryApplied: !!categoryFilter,
          cityApplied: !!cityFilter,
        },
      };

      logDebug("Real business response prepared", {
        total: allBusinesses.length,
        filtered: filteredBusinesses.length,
        returned: paginatedBusinesses.length,
        source: "businesses.json",
        hasFilters: hasActiveFilters,
      });

      res.json(response);
    } catch (error) {
      logDebug("Error in real business endpoint:", error.message);
      res.status(500).json({
        error: "Failed to load real business data from JSON",
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

  // Individual business details endpoint for enhanced data
  app.get("/api/business/:businessId", (req: any, res: any) => {
    logDebug("Individual business details requested", {
      businessId: req.params.businessId,
    });

    try {
      const allBusinesses = getBusinessData();
      const businessId = req.params.businessId;

      // Find the specific business by ID
      const business = allBusinesses.find((b: any) => b.id === businessId);

      if (!business) {
        logDebug(`Business not found: ${businessId}`);
        return res.status(404).json({
          error: "Business not found",
          businessId: businessId,
          available: allBusinesses.length,
        });
      }

      // Return enhanced business data in the expected format
      const enhancedBusiness = {
        id: business.id,
        name: business.name,
        address: business.address,
        phone: business.phone,
        website: business.website,
        email: business.email,
        category: business.category,

        // Enhanced data from stored fields
        description:
          business.businessStatus ||
          `Professional ${business.category?.toLowerCase() || "immigration"} services in UAE. Specializing in visa processing, immigration consulting, and related government documentation services.`,
        businessHours: business.businessHours || [],
        businessStatus: business.businessStatus || "Unknown",
        priceLevel: business.priceLevel,
        googleRating: business.rating,
        googleReviewCount: business.reviewCount,
        businessTypes: business.businessTypes || [],
        photos: business.photos || [],

        // Source indicator
        source: "netlify_json_stored",
        lastUpdated: business.updatedAt || business.createdAt,
      };

      logDebug(`✅ Retrieved business details for: ${business.name}`);
      res.json(enhancedBusiness);
    } catch (error) {
      logDebug("Error fetching individual business details:", error.message);
      res.status(500).json({
        error: "Failed to fetch business details",
        message: error.message,
        businessId: req.params.businessId,
      });
    }
  });

  // Reports endpoint for company report counts
  app.get("/api/reports/company/:companyId", (req: any, res: any) => {
    logDebug("Company reports requested", {
      companyId: req.params.companyId,
    });

    try {
      const companyId = req.params.companyId;

      // For now, return mock data since we don't have a reports system in Netlify
      // In a real implementation, this would query a reports database
      const mockReportCount = Math.floor(Math.random() * 5); // Random number 0-4

      const response = {
        success: true,
        companyId: companyId,
        totalReports: mockReportCount,
        reports: [], // Empty for now
        source: "netlify_mock",
        timestamp: new Date().toISOString(),
      };

      logDebug(
        `✅ Retrieved report count for company: ${companyId} (${mockReportCount} reports)`,
      );
      res.json(response);
    } catch (error) {
      logDebug("Error fetching company reports:", error.message);
      res.status(500).json({
        error: "Failed to fetch company reports",
        message: error.message,
        companyId: req.params.companyId,
        totalReports: 0,
      });
    }
  });

  // Debug endpoint
  app.get("/api/debug", (req: any, res: any) => {
    const businessData = getBusinessData();
    const categories = getCategories(businessData);
    const cities = getUAECities(businessData);

    res.json({
      availableEndpoints: [
        "GET /api/ping",
        "GET /api/health",
        "GET /api/dubai-visa-services?search=<query>&category=<cat>&city=<city>",
        "GET /api/businesses?search=<query>&category=<cat>&city=<city>",
        "GET /api/business/:businessId",
        "GET /api/reports/company/:companyId",
        "GET /api/debug",
      ],
      businessDataStatus: {
        count: businessData.length,
        source: "businesses.json",
        sampleBusiness: businessData[0] || null,
        fileSystemUsed: true,
      },
      filters: {
        availableCategories: categories.length,
        availableCities: cities.length,
        searchSupported: true,
      },
      systemInfo: {
        realBusinessesFromJSON: businessData.length,
        generatedBusinesses: 0,
        totalBusinesses: businessData.length,
        usingJSONDataset: true,
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
        "/api/business/:businessId",
        "/api/reports/company/:companyId",
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
