export interface BusinessReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  timeAgo: string;
  profilePhotoUrl?: string;
}

export interface BusinessData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  category: string;
  businessStatus: string;
  photoReference?: string;
  logoUrl?: string;
  logoBase64?: string; // Base64 encoded logo for offline use
  logoS3Url?: string; // S3 URL for logo
  photosS3Urls?: string[]; // Array of S3 URLs for photos
  photos?: Array<{
    id: number;
    url: string;
    caption: string;
    s3Url?: string; // S3 URL for this photo
  }>;
  photosLocal?: Array<{
    id: number;
    base64: string;
    caption: string;
  }>; // Base64 encoded photos for offline use
  hours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  isOpen?: boolean;
  priceLevel?: number;
  hasTargetKeyword?: boolean;
  reviews?: BusinessReview[];
}

export interface BusinessSearchResponse {
  businesses: BusinessData[];
  total: number;
  categories: string[];
}

export interface BusinessDetails {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      close: { day: number; time: string };
      open: { day: number; time: string };
    }>;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  rating: number;
  user_ratings_total: number;
}
