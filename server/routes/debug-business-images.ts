import { Request, Response } from "express";
import { database } from "../database/database";

export const debugBusinessImages = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    const business = await database.get(
      `SELECT 
        name, 
        logo_url, 
        logo_base64,
        photos_json,
        photos_local_json,
        CASE 
          WHEN logo_base64 IS NOT NULL THEN LENGTH(logo_base64)
          ELSE 0 
        END as logo_base64_size,
        CASE 
          WHEN photos_local_json IS NOT NULL THEN LENGTH(photos_local_json)
          ELSE 0 
        END as photos_local_size
      FROM businesses 
      WHERE id = ?`,
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const result = {
      name: business.name,
      logo_status: {
        has_logo_url: !!business.logo_url,
        logo_url: business.logo_url,
        has_logo_base64: !!business.logo_base64,
        logo_base64_size: business.logo_base64_size,
        logo_base64_preview: business.logo_base64
          ? business.logo_base64.substring(0, 50) + "..."
          : null,
      },
      photos_status: {
        has_photos_json: !!business.photos_json,
        photos_json_count: business.photos_json
          ? JSON.parse(business.photos_json).length
          : 0,
        has_photos_local_json: !!business.photos_local_json,
        photos_local_size: business.photos_local_size,
        photos_local_count: business.photos_local_json
          ? JSON.parse(business.photos_local_json).length
          : 0,
      },
    };

    res.json(result);
  } catch (error) {
    console.error("Error debugging business images:", error);
    res.status(500).json({ error: "Failed to debug images" });
  }
};
