import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import path from "path";
import fs from "fs";

interface ImageLocation {
  type: "s3" | "local" | "hostinger" | "google" | "fallback";
  url: string;
  priority: number;
}

export const getBusinessImages: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;
    const imageType = (req.query.type as string) || "both"; // "logo", "photos", or "both"

    console.log(
      `🖼️ Fetching images for business ${businessId}, type: ${imageType}`,
    );

    // Get business data from database
    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found",
        businessId,
      });
    }

    const result: any = {
      success: true,
      businessId,
      businessName: business.name,
      images: {},
      sources: [],
    };

    // Get logo sources
    if (imageType === "logo" || imageType === "both") {
      result.images.logo = await getLogoSources(business);
    }

    // Get photo sources
    if (imageType === "photos" || imageType === "both") {
      result.images.photos = await getPhotoSources(business);
    }

    // Get all available sources
    result.sources = getAvailableSources(business);

    res.json(result);
  } catch (error) {
    console.error("Error fetching business images:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch business images",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

async function getLogoSources(business: any): Promise<ImageLocation[]> {
  const sources: ImageLocation[] = [];

  // 1. S3 URL (highest priority if available)
  if (business.logoS3Url) {
    sources.push({
      type: "s3",
      url: business.logoS3Url,
      priority: 1,
    });
  }

  // 2. Local uploaded images
  const localLogoPath = await findLocalLogo(business.id);
  if (localLogoPath) {
    sources.push({
      type: "local",
      url: `/uploads/business-images/${path.basename(localLogoPath)}`,
      priority: 2,
    });
  }

  // 3. Hostinger URL (check if exists)
  const hostingerLogoUrl = `https://reportvisascam.com/business-images/logos/logo-${business.id}.jpg`;
  if (await checkUrlExists(hostingerLogoUrl)) {
    sources.push({
      type: "hostinger",
      url: hostingerLogoUrl,
      priority: 3,
    });
  }

  // 4. Original Google Maps URL
  if (business.logoUrl && business.logoUrl.includes("googleusercontent.com")) {
    sources.push({
      type: "google",
      url: business.logoUrl,
      priority: 4,
    });
  }

  // 5. Fallback placeholder
  sources.push({
    type: "fallback",
    url: `/api/placeholder-logo/${encodeURIComponent(business.name)}`,
    priority: 5,
  });

  return sources.sort((a, b) => a.priority - b.priority);
}

async function getPhotoSources(business: any): Promise<ImageLocation[]> {
  const sources: ImageLocation[] = [];

  // 1. S3 Photos (highest priority)
  if (business.photosS3Urls && business.photosS3Urls.length > 0) {
    business.photosS3Urls.forEach((url: string, index: number) => {
      sources.push({
        type: "s3",
        url: url,
        priority: 1,
      });
    });
  }

  // 2. Local uploaded photos
  const localPhotos = await findLocalPhotos(business.id);
  localPhotos.forEach((photoPath, index) => {
    sources.push({
      type: "local",
      url: `/uploads/business-images/${path.basename(photoPath)}`,
      priority: 2,
    });
  });

  // 3. Hostinger photos
  for (let i = 1; i <= 5; i++) {
    const hostingerPhotoUrl = `https://reportvisascam.com/business-images/photos/photo_${i}-${business.id}.jpg`;
    if (await checkUrlExists(hostingerPhotoUrl)) {
      sources.push({
        type: "hostinger",
        url: hostingerPhotoUrl,
        priority: 3,
      });
    }
  }

  // 4. Original photos from business data
  if (business.photos && business.photos.length > 0) {
    business.photos.forEach((photo: any, index: number) => {
      let photoUrl = typeof photo === "string" ? photo : photo.url;
      if (photoUrl && photoUrl.includes("googleusercontent.com")) {
        sources.push({
          type: "google",
          url: photoUrl,
          priority: 4,
        });
      }
    });
  }

  return sources.sort((a, b) => a.priority - b.priority);
}

async function findLocalLogo(businessId: string): Promise<string | null> {
  const uploadDir = path.join(process.cwd(), "uploads", "business-images");

  if (!fs.existsSync(uploadDir)) {
    return null;
  }

  const files = fs.readdirSync(uploadDir);
  const logoFile = files.find(
    (file) =>
      file.startsWith(`logo-${businessId}`) &&
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
  );

  return logoFile ? path.join(uploadDir, logoFile) : null;
}

async function findLocalPhotos(businessId: string): Promise<string[]> {
  const uploadDir = path.join(process.cwd(), "uploads", "business-images");

  if (!fs.existsSync(uploadDir)) {
    return [];
  }

  const files = fs.readdirSync(uploadDir);
  const photoFiles = files.filter(
    (file) =>
      file.startsWith(`photo-${businessId}`) &&
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
  );

  return photoFiles.map((file) => path.join(uploadDir, file));
}

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function getAvailableSources(business: any): string[] {
  const sources = [];

  if (business.logoS3Url || business.photosS3Urls?.length > 0) {
    sources.push("s3");
  }

  if (business.logoUrl || business.photos?.length > 0) {
    sources.push("google");
  }

  sources.push("hostinger", "local", "fallback");

  return sources;
}

// Serve optimized image with multiple fallbacks
export const serveOptimizedImage: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;
    const imageType = (req.query.type as string) || "logo"; // "logo" or "photo"
    const photoIndex = parseInt(req.query.index as string) || 0;

    console.log(
      `🖼️ Serving optimized ${imageType} for business ${businessId}${imageType === "photo" ? `, index ${photoIndex}` : ""}`,
    );

    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    let imageUrl: string | null = null;

    if (imageType === "logo") {
      const logoSources = await getLogoSources(business);
      imageUrl = logoSources.length > 0 ? logoSources[0].url : null;
    } else if (imageType === "photo") {
      const photoSources = await getPhotoSources(business);
      imageUrl =
        photoSources.length > photoIndex ? photoSources[photoIndex].url : null;
    }

    if (!imageUrl) {
      return res.status(404).json({ error: "Image not found" });
    }

    // If it's a local URL, serve the file directly
    if (imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
        return;
      }
    }

    // If it's a proxy URL, redirect to it
    if (imageUrl.startsWith("/api/")) {
      res.redirect(imageUrl);
      return;
    }

    // For external URLs, redirect
    res.redirect(imageUrl);
  } catch (error) {
    console.error("Error serving optimized image:", error);
    res.status(500).json({ error: "Failed to serve image" });
  }
};

// Get image statistics
export const getImageStats: RequestHandler = async (req, res) => {
  try {
    console.log("📊 Generating image statistics...");

    const stats = {
      storage: {
        s3: 0,
        local: 0,
        hostinger: 0,
        google: 0,
        fallback: 0,
      },
      businesses: {
        withLogos: 0,
        withPhotos: 0,
        withS3Images: 0,
        withLocalImages: 0,
      },
      totalFiles: {
        logos: 0,
        photos: 0,
      },
    };

    // Get all businesses
    const businesses = await businessService.getAllBusinesses();

    for (const business of businesses) {
      const logoSources = await getLogoSources(business);
      const photoSources = await getPhotoSources(business);

      if (logoSources.length > 0) {
        stats.businesses.withLogos++;
        stats.totalFiles.logos++;

        // Count by storage type
        const primaryLogoSource = logoSources[0];
        stats.storage[primaryLogoSource.type]++;
      }

      if (photoSources.length > 0) {
        stats.businesses.withPhotos++;
        stats.totalFiles.photos += photoSources.length;
      }

      if (business.logoS3Url || business.photosS3Urls?.length > 0) {
        stats.businesses.withS3Images++;
      }

      // Check for local images
      const hasLocalLogo = await findLocalLogo(business.id);
      const localPhotos = await findLocalPhotos(business.id);
      if (hasLocalLogo || localPhotos.length > 0) {
        stats.businesses.withLocalImages++;
      }
    }

    res.json({
      success: true,
      stats,
      totalBusinesses: businesses.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating image stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate image statistics",
    });
  }
};
