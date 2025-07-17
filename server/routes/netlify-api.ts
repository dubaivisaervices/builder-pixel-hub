import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

// Netlify-compatible API routes that can serve static JSON data

export const netlifyBusinessesAPI: RequestHandler = async (req, res) => {
  try {
    console.log("🌐 Netlify API: Serving businesses data");

    // Try to read from static JSON first (production)
    const publicPath = path.join(
      process.cwd(),
      "public",
      "api",
      "dubai-visa-services.json",
    );

    if (fs.existsSync(publicPath)) {
      console.log("📄 Serving from static JSON file");
      const data = await fs.promises.readFile(publicPath, "utf8");
      const businesses = JSON.parse(data);

      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(businesses);
      return;
    }

    // Fallback to database (development)
    console.log("🗄️ Fallback to database");
    const { businessService } = await import("../database/businessService");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 1000;
    const offset = (page - 1) * limit;

    const businesses = await businessService.getBusinessesPaginated(
      limit,
      offset,
      true, // include reviews
    );

    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(businesses);
  } catch (error) {
    console.error("❌ Netlify API error:", error);

    // Ultimate fallback - return sample data
    const sampleData = [
      {
        id: "sample-1",
        name: "Dubai Visa Services Pro",
        rating: 4.5,
        reviewCount: 150,
        address: "Business Bay, Dubai, UAE",
        category: "visa services",
        logoUrl: "https://via.placeholder.com/100x100/0066cc/ffffff?text=DVS",
        photos: [],
      },
      {
        id: "sample-2",
        name: "Emirates Immigration Consultants",
        rating: 4.3,
        reviewCount: 89,
        address: "DIFC, Dubai, UAE",
        category: "immigration services",
        logoUrl: "https://via.placeholder.com/100x100/009900/ffffff?text=EIC",
        photos: [],
      },
      {
        id: "sample-3",
        name: "Al Barsha Document Clearing",
        rating: 4.1,
        reviewCount: 67,
        address: "Al Barsha, Dubai, UAE",
        category: "document clearing",
        logoUrl: "https://via.placeholder.com/100x100/cc6600/ffffff?text=ADC",
        photos: [],
      },
    ];

    res.status(500).json({
      businesses: sampleData,
      error: "Service temporarily unavailable - showing sample data",
      fallback: true,
    });
  }
};

export const netlifyStatsAPI: RequestHandler = async (req, res) => {
  try {
    const statsPath = path.join(process.cwd(), "public", "api", "stats.json");

    if (fs.existsSync(statsPath)) {
      const data = await fs.promises.readFile(statsPath, "utf8");
      const stats = JSON.parse(data);

      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(stats);
      return;
    }

    // Fallback stats
    res.json({
      totalBusinesses: 841,
      totalReviews: 4280,
      avgRating: 4.1,
      locations: 15,
      scamReports: 145,
    });
  } catch (error) {
    console.error("❌ Stats API error:", error);
    res.status(500).json({
      totalBusinesses: 841,
      totalReviews: 4280,
      avgRating: 4.1,
      locations: 15,
      scamReports: 145,
    });
  }
};

export const netlifyCategoriesAPI: RequestHandler = async (req, res) => {
  try {
    const categoriesPath = path.join(
      process.cwd(),
      "public",
      "api",
      "categories.json",
    );

    if (fs.existsSync(categoriesPath)) {
      const data = await fs.promises.readFile(categoriesPath, "utf8");
      const categories = JSON.parse(data);

      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(categories);
      return;
    }

    // Fallback categories
    res.json([
      "visa services",
      "immigration services",
      "document clearing",
      "attestation services",
      "business setup",
      "work permits",
    ]);
  } catch (error) {
    console.error("❌ Categories API error:", error);
    res.status(500).json([]);
  }
};

export const netlifyFeaturedAPI: RequestHandler = async (req, res) => {
  try {
    const featuredPath = path.join(
      process.cwd(),
      "public",
      "api",
      "featured.json",
    );

    if (fs.existsSync(featuredPath)) {
      const data = await fs.promises.readFile(featuredPath, "utf8");
      const featured = JSON.parse(data);

      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(featured);
      return;
    }

    // Fallback to main businesses API
    await netlifyBusinessesAPI(req, res);
  } catch (error) {
    console.error("❌ Featured API error:", error);
    res.status(500).json([]);
  }
};
