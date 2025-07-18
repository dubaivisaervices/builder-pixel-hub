import { RequestHandler } from "express";
import { postgresService } from "../database/postgresService";
import fs from "fs";
import path from "path";

export const importBusinesses: RequestHandler = async (req, res) => {
  try {
    console.log("🔄 Starting business import to PostgreSQL database...");

    // Load businesses from JSON files
    const jsonPath = path.join(
      process.cwd(),
      "public",
      "api",
      "complete-businesses.json",
    );

    let businesses = [];

    if (fs.existsSync(jsonPath)) {
      console.log("📄 Loading businesses from local JSON file...");
      const jsonData = fs.readFileSync(jsonPath, "utf8");
      const data = JSON.parse(jsonData);
      businesses = data.businesses || [];
    } else {
      console.log("📄 Loading businesses from fallback JSON...");
      // Try alternative paths
      const altPaths = [
        path.join(process.cwd(), "client", "data", "businesses.json"),
        path.join(process.cwd(), "public", "data", "complete-dataset.json"),
        path.join(process.cwd(), "temp_real_businesses.json"),
      ];

      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          const jsonData = fs.readFileSync(altPath, "utf8");
          const data = JSON.parse(jsonData);
          businesses = data.businesses || data || [];
          console.log(`📄 Loaded from: ${altPath}`);
          break;
        }
      }
    }

    if (businesses.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No businesses found in any JSON file",
      });
    }

    console.log(`📊 Found ${businesses.length} businesses to import`);

    // Import businesses in batches
    let imported = 0;
    let errors = 0;
    const batchSize = 50; // Smaller batches for stability

    for (let i = 0; i < businesses.length; i += batchSize) {
      const batch = businesses.slice(i, i + batchSize);

      for (const business of batch) {
        try {
          // Convert business data to match PostgreSQL schema
          const businessData = {
            id: business.id || business.place_id || `business_${i}`,
            name: business.name || "Unknown Business",
            address: business.address || business.formatted_address || "",
            category: business.category || "Business Services",
            phone: business.phone || business.formatted_phone_number || "",
            website: business.website || "",
            email: business.email || "",
            rating: parseFloat(
              business.rating || business.google_rating || 4.0,
            ),
            reviewCount: parseInt(
              business.reviewCount || business.user_ratings_total || 0,
            ),
            latitude: parseFloat(
              business.latitude || business.location?.lat || 0,
            ),
            longitude: parseFloat(
              business.longitude || business.location?.lng || 0,
            ),
            businessStatus: business.businessStatus || "OPERATIONAL",
            logoUrl: business.logoUrl || "",
            photos: business.photos || [],
            hasTargetKeyword: business.hasTargetKeyword || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await postgresService.upsertBusiness(businessData);
          imported++;

          if (imported % 50 === 0) {
            console.log(
              `✅ Imported ${imported}/${businesses.length} businesses`,
            );
          }
        } catch (businessError) {
          console.error(
            `❌ Failed to import business ${business.name}:`,
            businessError.message,
          );
          errors++;
        }
      }
    }

    // Get final count from database
    const finalCount = await postgresService.getBusinessCount();

    console.log(`📊 Import complete: ${finalCount} businesses in database`);

    res.json({
      success: true,
      message: "Businesses imported successfully",
      imported: imported,
      errors: errors,
      finalDatabaseCount: finalCount,
      totalProcessed: businesses.length,
    });
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    res.status(500).json({
      success: false,
      error: "Import failed",
      message: error.message,
    });
  }
};
