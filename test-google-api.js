const Database = require("better-sqlite3");

async function testGoogleAPI() {
  const db = new Database("database.db");

  // Get sample businesses with photo references
  const businesses = db
    .prepare(
      `
    SELECT id, name, photo_reference, lat, lng, address 
    FROM businesses 
    WHERE photo_reference IS NOT NULL 
    LIMIT 5
  `,
    )
    .all();

  console.log("🔍 Sample businesses with photo references:");
  businesses.forEach((b) => {
    console.log(`ID: ${b.id}, Name: ${b.name}`);
    console.log(`Photo ref: ${b.photo_reference?.substring(0, 60)}...`);
    console.log(`Location: ${b.lat}, ${b.lng}`);
    console.log("---");
  });

  if (businesses.length > 0) {
    const testBusiness = businesses[0];
    const apiKey = "AIzaSyCwZZ5L0cSLawqyj26QCd4qN6Y9r6a5tXs";

    // Test photo URL with real photo reference
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${testBusiness.photo_reference}&key=${apiKey}`;

    console.log("\n🧪 Testing Google Places Photo API:");
    console.log(`Photo URL: ${photoUrl}`);

    try {
      const response = await fetch(photoUrl);
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log("Headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        console.log("✅ Success! Photo API is working");
      } else {
        console.log("❌ Failed to fetch photo");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    // Test Places search for the same business
    console.log("\n🔍 Testing Google Places Search:");
    const searchQuery = encodeURIComponent(
      `${testBusiness.name} ${testBusiness.address || ""}`,
    );
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;

    try {
      const response = await fetch(searchUrl);
      const data = await response.json();
      console.log(`Search Status: ${data.status}`);

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log(`Found: ${result.name}`);
        console.log(`Place ID: ${result.place_id}`);
        console.log(
          `Photos available: ${result.photos ? result.photos.length : 0}`,
        );

        if (result.photos && result.photos.length > 0) {
          const newPhotoRef = result.photos[0].photo_reference;
          const newPhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${newPhotoRef}&key=${apiKey}`;

          console.log("\n🧪 Testing new photo reference from search:");
          console.log(`New photo URL: ${newPhotoUrl}`);

          const photoResponse = await fetch(newPhotoUrl);
          console.log(
            `New photo status: ${photoResponse.status} ${photoResponse.statusText}`,
          );
        }
      } else {
        console.log("❌ No search results found");
      }
    } catch (error) {
      console.error("❌ Search error:", error.message);
    }
  }

  db.close();
}

testGoogleAPI().catch(console.error);
