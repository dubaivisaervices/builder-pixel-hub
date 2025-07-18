import { RequestHandler } from "express";
import { database } from "../database/database";

export const checkVisaBusinesses: RequestHandler = async (req, res) => {
  try {
    // Search for visa-related businesses in the database
    const visaKeywords = [
      "%visa%",
      "%immigration%",
      "%consultant%",
      "%permit%",
      "%agent%",
    ];

    let allVisaBusinesses: any[] = [];

    for (const keyword of visaKeywords) {
      const businesses = database
        .prepare(
          `
        SELECT name, formatted_address, category, rating, place_id 
        FROM businesses 
        WHERE LOWER(name) LIKE LOWER(?) 
           OR LOWER(category) LIKE LOWER(?)
           OR LOWER(formatted_address) LIKE LOWER(?)
        ORDER BY rating DESC
        LIMIT 20
      `,
        )
        .all(keyword, keyword, keyword);

      allVisaBusinesses = allVisaBusinesses.concat(businesses);
    }

    // Remove duplicates based on place_id
    const uniqueBusinesses = allVisaBusinesses.filter(
      (business, index, self) =>
        index === self.findIndex((b) => b.place_id === business.place_id),
    );

    // Get category breakdown
    const categoryStats = database
      .prepare(
        `
      SELECT category, COUNT(*) as count 
      FROM businesses 
      WHERE LOWER(category) LIKE '%visa%' 
         OR LOWER(category) LIKE '%immigration%' 
         OR LOWER(category) LIKE '%consultant%'
         OR LOWER(category) LIKE '%permit%'
      GROUP BY category 
      ORDER BY count DESC
    `,
      )
      .all();

    res.json({
      success: true,
      summary: {
        totalVisaRelatedBusinesses: uniqueBusinesses.length,
        categories: categoryStats,
      },
      sampleBusinesses: uniqueBusinesses.slice(0, 15),
      message: `Found ${uniqueBusinesses.length} visa-related businesses in database`,
    });
  } catch (error) {
    console.error("Check visa businesses error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
