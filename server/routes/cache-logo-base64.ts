import { Request, Response } from "express";
import { database } from "../database/database";
import fetch from "node-fetch";

export const cacheLogoAsBase64 = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    // Get business with logo URL
    const business = await database.get(
      "SELECT id, name, logo_url FROM businesses WHERE id = ? AND logo_url IS NOT NULL",
      [businessId],
    );

    if (!business) {
      return res
        .status(404)
        .json({ error: "Business not found or no logo URL" });
    }

    if (!business.logo_url) {
      return res.status(400).json({ error: "No logo URL to cache" });
    }

    console.log(`📸 Downloading logo for ${business.name}...`);

    // Download the image
    const imageResponse = await fetch(business.logo_url);

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.buffer();
    const base64Image = imageBuffer.toString("base64");

    // Update database with base64 data
    await database.run("UPDATE businesses SET logo_base64 = ? WHERE id = ?", [
      base64Image,
      businessId,
    ]);

    console.log(
      `✅ Cached logo for ${business.name} (${imageBuffer.length} bytes)`,
    );

    res.json({
      success: true,
      message: `Logo cached for ${business.name}`,
      businessId,
      originalUrl: business.logo_url,
      cachedSize: imageBuffer.length,
      base64Preview: base64Image.substring(0, 50) + "...",
    });
  } catch (error) {
    console.error("Error caching logo:", error);
    res.status(500).json({
      error: "Failed to cache logo",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
