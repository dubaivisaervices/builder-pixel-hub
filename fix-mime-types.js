#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";

const FTP_CONFIG = {
  host: "crossbordersmigrations.com",
  user: "u611952859.reportvisascam.com",
  password: "One@click1",
  port: 21,
  secure: false,
};

async function fixMimeTypes() {
  const client = new ftp.Client();
  client.timeout = 30000;

  try {
    console.log("🔧 FIXING MIME TYPE ISSUE");
    console.log("=".repeat(40));

    console.log("🔗 Connecting to FTP...");
    await client.access(FTP_CONFIG);
    console.log("✅ Connected successfully");

    // Go to public_html if it exists
    try {
      await client.cd("public_html");
      console.log("📂 Moved to public_html");
    } catch (e) {
      console.log("📂 Staying in root directory");
    }

    // Create the .htaccess content
    const htaccessContent = `# Fix MIME types for JavaScript modules
AddType application/javascript .js
AddType application/javascript .mjs
AddType text/css .css
AddType application/json .json

# Enable SPA routing
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>`;

    // Write and upload .htaccess
    console.log("📝 Creating .htaccess file...");
    fs.writeFileSync("./.htaccess-temp", htaccessContent);

    await client.uploadFrom("./.htaccess-temp", ".htaccess");
    console.log("✅ .htaccess uploaded successfully");

    // Clean up
    fs.unlinkSync("./.htaccess-temp");

    console.log("\n🎉 MIME TYPE FIX COMPLETED!");
    console.log("✅ JavaScript files should now load correctly");
    console.log("🌐 Try refreshing your website now");
  } catch (error) {
    console.error("❌ Fix failed:", error.message);
  } finally {
    client.close();
  }
}

fixMimeTypes();
