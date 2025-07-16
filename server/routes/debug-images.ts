import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { EnhancedImageFetcher } from "../utils/enhancedImageFetcher";

export const debugBusinessImages: RequestHandler = async (req, res) => {
  try {
    const businesses = await businessService.getBusinessesPaginated(0, 5);

    const imageAnalysis = [];

    for (const business of businesses) {
      const businessInfo: any = {
        id: business.id,
        name: business.name,
        logoUrl: business.logoUrl,
        logoAnalysis: null,
        photos: [],
        photoAnalysis: [],
      };

      // Analyze logo URL
      if (business.logoUrl) {
        businessInfo.logoAnalysis = {
          isGoogleImage: EnhancedImageFetcher.isGoogleImageUrl(
            business.logoUrl,
          ),
          optimizedUrl: EnhancedImageFetcher.getOptimizedGoogleImageUrl(
            business.logoUrl,
          ),
          originalLength: business.logoUrl.length,
        };

        // Test fetch the logo
        try {
          const fetchResult = await EnhancedImageFetcher.fetchImage(
            business.logoUrl,
          );
          businessInfo.logoAnalysis.fetchResult = {
            success: fetchResult.success,
            error: fetchResult.error,
            contentType: fetchResult.contentType,
            bufferSize: fetchResult.buffer?.length || 0,
          };
        } catch (error) {
          businessInfo.logoAnalysis.fetchResult = {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }

      // Analyze photo URLs
      if (business.photos && Array.isArray(business.photos)) {
        businessInfo.photos = business.photos.slice(0, 3).map((photo: any) => ({
          url: photo.url,
          caption: photo.caption,
        }));

        for (const photo of business.photos.slice(0, 2)) {
          if (photo.url) {
            const photoAnalysis: any = {
              url: photo.url,
              isGoogleImage: EnhancedImageFetcher.isGoogleImageUrl(photo.url),
              optimizedUrl: EnhancedImageFetcher.getOptimizedGoogleImageUrl(
                photo.url,
              ),
            };

            // Test fetch the photo
            try {
              const fetchResult = await EnhancedImageFetcher.fetchImage(
                photo.url,
              );
              photoAnalysis.fetchResult = {
                success: fetchResult.success,
                error: fetchResult.error,
                contentType: fetchResult.contentType,
                bufferSize: fetchResult.buffer?.length || 0,
              };
            } catch (error) {
              photoAnalysis.fetchResult = {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              };
            }

            businessInfo.photoAnalysis.push(photoAnalysis);
          }
        }
      }

      imageAnalysis.push(businessInfo);
    }

    res.json({
      success: true,
      message: "Image analysis completed",
      totalBusinessesAnalyzed: businesses.length,
      analysis: imageAnalysis,
    });
  } catch (error) {
    console.error("Error debugging images:", error);
    res.status(500).json({
      error: "Failed to debug images",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const testSingleImageFetch: RequestHandler = async (req, res) => {
  try {
    const { imageUrl } = req.query;

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({
        error: "imageUrl query parameter is required",
      });
    }

    console.log(`Testing image fetch for: ${imageUrl}`);

    const fetchResult = await EnhancedImageFetcher.fetchImage(imageUrl);

    res.json({
      imageUrl,
      isGoogleImage: EnhancedImageFetcher.isGoogleImageUrl(imageUrl),
      optimizedUrl: EnhancedImageFetcher.getOptimizedGoogleImageUrl(imageUrl),
      fetchResult: {
        success: fetchResult.success,
        error: fetchResult.error,
        contentType: fetchResult.contentType,
        bufferSize: fetchResult.buffer?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error testing image fetch:", error);
    res.status(500).json({
      error: "Failed to test image fetch",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
