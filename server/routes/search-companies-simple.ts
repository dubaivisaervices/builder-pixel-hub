import { RequestHandler } from "express";
import { database } from "../database/database";

export const searchCompaniesSimple: RequestHandler = async (req, res) => {
  try {
    const companyNames = ["Bright door visa services", "the ambitions abroad"];

    const results = [];

    for (const companyName of companyNames) {
      console.log(`🔍 Searching for: "${companyName}"`);

      // Search for partial matches in name
      const nameMatches = await database.all(
        "SELECT name, address, category, rating FROM businesses WHERE LOWER(name) LIKE LOWER(?) LIMIT 10",
        [`%${companyName}%`],
      );

      // Search by keywords "bright", "door", "visa", "services", "ambitions", "abroad"
      const keywords = companyName.toLowerCase().split(" ");
      let keywordResults: any[] = [];

      for (const keyword of keywords) {
        if (keyword.length > 3) {
          const matches = await database.all(
            "SELECT name, address, category, rating FROM businesses WHERE LOWER(name) LIKE LOWER(?) LIMIT 5",
            [`%${keyword}%`],
          );
          keywordResults = keywordResults.concat(matches);
        }
      }

      // Remove duplicates
      const uniqueKeywordResults = keywordResults.filter(
        (match, index, self) =>
          index === self.findIndex((m) => m.name === match.name),
      );

      results.push({
        searchTerm: companyName,
        exactMatches: nameMatches,
        keywordMatches: uniqueKeywordResults.slice(0, 8),
        totalFound: nameMatches.length + uniqueKeywordResults.length,
      });

      console.log(
        `📊 Found ${nameMatches.length} exact matches and ${uniqueKeywordResults.length} keyword matches for "${companyName}"`,
      );
    }

    res.json({
      success: true,
      searchResults: results,
      message: "Company search completed",
    });
  } catch (error) {
    console.error("Simple company search error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
