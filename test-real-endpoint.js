const axios = require("axios");

async function testRealGoogleEndpoint() {
  try {
    console.log("🧪 Testing Real Google Places API endpoint...");

    const response = await axios.post(
      "http://localhost:8080/api/admin/upload-all-real-google-to-hostinger",
      {},
      {
        timeout: 30000,
      },
    );

    console.log("✅ Response received:");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log("❌ API Error Response:");
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("❌ Request Error:", error.message);
    }
  }
}

testRealGoogleEndpoint();
