import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";

// Track download progress
let logoDownloadInProgress = false;
let logoDownloadProgress = {
  current: 0,
  total: 0,
  completed: 0,
  errors: 0,
};

interface LogoDownloadResult {
  businessId: string;
  businessName: string;
  logoDownloaded: boolean;
  error?: string;
}

// Download only logos for all businesses
export const downloadLogos: RequestHandler = async (req, res) => {
  try {
    console.log("🏢 Starting logo download...");

    // Check if another download process is already running
    if (logoDownloadInProgress) {
      return res.status(409).json({
        error: "Logo download already in progress",
        message: "Please wait for the current download to complete",
        inProgress: true,
      });
    }

    logoDownloadInProgress = true;

    const businesses = await businessService.getAllBusinesses();
    const results: LogoDownloadResult[] = [];
    let totalLogosDownloaded = 0;

    // Filter businesses that need logo downloads
    const businessesNeedingLogos = businesses.filter(
      (business) => !business.logoBase64 && business.logoUrl,
    );

    logoDownloadProgress = {
      current: 0,
      total: businessesNeedingLogos.length,
      completed: 0,
      errors: 0,
    };

    console.log(
      `📊 Found ${businessesNeedingLogos.length} businesses needing logo downloads`,
    );

    for (const business of businessesNeedingLogos) {
      const result: LogoDownloadResult = {
        businessId: business.id,
        businessName: business.name,
        logoDownloaded: false,
      };

      logoDownloadProgress.current++;

      try {
        if (business.logoUrl && !business.logoBase64) {
          console.log(`📥 Downloading logo for: ${business.name}`);

          const logoResponse = await fetch(business.logoUrl, {
            timeout: 10000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });

          if (!logoResponse.ok) {
            throw new Error(`HTTP ${logoResponse.status}`);
          }

          const arrayBuffer = await logoResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString("base64");

          // Update business with logo base64
          const updatedBusiness = {
            ...business,
            logoBase64: base64,
          };

          await businessService.upsertBusiness(updatedBusiness);

          result.logoDownloaded = true;
          logoDownloadProgress.completed++;
          totalLogosDownloaded++;

          console.log(
            `✅ Logo downloaded for ${business.name} (${logoDownloadProgress.completed}/${logoDownloadProgress.total})`,
          );
        }

        results.push(result);

        // Small delay to avoid overwhelming servers
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(
          `❌ Failed to download logo for ${business.name}:`,
          error instanceof Error ? error.message : "Unknown error",
        );
        result.error = error instanceof Error ? error.message : "Unknown error";
        logoDownloadProgress.errors++;
        results.push(result);
      }
    }

    console.log(`✅ Logo download completed:
      - Businesses processed: ${businessesNeedingLogos.length}
      - Logos downloaded: ${totalLogosDownloaded}
      - Errors: ${logoDownloadProgress.errors}
    `);

    res.json({
      success: true,
      message: "Logo download completed",
      totalBusinesses: businessesNeedingLogos.length,
      logosDownloaded: totalLogosDownloaded,
      errors: logoDownloadProgress.errors,
      results: results.filter((r) => r.logoDownloaded || r.error),
      summary: {
        successRate: Math.round(
          (totalLogosDownloaded / businessesNeedingLogos.length) * 100,
        ),
        totalErrors: logoDownloadProgress.errors,
      },
    });
  } catch (error) {
    console.error("❌ Logo download failed:", error);
    res.status(500).json({
      error: "Logo download failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    logoDownloadInProgress = false;
    logoDownloadProgress = { current: 0, total: 0, completed: 0, errors: 0 };
  }
};

// Get logo download progress
export const getLogoDownloadProgress: RequestHandler = async (req, res) => {
  res.json({
    inProgress: logoDownloadInProgress,
    progress: logoDownloadProgress,
    message: logoDownloadInProgress
      ? "Logo download in progress"
      : "No logo download in progress",
  });
};

// Stop logo download process
export const stopLogoDownload: RequestHandler = async (req, res) => {
  logoDownloadInProgress = false;
  res.json({
    success: true,
    message: "Logo download process stopped",
  });
};

// Get logo statistics
export const getLogoStats: RequestHandler = async (req, res) => {
  try {
    const businesses = await businessService.getAllBusinesses();

    let totalLogos = 0;
    let logosWithBase64 = 0;
    let businessesWithLogos = 0;

    for (const business of businesses) {
      if (business.logoUrl) {
        totalLogos++;
        if (business.logoBase64) {
          logosWithBase64++;
        }
      }
      if (business.logoUrl || business.logoBase64) {
        businessesWithLogos++;
      }
    }

    const status = {
      totalBusinesses: businesses.length,
      businessesWithLogos,
      logos: {
        total: totalLogos,
        downloaded: logosWithBase64,
        percentage:
          totalLogos > 0 ? Math.round((logosWithBase64 / totalLogos) * 100) : 0,
        remaining: totalLogos - logosWithBase64,
      },
      isComplete: logosWithBase64 >= totalLogos * 0.9, // 90% threshold
    };

    res.json(status);
  } catch (error) {
    console.error("❌ Logo stats check failed:", error);
    res.status(500).json({
      error: "Logo stats check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
