#!/usr/bin/env node

/**
 * Database backup and restore utility
 * Helps restore database from backup files
 */

const fs = require("fs");
const path = require("path");

// Database paths
const MAIN_DB_PATH = "./server/database/dubai_businesses.db";
const BACKUP_DIR = "./backups";
const DATA_DIR = "./data";

class BackupRestorer {
  constructor() {
    this.backupDir = BACKUP_DIR;
    this.dataDir = DATA_DIR;
  }

  // Ensure backup directory exists
  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`✅ Created backup directory: ${this.backupDir}`);
    }
  }

  // Find all available backup files
  findBackupFiles() {
    const backupFiles = [];

    // Check backup directory
    if (fs.existsSync(this.backupDir)) {
      const files = fs.readdirSync(this.backupDir);
      files.forEach((file) => {
        if (file.endsWith(".db")) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          backupFiles.push({
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
            location: "backups",
          });
        }
      });
    }

    // Check data directory
    if (fs.existsSync(this.dataDir)) {
      const files = fs.readdirSync(this.dataDir);
      files.forEach((file) => {
        if (file.includes("backup") && file.endsWith(".db")) {
          const filePath = path.join(this.dataDir, file);
          const stats = fs.statSync(filePath);
          backupFiles.push({
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
            location: "data",
          });
        }
      });
    }

    // Check current directory
    const currentFiles = fs.readdirSync(".");
    currentFiles.forEach((file) => {
      if (file.includes("backup") && file.endsWith(".db")) {
        const stats = fs.statSync(file);
        backupFiles.push({
          name: file,
          path: file,
          size: stats.size,
          modified: stats.mtime,
          location: "root",
        });
      }
    });

    // Sort by modification time (newest first)
    return backupFiles.sort((a, b) => b.modified - a.modified);
  }

  // Create a backup of current database
  createBackup(reason = "Manual backup") {
    this.ensureBackupDir();

    if (!fs.existsSync(MAIN_DB_PATH)) {
      console.log("❌ Main database not found:", MAIN_DB_PATH);
      return null;
    }

    const timestamp =
      new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
      "_" +
      new Date().toISOString().split("T")[1].split(".")[0].replace(/:/g, "-");

    const backupPath = path.join(
      this.backupDir,
      `database_backup_${timestamp}.db`,
    );

    try {
      fs.copyFileSync(MAIN_DB_PATH, backupPath);
      const stats = fs.statSync(backupPath);

      console.log(`✅ Backup created successfully:`);
      console.log(`   Path: ${backupPath}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Reason: ${reason}`);

      return {
        path: backupPath,
        size: stats.size,
        timestamp,
        reason,
      };
    } catch (error) {
      console.error("❌ Failed to create backup:", error.message);
      return null;
    }
  }

  // Restore database from backup
  restoreFromBackup(backupPath, createBackupFirst = true) {
    if (!fs.existsSync(backupPath)) {
      console.error("❌ Backup file not found:", backupPath);
      return false;
    }

    try {
      // Create backup of current database first
      if (createBackupFirst && fs.existsSync(MAIN_DB_PATH)) {
        console.log("📋 Creating backup of current database before restore...");
        const backup = this.createBackup("Pre-restore backup");
        if (backup) {
          console.log("✅ Current database backed up");
        }
      }

      // Ensure target directory exists
      const dbDir = path.dirname(MAIN_DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Restore the backup
      fs.copyFileSync(backupPath, MAIN_DB_PATH);

      const stats = fs.statSync(MAIN_DB_PATH);
      console.log(`✅ Database restored successfully:`);
      console.log(`   From: ${backupPath}`);
      console.log(`   To: ${MAIN_DB_PATH}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

      return true;
    } catch (error) {
      console.error("❌ Failed to restore backup:", error.message);
      return false;
    }
  }

  // List all available backups
  listBackups() {
    const backups = this.findBackupFiles();

    if (backups.length === 0) {
      console.log("📁 No backup files found");
      console.log("💡 Use --create-backup to create a new backup");
      return [];
    }

    console.log(`📁 Found ${backups.length} backup file(s):`);
    console.log("");

    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.name}`);
      console.log(`   Path: ${backup.path}`);
      console.log(`   Size: ${(backup.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Modified: ${backup.modified.toLocaleString()}`);
      console.log(`   Location: ${backup.location}`);
      console.log("");
    });

    return backups;
  }

  // Interactive restore
  async interactiveRestore() {
    const backups = this.findBackupFiles();

    if (backups.length === 0) {
      console.log("❌ No backup files found to restore");
      console.log("💡 Create a backup first using --create-backup");
      return false;
    }

    console.log("🔄 Interactive Database Restore");
    console.log("================================");
    this.listBackups();

    // For automation, just restore the most recent backup
    const mostRecent = backups[0];
    console.log(`🎯 Restoring most recent backup: ${mostRecent.name}`);

    const success = this.restoreFromBackup(mostRecent.path);
    if (success) {
      console.log("✅ Database restore completed successfully!");
    }

    return success;
  }

  // Get database info
  getDatabaseInfo() {
    const info = {
      main: null,
      backups: [],
    };

    // Main database info
    if (fs.existsSync(MAIN_DB_PATH)) {
      const stats = fs.statSync(MAIN_DB_PATH);
      info.main = {
        path: MAIN_DB_PATH,
        size: stats.size,
        modified: stats.mtime,
        exists: true,
      };
    } else {
      info.main = {
        path: MAIN_DB_PATH,
        exists: false,
      };
    }

    // Backup files info
    info.backups = this.findBackupFiles();

    return info;
  }
}

// Command line interface
async function main() {
  const restorer = new BackupRestorer();
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Database Backup & Restore Utility
=================================

Usage:
  node restore-backup.js [command]

Commands:
  --list              List all available backups
  --create-backup     Create a new backup of current database
  --restore           Interactive restore from backup
  --restore [file]    Restore from specific backup file
  --info              Show database information
  --help              Show this help message

Examples:
  node restore-backup.js --list
  node restore-backup.js --create-backup
  node restore-backup.js --restore
  node restore-backup.js --restore ./backups/database_backup_2024-01-01.db
`);
    return;
  }

  if (args.includes("--list")) {
    restorer.listBackups();
    return;
  }

  if (args.includes("--create-backup")) {
    const reason = args[args.indexOf("--create-backup") + 1] || "Manual backup";
    restorer.createBackup(reason);
    return;
  }

  if (args.includes("--info")) {
    const info = restorer.getDatabaseInfo();
    console.log("📊 Database Information");
    console.log("======================");

    if (info.main.exists) {
      console.log(`Main Database: ${info.main.path}`);
      console.log(`  Size: ${(info.main.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Modified: ${info.main.modified.toLocaleString()}`);
    } else {
      console.log(`Main Database: ${info.main.path} (NOT FOUND)`);
    }

    console.log(`Available Backups: ${info.backups.length}`);
    if (info.backups.length > 0) {
      console.log(
        `  Most Recent: ${info.backups[0].name} (${info.backups[0].modified.toLocaleString()})`,
      );
    }

    return;
  }

  if (args.includes("--restore")) {
    const restoreIndex = args.indexOf("--restore");
    const backupFile = args[restoreIndex + 1];

    if (backupFile && !backupFile.startsWith("--")) {
      // Restore specific file
      console.log(`🔄 Restoring from: ${backupFile}`);
      const success = restorer.restoreFromBackup(backupFile);
      if (success) {
        console.log("✅ Restore completed!");
      }
    } else {
      // Interactive restore
      await restorer.interactiveRestore();
    }
    return;
  }

  // Default: show info and available commands
  console.log("🗄️ Database Backup & Restore Utility");
  console.log("====================================");

  const info = restorer.getDatabaseInfo();

  if (info.main.exists) {
    console.log("✅ Main database found");
  } else {
    console.log("❌ Main database not found");
  }

  console.log(`📁 Available backups: ${info.backups.length}`);

  console.log("");
  console.log("Commands:");
  console.log("  --list         List all backups");
  console.log("  --create-backup Create new backup");
  console.log("  --restore      Restore from backup");
  console.log("  --info         Show detailed info");
  console.log("  --help         Show full help");
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BackupRestorer };
