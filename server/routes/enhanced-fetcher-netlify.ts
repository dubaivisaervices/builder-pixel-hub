import { RequestHandler } from "express";
import { database } from "../database/database";

export const enhancedFetcherNetlify: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const netlifyToken = process.env.NETLIFY_ACCESS_TOKEN;
    const netlifySiteId = process.env.NETLIFY_SITE_ID;

    if (!apiKey) {
      return res.json({
        success: false,
        error: "Google Places API key not configured",
      });
    }

    if (!netlifyToken || !netlifySiteId) {
      return res.json({
        success: false,
        error: "Netlify credentials not configured",
      });
    }

    // Get businesses that still need enhancement (no Netlify photos)
    const businessesToEnhance = await database.all(
      `SELECT id, name FROM businesses 
       WHERE (logo_url IS NULL OR logo_url = '' OR logo_url LIKE '/uploads/%') 
       AND id NOT LIKE 'test_%' 
       ORDER BY created_at DESC 
       LIMIT 50`,
    );

    if (!businessesToEnhance || businessesToEnhance.length === 0) {
      return res.json({
        success: true,
        message: "All businesses already enhanced with Netlify photos",
      });
    }

    let totalProcessed = 0;
    let totalEnhanced = 0;
    let totalPhotosUploaded = 0;
    let totalReviews = 0;

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 ENHANCING ${businessesToEnhance.length} BUSINESSES WITH NETLIFY PHOTO STORAGE\n\n`,
    );

    for (let i = 0; i < businessesToEnhance.length; i++) {
      const businessRecord = businessesToEnhance[i];
      const progressPercent = (
        ((i + 1) / businessesToEnhance.length) *
        100
      ).toFixed(1);

      res.write(
        `🔍 [${i + 1}/${businessesToEnhance.length}] (${progressPercent}%) Enhancing: "${businessRecord.name}"...\n`,
      );

      try {
        // Get detailed information using place_id
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${businessRecord.id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,business_status&key=${apiKey}`;

        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === "OK" && detailsData.result) {
          const details = detailsData.result;
          let netlifyPhotoUrls: string[] = [];
          let netlifyLogoUrl = "";

          // Download and upload photos to Netlify
          if (details.photos && details.photos.length > 0) {
            res.write(
              `   📸 Processing ${Math.min(details.photos.length, 3)} photos for Netlify upload...\n`,
            );

            for (let j = 0; j < Math.min(details.photos.length, 3); j++) {
              try {
                const photoRef = details.photos[j].photo_reference;
                const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoRef}&maxwidth=600&key=${apiKey}`;

                // Download photo from Google
                const photoResponse = await fetch(photoUrl);
                if (photoResponse.ok) {
                  const photoBuffer = await photoResponse.arrayBuffer();
                  const photoBase64 =
                    Buffer.from(photoBuffer).toString("base64");

                  // Create safe filename
                  const safeBusinessName = businessRecord.name
                    .replace(/[^a-zA-Z0-9]/g, "_")
                    .substring(0, 30);
                  const photoFileName = `${businessRecord.id}_${safeBusinessName}_${j + 1}.jpg`;

                  // Upload to Netlify
                  const netlifyUploadResponse = await fetch(
                    `https://api.netlify.com/api/v1/sites/${netlifySiteId}/files/${encodeURIComponent(`business-photos/${photoFileName}`)}`,
                    {
                      method: "PUT",
                      headers: {
                        Authorization: `Bearer ${netlifyToken}`,
                        "Content-Type": "image/jpeg",
                      },
                      body: Buffer.from(photoBase64, "base64"),
                    },
                  );

                  if (netlifyUploadResponse.ok) {
                    const netlifyUrl = `https://${netlifySiteId}.netlify.app/business-photos/${photoFileName}`;
                    netlifyPhotoUrls.push(netlifyUrl);
                    totalPhotosUploaded++;

                    // First photo becomes logo
                    if (j === 0) {
                      netlifyLogoUrl = netlifyUrl;
                    }

                    res.write(`     ✅ Uploaded to Netlify: photo ${j + 1}\n`);
                  } else {
                    const errorText = await netlifyUploadResponse.text();
                    res.write(
                      `     ❌ Netlify upload failed for photo ${j + 1}: ${errorText}\n`,
                    );
                  }
                }
              } catch (photoError) {
                res.write(
                  `     ❌ Photo ${j + 1} processing failed: ${photoError.message}\n`,
                );
              }
            }
          }

          // Process reviews
          const reviews = details.reviews || [];
          totalReviews += reviews.length;

          // Update database with Netlify URLs
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
              netlifyLogoUrl,
              JSON.stringify(netlifyPhotoUrls),
              new Date().toISOString(),
              businessRecord.id,
            ],
          );

          res.write(
            `   ✅ Enhanced: ${netlifyPhotoUrls.length} photos uploaded to Netlify, ${reviews.length} reviews\n`,
          );
          totalEnhanced++;
        } else if (detailsData.status === "NOT_FOUND") {
          res.write(`   ⚠️ Business not found on Google\n`);
        } else {
          res.write(`   ❌ API Error: ${detailsData.status}\n`);
        }

        totalProcessed++;

        // Progress update every 10 businesses
        if ((i + 1) % 10 === 0) {
          res.write(
            `\n📈 PROGRESS: ${i + 1}/${businessesToEnhance.length} completed\n`,
          );
          res.write(
            `💎 Enhanced: ${totalEnhanced}, 📸 Photos: ${totalPhotosUploaded}, 📝 Reviews: ${totalReviews}\n\n`,
          );
        }

        // API rate limiting
        if (i < businessesToEnhance.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        res.write(`   ❌ Error: ${error.message}\n`);
        totalProcessed++;
      }
    }

    // Final results
    const finalCount = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );
    const netlifyEnhancedCount = await database.get(
      "SELECT COUNT(*) as total FROM businesses WHERE logo_url LIKE 'https://%.netlify.app/%'",
    );

    res.write(`\n🎉 NETLIFY ENHANCEMENT COMPLETE!\n`);
    res.write(`📊 Businesses processed: ${totalProcessed}\n`);
    res.write(`💎 Businesses enhanced: ${totalEnhanced}\n`);
    res.write(`📸 Photos uploaded to Netlify: ${totalPhotosUploaded}\n`);
    res.write(`📝 Reviews collected: ${totalReviews}\n`);
    res.write(`🏢 Total businesses: ${finalCount.total}\n`);
    res.write(
      `🌐 Businesses with Netlify photos: ${netlifyEnhancedCount.total}\n`,
    );
    res.write(`\n✨ ALL PHOTOS NOW HOSTED ON NETLIFY CDN!\n`);

    res.end();
  } catch (error) {
    console.error("Netlify enhancement error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
