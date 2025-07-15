import mysql from "mysql2/promise";

interface MySQLConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

class MySQLDatabase {
  private connection: mysql.Connection | null = null;
  private config: MySQLConfig;

  constructor(config: MySQLConfig) {
    this.config = config;
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      this.connection = await mysql.createConnection({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port || 3306,
        charset: "utf8mb4",
      });

      console.log("✅ Connected to MySQL database");
      await this.initTables();
    } catch (error) {
      console.error("❌ Failed to connect to MySQL:", error);
      throw error;
    }
  }

  private async initTables() {
    try {
      // Create businesses table
      await this.connection!.execute(`
        CREATE TABLE IF NOT EXISTS businesses (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(500) NOT NULL,
          address TEXT,
          category VARCHAR(255),
          phone VARCHAR(100),
          website VARCHAR(500),
          rating DECIMAL(3,2),
          review_count INT DEFAULT 0,
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          place_id VARCHAR(255),
          google_url TEXT,
          logo_url TEXT,
          photos_urls JSON,
          logo_s3_url TEXT,
          photos_s3_urls JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_rating (rating),
          INDEX idx_place_id (place_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Create reviews table
      await this.connection!.execute(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          business_id VARCHAR(255) NOT NULL,
          author_name VARCHAR(255),
          author_url VARCHAR(500),
          profile_photo_url VARCHAR(500),
          rating INT,
          relative_time_description VARCHAR(255),
          text TEXT,
          time BIGINT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
          INDEX idx_business_id (business_id),
          INDEX idx_rating (rating)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log("✅ MySQL tables initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing MySQL tables:", error);
      throw error;
    }
  }

  // Query methods
  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.connection) {
      throw new Error("Database not connected");
    }
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }

  async queryOne(sql: string, params: any[] = []): Promise<any> {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log("🔌 MySQL connection closed");
    }
  }
}

// Configuration for Hostinger MySQL
const MYSQL_CONFIG: MySQLConfig = {
  host: process.env.MYSQL_HOST || "localhost", // From Hostinger panel
  user: process.env.MYSQL_USER || "your_db_user",
  password: process.env.MYSQL_PASSWORD || "your_db_password",
  database: process.env.MYSQL_DATABASE || "your_db_name",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
};

// Export singleton instance
let mysqlInstance: MySQLDatabase | null = null;

export const mysqlDatabase = (() => {
  if (!mysqlInstance) {
    mysqlInstance = new MySQLDatabase(MYSQL_CONFIG);
  }
  return mysqlInstance;
})();

export { MySQLDatabase };
