import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fs from "fs";
import path from "path";

interface GooglePlace {
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
  business_status: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  formatted_phone_number?: string;
  website?: string;
  types: string[];
}

interface GoogleSearchResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
}

interface GoogleDetailsResponse {
  result: GooglePlace;
  status: string;
}

// Enhanced business fetcher with image downloading
export const fetchBusinessesWithImages: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Google Places API key not configured",
        success: false,
      });
    }

    const {
      searchQuery = "visa services Dubai",
      maxResults = 60,
      radius = 50,
      minRating = 0,
      downloadImages = true,
      saveToDatabase = true,
      getReviews = true,
      skipExisting = true,
      filters = {},
    } = req.body;

    // Extract advanced search filters
    const { companyName, category, city } = filters;

    console.log(`🔍 Starting enhanced business fetch with advanced filters:`);
    console.log(`   Search Query: "${searchQuery}"`);
    console.log(`   Company Name: ${companyName || "Any"}`);
    console.log(`   Category: ${category || "Any"}`);
    console.log(`   City: ${city || "Any"}`);
    console.log(
      `   Settings: maxResults=${maxResults}, radius=${radius}km, minRating=${minRating}`,
    );
    console.log(
      `   Options: downloadImages=${downloadImages}, saveToDatabase=${saveToDatabase}, getReviews=${getReviews}, skipExisting=${skipExisting}`,
    );

    const allBusinesses: any[] = [];
    let nextPageToken: string | undefined;
    let totalApiCalls = 0;
    let downloadedImages = 0;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads", "google-businesses");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Function to download and save image
    const downloadImage = async (
      url: string,
      filename: string,
    ): Promise<string | null> => {
      try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const buffer = await response.arrayBuffer();
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, Buffer.from(buffer));

        downloadedImages++;
        return `/uploads/google-businesses/${filename}`;
      } catch (error) {
        console.error(`Failed to download image: ${filename}`, error);
        return null;
      }
    };

    // Build enhanced search URL with city-specific coordinates
    const cityCoordinates = {
      Dubai: "25.2048,55.2708",
      "Abu Dhabi": "24.4539,54.3773",
      Sharjah: "25.3573,55.4033",
      Ajman: "25.4052,55.5136",
      Fujairah: "25.1208,56.3264",
      "Ras Al Khaimah": "25.7889,55.9439",
      "Umm Al Quwain": "25.5644,55.5555",
      "Al Ain": "24.2075,55.7464",
    };

    const location =
      city && cityCoordinates[city] ? cityCoordinates[city] : "25.2048,55.2708"; // Default to Dubai
    const searchRadius = radius * 1000; // Convert km to meters

    // Fetch businesses from Google Places
    for (let page = 0; page < 3 && allBusinesses.length < maxResults; page++) {
      const searchUrl = nextPageToken
        ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`
        : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${location}&radius=${searchRadius}&key=${apiKey}`;

      console.log(
        `📱 API Call ${totalApiCalls + 1}: Fetching page ${page + 1}`,
      );

      const searchResponse = await fetch(searchUrl);
      totalApiCalls++;

      if (!searchResponse.ok) {
        throw new Error(`Google API error: ${searchResponse.status}`);
      }

      const searchData: GoogleSearchResponse = await searchResponse.json();

      if (searchData.status !== "OK") {
        console.warn(`Google API warning: ${searchData.status}`);
        break;
      }

      // Process each business
      for (const place of searchData.results) {
        if (allBusinesses.length >= maxResults) break;

        try {
          console.log(`🏢 Processing: ${place.name}`);

          // Get detailed business information
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,photos,reviews,rating,user_ratings_total,business_status,geometry,types&key=${apiKey}`;

          const detailsResponse = await fetch(detailsUrl);
          totalApiCalls++;

          if (!detailsResponse.ok) continue;

          const detailsData: GoogleDetailsResponse =
            await detailsResponse.json();

          if (detailsData.status !== "OK" || !detailsData.result) continue;

          const details = detailsData.result;

          // Apply advanced filters
          let shouldSkip = false;

          // Filter by minimum rating
          if (
            minRating > 0 &&
            (!details.rating || details.rating < minRating)
          ) {
            console.log(
              `⏭️ Skipping ${details.name}: rating ${details.rating || 0} below minimum ${minRating}`,
            );
            shouldSkip = true;
          }

          // Filter by company name (if specified)
          if (companyName && companyName.trim()) {
            const nameMatch = details.name
              .toLowerCase()
              .includes(companyName.toLowerCase());
            if (!nameMatch) {
              console.log(
                `⏭️ Skipping ${details.name}: doesn't match company name filter "${companyName}"`,
              );
              shouldSkip = true;
            }
          }

          // Filter by city (if specified and not already in search query)
          if (
            city &&
            city.trim() &&
            !searchQuery.toLowerCase().includes(city.toLowerCase())
          ) {
            const addressMatch = details.formatted_address
              .toLowerCase()
              .includes(city.toLowerCase());
            if (!addressMatch) {
              console.log(
                `⏭️ Skipping ${details.name}: not in specified city "${city}"`,
              );
              shouldSkip = true;
            }
          }

          // Skip existing businesses if enabled
          if (skipExisting) {
            const existingBusiness = await businessService.getBusinessById(
              details.place_id,
            );
            if (existingBusiness) {
              console.log(
                `⏭️ Skipping ${details.name}: already exists in database`,
              );
              shouldSkip = true;
            }
          }

          if (shouldSkip) continue;

          // Determine business category (use filter category if specified)
          const businessTypes = details.types || [];
          let businessCategory = category || "visa services"; // Use filtered category if provided

          // If no specific category filter, determine from business types
          if (!category) {
            if (businessTypes.includes("travel_agency"))
              businessCategory = "travel agency";
            else if (businessTypes.includes("lawyer"))
              businessCategory = "immigration lawyer";
            else if (businessTypes.includes("government_office"))
              businessCategory = "government visa office";
            else if (businessTypes.includes("embassy"))
              businessCategory = "embassy visa services";
            else if (
              businessTypes.includes("school") ||
              businessTypes.includes("university")
            )
              businessCategory = "education visa";
            else if (businessTypes.includes("insurance_agency"))
              businessCategory = "immigration services";
            else if (businessTypes.includes("local_government_office"))
              businessCategory = "document clearance";
          }

          // Download logo and photos if enabled
          let logoUrl = "";
          const photos: string[] = [];

          if (downloadImages && details.photos && details.photos.length > 0) {
            // Download logo (first photo)
            const logoRef = details.photos[0].photo_reference;
            const logoGoogleUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${logoRef}&maxwidth=400&key=${apiKey}`;
            const logoFilename = `logo-${place.place_id}-${Date.now()}.jpg`;

            const downloadedLogo = await downloadImage(
              logoGoogleUrl,
              logoFilename,
            );
            if (downloadedLogo) {
              logoUrl = downloadedLogo;
            }

            // Download additional photos (up to 5)
            for (let i = 1; i < Math.min(details.photos.length, 6); i++) {
              const photoRef = details.photos[i].photo_reference;
              const photoGoogleUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=800&key=${apiKey}`;
              const photoFilename = `photo-${place.place_id}-${i}-${Date.now()}.jpg`;

              const downloadedPhoto = await downloadImage(
                photoGoogleUrl,
                photoFilename,
              );
              if (downloadedPhoto) {
                photos.push(downloadedPhoto);
              }
            }
          }

          // Create business data
          const businessData = {
            id: place.place_id,
            name: details.name,
            address: details.formatted_address || "",
            category: category,
            phone: details.formatted_phone_number || "",
            website: details.website || "",
            email: "", // Not available from Google API
            rating: details.rating || 4.0,
            reviewCount: details.user_ratings_total || 0,
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            businessStatus: details.business_status || "OPERATIONAL",
            logoUrl: logoUrl,
            photos: photos,
            reviews: details.reviews || [],
            hasTargetKeyword:
              details.name.toLowerCase().includes("visa") ||
              details.name.toLowerCase().includes("immigration") ||
              category.includes("visa"),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          allBusinesses.push(businessData);

          // Save to database if enabled
          if (saveToDatabase) {
            try {
              await businessService.createBusiness(businessData);
              console.log(`✅ Saved to database: ${businessData.name}`);
            } catch (dbError) {
              console.error(
                `❌ Database save failed for ${businessData.name}:`,
                dbError,
              );
            }
          }
        } catch (error) {
          console.error(`Error processing business ${place.name}:`, error);
        }
      }

      // Check for next page
      nextPageToken = searchData.next_page_token;
      if (!nextPageToken) break;

      // Google requires delay between page requests
      if (nextPageToken) {
        console.log("⏳ Waiting for next page token to become valid...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Response with summary
    const response = {
      success: true,
      message: `Successfully fetched ${allBusinesses.length} businesses`,
      summary: {
        totalBusinesses: allBusinesses.length,
        apiCallsUsed: totalApiCalls,
        imagesDownloaded: downloadedImages,
        estimatedCost: (totalApiCalls * 0.017).toFixed(2), // Rough Google API cost
        savedToDatabase: saveToDatabase,
      },
      businesses: allBusinesses.slice(0, 10), // Return first 10 for preview
      query: query,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `🎉 Fetch complete: ${allBusinesses.length} businesses, ${downloadedImages} images downloaded`,
    );
    res.json(response);
  } catch (error) {
    console.error("❌ Enhanced Google fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch businesses from Google API",
      details: error instanceof Error ? error.message : "Unknown error",
      success: false,
    });
  }
};

// Get available search categories
export const getSearchCategories: RequestHandler = async (req, res) => {
  const categories = [
    "visa services Dubai",
    "immigration services Dubai",
    "document clearance Dubai",
    "PRO services Dubai",
    "attestation services Dubai",
    "work permit services Dubai",
    "business visa Dubai",
    "tourist visa Dubai",
    "family visa Dubai",
    "golden visa services Dubai",
    "residence visa Dubai",
    "employment visa Dubai",
    "education visa Dubai",
    "travel agency Dubai",
    "embassy services Dubai",
  ];

  res.json({
    success: true,
    categories: categories,
    message: `${categories.length} search categories available`,
  });
};

// Check Google API status and usage
export const checkGoogleApiStatus: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        configured: false,
        status: "API key not configured",
        canFetch: false,
      });
    }

    // Test API with a simple request
    const testUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Dubai&key=${apiKey}`;
    const testResponse = await fetch(testUrl);
    const testData = await testResponse.json();

    res.json({
      configured: true,
      status: testData.status || "Unknown",
      canFetch: testData.status === "OK",
      apiKey: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      testResponse: {
        status: testData.status,
        resultsCount: testData.results?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      configured: false,
      status: "API test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      canFetch: false,
    });
  }
};
