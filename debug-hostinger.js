const ftp = require("basic-ftp");
const fs = require("fs");

async function debugHostingerUpload() {
  const client = new ftp.Client();

  try {
    console.log("🔗 Connecting to Hostinger FTP...");
    await client.access({
      host: "crossbordersmigrations.com",
      user: "u611952859.crossborder1120",
      password: "One@click1",
      port: 21,
    });

    console.log("✅ Connected! Listing current directory...");
    const list = await client.list();
    console.log(
      "📁 Files in root:",
      list.map((f) => f.name),
    );

    console.log("🏠 Changing to public_html...");
    await client.cd("/public_html");

    const htmlList = await client.list();
    console.log(
      "📁 Files in public_html:",
      htmlList.map((f) => f.name),
    );

    console.log("📂 Creating business-images directory...");
    try {
      await client.ensureDir("business-images");
      console.log("✅ business-images directory created/exists");

      await client.cd("business-images");

      console.log("📂 Creating logos directory...");
      await client.ensureDir("logos");
      console.log("✅ logos directory created/exists");

      console.log("📂 Creating photos directory...");
      await client.ensureDir("photos");
      console.log("✅ photos directory created/exists");

      console.log("📄 Creating test file...");
      const testContent = "This is a test file";
      await client.uploadFrom(Buffer.from(testContent), "test.txt");
      console.log("✅ Test file uploaded");
    } catch (dirError) {
      console.error("❌ Directory creation error:", dirError);
    }
  } catch (error) {
    console.error("❌ FTP Error:", error);
  } finally {
    client.close();
  }
}

debugHostingerUpload();
