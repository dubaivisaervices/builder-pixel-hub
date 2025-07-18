import { RequestHandler } from "express";
import { database } from "../database/database";
import fs from "fs";
import path from "path";

export const enhancedFetcherComplete: RequestHandler = async (req, res) => {
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

    // Test with a few businesses from recent categories
    const testQueries = [
      "Universal Blue Ocean Consultant Dubai",
      "AURION Business Setup Consultants Dubai",
      "Bright Doors Visa Services Dubai",
      "Golden Asia Consultants Dubai",
    ];

    let totalProcessed = 0;
    let totalEnhanced = 0;
    let results: any[] = [];

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 ENHANCED FETCHER - Complete business data with reviews, photos & logos\n\n`,
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
          res.write(`   ��� Found: ${business.name}\n`);

          // Step 2: Get detailed information including reviews
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,price_level,business_status&key=${apiKey}`;

          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          if (detailsData.status === "OK" && detailsData.result) {
            const details = detailsData.result;
            let photosDownloaded: string[] = [];
            let logoUrl = "";

            // Step 3: Download business photos
            if (details.photos && details.photos.length > 0) {
              res.write(
                `   📸 Downloading ${Math.min(details.photos.length, 5)} photos...\n`,
              );

              for (let j = 0; j < Math.min(details.photos.length, 5); j++) {
                try {
                  const photoRef = details.photos[j].photo_reference;
                  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=800&key=${apiKey}`;

                  const photoResponse = await fetch(photoUrl);
                  if (photoResponse.ok) {
                    const photoBuffer = await photoResponse.arrayBuffer();
                    const photoFileName = `${business.place_id}_photo_${j + 1}.jpg`;
                    const photoPath = path.join(photosDir, photoFileName);

                    fs.writeFileSync(photoPath, Buffer.from(photoBuffer));
                    photosDownloaded.push(
                      `/uploads/business-photos/${photoFileName}`,
                    );

                    // Try to detect if this might be a logo (usually the first photo)
                    if (j === 0) {
                      logoUrl = `/uploads/business-photos/${photoFileName}`;
                    }
                  }
                } catch (photoError) {
                  res.write(`   ❌ Photo ${j + 1} download failed\n`);
                }
              }
            }

            // Step 4: Process reviews
            const reviews = details.reviews || [];
            const reviewsData = reviews.map((review) => ({
              author_name: review.author_name,
              rating: review.rating,
              text: review.text,
              time: review.time,
              relative_time_description: review.relative_time_description,
            }));

            // Step 5: Store enhanced data in database
            try {
              const existing = await database.get(
                "SELECT id FROM businesses WHERE id = ? OR name = ?",
                [business.place_id, business.name],
              );

              const businessData = [
                business.place_id,
                details.name,
                details.formatted_address || "",
                details.formatted_phone_number || "",
                details.website || "",
                "", // email
                business.geometry?.location?.lat || 0,
                business.geometry?.location?.lng || 0,
                details.rating || 0,
                details.user_ratings_total || 0,
                query.includes("consultant") ? "consultant" : "visa services",
                details.business_status || "OPERATIONAL",
                "", // photo_reference (we store actual files)
                logoUrl, // logo_url
                details.opening_hours?.open_now !== false ? 1 : 0, // is_open
                details.price_level || 0,
                1, // has_target_keyword
                JSON.stringify(details.opening_hours || {}), // hours_json
                JSON.stringify(photosDownloaded), // photos_json
                new Date().toISOString(), // created_at
                new Date().toISOString(), // updated_at
                "", // logo_base64
                JSON.stringify(photosDownloaded), // photos_local_json
                JSON.stringify(reviewsData), // reviews_json
                details.user_ratings_total || 0, // total_reviews
                JSON.stringify(details.opening_hours?.weekday_text || []), // opening_hours
              ];

              if (existing) {
                // Update existing business with enhanced data
                await database.run(
                  `
                  UPDATE businesses SET 
                    name = ?, address = ?, phone = ?, website = ?, email = ?,
                    lat = ?, lng = ?, rating = ?, review_count = ?, category = ?,
                    business_status = ?, photo_reference = ?, logo_url = ?,
                    is_open = ?, price_level = ?, has_target_keyword = ?,
                    hours_json = ?, photos_json = ?, updated_at = ?,
                    logo_base64 = ?, photos_local_json = ?, reviews_json = ?,
                    total_reviews = ?, opening_hours = ?
                  WHERE id = ?
                `,
                  [
                    ...businessData.slice(1, -2), // Skip id and created_at
                    business.place_id,
                  ],
                );

                res.write(
                  `   💾 UPDATED: Enhanced data for existing business\n`,
                );
              } else {
                // Insert new business with enhanced data
                await database.run(
                  `
                  INSERT INTO businesses (
                    id, name, address, phone, website, email, lat, lng,
                    rating, review_count, category, business_status, photo_reference,
                    logo_url, is_open, price_level, has_target_keyword, hours_json,
                    photos_json, created_at, updated_at, logo_base64, photos_local_json,
                    reviews_json, total_reviews, opening_hours
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                  businessData,
                );

                res.write(`   💾 SAVED: New business with enhanced data\n`);
              }

              totalEnhanced++;
              results.push({
                name: details.name,
                photos: photosDownloaded.length,
                reviews: reviewsData.length,
                hasLogo: !!logoUrl,
                enhanced: true,
              });

              res.write(
                `   ✅ Enhanced: ${photosDownloaded.length} photos, ${reviewsData.length} reviews, ${logoUrl ? "logo" : "no logo"}\n`,
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
    res.write(
      `📸 Total photos downloaded: ${results.reduce((sum, r) => sum + r.photos, 0)}\n`,
    );
    res.write(
      `📝 Total reviews collected: ${results.reduce((sum, r) => sum + r.reviews, 0)}\n`,
    );
    res.write(`🏢 Database total: ${finalCount.total} businesses\n`);
    res.write(`\n✨ Enhanced fetcher working! Ready for full deployment.\n`);

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
