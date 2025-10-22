import { RequestHandler, Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";
import { loginLimiter, passwordChangeLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// Public routes (no authentication required)
router.post("/login", loginLimiter, AuthController.login);

// Protected routes (authentication required)
router.use(authenticateAdmin as unknown as RequestHandler);

router.get("/profile", AuthController.getProfile);
router.put("/profile", AuthController.updateProfile);
router.put("/change-password", passwordChangeLimiter, AuthController.changePassword);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/me", AuthController.getCurrentAdmin);

export default router;
