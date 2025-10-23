import { Router } from "express";
import { AuthController } from "../../controllers/auth.controller";
import { passwordChangeLimiter } from "../../middleware/rateLimit.middleware";

const router = Router({ mergeParams: true });

router.get("/profile", AuthController.getProfile).put("/profile", AuthController.updateProfile);
router.put("/change-password", passwordChangeLimiter, AuthController.changePassword);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/me", AuthController.getCurrentAdmin);

export default router;
