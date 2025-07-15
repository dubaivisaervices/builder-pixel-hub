import { Request, Response } from "express";
import { createHostingerService } from "../services/hostingerUpload";

const HOSTINGER_CONFIG = {
  host: "reportvisascam.com",
  user: "u611952859.crossborder1120",
  password: "One@click1",
  port: 21,
  remotePath: "/public_html/business-images",
  baseUrl: "https://reportvisascam.com/business-images",
};

export async function testHostingerUpload(req: Request, res: Response) {
  try {
    const hostingerService = createHostingerService(HOSTINGER_CONFIG);

    // Create test data
    const testLogoContent = "Test logo content - this is a test file";
    const testLogoBuffer = Buffer.from(testLogoContent);

    // Upload test logo
    console.log("🧪 Testing logo upload...");
    const logoUrl = await hostingerService.uploadBusinessLogo(
      testLogoBuffer,
      "test-place-id-123",
      "test-logo.jpg",
    );

    // Upload test photo
    console.log("🧪 Testing photo upload...");
    const photoUrl = await hostingerService.uploadBusinessPhoto(
      testLogoBuffer,
      "test-place-id-123",
      "photo_1",
      "test-photo.jpg",
    );

    res.json({
      success: true,
      message: "Test uploads completed",
      logoUrl,
      photoUrl,
      testInstructions: `Check if these URLs work:\n1. ${logoUrl}\n2. ${photoUrl}`,
    });
  } catch (error) {
    console.error("❌ Test upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
