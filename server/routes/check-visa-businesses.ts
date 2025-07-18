import { RequestHandler } from "express";
import { database } from "../database/database";

export const checkVisaBusinesses: RequestHandler = async (req, res) => {
  try {
    // Search for visa-related businesses in the database
    const query = `
      SELECT name, formatted_address, category, rating, place_id 
      FROM businesses 
      WHERE LOWER(name) LIKE '%visa%' 
         OR LOWER(name) LIKE '%immigration%' 
         OR LOWER(name) LIKE '%consultant%' 
         OR LOWER(name) LIKE '%permit%'
         OR LOWER(name) LIKE '%agent%'
         OR LOWER(category) LIKE '%visa%' 
         OR LOWER(category) LIKE '%immigration%' 
         OR LOWER(category) LIKE '%consultant%'
      ORDER BY rating DESC
      LIMIT 50
    `;

    const businesses = await database.query(query);

    // Get category stats
    const categoryQuery = `
      SELECT category, COUNT(*) as count 
      FROM businesses 
      WHERE LOWER(category) LIKE '%visa%' 
         OR LOWER(category) LIKE '%immigration%' 
         OR LOWER(category) LIKE '%consultant%'
         OR LOWER(category) LIKE '%permit%'
      GROUP BY category 
      ORDER BY count DESC
    `;

    const categoryStats = await database.query(categoryQuery);

    res.json({
      success: true,
      summary: {
        totalVisaRelatedBusinesses: businesses.length,
        categories: categoryStats,
      },
      sampleBusinesses: businesses.slice(0, 15),
      message: `Found ${businesses.length} visa-related businesses in database`,
    });
  } catch (error) {
    console.error("Check visa businesses error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
