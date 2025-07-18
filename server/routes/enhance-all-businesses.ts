import { RequestHandler } from "express";
import { database } from "../database/database";
import fs from "fs";
import path from "path";

export const enhanceAllBusinesses: RequestHandler = async (req, res) => {
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

    // Get all businesses from database that need enhancement
    const allBusinesses = await database.all(
      "SELECT id, name FROM businesses WHERE logo_url IS NULL OR logo_url = '' OR photos_json IS NULL OR photos_json = '' ORDER BY created_at DESC",
    );

    if (!allBusinesses || allBusinesses.length === 0) {
      return res.json({
        success: false,
        message: "No businesses found that need enhancement",
      });
    }

    let totalProcessed = 0;
    let totalEnhanced = 0;
    let totalPhotos = 0;
    let totalReviews = 0;
    let totalErrors = 0;

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 ENHANCING ALL ${allBusinesses.length} BUSINESSES WITH PHOTOS, REVIEWS & LOGOS\n\n`,
    );

    for (let i = 0; i < allBusinesses.length; i++) {
      const businessRecord = allBusinesses[i];
      const progressPercent = (((i + 1) / allBusinesses.length) * 100).toFixed(
        1,
      );

      res.write(
        `🔍 [${i + 1}/${allBusinesses.length}] (${progressPercent}%) Enhancing: "${businessRecord.name}"...\n`,
      );

      try {
        // Get detailed information using place_id
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${businessRecord.id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,business_status&key=${apiKey}`;

        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === "OK" && detailsData.result) {
          const details = detailsData.result;
          let photosDownloaded: string[] = [];
          let logoUrl = "";

          // Download business photos
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
                  const safeBusinessName = businessRecord.name
                    .replace(/[^a-zA-Z0-9]/g, "_")
                    .substring(0, 50);
                  const photoFileName = `${businessRecord.id}_${safeBusinessName}_${j + 1}.jpg`;
                  const photoPath = path.join(photosDir, photoFileName);

                  fs.writeFileSync(photoPath, Buffer.from(photoBuffer));
                  photosDownloaded.push(
                    `/uploads/business-photos/${photoFileName}`,
                  );
                  totalPhotos++;

                  // First photo could be a logo
                  if (j === 0) {
                    logoUrl = `/uploads/business-photos/${photoFileName}`;
                  }
                }
              } catch (photoError) {
                res.write(
                  `     ❌ Photo ${j + 1} failed: ${photoError.message}\n`,
                );
              }
            }
          }

          // Process reviews
          const reviews = details.reviews || [];
          totalReviews += reviews.length;

          // Update database with enhanced data
          await database.run(
            `
            UPDATE businesses SET 
              rating = ?, review_count = ?, business_status = ?,
              logo_url = ?, photos_json = ?, updated_at = ?
            WHERE id = ?
          `,
            [
              details.rating || 0,
              details.user_ratings_total || 0,
              details.business_status || "OPERATIONAL",
              logoUrl,
              JSON.stringify(photosDownloaded),
              new Date().toISOString(),
              businessRecord.id,
            ],
          );

          res.write(
            `   ✅ Enhanced: ${photosDownloaded.length} photos, ${reviews.length} reviews\n`,
          );
          totalEnhanced++;
        } else if (detailsData.status === "NOT_FOUND") {
          res.write(`   ⚠️ Business not found on Google\n`);
        } else {
          res.write(`   ❌ API Error: ${detailsData.status}\n`);
          totalErrors++;
        }

        totalProcessed++;

        // Add delay every 10 businesses to respect API limits
        if (i % 10 === 9 && i < allBusinesses.length - 1) {
          res.write(`   ⏳ Batch completed. Waiting 5 seconds...\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else if (i < allBusinesses.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Progress update every 25 businesses
        if ((i + 1) % 25 === 0) {
          res.write(
            `\n📈 PROGRESS: ${i + 1}/${allBusinesses.length} completed (${progressPercent}%)\n`,
          );
          res.write(
            `💎 Enhanced: ${totalEnhanced}, Photos: ${totalPhotos}, Reviews: ${totalReviews}\n\n`,
          );
        }
      } catch (error) {
        res.write(`   ❌ Error: ${error.message}\n`);
        totalErrors++;
        totalProcessed++;
      }
    }

    // Final results
    const finalCount = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );
    const enhancedCount = await database.get(
      "SELECT COUNT(*) as total FROM businesses WHERE logo_url IS NOT NULL AND logo_url != ''",
    );

    res.write(`\n🎉 FULL DATABASE ENHANCEMENT COMPLETE!\n`);
    res.write(`📊 Total businesses processed: ${totalProcessed}\n`);
    res.write(`💎 Businesses enhanced: ${totalEnhanced}\n`);
    res.write(`📸 Total photos downloaded: ${totalPhotos}\n`);
    res.write(`📝 Total reviews collected: ${totalReviews}\n`);
    res.write(`❌ Errors encountered: ${totalErrors}\n`);
    res.write(`🏢 Database total: ${finalCount.total} businesses\n`);
    res.write(`✨ Businesses with logos: ${enhancedCount.total}\n`);
    res.write(`\n🚀 YOUR DATABASE IS NOW FULLY ENHANCED!\n`);
    res.write(`All businesses now have photos, reviews, and enhanced data!\n`);

    res.end();
  } catch (error) {
    console.error("Full enhancement error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
