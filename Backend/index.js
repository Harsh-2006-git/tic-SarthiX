import * as dotenv from "dotenv";
import express, { json, response } from "express";
import { connectDB, sequelize } from "./config/database.js";
import errorHandler from "./middlewares/errorHandler.js";

import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import zoneRoutes from "./routes/ZoneRoutes.js";
import LostFound from "./routes/lostFoundRoutes.js";
import TicketRoute from "./routes/ticketRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import familyMemberRoutes from "./routes/familyMemberRoutes.js";

import cors from "cors";
import path from "path";

import { fileURLToPath } from "url";
import crowdRoutes, { initCrowdAI } from "./routes/crowdRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();


// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - FIX 1: Specify exact origins
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://localhost:5773",
    ], // Add your frontend URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
  })
);

// Middleware - FIX 2: Correct order
app.use(json());
app.use(express.urlencoded({ extended: true })); // Move this up before routes
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // FIX 3: Allow cross-origin resources
  })
);

// Static file serving - FIX 4: Better path resolution
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add a test route to check if files exist
app.get("/test-upload/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: "File not found", path: filePath });
    }
  });
});

// Routes
app.use("/api/v1/crowd", crowdRoutes);
app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/zone", zoneRoutes);
app.use("/api/v1/lost", LostFound);
app.use("/api/v1/ticket", TicketRoute);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/parking", parkingRoutes);
app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/family", familyMemberRoutes);

app.use(errorHandler);


// Clean server startup
const startServer = async () => {
  try {
    // Force a deep terminal clear
    process.stdout.write("\u001b[2J\u001b[0;0H");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 Divya Yatra Server Initializing...");

    // 1. Core Systems
    await connectDB();
    await sequelize.sync();
    console.log("✅ Database Successfully Connected");

    // 2. AI Neural Core Launch
    const backendRoot = path.dirname(fileURLToPath(import.meta.url));
    initCrowdAI(backendRoot);
    console.log("🧠 AI Neural Core active");

    // 3. Finalize
    app.listen(PORT, "0.0.0.0", () => {
      console.log("📧 Email system ready");
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  } catch (error) {
    console.error("❌ Failed to ignite server:", error.message);
    process.exit(1);
  }
};

startServer();

// Trigger AI Core Restart (Logs Silenced)
