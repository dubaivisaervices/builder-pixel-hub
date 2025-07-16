import serverless from "serverless-http";
import { createServer } from "../../server";

// Create the Express app
let app: any;

try {
  app = createServer();
  console.log("✅ Express server created successfully");
} catch (error) {
  console.error("❌ Error creating Express server:", error);
  // Create a minimal fallback app
  const express = require("express");
  app = express();

  app.use((req: any, res: any, next: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    next();
  });

  app.get("/api/ping", (req: any, res: any) => {
    res.json({
      message: "Fallback API is working!",
      timestamp: new Date().toISOString(),
      error: "Main server failed to initialize",
    });
  });

  app.get("/api/dubai-visa-services", (req: any, res: any) => {
    res.json({
      businesses: [
        {
          id: "fallback-1",
          name: "Dubai Visa Services Pro",
          address: "Business Bay, Dubai, UAE",
          category: "visa services",
          rating: 4.5,
          reviewCount: 150,
        },
      ],
      total: 1,
      message: "Fallback data - main API unavailable",
      source: "fallback",
    });
  });

  app.use((req: any, res: any) => {
    res.status(404).json({
      error: "Endpoint not found",
      available: ["/api/ping", "/api/dubai-visa-services"],
    });
  });
}

// Configure for serverless environment
const handler = serverless(app, {
  binary: ["image/*", "application/pdf", "application/octet-stream"],
});

export { handler };
