const fs = require("fs");

try {
  // Read the complete businesses file
  console.log("📖 Reading complete businesses data...");
  const completeData = JSON.parse(
    fs.readFileSync("public/api/complete-businesses.json", "utf8"),
  );

  if (!completeData.businesses || !Array.isArray(completeData.businesses)) {
    throw new Error("Invalid businesses data structure");
  }

  const allBusinesses = completeData.businesses;
  console.log(`📊 Total businesses found: ${allBusinesses.length}`);

  // Split into chunks of 50 businesses each
  const chunkSize = 50;
  const chunks = [];

  for (let i = 0; i < allBusinesses.length; i += chunkSize) {
    chunks.push(allBusinesses.slice(i, i + chunkSize));
  }

  console.log(
    `📦 Created ${chunks.length} chunks of ${chunkSize} businesses each`,
  );

  // Create chunk files
  chunks.forEach((chunk, index) => {
    const chunkNumber = index + 1;
    const filename = `public/api/business-chunk-${chunkNumber}.json`;

    // Clean and format the business data
    const cleanedBusinesses = chunk.map((business) => ({
      id: business.id || business.place_id,
      name: business.name || "Unknown Business",
      address: business.address || business.formatted_address || "",
      category: business.category || business.type || "Business Services",
      phone: business.phone || business.formatted_phone_number || "",
      website: business.website || "",
      rating: business.rating || business.google_rating || 4.0,
      reviewCount: business.reviewCount || business.user_ratings_total || 0,
      logoUrl: business.logoUrl || "",
      logoS3Url: business.logoS3Url || "",
      photos: business.photos || [],
    }));

    fs.writeFileSync(filename, JSON.stringify(cleanedBusinesses, null, 2));

    const fileSize = Math.round(fs.statSync(filename).size / 1024);
    console.log(
      `✅ Created ${filename} - ${cleanedBusinesses.length} businesses (${fileSize}KB)`,
    );
  });

  // Create an index file that lists all chunks
  const chunkIndex = {
    totalBusinesses: allBusinesses.length,
    totalChunks: chunks.length,
    businessesPerChunk: chunkSize,
    chunks: chunks.map((chunk, index) => ({
      chunkNumber: index + 1,
      filename: `business-chunk-${index + 1}.json`,
      businessCount: chunk.length,
      firstBusiness: chunk[0]?.name || "Unknown",
      lastBusiness: chunk[chunk.length - 1]?.name || "Unknown",
    })),
  };

  fs.writeFileSync(
    "public/api/business-chunks-index.json",
    JSON.stringify(chunkIndex, null, 2),
  );
  console.log(
    `📋 Created business-chunks-index.json with ${chunks.length} chunk references`,
  );

  // Update the initial load file with first 50 businesses
  fs.writeFileSync(
    "public/api/dubai-visa-services.json",
    JSON.stringify(chunks[0], null, 2),
  );
  console.log(
    `🔄 Updated dubai-visa-services.json with first ${chunks[0].length} businesses`,
  );

  console.log(
    "\n🎉 SUCCESS! All business data has been split into manageable chunks.",
  );
  console.log(
    `📈 Total: ${allBusinesses.length} businesses across ${chunks.length} files`,
  );
  console.log(
    `💾 Each file is approximately ${Math.round(fs.statSync("public/api/business-chunk-1.json").size / 1024)}KB`,
  );
} catch (error) {
  console.error("❌ Error creating business chunks:", error.message);
  process.exit(1);
}
