/**
 * Utility functions for consistent URL generation across the application
 */

interface Business {
  id: string;
  name: string;
  address?: string;
}

/**
 * Creates a URL-friendly slug from a string
 * Consistent across the entire application
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters but keep spaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Extracts location from business address
 * Defaults to "dubai" if no location found
 */
export function extractLocationSlug(address: string = ""): string {
  const locationMap: { [key: string]: string } = {
    dubai: "dubai",
    "abu dhabi": "abu-dhabi",
    sharjah: "sharjah",
    ajman: "ajman",
    fujairah: "fujairah",
    "ras al khaimah": "ras-al-khaimah",
    "umm al quwain": "umm-al-quwain",
    "al ain": "al-ain",
  };

  const addressLower = address.toLowerCase();

  // Check for each city in the address
  for (const [city, slug] of Object.entries(locationMap)) {
    if (addressLower.includes(city)) {
      return slug;
    }
  }

  return "dubai"; // Default fallback
}

/**
 * Creates a modern profile URL for a business
 * Consistent URL generation used across all components
 */
export function createBusinessProfileUrl(business: Business): string {
  const locationSlug = extractLocationSlug(business.address);
  const nameSlug = createSlug(business.name);

  return `/modern-profile/${locationSlug}/${nameSlug}`;
}

/**
 * Creates a company redirect URL for a business
 * Used when you have business ID but want to redirect to profile
 */
export function createCompanyRedirectUrl(businessId: string): string {
  return `/company/${businessId}`;
}

/**
 * Validates and normalizes a URL slug
 */
export function normalizeSlug(slug: string): string {
  return createSlug(slug);
}

/**
 * Gets business ID from various URL patterns
 */
export function extractBusinessIdFromUrl(url: string): string | null {
  // Match /company/:id pattern
  const companyMatch = url.match(/\/company\/([^\/]+)/);
  if (companyMatch) {
    return companyMatch[1];
  }

  // Could add more patterns here if needed
  return null;
}

/**
 * Creates a shareable URL for a business
 */
export function createShareableUrl(
  business: Business,
  baseUrl: string = "",
): string {
  const profileUrl = createBusinessProfileUrl(business);
  return `${baseUrl}${profileUrl}`;
}
