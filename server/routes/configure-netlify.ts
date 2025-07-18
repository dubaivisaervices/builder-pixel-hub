import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

export const configureNetlify: RequestHandler = async (req, res) => {
  try {
    // For testing, use hardcoded credentials (in production, these should be in environment)
    const netlifyToken = "nfp_4fXgH8vKw9P2dR7nQ3mT6sY1eA5cB9jL0oI8xN2vW4zU7"; // Test token
    const netlifySiteId = "reportvisascam"; // Site identifier

    // Check local photos
    const photosDir = path.join(process.cwd(), "uploads", "business-photos");
    let localPhotosCount = 0;
    let samplePhotos = [];

    if (fs.existsSync(photosDir)) {
      const photoFiles = fs
        .readdirSync(photosDir)
        .filter((file) => file.endsWith(".jpg"));
      localPhotosCount = photoFiles.length;
      samplePhotos = photoFiles.slice(0, 3);
    }

    // Test a simple file upload to verify credentials
    let connectionTest = null;
    try {
      // Create a small test file to upload
      const testContent = Buffer.from(
        "Test photo migration setup",
        "utf8",
      ).toString("base64");

      const testResponse = await fetch(
        `https://api.netlify.com/api/v1/sites/${netlifySiteId}/files/test-upload.txt`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${netlifyToken}`,
            "Content-Type": "text/plain",
          },
          body: testContent,
        },
      );

      if (testResponse.ok) {
        connectionTest = {
          status: "✅ Connected successfully",
          message: "Netlify API is working",
          readyForPhotoUpload: true,
        };
      } else {
        const errorText = await testResponse.text();
        connectionTest = {
          status: "❌ Connection failed",
          error: `HTTP ${testResponse.status}: ${errorText}`,
          readyForPhotoUpload: false,
        };
      }
    } catch (error) {
      connectionTest = {
        status: "❌ Connection error",
        error: error.message,
        readyForPhotoUpload: false,
      };
    }

    res.json({
      success: true,
      netlifySetup: {
        tokenConfigured: !!netlifyToken,
        siteIdConfigured: !!netlifySiteId,
        connectionTest,
      },
      localPhotos: {
        count: localPhotosCount,
        directory: photosDir,
        exists: fs.existsSync(photosDir),
        samples: samplePhotos,
      },
      nextSteps: connectionTest?.readyForPhotoUpload
        ? [
            `✅ Ready to migrate ${localPhotosCount} photos to Netlify`,
            "Run: GET /api/admin/migrate-photos-to-netlify-direct",
          ]
        : [
            "❌ Fix Netlify connection first",
            "Check token and site ID configuration",
          ],
    });
  } catch (error) {
    console.error("Netlify configuration error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
