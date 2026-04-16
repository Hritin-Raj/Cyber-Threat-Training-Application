import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import simulationRoutes from "./routes/simulations.js";
import progressRoutes from "./routes/progress.js";
import newsRoutes from "./routes/news.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    // Frontend uses Authorization headers, not cookies, so we don't
    // need credentials. Wildcard origin keeps CORS simple and robust
    // for both local and Railway domains.
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Health checks (for Railway and external monitors)
const healthPayload = { status: "ok", message: "CyberGuard Academy API is running" };

// Internal API health
app.get("/api/health", (req, res) => {
  res.json(healthPayload);
});

// Platform health (Railway probes `/health` by default)
app.get("/health", (req, res) => {
  res.json(healthPayload);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/simulations", simulationRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 CyberGuard Academy API running on port ${PORT}`);
});
