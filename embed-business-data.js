const fs = require("fs");
const path = require("path");

// Read the business data
const businessDataPath = path.join(__dirname, "client/data/businesses.json");
const rawData = fs.readFileSync(businessDataPath, "utf-8");
const parsed = JSON.parse(rawData);

console.log(`📊 Total businesses in file: ${parsed.businesses.length}`);

// Take all businesses (this will embed them directly in the function)
const businessesToEmbed = parsed.businesses;

console.log(
  `💾 Embedding ${businessesToEmbed.length} businesses in API function`,
);

// Generate the embedded data as a JavaScript constant
const embeddedData = `// Auto-generated embedded business data
// Total businesses: ${businessesToEmbed.length}
// Generated: ${new Date().toISOString()}

const EMBEDDED_BUSINESS_DATA = ${JSON.stringify(businessesToEmbed, null, 2)};

export default EMBEDDED_BUSINESS_DATA;
`;

// Write the embedded data file
const outputPath = path.join(
  __dirname,
  "netlify/functions/embedded-businesses.ts",
);
fs.writeFileSync(outputPath, embeddedData);

console.log(`✅ Embedded business data written to: ${outputPath}`);
console.log(
  `📈 File size: ${(embeddedData.length / 1024 / 1024).toFixed(2)} MB`,
);
console.log(`🎯 This eliminates all file system dependencies in production`);
