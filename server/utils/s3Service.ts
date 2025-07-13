import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { EnhancedImageFetcher } from "./enhancedImageFetcher";
import { GoogleMapsImageHandler } from "./googleMapsImageHandler";

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  private initialized = false;

  constructor() {
    this.region = process.env.AWS_REGION || "us-east-1";
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || "";

    if (!this.bucketName) {
      throw new Error("AWS_S3_BUCKET_NAME environment variable is required");
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  private async ensureCorrectRegion(): Promise<void> {
    if (this.initialized) return;

    const commonRegions = [
      "us-east-1",
      "me-south-1",
      "eu-west-1",
      "ap-southeast-1",
      "us-west-2",
    ];

    for (const region of commonRegions) {
      try {
        const testClient = new S3Client({
          region: region,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
          },
        });

        // Test connection with a simple head bucket operation
        const command = new ListObjectsV2Command({
          Bucket: this.bucketName,
          MaxKeys: 1,
        });

        await testClient.send(command);

        // If successful, use this region
        if (region !== this.region) {
          console.log(`Switching S3 region from ${this.region} to ${region}`);
          this.region = region;
          this.s3Client = testClient;
        }
        this.initialized = true;
        console.log(`Successfully connected to S3 bucket in region: ${region}`);
        return;
      } catch (error) {
        console.log(`Failed to connect with region ${region}:`, error.message);
        continue;
      }
    }

    // If all regions fail, keep original and mark as initialized
    this.initialized = true;
    console.warn(
      "Could not auto-detect correct S3 region, using default:",
      this.region,
    );
  }

  /**
   * Upload an image from a URL to S3
   */
  async uploadImageFromUrl(
    imageUrl: string,
    key: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      // Ensure we're using the correct region
      await this.ensureCorrectRegion();

      // Use Google Maps aware image handler
      const fetchResult =
        await GoogleMapsImageHandler.handleGoogleMapsImage(imageUrl);

      if (fetchResult.shouldSkip) {
        throw new Error(`Skipped: ${fetchResult.error}`);
      }

      if (!fetchResult.success) {
        throw new Error(
          fetchResult.error || "Failed to fetch image with Google Maps handler",
        );
      }

      const imageBuffer = fetchResult.buffer!;
      const contentType = fetchResult.contentType || "image/jpeg";

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);
      return this.getPublicUrl(key);
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw error;
    }
  }

  /**
   * Upload a buffer to S3
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string = "image/jpeg",
    metadata?: Record<string, string>,
  ): Promise<string> {
    try {
      // Ensure we're using the correct region
      await this.ensureCorrectRegion();

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.s3Client.send(command);
      return this.getPublicUrl(key);
    } catch (error) {
      console.error("Error uploading buffer to S3:", error);
      throw error;
    }
  }

  /**
   * Get a signed URL for private access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw error;
    }
  }

  /**
   * Get public URL for an object (assumes bucket is publicly readable)
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Check if an object exists in S3
   */
  async objectExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete an object from S3
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting object from S3:", error);
      throw error;
    }
  }

  /**
   * List objects in S3 with a prefix
   */
  async listObjects(prefix: string, maxKeys: number = 1000): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.s3Client.send(command);
      return response.Contents?.map((obj) => obj.Key || "") || [];
    } catch (error) {
      console.error("Error listing objects from S3:", error);
      throw error;
    }
  }

  /**
   * Generate a unique key for business images
   */
  generateBusinessImageKey(
    businessId: string,
    imageType: "logo" | "photo",
    originalUrl: string,
  ): string {
    const extension = this.getImageExtension(originalUrl);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);

    return `businesses/${businessId}/${imageType}s/${timestamp}-${uuid}.${extension}`;
  }

  /**
   * Extract image extension from URL
   */
  private getImageExtension(url: string): string {
    const urlPath = new URL(url).pathname;
    const extension = urlPath.split(".").pop()?.toLowerCase();

    // Default to jpg if no extension found or if it's not a common image format
    const validExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!extension || !validExtensions.includes(extension)) {
      return "jpg";
    }

    return extension;
  }

  /**
   * Upload business logo to S3
   */
  async uploadBusinessLogo(
    businessId: string,
    logoUrl: string,
    businessName?: string,
  ): Promise<string> {
    const key = this.generateBusinessImageKey(businessId, "logo", logoUrl);
    const metadata = {
      businessId,
      imageType: "logo",
      businessName: businessName || "",
      uploadedAt: new Date().toISOString(),
    };

    return this.uploadImageFromUrl(logoUrl, key, metadata);
  }

  /**
   * Upload business photo to S3
   */
  async uploadBusinessPhoto(
    businessId: string,
    photoUrl: string,
    businessName?: string,
    photoCaption?: string,
  ): Promise<string> {
    const key = this.generateBusinessImageKey(businessId, "photo", photoUrl);
    const metadata = {
      businessId,
      imageType: "photo",
      businessName: businessName || "",
      photoCaption: photoCaption || "",
      uploadedAt: new Date().toISOString(),
    };

    return this.uploadImageFromUrl(photoUrl, key, metadata);
  }

  /**
   * Batch upload business images
   */
  async uploadBusinessImages(businessData: {
    id: string;
    name: string;
    logoUrl?: string;
    photos?: Array<{ url: string; caption?: string }>;
  }): Promise<{
    logoS3Url?: string;
    photoS3Urls: string[];
    errors: string[];
  }> {
    const result = {
      logoS3Url: undefined as string | undefined,
      photoS3Urls: [] as string[],
      errors: [] as string[],
    };

    // Upload logo
    if (businessData.logoUrl) {
      try {
        result.logoS3Url = await this.uploadBusinessLogo(
          businessData.id,
          businessData.logoUrl,
          businessData.name,
        );
      } catch (error) {
        result.errors.push(`Failed to upload logo: ${error}`);
      }
    }

    // Upload photos
    if (businessData.photos && businessData.photos.length > 0) {
      for (const photo of businessData.photos) {
        try {
          const s3Url = await this.uploadBusinessPhoto(
            businessData.id,
            photo.url,
            businessData.name,
            photo.caption,
          );
          result.photoS3Urls.push(s3Url);
        } catch (error) {
          result.errors.push(`Failed to upload photo ${photo.url}: ${error}`);
        }
      }
    }

    return result;
  }

  /**
   * Get S3 statistics
   */
  async getStorageStats(): Promise<{
    totalObjects: number;
    totalSize: number;
    businessCount: number;
  }> {
    try {
      // Ensure we're using the correct region
      await this.ensureCorrectRegion();

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: "businesses/",
      });

      let totalObjects = 0;
      let totalSize = 0;
      const businesses = new Set<string>();
      let continuationToken: string | undefined;

      do {
        if (continuationToken) {
          command.input.ContinuationToken = continuationToken;
        }

        const response = await this.s3Client.send(command);

        if (response.Contents) {
          totalObjects += response.Contents.length;
          totalSize += response.Contents.reduce(
            (sum, obj) => sum + (obj.Size || 0),
            0,
          );

          // Extract business IDs
          response.Contents.forEach((obj) => {
            const key = obj.Key || "";
            const businessIdMatch = key.match(/^businesses\/([^\/]+)\//);
            if (businessIdMatch) {
              businesses.add(businessIdMatch[1]);
            }
          });
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      return {
        totalObjects,
        totalSize,
        businessCount: businesses.size,
      };
    } catch (error) {
      console.error("Error getting S3 storage stats:", error);
      return { totalObjects: 0, totalSize: 0, businessCount: 0 };
    }
  }
}

// Singleton instance
let s3ServiceInstance: S3Service | null = null;

export function getS3Service(): S3Service {
  if (!s3ServiceInstance) {
    s3ServiceInstance = new S3Service();
  }
  return s3ServiceInstance;
}

// Helper function to check if S3 is configured
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  );
}
