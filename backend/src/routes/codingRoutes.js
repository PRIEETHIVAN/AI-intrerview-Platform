import express from "express";
import {
  completeCodingRound,
  getMyCodingSessions,
  startCodingRound,
  submitCodingAnswer
} from "../controllers/codingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.post("/start", protect, asyncHandler(startCodingRound));
router.post("/submit", protect, asyncHandler(submitCodingAnswer));
router.post("/complete", protect, asyncHandler(completeCodingRound));
router.get("/sessions", protect, asyncHandler(getMyCodingSessions));

export default router;

