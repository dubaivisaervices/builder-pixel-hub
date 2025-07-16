import { RequestHandler } from "express";
import { businessService } from "../database/businessService";

// Get detailed sample business data to understand structure
export const getSampleBusinessData: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Getting sample business data...");

    // Get first 5 businesses with full details
    const businesses = await businessService.getAllBusinesses();
    const sample = businesses.slice(0, 5);

    const detailedSample = sample.map((business) => ({
      id: business.id,
      name: business.name,
      category: business.category,
      logoUrl: business.logoUrl,
      logoUrlType: business.logoUrl
        ? business.logoUrl.includes("/business-images/")
          ? "netlify"
          : business.logoUrl.includes("reportvisascam.com")
            ? "hostinger"
            : business.logoUrl.includes("googleusercontent.com")
              ? "google"
              : "other"
        : "none",
      photos: business.photos,
      photoCount: business.photos ? business.photos.length : 0,
      photoStructure: business.photos
        ? Array.isArray(business.photos)
          ? "array"
          : typeof business.photos
        : "none",
      firstPhotoSample:
        business.photos && business.photos.length > 0
          ? business.photos[0]
          : null,
      photoUrlTypes: business.photos
        ? business.photos.slice(0, 3).map((photo: any) => {
            const url =
              typeof photo === "string"
                ? photo
                : photo?.url || photo?.src || "";
            return {
              type: typeof photo,
              url: url,
              urlType: url
                ? url.includes("/business-images/")
                  ? "netlify"
                  : url.includes("reportvisascam.com")
                    ? "hostinger"
                    : url.includes("googleusercontent.com")
                      ? "google"
                      : "other"
                : "none",
            };
          })
        : [],
    }));

    // Count URL types across all businesses
    const urlTypeCounts = {
      logos: { netlify: 0, hostinger: 0, google: 0, other: 0, none: 0 },
      photos: { netlify: 0, hostinger: 0, google: 0, other: 0, none: 0 },
    };

    businesses.forEach((business) => {
      // Count logo types
      if (business.logoUrl) {
        if (business.logoUrl.includes("/business-images/"))
          urlTypeCounts.logos.netlify++;
        else if (business.logoUrl.includes("reportvisascam.com"))
          urlTypeCounts.logos.hostinger++;
        else if (business.logoUrl.includes("googleusercontent.com"))
          urlTypeCounts.logos.google++;
        else urlTypeCounts.logos.other++;
      } else {
        urlTypeCounts.logos.none++;
      }

      // Count photo types
      if (business.photos && business.photos.length > 0) {
        business.photos.forEach((photo: any) => {
          const url =
            typeof photo === "string" ? photo : photo?.url || photo?.src || "";
          if (url) {
            if (url.includes("/business-images/"))
              urlTypeCounts.photos.netlify++;
            else if (url.includes("reportvisascam.com"))
              urlTypeCounts.photos.hostinger++;
            else if (url.includes("googleusercontent.com"))
              urlTypeCounts.photos.google++;
            else urlTypeCounts.photos.other++;
          } else {
            urlTypeCounts.photos.none++;
          }
        });
      }
    });

    console.log("📊 Sample business data analysis completed");
    console.log(`   Total businesses: ${businesses.length}`);
    console.log(`   Logo URL types:`, urlTypeCounts.logos);
    console.log(`   Photo URL types:`, urlTypeCounts.photos);

    res.json({
      success: true,
      totalBusinesses: businesses.length,
      sampleBusinesses: detailedSample,
      urlTypeCounts,
      summary: {
        logoNetlifyPercentage: Math.round(
          (urlTypeCounts.logos.netlify / businesses.length) * 100,
        ),
        photoNetlifyPercentage: Math.round(
          (urlTypeCounts.photos.netlify /
            (urlTypeCounts.photos.netlify +
              urlTypeCounts.photos.hostinger +
              urlTypeCounts.photos.google +
              urlTypeCounts.photos.other)) *
            100,
        ),
        avgPhotosPerBusiness: Math.round(
          (urlTypeCounts.photos.netlify +
            urlTypeCounts.photos.hostinger +
            urlTypeCounts.photos.google +
            urlTypeCounts.photos.other) /
            businesses.length,
        ),
      },
      recommendations: generateDataRecommendations(
        urlTypeCounts,
        businesses.length,
      ),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Sample business data error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get sample business data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

function generateDataRecommendations(
  urlTypeCounts: any,
  totalBusinesses: number,
): string[] {
  const recommendations = [];

  // Logo recommendations
  const logoNetlifyPercent =
    (urlTypeCounts.logos.netlify / totalBusinesses) * 100;
  const logoHostingerPercent =
    (urlTypeCounts.logos.hostinger / totalBusinesses) * 100;

  if (logoNetlifyPercent > 80) {
    recommendations.push(
      "✅ Most logos are already on Netlify - great for performance!",
    );
  } else if (logoHostingerPercent > 50) {
    recommendations.push(
      "📥 Many logos are on Hostinger - consider downloading to Netlify for faster loading",
    );
  }

  // Photo recommendations
  const totalPhotos =
    urlTypeCounts.photos.netlify +
    urlTypeCounts.photos.hostinger +
    urlTypeCounts.photos.google +
    urlTypeCounts.photos.other;
  const photoNetlifyPercent =
    (urlTypeCounts.photos.netlify / totalPhotos) * 100;
  const photoHostingerPercent =
    (urlTypeCounts.photos.hostinger / totalPhotos) * 100;

  if (photoNetlifyPercent > 80) {
    recommendations.push(
      "✅ Most photos are already on Netlify - excellent for user experience!",
    );
  } else if (photoHostingerPercent > 50) {
    recommendations.push(
      "📥 Many photos are on Hostinger - consider downloading to Netlify for better performance",
    );
  }

  // General recommendations
  const avgPhotos = totalPhotos / totalBusinesses;
  if (avgPhotos < 2) {
    recommendations.push(
      "📸 Low photo count per business - consider fetching more photos from Google API",
    );
  } else if (avgPhotos > 4) {
    recommendations.push(
      "🎉 Good photo coverage - businesses have plenty of visual content",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("📊 Data structure looks good - ready for operations");
  }

  return recommendations;
}
