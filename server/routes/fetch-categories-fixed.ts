import { RequestHandler } from "express";
import { database } from "../database/database";

export const fetchCategoriesFixed: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Target categories as specified by user
    const categories = [
      "consultants in dubai",
      "abroad consultants in dubai",
      "overseas services in dubai",
      "visa services in dubai",
      // Add variations for better coverage
      "business consultants dubai",
      "immigration consultants dubai",
      "visa consultants dubai",
      "overseas education dubai",
    ];

    let totalSaved = 0;
    let totalFound = 0;
    let newBusinesses: string[] = [];
    let duplicatesSkipped = 0;

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 Fetching and permanently saving ${categories.length} business categories (FIXED SCHEMA)...\n\n`,
    );

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      res.write(
        `🔍 [${i + 1}/${categories.length}] Searching: "${category}"...\n`,
      );

      try {
        // Google Places API search
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category)}&location=25.2048,55.2708&radius=75000&key=${apiKey}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status === "OK" && data.results) {
          const businesses = data.results.slice(0, 20); // Get up to 20 per category
          totalFound += businesses.length;

          let savedCount = 0;
          let duplicateCount = 0;

          for (const business of businesses) {
            try {
              // Check if business already exists (by name or place_id)
              const existing = await database.get(
                "SELECT id FROM businesses WHERE name = ? OR id = ?",
                [business.name, business.place_id],
              );

              if (!existing) {
                // Save business with ONLY existing schema columns
                await database.run(
                  `
                  INSERT INTO businesses (
                    id, name, address, phone, website, email, lat, lng,
                    rating, review_count, category, business_status, 
                    created_at, updated_at
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                  [
                    business.place_id,
                    business.name,
                    business.formatted_address || "",
                    business.formatted_phone_number || "",
                    business.website || "",
                    "", // email
                    business.geometry?.location?.lat || 0,
                    business.geometry?.location?.lng || 0,
                    business.rating || 0,
                    business.user_ratings_total || 0,
                    category,
                    business.business_status || "OPERATIONAL",
                    new Date().toISOString(),
                    new Date().toISOString(),
                  ],
                );

                savedCount++;
                totalSaved++;
                newBusinesses.push(business.name);
                res.write(`   💾 SAVED: "${business.name}"\n`);
              } else {
                duplicateCount++;
                duplicatesSkipped++;
              }
            } catch (saveError) {
              res.write(
                `   ❌ SAVE ERROR: "${business.name}" - ${saveError.message}\n`,
              );
            }
          }

          res.write(
            `✅ [${i + 1}/${categories.length}] "${category}": Found ${businesses.length}, Saved ${savedCount} new, ${duplicateCount} duplicates\n`,
          );
        } else {
          res.write(
            `❌ [${i + 1}/${categories.length}] "${category}": ${data.status} - ${data.error_message || "No results"}\n`,
          );
        }
      } catch (error) {
        res.write(
          `❌ [${i + 1}/${categories.length}] "${category}": Error - ${error.message}\n`,
        );
      }

      // Delay between requests
      if (i < categories.length - 1) {
        res.write(`�� Waiting 2 seconds...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Get final database count
    const countResult = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.write(`\n🎉 PERMANENT SAVE COMPLETE!\n`);
    res.write(`📊 Total businesses found: ${totalFound}\n`);
    res.write(`💾 NEW businesses permanently saved: ${totalSaved}\n`);
    res.write(`🔄 Duplicates skipped: ${duplicatesSkipped}\n`);
    res.write(`📈 Current database total: ${countResult.total} businesses\n`);

    if (newBusinesses.length > 0) {
      res.write(`\n✨ NEW BUSINESSES PERMANENTLY ADDED:\n`);
      newBusinesses.slice(0, 15).forEach((business, index) => {
        res.write(`${index + 1}. ${business}\n`);
      });
      if (newBusinesses.length > 15) {
        res.write(`... and ${newBusinesses.length - 15} more businesses\n`);
      }
    }

    res.write(
      `\n🏢 Categories permanently saved to database with FIXED schema!`,
    );
    res.end();
  } catch (error) {
    console.error("Fixed fetch error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
