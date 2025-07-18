#!/usr/bin/env node

import { readFileSync } from "fs";
import { join } from "path";
import pg from "pg";
import Database from "better-sqlite3";

const { Pool } = pg;

// Database connection configuration
const config = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

async function migrateSQLiteToPostgreSQL() {
  console.log("🔄 Starting migration from SQLite to PostgreSQL...");

  // Connect to PostgreSQL
  const pool = new Pool(config);
  const client = await pool.connect();

  try {
    // Connect to SQLite
    const sqliteDb = new Database("./server/database/dubai_businesses.db");

    console.log("📊 Creating PostgreSQL tables...");

    // Create businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(500) NOT NULL,
        address TEXT,
        phone VARCHAR(100),
        website VARCHAR(500),
        email VARCHAR(200),
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        rating DECIMAL(3, 2),
        review_count INTEGER DEFAULT 0,
        category VARCHAR(200),
        business_status VARCHAR(50),
        logo_url TEXT,
        photos_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(255) PRIMARY KEY,
        business_id VARCHAR(255) REFERENCES businesses(id),
        author_name VARCHAR(200),
        rating INTEGER,
        text TEXT,
        time_ago VARCHAR(100),
        profile_photo_url TEXT,
        is_real BOOLEAN DEFAULT true,
        google_review_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company_reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_reports (
        id SERIAL PRIMARY KEY,
        company_id VARCHAR(255) REFERENCES businesses(id),
        reporter_name VARCHAR(200),
        reporter_email VARCHAR(200),
        report_type VARCHAR(100),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS company_requests (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(500) NOT NULL,
        contact_person VARCHAR(200),
        email VARCHAR(200),
        phone VARCHAR(100),
        website VARCHAR(500),
        business_type VARCHAR(200),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("📋 Migrating businesses data...");

    // Migrate businesses
    const businesses = sqliteDb.prepare("SELECT * FROM businesses").all();
    console.log(`📊 Found ${businesses.length} businesses to migrate`);

    for (const business of businesses) {
      await client.query(
        `
        INSERT INTO businesses (
          id, name, address, phone, website, email, lat, lng,
          rating, review_count, category, business_status, logo_url,
          photos_json, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          email = EXCLUDED.email,
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          category = EXCLUDED.category,
          business_status = EXCLUDED.business_status,
          logo_url = EXCLUDED.logo_url,
          photos_json = EXCLUDED.photos_json,
          updated_at = EXCLUDED.updated_at
      `,
        [
          business.id,
          business.name,
          business.address,
          business.phone,
          business.website,
          business.email,
          business.lat,
          business.lng,
          business.rating,
          business.review_count,
          business.category,
          business.business_status,
          business.logo_url,
          business.photos_json,
          business.created_at,
          business.updated_at,
        ],
      );
    }

    console.log("📝 Migrating reviews data...");

    // Migrate reviews
    const reviews = sqliteDb.prepare("SELECT * FROM reviews").all();
    console.log(`📊 Found ${reviews.length} reviews to migrate`);

    for (const review of reviews) {
      await client.query(
        `
        INSERT INTO reviews (
          id, business_id, author_name, rating, text, time_ago,
          profile_photo_url, is_real, google_review_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          business_id = EXCLUDED.business_id,
          author_name = EXCLUDED.author_name,
          rating = EXCLUDED.rating,
          text = EXCLUDED.text,
          time_ago = EXCLUDED.time_ago,
          profile_photo_url = EXCLUDED.profile_photo_url,
          is_real = EXCLUDED.is_real,
          google_review_id = EXCLUDED.google_review_id
      `,
        [
          review.id,
          review.business_id,
          review.author_name,
          review.rating,
          review.text,
          review.time_ago,
          review.profile_photo_url,
          review.is_real,
          review.google_review_id,
          review.created_at,
        ],
      );
    }

    console.log("🚨 Migrating company reports...");

    // Migrate company reports if they exist
    try {
      const reports = sqliteDb.prepare("SELECT * FROM company_reports").all();
      console.log(`📊 Found ${reports.length} company reports to migrate`);

      for (const report of reports) {
        await client.query(
          `
          INSERT INTO company_reports (
            id, company_id, reporter_name, reporter_email, report_type,
            description, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            company_id = EXCLUDED.company_id,
            reporter_name = EXCLUDED.reporter_name,
            reporter_email = EXCLUDED.reporter_email,
            report_type = EXCLUDED.report_type,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            updated_at = EXCLUDED.updated_at
        `,
          [
            report.id,
            report.company_id,
            report.reporter_name,
            report.reporter_email,
            report.report_type,
            report.description,
            report.status,
            report.created_at,
            report.updated_at,
          ],
        );
      }
    } catch (e) {
      console.log("ℹ️ No company reports table found, skipping...");
    }

    console.log("📊 Creating indexes for better performance...");

    // Create indexes
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category)",
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating)",
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id)",
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)",
    );
    await client.query(
      "CREATE INDEX IF NOT EXISTS idx_company_reports_company_id ON company_reports(company_id)",
    );

    // Get final counts
    const businessCount = await client.query(
      "SELECT COUNT(*) as count FROM businesses",
    );
    const reviewCount = await client.query(
      "SELECT COUNT(*) as count FROM reviews",
    );
    const reportCount = await client.query(
      "SELECT COUNT(*) as count FROM company_reports",
    );

    console.log("\n🎉 Migration completed successfully!");
    console.log(`📊 Migrated ${businessCount.rows[0].count} businesses`);
    console.log(`📝 Migrated ${reviewCount.rows[0].count} reviews`);
    console.log(`🚨 Migrated ${reportCount.rows[0].count} reports`);

    sqliteDb.close();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateSQLiteToPostgreSQL().catch(console.error);
