import { Request, Response } from "express";
import { createHostingerService } from "../services/hostingerUpload";

// REPLACE THESE WITH YOUR ACTUAL HOSTINGER CREDENTIALS
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "your-domain.com",
  user: process.env.HOSTINGER_FTP_USER || "your-ftp-username",
  password: process.env.HOSTINGER_FTP_PASSWORD || "your-ftp-password",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
  remotePath: "/public_html/business-images", // Path on your hosting server
  baseUrl: "https://your-domain.com/business-images", // Your domain URL
};

/**
 * Upload all business images from Google API to Hostinger
 */
export async function uploadAllImagesToHostinger(req: Request, res: Response) {
  try {
    console.log("🚀 Starting bulk upload to Hostinger...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const results = await hostingerService.uploadAllBusinessImages();

    console.log("✅ Bulk upload completed:", results);

    res.json({
      success: true,
      message: "Bulk upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload single business images to Hostinger
 */
export async function uploadBusinessToHostinger(req: Request, res: Response) {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID required" });
    }

    console.log(`🔄 Uploading business ${businessId} to Hostinger...`);

    const { database } = await import("../database/database");
    const business = await database.get(
      "SELECT id, name, logo_url, photos_json FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const results: { logoUrl?: string; photoUrls?: string[] } = {};

    // Upload logo
    if (business.logo_url && business.logo_url.startsWith("http")) {
      const logoBuffer = await hostingerService.downloadImage(
        business.logo_url,
      );
      results.logoUrl = await hostingerService.uploadBusinessLogo(
        logoBuffer,
        business.id,
        business.logo_url,
      );
    }

    // Upload photos
    if (business.photos_json) {
      const photos = JSON.parse(business.photos_json);
      const validPhotos = photos
        .filter((photo: any) => photo.url && photo.url.startsWith("http"))
        .slice(0, 6);

      if (validPhotos.length > 0) {
        const imageBuffers = await Promise.all(
          validPhotos.map(async (photo: any) => ({
            buffer: await hostingerService.downloadImage(photo.url),
            originalUrl: photo.url,
          })),
        );

        results.photoUrls = await hostingerService.uploadBusinessPhotos(
          imageBuffers,
          business.id,
        );
      }
    }

    // Update database
    if (results.logoUrl || results.photoUrls) {
      const { BusinessService } = await import("../database/businessService");
      const businessService = new BusinessService(database);

      await businessService.updateBusinessS3Urls(
        business.id,
        results.logoUrl,
        results.photoUrls?.map((url) => ({ s3Url: url })),
      );
    }

    res.json({
      success: true,
      business: business.name,
      results,
    });
  } catch (error) {
    console.error("❌ Single business upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Test Hostinger connection
 */
export async function testHostingerConnection(req: Request, res: Response) {
  try {
    const hostingerService = createHostingerService(HOSTINGER_CONFIG);

    // Test with a small dummy file
    const testBuffer = Buffer.from("Hostinger connection test");
    await hostingerService.uploadBusinessLogo(testBuffer, "test", "test.txt");

    res.json({
      success: true,
      message: "Hostinger connection successful",
      config: {
        host: HOSTINGER_CONFIG.host,
        user: HOSTINGER_CONFIG.user,
        baseUrl: HOSTINGER_CONFIG.baseUrl,
      },
    });
  } catch (error) {
    console.error("❌ Hostinger connection test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Please check your Hostinger FTP credentials",
    });
  }
}
