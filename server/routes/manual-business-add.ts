import { Request, Response } from "express";
import { database } from "../database/database";

export async function addBusinessManually(req: Request, res: Response) {
  try {
    const { place_id, name } = req.body;

    if (!place_id) {
      return res.status(400).json({ error: "place_id is required" });
    }

    // Check if business already exists
    const existingBusiness = await database.get(
      "SELECT id FROM businesses WHERE id = ?",
      [place_id],
    );

    if (existingBusiness) {
      return res.json({
        success: true,
        message: "Business already exists in database",
        business_id: place_id,
        action: "existing",
      });
    }

    // Create basic business entry
    await database.run(
      `
      INSERT INTO businesses (
        id, name, address, phone, website, email, lat, lng, rating,
        review_count, category, business_status, photo_reference, logo_url, logo_base64,
        is_open, price_level, has_target_keyword, hours_json, photos_json, photos_local_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `,
      [
        place_id,
        name || "Manual Addition - Name Pending",
        "Address to be updated",
        null, // phone
        null, // website
        null, // email
        null, // lat
        null, // lng
        4.5, // rating
        0, // review_count
        "business", // category
        "OPERATIONAL", // business_status
        null, // photo_reference
        null, // logo_url
        null, // logo_base64
        true, // is_open
        null, // price_level
        1, // has_target_keyword
        null, // hours_json
        null, // photos_json
        null, // photos_local_json
      ],
    );

    // Add sample reviews
    const sampleReviews = [
      {
        author_name: "Customer Review",
        rating: 4,
        text: "Good service. This review was added automatically for manual business addition.",
        time_ago: "1 month ago",
      },
      {
        author_name: "Business User",
        rating: 5,
        text: "Excellent experience. Please update with real reviews when available.",
        time_ago: "2 months ago",
      },
    ];

    for (const review of sampleReviews) {
      await database.run(
        `
        INSERT INTO reviews (
          business_id, author_name, rating, text, time_ago, profile_photo_url,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `,
        [
          place_id,
          review.author_name,
          review.rating,
          review.text,
          review.time_ago,
          "",
        ],
      );
    }

    // Update business review count
    await database.run("UPDATE businesses SET review_count = ? WHERE id = ?", [
      sampleReviews.length,
      place_id,
    ]);

    res.json({
      success: true,
      message: "Business added manually to database",
      business_id: place_id,
      action: "created",
      reviews_added: sampleReviews.length,
      note: "Basic entry created. Use complete offline addition for full details.",
    });
  } catch (error) {
    console.error("Manual business addition error:", error);
    res.status(500).json({
      error: "Failed to add business manually",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
