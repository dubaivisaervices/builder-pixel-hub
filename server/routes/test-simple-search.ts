import { RequestHandler } from "express";

export const testSimpleSearch: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Test with very simple, common search terms
    const testQueries = [
      "restaurants Dubai",
      "hotels Dubai",
      "visa services Dubai",
      "immigration Dubai",
      "Dubai visa center",
    ];

    const results = [];

    for (const query of testQueries) {
      console.log(`🔍 Testing search: "${query}"`);

      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=25.2048,55.2708&radius=50000&key=${apiKey}`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      console.log(
        `📊 ${query}: ${data.status}, ${data.results?.length || 0} results`,
      );

      results.push({
        query,
        status: data.status,
        resultsCount: data.results?.length || 0,
        errorMessage: data.error_message || null,
        firstResult: data.results?.[0]?.name || null,
      });
    }

    res.json({
      success: true,
      apiKey: `${apiKey.substring(0, 10)}...`,
      testResults: results,
    });
  } catch (error) {
    console.error("🔥 Test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
