export interface BusinessData {
  id: string;
  name: string;
  address: string;
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
  photos?: Array<{
    id: number;
    url: string;
    caption: string;
  }>;
  isOpen?: boolean;
  priceLevel?: number;
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
