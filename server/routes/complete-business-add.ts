import { Request, Response } from "express";
import { database } from "../database/database";

export const addCompleteBusiness = async (req: Request, res: Response) => {
  try {
    const {
      id,
      name,
      address,
      phone,
      email,
      website,
      rating,
      category,
      description,
      hours_json,
      logo_url,
      photos_json,
      reviews,
      business_status,
      is_open,
      lat,
      lng,
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        error: "Business name and address are required",
      });
    }

    // Insert business
    await database.run(
      `INSERT INTO businesses (
        id, name, address, phone, email, website, lat, lng, rating, 
        category, business_status, logo_url, is_open, hours_json, 
        photos_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        id,
        name,
        address,
        phone || null,
        email || null,
        website || null,
        lat || 25.2048,
        lng || 55.2708,
        rating || 5,
        category || "General Business",
        business_status || "OPERATIONAL",
        logo_url || null,
        is_open ? 1 : 0,
        hours_json || null,
        JSON.stringify(photos_json) || null,
      ],
    );

    // Add reviews if provided
    if (reviews && Array.isArray(reviews)) {
      for (const review of reviews) {
        await database.run(
          `INSERT INTO reviews (
            id, business_id, author_name, rating, text, time_ago, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            `review_${id}_${Date.now()}_${Math.random()}`,
            id,
            review.author || "Anonymous",
            review.rating || 5,
            review.text || "Great service!",
            "1 week ago",
          ],
        );
      }
    }

    res.json({
      success: true,
      message: `Business "${name}" added successfully with complete details`,
      businessId: id,
    });
  } catch (error) {
    console.error("Error adding complete business:", error);
    res.status(500).json({
      error: "Failed to add business to database",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
