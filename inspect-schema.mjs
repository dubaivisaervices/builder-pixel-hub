#!/usr/bin/env node

import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(
  __dirname,
  "server",
  "database",
  "dubai_businesses.db",
);

async function inspectSchema() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dbPath)) {
      reject(new Error(`Database file not found: ${dbPath}`));
      return;
    }

    const db = new sqlite3.Database(dbPath);

    console.log("🔍 Inspecting database schema...");
    console.log(`📁 Database: ${dbPath}`);

    // Get table info
    db.all("PRAGMA table_info(businesses)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }

      console.log("\n📊 BUSINESSES table columns:");
      columns.forEach((col) => {
        console.log(
          `  ${col.cid}: ${col.name} (${col.type}) ${col.notnull ? "NOT NULL" : ""} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ""}`,
        );
      });

      // Get sample data
      db.all("SELECT * FROM businesses LIMIT 3", (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("\n📄 Sample business records:");
        rows.forEach((row, index) => {
          console.log(`\n  Record ${index + 1}:`);
          console.log(`    ID: ${row.id}`);
          console.log(`    Name: ${row.name}`);
          console.log(`    Category: ${row.category || "N/A"}`);
          console.log(`    Address: ${row.address || "N/A"}`);
          console.log(`    Rating: ${row.rating || "N/A"}`);
        });

        // Get count
        db.get("SELECT COUNT(*) as count FROM businesses", (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          console.log(`\n📈 Total businesses: ${result.count}`);

          db.close();
          resolve({
            columns,
            sampleData: rows,
            totalCount: result.count,
          });
        });
      });
    });
  });
}

inspectSchema()
  .then((data) => {
    console.log("\n✅ Schema inspection completed!");
  })
  .catch((error) => {
    console.error("❌ Inspection failed:", error);
  });
