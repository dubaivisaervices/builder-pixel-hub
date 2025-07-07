import { RequestHandler } from "express";

interface GooglePlacesResponse {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    user_ratings_total?: number;
    types: string[];
    business_status: string;
    photos?: Array<{
      photo_reference: string;
    }>;
    opening_hours?: {
      open_now: boolean;
    };
    price_level?: number;
  }>;
  status: string;
  next_page_token?: string;
}

interface BusinessData {
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
  isOpen?: boolean;
  priceLevel?: number;
}

// Dubai visa/immigration service categories to search
const DUBAI_VISA_CATEGORIES = [
  "visa consulting services Dubai UAE",
  "immigration consultants Dubai UAE",
  "visa services Dubai UAE",
  "visa agent Dubai UAE",
  "immigration services Dubai UAE",
  "travel agents Dubai UAE",
  "travel agency Dubai UAE",
  "visa agency Dubai UAE",
];

export const searchDubaiVisaServices: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log("API Key configured:", !!apiKey);

    if (!apiKey) {
      console.error("Google Places API key not found in environment variables");
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    const allBusinesses: BusinessData[] = [];
    const processedPlaceIds = new Set<string>();
    let totalRequests = 0;
    let successfulRequests = 0;

    // Search each category
    for (const category of DUBAI_VISA_CATEGORIES) {
      try {
        totalRequests++;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category)}&key=${apiKey}`;

        console.log(`Searching category: ${category}`);
        const response = await fetch(searchUrl);
        const data: GooglePlacesResponse = await response.json();

        console.log(`API Response for ${category}:`, {
          status: data.status,
          resultCount: data.results?.length || 0,
        });

        if (data.status === "OK" && data.results) {
          successfulRequests++;
          // Process results and avoid duplicates
          data.results.forEach((place) => {
            if (!processedPlaceIds.has(place.place_id)) {
              processedPlaceIds.add(place.place_id);

              const business: BusinessData = {
                id: place.place_id,
                name: place.name,
                address: place.formatted_address,
                location: {
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng,
                },
                rating: place.rating || 0,
                reviewCount: place.user_ratings_total || 0,
                category: category.replace(" Dubai UAE", ""),
                businessStatus: place.business_status,
                photoReference: place.photos?.[0]?.photo_reference,
                isOpen: place.opening_hours?.open_now,
                priceLevel: place.price_level,
              };

              allBusinesses.push(business);
            }
          });
        } else if (data.status === "ZERO_RESULTS") {
          console.log(`No results found for category: ${category}`);
        } else {
          console.error(`API Error for ${category}:`, data.status);
        }

        // Add small delay between requests to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error searching category ${category}:`, error);
        // Continue with other categories
      }
    }

    console.log(
      `Search completed: ${successfulRequests}/${totalRequests} successful requests`,
    );
    console.log(`Total unique businesses found: ${allBusinesses.length}`);

    // Sort by rating and review count
    const sortedBusinesses = allBusinesses.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });

    res.json({
      businesses: sortedBusinesses,
      total: sortedBusinesses.length,
      categories: DUBAI_VISA_CATEGORIES.map((cat) =>
        cat.replace(" Dubai UAE", ""),
      ),
    });
  } catch (error) {
    console.error("Error fetching Dubai visa services:", error);
    res.status(500).json({
      error: "Failed to fetch business data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getBusinessDetails: RequestHandler = async (req, res) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,reviews,rating,user_ratings_total&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === "OK") {
      res.json(data.result);
    } else {
      res.status(404).json({ error: "Business not found" });
    }
  } catch (error) {
    console.error("Error fetching business details:", error);
    res.status(500).json({
      error: "Failed to fetch business details",
    });
  }
};

export const getBusinessPhoto: RequestHandler = async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxwidth = 400 } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
      });
    }

    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoReference}&maxwidth=${maxwidth}&key=${apiKey}`;

    // Return the photo URL for client to use directly
    res.json({ photoUrl });
  } catch (error) {
    console.error("Error getting business photo:", error);
    res.status(500).json({
      error: "Failed to get business photo",
    });
  }
};
