const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "dubai_businesses.db");

console.log("Running database migration for S3 columns...");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    process.exit(1);
  }

  console.log("Connected to SQLite database");

  // Add logo_s3_url column
  db.run("ALTER TABLE businesses ADD COLUMN logo_s3_url TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding logo_s3_url column:", err);
    } else {
      console.log("✅ logo_s3_url column added or already exists");
    }

    // Add photos_s3_urls column
    db.run("ALTER TABLE businesses ADD COLUMN photos_s3_urls TEXT", (err) => {
      if (err && !err.message.includes("duplicate column name")) {
        console.error("Error adding photos_s3_urls column:", err);
      } else {
        console.log("✅ photos_s3_urls column added or already exists");
      }

      console.log("✅ Migration completed successfully");
      db.close();
    });
  });
});
