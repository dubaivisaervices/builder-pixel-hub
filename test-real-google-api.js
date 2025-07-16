const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Test the exact Google Places API workflow
async function testRealGoogleWorkflow() {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

  if (!API_KEY) {
    console.error("❌ GOOGLE_PLACES_API_KEY not found in environment");
    return;
  }

  console.log("🚀 Testing Real Google Places API Workflow");
  console.log("==========================================");

  // Test business
  const testBusiness = {
    name: "Paradise Migration Dubai",
    location: "Dubai",
  };

  try {
    // Step 1: Find Place ID using Find Place API
    console.log("\n🔍 Step 1: Finding Place ID...");
    const searchQuery = `${testBusiness.name} ${testBusiness.location}`;

    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
    const findPlaceResponse = await axios.get(findPlaceUrl, {
      params: {
        input: searchQuery,
        inputtype: "textquery",
        fields: "place_id",
        key: API_KEY,
      },
    });

    console.log(`📋 Find Place API Status: ${findPlaceResponse.data.status}`);

    if (
      findPlaceResponse.data.status !== "OK" ||
      !findPlaceResponse.data.candidates.length
    ) {
      console.log("❌ No place found for:", searchQuery);
      return;
    }

    const placeId = findPlaceResponse.data.candidates[0].place_id;
    console.log(`✅ Found Place ID: ${placeId}`);

    // Step 2: Get Place Details (Photos) using Place Details API
    console.log("\n📸 Step 2: Getting Place Details & Photos...");

    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
    const placeDetailsResponse = await axios.get(placeDetailsUrl, {
      params: {
        place_id: placeId,
        fields: "name,photos",
        key: API_KEY,
      },
    });

    console.log(
      `📋 Place Details API Status: ${placeDetailsResponse.data.status}`,
    );

    if (
      placeDetailsResponse.data.status !== "OK" ||
      !placeDetailsResponse.data.result.photos
    ) {
      console.log("❌ No photos found for place ID:", placeId);
      return;
    }

    const photos = placeDetailsResponse.data.result.photos;
    console.log(
      `✅ Found ${photos.length} photos for ${placeDetailsResponse.data.result.name}`,
    );

    // Log photo details
    photos.forEach((photo, index) => {
      console.log(
        `   Photo ${index + 1}: ${photo.width}x${photo.height}, Ref: ${photo.photo_reference.substring(0, 20)}...`,
      );
    });

    // Step 3: Get Photo from Place Photos API
    console.log("\n⬬ Step 3: Downloading first photo...");

    const photoReference = photos[0].photo_reference;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo`;

    console.log(`📋 Photo Reference: ${photoReference.substring(0, 30)}...`);

    const photoResponse = await axios.get(photoUrl, {
      params: {
        maxwidth: 800,
        photo_reference: photoReference,
        key: API_KEY,
      },
      responseType: "stream",
      maxRedirects: 5,
    });

    console.log(`📋 Photo Response Status: ${photoResponse.status}`);
    console.log(
      `📋 Photo Content Type: ${photoResponse.headers["content-type"]}`,
    );
    console.log(
      `📋 Photo Content Length: ${photoResponse.headers["content-length"]}`,
    );

    // Step 4: Save the photo
    const tempDir = path.resolve(__dirname, "temp_test_images");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `test_${testBusiness.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.jpg`;
    const filePath = path.resolve(tempDir, fileName);
    const writer = fs.createWriteStream(filePath);

    photoResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", () => {
        const stats = fs.statSync(filePath);
        console.log(`✅ Photo saved: ${filePath}`);
        console.log(`📐 File size: ${stats.size} bytes`);

        // Validate JPEG format
        const buffer = fs.readFileSync(filePath);
        const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8;
        const hasEndMarker =
          buffer[buffer.length - 2] === 0xff &&
          buffer[buffer.length - 1] === 0xd9;

        console.log(
          `🔍 JPEG validation: Start OK: ${isJPEG}, End OK: ${hasEndMarker}`,
        );

        if (isJPEG && hasEndMarker) {
          console.log(
            "🎉 SUCCESS: Real business photo downloaded successfully!",
          );
        } else {
          console.log("⚠️  WARNING: Downloaded file may not be a valid JPEG");
        }

        resolve();
      });
      writer.on("error", reject);
    });

    console.log("\n🎯 REAL GOOGLE PLACES API WORKFLOW TEST COMPLETED");
    console.log("✅ All steps executed successfully");
    console.log("✅ Real business photo downloaded and validated");
  } catch (error) {
    console.error(
      "\n❌ Error in Real Google Places API workflow:",
      error.message,
    );

    if (error.response) {
      console.error(`📋 HTTP Status: ${error.response.status}`);
      console.error(`📋 Response:`, error.response.data);
    }
  }
}

// Run the test
testRealGoogleWorkflow().catch(console.error);
