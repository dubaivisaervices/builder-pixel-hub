import serverless from "serverless-http";
import { createServer } from "../../server";

// Create the Express app
const app = createServer();

// Configure for serverless environment
const handler = serverless(app, {
  binary: ["image/*", "application/pdf", "application/octet-stream"],
});

export { handler };
