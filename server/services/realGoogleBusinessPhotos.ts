import axios from "axios";
import fs from "fs";
import path from "path";

interface PlaceSearchResponse {
  candidates: Array<{
    place_id: string;
  }>;
  status: string;
}

interface PlaceDetailsResponse {
  result: {
    name: string;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
  };
  status: string;
}

export class RealGoogleBusinessPhotos {
  private apiKey: string;
  private tempDir: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.tempDir = path.resolve(__dirname, "../temp_images");

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Step 1: Find Place ID using Text Search API (more compatible)
   */
  async findPlaceId(
    businessName: string,
    location?: string,
  ): Promise<string | null> {
    try {
      const searchQuery = location
        ? `${businessName} ${location}`
        : businessName;
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

      const response = await axios.get<PlaceSearchResponse>(url, {
        params: {
          query: searchQuery,
          key: this.apiKey,
        },
      });

      if (
        response.data.status === "OK" &&
        response.data.candidates.length > 0
      ) {
        return response.data.candidates[0].place_id;
      }

      if (response.data.status === "REQUEST_DENIED") {
        console.error(
          `❌ Google Places API REQUEST_DENIED for: ${searchQuery}`,
          "Check API key permissions and billing",
        );
        throw new Error(
          `Google Places API REQUEST_DENIED - Check API key and billing`,
        );
      }

      console.log(
        `No place found for: ${searchQuery}, Status: ${response.data.status}`,
      );
      return null;
    } catch (error) {
      console.error(`Error finding place ID for ${businessName}:`, error);
      return null;
    }
  }

  /**
   * Step 2: Get Place Details (Photos) using Place Details API
   */
  async getPlacePhotos(placeId: string): Promise<string[]> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json`;

      const response = await axios.get<PlaceDetailsResponse>(url, {
        params: {
          place_id: placeId,
          fields: "name,photos",
          key: this.apiKey,
        },
      });

      if (response.data.status === "OK" && response.data.result.photos) {
        return response.data.result.photos.map(
          (photo) => photo.photo_reference,
        );
      }

      console.log(
        `No photos found for place ID: ${placeId}, Status: ${response.data.status}`,
      );
      return [];
    } catch (error) {
      console.error(`Error getting place details for ${placeId}:`, error);
      return [];
    }
  }

  /**
   * Step 3: Get Photo from Place Photos API and download it
   */
  async downloadPhoto(
    photoReference: string,
    fileName: string,
  ): Promise<string | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/photo`;

      const response = await axios.get(url, {
        params: {
          maxwidth: 800,
          photo_reference: photoReference,
          key: this.apiKey,
        },
        responseType: "stream",
        maxRedirects: 5,
      });

      const filePath = path.resolve(this.tempDir, fileName);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(filePath));
        writer.on("error", reject);
      });
    } catch (error) {
      console.error(`Error downloading photo ${photoReference}:`, error);
      return null;
    }
  }

  /**
   * Complete workflow: Get real business photo
   */
  async getRealBusinessPhoto(
    businessName: string,
    location?: string,
  ): Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }> {
    try {
      // Step 1: Find Place ID
      console.log(`🔍 Finding place ID for: ${businessName}`);
      const placeId = await this.findPlaceId(businessName, location);
      if (!placeId) {
        return { success: false, error: "Place not found" };
      }

      // Step 2: Get photo references
      console.log(`📸 Getting photos for place ID: ${placeId}`);
      const photoReferences = await this.getPlacePhotos(placeId);
      if (photoReferences.length === 0) {
        return {
          success: false,
          error: "No photos available for this business",
        };
      }

      // Step 3: Download the first photo
      const fileName = `${businessName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.jpg`;
      console.log(`⬬ Downloading photo: ${photoReferences[0]}`);
      const filePath = await this.downloadPhoto(photoReferences[0], fileName);

      if (!filePath) {
        return { success: false, error: "Failed to download photo" };
      }

      return { success: true, filePath };
    } catch (error) {
      console.error(`Error in complete workflow for ${businessName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Clean up temporary files
   */
  cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error cleaning up temp file ${filePath}:`, error);
    }
  }
}
