import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for password change attempts
const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password change attempts per hour
  message: {
    success: false,
    message: "Too many password change attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
router.post("/login", loginLimiter, AuthController.login);

// Protected routes (authentication required)
router.use(authenticateAdmin); // Apply authentication middleware to all routes below

router.get("/profile", AuthController.getProfile);
router.put("/profile", AuthController.updateProfile);
router.put("/change-password", passwordChangeLimiter, AuthController.changePassword);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/me", AuthController.getCurrentAdmin);

export default router;
