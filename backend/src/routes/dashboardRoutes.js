import express from "express";
import { getMyAnalytics, getRoleReadiness } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/me", protect, asyncHandler(getMyAnalytics));
router.post("/readiness", protect, asyncHandler(getRoleReadiness));

export default router;
