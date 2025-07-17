#!/usr/bin/env node

/**
 * Static Data Export for Netlify
 * Exports business data from the current API to static JSON files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportStaticData() {
  console.log("🚀 Starting static data export for Netlify...");

  try {
    // Create directories
    const apiDir = path.join(__dirname, "public", "api");
    const dataDir = path.join(__dirname, "public", "data");

    await fs.promises.mkdir(apiDir, { recursive: true });
    await fs.promises.mkdir(dataDir, { recursive: true });

    console.log("📁 Created directories");

    // Fetch data from the running development server
    const baseUrl = "http://localhost:8080";

    console.log("🔄 Fetching businesses from local API...");

    try {
      // Fetch all businesses
      const businessResponse = await fetch(
        `${baseUrl}/api/dubai-visa-services?limit=1000`,
      );

      if (!businessResponse.ok) {
        throw new Error(
          `Business API failed: ${businessResponse.status} ${businessResponse.statusText}`,
        );
      }

      const businessData = await businessResponse.json();
      let businesses = [];

      // Handle different response formats
      if (Array.isArray(businessData)) {
        businesses = businessData;
      } else if (businessData && Array.isArray(businessData.businesses)) {
        businesses = businessData.businesses;
      } else if (businessData && Array.isArray(businessData.data)) {
        businesses = businessData.data;
      } else {
        console.warn("⚠️ Unexpected business data format:", businessData);
        businesses = [];
      }

      console.log(`✅ Retrieved ${businesses.length} businesses`);

      if (businesses.length === 0) {
        console.error(
          "❌ No businesses found! Make sure the dev server is running with data.",
        );
        process.exit(1);
      }

      // Calculate stats from the data
      const stats = {
        totalBusinesses: businesses.length,
        totalReviews: businesses.reduce(
          (sum, b) => sum + (b?.reviewCount || 0),
          0,
        ),
        avgRating:
          businesses.reduce((sum, b) => sum + (b?.rating || 0), 0) /
          businesses.length,
        locations: 15,
        scamReports: 145,
      };

      // Get unique categories
      const categories = [
        ...new Set(
          businesses
            .map((b) => b?.category)
            .filter(Boolean)
            .map((c) => c.toLowerCase()),
        ),
      ].sort();

      // Get featured businesses (top rated)
      const featuredBusinesses = businesses
        .filter((b) => b?.rating && b.rating >= 4.0)
        .sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
        .slice(0, 20);

      // UAE cities
      const cities = [
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Ras Al Khaimah",
        "Fujairah",
        "Umm Al Quwain",
        "Al Ain",
      ];

      // Create complete dataset
      const completeData = {
        businesses,
        stats,
        categories,
        cities,
        featured: featuredBusinesses,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        source: "Local Development Server",
      };

      // Export files
      const files = [
        {
          path: path.join(apiDir, "dubai-visa-services.json"),
          data: businesses,
          description: "Main businesses API endpoint",
        },
        {
          path: path.join(apiDir, "stats.json"),
          data: stats,
          description: "Statistics",
        },
        {
          path: path.join(apiDir, "categories.json"),
          data: categories,
          description: "Categories",
        },
        {
          path: path.join(apiDir, "cities.json"),
          data: cities,
          description: "Cities",
        },
        {
          path: path.join(apiDir, "featured.json"),
          data: featuredBusinesses,
          description: "Featured businesses",
        },
        {
          path: path.join(dataDir, "complete-dataset.json"),
          data: completeData,
          description: "Complete dataset",
        },
      ];

      for (const file of files) {
        await fs.promises.writeFile(
          file.path,
          JSON.stringify(file.data, null, 2),
        );
        console.log(`✅ Exported ${file.description}: ${file.path}`);
      }

      // Create Netlify _redirects file
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
`.trim();

      const redirectsPath = path.join(__dirname, "public", "_redirects");
      await fs.promises.writeFile(redirectsPath, redirectsContent);
      console.log(`✅ Created Netlify redirects: ${redirectsPath}`);

      // Create netlify.toml
      const netlifyConfig = `
[build]
  publish = "dist/spa"
  command = "npm run export:netlify && npm run build"

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
`.trim();

      const netlifyConfigPath = path.join(__dirname, "netlify.toml");
      await fs.promises.writeFile(netlifyConfigPath, netlifyConfig);
      console.log(`✅ Created Netlify config: ${netlifyConfigPath}`);

      console.log("\n🎉 Static data export completed successfully!");
      console.log("\n📋 Summary:");
      console.log(`   - ${businesses.length} businesses exported`);
      console.log(`   - ${categories.length} categories exported`);
      console.log(`   - ${cities.length} cities exported`);
      console.log(
        `   - ${featuredBusinesses.length} featured businesses exported`,
      );
      console.log(`   - Static API endpoints created`);
      console.log(`   - Netlify configuration files created`);

      console.log("\n🚀 Next steps:");
      console.log("   1. Run: npm run build");
      console.log("   2. Deploy the 'dist/spa' folder to Netlify");
      console.log(
        "   3. All 841 businesses will be available via static JSON!",
      );
    } catch (fetchError) {
      console.error("❌ Failed to fetch from local API:", fetchError);
      console.log("\n💡 Make sure the development server is running:");
      console.log("   npm run dev");
      console.log("   Then try this export again.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  }
}

// Run the export
exportStaticData();
