import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import { getS3Service, isS3Configured } from "../utils/s3Service";

interface S3SyncResult {
  businessId: string;
  businessName: string;
  logoUploaded: boolean;
  photosUploaded: number;
  photosFailed: number;
  errors: string[];
}

export const syncBusinessesToS3: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
        message: "Please configure AWS credentials and S3 bucket name",
      });
    }

    console.log("☁️ Starting S3 sync for all businesses...");

    const businesses = await businessService.getAllBusinesses();
    const s3Service = getS3Service();
    const results: S3SyncResult[] = [];
    let totalLogosUploaded = 0;
    let totalPhotosUploaded = 0;

    for (const business of businesses) {
      const result: S3SyncResult = {
        businessId: business.id,
        businessName: business.name,
        logoUploaded: false,
        photosUploaded: 0,
        photosFailed: 0,
        errors: [],
      };

      console.log(`🔄 Processing ${business.name}...`);

      // Upload logo if it exists
      if (business.logoUrl) {
        try {
          const logoS3Url = await s3Service.uploadBusinessLogo(
            business.id,
            business.logoUrl,
            business.name,
          );
          result.logoUploaded = true;
          totalLogosUploaded++;
          console.log(`✅ Logo uploaded: ${logoS3Url}`);

          // Update business with S3 URL
          await businessService.updateBusiness(business.id, {
            ...business,
            logoS3Url: logoS3Url,
          });
        } catch (error) {
          result.errors.push(
            `Logo upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          console.error(`❌ Logo upload failed for ${business.name}: ${error}`);
        }
      }

      // Upload photos if they exist
      if (business.photos && business.photos.length > 0) {
        const updatedPhotos = [];

        for (const photo of business.photos) {
          try {
            // Skip if already uploaded to S3
            if (photo.s3Url) {
              updatedPhotos.push(photo);
              continue;
            }

            if (!photo.url) {
              updatedPhotos.push(photo);
              continue;
            }

            const photoS3Url = await s3Service.uploadBusinessPhoto(
              business.id,
              photo.url,
              business.name,
              photo.caption,
            );

            const updatedPhoto = {
              ...photo,
              s3Url: photoS3Url,
              s3UploadedAt: new Date().toISOString(),
            };

            updatedPhotos.push(updatedPhoto);
            result.photosUploaded++;
            totalPhotosUploaded++;
            console.log(`✅ Photo uploaded: ${photoS3Url}`);

            // Small delay to avoid overwhelming S3
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            result.photosFailed++;
            result.errors.push(
              `Photo upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
            console.error(
              `❌ Photo upload failed for ${business.name}: ${error}`,
            );
            // Keep original photo
            updatedPhotos.push(photo);
          }
        }

        // Update business with new photo data
        if (updatedPhotos.length > 0) {
          try {
            await businessService.updateBusiness(business.id, {
              ...business,
              photos: updatedPhotos,
            });
          } catch (error) {
            result.errors.push(
              `Database update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      }

      results.push(result);

      // Log progress
      const processed = results.length;
      const total = businesses.length;
      if (processed % 10 === 0 || processed === total) {
        console.log(`📊 Progress: ${processed}/${total} businesses processed`);
      }
    }

    const summary = {
      totalBusinesses: businesses.length,
      businessesProcessed: results.length,
      totalLogosUploaded,
      totalPhotosUploaded,
      businessesWithErrors: results.filter((r) => r.errors.length > 0).length,
      results,
    };

    console.log("☁️ S3 sync completed!");
    console.log(
      `📊 Summary: ${totalLogosUploaded} logos, ${totalPhotosUploaded} photos uploaded`,
    );

    res.json({
      success: true,
      message: "S3 sync completed successfully",
      summary,
    });
  } catch (error) {
    console.error("Error syncing businesses to S3:", error);
    res.status(500).json({
      error: "S3 sync failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const syncSingleBusinessToS3: RequestHandler = async (req, res) => {
  try {
    if (!isS3Configured()) {
      return res.status(400).json({
        error: "S3 is not configured",
      });
    }

    const { businessId } = req.params;
    const business = await businessService.getBusinessById(businessId);

    if (!business) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    const s3Service = getS3Service();
    const result: S3SyncResult = {
      businessId: business.id,
      businessName: business.name,
      logoUploaded: false,
      photosUploaded: 0,
      photosFailed: 0,
      errors: [],
    };

    // Upload logo
    if (business.logoUrl) {
      try {
        const logoS3Url = await s3Service.uploadBusinessLogo(
          business.id,
          business.logoUrl,
          business.name,
        );
        result.logoUploaded = true;

        // Update business with S3 URL
        await businessService.updateBusiness(business.id, {
          ...business,
          logoS3Url: logoS3Url,
        });
      } catch (error) {
        result.errors.push(`Logo upload failed: ${error}`);
      }
    }

    // Upload photos
    if (business.photos && business.photos.length > 0) {
      const updatedPhotos = [];

      for (const photo of business.photos) {
        try {
          if (!photo.url || photo.s3Url) {
            updatedPhotos.push(photo);
            continue;
          }

          const photoS3Url = await s3Service.uploadBusinessPhoto(
            business.id,
            photo.url,
            business.name,
            photo.caption,
          );

          updatedPhotos.push({
            ...photo,
            s3Url: photoS3Url,
            s3UploadedAt: new Date().toISOString(),
          });

          result.photosUploaded++;
        } catch (error) {
          result.photosFailed++;
          result.errors.push(`Photo upload failed: ${error}`);
          updatedPhotos.push(photo);
        }
      }

      // Update business
      await businessService.updateBusiness(business.id, {
        ...business,
        photos: updatedPhotos,
      });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error syncing single business to S3:", error);
    res.status(500).json({
      error: "Failed to sync business to S3",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
