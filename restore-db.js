const fs = require("fs");

console.log("🗄️ Database Restore Utility");
console.log("===========================");

// Current database info
const mainDb = "server/database/dubai_businesses.db";
const backupDb = "backups/current_backup.db";

console.log("\n📊 Current Status:");
if (fs.existsSync(mainDb)) {
  const stats = fs.statSync(mainDb);
  console.log(`✅ Main Database: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
} else {
  console.log("❌ Main database not found");
}

if (fs.existsSync(backupDb)) {
  const stats = fs.statSync(backupDb);
  console.log(
    `📋 Backup Available: ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(`   Created: ${stats.mtime.toLocaleString()}`);
} else {
  console.log("❌ No backup found");
}

const args = process.argv.slice(2);

if (args.includes("--restore-from-backup")) {
  if (fs.existsSync(backupDb)) {
    console.log("\n🔄 Restoring database from backup...");
    fs.copyFileSync(backupDb, mainDb);
    console.log("✅ Database restored successfully!");
  } else {
    console.log("❌ No backup file found to restore from");
  }
} else {
  console.log("\n💡 Available Commands:");
  console.log("  node restore-db.js --restore-from-backup");
  console.log("\n⚠️  This will restore your database to the backup state");
}
