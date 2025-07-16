/**
 * Utility functions for handling business images with S3 URL preference
 */

export interface ImageData {
  url?: string;
  s3Url?: string;
  base64?: string;
  caption?: string;
}

export interface BusinessImageData {
  logoUrl?: string;
  logoS3Url?: string;
  logo_base64?: string;
  photos?: ImageData[];
}

/**
 * Get the best available image URL, preferring S3, then original URL, then base64
 */
export function getBestImageUrl(imageData: ImageData): string | null {
  if (imageData.s3Url) {
    return imageData.s3Url;
  }

  if (imageData.url) {
    return imageData.url;
  }

  if (imageData.base64) {
    return `data:image/jpeg;base64,${imageData.base64}`;
  }

  return null;
}

/**
 * Fix domain issues in image URLs
 */
function fixImageDomain(url: string): string {
  if (!url) return url;

  // Fix common domain issues
  if (url.includes("crossbordersmigrations.com")) {
    return url.replace("crossbordersmigrations.com", "reportvisascam.com");
  }

  return url;
}

/**
 * Get the best available logo URL for a business
 */
export function getBestLogoUrl(business: BusinessImageData): string | null {
  // TEMPORARILY DISABLED - Testing if any S3 images actually work
  /*
  // Emergency: Block S3 URLs from corrupted batch (timestamp range 1752379060000-1752379100000)
  // These were uploaded from expired Google Maps sources and are corrupted
  if (business?.logoS3Url && business.logoS3Url.includes("/api/s3-image/")) {
    const timestampMatch = business.logoS3Url.match(/\/(\d{13})-/);
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1]);
      // Block URLs from the corrupted batch upload timeframe
      if (timestamp >= 1752379060000 && timestamp <= 1752379100000) {
        console.warn(
          "🚫 BLOCKED corrupted S3 URL from bad batch:",
          business.logoS3Url,
        );
        business.logoS3Url = undefined; // Clear it
      }
    }
  }
  */

  // Prefer S3 URL (now working!)
  if (business?.logoS3Url) {
    return business.logoS3Url;
  }

  // Fall back to base64 if available
  if (business?.logo_base64) {
    return `data:image/jpeg;base64,${business.logo_base64}`;
  }

  // Fall back to original logo URL as last resort (but skip expired Google Maps URLs)
  if (business?.logoUrl && !business.logoUrl.includes("maps.googleapis.com")) {
    return business.logoUrl;
  }

  // Return a default business logo for Dubai businesses
  if (business?.name) {
    return `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center`;
  }

  return null;
}

/**
 * Get processed photos with best available URLs
 */
export function getProcessedPhotos(business: BusinessImageData): Array<{
  url: string;
  caption?: string;
  isS3: boolean;
  isBase64: boolean;
}> {
  if (!business.photos || !Array.isArray(business.photos)) {
    return [];
  }

  return business.photos
    .map((photo) => {
      const bestUrl = getBestImageUrl(photo);
      if (!bestUrl) return null;

      return {
        url: bestUrl,
        caption: photo.caption,
        isS3: !!photo.s3Url,
        isBase64: bestUrl.startsWith("data:image/"),
      };
    })
    .filter((photo): photo is NonNullable<typeof photo> => photo !== null);
}

/**
 * Check if business has any images available
 */
export function hasAnyImages(business: BusinessImageData): boolean {
  const hasLogo = getBestLogoUrl(business) !== null;
  const hasPhotos = getProcessedPhotos(business).length > 0;
  return hasLogo || hasPhotos;
}

/**
 * Get image statistics for a business
 */
export function getImageStats(business: BusinessImageData): {
  totalImages: number;
  s3Images: number;
  localImages: number;
  base64Images: number;
  hasLogo: boolean;
  logoSource: "s3" | "url" | "base64" | "none";
} {
  const logoUrl = getBestLogoUrl(business);
  const photos = getProcessedPhotos(business);

  let logoSource: "s3" | "url" | "base64" | "none" = "none";
  if (business.logoS3Url) logoSource = "s3";
  else if (business.logoUrl) logoSource = "url";
  else if (business.logo_base64) logoSource = "base64";

  const s3Images =
    photos.filter((p) => p.isS3).length + (business.logoS3Url ? 1 : 0);
  const base64Images =
    photos.filter((p) => p.isBase64).length +
    (business.logo_base64 && !business.logoS3Url && !business.logoUrl ? 1 : 0);
  const localImages =
    photos.filter((p) => !p.isS3 && !p.isBase64).length +
    (business.logoUrl && !business.logoS3Url ? 1 : 0);

  return {
    totalImages: photos.length + (logoUrl ? 1 : 0),
    s3Images,
    localImages,
    base64Images,
    hasLogo: !!logoUrl,
    logoSource,
  };
}

/**
 * Format image URL for display (truncate long URLs)
 */
export function formatImageUrlForDisplay(
  url: string,
  maxLength: number = 50,
): string {
  if (url.length <= maxLength) return url;

  if (url.startsWith("data:image/")) {
    return "Base64 Image";
  }

  if (url.includes(".s3.") || url.includes("s3.amazonaws.com")) {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return `S3: .../${filename}`;
  }

  return url.substring(0, maxLength - 3) + "...";
}
