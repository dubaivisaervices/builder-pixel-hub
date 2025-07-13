import { database } from "../database";

export async function addS3Columns(): Promise<void> {
  try {
    console.log("Adding S3 URL columns to businesses table...");

    // Add logo_s3_url column
    await database
      .run(
        `
      ALTER TABLE businesses 
      ADD COLUMN logo_s3_url TEXT
    `,
      )
      .catch((err) => {
        if (!err.message.includes("duplicate column name")) {
          throw err;
        }
        console.log("logo_s3_url column already exists");
      });

    // Add photos_s3_urls column (JSON array of S3 URLs)
    await database
      .run(
        `
      ALTER TABLE businesses 
      ADD COLUMN photos_s3_urls TEXT
    `,
      )
      .catch((err) => {
        if (!err.message.includes("duplicate column name")) {
          throw err;
        }
        console.log("photos_s3_urls column already exists");
      });

    console.log("✅ S3 URL columns added successfully");
  } catch (error) {
    console.error("❌ Error adding S3 URL columns:", error);
    throw error;
  }
}
