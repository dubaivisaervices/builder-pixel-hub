import { RequestHandler } from "express";
import { businessService } from "../database/businessService";
import fetch from "node-fetch";

// GitHub configuration
const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN || "",
  owner: process.env.GITHUB_OWNER || "your-username",
  repo: process.env.GITHUB_REPO || "dubai-visa-services-images",
  branch: "main",
  imagePath: "business-images",
};

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  download_url: string;
  type: string;
}

class GitHubDataFetcher {
  // Fetch all business folders from GitHub
  async fetchBusinessFolders(): Promise<{
    success: boolean;
    folders: string[];
    error?: string;
  }> {
    try {
      if (!GITHUB_CONFIG.token) {
        return {
          success: false,
          folders: [],
          error: "GitHub token not configured",
        };
      }

      const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.imagePath}`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${GITHUB_CONFIG.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            folders: [],
            error: "GitHub repository or images folder not found",
          };
        }
        return {
          success: false,
          folders: [],
          error: `GitHub API error: ${response.status}`,
        };
      }

      const contents = (await response.json()) as GitHubFile[];
      const folders = contents
        .filter((item) => item.type === "dir")
        .map((item) => item.name);

      return { success: true, folders };
    } catch (error) {
      return {
        success: false,
        folders: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Fetch images for a specific business from GitHub
  async fetchBusinessImages(businessId: string): Promise<{
    success: boolean;
    images: Array<{ fileName: string; base64: string; downloadUrl: string }>;
    error?: string;
  }> {
    try {
      if (!GITHUB_CONFIG.token) {
        return {
          success: false,
          images: [],
          error: "GitHub token not configured",
        };
      }

      const apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.imagePath}/${businessId}`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `token ${GITHUB_CONFIG.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            images: [],
            error: "Business folder not found on GitHub",
          };
        }
        return {
          success: false,
          images: [],
          error: `GitHub API error: ${response.status}`,
        };
      }

      const files = (await response.json()) as GitHubFile[];
      const imageFiles = files.filter(
        (file) =>
          file.type === "file" && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name),
      );

      const images = [];
      for (const file of imageFiles) {
        try {
          // Fetch the actual image content
          const imageResponse = await fetch(file.download_url);
          if (imageResponse.ok) {
            const buffer = await imageResponse.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");

            images.push({
              fileName: file.name,
              base64,
              downloadUrl: file.download_url,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch image ${file.name}:`, error);
        }
      }

      return { success: true, images };
    } catch (error) {
      return {
        success: false,
        images: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Fetch and restore all business data from GitHub
  async restoreAllDataFromGitHub(): Promise<{
    success: boolean;
    restoredBusinesses: number;
    restoredImages: number;
    errors: string[];
  }> {
    const result = {
      success: false,
      restoredBusinesses: 0,
      restoredImages: 0,
      errors: [] as string[],
    };

    try {
      console.log("🔄 Starting GitHub data restoration...");

      // Get all business folders from GitHub
      const foldersResult = await this.fetchBusinessFolders();
      if (!foldersResult.success) {
        result.errors.push(
          `Failed to fetch business folders: ${foldersResult.error}`,
        );
        return result;
      }

      console.log(
        `📁 Found ${foldersResult.folders.length} business folders on GitHub`,
      );

      // Restore data for each business
      for (const businessId of foldersResult.folders) {
        try {
          console.log(`🔄 Restoring data for business: ${businessId}`);

          // Check if business exists in database
          const existingBusiness =
            await businessService.getBusinessById(businessId);
          if (!existingBusiness) {
            console.log(
              `⚠️ Business ${businessId} not found in database, skipping...`,
            );
            continue;
          }

          // Fetch images from GitHub
          const imagesResult = await this.fetchBusinessImages(businessId);
          if (imagesResult.success && imagesResult.images.length > 0) {
            console.log(
              `📸 Found ${imagesResult.images.length} images for ${businessId}`,
            );

            // Update business with GitHub images
            const updatedPhotos = existingBusiness.photos || [];
            let logoUpdated = false;

            for (const githubImage of imagesResult.images) {
              if (githubImage.fileName.includes("logo")) {
                // Update logo
                existingBusiness.logoBase64 = githubImage.base64;
                logoUpdated = true;
                result.restoredImages++;
              } else {
                // Update photos
                const photoIndex =
                  parseInt(
                    githubImage.fileName.match(/photo_(\d+)/)?.[1] || "0",
                  ) - 1;
                if (photoIndex >= 0 && photoIndex < updatedPhotos.length) {
                  updatedPhotos[photoIndex] = {
                    ...updatedPhotos[photoIndex],
                    base64: githubImage.base64,
                    downloadedAt: new Date().toISOString(),
                    source: "github_restore",
                  };
                  result.restoredImages++;
                }
              }
            }

            // Save updated business
            const updatedBusiness = {
              ...existingBusiness,
              photos: updatedPhotos,
              photosLocal: updatedPhotos.filter((p) => p.base64),
            };

            await businessService.upsertBusiness(updatedBusiness);
            result.restoredBusinesses++;

            console.log(
              `✅ Restored ${imagesResult.images.length} images for ${existingBusiness.name}`,
            );
          } else {
            console.log(`📷 No images found for ${businessId} on GitHub`);
          }
        } catch (error) {
          const errorMsg = `Failed to restore business ${businessId}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      result.success = true;
      console.log(
        `✅ GitHub restoration completed: ${result.restoredBusinesses} businesses, ${result.restoredImages} images`,
      );
    } catch (error) {
      const errorMsg = `GitHub restoration failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
    }

    return result;
  }
}

const gitHubFetcher = new GitHubDataFetcher();

// Endpoint to fetch all data from GitHub
export const fetchAllDataFromGitHub: RequestHandler = async (req, res) => {
  try {
    console.log("🔄 Fetching all business data from GitHub...");

    const result = await gitHubFetcher.restoreAllDataFromGitHub();

    res.json({
      success: result.success,
      message: result.success
        ? "Successfully fetched data from GitHub"
        : "Failed to fetch data from GitHub",
      restoredBusinesses: result.restoredBusinesses,
      restoredImages: result.restoredImages,
      errors: result.errors,
      githubRepo: `https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
    });
  } catch (error) {
    console.error("❌ GitHub fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch data from GitHub",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Endpoint to get GitHub repository status
export const getGitHubStatus: RequestHandler = async (req, res) => {
  try {
    const foldersResult = await gitHubFetcher.fetchBusinessFolders();

    res.json({
      success: true,
      github: {
        configured: !!GITHUB_CONFIG.token,
        repository: `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`,
        accessible: foldersResult.success,
        businessFolders: foldersResult.folders || [],
        totalBusinesses: foldersResult.folders?.length || 0,
      },
      message: foldersResult.success
        ? `Found ${foldersResult.folders?.length || 0} business folders on GitHub`
        : `GitHub access failed: ${foldersResult.error}`,
    });
  } catch (error) {
    console.error("❌ GitHub status check error:", error);
    res.status(500).json({
      error: "Failed to check GitHub status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Endpoint to fetch specific business data from GitHub
export const fetchBusinessFromGitHub: RequestHandler = async (req, res) => {
  try {
    const { businessId } = req.params;

    if (!businessId) {
      return res.status(400).json({
        error: "Business ID is required",
      });
    }

    console.log(`🔄 Fetching business data from GitHub: ${businessId}`);

    const imagesResult = await gitHubFetcher.fetchBusinessImages(businessId);

    res.json({
      success: imagesResult.success,
      businessId,
      images: imagesResult.images,
      totalImages: imagesResult.images.length,
      error: imagesResult.error,
      message: imagesResult.success
        ? `Found ${imagesResult.images.length} images for business ${businessId}`
        : `Failed to fetch images: ${imagesResult.error}`,
    });
  } catch (error) {
    console.error("❌ Business GitHub fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch business data from GitHub",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
