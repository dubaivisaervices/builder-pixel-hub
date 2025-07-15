import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sqliteApiRoutes from "./routes/sqlite-api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist/spa")));

// CORS for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.use("/api/sqlite", sqliteApiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Report Visa Scam SQLite Server is running",
    timestamp: new Date().toISOString(),
    database: "SQLite",
  });
});

// Serve React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/spa/index.html"));
});

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message,
    });
  },
);

app.listen(PORT, () => {
  console.log("🚀 Report Visa Scam SQLite Server running");
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🗄️  Database: SQLite`);
  console.log(`📊 API: /api/sqlite/*`);
  console.log("✅ Ready to serve 841 UAE businesses");
});
