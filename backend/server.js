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
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CyberGuard Academy API is running" });
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
app.listen(PORT, () => {
  console.log(`🚀 CyberGuard Academy API running on port ${PORT}`);
});
