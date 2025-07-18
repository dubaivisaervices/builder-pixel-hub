import { RequestHandler } from "express";
import { database } from "../database/database";

export const testGoogleBusinessSave: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log("🧪 Testing Google API business save process...");

    // Test with a simple search that should return results
    const searchQuery = "restaurants Dubai";
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=25.2048,55.2708&radius=50000&key=${apiKey}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const testBusiness = data.results[0]; // Take first result
      console.log(`📍 Testing save for: ${testBusiness.name}`);

      let saveResult;
      try {
        // Check if business already exists
        const existing = await database.get(
          "SELECT id FROM businesses WHERE name = ?",
          [testBusiness.name],
        );

        if (existing) {
          saveResult = {
            success: false,
            reason: "already_exists",
            businessName: testBusiness.name,
          };
        } else {
          // Try to insert the business
          const insertResult = await database.run(
            `
            INSERT INTO businesses (
              id, name, address, phone, website, latitude, longitude,
              rating, user_ratings_total, business_status, category, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
            [
              testBusiness.place_id || `test_${Date.now()}`,
              testBusiness.name || "Unknown Business",
              testBusiness.formatted_address || "",
              testBusiness.formatted_phone_number || "",
              testBusiness.website || "",
              testBusiness.geometry?.location?.lat || 0,
              testBusiness.geometry?.location?.lng || 0,
              testBusiness.rating || 0,
              testBusiness.user_ratings_total || 0,
              testBusiness.business_status || "OPERATIONAL",
              "test category",
              `Test business from Google API`,
            ],
          );

          // Verify it was saved
          const saved = await database.get(
            "SELECT * FROM businesses WHERE id = ?",
            [testBusiness.place_id],
          );

          if (saved) {
            saveResult = {
              success: true,
              businessName: testBusiness.name,
              savedId: saved.id,
              message: "Successfully saved new business",
            };

            // Clean up test data
            await database.run("DELETE FROM businesses WHERE id = ?", [
              testBusiness.place_id,
            ]);
          } else {
            saveResult = {
              success: false,
              reason: "insert_failed_verification",
              businessName: testBusiness.name,
            };
          }
        }
      } catch (error) {
        saveResult = {
          success: false,
          reason: "database_error",
          businessName: testBusiness.name,
          error: error.message,
        };
      }

      // Get current count
      const countResult = await database.get(
        "SELECT COUNT(*) as total FROM businesses",
      );

      res.json({
        success: true,
        googleApiWorking: true,
        businessFound: testBusiness.name,
        saveTest: saveResult,
        currentDatabaseCount: countResult.total,
        diagnosis:
          saveResult.success || saveResult.reason === "already_exists"
            ? "Database save process working correctly"
            : "Database save process has issues",
      });
    } else {
      res.json({
        success: false,
        googleApiWorking: false,
        error: `Google API returned: ${data.status}`,
        message: data.error_message || "No results found",
      });
    }
  } catch (error) {
    console.error("Google business save test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
