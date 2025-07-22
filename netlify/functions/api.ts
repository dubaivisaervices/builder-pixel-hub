import serverless from "serverless-http";

// Import the full Express server from the main server file
async function createMainServer() {
  try {
    // Import the createServer function from the main server
    const { createServer } = await import("../../server/index");

    console.log("✅ Successfully imported main Express server for Netlify");
    return createServer();
  } catch (error) {
    console.error("❌ Failed to import main server, creating fallback:", error);

    // Fallback to a basic server if import fails
    const express = require("express");
    const app = express();

    app.use((req: any, res: any, next: any) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
      }
      next();
    });

    app.use(express.json());

    app.get("/api/health", (req: any, res: any) => {
      res.json({
        status: "healthy",
        message: "Fallback server running",
        timestamp: new Date().toISOString(),
      });
    });

    app.use((req: any, res: any) => {
      res.status(503).json({
        error: "Main server unavailable",
        message: "Fallback mode - limited functionality",
      });
    });

    return app;
  }
}

// Create and export the serverless handler
let cachedHandler: any;

// Initialize the handler asynchronously
const initializeHandler = async () => {
  if (!cachedHandler) {
    const app = await createMainServer();
    cachedHandler = serverless(app);
  }
  return cachedHandler;
};

// Export a function that returns the initialized handler
export const handler = async (event: any, context: any) => {
  const serverlessHandler = await initializeHandler();
  return serverlessHandler(event, context);
};
