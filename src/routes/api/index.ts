import { Router } from "express";
import { authenticateAdmin } from "../../middleware/auth.middleware";
import { AuthController } from "../../controllers/auth.controller";
import { loginLimiter } from "../../middleware/rateLimit.middleware";
import authRouter from "./adminAuth.routes";

const router = Router();

//* ------------- Public Routes ------------- *//
router.post("/admin/auth/login", loginLimiter, AuthController.login);
router.get("/admin/auth/verify-session", AuthController.verifySession);

//* ------------- Protected Routes ------------- *//
router.use(authenticateAdmin);
router.use("/admin/auth", authRouter);

export default router;
