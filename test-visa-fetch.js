// Simple test to fetch visa services in Dubai
fetch("http://localhost:8080/api/admin/fetch-google-businesses", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    searchQuery: "visa services Dubai",
    maxResults: 5,
    radius: 50,
    minRating: 0,
    downloadImages: false,
    saveToDatabase: true,
    getReviews: false,
    skipExisting: false,
    filters: {
      companyName: null,
      category: "visa services",
      city: "Dubai",
    },
  }),
})
  .then((response) => response.json())
  .then((data) =>
    console.log("✅ Fetch result:", JSON.stringify(data, null, 2)),
  )
  .catch((error) => console.error("❌ Error:", error));
