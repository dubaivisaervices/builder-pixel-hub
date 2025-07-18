import { RequestHandler } from "express";
import { database } from "../database/database";

export const fetchKeywordBusinesses: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Targeted search queries with specific keywords
    const searchQueries = [
      "visa services Dubai",
      "abroad services Dubai",
      "immigration services Dubai",
      "overseas services Dubai",
      "visa services center Dubai",
      "abroad consultation Dubai",
      "immigration consultant Dubai",
      "overseas travel Dubai",
      "visa processing Dubai",
      "immigration assistance Dubai",
      "abroad visa Dubai",
      "overseas immigration Dubai",
    ];

    let totalSaved = 0;
    let totalFound = 0;
    let duplicates = 0;

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 Starting keyword-based fetch for ${searchQueries.length} search terms...\n\n`,
    );

    for (let i = 0; i < searchQueries.length; i++) {
      const searchQuery = searchQueries[i];
      res.write(
        `🔍 [${i + 1}/${searchQueries.length}] Searching: "${searchQuery}"...\n`,
      );

      try {
        // Direct Google Places API call
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=25.2048,55.2708&radius=75000&key=${apiKey}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status === "OK" && data.results) {
          const businesses = data.results.slice(0, 20); // Get up to 20 per search
          totalFound += businesses.length;

          let savedCount = 0;
          let duplicateCount = 0;

          for (const business of businesses) {
            try {
              // Check if business already exists by name and address
              const existing = await database.get(
                "SELECT id FROM businesses WHERE name = ? OR (latitude = ? AND longitude = ?)",
                [
                  business.name,
                  business.geometry?.location?.lat || 0,
                  business.geometry?.location?.lng || 0,
                ],
              );

              if (!existing) {
                // Insert new business
                await database.run(
                  `
                  INSERT INTO businesses (
                    id, name, address, phone, website, latitude, longitude,
                    rating, user_ratings_total, business_status, category, description
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                  [
                    business.place_id,
                    business.name,
                    business.formatted_address || "",
                    business.formatted_phone_number || "",
                    business.website || "",
                    business.geometry?.location?.lat || 0,
                    business.geometry?.location?.lng || 0,
                    business.rating || 0,
                    business.user_ratings_total || 0,
                    business.business_status || "OPERATIONAL",
                    searchQuery.replace(" Dubai", ""),
                    `Business found via keyword search: ${searchQuery}`,
                  ],
                );

                savedCount++;
                totalSaved++;
              } else {
                duplicateCount++;
                duplicates++;
              }
            } catch (dbError) {
              console.error(
                `Failed to save business ${business.name}:`,
                dbError,
              );
            }
          }

          res.write(
            `✅ [${i + 1}/${searchQueries.length}] "${searchQuery}": Found ${businesses.length}, Saved ${savedCount} new, ${duplicateCount} duplicates\n`,
          );
        } else {
          res.write(
            `❌ [${i + 1}/${searchQueries.length}] "${searchQuery}": ${data.status} - ${data.error_message || "No results"}\n`,
          );
        }
      } catch (error) {
        res.write(
          `❌ [${i + 1}/${searchQueries.length}] "${searchQuery}": Error - ${error.message}\n`,
        );
      }

      // Delay between requests to avoid rate limiting
      if (i < searchQueries.length - 1) {
        res.write(`⏳ Waiting 2 seconds...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Get updated business count
    const countResult = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.write(`\n🎉 KEYWORD FETCH COMPLETE!\n`);
    res.write(`📊 Total businesses found: ${totalFound}\n`);
    res.write(`💾 New businesses saved: ${totalSaved}\n`);
    res.write(`🔄 Duplicates skipped: ${duplicates}\n`);
    res.write(`📈 Current database total: ${countResult.total} businesses\n`);
    res.write(
      `✨ Dubai businesses with visa services, abroad, immigration, overseas keywords added!\n`,
    );
    res.end();
  } catch (error) {
    console.error("Keyword fetch error:", error);
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
