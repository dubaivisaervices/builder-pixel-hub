const fs = require("fs");
const path = require("path");

try {
  // Read the complete businesses file
  const completeData = JSON.parse(
    fs.readFileSync("public/api/complete-businesses.json", "utf8"),
  );

  if (!completeData.businesses || !Array.isArray(completeData.businesses)) {
    throw new Error("Invalid businesses data structure");
  }

  // Take first 100 businesses and clean the data
  const businesses = completeData.businesses.slice(0, 100).map((business) => ({
    id: business.id || business.place_id,
    name: business.name || "Unknown Business",
    address: business.address || business.formatted_address || "",
    category: business.category || "Business Services",
    phone: business.phone || business.formatted_phone_number || "",
    website: business.website || "",
    rating: business.rating || business.google_rating || 4.0,
    reviewCount: business.reviewCount || business.user_ratings_total || 0,
    logoUrl: business.logoUrl || "",
    photos: business.photos || [],
  }));

  // Update the dubai-visa-services.json with 100 businesses
  fs.writeFileSync(
    "public/api/dubai-visa-services.json",
    JSON.stringify(businesses, null, 2),
  );

  console.log(`✅ Successfully extracted ${businesses.length} businesses`);
  console.log(
    `📊 File size: ${Math.round(fs.statSync("public/api/dubai-visa-services.json").size / 1024)}KB`,
  );
} catch (error) {
  console.error("❌ Error extracting businesses:", error.message);
}
