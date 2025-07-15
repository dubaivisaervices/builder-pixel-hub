import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

interface HostingerConfig {
  host: string;
  user: string;
  password: string;
  port?: number;
  remotePath: string; // e.g., "/public_html/business-images"
  baseUrl: string; // e.g., "https://yourdomain.com/business-images"
}

export class HostingerUploadService {
  private config: HostingerConfig;

  constructor(config: HostingerConfig) {
    this.config = config;
  }

  /**
   * Upload business logo to Hostinger
   */
  async uploadBusinessLogo(
    imageBuffer: Buffer,
    businessId: string,
    originalUrl: string,
  ): Promise<string> {
    const fileExtension = this.getFileExtension(originalUrl);
    const fileName = `logo-${businessId}${fileExtension}`;
    const remotePath = `/logos/${fileName}`;

    await this.uploadFile(imageBuffer, remotePath);

    return `${this.config.baseUrl}/logos/${fileName}`;
  }

  /**
   * Upload single business photo to Hostinger
   */
  async uploadBusinessPhoto(
    imageBuffer: Buffer,
    businessId: string,
    photoName: string,
    originalUrl: string,
  ): Promise<string> {
    const fileExtension = this.getFileExtension(originalUrl);
    const fileName = `${photoName}-${businessId}${fileExtension}`;
    const remotePath = `/photos/${fileName}`;

    await this.uploadFile(imageBuffer, remotePath);

    return `${this.config.baseUrl}/photos/${fileName}`;
  }

  /**
   * Upload business photos to Hostinger
   */
  async uploadBusinessPhotos(
    images: { buffer: Buffer; originalUrl: string }[],
    businessId: string,
  ): Promise<string[]> {
    const uploadPromises = images.map(async (image, index) => {
      const fileExtension = this.getFileExtension(image.originalUrl);
      const fileName = `photo-${businessId}-${index + 1}${fileExtension}`;
      const remotePath = `/photos/${fileName}`;

      await this.uploadFile(image.buffer, remotePath);

      return `${this.config.baseUrl}/photos/${fileName}`;
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Get or create FTP connection
   */
  private async ensureConnection(): Promise<ftp.Client> {
    if (this.ftpClient && this.connectionPromise) {
      await this.connectionPromise;
      return this.ftpClient;
    }

    this.ftpClient = new ftp.Client();
    this.connectionPromise = this.ftpClient.access({
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
      port: this.config.port || 21,
    });

    await this.connectionPromise;
    console.log("🔗 FTP connection established");
    return this.ftpClient;
  }

  /**
   * Close FTP connection
   */
  async closeConnection(): Promise<void> {
    if (this.ftpClient) {
      this.ftpClient.close();
      this.ftpClient = null;
      this.connectionPromise = null;
      console.log("🔌 FTP connection closed");
    }
  }

  /**
   * Upload file buffer to Hostinger via FTP
   */
  private async uploadFile(buffer: Buffer, remotePath: string): Promise<void> {
    const client = new ftp.Client();

    try {
      await client.access({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        port: this.config.port || 21,
      });

      // Navigate to public_html first
      await client.cd("/public_html");

      // Navigate to business-images directory
      await client.cd("business-images");

      // Ensure subdirectory exists (logos or photos)
      const remoteDir = path.dirname(remotePath);
      if (remoteDir && remoteDir !== ".") {
        try {
          await client.ensureDir(remoteDir);
        } catch (error) {
          console.log("Directory might already exist:", remoteDir);
        }
      }

      // Upload file using relative path
      const stream = Readable.from(buffer);
      await client.uploadFrom(stream, remotePath);

      console.log(`✅ Uploaded to Hostinger: ${remotePath}`);
    } catch (error) {
      console.error("❌ Hostinger upload error:", error);
      throw new Error(`Failed to upload to Hostinger: ${error.message}`);
    } finally {
      client.close();
    }
  }

  /**
   * Download image from URL with proper headers for Google APIs
   */
  async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error("Failed to download image:", url, error);
      throw error;
    }
  }

  /**
   * Batch upload all business images from Google API
   */
  async uploadAllBusinessImages(): Promise<{
    processed: number;
    successful: number;
    errors: string[];
  }> {
    const { BusinessService } = await import("../database/businessService");
    const { database } = await import("../database/database");
    const businessService = new BusinessService(database);

    // Get businesses that need image upload
    const businesses = await database.all(`
      SELECT id, name, logo_url, photos_json 
      FROM businesses 
      WHERE (logo_url IS NOT NULL AND logo_url != '') 
         OR (photos_json IS NOT NULL AND photos_json != '[]' AND photos_json != '')
      ORDER BY rating DESC
      LIMIT 50
    `);

    let processed = 0;
    let successful = 0;
    const errors: string[] = [];

    for (const business of businesses) {
      try {
        processed++;
        console.log(
          `\n🔄 Processing ${business.name} (${processed}/${businesses.length})`,
        );

        const results: { logoUrl?: string; photoUrls?: string[] } = {};

        // Upload logo if exists
        if (business.logo_url && business.logo_url.startsWith("http")) {
          try {
            const logoBuffer = await this.downloadImage(business.logo_url);
            const hostingerLogoUrl = await this.uploadBusinessLogo(
              logoBuffer,
              business.id,
              business.logo_url,
            );
            results.logoUrl = hostingerLogoUrl;
            console.log(`✅ Logo uploaded: ${hostingerLogoUrl}`);
          } catch (error) {
            console.error(
              `❌ Logo upload failed for ${business.name}:`,
              error.message,
            );
          }
        }

        // Upload photos if exist
        if (business.photos_json) {
          try {
            const photos = JSON.parse(business.photos_json);
            const validPhotos = photos
              .filter((photo: any) => photo.url && photo.url.startsWith("http"))
              .slice(0, 6); // Limit to 6 photos

            if (validPhotos.length > 0) {
              const imageBuffers = await Promise.all(
                validPhotos.map(async (photo: any) => ({
                  buffer: await this.downloadImage(photo.url),
                  originalUrl: photo.url,
                })),
              );

              const hostingerPhotoUrls = await this.uploadBusinessPhotos(
                imageBuffers,
                business.id,
              );
              results.photoUrls = hostingerPhotoUrls;
              console.log(`✅ ${hostingerPhotoUrls.length} photos uploaded`);
            }
          } catch (error) {
            console.error(
              `❌ Photos upload failed for ${business.name}:`,
              error.message,
            );
          }
        }

        // Update database with Hostinger URLs
        if (results.logoUrl || results.photoUrls) {
          await businessService.updateBusinessS3Urls(
            business.id,
            results.logoUrl,
            results.photoUrls?.map((url) => ({ s3Url: url })),
          );
          successful++;
          console.log(`✅ Database updated for ${business.name}`);
        }

        // Add delay to avoid overwhelming the servers
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        const errorMsg = `${business.name}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    return { processed, successful, errors };
  }

  private getFileExtension(url: string): string {
    try {
      const urlPath = new URL(url).pathname;
      const ext = path.extname(urlPath);
      return ext || ".jpg";
    } catch {
      return ".jpg";
    }
  }
}

// Configuration factory - you'll need to provide your Hostinger credentials
export function createHostingerService(
  config: HostingerConfig,
): HostingerUploadService {
  return new HostingerUploadService(config);
}
