import { Request, Response } from "express";
import * as ftp from "basic-ftp";

export async function debugHostingerConnection(req: Request, res: Response) {
  const client = new ftp.Client();

  try {
    console.log("🔗 Connecting to Hostinger FTP...");
    await client.access({
      host: "reportvisascam.com",
      user: "u611952859.crossborder1120",
      password: "One@click1",
      port: 21,
    });

    const results = [];
    results.push("✅ Connected successfully!");

    console.log("📁 Listing current directory...");
    const list = await client.list();
    results.push(`📁 Files in root: ${list.map((f) => f.name).join(", ")}`);

    console.log("🏠 Changing to public_html...");
    await client.cd("/public_html");

    const htmlList = await client.list();
    results.push(
      `📁 Files in public_html: ${htmlList.map((f) => f.name).join(", ")}`,
    );

    // Check if business-images exists and its details
    const businessImagesItem = htmlList.find(
      (item) => item.name === "business-images",
    );
    if (businessImagesItem) {
      results.push(
        `📂 business-images found - Type: ${businessImagesItem.type === 1 ? "file" : businessImagesItem.type === 2 ? "directory" : "unknown"}, Size: ${businessImagesItem.size}`,
      );
    } else {
      results.push("❌ business-images not found in public_html");
    }

    console.log("📂 Working with business-images directory...");
    try {
      // First try to cd to business-images
      await client.cd("business-images");
      results.push("✅ Successfully navigated to business-images directory");

      const businessImagesFiles = await client.list();
      results.push(
        `📁 Files in business-images: ${businessImagesFiles.map((f) => f.name).join(", ")}`,
      );

      console.log("📂 Creating logos directory...");
      await client.ensureDir("logos");
      results.push("✅ logos directory created/exists");

      console.log("📂 Creating photos directory...");
      await client.ensureDir("photos");
      results.push("✅ photos directory created/exists");

      // Test file upload using relative path
      console.log("📄 Uploading test file...");
      const testContent = "This is a test file to verify FTP upload works";
      await client.uploadFrom(Buffer.from(testContent), "test.txt");
      results.push("✅ Test file uploaded successfully");

      // Test logo upload using relative path
      console.log("🖼️ Uploading test logo...");
      await client.uploadFrom(Buffer.from(testContent), "logos/test-logo.jpg");
      results.push("✅ Test logo uploaded to logos directory");

      // Test photo upload
      console.log("📷 Uploading test photo...");
      await client.uploadFrom(
        Buffer.from(testContent),
        "photos/test-photo.jpg",
      );
      results.push("✅ Test photo uploaded to photos directory");
    } catch (dirError) {
      results.push(`❌ Directory operation error: ${dirError.message}`);
      console.error("Directory error details:", dirError);
    }

    res.json({
      success: true,
      message: "Hostinger FTP debug completed",
      results,
    });
  } catch (error) {
    console.error("❌ FTP Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to connect to Hostinger FTP",
    });
  } finally {
    client.close();
  }
}
