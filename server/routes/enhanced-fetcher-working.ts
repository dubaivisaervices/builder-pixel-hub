import { RequestHandler } from "express";
import { database } from "../database/database";
import fs from "fs";
import path from "path";

export const enhancedFetcherWorking: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    // Create directories for storing images
    const photosDir = path.join(process.cwd(), "uploads", "business-photos");
    const logosDir = path.join(process.cwd(), "uploads", "business-logos");

    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }

    // Test with sample businesses
    const testQueries = [
      "Universal Blue Ocean Consultant Dubai",
      "AURION Business Setup Consultants Dubai",
      "Bright Doors Visa Services Dubai",
    ];

    let totalProcessed = 0;
    let totalEnhanced = 0;
    let totalPhotos = 0;
    let totalReviews = 0;

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 ENHANCED FETCHER - Compatible with existing database schema\n\n`,
    );

    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      res.write(
        `🔍 [${i + 1}/${testQueries.length}] Processing: "${query}"...\n`,
      );

      try {
        // Step 1: Search for the business
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=25.2048,55.2708&radius=50000&key=${apiKey}`;

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.status === "OK" && searchData.results.length > 0) {
          const business = searchData.results[0];
          res.write(`   📍 Found: ${business.name}\n`);

          // Step 2: Get detailed information including reviews
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,business_status&key=${apiKey}`;

          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          if (detailsData.status === "OK" && detailsData.result) {
            const details = detailsData.result;
            let photosDownloaded: string[] = [];
            let logoUrl = "";

            // Step 3: Download business photos
            if (details.photos && details.photos.length > 0) {
              res.write(
                `   📸 Downloading ${Math.min(details.photos.length, 3)} photos...\n`,
              );

              for (let j = 0; j < Math.min(details.photos.length, 3); j++) {
                try {
                  const photoRef = details.photos[j].photo_reference;
                  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=600&key=${apiKey}`;

                  const photoResponse = await fetch(photoUrl);
                  if (photoResponse.ok) {
                    const photoBuffer = await photoResponse.arrayBuffer();
                    const photoFileName = `${business.place_id}_photo_${j + 1}.jpg`;
                    const photoPath = path.join(photosDir, photoFileName);

                    fs.writeFileSync(photoPath, Buffer.from(photoBuffer));
                    photosDownloaded.push(
                      `/uploads/business-photos/${photoFileName}`,
                    );
                    totalPhotos++;

                    // First photo might be a logo
                    if (j === 0) {
                      logoUrl = `/uploads/business-photos/${photoFileName}`;
                    }

                    res.write(`     ✅ Downloaded photo ${j + 1}\n`);
                  }
                } catch (photoError) {
                  res.write(`     ❌ Photo ${j + 1} download failed\n`);
                }
              }
            }

            // Step 4: Process reviews
            const reviews = details.reviews || [];
            totalReviews += reviews.length;
            res.write(`   📝 Found ${reviews.length} reviews\n`);

            // Step 5: Update database with existing schema columns only
            try {
              const existing = await database.get(
                "SELECT id FROM businesses WHERE id = ? OR name = ?",
                [business.place_id, business.name],
              );

              if (existing) {
                // Update with enhanced data using only existing columns
                await database.run(
                  `
                  UPDATE businesses SET 
                    name = ?, address = ?, phone = ?, website = ?,
                    lat = ?, lng = ?, rating = ?, review_count = ?,
                    business_status = ?, logo_url = ?, photos_json = ?,
                    updated_at = ?
                  WHERE id = ?
                `,
                  [
                    details.name,
                    details.formatted_address || "",
                    details.formatted_phone_number || "",
                    details.website || "",
                    business.geometry?.location?.lat || 0,
                    business.geometry?.location?.lng || 0,
                    details.rating || 0,
                    details.user_ratings_total || 0,
                    details.business_status || "OPERATIONAL",
                    logoUrl,
                    JSON.stringify(photosDownloaded),
                    new Date().toISOString(),
                    business.place_id,
                  ],
                );

                res.write(`   💾 UPDATED: Enhanced existing business\n`);
                totalEnhanced++;
              } else {
                res.write(`   ❌ Business not found in database\n`);
              }

              res.write(
                `   ✅ Enhanced: ${photosDownloaded.length} photos, ${reviews.length} reviews\n`,
              );
            } catch (dbError) {
              res.write(`   ❌ Database error: ${dbError.message}\n`);
            }
          } else {
            res.write(`   ❌ No details found: ${detailsData.status}\n`);
          }
        } else {
          res.write(`   ❌ No search results: ${searchData.status}\n`);
        }

        totalProcessed++;
      } catch (error) {
        res.write(`   ❌ Error processing: ${error.message}\n`);
      }

      if (i < testQueries.length - 1) {
        res.write(`   ⏳ Waiting 3 seconds...\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    // Final results
    const finalCount = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );

    res.write(`\n🎉 ENHANCED FETCHER TEST COMPLETE!\n`);
    res.write(`📊 Businesses processed: ${totalProcessed}\n`);
    res.write(`💎 Businesses enhanced: ${totalEnhanced}\n`);
    res.write(`📸 Total photos downloaded: ${totalPhotos}\n`);
    res.write(`📝 Total reviews found: ${totalReviews}\n`);
    res.write(`🏢 Database total: ${finalCount.total} businesses\n`);
    res.write(`\n✅ Enhanced fetcher is working! Photos and data stored.\n`);

    res.end();
  } catch (error) {
    console.error("Enhanced fetcher error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
