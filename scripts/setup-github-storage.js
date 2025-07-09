#!/usr/bin/env node

/**
 * Setup script for GitHub image storage integration
 * This script helps configure GitHub repository for storing business images
 */

const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

async function setupGitHubStorage() {
  console.log("🚀 Dubai Visa Services - GitHub Storage Setup");
  console.log("================================================\n");

  try {
    // Check if .env exists
    const envPath = path.join(process.cwd(), ".env");
    let envExists = false;
    try {
      await fs.access(envPath);
      envExists = true;
      console.log("✅ Found existing .env file");
    } catch (error) {
      console.log("📄 No .env file found, will create one");
    }

    // Get GitHub configuration
    console.log("\n📋 GitHub Configuration Setup:");
    console.log(
      "1. Go to GitHub Settings > Developer settings > Personal access tokens",
    );
    console.log('2. Generate new token with "repo" permissions');
    console.log("3. Copy the token (keep it safe!)\n");

    const githubToken = await question(
      "Enter your GitHub Personal Access Token: ",
    );
    const githubOwner = await question("Enter your GitHub username: ");
    const githubRepo =
      (await question(
        "Enter repository name for images (default: dubai-visa-services-images): ",
      )) || "dubai-visa-services-images";

    // Prepare .env content
    const envContent = `# GitHub Configuration for Image Storage
GITHUB_TOKEN=${githubToken}
GITHUB_OWNER=${githubOwner}
GITHUB_REPO=${githubRepo}

# Database Configuration
DB_PATH=./server/database/dubai_businesses.db

# Server Configuration
PORT=3000
NODE_ENV=development

# Auto-generated on ${new Date().toISOString()}
`;

    // Write .env file
    await fs.writeFile(envPath, envContent);
    console.log("\n✅ Created .env file with GitHub configuration");

    // Test GitHub API connection
    console.log("\n🔍 Testing GitHub API connection...");

    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(
        `https://api.github.com/users/${githubOwner}`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (response.ok) {
        const userData = await response.json();
        console.log(
          `✅ GitHub API connection successful! Hello, ${userData.name || githubOwner}!`,
        );
      } else {
        console.log(
          "⚠️  GitHub API connection failed. Please check your token and username.",
        );
      }
    } catch (error) {
      console.log("⚠️  Could not test GitHub API connection:", error.message);
    }

    // Create repository check
    console.log("\n📦 Repository setup:");
    console.log(`Repository: https://github.com/${githubOwner}/${githubRepo}`);
    console.log(
      "Note: The repository will be created automatically when you first save images.",
    );

    console.log("\n🎉 Setup Complete!");
    console.log("\n📋 Next Steps:");
    console.log("1. Restart your development server");
    console.log("2. Go to Admin Dashboard > Data Persistence tab");
    console.log(
      '3. Click "Save All Data" to backup everything to database + GitHub',
    );
    console.log('4. Use "Export Backup" to download a complete JSON backup');

    console.log("\n💡 Features Available:");
    console.log("✅ All business listings saved to SQLite database");
    console.log("✅ All reviews and ratings preserved");
    console.log("✅ Business images saved as base64 AND uploaded to GitHub");
    console.log("✅ Full backup/restore capability");
    console.log("✅ Redundant storage (local + cloud)");
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupGitHubStorage();
