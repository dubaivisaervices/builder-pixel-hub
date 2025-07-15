const fetch = require("node-fetch");

async function checkStatus() {
  try {
    const response = await fetch("http://localhost:8080/api/database-status");
    const data = await response.json();
    console.log("📊 BUSINESS STATUS:");
    console.log("Total businesses:", data.businessCount);

    // Check upload status
    const testResponse = await fetch(
      "http://localhost:8080/api/admin/debug-s3-status",
    );
    const testData = await testResponse.json();
    console.log("With logos:", testData.stats.with_logo_s3);
    console.log("With photos:", testData.stats.with_photos_s3);
    console.log(
      "Coverage:",
      Math.round((testData.stats.with_logo_s3 / data.businessCount) * 100) +
        "%",
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkStatus();
