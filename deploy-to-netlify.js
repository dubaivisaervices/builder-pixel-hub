#!/usr/bin/env node

/**
 * Netlify Deployment Script
 * Exports all 841 business listings from SQLite to JSON for production
 */

const { database } = require("./server/database/database");
const { businessService } = require("./server/database/businessService");
const fs = require("fs");
const path = require("path");

async function exportBusinessData() {
  console.log("🚀 Starting Netlify deployment data export...");

  try {
    // Create public/api directory if it doesn't exist
    const apiDir = path.join(__dirname, "public", "api");
    const dataDir = path.join(__dirname, "public", "data");

    await fs.promises.mkdir(apiDir, { recursive: true });
    await fs.promises.mkdir(dataDir, { recursive: true });

    console.log("📁 Created directories:", { apiDir, dataDir });

    // Get all businesses with full data
    console.log("🗄️ Fetching all businesses from database...");
    const allBusinesses = await businessService.getBusinessesPaginated(
      1000,
      0,
      true,
    );

    console.log(`✅ Retrieved ${allBusinesses.length} businesses`);

    // Get database stats
    const stats = await businessService.getStats();
    console.log("📊 Database stats:", stats);

    // Get all categories
    const categories = await businessService.getAllCategories();
    console.log(`📂 Retrieved ${categories.length} categories`);

    // Get UAE cities
    const cities = await businessService.getUAECities();
    console.log(`🏙️ Retrieved ${cities.length} cities`);

    // Create complete dataset
    const completeData = {
      businesses: allBusinesses,
      stats: {
        totalBusinesses: allBusinesses.length,
        totalReviews: stats.reviews,
        avgRating:
          allBusinesses.reduce((sum, b) => sum + (b.rating || 0), 0) /
          allBusinesses.length,
        locations: cities.length,
        scamReports: 145, // Static value
      },
      categories,
      cities,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    // Export main API endpoint
    const mainApiPath = path.join(apiDir, "dubai-visa-services.json");
    await fs.promises.writeFile(
      mainApiPath,
      JSON.stringify(completeData.businesses, null, 2),
    );
    console.log(`✅ Exported main API data: ${mainApiPath}`);

    // Export complete dataset
    const completePath = path.join(dataDir, "complete-dataset.json");
    await fs.promises.writeFile(
      completePath,
      JSON.stringify(completeData, null, 2),
    );
    console.log(`✅ Exported complete dataset: ${completePath}`);

    // Export stats only
    const statsPath = path.join(apiDir, "stats.json");
    await fs.promises.writeFile(
      statsPath,
      JSON.stringify(completeData.stats, null, 2),
    );
    console.log(`✅ Exported stats: ${statsPath}`);

    // Export categories
    const categoriesPath = path.join(apiDir, "categories.json");
    await fs.promises.writeFile(
      categoriesPath,
      JSON.stringify(categories, null, 2),
    );
    console.log(`✅ Exported categories: ${categoriesPath}`);

    // Export cities
    const citiesPath = path.join(apiDir, "cities.json");
    await fs.promises.writeFile(citiesPath, JSON.stringify(cities, null, 2));
    console.log(`✅ Exported cities: ${citiesPath}`);

    // Create featured businesses (top rated)
    const featuredBusinesses = allBusinesses
      .filter((b) => b.rating && b.rating >= 4.0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 20);

    const featuredPath = path.join(apiDir, "featured.json");
    await fs.promises.writeFile(
      featuredPath,
      JSON.stringify(featuredBusinesses, null, 2),
    );
    console.log(`✅ Exported featured businesses: ${featuredPath}`);

    // Create Netlify _redirects file for API routes
    const redirectsContent = `
# API Routes for Static Data
/api/dubai-visa-services /api/dubai-visa-services.json 200
/api/businesses-static /api/dubai-visa-services.json 200
/api/stats /api/stats.json 200
/api/categories /api/categories.json 200
/api/cities /api/cities.json 200
/api/featured /api/featured.json 200

# Fallback for SPA
/* /index.html 200
`;

    const redirectsPath = path.join(__dirname, "public", "_redirects");
    await fs.promises.writeFile(redirectsPath, redirectsContent.trim());
    console.log(`✅ Created Netlify redirects: ${redirectsPath}`);

    // Create netlify.toml for build configuration
    const netlifyConfig = `
[build]
  publish = "public"
  command = "npm run build:netlify"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
    Access-Control-Allow-Origin = "*"
    Content-Type = "application/json"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
`;

    const netlifyConfigPath = path.join(__dirname, "netlify.toml");
    await fs.promises.writeFile(netlifyConfigPath, netlifyConfig.trim());
    console.log(`✅ Created Netlify config: ${netlifyConfigPath}`);

    console.log("\n🎉 Netlify deployment export completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - ${allBusinesses.length} businesses exported`);
    console.log(`   - ${categories.length} categories exported`);
    console.log(`   - ${cities.length} cities exported`);
    console.log(
      `   - ${featuredBusinesses.length} featured businesses exported`,
    );
    console.log(`   - API endpoints created for static serving`);
    console.log(`   - Netlify configuration files created`);

    console.log("\n🚀 Next steps:");
    console.log("   1. Run: npm run build:netlify");
    console.log("   2. Deploy the 'public' folder to Netlify");
    console.log("   3. Set environment variables in Netlify dashboard");
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  }
}

// Run the export
exportBusinessData();
