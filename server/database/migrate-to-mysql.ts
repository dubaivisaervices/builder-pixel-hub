import { database as sqliteDb } from "./database";
import { mysqlDatabase } from "./mysql-database";

interface Business {
  id: string;
  name: string;
  address?: string;
  category?: string;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  google_url?: string;
  logo_url?: string;
  photos_urls?: string;
  logo_s3_url?: string;
  photos_s3_urls?: string;
  created_at?: string;
  updated_at?: string;
}

interface Review {
  id: number;
  business_id: string;
  author_name?: string;
  author_url?: string;
  profile_photo_url?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
  time?: number;
  created_at?: string;
}

async function migrateData() {
  console.log("🚀 Starting SQLite to MySQL migration...");

  try {
    // 1. Migrate businesses
    console.log("📊 Migrating businesses...");
    const businesses: Business[] = await sqliteDb.all(
      "SELECT * FROM businesses",
    );

    console.log(`Found ${businesses.length} businesses to migrate`);

    for (const business of businesses) {
      await mysqlDatabase.query(
        `INSERT INTO businesses (
          id, name, address, category, phone, website, rating, review_count,
          latitude, longitude, place_id, google_url, logo_url, photos_urls,
          logo_s3_url, photos_s3_urls, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          address = VALUES(address),
          category = VALUES(category),
          phone = VALUES(phone),
          website = VALUES(website),
          rating = VALUES(rating),
          review_count = VALUES(review_count),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          place_id = VALUES(place_id),
          google_url = VALUES(google_url),
          logo_url = VALUES(logo_url),
          photos_urls = VALUES(photos_urls),
          logo_s3_url = VALUES(logo_s3_url),
          photos_s3_urls = VALUES(photos_s3_urls),
          updated_at = VALUES(updated_at)`,
        [
          business.id,
          business.name,
          business.address,
          business.category,
          business.phone,
          business.website,
          business.rating,
          business.review_count || 0,
          business.latitude,
          business.longitude,
          business.place_id,
          business.google_url,
          business.logo_url,
          business.photos_urls,
          business.logo_s3_url,
          business.photos_s3_urls,
          business.created_at,
          business.updated_at,
        ],
      );
    }

    console.log(`✅ Migrated ${businesses.length} businesses`);

    // 2. Migrate reviews
    console.log("📝 Migrating reviews...");
    const reviews: Review[] = await sqliteDb.all("SELECT * FROM reviews");

    console.log(`Found ${reviews.length} reviews to migrate`);

    for (const review of reviews) {
      await mysqlDatabase.query(
        `INSERT INTO reviews (
          business_id, author_name, author_url, profile_photo_url,
          rating, relative_time_description, text, time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          author_name = VALUES(author_name),
          rating = VALUES(rating),
          text = VALUES(text)`,
        [
          review.business_id,
          review.author_name,
          review.author_url,
          review.profile_photo_url,
          review.rating,
          review.relative_time_description,
          review.text,
          review.time,
          review.created_at,
        ],
      );
    }

    console.log(`✅ Migrated ${reviews.length} reviews`);

    // 3. Verify migration
    const mysqlBusinessCount = await mysqlDatabase.query(
      "SELECT COUNT(*) as count FROM businesses",
    );
    const mysqlReviewCount = await mysqlDatabase.query(
      "SELECT COUNT(*) as count FROM reviews",
    );

    console.log("\n📊 Migration Summary:");
    console.log(
      `Businesses: ${businesses.length} → ${mysqlBusinessCount[0].count}`,
    );
    console.log(`Reviews: ${reviews.length} → ${mysqlReviewCount[0].count}`);

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log("✅ Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateData };
