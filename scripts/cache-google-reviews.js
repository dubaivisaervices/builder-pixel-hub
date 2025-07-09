#!/usr/bin/env node

/**
 * One-time script to fetch Google reviews for all businesses
 * and cache them in the database to avoid expensive API calls
 */

const fetch = require("node-fetch");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database connection
const dbPath = path.join(__dirname, "../server/database/dubai_businesses.db");
const db = new sqlite3.Database(dbPath);

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("❌ Please set GOOGLE_PLACES_API_KEY environment variable");
  process.exit(1);
}

async function getAllBusinesses() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, name FROM businesses WHERE id IS NOT NULL",
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      },
    );
  });
}

async function getExistingReviews(businessId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT COUNT(*) as count FROM reviews WHERE business_id = ? AND id LIKE "google_%"',
      [businessId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0].count);
      },
    );
  });
}

async function saveReviewsToDatabase(businessId, reviews) {
  return new Promise((resolve, reject) => {
    // First clear existing Google reviews
    db.run(
      'DELETE FROM reviews WHERE business_id = ? AND id LIKE "google_%"',
      [businessId],
      (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Insert new reviews
        const stmt = db.prepare(`
        INSERT INTO reviews (id, business_id, author_name, rating, text, time_ago, profile_photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

        let completed = 0;
        const errors = [];

        reviews.forEach((review) => {
          stmt.run(
            [
              review.id,
              businessId,
              review.authorName,
              review.rating,
              review.text,
              review.timeAgo,
              review.profilePhotoUrl,
            ],
            (err) => {
              completed++;
              if (err) errors.push(err);

              if (completed === reviews.length) {
                stmt.finalize();
                if (errors.length > 0) {
                  reject(errors[0]);
                } else {
                  resolve(reviews.length);
                }
              }
            },
          );
        });

        if (reviews.length === 0) {
          stmt.finalize();
          resolve(0);
        }
      },
    );
  });
}

async function fetchGoogleReviews(businessId, businessName) {
  try {
    console.log(`🔍 Fetching reviews for: ${businessName}`);

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${businessId}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.log(`⚠️ Google API error for ${businessName}: ${data.status}`);
      return [];
    }

    if (!data.result || !data.result.reviews) {
      console.log(`📭 No reviews found for ${businessName}`);
      return [];
    }

    const reviews = data.result.reviews.slice(0, 10).map((review, index) => ({
      id: `google_${businessId}_${index}`,
      authorName: review.author_name,
      rating: review.rating,
      text: review.text || "No review text provided",
      timeAgo: review.relative_time_description || "Recently",
      profilePhotoUrl:
        review.profile_photo_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author_name)}&background=random`,
    }));

    console.log(`✅ Found ${reviews.length} reviews for ${businessName}`);
    return reviews;
  } catch (error) {
    console.error(
      `❌ Error fetching reviews for ${businessName}:`,
      error.message,
    );
    return [];
  }
}

async function main() {
  try {
    console.log("🚀 Starting Google Reviews caching process...");
    console.log(
      "💰 This will use Google API calls but only ONCE per business\n",
    );

    const businesses = await getAllBusinesses();
    console.log(`📊 Found ${businesses.length} businesses to process\n`);

    let processed = 0;
    let cached = 0;
    let fetched = 0;
    let apiCalls = 0;

    for (const business of businesses) {
      try {
        // Check if we already have reviews for this business
        const existingCount = await getExistingReviews(business.id);

        if (existingCount > 0) {
          console.log(
            `⚡ ${business.name}: Already has ${existingCount} cached reviews - SKIPPING`,
          );
          cached++;
        } else {
          // Fetch from Google API
          const reviews = await fetchGoogleReviews(business.id, business.name);
          apiCalls++;

          if (reviews.length > 0) {
            await saveReviewsToDatabase(business.id, reviews);
            console.log(
              `💾 ${business.name}: Cached ${reviews.length} reviews in database`,
            );
            fetched++;
          } else {
            console.log(`📭 ${business.name}: No reviews to cache`);
          }

          // Rate limiting - wait 100ms between API calls to be respectful
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        processed++;

        if (processed % 10 === 0) {
          console.log(
            `\n📊 Progress: ${processed}/${businesses.length} businesses processed`,
          );
          console.log(`💰 API calls made: ${apiCalls}`);
          console.log(`⚡ Served from cache: ${cached}`);
          console.log(`🆕 Newly fetched: ${fetched}\n`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${business.name}:`, error.message);
      }
    }

    console.log("\n🎉 Google Reviews caching completed!");
    console.log("📊 Final Summary:");
    console.log(`   • Total businesses: ${businesses.length}`);
    console.log(`   • Already cached: ${cached}`);
    console.log(`   • Newly fetched: ${fetched}`);
    console.log(`   • API calls made: ${apiCalls}`);
    console.log(`   • Total cost saved: Future API calls will be FREE! 💰\n`);
  } catch (error) {
    console.error("❌ Script failed:", error);
  } finally {
    db.close();
  }
}

main();
