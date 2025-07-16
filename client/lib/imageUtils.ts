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
    return fixImageDomain(imageData.s3Url);
  }

  if (imageData.url) {
    return fixImageDomain(imageData.url);
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
  // Skip S3 URLs and logo URLs that are likely to be missing
  // and go straight to reliable fallbacks

  // Use base64 if available (most reliable)
  if (business?.logo_base64) {
    return `data:image/jpeg;base64,${business.logo_base64}`;
  }

  // Generate industry-specific placeholder based on business category
  const category = (business as any)?.category?.toLowerCase() || "";

  if (category.includes("visa") || category.includes("immigration")) {
    return `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=200&fit=crop&crop=center&auto=format&q=80`;
  }

  if (category.includes("document") || category.includes("attestation")) {
    return `https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop&crop=center&auto=format&q=80`;
  }

  if (category.includes("pro") || category.includes("consulting")) {
    return `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center&auto=format&q=80`;
  }

  if (category.includes("education") || category.includes("student")) {
    return `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop&crop=center&auto=format&q=80`;
  }

  // Default business placeholder
  return `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&crop=center&auto=format&q=80`;
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
