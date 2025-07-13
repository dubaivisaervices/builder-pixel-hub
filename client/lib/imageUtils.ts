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
  // Emergency: Block known corrupted S3 URLs - these are from expired Google Maps sources
  const knownCorruptedUrls = [
    "http://localhost:8080/api/s3-image/businesses/ChIJgYqjUtZCXz4R-srTBS-LusM/logos/1752379060492-6e89728a.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJ1QRXFLVfXz4RAnONevOCQ9k/logos/1752379061236-d5e0d8b3.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJR70_9Q45Xj4RD2J3ZQ8IOic/logos/1752379062650-bd0f06c3.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJPz6dfpJDXz4RxCwPZLFjH2w/logos/1752379064046-4197260b.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJC4MLMlBDXz4R0yAHb8zE0AE/logos/1752379065672-ed23c322.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJXf_UeQBDXz4ROdLA_nZbQmA/logos/1752379066240-af0d3895.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJMYbJfdZfXz4RkCdjmKuamlg/logos/1752379066616-b391943f.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJNZfl8B5DXz4RnGnIZAZg7Q8/logos/1752379066980-2745c9b3.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJ0aY_sp9rXz4R43lrWnaG4Sg/logos/1752379067339-8feb2e04.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJcY7Ys0BdXz4RJn98ygTZms8/logos/1752379067800-57cdc0a3.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJS28CJahDXz4RB1C_AwGsPAI/logos/1752379068215-b961db06.jpg",
    "http://localhost:8080/api/s3-image/businesses/ChIJQ0XzUUlDXz4R25AxYOfATaI/logos/1752379068579-4aaf4f6a.jpg",
  ];

  if (business?.logoS3Url && knownCorruptedUrls.includes(business.logoS3Url)) {
    console.warn("🚫 BLOCKED corrupted S3 URL:", business.logoS3Url);
    business.logoS3Url = undefined; // Clear it
  }

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
