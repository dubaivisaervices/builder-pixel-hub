import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  searchDubaiVisaServices,
  getBusinessDetails,
  getBusinessPhoto,
  testGoogleAPI,
} from "./routes/google-business";
import { syncGoogleData, getSyncStatus } from "./routes/sync-google-data";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Google Business API routes
  app.get("/api/test-google-api", testGoogleAPI);
  app.get("/api/dubai-visa-services", searchDubaiVisaServices);
  app.get("/api/business/:placeId", getBusinessDetails);
  app.get("/api/business-photo/:photoReference", getBusinessPhoto);

  // Database sync routes
  app.post("/api/sync-google-data", syncGoogleData);
  app.get("/api/sync-status", getSyncStatus);

  return app;
}
