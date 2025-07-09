import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

interface GitHubImageUpload {
  fileName: string;
  content: string; // base64 content
  sha?: string; // for updates
}

interface PersistenceResult {
  success: boolean;
  savedBusinesses: number;
  savedReviews: number;
  savedImages: number;
  githubImages: number;
  errors: string[];
  details: any;
}

// GitHub configuration
const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN || "", // Set in environment
  owner: process.env.GITHUB_OWNER || "your-username",
  repo: process.env.GITHUB_REPO || "dubai-visa-services-images",
  branch: "main",
  imagePath: "business-images", // folder in repo
};

class DataPersistenceService {
  // Upload image to GitHub repository
  async uploadImageToGitHub(
    fileName: string,
    base64Content: string,
    businessId: string,
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      if (!GITHUB_CONFIG.token) {
        return { success: false, error: "GitHub token not configured" };
      }

      // Create GitHub API URL
      const filePath = `${GITHUB_CONFIG.imagePath}/${businessId}/${fileName}`;
      const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;

      // Check if file already exists
      let existingSha: string | undefined;
      try {
        const existingResponse = await fetch(apiUrl, {
          headers: {
            Authorization: `token ${GITHUB_CONFIG.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (existingResponse.ok) {
          const existingData = (await existingResponse.json()) as any;
          existingSha = existingData.sha;
        }
      } catch (e) {
        // File doesn't exist, which is fine
      }

      // Upload or update file
      const uploadData = {
        message: `Upload business image: ${fileName} for ${businessId}`,
        content: base64Content.replace(/^data:image\/[a-z]+;base64,/, ""), // Remove data URL prefix
        branch: GITHUB_CONFIG.branch,
        ...(existingSha && { sha: existingSha }),
      };

      const uploadResponse = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_CONFIG.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadData),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        return {
          success: false,
          error: `GitHub upload failed: ${uploadResponse.status} - ${errorData}`,
        };
      }

      const result = (await uploadResponse.json()) as any;
      return {
        success: true,
        url: result.content.download_url,
      };
    } catch (error) {
      return {
        success: false,
        error: `GitHub upload error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  // Save all business images to GitHub
  async saveBusinessImagesToGitHub(business: any): Promise<{
    savedCount: number;
    githubUrls: string[];
    errors: string[];
  }> {
    const result = {
      savedCount: 0,
      githubUrls: [] as string[],
      errors: [] as string[],
    };

    try {
      // Save logo if available
      if (business.logoBase64) {
        const logoUpload = await this.uploadImageToGitHub(
          `logo.jpg`,
          business.logoBase64,
          business.id,
        );

        if (logoUpload.success && logoUpload.url) {
          result.githubUrls.push(logoUpload.url);
          result.savedCount++;
        } else {
          result.errors.push(`Logo upload failed: ${logoUpload.error}`);
        }
      }

      // Save business photos if available
      if (business.photosLocal && Array.isArray(business.photosLocal)) {
        for (let i = 0; i < business.photosLocal.length; i++) {
          const photo = business.photosLocal[i];
          if (photo && typeof photo === "string") {
            const photoUpload = await this.uploadImageToGitHub(
              `photo_${i + 1}.jpg`,
              photo,
              business.id,
            );

            if (photoUpload.success && photoUpload.url) {
              result.githubUrls.push(photoUpload.url);
              result.savedCount++;
            } else {
              result.errors.push(
                `Photo ${i + 1} upload failed: ${photoUpload.error}`,
              );
            }
          }
        }
      }
    } catch (error) {
      result.errors.push(
        `GitHub save error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return result;
  }

  // Create GitHub repository if it doesn't exist
  async ensureGitHubRepository(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!GITHUB_CONFIG.token) {
        return { success: false, error: "GitHub token not configured" };
      }

      const repoUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`;

      // Check if repo exists
      const checkResponse = await fetch(repoUrl, {
        headers: {
          Authorization: `token ${GITHUB_CONFIG.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (checkResponse.ok) {
        return { success: true }; // Repo already exists
      }

      // Create repository
      const createResponse = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `token ${GITHUB_CONFIG.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: GITHUB_CONFIG.repo,
          description: "Dubai Visa Services - Business Images Storage",
          private: false,
          auto_init: true,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        return {
          success: false,
          error: `Failed to create repository: ${createResponse.status} - ${errorData}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Repository setup error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

const persistenceService = new DataPersistenceService();

// Save all business data to database and images to GitHub
export const saveAllBusinessData: RequestHandler = async (req, res) => {
  const startTime = Date.now();
  console.log("🚀 Starting comprehensive data persistence...");

  const result: PersistenceResult = {
    success: false,
    savedBusinesses: 0,
    savedReviews: 0,
    savedImages: 0,
    githubImages: 0,
    errors: [],
    details: {},
  };

  try {
    // Ensure GitHub repository exists
    const repoSetup = await persistenceService.ensureGitHubRepository();
    if (!repoSetup.success) {
      result.errors.push(`GitHub repository setup failed: ${repoSetup.error}`);
    }

    // Get all businesses from current system (API or database)
    let businesses = [];

    try {
      // Try to get businesses from Google API first
      const response = await fetch(
        "http://localhost:3000/api/dubai-visa-services?limit=1000",
      );
      const data = await response.json();
      businesses = data.businesses || [];
      console.log(`📊 Fetched ${businesses.length} businesses from API`);
    } catch (error) {
      // Fallback to database
      businesses = await businessService.getAllBusinessesWithReviews();
      console.log(`📊 Fetched ${businesses.length} businesses from database`);
    }

    // Process each business
    for (const business of businesses) {
      try {
        // Save business to database
        await businessService.upsertBusiness(business);
        result.savedBusinesses++;

        // Save reviews to database
        if (business.reviews && business.reviews.length > 0) {
          await businessService.saveBusinessReviews(
            business.id,
            business.reviews,
          );
          result.savedReviews += business.reviews.length;
        }

        // Save images to database (base64) and GitHub
        if (
          business.logoBase64 ||
          (business.photosLocal && business.photosLocal.length > 0)
        ) {
          const imageResult =
            await persistenceService.saveBusinessImagesToGitHub(business);
          result.savedImages += imageResult.savedCount;
          result.githubImages += imageResult.githubUrls.length;

          if (imageResult.errors.length > 0) {
            result.errors.push(...imageResult.errors);
          }

          // Update business with GitHub URLs
          if (imageResult.githubUrls.length > 0) {
            const updatedBusiness = {
              ...business,
              githubImageUrls: imageResult.githubUrls,
            };
            await businessService.upsertBusiness(updatedBusiness);
          }
        }

        if (result.savedBusinesses % 10 === 0) {
          console.log(`💾 Processed ${result.savedBusinesses} businesses...`);
        }
      } catch (error) {
        const errorMsg = `Failed to save business ${business.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const duration = Date.now() - startTime;
    result.success = result.savedBusinesses > 0;
    result.details = {
      duration: `${duration}ms`,
      totalProcessed: businesses.length,
      githubRepoUrl: `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
      averageTimePerBusiness:
        businesses.length > 0 ? Math.round(duration / businesses.length) : 0,
    };

    console.log(`✅ Data persistence completed in ${duration}ms`);
    console.log(
      `📊 Results: ${result.savedBusinesses} businesses, ${result.savedReviews} reviews, ${result.githubImages} GitHub images`,
    );

    res.json(result);
  } catch (error) {
    const errorMsg = `Data persistence failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    result.errors.push(errorMsg);
    console.error(errorMsg);

    res.status(500).json(result);
  }
};

// Save specific business images to GitHub
export const saveBusinessImagesToGitHub: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    // Get business from database
    const business = await businessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Save images to GitHub
    const result =
      await persistenceService.saveBusinessImagesToGitHub(business);

    res.json({
      success: result.savedCount > 0,
      businessId,
      savedImages: result.savedCount,
      githubUrls: result.githubUrls,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Save business images error:", error);
    res.status(500).json({
      error: "Failed to save business images",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get data persistence status
export const getDataPersistenceStatus: RequestHandler = async (req, res) => {
  try {
    const stats = await businessService.getStats();

    // Check GitHub repository status
    const repoCheck = await persistenceService.ensureGitHubRepository();

    res.json({
      database: {
        totalBusinesses: stats.total,
        totalCategories: stats.categories,
        businessesWithReviews: stats.withReviews,
        connected: true,
      },
      github: {
        configured: !!GITHUB_CONFIG.token,
        repository: `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
        repoExists: repoCheck.success,
        error: repoCheck.error || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get persistence status error:", error);
    res.status(500).json({
      error: "Failed to get persistence status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Export all data as JSON backup
export const exportAllData: RequestHandler = async (req, res) => {
  try {
    console.log("📦 Starting data export...");

    // Get all businesses with reviews
    const businesses = await businessService.getAllBusinessesWithReviews();

    // Create comprehensive backup
    const exportData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      totalBusinesses: businesses.length,
      businesses: businesses,
      metadata: {
        exported_by: "Dubai Visa Services Admin",
        export_type: "full_backup",
        includes: ["businesses", "reviews", "images_base64"],
      },
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="dubai_visa_services_backup_${Date.now()}.json"`,
    );
    res.json(exportData);
  } catch (error) {
    console.error("Export data error:", error);
    res.status(500).json({
      error: "Failed to export data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
