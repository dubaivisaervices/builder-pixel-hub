const apiKey = "AIzaSyASVfDPlZhqvq1PsKfDKU7juI8MFARaTiE";

// Test with a known place_id from the database logs
const testPlaceId = "ChIJ10c9E2ZDXz4Ru2NyjBi7aiE"; // From the logs

async function testGoogleAPI() {
  console.log("🔍 Testing Google Places API...");

  try {
    // Test 1: Basic place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${testPlaceId}&fields=name,photos&key=${apiKey}`;
    console.log("🌐 Testing URL:", detailsUrl);

    const response = await fetch(detailsUrl);
    const data = await response.json();

    console.log("📊 Response status:", response.status);
    console.log("📄 Response data:", JSON.stringify(data, null, 2));

    if (data.status !== "OK") {
      console.log("❌ API Error:", data.status);
      console.log(
        "📝 Error message:",
        data.error_message || "No error message",
      );
    } else {
      console.log("✅ API working correctly");
      console.log("📸 Photos available:", data.result?.photos?.length || 0);
    }
  } catch (error) {
    console.error("💥 Network error:", error.message);
  }
}

testGoogleAPI();
