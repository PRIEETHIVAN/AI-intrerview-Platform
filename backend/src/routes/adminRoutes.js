import express from "express";
import { getAdminSummary, getAllSessions, getAllUsers } from "../controllers/adminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/summary", protect, authorizeRoles("admin"), asyncHandler(getAdminSummary));
router.get("/users", protect, authorizeRoles("admin"), asyncHandler(getAllUsers));
router.get("/sessions", protect, authorizeRoles("admin"), asyncHandler(getAllSessions));

export default router;
