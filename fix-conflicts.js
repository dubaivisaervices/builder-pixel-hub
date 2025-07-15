#!/usr/bin/env node

import fs from "fs";
import path from "path";

console.log("🔧 Fixing merge conflicts in Index.tsx...");

const filePath = "client/pages/Index.tsx";

try {
  let content = fs.readFileSync(filePath, "utf8");

  // Remove all merge conflict markers and fix the content
  // First, fix the title section (lines around 452-463)
  content = content.replace(
    /=======\s*Stop Visa Fraudsters\s*<\/span>\s*<br \/>\s*<span className="text-gray-900">Before They Strike<\/span>\s*<\/h1>\s*<p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">\s*🛡️ Expose scammers, protect your money, and save others from\s*fraud\. Access verified company reviews, report suspicious\s*activities, and join thousands protecting the UAE immigration\s*community\.\s*>>>>>>> [a-f0-9]+/g,
    "activities, and join thousands protecting the UAE immigration community.",
  );

  // Fix search placeholder conflicts (around line 501)
  content = content.replace(
    /<<<<<<< HEAD\s*placeholder="Search companies to report\.\.\."\s*=======\s*placeholder="Search or report scams\.\.\."\s*>>>>>>> [a-f0-9]+/g,
    'placeholder="Search or report scams..."',
  );

  // Fix button conflicts
  content = content.replace(
    /<<<<<<< HEAD\s*className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg"\s*>\s*<AlertTriangle className="h-5 w-5 mr-2" \/>\s*Report Scam Now\s*=======\s*className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg text-white font-semibold"\s*>\s*<AlertTriangle className="h-5 w-5 mr-2" \/>\s*Check Company Safety\s*>>>>>>> [a-f0-9]+/g,
    'className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg text-white font-semibold">\n<AlertTriangle className="h-5 w-5 mr-2" />\nCheck Company Safety',
  );

  // Remove any remaining merge conflict markers
  content = content.replace(/<<<<<<< HEAD.*?=======.*?>>>>>>> [a-f0-9]+/gs, "");
  content = content.replace(/=======.*?>>>>>>> [a-f0-9]+/gs, "");
  content = content.replace(/<<<<<<< HEAD.*?=/gs, "");
  content = content.replace(/>>>>>>> [a-f0-9]+/g, "");

  fs.writeFileSync(filePath, content);
  console.log("✅ Fixed merge conflicts in Index.tsx");
} catch (error) {
  console.error("❌ Error fixing conflicts:", error);
}
