import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log("🚀 Starting Dubai Visa Services App...");

const container = document.getElementById("root");
if (!container) {
  console.error("❌ Root element not found!");
} else {
  console.log("✅ Creating React app...");
  createRoot(container).render(<App />);
  console.log("✅ React app created successfully!");
}
