#!/usr/bin/env node

/**
 * Database optimization script for handling 4000+ images
 * This script optimizes the database for storing large amounts of base64 image data
 */

const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Database configuration
const DB_PATH = process.env.DB_PATH || "./data/database.db";
const BACKUP_PATH = "./data/database_backup.db";

class DatabaseOptimizer {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error("❌ Failed to connect to database:", err.message);
          reject(err);
        } else {
          console.log("✅ Connected to SQLite database");
          resolve();
        }
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error("Error closing database:", err.message);
          } else {
            console.log("✅ Database connection closed");
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async createBackup() {
    try {
      console.log("📋 Creating database backup...");

      if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, BACKUP_PATH);
        console.log(`✅ Backup created: ${BACKUP_PATH}`);
      } else {
        console.log("⚠️ Original database not found, skipping backup");
      }
    } catch (error) {
      console.error("❌ Failed to create backup:", error.message);
      throw error;
    }
  }

  async optimizeDatabase() {
    try {
      console.log("🔧 Starting database optimization...");

      // 1. Set PRAGMA settings for better performance with large data
      console.log("📝 Setting performance PRAGMAs...");

      await this.runQuery("PRAGMA journal_mode = WAL");
      await this.runQuery("PRAGMA synchronous = NORMAL");
      await this.runQuery("PRAGMA cache_size = -64000"); // 64MB cache
      await this.runQuery("PRAGMA temp_store = MEMORY");
      await this.runQuery("PRAGMA mmap_size = 268435456"); // 256MB mmap

      console.log("✅ Performance settings applied");

      // 2. Analyze current database size and structure
      const dbStats = await this.analyzeDatabaseSize();
      console.log("📊 Database Analysis:");
      console.log(`   - Total businesses: ${dbStats.businesses}`);
      console.log(`   - Total reviews: ${dbStats.reviews}`);
      console.log(`   - Photos with base64: ${dbStats.photosWithBase64}`);
      console.log(
        `   - Estimated size: ${(dbStats.estimatedSize / 1024 / 1024).toFixed(2)} MB`,
      );

      // 3. Optimize tables
      console.log("🔧 Running VACUUM and ANALYZE...");
      await this.runQuery("VACUUM");
      await this.runQuery("ANALYZE");
      console.log("✅ Database optimized");

      // 4. Add indexes for better photo queries if they don't exist
      console.log("📑 Creating optimized indexes...");
      await this.createOptimizedIndexes();

      // 5. Check for potential issues
      await this.checkIntegrity();

      console.log("✅ Database optimization completed successfully");

      return dbStats;
    } catch (error) {
      console.error("❌ Database optimization failed:", error.message);
      throw error;
    }
  }

  async analyzeDatabaseSize() {
    try {
      const businesses = await this.getQuery(
        "SELECT COUNT(*) as count FROM businesses",
      );
      const reviews = await this.getQuery(
        "SELECT COUNT(*) as count FROM reviews",
      );

      // Count photos with base64 data
      const businessesWithPhotos = await this.allQuery(`
        SELECT photos_json, photos_local_json FROM businesses 
        WHERE photos_json IS NOT NULL OR photos_local_json IS NOT NULL
      `);

      let photosWithBase64 = 0;
      let estimatedSize = 0;

      for (const business of businessesWithPhotos) {
        try {
          // Check photos_local_json for base64 photos
          if (business.photos_local_json) {
            const localPhotos = JSON.parse(business.photos_local_json);
            if (Array.isArray(localPhotos)) {
              for (const photo of localPhotos) {
                if (photo.base64) {
                  photosWithBase64++;
                  estimatedSize += photo.base64.length;
                }
              }
            }
          }

          // Check photos_json for base64 photos (fallback)
          if (business.photos_json && !business.photos_local_json) {
            const photos = JSON.parse(business.photos_json);
            if (Array.isArray(photos)) {
              for (const photo of photos) {
                if (photo.base64) {
                  photosWithBase64++;
                  estimatedSize += photo.base64.length;
                }
              }
            }
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }

      return {
        businesses: businesses.count,
        reviews: reviews.count,
        photosWithBase64,
        estimatedSize,
      };
    } catch (error) {
      console.error("Error analyzing database size:", error.message);
      return {
        businesses: 0,
        reviews: 0,
        photosWithBase64: 0,
        estimatedSize: 0,
      };
    }
  }

  async createOptimizedIndexes() {
    const indexes = [
      {
        name: "idx_businesses_category_rating",
        sql: "CREATE INDEX IF NOT EXISTS idx_businesses_category_rating ON businesses(category, rating DESC)",
      },
      {
        name: "idx_businesses_updated_at",
        sql: "CREATE INDEX IF NOT EXISTS idx_businesses_updated_at ON businesses(updated_at DESC)",
      },
      {
        name: "idx_businesses_has_photos",
        sql: "CREATE INDEX IF NOT EXISTS idx_businesses_has_photos ON businesses(id) WHERE photos_json IS NOT NULL OR photos_local_json IS NOT NULL",
      },
      {
        name: "idx_reviews_business_rating",
        sql: "CREATE INDEX IF NOT EXISTS idx_reviews_business_rating ON reviews(business_id, rating DESC)",
      },
    ];

    for (const index of indexes) {
      try {
        await this.runQuery(index.sql);
        console.log(`   ✅ Created index: ${index.name}`);
      } catch (error) {
        if (!error.message.includes("already exists")) {
          console.log(
            `   ⚠️ Failed to create index ${index.name}: ${error.message}`,
          );
        }
      }
    }
  }

  async checkIntegrity() {
    try {
      console.log("🔍 Checking database integrity...");

      const result = await this.getQuery("PRAGMA integrity_check");

      if (result && result.integrity_check === "ok") {
        console.log("✅ Database integrity check passed");
      } else {
        console.log("⚠️ Database integrity issues detected:", result);
      }

      return result;
    } catch (error) {
      console.error("❌ Integrity check failed:", error.message);
      return null;
    }
  }

  async compressPhotos() {
    try {
      console.log("🗜️ Starting photo compression...");

      // This is a placeholder for photo compression logic
      // In a real implementation, you would:
      // 1. Load photos from database
      // 2. Compress them (reduce quality/size)
      // 3. Update database with compressed versions

      console.log("⚠️ Photo compression not implemented in this version");
      console.log(
        "💡 Consider implementing image compression for base64 photos to save space",
      );

      return { compressed: 0, spaceSaved: 0 };
    } catch (error) {
      console.error("❌ Photo compression failed:", error.message);
      throw error;
    }
  }

  async generateReport() {
    try {
      const stats = await this.analyzeDatabaseSize();
      const fileSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;

      const report = {
        timestamp: new Date().toISOString(),
        database: {
          file_size_mb: (fileSize / 1024 / 1024).toFixed(2),
          businesses: stats.businesses,
          reviews: stats.reviews,
          photos_with_base64: stats.photosWithBase64,
          estimated_photo_data_mb: (stats.estimatedSize / 1024 / 1024).toFixed(
            2,
          ),
        },
        recommendations: [],
      };

      // Add recommendations
      if (stats.photosWithBase64 > 5000) {
        report.recommendations.push(
          "Consider implementing photo compression to reduce database size",
        );
      }

      if (fileSize > 500 * 1024 * 1024) {
        // 500MB
        report.recommendations.push(
          "Database is quite large, consider archiving old data",
        );
      }

      if (stats.photosWithBase64 < stats.businesses * 2) {
        report.recommendations.push(
          "Many businesses are missing photos, consider running photo sync",
        );
      }

      console.log("\n📊 DATABASE OPTIMIZATION REPORT");
      console.log("=====================================");
      console.log(`Timestamp: ${report.timestamp}`);
      console.log(`Database File Size: ${report.database.file_size_mb} MB`);
      console.log(`Total Businesses: ${report.database.businesses}`);
      console.log(`Total Reviews: ${report.database.reviews}`);
      console.log(`Photos with Base64: ${report.database.photos_with_base64}`);
      console.log(
        `Photo Data Size: ${report.database.estimated_photo_data_mb} MB`,
      );

      if (report.recommendations.length > 0) {
        console.log("\n💡 RECOMMENDATIONS:");
        report.recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec}`);
        });
      }

      console.log("=====================================\n");

      return report;
    } catch (error) {
      console.error("❌ Failed to generate report:", error.message);
      throw error;
    }
  }
}

async function main() {
  const optimizer = new DatabaseOptimizer();

  try {
    await optimizer.connect();

    // Create backup first
    await optimizer.createBackup();

    // Run optimization
    await optimizer.optimizeDatabase();

    // Generate report
    await optimizer.generateReport();

    console.log("✅ Database optimization completed successfully!");
    console.log("💡 Your database is now optimized for handling 4000+ images");
  } catch (error) {
    console.error("❌ Optimization failed:", error.message);
    process.exit(1);
  } finally {
    await optimizer.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DatabaseOptimizer };
