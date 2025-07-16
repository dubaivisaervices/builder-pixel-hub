import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "business-images");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const businessId = req.body.businessId || `business-${Date.now()}`;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);

    if (file.fieldname === "logo") {
      cb(null, `logo-${businessId}-${timestamp}${extension}`);
    } else {
      const photoIndex = file.fieldname.split("_")[1] || "0";
      cb(null, `photo-${businessId}-${photoIndex}-${timestamp}${extension}`);
    }
  },
});

// File filter function
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Check if file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

// Middleware to handle multiple file types
export const uploadBusinessImages = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "photo_0", maxCount: 1 },
  { name: "photo_1", maxCount: 1 },
  { name: "photo_2", maxCount: 1 },
  { name: "photo_3", maxCount: 1 },
  { name: "photo_4", maxCount: 1 },
  { name: "photo_5", maxCount: 1 },
  { name: "photo_6", maxCount: 1 },
  { name: "photo_7", maxCount: 1 },
  { name: "photo_8", maxCount: 1 },
  { name: "photo_9", maxCount: 1 },
]);

// Upload handler
export const handleBusinessImageUpload: RequestHandler = async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const businessId = req.body.businessId;

    if (!businessId) {
      return res.status(400).json({
        error: "Business ID is required",
        success: false,
      });
    }

    let logoUrl = "";
    const photoUrls: string[] = [];

    // Process logo
    if (files.logo && files.logo[0]) {
      const logoFile = files.logo[0];
      logoUrl = `/uploads/business-images/${logoFile.filename}`;
    }

    // Process photos
    Object.keys(files).forEach((fieldName) => {
      if (fieldName.startsWith("photo_")) {
        const photoFile = files[fieldName][0];
        if (photoFile) {
          photoUrls.push(`/uploads/business-images/${photoFile.filename}`);
        }
      }
    });

    res.json({
      success: true,
      message: "Images uploaded successfully",
      logoUrl: logoUrl || undefined,
      photoUrls: photoUrls,
      uploadedFiles: {
        logo: files.logo?.[0]?.filename,
        photos: Object.keys(files)
          .filter((key) => key.startsWith("photo_"))
          .map((key) => files[key][0]?.filename)
          .filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Error uploading business images:", error);
    res.status(500).json({
      error: "Failed to upload images",
      details: error instanceof Error ? error.message : "Unknown error",
      success: false,
    });
  }
};

// Error handling middleware for multer
export const handleUploadError = (
  error: any,
  req: any,
  res: any,
  next: any,
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large. Maximum size is 2MB per file.",
        success: false,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files uploaded.",
        success: false,
      });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      error: "Only image files (JPG, PNG, GIF, WebP) are allowed.",
      success: false,
    });
  }

  next(error);
};
