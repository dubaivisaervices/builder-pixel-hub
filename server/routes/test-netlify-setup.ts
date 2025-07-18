import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

export const testNetlifySetup: RequestHandler = async (req, res) => {
  try {
    // Check environment variables
    const netlifyToken = process.env.NETLIFY_ACCESS_TOKEN;
    const netlifySiteId = process.env.NETLIFY_SITE_ID;

    // Check if local photos exist
    const photosDir = path.join(process.cwd(), "uploads", "business-photos");
    let localPhotos = [];
    let localPhotosCount = 0;

    if (fs.existsSync(photosDir)) {
      localPhotos = fs
        .readdirSync(photosDir)
        .filter((file) => file.endsWith(".jpg"))
        .slice(0, 5); // Sample of first 5
      localPhotosCount = fs
        .readdirSync(photosDir)
        .filter((file) => file.endsWith(".jpg")).length;
    }

    // Test Netlify API connection (if credentials exist)
    let netlifyTest = null;
    if (netlifyToken && netlifySiteId) {
      try {
        const testResponse = await fetch(
          `https://api.netlify.com/api/v1/sites/${netlifySiteId}`,
          {
            headers: {
              Authorization: `Bearer ${netlifyToken}`,
            },
          },
        );

        if (testResponse.ok) {
          const siteInfo = await testResponse.json();
          netlifyTest = {
            status: "connected",
            siteName: siteInfo.name,
            url: siteInfo.url,
          };
        } else {
          netlifyTest = {
            status: "error",
            error: `HTTP ${testResponse.status}`,
          };
        }
      } catch (error) {
        netlifyTest = {
          status: "error",
          error: error.message,
        };
      }
    }

    res.json({
      success: true,
      setup: {
        netlifyTokenConfigured: !!netlifyToken,
        netlifySiteIdConfigured: !!netlifySiteId,
        netlifyConnection: netlifyTest,
      },
      localPhotos: {
        directory: photosDir,
        exists: fs.existsSync(photosDir),
        totalCount: localPhotosCount,
        sampleFiles: localPhotos,
      },
      readyForMigration:
        !!netlifyToken && !!netlifySiteId && localPhotosCount > 0,
      instructions: !netlifyToken
        ? [
            "1. Get Netlify Access Token from https://app.netlify.com/user/applications",
            "2. Set NETLIFY_ACCESS_TOKEN environment variable",
            "3. Set NETLIFY_SITE_ID environment variable",
            "4. Run migration endpoint",
          ]
        : [
            `Ready to migrate ${localPhotosCount} photos to Netlify!`,
            "Run: GET /api/admin/migrate-photos-to-netlify",
          ],
    });
  } catch (error) {
    console.error("Netlify setup test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
