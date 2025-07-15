import { Request, Response } from "express";

export async function testGoogleAPI(req: Request, res: Response) {
  try {
    const { database } = await import("../database/database");

    // Get sample businesses with photo references
    const businesses = await database.all(`
      SELECT id, name, photo_reference, lat, lng, address 
      FROM businesses 
      WHERE photo_reference IS NOT NULL 
      LIMIT 5
    `);

    console.log(
      "🔍 Found businesses with photo references:",
      businesses.length,
    );

    const testResults = {
      businessesWithPhotos: businesses.length,
      tests: [],
      apiKey: process.env.GOOGLE_PLACES_API_KEY ? "Configured" : "Missing",
    };

    if (businesses.length > 0 && process.env.GOOGLE_PLACES_API_KEY) {
      const testBusiness = businesses[0];
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      // Test 1: Direct photo URL with existing photo reference
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${testBusiness.photo_reference}&key=${apiKey}`;

      console.log("🧪 Testing existing photo reference...");
      try {
        const response = await fetch(photoUrl);
        testResults.tests.push({
          test: "Existing Photo Reference",
          business: testBusiness.name,
          photoReference: testBusiness.photo_reference.substring(0, 50) + "...",
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          url: photoUrl,
        });
      } catch (error) {
        testResults.tests.push({
          test: "Existing Photo Reference",
          business: testBusiness.name,
          error: error.message,
          success: false,
        });
      }

      // Test 2: Search for the business and get new photos
      console.log("🔍 Testing Places search...");
      const searchQuery = encodeURIComponent(
        `${testBusiness.name} ${testBusiness.address || "Dubai"}`,
      );
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;

      try {
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        const searchResult = {
          test: "Places Search",
          business: testBusiness.name,
          query: `${testBusiness.name} ${testBusiness.address || "Dubai"}`,
          status: searchData.status,
          resultsCount: searchData.results ? searchData.results.length : 0,
          success: searchData.status === "OK",
        };

        if (
          searchData.status === "OK" &&
          searchData.results &&
          searchData.results.length > 0
        ) {
          const result = searchData.results[0];
          searchResult.foundName = result.name;
          searchResult.placeId = result.place_id;
          searchResult.photosCount = result.photos ? result.photos.length : 0;

          // Test new photo reference if available
          if (result.photos && result.photos.length > 0) {
            const newPhotoRef = result.photos[0].photo_reference;
            const newPhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${newPhotoRef}&key=${apiKey}`;

            try {
              const newPhotoResponse = await fetch(newPhotoUrl);
              searchResult.newPhotoTest = {
                photoReference: newPhotoRef.substring(0, 50) + "...",
                status: newPhotoResponse.status,
                statusText: newPhotoResponse.statusText,
                success: newPhotoResponse.ok,
                url: newPhotoUrl,
              };
            } catch (error) {
              searchResult.newPhotoTest = {
                error: error.message,
                success: false,
              };
            }
          }
        }

        testResults.tests.push(searchResult);
      } catch (error) {
        testResults.tests.push({
          test: "Places Search",
          business: testBusiness.name,
          error: error.message,
          success: false,
        });
      }
    }

    res.json({
      success: true,
      testResults,
      businesses: businesses.map((b) => ({
        id: b.id,
        name: b.name,
        hasPhotoReference: !!b.photo_reference,
        photoRefPreview: b.photo_reference
          ? b.photo_reference.substring(0, 30) + "..."
          : null,
      })),
    });
  } catch (error) {
    console.error("❌ Google API test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
