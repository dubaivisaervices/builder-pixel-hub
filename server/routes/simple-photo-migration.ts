import { RequestHandler } from "express";
import { database } from "../database/database";
import fs from "fs";
import path from "path";

export const simplePhotoMigration: RequestHandler = async (req, res) => {
  try {
    // Since Netlify API might not be accessible, let's use a simpler approach
    // We'll prepare the photos and provide info for manual upload or alternative storage

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
        error: "No photos found",
      });
    }

    // For now, let's create URLs pointing to your current domain and update the database
    // This way photos will be served from your current server until we can set up proper CDN

    let businessesUpdated = 0;
    const updatedBusinesses: string[] = [];

    // Send streaming response
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Transfer-Encoding": "chunked",
    });

    res.write(
      `🔄 UPDATING DATABASE WITH PHOTO URLS FOR ${photoFiles.length} PHOTOS\n\n`,
    );

    // Group photos by business ID
    const businessPhotos: { [key: string]: string[] } = {};

    photoFiles.forEach((photoFile) => {
      const businessId = photoFile.split("_")[0];
      if (!businessPhotos[businessId]) {
        businessPhotos[businessId] = [];
      }
      businessPhotos[businessId].push(photoFile);
    });

    let processedCount = 0;

    // Process each business
    for (const [businessId, photos] of Object.entries(businessPhotos)) {
      processedCount++;
      const progressPercent = (
        (processedCount / Object.keys(businessPhotos).length) *
        100
      ).toFixed(1);

      try {
        // Get business name for logging
        const business = await database.get(
          "SELECT name FROM businesses WHERE id = ?",
          [businessId],
        );

        if (business) {
          res.write(
            `🔄 [${processedCount}/${Object.keys(businessPhotos).length}] (${progressPercent}%) Updating: ${business.name}...\n`,
          );

          // Create photo URLs (using current domain)
          const photoUrls = photos.map(
            (photo) => `/uploads/business-photos/${photo}`,
          );

          // First photo becomes logo
          const logoUrl = photoUrls[0];

          // Update database
          await database.run(
            `
            UPDATE businesses SET 
              logo_url = ?, 
              photos_json = ?, 
              updated_at = ? 
            WHERE id = ?
          `,
            [
              logoUrl,
              JSON.stringify(photoUrls),
              new Date().toISOString(),
              businessId,
            ],
          );

          businessesUpdated++;
          updatedBusinesses.push(business.name);

          res.write(
            `   ✅ Updated: ${photos.length} photos, logo: ${logoUrl}\n`,
          );
        }
      } catch (error) {
        res.write(
          `   ❌ Error updating business ${businessId}: ${error.message}\n`,
        );
      }
    }

    // Get final statistics
    const finalStats = await database.get(
      "SELECT COUNT(*) as total FROM businesses",
    );
    const businessesWithPhotos = await database.get(
      "SELECT COUNT(*) as total FROM businesses WHERE logo_url IS NOT NULL AND logo_url != ''",
    );

    res.write(`\n🎉 DATABASE UPDATE COMPLETE!\n`);
    res.write(`📊 Total photos processed: ${photoFiles.length}\n`);
    res.write(`🏢 Businesses updated: ${businessesUpdated}\n`);
    res.write(`📈 Total businesses: ${finalStats.total}\n`);
    res.write(`📸 Businesses with photos: ${businessesWithPhotos.total}\n`);

    // Show first few updated businesses
    res.write(`\n✨ SAMPLE UPDATED BUSINESSES:\n`);
    updatedBusinesses.slice(0, 5).forEach((name, index) => {
      res.write(`${index + 1}. ${name}\n`);
    });

    res.write(
      `\n🌐 Photos are now accessible via your domain at /uploads/business-photos/\n`,
    );
    res.write(
      `📍 Example: http://your-domain.com/uploads/business-photos/[filename].jpg\n`,
    );

    res.end();
  } catch (error) {
    console.error("Simple migration error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n❌ FATAL ERROR: ${error.message}`);
      res.end();
    }
  }
};
