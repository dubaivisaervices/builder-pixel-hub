import { RequestHandler } from "express";
import { businessService } from "../database/businessService";

// Debug endpoint to check business data quality
export const debugBusinessData: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Starting business data quality check...");

    // Get sample of businesses to check their data
    const businesses = await businessService.getAllBusinesses();
    console.log(`📊 Total businesses in database: ${businesses.length}`);

    const sampleSize = Math.min(20, businesses.length);
    const sample = businesses.slice(0, sampleSize);

    const analysis = {
      totalBusinesses: businesses.length,
      sampleSize: sampleSize,
      logoAnalysis: {
        withLogoUrl: 0,
        withoutLogoUrl: 0,
        realUrls: 0,
        placeholderUrls: 0,
        hostingerUrls: 0,
        googleUrls: 0,
        netlifyUrls: 0,
        brokenUrls: 0,
      },
      photoAnalysis: {
        withPhotos: 0,
        withoutPhotos: 0,
        totalPhotos: 0,
        realPhotoUrls: 0,
        placeholderPhotoUrls: 0,
        hostingerPhotoUrls: 0,
        googlePhotoUrls: 0,
        netlifyPhotoUrls: 0,
      },
      sampleBusinesses: [] as any[],
    };

    // Analyze sample businesses
    for (const business of sample) {
      const businessInfo = {
        id: business.id,
        name: business.name,
        category: business.category,
        logoUrl: business.logoUrl,
        logoType: "none",
        photos: business.photos || [],
        photoCount: (business.photos || []).length,
        photoTypes: [] as string[],
      };

      // Analyze logo URL
      if (business.logoUrl) {
        analysis.logoAnalysis.withLogoUrl++;

        if (business.logoUrl.includes("reportvisascam.com")) {
          analysis.logoAnalysis.hostingerUrls++;
          businessInfo.logoType = "hostinger";
        } else if (
          business.logoUrl.includes("googleusercontent.com") ||
          business.logoUrl.includes("googleapis.com")
        ) {
          analysis.logoAnalysis.googleUrls++;
          businessInfo.logoType = "google";
        } else if (business.logoUrl.includes("/business-images/")) {
          analysis.logoAnalysis.netlifyUrls++;
          businessInfo.logoType = "netlify";
        } else if (
          business.logoUrl.includes("placeholder") ||
          business.logoUrl.includes("example")
        ) {
          analysis.logoAnalysis.placeholderUrls++;
          businessInfo.logoType = "placeholder";
        } else {
          analysis.logoAnalysis.realUrls++;
          businessInfo.logoType = "external";
        }
      } else {
        analysis.logoAnalysis.withoutLogoUrl++;
        businessInfo.logoType = "none";
      }

      // Analyze photos
      if (business.photos && business.photos.length > 0) {
        analysis.photoAnalysis.withPhotos++;
        analysis.photoAnalysis.totalPhotos += business.photos.length;

        business.photos.forEach((photo: any) => {
          const photoUrl = typeof photo === "string" ? photo : photo.url;

          if (photoUrl) {
            if (photoUrl.includes("reportvisascam.com")) {
              analysis.photoAnalysis.hostingerPhotoUrls++;
              businessInfo.photoTypes.push("hostinger");
            } else if (
              photoUrl.includes("googleusercontent.com") ||
              photoUrl.includes("googleapis.com")
            ) {
              analysis.photoAnalysis.googlePhotoUrls++;
              businessInfo.photoTypes.push("google");
            } else if (photoUrl.includes("/business-images/")) {
              analysis.photoAnalysis.netlifyPhotoUrls++;
              businessInfo.photoTypes.push("netlify");
            } else if (
              photoUrl.includes("placeholder") ||
              photoUrl.includes("example")
            ) {
              analysis.photoAnalysis.placeholderPhotoUrls++;
              businessInfo.photoTypes.push("placeholder");
            } else {
              analysis.photoAnalysis.realPhotoUrls++;
              businessInfo.photoTypes.push("external");
            }
          }
        });
      } else {
        analysis.photoAnalysis.withoutPhotos++;
      }

      analysis.sampleBusinesses.push(businessInfo);
    }

    // Calculate percentages
    const logoPercentages = {
      withLogo: Math.round(
        (analysis.logoAnalysis.withLogoUrl / sampleSize) * 100,
      ),
      hostinger: Math.round(
        (analysis.logoAnalysis.hostingerUrls / sampleSize) * 100,
      ),
      google: Math.round((analysis.logoAnalysis.googleUrls / sampleSize) * 100),
      netlify: Math.round(
        (analysis.logoAnalysis.netlifyUrls / sampleSize) * 100,
      ),
      placeholder: Math.round(
        (analysis.logoAnalysis.placeholderUrls / sampleSize) * 100,
      ),
    };

    const photoPercentages = {
      withPhotos: Math.round(
        (analysis.photoAnalysis.withPhotos / sampleSize) * 100,
      ),
      averagePhotosPerBusiness: Math.round(
        analysis.photoAnalysis.totalPhotos / sampleSize,
      ),
      hostingerPhotos: Math.round(
        (analysis.photoAnalysis.hostingerPhotoUrls /
          analysis.photoAnalysis.totalPhotos) *
          100,
      ),
      googlePhotos: Math.round(
        (analysis.photoAnalysis.googlePhotoUrls /
          analysis.photoAnalysis.totalPhotos) *
          100,
      ),
      netlifyPhotos: Math.round(
        (analysis.photoAnalysis.netlifyPhotoUrls /
          analysis.photoAnalysis.totalPhotos) *
          100,
      ),
    };

    console.log("📊 Data quality analysis completed");
    console.log(`   Logos: ${logoPercentages.withLogo}% have logo URLs`);
    console.log(
      `   Photos: ${photoPercentages.withPhotos}% have photos (avg ${photoPercentages.averagePhotosPerBusiness} per business)`,
    );
    console.log(
      `   Logo sources: Hostinger ${logoPercentages.hostinger}%, Google ${logoPercentages.google}%, Netlify ${logoPercentages.netlify}%`,
    );

    res.json({
      success: true,
      analysis,
      percentages: {
        logos: logoPercentages,
        photos: photoPercentages,
      },
      recommendations: generateRecommendations(analysis),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Debug business data error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze business data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Generate recommendations based on analysis
function generateRecommendations(analysis: any): string[] {
  const recommendations = [];

  // Logo recommendations
  if (
    analysis.logoAnalysis.withoutLogoUrl > analysis.logoAnalysis.withLogoUrl
  ) {
    recommendations.push(
      "⚠️ Many businesses missing logo URLs - consider fetching from Google Places API",
    );
  }

  if (analysis.logoAnalysis.placeholderUrls > 0) {
    recommendations.push(
      "🔄 Some businesses have placeholder logos - replace with real logos",
    );
  }

  if (analysis.logoAnalysis.googleUrls > 0) {
    recommendations.push(
      "��� Google API logos detected - should be downloaded to Netlify for faster loading",
    );
  }

  if (analysis.logoAnalysis.hostingerUrls > 0) {
    recommendations.push(
      "✅ Hostinger logos detected - these are likely real business logos",
    );
  }

  // Photo recommendations
  if (
    analysis.photoAnalysis.withoutPhotos > analysis.photoAnalysis.withPhotos
  ) {
    recommendations.push(
      "📸 Many businesses missing photos - consider fetching from Google Places API",
    );
  }

  if (analysis.photoAnalysis.totalPhotos < analysis.totalBusinesses * 2) {
    recommendations.push(
      "📷 Low photo count per business - consider fetching more photos",
    );
  }

  if (analysis.photoAnalysis.googlePhotoUrls > 0) {
    recommendations.push(
      "📥 Google API photos detected - should be downloaded to Netlify",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "✅ Business data looks good - ready for Netlify upload",
    );
  }

  return recommendations;
}

// Test specific business URLs
export const testBusinessUrls: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: "Business ID required",
      });
    }

    const business = await businessService.getBusinessById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: "Business not found",
      });
    }

    const urlTests = {
      business: {
        id: business.id,
        name: business.name,
      },
      logoTest: null as any,
      photoTests: [] as any[],
    };

    // Test logo URL
    if (business.logoUrl) {
      try {
        console.log(`🔍 Testing logo URL: ${business.logoUrl}`);
        const logoResponse = await fetch(business.logoUrl, { method: "HEAD" });
        urlTests.logoTest = {
          url: business.logoUrl,
          status: logoResponse.status,
          accessible: logoResponse.ok,
          contentType: logoResponse.headers.get("content-type"),
          contentLength: logoResponse.headers.get("content-length"),
        };
      } catch (error) {
        urlTests.logoTest = {
          url: business.logoUrl,
          status: "error",
          accessible: false,
          error: error.message,
        };
      }
    }

    // Test photo URLs
    if (business.photos && business.photos.length > 0) {
      for (let i = 0; i < Math.min(business.photos.length, 5); i++) {
        const photo = business.photos[i];
        const photoUrl = typeof photo === "string" ? photo : photo.url;

        if (photoUrl) {
          try {
            console.log(`🔍 Testing photo URL ${i + 1}: ${photoUrl}`);
            const photoResponse = await fetch(photoUrl, { method: "HEAD" });
            urlTests.photoTests.push({
              index: i + 1,
              url: photoUrl,
              status: photoResponse.status,
              accessible: photoResponse.ok,
              contentType: photoResponse.headers.get("content-type"),
              contentLength: photoResponse.headers.get("content-length"),
            });
          } catch (error) {
            urlTests.photoTests.push({
              index: i + 1,
              url: photoUrl,
              status: "error",
              accessible: false,
              error: error.message,
            });
          }
        }
      }
    }

    res.json({
      success: true,
      urlTests,
      summary: {
        logoAccessible: urlTests.logoTest?.accessible || false,
        photosAccessible: urlTests.photoTests.filter((p) => p.accessible)
          .length,
        totalPhotos: urlTests.photoTests.length,
      },
    });
  } catch (error) {
    console.error("❌ URL test error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to test business URLs",
    });
  }
};
