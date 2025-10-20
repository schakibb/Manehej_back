import app from "./app";
import { AuthService } from "./services/auth.service";
import ENV from "./validation/env.validation";
import { disconnectPrisma, prisma } from "./utils/prisma.utils";

const PORT = ENV.PORT || 3001;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close server
    server.close(() => {
      console.log("HTTP server closed.");
    });

    // Disconnect from database
    await disconnectPrisma();
    console.log("Database connection closed.");

    // Clean up expired sessions
    await AuthService.cleanupExpiredSessions();
    console.log("Expired sessions cleaned up.");

    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("SIGTERM");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("SIGTERM");
});

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Admin API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/admin/auth`);
});

// Database connection test
prisma
  .$connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

export default server;
