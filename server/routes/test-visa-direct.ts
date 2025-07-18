import { RequestHandler } from "express";

export const testVisaDirect: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    const query = "visa agent Dubai";
    console.log(`🔍 Direct test for: "${query}"`);

    // Direct Google Places API call
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=25.2048,55.2708&radius=50000&key=${apiKey}`;

    console.log(`🌐 API URL: ${searchUrl}`);

    const response = await fetch(searchUrl);
    const data = await response.json();

    console.log(`📊 Response:`, {
      status: data.status,
      resultsCount: data.results?.length || 0,
      error: data.error_message || null,
    });

    // Get first few business names
    const businessNames =
      data.results?.slice(0, 5).map((r: any) => ({
        name: r.name,
        address: r.formatted_address,
        rating: r.rating,
        place_id: r.place_id,
      })) || [];

    res.json({
      success: true,
      query,
      apiResponse: {
        status: data.status,
        resultsCount: data.results?.length || 0,
        errorMessage: data.error_message || null,
        businesses: businessNames,
      },
      rawStatusAndTotal: {
        status: data.status,
        total: data.results?.length || 0,
      },
    });
  } catch (error) {
    console.error("🔥 Direct test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
