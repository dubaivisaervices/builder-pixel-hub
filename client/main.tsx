import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Ensure proper React Fast Refresh initialization
if (typeof window !== "undefined") {
  // Wait for Vite client to be ready
  const initializeApp = () => {
    console.log("🚀 Initializing Dubai Visa Services App...");

    const container = document.getElementById("root");
    if (!container) {
      console.error("❌ Root element not found!");
      return;
    }

    console.log("✅ Root element found, creating React app...");

    try {
      if (!container.hasAttribute("data-root-created")) {
        container.setAttribute("data-root-created", "true");
        createRoot(container).render(<App />);
        console.log("✅ React app rendered successfully!");
      } else {
        console.log("⚠️ Root already created, skipping...");
      }
    } catch (error) {
      console.error("❌ Error creating React app:", error);
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
          <h1>Loading Error</h1>
          <p>Failed to load Dubai Visa Services. Please refresh the page.</p>
          <button onclick="location.reload()">Refresh Page</button>
        </div>
      `;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
}
