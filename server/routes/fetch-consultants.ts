import { RequestHandler } from "express";
import { database } from "../database/database";

export const fetchConsultants: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Consultant search queries for Dubai
    const consultantQueries = [
      "consultants Dubai",
      "business consultants Dubai",
      "management consultants Dubai",
      "financial consultants Dubai",
      "legal consultants Dubai",
      "tax consultants Dubai",
      "accounting consultants Dubai",
      "consultant services Dubai",
      "consulting firm Dubai",
      "advisory services Dubai",
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
      `🚀 Starting consultant businesses fetch for ${consultantQueries.length} search terms...\n\n`,
    );

    for (let i = 0; i < consultantQueries.length; i++) {
      const searchQuery = consultantQueries[i];
      res.write(
        `🔍 [${i + 1}/${consultantQueries.length}] Searching: "${searchQuery}"...\n`,
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
              // Check if business already exists by name
              const existing = await database.get(
                "SELECT id FROM businesses WHERE name = ?",
                [business.name],
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
                    `Consultant business in Dubai: ${business.types?.join(", ") || ""}`,
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
                `Failed to save consultant ${business.name}:`,
                dbError,
              );
            }
          }

          res.write(
            `✅ [${i + 1}/${consultantQueries.length}] "${searchQuery}": Found ${businesses.length}, Saved ${savedCount} new, ${duplicateCount} duplicates\n`,
          );
        } else {
          res.write(
            `❌ [${i + 1}/${consultantQueries.length}] "${searchQuery}": ${data.status} - ${data.error_message || "No results"}\n`,
          );
        }
      } catch (error) {
        res.write(
          `❌ [${i + 1}/${consultantQueries.length}] "${searchQuery}": Error - ${error.message}\n`,
        );
      }

      // Delay between requests
      if (i < consultantQueries.length - 1) {
        res.write(`⏳ Waiting 2 seconds...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Get updated business count
    const countResult = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.write(`\n🎉 CONSULTANTS FETCH COMPLETE!\n`);
    res.write(`📊 Total consultant businesses found: ${totalFound}\n`);
    res.write(`💾 New consultant businesses saved: ${totalSaved}\n`);
    res.write(`🔄 Duplicates skipped: ${duplicates}\n`);
    res.write(`📈 Current database total: ${countResult.total} businesses\n`);
    res.write(`✨ Dubai consultant businesses successfully added!\n`);
    res.end();
  } catch (error) {
    console.error("Consultants fetch error:", error);
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
