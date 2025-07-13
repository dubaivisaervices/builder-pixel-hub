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
 * Get the best available logo URL for a business
 */
export function getBestLogoUrl(business: BusinessImageData): string | null {
  // For now, only use base64 images (working) until S3 uploads are fixed
  if (business.logo_base64) {
    return `data:image/jpeg;base64,${business.logo_base64}`;
  }

  // All other sources (S3, Google Maps) are currently failing
  // Return null to show placeholder initials
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
