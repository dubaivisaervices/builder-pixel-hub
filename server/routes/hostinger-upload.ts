import { Request, Response } from "express";
import { createHostingerService } from "../services/hostingerUpload";
import { createSimpleGoogleImageFetcher } from "../services/simpleGoogleImageFetcher";
import { createCachedImageUploader } from "../services/cachedImageUploader";
import { createGooglePhotoProxy } from "../services/googlePhotoProxy";
import { createBase64ToHostingerUploader } from "../services/base64ToHostingerUploader";
import { createImprovedGoogleImageFetcher } from "../services/improvedGoogleImageFetcher";
import { createHybridGoogleImageFetcher } from "../services/hybridGoogleImageFetcher";

// Hostinger FTP Configuration
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "crossbordersmigrations.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.crossborder1120",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
  remotePath: "/public_html/business-images", // Path on your hosting server
  baseUrl: "https://crossbordersmigrations.com/business-images", // Your domain URL
};

/**
 * Upload all business images from Google Places API to Hostinger (IMPROVED METHOD)
 */
export async function uploadAllImprovedGoogleImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🚀 Starting IMPROVED Google Places bulk fetch and upload to Hostinger...",
    );

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googleFetcher = createImprovedGoogleImageFetcher(
      apiKey,
      hostingerService,
    );

    const results = await googleFetcher.processAllBusinesses();

    console.log("✅ Improved Google Places bulk upload completed:", results);

    res.json({
      success: true,
      message: "Improved Google Places bulk upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Improved Google Places bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images from Google Places API to Hostinger (OLD METHOD)
 */
export async function uploadAllGoogleImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log(
      "🚀 Starting Google Places bulk fetch and upload to Hostinger...",
    );

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googleFetcher = createSimpleGoogleImageFetcher(
      apiKey,
      hostingerService,
    );

    const results = await googleFetcher.processAllBusinesses();

    console.log("✅ Google Places bulk upload completed:", results);

    res.json({
      success: true,
      message: "Google Places bulk upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Google Places bulk upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images via base64 storage to Hostinger (WORKING METHOD)
 */
export async function uploadAllBase64ToHostinger(req: Request, res: Response) {
  try {
    console.log("🚀 Starting base64 → Hostinger upload process...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const base64Uploader = createBase64ToHostingerUploader(hostingerService);

    const results =
      await base64Uploader.processAllBusinessesBase64ToHostinger();

    console.log("✅ Base64 → Hostinger upload completed:", results);

    res.json({
      success: true,
      message: "Base64 → Hostinger upload completed successfully",
      results,
    });
  } catch (error) {
    console.error("❌ Base64 → Hostinger upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images using Google Photos proxy to Hostinger (FAILING METHOD)
 */
export async function uploadAllGooglePhotosToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    console.log("🚀 Starting Google Photos proxy upload to Hostinger...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googlePhotoProxy = createGooglePhotoProxy(apiKey, hostingerService);

    const results = await googlePhotoProxy.processAllBusinessesWithProxy();

    console.log("✅ Google Photos proxy upload completed:", results);

    res.json({
      success: true,
      message: "Google Photos proxy upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Google Photos proxy upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images from cached data to Hostinger (NO DATA AVAILABLE)
 */
export async function uploadAllCachedImagesToHostinger(
  req: Request,
  res: Response,
) {
  try {
    console.log("🚀 Starting cached image upload to Hostinger...");

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const cachedUploader = createCachedImageUploader(hostingerService);

    const results = await cachedUploader.processAllCachedBusinessImages();

    console.log("✅ Cached image upload completed:", results);

    res.json({
      success: true,
      message: "Cached image upload to Hostinger completed",
      results,
    });
  } catch (error) {
    console.error("❌ Cached image upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload all business images from existing database URLs to Hostinger (OLD METHOD)
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
 * Upload single business images from Google Places to Hostinger (NEW METHOD)
 */
export async function uploadBusinessGoogleToHostinger(
  req: Request,
  res: Response,
) {
  try {
    const { businessId } = req.params;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID required" });
    }

    if (!apiKey) {
      return res.status(400).json({
        error: "Google Places API key not configured",
      });
    }

    console.log(
      `🔄 Uploading business ${businessId} from Google Places to Hostinger...`,
    );

    const { database } = await import("../database/database");
    const business = await database.get(
      "SELECT id, name, place_id, photo_reference, lat, lng, address FROM businesses WHERE id = ?",
      [businessId],
    );

    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const hostingerService = createHostingerService(HOSTINGER_CONFIG);
    const googleFetcher = createSimpleGoogleImageFetcher(
      apiKey,
      hostingerService,
    );

    const result = await googleFetcher.processBusinessImages(business);

    // Update database
    if (result.logoUrl || result.photoUrls.length > 0) {
      const { BusinessService } = await import("../database/businessService");
      const businessService = new BusinessService(database);

      if (result.logoUrl) {
        await businessService.updateBusinessLogo(business.id, result.logoUrl);
      }

      if (result.photoUrls.length > 0) {
        await businessService.updateBusinessPhotos(
          business.id,
          result.photoUrls,
        );
      }
    }

    res.json({
      success: true,
      business: business.name,
      result,
    });
  } catch (error) {
    console.error("❌ Single business Google Places upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Upload single business images to Hostinger (OLD METHOD - from existing URLs)
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
