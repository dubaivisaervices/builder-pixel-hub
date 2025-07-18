import { RequestHandler } from "express";

export const debugVisaSearch: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    const query = "visa services Dubai";
    console.log(`🔍 Debug search: "${query}"`);

    // Try exact same URL structure as enhanced fetcher
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=25.2048,55.2708&radius=75000&key=${apiKey}`;

    console.log(`🌐 Full URL: ${searchUrl}`);

    const response = await fetch(searchUrl);
    const data = await response.json();

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📄 Response data:`, JSON.stringify(data, null, 2));

    // Also test if the enhanced fetcher endpoint is working
    const testFetchUrl = `${req.protocol}://${req.get("host")}/api/admin/fetch-google-businesses`;
    console.log(`🧪 Testing enhanced fetcher: ${testFetchUrl}`);

    const testResponse = await fetch(testFetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchQuery: query,
        maxResults: 5,
        radius: 75,
        minRating: 0,
        downloadImages: false,
        saveToDatabase: false,
        getReviews: false,
        skipExisting: false,
        filters: {
          companyName: null,
          category: "visa services",
          city: "Dubai",
        },
      }),
    });

    const testData = await testResponse.json();

    res.json({
      success: true,
      apiKey: `${apiKey.substring(0, 10)}...`,
      directApiCall: {
        url: searchUrl,
        status: data.status,
        resultsCount: data.results?.length || 0,
        errorMessage: data.error_message || null,
        results: data.results?.slice(0, 3) || [],
      },
      enhancedFetcherTest: {
        status: testResponse.status,
        data: testData,
      },
    });
  } catch (error) {
    console.error("🔥 Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
