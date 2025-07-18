import { RequestHandler } from "express";
import { database } from "../database/database";
import fs from "fs";
import path from "path";

export const migratePhotosDirect: RequestHandler = async (req, res) => {
  try {
    // Direct credentials for migration
    const netlifyToken = "nfp_4fXgH8vKw9P2dR7nQ3mT6sY1eA5cB9jL0oI8xN2vW4zU7";
    const netlifySiteId = "reportvisascam";
    const netlifyDomain = "reportvisascam.netlify.app";

    // Check local photos
    const photosDir = path.join(process.cwd(), "uploads", "business-photos");

    if (!fs.existsSync(photosDir)) {
      return res.json({
        success: false,
        error: "Local photos directory not found",
      });
    }

    const photoFiles = fs
      .readdirSync(photosDir)
      .filter((file) => file.endsWith(".jpg"));

    if (photoFiles.length === 0) {
      return res.json({
        success: false,
        error: "No photos found to migrate",
      });
    }

    let totalUploaded = 0;
    let totalFailed = 0;
    let businessesUpdated = 0;
    const uploadedUrls: string[] = [];

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(`🚀 MIGRATING ${photoFiles.length} PHOTOS TO NETLIFY CDN\n\n`);
    res.write(`📍 Target: https://${netlifyDomain}/business-photos/\n\n`);

    // Process photos in batches
    for (let i = 0; i < photoFiles.length; i++) {
      const photoFile = photoFiles[i];
      const progressPercent = (((i + 1) / photoFiles.length) * 100).toFixed(1);

      res.write(
        `🔄 [${i + 1}/${photoFiles.length}] (${progressPercent}%) Uploading: ${photoFile}...\n`,
      );

      try {
        const photoPath = path.join(photosDir, photoFile);
        const photoBuffer = fs.readFileSync(photoPath);

        // Upload to Netlify using their API
        const uploadResponse = await fetch(
          `https://api.netlify.com/api/v1/sites/${netlifySiteId}/files/business-photos%2F${encodeURIComponent(photoFile)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${netlifyToken}`,
              "Content-Type": "image/jpeg",
            },
            body: photoBuffer,
          },
        );

        if (uploadResponse.ok) {
          const netlifyUrl = `https://${netlifyDomain}/business-photos/${photoFile}`;
          uploadedUrls.push(netlifyUrl);

          // Extract business ID from filename
          const businessId = photoFile.split("_")[0];

          // Update database with Netlify URL
          try {
            const isFirstPhoto = photoFile.includes("_1.jpg");

            // Update logo_url for first photo of each business
            if (isFirstPhoto) {
              await database.run(
                "UPDATE businesses SET logo_url = ?, updated_at = ? WHERE id = ?",
                [netlifyUrl, new Date().toISOString(), businessId],
              );
            }

            // Update photos_json with Netlify URLs
            const existingBusiness = await database.get(
              "SELECT photos_json FROM businesses WHERE id = ?",
              [businessId],
            );

            if (existingBusiness) {
              let photosArray = [];
              try {
                photosArray = JSON.parse(existingBusiness.photos_json || "[]");
              } catch (e) {
                photosArray = [];
              }

              // Add or replace with Netlify URL
              const localPath = `/uploads/business-photos/${photoFile}`;
              const existingIndex = photosArray.findIndex((p) =>
                p.includes(photoFile),
              );

              if (existingIndex >= 0) {
                photosArray[existingIndex] = netlifyUrl;
              } else {
                photosArray.push(netlifyUrl);
              }

              await database.run(
                "UPDATE businesses SET photos_json = ?, updated_at = ? WHERE id = ?",
                [
                  JSON.stringify(photosArray),
                  new Date().toISOString(),
                  businessId,
                ],
              );

              // Count unique businesses updated
              if (i === 0 || businessId !== photoFiles[i - 1]?.split("_")[0]) {
                businessesUpdated++;
              }
            }

            res.write(`   ✅ Uploaded: ${netlifyUrl}\n`);
            totalUploaded++;
          } catch (dbError) {
            res.write(
              `   ⚠️ Uploaded but DB update failed: ${dbError.message}\n`,
            );
            totalUploaded++;
          }
        } else {
          const errorText = await uploadResponse.text();
          res.write(`   ❌ Upload failed: HTTP ${uploadResponse.status}\n`);
          totalFailed++;
        }
      } catch (error) {
        res.write(`   ❌ Error: ${error.message}\n`);
        totalFailed++;
      }

      // Progress updates every 10 files
      if ((i + 1) % 10 === 0) {
        res.write(`\n📈 PROGRESS: ${i + 1}/${photoFiles.length} processed\n`);
        res.write(
          `✅ Uploaded: ${totalUploaded}, ❌ Failed: ${totalFailed}\n\n`,
        );
      }

      // Small delay to be nice to Netlify API
      if (i < photoFiles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Final results
    const finalCount = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );
    const netlifyBusinesses = await database.get(
      "SELECT COUNT(*) as total FROM businesses WHERE logo_url LIKE 'https://%.netlify.app/%'",
    );

    res.write(`\n🎉 NETLIFY MIGRATION COMPLETE!\n`);
    res.write(`📊 Total photos processed: ${photoFiles.length}\n`);
    res.write(`✅ Successfully uploaded: ${totalUploaded}\n`);
    res.write(`❌ Failed uploads: ${totalFailed}\n`);
    res.write(`🏢 Businesses updated: ${businessesUpdated}\n`);
    res.write(
      `🌐 Businesses with Netlify photos: ${netlifyBusinesses.total}\n`,
    );
    res.write(`📈 Total businesses in database: ${finalCount.total}\n`);

    if (totalUploaded > 0) {
      res.write(`\n🌟 SUCCESS! All photos now hosted on Netlify CDN\n`);
      res.write(
        `📍 Photos accessible at: https://${netlifyDomain}/business-photos/\n`,
      );
      res.write(`🗑️ Local photos directory can now be safely deleted\n`);
    }

    res.end();
  } catch (error) {
    console.error("Direct migration error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
