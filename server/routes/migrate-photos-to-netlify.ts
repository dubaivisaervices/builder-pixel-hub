import { RequestHandler } from "express";
import { database } from "../database/database";
import fs from "fs";
import path from "path";

export const migratePhotosToNetlify: RequestHandler = async (req, res) => {
  try {
    // Check local photos directory
    const photosDir = path.join(process.cwd(), "uploads", "business-photos");

    if (!fs.existsSync(photosDir)) {
      return res.json({
        success: false,
        error: "Local photos directory not found",
      });
    }

    // Get all local photo files
    const photoFiles = fs
      .readdirSync(photosDir)
      .filter((file) => file.endsWith(".jpg"));

    if (photoFiles.length === 0) {
      return res.json({
        success: false,
        error: "No local photos found to migrate",
      });
    }

    let totalUploaded = 0;
    let totalFailed = 0;
    let businessesUpdated = 0;

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🚀 MIGRATING ${photoFiles.length} LOCAL PHOTOS TO NETLIFY CDN\n\n`,
    );

    // Process each photo file
    for (let i = 0; i < photoFiles.length; i++) {
      const photoFile = photoFiles[i];
      const progressPercent = (((i + 1) / photoFiles.length) * 100).toFixed(1);

      res.write(
        `🔄 [${i + 1}/${photoFiles.length}] (${progressPercent}%) Uploading: ${photoFile}...\n`,
      );

      try {
        const photoPath = path.join(photosDir, photoFile);

        // Read file as base64 for Netlify upload
        const photoBuffer = fs.readFileSync(photoPath);
        const photoBase64 = photoBuffer.toString("base64");

        // Upload to Netlify
        const netlifyResponse = await fetch(
          "https://api.netlify.com/api/v1/sites/YOUR_SITE_ID/files",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`,
              "Content-Type": "application/octet-stream",
            },
            body: JSON.stringify({
              path: `/business-photos/${photoFile}`,
              content: photoBase64,
              encoding: "base64",
            }),
          },
        );

        if (netlifyResponse.ok) {
          const netlifyUrl = `https://YOUR_NETLIFY_DOMAIN.netlify.app/business-photos/${photoFile}`;

          // Extract business ID from filename to update database
          const businessId = photoFile.split("_")[0];

          // Update database with Netlify URL
          const isFirstPhoto = photoFile.includes("_1.jpg");

          if (isFirstPhoto) {
            // Update logo_url for first photo
            await database.run(
              "UPDATE businesses SET logo_url = ? WHERE id = ?",
              [netlifyUrl, businessId],
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

            // Replace local path with Netlify URL
            const localPath = `/uploads/business-photos/${photoFile}`;
            const index = photosArray.findIndex((p) => p.includes(photoFile));

            if (index >= 0) {
              photosArray[index] = netlifyUrl;
            } else {
              photosArray.push(netlifyUrl);
            }

            await database.run(
              "UPDATE businesses SET photos_json = ? WHERE id = ?",
              [JSON.stringify(photosArray), businessId],
            );

            if (i === 0 || businessId !== photoFiles[i - 1]?.split("_")[0]) {
              businessesUpdated++;
            }
          }

          res.write(`   ✅ Uploaded to: ${netlifyUrl}\n`);
          totalUploaded++;
        } else {
          const errorText = await netlifyResponse.text();
          res.write(`   ❌ Upload failed: ${errorText}\n`);
          totalFailed++;
        }
      } catch (error) {
        res.write(`   ❌ Error: ${error.message}\n`);
        totalFailed++;
      }

      // Progress updates every 10 files
      if ((i + 1) % 10 === 0) {
        res.write(
          `\n📈 PROGRESS: ${i + 1}/${photoFiles.length} photos processed\n`,
        );
        res.write(
          `✅ Uploaded: ${totalUploaded}, ❌ Failed: ${totalFailed}\n\n`,
        );
      }

      // Small delay to avoid overwhelming Netlify API
      if (i < photoFiles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Final results
    res.write(`\n🎉 NETLIFY MIGRATION COMPLETE!\n`);
    res.write(`📊 Total photos processed: ${photoFiles.length}\n`);
    res.write(`✅ Successfully uploaded: ${totalUploaded}\n`);
    res.write(`❌ Failed uploads: ${totalFailed}\n`);
    res.write(`🏢 Businesses updated: ${businessesUpdated}\n`);
    res.write(`🌐 All photos now available via Netlify CDN!\n`);

    if (totalUploaded > 0) {
      res.write(`\n🗑️ You can now safely delete local photos directory\n`);
      res.write(
        `📍 Photos accessible at: https://YOUR_NETLIFY_DOMAIN.netlify.app/business-photos/\n`,
      );
    }

    res.end();
  } catch (error) {
    console.error("Netlify migration error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
