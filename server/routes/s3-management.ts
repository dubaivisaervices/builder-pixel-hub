import { RequestHandler } from "express";
import { getS3Service, isS3Configured } from "../utils/s3Service";

export const getS3Status: RequestHandler = async (req, res) => {
  try {
    const configured = isS3Configured();

    if (!configured) {
      return res.json({
        configured: false,
        message:
          "S3 is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME environment variables.",
      });
    }

    const s3Service = getS3Service();
    const stats = await s3Service.getStorageStats();

    res.json({
      configured: true,
      stats,
      bucketName: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION || "us-east-1",
    });
  } catch (error) {
    console.error("Error getting S3 status:", error);
    res.status(500).json({
      error: "Failed to get S3 status",
      configured: isS3Configured(),
    });
  }
};

export const uploadBusinessImageToS3: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    const { businessId, imageUrl, imageType, businessName, caption } = req.body;

    if (!businessId || !imageUrl || !imageType) {
      return res.status(400).json({
        error: "businessId, imageUrl, and imageType are required",
      });
    }

    const s3Service = getS3Service();
    let s3Url: string;

    if (imageType === "logo") {
      s3Url = await s3Service.uploadBusinessLogo(
        businessId,
        imageUrl,
        businessName,
      );
    } else if (imageType === "photo") {
      s3Url = await s3Service.uploadBusinessPhoto(
        businessId,
        imageUrl,
        businessName,
        caption,
      );
    } else {
      return res.status(400).json({
        error: "imageType must be 'logo' or 'photo'",
      });
    }

    res.json({
      success: true,
      s3Url,
      originalUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    res.status(500).json({
      error: "Failed to upload image to S3",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const batchUploadBusinessImages: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    const { businesses } = req.body;

    if (!Array.isArray(businesses)) {
      return res.status(400).json({
        error: "businesses must be an array",
      });
    }

    const s3Service = getS3Service();
    const results = [];

    for (const business of businesses) {
      if (!business.id) {
        results.push({
          businessId: "unknown",
          success: false,
          error: "Business ID is required",
        });
        continue;
      }

      try {
        const result = await s3Service.uploadBusinessImages({
          id: business.id,
          name: business.name || "",
          logoUrl: business.logoUrl,
          photos: business.photos || [],
        });

        results.push({
          businessId: business.id,
          success: result.errors.length === 0,
          logoS3Url: result.logoS3Url,
          photoS3Urls: result.photoS3Urls,
          errors: result.errors,
        });
      } catch (error) {
        results.push({
          businessId: business.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.json({
      success: true,
      results,
      totalProcessed: businesses.length,
      successCount: results.filter((r) => r.success).length,
      errorCount: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error("Error batch uploading images to S3:", error);
    res.status(500).json({
      error: "Failed to batch upload images to S3",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const syncAllBusinessImagesToS3: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    // This would integrate with your existing database
    // For now, I'll create a placeholder that you can integrate with your actual business data

    res.json({
      message:
        "S3 sync started. This will be implemented to work with your existing business database.",
      note: "You'll need to integrate this with your existing business data fetching logic",
    });
  } catch (error) {
    console.error("Error syncing images to S3:", error);
    res.status(500).json({
      error: "Failed to sync images to S3",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteS3Object: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: "Object key is required",
      });
    }

    const s3Service = getS3Service();
    await s3Service.deleteObject(key);

    res.json({
      success: true,
      message: `Object ${key} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting S3 object:", error);
    res.status(500).json({
      error: "Failed to delete S3 object",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const listS3Objects: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    const { prefix = "businesses/", maxKeys = "100" } = req.query;
    const s3Service = getS3Service();

    const objects = await s3Service.listObjects(
      prefix as string,
      parseInt(maxKeys as string) || 100,
    );

    res.json({
      success: true,
      objects,
      count: objects.length,
      prefix,
    });
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    res.status(500).json({
      error: "Failed to list S3 objects",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
