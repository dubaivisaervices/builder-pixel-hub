#!/usr/bin/env node

import fs from "fs";

// Read the current file
let content = fs.readFileSync("client/pages/Index.tsx", "utf8");

// Fix the title section merge conflict
const titleSection = `              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  Stop Visa Fraudsters
                </span>
                <br />
                <span className="text-gray-900">Before They Strike</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                🛡️ Expose scammers, protect your money, and save others from
                fraud. Access verified company reviews, report suspicious
                activities, and join thousands protecting the UAE immigration
                community.
              </p>`;

// Replace everything from the h1 tag to the end of the description paragraph
content = content.replace(
  /<h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">[\s\S]*?<\/p>/,
  titleSection,
);

// Remove any remaining merge conflict markers
content = content.replace(
  /<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>> [a-f0-9]+/g,
  "",
);
content = content.replace(/=======[\s\S]*?>>>>>>> [a-f0-9]+/g, "");
content = content.replace(/<<<<<<< HEAD[\s\S]*?=/g, "");

// Write the fixed content back
fs.writeFileSync("client/pages/Index.tsx", content);

console.log("✅ Index.tsx completely fixed!");
