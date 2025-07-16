import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fs from "fs";
import path from "path";

// Check if photos are properly stored and accessible
export const verifyPhotos: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Starting photo verification...");

    // Get first 10 businesses to check their photos
    const businesses = await businessService.getAllBusinesses();
    const sample = businesses.slice(0, 10);

    const verification = {
      totalBusinesses: businesses.length,
      sampleSize: sample.length,
      results: [] as any[],
      summary: {
        businessesWithPhotos: 0,
        totalPhotosChecked: 0,
        accessiblePhotos: 0,
        netlifyPhotos: 0,
        hostingerPhotos: 0,
        googlePhotos: 0,
        localFiles: 0,
      },
    };

    for (const business of sample) {
      const businessResult = {
        id: business.id,
        name: business.name,
        logoUrl: business.logoUrl,
        logoAccessible: false,
        photos: [] as any[],
        photoSummary: {
          total: 0,
          accessible: 0,
          netlify: 0,
          hostinger: 0,
          google: 0,
          localFile: 0,
        },
      };

      // Check logo
      if (business.logoUrl) {
        try {
          if (business.logoUrl.startsWith("/business-images/")) {
            // Check if local file exists
            const filePath = path.join(
              process.cwd(),
              "public",
              business.logoUrl,
            );
            businessResult.logoAccessible = fs.existsSync(filePath);
            if (businessResult.logoAccessible)
              verification.summary.localFiles++;
          } else {
            // Check if URL is accessible
            const response = await fetch(business.logoUrl, { method: "HEAD" });
            businessResult.logoAccessible = response.ok;
          }
        } catch (error) {
          businessResult.logoAccessible = false;
        }
      }

      // Check photos
      if (business.photos && business.photos.length > 0) {
        verification.summary.businessesWithPhotos++;
        businessResult.photoSummary.total = business.photos.length;

        for (let i = 0; i < Math.min(business.photos.length, 5); i++) {
          const photo = business.photos[i];
          let photoUrl: string;

          // Handle different photo formats
          if (typeof photo === "string") {
            photoUrl = photo;
          } else if (photo && typeof photo === "object") {
            photoUrl = photo.url || photo.src || photo.photoUrl || "";
          } else {
            photoUrl = "";
          }

          if (photoUrl) {
            verification.summary.totalPhotosChecked++;

            const photoCheck = {
              index: i + 1,
              url: photoUrl,
              accessible: false,
              type: "unknown",
              fileExists: false,
              fileSize: 0,
            };

            try {
              if (photoUrl.startsWith("/business-images/")) {
                // Check if local Netlify file exists
                const filePath = path.join(process.cwd(), "public", photoUrl);
                photoCheck.fileExists = fs.existsSync(filePath);
                if (photoCheck.fileExists) {
                  const stats = fs.statSync(filePath);
                  photoCheck.fileSize = stats.size;
                  photoCheck.accessible = stats.size > 1000; // File should be larger than 1KB
                  photoCheck.type = "netlify";
                  verification.summary.netlifyPhotos++;
                  verification.summary.localFiles++;
                  if (photoCheck.accessible)
                    verification.summary.accessiblePhotos++;
                }
              } else if (photoUrl.includes("reportvisascam.com")) {
                // Check Hostinger URL
                const response = await fetch(photoUrl, { method: "HEAD" });
                photoCheck.accessible = response.ok;
                photoCheck.type = "hostinger";
                if (photoCheck.accessible) {
                  verification.summary.hostingerPhotos++;
                  verification.summary.accessiblePhotos++;
                }
              } else if (
                photoUrl.includes("googleusercontent.com") ||
                photoUrl.includes("googleapis.com")
              ) {
                // Check Google URL
                const response = await fetch(photoUrl, { method: "HEAD" });
                photoCheck.accessible = response.ok;
                photoCheck.type = "google";
                if (photoCheck.accessible) {
                  verification.summary.googlePhotos++;
                  verification.summary.accessiblePhotos++;
                }
              } else {
                // Check other URLs
                const response = await fetch(photoUrl, { method: "HEAD" });
                photoCheck.accessible = response.ok;
                photoCheck.type = "external";
                if (photoCheck.accessible)
                  verification.summary.accessiblePhotos++;
              }
            } catch (error) {
              photoCheck.accessible = false;
            }

            businessResult.photos.push(photoCheck);
            if (photoCheck.accessible) businessResult.photoSummary.accessible++;
            if (photoCheck.type === "netlify")
              businessResult.photoSummary.netlify++;
            if (photoCheck.type === "hostinger")
              businessResult.photoSummary.hostinger++;
            if (photoCheck.type === "google")
              businessResult.photoSummary.google++;
            if (photoCheck.fileExists) businessResult.photoSummary.localFile++;
          }
        }
      }

      verification.results.push(businessResult);
    }

    // Calculate percentages
    const percentages = {
      businessesWithPhotos: Math.round(
        (verification.summary.businessesWithPhotos / verification.sampleSize) *
          100,
      ),
      accessiblePhotos:
        verification.summary.totalPhotosChecked > 0
          ? Math.round(
              (verification.summary.accessiblePhotos /
                verification.summary.totalPhotosChecked) *
                100,
            )
          : 0,
      netlifyPhotos:
        verification.summary.totalPhotosChecked > 0
          ? Math.round(
              (verification.summary.netlifyPhotos /
                verification.summary.totalPhotosChecked) *
                100,
            )
          : 0,
    };

    console.log("📊 Photo verification completed");
    console.log(
      `   ${verification.summary.businessesWithPhotos}/${verification.sampleSize} businesses have photos`,
    );
    console.log(
      `   ${verification.summary.accessiblePhotos}/${verification.summary.totalPhotosChecked} photos are accessible`,
    );
    console.log(
      `   ${verification.summary.netlifyPhotos} photos are on Netlify`,
    );

    res.json({
      success: true,
      verification,
      percentages,
      recommendations: generatePhotoRecommendations(verification, percentages),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Photo verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify photos",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

function generatePhotoRecommendations(
  verification: any,
  percentages: any,
): string[] {
  const recommendations = [];

  if (percentages.businessesWithPhotos < 50) {
    recommendations.push(
      "📸 Low photo coverage - consider fetching more photos from Google API",
    );
  }

  if (percentages.accessiblePhotos < 80) {
    recommendations.push(
      "⚠️ Some photos are not accessible - check URL validity",
    );
  }

  if (percentages.netlifyPhotos > 80) {
    recommendations.push(
      "✅ Most photos are on Netlify - excellent for performance",
    );
  } else if (percentages.netlifyPhotos < 20) {
    recommendations.push(
      "📥 Consider uploading photos to Netlify for better performance",
    );
  }

  if (verification.summary.localFiles > 0) {
    recommendations.push(
      `✅ Found ${verification.summary.localFiles} local image files - these will load very fast`,
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Photo setup looks good - ready for production");
  }

  return recommendations;
}

// Get sample photos for a specific business
export const getBusinessPhotos: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found",
      });
    }

    const photoData = {
      businessId: business.id,
      businessName: business.name,
      logoUrl: business.logoUrl,
      photos: [] as any[],
    };

    if (business.photos && business.photos.length > 0) {
      for (let i = 0; i < business.photos.length; i++) {
        const photo = business.photos[i];
        let photoUrl: string;

        if (typeof photo === "string") {
          photoUrl = photo;
        } else if (photo && typeof photo === "object") {
          photoUrl = photo.url || photo.src || photo.photoUrl || "";
        } else {
          photoUrl = "";
        }

        if (photoUrl) {
          let accessible = false;
          let fileExists = false;

          try {
            if (photoUrl.startsWith("/business-images/")) {
              const filePath = path.join(process.cwd(), "public", photoUrl);
              fileExists = fs.existsSync(filePath);
              accessible = fileExists;
            } else {
              const response = await fetch(photoUrl, { method: "HEAD" });
              accessible = response.ok;
            }
          } catch (error) {
            accessible = false;
          }

          photoData.photos.push({
            index: i + 1,
            url: photoUrl,
            accessible,
            fileExists,
            type: photoUrl.startsWith("/business-images/")
              ? "netlify"
              : photoUrl.includes("reportvisascam.com")
                ? "hostinger"
                : photoUrl.includes("googleusercontent.com")
                  ? "google"
                  : "external",
          });
        }
      }
    }

    res.json({
      success: true,
      photoData,
      summary: {
        totalPhotos: photoData.photos.length,
        accessiblePhotos: photoData.photos.filter((p) => p.accessible).length,
        netlifyPhotos: photoData.photos.filter((p) => p.type === "netlify")
          .length,
      },
    });
  } catch (error) {
    console.error("❌ Get business photos error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get business photos",
    });
  }
};
