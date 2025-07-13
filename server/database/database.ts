import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";

// Database file path
const DB_PATH = path.join(__dirname, "dubai_businesses.db");

class Database {
  private db: sqlite3.Database | null = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      // Enable verbose mode for debugging
      const sqlite = sqlite3.verbose();

      this.db = new sqlite.Database(DB_PATH, (err) => {
        if (err) {
          console.error("Error opening database:", err);
        } else {
          console.log("Connected to SQLite database");
          this.optimizeDatabase();
          this.initTables();
        }
      });
    } catch (error) {
      console.error("Failed to initialize database:", error);
      this.db = null;
    }
  }

  private async optimizeDatabase() {
    try {
      // Increase SQLite database size and performance limits
      await this.run("PRAGMA page_size = 65536"); // Increase page size for better performance (default 4096)
      await this.run("PRAGMA cache_size = -2000000"); // 2GB cache size (negative means KB)
      await this.run("PRAGMA max_page_count = 2147483646"); // Max possible pages (~140TB theoretical limit)
      await this.run("PRAGMA journal_mode = WAL"); // Write-Ahead Logging for better concurrent access
      await this.run("PRAGMA synchronous = NORMAL"); // Balance between safety and performance
      await this.run("PRAGMA temp_store = MEMORY"); // Use memory for temp storage
      await this.run("PRAGMA mmap_size = 268435456"); // 256MB memory-mapped I/O
      await this.run("PRAGMA optimize"); // Optimize query planner

      console.log(
        "✅ Database optimized for large datasets and high performance",
      );
    } catch (error) {
      console.error("Warning: Could not optimize database:", error);
    }
  }

  private async initTables() {
    try {
      await this.run(`
        CREATE TABLE IF NOT EXISTS businesses (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT,
          phone TEXT,
          website TEXT,
          email TEXT,
          lat REAL,
          lng REAL,
          rating REAL DEFAULT 0,
          review_count INTEGER DEFAULT 0,
          category TEXT,
          business_status TEXT,
          photo_reference TEXT,
          logo_url TEXT,
          logo_base64 TEXT, -- Base64 encoded logo for offline use
          logo_s3_url TEXT, -- S3 URL for logo
          photos_s3_urls TEXT, -- JSON array of S3 URLs for photos
          is_open BOOLEAN,
          price_level INTEGER,
          has_target_keyword BOOLEAN DEFAULT FALSE,
          hours_json TEXT, -- JSON string for operating hours
          photos_json TEXT, -- JSON string for photos array
          photos_local_json TEXT, -- JSON string for base64 encoded photos
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY,
          business_id TEXT NOT NULL,
          author_name TEXT NOT NULL,
          rating INTEGER NOT NULL,
          text TEXT NOT NULL,
          time_ago TEXT NOT NULL,
          profile_photo_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
        )
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_business_name ON businesses(name);
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_business_category ON businesses(category);
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_business_rating ON businesses(rating);
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
      `);

      await this.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          company_id TEXT NOT NULL,
          company_name TEXT NOT NULL,
          issue_type TEXT NOT NULL,
          description TEXT NOT NULL,
          reporter_name TEXT NOT NULL,
          reporter_email TEXT NOT NULL,
          amount_lost INTEGER DEFAULT 0,
          date_of_incident TEXT,
          evidence_description TEXT,
          employee_name TEXT,
          payment_receipt_path TEXT,
          agreement_copy_path TEXT,
          status TEXT DEFAULT 'pending',
          admin_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES businesses (id)
        )
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_reports_company_id ON reports(company_id);
      `);

      await this.run(`
        CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
      `);

      console.log("Database tables initialized successfully");
    } catch (error) {
      console.error("Error initializing database tables:", error);
    }
  }

  // Promisify database methods
  public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  public get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  public all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"));
        return;
      }
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Export singleton instance - only create during runtime, not build
let databaseInstance: Database | null = null;

export const database = (() => {
  if (!databaseInstance) {
    databaseInstance = new Database();
  }
  return databaseInstance;
})();
