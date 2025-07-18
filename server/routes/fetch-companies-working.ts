import { RequestHandler } from "express";
import { database } from "../database/database";

export const fetchCompaniesWorking: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Target companies you requested
    const companyNames = [
      "the ambitions abroad Dubai",
      "bright doors visa services Dubai",
      "center gulf overseas Dubai",
      "golden asia consultants Dubai",
    ];

    let totalSaved = 0;
    let totalFound = 0;
    let companiesAdded: string[] = [];

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(`🚀 Fetching companies with CORRECT database schema...\n\n`);

    for (let i = 0; i < companyNames.length; i++) {
      const companyName = companyNames[i];
      res.write(
        `🔍 [${i + 1}/${companyNames.length}] Searching: "${companyName}"...\n`,
      );

      try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(companyName)}&location=25.2048,55.2708&radius=100000&key=${apiKey}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status === "OK" && data.results) {
          const businesses = data.results.slice(0, 3);
          totalFound += businesses.length;

          for (const business of businesses) {
            try {
              // Check if exists
              const existing = await database.get(
                "SELECT id FROM businesses WHERE name = ? OR id = ?",
                [business.name, business.place_id],
              );

              if (!existing) {
                // Insert with CORRECT schema columns
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
                    "visa/immigration services",
                    business.business_status || "OPERATIONAL",
                    new Date().toISOString(),
                    new Date().toISOString(),
                  ],
                );

                totalSaved++;
                companiesAdded.push(business.name);
                res.write(`   ✅ SAVED: "${business.name}"\n`);
              } else {
                res.write(`   🔄 EXISTS: "${business.name}"\n`);
              }
            } catch (saveError) {
              res.write(
                `   ❌ SAVE ERROR: "${business.name}" - ${saveError.message}\n`,
              );
            }
          }

          res.write(
            `✅ [${i + 1}/${companyNames.length}] Found ${businesses.length} businesses for "${companyName}"\n`,
          );
        } else {
          res.write(
            `❌ [${i + 1}/${companyNames.length}] No results for "${companyName}": ${data.status}\n`,
          );
        }
      } catch (error) {
        res.write(
          `❌ [${i + 1}/${companyNames.length}] Error: ${error.message}\n`,
        );
      }

      if (i < companyNames.length - 1) {
        res.write(`⏳ Waiting 2 seconds...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Get final count
    const countResult = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.write(`\n🎉 COMPANIES FETCH COMPLETE!\n`);
    res.write(`📊 Total businesses found: ${totalFound}\n`);
    res.write(`💾 NEW businesses saved: ${totalSaved}\n`);
    res.write(`📈 Database total: ${countResult.total} businesses\n`);

    if (companiesAdded.length > 0) {
      res.write(`\n✨ NEW COMPANIES ADDED:\n`);
      companiesAdded.forEach((company, index) => {
        res.write(`${index + 1}. ${company}\n`);
      });
    }

    res.write(`\n🔧 Database schema issue FIXED!`);
    res.end();
  } catch (error) {
    console.error("Working fetch error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
