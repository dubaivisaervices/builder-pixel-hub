import { Request, Response } from "express";
import * as ftp from "basic-ftp";

export async function debugHostingerConnection(req: Request, res: Response) {
  const client = new ftp.Client();

  try {
    console.log("🔗 Connecting to Hostinger FTP...");
    await client.access({
      host: "crossbordersmigrations.com",
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

    console.log("📂 Creating business-images directory...");
    try {
      await client.ensureDir("business-images");
      results.push("✅ business-images directory created/exists");

      await client.cd("business-images");

      console.log("📂 Creating logos directory...");
      await client.ensureDir("logos");
      results.push("✅ logos directory created/exists");

      console.log("📂 Creating photos directory...");
      await client.ensureDir("photos");
      results.push("✅ photos directory created/exists");

      console.log("📄 Creating test file...");
      const testContent = "This is a test file to verify FTP upload works";
      await client.uploadFrom(
        Buffer.from(testContent),
        "/public_html/business-images/test.txt",
      );
      results.push("✅ Test file uploaded successfully");

      // Test logo upload
      console.log("🖼️ Uploading test logo...");
      await client.cd("/public_html/business-images/logos");
      await client.uploadFrom(Buffer.from(testContent), "test-logo.jpg");
      results.push("✅ Test logo uploaded to logos directory");
    } catch (dirError) {
      results.push(`❌ Directory operation error: ${dirError.message}`);
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
