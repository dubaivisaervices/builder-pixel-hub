import { RequestHandler } from "express";
import { database } from "../database/database";

export const fetchSpecificCompanies: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Specific company names to search for
    const companyNames = [
      "the ambitions abroad Dubai",
      "bright doors visa services Dubai",
      "center gulf overseas Dubai",
      "golden asia consultants Dubai",
      // Also try without Dubai suffix in case they're named differently
      "the ambitions abroad",
      "bright doors visa services",
      "center gulf overseas",
      "golden asia consultants",
    ];

    let totalSaved = 0;
    let totalFound = 0;
    let companiesFound: string[] = [];

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 Searching Google API for ${companyNames.length} specific company names...\n\n`,
    );

    for (let i = 0; i < companyNames.length; i++) {
      const companyName = companyNames[i];
      res.write(
        `🔍 [${i + 1}/${companyNames.length}] Searching: "${companyName}"...\n`,
      );

      try {
        // Direct Google Places API call with specific company name
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(companyName)}&location=25.2048,55.2708&radius=100000&key=${apiKey}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status === "OK" && data.results) {
          const businesses = data.results.slice(0, 5); // Get top 5 matches
          totalFound += businesses.length;

          let savedCount = 0;

          for (const business of businesses) {
            try {
              // Check if business already exists
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
                    "specific company search",
                    `Company found via specific search: ${companyName}`,
                  ],
                );

                savedCount++;
                totalSaved++;
                companiesFound.push(business.name);

                res.write(
                  `   📍 Found and saved: "${business.name}" at ${business.formatted_address}\n`,
                );
              } else {
                res.write(`   🔄 Already exists: "${business.name}"\n`);
              }
            } catch (dbError) {
              console.error(`Failed to save ${business.name}:`, dbError);
              res.write(`   ❌ Error saving: "${business.name}"\n`);
            }
          }

          if (businesses.length > 0) {
            res.write(
              `✅ [${i + 1}/${companyNames.length}] "${companyName}": Found ${businesses.length} businesses, Saved ${savedCount} new\n`,
            );
          } else {
            res.write(
              `❌ [${i + 1}/${companyNames.length}] "${companyName}": No results found\n`,
            );
          }
        } else {
          res.write(
            `❌ [${i + 1}/${companyNames.length}] "${companyName}": ${data.status} - ${data.error_message || "No results"}\n`,
          );
        }
      } catch (error) {
        res.write(
          `❌ [${i + 1}/${companyNames.length}] "${companyName}": Error - ${error.message}\n`,
        );
      }

      // Delay between requests
      if (i < companyNames.length - 1) {
        res.write(`⏳ Waiting 2 seconds...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Get updated business count
    const countResult = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.write(`\n🎉 SPECIFIC COMPANIES FETCH COMPLETE!\n`);
    res.write(`📊 Total businesses found: ${totalFound}\n`);
    res.write(`💾 New businesses saved: ${totalSaved}\n`);
    res.write(`📈 Current database total: ${countResult.total} businesses\n`);

    if (companiesFound.length > 0) {
      res.write(`\n✨ New companies added:\n`);
      companiesFound.forEach((company, index) => {
        res.write(`${index + 1}. ${company}\n`);
      });
    }

    res.write(`\n🏢 Target companies searched successfully!`);
    res.end();
  } catch (error) {
    console.error("Specific companies fetch error:", error);
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
