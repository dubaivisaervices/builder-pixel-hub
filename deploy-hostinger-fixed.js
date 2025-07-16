#!/usr/bin/env node

import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hostinger FTP Configuration
const HOSTINGER_CONFIG = {
  host: process.env.HOSTINGER_FTP_HOST || "reportvisascam.com",
  user: process.env.HOSTINGER_FTP_USER || "u611952859.reportvisascam",
  password: process.env.HOSTINGER_FTP_PASSWORD || "One@click1",
  port: parseInt(process.env.HOSTINGER_FTP_PORT || "21"),
};

async function uploadDirectory(client, localPath, remotePath) {
  console.log(`📁 Uploading directory: ${localPath} -> ${remotePath}`);

  const items = fs.readdirSync(localPath);

  for (const item of items) {
    const localItemPath = path.join(localPath, item);
    const remoteItemPath = `${remotePath}/${item}`;

    const stats = fs.statSync(localItemPath);

    if (stats.isDirectory()) {
      try {
        await client.ensureDir(remoteItemPath);
        console.log(`📂 Created directory: ${remoteItemPath}`);
      } catch (error) {
        console.log(`📂 Directory already exists: ${remoteItemPath}`);
      }

      await uploadDirectory(client, localItemPath, remoteItemPath);
    } else {
      console.log(`📄 Uploading file: ${item}`);
      await client.uploadFrom(localItemPath, remoteItemPath);
      console.log(`✅ Uploaded: ${remoteItemPath}`);
    }
  }
}

async function deployToHostinger() {
  const client = new ftp.Client();
  client.ftp.timeout = 60000; // 60 second timeout

  try {
    console.log("🚀 Starting Hostinger deployment...");
    console.log("🔗 Connecting to FTP server...");

    await client.access(HOSTINGER_CONFIG);
    console.log("✅ Connected to Hostinger FTP");

    // Navigate to public_html directory (this is the web root for Hostinger)
    try {
      await client.cd("public_html");
      console.log("📂 Navigated to public_html directory");
    } catch (error) {
      console.log("📂 public_html not found, staying in root");
    }

    // 1. Create .htaccess file for React routing
    console.log("📝 Creating .htaccess for React routing...");
    const htaccessContent = `# React Router Support
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# MIME types for modern web files
AddType application/javascript .js .mjs
AddType text/css .css
AddType image/svg+xml .svg

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache headers
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"
`;

    // Upload .htaccess
    await client.uploadFrom(Buffer.from(htaccessContent), ".htaccess");
    console.log("✅ Uploaded .htaccess file");

    // 2. Create index.php to prevent PHP errors and redirect to index.html
    console.log("📝 Creating index.php to handle PHP hosting...");
    const phpContent = `<?php
// Redirect to React app
if (!file_exists('index.html')) {
    http_response_code(404);
    echo 'Application not found. Please deploy the React build files.';
    exit;
}

// Check if this is an AJAX request or API call
$requestUri = $_SERVER['REQUEST_URI'];
if (strpos($requestUri, '/api/') === 0) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'API endpoint not available in static hosting']);
    exit;
}

// For all other requests, serve the React app
readfile('index.html');
?>`;

    await client.uploadFrom(Buffer.from(phpContent), "index.php");
    console.log("✅ Uploaded index.php");

    // 3. Upload React build files
    console.log("🌐 Uploading React application files...");
    const spaPath = path.join(__dirname, "dist", "spa");

    if (!fs.existsSync(spaPath)) {
      throw new Error(
        `Build directory not found: ${spaPath}. Please run 'npm run build' first.`,
      );
    }

    // Upload all files from dist/spa
    await uploadDirectory(client, spaPath, ".");

    // 4. Create composer.json to satisfy PHP hosting requirements
    console.log("📝 Creating composer.json for PHP hosting compatibility...");
    const composerJson = {
      name: "dubai-visa-scam-report/webapp",
      description: "Dubai Visa Scam Report - React Application",
      type: "project",
      require: {
        php: ">=7.4",
      },
      extra: {
        note: "This is a React application deployed on PHP hosting",
      },
    };

    await client.uploadFrom(
      Buffer.from(JSON.stringify(composerJson, null, 2)),
      "composer.json",
    );
    console.log("✅ Uploaded composer.json");

    // 5. Verify deployment
    console.log("🔍 Verifying deployment...");
    const files = await client.list();
    console.log("📋 Files deployed:");
    files.forEach((file) => {
      console.log(
        `  ${file.type === 1 ? "📁" : "📄"} ${file.name} (${file.size} bytes)`,
      );
    });

    console.log("\n🎉 Deployment completed successfully!");
    console.log(
      "🌐 Website should be accessible at: https://reportvisascam.com",
    );
    console.log("📝 Deployed files:");
    console.log("   ✅ React application (index.html + assets)");
    console.log("   ✅ .htaccess for routing");
    console.log("   ✅ index.php for PHP hosting compatibility");
    console.log("   ✅ composer.json for dependency management");
    console.log("\n🛡️ Dubai Visa Scam Report website is now live!");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  } finally {
    client.close();
    console.log("🔌 FTP connection closed");
  }
}

// Run deployment
deployToHostinger()
  .then(() => {
    console.log("✅ Hostinger deployment completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Hostinger deployment failed:", error);
    process.exit(1);
  });
