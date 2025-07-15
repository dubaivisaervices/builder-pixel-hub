import { Request, Response } from "express";

/**
 * Inspect what cached image data we actually have
 */
export async function inspectCachedImageData(req: Request, res: Response) {
  try {
    const { database } = await import("../database/database");

    // Get sample of businesses with cached data
    const businesses = await database.all(`
      SELECT 
        id, 
        name, 
        logo_base64,
        photos_local_json,
        photos_json,
        CASE 
          WHEN logo_base64 IS NOT NULL THEN 'YES'
          ELSE 'NO'
        END as has_logo_base64,
        CASE 
          WHEN photos_local_json IS NOT NULL AND photos_local_json != '[]' THEN 'YES'
          ELSE 'NO'
        END as has_cached_photos,
        CASE 
          WHEN photos_json IS NOT NULL AND photos_json != '[]' THEN 'YES'
          ELSE 'NO'
        END as has_photos_json,
        CASE 
          WHEN logo_base64 IS NOT NULL THEN LENGTH(logo_base64)
          ELSE 0
        END as logo_base64_size
      FROM businesses 
      WHERE name IS NOT NULL 
      ORDER BY rating DESC
      LIMIT 20
    `);

    // Get detailed sample for first few businesses
    const detailedSample = await database.all(`
      SELECT 
        id, 
        name, 
        logo_base64,
        photos_local_json,
        photos_json
      FROM businesses 
      WHERE (logo_base64 IS NOT NULL OR photos_local_json IS NOT NULL)
      ORDER BY rating DESC
      LIMIT 3
    `);

    // Statistics
    const stats = await database.get(`
      SELECT 
        COUNT(*) as total_businesses,
        COUNT(logo_base64) as businesses_with_logo_base64,
        COUNT(CASE WHEN photos_local_json IS NOT NULL AND photos_local_json != '[]' THEN 1 END) as businesses_with_cached_photos,
        COUNT(CASE WHEN photos_json IS NOT NULL AND photos_json != '[]' THEN 1 END) as businesses_with_photos_json
      FROM businesses
    `);

    // Analyze first cached photo to see if it's real
    let samplePhotoAnalysis = null;
    if (detailedSample.length > 0 && detailedSample[0].photos_local_json) {
      try {
        const photos = JSON.parse(detailedSample[0].photos_local_json);
        if (photos && photos.length > 0 && photos[0].base64) {
          const base64Data = photos[0].base64;
          samplePhotoAnalysis = {
            business_name: detailedSample[0].name,
            photo_count: photos.length,
            first_photo_size: base64Data.length,
            is_likely_real_image: base64Data.length > 10000, // Real images are usually larger
            base64_preview: base64Data.substring(0, 100) + "...",
            has_image_header:
              base64Data.startsWith("data:image/") ||
              base64Data.includes("/9j/"), // JPEG header
          };
        }
      } catch (e) {
        samplePhotoAnalysis = { error: "Failed to parse photos_local_json" };
      }
    }

    // Analyze logo base64
    let sampleLogoAnalysis = null;
    if (detailedSample.length > 0 && detailedSample[0].logo_base64) {
      const logoData = detailedSample[0].logo_base64;
      sampleLogoAnalysis = {
        business_name: detailedSample[0].name,
        logo_size: logoData.length,
        is_likely_real_image: logoData.length > 5000,
        base64_preview: logoData.substring(0, 100) + "...",
        has_image_header:
          logoData.startsWith("data:image/") || logoData.includes("/9j/"),
      };
    }

    res.json({
      success: true,
      statistics: stats,
      sample_businesses: businesses.map((b) => ({
        id: b.id,
        name: b.name,
        has_logo_base64: b.has_logo_base64,
        logo_size_bytes: b.logo_base64_size,
        has_cached_photos: b.has_cached_photos,
        has_photos_json: b.has_photos_json,
      })),
      detailed_analysis: {
        sample_photo: samplePhotoAnalysis,
        sample_logo: sampleLogoAnalysis,
      },
      conclusion: {
        total_with_cached_images:
          stats.businesses_with_logo_base64 +
          stats.businesses_with_cached_photos,
        cached_images_available:
          stats.businesses_with_logo_base64 > 0 ||
          stats.businesses_with_cached_photos > 0,
      },
    });
  } catch (error) {
    console.error("Error inspecting cached data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
