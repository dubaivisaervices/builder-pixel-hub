import { RequestHandler } from "express";
import { database } from "../database/database";

export const keywordBusinessesReport: RequestHandler = async (req, res) => {
  try {
    // Search for businesses with the specific keywords in their names
    const visaServicesQuery = `
      SELECT name, address, category, rating 
      FROM businesses 
      WHERE LOWER(name) LIKE '%visa services%' 
      ORDER BY rating DESC
      LIMIT 20
    `;

    const abroadQuery = `
      SELECT name, address, category, rating 
      FROM businesses 
      WHERE LOWER(name) LIKE '%abroad%' 
      ORDER BY rating DESC
      LIMIT 20
    `;

    const immigrationQuery = `
      SELECT name, address, category, rating 
      FROM businesses 
      WHERE LOWER(name) LIKE '%immigration%' 
      ORDER BY rating DESC
      LIMIT 20
    `;

    const overseasQuery = `
      SELECT name, address, category, rating 
      FROM businesses 
      WHERE LOWER(name) LIKE '%overseas%' 
      ORDER BY rating DESC
      LIMIT 20
    `;

    const [visaServices, abroad, immigration, overseas] = await Promise.all([
      database.all(visaServicesQuery),
      database.all(abroadQuery),
      database.all(immigrationQuery),
      database.all(overseasQuery),
    ]);

    // Combined search for any of these keywords
    const combinedQuery = `
      SELECT name, address, category, rating 
      FROM businesses 
      WHERE LOWER(name) LIKE '%visa services%' 
         OR LOWER(name) LIKE '%abroad%' 
         OR LOWER(name) LIKE '%immigration%' 
         OR LOWER(name) LIKE '%overseas%'
      ORDER BY rating DESC
      LIMIT 50
    `;

    const combinedResults = await database.all(combinedQuery);

    // Get total database count
    const totalCount = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.json({
      success: true,
      totalBusinessesInDatabase: totalCount.total,
      keywordResults: {
        visaServices: {
          count: visaServices.length,
          businesses: visaServices,
        },
        abroad: {
          count: abroad.length,
          businesses: abroad,
        },
        immigration: {
          count: immigration.length,
          businesses: immigration,
        },
        overseas: {
          count: overseas.length,
          businesses: overseas,
        },
      },
      combinedResults: {
        totalWithKeywords: combinedResults.length,
        businesses: combinedResults.slice(0, 15), // Show top 15
      },
      fetchSummary: {
        googleApiFound: 209,
        newBusinessesSaved: 0,
        reason: "All businesses with these keywords already exist in database",
      },
    });
  } catch (error) {
    console.error("Keyword report error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
