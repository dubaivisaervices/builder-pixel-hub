// Utility to download and convert photos to base64 for offline storage

export interface PhotoDownloadResult {
  base64: string;
  success: boolean;
  error?: string;
}

export class PhotoDownloader {
  private static readonly MAX_RETRIES = 3;
  private static readonly TIMEOUT_MS = 10000; // 10 seconds

  /**
   * Download a photo from URL and convert to base64
   */
  static async downloadPhotoAsBase64(
    url: string,
  ): Promise<PhotoDownloadResult> {
    let attempt = 0;

    while (attempt < this.MAX_RETRIES) {
      try {
        console.log(
          `📸 Downloading photo (attempt ${attempt + 1}): ${url.substring(0, 100)}...`,
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; PhotoDownloader/1.0)",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.startsWith("image/")) {
          throw new Error(`Invalid content type: ${contentType}`);
        }

        // Get image data as buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64 = buffer.toString("base64");

        console.log(
          `✅ Photo downloaded successfully (${(buffer.length / 1024).toFixed(1)}KB)`,
        );

        return {
          base64,
          success: true,
        };
      } catch (error) {
        attempt++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log(
          `❌ Photo download failed (attempt ${attempt}): ${errorMessage}`,
        );

        if (attempt >= this.MAX_RETRIES) {
          return {
            base64: "",
            success: false,
            error: errorMessage,
          };
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      base64: "",
      success: false,
      error: "Max retries exceeded",
    };
  }

  /**
   * Download multiple photos with progress tracking
   */
  static async downloadPhotosAsBase64(
    urls: string[],
    onProgress?: (current: number, total: number) => void,
  ): Promise<PhotoDownloadResult[]> {
    const results: PhotoDownloadResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      if (onProgress) {
        onProgress(i + 1, urls.length);
      }

      const result = await this.downloadPhotoAsBase64(urls[i]);
      results.push(result);

      // Small delay between downloads to be respectful to the server
      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Validate base64 image data
   */
  static isValidBase64Image(base64: string): boolean {
    if (!base64 || base64.length < 100) {
      return false;
    }

    // Check if it looks like valid base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(base64);
  }

  /**
   * Get image info from base64
   */
  static getImageInfo(base64: string): { size: number; type: string } {
    const buffer = Buffer.from(base64, "base64");
    let type = "unknown";

    // Simple image type detection
    if (buffer.slice(0, 4).toString("hex") === "89504e47") {
      type = "PNG";
    } else if (buffer.slice(0, 2).toString("hex") === "ffd8") {
      type = "JPEG";
    } else if (
      buffer.slice(0, 6).toString() === "GIF87a" ||
      buffer.slice(0, 6).toString() === "GIF89a"
    ) {
      type = "GIF";
    }

    return {
      size: buffer.length,
      type,
    };
  }
}
