import axios from "axios";
import fs from "fs";
import path from "path";

export class StepByStepGooglePhotos {
  private apiKey: string;
  private tempDir: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.tempDir = path.resolve(__dirname, "../temp_google_photos");

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Step 1: Find Place ID Using Find Place API
   */
  async findPlaceId(businessName: string): Promise<string | null> {
    try {
      console.log(`🔍 Step 1: Finding Place ID for: ${businessName}`);

      const url =
        "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
      const params = {
        input: `${businessName} Dubai`,
        inputtype: "textquery",
        fields: "place_id",
        key: this.apiKey,
      };

      console.log(`📋 Find Place URL: ${url}`);
      console.log(`📋 Parameters:`, params);

      const response = await axios.get(url, { params });

      console.log(`📋 Find Place Response Status: ${response.data.status}`);
      console.log(
        `📋 Find Place Response:`,
        JSON.stringify(response.data, null, 2),
      );

      if (
        response.data.status === "OK" &&
        response.data.candidates?.length > 0
      ) {
        const placeId = response.data.candidates[0].place_id;
        console.log(`✅ Found Place ID: ${placeId}`);
        return placeId;
      }

      console.log(`❌ No place found. Status: ${response.data.status}`);
      return null;
    } catch (error) {
      console.error(`❌ Error in Step 1 (Find Place ID):`, error.message);
      return null;
    }
  }

  /**
   * Step 2: Get Place Details (Photos) Using Place Details API
   */
  async getPlacePhotos(placeId: string): Promise<string[]> {
    try {
      console.log(`📸 Step 2: Getting Place Details & Photos for: ${placeId}`);

      const url = "https://maps.googleapis.com/maps/api/place/details/json";
      const params = {
        place_id: placeId,
        fields: "name,photos",
        key: this.apiKey,
      };

      console.log(`📋 Place Details URL: ${url}`);
      console.log(`📋 Parameters:`, params);

      const response = await axios.get(url, { params });

      console.log(`📋 Place Details Response Status: ${response.data.status}`);
      console.log(
        `📋 Place Details Response:`,
        JSON.stringify(response.data, null, 2),
      );

      if (response.data.status === "OK" && response.data.result?.photos) {
        const photoReferences = response.data.result.photos.map(
          (photo: any) => photo.photo_reference,
        );
        console.log(`✅ Found ${photoReferences.length} photos`);
        return photoReferences;
      }

      console.log(`❌ No photos found. Status: ${response.data.status}`);
      return [];
    } catch (error) {
      console.error(`❌ Error in Step 2 (Get Place Details):`, error.message);
      return [];
    }
  }

  /**
   * Step 3: Download multiple photos (logo + business photos)
   */
  async downloadMultiplePhotos(
    photoReferences: string[],
    businessName: string,
  ): Promise<{
    logoPath?: string;
    businessPhotos: string[];
    errors: string[];
  }> {
    const result = {
      logoPath: undefined as string | undefined,
      businessPhotos: [] as string[],
      errors: [] as string[],
    };

    // Download up to 6 photos (1 logo + 5 business photos)
    const maxPhotos = Math.min(photoReferences.length, 6);

    for (let i = 0; i < maxPhotos; i++) {
      const photoReference = photoReferences[i];
      const photoType = i === 0 ? "logo" : "photo";
      const fileName = `${businessName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${photoType}_${i}_${Date.now()}.jpg`;

      try {
        console.log(
          `⬬ Step 3.${i + 1}: Downloading ${photoType} with reference: ${photoReference.substring(0, 30)}...`,
        );

        const filePath = await this.downloadSinglePhoto(
          photoReference,
          fileName,
        );

        if (filePath) {
          if (i === 0) {
            result.logoPath = filePath;
            console.log(`✅ Logo downloaded: ${filePath}`);
          } else {
            result.businessPhotos.push(filePath);
            console.log(`✅ Business photo ${i} downloaded: ${filePath}`);
          }
        } else {
          result.errors.push(`Failed to download ${photoType} ${i + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error downloading ${photoType} ${i + 1}:`, error);
        result.errors.push(`${photoType} ${i + 1}: ${error.message}`);
      }
    }

    console.log(
      `📊 Download summary: Logo: ${result.logoPath ? "Yes" : "No"}, Business photos: ${result.businessPhotos.length}, Errors: ${result.errors.length}`,
    );
    return result;
  }

  /**
   * Download single photo helper
   */
  async downloadSinglePhoto(
    photoReference: string,
    fileName: string,
  ): Promise<string | null> {
    try {
      console.log(
        `⬬ Step 3: Downloading photo with reference: ${photoReference.substring(0, 30)}...`,
      );

      const url = "https://maps.googleapis.com/maps/api/place/photo";
      const params = {
        maxwidth: 800,
        photo_reference: photoReference,
        key: this.apiKey,
      };

      const fullUrl = `${url}?${new URLSearchParams(params).toString()}`;
      console.log(`📋 Photo Download URL: ${fullUrl}`);

      const response = await axios.get(url, {
        params,
        responseType: "stream",
        maxRedirects: 5,
        timeout: 30000,
      });

      console.log(`📋 Photo Response Status: ${response.status}`);
      console.log(`📋 Photo Response Headers:`, response.headers);

      const filePath = path.resolve(this.tempDir, fileName);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          const stats = fs.statSync(filePath);
          console.log(`✅ Photo downloaded: ${filePath} (${stats.size} bytes)`);

          // Validate file
          if (stats.size < 1000) {
            console.log(`⚠️ File too small, might be error page`);
            resolve(null);
          } else {
            resolve(filePath);
          }
        });
        writer.on("error", (error) => {
          console.error(`❌ Error writing file:`, error);
          reject(error);
        });
      });
    } catch (error) {
      console.error(`❌ Error in Step 3 (Download Photo):`, error.message);
      if (error.response) {
        console.error(`📋 Error Response Status: ${error.response.status}`);
        console.error(`📋 Error Response Headers:`, error.response.headers);
      }
      return null;
    }
  }

  /**
   * Complete Step-by-Step Workflow
   */
  async getBusinessPhoto(businessName: string): Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
    details?: any;
  }> {
    const details = {
      businessName,
      placeId: null,
      photoReferences: [],
      downloadAttempts: [],
    };

    try {
      console.log(`\n🚀 Starting complete workflow for: ${businessName}`);

      // Step 1: Find Place ID
      const placeId = await this.findPlaceId(businessName);
      details.placeId = placeId;

      if (!placeId) {
        return {
          success: false,
          error: "Place not found in Step 1",
          details,
        };
      }

      // Step 2: Get Photo References
      const photoReferences = await this.getPlacePhotos(placeId);
      details.photoReferences = photoReferences;

      if (photoReferences.length === 0) {
        return {
          success: false,
          error: "No photos found in Step 2",
          details,
        };
      }

      // Step 3: Download First Photo
      const fileName = `${businessName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.jpg`;
      const filePath = await this.downloadPhoto(photoReferences[0], fileName);

      details.downloadAttempts.push({
        photoReference: photoReferences[0],
        fileName,
        success: !!filePath,
      });

      if (!filePath) {
        return {
          success: false,
          error: "Failed to download photo in Step 3",
          details,
        };
      }

      console.log(`🎉 Complete workflow successful for: ${businessName}`);
      return {
        success: true,
        filePath,
        details,
      };
    } catch (error) {
      console.error(`❌ Complete workflow failed for ${businessName}:`, error);
      return {
        success: false,
        error: error.message,
        details,
      };
    }
  }

  /**
   * Clean up temporary files
   */
  cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Cleaned up temp file: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error cleaning up file ${filePath}:`, error);
    }
  }
}
