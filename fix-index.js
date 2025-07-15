#!/usr/bin/env node

import fs from "fs";

// Read the file
let content = fs.readFileSync("client/pages/Index.tsx", "utf8");

// Replace merge conflict markers with clean content
// Title section
content = content.replace(
  /<<<<<<< HEAD\n\s*Report Visa\n\s*<\/span>\n\s*<br \/>\n\s*<span className="text-gray-900">Scams & Fraud<\/span>\n\s*<\/h1>\n\s*<p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">\n\s*Protect Dubai's community by reporting fraudulent visa services,\n\s*immigration scams, and unethical business practices\. Your voice\n\s*helps keep others safe\.\n=======\n\s*Stop Visa Fraudsters\n\s*<\/span>\n\s*<br \/>\n\s*<span className="text-gray-900">Before They Strike<\/span>\n\s*<\/h1>\n\s*<p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">\n\s*🛡️ Expose scammers, protect your money, and save others from\n\s*fraud\. Access verified company reviews, report suspicious\n\s*activities, and join thousands protecting the UAE immigration\n\s*community\.\n>>>>>>> [a-f0-9]+/g,
  'Stop Visa Fraudsters\n                </span>\n                <br />\n                <span className="text-gray-900">Before They Strike</span>\n              </h1>\n              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">\n                🛡️ Expose scammers, protect your money, and save others from\n                fraud. Access verified company reviews, report suspicious\n                activities, and join thousands protecting the UAE immigration\n                community.',
);

// Desktop search placeholder
content = content.replace(
  /<<<<<<< HEAD\n\s*placeholder="Search companies to report, business names, or scam types\.\.\."\n=======\n\s*placeholder="Search companies, report scams, or check reviews\.\.\."\n>>>>>>> [a-f0-9]+/g,
  'placeholder="Search companies, report scams, or check reviews..."',
);

// Mobile search placeholder
content = content.replace(
  /<<<<<<< HEAD\n\s*placeholder="Search companies to report\.\.\."\n=======\n\s*placeholder="Search or report scams\.\.\."\n>>>>>>> [a-f0-9]+/g,
  'placeholder="Search or report scams..."',
);

// Mobile primary button
content = content.replace(
  /<<<<<<< HEAD\n\s*className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg"\n\s*>\n\s*<AlertTriangle className="h-5 w-5 mr-2" \/>\n\s*Report Scam Now\n=======\n\s*className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg text-white font-semibold"\n\s*>\n\s*<AlertTriangle className="h-5 w-5 mr-2" \/>\n\s*Check Company Safety\n>>>>>>> [a-f0-9]+/g,
  'className="px-12 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 rounded-xl shadow-lg text-white font-semibold"\n                    >\n                      <AlertTriangle className="h-5 w-5 mr-2" />\n                      Check Company Safety',
);

// Mobile secondary button
content = content.replace(
  /<<<<<<< HEAD\n\s*className="border-2 border-gray-500 text-gray-600 hover:bg-gray-50 shadow-lg px-8 py-3 rounded-xl font-semibold"\n\s*>\n\s*<Search className="h-5 w-5 mr-2" \/>\n\s*Search Companies\n=======\n\s*className="border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-lg px-8 py-3 rounded-xl font-semibold"\n\s*>\n\s*<Building2 className="h-5 w-5 mr-2" \/>\n\s*Browse Verified Companies\n>>>>>>> [a-f0-9]+/g,
  'className="border-2 border-red-500 text-red-600 hover:bg-red-50 shadow-lg px-8 py-3 rounded-xl font-semibold"\n                    >\n                      <Building2 className="h-5 w-5 mr-2" />\n                      Browse Verified Companies',
);

// Business card button
content = content.replace(
  /<<<<<<< HEAD\n\s*<AlertTriangle className="h-4 w-4 mr-2" \/>\n\s*Report This Company\n=======\n\s*<Building2 className="h-4 w-4 mr-2" \/>\n\s*Report Visa Scam\n>>>>>>> [a-f0-9]+/g,
  '<Building2 className="h-4 w-4 mr-2" />\n                      Report Visa Scam',
);

// Write the fixed content
fs.writeFileSync("client/pages/Index.tsx", content);

console.log("✅ Index.tsx merge conflicts resolved!");
