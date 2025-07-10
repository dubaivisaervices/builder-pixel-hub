const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database path
const dbPath = path.join(__dirname, "..", "database.db");

// Old and new API keys
const OLD_API_KEY = "AIzaSyCDTJEgoCJ8tsbGxuHKIvcu-W0AdP-6lVk";
const NEW_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ||
  "AIzaSyDtCuMfNlJVEO5OFbRKHzziy1k4-W-tcC8";

console.log("🔧 Updating Google API URLs in database...");
console.log(`Old key: ${OLD_API_KEY}`);
console.log(`New key: ${NEW_API_KEY}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
    process.exit(1);
  }
  console.log("✅ Connected to SQLite database");
});

// Update logo URLs
db.serialize(() => {
  // First, check how many records need updating
  db.get(
    `SELECT COUNT(*) as count FROM businesses WHERE logo_url LIKE '%${OLD_API_KEY}%'`,
    (err, row) => {
      if (err) {
        console.error("❌ Error counting records:", err.message);
        return;
      }

      console.log(
        `📊 Found ${row.count} businesses with old API key in logo_url`,
      );

      if (row.count === 0) {
        console.log("✅ No updates needed");
        db.close();
        return;
      }

      // Update logo URLs
      db.run(
        `UPDATE businesses 
         SET logo_url = REPLACE(logo_url, '${OLD_API_KEY}', '${NEW_API_KEY}')
         WHERE logo_url LIKE '%${OLD_API_KEY}%'`,
        function (err) {
          if (err) {
            console.error("❌ Error updating logo URLs:", err.message);
            return;
          }
          console.log(`✅ Updated ${this.changes} logo URLs`);

          // Update photos JSON
          db.run(
            `UPDATE businesses 
             SET photos_json = REPLACE(photos_json, '${OLD_API_KEY}', '${NEW_API_KEY}')
             WHERE photos_json LIKE '%${OLD_API_KEY}%'`,
            function (err) {
              if (err) {
                console.error("❌ Error updating photos JSON:", err.message);
                return;
              }
              console.log(`✅ Updated ${this.changes} photos JSON records`);

              console.log("🎉 Database update completed successfully!");
              db.close((err) => {
                if (err) {
                  console.error("❌ Error closing database:", err.message);
                } else {
                  console.log("✅ Database connection closed");
                }
              });
            },
          );
        },
      );
    },
  );
});
