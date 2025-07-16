#!/usr/bin/env node

import fs from "fs";
import path from "path";

function fixMergeConflicts() {
  console.log("🔧 Fixing all merge conflicts...");

  // Files that need conflict resolution
  const conflictedFiles = ["client/pages/Index.tsx"];

  conflictedFiles.forEach((filePath) => {
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      console.log(`📄 Processing ${filePath}`);

      let content = fs.readFileSync(fullPath, "utf8");

      // Remove all merge conflict markers and choose the better content
      content = content.replace(
        /<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [a-f0-9]+/g,
        (match, head, incoming) => {
          // Choose the incoming content (newer version) for most conflicts
          // Except for some specific cases where HEAD is better

          // For badge content, prefer the newer version with emoji
          if (
            head.includes("Dubai's #1 Visa Scam Protection Platform") &&
            incoming.includes("UAE's Most Trusted Scam Protection Platform")
          ) {
            return '                  <Shield className="h-4 w-4 mr-2" />\n                  🛡️ UAE\'s Most Trusted Scam Protection Platform';
          }

          // For title, prefer the newer version
          if (
            head.includes("Report Visa") &&
            incoming.includes("Stop Visa Fraudsters")
          ) {
            return '                  Stop Visa Fraudsters\n                </span>\n                <br />\n                <span className="text-gray-900">Before They Strike</span>\n              </h1>\n              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">\n                🛡️ Expose scammers, protect your money, and save others from\n                fraud. Access verified company reviews, report suspicious\n                activities, and join thousands protecting the UAE immigration\n                community.';
          }

          // For search placeholders, prefer the newer version
          if (
            head.includes("Search companies to report") &&
            incoming.includes("Search companies, report scams")
          ) {
            return '                    placeholder="Search companies, report scams, or check reviews..."';
          }

          if (
            head.includes("Search companies to report...") &&
            incoming.includes("Search or report scams")
          ) {
            return '                      placeholder="Search or report scams..."';
          }

          // For buttons, prefer the newer version
          if (
            head.includes("Report Scam Now") &&
            incoming.includes("Check Company Safety")
          ) {
            return '                      className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg text-white font-semibold"\n                    >\n                      <AlertTriangle className="h-5 w-5 mr-2" />\n                      Check Company Safety';
          }

          if (
            head.includes("Search Companies") &&
            incoming.includes("Browse Verified Companies")
          ) {
            return '                      className="border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-lg px-8 py-3 rounded-xl font-semibold"\n                    >\n                      <Building2 className="h-5 w-5 mr-2" />\n                      Browse Verified Companies';
          }

          if (
            head.includes("Report This Company") &&
            incoming.includes("Report Visa Scam")
          ) {
            return '                      <Building2 className="h-4 w-4 mr-2" />\n                      Report Visa Scam';
          }

          // Default: prefer incoming (newer) content
          return incoming;
        },
      );

      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed conflicts in ${filePath}`);
    }
  });

  console.log("🎉 All merge conflicts resolved!");
}

fixMergeConflicts();
