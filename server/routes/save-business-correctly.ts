import { RequestHandler } from "express";
import { database } from "../database/database";

export const saveBusinessCorrectly: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Get actual schema first
    const schema = await database.all("PRAGMA table_info(businesses)");
    console.log("📋 Database schema:", schema);

    // Create column list based on actual schema
    const columnNames = schema.map((col) => col.name);

    // Test with Bright Doors Visa Services specifically
    const searchQuery = "Bright Doors Visa Services Dubai";
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=25.2048,55.2708&radius=100000&key=${apiKey}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    let saveResults = [];

    if (data.status === "OK" && data.results && data.results.length > 0) {
      for (const business of data.results.slice(0, 3)) {
        // Take first 3 results
        try {
          // Check if business already exists
          const existing = await database.get(
            "SELECT id FROM businesses WHERE name = ?",
            [business.name],
          );

          if (!existing) {
            // Map Google business data to our schema
            const businessData = {
              id: business.place_id,
              name: business.name,
              address: business.formatted_address || "",
              phone: business.formatted_phone_number || "",
              website: business.website || "",
              // Skip latitude/longitude if columns don't exist
              rating: business.rating || 0,
              reviews: business.user_ratings_total || 0,
              category: "visa services",
              description: `Business found via Google API search: ${searchQuery}`,
            };

            // Build dynamic insert based on available columns
            const availableFields = Object.keys(businessData).filter((field) =>
              columnNames.includes(field),
            );

            const placeholders = availableFields.map(() => "?").join(", ");
            const fieldNames = availableFields.join(", ");
            const values = availableFields.map((field) => businessData[field]);

            const insertSQL = `INSERT INTO businesses (${fieldNames}) VALUES (${placeholders})`;

            console.log(`💾 Saving: ${business.name}`);
            console.log(`📝 SQL: ${insertSQL}`);
            console.log(`📊 Values:`, values);

            await database.run(insertSQL, values);

            // Verify save
            const saved = await database.get(
              "SELECT * FROM businesses WHERE id = ?",
              [business.place_id],
            );

            saveResults.push({
              name: business.name,
              success: !!saved,
              id: business.place_id,
              action: "inserted",
            });
          } else {
            saveResults.push({
              name: business.name,
              success: false,
              action: "already_exists",
            });
          }
        } catch (error) {
          console.error(`Failed to save ${business.name}:`, error);
          saveResults.push({
            name: business.name,
            success: false,
            error: error.message,
            action: "error",
          });
        }
      }
    }

    // Get updated count
    const countResult = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.json({
      success: true,
      schema: columnNames,
      searchQuery,
      businessesFound: data.results?.length || 0,
      saveResults,
      newDatabaseTotal: countResult.total,
      message:
        saveResults.filter((r) => r.success).length > 0
          ? "Successfully saved new businesses!"
          : "No new businesses saved (may already exist)",
    });
  } catch (error) {
    console.error("Correct save test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
