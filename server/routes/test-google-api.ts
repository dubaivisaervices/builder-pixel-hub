import { RequestHandler } from "express";

export const testGoogleAPI: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log("🔍 Testing Google Places API...");
    console.log(
      "🗝️ API Key:",
      apiKey ? `${apiKey.substring(0, 10)}...` : "NOT SET",
    );

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Test with a known place_id
    const testPlaceId = "ChIJ10c9E2ZDXz4Ru2NyjBi7aiE"; // From business data
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${testPlaceId}&fields=name,photos,formatted_address&key=${apiKey}`;

    console.log("🌐 Testing URL:", detailsUrl);

    const response = await fetch(detailsUrl);
    const data = await response.json();

    console.log("📊 Response status:", response.status);
    console.log("📄 API Response:", JSON.stringify(data, null, 2));

    // Test a simple photo fetch if photos exist
    let photoTest = null;
    if (data.status === "OK" && data.result?.photos?.length > 0) {
      const photoRef = data.result.photos[0].photo_reference;
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=400&key=${apiKey}`;
      console.log("📸 Testing photo URL:", photoUrl);

      try {
        const photoResponse = await fetch(photoUrl);
        photoTest = {
          status: photoResponse.status,
          ok: photoResponse.ok,
          contentType: photoResponse.headers.get("content-type"),
          size: photoResponse.headers.get("content-length"),
        };
        console.log("📸 Photo response:", photoTest);
      } catch (photoError) {
        photoTest = { error: photoError.message };
      }
    }

    res.json({
      success: true,
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : "NOT SET",
      testPlaceId,
      response: {
        status: response.status,
        data: data,
      },
      photoTest,
      analysis: {
        apiWorking: data.status === "OK",
        hasPhotos: data.result?.photos?.length > 0,
        photosCount: data.result?.photos?.length || 0,
        errorMessage: data.error_message || null,
        apiStatus: data.status,
      },
    });
  } catch (error) {
    console.error("❌ Google API test error:", error);
    res.status(500).json({
      success: false,
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
