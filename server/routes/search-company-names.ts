import { RequestHandler } from "express";
import { database } from "../database/database";

export const searchCompanyNames: RequestHandler = async (req, res) => {
  try {
    const companyNames = ["Bright door visa services", "the ambitions abroad"];

    const results = [];

    for (const companyName of companyNames) {
      // Search for exact match first
      const exactMatch = await database.get(
        "SELECT * FROM businesses WHERE LOWER(name) = LOWER(?)",
        [companyName],
      );

      // Search for partial matches
      const partialMatches = await database.all(
        "SELECT * FROM businesses WHERE LOWER(name) LIKE LOWER(?) LIMIT 10",
        [`%${companyName}%`],
      );

      // Search by individual keywords
      const keywords = companyName.toLowerCase().split(" ");
      let keywordMatches: any[] = [];

      for (const keyword of keywords) {
        if (keyword.length > 3) {
          // Only search meaningful keywords
          const matches = await database.all(
            "SELECT * FROM businesses WHERE LOWER(name) LIKE LOWER(?) LIMIT 5",
            [`%${keyword}%`],
          );
          keywordMatches = keywordMatches.concat(matches);
        }
      }

      // Remove duplicates from keyword matches
      const uniqueKeywordMatches = keywordMatches.filter(
        (match, index, self) =>
          index === self.findIndex((m) => m.id === match.id),
      );

      results.push({
        searchTerm: companyName,
        exactMatch: exactMatch || null,
        partialMatches,
        keywordMatches: uniqueKeywordMatches.slice(0, 10),
        found: !!(exactMatch || partialMatches.length > 0),
      });
    }

    res.json({
      success: true,
      searchResults: results,
      summary: {
        totalSearches: companyNames.length,
        companiesFound: results.filter((r) => r.found).length,
        companiesNotFound: results.filter((r) => !r.found).length,
      },
    });
  } catch (error) {
    console.error("Company search error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
