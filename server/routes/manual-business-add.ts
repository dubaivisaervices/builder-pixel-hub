import { Request, Response } from "express";
import { database } from "../database/database";

export async function addBusinessManually(req: Request, res: Response) {
  try {
    const { place_id, name, address, phone, website } = req.body;

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

    // Create basic business entry without API calls
    const businessData = {
      id: place_id,
      name: name || "Manual Addition - Name Pending",
      address: address || "Address to be updated",
      phone: phone || null,
      website: website || null,
      email: null,
      lat: null,
      lng: null,
      rating: null,
      review_count: 0,
      category: "business",
      business_status: "OPERATIONAL",
      photo_reference: null,
      logo_url: null,
      logo_base64: null,
      is_open: true,
      price_level: null,
      has_target_keyword: 1,
      hours_json: null,
      photos_json: null,
      photos_local_json: null,
    };

    // Insert business into database
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
        businessData.id,
        businessData.name,
        businessData.address,
        businessData.phone,
        businessData.website,
        businessData.email,
        businessData.lat,
        businessData.lng,
        businessData.rating,
        businessData.review_count,
        businessData.category,
        businessData.business_status,
        businessData.photo_reference,
        businessData.logo_url,
        businessData.logo_base64,
        businessData.is_open,
        businessData.price_level,
        businessData.has_target_keyword,
        businessData.hours_json,
        businessData.photos_json,
        businessData.photos_local_json,
      ],
    );

    // Add some basic sample reviews
    const sampleReviews = [
      {
        author_name: "Customer Review",
        rating: 4,
        text: "Good service. This review was added automatically for manual business addition.",
        time_ago: "1 month ago",
        profile_photo_url: "",
      },
      {
        author_name: "Business User",
        rating: 5,
        text: "Excellent experience. Please update with real reviews when available.",
        time_ago: "2 months ago",
        profile_photo_url: "",
      },
    ];

    // Insert sample reviews
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
          review.profile_photo_url,
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
      note: "Basic entry created. Use API-enabled addition for complete data including photos and detailed information.",
    });
  } catch (error) {
    console.error("Manual business addition error:", error);
    res.status(500).json({
      error: "Failed to add business manually",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateBusinessDetails(req: Request, res: Response) {
  try {
    const { place_id, name, address, phone, website, category } = req.body;

    if (!place_id) {
      return res.status(400).json({ error: "place_id is required" });
    }

    // Check if business exists
    const existingBusiness = await database.get(
      "SELECT id FROM businesses WHERE id = ?",
      [place_id],
    );

    if (!existingBusiness) {
      return res.status(404).json({
        error: "Business not found",
        solution: "Add the business first using manual addition",
      });
    }

    // Update business details
    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (address) {
      updates.push("address = ?");
      values.push(address);
    }
    if (phone) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (website) {
      updates.push("website = ?");
      values.push(website);
    }
    if (category) {
      updates.push("category = ?");
      values.push(category);
    }

    updates.push("updated_at = datetime('now')");
    values.push(place_id);

    if (updates.length > 1) {
      // More than just updated_at
      await database.run(
        `UPDATE businesses SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Business details updated successfully",
      business_id: place_id,
      updates_applied: updates.length - 1, // Exclude updated_at
    });
  } catch (error) {
    console.error("Update business details error:", error);
    res.status(500).json({
      error: "Failed to update business details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
