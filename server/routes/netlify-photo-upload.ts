import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";
import { database } from "../database/database";

export const uploadPhotosToNetlify: RequestHandler = async (req, res) => {
  try {
    const { NETLIFY_ACCESS_TOKEN, NETLIFY_SITE_ID } = process.env;

    if (!NETLIFY_ACCESS_TOKEN || !NETLIFY_SITE_ID) {
      return res.status(500).json({
        error: "Netlify credentials not configured",
      });
    }

    const photosDir = path.join(process.cwd(), "uploads", "business-photos");

    if (!fs.existsSync(photosDir)) {
      return res.status(404).json({
        error: "Photos directory not found",
      });
    }

    const photoFiles = fs
      .readdirSync(photosDir)
      .filter((file) => file.endsWith(".jpg"));

    if (photoFiles.length === 0) {
      return res.status(404).json({
        error: "No photos found to upload",
      });
    }

    // Start streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(`🚀 STARTING NETLIFY PHOTO UPLOAD\n`);
    res.write(`📊 Found ${photoFiles.length} photos to upload\n\n`);

    let uploadedCount = 0;
    let failedCount = 0;
    const businessPhotos: { [key: string]: string[] } = {};

    for (let i = 0; i < photoFiles.length; i++) {
      const photoFile = photoFiles[i];
      const progressPercent = (((i + 1) / photoFiles.length) * 100).toFixed(1);

      try {
        res.write(
          `🔄 [${i + 1}/${photoFiles.length}] (${progressPercent}%) Uploading: ${photoFile}\n`,
        );

        const photoPath = path.join(photosDir, photoFile);
        const photoBuffer = fs.readFileSync(photoPath);
        const photoBase64 = photoBuffer.toString("base64");

        // Upload to Netlify
        const uploadResponse = await fetch(
          `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/files/business-photos/${photoFile}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${NETLIFY_ACCESS_TOKEN}`,
              "Content-Type": "application/octet-stream",
            },
            body: photoBuffer,
          },
        );

        if (uploadResponse.ok) {
          uploadedCount++;
          const netlifyUrl = `https://${NETLIFY_SITE_ID}.netlify.app/business-photos/${photoFile}`;

          res.write(`   ✅ Uploaded: ${netlifyUrl}\n`);

          // Group by business ID
          const businessId = photoFile.split("_")[0];
          if (!businessPhotos[businessId]) {
            businessPhotos[businessId] = [];
          }
          businessPhotos[businessId].push(netlifyUrl);
        } else {
          failedCount++;
          res.write(
            `   ❌ Failed: ${uploadResponse.status} - ${uploadResponse.statusText}\n`,
          );
        }

        // Small delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        failedCount++;
        res.write(`   ❌ Error: ${error.message}\n`);
      }
    }

    res.write(`\n📊 UPLOAD COMPLETE:\n`);
    res.write(`✅ Successfully uploaded: ${uploadedCount}\n`);
    res.write(`❌ Failed uploads: ${failedCount}\n\n`);

    // Update database with Netlify URLs
    res.write(`💾 Updating database with Netlify URLs...\n`);
    let databaseUpdateCount = 0;

    for (const [businessId, photoUrls] of Object.entries(businessPhotos)) {
      try {
        // Get business name
        const business = await database.get(
          "SELECT name FROM businesses WHERE id = ?",
          [businessId],
        );

        if (business) {
          const logoUrl = photoUrls[0]; // First photo as logo

          await database.run(
            `UPDATE businesses SET 
               logo_url = ?, 
               photos_json = ?, 
               updated_at = ? 
             WHERE id = ?`,
            [
              logoUrl,
              JSON.stringify(photoUrls),
              new Date().toISOString(),
              businessId,
            ],
          );

          databaseUpdateCount++;
          res.write(
            `   ✅ Updated ${business.name}: ${photoUrls.length} photos\n`,
          );
        }
      } catch (error) {
        res.write(
          `   ❌ Database update error for ${businessId}: ${error.message}\n`,
        );
      }
    }

    // Final statistics
    const finalStats = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );
    const businessesWithPhotos = await database.get(
      "SELECT COUNT(*) as total FROM businesses WHERE logo_url IS NOT NULL AND logo_url != ''",
    );

    res.write(`\n🎉 NETLIFY UPLOAD COMPLETE!\n`);
    res.write(`📊 Photos uploaded to Netlify: ${uploadedCount}\n`);
    res.write(`💾 Database records updated: ${databaseUpdateCount}\n`);
    res.write(`📈 Total businesses: ${finalStats.total}\n`);
    res.write(`📸 Businesses with photos: ${businessesWithPhotos.total}\n`);
    res.write(`🌐 All photos now served from Netlify CDN!\n`);

    res.end();
  } catch (error) {
    console.error("Netlify upload error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}\n`);
      res.end();
    }
  }
};
