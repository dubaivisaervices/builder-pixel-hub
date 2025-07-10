import { Request, Response } from "express";
import { database } from "../database/database";

export const serveCachedLogo = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    const business = await database.get(
      "SELECT logo_base64, name FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (!business.logo_base64) {
      return res.status(404).json({ error: "Logo not cached" });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(business.logo_base64, "base64");

    // Set appropriate headers
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", imageBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${business.name}-logo.jpg"`,
    );

    res.send(imageBuffer);
  } catch (error) {
    console.error("Error serving cached logo:", error);
    res.status(500).json({ error: "Failed to serve logo" });
  }
};

export const serveCachedPhoto = async (req: Request, res: Response) => {
  try {
    const { businessId, photoIndex } = req.params;

    const business = await database.get(
      "SELECT photos_local_json, name FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business || !business.photos_local_json) {
      return res.status(404).json({ error: "Photos not cached" });
    }

    const photos = JSON.parse(business.photos_local_json);
    const photoData = photos[parseInt(photoIndex)];

    if (!photoData) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(photoData, "base64");

    // Set appropriate headers
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", imageBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

    res.send(imageBuffer);
  } catch (error) {
    console.error("Error serving cached photo:", error);
    res.status(500).json({ error: "Failed to serve photo" });
  }
};
