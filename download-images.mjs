#!/usr/bin/env node

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories for storing images
const logoDir = path.join(__dirname, "public", "images", "logos");
const photosDir = path.join(__dirname, "public", "images", "photos");

fs.mkdirSync(logoDir, { recursive: true });
fs.mkdirSync(photosDir, { recursive: true });

console.log("📁 Created image directories");

// Function to download image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    if (
      !url ||
      url.includes("placeholder") ||
      url.includes("via.placeholder")
    ) {
      console.log(`⏭️ Skipping placeholder: ${filename}`);
      resolve(null);
      return;
    }

    const file = fs.createWriteStream(filename);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          console.log(`❌ Failed to download ${url}: ${response.statusCode}`);
          resolve(null);
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filename)}`);
          resolve(filename);
        });
      })
      .on("error", (err) => {
        fs.unlink(filename, () => {}); // Delete partial file
        console.log(`❌ Error downloading ${url}:`, err.message);
        resolve(null);
      });
  });
}

// Function to get file extension from URL
function getExtension(url) {
  if (!url) return ".jpg";
  const ext = path.extname(url.split("?")[0]);
  return ext || ".jpg";
}

async function downloadAllImages() {
  try {
    // Read the business data
    const businessData = JSON.parse(
      fs.readFileSync("client/data/businesses.json", "utf8"),
    );
    const businesses = businessData.businesses || [];

    console.log(`🔄 Processing ${businesses.length} businesses...`);

    let processedBusinesses = [];
    let downloadedLogos = 0;
    let downloadedPhotos = 0;

    for (let i = 0; i < businesses.length; i++) {
      const business = businesses[i];
      console.log(
        `\n📊 Processing ${i + 1}/${businesses.length}: ${business.name}`,
      );

      let updatedBusiness = { ...business };

      // Download logo
      if (business.logoUrl) {
        const logoExt = getExtension(business.logoUrl);
        const logoFilename = path.join(logoDir, `${business.id}${logoExt}`);
        const downloaded = await downloadImage(business.logoUrl, logoFilename);

        if (downloaded) {
          updatedBusiness.logoUrl = `/images/logos/${business.id}${logoExt}`;
          downloadedLogos++;
        } else {
          // Remove broken logo URL
          delete updatedBusiness.logoUrl;
        }
      }

      // Download photos
      if (business.photos && Array.isArray(business.photos)) {
        let updatedPhotos = [];

        for (let j = 0; j < business.photos.length && j < 5; j++) {
          // Limit to 5 photos
          const photoUrl = business.photos[j];
          const photoExt = getExtension(photoUrl);
          const photoFilename = path.join(
            photosDir,
            `${business.id}_${j + 1}${photoExt}`,
          );
          const downloaded = await downloadImage(photoUrl, photoFilename);

          if (downloaded) {
            updatedPhotos.push(
              `/images/photos/${business.id}_${j + 1}${photoExt}`,
            );
            downloadedPhotos++;
          }
        }

        updatedBusiness.photos = updatedPhotos;
      }

      processedBusinesses.push(updatedBusiness);
    }

    // Save updated business data with local image paths
    const updatedData = {
      ...businessData,
      businesses: processedBusinesses,
    };

    // Save to multiple locations
    fs.writeFileSync(
      "public/api/businesses-with-images.json",
      JSON.stringify(processedBusinesses, null, 2),
    );
    fs.writeFileSync(
      "public/api/dubai-visa-services.json",
      JSON.stringify(processedBusinesses, null, 2),
    );

    console.log("\n🎉 Image download completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Processed: ${processedBusinesses.length} businesses`);
    console.log(`   - Downloaded logos: ${downloadedLogos}`);
    console.log(`   - Downloaded photos: ${downloadedPhotos}`);
    console.log(`   - Total images: ${downloadedLogos + downloadedPhotos}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Start the download
downloadAllImages();
