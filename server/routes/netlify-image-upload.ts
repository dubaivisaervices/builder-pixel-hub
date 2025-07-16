import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { businessService } from "../database/businessService";

// Configure multer to save directly to Netlify public directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save directly to public/business-images for Netlify static hosting
    const uploadDir = path.join(process.cwd(), "public", "business-images");

    // Create directory structure
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create subdirectories for logos and photos
    const logoDir = path.join(uploadDir, "logos");
    const photoDir = path.join(uploadDir, "photos");

    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    if (!fs.existsSync(photoDir)) {
      fs.mkdirSync(photoDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const businessId = req.body.businessId;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);

    if (file.fieldname === "logo") {
      // Save logo with standardized naming
      cb(null, `logos/logo-${businessId}${extension}`);
    } else {
      // Save photos with index
      const photoIndex = req.body.photoIndex || "1";
      cb(null, `photos/photo_${photoIndex}-${businessId}${extension}`);
    }
  },
});

// File filter for images only
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Configure multer with 5MB limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload logo directly to Netlify public directory
export const uploadLogoToNetlify: RequestHandler = [
  upload.single("logo"),
  async (req, res) => {
    try {
      const { businessId } = req.body;
      const file = req.file;

      if (!file || !businessId) {
        return res.status(400).json({
          success: false,
          error: "Missing logo file or business ID",
        });
      }

      console.log(
        `📁 Uploaded logo for business ${businessId}: ${file.filename}`,
      );

      // Generate Netlify URL for the uploaded logo
      const netlifyLogoUrl = `/business-images/${file.filename}`;

      // Update business in database with new logo URL
      await businessService.updateBusinessLogo(businessId, netlifyLogoUrl);

      res.json({
        success: true,
        message: "Logo uploaded successfully to Netlify",
        businessId,
        logoUrl: netlifyLogoUrl,
        filePath: file.path,
        size: file.size,
      });
    } catch (error) {
      console.error("Error uploading logo to Netlify:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload logo",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
];

// Upload multiple photos directly to Netlify public directory
export const uploadPhotosToNetlify: RequestHandler = [
  upload.array("photos", 10), // Allow up to 10 photos
  async (req, res) => {
    try {
      const { businessId } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0 || !businessId) {
        return res.status(400).json({
          success: false,
          error: "Missing photo files or business ID",
        });
      }

      console.log(
        `📁 Uploaded ${files.length} photos for business ${businessId}`,
      );

      // Generate Netlify URLs for uploaded photos
      const photoUrls = files.map(
        (file) => `/business-images/${file.filename}`,
      );

      // Update business in database with new photo URLs
      await businessService.updateBusinessPhotos(businessId, photoUrls);

      res.json({
        success: true,
        message: `${files.length} photos uploaded successfully to Netlify`,
        businessId,
        photoUrls,
        uploadedFiles: files.map((file) => ({
          filename: file.filename,
          size: file.size,
          url: `/business-images/${file.filename}`,
        })),
      });
    } catch (error) {
      console.error("Error uploading photos to Netlify:", error);
      res.status(500).json({
        success: false,
        error: "Failed to upload photos",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
];

// Download and save image from URL to Netlify public directory
export const downloadImageToNetlify: RequestHandler = async (req, res) => {
  try {
    const { businessId, imageUrl, type, index } = req.body;

    if (!businessId || !imageUrl || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing businessId, imageUrl, or type",
      });
    }

    console.log(
      `🔄 Downloading ${type} for business ${businessId} from: ${imageUrl}`,
    );

    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Determine file extension from content type or URL
    const contentType = response.headers.get("content-type");
    let extension = ".jpg";
    if (contentType?.includes("png")) extension = ".png";
    if (contentType?.includes("gif")) extension = ".gif";
    if (contentType?.includes("webp")) extension = ".webp";

    // Create filename based on type
    let filename: string;
    if (type === "logo") {
      filename = `logos/logo-${businessId}${extension}`;
    } else {
      const photoIndex = index || "1";
      filename = `photos/photo_${photoIndex}-${businessId}${extension}`;
    }

    // Save to public directory
    const uploadDir = path.join(process.cwd(), "public", "business-images");
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, imageBuffer);

    const netlifyUrl = `/business-images/${filename}`;

    // Update business in database
    if (type === "logo") {
      await businessService.updateBusinessLogo(businessId, netlifyUrl);
    } else {
      // For photos, get existing photos and add new one
      const business = await businessService.getBusinessById(businessId);
      const existingPhotos = business?.photos || [];
      const newPhotos = [...existingPhotos, netlifyUrl];
      await businessService.updateBusinessPhotos(businessId, newPhotos);
    }

    console.log(
      `✅ Successfully saved ${type} for business ${businessId}: ${netlifyUrl}`,
    );

    res.json({
      success: true,
      message: `${type} downloaded and saved to Netlify`,
      businessId,
      url: netlifyUrl,
      filename,
      size: imageBuffer.length,
      originalUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error downloading image to Netlify:", error);
    res.status(500).json({
      success: false,
      error: "Failed to download and save image",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Batch download images for multiple businesses
export const batchDownloadToNetlify: RequestHandler = async (req, res) => {
  try {
    const { businesses } = req.body;

    if (!businesses || !Array.isArray(businesses)) {
      return res.status(400).json({
        success: false,
        error: "Missing businesses array",
      });
    }

    console.log(
      `🔄 Starting batch download for ${businesses.length} businesses`,
    );

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const business of businesses) {
      try {
        const { id, logoUrl, photos } = business;

        const businessResult = {
          businessId: id,
          logo: null as any,
          photos: [] as any[],
          errors: [] as string[],
        };

        // Download logo if available
        if (logoUrl) {
          try {
            const logoResponse = await fetch(logoUrl);
            if (logoResponse.ok) {
              const buffer = await logoResponse.arrayBuffer();
              const logoBuffer = Buffer.from(buffer);

              const filename = `logos/logo-${id}.jpg`;
              const filePath = path.join(
                process.cwd(),
                "public",
                "business-images",
                filename,
              );

              // Ensure directory exists
              const dirPath = path.dirname(filePath);
              if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
              }

              fs.writeFileSync(filePath, logoBuffer);

              const netlifyUrl = `/business-images/${filename}`;
              await businessService.updateBusinessLogo(id, netlifyUrl);

              businessResult.logo = {
                url: netlifyUrl,
                size: logoBuffer.length,
                originalUrl: logoUrl,
              };
            }
          } catch (error) {
            businessResult.errors.push(
              `Logo download failed: ${error.message}`,
            );
          }
        }

        // Download photos if available
        if (photos && Array.isArray(photos)) {
          for (let i = 0; i < Math.min(photos.length, 5); i++) {
            try {
              const photoUrl = photos[i];
              const photoResponse = await fetch(photoUrl);
              if (photoResponse.ok) {
                const buffer = await photoResponse.arrayBuffer();
                const photoBuffer = Buffer.from(buffer);

                const filename = `photos/photo_${i + 1}-${id}.jpg`;
                const filePath = path.join(
                  process.cwd(),
                  "public",
                  "business-images",
                  filename,
                );

                // Ensure directory exists
                const dirPath = path.dirname(filePath);
                if (!fs.existsSync(dirPath)) {
                  fs.mkdirSync(dirPath, { recursive: true });
                }

                fs.writeFileSync(filePath, photoBuffer);

                const netlifyUrl = `/business-images/${filename}`;
                businessResult.photos.push({
                  url: netlifyUrl,
                  size: photoBuffer.length,
                  originalUrl: photoUrl,
                  index: i + 1,
                });
              }
            } catch (error) {
              businessResult.errors.push(
                `Photo ${i + 1} download failed: ${error.message}`,
              );
            }
          }

          // Update business photos in database
          if (businessResult.photos.length > 0) {
            const photoUrls = businessResult.photos.map((p) => p.url);
            await businessService.updateBusinessPhotos(id, photoUrls);
          }
        }

        results.push(businessResult);

        if (businessResult.errors.length === 0) {
          successCount++;
        } else {
          errorCount++;
        }

        // Add small delay to avoid overwhelming the servers
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        results.push({
          businessId: business.id,
          logo: null,
          photos: [],
          errors: [`Business processing failed: ${error.message}`],
        });
      }
    }

    console.log(
      `✅ Batch download completed: ${successCount} success, ${errorCount} errors`,
    );

    res.json({
      success: true,
      message: `Batch download completed for ${businesses.length} businesses`,
      summary: {
        total: businesses.length,
        successful: successCount,
        errors: errorCount,
      },
      results: results.slice(0, 10), // Return first 10 results for preview
    });
  } catch (error) {
    console.error("Error in batch download to Netlify:", error);
    res.status(500).json({
      success: false,
      error: "Failed to batch download images",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get stats about Netlify stored images
export const getNetlifyImageStats: RequestHandler = async (req, res) => {
  try {
    const businessImagesDir = path.join(
      process.cwd(),
      "public",
      "business-images",
    );
    const logoDir = path.join(businessImagesDir, "logos");
    const photoDir = path.join(businessImagesDir, "photos");

    const stats = {
      totalLogos: 0,
      totalPhotos: 0,
      totalSize: 0,
      directories: {
        businessImages: fs.existsSync(businessImagesDir),
        logos: fs.existsSync(logoDir),
        photos: fs.existsSync(photoDir),
      },
    };

    // Count logos
    if (fs.existsSync(logoDir)) {
      const logoFiles = fs.readdirSync(logoDir);
      stats.totalLogos = logoFiles.length;

      logoFiles.forEach((file) => {
        const filePath = path.join(logoDir, file);
        const fileStat = fs.statSync(filePath);
        stats.totalSize += fileStat.size;
      });
    }

    // Count photos
    if (fs.existsSync(photoDir)) {
      const photoFiles = fs.readdirSync(photoDir);
      stats.totalPhotos = photoFiles.length;

      photoFiles.forEach((file) => {
        const filePath = path.join(photoDir, file);
        const fileStat = fs.statSync(filePath);
        stats.totalSize += fileStat.size;
      });
    }

    res.json({
      success: true,
      stats,
      message: `Found ${stats.totalLogos} logos and ${stats.totalPhotos} photos stored in Netlify`,
      totalSizeMB: Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100,
    });
  } catch (error) {
    console.error("Error getting Netlify image stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get image statistics",
    });
  }
};
