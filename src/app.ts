import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import ENV from "./validation/env.validation";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth";
import { generalLimiter } from "./middleware/rateLimit.middleware";

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: ENV.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(generalLimiter);

app.all("/api/auth/*splat", toNodeHandler(auth));

// Body parsing middleware
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin API is running",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/admin/auth", authRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Manehej Admin API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/admin/auth",
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
