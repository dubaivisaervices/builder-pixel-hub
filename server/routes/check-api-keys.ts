import { Request, Response } from "express";
import { database } from "../database/database";

export async function checkOldApiKeys(req: Request, res: Response) {
  try {
    // Check for old API key in logo_url
    const oldLogoKeys = await database.all(`
      SELECT COUNT(*) as count
      FROM businesses
      WHERE logo_url LIKE '%AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk%'
    `);

    // Check for old API key in photos_json
    const oldPhotoKeys = await database.all(`
      SELECT COUNT(*) as count
      FROM businesses
      WHERE photos_json LIKE '%AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk%'
    `);

    // Get a sample business with old key
    const sampleBusiness = await database.get(`
      SELECT id, name, logo_url
      FROM businesses
      WHERE logo_url LIKE '%AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk%'
      LIMIT 1
    `);

    res.json({
      oldLogoKeys: oldLogoKeys[0].count,
      oldPhotoKeys: oldPhotoKeys[0].count,
      sampleBusiness,
    });
  } catch (error) {
    console.error("Error checking API keys:", error);
    res.status(500).json({ error: "Failed to check API keys" });
  }
}

export async function updateOldApiKeys(req: Request, res: Response) {
  try {
    const newApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!newApiKey) {
      return res.status(400).json({ error: "No new API key configured" });
    }

    // Update logo_url with old API key
    const logoUpdate = await database.run(
      `
      UPDATE businesses
      SET logo_url = REPLACE(logo_url, 'AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk', ?)
      WHERE logo_url LIKE '%AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk%'
    `,
      [newApiKey],
    );

    // Update photos_json with old API key
    const photoUpdate = await database.run(
      `
      UPDATE businesses
      SET photos_json = REPLACE(photos_json, 'AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk', ?)
      WHERE photos_json LIKE '%AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk%'
    `,
      [newApiKey],
    );

    res.json({
      success: true,
      logoUpdates: logoUpdate.changes,
      photoUpdates: photoUpdate.changes,
      message: `Updated ${logoUpdate.changes} logo URLs and ${photoUpdate.changes} photo records`,
    });
  } catch (error) {
    console.error("Error updating API keys:", error);
    res.status(500).json({ error: "Failed to update API keys" });
  }
}
