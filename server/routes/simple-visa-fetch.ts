import { RequestHandler } from "express";
import { database } from "../database/database";

export const simpleVisaFetch: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    const categories = [
      "visa agent Dubai",
      "consultants Dubai",
      "visa consulting services Dubai",
      "work visa agent Dubai",
      "immigration consultant Dubai",
      "visa services Dubai",
    ];

    let totalSaved = 0;
    let totalFound = 0;

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 Starting simplified fetch for ${categories.length} visa categories...\n\n`,
    );

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      res.write(
        `🔍 [${i + 1}/${categories.length}] Fetching: ${category}...\n`,
      );

      try {
        // Direct Google Places API call
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category)}&location=25.2048,55.2708&radius=50000&key=${apiKey}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status === "OK" && data.results) {
          const businesses = data.results.slice(0, 15); // Limit to 15 per category
          totalFound += businesses.length;

          let savedCount = 0;

          for (const business of businesses) {
            try {
              // Check if business already exists
              const existing = database
                .prepare("SELECT id FROM businesses WHERE place_id = ?")
                .get(business.place_id);

              if (!existing) {
                // Insert new business
                const insertStmt = database.prepare(`
                  INSERT INTO businesses (
                    place_id, name, formatted_address, latitude, longitude,
                    rating, user_ratings_total, business_status, category
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                insertStmt.run(
                  business.place_id,
                  business.name,
                  business.formatted_address || "",
                  business.geometry?.location?.lat || 0,
                  business.geometry?.location?.lng || 0,
                  business.rating || 0,
                  business.user_ratings_total || 0,
                  business.business_status || "OPERATIONAL",
                  category.replace(" Dubai", ""),
                );

                savedCount++;
                totalSaved++;
              }
            } catch (dbError) {
              console.error(
                `Failed to save business ${business.name}:`,
                dbError,
              );
            }
          }

          res.write(
            `✅ [${i + 1}/${categories.length}] ${category}: Found ${businesses.length}, Saved ${savedCount} new businesses\n`,
          );
        } else {
          res.write(
            `❌ [${i + 1}/${categories.length}] ${category}: ${data.status} - ${data.error_message || "No results"}\n`,
          );
        }
      } catch (error) {
        res.write(
          `❌ [${i + 1}/${categories.length}] ${category}: Error - ${error.message}\n`,
        );
      }

      // Delay between requests
      if (i < categories.length - 1) {
        res.write(`⏳ Waiting 2 seconds...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    res.write(`\n🎉 FETCH COMPLETE!\n`);
    res.write(`📊 Total businesses found: ${totalFound}\n`);
    res.write(`💾 Total businesses saved: ${totalSaved}\n`);
    res.write(`✨ Dubai visa businesses successfully added to database!\n`);
    res.end();
  } catch (error) {
    console.error("Simple fetch error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
